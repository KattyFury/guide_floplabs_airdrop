// The agent's brain: standard OpenAI API (chat completions + function calling).
// OpenAI by default. Switching provider (later: Flop compute) only takes
// editing brain.base_url / brain.model / brain.api_key_env in config.json.
//
// Backup brain (optional): Claude via the official @anthropic-ai/sdk (config brain_fallback).
// Enabled only when agent/.env has ANTHROPIC_API_KEY. If OpenAI fails for reasons other than the request itself
// (wrong key, out of credit, rate limited, server error, network loss) → ask Claude with the same conversation.
// Conversations stay in OpenAI format; converted only when sent to Claude.
import fs from "node:fs";
import path from "node:path";
import { AGENT_DIR } from "./env.js";
import { recordCall } from "./cost.js";

export class BrainError extends Error {
  constructor(message, { status = 0, fallback = false } = {}) {
    super(message);
    this.status = status;
    this.fallback = fallback; // true = provider-side error, worth trying the backup brain
  }
}

function explain(status, body) {
  const t = String(body).toLowerCase();
  if (status === 401) return "Key API sai hoặc đã bị xoá. Tạo key mới tại platform.openai.com/api-keys rồi dán vào agent/.env.";
  if (t.includes("insufficient_quota") || t.includes("billing") || t.includes("credit") || status === 402)
    return "Tài khoản OpenAI hết tiền / chưa nạp. Nạp tại platform.openai.com/settings/organization/billing.";
  if (t.includes("model_not_found") || t.includes("does not exist")) return "Tài khoản chưa dùng được model này (xem brain.model trong config.json).";
  if (status === 429) return "Gọi API quá nhanh (429). Agent sẽ thử lại ở phiên sau.";
  return `API báo lỗi ${status}: ${String(body).slice(0, 300)}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const worthFallback = (status) => status === 401 || status === 402 || status === 403 || status === 429 || status >= 500;

function logError(line, text) {
  fs.mkdirSync(path.join(AGENT_DIR, "logs"), { recursive: true });
  fs.appendFileSync(path.join(AGENT_DIR, "logs", "errors.log"), `${new Date().toISOString()} ${line}\n${String(text).slice(0, 2000)}\n\n`);
}

async function post(url, key, body) {
  if (!key) throw new BrainError("Chưa có key API. Mở file agent/.env và điền OPENAI_API_KEY.", { fallback: true });
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(300_000),
      });
    } catch (e) {
      throw new BrainError(`Không kết nối được tới API (${e.message}). Kiểm tra mạng.`, { fallback: true });
    }
    const text = await res.text();
    // Temporary server errors (5xx) → retry once. Do NOT retry key/credit errors: report at once.
    if (res.status >= 500 && attempt === 1) {
      await sleep(5000);
      continue;
    }
    if (!res.ok) {
      // Log the error verbatim to know exactly why
      logError(`HTTP ${res.status} ${url}`, text);
      throw new BrainError(`${explain(res.status, text)} (HTTP ${res.status})`, { status: res.status, fallback: worthFallback(res.status) });
    }
    return JSON.parse(text);
  }
}

// ---- Backup brain: Claude ----

// After a key/credit error at OpenAI, skip OpenAI this long, so each step doesn't pay for one failed call first.
const PRIMARY_PAUSE_MS = 5 * 60_000;
let primaryPausedUntil = 0;
let claude = null;
let notify = null;

// bot.js registers the Telegram notifier: when OpenAI fails over to Claude, the owner still learns to top up or fix the key.
export function onFallback(fn) {
  notify = fn;
}

function fallbackReady(cfg) {
  const fb = cfg.brain_fallback;
  return Boolean(fb && process.env[fb.api_key_env]);
}

async function claudeClient(fb) {
  if (!claude) {
    let Anthropic;
    try {
      ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
    } catch {
      throw new BrainError("Chưa cài thư viện Claude. Mở terminal trong thư mục agent, chạy: npm install");
    }
    claude = new Anthropic({ apiKey: process.env[fb.api_key_env], maxRetries: 1, timeout: 300_000 });
  }
  return claude;
}

const parseArgs = (s) => {
  try {
    return JSON.parse(s || "{}");
  } catch {
    return {};
  }
};

// OpenAI-format conversation → Claude format (system separated, tool → tool_result, same-role messages merged).
function toClaude(messages) {
  const system = [];
  const out = [];
  const push = (role, blocks) => {
    if (!blocks.length) return;
    const last = out.at(-1);
    if (last && last.role === role) last.content.push(...blocks);
    else out.push({ role, content: blocks });
  };
  const text = (s) => (s ? [{ type: "text", text: String(s) }] : []);
  for (const m of messages) {
    if (m.role === "system") {
      if (!out.length) system.push(String(m.content ?? ""));
      else push("user", text(`[Instruction] ${m.content ?? ""}`));
    } else if (m.role === "tool") {
      push("user", [{ type: "tool_result", tool_use_id: m.tool_call_id, content: String(m.content ?? "") || "(empty)" }]);
    } else if (m.role === "assistant") {
      const calls = (m.tool_calls || []).map((c) => ({ type: "tool_use", id: c.id, name: c.function.name, input: parseArgs(c.function.arguments) }));
      push("assistant", [...text(m.content), ...calls]);
    } else {
      push("user", text(m.content));
    }
  }
  return { system: system.join("\n\n"), messages: out };
}

function claudeTools(tools) {
  return (tools || []).map((t) => ({ name: t.function.name, description: t.function.description || "", input_schema: t.function.parameters || { type: "object", properties: {} } }));
}

function claudeMeter(fb, u) {
  const read = u.cache_read_input_tokens || 0;
  const write = u.cache_creation_input_tokens || 0;
  const usage = { input: (u.input_tokens || 0) + read + write, cached: read, output: u.output_tokens || 0, reasoning: 0 };
  const p = fb.price; // cache read = 0.1× input price, cache write = 1.25×
  const cost = ((u.input_tokens || 0) * p.input + read * p.input * 0.1 + write * p.input * 1.25 + usage.output * p.output) / 1e6;
  return { usage, cost };
}

async function askClaude(cfg, { messages, tools, toolChoice, json }) {
  const fb = cfg.brain_fallback;
  const client = await claudeClient(fb);
  const conv = toClaude(messages);
  const params = {
    model: fb.model,
    max_tokens: 16000,
    system: json ? `${conv.system}\n\nRespond with only one JSON object, no other text.` : conv.system,
    messages: conv.messages,
    thinking: { type: "disabled" }, // like OpenAI's reasoning_effort "none"; the conversation carries no thinking blocks
    cache_control: { type: "ephemeral" },
  };
  if (tools?.length) {
    params.tools = claudeTools(tools);
    params.tool_choice = { type: toolChoice === "required" ? "any" : toolChoice === "none" ? "none" : "auto", disable_parallel_tool_use: true };
  }
  let msg;
  try {
    msg = await client.messages.create(params);
  } catch (e) {
    logError(`Claude ${e.status || ""}`, e.message);
    const t = String(e.message).toLowerCase();
    if (e.status === 401) throw new BrainError("Key Claude (ANTHROPIC_API_KEY) sai hoặc đã bị xoá.", { status: 401 });
    if (e.status === 402 || t.includes("credit balance")) throw new BrainError("Tài khoản Claude hết tiền. Nạp tại console.anthropic.com → Settings → Billing.", { status: e.status });
    if (e.status === 429) throw new BrainError("Claude báo gọi quá nhanh (429). Agent sẽ thử lại ở phiên sau.", { status: 429 });
    throw new BrainError(`Claude báo lỗi ${e.status || ""}: ${String(e.message).slice(0, 300)}`, { status: e.status || 0 });
  }
  if (msg.stop_reason === "refusal") throw new BrainError("Claude từ chối trả lời yêu cầu này.");
  const content = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const calls = msg.content.filter((b) => b.type === "tool_use").map((b) => ({ id: b.id, type: "function", function: { name: b.name, arguments: JSON.stringify(b.input) } }));
  const message = { role: "assistant", content: content || null, ...(calls.length ? { tool_calls: calls } : {}) };
  return { message, model: msg.model, ...claudeMeter(fb, msg.usage) };
}

// Call OpenAI; on a provider-side failure with a Claude backup available, call Claude.
async function withFallback(cfg, primary, fallback) {
  if (fallbackReady(cfg) && Date.now() < primaryPausedUntil) return fallback();
  try {
    return await primary();
  } catch (e) {
    if (!(e instanceof BrainError) || !e.fallback || !fallbackReady(cfg)) throw e;
    const firstTime = Date.now() >= primaryPausedUntil;
    if (e.status === 401 || e.status === 402 || e.status === 403 || /hết tiền/.test(e.message)) primaryPausedUntil = Date.now() + PRIMARY_PAUSE_MS;
    console.log(`  ↪ OpenAI hỏng (${e.message}) → dùng Claude dự phòng`);
    if (notify && firstTime) Promise.resolve(notify(`⚠️ OpenAI hỏng: ${e.message}\n↪ Đang dùng Claude (${cfg.brain_fallback.model}) dự phòng.`)).catch(() => {});
    try {
      return await fallback();
    } catch (e2) {
      throw new BrainError(`OpenAI: ${e.message} · Claude dự phòng: ${e2.message}`, { status: e2.status });
    }
  }
}

// ---- Call the brain ----

// One agent step: send conversation + tool list → the brain answers or calls a tool.
// convId (prompt_cache_key) lets steps in one session share cache → the conversation start is 10× cheaper.
export async function step(cfg, stage, { messages, tools, convId }) {
  const b = cfg.brain;
  return withFallback(
    cfg,
    async () => {
      const body = { model: b.model, messages, tools, tool_choice: "auto", parallel_tool_calls: false };
      if (b.reasoning_effort) body.reasoning_effort = b.reasoning_effort;
      if (convId) body.prompt_cache_key = convId;
      const data = await post(`${b.base_url}/chat/completions`, process.env[b.api_key_env], body);
      const { usage, cost } = meter(b, data);
      recordCall(stage, data.model, usage, cost, {});
      return { message: data.choices?.[0]?.message || { role: "assistant", content: "" }, cost, tokens: usage.input + usage.output };
    },
    async () => {
      const r = await askClaude(cfg, { messages, tools, toolChoice: "auto" });
      recordCall(stage, r.model, r.usage, r.cost, {});
      return { message: r.message, cost: r.cost, tokens: r.usage.input + r.usage.output };
    },
  );
}

// Ask the brain once, no tools (e.g. drafting a job to post). The caller logs tokens.
export async function ask(cfg, { system, user, json = false }) {
  const b = cfg.brain;
  const messages = [{ role: "system", content: system }, { role: "user", content: user }];
  return withFallback(
    cfg,
    async () => {
      const body = { model: b.model, messages };
      if (b.reasoning_effort) body.reasoning_effort = b.reasoning_effort;
      if (json) body.response_format = { type: "json_object" };
      const data = await post(`${b.base_url}/chat/completions`, process.env[b.api_key_env], body);
      return { text: data.choices?.[0]?.message?.content || "", model: data.model, ...meter(b, data) };
    },
    async () => {
      const r = await askClaude(cfg, { messages, json });
      // Claude sometimes wraps JSON in ```json ... ``` → strip so the caller's JSON.parse doesn't break.
      const text = json ? (r.message.content || "").replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "") : r.message.content || "";
      return { text, model: r.model, usage: r.usage, cost: r.cost };
    },
  );
}

function meter(b, data) {
  const u = data.usage || {};
  const usage = {
    input: u.prompt_tokens || 0,
    cached: u.prompt_tokens_details?.cached_tokens || 0,
    output: u.completion_tokens || 0, // OpenAI: includes hidden thinking tokens
    reasoning: u.completion_tokens_details?.reasoning_tokens || 0,
  };
  // List price (real money is charged only beyond the daily free tokens).
  const p = b.price;
  const cost = ((usage.input - usage.cached) * p.input + usage.cached * p.cached + usage.output * p.output) / 1e6;
  return { usage, cost };
}

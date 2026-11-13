// The agent's brain. Every brain is an OpenAI-compatible chat-completions endpoint with function calling.
//
// config.json → "brains": a list in priority order. The first brain that has a key is used; on a provider-side
// failure (no key, expired allowance, gateway full, server error, network loss) the next one takes over.
//
//   1. FLOP compute (api.flop.network): paid in $FLOP from the agent's own devnet/testnet wallet.
//      This is the brain that counts for the agent airdrop (compute bought in settled sessions).
//      The gateway key lives in a file written by the official Flop CLI (`flop agent credential`) and expires
//      after ~24 h; when FLOP_CLI points at the CLI (the official CLI Docker image), the key is renewed here.
//   2. OpenAI: backup only, so the agent keeps working while the Flop gateway is full or the allowance expired.
//
// Conversations stay in OpenAI format for every brain.
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { AGENT_DIR } from "./env.js";
import { recordCall } from "./cost.js";

export class BrainError extends Error {
  constructor(message, { status = 0, fallback = false } = {}) {
    super(message);
    this.status = status;
    this.fallback = fallback; // true = provider-side error, worth trying the next brain
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function logError(line, text) {
  fs.mkdirSync(path.join(AGENT_DIR, "logs"), { recursive: true });
  fs.appendFileSync(path.join(AGENT_DIR, "logs", "errors.log"), `${new Date().toISOString()} ${line}\n${String(text).slice(0, 2000)}\n\n`);
}

let notify = null;
// bot.js registers the Telegram notifier: the owner learns when the brain switches (e.g. FLOP → OpenAI) and why.
export function onFallback(fn) {
  notify = fn;
}
const tell = (text) => notify && Promise.resolve(notify(text)).catch(() => {});

// ---------- FLOP gateway key (from the Flop CLI) ----------

const DAY = 86_400_000;
const flopState = { pausedUntil: 0, why: "", lastRenew: 0, warned: "" };

function keyFile(b) {
  return process.env[b.key_file_env || "FLOP_KEY_FILE"] || b.key_file;
}

function readFlopKey(b) {
  try {
    const k = JSON.parse(fs.readFileSync(keyFile(b), "utf8"));
    const key = k.key || k.api_key || k.apiKey;
    if (!key) return null;
    const exp = Date.parse(k.expires_at || k.expiresAt || "");
    return { key, expired: Number.isFinite(exp) && exp < Date.now() + 60_000 };
  } catch {
    return null;
  }
}

// Ask the official CLI for a fresh key (it writes the key file itself). At most once per 30 minutes.
function renewFlopKey(b) {
  const cli = process.env.FLOP_CLI;
  if (!cli || Date.now() - flopState.lastRenew < 30 * 60_000) return Promise.resolve({ ok: false, message: "renew skipped" });
  flopState.lastRenew = Date.now();
  const home = path.dirname(path.dirname(keyFile(b))); // …/.flop/key.json → HOME
  return new Promise((resolve) => {
    execFile(
      "node",
      [cli, "--network", b.network || "devnet", "agent", "credential", "--json"],
      { cwd: path.dirname(path.dirname(cli)), timeout: 180_000, env: { ...process.env, HOME: home } },
      (err, stdout, stderr) => {
        const out = String(stdout || "");
        let j = null;
        try {
          j = JSON.parse(out.slice(out.indexOf("{")));
        } catch {}
        if (j && j.ok !== false && !err) return resolve({ ok: true });
        const message = j?.message || String(stderr || err?.message || "unknown").slice(0, 200);
        logError("FLOP renew", message);
        resolve({ ok: false, message });
      },
    );
  });
}

function pauseFlop(ms, why) {
  flopState.pausedUntil = Date.now() + ms;
  flopState.why = why;
  if (flopState.warned !== why) {
    flopState.warned = why;
    tell(`⚠️ Não FLOP tạm nghỉ ${Math.round(ms / 60_000)} phút: ${why}\n↪ Trong lúc đó dùng não dự phòng (nếu có).`);
  }
}

async function flopKey(b) {
  let k = readFlopKey(b);
  if (!k || k.expired) {
    const r = await renewFlopKey(b);
    k = readFlopKey(b);
    if (!k || k.expired) {
      const why = r.message && r.message !== "renew skipped" ? r.message : "chưa có key gateway FLOP (chạy `flop agent credential`)";
      throw new BrainError(why, { fallback: true });
    }
  }
  return k.key;
}

// ---------- HTTP ----------

async function post(url, key, body, timeoutSec) {
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutSec * 1000),
    });
  } catch (e) {
    throw new BrainError(`Không kết nối được tới ${new URL(url).host} (${e.message}).`, { fallback: true });
  }
  const text = await res.text();
  if (!res.ok) {
    logError(`HTTP ${res.status} ${url} model=${body.model}`, text);
    throw new BrainError(explain(res.status, text, url), { status: res.status, fallback: res.status === 401 || res.status === 402 || res.status === 403 || res.status === 404 || res.status === 429 || res.status >= 500 || /model/i.test(text) });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new BrainError(`Phản hồi không phải JSON từ ${new URL(url).host}.`, { fallback: true });
  }
}

function explain(status, body, url) {
  const t = String(body).toLowerCase();
  const flop = url.includes("flop.network");
  if (flop && t.includes("pool is full")) return "Gateway FLOP đang đầy (429 channel pool full).";
  if (flop && (status === 401 || status === 403)) return "Key gateway FLOP hết hạn hoặc bị từ chối.";
  if (status === 401) return "Key API sai hoặc đã bị xoá. Tạo key mới tại platform.openai.com/api-keys rồi dán vào agent/.env.";
  if (t.includes("insufficient_quota") || t.includes("billing") || status === 402) return "Tài khoản hết tiền / hết hạn mức.";
  if (t.includes("model_not_found") || t.includes("does not exist")) return "Model không có trên gateway này.";
  if (status === 429) return "Gọi quá nhanh (429).";
  return `API báo lỗi ${status}: ${String(body).slice(0, 300)}`;
}

// ---------- Brains ----------

function brainsOf(cfg) {
  return cfg.brains || [cfg.brain]; // old config.json: a single "brain"
}

const isFlop = (b) => b.provider === "flop";

function hasKey(b) {
  if (isFlop(b)) return Boolean(readFlopKey(b)) || Boolean(process.env.FLOP_CLI);
  return Boolean(process.env[b.api_key_env]);
}

// Qwen3 / similar models sometimes return the tool call as text instead of `tool_calls`. Recover it.
function recoverToolCalls(message) {
  if (message.tool_calls?.length || !message.content) return message;
  const calls = [];
  const re = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
  for (let m; (m = re.exec(message.content)); ) {
    try {
      const j = JSON.parse(m[1]);
      if (j.name) calls.push({ id: `call_${Date.now()}_${calls.length}`, type: "function", function: { name: j.name, arguments: JSON.stringify(j.arguments || {}) } });
    } catch {}
  }
  if (!calls.length) return message;
  return { ...message, content: message.content.replace(re, "").trim() || null, tool_calls: calls };
}

const stripThink = (s) => (typeof s === "string" ? s.replace(/<think>[\s\S]*?<\/think>/g, "").trim() : s);

// Qwen3 thinks out loud by default (paid tokens). "/no_think" in the system prompt turns that off.
function forModel(model, messages) {
  if (!/qwen3/i.test(model)) return messages;
  return messages.map((m, i) => (i === 0 && m.role === "system" ? { ...m, content: `${m.content}\n/no_think` } : m));
}

function meter(b, data) {
  const u = data.usage || {};
  const usage = {
    input: u.prompt_tokens || 0,
    cached: u.prompt_tokens_details?.cached_tokens || 0,
    output: u.completion_tokens || 0,
    reasoning: u.completion_tokens_details?.reasoning_tokens || 0,
  };
  if (isFlop(b)) return { usage, cost: 0, flop: Number(u.cost_flop ?? data.cost_flop ?? 0) || 0 };
  const p = b.price || { input: 0, cached: 0, output: 0 };
  const cost = ((usage.input - usage.cached) * p.input + usage.cached * p.cached + usage.output * p.output) / 1e6;
  return { usage, cost, flop: 0 };
}

// One call to one brain. A FLOP brain tries its models in order.
async function callBrain(b, { messages, tools, json, convId }) {
  if (isFlop(b)) {
    if (Date.now() < flopState.pausedUntil) throw new BrainError(flopState.why, { fallback: true });
    let key = await flopKey(b);
    let last;
    for (const model of b.models || [b.model]) {
      const body = { model, messages: forModel(model, messages), max_tokens: b.max_tokens || 1500 };
      if (tools?.length) Object.assign(body, { tools, tool_choice: "auto" });
      try {
        const data = await post(`${b.base_url}/chat/completions`, key, body, b.timeout_sec || 240);
        const msg = recoverToolCalls(data.choices?.[0]?.message || { role: "assistant", content: "" });
        msg.content = stripThink(msg.content);
        return { data: { ...data, model: data.model || model }, message: msg };
      } catch (e) {
        last = e;
        if (e.status === 401 || e.status === 403) {
          const r = await renewFlopKey(b);
          if (!r.ok) {
            pauseFlop(60 * 60_000, r.message === "renew skipped" ? e.message : r.message);
            throw e;
          }
          key = await flopKey(b);
          continue;
        }
        if (e.status === 429) {
          pauseFlop(30 * 60_000, e.message); // pool full: don't burst, come back in 30 minutes
          throw e;
        }
        if (/kết nối/.test(e.message)) await sleep(2000); // slow gateway → try the next model once
      }
    }
    throw last;
  }
  const key = process.env[b.api_key_env];
  if (!key) throw new BrainError(`Chưa có ${b.api_key_env} trong agent/.env.`, { fallback: true });
  const body = { model: b.model, messages };
  if (tools?.length) Object.assign(body, { tools, tool_choice: "auto", parallel_tool_calls: false });
  if (b.reasoning_effort) body.reasoning_effort = b.reasoning_effort;
  if (convId) body.prompt_cache_key = convId;
  if (json) body.response_format = { type: "json_object" };
  let data;
  try {
    data = await post(`${b.base_url}/chat/completions`, key, body, b.timeout_sec || 300);
  } catch (e) {
    if (e.status >= 500) {
      await sleep(5000); // temporary server error → retry once
      data = await post(`${b.base_url}/chat/completions`, key, body, b.timeout_sec || 300);
    } else throw e;
  }
  return { data, message: data.choices?.[0]?.message || { role: "assistant", content: "" } };
}

let lastBrain = "";
async function withBrains(cfg, req) {
  const errors = [];
  for (const b of brainsOf(cfg)) {
    if (!hasKey(b)) continue;
    try {
      const r = await callBrain(b, req);
      if (lastBrain && lastBrain !== b.name) {
        console.log(`  ↪ não: ${lastBrain} → ${b.name}`);
        if (isFlop(b)) tell(`✅ Não FLOP chạy lại (${r.data.model}).`);
      }
      lastBrain = b.name;
      return { b, ...r };
    } catch (e) {
      if (!(e instanceof BrainError) || !e.fallback) throw e;
      errors.push(`${b.name}: ${e.message}`);
    }
  }
  throw new BrainError(errors.length ? errors.join(" · ") : "Chưa có não nào dùng được: cần key gateway FLOP hoặc OPENAI_API_KEY trong agent/.env.");
}

// One agent step: send conversation + tool list → the brain answers or calls a tool.
export async function step(cfg, stage, { messages, tools, convId }) {
  const { b, data, message } = await withBrains(cfg, { messages, tools, convId });
  const { usage, cost, flop } = meter(b, data);
  recordCall(stage, data.model, usage, cost, { brain: b.name, flop });
  return { message, cost, flop, tokens: usage.input + usage.output };
}

// Ask the brain once, no tools (e.g. drafting a job to post). The caller logs tokens.
export async function ask(cfg, { system, user, json = false }) {
  const messages = [{ role: "system", content: json ? `${system}\n\nRespond with only one JSON object, no other text.` : system }, { role: "user", content: user }];
  const { b, data, message } = await withBrains(cfg, { messages, json });
  let text = message.content || "";
  if (json) text = text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");
  return { text, model: data.model, ...meter(b, data) };
}

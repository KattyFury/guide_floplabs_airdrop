// Log tokens + money per brain call, so "why did it cost this" can always be answered.
import fs from "node:fs";
import path from "node:path";
import { AGENT_DIR } from "./env.js";

const LOG_DIR = path.join(AGENT_DIR, "logs");
let run = null;

export function startRun(label) {
  run = { label, started: Date.now(), calls: [] };
}

export function recordCall(stage, model, usage, cost, tools) {
  const call = { stage, model, ...usage, cost: +cost.toFixed(6), tools };
  if (run) run.calls.push(call);
}

export function endRun(extra = {}) {
  if (!run) return null;
  const total = run.calls.reduce((s, c) => s + c.cost, 0);
  const summary = {
    time: new Date().toISOString(),
    label: run.label,
    seconds: Math.round((Date.now() - run.started) / 1000),
    cost_usd: +total.toFixed(5),
    calls: run.calls,
    ...extra,
  };
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "cost.jsonl"), JSON.stringify(summary) + "\n");
  run = null;
  return summary;
}

export function costLine(s) {
  const tok = s.calls.reduce((a, c) => a + c.input + c.output + c.reasoning, 0);
  return `💸 ${s.calls.length} lần gọi não · ${tok.toLocaleString("en")} token · ≈$${s.cost_usd} · ${s.seconds}s`;
}

export function todayTotal() {
  const file = path.join(LOG_DIR, "cost.jsonl");
  if (!fs.existsSync(file)) return { runs: 0, usd: 0 };
  const day = new Date().toISOString().slice(0, 10);
  let runs = 0, usd = 0;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.startsWith(`{"time":"${day}`)) continue;
    runs++;
    usd += JSON.parse(line).cost_usd;
  }
  return { runs, usd: +usd.toFixed(4) };
}

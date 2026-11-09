// Talks to Kibble (kibble.world), a job board for agents on Technocore.
// Source rules: https://kibble.world/llms.txt
import { sign, sweep } from "./did.js";

const BASE = "https://kibble.world";
let nonceLast = 0;

async function getJson(url, timeout = 120_000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!r.ok) throw new Error(`Kibble ${r.status} khi đọc ${url.replace(BASE, "")}`);
  return r.json();
}

// The board is heavy (~0.5 MB) and the free server is often slow → keep the latest read for 2 minutes.
let boardCache = { at: 0, data: null };
export async function board() {
  if (Date.now() - boardCache.at < 120_000) return boardCache.data;
  const [full, queue] = await Promise.all([getJson(`${BASE}/api/board`), getJson(`${BASE}/api/board?needs_attest=1`)]);
  const byId = new Map();
  for (const j of [...(queue.jobs || []), ...(full.jobs || [])]) if (j.job_id && !byId.has(j.job_id)) byId.set(j.job_id, j);
  boardCache = { at: Date.now(), data: { jobs: [...byId.values()], franchise: full.franchise_by_did || {} } };
  return boardCache.data;
}

export async function status() {
  return getJson(`${BASE}/api/status`, 60_000);
}

export async function score(did) {
  return getJson(`${BASE}/api/score?did=${encodeURIComponent(did)}`, 60_000);
}

// Sign and send one line to Kibble via its relay (sending directly to Technocore updates the board very slowly).
export async function post(id, text) {
  const clean = sweep(text).slice(0, 4000);
  const nonce = String(Math.max(Date.now(), nonceLast + 1));
  nonceLast = +nonce;
  const sig = sign(id, `kibble|${nonce}|${clean}`);
  const r = await fetch(`${BASE}/api/signed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ did: id.did, nonce, sig, text: clean }),
    signal: AbortSignal.timeout(120_000),
  });
  const body = await r.text();
  let j;
  try {
    j = JSON.parse(body);
  } catch {
    j = { ok: false, error: body.slice(0, 200) };
  }
  boardCache.at = 0; // board changed
  return { ok: r.ok && j.ok !== false, ...j, http: r.status };
}

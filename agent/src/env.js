// Read the .env file (no external library).
// Reads agent/.env by default. Point elsewhere with the ENV_FILE variable.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const AGENT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadEnv() {
  const file = process.env.ENV_FILE || path.join(AGENT_DIR, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// config.json, then per-machine overrides from .env: LIMIT_DAILY_TOKENS=500000 → limits.daily_tokens = 500000.
export function loadConfig() {
  const cfg = JSON.parse(fs.readFileSync(path.join(AGENT_DIR, "config.json"), "utf8"));
  for (const [k, v] of Object.entries(process.env)) {
    const m = k.match(/^LIMIT_([A-Z_]+)$/);
    if (m && cfg.limits && v !== "" && Number.isFinite(+v)) cfg.limits[m[1].toLowerCase()] = +v;
  }
  return cfg;
}

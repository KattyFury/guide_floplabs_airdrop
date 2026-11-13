// Reads the DID (agent identity) created by scripts/generate-did.js and signs messages.
// Secret keys live in secrets/ (never on GitHub).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { AGENT_DIR } from "./env.js";

const ROOT = path.resolve(AGENT_DIR, "..");

// did:key from the secret key (Ed25519 → multicodec 0xed01 → base58btc).
function didFromKey(key) {
  const pub = crypto.createPublicKey(key).export({ type: "spki", format: "der" }).subarray(-32);
  const A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let n = BigInt("0x" + Buffer.concat([Buffer.from([0xed, 0x01]), pub]).toString("hex"));
  let s = "";
  while (n > 0n) {
    s = A[Number(n % 58n)] + s;
    n /= 58n;
  }
  return "did:key:z" + s;
}

export function loadDid(label) {
  // Option B (GitHub Actions): key is in secret DID_KEY = contents of secrets/<name>.pkcs8.der.base64
  if (process.env.DID_KEY) {
    const key = crypto.createPrivateKey({ key: Buffer.from(process.env.DID_KEY.trim(), "base64"), format: "der", type: "pkcs8" });
    return { did: didFromKey(key), label: label || "agent", key };
  }
  if (!label) throw new Error("Chưa có DID_LABEL trong agent/.env (tên DID bạn đã tạo, VD: hieu).");
  const file = path.join(ROOT, "data", `${label}.json`);
  if (!fs.existsSync(file))
    throw new Error(`Không thấy data/${label}.json. Tạo DID trước: node scripts/generate-did.js ${label}`);
  const id = JSON.parse(fs.readFileSync(file, "utf8"));
  const key = crypto.createPrivateKey({
    key: Buffer.from(fs.readFileSync(path.join(ROOT, id.seed_file), "utf8").trim(), "base64"),
    format: "der",
    type: "pkcs8",
  });
  return { did: id.did, label, key };
}

// Technocore replaces control/format characters with spaces before storing → sign the text as it will be after that "scrub".
export function sweep(text) {
  return String(text).replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Zl}\p{Zp}]/gu, " ").trim();
}

export function sign(id, message) {
  return crypto.sign(null, Buffer.from(message, "utf8"), id.key).toString("base64url");
}

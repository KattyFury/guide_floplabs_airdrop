// Test 1 job without Telegram:  node agent/thu-1-phien.js
import { loadEnv, loadConfig } from "./src/env.js";
import { loadDid } from "./src/did.js";
import { runSession } from "./src/agent.js";
import { costLine } from "./src/cost.js";

loadEnv();
try {
  const id = loadDid(process.env.DID_LABEL);
  console.log(`🪪 DID: ${id.did}`);
  const r = await runSession(loadConfig(), id);
  if (r.skipped) console.log(`😴 ${r.reason}`);
  else {
    console.log(`\n📝 ${r.summary}\n   ${r.done.length} việc xong · ${r.steps} bước`);
    console.log(costLine(r.cost));
  }
} catch (e) {
  console.error("❌ " + e.message);
  process.exit(1);
}

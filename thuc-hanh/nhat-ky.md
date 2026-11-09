# Participation log: done for real, written as it happened

Each entry: what was done, measured results, what went wrong. Times are UTC. All wallets are **devnet** (no value).
The author's own code and config live in a separate private repo; this records only the process.

---

## 2026-08 → 09 · TechnoCore: create DID, claim room

Tried the basics on technocore.chat from a terminal: create a DID, write a note, claim a room.
Detailed log: [2026-08-technocore-log.md](2026-08-technocore-log.md).

## 2026-10-18 · Agent Kibble running 24/7 on VPS

- The agent claims, does and submits jobs and grades others on Kibble. Brain: OpenAI `gpt-5.4-mini`, on free tokens (data sharing on).
- Day one: score 17, rank 703. **3 submissions graded `not`** (−9 points).
- ❌ **Mistake: the agent invented numbers.** Nestlé and TSMC figures came from old years; Canada inflation cited a bulletin not yet released.
  Root cause: search engines (Brave, DuckDuckGo) blocked the VPS IP → no results → the model filled in numbers from memory.
- ✅ Fix: added Wikipedia as a fallback, PDF reading, and **mandatory citations** (URL + a sentence really on the page read,
  every number must be inside the quote). After the fix: 10 submissions, 9 useful, 1 not.

## 2026-10-19 · Posting jobs from Telegram, token cap

- Message a question to the bot → it drafts a job → tap ✅ to post. First job `k9bb97ca69b`, Kibble gave +2 points.
- ❌ Deployed twice in a row without checking logs → may have cut off a running job. Lesson: read logs and wait for the current job before deploying.
- ❌ The guide said "top up $6 because below $5 loses your tier". That reason was **wrong** (OpenAI tiers follow total amount paid). Kept $6 and fixed the reason (11/07): $6 gives a buffer, so a few cents charged past the free tier leaves the balance above $5.

## 2026-10-25 · Score dropped to 0

- Score 0, rank 4,491. Checked: **a Kibble bug**, the scorer was stuck at seq 9,997,001 while the room had reached 21 million.
- A side issue of ours: the market had run dry (3–4 open jobs) yet the bot called the brain every 15 minutes → ~650k tokens/day wasted.
- ✅ Fix: code checks the board first (0 tokens), no new job means no brain call. Tokens/day: 823k → 266k.
- 10/27: score 22, rank 586.

## 2026-10-28 · OpenAI out of credit → added Claude as backup brain

- OpenAI key returned `429 no credits` → the agent sat idle all morning.
- ✅ Added Claude Haiku 5.5 as backup: on OpenAI failure it switches and reports on Telegram. 1 step ≈ $0.00006.
- Lesson: a 24/7 agent needs **at least 2 brain sources**.

## 2026-11-03 · Devnet FLOP attempt 1: couldn't get in

- Goal: get a FLOP API key so the agent buys compute with $FLOP instead of OpenAI.
- Faucet returned `503 IP classification unavailable` from both home and VPS, while `/health` still said `ok`.
- ❌ Lesson: **`/health` ok doesn't mean it can pay out.** Test for real.
- The CLI created wallet `5EUKan…` and stored its mnemonic unencrypted in that machine's `~/.flop/`.

## 2026-11-07 · Devnet attempt 2: got FLOP, couldn't buy compute yet

**09:35: re-check**
- Faucet fixed (build 0.1.284), `status: open`.
- `@flop-labs/cli` 0.4.0 on npm **broke** after the devnet runtime upgrade (issue #132). No new release yet.
- `api.flop.network/v1/models` → empty list. Gateway reports full.
- ❌ **Old wallet lost:** the current machine has no `~/.flop/` → no key for `5EUKan…`.
  Lesson: after creating a wallet **copy its key file to shared secret storage immediately**. Don't leave it in one machine's hidden folder.

**09:48: new agent wallet + faucet**
- Created an sr25519 wallet with a Polkadot library (CLI broken). Mnemonic stored in a private secret folder, never in git.
- `POST https://faucet.flop.network/fund` with `{"address": "<wallet>"}` → `200`, **25 FLOP**, tier `anonymous`. Explorer confirmed the balance.
- The faucet has 2 tiers: anonymous 25 FLOP/24h, agent 2 FLOP/24h (must spend before requesting again).

**10:xx: what node can the home PC run** (RTX 3070 8 GB, i7-10700K, 16 GB RAM, Windows 10 + Docker Desktop)
- Validator: **no**. Needs 32–64 GB RAM, 4 TB NVMe, dedicated Linux, and devnet still needs Flop approval.
- Miner: first concluded "the 3070 is more than enough" because the devnet model needs only ~1 GB VRAM.
  ❌ **Wrong.** The miner pack README requires a **GPU with ≥ 16 GB VRAM** and Ubuntu. Corrected.
  Lesson: **read the official pack's requirements before concluding**, don't infer from model size.
- Miner sponsored-stake slots: `automatic_full` (40/40 waiting for calibration). Validator: `open`.

**10:xx: preparing the miner**
- Created a dedicated miner wallet `5DnZWT…` (separate from the agent wallet).
- Downloaded pack `flop-miner-pack-devnet-ts-20261106`, SHA-256 matches the docs.
- Docker Desktop has the `nvidia` runtime → GPU usable in containers. But the 8 GB card is below the bar → not run.
- Decided to wait: rent a ≥16 GB GPU VM, or wait for Flop to relax the requirement, and wait for sponsor slots.

**Tooling:** `npx @flop-labs/cli` was blocked by Claude Code (runs externally downloaded code) → the user must run it or grant permission.
For anyone following this guide with an AI agent: expect to approve these commands.

**11:06: got an agent key with the Docker CLI** (npm CLI 0.4.0 broken)
- Image `ghcr.io/flop-labs/flop-core/cli:v0.1.290@sha256:24e32b03…` (found in issue #132, not yet in `releases.json`).
- ❌ Mounting a Windows folder into the container (`-v D:/…:/root/.flop`) → CLI refuses: *credential directory must be owned by this user with mode 0700*.
  ✅ Used a **Docker volume** (`-v flop-cli-home:/root/.flop`), then copied the files to secret storage.
- The image has no `flop` on PATH; the entrypoint is `node dist/cli.js`.
- `agent credential --json` → gateway key, model `qwen/qwen2.5-0.5b-instruct`, quota 20,000, **expires in ~24 hours**.
- ❌ The CLI **created yet another wallet** `5Gx3xz…` and requested 25 FLOP, rather than using mine. The CLI's wallet file
  (`devnet-enroll-wallet.json`) holds only `type, address, mnemonic` → next time, put your wallet there before running.

**11:07–11:18: test purchase: 6/6 `429 gateway channel pool is full`**
- Key valid (the gateway accepted it and returned overload, not an auth error). 6 tries, 2 minutes apart, no bursts.
- Conclusion: everything on our side was done. **The bottleneck is Flop's full gateway** (issues #31, #124).

**13:19–13:23: ✅ compute purchase succeeded**
- Turned on a retry loop every 30 minutes. The first returned `000`: curl timed out at 60 s. The gateway no longer returned 429 immediately but **held the request**.
- Retried with a 200 s timeout → `200`. Call 1: 11 tokens, **0.066 FLOP**. Call 2: 42 tokens, **0.24 FLOP**.
- The receipt included: payment channel, serving miner `5Dkyf…NzqU`, price `0.003 FLOP/GN` (2 GN per token), `settlementStatus: pending`.
- The wallet balance didn't change right away (still 25 FLOP): funds are deducted when the channel closes and settles. To be tracked.
- Model `qwen2.5-0.5b` is very small: asked "2+2" it rambled. Good only for proving the purchase flow, not as an agent brain.
- ❌ Lesson: a 60 s timeout was too short and made the gateway look dead. **A busy gateway is slow, so use a timeout ≥ 120 s.**

**14:00: second agent: Flop Radar runs 24/7 on VPS, buying compute with FLOP**
- Left the Kibble agent untouched; built a separate agent. Approved the design first (model, tool calling, tool list, limits), then coded.
- Its job: every 30 minutes check new Flop issues, `releases.json`, faucet `/limits` (has the network moved to testnet, are miner sponsor slots open),
  and gateway models → report to Telegram. New issues are **summarized by a model on Flop**, so it buys compute for useful work, not just to call.
- The 0.5B model is too small to call tools → **code controls everything, the model only summarizes**.
- Tip: run the agent **inside Flop's official CLI image** (Node 24 included) → it renews its 24-hour key via the CLI with nothing else to install.
- First real summary: 541 tokens, **3.5 FLOP**. More than expected: the model writes up to `max_tokens` even when told "2 sentences".
  ❌ Lesson: **measure cost with a real call** before setting a cap; the 25 FLOP faucet covers only ~7 long summaries.
- ❌ Nearly pushed wallet keys to the old VPS: SSH reported the **host key had changed** → stopped and used another VPS. Lesson: never ignore a host key warning, especially when about to copy keys.

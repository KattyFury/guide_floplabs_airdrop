# Practice: the author's own run

The [guide](../guide/README.md) is written **from what was really done here**. Every rule in the guide should trace back to a line
in the log: what was tried, what was measured, what went wrong.

| File | Content |
|---|---|
| [nhat-ky.md](nhat-ky.md) | Daily log: actions, results, mistakes |
| [2026-08-technocore-log.md](2026-08-technocore-log.md) | Old TechnoCore log (Aug–Sep) |
| [2026-08-tweet-draft.md](2026-08-tweet-draft.md) | Old tweet draft |

## Where things stand (2026-11-07)

| Track | Status |
|---|---|
| 🤖 Agent | Agent Kibble runs 24/7 on a VPS. Devnet wallet holds 25 FLOP. ✅ **Compute bought with FLOP** (11/07 13:21 UTC, via Docker CLI), waiting for the session to settle |
| ⛏️ Miner | Miner wallet + pack ready. Home PC (RTX 3070 8 GB) is **below the 16 GB bar**. Sponsor slots full |
| 🛡️ Validator | Not done: not enough hardware, devnet needs Flop team approval |
| 📣 Creator | Writing this guide. Ref links not open |

## Lessons (used to write the guide)

1. **Measure, don't trust status pages.** The faucet reported `/health: ok` while refusing to pay out. Only a real call tells you.
2. **Read the official pack's requirements before concluding.** Small model ≠ small GPU: the miner pack requires ≥16 GB VRAM.
3. **Store a new wallet immediately** in one fixed secret place, with a backup. One devnet wallet was lost in another machine's hidden folder.
4. **One wallet per track** (agent, miner, validator). The docs require separating miner and validator wallets.
5. **Flop's tools change daily.** The npm CLI can drift from the network after each upgrade: check
   [issues](https://github.com/flop-labs/network/issues) before assuming you did something wrong.
6. **An AI agent doing real work must cite sources.** Without sources the model invents numbers, and graders catch it.
7. **A 24/7 agent needs a backup brain** and a daily token cap, or it either stalls or quietly burns money.
8. **Don't call the AI when there's no work.** Check with code first (0 tokens); call the brain only when there's a job.
9. **Do less, but real.** Airdrop rules exclude "going through the motions" accounts, so the agent does not spam jobs or create multiple DIDs.
10. **"Full" errors aren't forever, and a timeout isn't an error.** The gateway gave 429 in the morning, worked in the afternoon but slowly (>60 s). Retry sparsely with long timeouts.

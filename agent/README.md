# Agent Kibble: an agent that works and grades inside FLOP's agent economy

While the PC is on, the agent **finds work by itself**. It claims a job, does it, submits, then **grades** other
agents' work. Everything is signed with your DID on [Kibble](https://kibble.world), a job board
for AI agents on [Technocore](https://technocore.chat). The agent sends 1 Telegram report daily at 7 AM (Vietnam time). The app's messages are in Vietnamese:

```text
📊 Báo cáo ngày 2026-10-18
📦 Nộp 2 bài · ✍️ chấm 4 bài (3 useful / 1 not)
🔋 65,753 token · 6 vòng · ≈$0.0401 theo giá niêm yết
🏆 Điểm Kibble hiện tại: 7 · hạng 1315
```

## Why this agent?

**FLOP** ([@flop_labs](https://x.com/flop_labs)) is built for **autonomous AI agents**. An agent holds FLOP and pays GPU machines
(miners) to run AI for its work. The agent airdrop follows **compute bought and settled on testnet** ([flop.finance/airdrop](https://flop.finance/airdrop/)).

Kibble is **practice for that exact loop** before testnet opens: an agent posts work, a worker does it, a validator grades.
Running the agent today gives you:
1. An agent with a real work history whose brain **runs on FLOP compute**: every step it thinks is inference bought with $FLOP, which is what the agent airdrop counts (on testnet).
2. Kibble reputation. Graded useful +6, grading +1, poor work −3.

**Honest caveats:**
- Kibble is **community-built, not from Flop Labs**. Kibble itself calls its points "an IOU for a future airdrop". Nothing is guaranteed.
- Flop's draft airdrop rules count **testnet data** and exclude **"going through the motions"** accounts. So this agent puts **quality before quantity**.

## An agent, not a bot

A bot's code decides each step. Here **the brain decides**, and code only supplies tools and enforces limits.

| Part | What it is |
|---|---|
| 🧠 **Brain** | **FLOP compute** (`qwen/qwen3-14b`, then `nousresearch/arete-27b`, `qwen/qwen3-8b`) on `api.flop.network`, paid in $FLOP, with function calling. Backup: OpenAI `gpt-5.4-mini` while the FLOP gateway is full or your allowance expired. At each step the brain chooses a tool or stops |
| 🔧 **Tools** | `my_status`, `list_open_jobs`, `list_jobs`, `read_job`, `web_search` (Brave → DuckDuckGo → Wikipedia, free), `read_page` (reads PDFs too, finds the right passage by keyword), `claim_job`, `submit_result`, `attest`, `skip_job`, `save_note`, `finish` |
| 💾 **Short-term memory** | The conversation in 1 round (= 1 job). Cleared when done, so each job starts fresh and saves tokens |
| 💾 **Long-term memory** | `agent/data/memory.json`: jobs done, grades given, daily usage, notes the brain wrote |
| 🔁 **Loop** | **1 round = 1 job**: the brain picks 1 job (do or grade) → picks a tool → code runs it → returns the result → the brain continues → submit/grade ends the round. 30 s rest, then a new round. Before each round code checks the board (0 tokens): nothing new, skip the brain and look again in 2 minutes |
| 🛑 **Limits** | Tokens/day, money/day, 14 steps per job. A claimed job unfinished after 2 rounds is dropped |
| 🧾 **Anti-fabrication** | Research jobs: every number must be inside a quote **really on a page the agent read** that round. Code checks it and blocks submission on a mismatch |
| 🚫 **No self-grading** | Won't grade or claim jobs from **any DID on your machine** (grading yourself with another DID = Flop excludes the account) |

The brain decides: which jobs to do or skip, whether to verify on the web, `useful` or `not`, the reason, when to stop. Code has **no** rules like "if it contains X, grade not".

## What you need

| Item | Notes |
|---|---|
| **OpenAI API** | Top up $6, then enable data sharing for free daily tokens (below) |
| **Node.js** LTS | Runs the agent ([nodejs.org](https://nodejs.org)) |
| **Telegram** | Agent reports + your controls |
| **DID** | The agent's identity. The repo has a command to create it |
| **Cursor** | Optional. Lets AI install it for you |

### Get the OpenAI API nearly free

1. Go to [platform.openai.com](https://platform.openai.com/) → top up **$6 credit**. The paid tier avoids free-tier errors. $6 rather than $5 gives a buffer: if the agent goes past the free tier and a few cents are charged, the balance stays above $5.
2. Go to [Data controls → Sharing](https://platform.openai.com/settings/organization/data-controls/sharing) → turn on **data sharing with OpenAI**.
   You get **2.5M free tokens** daily for mini models (the agent uses `gpt-5.4-mini`). The agent stops itself at 1.5M tokens/day, so it **usually won't touch the $6**.
3. [API keys](https://platform.openai.com/api-keys) → **Create new secret key** → copy.

👉 Sharing means OpenAI may train on what the agent sends. The agent only reads and writes public Kibble content. If you'd rather not, leave it off and lower `limits.daily_usd` in `config.json` to what you can accept (e.g. 0.3).

## Install: let Cursor do it

1. Open an empty folder in Cursor → **Agent** chat (`Ctrl+L`), model **Grok**.
2. Paste: `https://github.com/KattyFury/floplabs_guide read the repo and build it for me`. Cursor downloads the repo and follows [`AGENTS.md`](../AGENTS.md).
3. Follow Cursor's steps. Human-readable details: [guide/agent-kibble.md](../guide/agent-kibble.md).

To do it by hand: see [the last section](#manual-install).

## How to run

| Action | When the agent runs |
|---|---|
| Double-click `agent/CAI-TU-CHAY.bat` **once** ⭐ | **Whenever the PC is on**, silently, no window |
| Or double-click `agent/CHAY-AGENT.bat` | While the black window stays open. Close it = agent rests |

Turn off background mode: double-click `agent/TAT-TU-CHAY.bat`.
**PC off = agent rests.** Turn the PC back on and the agent resumes and sends the previous day's report.

## Telegram commands

Type `/` in chat for the command menu. Command hints also appear at the end of each message.

| Command | Agent does |
|---|---|
| `/status` | Score, rank, today's work, tokens left |
| `/run` | Does 1 job now (and reports the result) |
| `/pause` · `/resume` | Pause · resume |
| `/help` | What this agent does |
| *(plain message)* | Posts a job on Kibble, see below |

It's a **private bot**: the first person to message becomes the owner. To change owner: delete `agent/data/bot.json`.

**Daily report** arrives at 7 AM Vietnam time (00:00 UTC), or earlier if the agent exhausts its daily tokens.

### Ask the whole network: post a job

Message the bot a question (Vietnamese is fine), e.g. *"doanh thu Vinamilk năm ngoái bao nhiêu"* ("what was Vinamilk's revenue last year"):

1. The bot rewrites it as a proper English job: correct category, clear scope ("last year" → 2025), with
   **Done when** and **How to verify** (where the grader checks). Greetings or jobs needing a private account → the bot refuses.
2. The bot shows a draft + 2 buttons **✅ Đăng (Post) / ❌ Huỷ (Cancel)**. Only Post signs with your DID and publishes it (+2 points/job).
3. When an agent submits → the bot immediately sends the **Vietnamese translation + original**, with 2 buttons:
   **👍 Đạt (ACCEPT)**: confirms the work is what you wanted, the worker gets credit, you get +1 point ·
   **👎 Không đạt (Reject)**. Tapping is optional. Ballots are signed with your DID and public.

Your agent **does not claim or grade** jobs you post (Kibble rule).
Post few and good: mass-posting similar jobs is treated by Kibble as point farming.

The bot catches submissions by continuously reading the `kibble` room on Technocore (`/api/board` shows only ~80 jobs, so yours scrolls away within minutes). The room keeps only ~80 minutes → **the bot must be running** to catch them.

## Cost (measured 2026-10-18)

| | Measured |
|---|---|
| 1 grading | ≈ 8,800 tokens |
| 2 submitted jobs + 1 grading | 39,350 tokens (22,400 cached) · ≈$0.017 at list price · 5 minutes |
| Draft 1 job to post · translate 1 submission | ≈ 700 tokens · ≈ 1,000 tokens |
| Budget of 1.5M tokens/day | ≈ 110–190 jobs/day (if the board has enough) |

Per-job log: `agent/logs/cost.jsonl`. Errors: `agent/logs/errors.log`.

## Settings: `agent/config.json`

| Setting | Default | Meaning |
|---|---|---|
| `limits.daily_tokens` | 1,500,000 | Daily token cap. Keep under 2.5M to stay in the free tier |
| `limits.daily_usd` | 2.5 | Daily money cap at list price. Lower it if data sharing is off |
| `limits.max_steps_per_job` | 14 | Step cap per job |
| `limits.pause_between_jobs_sec` | 30 | Seconds of rest between jobs |
| `limits.pause_when_idle_min` | 15 | Minutes to rest when the brain finds nothing worth doing |
| `limits.check_board_sec` | 120 | How often code re-checks a board with nothing new (no tokens) |
| `brains` | FLOP → OpenAI | Brains in priority order. The first with a key is used; on gateway full (429), expired allowance or errors the next takes over and Telegram tells you. FLOP needs a gateway key file from the Flop CLI (`FLOP_KEY_FILE` in `.env`, or run inside the official CLI image so the key renews itself) |
| `limits.daily_flop` | 20 | Max $FLOP spent on compute per day (the anonymous faucet gives 25 FLOP / 24 h) |

**Budget for the season:** testnet runs about 90 days. Decide your maximum spend, divide by days, and set `daily_usd` to that.

## When something fails

The agent **messages Telegram immediately** on errors, never silently.

| Agent says | Do this |
|---|---|
| `Chưa có key API` / `Key API sai` (key missing / wrong) | Open `agent/.env`, set a correct `OPENAI_API_KEY` |
| `Tài khoản OpenAI hết tiền` (OpenAI out of credit) | Top up at platform.openai.com → Billing |
| `Não FLOP tạm nghỉ … pool full` | The Flop gateway is full. The agent uses OpenAI for 30 minutes, then tries FLOP again |
| `Não FLOP tạm nghỉ … allowance expired` / `enrollment_cap_reached` | Your wallet's devnet gateway allowance ran out, or Flop stopped enrolling new wallets. Ask Flop to renew it ([issues](https://github.com/flop-labs/network/issues), title `access: devnet gateway allowance`). Meanwhile the agent runs on OpenAI |
| `Không thấy data/<tên>.json` (file not found) | No DID yet: `node scripts/generate-did.js <name>` |
| `Kibble 5xx` | Kibble runs on a free server and is often slow. The agent retries on the next job |
| Bot doesn't reply | PC is off, or `CAI-TU-CHAY.bat` / `CHAY-AGENT.bat` hasn't been run |

## Manual install

1. Install [Node.js](https://nodejs.org) **LTS**.
2. Create a DID (the agent's identity) **only once**: open a terminal in the repo folder and run
   `node scripts/generate-did.js <short-name-no-diacritics>`.
   👉 **Back up immediately** `secrets/<name>.pkcs8.*` and `data/<name>.json` to USB or another drive. Lose the key file and the identity is gone for good.
3. Copy `agent/.env.example` to `agent/.env`, set `OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`
   (message [@BotFather](https://t.me/BotFather) → `/newbot`), and `DID_LABEL` (the DID name from step 2).
4. Test 1 job without Telegram: `node agent/thu-1-phien.js`.
5. Double-click `agent/CAI-TU-CHAY.bat` → open the bot on Telegram → `/start`.

No `npm install` needed, because the agent uses no external libraries.

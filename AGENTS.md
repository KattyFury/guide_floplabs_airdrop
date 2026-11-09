# AGENTS.md: for AI (Cursor) installing Agent Kibble for the user

The user sends this repo link with something like "read the repo and build it for me" / "đọc repo rồi build cho tôi" / "install the agent" → follow the steps below exactly.

⚠️ "Build" here means INSTALL the agent ALREADY in this repo. It does NOT mean writing a new agent. Do not write code or create a new project.

## How to talk

- The user does NOT know how to code. Reply in the user's language (Vietnamese if they write Vietnamese), short, as if to a 6th grader.
- Give only 1–3 tasks at a time. Explain every technical term in one everyday sentence.

## Rules

- The agent in `agent/` is finished and runs in production. Your ONLY job is to install and test it.
  Do NOT rewrite / refactor / edit `agent/src/`, install libraries, or run `npm install`.
- Do not read the whole repo. You only need `agent/README.md`, `agent/.env.example`, `agent/config.json`.
  Skip `docs/`, `guide/` (except `guide/agent-kibble.md`), `thuc-hanh/`.
- Keys and tokens: the user pastes them into `agent/.env` THEMSELVES. Never ask for them in chat and never print their values.
- Do NOT open or read files in `secrets/`. Do NOT commit, push, or edit `.gitignore`.
- Each `node agent/thu-1-phien.js` does 1 real job on Kibble with the user's DID → run it only once.

## Steps (in order)

0. Get the repo (if the workspace is not this repo yet):
   - Check Git: `git --version`. Missing → guide the user to install Git for Windows from git-scm.com (keep clicking Next),
     then reopen Cursor.
   - Open folder is empty → `git clone https://github.com/KattyFury/guide_floplabs_airdrop.git .`
     (the trailing dot clones right here). Not empty → clone into a `guide_floplabs_airdrop` subfolder
     and run EVERY later command there.
   - Read this `AGENTS.md` in the fresh clone, then continue from step 1.
1. Check Node.js: `node -v`. Missing or below 20 → guide the user through installing the LTS from nodejs.org, click by click.
2. Guide the user to get an OpenAI key: platform.openai.com → Billing, top up $6 (not $5: the extra keeps the balance from dropping below $5 if a few cents get charged past the free tier) → Data controls → Sharing, turn on data sharing
   (2.5M free tokens/day; state clearly that OpenAI may train on the data) → API keys → Create new secret key.
3. Guide the user to create a Telegram bot: @BotFather → `/newbot` → display name → username ending in `bot` → copy the token.
4. DID (the agent's identity): if `data/` has no `<name>.json` for this user → ask for one short name without diacritics →
   `node scripts/generate-did.js <name>`. If one exists, do NOT create another (one DID per person).
   Remind the user to back up `secrets/` + `data/<name>.json` to USB NOW. Lost means the identity is gone for good.
5. Copy `agent/.env.example` to `agent/.env` (keep it if it exists). Set `DID_LABEL=<name>`.
   Tell the user to paste the OpenAI key into `OPENAI_API_KEY=` and the token into `TELEGRAM_BOT_TOKEN=` THEMSELVES, then save.
6. Test exactly once: `node agent/thu-1-phien.js`
   - A `💸` line → OK.
   - A `❌` → explain in plain words and fix using the "When something fails" table in `agent/README.md`.
7. Tell the user to double-click `agent/CAI-TU-CHAY.bat` → the agent runs in the background whenever the PC is on (PC off = agent rests).
8. Tell the user to open the bot on Telegram → `/start` → `/status`. The first person to message becomes the bot owner.
9. Finish with this checklist:
   - [ ] `/status` replies on Telegram
   - [ ] User knows: PC on = agent runs, PC off = rests, 1 report daily at 7 AM; a plain question to the bot posts a job on Kibble (only after tapping ✅ Đăng)
   - [ ] DID backed up to USB
   - [ ] `agent/.env` and `secrets/` shared with no one and not committed to GitHub

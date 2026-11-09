# ⛏️ Miner track: rent your GPU to the network

*Updated 2026-11-07.*

## How miners earn airdrop credit

- Pool of **1.2B $FLOP**, split by **compute served and verified** on testnet (measured in operations, not by card type).
- Sending jobs to your own machine to "farm" gains nothing: credit follows verified compute units, not fees paid.
- You must **stake** (lock FLOP as a bond). On devnet and testnet, **the network sponsors the stake**, so you don't buy it.
  Cheating (wrong model answers, dropped jobs) slashes the stake.

## Who it suits

People with a strong idle NVIDIA GPU, or willing to rent one by the hour. Some Linux/Docker comfort helps, or let an AI coding agent follow the
[official skill](https://flop.network/skills/flop-miner-devnet/SKILL.md).

## What you need (per the official pack)

| Item | Requirement |
|---|---|
| GPU | NVIDIA, **≥ 16 GB VRAM per card**. Verified card: A40. Other cards: test them yourself |
| OS | Ubuntu 22.04 / 24.04, or a rented GPU VM (GPU.ai VM; RunPod Pod handles only the model-serving part) |
| Software | Docker + Compose + NVIDIA Container Toolkit (`docker info \| grep -i nvidia` must print something) |
| Network | A domain pointing at the machine + ports 80/443 open, **or** your own tunnel (e.g. Cloudflare Tunnel) to `127.0.0.1:8645` |
| Uptime | Always on. Missing calibration jobs (machine benchmarks) gets penalized |
| Wallet | A **dedicated miner wallet**, not shared with an agent or validator wallet |

## Devnet steps (no invite needed since 11/02)

1. Download the pack and verify SHA-256 (commands under *Set up with your agent* in the [run-miner docs](https://docs.flop.network/docs/run-miner)).
2. Create the miner account (step 1 of the pack README). **Back up the seed somewhere safe**, send it to no one.
3. Check sponsored-stake availability first: `curl -s https://faucet.flop.network/limits` → `sponsor.miner.status`
   - `open` → run `./sponsor.sh` (do not `miner register` yourself).
   - `automatic_full` → 40 miners already waiting for calibration, **wait**, do not keep sending.
4. Download the model, fill in `miner.env`, run `./decode-policy.sh miner.env && docker compose … up -d`.
5. Track calibration at [explorer/mining](https://explorer.devnet.flop.network/mining) (can take a day).
6. To stop: `sudo ./retire.sh` **before** deleting a rented VM (stopping Docker does not stop the rental).

## ⚠️ Status 2026-11-07

- Automatic sponsored-stake slots are **full** (`automatic_full`, 40/40) → many people stuck on 429
  ([#127](https://github.com/flop-labs/network/issues/127), [#131](https://github.com/flop-labs/network/issues/131)).
- Only **registration + calibration** work. Paid sessions for public miners are **not open yet**.
- The old form `flop.finance/apply/miner` returns 404.

## Mistakes to avoid

- Don't judge "my card is enough" from model size alone. The devnet model needs about 1 GB VRAM, but the pack requires **16 GB**:
  read the pack README before promising anyone. (The author got exactly this wrong, see [practice](../thuc-hanh/nhat-ky.md).)
- 8–12 GB cards: don't force it. Renting a ≥16 GB GPU VM by the hour is cheaper than risking calibration penalties.

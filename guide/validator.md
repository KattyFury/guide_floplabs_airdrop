# 🛡️ Validator track: run a block-producing node

*Updated 2026-11-07.*

## How validators earn airdrop credit

- Not proportional but by **seat**: up to **1,000 seats**, each worth **1.2M $FLOP** (equal to the required stake, granted free).
- Seats go by **ranking across all of testnet**: uptime, blocks produced, accuracy, latency, geographic spread. Weights are unpublished.
- Seats are locked 24 months; stop running and you lose the seat. About 50 of the worst validators are replaced each month.
- Validators **cannot be referred** (no credit for creators).

## Who it suits

People who have run nodes on other chains, own or can rent a server, and can absorb a fixed monthly cost. **No GPU needed.**

## What you need

| Item | Requirement (testnet page, provisional) |
|---|---|
| CPU | 8+ cores (FAQ: 3.4 GHz or higher) |
| RAM | 64 GB (FAQ lists 32 GB ECC as the minimum) |
| Disk | 4 TB NVMe (minimum 2 TB), for the network's model data |
| Network | Stable 1 Gbps |
| Machine | Dedicated Linux amd64, one machine/VM per validator |
| Cost | About $300/month rented, or $4,000–5,000 to buy |

## Status 2026-11-07

- **Devnet: not self-serve yet.** The Flop team must onboard you directly, grant access to the private network, and provide FLOP.
  No contact? Ask for an introduction in [issue #10](https://github.com/flop-labs/network/issues/10). The docs state that an issue
  **does not guarantee** acceptance and gives no timeline.
- The faucet shows validator sponsored stake as `open`, but the remaining steps still need Flop team approval.
- **Testnet:** Flop says it will be open to all, no whitelist, stake sponsored by the network. Public self-registration is **not finished**.

## What to do now

1. Prepare (or pick a rental for) a server with the specs above.
2. Watch the [run-validator docs](https://docs.flop.network/docs/run-validator) and [@flop_labs](https://x.com/flop_labs) for the public registration date.
3. Experienced node operators: ask for an introduction in issue #10, stating your machine and experience.
4. Keep the validator wallet fully separate from the miner wallet: the docs warn that a validator also acting as a miner can cause consensus faults.

# Tham gia airdrop Flop Labs ($FLOP) — hướng dẫn tiếng Việt

> 🤖 **Dành cho AI (Cursor…):** người dùng nhờ "đọc repo rồi build" = **cài Agent Kibble có sẵn trong repo này**, không viết code mới.
> Làm đúng từng bước trong [`AGENTS.md`](AGENTS.md).

`$FLOP` là tiền của **Flop Network** (Flop Labs / Arthur Hayes): mạng nơi **AI agent trả tiền cho máy GPU** để chạy AI.
Không bán token trước. Toàn bộ 4,4 tỷ $FLOP lúc ra mắt chia cho người **làm việc thật trên testnet**.

*Cập nhật 07/11/2026. Hướng dẫn cộng đồng, không phải Flop Labs. Luôn ưu tiên [flop.finance](https://flop.finance/official/) và [@flop_labs](https://x.com/flop_labs).*

---

## Repo có 2 phần

### 📘 1. [Guide](guide/README.md) — bạn nên tham gia thế nào

Chọn nhánh hợp với mình, xem cần gì, làm theo từng bước:

| Nhánh | Hợp với ai | Hướng dẫn |
|---|---|---|
| 🤖 **Agent** | Ai cũng làm được, không cần máy mạnh | [guide/agent.md](guide/agent.md) |
| ⛏️ **Miner** | Có GPU NVIDIA ≥ 16 GB VRAM, hoặc thuê GPU | [guide/miner.md](guide/miner.md) |
| 🛡️ **Validator** | Có / thuê server mạnh, quen chạy node | [guide/validator.md](guide/validator.md) |
| 📣 **Creator** | Có cộng đồng, kéo người dùng thật (ref to earn) | [guide/creator.md](guide/creator.md) |

👉 **[Bắt đầu: chọn nhánh](guide/README.md)** · Cài agent mẫu chạy nền trên máy: [guide/agent-kibble.md](guide/agent-kibble.md)

### 🧪 2. [Thực hành](thuc-hanh/README.md) — người viết đã làm thật thế nào

Nhật ký tham gia của chính người viết guide: đã thử gì, đo được gì, **sai ở đâu** và rút ra bài học gì.
Guide được viết từ phần này.

---

## Tình hình hôm nay (07/11/2026)

- **Testnet chưa mở** (dự kiến Q4/2026, ~90 ngày). Mainnet dự kiến Q1/2027.
- **Devnet đang mở cho mọi người** để tập, **không có thưởng**, chain có thể bị đặt lại.
- Faucet chạy được. Nhưng mua compute (gọi AI) chưa được: CLI trên npm lệch phiên bản, gateway chưa có model.
- Chi tiết từng nhánh ghi ở đầu mỗi trang guide.

## Né lừa đảo (đọc 10 giây)

- Chưa có $FLOP thật để "claim" hay mua bán. Ai bán "vào sớm / whitelist / RPC / claim ngay" là lừa đảo.
- Chỉ tin link trong [flop.finance/official](https://flop.finance/official/).
- Không gửi seed, mnemonic, file khoá DID, file `agent/.env` cho ai, kể cả "support".

---

## Thư mục

| Đường dẫn | Dùng để |
|---|---|
| [guide/](guide/README.md) | Hướng dẫn 4 nhánh + cài Agent Kibble ([agent-kibble.md](guide/agent-kibble.md)) |
| [thuc-hanh/](thuc-hanh/README.md) | Nhật ký làm thật, sai lầm, bài học |
| [agent/](agent/README.md) | Code Agent Kibble (cài theo guide/agent-kibble.md) |
| [scripts/](scripts/) | Tạo DID, ký tin nhắn TechnoCore |
| [AGENTS.md](AGENTS.md) | Hướng dẫn cho Cursor cài agent (Cursor tự đọc) |

**Nguồn chính thức:**
[Link chính thức](https://flop.finance/official/) · [Docs](https://docs.flop.network) · [Hỏi đáp](https://ask.flop.finance) ·
[Airdrop](https://flop.finance/airdrop/) · [Testnet](https://flop.finance/testnet/) · [Faucet](https://faucet.flop.network) ·
[Explorer](https://explorer.devnet.flop.network) · [Kibble llms.txt](https://kibble.world/llms.txt)

[MIT](LICENSE)

# 🤖 Nhánh Agent — mua compute bằng $FLOP

*Cập nhật 07/11/2026.*

## Agent được tính airdrop thế nào

- Pool **1,2 tỷ $FLOP**, chia theo lượng **compute đã mua trong các phiên đã thanh toán xong** trên testnet.
- Nhận faucet mà không tiêu → **không được gì**. Tiêu faucet vào inference (gọi AI chạy trên máy miner) → được tính.
- Lên mainnet, phần được chia bị khoá, mở dần khi bạn tiếp tục tiêu: **tiêu 3 $FLOP vào inference mở khoá 1 $FLOP**.
  Không tiêu thì khoá mãi.
- Chia 50 ví không lợi gì: phần mở khoá tính theo lượng tiêu, không theo số ví.

## Ai hợp

Mọi người. Không cần GPU, không cần biết code: có thể nhờ AI (Cursor, Claude Code…) làm theo hướng dẫn.

## Cần gì

| Thứ | Là gì | Lấy ở đâu |
|---|---|---|
| Ví | Địa chỉ sr25519, bắt đầu bằng `5…` | CLI của Flop tạo, hoặc thư viện Polkadot |
| DID | "Căn cước" của agent, dùng chung với TechnoCore / Kibble | [agent-kibble.md](agent-kibble.md) bước 4 |
| $FLOP test | Tiền để mua compute | [faucet.flop.network](https://faucet.flop.network) |
| API key agent | Key gọi `https://api.flop.network/v1/chat/completions` | Lệnh `flop agent credential` |

**Faucet hôm nay (07/11):** xin ẩn danh 25 FLOP / ví / 24 giờ; agent grant 2 FLOP / 24 giờ và **phải tiêu rồi mới xin tiếp**.
Trang web faucet có thêm xác minh người thật (Passport, BrightID…) để nhận nhiều hơn.

## Các bước trên devnet (tập trước, chưa có thưởng)

1. **Tạo 1 ví và giữ nó suốt.** Lệnh chính thức (CLI tự tạo ví, xin faucet, lưu key vào `~/.flop/`):
   ```bash
   npx --yes --package @flop-labs/cli@<bản mới nhất> flop --network devnet agent credential --json
   ```
   ⚠️ Ví CLI tạo lưu mnemonic **không mã hoá** trong `~/.flop/`. Chép ngay file đó ra USB: đổi máy mà không mang theo là mất ví.
2. **Xin FLOP.** Lệnh trên tự xin nếu ví dưới 1 FLOP. Hoặc tự xin trên web faucet. Kiểm tra số dư:
   `https://explorer.devnet.flop.network/api/accounts/<địa chỉ ví>`.
3. **Gọi thử 1 lần** `POST https://api.flop.network/v1/chat/completions` bằng key vừa lấy. Gọi được = agent đã "mua compute".
4. **Cho agent của bạn dùng key đó làm "não"** thay cho OpenAI/Claude. Agent mẫu trong repo này: [agent-kibble.md](agent-kibble.md).

## ⚠️ Tình trạng 07/11/2026: bước 1 và 3 đang hỏng phía Flop

- `@flop-labs/cli` và `@flop-labs/sdk` bản 0.4.0 trên npm **không chạy** với devnet sau nâng cấp runtime
  ([issue #132](https://github.com/flop-labs/network/issues/132)).
- `api.flop.network/v1/models` đang trả **danh sách rỗng**, gateway báo đầy (429)
  ([#124](https://github.com/flop-labs/network/issues/124)).
- Faucet thì **đang chạy**: người viết guide xin được 25 FLOP cho ví mới ngày 07/11.

→ Việc nên làm ngay: tạo ví, xin faucet, cài sẵn agent. Khi Flop sửa xong thì chỉ còn bước lấy key và đổi não.

## Trong lúc chờ: Agent Kibble

[Kibble](https://kibble.world) là chợ việc cho agent do cộng đồng dựng trên TechnoCore (hub agent của Flop).
Điểm Kibble **không tính airdrop**, nhưng là chỗ tập cho agent làm việc thật và có sẵn DID khi testnet mở.
Hướng dẫn cài agent mẫu chạy nền trên máy, nhờ Cursor cài hộ: **[agent-kibble.md](agent-kibble.md)**.

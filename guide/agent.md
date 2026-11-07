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

## Tình trạng 07/11/2026: làm được, nhưng đi đường vòng

- `@flop-labs/cli` bản 0.4.0 trên npm **không chạy** với devnet ([issue #132](https://github.com/flop-labs/network/issues/132)).
  **Dùng bản Docker thay thế** (cần Docker; trên Windows dùng Git Bash):
  ```bash
  IMG=ghcr.io/flop-labs/flop-core/cli@sha256:24e32b034b0d3600ee28127dad30d4228e623235f2dc62da34c2c85ba5e21a88  # v0.1.290
  MSYS_NO_PATHCONV=1 docker run --rm -v flop-cli-home:/root/.flop --entrypoint sh $IMG     -c 'chmod 700 /root/.flop && exec node dist/cli.js --network devnet agent credential --json'
  ```
  Phải dùng Docker volume (`flop-cli-home`), **không** gắn thư mục Windows: CLI đòi thư mục quyền 0700.
  Key và ví nằm trong volume; chép ra chỗ cất bí mật:
  `docker run --rm -v flop-cli-home:/f -v "<thư mục bí mật>":/out alpine cp -r /f/. /out/`
- Gateway lúc đông trả `429 gateway channel pool is full` ([#124](https://github.com/flop-labs/network/issues/124)):
  thử lại sau 30–60 phút, đừng gửi dồn. Lúc có chỗ thì phản hồi **chậm** → đặt timeout ≥ 120 giây (60 giây là hụt).
- Gọi được thì kết quả có `usage.cost_flop` và `x_flop_receipt` (kênh, miner, `settlementStatus`).
  `pending` nghĩa là chưa tất toán; airdrop chỉ tính **phiên đã settle**.
- Người viết guide: 6 lần 429 buổi sáng, **13:21 UTC gọi thành công**, 2 lần tốn 0,066 + 0,24 FLOP.

## Trong lúc chờ: Agent Kibble

[Kibble](https://kibble.world) là chợ việc cho agent do cộng đồng dựng trên TechnoCore (hub agent của Flop).
Điểm Kibble **không tính airdrop**, nhưng là chỗ tập cho agent làm việc thật và có sẵn DID khi testnet mở.
Hướng dẫn cài agent mẫu chạy nền trên máy, nhờ Cursor cài hộ: **[agent-kibble.md](agent-kibble.md)**.

# ⛏️ Nhánh Miner — cho mạng thuê GPU chạy AI

*Cập nhật 07/11/2026.*

## Miner được tính airdrop thế nào

- Pool **1,2 tỷ $FLOP**, chia theo **compute đã phục vụ và vượt qua kiểm tra** trên testnet (đo bằng số phép tính, không theo loại card).
- Tự gửi việc cho máy mình để "cày" không lợi gì: tính theo đơn vị compute được xác minh, không theo phí trả.
- Phải **stake** (khoá FLOP làm tiền cọc). Trên devnet và testnet, **mạng tài trợ stake**, bạn không phải mua.
  Gian lận (trả lời sai model, bỏ việc) bị phạt vào stake.

## Ai hợp

Người có GPU NVIDIA mạnh để không, hoặc chịu thuê GPU theo giờ. Cần quen một chút Linux/Docker, hoặc để AI coding agent làm theo
[skill chính thức](https://flop.network/skills/flop-miner-devnet/SKILL.md).

## Cần gì (theo bộ cài chính thức)

| Thứ | Yêu cầu |
|---|---|
| GPU | NVIDIA, **≥ 16 GB VRAM mỗi card**. Card đã kiểm chứng: A40. Card khác phải tự kiểm |
| Hệ điều hành | Ubuntu 22.04 / 24.04, hoặc VM thuê có GPU (GPU.ai VM; RunPod Pod chỉ làm phần chạy model) |
| Phần mềm | Docker + Compose + NVIDIA Container Toolkit (`docker info \| grep -i nvidia` phải ra chữ) |
| Mạng | Tên miền trỏ về máy + mở cổng 80/443, **hoặc** tunnel của bạn (vd Cloudflare Tunnel) tới `127.0.0.1:8645` |
| Uptime | Bật liên tục. Bỏ lỡ việc calibration (bài đo máy) bị phạt |
| Ví | **Ví miner riêng**, không dùng chung với ví agent hay validator |

## Các bước trên devnet (không cần mời từ 02/11)

1. Tải bộ cài và kiểm SHA-256 (lệnh ở mục *Set up with your agent* trong [docs run-miner](https://docs.flop.network/docs/run-miner)).
2. Tạo tài khoản miner (bước 1 trong README của bộ cài). **Backup seed ra chỗ an toàn**, không gửi cho ai.
3. Xem suất tài trợ stake trước: `curl -s https://faucet.flop.network/limits` → `sponsor.miner.status`
   - `open` → chạy `./sponsor.sh` (đừng tự `miner register`).
   - `automatic_full` → đang đủ 40 miner chờ calibration, **đợi**, không gửi liên tục.
4. Tải model, điền `miner.env`, chạy `./decode-policy.sh miner.env && docker compose … up -d`.
5. Theo dõi calibration ở [explorer/mining](https://explorer.devnet.flop.network/mining) (có thể mất 1 ngày).
6. Ngừng: `sudo ./retire.sh` **trước khi** xoá VM thuê (dừng Docker không dừng tiền thuê).

## ⚠️ Tình trạng 07/11/2026

- Suất tài trợ stake tự động **đang đầy** (`automatic_full`, 40/40) → nhiều người kẹt 429
  ([#127](https://github.com/flop-labs/network/issues/127), [#131](https://github.com/flop-labs/network/issues/131)).
- Chỉ **đăng ký + calibration** chạy được. Phiên trả phí cho miner công khai **chưa mở**.
- Form đăng ký cũ `flop.finance/apply/miner` đang báo 404.

## Sai lầm nên tránh

- Đừng đánh giá "card mình đủ" chỉ vì model nhỏ. Model devnet chỉ cần khoảng 1 GB VRAM, nhưng bộ cài yêu cầu **16 GB**:
  đọc README bộ cài trước khi hứa với ai. (Người viết guide đã sai đúng chỗ này, xem [thực hành](../thuc-hanh/nhat-ky.md).)
- Card 8–12 GB: đừng ép chạy. Thuê VM GPU ≥16 GB theo giờ rẻ hơn rủi ro bị phạt calibration.

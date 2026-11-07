# Thực hành — quá trình tham gia của chính người viết

Phần [guide](../guide/README.md) được viết **từ những gì đã làm thật ở đây**. Mỗi luật trong guide nên truy được về một dòng
trong nhật ký: đã thử, đo được gì, sai ở đâu.

| File | Nội dung |
|---|---|
| [nhat-ky.md](nhat-ky.md) | Nhật ký theo ngày: làm gì, kết quả, sai lầm |
| [2026-08-technocore-log.md](2026-08-technocore-log.md) | Log cũ TechnoCore (tháng 8–9, tiếng Anh) |
| [2026-08-tweet-draft.md](2026-08-tweet-draft.md) | Nháp tweet cũ |

## Đang ở đâu (07/11/2026)

| Nhánh | Trạng thái |
|---|---|
| 🤖 Agent | Agent Kibble chạy 24/7 trên VPS. Ví devnet có 25 FLOP. **Chưa mua được compute**: CLI npm hỏng, gateway chưa có model |
| ⛏️ Miner | Ví miner + bộ cài đã sẵn. Máy nhà (RTX 3070 8 GB) **dưới chuẩn 16 GB**. Suất sponsor đang đầy |
| 🛡️ Validator | Chưa làm: không đủ phần cứng, devnet cần đội Flop duyệt |
| 📣 Creator | Đang viết guide này. Link ref chưa mở |

## Bài học rút ra (dùng để viết guide)

1. **Đo, đừng tin trang trạng thái.** Faucet báo `/health: ok` mà vẫn từ chối phát tiền. Gọi thử thật mới biết.
2. **Đọc yêu cầu của bộ cài chính thức trước khi kết luận.** Model nhỏ ≠ GPU nhỏ: bộ cài miner đòi ≥16 GB VRAM.
3. **Ví tạo ra là cất ngay** ở một chỗ bí mật cố định, có backup. Mất 1 ví devnet vì để trong thư mục ẩn của máy khác.
4. **Mỗi nhánh một ví riêng** (agent, miner, validator). Docs yêu cầu tách ví miner và validator.
5. **Công cụ của Flop thay đổi theo ngày.** CLI npm có thể lệch với mạng sau mỗi lần nâng cấp: xem
   [issue](https://github.com/flop-labs/network/issues) trước khi tưởng mình làm sai.
6. **AI agent làm việc thật phải có trích dẫn.** Không có nguồn thì model bịa số, và người chấm phát hiện được.
7. **Agent chạy 24/7 cần não dự phòng** và trần token/ngày, không thì hoặc đứng, hoặc tốn tiền âm thầm.
8. **Đừng gọi AI khi không có việc.** Kiểm tra bằng code trước (0 token), có việc mới gọi não.
9. **Làm ít mà thật.** Luật airdrop loại tài khoản "làm cho có", nên agent không spam việc, không tạo nhiều DID.

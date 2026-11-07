# 🛡️ Nhánh Validator — chạy node dựng block

*Cập nhật 07/11/2026.*

## Validator được tính airdrop thế nào

- Không chia theo tỷ lệ mà là **ghế**: tối đa **1.000 ghế**, mỗi ghế được **1,2 triệu $FLOP** (đúng bằng mức stake bắt buộc, được cấp miễn phí).
- Ghế chọn theo **xếp hạng suốt testnet**: uptime, số block làm ra, độ chính xác, độ trễ, phân bố địa lý. Chưa công bố trọng số.
- Ghế bị khoá 24 tháng; ngừng chạy là mất ghế. Mỗi tháng thay ~50 validator kém nhất.
- Validator **không được giới thiệu qua ref** (không tính cho creator).

## Ai hợp

Người đã chạy node chain khác, có server riêng hoặc thuê được, chịu được chi phí cố định hằng tháng. **Không cần GPU.**

## Cần gì

| Thứ | Yêu cầu (trang testnet, tạm thời) |
|---|---|
| CPU | 8+ nhân (FAQ: 3,4 GHz trở lên) |
| RAM | 64 GB (FAQ ghi 32 GB ECC là tối thiểu) |
| Ổ | 4 TB NVMe (tối thiểu 2 TB) — để lưu dữ liệu model của mạng |
| Mạng | 1 Gbps ổn định |
| Máy | Linux amd64 riêng, mỗi validator 1 máy/VM |
| Chi phí | Khoảng $300/tháng thuê, hoặc $4.000–5.000 mua máy |

## Tình trạng 07/11/2026

- **Devnet: chưa tự làm được.** Phải được đội Flop hướng dẫn trực tiếp, cấp quyền vào mạng riêng và cấp FLOP.
  Không có liên hệ thì xin giới thiệu ở [issue #10](https://github.com/flop-labs/network/issues/10). Docs ghi rõ: gửi issue
  **không đảm bảo** được nhận, không hẹn thời gian.
- Faucet đang báo suất tài trợ stake validator `open`, nhưng các bước còn lại vẫn cần đội Flop duyệt.
- **Testnet:** Flop nói sẽ mở cho tất cả, không cần whitelist, stake do mạng tài trợ. Bản tự đăng ký công khai **chưa xong**.

## Nên làm gì bây giờ

1. Chuẩn bị (hoặc chọn sẵn chỗ thuê) server đúng cấu hình trên.
2. Theo dõi [docs run-validator](https://docs.flop.network/docs/run-validator) và [@flop_labs](https://x.com/flop_labs) để biết ngày mở đăng ký công khai.
3. Có kinh nghiệm vận hành node: xin giới thiệu ở issue #10, ghi rõ máy và kinh nghiệm của bạn.
4. Tách hẳn ví validator khỏi ví miner: docs cảnh báo validator đồng thời làm miner có thể gây lỗi đồng thuận.

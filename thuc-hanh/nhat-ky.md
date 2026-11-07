# Nhật ký tham gia — làm thật, ghi thật

Mỗi mục: làm gì, kết quả đo được, sai ở đâu. Giờ là UTC. Ví đều là **devnet** (không có giá trị).
Code và cấu hình của chính mình nằm ở repo private riêng; ở đây chỉ ghi quá trình.

---

## 2026-08 → 09 · TechnoCore: tạo DID, nhận room

Thử các thao tác cơ bản trên technocore.chat bằng terminal: tạo DID, ghi ghi chú, nhận room.
Log chi tiết (tiếng Anh): [2026-08-technocore-log.md](2026-08-technocore-log.md).

## 2026-10-18 · Agent Kibble chạy 24/7 trên VPS

- Agent tự nhận việc, làm, nộp bài và chấm bài trên Kibble. Não: OpenAI `gpt-5.4-mini`, dùng token miễn phí (bật chia sẻ dữ liệu).
- Ngày đầu: điểm 17, hạng 703. **3 bài bị chấm `not`** (−9 điểm).
- ❌ **Sai lầm: agent bịa số.** Nestlé, TSMC lấy số năm cũ; lạm phát Canada trích bản tin chưa phát hành.
  Gốc rễ: công cụ tìm kiếm (Brave, DuckDuckGo) chặn IP của VPS → không có kết quả → model điền số từ trí nhớ.
- ✅ Sửa: thêm Wikipedia làm nguồn dự phòng, đọc được PDF, **bắt buộc nộp kèm trích dẫn** (URL + câu trích có thật trên trang đã đọc,
  mọi con số phải nằm trong câu trích). Sau sửa: 10 bài, 9 useful, 1 not.

## 2026-10-19 · Đăng việc từ Telegram, trần token

- Nhắn câu hỏi cho bot → bot soạn thành việc → bấm ✅ mới đăng. Việc đầu tiên `k9bb97ca69b`, Kibble ghi +2 điểm.
- ❌ Deploy 2 lần liền không xem log → có thể cắt ngang 1 việc đang làm. Bài học: xem log, đợi việc hiện tại xong rồi mới deploy.
- ❌ Ghi trong guide "nạp $6 vì dưới $5 là rớt hạng" — lý do **sai** (hạng OpenAI tính theo tổng tiền đã nạp). Vẫn giữ $6, sửa lý do (07/11): $6 để có khoản dư, lỡ dùng lố phần miễn phí bị trừ vài cent thì số dư vẫn trên $5.

## 2026-10-25 · Điểm tụt về 0

- Điểm về 0, hạng 4.491. Kiểm tra: **lỗi phía Kibble**, bộ tính điểm đứng ở seq 9.997.001 trong khi room đã 21 triệu.
- Vấn đề phụ của mình: chợ cạn việc (3–4 việc mở) mà bot vẫn gọi não 15 phút/lần → ~650k token/ngày phí.
- ✅ Sửa: code tự xem bảng trước (0 token), không có việc mới thì không gọi não. Token/ngày: 823k → 266k.
- 27/10: điểm 22, hạng 586.

## 2026-10-28 · OpenAI hết tiền → thêm não dự phòng Claude

- Key OpenAI báo `429 no credits` → agent đứng cả buổi.
- ✅ Thêm dự phòng Claude Haiku 5.5: OpenAI lỗi thì tự chuyển, báo Telegram. 1 bước ≈ $0,00006.
- Bài học: agent chạy 24/7 cần **ít nhất 2 nguồn não**.

## 2026-11-03 · Devnet FLOP lần 1: không vào được

- Mục tiêu: lấy key API FLOP để agent mua compute bằng $FLOP thay cho OpenAI.
- Faucet trả `503 IP classification unavailable` cả từ máy nhà lẫn VPS. `/health` vẫn báo `ok`.
- ❌ Bài học: **`/health` báo ok không có nghĩa là phát được tiền.** Phải thử thật.
- CLI tự tạo ví `5EUKan…`, lưu mnemonic không mã hoá trong `~/.flop/` của máy đó.

## 2026-11-07 · Devnet lần 2: có FLOP, chưa mua được compute

**09:35 — kiểm tra lại**
- Faucet đã sửa (bản 0.1.284), `status: open`.
- `@flop-labs/cli` 0.4.0 trên npm **hỏng** sau nâng cấp runtime devnet (issue #132). Chưa có bản mới.
- `api.flop.network/v1/models` → danh sách rỗng. Gateway báo đầy.
- ❌ **Mất ví cũ:** máy đang dùng không có `~/.flop/` → không có khoá ví `5EUKan…`.
  Bài học: tạo ví xong **chép file khoá ra chỗ cất bí mật chung ngay**, không để nằm trong thư mục ẩn của một máy.

**09:48 — ví agent mới + faucet**
- Tạo ví sr25519 bằng thư viện Polkadot (CLI hỏng). Mnemonic cất ở thư mục bí mật riêng, không đưa lên git.
- `POST https://faucet.flop.network/fund` với `{"address": "<ví>"}` → `200`, **25 FLOP**, tier `anonymous`. Explorer xác nhận số dư.
- Faucet hiện có 2 mức: ẩn danh 25 FLOP/24h, agent 2 FLOP/24h (phải tiêu mới xin tiếp).

**10:xx — xem máy nhà chạy được node gì** (RTX 3070 8 GB, i7-10700K, RAM 16 GB, Windows 10 + Docker Desktop)
- Validator: **không**. Cần 32–64 GB RAM, 4 TB NVMe, Linux riêng, và devnet vẫn cần đội Flop duyệt.
- Miner: lúc đầu kết luận "3070 chạy dư" vì model devnet chỉ cần ~1 GB VRAM.
  ❌ **Sai.** Đọc README bộ cài miner thì yêu cầu **GPU ≥ 16 GB VRAM**, Ubuntu. Đã đính chính.
  Bài học: **đọc yêu cầu của bộ cài chính thức trước khi kết luận**, đừng suy từ kích thước model.
- Suất tài trợ stake miner: `automatic_full` (40/40 chờ calibration). Validator: `open`.

**10:xx — chuẩn bị miner**
- Tạo ví miner riêng `5DnZWT…` (tách khỏi ví agent).
- Tải bộ cài `flop-miner-pack-devnet-ts-20261106`, SHA-256 khớp với docs.
- Docker Desktop có runtime `nvidia` → GPU dùng được trong container. Nhưng card 8 GB dưới chuẩn → chưa chạy.
- Quyết định chờ: thuê VM GPU ≥16 GB, hoặc đợi Flop nới yêu cầu, và đợi suất sponsor mở.

**Công cụ:** lệnh `npx @flop-labs/cli` bị Claude Code chặn (chạy code tải từ ngoài) → phải để người dùng tự chạy hoặc cấp quyền.
Với người làm theo guide bằng AI agent: chuẩn bị tinh thần bấm duyệt các lệnh này.

**11:06 — lấy được key agent bằng CLI bản Docker** (CLI npm 0.4.0 hỏng)
- Image `ghcr.io/flop-labs/flop-core/cli:v0.1.290@sha256:24e32b03…` (thấy trong issue #132, chưa có trong `releases.json`).
- ❌ Gắn thư mục Windows vào container (`-v D:/…:/root/.flop`) → CLI từ chối: *credential directory must be owned by this user with mode 0700*.
  ✅ Dùng **Docker volume** (`-v flop-cli-home:/root/.flop`) rồi chép file ra chỗ cất bí mật.
- Image không có lệnh `flop` trong PATH; entrypoint là `node dist/cli.js`.
- `agent credential --json` → key gateway, model `qwen/qwen2.5-0.5b-instruct`, hạn mức 20.000, **hết hạn sau ~24 giờ**.
- ❌ CLI **tự tạo thêm ví mới** `5Gx3xz…` và xin faucet 25 FLOP, chứ không dùng ví mình đã tạo. File ví của CLI
  (`devnet-enroll-wallet.json`) chỉ gồm `type, address, mnemonic` → lần sau đặt sẵn ví của mình vào đó trước khi chạy.

**11:07–11:18 — gọi thử mua compute: 6/6 lần `429 gateway channel pool is full`**
- Key hợp lệ (gateway nhận key, trả lỗi quá tải chứ không phải lỗi xác thực). Thử 6 lần, cách nhau 2 phút, không gửi dồn dập.
- Kết luận: phía mình đã làm xong mọi bước. **Nút thắt là gateway của Flop đang đầy** (issue #31, #124).

**13:19–13:23 — ✅ mua compute thành công**
- Bật vòng thử lại 30 phút/lần. Lần đầu `000`: curl timeout 60 s — gateway không còn trả 429 ngay mà **giữ request lâu**.
- Gọi lại với timeout 200 s → `200`. Lần 1: 11 token, **0,066 FLOP**. Lần 2: 42 token, **0,24 FLOP**.
- Receipt trả kèm: kênh thanh toán, miner phục vụ `5Dkyf…NzqU`, giá `0,003 FLOP/GN` (2 GN mỗi token), `settlementStatus: pending`.
- Số dư ví chưa trừ ngay (vẫn 25 FLOP): tiền trừ khi kênh đóng và tất toán. Theo dõi tiếp.
- Model `qwen2.5-0.5b` rất nhỏ: hỏi "2+2" thì trả lời vòng vo. Chỉ dùng để chứng minh luồng mua compute, chưa làm não agent được.
- ❌ Bài học: timeout 60 s ngắn quá → tưởng gateway chết. **Gateway đông thì chậm, đặt timeout ≥ 120 s.**

**14:00 — agent thứ 2: Flop Radar chạy 24/7 trên VPS, tự mua compute bằng FLOP**
- Không sửa agent Kibble; làm agent riêng. Duyệt thiết kế trước (model, cách gọi tool, danh sách tool, giới hạn) rồi mới code.
- Việc của agent: mỗi 30 phút xem issue mới của Flop, `releases.json`, faucet `/limits` (mạng chuyển testnet chưa, suất sponsor miner mở chưa),
  model trên gateway → báo Telegram. Issue mới thì **tóm tắt bằng model trên Flop** = mua compute cho một việc có ích, không phải gọi cho có.
- Model 0.5B quá nhỏ để tự gọi tool → **code điều khiển hết, model chỉ tóm tắt**.
- Mẹo: chạy agent **ngay trong image CLI chính thức của Flop** (có sẵn Node 24) → agent tự gia hạn key 24 giờ bằng CLI, không cần cài gì thêm.
- Lần tóm tắt thật đầu tiên: 541 token, **3,5 FLOP**. Đắt hơn dự tính: model viết hết `max_tokens` dù bảo "2 câu".
  ❌ Bài học: **đo chi phí bằng lần gọi thật** rồi mới đặt trần; 25 FLOP faucet chỉ đủ ~7 lần tóm tắt dài.
- ❌ Suýt đẩy khoá ví lên VPS cũ: SSH báo **host key đã đổi** → dừng lại, dùng VPS khác. Bài học: thấy cảnh báo host key thì không bỏ qua, nhất là khi sắp chép khoá.

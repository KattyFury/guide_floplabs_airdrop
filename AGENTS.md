# AGENTS.md — dành cho AI (Cursor) cài Agent Kibble cho người dùng

Người dùng gửi link repo này kèm câu kiểu "đọc repo rồi build cho tôi" / "cài agent cho mình" → làm đúng các bước dưới đây.

⚠️ "Build" ở đây = CÀI ĐẶT agent CÓ SẴN trong repo, KHÔNG phải viết agent mới. Không tự viết code, không tạo project mới.

## Cách nói chuyện

- Người dùng KHÔNG biết code. Tiếng Việt, ngắn, như nói với học sinh lớp 6.
- Mỗi lần chỉ đưa 1–3 việc. Từ kỹ thuật nào cũng giải thích bằng 1 câu đời thường.

## Luật

- Agent trong `agent/` đã viết xong và chạy thật. Việc của bạn CHỈ là cài đặt và chạy thử.
  KHÔNG viết lại / refactor / sửa `agent/src/`, KHÔNG cài thư viện, KHÔNG chạy `npm install`.
- Đừng đọc cả repo. Chỉ cần `agent/README.md`, `agent/.env.example`, `agent/config.json`.
  Bỏ qua `docs/`, `guide/` (trừ `guide/agent-kibble.md`), `thuc-hanh/`.
- Key và token: người dùng TỰ dán vào `agent/.env`. Không yêu cầu dán vào chat, không in giá trị ra.
- KHÔNG mở/đọc file trong `secrets/`. KHÔNG commit, KHÔNG push, KHÔNG sửa `.gitignore`.
- Mỗi lần chạy `node agent/thu-1-phien.js` là làm 1 việc thật trên Kibble bằng DID của người dùng → chỉ chạy 1 lần.

## Các bước (làm đúng thứ tự)

0. Lấy repo về máy (nếu workspace chưa phải repo này):
   - Kiểm tra Git: `git --version`. Chưa có → hướng dẫn cài Git for Windows ở git-scm.com (bấm Next liên tục là được),
     cài xong thì mở lại Cursor.
   - Thư mục đang mở còn trống → `git clone https://github.com/KattyFury/guide_floplabs_airdrop.git .`
     (có dấu chấm ở cuối = clone thẳng vào đây). Không trống → clone vào thư mục con `guide_floplabs_airdrop`
     và chạy MỌI lệnh sau trong thư mục đó.
   - Đọc file `AGENTS.md` này trong repo vừa clone rồi làm tiếp từ bước 1.
1. Kiểm tra Node.js: `node -v`. Chưa có hoặc dưới bản 20 → hướng dẫn cài bản LTS ở nodejs.org, từng nút bấm.
2. Hướng dẫn lấy key OpenAI: platform.openai.com → Billing nạp $6 (không phải $5: dư ra để lỡ bị trừ vài cent khi dùng lố phần miễn phí thì số dư vẫn không tụt dưới $5) → Data controls → Sharing bật chia sẻ dữ liệu
   (được 2,5 triệu token miễn phí/ngày; nói rõ OpenAI được dùng dữ liệu để huấn luyện) → API keys → Create new secret key.
3. Hướng dẫn tạo bot Telegram: @BotFather → `/newbot` → tên hiển thị → username kết thúc bằng `bot` → copy token.
4. DID (căn cước agent): nếu `data/` chưa có file `<tên>.json` của người dùng → hỏi 1 tên ngắn không dấu →
   `node scripts/generate-did.js <tên>`. Đã có thì KHÔNG tạo thêm (mỗi người chỉ 1 DID).
   Nhắc backup NGAY thư mục `secrets/` + `data/<tên>.json` ra USB. Mất là mất căn cước, không lấy lại được.
5. Copy `agent/.env.example` thành `agent/.env` (đã có thì giữ nguyên). Điền `DID_LABEL=<tên>`.
   Bảo người dùng TỰ dán key OpenAI vào `OPENAI_API_KEY=` và token vào `TELEGRAM_BOT_TOKEN=`, rồi lưu file.
6. Chạy thử đúng 1 lần: `node agent/thu-1-phien.js`
   - Ra dòng `💸` → OK.
   - Báo `❌` → giải thích bằng tiếng thường, sửa theo bảng "Khi có lỗi" trong `agent/README.md`.
7. Bảo người dùng bấm đúp `agent/CAI-TU-CHAY.bat` → agent chạy ngầm mỗi khi mở máy (tắt máy = nghỉ).
8. Bảo người dùng mở bot trên Telegram → `/start` → `/status`. Người nhắn đầu tiên sẽ thành chủ bot.
9. Kết thúc bằng checklist:
   - [ ] `/status` trên Telegram có trả lời
   - [ ] Biết: máy bật là agent chạy, tắt máy là nghỉ, mỗi ngày nhận 1 báo cáo lúc 7h sáng; nhắn câu hỏi thường cho bot = đăng việc lên Kibble (bấm ✅ Đăng mới đăng)
   - [ ] Đã backup DID ra USB
   - [ ] Không đưa `agent/.env` hay `secrets/` cho ai, không commit lên GitHub

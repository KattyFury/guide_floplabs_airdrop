# Tự build AI agent làm việc trong nền kinh tế agent của FLOP

> 🤖 **Dành cho AI (Cursor…):** người dùng nhờ "đọc repo rồi build" = **cài agent có sẵn trong repo này**, không viết code mới.
> Clone repo này về máy rồi làm đúng từng bước trong [`AGENTS.md`](AGENTS.md).

Dành cho người **chưa biết code**. Repo cho bạn một **AI agent chạy được ngay**: máy tính bật
là agent tự tìm việc trên [Kibble](https://kibble.world). Nó nhận việc, làm thật, nộp bài, và
chấm bài của agent khác. Mọi thứ được ký bằng căn cước (DID) của bạn. Hôm nay agent dùng não
OpenAI gần như miễn phí. Mục tiêu khi testnet **FLOP** ([@flop_labs](https://x.com/flop_labs)) mở
là đổi não sang **mua compute FLOP**, vì đó là việc được tính airdrop cho agent. Repo chưa làm được bước này ([xem tình trạng devnet](#tinh-trang-devnet)).

*Cập nhật 03/11/2026. Hướng dẫn cộng đồng, không phải Flop Labs. Thông tin có thể đổi.
Luôn ưu tiên [flop.finance](https://flop.finance) và [@flop_labs](https://x.com/flop_labs).*

---

## 0. Agent Kibble (bắt đầu từ đây)

| | |
|---|---|
| Làm gì | Tự nhận việc → làm → nộp bài, và tự chấm bài agent khác (useful / not) |
| Não | `gpt-5.4-mini` (OpenAI). Nạp $6 + bật chia sẻ dữ liệu → **2,5 triệu token miễn phí/ngày** |
| Chạy | **Chạy nền trên máy bạn**: máy bật là chạy, không cần mở cửa sổ, không cần VPS. Tắt máy = nghỉ |
| Báo cáo | Telegram, 7h sáng mỗi ngày 1 tin. Lỗi thì báo ngay. Có lệnh `/status` `/run` `/pause` `/resume` |
| Đăng việc | Nhắn câu hỏi cho bot → bot soạn thành việc, bấm Đăng → có bài nộp là bot báo kèm bản dịch |
| Cài | Có gói X Plus ($8, kèm Cursor) → gửi link repo cho Cursor: **"đọc repo rồi build cho tôi"** → Cursor làm hộ |
| Chi phí đo thật | ≈ 8.800 token mỗi bài chấm. Agent tự dừng ở 1,5 triệu token/ngày nên nằm trong phần miễn phí |

👉 **[BẮT ĐẦU TỪ ĐÂY: hướng dẫn từng bước](HUONG-DAN.md)** · [Tài liệu agent](agent/README.md)

---

## 1. FLOP là gì, 3 hướng tham gia

`$FLOP` là tiền của mạng **Flop Network** (Flop Labs / Arthur Hayes): mạng nơi **AI agent trả
tiền cho máy GPU** để chạy AI. Không bán token trước. Thưởng cho người **làm việc thật** trên testnet.

| # | Hướng | Việc làm hôm nay | Được tính khi nào |
|---|---|---|---|
| **1** | **Agent** | Chạy [Agent Kibble](agent/README.md) của repo này | Testnet mở: agent **mua compute đã thanh toán** |
| **2** | **Làm content** | Viết / quay video + điền form KOL | Chương trình creator / leaderboard (đang preview) |
| **3** | **Có GPU (miner)** | Đăng ký miner, chuẩn bị máy | Testnet mở: máy chạy inference thật |

Cả 3 hướng đều **chưa nhận tiền ngay**. Testnet chạy khoảng 90 ngày, mục tiêu mở 3/11/2026 nhưng đây chưa phải ngày chốt (trang trạng thái lúc viết vẫn ghi "planned"). Mainnet khoảng Q1/2027.

<a id="tinh-trang-devnet"></a>
**Tình trạng devnet (đo 03/11/2026):** Flop đã mở devnet cho nhà phát triển. **Devnet không có thưởng, không tính airdrop, chain có thể bị đặt lại.**

- Repo này **chưa gọi được API của FLOP**: faucet báo `503 IP classification unavailable` nên chưa xin được FLOP để lấy key ([issue #22](https://github.com/flop-labs/network/issues/22)). Agent trong repo vẫn dùng OpenAI.
- Nếu muốn tự thử: lệnh chính thức là `npx --yes --package @flop-labs/cli@0.4.0 flop --network devnet agent credential --json`. Lệnh này tạo một ví devnet riêng trên máy bạn, lưu cụm từ khôi phục ở dạng chưa mã hoá, nên đừng dùng ví đó cho việc gì có giá trị.
- Link chính thức: [Faucet](https://faucet.flop.network) · [Docs](https://docs.flop.network) · [Explorer](https://explorer.devnet.flop.network) · [Danh sách model](https://api.flop.network/v1/models).

**Luật quan trọng (trang airdrop chính thức):** phần thưởng tính **từ dữ liệu trên testnet**.
Nhận faucet thôi thì không được gì. Tài khoản bị đánh dấu **"làm cho có"** (manufactured activity) thì **mất trắng**.
Nên agent của repo làm **ít mà thật**, không spam.

---

## 2. Hướng 1 — Agent

Xem **[agent/README.md](agent/README.md)**: agent làm gì, não / tool / bộ nhớ / vòng lặp ra sao,
cách lấy API OpenAI miễn phí, cài đặt, lệnh Telegram, chi phí, núm vặn.

**DID** là căn cước của agent, được tạo trong lúc cài:
- **DID công khai** (dòng `did:key:...`) → share được.
- **File khoá bí mật** (`secrets/`) → như mật khẩu nhà. Mất là mất căn cước. Đưa người khác là họ giả làm bạn được.
- **Chỉ tạo 1 DID**, và **backup ra USB** ngay khi tạo.

---

## 3. Hướng 2 — Làm content

1. Điền form: [flop.finance/apply/kol](https://flop.finance/apply/kol) (không thấy tiếng Việt → chọn *Other*).
2. Đăng bài / video giải thích cho bạn bè (thật, không spam).
3. Gom mọi người vào 1 nhóm (X / Telegram) để khi có link giới thiệu thì gửi ngay.
4. Đừng kéo "ví ảo". Điểm hướng tới việc thật người khác làm, không phải view ảo.

Leaderboard KOL mới ở mức **xem trước**, chưa phải luật cuối.

---

## 4. Hướng 3 — Có GPU

1. Đăng ký: [flop.finance/apply/miner](https://flop.finance/apply/miner)
2. Chuẩn bị máy (GPU 16 GB VRAM trở lên mỗi card, theo trang testnet).
3. Chờ [@flop_labs](https://x.com/flop_labs) báo ngày mở và phần mềm chính thức.

---

## 5. Né lừa đảo (đọc 10 giây)

- Chưa có FLOP để "claim" hôm nay. Ai bán "vào sớm / RPC / claim ngay" là lừa đảo.
- Chỉ tin các link trong [flop.finance/official](https://flop.finance/official/). Token devnet không có giá trị, và FLOP chưa có token thật để mua bán.
- Không gửi file khoá DID, file `agent/.env` cho ai.
- Không chuyển tiền / seed ví cho "support".

---

## File trong repo

| File | Dùng để |
|---|---|
| [HUONG-DAN.md](HUONG-DAN.md) | **Hướng dẫn từng bước** cho người mới |
| [agent/](agent/README.md) | **Agent Kibble** — code + tài liệu tra cứu |
| [AGENTS.md](AGENTS.md) | Hướng dẫn cho Cursor (Cursor tự đọc, bạn không cần mở) |
| [scripts/generate-did.js](scripts/generate-did.js) | Tạo DID |
| [guide/technocore-ky-thuat.md](guide/technocore-ky-thuat.md) | Kỹ thuật Technocore (terminal), không bắt buộc |
| [data/activity-log.md](data/activity-log.md) | Nhật ký chạy thử cũ (tháng 8–9) |

**Nguồn chính thức:**
[Link chính thức](https://flop.finance/official/) ·
[Docs](https://docs.flop.network) ·
[Airdrop](https://flop.finance/airdrop/) ·
[Testnet](https://flop.finance/testnet/) ·
[Agent](https://flop.finance/intro/agent/) ·
[Apply KOL](https://flop.finance/apply/kol) ·
[Apply miner](https://flop.finance/apply/miner) ·
[Kibble llms.txt](https://kibble.world/llms.txt)

[MIT](LICENSE)

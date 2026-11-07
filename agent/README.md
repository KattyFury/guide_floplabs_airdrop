# Agent Kibble — agent tự làm việc + chấm bài trong nền kinh tế agent của FLOP

Máy tính bật là agent **tự tìm việc**. Nó nhận việc, làm thật, nộp bài, rồi **chấm bài** của
agent khác. Mọi thứ được ký bằng DID của bạn trên [Kibble](https://kibble.world), bảng việc
cho AI agent chạy trên [Technocore](https://technocore.chat). Mỗi ngày agent nhắn 1 báo cáo
qua Telegram lúc 7h sáng (giờ VN):

```text
📊 Báo cáo ngày 2026-10-18
📦 Nộp 2 bài · ✍️ chấm 4 bài (3 useful / 1 not)
🔋 65,753 token · 6 vòng · ≈$0.0401 theo giá niêm yết
🏆 Điểm Kibble hiện tại: 7 · hạng 1315
```

## Vì sao làm agent này?

Mạng **FLOP** ([@flop_labs](https://x.com/flop_labs)) dành cho **AI agent tự hành**. Agent tự
giữ FLOP, tự trả tiền cho máy GPU (miner) chạy AI để làm việc. Airdrop cho agent tính theo
**compute đã mua và đã thanh toán trên testnet** ([flop.finance/airdrop](https://flop.finance/airdrop/)).

Kibble là nơi **tập dượt đúng vòng lặp đó** trước khi testnet mở: agent đặt việc, worker làm,
validator chấm. Chạy agent từ hôm nay giúp bạn:
1. Có sẵn một agent quen việc, có lịch sử làm thật. Testnet mở thì **thử đổi não sang compute FLOP** (chưa kiểm chứng, xem [tình trạng devnet](../guide/agent.md)).
2. Có điểm uy tín trên Kibble. Chấm useful thì +6, chấm bài +1, làm dở thì −3.

**Nói thật trước:**
- Kibble **do cộng đồng làm, không phải Flop Labs**. Chính Kibble gọi điểm của họ là "giấy nợ cho airdrop tương lai", chưa có gì bảo đảm.
- Luật airdrop nháp của Flop tính **từ dữ liệu trên testnet**, và loại tài khoản **"làm cho có"**. Vì vậy agent này đặt **chất lượng lên trước số lượng**.

## Agent này là agent, không phải bot

Bot thì code quyết định từng bước. Ở đây **não tự quyết**, code chỉ đưa tool và chặn giới hạn.

| Phần | Là gì |
|---|---|
| 🧠 **Não** | `gpt-5.4-mini` qua API chuẩn OpenAI, có function calling. Mỗi bước não tự chọn: gọi tool nào, hay dừng |
| 🔧 **Tool** | `my_status`, `list_open_jobs`, `list_jobs`, `read_job`, `web_search` (Brave → DuckDuckGo → Wikipedia, miễn phí), `read_page` (đọc được cả PDF, tìm đúng đoạn theo từ khoá), `claim_job`, `submit_result`, `attest`, `skip_job`, `save_note`, `finish` |
| 💾 **Bộ nhớ ngắn hạn** | Hội thoại trong 1 vòng (= 1 việc). Xong việc là xoá, việc sau bắt đầu với đầu óc mới cho đỡ tốn token |
| 💾 **Bộ nhớ dài hạn** | `agent/data/memory.json`: việc đã làm, bài đã chấm, số dùng mỗi ngày, ghi chú não tự rút ra |
| 🔁 **Vòng lặp** | **1 vòng = 1 việc**: não tự chọn 1 việc (làm hoặc chấm) → chọn tool → code chạy → trả kết quả → não nghĩ tiếp → nộp/chấm xong là hết vòng. Nghỉ 30 giây rồi vòng mới. Trước mỗi vòng, code tự xem bảng việc (0 token): chưa có việc/bài mới thì khỏi hỏi não, 2 phút sau xem lại |
| 🛑 **Giới hạn** | Token/ngày, tiền/ngày, 14 bước cho 1 việc. Việc nhận rồi mà 2 vòng không xong thì bỏ |
| 🧾 **Chống bịa** | Việc tra cứu: mỗi con số phải nằm trong câu trích **có thật trên trang agent đã đọc** trong vòng đó, code tự đối chiếu, sai là chặn nộp |
| 🚫 **Chống tự chấm** | Không chấm / nhận việc của **bất kỳ DID nào trên máy bạn** (tự chấm bài mình bằng DID khác = Flop loại tài khoản) |

Não tự quyết: làm việc nào, bỏ việc nào, có cần lên web kiểm chứng không, chấm `useful` hay
`not`, viết lý do gì, khi nào dừng. Code **không** có luật kiểu "bài chứa chữ X thì chấm not".

## Cần gì?

| Thứ cần | Ghi chú |
|---|---|
| **API OpenAI** | Nạp $6, rồi bật chia sẻ dữ liệu để được token miễn phí mỗi ngày (mục dưới) |
| **Node.js** bản LTS | Chương trình để chạy agent ([nodejs.org](https://nodejs.org)) |
| **Telegram** | Agent báo cáo + bạn điều khiển |
| **DID** | Căn cước của agent. Repo có lệnh tạo sẵn |
| **Cursor** | Không bắt buộc. Cho AI cài hộ |

### Lấy API OpenAI mà vẫn gần như miễn phí

1. Vào [platform.openai.com](https://platform.openai.com/) → nạp **$6 credit**. Dùng hàng trả phí sẽ không bị lỗi như hàng free. Nạp $6 chứ không phải $5: số dư từ $5 trở lên mới được hạng tài khoản tốt, nạp vừa đúng $5 thì chỉ cần trừ vài cent là rớt xuống dưới.
2. Vào [Data controls → Sharing](https://platform.openai.com/settings/organization/data-controls/sharing) → bật **chia sẻ dữ liệu với OpenAI**.
   Mỗi ngày bạn được **2,5 triệu token miễn phí** cho các model mini (agent dùng `gpt-5.4-mini`). Agent tự dừng ở 1,5 triệu
   token/ngày, nên **thường không đụng tới $6 đã nạp**.
3. [API keys](https://platform.openai.com/api-keys) → **Create new secret key** → copy.

👉 Bật chia sẻ nghĩa là OpenAI được dùng nội dung agent gửi để huấn luyện model. Agent chỉ đọc
và viết nội dung công khai trên Kibble. Ai ngại thì đừng bật, khi đó hạ `limits.daily_usd`
trong `config.json` xuống mức bạn chịu được (VD 0.3).

## Cài đặt — để Cursor làm hộ

1. Mở 1 thư mục trống trong Cursor → chat **Agent** (`Ctrl+L`), model **Grok**.
2. Dán: `https://github.com/KattyFury/guide_floplabs_airdrop đọc repo rồi build cho tôi`. Cursor tự tải repo và làm theo [`AGENTS.md`](../AGENTS.md).
3. Làm theo từng bước Cursor hướng dẫn. Chi tiết từng bước cho người: [guide/agent-kibble.md](../guide/agent-kibble.md).

Tự làm bằng tay: xem [mục cuối](#tự-cài-bằng-tay).

## Chạy thế nào?

| Làm gì | Agent chạy khi nào |
|---|---|
| Bấm đúp `agent/CAI-TU-CHAY.bat` **1 lần** ⭐ | **Mỗi khi máy bật**, chạy ngầm, không có cửa sổ nào |
| Hoặc bấm đúp `agent/CHAY-AGENT.bat` | Khi cửa sổ đen còn mở. Đóng cửa sổ = agent nghỉ |

Tắt hẳn chế độ tự chạy ngầm: bấm đúp `agent/TAT-TU-CHAY.bat`.
**Tắt máy = agent nghỉ.** Bật máy lại, agent tự làm tiếp và gửi báo cáo của hôm trước.

## Lệnh Telegram

Gõ `/` trong chat để mở menu lệnh. Dòng gợi ý lệnh cũng hiện ở cuối mỗi tin nhắn.

| Lệnh | Agent làm |
|---|---|
| `/status` | Điểm, hạng, hôm nay đã làm gì, còn bao nhiêu token |
| `/run` | Làm ngay 1 việc (và báo kết quả việc đó) |
| `/pause` · `/resume` | Tạm dừng · chạy lại |
| `/help` | Agent này làm gì |
| *(nhắn tin thường)* | Đăng 1 việc lên Kibble — xem mục dưới |

Bot là **bot riêng**: người nhắn đầu tiên sẽ thành chủ. Muốn đổi chủ: xoá file `agent/data/bot.json`.

**Báo cáo ngày** đến lúc 7h sáng giờ VN (0h UTC), hoặc sớm hơn nếu agent dùng hết token trong ngày.

### Nhờ cả mạng làm giúp: đăng việc

Nhắn thẳng 1 câu hỏi cho bot (tiếng Việt cũng được), ví dụ *"doanh thu Vinamilk năm ngoái bao nhiêu"*:

1. Bot soạn lại thành 1 việc chuẩn tiếng Anh: đúng loại việc, phạm vi rõ ("năm ngoái" → 2025), có
   **Done when** (thế nào là xong) và **How to verify** (người chấm kiểm ở đâu). Lời chào / việc cần tài khoản riêng → bot từ chối.
2. Bot hiện bản nháp + 2 nút **✅ Đăng / ❌ Huỷ**. Bấm Đăng mới ký bằng DID của bạn và đăng (+2 điểm/việc).
3. Có agent nộp bài → bot nhắn ngay: **bản dịch tiếng Việt + bài gốc**, kèm 2 nút:
   **👍 Đạt (ACCEPT)** — xác nhận bài đúng ý bạn, người làm được công nhận, bạn +1 điểm ·
   **👎 Không đạt**. Không bấm cũng được. Phiếu chấm ký bằng DID của bạn và công khai.

Agent của bạn **không tự nhận, không tự chấm** việc bạn đăng (luật Kibble).
Đăng ít mà chất: đăng hàng loạt việc na ná nhau bị Kibble coi là cày điểm.

Bot bắt bài nộp bằng cách đọc liên tục room `kibble` trên Technocore (`/api/board` chỉ hiện ~80 việc nên
việc của bạn trôi mất sau vài phút). Room chỉ giữ ~80 phút → **bot phải đang chạy** thì mới bắt được bài nộp.

## Tốn bao nhiêu? (đo thật 18/10/2026)

| | Đo được |
|---|---|
| 1 bài chấm | ≈ 8.800 token |
| 2 việc nộp + 1 bài chấm | 39.350 token (22.400 được cache) · ≈$0.017 theo giá niêm yết · 5 phút |
| Soạn 1 việc để đăng · dịch 1 bài nộp | ≈ 700 token · ≈ 1.000 token |
| Ngân sách 1,5 triệu token/ngày | ≈ 110–190 việc/ngày (nếu bảng còn đủ việc) |

Log từng việc: `agent/logs/cost.jsonl`. Lỗi: `agent/logs/errors.log`.

## Núm vặn — `agent/config.json`

| Núm | Mặc định | Ý nghĩa |
|---|---|---|
| `limits.daily_tokens` | 1.500.000 | Trần token/ngày. Giữ dưới 2,5 triệu để nằm trong phần miễn phí |
| `limits.daily_usd` | 2.5 | Trần tiền/ngày theo giá niêm yết. Không bật chia sẻ dữ liệu thì hạ xuống |
| `limits.max_steps_per_job` | 14 | Trần bước cho 1 việc |
| `limits.pause_between_jobs_sec` | 30 | Nghỉ bao nhiêu giây giữa 2 việc |
| `limits.pause_when_idle_min` | 15 | Não xem rồi mà không có việc đáng làm thì nghỉ bao nhiêu phút |
| `limits.check_board_sec` | 120 | Bảng chưa có việc/bài mới thì bao nhiêu giây code xem lại (không tốn token) |
| `brain.model` / `brain.base_url` / `brain.api_key_env` | OpenAI | **Khi FLOP mở: thử đổi 3 dòng này sang compute FLOP. Chưa kiểm chứng: agent cần model gọi được tool, mà ngày 03/11/2026 FLOP chỉ có 1 model và chưa gọi thử được** |

**Lập ngân sách cho cả mùa:** testnet chạy khoảng 90 ngày. Chốt số tiền tối đa bạn chịu bỏ ra,
chia cho số ngày, rồi đặt `daily_usd` đúng mức đó.

## Khi có lỗi

Agent **nhắn Telegram ngay** khi gặp lỗi, không im lặng.

| Agent báo | Làm gì |
|---|---|
| `Chưa có key API` / `Key API sai` | Mở `agent/.env`, điền `OPENAI_API_KEY` đúng |
| `Tài khoản OpenAI hết tiền` | Nạp tại platform.openai.com → Billing |
| `OpenAI hỏng … Đang dùng Claude` | Có key Claude dự phòng nên agent vẫn chạy. Vẫn nên nạp/sửa OpenAI (não chính). Muốn bật dự phòng: điền `ANTHROPIC_API_KEY` trong `agent/.env` rồi chạy `npm install` trong thư mục `agent` |
| `Không thấy data/<tên>.json` | Chưa tạo DID: `node scripts/generate-did.js <tên>` |
| `Kibble 5xx` | Kibble chạy server free nên hay chậm. Agent tự thử lại ở việc sau |
| Không thấy bot trả lời | Máy đang tắt, hoặc chưa bấm `CAI-TU-CHAY.bat` / `CHAY-AGENT.bat` |

## Tự cài bằng tay

1. Cài [Node.js](https://nodejs.org) bản **LTS**.
2. Tạo DID (căn cước agent), làm **1 lần duy nhất**: mở Terminal trong folder repo, gõ
   `node scripts/generate-did.js <ten-ngan-khong-dau>`.
   👉 **Backup ngay** 2 file `secrets/<ten>.pkcs8.*` và `data/<ten>.json` ra USB hoặc ổ khác. Mất file khoá là mất căn cước, không lấy lại được.
3. Copy `agent/.env.example` thành `agent/.env`, điền `OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`
   (lấy bằng cách nhắn [@BotFather](https://t.me/BotFather) → `/newbot`), và `DID_LABEL` (tên DID ở bước 2).
4. Chạy thử 1 việc không cần Telegram: `node agent/thu-1-phien.js`.
5. Bấm đúp `agent/CAI-TU-CHAY.bat` → mở bot trên Telegram → `/start`.

Không cần `npm install`, vì agent không dùng thư viện ngoài.

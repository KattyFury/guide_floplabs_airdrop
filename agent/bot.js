// Runs in the background. PC on → the agent keeps finding work (doing and grading),
// reports via Telegram, answers commands at once. Stopping the program (PC off) = agent rests.
//
// Telegram commands: /status · /run · /pause · /resume · /help
// Plain messages (questions/ideas) → drafted as a job, posted to Kibble only after tapping ✅ Đăng.
import crypto from "node:crypto";
import { loadEnv, loadConfig } from "./src/env.js";
import { loadDid } from "./src/did.js";
import { runSession, today } from "./src/agent.js";
import { onFallback } from "./src/llm.js";
import * as T from "./src/telegram.js";
import { draftJob, postJob, preview, newAnswers, markSeen, translateVi, judgeAnswer, watchRoom } from "./src/postjob.js";

loadEnv();
let tg;
try {
  ({ tg } = T.makeTelegram(process.env.TELEGRAM_BOT_TOKEN));
} catch (e) {
  console.log(`❌ ${e.message} Mở file agent/.env và dán token.`);
  process.exit(1);
}
const cfg = loadConfig();
const id = loadDid(process.env.DID_LABEL);
let running = false;
let wake = null; // wake the loop early (on /run, /resume)
const send = (text, chatId) => T.send(tg, text, chatId);
onFallback((text) => send(text)); // brain switched (FLOP gateway full / allowance expired → OpenAI backup): tell the bot owner

// Send the daily report once, even when the timer and the work loop both call it.
let reporting = false;
async function report(date, why) {
  if (reporting || T.state().reported === date) return;
  reporting = true;
  try {
    await T.dailyReport(tg, id, date, why);
  } finally {
    reporting = false;
  }
}

// New day (00:00 UTC = 7 AM Vietnam) → send yesterday's report now, without waiting for the next work round.
// Check each minute; if sending fails, retry the next minute.
function reportYesterday() {
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if ((T.state().reported || "") >= y) return;
  report(y).catch((e) => console.log(`  ✗ báo cáo ngày: ${e.message}`));
}

const HELP = `👋 Mình là agent của bạn trên Kibble — bảng việc tập dượt của mạng FLOP.

Máy tính bật là mình tự tìm việc: nhận việc → làm thật → nộp bài, và chấm bài của agent khác (useful / not), ký bằng DID của bạn.
Mỗi ngày mình dừng khi dùng hết phần token miễn phí.

/status — điểm, hạng, hôm nay đã làm gì
/run — làm ngay 1 việc
/pause — tạm dừng
/resume — chạy lại
Gõ / để mở menu lệnh bất cứ lúc nào.

📮 Muốn nhờ cả mạng làm giúp? Nhắn thẳng câu hỏi (tiếng Việt cũng được). Mình soạn lại thành 1 việc chuẩn tiếng Anh, bạn bấm ✅ Đăng thì mới đăng lên Kibble bằng DID của bạn (+2 điểm/việc). Có agent nộp bài là mình báo ngay kèm bản dịch, bạn bấm 👍 Đạt (ACCEPT, +1) hoặc 👎 Không đạt. Đăng ít mà chất — đăng hàng loạt việc na ná nhau bị coi là cày điểm.`;

// Job drafts waiting for the owner's button tap (lost when the bot restarts).
const drafts = new Map();

async function onIdea(msg) {
  await send("✍️ Đang soạn thành 1 việc…");
  let job;
  try {
    job = await draftJob(cfg, msg.text);
  } catch (e) {
    return send(`❌ Không soạn được: ${e.message}`);
  }
  if (!job.ok) return send(`🤔 Chưa đăng được: ${job.reason_vi}`);
  const key = crypto.randomBytes(4).toString("hex");
  drafts.set(key, job);
  await tg("sendMessage", {
    chat_id: T.state().owner,
    text: `${preview(job)}\n\nChưa ổn thì bấm Huỷ rồi nhắn lại rõ hơn.`,
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [[{ text: "✅ Đăng", callback_data: `post:${key}` }, { text: "❌ Huỷ", callback_data: `drop:${key}` }]] },
  });
}

// Every 2 minutes check for new submissions on our posted jobs → Telegram (with translation) + grading buttons.
let checking = false;
async function checkAnswers() {
  if (checking) return;
  checking = true;
  try {
    for (const a of await newAnswers()) {
      let vi = "";
      try {
        vi = await translateVi(cfg, a.result);
      } catch (e) {
        vi = `(không dịch được: ${e.message})`;
      }
      const ok = await tg("sendMessage", {
        chat_id: T.state().owner,
        text: [`📬 Việc bạn đăng đã có bài nộp`, a.title, "", `🇻🇳 ${vi}`, "", `📄 Bản gốc (${a.worker.slice(0, 24)}):`, a.result, "", `Mã việc: ${a.job_id}`]
          .join("\n")
          .slice(0, 4000),
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: [[{ text: "👍 Đạt (ACCEPT)", callback_data: `acc:${a.job_id}` }, { text: "👎 Không đạt", callback_data: `rej:${a.job_id}` }]] },
      }).then(() => true, (e) => (console.log(`⚠️ ${e.message}`), false));
      if (ok) markSeen(a.job_id, a.result_hash);
      console.log(`  📬 bài nộp cho việc ${a.job_id} → ${ok ? "đã báo" : "báo lỗi, 2 phút sau thử lại"}`);
    }
  } catch (e) {
    console.log(`  ✗ xem bài nộp: ${e.message}`);
  } finally {
    checking = false;
  }
}

async function onButton(q) {
  await tg("answerCallbackQuery", { callback_query_id: q.id }).catch(() => {});
  if (q.from.id !== T.state().owner) return;
  const [act, key] = String(q.data).split(":");
  // Remove the buttons to prevent double taps.
  await tg("editMessageReplyMarkup", { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } }).catch(() => {});
  if (act === "acc" || act === "rej") {
    const r = await judgeAnswer(id, key, act === "acc");
    console.log(`  🧾 chấm bài nộp việc ${key} → ${act} ${r.ok ? "ok" : r.error || r.http}`);
    if (!r.ok) return send(`❌ Chưa chấm được: ${r.error || `HTTP ${r.http}`}`);
    return send(act === "acc" ? `👍 Đã ACCEPT bài nộp việc ${key} (+1 điểm cho bạn).` : `👎 Đã chấm không đạt bài nộp việc ${key}.`);
  }
  const job = drafts.get(key);
  drafts.delete(key);
  if (!job) return send("⌛ Nháp này không còn (đã xử lý hoặc bot vừa khởi động lại). Nhắn lại câu hỏi nhé.");
  if (act !== "post") return send("🗑️ Đã huỷ, không đăng.");
  const r = await postJob(id, job);
  console.log(`  📮 đăng việc ${r.job_id} → ${r.ok ? "ok" : r.error || r.http}`);
  if (!r.ok) return send(`❌ Kibble không nhận: ${r.error || `HTTP ${r.http}`}`);
  await send(`📮 Đã đăng việc ${r.job_id}\n${job.title}\n\nAgent của bạn sẽ không tự nhận hay tự chấm việc này (luật Kibble). Xem trên https://kibble.world`);
}

async function session(trigger) {
  if (running) {
    if (trigger !== "tự động") await send("⏳ Đang làm dở 1 việc, đợi xong nhé.");
    return null;
  }
  running = true;
  try {
    // New day with yesterday unreported → report yesterday first.
    const last = T.state().last_day;
    if (last && last !== today()) await report(last);
    T.setState({ last_day: today() });

    const r = await runSession(cfg, id);
    if (r.idle) {
      // Nothing new on the board → don't ask the brain, reply only when the user typed /run.
      if (trigger !== "tự động" && trigger !== "khởi động") await send(`😴 ${r.reason}`);
      return r;
    }
    console.log(`→ việc mới (${trigger}) ${new Date().toLocaleTimeString()}`);
    if (r.skipped) {
      if (trigger !== "tự động") await send(`😴 ${r.reason}`);
      // Today's token budget is used up → send the daily report (once).
      await report(today(), r.reason);
      return r;
    }
    // Message only when the user typed /run. Otherwise one report a day, to avoid spam.
    if (trigger !== "tự động" && trigger !== "khởi động") {
      const lines = r.done.map((d) => `• ${d}`).join("\n") || "• (chưa có việc nào đáng làm)";
      await send(`✅ Xong 1 việc\n\n${lines}\n\n📝 ${r.summary}\n\n${await T.statusText(cfg, id)}`);
    }
    return r;
  } catch (e) {
    // Out of credit / wrong key / Kibble down → report at once, never silently.
    console.log(`  ✗ ${e.message}`);
    await send(`❌ Agent gặp lỗi: ${e.message}`);
    return { error: true };
  } finally {
    running = false;
  }
}

async function onMessage(msg) {
  if (!(await T.claimOwner(tg, msg))) return;
  const text = T.command(msg);
  if (text === "/status") return send(await T.statusText(cfg, id));
  if (text === "/run") {
    if (running) return send("⏳ Đang làm dở 1 việc, đợi xong nhé.");
    await send("▶️ Bắt đầu 1 việc…");
    return wake?.();
  }
  if (text === "/pause") {
    T.setState({ paused: true });
    return send("⏸️ Đã tạm dừng. Gõ /resume để chạy lại.");
  }
  if (text === "/resume") {
    T.setState({ paused: false });
    await send("▶️ Chạy lại.");
    return wake?.();
  }
  if (text.startsWith("/") || !msg.text.trim()) return send(HELP);
  return onIdea(msg);
}

async function main() {
  const me = await tg("getMe", {});
  // Command menu shown at the "/" button beside Telegram's chat box.
  await tg("setMyCommands", { commands: T.COMMANDS }).catch((e) => console.log(`⚠️ ${e.message}`));
  console.log(`✅ Agent đang chạy: https://t.me/${me.username}`);
  console.log(`   DID: ${id.did}`);
  console.log("   Dừng chương trình này (tắt máy / đóng cửa sổ / dừng container) = agent nghỉ.\n");

  setInterval(reportYesterday, 60_000);
  setInterval(checkAnswers, 2 * 60_000);
  watchRoom(); // continuously read room kibble to catch submissions for our posted jobs

  // Continuous loop: each round = 1 job. Job done → rest 30 s then next job; board has nothing new → check again in 2 minutes
  // (code checks, 0 tokens); brain looked but found nothing worth doing → rest 15 minutes; out of tokens → rest 30 minutes.
  (async () => {
    const L = cfg.limits;
    for (;;) {
      let wait = L.pause_when_idle_min * 60; // seconds
      if (!T.state().paused) {
        const r = await session(wake ? "tự động" : "khởi động");
        if (r && !r.skipped && !r.error && r.done.length) wait = L.pause_between_jobs_sec; // just finished a job → do the next
        if (r?.idle) wait = L.check_board_sec;
        if (r?.skipped) wait = 30 * 60;
      }
      await new Promise((res) => {
        const t = setTimeout(res, wait * 1000);
        wake = () => {
          clearTimeout(t);
          res();
        };
      });
    }
  })();

  let offset = 0;
  for (;;) {
    let updates = [];
    try {
      updates = await tg("getUpdates", { offset, timeout: 50, allowed_updates: ["message", "callback_query"] });
    } catch (e) {
      console.log(`⚠️ Mất kết nối Telegram (${e.message}), thử lại sau 10 giây…`);
      await new Promise((r) => setTimeout(r, 10_000));
      continue;
    }
    for (const u of updates) {
      offset = u.update_id + 1;
      if (u.message?.text) onMessage(u.message).catch((e) => console.log(`  ✗ ${e.message}`));
      if (u.callback_query) onButton(u.callback_query).catch((e) => console.log(`  ✗ ${e.message}`));
    }
  }
}

main().catch((e) => {
  console.log(`❌ ${e.message}`);
  process.exit(1);
});

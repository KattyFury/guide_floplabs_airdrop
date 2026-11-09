// FREE web search + page reading (no key), replacing Grok's paid web search tool.
// Grok only receives trimmed text → far fewer tokens.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
}

const strip = (s) => decode(String(s || "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

async function get(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(15_000),
  });
  return r.ok ? r.text() : "";
}

// Brave Search (HTML page). Tested 10/18: 5 searches in a row still gave good results.
async function brave(query, n) {
  const html = await get(`https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`);
  return html
    .split('data-type="web"')
    .slice(1)
    .map((p) => ({
      url: (p.match(/href="(https?:\/\/[^"]+)"/) || [])[1],
      title: strip((p.match(/class="title[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1]),
      snippet: strip((p.match(/class="(?:snippet-description|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1]),
    }))
    .filter((r) => r.url && !r.url.includes("brave.com"))
    .slice(0, n);
}

// DuckDuckGo (HTML version), backup. Often demands a captcha after ~3 consecutive searches.
async function ddg(query, n) {
  const html = await get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
  const out = [];
  const re = /class="result__a" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  for (let m; (m = re.exec(html)) && out.length < n; ) {
    const raw = decode(m[1]);
    const u = raw.match(/uddg=([^&]+)/);
    const url = u ? decodeURIComponent(u[1]) : raw.startsWith("//") ? "https:" + raw : raw;
    if (!url.includes("duckduckgo.com/y.js")) out.push({ title: strip(m[2]), url, snippet: strip(m[3]) });
  }
  return out;
}

// Wikipedia: official API, free, doesn't block bots. Reliable backup when Brave/DuckDuckGo block.
async function wikipedia(query, n) {
  const q = String(query).replace(/\bsite:\S+/g, " ").trim();
  const r = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=${n}&srsearch=${encodeURIComponent(q)}`,
    { headers: { "User-Agent": "flop-kibble-agent/1.0 (https://github.com/KattyFury/guide_floplabs_airdrop)" }, signal: AbortSignal.timeout(15_000) },
  );
  const j = r.ok ? await r.json() : {};
  return (j.query?.search || []).map((x) => ({
    title: `${x.title} (Wikipedia)`,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(x.title.replace(/ /g, "_"))}`,
    snippet: strip(x.snippet),
  }));
}

// Free web search. Returns [{title, url, snippet}].
// Order: Brave → DuckDuckGo → Wikipedia. (Brave/DDG often block bursts; Bing excluded for returning junk to bots.)
let blockedUntil = 0; // Brave/DDG just blocked → skip them for 10 minutes, go straight to Wikipedia
export async function search(query, n = 5) {
  const engines = Date.now() < blockedUntil ? [wikipedia] : [brave, ddg, wikipedia];
  for (const engine of engines) {
    if (engine === wikipedia && engines.length > 1) blockedUntil = Date.now() + 600_000;
    try {
      const r = await engine(query, n);
      await sleep(1000); // bursts are easily blocked
      if (r.length) return r;
    } catch {}
  }
  return [];
}

// Fetch one HTML page → plain text. Returns "" if not HTML (e.g. PDF) or on error.
async function fetchHtml(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,text/plain" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !/html|text|markdown/.test(type)) return "";
    const html = (await r.text()).slice(0, 2_000_000);
    return decode(
      html
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<(script|style|noscript|svg|head|nav|footer|iframe)[\s\S]*?<\/\1>/gi, " ")
        .replace(/<\/(p|div|li|h[1-6]|tr|br|section|article)>/gi, "\n")
        .replace(/<[^>]+>/g, " "),
    )
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim();
  } catch {
    return "";
  }
}

// Free fallback: Jina Reader handles PDFs (annual reports…) and JavaScript pages.
async function fetchJina(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(90_000) });
    return r.ok ? (await r.text()).slice(0, 3_000_000) : "";
  } catch {
    return "";
  }
}

// Full page text (fetched), kept to check evidence at submission.
const pages = new Map();
export async function fullText(url) {
  if (pages.has(url)) return pages.get(url);
  let text = /\.pdf($|\?)/i.test(url) ? "" : await fetchHtml(url);
  if (text.length < 800) text = (await fetchJina(url)) || text; // PDF / JS page / blocked page
  pages.set(url, text);
  return text;
}
export const pageCache = pages;

// Read a page. With `find` (comma-separated keywords) → returns passages around keywords ANYWHERE on the page
// (number tables in reports are often very deep). Without `find` → returns the start of the page.
export async function readPage(url, maxChars = 4000, find = "") {
  const text = await fullText(url);
  if (!text) return "";
  const keys = String(find || "")
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  if (!keys.length) return text.slice(0, maxChars);
  const low = text.toLowerCase();
  const hits = [];
  for (const k of keys) {
    for (let i = low.indexOf(k); i !== -1 && hits.length < 8; i = low.indexOf(k, i + k.length)) {
      if (hits.some(([a, b]) => i >= a && i <= b)) continue;
      hits.push([Math.max(0, i - 250), Math.min(text.length, i + 450)]);
    }
  }
  if (!hits.length) return `None of [${keys.join(", ")}] found on this page (${text.length} chars). Start of page:\n${text.slice(0, 1500)}`;
  return hits
    .sort((a, b) => a[0] - b[0])
    .map(([a, b]) => `…${text.slice(a, b)}…`)
    .join("\n")
    .slice(0, maxChars);
}

export function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function formatResults(results) {
  return results.map((r) => `- ${r.title} | ${r.url}\n  ${r.snippet}`).join("\n");
}

# Task for Codex: three free tools (stopwatch, QR code maker, percent calculator)

Repository `yos360/ugabuga`. Read `CLAUDE.md` first and follow it. One Pull Request, one commit per tool is fine.
Before opening the PR: `npx vite build`, `npx oxlint` (0 errors) and `node --test tests/*.mjs` must pass (CI runs them too).
See `docs/codex-brief-more-pages.md` for routes, sitemap (`public/sitemap-static.xml`), search (`src/data/searchStatic.js`) and SEO components.

Why these three: Google Keyword Planner, Israel, Hebrew (Oct 2026) — monthly searches, low competition:
סטופר 9,900 · שעון עצר 6,600 · קוד QR / QR קוד / ברקוד QR / קוד לסריקה ≈14,000 · מחשבון אחוזים 22,200 · מחשבון הנחה 1,600 · מחשבון אחוזים הנחה 720 · חישוב אחוזים 480.
Look at the existing tools first and reuse their look and building blocks: `/tools/timer`, `/tools/countdown-timer`, `/tools/age-calculator` (find them in `src/App.jsx`), `SEO`, `SeoBody` + `faqSchema`, `Breadcrumbs`, `PrintPreview`, present/projection mode (`src/utils/presentMode.js`). The site already bundles the `qrcode` package (used in `src/components/ui/PrintPreview.jsx`) — use it, no new dependency.

## 1. Stopwatch — `/tools/stopwatch`
- H1/title around "סטופר אונליין — שעון עצר עם הקפות". Big digits (mm:ss.hh, hours when needed), Start/Stop, Lap, Reset; keyboard: Space = start/stop, L = lap, R = reset.
- Laps table (lap time + total), best/worst lap highlighted; copy laps; keeps running correctly when the tab is in the background (use `performance.now()` differences, not interval counting).
- Works in projection mode (huge digits for a classroom), and on phones (big buttons).
- Ideas section for kids/classes (races, "how long can you hold a note", reading speed) + FAQ.
- Link to/from `/tools/timer` and `/tools/countdown-timer` ("טיימר לספירה לאחור" vs "סטופר").

## 2. QR code maker — `/tools/qr-code`
- H1/title around "יצירת קוד QR בחינם — מחולל QR לקישור, טקסט ווואטסאפ".
- Types: link, plain text, WhatsApp message (phone + text → `https://wa.me/...`), Wi-Fi (SSID/password/encryption → `WIFI:` format), phone, email.
- Live preview; size and colour choice (keep enough contrast — warn if too light); download PNG and SVG; print (via `PrintPreview`: one large QR, or a sheet of 6/12 small labels with an optional caption).
- Everything runs in the browser: say on the page that nothing is sent to a server, and do NOT send the content to analytics. Do not add this page to `CREATOR_TOOLS` in `src/utils/creations.js` (Wi-Fi passwords/phones).
- Teacher/parent ideas: QR on a worksheet to an answer page, on a party invitation to the location, on a class door to a Google Form.

## 3. Percent calculator — `/tools/percent-calculator`
- H1/title around "מחשבון אחוזים — כמה זה X אחוז מ-Y, הנחה ושינוי באחוזים".
- Calculators on one page, each with its own inputs and a one-line worked explanation of the result (so it also teaches):
  X% of Y · X is what % of Y · percentage change from A to B · price after X% discount (and how much you saved) · price before discount · add/remove 18% VAT (keep the VAT rate in one constant).
- Rounding sensible (up to 2 decimals), Hebrew number formatting, works with commas/decimals typed by users.
- A short "how to calculate percentages" section for kids (grades 5–7) with 3 examples, linking to the percent topics in `/math` (grade 6/7 percent pages exist under `/math/grade-7/percent` etc.).

## For every tool
- Unique SEO title/description, 2–3 paragraphs + FAQ (`SeoBody`), add to sitemap, to `src/data/searchStatic.js` (Hebrew keys incl. the search phrases above), and to the tools area in `src/data/siteMenu.js` next to the timer.
- Unit tests for the pure logic (stopwatch formatting/laps, QR payload builders for each type, every percent formula incl. edge cases like 0 and negatives).
- Check in a browser on desktop and a 390px phone.
- In the PR description: what was built, screenshots if possible, and anything left out.

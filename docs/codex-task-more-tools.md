# Task for Codex: more free tools (round 2)

Repository `yos360/ugabuga`. Read `CLAUDE.md` first and follow it. Open **one Pull Request per group** below (3 PRs), so each can be reviewed and merged on its own.
Before each PR: `npx vite build`, `npx oxlint` (0 errors), `node --test tests/*.mjs` (CI runs them too). Check every page in a browser on desktop and on a 390px phone.
How pages, routes, sitemap, search and SEO fit together: `docs/codex-brief-more-pages.md`. Look at existing tools first and reuse their look and parts (`/tools/timer`, `/tools/age-calculator`, `/tools/gematria`, `SEO`, `SeoBody` + `faqSchema`, `Breadcrumbs`, `PrintPreview`, present mode). If `docs/codex-task-free-tools.md` (stopwatch / QR / percent calculator) is already merged, link the new tools to those where relevant.

Demand (Google Keyword Planner, Israel, Hebrew, Oct 2026, searches per month, competition low unless noted) is listed per tool — use these phrases naturally in titles, H1s, descriptions, FAQ and `src/data/searchStatic.js` keys.

Every tool: unique SEO title/description, 2–3 short paragraphs + FAQ, sitemap entry, search entry, a link from the tools area in `src/data/siteMenu.js` (and from related hubs named below), unit tests for all pure logic, no new heavy dependencies, nothing personal sent to a server or to analytics.

---

## PR A — health & learning calculators

### 1. BMI calculator — `/tools/bmi` (מחשבון BMI 18,100 · חישוב BMI 8,100 · מחשבון BMI ילדים 2,900 · נוער 390 · לפי גיל 720)
- Adults (20+): weight + height → BMI and the standard adult category.
- Children & teens (2–19): age (years + months) + sex + weight + height → BMI **percentile** and category. Adult cut-offs must NOT be used for children.
- Use an official public reference table and record it in `docs/bmi-sources.md`: the **CDC 2000 BMI-for-age LMS tables** (U.S. government, public domain) — store them as data in the repo (no runtime fetch), compute percentiles with the LMS method, and test against several values published by the CDC. If you can't get the official tables, build the adult calculator only and say so in the PR.
- Clear, gentle copy: it's an estimate, not a diagnosis; for children talk to the pediatrician / טיפת חלב; no "fat/thin" judgements, no weight-loss advice. Nothing is saved or sent.

### 2. Fraction calculator — `/tools/fraction-calculator` (מחשבון שברים 4,400)
- Add/subtract/multiply/divide fractions and mixed numbers; simplify; convert fraction ↔ decimal ↔ percent.
- Show the worked steps (common denominator, simplifying) in simple Hebrew, so it also teaches; link to the fraction topics in `/math` (grade 4–6) and `/printables/fractions-worksheets`.

### 3. Grade average — `/tools/grade-average` (מחשבון ממוצע 320 · מחשבון ציונים 320 · מחשבון ממוצע בגרויות 1,600 · מחשבון בגרויות 1,900)
- Simple average, and weighted average by units (יחידות לימוד) for bagrut subjects; add/remove rows; keep rows in localStorage.
- Do NOT implement university-specific "bonus" rules unless you can cite the official current rules; if not, say on the page that each institution computes bonuses differently and link nowhere specific.

## PR B — time & text tools

### 4. Hours calculator — `/tools/hours-calculator` (מחשבון שעות 2,400 · מחשבון שעות עבודה 2,400 · חישוב שעות 1,600 · שעות ודקות 390)
- Add/subtract times (hh:mm), time between two clock times (incl. past midnight), a small timesheet (rows of start/end/break → total hours, optional hourly rate → pay). No legal/tax claims.

### 5. Date calculator — `/tools/date-calculator` (מחשבון תאריכים 1,900 · חישוב ימים)
- Days/weeks/months between two dates (include/exclude end date), add/subtract days from a date, weekday of a date, and the Hebrew date (reuse the Hebrew-date code the site already has — see `/tools/hebrew-birthday` and `src/data/daysUntilContent.js`). Use Asia/Jerusalem dates, not UTC.

### 6. World clock — `/tools/world-clock` (שעון עולמי 1,900)
- Current time in Israel and in cities the user picks (via `Intl.DateTimeFormat` time zones), time difference, "what time will it be there when it's X here". Big display works in present mode.

### 7. Word counter — `/tools/word-count` (ספירת מילים 1,600)
- Words, characters with/without spaces, sentences, paragraphs, reading time; works for Hebrew (incl. nikud and geresh/gershayim) and English. Text stays in the browser.

## PR C — music & printables

### 8. Metronome — `/music/metronome` (מטרונום 12,100)
- 30–250 BPM, tap tempo, beats per bar with accented first beat, visual pulse; Web Audio scheduling (look-ahead scheduler, not `setInterval` clicks) so it stays in time. Reuse `src/music/audio.js`. Link from the music hub and `/music/piano`.

### 9. Guitar tuner — `/music/tuner` (טיונר 880 · טיונר לגיטרה 720 · טיונר אונליין 320)
- Microphone pitch detection (autocorrelation/YIN) with standard tuning E A D G B E and a needle/cents display; also a "play reference note" mode for devices without a mic. Ask for mic permission only after a button press, explain why, and process audio locally only. Note: `public/_headers` sets `Permissions-Policy: microphone=()` — allow `microphone=(self)` only for this page's path (add a path-specific rule), nowhere else.

### 10. Name labels — `/printables/name-labels` (מדבקות שם 2,400 · מדבקות שם לגן 1,600 · לבית ספר 480)
- Generator for printable name stickers/labels: child's name (+ optional class/phone line), choose a small picture/emoji theme and colours, several label sizes laid out on A4 for common sticker sheets (state the sizes in mm) and a "plain paper — cut out" layout. Use `PrintableShell`/`PrintPreview` (it already supports "how many pages").
- This is a personal tool: follow the existing personal-tool privacy rules (see `src/utils/creations.js`, `CREATOR_TOOLS`, and the note shown on creator pages) — phone numbers must never be sent anywhere.

---

In each PR description: what was built, sources used (BMI tables), screenshots if possible, and anything left out and why.

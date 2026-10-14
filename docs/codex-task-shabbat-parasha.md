# Task for Codex: Shabbat times by city + weekly Torah portion for kids

Repository `yos360/ugabuga`. Read `CLAUDE.md` first and follow it. **Two Pull Requests** (A and B), each reviewed separately.
Before each PR: `npx vite build`, `npx oxlint` (0 errors), `node --test tests/*.mjs`. Check pages on desktop and a 390px phone.
How pages/routes/sitemap/search/SEO fit together: `docs/codex-brief-more-pages.md`. Reuse the existing holiday/Shabbat pieces: `/holidays/blessings/shabbat` (`src/pages/holidays/HolidayBlessings.jsx`, `src/data/holidayBlessings.js`), Hebrew-date code used by `/tools/hebrew-birthday` and `src/data/daysUntilContent.js`, `SEO`, `SeoBody` + `faqSchema`, `PrintPreview`.

Demand — Google Keyword Planner, Israel, Hebrew, Oct 2026, searches/month, competition low:
כניסת שבת 673,000 · צאת השבת 246,000 · יציאת שבת 165,000 · כניסת שבת ירושלים 90,500 · הדלקת נרות שבת 60,500 · זמני כניסת שבת 33,100 · יציאת שבת היום 22,200 · כניסת שבת היום 14,800 · זמני שבת 9,900 · זמן שקיעה 8,100 ·
פרשת השבוע 60,500 · מה פרשת השבוע השבת 12,100 · פרשת השבוע היום 6,600 · מה פרשת השבוע 5,400 · פרשת השבוע לפי תאריך 3,600 · פרשת השבוע לילדים 1,000.

**Accuracy is the whole point.** Religious times and the weekly portion must be right; a wrong time is worse than no page. Everything below must be verified by tests against published values.

---

## PR A — Shabbat times by city (`/shabbat-times`, `/shabbat-times/:city`)

- Compute in the browser (and at build for the prerendered snapshot) — no runtime API dependency:
  - Sunset/nightfall from a standard published solar algorithm (e.g. the NOAA solar calculator equations, public domain) using each city's coordinates and elevation policy, `Asia/Jerusalem` time zone incl. DST.
  - Candle lighting = sunset − the city's customary offset (e.g. Jerusalem 40 min, Haifa 30 min, most other cities 20 or 18 min — **take the offset per city from an authoritative Israeli luach/rabbinate source and record it**); Shabbat end (צאת השבת) by a stated, sourced rule (e.g. sun 8.5° below the horizon) and optionally Rabbeinu Tam (72 min) as a second line.
  - Record every rule and source in `docs/shabbat-times-sources.md`.
- Cities: the ~30 largest Israeli cities + Jerusalem, Tel Aviv, Haifa, Be'er Sheva, Eilat, Tiberias, Safed, Modi'in, Bnei Brak, Petah Tikva, Netanya, Ashdod, Rishon LeZion, Holon, Ramat Gan, Rehovot, Herzliya, Kfar Saba, Ra'anana, Beit Shemesh, Ashkelon, Afula, Karmiel, Nahariya, Hadera, Ariel, Ma'ale Adumim, Kiryat Shmona, Dimona, Arad.
- `/shabbat-times`: this coming Shabbat for all cities in a table (candle lighting + Shabbat end), city search, the parasha name for this Shabbat (from PR B, or a simple placeholder if B isn't merged yet), link to the candle-lighting blessing page. `/shabbat-times/:city`: this Shabbat big, next 8 Shabbatot list, holidays (ערב חג) when they fall in range, printable monthly sheet for the fridge.
- The prerendered HTML must not show stale dates: render the computed values client-side on load (the snapshot can show the computation for the build week, but the page must recompute immediately in the browser; label the date clearly).
- **Tests:** for at least 5 cities × 6 dates across the year (incl. DST change weeks), compare candle lighting and Shabbat end with values published by an official Israeli source (rabbinate/luach); allowed difference ≤ 1 minute. List the reference values and source in the test file. If you cannot obtain official reference values in your environment, stop and say so in the PR instead of shipping.
- Copy: short explanation of why cities differ (Jerusalem 40 minutes etc.), what "צאת השבת" means, and a note to follow the local rabbi/community custom.

## PR B — Weekly Torah portion for kids (`/parasha`, `/parasha/:slug`)

- **Which parasha is this week (in Israel)**: compute from the Hebrew calendar for Israel (not diaspora — the readings differ in some years), incl. combined portions and holiday weeks. Tests: compare the computed parasha for every Shabbat of at least two full Hebrew years against a published Israeli calendar; record the source.
- 54 pages, one per parasha (`/parasha/bereshit` …): the name, book, a kid-friendly summary (3–6 short paragraphs written for ages 6–12, faithful to the text, no midrash presented as text), 5 questions with answers, one "talk about it at the Shabbat table" question, a printable sheet (summary + questions) via `PrintPreview`, and links to the previous/next parasha.
- Source for summaries: the biblical text itself (public domain) — link each parasha to its text on Sefaria. Write original summaries; do not copy copyrighted commentaries or children's books.
- `/parasha`: "פרשת השבוע השבת: X" at the top (computed, updates in the browser), the list by book, and links to Shabbat times (PR A).
- Add to sitemap, search (`src/data/searchStatic.js`), the holidays/family area of `src/data/siteMenu.js`, and link from `/holidays/blessings/shabbat`.

In each PR description: what was built, sources, test reference values, and anything left out.

# Booklets backlog — /booklets

A daily scheduled task builds the **next two unchecked booklets** from this list, top to bottom, and ticks them.
Order = Google Keyword Planner (Israel, Hebrew, average monthly searches, pulled 2026-10-27), with seasonal
booklets moved up while their season is close. Volumes are Google's rounded buckets — use them to compare, not as forecasts.

How to add a booklet (see `src/booklets/registry.js` and the two existing booklets):
1. A module `src/booklets/<name>.jsx` built from `src/booklets/kit.jsx` (TracePage, MatchPage, ChoicePage, WritePage,
   FillPage, WordSearchPage, MotorPage, ImagePage, AnswerKey, Cover, Certificate). Reuse the site's own data
   (englishWords, parasha, math generators, reading passages, coloring) — never copy content from other sites.
2. A registry entry: slug, title, seoTitle (main keyword first + "להדפסה" / "PDF"), description (80–220 chars),
   pages (10–16, unique), intro, 3 paragraphs, 3 FAQ, 3 related links to existing pages, `load`.
3. `/booklets/<slug>` in `public/sitemap-static.xml` and in `src/data/searchStatic.js`.
4. Facts checked, Israeli names only, answers in an answer-key page when a page has one right answer.
`tests/booklets.test.mjs` fails if any of these is missing.

## Done
- [x] `english-grade-3` — חוברת אנגלית לכיתה ג׳ (390/mo: "חוברות אנגלית לכיתה ג") — 2026-10-27
- [x] `kindergarten` — חוברת עבודה לגן חובה (140/mo: "חוברות עבודה לגן חובה להדפסה") — 2026-10-27

## Next (top first)
- [ ] `hanukkah` — חוברת עבודה לחנוכה (20/mo, competition 0; Hanukkah starts 4.12.2026 — build first). Reuse src/data/hanukkah.js (quiz facts), coloring 'sufganiyah', dreidel counting, candles math (1+2+…), word search in Hebrew.
- [ ] `role-models` — חוברת דמויות מופת ישראליות לכיתות א׳–ב׳: 12 דמויות (למשל דוד בן־גוריון, אליעזר בן־יהודה, עדה יונת, אילן רמון, יעל ארד, נעמי שמר, ירדנה ארזי? — choose only people with well-documented public lives), a short pointed text each, comprehension questions, matching page, certificate. Use a symbol per field (no portraits of real people). Check every fact against two sources.
- [ ] `yard-animals` — "מי גר בחצר?" מגדיר חיות קטנות לגן: 12 small animals (נמלה, חילזון, פרת משה רבנו, דבורה, פרפר, תולעת אדמה, חיפושית, עכביש, שממית, ציפור דרור, חרגול, זבוב) — a riddle card each ("יש לי 8 רגליים…"), a picture from the word bank's print art where it exists, and a "מצאתי!" checklist for a yard walk. Facts checked.
- [ ] `age-4` — חוברת עבודה לגיל 4 להדפסה (110/mo). Easier than kindergarten: big shapes, colors, counting to 5, motor age '3-4'/'4-5'.
- [ ] `math-grade-2` — חוברת חשבון לכיתה ב׳ (110/mo). Addition/subtraction to 100, place value, multiplication intro, clock, money, word problems + answer key.
- [ ] `spelling` — חוברת שגיאות כתיב (90/mo). Common Hebrew spelling confusions (א/ע, ט/ת, כ/ח, ס/ש, ק/כ, ו/ב) — fill the missing letter, find the mistake; answer key.
- [ ] `grade-7-prep` — חוברת הכנה לכיתה ז׳ (70/mo). Math (fractions, decimals, percent, order of operations) + reading comprehension (grade 6–7 passages) + answer key.
- [ ] `age-3` — חוברת עבודה לגיל 3 (50/mo). Coloring, big tracing lines, matching pairs, more/less, colors.
- [ ] `bereshit` — חוברת עבודה לספר בראשית (50/mo). Parashot of Bereshit from src/data/parasha: questions, sequencing, matching characters, word search; answer key.
- [ ] `grade-2-prep` — חוברת הכנה לכיתה ב׳ (50/mo). Reading, writing, math to 20/100, clock.
- [ ] `age-5` — חוברת עבודה לגיל 5 (30/mo).
- [ ] `english-grade-4` — חוברת עבודה באנגלית לכיתה ד׳ (10/mo, plus "חוברות עבודה באנגלית" 30/mo).
- [ ] `english-grade-5` — חוברת עבודה באנגלית לכיתה ה׳ (20/mo).
- [ ] `math-grade-3` — חוברת עבודה בחשבון לכיתה ג׳ (20/mo).
- [ ] `hebrew-grade-1` — חוברת עבודה בעברית לכיתה א׳ (10/mo, + "חוברות עבודה לכיתה א" 110/mo).
- [ ] `english-grade-7` — חוברת עבודה באנגלית לכיתה ז׳ (20/mo).
- [ ] `english-grade-8` — חוברת עבודה באנגלית לכיתה ח׳ (20/mo).
- [ ] `math-grade-4` — חוברת עבודה בחשבון לכיתה ד׳ (10/mo).
- [ ] `math-grade-5` — חוברת עבודה בחשבון לכיתה ה׳ (10/mo).
- [ ] `math-grade-6` — חוברת עבודה בחשבון לכיתה ו׳ (10/mo).
- [ ] `reading-grade-3` — חוברת עבודה בהבנת הנקרא כיתה ג׳ (10/mo). Passages from src/learn/readingGrades*.
- [ ] `hebrew-grade-2` — חוברת עבודה בעברית לכיתה ב׳ (10/mo).
- [ ] `shemot` — חוברת עבודה לספר שמות (10/mo).
- [ ] `new-immigrants` — חוברת עבודה לעולים חדשים (10/mo). First Hebrew words with English/Russian-free pictures.
- [ ] `tu-bishvat` — חוברת עבודה לט״ו בשבט (seasonal: Tu BiShvat 23.1.2027 — build in early January).
- [ ] `purim` — חוברת עבודה לפורים (seasonal: Purim 23.3.2027 — build in late February).
- [ ] `pesach` — חוברת עבודה לפסח (seasonal: Pesach 22.4.2027 — build in late March).
- [ ] `summer-grade-1` … `summer-grade-6` — חוברת קיץ למסיימי כיתה א׳–ו׳ (seasonal, ~10/mo each, peaks June–July — build in May).

When this list runs out, pull fresh ideas from Keyword Planner (Windsor.ai, google_ads, seeds "חוברת עבודה …",
geo 2376, language 1027) and add them here before building.

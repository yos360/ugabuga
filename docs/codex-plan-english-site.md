# תוכנית: האתר באנגלית — מה בונים, באיזה סדר ולמה

> **לבעל האתר, בקצרה:** לא מתחרים על "coloring pages" מול ענקים. בונים את מה שאין לאחרים: עברית וחגים יהודיים למשפחות דוברות אנגלית (כ־6–7 מיליון יהודים במדינות דוברות אנגלית, ועוד לומדי עברית). כל חג נבנה כ־6–8 שבועות לפניו, כדי שגוגל יספיק להכיר את הדפים. בין החגים — דפים שמחפשים כל השנה (אלף־בית, שבת, בר/בת מצווה). כל שלב הוא Pull Request נפרד ש־Codex מגיש, ואתה מאשר.

---

## For Codex: how to work on this plan

Repository `yos360/ugabuga`, branch `main`. Read `AGENTS.md`, `CLAUDE.md` and the "Rules (must follow)" section of `docs/codex-brief-more-pages.md` first. Answer the owner in Hebrew; code, comments and commits may be English.

**One phase = one Pull Request.** Do the phases in the order of the calendar below (the next holiday first), unless the owner asks otherwise.

### The pattern to copy

The Hanukkah guides (shipped) are the model for every holiday phase:

- Page code: `src/en/EnglishHanukkah.jsx`; plain data (importable in Node): `src/en/hanukkahGuides.js`; tests: `tests/hanukkah-en.test.mjs`.
- Routes in `src/App.jsx` next to `/en/jewish-holidays/hanukkah/:guide`.
- Each guide page is added to `ENGLISH_PAGES` (`src/en/englishRoutes.js`) with a Hebrew `counterpart` that exists in `public/sitemap-static.xml`, or an `unpairedReason`. Each counterpart may be used by one English page only.
- URLs go into `public/sitemap-static.xml` (right after the holiday's main page); then run `node scripts/generate-english-nav.mjs` and `node scripts/generate-llms.mjs`, and add the guides to the English section of `scripts/generate-llms.mjs`.
- The holiday's main English page (`src/en/EnglishHolidays.jsx`) links to its guides (see `HanukkahGuideCards`).
- Hebrew texts of blessings come only from `src/data/holidayBlessings.js` (checked). Never write Hebrew prayer text from memory.

### Hard rules for English content

- Written for an English-speaking parent or teacher who may not read Hebrew: explain terms, give transliteration, keep it warm and practical. No word-for-word translation of Hebrew pages.
- Every page is useful on its own: something to print, play or follow step by step. No thin pages. Each has its own `<h1>`, title, description (≤165 chars), FAQ (3–5 real questions people search) and a print or play element.
- Facts: dates come from `src/en/holidayDates.js` (never hard-coded). When customs differ (Ashkenazi/Sephardi, Israel/diaspora), say so briefly. Legends are labelled as legends.
- Safety notes where relevant (candles, cooking, cutting).
- Checks before the PR: `npx vite build`, `npx oxlint` (0 errors), `node --test tests/*.mjs`. Check the new pages in a browser at 390px and desktop width (Playwright: `executablePath: '/opt/pw-browsers/chromium'`).

---

## The calendar (build each phase 6–8 weeks before the holiday)

| # | Phase | Holiday date (diaspora) | Start building by |
|---|---|---|---|
| ✅ | Hanukkah guides (dreidel, candle lighting, activities) | 4 Dec 2026 | done |
| 1 | Tu BiShvat | 22 Jan 2027 | **now – early Dec 2026** |
| 2 | Purim | 22 Mar 2027 | early Feb 2027 |
| 3 | Passover | 21 Apr 2027 | early Mar 2027 |
| 4 | Shavuot + Lag BaOmer | 24 May / 10 Jun 2027 | early Apr 2027 |
| 5 | High Holidays (Rosh Hashanah, Yom Kippur, Sukkot) | 1–15 Oct 2027 | mid Aug 2027 |

Between holiday phases, work on the evergreen phases (A–D) below.

### Phase 1 — Tu BiShvat
- `seven-species` — the seven species for kids: what each is, a picture card to print, a matching game.
- `tu-bishvat-seder` — a simple family Tu BiShvat seder: the order (four cups, fruit groups), the fruit blessings from `holidayBlessings.js`, a printable one-page guide.
- `activities` — 10–12 ideas (plant a seed, tree rubbings, fruit tasting, a tree coloring page…).

### Phase 2 — Purim
- `megillah-story` — the Purim story for kids in 8 short scenes, with a printable mini-book.
- `mishloach-manot` — what it is, ideas, printable gift tags and a note card.
- `costumes-and-activities` — costume ideas, the noisemaker (gragger) craft, a Purim party game list, mask coloring links.

### Phase 3 — Passover
- `seder-for-kids` — the 15 steps of the seder in plain English, a printable kids' seder plate and step cards.
- `four-questions` — Ma Nishtana: Hebrew (from a checked source), transliteration, English, and a practice sheet.
- `afikoman-and-activities` — afikoman hunt ideas, the ten plagues activities, frog and matzah crafts.

### Phase 4 — Shavuot and Lag BaOmer
- `shavuot` guides: the Ten Commandments for kids (simple), dairy recipes kids can help with, first-fruits basket craft.
- `lag-baomer` guide: bonfire safety, bow-and-arrow craft, outdoor games.

### Phase 5 — High Holidays
- `rosh-hashanah/symbolic-foods` (simanim, apples and honey, printable placemats), `rosh-hashanah/shofar` (the four sounds, a listening game).
- `yom-kippur/for-kids` — saying sorry, a gentle explanation, an "apology card" printable.
- `sukkot/build-and-decorate` — sukkah decorations to print, the four species explained, ushpizin.

---

## Evergreen phases (searched all year — do these between holidays)

### Phase A — Hebrew alphabet deeper (biggest search demand)
Existing: `/en/hebrew-alphabet` (27 pages). Add:
- Printable aleph-bet tracing worksheets (print and cursive), one per letter plus a full-alphabet sheet.
- Hebrew vowels (nikkud) for beginners, with a reading-practice sheet.
- "Write your name in Hebrew" tool (type an English name → suggested Hebrew spelling, printable name card). Mark spellings as suggestions.
- Hebrew numbers 1–10 and colors, with flashcards to print.

### Phase B — Shabbat for families
- `shabbat/blessings` — candles, kiddush (grape juice), challah, with Hebrew from `holidayBlessings.js`, transliteration and English.
- `shabbat/activities` — a Shabbat table checklist, conversation cards, a challah-cover coloring page.

### Phase C — Bar and Bat Mitzvah
- Party game ideas and printable guest activities (link the existing birthday tools), a "mitzvah project ideas" list, a Torah-portion lookup by birth date (dates from the Hebrew calendar code, clearly marked as a guide to check with the rabbi).

### Phase D — Hebrew school and Jewish day school teachers
- An English landing page for teachers: Buga Live quiz in English, holiday printables by grade, alphabet worksheets — one place to send a teacher.
- When homework (Hebrew) is proven, consider an English version of the interactive homework.

---

## When the new domain is connected (ugabugakids.com)

The owner bought or will buy `ugabugakids.com` for the English site. Do this as its own PR, only after the owner confirms the domain is attached to the Cloudflare Pages project:

- `functions/_middleware.js`: `ugabugakids.com/` → 301 to `ugabugakids.com/en`; `ugabugakids.com/<non-/en path>` → 301 to `ugabuga.co.il/<same path>`; `ugabuga.co.il/en/...` → 301 to `ugabugakids.com/en/...`.
- `SEO.jsx`: canonical and hreflang `en` URLs use `https://ugabugakids.com`; Hebrew stays on `ugabuga.co.il`. Update `tests/english-i18n.test.mjs` accordingly.
- A separate English sitemap served on the new domain; update `llms.txt` English links.
- Tell the owner to add the new domain to Google Search Console and Bing Webmaster Tools.

## Measuring

- The owner's private analytics page already has an English section (`src/utils/ownerEnglish.js`). After each phase, report to the owner: English visits per week, top English pages and sources (Google, Bing, ChatGPT).
- Phase is "working" when its pages get impressions in Search Console within ~4 weeks. If a phase gets nothing after 8 weeks, tell the owner before building more of the same kind.

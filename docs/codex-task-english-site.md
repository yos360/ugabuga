# Task: an English version of ugabuga.co.il (same site, under `/en/`)

Repository: `yos360/ugabuga` (branch `main`). Read `CLAUDE.md` first and follow it (Hebrew answers to the owner; code comments/commits may be English). Same rules as `docs/codex-brief-more-pages.md` → "Rules (must follow)": build/lint/tests before every commit, one Pull Request per part, reuse existing components (`SEO`, `SeoBody`, `faqSchema`, `Breadcrumbs`, `PrintPreview`, `PrintableShell`), check pages in a browser on desktop and a 390px phone.

The owner wants **this same site** to serve both Hebrew and English. Hebrew stays exactly as it is at the root (`/...`). English lives under **`/en/...`** (left-to-right). The existing `/english` section (English lessons for Hebrew-speaking kids) is a different thing — do not touch or move it.

## Why and what (keyword data, US only, avg monthly searches)
| Query | Searches |
|---|---|
| hebrew alphabet / aleph bet (all variants) | 49,500 |
| hebrew letters | 12,100 |
| hebrew writing | 3,600 |
| hanukkah coloring pages | 2,900 |
| hebrew cursive | 2,400 |
| first letter of hebrew alphabet | 1,900 |
| hebrew alphabet meaning of letters | 1,600 |
| passover coloring pages | 1,300 |
| coloring pages (generic — huge competition, later) | 550,000 |
| word search printable (later) | 49,500 |

The domain is `.co.il`, which Google treats as Israel-targeted, so generic English queries ("coloring pages") will be very hard. Start where the site is **unique**: Hebrew letters and Jewish holidays for English-speaking families and Jewish schools abroad. Generic content comes only after these work.

## Hard rules for English pages
- **Written English, not word-for-word machine translation.** Every page needs its own `<h1>`, title, description (≤165 chars), 2–3 paragraphs and FAQ written for an English-speaking parent/teacher (explain things an Israeli wouldn't need explained, e.g. what nikud is, how to pronounce each letter in English transliteration).
- Do not create an English page that is a thin copy of another. If a Hebrew page has no useful English equivalent, don't make one.
- **Hebrew pages must not change** (same titles, URLs, HTML, `lang="he"`), except for adding an `hreflang` link where an English equivalent exists. Do not add English pages to the Hebrew menu; add one small "English" link in the footer only.
- No copyrighted characters, song lyrics or trademarks.

## PR 1 — infrastructure + English home
- Routes under `/en` in `src/App.jsx` (static routes before param routes). An English layout (or `Layout` with a `lang` prop): `dir="ltr"`, English navbar/footer text, English-friendly font stack, no Hebrew-only widgets (live activity banner, WhatsApp texts in Hebrew, etc. — translate or hide them).
- `<html lang>` and `dir` must be correct **in the prerendered HTML** (`react-helmet-async` `htmlAttributes`), not only after JS runs — check `dist/en/.../index.html` after prerender.
- `SEO.jsx`: support `lang="en"`: `og:locale` `en_US`, `inLanguage: 'en'`, English site name in schema, and `<link rel="alternate" hreflang="he|en|x-default">` **only** between true equivalents (pass the counterpart path explicitly; x-default = the Hebrew page). Keep `tests/` passing (see `seo-limits` test — keep `ORGANIZATION` above `TITLE_MAX`).
- `PrintPreview` / PDF: make sure LTR pages print correctly (direction, alignment, toolbar labels in English).
- Sitemap: add all `/en/` URLs (with `xhtml:link` hreflang alternates if easy), `functions/_middleware.js` `CLOSED_FAMILIES` for any new param family, `scripts/generate-llms.mjs`: an "English" section in `llms.txt`.
- `/en` home: short intro of the site in English + cards to the English sections (only sections that exist).
- Add a test in `tests/` that every `/en/` route has `lang="en"`, an English title and an hreflang pair that points back correctly.

## PR 2 — Hebrew alphabet for English speakers (`/en/hebrew-alphabet/...`)
Reuse the existing letter data, songs, fonts and print sheets (`src/pages/letters/*`, `src/data/letterSkills.js`, `public/fonts/ktav-yad.woff2`, `stam.woff2`).
- Hub `/en/hebrew-alphabet`: chart of all 22 letters + 5 final forms with name, English transliteration, sound, numeric value (gematria), printable chart (A4).
- One page per letter (`/en/hebrew-alphabet/aleph` … `tav`, 22 pages): big letter (print/cursive/Torah script), pronunciation (play the existing audio where it exists), how to write it (stroke order if data exists — don't invent), 3–4 example words with English meaning, the letter's numeric value, a tracing worksheet to print, a "what does the letter mean" paragraph (only well-known, verifiable facts).
- `/en/hebrew-alphabet/cursive` (Hebrew cursive chart + practice), `/en/hebrew-alphabet/final-letters`, `/en/hebrew-alphabet/vowels` (nikud explained for beginners), `/en/hebrew-alphabet/song` (the aleph-bet song page, English instructions).
- A short quiz/game: hear or see a letter → pick its name.
- hreflang between each English page and its Hebrew counterpart where one exists (e.g. `/letters/cursive` ↔ `/en/hebrew-alphabet/cursive`).

## PR 3 — Jewish holidays for kids in English (`/en/jewish-holidays/...`)
Reuse the holiday data/pages and coloring drawings that already exist (`src/data/holidayBlessings.js`, `src/pages/holidays/*`, coloring subjects for holidays in `src/data/coloringSubjects.js` / `coloringDrawings.js`).
- Hub + one page per holiday: Rosh Hashanah, Yom Kippur, Sukkot, Simchat Torah, Hanukkah, Tu BiShvat, Purim, Passover, Lag BaOmer, Shavuot, Shabbat.
- Each page: what the holiday is (for kids, in English), this year's and next year's dates (computed with the Hebrew calendar code already in the repo — do not hard-code), the existing coloring pages for that holiday with English titles, printable activity (word search / matching with English words + Hebrew word), blessings in Hebrew with English transliteration and translation (only the standard, well-known blessings).
- English page per coloring drawing **only** for holiday drawings (e.g. `/en/coloring/hanukkah/3`), with its own English name/description stored in data — not generated from the number.

## Later (not in this task)
Generic English content (coloring pages for all subjects, math worksheets, mazes, word search, flags) — only after PR 2–3 show traffic in Search Console. The owner will ask separately.

## When finished
Short summary in Hebrew for the owner: how many English pages were added, the URLs to check, anything skipped and why. Remind the owner to submit the sitemap again in Google Search Console and Bing Webmaster.

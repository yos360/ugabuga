# Task: Hebrew emoji library + Israeli & Jewish icons (`/emoji`)

Repository: `yos360/ugabuga` (branch `main`). Read `CLAUDE.md` first and follow it (Hebrew answers to the owner; code comments/commits may be English). Same rules as `docs/codex-brief-more-pages.md` → "Rules (must follow)": build/lint/tests before every commit, one Pull Request per part, reuse existing components (`SEO`, `SeoBody`, `faqSchema`, `Breadcrumbs`, `PrintPreview`), check pages in a browser on desktop and a 390px phone.

The existing `/tools/emoji-studio` (guess songs/movies from emoji) is a different thing — keep it, and link to it from the new hub.

## Keyword data (Israel, Hebrew, avg monthly searches)
| Query | Searches |
|---|---|
| אימוג׳י / אימוג׳ים | 9,900 |
| סמיילים | 8,100 |
| אייקונים | 720 |
| תמונה של סמיילים | 210 |
| סמלים להעתקה | 210 |
| אימוג׳י וואטסאפ להורדה | 170 |
| אייקונים להורדה | 140 |
| אימוג׳י מחייך / קקי | 140 each |
| סמיילים במקלדת | 110 |
| דגל ישראל אימוג׳י | 110 |
| סמיילי להעתקה | 90 |
| סמלים יהודיים | 70 |

## PR 1 — Hebrew emoji library (copy with one tap)
- Hub `/emoji` — "אימוג׳י וסמיילים להעתקה — כל האימוג׳ים בעברית": search box **in Hebrew** (e.g. "לב", "עוגה", "דגל", "בוכה"), category tabs, tap an emoji → copied to clipboard with a small "הועתק!" toast, a "recently copied" row (localStorage, wrapped in try/catch), skin-tone picker where relevant.
- Data: the full standard Unicode emoji list (latest version supported by current iOS/Android). Hebrew names and search keywords **from Unicode CLDR Hebrew annotations** (`cldr-annotations-full`, `he`; Unicode license — note it in a `docs/emoji-sources.md`). Do not invent names. Put the data in a static JSON in `public/data/` loaded lazily, so it does not grow the main bundle.
- Show emoji with the device's own font (do **not** ship Apple/Samsung emoji images — they are copyrighted).
- Category pages (~9, e.g. `/emoji/faces`, `/emoji/hearts`, `/emoji/animals`, `/emoji/food`, `/emoji/flags`, …) each with its own short intro + FAQ.
- **"Emoji for every situation"** pages (~20), each with ready-made combinations and short Hebrew greetings to copy in one tap, written for that situation: יום הולדת, מזל טוב ללידה, בר/בת מצווה, חתונה, שבת שלום, חג שמח (one page per major holiday: ראש השנה, סוכות, חנוכה, פורים, פסח, שבועות, יום העצמאות), בהצלחה במבחן, החלמה מהירה, תודה למורה/לגננת, סוף שנה, קבוצת הורים בגן/בכיתה, ספורט/ניצחון, אהבה. Link from each relevant existing page (greetings, holidays, birthday) to its emoji page and back.
- Also a short "סמלים להעתקה" section: special characters people can't find on the keyboard (♥ ★ ✓ → ₪ © ™ ° ½ « » and Hebrew-specific marks like ׳ ״ ־ ₪ and nikud), each copyable.

## PR 2 — Israeli & Jewish icons that phones don't have (`/emoji/israeli`)
Phones have only a few (🇮🇱 🕎 ✡️ 🪬 🧆 🕍). Create **original** icons in the same cheerful emoji-like style, ~40–60 of them, for example: סביבון, סופגנייה, נרות שבת, חלה, כיפה, שופר, ספר תורה, תפוח בדבש, רימון, סוכה, לולב ואתרוג, מגילת אסתר, רעשן, משלוח מנות, מצה, קערת סדר, כוס אליהו, ביכורים, מדורת ל״ג בעומר, דגל ישראל בנפנוף, מנגל של יום העצמאות, פלאפל בפיתה, שקשוקה, חטיף בוטנים, ארטיק, מטקות, שקית חלב… (no brands, logos or real people).
- Each icon: hand-made SVG (original, CC0, like `public/signs/*.svg`), stored in `public/icons/israeli/`. Record creator + license in data, like `src/signs/signsData.js`.
- On the page: tap → download as **PNG 512×512 with transparent background**, and **WebP 512×512** (the size WhatsApp accepts for stickers). Explain in Hebrew, step by step, how to turn it into a WhatsApp sticker (WhatsApp Web/desktop "create sticker" → upload) and how to send as an image. On phones with `navigator.share` + file support, offer "שיתוף" of the PNG.
- Group by holiday/theme; each holiday page from PR 1 shows its Israeli icons too.
- Printable sheet of all icons (stickers/labels for kids, `PrintPreview`) and a coloring version (outlines only) — reuse the existing print flow.

## SEO / routes
- Routes in `src/App.jsx` (static before param), sitemap entries for every page, `CLOSED_FAMILIES` regex for any `/emoji/:slug` family, search entries in `src/data/searchStatic.js`, one menu link only (under tools), `llms.txt` via `scripts/generate-llms.mjs` if it picks menu items up automatically.
- Do **not** create a page per single emoji (thousands of thin pages).
- Tests in `tests/`: every emoji in the data has a Hebrew name; every situation page has unique title/description; every icon file exists and has a license entry.

## When finished
Short summary in Hebrew for the owner: pages added, how many icons, URLs to check, anything skipped and why.

# Task: recipes (Shabbat, kids, cooking with kids) + Shabbat activities prepared in advance

Repository `yos360/ugabuga` (branch `main`). Read `CLAUDE.md` first and follow it (answer the owner in Hebrew; code comments/commits may be English). Rules from `docs/codex-brief-more-pages.md` → "Rules (must follow)" apply. **Two parts, each its own Pull Request** (or, if you can push to `main`, one push per part after all checks pass — every push to `main` triggers a ~15-minute Cloudflare build).

## What already exists — extend it, don't duplicate
- Birthday cakes: `/cakes` + `/cakes/:slug` (`src/pages/cakes/Cakes.jsx`, data `src/data/cakes.js` — 14 items, `recipeSchema()` for schema.org Recipe, print, scaling `SCALES`, allergens, kosher label).
- Kids recipes: `/food/kids-recipes` + `/food/kids-recipes/:slug` (`src/family/FoodPages.jsx`, data `src/family/kidsKitchen.js` — 12 items).
- Shabbat: `/shabbat-times` (+172 city pages), `/parasha`, `/holidays/blessings/shabbat`. Eretz-Ir game: `/tools/eretz-ir` (`src/pages/tools/EretzIr.jsx`). Riddles `/tools/riddles`, trivia, memory-game printables.
Reuse these components and data shapes (same recipe card, same print flow, same `recipeSchema`). A new recipe goes into the matching existing collection unless it clearly belongs to the new Shabbat collection below.

## Keyword data (Israel, Hebrew, searches/month, avg CPC ₪)
מתכון לפנקייק 49,500 · עוגיות שוקולד צ׳יפס 49,500 · עוגת שוקולד 40,500 · עוגת גבינה 14,800 · עוגיות חמאה 12,100 · עוגת שוקולד פרווה 12,100 · עוגת יום הולדת 9,900 · עוגיות בחושות 9,900 · עוגת שישי 9,900 · עוגות תפוחים בחושות 8,100 · חלה 6,600 · מתכונים לשבת 4,400 · מתכון לחלה 4,400 · עוגה לשבת 3,600 · עוגה בחושה קלה 2,900 · עוגת שוקולד פשוטה לילדים 2,400 · עוגיות חמאה לילדים 1,900 · חלות לשבת 1,900 · עוגת יום הולדת לילדים 1,300 · עוגיות לשבת 1,300 · מתכונים לילדים 1,000.
Big generic terms are dominated by large food sites — our angle is **kids, printing, Shabbat**, not a generic recipe site.

## Part 1 — 30 new recipes + printable recipe cards
Three groups (≈10 each):
1. **לשבת** — new collection `/recipes/shabbat` (hub) + pages: חלה (classic, sweet, whole-wheat, braiding guide with 3/4/6 strands as printable steps), עוגת שישי (marble/orange/chocolate parve), עוגיות לשבת, עוגת תפוחים בחושה, kugel-style dish kids can help with. Mark parve/dairy clearly.
2. **עוגות ועוגיות לילדים** — into `/cakes` or `/food/kids-recipes` as fits: עוגיות שוקולד צ׳יפס, עוגיות חמאה לילדים, עוגה בחושה קלה, עוגת שוקולד פשוטה לילדים, פנקייק (if not duplicate of existing `pancakes` — improve it instead), מאפינס, עוגת גבינה קלה.
3. **מבשלים עם ילדים** — simple recipes where **each step is marked 🧒 "הילד/ה עושה" or 🧑 "מבוגר עושה"** (oven, knife, hot pan = adult only), with age suitability.

Each recipe page:
- Exact quantities in standard Israeli measures (grams + cups/spoons), pan size, oven temperature, time, servings, scaling (reuse `SCALES`), allergens, parve/dairy/meat label.
- **Recipes must be classic, well-known formulations with standard proportions** — do not invent unusual ratios. Sanity-check each: flour/liquid/fat/sugar/egg ratios within normal ranges for that kind of bake, baking times/temperatures typical. Add a test that every recipe has quantities, units, temperature (if baked), time and at least 3 steps.
- 2–3 paragraphs + FAQ written for that recipe (substitutions, making it parve, storing), unique title/description (≤165 chars), schema.org `Recipe` via `recipeSchema`.
- **Printable recipe card** (A4 and half-A4, `PrintPreview`, copies selector) with ingredients checklist and numbered steps; for "cooking with kids" the 🧒/🧑 marks print too.
- Images: no fake photos of food. Use the site's illustration style (simple SVG/emoji-style illustration) or leave the image out.
- Links: from `/shabbat-times` and every city page add one small block "מתכונים לשבת" (3 links) — this is important: thousands of Shabbat-times visitors. From `/parasha` link to the Shabbat activities (Part 2). Recipes link to related recipes and to the birthday area where relevant.
- Sitemap, `CLOSED_FAMILIES` for any new param family, search entries (`src/data/searchStatic.js`), menu: one link under the existing food/family area.

## Part 2 — Shabbat activities prepared in advance (`/shabbat-activities`)
For Shabbat-observant families: **everything is printed and cut before Shabbat; nothing on Shabbat requires writing, cutting, coloring, gluing, electricity or a screen.** Say this clearly on the page, and add: "יש משפחות שנוהגות אחרת במשחקים מסוימים — בדקו לפי מנהג המשפחה" (do not issue halachic rulings).
- **ארץ עיר בעל־פה** — printable letter cards (22 letters, cut before Shabbat) + category cards (ארץ, עיר, חי, צומח, דומם, שם, מקצוע, מאכל…); players answer **aloud**, scoring by counting points with tokens (no writing). Explain the rules. Link to the online `/tools/eretz-ir` for weekdays.
- **חידון לשולחן שבת** — printable question cards by age (4–6, 7–9, 10–12, family), including a weekly set based on **this week's parasha** (reuse the parasha data/questions; the page shows the current parasha and its cards).
- **"מי אני?"** cards (animals, professions, Bible figures — only well-known, child-appropriate), **חידות** cards (reuse riddles data), **memory/pairs** cards, **"20 שאלות"**, **story-chain** starter cards, **"מה חסר בתמונה"** picture cards.
- A **"חבילת שבת"** button: one print job with a ready mix for the coming Shabbat (≈4–6 A4 pages: quiz cards for this week's parasha + ארץ עיר cards + riddles + מי אני), with cut lines; copies selector.
- Each activity: its own page with how to play, ages, number of players, time, FAQ; unique title/description.
- Keyword volume here is small (משחקים לשבת 170, פעילויות לשבת 170, ארץ עיר 3,600, משחק ארץ עיר 720) — the value is the Shabbat-times audience: link the "חבילת שבת" from `/shabbat-times` and city pages ("הכנה לשבת: חבילת משחקים להדפסה") and from `/parasha`.

## Checks
`npx vite build`, `npx oxlint` (0 errors), `node --test tests/*.mjs` — all pass. Browser check on desktop and a 390px phone: pages, print previews (A4, nothing cut, copies 1→2 doubles sheets), PDF download for 5 recipes and the "חבילת שבת". Run `scripts/audit/crawl.mjs` with `AUDIT_FILTER` on the new URLs.

## When finished
Short summary in Hebrew: how many recipes/pages/activities were added, URLs to check, anything skipped and why.

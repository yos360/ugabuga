# Thin-content audit: /time-tunnel and /baby-names (2026-10-11)

This audit only measures and recommends. Nothing was deleted or set to noindex.

## How it was measured

- Every page in both sections was rendered with Playwright from the production build. For each section, 20 pages were sampled at random (seed 11).
- **Template text**: a line counts as template if, after the page's own date or name and all digits are masked, it appears on at least 30% of the section's pages.
- **Page-exclusive words**: words in lines that appear on that one page only. This is a strict measure of unique, useful content.
- **Near-duplicates**: Jaccard similarity of 5-word shingles for all 190 pairs in the sample, with site-wide chrome removed.
- **GSC**: page-level impressions for the last 3 months.

## /time-tunnel: 366 day pages + hub

| Metric | Value |
|---|---|
| Median words per page | 415 |
| Page-exclusive words (median / min / max) | 178 / 116 / 237 |
| Share of text that is not template | 53% |
| Near-duplicate similarity (mean / max) | 0.13 / 0.33. No pair above 0.5. |
| GSC, 3 months | **165 of 366 day pages have impressions**: about 480 impressions and 7 clicks. Average positions are about 3–10 for queries like "מה יש ב 3 באוקטובר", "11 בנובמבר" and "22 באוקטובר". |

Each page has real facts for its date: game questions, special days, sourced events, the Hebrew date, the weekday and an FAQ. These are not doorway pages.

**Recommendation: KEEP all 366.** This is the best-performing section in the area. Two cheap improvements:

1. On dates that currently have fewer than 3 dated events, add 2–3 more sourced events. The thinnest page in the sample had 116 exclusive words.
2. Do not merge these into month pages. Searchers type a specific date, and the per-day URLs already rank for those dates.

## /baby-names: 262 name pages + 24 letter pages + 4 hubs (live since 2026-10-10)

| Metric | Name pages | Letter pages |
|---|---|---|
| Median words per page | 330 | 409 |
| Page-exclusive words (median / min / max) | 77 / 50 / 114 | 171 / 118 / 503 |
| Share of text that is not template | 52% | 55% |
| Near-duplicate similarity (mean / max) | 0.09 / 0.42 | 0.12 / 0.25 |
| GSC, 3 months | 0 impressions. The pages are 1 day old, so there is no signal yet. | 0 |

The editorial core of a name page is its meaning plus an optional source note. In the data that core is short:

- ≤5 words: **55 names**
- 6–10 words: 109 names
- 11–20 words: 95 names
- more than 20 words: 3 names
- Median: 9 words

The thinnest names include אורית, שירה, אמונה, נחמה, חיה, גולדה, קורל, ויקטוריה, סופיה, לבנה, שלווה, ארי, אילן, מתן and חנן, each with 2–3 words. Everything else on a name page is a fact table (origin, gender, letter, English spelling) plus generic advice and a "similar names" list that is shared with other pages.

The pages are not near-duplicates of each other (max similarity 0.42). The risk is that they are *thin*.

There is real demand for single-name queries. For example, "משמעות השם איתן" gets 140, "אימרי" 140, "תמר" 90 and "גפן" 90. The hubs carry the big keywords: girls and boys are 12,100 each.

**Recommendation:**

1. **KEEP the 4 hubs and the 24 letter pages** as they are.
2. **Name pages, keep 207 and act on the thinnest 55.** Within the next few weeks, give each of the 55 names whose meaning is 5 words or fewer 2–3 real sentences: etymology, a famous bearer or biblical context, and a note on popularity. If that won't happen soon, **noindex those 55** and remove them from the sitemap. They stay reachable from the letter pages.
3. **Re-check in 8 weeks** (early December 2026) with GSC. Any name page with 0 impressions by then should be merged into its letter page. Do this by noindexing the page; no redirect is needed.
4. **Longer term:** a richer page for the top ~60 names (the popular-2024 list plus names with search volume) is worth more than 262 short ones.

## Other thin pages noticed in this area

These are outside the two sections audited above, but they are worth fixing:

- **/blog/\* (8 posts)**: 108–159 words each, and 0–31 impressions at positions 26–74. Recommendation: either expand the 2 posts that get impressions (summer-vacation-ideas, family-game-night) to 600 words or more, or noindex all 8. Their topics are already covered by /ideas pages.
- **/ideas/\* short articles**: 115–170 words each. These are art, cooking, dinosaur, superhero, unicorn, mad-science-lab, pool-party, pajama-party, the holiday-activity pages, summer, winter and the what-to-do pages. They should be expanded, starting with pajama-party ("מסיבת פיג׳מות" 880/month) and what-to-do-weekend ("פעילויות לילדים בשבת" 880).
- **/guides/\***: 155–262 words each for 10 of the 18 guides.

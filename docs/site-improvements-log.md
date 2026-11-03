# Site improvements log (daily improver)

Approvals by the owner are recorded here: change status to `approved` and the daily run implements it.
Data rules: read-only, aggregate numbers and page paths only.

## Ideas backlog
| # | Idea | Page | Metric it should move | Status |
|---|------|------|-----------------------|--------|
| 1 | Home page: shorter "pick your goal" row (print / play / learn / party) above the fold; today only 29% of home visits go on and 3% act | `/` | home visit -> any action: 3% -> 8% | suggested |
| 2 | "Next step" block after printing on top dead-end print pages (hebrew-letters done 29.10; memory-english done 30.10; abc-letters done 1.11; shabbat-times next) | `/printables/*` | single-page visits 85% -> 65% | done (hebrew-letters, memory-english, abc-letters), measure 5-8.11 |
| 3 | `/classroom` (219 visits/28d, 0 actions, 26% single page): add 3 big buttons to the most used class tools (print, quiz, live) | `/classroom` | actions per visit 0 -> 10% | done 1.11 (approved): 4 quick-start buttons on top of the hub; measure 8.11 |
| 4 | Reading hub `/learn/reading` (130 visits, 1% action, 8% leave): link straight into one text per grade with a "start" button | `/learn/reading` | opens of `/learn/reading/grade-*` | closed 1.11: the hub already works (112 entries/28d, 9% bounce, 66% act later in the visit) |
| 5 | Suppliers search: 192 of 200 searches (28d) returned zero results — widen supplier list or show "request this supplier" | suppliers search | searches with results | suggested (owner decision) |
| 6 | Short links `/r/…` and `/l/…` bring ~230 entries/week (QR/print/share) but 70-90% leave after one page: put a "more like this" strip on the landing page they point to | landing pages of `/r/*` | single-page visits 85% -> 65% | approved 1.11, NOT implemented: `/r/*` and `/l/*` are the guests' own RSVP / bring-list pages (a guest answers and leaves - a high single-page rate is expected); they already show the site invite box. Measure instead: guests who open the site from there (nav) |
| 7 | `/en/rsvp` (52 entries/week, 13% use) and `/rsvp` (42% use) convert well; add a one-line "free RSVP" link from `/invitation` (28 shares/week, no next step) | `/invitation` | opens of `/rsvp` from `/invitation` | suggested |
| 9 | `/invitation` already links to `/rsvp` (related list + RSVP-link button inside the studio) — idea 7 needs no change; measure `/rsvp` entries from `/invitation` via nav signals | `/invitation` | n/a | closed (already exists) |
| 8 | Home: 49% of visits end on `/` and only 3% act; the 5-way top-block experiment has too few views (<12 per variant) — wait for ≥300 shown before changing | `/` | see idea 1 | suggested (wait) |
| 10 | Shabbat times pages end the visit: `/shabbat-times` 44 of 49 entries and `/shabbat-times/jerusalem` 34 of 37 are single-page (28d). Add a "this Shabbat" strip: this week's parasha, candle blessing, Shabbat table activities, kids' Shabbat games | `/shabbat-times`, `/shabbat-times/*` | single-page visits 90% -> 70% | done 1.11 (approved): "more for this Shabbat" strip under the times on hub and city pages; measure 8.11 |
| 11 | `/en/rsvp`: 53 entries/28d, 77% single page, 8 uses vs Hebrew `/rsvp` 54 uses on 169 opens (32%). Show a ready sample invitation + a one-tap "start with wedding / birthday" above the fold in English | `/en/rsvp` | uses per open 13% -> 25% | done 1.11 (approved, first step): template chips moved to the top of `/en/rsvp`; a sample invitation preview is still open; measure 8.11 |
| 12 | Saturday is the strongest day (2439 opens/28d vs ~1000-1300 Sun-Tue) and 14:00-18:00 the peak: publish new content and share posts Thursday evening/Friday so it is live for Saturday | content schedule | opens on Saturday | approved 1.11: publish new content Thu-Fri (a schedule habit, no code) |
| 13 | Next-step tracking was broken: `nav` signals dropped every client-side link (the router changed the URL before the listener ran) - only 4 clicks in 14 days. Fixed 2.11 (capture-phase listener, same data). After 1 week we can see real "where to next" per page | all pages | `nav` rows per week: 4 -> hundreds | done 2.11, measure 9.11 |
| 14 | Site search does not forgive typos: 25% of searches (10 of 40, 14d) found nothing, most are typos of "דפי צביעה" / "ניקוד" / "vowels" (English word for nikud). Add fuzzy match + synonyms (vowels, niqqud, ניקוד) in `/search` | `/search` | zero-result searches 25% -> 10% | done 2.11 (second run, small safe fix): synonyms ניקוד/vowels/niqqud and צביעה/coloring + an "אולי התכוונתם" link when a search finds nothing; measure `search` r0 share on 9.11 (28d: 12 of 53 = 23%) |
| 15 | `/live` as an entry page: 27 of 27 entries are single-page, 0 actions (students joining a game - expected) - nothing to fix; do NOT read it as a dead end | `/live` | n/a | closed |
| 16 | Returning visitors are only 7% (111 of 1,617 people, 28d). Add a gentle "save to home screen / WhatsApp channel" nudge after a print or a finished game (not a popup) | `/printables/*`, game end screens | returning visitors 7% -> 10% (`owner_visitor_days`) | suggested |
| 17 | `/printables/memory-english` (29 of 48 entries single-page) and `/tools/dice/story-dice` (17 of 31): the next-step block exists on the first; check on 9.11 and, if still above 55%, put 2 big "next" buttons right under the print button | those two | single-page 60% -> 40% | suggested (wait for 9.11) |
| 18 | Mobile is 72% of visits but only 34% act (desktop 44%): a sticky print / PDF bar at the bottom of printable pages on phones | `/printables/*` | mobile visits with an action 34% -> 40% | done 3.11: `MobilePrintBar` on every page with a `[data-print-main]` button, shown on phones while that button is off screen (gtag `mobile_print_bar`); measure 10.11 |
| 19 | Seasonal coloring converts best (Sigd: 59 opens, 67 actions): a Hanukkah coloring strip on the home page in the weeks before Hanukkah | `/` | home visit -> any action 3% -> 6% | done 3.11: `SeasonColoring` strip under the hero for the next holiday with a coloring page, from 35 days before (Sigd now, then Hanukkah); measure 10.11 |
| 20 | `/request`: 96 opens/week, 2 requests. One text box first, the other fields behind "more details" | `/request` | requests per open 2% -> 8% | done 3.11: role, age and e-mail moved into a closed "עוד פרטים" box; measure 10.11 |

## Data findings
### 2026-11-02, second run (afternoon data, same day as the morning entry; numbers close to it = noise)
- 7d vs previous 7d: opens 3,669 vs 3,548; people 1,024 vs 820 (+25%); prints 276 vs 138 (x2); PDFs 139 vs 62; shares 105 vs 45; plays 29 vs 78. 28d visits 2,857: 47% single-page no action, 33% acted, 23% deep (4+ pages).
- Next-step (`nav`) tracking works after the fix: 44 clicks in 5 days. Learners move between neighbouring grades in `/learn/geography/grade-N` (about 9 of 15 clicks) - a grade-to-grade link is used, keep it prominent. Home to `/whatsapp` 4.
- Site search 28d: 35 results 6+, 6 with 1-5, 12 with none (23%); zero-result words are typos or English ("vowels", "דפי צהיעה", "תנועווניקוד") - fixed today.
- Rising: `/request` 84 (new), `/en/r/wghvx53q` 71, `/printables/memory-english` 55, `/holidays/sigd/coloring` 41 vs 5, `/classroom/by-grade` 35 (new), `/unseen` 28. Falling: `/learn` 59 vs 136, `/kids` 33 vs 76, `/letters/game` 34 vs 70.
- Search Console: the workflow still has no `GSC_SERVICE_ACCOUNT` secret, so there is no Google data - owner action.

### 2026-11-02 (7d vs previous 7d; Monday morning, 2.11 itself excluded)
- Visits 1,030 vs 816 (+26%); with an action 392 (38%) vs 248 (30%); single-page without action 486 (47%) vs 459 (56%); deep visits (4+ pages) 143 vs 114; avg pages 2.23 vs 2.43. Prints 261 vs 147, PDFs 135 vs 64, shares 104 vs 45, plays 29 vs 78 (online-games fall), "use" clicks 1,061 vs 707.
- Mobile 1,341 visits (31% act) vs desktop 505 (46% act) over 14d; desktop converts better. Share channels (14d): whatsapp 59, native 73, copy 3, facebook 2 - WhatsApp is the real sharing channel.
- Returning: 111 of 1,617 people (7%) came back within 28d. Busiest day Sunday (533 visits/28d), Saturday 512, Friday 491; Monday weakest (255).
- Entry pages (7d, entries / single-page no action / acted): `/` 85/20/41 (4.4 pages avg - the home works as a starting point); short link `/r/3rt6xgjk` 62/51; `/rsvp` 50/21/26; `/printables/memory-english` 48/29/16; `/request` 46/18/17 (4.6 pages); `/learn/reading` 41/3/26; `/tools/dice/story-dice` 31/17/12; `/live` 27/27/0 (joiners, expected); `/en/rsvp` 28/19/8.
- From the first page, the next page (14d): `/` to `/classroom` 29, `/search` 8, `/printables` 7, `/kids` 7, `/family` 7, `/road-safety-week` 7; `/learn/reading` to grade-5 18, grade-3 15, grade-6 11; `/parasha` to the weekly parasha 14; `/rsvp` to `/rsvp/bar-mitzvah` 6 and `/invitation` 6; `/printables/memory-english` to `/printables/memory-game` 5.
- Rising (7d vs prev): `/request` 80 (new), `/en/r/wghvx53q` 71, `/printables/memory-english` 55, `/r/cv7uqapk` 50, `/tools/dice/story-dice` 42, `/holidays/sigd/coloring` 38 vs 5, `/classroom/by-grade` 33 (new, from the quick-start buttons), `/unseen` 27. Falling: `/trivia/topics` 14 vs 80, `/parasha` 9 vs 67, `/learn` 69 vs 125, `/kids` 36 vs 76, `/letters/game` 34 vs 70, `/shabbat-times*` (seasonal, ~0 now).
- Top prints (7d): `/learn/reading/grade-2` 38, `/holidays/sigd/coloring` 26, `/learn/gifted-test/grade-3` 21, `/printables/color-by-number/castle` 13, `/math/grade-1/add-sub-10` 12.
- Scroll reach to 50% (14d): `/learn/reading` 12% (65 views), `/printables` 22%, `/` 34%, `/request` 32%, `/classroom/by-grade` 18%; strong: `/kids` 95%, `/r/3rt6xgjk` 82%.
- Site search (14d signals): 40 searches, 10 found nothing (25%); zero-result terms are typos ("דפי צביעה", "vowels"). Page requests: 25 in the week of 26.10, mostly from `/` (5), `/request` (3) and unknown (14). 404s: same three booklet paths (7/5/3) as last week - they are in the registry; probably old cached links. Next-step clicks: 4 in 14d = a tracking bug (fixed today, see idea 13). JS errors: 18 in 14d, small.
- Not yet measured today: the 1.11 changes (`/classroom` buttons, Shabbat strip, `/en/rsvp` chips) - measure 8.11. `/classroom/by-grade` already appears with 33 opens.

### 2026-11-01 (7d vs previous 7d; 1.11 itself is partial = noise; Sunday morning)
- Visits 869 vs 816 (+6%); single-page visits without action 386 (44%) vs 451 (55%) - better; visits with an action 346 (40%) vs 259 (32%); avg pages per visit 2.27 vs 2.43; deep visits (4+ pages) 118 vs 114.
- Daily visitors 121-183 on normal days (28d range 24-206). Busiest day: Saturday (2439 opens, 515 visits per day-of-week sum over 28d), weakest Monday (1004 opens). Hours: peak 14:00 (272 visits) and 17:00 (233); a second hump 18-21; almost nothing 01-05.
- Device x source (7d visits): mobile direct 400, mobile google 161, mobile other 161, desktop google 106, mobile facebook 100, desktop direct 64, mobile whatsapp 22. Mobile is about 80%.
- Entry pages (28d entries / single-page visits with no action): `/` 347 / 110 (32%); `/printables/hebrew-letters` 151 / 108 (72%); `/classroom` 137 / 58 (42%); `/learn/reading` 112 / 10 (9%, works as a hub); short links `/r/3rt6xgjk` 104 / 83, `/l/qszgkcz` 95 / 89 (94%), `/r/g2jcufxb` 48 / 47, `/r/xyn84758` 37 / 34; `/rsvp` 99 / 34; `/en/rsvp` 53 / 41 (77%); `/shabbat-times` 49 / 44; `/shabbat-times/jerusalem` 37 / 34; `/printables/memory-english` 48 / 28; `/request` 37 / 14.
- Open to action (28d, direct): `/letters/game` 155 opens, 537 clicks; `/printables/hebrew-letters` 180 opens, 72 print/PDF; `/learn/reading/grade-2..6` 53-74 opens each with 20-58 prints; `/rsvp` 169 opens, 54 uses; `/invitation` 46 opens, 33 shares, 25 uses; `/printables` 175 opens, 46 clicks. Hubs `/classroom` 388, `/learn` 226, `/trivia/topics` 156, `/letters` 154, `/online-games` 152, `/math` 142: no direct action (the action is the next click).
- Rising (7d): `/request` 66 (new), `/en/r/wghvx53q` 57, `/printables/memory-english` 55, `/r/cv7uqapk` 49, `/tools/dice/story-dice` 39, `/holidays/sigd/coloring` 33 vs 5, `/unseen` 26 and `/unseen/english` 25 (new). Falling: `/` 173 vs 242, `/learn` 60 vs 125, `/trivia/topics` 14 vs 78, `/parasha` 9 vs 63, `/kids`, `/letters/game` 28 vs 69, `/shabbat-times*`.
- Time on page (14d avg seconds, n>=60): `/letters/game` 109, `/learn/reading/grade-3` 108, `/letters/cursive` 91, `/learn/reading/grade-6` 70, `/rsvp` 68; short: `/kids` 11, `/learn/reading` 12, `/classroom` 16 (hubs people pass through).
- Last page of a visit (7d): `/r/3rt6xgjk` 97, `/en/rsvp` 51, `/rsvp` 48, `/` 46, `/printables/memory-english` 42, `/live` 23, `/request` 22.
- Site search (30d): 29 searches, 18 with 6+ results, 4 with 1-5, 7 with none (24%); no zero-result term repeated twice, so nothing to act on. Page requests: 23 in the week of 26.10. Next-step clicks: too few (10 in 14d, 4 of them `/` to `/whatsapp`). Scroll (14d): `/learn/reading` 42 views, 5% reach half; `/` 125 views, 29%. 404: `/booklets/shemot-special-ed` 7, `/booklets/nikud` 5, `/booklets/hygiene-first-sound` 3 (same as last week; exist in the registry - maybe cached old links, recheck 8.11). Search Console: the workflow still reports that `GSC_SERVICE_ACCOUNT` is not set, so no Google data.
- Funnels (28d): `/rsvp` 169 opens, 54 uses; `/en/rsvp` 60 opens, 8 uses; `/invitation` 46 opens, 25 uses, 33 shares; `/live` 41 opens, 7 uses; `/birthday` 44 opens, no action; `/secret-friend` 12 opens, 0 uses; `/planner` 12 opens. Unfinished funnels cannot be seen (no create/finish events).
- Returning visitors cannot be measured (visitor id lives one day).

### 2026-10-31 (7d vs previous 7d; Saturday morning, 31.10 itself is partial = noise)
- Opens 3360 vs 3817 (-12%); visits 969 vs 762 (+27%); prints 260 vs 111 (x2.3); PDFs 117 vs 65 (+80%); shares 112 vs 27 (x4); plays 24 vs 126.
- Mobile 714 vs desktop 264 visits (73%). Sources (7d visits): direct 394, google 249, other 204, facebook 75, bing 34, whatsapp 13.
- Bounce (7d, visit opens one page, no action): `/r/3rt6xgjk` 63 of 99, `/en/rsvp` 38 of 49, `/printables/memory-english` 27 of 41, `/r/zf7bafzp` 22 of 30, `/` 11 of 89 (but only 43 acted). `/learn/reading` only 5 of 33 bounce.
- Open to action (28d): `/letters/game` 67%, `/rsvp` 43%, `/printables` 36%, `/printables/hebrew-letters` 11%, `/` 4%, hubs `/classroom`, `/math`, `/letters`, `/online-games` 0% (the action is the next click).
- Rising (7d): `/r/3rt6xgjk` +178, `/rsvp` 79 vs 36, `/en/rsvp` 57 (new), `/printables/memory-english` 54 (new), `/request` 53 (new), `/tools/dice/story-dice` 37 vs 2. Falling: `/` 150 vs 373, `/classroom` 42 vs 119, `/learn` 61 vs 133, `/online-games`, `/bugapedia`, `/parasha`, `/shabbat-times`.
- Scroll (14d, long pages): home 74 views, 28% reach 50%; `/learn/reading` 18 views, 0% scroll; `/classroom` 15 views, 27%. Next-step clicks: too few (9 clicks). Zero-result searches: 1 term; 2 searches counted with no/many results — too few to read.
- 404s (14d): `/booklets/shemot-special-ed` 7, `/booklets/nikud` 5, `/booklets/hygiene-first-sound` 3 — these pages exist in the registry now (likely opened before the deploy finished); recheck in a week. Page requests: 17 in the week of 26.10.
- RSVP/invitation (28d): `/rsvp` 134 opens, 49 uses; `/en/rsvp` 57 opens, 8 uses; `/invitation` 43 opens, 32 shares, 22 uses; `/live` 21 opens; `/secret-friend` 12 opens, 0 uses.
- JS errors: 4 singles on Hanukkah and crosswords pages — noise.
- Returning visitors cannot be measured (visitor id lives one day).

### 2026-10-30 (7d vs previous 7d / 28d)
- Opens 3059 vs 4429 (-31%, the 17.10 spike and the online-games fall); prints 200 vs 118 (+69%); PDFs 95 vs 92; shares 109 vs 40 (x2.7); plays 24 vs 133.
- Daily visitors 81-206; 25.10 (206) and 27.10 (169) are peaks. Visits (7d) mobile 712 vs desktop 240 (75%). Sources (7d visits): direct 375, google 301, other 194, facebook 53, bing 33. Busiest day: Saturday (2551 opens/28d), evening hours 18-21 and 14:00.
- 2205 of 3234 visits (68%, 28d) open one page; 305 (9%) open 7+.
- Dead ends (28d, visits ending there): `/` 204 (49% single), `/printables/hebrew-letters` 162 (91%), `/classroom` 105 (53%), short links `/l/qszgkcz` 92 (72%) and `/r/3rt6xgjk` 91 (71%).
- Open → action (28d): `/rsvp` 42%, `/letters/game` 67%, `/printables` 36%; `/` 3%, `/classroom` 0%, `/math` 0%, `/letters` 0%, `/online-games` 0%, `/learn/reading` 1% (hubs: the action is the next click, not a button).
- Rising (7d): short links `/r/3rt6xgjk` +173, `/rsvp` +52, `/en/rsvp` +52 (new), `/printables/memory-english` +50, `/r/zf7bafzp`, `/r/xyn84758`. Falling: `/` -321, `/classroom` -274, `/math` -86, `/learn` -80, `/learn/reading` -78, `/bugapedia` -70.
- RSVP/invitation (28d): `/rsvp` 129 opens, 49 uses; `/invitation` 45 opens, 32 shares, 22 uses; `/secret-friend` 12 opens; `/live` 21 opens.
- Site signals started 29.10 only (527 scroll events, 1 search with no result, 4 next-step clicks): too little to read yet. Zero-result searches: 1 term. Page requests: 3 in 28 days (all in the last 7).
- Experiment home-top: 4-11 views per variant — far too early.

### 2026-10-29 (7 vs previous 7 / 28 days)
- Opens 3350 vs 4118 (-19%); prints 159 vs 130 (+22%); PDF downloads 82 vs 110; shares 105 vs 39 (x2.7); plays 30 vs 129 (-77%, the online-games fall explains it).
- Daily visitors 90-200 on normal days; peaks 16-17.10 (180) and 27.10 (169). Mobile is the vast majority (about 80%); sources: direct, google (mobile 222/week), facebook 43.
- 70% of visits (7d) open a single page; 14% open 5+ pages. Hubs work: only 0-26% of visits to /games, /math, /letters, /kids, /online-games end there.
- Dead ends (visits that end on the same page, 28d): /shabbat-times 96%, /printables/hebrew-letters 85% (184 visits, 24% print), /printables/memory-english 83%, /parasha 35%, /rsvp 45%.
- Entry pages (7d): /r/3rt6xgjk 97 (a short link), /rsvp 55, /en/rsvp 48, / 43, /printables/memory-english 41, /learn/reading 35. Home entries fell: 130 vs 418 opens week-over-week (it was inflated by a spike on 17.10).
- Home next click (28d): /classroom 77, /games 51, /online-games 38, /kids 35, /printables 34, /bugapedia 32, /birthday 30.
- Returning visitors cannot be measured: the id lives one day, 99% appear on one day only.
- Page requests: 1 in the last 28 days. Experiment home-top: 2 views since 28.10 — far too early.
- Small numbers: single days are noise; weekly trends only.

## Done
- 2026-11-02: fixed the next-step (`nav`) signal in `src/utils/liveActivity.js`: the link listener now runs in the capture phase, so client-side router links are counted (they were all dropped). Same data, no new personal data.
- 2026-11-01 (owner approved all ideas): `/classroom` quick-start buttons (print, quiz, live quiz, by grade); `/shabbat-times` and city pages strip with parasha, candle blessing, table activities, Shabbat pack; `/en/rsvp` template chips at the top.
- 2026-11-01: `/printables/abc-letters` (82% single-page visits) had no next step after printing: added a "what next" block with 5 links (ABC game, flashcards, English memory cards, lined paper, ABC hub) and a tip about b/d and p/q confusion (measure: single-page visits 8.11).
- 2026-10-31: `/tools/dice/story-dice` was a 2-paragraph page that jumped from 2 to 37 opens/week: added a how-to guide, 6 activities, tips, 2 FAQ entries and more related links (measure: scroll reach and opens in 2 weeks).

## Measured results
(nothing yet)

# Site improvements log

## 2026-10-29 — Search Console review (28 days to 28.10.2026)

### Time tunnel (/time-tunnel/MM-DD)
- Added `src/data/timeTunnelIsrael.js`: Israeli / Jewish events, births and deaths, each confirmed by two independent sources on the exact day and year. Shown in a new "בישראל ובעם היהודי" section and in the date's FAQ/JSON-LD.
- Date pages now link explicitly to yesterday and tomorrow; on today's page a "מה קרה היום" line is shown.
- The hub `/time-tunnel` has a "מה קרה היום?" section linking today's and tomorrow's date pages.
- Home page: not changed (no existing slot; it already embeds the daily game with a link to the hub).
- Covered dates: 10-29 … 11-29 (22 of 33 dates have a verified entry). No verified entry yet: 11-01, 11-05, 11-06, 11-08, 11-11, 11-14, 11-17, 11-21, 11-28, 11-30.
- Left: the other ~330 dates. Dropped for uncertainty (do not re-add without a better source): Trumpeldor birth 21.11.1880 (Julian/Gregorian unclear), Hanna Maron birth (22 vs 23.11), Sharon/Kadima 21.11.2005 (day disputed), Operation Yachin 28.11.1961 (single source).
- To extend: add keys to `TT_ISRAEL` (tests/time-tunnel-israel.test.mjs enforces two distinct https sources per entry).

### Thin templated pages (2026-10-29)
- No page was noindexed: no Search Console page data is available yet (the `search-console` workflow never ran), and every family has per-page text. Family counts, suggestions and the reversible procedure are in `docs/seo/noindex-thin-pages.md`.
- Next step: set `GSC_SERVICE_ACCOUNT`, wait 4–8 weeks, then decide on `/printables/coloring/<subject>/N` and `/en/coloring/<holiday>/N`.

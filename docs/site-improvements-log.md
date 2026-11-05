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
| 16 | Returning visitors are only 7% (111 of 1,617 people, 28d). Add a gentle "save to home screen / WhatsApp channel" nudge after a print or a finished game (not a popup) | `/printables/*`, game end screens | returning visitors 7% -> 10% (`owner_visitor_days`) | closed 4.11: the channel nudge already exists (PrintAsk after print, ChannelBar, home, footer, /request). Low returning rate (7%) is not a visibility problem; measure channel joins via `/whatsapp` opens instead |
| 17 | `/printables/memory-english` (29 of 48 entries single-page) and `/tools/dice/story-dice` (17 of 31): the next-step block exists on the first; check on 9.11 and, if still above 55%, put 2 big "next" buttons right under the print button | those two | single-page 60% -> 40% | suggested (wait for 9.11) |
| 18 | Mobile is 72% of visits but only 34% act (desktop 44%): a sticky print / PDF bar at the bottom of printable pages on phones | `/printables/*` | mobile visits with an action 34% -> 40% | done 3.11: `MobilePrintBar` on every page with a `[data-print-main]` button, shown on phones while that button is off screen (gtag `mobile_print_bar`); measure 10.11 |
| 19 | Seasonal coloring converts best (Sigd: 59 opens, 67 actions): a Hanukkah coloring strip on the home page in the weeks before Hanukkah | `/` | home visit -> any action 3% -> 6% | done 3.11: `SeasonColoring` strip under the hero for the next holiday with a coloring page, from 35 days before (Sigd now, then Hanukkah); measure 10.11 |
| 20 | `/request`: 96 opens/week, 2 requests. One text box first, the other fields behind "more details" | `/request` | requests per open 2% -> 8% | done 3.11: role, age and e-mail moved into a closed "עוד פרטים" box; measure 10.11 |
| 21 | Reading passages (`/learn/reading/<slug>`, e.g. phones-in-school: 9 of 11 entries single-page): every passage linked to the same first 4 passages of its level. Now it links to the NEXT passages in the level + a big "next passage" button | `/learn/reading/*` | single-page share of passage entries 80% -> 60% | done 4.11, measure 11.11 |
| 22 | Sigd coloring (best converter: 76 opens, 50 prints/PDFs in 7d) is seasonal and ends soon: when it fades, push Hanukkah coloring from the same strip (already automatic) and check the Hanukkah coloring page has a next-step block | `/holidays/hanukkah/*` | prints per open | suggested |
| 23 | `/printables` hub (89 opens vs 44 week before, 21 clicks, 0 direct prints): put the 6 most printed sheets (hebrew letters, memory-english, lined paper, color-by-number, sigd coloring, reading grade 2) as big tiles at the top | `/printables` | clicks per open 24% -> 40% | suggested |
| 24 | Reading grade-4 page crashes for some visitors: 17 `type` JS errors in 7d on `/learn/reading/grade-4` (data and code checked, no obvious cause; needs a stack trace / device type) | `/learn/reading/grade-4` | JS errors 17/week -> 0 | suggested (owner decision: allow storing the error file+line, no personal data) |
| 25 | Home-top experiment (since 28.10, shown / prints / requests): request 60/6/3, bring 45/4/0, rsvp 56/3/0, search 37/2/1, live 40/0/0; "live" is weakest - still under 300 shown, wait | `/` | prints per shown | suggested (wait) |
| 26 | Holiday coloring/worksheet pages (Sigd 110 opens/7d, 26 of 55 entries single-page): "what next" strip under the print grid, for every holiday (Hanukkah gets it too) | `/holidays/*/coloring`, `/worksheets` | single-page share 47% -> 35% | done 5.11, measure 12.11 |

## Data findings
### 2026-11-05 (7d vs previous 7d; Thursday morning, 5.11 itself excluded)
- Opens 4,249 vs 3,371 (+26%); visits 1,281 vs 960 (+33%); with an action 461 (36%) vs 295 (31%); single-page no action 634 (49%) vs 538 (56%); deep visits (4+ pages) 164 vs 107. Prints 333 vs 160 (x2.1), PDFs 169 vs 72 (x2.3), shares 87 vs 82, plays 63 vs 31. Best days 2.11 (228 people), 4.11 (216), 3.11 (214).
- Mobile 888 visits (33% act, up from 26%) vs desktop 393 (43%). Sources (7d, % acted / % bounce): google 326 (45/42), direct 390 (34/51), other 214 (50/34), whatsapp 145 (14/77!), facebook 118 (22/63), bing 45 (40/40). WhatsApp/Facebook visitors come to look: 77% / 63% leave without acting.
- Returning: 3,281 of 3,329 people (28d) appear on one day only (the id rotates daily, so this is a floor, not a truth). Days (28d visits): Sun 540, Tue 521, Sat 515, Wed 515, Fri 496, Mon 441, Thu 345 (weakest).
- Entry pages (7d, entries / single-page no action / acted): `/` 94/21/48 (7.2 pages avg); `/rsvp` 67/24/35; `/holidays/sigd/coloring` 55/26/25; `/request` 55/22/22 (6.4 pages); `/learn/reading` 54/6/33; `/online-games` 33/21/10 (64% leave, 0 direct actions); `/letters/cursive` 26/16/8; `/live` 28/28/0 (expected); new short links `/r/hjwxtxaq` 58/44 and `/r/cv7uqapk` 34/25 (guests, expected).
- Open -> action (7d): `/holidays/sigd/coloring` 110 opens, 71 prints/PDFs; `/letters/game` 30 opens, 105 clicks; `/rsvp` 119 opens, 38 uses; `/invitation` 25 opens, 13 shares, 18 uses; `/printables` 93 opens, 20 clicks, 0 prints; `/letters/cursive` 35 opens, 17 prints; `/request` 96 opens. Funnels 28d (opens/people/uses/shares): `/rsvp` 236/164/82, `/en/rsvp` 73/65/10, `/invitation` 65/50/36/39, `/live` 56/44/8, `/birthday` 39/27/0, `/secret-friend` 12/9/0.
- Rising: `/holidays/sigd/coloring` 110 vs 18, `/request` 96 vs 8, `/` 218 vs 134, `/online-games` 81 vs 30, `/printables` 93 vs 44, `/classroom/by-grade` 45 (new), `/rsvp` 119 vs 85. Falling: `/learn` 42 vs 103, `/trivia/topics` 0 vs 74, `/parasha` 6 vs 50, `/en/rsvp` 21 vs 51, `/printables/memory-english` 14 vs 42, `/shabbat-times*` (school-week / seasonal).
- Signals (7d): search 65 (13 found nothing = 20%; the terms are typos or "vowels"); scroll to 50%: `/learn/reading` 13% (120 views), `/` 34%, `/printables` 23%, `/search` 8%, `/kids` 94%. Next steps: `/kids` -> `/online-games` 9, `/learn/reading` -> grades 8/1/2/4/5, `/online-games` -> memory 5 and today 5, `/` -> `/whatsapp` 4 and `/holidays/hanukkah` 4, sigd coloring -> sigd hub/worksheets 4 each.
- JS errors (7d): `/learn/reading/grade-4` type 17 (the only one with a pattern; idea 24), others 2-5. 404 (14d): the same booklet paths (7/5/3) and `/math/grade-6/arithmetic-laws`, `/tools/pdf/to-word` 2 each.
- Small numbers: nav, search, helpful and 404 counts are tiny; weekly direction only.

### 2026-11-04 (7d vs previous 7d; Wednesday morning, 4.11 itself excluded)
- Visits 1,209 vs 919 (+32%); with an action 441 (36%) vs 271 (29%); single-page no action 543 (45%) vs 475 (52%); deep visits (4+ pages) 267 vs 180. Prints 303 vs 160 (x1.9), PDFs 169 vs 66 (x2.6), shares 103 vs 68, plays 32 vs 48. Daily people 121-228; 2.11 (228) and 3.11 (214) are the top days.
- Mobile 869 visits (34% act) vs desktop 340 (42% act) - same gap as before. Sources (7d visits, acted): direct 327 (31%), google 280 (40%), other 255 (50%), whatsapp 141 (26%), facebook 108 (25%), bing 49. WhatsApp/Facebook visitors act least - they come to look, not to print.
- Days (28d visits): Sunday 540, Tuesday 521, Saturday 515, Friday 496; Wednesday 334 and Thursday 345 weakest.
- Entry pages (7d, entries / single-page no action / acted): `/` 91/21/45; `/rsvp` 62/23/33; `/request` 55/21/22; `/learn/reading` 47/4/30 (works as a hub); `/holidays/sigd/coloring` 45/23/18; `/letters/cursive` 29/17/10; `/live` 28/28/0 (expected). Guest short links `/r/*` 55-75% single-page (expected).
- Open -> action (7d): `/holidays/sigd/coloring` 76 opens, 50 prints/PDFs, 26 clicks; `/letters/game` 34 opens, 112 clicks; `/invitation` 28 opens, 15 shares, 18 clicks; `/letters/cursive` 39 opens, 13 prints; `/rsvp` 113 opens, 38 uses; `/printables` 89 opens, 21 clicks, 0 prints; `/request` 96 opens (no click label recorded); `/` 195 opens, 4 direct clicks.
- Rising: `/request` 96 vs 7, `/holidays/sigd/coloring` 76 vs 11, `/classroom/by-grade` 45 vs 0, `/printables` 89 vs 44, `/unseen/english` 35 vs 1, `/rsvp` 113 vs 79, `/letters/cursive` 39 vs 20. Falling: `/learn` 43 vs 146, `/trivia/topics` 0 vs 92, `/trivia/continents-oceans` 0 vs 68, `/parasha` 6 vs 55, `/games` 13 vs 43 (school-week / seasonal).
- Signals (7d): 324 next-step clicks (tracking fixed 2.11 works); top: `/learn/reading` -> grade-8/5/1/4/2; `/kids` -> `/online-games` 5; `/unseen/english` -> grade-9/8; `/holidays/sigd` -> what-to-do -> worksheets; `/classroom/by-grade` -> reading grade-2. Search: 64 searches, 12 found nothing (19%, down from 23-25%). Scroll to 50%: `/` 34% (177 views), `/rsvp` 34%, `/request` 32%, `/printables` 20%, `/learn/reading` 13% (101 views - long hub, most never scroll), `/search` 8%, `/kids` 95%. JS errors 48 in 7d (type 18, other 15, range 13) - not yet attributed to pages.
- 404 (14d): same booklet paths (`/booklets/shemot-special-ed` 7, `nikud` 5, `hygiene-first-sound` 3) although they exist in the registry - maybe old cached bundles; also `/tools/pdf/to-word` 2, `/math/grade-6/arithmetic-laws` 2.
- Small numbers: nav, search and 404 counts are tiny; read as weekly direction only.

### 2026-11-03 (7d vs previous 7d; Tuesday morning, 3.11 itself excluded)
- Visits 1,187 vs 818 (+45%); people 1,164; opens 3,984 vs 3,574 (+11%). Visits with an action 439 (37%) vs 249 (30%); single-page no action 552 (47%) vs 447 (55%); deep visits (4+ pages) 170 vs 110. 2.11 was the best day of the month (228 people).
- Actions: prints 311 vs 141 (x2.2), PDFs 156 vs 60 (x2.6), shares 112 vs 47, plays 33 vs 64 (online-games fall). Mobile 855 visits (34% act) vs desktop 332 (44% act) - see idea 18.
- Entry pages (7d, entries / single-page no action / acted): `/` 92/20/45; `/request` 56/22/21; `/rsvp` 55/22/29; `/printables/memory-english` 48/29/16; `/learn/reading` 47/5/27; `/holidays/sigd/coloring` 35/17/15; `/letters/cursive` 27/17/9; short links `/r/*` 90-95% single page (guests, expected); `/live` 28/28/0 (expected).
- Open -> action (7d): `/holidays/sigd/coloring` 59 opens, 67 actions (43 prints/PDFs) = best converter; `/letters/game` 33 opens, 111 actions; `/letters/cursive` 34 opens, 72 actions; `/rsvp` 102 opens, 37 actions; `/invitation` 27 opens, 41 actions (21 shares). Hubs with 0 actions by design (the action is the next click): `/classroom` 402 opens/28d, `/learn` 238, `/letters` 160, `/trivia/topics` 156, `/online-games` 152, `/math` 149. `/` 867 opens/28d with 16 direct actions (it is a launcher; 45 of 92 entries do act later).
- Rising: `/request` 96 (new), `/en/r/wghvx53q` 71, `/printables/memory-english` 55, `/holidays/sigd/coloring` 59 vs 6, `/classroom/by-grade` 45 (new, from the 1.11 buttons), `/tools/dice/story-dice` 43, `/rsvp` 102 vs 68. Falling: `/learn` 52 vs 142, `/trivia/topics` 4 vs 88, `/trivia/continents-oceans` 2 vs 66, `/parasha` 9 vs 61, `/letters` 15 vs 48, `/letters/game` 33 vs 64 (seasonal / school-week effects).
- Party tools (28d opens / people): `/rsvp` 198/139, `/en/rsvp` 68/61, `/invitation` 57/42 (37 creates, 32 shares), `/live` 56/44, `/birthday` 40/28, `/secret-friend` 12/9 (0 uses).
- Busiest days (28d visits): Sunday 540, Saturday 515, Friday 496; Thursday 345, Wednesday 323 weakest.
- Next-step clicks (14d, small numbers): `/classroom` -> trivia-quiz and by-grade; `/classroom/by-grade` -> reading grade-2; `/learn/reading` -> grades 8/5/4; `/learn/geography/grade-5` -> grade-4; `/` -> `/whatsapp` 4. Scroll reach 50% (14d): `/learn/reading` 11% (89 views), `/` 34%, `/printables` 21%, `/classroom/by-grade` 18%; `/r/*` guest pages 78-84%.
- Search 28d: 58 searches, 12 found nothing (21%), still typos / "vowels" (fix from 2.11 not yet visible in 28d window). Page requests: 2 in the week of 2.11 (25 in the week of 26.10). 404s: same three booklet paths (7/5/3) and 2 each for `/math/grade-6/arithmetic-laws`, `/tools/pdf/to-word` (maybe old links; check redirects with the owner).
- Small numbers: nav, helpful and search counts are tiny; weekly trends only.

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
- 2026-11-05: holiday coloring/worksheet pages (`HolidayPrintables`, e.g. `/holidays/sigd/coloring`, `/holidays/hanukkah/coloring`) had the tab row only at the top; added a "what next" strip under the print grid with up to 4 other pages of the same holiday + a link to the hub (idea 26); measure single-page share 12.11.
- 2026-11-04: reading passages (`/learn/reading/<slug>`): the "more passages" list was the same first four for every passage of a level (9 of 11 entries on `phones-in-school` were single-page); it now lists the passages that follow in the level and adds a big "next passage" button; measure single-page share on 11.11.
- 2026-11-03: `/letters/cursive` (27 entries/7d, 17 single-page) got a tips block ("how to practise cursive without a fight") and a what-next strip (lined paper, letters game, Hebrew letter sheets, final letters, first-grade prep); measure single-page share on 10.11. Also regenerated `src/en/englishLinks.js` (stale; 2 English-link tests failed on main).
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

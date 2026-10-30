# Family names backlog — /family-names

A daily scheduled task adds the **next 40 names** below to `src/data/familyNames.js` and ticks them.
Goal: the ~1,000 most common family names in Israel, each with a checked meaning.

Rules (from the site owner — never bend them):
1. **Check every meaning** against at least two independent sources (dictionaries of Jewish surnames such as
   Alexander Beider's, encyclopedias, academic or museum sites like Beit Hatfutsot / ANU). No source → skip the
   name and leave it unticked with a note. When sources disagree, set `unsure: true` and say so in the text.
2. **No invented numbers or ranks.** `top` only for ranks the CBS published (press release 051/2017). If the owner
   uploads the CBS surname file (≈50,000 names with counts), add a `count` field from it — and only from it.
3. Hebrew text, Israeli names only in examples, original wording (never copied), 25+ characters per meaning,
   `job` on every occupation name, `en` spelling on every name.
4. Each new slug goes into `public/sitemap-static.xml` (tests/family-names.test.mjs checks it). Site search
   picks names up from the data automatically.

## Next (top first)
- [x] Ashkenazi: גולדמן, זילברמן, ליברמן, הרשקוביץ, ברקוביץ, פלדמן, לנדסמן, וולף, הירש, ברגמן, הופמן, נוימן, רוזנבלום, פינקלשטיין, אייזנברג, שטיינברג, גלבר, ויסמן, שפירו, גרינשטיין
- [x] Ashkenazi: לרנר, ליבוביץ, מרקוביץ, יוסקוביץ, גוטמן, גוטליב, זלצמן, וקסמן, הלפרין, הלר, קליינמן, גרוסמן, פרל, בירנבאום, טננבאום, אפלבאום, שוורצמן, ווינר, וינשטיין, ברנשטיין
- [x] Retry (2026-10-30): זלצמן, וקסמן, שוורצמן, אפלבאום added — 4 of 5
- [x] North Africa (2026-10-30): 16 of 20 added (אבירם filed as a biblical Hebrew name — no source ties it to North Africa)
- [x] Iraq, Iran, Yemen, Syria, Turkey, Balkans (2026-10-30): 5 of 20 added — שרעבי, אלפסי, ברזאני, חכם, ששון (unsure)
- [x] Hebraized (2026-10-30): 20 of 20 added (נבון, גל, לב, בר marked unsure — other origins exist)
- [ ] Retry later — no second independent source on 2026-10-30 (ANU and Geneanet pages blocked automated reading; only search excerpts were seen):
  - יוסקוביץ — "son of Yosek (Yosef)" is the obvious reading, but no dictionary states it.
  - North Africa: סויסה (only he.wikipedia, unsourced "from Suances"), בוסקילה, אוזן, חזות (no etymology found anywhere).
  - Given-name surnames יצחק, יעקב, יהודה, אליהו, עזרא, שמואלי — need two sources that say the surname comes from the given name (ANU alone covers אליהו and עזרא).
  - מועלם ("teacher" — ANU only), נעים and סלאמה (Geneanet only), צדוק, קדוש, שאשא (only low-quality name sites), נהון (Nahum link only on weak sites), אלגזי ("from Gaza" is unsourced).
  - קמחי — both sources say the origin is disputed and give no meaning; no category page fits a Provençal/Sephardi name of unknown origin.
- [ ] Continue with the most common names that remain (ask the owner for the CBS file to know which ones).

## Sources checked on 2026-10-30
- North Africa: A. Beider, "Jews of Berber Origin" (HAMSA 3, 2017); ANU family-name DB; Geneanet (DAFN-based);
  J. Taïeb in Encyclopédie berbère; M. Eliany's Jewish-Moroccan archive ("The Meaning of Names"); Hebrew/English Wikipedia.
- Iraq/Yemen etc.: ANU; Jewish Encyclopedia; Encyclopaedia Judaica (encyclopedia.com); Wikipedia; chabad.org (Alfasi).
- Hebraized: Hebrew Wiktionary + the biblical verse for each word; birth names from Wikipedia, NLI, BnF, encyclopedia.com,
  Jewish Virtual Library, Hamichlol. Eshel, Ron, Yarden: no documented person who Hebraized to them, so no example given.
- Retried Ashkenazi: Wiktionary, Wikipedia (Apfelbaum, citing Guggenheimer), Behind the Name, houseofnames, Geneanet, ANU.

## Done
- [x] 126 names in 8 categories — 2026-10-27
- [x] 20 names (Ashkenazi row 1: גולדמן … גרינשטיין) — 2026-10-29
- [x] 15 names (Ashkenazi row 2: לרנר … ברנשטיין; 5 skipped, see Next) — 2026-10-30
- [x] 45 names (4 retried Ashkenazi, 16 North Africa, 5 Iraq/Yemen/Kurdistan/Fez, 20 Hebraized; 20 skipped, see Next) — 2026-10-30

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
- [ ] Ashkenazi: גולדמן, זילברמן, ליברמן, הרשקוביץ, ברקוביץ, פלדמן, לנדסמן, וולף, הירש, ברגמן, הופמן, נוימן, רוזנבלום, פינקלשטיין, אייזנברג, שטיינברג, גלבר, ויסמן, שפירו, גרינשטיין
- [ ] Ashkenazi: לרנר, ליבוביץ, מרקוביץ, יוסקוביץ, גוטמן, גוטליב, זלצמן, וקסמן, הלפרין, הלר, קליינמן, גרוסמן, פרל, בירנבאום, טננבאום, אפלבאום, שוורצמן, ווינר, וינשטיין, ברנשטיין
- [ ] North Africa: אוחנה, סויסה, אלבז, בוזגלו, אלקיים, אדרי, אסולין, בן חמו, מלול, אבוקסיס, בוסקילה, אוזן, חזות, ממן, שטרית, זגורי, אמסלם, טובול, אבירם, בן שושן
- [ ] Iraq, Iran, Yemen, Syria, Turkey, Balkans: ששון, שרעבי, צדוק, עזרא, יצחק, יעקב, חכם, מועלם, שאשא, קדוש, נהון, אלפסי, אלגזי, קמחי, ברזאני, אליהו, יהודה, נעים, סלאמה, שמואלי
- [ ] Hebraized: שמיר, אלמוג, גבעון, רז, אילן, הדר, שגיא, עמית, אשל, דגן, שקד, נבון, גל, לב, בר, רון, עוז, צור, איתן, ירדן
- [ ] Continue with the most common names that remain (ask the owner for the CBS file to know which ones).

## Done
- [x] 126 names in 8 categories — 2026-10-27

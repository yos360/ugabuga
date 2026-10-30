# New subjects backlog — /learn/<subject>

The owner's goal (2026-10-28): "that people reach the site from anything they search on Google". New
knowledge areas are built as full subjects in the existing framework (src/learn/subjects): lessons with a
quiz, a printable worksheet and FAQ, grade pages with sample exams, and a concept glossary where every
concept has its own page. A daily scheduled task builds the **next unchecked subject** from this list.

## How to add a subject (read src/learn/subjects/subjects.js and one existing subject first)
1. An entry in `SUBJECTS` (key, title, emoji, short, grades, files, gradeList, desc, seoTitle, seoDesc,
   paras, faq). Subjects outside the school curriculum still give a grade range — the age the lessons suit.
2. `src/learn/subjects/data/<key>.js` (and `<key>-more-a.js` … when long) exporting `TOPICS`: at least 12
   lessons, each ≥300 words in ≥3 sections, ≥4 facts, 8 quiz questions (right answer first), 3 think
   questions, 3 FAQ, related lessons. `tests/learn-subjects.test.mjs` checks all of it.
3. `src/learn/subjects/data/<key>-concepts.js` exporting `CONCEPTS` (glossary; each concept its own page):
   term, short, body, ≥2 examples, 3 quiz questions, the lesson that teaches it, related concepts.
4. `node scripts/generate-learn-subjects.mjs` (sitemap + site search), then the CLAUDE.md checks.
5. Link the new hub from the menu (src/data/siteMenu.js) in the fitting domain.

Depth (owner, 2026-10-28): go wide and deep — "10,000 pages is fine". Inside a subject, give every item its own
concept page: every musical instrument in the world (from the cymbal up), every composer and painter of note, every
dinosaur, every planet, every dog breed, every fruit. A first run builds the subject (12+ lessons + glossary); later
runs add "<key> part N" batches of 30–60 more concept pages until the area is covered.

Copyright (owner: "the most important thing"): every text is original. No copied text, song lyrics, musical scores,
photos or artwork under copyright. Pictures only from the site's own drawings or public-domain sources, with the
source and license recorded in the data. Famous paintings and music are described, not reproduced, unless the work
and the image are both in the public domain.

Content rules: original Hebrew, plain and accurate. Every number, date or record checked against two
sources; where sources disagree use the cautious form ("כ־", "לפי ההערכות") or leave it out. No brand or
price claims. Israeli names in examples. Kids' safety first (no dangerous experiments without an adult).

## Next (top first, by Google volume — Keyword Planner, Israel, Hebrew, 2026-10-28)
- [x] `photography` (done 2026-10-28) — צילום: מה זו מצלמה ואיך היא בנויה, אור וחשיפה, צמצם, תריס (שאטר), ISO, משולש החשיפה,
  עדשות (מוקד, זווית, סוגי עדשות: רחבה, טלה, מאקרו, פריים, זום), פוקוס ועומק שדה, קומפוזיציה (חוק השלישים,
  קווים מובילים, מסגור, סימטריה, נקודת מבט), סוגי צילום (נוף, דיוקן, מאקרו, ספורט, רחוב, לילה), צבע ואיזון לבן,
  תאורה (שעת הזהב, אור רך וקשה), עריכת תמונות (חיתוך, חשיפה, ניגודיות, ויניאט), צילום בטלפון, היסטוריה של הצילום.
- [x] `zodiac` (done 2026-10-29: 13 lessons, 33 concepts incl. a page per sign, "which sign am I?" tool; part 2 ideas: Chinese zodiac years, planets traditionally linked to signs, a page per Hebrew month) — מזלות (approved by the owner 2026-10-28): the 12 signs — name, dates, symbol, element, the
  constellation behind it, the matching Hebrew month, what each sign is traditionally said to stand for — presented
  as a cultural tradition, never as prediction or advice. A "which sign am I?" tool by birth date. Google: מזלות 8,100;
  each sign 5,400–8,100 a month; מזלות לפי חודשים 2,400; תאריכי מזלות 1,000.
- [x] `communities` (done 2026-10-30: 14 lessons, 42 concepts — a page per community, language, custom and dish; part 2 ideas below) — עדות ישראל (approved by the owner 2026-10-28): a page per community — אשכנזים (by region: פולין,
  רוסיה, גרמניה, הונגריה, רומניה), ספרדים, מרוקו, תימן, עיראק, פרס, כורדיסטן, בוכרה, קווקז (הרי), גאורגיה, אתיופיה,
  תוניסיה, לוב, מצרים, סוריה, טורקיה, יוון, הודו (בני ישראל, קוצ׳ין), איטליה, ועוד: where they lived, how and when
  they came to Israel, customs and holidays (e.g. מימונה, סיגד, חינה), traditional foods (a page per famous dish:
  ג׳חנון, מלאווח, קובה, צ׳ולנט, גפילטע פיש, מופלטה, שקשוקה, סביח…), music, dress and language (יידיש, לדינו,
  ערבית־יהודית, אמהרית). Also "how do I know which community I come from" — family names, places, family stories,
  and that many Israelis belong to several. Respectful, warm and accurate; no stereotypes, no ranking; facts and
  dates checked against two sources. Link the family-names pages (/family-names) and the holiday pages.
- [ ] `communities` part 2 — more concept pages: Algerian, Lebanese, Afghan, Indian (Bene Menashe), Cuban/Latin-American, Bulgarian, Yugoslav, Czech, Dutch, French, American Jewish communities; more dishes (קוסקוס, מרק חריירה, קציצות, קוגל, לביבות, סופגניות, מלוחיה, בריק, חצ׳פורי, פלוב, אינג׳רה, דורו וואט); Tu BiShvat/Purim customs by community; a lesson per region (Ashkenazi by country). Link /family-names and the holiday pages from lessons.
- [x] `dinosaurs` (done 2026-10-30: 16 lessons, 65 concepts — a page per famous dinosaur (34), per non-dinosaur reptile/ammonite (8) and per key term (23); part 2 ideas: more dinosaurs (Pachyrhinosaurus, Styracosaurus, Kentrosaurus, Amargasaurus, Patagotitan, Sinosauropteryx, Troodon-group, Mapusaurus, Tarbosaurus, Ouranosaurus, Leaellynasaura), museums, coloring pages per dinosaur after the owner approves drawings) — דינוזאורים: מה זה דינוזאור, תקופות (טריאס, יורה, קרטיקון), איך יודעים — מאובנים ופלאונטולוגים,
  דינוזאורים אוכלי בשר וצמחים, דינוזאורים מפורסמים (טירנוזאורוס, טריצרטופס, סטגוזאורוס, ברכיוזאורוס, ולוצירפטור,
  ספינוזאורוס, אנקילוזאורוס ועוד) — a lesson or concept per dinosaur, the extinction, birds as dinosaurs,
  pterosaurs and marine reptiles (not dinosaurs). Only what paleontology supports; say "לפי מה שמוכר היום".
  A coloring page per dinosaur needs new drawings — ask the owner first (image generation costs credits).
  Google, Israel, Hebrew, monthly: דינוזאורים 9,900 · סוגי דינוזאורים 880 · טי רקס 390 · דינוזאור מעופף 390 · שלד/מאובן/עצמות ~500.
- [ ] `fruits-vegetables` — פירות וירקות: לכל פרי וירק — מאיפה הגיע (ארץ המוצא ואיך הגיע לישראל ולעולם), איך הוא
  גדל (עץ, שיח, אדמה, מטפס), באיזו עונה בישראל, מה מיוחד בו. עונות הפירות והירקות בישראל, שבעת המינים, פירות
  הדר, ירקות שורש, "פרי או ירק?" (עגבנייה). A concept page per fruit and vegetable.
  Google: "<X> פרי או ירק" ~3,000 together (עגבנייה 720+320+320, אבוקדו 320+210, מלפפון 210, בננה, לימון, גמבה, אבטיח 90 each).
- [ ] `peoples` — עמים ושבטים בעולם: מה זה שבט ותרבות, האינדיאנים של אמריקה (כמה עמים, לא עם אחד), עמי האמזונס,
  המאורים, האינואיטים, הבדואים, עמי אפריקה, האבוריג׳ינים. Respectful, current, no stereotypes; present them as
  living peoples, not museum pieces. Facts checked.
  Google: אינדיאנים 3,600.
- [ ] `birds` — ציפורים: מבנה הציפור ומעוף, נדידה מעל ישראל (חסידות, עגורים, שקנאים, דורסים), ציפורים נפוצות
  בישראל (דרור, בולבול, צופית, דוכיפת — ציפור הלאומית, עורב, יונה, תוכי נזירי), ציפורי לילה, ציפורי מים, קינון
  וגוזלים, איך מתחילים לצפות בציפורים, שמירה על ציפורים, בעלי כנף שאינם ציפורים (עטלפים, חרקים).
  Google: ציפורים בישראל 880 · ציפורים נפוצות בישראל 590 · מגדיר ציפורים 260 · תמונות 210 · נודדות 110+140.
- [ ] `world-wonders` — מקומות מפורסמים בעולם: האוורסט, נהר האמזונס ויער הגשם, ים המלח, הגרנד קניון, מפלי
  הניאגרה, הסהרה, הפירמידות, החומה הסינית, מאצ׳ו פיצ׳ו, השונית הגדולה, אנטארקטיקה, הנילוס, הרי האלפים. A lesson
  per place (why famous, numbers checked against two sources, how it formed, who lives there).
  Google: האוורסט 590 · נהר האמזונס 480 · שבעת פלאי עולם 390+210 · עובדות על ים המלח 40.
- [ ] `computers` — מחשבים לילדים ולמבוגרים: איך מחשב בנוי (מעבד, זיכרון, אחסון, לוח אם), חומרה ותוכנה, מערכת
  הפעלה (Windows ואחרות), קבצים ותיקיות, התקנת תוכנה בבטחה, אינטרנט ודפדפן, סיסמאות ואבטחה, ייצוג מידע,
  מספרים בינאריים (ספירה, המרה, ביט ובייט), גיבוי, קיצורי מקלדת, היסטוריה של המחשב.
  Google: מספרים בינאריים 390.
- [ ] `dj-music` — די־ג׳יי ויצירת שירים: מה עושה די־ג׳יי, BPM וטמפו (סוגי טמפו: לרגו, אדג׳ו, אנדנטה, מודרטו,
  אלגרו, פרסטו), מקצבים וסגנונות, מיקס ומעברים (ביט־מאצ׳ינג), רימיקס, מבנה של שיר (פתיחה, בית, פזמון, גשר /
  C-part, סיום), כתיבת שירים (חריזה, מוטיב, מסר), לחן והרמוניה בסיסית, סמפול ולופ, ציוד (קונטרולר, מיקסר,
  אוזניות), שמירה על השמיעה. Link /music, /music/concepts, /music/metronome.
  Google: BPM 1,900 · מקצבים 880 · איך לכתוב שיר 90+90.
- [ ] `video` — וידאו וקולנוע: מושגי וידאו (פריים, קצב פריימים, רזולוציה, יחס גובה־רוחב), סוגי שוטים וזוויות,
  תנועות מצלמה, תסריט ותסריט צילומים (סטוריבורד), תאורה וסאונד, עריכה (חיתוך, מעברים, ציר זמן, ג׳אמפ קאט,
  מונטאז׳, צבע), מושגי קולנוע (ז׳אנרים, במאי, מפיק, צילום, ליהוק), היסטוריה של הקולנוע, יוצרים סרטון בטלפון.
  Google: עריכת סרטונים 880 · עריכת וידאו 720 (most searches want software — teach the craft and name free tool types without brands).
- [ ] `botany` — בוטניקה וגינון: חלקי הצמח, פוטוסינתזה, זרעים ונביטה, פקעות ובצלים, שתילה בעציץ ובגינה, השקיה
  ואדמה, פרחים לקיץ ולחורף בישראל, פרחי בר מוגנים בישראל, עצים בישראל, צמחי תבלין, גינת ירק, קומפוסט, מושגים
  (רב־שנתי, חד־שנתי, נשיר, ירוק־עד, האבקה).
  Google: צמחי בית 1,000 · פקעות 1,000 · צמחי בית עמידים 260 (mostly shopping; informational pages on care and seasons).
- [ ] `inventors` — ממציאים והמצאות: מי המציא ואיך — האחים רייט והמטוס, האופניים (מהדרייזינה של פון דרייס
  ועד אופני הבטיחות), המכונית (קרל בנץ ואחרים), החשמל (לא "הומצא" — גילויים של פרנקלין, וולטה, פאראדיי, ונורת
  החשמל של אדיסון וסוון), השעון (שעון שמש, מטוטלת — הויגנס), הדפוס (גוטנברג), הטלפון (בל ומוצ׳י), הרדיו, המחשב,
  האינטרנט, הפניצילין (פלמינג), הנורה, המקרר, הכתב, הגלגל ועוד, וממציאים ישראלים (טפטוף — שמחה בלאס, ועוד).
  The process each went through (attempts, failures, who else worked on it — most inventions had several
  inventors). Disputed "firsts" are presented as disputed. A concept page per invention.
  Google: מי המציא את המטוס 170 · ממציאים מפורסמים 40.
- [x] `how-its-made` (done 2026-10-30: 16 lessons — food, materials, clothes, energy & water, phone, car, house — and 59 concepts, a page per product and process; part 2 ideas: pasta/coffee/tea/honey lessons of their own, soap, toothpaste, cans, bicycles, books/printing, medicines, eggs) — איך מכינים את זה: הדברים שיש בבית ובמטבח ואיך הם מגיעים אלינו — אורז (משדה מוצף ועד שקית),
  גרעינים (חמנייה, קלייה), קטשופ, לחם וקמח, שוקולד (מפולי קקאו), חלב וגבינה, סוכר (קנה וסלק), שמן זית, פסטה,
  פופקורן, קפה, תה, דבש, מלח, גלידה, ובהמשך גם חפצים: עיפרון, נייר, זכוכית, פלסטיק. NOT home recipes — the
  owner means how the product itself comes to exist: where it grows, how it's harvested, what the factory does
  to it step by step, until it reaches the shelf. Where it is grown or made, and what's real vs. myth. No brand names.
  Google: איך מייצרים שוקולד 90 · איך מכינים קטשופ 50.
- [ ] `coding` — תכנות: מה זה תכנות ואלגוריתם, רצף/תנאי/לולאה, משתנים, תכנות בלוקים (Scratch), פייתון ראשון,
  HTML ו־CSS לבניית דף, ג׳אווהסקריפט ראשון, דיבאג (מציאת באגים), פונקציות, חשיבה חישובית. Code samples are
  shown, never run on the site.
  Google: פייתון למתחילים 210 · לימוד תכנות לילדים 30.
- [ ] `what-is` — "מה זה?": short, clear explainers of words people search as "מה זה …" (Google: "מה זה" 9,900 a month
  and a long tail — טרם, מנדט, משנה, פדיון, קונטור, צוהר, שבח, נדל״ן, פרקליטות…). One page per term: meaning, example,
  where the word comes from. Not a school subject — build it as its own glossary area (like the subject concept pages),
  picking terms from Keyword Planner ("מה זה" seeds) and the site's search gaps. Neutral, accurate, no legal/medical advice.
- [x] `space` (done 2026-10-30: 16 lessons, 74 concepts — a page per planet, the Sun, the Moon, 6 moons of note, 5 dwarf planets, famous stars and constellations, black holes, telescopes, missions incl. Artemis II, Israel in space; numbers checked against NASA/ESA + a second source; part 2 ideas: more moons (Callisto, Phobos, Charon), more stars (Vega, Antares, Rigel), constellation pages for all 12 zodiac + Scorpius/Cygnus, space agencies, Chinese/Indian missions, eclipses calendar for Israel) — החלל: כוכבי הלכת (עמוד לכל כוכב לכת, לשמש, לירח ולכוכבי לכת ננסיים), כוכבים וגלקסיות, חורים שחורים,
  אסטרונאוטים, חלליות ומעבורות, טלסקופים. Extend /discover/solar-system, don't duplicate it. Google: כוכבי לכת 4,400 ·
  חלל 5,400 · חלליות 5,400 · חורים שחורים 2,900 · החלל החיצון 1,900 · מערכת השמש לילדים 880 · כוכבי הלכת 720.
- [ ] `animals` — עולם החי לעומק: כרישים, נחשים, עכבישים, חרקים, לווייתנים, דולפינים, תמנונים, זוחלים, דו־חיים,
  יונקים בישראל. A page per animal group and per well-known species. Google: כרישים 9,900 · נחשים 9,900 · עכבישים
  4,400 · חרקים 2,400 · לווייתנים 320 · סוגי כרישים 320. Check what /learn/science and the animal-facts pages already
  cover; link, don't duplicate. Safety facts (venomous snakes/spiders in Israel) checked carefully.
- [ ] `pets-breeds` — כלבים, חתולים וחיות מחמד: גזעי כלבים (קטנים, בינוניים, גדולים; הכלב הכנעני), גזעי חתולים,
  סוגי סוסים, איך מטפלים בחיית מחמד, אחריות. Google: סוגי כלבים 6,600 · כלבים קטנים 1,600 · רועה כנעני 1,900 ·
  כלבים גדולים 880 · פודל 590 · גזעי חתולים 320 · סוגי סוסים 320. No buying advice, no brands.
- [ ] `earth-science` — כדור הארץ: רעידות אדמה (מה קורה ואיך מתכוננים — Pikud HaOref guidance), הרי געש, סוגי עננים,
  קשת בענן, מזג אוויר ואקלים, סלעים ומינרלים, אבני חן (as minerals, not jewelry). Google: רעידת אדמה 27,100 · קשת
  בענן 8,100 · מינרלים 1,300 · סוגי עננים 590 · הר געש מתפרץ 390.
- [ ] `ancient-worlds` — עולמות עתיקים: מצרים העתיקה והפירמידות, יוון העתיקה והמיתולוגיה היוונית (האלים), רומא, האבירים
  וימי הביניים, טירות, הוויקינגים. Google: אבירים 4,400 · פירמידות 2,900 · מיתולוגיה יוונית 880+880 · מצרים העתיקה 720 ·
  אלים יוונים 720. Check /learn/history first; this goes deeper (a page per god, per famous pharaoh/structure).
- [ ] `arts` — אמנות ומוזיקה: כלי נגינה (עמוד לכל כלי — כלי מיתר, נשיפה, הקשה), מלחינים מפורסמים, ציירים מפורסמים ויצירות.
  Google: כלי נגינה 3,600 · מלחינים 880 · ציירים מפורסמים 720 · עוד 880 · טובה 590 · מנדולינה 390.
- [ ] `sports` — ספורט: האולימפיאדה (היסטוריה, ענפים, ישראל באולימפיאדה), חוקי משחקים (כדורגל, כדורסל, טניס, שחמט),
  ענפי ספורט. Google: אולימפיאדה 2,900 · התעמלות קרקע 1,600 · התעמלות מכשירים 590 · שחמט חוקים 210.

Dropped by the owner: sign language.

When the list runs out, add subjects from what people search (Keyword Planner via Windsor.ai, and the
site's own search gaps — scripts/generate-search-gaps.mjs).

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

Content rules: original Hebrew, plain and accurate. Every number, date or record checked against two
sources; where sources disagree use the cautious form ("כ־", "לפי ההערכות") or leave it out. No brand or
price claims. Israeli names in examples. Kids' safety first (no dangerous experiments without an adult).

## Next (top first)
- [ ] `photography` — צילום: מה זו מצלמה ואיך היא בנויה, אור וחשיפה, צמצם, תריס (שאטר), ISO, משולש החשיפה,
  עדשות (מוקד, זווית, סוגי עדשות: רחבה, טלה, מאקרו, פריים, זום), פוקוס ועומק שדה, קומפוזיציה (חוק השלישים,
  קווים מובילים, מסגור, סימטריה, נקודת מבט), סוגי צילום (נוף, דיוקן, מאקרו, ספורט, רחוב, לילה), צבע ואיזון לבן,
  תאורה (שעת הזהב, אור רך וקשה), עריכת תמונות (חיתוך, חשיפה, ניגודיות, ויניאט), צילום בטלפון, היסטוריה של הצילום.
- [ ] `video` — וידאו וקולנוע: מושגי וידאו (פריים, קצב פריימים, רזולוציה, יחס גובה־רוחב), סוגי שוטים וזוויות,
  תנועות מצלמה, תסריט ותסריט צילומים (סטוריבורד), תאורה וסאונד, עריכה (חיתוך, מעברים, ציר זמן, ג׳אמפ קאט,
  מונטאז׳, צבע), מושגי קולנוע (ז׳אנרים, במאי, מפיק, צילום, ליהוק), היסטוריה של הקולנוע, יוצרים סרטון בטלפון.
- [ ] `dj-music` — די־ג׳יי ויצירת שירים: מה עושה די־ג׳יי, BPM וטמפו (סוגי טמפו: לרגו, אדג׳ו, אנדנטה, מודרטו,
  אלגרו, פרסטו), מקצבים וסגנונות, מיקס ומעברים (ביט־מאצ׳ינג), רימיקס, מבנה של שיר (פתיחה, בית, פזמון, גשר /
  C-part, סיום), כתיבת שירים (חריזה, מוטיב, מסר), לחן והרמוניה בסיסית, סמפול ולופ, ציוד (קונטרולר, מיקסר,
  אוזניות), שמירה על השמיעה. Link /music, /music/concepts, /music/metronome.
- [ ] `computers` — מחשבים לילדים ולמבוגרים: איך מחשב בנוי (מעבד, זיכרון, אחסון, לוח אם), חומרה ותוכנה, מערכת
  הפעלה (Windows ואחרות), קבצים ותיקיות, התקנת תוכנה בבטחה, אינטרנט ודפדפן, סיסמאות ואבטחה, ייצוג מידע,
  מספרים בינאריים (ספירה, המרה, ביט ובייט), גיבוי, קיצורי מקלדת, היסטוריה של המחשב.
- [ ] `coding` — תכנות: מה זה תכנות ואלגוריתם, רצף/תנאי/לולאה, משתנים, תכנות בלוקים (Scratch), פייתון ראשון,
  HTML ו־CSS לבניית דף, ג׳אווהסקריפט ראשון, דיבאג (מציאת באגים), פונקציות, חשיבה חישובית. Code samples are
  shown, never run on the site.
- [ ] `dinosaurs` — דינוזאורים: מה זה דינוזאור, תקופות (טריאס, יורה, קרטיקון), איך יודעים — מאובנים ופלאונטולוגים,
  דינוזאורים אוכלי בשר וצמחים, דינוזאורים מפורסמים (טירנוזאורוס, טריצרטופס, סטגוזאורוס, ברכיוזאורוס, ולוצירפטור,
  ספינוזאורוס, אנקילוזאורוס ועוד) — a lesson or concept per dinosaur, the extinction, birds as dinosaurs,
  pterosaurs and marine reptiles (not dinosaurs). Only what paleontology supports; say "לפי מה שמוכר היום".
  A coloring page per dinosaur needs new drawings — ask the owner first (image generation costs credits).
- [ ] `birds` — ציפורים: מבנה הציפור ומעוף, נדידה מעל ישראל (חסידות, עגורים, שקנאים, דורסים), ציפורים נפוצות
  בישראל (דרור, בולבול, צופית, דוכיפת — ציפור הלאומית, עורב, יונה, תוכי נזירי), ציפורי לילה, ציפורי מים, קינון
  וגוזלים, איך מתחילים לצפות בציפורים, שמירה על ציפורים, בעלי כנף שאינם ציפורים (עטלפים, חרקים).
- [ ] `botany` — בוטניקה וגינון: חלקי הצמח, פוטוסינתזה, זרעים ונביטה, פקעות ובצלים, שתילה בעציץ ובגינה, השקיה
  ואדמה, פרחים לקיץ ולחורף בישראל, פרחי בר מוגנים בישראל, עצים בישראל, צמחי תבלין, גינת ירק, קומפוסט, מושגים
  (רב־שנתי, חד־שנתי, נשיר, ירוק־עד, האבקה).
- [ ] `world-wonders` — מקומות מפורסמים בעולם: האוורסט, נהר האמזונס ויער הגשם, ים המלח, הגרנד קניון, מפלי
  הניאגרה, הסהרה, הפירמידות, החומה הסינית, מאצ׳ו פיצ׳ו, השונית הגדולה, אנטארקטיקה, הנילוס, הרי האלפים. A lesson
  per place (why famous, numbers checked against two sources, how it formed, who lives there).
- [ ] `peoples` — עמים ושבטים בעולם: מה זה שבט ותרבות, האינדיאנים של אמריקה (כמה עמים, לא עם אחד), עמי האמזונס,
  המאורים, האינואיטים, הבדואים, עמי אפריקה, האבוריג׳ינים. Respectful, current, no stereotypes; present them as
  living peoples, not museum pieces. Facts checked.
- [ ] `inventors` — ממציאים והמצאות: מי המציא ואיך — האחים רייט והמטוס, האופניים (מהדרייזינה של פון דרייס
  ועד אופני הבטיחות), המכונית (קרל בנץ ואחרים), החשמל (לא "הומצא" — גילויים של פרנקלין, וולטה, פאראדיי, ונורת
  החשמל של אדיסון וסוון), השעון (שעון שמש, מטוטלת — הויגנס), הדפוס (גוטנברג), הטלפון (בל ומוצ׳י), הרדיו, המחשב,
  האינטרנט, הפניצילין (פלמינג), הנורה, המקרר, הכתב, הגלגל ועוד, וממציאים ישראלים (טפטוף — שמחה בלאס, ועוד).
  The process each went through (attempts, failures, who else worked on it — most inventions had several
  inventors). Disputed "firsts" are presented as disputed. A concept page per invention.
- [ ] `fruits-vegetables` — פירות וירקות: לכל פרי וירק — מאיפה הגיע (ארץ המוצא ואיך הגיע לישראל ולעולם), איך הוא
  גדל (עץ, שיח, אדמה, מטפס), באיזו עונה בישראל, מה מיוחד בו. עונות הפירות והירקות בישראל, שבעת המינים, פירות
  הדר, ירקות שורש, "פרי או ירק?" (עגבנייה). A concept page per fruit and vegetable.
- [ ] `how-its-made` — איך מכינים את זה: הדברים שיש בבית ובמטבח ואיך הם מגיעים אלינו — אורז (משדה מוצף ועד שקית),
  גרעינים (חמנייה, קלייה), קטשופ, לחם וקמח, שוקולד (מפולי קקאו), חלב וגבינה, סוכר (קנה וסלק), שמן זית, פסטה,
  פופקורן, קפה, תה, דבש, מלח, גלידה, ובהמשך גם חפצים: עיפרון, נייר, זכוכית, פלסטיק. NOT home recipes — the
  owner means how the product itself comes to exist: where it grows, how it's harvested, what the factory does
  to it step by step, until it reaches the shelf. Where it is grown or made, and what's real vs. myth. No brand names.

When the list runs out, add subjects from what people search (Keyword Planner via Windsor.ai, and the
site's own search gaps — scripts/generate-search-gaps.mjs).

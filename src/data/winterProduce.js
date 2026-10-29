// Winter fruits and vegetables in Israel, Hebrew + English, for /printables/winter-fruits-vegetables.
// Only produce whose main Israeli season is winter (citrus, strawberries, cabbage family, root
// vegetables). `say` is the English word in Hebrew letters, for parents who don't read English.
export const WINTER_PRODUCE = [
  { id: 'orange', he: 'תפוז', en: 'orange', say: 'אוֹרֶנְג׳', kind: 'fruit', note: 'מלך ההדרים של החורף — קוטפים מדצמבר.' },
  { id: 'clementine', he: 'קלמנטינה', en: 'clementine', say: 'קְלֶמֶנְטַיְן', kind: 'fruit', note: 'קטנה, מתוקה וקלה לקילוף — בדיוק לקופסת האוכל.' },
  { id: 'grapefruit', he: 'אשכולית', en: 'grapefruit', say: 'גְרֵייפְּפְרוּט', kind: 'fruit', note: 'הדר גדול וחמצמץ. בפנים — אדומה או צהובה.' },
  { id: 'lemon', he: 'לימון', en: 'lemon', say: 'לֶמוֹן', kind: 'fruit', note: 'יש לימונים כל השנה, אבל העונה העיקרית שלהם היא החורף.' },
  { id: 'strawberry', he: 'תות', en: 'strawberry', say: 'סְטְרוֹבֶּרִי', kind: 'fruit', note: 'התות הישראלי מגיע בחורף ונמשך עד האביב.' },
  { id: 'kiwi', he: 'קיווי', en: 'kiwi', say: 'קִיוִוי', kind: 'fruit', note: 'נקטף בסוף הסתיו, ואוכלים אותו כל החורף.' },
  { id: 'cauliflower', he: 'כרובית', en: 'cauliflower', say: 'קוֹלִיפְלַאוֶור', kind: 'veg', note: 'ראש לבן של פרחים קטנים, עטוף בעלים ירוקים.' },
  { id: 'broccoli', he: 'ברוקולי', en: 'broccoli', say: 'בְּרוֹקוֹלִי', kind: 'veg', note: 'נראה כמו עץ קטן וירוק.' },
  { id: 'cabbage', he: 'כרוב', en: 'cabbage', say: 'קֶבֶּג׳', kind: 'veg', note: 'עלים על עלים — ירוק או סגול.' },
  { id: 'carrot', he: 'גזר', en: 'carrot', say: 'קֶרוֹט', kind: 'veg', note: 'שורש כתום שגדל מתחת לאדמה.' },
  { id: 'beet', he: 'סלק', en: 'beet', say: 'בִּיט', kind: 'veg', note: 'שורש עגול ואדום שצובע הכול בוורוד.' },
  { id: 'peas', he: 'אפונה', en: 'peas', say: 'פִּיז', kind: 'veg', note: 'אפונה טרייה בתרמיל — בחורף ובתחילת האביב.' },
]

export const WINTER_FRUITS = WINTER_PRODUCE.filter(p => p.kind === 'fruit')
export const WINTER_VEGETABLES = WINTER_PRODUCE.filter(p => p.kind === 'veg')
export const produceById = id => WINTER_PRODUCE.find(p => p.id === id)

export const WINTER_PRODUCE_FAQ = [
  { q: 'אילו פירות וירקות יש בחורף בישראל?', a: 'בחורף יש בשפע הדרים — תפוז, קלמנטינה, אשכולית, פומלה ולימון — וגם תות שדה וקיווי. מהירקות: כרובית, ברוקולי, כרוב, גזר, סלק ואפונה טרייה. בדפים יש 12 מהם, כל אחד בעברית ובאנגלית.' },
  { q: 'לאיזה גיל מתאימים הדפים?', a: 'דפי הצביעה, המיון והתאמת התמונה למילה מתאימים לגן חובה. דפי "כתבו את המילה באנגלית" מתאימים לכיתות א׳–ג׳ ולשיעורי אנגלית ראשונים.' },
  { q: 'איך משתמשים בדפים בשיעור אנגלית?', a: 'מתחילים בכרטיסיות: מראים תמונה, אומרים את המילה באנגלית והילדים חוזרים. אחר כך דף ההתאמה (עברית–תמונה–אנגלית), ובסוף דף הכתיבה — קודם עם מילים לעקוב עליהן, ואז עם בנק מילים.' },
  { q: 'עגבנייה היא פרי או ירק?', a: 'בבוטניקה — פרי, כי יש בה זרעים. במטבח ובגן מתייחסים אליה כירק. בדף המיון בחרנו רק פירות וירקות שאין עליהם ויכוח, כדי שיהיה ברור לילדים הקטנים.' },
  { q: 'האם הדפים חינמיים?', a: 'כן. לוחצים על דף, רואים תצוגה מקדימה ומדפיסים או שומרים כ-PDF. כל הציורים מקוריים ונוצרו במיוחד לאתר.' },
]

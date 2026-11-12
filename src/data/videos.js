// The site's own YouTube videos (channel UCFXZd5zbGFzkMgMHoMdKkwQ), newest first.
// Each video shows on the page(s) of the tool it demonstrates (`paths`, exact match) and on /videos.
//   kind: 'short' (vertical promo reel, 9:16) | 'tutorial' (longer how-to, 16:9)
//   desc: one or two sentences for the card and the VideoObject structured data.
// Imported by the layout for the path lookup, so keep entries short.
export const VIDEO_CATEGORIES = [
  { id: 'party', label: 'מסיבות ואירועים', emoji: '🎉' },
  { id: 'classroom', label: 'לכיתה ולגן', emoji: '🏫' },
  { id: 'holidays', label: 'חגים', emoji: '🕯️' },
  { id: 'learning', label: 'לומדים', emoji: '📚' },
  { id: 'travel', label: 'בדרכים', emoji: '🚗' },
  { id: 'tools', label: 'כלים ושירותים', emoji: '🛠️' },
]

export const VIDEOS = [
  { id: 'OpHFRrhEfvw', kind: 'tutorial', title: 'איך מכינים מחזיק מפתחות עם שם להדפסה בתלת־ממד בעוגה בוגה — מדריך קצר', paths: ['/3d-print/name-keychain'], category: 'tools', date: '2026-11-12',
    desc: 'מדריך קצר למחולל מחזיקי המפתחות: כותבים שם בעברית, רואים אותו בתלת־ממד, בוחרים מחזיק מפתחות או שלט לדלת החדר ומורידים קובץ STL אחד, או שני קבצים (בסיס ואותיות) למדפסת עם כמה צבעים. הדגם נבנה בדפדפן, והשם לא נשלח לשום מקום.' },
  { id: 'tpfCkzAY5Yc', kind: 'tutorial', title: 'איך מלמדים שברים בכיתות ד׳–ה׳ בעוגה בוגה — מדריך קצר', paths: ['/math/fractions'], category: 'learning', date: '2026-11-12',
    desc: 'מדריך קצר לשברים לכיתות ד׳–ה׳ למורים ולהורים: 11 שלבים לפי סדר הלימוד, ובכל שלב הרעיון, דוגמה, איך מלמדים והטעות הנפוצה, עם תרגול אונליין ודף עבודה עם דף תשובות. בדף יש גם קיר שברים, כלי להשוואת שברים בציור ושישה רעיונות לתרגול בבית — חינם, בלי הרשמה.' },
  { id: '1JjZOMBKbqw', kind: 'tutorial', title: 'איך מדפיסים סולמות ונחשים של כפל וחילוק בעוגה בוגה — מדריך קצר', paths: ['/board-games/snakes-and-ladders/multiplication'], category: 'learning', date: '2026-11-11',
    desc: 'מדריך קצר ללוח סולמות ונחשים של כפל וחילוק להדפסה: בוחרים רמה (כפל עד 5, כל לוח הכפל או 6 עד 9), עם תרגילים או לוח ריק שהמורה ממלאה, בצבע או בשחור־לבן, ותרגילים חדשים בכל לחיצה. מדפיסים את הלוח ואת כרטיס התשובות לשופט — חינם, בלי הרשמה.' },
  { id: 'TvKvLI8f0RI', kind: 'tutorial', title: 'איך משחקים ב"מצאו את ההבדלים" בעוגה בוגה — מדריך קצר', paths: ['/online-games/find-differences', '/printables/activity/find-differences'], category: 'learning', date: '2026-11-11',
    desc: 'מדריך קצר למשחק מצאו את ההבדלים: בוחרים אחד מ־18 שלבים (מ־3 הבדלים ועד 7), לוחצים על מה שהשתנה באחת התמונות, אחרי 10 שניות אפשר לקבל רמז, ובסוף כל שלב מקבלים כוכבים. יש גם דפים להדפסה לפי נושא וגיל, עם פתרון בתחתית הדף — חינם, בלי הרשמה.' },
  { id: 'rvE50lX_-50', kind: 'tutorial', title: 'איך מכינים ספר מקופל לילדים מדף אחד בעוגה בוגה — מדריך קצר', paths: ['/printables/my-book'], category: 'learning', date: '2026-11-11',
    desc: 'מדריך קצר לספר המקופל: בוחרים נושא מוכן (עליי, סיפור, משפחה, חנוכה, חורף או ספר ריק), כותבים שורה לכל עמוד, בוחרים איך ייראה כל עמוד (רק ציור, ציור ו־2 שורות, כתיבה או קומיקס), מדפיסים דף A4 אחד עם דף הוראות קיפול, גוזרים חריץ קטן ומקפלים לספר של 8 עמודים — חינם, בלי הרשמה.' },
  { id: 'kZhsRyZitXc', kind: 'tutorial', title: 'איך מפעילים שעון מסך מלא עם ספרות מתהפכות בעוגה בוגה — מדריך קצר', paths: ['/tools/flip-clock'], category: 'tools', date: '2026-11-10',
    desc: 'מדריך קצר לשעון מסך מלא: לוחצים "מסך מלא" והשעה ממלאת את כל המסך, מפעילים את צליל הקליק, בוחרים אחד מחמישה צבעים, מדליקים ומכבים שניות, 12/24 שעות ותאריך, ובמסך מלא הכפתורים נעלמים אחרי שלוש שניות — חינם, בלי התקנה.' },
  { id: 'NyaZ1TaLQ6A', kind: 'tutorial', title: 'איך מעצבים אלבום תמונות להדפסה בעוגה בוגה — מדריך קצר', paths: ['/tools/album', '/tools/album/wedding', '/tools/album/bar-mitzvah', '/tools/album/bat-mitzvah', '/tools/album/birthday'], category: 'tools', date: '2026-11-10',
    desc: 'מדריך קצר למעצב האלבומים: מעלים את כל התמונות בבת אחת והאלבום מסתדר לבד לפי תאריך הצילום, בוחרים סגנון בלחיצה אחת, עוברים בין הכפולות, משנים כל תמונה (סיבוב, חיתוך, שחור-לבן) ומורידים PDF להדפסה או JPG לכל כפולה למעבדה — חינם, בלי הרשמה.' },
  { id: 'hTosFJ393jk', kind: 'tutorial', title: 'איך מכינים מבחן אמצע שנה בחשבון בעוגה בוגה — מדריך קצר', paths: ['/math/tests/grade-4/mid-year', '/math/tests/grade-1/mid-year', '/math/tests/grade-2/mid-year', '/math/tests/grade-3/mid-year', '/math/tests/grade-5/mid-year', '/math/tests/grade-6/mid-year', '/math/tests/grade-7/mid-year', '/math/tests/grade-8/mid-year', '/math/tests/grade-9/mid-year'], category: 'learning', date: '2026-11-10',
    desc: 'מדריך קצר למבחן אמצע השנה בחשבון לכיתות א׳–ט׳: מסמנים רק את הנושאים שהכיתה כבר למדה, בוחרים רמה ו־10 או 20 שאלות, ופותרים במסך עם ציון והסבר לכל טעות או מדפיסים עם דף תשובות — חינם, בלי הרשמה.' },
  { id: 'lBicQoI0IZ0', kind: 'tutorial', title: 'איך מעצבים חולצת מחזור וסיום קורס בעוגה בוגה — מדריך קצר', paths: ['/tools/shirt-designer'], category: 'tools', date: '2026-11-09',
    desc: 'מדריך קצר לעיצוב חולצות: בוחרים אירוע (סוף מסלול, סיום קורס, מסע כומתה, י״ב, גן ועוד), ציור ופריסה, כותבים כיתוב ובוחרים גופן וצבעים, מוסיפים שמות לגב ומורידים PNG שקוף או SVG לבית הדפוס — חינם, בלי הרשמה.' },
  { id: '1kNvTYwMdec', kind: 'tutorial', title: 'איך מעצבים תמונת מחזור לגן ולכיתה בעוגה בוגה — מדריך קצר', paths: ['/printables/class-photo/hanukkah', '/printables/class-photo'], category: 'classroom', date: '2026-11-09',
    desc: 'מדריך קצר לתמונת המחזור: בוחרים עיצוב וצורת מסגרת, כותבים את שם הגן או בית הספר, מוסיפים קובייה לכל איש צוות, מדביקים רשימת שמות ומוסיפים הרבה תמונות בבת אחת, ומדפיסים או שומרים כ־PDF — חינם, בלי הרשמה.' },
  { id: 'GQhZiGlL0v0', kind: 'tutorial', title: 'איך קוראים סיפורים לראשית קריאה לפי הניקוד בעוגה בוגה — מדריך קצר', paths: ['/letters/first-reading-stories'], category: 'learning', date: '2026-11-09',
    desc: 'מדריך קצר לסיפורים לראשית קריאה: בוחרים שלב ניקוד (קמץ ופתח עד שורוק וקובוץ, או כיתה ב׳–ג׳), קוראים סיפור שכתוב רק בניקוד שנלמד, עונים על שאלות הבנה עם משוב ומדפיסים את השלב עם דף תשובות — חינם, בלי הרשמה.' },
  { id: 'Y7y0sUS3OE0', kind: 'tutorial', title: 'איך משחקים בבלש לוח הכפל בעוגה בוגה — מדריך קצר', paths: ['/learn/multiplication-table/game'], category: 'learning', date: '2026-11-08',
    desc: 'מדריך קצר לבלש לוח הכפל: בוחרים משימה (פנס הבלש, צייד המשבצות או המספר התאום), בוחרים טבלה עד 5×5 או עד 10×10 ויוצאים לחקירה — 10 משימות בכל סיבוב ועד 3 כוכבים, חינם, בלי הרשמה.' },
  { id: 'OPvNBDloxtk', kind: 'tutorial', title: 'איך צובעים דף צביעה במסך בעוגה בוגה — מדריך קצר', paths: ['/printables/coloring'], category: 'tools', date: '2026-11-08',
    desc: 'מדריך קצר לצביעה במסך: פותחים ציור לצביעה, לוחצים על "לצבוע את הציור במסך", בוחרים צבע ומקישים על אזור, מבטלים או מתחילים מהתחלה ושומרים את הציור הצבוע כתמונה — חינם, בלי הרשמה.' },
  { id: 'zYIW9FwYK5A', kind: 'tutorial', title: 'איך יוצרים דף עבודה מהמילים שלכם בעוגה בוגה — מדריך קצר', paths: ['/tools/worksheet-maker'], category: 'learning', date: '2026-11-08',
    desc: 'מדריך קצר למחולל דפי העבודה: כותבים עד 10 מילים, מוסיפים אימוג׳י, בוחרים משימות (מקווקוות, העתקה, אות חסרה, אותיות מבולבלות, מילה ותמונה) ומדפיסים עם דף תשובות — חינם, בלי הרשמה.' },
  { id: 'iTa0hpnJF4Q', kind: 'tutorial', title: 'איך פותרים חשבון של חנוכה בעוגה בוגה — מדריך קצר', paths: ['/holidays/hanukkah/math'], category: 'learning', date: '2026-11-07',
    desc: 'מדריך קצר לחשבון של חנוכה לכיתות א׳–ו׳: בוחרים כיתה, פותרים 6 בעיות מילוליות במסך עם בדיקה ו"איך פותרים?", משחקים במשחק סביבון של חשבון ומדפיסים דף עבודה ודף פתרונות — חינם, בלי הרשמה.' },
  { id: 'wLMGpwCLqWY', kind: 'tutorial', title: 'איך מצפינים ומפענחים הודעות סודיות בעוגה בוגה — מדריך קצר', paths: ['/tools/secret-codes'], category: 'learning', date: '2026-11-07',
    desc: 'מדריך קצר לכתב סתרים וצפנים: בוחרים צופן, כותבים הודעה ומקבלים אותה מוצפנת, מפענחים, פותרים משימה של חמש הודעות ומדפיסים דפי "פענחו את ההודעה" מהגן ועד כיתה ו׳ — חינם, בלי הרשמה.' },
  { id: 'dvkHoE6iPss', kind: 'tutorial', title: 'איך בונים תוכנית שיעורי עזר בבית בעוגה בוגה — מדריך קצר', paths: ['/tutoring'], category: 'learning', date: '2026-11-07',
    desc: 'מדריך קצר לשיעורי עזר בבית: בוחרים כיתה ובמה קשה, כמה זמן יש לכם, ומקבלים תוכנית לשבוע או לחודש עם מפגש קצר בכל יום, תרגול באתר ודפי עבודה — חינם, בלי הרשמה.' },
  { id: 't0AZS2SrPmU', kind: 'tutorial', title: 'איך מתרגלים למבחני בגרות בעוגה בוגה — מדריך קצר', paths: ['/bagrut'], category: 'learning', date: '2026-11-06',
    desc: 'מדריך קצר למבחני התרגול לבגרות: בוחרים מקצוע ומספר יחידות, רואים מה יש במבחן, מדפיסים לתלמיד בלי דף התשובות ובודקים אחר כך מול הדף — חינם, בלי הרשמה.' },
  { id: 'VYuaTFQQemo', kind: 'tutorial', title: 'איך בוחרים מה לשים בשקית הפתעה ליום הולדת בעוגה בוגה — מדריך קצר', paths: ['/birthday/party-bags'], category: 'party', date: '2026-11-05',
    desc: 'מדריך קצר לשקיות הפתעה: בוחרים גיל ותקציב, מקבלים שקית לדוגמה עם מחיר, מסננים בלי פלסטיק ובלי ממתקים ומדפיסים תוויות ומדבקות עם שם — חינם, בלי הרשמה.' },
  { id: 'jziSpRpEj8I', kind: 'tutorial', title: 'איך מחברים, מקטינים וחותמים על PDF בעוגה בוגה — מדריך קצר', paths: ['/tools/pdf'], category: 'tools', date: '2026-11-04',
    desc: 'מדריך קצר לסטודיו ה־PDF: מחברים קבצי PDF ותמונות לקובץ אחד, מסדרים עמודים, מקטינים לשליחה וחותמים בלי מדפסת — הכל בדפדפן, בלי הרשמה.' },
  { id: 'rrmNDBL6TvY', kind: 'tutorial', title: 'איך מקלידים עברית עם ניקוד בכל מחשב בעוגה בוגה — מדריך קצר', paths: ['/tools/keyboard'], category: 'tools', date: '2026-11-04',
    desc: 'מדריך קצר למקלדת העברית אונליין: מקלידים עברית גם במחשב בלי עברית, מוסיפים ניקוד, סימנים ואימוג׳ים, מפעילים צבעי אצבעות ומעתיקים או שולחים בוואטסאפ.' },
  { id: '-4RMMZdPBVc', kind: 'short', title: 'אירוע בלי כאב ראש: אישורי הגעה, מי מביא מה וגמד וענק', paths: ['/rsvp', '/tools/bring-list', '/secret-friend'], category: 'party', date: '2026-10-29',
    desc: 'שלושה כלים חינמיים שחוסכים את הבלגן של כל אירוע: טופס אישורי הגעה, רשימת "מי מביא מה" והגרלת גמד וענק — שולחים קישור בוואטסאפ וזהו.' },
  { id: '1YnuhkZy1Nk', kind: 'short', title: 'העוגה נעלמה! חדר בריחה מודפס לילדים', paths: ['/tools/escape-rooms'], category: 'party', date: '2026-10-27',
    desc: 'חדר בריחה שמדפיסים בבית: מסתירים את הרמזים, והילדים פותרים חידות עד שמוצאים את העוגה — משחק מוכן ליום הולדת, לחופש או לכיתה.' },
  { id: '6HazN0BZLJY', kind: 'short', title: 'כמה עוד נשאר?! נוסעים עם בוגה', paths: ['/travel'], category: 'travel', date: '2026-10-26',
    desc: 'משחקים ופעילויות לנסיעה — ברכב, ברכבת ובטיסה, גם בלי אינטרנט — כדי שהשאלה "כמה עוד נשאר?" תגיע הרבה יותר מאוחר.' },
  { id: 'Cqs_y7Pqie0', kind: 'short', title: 'הפעם מצביעים בוגה! בחירות בכיתה', paths: ['/tools/class-elections'], category: 'classroom', date: '2026-10-25',
    desc: 'עורכים בחירות בכיתה, כמו בגדול — דרך כיפית ללמד את הילדים מה זו דמוקרטיה.' },
  { id: 'DyVuSAMV4xQ', kind: 'short', title: 'חסר לכם דף עבודה? מבקשים ואנחנו מכינים', paths: ['/request'], category: 'tools', date: '2026-10-24',
    desc: 'לא מצאתם את הדף שחיפשתם? כותבים לנו מה צריך — ואנחנו מכינים אותו ומעלים לאתר, בחינם.' },
  { id: 'MernkShUmoc', kind: 'short', title: 'חידון חי לכל הכיתה — בוגה לייב', paths: ['/live'], category: 'classroom', date: '2026-10-22',
    desc: 'חידון בזמן אמת לכל הכיתה: מקרינים את השאלות על הלוח, והמשתתפים עונים מהטלפון.' },
  { id: 'xUxa-ogDuCo', kind: 'short', title: 'יום הולדת בקרוב? ההזמנה מוכנה בדקה', paths: ['/invitation'], category: 'party', date: '2026-10-21',
    desc: 'מכינים הזמנה ליום הולדת בדקה: בוחרים עיצוב, ממלאים פרטים ושולחים בוואטסאפ או מדפיסים.' },
  { id: 'ZRI6gufvh-c', kind: 'short', title: 'מתכוננים לכיתה א׳ עם פעילות אנגלית', paths: ['/classroom/first-grade'], category: 'learning', date: '2026-10-20',
    desc: 'פעילויות קצרות שמכינות את הילדים לכיתה א׳ — כולל צעדים ראשונים באנגלית, בדרך של משחק.' },
]

// Link text for the tool pages on the /videos cards.
export const VIDEO_PAGE_LABELS = {
  '/3d-print/name-keychain': 'מחזיק מפתחות עם שם',
  '/math/fractions': 'שברים לכיתות ד׳–ה׳',
  '/bagrut': 'מבחני תרגול לבגרות', '/rsvp': 'אישורי הגעה', '/tools/bring-list': 'מי מביא מה', '/secret-friend': 'גמד וענק',
  '/tools/escape-rooms': 'חדרי בריחה', '/travel': 'נוסעים עם בוגה', '/tools/class-elections': 'בחירות בכיתה',
  '/request': 'מבקשים דף', '/live': 'בוגה לייב', '/invitation': 'מחולל הזמנות', '/classroom/first-grade': 'הכנה לכיתה א׳',
  '/tools/dice': 'קובייה וירטואלית', '/learn/multiplication-game': 'משחק לוח הכפל',
  '/tools/keyboard': 'מקלדת עברית אונליין',
  '/tools/pdf': 'סטודיו PDF',
  '/tools/flip-clock': 'שעון מסך מלא',
  '/printables/my-book': 'ספר מקופל מדף אחד',
  '/board-games/snakes-and-ladders/multiplication': 'סולמות ונחשים של כפל וחילוק',
  '/online-games/find-differences': 'משחק מצאו את ההבדלים', '/printables/activity/find-differences': 'דפי מצאו את ההבדלים',
  '/tools/album': 'מעצב אלבומים', '/tools/album/wedding': 'אלבום חתונה', '/tools/album/bar-mitzvah': 'אלבום בר מצווה',
  '/tools/album/bat-mitzvah': 'אלבום בת מצווה', '/tools/album/birthday': 'אלבום יום הולדת',
  '/birthday/party-bags': 'שקיות הפתעה',
  '/tutoring': 'שיעורי עזר בבית',
  '/tools/secret-codes': 'כתב סתרים וצפנים',
  '/holidays/hanukkah/math': 'חשבון של חנוכה',
  '/tools/worksheet-maker': 'מחולל דפי עבודה',
  '/printables/coloring': 'דפי צביעה',
  '/learn/multiplication-table/game': 'בלש לוח הכפל',
  '/letters/first-reading-stories': 'סיפורים לראשית קריאה',
  '/printables/class-photo/hanukkah': 'תמונת מחזור לחנוכה בגן',
  '/printables/class-photo': 'תמונת מחזור',
  '/tools/shirt-designer': 'עיצוב חולצות',
  '/math/tests/grade-1/mid-year': 'מבחן אמצע שנה לכיתה א׳', '/math/tests/grade-2/mid-year': 'מבחן אמצע שנה לכיתה ב׳',
  '/math/tests/grade-3/mid-year': 'מבחן אמצע שנה לכיתה ג׳', '/math/tests/grade-4/mid-year': 'מבחן אמצע שנה לכיתה ד׳',
  '/math/tests/grade-5/mid-year': 'מבחן אמצע שנה לכיתה ה׳', '/math/tests/grade-6/mid-year': 'מבחן אמצע שנה לכיתה ו׳',
  '/math/tests/grade-7/mid-year': 'מבחן אמצע שנה לכיתה ז׳', '/math/tests/grade-8/mid-year': 'מבחן אמצע שנה לכיתה ח׳',
  '/math/tests/grade-9/mid-year': 'מבחן אמצע שנה לכיתה ט׳',
}

const SITE = 'https://ugabuga.co.il'
const norm = p => (p || '/').replace(/\/+$/, '') || '/'

/** Videos that demonstrate the page at `pathname` (exact match, trailing slash ignored). */
export function videosForPath(pathname) {
  const p = norm(pathname)
  if (p === '/') return []
  return VIDEOS.filter(v => v.paths.includes(p))
}

export const videoThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const videoEmbed = id => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
export const videoWatchUrl = v => v.kind === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`

/** Pages a video sitemap entry belongs to: its tool pages and /videos. */
export function videoSitemapPages() {
  const pages = { '/videos': VIDEOS }
  for (const v of VIDEOS) for (const p of v.paths) (pages[p] ||= []).push(v)
  return pages
}

const xmlEsc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** <video:video> block for the sitemap (https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps). */
export function videoSitemapTag(v) {
  return '<video:video>'
    + `<video:thumbnail_loc>${videoThumb(v.id)}</video:thumbnail_loc>`
    + `<video:title>${xmlEsc(v.title)}</video:title>`
    + `<video:description>${xmlEsc(v.desc || v.title)}</video:description>`
    + `<video:player_loc>https://www.youtube.com/embed/${v.id}</video:player_loc>`
    + `<video:publication_date>${v.date}T12:00:00+02:00</video:publication_date>`
    + '<video:family_friendly>yes</video:family_friendly>'
    + '</video:video>'
}

/** schema.org VideoObject for one video. */
export function videoSchema(v, withContext = true) {
  return {
    ...(withContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'VideoObject',
    'name': v.title,
    'description': v.desc || v.title,
    'thumbnailUrl': [videoThumb(v.id)],
    'uploadDate': `${v.date}T12:00:00+02:00`,
    'embedUrl': `https://www.youtube-nocookie.com/embed/${v.id}`,
    'contentUrl': videoWatchUrl(v),
    'inLanguage': 'he',
    'publisher': { '@type': 'Organization', 'name': 'עוגה בוגה', 'url': SITE },
  }
}

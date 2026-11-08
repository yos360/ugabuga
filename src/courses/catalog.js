// /courses: every free course on the site. Courses built on the shared lesson player load their
// data lazily (one chunk per course); Excel and touch typing have their own interactive pages.
export const COURSES_BASE = '/courses'

export const COURSES = [
  { slug: 'word', emoji: '📝', title: 'קורס וורד למתחילים', short: 'מסמך מסודר, טבלה, תמונות ועבודה להגשה', who: 'לתלמידים מכיתה ד׳, להורים ולמחפשי עבודה' },
  { slug: 'slides', emoji: '📊', title: 'קורס מצגות', short: 'פאוורפוינט וגוגל מצגות: עיצוב, תמונות, גרפים והצגה בכיתה', who: 'לתלמידים מכיתה ד׳, למורים ולמתחילים' },
  { slug: 'google', emoji: '☁️', title: 'קורס גוגל לתלמידים', short: 'דרייב, Docs, Sheets, טפסים וקלאסרום', who: 'לתלמידים מכיתה ד׳ ולהורים' },
  { slug: 'safety', emoji: '🛡️', title: 'בטיחות ברשת', short: 'סיסמאות, הונאות, זרים, חרם ומשחקים', who: 'לילדים מכיתה ב׳, יחד עם ההורים' },
  { slug: 'ai', emoji: '🤖', title: 'בינה מלאכותית לתלמידים', short: 'איך שואלים, איך בודקים, ומה מותר בשיעורי בית', who: 'לתלמידים מכיתה ה׳ ולהורים' },
  { slug: 'scratch', emoji: '🐱', title: 'סקראץ׳ לילדים', short: 'בונים משחק "תופסים תפוחים" ב־7 שיעורים', who: 'לילדים מכיתה ב׳' },
  { slug: 'python', emoji: '🐍', title: 'פייתון לנוער', short: 'מהשורה הראשונה ועד משחק ניחוש', who: 'מכיתה ה׳ ומעלה' },
  { slug: 'english', emoji: '🔤', title: 'אנגלית מאפס להורים וילדים', short: 'אותיות וצלילים, מילים ראשונות, משפטים וקריאה', who: 'לילדים מגיל 5 יחד עם ההורים' },
  { slug: 'reading', emoji: '📖', title: 'הבנת הנקרא והכנה למיצ״ב', short: 'איתור מידע, הסקת מסקנות, רעיון מרכזי ושאלות פתוחות', who: 'לתלמידים בכיתות ג׳–ח׳' },
  { slug: 'birthday', emoji: '🎂', title: 'יום הולדת בבית מא׳ עד ת׳', short: 'תכנון, הזמנה, לוח זמנים, משחקים, עוגה והפתעות', who: 'להורים' },
  { slug: 'teachers', emoji: '🍎', title: 'כלים דיגיטליים למורים', short: 'חידון כיתתי, שיעורי בית מקוונים, דפי עבודה ומתכנן שיעורים', who: 'למורים ולגננות' },
  { slug: 'money', emoji: '💰', title: 'חינוך פיננסי לילדים ולנוער', short: 'דמי כיס, תקציב, חיסכון למטרה, קנייה חכמה, בנק וריבית', who: 'לילדים מכיתה ג׳, לנוער ולהורים' },
  { slug: 'canva', emoji: '🎨', title: 'קנבה למורים ולמתחילים', short: 'דף עבודה, הזמנה, תעודה, מצגת וסרטון — עם עברית תקינה', who: 'למורים, לגננות, להורים ולתלמידים מכיתה ה׳' },
  { slug: 'chess', emoji: '♟️', title: 'שחמט לילדים מאפס', short: 'הלוח, איך זז כל כלי, שח ומט, הצרחה, פתיחה ומלכודות', who: 'לילדים מגיל 6 ולהורים' },
  { slug: 'piano', emoji: '🎹', title: 'פסנתר למתחילים', short: 'המקלדת, שמות התווים, שיר ראשון, קצב ושתי ידיים', who: 'לילדים ולמבוגרים, על אורגנית או פסנתר באתר' },
  { slug: 'first-grade', emoji: '🎒', title: 'הכנה לכיתה א׳ להורים', short: 'צלילים ואותיות, מספרים, מוטוריקה, עצמאות ותוכנית לקיץ', who: 'להורים לילדי גן חובה' },
  { slug: 'spanish', emoji: '🇪🇸', title: 'ספרדית למתחילים', short: 'הגייה, ברכות, מספרים, אוכל, ser ו־estar ו־50 משפטים לטיול', who: 'לנוער ולמבוגרים מאפס' },
  { slug: 'excel', href: '/excel', emoji: '📗', title: 'קורס אקסל', short: '10 שיעורים עם גיליון חי שבודק כל משימה', who: 'למתחילים מאפס' },
  { slug: 'typing', href: '/typing', emoji: '⌨️', title: 'הקלדה עיוורת', short: '25 שיעורים, מקלדת צבעונית ומילים לדקה', who: 'לילדים ולמבוגרים' },
]

export const LOAD = {
  word: () => import('./data/word.js'),
  slides: () => import('./data/slides.js'),
  google: () => import('./data/google.js'),
  safety: () => import('./data/safety.js'),
  ai: () => import('./data/ai.js'),
  scratch: () => import('./data/scratch.js'),
  python: () => import('./data/python.js'),
  english: () => import('./data/english.js'),
  reading: () => import('./data/reading.js'),
  birthday: () => import('./data/birthday.js'),
  teachers: () => import('./data/teachers.js'),
  money: () => import('./data/money.js'),
  canva: () => import('./data/canva.js'),
  chess: () => import('./data/chess.js'),
  piano: () => import('./data/piano.js'),
  'first-grade': () => import('./data/first-grade.js'),
  spanish: () => import('./data/spanish.js'),
}

export const courseMeta = slug => COURSES.find(c => c.slug === slug && !c.href)

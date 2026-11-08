import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// The home page's "sign": a white board that pops up a different highlight of the site every few
// seconds, so visitors meet things they didn't know were here. It walks through everything the
// site offers; the order is shuffled by today's date, so each day opens with a different pick and
// everyone sees the same one (the prerendered page shows the first entry of the list).
export const SPOTLIGHTS = [
  { to: '/live', icon: '🔴', title: 'בוגה לייב', line: 'חידון חי לכל המשפחה או הכיתה — כולם עונים מהטלפון', cta: 'לשחק עכשיו' },
  { to: '/time-tunnel', icon: '⏳', title: 'מנהרת הזמן — החידון היומי', line: 'כל יום דברים שקרו בדיוק בתאריך הזה, מגלים בעזרת רמזים', cta: 'לחידון של היום' },
  { to: '/tools/eretz-ir', icon: '🌍', title: 'ארץ עיר אונליין', line: 'מגרילים אות, ממלאים, והאתר סופר את הנקודות', cta: 'למשחק' },
  { to: '/winter', icon: '☕', title: 'בוגה שוקו חם — אזור החורף', line: 'משחקים, יצירה, מטבח חם וחגי החורף — לימי גשם בבית', cta: 'לאזור החורף' },
  { to: '/tools/calculator', icon: '🧮', title: 'מחשבון מדעי', line: 'sin, log, שורשים ושברים — עם הסבר שלב אחר שלב וגרפים', cta: 'לחשב' },
  { to: '/tools/grade-average', icon: '🎓', title: 'מחשבון ממוצע ציונים', line: 'מכניסים ציונים ומשקלים — ומקבלים את הממוצע', cta: 'לחשב ממוצע' },
  { to: '/tools/dice', icon: '🎲', title: 'קוביה וירטואלית', line: 'הקובייה של משחק הקופסה נעלמה? מטילים 1 עד 5 קוביות מהטלפון', cta: 'להטיל' },
  { to: '/tools/keyboard', icon: '⌨️', title: 'מקלדת עברית אונליין', line: 'עם ניקוד, אימוג׳ים ומוזיקה — גם במחשב בלי עברית', cta: 'להקליד' },
  { to: '/excel', icon: '📗', title: 'קורס אקסל חינם', line: '10 שיעורים עם גיליון חי שבודק כל משימה', cta: 'ללמוד אקסל' },
  { to: '/tools/crossword-maker', icon: '✏️', title: 'בונים תשבץ לבד', line: 'כותבים מילים והגדרות — ומקבלים תשבץ מוכן להדפסה', cta: 'לבנות תשבץ' },
  { to: '/adults/crosswords', icon: '📰', title: 'תשחצים להדפסה', line: '27 תשבצים מלאים כמו בעיתון, עם פתרונות', cta: 'להדפיס' },
  { to: '/sudoku', icon: '🔢', title: 'סודוקו אונליין', line: 'כל הרמות, מקל ועד קשה מאוד — לשחק או להדפיס', cta: 'לפתור' },
  { to: '/sudoku/daily', icon: '📆', title: 'הסודוקו היומי', line: 'לוח חדש כל יום — אותו לוח לכולם', cta: 'לסודוקו של היום' },
  { to: '/logic-puzzles', icon: '🧠', title: 'תשבצי היגיון', line: 'תשבץ יומי, 4 רמות ורמז שמסביר את הצעד הבא', cta: 'לפתור' },
  { to: '/hebrew-calendar', icon: '📅', title: 'לוח שנה עברי לועזי', line: 'התאריך העברי היום, חגים, פרשות וממיר תאריכים', cta: 'ללוח השנה' },
  { to: '/school-holidays', icon: '🏖️', title: 'לוח החופשות של משרד החינוך', line: 'כל החופשות של השנה, עם ספירה לאחור והדפסה', cta: 'מתי החופש?' },
  { to: '/online-games/solitaire', icon: '🃏', title: 'סוליטר', line: 'הקלאסיקה, בחינם ובלי פרסומות קופצות', cta: 'לשחק' },
  { to: '/online-games/merge-2048', icon: '🔢', title: 'מכפילים עד 2048', line: 'מחליקים, מחברים מספרים זהים — ומגיעים ל־2048?', cta: 'לשחק' },
  { to: '/online-games', icon: '🎮', title: 'משחקים אונליין', line: 'עשרות משחקי חשיבה, מילים ומספרים — בלי הורדה', cta: 'לכל המשחקים' },
  { to: '/learn/english', icon: '🔤', title: 'לומדים אנגלית', line: 'מילים שמדברות, דקדוק וקריאה — לפי כיתה', cta: 'ללמוד' },
  { to: '/unseen', icon: '📝', title: 'אנסין לכל כיתה', line: 'מבחני Unseen עם טיימר והסבר לכל תשובה', cta: 'לתרגל' },
  { to: '/planner', icon: '🗓️', title: 'מערכת השעות למורים', line: 'שיעור מוכן לכל שעה, דף עבודה ותזכורות — לפי תוכנית הלימודים', cta: 'לבנות מערכת' },
  { to: '/languages', icon: '🗣️', title: 'לומדים שפות', line: 'ערבית, צרפתית, ספרדית, רוסית ואמהרית — מילים, משחקים והגייה', cta: 'לבחור שפה' },
  { to: '/printables', icon: '🖨️', title: 'דפים להדפסה', line: 'מאות דפי עבודה, צביעה ומשחקים — בחינם', cta: 'להדפיס' },
  { to: '/typing', icon: '⌨️', title: 'הקלדה עיוורת', line: 'קורס חינם: 25 שיעורים, מקלדת צבעונית ומילים לדקה', cta: 'להתחיל' },
  { to: '/typing/game', icon: '🎯', title: 'משחק הקלדה לילדים', line: 'מילים נופלות — מקלידים לפני שהן נוחתות', cta: 'לשחק' },
  { to: '/math', icon: '➕', title: 'חשבון לכל כיתה', line: 'תרגול אינסופי, מבחנים ודפי עבודה מכיתה א׳ עד י״ב', cta: 'לתרגל' },
  { to: '/learn/multiplication-game', icon: '✖️', title: 'משחק לוח הכפל', line: 'מסלול שלבים מ־1 עד 10, עם כוכבים ודף תרגול', cta: 'לשחק' },
  { to: '/learn/times-tables', icon: '⏱️', title: 'אתגר לוח הכפל בדקה', line: 'כמה תרגילים תספיקו בדקה אחת?', cta: 'לאתגר' },
  { to: '/learn/gifted-test', icon: '💡', title: 'הכנה למבחן מחוננים', line: 'שאלות תרגול לשלב א׳ ושלב ב׳, עם פתרונות', cta: 'לתרגל' },
  { to: '/learn/reading', icon: '📖', title: 'הבנת הנקרא', line: 'קטעים עם שאלות לכיתות א׳–ח׳, אונליין ולהדפסה', cta: 'לקרוא' },
  { to: '/learn/dictation', icon: '✍️', title: 'הכתבה אונליין', line: 'הקראה קולית ובדיקה אוטומטית', cta: 'להכתבה' },
  { to: '/dictionary', icon: '📘', title: 'מילון לתלמידים', line: 'מקלידים מילה באנגלית ומקבלים פירוש בעברית והגייה', cta: 'לחפש מילה' },
  { to: '/tools/nakdan', icon: '🪄', title: 'נקדן אוטומטי', line: 'מדביקים טקסט ומקבלים אותו מנוקד', cta: 'לנקד' },
  { to: '/tools/keyboard-fix', icon: '🔁', title: 'כתבתם באנגלית במקום בעברית?', line: 'מדביקים akuo ומקבלים שלום — בשני הכיוונים', cta: 'לתקן' },
  { to: '/tools/document', icon: '📄', title: 'וורד אונליין', line: 'מסמך A4 בדפדפן עם תבניות, הדפסה והורדה לוורד', cta: 'לכתוב מסמך' },
  { to: '/tools/pdf', icon: '📕', title: 'כלי PDF חינם', line: 'מאחדים, מפצלים, מקטינים וחותמים — הקבצים לא יוצאים מהמחשב', cta: 'לכלי PDF' },
  { to: '/tools/image', icon: '🖼️', title: 'עורך תמונות', line: 'כיווץ, חיתוך, קולאז׳, טקסט על תמונה ומחיקת רקע', cta: 'לערוך' },
  { to: '/tools/resume', icon: '💼', title: 'קורות חיים בעברית', line: '26 תבניות והורדה כ־PDF, בלי הרשמה', cta: 'לכתוב' },
  { to: '/tools/qr-code', icon: '🔳', title: 'יצירת קוד QR', line: 'קישור, טקסט או וייפיי — קוד מוכן להדפסה', cta: 'ליצור' },
  { to: '/tools/shopping-list', icon: '🛒', title: 'רשימת קניות משותפת', line: 'קישור אחד לכל המשפחה, מתעדכן אצל כולם בלייב', cta: 'לרשימה' },
  { to: '/tools/currency', icon: '💱', title: 'המרת מטבע', line: 'כ־45 מטבעות לשקל, בשערים עדכניים', cta: 'להמיר' },
  { to: '/tools/percent-calculator', icon: '%', title: 'מחשבון אחוזים והנחות', line: 'כמה זה 30% הנחה? תשובה בשנייה', cta: 'לחשב' },
  { to: '/tools/tip-calculator', icon: '🍽️', title: 'מחשבון טיפים', line: 'כמה טיפ להשאיר, וכמה כל אחד משלם', cta: 'לחשב' },
  { to: '/tools/hebrew-birthday', icon: '✡️', title: 'יום הולדת עברי', line: 'תאריך עברי לפי לועזי, ומועד בר או בת מצווה', cta: 'לבדוק' },
  { to: '/tools/stopwatch', icon: '⏲️', title: 'סטופר אונליין', line: 'שעון עצר עם הקפות — לספורט ולמשחקים', cta: 'להפעיל' },
  { to: '/music/piano', icon: '🎹', title: 'פסנתר אונליין', line: 'מנגנים בלחיצה, במגע או מהמקלדת', cta: 'לנגן' },
  { to: '/music/tuner', icon: '🎸', title: 'טיונר לגיטרה', line: 'מכוונים את הגיטרה דרך המיקרופון', cta: 'לכוון' },
  { to: '/discover/solar-system', icon: '🪐', title: 'מערכת השמש', line: 'כוכבי הלכת, עובדות וחידון', cta: 'לגלות' },
  { to: '/discover/human-body', icon: '🫀', title: 'גוף האדם', line: 'לוחצים על איבר ולומדים', cta: 'לגלות' },
  { to: '/flags/quiz', icon: '🏳️', title: 'חידון דגלים', line: 'מזהים דגל מתוך 4 תשובות, לפי רמה ויבשת', cta: 'לחידון' },
  { to: '/discover/israel-map', icon: '🗺️', title: 'מפת ישראל — חידון ערים', line: 'איפה נמצאת העיר? משחק ודף להדפסה', cta: 'לשחק' },
  { to: '/learn/ai/teach-the-robot', icon: '🤖', title: 'מלמדים את הרובוט', line: 'נותנים לרובוט דוגמאות, והוא לומד לזהות לבד', cta: 'לנסות' },
  { to: '/rubiks-cube', icon: '🧊', title: 'פתרון קובייה הונגרית', line: '7 שלבים למתחילים עם הדגמה חיה', cta: 'ללמוד' },
  { to: '/adults/mandalas', icon: '🌸', title: 'מחולל מנדלות', line: 'מנדלה חדשה לצביעה בכל לחיצה', cta: 'ליצור' },
  { to: '/family/what-to-do', icon: '🎲', title: 'מה עושים היום?', line: 'רעיון לפעילות לפי מקום, זמן וגיל', cta: 'לרעיון' },
  { to: '/weather', icon: '☂️', title: 'צריך מטרייה היום?', line: 'תחזית לפי עיר וסיכוי לגשם לפי שעות', cta: 'לתחזית' },
  { to: '/rsvp', icon: '✅', title: 'אישורי הגעה בחינם', line: 'קישור אחד בוואטסאפ: מי מגיע, כמה, ומי עוד לא ענה', cta: 'ליצור' },
  { to: '/secret-friend', icon: '🧙', title: 'גמד וענק אונליין', line: 'כל משתתף מקבל קישור אישי ורק הוא רואה את מי הגריל', cta: 'להגריל' },
  { to: '/classroom/quiz', icon: '📋', title: 'מבחן אמריקאי לכיתה', line: 'בונים מבחן, שולחים קישור ומקבלים את הציונים', cta: 'לבנות מבחן' },
  { to: '/jokes/keresh', icon: '🪵', title: 'בדיחות קרש', line: '100 בדיחות נקיות לילדים, עם בדיחה אקראית', cta: 'לצחוק' },
  { to: '/stories', icon: '🌙', title: 'סיפורים לפני השינה', line: 'סיפורים קצרים לפי גיל ונושא', cta: 'לסיפור' },
]
const EVERY = 4500

// Same order for everyone on the same day, a different one tomorrow.
export function dailyOrder(list, date = new Date()) {
  let seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export default function HomeSpotlight() {
  const [order, setOrder] = useState(SPOTLIGHTS)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (window.__PRERENDER__) return
    setOrder(dailyOrder(SPOTLIGHTS))
  }, [])
  useEffect(() => {
    if (paused || window.__PRERENDER__) return
    const t = setInterval(() => setI(n => (n + 1) % order.length), EVERY)
    return () => clearInterval(t)
  }, [paused, order])
  const s = order[i]
  const go = d => { setI(n => (n + d + order.length) % order.length); setPaused(true) }
  return <section className="hp-spot" aria-label="כדאי להכיר באתר" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    <span className="hp-spot-tag">כדאי להכיר</span>
    <Link key={s.to} to={s.to} className="hp-spot-card">
      <span className="hp-spot-icon" aria-hidden="true">{s.icon}</span>
      <span className="hp-spot-copy"><b>{s.title}</b><small>{s.line}</small></span>
      <span className="hp-spot-cta">{s.cta} ←</span>
    </Link>
    <div className="hp-spot-nav">
      <button type="button" onClick={() => go(-1)} aria-label="הקודם">→</button>
      <span>{i + 1} מתוך {order.length} דברים באתר</span>
      <button type="button" onClick={() => go(1)} aria-label="הבא">←</button>
    </div>
  </section>
}

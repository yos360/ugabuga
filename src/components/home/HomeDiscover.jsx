import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// "Discover Buga": three cards at a time from everything the site offers beyond the obvious — tools we
// built, and help for kids who need a little more (speech, language, special education). The cards
// change every few seconds, so a visitor sees there is much more here without a wall of links.
const ITEMS = [
  ['⌨️', 'מקלדת עברית־אנגלית על המסך', 'מקלידים בכל שפה, גם בלי מקלדת עברית', '/tools/keyboard', 'כלי שבנינו'],
  ['🎹', 'הקלדה עיוורת בעברית', '25 שיעורים, מקלדת צבעונית ומילים לדקה', '/typing', 'כלי שבנינו'],
  ['🧮', 'מחשבון מדעי לבית הספר', 'שברים, שורשים, משוואות וגרפים — עם הסבר שלב אחר שלב', '/tools/calculator', 'כלי שבנינו'],
  ['📊', 'קורס אקסל', '10 שיעורים עם גיליון חי בתוך הדף', '/excel', 'כלי שבנינו'],
  ['📄', 'סטודיו PDF', 'מיזוג, פיצול, חתימה והמרה ל־Word', '/tools/pdf', 'כלי שבנינו'],
  ['🧑‍🏫', 'מתכנן מערכת שעות למורים', 'השיעור הבא לכל שעה, לפי תוכנית הלימודים', '/planner', 'כלי שבנינו'],
  ['🪄', 'נקדן אוטומטי', 'מדביקים טקסט ומקבלים אותו מנוקד', '/tools/nakdan', 'כלי שבנינו'],
  ['🔡', 'מקלדת ניקוד', 'מוסיפים קמץ, פתח וחיריק לכל אות', '/tools/nikud-keyboard', 'כלי שבנינו'],
  ['📝', 'וורד אונליין', 'כותבים מסמך מתבנית ושומרים, בלי להתקין', '/tools/document', 'כלי שבנינו'],
  ['📄', 'קורות חיים', '26 תבניות והורדה כ־PDF, בלי סימן מים', '/tools/resume', 'כלי שבנינו'],
  ['🖼️', 'עורך תמונות', 'כיווץ, חיתוך, קולאז׳ ומחיקת רקע — בלי העלאה לשרת', '/tools/image', 'כלי שבנינו'],
  ['🔁', 'תיקון שפה לא נכונה', 'כתבתם באנגלית במקום בעברית? מתקנים בלחיצה', '/tools/keyboard-fix', 'כלי שבנינו'],
  ['🛒', 'רשימת קניות משותפת', 'כל המשפחה רואה ומעדכנת בזמן אמת', '/tools/shopping-list', 'כלי שבנינו'],
  ['📋', 'סידור משמרות ותורנויות', 'מחלקים תורנויות בהוגנות ומדפיסים', '/tools/shifts', 'כלי שבנינו'],
  ['🧾', 'מחשבון מע״מ', 'מוסיפים או מורידים 18% מע״מ', '/tools/vat', 'כלי שבנינו'],
  ['🎓', 'ממוצע ציונים', 'מכניסים ציונים ומקבלים ממוצע', '/tools/grade-average', 'כלי שבנינו'],
  ['➗', 'מחשבון שברים', 'חישובים עם שברים, בלי להתבלבל', '/tools/fraction-calculator', 'כלי שבנינו'],
  ['📐', 'משוואה ריבועית', 'פתרון עם דרך: דלתא, נוסחת השורשים וקודקוד', '/tools/quadratic-equation', 'כלי שבנינו'],
  ['🔢', 'מחשבון גימטריה', 'כמה שווה השם שלכם בגימטריה?', '/tools/gematria', 'כלי שבנינו'],
  ['✡️', 'יום הולדת עברי', 'מגלים את התאריך העברי של יום ההולדת', '/tools/hebrew-birthday', 'כלי שבנינו'],
  ['⭐', 'מי נולד ביום שלי?', 'אנשים מפורסמים שנולדו באותו תאריך', '/tools/birthday-famous', 'כלי שבנינו'],
  ['🔳', 'יצירת קוד QR', 'מכל קישור, להדפסה או לשליחה', '/tools/qr-code', 'כלי שבנינו'],
  ['😀', 'מקלדת אימוג׳ים', 'מחפשים אימוג׳י בעברית ומעתיקים', '/tools/emoji', 'כלי שבנינו'],
  ['✏️', 'מחולל תשבצים', 'כותבים מילים ורמזים ומקבלים תשבץ להדפסה', '/tools/crossword-maker', 'כלי שבנינו'],
  ['🔎', 'מחולל תפזורת', 'תפזורת מהמילים שלכם, עם פתרון', '/tools/word-search-maker', 'כלי שבנינו'],
  ['🎟️', 'מחולל בינגו היכרות', 'כרטיסי בינגו היכרות לכל אירוע', '/tools/bingo-maker', 'כלי שבנינו'],
  ['🧪', 'מחולל ניסויים', 'ניסויים בטוחים עם רשימת חומרים ודף חקר', '/tools/experiment-maker', 'כלי שבנינו'],
  ['👥', 'מחלק קבוצות', 'מחלקים את הכיתה לקבוצות בלחיצה', '/tools/team-generator', 'כלי שבנינו'],
  ['📊', 'לוח ניקוד', 'סופרים נקודות במשחק או בחידון', '/tools/scoreboard', 'כלי שבנינו'],
  ['📋', 'מי מביא מה', 'רשימה משותפת לפיקניק, למסיבה ולגן', '/tools/bring-list', 'כלי שבנינו'],
  ['📖', 'סיכומים על חנוכה', 'המכבים, מתתיהו ויהודה המכבי — עם דף עבודה', '/holidays/hanukkah/learn', 'חדש באתר'],
  ['🗣️', 'קלינאות תקשורת', 'מילים לפי צליל עם שמע, כרטיסיות היגוי ומשחקים להדפסה', '/speech', 'לילדים שצריכים עוד קצת'],
  ['🐍', 'תרגול האות ס׳', 'מילים לפי הצליל, עם שמע ותרגול', '/speech/sounds/s', 'לילדים שצריכים עוד קצת'],
  ['🦒', 'תרגול האות צ׳', 'מילים לפי הצליל, עם שמע ותרגול', '/speech/sounds/ts', 'לילדים שצריכים עוד קצת'],
  ['🦁', 'תרגול האות ר׳', 'מילים לפי הצליל, עם שמע ותרגול', '/speech/sounds/r', 'לילדים שצריכים עוד קצת'],
  ['👂', 'זוגות מינימליים', 'ס/ש, ק/ת, ר/ל — משחק ודפים להדפסה', '/speech/minimal-pairs', 'לילדים שצריכים עוד קצת'],
  ['💬', 'לוחות תקשורת תת״ח', 'לוח מילות ליבה ולוחות נושא להדפסה ולמסך', '/speech/aac', 'לילדים שצריכים עוד קצת'],
  ['🧠', 'תרגול שפה לגן', 'קטגוריות, שאלות, הוראות ורצף', '/speech/language', 'לילדים שצריכים עוד קצת'],
  ['🧩', 'ויסות חושי וסדר יום', 'כרטיסי הרגעה, לוח תקשורת וסדר יום בגן', '/printables/sensory-communication-cards', 'לילדים שצריכים עוד קצת'],
  ['🥰', 'כרטיסי רגשות', '24 רגשות, עם שאלה לשיחה על כל אחד', '/printables/emotion-cards', 'לילדים שצריכים עוד קצת'],
  ['📘', 'חוברות לחינוך המיוחד', 'חשבון ובעיות מילוליות לחינוך המיוחד', '/booklets/math-special-ed', 'לילדים שצריכים עוד קצת'],
]
// The owner's two games (Buga Live and Eretz Ir) open every other set of three, so they keep coming
// back; the other sets open with help or news, and two tools fill each set.
const STARS = [
  ['📺', 'בוגה לייב', 'חידון לכל הכיתה: אתם על המסך, כולם עונים מהטלפון', '/live', 'משחק לשחק יחד'],
  ['🗺️', 'ארץ עיר', 'הגרלת אות, קטגוריות לפי גיל, טיימר וניקוד', '/tools/eretz-ir', 'משחק לשחק יחד'],
]
const MIXED = (() => { const a = ITEMS.filter(x => x[4] === 'כלי שבנינו'), b = ITEMS.filter(x => x[4] !== 'כלי שבנינו'), out = []; let n = 0; while (a.length) { out.push(n % 2 === 0 ? STARS[(n / 2) % STARS.length] : b.shift() || STARS[0], ...a.splice(0, 2)); n++ } return [...out, ...b] })()
const SHOWN = 3
const EVERY = 7000

export default function HomeDiscover() {
  // Prerender and first paint: the first cards. After hydration each visitor starts at a different place.
  const [start, setStart] = useState(0)
  const [tick, setTick] = useState(0)
  const pages = Math.ceil(MIXED.length / SHOWN)
  useEffect(() => { if (!window.__PRERENDER__) setStart(Math.floor(Math.random() * pages)) }, [pages])
  // Always moves on by itself (the owner wants it never to stand still); "more" restarts the timer.
  useEffect(() => {
    if (window.__PRERENDER__) return
    const t = setInterval(() => setStart(s => (s + 1) % pages), EVERY)
    return () => clearInterval(t)
  }, [pages, tick])
  const cards = MIXED.slice(start * SHOWN, start * SHOWN + SHOWN)
  return <section className="hp-sec hp-discover" aria-labelledby="hp-discover-h">
    <div className="hp-row-head"><h2 id="hp-discover-h" className="hp-h2">גלו עוד בבוגה</h2>
      <button type="button" className="hp-discover-next" onClick={() => { setStart(s => (s + 1) % pages); setTick(t => t + 1) }} aria-label="להציג עוד">עוד ←</button></div>
    <div key={start} className="hp-discover-row">{cards.map(([e, t, d, to, tag]) => <Link key={to} to={to} className="hp-discover-card">
      <small className="hp-discover-tag">{tag}</small><span aria-hidden="true" className="hp-discover-ic">{e}</span><b>{t}</b><span className="hp-discover-desc">{d}</span>
    </Link>)}</div>
    <div className="hp-discover-dots" aria-hidden="true">{Array.from({ length: pages }, (_, i) => <i key={i} className={i === start ? 'on' : ''} />)}</div>
  </section>
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// "Discover Buga": three cards at a time from everything the site offers beyond the obvious — tools we
// built, and help for kids who need a little more (speech, language, special education). The cards
// change every few seconds (not for reduced motion, and never while the pointer or focus is inside),
// so a visitor sees there is much more here without a wall of links.
const ITEMS = [
  ['⌨️', 'מקלדת עברית־אנגלית על המסך', 'מקלידים בכל שפה, גם בלי מקלדת עברית', '/tools/keyboard', 'כלי שבנינו'],
  ['🎹', 'הקלדה עיוורת בעברית', '25 שיעורים, מקלדת צבעונית ומילים לדקה', '/typing', 'כלי שבנינו'],
  ['🧮', 'מחשבון מדעי לבית הספר', 'שברים, שורשים, משוואות וגרפים — עם הסבר שלב אחר שלב', '/tools/calculator', 'כלי שבנינו'],
  ['📊', 'קורס אקסל', '10 שיעורים עם גיליון חי בתוך הדף', '/excel', 'כלי שבנינו'],
  ['📄', 'סטודיו PDF', 'מיזוג, פיצול, חתימה והמרה ל־Word', '/tools/pdf', 'כלי שבנינו'],
  ['📺', 'בוגה לייב', 'חידון חי לכל הכיתה מהטלפונים', '/live', 'כלי שבנינו'],
  ['🧑‍🏫', 'מתכנן מערכת שעות למורים', 'השיעור הבא לכל שעה, לפי תוכנית הלימודים', '/planner', 'כלי שבנינו'],
  ['🪄', 'נקדן אוטומטי', 'מדביקים טקסט ומקבלים אותו מנוקד', '/tools/nakdan', 'כלי שבנינו'],
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
// Tools and help alternate, so every set of three shows both sides of the site.
const MIXED = (() => { const a = ITEMS.filter(x => x[4] === 'כלי שבנינו'), b = ITEMS.filter(x => x[4] !== 'כלי שבנינו'), out = []; while (a.length || b.length) { if (b.length) out.push(b.shift()); if (a.length) out.push(a.shift()) } return out })()
const SHOWN = 3
const EVERY = 7000

export default function HomeDiscover() {
  // Prerender and first paint: the first cards. After hydration each visitor starts at a different place.
  const [start, setStart] = useState(0)
  const [paused, setPaused] = useState(false)
  const pages = Math.ceil(MIXED.length / SHOWN)
  useEffect(() => { if (!window.__PRERENDER__) setStart(Math.floor(Math.random() * pages)) }, [pages])
  useEffect(() => {
    if (paused || window.__PRERENDER__ || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setStart(s => (s + 1) % pages), EVERY)
    return () => clearInterval(t)
  }, [paused, pages])
  const cards = MIXED.slice(start * SHOWN, start * SHOWN + SHOWN)
  return <section className="hp-sec hp-discover" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-labelledby="hp-discover-h">
    <div className="hp-row-head"><h2 id="hp-discover-h" className="hp-h2">גלו עוד בבוגה</h2>
      <button type="button" className="hp-discover-next" onClick={() => setStart(s => (s + 1) % pages)} aria-label="להציג עוד">עוד ←</button></div>
    <div key={start} className="hp-discover-row" aria-live="polite">{cards.map(([e, t, d, to, tag]) => <Link key={to} to={to} className="hp-discover-card">
      <small className="hp-discover-tag">{tag}</small><span aria-hidden="true" className="hp-discover-ic">{e}</span><b>{t}</b><span className="hp-discover-desc">{d}</span>
    </Link>)}</div>
    <div className="hp-discover-dots" aria-hidden="true">{Array.from({ length: pages }, (_, i) => <i key={i} className={i === start ? 'on' : ''} />)}</div>
  </section>
}

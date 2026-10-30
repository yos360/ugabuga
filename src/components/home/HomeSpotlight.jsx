import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// The home page's "sign": a white board that pops up a different highlight of the site every few
// seconds, so visitors meet things they didn't know were here. The owner's picks; order is shuffled
// per visit (the prerendered page shows the first one).
export const SPOTLIGHTS = [
  { to: '/live', icon: '🔴', title: 'בוגה לייב', line: 'חידון חי לכל המשפחה או הכיתה — כולם עונים מהטלפון', cta: 'לשחק עכשיו' },
  { to: '/tools/eretz-ir', icon: '🌍', title: 'ארץ עיר אונליין', line: 'מגרילים אות, ממלאים, והאתר סופר את הנקודות', cta: 'למשחק' },
  { to: '/winter', icon: '☕', title: 'בוגה שוקו חם — אזור החורף', line: 'משחקים, יצירה, מטבח חם וחגי החורף — לימי גשם בבית', cta: 'לאזור החורף' },
  { to: '/tools/crossword-maker', icon: '✏️', title: 'בונים תשבץ לבד', line: 'כותבים מילים והגדרות — ומקבלים תשבץ מוכן להדפסה', cta: 'לבנות תשבץ' },
  { to: '/online-games/solitaire', icon: '🃏', title: 'סוליטר', line: 'הקלאסיקה, בחינם ובלי פרסומות קופצות', cta: 'לשחק' },
  { to: '/learn/english', icon: '🔤', title: 'לומדים אנגלית', line: 'מילים שמדברות, דקדוק וקריאה — לפי כיתה', cta: 'ללמוד' },
  { to: '/unseen', icon: '📝', title: 'אנסין לכל כיתה', line: 'מבחני Unseen עם טיימר והסבר לכל תשובה', cta: 'לתרגל' },
  { to: '/printables', icon: '🖨️', title: 'דפים להדפסה', line: 'מאות דפי עבודה, צביעה ומשחקים — בחינם', cta: 'להדפיס' },
]
const EVERY = 4500

export default function HomeSpotlight() {
  const [order, setOrder] = useState(SPOTLIGHTS)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (window.__PRERENDER__) return
    const shuffled = [...SPOTLIGHTS].map(s => [Math.random(), s]).sort((a, b) => a[0] - b[0]).map(x => x[1])
    setOrder(shuffled)
  }, [])
  useEffect(() => {
    if (paused || window.__PRERENDER__) return
    const t = setInterval(() => setI(n => (n + 1) % order.length), EVERY)
    return () => clearInterval(t)
  }, [paused, order])
  const s = order[i]
  return <section className="hp-spot" aria-label="כדאי להכיר באתר" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
    <span className="hp-spot-tag">כדאי להכיר</span>
    <Link key={s.to} to={s.to} className="hp-spot-card">
      <span className="hp-spot-icon" aria-hidden="true">{s.icon}</span>
      <span className="hp-spot-copy"><b>{s.title}</b><small>{s.line}</small></span>
      <span className="hp-spot-cta">{s.cta} ←</span>
    </Link>
    <div className="hp-spot-dots">{order.map((o, n) => <button key={o.to} type="button" aria-label={o.title} aria-current={n === i} onClick={() => { setI(n); setPaused(true) }} />)}</div>
  </section>
}

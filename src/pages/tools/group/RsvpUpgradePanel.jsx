import { useEffect, useState } from 'react'
import { card, btn } from './GroupUi'
import { trackRsvp, upgradeDismissed, dismissUpgrade } from '../../../utils/rsvpFunnel'

// Fake door with a real price: only things that are NOT free today. Nothing is charged and no
// details are collected; a click is just counted (rsvp-step:upgrade_click).
const ITEMS = ['תזכורת אוטומטית לאורחים שלא ענו', 'הזמנה בלי המיתוג של עוגה בוגה', 'עיצובי הזמנה נוספים', 'מעקב מלא: מי פתח את ההזמנה ומי עוד לא']
export default function RsvpUpgradePanel({ code }) {
  const [hidden, setHidden] = useState(() => upgradeDismissed(code)), [thanks, setThanks] = useState(false)
  useEffect(() => { if (!hidden) trackRsvp('panel_shown') }, []) // eslint-disable-line react-hooks/exhaustive-deps
  if (hidden) return null
  return <section className={`${card} border-amber-200 bg-amber-50`} aria-label="חבילת אירוע">
    <div className="flex items-start justify-between gap-2">
      <h2 className="text-xl font-bold">⭐ חבילת אירוע — 49 ₪ לאירוע</h2>
      <button type="button" onClick={() => { dismissUpgrade(code); setHidden(true) }} aria-label="סגירה" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-amber-100">✕</button>
    </div>
    <p className="mt-1 text-sm text-slate-700">אופציונלי לגמרי. כל מה שיש היום ממשיך לעבוד בחינם.</p>
    <ul className="mt-3 space-y-1 text-sm">{ITEMS.map(i => <li key={i}>✓ {i}</li>)}</ul>
    {thanks
      ? <p role="status" className="mt-3 rounded-xl bg-white p-3 text-center font-bold">תודה! החבילה נפתחת בקרוב. בינתיים הכול ממשיך לעבוד בחינם.</p>
      : <button type="button" onClick={() => { trackRsvp('upgrade_click'); setThanks(true) }} className={`${btn} mt-3 w-full`}>אני רוצה את החבילה</button>}
  </section>
}

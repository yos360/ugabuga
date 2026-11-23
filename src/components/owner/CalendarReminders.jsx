import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// Who added the holiday reminders to their calendar (owner_calendar_reminders): last 30 days,
// each visitor once per day, split by lead, calendar app and where the button was.
const LEAD = { week: 'שבוע לפני', month: 'חודש לפני' }
const APP = { google: 'גוגל', apple: 'אייפון / אאוטלוק', copy: 'העתיקו קישור' }
const SPOT = { print: 'אחרי הדפסה', home: 'עמוד הבית' }
export function describe(code) {
  const [lead, app, spot] = String(code || '').split('-')
  return { lead: LEAD[lead] || lead, app: APP[app] || app, spot: SPOT[spot] || null }
}

export default function CalendarReminders({ tick = 0 }) {
  const [rows, setRows] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    const to = new Date(), from = new Date(to.getTime() - 30 * 864e5)
    ownerSupabase.rpc('owner_calendar_reminders', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error: e }) => {
      if (!live) return
      if (e) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setRows(Array.isArray(data) ? data : []); setError('')
    })
    return () => { live = false }
  }, [tick])
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
  if (!rows) return <p className="text-sm text-slate-500">טוען…</p>
  const total = rows.reduce((s, r) => s + (r.n || 0), 0)
  const by = key => Object.entries(rows.reduce((m, r) => { const k = describe(r.code)[key] || r.path; m[k] = (m[k] || 0) + r.n; return m }, {})).sort((a, b) => b[1] - a[1])
  return <div>
    <p className="mb-3 text-sm text-slate-600">30 הימים האחרונים. כל מבקר נספר פעם אחת ביום. לחיצה היא הוספה ליומן (או העתקת הקישור).</p>
    <p className="mb-3 text-2xl font-black">{total} <span className="text-base font-bold">לחיצות על „הוספה ליומן”</span></p>
    {total > 0 && <div className="grid gap-4 sm:grid-cols-3 text-sm">
      {[['lead', 'מתי להזכיר'], ['app', 'איזה יומן'], ['spot', 'מאיפה']].map(([k, t]) => <div key={k}>
        <h4 className="mb-1 font-bold">{t}</h4>
        <ul>{by(k).map(([name, n]) => <li key={name} className="flex justify-between border-b py-1"><span>{name}</span><b>{n}</b></li>)}</ul>
      </div>)}
    </div>}
  </div>
}

import { useEffect, useState } from 'react'
import { ownerSupabase as supabase } from '../../utils/ownerAuth'

// Owner report section: every "מי מביא מה" list, newest activity first,
// with what's on it and who signed up to bring each item.
const taker = item => item.takenBy || (item.claims || []).map(c => (c.count > 1 ? `${c.name} (${c.count})` : c.name)).join(', ')
const fmt = iso => new Date(iso).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function OwnerPartyLists() {
  const [lists, setLists] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    supabase.rpc('owner_party_lists', { p_limit: 300 }).then(({ data, error: err }) => {
      if (!alive) return
      if (err) setError(/PGRST202|Could not find the function/i.test(`${err.code} ${err.message}`) ? 'missing' : err.message)
      else setLists(data || [])
    })
    return () => { alive = false }
  }, [])

  const shown = (lists || []).filter(l => !q.trim() || `${l.title} ${JSON.stringify(l.items)} ${JSON.stringify(l.details)}`.includes(q.trim()))
  const items = (lists || []).flatMap(l => (l.items || []).filter(i => i.text?.trim()))
  const taken = items.filter(i => taker(i)).length

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-2xl font-black">🧺 רשימות "מי מביא מה"</h2>
      <p className="mb-3 text-sm text-slate-600">כל הרשימות שנוצרו באתר — מה כתבו בהן ומי נרשם להביא מה. הכי עדכניות למעלה.</p>
      {error === 'missing' && <p className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm">כדי לראות את הרשימות צריך להריץ פעם אחת את קובץ ה-SQL <b>202610030002_owner_party_lists.sql</b> ב-Supabase.</p>}
      {error && error !== 'missing' && <p className="rounded-xl bg-red-50 p-4 text-sm">שגיאה בטעינת הרשימות: {error}</p>}
      {!lists && !error && <p role="status">טוענים רשימות…</p>}
      {lists && <>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-orange-50 p-4 text-center"><b className="block text-3xl">{lists.length}</b>רשימות</div>
          <div className="rounded-2xl bg-sky-50 p-4 text-center"><b className="block text-3xl">{items.length}</b>פריטים</div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-center"><b className="block text-3xl">{taken}</b>נלקחו ע״י משתתפים</div>
        </div>
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש ברשימות (שם, פריט, מקום…)" className="mb-3 w-full rounded-xl border-2 border-slate-200 px-4 py-2" />
        {!shown.length && <p className="rounded-xl bg-slate-50 p-4 text-sm">אין רשימות להצגה.</p>}
        <div className="space-y-2">
          {shown.map(l => {
            const its = (l.items || []).filter(i => i.text?.trim())
            const d = l.details || {}
            return (
              <details key={l.share_code} className="rounded-2xl border-2 border-slate-200 bg-white p-3 open:shadow">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1">
                  <b className="text-lg">{l.title}</b>
                  <span className="text-sm text-slate-500">{its.length} פריטים · {its.filter(i => taker(i)).length} נלקחו</span>
                  <span className="ms-auto text-xs text-slate-500">עודכנה {fmt(l.updated_at)} · נוצרה {fmt(l.created_at)}</span>
                </summary>
                <div className="mt-3 border-t pt-3">
                  {(d.date || d.time || d.place || d.note) && (
                    <p className="mb-2 text-sm text-slate-700">{[d.date && `📅 ${d.date}`, d.time && `🕒 ${d.time}`, d.place && `📍 ${d.place}`].filter(Boolean).join(' · ')}{d.note && <><br />📝 {d.note}</>}</p>
                  )}
                  <ul className="space-y-1">
                    {its.map(i => (
                      <li key={i.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-1">
                        <span>{i.text}{i.qty ? <span className="text-slate-500"> · {i.qty}</span> : null}</span>
                        <span className={taker(i) ? 'font-bold text-emerald-700' : 'text-slate-400'}>{taker(i) || 'פנוי'}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={`/l/${l.share_code}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-blue-700 underline">פתיחת הרשימה באתר ↗</a>
                </div>
              </details>
            )
          })}
        </div>
      </>}
    </section>
  )
}

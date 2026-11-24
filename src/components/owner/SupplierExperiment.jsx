import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
import { DAILY_POLLS } from '../../data/dailyPolls'

// Owner report: the RSVP supplier experiment (started 24.11.2026) in one place — how many guests and hosts
// clicked through to Aluf HaMatzgot from the RSVP pages, how many clicked the empty "advertise here" slot,
// how many opened /advertise, and which suppliers signed up in the period (owner_supplier_experiment).
// Also the home page's daily poll ("מה אתם אומרים?") — votes per question (owner_poll_summary).
const CHANNEL = { 'aluf-hamatzgot': 'אלוף המצגות', 'rsvp-slot': 'המקום הפנוי לספק' }
const STATUS = { pending: 'ממתין לאישור', approved: 'מאושר', hidden: 'מוסתר' }
const date = s => new Date(s).toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric' })

export function SupplierExperiment({ from, to, tick = 0 }) {
  const [clicks, setClicks] = useState(null), [exp, setExp] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    const args = { p_from: from.toISOString(), p_to: to.toISOString() }
    Promise.all([ownerSupabase.rpc('owner_sponsor_clicks', args), ownerSupabase.rpc('owner_supplier_experiment', args)]).then(([a, b]) => {
      if (!live) return
      if (a.error || b.error) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים (כמה דקות אחרי ההעלאה).'); return }
      setClicks(Array.isArray(a.data) ? a.data : []); setExp(b.data || {}); setError('')
    })
    return () => { live = false }
  }, [from, to, tick])
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
  if (!clicks || !exp) return <p className="text-sm text-slate-500">טוען…</p>
  const row = id => clicks.find(r => r.sponsor === id)
  const signups = exp.signups || []
  const tiles = [
    [row('aluf-hamatzgot')?.clicks || 0, `נכנסו לאתר של אלוף המצגות מאישורי ההגעה${row('aluf-hamatzgot') ? ` · ${row('aluf-hamatzgot').visitors} מבקרים` : ''}`],
    [row('rsvp-slot')?.clicks || 0, 'לחצו על "המקום הזה פנוי" (ספקים שמתעניינים)'],
    [exp.advertise_visitors || 0, `נכנסו לדף "לפרסם באתר" (${exp.advertise_views || 0} צפיות)`],
    [signups.filter(s => s.self).length, 'ספקים חדשים שנרשמו לבד'],
  ]
  return <div>
    <p className="mb-3 text-sm text-slate-600">הניסוי התחיל ב־24.11.2026: כרטיס של אלוף המצגות ולידו מקום פנוי לספק, בדף של האורח אחרי שענה ובדף של המארגן. כל לחיצה מגיעה לאתר שלו עם <code dir="ltr">utm_source=ugabuga</code>, כך שגם הוא רואה אותה בסטטיסטיקה שלו.</p>
    <div className="mb-4 grid gap-2 sm:grid-cols-4">
      {tiles.map(([n, label]) => <div key={label} className="rounded-2xl bg-amber-50 p-4"><b className="block text-3xl">{n}</b><span className="text-sm text-slate-700">{label}</span></div>)}
    </div>
    {['aluf-hamatzgot', 'rsvp-slot'].map(id => row(id)?.by_day?.length ? <p key={id} className="mb-1 text-sm"><b>{CHANNEL[id]} לפי יום:</b> {row(id).by_day.map(d => `${date(d.d)}: ${d.n}`).join(' · ')}</p> : null)}
    <h3 className="mb-2 mt-4 text-base font-black">ספקים שנרשמו בתקופה ({signups.length})</h3>
    {signups.length
      ? <table className="w-full text-right text-sm"><tbody>{signups.map((s, i) => <tr key={i} className="border-b">
          <td className="p-2 font-bold">{s.name}</td>
          <td className="p-2">{[s.category, s.area].filter(Boolean).join(' · ')}</td>
          <td className="p-2">{STATUS[s.status] || s.status}{s.plan === 'page' ? ' · דף מלא' : ''}</td>
          <td className="p-2">{s.self ? 'נרשם לבד' : 'נוסף על ידכם'}</td>
          <td className="p-2 text-slate-500">{date(s.created_at)}</td>
        </tr>)}</tbody></table>
      : <p className="rounded-xl bg-slate-50 p-3 text-sm">עוד לא נרשם ספק חדש בתקופה הזו.</p>}
    <p className="mt-2 text-sm text-slate-600">ספקים מאושרים באתר כרגע: <b>{exp.suppliers_total || 0}</b></p>
  </div>
}

export function PollSummary({ from, to, tick = 0 }) {
  const [rows, setRows] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    ownerSupabase.rpc('owner_poll_summary', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error: e }) => {
      if (!live) return
      if (e) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setRows(Array.isArray(data) ? data : []); setError('')
    })
    return () => { live = false }
  }, [from, to, tick])
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
  if (!rows) return <p className="text-sm text-slate-500">טוען…</p>
  if (!rows.length) return <p className="rounded-xl bg-slate-50 p-3 text-sm">עוד אין הצבעות בתקופה הזו.</p>
  return <div className="space-y-4">{rows.map(r => {
    const p = DAILY_POLLS.find(x => x.id === r.poll_id)
    return <div key={r.poll_id}>
      <h3 className="text-base font-black">{p?.q || r.poll_id} <span className="text-sm font-normal text-slate-500">· {r.votes} הצבעות</span></h3>
      <ul className="mt-1 text-sm">{(p?.options || Object.keys(r.counts || {})).map((o, i) => <li key={i}>{o}: <b>{r.counts?.[i] || 0}</b></li>)}</ul>
    </div>
  })}</div>
}

import { useEffect, useMemo, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// Shares and social traffic (owner_social_report). A share button press is a click — Facebook and
// WhatsApp never tell a website whether a post was published, or in which group or profile — so
// clicks are labelled as clicks. The only confirmed shares are the phone share sheet's "sent".
const PERIODS = [{ id: 'day', label: 'היום', days: 1 }, { id: 'week', label: '7 ימים', days: 7 }, { id: 'month', label: '30 יום', days: 30 }]

function bounds(days) {
  const to = new Date(), from = new Date()
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() - (days - 1))
  return [from, to]
}
// Daily rows grouped into weeks (Sunday first) for the 30-day view.
function byWeek(rows) {
  const m = new Map()
  for (const r of rows) {
    const d = new Date(`${r.d}T12:00:00`), start = new Date(d)
    start.setDate(d.getDate() - d.getDay())
    const k = start.toISOString().slice(0, 10)
    const w = m.get(k) || { d: k, fb_clicks: 0, wa_clicks: 0, other_clicks: 0, fb_visits: 0, wa_visits: 0 }
    for (const f of ['fb_clicks', 'wa_clicks', 'other_clicks', 'fb_visits', 'wa_visits']) w[f] += r[f] || 0
    m.set(k, w)
  }
  return [...m.values()]
}
const fmtDay = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })

export default function SocialShares({ tick = 0, pageName }) {
  const [period, setPeriod] = useState('week'), [weekly, setWeekly] = useState(false)
  const [data, setData] = useState(null), [error, setError] = useState('')
  const days = PERIODS.find(p => p.id === period).days
  const [from, to] = useMemo(() => bounds(days), [days, tick]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let live = true
    ownerSupabase.rpc('owner_social_report', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data: d, error: e }) => {
      if (!live) return
      if (e) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setData(d); setError('')
    })
    return () => { live = false }
  }, [from, to])
  const clicks = data?.clicks || {}, visits = data?.visits || {}
  const rows = data ? (weekly && period === 'month' ? byWeek(data.by_day) : data.by_day) : []
  const name = r => pageName ? pageName({ path: r.path, category: r.category }) : r.path || '/'
  return <div>
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {PERIODS.map(p => <button key={p.id} type="button" onClick={() => setPeriod(p.id)} aria-pressed={period === p.id} className={`min-h-9 rounded-xl border-2 px-3 py-1 text-sm font-bold ${period === p.id ? 'border-slate-800 bg-amber-100' : 'border-slate-200 bg-white'}`}>{p.label}</button>)}
      {period === 'month' && <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={weekly} onChange={e => setWeekly(e.target.checked)} /> לפי שבוע</label>}
    </div>
    <p className="mb-3 text-sm text-slate-600"><b>לחיצות על שיתוף</b> = מישהו בחר לשתף מתפריט השיתוף. פייסבוק ווואטסאפ לא מדווחים לאתר אם הפוסט פורסם בפועל, וגם לא באיזו קבוצה או פרופיל, ולכן זו לחיצה ולא פרסום מאומת. <b>שיתוף שהושלם</b> נספר רק כשתפריט השיתוף של הטלפון דיווח שהשיתוף נשלח. <b>כניסות</b> = מבקרים שהגיעו מפייסבוק או מוואטסאפ (מבקר אחד נספר פעם אחת); &quot;מקישור ששותף מהאתר&quot; = הגיעו דרך קישור שיתוף של האתר, להבדיל ממודעות.</p>
    {error ? <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p> : !data ? <p className="text-sm text-slate-500">טוען…</p> : <>
      <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat value={clicks.facebook || 0} text="לחיצות על שיתוף בפייסבוק" tone="bg-blue-50" />
        <Stat value={clicks.whatsapp || 0} text="לחיצות על שיתוף בוואטסאפ" tone="bg-green-50" />
        <Stat value={(clicks.native || 0) + (clicks.copy || 0) + (clicks.email || 0) + (clicks.other || 0)} text="לחיצות אחרות (טלפון, העתקה, מייל)" tone="bg-slate-50" />
        <Stat value={data.completed || 0} text="שיתופים שהושלמו (מתפריט הטלפון)" tone="bg-amber-50" />
        <Stat value={visits.facebook || 0} sub={`${visits.facebook_shared || 0} מקישור ששותף מהאתר`} text="כניסות מפייסבוק" tone="bg-blue-50" />
        <Stat value={visits.whatsapp || 0} sub={`${visits.whatsapp_shared || 0} מקישור ששותף מהאתר`} text="כניסות מוואטסאפ" tone="bg-green-50" />
      </div>
      {rows.length > 1 && <div className="mb-5 overflow-x-auto"><table className="w-full text-right text-sm">
        <thead><tr className="border-b-2"><th className="p-2">{weekly && period === 'month' ? 'שבוע מ־' : 'יום'}</th><th className="p-2">שיתוף בפייסבוק</th><th className="p-2">שיתוף בוואטסאפ</th><th className="p-2">שיתוף אחר</th><th className="p-2">כניסות מפייסבוק</th><th className="p-2">כניסות מוואטסאפ</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.d} className="border-b"><td className="whitespace-nowrap p-2">{fmtDay(r.d)}</td><td className="p-2">{r.fb_clicks}</td><td className="p-2">{r.wa_clicks}</td><td className="p-2">{r.other_clicks}</td><td className="p-2">{r.fb_visits}</td><td className="p-2">{r.wa_visits}</td></tr>)}</tbody>
      </table></div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-black">העמודים ששיתפו הכי הרבה</h3>
          {data.top_shared.length ? <table className="w-full text-right text-sm"><thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">פייסבוק</th><th className="p-2">וואטסאפ</th><th className="p-2">אחר</th></tr></thead>
            <tbody>{data.top_shared.map(r => <tr key={r.path} className="border-b"><td className="p-2"><b>{name(r)}</b></td><td className="p-2">{r.facebook}</td><td className="p-2">{r.whatsapp}</td><td className="p-2">{r.other}</td></tr>)}</tbody></table>
            : <p className="rounded-xl bg-slate-50 p-3 text-sm">אין עדיין לחיצות על שיתוף בתקופה הזו.</p>}
        </div>
        <div>
          <h3 className="mb-2 text-lg font-black">מה מביא הכי הרבה תנועה מפייסבוק ומוואטסאפ</h3>
          <p className="mb-2 text-xs text-slate-500">העמוד שבו המבקר נחת — משחקים, דפי עבודה וכל עמוד אחר.</p>
          {data.top_landing.length ? <table className="w-full text-right text-sm"><thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">מפייסבוק</th><th className="p-2">מוואטסאפ</th><th className="p-2">מקישור ששותף</th></tr></thead>
            <tbody>{data.top_landing.map(r => <tr key={r.path} className="border-b"><td className="p-2"><b>{name(r)}</b></td><td className="p-2">{r.facebook}</td><td className="p-2">{r.whatsapp}</td><td className="p-2">{r.from_shares}</td></tr>)}</tbody></table>
            : <p className="rounded-xl bg-slate-50 p-3 text-sm">אין עדיין כניסות מפייסבוק או מוואטסאפ בתקופה הזו.</p>}
        </div>
      </div>
    </>}
  </div>
}
function Stat({ value, text, sub, tone }) {
  return <div className={`rounded-2xl p-3 ${tone}`}><p className="text-2xl font-black">{value}</p><p className="text-xs font-bold text-slate-700">{text}</p>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div>
}

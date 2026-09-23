import { useEffect, useMemo, useState } from 'react'
import SEO from '../components/ui/SEO'
import { ownerSupabase as supabase } from '../utils/ownerAuth'
import { ACTIVITY_LABELS } from '../utils/liveActivity'

// Fixed categorical order (never reassigned per-render) — validated for
// colorblind + normal-vision contrast. Devices get slots 1–2, sources 1–6.
const HUES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7', '#008300', '#e34948']
const SEQUENTIAL = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']
const DEVICE_LABELS = { desktop: 'מחשב', mobile: 'טלפון/טאבלט', unknown: 'לא ידוע' }
const SOURCE_LABELS = { direct: 'ישירות', internal: 'מהאתר עצמו', google: 'גוגל', bing: 'בינג', facebook: 'פייסבוק', instagram: 'אינסטגרם', whatsapp: 'וואטסאפ', tiktok: 'טיקטוק', youtube: 'יוטיוב', email: 'מייל', other: 'אחר', unknown: 'לא ידוע' }
const RANGES = [
  { id: 'today', label: 'היום' },
  { id: 'yesterday', label: 'אתמול' },
  { id: '7', label: '7 ימים' },
  { id: '30', label: '30 יום' },
]

function dayBounds(offsetDays) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d
}
function rangeBounds(id) {
  const now = new Date()
  if (id === 'today') return [dayBounds(0), now]
  if (id === 'yesterday') return [dayBounds(-1), dayBounds(0)]
  const days = Number(id)
  return [new Date(now.getTime() - days * 86400000), now]
}
function label(category, action) {
  return ACTIVITY_LABELS[category] || category || 'לא ידוע'
}
function formatDay(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
}

function Bar({ value, max, color, text }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return <div className="flex items-center gap-3">
    <span className="w-32 shrink-0 truncate text-sm text-slate-700">{text}</span>
    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
    <b className="w-10 shrink-0 text-left text-sm">{value}</b>
  </div>
}

function StatCard({ value, text, tone }) {
  return <div className={`rounded-2xl p-4 ${tone}`}>
    <b className="block text-3xl">{value}</b>
    <span className="text-sm text-slate-700">{text}</span>
  </div>
}

function useSummary(from, to) {
  const [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    setData(null)
    supabase.rpc('owner_activity_summary', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => {
      if (!live) return
      if (error) { setError('הדוח המפורט עדיין לא זמין. ודאו שהמסד עודכן.'); return }
      setData(data)
    })
    return () => { live = false }
  }, [from.getTime(), to.getTime()])
  return { data, error }
}

export default function OwnerActivityReport() {
  const [range, setRange] = useState('today')
  const [from, to] = useMemo(() => rangeBounds(range), [range])
  const { data, error } = useSummary(from, to)
  const [todayFrom, todayTo] = useMemo(() => rangeBounds('today'), [])
  const [yFrom, yTo] = useMemo(() => rangeBounds('yesterday'), [])
  const today = useSummary(todayFrom, todayTo)
  const yesterday = useSummary(yFrom, yTo)

  const byDayMax = useMemo(() => Math.max(1, ...(data?.by_day || []).map(d => d.events)), [data])
  const topPlayed = useMemo(() => aggregateTop(data?.top, ['play', 'use']), [data])
  const topDownloaded = useMemo(() => aggregateTop(data?.top, ['download', 'print']), [data])
  const devices = useMemo(() => sortEntries(data?.devices, ['desktop', 'mobile', 'unknown']), [data])
  const sources = useMemo(() => sortEntries(data?.sources), [data])
  const deviceMax = Math.max(1, ...devices.map(([, n]) => n))
  const sourceMax = Math.max(1, ...sources.map(([, n]) => n))

  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="דוח פעילות בעלים" description="דוח פרטי ומפורט של פעילות באתר עוגה בוגה." noindex path="/admin/activity" />
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-[0_7px_0_#e5e7eb] sm:p-9">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-bold text-violet-600">אזור בעלים · פרטי</p>
          <h1 className="mt-1 text-3xl font-black sm:text-5xl">מה קורה באתר?</h1>
          <p className="mt-2 text-slate-600">אנליטיקס פרטי: מי ביקר, מה שיחקו, מה הורידו, ומאיפה הגיעו. בלי שמות, בלי כתובות IP ובלי טקסט חופשי.</p>
        </div>
        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold">לא מופיע בתפריט הציבורי</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4">
        <span className="font-bold">היום מול אתמול:</span>
        <span>ביקורים <b>{today.data?.pageviews ?? '…'}</b> {compareBadge(today.data?.pageviews, yesterday.data?.pageviews)}</span>
        <span>מבקרים ייחודיים <b>{today.data?.visitors ?? '…'}</b> {compareBadge(today.data?.visitors, yesterday.data?.visitors)}</span>
      </div>

      {error && <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><b>שימו לב:</b> {error}</div>}

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map(r => <button key={r.id} onClick={() => setRange(r.id)}
          className={`min-h-11 rounded-xl border-2 px-4 py-2 font-bold ${range === r.id ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
          {r.label}
        </button>)}
      </div>

      {!data ? <p role="status">טוענים את הדוח…</p> : <>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatCard value={data.total} text="פעולות שנרשמו" tone="bg-violet-50" />
          <StatCard value={data.visitors} text="מבקרים ייחודיים" tone="bg-pink-50" />
          <StatCard value={data.pageviews} text="צפיות בדפים" tone="bg-cyan-50" />
        </div>

        <h2 className="mb-3 text-2xl font-black">פעילות יומית</h2>
        {data.by_day?.length ? <div className="mb-8 flex items-end gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-4" style={{ minHeight: 120 }}>
          {data.by_day.map(d => <div key={d.day} className="flex flex-col items-center gap-1" title={`${formatDay(d.day)}: ${d.events} פעולות, ${d.visitors} מבקרים`}>
            <div className="w-6 rounded-t-md" style={{ height: `${Math.max(4, Math.round((d.events / byDayMax) * 90))}px`, background: SEQUENTIAL[3] }} />
            <span className="text-[10px] text-slate-500">{formatDay(d.day)}</span>
          </div>)}
        </div> : <p className="mb-8 rounded-xl bg-slate-50 p-4">אין עדיין נתונים לתקופה הזו.</p>}

        <div className="mb-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-black">הכי שיחקו / השתמשו</h2>
            {topPlayed.length ? <div className="space-y-2">{topPlayed.map(([key, n], i) => <Bar key={key} value={n} max={topPlayed[0][1]} color={HUES[i % HUES.length]} text={label(key)} />)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתונים.</p>}
          </div>
          <div>
            <h2 className="mb-3 text-xl font-black">הכי הורידו / הדפיסו</h2>
            {topDownloaded.length ? <div className="space-y-2">{topDownloaded.map(([key, n], i) => <Bar key={key} value={n} max={topDownloaded[0][1]} color={HUES[i % HUES.length]} text={label(key)} />)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתונים.</p>}
          </div>
        </div>

        <div className="mb-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-black">מכשירים</h2>
            <div className="space-y-2">{devices.map(([key, n], i) => <Bar key={key} value={n} max={deviceMax} color={HUES[i]} text={DEVICE_LABELS[key] || key} />)}</div>
          </div>
          <div>
            <h2 className="mb-3 text-xl font-black">מאיפה הגיעו</h2>
            <div className="space-y-2">{sources.map(([key, n], i) => <Bar key={key} value={n} max={sourceMax} color={HUES[i % HUES.length]} text={SOURCE_LABELS[key] || key} />)}</div>
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-black">פעולות אחרונות</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead><tr className="border-b-2"><th className="p-2">פעילות</th><th className="p-2">עמוד</th><th className="p-2">מכשיר</th><th className="p-2">מקור</th><th className="p-2">מועד</th></tr></thead>
            <tbody>{(data.recent || []).slice(0, 50).map((row, i) => <tr key={i} className="border-b">
              <td className="p-2">{label(row.category, row.action)}</td>
              <td className="p-2 text-slate-600" dir="ltr">{row.path || '—'}</td>
              <td className="p-2 text-slate-600">{DEVICE_LABELS[row.device] || '—'}</td>
              <td className="p-2 text-slate-600">{SOURCE_LABELS[row.source] || '—'}</td>
              <td className="p-2 text-slate-600">{new Date(row.at).toLocaleString('he-IL')}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </>}
    </div>
  </div>
}

function aggregateTop(top, actions) {
  if (!top) return []
  const byCategory = {}
  for (const row of top) if (actions.includes(row.action)) byCategory[row.category] = (byCategory[row.category] || 0) + row.n
  return Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 8)
}
function sortEntries(obj, order) {
  if (!obj) return []
  const entries = Object.entries(obj).filter(([, n]) => n > 0)
  if (order) entries.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
  else entries.sort((a, b) => b[1] - a[1])
  return entries.slice(0, 8)
}
function compareBadge(current, previous) {
  if (current == null || previous == null) return null
  if (previous === 0) return current > 0 ? <span className="text-emerald-700">▲ חדש</span> : null
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return <span className="text-slate-500">ללא שינוי</span>
  return pct > 0 ? <span className="text-emerald-700">▲ {pct}%</span> : <span className="text-red-600">▼ {Math.abs(pct)}%</span>
}

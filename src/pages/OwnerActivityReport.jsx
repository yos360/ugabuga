import { useEffect, useMemo, useState } from 'react'
import SEO from '../components/ui/SEO'
import { ownerSupabase as supabase } from '../utils/ownerAuth'
import { ACTIVITY_LABELS, ACTION_LABELS } from '../utils/liveActivity'

// Fixed categorical order (never reassigned per-render) — validated for
// colorblind + normal-vision contrast. Devices get slots 1–2, sources 1–6.
const HUES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7', '#008300', '#e34948']
const SEQUENTIAL = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']
const DEVICE_LABELS = { desktop: 'מחשב', mobile: 'טלפון/טאבלט', unknown: 'לא ידוע' }
const SOURCE_LABELS = { direct: 'ישירות', internal: 'מהאתר עצמו', google: 'גוגל', bing: 'בינג', facebook: 'פייסבוק', instagram: 'אינסטגרם', whatsapp: 'וואטסאפ', tiktok: 'טיקטוק', youtube: 'יוטיוב', email: 'מייל', qr: 'סריקת QR מדף מודפס', other: 'אחר', unknown: 'לא ידוע' }
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
function fmtTime(sec) {
  const s = Math.round(sec || 0)
  if (s < 60) return `${s} שנ׳`
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} דק׳`
  return `${Math.floor(s / 3600)} שע׳ ${Math.round((s % 3600) / 60)} דק׳`
}
// Real page names (e.g. "איקס עיגול – לשחק, ללמוד וחוקים" instead of "עמודים באתר · tic-tac-toe"):
// the site's search catalog knows the title of almost every page, games.json the rest.
let pageTitles = new Map()
function usePageTitles() {
  const [, setReady] = useState(0)
  useEffect(() => {
    let live = true
    Promise.all([
      import('../data/searchStatic').then(m => m.STATIC_ITEMS).catch(() => []),
      fetch('/data/games.json').then(r => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([items, games]) => {
      const map = new Map()
      for (const g of games) map.set(`/games/${g.slug}`, `🎮 ${g.name}`)
      for (const it of items) map.set(it.to.split('#')[0].replace(/\/+$/, '') || '/', `${it.emoji ? it.emoji + ' ' : ''}${it.title}`)
      map.set('/', '🏠 עמוד הבית')
      pageTitles = map
      if (live) setReady(n => n + 1)
    })
    return () => { live = false }
  }, [])
}
function pageName(row) {
  const path = (row.path || '/').replace(/\/+$/, '') || '/'
  if (pageTitles.has(path)) return pageTitles.get(path)
  const base = ACTIVITY_LABELS[row.category] || row.category || 'עמוד'
  return ['game', 'worksheet', 'tool', 'page'].includes(row.category) && row.path ? `${base} · ${decodeURIComponent(row.path.split('/').filter(Boolean).at(-1) || 'ראשי')}` : base
}

// ---- Per-page performance ("what works best") ----
// Built only from keys the summary already returns: `top` (path × action counts),
// `time_by_path` and `print_funnel`. Counts are events, not unique people.
const USE_ACTIONS = ['play', 'use', 'check', 'create', 'refresh']
const PRINT_ACTIONS = ['print', 'download']
const MIN_OPENS = 3 // below this, rates are noise
const KINDS = [
  { id: 'all', label: 'הכול' },
  { id: 'game', label: 'משחקים' },
  { id: 'print', label: 'הדפסות' },
  { id: 'tool', label: 'כלים' },
  { id: 'page', label: 'שאר העמודים' },
]
const SORTS = [
  { id: 'score', label: 'ציון כולל' },
  { id: 'opens', label: 'כניסות' },
  { id: 'avg', label: 'זמן שהייה' },
  { id: 'rate', label: 'אחוז פעולה' },
]
function pageKind(path, row) {
  const first = path.split('/').filter(Boolean)[0]
  if (first === 'games' || first === 'board-games' || first === 'dice-games') return 'game'
  if (first === 'printables' || row.prints > 0 || row.previews > 0) return 'print'
  if (first === 'tools') return 'tool'
  return 'page'
}
function buildPageStats(data) {
  if (!data) return []
  const rows = new Map()
  const row = (path, category) => {
    const key = path || '/'
    if (!rows.has(key)) rows.set(key, { path: key, category, opens: 0, uses: 0, prints: 0, previews: 0, shares: 0, avg: null, visitors: null })
    const r = rows.get(key)
    if (!r.category && category) r.category = category
    return r
  }
  for (const t of data.top || []) {
    const r = row(t.path, t.category)
    if (t.action === 'open') r.opens += t.n
    else if (USE_ACTIONS.includes(t.action)) r.uses += t.n
    else if (PRINT_ACTIONS.includes(t.action)) r.prints += t.n
    else if (t.action === 'preview') r.previews += t.n
    else if (t.action === 'share') r.shares += t.n
  }
  for (const t of data.time_by_path || []) { const r = row(t.path, t.category); r.avg = t.avg; r.visitors = t.visitors; r.opens ||= t.visits }
  for (const f of data.print_funnel || []) { const r = row(f.path, f.category); r.opens = Math.max(r.opens, f.opens); r.previews = Math.max(r.previews, f.previews) }
  return [...rows.values()].filter(r => r.opens > 0).map(r => {
    const actions = r.uses + r.prints + r.shares
    const rate = Math.min(1, actions / r.opens)
    // Score: traffic, boosted by how many act on the page and how long they stay (capped at 5 min).
    const score = Math.round(r.opens * (1 + rate) * (1 + Math.min(r.avg || 0, 300) / 300))
    return { ...r, kind: pageKind(r.path, r), rate, score }
  })
}
const pct = r => `${Math.round(r * 100)}%`
function rateTone(r) { return r >= 0.4 ? 'bg-emerald-100 text-emerald-800' : r >= 0.15 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700' }

function TopItems({ title, stats, value, empty }) {
  const list = stats.filter(r => value(r) > 0).sort((a, b) => value(b) - value(a)).slice(0, 10)
  return <div>
    <h2 className="mb-3 text-xl font-black">{title}</h2>
    {list.length ? <div className="space-y-2">{list.map((r, i) => <Bar key={r.path} value={value(r)} max={value(list[0])} color={HUES[i % HUES.length]} text={<span title={r.path}>{pageName(r)}</span>} />)}</div>
      : <p className="rounded-xl bg-slate-50 p-4 text-sm">{empty}</p>}
  </div>
}

function BestPages({ stats }) {
  const [kind, setKind] = useState('all'), [sort, setSort] = useState('score')
  const list = stats.filter(r => kind === 'all' || r.kind === kind)
    .filter(r => sort === 'score' || sort === 'opens' || r.opens >= MIN_OPENS)
    .sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1)).slice(0, 25)
  const chip = (on, onClick, text) => <button onClick={onClick} className={`min-h-9 rounded-xl border-2 px-3 py-1 text-sm font-bold ${on ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{text}</button>
  return <>
    <h2 className="mb-1 text-2xl font-black">🏆 מה עובד הכי טוב</h2>
    <p className="mb-3 text-sm text-slate-600">כל עמוד בנפרד. <b>אחוז פעולה</b> = מתוך מי שנכנס, כמה גם שיחקו, השתמשו, הדפיסו, הורידו או שיתפו. <b>ציון כולל</b> = כניסות, מוגדל לפי אחוז הפעולה ולפי זמן השהייה (עד 5 דק׳). מיון לפי זמן או אחוז מציג רק עמודים עם {MIN_OPENS}+ כניסות.</p>
    <div className="mb-2 flex flex-wrap gap-2">{KINDS.map(k => <span key={k.id}>{chip(kind === k.id, () => setKind(k.id), k.label)}</span>)}</div>
    <div className="mb-3 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">מיון:</span>{SORTS.map(s => <span key={s.id}>{chip(sort === s.id, () => setSort(s.id), s.label)}</span>)}</div>
    {list.length ? <div className="mb-8 overflow-x-auto"><table className="w-full text-right text-sm">
      <thead><tr className="border-b-2"><th className="p-2">#</th><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">שיחקו/השתמשו</th><th className="p-2">הדפיסו/הורידו</th><th className="p-2">שיתפו</th><th className="p-2">אחוז פעולה</th><th className="p-2">זמן ממוצע</th><th className="p-2">ציון</th></tr></thead>
      <tbody>{list.map((r, i) => <tr key={r.path} className="border-b">
        <td className="p-2 text-slate-500">{i + 1}</td>
        <td className="p-2"><b>{pageName(r)}</b><div className="text-xs text-slate-500" dir="ltr">{r.path}</div></td>
        <td className="p-2">{r.opens}</td><td className="p-2">{r.uses || '—'}</td><td className="p-2">{r.prints || '—'}</td><td className="p-2">{r.shares || '—'}</td>
        <td className="p-2"><span className={`rounded-lg px-2 py-0.5 font-bold ${rateTone(r.rate)}`}>{pct(r.rate)}</span></td>
        <td className="p-2">{r.avg == null ? '—' : fmtTime(r.avg)}</td>
        <td className="p-2 font-bold">{r.score}</td>
      </tr>)}</tbody>
    </table></div> : <p className="mb-8 rounded-xl bg-slate-50 p-4 text-sm">אין עדיין מספיק נתונים לסינון הזה.</p>}
  </>
}

function Bouncing({ stats }) {
  // Pages people reach but leave fast without doing anything — worth improving or promoting less.
  const list = stats.filter(r => r.opens >= 5 && r.rate < 0.1 && r.avg != null && r.avg < 20).sort((a, b) => b.opens - a.opens).slice(0, 15)
  return <>
    <h2 className="mb-1 text-2xl font-black">🚪 נכנסים ויוצאים מהר</h2>
    <p className="mb-3 text-sm text-slate-600">עמודים עם 5+ כניסות, זמן שהייה ממוצע מתחת ל-20 שניות, ופחות מ-10% שעשו בהם משהו. כדאי לבדוק אם הם ברורים, אם הם עובדים טוב בטלפון, ואם הם עונים על מה שאנשים חיפשו.</p>
    {list.length ? <div className="mb-8 overflow-x-auto"><table className="w-full text-right text-sm">
      <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">זמן ממוצע</th><th className="p-2">אחוז פעולה</th></tr></thead>
      <tbody>{list.map(r => <tr key={r.path} className="border-b">
        <td className="p-2"><b>{pageName(r)}</b><div className="text-xs text-slate-500" dir="ltr">{r.path}</div></td>
        <td className="p-2">{r.opens}</td><td className="p-2 font-bold text-red-700">{fmtTime(r.avg)}</td><td className="p-2">{pct(r.rate)}</td>
      </tr>)}</tbody>
    </table></div> : <p className="mb-8 rounded-xl bg-emerald-50 p-4 text-sm">אין עמודים כאלה בתקופה הזו 🎉</p>}
  </>
}
function TrackSelf() {
  const [on, setOn] = useState(() => { try { return localStorage.getItem('buga-track-self') === '1' } catch { return false } })
  const toggle = e => { const v = e.target.checked; setOn(v); try { v ? localStorage.setItem('buga-track-self', '1') : localStorage.removeItem('buga-track-self') } catch { /* ignore */ } }
  return <label className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
    <input type="checkbox" checked={on} onChange={toggle} className="mt-1 h-4 w-4" />
    <span><b>לספור גם את הגלישה שלי (לבדיקה)</b><br /><span className="text-slate-600">כברירת מחדל הדפדפן שלך לא נספר, כדי שהבדיקות שלך לא יעוותו את הנתונים. אם הדפסת בעצמך ולא ראית את זה בדוח, זו הסיבה.</span></span>
  </label>
}
function formatDay(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
}

function Bar({ value, max, color, text }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return <div className="flex items-center gap-3">
    <span className="w-40 shrink-0 text-sm leading-snug text-slate-700 sm:w-56 [overflow-wrap:anywhere] line-clamp-2">{text}</span>
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
  usePageTitles()
  const [range, setRange] = useState('today')
  const [from, to] = useMemo(() => rangeBounds(range), [range])
  const { data, error } = useSummary(from, to)
  const [todayFrom, todayTo] = useMemo(() => rangeBounds('today'), [])
  const [yFrom, yTo] = useMemo(() => rangeBounds('yesterday'), [])
  const today = useSummary(todayFrom, todayTo)
  const yesterday = useSummary(yFrom, yTo)

  const byDayMax = useMemo(() => Math.max(1, ...(data?.by_day || []).map(d => d.events)), [data])
  const pageStats = useMemo(() => buildPageStats(data), [data])
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

      <div className="mb-6"><TrackSelf /></div>

      {error && <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><b>שימו לב:</b> {error}</div>}

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map(r => <button key={r.id} onClick={() => setRange(r.id)}
          className={`min-h-11 rounded-xl border-2 px-4 py-2 font-bold ${range === r.id ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
          {r.label}
        </button>)}
      </div>

      {!data ? <p role="status">טוענים את הדוח…</p> : <>
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard value={data.visitors} text="מבקרים ייחודיים" tone="bg-pink-50" />
          <StatCard value={data.pageviews} text="צפיות בדפים" tone="bg-cyan-50" />
          <StatCard value={data.time_visitors ? fmtTime((data.time_total || 0) / data.time_visitors) : '—'} text="זמן ממוצע למבקר באתר" tone="bg-emerald-50" />
          <StatCard value={data.by_action?.preview || 0} text="פתחו תצוגת הדפסה" tone="bg-amber-50" />
          <StatCard value={data.by_action?.print || 0} text="הדפיסו בפועל" tone="bg-orange-50" />
          <StatCard value={data.sources?.qr || 0} text="סרקו QR מדף מודפס" tone="bg-lime-50" />
          <StatCard value={data.total} text="כל הפעולות שנרשמו" tone="bg-violet-50" />
        </div>

        <BestPages stats={pageStats} />

        <div className="mb-8 grid gap-8 sm:grid-cols-2">
          <TopItems title="🎮 10 המשחקים והכלים שהכי שיחקו" stats={pageStats} value={r => r.uses} empty="אין עדיין משחקים בתקופה הזו." />
          <TopItems title="🖨️ 10 הדפים שהכי הדפיסו / הורידו" stats={pageStats} value={r => r.prints} empty="אין עדיין הדפסות בתקופה הזו." />
        </div>

        <Bouncing stats={pageStats} />

        <h2 className="mb-1 text-2xl font-black">⏱️ כמה זמן נשארו בכל עמוד</h2>
        <p className="mb-3 text-sm text-slate-600">נספר רק זמן שהלשונית פתוחה והמבקר עשה משהו בשתי הדקות האחרונות.</p>
        {data.time_by_path?.length ? <div className="mb-8 overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">מבקרים</th><th className="p-2">זמן ממוצע</th><th className="p-2">זמן כולל</th></tr></thead>
          <tbody>{data.time_by_path.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><div className="text-xs text-slate-500" dir="ltr">{r.path || '/'}</div></td>
            <td className="p-2">{r.visits}</td><td className="p-2">{r.visitors}</td>
            <td className="p-2 font-bold">{fmtTime(r.avg)}</td><td className="p-2">{fmtTime(r.total)}</td>
          </tr>)}</tbody>
        </table></div> : <p className="mb-8 rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתוני זמן לתקופה הזו (המדידה מתחילה מעכשיו).</p>}

        <h2 className="mb-1 text-2xl font-black">🖨️ מה הדפיסו</h2>
        <p className="mb-3 text-sm text-slate-600">כמה נכנסו לעמוד, כמה פתחו את תצוגת ההדפסה, וכמה לחצו „הדפסה” בפועל.</p>
        {data.print_funnel?.length ? <div className="mb-8 overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">נכנסו</th><th className="p-2">פתחו תצוגה</th><th className="p-2">הדפיסו</th></tr></thead>
          <tbody>{data.print_funnel.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><div className="text-xs text-slate-500" dir="ltr">{r.path || '/'}</div></td>
            <td className="p-2">{r.opens}</td><td className="p-2">{r.previews}</td><td className="p-2 font-bold">{r.prints}</td>
          </tr>)}</tbody>
        </table></div> : <p className="mb-8 rounded-xl bg-slate-50 p-4 text-sm">אין עדיין הדפסות בתקופה הזו.</p>}

        <h2 className="mb-1 text-2xl font-black">📱 סריקות QR מדפים מודפסים</h2>
        <p className="mb-3 text-sm text-slate-600">כל דף שמודפס מהאתר נושא QR שמחזיר לעמוד שממנו הודפס. כאן רואים איזה דף מודפס נסרק, וכמה אנשים שונים סרקו אותו.</p>
        {data.qr_landing?.length ? <div className="mb-8 overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">הדף המודפס שנסרק</th><th className="p-2">סורקים</th></tr></thead>
          <tbody>{data.qr_landing.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><div className="text-xs text-slate-500" dir="ltr">{r.path || '/'}</div></td>
            <td className="p-2 font-bold">{r.scans}</td>
          </tr>)}</tbody>
        </table></div> : <p className="mb-8 rounded-xl bg-slate-50 p-4 text-sm">{data.qr_landing ? 'אין עדיין סריקות QR בתקופה הזו.' : `סה״כ ${data.sources?.qr || 0} סורקים. הפירוט לפי דף יופיע אחרי עדכון מסד הנתונים.`}</p>}

        <h2 className="mb-3 text-2xl font-black">פעילות יומית</h2>
        {data.by_day?.length ? <div className="mb-8 flex items-end gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-4" style={{ minHeight: 120 }}>
          {data.by_day.map(d => <div key={d.day} className="flex flex-col items-center gap-1" title={`${formatDay(d.day)}: ${d.events} פעולות, ${d.visitors} מבקרים`}>
            <div className="w-6 rounded-t-md" style={{ height: `${Math.max(4, Math.round((d.events / byDayMax) * 90))}px`, background: SEQUENTIAL[3] }} />
            <span className="text-[10px] text-slate-500">{formatDay(d.day)}</span>
          </div>)}
        </div> : <p className="mb-8 rounded-xl bg-slate-50 p-4">אין עדיין נתונים לתקופה הזו.</p>}

        <div className="mb-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-black">הכי שיחקו / השתמשו (לפי קטגוריה)</h2>
            {topPlayed.length ? <div className="space-y-2">{topPlayed.map(([key, n], i) => <Bar key={key} value={n} max={topPlayed[0][1]} color={HUES[i % HUES.length]} text={label(key)} />)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתונים.</p>}
          </div>
          <div>
            <h2 className="mb-3 text-xl font-black">הכי הורידו / הדפיסו (לפי קטגוריה)</h2>
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
            <thead><tr className="border-b-2"><th className="p-2">פעילות</th><th className="p-2">מה עשו</th><th className="p-2">עמוד</th><th className="p-2">מכשיר</th><th className="p-2">מקור</th><th className="p-2">מועד</th></tr></thead>
            <tbody>{(data.recent || []).slice(0, 50).map((row, i) => <tr key={i} className="border-b">
              <td className="p-2">{label(row.category, row.action)}</td>
              <td className="p-2">{row.action === 'time' ? `⏱️ שהו ${fmtTime(row.seconds)}` : ACTION_LABELS[row.action] || row.action}</td>
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

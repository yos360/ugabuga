import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SEO from '../components/ui/SEO'
import { ownerSupabase as supabase } from '../utils/ownerAuth'
import { ACTIVITY_LABELS, ACTION_LABELS } from '../utils/liveActivity'
import OwnerPartyLists, { partyPreview, usePartyLists } from '../components/owner/OwnerPartyLists'
import ReportSections from '../components/owner/ReportSections'
import SoundSettings, { useArrivalSound, useSoundSettings } from '../components/owner/ArrivalSound'

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
  // Ranges that end "now" end tomorrow instead, so a report left open keeps seeing new events.
  const later = dayBounds(1)
  if (id === 'today') return [dayBounds(0), later]
  if (id === 'yesterday') return [dayBounds(-1), dayBounds(0)]
  // "7 days" = the last 7 calendar days including today (from midnight), so every bar in the
  // daily chart is a whole day — it used to start at this clock time 7 days ago.
  return [dayBounds(1 - Number(id)), later]
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

// Page path as a link to the live page (new tab, so the report stays open).
function PathLink({ path, className = 'text-xs text-slate-500' }) {
  if (!path) return '—'
  return <a href={path} target="_blank" rel="noopener noreferrer" dir="ltr" className={`${className} block hover:text-blue-600 hover:underline`}>{path}</a>
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
  if (first === 'games' || first === 'board-games' || first === 'dice-games' || first === 'online-games') return 'game'
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
    <h3 className="mb-3 text-lg font-black">{title}</h3>
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
    <p className="mb-3 text-sm text-slate-600">כל עמוד בנפרד. <b>אחוז פעולה</b> = מתוך מי שנכנס, כמה גם שיחקו, השתמשו, הדפיסו, הורידו או שיתפו. <b>ציון כולל</b> = כניסות, מוגדל לפי אחוז הפעולה ולפי זמן השהייה (עד 5 דק׳). מיון לפי זמן או אחוז מציג רק עמודים עם {MIN_OPENS}+ כניסות.</p>
    <div className="mb-2 flex flex-wrap gap-2">{KINDS.map(k => <span key={k.id}>{chip(kind === k.id, () => setKind(k.id), k.label)}</span>)}</div>
    <div className="mb-3 flex flex-wrap items-center gap-2"><span className="text-sm font-bold">מיון:</span>{SORTS.map(s => <span key={s.id}>{chip(sort === s.id, () => setSort(s.id), s.label)}</span>)}</div>
    {list.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
      <thead><tr className="border-b-2"><th className="p-2">#</th><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">שיחקו/השתמשו</th><th className="p-2">הדפיסו/הורידו</th><th className="p-2">שיתפו</th><th className="p-2">אחוז פעולה</th><th className="p-2">זמן ממוצע</th><th className="p-2">ציון</th></tr></thead>
      <tbody>{list.map((r, i) => <tr key={r.path} className="border-b">
        <td className="p-2 text-slate-500">{i + 1}</td>
        <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path} /></td>
        <td className="p-2">{r.opens}</td><td className="p-2">{r.uses || '—'}</td><td className="p-2">{r.prints || '—'}</td><td className="p-2">{r.shares || '—'}</td>
        <td className="p-2"><span className={`rounded-lg px-2 py-0.5 font-bold ${rateTone(r.rate)}`}>{pct(r.rate)}</span></td>
        <td className="p-2">{r.avg == null ? '—' : fmtTime(r.avg)}</td>
        <td className="p-2 font-bold">{r.score}</td>
      </tr>)}</tbody>
    </table></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין מספיק נתונים לסינון הזה.</p>}
  </>
}

function Bouncing({ stats }) {
  // Pages people reach but leave fast without doing anything — worth improving or promoting less.
  const list = stats.filter(r => r.opens >= 5 && r.rate < 0.1 && r.avg != null && r.avg < 20).sort((a, b) => b.opens - a.opens).slice(0, 15)
  return <>
    <p className="mb-3 text-sm text-slate-600">עמודים עם 5+ כניסות, זמן שהייה ממוצע מתחת ל-20 שניות, ופחות מ-10% שעשו בהם משהו. כדאי לבדוק אם הם ברורים, אם הם עובדים טוב בטלפון, ואם הם עונים על מה שאנשים חיפשו.</p>
    {list.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
      <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">זמן ממוצע</th><th className="p-2">אחוז פעולה</th></tr></thead>
      <tbody>{list.map(r => <tr key={r.path} className="border-b">
        <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path} /></td>
        <td className="p-2">{r.opens}</td><td className="p-2 font-bold text-red-700">{fmtTime(r.avg)}</td><td className="p-2">{pct(r.rate)}</td>
      </tr>)}</tbody>
    </table></div> : <p className="rounded-xl bg-emerald-50 p-4 text-sm">אין עמודים כאלה בתקופה הזו 🎉</p>}
  </>
}
// One row per anonymous visitor (a browser on one day — the id rotates every 24h, so it
// names no one): how much they did, where they came from, and their path through the site.
const visitorColor = v => HUES[parseInt(v || '0', 16) % HUES.length]
function VisitorTag({ v }) {
  if (!v) return '—'
  return <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-xs" dir="ltr">
    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: visitorColor(v) }} />{v}
  </span>
}
function ByVisitor({ data }) {
  const [showAll, setShowAll] = useState(false)
  if (!data.by_visitor) return <>
    <p className="rounded-xl bg-slate-50 p-4 text-sm">הפירוט לפי מבקר יופיע אחרי עדכון מסד הנתונים.</p>
  </>
  const list = showAll ? data.by_visitor : data.by_visitor.slice(0, 20)
  return <>
    <p className="mb-3 text-sm text-slate-600">כל שורה = דפדפן אחד ביום אחד (מזהה אקראי שמתחלף כל 24 שעות, בלי שם ובלי IP), כך שאותו אדם ביום אחר יופיע כמבקר חדש. לחצו על שורה כדי לראות את המסלול שלו באתר. אותו קוד מופיע גם ב„פעולות אחרונות”.</p>
    {list.length ? <div>
      {list.map(r => <details key={r.v + r.first} className="border-b py-2 text-sm">
        <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1">
          <VisitorTag v={r.v} />
          <span><b>{r.events}</b> פעולות</span>
          <span>{r.pages} דפים</span>
          <span>{r.acts ? <b className="text-emerald-700">{r.acts} פעולות שימוש</b> : <span className="text-slate-500">רק צפה</span>}</span>
          <span>⏱️ {r.secs ? fmtTime(r.secs) : '—'}</span>
          <span className="text-slate-600">{SOURCE_LABELS[r.source] || '—'}</span>
          <span className="text-slate-600">{DEVICE_LABELS[r.device] || '—'}</span>
          <span className="text-slate-500">{fmtClock(r.first)}{r.last !== r.first ? `–${fmtClock(r.last)}` : ''}</span>
        </summary>
        <ol className="mt-2 space-y-1 border-r-4 pr-3" style={{ borderColor: visitorColor(r.v) }}>
          {(r.steps || []).map((st, i) => <li key={i} className="flex flex-wrap gap-x-2">
            <span className="shrink-0 text-slate-500">{fmtClock(st.at)}</span>
            <b>{ACTION_LABELS[st.a] || st.a}</b>
            <span>{pageName({ path: st.p, category: st.c })}</span>
          </li>)}
          {r.events > (r.steps || []).length && <li className="text-slate-500">…ועוד {r.events - r.steps.length} פעולות</li>}
        </ol>
      </details>)}
    {data.by_visitor.length > 20 && <button onClick={() => setShowAll(v => !v)} className="mt-3 min-h-9 rounded-xl border-2 border-slate-200 px-3 py-1 text-sm font-bold">{showAll ? 'להציג פחות' : `להציג את כל ${data.by_visitor.length} המבקרים`}</button>}
    </div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין מבקרים בתקופה הזו.</p>}
  </>
}
function fmtClock(iso) {
  const d = new Date(iso), today = new Date().toDateString() === d.toDateString()
  return d.toLocaleString('he-IL', today ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
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

function useSummary(from, to, tick = 0) {
  const [data, setData] = useState(null), [error, setError] = useState('')
  const shown = useRef('')
  useEffect(() => {
    let live = true
    // A new range clears the screen; a refresh (or an end time that moves, like "yesterday up to
    // this hour") keeps the old numbers on screen until the new ones arrive instead of flashing "…".
    const key = String(from.getTime())
    if (shown.current !== key) setData(null)
    shown.current = key
    supabase.rpc('owner_activity_summary', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => {
      if (!live) return
      if (error) { setError('הדוח המפורט עדיין לא זמין. ודאו שהמסד עודכן.'); return }
      setData(data)
    })
    return () => { live = false }
  }, [from.getTime(), to.getTime(), tick]) // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error }
}

// Live refresh shared by the full report and the mini widget: every new event in the database
// pushes a refresh (Supabase Realtime, owner-only by RLS); polling every 30 seconds while the live link is down,
// and a slow 5-minute safety refresh while it is up.
function useLiveRefresh(background = false) {
  const [tick, setTick] = useState(0), [updated, setUpdated] = useState(() => new Date())
  const refresh = () => { setTick(t => t + 1); setUpdated(new Date()) }
  const [live, setLive] = useState(false)
  useEffect(() => {
    let timer = null, last = 0, dropped = false
    const soon = () => { // batch bursts (a page view + time + click arrive together)
      clearTimeout(timer)
      timer = setTimeout(() => { last = Date.now(); refresh() }, Math.max(600, 1500 - (Date.now() - last)))
    }
    const channel = supabase.channel('owner-activity-live-' + Math.random().toString(36).slice(2, 8))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'owner_site_activity' }, soon)
      .subscribe(status => {
        if (status === 'SUBSCRIBED') { setLive(true); if (dropped) refresh() } // reconnected: catch anything missed meanwhile
        else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) { setLive(false); dropped = true }
      })
    const onShow = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onShow)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onShow); void supabase.removeChannel(channel) }
  }, [])
  // Fallback while the live link is down: poll every 30 seconds. While live, a slow 5-minute
  // safety refresh still runs in case events silently stop arriving.
  useEffect(() => {
    // With the arrival sound on, keep checking in a background tab too — that's when it's useful.
    const iv = setInterval(() => { if (background || document.visibilityState === 'visible') refresh() }, live ? 300000 : 30000)
    return () => clearInterval(iv)
  }, [live, background])
  return { tick, updated, refresh, live }
}

// The headline numbers, shared by the report and the mini widget: [value, label, short label, tone]
function statItems(data, multiDay = false) {
  return [
    // The anonymous id changes every midnight, so over several days a returning person is counted
    // once per day they came: that is "visits", not unique people.
    [data.visitors, multiDay ? 'ביקורים (כל מבקר נספר פעם אחת בכל יום)' : 'מבקרים ייחודיים', 'מבקרים', 'bg-pink-50'],
    [data.pageviews, 'צפיות בדפים', 'צפיות', 'bg-cyan-50'],
    [data.time_visitors ? fmtTime((data.time_total || 0) / data.time_visitors) : '—', 'זמן ממוצע למבקר באתר', 'זמן ממוצע', 'bg-emerald-50'],
    [data.by_action?.preview || 0, 'פתחו תצוגת הדפסה', 'תצוגת הדפסה', 'bg-amber-50'],
    [data.by_action?.print || 0, 'לחצו הדפסה (נפתח חלון ההדפסה)', 'הדפסות', 'bg-orange-50'],
    [data.by_action?.download || 0, 'הורידו PDF / קובץ', 'PDF', 'bg-yellow-50'],
    [data.sources?.qr || 0, 'אנשים שסרקו QR מדף מודפס', 'סרקו QR', 'bg-lime-50'],
    [data.by_action?.share || 0, 'שיתופים (וואטסאפ ושיתוף מהטלפון)', 'שיתופים', 'bg-green-50'],
    [data.sources?.whatsapp || 0, 'אנשים שהגיעו מקישור בוואטסאפ', 'מוואטסאפ', 'bg-teal-50'],
    [data.total, 'כל הפעולות שנרשמו', 'כל הפעולות', 'bg-violet-50'],
  ]
}

// Small always-on-top style widget: today's numbers + the last few actions.
function MiniWidget({ data, live, updated, onRefresh, onClose }) {
  return <div dir="rtl" className="min-h-full bg-white p-3 font-sans text-slate-900">
    <div className="mb-2 flex items-center justify-between gap-2">
      <b className="text-base">🎂 עוגה בוגה · היום</b>
      <span className="text-[11px] text-slate-500">{live ? '🟢 בלייב' : '⏱️ כל 30 שנ׳'} · {updated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    {!data ? <p className="text-sm">טוענים…</p> : <>
      <div className="grid grid-cols-3 gap-1.5">{statItems(data).slice(0, 9).map(([v, , short, tone]) => <div key={short} className={`rounded-xl px-2 py-1.5 ${tone}`}><b className="block text-xl leading-tight">{v}</b><span className="text-[11px] leading-tight text-slate-700">{short}</span></div>)}</div>
      <p className="mt-2 mb-1 text-xs font-bold text-slate-600">פעולות אחרונות</p>
      <ul className="space-y-0.5 text-[12px] leading-snug">{(data.recent || []).filter(r => r.action !== 'time').slice(0, 6).map((r, i) => <li key={i} className="truncate"><span className="text-slate-500">{fmtClock(r.at)}</span> · {ACTION_LABELS[r.action] || r.action} · <b>{pageName(r)}</b>{r.source === 'qr' ? ' 📱QR' : r.source === 'whatsapp' ? ' 💬' : ''}</li>)}</ul>
    </>}
    <div className="mt-2 flex gap-2">
      <button onClick={onRefresh} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold">🔄 רענון</button>
      {onClose && <button onClick={onClose} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold">✕ סגירה</button>}
    </div>
  </div>
}

// /admin/mini — the widget as its own page (for a small separate window or a phone home-screen shortcut)
export function OwnerMini() {
  usePageTitles()
  const [sound, setSound] = useSoundSettings()
  const { tick, updated, refresh, live } = useLiveRefresh(sound.on)
  const day = updated.toDateString()
  const [from, to] = useMemo(() => rangeBounds('today'), [day]) // eslint-disable-line react-hooks/exhaustive-deps
  const { data } = useSummary(from, to, tick)
  useArrivalSound(data, sound)
  return <><SEO title="עוגה בוגה — מיני דוח" description="דוח פרטי מקוצר." noindex path="/admin/mini" /><MiniWidget data={data} live={live} updated={updated} onRefresh={refresh} /><div className="px-3 pb-3" dir="rtl"><SoundSettings settings={sound} update={setSound} compact /></div></>
}

// Chrome/Edge (desktop) can open a real always-on-top mini window (Document Picture-in-Picture).
async function openFloating(setPip) {
  if (!('documentPictureInPicture' in window)) { window.open('/admin/mini', 'buga-mini', 'width=380,height=560'); return }
  const w = await window.documentPictureInPicture.requestWindow({ width: 380, height: 520 })
  for (const sheet of [...document.styleSheets]) {
    try { const st = w.document.createElement('style'); st.textContent = [...sheet.cssRules].map(r => r.cssText).join('\n'); w.document.head.appendChild(st) }
    catch { if (sheet.href) { const l = w.document.createElement('link'); l.rel = 'stylesheet'; l.href = sheet.href; w.document.head.appendChild(l) } }
  }
  w.document.documentElement.dir = 'rtl'; w.document.body.style.margin = '0'
  w.addEventListener('pagehide', () => setPip(null))
  setPip(w)
}

export default function OwnerActivityReport() {
  usePageTitles()
  const [range, setRange] = useState('today')
  const [sound, setSound] = useSoundSettings()
  const { tick, updated, refresh, live } = useLiveRefresh(sound.on)
  const [pip, setPip] = useState(null)
  const day = updated.toDateString() // after midnight "today" moves to the new day
  const [from, to] = useMemo(() => rangeBounds(range), [range, day]) // eslint-disable-line react-hooks/exhaustive-deps
  const { data, error } = useSummary(from, to, tick)
  const [todayFrom, todayTo] = useMemo(() => rangeBounds('today'), [day]) // eslint-disable-line react-hooks/exhaustive-deps
  // A fair comparison: today so far vs yesterday up to the same clock time (not all of yesterday,
  // which made every morning look like a drop). The full-day total is shown next to it.
  const [yFrom, yFullTo] = useMemo(() => rangeBounds('yesterday'), [day]) // eslint-disable-line react-hooks/exhaustive-deps
  const ySameTime = useMemo(() => new Date(Date.now() - 86400000), [tick, day]) // eslint-disable-line react-hooks/exhaustive-deps
  const today = useSummary(todayFrom, todayTo, tick)
  useArrivalSound(today.data, sound)
  const yesterday = useSummary(yFrom, ySameTime, tick)
  const yesterdayFull = useSummary(yFrom, yFullTo)
  const sameTime = ySameTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

  const creations = useCreations(from, to, tick)
  const byDayMax = useMemo(() => Math.max(1, ...(data?.by_day || []).map(d => d.visitors)), [data])
  const pageStats = useMemo(() => buildPageStats(data), [data])
  const topPlayed = useMemo(() => aggregateTop(data?.top, ['play', 'use']), [data])
  const topDownloaded = useMemo(() => aggregateTop(data?.top, ['download', 'print']), [data])
  const pdfByPath = useMemo(() => { const m = new Map(); for (const t of data?.top || []) if (t.action === 'download') m.set(t.path || '', (m.get(t.path || '') || 0) + t.n); return m }, [data])
  const devices = useMemo(() => sortEntries(data?.devices, ['desktop', 'mobile', 'unknown']), [data])
  const sources = useMemo(() => sortEntries(data?.sources), [data])
  const deviceMax = Math.max(1, ...devices.map(([, n]) => n))
  const sourceMax = Math.max(1, ...sources.map(([, n]) => n))
  const party = usePartyLists()

  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    {pip && createPortal(<MiniWidget data={today.data} live={live} updated={updated} onRefresh={refresh} onClose={() => pip.close()} />, pip.document.body)}
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
        <span className="font-bold">היום עד עכשיו, מול אתמול עד {sameTime}:</span>
        <span>מבקרים <b>{today.data?.visitors ?? '…'}</b> <small className="text-slate-500">(אתמול {yesterday.data?.visitors ?? '…'})</small> {compareBadge(today.data?.visitors, yesterday.data?.visitors)}</span>
        <span>צפיות בעמודים <b>{today.data?.pageviews ?? '…'}</b> <small className="text-slate-500">(אתמול {yesterday.data?.pageviews ?? '…'})</small> {compareBadge(today.data?.pageviews, yesterday.data?.pageviews)}</span>
        <span className="text-sm text-slate-500">כל אתמול: {yesterdayFull.data?.visitors ?? '…'} מבקרים · {yesterdayFull.data?.pageviews ?? '…'} צפיות</span>
      </div>

      <div className="mb-3"><SoundSettings settings={sound} update={setSound} /></div>
      <div className="mb-6"><TrackSelf /></div>

      {error && <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><b>שימו לב:</b> {error}</div>}

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map(r => <button key={r.id} onClick={() => setRange(r.id)}
          className={`min-h-11 rounded-xl border-2 px-4 py-2 font-bold ${range === r.id ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
          {r.label}
        </button>)}
        <button onClick={refresh} className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-bold text-slate-700">🔄 רענון</button>
        <button onClick={() => { if (pip) pip.close(); else void openFloating(setPip).catch(() => {}) }} className="min-h-11 rounded-xl border-2 border-violet-300 bg-violet-50 px-4 py-2 font-bold text-violet-700">{pip ? '✕ לסגור חלונית' : '📌 חלונית קטנה צפה'}</button>
        <span className="self-center text-sm text-slate-500">{live ? '🟢 בלייב — כל פעולה באתר מופיעה מיד' : 'מתעדכן כל 30 שניות'} · עודכן ב-{updated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      {!data ? <p role="status">טוענים את הדוח…</p> : <>
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statItems(data, range === '7' || range === '30').map(([v, text, , tone]) => <StatCard key={text} value={v} text={text} tone={tone} />)}
        </div>

        <ReportSections sections={[
          { id: 'creations', title: '✍️ מה יצרו באתר', badge: creations.rows?.length || null, empty: creations.error ? 'הטבלה עוד לא קיימת — צריך להריץ את המיגרציה owner_creations.' : 'אין עדיין יצירות בתקופה הזו.',
            preview: (creations.rows || []).slice(0, 3).map(r => <span key={r.id}><b>{r.tool}</b> · {CREATION_ACTIONS[r.action]} · {r.content.split('\n')[0].slice(0, 60)}</span>),
            render: () => <Creations rows={creations.rows} error={creations.error} /> },
          { id: 'best', title: '🏆 מה עובד הכי טוב', preview: lastEvents(data, r => r.action === 'open'), render: () => <BestPages stats={pageStats} /> },
          { id: 'top', title: '🔝 10 הכי: משחקים, הדפסות ושיתופים', preview: lastEvents(data, r => ['play', 'use', 'print', 'download', 'share'].includes(r.action)), render: () => <>
        <div className="grid gap-8 sm:grid-cols-2">
          <TopItems title="🎮 10 המשחקים והכלים שהכי שיחקו" stats={pageStats} value={r => r.uses} empty="אין עדיין משחקים בתקופה הזו." />
          <TopItems title="🖨️ 10 הדפים שהכי הדפיסו / הורידו" stats={pageStats} value={r => r.prints} empty="אין עדיין הדפסות בתקופה הזו." />
          <TopItems title="📤 10 העמודים שהכי שיתפו בוואטסאפ" stats={pageStats} value={r => r.shares} empty="אין עדיין שיתופים בתקופה הזו." />
        </div>

        </> },
          { id: 'bounce', title: '🚪 נכנסים ויוצאים מהר', preview: bouncePreview(pageStats), empty: 'אין עמודים כאלה בתקופה הזו 🎉', render: () => <Bouncing stats={pageStats} /> },
          { id: 'party', title: '🧺 רשימות "מי מביא מה"', badge: party.lists?.length, preview: partyPreview(party.lists), empty: party.lists ? 'אין עדיין רשימות.' : 'טוענים…', render: () => <OwnerPartyLists {...party} /> },
          { id: 'time', title: '⏱️ כמה זמן נשארו בכל עמוד', preview: lastEvents(data, r => r.action === 'time'), render: () => <>
        <p className="mb-3 text-sm text-slate-600">נספר רק זמן שהלשונית פתוחה והמבקר עשה משהו בשתי הדקות האחרונות.</p>
        {data.time_by_path?.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">מבקרים</th><th className="p-2">זמן ממוצע</th><th className="p-2">זמן כולל</th></tr></thead>
          <tbody>{data.time_by_path.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path || '/'} /></td>
            <td className="p-2">{r.visits}</td><td className="p-2">{r.visitors}</td>
            <td className="p-2 font-bold">{fmtTime(r.avg)}</td><td className="p-2">{fmtTime(r.total)}</td>
          </tr>)}</tbody>
        </table></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתוני זמן לתקופה הזו (המדידה מתחילה מעכשיו).</p>}

        </> },
          { id: 'prints', title: '🖨️ מה הדפיסו', preview: lastEvents(data, r => ['preview', 'print', 'download'].includes(r.action)), render: () => <>
        <p className="mb-3 text-sm text-slate-600">כמה נכנסו לעמוד, כמה פתחו את תצוגת ההדפסה, כמה לחצו „הדפסה” (הדפדפן לא מדווח אם הדף באמת יצא מהמדפסת) וכמה שמרו PDF. מ-7.10.26 PDF נספר בנפרד; לפני כן הוא נספר כהדפסה.</p>
        {data.print_funnel?.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">נכנסו</th><th className="p-2">פתחו תצוגה</th><th className="p-2">הדפיסו</th><th className="p-2">PDF</th></tr></thead>
          <tbody>{data.print_funnel.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path || '/'} /></td>
            <td className="p-2">{r.opens}</td><td className="p-2">{r.previews}</td><td className="p-2 font-bold">{r.prints}</td><td className="p-2">{pdfByPath.get(r.path || '') || '—'}</td>
          </tr>)}</tbody>
        </table></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין הדפסות בתקופה הזו.</p>}

        </> },
          { id: 'qr', title: '📱 סריקות QR מדפים מודפסים', badge: data.sources?.qr || null, preview: lastEvents(data, r => r.source === 'qr' && r.action === 'open'), empty: 'אין עדיין סריקות QR בתקופה הזו.', render: () => <>
        <p className="mb-3 text-sm text-slate-600">כל דף שמודפס מהאתר נושא QR שמחזיר לעמוד שממנו הודפס. כאן רואים איזה דף מודפס נסרק, וכמה אנשים שונים סרקו אותו.</p>
        {data.qr_landing?.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">הדף המודפס שנסרק</th><th className="p-2">סורקים</th></tr></thead>
          <tbody>{data.qr_landing.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path || '/'} /></td>
            <td className="p-2 font-bold">{r.scans}</td>
          </tr>)}</tbody>
        </table></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">{data.qr_landing ? 'אין עדיין סריקות QR בתקופה הזו.' : `סה״כ ${data.sources?.qr || 0} סורקים. הפירוט לפי דף יופיע אחרי עדכון מסד הנתונים.`}</p>}

        </> },
          { id: 'days', title: '📅 מבקרים בכל יום', preview: (data.by_day || []).slice(-3).reverse().map(d => <><b>{formatDay(d.day)}</b><span>{d.visitors} מבקרים · {d.events} פעולות</span></>), render: () => <>
        <p className="mb-3 text-sm text-slate-600">המספר מעל כל עמודה = מבקרים שונים באותו יום (שעון ישראל). מעבר עם העכבר מראה גם את מספר הפעולות.</p>
        {data.by_day?.length ? <div className="flex items-end gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-4" style={{ minHeight: 120 }}>
          {data.by_day.map(d => <div key={d.day} className="flex flex-col items-center gap-1" title={`${formatDay(d.day)}: ${d.visitors} מבקרים, ${d.events} פעולות`}>
            <b className="text-xs">{d.visitors}</b>
            <div className="w-7 rounded-t-md" style={{ height: `${Math.max(4, Math.round((d.visitors / byDayMax) * 90))}px`, background: SEQUENTIAL[3] }} />
            <span className="text-[10px] text-slate-500">{formatDay(d.day)}</span>
          </div>)}
        </div> : <p className="rounded-xl bg-slate-50 p-4">אין עדיין נתונים לתקופה הזו.</p>}

        </> },
          { id: 'cats', title: '📊 לפי קטגוריה: שיחקו והדפיסו', preview: lastEvents(data, r => ['play', 'use', 'print', 'download'].includes(r.action)), render: () => <>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-black">הכי שיחקו / השתמשו (לפי קטגוריה)</h3>
            {topPlayed.length ? <div className="space-y-2">{topPlayed.map(([key, n], i) => <Bar key={key} value={n} max={topPlayed[0][1]} color={HUES[i % HUES.length]} text={label(key)} />)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתונים.</p>}
          </div>
          <div>
            <h3 className="mb-3 text-lg font-black">הכי הורידו / הדפיסו (לפי קטגוריה)</h3>
            {topDownloaded.length ? <div className="space-y-2">{topDownloaded.map(([key, n], i) => <Bar key={key} value={n} max={topDownloaded[0][1]} color={HUES[i % HUES.length]} text={label(key)} />)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין נתונים.</p>}
          </div>
        </div>

        </> },
          { id: 'devices', title: '💻 מכשירים ומאיפה הגיעו', preview: lastArrivals(data), render: () => <>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-black">מכשירים</h3>
            <div className="space-y-2">{devices.map(([key, n], i) => <Bar key={key} value={n} max={deviceMax} color={HUES[i]} text={DEVICE_LABELS[key] || key} />)}</div>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-black">מאיפה הגיעו</h3>
            <div className="space-y-2">{sources.map(([key, n], i) => <Bar key={key} value={n} max={sourceMax} color={HUES[i % HUES.length]} text={SOURCE_LABELS[key] || key} />)}</div>
          </div>
        </div>

        </> },
          { id: 'visitors', title: '👤 לפי מבקר', badge: data.by_visitor?.length, preview: lastVisitors(data), render: () => <ByVisitor data={data} /> },
          { id: 'recent', title: '🕐 פעולות אחרונות', preview: lastEvents(data, () => true), render: () => <>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead><tr className="border-b-2"><th className="p-2">מבקר</th><th className="p-2">פעילות</th><th className="p-2">מה עשו</th><th className="p-2">עמוד</th><th className="p-2">מכשיר</th><th className="p-2">מקור</th><th className="p-2">מועד</th></tr></thead>
            <tbody>{(data.recent || []).slice(0, 50).map((row, i) => <tr key={i} className="border-b">
              <td className="p-2"><VisitorTag v={row.visitor} /></td>
              <td className="p-2">{label(row.category, row.action)}</td>
              <td className="p-2">{row.action === 'time' ? `⏱️ שהו ${fmtTime(row.seconds)}` : ACTION_LABELS[row.action] || row.action}</td>
              <td className="p-2"><PathLink path={row.path} className="text-slate-600" /></td>
              <td className="p-2 text-slate-600">{DEVICE_LABELS[row.device] || '—'}</td>
              <td className="p-2 text-slate-600">{SOURCE_LABELS[row.source] || '—'}</td>
              <td className="p-2 text-slate-600">{new Date(row.at).toLocaleString('he-IL')}</td>
            </tr>)}</tbody>
          </table>
        </div>
        </> },
        ]} />
      </>}
    </div>
  </div>
}

// Collapsed-section previews: the 3 latest matching events / arrivals / visitors.
function EventLine({ row }) {
  return <><span className="shrink-0 text-slate-500">{fmtClock(row.at)}</span><VisitorTag v={row.visitor} />
    <b>{row.action === 'time' ? `⏱️ שהו ${fmtTime(row.seconds)}` : ACTION_LABELS[row.action] || row.action}</b>
    <span>{pageName(row)}</span></>
}
// ── what visitors created with the personal tools (owner_creations, masked, kept 90 days) ──
const CREATION_ACTIONS = { print: '🖨️ הדפיסו', pdf: '📄 PDF', share: '📤 שיתפו', copy: '📋 העתיקו', create: '✨ יצרו' }
function useCreations(from, to, tick) {
  const [state, setState] = useState({ rows: null, error: null })
  useEffect(() => {
    let live = true
    supabase.from('owner_creations').select('id, created_at, tool, action, path, content, visitor')
      .gte('created_at', from.toISOString()).lt('created_at', to.toISOString()).order('created_at', { ascending: false }).limit(200)
      .then(({ data, error }) => { if (live) setState({ rows: data || [], error: error?.message || null }) })
    return () => { live = false }
  }, [from, to, tick])
  return state
}
function Creations({ rows, error }) {
  const [tool, setTool] = useState('all')
  if (error) return <p className="text-slate-600">עוד אין נתונים: צריך להריץ ב-Supabase את supabase/migrations/202610130001_owner_creations.sql.</p>
  if (!rows) return <p>טוען…</p>
  if (!rows.length) return <p className="text-slate-600">אין עדיין יצירות בתקופה הזו.</p>
  const tools = [...new Set(rows.map(r => r.tool))]
  const shown = tool === 'all' ? rows : rows.filter(r => r.tool === tool)
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">{['all', ...tools].map(t => <button key={t} onClick={() => setTool(t)} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${tool === t ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}>{t === 'all' ? `הכל (${rows.length})` : `${t} (${rows.filter(r => r.tool === t).length})`}</button>)}</div>
    <ul className="space-y-2">{shown.map(r => <li key={r.id} className="rounded-xl border-2 border-slate-100 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm"><b>{r.tool}</b><span>{CREATION_ACTIONS[r.action] || r.action}</span><span className="text-slate-500">{new Date(r.created_at).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>{r.visitor && <VisitorTag v={r.visitor} />}</div>
      <details className="mt-1"><summary className="cursor-pointer text-slate-700">{r.content.split('\n').find(l => l.trim())?.slice(0, 90) || '—'}</summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-sm font-[inherit]" dir="rtl">{r.content}</pre></details>
    </li>)}</ul>
    <p className="text-xs text-slate-500">מספרי טלפון, מיילים ושורות כתובת מוסתרים לפני השמירה. הנתונים נמחקים אחרי 90 יום.</p>
  </div>
}

function lastEvents(data, keep) {
  return (data.recent || []).filter(keep).slice(0, 3).map((row, i) => <EventLine key={i} row={row} />)
}
function lastArrivals(data) {
  const seen = new Set(), out = []
  for (const r of data.recent || []) {
    if (!r.visitor || seen.has(r.visitor)) continue
    seen.add(r.visitor)
    out.push(<><span className="text-slate-500">{fmtClock(r.at)}</span><VisitorTag v={r.visitor} /><span>{DEVICE_LABELS[r.device] || '—'}</span><span>· {SOURCE_LABELS[r.source] || '—'}</span></>)
    if (out.length === 3) break
  }
  return out
}
function lastVisitors(data) {
  return (data.by_visitor || []).slice().sort((a, b) => String(b.last).localeCompare(String(a.last))).slice(0, 3)
    .map(r => <><span className="text-slate-500">{fmtClock(r.last)}</span><VisitorTag v={r.v} /><span><b>{r.events}</b> פעולות · {r.pages} דפים</span><span className="text-slate-600">{SOURCE_LABELS[r.source] || ''}</span></>)
}
function bouncePreview(stats) {
  return stats.filter(r => r.opens >= 5 && r.rate < 0.1 && r.avg != null && r.avg < 20).sort((a, b) => b.opens - a.opens).slice(0, 3)
    .map(r => <><b>{pageName(r)}</b><span>{r.opens} כניסות · {fmtTime(r.avg)}</span></>)
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

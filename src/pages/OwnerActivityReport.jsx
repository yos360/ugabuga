import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SEO from '../components/ui/SEO'
import { ownerSupabase as supabase } from '../utils/ownerAuth'
import { ACTIVITY_LABELS, ACTION_LABELS } from '../utils/liveActivity'
import OwnerPartyLists, { partyPreview, usePartyLists } from '../components/owner/OwnerPartyLists'
import { englishSummary } from '../utils/ownerEnglish'
import { visitorName } from '../utils/visitorNames'
import ReportSections from '../components/owner/ReportSections'
import MailSubscribers from '../components/owner/MailSubscribers'
import SiteChatInbox from '../components/owner/SiteChatInbox'
import BugaPediaQuestions from '../components/owner/BugaPediaQuestions'
import PageRequests from '../components/owner/PageRequests'
import HomeExperiment from '../components/owner/HomeExperiment'
import SocialShares from '../components/owner/SocialShares'
import SponsorClicks from '../components/owner/SponsorClicks'
import SiteSignals from '../components/owner/SiteSignals'
import SoundSettings, { useArrivalSound, useSoundSettings } from '../components/owner/ArrivalSound'
import OwnerTakedown from '../components/owner/OwnerTakedown'
import { EXPIRED_PDF_PATH, isUuidPath } from '../utils/pdfLink'

// Fixed categorical order (never reassigned per-render) — validated for
// colorblind + normal-vision contrast. Devices get slots 1–2, sources 1–6.
const HUES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7', '#008300', '#e34948']
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
function label(category) {
  if (String(category || '').startsWith('sponsor:')) return `📣 באנר: ${category.slice(8)}`
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
      // reading passages (/learn/reading/<slug>) aren't in site search, so name them here
      Promise.all([import('../learn/learnData'), import('../learn/readingGrades')]).then(([a, b]) => [...a.READING, ...b.GRADED_READING]).catch(() => []),
    ]).then(([items, games, reading]) => {
      const map = new Map()
      for (const r of reading) map.set(`/learn/reading/${r.slug}`, `${r.emoji ? r.emoji + ' ' : ''}${r.title}${r.grade ? ` (כיתה ${r.grade})` : ''}`)
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
  if (path === EXPIRED_PDF_PATH || isUuidPath(path)) return '📄 קישור PDF שפג (הורדה שנכשלה)'
  if (pageTitles.has(path)) return pageTitles.get(path)
  const base = ACTIVITY_LABELS[row.category] || row.category || 'עמוד'
  return ['game', 'worksheet', 'tool', 'page'].includes(row.category) && row.path ? `${base} · ${decodeURIComponent(row.path.split('/').filter(Boolean).at(-1) || 'ראשי')}` : base
}

// Page path as a link to the live page (new tab, so the report stays open).
function PathLink({ path, className = 'text-xs text-slate-500' }) {
  if (!path) return '—'
  return <a href={path} target="_blank" rel="noopener noreferrer" dir="ltr" className={`${className} block hover:text-blue-600 hover:underline`}>{path}</a>
}

// Event names are loaded separately from the private owner-only RPC, so every
// activity row for /r/<code> (or the English /en/r/<code>) stays understandable even when the event is older.
const rsvpCode = path => /^(?:\/en)?\/r\/([a-z0-9]+)(?:[/?#]|$)/i.exec(path || '')?.[1] || ''
function useRsvpEventTitles(data) {
  const codes = useMemo(() => [...new Set((data?.recent || []).map(row => rsvpCode(row.path)).filter(Boolean))], [data])
  const key = codes.join(',')
  const [titles, setTitles] = useState({})
  useEffect(() => {
    let live = true
    if (!codes.length) { setTitles({}); return () => { live = false } }
    supabase.rpc('owner_rsvp_event_titles', { p_codes: codes }).then(({ data: rows, error }) => {
      if (live && !error) setTitles(Object.fromEntries((rows || []).map(row => [row.code, row.title])))
    })
    return () => { live = false }
  }, [key]) // codes are fully represented by key
  return titles
}
function activityTargetName(row, rsvpTitles = {}) {
  const title = rsvpTitles[rsvpCode(row.path)]
  return title ? `🎉 ${title}` : pageName(row)
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

function EnglishVisitors({ en }) {
  return <>
    <p className="mb-3 text-sm text-slate-600">כל העמודים באנגלית (כתובות שמתחילות ב־<span dir="ltr">/en</span>). <b>מבקר</b> = דפדפן אחד ביום אחד. <b>נכנסו דרך אנגלית</b> = העמוד הראשון שלהם באתר היה באנגלית.</p>
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatCard value={en.visitors.length} text="מבקרים שראו עמוד באנגלית" tone="bg-sky-50" />
      <StatCard value={en.landed.length} text="נכנסו לאתר דרך עמוד באנגלית" tone="bg-sky-50" />
      <StatCard value={en.opens} text="כניסות לעמודים באנגלית" tone="bg-sky-50" />
      <StatCard value={en.uses} text="שיחקו / השתמשו" tone="bg-sky-50" />
      <StatCard value={en.prints} text="הדפיסו / הורידו" tone="bg-sky-50" />
    </div>
    {en.sources.length > 0 && <p className="mb-3 text-sm"><b>מאיפה הגיעו:</b> {en.sources.map(([source, n]) => `${SOURCE_LABELS[source] || source} ${n}`).join(' · ')}</p>}
    {en.pages.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
      <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">כניסות</th><th className="p-2">שיחקו/השתמשו</th><th className="p-2">הדפיסו/הורידו</th><th className="p-2">זמן ממוצע</th></tr></thead>
      <tbody>{en.pages.map(r => <tr key={r.path} className="border-b">
        <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path} /></td>
        <td className="p-2">{r.opens}</td><td className="p-2">{r.uses || '—'}</td><td className="p-2">{r.prints || '—'}</td>
        <td className="p-2">{r.avg == null ? '—' : fmtTime(r.avg)}</td>
      </tr>)}</tbody>
    </table></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אף אחד לא נכנס לעמודים באנגלית בתקופה הזו.</p>}
  </>
}

// One row per anonymous visitor (a browser on one day — the id rotates every 24h, so it
// names no one): how much they did, where they came from, and their path through the site.
const visitorColor = v => HUES[parseInt(v || '0', 16) % HUES.length]
// How many page entries each visitor code made in the report's period, so a name that shows up
// again in the lists carries its count ("שועל סקרן · פתח 5 עמודים"), and — from the browser's own
// anonymous day counter — which visit to the site this is ("ביקור 3 באתר").
const VisitorInfo = createContext({ entries: new Map(), returns: {} })
function visitorEntries(data) {
  const m = new Map()
  for (const r of data?.by_visitor || []) m.set(r.v, r.opens ?? r.pages ?? 0)
  return m
}
function useVisitorReturns(from, to, tick) {
  const [returns, setReturns] = useState({})
  useEffect(() => {
    let active = true
    supabase.rpc('owner_visitor_returns', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => { if (active && !error && data && typeof data === 'object') setReturns(data) })
    return () => { active = false }
  }, [from, to, tick])
  return returns
}
function VisitorTag({ v }) {
  const { entries, returns } = useContext(VisitorInfo)
  if (!v) return '—'
  const who = visitorName(v), n = entries.get(v), visit = returns[v]
  return <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs" title={`קוד מבקר ${v}`}>
    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: visitorColor(v) }} />
    {who ? <b>{who.emoji} {who.name}</b> : <span className="font-mono" dir="ltr">{v}</span>}
    {n > 1 && <span className="rounded-full bg-violet-100 px-1.5 font-bold text-violet-800">פתח {n} עמודים</span>}
    {visit > 1 && <span className="rounded-full bg-emerald-100 px-1.5 font-bold text-emerald-800">🔁 ביקור {visit} באתר</span>}
  </span>
}
function ByVisitor({ data }) {
  const [showAll, setShowAll] = useState(false)
  if (!data.by_visitor) return <>
    <p className="rounded-xl bg-slate-50 p-4 text-sm">הפירוט לפי מבקר יופיע אחרי עדכון מסד הנתונים.</p>
  </>
  const list = showAll ? data.by_visitor : data.by_visitor.slice(0, 20)
  return <>
    <p className="mb-3 text-sm text-slate-600">כל שורה = דפדפן אחד ביום אחד (מזהה אקראי שמתחלף כל 24 שעות, בלי שם ובלי IP), כך שאותו אדם ביום אחר יופיע כמבקר חדש. לחצו על שורה כדי לראות את המסלול שלו באתר. לכל מבקר יש שם בדוי קבוע (אותו שם מופיע גם ב„פעולות אחרונות”), ולידו כמה עמודים הוא פתח בתקופה. „ביקור N באתר” = בכמה ימים שונים הדפדפן הזה כבר הגיע (מונה אנונימי שהדפדפן שומר אצלו; נספר מ־21.10).</p>
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
  const toggle = e => { const v = e.target.checked; setOn(v); try { if (v) localStorage.setItem('buga-track-self', '1'); else localStorage.removeItem('buga-track-self') } catch { /* ignore */ } }
  return <label className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
    <input type="checkbox" checked={on} onChange={toggle} className="mt-1 h-4 w-4" />
    <span><b>לספור גם את הגלישה שלי (לבדיקה)</b><br /><span className="text-slate-600">כברירת מחדל הדפדפן שלך לא נספר, כדי שהבדיקות שלך לא יעוותו את הנתונים. אם הדפסת בעצמך ולא ראית את זה בדוח, זו הסיבה.</span></span>
  </label>
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

// A tile whose number just changed blinks red for two seconds (not on first load).
// Inline styles, so it also works inside the floating picture-in-picture window.
function useFlash(value) {
  const prev = useRef(value), [on, setOn] = useState(false)
  useEffect(() => {
    if (prev.current === value) return
    prev.current = value
    let ticks = 0
    const step = () => { ticks++; setOn(ticks < 8 && ticks % 2 === 1) }
    const first = setTimeout(step, 0), timer = setInterval(() => { step(); if (ticks >= 8) clearInterval(timer) }, 250)
    return () => { clearTimeout(first); clearInterval(timer); setOn(false) }
  }, [value])
  return on ? { backgroundColor: '#fca5a5', boxShadow: '0 0 0 3px #ef4444', transition: 'background-color .12s, box-shadow .12s' } : { transition: 'background-color .12s, box-shadow .12s' }
}

function MiniStat({ value, short, tone }) {
  return <div className={`rounded-xl px-2 py-1.5 ${tone}`} style={useFlash(value)}><b className="block text-xl leading-tight">{value}</b><span className="text-[11px] leading-tight text-slate-700">{short}</span></div>
}

function StatCard({ value, text, tone }) {
  return <div className={`rounded-2xl p-4 ${tone}`} style={useFlash(value)}>
    <b className="block text-3xl">{value}</b>
    <span className="text-sm text-slate-700">{text}</span>
  </div>
}

// Share clicks per channel for the stat cards (same range as the report).
function useSocial(from, to, tick = 0) {
  const [social, setSocial] = useState(null)
  useEffect(() => {
    let live = true
    supabase.rpc('owner_social_report', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => { if (live) setSocial(error ? null : data) })
    return () => { live = false }
  }, [from.getTime(), to.getTime(), tick]) // eslint-disable-line react-hooks/exhaustive-deps
  return social
}

// RSVP funnel for the headline cards (owner_rsvp_funnel), same range as the report.
function useRsvpFunnel(from, to, tick = 0) {
  const [funnel, setFunnel] = useState(null)
  useEffect(() => {
    let live = true
    supabase.rpc('owner_rsvp_funnel', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => { if (live) setFunnel(error || !data ? null : data) })
    return () => { live = false }
  }, [from.getTime(), to.getTime(), tick]) // eslint-disable-line react-hooks/exhaustive-deps
  return funnel
}

// Clicks on sponsored banners (owner_sponsor_clicks) for the headline cards, same range as the report.
function useSponsorClicks(from, to, tick = 0) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    let live = true
    supabase.rpc('owner_sponsor_clicks', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => { if (live) setRows(error || !Array.isArray(data) ? null : data) })
    return () => { live = false }
  }, [from.getTime(), to.getTime(), tick]) // eslint-disable-line react-hooks/exhaustive-deps
  return rows
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
function statItems(data, multiDay = false, social = null, sponsors = null, rsvp = null) {
  return [
    // The anonymous id changes every midnight, so over several days a returning person is counted
    // once per day they came: that is "visits", not unique people.
    [data.visitors, multiDay ? 'ביקורים (כל מבקר נספר פעם אחת בכל יום)' : 'מבקרים ייחודיים', 'מבקרים', 'bg-pink-50'],
    [data.pageviews, 'צפיות בדפים', 'צפיות', 'bg-cyan-50'],
    [data.time_visitors ? fmtTime((data.time_total || 0) / data.time_visitors) : '—', 'זמן ממוצע למבקר באתר', 'זמן ממוצע', 'bg-emerald-50'],
    [data.by_action?.preview || 0, 'פתחו תצוגת הדפסה', 'תצוגת הדפסה', 'bg-amber-50'],
    [data.by_action?.print || 0, 'לחצו הדפסה (נפתח חלון ההדפסה)', 'הדפסות', 'bg-orange-50'],
    [data.by_action?.download || 0, 'הורידו PDF / קובץ', 'PDF', 'bg-yellow-50'],
    // Sheets: every printed page counts, however many were printed at once (shown once the page-count update is in the database).
    [data.pages_by_action ? (data.pages_by_action.print || 0) + (data.pages_by_action.download || 0) : '—', 'דפים שהודפסו או נשמרו כ־PDF (כל דף נספר, לא רק הלחיצה)', 'דפים', 'bg-orange-100'],
    [data.sources?.qr || 0, 'אנשים שסרקו QR מדף מודפס', 'סרקו QR', 'bg-lime-50'],
    [data.by_action?.share || 0, 'לחיצות על שיתוף (כל הערוצים)', 'שיתופים', 'bg-green-50'],
    // Per channel, from owner_social_report: a click on "share", not a confirmed post.
    [social ? social.clicks?.facebook || 0 : '—', 'לחיצות על שיתוף בפייסבוק', 'שיתוף פייסבוק', 'bg-blue-50'],
    [social ? social.clicks?.whatsapp || 0 : '—', 'לחיצות על שיתוף בוואטסאפ', 'שיתוף וואטסאפ', 'bg-green-50'],
    [data.sources?.facebook || 0, 'אנשים שהגיעו מפייסבוק (כולל מודעות)', 'מפייסבוק', 'bg-blue-50'],
    [data.sources?.whatsapp || 0, 'אנשים שהגיעו מקישור בוואטסאפ', 'מוואטסאפ', 'bg-teal-50'],
    // RSVP: a guest = opened an invitation link without browsing the site before it that day.
    [rsvp ? rsvp.events_created : '—', 'אישורי הגעה (RSVP) שנוצרו', 'RSVP נוצרו', 'bg-rose-50'],
    [rsvp ? rsvp.guests_opened : '—', 'אורחים שפתחו הזמנת RSVP', 'פתחו RSVP', 'bg-rose-50'],
    [rsvp ? rsvp.responses : '—', 'תשובות שהתקבלו ב־RSVP', 'ענו RSVP', 'bg-rose-50'],
    [rsvp ? `${rsvp.to_birthday_famous} / ${rsvp.to_trick_questions}` : '—', 'אורחי RSVP שהמשיכו ל„מי נולד ביום שלכם” / ל„שאלות מכשילות” (באנגלית: יום הולדת / משחק הזיכרון)', 'RSVP → קישורים', 'bg-rose-50'],
    [sponsors ? sponsors.find(r => r.sponsor === 'eureka')?.clicks || 0 : '—', 'לחיצות על הבאנר של אאורקה (חכם על קטנים)', 'באנר אאורקה', 'bg-amber-50'],
    // AliExpress affiliate boxes log their clicks as sponsor 'ali-<topic>'.
    [sponsors ? sponsors.filter(r => String(r.sponsor).startsWith('ali-')).reduce((n, r) => n + (r.clicks || 0), 0) : '—', 'לחיצות על קישורי עלי אקספרס (כל המוצרים)', 'עלי אקספרס', 'bg-orange-50'],
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
      <div className="grid grid-cols-3 gap-1.5">{statItems(data).slice(0, 9).map(([v, , short, tone]) => <MiniStat key={short} value={v} short={short} tone={tone} />)}</div>
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
  const social = useSocial(from, to, tick)
  const sponsorClicks = useSponsorClicks(from, to, tick)
  const rsvpFunnel = useRsvpFunnel(from, to, tick)
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
  const things = useCreatedThings(from, to, tick)
  const rsvpTitles = useRsvpEventTitles(data)
  const pageStats = useMemo(() => buildPageStats(data), [data])
  const english = useMemo(() => englishSummary(data || {}, pageStats), [data, pageStats])
  const topPlayed = useMemo(() => aggregateTop(data?.top, ['play', 'use']), [data])
  const topDownloaded = useMemo(() => aggregateTop(data?.top, ['download', 'print']), [data])
  const pdfByPath = useMemo(() => { const m = new Map(); for (const t of data?.top || []) if (t.action === 'download') m.set(t.path || '', (m.get(t.path || '') || 0) + t.n); return m }, [data])
  const party = usePartyLists()

  const returns = useVisitorReturns(from, to, tick)
  const visitorInfo = useMemo(() => ({ entries: visitorEntries(data), returns }), [data, returns])
  return <VisitorInfo.Provider value={visitorInfo}><div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
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

      <SiteChatInbox />
      <HomeExperiment from={from} to={to} tick={tick} />
      <PageRequests from={from} to={to} tick={tick} />
      <BugaPediaQuestions from={from} to={to} tick={tick} />
      <MailSubscribers />
      {!data ? <p role="status">טוענים את הדוח…</p> : <>
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statItems(data, range === '7' || range === '30', social, sponsorClicks, rsvpFunnel).map(([v, text, , tone]) => <StatCard key={text} value={v} text={text} tone={tone} />)}
        </div>

        <ReportSections sections={[
          { id: 'things', title: '🎉 אירועים ודברים שיצרו (אישורי הגעה, קירות, מבחנים…)', badge: things.rows?.length || null, empty: things.error ? 'צריך להריץ ב-Supabase את supabase/migrations/202610190003_owner_created_things.sql.' : 'לא נוצר כלום בתקופה הזו.',
            preview: (things.rows || []).slice(0, 3).map((r, i) => <span key={i}><b>{THING_KINDS[r.kind]?.split(' ')[0]} {r.title}</b> · {thingSummary(r)}</span>),
            render: () => <CreatedThings rows={things.rows} error={things.error} /> },
          { id: 'creations', title: '✍️ מה יצרו באתר', badge: creations.rows?.length || null, empty: creations.error ? 'הטבלה עוד לא קיימת — צריך להריץ את המיגרציה owner_creations.' : 'אין עדיין יצירות בתקופה הזו.',
            preview: (creations.rows || []).slice(0, 3).map(r => <span key={r.id}><b>{r.tool}</b> · {CREATION_ACTIONS[r.action]} · {r.content.split('\n')[0].slice(0, 60)}</span>),
            render: () => <Creations rows={creations.rows} error={creations.error} /> },
          { id: 'english', title: '🇬🇧 האתר באנגלית', badge: english.visitors.length || null, preview: [<span key="en">{english.visitors.length} מבקרים · {english.landed.length} נכנסו דרך אנגלית · {english.opens} כניסות לעמודים</span>], render: () => <EnglishVisitors en={english} /> },
          { id: 'best', title: '🏆 מה עובד הכי טוב', preview: lastEvents(data, r => r.action === 'open', rsvpTitles), render: () => <BestPages stats={pageStats} /> },
          { id: 'top', title: '🔝 10 הכי: משחקים, הדפסות ושיתופים', preview: lastEvents(data, r => ['play', 'use', 'print', 'download', 'share'].includes(r.action), rsvpTitles), render: () => <>
        <div className="grid gap-8 sm:grid-cols-2">
          <TopItems title="🎮 10 המשחקים והכלים שהכי שיחקו" stats={pageStats} value={r => r.uses} empty="אין עדיין משחקים בתקופה הזו." />
          <TopItems title="🖨️ 10 הדפים שהכי הדפיסו / הורידו" stats={pageStats} value={r => r.prints} empty="אין עדיין הדפסות בתקופה הזו." />
          <TopItems title="📤 10 העמודים שהכי שיתפו בוואטסאפ" stats={pageStats} value={r => r.shares} empty="אין עדיין שיתופים בתקופה הזו." />
        </div>

        </> },
          { id: 'party', title: '🧺 רשימות "מי מביא מה"', badge: party.lists?.length, preview: partyPreview(party.lists), empty: party.lists ? 'אין עדיין רשימות.' : 'טוענים…', render: () => <OwnerPartyLists {...party} /> },
          { id: 'time', title: '⏱️ כמה זמן נשארו בכל עמוד', preview: lastEvents(data, r => r.action === 'time', rsvpTitles), render: () => <>
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
          { id: 'prints', title: '🖨️ מה הדפיסו', preview: lastEvents(data, r => ['preview', 'print', 'download'].includes(r.action), rsvpTitles), render: () => <>
        <p className="mb-3 text-sm text-slate-600">כמה נכנסו לעמוד, כמה פתחו את תצוגת ההדפסה, כמה לחצו „הדפסה” (הדפדפן לא מדווח אם הדף באמת יצא מהמדפסת) וכמה שמרו PDF. מ-7.10.26 PDF נספר בנפרד; לפני כן הוא נספר כהדפסה.</p>
        {data.print_funnel?.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">
          <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">נכנסו</th><th className="p-2">פתחו תצוגה</th><th className="p-2">הדפיסו</th><th className="p-2">דפים</th><th className="p-2">PDF</th></tr></thead>
          <tbody>{data.print_funnel.slice(0, 25).map((r, i) => <tr key={i} className="border-b">
            <td className="p-2"><b>{pageName(r)}</b><PathLink path={r.path || '/'} /></td>
            <td className="p-2">{r.opens}</td><td className="p-2">{r.previews}</td><td className="p-2 font-bold">{r.prints}</td><td className="p-2">{r.print_pages != null ? r.print_pages + (r.pdf_pages || 0) : '—'}</td><td className="p-2">{pdfByPath.get(r.path || '') || '—'}</td>
          </tr>)}</tbody>
        </table></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm">אין עדיין הדפסות בתקופה הזו.</p>}

        </> },
          { id: 'cats', title: '📊 לפי קטגוריה: שיחקו והדפיסו', preview: lastEvents(data, r => ['play', 'use', 'print', 'download'].includes(r.action), rsvpTitles), render: () => <>
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
          { id: 'takedown', title: '🗑️ הסרת תוכן שדווח', preview: [<span key="t">מדביקים קישור לתוכן של גולשים ומוחקים אותו</span>], render: () => <OwnerTakedown /> },
          { id: 'social', title: '📣 שיתופים ותנועה חברתית', preview: [<span key="s">לחיצות על שיתוף בפייסבוק ובוואטסאפ, וכניסות שהגיעו משם</span>], render: () => <SocialShares tick={tick} pageName={pageName} /> },
          { id: 'sponsors', title: '📣 לחיצות על באנרים', preview: [<span key="b">כמה לחצו על באנר הפרסומת (למשל אאורקה) בתקופה שנבחרה</span>], render: () => <SponsorClicks from={from} to={to} tick={tick} pageName={pageName} /> },
          { id: 'signals', title: '🧭 גלילה, חיפוש, 404 ו"האם זה עזר?"', preview: [<span key="g">עד כמה גוללים, מה מחפשים ולא מוצאים, לאן ממשיכים, שגיאות ו־👍👎 לכל עמוד</span>], render: () => <SiteSignals from={from} to={to} tick={tick} pageName={pageName} /> },
          { id: 'visitors', title: '👤 לפי מבקר', badge: data.by_visitor?.length, preview: lastVisitors(data), render: () => <ByVisitor data={data} /> },
          { id: 'recent', title: '🕐 פעולות אחרונות', preview: lastEvents(data, () => true, rsvpTitles), render: () => <>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead><tr className="border-b-2"><th className="p-2">מבקר</th><th className="p-2">פעילות</th><th className="p-2">מה עשו</th><th className="p-2">עמוד</th><th className="p-2">מכשיר</th><th className="p-2">מקור</th><th className="p-2">מועד</th></tr></thead>
            <tbody>{(data.recent || []).slice(0, 50).map((row, i) => <tr key={i} className="border-b">
              <td className="p-2"><VisitorTag v={row.visitor} /></td>
              <td className="p-2">{label(row.category, row.action)}</td>
              <td className="p-2">{row.action === 'time' ? `⏱️ שהו ${fmtTime(row.seconds)}` : ACTION_LABELS[row.action] || row.action}{row.pages > 1 && ` · ${row.pages} דפים`}</td>
              <td className="p-2"><b>{activityTargetName(row, rsvpTitles)}</b><PathLink path={row.path} className="text-slate-600" /></td>
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
  </div></VisitorInfo.Provider>
}

// Collapsed-section previews: the 3 latest matching events / arrivals / visitors.
function EventLine({ row, rsvpTitles }) {
  return <><span className="shrink-0 text-slate-500">{fmtClock(row.at)}</span><VisitorTag v={row.visitor} />
    <b>{row.action === 'time' ? `⏱️ שהו ${fmtTime(row.seconds)}` : ACTION_LABELS[row.action] || row.action}{row.pages > 1 && ` · ${row.pages} דפים`}</b>
    <span>{activityTargetName(row, rsvpTitles)}</span></>
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

// ── events and group tools visitors set up (RSVP, walls, draws, quizzes, homework): counts only ──
const THING_KINDS = { rsvp: '✅ אישור הגעה', wall: '💌 קיר ברכות', secret: '🧙 גמד וענק', quiz: '📝 מבחן אונליין', live: '⚡ בוגה לייב', homework: '📚 שיעורי בית' }
function useCreatedThings(from, to, tick) {
  const [state, setState] = useState({ rows: null, error: null })
  useEffect(() => {
    let live = true
    supabase.rpc('owner_created_things', { p_from: from.toISOString(), p_to: to.toISOString() })
      .then(({ data, error }) => { if (live) setState({ rows: data || [], error: error?.message || null }) })
    return () => { live = false }
  }, [from, to, tick])
  return state
}
function thingSummary(r) {
  const opens = r.opens != null ? `${r.opens} פתיחות` : ''
  const parts = {
    rsvp: [`✅ ${r.yes} מגיעים${r.people ? ` (${r.people} אנשים)` : ''}`, `🤔 ${r.maybe} אולי`, `😢 ${r.no} לא`],
    wall: [`💌 ${r.answers} ברכות`],
    secret: [`👥 ${r.people} משתתפים`, `🔓 ${r.answers} פתחו את הקישור שלהם`],
    quiz: [`✍️ ${r.answers} הגישו`, r.avg != null ? `ממוצע ${r.avg}%` : ''],
    live: [`🎮 ${r.answers} שחקנים`],
    homework: [`👧 ${r.people} תלמידים`, `✅ ${r.answers} משימות הוגשו`],
  }[r.kind] || []
  return [opens, ...parts].filter(Boolean).join(' · ')
}
function CreatedThings({ rows, error }) {
  const [kind, setKind] = useState('all')
  if (error) return <p className="text-slate-600">עוד אין נתונים: צריך להריץ ב-Supabase את supabase/migrations/202610190003_owner_created_things.sql.</p>
  if (!rows) return <p>טוען…</p>
  if (!rows.length) return <p className="text-slate-600">לא נוצר כלום בתקופה הזו.</p>
  const kinds = [...new Set(rows.map(r => r.kind))]
  const shown = kind === 'all' ? rows : rows.filter(r => r.kind === kind)
  const day = d => d ? new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : ''
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">{['all', ...kinds].map(k => <button key={k} onClick={() => setKind(k)} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${kind === k ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}>{k === 'all' ? `הכל (${rows.length})` : `${THING_KINDS[k] || k} (${rows.filter(r => r.kind === k).length})`}</button>)}</div>
    <ul className="space-y-2">{shown.map((r, i) => <li key={i} className="rounded-xl border-2 border-slate-100 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><b className="text-lg">{r.title}</b><span className="text-sm text-slate-500">{THING_KINDS[r.kind]} · נוצר {day(r.created)}{r.date ? ` · האירוע ב־${day(r.date)}` : ''}</span></div>
      <p className="mt-1">{thingSummary(r) || 'עוד אין תגובות'}</p>
    </li>)}</ul>
    <p className="text-xs text-slate-500">רק מספרים: שמות האורחים, התשובות והפרטים האישיים לא מוצגים כאן. „פתיחות” = כניסות לקישור (כולל של המארגן).</p>
  </div>
}

function lastEvents(data, keep, rsvpTitles = {}) {
  return (data.recent || []).filter(keep).slice(0, 3).map((row, i) => <EventLine key={i} row={row} rsvpTitles={rsvpTitles} />)
}
function lastVisitors(data) {
  return (data.by_visitor || []).slice().sort((a, b) => String(b.last).localeCompare(String(a.last))).slice(0, 3)
    .map(r => <><span className="text-slate-500">{fmtClock(r.last)}</span><VisitorTag v={r.v} /><span><b>{r.events}</b> פעולות · {r.pages} דפים</span><span className="text-slate-600">{SOURCE_LABELS[r.source] || ''}</span></>)
}

function aggregateTop(top, actions) {
  if (!top) return []
  const byCategory = {}
  for (const row of top) if (actions.includes(row.action)) byCategory[row.category] = (byCategory[row.category] || 0) + row.n
  return Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 8)
}
function compareBadge(current, previous) {
  if (current == null || previous == null) return null
  if (previous === 0) return current > 0 ? <span className="text-emerald-700">▲ חדש</span> : null
  // Small numbers (early morning, a quiet day): a percentage is noise — "−100%" for 2 → 0 looked like a
  // breakdown. Show the plain difference in grey until there are enough visits to compare.
  if (Math.max(current, previous) < 20) {
    const diff = current - previous
    return <span className="text-slate-500">{diff === 0 ? 'ללא שינוי' : diff > 0 ? `+${diff}` : `−${-diff}`}</span>
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return <span className="text-slate-500">ללא שינוי</span>
  return pct > 0 ? <span className="text-emerald-700">▲ {pct}%</span> : <span className="text-red-600">▼ {Math.abs(pct)}%</span>
}

import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './recent-activity.css'
const FlipCounter = lazy(() => import('../ui/FlipCounter'))

// liveActivity pulls the Supabase SDK; load it lazily so no page pays for it
// up front (and never during prerender snapshots, which would bake a
// modulepreload for the chunk into every page's HTML).
let activityModule = null
const loadActivity = () => {
  if (typeof window !== 'undefined' && window.__PRERENDER__) return Promise.resolve(null)
  return (activityModule ||= import('../../utils/liveActivity'))
}

export function recordPreviewOpen() { void loadActivity().then(m => m?.logEvent('preview')).catch(() => {}) }
// action: 'print' (the print dialog was opened), 'download' (a PDF was saved), 'refresh' (new exercises).
// pages: how many A4 sheets were printed or saved (copies included), when known.
export function recordSheetAction(action = 'print', pathname = window.location.pathname, pages = null) {
  void loadActivity().then(m => {
    if (!m) return
    m.recordActivity(action, m.activityForPath(pathname))
    m.logEvent(action, pathname, pages)
    if (action === 'download') m.recordSuccessfulPdf(pathname)
  }).catch(() => {})
}
// Site signals (see utils/liveActivity.js): no visitor id, best-effort.
export function recordNotFound(pathname = window.location.pathname) { void loadActivity().then(m => m?.logSignal('notfound', pathname)).catch(() => {}) }
// A visitor landed on ugabuga.co.il/<uuid> (a PDF blob link that lost its prefix). Stored as a 'nav' signal
// from /expired-pdf-link to the page the PDF was made on — a clean path only, no title — with
// value 'got' (the file was still in this browser and was given back) or 'lost'.
export function recordExpiredPdf(sourcePath, outcome) { void loadActivity().then(m => m?.logSignal('nav', '/expired-pdf-link', { target: sourcePath || '/', value: outcome === 'got' ? 'got' : 'lost' })).catch(() => {}) }
export function recordPageError(error) { void loadActivity().then(m => m?.logSignal('jserror', window.location.pathname, { value: m.errorClass(error) || 'other' })).catch(() => {}) }
export function recordSearchResult(count, term) { void loadActivity().then(m => m?.recordSearch(count, term)).catch(() => {}) }
export function recordHelpful(vote, pathname = window.location.pathname) { void loadActivity().then(m => m?.logSignal('helpful', pathname, { value: vote, click: true })).catch(() => {}) }
export const recordPrintPreview = () => recordSheetAction('print')

// Closing the banner hides it for a month on this browser.
const CLOSED_KEY = 'buga-live-closed'
const closedRecently = () => { try { return Date.now() - Number(localStorage.getItem(CLOSED_KEY) || 0) < 30 * 864e5 } catch { return false } }

// Banner number: real different visitors since midnight (public_today_visitors), checked every
// minute. New visitors are added one at a time a few seconds apart, so the counter moves without
// jumping. null until the number arrives (or when it can't be read): the count is then hidden.
function useTodayVisitors() {
  const [real, setReal] = useState(null)
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return undefined
    let live = true
    const update = () => import('../../utils/printCounts').then(m => m.loadTodayVisitors()).then(n => { if (live && n) setReal(n) }).catch(() => {})
    update()
    const timer = setInterval(update, 60000)
    return () => { live = false; clearInterval(timer) }
  }, [])
  useEffect(() => {
    if (real == null) return undefined
    if (shown == null || real < shown) { setShown(real); return undefined }
    if (real === shown) return undefined
    const t = setTimeout(() => setShown(s => Math.min(real, s + 1)), 2500 + Math.random() * 4000)
    return () => clearTimeout(t)
  }, [real, shown])
  return shown
}

export default function RecentActivity() {
  const { pathname } = useLocation()
  const [mod, setMod] = useState(null)
  const [state, setState] = useState({ count: null, events: [] })
  const [hidden, setHidden] = useState(closedRecently)
  const shown = useTodayVisitors()
  // Latest real prints, shown one after another so the banner always has a print going on.
  const [prints, setPrints] = useState([])
  const [printAt, setPrintAt] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined' || window.__PRERENDER__) return
    let live = true
    const update = () => import('../../utils/printCounts').then(m => m.loadTodayPrints()).then(d => { if (live) setPrints(d.recent) }).catch(() => {})
    update()
    const refresh = setInterval(update, 60000)
    const rotate = setInterval(() => setPrintAt(i => i + 1), 5000 + Math.random() * 3000)
    return () => { live = false; clearInterval(refresh); clearInterval(rotate) }
  }, [])
  const close = () => { setHidden(true); try { localStorage.setItem(CLOSED_KEY, String(Date.now())) } catch { /* ignore */ } }
  useEffect(() => {
    let stopped = false, disconnect = null
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => {
      void loadActivity().then(m => {
        if (!m || stopped) return
        setMod(() => m)
        disconnect = m.connectActivity(next => {
          setState(next)
          // Shared with TrafficProof (suppliers pages) so they don't open a second live connection.
          window.__bugaLiveCount = next.count
          try { window.dispatchEvent(new CustomEvent('buga:live-count', { detail: { count: next.count } })) } catch { /* old browser */ }
          try { window.dispatchEvent(new CustomEvent('buga:live-activity', { detail: { count: next.count, events: next.events.filter(event => !event.own) } })) } catch { /* old browser */ }
        })
      }).catch(() => {})
    })
    return () => { stopped = true; cancelIdle(handle); if (disconnect) disconnect() }
  }, [])
  // Arrived from a printed QR: count which rotating message brought this visitor.
  useEffect(() => { void import('../../utils/qrVariants').then(m => m.noteQrScan()).catch(() => {}) }, [])
  useEffect(() => {
    // Every page view goes to the private owner log; the public live banner
    // still only shows the curated activity categories.
    let timer = null, stopScroll = null, gone = false
    void loadActivity().then(m => {
      if (!m || gone) return
      m.logEvent('open', pathname)
      m.trackTime(pathname)
      stopScroll = m.watchScroll(pathname)
      timer = setTimeout(() => m.recordActivity('open', m.activityForPath(pathname)), 1800)
    }).catch(() => {})
    return () => { gone = true; clearTimeout(timer); if (stopScroll) stopScroll() }
  }, [pathname])
  if (hidden || !mod || !state.count) return null
  const { ACTIVITY_LABELS, ACTION_LABELS } = mod
  // Anonymous: what was opened, never who — and not your own actions.
  const others = state.events.filter(e => !e.own)
  const printLabels = prints.map(p => ACTIVITY_LABELS[mod.activityForPath(p)]).filter(Boolean)
  const printNow = printLabels.length ? printLabels[printAt % printLabels.length] : null
  return <aside className="buga-live no-print" aria-label="פעילות חיה בעוגה בוגה" dir="rtl">
    {shown > 0 && <span className="buga-live-count">
      <span className="buga-live-dot" aria-hidden="true" />
      <Suspense fallback={<b>{shown}</b>}><FlipCounter value={shown} /></Suspense>
      <span className="buga-live-label">מבקרים באתר היום</span>
    </span>}
    {(printNow || others.length > 0) && <div className="buga-live-events" aria-label="מה פתחו עכשיו באתר">{printNow && <span className="buga-live-event buga-live-print" key={'p' + printAt}>🖨️ הדפיסו: {printNow}</span>}{others.map(event=><span className="buga-live-event" key={event.key}>{event.action==='print'?'🖨️ הדפיסו':event.action==='open'?'✨ פתחו':`✨ ${ACTION_LABELS[event.action]}`}: {ACTIVITY_LABELS[event.category]}</span>)}</div>}
    <button className="buga-live-close" onClick={close} aria-label="הסתרת באנר הפעילות">×</button>
  </aside>
}

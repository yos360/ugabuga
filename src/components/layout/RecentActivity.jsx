// Activity logging used across the site. The live banner itself is in RecentActivityWidget.jsx,
// loaded on demand so it stays out of the main bundle.

// liveActivity pulls the Supabase SDK; load it lazily so no page pays for it
// up front (and never during prerender snapshots, which would bake a
// modulepreload for the chunk into every page's HTML).
let activityModule = null
export const loadActivity = () => {
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

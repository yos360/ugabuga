// Print events shared by every way the site prints: PrintPreview (print button and PDF) and plain
// window.print() pages (seen through `afterprint`). Nothing here touches the print itself — callers
// announce it after the browser has been asked to print.
//
// Google Analytics (already on the site) gets: print_started, print_recommendation_shown,
// print_recommendation_clicked, print_recommendation_dismissed.
export const PRINT_DONE_EVENT = 'buga:print-done'

export function trackPrintEvent(name, params = {}) {
  try { if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', name, { page_path: window.location.pathname, ...params }) } catch { /* analytics never breaks printing */ }
}

// method: 'print' | 'pdf'. Fired once the print dialog was opened or the PDF was saved.
export function announcePrint(method, { path = typeof window !== 'undefined' ? window.location.pathname : '/', title = '' } = {}) {
  trackPrintEvent('print_started', { method })
  if (typeof window === 'undefined') return
  // Let the print dialog / download finish drawing first; the suggestion never competes with it.
  setTimeout(() => window.dispatchEvent(new CustomEvent(PRINT_DONE_EVENT, { detail: { method, path, title, search: window.location.search } })), method === 'pdf' ? 500 : 900)
}

// When the "what else to print" sheet may appear: once dismissed it stays away for the rest of the
// visit; otherwise at most once per page and three times per visit.
const OFFER_KEY = 'buga-print-suggest'
export const MAX_OFFERS_PER_SESSION = 3
export const readOfferMemory = () => { try { return JSON.parse(sessionStorage.getItem(OFFER_KEY) || '{}') } catch { return {} } }
export const writeOfferMemory = value => { try { sessionStorage.setItem(OFFER_KEY, JSON.stringify(value)) } catch { /* ignore */ } }
export function mayOffer(path, memory = readOfferMemory()) {
  return !memory.dismissed && !(memory.paths || []).includes(path) && (memory.count || 0) < MAX_OFFERS_PER_SESSION
}

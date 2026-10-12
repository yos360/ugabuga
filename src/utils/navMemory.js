// Remembers where the visitor was, so "back" returns to the same spot instead of the top of the page.
// - scroll position per history entry (location.key), kept in sessionStorage so it survives a reload;
// - the page the visitor came from, so a breadcrumb pointing to it can step back in history
//   (keeping that page's filters and scroll) instead of opening it fresh.
const STORE = 'buga-scroll'
let positions = {}
try { positions = JSON.parse(sessionStorage.getItem(STORE) || '{}') || {} } catch { positions = {} }

export function saveScroll(key, y) {
  if (!key) return
  positions[key] = Math.round(y)
  const keys = Object.keys(positions)
  if (keys.length > 60) delete positions[keys[0]]
  try { sessionStorage.setItem(STORE, JSON.stringify(positions)) } catch { /* private mode */ }
}
export const savedScroll = key => positions[key]

let previous = null, cameByPush = false
export function rememberNavigation(prevLocation, type) { previous = prevLocation; cameByPush = type === 'PUSH' }
// True when `href` is the page we just came from by a normal link click (so history.back() lands on it).
export function isPreviousPage(href) {
  if (!cameByPush || !previous || !href) return false
  const path = p => (p.replace(/\/+$/, '') || '/')
  return path(href.split(/[?#]/)[0]) === path(previous.pathname)
}

// "המועדפים שלי": pages a visitor saved with the ❤️ button (in Breadcrumbs, so almost every page has one).
// Kept only in this browser (localStorage); every access is guarded, since storage can be blocked.
// The games hub keeps its own list of favourite games (GamesIndex, 'ugabuga:favorites').
const KEY = 'ugabuga:saved-pages'
const EVENT = 'ugabuga:saved-pages'
const MAX = 200

export function savedPages() {
  try { const list = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(list) ? list.filter(x => x && typeof x.path === 'string') : [] } catch { return [] }
}
const write = list => {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))) } catch { /* storage blocked */ }
  try { window.dispatchEvent(new Event(EVENT)) } catch { /* no window */ }
}
export const isSaved = path => savedPages().some(x => x.path === path)
// Adds the page (newest first) or removes it; returns whether it is saved now.
export function toggleSaved({ path, title }) {
  const list = savedPages()
  if (list.some(x => x.path === path)) { write(list.filter(x => x.path !== path)); return false }
  write([{ path, title: String(title || path).slice(0, 120), at: Date.now() }, ...list])
  return true
}
// Visiting a saved page refreshes its stored title (older saves kept only the last breadcrumb).
export function retitleSaved(path, title) {
  const list = savedPages(), clean = String(title || '').slice(0, 120)
  if (clean && list.some(x => x.path === path && x.title !== clean)) write(list.map(x => x.path === path ? { ...x, title: clean } : x))
}
export const removeSaved = path => write(savedPages().filter(x => x.path !== path))
export function onSavedChange(fn) {
  const handler = () => fn(savedPages())
  window.addEventListener(EVENT, handler)
  window.addEventListener('storage', handler)
  return () => { window.removeEventListener(EVENT, handler); window.removeEventListener('storage', handler) }
}

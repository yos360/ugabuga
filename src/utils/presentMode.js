// Classroom projection ("📺 הקרנה"): one site-wide switch that hides the site chrome (menu, footer,
// floating buttons, breadcrumbs, long SEO text), enlarges the page and goes full screen. While it is
// on, pages can also offer teacher controls (answers revealed one at a time) via usePresentMode().
// A link with ?present=1 opens straight in projection, so a teacher can save it.
import { useSyncExternalStore } from 'react'

const ZOOM_KEY = 'buga-present-zoom'
export const ZOOMS = [1, 1.15, 1.3, 1.5, 1.75, 2]
const subs = new Set()
let state = { on: false, zoom: 1.3 }
try { const z = Number(localStorage.getItem(ZOOM_KEY)); if (ZOOMS.includes(z)) state = { ...state, zoom: z } } catch { /* ignore */ }

const emit = () => { for (const fn of subs) fn() }
function set(patch) {
  state = { ...state, ...patch }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('present-mode', state.on)
    document.documentElement.style.setProperty('--present-zoom', String(state.zoom))
  }
  emit()
}

export function enterPresent() {
  if (state.on) return
  set({ on: true })
  try { if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => {}) } catch { /* ignore */ }
  window.scrollTo(0, 0)
}
export function exitPresent() {
  if (!state.on) return
  set({ on: false })
  try { if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {}) } catch { /* ignore */ }
  // drop ?present=1 so a refresh doesn't jump back in
  try {
    const u = new URL(location.href)
    if (u.searchParams.has('present')) { u.searchParams.delete('present'); history.replaceState(history.state, '', u.pathname + u.search + u.hash) }
  } catch { /* ignore */ }
}
export function stepZoom(dir) {
  const i = ZOOMS.indexOf(state.zoom)
  const zoom = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? 2 : i) + dir))]
  try { localStorage.setItem(ZOOM_KEY, String(zoom)) } catch { /* ignore */ }
  set({ zoom })
}

const subscribe = fn => { subs.add(fn); return () => subs.delete(fn) }
const SERVER = { on: false, zoom: 1.3 }
export const usePresentMode = () => useSyncExternalStore(subscribe, () => state, () => SERVER)

// Where the 📺 button is offered: learning, tools, printables, stories, classroom pages.
// Not the home page, the owner area, embeds, the kids' corner, or arcade games (they have their own full screen).
const PREFIXES = ['/learn', '/math', '/letters', '/words', '/english', '/abc', '/languages', '/discover', '/flags', '/animals',
  '/logic-puzzles', '/classroom', '/trivia', '/sudoku', '/chess', '/tools', '/printables', '/stories', '/riddles', '/music', '/typing', '/holidays', '/games']
export function presentAllowed(pathname) {
  const p = String(pathname || '').toLowerCase()
  return PREFIXES.some(x => p === x || p.startsWith(x + '/'))
}

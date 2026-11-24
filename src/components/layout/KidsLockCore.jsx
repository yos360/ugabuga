import { Suspense, lazy, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'

// Parents' soft lock for the kids zone. With the lock on, any page outside the kids' activities shows
// a "locked" screen until the 4-digit code is typed. It lives only in this browser and is a
// convenience, not security: clearing the browser's site data removes it.
const KEY = 'buga-kids-lock'
export const ALLOWED = /^\/(kids|online-games|stories|letters\/game|abc\/game|math\/grade-1|music\/piano|printables\/color-by-number)(\/|$)/
const listeners = new Set()
export const hash = s => { let h = 5381; for (const c of `buga:${s}`) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h.toString(36) }
export const read = () => { try { return localStorage.getItem(KEY) || '' } catch { return '' } }
export const write = v => { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY) } catch { /* private mode */ } listeners.forEach(l => l()) }
const subscribe = l => { listeners.add(l); return () => listeners.delete(l) }
export const useKidsLock = () => useSyncExternalStore(subscribe, read, () => '')
export const lockKids = pin => write(hash(pin))
export const unlockKids = pin => { if (hash(pin) !== read()) return false; write(''); return true }

// The locked screen and the PIN form load only when the lock is on (kept out of the main bundle).
const LockedScreen = lazy(() => import('./KidsLock').then(m => ({ default: m.KidsLockedScreen })))

export function KidsLockGate({ children }) {
  const lock = useKidsLock()
  const { pathname } = useLocation()
  if (!lock || ALLOWED.test(pathname)) return children
  return <Suspense fallback={null}><LockedScreen /></Suspense>
}

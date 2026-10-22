import { useState, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'

// Parents' soft lock for the kids zone. With the lock on, any page outside the kids' activities shows
// a "locked" screen until the 4-digit code is typed. It lives only in this browser and is a
// convenience, not security: clearing the browser's site data removes it.
const KEY = 'buga-kids-lock'
const ALLOWED = /^\/(kids|online-games|stories|letters\/game|abc\/game|math\/grade-1|music\/piano|printables\/color-by-number)(\/|$)/
const listeners = new Set()
const hash = s => { let h = 5381; for (const c of `buga:${s}`) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h.toString(36) }
const read = () => { try { return localStorage.getItem(KEY) || '' } catch { return '' } }
const write = v => { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY) } catch { /* private mode */ } listeners.forEach(l => l()) }
const subscribe = l => { listeners.add(l); return () => listeners.delete(l) }
export const useKidsLock = () => useSyncExternalStore(subscribe, read, () => '')
export const lockKids = pin => write(hash(pin))
export const unlockKids = pin => { if (hash(pin) !== read()) return false; write(''); return true }

function PinInput({ onDone, label }) {
  const [pin, setPin] = useState('')
  return <form className="flex items-center justify-center gap-2" onSubmit={e => { e.preventDefault(); if (/^\d{4}$/.test(pin)) { onDone(pin); setPin('') } }}>
    <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" autoComplete="off" aria-label="קוד של 4 ספרות" placeholder="••••" className="w-28 rounded-xl border-2 border-slate-300 px-3 py-2 text-center text-2xl tracking-[.4em]" />
    <button type="submit" disabled={pin.length !== 4} className="min-h-12 rounded-xl bg-violet-700 px-4 font-bold text-white disabled:opacity-50">{label}</button>
  </form>
}

// Shown by Layout instead of the page whenever the lock is on and the page is outside the kids' area.
export function KidsLockGate({ children }) {
  const lock = useKidsLock()
  const { pathname } = useLocation()
  const [wrong, setWrong] = useState(false)
  if (!lock || ALLOWED.test(pathname)) return children
  return <div className="mx-auto max-w-md px-4 py-16 text-center" dir="rtl">
    <div className="text-7xl" aria-hidden="true">🔒</div>
    <h1 className="mt-2 text-3xl font-black">האזור הזה נעול</h1>
    <p className="mt-2 text-lg">ההורים נעלו את האתר לאזור הילדים.</p>
    <Link to="/kids" className="mt-5 inline-block rounded-2xl bg-amber-400 px-6 py-3 text-xl font-black">🧸 חזרה לאזור הילדים</Link>
    <div className="mt-8 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <p className="mb-2 font-bold">הורים? הקלידו את הקוד כדי לפתוח</p>
      <PinInput label="פתיחה" onDone={pin => setWrong(!unlockKids(pin))} />
      {wrong && <p role="alert" className="mt-2 font-bold text-red-700">הקוד לא נכון</p>}
    </div>
  </div>
}

// The parents' control on /kids.
export function KidsLockControl() {
  const lock = useKidsLock()
  const [setting, setSetting] = useState(false)
  const [wrong, setWrong] = useState(false)
  if (lock) return <div className="mt-3">
    <p className="font-bold">🔒 האתר נעול לאזור הילדים. כדי לשחרר, הקלידו את הקוד:</p>
    <PinInput label="שחרור" onDone={pin => setWrong(!unlockKids(pin))} />
    {wrong && <p role="alert" className="mt-1 font-bold text-red-700">הקוד לא נכון</p>}
  </div>
  return <div className="mt-3">
    {!setting ? <button type="button" onClick={() => setSetting(true)} className="min-h-12 rounded-xl border-2 border-violet-600 bg-white px-4 font-bold text-violet-800">🔒 נעילה לאזור הילדים</button> : <>
      <p className="mb-1">בחרו קוד של 4 ספרות. כל עוד הנעילה פועלת, אפשר לגלוש רק באזור הילדים ובמשחקים שלו.</p>
      <PinInput label="נעילה" onDone={pin => { lockKids(pin); setSetting(false) }} />
      <p className="mt-1 text-sm text-slate-600">הנעילה נשמרת רק בדפדפן הזה. היא נועדה לעזור, לא להחליף השגחה: ניקוי נתוני האתר בדפדפן מבטל אותה.</p>
    </>}
  </div>
}

// Small building blocks shared by the English tool pages (inputs, buttons, result boxes).
export const inputClass = 'mt-1 w-full min-w-0 rounded-xl border-2 border-[var(--border)] bg-white text-[#182139] px-3 py-2 min-h-[44px]'
export const buttonClass = 'min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-2 font-bold disabled:opacity-40'
export const bigButtonClass = 'min-h-[56px] rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] px-6 py-3 text-xl font-black disabled:opacity-40'

export function Field({ label, className = '', ...props }) {
  return <label className={`block min-w-0 font-bold ${className}`}>{label}<input className={inputClass} {...props} /></label>
}

export function Select({ label, options, className = '', ...props }) {
  return <label className={`block min-w-0 font-bold ${className}`}>{label}<select className={inputClass} {...props}>{options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>)}</select></label>
}

export function Panel({ children, className = '', label }) {
  return <section aria-label={label} className={`space-y-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 ${className}`}>{children}</section>
}

// A highlighted answer box. `error` shows a plain message instead.
export function Result({ children, error }) {
  if (error) return <p aria-live="polite" role="status" className="rounded-xl border-2 border-dashed border-[var(--border)] p-3">{error}</p>
  return <div aria-live="polite" className="rounded-xl bg-[var(--postit)] p-4 text-xl font-bold">{children}</div>
}

// Runs a calculation that may throw (the shared helpers throw Hebrew messages); shows `fallback` in English instead.
export function attempt(fn, fallback = 'Check the numbers and try again.') {
  try { return { value: fn(), error: null } } catch { return { value: null, error: fallback } }
}

export const fmt = (n, digits = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(Object.is(n, -0) ? 0 : n)

export const randomInt = (min, max) => {
  const span = max - min + 1
  if (globalThis.crypto?.getRandomValues && span > 0 && span <= 2 ** 32) {
    const limit = Math.floor(2 ** 32 / span) * span, a = new Uint32Array(1)
    do { crypto.getRandomValues(a) } while (a[0] >= limit)
    return min + (a[0] % span)
  }
  return min + Math.floor(Math.random() * span)
}
export const pick = list => list[randomInt(0, list.length - 1)]

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}

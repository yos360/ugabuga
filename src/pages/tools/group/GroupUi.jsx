import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { groupErrorText } from '../../../utils/groupDb'

// Shared bits for the WhatsApp group tools (RSVP, secret-friend draw, thank-you wall).
export const card = 'wobbly border-2 border-[var(--border)] bg-white p-4 sketch-shadow sm:p-5'
export const input = 'mt-1 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-[17px] focus:border-slate-800 focus:outline-none'
export const btn = 'inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold disabled:opacity-50'
export const btnMain = 'inline-flex min-h-[52px] items-center justify-center gap-1 rounded-xl bg-slate-900 px-5 py-3 text-lg font-bold text-white disabled:opacity-50'
export const btnWa = 'inline-flex min-h-[52px] items-center justify-center gap-1 rounded-xl bg-[#25D366] px-5 py-3 text-lg font-bold text-white disabled:opacity-50'

export function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const show = useCallback((text, tone = 'ok') => {
    clearTimeout(timer.current); setToast({ text, tone })
    timer.current = setTimeout(() => setToast(null), 3200)
  }, [])
  const node = toast && createPortal(<div role="status" aria-live="polite" className={`fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl px-4 py-3 text-center font-bold text-white shadow-lg ${toast.tone === 'err' ? 'bg-rose-600' : 'bg-slate-900'}`}>{toast.text}</div>, document.body)
  return [node, show]
}

export async function copyText(text, show, okText = 'הועתק ✓') {
  try { await navigator.clipboard.writeText(text); show(okText) } catch { show(text) }
}
export const openWhatsApp = text => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')

export function ConfirmDialog({ title, text, yes, onYes, onClose, danger = true }) {
  return createPortal(<div className="fixed inset-0 z-50 grid items-end bg-black/40 sm:items-center" onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl" role="alertdialog" aria-modal="true" aria-labelledby="gt-confirm-title">
      <h2 id="gt-confirm-title" className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-slate-600">{text}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onYes} className={`min-h-[52px] flex-1 rounded-2xl text-lg font-bold text-white ${danger ? 'bg-rose-600' : 'bg-slate-900'}`}>{yes}</button>
        <button onClick={onClose} className="min-h-[52px] rounded-2xl border-2 border-slate-300 px-4 font-bold">ביטול</button>
      </div>
    </div>
  </div>, document.body)
}

// Friendly full-width message (missing page, tool not installed yet, network trouble).
export function ErrorPanel({ code, home, homeLabel }) {
  return <div className="mx-auto max-w-lg py-10 text-center">
    <p className="text-5xl" aria-hidden="true">{code === 'not_installed' ? '🛠️' : '🔍'}</p>
    <p className="mt-3 text-xl font-bold">{groupErrorText(code)}</p>
    {home && <Link to={home} className={`${btn} mt-6`}>{homeLabel}</Link>}
  </div>
}

export function Stepper({ label, value, onChange, min = 0, max = 20 }) {
  const set = v => onChange(Math.max(min, Math.min(max, v)))
  return <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5">
    <span className="font-bold">{label}</span>
    <span className="flex items-center gap-1">
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`פחות ${label}`} className="grid h-11 w-11 place-items-center rounded-full border-2 border-slate-300 text-2xl font-bold disabled:opacity-30">−</button>
      <output className="w-8 text-center text-xl font-black" aria-live="polite">{value}</output>
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`עוד ${label}`} className="grid h-11 w-11 place-items-center rounded-full border-2 border-slate-800 text-2xl font-bold disabled:opacity-30">+</button>
    </span>
  </div>
}

export function Field({ label, hint, children }) {
  return <label className="block font-bold">{label}{hint && <span className="mr-1 text-sm font-normal text-slate-500">{hint}</span>}{children}</label>
}

// "#k=" organizer link + delete button, shown to the organizer only.
export function OrganizerTools({ onCopyOrganizer, onDelete, what }) {
  return <div className="mt-4 space-y-2 text-sm text-slate-600">
    <p>פותחים מטלפון אחר או מתוך וואטסאפ? <button onClick={onCopyOrganizer} className="font-bold underline">🔑 העתקת קישור ניהול</button> — שמרו אותו לעצמכם בלבד.</p>
    <button onClick={onDelete} className="text-rose-700 underline">🗑️ מחיקת {what}</button>
  </div>
}

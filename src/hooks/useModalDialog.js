import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'

// Shared behaviour for full-screen popups: Escape closes, keyboard focus stays inside the dialog,
// focus returns to the element that opened it, and the page behind does not scroll.
export default function useModalDialog(onClose, active = true) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!active) return
    const opener = document.activeElement
    const body = document.body
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const focusables = () => [...(ref.current?.querySelectorAll(FOCUSABLE) || [])].filter(el => el.offsetParent !== null || el === document.activeElement)
    // Move focus into the dialog unless something inside already has it.
    const t = setTimeout(() => {
      if (ref.current && !ref.current.contains(document.activeElement)) (focusables()[0] || ref.current).focus({ preventScroll: true })
    }, 0)

    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current?.(); return }
      if (e.key !== 'Tab' || !ref.current) return
      const list = focusables()
      if (!list.length) { e.preventDefault(); return }
      const first = list[0], last = list[list.length - 1]
      if (e.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      try { opener?.focus?.({ preventScroll: true }) } catch { /* opener gone */ }
    }
  }, [active])

  return ref
}

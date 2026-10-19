import { useEffect } from 'react'

// The stage is a body portal. Keep both keyboard and assistive-technology focus
// inside it, and restore the launching control when it closes.
export function useGameDialog(ref) {
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return undefined
    const previousFocus = document.activeElement
    const background = [...document.body.children].filter(el => el !== dialog && !el.contains(dialog) && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName))
    const previousInert = background.map(el => el.inert)
    background.forEach(el => { el.inert = true })
    const focusable = () => [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]')]
      .filter(el => el.tabIndex >= 0 && !el.closest('[inert]') && el.getClientRects().length > 0)
    const focusFirst = () => (focusable()[0] || dialog).focus()
    const onFocus = e => { if (!dialog.contains(e.target)) focusFirst() }
    const onKey = e => {
      if (e.key !== 'Tab') return
      const items = focusable(), first = items[0], last = items.at(-1)
      if (!first) { e.preventDefault(); dialog.focus(); return }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        e.preventDefault(); first.focus()
      }
    }
    focusFirst()
    document.addEventListener('focusin', onFocus)
    dialog.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('focusin', onFocus)
      dialog.removeEventListener('keydown', onKey)
      background.forEach((el, i) => { el.inert = previousInert[i] })
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [ref])
}

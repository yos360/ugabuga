import { useRef, useState } from 'react'

// Solitaire-only pointer handling; Spider keeps its established interaction contract.
export function useSolitaireDrag(onTap, onDrop, disabled) {
  const [drag, setDrag] = useState(null)
  const current = useRef(null)
  const cancel = () => { current.current = null; setDrag(null) }
  const handlers = key => ({
    onClick: e => { if (e.detail === 0 && !disabled) onTap(key) },
    onPointerDown: e => {
      if (disabled || current.current || !e.isPrimary || e.button !== 0) return
      e.preventDefault()
      e.currentTarget.focus({ preventScroll: true })
      e.currentTarget.setPointerCapture(e.pointerId)
      current.current = { key, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
    },
    onPointerMove: e => {
      const d = current.current
      if (!d || d.id !== e.pointerId) return
      const dx = e.clientX - d.x, dy = e.clientY - d.y
      if (!d.moved && Math.hypot(dx, dy) < 7) return
      d.moved = true
      setDrag({ key: d.key, dx, dy })
    },
    onPointerUp: e => {
      const d = current.current
      if (!d || d.id !== e.pointerId) return
      const table = e.currentTarget.closest('.cd-table')
      cancel()
      if (!d.moved) { onTap(d.key); return }
      const hit = document.elementsFromPoint(e.clientX, e.clientY)
        .find(el => table?.contains(el) && el.dataset?.drop && !el.classList.contains('is-drag'))
      onDrop(d.key, hit?.dataset.drop)
    },
    onPointerCancel: e => { if (current.current?.id === e.pointerId) cancel() },
    onLostPointerCapture: e => { if (current.current?.id === e.pointerId) cancel() },
  })
  return [drag, handlers]
}

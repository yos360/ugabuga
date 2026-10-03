import { useCallback, useEffect, useRef, useState } from 'react'

// Per-game progress saved in this browser only (level reached, best score).
export function useProgress(slug, initial) {
  const storageKey = `buga-arcade-${slug}`
  const [state, setState] = useState(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem(storageKey) || '{}') } } catch { return initial }
  })
  const save = useCallback(patch => setState(prev => {
    const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* private mode */ }
    return next
  }), [storageKey])
  return [state, save]
}

// Live width/height of an element (games size themselves to the free space).
export function useBox() {
  const ref = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, box]
}

// Swipe anywhere on an element → onDir('left' | 'right' | 'up' | 'down').
// Fires as soon as the finger has moved far enough (no need to lift it) — once per touch,
// or with `continuous` again after every further `min` pixels (snake: turn, turn, turn).
export function useSwipe(ref, onDir, min = 26, continuous = false) {
  const cb = useRef(onDir)
  useEffect(() => { cb.current = onDir })
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let start = null
    const down = e => {
      if (e.button > 0 || e.target.closest('button, a, input')) return
      start = { x: e.clientX, y: e.clientY, id: e.pointerId }
      el.setPointerCapture?.(e.pointerId)
    }
    const moveH = e => {
      if (!start || e.pointerId !== start.id) return
      const dx = e.clientX - start.x, dy = e.clientY - start.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < min) return
      start = continuous ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null
      cb.current(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
    }
    const up = () => { start = null }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', moveH)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', moveH)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [ref, min, continuous])
}

// Arrow keys / WASD → onDir.
const KEY_DIRS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }
export function useArrowKeys(onDir) {
  const cb = useRef(onDir)
  useEffect(() => { cb.current = onDir })
  useEffect(() => {
    const onKey = e => {
      const d = KEY_DIRS[e.key]
      if (!d || e.target.closest?.('input, textarea')) return
      e.preventDefault()
      cb.current(d)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function starsFor(value, great, ok) {
  return value <= great ? 3 : value <= ok ? 2 : 1
}

// Tap-or-drag for cards. onTap(key) for a short tap; onDrop(key, dropKey) when dragged
// onto something with data-drop. While dragging, `drag` = { key, dx, dy }.
export function useCardDrag(onTap, onDrop) {
  const [drag, setDrag] = useState(null)
  const cur = useRef(null)
  const handlers = key => ({
    onPointerDown: e => {
      if (e.button > 0) return
      e.currentTarget.setPointerCapture?.(e.pointerId)
      cur.current = { key, x: e.clientX, y: e.clientY, moved: false }
    },
    onPointerMove: e => {
      const d = cur.current
      if (!d) return
      const dx = e.clientX - d.x, dy = e.clientY - d.y
      if (!d.moved && Math.hypot(dx, dy) < 8) return
      d.moved = true
      setDrag({ key: d.key, dx, dy })
    },
    onPointerUp: e => {
      const d = cur.current
      cur.current = null
      setDrag(null)
      if (!d) return
      if (!d.moved) { onTap(d.key); return }
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find(n => n.dataset?.drop && !n.classList.contains('is-drag'))
      onDrop(d.key, hit?.dataset.drop)
    },
    onPointerCancel: () => { cur.current = null; setDrag(null) },
  })
  return [drag, handlers]
}

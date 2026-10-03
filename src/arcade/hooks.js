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

export function starsFor(value, great, ok) {
  return value <= great ? 3 : value <= ok ? 2 : 1
}

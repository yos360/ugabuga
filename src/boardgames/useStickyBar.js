import { useEffect, useRef, useState } from 'react'

// Keeps a status/dice bar visible above the board while the page scrolls. CSS `position: sticky` does
// not work here because the app's root wrapper has overflow-x:hidden (which makes it the scroll
// container), so the bar is pinned with position:fixed while its slot is above the viewport and the
// game area is still on screen. The slot keeps the bar's height so nothing jumps.
export function useStickyBar() {
  const slotRef = useRef(null)
  const barRef = useRef(null)
  const [pin, setPin] = useState(null)
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const slot = slotRef.current, bar = barRef.current
      if (!slot || !bar) return
      const r = slot.getBoundingClientRect()
      const h = bar.offsetHeight
      const areaBottom = (slot.parentElement || slot).getBoundingClientRect().bottom
      const should = r.top < 0 && areaBottom > h + 60
      setPin(prev => {
        if (!should) return prev ? null : prev
        const next = { left: Math.round(r.left), width: Math.round(r.width), h }
        return prev && prev.left === next.left && prev.width === next.width && prev.h === next.h ? prev : next
      })
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  const slotStyle = pin ? { height: pin.h } : undefined
  const barStyle = pin ? { position: 'fixed', top: 0, left: pin.left, width: pin.width } : undefined
  return { slotRef, barRef, slotStyle, barStyle, pinned: !!pin }
}

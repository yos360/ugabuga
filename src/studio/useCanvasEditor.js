// Pointer handling on the page canvas: select, drag with magnet guides, resize from the corners
// (same-height magnet), rotate (snaps to straight angles), pinch with two fingers, and pan / zoom
// a photo inside its frame in crop mode. Works with mouse, pen and touch.
import { useEffect, useRef } from 'react'
import { bbox, snapMove, snapSize } from './geometry'

const rad = d => (d * Math.PI) / 180
// point (mm) inside a rotated item?
export function hit(it, px, py) {
  const cx = it.x + it.w / 2, cy = it.y + it.h / 2, r = -rad(it.rot || 0)
  const dx = px - cx, dy = py - cy
  const x = dx * Math.cos(r) - dy * Math.sin(r), y = dx * Math.sin(r) + dy * Math.cos(r)
  return Math.abs(x) <= it.w / 2 && Math.abs(y) <= it.h / 2
}
export function topHit(items, px, py) {
  for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; if (!it.auto && !it.locked && !it.hidden && hit(it, px, py)) return it }
  for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; if (it.auto && !it.hidden && hit(it, px, py)) return it }
  return null
}

// api: { getPage, getDoc, kCss, selId, setSel, live(updater), commit(), crop, setGuides }
export function useCanvasEditor(ref, api) {
  const a = useRef(api)
  a.current = api
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ptrs = new Map()
    let g = null // current gesture
    const toMm = e => { const r = el.getBoundingClientRect(), k = a.current.kCss; return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k } }
    const guidesOf = () => {
      const d = a.current.getDoc(), W = d.size.w, H = d.size.h, s = 12
      const gx = [0, W, W / 2, s, W - s], gy = [0, H, H / 2, s, H - s]
      if (d.kind === 'album') gx.push(W / 2 - s, W / 2 + s, W / 4, (3 * W) / 4)
      return { guidesX: gx, guidesY: gy }
    }
    const down = e => {
      if (e.button > 0) return
      try { el.setPointerCapture?.(e.pointerId) } catch { /* pointer already gone */ }
      ptrs.set(e.pointerId, toMm(e))
      const page = a.current.getPage()
      if (ptrs.size === 2) {
        const sel = page.items.find(i => i.id === a.current.selId)
        if (!sel) return
        const [p1, p2] = [...ptrs.values()]
        g = { type: 'pinch', id: sel.id, start: { ...sel }, d0: Math.hypot(p2.x - p1.x, p2.y - p1.y), a0: Math.atan2(p2.y - p1.y, p2.x - p1.x) }
        return
      }
      const p = ptrs.get(e.pointerId)
      const sel = page.items.find(i => i.id === a.current.selId)
      if (a.current.crop && sel && hit(sel, p.x, p.y)) { g = { type: 'pan', id: sel.id, p0: p, start: { ...sel } }; return }
      const it = topHit(page.items, p.x, p.y)
      a.current.setSel(it ? it.id : null)
      if (it && !it.locked) g = { type: 'move', id: it.id, p0: p, start: { ...it }, moved: false }
      else g = null
    }
    const move = e => {
      if (!ptrs.has(e.pointerId)) return
      ptrs.set(e.pointerId, toMm(e))
      if (!g) return
      const page = a.current.getPage()
      if (g.type === 'pinch' && ptrs.size >= 2) {
        const [p1, p2] = [...ptrs.values()]
        const s = Math.hypot(p2.x - p1.x, p2.y - p1.y) / g.d0, da = ((Math.atan2(p2.y - p1.y, p2.x - p1.x) - g.a0) * 180) / Math.PI
        const st = g.start
        if (a.current.crop) a.current.live(g.id, { zoom: Math.min(6, Math.max(1, (st.zoom || 1) * s)) })
        else {
          const w = Math.max(5, st.w * s), h = Math.max(5, st.h * s)
          a.current.live(g.id, { w, h, x: st.x + st.w / 2 - w / 2, y: st.y + st.h / 2 - h / 2, rot: Math.round((st.rot || 0) + da), ...(st.type === 'text' ? { size: st.size * s } : {}) })
        }
        return
      }
      const p = ptrs.get(e.pointerId)
      if (g.type === 'pan') {
        const st = g.start, z = st.zoom || 1
        // dragging moves the picture; ox/oy are relative to the free room the zoom/crop gives
        const roomX = Math.max(1, st.w * (z - 1) + 1), roomY = Math.max(1, st.h * (z - 1) + 1)
        a.current.live(g.id, { ox: Math.max(-1, Math.min(1, (st.ox || 0) - ((p.x - g.p0.x) * 2) / roomX)), oy: Math.max(-1, Math.min(1, (st.oy || 0) - ((p.y - g.p0.y) * 2) / roomY)) })
        return
      }
      if (g.type === 'move') {
        let dx = p.x - g.p0.x, dy = p.y - g.p0.y
        if (!g.moved && Math.hypot(dx, dy) * a.current.kCss < 3) return
        g.moved = true
        const cand = { ...g.start, x: g.start.x + dx, y: g.start.y + dy }
        const others = page.items.filter(i => i.id !== g.id && !i.auto && !i.hidden).map(bbox)
        const sn = snapMove(bbox(cand), others, guidesOf(), 6 / a.current.kCss)
        a.current.setGuides({ x: sn.lineX, y: sn.lineY })
        a.current.live(g.id, { x: cand.x + sn.dx, y: cand.y + sn.dy })
      }
    }
    const up = e => {
      ptrs.delete(e.pointerId)
      if (g && ptrs.size === 0) {
        if (g.type !== 'move' || g.moved) a.current.commit()
        else a.current.onTap?.(g.id) // a plain tap (no drag): e.g. an empty frame asks for a photo
        g = null
        a.current.setGuides(null)
      }
      if (g?.type === 'pinch' && ptrs.size < 2) { a.current.commit(); g = null }
    }
    const wheel = e => {
      const sel = a.current.getPage().items.find(i => i.id === a.current.selId)
      if (!sel || !a.current.crop || sel.type !== 'photo') return
      e.preventDefault()
      a.current.live(sel.id, { zoom: Math.min(6, Math.max(1, (sel.zoom || 1) * (e.deltaY < 0 ? 1.06 : 1 / 1.06))) })
      clearTimeout(wheel.t); wheel.t = setTimeout(() => a.current.commit(), 400)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('wheel', wheel) }
  }, [ref])
}

// Corner resize + rotate handles (DOM overlay around the selected item).
export function startHandle(e, kind, it, api) {
  e.stopPropagation(); e.preventDefault()
  const target = e.currentTarget
  target.setPointerCapture?.(e.pointerId)
  const canvas = api.canvas()
  const r = canvas.getBoundingClientRect(), k = api.kCss
  const toMm = ev => ({ x: (ev.clientX - r.left) / k, y: (ev.clientY - r.top) / k })
  const st = { ...it }, cx = st.x + st.w / 2, cy = st.y + st.h / 2
  const p0 = toMm(e)
  const sizes = api.getPage().items.filter(i => i.id !== it.id && i.type === 'photo').flatMap(i => [i.h])
  const mv = ev => {
    const p = toMm(ev)
    if (kind === 'rot') {
      let ang = (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI + 90
      if (ev.shiftKey) ang = Math.round(ang / 15) * 15
      else for (const s of [0, 90, 180, -90, -180, 270]) if (Math.abs(ang - s) < 4) ang = s
      api.live(it.id, { rot: Math.round(ang * 10) / 10 })
      return
    }
    // resize symmetric around the centre in the item's own axes
    const ar = rad(st.rot || 0), dx = p.x - cx, dy = p.y - cy
    const lx = Math.abs(dx * Math.cos(-ar) - dy * Math.sin(-ar)), ly = Math.abs(dx * Math.sin(-ar) + dy * Math.cos(-ar))
    const d0x = Math.abs((p0.x - cx) * Math.cos(-ar) - (p0.y - cy) * Math.sin(-ar)), d0y = Math.abs((p0.x - cx) * Math.sin(-ar) + (p0.y - cy) * Math.cos(-ar))
    let sx = lx / Math.max(1, d0x), sy = ly / Math.max(1, d0y)
    const keep = st.type !== 'photo' || ev.shiftKey || kind === 'scale'
    if (keep) sx = sy = Math.max(sx, sy)
    let w = Math.max(4, st.w * sx), h = Math.max(4, st.h * sy)
    if (st.type === 'photo' && !keep) h = snapSize(h, sizes, 4 / k)
    api.live(it.id, { w, h, x: cx - w / 2, y: cy - h / 2, ...(st.type === 'text' ? { size: st.size * Math.max(sx, sy) } : {}) })
  }
  const end = () => { target.removeEventListener('pointermove', mv); target.removeEventListener('pointerup', end); target.removeEventListener('pointercancel', end); api.commit() }
  target.addEventListener('pointermove', mv)
  target.addEventListener('pointerup', end)
  target.addEventListener('pointercancel', end)
}

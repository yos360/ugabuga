import { useEffect, useRef } from 'react'

const COLORS = ['#ff5c5c', '#ffd23f', '#4cd681', '#45c4ff', '#b26bff', '#ff7ad1', '#ffa62b']

// A burst of confetti from both bottom corners, drawn on a canvas that fills its parent.
// Runs once for about three seconds; skipped for visitors who asked for less motion.
// `fixed` covers the whole window instead (for games that are not inside the full-screen stage).
export default function Confetti({ pieces = 140, fixed = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx = cv.getContext('2d')
    if (!ctx) return undefined
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = cv.clientWidth, h = cv.clientHeight
    cv.width = w * dpr; cv.height = h * dpr
    ctx.scale(dpr, dpr)
    const power = Math.max(0.8, Math.min(1.4, h / 700))
    const parts = Array.from({ length: pieces }, (_, i) => {
      const left = i % 2 === 0
      return {
        x: left ? w * 0.08 : w * 0.92, y: h * 0.92,
        vx: (left ? 1 : -1) * (2 + Math.random() * 8) * power, vy: -(10 + Math.random() * 10) * power,
        r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.35, s: 6 + Math.random() * 7,
        c: COLORS[i % COLORS.length], round: i % 4 === 0, delay: Math.floor(Math.random() * 12),
      }
    })
    let frame = 0, raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        if (frame < p.delay) continue
        p.vy += 0.35; p.vx *= 0.985; p.vy *= 0.99
        p.x += p.vx; p.y += p.vy; p.r += p.vr
        ctx.save()
        ctx.translate(p.x, p.y); ctx.rotate(p.r)
        ctx.globalAlpha = Math.max(0, Math.min(1, (190 - frame) / 40))
        ctx.fillStyle = p.c
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.4, 0, 6.3); ctx.fill() }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * Math.abs(Math.cos(p.r * 2)) + 1)
        ctx.restore()
      }
      if (++frame < 190) raf = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, w, h)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [pieces])
  // inline style: works on pages that do not load arcade.css (the thinking-lab games)
  return <canvas ref={ref} aria-hidden="true" style={{ position: fixed ? 'fixed' : 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: fixed ? 2000 : 3 }} />
}

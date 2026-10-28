import { useEffect, useRef, useState } from 'react'
import { liveSound } from '../live/liveSounds'

// "קופצים בשלוליות" — a small game on /weather. A kid in a yellow raincoat walks through the rain; tap (or
// Space) to jump. Land IN a puddle for a splash (+1, more in a row), jump OVER rocks — touching a rock costs a
// boot (3 boots). It speeds up slowly. Best score is kept on this device. Pure SVG + requestAnimationFrame.
const W = 400, H = 200, GROUND = 160, KID_X = 300, JUMP_MS = 620, JUMP_H = 70
const BEST = 'buga-puddle-best'
const best = () => { try { return Number(localStorage.getItem(BEST) || 0) } catch { return 0 } }

function Kid({ y, splash }) {
  return <g transform={`translate(${KID_X} ${y})`}>
    <ellipse cx="0" cy="2" rx="16" ry="4" fill="#0002" transform={`translate(0 ${GROUND - y})`} />
    <path d="M-14 -6 Q-16 -34 0 -38 Q16 -34 14 -6 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
    <circle cx="0" cy="-44" r="11" fill="#fde2c8" stroke="#a16207" strokeWidth="1.2" />
    <path d="M-13 -46 Q0 -64 13 -46 Q0 -52 -13 -46 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.2" />
    <circle cx="-4" cy="-44" r="1.6" fill="#1f2937" /><circle cx="4" cy="-44" r="1.6" fill="#1f2937" />
    <path d={splash ? 'M-4 -39 Q0 -35 4 -39' : 'M-3 -39 Q0 -37 3 -39'} stroke="#1f2937" strokeWidth="1.3" fill="none" />
    <rect x="-11" y="-7" width="9" height="9" rx="2" fill="#dc2626" /><rect x="2" y="-7" width="9" height="9" rx="2" fill="#dc2626" />
  </g>
}

export default function PuddleJump() {
  const [state, setState] = useState('idle'), [view, setView] = useState({ t: 0, things: [], y: GROUND, score: 0, lives: 3, splashes: [] })
  const [top, setTop] = useState(best)
  const game = useRef(null), raf = useRef(0)

  const jump = () => {
    const g = game.current
    if (state !== 'play' || !g) return
    if (g.jumpAt == null) g.jumpAt = g.t
  }

  useEffect(() => {
    if (state !== 'play') return
    const g = game.current = { t: 0, last: performance.now(), things: [], next: 900, score: 0, combo: 0, lives: 3, jumpAt: null, splashes: [] }
    const tick = now => {
      const dt = Math.min(48, now - g.last); g.last = now; g.t += dt
      const speed = 0.12 + Math.min(0.14, g.t / 120000) // px per ms
      g.next -= dt
      if (g.next <= 0) { g.things.push({ id: g.t, x: -40, kind: Math.random() < 0.68 ? 'puddle' : 'rock', done: false }); g.next = 650 + Math.random() * 900 - Math.min(300, g.t / 200) }
      for (const o of g.things) o.x += speed * dt
      // jump arc
      let y = GROUND, landed = false
      if (g.jumpAt != null) {
        const p = (g.t - g.jumpAt) / JUMP_MS
        if (p >= 1) { g.jumpAt = null; landed = true } else y = GROUND - Math.sin(p * Math.PI) * JUMP_H
      }
      const air = y < GROUND - 8
      for (const o of g.things) {
        if (o.done) continue
        const over = Math.abs(o.x - KID_X) < (o.kind === 'puddle' ? 26 : 14)
        if (o.kind === 'puddle' && landed && over) { o.done = true; g.combo++; g.score += g.combo; g.splashes.push({ id: g.t, x: o.x, at: g.t }); liveSound('right') }
        if (o.kind === 'rock' && over && !air) { o.done = true; g.combo = 0; g.lives--; liveSound('wrong') }
        if (o.kind === 'puddle' && o.x > KID_X + 30 && !o.done) { o.done = true; g.combo = 0 }
      }
      g.things = g.things.filter(o => o.x < W + 50)
      g.splashes = g.splashes.filter(s => g.t - s.at < 500)
      setView({ t: g.t, things: g.things.map(o => ({ ...o })), y, score: g.score, lives: g.lives, splashes: [...g.splashes], combo: g.combo })
      if (g.lives <= 0) {
        setState('over')
        if (g.score > best()) { try { localStorage.setItem(BEST, String(g.score)) } catch { /* private mode */ } setTop(g.score) }
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    const key = e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (g.jumpAt == null) g.jumpAt = g.t } }
    window.addEventListener('keydown', key)
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('keydown', key) }
  }, [state])

  const start = () => setState('play')
  return <section aria-label="משחק: קופצים בשלוליות" className="mx-auto mt-10 max-w-xl rounded-3xl border-2 border-sky-300 bg-sky-50 p-4 text-center" dir="rtl">
    <h2 className="text-2xl font-black">🎮 קופצים בשלוליות</h2>
    <p className="text-sm text-slate-600">נוחתים בתוך שלולית — שפריץ ונקודה! קופצים מעל אבנים. לוחצים על המסך (או רווח) כדי לקפוץ.</p>
    <div className="relative mt-3 select-none overflow-hidden rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-300 to-sky-100" style={{ touchAction: 'manipulation' }}
      onPointerDown={e => { e.preventDefault(); if (state === 'play') jump(); else start() }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="שדה המשחק">
        {Array.from({ length: 26 }, (_, i) => <line key={i} x1={(i * 53 + view.t * 0.03) % W} y1={(i * 37 + view.t * 0.25) % 150} x2={(i * 53 + view.t * 0.03) % W - 4} y2={(i * 37 + view.t * 0.25) % 150 + 10} stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />)}
        <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#86a873" />
        {view.things.map(o => o.kind === 'puddle'
          ? <ellipse key={o.id} cx={o.x} cy={GROUND + 6} rx="30" ry="7" fill={o.done ? '#93c5fd' : '#3b82f6'} opacity="0.9" />
          : <path key={o.id} d={`M${o.x - 13} ${GROUND + 2} Q${o.x - 10} ${GROUND - 16} ${o.x} ${GROUND - 18} Q${o.x + 12} ${GROUND - 14} ${o.x + 13} ${GROUND + 2} Z`} fill="#78716c" stroke="#44403c" />)}
        {view.splashes.map(s => <g key={s.id}>{[-18, -9, 0, 9, 18].map(dx => <circle key={dx} cx={KID_X + dx} cy={GROUND - 6 - Math.abs(18 - Math.abs(dx)) * 0.7} r="3" fill="#60a5fa" />)}</g>)}
        <Kid y={view.y} splash={view.splashes.length > 0} />
        <text x="10" y="22" fontSize="16" fontWeight="800" fill="#1e293b" direction="ltr">⭐ {view.score}</text>
        <text x={W - 10} y="22" fontSize="16" textAnchor="end" direction="ltr">{'🥾'.repeat(Math.max(0, view.lives))}</text>
      </svg>
      {state !== 'play' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
        {state === 'over' && <p className="text-xl font-black">אספתם {view.score} נקודות!</p>}
        <button type="button" onClick={e => { e.stopPropagation(); start() }} className="mt-2 min-h-[48px] rounded-2xl bg-sky-600 px-6 text-lg font-bold text-white hover:bg-sky-700">{state === 'over' ? '🔄 עוד פעם' : '▶️ מתחילים'}</button>
        {top > 0 && <p className="mt-2 text-sm">השיא שלכם: {top}</p>}
      </div>}
    </div>
  </section>
}

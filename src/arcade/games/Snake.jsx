import { useEffect, useRef, useState } from 'react'
import { start as startSnake, turn, step, speedFor, DIRS } from '../logic/snake'
import { rng } from '../logic/rng'
import { useBox, useProgress, useSwipe, useArrowKeys } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// Smooth snake: the rules step cell by cell (logic/snake.js), but the drawing glides
// between cells every animation frame, on a fixed clock that React renders can't disturb.

export default function Snake({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('snake', { best: 0, walls: false })
  const [boxRef, box] = useBox()
  const fieldRef = useRef(null)
  const canvasRef = useRef(null)
  const [walls, setWalls] = useState(progress.walls)
  const [phase, setPhase] = useState('ready') // ready | run | pause | dead
  const [score, setScore] = useState(0)
  const [record, setRecord] = useState(false)
  const [dims, setDims] = useState(null) // board size in cells
  const g = useRef(null) // { s, prev, acc, rand, fx, pops, shake, flash }
  const phaseRef = useRef('ready')
  const wallsRef = useRef(walls)
  const bestRef = useRef(progress.best)
  const boxSize = useRef(box)
  useEffect(() => { boxSize.current = box }, [box])
  useEffect(() => { bestRef.current = progress.best }, [progress.best])

  const setP = p => { phaseRef.current = p; setPhase(p) }
  const newGame = () => {
    const { w, h } = boxSize.current
    const cols = w < 520 ? 15 : 21
    const rows = Math.max(12, Math.min(30, Math.round((cols * (h - 8)) / Math.max(1, w - 8))))
    const rand = daily ? rng(daily.seed) : Math.random
    const s = startSnake(cols, rows, rand)
    g.current = { s, prev: s.body, acc: 0, rand, fx: [], pops: [], shake: 0, flash: 0 }
    setDims({ w: cols, h: rows }); setScore(0); setRecord(false); setP('ready')
  }
  // first board once the field has a size; a new board if the screen turns before starting
  useEffect(() => {
    if (!box.w || !box.h) return
    if (!g.current || phaseRef.current === 'ready') newGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.w, box.h])

  // the animation loop — one for the whole life of the game
  useEffect(() => {
    let raf = 0, last = performance.now()
    const loop = now => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(100, now - last)
      last = now
      const G = g.current, cv = canvasRef.current
      if (!G || !cv) return
      if (phaseRef.current === 'run') {
        G.acc += dt
        while (phaseRef.current === 'run' && G.acc >= speedFor(G.s.score)) {
          G.acc -= speedFor(G.s.score)
          G.prev = G.s.body
          const s = step(G.s, wallsRef.current, G.rand)
          G.s = s
          if (s.ate) {
            const [hx, hy] = s.body[0]
            const color = s.ate === 'gold' ? '#ffcf33' : '#ff4d4d'
            for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 3; G.fx.push({ x: hx + 0.5, y: hy + 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color }) }
            G.pops.push({ x: hx + 0.5, y: hy, life: 1, text: s.ate === 'gold' ? '+3' : '+1' })
            setScore(s.score)
            navigator.vibrate?.(12)
          }
          if (s.dead) {
            G.prev = s.body; G.shake = 1; G.flash = 1
            phaseRef.current = 'dead'
            setPhase('dead'); setRecord(s.score > bestRef.current && s.score > 0)
            navigator.vibrate?.([60, 40, 60])
          }
        }
      }
      draw(cv, G, phaseRef.current === 'run' ? Math.min(1, G.acc / speedFor(G.s.score)) : 1, dt, now)
    }
    raf = requestAnimationFrame(loop)
    const onVis = () => { if (document.hidden && phaseRef.current === 'run') { phaseRef.current = 'pause'; setPhase('pause') } }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  // Automated-test helper, only when localStorage 'buga-debug' is '1': read the game state.
  useEffect(() => {
    let debug = false
    try { debug = localStorage.getItem('buga-debug') === '1' } catch { /* ignore */ }
    if (!debug) return undefined
    window.__snake = () => g.current?.s
    return () => { delete window.__snake }
  }, [])

  useEffect(() => {
    if (phase !== 'dead') return
    if (daily) { daily.finish({ text: `🐍 נחש: הנחש שלי אכל ${score} תפוחים`, score: -score, won: true }); return }
    saveProgress(p => ({ best: Math.max(p.best, score) }))
    if (score) onReport?.({ text: `🐍 הנחש שלי אכל ${score} תפוחים!` })
  }, [phase, score, saveProgress, onReport, daily])

  const go = dir => {
    const G = g.current
    if (!G || phaseRef.current === 'dead') return
    G.s = turn(G.s, dir)
    if (phaseRef.current !== 'run') { G.acc = 0; setP('run') }
  }
  const togglePause = () => {
    if (phaseRef.current === 'run') setP('pause')
    else if (phaseRef.current === 'pause') { g.current.acc = 0; setP('run') }
  }
  useSwipe(fieldRef, go, 22, true)
  useArrowKeys(go)
  useEffect(() => {
    const onKey = e => { if (e.key === ' ' || e.key === 'p') { e.preventDefault(); togglePause() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const toggleWalls = () => { const w = !walls; setWalls(w); wallsRef.current = w; saveProgress({ walls: w }); newGame() }

  // canvas: as big as the field allows, square cells
  const cell = dims && box.w ? Math.max(10, Math.min((box.w - 8) / dims.w, (box.h - 8) / dims.h)) : 0
  const W = dims ? Math.floor(cell * dims.w) : 0, H = dims ? Math.floor(cell * dims.h) : 0
  const ratio = dpr()

  return (
    <div className="arc-game">
      <Hud stats={[['🍎', score], ['שיא', Math.max(progress.best, score)]]}>
        <ToolButton onClick={togglePause} disabled={phase === 'ready' || phase === 'dead'} label={phase === 'run' ? 'הפסקה' : 'המשך'}>{phase === 'run' ? '⏸️' : '▶️'}</ToolButton>
        {!daily && <ToolButton onClick={toggleWalls} label={walls ? 'קירות סגורים — לחצו לפתוח' : 'קירות פתוחים — לחצו לסגור'}>{walls ? '🧱' : '🌀'}</ToolButton>}
        <ToolButton onClick={newGame} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field sn-field" ref={el => { boxRef.current = el; fieldRef.current = el }}>
        <canvas ref={canvasRef} className="sn-canvas" width={Math.round(W * ratio)} height={Math.round(H * ratio)} style={{ width: W, height: H }}
          aria-label="לוח הנחש. החליקו או לחצו על החצים כדי לכוון" role="img" />
        {(phase === 'ready' || phase === 'pause') && (
          <div className="sn-start">
            {phase === 'pause' ? '⏸️ הפסקה — החליקו או לחצו על חץ כדי להמשיך' : '👆 החליקו לכיוון כלשהו כדי להתחיל'}
            <small>{walls ? '🧱 קירות סגורים: אסור לגעת בקיר' : '🌀 קירות פתוחים: עוברים מצד לצד'} · 🍎 = 1 · תפוח זהב = 3</small>
          </div>
        )}
      </div>
      <div className="sn-pad" aria-label="חצים">
        <button type="button" className="sn-key sn-up" onPointerDown={e => { e.preventDefault(); go('up') }} aria-label="למעלה">▲</button>
        <button type="button" className="sn-key sn-left" onPointerDown={e => { e.preventDefault(); go('left') }} aria-label="שמאלה">◀</button>
        <button type="button" className="sn-key sn-down" onPointerDown={e => { e.preventDefault(); go('down') }} aria-label="למטה">▼</button>
        <button type="button" className="sn-key sn-right" onPointerDown={e => { e.preventDefault(); go('right') }} aria-label="ימינה">▶</button>
      </div>
      {phase === 'dead' && !daily && <EndCard title="🐍 אוי, הנחש נתקע!" text={`אכלתם ${score} תפוחים${record ? ' — שיא חדש! 🎉' : ''}.`}
        primary="🔄 עוד סיבוב" onPrimary={newGame}
        secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🐍 הנחש שלי אכל ${score} תפוחים! מי עובר אותי?`)} />}
    </div>
  )
}

function dpr() { return typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1) }

// ---------- drawing ----------
function draw(cv, G, t, dt, now) {
  const { s } = G
  const ratio = dpr()
  const cell = cv.width / ratio / s.w
  if (!cell) return
  const ctx = cv.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  const W = s.w * cell, H = s.h * cell
  ctx.save()
  if (G.shake > 0) { ctx.translate((Math.random() - 0.5) * 10 * G.shake, (Math.random() - 0.5) * 10 * G.shake); G.shake = Math.max(0, G.shake - dt / 400) }

  // grass
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    ctx.fillStyle = (x + y) % 2 ? '#a8dd8a' : '#b6e69a'
    ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5)
  }

  // apple (bobbing; a golden one glows)
  if (s.apple) {
    const [ax, ay, gold] = s.apple
    const bob = Math.sin(now / 220) * cell * 0.05
    const cx = (ax + 0.5) * cell, cy = (ay + 0.55) * cell + bob, r = cell * (gold ? 0.42 : 0.39)
    ctx.fillStyle = '#0000001f'
    ctx.beginPath(); ctx.ellipse(cx, (ay + 0.9) * cell, r * 0.8, r * 0.25, 0, 0, Math.PI * 2); ctx.fill()
    if (gold) { ctx.fillStyle = '#ffe58a80'; ctx.beginPath(); ctx.arc(cx, cy, r * (1.45 + Math.sin(now / 150) * 0.12), 0, Math.PI * 2); ctx.fill() }
    ctx.fillStyle = gold ? '#ffc61a' : '#ef3b3b'
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ffffff99'; ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = cell * 0.07; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.8); ctx.lineTo(cx + r * 0.15, cy - r * 1.3); ctx.stroke()
    ctx.fillStyle = '#3fae49'; ctx.beginPath(); ctx.ellipse(cx + r * 0.45, cy - r * 1.15, r * 0.38, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fill()
  }

  // snake: each segment glides from its previous cell to its current one
  const pts = s.body.map((c, i) => {
    const p = G.prev[i] || G.prev[G.prev.length - 1] || c
    let dx = c[0] - p[0], dy = c[1] - p[1]
    if (dx > 1) dx -= s.w; else if (dx < -1) dx += s.w // passing through a soft wall
    if (dy > 1) dy -= s.h; else if (dy < -1) dy += s.h
    return [(c[0] - dx * (1 - t) + 0.5) * cell, (c[1] - dy * (1 - t) + 0.5) * cell]
  })
  const dead = s.dead
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const stroke = (width, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = width
    ctx.beginPath()
    pts.forEach(([x, y], i) => {
      const jump = i && Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]) > cell * 1.5
      if (!i || jump) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    })
    if (pts.length === 1) ctx.lineTo(pts[0][0] + 0.1, pts[0][1])
    ctx.stroke()
  }
  stroke(cell * 0.78, dead ? '#6b7280' : '#1f7a52')
  stroke(cell * 0.62, dead ? '#9ca3af' : '#37b97a')
  ctx.fillStyle = dead ? '#d1d5db' : '#7fe0ae'
  pts.forEach(([x, y], i) => { if (i && i % 2 === 0) { ctx.beginPath(); ctx.arc(x, y, cell * 0.11, 0, Math.PI * 2); ctx.fill() } })

  // head
  const [hx, hy] = pts[0]
  const [ddx, ddy] = DIRS[s.dir]
  ctx.fillStyle = dead ? '#6b7280' : '#1f7a52'
  ctx.beginPath(); ctx.arc(hx, hy, cell * 0.46, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = dead ? '#9ca3af' : '#43c987'
  ctx.beginPath(); ctx.arc(hx, hy, cell * 0.38, 0, Math.PI * 2); ctx.fill()
  if (!dead && Math.sin(now / 160) > 0.55) { // tongue flick
    ctx.strokeStyle = '#e23b5a'; ctx.lineWidth = cell * 0.07
    const tx = hx + ddx * cell * 0.45, ty = hy + ddy * cell * 0.45
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + ddx * cell * 0.22, ty + ddy * cell * 0.22); ctx.stroke()
  }
  for (const side of [-1, 1]) { // eyes look where it's going
    const ex = hx + ddx * cell * 0.12 + (ddy ? side * cell * 0.2 : 0)
    const ey = hy + ddy * cell * 0.12 + (ddx ? side * cell * 0.2 : 0)
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, cell * 0.13, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1d2233'
    if (dead) { ctx.font = `900 ${cell * 0.26}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('×', ex, ey) }
    else { ctx.beginPath(); ctx.arc(ex + ddx * cell * 0.05, ey + ddy * cell * 0.05, cell * 0.065, 0, Math.PI * 2); ctx.fill() }
  }

  // sparkles and "+1"
  G.fx = G.fx.filter(p => (p.life -= dt / 600) > 0)
  for (const p of G.fx) {
    p.x += (p.vx * dt) / 1000; p.y += (p.vy * dt) / 1000
    ctx.globalAlpha = p.life; ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x * cell, p.y * cell, cell * 0.1 * p.life + 1, 0, Math.PI * 2); ctx.fill()
  }
  G.pops = G.pops.filter(p => (p.life -= dt / 800) > 0)
  for (const p of G.pops) {
    ctx.globalAlpha = Math.min(1, p.life * 1.6); ctx.fillStyle = '#1d2233'
    ctx.font = `900 ${cell * 0.6}px Fredoka, Heebo, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(p.text, p.x * cell, (p.y - (1 - p.life) * 1.2) * cell)
  }
  ctx.globalAlpha = 1
  ctx.restore()
  if (G.flash > 0) { ctx.fillStyle = `rgba(255,80,80,${G.flash * 0.35})`; ctx.fillRect(0, 0, W, H); G.flash = Math.max(0, G.flash - dt / 500) }
}

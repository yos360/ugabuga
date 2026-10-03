import { useEffect, useRef, useState } from 'react'
import { W, H, emptyBoard, cells, collides, spawn, makeBag, tryMove, tryRotate, dropDistance, lock, colorOf, LINE_POINTS, levelFor, gravityMs } from '../logic/tetris'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// Falling blocks: drag sideways to move, tap to turn, flick down to drop.
// The game runs on one animation loop (gravity + lock delay) kept outside React state.
const LOCK_MS = 450

export default function FallingBlocks({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('falling-blocks', { best: 0 })
  const [boxRef, box] = useBox()
  const canvasRef = useRef(null)
  const nextRef = useRef(null)
  const [hud, setHud] = useState({ score: 0, lines: 0, level: 1 })
  const [phase, setPhase] = useState('ready') // ready | run | pause | over
  const makeGame = () => {
    const rand = daily ? rng(daily.seed) : Math.random
    const bag = makeBag(rand)
    const first = bag.shift()
    return { board: emptyBoard(), piece: spawn(first), bag, rand, score: 0, lines: 0, level: 1, acc: 0, lockAt: 0, resets: 0, flash: [], fx: [], over: false }
  }
  const [first] = useState(makeGame)
  const g = useRef(first) // the live game, changed in place by the loop and the controls
  const phaseRef = useRef('ready')
  const setP = p => { phaseRef.current = p; setPhase(p) }
  const newGame = () => { g.current = makeGame(); setHud({ score: 0, lines: 0, level: 1 }); setP('ready') }
  const nextType = () => { const G = g.current; if (!G.bag.length) G.bag = makeBag(G.rand); return G.bag[0] }

  // ---- actions (all on the ref, then a tiny HUD update) ----
  const settle = () => {
    const G = g.current
    const r = lock(G.board, G.piece)
    G.board = r.board
    if (r.cleared) {
      G.lines += r.cleared
      G.score += LINE_POINTS[r.cleared] * G.level
      G.level = levelFor(G.lines)
      G.flash = r.rows.map(y => ({ y, life: 1 }))
      sfx(r.cleared === 4 ? 'win' : 'eat')
      navigator.vibrate?.(r.cleared === 4 ? [30, 30, 30] : 15)
    }
    const t = nextType(); G.bag.shift()
    const np = spawn(t)
    if (r.topOut || collides(G.board, np)) { G.over = true; G.piece = np; sfx('crash'); setHud({ score: G.score, lines: G.lines, level: G.level }); setP('over'); return }
    G.piece = np; G.lockAt = 0; G.resets = 0
    setHud({ score: G.score, lines: G.lines, level: G.level })
  }
  const act = kind => {
    const G = g.current
    if (!G || G.over) return
    if (phaseRef.current === 'ready') setP('run')
    if (phaseRef.current !== 'run') return
    let n = null
    if (kind === 'left') n = tryMove(G.board, G.piece, -1, 0)
    else if (kind === 'right') n = tryMove(G.board, G.piece, 1, 0)
    else if (kind === 'rotate') { n = tryRotate(G.board, G.piece, 1); if (n) sfx('tick') }
    else if (kind === 'down') { n = tryMove(G.board, G.piece, 0, 1); if (n) { G.score += 1; G.acc = 0 } }
    else if (kind === 'drop') {
      const d = dropDistance(G.board, G.piece)
      G.piece = { ...G.piece, y: G.piece.y + d }; G.score += d * 2
      for (const [x, y] of cells(G.piece)) G.fx.push({ x: x + 0.5, y: y + 0.5, life: 1 })
      settle(); return
    }
    if (n) {
      G.piece = n
      if (G.lockAt && G.resets < 15) { G.lockAt = performance.now() + LOCK_MS; G.resets++ }
    }
  }

  // ---- the loop ----
  useEffect(() => {
    let raf = 0, last = performance.now()
    const loop = now => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(100, now - last); last = now
      const G = g.current
      if (G && phaseRef.current === 'run' && !G.over) {
        const grounded = !tryMove(G.board, G.piece, 0, 1)
        if (grounded) {
          if (!G.lockAt) G.lockAt = now + LOCK_MS
          else if (now >= G.lockAt) settle()
        } else {
          G.lockAt = 0
          G.acc += dt
          const ms = gravityMs(G.level)
          while (G.acc >= ms) { G.acc -= ms; const n = tryMove(G.board, G.piece, 0, 1); if (n) G.piece = n; else break }
        }
      }
      if (G) { draw(canvasRef.current, G, dt); drawNext(nextRef.current, G.bag.length ? G.bag[0] : null) }
    }
    raf = requestAnimationFrame(loop)
    const onVis = () => { if (document.hidden && phaseRef.current === 'run') setP('pause') }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const togglePause = () => { if (phaseRef.current === 'run') setP('pause'); else if (phaseRef.current === 'pause') setP('run') }

  // keyboard
  useEffect(() => {
    const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', ArrowDown: 'down', ' ': 'drop', x: 'rotate', a: 'left', d: 'right', s: 'down', w: 'rotate' }
    const onKey = e => {
      if (e.key === 'p') { e.preventDefault(); togglePause(); return }
      const k = keys[e.key]
      if (!k) return
      e.preventDefault(); act(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // touch on the board: drag sideways = move cell by cell, drag down = soft drop,
  // quick flick down = hard drop, short tap = rotate
  const touch = useRef(null)
  const cellPx = () => (canvasRef.current?.clientWidth || 200) / W
  const onDown = e => { e.currentTarget.setPointerCapture?.(e.pointerId); touch.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, sx: e.clientX, sy: e.clientY } }
  const onMove = e => {
    const T = touch.current
    if (!T) return
    const c = cellPx()
    while (e.clientX - T.x > c * 0.8) { act('right'); T.x += c * 0.8; T.moved = true }
    while (T.x - e.clientX > c * 0.8) { act('left'); T.x -= c * 0.8; T.moved = true }
    while (e.clientY - T.y > c) { act('down'); T.y += c; T.moved = true }
  }
  const onUp = e => {
    const T = touch.current
    touch.current = null
    if (!T) return
    const dy = e.clientY - T.sy, dt = performance.now() - T.t
    if (dy > 60 && dt < 260 && Math.abs(e.clientX - T.sx) < 50) act('drop')
    else if (!T.moved && dt < 300) act('rotate')
  }
  // hold-to-repeat buttons
  const repeat = useRef(0)
  const press = kind => e => {
    e.preventDefault(); act(kind)
    if (kind === 'left' || kind === 'right' || kind === 'down') { clearInterval(repeat.current); const t0 = setTimeout(() => { repeat.current = setInterval(() => act(kind), 60) }, 200); repeat.current = t0 }
  }
  const release = () => { clearTimeout(repeat.current); clearInterval(repeat.current) }


  useEffect(() => {
    if (!daily?.target || phase !== 'run') return
    if (hud.lines >= daily.target) daily.finish({ text: `🧱 בלוקים נופלים: ניקיתי ${hud.lines} שורות`, score: hud.lines, won: true })
  }, [hud.lines, phase, daily])
  useEffect(() => {
    if (phase !== 'over') return
    if (daily) { daily.finish({ text: `🧱 בלוקים נופלים: ${hud.score} נקודות, ${hud.lines} שורות`, score: -hud.score, won: !daily.target }); return }
    saveProgress(p => ({ best: Math.max(p.best, hud.score) }))
    if (hud.score) onReport?.({ text: `🧱 צברתי ${hud.score} נקודות וניקיתי ${hud.lines} שורות בבלוקים נופלים!` })
  }, [phase, hud.score, hud.lines, daily, saveProgress, onReport])

  // layout: board as tall as possible, side panel for "next"
  const padH = 66 // buttons row
  const cell = box.w ? Math.max(12, Math.min((box.h - padH - 8) / H, (box.w - 100) / W)) : 0
  const bw = Math.floor(cell * W), bh = Math.floor(cell * H)
  const ratio = Math.min(2, window.devicePixelRatio || 1)

  return (
    <div className="arc-game">
      <Hud stats={[['ניקוד', hud.score], ['שורות', daily?.target ? `${hud.lines}/${daily.target}` : hud.lines], ['רמה', hud.level]]}>
        <ToolButton onClick={togglePause} disabled={phase !== 'run' && phase !== 'pause'} label={phase === 'run' ? 'הפסקה' : 'המשך'}>{phase === 'run' ? '⏸️' : '▶️'}</ToolButton>
        <ToolButton onClick={newGame} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field fb-field" ref={boxRef}>
        <div className="fb-wrap">
          <canvas ref={canvasRef} className="fb-board" width={Math.round(bw * ratio)} height={Math.round(bh * ratio)} style={{ width: bw, height: bh }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { touch.current = null }}
            aria-label="לוח הבלוקים. גוררים הצידה להזזה, נגיעה לסיבוב, החלקה מהירה למטה להפלה" role="img" />
          <div className="fb-side">
            <span>הבא</span>
            <canvas ref={nextRef} className="fb-next" width={160} height={160} style={{ width: 64, height: 64 }} />
            {!daily && <span className="fb-best">שיא<br /><b>{Math.max(progress.best, hud.score)}</b></span>}
          </div>
          {(phase === 'ready' || phase === 'pause') && (
            <div className="sn-start">{phase === 'pause' ? '⏸️ הפסקה — לחצו ▶️ כדי להמשיך' : '👆 נגעו בלוח כדי להתחיל'}
              <small>גוררים הצידה = הזזה · נגיעה = סיבוב · החלקה מהירה למטה = הפלה{daily?.target ? ` · המטרה: ${daily.target} שורות` : ''}</small></div>
          )}
        </div>
      </div>
      <div className="fb-pad" onPointerUp={release} onPointerLeave={release} onPointerCancel={release}>
        <button type="button" className="sn-key" onPointerDown={press('rotate')} aria-label="סיבוב">⟳</button>
        <button type="button" className="sn-key" onPointerDown={press('left')} aria-label="שמאלה">◀</button>
        <button type="button" className="sn-key" onPointerDown={press('down')} aria-label="למטה">▼</button>
        <button type="button" className="sn-key" onPointerDown={press('right')} aria-label="ימינה">▶</button>
        <button type="button" className="sn-key fb-drop" onPointerDown={press('drop')} aria-label="הפלה">⤓</button>
      </div>
      {phase === 'over' && !daily && <EndCard title="🧱 הלוח התמלא!" text={`צברתם ${hud.score} נקודות וניקיתם ${hud.lines} שורות${hud.score > progress.best ? ' — שיא חדש! 🎉' : ''}.`}
        primary="🔄 משחק חדש" onPrimary={newGame}
        secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🧱 צברתי ${hud.score} נקודות בבלוקים נופלים! מי עובר אותי?`)} />}
    </div>
  )
}

function block(ctx, x, y, s, color, alpha = 1) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath(); ctx.roundRect(x + 1, y + 1, s - 2, s - 2, s * 0.18); ctx.fill()
  ctx.fillStyle = '#ffffff55'; ctx.beginPath(); ctx.roundRect(x + s * 0.16, y + s * 0.14, s * 0.68, s * 0.22, s * 0.1); ctx.fill()
  ctx.fillStyle = '#00000022'; ctx.fillRect(x + 2, y + s * 0.78, s - 4, s * 0.16)
  ctx.globalAlpha = 1
}

function draw(cv, G, dt) {
  if (!cv) return
  const ratio = cv.width / (cv.clientWidth || cv.width)
  const s = cv.clientWidth / W
  if (!s) return
  const ctx = cv.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.fillStyle = '#2c3350'; ctx.fillRect(0, 0, W * s, H * s)
  ctx.strokeStyle = '#ffffff10'; ctx.lineWidth = 1
  for (let x = 1; x < W; x++) { ctx.beginPath(); ctx.moveTo(x * s, 0); ctx.lineTo(x * s, H * s); ctx.stroke() }
  for (let y = 1; y < H; y++) { ctx.beginPath(); ctx.moveTo(0, y * s); ctx.lineTo(W * s, y * s); ctx.stroke() }
  G.board.forEach((row, y) => row.forEach((c, x) => { if (c) block(ctx, x * s, y * s, s, c) }))
  if (!G.over) {
    const d = dropDistance(G.board, G.piece)
    for (const [x, y] of cells({ ...G.piece, y: G.piece.y + d })) if (y >= 0) { ctx.strokeStyle = colorOf(G.piece.type); ctx.lineWidth = 2; ctx.globalAlpha = 0.6; ctx.strokeRect(x * s + 3, y * s + 3, s - 6, s - 6); ctx.globalAlpha = 1 }
  }
  for (const [x, y] of cells(G.piece)) if (y >= 0) block(ctx, x * s, y * s, s, G.over ? '#6b7280' : colorOf(G.piece.type))
  G.flash = G.flash.filter(f => (f.life -= dt / 260) > 0)
  for (const f of G.flash) { ctx.fillStyle = `rgba(255,255,255,${f.life * 0.8})`; ctx.fillRect(0, f.y * s, W * s, s) }
  G.fx = G.fx.filter(p => (p.life -= dt / 300) > 0)
  for (const p of G.fx) { ctx.fillStyle = `rgba(255,255,255,${p.life * 0.5})`; ctx.fillRect((p.x - 0.5) * s, (p.y - 0.5 - (1 - p.life)) * s, s, s) }
}

function drawNext(cv, type) {
  if (!cv) return
  const ctx = cv.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, cv.width, cv.height)
  if (!type) return
  const cs = cells({ type, rot: 0, x: 0, y: 0 })
  const xs = cs.map(c => c[0]), ys = cs.map(c => c[1])
  const w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1
  const s = 34, ox = (cv.width - w * s) / 2 - Math.min(...xs) * s, oy = (cv.height - h * s) / 2 - Math.min(...ys) * s
  for (const [x, y] of cs) block(ctx, ox + x * s, oy + y * s, s, colorOf(type))
}

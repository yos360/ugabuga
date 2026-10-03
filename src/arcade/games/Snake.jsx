import { useEffect, useRef, useState } from 'react'
import { start as startSnake, turn, step, speedFor, DIRS, POWERS, levelSpec, LEVEL_COUNT, LEVEL_NAMES, starsForTime } from '../logic/snake'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useBox, useProgress, useSwipe, useArrowKeys } from '../hooks'
import { Hud, ToolButton, EndCard, Stars } from '../ui'

// Snake: two modes (endless classic, 20-level journey), power-ups, combos, skins and
// sounds. The rules step cell by cell (logic/snake.js); the drawing glides between
// cells every animation frame, on a fixed clock that React renders can't disturb.

const SKINS = [
  { id: 'green', name: 'קלאסי', icon: '🟢', need: () => true, hint: '' },
  { id: 'rainbow', name: 'קשת', icon: '🌈', need: p => p.best >= 10 || p.unlocked > 3, hint: '10 תפוחים בקלאסי או שלב 3 במסע' },
  { id: 'tiger', name: 'נמר', icon: '🐯', need: p => p.best >= 20 || p.unlocked > 6, hint: '20 תפוחים בקלאסי או שלב 6 במסע' },
  { id: 'candy', name: 'סוכרייה', icon: '🍬', need: p => p.unlocked > 10, hint: 'שלב 10 במסע' },
  { id: 'galaxy', name: 'גלקסיה', icon: '🌌', need: p => p.best >= 40 || p.unlocked > 15, hint: '40 תפוחים בקלאסי או שלב 15 במסע' },
  { id: 'gold', name: 'זהב', icon: '👑', need: p => p.unlocked > LEVEL_COUNT, hint: 'לסיים את כל 20 השלבים' },
]

export default function Snake({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('snake', { best: 0, walls: false, unlocked: 1, stars: {}, skin: 'green' })
  const [boxRef, box] = useBox()
  const fieldRef = useRef(null)
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState(daily ? 'ready' : 'menu') // menu | ready | run | pause | dead | won
  const [mode, setMode] = useState('classic') // classic | journey
  const [level, setLevel] = useState(1)
  const [hud, setHud] = useState({ score: 0, eaten: 0, goal: 0 })
  const [result, setResult] = useState(null) // { record } | { stars, time }
  const [dims, setDims] = useState(null)
  const g = useRef(null)
  const phaseRef = useRef(phase)
  const boxSize = useRef(box)
  const opts = useRef({ walls: progress.walls, skin: progress.skin, best: progress.best })
  useEffect(() => { boxSize.current = box }, [box])
  useEffect(() => { opts.current = { walls: progress.walls, skin: progress.skin, best: progress.best } }, [progress.walls, progress.skin, progress.best])

  const setP = p => { phaseRef.current = p; setPhase(p) }
  const newGame = (m = mode, lv = level) => {
    const { w, h } = boxSize.current
    const rand = daily ? rng(daily.seed) : Math.random
    let s
    if (m === 'journey') {
      const spec = levelSpec(lv, w > h * 1.15)
      s = startSnake(spec.w, spec.h, rand, spec)
    } else {
      const cols = w < 520 ? 15 : 21
      const rows = Math.max(12, Math.min(30, Math.round((cols * (h - 8)) / Math.max(1, w - 8))))
      s = startSnake(cols, rows, rand)
    }
    g.current = { s, prev: s.body, acc: 0, rand, fx: [], pops: [], gulps: [], shake: 0, flash: 0, time: 0, walls: m === 'classic' && opts.current.walls }
    setMode(m); setLevel(lv); setDims({ w: s.w, h: s.h })
    setHud({ score: 0, eaten: 0, goal: s.goal }); setResult(null); setP('ready')
  }
  // first board once the field has a size (daily: straight in); new board if the screen turns before starting
  useEffect(() => {
    if (!box.w || !box.h) return
    if (daily && !g.current) newGame('classic', 1)
    else if (g.current && phaseRef.current === 'ready') newGame()
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
      if (!cv) return
      if (G && phaseRef.current === 'run') {
        G.acc += dt
        G.time += dt
        while (phaseRef.current === 'run' && G.acc >= speedFor(G.s.score, G.s)) {
          G.acc -= speedFor(G.s.score, G.s)
          G.prev = G.s.body
          const s = step(G.s, G.walls, G.rand)
          G.s = s
          G.gulps = G.gulps.map(a => a + 1).filter(a => a < s.body.length)
          const [hx, hy] = s.body[0]
          if (s.ate) {
            G.gulps.push(0)
            burst(G, hx, hy, s.ate === 'gold' ? '#ffcf33' : '#ff4d4d', 14)
            const mult = s.combo >= 3 ? 2 : 1
            G.pops.push({ x: hx + 0.5, y: hy, life: 1, text: `+${(s.ate === 'gold' ? 3 : 1) * mult}` })
            if (s.combo >= 3) G.pops.push({ x: s.w / 2, y: 1.2, life: 1.3, text: '🔥 קומבו ×2!', big: true })
            sfx(s.ate === 'gold' ? 'gold' : s.combo >= 3 ? 'combo' : 'eat')
            navigator.vibrate?.(12)
            setHud({ score: s.score, eaten: s.eaten, goal: s.goal })
          }
          if (s.got) {
            burst(G, hx, hy, '#8be9ff', 18)
            G.pops.push({ x: s.w / 2, y: 1.2, life: 1.3, text: `${POWERS[s.got].icon} ${POWERS[s.got].name}!`, big: true })
            sfx('power')
          }
          if (s.dead) {
            G.prev = s.body; G.shake = 1; G.flash = 1
            sfx('crash'); navigator.vibrate?.([60, 40, 60])
            setResult({ record: !s.goal && s.score > opts.current.best && s.score > 0 })
            phaseRef.current = 'dead'; setPhase('dead')
          } else if (s.won) {
            G.prev = s.body
            sfx('win')
            const sec = Math.round(G.time / 1000)
            setResult({ stars: starsForTime(sec, s.goal), time: sec })
            phaseRef.current = 'won'; setPhase('won')
          }
        }
      }
      if (G) draw(cv, G, phaseRef.current === 'run' ? Math.min(1, G.acc / speedFor(G.s.score, G.s)) : 1, dt, now, opts.current.skin)
    }
    raf = requestAnimationFrame(loop)
    const onVis = () => { if (document.hidden && phaseRef.current === 'run') { phaseRef.current = 'pause'; setPhase('pause') } }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  // results → progress / daily / share text
  useEffect(() => {
    if (phase === 'dead' && mode === 'classic') {
      if (daily) { daily.finish({ text: `🐍 נחש: הנחש שלי אכל ${hud.score} תפוחים`, score: -hud.score, won: true }); return }
      saveProgress(p => ({ best: Math.max(p.best, hud.score) }))
      if (hud.score) onReport?.({ text: `🐍 הנחש שלי אכל ${hud.score} תפוחים!` })
    }
    if (phase === 'won' && result?.stars) {
      saveProgress(p => ({ unlocked: Math.max(p.unlocked, level + 1), stars: { ...p.stars, [level]: Math.max(p.stars[level] || 0, result.stars) } }))
      onReport?.({ text: `🐍 עברתי את שלב ${level} ("${LEVEL_NAMES[level - 1]}") במסע הנחש!` })
    }
  }, [phase, mode, level, hud.score, result, daily, saveProgress, onReport])

  // Automated-test helper, only when localStorage 'buga-debug' is '1': read the game state.
  useEffect(() => {
    let debug = false
    try { debug = localStorage.getItem('buga-debug') === '1' } catch { /* ignore */ }
    if (!debug) return undefined
    window.__snake = () => g.current?.s
    return () => { delete window.__snake }
  }, [])

  const go = dir => {
    const G = g.current
    const p = phaseRef.current
    if (!G || p === 'dead' || p === 'won' || p === 'menu') return
    G.s = turn(G.s, dir)
    if (p !== 'run') { G.acc = 0; setP('run') }
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
  const toggleWalls = () => { const w = !progress.walls; saveProgress({ walls: w }); opts.current.walls = w; if (g.current) g.current.walls = w }
  const chooseSkin = id => { saveProgress({ skin: id }); opts.current.skin = id }

  // canvas: as big as the field allows, square cells
  const cell = dims && box.w ? Math.max(10, Math.min((box.w - 8) / dims.w, (box.h - 8) / dims.h)) : 0
  const W = dims ? Math.floor(cell * dims.w) : 0, H = dims ? Math.floor(cell * dims.h) : 0
  const ratio = dpr()
  const best = Math.max(progress.best, mode === 'classic' ? hud.score : 0)
  const stats = mode === 'journey'
    ? [['שלב', level], ['🍎', `${hud.eaten}/${hud.goal}`]]
    : [['🍎', hud.score], ['שיא', best]]
  const inGame = phase !== 'menu'

  return (
    <div className="arc-game">
      <Hud stats={stats}>
        {inGame && <ToolButton onClick={togglePause} disabled={phase !== 'run' && phase !== 'pause'} label={phase === 'run' ? 'הפסקה' : 'המשך'}>{phase === 'run' ? '⏸️' : '▶️'}</ToolButton>}
        {inGame && <ToolButton onClick={() => newGame()} label="מתחילים מחדש">🔄</ToolButton>}
        {!daily && inGame && <ToolButton onClick={() => setP('menu')} label="תפריט">🏠</ToolButton>}
      </Hud>
      <div className="arc-field sn-field" ref={el => { boxRef.current = el; fieldRef.current = el }}>
        <canvas ref={canvasRef} className="sn-canvas" width={Math.round(W * ratio)} height={Math.round(H * ratio)} style={{ width: W, height: H, visibility: dims ? 'visible' : 'hidden' }}
          aria-label="לוח הנחש. החליקו או לחצו על החצים כדי לכוון" role="img" />
        {(phase === 'ready' || phase === 'pause') && (
          <div className="sn-start">
            {phase === 'pause' ? '⏸️ הפסקה — החליקו או לחצו על חץ כדי להמשיך'
              : mode === 'journey' ? <>🗺️ שלב {level}: {LEVEL_NAMES[level - 1]}<br />אוכלים {hud.goal} תפוחים כדי לעבור · החליקו כדי להתחיל</> : '👆 החליקו לכיוון כלשהו כדי להתחיל'}
            <small>{mode === 'journey' ? '🪨 אסור לגעת בסלעים · ' : g.current?.walls ? '🧱 אסור לגעת בקיר · ' : '🌀 עוברים מצד לצד · '}תפוח זהב = 3 · 3 תפוחים ברצף מהר = קומבו ×2 · 🐢 👻 ✂️ עוזרים</small>
          </div>
        )}
        {phase === 'menu' && (
          <div className="sn-menu">
            <h3>🐍 נחש</h3>
            <div className="sn-modes">
              <button type="button" className="sn-mode" onClick={() => newGame('classic', 1)}>
                <b>🍎 קלאסי</b><small>אוכלים כמה שיותר · שיא: {progress.best}</small>
              </button>
              <button type="button" className="sn-mode is-journey" onClick={() => newGame('journey', Math.min(progress.unlocked, LEVEL_COUNT))}>
                <b>🗺️ מסע</b><small>20 שלבים עם סלעים · שלב {Math.min(progress.unlocked, LEVEL_COUNT)}</small>
              </button>
            </div>
            <div className="sn-levels" aria-label="בחירת שלב">
              {Array.from({ length: LEVEL_COUNT }, (_, i) => {
                const lv = i + 1, open = lv <= progress.unlocked
                return <button key={lv} type="button" disabled={!open} className={`sn-lv${progress.stars[lv] ? ' is-done' : ''}`} onClick={() => newGame('journey', lv)}
                  title={open ? LEVEL_NAMES[i] : 'נעול'} aria-label={open ? `שלב ${lv}: ${LEVEL_NAMES[i]}` : `שלב ${lv} נעול`}>
                  {open ? lv : '🔒'}<i>{'★'.repeat(progress.stars[lv] || 0)}</i>
                </button>
              })}
            </div>
            <div className="sn-skins" aria-label="סגנון נחש">
              {SKINS.map(s => {
                const open = s.need(progress)
                return <button key={s.id} type="button" disabled={!open} className={`sn-skin${progress.skin === s.id ? ' is-on' : ''}`} onClick={() => chooseSkin(s.id)} title={open ? s.name : `נפתח ב: ${s.hint}`}>
                  <span aria-hidden="true">{open ? s.icon : '🔒'}</span>{s.name}
                </button>
              })}
            </div>
            <button type="button" className="arc-chip" onClick={toggleWalls}>{progress.walls ? '🧱 קלאסי: קירות סגורים' : '🌀 קלאסי: קירות פתוחים'}</button>
          </div>
        )}
      </div>
      <div className="sn-pad" aria-label="חצים">
        <button type="button" className="sn-key sn-up" onPointerDown={e => { e.preventDefault(); go('up') }} aria-label="למעלה">▲</button>
        <button type="button" className="sn-key sn-left" onPointerDown={e => { e.preventDefault(); go('left') }} aria-label="שמאלה">◀</button>
        <button type="button" className="sn-key sn-down" onPointerDown={e => { e.preventDefault(); go('down') }} aria-label="למטה">▼</button>
        <button type="button" className="sn-key sn-right" onPointerDown={e => { e.preventDefault(); go('right') }} aria-label="ימינה">▶</button>
      </div>
      {phase === 'dead' && !daily && (mode === 'classic'
        ? <EndCard title="🐍 אוי, הנחש נתקע!" text={`אכלתם ${hud.score} תפוחים${result?.record ? ' — שיא חדש! 🎉' : ''}.`}
          primary="🔄 עוד סיבוב" onPrimary={() => newGame()}
          secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🐍 הנחש שלי אכל ${hud.score} תפוחים! מי עובר אותי?`)} />
        : <EndCard title="🪨 אאוץ'!" text={`שלב ${level}: אכלתם ${hud.eaten} מתוך ${hud.goal}. עוד ניסיון?`}
          primary="🔄 לנסות שוב" onPrimary={() => newGame()} secondary="🏠 לתפריט" onSecondary={() => setP('menu')} />)}
      {phase === 'won' && result && (
        <div className="arc-end" role="alertdialog" aria-label="השלב הושלם">
          <div className="arc-end-card">
            <h3>{level >= LEVEL_COUNT ? '🏆 סיימתם את כל המסע!' : `🎉 שלב ${level} הושלם!`}</h3>
            <Stars n={result.stars} />
            <p>{LEVEL_NAMES[level - 1]} · {result.time} שניות{result.stars < 3 ? ' · מהר יותר = יותר כוכבים' : ''}</p>
            <div className="arc-end-actions">
              {level < LEVEL_COUNT && <button type="button" className="arc-btn arc-btn-main" autoFocus onClick={() => newGame('journey', level + 1)}>▶ לשלב {level + 1}</button>}
              <button type="button" className="arc-btn" onClick={() => onShare?.(`🐍 עברתי את שלב ${level} במסע הנחש של עוגה בוגה עם ${result.stars} כוכבים! תצליחו?`)}>📱 שתפו</button>
              <button type="button" className="arc-btn" onClick={() => setP('menu')}>🏠 לתפריט</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function dpr() { return typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1) }
function burst(G, x, y, color, n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 3; G.fx.push({ x: x + 0.5, y: y + 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color }) }
}

// colors per skin: [outline, body, spots] for segment i of n
function skinColor(skin, i, n, now, dead) {
  if (dead) return ['#6b7280', '#9ca3af', '#d1d5db']
  switch (skin) {
    case 'rainbow': { const h = (i * 24 + now / 20) % 360; return [`hsl(${h} 70% 35%)`, `hsl(${h} 85% 58%)`, `hsl(${h} 90% 80%)`] }
    case 'tiger': return ['#7a3d00', i % 3 === 0 ? '#2b1a0a' : '#f59e0b', '#fde68a']
    case 'candy': return ['#b0306a', i % 2 ? '#ff8fc8' : '#ffffff', '#ff4fa3']
    case 'galaxy': return ['#1e1240', `hsl(${260 + Math.sin(i / 2) * 20} 55% 32%)`, '#fff8c4']
    case 'gold': return ['#8a6100', `hsl(46 ${85 + Math.sin(now / 200 + i) * 10}% 52%)`, '#fff5b8']
    default: return ['#1f7a52', '#37b97a', '#7fe0ae']
  }
}

// ---------- drawing ----------
function draw(cv, G, t, dt, now, skin) {
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
  // rocks
  for (const [rx, ry] of s.rocks || []) {
    const cx = (rx + 0.5) * cell, cy = (ry + 0.5) * cell
    ctx.fillStyle = '#5b6170'
    ctx.beginPath(); ctx.roundRect(rx * cell + cell * 0.06, ry * cell + cell * 0.1, cell * 0.88, cell * 0.84, cell * 0.28); ctx.fill()
    ctx.fillStyle = '#8a91a3'
    ctx.beginPath(); ctx.roundRect(rx * cell + cell * 0.1, ry * cell + cell * 0.08, cell * 0.8, cell * 0.66, cell * 0.25); ctx.fill()
    ctx.fillStyle = '#ffffff40'; ctx.beginPath(); ctx.arc(cx - cell * 0.15, cy - cell * 0.2, cell * 0.12, 0, Math.PI * 2); ctx.fill()
  }

  // apple (bobbing; a golden one glows)
  if (s.apple) {
    const [ax, ay, gold] = s.apple
    const bob = Math.sin(now / 220) * cell * 0.05
    const cx = (ax + 0.5) * cell, cy = (ay + 0.55) * cell + bob, r = cell * (gold ? 0.42 : 0.39)
    ctx.fillStyle = '#0000001f'
    ctx.beginPath(); ctx.ellipse(cx, (ay + 0.92) * cell, r * 0.8, r * 0.25, 0, 0, Math.PI * 2); ctx.fill()
    if (gold) { ctx.fillStyle = '#ffe58a80'; ctx.beginPath(); ctx.arc(cx, cy, r * (1.45 + Math.sin(now / 150) * 0.12), 0, Math.PI * 2); ctx.fill() }
    ctx.fillStyle = gold ? '#ffc61a' : '#ef3b3b'
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ffffff99'; ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = cell * 0.07; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.8); ctx.lineTo(cx + r * 0.15, cy - r * 1.3); ctx.stroke()
    ctx.fillStyle = '#3fae49'; ctx.beginPath(); ctx.ellipse(cx + r * 0.45, cy - r * 1.15, r * 0.38, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fill()
  }
  // power-up (blinks before it disappears)
  if (s.power && (s.power.ttl > 15 || Math.floor(now / 150) % 2)) {
    const px = (s.power.x + 0.5) * cell, py = (s.power.y + 0.5) * cell
    ctx.fillStyle = '#8be9ff55'; ctx.beginPath(); ctx.arc(px, py, cell * (0.6 + Math.sin(now / 130) * 0.06), 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, cell * 0.44, 0, Math.PI * 2); ctx.fill()
    ctx.font = `${cell * 0.62}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(POWERS[s.power.type].icon, px, py + cell * 0.04)
  }

  // snake: a path through the cell centers it occupied a moment ago, with the head gliding
  // into its new cell and the tail gliding out of its old one — corners stay square
  const center = ([x, y]) => [(x + 0.5) * cell, (y + 0.5) * cell]
  const glide = (from, to) => {
    let dx = to[0] - from[0], dy = to[1] - from[1]
    if (dx > 1) dx -= s.w; else if (dx < -1) dx += s.w // passing through a soft wall
    if (dy > 1) dy -= s.h; else if (dy < -1) dy += s.h
    return [(from[0] + dx * t + 0.5) * cell, (from[1] + dy * t + 0.5) * cell]
  }
  const prev = G.prev
  let pts
  if (prev === s.body || prev.length < 2) pts = s.body.map(center)
  else {
    const grew = s.body.length > prev.length
    pts = [glide(prev[0], s.body[0]), ...prev.slice(0, grew ? prev.length : -1).map(center)]
    if (!grew) pts.push(glide(prev[prev.length - 1], prev[prev.length - 2]))
  }
  const n = pts.length
  const dead = s.dead
  const ghost = s.fx?.ghost > 0
  ctx.globalAlpha = ghost ? 0.55 + Math.sin(now / 90) * 0.15 : 1
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const jump = i => Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) > cell * 1.5
  // tail to head, piece by piece, so every skin can color each segment
  for (const layer of [0, 1]) {
    for (let i = n - 1; i > 0; i--) {
      if (jump(i)) continue
      const [o, b] = skinColor(skin, i, n, now, dead)
      const taper = 1 - (i / n) * 0.25
      ctx.strokeStyle = layer ? b : o
      ctx.lineWidth = cell * (layer ? 0.62 : 0.78) * taper
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i - 1][0], pts[i - 1][1]); ctx.stroke()
    }
  }
  // gulps travelling down the body
  for (const a of G.gulps) {
    const i = Math.min(n - 1, a), [, b] = skinColor(skin, i, n, now, dead)
    ctx.fillStyle = b; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], cell * 0.44, 0, Math.PI * 2); ctx.fill()
  }
  pts.forEach(([x, y], i) => { if (i && i % 2 === 0) { ctx.fillStyle = skinColor(skin, i, n, now, dead)[2]; ctx.beginPath(); ctx.arc(x, y, cell * 0.1, 0, Math.PI * 2); ctx.fill() } })

  // head
  const [hx, hy] = pts[0]
  const [ddx, ddy] = DIRS[s.dir]
  const [ho, hb] = skinColor(skin, 0, n, now, dead)
  const near = s.apple && Math.abs(s.apple[0] - s.body[0][0]) + Math.abs(s.apple[1] - s.body[0][1]) <= 2
  ctx.fillStyle = ho; ctx.beginPath(); ctx.arc(hx, hy, cell * 0.47, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = hb; ctx.beginPath(); ctx.arc(hx, hy, cell * 0.39, 0, Math.PI * 2); ctx.fill()
  if (!dead && near) { // mouth opens next to an apple
    ctx.fillStyle = '#7a1f2b'; ctx.beginPath(); ctx.arc(hx + ddx * cell * 0.25, hy + ddy * cell * 0.25, cell * 0.16, 0, Math.PI * 2); ctx.fill()
  } else if (!dead && Math.sin(now / 160) > 0.55) { // tongue flick
    ctx.strokeStyle = '#e23b5a'; ctx.lineWidth = cell * 0.07
    const tx = hx + ddx * cell * 0.45, ty = hy + ddy * cell * 0.45
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + ddx * cell * 0.22, ty + ddy * cell * 0.22); ctx.stroke()
  }
  for (const side of [-1, 1]) { // eyes look where it's going
    const ex = hx - ddx * cell * 0.02 + (ddy ? side * cell * 0.2 : 0)
    const ey = hy - ddy * cell * 0.02 + (ddx ? side * cell * 0.2 : 0)
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, cell * 0.14, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1d2233'
    if (dead) { ctx.font = `900 ${cell * 0.26}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('×', ex, ey) }
    else { ctx.beginPath(); ctx.arc(ex + ddx * cell * 0.05, ey + ddy * cell * 0.05, cell * 0.07, 0, Math.PI * 2); ctx.fill() }
  }
  ctx.direction = 'ltr'
  if (skin === 'gold' && !dead) { ctx.font = `${cell * 0.5}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👑', hx - ddx * cell * 0.1, hy - cell * 0.5) }
  ctx.globalAlpha = 1

  // sparkles and pop texts
  G.fx = G.fx.filter(p => (p.life -= dt / 600) > 0)
  for (const p of G.fx) {
    p.x += (p.vx * dt) / 1000; p.y += (p.vy * dt) / 1000
    ctx.globalAlpha = p.life; ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x * cell, p.y * cell, cell * 0.1 * p.life + 1, 0, Math.PI * 2); ctx.fill()
  }
  G.pops = G.pops.filter(p => (p.life -= dt / 800) > 0)
  for (const p of G.pops) {
    ctx.globalAlpha = Math.min(1, p.life * 1.6)
    ctx.font = `900 ${cell * (p.big ? 0.75 : 0.6)}px Fredoka, Heebo, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const py = (p.y - (1.3 - p.life) * (p.big ? 0.8 : 1.2)) * cell
    ctx.direction = p.big ? 'rtl' : 'ltr' // the page is RTL; "+1" must not turn into "1+"
    if (p.big) { ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(p.text, p.x * cell, py) }
    ctx.fillStyle = '#1d2233'
    ctx.fillText(p.text, p.x * cell, py)
  }
  ctx.globalAlpha = 1
  ctx.restore()

  // active power-ups: badges with a draining bar
  let bx = 6
  for (const [k, total] of [['slow', POWERS.slow.steps], ['ghost', POWERS.ghost.steps]]) {
    const left = s.fx?.[k] || 0
    if (!left) continue
    ctx.fillStyle = '#ffffffdd'; ctx.beginPath(); ctx.roundRect(bx, 6, 64, 26, 13); ctx.fill()
    ctx.font = '16px serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1d2233'; ctx.fillText(POWERS[k].icon, bx + 6, 19)
    ctx.fillStyle = '#d4d8e2'; ctx.fillRect(bx + 28, 16, 30, 6)
    ctx.fillStyle = k === 'slow' ? '#22a06b' : '#7c5cff'; ctx.fillRect(bx + 28, 16, 30 * (left / total), 6)
    bx += 70
  }
  if (G.flash > 0) { ctx.fillStyle = `rgba(255,80,80,${G.flash * 0.35})`; ctx.fillRect(0, 0, W, H); G.flash = Math.max(0, G.flash - dt / 500) }
}

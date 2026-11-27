import { useEffect, useRef, useState } from 'react'
import { startRace, stepRace, moveLane, scoreOf, LANES, PLAYER_Y, START_LIVES } from '../logic/carRace'
import { sfx, buzz } from '../sfx'
import { useBox, useProgress, useSwipe, useArrowKeys } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import './car-race.css'

// Car race: a top-down road with three lanes. Steer left and right, dodge the obstacles,
// grab the stars. The road gets faster the longer you drive. Drawn with shapes and emoji
// on a canvas; the rules live in logic/carRace.js.

const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawCar(ctx, cx, cy, w, h) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = '#1d2233' // wheels
  for (const sx of [-1, 1]) for (const sy of [-0.55, 0.55]) { roundRect(ctx, sx * w * 0.5 - w * 0.09, sy * h * 0.5 - h * 0.1, w * 0.18, h * 0.2, w * 0.05); ctx.fill() }
  ctx.fillStyle = '#ef4444'
  roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.3); ctx.fill()
  ctx.lineWidth = Math.max(2, w * 0.05); ctx.strokeStyle = '#1d2233'; ctx.stroke()
  ctx.fillStyle = '#bfe6ff' // windshield and rear window
  roundRect(ctx, -w * 0.34, -h * 0.2, w * 0.68, h * 0.2, w * 0.08); ctx.fill()
  roundRect(ctx, -w * 0.3, h * 0.17, w * 0.6, h * 0.12, w * 0.06); ctx.fill()
  ctx.fillStyle = '#fff3a8' // headlights
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * w * 0.3, -h * 0.43, w * 0.08, 0, Math.PI * 2); ctx.fill() }
  ctx.fillStyle = '#fff' // racing stripe
  ctx.fillRect(-w * 0.06, -h * 0.5, w * 0.12, h * 0.28)
  ctx.restore()
}

function draw(ctx, W, H, G, gentle) {
  const s = G.s
  const roadW = W * 0.84, roadX = (W - roadW) / 2, laneW = roadW / LANES
  ctx.clearRect(0, 0, W, H)
  const shake = G.shake > 0 && !gentle ? (Math.random() - 0.5) * 8 * G.shake : 0
  ctx.save(); ctx.translate(shake, 0)
  ctx.fillStyle = '#8fd694'; ctx.fillRect(-10, 0, W + 20, H)
  ctx.fillStyle = '#6b7280'; ctx.fillRect(roadX, 0, roadW, H)
  ctx.fillStyle = '#fff'; ctx.fillRect(roadX - 4, 0, 4, H); ctx.fillRect(roadX + roadW, 0, 4, H)
  // scrolling lane dashes
  const period = H * 0.16
  const off = ((s.dist / 100) * H) % period
  ctx.fillStyle = '#f5f5f5'
  for (let i = 1; i < LANES; i++) for (let y = -period + off; y < H; y += period) ctx.fillRect(roadX + laneW * i - 3, y, 6, period * 0.5)
  // roadside trees (not with reduced motion)
  if (!gentle) {
    ctx.font = `${Math.round(laneW * 0.5)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const tp = H * 0.33
    const to = ((s.dist / 100) * H) % tp
    for (let y = -tp + to; y < H + tp; y += tp) { ctx.fillText('🌲', roadX / 2, y); ctx.fillText('🌳', W - roadX / 2, y + tp / 2) }
  }
  // stars and obstacles
  ctx.font = `${Math.round(laneW * 0.58)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  for (const o of s.objs) ctx.fillText(o.face, roadX + laneW * (o.lane + 0.5), o.y * H)
  // the player's car, gliding between lanes
  const carW = laneW * 0.5, carH = carW * 1.75
  const blink = s.invincible > 0 && !gentle && Math.floor(s.invincible * 10) % 2 === 0
  ctx.globalAlpha = s.invincible > 0 ? (gentle ? 0.6 : blink ? 0.35 : 1) : 1
  drawCar(ctx, roadX + laneW * (G.x + 0.5), PLAYER_Y * H, carW, carH)
  ctx.globalAlpha = 1
  for (const f of G.pops) { ctx.globalAlpha = Math.max(0, 1 - f.t / 0.7); ctx.font = `bold ${Math.round(laneW * 0.3)}px sans-serif`; ctx.fillStyle = f.color; ctx.fillText(f.text, roadX + laneW * (f.lane + 0.5), (f.y - f.t * 0.12) * H) }
  ctx.globalAlpha = 1
  ctx.restore()
}

export default function CarRace({ onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('car-race', { best: 0 })
  const [boxRef, box] = useBox()
  const canvasRef = useRef(null)
  const gentle = useRef(reduced())
  const [phase, setPhase] = useState('ready') // ready | run | over
  const phaseRef = useRef('ready')
  const [hud, setHud] = useState({ score: 0, lives: START_LIVES, stars: 0 })
  const [result, setResult] = useState(null)
  const g = useRef({ s: startRace(gentle.current), x: 1, shake: 0, pops: [], rand: Math.random, last: { score: -1, lives: -1, stars: -1 } })
  const bestBefore = useRef(progress.best)
  const sizeRef = useRef({ W: 0, H: 0 })

  const setP = p => { phaseRef.current = p; setPhase(p) }
  const start = () => {
    gentle.current = reduced()
    g.current = { s: startRace(gentle.current), x: 1, shake: 0, pops: [], rand: Math.random, last: { score: -1, lives: -1, stars: -1 } }
    bestBefore.current = progress.best
    setHud({ score: 0, lives: START_LIVES, stars: 0 }); setResult(null)
    setP('run')
  }
  const steer = dir => {
    if (phaseRef.current === 'ready') { start(); return }
    if (phaseRef.current !== 'run') return
    const G = g.current
    const next = moveLane(G.s, dir)
    if (next.lane !== G.s.lane) { G.s = next; sfx('slide') }
  }
  useArrowKeys(dir => { if (dir === 'left' || dir === 'right') steer(dir) })
  useSwipe(boxRef, dir => { if (dir === 'left' || dir === 'right') steer(dir) }, 24)
  useEffect(() => {
    const onKey = e => { if ((e.key === ' ' || e.key === 'Enter') && phaseRef.current === 'ready' && !e.target.closest?.('button')) { e.preventDefault(); start() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start() reads the latest progress each call
  }, [progress.best])

  // canvas size: a road-shaped column that fits the free space
  const cw = Math.max(0, Math.floor(Math.min(box.w, box.h * 0.72)))
  const ch = Math.max(0, Math.floor(box.h))
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv || !cw || !ch) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr)
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    sizeRef.current = { W: cw, H: ch }
  }, [cw, ch])

  // one animation loop for the whole life of the game
  useEffect(() => {
    let raf = 0, last = performance.now()
    const loop = now => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const cv = canvasRef.current, G = g.current
      const { W, H } = sizeRef.current
      if (!cv || !W) return
      if (phaseRef.current === 'run') {
        G.s = stepRace(G.s, dt, G.rand)
        G.x += (G.s.lane - G.x) * Math.min(1, dt * 14)
        G.shake = Math.max(0, G.shake - dt * 3)
        G.pops = G.pops.map(p => ({ ...p, t: p.t + dt })).filter(p => p.t < 0.7)
        for (const e of G.s.events) {
          if (e === 'star') { sfx('gold'); buzz(12); G.pops.push({ t: 0, lane: G.s.lane, y: PLAYER_Y - 0.1, text: '+10', color: '#facc15' }) }
          if (e === 'crash') { sfx('crash'); buzz(60); G.shake = 1; G.pops.push({ t: 0, lane: G.s.lane, y: PLAYER_Y - 0.1, text: '💥', color: '#ef4444' }) }
        }
        const score = scoreOf(G.s)
        if (score !== G.last.score || G.s.lives !== G.last.lives || G.s.stars !== G.last.stars) {
          G.last = { score, lives: G.s.lives, stars: G.s.stars }
          setHud({ score, lives: G.s.lives, stars: G.s.stars })
        }
        if (G.s.over) {
          const record = score > bestBefore.current
          saveProgress(p => ({ best: Math.max(p.best || 0, score) }))
          setResult({ score, stars: G.s.stars, record })
          setP('over')
          if (score) onReport?.({ text: en ? `🏎️ I scored ${score} in Car Race!` : `🏎️ צברתי ${score} נקודות במרוץ מכוניות!` })
        }
      }
      draw(cv.getContext('2d'), W, H, G, gentle.current)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [saveProgress, onReport, en])

  const best = Math.max(progress.best || 0, hud.score)
  return (
    <div className="arc-game cr-game">
      <Hud stats={[[en ? 'Score' : 'ניקוד', hud.score], ['⭐', hud.stars], [en ? 'Best' : 'שיא', best]]}>
        <span className="cr-lives" role="img" aria-label={en ? `${hud.lives} lives` : `${hud.lives} לבבות`}>{Array.from({ length: START_LIVES }, (_, i) => <span key={i} className={i < hud.lives ? 'on' : ''}>{i < hud.lives ? '❤️' : '🖤'}</span>)}</span>
        <ToolButton onClick={start} label={en ? 'New race' : 'מרוץ חדש'}>🔄</ToolButton>
      </Hud>
      <div className="arc-field cr-field" ref={boxRef}>
        <canvas ref={canvasRef} className="cr-canvas" style={{ width: cw, height: ch }} role="img" aria-label={en ? 'Road with three lanes' : 'כביש עם שלושה נתיבים'} />
        {phase === 'ready' && (
          <div className="sn-start cr-start">🏎️ {en ? 'Tap to start!' : 'לחצו כדי להתחיל!'}
            <small>{en ? 'Steer with the arrows, a swipe or the buttons · dodge 🚧🪨🚙 · grab ⭐' : 'מכוונים עם החצים, החלקה או הכפתורים · מתחמקים מ־🚧🪨🚙 · אוספים ⭐'}</small>
            <button type="button" className="arc-btn arc-btn-main" onClick={start}>{en ? 'Go!' : 'יוצאים!'}</button>
          </div>
        )}
      </div>
      <div className="cr-pad" dir="ltr">
        <button type="button" className="cr-key" aria-label={en ? 'Steer left' : 'פנייה שמאלה'} onPointerDown={e => { e.preventDefault(); steer('left') }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); steer('left') } }}>◀</button>
        <button type="button" className="cr-key" aria-label={en ? 'Steer right' : 'פנייה ימינה'} onPointerDown={e => { e.preventDefault(); steer('right') }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); steer('right') } }}>▶</button>
      </div>
      {phase === 'over' && result && (
        <EndCard lang={lang} title={en ? '🏁 The race is over!' : '🏁 המרוץ נגמר!'}
          text={en ? `You scored ${result.score} points and collected ${result.stars} stars${result.record ? ' - a new best! 🎉' : ''}.` : `צברתם ${result.score} נקודות ואספתם ${result.stars} כוכבים${result.record ? ' — שיא חדש! 🎉' : ''}.`}
          primary={en ? '🏎️ Race again' : '🏎️ עוד מרוץ'} onPrimary={start}
          secondary={en ? '📱 Share your score' : '📱 שתפו את הניקוד'} onSecondary={() => onShare?.(en ? `🏎️ I scored ${result.score} in Car Race! Can you beat me?` : `🏎️ צברתי ${result.score} נקודות במרוץ מכוניות! מצליחים לעקוף אותי?`)} />
      )}
    </div>
  )
}

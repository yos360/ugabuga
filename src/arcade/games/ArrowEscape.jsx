import { useEffect, useState } from 'react'
import { buildLevel, blocker, freeTiles, WORLDS, PER_WORLD, LEVEL_COUNT, worldOf } from '../logic/arrows'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, LevelMap } from '../ui'

// Arrows escape: tap a tile and it slides off the board in its arrow's direction — if the way is clear.
const COLORS = ['#ffd36e', '#ff9ec3', '#7fdcb0', '#8fcaff', '#c9a8ff']
const ROT = { right: 0, down: 90, left: 180, up: 270 }
const VEC = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }
const LIVES = 3

export default function ArrowEscape({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('arrow-escape', { level: 1, stars: {} })
  const [level, setLevel] = useState(daily?.level ?? progress.level)
  const [run, setRun] = useState(0)
  const [board, setBoard] = useState(() => buildLevel(daily?.level ?? progress.level))
  const [flying, setFlying] = useState(() => new Set())
  const [bump, setBump] = useState(null) // { id, block, k }
  const [hintId, setHintId] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [won, setWon] = useState(false)
  const [map, setMap] = useState(false)
  const [boxRef, box] = useBox()
  const lost = mistakes >= LIVES

  useEffect(() => { setBoard(buildLevel(level)); setFlying(new Set()); setMistakes(0); setWon(false); setHintId(null) }, [level, run])

  const left = board.tiles.filter(t => !t.gone && !flying.has(t.id)).length
  const cell = Math.max(22, Math.min(70, Math.floor(Math.min((box.w - 24) / board.w, (box.h - 24) / board.h))))
  const W = cell * board.w, H = cell * board.h

  const tap = t => {
    if (won || lost || t.gone || flying.has(t.id)) return
    setHintId(null)
    const live = board.tiles.map(x => (flying.has(x.id) ? { ...x, gone: true } : x))
    const b = blocker(live, t)
    if (!b) {
      setFlying(f => new Set(f).add(t.id))
      setTimeout(() => {
        t.gone = true
        setFlying(f => { const n = new Set(f); n.delete(t.id); return n })
        if (board.tiles.every(x => x.gone)) setWon(true)
      }, 420)
    } else {
      setMistakes(m => m + 1)
      setBump({ id: t.id, block: b.id, k: Date.now() })
    }
  }
  const hint = () => {
    const live = board.tiles.map(x => (flying.has(x.id) ? { ...x, gone: true } : x))
    const f = freeTiles(live)
    if (f.length) setHintId(f[Math.floor(Math.random() * f.length)].id)
  }
  const start = n => { setLevel(n); setRun(r => r + 1) }
  const stars = Math.max(1, LIVES - mistakes)

  useEffect(() => {
    if (!won) return
    if (daily) { daily.finish({ text: `➡️ חיצים בורחים: פיניתי את הלוח עם ${LIVES - mistakes} ${LIVES - mistakes === 1 ? 'לב' : 'לבבות'}`, score: mistakes, won: true }); return }
    saveProgress(p => ({ level: Math.max(p.level, level + 1), stars: { ...(p.stars || {}), [level]: Math.max((p.stars || {})[level] || 0, Math.max(1, LIVES - mistakes)) } }))
    onReport?.({ text: `🏆 עברתי את שלב ${level} בחיצים בורחים${mistakes ? '' : ' בלי אף טעות'}! מי מנצח אותי?` })
  }, [won, level, mistakes, saveProgress, onReport, daily])

  // Automated-test helper (localStorage 'buga-debug' = '1'): taps one free tile.
  useEffect(() => {
    let debug = false
    try { debug = localStorage.getItem('buga-debug') === '1' } catch { /* ignore */ }
    if (!debug) return undefined
    window.__arrowsStep = () => { const f = freeTiles(board.tiles); if (f[0]) tap(f[0]); return !!f[0] }
    return () => { delete window.__arrowsStep }
  })

  const wld = worldOf(level)
  return (
    <div className="arc-game ae-game">
      <Hud stats={[['שלב', `${level} ${wld.emoji}`], ['נשארו', left], ['', <span key="h" className="fc-hearts" aria-label={`${LIVES - mistakes} לבבות`}>{Array.from({ length: LIVES }, (_, i) => <span key={i} className={i < LIVES - mistakes ? 'on' : ''}>♥</span>)}</span>]]}>
        {!daily && <ToolButton onClick={() => setMap(true)} label="מפת שלבים">🗺️</ToolButton>}
        <ToolButton onClick={hint} label="רמז">💡</ToolButton>
        <ToolButton onClick={() => start(level)} label="שלב מחדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field ae-field" ref={boxRef}>
        {box.w > 0 && <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="ae-board" role="img" aria-label={`לוח של ${left} חיצים`} style={{ overflow: 'visible' }}>
          {board.tiles.map(t => {
            if (t.gone) return null
            const fly = flying.has(t.id), [vx, vy] = VEC[t.d], far = (board.w + board.h) * cell
            const isBump = bump && bump.id === t.id, isBlock = bump && bump.block === t.id
            const p = cell * 0.06, s = cell - p * 2
            return <g key={isBump || isBlock ? `${t.id}-${bump.k}` : t.id} className={`ae-tile ${isBump ? 'is-bump' : ''} ${isBlock ? 'is-block' : ''} ${hintId === t.id ? 'is-hint' : ''}`}
              style={{ transform: `translate(${t.x * cell + (fly ? vx * far : 0)}px, ${t.y * cell + (fly ? vy * far : 0)}px)`, opacity: fly ? 0 : 1, '--bx': `${vx * cell * 0.18}px`, '--by': `${vy * cell * 0.18}px` }}
              onPointerDown={e => { e.preventDefault(); tap(t) }}>
              <rect x={p} y={p} width={s} height={s} rx={s * 0.22} fill={COLORS[t.color]} stroke="#25304f" strokeWidth={Math.max(1.2, cell * 0.035)} />
              <g transform={`translate(${cell / 2} ${cell / 2}) rotate(${ROT[t.d]}) scale(${cell / 100})`}>
                <path d="M-26 -9 H6 V-22 L30 0 L6 22 V9 H-26 Z" fill="#25304f" />
              </g>
            </g>
          })}
        </svg>}
        <p className="fc-help" aria-hidden="true">👆 לוחצים על חץ שהדרך שלו פנויה</p>
      </div>
      {map && <LevelMap count={Math.max(LEVEL_COUNT, Math.ceil(progress.level / PER_WORLD) * PER_WORLD)} perWorld={PER_WORLD} worlds={WORLDS} unlocked={progress.level} stars={progress.stars} current={level}
        onPick={n => { setMap(false); start(n) }} onClose={() => setMap(false)} />}
      {lost && !won && <EndCard title="💔 נגמרו הלבבות" text="שלוש פעמים לחצתם על חץ חסום. מנסים שוב? טיפ: התחילו מהחיצים שבשוליים שמצביעים החוצה."
        primary="🔄 לנסות שוב" onPrimary={() => start(level)} />}
      {won && !daily && <EndCard title={stars === 3 ? '🎉 מושלם!' : '🎉 כל הכבוד!'} stars={stars}
        text={mistakes ? `פיניתם את כל הלוח ונשארו לכם ${LIVES - mistakes} ${LIVES - mistakes === 1 ? 'לב' : 'לבבות'}.` : 'פיניתם הכול בלי לאבד אף לב!'}
        primary="▶ לשלב הבא" onPrimary={() => start(level + 1)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🏆 עברתי את שלב ${level} בחיצים בורחים! מי מנצח אותי?`)} />}
    </div>
  )
}

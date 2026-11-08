import { useEffect, useMemo, useRef, useState } from 'react'
import { spotLevel, hitDiff, spotStars, SPOT_LEVELS, SPOT_THEMES } from '../../../arcade/logic/spotDiff'
import { useBox, useProgress } from '../../../arcade/hooks'
import { Hud, ToolButton, EndCard } from '../../../arcade/ui'
import { sfx, buzz } from '../../../arcade/sfx'
import SpotDiffPanel from '../../../components/ui/SpotDiffPanel'

// English find-the-differences: same levels and logic as the Hebrew game (shared progress key).
const THEME_EN = { animals: 'animals', space: 'space', birthday: 'birthday', vehicles: 'vehicles', football: 'soccer', unicorn: 'unicorns', sea: 'the sea', garden: 'the garden', food: 'food', winter: 'winter' }

export default function SpotDiffEn({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('find-differences', { unlocked: 1, stars: {}, best: {} })
  const [phase, setPhase] = useState('menu') // menu | play | won
  const [level, setLevel] = useState(Math.min(progress.unlocked, SPOT_LEVELS))
  const [found, setFound] = useState([])
  const [time, setTime] = useState(0)
  const [misses, setMisses] = useState(0)
  const [hints, setHints] = useState(0)
  const [hint, setHint] = useState(null)
  const [miss, setMiss] = useState(null)
  const [boxRef, box] = useBox()
  const timers = useRef([])
  const data = useMemo(() => spotLevel(level), [level])
  const themeName = THEME_EN[data.theme] || data.theme

  useEffect(() => {
    if (phase !== 'play') return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [phase])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const open = lv => { setLevel(lv); setFound([]); setTime(0); setMisses(0); setHints(0); setHint(null); setMiss(null); setPhase('play'); sfx('pick') }
  const tap = which => (x, y) => {
    if (phase !== 'play') return
    const i = hitDiff(data.diffs, found, x, y)
    if (i < 0) { setMisses(m => m + 1); setMiss({ which, x, y, k: Date.now() }); sfx('bump'); buzz(25); return }
    const next = [...found, i]
    setFound(next); setHint(null); sfx('match'); buzz(20)
    if (next.length === data.diffs.length) {
      const stars = spotStars(time, misses, hints)
      saveProgress(p => ({
        unlocked: Math.max(p.unlocked, level + 1),
        stars: { ...p.stars, [level]: Math.max(p.stars?.[level] || 0, stars) },
        best: { ...p.best, [level]: Math.min(p.best?.[level] ?? Infinity, time) },
      }))
      onReport?.({ text: `🔎 I found ${data.diffs.length} differences on level ${level} in ${time} seconds!` })
      later(() => setPhase('won'), 900)
    }
  }
  const askHint = () => {
    const i = data.diffs.findIndex((_, k) => !found.includes(k))
    if (i < 0) return
    setHints(h => h + 1); setHint(i); sfx('power')
    later(() => setHint(null), 2500)
  }

  const wide = box.w > box.h * 1.1
  const marks = which => [
    ...found.map(i => data.diffs[i]),
    ...(hint != null ? [{ ...data.diffs[hint], r: data.diffs[hint].r * 1.8, color: '#f59e0b' }] : []),
    ...(miss && miss.which === which ? [{ x: miss.x, y: miss.y, r: 2.2, color: '#94a3b8' }] : []),
  ]
  const left = data.diffs.length - found.length
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

  return (
    <div className="arc-game">
      <Hud stats={[['Level', level], ['🔎', `${found.length}/${data.diffs.length}`], ['⏱️', time], ['❌', misses]]}>
        {phase === 'play' && <ToolButton onClick={askHint} disabled={time < 10 || hint != null} label="Hint">💡</ToolButton>}
        {phase !== 'menu' && <ToolButton onClick={() => setPhase('menu')} label="Levels">🏠</ToolButton>}
      </Hud>
      <div className="arc-field" ref={boxRef} style={{ overflow: 'auto' }}>
        {phase === 'menu' && (
          <div className="fb-menu">
            <h3>🔎 Find the differences</h3>
            <p>Two pictures that look almost the same. Tap everything that changed, in either picture. Every level has more things and more differences.</p>
            <div className="fb-levels" aria-label="Choose a level">
              {Array.from({ length: SPOT_LEVELS }, (_, i) => {
                const lv = i + 1, ok = lv <= progress.unlocked, th = spotLevel(lv).theme, t = SPOT_THEMES[th]
                return <button key={lv} type="button" disabled={!ok} className={`fb-lv${progress.stars?.[lv] ? ' is-done' : ''}`} onClick={() => open(lv)}
                  aria-label={ok ? `Level ${lv}, ${THEME_EN[th] || th}` : `Level ${lv}, locked`}>
                  <span aria-hidden="true">{ok ? t.icon : '🔒'}</span>{lv}<i>{'★'.repeat(progress.stars?.[lv] || 0)}</i>
                </button>
              })}
            </div>
          </div>
        )}
        {phase !== 'menu' && (
          <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr', gap: 10, padding: 8, width: '100%', boxSizing: 'border-box', maxWidth: Math.max(260, wide ? Math.min(box.w, 2 * (box.h - 24) / 0.7 + 26) : Math.min(box.w, (box.h - 34) / 2 / 0.7 + 16)), margin: 'auto' }}>
            <SpotDiffPanel data={data} which="base" marks={marks('base')} onTap={tap('base')} label={`First picture, theme: ${themeName}`} />
            <SpotDiffPanel data={data} which="changed" marks={marks('changed')} onTap={tap('changed')} label="Second picture, with differences" />
          </div>
        )}
      </div>
      {phase === 'play' && <p className="fb-tip" aria-live="polite">{hint != null ? '💡 There is a difference inside the orange circle' : left === 1 ? 'Just one more difference!' : `${left} differences to go`}</p>}
      {phase === 'won' && <EndCard lang="en" title="🎉 You found every difference!" stars={spotStars(time, misses, hints)}
        text={`${time} seconds, ${misses === 0 ? 'no mistakes' : plural(misses, 'mistake', 'mistakes')}${hints ? `, ${plural(hints, 'hint', 'hints')}` : ''}.`}
        primary={level < SPOT_LEVELS ? `▶ Level ${level + 1}` : '🏠 All levels'}
        onPrimary={() => (level < SPOT_LEVELS ? open(level + 1) : setPhase('menu'))}
        secondary="📱 Challenge a friend"
        onSecondary={() => onShare?.(`🔎 I found all ${data.diffs.length} differences on level ${level} in ${time} seconds! Can you do it faster?`)} />}
    </div>
  )
}

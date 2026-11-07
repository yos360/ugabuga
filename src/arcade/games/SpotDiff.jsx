import { useEffect, useMemo, useRef, useState } from 'react'
import { spotLevel, hitDiff, spotStars, SPOT_LEVELS, SPOT_THEMES } from '../logic/spotDiff'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { sfx, buzz } from '../sfx'
import SpotDiffPanel from '../../components/ui/SpotDiffPanel'

// Find the differences: two pictures, tap what changed in either one. 18 levels,
// 3 → 7 differences. The pictures sit side by side on wide screens, one above the other on phones.
export default function SpotDiff({ onReport, onShare }) {
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
  const theme = SPOT_THEMES[data.theme]

  useEffect(() => {
    if (phase !== 'play') return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [phase])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const open = lv => { setLevel(lv); setFound([]); setTime(0); setMisses(0); setHints(0); setHint(null); setMiss(null); setPhase('play'); sfx('pick') }
  const tap = (which) => (x, y) => {
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
      onReport?.({ text: `🔎 מצאתי ${data.diffs.length} הבדלים בשלב ${level} ב־${time} שניות!` })
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

  return (
    <div className="arc-game">
      <Hud stats={[['שלב', level], ['🔎', `${found.length}/${data.diffs.length}`], ['⏱️', time], ['❌', misses]]}>
        {phase === 'play' && <ToolButton onClick={askHint} disabled={time < 10 || hint != null} label="רמז">💡</ToolButton>}
        {phase !== 'menu' && <ToolButton onClick={() => setPhase('menu')} label="שלבים">🏠</ToolButton>}
      </Hud>
      <div className="arc-field" ref={boxRef} style={{ overflow: 'auto' }}>
        {phase === 'menu' && (
          <div className="fb-menu">
            <h3>🔎 מצאו את ההבדלים</h3>
            <p>שתי תמונות כמעט זהות. לוחצים על כל מה שהשתנה, באחת מהן. בכל שלב יש יותר פריטים ויותר הבדלים.</p>
            <div className="fb-levels" aria-label="בחירת שלב">
              {Array.from({ length: SPOT_LEVELS }, (_, i) => {
                const lv = i + 1, ok = lv <= progress.unlocked, t = SPOT_THEMES[spotLevel(lv).theme]
                return <button key={lv} type="button" disabled={!ok} className={`fb-lv${progress.stars?.[lv] ? ' is-done' : ''}`} onClick={() => open(lv)}
                  aria-label={ok ? `שלב ${lv}, ${t.he}` : `שלב ${lv} נעול`}>
                  <span aria-hidden="true">{ok ? t.icon : '🔒'}</span>{lv}<i>{'★'.repeat(progress.stars?.[lv] || 0)}</i>
                </button>
              })}
            </div>
          </div>
        )}
        {phase !== 'menu' && (
          <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr', gap: 10, padding: 8, width: '100%', boxSizing: 'border-box', maxWidth: Math.max(260, wide ? Math.min(box.w, 2 * (box.h - 24) / 0.7 + 26) : Math.min(box.w, (box.h - 34) / 2 / 0.7 + 16)), margin: 'auto' }}>
            <SpotDiffPanel data={data} which="base" marks={marks('base')} onTap={tap('base')} label={`תמונה ראשונה, נושא ${theme.he}`} />
            <SpotDiffPanel data={data} which="changed" marks={marks('changed')} onTap={tap('changed')} label="תמונה שנייה, עם הבדלים" />
          </div>
        )}
      </div>
      {phase === 'play' && <p className="fb-tip" aria-live="polite">{hint != null ? '💡 יש הבדל בתוך העיגול הכתום' : left === 1 ? 'נשאר עוד הבדל אחד!' : `נשארו עוד ${left} הבדלים`}</p>}
      {phase === 'won' && <EndCard title="🎉 מצאתם את כל ההבדלים!" stars={spotStars(time, misses, hints)}
        text={`${time} שניות, ${misses === 0 ? 'בלי טעויות' : misses === 1 ? 'טעות אחת' : `${misses} טעויות`}${hints ? `, ${hints === 1 ? 'רמז אחד' : `${hints} רמזים`}` : ''}.`}
        primary={level < SPOT_LEVELS ? `▶ לשלב ${level + 1}` : '🏠 לכל השלבים'}
        onPrimary={() => (level < SPOT_LEVELS ? open(level + 1) : setPhase('menu'))}
        secondary="📱 אתגרו חבר"
        onSecondary={() => onShare?.(`🔎 מצאתי את כל ${data.diffs.length} ההבדלים בשלב ${level} ב־${time} שניות! תצליחו מהר יותר?`)} />}
    </div>
  )
}

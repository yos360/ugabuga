import { useEffect, useMemo, useRef, useState } from 'react'
import { build, levelSpec, starsFor, LEVEL_COUNT, SCENES } from '../logic/findBuga'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { sfx, buzz } from '../sfx'

// Find Buga: a busy scene full of emoji with the yellow Buga mascot (and its blue parrot)
// hidden in it. 12 levels across six scenes; zoom in to search, a hint after a while.
// The scene fills the field; positions are percent, sizes follow its shorter side.
const PICS = { park: 'home-mascot-play', beach: 'home-mascot-family', party: 'home-mascot-birthday', space: 'home-mascot-play', city: 'home-mascot-class', jungle: 'home-mascot-family' }
const picFor = scene => `/images/${PICS[scene.id] || 'home-mascot-play'}.webp`
const ZOOMS = [1, 1.6, 2.4]

export default function FindBuga({ onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('find-buga', { unlocked: 1, stars: {}, best: {} })
  const [phase, setPhase] = useState('menu') // menu | intro | play | found | won
  const [level, setLevel] = useState(Math.min(progress.unlocked, LEVEL_COUNT))
  const [time, setTime] = useState(0)
  const [misses, setMisses] = useState(0)
  const [miss, setMiss] = useState(null) // last wrong tap {x, y, k}
  const [hint, setHint] = useState(null) // {x, y} while the hint ring shows
  const [usedHint, setUsedHint] = useState(false)
  const [zoom, setZoom] = useState(0)
  const [boxRef, box] = useBox()
  const scrollRef = useRef(null)
  const bestBefore = useRef(null)
  const timers = useRef([])
  const world = useMemo(() => build(level), [level])
  const { scene, buga, items } = world
  const name = en ? scene.en : scene.he

  useEffect(() => {
    if (phase !== 'play') return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [phase])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const stars = starsFor(time, usedHint, misses)
  const record = phase === 'won' && bestBefore.current != null && time < bestBefore.current

  const open = lv => {
    bestBefore.current = progress.best?.[lv] ?? null
    setLevel(lv); setTime(0); setMisses(0); setMiss(null); setHint(null); setUsedHint(false); setZoom(0)
    setPhase('intro')
  }
  const found = e => {
    e.stopPropagation()
    if (phase !== 'play') return
    setPhase('found'); setHint(null)
    sfx('match'); buzz([20, 40, 20])
    saveProgress(p => ({
      unlocked: Math.max(p.unlocked, level + 1),
      stars: { ...p.stars, [level]: Math.max(p.stars?.[level] || 0, starsFor(time, usedHint, misses)) },
      best: { ...p.best, [level]: Math.min(p.best?.[level] ?? Infinity, time) },
    }))
    onReport?.({ text: en ? `🔎 I found Buga ${scene.en} in ${time} seconds!` : `🔎 מצאתי את בוגה ${scene.he} ב־${time} שניות!` })
    later(() => setPhase('won'), 1300)
  }
  const wrong = e => {
    if (phase !== 'play') return
    const r = e.currentTarget.getBoundingClientRect()
    setMiss({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, k: Date.now() })
    setMisses(m => m + 1)
    sfx('bump'); buzz(25)
  }
  const askHint = () => {
    if (phase !== 'play') return
    setUsedHint(true)
    // a ring around a spot near Buga, not right on it
    const a = Math.random() * Math.PI * 2, d = 4 + Math.random() * 6
    setHint({ x: buga.x + Math.cos(a) * d, y: buga.y + Math.sin(a) * d, k: Date.now() })
    sfx('power')
    later(() => setHint(null), 3000)
  }
  const changeZoom = dir => {
    const z = Math.max(0, Math.min(ZOOMS.length - 1, zoom + dir))
    if (z === zoom) return
    const el = scrollRef.current
    if (el) { // keep the middle of the view in the middle
      const f = ZOOMS[z] / ZOOMS[zoom]
      const cx = el.scrollLeft + el.clientWidth / 2, cy = el.scrollTop + el.clientHeight / 2
      requestAnimationFrame(() => { el.scrollLeft = cx * f - el.clientWidth / 2; el.scrollTop = cy * f - el.clientHeight / 2 })
    }
    setZoom(z); sfx('tick')
  }

  const W = Math.max(200, box.w - 16), H = Math.max(200, box.h - 16) // field padding + scroll border
  const unit = Math.min(W, H) * ZOOMS[zoom] / 100 // px per "size percent"
  const pic = picFor(scene)
  const playing = phase === 'play' || phase === 'found'

  return (
    <div className="arc-game">
      <Hud stats={[[en ? 'Level' : 'שלב', level], ['⏱️', time], ['❌', misses], [en ? 'Best' : 'שיא', progress.best?.[level] != null ? `${progress.best[level]}″` : '—']]}>
        {playing && <ToolButton onClick={() => changeZoom(1)} disabled={zoom === ZOOMS.length - 1} label={en ? 'Zoom in' : 'הגדלה'}>➕</ToolButton>}
        {playing && <ToolButton onClick={() => changeZoom(-1)} disabled={zoom === 0} label={en ? 'Zoom out' : 'הקטנה'}>➖</ToolButton>}
        {playing && <ToolButton onClick={askHint} disabled={phase !== 'play' || time < 12 || !!hint} label={en ? 'Hint' : 'רמז'}>💡</ToolButton>}
        {phase !== 'menu' && <ToolButton onClick={() => setPhase('menu')} label={en ? 'Levels' : 'שלבים'}>🏠</ToolButton>}
      </Hud>
      <div className="arc-field fb-field" ref={boxRef}>
        {phase === 'menu' && (
          <div className="fb-menu">
            <img className="fb-menu-buga" src="/images/home-mascot-play.webp" alt="" width="420" height="404" />
            <h3>{en ? '🔎 Find Buga!' : '🔎 מצאו את בוגה!'}</h3>
            <p>{en ? 'Buga, the yellow one with the blue parrot, is hiding in a busy picture. Can you spot it?' : 'בוגה הצהוב עם התוכי הכחול מתחבא בתוך תמונה עמוסה. תצליחו למצוא אותו?'}</p>
            <div className="fb-levels" aria-label={en ? 'Choose a level' : 'בחירת שלב'}>
              {Array.from({ length: LEVEL_COUNT }, (_, i) => {
                const lv = i + 1, ok = lv <= progress.unlocked, sc = levelSpec(lv).scene
                return <button key={lv} type="button" disabled={!ok} className={`fb-lv${progress.stars?.[lv] ? ' is-done' : ''}`} onClick={() => open(lv)}
                  aria-label={ok ? (en ? `Level ${lv}, ${sc.en}` : `שלב ${lv}, ${sc.he}`) : (en ? `Level ${lv} locked` : `שלב ${lv} נעול`)}>
                  <span aria-hidden="true">{ok ? sc.icon : '🔒'}</span>{lv}<i>{'★'.repeat(progress.stars?.[lv] || 0)}</i>
                </button>
              })}
            </div>
          </div>
        )}
        {phase === 'intro' && (
          <div className="fb-intro">
            <img src={pic} alt="" width="420" height="384" />
            <h3>{en ? `Level ${level}: Buga is hiding ${name}` : `שלב ${level}: בוגה מתחבא ${name}`}</h3>
            <p>{en ? 'Look for this Buga. Tap it when you find it! ➕ zooms in.' : 'מחפשים את הבוגה הזה. מצאתם? לוחצים עליו! ➕ מגדיל את התמונה.'}</p>
            <button type="button" className="arc-btn arc-btn-main" autoFocus onClick={() => { setPhase('play'); sfx('pick') }}>{en ? '🔎 Start looking!' : '🔎 יאללה, מחפשים!'}</button>
          </div>
        )}
        {playing && (
          <div className="fb-scroll" ref={scrollRef} dir="ltr">
            <div className={`fb-scene is-${scene.id}`} style={{ width: W * ZOOMS[zoom], height: H * ZOOMS[zoom] }} onClick={wrong} role="img"
              aria-label={en ? `A busy picture ${scene.en}. Buga is hiding somewhere` : `תמונה עמוסה ${scene.he}. בוגה מתחבא איפשהו`}>
              {items.map((it, i) => (
                <span key={i} className="fb-item" aria-hidden="true"
                  style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: it.s * unit, zIndex: it.z, transform: `translate(-50%, -50%) rotate(${it.r}deg)` }}>{it.e}</span>
              ))}
              <button type="button" className={`fb-buga${phase === 'found' ? ' is-found' : ''}`} onClick={found} aria-label={en ? 'Buga' : 'בוגה'}
                style={{ left: `${buga.x}%`, top: `${buga.y}%`, width: buga.s * unit * 1.15, height: buga.s * unit * 1.15 }}>
                <img src={pic} alt="" draggable="false" />
              </button>
              {miss && <span key={miss.k} className="fb-miss" style={{ left: `${miss.x}%`, top: `${miss.y}%` }} aria-hidden="true">❌</span>}
              {hint && <span key={hint.k} className="fb-hint" style={{ left: `${hint.x}%`, top: `${hint.y}%`, width: unit * 26, height: unit * 26 }} aria-hidden="true" />}
              {phase === 'found' && <span className="fb-ring" style={{ left: `${buga.x}%`, top: `${buga.y}%`, width: buga.s * unit * 2.2, height: buga.s * unit * 2.2 }} aria-hidden="true" />}
            </div>
          </div>
        )}
      </div>
      {phase === 'play' && <p className="fb-tip" aria-live="polite">{hint ? (en ? '💡 Buga is somewhere inside the ring!' : '💡 בוגה נמצא איפשהו בתוך העיגול!') : (en ? `🔎 Find Buga ${name}` : `🔎 מצאו את בוגה ${name}`)}</p>}
      {phase === 'won' && <EndCard lang={lang} title={en ? '🎉 You found Buga!' : '🎉 מצאתם את בוגה!'} stars={stars} record={record}
        text={en ? `${time} seconds, ${misses === 1 ? '1 miss' : `${misses} misses`}${usedHint ? ', with a hint' : ''}.${record ? ' A new best!' : ''}` : `${time} שניות, ${misses === 0 ? 'בלי טעויות' : misses === 1 ? 'טעות אחת' : `${misses} טעויות`}${usedHint ? ', עם רמז' : ''}.${record ? ' שיא חדש!' : ''}`}
        primary={level < LEVEL_COUNT ? (en ? `▶ Level ${level + 1}` : `▶ לשלב ${level + 1}`) : (en ? '🏠 All levels' : '🏠 לכל השלבים')}
        onPrimary={() => (level < LEVEL_COUNT ? open(level + 1) : setPhase('menu'))}
        secondary={en ? '📱 Challenge a friend' : '📱 אתגרו חבר'}
        onSecondary={() => onShare?.(en ? `🔎 I found Buga ${scene.en} in ${time} seconds (level ${level})! Can you find it faster?` : `🔎 מצאתי את בוגה ${scene.he} ב־${time} שניות (שלב ${level})! תצליחו מהר יותר?`)} />}
    </div>
  )
}

export { SCENES }

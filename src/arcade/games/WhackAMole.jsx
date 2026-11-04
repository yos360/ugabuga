import { useEffect, useRef, useState } from 'react'
import { rng } from '../logic/rng'
import { sfx, buzz } from '../sfx'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../ui'

// Whack-a-mole: hit the hamsters 🐹 (a crowned one is worth 3), never the bunny 🐰.
// A rare ⏰ adds 3 seconds. They pop up faster and faster until the time is up.
const HOLES = 9
const KINDS = { mole: { face: '🐹', pts: 1 }, gold: { face: '🐹', pts: 3, crown: true }, bunny: { face: '🐰', pts: -2 }, clock: { face: '⏰', pts: 0, bonus: 3000 } }
// speed: how long a critter stays up (×), round length in seconds
const SPEEDS = { easy: { up: 1.4, sec: 45 }, normal: { up: 1, sec: 45 }, fast: { up: 0.72, sec: 40 } }
const SPEED_NAMES = { easy: ['🐢 קל', '🐢 Easy'], normal: ['🐹 רגיל', '🐹 Normal'], fast: ['⚡ מהיר', '⚡ Fast'] }

export default function WhackAMole({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  // `best` (before speeds existed) counts as the normal-speed record
  const [progress, saveProgress] = useProgress('whack-a-mole', { best: 0, speed: 'normal', bests: {} })
  const [speed, setSpeed] = useState(daily ? 'normal' : SPEEDS[progress.speed] ? progress.speed : 'normal')
  const best = speed === 'normal' ? Math.max(progress.best || 0, progress.bests?.normal || 0) : progress.bests?.[speed] || 0
  const roundSec = daily?.target ? 35 : SPEEDS[speed].sec
  const [hammer, setHammer] = useState(null) // { i, k }
  const [shake, setShake] = useState(false)
  const [holes, setHoles] = useState(() => Array(HOLES).fill(null)) // { kind, until, id, hit }
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [combo, setCombo] = useState(0)
  const [left, setLeft] = useState(roundSec * 1000)
  const [phase, setPhase] = useState('ready') // ready | run | over
  const [booms, setBooms] = useState([])
  const [boxRef, box] = useBox()
  const rand = useRef(Math.random)
  const ids = useRef(1)
  const live = useRef({ holes: Array(HOLES).fill(null), left: roundSec * 1000 }) // the clock works on this

  // the record to beat this round (the saved one changes as soon as the round ends)
  const bestBefore = useRef(best)
  const start = () => {
    bestBefore.current = best
    rand.current = daily ? rng(daily.seed) : Math.random
    live.current = { holes: Array(HOLES).fill(null), left: roundSec * 1000 }
    setHoles(live.current.holes); setScore(0); setHits(0); setCombo(0); setLeft(roundSec * 1000); setBooms([])
    setPhase('run')
  }

  // the clock: spawn, expire, count down
  useEffect(() => {
    if (phase !== 'run') return undefined
    const t = setInterval(() => {
      const L = live.current
      L.left -= 100
      if (L.left <= 0) { L.left = 0; setLeft(0); setPhase('over'); return }
      if (L.left <= 5000 && L.left % 1000 === 0) sfx('tick') // the last five seconds tick
      L.elapsed = (L.elapsed || 0) + 100
      const progressed = Math.min(1, L.elapsed / (roundSec * 1000)) // 0 → 1 during the round (bonus time does not slow it down)
      const up = SPEEDS[speed].up
      const now = performance.now()
      let missed = false
      const next = L.holes.map(h => {
        if (h && now > h.until) { if ((h.kind === 'mole' || h.kind === 'gold') && !h.hit) missed = true; return null }
        return h
      })
      const active = next.filter(Boolean).length
      const want = progressed < 0.3 ? 1 : progressed < 0.7 ? 2 : 3
      if (active < want && rand.current() < 0.35 + progressed * 0.3) {
        const free = next.map((h, i) => (h ? -1 : i)).filter(i => i >= 0)
        const i = free[Math.floor(rand.current() * free.length)]
        const r = rand.current()
        const clockUp = next.some(h => h?.kind === 'clock')
        const kind = r < 0.035 && progressed > 0.2 && !clockUp ? 'clock' : r < 0.1 ? 'gold' : r < 0.22 + progressed * 0.08 ? 'bunny' : 'mole'
        next[i] = { kind, id: ids.current++, until: now + (1250 - progressed * 600) * up * (kind === 'gold' || kind === 'clock' ? 0.75 : 1) }
      }
      L.holes = next
      setHoles(next); setLeft(L.left)
      if (missed) setCombo(0)
    }, 100)
    return () => clearInterval(t)
  }, [phase, roundSec, speed])

  const whack = i => {
    if (phase === 'ready') { start(); return }
    if (phase !== 'run') return
    const h = live.current.holes[i]
    if (!h || h.hit) return
    const k = KINDS[h.kind]
    live.current.holes = live.current.holes.map((x, j) => (j === i ? { ...x, hit: true, until: performance.now() + 260 } : x))
    setHoles(live.current.holes)
    setHammer({ i, k: h.id })
    if (k.bonus) {
      live.current.left += k.bonus
      setLeft(live.current.left)
      setBooms(b => [...b.slice(-5), { k: h.id, i, text: `+${k.bonus / 1000}s`, good: true }])
      sfx('power'); buzz(20)
      return
    }
    setBooms(b => [...b.slice(-5), { k: h.id, i, text: k.pts > 0 ? `+${k.pts * (combo >= 4 ? 2 : 1)}` : `${k.pts}` }])
    if (k.pts < 0) { setScore(s => Math.max(0, s + k.pts)); setCombo(0); sfx('crash'); buzz(60); setShake(true); setTimeout(() => setShake(false), 380); return }
    const mult = combo >= 4 ? 2 : 1
    setScore(s => s + k.pts * mult); setHits(n => n + 1); setCombo(c => c + 1)
    sfx(h.kind === 'gold' ? 'gold' : combo + 1 === 5 ? 'combo' : 'eat'); buzz(15)
  }
  const pickSpeed = v => { setSpeed(v); saveProgress({ speed: v }); setPhase('ready'); live.current = { holes: Array(HOLES).fill(null), left: SPEEDS[v].sec * 1000 }; setHoles(live.current.holes); setLeft(SPEEDS[v].sec * 1000) }

  // marathon goal: enough hits ends the stage right away
  useEffect(() => {
    if (daily?.target && phase === 'run' && hits >= daily.target) daily.finish({ text: en ? `🔨 Whack-a-Mole: ${hits} hits` : `🔨 הכה בחפרפרת: ${hits} פגיעות`, score: hits, won: true })
  }, [hits, phase, daily, en])
  useEffect(() => {
    if (phase !== 'over') return
    if (daily) { daily.finish({ text: en ? `🔨 Whack-a-Mole: ${score} points (${hits} hits)` : `🔨 הכה בחפרפרת: ${score} נקודות (${hits} פגיעות)`, score: -score, won: !daily.target }); return }
    saveProgress(p => ({ bests: { ...p.bests, [speed]: Math.max(p.bests?.[speed] || 0, speed === 'normal' ? p.best || 0 : 0, score) } }))
    if (score) onReport?.({ text: en ? `🔨 I whacked ${hits} moles and scored ${score} points!` : `🔨 הכיתי ${hits} חפרפרות וצברתי ${score} נקודות!` })
  }, [phase, score, hits, daily, saveProgress, onReport, en, speed])

  const size = Math.max(70, Math.min((box.w - 40) / 3, (box.h - 56) / 3, 170))
  const timePct = Math.min(100, (left / (roundSec * 1000)) * 100)
  return (
    <div className="arc-game">
      <Hud stats={[[en ? 'Score' : 'ניקוד', score], ['⏱️', Math.ceil(left / 1000)], daily?.target ? [en ? 'Hits' : 'פגיעות', `${hits}/${daily.target}`] : [en ? 'Best' : 'שיא', Math.max(best, score)]]}>
        <ToolButton onClick={start} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
      </Hud>
      {!daily && phase !== 'run' && <div className="wm-speed"><Segmented label={en ? 'Speed' : 'מהירות'} value={speed} onChange={pickSpeed}
        options={Object.keys(SPEEDS).map(v => [v, SPEED_NAMES[v][en ? 1 : 0]])} /></div>}
      <div className={`wm-timebar${left <= 5000 && phase === 'run' ? ' is-low' : ''}`} aria-hidden="true"><span style={{ width: `${timePct}%` }} /></div>
      {combo >= 4 && phase === 'run' && <p className="wm-combo">{en ? '🔥 Combo! Every hit ×2' : '🔥 קומבו! כל פגיעה ×2'}</p>}
      <div className={`arc-field wm-meadow${shake ? ' is-shake' : ''}`} ref={boxRef}>
        <div className="wm-grid" style={{ gridTemplateColumns: `repeat(3, ${size}px)` }}>
          {holes.map((h, i) => (
            <button key={i} type="button" className="wm-hole" style={{ width: size, height: size }} onPointerDown={e => { e.preventDefault(); whack(i) }}
              aria-label={h ? (h.kind === 'bunny' ? (en ? 'Bunny - do not whack!' : 'ארנב — לא להכות!') : h.kind === 'clock' ? (en ? 'Clock: 3 more seconds!' : 'שעון: עוד 3 שניות!') : (en ? 'Mole!' : 'חפרפרת!')) : (en ? 'Empty hole' : 'גומה ריקה')}>
              <span className="wm-pit" />
              <span key={h?.id} className={`wm-critter${h ? ' is-up' : ''}${h?.hit ? ' is-hit' : ''}`} style={{ fontSize: size * 0.5 }}>
                {h && <>{KINDS[h.kind].crown && <i className="wm-crown">👑</i>}{h.hit && (h.kind === 'mole' || h.kind === 'gold') ? '😵' : KINDS[h.kind].face}</>}
              </span>
              <span className="wm-front" />
              {hammer?.i === i && <span key={`h${hammer.k}`} className="wm-hammer" aria-hidden="true" style={{ fontSize: size * 0.42 }}>🔨</span>}
              {h?.hit && <span key={`p${h.id}`} className="wm-pow" aria-hidden="true" style={{ fontSize: size * 0.55 }}>{h.kind === 'bunny' ? '❌' : '💥'}</span>}
              {booms.filter(b => b.i === i).map(b => <span key={b.k} className={`wm-boom${b.text.startsWith('-') ? ' is-bad' : ''}${b.good ? ' is-time' : ''}`} onAnimationEnd={() => setBooms(bs => bs.filter(x => x.k !== b.k))}>{b.text}</span>)}
            </button>
          ))}
        </div>
        {phase === 'ready' && <div className="sn-start">{en ? '🔨 Tap a hole to start!' : '🔨 לחצו על גומה כדי להתחיל!'}<small>{en ? `🐹 = 1 · 👑🐹 = 3 · ⏰ = +3 seconds · 🐰 do not whack! (−2) · 5 in a row = combo ×2${daily?.target ? ` · Goal: ${daily.target} hits` : ''}` : `🐹 = 1 · 👑🐹 = 3 · ⏰ = עוד 3 שניות · 🐰 לא להכות! (−2) · 5 ברצף = קומבו ×2${daily?.target ? ` · המטרה: ${daily.target} פגיעות` : ''}`}</small></div>}
      </div>
      {phase === 'over' && !daily && <EndCard lang={lang} title={en ? '⏰ Time is up!' : '⏰ נגמר הזמן!'} text={en ? `You whacked ${hits} moles and scored ${score} points${score > bestBefore.current ? ' - a new best! 🎉' : ''}.` : `פגעתם ב־${hits} חפרפרות וצברתם ${score} נקודות${score > bestBefore.current ? ' — שיא חדש! 🎉' : ''}.`}
        primary={en ? '🔨 Another round' : '🔨 עוד סיבוב'} onPrimary={start}
        secondary={en ? '📱 Share your score' : '📱 שתפו את הניקוד'} onSecondary={() => onShare?.(en ? `🔨 I scored ${score} points in Whack-a-Mole! Who is faster?` : `🔨 צברתי ${score} נקודות בהכה בחפרפרת! מי מהיר יותר?`)} />}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// Whack-a-mole: hit the hamsters 🐹 (a crowned one is worth 3), never the bunny 🐰.
// They pop up faster and faster until the time is up.
const HOLES = 9
const KINDS = { mole: { face: '🐹', pts: 1 }, gold: { face: '🐹', pts: 3, crown: true }, bunny: { face: '🐰', pts: -2 } }

export default function WhackAMole({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('whack-a-mole', { best: 0 })
  const roundSec = daily?.target ? 35 : 45
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

  const start = () => {
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
      const progressed = 1 - L.left / (roundSec * 1000) // 0 → 1 during the round
      const now = performance.now()
      let missed = false
      const next = L.holes.map(h => {
        if (h && now > h.until) { if (h.kind !== 'bunny' && !h.hit) missed = true; return null }
        return h
      })
      const active = next.filter(Boolean).length
      const want = progressed < 0.3 ? 1 : progressed < 0.7 ? 2 : 3
      if (active < want && rand.current() < 0.35 + progressed * 0.3) {
        const free = next.map((h, i) => (h ? -1 : i)).filter(i => i >= 0)
        const i = free[Math.floor(rand.current() * free.length)]
        const r = rand.current()
        const kind = r < 0.1 ? 'gold' : r < 0.22 + progressed * 0.08 ? 'bunny' : 'mole'
        next[i] = { kind, id: ids.current++, until: now + (1250 - progressed * 600) * (kind === 'gold' ? 0.75 : 1) }
      }
      L.holes = next
      setHoles(next); setLeft(L.left)
      if (missed) setCombo(0)
    }, 100)
    return () => clearInterval(t)
  }, [phase, roundSec])

  const whack = i => {
    if (phase === 'ready') { start(); return }
    if (phase !== 'run') return
    const h = live.current.holes[i]
    if (!h || h.hit) return
    const k = KINDS[h.kind]
    live.current.holes = live.current.holes.map((x, j) => (j === i ? { ...x, hit: true, until: performance.now() + 260 } : x))
    setHoles(live.current.holes)
    setBooms(b => [...b.slice(-5), { k: h.id, i, text: k.pts > 0 ? `+${k.pts * (combo >= 4 ? 2 : 1)}` : `${k.pts}` }])
    if (k.pts < 0) { setScore(s => Math.max(0, s + k.pts)); setCombo(0); sfx('crash'); navigator.vibrate?.(60); return }
    const mult = combo >= 4 ? 2 : 1
    setScore(s => s + k.pts * mult); setHits(n => n + 1); setCombo(c => c + 1)
    sfx(h.kind === 'gold' ? 'gold' : 'eat'); navigator.vibrate?.(15)
  }

  // marathon goal: enough hits ends the stage right away
  useEffect(() => {
    if (daily?.target && phase === 'run' && hits >= daily.target) daily.finish({ text: `🔨 הכה בחפרפרת: ${hits} פגיעות`, score: hits, won: true })
  }, [hits, phase, daily])
  useEffect(() => {
    if (phase !== 'over') return
    if (daily) { daily.finish({ text: `🔨 הכה בחפרפרת: ${score} נקודות (${hits} פגיעות)`, score: -score, won: !daily.target }); return }
    saveProgress(p => ({ best: Math.max(p.best, score) }))
    if (score) onReport?.({ text: `🔨 הכיתי ${hits} חפרפרות וצברתי ${score} נקודות!` })
  }, [phase, score, hits, daily, saveProgress, onReport])

  const size = Math.max(70, Math.min((box.w - 40) / 3, (box.h - 40) / 3, 170))
  return (
    <div className="arc-game">
      <Hud stats={[['ניקוד', score], ['⏱️', Math.ceil(left / 1000)], daily?.target ? ['פגיעות', `${hits}/${daily.target}`] : ['שיא', Math.max(progress.best, score)]]}>
        <ToolButton onClick={start} label="משחק חדש">🔄</ToolButton>
      </Hud>
      {combo >= 4 && phase === 'run' && <p className="wm-combo">🔥 קומבו! כל פגיעה ×2</p>}
      <div className="arc-field" ref={boxRef}>
        <div className="wm-grid" style={{ gridTemplateColumns: `repeat(3, ${size}px)` }}>
          {holes.map((h, i) => (
            <button key={i} type="button" className="wm-hole" style={{ width: size, height: size }} onPointerDown={e => { e.preventDefault(); whack(i) }}
              aria-label={h ? (h.kind === 'bunny' ? 'ארנב — לא להכות!' : 'חפרפרת!') : 'גומה ריקה'}>
              <span className="wm-pit" />
              <span key={h?.id} className={`wm-critter${h ? ' is-up' : ''}${h?.hit ? ' is-hit' : ''}`} style={{ fontSize: size * 0.5 }}>
                {h && <>{KINDS[h.kind].crown && <i className="wm-crown">👑</i>}{h.hit && h.kind !== 'bunny' ? '😵' : KINDS[h.kind].face}</>}
              </span>
              <span className="wm-front" />
              {booms.filter(b => b.i === i).map(b => <span key={b.k} className={`wm-boom${b.text.startsWith('-') ? ' is-bad' : ''}`} onAnimationEnd={() => setBooms(bs => bs.filter(x => x.k !== b.k))}>{b.text}</span>)}
            </button>
          ))}
        </div>
        {phase === 'ready' && <div className="sn-start">🔨 לחצו על גומה כדי להתחיל!<small>🐹 = 1 · 👑🐹 = 3 · 🐰 לא להכות! (−2) · 5 ברצף = קומבו ×2{daily?.target ? ` · המטרה: ${daily.target} פגיעות` : ''}</small></div>}
      </div>
      {phase === 'over' && !daily && <EndCard title="⏰ נגמר הזמן!" text={`פגעתם ב־${hits} חפרפרות וצברתם ${score} נקודות${score > progress.best ? ' — שיא חדש! 🎉' : ''}.`}
        primary="🔨 עוד סיבוב" onPrimary={start}
        secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🔨 צברתי ${score} נקודות בהכה בחפרפרת! מי מהיר יותר?`)} />}
    </div>
  )
}

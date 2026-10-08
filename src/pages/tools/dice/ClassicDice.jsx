import { useEffect, useRef, useState } from 'react'
import './classic-dice.css'

// 3D dice for /tools/dice: 1–5 dice, a landing bounce, sound made with WebAudio (no files),
// a running tally and the last 10 rolls. After landing only the face that came up is shown,
// so no cube edges stick out.

const ROT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] }
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }
const COUNTS = [1, 2, 3, 4, 5]
const COLORS = ['#CF2F56', '#FFD95A', '#3EB8A5', '#8A6FE8', '#FF9D5C', '#14162D']

const randomFace = () => 1 + Math.floor(Math.random() * 6)

function Face({ n, up }) {
  return <div className={`cd-face cd-f${n} ${up ? 'is-up' : ''}`}>
    {Array.from({ length: 9 }, (_, c) => <span key={c} className={`cd-pip ${PIPS[n].includes(c) ? 'show' : ''}`} />)}
  </div>
}

export default function ClassicDice() {
  const [count, setCount] = useState(1)
  const [dice, setDice] = useState([{ x: 0, y: 0, v: 1, settled: true, landing: 0, dur: 1.05 }])
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState(null)
  const [pop, setPop] = useState(0)
  const [stats, setStats] = useState({ rolls: 0, best: 0, sixes: 0 })
  const [history, setHistory] = useState([])
  const [soundOn, setSoundOn] = useState(true)
  const audio = useRef(null)
  const timers = useRef([])
  const canvas = useRef(null)
  const confetti = useRef({ parts: [], anim: null })

  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    cancelAnimationFrame(confetti.current.anim)
  }, [])

  const pick = n => {
    if (rolling) return
    setCount(n)
    setDice(Array.from({ length: n }, () => ({ x: 0, y: 0, v: 1, settled: true, landing: 0, dur: 1.05 })))
  }

  const tick = (freq, when, dur, gain) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const actx = audio.current ||= new Ctx()
      const o = actx.createOscillator(), g = actx.createGain()
      o.type = 'triangle'; o.frequency.value = freq
      g.gain.setValueAtTime(gain, actx.currentTime + when)
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + when + dur)
      o.connect(g); g.connect(actx.destination)
      o.start(actx.currentTime + when); o.stop(actx.currentTime + when + dur + 0.02)
    } catch { /* no audio */ }
  }

  const burst = n => {
    const cv = canvas.current
    if (!cv) return
    cv.width = window.innerWidth; cv.height = window.innerHeight
    const c = confetti.current
    for (let i = 0; i < n; i++) {
      c.parts.push({
        x: cv.width / 2 + (Math.random() - 0.5) * cv.width * 0.5, y: cv.height * 0.35,
        vx: (Math.random() - 0.5) * 11, vy: -(4 + Math.random() * 9), w: 6 + Math.random() * 7, h: 8 + Math.random() * 8,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, color: COLORS[Math.floor(Math.random() * COLORS.length)], life: 120 + Math.random() * 60,
      })
    }
    const ctx = cv.getContext('2d')
    const step = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      c.parts = c.parts.filter(p => p.life > 0 && p.y < cv.height + 40)
      for (const p of c.parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.992; p.r += p.vr; p.life--
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore()
      }
      c.anim = c.parts.length ? requestAnimationFrame(step) : null
    }
    if (!c.anim) c.anim = requestAnimationFrame(step)
  }

  const roll = () => {
    if (rolling) return
    setRolling(true)
    if (soundOn) { for (let i = 0; i < 6; i++) tick(180 + Math.random() * 240, i * 0.09, 0.05, 0.12); tick(520, 0.75, 0.18, 0.2); tick(660, 0.95, 0.22, 0.18) }
    const vals = dice.map(randomFace)
    setDice(dice.map((d, i) => ({
      x: d.x - ROT[d.v][0] + 360 * (2 + Math.floor(Math.random() * 2)) + ROT[vals[i]][0],
      y: d.y - ROT[d.v][1] + 360 * (2 + Math.floor(Math.random() * 2)) + ROT[vals[i]][1],
      v: vals[i], settled: false, landing: d.landing, dur: 1.05 + i * 0.14,
    })))
    vals.forEach((_, i) => timers.current.push(setTimeout(() => setDice(ds => ds.map((d, j) => j === i ? { ...d, landing: d.landing + 1 } : d)), 650 + i * 140)))
    timers.current.push(setTimeout(() => {
      const sum = vals.reduce((a, b) => a + b, 0)
      const sixes = vals.filter(v => v === 6).length
      const allSame = vals.every(v => v === vals[0])
      setDice(ds => ds.map(d => ({ ...d, settled: true })))
      setRolling(false)
      setResult({ vals, sum, allSame })
      setPop(p => p + 1)
      setStats(s => ({ rolls: s.rolls + 1, best: Math.max(s.best, sum), sixes: s.sixes + sixes }))
      setHistory(h => [{ vals, sum, time: new Date() }, ...h].slice(0, 10))
      if (sixes === vals.length) { burst(140); if (soundOn) { tick(784, 0, 0.25, 0.25); tick(988, 0.18, 0.3, 0.25); tick(1319, 0.38, 0.45, 0.25) } }
      else if (vals.length > 1 && allSame) burst(60)
    }, 1150 + (vals.length - 1) * 140))
  }

  return <div className="cd" dir="rtl">
    <canvas ref={canvas} className="cd-confetti" aria-hidden="true" />
    <div className="cd-picker" role="radiogroup" aria-label="מספר קוביות">
      {COUNTS.map(n => <button key={n} type="button" role="radio" aria-checked={n === count} className={`cd-chip ${n === count ? 'on' : ''}`} onClick={() => pick(n)}>{n === 1 ? 'קובייה 1' : `${n} קוביות`}</button>)}
    </div>

    <div className="cd-arena" onClick={roll} title="לחצו להטלה" role="presentation">
      {dice.map((d, i) => <div key={i} className={`cd-box ${d.landing ? `landing-${d.landing % 2}` : ''}`}>
        <div className={`cd-die ${d.settled ? 'settled' : ''}`} style={{ transform: `rotateX(${d.x}deg) rotateY(${d.y}deg)`, transition: `transform ${d.dur}s cubic-bezier(.2,.75,.25,1.05)` }}>
          {[1, 2, 3, 4, 5, 6].map(n => <Face key={n} n={n} up={d.settled && n === d.v} />)}
        </div>
      </div>)}
    </div>

    <div className="cd-cta">
      <button type="button" className="cd-roll" onClick={roll} disabled={rolling}>🎲 הטילו!</button>
      <button type="button" className="cd-sound" onClick={() => setSoundOn(!soundOn)} aria-label={soundOn ? 'כיבוי צליל' : 'הפעלת צליל'} aria-pressed={soundOn}>{soundOn ? '🔊' : '🔇'}</button>
    </div>

    <div key={pop} className={`cd-result ${pop ? 'pop' : ''}`} aria-live="polite">
      {!result ? <span>מוכנים? לחצו <b>הטילו!</b> 🎲</span>
        : result.vals.length === 1 ? <><span>יצא:</span> <span className="cd-big">{result.sum}</span>{result.sum === 6 && ' 🎉'}</>
          : <><span>{result.vals.join(' + ')} =</span> <span className="cd-big">{result.sum}</span>{result.allSame && <span>כפולים! 🤩</span>}</>}
    </div>

    <div className="cd-stats">
      <div className="cd-stat"><div className="n">{stats.rolls}</div><div className="l">הטלות</div></div>
      <div className="cd-stat"><div className="n">{stats.best || '–'}</div><div className="l">סכום שיא</div></div>
      <div className="cd-stat"><div className="n">{stats.sixes}</div><div className="l">שישיות 🎉</div></div>
    </div>

    <div className="cd-hist">
      <h2>הטלות אחרונות</h2>
      <div className="cd-hist-list">
        {!history.length ? <div className="cd-empty">עוד לא הטלתם… הקוביות מחכות!</div>
          : history.map(h => <div key={h.time.getTime()} className="cd-hist-row">
            {h.vals.map((v, i) => <span key={i} className="cd-mini" title={`יצא ${v}`}>{v}</span>)}
            <span className="cd-hist-sum">{h.vals.length > 1 ? `סה״כ ${h.sum}` : `יצא ${h.sum}`}</span>
            <span className="cd-hist-time">{h.time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>)}
      </div>
    </div>
  </div>
}

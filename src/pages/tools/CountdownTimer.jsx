import { useState, useRef, useCallback, useEffect } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

function playAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const notes = [
    { f: 523, s: 0, d: 0.15 }, { f: 659, s: 0.15, d: 0.15 }, { f: 784, s: 0.3, d: 0.15 },
    { f: 1047, s: 0.45, d: 0.3 }, { f: 784, s: 0.8, d: 0.1 }, { f: 1047, s: 0.95, d: 0.4 },
  ]
  notes.forEach(n => {
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'; osc.frequency.value = n.f
    gain.gain.setValueAtTime(0.3, ctx.currentTime + n.s)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.s + n.d)
    osc.start(ctx.currentTime + n.s); osc.stop(ctx.currentTime + n.s + n.d)
  })
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400])
}

// Animated hand-drawn alarm clock that follows mouse with parallax + shakes near zero
function AlarmClock({ progress, ending, mouseX, mouseY }) {
  const tilt = ending ? 0 : mouseX * 6
  const tiltY = ending ? 0 : mouseY * 6
  const minuteAngle = progress * 360
  const hourAngle = progress * 30
  return (
    <div className={`transition-transform duration-150 ${ending ? 'timer-ending' : ''}`}
      style={{ transform: `perspective(600px) rotateY(${tilt}deg) rotateX(${-tiltY}deg)` }}>
      <svg viewBox="0 0 200 200" className="w-56 h-56 md:w-72 md:h-72 drop-shadow-[4px_6px_0px_var(--border)]">
        <ellipse cx="100" cy="110" rx="70" ry="66" fill="var(--card)" stroke="var(--border)" strokeWidth="5" transform="rotate(-1 100 110)" />
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
          const r1 = 58, r2 = a % 90 === 0 ? 50 : 54
          const x1 = 100 + r1 * Math.sin(a * Math.PI/180), y1 = 110 - r1 * Math.cos(a * Math.PI/180)
          const x2 = 100 + r2 * Math.sin(a * Math.PI/180), y2 = 110 - r2 * Math.cos(a * Math.PI/180)
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
        })}
        {/* Hour hand */}
        <line x1="100" y1="110" x2={100 + 32*Math.sin(hourAngle*Math.PI/180)} y2={110 - 32*Math.cos(hourAngle*Math.PI/180)} stroke="var(--border)" strokeWidth="4" strokeLinecap="round" />
        {/* Minute hand */}
        <line x1="100" y1="110" x2={100 + 46*Math.sin(minuteAngle*Math.PI/180)} y2={110 - 46*Math.cos(minuteAngle*Math.PI/180)} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="110" r="4" fill="var(--accent)" />
        {/* Bells */}
        <ellipse cx="52" cy="48" rx="20" ry="17" fill="none" stroke="var(--border)" strokeWidth="4" transform="rotate(-18 52 48)" />
        <ellipse cx="148" cy="48" rx="20" ry="17" fill="none" stroke="var(--border)" strokeWidth="4" transform="rotate(18 148 48)" />
        <line x1="62" y1="58" x2="78" y2="66" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
        <line x1="138" y1="58" x2="122" y2="66" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
        {/* Legs */}
        <line x1="70" y1="172" x2="58" y2="188" stroke="var(--border)" strokeWidth="4" strokeLinecap="round" />
        <line x1="130" y1="172" x2="142" y2="188" stroke="var(--border)" strokeWidth="4" strokeLinecap="round" />
        {/* Top button */}
        <circle cx="100" cy="42" r="6" fill="var(--postit)" stroke="var(--border)" strokeWidth="3" />
      </svg>
    </div>
  )
}

const PRESETS = [30, 60, 120, 300, 600, 900, 1800]
const presetLabel = s => s < 60 ? s + ' שניות' : (s/60) + ' דקות'

export default function CountdownTimer() {
  const [duration, setDuration] = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [running, setRunning] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  const progress = 1 - remaining / duration
  const ending = running && remaining <= 5 && remaining > 0
  const done = remaining === 0

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); setRunning(false); playAlarm(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = (secs) => { setDuration(secs); setRemaining(secs); setRunning(true) }
  const stop = () => { setRunning(false); clearInterval(intervalRef.current) }
  const reset = () => { setRunning(false); clearInterval(intervalRef.current); setRemaining(duration) }

  const onMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setMouse({ x, y })
  }, [])

  const mins = Math.floor(remaining / 60), secs = remaining % 60
  const barColor = progress < 0.5 ? 'var(--timer-go)' : progress < 0.75 ? 'var(--timer-warn)' : 'var(--timer-stop)'

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="טיימר למסיבה" description="טיימר אונליין עם שעון מעורר מונפש — לפעילויות, פנטומימה, ומשחקים." path="/tools/countdown-timer" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'טיימר' }]} />
      <h1 className="text-4xl text-center mb-8">⏱️ טיימר למסיבה</h1>

      <div ref={containerRef} onMouseMove={onMouseMove} className="flex flex-col items-center mb-6">
        <AlarmClock progress={progress} ending={ending} mouseX={mouse.x} mouseY={mouse.y} />
        <p dir="ltr" className="font-display text-5xl font-bold mt-4 tabular-nums">{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</p>
        {done && <p className="font-display text-2xl font-bold text-[var(--accent)] mt-2 buga-pop">⏰ נגמר הזמן!</p>}
      </div>

      {/* Progress bar */}
      <div className="wobbly-sm h-4 border-2 border-[var(--border)] bg-white overflow-hidden mb-6">
        <div className="h-full transition-all duration-1000" style={{ width: `${progress*100}%`, backgroundColor: barColor }} />
      </div>

      {!running ? (
        <>
          {remaining > 0 && remaining < duration && <div className="mb-4 flex justify-center gap-3"><button onClick={() => setRunning(true)} className="rounded-xl border-2 px-6 py-3 font-bold">▶ המשיכו</button><button onClick={reset} className="rounded-xl border-2 px-6 py-3 font-bold">איפוס</button></div>}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {PRESETS.map(s => (
              <button key={s} onClick={() => start(s)} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold cursor-pointer">{presetLabel(s)}</button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex justify-center gap-3">
          <button onClick={stop} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-6 py-3 font-display font-bold cursor-pointer">⏸ עצור</button>
          <button onClick={reset} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--accent)] text-white px-6 py-3 font-display font-bold cursor-pointer">🔄 איפוס</button>
        </div>
      )}

      <p className="text-center font-hand text-sm text-[var(--muted-foreground)] mt-6">💡 הזיזו את העכבר — השעון עוקב אחריו!</p>
    </div>
  )
}

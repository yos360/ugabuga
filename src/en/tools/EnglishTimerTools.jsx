// English countdown timer, stopwatch and scoreboard. Stopwatch math comes from the shared utils/stopwatch.
import { useEffect, useRef, useState } from 'react'
import ToolFrame from './ToolFrame'
import { Field, Panel, bigButtonClass, buttonClass, inputClass, copyText } from './ui'
import { addLap, elapsedTime, formatStopwatch, lapExtremes } from '../../utils/stopwatch'

function beep(times = 3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.45
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination)
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      o.start(t); o.stop(t + 0.4)
    }
    setTimeout(() => ctx.close(), times * 450 + 500)
  } catch { /* no audio available */ }
}

function useFullscreen(ref) {
  return () => {
    const el = ref.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen?.()
    else el.requestFullscreen?.().catch(() => {})
  }
}

// ── countdown ──
const clock = s => {
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60, p = n => String(n).padStart(2, '0')
  return h ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`
}
const PRESETS = [[30, '30 sec'], [60, '1 min'], [120, '2 min'], [300, '5 min'], [600, '10 min'], [900, '15 min'], [1800, '30 min']]
export function CountdownTimer() {
  const [minutes, setMinutes] = useState('5'), [seconds, setSeconds] = useState('0')
  const [total, setTotal] = useState(300), [left, setLeft] = useState(300), [endAt, setEndAt] = useState(null), [done, setDone] = useState(false), [sound, setSound] = useState(true)
  const box = useRef(null), full = useFullscreen(box)
  useEffect(() => {
    if (!endAt) return undefined
    const id = setInterval(() => {
      const rest = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      setLeft(rest)
      if (rest === 0) { setEndAt(null); setDone(true); if (sound) beep() }
    }, 200)
    return () => clearInterval(id)
  }, [endAt, sound])
  function set(s) { setEndAt(null); setDone(false); setTotal(s); setLeft(s); setMinutes(String(Math.floor(s / 60))); setSeconds(String(s % 60)) }
  function apply() {
    const s = Math.round((Number(minutes) || 0) * 60 + (Number(seconds) || 0))
    if (s > 0 && s <= 86400) set(s)
  }
  const start = () => { if (left > 0) { setDone(false); setEndAt(Date.now() + left * 1000) } }
  const pause = () => setEndAt(null)
  const pct = total ? left / total : 0
  return <ToolFrame path="/en/tools/countdown-timer" h1="⏱️ Online countdown timer" intro="A big, clear timer for the classroom, games, cooking and focus sessions, with an alarm at the end." width="max-w-3xl"
    faq={[
      { q: 'How do I set a 5 minute timer?', a: 'Press "5 min" and then Start. You can also type any number of minutes and seconds and press Set.' },
      { q: 'Will I hear when the time is up?', a: 'Yes, three beeps play when the timer reaches zero, as long as "Sound" is on and your device is not muted. The screen also turns red.' },
      { q: 'Can I show it on the classroom board?', a: 'Press "Full screen" to show only the timer, in huge numbers, on a projector or smart board.' },
      { q: 'Does it keep time if I switch tabs?', a: 'Yes. The timer works from the real end time, so it stays accurate even when the tab is in the background.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/stopwatch', label: 'stopwatch' }, { href: '/en/tools/scoreboard', label: 'scoreboard' }]}>
    <Panel label="Timer" className="text-center">
      <div ref={box} className={`flex flex-col items-center justify-center rounded-2xl p-6 ${done ? 'bg-red-500 text-white' : 'bg-[var(--postit)]'}`}>
        <p role="timer" aria-live={done ? 'assertive' : 'off'} className="font-black tabular-nums leading-none" style={{ fontSize: 'clamp(4rem, 18vw, 12rem)' }}>{done ? "Time's up!" : clock(left)}</p>
        <div className="mt-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-white/60"><div className="h-full bg-[#182139] transition-all" style={{ width: `${pct * 100}%` }} /></div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {endAt ? <button className={bigButtonClass} onClick={pause}>⏸ Pause</button> : <button className={bigButtonClass} onClick={start} disabled={left === 0}>▶ Start</button>}
        <button className={bigButtonClass} onClick={() => set(total)}>↺ Reset</button>
        <button className={buttonClass} onClick={full}>⛶ Full screen</button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">{PRESETS.map(([s, label]) => <button key={s} className={buttonClass} onClick={() => set(s)}>{label}</button>)}</div>
      <div className="flex flex-wrap items-end justify-center gap-3">
        <Field label="Minutes" type="number" min="0" max="1440" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-28" />
        <Field label="Seconds" type="number" min="0" max="59" value={seconds} onChange={e => setSeconds(e.target.value)} className="w-28" />
        <button className={buttonClass} onClick={apply}>Set</button>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Sound</label>
      </div>
    </Panel>
  </ToolFrame>
}

// ── stopwatch ──
export function Stopwatch() {
  const [acc, setAcc] = useState(0), [startedAt, setStartedAt] = useState(null), [now, setNow] = useState(() => Date.now()), [laps, setLaps] = useState([]), [copied, setCopied] = useState(false)
  const box = useRef(null), full = useFullscreen(box)
  useEffect(() => {
    if (startedAt === null) return undefined
    let raf
    const tick = () => { setNow(Date.now()); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [startedAt])
  const total = elapsedTime(acc, startedAt, now)
  const running = startedAt !== null
  const toggle = () => { const t = Date.now(); if (running) { setAcc(elapsedTime(acc, startedAt, t)); setStartedAt(null) } else setStartedAt(t); setNow(t) }
  const reset = () => { setAcc(0); setStartedAt(null); setLaps([]); setNow(Date.now()) }
  const { best, worst } = lapExtremes(laps)
  const text = ['Lap\tLap time\tTotal', ...laps.map(l => `${l.number}\t${formatStopwatch(l.duration)}\t${formatStopwatch(l.total)}`)].join('\n')
  return <ToolFrame path="/en/tools/stopwatch" h1="⏱️ Online stopwatch with laps" intro="Start, pause and record laps to the hundredth of a second. Full screen for races and classroom challenges." width="max-w-3xl"
    faq={[
      { q: 'How accurate is this stopwatch?', a: 'It shows hundredths of a second and works from your device clock, so it stays accurate even if the tab is in the background.' },
      { q: 'How do laps work?', a: 'Press Lap while the stopwatch runs. Each lap shows its own time and the running total, and the fastest and slowest laps are highlighted.' },
      { q: 'Can I keep the lap times?', a: 'Press "Copy laps" and paste them into a spreadsheet or a message. They are not saved anywhere else.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/countdown-timer', label: 'countdown timer' }, { href: '/en/tools/scoreboard', label: 'scoreboard' }]}>
    <Panel label="Stopwatch" className="text-center">
      <div ref={box} className="flex items-center justify-center rounded-2xl bg-[var(--postit)] p-6">
        <p role="timer" className="font-black tabular-nums leading-none" style={{ fontSize: 'clamp(3rem, 14vw, 10rem)' }}>{formatStopwatch(total)}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button className={bigButtonClass} onClick={toggle}>{running ? '⏸ Stop' : total ? '▶ Resume' : '▶ Start'}</button>
        <button className={bigButtonClass} onClick={() => setLaps(l => addLap(l, total))} disabled={!running}>🏁 Lap</button>
        <button className={bigButtonClass} onClick={reset} disabled={!total}>↺ Reset</button>
        <button className={buttonClass} onClick={full}>⛶ Full screen</button>
      </div>
      {laps.length > 0 && <>
        <table className="mx-auto w-full max-w-md text-left tabular-nums"><thead><tr><th>Lap</th><th>Lap time</th><th>Total</th></tr></thead>
          <tbody>{[...laps].reverse().map(l => <tr key={l.number} className={l.duration === best ? 'text-green-700 font-bold' : l.duration === worst ? 'text-red-700 font-bold' : ''}><td>{l.number}</td><td>{formatStopwatch(l.duration)}{l.duration === best ? ' (fastest)' : l.duration === worst ? ' (slowest)' : ''}</td><td>{formatStopwatch(l.total)}</td></tr>)}</tbody></table>
        <button className={buttonClass} onClick={async () => setCopied(await copyText(text))}>{copied ? 'Copied ✓' : 'Copy laps'}</button>
      </>}
    </Panel>
  </ToolFrame>
}

// ── scoreboard ──
const COLORS = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043', '#26c6da', '#ec407a']
export function Scoreboard() {
  const [teams, setTeams] = useState([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }])
  const [step, setStep] = useState('1')
  const box = useRef(null), full = useFullscreen(box)
  const inc = Number(step) || 1
  const update = (i, patch) => setTeams(ts => ts.map((t, j) => j === i ? { ...t, ...patch } : t))
  const top = Math.max(...teams.map(t => t.score))
  return <ToolFrame path="/en/tools/scoreboard" h1="🏆 Online scoreboard" intro="Keep score for teams in quizzes, classroom games and family game night. Big buttons, full screen, up to eight teams." width="max-w-5xl"
    faq={[
      { q: 'How many teams can I add?', a: 'Up to eight. Rename each team by tapping its name, and give points with the big + and − buttons.' },
      { q: 'Can I give more than one point at a time?', a: 'Yes. Change "Points per tap" to 5 or 10, for example, and every tap adds that many.' },
      { q: 'Can I show the scores on a projector?', a: 'Press "Full screen" and the scoreboard fills the screen, so the whole room can see who is winning.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/team-generator', label: 'team generator' }, { href: '/en/tools/countdown-timer', label: 'countdown timer' }]}>
    <div ref={box} className="rounded-2xl bg-[var(--background)] p-2">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((t, i) => <div key={i} className="rounded-2xl border-4 p-4 text-center" style={{ borderColor: COLORS[i % COLORS.length] }}>
          <input aria-label={`Name of team ${i + 1}`} className={`${inputClass} text-center text-xl font-black`} value={t.name} maxLength={30} onChange={e => update(i, { name: e.target.value })} />
          <p className="my-3 text-7xl font-black tabular-nums" aria-live="polite">{t.score}{t.score === top && top > 0 && teams.filter(x => x.score === top).length === 1 ? ' 👑' : ''}</p>
          <div className="flex justify-center gap-2">
            <button className={bigButtonClass} aria-label={`Take ${inc} from ${t.name}`} onClick={() => update(i, { score: t.score - inc })}>−</button>
            <button className={bigButtonClass} aria-label={`Give ${inc} to ${t.name}`} onClick={() => update(i, { score: t.score + inc })}>+</button>
          </div>
        </div>)}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap items-end justify-center gap-2">
      <Field label="Points per tap" type="number" min="1" value={step} onChange={e => setStep(e.target.value)} className="w-32" />
      <button className={buttonClass} disabled={teams.length >= 8} onClick={() => setTeams(ts => [...ts, { name: `Team ${ts.length + 1}`, score: 0 }])}>+ Add a team</button>
      <button className={buttonClass} disabled={teams.length <= 1} onClick={() => setTeams(ts => ts.slice(0, -1))}>Remove the last team</button>
      <button className={buttonClass} onClick={() => setTeams(ts => ts.map(t => ({ ...t, score: 0 })))}>Reset scores</button>
      <button className={buttonClass} onClick={full}>⛶ Full screen</button>
    </div>
  </ToolFrame>
}

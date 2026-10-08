import { useEffect, useRef, useState } from 'react'
import { canSpeak, hasVoice, voiceFor } from '../../utils/speak'
import { splitSentences, VOICES } from './storyReading'

// Read-aloud with the device's own Hebrew voice, one sentence at a time: long utterances get cut
// off in Chrome, and per-sentence lets us highlight the sentence being read and pause/resume
// reliably (speechSynthesis.pause() is unreliable on iOS and Android).

const pause = ms => new Promise(done => setTimeout(done, ms))

// paragraphs: string[]; onSentence({ p, s } | null) tells the page which sentence to highlight.
export default function StoryReader({ title, paragraphs, goodnight, onSentence }) {
  const [support, setSupport] = useState('unknown') // unknown | yes | no
  const [state, setState] = useState('idle') // idle | playing | paused | done
  const [voice, setVoice] = useState('cute')
  const [slow, setSlow] = useState(false)
  const run = useRef(0) // bumps on every start/stop, so a stale loop quits
  const at = useRef(0) // next sentence to read (for resume)
  const utter = useRef(null) // keep the utterance alive (Chrome drops onend of GC'd utterances)
  const lock = useRef(null)

  // The page remounts this component (key) whenever the story text changes, so it starts over.
  useEffect(() => {
    let alive = true
    const runs = run
    if (canSpeak()) hasVoice('he-IL').then(ok => alive && setSupport(ok ? 'yes' : 'no'))
    else Promise.resolve().then(() => alive && setSupport('no'))
    return () => { alive = false; runs.current++; try { window.speechSynthesis.cancel() } catch { /* ignore */ } onSentence?.(null) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const queue = [
    { p: -1, s: 0, text: title + '.' },
    ...paragraphs.flatMap((t, p) => splitSentences(t).map((text, s) => ({ p, s, text }))),
    { p: -2, s: 0, text: goodnight },
  ]

  const say = (text, v, id) => new Promise(done => {
    const synth = window.speechSynthesis
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'he-IL'
    if (v) u.voice = v
    u.pitch = VOICES[voice].pitch
    u.rate = VOICES[voice].rate * (slow ? 0.85 : 1)
    u.onend = u.onerror = () => done()
    utter.current = u
    if (run.current === id) synth.speak(u); else done()
  })

  const keepAwake = async on => {
    try {
      if (on && !lock.current && navigator.wakeLock) lock.current = await navigator.wakeLock.request('screen')
      if (!on && lock.current) { await lock.current.release(); lock.current = null }
    } catch { lock.current = null }
  }

  const play = async () => {
    const id = ++run.current
    const v = await voiceFor('he-IL')
    window.speechSynthesis.cancel()
    setState('playing'); keepAwake(true)
    for (let i = at.current; i < queue.length; i++) {
      if (run.current !== id) return
      at.current = i
      const item = queue[i]
      onSentence?.(item.p >= 0 ? { p: item.p, s: item.s } : null)
      await say(item.text, v, id)
      if (run.current !== id) return
      // A calm breath between paragraphs, a shorter one between sentences.
      const next = queue[i + 1]
      await pause(next && next.p !== item.p ? 700 : 250)
    }
    at.current = 0; onSentence?.(null); setState('done'); keepAwake(false)
  }
  const hold = () => { run.current++; window.speechSynthesis.cancel(); setState('paused'); keepAwake(false) }
  const stop = () => { run.current++; at.current = 0; window.speechSynthesis.cancel(); onSentence?.(null); setState('idle'); keepAwake(false) }
  const change = fn => { if (state === 'playing') hold(); fn() }

  if (support === 'unknown') return null
  if (support === 'no') return <p className="st-reader-note no-print">🔇 במכשיר הזה לא נמצא קול בעברית להקראה. בכרום, באנדרואיד ובאייפון בדרך כלל יש — או שתקריאו אתם, זה הכי נעים 💛</p>

  return <section className="st-reader no-print" aria-label="הקראת הסיפור">
    <div className="st-reader-main">
      {state === 'playing'
        ? <button type="button" className="ln-btn st-play" onClick={hold}>⏸️ עצירה רגע</button>
        : <button type="button" className="ln-btn st-play" onClick={play}><span className="st-moon" aria-hidden="true">🌙</span> {state === 'paused' ? 'להמשיך להקריא' : state === 'done' ? 'עוד פעם מההתחלה' : 'הקריאו לי את הסיפור'}</button>}
      {(state === 'playing' || state === 'paused') && <button type="button" className="ln-chip" onClick={stop}>⏹️ מההתחלה</button>}
    </div>
    <div className="st-reader-opts" role="group" aria-label="בחירת קול">
      {Object.entries(VOICES).map(([k, v]) => <button key={k} type="button" className="ln-chip" aria-pressed={voice === k} onClick={() => change(() => setVoice(k))}>{v.label}</button>)}
      <button type="button" className="ln-chip" aria-pressed={slow} onClick={() => change(() => setSlow(!slow))}>🐢 לאט יותר</button>
    </div>
    {(state === 'playing' || state === 'paused') && <div className="st-float">
      {state === 'playing'
        ? <button type="button" className="ln-btn" onClick={hold}>⏸️ עצירה</button>
        : <button type="button" className="ln-btn" onClick={play}>▶️ להמשיך</button>}
    </div>}
    {state === 'done' && <p className="st-reader-note" role="status">😴 לילה טוב! 💤</p>}
    <small className="st-reader-small">ההקראה משתמשת בקול של המכשיר, ולכן היא נשמעת קצת אחרת בכל טלפון ומחשב.</small>
  </section>
}

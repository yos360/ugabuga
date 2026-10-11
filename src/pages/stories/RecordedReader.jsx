import { useEffect, useRef, useState } from 'react'
import { playlistLabel } from './storyReading'

// Plays the professional recording ("Noa") paragraph by paragraph and tells the page which
// paragraph to highlight via onSentence({ p, s: -1 }). One <audio> element is reused for the
// whole playlist (iOS only lets an element play without a fresh tap once it was started by one);
// a second, silent element warms the cache with the next file.

const GAP_MS = 600
const wait = ms => new Promise(done => setTimeout(done, ms))

export default function RecordedReader({ playlist, paragraphCount, onSentence }) {
  const [state, setState] = useState('idle') // idle | playing | paused | done | error
  const [pos, setPos] = useState(0)
  const [slow, setSlow] = useState(false)
  const run = useRef(0) // bumps on every start/stop, so a stale loop quits
  const at = useRef(0) // playlist item to (re)start from
  const player = useRef(null)
  const preloader = useRef(null)
  const lock = useRef(null)
  const slowRef = useRef(false)

  const keepAwake = async on => {
    try {
      if (on && !lock.current && navigator.wakeLock) lock.current = await navigator.wakeLock.request('screen')
      if (!on && lock.current) { await lock.current.release(); lock.current = null }
    } catch { lock.current = null }
  }

  // Stop everything when the page unmounts (route change, new story, names changed).
  useEffect(() => () => {
    run.current++
    const a = player.current
    if (a) { try { a.pause(); a.removeAttribute('src'); a.load() } catch { /* ignore */ } }
    if (preloader.current) preloader.current.removeAttribute('src')
    if (lock.current) { lock.current.release().catch(() => {}); lock.current = null }
    onSentence?.(null)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const preload = i => {
    const next = playlist[i]
    if (!next) return
    if (!preloader.current) { preloader.current = new Audio(); preloader.current.preload = 'auto' }
    if (!preloader.current.src.endsWith(next.src)) { preloader.current.src = next.src; preloader.current.load() }
  }

  // Resolves 'ended' | 'paused' | 'error'. resume=true continues the file already loaded.
  const playOne = (i, resume) => new Promise(done => {
    const a = player.current
    const off = () => { a.onended = a.onerror = a.onpause = null }
    const finish = r => { off(); done(r) }
    a.onended = () => finish('ended')
    a.onerror = () => finish('error')
    a.onpause = () => { if (!a.ended) finish('paused') }
    if (!resume) a.src = playlist[i].src
    a.playbackRate = slowRef.current ? 0.85 : 1
    const p = a.play()
    if (p && p.catch) p.catch(e => finish(e?.name === 'AbortError' ? 'paused' : 'error'))
  })

  const play = async () => {
    const id = ++run.current
    if (!player.current) { player.current = new Audio(); player.current.preload = 'auto' }
    const a = player.current
    let resume = state === 'paused' && a.src && a.src.endsWith(playlist[at.current]?.src) && !a.ended
    setState('playing'); keepAwake(true)
    for (let i = at.current; i < playlist.length; i++) {
      if (run.current !== id) return
      at.current = i; setPos(i)
      const item = playlist[i]
      onSentence?.(item.p >= 0 ? { p: item.p, s: -1 } : null)
      preload(i + 1)
      const r = await playOne(i, resume)
      resume = false
      if (run.current !== id) return
      if (r === 'paused') { run.current++; setState('paused'); keepAwake(false); return }
      if (r === 'error') { run.current++; at.current = 0; onSentence?.(null); setState('error'); keepAwake(false); return }
      if (i + 1 < playlist.length) await wait(GAP_MS)
    }
    at.current = 0; onSentence?.(null); setState('done'); keepAwake(false)
  }
  const hold = () => {
    run.current++
    try { player.current?.pause() } catch { /* ignore */ }
    setState('paused'); keepAwake(false)
  }
  const stop = () => {
    run.current++
    at.current = 0; setPos(0)
    const a = player.current
    if (a) { try { a.pause(); a.currentTime = 0 } catch { /* ignore */ } }
    onSentence?.(null); setState('idle'); keepAwake(false)
  }
  const toggleSlow = () => {
    const v = !slowRef.current
    slowRef.current = v; setSlow(v)
    if (player.current) player.current.playbackRate = v ? 0.85 : 1
  }

  const active = state === 'playing' || state === 'paused'
  return <section className="st-reader st-recorded no-print" aria-label="האזנה לסיפור המוקלט">
    <div className="st-reader-main">
      {state === 'playing'
        ? <button type="button" className="ln-btn st-play" onClick={hold}>⏸️ עצירה רגע</button>
        : <button type="button" className="ln-btn st-play" onClick={play}><span className="st-moon" aria-hidden="true">🎧</span> {state === 'paused' ? 'להמשיך להאזין' : state === 'done' ? 'עוד פעם מההתחלה' : 'האזנה בקול של נועה'}</button>}
      {active && <button type="button" className="ln-chip" onClick={stop}>⏹️ מההתחלה</button>}
      <button type="button" className="ln-chip" aria-pressed={slow} onClick={toggleSlow}>🐢 לאט יותר</button>
    </div>
    {active && <p className="st-reader-note" role="status" aria-live="polite">{playlistLabel(playlist[pos], paragraphCount)}</p>}
    {active && <div className="st-float">
      {state === 'playing'
        ? <button type="button" className="ln-btn" onClick={hold}>⏸️ עצירה</button>
        : <button type="button" className="ln-btn" onClick={play}>▶️ להמשיך</button>}
    </div>}
    {state === 'done' && <p className="st-reader-note" role="status">😴 לילה טוב! 💤</p>}
    {state === 'error' && <p className="st-reader-note" role="status">ההקלטה לא נטענה כרגע. נסו שוב בעוד רגע 🙏</p>}
    <small className="st-reader-small">הקראה מוקלטת בקולה של נועה 🎙️</small>
  </section>
}

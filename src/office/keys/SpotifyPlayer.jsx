// Spotify embed for /tools/keyboard. The script loads only after the visitor opens it.
// The iFrame API has play/pause/seek but no next/previous: the embed's own list handles songs.
import { useEffect, useRef, useState } from 'react'
import { PLAYLISTS, spotifyUri, fmtTime } from './spotifyLinks'

const KEY = 'ugabuga-keyboard-music'
const readSaved = () => { try { return localStorage.getItem(KEY) || PLAYLISTS[0].uri } catch { return PLAYLISTS[0].uri } }

let apiPromise
function loadApi() {
  if (!apiPromise) apiPromise = new Promise(resolve => {
    window.onSpotifyIframeApiReady = api => resolve(api)
    const s = document.createElement('script')
    s.src = 'https://open.spotify.com/embed/iframe-api/v1'
    s.async = true
    document.head.appendChild(s)
  })
  return apiPromise
}

export default function SpotifyPlayer() {
  const host = useRef(null)
  const ctl = useRef(null)
  const [uri, setUri] = useState(readSaved)
  const [state, setState] = useState({ paused: true, position: 0, duration: 0 })
  const [ready, setReady] = useState(false)
  const [link, setLink] = useState('')
  const [bad, setBad] = useState(false)
  const first = useRef(uri)

  useEffect(() => {
    let dead = false
    const el = document.createElement('div')
    host.current.appendChild(el)
    loadApi().then(api => {
      if (dead) return
      api.createController(el, { uri: first.current, width: '100%', height: 352 }, c => {
        if (dead) { c.destroy(); return }
        ctl.current = c
        c.addListener('ready', () => setReady(true))
        c.addListener('playback_update', e => setState({ paused: e.data.isPaused, position: e.data.position, duration: e.data.duration }))
      })
    })
    const box = host.current
    return () => { dead = true; ctl.current?.destroy(); ctl.current = null; box.innerHTML = '' }
  }, [])

  const choose = u => {
    setUri(u); setBad(false)
    try { localStorage.setItem(KEY, u) } catch { /* ignore */ }
    ctl.current?.loadUri(u)
  }
  const seekBy = sec => ctl.current?.seek(Math.max(0, state.position / 1000 + sec))
  const btn = (label, aria, fn) => <button type="button" className="okb-btn" aria-label={aria} disabled={!ready} onMouseDown={e => e.preventDefault()} onClick={fn}>{label}</button>

  return <div className="okb-music">
    <div className="okb-chips" role="radiogroup" aria-label="בחירת מוזיקה">
      {PLAYLISTS.map(p => <button key={p.id} type="button" role="radio" aria-checked={uri === p.uri} className="okb-chip" onClick={() => choose(p.uri)}>{p.name}</button>)}
    </div>
    <div className="okb-music-ctl" role="group" aria-label="שליטה במוזיקה">
      {btn('⏮', 'מההתחלה', () => ctl.current?.restart())}
      {btn('⏪ 10', 'אחורה 10 שניות', () => seekBy(-10))}
      {btn(state.paused ? '▶️ ניגון' : '⏸️ עצירה', state.paused ? 'ניגון' : 'עצירה', () => ctl.current?.togglePlay())}
      {btn('10 ⏩', 'קדימה 10 שניות', () => seekBy(10))}
      {state.duration > 0 && <span className="okb-music-time" dir="ltr">{fmtTime(state.position)} / {fmtTime(state.duration)}</span>}
    </div>
    <div ref={host} className="okb-music-embed" />
    <form className="okb-music-link" onSubmit={e => { e.preventDefault(); const u = spotifyUri(link); if (u) { choose(u); setLink('') } else setBad(true) }}>
      <label htmlFor="okb-spotify">יש לכם רשימה משלכם? הדביקו קישור מספוטיפיי:</label>
      <input id="okb-spotify" dir="ltr" value={link} onChange={e => { setLink(e.target.value); setBad(false) }} placeholder="https://open.spotify.com/playlist/…" />
      <button type="submit" className="okb-btn">לנגן</button>
      {bad && <span role="alert" className="okb-music-bad">זה לא קישור של ספוטיפיי לשיר, אלבום או רשימה</span>}
    </form>
    <p className="okb-music-note">לשיר הבא או הקודם — לוחצים על השיר ברשימה שבנגן. בלי חשבון ספוטיפיי מחובר בדפדפן שומעים 30 שניות מכל שיר.</p>
  </div>
}

import { useEffect, useState } from 'react'
import { nowPlaying, onPlaying, setPlaying, speakAndWait, stopSpeaking } from '../../utils/speak'

// A small 🔊 button that reads `text` aloud: the recorded voice when there is a clip for this exact
// text (public/audio/<lang>/), otherwise the device voice (`say`, when given, is what it pronounces).
// `text` is the clip key, so keep it exactly what scripts/audio lists for that page. While it plays
// the button shows ⏹, and pressing it stops.
export default function SpeakButton({ text, say, lang = 'he-IL', label, className = '', rate }) {
  const [on, setOn] = useState(false)
  useEffect(() => onPlaying(t => setOn(t === text)), [text])
  if (!text) return null
  const press = e => {
    e.stopPropagation()
    if (on) { stopSpeaking(); setPlaying(null); return }
    setPlaying(text)
    void speakAndWait(text, lang, { ...(rate ? { rate } : {}), ...(say ? { say } : {}) }).then(() => { if (nowPlaying() === text) setPlaying(null) })
  }
  return <button type="button" onClick={press} aria-pressed={on}
    className={`no-print inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border-2 border-[var(--border)] px-2 text-lg leading-none hover:bg-[var(--postit)] ${on ? 'bg-[var(--postit)]' : 'bg-white'} ${className}`}
    aria-label={on ? 'עצירת ההשמעה' : label || `השמעה: ${text}`} title={on ? 'עצירה' : 'השמעה'}>{on ? '⏹' : '🔊'}</button>
}

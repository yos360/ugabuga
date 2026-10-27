import { useState } from 'react'
import { liveSound, setSoundOn, soundOn } from './liveSounds'

// 🔊/🔇 for Buga Live sounds. Turning it on plays a short chime, so it's clear the sound works.
export default function LiveSoundToggle({ className = '', label = true }) {
  const [on, setOn] = useState(soundOn)
  const flip = () => { const next = !on; setSoundOn(next); setOn(next); if (next) setTimeout(() => liveSound('right'), 30) }
  return <button type="button" className={className} onClick={flip} aria-pressed={on} aria-label={on ? 'כיבוי צלילים' : 'הפעלת צלילים'}>{on ? '🔊' : '🔇'}{label ? (on ? ' צלילים פועלים' : ' בלי צלילים') : ''}</button>
}

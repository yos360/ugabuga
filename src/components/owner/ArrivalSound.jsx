import { useEffect, useRef, useState } from 'react'
import { MODES, SOUNDS, audioLocked, loadSoundSettings, newArrivals, playSound, saveSoundSettings, unlockAudio } from '../../utils/arrivalSound'

// Plays the chosen sound when today's summary shows someone new (or a new page view).
export function useArrivalSound(data, settings) {
  const prev = useRef(null), day = useRef(new Date().toDateString())
  useEffect(() => {
    if (!data) return
    const today = new Date().toDateString()
    if (today !== day.current) { day.current = today; prev.current = null } // a new day starts from zero
    if (settings.on && newArrivals(prev.current, data, settings.mode) > 0) playSound(settings.sound, settings.volume)
    prev.current = data
  }, [data, settings])
}

export function useSoundSettings() {
  const [s, set] = useState(loadSoundSettings)
  const update = patch => set(cur => { const next = { ...cur, ...patch }; saveSoundSettings(next); return next })
  // Browsers block sound until the page is clicked once.
  useEffect(() => {
    const on = () => unlockAudio()
    window.addEventListener('pointerdown', on, { passive: true })
    return () => window.removeEventListener('pointerdown', on)
  }, [])
  return [s, update]
}

export default function SoundSettings({ settings, update, compact = false }) {
  const [, rerender] = useState(0)
  const test = () => { unlockAudio(); playSound(settings.sound, settings.volume); setTimeout(() => rerender(n => n + 1), 300) }
  const sel = 'min-h-9 rounded-xl border-2 border-slate-200 bg-white px-2 text-sm font-bold'
  return <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-slate-50 ${compact ? 'p-2 text-xs' : 'p-3 text-sm'}`}>
    <label className="flex items-center gap-2 font-bold">
      <input type="checkbox" className="h-4 w-4" checked={settings.on} onChange={e => { unlockAudio(); update({ on: e.target.checked }) }} />
      🔊 צליל על {settings.mode === 'pageview' ? 'כל צפייה' : 'כל מבקר חדש'}
    </label>
    <select className={sel} value={settings.sound} aria-label="איזה צליל" onChange={e => { update({ sound: e.target.value }); unlockAudio(); playSound(e.target.value, settings.volume) }}>
      {SOUNDS.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
    </select>
    <label className="flex items-center gap-2">ווליום
      <input type="range" min="0" max="1" step="0.05" value={settings.volume} aria-label="עוצמת הצליל"
        onChange={e => update({ volume: Number(e.target.value) })} onPointerUp={() => playSound(settings.sound, settings.volume)} className="w-28" />
      <span className="w-9 text-left">{Math.round(settings.volume * 100)}%</span>
    </label>
    {!compact && <select className={sel} value={settings.mode} aria-label="מתי לצלצל" onChange={e => update({ mode: e.target.value })}>
      {MODES.map(x => <option key={x.id} value={x.id}>מתי: {x.label}</option>)}
    </select>}
    <button type="button" onClick={test} className={sel}>▶️ לנסות</button>
    {settings.on && audioLocked() && <span className="text-amber-700">לחצו פעם אחת בכל מקום בדף כדי שהדפדפן ירשה צליל.</span>}
  </div>
}

// Owner report: a short sound when someone new arrives on the site. Sounds are synthesized with
// Web Audio (no files to load). Settings live in this browser only.
export const SOUNDS = [
  { id: 'ding', label: '🔔 דינג' },
  { id: 'bell', label: '🛎️ פעמון' },
  { id: 'coin', label: '🪙 מטבע' },
  { id: 'bubble', label: '🫧 בועה' },
  { id: 'chime', label: '🎵 מנגינה קצרה' },
  { id: 'pop', label: '🎈 פופ' },
]
export const MODES = [
  { id: 'visitor', label: 'מבקר חדש' },
  { id: 'pageview', label: 'כל צפייה בעמוד' },
]
const KEY = 'buga-owner-sound'
export const DEFAULTS = { on: false, sound: 'ding', volume: 0.6, mode: 'visitor' }
export function loadSoundSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULTS } }
}
export function saveSoundSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }

// How many new arrivals between two summaries of the same day (0 on the first load or a new day).
export function newArrivals(prev, next, mode) {
  const field = mode === 'pageview' ? 'pageviews' : 'visitors'
  if (!prev || !next || prev[field] == null || next[field] == null) return 0
  return Math.max(0, next[field] - prev[field])
}

let ctx = null
function audio() {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return null
  ctx ||= new AC()
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}
// Browsers only allow sound after the page was clicked once; call this from any click.
export function unlockAudio() { audio() }
export const audioLocked = () => !ctx || ctx.state !== 'running'

function tone(c, out, { freq, to, type = 'sine', start = 0, dur = 0.3, gain = 1 }) {
  const t = c.currentTime + start, o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(out)
  o.start(t); o.stop(t + dur + 0.05)
}
const PATTERNS = {
  ding: [{ freq: 1318, dur: 0.6 }, { freq: 2636, dur: 0.4, gain: 0.2 }],
  bell: [{ freq: 660, dur: 1.4 }, { freq: 1320, dur: 1.0, gain: 0.4 }, { freq: 1980, dur: 0.6, gain: 0.15 }],
  coin: [{ freq: 988, type: 'square', dur: 0.09, gain: 0.35 }, { freq: 1319, type: 'square', start: 0.09, dur: 0.35, gain: 0.35 }],
  bubble: [{ freq: 300, to: 1100, dur: 0.18 }],
  chime: [{ freq: 523, dur: 0.35 }, { freq: 659, start: 0.12, dur: 0.35 }, { freq: 784, start: 0.24, dur: 0.6 }],
  pop: [{ freq: 600, to: 150, type: 'triangle', dur: 0.12 }],
}
export function playSound(id, volume = 0.6) {
  try {
    const c = audio()
    if (!c || volume <= 0) return
    const out = c.createGain()
    out.gain.value = Math.min(1, volume) * 0.5
    out.connect(c.destination)
    for (const p of PATTERNS[id] || PATTERNS.ding) tone(c, out, p)
  } catch { /* no audio */ }
}

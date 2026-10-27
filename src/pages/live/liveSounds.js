// Buga Live sounds, synthesized with Web Audio (no files): a chime for a right answer and a soft low
// tone for a wrong one on the player's phone; a reveal chord and a closing fanfare on the host screen.
// On by default, with a 🔊/🔇 toggle (remembered per device). Browsers only let audio start after a tap,
// so the first tap anywhere unlocks it — by the time an answer is revealed the player has already tapped.
const KEY = 'buga-live-sound'
let ctx = null

export const soundOn = () => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } }
export function setSoundOn(on) { try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* private mode */ } }

function audio(create = false) {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return null
  try {
    if (!ctx && create) ctx = new AC()
    if (ctx?.state === 'suspended') void ctx.resume().catch(() => {})
    return ctx
  } catch { return null }
}
if (typeof window !== 'undefined') window.addEventListener('pointerdown', () => audio(true), { once: true, capture: true })

function tone(c, { freq, to, at = 0, dur = 0.15, type = 'sine', gain = 0.14 }) {
  const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain()
  o.type = type; o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03)
}

const SOUNDS = {
  right: c => [659, 784, 1047].forEach((f, i) => tone(c, { freq: f, at: i * 0.09, dur: 0.22, type: 'triangle', gain: 0.15 })),
  wrong: c => { tone(c, { freq: 330, to: 220, dur: 0.22, type: 'sine', gain: 0.13 }); tone(c, { freq: 247, to: 165, at: 0.2, dur: 0.3, type: 'sine', gain: 0.11 }) },
  reveal: c => [392, 494, 587, 784].forEach((f, i) => tone(c, { freq: f, at: i * 0.05, dur: 0.5, type: 'triangle', gain: 0.08 })),
  finish: c => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(c, { freq: f, at: i * 0.13, dur: i === 5 ? 0.6 : 0.2, type: 'triangle', gain: 0.13 })),
}

export function liveSound(name) {
  if (!soundOn()) return
  const c = audio()
  if (c && SOUNDS[name]) { try { SOUNDS[name](c) } catch { /* ignore */ } }
}

// Plays `name` once per key (e.g. once per revealed question), so re-renders and polling don't repeat it.
const played = new Set()
export function liveSoundOnce(key, name) { if (played.has(key)) return; played.add(key); liveSound(name) }

// Marks a key as already heard without playing — for a reveal that was already on screen when the page loaded.
export const markHeard = key => played.add(key)

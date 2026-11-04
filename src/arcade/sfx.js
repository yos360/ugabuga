// Short game sound effects, synthesized with Web Audio (no files). They follow the same
// 🎵 on/off choice as the background music.
import { musicPref } from './music'

let ctx = null
function audio() {
  if (!musicPref()) return null
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return null
  try {
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
    return ctx
  } catch { return null }
}

function tone(c, { freq, to, at = 0, dur = 0.12, type = 'sine', gain = 0.12 }) {
  const t = c.currentTime + at
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(c.destination)
  o.start(t); o.stop(t + dur + 0.02)
}

function noise(c, { at = 0, dur = 0.3, gain = 0.2, cutoff = 900 }) {
  const t = c.currentTime + at
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain()
  src.buffer = buf; f.type = 'lowpass'; f.frequency.value = cutoff; g.gain.value = gain
  src.connect(f); f.connect(g); g.connect(c.destination)
  src.start(t)
}

const SOUNDS = {
  eat: c => tone(c, { freq: 520, to: 880, dur: 0.09, type: 'triangle', gain: 0.13 }),
  combo: c => { tone(c, { freq: 660, to: 990, dur: 0.08, type: 'triangle', gain: 0.12 }); tone(c, { freq: 990, to: 1320, at: 0.07, dur: 0.1, type: 'triangle', gain: 0.1 }) },
  gold: c => [784, 988, 1175, 1568].forEach((f, i) => tone(c, { freq: f, at: i * 0.06, dur: 0.16, type: 'sine', gain: 0.11 })),
  power: c => tone(c, { freq: 300, to: 1200, dur: 0.3, type: 'sine', gain: 0.12 }),
  crash: c => { noise(c, { dur: 0.35, gain: 0.25, cutoff: 700 }); tone(c, { freq: 220, to: 60, dur: 0.4, type: 'sawtooth', gain: 0.08 }) },
  win: c => [523, 659, 784, 1047].forEach((f, i) => tone(c, { freq: f, at: i * 0.11, dur: 0.28, type: 'triangle', gain: 0.12 })),
  tick: c => tone(c, { freq: 880, dur: 0.05, type: 'square', gain: 0.03 }),
  slide: c => noise(c, { dur: 0.07, gain: 0.05, cutoff: 1800 }),
  bump: c => tone(c, { freq: 140, to: 90, dur: 0.08, type: 'sine', gain: 0.1 }),
  // a merge: the bigger the new number, the higher the note (2 → 4 low, 1024 → 2048 high)
  merge: (c, v = 4) => { const f = 330 * 2 ** (Math.min(11, Math.log2(v) - 2) / 4); tone(c, { freq: f, to: f * 1.5, dur: 0.1, type: 'triangle', gain: 0.12 }) },
  // taps and moves
  pick: c => tone(c, { freq: 660, to: 780, dur: 0.06, type: 'triangle', gain: 0.08 }),
  place: c => { tone(c, { freq: 420, to: 300, dur: 0.07, type: 'triangle', gain: 0.1 }); noise(c, { dur: 0.04, gain: 0.04, cutoff: 2500 }) },
  flip: c => { noise(c, { dur: 0.06, gain: 0.07, cutoff: 3200 }); tone(c, { freq: 500, to: 620, dur: 0.05, type: 'sine', gain: 0.05 }) },
  card: c => noise(c, { dur: 0.09, gain: 0.08, cutoff: 2600 }),
  match: c => { tone(c, { freq: 587, dur: 0.1, type: 'triangle', gain: 0.11 }); tone(c, { freq: 880, at: 0.08, dur: 0.16, type: 'triangle', gain: 0.11 }) },
  wrong: c => { tone(c, { freq: 200, to: 150, dur: 0.16, type: 'square', gain: 0.045 }); tone(c, { freq: 150, to: 110, at: 0.1, dur: 0.16, type: 'square', gain: 0.04 }) },
  hit: c => { noise(c, { dur: 0.25, gain: 0.22, cutoff: 1100 }); tone(c, { freq: 180, to: 70, dur: 0.25, type: 'sine', gain: 0.14 }) },
  splash: c => noise(c, { dur: 0.35, gain: 0.1, cutoff: 600 }),
  // end of a round
  lose: c => [392, 330, 262].forEach((f, i) => tone(c, { freq: f, to: f * 0.97, at: i * 0.16, dur: 0.26, type: 'triangle', gain: 0.1 })),
  star: (c, i = 0) => tone(c, { freq: 880 * 2 ** (i * 4 / 12), to: 1320 * 2 ** (i * 4 / 12), dur: 0.18, type: 'sine', gain: 0.1 }),
  record: c => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(c, { freq: f, at: i * 0.09, dur: i === 5 ? 0.5 : 0.14, type: 'square', gain: 0.045 })),
}

export function sfx(name, arg) {
  const c = audio()
  if (c && SOUNDS[name]) { try { SOUNDS[name](c, arg) } catch { /* ignore */ } }
}

// A short vibration on phones (tap feedback, a mistake, a win). Follows the same 🎵 choice.
export function buzz(pattern = 15) {
  if (!musicPref()) return
  try { navigator.vibrate?.(pattern) } catch { /* not supported */ }
}

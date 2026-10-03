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
}

export function sfx(name) {
  const c = audio()
  if (c && SOUNDS[name]) { try { SOUNDS[name](c) } catch { /* ignore */ } }
}

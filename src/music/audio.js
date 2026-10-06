// Small Web Audio instruments for the music area: a soft piano-like tone and a plucked guitar string
// (Karplus–Strong). No samples to download — everything is synthesised in the browser.

let ctx = null, master = null
export function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createDynamicsCompressor()
    const gain = ctx.createGain(); gain.gain.value = 0.8
    master.connect(gain); gain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// "C4" → 60, "F#3" → 54, "Bb4" → 70
export function midi(note) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(note)
  if (!m) return null
  return NAMES.indexOf(m[1]) + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12
}
export const noteName = n => NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1)
export const freq = n => 440 * Math.pow(2, (n - 69) / 12)

// Piano-ish: a triangle and a quiet sine an octave up, fast attack, natural decay.
export function playPiano(note, { duration = 1.2, velocity = 0.7, when = 0 } = {}) {
  const ac = audio(); if (!ac) return
  const n = typeof note === 'number' ? note : midi(note); if (n == null) return
  const t = ac.currentTime + when, f = freq(n)
  const out = ac.createGain()
  out.gain.setValueAtTime(0.0001, t)
  out.gain.exponentialRampToValueAtTime(0.32 * velocity, t + 0.01)
  out.gain.exponentialRampToValueAtTime(0.12 * velocity, t + 0.25)
  out.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.4, duration) + 0.6)
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(9000, f * 8), t); lp.frequency.exponentialRampToValueAtTime(Math.max(500, f * 2), t + 1.2)
  lp.connect(out); out.connect(master)
  for (const [type, mult, g] of [['triangle', 1, 0.9], ['sine', 2, 0.25], ['sine', 3, 0.08]]) {
    const o = ac.createOscillator(), og = ac.createGain()
    o.type = type; o.frequency.value = f * mult; og.gain.value = g
    o.connect(og); og.connect(lp); o.start(t); o.stop(t + Math.max(0.4, duration) + 0.7)
  }
}

// Plucked string (Karplus–Strong), rendered into a buffer once per pitch.
const strings = new Map()
function stringBuffer(ac, f) {
  const key = Math.round(f * 10)
  if (strings.has(key)) return strings.get(key)
  const sr = ac.sampleRate, len = Math.floor(sr * 2.2), period = Math.round(sr / f)
  const buf = ac.createBuffer(1, len, sr), d = buf.getChannelData(0), ring = new Float32Array(period)
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1
  let idx = 0
  for (let i = 0; i < len; i++) {
    const next = (idx + 1) % period
    const v = 0.4985 * (ring[idx] + ring[next])
    d[i] = ring[idx]; ring[idx] = v; idx = next
  }
  strings.set(key, buf)
  return buf
}
export function playString(note, { when = 0, velocity = 0.8 } = {}) {
  const ac = audio(); if (!ac) return
  const n = typeof note === 'number' ? note : midi(note); if (n == null) return
  const src = ac.createBufferSource(), g = ac.createGain()
  src.buffer = stringBuffer(ac, freq(n)); g.gain.value = 0.5 * velocity
  src.connect(g); g.connect(master); src.start(ac.currentTime + when)
}
// Strum: low string to high, a few milliseconds apart.
export const strum = (notes, gap = 0.035) => notes.forEach((n, i) => playString(n, { when: i * gap }))
export const playChord = (notes, opts) => notes.forEach(n => playPiano(n, opts))

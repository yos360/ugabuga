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

// Small synth drum kit for grooves: kick, snare, closed hi-hat, ride. `when` is an AudioContext time.
let noiseBuf = null
function noise(ac) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ac.createBufferSource(); s.buffer = noiseBuf
  return s
}
export function playDrum(kind, when, velocity = 1) {
  const ac = audio(); if (!ac) return
  const t = Math.max(when ?? ac.currentTime, ac.currentTime)
  const g = ac.createGain(); g.connect(master)
  if (kind === 'kick') {
    const o = ac.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18)
    g.gain.setValueAtTime(0.9 * velocity, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    o.connect(g); o.start(t); o.stop(t + 0.32)
    return
  }
  const n = noise(ac), f = ac.createBiquadFilter()
  const hat = kind === 'hat' || kind === 'ride'
  f.type = hat ? 'highpass' : 'bandpass'; f.frequency.value = hat ? (kind === 'ride' ? 5000 : 7500) : 1800
  const len = kind === 'ride' ? 0.35 : hat ? 0.05 : 0.16
  g.gain.setValueAtTime((hat ? (kind === 'ride' ? 0.12 : 0.18) : 0.45) * velocity, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  n.connect(f); f.connect(g); n.start(t, Math.random() * 0.5); n.stop(t + len + 0.02)
  if (kind === 'snare') { const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = 190; og.gain.setValueAtTime(0.25 * velocity, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.12) }
}
export const audioTime = () => audio()?.currentTime ?? 0

// Absolute AudioContext time for the metronome look-ahead scheduler; cancellation stops queued clicks.
export function scheduleClick(when, accent = false) {
  const ac = audio(); if (!ac) return () => {}
  const oscillator = ac.createOscillator(), gain = ac.createGain()
  oscillator.frequency.value = accent ? 1200 : 800
  const t = Math.max(when, ac.currentTime)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(accent ? 0.2 : 0.12, t + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
  oscillator.connect(gain); gain.connect(master)
  oscillator.start(t); oscillator.stop(t + 0.05)
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
  return () => { try { oscillator.stop() } catch { /* already ended */ } }
}

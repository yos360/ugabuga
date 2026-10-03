// Soft background music for the online games, generated live with the Web Audio API
// (no audio files to download, no licensing). A warm pad plays slow chords, a gentle
// "music box" melody wanders over a pentatonic scale, and a light reverb glues it
// together. Each game gets its own mood (key, tempo, chords), all calm and quiet.

const MOODS = {
  // name: { root midi, bpm, chords (semitones from root), melody scale }
  sunny: { root: 60, bpm: 76, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], scale: [0, 2, 4, 7, 9] },
  dreamy: { root: 57, bpm: 66, chords: [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]], scale: [0, 3, 5, 7, 10] },
  breezy: { root: 62, bpm: 84, chords: [[0, 4, 7, 9], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 17]], scale: [0, 2, 4, 7, 9] },
  cozy: { root: 55, bpm: 70, chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]], scale: [0, 2, 4, 7, 9] },
}
export const MOOD_NAMES = Object.keys(MOODS)

const hz = midi => 440 * 2 ** ((midi - 69) / 12)

function impulse(ctx, seconds = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6
  }
  return buf
}

export function createMusic(moodName = 'sunny') {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AC) return { start() {}, stop() {}, setMood() {} }
  let ctx = null, master = null, dry = null, verb = null, timer = 0
  let mood = MOODS[moodName] || MOODS.sunny
  let nextBeat = 0, beat = 0, lastNote = 2
  let rand = Math.random

  function voice({ freq, at, dur, type = 'sine', gain = 0.1, attack = 0.02, cutoff = 2400, wet = 0.5 }) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter()
    o.type = type
    o.frequency.value = freq
    f.type = 'lowpass'
    f.frequency.value = cutoff
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(gain, at + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(f); f.connect(g)
    g.connect(dry)
    if (wet) { const s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(verb) }
    o.start(at); o.stop(at + dur + 0.05)
  }

  function schedule() {
    const spb = 60 / mood.bpm
    while (nextBeat < ctx.currentTime + 0.4) {
      const t = nextBeat
      const bar = Math.floor(beat / 4) % mood.chords.length
      const chord = mood.chords[bar]
      if (beat % 4 === 0) {
        // pad: the whole chord, slow swell over the bar
        for (const n of chord) {
          voice({ freq: hz(mood.root + n - 12), at: t, dur: spb * 4.3, type: 'triangle', gain: 0.022, attack: spb * 1.2, cutoff: 900, wet: 0.8 })
        }
        // soft bass
        voice({ freq: hz(mood.root + chord[0] - 24), at: t, dur: spb * 3.5, type: 'sine', gain: 0.05, attack: 0.08, cutoff: 400, wet: 0.2 })
      }
      // music-box melody: mostly on beats, sometimes an off-beat, often resting
      const play = rand() < (beat % 2 === 0 ? 0.62 : 0.35)
      if (play) {
        const step = rand() < 0.7 ? (rand() < 0.5 ? -1 : 1) : (rand() < 0.5 ? -2 : 2)
        lastNote = Math.max(0, Math.min(9, lastNote + step))
        const sc = mood.scale
        const n = sc[lastNote % sc.length] + 12 * Math.floor(lastNote / sc.length)
        const off = rand() < 0.25 ? spb / 2 : 0
        voice({ freq: hz(mood.root + n), at: t + off, dur: spb * 2.2, type: 'sine', gain: 0.045, attack: 0.008, cutoff: 3200, wet: 0.55 })
        voice({ freq: hz(mood.root + n + 12), at: t + off, dur: spb * 0.9, type: 'sine', gain: 0.008, attack: 0.005, cutoff: 5000, wet: 0.4 })
      }
      nextBeat += spb
      beat++
    }
  }

  return {
    start() {
      try {
        if (!ctx) {
          ctx = new AC()
          master = ctx.createGain()
          master.gain.value = 0.0001
          master.connect(ctx.destination)
          dry = ctx.createGain(); dry.gain.value = 0.8; dry.connect(master)
          verb = ctx.createConvolver(); verb.buffer = impulse(ctx); verb.connect(master)
        }
        if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6)
        if (!timer) {
          nextBeat = ctx.currentTime + 0.1
          timer = setInterval(schedule, 120)
          schedule()
        }
      } catch { /* audio not available — play silently */ }
    },
    // Called again from a user gesture when the browser blocked autoplay.
    resume() { if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {}) },
    stop(close = false) {
      if (!ctx) return
      clearInterval(timer); timer = 0
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15)
      if (close) { const c = ctx; ctx = null; setTimeout(() => { void c.close().catch(() => {}) }, 600) }
    },
    setMood(name) { mood = MOODS[name] || mood },
    // For tests: a deterministic melody.
    seed(fn) { rand = fn },
  }
}

const KEY = 'buga-arcade-music'
export function musicPref() {
  try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
}
export function saveMusicPref(on) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* private mode */ }
}

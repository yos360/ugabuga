// All the game's sound is synthesized here, so there are no audio files to load.
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16]
const CHORDS = [0, 5, -3, 7]
const STEP = 0.16
const MELODY = [0, 2, 4, 2, 5, 4, 2, 0, 3, 5, 7, 5, 4, 2, 1, 2]

export function createSound() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return { start() {}, stop() {}, play() {}, setMuted() {}, dispose() {} }
  const ctx = new Ctx()
  const master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)
  let muted = false, timer = null, beat = 0, next = 0, coinAt = 0, coinRun = 0

  const tone = (midi, at, length, { type = 'triangle', volume = 0.2, slide = 0 } = {}) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    const hz = 440 * 2 ** ((midi - 69) / 12)
    osc.type = type
    osc.frequency.setValueAtTime(hz, at)
    if (slide) osc.frequency.exponentialRampToValueAtTime(hz * 2 ** (slide / 12), at + length)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
    osc.connect(gain).connect(master)
    osc.start(at)
    osc.stop(at + length + 0.02)
  }
  const noise = (at, length, volume) => {
    const data = new Float32Array(Math.ceil(ctx.sampleRate * length))
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const buffer = ctx.createBuffer(1, data.length, ctx.sampleRate)
    buffer.copyToChannel(data, 0)
    const src = ctx.createBufferSource(), gain = ctx.createGain(), filter = ctx.createBiquadFilter()
    src.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.value = 3000
    gain.gain.setValueAtTime(volume, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
    src.connect(filter).connect(gain).connect(master)
    src.start(at)
  }

  function schedule() {
    while (next < ctx.currentTime + 0.3) {
      const bar = Math.floor(beat / 16) % CHORDS.length, root = 50 + CHORDS[bar], i = beat % 16
      if (i % 4 === 0) tone(root - 12, next, 0.3, { type: 'sine', volume: 0.32, slide: -5 })
      if (i % 2 === 0) tone(root - 12 + (i % 4 ? 12 : 0), next, 0.14, { type: 'square', volume: 0.05 })
      if (i % 4 === 2) noise(next, 0.07, 0.09)
      if (i % 2 === 1) noise(next, 0.025, 0.03)
      if (i % 2 === 0 || i % 3 === 0) tone(root + 24 + SCALE[MELODY[i]], next, 0.15, { volume: 0.085 })
      next += STEP
      beat++
    }
  }

  const SFX = {
    // a line of coins climbs the scale
    coin: t => {
      coinRun = t - coinAt < 0.6 ? coinRun + 1 : 0
      coinAt = t
      const up = SCALE[Math.min(coinRun, SCALE.length - 1)]
      tone(84 + up, t, 0.07, { type: 'square', volume: 0.05 })
      tone(89 + up, t + 0.05, 0.1, { type: 'square', volume: 0.05 })
    },
    fly: t => [64, 69, 76, 81, 88].forEach((m, i) => tone(m, t + i * 0.05, 0.22, { type: 'sine', volume: 0.15, slide: 5 })),
    close: t => { noise(t, 0.12, 0.09); tone(79, t, 0.1, { volume: 0.12, slide: 7 }) },
    combo: t => [79, 84, 91].forEach((m, i) => tone(m, t + i * 0.05, 0.12, { type: 'square', volume: 0.07 })),
    mission: t => [72, 79, 84, 88, 91].forEach((m, i) => tone(m, t + i * 0.09, 0.24, { volume: 0.15 })),
    escape: t => [67, 72, 76, 84].forEach((m, i) => tone(m, t + i * 0.07, 0.2, { volume: 0.14 })),
    jump: t => tone(62, t, 0.2, { type: 'triangle', volume: 0.16, slide: 9 }),
    land: t => noise(t, 0.05, 0.05),
    slide: t => noise(t, 0.2, 0.1),
    move: t => tone(74, t, 0.06, { type: 'sine', volume: 0.06 }),
    turn: t => { tone(76, t, 0.09, { volume: 0.12 }); tone(83, t + 0.07, 0.12, { volume: 0.12 }) },
    power: t => [72, 76, 79, 84].forEach((m, i) => tone(m, t + i * 0.06, 0.14, { volume: 0.13 })),
    right: t => [76, 79, 84, 88].forEach((m, i) => tone(m, t + i * 0.08, 0.2, { volume: 0.15 })),
    wrong: t => tone(58, t, 0.3, { type: 'sawtooth', volume: 0.08, slide: -6 }),
    shield: t => tone(84, t, 0.3, { type: 'sine', volume: 0.16, slide: -12 }),
    hit: t => { tone(45, t, 0.3, { type: 'sawtooth', volume: 0.18, slide: -12 }); noise(t, 0.16, 0.16) },
    over: t => [60, 57, 53, 48].forEach((m, i) => tone(m, t + i * 0.14, 0.26, { type: 'square', volume: 0.08 })),
  }

  return {
    start() {
      ctx.resume()
      if (timer) return
      next = ctx.currentTime + 0.05
      timer = setInterval(schedule, 100)
    },
    stop() { clearInterval(timer); timer = null },
    play(name) { if (!muted && SFX[name]) SFX[name](ctx.currentTime) },
    setMuted(v) { muted = v; master.gain.value = v ? 0 : 0.5 },
    dispose() { clearInterval(timer); timer = null; ctx.close() },
  }
}

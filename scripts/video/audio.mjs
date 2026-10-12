// Background music and soft sound effects for story videos, synthesised here (no samples, no
// licences): an original music-box lullaby in F major over a warm pad, and tiny effects —
// chime, chirp, wings, drip, twinkle, pop, whoosh — plus crickets on night scenes.
import { writeFile } from 'node:fs/promises'

export const RATE = 44100
const TAU = Math.PI * 2

export async function writeWav(path, ch /* [left, right] Float32Array */) {
  const n = ch[0].length, buf = Buffer.alloc(44 + n * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(RATE, 24)
  buf.writeUInt32LE(RATE * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40)
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ch[c][i])) * 32000), 44 + i * 4 + c * 2)
  await writeFile(path, buf)
}

const hz = midi => 440 * Math.pow(2, (midi - 69) / 12)
function add(out, at, samples, gain = 1, pan = 0) {
  const i0 = Math.round(at * RATE), l = gain * Math.cos((pan + 1) * Math.PI / 4), r = gain * Math.sin((pan + 1) * Math.PI / 4)
  for (let i = 0; i < samples.length; i++) { const j = i0 + i; if (j < 0 || j >= out[0].length) continue; out[0][j] += samples[i] * l; out[1][j] += samples[i] * r }
}
const buffer = sec => new Float32Array(Math.max(1, Math.round(sec * RATE)))

// Music-box note: bright inharmonic partials with a quick decay and a tiny "pluck".
function musicBox(f, dur = 2.4) {
  const s = buffer(dur), parts = [[1, 1, 2.2], [2.0, .35, 4], [3.0, .12, 6], [4.16, .1, 9], [5.4, .05, 12]]
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE; let v = 0
    for (const [m, a, d] of parts) v += a * Math.sin(TAU * f * m * t) * Math.exp(-t * d)
    s[i] = v * Math.min(1, t * 400) * .5
  }
  return s
}
// Soft pad: three slightly detuned sines per note, slow swell in and out.
function pad(freqs, dur) {
  const s = buffer(dur)
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE, env = Math.min(1, t / 1.2) * Math.min(1, (dur - t) / 1.2)
    let v = 0
    for (const f of freqs) v += Math.sin(TAU * f * t) + .5 * Math.sin(TAU * f * 1.003 * t + 1) + .25 * Math.sin(TAU * f * 2 * t)
    s[i] = v * env * .06
  }
  return s
}
function bass(f, dur) {
  const s = buffer(dur)
  for (let i = 0; i < s.length; i++) { const t = i / RATE; s[i] = (Math.sin(TAU * f * t) + .2 * Math.sin(TAU * 2 * f * t)) * Math.exp(-t * 1.4) * Math.min(1, t * 80) * .22 }
  return s
}

// Small Freeverb-style reverb (4 combs + 2 allpasses per channel) for a dreamy room.
function reverb(ch, wet = .28) {
  return ch.map((x, c) => {
    const combs = [1557, 1617, 1491, 1422].map(d => ({ b: new Float32Array(d + c * 23), i: 0, lp: 0 }))
    const aps = [556, 441].map(d => ({ b: new Float32Array(d + c * 11), i: 0 }))
    const y = new Float32Array(x.length)
    for (let n = 0; n < x.length; n++) {
      let s = 0
      for (const cb of combs) { const o = cb.b[cb.i]; cb.lp = o * .7 + cb.lp * .3; cb.b[cb.i] = x[n] * .015 + cb.lp * .84; cb.i = (cb.i + 1) % cb.b.length; s += o }
      for (const ap of aps) { const o = ap.b[ap.i]; const v = -s + o; ap.b[ap.i] = s + o * .5; ap.i = (ap.i + 1) % ap.b.length; s = v }
      y[n] = x[n] * (1 - wet) + s * wet * 3
    }
    return y
  })
}
function lowpass(ch, cut = 5200) {
  const a = 1 - Math.exp(-TAU * cut / RATE)
  return ch.map(x => { let s = 0; const y = new Float32Array(x.length); for (let n = 0; n < x.length; n++) { s += a * (x[n] - s); y[n] = s }; return y })
}

// The lullaby: 16 bars of 3/4 at 60 bpm (48 s), played as a gentle loop with variations.
// Chords per bar and melody as [midi, beats] (F4 = 65).
const CHORDS = ['F', 'Dm', 'Gm', 'C', 'F', 'Dm', 'Gm', 'C', 'Bb', 'F', 'Gm', 'C', 'Dm', 'Bb', 'C', 'F']
const TONES = { F: [53, 57, 60], Dm: [50, 53, 57], Gm: [55, 58, 62], C: [48, 52, 55], Bb: [46, 50, 53] }
const MELODY = [
  [[69, 1], [72, 1], [77, 1]], [[76, 2], [74, 1]], [[74, 1], [72, 1], [70, 1]], [[72, 3]],
  [[69, 1], [72, 1], [77, 1]], [[81, 2], [79, 1]], [[77, 1], [74, 1], [70, 1]], [[76, 2], [67, 1]],
  [[74, 2], [77, 1]], [[72, 2], [69, 1]], [[70, 1], [74, 1], [79, 1]], [[76, 2], [72, 1]],
  [[74, 1], [77, 1], [81, 1]], [[79, 2], [77, 1]], [[76, 1], [74, 1], [76, 1]], [[77, 3]],
]
export function lullaby(seconds, { beat = 1, startBar = 0 } = {}) {
  const out = [buffer(seconds + 4), buffer(seconds + 4)], bar = 3 * beat
  const cache = new Map(), note = m => cache.get(m) || (cache.set(m, musicBox(hz(m))), cache.get(m))
  for (let b = 0; b * bar < seconds + bar; b++) {
    const k = (b + startBar) % 16, round = Math.floor((b + startBar) / 16) % 3, t0 = b * bar
    const ch = TONES[CHORDS[k]]
    add(out, t0, pad(ch.map(m => hz(m + 12)), bar + 1.2), 1, 0)
    add(out, t0, bass(hz(ch[0] - 12), bar), 1, -.1)
    // Round 2: the melody an octave lower and sparser; round 3: with a quiet arpeggio under it.
    let t = t0
    for (const [m, d] of MELODY[k]) {
      if (!(round === 1 && d === 1 && t !== t0)) add(out, t, note(m - (round === 1 ? 12 : 0)), .55, .25)
      t += d * beat
    }
    if (round === 2) ch.forEach((m, i) => add(out, t0 + (i + .5) * beat, note(m + 24), .16, -.35))
  }
  let mix = reverb(lowpass(out, 4800), .32)
  // Fade in over 3 s and out over 4 s, trim to length.
  const n = Math.round(seconds * RATE)
  mix = mix.map(x => { const y = x.slice(0, n); for (let i = 0; i < n; i++) y[i] *= Math.min(1, i / (3 * RATE), (n - i) / (4 * RATE)); return y })
  return normalise(mix, .5)
}
function normalise(ch, peak) {
  let m = 0; for (const x of ch) for (const v of x) m = Math.max(m, Math.abs(v))
  return m ? ch.map(x => x.map(v => v * peak / m)) : ch
}

// ---- sound effects ----
let noiseSeed = 1
const noise = () => { noiseSeed = (noiseSeed * 16807) % 2147483647; return noiseSeed / 1073741823.5 - 1 }
const SFX = {
  chime: () => { const s = buffer(2.2); for (const [f, a, d] of [[1568, 1, 2.5], [2093, .6, 3], [3136, .3, 4]]) for (let i = 0; i < s.length; i++) { const t = i / RATE; s[i] += a * Math.sin(TAU * f * t) * Math.exp(-t * d) * Math.min(1, t * 300) * .3 } return s },
  twinkle: () => { const s = buffer(1.4); [2637, 3136, 3951].forEach((f, k) => { const o = Math.round(k * .07 * RATE); for (let i = 0; i + o < s.length; i++) { const t = i / RATE; s[i + o] += Math.sin(TAU * f * t) * Math.exp(-t * 5) * .18 } }); return s },
  chirp: () => { const s = buffer(.45); [0, .16].forEach(st => { let ph = 0; for (let i = 0; i < .09 * RATE; i++) { const t = i / RATE, f = 3200 + 1600 * (t / .09); ph += TAU * f / RATE; const j = Math.round(st * RATE) + i; s[j] += Math.sin(ph) * Math.sin(Math.PI * t / .09) * .35 } }); return s },
  wings: () => { const s = buffer(.7); let lp = 0; for (let i = 0; i < s.length; i++) { const t = i / RATE; lp += .08 * (noise() - lp); s[i] = lp * Math.max(0, Math.sin(TAU * 13 * t)) * Math.sin(Math.PI * t / .7) * 2.2 } return s },
  drip: () => { const s = buffer(.35); let ph = 0; for (let i = 0; i < s.length; i++) { const t = i / RATE, f = 900 + 1300 * Math.exp(-t * 30); ph += TAU * f / RATE; s[i] = Math.sin(ph) * Math.exp(-t * 18) * Math.min(1, t * 2000) * .5 } return s },
  pop: () => { const s = buffer(.25); let ph = 0; for (let i = 0; i < s.length; i++) { const t = i / RATE, f = 500 + 700 * (1 - Math.exp(-t * 40)); ph += TAU * f / RATE; s[i] = Math.sin(ph) * Math.exp(-t * 25) * .5 } return s },
  whoosh: () => { const s = buffer(.9); let lp = 0, lp2 = 0; for (let i = 0; i < s.length; i++) { const t = i / RATE, c = .02 + .12 * Math.sin(Math.PI * t / .9); lp += c * (noise() - lp); lp2 += c * (lp - lp2); s[i] = lp2 * Math.sin(Math.PI * t / .9) * 1.6 } return s },
  sleepy: () => { const s = buffer(1.6); for (let i = 0; i < s.length; i++) { const t = i / RATE, f = 520 - 120 * t / 1.6; s[i] = Math.sin(TAU * f * t) * Math.sin(Math.PI * t / 1.6) * .12 } return s },
}
const cache = {}
const sfx = kind => cache[kind] || (cache[kind] = SFX[kind]())

function crickets(out, from, to, seed) {
  let r = seed
  const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647 }
  for (let t = from + .3; t < to - .5; t += .9 + rnd() * 1.4) {
    const s = buffer(.3), f = 4300 + rnd() * 500
    for (let i = 0; i < s.length; i++) { const tt = i / RATE; s[i] = Math.sin(TAU * f * tt) * Math.max(0, Math.sin(TAU * 32 * tt)) * Math.sin(Math.PI * tt / .3) * .05 }
    add(out, t, s, 1, rnd() * 1.4 - .7)
  }
}

// One effects track for a whole video: events = [[absoluteSeconds, kind]], nights = [[from, to]].
export function effectsTrack(seconds, events, nights = []) {
  const out = [buffer(seconds), buffer(seconds)]
  events.forEach(([t, kind], i) => add(out, t, sfx(kind), kind === 'whoosh' ? .5 : .8, Math.sin(i * 2.3) * .4))
  nights.forEach(([a, b], i) => crickets(out, a, b, 99 + i))
  return out
}

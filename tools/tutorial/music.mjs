// Quiet synthesized background music (no voice), 44.1 kHz stereo WAV. usage: node music.mjs out.wav seconds
import fs from 'node:fs'
const [out, secs] = [process.argv[2], +process.argv[3] || 90]
const sr = 44100, n = sr * secs, L = new Float32Array(n), R = new Float32Array(n)
const f = m => 440 * 2 ** ((m - 69) / 12)
const bpm = 84, beat = 60 / bpm
const prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]] // Am F C G
const add = (t0, dur, freq, amp, pan, kind) => {
  const s0 = Math.floor(t0 * sr), len = Math.floor(dur * sr)
  for (let i = 0; i < len && s0 + i < n; i++) {
    const t = i / sr
    const env = kind === 'pad' ? Math.min(1, t / 0.6) * Math.min(1, (dur - t) / 0.8) : Math.exp(-t * 5) * Math.min(1, t / 0.005)
    const ph = 2 * Math.PI * freq * t
    const v = (Math.sin(ph) + (kind === 'pad' ? 0.3 * Math.sin(ph * 2.003) : 0.35 * Math.sin(ph * 2))) * env * amp
    L[s0 + i] += v * (1 - pan) / 2 * 2 * 0.5; R[s0 + i] += v * (1 + pan) / 2 * 2 * 0.5
  }
}
const bar = beat * 4
for (let b = 0; b * bar < secs; b++) {
  const ch = prog[b % 4], t0 = b * bar
  ch.forEach((m, k) => add(t0, bar + 0.4, f(m), 0.07, (k - 1) * 0.5, 'pad'))
  add(t0, bar, f(ch[0] - 12), 0.10, 0, 'pad')
  const arp = [0, 1, 2, 1, 2, 1, 2, 1]
  arp.forEach((k, i) => add(t0 + i * beat / 2, 0.9, f(ch[k] + 12), 0.09, (i % 2 ? 0.4 : -0.4), 'pluck'))
}
const fade = sr * 1.5
for (let i = 0; i < n; i++) { const g = Math.min(1, i / fade, (n - i) / fade); L[i] *= g; R[i] *= g }
const buf = Buffer.alloc(44 + n * 4)
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22)
buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40)
for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4); buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4) }
fs.writeFileSync(out, buf)

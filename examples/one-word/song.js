// THE SONG ("מילה אחת"): a marimba groove in A minor; each level thins to a clock tick for the count, a bright run
// on the answer, the last level stays tense, and the end card lifts to C major. Every sound comes from score.js.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const { mtof } = require('./engine/music');
const sc = require('./score');
const { BEAT, DURATION, m, ev, clock, stages, endStart } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), fx = bus(), verb = bus();
const pan = (x) => Math.max(-1, Math.min(1, x));
const K = I.kick({ tail: 0.24 }), CL = I.clap(), HC = [I.hat(false, 11), I.hat(false, 12)], CR = I.crash(18);
const counting = (t) => stages.some((s) => s.ticks.length && t >= s.ticks[0].t - 0.01 && t < s.up);
const bars = Math.ceil(DURATION / sc.BAR);

const kicks = [];
clock.eachStep(0, bars, 16, (t, b, s) => {
  if (t >= DURATION - 1) return;
  if (counting(t)) { if (s % 8 === 0) { drums.addMono(K, t, 0.5); kicks.push(t); } return; }
  if (s % 4 === 0) { drums.addMono(K, t, 0.75); kicks.push(t); }
  if (s % 8 === 4) { drums.addMono(CL, t, 0.42); verb.addMono(CL, t, 0.15); }
  drums.addMono(HC[s % 2], t, s % 2 ? 0.15 : 0.08, -0.3);
});
clock.eachStep(0, bars, 8, (t, b, s) => {
  const c = sc.chordAt(t);
  if (!c || t >= DURATION - 1) return;
  const R = c.bass + 12;
  if (counting(t)) { if (s === 0) bass.addMono(I.bass(R, BEAT * 1.6), t, 0.42); return; }
  if (s === 0 || s === 3 || s === 4 || s === 6) bass.addMono(I.bass(R, BEAT / 2 * (s === 0 ? 1.4 : 0.8)), t, 0.5);
});
for (const c of sc.chords) for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + 0.1, { cutoff: 1400, attack: 0.25, release: 1.1 }); pad.addStereo(L, R, c.t0, 0.07); }

// the hook: two hits and the question
for (const [t, n] of [[ev.one, 'A4'], [ev.two, 'C5'], [ev.ask, 'E5']]) { fx.addMono(I.thud(100, 0.07), t, 0.45); keys.addMono(I.marimba(m(n)), t, 0.32); }
fx.addMono(I.subBoom(1.0), ev.one, 0.3);

const RUN = ['A4', 'C5', 'E5', 'A5', 'C6', 'E6', 'A6'];
for (const s of stages) {
  fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), s.t0 - 0.3, 0.16);
  drums.addMono(CR, s.t0, 0.24, -0.2);
  for (const p of s.tiles) { fx.addMono(I.pop(1100 + p.k * 90, 20 + p.k), p.t, 0.14, pan(-0.4 + p.k * 0.13)); }
  for (const k of s.ticks) {
    const hot = k.n <= 2;
    drums.addMono(I.woodTick(hot ? 1.5 : 1.15), k.t, hot ? 0.34 : 0.26, pan(k.k % 2 ? 0.2 : -0.2));
    if (hot) keys.addMono(I.marimba(m('E6')), k.t, 0.16);
  }
  if (s.reveal) s.words.forEach((_, i) => { keys.addMono(I.marimba(m(RUN[i % RUN.length])), s.reveal + i * 0.07, 0.24, pan(-0.3 + i * 0.1)); });
  if (s.open) {
    fx.addMono(I.subBoom(1.2), s.up, 0.42);
    for (const [i, f] of ['E6', 'C6', 'E6', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 0.25, 1.4, 3.5); keys.addMono(b, s.up + i * 0.09, 0.12, pan(-0.2 + i * 0.13)); }
  }
}

fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), endStart - 0.5, 0.22);
drums.addMono(CR, endStart, 0.36, 0.2); fx.addMono(I.subBoom(1.4), endStart, 0.42);
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, t] of [ev.send, ev.next, ev.url].entries()) { keys.addMono(I.marimba(m(['E5', 'G5', 'C6'][i])), t, 0.28); fx.addMono(I.pop(1300 + i * 150, 100 + i), t, 0.14); }

MIX.sidechain([pad, bass], kicks);
const stems = { drums, bass, pad, keys, fx, verb: reverb(verb, { room: 0.8, damp: 0.35 }) };
const GAIN = { drums: 0.32, bass: 0.7, pad: 2.2, keys: 1.3, fx: 0.85, verb: 1 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: null });
MIX.highpass(mix, 22);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS` : ''})`);

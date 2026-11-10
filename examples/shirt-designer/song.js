// THE SONG — bright road-trip pop at 120 BPM. Every sound comes from an event in score.js.
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const { mtof } = require('./engine/music');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), fx = bus();
const verb = bus(), dly = bus();
const pan = (x) => Math.max(-1, Math.min(1, x));
const END = T(14);
const note = (n) => (typeof n === 'number' ? n : m(n));

// ---------- drums ----------
const K = I.kick({ tail: 0.24 }), CL = I.clap(), SN = I.snare(), HC = [I.hat(false, 11), I.hat(false, 12)], CR = I.crash(18);
const SH = [I.shaker(1, 15), I.shaker(0.6, 16)];
const kicks = [];
clock.eachStep(0, 14, 16, (t, b, s) => {
  const hook = b < 2;
  if (hook ? s % 8 === 0 : s % 4 === 0 || s === 10) { drums.addMono(K, t, hook ? 0.6 : 0.8); kicks.push(t); }
  if (s % 8 === 4 && b >= 1) { drums.addMono(CL, t, hook ? 0.35 : 0.48); verb.addMono(CL, t, 0.18); }
  if (!hook) drums.addMono(HC[s % 2], t, s % 2 ? 0.16 : 0.09, -0.3);
  if (s % 2 === 0) drums.addMono(SH[s % 4 === 0 ? 1 : 0], t, 0.1, 0.35);
});
// section downbeats: crash + thud (the picture cuts with a flash on these)
for (const f of sc.steps) { drums.addMono(CR, f.t, 0.3, -0.2); fx.addMono(I.thud(120, 0.06), f.t, 0.35); }
drums.addMono(CR, ev.logo, 0.4, 0.2);
for (const f of sc.steps.concat([{ t: ev.logo }])) for (let i = 0; i < 3; i++) drums.addMono(SN, f.t - BEAT + i * BEAT / 6, 0.08 + i * 0.03, 0.1);

// ---------- bass ----------
clock.eachStep(0, 14, 8, (t, b, s) => {
  const c = sc.chordAt(t);
  if (!c) return;
  const R = c.bass + 12;
  if (b < 2) { if (s === 0 || s === 3) bass.addMono(I.bass(R, BEAT * 0.9), t, 0.45); return; }
  if (s === 0 || s === 3 || s === 4 || s === 6) bass.addMono(I.bass(s === 6 ? R + 7 : R, BEAT / 2 * (s === 0 ? 1.4 : 0.8)), t, 0.52);
});
bass.addMono(I.bass(m('D2') + 12, 2.2, { bright: 0.3, sub: 1 }), END, 0.5);

// ---------- pads + off-beat strum ----------
for (const c of sc.chords) for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + (c.t0 >= END ? 1.6 : 0.1), { cutoff: 1500, attack: 0.25, release: 1.1 }); pad.addStereo(L, R, c.t0, 0.07); }
clock.eachStep(2, 12, 8, (t, b, s) => {
  if (s % 2 !== 1) return;
  const c = sc.chordAt(t); if (!c) return;
  c.notes.forEach((n, i) => lead.addMono(I.guitar(note(n) + 12, 0.18, { bright: 0.5, seed: 50 + i + s }), t + i * 0.008, 0.07, 0.25));
});

// ---------- HOOK ----------
fx.addMono(I.thud(90, 0.08), ev.q1, 0.5);
for (const [i, f] of ['D5', 'F#5', 'A5'].entries()) keys.addMono(I.marimba(m(f)), ev.q1 + i * 0.05, 0.3, -0.2 + i * 0.2);
fx.addMono(I.thud(120, 0.07), ev.q2, 0.4); keys.addMono(I.marimba(m('D6')), ev.q2, 0.3);
fx.addMono(I.thud(120, 0.06), ev.title, 0.3); fx.addMono(I.pop(1300, 4), ev.title, 0.25);
{ const b = I.bell(mtof(m('D6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.title, 0.1); verb.addMono(b, ev.title, 0.1); }
for (const p of sc.hookOpts) { keys.addMono(I.marimba(p.midi), p.t, 0.26, pan(-0.3 + p.i * 0.2)); fx.addMono(I.pop(1600 + p.i * 150, 6 + p.i), p.t, 0.12); fx.addMono(I.paperFwip(1.0 + p.i * 0.1, 8 + p.i), p.t, 0.15); }
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 9), ev.free, 0.3);
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.2);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.25);

// ---------- chips of every step: a soft pop (+ marimba every few) ----------
for (const p of sc.AUD) { fx.addMono(I.pop(1300 + (p.i % 7) * 90, 30 + p.i), p.t, 0.13, pan(0.4 - (p.i % 3) * 0.4)); if (p.i % 2 === 0) keys.addMono(I.marimba(p.midi), p.t, 0.2); }
for (const p of sc.TOPICS) { fx.addMono(I.paperFwip(1.0 + p.i * 0.08, 50 + p.i), p.t, 0.18); keys.addMono(I.marimba(p.midi), p.t, 0.24); }
for (const o of sc.MODES) { fx.addMono(I.paperFwip(1.1, 70 + o.i), o.t, 0.2); keys.addMono(I.marimba(o.midi), o.t, 0.26); verb.addMono(I.marimba(o.midi), o.t, 0.05); }
for (const s of sc.sheetItems) { fx.addMono(I.pop(1400 + (s.i % 6) * 80, 90 + s.i), s.t, 0.12, pan(-0.4 + (s.i % 6) * 0.16)); if (s.i % 3 === 0) keys.addMono(I.marimba(s.midi), s.t, 0.2); }
// the typed title: a light tick per letter
{ const n = [...sc.TYPE.text].length; for (let i = 0; i < n; i++) fx.addMono(I.pop(2200 + (i % 3) * 120, 140 + i), sc.TYPE.t0 + (sc.TYPE.t1 - sc.TYPE.t0) * (i / n), 0.08); }
fx.addMono(I.paperFwip(0.9, 99), sc.NAMES_T, 0.25);

// ---------- taps: the shirt changes on each ----------
for (const [i, t0] of sc.taps.entries()) { fx.addMono(I.pop(1000, 160 + i), t0, 0.35); fx.addMono(I.thud(130, 0.05), t0, 0.3); keys.addMono(I.marimba(m(['A5', 'D6', 'F#6'][i % 3])), t0 + 0.08, 0.16); }
// the download: a little sparkle
fx.addMono(I.subBoom(1.0), sc.DL, 0.25);
for (const [i, f] of ['A5', 'D6', 'F#6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, sc.DL + 0.1 + i * 0.05, 0.09); verb.addMono(b, sc.DL, 0.07); }

// ---------- END ----------
fx.addMono(I.subBoom(1.5), ev.logo, 0.45);
for (const [i, f] of ['D5', 'F#5', 'A5', 'D6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, l] of sc.endLines.entries()) { keys.addMono(I.marimba(m(['F#5', 'A5', 'D6', 'F#6', 'A6'][i])), l.t, 0.26); fx.addMono(I.pop(1300 + i * 150, 100 + i), l.t, 0.12); }
{ const mb = I.musicBox(m('D6'), { decay: 2.4 }); keys.addMono(mb, END, 0.2); verb.addMono(mb, END, 0.2); }
for (const f of ['D4', 'F#4', 'A4', 'D5']) keys.addMono(I.epiano(m(f), 1.8), END, 0.12);

// ---------- extra pills of this reel: a pop + marimba on each ----------
for (const [i, t0] of sc.pills.entries()) { fx.addMono(I.pop(1350 + (i % 4) * 110, 120 + i), t0, 0.2); keys.addMono(I.marimba(m(['A5', 'D6', 'F#6', 'E6'][i % 4])), t0, 0.2); }

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => t >= T(2) && t < END));
const stems = { drums, bass, pad, keys, lead, fx, verb: reverb(verb, { room: 0.8, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.3, 3500) };
const GAIN = { drums: 0.32, bass: 0.7, pad: 2.2, keys: 1.3, lead: 3.4, fx: 0.85, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 22);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);

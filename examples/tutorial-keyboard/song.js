// THE SONG — light, bouncy pop at 120 BPM for the keyboard tutorial. Every sound comes from an event in score.js.
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
const END = T(19);
const note = (n) => (typeof n === 'number' ? n : m(n));

// ---------- drums (softer than the reels: a tutorial you listen to for 40s) ----------
const K = I.kick({ tail: 0.22 }), CL = I.clap(), SN = I.snare(), HC = [I.hat(false, 11), I.hat(false, 12)], CR = I.crash(18);
const SH = [I.shaker(1, 15), I.shaker(0.6, 16)];
const kicks = [];
clock.eachStep(0, 19, 16, (t, b, s) => {
  const hook = b < 2, end = b >= 17;
  if (hook || end ? s % 8 === 0 : s % 4 === 0 || s === 10) { drums.addMono(K, t, hook ? 0.55 : 0.7); kicks.push(t); }
  if (s % 8 === 4 && b >= 1) { drums.addMono(CL, t, 0.36); verb.addMono(CL, t, 0.16); }
  if (!hook) drums.addMono(HC[s % 2], t, s % 2 ? 0.13 : 0.07, -0.3);
  if (s % 2 === 0) drums.addMono(SH[s % 4 === 0 ? 1 : 0], t, 0.08, 0.35);
});
for (const f of sc.steps) { drums.addMono(CR, f.t, 0.26, -0.2); fx.addMono(I.thud(120, 0.06), f.t, 0.3); }
drums.addMono(CR, ev.logo, 0.36, 0.2);
for (const f of sc.steps.concat([{ t: ev.logo }])) for (let i = 0; i < 3; i++) drums.addMono(SN, f.t - BEAT + i * BEAT / 6, 0.07 + i * 0.03, 0.1);

// ---------- bass ----------
clock.eachStep(0, 19, 8, (t, b, s) => {
  const c = sc.chordAt(t);
  if (!c) return;
  const R = c.bass + 12;
  if (b < 2) { if (s === 0 || s === 3) bass.addMono(I.bass(R, BEAT * 0.9), t, 0.42); return; }
  if (s === 0 || s === 3 || s === 4 || s === 6) bass.addMono(I.bass(s === 6 ? R + 7 : R, BEAT / 2 * (s === 0 ? 1.4 : 0.8)), t, 0.48);
});
bass.addMono(I.bass(m('C2') + 12, 2.2, { bright: 0.3, sub: 1 }), END, 0.5);

// ---------- pads + off-beat strum ----------
for (const c of sc.chords) for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + (c.t0 >= END ? 1.6 : 0.1), { cutoff: 1500, attack: 0.25, release: 1.1 }); pad.addStereo(L, R, c.t0, 0.07); }
clock.eachStep(2, 17, 8, (t, b, s) => {
  if (s % 2 !== 1) return;
  const c = sc.chordAt(t); if (!c) return;
  c.notes.forEach((n, i) => lead.addMono(I.guitar(note(n) + 12, 0.18, { bright: 0.5, seed: 50 + i + s }), t + i * 0.008, 0.06, 0.25));
});

// ---------- HOOK ----------
fx.addMono(I.thud(90, 0.08), ev.q1, 0.5);
for (const [i, f] of ['C5', 'E5', 'G5'].entries()) keys.addMono(I.marimba(m(f)), ev.q1 + i * 0.05, 0.3, -0.2 + i * 0.2);
fx.addMono(I.thud(100, 0.07), ev.q2, 0.4); keys.addMono(I.marimba(m('A5')), ev.q2, 0.3);
fx.addMono(I.thud(120, 0.06), ev.title, 0.4); fx.addMono(I.pop(1300, 4), ev.title, 0.25);
{ const b = I.bell(mtof(m('C6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.title, 0.1); verb.addMono(b, ev.title, 0.1); }
for (let i = 0; i < 4; i++) { const t0 = T(1, 1 + i * 0.35); drums.addMono(I.woodTick(1.3 + i * 0.05), t0, 0.2); keys.addMono(I.marimba(m(['C6', 'D6', 'E6', 'G6'][i])), t0 + 0.35, 0.18); }
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 9), ev.free, 0.3);
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.18);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.22);

// ---------- 1. TYPING: a key click + a note per key ----------
fx.addMono(I.pop(1200, 19), T(2, 0.75), 0.25);
for (const p of sc.presses) { drums.addMono(I.woodTick(1.6 + p.i * 0.02), p.t, 0.22, pan(-0.2 + p.i * 0.05)); keys.addMono(I.marimba(p.midi), p.t, 0.22); }
fx.addMono(I.pop(1400, 22), ev.hint, 0.25); keys.addMono(I.marimba(m('G5')), ev.hint, 0.24);

// ---------- 2. NIQQUD: keys tick, chips pop ----------
for (const s of sc.niqSeq) {
  if (s.kind === 'key') drums.addMono(I.woodTick(1.6), s.t, 0.22);
  else fx.addMono(I.pop(1500 + s.i * 100, 30 + s.i), s.t, 0.26);
  keys.addMono(I.marimba(s.midi), s.t, 0.24, pan(-0.3 + s.i * 0.12));
}
fx.addMono(I.pop(1300, 39), T(6, 2), 0.2);
{ const b = I.bell(mtof(m('E6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.remove, 0.09); verb.addMono(b, ev.remove, 0.08); fx.addMono(I.pop(1400, 38), ev.remove, 0.2); }

// ---------- 3. SYMBOLS + EMOJI ----------
fx.addMono(I.pop(1300, 41), T(8, 1), 0.2);
for (const s of sc.symTaps) { fx.addMono(I.pop(1600, 42), s.t, 0.28); keys.addMono(I.marimba(s.midi), s.t, 0.26); }
fx.addMono(I.pop(1000, 43), ev.emojiBtn, 0.3); fx.addMono(I.paperFwip(1.0, 44), ev.emojiBtn + 0.1, 0.22);
for (let i = 0; i < sc.SEARCH.length; i++) drums.addMono(I.woodTick(1.8), ev.search + i * (BEAT * 1.5 / sc.SEARCH.length), 0.12);
fx.addMono(I.subBoom(0.8), ev.cake, 0.22); fx.addMono(I.thud(110, 0.07), ev.cake, 0.4);
for (const [i, f] of ['C6', 'E6', 'G6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, ev.cake + i * 0.05, 0.09); verb.addMono(b, ev.cake, 0.08); }

// ---------- 4. FINGERS ----------
fx.addMono(I.pop(1100, 51), ev.fingersOn, 0.3);
{ const sw = I.noiseSweep(0.5, 500, 4000, { q: 0.8, pink: true }); fx.addMono(sw, ev.fingersOn + 0.05, 0.12); }
for (const p of sc.fingerPresses) { drums.addMono(I.woodTick(1.5 + p.i * 0.04), p.t, 0.22); const g = I.guitar(p.midi, 0.5, { bright: 0.6, seed: 60 + p.i }); lead.addMono(g, p.t, 0.4, pan(-0.2 + p.i * 0.12)); verb.addMono(g, p.t, 0.06); }
fx.addMono(I.pop(1400, 58), ev.course, 0.24); keys.addMono(I.marimba(m('C6')), ev.course, 0.26);

// ---------- 5. COPY + SEND ----------
fx.addMono(I.pop(1000, 65), ev.copy, 0.35);
for (const [i, f] of ['G5', 'C6'].entries()) keys.addMono(I.marimba(m(f)), ev.copy + 0.08 + i * 0.08, 0.26);
fx.addMono(I.pop(1100, 66), ev.wa, 0.32); fx.addMono(I.noiseSweep(0.35, 800, 5000, { q: 0.9, pink: true }), ev.wa + 0.1, 0.14);
{ const b = I.bell(mtof(m('E6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.wa + 0.25, 0.1); verb.addMono(b, ev.wa + 0.25, 0.08); }
fx.addMono(I.pop(1400, 67), ev.saved, 0.22); keys.addMono(I.marimba(m('A5')), ev.saved, 0.24);

// ---------- END ----------
fx.addMono(I.subBoom(1.5), ev.logo, 0.42);
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, l] of sc.endLines.entries()) { keys.addMono(I.marimba(m(['E5', 'G5', 'C6', 'E6', 'G6'][i])), l.t, 0.24); fx.addMono(I.pop(1300 + i * 150, 100 + i), l.t, 0.12); }
{ const mb = I.musicBox(m('C6'), { decay: 2.4 }); keys.addMono(mb, END, 0.2); verb.addMono(mb, END, 0.2); }
for (const f of ['C4', 'E4', 'G4', 'C5']) keys.addMono(I.epiano(m(f), 1.8), END, 0.12);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => t >= T(2) && t < END));
const stems = { drums, bass, pad, keys, lead, fx, verb: reverb(verb, { room: 0.8, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.3, 3500) };
const GAIN = { drums: 0.3, bass: 0.7, pad: 2.2, keys: 1.3, lead: 3.2, fx: 0.85, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 22);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);

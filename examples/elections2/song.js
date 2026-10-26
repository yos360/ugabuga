// THE SONG — bright classroom pop at 118 BPM. Every sound comes from an event in score.js.
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
const END = T(15);
const note = (n) => (typeof n === 'number' ? n : m(n));

// ---------- drums ----------
const K = I.kick({ tail: 0.24 }), CL = I.clap(), SN = I.snare(), HC = [I.hat(false, 11), I.hat(false, 12)], CR = I.crash(18);
const SH = [I.shaker(1, 15), I.shaker(0.6, 16)];
const kicks = [];
clock.eachStep(0, 15, 16, (t, b, s) => {
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
clock.eachStep(0, 15, 8, (t, b, s) => {
  const c = sc.chordAt(t);
  if (!c) return;
  const R = c.bass + 12;
  if (b < 2) { if (s === 0 || s === 3) bass.addMono(I.bass(R, BEAT * 0.9), t, 0.45); return; }
  if (s === 0 || s === 3 || s === 4 || s === 6) bass.addMono(I.bass(s === 6 ? R + 7 : R, BEAT / 2 * (s === 0 ? 1.4 : 0.8)), t, 0.52);
});
bass.addMono(I.bass(m('C2') + 12, 2.2, { bright: 0.3, sub: 1 }), END, 0.5);

// ---------- pads + off-beat strum ----------
for (const c of sc.chords) for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + (c.t0 >= END ? 1.6 : 0.1), { cutoff: 1500, attack: 0.25, release: 1.1 }); pad.addStereo(L, R, c.t0, 0.07); }
clock.eachStep(2, 13, 8, (t, b, s) => {
  if (s % 2 !== 1) return;
  const c = sc.chordAt(t); if (!c) return;
  c.notes.forEach((n, i) => lead.addMono(I.guitar(note(n) + 12, 0.18, { bright: 0.5, seed: 50 + i + s }), t + i * 0.008, 0.07, 0.25));
});

// ---------- HOOK ----------
fx.addMono(I.thud(90, 0.08), ev.hook1, 0.5);
for (const [i, f] of ['C5', 'E5', 'G5'].entries()) keys.addMono(I.marimba(m(f)), ev.hook1 + i * 0.05, 0.3, -0.2 + i * 0.2);
fx.addMono(I.thud(95, 0.07), ev.hook1 + BEAT, 0.3); keys.addMono(I.marimba(m('E5')), ev.hook1 + BEAT, 0.26); fx.addMono(I.thud(100, 0.07), ev.hook2, 0.4); fx.addMono(I.pop(1200, 7), ev.hook2, 0.25); keys.addMono(I.marimba(m('C6')), ev.hook2, 0.3);
fx.addMono(I.paperFwip(0.9, 2), ev.box - 0.02, 0.3, 0.3);
fx.addMono(I.paperFwip(1.1, 3), ev.line - 0.02, 0.25);
for (const [i, f] of ['G4', 'C5', 'E5', 'G5', 'C6'].entries()) keys.addMono(I.marimba(m(f)), ev.line + i * BEAT / 4, 0.24, -0.4 + i * 0.2);
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 4), ev.free, 0.3);
{ const b = I.bell(mtof(m('C6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.free, 0.1); verb.addMono(b, ev.free, 0.1); }
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.2);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.25);

// ---------- 1. MODES ----------
for (const md of sc.modes) { keys.addMono(I.marimba(md.midi), md.t, 0.3, pan(-0.4 + md.i * 0.2)); fx.addMono(I.pop(1800 + md.i * 200, 10 + md.i), md.t, 0.12); }
fx.addMono(I.pop(1100, 20), ev.pickMode, 0.35);
for (const [i, f] of ['C6', 'E6', 'G6'].entries()) { const b = I.bell(mtof(m(f)), 0.6, 1.2, 3.5); keys.addMono(b, ev.pickMode + 0.06 + i * 0.05, 0.07); verb.addMono(b, ev.pickMode, 0.06); }

// ---------- 2. NAMES: key clicks, then each name pops as a chip ----------
sc.typing.forEach((k, i) => drums.addMono(I.woodTick(1.6 + (i % 3) * 0.08), k.t, 0.16, 0.15));
for (const c of sc.nameChips) { const g = I.guitar(c.midi, 0.5, { bright: 0.6, seed: 60 + c.i }); lead.addMono(g, c.t, 0.5, pan(-0.2 + c.i * 0.2)); verb.addMono(g, c.t, 0.1); fx.addMono(I.pop(1600 + c.i * 200, 30 + c.i), c.t, 0.12); }
fx.addMono(I.pop(1000, 45), ev.toPrint, 0.3);

// ---------- 3. PRINT ----------
for (const p of sc.ballots) {
  fx.addMono(I.paperFwip(0.9 + p.i * 0.1, 60 + p.i), p.t, 0.3, pan(-0.2 + p.i * 0.13));
  keys.addMono(I.marimba(p.midi), p.t, 0.28); verb.addMono(I.marimba(p.midi), p.t, 0.06);
  fx.addMono(I.scribble(BEAT * 0.5, 70 + p.i), p.t - BEAT * 0.55, 0.05, 0.2);
}
for (const e of sc.extras) { fx.addMono(I.paperFwip(1.3, 80), e.t, 0.3); keys.addMono(I.marimba(e.midi), e.t, 0.3); fx.addMono(I.thud(150, 0.05), e.t, 0.2); }
fx.addMono(I.pop(1300, 85), sc.readyPill, 0.2);

// ---------- 4. VOTE: pick, press, and each slip lands in the box ----------
fx.addMono(I.pop(1300, 90), ev.pick, 0.3);
fx.addMono(I.paperFwip(1.2, 91), ev.drop + 0.1, 0.25);
fx.addMono(I.thud(160, 0.05), ev.drop + 0.36, 0.4); keys.addMono(I.marimba(m('G5')), ev.drop + 0.36, 0.3);
sc.slips.forEach((s, i) => {
  drums.addMono(I.woodTick(0.9 + (i % 4) * 0.06), s.t, 0.22, pan(-0.2 + (i % 5) * 0.1));
  const mb = I.musicBox(m(['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'C7'][i])); keys.addMono(mb, s.t, 0.16, pan(-0.3 + i * 0.06)); verb.addMono(mb, s.t, 0.1);
});

// ---------- 5. COUNT: tally ticks while the bars grow, then the reveal ----------
sc.countTicks.forEach((t, i) => drums.addMono(I.woodTick(1.2 + i * 0.02), t, 0.13, 0.2));
fx.addMono(I.noiseSweep(BEAT * 3.5, 400, 4000, { q: 1, pink: true, shape: (x) => x * x }), T(11, 0.25), 0.12);
fx.addMono(I.subBoom(1.2), ev.reveal, 0.35); fx.addMono(I.thud(110, 0.07), ev.reveal, 0.5);
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, ev.reveal + i * 0.045, 0.1, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.reveal, 0.08); }
fx.addMono(I.fireworkBurst(7, 0.5), ev.reveal, 0.12);
fx.addMono(I.pop(1400, 95), ev.note, 0.18); keys.addMono(I.marimba(m('E6')), ev.note, 0.24);

// ---------- END ----------
fx.addMono(I.subBoom(1.5), ev.logo, 0.45);
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, l] of sc.endLines.entries()) { keys.addMono(I.marimba(m(['E5', 'G5', 'C6', 'E6'][i])), l.t, 0.26); fx.addMono(I.pop(1300 + i * 150, 100 + i), l.t, 0.12); }
{ const mb = I.musicBox(m('C6'), { decay: 2.4 }); keys.addMono(mb, END, 0.2); verb.addMono(mb, END, 0.2); }
for (const f of ['C4', 'E4', 'G4', 'C5']) keys.addMono(I.epiano(m(f), 1.8), END, 0.12);

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

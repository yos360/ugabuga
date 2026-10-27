// THE SONG — a playful "mystery" pop groove at 120 BPM (A minor). Every sound comes from an event in score.js.
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
bass.addMono(I.bass(m('C2') + 12, 2.2, { bright: 0.3, sub: 1 }), END, 0.5);

// ---------- pads + pizzicato off-beats (sneaky) ----------
for (const c of sc.chords) for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + (c.t0 >= END ? 1.6 : 0.1), { cutoff: 1400, attack: 0.25, release: 1.1 }); pad.addStereo(L, R, c.t0, 0.07); }
clock.eachStep(2, 12, 8, (t, b, s) => {
  if (s % 2 !== 1) return;
  const c = sc.chordAt(t); if (!c) return;
  c.notes.forEach((n, i) => lead.addMono(I.guitar(note(n) + 12, 0.16, { bright: 0.45, seed: 50 + i + s }), t + i * 0.008, 0.07, 0.25));
});

// ---------- HOOK ----------
fx.addMono(I.thud(90, 0.08), ev.q1, 0.5);
for (const [i, f] of ['A4', 'C5', 'E5'].entries()) keys.addMono(I.marimba(m(f)), ev.q1 + i * 0.05, 0.3, -0.2 + i * 0.2);
fx.addMono(I.subBoom(0.8), ev.q2, 0.3); fx.addMono(I.thud(100, 0.08), ev.q2, 0.45); // "נעלמה!"
{ const b = I.bell(mtof(m('G#5')), 0.8, 1.4, 3.5); keys.addMono(b, ev.q2, 0.1); verb.addMono(b, ev.q2, 0.1); }
fx.addMono(I.thud(120, 0.06), ev.title, 0.4); fx.addMono(I.pop(1300, 4), ev.title, 0.25);
{ const b = I.bell(mtof(m('A5')), 0.9, 1.4, 3.5); keys.addMono(b, ev.title, 0.1); verb.addMono(b, ev.title, 0.1); }
for (const p of sc.hookPills) { keys.addMono(I.marimba(p.midi), p.t, 0.26, pan(-0.3 + p.i * 0.3)); fx.addMono(I.pop(1600 + p.i * 200, 6 + p.i), p.t, 0.12); }
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 9), ev.free, 0.3);
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.2);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.25);

// clear downbeat hits where the section before ends with a long tail
for (const t0 of [T(4), T(10)]) { fx.addMono(I.pop(900, 200), t0, 0.45); fx.addMono(I.thud(100, 0.08), t0, 0.5); }

// ---------- 1. ROOMS: setting tap, a card per 3 eighths, the pick ----------
fx.addMono(I.pop(1400, 20), sc.settingTap.t, 0.25); keys.addMono(I.marimba(sc.settingTap.midi), sc.settingTap.t, 0.26);
for (const r of sc.ROOMS) { fx.addMono(I.paperFwip(1.0 + r.i * 0.05, 21 + r.i), r.t, 0.22); keys.addMono(I.marimba(r.midi), r.t, 0.28, pan(0.3 - r.i * 0.2)); }
fx.addMono(I.pop(1000, 25), ev.pick, 0.35); fx.addMono(I.thud(130, 0.05), ev.pick, 0.35);
drums.addMono(I.woodTick(1.6), ev.pick + 0.08, 0.2); // the key turns
for (const [i, f] of ['C5', 'E5', 'A5'].entries()) keys.addMono(I.marimba(m(f)), ev.pick + i * 0.05, 0.22);

// ---------- 2. LEVELS: a card per beat, taps, locks ----------
for (const l of sc.LEVELS) { fx.addMono(I.paperFwip(1.1, 30 + l.i), l.t, 0.2); keys.addMono(I.marimba(l.midi), l.t, 0.28); }
for (const p of sc.levelTaps) {
  fx.addMono(I.pop(1300 + p.i * 150, 33 + p.i), p.t, 0.25);
  const n = sc.LEVELS[p.k].count;
  for (let k = 0; k < Math.min(n, 4); k++) drums.addMono(I.woodTick(1.3 + k * 0.08), p.t + k * 0.04, 0.1, pan(0.3 - k * 0.15));
  keys.addMono(I.marimba(p.midi), p.t, 0.28);
}
for (let k = 0; k < 4; k++) drums.addMono(I.woodTick(1.3 + k * 0.08), T(4, 3) + k * 0.04, 0.1, pan(0.3 - k * 0.15));
fx.addMono(I.pop(1300, 39), T(5, 3), 0.18); keys.addMono(I.marimba(m('E6')), T(5, 3), 0.2);

// ---------- 3. SOLVE: balloons, typing, the lock opens ----------
fx.addMono(I.pop(1200, 40), T(6, 0.25), 0.15);
for (const b of sc.balloons) { fx.addMono(I.pop(1700 + b.i * 90, 41 + b.i), b.t, 0.2, pan(0.4 - b.i * 0.12)); keys.addMono(I.marimba(b.midi), b.t, 0.2, pan(0.4 - b.i * 0.12)); }
drums.addMono(I.woodTick(2.2), ev.type, 0.3); fx.addMono(I.pop(2200, 50), ev.type, 0.15); // key press "4"
fx.addMono(I.pop(1000, 51), ev.check, 0.35); fx.addMono(I.thud(110, 0.07), ev.check, 0.45); fx.addMono(I.subBoom(1.0), ev.check, 0.25);
drums.addMono(I.woodTick(1.8), ev.check + 0.06, 0.25); // unlock click
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, ev.check + 0.1 + i * 0.045, 0.1, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.check, 0.08); }
fx.addMono(I.fireworkBurst(7, 0.5), ev.check, 0.12);

// ---------- 4. HINTS: two hint pops, counting the stars, solved ----------
for (const h of sc.hintTaps) { fx.addMono(I.pop(1400 + h.i * 200, 60 + h.i), h.t, 0.28); const b = I.bell(mtof(h.midi), 0.6, 1.4, 3.5); keys.addMono(b, h.t, 0.12); verb.addMono(b, h.t, 0.08); }
for (const c of sc.counts) { keys.addMono(I.marimba(c.midi), c.t, 0.3, pan(0.3 - c.k * 0.2)); fx.addMono(I.pop(1500 + c.k * 120, 64 + c.k), c.t, 0.15); }
fx.addMono(I.pop(1000, 69), ev.solved, 0.35); fx.addMono(I.thud(110, 0.07), ev.solved, 0.45); fx.addMono(I.subBoom(1.0), ev.solved, 0.25);
for (const [i, f] of ['E5', 'G#5', 'B5', 'E6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, ev.solved + 0.08 + i * 0.045, 0.1, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.solved, 0.08); }
fx.addMono(I.fireworkBurst(8, 0.35), ev.solved, 0.07);

// ---------- 5. KIT: a page per 16th, the pills ----------
for (const p of sc.pages) { fx.addMono(I.paperFwip(0.9 + p.i * 0.06, 70 + p.i), p.t, 0.2, pan(0.4 - p.i * 0.1)); keys.addMono(I.marimba(p.midi), p.t, 0.2, pan(0.3 - p.i * 0.08)); }
fx.addMono(I.pop(1400, 79), sc.kitPill.t, 0.22); keys.addMono(I.marimba(m('A5')), sc.kitPill.t, 0.26);
fx.addMono(I.pop(1300, 80), T(11, 3), 0.2); keys.addMono(I.marimba(m('B5')), T(11, 3), 0.24);

// ---------- END ----------
fx.addMono(I.subBoom(1.5), ev.logo, 0.45);
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, l] of sc.endLines.entries()) { keys.addMono(I.marimba(m(['E5', 'G5', 'C6', 'E6'][i])), l.t, 0.26); fx.addMono(I.pop(1300 + i * 150, 100 + i), l.t, 0.12); }
{ const mb = I.musicBox(m('C6'), { decay: 2.4 }); keys.addMono(mb, END, 0.2); verb.addMono(mb, END, 0.2); }
for (const f of ['C4', 'E4', 'G4', 'D5']) keys.addMono(I.epiano(m(f), 1.8), END, 0.12);

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

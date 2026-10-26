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
bass.addMono(I.bass(m('C2') + 12, 2.2, { bright: 0.3, sub: 1 }), END, 0.5);

// ---------- pads + off-beat strum ----------
for (const c of sc.chords) for (const n of c.notes) { const { L, R } = I.padNote(n, c.t1 - c.t0 + (c.t0 >= END ? 1.6 : 0.1), { cutoff: 1500, attack: 0.25, release: 1.1 }); pad.addStereo(L, R, c.t0, 0.07); }
clock.eachStep(2, 12, 8, (t, b, s) => {
  if (s % 2 !== 1) return;
  const c = sc.chordAt(t); if (!c) return;
  c.notes.forEach((n, i) => lead.addMono(I.guitar(note(n) + 12, 0.18, { bright: 0.5, seed: 50 + i + s }), t + i * 0.008, 0.07, 0.25));
});

// ---------- HOOK ----------
fx.addMono(I.thud(90, 0.08), ev.hook1, 0.5);
for (const [i, f] of ['C5', 'E5', 'G5'].entries()) keys.addMono(I.marimba(m(f)), ev.hook1 + i * 0.05, 0.3, -0.2 + i * 0.2);
fx.addMono(I.thud(100, 0.07), ev.hook2, 0.35); keys.addMono(I.marimba(m('C6')), ev.hook2, 0.3);
for (const f of sc.fan) { fx.addMono(I.paperFwip(1 + f.i * 0.1, 2 + f.i), f.t, 0.28, -0.3 + f.i * 0.3); keys.addMono(I.marimba(f.midi), f.t, 0.26); }
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 4), ev.free, 0.3);
{ const b = I.bell(mtof(m('C6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.free, 0.1); verb.addMono(b, ev.free, 0.1); }
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.2);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.25);

// ---------- 1. STYLES: a rising run, one note per thumbnail ----------
for (const s of sc.styles) { const mb = I.musicBox(s.midi); keys.addMono(mb, s.t, 0.12, pan(-0.45 + s.i * 0.08)); verb.addMono(mb, s.t, 0.08); fx.addMono(I.pop(1800 + s.i * 90, 10 + s.i), s.t, 0.06); }
fx.addMono(I.pop(1100, 20), ev.tapStyle, 0.35);
for (const [i, f] of ['C6', 'E6', 'G6'].entries()) { const b = I.bell(mtof(m(f)), 0.6, 1.2, 3.5); keys.addMono(b, ev.tapStyle + 0.06 + i * 0.05, 0.07); verb.addMono(b, ev.tapStyle, 0.06); }
fx.addMono(I.pop(1400, 25), ev.styleLabel, 0.18);

// ---------- 2. FILL: key clicks, a marimba note per update ----------
for (const f of sc.fills) { drums.addMono(I.woodTick(1.6 + (f.i % 3) * 0.08), f.t, 0.18, 0.15); keys.addMono(I.marimba(f.midi), f.t, 0.2, pan(-0.3 + f.i * 0.08)); }

// ---------- 3. CUSTOM: a sparkle per new look ----------
for (const v of sc.variants) {
  fx.addMono(I.noiseSweep(0.18, 3000, 9000, { q: 1.2 }), v.t - 0.05, 0.12);
  const g = I.guitar(v.midi, 0.6, { bright: 0.6, seed: 60 + v.i }); lead.addMono(g, v.t, 0.5, pan(-0.2 + v.i * 0.13)); verb.addMono(g, v.t, 0.1);
  for (const [k, f] of [12, 19, 24].entries()) { const b = I.bell(mtof(v.midi + f), 0.4, 1.2, 3.5); keys.addMono(b, v.t + 0.03 + k * 0.04, 0.04); }
}

// ---------- 4. SHARE: a whoosh as it sends, a ping per reply ----------
for (const c of sc.chat) {
  if (c.who === 'me') { fx.addMono(I.noiseSweep(0.25, 800, 5000, { q: 1, pink: true }), c.t - 0.2, 0.18); fx.addMono(I.pop(1200, 40 + c.i), c.t, 0.3); }
  else { const e = I.epiano(c.midi, 0.5); keys.addMono(e, c.t, 0.3, pan(-0.3 + c.i * 0.15)); verb.addMono(e, c.t, 0.08); fx.addMono(I.pop(2400, 50 + c.i), c.t, 0.12); }
}

// ---------- 5. MONTAGE: a card flip per beat ----------
for (const c of sc.montage) { fx.addMono(I.paperFwip(1.1 + (c.i % 4) * 0.08, 70 + c.i), c.t - 0.03, 0.26, pan(-0.2 + (c.i % 3) * 0.2)); keys.addMono(I.marimba(c.midi), c.t, 0.26); }

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

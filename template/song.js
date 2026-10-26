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
fx.addMono(I.thud(100, 0.07), ev.q1 + BEAT, 0.35); keys.addMono(I.marimba(m('A5')), ev.q1 + BEAT, 0.28);
fx.addMono(I.noiseSweep(BEAT * 1.6, 300, 2500, { q: 0.8, pink: true }), ev.q2, 0.12, 0.4); // the car drives in
fx.addMono(I.thud(120, 0.06), ev.title, 0.4); fx.addMono(I.pop(1300, 4), ev.title, 0.25);
{ const b = I.bell(mtof(m('D6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.title, 0.1); verb.addMono(b, ev.title, 0.1); }
for (const p of sc.hookPills) { keys.addMono(I.marimba(p.midi), p.t, 0.26, pan(-0.3 + p.i * 0.3)); fx.addMono(I.pop(1600 + p.i * 200, 6 + p.i), p.t, 0.12); }
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 9), ev.free, 0.3);
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.2);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.25);

// ---------- 1. KIT: three picks, the button, then a page per 16th ----------
for (const p of sc.picks) { fx.addMono(I.pop(1300 + p.i * 150, 20 + p.i), p.t, 0.25); keys.addMono(I.marimba(p.midi), p.t, 0.26); }
fx.addMono(I.pop(1000, 25), ev.make, 0.35); fx.addMono(I.thud(130, 0.05), ev.make, 0.3);
for (const p of sc.pages) { fx.addMono(I.paperFwip(0.9 + p.i * 0.06, 30 + p.i), p.t, 0.2, pan(0.4 - p.i * 0.1)); keys.addMono(I.marimba(p.midi), p.t, 0.2, pan(0.3 - p.i * 0.08)); }
{ const t0 = sc.pages[7].t + BEAT; fx.addMono(I.pop(1400, 39), t0, 0.2); keys.addMono(I.marimba(m('D6')), t0, 0.26); }

// ---------- 2. BINGO: a mark per 3 eighths, then the line ----------
for (const k of sc.marks) { fx.addMono(I.pop(1500 + k.i * 120, 40 + k.i), k.t, 0.25); const g = I.guitar(k.midi, 0.5, { bright: 0.6, seed: 60 + k.i }); lead.addMono(g, k.t, 0.45, pan(-0.2 + k.i * 0.1)); verb.addMono(g, k.t, 0.08); }
fx.addMono(I.subBoom(1.0), ev.bingo, 0.3); fx.addMono(I.thud(110, 0.07), ev.bingo, 0.45);
for (const [i, f] of ['D5', 'F#5', 'A5', 'D6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, ev.bingo + 0.1 + i * 0.045, 0.1, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.bingo, 0.08); }
fx.addMono(I.fireworkBurst(7, 0.5), ev.bingo, 0.12);

// ---------- 3. WAITING: place taps, a card per 3 beats ----------
for (const p of sc.placeTaps) { fx.addMono(I.pop(1400 + p.i * 150, 50 + p.i), p.t, 0.22); keys.addMono(I.marimba(p.midi), p.t, 0.22); }
for (const g of sc.games) { fx.addMono(I.paperFwip(1.1, 55 + g.i), g.t, 0.22); keys.addMono(I.marimba(g.midi), g.t, 0.3); verb.addMono(I.marimba(g.midi), g.t, 0.06); }
fx.addMono(I.pop(1300, 59), T(7, 3), 0.2);

// ---------- 4. TIMER: start, ticks while the car drives, arrival ----------
fx.addMono(I.pop(1000, 65), ev.go, 0.35);
fx.addMono(I.noiseSweep(ev.arrive - ev.go, 250, 1800, { q: 0.7, pink: true }), ev.go, 0.08, -0.2);
sc.timerTicks.forEach((t, i) => drums.addMono(I.woodTick(1.2 + i * 0.03), t, 0.13, 0.2));
fx.addMono(I.subBoom(1.0), ev.arrive, 0.3); fx.addMono(I.thud(110, 0.07), ev.arrive, 0.45);
for (const [i, f] of ['A5', 'D6', 'F#6'].entries()) { const b = I.bell(mtof(m(f)), 1.0, 1.6, 3.5); keys.addMono(b, ev.arrive + i * 0.05, 0.1); verb.addMono(b, ev.arrive, 0.08); }
fx.addMono(I.fireworkBurst(8, 0.5), ev.arrive, 0.12);

// ---------- 5. MORE: a card per pop ----------
for (const x of sc.extras) { fx.addMono(I.pop(1400 + x.i * 150, 70 + x.i), x.t, 0.25); keys.addMono(I.marimba(x.midi), x.t, 0.3, pan(-0.3 + x.i * 0.2)); verb.addMono(I.marimba(x.midi), x.t, 0.06); }
fx.addMono(I.pop(1300, 79), T(11, 3), 0.2); keys.addMono(I.marimba(m('E6')), T(11, 3), 0.24);

// ---------- END ----------
fx.addMono(I.subBoom(1.5), ev.logo, 0.45);
for (const [i, f] of ['D5', 'F#5', 'A5', 'D6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, l] of sc.endLines.entries()) { keys.addMono(I.marimba(m(['F#5', 'A5', 'D6', 'F#6'][i])), l.t, 0.26); fx.addMono(I.pop(1300 + i * 150, 100 + i), l.t, 0.12); }
{ const mb = I.musicBox(m('D6'), { decay: 2.4 }); keys.addMono(mb, END, 0.2); verb.addMono(mb, END, 0.2); }
for (const f of ['D4', 'F#4', 'A4', 'D5']) keys.addMono(I.epiano(m(f), 1.8), END, 0.12);

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

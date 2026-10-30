// THE SONG — bright C-major marimba pop at 120 BPM. Every sound comes from an event in score.js.
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
fx.addMono(I.thud(90, 0.08), ev.q1, 0.5);
for (const [i, f] of ['C5', 'E5', 'G5'].entries()) keys.addMono(I.marimba(m(f)), ev.q1 + i * 0.05, 0.3, -0.2 + i * 0.2);
fx.addMono(I.thud(100, 0.07), ev.q1 + BEAT, 0.35); keys.addMono(I.marimba(m('A5')), ev.q1 + BEAT, 0.28);
fx.addMono(I.noiseSweep(BEAT * 1.6, 300, 2500, { q: 0.8, pink: true }), ev.q2 - BEAT * 0.4, 0.1, 0.4);
fx.addMono(I.pop(900, 3), ev.q2, 0.3);
fx.addMono(I.thud(120, 0.06), ev.title, 0.4); fx.addMono(I.pop(1300, 4), ev.title, 0.25);
{ const b = I.bell(mtof(m('C6')), 0.9, 1.4, 3.5); keys.addMono(b, ev.title, 0.1); verb.addMono(b, ev.title, 0.1); }
for (const p of sc.hookPills) { keys.addMono(I.marimba(p.midi), p.t, 0.26, pan(-0.3 + p.i * 0.3)); fx.addMono(I.pop(1600 + p.i * 200, 6 + p.i), p.t, 0.12); }
fx.addMono(I.thud(140, 0.05), ev.free, 0.4); fx.addMono(I.pop(1500, 9), ev.free, 0.3);
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.2);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.25);

// ---------- 1. PATH: a node per third of a beat, three legend pills, the tap ----------
for (const n of sc.nodes) { fx.addMono(I.pop(1200 + n.i * 90, 20 + n.i), n.t, 0.2, pan(0.4 - n.i * 0.06)); keys.addMono(I.marimba(n.midi), n.t, 0.2, pan(0.4 - n.i * 0.06)); }
for (const l of sc.legend) { fx.addMono(I.pop(1400 + l.i * 150, 40 + l.i), l.t, 0.2); keys.addMono(I.marimba(l.midi), l.t, 0.24); }
fx.addMono(I.pop(1000, 45), ev.unlock, 0.35); fx.addMono(I.thud(130, 0.05), ev.unlock, 0.3);

// ---------- 2. PLAY: keypad taps, two right answers ----------
for (const p of sc.taps1.concat(sc.taps2)) { fx.addMono(I.pop(1300 + p.i * 150, 50 + p.i), p.t, 0.22); keys.addMono(I.marimba(p.midi), p.t, 0.22); }
for (const [k, t] of [[0, sc.check1], [1, sc.check2]]) {
  fx.addMono(I.pop(1100, 55 + k), t, 0.3); fx.addMono(I.thud(120, 0.05), t, 0.3);
  for (const [i, f] of ['C6', 'E6', 'G6'].entries()) { const b = I.bell(mtof(m(f)), 0.8, 1.4, 3.5); keys.addMono(b, t + i * 0.05, 0.1, pan(-0.2 + i * 0.2)); verb.addMono(b, t, 0.06); }
}
for (const p of sc.playPills) { fx.addMono(I.pop(1500, 60), p.t, 0.2); keys.addMono(I.marimba(p.midi), p.t, 0.26); }

// ---------- 3. HINT: a wrong answer, then the hint in four lines ----------
for (const p of sc.wtaps) { fx.addMono(I.pop(1300 + p.i * 150, 65 + p.i), p.t, 0.22); keys.addMono(I.marimba(p.midi), p.t, 0.22); }
fx.addMono(I.thud(80, 0.08), ev.wrong, 0.45); keys.addMono(I.marimba(m('E4')), ev.wrong, 0.26); keys.addMono(I.marimba(m('Bb3')), ev.wrong + 0.12, 0.2);
for (const l of sc.wlines) { fx.addMono(I.paperFwip(1.0 + l.i * 0.05, 70 + l.i), l.t, 0.2); keys.addMono(I.marimba(l.midi), l.t, 0.28); verb.addMono(I.marimba(l.midi), l.t, 0.06); }
fx.addMono(I.pop(1000, 79), ev.next, 0.35);

// ---------- 4. STARS: three stars, thresholds, next stage ----------
for (const s of sc.starsT) { fx.addMono(I.pop(1500 + s.i * 200, 80 + s.i), s.t, 0.25); const b = I.bell(mtof(s.midi), 1.0, 1.6, 3.5); keys.addMono(b, s.t, 0.12, pan(-0.3 + s.i * 0.3)); verb.addMono(b, s.t, 0.08); }
fx.addMono(I.subBoom(1.0), sc.starsT[2].t, 0.3); fx.addMono(I.thud(110, 0.07), sc.starsT[2].t, 0.45);
fx.addMono(I.fireworkBurst(7, 0.5), sc.starsT[2].t, 0.12);
for (const r of sc.rules) { fx.addMono(I.pop(1300 + r.i * 150, 85 + r.i), r.t, 0.22); keys.addMono(I.marimba(r.midi), r.t, 0.24); }
fx.addMono(I.pop(1000, 89), sc.nextBtn, 0.35);

// ---------- 5. SHEET: two pages, the answers write in, three pills ----------
for (const p of sc.sheets) { fx.addMono(I.paperFwip(0.9, 90), p.t, 0.25); keys.addMono(I.marimba(p.midi), p.t, 0.28); }
for (let i = 0; i < 10; i++) drums.addMono(I.woodTick(1.1 + i * 0.04), sc.answerFill + i * BEAT / 4, 0.12, 0.2);
for (const p of sc.sheetPills) { fx.addMono(I.pop(1400 + p.i * 150, 95 + p.i), p.t, 0.22); keys.addMono(I.marimba(p.midi), p.t, 0.28); verb.addMono(I.marimba(p.midi), p.t, 0.06); }

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

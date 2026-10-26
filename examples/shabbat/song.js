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
  if (s % 8 === 4 && b >= 2) { drums.addMono(CL, t, hook ? 0.35 : 0.48); verb.addMono(CL, t, 0.18); }
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

// ---------- HOOK: sunset, two candles light on beats ----------
for (const [i, f] of ['D5', 'F#5', 'A5'].entries()) keys.addMono(I.musicBox(m(f)), ev.hook1 + i * 0.08, 0.22, -0.2 + i * 0.2);
keys.addMono(I.marimba(m('D6')), ev.hook2, 0.25);
for (const [k, tc] of [ev.candle1, ev.candle2].entries()) {
  fx.addMono(I.noiseSweep(0.22, 2500, 800, { q: 0.8 }), tc - 0.06, 0.12); // the match
  const b = I.bell(mtof(m(['A5', 'D6'][k])), 1.4, 1.4, 3.5); keys.addMono(b, tc, 0.12, k ? 0.25 : -0.25); verb.addMono(b, tc, 0.15);
}
fx.addMono(I.pop(1300, 4), ev.parashaPill, 0.2); keys.addMono(I.marimba(m('F#6')), ev.parashaPill, 0.2);
for (const f of sc.steps) fx.addMono(I.noiseSweep(0.3, 600, 5000, { q: 0.9, pink: true }), f.t - 0.5, 0.16);
fx.addMono(I.noiseSweep(0.4, 400, 6000, { q: 0.9, pink: true }), ev.logo - 0.6, 0.2);

// ---------- 1. TIMES ----------
for (const c of sc.cities) { keys.addMono(I.marimba(c.midi), c.t, 0.26, pan(-0.3 + c.i * 0.2)); fx.addMono(I.pop(1500 + c.i * 150, 10 + c.i), c.t, 0.1); }
{ const b = I.bell(mtof(sc.havdala.midi), 1.2, 1.4, 3.5); keys.addMono(b, sc.havdala.t, 0.1); verb.addMono(b, sc.havdala.t, 0.1); }

// ---------- 2. PARASHA ----------
for (const st of sc.story) { const g = I.guitar(st.midi, 0.8, { bright: 0.55, seed: 60 + st.i }); lead.addMono(g, st.t, 0.5, pan(-0.2 + st.i * 0.2)); verb.addMono(g, st.t, 0.12); fx.addMono(I.paperFwip(1.1, 30 + st.i), st.t - 0.03, 0.12); }
for (let i = 0; i < 6; i++) { const b = I.bell(mtof(m(['D6', 'F#6', 'A6', 'D7', 'A6', 'F#6'][i])), 0.5, 1.2, 3.5); keys.addMono(b, sc.starsT + i * 0.07, 0.05, pan(-0.5 + i * 0.2)); }

// ---------- 3. QUIZ ----------
for (const q of sc.questions) { keys.addMono(I.marimba(q.midi), q.t, 0.26, pan(-0.3 + q.i * 0.2)); fx.addMono(I.pop(1800 + q.i * 150, 40 + q.i), q.t, 0.1); }
for (const sh of sc.sheets) { fx.addMono(I.paperFwip(0.95 + sh.i * 0.1, 50 + sh.i), sh.t, 0.3); fx.addMono(I.scribble(BEAT * 0.5, 55 + sh.i), sh.t - BEAT * 0.55, 0.05, 0.2); keys.addMono(I.marimba(sh.midi), sh.t, 0.26); }

// ---------- 4. PACK ----------
for (const p of sc.packPages) { fx.addMono(I.paperFwip(1 + p.i * 0.08, 70 + p.i), p.t - 0.02, 0.24, pan(-0.4 + p.i * 0.2)); keys.addMono(I.musicBox(p.midi), p.t, 0.18); verb.addMono(I.musicBox(p.midi), p.t, 0.08); }
for (let i = 0; i < 4; i++) fx.addMono(I.woodTick(2.2 + i * 0.05), sc.scissors + i * BEAT / 4, 0.14, 0.2); // snip-snip

// ---------- 5. MORE ----------
for (const c of sc.more) { keys.addMono(I.marimba(c.midi), c.t, 0.28); fx.addMono(I.pop(1400 + c.i * 200, 90 + c.i), c.t, 0.14); }
{ const e = I.epiano(sc.question.midi, 1.2); keys.addMono(e, sc.question.t, 0.3); verb.addMono(e, sc.question.t, 0.12); fx.addMono(I.thud(120, 0.05), sc.question.t, 0.25); }

// ---------- END ----------
fx.addMono(I.subBoom(1.5), ev.logo, 0.45);
for (const [i, f] of ['C5', 'E5', 'G5', 'C6'].entries()) { const b = I.bell(mtof(m(f)), 1.4, 1.6, 3.5); keys.addMono(b, ev.logo + i * 0.06, 0.09, pan(-0.3 + i * 0.2)); verb.addMono(b, ev.logo, 0.08); }
for (const [i, l] of sc.endLines.entries()) { keys.addMono(I.marimba(m(['E5', 'G5', 'C6', 'E6'][i])), l.t, 0.26); fx.addMono(I.pop(1300 + i * 150, 100 + i), l.t, 0.12); }
{ const mb = I.musicBox(m('C6'), { decay: 2.4 }); keys.addMono(mb, END, 0.2); verb.addMono(mb, END, 0.2); }
for (const f of ['C4', 'E4', 'G4', 'C5']) keys.addMono(I.epiano(m(f), 1.8), END, 0.12);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => t >= T(2) && t < END));
const stems = { drums, bass, pad, keys, lead, fx, verb: reverb(verb, { room: 0.8, damp: 0.35 }), dly: pingpong(dly, BEAT * 0.75, 0.3, 3500) };
const GAIN = { drums: 0.22, bass: 0.7, pad: 2.2, keys: 1.3, lead: 3.4, fx: 0.85, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 22);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);

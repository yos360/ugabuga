// UGABUGA "החידה היומית" (9:16 Reel, every day at 18:00). One hard riddle that is NOT on the site, a 10-second
// countdown and a call to answer in the comments. The answer is never shown: it comes in the next day's caption
// and on the next day's end card. The riddle itself is riddle.js (written by daily-riddle/make.js).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const R = node ? require('./riddle') : globalThis.RIDDLE;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(12) + 1.7; // ≈ 25.9s

  const S = { hook: [0, T(2)], board: [T(2), T(9)], end: [T(9), DURATION] };

  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['F3', 'A3', 'D4'], bass: 'D2' }, E: { notes: ['E3', 'G#3', 'B3'], bass: 'E1' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'E'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'Am'], [5, 0, 4, 'F'],
    [6, 0, 4, 'Dm'], [7, 0, 4, 'Am'], [8, 0, 2, 'F'], [8, 2, 2, 'E'], [9, 0, 4, 'C'], [10, 0, 4, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'],
  ]);

  const ev = {
    hard: T(0, 0), // "החידה היומית #n"
    sub: T(0, 2), // "גם מבוגרים נתקעים בה"
    ready: T(1, 0), // "יש לכם 10 שניות"
    ask: T(3, 2), // the question pill
    count: T(4, 0), // the 10-second countdown starts, one number a second
    ring: T(9, 0), // time is up
    comment: T(9, 0) + 0.25, logo: T(10, 0),
  };
  // the board pieces pop one after another (boxes, equation lines or text lines); the last one is the "?"
  const pieces = R.kind === 'seq' ? R.items : R.lines;
  const step = Math.min(BEAT / 2, (T(3, 1) - T(2, 0.5)) / Math.max(1, pieces.length - 1));
  const MIDI = ['A4', 'C5', 'E5', 'A5', 'B5', 'C6', 'D6', 'E6'];
  const spots = pieces.map((label, i) => ({ label, i, t: T(2, 0.5) + i * step, midi: m(MIDI[i % MIDI.length]) }));
  ev.car = spots[spots.length - 1].t; // the "?" lands
  const ticks = Array.from({ length: 10 }, (_, k) => ({ n: 10 - k, k, t: ev.count + k * 2 * BEAT, midi: m(k >= 7 ? 'E6' : 'A5') }));
  const endLines = [{ t: T(10, 2) }, { t: T(11, 0) }, { t: T(11, 2) }, { t: T(12, 0) }];

  const markers = {
    hook: { t: ev.hard, sync: 'a' }, board: { t: T(2), sync: 'av' },
    count: { t: ev.count, sync: 'a' }, ring: { t: ev.ring, sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, R, spots, ticks, endLines, steps: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

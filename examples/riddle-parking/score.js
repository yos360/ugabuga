// UGABUGA "חידת החניה" (9:16 Reel). A real riddle from the site's hard riddles page (/riddles/teens,
// src/data/content/riddles.js): parking spots numbered 16, 06, 68, 88, ?, 98 — which spot is the car in?
// The answer is NOT shown: the end card asks for it in the comments and points to the site for the solution.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(12) + 1.7; // ≈ 25.9s

  const S = { hook: [0, T(2)], lot: [T(2), T(9)], end: [T(9), DURATION] };

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
    hard: T(0, 0), // "חידה קשה מאוד"
    sub: T(0, 2), // "רוב המבוגרים נתקעים בה"
    ready: T(1, 0), // "יש לכם 10 שניות"
    car: T(3, 0), // the car drives into the "?" spot
    ask: T(3, 2), // the question pill
    count: T(4, 0), // the 10-second countdown starts, one number a second
    ring: T(9, 0), // time is up
    comment: T(9, 0) + 0.25, logo: T(10, 0),
  };
  // the six spots, left to right as in the riddle
  const SPOTS = ['16', '06', '68', '88', '?', '98'];
  const spots = SPOTS.map((label, i) => ({ label, i, t: T(2, 0.5) + i * BEAT / 2, midi: m(['A4', 'C5', 'E5', 'A5', 'B5', 'C6'][i]) }));
  const ticks = Array.from({ length: 10 }, (_, k) => ({ n: 10 - k, k, t: ev.count + k * 2 * BEAT, midi: m(k >= 7 ? 'E6' : 'A5') }));
  const endLines = [{ t: T(10, 2) }, { t: T(11, 0) }, { t: T(11, 2) }, { t: T(12, 0) }];

  const markers = {
    hook: { t: ev.hard, sync: 'a' }, lot: { t: T(2), sync: 'av' }, car: { t: ev.car, sync: 'a' },
    count: { t: ev.count, sync: 'a' }, ring: { t: ev.ring, sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, SPOTS, spots, ticks, endLines, steps: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

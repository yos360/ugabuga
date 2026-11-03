// UGABUGA "משחק אותיות לגן" letters game (9:16 Reel). The game at /letters/game (src/components/letters/LettersGame.jsx): "באיזו אות זה מתחיל?" with a
// picture (🚂 from src/data/letterLearning.js) and 4 options incl. look-alike letters. The answer is NOT shown: the end card asks for it in the comments.
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
  const DURATION = T(12) + 1.7; // ≈ 25.7s

  const S = { hook: [0, T(2)], quiz: [T(2), T(5)], modes: [T(5), T(9)], end: [T(9), DURATION] };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['F3', 'A3', 'D4'], bass: 'D2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'], [5, 0, 4, 'G'],
    [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'Dm'], [9, 0, 4, 'C'], [10, 0, 4, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'],
  ]);

  const ev = {
    q: T(0, 0), // "באיזו אות מתחיל…"
    pic: T(0, 2), // the picture pops
    ready: T(1, 0), // "4 seconds" pill
    count: T(3, 0), // the 4-second countdown starts
    ring: T(5, 0), // time is up
    head: T(5, 0), cards: [T(5, 2), T(6, 0), T(6, 2)], chips: T(7, 0), sim: T(7, 2), stars: T(8, 0),
    comment: T(9, 0) + 0.25, logo: T(10, 0),
  };
  // the four answer tiles, as the game shows them (the target + similar-looking letters)
  const OPTS = ['ד', 'ת', 'ר', 'ק'];
  const opts = OPTS.map((label, i) => ({ label, i, t: T(2, 0.5) + i * BEAT / 2, midi: m(['A4', 'C5', 'E5', 'A5'][i]) }));
  const ticks = Array.from({ length: 4 }, (_, k) => ({ n: 4 - k, k, t: ev.count + k * 2 * BEAT, midi: m(k >= 2 ? 'E6' : 'A5') }));
  const endLines = [{ t: T(10, 2) }, { t: T(11, 0) }, { t: T(11, 2) }, { t: T(12, 0) }];

  const markers = {
    hook: { t: ev.q, sync: 'a' }, quiz: { t: T(2), sync: 'av' }, count: { t: ev.count },
    ring: { t: ev.ring, sync: 'av' }, logo: { t: ev.logo, sync: 'a' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, OPTS, opts, ticks, endLines, steps: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

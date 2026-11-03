// UGABUGA "קורס אקסל" (9:16 Reel). /excel (src/excel/ExcelPages.jsx, excelLessons.js): the statement "from today anyone can learn Excel alone, free, no sign-up", then a question on the end card: do you know Excel?
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

  const S = { hook: [0, T(3)], modes: [T(3), T(9)], end: [T(9), DURATION] };

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
    q: T(0, 0), // "לא תאמינו, אבל…"
    pic: T(0, 2), // "מהיום כל אחד יכול ללמוד אקסל לבד"
    ready: T(1, 2), // "בחינם · בלי הרשמה"
    head: T(3, 0), cards: [T(3, 2), T(4, 2), T(5, 2)], chips: T(6, 2), sim: T(7, 2), stars: T(8, 0),
    comment: T(9, 0) + 0.25, logo: T(10, 0),
  };
  const endLines = [{ t: T(10, 2) }, { t: T(11, 0) }, { t: T(11, 2) }, { t: T(12, 0) }];

  const markers = {
    hook: { t: ev.q, sync: 'a' }, modes: { t: T(3), sync: 'av' }, logo: { t: ev.logo, sync: 'a' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, endLines, steps: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

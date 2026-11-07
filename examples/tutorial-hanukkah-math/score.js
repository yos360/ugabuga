// UGABUGA tutorial (16:9) — "חשבון של חנוכה" (/holidays/hanukkah/math). Every label, count and fact comes from
// src/pages/holidays/HanukkahMath.jsx and src/data/hanukkahMath.js (screens are real captures of the live site).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;
  const FPS = 30, FORMAT = '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 124, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(20) + 1.0;
  const S = { hook: [0, T(2)], grade: [T(2), T(5)], solve: [T(5), T(8)], how: [T(8), T(11)], game: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Dm'], [1, 0, 4, 'Am'], [2, 0, 4, 'F'], [3, 0, 4, 'C'], [4, 0, 4, 'G'],
    [5, 0, 4, 'Am'], [6, 0, 4, 'F'], [7, 0, 4, 'C'], [8, 0, 4, 'G'], [9, 0, 4, 'Am'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'], [13, 0, 4, 'Dm'], [14, 0, 4, 'F'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    ringGrades: T(2, 1), tapG3: T(3, 0.5), ringTopic: T(3, 1.5), tipGrade: T(3, 2.5),
    ringQ1: T(5, 1), type1: T(5, 2.5), tapCheck1: T(6, 1), ringFb1: T(6, 1.4), tipSolve: T(6, 3),
    type2: T(8, 1), tapCheck2: T(8, 2.5), ringFb2: T(8, 2.9), tapHow: T(9, 1.5), ringSol: T(9, 2), tipHow: T(10, 0),
    ringModes: T(11, 0.5), tapTimes: T(11, 1.5), tapSpin: T(11, 3), typeG: T(12, 1.5), tapGCheck: T(12, 3), tipGame: T(13, 0),
    ringPrint: T(14, 1), tapPrint: T(14, 2), answers: T(15, 2), tipPrint: T(15, 3),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'grade', title: 'בוחרים כיתה', sub: 'מכיתה א׳ ועד ו׳, ובכל כיתה 6 בעיות מילוליות', color: '#226bd7' },
    { n: 2, sec: 'solve', title: 'פותרים במסך', sub: 'כותבים את התשובה בתיבה ולוחצים "בדיקה"', color: '#23874d' },
    { n: 3, sec: 'how', title: 'נתקעים? "איך פותרים?"', sub: 'טעות מקבלת "עוד לא", ובלחיצה רואים את דרך הפתרון', color: '#cf2f56' },
    { n: 4, sec: 'game', title: 'משחק סביבון', sub: 'בוחרים רמה, מסובבים את הסביבון ועונים', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים', sub: 'דף עבודה עם מקום לתרגיל ולתשובה, ודף פתרונות נפרד', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🕯️', 'נרות'], ['🍩', 'סופגניות'], ['💰', 'דמי חנוכה'], ['🎲', 'סביבון']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

// UGABUGA tutorial (16:9) — "שאלות מילוליות בחשבון לפי כיתה" (/math/word-problems, demo /math/word-problems/grade-3).
// Labels/facts from src/math/WordProblemsGuide.jsx + data/wordProblemsByGrade.js (3 grades, 12 problems each, 3 levels). Real captures (shoot.js).
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
  const S = { hook: [0, T(2)], pick: [T(2), T(5)], answer: [T(5), T(8)], check: [T(8), T(11)], fresh: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' }, Fmaj7: { notes: ['E3', 'A3', 'C4'], bass: 'F1' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'Fmaj7'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. pick a grade
    ringG3: T(2, 2), tipA: T(2, 3), tipB: T(3, 3), tapG3: T(4, 0),
    // 2. the four steps
    c1: T(5, 1), tipM: T(5, 2), c2: T(5, 3), c3: T(6, 1), c4: T(6, 3), tipM2: T(7, 0),
    // 3. worked example
    ringQ: T(8, 1), tipE1: T(8, 2.5), ringS3: T(9, 0), ringS4: T(9, 3), tipE2: T(10, 0),
    // 4. practice
    ringLv: T(11, 1), tipLv: T(11, 1.5), type: T(12, 0), tapChk: T(12, 2.5), swapOk: T(12, 3), tipOk: T(13, 0),
    // 5. print
    ringPage: T(14, 1), tipP: T(14, 1.5), ringPdf: T(15, 2), tipPdf: T(15, 2.5), ringPrn: T(16, 1),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'pick', title: 'בוחרים כיתה', sub: 'כיתה ב׳, ג׳ או ד׳ —|ולכל כיתה 12 שאלות', color: '#cf2f56' },
    { n: 2, sec: 'answer', title: 'ארבעה שלבים', sub: 'אותה דרך חשיבה|בכל שאלה', color: '#226bd7' },
    { n: 3, sec: 'check', title: 'דוגמה פתורה', sub: 'שאלה של שני שלבים,|צעד אחר צעד', color: '#23874d' },
    { n: 4, sec: 'fresh', title: 'תרגול על המסך', sub: 'כותבים את המספר|ולוחצים "בדיקה"', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'דף עבודה להדפסה', sub: 'שני עמודים של שאלות|ועמוד תשובות', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🧩', '4 שלבי פתרון'], ['✏️', 'תרגול עם בדיקה'], ['🖨️', 'דף עבודה ותשובות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

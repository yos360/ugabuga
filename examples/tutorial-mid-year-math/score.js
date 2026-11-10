// UGABUGA tutorial (16:9) — "מבחן אמצע שנה בחשבון" (/math/tests/grade-4/mid-year). Every label and fact comes from
// src/math/MathPages.jsx (MathMidYearTest → TestPage midYear, Quiz, PrintSheets), registry.js (MID_YEAR_GRADES 1–9)
// and components/ui/PrintPreview.jsx. Screens are real captures (shoot.js).
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
  const S = { hook: [0, T(2)], grade: [T(2), T(5)], pick: [T(5), T(8)], level: [T(8), T(11)], quiz: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'C'], [9, 0, 4, 'G'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'C'], [14, 0, 4, 'G'], [15, 0, 4, 'Dm'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. the grade page → "מבחן אמצע שנה"
    ringMid: T(2, 1), tapMid: T(3, 1), tipGrade: T(4, 0),
    // 2. tick what was learned
    tapClear: T(5, 1), chip0: T(6, 0), chip1: T(6, 0.75), chip2: T(6, 1.5), chip3: T(6, 2.25), chip4: T(6, 3), ringCount: T(7, 0), tipPick: T(7, 1),
    // 3. level + number of questions
    tapBasic: T(8, 1.5), ringCount2: T(9, 0.5), ringStart: T(9, 2.5), tapStart: T(10, 0), tipLevel: T(10, 1),
    // 4. answer on the screen → score + explanation
    ringInput: T(11, 0.5), allDone: T(12, 0), tapFinish: T(12, 1.5), ringScore: T(12, 2.5), wrong: T(13, 0), tipQuiz: T(13, 1),
    // 5. print with an answer sheet
    ringPrint: T(14, 1), keyPage: T(15, 1.5), ringKey: T(15, 2.5), tipPrint: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'grade', title: 'נכנסים לכיתה', sub: 'בדף החשבון של הכיתה לוחצים על "מבחן אמצע שנה"', color: '#226bd7' },
    { n: 2, sec: 'pick', title: 'מסמנים מה למדתם', sub: 'המבחן נבנה רק מהנושאים שסימנתם', color: '#23874d' },
    { n: 3, sec: 'level', title: 'רמה ומספר שאלות', sub: 'בוחרים רמת קושי, 10 או 20 שאלות, ושעון', color: '#e08a00' },
    { n: 4, sec: 'quiz', title: 'פותרים במסך', sub: 'עונים על השאלות, ובסוף לוחצים "סיום ובדיקה"', color: '#cf2f56' },
    { n: 5, sec: 'print', title: 'או מדפיסים', sub: 'דף מבחן עם שם וציון, ודף תשובות נפרד', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🏫', 'כיתות א׳–ט׳'], ['✔️', 'רק מה שלמדתם'], ['💻', 'ציון והסבר'], ['🖨️', 'דף תשובות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

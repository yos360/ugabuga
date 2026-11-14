// UGABUGA tutorial (16:9) — "אות השבוע לגן" (/letters/week, demo on /letters/mem/week).
// Every label and fact comes from src/pages/letters/LetterWeek.jsx, src/data/letterLearning.js and
// src/components/printables/PrintableShell.jsx: 22 letters, "בוחרים אות ומקבלים ערכה לשבוע", four sheets
// (poster "אות השבוע שלנו" with 4 words, tracing "עוברים על הקווים" + "צובעים את האות", hunt "מה מתחיל באות מ?"
// with 5 own + 4 other pictures and a line "לגננת:", a note to parents cut into two), a 5-day plan,
// "4 דפי A4 בהדפסה אחת", "🖨️ הדפסה או PDF", "הורדה כ-PDF", "הכול חינם ובלי הרשמה".
// Screens are real captures of the live page (shoot.js, shoot2.js).
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
  const DURATION = T(19) + 1.0;
  const S = { hook: [0, T(2)], pick: [T(2), T(5)], poster: [T(5), T(8)], hunt: [T(8), T(11)], note: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' }, Fmaj7: { notes: ['E3', 'A3', 'C4'], bass: 'F1' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'Fmaj7'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. pick a letter
    ringGrid: T(2, 2), tipCount: T(3, 0), tapMem: T(3, 3), tipMem: T(4, 0.5),
    // 2. poster + tracing
    showPoster: T(5, 1), tipPoster: T(5, 2), showTrace: T(6, 2), tipTrace: T(7, 0),
    // 3. hunt
    ringOwn: T(8, 2), tipHunt: T(9, 0), ringKey: T(10, 0), tipKey: T(10, 0.5),
    // 4. note + plan
    tipNote: T(11, 1.5), swapPlan: T(12, 2), tipPlan: T(13, 0),
    // 5. print
    ringPanel: T(14, 1), tapPrint: T(14, 3), tipPrint: T(15, 0), ringPdf: T(15, 2), tipPdf: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'pick', title: 'בוחרים אות', sub: 'כל האותיות, מא׳ ועד ת׳|לוחצים על האות של השבוע', color: '#cf2f56' },
    { n: 2, sec: 'poster', title: 'פוסטר ודף תרגול', sub: 'פוסטר לפינת האות|ודף כתיבה לילדים', color: '#226bd7' },
    { n: 3, sec: 'hunt', title: 'דף חיפוש', sub: '"מה מתחיל באות מ?"|אומרים כל ציור בקול', color: '#23874d' },
    { n: 4, sec: 'note', title: 'מכתב להורים', sub: 'פתק לבית, ותוכנית|לחמישה ימים בגן', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים', sub: 'כל הערכה בלחיצה אחת', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🖼️', 'פוסטר'], ['✏️', 'דף תרגול'], ['🔎', 'דף חיפוש'], ['💌', 'מכתב להורים']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

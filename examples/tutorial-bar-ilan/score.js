// UGABUGA tutorial (16:9) — "תרגול למבחן בר־אילן — כיתה ה׳" (/learn/gifted-test/bar-ilan).
// Every label and fact comes from src/learn/gifted/BarIlanPage.jsx and barIlan.js
// ("⏱️ מבחן מלא — 24 שאלות", "✏️ תרגול קצר — 8 שאלות", "🖨️ מבחן להדפסה + תשובות", a 60-minute timer,
// "ענית על X מתוך 24", "✔️ בדיקה", "ציון: X מתוך 24", an explanation for every answer, "🔁 מבחן חדש",
// "🖨️ להדפיס את המבחן הזה", "דף תשובות והסברים", 8 topics). Screens are real captures of the live page (shoot.js).
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
  const S = { hook: [0, T(2)], pick: [T(2), T(5)], answer: [T(5), T(8)], check: [T(8), T(11)], explain: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
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
    // 1. pick a test
    ringFull: T(2, 2), tapFull: T(3, 0.5), tipFull: T(3, 2.5), tipShort: T(4, 1),
    // 2. answer on screen
    ringQ1: T(5, 1), tapQ1: T(5, 2.5), tapQ2: T(6, 0.5), tipTopics: T(6, 1.5), tipTimer: T(7, 0.5),
    // 3. check
    ringCheck: T(8, 1), tapCheck: T(8, 3), swap: T(9, 0.5), ringScore: T(9, 1.5), tipColors: T(9, 3),
    // 4. explanation + new test
    ringEx: T(11, 1), tipEx: T(11, 2.5), swapAgain: T(12, 1.5), ringAgain: T(12, 2.5), tipAgain: T(13, 0),
    // 5. print
    ringPrint: T(14, 1), tapPrint: T(14, 2.5), swapTb: T(15, 0), ringPdf: T(15, 1), tipAns: T(15, 2), tipClass: T(16, 0.5),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'pick', title: 'בוחרים איך לתרגל', sub: 'מבחן מלא, תרגול קצר|או מבחן להדפסה', color: '#cf2f56' },
    { n: 2, sec: 'answer', title: 'עונים במסך', sub: 'לוחצים על התשובה|שנראית לכם נכונה', color: '#226bd7' },
    { n: 3, sec: 'check', title: 'לוחצים "בדיקה"', sub: 'ומקבלים ציון|מתוך 24', color: '#23874d' },
    { n: 4, sec: 'explain', title: 'קוראים את ההסבר', sub: 'לכל שאלה יש הסבר|איך פותרים אותה', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים עם תשובות', sub: 'אותו מבחן על דף,|ובסוף דף תשובות', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['➗', 'סדר פעולות'], ['⊛', 'פעולה מומצאת'], ['🍕', 'שברים'], ['🎯', 'אומדן']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

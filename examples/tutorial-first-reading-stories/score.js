// UGABUGA tutorial (16:9) — "סיפורים לראשית קריאה לפי תנועות" (/letters/first-reading-stories). Every label and
// fact comes from src/pages/letters/VowelStories.jsx + src/data/vowelStories.js (screens are real captures, shoot.js).
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
  const S = { hook: [0, T(2)], stages: [T(2), T(5)], read: [T(5), T(8)], answer: [T(8), T(11)], older: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'C'], [9, 0, 4, 'G'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'C'], [14, 0, 4, 'G'], [15, 0, 4, 'Dm'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    ringNav: T(2, 0.75), ringS1: T(3, 0.25), tapS3: T(3, 2), tipStages: T(4, 0),
    ringText: T(5, 0.5), ringListen: T(6, 0.5), tapListen: T(6, 2), tipRead: T(6, 3),
    tapWrong: T(8, 0.5), tapRight1: T(9, 0), tapRight2: T(9, 1.5), tapRight3: T(9, 3), ringDone: T(10, 0), tipAnswer: T(10, 0.5),
    ringOlderTip: T(11, 0.5), ringOpen: T(12, 0.5), tipOlder: T(13, 0),
    ringPrint: T(14, 0.5), tapPrint: T(15, 0), ringPdf: T(15, 1.5), tipPrint: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'stages', title: 'בוחרים שלב', sub: 'כל שלב מוסיף תנועה: קמץ ופתח, שווא, חיריק, צירה וסגול, חולם, שורוק וקובוץ', color: '#226bd7' },
    { n: 2, sec: 'read', title: 'קוראים את הסיפור', sub: 'כל מילה כתובה רק בניקוד שכבר נלמד, ואפשר גם לשמוע הקראה', color: '#23874d' },
    { n: 3, sec: 'answer', title: 'עונים על השאלות', sub: 'לחיצה על תשובה מראה מיד אם היא נכונה', color: '#e08a00' },
    { n: 4, sec: 'older', title: 'כיתה ב׳ וכיתה ג׳', sub: 'סיפורים ארוכים יותר בניקוד מלא, עם שאלה פתוחה לכתיבה', color: '#cf2f56' },
    { n: 5, sec: 'print', title: 'מדפיסים את השלב', sub: 'כל סיפור בדף A4 עם השאלות, ובסוף דף תשובות', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🔤', '6 שלבי ניקוד'], ['📖', '16 סיפורים'], ['✅', 'שאלות הבנה'], ['🖨️', 'הדפסה ותשובות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

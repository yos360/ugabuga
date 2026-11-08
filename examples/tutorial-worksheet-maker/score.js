// UGABUGA tutorial (16:9) — "מחולל דפי עבודה" (/tools/worksheet-maker). Every label, count and fact comes from
// src/pages/tools/WorksheetMaker.jsx and src/components/printables/PrintableShell.jsx (screens are real captures of the live site).
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
  const S = { hook: [0, T(2)], words: [T(2), T(5)], emoji: [T(5), T(8)], tasks: [T(8), T(11)], key: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'F'], [1, 0, 4, 'G'], [2, 0, 4, 'C'], [3, 0, 4, 'Am'], [4, 0, 4, 'F'],
    [5, 0, 4, 'G'], [6, 0, 4, 'C'], [7, 0, 4, 'Am'], [8, 0, 4, 'Dm'], [9, 0, 4, 'G'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'C'], [12, 0, 4, 'Am'], [13, 0, 4, 'F'], [14, 0, 4, 'C'], [15, 0, 4, 'Dm'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    ringTitle: T(2, 0.75), typeTitle: T(2, 1.5), typeWords: T(2, 3), ringCount1: T(3, 2), tipWords: T(3, 2.5),
    ringNeed: T(5, 0.5), typeEmoji: T(5, 2), ringMatch: T(6, 1), tipEmoji: T(6, 2),
    ringTasks: T(8, 0.5), tapCopy: T(8, 2.5), ringCount3: T(9, 0.5), tipTasks: T(9, 1.5),
    ringKey: T(11, 0.5), ringMissing: T(11, 2.5), panAns: T(12, 1.5), ringAns: T(12, 2), tipKey: T(12, 3),
    ringPrint: T(14, 0.5), tapPrint: T(14, 1.5), scroll: T(15, 0.5), tipPrint: T(15, 1.5),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'words', title: 'כותבים את המילים', sub: 'כותרת לדף, ומילה בכל שורה — עד 10 מילים', color: '#226bd7' },
    { n: 2, sec: 'emoji', title: 'מוסיפים אימוג׳י', sub: 'אימוג׳י אחרי המילה הופך לתמונה בדף', color: '#23874d' },
    { n: 3, sec: 'tasks', title: 'בוחרים משימות', sub: 'מקווקוות, העתקה, אות חסרה, אותיות מבולבלות, מילה ותמונה', color: '#cf2f56' },
    { n: 4, sec: 'key', title: 'דף תשובות', sub: 'רואים כל דף לפני ההדפסה, ודף התשובות מצטרף בסוף', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים', sub: 'כל הדפים בהדפסה אחת, או שומרים כ־PDF', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['✏️', 'מקווקוות'], ['📝', 'העתקה'], ['❓', 'אות חסרה'], ['🔀', 'מבולבלות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

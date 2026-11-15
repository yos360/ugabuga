// UGABUGA tutorial (16:9) — "סימטריה לכיתות ג׳–ה׳" (/math/symmetry).
// Every label and fact comes from src/math/SymmetryGuide.jsx and src/data/symmetryMath.js
// (levels קל 6×6 / בינוני 8×8 / מאתגר horizontal axis, "✔️ בדיקה", wrong cells outlined red, "הראו לי איפה חסר",
// "🎉 מושלם! זה לב", quiz "כמה צירי סימטריה יש ל…?" over 16 shapes with the axes shown red dashed,
// print: 3 pages (4 grid drawings, 12 shapes, answers), "🔄 סט אחר"). Screens are real captures of the live page (shoot.js).
// Event names are kept from the previous tutorial so song.js stays in sync (film.js says what each one shows).
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
    // 1. pick the range
    ringChips: T(2, 2), ringSix: T(3, 0.5), tipSix: T(3, 1.5), tipTen: T(4, 1),
    // 2. type the answers
    ringGrid: T(5, 0.5), type1: T(5, 2), tipMix: T(5, 3), type2: T(6, 2), tipPhone: T(7, 0),
    // 3. check
    ringCheck: T(8, 0.5), tapCheck: T(8, 2), swap: T(8, 2.6), ringRed: T(9, 1), ringScore: T(9, 3), tipNote: T(10, 1.5),
    // 4. new quiz
    ringFresh: T(11, 1), tapFresh: T(11, 3), swapFresh: T(12, 0.5), tipFresh: T(12, 1.5), tipTeach: T(13, 0.5),
    // 5. print
    ringPrint: T(14, 0.5), tapPrint: T(14, 1.5), swapPr: T(14, 2), tipPages: T(14, 3), swapAns: T(15, 3), tipAns: T(16, 0), ringPdf: T(16, 1.5),
    logo: T(17, 0),
  };
  ev.missSwap = T(9, 2); ev.okSwap = T(10, 1.5);
  const steps = [
    { n: 1, sec: 'pick', title: 'בוחרים רמה במשחק', sub: 'קל, בינוני או מאתגר —|חצי מהציור כבר צבוע על הרשת', color: '#cf2f56' },
    { n: 2, sec: 'answer', title: 'צובעים את החצי השני', sub: 'לוחצים על משבצות בצד הריק,|כמו בבואה במראה', color: '#226bd7' },
    { n: 3, sec: 'check', title: 'לוחצים "בדיקה"', sub: 'משבצת מיותרת מסומנת באדום,|ואפשר לבקש לראות מה חסר', color: '#23874d' },
    { n: 4, sec: 'fresh', title: 'חידון: כמה צירים?', sub: 'בוחרים מספר, ואז רואים|את הצירים בקו אדום מקווקו', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'דפי עבודה להדפסה', sub: 'לוחצים "לתצוגה ולהדפסה",|ואז "הדפסה" או "הורדה כ-PDF"', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🎮', 'משחק השלמה'], ['❓', 'חידון צירים'], ['🖨️', 'דפי עבודה'], ['✅', 'דף תשובות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

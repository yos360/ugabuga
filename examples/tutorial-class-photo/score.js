// UGABUGA tutorial (16:9) — "תמונת מחזור" (/printables/class-photo/hanukkah). Every label and fact comes from
// src/pages/printables/ClassPhoto.jsx + PrintableShell.jsx (screens are real captures, shoot.js).
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
  const S = { hook: [0, T(2)], design: [T(2), T(5)], captions: [T(5), T(8)], staff: [T(8), T(11)], kids: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
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
    // 1. design
    ringSib: T(2, 0.75), tapDreidel: T(3, 0), tapHeart: T(3, 2), sheetA: T(4, 0), tipDesign: T(4, 0.5),
    // 2. captions
    ringCap: T(5, 0.5), tapSchool: T(6, 0), sheetB: T(6, 2.5), tipCap: T(7, 0),
    // 3. staff
    ringStaff: T(8, 0.5), tapAdd: T(9, 0), ringRow: T(9, 1), sheetC: T(10, 0), tipStaff: T(10, 0.5),
    // 4. kids
    ringCount: T(11, 0.5), tapApply: T(11, 2), tapBulk: T(12, 0.5), sheetD: T(13, 0), tipKids: T(13, 0.5),
    // 5. print
    ringPrint: T(14, 0.5), tapPrint: T(15, 0), ringPdf: T(15, 1.5), tipPrint: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'design', title: 'בוחרים עיצוב', sub: 'שמונה עיצובים, ארבע צורות מסגרת וארבעה גופנים', color: '#226bd7' },
    { n: 2, sec: 'captions', title: 'כותבים כיתובים', sub: 'שם הגן או בית הספר, כותרת, שורה מתחתיה ומשפט בתחתית', color: '#23874d' },
    { n: 3, sec: 'staff', title: 'מוסיפים צוות', sub: 'קובייה לכל אחד: תפקיד, שם ותמונה', color: '#e08a00' },
    { n: 4, sec: 'kids', title: 'ילדים ותמונות', sub: 'מדביקים רשימת שמות ומוסיפים הרבה תמונות בבת אחת', color: '#cf2f56' },
    { n: 5, sec: 'print', title: 'מדפיסים', sub: 'הדף מסדר את כולם לבד בטבלה מאוזנת, מימין לשמאל', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🕎', '7 אירועים'], ['🎨', '8 עיצובים'], ['📷', 'תמונה ושם'], ['🖨️', 'הדפסה או PDF']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

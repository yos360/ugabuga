// UGABUGA tutorial (16:9) — "מספר מעורב ושבר מדומה" (/math/mixed-numbers).
// Every label and fact comes from src/math/MixedNumbersGuide.jsx + src/data/mixedNumbers.js (pizzas 2 3/4 = 11/4, converter
// שלמים/מונה/מכנה, practice "כתבו כשבר מדומה" + "✔️ בדיקה" + explanation, levels קל/בינוני/מאתגר, print: 15 exercises + answers).
// Real captures (shoot.js). Event names kept from earlier tutorials so song.js stays in sync.
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
    // 1. open: ring the kinds, tap "כיתה", the name, tap open
    ringChips: T(2, 2), ringSix: T(3, 0.5), tipSix: T(3, 1.5), tipTen: T(4, 1),
    // 2. ready → WhatsApp, then the organizer card
    ringGrid: T(5, 0.5), type1: T(5, 2), tipMix: T(5, 3), type2: T(6, 2), tipPhone: T(7, 0),
    // 3. light: name, idea → wish, light button
    ringCheck: T(8, 0.5), tapCheck: T(8, 2), swap: T(8, 2.6), ringRed: T(9, 1), ringScore: T(9, 3), tipNote: T(10, 1.5),
    // 4. the hanukkiah fills, then the list
    ringFresh: T(11, 1), tapFresh: T(11, 3), swapFresh: T(12, 0.5), tipFresh: T(12, 1.5), tipTeach: T(13, 0.5),
    // 5. night chips → night 1 (+4) → its list
    ringPrint: T(14, 0.5), tapPrint: T(14, 1.5), swapPr: T(14, 2), tipPages: T(14, 3), swapAns: T(15, 3), tipAns: T(16, 0), ringPdf: T(16, 1.5),
    logo: T(17, 0),
  };
  ev.missSwap = T(9, 2); ev.okSwap = T(10, 1.5);
  const steps = [
    { n: 1, icon: '🍕', sec: 'pick', title: 'מתחילים מהפיצות', sub: 'מה זה מספר מעורב|ומה זה שבר מדומה', color: '#e08a00' },
    { n: 2, icon: '🔁', sec: 'answer', title: 'ממיר הלוך וחזור', sub: 'בוחרים מספר מעורב|ורואים את כל החישוב', color: '#226bd7' },
    { n: 3, icon: '✏️', sec: 'check', title: 'תרגול: 10 תרגילים', sub: 'כותבים תשובה|ולוחצים על ✔️ בדיקה', color: '#23874d' },
    { n: 4, icon: '💡', sec: 'fresh', title: 'טעיתם? יש הסבר', sub: 'אחרי כל תשובה|מופיע הסבר קצר', color: '#cf2f56' },
    { n: 5, icon: '🖨️', sec: 'print', title: 'דף עבודה + תשובות', sub: 'בשלוש רמות,|להדפסה לבית או לכיתה', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🍕', 'הסבר עם פיצות'], ['🔁', 'ממיר'], ['🖨️', 'דף עבודה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

// UGABUGA tutorial (16:9) — "ברכות לחנוכה" (/holidays/hanukkah/greetings).
// Every label and fact comes from src/pages/holidays/HanukkahGreetings.jsx and src/data/hanukkahGreetings.js
// (36 greetings in 6 groups, "📋 העתקה" / "✓ הועתק", "💬 לוואטסאפ", "🖨️ לכרטיס", four cards on an A4 sheet,
// "ברכה משלכם (לא חובה)" up to 130 characters, "מאת", "צבעוני" / "חסכוני בדיו", "🖨️ הדפסה או PDF").
// Screens are real captures of the live page (shoot.js).
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
  const S = { hook: [0, T(2)], who: [T(2), T(5)], copy: [T(5), T(8)], card: [T(8), T(11)], from: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' }, Fmaj7: { notes: ['E3', 'A3', 'C4'], bass: 'F1' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Fmaj7'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. who is it for
    ringGrp: T(2, 2), tapTeacher: T(3, 0.5), tipWho: T(3, 2.5), tipAll: T(4, 1),
    // 2. copy / WhatsApp
    ringCopy: T(5, 1), tapCopy: T(5, 3), tipCopy: T(6, 0), ringWa: T(6, 2), tipWa: T(7, 0),
    // 3. to card
    ringCard: T(8, 1), tapCard: T(8, 3), swap: T(9, 0.5), ringIn: T(9, 1.5), tipCard: T(9, 3),
    // 4. from + design + own greeting
    ringFrom: T(11, 1), typeFrom: T(11, 2.5), tapInk: T(12, 1), tipInk: T(12, 2), own: T(13, 0), tipOwn: T(13, 1),
    // 5. print preview
    ringPrn: T(14, 1), ringPdf: T(14, 3), tipCut: T(15, 1), tipCopies: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'who', title: 'בוחרים למי', sub: 'לגננת, למורה, לסייעת,|לילדים, למשפחה או לעובדים', color: '#cf2f56' },
    { n: 2, sec: 'copy', title: 'מעתיקים או שולחים', sub: 'כפתור "העתקה"|או כפתור "לוואטסאפ"', color: '#226bd7' },
    { n: 3, sec: 'card', title: 'לוחצים "לכרטיס"', sub: 'והברכה נכנסת|לכרטיסים להדפסה', color: '#23874d' },
    { n: 4, sec: 'from', title: 'שם השולח ועיצוב', sub: 'כותבים ממי הברכה|ובוחרים עיצוב', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים או שומרים PDF', sub: 'כפתור "הדפסה או PDF"|פותח תצוגה לפני הדפסה', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🧸', 'לגננת'], ['🍎', 'למורה'], ['🎈', 'לילדים'], ['🏠', 'למשפחה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

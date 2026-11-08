// UGABUGA tutorial (16:9) — "בלש לוח הכפל" (/learn/multiplication-table/game). Every label and fact comes from
// src/learn/MultiplicationDetective.jsx (screens are real captures of the live site, shoot.js).
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
  const S = { hook: [0, T(2)], modes: [T(2), T(5)], start: [T(5), T(8)], light: [T(8), T(11)], hunt: [T(11), T(14)], twins: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Am'], [9, 0, 4, 'F'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'C'], [12, 0, 4, 'G'], [13, 0, 4, 'Am'], [14, 0, 4, 'F'], [15, 0, 4, 'Dm'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    ringModes: T(2, 0.75), ringLight: T(3, 0.5), tapLight: T(3, 2), tipModes: T(3, 3),
    ringSize: T(5, 0.5), ringHide: T(6, 0), tipRound: T(6, 1.5), ringGo: T(7, 0), tapGo: T(7, 1.5),
    ringLit: T(8, 0.5), ringHeads: T(9, 0), typed: T(9, 2), tipLight: T(9, 3), tapCheck: T(10, 0.5),
    ringQ: T(11, 0.5), ringHeadsH: T(12, 0), tapCell: T(12, 2.5), tipHunt: T(13, 0),
    ringQT: T(14, 0.25), tw1: T(14, 2), tw2: T(15, 0), tw3: T(15, 2), tw4: T(16, 0), tipTwins: T(16, 0.5),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'modes', title: 'בוחרים משימה', sub: 'שלוש משימות: פנס הבלש, צייד המשבצות והמספר התאום', color: '#226bd7' },
    { n: 2, sec: 'start', title: 'יוצאים לחקירה', sub: 'בוחרים טבלה קטנה או רגילה, ולוחצים "יוצאים לחקירה!"', color: '#23874d' },
    { n: 3, sec: 'light', title: 'פנס הבלש', sub: 'משבצת נדלקת — כותבים איזה תרגיל מסתתר בה ולוחצים "בדיקה"', color: '#e08a00' },
    { n: 4, sec: 'hunt', title: 'צייד המשבצות', sub: 'מופיע תרגיל — נוגעים במשבצת של התשובה', color: '#cf2f56' },
    { n: 5, sec: 'twins', title: 'המספר התאום', sub: 'מופיע מספר — מוצאים את כל המשבצות שלו', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🔦', 'פנס הבלש'], ['🎯', 'צייד המשבצות'], ['👯', 'המספר התאום'], ['⭐', 'עד 3 כוכבים']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

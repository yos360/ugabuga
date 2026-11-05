// UGABUGA tutorial (16:9) — "מבחני בגרות לתרגול" (/bagrut). Every label, count and fact comes from
// src/pages/booklets/BookletPages.jsx and src/booklets/meta/bagrut-*.js (screens are real captures of the live site).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;
  const FPS = 30, FORMAT = '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(19) + 1.0;
  const S = { hook: [0, T(2)], subject: [T(2), T(5)], units: [T(5), T(8)], exam: [T(8), T(11)], print: [T(11), T(14)], check: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm7: { notes: ['F3', 'A3', 'C4'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' },
    Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Am'], [9, 0, 4, 'F'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'C'], [12, 0, 4, 'G'], [13, 0, 4, 'Am'], [14, 0, 4, 'F'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    panHub: T(2, 1), panHubBack: T(3, 0.5), ringSubject: T(3, 2), tipSubject: T(4, 0),
    tapCard: T(5, 2), tipUnits: T(6, 2),
    panExam: T(8, 1.5), tipExam: T(9, 1), panExamBack: T(10, 0.5), tapOpen: T(10, 2),
    tapMode: T(11, 1.5), ringOut: T(12, 0), tipPrint: T(12, 2),
    tapTeacher: T(15, 0), showKey: T(15, 2), tipCheck: T(15, 2.5),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'subject', title: 'בוחרים מקצוע', sub: 'כל המקצועות בדף אחד: מתמטיקה, אנגלית, לשון, ספרות, תנ״ך ועוד', color: '#226bd7' },
    { n: 2, sec: 'units', title: 'בוחרים יחידות', sub: 'במתמטיקה יש 3, 4 או 5 יחידות. לוחצים על הכרטיס של המבחן', color: '#cf2f56' },
    { n: 3, sec: 'exam', title: 'מה יש במבחן?', sub: 'רואים את כל השאלות, ואז לוחצים על "לחוברת המלאה"', color: '#8a4fd8' },
    { n: 4, sec: 'print', title: 'מדפיסים לתלמיד', sub: 'ב"מה להדפיס?" בוחרים "לתלמיד — בלי דף התשובות"', color: '#23874d' },
    { n: 5, sec: 'check', title: 'פותרים ובודקים', sub: 'פותרים בזמן אמת, ואז בודקים מול דף התשובות', color: '#e08a00' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['📝', 'מתמטיקה'], ['🎓', 'לשון'], ['📜', 'תנ״ך'], ['🧬', 'ביולוגיה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

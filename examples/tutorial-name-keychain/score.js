// UGABUGA tutorial (16:9) — "מחזיק מפתחות עם שם להדפסה בתלת־ממד" (/3d-print/name-keychain).
// Every label and fact comes from src/pages/print3d/Print3D.jsx (hub cards, NameKeychainPage: "השם", the two style
// buttons, "גודל:", "⬇️ הורדת קובץ STL", "⬇️ הבסיס" / "⬇️ האותיות", the two-colour how-to, the FAQ) and
// src/print3d/geometry.js (NAME_STYLES: base 3 mm). Screens are real captures of the live pages (shoot.js).
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
  const S = { hook: [0, T(2)], hub: [T(2), T(5)], type: [T(5), T(8)], style: [T(8), T(11)], dl: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'Em'], [8, 0, 4, 'F'], [9, 0, 4, 'C'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. the hub: the "מחזיק מפתחות עם שם" card
    ringCard: T(2, 2), tapCard: T(3, 1), tipHub: T(3, 3),
    // 2. typing the name, letter by letter
    k1: T(5, 1), k2: T(5, 2), k3: T(5, 3), k4: T(6, 0), ringModel: T(6, 1), tipType: T(6, 3),
    // 3. keychain or door sign
    ringKey: T(8, 1), size1: T(8, 3), tapSign: T(9, 1.5), size2: T(10, 0), tipStyle: T(10, 1),
    // 4. downloads
    ringAll: T(11, 1), tapAll: T(11, 3), ringTwo: T(12, 1.5), tipDl: T(13, 0),
    // 5. printing in two colours
    how0: T(14, 1), how1: T(14, 3), set0: T(15, 1), tipPrint: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'hub', title: 'נכנסים לאזור התלת־ממד', sub: 'בדף "הדפסת תלת־ממד לילדים" לוחצים על הכרטיס הראשון', color: '#cf2f56' },
    { n: 2, sec: 'type', title: 'כותבים את השם', sub: 'בעברית, באנגלית או בספרות (בלי ניקוד), והדגם מתעדכן מיד', color: '#226bd7' },
    { n: 3, sec: 'style', title: 'בוחרים מה מדפיסים', sub: 'מחזיק מפתחות עם חור לטבעת, או שלט גדול לדלת החדר', color: '#23874d' },
    { n: 4, sec: 'dl', title: 'מורידים קובץ STL', sub: 'קובץ אחד לכל הדגם, או שני קבצים להדפסה בשני צבעים', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים', sub: 'בהגדרות פשוטות, בלי תמיכות', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['✍️', 'שם בעברית'], ['🧊', 'תצוגה בתלת־ממד'], ['🚪', 'גם שלט לדלת'], ['🎨', 'שני צבעים']];
  const SETTINGS = [['🧵', 'PLA'], ['📏', 'שכבה של ⁦0.2⁩ מ״מ'], ['🧱', 'מילוי ⁦20%⁩'], ['🚫', 'בלי תמיכות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, SETTINGS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

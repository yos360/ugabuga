// UGABUGA tutorial (16:9) — "מצאו את ההבדלים" (/online-games/find-differences + /printables/activity/find-differences).
// Every label and fact comes from src/arcade/registry.js (find-differences: how, tips), src/arcade/games/SpotDiff.jsx
// (HUD, 💡 after 10 s, red/orange circles, EndCard), src/arcade/logic/spotDiff.js (18 levels, 3→7 diffs, spotStars,
// LEVEL_THEMES) and src/pages/printables/ActivityWorksheet.jsx (themes, ages, "החליפו את התרגילים", "הדפיסו דף זה",
// upside-down key). Screens are real captures (shoot.js).
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
  const S = { hook: [0, T(2)], levels: [T(2), T(5)], tap: [T(5), T(8)], hint: [T(8), T(11)], stars: [T(11), T(13)], print: [T(13), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'C'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'Am'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.1),
    // 1. the level grid: 18 levels, level 1 open
    ringLevels: T(2, 1), tipLevels: T(3, 0), tapLv1: T(4, 2),
    // 2. tap the pig in the right picture → red circle in both, 1/3
    tapPig: T(5, 2), ringFound: T(6, 1), tipTap: T(7, 0),
    // 3. after 10 s the bulb lights: orange circle; then the giraffe and the rabbit
    ringHint: T(8, 1), tapHint: T(8, 3), tipHint: T(9, 1), tapGiraffe: T(10, 0), tapRabbit: T(10, 2),
    // 4. end card with stars, then level 2 open
    won: T(11, 0.5), tipStars: T(11, 2), menu: T(12, 1), ringLv2: T(12, 2),
    // 5. printable: age 3–4, a new sheet, the key in the corner, print
    ringAges: T(13, 1), tapAge: T(13, 3), tapSwap: T(14, 2), tipAges: T(15, 0), key: T(15, 2), ringPrint: T(16, 0), tapPrint: T(16, 2),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'levels', title: 'בוחרים שלב', sub: '18 שלבים — מ־3 הבדלים ועד 7', color: '#cf2f56' },
    { n: 2, sec: 'tap', title: 'לוחצים על מה שהשתנה', sub: 'באחת התמונות, לא משנה באיזו', color: '#226bd7' },
    { n: 3, sec: 'hint', title: 'נתקעתם? יש רמז', sub: 'אחרי 10 שניות לוחצים על 💡', color: '#e08a00' },
    { n: 4, sec: 'stars', title: 'כוכבים ושלב חדש', sub: 'בסוף כל שלב מקבלים כוכבים, והשלב הבא נפתח', color: '#23874d' },
    { n: 5, sec: 'print', title: 'מעדיפים על נייר?', sub: 'דפים להדפסה לפי נושא: חיות, חלל, יום הולדת, כלי רכב ועוד', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🎮', '18 שלבים'], ['💡', 'רמזים'], ['⭐', 'כוכבים'], ['🖨️', 'גם להדפסה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

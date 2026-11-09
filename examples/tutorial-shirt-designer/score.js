// UGABUGA tutorial (16:9) — "עיצוב חולצות מחזור וסיום קורס" (/tools/shirt-designer). Every label and fact comes from
// src/pages/tools/ShirtDesigner.jsx + shirtArt.jsx (screens are real captures, shoot.js).
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
  const S = { hook: [0, T(2)], occasion: [T(2), T(5)], art: [T(5), T(8)], text: [T(8), T(11)], colors: [T(11), T(14)], names: [T(14), T(17)], end: [T(17), DURATION] };
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
    // 1. occasion
    ringNav: T(2, 0.75), tapMaslul: T(3, 0.5), tipOcc: T(4, 0),
    // 2. drawing + layout
    tapAnimals: T(5, 1), tapLion: T(6, 0), tapShield: T(6, 2.5), tipArt: T(7, 0.5),
    // 3. text + font
    ringTitle: T(8, 0.5), tapSlogan: T(9, 0), tapFont: T(9, 2.5), tipText: T(10, 0.5),
    // 4. colours
    tapBlack: T(11, 1), tapOne: T(12, 0.5), tipColor: T(13, 0),
    // 5. names + download
    ringNames: T(14, 0.5), full: T(15, 1), tapPng: T(15, 3), tipDl: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'occasion', title: 'בוחרים אירוע', sub: 'כל אירוע מגיע עם עיצוב מוכן: ציור, כיתוב וצבע חולצה', color: '#226bd7' },
    { n: 2, sec: 'art', title: 'ציור ופריסה', sub: 'צבא, חיות, סמלים, בית ספר ותנועה — ציורים מקוריים', color: '#23874d' },
    { n: 3, sec: 'text', title: 'כיתוב וגופן', sub: 'כותרת, שורה שנייה ומשפט שכולם יזכרו', color: '#e08a00' },
    { n: 4, sec: 'colors', title: 'צבעים', sub: '12 צבעי חולצה, צבע ראשי וצבע משני', color: '#cf2f56' },
    { n: 5, sec: 'names', title: 'שמות ומורידים', sub: 'שם בכל שורה לגב החולצה, ואז קובץ לבית הדפוס', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🪖', '9 אירועים'], ['🦁', 'ציורים מקוריים'], ['✍️', 'כיתוב ושמות'], ['⬇️', 'קובץ להדפסה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

// UGABUGA tutorial (16:9) — "קולאז׳ תמונות: מספר, לב ושם מתמונות" (/tools/collage).
// Every label and fact comes from src/pages/tools/PhotoStudioPages.jsx (COLLAGE kinds and intros, collageFaq),
// src/studio/Studio.jsx (upload button, "🔒 התמונות נשארות במכשיר שלכם", styles, "עוד אפשרויות", JPG/PNG),
// src/studio/Inspector.jsx ("מספר או שם", 12 characters, "כמה ריבועים", gap, corners) and src/studio/styles.js
// (COLLAGE_SIZES). Screens are real captures of the live pages (shoot.js) with the site's own sample photos.
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
  const S = { hook: [0, T(2)], shape: [T(2), T(5)], up: [T(5), T(8)], num: [T(8), T(11)], style: [T(11), T(14)], dl: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' }, Fmaj7: { notes: ['E3', 'A3', 'C4'], bass: 'F1' },
  }, [
    [0, 0, 4, 'F'], [1, 0, 4, 'G'], [2, 0, 4, 'C'], [3, 0, 4, 'Am'], [4, 0, 4, 'F'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Em'], [7, 0, 4, 'Am'], [8, 0, 4, 'Fmaj7'], [9, 0, 4, 'C'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. the shape pills on /tools/collage
    p0: T(2, 2), p1: T(2, 2.5), p2: T(2, 3), p3: T(2, 3.5), tapNum: T(3, 1), tipShape: T(3, 3),
    // 2. upload
    ringUp: T(5, 1), tapUp: T(5, 3), upDone: T(6, 0.5), ringCount: T(6, 1.5), tipUp: T(6, 2.5), tipOrder: T(7, 0.5),
    // 3. the number
    tapMosaic: T(8, 1), ringIn: T(8, 3), k1: T(9, 0), k2: T(9, 1), tipNum: T(9, 2), tipMore: T(10, 0.5),
    // 4. style
    ringStyles: T(11, 1), tapS1: T(11, 3), tapS2: T(12, 2), tipStyle: T(13, 0),
    // 5. size + download
    ringSize: T(14, 1), ringTransp: T(14, 3), ringJpg: T(15, 1), tapJpg: T(15, 3), tipDl: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'shape', title: 'בוחרים צורה', sub: 'מספר, לב, שם, תמונה בתוך טקסט, או רשת רגילה', color: '#cf2f56' },
    { n: 2, sec: 'up', title: 'מעלים תמונות', sub: 'בוחרים תמונות, כמה שרוצים, והן נכנסות לבד לצורה', color: '#226bd7' },
    { n: 3, sec: 'num', title: 'כותבים מספר או שם', sub: 'לוחצים על הצורה וכותבים בתיבה "מספר או שם"', color: '#23874d' },
    { n: 4, sec: 'style', title: 'בוחרים סגנון', sub: 'לחיצה אחת, והכול מתחלף', color: '#e08a00' },
    { n: 5, sec: 'dl', title: 'בוחרים גודל ומורידים', sub: 'ב"עוד אפשרויות": גודל, ואם רוצים גם רקע שקוף', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🔢', 'מספר'], ['❤️', 'לב'], ['🔤', 'שם'], ['🅰️', 'תמונה בטקסט']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

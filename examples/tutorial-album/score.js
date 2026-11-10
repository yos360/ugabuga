// UGABUGA tutorial (16:9) — "מעצב אלבומים" (/tools/album). Every label and fact comes from
// src/pages/tools/PhotoStudioPages.jsx (AlbumPage, ALBUM, albumFaq), src/studio/Studio.jsx and src/studio/Inspector.jsx.
// Screens are real captures of the page's own sample album (shoot.js).
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
  const S = { hook: [0, T(2)], upload: [T(2), T(5)], style: [T(5), T(8)], spreads: [T(8), T(11)], edit: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' },
  }, [
    [0, 0, 4, 'F'], [1, 0, 4, 'G'], [2, 0, 4, 'C'], [3, 0, 4, 'Em'], [4, 0, 4, 'Am'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Am'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'Am'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. upload all photos at once
    ringUp: T(2, 1), tapUp: T(3, 0), ringLock: T(3, 2), tipUp: T(4, 0),
    // 2. one tap changes the whole album's style
    tapNight: T(5, 1), tapDiary: T(6, 0), tapOlive: T(6, 2), ringCanvas: T(7, 0), tipStyle: T(7, 1),
    // 3. the spreads strip
    ringHead: T(8, 1), tapS1: T(9, 0), tapS2: T(9, 2.5), tipSpread: T(10, 1),
    // 4. tap a photo → rotate, crop, black-and-white
    tapPhoto: T(11, 1), ringTools: T(12, 0), tapBw: T(12, 2), tipEdit: T(13, 1),
    // 5. download a PDF for print
    ringPdf: T(14, 1), tapPdf: T(15, 0), ringZip: T(15, 2), tipPrint: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'upload', title: 'מעלים את התמונות', sub: 'בוחרים את כל התמונות בבת אחת — והאלבום מסתדר לבד לפי תאריך הצילום', color: '#226bd7' },
    { n: 2, sec: 'style', title: 'בוחרים סגנון', sub: 'לחיצה אחת — וכל האלבום מתחלף', color: '#23874d' },
    { n: 3, sec: 'spreads', title: 'עוברים בין הכפולות', sub: 'כל האלבום ברצועה אחת. לוחצים על כפולה כדי לעבור אליה', color: '#e08a00' },
    { n: 4, sec: 'edit', title: 'משנים כל תמונה', sub: 'לוחצים על תמונה: מסובבים, חותכים, מזיזים ומגדילים', color: '#cf2f56' },
    { n: 5, sec: 'print', title: 'מורידים להדפסה', sub: 'PDF אחד, או JPG לכל כפולה בקובץ ZIP למעבדה', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['💍', 'חתונה'], ['✡️', 'בר ובת מצווה'], ['🎂', 'יום הולדת'], ['🖨️', 'PDF להדפסה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

// UGABUGA tutorial (16:9) — "חדר בריחה לחנוכה" (/holidays/hanukkah/escape-room).
// Every label and fact comes from src/pages/holidays/HanukkahEscapeRoom.jsx and src/data/hanukkahEscape.js
// (two levels: "גן חובה (גיל 5–6)" 4 stations 15–20 min / "כיתות ב׳–ד׳ (גיל 7–10)" 5 stations 20–30 min;
// "🖥️ מצב מקרן לכל הכיתה", "מתחילים!", "בדיקה", "💡 רמז", "הצגת התשובה", "✅ נכון! הספרה 6 נכנסת למנעול.",
// "🔒 המנעול", "פותחים את התיבה 🔓", "התיבה נפתחה!", "🖨️ הדפסה: תחנות + מנעול מנייר", 6 code cards).
// Screens are real captures of the live page (shoot.js, shoot2.js, shoot3.js).
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
  const S = { hook: [0, T(2)], level: [T(2), T(5)], proj: [T(5), T(8)], station: [T(8), T(11)], lock: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
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
    // 1. level
    ringGrp: T(2, 2), tapGan: T(3, 0), tipGan: T(3, 1), tapSchool: T(4, 0), tipSchool: T(4, 1),
    // 2. projector
    ringProj: T(5, 1), tapProj: T(5, 3), tipStory: T(6, 0.5), ringTimer: T(7, 0), tipTimer: T(7, 0.5),
    // 3. a station
    tapHint: T(8, 1), tipHint: T(8, 2), typeAns: T(9, 0.5), tapCheck: T(9, 2), tipRight: T(9, 3),
    // 4. the lock
    ringLock: T(11, 1), tipOrder: T(11, 2), typeCode: T(12, 0), tapOpen: T(12, 2), tipOpen: T(13, 0),
    // 5. print kit
    ringPrn: T(14, 1), ringPdf: T(14, 2), swapCards: T(15, 0), tipCard: T(15, 1), tipLock: T(16, 0),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'level', title: 'בוחרים רמה', sub: 'גן חובה (גיל ⁦5–6⁩)|או כיתות ב׳–ד׳ (גיל ⁦7–10⁩)', color: '#cf2f56' },
    { n: 2, sec: 'proj', title: 'פותחים "מצב מקרן"', sub: 'מסך מלא לכל הכיתה,|עם טקסט גדול וטיימר', color: '#226bd7' },
    { n: 3, sec: 'station', title: 'פותרים תחנה', sub: 'הכיתה עונה, אתם מקלידים|ולוחצים "בדיקה"', color: '#23874d' },
    { n: 4, sec: 'lock', title: 'פותחים את המנעול', sub: 'מקלידים את כל הספרות|לפי סדר התחנות', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'בלי מקרן? מדפיסים', sub: 'תחנות, דף למורה עם התשובות|ומנעול מנייר', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🕯️', 'נרות'], ['🍩', 'סופגניות'], ['🎲', 'סביבון'], ['🫒', 'פך השמן']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

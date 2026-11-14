// UGABUGA tutorial (16:9) — "בוגה לייב: חידון חנוכה לכל הכיתה" (/live).
// Labels and facts from src/pages/live/LiveQuizHome.jsx, LiveQuizHost.jsx, LiveQuizPlay.jsx,
// src/data/liveQuizPacks.js and src/data/liveQuizHanukkah.js (14 reviewed Hanukkah questions per level × 3 levels = 42;
// levels קל / בינוני / מאתגר; "⚙️ הגדרות נוספות": רגיל / נכון / לא נכון / משולב, 5–8 שאלות, 5–60 שניות;
// "עד 100 משתתפים", "בלי חשבון", "לא צריך להירשם", QR + קוד, "מתחילים את המשחק", "✓ התשובה נקלטה",
// everyone answered → the answer shows right away, "לוח מובילים", "📊 סיכום למנחה", "⬇️ הורדת התוצאות לאקסל (CSV)").
// Screens are real captures of the live site (shoot.js, shootph.js); the room data is mocked, nothing written to the DB.
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
  const S = { hook: [0, T(2)], topic: [T(2), T(5)], level: [T(5), T(8)], join: [T(8), T(11)], question: [T(11), T(14)], reveal: [T(14), T(17)], end: [T(17), DURATION] };
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
    // 1. topic
    ringGrid: T(2, 2), tapHan: T(3, 0), tipHan: T(3, 1), tipMore: T(4, 0),
    // 2. level + open the room
    tapMed: T(5, 1), tapSet: T(5, 3), tipSet: T(6, 0), ringGo: T(7, 0), tapGo: T(7, 1.5), tipGo: T(7, 2),
    // 3. the class joins
    ringQr: T(8, 1), phone: T(8, 2), tipJoin: T(8, 3), players: T(9, 2), tipPlayers: T(10, 0), tapStart: T(10, 2),
    // 4. a question
    ringTimer: T(11, 1), tipTimer: T(11, 2), tapPhone: T(12, 1), tipLocked: T(12, 2),
    // 5. answer + leaders + summary
    ringLead: T(14, 1), tipLead: T(14, 2), swapSum: T(15, 2), tipSum: T(16, 0), ringCsv: T(16, 1),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'topic', title: 'בוחרים נושא: חנוכה', sub: 'לוחצים על חנוכה 🕎|או על כל נושא אחר', color: '#cf2f56' },
    { n: 2, sec: 'level', title: 'בוחרים רמה ופותחים חדר', sub: 'קל, בינוני או מאתגר,|ולוחצים "פותחים חדר"', color: '#226bd7' },
    { n: 3, sec: 'join', title: 'הכיתה נכנסת מהטלפון', sub: 'סורקים את ה־QR|או מקלידים את הקוד', color: '#23874d' },
    { n: 4, sec: 'question', title: 'השאלה על המסך', sub: 'כולם עונים בטלפון|בלחיצה על התשובה', color: '#e08a00' },
    { n: 5, sec: 'reveal', title: 'התשובה ולוח המובילים', sub: 'אחרי כל שאלה רואים מי מוביל,|ובסוף: סיכום למנחה', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🕎', 'חנוכה'], ['📱', 'מהטלפון'], ['⏱️', 'טיימר'], ['🏆', 'מובילים']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

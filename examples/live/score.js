// BUGA LIVE (בוגה לייב) reel, 9:16. The real flow of /live: pick a topic and level → open a room with a
// code + QR → everyone answers from the phone → live leaderboard → podium and host summary.
// Questions and labels come from the site's own data. One timeline for music and picture.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 124, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(14) + 1.6; // ≈ 28.9s

  const S = {
    hook: [0, T(2)], topic: [T(2), T(4)], room: [T(4), T(6)], question: [T(6), T(8)],
    board: [T(8), T(10)], podium: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, F: { notes: ['A3', 'C4', 'F4'], bass: 'F1' },
    C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Dm: { notes: ['A3', 'D4', 'F4'], bass: 'D2' }, E: { notes: ['G#3', 'B3', 'E4'], bass: 'E2' },
    Cadd9: { notes: ['G3', 'C4', 'D4', 'E4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'], [5, 0, 4, 'F'],
    [6, 0, 4, 'Dm'], [7, 0, 2, 'Dm'], [7, 2, 2, 'E'], [8, 0, 4, 'Am'], [9, 0, 4, 'F'],
    [10, 0, 4, 'C'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    orb: T(0, 0), title: T(0, 1), sub: T(0, 3),
    tapTopic: T(3, 0), tapLevel: T(3, 2), openRoom: T(3, 3.5),
    reveal: T(7, 2), // the right answer is shown
    swap: T(9, 0), // the leaderboard reorders
    winner: T(10, 1), logo: T(12, 0),
  };
  const pills = ['👥 עד 100 משתתפים', '📱 כניסה עם QR', '🆓 בלי חשבון'].map((s, i) => ({ s, i, t: T(1, i), midi: m(['E5', 'A5', 'C6'][i]) }));

  const steps = [
    { n: 1, sec: 'topic', title: 'בוחרים נושא ורמה', sub: 'השאלות מוכנות ונבדקו מול מקור אמין', color: '#6338e6' },
    { n: 2, sec: 'room', title: 'פותחים חדר משחק', sub: 'מקבלים קוד ו־QR, וכולם נכנסים מהטלפון', color: '#ff4f91' },
    { n: 3, sec: 'question', title: 'כולם עונים מהטלפון', sub: 'השאלה על המסך, הטיימר רץ', color: '#28a9e6' },
    { n: 4, sec: 'board', title: 'לוח מובילים חי', sub: 'אחרי כל שאלה רואים מי בראש', color: '#e79b13' },
    { n: 5, sec: 'podium', title: 'ויש מנצחים!', sub: 'וסיכום למנחה עם הורדה לאקסל', color: '#258a55' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the site's 8 topics, one per 16th; then the three levels
  const topics = [['🎲', 'ערבוב נושאים', '#d13c78'], ['🧠', 'ידע כללי', '#6d48e5'], ['🐾', 'חיות וטבע', '#23875a'], ['🚀', 'מדע וחלל', '#176fbd'], ['🌍', 'עולם וגאוגרפיה', '#0f8c91'], ['🇮🇱', 'ישראל', '#2466cb'], ['⚽', 'ספורט', '#d0671d'], ['➗', 'מתמטיקה', '#8b4ab8']]
    .map(([icon, label, color], i) => ({ icon, label, color, i, t: T(2, 0.25 + i * 0.25), midi: m(['A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'][i]) }));
  const levels = [['🌱', 'קל'], ['🎯', 'בינוני'], ['🔥', 'מאתגר']].map(([icon, label], i) => ({ icon, label, i, t: T(3, 0.5 + i * 0.25), midi: m(['E5', 'G5', 'A5'][i]) }));

  // 2. the room: code + QR, then players join on 8ths
  const CODE = 'K7Q2MB';
  const players = ['נועה', 'איתי', 'מיה', 'יואב', 'תמר', 'דניאל', 'שירה', 'רון', 'אורי', 'ליה', 'עומר', 'גיל']
    .map((name, i) => ({ name, i, t: T(4, 1.5 + i * 0.5), midi: m(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i % 6]) + (i >= 6 ? 12 : 0) }));
  const TOTAL_PLAYERS = 24;

  // 3. a real question from the bank (science, medium): the answer is שבתאי (index 3, green ■)
  const Q = { text: 'איזה כוכב לכת מפורסם בטבעותיו?', answers: ['כדור הארץ', 'חמה', 'נפטון', 'שבתאי'], correct: 3, seconds: 20 };
  const qIn = T(6, 0.25);
  const ansIn = [0, 1, 2, 3].map((i) => T(6, 1 + i * 0.25));
  const timerTicks = []; for (let b = 0; b < 6; b++) timerTicks.push(T(6, 2) + b * BEAT); // ticks until the reveal
  const answeredAt = (t) => Math.max(0, Math.min(TOTAL_PLAYERS, Math.round(((t - T(6, 2)) / (ev.reveal - T(6, 2))) * TOTAL_PLAYERS)));

  // 4. leaderboard: five rows, then a swap on the downbeat of bar 9
  const board0 = [['נועה', 2850], ['איתי', 2700], ['מיה', 2640], ['יואב', 2410], ['תמר', 2300]];
  const board1 = [['מיה', 3590], ['נועה', 3480], ['איתי', 3350], ['תמר', 3120], ['יואב', 2410]];
  const rowsIn = board0.map((_, i) => T(8, 0.25 + i * 0.25));

  // 5. podium: 3rd, 2nd, 1st on beats; then the host extras
  const podium = [['איתי', 3, 4060], ['נועה', 2, 4180], ['מיה', 1, 4320]].map(([name, place, score], i) => ({ name, place, score, i, t: T(10, i * 0.75), midi: m(['E5', 'G5', 'C6'][i]) }));
  const extras = [['📊', 'סיכום למנחה · הורדה לאקסל'], ['🔄', 'עוד סיבוב: אותו נושא, שאלות חדשות']].map(([e, s], i) => ({ e, s, i, t: T(11, 0.5 + i), midi: m(['E6', 'G6'][i]) }));

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.orb, sync: 'a' }, topic: { t: T(2), sync: 'av' }, room: { t: T(4), sync: 'av' },
    question: { t: T(6), sync: 'av' }, reveal: { t: ev.reveal, sync: 'av' }, board: { t: T(8), sync: 'av' },
    podium: { t: T(10), sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, pills, steps, topics, levels, CODE, players, TOTAL_PLAYERS, Q, qIn, ansIn, timerTicks, answeredAt, board0, board1, rowsIn, podium, extras, endLines };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

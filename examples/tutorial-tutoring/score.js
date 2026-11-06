// UGABUGA tutorial (16:9) — "שיעורי עזר בבית" (/tutoring). Every label, count and fact comes from
// src/pages/tutoring/TutoringHome.jsx, TutoringPlan.jsx and src/data/tutoring/ (screens are real captures of the live site).
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
  const S = { hook: [0, T(2)], grade: [T(2), T(4)], skills: [T(4), T(7)], time: [T(7), T(10)], plan: [T(10), T(13)], how: [T(13), T(16)], send: [T(16), T(18)], end: [T(18), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm7: { notes: ['F3', 'A3', 'C4'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' },
    Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'C'], [9, 0, 2, 'Gsus'], [9, 2, 2, 'G'],
    [10, 0, 4, 'Am'], [11, 0, 4, 'F'], [12, 0, 4, 'C'], [13, 0, 4, 'G'], [14, 0, 4, 'Am'], [15, 0, 4, 'F'], [16, 0, 4, 'C'], [17, 0, 2, 'Gsus'], [17, 2, 2, 'G'],
    [18, 0, 4, 'C'], [19, 0, 4, 'F'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    tapGrade: T(2, 2), tipGrade: T(3, 0),
    tapMath: T(4, 2), tapFrac: T(5, 0), tapRead: T(5, 2.5), tapCompr: T(6, 0.5), tipSkills: T(6, 1),
    tapMonth: T(7, 2), ringDays: T(8, 0), ringMin: T(8, 1), ringBase: T(8, 2), tipTime: T(8, 2), tapGo: T(9, 2),
    panPlan: T(10, 2), tipPlan: T(11, 0), tapSheet: T(12, 1),
    tapHard: T(14, 0), panList: T(14, 1), tipHow: T(14, 2),
    tapPrint: T(17, 0), tipSend: T(16, 2),
    logo: T(18, 0),
  };
  const steps = [
    { n: 1, sec: 'grade', title: 'באיזו כיתה?', sub: 'לוחצים על הכיתה של הילד', color: '#226bd7' },
    { n: 2, sec: 'skills', title: 'במה קשה?', sub: 'בוחרים תחום, ואז את הנושא שקשה בו', color: '#cf2f56' },
    { n: 3, sec: 'time', title: 'כמה זמן יש לכם?', sub: 'שבוע או חודש, ימים בשבוע, דקות ביום, ואז "בונים את התוכנית"', color: '#8a4fd8' },
    { n: 4, sec: 'plan', title: 'מקבלים תוכנית', sub: 'בכל יום מפגש קצר, עם הסבר להורה, תרגול באתר ודף עבודה', color: '#23874d' },
    { n: 5, sec: 'how', title: 'איך היה?', sub: 'בסוף כל מפגש מסמנים: היה קל, היה בסדר או היה קשה', color: '#e08a00' },
    { n: 6, sec: 'send', title: 'מדפיסים ושולחים', sub: 'טבלה למקרר, דפי עבודה עם תשובות, וקישור למי שעוזר', color: '#00a3c7' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['📖', 'קריאה'], ['✍️', 'כתיבה ולשון'], ['🧮', 'חשבון'], ['🔤', 'אנגלית']];
  const endLines = [{ t: T(18, 0.75) }, { t: T(18, 1.5) }, { t: T(18, 2.25) }, { t: T(18, 3) }, { t: T(19, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

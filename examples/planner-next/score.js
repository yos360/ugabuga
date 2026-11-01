// UGABUGA "השיעור הבא כבר מוכן" (9:16 Reel). The real timetable planner (/planner, beta): quick lesson, the weekly
// timetable, the lesson that falls on each period, its lesson plan, printing. One timeline; all facts from
// src/pages/planner/PlannerPage.jsx and src/data/planner/*.js (the week below is the real engine output for math ג׳).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(14) + 1.7; // ≈ 29.9s

  const S = {
    hook: [0, T(2)], quick: [T(2), T(4)], table: [T(4), T(6)], week: [T(6), T(8)],
    lesson: [T(8), T(10)], more: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['F3', 'A3', 'D4'], bass: 'D2' }, E: { notes: ['E3', 'G#3', 'B3'], bass: 'E2' },
    Csus: { notes: ['F3', 'G3', 'C4'], bass: 'C2' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'], [5, 0, 4, 'F'],
    [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Dm'], [9, 0, 2, 'E'], [9, 2, 2, 'E'],
    [10, 0, 4, 'F'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), // "השיעור הבא" then "כבר מוכן"
    title: T(1, 0), free: T(1, 2.5),
    logo: T(12, 0),
  };
  const hookPills = [['🗓️', 'מערכת'], ['📝', 'מערך שיעור'], ['🖨️', 'דף עבודה']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['E5', 'A5', 'C6'][i]) }));

  const steps = [
    { n: 1, sec: 'quick', title: 'השיעור של היום', sub: 'בלי למלא מערכת: מקצוע, כיתה, וזהו', color: '#cf2f56' },
    { n: 2, sec: 'table', title: 'מכניסים מערכת פעם אחת', sub: 'מוסיפים כיתה ולוחצים על השעות שלה', color: '#226bd7' },
    { n: 3, sec: 'week', title: 'בכל שעה מחכה השיעור', sub: 'מה מלמדים השבוע, לפי תוכנית הלימודים', color: '#8a4fd8' },
    { n: 4, sec: 'lesson', title: 'מערך שיעור מוכן', sub: 'פתיחה, הסבר, תרגול וסיכום', color: '#e08a00' },
    { n: 5, sec: 'more', title: 'מדפיסים ומסדרים', sub: 'דפי עבודה, יומן, חגים וחופשות', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  const LRI = '⁦', PDI = '⁩';
  const DATA = {
    quick: {
      fields: [['מקצוע', '🧮 מתמטיקה'], ['כיתה', 'ג׳'], ['שעות בשבוע', '5'], ['שיעור ביחידה', 'שיעור 8 מתוך 16']],
      today: ['חיבור וחיסור במאוזן ובמאונך בתחום הרבבה', 'היום: חיבור במאונך עם המרה'],
      parents: '👨‍👩‍👧 הורים? דפי תרגול לבית לכל השבוע',
    },
    table: {
      cls: '🧮 מתמטיקה ג׳',
      days: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'],
      periods: [1, 2, 3, 4],
      // [day, period] cells of the page's own example timetable (period numbers shown 1..4)
      cells: [[0, 1], [1, 2], [2, 1], [3, 3], [4, 2]],
      pill: 'לוחצים על שעה — והכיתה שם',
    },
    week: {
      rows: [
        ['א׳', 'שעה 1', 'חיבור במאונך עם המרה', 'שיעור 8 מתוך 16'],
        ['ב׳', 'שעה 2', 'חיסור במאוזן: השלמה וקפיצות', 'שיעור 9 מתוך 16'],
        ['ג׳', 'שעה 1', 'חיסור במאוזן: השלמה וקפיצות', 'שיעור 10 מתוך 16'],
        ['ד׳', 'שעה 3', 'חיסור במאוזן: השלמה וקפיצות', 'שיעור 11 מתוך 16'],
        ['ה׳', 'שעה 2', 'חיסור במאונך עם פריטה', 'שיעור 12 מתוך 16'],
      ],
      pill: '🎄 החגים והחופשות כבר בפנים',
    },
    lesson: {
      title: 'חיבור במאונך עם המרה',
      goal: 'התלמידים מחברים במאונך ויודעים מתי ״מעבירים״ למקום הבא.',
      parts: [
        ['🚪', 'פתיחה', '5 דק׳', 'חזרה קצרה על מה שלמדנו בשיעור הקודם.'],
        ['📣', 'הסבר', '15 דק׳', `רושמים ${LRI}4,768 + 2,459${PDI} בטור ומחברים מהיחידות.`],
        ['✏️', 'תרגול', '20 דק׳', 'פותרים 6 תרגילים במאונך, חלקם עם כמה המרות ברצף.'],
        ['🏁', 'סיכום', '5 דק׳', 'כל תלמיד כותב משפט אחד: מה למדתי היום.'],
      ],
      levels: [['🌱', 'מותאם'], ['📄', 'רגיל'], ['🚀', 'מתקדם']],
      pill: '🖨️ דף עבודה לכל שיעור',
    },
    more: {
      cards: [
        ['🖨️', 'הדפסת השבוע', 'הדפסה של כל שיעורי השבוע.'],
        ['📄', 'דף עבודה לכל שיעור', 'בשלוש רמות: מותאם, רגיל ומתקדם.'],
        ['📅', 'להוסיף ליומן', 'השיעורים של 8 השבועות הקרובים, בטלפון.'],
        ['🎄', 'חגים וחופשות', 'לוח החגים והחופשות של תשפ״ז כבר בפנים.'],
        ['⏸️', 'לא הספקתי?', 'מסמנים, והשיעור חוזר בפעם הבאה.'],
        ['📚', '15 מקצועות', 'מתמטיקה, לשון, אנגלית, תנ״ך, מדע ועוד.'],
      ],
      pill: '🧪 גרסת בטא שמשתפרת כל הזמן',
    },
  };

  const NOTES = ['A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6'];
  const mk = (sec, n, start = 1, gap = 0.75) => Array.from({ length: n }, (_, i) => ({ i, t: S[sec][0] + (start + i * gap) * BEAT, midi: m(NOTES[i % NOTES.length]) }));
  const quickCards = mk('quick', 4, 1, 1.0);          // [0] form, [1] its four fields start inside, [2] today card, [3] parents pill
  const tableCells = mk('table', 6, 1, 0.6);          // [0] class chip, [1..5] the five cells
  const weekRows = mk('week', 5, 1, 0.7);
  const lessonParts = mk('lesson', 6, 1, 0.55);       // [0] card + goal, [1..4] the four phases, [5] level chips
  const moreCards = mk('more', 6, 1, 0.7);
  const endPills = {
    quick: { t: T(3, 2.2), midi: m('C6') },
    table: { t: T(5, 1.5), midi: m('C6') },
    week: { t: T(7, 1.5), midi: m('C6') },
    lesson: { t: T(9, 1.5), midi: m('C6') },
    more: { t: T(11, 1.5), midi: m('C6') },
  };
  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, quick: { t: T(2), sync: 'av' }, table: { t: T(4), sync: 'av' },
    week: { t: T(6), sync: 'av' }, lesson: { t: T(8), sync: 'av' }, more: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, DATA, quickCards, tableCells, weekRows, lessonParts, moreCards, endPills, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

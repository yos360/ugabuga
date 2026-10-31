// UGABUGA "בוגה שוקו חם" (9:16 Reel). The real winter area of the site (/winter): games together on the screen,
// games to print, living-room games with no equipment, a warm kitchen, and the winter holidays. One timeline.
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
    hook: [0, T(2)], screen: [T(2), T(4)], print: [T(4), T(6)], sofa: [T(6), T(8)],
    kitchen: [T(8), T(10)], holidays: [T(10), T(12)], end: [T(12), DURATION],
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
    q1: T(0, 0), q2: T(0, 2), // "גשם בחוץ" then "מה עושים?"
    title: T(1, 0), free: T(1, 2.5),
    logo: T(12, 0),
  };
  const hookPills = [['🎲', 'משחקים'], ['🍫', 'שוקו חם'], ['🕎', 'חגים']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['E5', 'A5', 'C6'][i]) }));

  const steps = [
    { n: 1, sec: 'screen', title: 'משחקים יחד על המסך', sub: 'כל המשפחה מהטלפונים, המסך הגדול מראה', color: '#cf2f56' },
    { n: 2, sec: 'print', title: 'משחקים להדפסה', sub: 'מדפיסים, גוזרים, ויש משחק על השולחן', color: '#226bd7' },
    { n: 3, sec: 'sofa', title: 'בסלון, בלי שום ציוד', sub: 'כשאין כוח לסדר כלום, רק לשבת יחד', color: '#8a4fd8' },
    { n: 4, sec: 'kitchen', title: 'מטבח חם', sub: 'מתכונים פשוטים שהילדים מכינים איתכם', color: '#e08a00' },
    { n: 5, sec: 'holidays', title: 'חגי החורף', sub: 'חנוכה וט״ו בשבט: פעילויות, דפים וחוברות', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // Every card is a real item of WINTER_SECTIONS in src/pages/WinterGames.jsx (emoji, title, line).
  const DATA = {
    screen: {
      live: ['🔴', 'בוגה לייב', 'חידון חי: אחד מארח, כולם עונים מהטלפון.'],
      cards: [
        ['🌍', 'ארץ עיר', 'מגרילים אות, והאתר סופר נקודות.'],
        ['❓', 'חידון טריוויה', 'לפי גיל ורמה.'],
        ['🔐', 'חדרי בריחה', 'חידות בשרשרת, מגיל 4.'],
        ['😄', 'אמת או בוגה', 'שאלות ומשימות מצחיקות.'],
      ],
    },
    print: {
      cards: [
        ['🎲', 'משחק לוח להדפסה', 'לוח מוכן, רק להוסיף קובייה.'],
        ['🃏', 'משחק זיכרון', 'קלפי זיכרון לגזירה.'],
        ['🁫', 'דומינו', 'להדפסה ולגזירה.'],
        ['🎲', 'קובייה לקיפול', 'אין קובייה? מקפלים אחת.'],
        ['🔮', 'מגדת עתידות מנייר', 'מקפלים, כותבים ומשחקים.'],
        ['🌀', 'מבוכים', 'חמש רמות, מגן ועד כיתה ו׳.'],
      ],
      treasure: '🗺️ חיפוש מטמון ליום גשום',
    },
    sofa: {
      cards: [
        ['🙋', 'מי אני?', 'שאלות כן ולא עד שמגלים.'],
        ['🎭', 'פנטומימה', 'מציגים בלי מילים.'],
        ['🎵', 'נחשו את השיר', 'מזמזמים, והשאר מנחשים.'],
        ['🤐', 'אסור להגיד כן ולא', 'דקה בכיסא החם.'],
        ['⏱️', 'קטגוריה בחמש שניות', 'שתי חיות באות כ׳, מהר!'],
        ['📖', 'סיפור משותף', 'כל אחד מוסיף משפט.'],
      ],
    },
    kitchen: {
      rows: [
        ['🥞', 'פנקייק', 'ארוחת בוקר של יום חופש.'],
        ['🍿', 'פופקורן', 'לסרט של ערב חורף.'],
        ['🍫', 'כדורי שוקולד', 'בלי אפייה, ילדים מכינים לבד.'],
        ['🍪', 'עוגיות בננה ושיבולת שועל', 'שלושה מצרכים ותנור.'],
        ['🥔', 'תפוחי אדמה בתנור', 'חם, פריך ופשוט.'],
        ['🧁', 'מאפינס ירקות', 'לארוחת ערב או לקופסת האוכל.'],
      ],
    },
    holidays: {
      cards: [
        ['🕎', 'חנוכה', 'כל מה שיש באתר לחנוכה.'],
        ['🎉', 'מה עושים בחנוכה', 'רעיונות לשמונה ימי החופש.'],
        ['📒', 'חוברת חנוכה', 'חוברת עבודה להדפסה.'],
        ['🌀', 'סביבון', 'החוקים ואיך משחקים.'],
        ['🌳', 'ט״ו בשבט', 'פעילויות, דפים וחידון.'],
        ['🍇', 'סדר ט״ו בשבט', 'סדר משפחתי מוכן.'],
      ],
    },
  };

  // card timings: one per 3/4 beat starting on beat 1 of the step; the hit note climbs a pentatonic line
  const NOTES = ['A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6'];
  const mk = (sec, n, start = 1, gap = 0.75) => Array.from({ length: n }, (_, i) => ({ i, t: S[sec][0] + (start + i * gap) * BEAT, midi: m(NOTES[i % NOTES.length]) }));
  const screenCards = mk('screen', 5, 1, 0.8);       // [0] = Buga Live, then four more
  const printCards = mk('print', 6, 1, 0.7);
  const sofaCards = mk('sofa', 6, 1, 0.7);
  const kitchenRows = mk('kitchen', 6, 1, 0.7);
  const holidayCards = mk('holidays', 6, 1, 0.7);
  const endPills = {
    screen: { t: T(3, 1.75), midi: m('C6') },       // "בחינם, בלי הרשמה"
    print: { t: T(5, 1.5), midi: m('C6') },         // the rainy-day treasure hunt
    sofa: { t: T(7, 1.5), midi: m('C6') },
    kitchen: { t: T(9, 1.5), midi: m('C6') },
    holidays: { t: T(11, 1.5), midi: m('C6') },
  };
  const tick5 = T(6, 2.5);                          // the 5-second timer starts on the sofa card
  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, screen: { t: T(2), sync: 'av' }, print: { t: T(4), sync: 'av' },
    sofa: { t: T(6), sync: 'av' }, kitchen: { t: T(8), sync: 'av' }, holidays: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, DATA, screenCards, printCards, sofaCards, kitchenRows, holidayCards, endPills, tick5, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

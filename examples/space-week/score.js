// UGABUGA "כמה זמן לוקח לאור השמש להגיע לכדור הארץ?" (9:16 Reel). The Space Week kit (/classroom/space-week, src/pages/classroom/SpaceWeek.jsx + src/data/spaceWeek.js).
// The hook is the real grades 5-6 quiz question g56-1; the answer (8 minutes) is never shown anywhere in the reel.
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
    hook: [0, T(2)], aud: [T(2), T(4)], topics: [T(4), T(6)], modes: [T(6), T(8)],
    play: [T(8), T(10)], print: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    D: { notes: ['F#3', 'A3', 'D4'], bass: 'D2' }, A: { notes: ['E3', 'A3', 'C#4'], bass: 'A1' },
    Bm: { notes: ['F#3', 'B3', 'D4'], bass: 'B1' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Em7: { notes: ['G3', 'B3', 'D4'], bass: 'E2' }, Asus: { notes: ['E3', 'A3', 'D4'], bass: 'A1' },
    Dadd9: { notes: ['F#3', 'A3', 'D4', 'E4'], bass: 'D2' },
  }, [
    [0, 0, 4, 'D'], [1, 0, 4, 'A'], [2, 0, 4, 'G'], [3, 0, 4, 'D'], [4, 0, 4, 'Bm'], [5, 0, 4, 'G'],
    [6, 0, 4, 'D'], [7, 0, 4, 'A'], [8, 0, 4, 'G'], [9, 0, 2, 'Asus'], [9, 2, 2, 'A'],
    [10, 0, 4, 'Em7'], [11, 0, 4, 'A'], [12, 0, 4, 'D'], [13, 0, 4, 'G'], [14, 0, 4, 'Dadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(0, 3.2), free: T(1, 3),
    pick: T(2, 3.3), // step 1: tap the grades 5-6 chip
    topic: T(4, 3.2), // step 2: tap the "Israel in space" row
    reasonCard: T(5, 0.2), // step 2: the Ramon / Beresheet / Stibbe detail card
    mode: T(6, 3.0), // step 3: tap the right quiz answer
    go: T(8, 0.8), ans: T(9, 0.5), // step 4: tap print, then "pages ready"
    printBtn: T(11, 2.6), // step 5: the closing pill
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2].map((i) => ({ i, t: T(0, 1.4 + i * 0.4), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // ---- real data of the page (src/data/spaceWeek.js, band g56 + DAYS + PLANETS) ----
  const HOOK_Q = 'כמה זמן לוקח לאור השמש להגיע לכדור הארץ?'; // g56-1, answer never shown
  const HOOK_OPTS = ['שנייה אחת', 'בערך 8 דקות', 'יום שלם'];
  const BANDS = [['🧸', 'גן'], ['🌍', 'כיתות א׳–ב׳'], ['🌙', 'כיתות ג׳–ד׳'], ['🔭', 'כיתות ה׳–ו׳']];
  const GOAL = 'מבינים כמה גדולים המרחקים בחלל, מכירים את ישראל בחלל ואת סיפורו של אילן רמון.';
  const LESSON = [[5, 'פתיחה'], [15, 'מודל בקנה מידה'], [15, 'ישראל בחלל'], [10, 'סיכום']];
  const RAMON = 'אילן רמון (⁦2003⁩), החללית בראשית (⁦2019⁩) ואיתן סטיבה (⁦2022⁩)';
  const QUIZ = { text: 'מה קרה לפלוטו ב־⁦2006⁩?', opts: ['הוא התפוצץ', 'הוגדר מחדש ככוכב לכת ננסי', 'התגלה לראשונה'], answer: 1, explain: 'האיגוד האסטרונומי הבינלאומי קבע הגדרה חדשה לכוכב לכת, ופלוטו לא עומד בה.' };
  const TF = ['שנת אור היא מידה של זמן.', 'נוגה הוא כוכב הלכת החם ביותר.', 'פלוטו נחשב היום לכוכב לכת ננסי.'];
  const PLANETS = [['חמה', 0.39], ['נוגה', 0.72], ['כדור הארץ', 1], ['מאדים', 1.52], ['צדק', 5.2], ['שבתאי', 9.54], ['אורנוס', 19.2], ['נפטון', 30.06]];
  const DAYS = [['ראשון', '☀️', 'השמש וכוכבי הלכת'], ['שני', '🌙', 'הירח'], ['שלישי', '👩‍🚀', 'אסטרונאוטים ותחנת החלל'], ['רביעי', '🛰️', 'ישראל בחלל ואילן רמון'], ['חמישי', '🔐', 'יום שיא: חדר בריחה']];

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים שכבה', sub: 'מגן ועד כיתה ו׳, לכיתה ולבית', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'מערך שיעור קצר', sub: 'כל חלק עם הזמן שלו', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'חידון על המסך', sub: 'שש שאלות, והסבר אחרי כל תשובה', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'דף עבודה להדפסה', sub: 'ודף תשובות נפרד לבדיקה', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'יצירה ותוכנית לשבוע', sub: 'חמישה ימים, יום אחרי יום', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. four grade chips, the summary card
  const AUD = [T(2, 0.3), T(2, 0.9), T(2, 1.5), T(2, 2.1), T(3, 0.5)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  // 2. four lesson rows
  const TOPICS = [T(4, 0.3), T(4, 1.0), T(4, 1.7), T(4, 2.4)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 3. the question card, three answers
  const MODES = [T(6, 0.2), T(6, 0.9), T(6, 1.4), T(6, 1.9)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const explainT = T(7, 0.2);
  // 4. two A4 pages + the per-page chips
  const ROWS = [0, 1, 2].map((i) => ({ i, t: T(8, 1.3 + i * 0.55), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. craft card, the scale strip, five days
  const sheetItems = [T(10, 0.3), T(10, 1.7), T(10, 3.2), T(10, 3.8), T(11, 0.4), T(11, 1.0), T(11, 1.6)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i]) }));
  const dotsT = (k) => T(10, 2.1 + k * 0.12);
  const extras = [];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  // extra pills: [0,1] step 1 · [2,3] step 2 · [4,5] step 3 · [6,7] step 4 · [8] step 5
  const pills = [T(3, 1.6), T(3, 2.8), T(5, 2.0), T(5, 3.0), T(7, 1.5), T(7, 2.6), T(9, 1.2), T(9, 2.0), ev.printBtn];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, TOPICS, MODES, explainT, sheetItems, dotsT, extras, endLines, pills, ROWS,
    HOOK_Q, HOOK_OPTS, BANDS, GOAL, LESSON, RAMON, QUIZ, TF, PLANETS, DAYS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

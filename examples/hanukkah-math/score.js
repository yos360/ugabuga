// UGABUGA "כמה נרות מדליקים בכל ערבי חנוכה?" (9:16 Reel). Hanukkah maths (/holidays/hanukkah/math, src/pages/holidays/HanukkahMath.jsx + src/data/hanukkahMath.js).
// The hook is the real problem g3-1 (candles over all 8 nights, no shamash); the answer (36) is never shown in the reel.
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
    pick: T(2, 3.3), // step 1: tap grade 3
    topic: T(5, 0.0), // step 2: tap "בדיקה"
    reasonCard: T(5, 1.2), // step 2: the worked solution
    mode: T(6, 1.2), // step 3: tap "סובבו את הסביבון"
    go: T(8, 0.8), ans: T(9, 0.5), // step 4: tap print, then "pages ready"
    printBtn: T(11, 2.6), // step 5: the closing pill
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2].map((i) => ({ i, t: T(0, 1.4 + i * 0.4), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // ---- real data of the page (src/data/hanukkahMath.js: MATH_GRADES, MATH_PROBLEMS, GAME_MODES, gameQuestion) ----
  const HOOK_Q = 'כמה נרות מדליקים בכל ערבי חנוכה?'; // g3-1, answer (36) never shown
  const GRADES = [
    ['כיתה א׳', 'חיבור וחיסור עד ⁦20⁩'], ['כיתה ב׳', 'חיבור וחיסור עד ⁦100⁩, כפל פשוט'],
    ['כיתה ג׳', 'כפל, חילוק ובעיות בשני שלבים'], ['כיתה ד׳', 'כפל במספרים גדולים, זמן וכסף'],
    ['כיתה ה׳', 'שברים, עשרוניים וממוצע'], ['כיתה ו׳', 'אחוזים, יחס ותרגילים מרובי שלבים'],
  ];
  const PICK_GRADE = 2; // grade 3
  const PROBLEM = { n: 4, q: 'סופגנייה עולה ⁦6⁩ שקלים. כמה עולות ⁦7⁩ סופגניות?', a: '42', unit: 'שקלים', sol: '⁦7⁩ פעמים ⁦6⁩ שווה ⁦42⁩.' }; // g3-4
  const MODES_L = [['חיבור וחיסור', 'א׳–ב׳'], ['כפל', 'ג׳–ד׳'], ['גימטריה', 'ה׳–ו׳']];
  const ROUND = { letter: 'ג', v: 3, night: 5, q1: 'ערב ⁦5⁩ של חנוכה, ויצא ג (⁦3⁩).', q2: 'כמה נקודות קיבלתם?', eq: '⁦3 × 5 = ?⁩', a: '15' }; // gameQuestion('times') shape
  const HARD = [
    ['כיתה א׳', '#23874d', 'בקופסה היו ⁦10⁩ סופגניות. אכלנו ⁦4⁩ סופגניות. כמה סופגניות נשארו בקופסה?'], // g1-1
    ['כיתה ו׳', '#cf2f56', 'היחס בין סופגניות ריבה לסופגניות שוקולד הוא ⁦3:2⁩. יש ⁦45⁩ סופגניות בסך הכול. כמה מהן בריבה?'], // g6-3
    ['כיתה ו׳', '#8a4fd8', 'משחק קופסה עולה ⁦60⁩ שקלים, ולכבוד חנוכה יש הנחה של ⁦15%⁩. כמה משלמים?'], // g6-2
  ];

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים כיתה', sub: 'מכיתה א׳ ועד כיתה ו׳', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'פותרים על המסך', sub: 'עם בדיקה מיד ופתרון מוסבר', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'משחק סביבון של חשבון', sub: 'שלוש רמות: חיבור, כפל, גימטריה', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מדפיסים דף עבודה', sub: 'ודף פתרונות נפרד', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מהקל אל המאתגר', sub: 'סופגניות, נרות, הנחות ויחס', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. six grade cards, the "6 problems" note
  const AUD = [T(2, 0.3), T(2, 0.7), T(2, 1.1), T(2, 1.5), T(2, 1.9), T(2, 2.3), T(3, 0.5)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i]) }));
  // 2. problem card, answer row, typed answer, caption
  const TOPICS = [T(4, 0.3), T(4, 1.0), T(4, 1.9), T(4, 2.6)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 3. level chips, spin button, dreidel, question card
  const MODES = [T(6, 0.2), T(6, 0.7), T(6, 1.6), T(6, 2.4)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const explainT = T(7, 1.0);
  // 4. two A4 pages + the chips
  const ROWS = [0, 1, 2].map((i) => ({ i, t: T(8, 1.3 + i * 0.55), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. three problem cards, topic chips, privacy card, teacher card
  const sheetItems = [T(10, 0.3), T(10, 1.2), T(10, 2.1), T(10, 3.0), T(11, 0.4)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const dotsT = (k) => T(11, 0.35 + k * 0.12);
  const extras = [];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  // extra pills: [0] step 1 · [1] step 2 · [2] step 3 · [3] step 4 · [4] step 5
  const pills = [T(3, 1.6), T(5, 2.4), T(7, 2.6), T(9, 2.0), ev.printBtn];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, TOPICS, MODES, explainT, sheetItems, dotsT, extras, endLines, pills, ROWS,
    HOOK_Q, GRADES, PICK_GRADE, PROBLEM, MODES_L, ROUND, HARD,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

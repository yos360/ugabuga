// UGABUGA "כמה פיצות ל־20 ילדים?" (9:16 Reel). The party calculator (/calculator, src/pages/Calculator.jsx).
// The hook asks for 20 kids aged 6–9; the demo on screen uses 15 guests so the answer is never shown.
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
    pick: T(3, 2), // tap on the birthday event
    topic: T(5, 0.5), // tap: a guests step
    mode: T(7, 2), // tap: budget
    go: T(8, 0.8), ans: T(9, 0.5), // tap "חשבו לי", then the total
    printBtn: T(11, 0), // tap the print button
    logo: T(12, 0),
  };
  const hookOpts = ['4', '6', '9'].map((s, i) => ({ s, i, t: T(0, 3 + i * 0.45), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // ---- real numbers: same formulas as calculate() in src/pages/Calculator.jsx (medium budget) ----
  const calc = ({ guests, age, duration, meal, budget, event }) => {
    const ff = meal === 'pizza' ? 1 : meal === 'snacks' ? 0.55 : meal === 'light' ? 0.75 : 0.3;
    const pr = age === '3-5' ? 0.2 : age === '6-9' ? 0.3 : age === '10-13' ? 0.34 : 0.38;
    const pizzas = meal === 'none' ? 0 : Math.max(1, Math.ceil(guests * pr * ff));
    const drinks = Math.max(2, Math.ceil(guests * (duration === '3+' ? 0.8 : duration === '2-3' ? 0.62 : 0.45)));
    const snacks = meal === 'none' ? 0 : Math.ceil(guests * (meal === 'snacks' ? 0.8 : 0.4));
    const cake = event === 'birthday' || event === 'bar' ? Math.max(1, Math.ceil(guests / 24)) : 0;
    const cups = Math.ceil(guests * 1.5), plates = meal === 'none' ? 0 : Math.ceil(guests * 1.2);
    const favors = event === 'birthday' || event === 'kids' ? guests : 0;
    const p = { pizza: 55, drink: 12, snack: 5, cake: 120, cup: 1, plate: 1, favor: 15 };
    const rows = [
      ['🍕', 'אוכל', `${pizzas} פיצות משפחתיות`, pizzas * p.pizza],
      ['🥤', 'שתייה', `${drinks} בקבוקים של 1.5 ליטר`, drinks * p.drink],
      ['🍿', 'נשנושים', `${snacks} שקיות חטיפים`, snacks * p.snack],
      ['🎂', 'עוגה', `${cake} עוגה למסיבה`, cake * p.cake],
      ['🍽️', 'חד־פעמי', `${cups} כוסות · ${plates} צלחות`, cups * p.cup + plates * p.plate],
      ['🎁', 'שקיות הפתעה', `${favors} שקיות`, favors * p.favor],
    ];
    return { rows, total: rows.reduce((a, r) => a + r[3], 0) };
  };
  // the hook asks about 20 kids; the demo on screen uses 15, so the hook answer is never shown
  const DEMO = { event: 'birthday', guests: 15, age: '6-9', duration: '2-3', meal: 'pizza', budget: 'medium' };
  const RESULT = calc(DEMO);

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים סוג אירוע', sub: 'יום הולדת, גן, משפחה, בר/בת מצווה, מבוגרים', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'כמה אורחים ובאיזה גיל', sub: 'בין 5 ל־60 משתתפים, ומשך האירוע', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'ארוחה ותקציב', sub: 'פיצה, ארוחה קלה, נשנושים או בלי אוכל', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'לוחצים: חשבו לי!', sub: 'רשימת קניות עם כמויות ועלות משוערת', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מדפיסים או שולחים', sub: 'רשימה עם תיבות סימון, או ישר בוואטסאפ', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the five event types (EVENTS in Calculator.jsx)
  const AUD = [['🎂', 'מסיבת יום הולדת'], ['🧸', 'אירוע בגן'], ['🏠', 'אירוע משפחתי'], ['🎉', 'בר/בת מצווה'], ['🏙️', 'אירוע למבוגרים']]
    .map(([emoji, label], i) => ({ emoji, label, i, t: T(2, 0.3 + i * 0.6), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const AUD_PICK = 0;

  // 2. guests stepper + slider, age and duration chips (the guest number counts up to the demo value)
  const AGES = ['⁦3–5⁩', '⁦6–9⁩', '⁦10–13⁩', 'מבוגרים'], AGE_PICK = 1;
  const DURS = ['שעה–שעתיים', '⁦2–3⁩ שעות', '⁦3⁩ שעות+'], DUR_PICK = 1;
  const TOPICS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ i, t: T(4, 0.2 + i * 0.36), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6'][i]) }));
  const TOPIC_PICK = 0;

  // 3. the four meal options and the three budget levels
  const MEALS = ['🍕 פיצה מוזמנת', '🥪 ארוחה קלה', '🍿 נשנושים', 'ללא אוכל'], MEAL_PICK = 0;
  const BUDGETS = ['💚 חסכוני', '💛 רגיל', '💜 מפנק'], BUDGET_PICK = 1;
  const MODES = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ i, t: T(6, 0.3 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'D6', 'B5', 'E6', 'F#6'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];

  // 4. the result rows appear one by one after the tap, then the total
  const ROWS = RESULT.rows.map((r, i) => ({ i, t: T(8, 1.3 + i * 0.45), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6'][i]) }));
  // 5. print sheet rows
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.4 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 0.6) }, { t: T(11, 1.4) }];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  // every pill/chip pop in the film that gets a pop + marimba in song.js
  const pills = [T(3, 0.5), T(3, 1.5), T(5, 0.5), T(5, 1.5), T(7, 0.5), T(7, 1.5), T(9, 1.2), T(9, 2), T(10, 3), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    DEMO, RESULT, ROWS, AGES, AGE_PICK, DURS, DUR_PICK, MEALS, MEAL_PICK, BUDGETS, BUDGET_PICK,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

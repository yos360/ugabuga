// UGABUGA tutorial (16:9) — "שברים לכיתות ד׳–ה׳" (/math/fractions).
// Every label and fact comes from src/math/FractionsGuide.jsx + src/data/fractionsGuide.js (STEPS, HOME_IDEAS, the
// comparison tool and the fraction wall) and the topic page in src/math/MathPages.jsx (levels, "✏️ תרגול",
// "📝 מבחן (10 שאלות)", "🖨️ דף עבודה להדפסה"). Screens are real captures of the live pages (shoot.js).
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
  const S = { hook: [0, T(2)], toc: [T(2), T(5)], card: [T(5), T(8)], practice: [T(8), T(11)], compare: [T(11), T(14)], home: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' },
  }, [
    [0, 0, 4, 'F'], [1, 0, 4, 'G'], [2, 0, 4, 'C'], [3, 0, 4, 'Am'], [4, 0, 4, 'F'],
    [5, 0, 4, 'G'], [6, 0, 4, 'C'], [7, 0, 4, 'Em'], [8, 0, 4, 'F'], [9, 0, 4, 'C'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. the steps list: grade 4 = 1–5, grade 5 = 6–11; tap "4. השוואת שברים"
    g4: T(2, 1.5), g5: T(3, 0), tapStep: T(3, 2.5), tipToc: T(4, 1),
    // 2. the step card: example, how to teach, the common mistake
    ringEx: T(5, 1), ringTip: T(6, 0), ringMistake: T(6, 2.5), tipCard: T(7, 0.5),
    // 3. "להסבר, לתרגול ולדף להדפסה ←" → the topic page: levels, practice / quiz / printable
    ringLink: T(8, 0.5), tapLink: T(8, 2.5), topic: T(9, 0), ringLevels: T(9, 1), ringModes: T(9, 3), tipPractice: T(10, 1),
    // 4. the comparison tool + the fraction wall
    tapA: T(11, 1.5), tapB: T(12, 1.5), result: T(12, 3), tipCmp: T(13, 0.5),
    // 5. six ideas for home
    home0: T(14, 1), tipHome: T(15, 2),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'toc', title: 'בוחרים שלב', sub: '11 שלבים, לפי הסדר שבו לומדים אותם בכיתה', color: '#cf2f56' },
    { n: 2, sec: 'card', title: 'קוראים את השלב', sub: 'בכל שלב: הרעיון, דוגמה, איך מלמדים ואיפה ילדים טועים', color: '#226bd7' },
    { n: 3, sec: 'practice', title: 'מתרגלים ומדפיסים', sub: 'הכפתור הירוק מוביל לדף הנושא: תרגול אונליין, מבחן ודף עבודה', color: '#23874d' },
    { n: 4, sec: 'compare', title: 'משווים בציור', sub: 'בוחרים מונה ומכנה לשני שברים, ורואים מי גדול יותר ולמה', color: '#e08a00' },
    { n: 5, sec: 'home', title: 'שברים בבית', sub: 'שישה רעיונות להורים: מהמטבח, מהשעון ומהארנק', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🪜', '11 שלבים'], ['💡', 'איך מלמדים'], ['⚠️', 'טעויות נפוצות'], ['🧱', 'קיר שברים']];
  const HOME = [['🍫', 'חפיסת שוקולד'], ['🥣', 'כוסות מדידה'], ['🕒', 'שעון מחוגים'], ['🪙', 'כסף'], ['📄', 'קיפול דפים'], ['🍕', 'פיצה משפחתית']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, HOME, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

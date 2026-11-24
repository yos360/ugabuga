// UGABUGA "כמה כסף יהיה בקופה?" (9:16 Reel). Word problems by grade (/math/word-problems, math/WordProblemsGuide.jsx, data/wordProblemsByGrade.js).
// The hook is the real problem g3-10 (40 ₪ + 15 ₪ a week, 4 weeks); the answer is never shown, the viewer answers in the comments.
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
    q1: T(0, 0), q2: T(0, 2), title: T(0, 3.2), free: T(0, 3.8),
    pick: T(3, 0.5), // step 1: tap the card "איזו פעולה?"
    topic: T(5, 0.0), // step 2: tap the grade card ג׳
    reasonCard: T(5, 0.6),
    mode: T(7, 0.5), fb3: T(7, 1.2), // step 3: line 4 "בודקים ועונים", then the answer sentence
    go: T(8, 2.3), ans: T(9, 0.2), // step 4: tap "בדיקה", then "נכון!" + the solution
    printBtn: T(10, 1.0), // step 5: tap the print button
    logo: T(12, 0),
  };
  // hook: the three real givens of the problem (data/wordProblemsByGrade.js g3-10)
  const hookOpts = [0, 1, 2].map((i) => ({ i, t: T(0, 0.8 + i * 0.45), midi: m(['D5', 'F#5', 'A5'][i]) }));

  // ---- real data of the site (data/wordProblemsByGrade.js, math/WordProblemsGuide.jsx) ----
  const N = (x) => '⁦' + x + '⁩';
  const HOOKQ = { text1: 'לרוני יש בקופה ' + N(40) + ' ₪.', text2: 'בכל שבוע הוא חוסך עוד ' + N(15) + ' ₪.', ask: 'כמה כסף יהיה בקופה אחרי ' + N(4) + ' שבועות?', given: ['40 ₪ בקופה', '15 ₪ בכל שבוע', '4 שבועות'] };
  const METHOD = [
    { emoji: '👀', title: 'מה שואלים?', text: 'מסמנים בעיגול את השאלה' },
    { emoji: '✏️', title: 'מה נתון?', text: 'מסמנים בקו את המספרים שחשובים' },
    { emoji: '🧮', title: 'איזו פעולה?', text: 'מצטרפים, מורידים, משווים, קבוצות שוות או חלוקה שווה?' },
    { emoji: '✅', title: 'בודקים ועונים', text: 'עונים במשפט מלא, עם יחידה' },
  ];
  const GRADES = [
    { emoji: '🐣', label: 'כיתה ב׳', levels: ['חיבור וחיסור עד ' + N(100), 'כפל וחילוק פשוטים', 'בעיות של שני שלבים'] },
    { emoji: '🦊', label: 'כיתה ג׳', levels: ['חיבור וחיסור עד ' + N('1,000'), 'כפל וחילוק (גם עם שארית)', 'בעיות של שני שלבים'] },
    { emoji: '🦉', label: 'כיתה ד׳', levels: ['מספרים גדולים: חיבור וחיסור', 'כפל, חילוק, שבר מכמות והיקף', 'בעיות של שני שלבים'] },
  ];
  const GRADE_PICK = 1; // כיתה ג׳
  // the worked example of the grade-3 page (g3-12)
  const EX = {
    text: 'בחווה יש ' + N(6) + ' פרות ו־' + N(9) + ' תרנגולות. לפרה ' + N(4) + ' רגליים ולתרנגולת ' + N(2) + ' רגליים.',
    ask: 'כמה רגליים יש לכל בעלי החיים יחד?',
    given: ['6 פרות × 4 רגליים', '9 תרנגולות × 2 רגליים'],
    op: 'כפל, כפל ואז חיבור', steps: ['6 × 4 = 24', '9 × 2 = 18', '24 + 18 = 42'], check: '42 − 18 = 24', sentence: 'לבעלי החיים יש ' + N(42) + ' רגליים.',
  };
  // the practice of the grade-2 page (g2-7), answered right
  const PRAC = { n: 7, level: 'רמה 2', text: 'בחניית האופניים של בית הספר עומדים ' + N(9) + ' אופניים. לכל אופניים יש ' + N(2) + ' גלגלים.', ask: 'כמה גלגלים יש בחנייה?', unit: 'גלגלים', answer: '18', step: '9 × 2 = 18', sentence: 'בחנייה יש ' + N(18) + ' גלגלים.' };
  // the printable sheet of grade 3 (g3-1, g3-2) and the answer page
  const SHEET = {
    q: [
      { n: 1, text: 'בספריית בית הספר יש ' + N(356) + ' ספרים בעברית ו־' + N(218) + ' ספרים באנגלית.', ask: 'כמה ספרים יש בספרייה בסך הכול?' },
      { n: 2, text: 'באצטדיון השכונתי יש ' + N(800) + ' מקומות ישיבה. למשחק הכדורגל נמכרו ' + N(645) + ' כרטיסים.', ask: 'כמה מקומות נשארו פנויים?' },
    ],
    ans: [['356 + 218 = 574', 'בספרייה יש ' + N(574) + ' ספרים.'], ['800 − 645 = 155', 'נשארו ' + N(155) + ' מקומות פנויים.'], ['1000 − 375 = 625', 'בשקית נשארו ' + N(625) + ' גרם קמח.'], ['450 + 350 = 800', 'יואב רץ ' + N(800) + ' מטר.']],
  };

  const steps = [
    { n: 1, sec: 'aud', title: 'ארבעה שלבים', sub: 'אותם שלבים בכל שאלה מילולית', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'בוחרים כיתה', sub: '⁦12⁩ שאלות לכל כיתה, בשלוש רמות', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'פתרון צעד אחר צעד', sub: 'למשל שאלת החווה, עם פתרון מלא', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מתרגלים על המסך', sub: 'כותבים מספר ומקבלים בדיקה', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'דף עבודה להדפסה', sub: 'עם עמוד תשובות מלא', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. four method cards
  const AUD = [0, 1, 2, 3].map((i) => ({ i, t: T(2, 0.2 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 2. three grade cards
  const TOPICS = [0, 1, 2].map((i) => ({ i, t: T(4, 0.2 + i * 0.45), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 3. problem card, the first lines of the solution
  const MODES = [T(6, 0.2), T(6, 1.0), T(6, 1.8), T(6, 2.6)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];
  // 4. problem card, input row, button, feedback
  const ROWS = [0, 1, 2, 3].map((i) => ({ i, t: T(8, 0.3 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 5. info card, then three sheets
  const sheetItems = [T(10, 0.2), T(10, 1.4), T(10, 2.0), T(10, 2.6)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 2.3) }];

  const endLines = [{ t: T(12, 0.3) }, { t: T(12, 0.5) }, { t: T(12, 0.7) }, { t: T(12, 0.9) }, { t: T(12, 1.2) }];

  const pills = [T(3, 1.4), T(3, 2.4), T(5, 2.0), T(5, 3.0), T(7, 2.6), T(9, 1.6), T(9, 2.6), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, TOPICS, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    HOOKQ, METHOD, GRADES, GRADE_PICK, EX, PRAC, SHEET, ROWS, NAMES: [], DATE: '', SIGNER: '',
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

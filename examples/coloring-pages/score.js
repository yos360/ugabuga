// UGABUGA "איזה דף צביעה הילד שלכם יבחר?" (9:16 Reel). Coloring pages (/printables/coloring, ColoringPages.jsx, ColoringSubject.jsx, ColoringDrawing.jsx, data/coloringSubjects.js, coloringDrawings.js).
// The hook shows three real drawings (dinosaur 1, unicorn 1, soccer 1) as a pick-one question; there is no right answer, the viewer chooses in the comments.
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
    pick: T(3, 0.5), // step 1: tap a letter
    topic: T(5, 0.0), // step 2: tap the continent "אירופה"
    reasonCard: T(5, 0.6), // step 2: the start button appears
    mode: T(7, 0.5), fb3: T(7, 1.2), // step 3: tap the right answer, then "נכון!" + the capital
    go: T(8, 2.3), ans: T(9, 0.2), // step 4: tap a wrong answer, then the explanation + the note
    printBtn: T(11, 0.4), // step 5: tap "send the result on WhatsApp"
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2].map((i) => ({ i, t: T(0, 0.8 + i * 0.45), midi: m(['D5', 'F#5', 'A5'][i]) }));

  // ---- real data of the site (data/coloringSubjects.js, data/coloringDrawings.js) ----
  const HOOK = [
    { img: 'img/c/dinosaur-1.webp', name: 'דינוזאור בוקע מביצה', tag: 'דינוזאורים' },
    { img: 'img/c/unicorn-1.webp', name: 'חד קרן דוהר באחו פרחים', tag: 'חד קרן' },
    { img: 'img/c/soccer-1.webp', name: 'ילד בועט לשער', tag: 'כדורגל' },
  ];
  // the first 12 subject cards of the real hub grid (53 subjects, 1,000 drawings)
  const SUBJ = [['🦄', 'חד קרן', 65], ['🐱', 'חתולים', 12], ['🌸', 'פרחים', 10], ['❤️', 'לבבות', 10], ['🦭', 'כלבי ים', 10], ['🐰', 'ארנבים', 11], ['🐶', 'כלבים', 11], ['🍕', 'אוכל חמוד', 16], ['🦕', 'דינוזאורים', 12], ['🚗', 'מכוניות וכלי רכב', 15], ['🍦', 'גלידה', 10], ['🧸', 'דובי', 10]];
  const SUBJ_PICK = 8; // דינוזאורים
  const DRAW = [
    { img: 'img/c/dinosaur-1.webp', name: 'דינוזאור בוקע מביצה' },
    { img: 'img/c/dinosaur-2.webp', name: 'דינוזאור צוואר ארוך אוכל עלים' },
    { img: 'img/c/dinosaur-3.webp', name: 'דינוזאור משחק בכדור' },
    { img: 'img/c/dinosaur-4.webp', name: 'דינוזאור והר געש' },
  ];
  const DRAW_PICK = 0;
  const HOLIDAY = [['🕎', 'חנוכייה', 103, 'img/c/hanukkiah-1.webp'], ['🌀', 'סביבונים', 58, 'img/c/dreidel-1.webp'], ['🍩', 'סופגניות', 58, 'img/c/sufganiyah-1.webp'], ['🛡️', 'מכבים', 46, 'img/c/maccabees-1.webp']];
  const GUIDE = { ages: '\u20663–6\u2069', tip: 'צבעו את הקליפה בגוון בהיר ואת הדינוזאור בגוון חזק יותר.', activity: 'הוסיפו נקודות לקליפת הביצה.' };
  const TOTAL = 1000, NSUBJ = 53;

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים נושא', sub: '\u206653\u2069 נושאים, מחד קרן ועד דינוזאורים', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'בוחרים ציור', sub: 'כל נושא עם ציורים משלו', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'מדפיסים על A4', sub: 'ציור אחד או כל הציורים של הנושא', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'חנוכה בדרך', sub: 'דפי צביעה לחנוכה, כבר באתר', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'לכל גיל, עם רעיון', sub: 'גיל מומלץ, טיפ ופעילות אחרי הצביעה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. three level rows
  const AUD = [0, 1].map((i) => ({ i, t: T(2, 0.2 + i * 0.4), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 2. seven continent chips, then the start button
  const TOPICS = [0].map((i) => ({ i, t: T(4, 0.2 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'F#6', 'A6'][i]) }));
  // 3. question card, then four answers
  const MODES = [T(6, 0.3), T(6, 1.0), T(6, 1.7)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];
  // 4. four answers
  const ROWS = [0, 1, 2, 3].map((i) => ({ i, t: T(8, 0.4 + i * 0.45), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 5. result card, buttons, two cards to review
  const sheetItems = [T(10, 0.3), T(10, 1.2), T(10, 2.2), T(10, 2.7)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
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
    HOOK, SUBJ, SUBJ_PICK, DRAW, DRAW_PICK, HOLIDAY, GUIDE, TOTAL, NSUBJ, ROWS, NAMES: [], DATE: '', SIGNER: '',
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

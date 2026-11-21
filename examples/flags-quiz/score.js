// UGABUGA "של איזו מדינה הדגל הזה?" (9:16 Reel). The flags quiz (/flags/quiz, src/flags/FlagsPages.jsx, flagQuiz.js, flagsData.js).
// The hook shows a real flag with four real country names; the viewer picks in their head. The answer is never shown.
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
    pick: T(3, 0.5), // step 1: tap the level "קשה"
    topic: T(5, 0.0), // step 2: tap the continent "אירופה"
    reasonCard: T(5, 0.6), // step 2: the start button appears
    mode: T(7, 0.5), fb3: T(7, 1.2), // step 3: tap the right answer, then "נכון!" + the capital
    go: T(8, 2.3), ans: T(9, 0.2), // step 4: tap a wrong answer, then the explanation + the note
    printBtn: T(11, 0.4), // step 5: tap "send the result on WhatsApp"
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2, 3].map((i) => ({ i, t: T(0, 0.8 + i * 0.35), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));

  // ---- real data of the pages (src/flags/FlagsPages.jsx, flagQuiz.js, flagsData.js) ----
  // hook = Poland's flag (white over red) with four real names; the answer is never shown (it is option 3)
  const HOOK_FLAG = 'pl';
  const HOOK_NAMES = ['אינדונזיה', 'מונקו', 'פולין', 'אוסטריה'];
  const LEVELS = [['קל', 'דגלים מוכרים, תשובות שונות מאוד זו מזו'], ['בינוני', 'כל הדגלים, תשובות מכל העולם'], ['קשה', 'התשובות מאותה יבשת — דגלים דומים!']];
  const LEVEL_PICK = 2;
  const CONTS = ['כל העולם', '🏰 אירופה', '🏯 אסיה', '🦁 אפריקה', '🗽 אמריקה הצפונית', '🦜 אמריקה הדרומית', '🏝️ אוקיאניה'];
  const CONT_PICK = 1;
  // step 3: hard level, Europe: Andorra, the viewer taps the right answer
  const Q3 = { flag: 'ad', names: ['מולדובה', 'רומניה', 'אנדורה', 'בלגיה'], right: 2, capital: 'אנדורה לה וייה' };
  // step 4: Romania, a wrong tap (Andorra), then the real explanation with the real note
  const Q4 = { flag: 'ro', names: ['אנדורה', 'מולדובה', 'רומניה', 'בלגיה'], right: 2, pick: 0, capital: 'בוקרשט', note: 'הדגל של רומניה כמעט זהה לדגל של צ׳אד.' };
  const REVIEW = [{ flag: 'ro', name: 'רומניה', capital: 'בוקרשט' }, { flag: 'md', name: 'מולדובה', capital: 'קישינב' }];

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים רמה', sub: 'קל, בינוני או קשה', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'בוחרים יבשת', sub: 'או כל העולם — ⁦10⁩ דגלים בסיבוב', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'מזהים את הדגל', sub: 'ארבע תשובות, והרצף 🔥 סופר', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מקבלים הסבר', sub: 'הבירה ועובדה על הדגל', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'משתפים ומאתגרים', sub: 'תוצאה בוואטסאפ ודגלים לחזרה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. three level rows
  const AUD = [0, 1, 2].map((i) => ({ i, t: T(2, 0.2 + i * 0.4), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 2. seven continent chips, then the start button
  const TOPICS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ i, t: T(4, 0.2 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'F#6', 'A6'][i]) }));
  // 3. question card, then four answers
  const MODES = [T(6, 0.3), T(6, 1.0), T(6, 1.4), T(6, 1.8), T(6, 2.2)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];
  // 4. four answers
  const ROWS = [0, 1, 2, 3].map((i) => ({ i, t: T(8, 0.5 + i * 0.35), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 5. result card, buttons, two cards to review
  const sheetItems = [T(10, 0.3), T(10, 1.2), T(10, 2.2), T(10, 2.7)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 2.3) }];

  const endLines = [{ t: T(12, 0.3) }, { t: T(12, 0.5) }, { t: T(12, 0.7) }, { t: T(12, 0.9) }, { t: T(12, 1.2) }];

  const pills = [T(3, 1.4), T(3, 2.2), T(3, 3.0), T(5, 2.0), T(5, 3.0), T(7, 2.6), T(9, 1.6), T(9, 2.6), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, TOPICS, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    HOOK_FLAG, HOOK_NAMES, LEVELS, LEVEL_PICK, CONTS, CONT_PICK, Q3, Q4, REVIEW, ROWS, NAMES: [], DATE: '', SIGNER: '',
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

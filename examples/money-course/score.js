// UGABUGA "3 ב־30 ₪, משתלם?" (9:16 Reel). The free money course for kids and teens
// (/courses/money, src/courses/data/money.js). The hook question comes from the course's smart-shopping quiz;
// its answer is never shown or stated anywhere in the reel (the smart-shopping lesson only appears in the lesson list).
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
    pick: T(3, 2), // tap on lesson 2 in the list
    topic: T(5, 0.5), // tap: the 24-hour rule
    mode: T(7, 2), // tap: the jars fill
    go: T(8, 1), ans: T(9, 0), // tap "how many weeks", then the answer
    printBtn: T(11, 0), // the warning badges land on the scam cards
    logo: T(12, 0),
  };
  const hookOpts = ['כן', 'לא', 'אותו דבר'].map((s, i) => ({ s, i, t: T(1, 0.2 + i * 0.7), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: '7 שיעורים קצרים', sub: 'להורה ולילד, כל שיעור נגמר בחידון', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'צורך או רצון?', sub: 'שיעור 2: מה חייבים ומה כיף שיהיה', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'שלוש קופות', sub: 'שיעור 3: לבזבז, לחסוך, לתת', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'חוסכים למטרה', sub: 'שיעור 4: כמה שבועות עד שקונים', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'כסף ברשת בבטחה', sub: 'שיעור 7: הונאות ורכישות במשחקים', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the 7 lessons (titles from money.js)
  const AUD = [['🪙', 'מה זה כסף ומאיפה הוא בא'], ['⚖️', 'צורך או רצון'], ['🫙', 'דמי כיס ותקציב'], ['🎯', 'חוסכים למטרה'], ['🛒', 'קנייה חכמה'], ['🏦', 'הבנק והריבית'], ['🔐', 'כסף ברשת בבטחה, ופרויקט סיום']]
    .map(([emoji, label], i) => ({ emoji, label, i, t: T(2, 0.3 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i]) }));
  const AUD_PICK = 1;

  // 2. needs and wants (examples from lesson 2 of money.js)
  const TOPICS = [['🍽️', 'ארוחת צהריים', 'need'], ['🎮', 'עוד משחק', 'want'], ['📚', 'ספרים לבית הספר', 'need'], ['👟', 'נעליים של מותג', 'want'], ['💧', 'מים', 'need'], ['🍬', 'ממתק', 'want']]
    .map(([emoji, label, kind], i) => ({ emoji, label, kind, i, t: T(4, 0.2 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6'][i]) }));
  const TOPIC_PICK = 0;

  // 3. the three jars of 40 NIS a week: 50% / 40% / 10% = 20 / 16 / 4
  const MODES = [0, 1, 2, 3].map((i) => ({ i, t: T(6, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const JARS = [['🛍️', 'לבזבז', 20, 50, '#e08a00'], ['🐷', 'לחסוך', 16, 40, '#226bd7'], ['💝', 'לתת', 4, 10, '#cf2f56']];
  const Q = { caption: '' };

  // 4. saving for headphones: 360 NIS, 60 already saved, 25 a week = 12 weeks
  const GOAL = { price: 360, saved: 60, week: 25, weeks: 12 };

  // 5. four online scams (keys of the last lesson of money.js)
  const SCAMS = [['🎁', '״זכית בפרס!״', 'אף אחד לא מחלק אייפון בחינם'], ['💎', 'יהלומים בחינם', 'אתר שמבקש סיסמה גונב את החשבון'], ['📩', 'הודעה ״מהבנק״ או ״מהדואר״', 'עם קישור ודחיפות. לא לוחצים'], ['👦', 'חבר מבקש כסף בהודעה', 'אולי החשבון שלו נפרץ. מתקשרים']];
  const NIGHTS = [];
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.4 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 3) }];

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 1.5) }, { t: T(13, 3) }];

  // every pill/chip pop in the film that gets a pop + marimba in song.js
  const pills = [T(3, 0.4), T(3, 3), T(5, 2.2), T(5, 3.2), T(7, 0.2), T(7, 3), T(8, 0.3), T(8, 0.6), T(9, 1.4), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

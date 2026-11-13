// UGABUGA "כמה ימים יש בכסלו?" (9:16 Reel). First-grade prep (/classroom/first-grade, src/pages/ClassOnePrep.jsx).
// The hook asks how many days Kislev has; the answer is never shown (the months step shows only names, never day counts).
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
    pick: T(3, 2), // tap on the dreidel row
    topic: T(5, 0.5), // tap: a colour dot
    mode: T(7, 2), // tap: a month chip (ניסן)
    go: T(8, 0.8), ans: T(9, 0.5), // tap the answer, then green feedback
    printBtn: T(11, 0), // tap: open the booklet
    logo: T(12, 0),
  };
  // hook: three number choices, none marked
  const hookOpts = ['14', '15', '16'].map((s, i) => ({ s, i, t: T(0, 2.6 + i * 0.45), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים פעילות', sub: 'אותיות, קריאה, אנגלית וחשבון', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'כותבים על הקו המקווקו', sub: 'אות או מילה, בגודל ובצבע לבחירה', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'חודשי השנה', sub: '12 חודשי השנה העברית', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'חשבון עד 20', sub: 'סופרים חפצים ובוחרים תשובה', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'חוברת הכנה להדפסה', sub: '15 עמודים להדפסה או כ־PDF', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the six modules of the page (MODULES in ClassOnePrep.jsx), four shown
  const AUD = [['✏️', 'אותיות וכתיבה'], ['📖', 'קריאה ראשונה'], ['🔤', 'אנגלית ראשונה'], ['🔢', 'משחקי חשבון']]
    .map(([emoji, label], i) => ({ emoji, label, i, t: T(2, 0.3 + i * 0.6), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const AUD_PICK = 0;

  // 2. trace sheet: the word, size select, colour dots
  const TOPICS = [0, 1, 2].map((i) => ({ i, t: T(4, 0.2 + i * 0.7), midi: m(['D5', 'F#5', 'A5'][i]) }));
  const TOPIC_PICK = 1;

  // 3. months chips (names only, never day counts)
  const MONTHS = [['תשרי', '🍎'], ['חשוון', '🍂'], ['כסלו', '🕎'], ['טבת', '🧣'], ['שבט', '🌳'], ['אדר', '🎭'], ['ניסן', '🌸'], ['אייר', '🌼'], ['סיוון', '📚'], ['תמוז', '☀️'], ['אב', '🍉'], ['אלול', '🎒']];
  const MODES = MONTHS.map((_, i) => ({ i, t: T(6, 0.2 + i * 0.2), midi: m(['D5', 'F#5', 'A5', 'D6', 'B5', 'E6', 'F#6'][i % 7]) }));
  const MODE_PICK = 6; // ניסן
  const SETTINGS = [], SLICERS = [], JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];

  // 4. math: levels + equation 3 + 4 (easy level) with four answers
  const LEVELS = ['קל · עד ⁦10⁩', 'בינוני · ⁦11–15⁩', 'קשה · ⁦16–20⁩'];
  const FACTS = [['🧮', 'ספירה', 'סופרים את החפצים'], ['🔊', 'שמע', 'שומעים את התרגיל'], ['✅', 'בדיקה', 'תשובה נכונה מסומנת מיד']];
  const ROWS = FACTS.map((_, i) => ({ i, t: T(8, 1.3 + i * 0.5), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. two pills after the booklet
  const sheetItems = [{ i: 0, t: T(10, 0.5), midi: m('D5') }, { i: 1, t: T(10, 2), midi: m('F#5') }];
  const extras = [{ t: T(11, 0.6) }, { t: T(11, 1.4) }];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  // every pill/chip pop in the film that gets a pop + marimba in song.js
  const pills = [T(3, 0.5), T(3, 1.5), T(5, 0.5), T(5, 1.5), T(7, 0.5), T(10, 3), extras[0].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, MODE_PICK, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    SETTINGS, SLICERS, FACTS, ROWS, MONTHS, LEVELS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

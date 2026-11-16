// UGABUGA "כמה משבצות מתאימות לכם?" (9:16 Reel). The bingo card maker (/tools/bingo-maker, src/pages/tools/BingoMaker.jsx).
// The hook is a 3x3 intro card (real squares of the "היכרות" pack); the viewer counts how many fit them. The answer is personal and never shown.
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
    pick: T(3, 0.4), // step 1: tap the birthday pack
    topic: T(4, 2.4), // step 2: tap the 4x4 size
    mode: T(6, 2.4), // step 3: tap "create 6 cards"
    go: T(8, 0.8), ans: T(9, 0.5), // step 4: tap print, then "cards ready"
    printBtn: T(11, 0), // step 5: the bingo moment
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2].map((i) => ({ i, t: T(0, 3 + i * 0.45), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // ---- real data of the page (src/pages/tools/BingoMaker.jsx) ----
  const PACKS = ['🤝 היכרות', '🎂 יום הולדת', '🏫 כיתה', '🐾 חיות', '⚽ ספורט', '🎉 חגים', '💼 עבודה', '✏️ מותאם אישית'];
  const HOOK_GRID = ['מישהו שאוהב פיצה', 'מישהו שנולד בקיץ', 'מישהו שיודע לשרוק', 'מישהו שאוהב ים', 'מישהו שיודע לצייר', 'מישהו שאוהב כלבים', 'מישהו שאוהב גשם', 'מישהו שיודע לרקוד', 'מישהו שאוהב לקרוא'];
  const BDAY = ['בלון אדום', 'נר יום הולדת', 'עוגת שוקולד', 'שיר יום הולדת', 'מתנה עטופה', 'שקית הפתעה', 'כובע מסיבה', 'מישהו שרוקד', 'מישהו שמצלם', 'ברכה מצחיקה', 'ילד יום ההולדת', 'מישהו שאוהב גלידה', 'צלחת עם חטיפים', 'כוס מיץ', 'מדבקה', 'קונפטי', 'משחק קבוצתי', 'כיסא מקושט', 'חיוך גדול', 'עוגה עם סוכריות', 'שולחן מתנות', 'מוזיקה ברקע', 'מישהו שמוחא כפיים', 'מישהו עם חולצה כחולה'];
  const rot = (a, k) => a.slice(k).concat(a.slice(0, k));
  const CARDS = [BDAY.slice(0, 16), [3, 9, 14, 1, 12, 7, 0, 15, 5, 10, 2, 13, 8, 4, 11, 6].map((i) => BDAY[i]), [10, 4, 13, 7, 1, 15, 8, 2, 11, 0, 14, 5, 9, 3, 12, 6].map((i) => BDAY[i + 8 > 23 ? i : i + 8])];

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים נושא', sub: 'שבע חבילות מוכנות, או רשימה משלכם', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'בוחרים גודל', sub: 'שלושה גדלים: ⁦3×3⁩, ⁦4×4⁩ או ⁦5×5⁩', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'יוצרים כרטיסים', sub: 'כל כרטיס עם משבצות בסדר אחר', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מדפיסים', sub: 'כרטיס אחד בכל דף', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'משחקים', sub: 'מסמנים משבצות עד שורה מלאה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. eight chips: seven packs + custom
  const AUD = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ i, t: T(2, 0.3 + i * 0.45), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'B5', 'A5', 'F#5'][i]) }));
  const AUD_PICK = 1;
  // 2. three size buttons, then the four rows of the 4x4 card
  const TOPICS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ i, t: i < 3 ? T(4, 0.2 + i * 0.5) : T(4, 3.0 + (i - 3) * 0.45), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i]) }));
  const TOPIC_PICK = 1;
  // 3. the create button, three fanned cards, a pill
  const MODES = [T(6, 0.3), T(7, 0.0), T(7, 0.8), T(7, 1.6), T(7, 2.8)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];
  // 4. print button, three sheets
  const ROWS = [0, 1, 2].map((i) => ({ i, t: T(8, 1.3 + i * 0.55), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. three marks, the strike line
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.4 + i * 0.45), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 2.3) }];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  const pills = [T(3, 1.6), T(3, 2.8), T(5, 2.0), T(5, 3.0), T(9, 1.2), T(9, 2), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    PACKS, HOOK_GRID, CARDS, ROWS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

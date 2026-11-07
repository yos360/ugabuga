// UGABUGA "כמה ברכות מברכים בערב השני של חנוכה?" (9:16 Reel). Hanukkah candle-lighting card
// (/holidays/hanukkah/candle-lighting, src/pages/holidays/HanukkahCandleLighting.jsx + src/data/hanukkahLighting.js).
// The hook answer (blessings per night) is never shown or stated anywhere in the reel.
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
    pick: T(3, 2), // (unused tap slot, kept for the song)
    topic: T(5, 1), // the wording is picked
    mode: T(7, 2), // the photo is chosen
    go: T(8, 1), ans: T(9, 0), // the scissors line, then the second card
    printBtn: T(11, 0), // a night is ticked
    logo: T(12, 0),
  };
  const hookOpts = ['1', '2', '3'].map((s, i) => ({ s, i, t: T(1, 0.2 + i * 0.7), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'כרטיס להדפסה', sub: 'סדר ההדלקה ליד החנוכייה', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'הנוסח של המשפחה', sub: 'הברכה מתעדכנת לפי הבחירה', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'תמונה ושם', sub: 'של הילדים, של הגן או של הכיתה', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'שני כרטיסים בדף', sub: 'לגזור ולחלק לכל הילדים', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'לוח שמונת הערבים', sub: 'מסמנים ✓ בכל ערב שהדלקתם', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. card rows (labels from the page: the blessings, "הנרות הללו", "מעוז צור")
  const AUD = [['🕯️', 'הברכות'], ['👉', 'הנרות הללו'], ['🪨', 'מעוז צור']]
    .map(([emoji, label], i) => ({ emoji, label, i, t: T(2, 0.5 + i * 0.6), midi: m(['D5', 'F#5', 'A5'][i]) }));
  const AUD_PICK = 0;

  // 2. wording choice (NUSACH in hanukkahLighting.js): ner = ner Hanukkah (עדות המזרח), shel = ner shel Hanukkah (אשכנז)
  const TOPICS = [['נר חנוכה', 'עדות המזרח'], ['נר של חנוכה', 'אשכנז']]
    .map(([label, hint], i) => ({ label, hint, i, t: T(4, 0.4 + i * 0.7), midi: m(['D5', 'F#5'][i]) }));
  const TOPIC_PICK = 1;
  const MODES = [0, 1, 2, 3].map((i) => ({ i, t: T(6, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));

  // 3. the family name placeholder on the page is "למשל: משפחת לוי"
  const Q = { caption: 'משפחת לוי' };

  // 5. eight nights (TOUR_NIGHTS): the first two rows, 4 rows pop two nights each
  const NIGHTS = [['4.12', 'שישי'], ['5.12', 'מוצאי שבת'], ['6.12', 'ראשון'], ['7.12', 'שני'], ['8.12', 'שלישי'], ['9.12', 'רביעי'], ['10.12', 'חמישי'], ['11.12', 'שישי']];
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.4 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 3) }];

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 1.5) }, { t: T(13, 3) }];

  // every pill/chip pop in the film that gets a pop + marimba in song.js
  const pills = [T(3, 0.2), T(3, 3), T(5, 1.8), T(5, 2.6), T(7, 0.2), T(7, 3), T(9, 0.7), T(9, 2), T(10, 3), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, Q, NIGHTS, sheetItems, extras, endLines, pills,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

// UGABUGA "נ ג ה ... מה?" (9:16 Reel). 3D printing for Hanukkah (/3d-print, src/data/print3d.js, src/pages/print3d/Print3D.jsx).
// The hook asks for the 4th letter of the dreidel; the answer (פ / ש) is never shown, step 2 masks it with a question mark.
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
    topic: T(5, 0.5), // tap: download button
    mode: T(7, 2), // tap: a settings chip
    go: T(8, 0.8), ans: T(9, 0.5), // tap "start print", then the time pill
    printBtn: T(11, 0), // tap the dreidel: it spins
    logo: T(12, 0),
  };
  // hook: the four faces of a dreidel, the last one is the open question
  const hookOpts = ['נ', 'ג', 'ה', '?'].map((s, i) => ({ s, i, t: T(0, 2.6 + i * 0.4), midi: m(['F#5', 'A5', 'D6', 'B5'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים דגם', sub: 'סביבון, חנוכייה לקישוט, חותכן עוגיות', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'מסובבים ומורידים', sub: 'תצוגה בתלת־ממד + קובץ STL חינמי', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'הגדרות הדפסה', sub: 'מוכנות בדף, בלי תמיכות', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'גודל וזמן הדפסה', sub: 'כתוב בדף של כל דגם', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מחברים ומסובבים', sub: 'שני חלקים שמתחברים בלחיצה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the models of the hub (/3d-print)
  const AUD = [['🎲', 'סביבון להדפסה'], ['🕎', 'חנוכייה לקישוט'], ['✡️', 'חותכן עוגיות מגן דוד'], ['🔑', 'מחזיק מפתחות עם שם']]
    .map(([emoji, label], i) => ({ emoji, label, i, t: T(2, 0.3 + i * 0.6), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const AUD_PICK = 0;

  // 2. viewer + two download buttons
  const TOPICS = [0, 1, 2].map((i) => ({ i, t: T(4, 0.2 + i * 0.7), midi: m(['D5', 'F#5', 'A5'][i]) }));
  const TOPIC_PICK = 1;

  // 3. print settings chips + slicer chips
  const SETTINGS = ['PLA', 'שכבה ⁦0.2⁩ מ״מ', 'מילוי ⁦20%⁩', 'בלי תמיכות'];
  const SLICERS = ['Cura', 'PrusaSlicer', 'Bambu Studio'];
  const MODES = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ i, t: T(6, 0.3 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'D6', 'B5', 'E6', 'F#6'][i]) }));
  const MODE_PICK = 3;
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];

  // 4. size / time / safety rows (from src/data/print3d.js and Print3D.jsx FAQ)
  const FACTS = [
    ['📏', 'גודל', 'קובייה של ⁦2.8⁩ ס״מ, גובה כ־⁦6⁩ ס״מ'],
    ['⏱️', 'זמן הדפסה', 'כשעה וחצי (תלוי במדפסת)'],
    ['👷', 'עבודה של מבוגר', 'הפייה של המדפסת חמה מאוד'],
  ];
  const ROWS = FACTS.map((_, i) => ({ i, t: T(8, 1.3 + i * 0.5), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. two pills after the spinning dreidel
  const sheetItems = [{ i: 0, t: T(10, 0.5), midi: m('D5') }, { i: 1, t: T(10, 2), midi: m('F#5') }];
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
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, MODE_PICK, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    SETTINGS, SLICERS, FACTS, ROWS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

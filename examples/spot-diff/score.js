// UGABUGA "מה השתנה בתמונה התחתונה?" (9:16 Reel). The online game "מצאו את ההבדלים"
// (/online-games/find-differences, src/arcade/games/SpotDiff.jsx + src/arcade/logic/spotDiff.js + registry.js).
// Hook = real level 1 (3 differences, never circled in the reel); the steps use real level 4 (4 differences).
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
    pick: T(3, 2), // tap: the first level opens
    topic: T(5, 1), // tap: a difference is found -> red circle in both pictures
    mode: T(7, 2), // (no tap in step 3; no sound is tied to this slot)
    go: T(8, 1), ans: T(9, 0), // tap the bulb, then the orange hint circle
    printBtn: T(11, 0), // tap "next level"
    logo: T(12, 0),
  };
  // hook: the two pictures and the "3 differences" badge pop in
  const hookOpts = [0, 1, 2].map((i) => ({ s: String(i), i, t: T(1, [0.2, 0.9, 1.6][i]), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: '18 שלבים', sub: 'מ־⁦3–7⁩ הבדלים, כל שלב פותח את הבא', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'לוחצים על מה שהשתנה', sub: 'באחת התמונות, לא משנה באיזו', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'ארבעה סוגי הבדלים', sub: 'חסר, אחר, גדול או קטן, ונוסף', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'נתקעתם? יש רמז', sub: 'אחרי ⁦10⁩ שניות 💡 מסמן איפה', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'כוכבים לכל שלב', sub: 'מהר, בלי רמזים ובלי הרבה טעויות', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. level grid: three rows of six (6 pop per row-beat group); level 1 is open, the rest are locked as in a fresh game
  const AUD = [0, 1, 2].map((i) => ({ i, t: T(2, 0.5 + i * 0.6), midi: m(['D5', 'F#5', 'A5'][i]) }));
  const AUD_PICK = 0;

  // 2. the two pictures pop in, then a tap finds a difference
  const TOPICS = [0, 1].map((i) => ({ i, t: T(4, 0.4 + i * 0.7), midi: m(['D5', 'F#5'][i]) }));
  const TOPIC_PICK = 0;
  // 3. four kinds (KIND_HE in spotDiff.js)
  const MODES = [0, 1, 2, 3].map((i) => ({ i, t: T(6, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const Q = { caption: '' };
  const NIGHTS = [];
  // 5. result card + three stars
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

  const LEVELS = {"1":{"theme":"animals","W":100,"H":70,"base":[{"e":"🐰","x":29.95,"y":33.08,"s":12.85,"r":-9},{"e":"🐔","x":51.75,"y":34.18,"s":12.25,"r":-10},{"e":"🐘","x":68.67,"y":12.21,"s":14.06,"r":-2},{"e":"🦒","x":31.01,"y":10.69,"s":13.26,"r":0},{"e":"🐻","x":70.1,"y":36.84,"s":11.16,"r":4},{"e":"🐷","x":90.45,"y":9.52,"s":11.73,"r":3},{"e":"🐸","x":11.65,"y":60.16,"s":12.56,"r":-2},{"e":"🐱","x":52.77,"y":56.06,"s":10.84,"r":1},{"e":"🦋","x":9.69,"y":33.18,"s":13.52,"r":0},{"e":"🐶","x":50.83,"y":9.7,"s":12.21,"r":3}],"changed":[{"e":"🐰","x":29.95,"y":33.08,"s":7.07,"r":-9},{"e":"🐔","x":51.75,"y":34.18,"s":12.25,"r":-10},{"e":"🐘","x":68.67,"y":12.21,"s":14.06,"r":-2},{"e":"🐻","x":70.1,"y":36.84,"s":11.16,"r":4},{"e":"🐷","x":90.45,"y":9.52,"s":18.19,"r":3},{"e":"🐸","x":11.65,"y":60.16,"s":12.56,"r":-2},{"e":"🐱","x":52.77,"y":56.06,"s":10.84,"r":1},{"e":"🦋","x":9.69,"y":33.18,"s":13.52,"r":0},{"e":"🐶","x":50.83,"y":9.7,"s":12.21,"r":3}],"diffs":[{"x":31.01,"y":10.69,"r":10.54,"kind":"remove"},{"x":29.95,"y":33.08,"r":10.54,"kind":"resize"},{"x":90.45,"y":9.52,"r":10.54,"kind":"resize"}]},"4":{"theme":"sea","W":100,"H":70,"base":[{"e":"🐡","x":49.03,"y":9.72,"s":12.92,"r":-3},{"e":"🦈","x":91.4,"y":57.72,"s":13.64,"r":-9},{"e":"🪸","x":69.65,"y":36.51,"s":13.44,"r":-5},{"e":"⚓","x":27.29,"y":55.8,"s":12.83,"r":-11},{"e":"🐢","x":30.26,"y":13.13,"s":13.59,"r":-5},{"e":"🐳","x":48.01,"y":33.15,"s":13.19,"r":11},{"e":"🐬","x":11.38,"y":9.18,"s":13.97,"r":-4},{"e":"🌊","x":88.78,"y":35.7,"s":11.63,"r":2},{"e":"🐠","x":68.89,"y":59.83,"s":14.21,"r":10},{"e":"🦀","x":68.54,"y":11.84,"s":13.9,"r":7},{"e":"🦑","x":12.15,"y":58.64,"s":12.11,"r":-6},{"e":"🐙","x":28.3,"y":36.62,"s":13.62,"r":2},{"e":"🐚","x":49.71,"y":58.97,"s":11.45,"r":1}],"changed":[{"e":"🐡","x":49.03,"y":9.72,"s":12.92,"r":-3},{"e":"🦈","x":91.4,"y":57.72,"s":13.64,"r":-9},{"e":"🪸","x":69.65,"y":36.51,"s":7.39,"r":-5},{"e":"⚓","x":27.29,"y":55.8,"s":12.83,"r":-11},{"e":"🐢","x":30.26,"y":13.13,"s":13.59,"r":-5},{"e":"🐳","x":48.01,"y":33.15,"s":13.19,"r":11},{"e":"🐬","x":11.38,"y":9.18,"s":13.97,"r":-4},{"e":"🐠","x":68.89,"y":59.83,"s":7.82,"r":10},{"e":"🦀","x":68.54,"y":11.84,"s":13.9,"r":7},{"e":"🦑","x":12.15,"y":58.64,"s":12.11,"r":-6},{"e":"🐡","x":28.3,"y":36.62,"s":13.62,"r":2},{"e":"🐚","x":49.71,"y":58.97,"s":11.45,"r":1}],"diffs":[{"x":68.89,"y":59.83,"r":10.54,"kind":"resize"},{"x":88.78,"y":35.7,"r":10.54,"kind":"remove"},{"x":69.65,"y":36.51,"r":10.54,"kind":"resize"},{"x":28.3,"y":36.62,"r":10.54,"kind":"replace"}]}};
  const THEME_ICONS = ['🐾', '🎂', '🚀', '🐠', '🚗', '🌻', '🦄', '🍕', '⚽', '⛄'];

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, Q, NIGHTS, sheetItems, extras, endLines, pills,
    LEVELS, THEME_ICONS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

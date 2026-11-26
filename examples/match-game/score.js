// UGABUGA "איזה סמל מופיע בשני הקלפים?" (9:16 Reel). The Hanukkah match game (/holidays/hanukkah/match-game, src/pages/holidays/HanukkahMatchGame.jsx + src/data/hanukkahMatchGame.js).
// The hook is two real small-deck cards (2 and 5) that share exactly one symbol; the answer is never shown in the reel.
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
    pick: T(2, 3.3), // step 1: tap the small deck
    topic: T(4, 3.2), // step 2: tap "words only"
    reasonCard: T(5, 0.2), // step 2: reading-practice card
    mode: T(6, 3.0), // step 3: tap the shared coin
    go: T(8, 0.8), ans: T(9, 0.5), // step 4: tap print, then "pages ready"
    printBtn: T(11, 2.6), // step 5: the closing pill
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2].map((i) => ({ i, t: T(0, 1.4 + i * 0.4), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // ---- real data of the page (src/data/hanukkahMatchGame.js: SYMBOLS, DECKS, MODES, GAMES, TEACH) ----
  const HOOK_Q = 'איזה סמל מופיע בשני הקלפים?'; // answer (the donut) never shown
  // small deck cards 2 and 5 (buildDeck(3)); id 'sevivon' is drawn in SVG on the site
  const HOOK_CARDS = [
    [['olive', '🫒'], ['sufganiya', '🍩'], ['oil', '🪔'], ['flame', '🔥']],
    [['latke', '🥞'], ['candle', '🕯️'], ['star', '⭐'], ['sufganiya', '🍩']],
  ];
  const DECKS = [['🧸', 'חפיסה קטנה לגן', '⁦13⁩ קלפים · ⁦4⁩ תמונות בכל קלף', 'גיל ⁦3–6⁩'], ['🎴', 'חפיסה גדולה', '⁦31⁩ קלפים · ⁦6⁩ תמונות בכל קלף', 'גיל ⁦6⁩ ומעלה']];
  const MODES_L = ['🖼️ תמונות', '🔤 תמונה ומילה', '📖 מילים בלבד'];
  const TEACH_READ = 'במצב "מילים בלבד" הילדים קוראים את המילה בקול כשהם מוצאים את הזוג — תרגול קריאה שוטפת בלי שירגישו שזה תרגיל.';
  // on-screen round: small deck cards 3 and 10 share only the coin
  const PLAY_CARDS = [
    [['hanukkiah', '🕎', 'חנוכייה'], ['coin', '🪙', 'מטבע'], ['oil', '🪔', 'כד שמן'], ['latke', '🥞', 'לביבה']],
    [['candle', '🕯️', 'נר'], ['olive', '🫒', 'זית'], ['coin', '🪙', 'מטבע'], ['crown', '👑', 'כתר']],
  ];
  const PLAY_COMMON = 'coin';
  const GAMES = [['🗼', 'המגדל'], ['🕳️', 'מרוקנים את הערימה'], ['🔥', 'הקלף החם'], ['🤝', 'כולם ביחד (לקטנים)']];

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים חפיסה', sub: 'קטנה לגן או גדולה לכיתה ולמשפחה', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'מה מופיע על הקלפים', sub: 'תמונות, תמונה ומילה או מילים', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'משחקים על המסך', sub: 'לוחצים על התמונה המשותפת', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מדפיסים וגוזרים', sub: 'שישה קלפים עגולים בעמוד', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'ארבע דרכים לשחק', sub: 'ועוד טיפ לגננת ולמורה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. two deck chips, two description cards, the rule card
  const AUD = [T(2, 0.3), T(2, 0.9), T(2, 1.5), T(2, 2.1), T(3, 0.5)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  // 2. three mode rows + the word sample
  const TOPICS = [T(4, 0.3), T(4, 1.0), T(4, 1.7), T(4, 2.4)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  // 3. prompt card, two round cards, the counter
  const MODES = [T(6, 0.2), T(6, 0.9), T(6, 1.4), T(6, 1.9)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const explainT = T(7, 0.2);
  // 4. two A4 pages + the chips
  const ROWS = [0, 1, 2].map((i) => ({ i, t: T(8, 1.3 + i * 0.55), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. four game rows, the 13-symbol strip, the teacher card
  const sheetItems = [T(10, 0.3), T(10, 1.2), T(10, 2.1), T(10, 3.0), T(11, 0.2), T(11, 1.4), T(11, 1.9)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i]) }));
  const dotsT = (k) => T(11, 0.35 + k * 0.12);
  const extras = [];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  // extra pills: [0,1] step 1 · [2,3] step 2 · [4,5] step 3 · [6,7] step 4 · [8] step 5
  const pills = [T(3, 1.6), T(3, 2.8), T(5, 2.0), T(5, 3.0), T(7, 1.5), T(7, 2.6), T(9, 1.2), T(9, 2.0), ev.printBtn];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, TOPICS, MODES, explainT, sheetItems, dotsT, extras, endLines, pills, ROWS,
    HOOK_Q, HOOK_CARDS, DECKS, MODES_L, TEACH_READ, PLAY_CARDS, PLAY_COMMON, GAMES,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

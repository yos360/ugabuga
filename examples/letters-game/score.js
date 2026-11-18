// UGABUGA "איזו מהן האות ד׳?" (9:16 Reel). The Hebrew letters game (/letters/game, src/components/letters/LettersGame.jsx).
// The hook shows six confusable letters; the viewer picks the dalet in their head. The answer is never shown.
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
    pick: T(3, 0.4), // step 1: tap the game "באיזו אות זה מתחיל?"
    topic: T(4, 2.8), // step 2: tap "א–כ"
    reasonCard: T(5, 0.2), // step 2: the letters of the chosen half appear
    mode: T(6, 1.0), // step 3: tap the speaker
    go: T(8, 2.0), ans: T(9, 0.6), // step 4: wrong tap, then the right one
    printBtn: T(11, 0), // step 5: new-game button
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2, 3, 4, 5].map((i) => ({ i, t: T(0, 0.6 + i * 0.25), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'F#6'][i]) }));

  // ---- real data of the page (src/pages/letters/LettersGamePage.jsx, src/components/letters/LettersGame.jsx) ----
  const HOOK_LETTERS = ['ח', 'ר', 'ה', 'ת', 'ד', 'ק']; // the target (never revealed) is one of them
  const HALF = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ']; // "א–כ" = HEBREW.slice(0, 11)
  const REASONS = ['🔎 מצאו את האות', '🖼️ באיזו אות זה מתחיל?', '🗣️ איך קוראים לאות?'];
  const SETS = ['כל האותיות', 'א–כ', 'ל–ת'];
  const REASON_TEXT = '', NAMES = [], DATE = '', SIGNER = '';

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים משחק', sub: 'שלושה משחקים קצרים · 10 שאלות', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'בוחרים אותיות', sub: 'כולן, או רק חצי מהן', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'שומעים את המילה', sub: 'לוחצים על הרמקול', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'עונים', sub: 'טעיתם? נסו שוב 🙂', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'כוכבים בסוף', sub: 'וקופצים למשחק חדש', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. three game chips, a short description card
  const AUD = [0, 1, 2, 3].map((i) => ({ i, t: [T(2, 0.3), T(2, 0.8), T(2, 1.3), T(3, 0.9)][i], midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const AUD_PICK = 1;
  // 2. three set chips, then the 11 letters
  const TOPICS = [0, 1, 2].map((i) => ({ i, t: T(4, 0.3 + i * 0.5), midi: m(['D5', 'F#5', 'A5'][i]) }));
  const TOPIC_PICK = 1;
  // 3. question card, emoji, speaker, hint pills
  const MODES = [T(6, 0.3), T(6, 0.8), T(7, 1.6), T(7, 2.2), T(7, 2.9)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];
  // 4. question + emoji, four answers, progress
  const ROWS = [0, 1, 2].map((i) => ({ i, t: [T(8, 0.1), T(8, 0.9), T(8, 1.5)][i], midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. result card, three stars
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.4 + i * 0.55), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 2.3) }];

  const endLines = [{ t: T(12, 0.6) }, { t: T(12, 1.0) }, { t: T(12, 1.4) }, { t: T(12, 1.8) }, { t: T(12, 2.3) }];

  const pills = [T(3, 1.6), T(3, 2.8), T(5, 2.0), T(5, 3.0), T(9, 1.8), T(9, 2.6), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    REASONS, HOOK_LETTERS, HALF, SETS, NAMES, REASON_TEXT, DATE, SIGNER, ROWS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

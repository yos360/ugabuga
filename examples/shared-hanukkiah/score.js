// UGABUGA "כמה נרות דולקים?" (9:16 Reel). The shared hanukkiah (/hanukkiah, src/pages/tools/group/SharedHanukkiah.jsx).
// The hook asks about night 6 of the real rule (night n = n candle slots + the shamash); the answer is never shown (the demo shows night 3).
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
    pick: T(3, 2), // step 1: tap "כיתה"
    topic: T(4, 2.6), // step 2: tap the WhatsApp button
    mode: T(6, 3), // step 3: tap "הדלקת נר הערב"
    go: T(8, 0.8), ans: T(9, 0.5), // step 4: the candles are lit one by one, then the total
    printBtn: T(10, 1.6), // step 5: the night chips pop
    logo: T(12, 0),
  };
  const hookOpts = ['6', '7', '8'].map((s, i) => ({ s, i, t: T(0, 3 + i * 0.45), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // ---- real data of the page ----
  const KINDS = [['👨‍👩‍👧‍👦', 'משפחה', 'החנוכייה של משפחת כהן'], ['🏫', 'כיתה', 'החנוכייה של כיתה ג׳2'], ['🧸', 'גן', 'החנוכייה של גן חצב'], ['🤗', 'חברים', 'החנוכייה של החבר׳ה מהשכונה']];
  const DEMO = [{ name: 'נועה', wish: 'שיהיה לכולנו חג מלא אור 🕎' }, { name: 'יואב', wish: 'הרבה סופגניות ושמחה!' }, { name: 'סבתא רותי', wish: 'בריאות לכל המשפחה' }];
  const WISH = 'שיהיה לכולנו חג מלא אור';

  const steps = [
    { n: 1, sec: 'aud', title: 'פותחים חנוכייה ונותנים לה שם', sub: 'למשפחה, לכיתה, לגן או לחברים', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'שולחים קישור לקבוצה', sub: 'בוואטסאפ, בלחיצה אחת', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'בכל ערב כל אחד מדליק נר', sub: 'שם פרטי ומשאלה קטנה', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'החנוכייה נדלקת יחד', sub: 'נר אחד לכל טלפון בכל ערב', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'רואים מי הדליק', sub: 'כל נר עם השם והמשאלה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. kind row, title field, create button, two pills (the tap on "כיתה" is ev.pick)
  const AUD = [T(2, 0.3), T(2, 1.0), T(2, 1.7), T(3, 0.5), T(3, 1.3)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  // 2. the "ready" card, the WhatsApp button, the copy button, the message bubble, two pills
  const TOPICS = [T(4, 0.2), T(4, 0.7), T(4, 1.2), T(5, 0.0), T(5, 2.0), T(5, 3.0)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6'][i]) }));
  // 3. name field, wish field, the button, the toast, two pills
  const MODES = [T(6, 0.3), T(6, 1.0), T(6, 1.7), T(7, 0.0), T(7, 1.3), T(7, 2.4)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'E6'][i]) }));
  const JARS = [], Q = { caption: '' }, GOAL = {}, SCAMS = [], NIGHTS = [];
  // 4. the three candles light one after another
  const ROWS = [0, 1, 2].map((i) => ({ i, t: T(8, 1.3 + i * 0.55), midi: m(['D5', 'F#5', 'A5'][i]) }));
  // 5. heading + 3 rows, the chips
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.4 + i * 0.4), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 2.3) }];

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  // pills with a pop + marimba in song.js (MODES/AUD/TOPICS already have their own marimba)
  const pills = [T(9, 1.2), T(9, 2), extras[0].t, extras[1].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK: 1, TOPICS, TOPIC_PICK: 0, MODES, JARS, Q, GOAL, SCAMS, NIGHTS, sheetItems, extras, endLines, pills,
    KINDS, DEMO, WISH, ROWS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

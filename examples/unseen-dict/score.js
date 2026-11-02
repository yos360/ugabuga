// UGABUGA "אנסין עם מילון בלחיצה" (9:16 Reel). The real unseen section (/unseen) and the dictionary (/dictionary):
// levels and test counts (src/data/unseen/index.js), tap-a-word glossary pop-up, the lookup form, questions with a Hebrew
// explanation, exam mode / print / progress. One timeline; all facts from src/pages/unseen/*, src/pages/dictionary/*.
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
    hook: [0, T(2)], levels: [T(2), T(4)], tap: [T(4), T(6)], dict: [T(6), T(8)],
    quiz: [T(8), T(10)], more: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' }, D: { notes: ['F#3', 'A3', 'D4'], bass: 'D2' },
    Em: { notes: ['G3', 'B3', 'E4'], bass: 'E2' }, C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, B7: { notes: ['F#3', 'A3', 'D#4'], bass: 'B1' },
    Dsus: { notes: ['E3', 'A3', 'D4'], bass: 'D2' }, Gadd9: { notes: ['D3', 'G3', 'B3', 'A4'], bass: 'G1' },
  }, [
    [0, 0, 4, 'G'], [1, 0, 4, 'D'], [2, 0, 4, 'Em'], [3, 0, 4, 'C'], [4, 0, 4, 'G'], [5, 0, 4, 'D'],
    [6, 0, 4, 'Em'], [7, 0, 4, 'C'], [8, 0, 4, 'Am'], [9, 0, 2, 'B7'], [9, 2, 2, 'B7'],
    [10, 0, 4, 'C'], [11, 0, 4, 'D'], [12, 0, 4, 'G'], [13, 0, 4, 'C'], [14, 0, 4, 'Gadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), // "נוגעים" then "ומבינים"
    title: T(1, 0), free: T(1, 2.5),
    logo: T(12, 0),
  };
  const hookPills = [['🇬🇧', 'אנגלית'], ['🇮🇱', 'עברית'], ['🔊', 'הגייה']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['D5', 'G5', 'B5'][i]) }));

  const steps = [
    { n: 1, sec: 'levels', title: 'בוחרים אנסין', sub: 'באנגלית ובעברית, לפי כיתה או יחידות לימוד', color: '#226bd7' },
    { n: 2, sec: 'tap', title: 'נוגעים במילה', sub: 'ומקבלים את הפירוש שלה בעברית', color: '#cf2f56' },
    { n: 3, sec: 'dict', title: 'ומילון שלם בכיס', sub: 'כותבים מילה ושומעים איך אומרים אותה', color: '#8a4fd8' },
    { n: 4, sec: 'quiz', title: 'שאלות עם הסבר', sub: 'בודקים מיד, ורואים איפה הסתתרה התשובה', color: '#e08a00' },
    { n: 5, sec: 'more', title: 'מתכוננים לבחינה', sub: 'מבחן עם טיימר, הדפסה ומעקב', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  const LRI = '⁦', PDI = '⁩';
  const DATA = {
    levels: {
      cards: [
        { e: '🇬🇧', title: 'אנסין באנגלית', line: '158 מבחנים', chips: ['כיתות ג׳–ט׳', 'Module A · C · E · G'] },
        { e: '🇮🇱', title: 'אנסין בעברית', line: '20 מבחנים', chips: ['כיתות ז׳–ט׳', 'בגרות בלשון'] },
      ],
      pill: '✍️ כל הטקסטים נכתבו במיוחד לאתר',
    },
    tap: {
      title: 'Never Too Late',
      text: "My name is Daniel, and until last summer I could not swim. When they went to the beach, I always stayed on the sand. I told them I didn't like the water, but that was not true. I was afraid.",
      taps: [{ w: 'beach', he: 'חוף ים' }, { w: 'afraid', he: 'מפחד', gl: true }],
      note: 'מילים עם קו מקווקו: ברשימת המילים המוסברות',
      pill: '🔊 ואפשר גם לשמוע את המילה',
      pill2: 'באנסין בעברית: נוגעים ומקבלים הסבר',
    },
    dict: {
      langs: [['🇬🇧', 'אנגלית'], ['🇪🇸', 'ספרדית'], ['🇫🇷', 'צרפתית'], ['🇷🇺', 'רוסית'], ['🌍', 'ערבית']],
      dirs: ['אנגלית ← עברית', 'עברית ← אנגלית'],
      word: 'brave', mean: 'אמיץ', src: '✓ מהמילון של האתר',
      letters: 'ABCDEFG'.split(''),
      pill: 'אלפי מילים נפוצות, לפי אות',
    },
    quiz: {
      modes: ['✏️ תרגול — משוב מיידי', '⏱️ מבחן'],
      q: 'Why did Daniel always stay on the sand at the beach?',
      opts: ["He didn't like the sun.", 'He was afraid of the water.', "His friends didn't invite him.", 'He wanted to read a book.'],
      right: 1, wrong: 0,
      explain: 'בפסקה 1 דניאל מספר שאמר לחברים שהוא לא אוהב את המים, אבל האמת היא שפחד.',
      evidence: 'I was afraid.',
      pill: '📍 בטקסט מסומן: I was afraid',
    },
    more: {
      cards: [
        ['⏱️', 'מצב מבחן', 'טיימר, וציון רק בסוף, כמו ביום הבחינה.'],
        ['🖨️', 'הדפסה', 'עם דף תשובות להורים ולמורים, או בלעדיו.'],
        ['📊', 'ההתקדמות שלי', 'רואים באיזה סוג שאלות כדאי להתאמן.'],
        ['📘', 'מילים מוסברות', 'ברמת Module E: רשימת Glossary, כמו בבחינה.'],
        ['✍️', 'מטלת כתיבה', 'עם ספירת מילים בזמן שכותבים.'],
        ['🔁', 'לנסות שוב', 'אפשר לחזור על כל מבחן, בלי הרשמה.'],
      ],
      pill: '💡 מומלץ: אנסין אחד או שניים בשבוע',
    },
  };

  const NOTES = ['G4', 'B4', 'D5', 'G5', 'B5', 'D6', 'G6'];
  const mk = (sec, n, start = 1, gap = 0.75) => Array.from({ length: n }, (_, i) => ({ i, t: S[sec][0] + (start + i * gap) * BEAT, midi: m(NOTES[i % NOTES.length]) }));
  const levelCards = [
    ...mk('levels', 2, 1, 1.4),
  ];
  const levelFacts = { t: S.levels[0] + 5.4 * BEAT, midi: m('B5') };
  const levelChips = Array.from({ length: 4 }, (_, i) => ({ i, t: S.levels[0] + (4.2 + i * 0.5) * BEAT, midi: m(NOTES[i + 1]) }));
  // tap section: passage, tap #1 (beach), tap #2 (afraid), notes
  const tapEv = { text: S.tap[0] + 0.8 * BEAT, pill2: S.tap[0] + 7.1 * BEAT, tap1: S.tap[0] + 3.0 * BEAT, tap2: S.tap[0] + 5.0 * BEAT, midi1: m('D6'), midi2: m('G6') };
  // dictionary section
  const dictEv = {
    langs: S.dict[0] + 1.0 * BEAT, dirs: S.dict[0] + 1.8 * BEAT, form: S.dict[0] + 2.4 * BEAT,
    type0: S.dict[0] + 3.0 * BEAT, typeGap: 0.25 * BEAT, press: S.dict[0] + 4.7 * BEAT, result: S.dict[0] + 5.1 * BEAT,
  };
  const dictLetters = Array.from({ length: 7 }, (_, i) => ({ i, t: S.dict[0] + (5.6 + i * 0.15) * BEAT, midi: m(NOTES[i % 7]) }));
  const typeKeys = Array.from({ length: 5 }, (_, i) => ({ i, t: dictEv.type0 + i * dictEv.typeGap, midi: m(NOTES[i + 1]) }));
  const quizEv = {
    modes: S.quiz[0] + 0.8 * BEAT, q: S.quiz[0] + 1.4 * BEAT, opts: [0, 1, 2, 3].map((i) => S.quiz[0] + (2.2 + i * 0.35) * BEAT),
    pick: S.quiz[0] + 4.4 * BEAT, explain: S.quiz[0] + 5.2 * BEAT,
  };
  const moreCards = mk('more', 6, 1, 0.7);
  const endPills = {
    levels: { t: T(3, 2.5), midi: m('D6') },
    tap: { t: T(5, 2.2), midi: m('D6') },
    dict: { t: T(7, 1.7), midi: m('D6') },
    quiz: { t: T(9, 2.2), midi: m('D6') },
    more: { t: T(11, 1.5), midi: m('D6') },
  };
  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, levels: { t: T(2), sync: 'av' }, tap: { t: T(4), sync: 'av' },
    dict: { t: T(6), sync: 'av' }, quiz: { t: T(8), sync: 'av' }, more: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, DATA, levelCards, levelChips, levelFacts, tapEv, dictEv, dictLetters, typeKeys, quizEv, moreCards, endPills, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

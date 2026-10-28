// UGABUGA "כרטיסיות רגשות" (9:16 Reel). The real /printables/emotion-cards page: 24 feelings, six cards per A4,
// a conversation question on every card, boy / girl / both forms, nikud or not, colour or black-and-white,
// and the one-page wall board. One timeline, every hit tied to an event.
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
    hook: [0, T(2)], grid: [T(2), T(4)], ask: [T(4), T(6)], gender: [T(6), T(8)],
    look: [T(8), T(10)], board: [T(10), T(12)], end: [T(12), DURATION],
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
    q1: T(0, 0), q2: T(0, 2), // "איך אני מרגיש/ה היום?"
    title: T(1, 0), free: T(1, 2.5),
    pill: T(3, 0.5), more: T(3, 2), // grid: "6 בדף" and "ועוד 18"
    nopanic: T(5, 3),
    boardAll: T(10, 0.25), boardDone: T(11, 3),
    logo: T(12, 0),
  };
  const hookPills = [['😄', 'שמח'], ['😢', 'עצוב'], ['😠', 'כועס']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'grid', title: '24 רגשות להדפסה', sub: 'אימוג׳י ושם על כל כרטיס, 6 כרטיסיות בדף', color: '#226bd7' },
    { n: 2, sec: 'ask', title: 'שאלה לשיחה על כל כרטיס', sub: 'שולפים כרטיס ומדברים על זה', color: '#cf2f56' },
    { n: 3, sec: 'gender', title: 'בנים, בנות או שניהם', sub: 'כל כרטיס בלשון שמתאימה לילד או לילדה', color: '#8a4fd8' },
    { n: 4, sec: 'look', title: 'ניקוד וצבע', sub: 'עם ניקוד או בלי, צבעוני או שחור־לבן', color: '#e08a00' },
    { n: 5, sec: 'board', title: 'לוח רגשות לקיר', sub: 'כל 24 הרגשות בדף אחד, לפינת הרגשות', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // site data (src/data/emotionCards.js): id, emoji, boy, girl, boy+nikud, girl+nikud, question
  const E = (emoji, mm, f, mn, fn, q) => ({ emoji, m: mm, f, mn, fn, q });
  const EM = {
    happy: E('😄', 'שמח', 'שמחה', 'שָׂמֵחַ', 'שְׂמֵחָה', 'מה עשה לך שמח היום?'),
    sad: E('😢', 'עצוב', 'עצובה', 'עָצוּב', 'עֲצוּבָה', 'מה עוזר כשעצוב לנו?'),
    angry: E('😠', 'כועס', 'כועסת', 'כּוֹעֵס', 'כּוֹעֶסֶת', 'מה עוזר להירגע כשכועסים?'),
    scared: E('😨', 'מפחד', 'מפחדת', 'מְפַחֵד', 'מְפַחֶדֶת', 'ממה פעם פחדת?'),
    surprised: E('😮', 'מופתע', 'מופתעת', 'מֻפְתָּע', 'מֻפְתַּעַת', 'מה הפתיע אותך לאחרונה?'),
    tired: E('😴', 'עייף', 'עייפה', 'עָיֵף', 'עֲיֵפָה', 'מה עוזר לנו לנוח?'),
    proud: E('🏅', 'גאה', 'גאה', 'גֵּאֶה', 'גֵּאָה', 'במה הצלחת לאחרונה?'),
    worried: E('😟', 'דואג', 'דואגת', 'דּוֹאֵג', 'דּוֹאֶגֶת', 'עם מי מדברים כשדואגים?'),
    excited: E('🤩', 'מתרגש', 'מתרגשת', 'מִתְרַגֵּשׁ', 'מִתְרַגֶּשֶׁת', 'למה מחכים בקוצר רוח?'),
    ashamed: E('😳', 'מתבייש', 'מתביישת', 'מִתְבַּיֵּשׁ', 'מִתְבַּיֶּשֶׁת', 'מה עוזר כשמתביישים?'),
  };
  // all 24, in the site's order (boy forms for the wall board)
  const BOARD = [['😄', 'שמח'], ['😢', 'עצוב'], ['😠', 'כועס'], ['😨', 'מפחד'], ['😮', 'מופתע'], ['😴', 'עייף'], ['😌', 'רגוע'], ['🤩', 'מתרגש'], ['🏅', 'גאה'], ['😳', 'מתבייש'], ['😕', 'מבולבל'], ['🥱', 'משועמם'], ['😒', 'מקנא'], ['😞', 'מאוכזב'], ['😟', 'דואג'], ['🥰', 'אוהב'], ['😔', 'בודד'], ['😣', 'נעלב'], ['🧐', 'סקרן'], ['😤', 'מתוסכל'], ['🙏', 'אסיר תודה'], ['💪', 'אמיץ'], ['😁', 'מאושר'], ['🤗', 'בטוח']];

  // 1. a sheet of six cards (the first six, both forms), a card per half beat
  const GRID = ['happy', 'sad', 'angry', 'scared', 'surprised', 'tired'];
  const gridCards = GRID.map((k, i) => ({ k, i, t: T(2, 0.5 + i * 0.5), midi: m(['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'][i]) }));

  // 2. three cards, a question each
  const asks = ['angry', 'proud', 'worried'].map((k, i) => ({ k, i, t: [T(4, 0.5), T(5, 0), T(5, 2)][i], midi: m(['F#5', 'A5', 'D6'][i]) }));

  // 3. the language choice: both → boys → girls → both
  const GENDERS = ['שמח / שמחה', 'בנים — שמח', 'בנות — שמחה'];
  const genderTaps = [{ k: 1, t: T(6, 1.5) }, { k: 2, t: T(7, 0.5) }, { k: 0, t: T(7, 2.5) }].map((p, i) => ({ ...p, i, midi: m(['F#5', 'A5', 'D6'][i]) }));
  // 4. nikud, then black-and-white, then colour again
  const looks = [{ row: 0, k: 1, t: T(8, 1.5) }, { row: 1, k: 1, t: T(9, 0.5) }, { row: 1, k: 0, t: T(9, 2.5) }].map((p, i) => ({ ...p, i, midi: m(['F#5', 'A5', 'D6'][i]) }));

  // 5. the wall board: 24 cells, a 16th apart
  const cells = BOARD.map(([e, s], i) => ({ e, s, i, t: ev.boardAll + i * BEAT / 4, midi: m(['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'][i % 6]) }));

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, grid: { t: T(2), sync: 'av' }, ask: { t: T(4), sync: 'av' },
    gender: { t: T(6), sync: 'av' }, look: { t: T(8), sync: 'av' }, board: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, EM, BOARD, GRID, gridCards, asks, GENDERS, genderTaps, looks, cells, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

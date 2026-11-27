// UGABUGA supplier recruitment reel #1: cake bakers (9:16). The real founding-supplier offer of the site:
// the suppliers directory, the 3-step join, the card form, the founding perks and the live places left.
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
  const DURATION = T(14) + 1.7; // ~29.9s

  // facts (live DB 2026-11-27: founding_suppliers_status -> limit 50, taken 2; traffic -> visits_30d 7074)
  const LIMIT = 50, TAKEN = 2, LEFT = LIMIT - TAKEN;
  const VISITS_30D = '7,074';

  const S = {
    hook: [0, T(2)], find: [T(2), T(4)], easy: [T(4), T(6)], card: [T(6), T(8)],
    offer: [T(8), T(10)], left: [T(10), T(12)], end: [T(12), DURATION],
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
    tag: T(0, 0), q1: T(0, 0), q2: T(0, 2), mascot: T(0, 3.2),
    title: T(1, 0), free: T(1, 2.5),
    logo: T(12, 0),
  };
  const steps = [
    { n: 1, sec: 'find', title: 'איפה ההורים מחפשים?', sub: 'ההורים פונים ישר בוואטסאפ', color: '#226bd7' },
    { n: 2, sec: 'easy', title: 'כמה קל? שלושה צעדים', sub: 'בלי סיסמה ובלי כרטיס אשראי', color: '#cf2f56' },
    { n: 3, sec: 'card', title: 'ממלאים את הכרטיס', sub: 'שם, תחום, אזור, תמונה וטלפון', color: '#8a4fd8' },
    { n: 4, sec: 'offer', title: 'ספק מייסד', sub: '50 הספקים הראשונים מקבלים מחיר מייסד', color: '#e08a00' },
    { n: 5, sec: 'left', title: 'כמה מקומות נשארו?', sub: 'המספר האמיתי מהאתר', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. find: the search box, the cakes chip, a supplier card, the facts
  const b1 = S.find[0];
  const find = { search: b1 + 0.55, chip: b1 + 1.25, card: b1 + 1.85, wa: b1 + 2.4, nofee: b1 + 2.75, visits: b1 + 3.25 };
  const CHIPS = [['🤹', 'מפעילים'], ['🎩', 'קוסמים'], ['🎂', 'עוגות'], ['🏰', 'מתנפחים']];

  // 2. easy: three steps
  const b2 = S.easy[0];
  const easy = [b2 + 0.6, b2 + 1.45, b2 + 2.3].map((t, i) => ({ t, i, midi: m(['D5', 'F#5', 'A5'][i]) }));
  const easyPill = b2 + 3.15;

  // 3. card form: fields fill in, then the save button
  const b3 = S.card[0];
  const card = {
    name: b3 + 0.5, cat: b3 + 1.0, area: b3 + 1.35, imgs: b3 + 1.8, phone: b3 + 2.2, save: b3 + 2.65, review: b3 + 3.0, wa: b3 + 3.45,
  };
  const NAME = 'העוגות של נועה';

  // 4. the founding offer, four perks
  const b4 = S.offer[0];
  const perks = [b4 + 0.55, b4 + 1.2, b4 + 1.85, b4 + 2.5].map((t, i) => ({ t, i, midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const offerPill = b4 + 3.2;

  // 5. places left: 50 dots in a wave, then the big number
  const b5 = S.left[0];
  const dots = []; for (let i = 0; i < LIMIT; i++) dots.push({ i, t: b5 + 0.45 + i * 0.018 });
  const numT = b5 + 1.55, linkT = b5 + 2.5, asOfT = b5 + 3.1;

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, find: { t: b1, sync: 'av' }, easy: { t: b2, sync: 'av' }, card: { t: b3, sync: 'av' },
    save: { t: card.save, sync: 'v' }, offer: { t: b4, sync: 'av' }, left: { t: b5, sync: 'av' }, num: { t: numT, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, steps,
    LIMIT, TAKEN, LEFT, VISITS_30D, find, CHIPS, easy, easyPill, card, NAME, perks, offerPill, dots, numT, linkT, asOfT, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

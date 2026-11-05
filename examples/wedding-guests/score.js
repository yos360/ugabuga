// UGABUGA "מזמינים 100 איש לחתונה, כמה באמת מגיעים?" (9:16 Reel). The wedding planner (/wedding, src/pages/wedding):
// 5 guest groups with arrival rates, the day of the week, the budget calculator, gifts vs cost, invitation + RSVP.
// The hook question is open; the demo mix (120 invited) is a different example, numbers computed by weddingPlan.js.
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
    pick: T(3, 2), // an audience is chosen
    topic: T(5, 1), // a topic is chosen
    mode: T(7, 2), // game mode picked
    go: T(8, 1), ans: T(9, 0), // the answer is tapped, then the green feedback
    printBtn: T(11, 0),
    logo: T(12, 0),
  };
  const hookOpts = ['60', '70', '80', '100'].map((s, i) => ({ s, i, t: T(1, 0.3 + i * 0.6), midi: m(['F#5', 'A5', 'B5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'כמה הזמנתם?', sub: '5 סוגי אורחים, לכל סוג אחוז הגעה אחר', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'וביום איזה?', sub: 'גם היום בשבוע משנה את ההערכה', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'כמה זה יעלה?', sub: 'מחירים מולאו מראש, אתם משנים', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'המתנות יכסו?', sub: 'סך הכול, מתנות צפויות ומה שנשאר', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'ואז מזמינים', sub: 'הזמנה, אישורי הגעה ותזכורות', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the site's own guest groups (GUEST_GROUPS) with a demo count each (120 invited)
  const AUD = [
    ['👪', 'משפחה קרובה', 40], ['👵', 'משפחה רחוקה', 20], ['🧑‍🤝‍🧑', 'חברים', 30],
    ['💼', 'עבודה ומכרים', 25], ['✈️', 'מחו״ל או רחוק מאוד', 5],
  ].map(([e, label, n], i) => ({ e, label, n, i, t: T(2, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const AUD_PICK = 1;

  // 2. day of the week options (the page's own select) + the result for the 120 demo (expectedGuests)
  const TOPICS = [['📅', 'אמצע השבוע'], ['🌅', 'יום שישי'], ['🕎', 'ערב חג או חול המועד']]
    .map(([e, s], i) => ({ e, s, i, t: T(4, 0.4 + i * 0.6), midi: m(['D5', 'F#5', 'A5'][i]) }));
  const TOPIC_PICK = 0;
  const EST = { invited: 120, expected: 97, low: 89, high: 102, rate: 80 };

  // 3. budget lines (BUDGET_ITEMS typical prices; hall = 97 x 320)
  const MODES = [
    ['🍽️', 'אולם ואוכל', '⁦97 × 320 ₪⁩ = ⁦31,040 ₪⁩', '#226bd7'],
    ['📷', 'צילום ווידאו', '⁦12,000 ₪⁩', '#e08a00'],
    ['🎧', 'תקליטן או להקה', '⁦7,000 ₪⁩', '#cf2f56'],
    ['💐', 'עיצוב ופרחים', '⁦8,000 ₪⁩ · ועוד 6 שורות', '#8a4fd8'],
  ].map(([e, s, note, color], i) => ({ e, s, note, color, i, t: T(6, 0.5 + i * 0.75), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));

  // 4. weddingBudget({guests: 97, perPlate: 320, gift: 900}) -> total 80,540; per guest 830; gifts 87,300; balance +6,760
  const Q = { total: '80,540 ₪', perGuest: '830 ₪ לאורח', gifts: '87,300 ₪', left: 'נשאר בערך 6,760 ₪ 🎉', gift: '900', paid: '0 ₪', toPay: 'נשאר לשלם 80,540 ₪' };

  // 5. invitation + RSVP + seating
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.5 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 3) }];

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 1.5) }, { t: T(13, 3) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' }, pickA: { t: ev.pick, sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, right: { t: ev.ans, sync: 'av' }, print: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, EST, MODES, Q, sheetItems, extras, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

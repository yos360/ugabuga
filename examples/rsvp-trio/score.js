// UGABUGA "אירוע בלי כאב ראש" (9:16 Reel). Three free event tools from the site, for any party or event:
// RSVP (/rsvp), who-brings-what (/bring-list) and גמד וענק (/secret-friend). One timeline.
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
    hook: [0, T(2)], rsvp1: [T(2), T(4)], rsvp2: [T(4), T(6)], bring1: [T(6), T(8)],
    bring2: [T(8), T(10)], secret: [T(10), T(12)], end: [T(12), DURATION],
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
    q1: T(0, 0), q2: T(0, 2),
    title: T(1, 0), free: T(1, 2.5),
    kind: T(2, 1.5), create: T(3, 1), sendcard: T(3, 1.75), wa: T(3, 3),
    answer: T(4, 1), send: T(4, 1.75), remind: T(5, 2.5),
    share: T(7, 3), sharePop: T(7, 2),
    final: T(9, 3),
    mode: T(10, 0.25), draw: T(10, 2.5), reveal: T(11, 0.5), revealTap: T(11, 1.5), revealed: T(11, 2), noSelf: T(11, 3),
    logo: T(12, 0),
  };
  const hookPills = [['✅', 'אישורי הגעה'], ['🧺', 'מי מביא מה'], ['🧙', 'גמד וענק']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'rsvp1', title: 'אישורי הגעה', sub: 'יוצרים אירוע ושולחים קישור אחד', color: '#226bd7' },
    { n: 2, sec: 'rsvp2', title: 'כולם עונים בלחיצה', sub: 'מגיעים, אולי או לא, בלי הרשמה', color: '#23874d' },
    { n: 3, sec: 'bring1', title: 'מי מביא מה?', sub: 'רשימה לאירוע, וקישור אחד בוואטסאפ', color: '#e08a00' },
    { n: 4, sec: 'bring2', title: 'כל אחד תופס פריט', sub: 'כולם רואים מי מביא מה', color: '#cf2f56' },
    { n: 5, sec: 'secret', title: 'גמד וענק', sub: 'הגרלה עם קישור אישי לכל משתתף', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. RSVP form (labels from the site's own form), typed event name
  const KINDS = ['🎈 מסיבת ילדים', '🥂 אירוע אחר'];
  const EVENT_NAME = 'מפגש משפחתי';
  const nameTicks = []; for (let i = 0; i < EVENT_NAME.length; i++) nameTicks.push(T(2, 2) + i * (T(3, 0.5) - T(2, 2)) / EVENT_NAME.length);
  const typedName = (t) => EVENT_NAME.slice(0, nameTicks.filter((q) => t >= q).length);

  // 2. guests' answers (host summary is computed from these)
  const REPLIES = [
    { name: 'משפחת לוי', status: 'yes', adults: 2, kids: 1, t: T(4, 2.5), midi: m('F#5') },
    { name: 'דנה', status: 'yes', adults: 1, kids: 0, t: T(5, 0), midi: m('A5') },
    { name: 'אורי', status: 'maybe', adults: 0, kids: 0, t: T(5, 1), midi: m('D6') },
  ];
  const totals = (t) => {
    const r = REPLIES.filter((x) => t >= x.t);
    const yes = r.filter((x) => x.status === 'yes');
    const adults = yes.reduce((a, x) => a + x.adults, 0), kids = yes.reduce((a, x) => a + x.kids, 0);
    return { people: adults + kids, adults, kids, maybe: r.filter((x) => x.status === 'maybe').length };
  };

  // 3. the starter list of the bring-list tool (BringList.jsx `starter`)
  const STARTER = ['עוגה', 'שתייה', 'כוסות', 'צלחות', 'פירות', 'מפיות', 'בלונים', 'רמקול'];
  const starterItems = STARTER.map((text, i) => ({ text, i, t: T(6, 0.5 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'F#5', 'A5', 'D6'][i]) }));

  // 4. who brings what: first claim opens the name field, the rest are one tap
  const CLAIM_ITEMS = ['עוגה', 'שתייה', 'כוסות', 'צלחות', 'פירות'];
  const claims = [
    { item: 0, name: 'נועה', ask: T(8, 0.5), type: [T(8, 0.75), T(8, 1.5)], t: T(8, 2) },
    { item: 1, name: 'יואב', t: T(8, 3) },
    { item: 2, name: 'אורי', t: T(9, 0.5) },
    { item: 3, name: 'מיכל', t: T(9, 1.5) },
  ].map((c, i) => ({ ...c, i, midi: m(['F#5', 'A5', 'B5', 'D6'][i]) }));
  const taken = (t) => claims.filter((c) => t >= c.t).length;

  // 5. גמד וענק: four names, then the personal link
  const MODES = ['🧙 גמד וענק', '🎭 משלוח מנות לפורים', '🕎 מתנות לחנוכה'];
  const NAMES = ['נועה', 'יואב', 'אורי', 'מיכל'];
  const nameLines = NAMES.map((name, i) => ({ name, i, t: T(10, 0.5 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const resultRows = NAMES.map((name, i) => ({ name, i, t: T(10, 3 + i * 0.25), midi: m(['F#5', 'A5', 'B5', 'D6'][i]) }));

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, rsvp: { t: T(2), sync: 'av' }, create: { t: ev.create, sync: 'av' },
    rsvp2: { t: T(4), sync: 'v' }, answer: { t: ev.answer, sync: 'a' }, bring: { t: T(6), sync: 'av' },
    share: { t: ev.share, sync: 'av' }, claim: { t: T(8), sync: 'av' }, secret: { t: T(10), sync: 'av' },
    draw: { t: ev.draw, sync: 'v' }, revealed: { t: ev.revealed, sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, KINDS, EVENT_NAME, nameTicks, typedName, REPLIES, totals, STARTER, starterItems,
    CLAIM_ITEMS, claims, taken, MODES, NAMES, nameLines, resultRows, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

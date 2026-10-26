// UGABUGA class elections (9:16 Instagram Reel). The real flow of /tools/class-elections, one step per
// 2 bars: choose the election type, write the candidates, print ballots, vote, count. One timeline.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 118, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(14) + 1.7; // ≈ 30.3s

  const S = {
    hook: [0, T(2)], modes: [T(2), T(4)], names: [T(4), T(6)], print: [T(6), T(8)],
    vote: [T(8), T(10)], count: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' },
    G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' },
    F: { notes: ['A3', 'C4', 'F4'], bass: 'F1' },
    Dm7: { notes: ['A3', 'C4', 'F4'], bass: 'D2' },
    Gsus: { notes: ['G3', 'C4', 'D4'], bass: 'G1' },
    Cadd9: { notes: ['G3', 'C4', 'D4', 'E4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'],
    [2, 0, 4, 'F'], [3, 0, 4, 'C'], [4, 0, 4, 'Am'], [5, 0, 4, 'G'],
    [6, 0, 4, 'F'], [7, 0, 4, 'C'], [8, 0, 4, 'Am'], [9, 0, 2, 'Gsus'], [9, 2, 2, 'G'],
    [10, 0, 4, 'Dm7'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    hook1: T(0, 0), hook2: T(0, 2), box: T(0, 3), line: T(1, 0), free: T(1, 2),
    pickMode: T(3, 2), // the "ועד כיתה" card is tapped
    toPrint: T(5, 3), // "save" → print
    pick: T(8, 0), drop: T(8, 1), // the girl picks נועה and drops the ballot in
    reveal: T(11, 0), // the winner
    note: T(11, 2),
    logo: T(12, 0),
  };

  const steps = [
    { n: 1, sec: 'modes', title: 'בוחרים סוג בחירות', sub: 'ועד כיתה, ועד בית ספר, ועד הורים ועוד', color: '#cf2f56' },
    { n: 2, sec: 'names', title: 'כותבים את המועמדים', sub: 'שם בכל שורה, מ־2 עד 8 מועמדים', color: '#8a4fd8' },
    { n: 3, sec: 'print', title: 'מדפיסים פתקים וקלפי', sub: 'פתקים לכל מועמד, שלט לקלפי ודף ספירה', color: '#e08a00' },
    { n: 4, sec: 'vote', title: 'מצביעים בפרטיות', sub: 'כל אחד בוחר פתק אחד ומכניס לקלפי', color: '#226bd7' },
    { n: 5, sec: 'count', title: 'סופרים יחד', sub: 'כל קול נספר, ורואים את התוצאה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the five election types on the site, one per 8th
  const modes = [
    ['🎒', 'ועד כיתה'], ['🏫', 'ועד בית הספר'], ['👨‍👩‍👧', 'ועד הורים'], ['🇮🇱', 'בחירות ארציות (הדמיה)'], ['🔄', 'בחירות חוזרות'],
  ].map(([e, label], i) => ({ e, label, i, t: T(2, 0.5 + i * 0.5), midi: m(['C5', 'D5', 'E5', 'G5', 'A5'][i]) }));

  // 2. candidates typed letter by letter, a key click per 16th
  const candidates = ['נועה', 'איתי', 'מאיה'];
  const typing = [];
  {
    let t = T(4, 0.5);
    candidates.forEach((nm, line) => {
      const letters = [...nm];
      letters.forEach((ch, k) => { typing.push({ line, k, t }); t += BEAT / 4; });
      t += BEAT / 2; // enter
    });
  }
  const typed = (t, line) => typing.filter((x) => x.line === line && t >= x.t).length;
  const nameChips = candidates.map((nm, i) => ({ nm, i, t: T(5, i * 0.5 + 0.5), midi: m(['E5', 'G5', 'C6'][i]) }));

  // 3. the printer pushes a ballot per beat (bar 6), then the box sign and the tally sheet (bar 7)
  const ballots = candidates.concat(['נועה']).map((nm, i) => ({ nm, i, t: T(6, i), midi: m(['C5', 'E5', 'G5', 'C6'][i]) }));
  const extras = [{ kind: 'box', t: T(7, 0), midi: m('E5') }, { kind: 'tally', t: T(7, 1), midi: m('G5') }];
  const readyPill = T(7, 2.5);

  // 4. voting: slips fall into the box, one per 8th; the count ticks up (28 ballots in total)
  const TOTAL = 28;
  const slips = [];
  { const r = U.mulberry32(7); for (let i = 0; i < 10; i++) slips.push({ i, t: T(8, 2 + i * 0.5) + 0.32, x0: r(), rot: (r() - 0.5) * 1.2, nm: candidates[Math.floor(r() * 3)] }); }
  const ballotCount = (t) => {
    const k = slips.filter((s) => t >= s.t).length + (t >= ev.drop + 0.36 ? 1 : 0);
    if (k <= 1) return k;
    return Math.min(TOTAL, Math.round(1 + (k - 1) * ((TOTAL - 1) / slips.length)));
  };

  // 5. results (28 valid, 0 blank): bars grow over bar 10, ticks on 16ths, winner on bar 11
  const results = [['נועה', 11], ['איתי', 9], ['מאיה', 8]].map(([nm, v], i) => ({ nm, v, i, pct: Math.round((v / TOTAL) * 100) }));
  const countTicks = []; for (let i = 0; i < 14; i++) countTicks.push(T(10, 0.25 + i * 0.25));

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.hook1, sync: 'a' },
    modes: { t: T(2), sync: 'av' },
    pickMode: { t: ev.pickMode, sync: 'a' },
    names: { t: T(4), sync: 'av' },
    print: { t: T(6), sync: 'av' },
    vote: { t: T(8), sync: 'av' },
    count: { t: T(10), sync: 'av' },
    reveal: { t: ev.reveal, sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    steps, modes, candidates, typing, typed, nameChips, ballots, extras, readyPill, slips, ballotCount, TOTAL,
    results, countTicks, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

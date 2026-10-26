// UGABUGA for teachers (9:16 Instagram Reel). A musical explainer: one feature per 2 bars, each with
// its own sync gimmick. Everything (music AND picture) is timed here.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 118, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(14) + 1.7; // ≈ 30.3s

  const S = {
    hook: [0, T(2)], quiz: [T(2), T(4)], hw: [T(4), T(6)], wheel: [T(6), T(8)],
    print: [T(8), T(10)], games: [T(10), T(12)], end: [T(12), DURATION],
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
    [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'], [5, 0, 4, 'G'],
    [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'C'], [9, 0, 4, 'G'],
    [10, 0, 4, 'Dm7'], [11, 0, 2, 'Gsus'], [11, 2, 2, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    hook1: T(0, 0), // "מורים ומורות?" stamps
    buga: T(0, 2), // Buga jumps in
    hook2: T(1, 0), // "5 דברים..."
    free: T(1, 2), // "בחינם" stamp
    tapQuiz: T(2, 2), // the right answer is tapped
    send: T(4, 3.5), // "send link to class"
    spin: T(6, 0), // the wheel starts
    land: T(7, 0), // ... and lands on a name
    logo: T(12, 0),
  };

  // feature cards: number, title, subtitle, colour
  const features = [
    { n: 1, sec: 'quiz', title: 'מבחן אמריקאי אונליין', sub: 'התלמידים עונים מהטלפון, והציון נבדק לבד', color: '#226bd7' },
    { n: 2, sec: 'hw', title: 'שיעורי בית אינטראקטיביים', sub: 'חשבון, הבנת הנקרא והכתבה. רואים מי סיים', color: '#cf2f56' },
    { n: 3, sec: 'wheel', title: 'גלגל שמות וחלוקה לקבוצות', sub: 'שומרים את רשימת הכיתה פעם אחת', color: '#23874d' },
    { n: 4, sec: 'print', title: 'דפי עבודה להדפסה', sub: 'אותיות, חשבון, שעון ועוד. מוכן בקליק', color: '#e08a00' },
    { n: 5, sec: 'games', title: 'משחקים לכל כיתה', sub: 'מגן ועד כיתה ו׳, לשיעור ולהפסקה', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // QUIZ: answers pop on 8ths, then the scores, one per beat (marimba climbing)
  const quizAns = ['54', '56', '63', '48'].map((a, i) => ({ a, i, t: T(2, 0.5 + i * 0.5), ok: a === '56', midi: m(['E5', 'G5', 'A5', 'C6'][i]) }));
  const scores = [['נועה', 100], ['אורי', 90], ['מיה', 100], ['יואב', 95]].map(([name, s], i) => ({ name, s, i, t: T(3, i), midi: m(['C5', 'E5', 'G5', 'C6'][i]) }));

  // HOMEWORK: tasks stack on beats, then kids tick "סיים" on 8ths
  const hwTasks = ['תרגילי חשבון', 'הבנת הנקרא עם הקראה', 'הכתבה', 'משחק'].map((txt, i) => ({ txt, i, t: T(4, i * 0.75 + 0.25), midi: m(['G4', 'C5', 'E5', 'G5'][i]) }));
  const kids = ['נועה', 'אורי', 'מיה', 'יואב', 'תמר', 'איתי'].map((name, i) => ({ name, i, t: T(5, 0.5 + i * 0.5), midi: m(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i]) }));

  // WHEEL: 8 names; it spins one bar, easing out, and lands on מיה exactly on the downbeat
  const wheelNames = ['נועה', 'אורי', 'מיה', 'יואב', 'תמר', 'איתי', 'שירה', 'דניאל'];
  const N = wheelNames.length, SL = (2 * Math.PI) / N, target = 2; // index of the winner
  // the pointer is at the top (-π/2). Slice i is centred at angle i*SL + rot - π/2 ... choose total rotation
  const turns = 3;
  const finalRot = -(target * SL) - turns * 2 * Math.PI; // slice 'target' centred under the pointer
  const spinEase = (u) => 1 - Math.pow(1 - u, 3);
  const wheelRot = (t) => {
    if (t <= ev.spin) return 0;
    const u = Math.min(1, (t - ev.spin) / (ev.land - ev.spin));
    return finalRot * spinEase(u);
  };
  // a tick each time a slice boundary passes the pointer (computed, so sound == picture)
  const wheelTicks = [];
  {
    let last = Math.floor((-wheelRot(ev.spin) + SL / 2) / SL);
    for (let t = ev.spin; t < ev.land - 0.04; t += 1 / 600) {
      const k = Math.floor((-wheelRot(t) + SL / 2) / SL);
      if (k !== last) { wheelTicks.push(t); last = k; }
    }
  }
  const teams = [['נועה', 'יואב', 'שירה'], ['אורי', 'תמר', 'דניאל'], ['מיה', 'איתי', 'רון']].map((names, i) => ({ names, i, t: T(7, 1 + i * 0.75), midi: m(['E5', 'G5', 'C6'][i]) }));

  // PRINT: the printer pushes a page on each beat
  const pages = [
    { kind: 'letter', label: 'אותיות' }, { kind: 'math', label: 'חשבון' },
    { kind: 'clock', label: 'שעון' }, { kind: 'abc', label: 'ABC' },
  ].map((p, i) => ({ ...p, i, t: T(8, i), midi: m(['C5', 'E5', 'G5', 'C6'][i]) }));
  const printFan = T(9, 0);

  // GAMES: grade chips, one per 8th, a rising scale
  const grades = ['גן', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'].map((g, i) => ({ g, i, t: T(10, i * 0.5), midi: m(['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'][i]) }));
  const gameCards = ['בינגו היכרות', 'טריוויה', 'חם־קר'].map((g, i) => ({ g, i, t: T(11, i), midi: m(['C6', 'E6', 'G6'][i]) }));

  // END
  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.hook1, sync: 'a' },
    quiz: { t: T(2), sync: 'av' },
    tap: { t: ev.tapQuiz, sync: 'av' },
    hw: { t: T(4), sync: 'av' },
    wheel: { t: T(6), sync: 'av' },
    land: { t: ev.land, sync: 'av' },
    print: { t: T(8), sync: 'av' },
    games: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    features, quizAns, scores, hwTasks, kids, wheelNames, wheelRot, wheelTicks, SL, teams,
    pages, printFan, grades, gameCards, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

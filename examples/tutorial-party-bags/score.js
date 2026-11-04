// UGABUGA tutorial (16:9) — "שקיות הפתעה ליום הולדת" (/birthday/party-bags). Every label, item, price and count
// comes from src/pages/birthday/PartyBags.jsx and src/data/partyBags.js (screens are real captures of the built page).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;
  const FPS = 30, FORMAT = '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(19) + 1.0;
  const S = { hook: [0, T(2)], age: [T(2), T(5)], budget: [T(5), T(8)], bag: [T(8), T(11)], clean: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm7: { notes: ['F3', 'A3', 'C4'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' },
    Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'C'], [3, 0, 4, 'Am'], [4, 0, 4, 'F'],
    [5, 0, 4, 'C'], [6, 0, 4, 'G'], [7, 0, 4, 'Am'], [8, 0, 4, 'F'], [9, 0, 4, 'C'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'G'], [14, 0, 4, 'C'], [15, 0, 4, 'Dm7'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    tapAge: T(2, 1.5), tipAge: T(4, 0),
    tapBudget: T(5, 1.5), tipBudget: T(7, 0),
    ringBag: T(8, 0.5), pan: T(9, 1), tipIdeas: T(10, 1),
    tapClean: T(11, 1.5), panBack: T(11, 0.5), tipClean: T(13, 0),
    tapColoring: T(14, 1), tapPrint: T(15, 0.5), preview: T(15, 0.9), tipPrint: T(16, 1),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'age', title: 'בוחרים גיל', sub: 'גיל ⁦2–3⁩, גן, כיתות א–ג או ד–ו — מה שמתאים לילדים שלכם', color: '#226bd7' },
    { n: 2, sec: 'budget', title: 'בוחרים תקציב', sub: 'עד 10 ₪, עד 20 ₪ או עד 35 ₪ לשקית', color: '#cf2f56' },
    { n: 3, sec: 'bag', title: 'שקית לדוגמה', sub: 'האתר מרכיב שקית שלמה עם מחיר, ומתחת — כל הרעיונות שמתאימים', color: '#8a4fd8' },
    { n: 4, sec: 'clean', title: 'בלי פלסטיק ובלי ממתקים', sub: 'מסמנים את המסנן והרשימה מצטמצמת', color: '#23874d' },
    { n: 5, sec: 'print', title: 'מדפיסים תוויות', sub: 'תוויות תודה ומדבקות עם שם — צבעוניות או לצביעה', color: '#e08a00' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const AGES = [['🧸', 'גיל ⁦2–3⁩'], ['🎈', 'גן (⁦4–6⁩)'], ['✏️', 'כיתות א–ג'], ['🎯', 'כיתות ד–ו']];
  const endLines = [{ t: T(17, 1) }, { t: T(17, 2) }, { t: T(17, 3) }, { t: T(18, 1) }, { t: T(18, 2.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, AGES, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

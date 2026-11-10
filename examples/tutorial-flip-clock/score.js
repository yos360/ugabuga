// UGABUGA tutorial (16:9) — "שעון מסך מלא" (/tools/flip-clock). Every label and fact comes from
// src/pages/tools/FlipClock.jsx (buttons, THEMES, faq, SeoBody text). Screens are real captures (shoot.js).
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;
  const FPS = 30, FORMAT = '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 124, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(20) + 1.0;
  const S = { hook: [0, T(2)], full: [T(2), T(5)], sound: [T(5), T(8)], colour: [T(8), T(11)], opts: [T(11), T(14)], clean: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Am'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'Am'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. "מסך מלא" → the time fills the screen, a flip every second
    ringFull: T(2, 1), tapFull: T(3, 0), tipFull: T(4, 0),
    // 2. the clack
    ringSound: T(5, 1), tapSound: T(6, 0), tipSound: T(7, 0),
    // 3. five colours
    tapNight: T(8, 1), tapRetro: T(9, 0), tapPink: T(9, 2), tapWhite: T(10, 0), tipColour: T(10, 1),
    // 4. seconds, 12/24, date
    tapSec: T(11, 1), tapH12: T(12, 0), tapDate: T(12, 2), tipOpts: T(13, 1),
    // 5. full screen: the buttons fade after 3 s
    ringBar: T(14, 1), barGone: T(15, 1), tipClean: T(15, 2),
    logo: T(17, 0),
  };
  // flip ticks on the full-screen views: every 2 beats (≈ one second)
  const ticks = [T(3, 2.5), T(4, 0.5), T(4, 2.5), T(16, 0.5)];
  const steps = [
    { n: 1, sec: 'full', title: 'לוחצים "מסך מלא"', sub: 'השעה ממלאת את כל המסך — בגודל שרואים מקצה החדר', color: '#cf2f56' },
    { n: 2, sec: 'sound', title: 'מפעילים את הקליק', sub: 'צליל קצר בכל פעם שספרה מתהפכת, כמו בשעון של פעם', color: '#226bd7' },
    { n: 3, sec: 'colour', title: 'בוחרים צבע', sub: 'חמישה צבעים לשעון — לחיצה אחת ומתחלף', color: '#e08a00' },
    { n: 4, sec: 'opts', title: 'מה מופיע בשעון', sub: 'שניות, 12 או 24 שעות, ותאריך — מדליקים ומכבים', color: '#23874d' },
    { n: 5, sec: 'clean', title: 'רק השעה על המסך', sub: 'במסך מלא הכפתורים והעכבר נעלמים אחרי שלוש שניות', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🖥️', 'שומר מסך'], ['🏫', 'לכיתה'], ['📺', 'לטלוויזיה'], ['🛏️', 'ליד המיטה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, ticks, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

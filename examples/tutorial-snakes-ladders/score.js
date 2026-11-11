// UGABUGA tutorial (16:9) — "סולמות ונחשים של כפל וחילוק להדפסה" (/board-games/snakes-and-ladders/multiplication).
// Every label and fact comes from src/pages/printables/SnakesLaddersMath.jsx + snakesLaddersMath.js (LEVELS, Choice
// options, "🔀 תרגילים חדשים", rules box, answer card) and PrintableShell.jsx ("הדפסה או PDF", "חינם, בלי הרשמה").
// Screens are real captures of the live page (shoot.js, shoot2.js).
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
  const S = { hook: [0, T(2)], level: [T(2), T(5)], mode: [T(5), T(8)], fresh: [T(8), T(11)], print: [T(11), T(14)], play: [T(14), T(17)], end: [T(17), DURATION] };
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
    // 1. level: easy → hard → full
    ringLevels: T(2, 1), tapEasy: T(3, 0), tapHard: T(3, 2), tapFull: T(4, 0), tipLevel: T(4, 1),
    // 2. with exercises / blank, colour / black-and-white
    ringFilled: T(5, 1), tapBlank: T(6, 0), tapBW: T(6, 2), tipMode: T(7, 0),
    // 3. "🔀 תרגילים חדשים": a new board on every tap
    tapFresh1: T(8, 1), tapFresh2: T(9, 1), tipFresh: T(10, 0),
    // 4. "הדפסה או PDF": board + answer card
    ringPrint: T(11, 1), tapPrint: T(12, 0), cards: T(12, 1), tipPrint: T(13, 0),
    // 5. playing: a ladder = multiplication, a snake head = division
    ladder: T(14, 1), ladderOk: T(15, 0), snake: T(15, 2), snakeOk: T(16, 0), tipPlay: T(15, 1), win: T(16, 2),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'level', title: 'בוחרים רמה', sub: 'שלוש רמות לכיתות ג׳–ד׳, מהקלה ועד המאתגרת', color: '#cf2f56' },
    { n: 2, sec: 'mode', title: 'עם תרגילים או ריק', sub: 'בלוח הריק המורה כותבת תרגילים משלה. אפשר גם בשחור־לבן, שחוסך דיו', color: '#226bd7' },
    { n: 3, sec: 'fresh', title: 'תרגילים חדשים', sub: 'כל לחיצה נותנת לוח אחר באותה רמה, עם כרטיס תשובות משלו', color: '#e08a00' },
    { n: 4, sec: 'print', title: 'מדפיסים', sub: 'לוחצים "הדפסה או PDF" ומקבלים את הלוח ואת כרטיס התשובות', color: '#23874d' },
    { n: 5, sec: 'play', title: 'משחקים', sub: 'מטילים קובייה. נחתתם על סולם או על ראש של נחש? פותרים את התרגיל', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🪜', 'סולם — כפל'], ['🐍', 'נחש — חילוק'], ['🎲', '⁦2–4⁩ שחקנים'], ['🖨️', 'לוח + תשובות']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

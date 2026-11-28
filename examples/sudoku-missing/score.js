// UGABUGA "איזה מספר חסר?" (9:16 Reel). The sudoku section of the site (/sudoku): src/sudoku/content.js (levels, kids boards,
// copy), src/sudoku/puzzles.js (the real puzzle generator, boards below are puzzleFor() output), src/sudoku/SudokuGame.jsx
// (tools, number row, mistakes switch), src/pages/sudoku/SudokuPages.jsx (daily, print, solver).
// The hook is a real kids 4×4 board (puzzleFor('kids4', 4)); the answer (4) is never shown.
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
    hook: [0, T(2)], levels: [T(2), T(4)], kids: [T(4), T(6)], play: [T(6), T(8)],
    daily: [T(8), T(10)], print: [T(10), T(12)], end: [T(12), DURATION],
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
    kidFill1: T(5, 0.6), kidFill2: T(5, 1.6), // step 2: two numbers placed on the 4×4 board
    fill1: T(6, 3.0), fill2: T(7, 2.4), // step 3: key taps that fill a cell
    share: T(9, 1.5), // step 4: share to a friend
    chip: T(10, 1.4), tick: T(10, 2.4), printBtn: T(11, 0.4), // step 5
    logo: T(12, 0),
  };
  const hookOpts = [0, 1, 2, 3].map((i) => ({ i, t: T(0, 1.2 + i * 0.35), midi: m(['F#5', 'A5', 'D6', 'F#6'][i]) }));

  // ---- real boards (flat arrays, 0 = empty), from puzzleFor() in src/sudoku/puzzles.js ----
  const BOARDS = {
    hook: { n: 4, g: [0,2,0,3,0,0,2,0,0,1,0,0,2,0,3,0], target: 10 }, // kids4 #4 — answer never shown
    k4: { n: 4, g: [0,0,2,0,2,0,0,4,3,0,0,1,0,1,0,0], s: [1,4,2,3,2,3,1,4,3,2,4,1,4,1,3,2] }, // kids4 #1
    daily: { n: 9, g: [0,0,0,0,0,7,3,2,5,8,9,0,0,4,5,0,1,0,7,0,0,0,0,0,8,0,0,0,5,7,4,0,6,0,0,8,0,0,0,8,0,0,7,0,0,0,2,0,0,0,0,5,6,4,2,0,0,6,0,0,0,0,0,5,0,1,0,7,0,0,0,6,0,0,6,5,9,0,0,7,0] }, // medium daily board of the day (32 givens)
    print: [[6,0,8,0,1,0,7,2,0,4,0,2,6,0,7,0,0,0,0,3,0,5,0,4,1,0,8,0,0,7,3,0,0,4,0,0,1,2,6,0,0,0,5,7,3,0,4,0,0,7,0,0,0,6,0,6,0,0,9,0,0,4,0,2,0,0,0,0,8,6,0,0,0,0,0,1,6,2,3,8,9], [8,3,0,0,7,0,0,0,5,0,1,9,0,5,6,4,0,3,0,4,0,0,0,9,0,6,2,0,0,0,2,9,3,0,0,4,9,0,0,5,0,4,6,0,7,0,0,0,0,0,7,2,8,0,0,6,0,3,4,1,0,0,0,0,7,8,9,2,0,0,4,0,3,0,4,0,6,0,0,0,0], [9,8,5,0,0,2,6,0,0,0,6,0,0,8,0,9,0,0,0,7,0,0,0,9,0,0,2,8,0,6,2,3,0,0,0,0,0,5,7,9,0,8,0,0,6,3,9,0,0,0,6,4,0,1,7,2,0,0,1,0,3,4,0,6,0,4,0,0,0,0,2,5,0,1,9,0,2,3,7,0,0], [0,0,1,0,7,8,0,0,0,4,8,9,5,0,2,0,7,0,7,2,6,3,0,0,0,0,8,0,1,3,0,0,0,0,2,5,0,0,0,9,2,0,0,0,0,0,0,0,0,5,7,0,0,0,0,0,5,0,0,4,8,6,7,0,0,0,6,8,0,0,0,9,0,6,0,7,0,9,1,5,4]], // 4 easy boards for the A4 sheet
    printSol: [[6,5,8,9,1,3,7,2,4,4,1,2,6,8,7,9,3,5,7,3,9,5,2,4,1,6,8,9,8,7,3,5,6,4,1,2,1,2,6,8,4,9,5,7,3,3,4,5,2,7,1,8,9,6,8,6,3,7,9,5,2,4,1,2,9,1,4,3,8,6,5,7,5,7,4,1,6,2,3,8,9],[8,3,6,4,7,2,9,1,5,2,1,9,8,5,6,4,7,3,7,4,5,1,3,9,8,6,2,6,8,7,2,9,3,1,5,4,9,2,1,5,8,4,6,3,7,4,5,3,6,1,7,2,8,9,5,6,2,3,4,1,7,9,8,1,7,8,9,2,5,3,4,6,3,9,4,7,6,8,5,2,1],[9,8,5,3,7,2,6,1,4,2,6,1,5,8,4,9,7,3,4,7,3,1,6,9,8,5,2,8,4,6,2,3,1,5,9,7,1,5,7,9,4,8,2,3,6,3,9,2,7,5,6,4,8,1,7,2,8,6,1,5,3,4,9,6,3,4,8,9,7,1,2,5,5,1,9,4,2,3,7,6,8],[5,3,1,4,7,8,6,9,2,4,8,9,5,6,2,3,7,1,7,2,6,3,9,1,5,4,8,9,1,3,8,4,6,7,2,5,8,5,7,9,2,3,4,1,6,6,4,2,1,5,7,9,8,3,3,9,5,2,1,4,8,6,7,1,7,4,6,8,5,2,3,9,2,6,8,7,3,9,1,5,4]], // their solutions (page 2)
    k6: { n: 6, g: [5,0,0,0,1,0,0,1,3,0,0,0,0,0,6,1,5,0,0,5,1,6,0,0,0,0,0,3,2,0,0,3,0,0,0,1] }, // kids6 #3
  };
  const EASY = { // easy #12345: 38 givens; the two cells the reel fills are naked singles
    g: [0,6,0,0,0,1,5,0,3, 1,4,0,0,3,2,0,9,0, 0,3,5,4,0,8,0,1,0, 5,0,3,0,0,0,1,0,6, 7,9,1,8,2,6,4,0,0, 0,0,0,0,0,5,0,0,0, 0,0,0,6,5,0,7,0,2, 0,5,0,0,0,0,0,0,0, 6,7,2,1,8,9,0,0,4],
    fills: [[44, 5], [78, 3]],
  };
  const countLeft = (v, filled) => 9 - (EASY.g.filter((x) => x === v).length + filled.filter((f) => f[1] === v).length);

  const steps = [
    { n: 1, sec: 'levels', title: 'ארבע רמות קושי', sub: 'מקל למתחילים ועד אתגר לאלופים', color: '#226bd7' },
    { n: 2, sec: 'kids', title: 'סודוקו גם לילדים', sub: 'לוחות קטנים של ⁦4×4⁩ ו־⁦6×6⁩', color: '#23874d' },
    { n: 3, sec: 'play', title: 'משחקים על המסך', sub: 'לוחצים על משבצת ואז על מספר', color: '#cf2f56' },
    { n: 4, sec: 'daily', title: 'הסודוקו היומי', sub: 'לוח אחד לכולם, מתחלף בחצות', color: '#8a4fd8' },
    { n: 5, sec: 'print', title: 'להדפסה ולפתרון', sub: 'עד ⁦6⁩ לוחות בדף, ופותר סודוקו', color: '#e08a00' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the four levels (SPOKES in src/sudoku/content.js), then two facts
  const LEVELS = [['🙂', 'סודוקו קל', 'למתחילים — רק היגיון פשוט', '★', '#23874d'], ['🤔', 'סודוקו בינוני', 'פחות רמזים, יותר חיפוש', '★★', '#226bd7'], ['😤', 'סודוקו קשה', 'צריך טיוטה וזוגות', '★★★', '#e08a00'], ['🔥', 'סודוקו קשה מאוד', 'לאלופים בלבד', '★★★★', '#cf2f56']]
    .map(([e, label, sub, stars, color], i) => ({ e, label, sub, stars, color, i, t: T(2, 0.6 + i * 0.7), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const levelPills = [T(3, 2.0), T(3, 3.0)];
  // 2. kids boards: 4×4 (right), 6×6 (left), the number keys, two pills
  const kidT = [T(4, 0.5), T(4, 1.3), T(4, 2.4), T(5, 2.4), T(5, 3.2)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const kidTaps = [{ cell: 3, v: 3, tTap: T(5, 0.1), t: ev.kidFill1 }, { cell: 5, v: 3, tTap: T(5, 1.1), t: ev.kidFill2 }];
  // 3. the player: stats, board, tools, keys
  const playT = [T(6, 0.3), T(6, 1.0), T(7, 0.6), T(7, 3.0)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const playTaps = [{ cell: 44, v: 5, tTap: T(6, 1.9), t: ev.fill1 }, { cell: 78, v: 3, tTap: T(7, 1.2), t: ev.fill2 }];
  // 4. daily card, countdown, share, the WhatsApp bubble
  const dailyT = [T(8, 0.4), T(8, 1.3), T(8, 2.4), T(9, 0.2), T(9, 2.1)].map((t, i) => ({ i, t, midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  // 5. print settings, A4 pages, solver
  const printT = [T(10, 0.3), T(10, 3.0), T(11, 1.2), T(11, 2.2)].map((t, i) => ({ i, t, midi: m(['D5', 'A5', 'B5', 'D6'][i]) }));

  const endLines = [{ t: T(12, 0.8) }, { t: T(12, 1.6) }, { t: T(12, 2.4) }, { t: T(12, 3.2) }, { t: T(13, 0) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, levels: { t: T(2), sync: 'av' }, kids: { t: T(4), sync: 'av' },
    play: { t: T(6), sync: 'av' }, daily: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' },
    fill: { t: ev.fill1, sync: 'av' }, share: { t: ev.share, sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, BOARDS, EASY, countLeft, LEVELS, levelPills, kidT, kidTaps, playT, playTaps, dailyT, printT, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

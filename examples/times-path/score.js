// UGABUGA "מסלול לוח הכפל" (9:16 Reel). The real times-table path game (/learn/multiplication-game):
// 14 stages, 10 questions per stage with a keypad, a hint after a wrong answer, stars, and a printable A4 sheet.
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
    hook: [0, T(2)], path: [T(2), T(4)], play: [T(4), T(6)], hint: [T(6), T(8)],
    stars: [T(8), T(10)], sheet: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['F3', 'A3', 'D4'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' },
    Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'], [5, 0, 4, 'G'],
    [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'Dm'], [9, 0, 2, 'Gsus'], [9, 2, 2, 'G'],
    [10, 0, 4, 'Am'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), // "7 × 8" then "= ?"
    title: T(1, 0), free: T(1, 2.5),
    unlock: T(3, 2), // first stage tapped
    ok1: T(4, 1.75), ok2: T(5, 0.25), // two right answers
    wrong: T(6, 2), next: T(7, 3.5),
    result: T(8, 1.5), logo: T(12, 0),
  };
  const hookPills = [['⭐', 'כוכבים'], ['💡', 'רמזים'], ['🖨️', 'דפי תרגול']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['G5', 'C6', 'E6'][i]) }));

  const steps = [
    { n: 1, sec: 'path', title: 'מסלול של 14 שלבים', sub: 'מתחילים בלוחות הקלים ומסיימים באתגר הגדול', color: '#226bd7' },
    { n: 2, sec: 'play', title: '10 תרגילים בכל שלב', sub: 'מקלידים את התשובה ולוחצים ✓', color: '#23874d' },
    { n: 3, sec: 'hint', title: 'טעיתם? מקבלים רמז', sub: 'דרך קצרה לחשב, והתרגיל חוזר בסוף', color: '#cf2f56' },
    { n: 4, sec: 'stars', title: 'כוכבים ושלב חדש', sub: 'כוכב אחד מספיק כדי לפתוח את הבא', color: '#e08a00' },
    { n: 5, sec: 'sheet', title: 'דף תרגול להדפסה', sub: '30 תרגילים ב-A4, עם עמוד תשובות', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the path: the real 14 stages in the real order (STAGES in src/learn/timesPath.js)
  const STAGES = [['1', 0], ['2', 0], ['10', 0], ['5', 0], ['🏕️', 1], ['3', 0], ['4', 0], ['9', 0], ['⛺', 1], ['6', 0], ['8', 0], ['7', 0], ['🏰', 1], ['🏆', 1]];
  const NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'A6', 'G6', 'E6'];
  const nodes = STAGES.map(([label, review], i) => ({ label, review, i, t: T(2, 1) + i * BEAT / 3, midi: m(NOTES[i]) }));
  const legend = [{ t: T(3, 0.5) }, { t: T(3, 1.25) }, { t: T(3, 2) }].map((l, i) => ({ ...l, i, midi: m(['G5', 'C6', 'E6'][i]) }));

  // 2. the game: keypad taps for 6 × 7 = 42 and 7 × 7 = 49
  const taps1 = [['4', T(4, 0.75)], ['2', T(4, 1.25)]].map(([k, t], i) => ({ k, t, i, midi: m(['E5', 'G5'][i]) }));
  const check1 = T(4, 1.75);
  const taps2 = [['4', T(5, 0.5)], ['9', T(5, 1)]].map(([k, t], i) => ({ k, t, i, midi: m(['E5', 'A5'][i]) }));
  const check2 = T(5, 1.5);
  const advance1 = T(4, 2.75); // 750 ms after a right answer the next question appears
  const playPills = [{ t: T(5, 2.5), midi: m('C6') }, { t: T(5, 3.5), midi: m('E6') }];

  // 3. a wrong answer: 7 × 8, typed 54, the hint is 5 × 8 + 2 × 8
  const wtaps = [['5', T(6, 0.5)], ['4', T(6, 1)]].map(([k, t], i) => ({ k, t, i, midi: m(['E5', 'G5'][i]) }));
  const wlines = [T(6, 2), T(6, 3), T(7, 0), T(7, 1.25)].map((t, i) => ({ t, i, midi: m(['C6', 'D6', 'E6', 'G6'][i]) }));

  // 4. the result: three stars, thresholds, the pass
  const starsT = [T(8, 1.5), T(8, 2.25), T(8, 3)].map((t, i) => ({ t, i, midi: m(['C6', 'E6', 'G6'][i]) }));
  const rules = [T(9, 0), T(9, 1), T(9, 2)].map((t, i) => ({ t, i, midi: m(['E5', 'G5', 'C6'][i]) }));
  const nextBtn = T(9, 3);

  // 5. the printable sheet (sheetQuestions(tables of "הלוח של 7", seed 77) from the real code) + answers
  const SHEET = [[7, 5, 35], [1, 7, 7], [6, 7, 42], [7, 4, 28], [9, 7, 63], [7, 10, 70], [7, 7, 49], [7, 3, 21], [7, 8, 56], [7, 2, 14], [6, 7, 42], [9, 7, 63], [7, 1, 7], [3, 7, 21], [7, 2, 14], [7, 8, 56], [5, 7, 35], [7, 4, 28], [7, 7, 49], [7, 10, 70], [7, 7, 49], [7, 6, 42], [4, 7, 28], [7, 1, 7], [7, 2, 14], [7, 3, 21], [10, 7, 70], [5, 7, 35], [7, 8, 56], [7, 9, 63]];
  const sheets = [{ t: T(10, 0.5), midi: m('E5') }, { t: T(10, 1.5), midi: m('G5') }];
  const sheetPills = [T(11, 0), T(11, 1.25), T(11, 2.5)].map((t, i) => ({ t, i, midi: m(['C6', 'E6', 'G6'][i]) }));
  const answerFill = T(10, 2); // the answers sheet writes its numbers, one row per 16th
  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, path: { t: T(2), sync: 'av' }, unlock: { t: ev.unlock, sync: 'a' },
    play: { t: T(4), sync: 'av' }, hint: { t: T(6), sync: 'v' },
    wrong: { t: ev.wrong, sync: 'av' }, stars: { t: T(8), sync: 'av' },
    sheet: { t: T(10), sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, STAGES, nodes, legend, taps1, check1, taps2, check2, advance1, playPills,
    wtaps, wlines, starsT, rules, nextBtn, SHEET, sheets, sheetPills, answerFill, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

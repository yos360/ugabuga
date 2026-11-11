// UGABUGA tutorial (16:9) — "ספר משלי" (/printables/my-book). Every label and fact comes from
// src/pages/printables/MyBookComic.jsx (PRESET_LABELS, BOOK_PRESETS, Field labels, style options, FoldSheet,
// BOOK_FAQ) and PrintableShell.jsx ("הדפסה או PDF", "חינם, בלי הרשמה"). Screens are real captures (shoot*.js).
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
  const S = { hook: [0, T(2)], topic: [T(2), T(5)], write: [T(5), T(8)], style: [T(8), T(11)], print: [T(11), T(14)], fold: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'C'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'F'], [12, 0, 4, 'C'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'Am'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. a ready topic: "חנוכה" fills the title and the six lines
    ringTopics: T(2, 1), tapHan: T(3, 0), ringText: T(3, 2), tipTopic: T(4, 0),
    // 2. the writer's name + one line per page
    tapName: T(5, 1), typed: T(5, 3), ringLines: T(6, 1), tipWrite: T(7, 0),
    // 3. four page looks, the preview follows
    sDraw: T(8, 1), sLines: T(9, 0), sWrite: T(9, 2), sComic: T(10, 0), tipStyle: T(10, 1.5),
    // 4. "הדפסה או PDF" — two A4 pages: the book + the fold guide
    ringPrint: T(11, 1), tapPrint: T(12, 0), ringPages: T(12, 2), tipPrint: T(13, 0),
    // 5. fold guide, row by row
    f1: T(14, 1), f2: T(14, 3), f3: T(15, 1), f4: T(15, 3), tipFold: T(16, 1),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'topic', title: 'בוחרים נושא', sub: 'עליי, סיפור, משפחה, חנוכה, חורף — או ספר ריק', color: '#cf2f56' },
    { n: 2, sec: 'write', title: 'כותבים שם ושורות', sub: 'בתיבה — שורה אחת לכל עמוד. שם הכותב/ת לא חובה', color: '#226bd7' },
    { n: 3, sec: 'style', title: 'איך נראה כל עמוד?', sub: 'רק ציור, ציור ו־2 שורות, כתיבה או קומיקס', color: '#e08a00' },
    { n: 4, sec: 'print', title: 'מדפיסים', sub: 'לוחצים "הדפסה או PDF" — ודף הוראות קיפול מצטרף לספר', color: '#23874d' },
    { n: 5, sec: 'fold', title: 'מקפלים וגוזרים', sub: 'גזירה אחת קטנה ובלי דבק — ויש ספר של 8 עמודים', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const STYLES = [['sDraw', 'shs1', '🎨 רק ציור'], ['sLines', 'shs2', '✏️ ציור ו־2 שורות'], ['sWrite', 'shs3', '📝 כתיבה'], ['sComic', 'shs4', '💬 קומיקס']];
  const CHIPS = [['🙋', 'עליי'], ['📖', 'סיפור'], ['🕎', 'חנוכה'], ['🌧️', 'חורף']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, STYLES, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

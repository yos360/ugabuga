// UGABUGA tutorial (16:9) — "צביעה במסך" on every coloring page (/printables/coloring/:subject/:n). Every label and fact
// comes from src/pages/printables/PhoneColoring.jsx and ColoringDrawing.jsx (screens are real captures of the live site).
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
  const S = { hook: [0, T(2)], open: [T(2), T(5)], colors: [T(5), T(8)], fill: [T(8), T(11)], undo: [T(11), T(14)], save: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'F'], [3, 0, 4, 'C'], [4, 0, 4, 'Dm'],
    [5, 0, 4, 'G'], [6, 0, 4, 'C'], [7, 0, 4, 'Am'], [8, 0, 4, 'F'], [9, 0, 4, 'G'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'C'], [14, 0, 4, 'G'], [15, 0, 4, 'Dm'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    ringH1: T(2, 0.75), ringOpen: T(3, 0), tapOpen: T(3, 1.5), tipOpen: T(3, 3),
    ringPalette: T(5, 0.5), tapBlue: T(6, 0.5), ringHint: T(6, 2), tipColors: T(7, 0),
    tapStar: T(8, 0.5), pickYellow: T(8, 2.5), tapMstar: T(9, 0), pickRed: T(9, 1.5), tapHeart: T(9, 2.5), tipFill: T(10, 0.5),
    pickBrown: T(11, 0.25), tapTable: T(11, 1), ringUndo: T(11, 3), tapUndo: T(12, 0.5), ringClear: T(12, 2.5), tipUndo: T(13, 0),
    more: T(14, 0.5), ringSave: T(14, 2.5), tapSave: T(15, 0.5), tipSave: T(15, 1.5),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'open', title: 'פותחים ציור', sub: 'בוחרים ציור לצביעה ולוחצים על "לצבוע את הציור במסך"', color: '#226bd7' },
    { n: 2, sec: 'colors', title: 'בוחרים צבע', sub: 'מקישים על אחד הצבעים בתחתית המסך', color: '#23874d' },
    { n: 3, sec: 'fill', title: 'מקישים על אזור', sub: 'האזור נצבע כולו בהקשה אחת', color: '#cf2f56' },
    { n: 4, sec: 'undo', title: 'טעיתם? ביטול', sub: 'ביטול מחזיר צעד אחורה, ומהתחלה מנקה את הציור', color: '#e08a00' },
    { n: 5, sec: 'save', title: 'שומרים את הציור', sub: 'הציור הצבוע נשמר כתמונה, או משותף מהטלפון', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🎨', '16 צבעים'], ['👆', 'הקשה וצובעים'], ['↩️', 'ביטול'], ['💾', 'שמירה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

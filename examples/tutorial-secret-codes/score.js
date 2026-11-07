// UGABUGA tutorial (16:9) — "כתב סתרים וצפנים" (/tools/secret-codes). Every label, count and fact comes from
// src/pages/tools/SecretCodes.jsx, SecretCodeSheets.jsx and src/data/secretCodes.js (screens are real captures of the live site).
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
  const S = { hook: [0, T(2)], cipher: [T(2), T(5)], write: [T(5), T(8)], decode: [T(8), T(11)], mission: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'],
    [5, 0, 4, 'F'], [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'Am'], [9, 0, 4, 'F'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'C'], [12, 0, 4, 'G'], [13, 0, 4, 'Am'], [14, 0, 4, 'F'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    ringCiphers: T(2, 1), ringShift: T(3, 0), tapK3: T(3, 1.5), tipCipher: T(3, 2.5),
    ringTa: T(5, 1), type: T(5, 2), ringOut: T(6, 0.5), tipWrite: T(6, 2), tapCopy: T(7, 0.5),
    ringDec: T(8, 1), tapDec: T(8, 2.5), ringOut2: T(9, 0.5), tipDec: T(9, 2),
    ringMsg: T(11, 1), tapHint: T(11, 3), tipMis: T(12, 0), typeAns: T(12, 2), tapCheck: T(13, 0.5),
    ringAll: T(14, 1), tipPrint: T(14, 2), tapAll: T(15, 1),
    logo: T(17, 0),
  };
  const steps = [
    { n: 1, sec: 'cipher', title: 'בוחרים צופן', sub: 'האות הבאה, מספר במקום אות, א״ת ב״ש או כתב מראה', color: '#226bd7' },
    { n: 2, sec: 'write', title: 'כותבים הודעה', sub: 'ההודעה הסודית מופיעה מיד, ומעתיקים אותה בלחיצה', color: '#cf2f56' },
    { n: 3, sec: 'decode', title: 'מפענחים', sub: 'לוחצים "לפענח", מדביקים הודעה מוצפנת ורואים מה כתוב בה', color: '#8a4fd8' },
    { n: 4, sec: 'mission', title: 'משימת פיצוח', sub: 'חמש הודעות לפצח. כותבים מה כתוב ולוחצים "בדיקה"', color: '#23874d' },
    { n: 5, sec: 'print', title: 'מדפיסים דפים', sub: 'דפי "פענחו את ההודעה" מהגן ועד כיתה ו׳, והפתרונות בדף נפרד', color: '#e08a00' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['➡️', 'האות הבאה'], ['🔢', 'מספר במקום אות'], ['🔁', 'א״ת ב״ש'], ['🪞', 'כתב מראה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

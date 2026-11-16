// UGABUGA tutorial (16:9) — "הגרלת גמד וענק" (/secret-friend), shown in Hanukkah mode.
// Every label and fact comes from src/pages/tools/group/SecretFriend.jsx and src/utils/groupTools.js
// (modes גמד וענק / משלוח מנות לפורים / מתנות לחנוכה, "שם בכל שורה, 3–60", "מי לא יגרילו זה את זה?", "תקציב" + "מתי מגלים?" (לא חובה),
// "🎲 הגרלה עם קישור אישי לכל אחד", "📱 שליחה", "N/8 גילו", "אתם לא רואים מי הגריל את מי", "🎁 גלו את מי הגרלתם",
// "אתם קונים מתנת חנוכה ל:", "🖨️ פתקים מוגרלים להדפסה", "✂️ פתקי שמות לשליפה מכובע", fold "הכתב פנימה", "בחינם, בלי הרשמה").
// Real captures (shoot.js, Supabase answers mocked). Event names are kept so song.js stays in sync.
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
  const S = { hook: [0, T(2)], pick: [T(2), T(5)], answer: [T(5), T(8)], check: [T(8), T(11)], fresh: [T(11), T(14)], print: [T(14), T(17)], end: [T(17), DURATION] };
  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
    Em: { notes: ['E3', 'G3', 'B3'], bass: 'E2' }, Fmaj7: { notes: ['E3', 'A3', 'C4'], bass: 'F1' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'Am'], [3, 0, 4, 'F'], [4, 0, 4, 'C'],
    [5, 0, 4, 'G'], [6, 0, 4, 'Am'], [7, 0, 4, 'F'], [8, 0, 4, 'Fmaj7'], [9, 0, 4, 'Em'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'Dm'], [14, 0, 4, 'G'], [15, 0, 4, 'C'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'G'], [20, 0, 4, 'Cadd9'],
  ]);
  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    // 1. open: ring the kinds, tap "כיתה", the name, tap open
    ringChips: T(2, 2), ringSix: T(3, 0.5), tipSix: T(3, 1.5), tipTen: T(4, 1),
    // 2. ready → WhatsApp, then the organizer card
    ringGrid: T(5, 0.5), type1: T(5, 2), tipMix: T(5, 3), type2: T(6, 2), tipPhone: T(7, 0),
    // 3. light: name, idea → wish, light button
    ringCheck: T(8, 0.5), tapCheck: T(8, 2), swap: T(8, 2.6), ringRed: T(9, 1), ringScore: T(9, 3), tipNote: T(10, 1.5),
    // 4. the hanukkiah fills, then the list
    ringFresh: T(11, 1), tapFresh: T(11, 3), swapFresh: T(12, 0.5), tipFresh: T(12, 1.5), tipTeach: T(13, 0.5),
    // 5. night chips → night 1 (+4) → its list
    ringPrint: T(14, 0.5), tapPrint: T(14, 1.5), swapPr: T(14, 2), tipPages: T(14, 3), swapAns: T(15, 3), tipAns: T(16, 0), ringPdf: T(16, 1.5),
    logo: T(17, 0),
  };
  ev.missSwap = T(9, 2); ev.okSwap = T(10, 1.5);
  const steps = [
    { n: 1, sec: 'pick', title: 'בוחרים סוג הגרלה', sub: 'גמד וענק, משלוח מנות לפורים|או מתנות לחנוכה', color: '#cf2f56' },
    { n: 2, sec: 'answer', title: 'כותבים את השמות', sub: 'שם בכל שורה, ומסמנים|מי לא יגרילו זה את זה', color: '#226bd7' },
    { n: 3, sec: 'check', title: 'מגרילים ושולחים', sub: 'כל אחד מקבל קישור אישי,|ושולחים לו בוואטסאפ בפרטי', color: '#23874d' },
    { n: 4, sec: 'fresh', title: 'כל אחד מגלה בסוד', sub: 'פותחים את הקישור האישי|ולוחצים „גלו את מי הגרלתם”', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'בכיתה בלי טלפונים?', sub: 'פתקים מוגרלים להדפסה:|גוזרים, מקפלים ומחלקים', color: '#8a4fd8' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));
  const CHIPS = [['🧙', 'גמד וענק'], ['🎭', 'משלוח מנות'], ['🕎', 'מתנות לחנוכה']];
  const endLines = [{ t: T(17, 0.75) }, { t: T(17, 1.5) }, { t: T(17, 2.25) }, { t: T(17, 3) }, { t: T(18, 0.5) }];
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, steps, CHIPS, endLines, markers: {} };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

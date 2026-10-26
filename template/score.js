// UGABUGA "נוסעים עם בוגה" (9:16 Reel). The real travel section of the site: the A4 travel kit,
// road bingo (board 1 of the site's road set), games for waiting in line, the "כמה עוד נשאר?" timer,
// and the extras (passport, surprise envelopes, רדיו בוגה, the offline flight bag). One timeline.
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
    hook: [0, T(2)], kit: [T(2), T(4)], bingo: [T(4), T(6)], wait: [T(6), T(8)],
    timer: [T(8), T(10)], more: [T(10), T(12)], end: [T(12), DURATION],
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
    q1: T(0, 0), q2: T(0, 2), // "כמה עוד נשאר?!" asked twice
    title: T(1, 0), free: T(1, 2.5),
    make: T(3, 2), // "יצירת ערכה" pressed → pages fan out
    bingo: T(5, 1), // the middle row is complete
    go: T(8, 1), arrive: T(9, 3),
    logo: T(12, 0),
  };
  const hookPills = [['🚗', 'רכב'], ['✈️', 'מטוס'], ['🚆', 'רכבת']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'kit', title: 'ערכת טיסה ונסיעה', sub: 'חוברת A4 אישית לפי גיל ומשך הנסיעה', color: '#226bd7' },
    { n: 2, sec: 'bingo', title: 'בינגו לדרך', sub: 'דרכים, טיסה ורכבת, במסך או על נייר', color: '#cf2f56' },
    { n: 3, sec: 'wait', title: 'משחקים לתור ולמסעדה', sub: '28 משחקים קטנים, רובם בלי שום ציוד', color: '#8a4fd8' },
    { n: 4, sec: 'timer', title: 'כמה עוד נשאר?', sub: 'טיימר מצויר לנסיעה, גם בלי אינטרנט', color: '#e08a00' },
    { n: 5, sec: 'more', title: 'ועוד לדרך', sub: 'זיכרונות, הפתעות וסיפורים לשמיעה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the kit form: age, length, vehicle (the site's own options), then the 15-page booklet
  const AGES = ['2–3', '4–5', '6–7', '8–10'];
  const DURS = ['עד שעה', '\u20661–3\u2069 שעות', 'טיסה או נסיעה ארוכה'];
  const VEH = ['רכב', 'מטוס', 'רכבת'];
  const picks = [{ row: 0, k: 2, t: T(2, 1.5) }, { row: 1, k: 2, t: T(2, 2.5) }, { row: 2, k: 1, t: T(3, 0) }].map((p, i) => ({ ...p, i, midi: m(['D5', 'F#5', 'A5'][i]) }));
  // kitPlan(age 6–7, long) on the site: cover + 14 pages
  const PAGE_TITLES = ['זמן לצבוע', 'הדרך במבוך', 'חברו את הנקודות', 'מצאו את ההבדלים', 'מילים מסתתרות', 'סודוקו לדרך', 'מציירים לפי הוראות'];
  const pages = ['כריכה'].concat(PAGE_TITLES).map((title, i) => ({ title, i, t: ev.make + i * BEAT / 4, midi: m(['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'][i]) }));

  // 2. road bingo, board 1 (bingoBoards('road', 3)[0]); marks on beats, the middle row completes
  const BINGO = [['🚚', 'משאית'], ['🌉', 'גשר'], ['🏠', 'בית'], ['🏍️', 'אופנוע'], ['🚒', 'כבאית'], ['🐄', 'פרה'], ['🚜', 'טרקטור'], ['🚏', 'תחנת אוטובוס'], ['🚧', 'עבודות בדרך']];
  const marks = [0, 4, 8, 3, 5].map((cell, i) => ({ cell, i, t: T(4, 1 + i * 0.75), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const ROW = [3, 4, 5];

  // 3. waiting games (the site's own cards), places cycle, one card per 2 beats
  const PLACES = ['בתור', 'במסעדה', 'בשדה התעופה'];
  const placeTaps = PLACES.map((s, i) => ({ s, i, t: T(6, 0.75 + i * 0.5), midi: m(['A5', 'B5', 'D6'][i]) }));
  const games = [
    ['🪞', 'מראה שקטה', 'אחד עושה תנועה קטנה בידיים, והשני מחקה אותה כמו מראה.', 'מגיל 2 · שקט'],
    ['🎨', 'צבע בעיניים', 'מחפשים בעיניים שלושה דברים באותו צבע. מצביעים בלי לקום.', 'מגיל 2 · שקט'],
    ['😜', 'פנים מצחיקות', 'כל אחד בתורו עושה הבעה קטנה, והשני מנחש את הרגש.', 'מגיל 2 · שקט'],
  ].map(([e, title, note, tag], i) => ({ e, title, note, tag, i, t: T(6, 2.5 + i * 1.5), midi: m(['F#5', 'A5', 'D6'][i]) }));

  // 4. the countdown: 90 minutes, time-lapsed, the car drives the drawn route and arrives
  const MINUTES = 90;
  const progress = (t) => U.clamp((t - ev.go) / (ev.arrive - ev.go));
  const timerTicks = []; for (let i = 0; i < 11; i++) timerTicks.push(ev.go + i * BEAT / 2 * 1.0);

  // 5. the extras, one per beat
  const extras = [
    ['🛂', 'הדרכון שלי', 'חותמות, טעמים וציור מכל מקום חדש'],
    ['✉️', 'מעטפות הפתעה', 'פעילות קטנה לכל שעה, בלי לקנות מתנות'],
    ['📻', 'רדיו בוגה', 'סיפורים ברצף לשמיעה בדרך'],
    ['💼', 'תיק טיסה', 'נשמר בטלפון ועובד גם במצב טיסה'],
  ].map(([e, title, note], i) => ({ e, title, note, i, t: T(10, 0.5 + i * 0.75 + (i > 1 ? 0.75 : 0)), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, kit: { t: T(2), sync: 'av' }, make: { t: ev.make, sync: 'av' },
    bingo: { t: T(4), sync: 'v' }, line: { t: ev.bingo, sync: 'av' }, wait: { t: T(6), sync: 'av' },
    timer: { t: T(8), sync: 'av' }, arrive: { t: ev.arrive, sync: 'av' }, more: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, AGES, DURS, VEH, picks, pages, BINGO, marks, ROW, PLACES, placeTaps, games,
    MINUTES, progress, timerTicks, extras, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

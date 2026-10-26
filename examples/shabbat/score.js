// UGABUGA Shabbat reel (9:16): candle lighting → this week's parasha (Lech Lecha) → the printable
// quiz → the Shabbat pack → more for Shabbat. All facts from the site's own data (times via its
// shabbatTimes util for Fri 23.10.2026). One timeline for music and picture.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 112, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(14) + 1.5; // ≈ 31.6s

  const S = {
    hook: [0, T(2)], times: [T(2), T(4)], parasha: [T(4), T(6)], quiz: [T(6), T(8)],
    pack: [T(8), T(10)], more: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    D: { notes: ['F#3', 'A3', 'D4'], bass: 'D2' }, A: { notes: ['E3', 'A3', 'C#4'], bass: 'A1' },
    Bm: { notes: ['F#3', 'B3', 'D4'], bass: 'B1' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Em7: { notes: ['G3', 'B3', 'D4'], bass: 'E2' }, Asus: { notes: ['E3', 'A3', 'D4'], bass: 'A1' },
    Dadd9: { notes: ['F#3', 'A3', 'D4', 'E4'], bass: 'D2' },
  }, [
    [0, 0, 4, 'D'], [1, 0, 4, 'G'], [2, 0, 4, 'D'], [3, 0, 4, 'A'], [4, 0, 4, 'Bm'], [5, 0, 4, 'G'],
    [6, 0, 4, 'D'], [7, 0, 4, 'A'], [8, 0, 4, 'G'], [9, 0, 2, 'Asus'], [9, 2, 2, 'A'],
    [10, 0, 4, 'Em7'], [11, 0, 4, 'A'], [12, 0, 4, 'D'], [13, 0, 4, 'G'], [14, 0, 4, 'Dadd9'],
  ]);

  const ev = {
    hook1: T(0, 0), hook2: T(0, 2), candle1: T(1, 0), candle2: T(1, 1), parashaPill: T(1, 2),
    quizPrint: T(7, 0), logo: T(12, 0),
  };

  const steps = [
    { n: 1, sec: 'times', title: 'כניסת שבת בעיר שלכם', sub: 'הדלקת נרות לשבת פרשת לך לך, לפי עיר', color: '#e08a00' },
    { n: 2, sec: 'parasha', title: 'פרשת לך לך לילדים', sub: 'מה קורה בפרשה, בשפה של ילדים', color: '#226bd7' },
    { n: 3, sec: 'quiz', title: 'בלשי הפרשה: חידון להדפסה', sub: 'חידון מלא של 10 שאלות, ודף תשובות למורה', color: '#cf2f56' },
    { n: 4, sec: 'pack', title: 'חבילת שבת: 5 דפי A4', sub: 'מדפיסים וגוזרים לפני שבת, משחקים בשבת', color: '#8a4fd8' },
    { n: 5, sec: 'more', title: 'ועוד לשבת', sub: 'משחקים, קליעת חלה ושאלה לשולחן', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. candle-lighting times (site's shabbatTimes, Fri 23.10.2026), one city per beat
  const cities = [['ירושלים', '17:18'], ['תל אביב', '17:37'], ['חיפה', '17:28'], ['באר שבע', '17:40']]
    .map(([name, time], i) => ({ name, time, i, t: T(2, 0.5 + i * 0.75), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const havdala = { t: T(3, 3), text: 'צאת השבת בירושלים: 18:35', midi: m('E6') };

  // 2. the parasha in three lines (from the site's summary)
  const story = [['🐪', 'אברם יוצא לארץ כנען'], ['🤝', 'נפרד מלוט כדי שלא יהיו מריבות'], ['⭐', 'מקבל שם חדש: אברהם']]
    .map(([e, text], i) => ({ e, text, i, t: T(4, 1 + i * 1.25), midi: m(['A4', 'D5', 'F#5'][i]) }));
  const starsT = T(5, 3); // "count the stars" sparkle (Gen 15:5)

  // 3. quiz questions (from the site's quiz), one per beat, then the printer
  const questions = ['לאיזו ארץ מגיע אברם?', 'מדוע הוא יורד למצרים?', 'את מי אברם מציל מן השבי?', 'מהם השמות החדשים של אברם ושרי?']
    .map((q, i) => ({ q, i, t: T(6, 0.5 + i * 0.75), midi: m(['D5', 'E5', 'F#5', 'A5'][i]) }));
  const sheets = [{ label: 'דף לתלמיד', t: T(7, 0.5) }, { label: 'דף תשובות', t: T(7, 1.5) }].map((s, i) => ({ ...s, i, midi: m(['F#5', 'A5'][i]) }));

  // 4. the five pages of the Shabbat pack fan out, one per beat-ish
  const packPages = [['🔎', 'חידון שבועי'], ['🔤', 'אותיות'], ['🗂️', 'קטגוריות'], ['🧩', 'חידות'], ['🎭', 'מי אני?']]
    .map(([e, label], i) => ({ e, label, i, t: T(8, 0.5 + i * 0.75), midi: m(['D5', 'E5', 'F#5', 'A5', 'B5'][i]) }));
  const scissors = T(9, 3);

  // 5. more for Shabbat
  const more = [['🎲', 'משחקים לשבת בלי חשמל'], ['🍞', 'קליעת חלה מ־3, 4 ו־6 רצועות']]
    .map(([e, label], i) => ({ e, label, i, t: T(10, i * 1.5 + 0.25), midi: m(['A5', 'D6'][i]) }));
  const question = { t: T(11, 0), text: 'איך אפשר לפתור מריבה בלי להתעקש לקבל תמיד את הבחירה הראשונה?', midi: m('F#5') };

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.hook1, sync: 'a' }, candle1: { t: ev.candle1, sync: 'a' },
    times: { t: T(2), sync: 'av' }, parasha: { t: T(4), sync: 'av' }, quiz: { t: T(6), sync: 'av' },
    pack: { t: T(8), sync: 'av' }, more: { t: T(10), sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, steps, cities, havdala, story, starsT, questions, sheets, packPages, scissors, more, question, endLines };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

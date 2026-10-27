// UGABUGA "העוגה נעלמה!" — חדרי בריחה BUGA (9:16 Reel). Everything is the real /tools/escape-rooms page:
// 42 rooms (escapeRoomsExpanded.js), the 3 levels (ESCAPE_LEVELS), the real "תעלומת העוגה הנעלמת" room at
// the easy level (6 steps), its balloon code, the stars step with its two graded hints, and the print kit
// (facilitator sheet + an A4 card per step = 7 pages). One timeline.
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
    hook: [0, T(2)], rooms: [T(2), T(4)], levels: [T(4), T(6)], solve: [T(6), T(8)],
    hints: [T(8), T(10)], kit: [T(10), T(12)], end: [T(12), DURATION],
  };

  // a slightly mysterious minor groove (A minor → C → G → F)
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['F3', 'A3', 'D4'], bass: 'D2' }, Esus: { notes: ['E3', 'A3', 'B3'], bass: 'E2' },
    E: { notes: ['E3', 'G#3', 'B3'], bass: 'E2' }, Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'Am'], [1, 0, 4, 'F'], [2, 0, 4, 'C'], [3, 0, 4, 'G'], [4, 0, 4, 'Am'], [5, 0, 4, 'F'],
    [6, 0, 4, 'Dm'], [7, 0, 4, 'G'], [8, 0, 4, 'Am'], [9, 0, 2, 'Esus'], [9, 2, 2, 'E'],
    [10, 0, 4, 'F'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), // "המסיבה מוכנה… אבל העוגה" → "נעלמה!"
    title: T(1, 0), free: T(1, 2.5),
    pick: T(3, 3), // the lost-cake room is chosen
    type: T(7, 0), check: T(7, 1), // "4" typed → "בדקו תשובה" → the lock opens
    solved: T(9, 3), // the stars step solved after the hints
    logo: T(12, 0),
  };
  // the site's collections (escapeCollections.js)
  const hookPills = [['🧸', 'לגן'], ['🏫', 'לכיתה'], ['🥂', 'למבוגרים']].map(([e, s], i) => ({ e, s, i, t: T(1, 1 + i * 0.5), midi: m(['C5', 'E5', 'A5'][i]) }));

  const steps = [
    { n: 1, sec: 'rooms', title: 'בוחרים חדר', sub: '42 חדרים לפי גיל ואירוע', color: '#226bd7' },
    { n: 2, sec: 'levels', title: 'בוחרים רמת קושי', sub: 'בהמשך המנעולים נעשים מורכבים יותר', color: '#8a4fd8' },
    { n: 3, sec: 'solve', title: 'פותרים על המסך', sub: 'כותבים תשובה, והמנעול נפתח', color: '#cf2f56' },
    { n: 4, sec: 'hints', title: 'נתקעתם? רמז!', sub: 'הרמזים מדורגים, אחד בכל פעם', color: '#e08a00' },
    { n: 5, sec: 'kit', title: 'או מדפיסים קיט', sub: 'דף מנחה + כרטיס A4 לכל שלב', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. setting chips (the site's SETTING_LABELS) + four real birthday rooms (tags.settings has 'birthday')
  const SETTINGS = ['🎂 יום הולדת', '🏫 כיתה', '🕎 חגים', '🤝 גיבוש'];
  const settingTap = { t: T(2, 1), midi: m('E5') };
  const ROOMS = [
    ['🎂', 'תעלומת העוגה הנעלמת', 'ילדים', '⁦10–15⁩ דקות'],
    ['🏴‍☠️', 'תיבת האוצר של הפיראט', 'ילדים ⁦4-8⁩', '⁦15-20⁩ דקות'],
    ['⚽', 'חדר ההלבשה לפני הגמר', 'ילדים ונוער', '⁦15–20⁩ דקות'],
    ['👻', 'הבית ה"רדוף"', 'נוער ומבוגרים ⁦13+⁩', '⁦30-40⁩ דקות'],
  ].map(([e, title, aud, dur], i) => ({ e, title, aud, dur, i, t: T(2, 2 + i * 0.75), midi: m(['A4', 'C5', 'E5', 'A5'][i]) }));

  // 2. ESCAPE_LEVELS, one card per beat, then one tap per level; the lock row follows the step count
  const LEVELS = [
    ['קל', '6 שלבים · חישוב קצר ורמזים בהדרגה', 6],
    ['בינוני', '8 שלבים · מספר פעולות ופענוח קודים', 8],
    ['קשה', '10 שלבים · חידות משולבות והסקת מסקנות', 10],
  ].map(([label, detail, count], i) => ({ label, detail, count, i, t: T(4, 0.5 + i), midi: m(['A4', 'C5', 'E5'][i]) }));
  const levelTaps = [0, 1, 2].map((k, i) => ({ k, i, t: T(5, i), midi: m(['C5', 'E5', 'A5'][i]) }));

  // 3. the lost-cake room at the easy level, step 2 of 6 ("קוד הבלונים")
  const ROOM = { e: '🎂', title: 'תעלומת העוגה הנעלמת', aud: 'ילדים', diff: 'קל', dur: '⁦10–15⁩ דקות', total: 6 };
  const BALLOON_STORY = 'יש 2 בלונים אדומים, 4 בלונים כחולים ובלון ירוק אחד. הקוד הוא מספר הבלונים הכחולים.';
  const balloons = ['red', 'red', 'blue', 'blue', 'blue', 'blue', 'green'].map((c, i) => ({ c, i, t: T(6, 1) + i * BEAT / 2, midi: m(['A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6'][i]) }));

  // 4. step 3: the stars, with the step's own two hints
  const STAR_STORY = 'על הדלת של “תעלומת העוגה הנעלמת” מצוירים כוכבים. כמה כוכבים יש?';
  const HINTS = ['הצביעו על כל כוכב ותגידו מספר בקול.', 'מתחילים מ־1 וממשיכים עד הכוכב האחרון.'];
  const hintTaps = [T(8, 2), T(9, 0)].map((t, i) => ({ t, i, midi: m(['E5', 'A5'][i]) }));
  const counts = [0, 1, 2, 3].map((k) => ({ k, t: T(9, 1) + k * BEAT / 2, midi: m(['C5', 'E5', 'G5', 'C6'][k]) }));

  // 5. the print kit at the easy level: facilitator sheet + 6 stage cards
  const KIT_TITLES = ['הרמז שעל השולחן', 'קוד הבלונים', 'ספירת הכוכבים', 'המנעול הצבעוני', 'המפתחות בסל', 'הדלת למטבח'];
  const pages = ['דף מנחה'].concat(KIT_TITLES).map((title, i) => ({ title, i, t: T(10, 1) + i * BEAT / 4, midi: m(['A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6'][i]) }));
  const kitPill = { t: pages[6].t + BEAT };

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, rooms: { t: T(2), sync: 'av' }, pick: { t: ev.pick, sync: 'av' },
    levels: { t: T(4), sync: 'av' }, solve: { t: T(6), sync: 'av' }, check: { t: ev.check, sync: 'av' },
    hints: { t: T(8), sync: 'av' }, solved: { t: ev.solved, sync: 'av' }, kit: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookPills, steps, SETTINGS, settingTap, ROOMS, LEVELS, levelTaps, ROOM, BALLOON_STORY, balloons,
    STAR_STORY, HINTS, hintTaps, counts, pages, kitPill, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

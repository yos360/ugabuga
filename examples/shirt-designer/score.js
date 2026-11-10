// UGABUGA "איזו חולצה הכי יפה? 1, 2 או 3" (9:16 Reel). The shirt designer (/tools/shirt-designer,
// src/pages/tools/ShirtDesigner.jsx + shirtArt.jsx). The three hook shirts are real presets of the page (סוף מסלול,
// סיום כיתה ו׳, סיום גן) captured from the live site by shoot.js; the viewer picks one in the comments, no answer shown.
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
    hook: [0, T(2)], aud: [T(2), T(4)], topics: [T(4), T(6)], modes: [T(6), T(8)],
    play: [T(8), T(10)], print: [T(10), T(12)], end: [T(12), DURATION],
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
    logo: T(12, 0),
  };
  // hook: three real presets, numbered 1/2/3 (right to left)
  const hookOpts = [['maslul', '1'], ['six', '2'], ['gan', '3']].map(([k, s], i) => ({ k, s, i, t: T(1, 0.2 + i * 0.7), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'בוחרים אירוע', sub: 'סוף מסלול, כומתה, י״ב, כיתה ו׳ או גן', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'בוחרים ציור', sub: '44 ציורים מקוריים שצוירו במיוחד לאתר', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'כותבים מה שרוצים', sub: '4 פריסות, 10 משפטים מוכנים, 4 גופנים', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'בוחרים צבעים', sub: '12 צבעי חולצה, צבע ראשי וצבע משני', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'שמות על הגב', sub: 'ומורידים קובץ מוכן לבית הדפוס', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the 9 occasions (PRESETS labels), then three taps
  const OCC = ['🪖 סוף מסלול וטירונות', '🎖️ סיום קורס', '🥾 מסע כומתה', '❤️ הורים גאים', '🎓 סיום י״ב', '🏫 סיום כיתה ו׳', '🎈 סיום גן', '🏕️ תנועת נוער', '⛰️ מכינה ושנת שירות'];
  const AUD = OCC.map((label, i) => ({ label, i, t: T(2, 0.4 + i * 0.22), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6', 'B5', 'A5', 'F#5', 'D5'][i]) }));
  // taps on an occasion chip → the shirt changes to that preset (shot key)
  const OCC_TAPS = [{ i: 2, k: 'beret', t: T(3, 0) }, { i: 4, k: 'yb', t: T(3, 1.3) }, { i: 3, k: 'parents', t: T(3, 2.6) }];

  // 2. drawing categories (ICON_CATS) → animals → lion → eagle
  const CATS = ['🎖️ צבא', '🦁 חיות', '⭐ סמלים', '🎓 בית ספר ותנועה'];
  const TOPICS = CATS.map((label, i) => ({ label, i, t: T(4, 0.3 + i * 0.35), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const ART_TAPS = [{ k: 'cat', t: T(4, 2.2) }, { k: 'lion', t: T(5, 0.4) }, { k: 'eagle', t: T(5, 1.8) }];

  // 3. layouts (LAYOUTS), typed title, a ready slogan, a font (FONTS)
  const LAYOUTS = ['⭕ סמל עגול', '🛡️ מגן עם סרט', '🔠 כותרת גדולה', '📜 גב עם שמות'];
  const MODES = LAYOUTS.map((label, i) => ({ label, i, t: T(6, 0.3 + i * 0.3), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const FONTS = ['רגיל', 'עגול', 'כתב יד', 'סת״ם'];
  const TEXT_TAPS = [{ k: 'shield', t: T(6, 2) }, { k: 'title', t: T(7, 0.4) }, { k: 'slogan', t: T(7, 1.6) }, { k: 'hand', t: T(7, 2.8) }];
  const TYPE = { t0: T(6, 2.9), t1: T(7, 0.3), text: 'פלוגה ג׳' };

  // 4. the 12 shirt colours (SHIRTS)
  const SHIRTS = ['#ffffff', '#111111', '#3f4a2a', '#1e3a8a', '#6b7280', '#7f1d1d', '#5b21b6', '#78350f', '#0ea5e9', '#fde047', '#14532d', '#be185d'];
  const sheetItems = SHIRTS.map((c, i) => ({ c, i, t: T(8, 0.3 + i * 0.13), midi: m(['D5', 'F#5', 'A5', 'B5'][i % 4]) }));
  const COLOR_TAPS = [{ k: 'bordeaux', sw: 5, t: T(8, 2.6) }, { k: 'black', sw: 1, t: T(9, 0.6) }, { k: 'one', sw: -1, t: T(9, 2) }];

  // 5. names on the back + downloads
  const NAMES_T = T(10, 0.2);
  const DL = T(11, 0); // tap on "הורדת PNG שקוף לבית הדפוס"
  const extras = [{ t: T(10, 1.6) }, { t: T(11, 1.2) }, { t: T(11, 2.4) }];

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(12, 3) }, { t: T(13, 0.5) }, { t: T(13, 1.5) }];

  // every tap in the film (pop + thud in song.js)
  const taps = [...OCC_TAPS, ...ART_TAPS, ...TEXT_TAPS, ...COLOR_TAPS].map((x) => x.t).concat([DL]);
  // every pill pop that gets a pop + marimba in song.js
  const pills = [T(3, 3.4), T(5, 3), T(7, 3.4), T(9, 3), extras[0].t, extras[1].t, extras[2].t];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: DL, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, OCC_TAPS, TOPICS, ART_TAPS, MODES, FONTS, TEXT_TAPS, TYPE, sheetItems, COLOR_TAPS,
    NAMES_T, DL, extras, endLines, taps, pills,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

// UGABUGA tutorial (16:9, landscape) — "מקלדת עברית אונליין" (/tools/keyboard). Every label, key and
// option comes from src/office/keys/OnlineKeyboard.jsx, virtualKeys.js, EmojiPicker.jsx / emojiData.js
// and src/typing/typingData.js (finger colours). One timeline: hook → 5 steps → end card.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '16:9';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.15 });
  const { T, BEAT, BAR } = clock;
  const DURATION = T(19) + 1.0; // ≈ 39.2s

  const S = {
    hook: [0, T(2)], type: [T(2), T(5)], niqqud: [T(5), T(8)], symbols: [T(8), T(11)],
    fingers: [T(11), T(14)], send: [T(14), T(17)], end: [T(17), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm7: { notes: ['F3', 'A3', 'C4'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' },
    Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'],
    [2, 0, 4, 'C'], [3, 0, 4, 'Am'], [4, 0, 4, 'F'],
    [5, 0, 4, 'C'], [6, 0, 4, 'G'], [7, 0, 4, 'Am'],
    [8, 0, 4, 'F'], [9, 0, 4, 'C'], [10, 0, 2, 'Gsus'], [10, 2, 2, 'G'],
    [11, 0, 4, 'Am'], [12, 0, 4, 'F'], [13, 0, 4, 'G'],
    [14, 0, 4, 'C'], [15, 0, 4, 'Dm7'], [16, 0, 2, 'Gsus'], [16, 2, 2, 'G'],
    [17, 0, 4, 'C'], [18, 0, 4, 'F'], [19, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(1, 0), free: T(1, 2.5),
    hint: T(4, 0), // step 1: "A כותב ש׳"
    remove: T(7, 2), // step 2: "הסרת ניקוד" appears
    emojiBtn: T(9, 0.5), search: T(9, 1.5), cake: T(10, 1),
    fingersOn: T(11, 1), course: T(13, 1),
    copy: T(14, 2), wa: T(15, 1.5), saved: T(16, 0.5),
    logo: T(17, 0),
  };

  const steps = [
    { n: 1, sec: 'type', title: 'מקלידים עברית', sub: 'בוחרים „עברית” ומקלידים במקלדת הרגילה — גם במחשב בלי עברית', color: '#226bd7' },
    { n: 2, sec: 'niqqud', title: 'מוסיפים ניקוד', sub: 'כותבים אות ולוחצים על סימן הניקוד שמתחת למקלדת', color: '#cf2f56' },
    { n: 3, sec: 'symbols', title: 'סימנים ואימוג׳ים', sub: '₪, גרשיים ומקף עברי, ואימוג׳ים עם חיפוש בעברית', color: '#8a4fd8' },
    { n: 4, sec: 'fingers', title: 'צבעי אצבעות', sub: 'כל מקש נצבע בצבע של האצבע שלוחצת עליו', color: '#23874d' },
    { n: 5, sec: 'send', title: 'מעתיקים ושולחים', sub: 'העתקה, וואטסאפ, חיפוש בגוגל או שמירה כקובץ', color: '#e08a00' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // ---- the site's keyboard (virtualKeys.js: Israeli layout SI-1452) ----
  const NUM = [['Backquote', ';'], ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'], ['Digit0', '0'], ['Minus', '-'], ['Equal', '=']];
  const HE_ROWS = [
    NUM,
    [['KeyQ', '/'], ['KeyW', "'"], ['KeyE', 'ק'], ['KeyR', 'ר'], ['KeyT', 'א'], ['KeyY', 'ט'], ['KeyU', 'ו'], ['KeyI', 'ן'], ['KeyO', 'ם'], ['KeyP', 'פ'], ['BracketLeft', ']'], ['BracketRight', '['], ['Backslash', '\\']],
    [['KeyA', 'ש'], ['KeyS', 'ד'], ['KeyD', 'ג'], ['KeyF', 'כ'], ['KeyG', 'ע'], ['KeyH', 'י'], ['KeyJ', 'ח'], ['KeyK', 'ל'], ['KeyL', 'ך'], ['Semicolon', 'ף'], ['Quote', ',']],
    [['KeyZ', 'ז'], ['KeyX', 'ס'], ['KeyC', 'ב'], ['KeyV', 'ה'], ['KeyB', 'נ'], ['KeyN', 'מ'], ['KeyM', 'צ'], ['Comma', 'ת'], ['Period', 'ץ'], ['Slash', '.']],
  ];
  // special keys: [label, width in key units]; every row adds up to 15 (OnlineKeyboard.jsx MOD)
  const MOD = {
    Backspace: ['⌫', 2], Tab: ['Tab', 1.5], CapsLock: ['Caps', 1.75], Enter: ['Enter ↵', 2.25],
    ShiftLeft: ['⇧ Shift', 2.25], ShiftRight: ['⇧ Shift', 2.75], Lang: ['🌐 English', 2.5], At: ['@', 1.5], Space: ['רווח', 8.5], Clear: ['🧹 ניקוי', 2.5],
  };
  const KEYS = [
    [...HE_ROWS[0], ['Backspace']], [['Tab'], ...HE_ROWS[1]], [['CapsLock'], ...HE_ROWS[2], ['Enter']],
    [['ShiftLeft'], ...HE_ROWS[3], ['ShiftRight']], [['Lang'], ['At'], ['Space'], ['Clear']],
  ];
  const FINGER_KEYS = {
    LP: ['Backquote', 'Digit1', 'KeyQ', 'KeyA', 'KeyZ', 'Tab', 'CapsLock', 'ShiftLeft'], LR: ['Digit2', 'KeyW', 'KeyS', 'KeyX'],
    LM: ['Digit3', 'KeyE', 'KeyD', 'KeyC'], LI: ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB'],
    RI: ['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM'], RM: ['Digit8', 'KeyI', 'KeyK', 'Comma'],
    RR: ['Digit9', 'KeyO', 'KeyL', 'Period'], RP: ['Digit0', 'Minus', 'Equal', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Slash', 'Enter', 'ShiftRight', 'Backspace'], TH: ['Space'],
  };
  const FINGERS = {
    LP: { name: 'זרת שמאל', color: '#f6a5c0' }, LR: { name: 'קמיצה שמאל', color: '#ffc879' }, LM: { name: 'אמה שמאל', color: '#fff07a' },
    LI: { name: 'אצבע מורה שמאל', color: '#9be29a' }, RI: { name: 'אצבע מורה ימין', color: '#8fd3f4' }, RM: { name: 'אמה ימין', color: '#b9a6f2' },
    RR: { name: 'קמיצה ימין', color: '#f2a6e6' }, RP: { name: 'זרת ימין', color: '#ff9f8f' }, TH: { name: 'אגודל', color: '#d9dde8' },
  };
  const FINGER_OF = Object.fromEntries(Object.entries(FINGER_KEYS).flatMap(([f, codes]) => codes.map((c) => [c, f])));
  const HE_OF = Object.fromEntries(HE_ROWS.flat());

  // 1. "שלום עולם" typed on an English computer: A K U O ␣ G U K O
  const typeCodes = ['KeyA', 'KeyK', 'KeyU', 'KeyO', 'Space', 'KeyG', 'KeyU', 'KeyK', 'KeyO'];
  const presses = typeCodes.map((code, i) => ({ code, i, ch: code === 'Space' ? ' ' : HE_OF[code], t: T(2, 1.5 + i * 0.5), midi: m(['C5', 'E5', 'G5', 'C6', 'A4', 'D5', 'F5', 'A5', 'C6'][i]) }));

  // 2. niqqud: ש + shin dot + kamatz, ל, וֹ (חוֹלָם מָלֵא), ם → "שָׁלוֹם"
  const NIQQUD = [
    ['ָ', 'קמץ'], ['ַ', 'פתח'], ['ֵ', 'צירי'], ['ֶ', 'סגול'], ['ְ', 'שווא'], ['ִ', 'חיריק'], ['ֹ', 'חולם'], ['ֻ', 'קבוץ'],
    ['ּ', 'דגש'], ['ֲ', 'חטף פתח'], ['ֱ', 'חטף סגול'], ['ֳ', 'חטף קמץ'], ['ׁ', 'שי״ן ימנית'], ['ׂ', 'שי״ן שמאלית'],
  ].map(([mark, name]) => ({ glyph: 'ב' + mark, mark, name }))
    .concat([{ glyph: 'וּ', mark: 'וּ', name: 'שורוק' }, { glyph: 'וֹ', mark: 'וֹ', name: 'חולם מלא' }]);
  const niqSeq = [
    { kind: 'key', code: 'KeyA', add: 'ש' }, { kind: 'chip', chip: 12, add: 'ׁ' }, { kind: 'chip', chip: 0, add: 'ָ' },
    { kind: 'key', code: 'KeyK', add: 'ל' }, { kind: 'chip', chip: 15, add: 'וֹ' }, { kind: 'key', code: 'KeyO', add: 'ם' },
  ].map((s, i) => ({ ...s, i, t: T(5, 1.5 + i * 0.75), midi: m(['C5', 'E5', 'G5', 'A5', 'C6', 'E6'][i]) }));

  // 3. symbols (virtualKeys SYMBOLS), then the emoji panel searched in Hebrew ("יום הולדת" → 🥳 🎂)
  const SYMBOLS = ['@', '₪', '״', '׳', '־', '–', '…', '€', '$', '%', '°', '×', '÷', '«', '»', '❤️', '🙂'];
  const symTaps = [{ sym: 15, add: ' ❤️', t: T(8, 2) }].map((s, i) => ({ ...s, i, midi: m('E6') }));
  const EMOJI_TABS = ['😀', '❤️', '👍', '🐶', '🍕', '⚽', '📚', '🔢'];
  const SEARCH = 'יום הולדת';
  const FOUND = [['🥳', 'מסיבה'], ['🎂', 'עוגת']];

  // 4. finger colours: three keys, each with its finger hint
  const fingerPresses = ['KeyA', 'KeyK', 'KeyU', 'Space'].map((code, i) => ({ code, i, t: T(11, 3 + i * 1.0), ch: code === 'Space' ? 'רווח' : HE_OF[code], finger: FINGER_OF[code], midi: m(['C5', 'E5', 'G5', 'C6'][i]) }));

  // 5. the action buttons, in the page's order
  const ACTIONS = ['📋 העתקה', '💬 שליחה בוואטסאפ', '🔎 חיפוש בגוגל', '💾 שמירה כקובץ'];

  const endLines = [{ t: T(17, 1) }, { t: T(17, 2) }, { t: T(17, 3) }, { t: T(18, 1) }, { t: T(18, 2.5) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, type: { t: T(2), sync: 'av' }, niqqud: { t: T(5), sync: 'av' },
    symbols: { t: T(8), sync: 'av' }, cake: { t: ev.cake, sync: 'av' }, fingers: { t: T(11), sync: 'av' },
    send: { t: T(14), sync: 'av' }, copy: { t: ev.copy, sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, steps,
    MOD, KEYS, FINGERS, FINGER_OF, HE_OF, presses, NIQQUD, niqSeq, SYMBOLS, symTaps, EMOJI_TABS, SEARCH, FOUND,
    fingerPresses, ACTIONS, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

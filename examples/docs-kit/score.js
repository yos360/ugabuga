// UGABUGA "מה הכי מעצבן אתכם במסמכים?" (9:16 Reel). The document-tools kit of the site, shown as one kit:
// the PDF studio (/tools/pdf: merge, split, compress, sign, PDF↔Word) and the document editor (/tools/document,
// 25 templates). The hook is a 4-way choice; the viewer answers with a letter in the comments.
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
    hook: [0, T(2)], merge: [T(2), T(4)], squeeze: [T(4), T(6)], sign: [T(6), T(8)],
    word: [T(8), T(10)], doc: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    Dm7: { notes: ['F3', 'A3', 'C4'], bass: 'D2' }, Gsus: { notes: ['D3', 'G3', 'C4'], bass: 'G1' },
    Cadd9: { notes: ['E3', 'G3', 'C4', 'D4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'F'], [3, 0, 4, 'C'], [4, 0, 4, 'Am'], [5, 0, 4, 'F'],
    [6, 0, 4, 'C'], [7, 0, 4, 'G'], [8, 0, 4, 'F'], [9, 0, 2, 'Gsus'], [9, 2, 2, 'G'],
    [10, 0, 4, 'Dm7'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = {
    q1: T(0, 0), q2: T(0, 2), title: T(0, 3.2), mascot: T(1, 0), pick: T(1, 2.6), promise: T(1, 3.3),
    merge: T(3, 0), // three files fly into one PDF
    split: T(3, 2), // the split ranges chip
    level: T(5, 0), shrink: T(5, 0.5), // compression level picked, the file shrinks
    signGo: T(7, 0), signEnd: T(7, 2.5), // signature drawn with a finger
    toWord: T(9, 0), // the PDF → Word arrow fires
    tpl: T(11, 0), saved: T(11, 2.5), // a template is tapped, then "saved on this device"
    logo: T(12, 0),
  };
  const hookOpts = ['לחבר כמה PDF', 'קובץ כבד מדי', 'לחתום בלי מדפסת', 'PDF שצריך בוורד'].map((s, i) => ({ s, i, t: T(1, 0.3 + i * 0.6), midi: m(['E5', 'G5', 'A5', 'C6'][i]) }));

  const steps = [
    { n: 1, sec: 'merge', title: 'מחברים ומפצלים', sub: 'כמה PDF ותמונות לקובץ אחד, או להפך', color: '#226bd7' },
    { n: 2, sec: 'squeeze', title: 'קובץ כבד? דוחסים', sub: 'שלוש רמות, ורואים מיד כמה ירד', color: '#cf2f56' },
    { n: 3, sec: 'sign', title: 'חותמים בלי מדפסת', sub: 'באצבע או בעכבר, ומוסיפים שם ותאריך', color: '#8a4fd8' },
    { n: 4, sec: 'word', title: 'PDF לוורד ובחזרה', sub: 'עברית מימין לשמאל, גם בטלפון', color: '#e08a00' },
    { n: 5, sec: 'doc', title: 'וורד אונליין', sub: '25 תבניות מוכנות לעריכה והדפסה', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. files that get merged (illustration names)
  const FILES = [['📄', 'חשבונית.pdf'], ['🖼️', 'צילום.jpg'], ['📄', 'טופס.pdf']]
    .map(([e, s], i) => ({ e, s, i, t: T(2, 0.5 + i * 0.6), midi: m(['C5', 'E5', 'G5'][i]) }));

  // 2. the site's three compression levels (label + hint)
  const LEVELS = [['קלה', 'איכות כמעט כמו המקור'], ['רגילה', 'מומלץ: קטן וקריא'], ['חזקה', 'הכי קטן, פחות חד']]
    .map(([s, hint], i) => ({ s, hint, i, t: T(4, 0.5 + i * 0.6), midi: m(['C5', 'E5', 'G5'][i]) }));
  const LEVEL_PICK = 1;

  // 3. text stamps added after the signature
  const stamps = [{ s: 'ישראל ישראלי', t: T(7, 3) }];

  // 4. the two conversions, with the site's own options
  const WORD = [
    { from: 'PDF', to: 'Word', note: 'טקסט לעריכה, או שמירת העיצוב', t: T(8, 0.5), color: '#226bd7' },
    { from: 'Word', to: 'PDF', note: 'ישר בדפדפן, בלי להתקין כלום', t: T(8, 2), color: '#cf2f56' },
  ];

  // 5. real templates of the document editor (docTemplates.js)
  const TPL = [['✉️', 'מכתב רשמי'], ['📢', 'הודעה להורים'], ['🚌', 'אישור לטיול'], ['💼', 'הצעת מחיר'], ['🧾', 'אישור תשלום'], ['🏆', 'תעודת הצטיינות'], ['🍰', 'דף מתכון'], ['🛒', 'רשימת קניות'], ['🔍', 'מודעת אבדה']]
    .map(([e, s], i) => ({ e, s, i, t: T(10, 0.4) + i * BEAT / 3, midi: m(['C5', 'E5', 'G5', 'A5', 'C6'][i % 5]) }));
  const TPL_PICK = 1;

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 1.5) }, { t: T(13, 3) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, merge: { t: T(2), sync: 'av' }, joined: { t: ev.merge, sync: 'av' },
    squeeze: { t: T(4), sync: 'av' }, level: { t: ev.level, sync: 'av' }, sign: { t: T(6), sync: 'av' },
    word: { t: T(8), sync: 'av' }, doc: { t: T(10), sync: 'av' }, tpl: { t: ev.tpl, sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, FILES, LEVELS, LEVEL_PICK, stamps, WORD, TPL, TPL_PICK, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

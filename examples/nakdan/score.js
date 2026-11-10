// UGABUGA "ספר — כמה דרכים לקרוא?" (9:16 Reel). The automatic nakdan (/tools/nakdan, src/pages/tools/Nakdan.jsx).
// The hook question comes from the page's own text (the word ספר reads in several ways); its answer is never
// shown or stated in the reel. Step 3 uses the other example from the page text (שיחקו), never the hook word.
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
    pick: T(3, 1.5), // tap on "נקדו לי"
    topic: T(5, 1.2), // tap on the word שיחקו
    mode: T(7, 2), // tap on "בלי ניקוד"
    go: T(8, 2), ans: T(9, 0.5), // tap "שמירת תיקון", then the word is back
    printBtn: T(11, 0), // tap on the copy button
    logo: T(12, 0),
  };
  const hookOpts = ['2', '3', '4'].map((s, i) => ({ s, i, t: T(1, 0.2 + i * 0.7), midi: m(['F#5', 'A5', 'D6'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'מדביקים טקסט', sub: 'שיר, ברכה, סיפור או דף עבודה', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'מקבלים אותו מנוקד', sub: 'לוחצים ״נקדו לי״ וזה מוכן', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'לוחצים על מילה', sub: 'ובוחרים לה ניקוד אחר', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מתקנים בעצמכם', sub: 'כותבים את הניקוד שרציתם', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'מעתיקים ושולחים', sub: 'ולכל תיקון קטן יש מקלדת ניקוד', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. the sentence typed into the box (the page's own placeholder), word by word
  const SENT = ['הילדים', 'שיחקו', 'בגן', 'עד', 'הערב'];
  const AUD = SENT.map((label, i) => ({ label, i, t: T(2, 0.4 + i * 0.6), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const AUD_PICK = 1;

  // 2. the same words, vocalized
  const NIK = ['הַיְלָדִים', 'שִׂחֲקוּ', 'בַּגַּן', 'עַד', 'הָעֶרֶב'];
  const TOPICS = NIK.map((label, i) => ({ label, plain: SENT[i], i, t: T(4, 0.2 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5', 'D6'][i]) }));
  const TOPIC_PICK = 1;

  // 3. the options panel of שיחקו: the two readings from the page text and "בלי ניקוד"
  const MODES = [0, 1, 2, 3].map((i) => ({ i, t: T(6, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'D6'][i]) }));
  const OPTS = ['שִׂחֲקוּ', 'שִׁחֲקוּ', 'בלי ניקוד'];

  // 4. manual fix
  const FIX = { draft: 'שִׂחֲקוּ', word: 'שיחקו' };

  // 5. what people paste, and the copy button
  const USES = [['🎵', 'שיר'], ['💌', 'ברכה'], ['📖', 'סיפור לילדים'], ['📝', 'דף עבודה']];
  const sheetItems = USES.map(([emoji, label], i) => ({ emoji, label, i, t: T(10, 0.4 + i * 0.45), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 3) }];

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 1.5) }, { t: T(13, 3) }];

  // every pill/chip pop in the film that gets a pop + marimba in song.js
  const pills = [T(3, 0.3), T(3, 3), T(5, 2.2), T(5, 3.2), T(7, 0.2), T(7, 3), T(8, 0.3), T(8, 0.6), T(9, 1.4), extras[0].t, extras[1].t, T(10, 2.6)];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'v' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, print: { t: T(10), sync: 'av' }, tick: { t: ev.printBtn, sync: 'a' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, OPTS, FIX, USES, sheetItems, extras, endLines, pills,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

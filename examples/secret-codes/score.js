// UGABUGA "פענחו את ההודעה הסודית" (9:16 Reel). Secret codes (/tools/secret-codes, src/data/secretCodes.js):
// next-letter, number-for-letter, at-bash, the on-screen encoder/decoder, printable decode sheets.
// The hook message (shift 1, "טגש יזג") is NOT one of the page's missions; its answer is never shown.
// Every code string below was computed with the site's own encode().
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
    pick: T(3, 2), // an audience is chosen
    topic: T(5, 1), // a topic is chosen
    mode: T(7, 2), // game mode picked
    go: T(8, 1), ans: T(9, 0), // the answer is tapped, then the green feedback
    printBtn: T(11, 0),
    logo: T(12, 0),
  };
  const hookOpts = ['טגש', 'יזג'].map((s, i) => ({ s, i, t: T(1, 0.3 + i * 0.9), midi: m(['F#5', 'A5'][i]) }));

  const steps = [
    { n: 1, sec: 'aud', title: 'האות הבאה', sub: 'כל אות מתחלפת באות שאחריה בא״ב', color: '#226bd7' },
    { n: 2, sec: 'topics', title: 'מספר במקום אות', sub: 'א היא 1, ב היא 2, וה־ת היא 22', color: '#cf2f56' },
    { n: 3, sec: 'modes', title: 'א״ת ב״ש', sub: 'א מתחלפת ב־ת, ב ב־ש, ג ב־ר', color: '#8a4fd8' },
    { n: 4, sec: 'play', title: 'מצפינים ומפענחים', sub: 'כל הודעה בעברית, על המסך', color: '#e08a00' },
    { n: 5, sec: 'print', title: 'דפים להדפסה', sub: 'מהגן ועד כיתה ו׳, עם דף פתרונות', color: '#23874d' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. next letter: the word בוגה, shift 1 (encode('shift','בוגה',1) = גזדו); first letter on the right (RTL)
  const AUD = [['ב', 'ג'], ['ו', 'ז'], ['ג', 'ד'], ['ה', 'ו']]
    .map(([from, to], i) => ({ from, to, i, t: T(2, 0.5 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const AUD_PICK = 2; // key chip "3" (SHIFT_KEYS 1-5)

  // 2. numbers: encode('number','בוגה') = 2 6 3 5
  const TOPICS = [['ב', '2'], ['ו', '6'], ['ג', '3'], ['ה', '5']]
    .map(([from, to], i) => ({ from, to, i, t: T(4, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const TOPIC_PICK = 0;

  // 3. at-bash: encode('atbash','בוגה') = שפרצ (the final ה maps to צ; sheets show it unchanged)
  const MODES = [['ב', 'ש'], ['ו', 'פ'], ['ג', 'ר'], ['ה', 'צ']]
    .map(([from, to], i) => ({ from, to, i, t: T(6, 0.4 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'D6'][i]), color: '#8a4fd8' }));

  // 4. the tool: shift 1 on the page's own sample sentence
  const Q = { sample: 'נפגשים בהפסקה ליד העץ', result: 'סצדתכנ גוצערו מכה ופק' };

  // 5. print sheets: messageRows('הסוד מתחבא','shift',1,8)
  const sheetItems = [0, 1, 2, 3].map((i) => ({ i, t: T(10, 0.5 + i * 0.5), midi: m(['D5', 'F#5', 'A5', 'B5'][i]) }));
  const extras = [{ t: T(11, 1.5) }, { t: T(11, 3) }];

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 1.5) }, { t: T(13, 3) }];

  const markers = {
    hook: { t: ev.q1, sync: 'a' }, aud: { t: T(2), sync: 'av' }, pickA: { t: ev.pick, sync: 'av' },
    topics: { t: T(4), sync: 'av' }, pickT: { t: ev.topic, sync: 'av' }, modes: { t: T(6), sync: 'av' },
    play: { t: T(8), sync: 'av' }, right: { t: ev.ans, sync: 'av' }, print: { t: T(10), sync: 'av' },
    logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers,
    hookOpts, steps, AUD, AUD_PICK, TOPICS, TOPIC_PICK, MODES, Q, sheetItems, extras, endLines,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

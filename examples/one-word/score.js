// "מילה אחת" (9:16 reel, a one-off). Five proverbs with one word left in each. Levels 1–4 are solved on screen;
// level 5 stays open, so the comments are where it gets solved.
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

  const LEVELS = [
    { label: 'קל', color: '#23874d', words: ['מים', 'רבים', 'לא', 'יוכלו', 'לכבות', 'את', 'האהבה'], shown: 4 },
    { label: 'בינוני', color: '#226bd7', words: ['מרוב', 'עצים', 'לא', 'רואים', 'את', 'היער'], shown: 3 },
    { label: 'קשה', color: '#e08a00', words: ['אל', 'תדין', 'את', 'חברך', 'עד', 'שתגיע', 'למקומו'], shown: 3 },
    { label: 'קשה מאוד', color: '#8a4fd8', words: ['אל', 'תסתכל', 'בקנקן', 'אלא', 'במה', 'שיש', 'בו'], shown: 4 },
    { label: 'רק לאלופים', color: '#cf2f56', words: ['לא', 'הביישן', 'למד', 'ולא', 'הקפדן', 'מלמד'], shown: 4, open: true },
  ];
  const BEATS = 10, FINAL_BEATS = 12; // 5 s for a level, 6 s for the last one
  const start = T(1, 2);
  const stages = LEVELS.map((L, i) => {
    const t0 = start + i * BEATS * BEAT, n = L.open ? 5 : 3;
    const tiles = L.words.map((w, k) => ({ w, k, t: t0 + 0.25 + (k * 0.5 * BEAT) / L.words.length * 1.6 }));
    const ticks = Array.from({ length: n }, (_, k) => ({ n: n - k, k, t: t0 + (L.open ? 2 : 1) * BEAT + k * 2 * BEAT }));
    const reveal = L.open ? null : t0 + 7 * BEAT;
    const up = L.open ? t0 + 12 * BEAT : reveal;
    return { ...L, i, t0, tiles, ticks, reveal, up, tEnd: t0 + (L.open ? FINAL_BEATS : BEATS) * BEAT };
  });
  const last = stages[stages.length - 1];
  const endStart = last.tEnd;
  const DURATION = endStart + 3 * BAR + 0.9;

  const ev = {
    one: T(0, 0), two: T(0, 2), ask: T(1, 0), // "מילה אחת." "פתגם שלם." "עד איזה שלב תגיעו?"
    comment: endStart + 0.2, send: endStart + 2 * BEAT, next: endStart + 3 * BEAT, logo: endStart + 4 * BEAT, url: endStart + 6 * BEAT,
  };

  const bars = Math.ceil((endStart - clock.offset) / BAR);
  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['E3', 'A3', 'C4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' },
    C: { notes: ['E3', 'G3', 'C4'], bass: 'C2' }, G: { notes: ['D3', 'G3', 'B3'], bass: 'G1' },
    Dm: { notes: ['F3', 'A3', 'D4'], bass: 'D2' }, E: { notes: ['E3', 'G#3', 'B3'], bass: 'E1' },
  }, [
    ...Array.from({ length: bars }, (_, b) => [b, 0, 4, ['Am', 'F', 'Dm', 'E'][b % 4]]),
    [bars, 0, 4, 'C'], [bars + 1, 0, 4, 'G'], [bars + 2, 0, 4, 'C'], [bars + 3, 0, 4, 'C'],
  ]);

  const markers = {
    hook: { t: ev.one, sync: 'a' },
    ...Object.fromEntries(stages.map(s => [`level${s.i + 1}`, { t: s.t0, sync: 'a' }])),
    logo: { t: ev.logo, sync: 'a' },
  };
  const S = { hook: [0, start], end: [endStart, DURATION] };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, stages, endStart, steps: [] };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

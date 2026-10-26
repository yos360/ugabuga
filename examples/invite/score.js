// UGABUGA birthday invitation maker (9:16 Instagram Reel). The real flow of /invitation:
// choose a style, fill in the details, customise, share. One timeline for music and picture.
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
  const DURATION = T(14) + 1.7; // ≈ 29.85s

  const S = {
    hook: [0, T(2)], styles: [T(2), T(4)], fill: [T(4), T(6)], custom: [T(6), T(8)],
    share: [T(8), T(10)], montage: [T(10), T(12)], end: [T(12), DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, F: { notes: ['A3', 'C4', 'F4'], bass: 'F1' },
    Dm7: { notes: ['A3', 'C4', 'F4'], bass: 'D2' }, Gsus: { notes: ['G3', 'C4', 'D4'], bass: 'G1' },
    Cadd9: { notes: ['G3', 'C4', 'D4', 'E4'], bass: 'C2' },
  }, [
    [0, 0, 4, 'C'], [1, 0, 4, 'G'], [2, 0, 4, 'F'], [3, 0, 4, 'C'], [4, 0, 4, 'Am'], [5, 0, 4, 'G'],
    [6, 0, 4, 'F'], [7, 0, 4, 'C'], [8, 0, 4, 'Am'], [9, 0, 2, 'Gsus'], [9, 2, 2, 'G'],
    [10, 0, 4, 'F'], [11, 0, 4, 'G'], [12, 0, 4, 'C'], [13, 0, 4, 'F'], [14, 0, 4, 'Cadd9'],
  ]);

  const ev = { hook1: T(0, 0), hook2: T(0, 2), free: T(1, 2), tapStyle: T(3, 1), styleLabel: T(3, 2.5), logo: T(12, 0) };
  const fan = ['balloons', 'space', 'dino'].map((id, i) => ({ id, i, t: T(1, i * 0.5), midi: m(['E5', 'G5', 'C6'][i]) }));

  const steps = [
    { n: 1, sec: 'styles', title: 'בוחרים עיצוב', sub: '12 סגנונות מקוריים, שצוירו במיוחד לעוגה בוגה', color: '#dc5c83' },
    { n: 2, sec: 'fill', title: 'ממלאים את הפרטים', sub: 'שם, גיל, תאריך ומקום. ההזמנה מתעדכנת מיד', color: '#168fc5' },
    { n: 3, sec: 'custom', title: 'משנים מה שרוצים', sub: 'צבעים, פונט, מסגרת ותמונה אישית', color: '#9254c8' },
    { n: 4, sec: 'share', title: 'שולחים לקבוצה', sub: 'כתמונה לוואטסאפ, עם קישור לאישור הגעה', color: '#23874d' },
    { n: '✨', sec: 'montage', title: 'יש עיצוב לכל ילד', sub: 'חלל, דינוזאורים, כדורגל, גיימינג ועוד', color: '#e08a00' },
  ].map((f) => ({ ...f, t: S[f.sec][0] }));

  // 1. twelve style thumbnails, one per 16th
  const STYLE_IDS = ['balloons', 'space', 'dino', 'princess', 'football', 'gaming', 'scrapbook', 'ribbon', 'retro', 'disco', 'ocean', 'elegant'];
  const SCALE = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7'];
  const styles = STYLE_IDS.map((id, i) => ({ id, i, t: T(2, 0.5 + i * 0.25), midi: m(SCALE[i]) }));

  // 2. live typing: each step re-renders the real invitation
  const fills = [
    { img: 'type1', t: T(4, 0.5), field: 0 }, { img: 'type2', t: T(4, 0.75), field: 0 }, { img: 'type3', t: T(4, 1), field: 0 }, { img: 'type4', t: T(4, 1.25), field: 0 },
    { img: 'type5', t: T(4, 2.5), field: 1 }, { img: 'type6', t: T(5, 0), field: 2 }, { img: 'type7', t: T(5, 1), field: 3 }, { img: 'type8', t: T(5, 2), field: 4 },
  ].map((f, i) => ({ ...f, i, midi: m(['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6'][i]) }));

  // 3. customise: a new look on every other beat
  const variants = [
    { img: 'var0', t: T(6, 1), chip: 0, label: 'שמיים · פונט עגול' },
    { img: 'var1', t: T(6, 3), chip: 1, label: 'סגול קסום · כתב יד' },
    { img: 'var2', t: T(7, 1), chip: 2, label: 'ג׳ונגל · תמונה מרובעת' },
    { img: 'var3', t: T(7, 3), chip: 3, label: 'ניאון' },
  ].map((v, i) => ({ ...v, i, midi: m(['E5', 'G5', 'C6', 'E6'][i]) }));

  // 4. share: the invitation lands in the parents' group, then replies on beats
  const chat = [
    { t: T(8, 1), who: 'me', kind: 'image' },
    { t: T(8, 2.5), who: 'me', kind: 'text', text: 'אישור הגעה בלחיצה 👇\nugabuga.co.il/r/…' },
    { t: T(9, 0), who: 'them', name: 'אמא של יואב', text: 'מגיעים! 🎉' },
    { t: T(9, 1), who: 'them', name: 'אבא של מאיה', text: 'איזו הזמנה מהממת 😍' },
    { t: T(9, 2), who: 'them', name: 'אמא של תמר', text: 'מגיעות 💃' },
  ].map((c, i) => ({ ...c, i, midi: m(['C5', 'E5', 'G5', 'A5', 'C6'][i]) }));

  // 5. montage: a new design on every beat
  const MONT = [['space', 'הרפתקה בחלל'], ['dino', 'ספארי דינוזאורים'], ['football', 'כרטיס למשחק'], ['princess', 'נשף קסום'], ['gaming', 'מסיבת גיימינג'], ['disco', 'דיסקו נוצץ'], ['ocean', 'ים קסום'], ['retro', 'מסיבת רטרו']];
  const montage = MONT.map(([id, name], i) => ({ id, name, i, t: T(10, i), midi: m(['C5', 'E5', 'G5', 'C6', 'D5', 'F5', 'A5', 'D6'][i]) }));

  const endLines = [{ t: T(12, 1) }, { t: T(12, 2) }, { t: T(13, 0) }, { t: T(13, 2) }];

  const markers = {
    hook: { t: ev.hook1, sync: 'a' },
    styles: { t: T(2), sync: 'av' }, fill: { t: T(4), sync: 'av' }, custom: { t: T(6), sync: 'av' },
    share: { t: T(8), sync: 'av' }, montage: { t: T(10), sync: 'av' }, logo: { t: ev.logo, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, chords, chordAt, ev, markers, fan, steps, styles, fills, variants, chat, montage, endLines };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();

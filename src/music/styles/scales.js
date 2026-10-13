// Scales, jazz chords and style grooves for /music/styles. Pure data + helpers (tested in tests/music-styles.test.mjs).

// Semitone steps from the root. `style` is where kids will hear it; `mood` is one line in plain words.
export const SCALES = [
  { id: 'major', name: 'מז׳ור', style: 'קלאסי · פופ', mood: 'שמח, בהיר ופשוט — "דו רה מי" של כולם.', steps: [0, 2, 4, 5, 7, 9, 11], backing: [[0, 4, 7, 11], [5, 9, 12, 16]] },
  { id: 'minor', name: 'מינור טבעי', style: 'קלאסי · פופ · רוק', mood: 'עצוב, רציני ומסתורי.', steps: [0, 2, 3, 5, 7, 8, 10], backing: [[0, 3, 7, 10], [8, 12, 15, 19]] },
  { id: 'harmonic', name: 'מינור הרמוני', style: 'קלאסי', mood: 'דרמטי, כמו סרט הרפתקאות — יש בו קפיצה "מזרחית" בסוף.', steps: [0, 2, 3, 5, 7, 8, 11], backing: [[0, 3, 7], [7, 11, 14, 17]] },
  { id: 'penta-major', name: 'פנטטוני מז׳ור', style: 'פופ · קאנטרי · שירי ילדים', mood: 'רק 5 תווים — ואי אפשר לטעות! כל תו נשמע טוב.', steps: [0, 2, 4, 7, 9], backing: [[0, 4, 7], [9, 12, 16]] },
  { id: 'penta-minor', name: 'פנטטוני מינור', style: 'רוק · בלוז', mood: 'הסולם של סולו הגיטרה ברוק.', steps: [0, 3, 5, 7, 10], backing: [[0, 3, 7, 10], [5, 9, 12, 15]] },
  { id: 'blues', name: 'סולם הבלוז', style: 'בלוז · ג׳אז · רוק', mood: 'פנטטוני מינור + "תו כחול" אחד שנשמע עקום ומגניב.', steps: [0, 3, 5, 6, 7, 10], backing: [[0, 4, 7, 10], [5, 9, 12, 15]] },
  { id: 'dorian', name: 'דורי', style: 'ג׳אז · פאנק', mood: 'מינור עם "קריצה" — הסולם של So What של מיילס דייוויס.', steps: [0, 2, 3, 5, 7, 9, 10], backing: [[0, 3, 7, 10, 14], [5, 9, 12, 15]] },
  { id: 'mixolydian', name: 'מיקסולידי', style: 'ג׳אז · בלוז · רוק', mood: 'מז׳ור עם צליל "דומיננטי" — כמו מז׳ור שרוצה להמשיך הלאה.', steps: [0, 2, 4, 5, 7, 9, 10], backing: [[0, 4, 7, 10], [-2, 2, 5, 9]] },
  { id: 'bebop', name: 'ביבופ', style: 'ג׳אז', mood: 'מיקסולידי עם תו מעבר נוסף — 8 תווים, כדי שהפעמה תיפול תמיד על תו "טוב".', steps: [0, 2, 4, 5, 7, 9, 10, 11], backing: [[2, 5, 9, 12], [7, 11, 14, 17], [0, 4, 7, 11]] },
  { id: 'whole-tone', name: 'טונים שלמים', style: 'ג׳אז · מוזיקת סרטים', mood: 'חלומי ומרחף — כל המרווחים שווים, אין "בית".', steps: [0, 2, 4, 6, 8, 10], backing: [[0, 4, 8], [2, 6, 10]] },
  { id: 'lydian', name: 'לידי', style: 'מוזיקת סרטים · ג׳אז', mood: 'מז׳ור קסום עם תו רביעי "מוגבה" — צליל של פלא ומעוף.', steps: [0, 2, 4, 6, 7, 9, 11], backing: [[0, 4, 7, 11], [2, 6, 9, 12]] },
  { id: 'hijaz', name: 'חיג׳אז', style: 'מזרחי · כליזמר', mood: 'מרווח גדול ומיוחד בין התו השני לשלישי — הצליל של המזרח.', steps: [0, 1, 4, 5, 7, 8, 10], backing: [[0, 4, 7], [1, 5, 8]] },
  { id: 'double-harmonic', name: 'ערבי כפול', style: 'מזרחי', mood: 'שני מרווחים גדולים — אקזוטי ודרמטי במיוחד.', steps: [0, 1, 4, 5, 7, 8, 11], backing: [[0, 4, 7], [1, 5, 8]] },
  { id: 'insen', name: 'יפני (אין-סן)', style: 'מוזיקה יפנית', mood: '5 תווים עם חצאי טונים — שקט, מסתורי, כמו גן יפני.', steps: [0, 1, 5, 7, 10], backing: [[0, 7, 13], [5, 12, 13]] },
]
export const scaleById = id => SCALES.find(s => s.id === id)

export const ROOTS = ['דו', 'דו#', 'רה', 'רה#', 'מי', 'פה', 'פה#', 'סול', 'סול#', 'לה', 'לה#', 'סי']

// MIDI notes of a scale from a root (midi), one octave up and back to the root's octave above.
export const scaleNotes = (root, scale) => [...scale.steps.map(s => root + s), root + 12]

// "טון · טון · חצי · ..." — the distance between neighbouring notes, the scale's fingerprint.
const GAP = { 1: 'חצי', 2: 'טון', 3: 'טון וחצי', 4: 'שני טונים' }
export function formula(scale) {
  const n = [...scale.steps, 12]
  return n.slice(1).map((v, i) => GAP[v - n[i]] || `${v - n[i]} חצאים`)
}

// Jazz chords: semitones from the root.
export const JAZZ_CHORDS = [
  { id: 'maj7', name: 'מז׳ור 7 (maj7)', sym: 'maj7', notes: [0, 4, 7, 11], mood: 'רך וחלומי — הסיום הקלאסי של שיר ג׳אז.' },
  { id: 'm7', name: 'מינור 7 (m7)', sym: 'm7', notes: [0, 3, 7, 10], mood: 'מינור רך ומתוחכם.' },
  { id: '7', name: 'דומיננט 7', sym: '7', notes: [0, 4, 7, 10], mood: 'מתוח — "רוצה" לעבור לאקורד הבא.' },
  { id: 'm7b5', name: 'חצי מוקטן (m7♭5)', sym: 'm7♭5', notes: [0, 3, 6, 10], mood: 'מסתורי, קצת מודאג.' },
  { id: 'dim7', name: 'מוקטן (dim7)', sym: 'dim7', notes: [0, 3, 6, 9], mood: 'מתח של סרט מצויר ישן — "אוי לא!"' },
  { id: '9', name: 'דומיננט 9', sym: '9', notes: [0, 4, 7, 10, 14], mood: 'עשיר ושמנמן — האקורד של הפאנק.' },
  { id: '69', name: '6/9', sym: '6/9', notes: [0, 4, 7, 9, 14], mood: 'שמח ופתוח, סיום מושלם של בוסה נובה.' },
]

// Grooves: 16 steps per bar. k = kick, s = snare, h = hi-hat, r = ride. chords: one per bar, midi notes.
// swing: the off-beat 8ths come late, like jazz and blues.
const C = (s) => s.split(' ').map(t => t.split('+').map(Number))
export const GROOVES = {
  blues: { bpm: 96, swing: true, drums: { k: 'x.......x.......', s: '....x.......x...', r: 'x..xx..xx..xx..x' }, chords: C('48+64+67+70 53+65+69+75 48+64+67+70 55+65+71+74') },
  jazz: { bpm: 120, swing: true, drums: { k: 'x.......x.......', s: '........x.......', r: 'x...x..xx...x..x' }, chords: C('50+65+69+72 55+65+71+74 48+64+67+71 48+64+67+71') },
  classical: { bpm: 100, swing: false, drums: {}, chords: C('48+60+64+67 53+60+65+69 55+59+62+67 48+60+64+67') },
  rock: { bpm: 120, swing: false, drums: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, chords: C('40+47+52 43+50+55 45+52+57 43+50+55') },
  pop: { bpm: 104, swing: false, drums: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, chords: C('48+60+64+67 43+59+62+67 45+60+64+69 41+60+65+69') },
  mizrahi: { bpm: 104, swing: false, drums: { k: 'x..x..x.x..x....', s: '....x.......x..x', h: '..x...x...x...x.' }, chords: C('50+62+66+69 51+63+67+70 50+62+66+69 48+60+63+67') },
  funk: { bpm: 100, swing: false, drums: { k: 'x..x..x...x..x..', s: '....x..x.x..x...', h: 'xxxxxxxxxxxxxxxx' }, chords: C('52+62+68+71+74 52+62+68+71+74 57+67+73+76+79 52+62+68+71+74') },
  bossa: { bpm: 112, swing: false, drums: { k: 'x..x.x..x..x.x..', s: '..x..x....x..x..', h: 'x.x.x.x.x.x.x.x.' }, chords: C('48+64+67+69+74 50+65+69+72 55+65+71+74 48+64+67+71') },
}

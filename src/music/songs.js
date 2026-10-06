// Public-domain melodies to learn on the piano. Each token is NOTE[/beats] (default one beat).
// Only tunes whose composers died long ago (or traditional tunes) — and no lyrics, which may be newer.
import { midi } from './audio.js'

export const SONGS = [
  { slug: 'twinkle-twinkle', title: 'נצנץ נצנץ כוכב קטן', emoji: '⭐', level: 1, bpm: 100, origin: 'מנגינה צרפתית עממית מהמאה ה-18', fact: 'מוצרט כתב על המנגינה הזו 12 וריאציות — וזו אותה מנגינה של שיר הא-ב באנגלית.',
    notes: 'C4 C4 G4 G4 A4 A4 G4/2 F4 F4 E4 E4 D4 D4 C4/2 G4 G4 F4 F4 E4 E4 D4/2 G4 G4 F4 F4 E4 E4 D4/2 C4 C4 G4 G4 A4 A4 G4/2 F4 F4 E4 E4 D4 D4 C4/2' },
  { slug: 'mary-had-a-little-lamb', title: 'למרי היה כבש קטן', emoji: '🐑', level: 1, bpm: 110, origin: 'שיר ילדים אמריקאי מ-1830', fact: 'רק שלושה תווים בכל הבית הראשון — השיר המושלם לשיעור הראשון.',
    notes: 'E4 D4 C4 D4 E4 E4 E4/2 D4 D4 D4/2 E4 G4 G4/2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4/4' },
  { slug: 'frere-jacques', title: 'אחי יעקב (פרר ז׳אק)', emoji: '🔔', level: 1, bpm: 110, origin: 'שיר עממי צרפתי מהמאה ה-18', fact: 'זה שיר מעגל (קאנון): אפשר לחלק את הכיתה לקבוצות שמתחילות אחת אחרי השנייה.',
    notes: 'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4/2 E4 F4 G4/2 G4/0.5 A4/0.5 G4/0.5 F4/0.5 E4 C4 G4/0.5 A4/0.5 G4/0.5 F4/0.5 E4 C4 C4 G3 C4/2 C4 G3 C4/2' },
  { slug: 'ode-to-joy', title: 'אודה לשמחה', emoji: '🎻', level: 2, bpm: 100, origin: 'לודוויג ואן בטהובן, הסימפוניה התשיעית (1824)', fact: 'בטהובן כמעט לא שמע כשכתב את הסימפוניה הזו. היום זה ההמנון של האיחוד האירופי.',
    notes: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4/1.5 D4/0.5 D4/2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4/1.5 C4/0.5 C4/2 D4 D4 E4 C4 D4 E4/0.5 F4/0.5 E4 C4 D4 E4/0.5 F4/0.5 E4 D4 C4 D4 G3/2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4/1.5 C4/0.5 C4/2' },
  { slug: 'happy-birthday', title: 'יום הולדת שמח (Happy Birthday)', emoji: '🎂', level: 2, bpm: 100, origin: 'מילדרד ופטי היל, 1893', fact: 'המנגינה הייתה במחלוקת על זכויות יוצרים עד 2016 — היום היא נחלת הכלל.',
    notes: 'G3/0.75 G3/0.25 A3 G3 C4 B3/2 G3/0.75 G3/0.25 A3 G3 D4 C4/2 G3/0.75 G3/0.25 G4 E4 C4 B3 A3/2 F4/0.75 F4/0.25 E4 C4 D4 C4/3' },
  { slug: 'london-bridge', title: 'גשר לונדון נופל', emoji: '🌉', level: 1, bpm: 110, origin: 'שיר ילדים אנגלי עממי', fact: 'בגרסת המשחק שני ילדים עושים "גשר" בידיים, וכל השאר עוברים מתחתיו עד שהשיר נגמר.',
    notes: 'G4/1.5 A4/0.5 G4 F4 E4 F4 G4/2 D4 E4 F4/2 E4 F4 G4/2 G4/1.5 A4/0.5 G4 F4 E4 F4 G4/2 D4/2 G4/2 E4 C4/2' },
  { slug: 'old-macdonald', title: 'לדוד משה הייתה חווה', emoji: '🐮', level: 1, bpm: 120, origin: 'שיר ילדים אמריקאי עממי', fact: 'באנגלית קוראים לו Old MacDonald. בכל בית מוסיפים חיה וקול חדש.',
    notes: 'G4 G4 G4 D4 E4 E4 D4/2 B4 B4 A4 A4 G4/3 D4 G4 G4 G4 D4 E4 E4 D4/2 B4 B4 A4 A4 G4/3' },
  { slug: 'row-row-row-your-boat', title: 'חתור חתור בסירה', emoji: '🚣', level: 2, bpm: 90, origin: 'שיר ילדים אמריקאי, 1852', fact: 'גם הוא שיר מעגל — נסו לנגן עם עוד מישהו שמתחיל שתי תיבות אחריכם.',
    notes: 'C4/1.5 C4/1.5 C4 D4/0.5 E4/1.5 E4 D4/0.5 E4 F4/0.5 G4/3 C5/0.5 C5/0.5 C5/0.5 G4/0.5 G4/0.5 G4/0.5 E4/0.5 E4/0.5 E4/0.5 C4/0.5 C4/0.5 C4/0.5 G4 F4/0.5 E4 D4/0.5 C4/3' },
  { slug: 'jingle-bells', title: 'ג׳ינגל בלס', emoji: '🔔', level: 2, bpm: 120, origin: 'ג׳יימס לורד פיירפונט, 1857', fact: 'השיר נכתב בכלל לחג ההודיה, ורק אחר כך הפך לשיר של חג המולד.',
    notes: 'E4 E4 E4/2 E4 E4 E4/2 E4 G4 C4/1.5 D4/0.5 E4/4 F4 F4 F4/1.5 F4/0.5 F4 E4 E4 E4/0.5 E4/0.5 E4 D4 D4 E4 D4/2 G4/2 E4 E4 E4/2 E4 E4 E4/2 E4 G4 C4/1.5 D4/0.5 E4/4 F4 F4 F4/1.5 F4/0.5 F4 E4 E4 E4/0.5 E4/0.5 G4 G4 F4 D4 C4/4' },
  { slug: 'when-the-saints', title: 'כשהקדושים צועדים', emoji: '🎺', level: 2, bpm: 130, origin: 'שיר גוספל אמריקאי עממי', fact: 'לואי ארמסטרונג הפך אותו ללהיט ג׳אז — מנגינה מצוינת להכיר דרכה את הג׳אז של ניו אורלינס.',
    notes: 'C4 E4 F4 G4/4 C4 E4 F4 G4/4 C4 E4 F4 G4/2 E4/2 C4/2 E4/2 D4/4 E4 E4 D4 C4/3 C4 E4 G4/2 G4 F4/3 E4 F4 G4/2 E4/2 C4/2 D4/2 C4/4' },
  { slug: 'brahms-lullaby', title: 'שיר הערש של ברהמס', emoji: '🌙', level: 3, bpm: 80, origin: 'יוהנס ברהמס, 1868', fact: 'ברהמס כתב את השיר כמתנה לחברה שנולד לה תינוק.',
    notes: 'E4/0.5 E4/0.5 G4/2 E4/0.5 E4/0.5 G4/2 E4/0.5 G4/0.5 C5 B4/1.5 A4/0.5 A4 G4 D4/0.5 E4/0.5 F4 D4 D4/0.5 E4/0.5 F4/2 D4/0.5 F4/0.5 B4/0.5 A4/0.5 G4 B4 C5/2 C4/0.5 C4/0.5 C5/2 A4/0.5 F4/0.5 G4/2 E4/0.5 C4/0.5 F4 G4 A4 G4/2 C4/0.5 C4/0.5 C5/2 A4/0.5 F4/0.5 G4/2 E4/0.5 C4/0.5 F4 E4 D4 C4/3' },
  { slug: 'fur-elise', title: 'לאליזה (Für Elise)', emoji: '🎹', level: 3, bpm: 70, origin: 'לודוויג ואן בטהובן, 1810', fact: 'היצירה התגלתה רק 40 שנה אחרי מות בטהובן, ועד היום לא בטוח מי הייתה "אליזה".',
    notes: 'E5/0.5 D#5/0.5 E5/0.5 D#5/0.5 E5/0.5 B4/0.5 D5/0.5 C5/0.5 A4/1.5 C4/0.5 E4/0.5 A4/0.5 B4/1.5 E4/0.5 G#4/0.5 B4/0.5 C5/1.5 E4/0.5 E5/0.5 D#5/0.5 E5/0.5 D#5/0.5 E5/0.5 B4/0.5 D5/0.5 C5/0.5 A4/1.5 C4/0.5 E4/0.5 A4/0.5 B4/1.5 E4/0.5 C5/0.5 B4/0.5 A4/3' },
]

export const LEVELS = { 1: 'מתחילים', 2: 'קצת מתקדמים', 3: 'מאתגר' }
export const song = slug => SONGS.find(s => s.slug === slug)

// "E4/1.5 D4" → [{ n: 64, d: 1.5 }, { n: 62, d: 1 }]
export function parseNotes(text) {
  return text.trim().split(/\s+/).map(tok => {
    const [name, dur] = tok.split('/')
    return { n: midi(name), d: dur ? parseFloat(dur) : 1 }
  })
}

// Keyboard range that fits a song: whole octaves from the C below the lowest note.
export function rangeFor(seq) {
  const ns = seq.map(x => x.n)
  const lo = Math.min(...ns), hi = Math.max(...ns)
  const from = lo - (lo % 12)
  let to = hi + ((11 - (hi % 12)) % 12) + 1 // up to the next C
  if (to - from < 24) to = from + 24
  return { from, to }
}

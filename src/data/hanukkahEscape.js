// /holidays/hanukkah/escape-room: a Hanukkah escape room for the whole class (projector) or for
// print, in two levels. Every station answer is ONE digit, and the digits in station order form
// the code of the lock — so the paper lock (a set of fold-over code cards) works without any device.
// Visual specs are drawn by the page in SVG: { kind, ...params }.

export const ESCAPE_STORY = {
  intro: 'רגע לפני הדלקת הנרות, פך השמן של החנוכייה נעלם! על השולחן נשאר רק פתק: "הפך נעול בתיבה עם מנעול קוד. כל תחנה מסתירה ספרה אחת של הקוד. בהצלחה! — הסביבון השובב".',
  finale: 'הקוד נכון והתיבה נפתחה! פך השמן חזר, ואפשר להדליק את הנרות. הסביבון השובב מבטיח לא להתחבא יותר — לפחות עד חנוכה הבא. חג חנוכה שמח!',
}

export const ESCAPE_TRACKS = [
  {
    id: 'gan',
    label: 'גן חובה',
    ages: 'גיל ⁦5–6⁩',
    duration: '⁦15–20⁩ דקות',
    skills: 'ספירה עד 8, חיבור וחיסור קטנים בעזרת ציור, וסיפור נס פך השמן',
    stations: [
      {
        id: 'gan-candles', icon: '🕯️', title: 'החנוכייה',
        story: 'בחנוכייה של הגן דולקים נרות. השמש הוא הנר הגבוה שבאמצע: בעזרתו מדליקים את כל השאר, ואותו לא סופרים.',
        question: 'כמה נרות דולקים בחנוכייה, בלי השמש?',
        answer: '3', accept: ['שלוש', 'שלושה'],
        hints: ['הצביעו על כל להבה וספרו בקול.', 'דלגו על הנר הגבוה שבאמצע — זה השמש.'],
        solution: 'דולקים 3 נרות, ועוד השמש שלא סופרים.',
        visual: { kind: 'hanukkiah', lit: 3 },
      },
      {
        id: 'gan-donuts', icon: '🍩', title: 'הסופגניות',
        story: 'הגננת הביאה סופגניות. בצלחת אחת יש 2 סופגניות, ובצלחת השנייה יש 3 סופגניות.',
        question: 'כמה סופגניות יש בשתי הצלחות יחד?',
        answer: '5', accept: ['חמש', 'חמישה'],
        hints: ['ספרו את הסופגניות בצלחת הראשונה, ואז המשיכו לספור בצלחת השנייה.', 'מתחילים מ־2 וממשיכים: 3, 4, 5…'],
        solution: '2 ועוד 3 הם 5.',
        visual: { kind: 'plates', groups: [2, 3] },
      },
      {
        id: 'gan-dreidels', icon: '🎲', title: 'הסביבונים',
        story: 'על השולחן עמדו 6 סביבונים. 2 סביבונים נפלו מהשולחן ומתגלגלים על הרצפה.',
        question: 'כמה סביבונים נשארו על השולחן?',
        answer: '4', accept: ['ארבע', 'ארבעה'],
        hints: ['ספרו רק את הסביבונים שעל השולחן.', 'היו 6, ושניים נפלו: מורידים 2 אצבעות.'],
        solution: '6 פחות 2 הם 4.',
        visual: { kind: 'dreidels', total: 6, fallen: 2 },
      },
      {
        id: 'gan-oil', icon: '🫒', title: 'פך השמן',
        story: 'המכבים מצאו פך שמן קטן. השמן הספיק ליום אחד בלבד, אבל קרה נס והוא דלק עוד ועוד ימים — בדיוק כמו מספר הנרות שדולקים בערב האחרון של חנוכה.',
        question: 'כמה ימים דלק השמן?',
        answer: '8', accept: ['שמונה'],
        hints: ['בערב האחרון של חנוכה כל הנרות דולקים. ספרו אותם, בלי השמש.', 'חנוכה הוא החג של ... ימים.'],
        solution: 'השמן דלק 8 ימים, ולכן חנוכה נמשך 8 ימים ובערב האחרון דולקים 8 נרות.',
        visual: { kind: 'hanukkiah', lit: 8 },
      },
    ],
  },
  {
    id: 'school',
    label: 'כיתות ב׳–ד׳',
    ages: 'גיל ⁦7–10⁩',
    duration: '⁦20–30⁩ דקות',
    skills: 'חיבור בכמה שלבים, כפל כחיבור חוזר, גימטריה של אותיות הסביבון וסיפור החג',
    stations: [
      {
        id: 'school-shamash', icon: '🕯️', title: 'השמש',
        story: 'בכל ערב של חנוכה מדליקים נר אחד יותר מבערב הקודם: בערב הראשון נר אחד, בערב השני שני נרות, וכך הלאה. בכל ערב מדליקים גם את השמש.',
        question: 'כמה נרות דולקים בערב החמישי, כולל השמש?',
        answer: '6', accept: ['שש', 'שישה'],
        hints: ['בערב החמישי דולקים 5 נרות.', 'אל תשכחו להוסיף את השמש.'],
        solution: '5 נרות ועוד השמש = 6.',
        visual: { kind: 'hanukkiah', lit: 5 },
      },
      {
        id: 'school-box', icon: '📦', title: 'קופסת הנרות',
        story: 'סבתא הדליקה חנוכייה בשלושת הערבים הראשונים של החג, ובכל ערב הדליקה גם שמש.',
        question: 'כמה נרות השתמשה סבתא בשלושת הערבים יחד, כולל השמשים?',
        answer: '9', accept: ['תשע', 'תשעה'],
        hints: ['חשבו כל ערב לבד: נרות הערב ועוד שמש אחד.', 'בערב הראשון 2 נרות, בשני 3, בשלישי 4. עכשיו חברו.'],
        solution: '(1+1) + (2+1) + (3+1) = 2 + 3 + 4 = 9.',
        visual: { kind: 'candleNights', nights: 3 },
      },
      {
        id: 'school-dreidel', icon: '🎲', title: 'הסביבון',
        story: 'לכל אות על הסביבון יש ערך בגימטריה: נ = 50, ג = 3, ה = 5, פ = 80. סובבתם את הסביבון פעמיים: בפעם הראשונה יצאה האות ג, ובפעם השנייה יצאה האות ה.',
        question: 'כמה נקודות קיבלתם בשני הסיבובים יחד?',
        answer: '8', accept: ['שמונה'],
        hints: ['מצאו במקרא את הערך של ג ואת הערך של ה.', 'ג = 3 ו־ה = 5. עכשיו חברו.'],
        solution: 'ג + ה = 3 + 5 = 8.',
        visual: { kind: 'dreidelLetters', letters: ['נ', 'ג', 'ה', 'פ'], picked: ['ג', 'ה'] },
      },
      {
        id: 'school-tray', icon: '🍩', title: 'המגש',
        story: 'על המגש 3 שורות של סופגניות, ובכל שורה 4 סופגניות. הילדים כבר אכלו 7 סופגניות.',
        question: 'כמה סופגניות נשארו על המגש?',
        answer: '5', accept: ['חמש', 'חמישה'],
        hints: ['קודם גלו כמה סופגניות היו על המגש: 3 שורות של 4.', '4 + 4 + 4 = 12. עכשיו הורידו את מה שאכלו.'],
        solution: '3 × 4 = 12, ו־12 − 7 = 5.',
        visual: { kind: 'tray', rows: 3, cols: 4 },
      },
      {
        id: 'school-miracle', icon: '🫒', title: 'הנס',
        story: 'לפי הסיפור, המכבים מצאו פך שמן אחד שהספיק להדלקה של יום אחד בלבד. אבל קרה נס, והשמן דלק שמונה ימים.',
        question: 'כמה ימים יותר ממה שציפו דלק השמן?',
        answer: '7', accept: ['שבע', 'שבעה'],
        hints: ['השמן היה אמור לדלוק יום אחד, ודלק 8 ימים.', 'מה ההפרש בין 8 ל־1?'],
        solution: '8 − 1 = 7 ימים יותר.',
        visual: { kind: 'oilDays', days: 8 },
      },
    ],
  },
]

export const trackById = id => ESCAPE_TRACKS.find(t => t.id === id) || ESCAPE_TRACKS[0]

// The lock code: every station's digit, in station order.
export const codeOf = track => track.stations.map(s => s.answer).join('')

// Niqqud, spaces and final letters never decide; Hebrew number words count as the digit.
const finals = t => t.replace(/[ךםןףץ]/g, c => ({ ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }[c]))
const clean = v => finals(String(v ?? '').normalize('NFKD').replace(/[֑-ׇ]/g, '')).replace(/["'׳״.,!?\s]/g, '')
export function isRight(station, value) {
  const v = clean(value)
  if (!v) return false
  return v === station.answer || (station.accept || []).some(a => clean(a) === v)
}
export const codeMatches = (track, value) => String(value ?? '').replace(/\D/g, '') === codeOf(track)

// Wrong codes for the paper lock: the same digits in another order first (the mistake a group
// that solved every station but mixed the order would make), then single-digit slips.
export function decoyCodes(code, n = 5) {
  const d = [...code], out = []
  const add = c => { if (c !== code && !out.includes(c) && out.length < n) out.push(c) }
  add([...d].reverse().join(''))
  for (let i = 0; i + 1 < d.length; i++) { const s = [...d]; [s[i], s[i + 1]] = [s[i + 1], s[i]]; add(s.join('')) }
  for (let i = d.length - 1; i >= 0; i--) { const s = [...d]; s[i] = String((Number(s[i]) + 1) % 10); add(s.join('')) }
  return out
}

// The fold-over cards of the paper lock: one right code among the decoys, in a fixed shuffled order
// so the right card is never always first or last.
export function lockCards(track) {
  const code = codeOf(track), decoys = decoyCodes(code, 5)
  const slot = (code.split('').reduce((s, x) => s + Number(x), 0)) % (decoys.length + 1)
  const cards = decoys.map(c => ({ code: c, right: false }))
  cards.splice(slot, 0, { code, right: true })
  return cards
}

export const WRONG_MESSAGES = [
  'הסביבון השובב צוחק: זה לא הקוד! חזרו לתחנות ובדקו שוב.',
  'אופס! התיבה עדיין נעולה. אולי ספרה אחת התבלבלה?',
  'כמעט! בדקו שהספרות כתובות לפי סדר התחנות.',
  'הפך לא כאן. ספרו שוב את הנרות ונסו קוד אחר.',
  'קוד לא נכון. נשמו עמוק, חזרו לדף המנעול ונסו שוב.',
]

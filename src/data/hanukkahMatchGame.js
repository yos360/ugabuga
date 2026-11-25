// "Find the match" Hanukkah card game (spot-it style): every two cards share exactly one symbol.
// Decks come from a finite projective plane of prime order n: n²+n+1 cards, n+1 symbols per card.

export const PATH = '/holidays/hanukkah/match-game'

// The first 13 symbols are the small deck (n=3); all 31 are the big deck (n=5).
// art: 'sevivon' is drawn in SVG on the page (there is no dreidel emoji).
export const SYMBOLS = [
  { id: 'hanukkiah', e: '🕎', w: 'חנוכייה' },
  { id: 'sevivon', art: 'sevivon', w: 'סביבון' },
  { id: 'sufganiya', e: '🍩', w: 'סופגנייה' },
  { id: 'candle', e: '🕯️', w: 'נר' },
  { id: 'coin', e: '🪙', w: 'מטבע' },
  { id: 'olive', e: '🫒', w: 'זית' },
  { id: 'gift', e: '🎁', w: 'מתנה' },
  { id: 'star', e: '⭐', w: 'כוכב' },
  { id: 'oil', e: '🪔', w: 'כד שמן' },
  { id: 'flame', e: '🔥', w: 'להבה' },
  { id: 'latke', e: '🥞', w: 'לביבה' },
  { id: 'elephant', e: '🐘', w: 'פיל' },
  { id: 'crown', e: '👑', w: 'כתר' },
  { id: 'shield', e: '🛡️', w: 'מגן' },
  { id: 'moon', e: '🌙', w: 'ירח' },
  { id: 'sparkles', e: '✨', w: 'ניצוצות' },
  { id: 'song', e: '🎶', w: 'שיר' },
  { id: 'potato', e: '🥔', w: 'תפוח אדמה' },
  { id: 'strawberry', e: '🍓', w: 'תות' },
  { id: 'chocolate', e: '🍫', w: 'שוקולד' },
  { id: 'orange', e: '🍊', w: 'תפוז' },
  { id: 'snow', e: '❄️', w: 'פתית שלג' },
  { id: 'umbrella', e: '☔', w: 'מטרייה' },
  { id: 'scarf', e: '🧣', w: 'צעיף' },
  { id: 'gloves', e: '🧤', w: 'כפפות' },
  { id: 'bulb', e: '💡', w: 'נורה' },
  { id: 'temple', e: '🏛️', w: 'מקדש' },
  { id: 'window', e: '🪟', w: 'חלון' },
  { id: 'party', e: '🎉', w: 'מסיבה' },
  { id: 'cookie', e: '🍪', w: 'עוגייה' },
  { id: 'sun', e: '☀️', w: 'שמש' },
]

export const DECKS = [
  { id: 'small', n: 3, emoji: '🧸', label: 'חפיסה קטנה לגן', desc: '13 קלפים, 4 תמונות בכל קלף · גיל 3–6' },
  { id: 'big', n: 5, emoji: '🎴', label: 'חפיסה גדולה', desc: '31 קלפים, 6 תמונות בכל קלף · גיל 6 ומעלה' },
]

export const MODES = [
  { id: 'pics', label: '🖼️ תמונות' },
  { id: 'both', label: '🔤 תמונה ומילה' },
  { id: 'words', label: '📖 מילים בלבד' },
]

// Lines of the projective plane of prime order n, as arrays of symbol indices.
export function buildDeck(n) {
  const cards = []
  const grid = (x, y) => x * n + y
  const slope = m => n * n + m
  for (let m = 0; m < n; m++) for (let b = 0; b < n; b++) {
    const c = []
    for (let x = 0; x < n; x++) c.push(grid(x, (m * x + b) % n))
    c.push(slope(m))
    cards.push(c)
  }
  for (let x = 0; x < n; x++) {
    const c = []
    for (let y = 0; y < n; y++) c.push(grid(x, y))
    c.push(slope(n))
    cards.push(c)
  }
  const inf = []
  for (let m = 0; m <= n; m++) inf.push(slope(m))
  cards.push(inf)
  return cards
}

export function deckCards(deckId) {
  const d = DECKS.find(x => x.id === deckId) || DECKS[0]
  return buildDeck(d.n).map(c => c.map(i => SYMBOLS[i]))
}

export const common = (a, b) => a.filter(s => b.includes(s))

// Small deterministic PRNG so every printed card looks the same each time.
export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

// Where each symbol sits on a round card: one in the middle, the rest on a ring.
// Returns { x, y, scale, rot } with x/y as percent of the card.
export function layout(count, seed) {
  const r = rng(seed)
  const ring = count - 1
  const start = r() * Math.PI * 2
  const out = [{ x: 50, y: 50, scale: 0.9 + r() * 0.3, rot: Math.round((r() - 0.5) * 60) }]
  for (let i = 0; i < ring; i++) {
    const a = start + (i / ring) * Math.PI * 2
    const rad = count > 4 ? 31 : 28
    out.push({ x: 50 + Math.cos(a) * rad, y: 50 + Math.sin(a) * rad, scale: 0.75 + r() * 0.4, rot: Math.round((r() - 0.5) * 90) })
  }
  return out
}

export const GAMES = [
  { emoji: '🗼', title: 'המגדל', text: 'מחלקים לכל שחקן קלף אחד הפוך, ושאר הקלפים בערימה באמצע, פתוחה. כולם הופכים את הקלף שלהם יחד. מי שמוצא ראשון את הסמל המשותף לקלף שלו ולקלף שבראש הערימה — אומר את שמו בקול, לוקח את הקלף ושם אותו על הקלף שלו. כשהערימה נגמרת, מנצח מי שיש לו הכי הרבה קלפים.' },
  { emoji: '🕳️', title: 'מרוקנים את הערימה', text: 'מחלקים את כל הקלפים בין השחקנים, כל אחד מחזיק ערימה הפוכה, ובאמצע קלף אחד פתוח. כולם הופכים את הקלף העליון שלהם. מי שמוצא סמל משותף לקלף שלו ולקלף שבאמצע — אומר אותו ומניח את הקלף שלו באמצע. מנצח מי שנגמרים לו הקלפים ראשון.' },
  { emoji: '🔥', title: 'הקלף החם', text: 'משחקים בסבבים. בכל סבב כל שחקן מחזיק קלף פתוח אחד, ומניחים קלף אחד באמצע. מי שמוצא ראשון את הסמל המשותף לקלף שלו ולאמצעי — זוכה בקלף האמצעי. משחקים חמישה סבבים ומי שאסף הכי הרבה מנצח.' },
  { emoji: '🤝', title: 'כולם ביחד (לקטנים)', text: 'בלי מנצחים: מניחים שני קלפים על השולחן, וכל הילדים מחפשים יחד את הסמל המשותף. מי שמוצא — מצביע ואומר את השם, ומחליפים קלף. מתאים לגן ולמפגש, וגם לילד אחד עם מבוגר.' },
]

export const TEACH = [
  ['🔤', 'תרגול קריאה', 'במצב "מילים בלבד" כל סמל מופיע כמילה. הילדים קוראים את המילה בקול כשהם מוצאים את הזוג — תרגול קריאה שוטפת בלי שירגישו שזה תרגיל.'],
  ['🖼️', 'תמונה ומילה', 'לכיתה א׳ ולתחילת הקריאה: התמונה עוזרת לזהות, והמילה שמתחתיה מתחברת אליה. אחרי כמה סבבים עוברים למילים בלבד.'],
  ['🧸', 'בגן', 'מתחילים בחפיסה הקטנה ובמשחק "כולם ביחד". שואלים "מה זה?" ו"מה עוד יש בחנוכה?", וכך המשחק הופך לשיחה על החג.'],
  ['✂️', 'הכנה', 'מדפיסים על בריסטול או על נייר עבה, גוזרים לפי העיגול, ואפשר לנלן או להדביק על קרטון כדי שהקלפים יחזיקו כל החג.'],
]

export const FAQ = [
  { q: 'איך משחקים במשחק "מצא את הזהה" לחנוכה?', a: 'בכל שני קלפים יש תמונה אחת בדיוק שמופיעה בשניהם. מניחים שני קלפים, ומי שמוצא ראשון את התמונה המשותפת ואומר את שמה — זוכה. בדף יש ארבע גרסאות משחק: המגדל, מרוקנים את הערימה, הקלף החם, וכולם ביחד לקטנים.' },
  { q: 'זה כמו המשחק דאבל?', a: 'זה משחק באותו רעיון — כל שני קלפים חולקים סמל אחד — אבל עם סמלים של חנוכה ושל החורף, ועם אפשרות להציג מילים בעברית במקום תמונות. הקלפים נבנו כאן מאפס ומודפסים בחינם.' },
  { q: 'כמה קלפים יש ולאיזה גיל זה מתאים?', a: 'יש שתי חפיסות: חפיסה קטנה של 13 קלפים עם 4 תמונות בכל קלף, לגיל 3–6, וחפיסה גדולה של 31 קלפים עם 6 תמונות בכל קלף, מגיל 6 ומעלה. שתיהן נבדקו כך שכל שני קלפים חולקים בדיוק תמונה אחת.' },
  { q: 'אפשר לשחק בלי להדפיס?', a: 'כן. בראש הדף יש משחק על המסך: מופיעים שני קלפים, ולוחצים על התמונה המשותפת. סבב אחד הוא 10 זוגות, ובסוף רואים כמה זמן זה לקח.' },
  { q: 'איך מדפיסים את הקלפים?', a: 'בוחרים חפיסה ומצב (תמונות, תמונה ומילה או מילים), ולוחצים על "הדפסת הקלפים". בכל עמוד יש 6 קלפים עגולים לגזירה. מומלץ להדפיס על נייר עבה או בריסטול.' },
]

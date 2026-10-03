// "Guess the word" (the classic letter-guessing game, kid version: balloons instead
// of a hangman). Final letters count as their regular letter: guessing כ also shows ך.
export const CATEGORIES = {
  'בעלי חיים': ['ג׳ירפה', 'פיל', 'תנין', 'קנגורו', 'פינגווין', 'דולפין', 'ארנב', 'צב', 'נמר', 'זברה', 'קוף', 'ינשוף', 'תוכי', 'פרפר', 'דבורה', 'סוס', 'כלב', 'חתול', 'אריה', 'עכביש'],
  'פירות וירקות': ['תפוח', 'בננה', 'אבטיח', 'תות', 'ענבים', 'אננס', 'מלפפון', 'עגבנייה', 'גזר', 'תירס', 'אפרסק', 'שזיף', 'לימון', 'אגס', 'רימון', 'תמר', 'מנגו', 'דובדבן'],
  'כלי תחבורה': ['אוטובוס', 'רכבת', 'מטוס', 'אופניים', 'מסוק', 'סירה', 'אונייה', 'משאית', 'קורקינט', 'טרקטור', 'צוללת', 'חללית', 'אופנוע', 'מונית'],
  'אוכל': ['פיצה', 'פלאפל', 'חומוס', 'שניצל', 'פסטה', 'גלידה', 'עוגה', 'סלט', 'מרק', 'לחם', 'חביתה', 'שוקולד', 'פנקייק', 'במבה', 'ביסלי', 'קציצות'],
  'מקצועות': ['רופא', 'מורה', 'שוטר', 'כבאי', 'טייס', 'אופה', 'צייר', 'נגר', 'זמר', 'טבח', 'וטרינר', 'אסטרונאוט', 'ספר', 'מדען'],
  'בבית': ['מקרר', 'ספה', 'כרית', 'מנורה', 'שולחן', 'כיסא', 'מראה', 'חלון', 'מיטה', 'טלוויזיה', 'ארון', 'שטיח', 'מטבח', 'מקלחת'],
  'ספורט ומשחקים': ['כדורגל', 'כדורסל', 'שחייה', 'טניס', 'ריצה', 'קפיצה', 'מחבואים', 'תופסת', 'קלפים', 'שחמט', 'דמקה', 'חבל'],
  'טבע ומזג אוויר': ['שמש', 'ירח', 'כוכב', 'גשם', 'שלג', 'קשת', 'ענן', 'רוח', 'הר', 'ים', 'נהר', 'יער', 'מדבר', 'פרח', 'עץ'],
}
export const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('')
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
export const norm = ch => FINAL[ch] || ch
export const isLetter = ch => LETTERS.includes(norm(ch))
export const MAX_MISSES = 7

export function pickWord(rand = Math.random, avoid = []) {
  const cats = Object.keys(CATEGORIES)
  for (let t = 0; t < 30; t++) {
    const category = cats[Math.floor(rand() * cats.length)]
    const list = CATEGORIES[category]
    const word = list[Math.floor(rand() * list.length)]
    if (!avoid.includes(word) || t === 29) return { word, category }
  }
  return { word: 'תפוח', category: 'פירות וירקות' }
}

export const lettersIn = word => new Set([...word].filter(isLetter).map(norm))
export const misses = (word, guessed) => [...guessed].filter(l => !lettersIn(word).has(l)).length
export const isWon = (word, guessed) => [...lettersIn(word)].every(l => guessed.has(l))
export const isLost = (word, guessed) => misses(word, guessed) >= MAX_MISSES

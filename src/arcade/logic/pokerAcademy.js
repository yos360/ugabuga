import { bestHand, winners } from './poker.js'

let cardId = 0
const parse = source => source.split(' ').map(token => ({ id: cardId++, rank: token[0] === 'A' ? 1 : token[0] === 'K' ? 13 : token[0] === 'Q' ? 12 : token[0] === 'J' ? 11 : Number(token.slice(0, -1)), suit: 'SHDC'.indexOf(token.at(-1)), up: true }))
export const RANKING = [
  ['רצף צבע', 'חמישה קלפים עוקבים מאותה סדרה', '9S 8S 7S 6S 5S'], ['רביעייה', 'ארבעה קלפים מאותו מספר', 'AS AD AH AC 3S'], ['פול האוס', 'שלישייה וזוג', 'KS KD KH 4C 4D'], ['צבע', 'חמישה קלפים מאותה סדרה', 'AS JS 9S 6S 3S'], ['רצף', 'חמישה מספרים עוקבים', '9S 8D 7H 6C 5S'], ['שלישייה', 'שלושה קלפים מאותו מספר', 'QS QD QH 7C 2S'], ['שני זוגות', 'שני זוגות שונים', 'JS JD 4H 4C 8S'], ['זוג', 'שני קלפים מאותו מספר', '10S 10D AH 7C 3S'], ['קלף גבוה', 'כשאין שילוב, הקלף הגבוה קובע', 'AS KD 9H 6C 3S'],
].map(([name, text, source], index) => ({ id: `rank-${index}`, name, text, cards: parse(source) }))

export const QUESTIONS = [
  { id: 'pair-kicker', level: 'beginner', board: parse('AS AD 7H 4C 2S'), players: [parse('KS QD'), parse('QS JD')], answer: 0, explanation: 'לשניהם זוג אסים מהלוח, אבל הקיקר מלך של יד א׳ גבוה מהמלכה.' },
  { id: 'flush', level: 'beginner', board: parse('2H 5H 9H KC 3S'), players: [parse('AH JH'), parse('KS KD')], answer: 0, explanation: 'יד א׳ משלימה צבע בחמשת קלפי הלב, והוא חזק משלישיית מלכים.' },
  { id: 'full-house', level: 'intermediate', board: parse('8S 8D 3H 3C KS'), players: [parse('8H 2D'), parse('3D AC')], answer: 0, explanation: 'לשתי הידיים פול האוס. שלישיית שמיניות חזקה משלישיית שלשות.' },
  { id: 'wheel', level: 'intermediate', board: parse('2S 3D 4H 9C KD'), players: [parse('AS 5C'), parse('KH QS')], answer: 0, explanation: 'האס יכול להיות נמוך: A‑2‑3‑4‑5 הוא רצף, ולכן יד א׳ מנצחת זוג מלכים.' },
  { id: 'board-tie', level: 'expert', board: parse('AS KS QS JS 10S'), players: [parse('2H 3H'), parse('9D 9C')], answer: 2, explanation: 'רצף הצבע שעל הלוח הוא היד הטובה של כולם, ולכן הקופה מתחלקת.' },
  { id: 'two-pair-kicker', level: 'expert', board: parse('QS QD 6H 6C 2S'), players: [parse('AH 9D'), parse('KH JC')], answer: 0, explanation: 'לשניהם שני זוגות, מלכות ושישיות. האס של יד א׳ הוא הקיקר המכריע.' },
]

export function solveQuestion(question) {
  const result = winners(question.players, question.board)
  return result.winners.length > 1 ? 2 : result.winners[0]
}
export const validateAcademy = () => RANKING.every((item, index) => bestHand(item.cards).name === item.name && bestHand(item.cards).category === 8 - index) && QUESTIONS.every(question => solveQuestion(question) === question.answer)

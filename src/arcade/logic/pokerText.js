// English text for the poker games. The engines keep Hebrew names/messages in their (saved) state;
// the English UI maps them here, so the Hebrew behaviour and the saved games stay unchanged.
export const HAND_NAMES_EN = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush']
export const handName = (hand, en) => (en ? HAND_NAMES_EN[hand.category] : hand.name)

export const LEVELS_EN = { easy: 'Calm', medium: 'Smart', hard: 'Expert' }
export const STREETS_EN = { preflop: 'Pre-flop', flop: 'Flop', turn: 'Turn', river: 'River', ended: 'Done' }

const bots = text => text.replace(/בוט (\d+)/g, 'Bot $1')

// Five-card draw messages (logic/fiveCardDraw.js).
export function drawMessageEn(game) {
  const m = game.message || ''
  if (m === 'בחרו אם לבדוק או להמר לפני ההחלפה') return 'Choose to check or bet before the draw'
  if (m === 'תיקו — הקופה מתחלקת') return 'A tie. The pot is split'
  if (m === 'פרשתם מהיד') return 'You folded the hand'
  if (m === 'המחשב פרש — הקופה שלכם!') return 'The computer folded. The pot is yours!'
  if (m === 'המחשב העלה. בחרו עד 3 קלפים להחלפה') return 'The computer raised. Pick up to 3 cards to swap'
  if (m === 'בחרו עד 3 קלפים להחלפה') return 'Pick up to 3 cards to swap'
  if (/^ניצחתם עם /.test(m)) return `You won with ${HAND_NAMES_EN[game.result?.playerHand?.category] ?? ''}!`
  if (/^המחשב ניצח עם /.test(m)) return `The computer won with ${HAND_NAMES_EN[game.result?.computerHand?.category] ?? ''}`
  const swap = /^החלפתם (\d+) קלפים, המחשב החליף (\d+)\./.exec(m)
  if (swap) return `You swapped ${swap[1]} cards, the computer swapped ${swap[2]}. Final betting round`
  return m
}

// Hold'em messages (logic/holdem.js).
export function holdemMessageEn(message = '') {
  const m = message
  if (m === 'הטורניר הסתיים') return 'The tournament is over'
  const blinds = /^בליינדים (.+)$/.exec(m)
  if (blinds) return `Blinds ${blinds[1]}`
  const won = /^קיבלתם (\d+) אסימונים$/.exec(m)
  if (won) return `You won ${won[1]} chips`
  const pot = /^(.+) זכו בקופה$/.exec(m)
  if (pot) return `${bots(pot[1])} won the pot`
  return bots(m)
}
export const holdemName = (name, en) => (en ? bots(name).replace('אתם', 'You') : name)

// Poker academy (logic/pokerAcademy.js): ranking descriptions by index (strongest first) and puzzle explanations by id.
export const RANKING_TEXT_EN = [
  'Five consecutive cards of the same suit', 'Four cards of the same rank', 'Three of a kind and a pair', 'Five cards of the same suit', 'Five consecutive ranks',
  'Three cards of the same rank', 'Two different pairs', 'Two cards of the same rank', 'With no combination, the highest card decides',
]
export const EXPLANATIONS_EN = {
  'pair-kicker': 'Both have a pair of aces from the board, but hand A\'s king kicker beats the queen.',
  flush: 'Hand A completes a flush with five hearts, which beats three kings.',
  'full-house': 'Both hands have a full house. Three eights beat three threes.',
  wheel: 'The ace can be low: A-2-3-4-5 is a straight, so hand A beats a pair of kings.',
  'board-tie': 'The straight flush on the board is everyone\'s best hand, so the pot is split.',
  'two-pair-kicker': 'Both have two pair, queens and sixes. Hand A\'s ace is the deciding kicker.',
}

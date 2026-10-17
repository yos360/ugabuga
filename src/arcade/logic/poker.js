export const HAND_NAMES = ['קלף גבוה', 'זוג', 'שני זוגות', 'שלישייה', 'רצף', 'צבע', 'פול האוס', 'רביעייה', 'רצף צבע']

const compareArrays = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0); return 0 }

export function evaluateFive(cards) {
  if (!Array.isArray(cards) || cards.length !== 5 || new Set(cards.map(card => card.id)).size !== 5) throw new Error('evaluateFive expects five unique cards')
  const ranks = cards.map(card => card.rank).sort((a, b) => b - a), counts = new Map()
  ranks.forEach(rank => counts.set(rank, (counts.get(rank) || 0) + 1))
  const groups = [...counts].map(([rank, count]) => ({ rank, count })).sort((a, b) => b.count - a.count || b.rank - a.rank)
  // Shared cards use Ace=1. Normalize it to 14 for poker comparisons.
  const pokerRanks = ranks.map(rank => rank === 1 ? 14 : rank).sort((a, b) => b - a), pokerUnique = [...new Set(pokerRanks)]
  const straightHigh = pokerUnique.length === 5 && pokerUnique[0] - pokerUnique[4] === 4 ? pokerUnique[0] : pokerUnique.join(',') === '14,5,4,3,2' ? 5 : 0
  const flush = cards.every(card => card.suit === cards[0].suit)
  let category, kickers
  if (flush && straightHigh) { category = 8; kickers = [straightHigh] }
  else if (groups[0].count === 4) { category = 7; kickers = [groups[0].rank === 1 ? 14 : groups[0].rank, groups[1].rank === 1 ? 14 : groups[1].rank] }
  else if (groups[0].count === 3 && groups[1].count === 2) { category = 6; kickers = [groups[0].rank === 1 ? 14 : groups[0].rank, groups[1].rank === 1 ? 14 : groups[1].rank] }
  else if (flush) { category = 5; kickers = pokerRanks }
  else if (straightHigh) { category = 4; kickers = [straightHigh] }
  else if (groups[0].count === 3) { category = 3; kickers = [groups[0].rank === 1 ? 14 : groups[0].rank, ...groups.slice(1).map(group => group.rank === 1 ? 14 : group.rank).sort((a, b) => b - a)] }
  else if (groups[0].count === 2 && groups[1].count === 2) {
    const pairs = groups.filter(group => group.count === 2).map(group => group.rank === 1 ? 14 : group.rank).sort((a, b) => b - a)
    category = 2; kickers = [...pairs, groups.find(group => group.count === 1).rank === 1 ? 14 : groups.find(group => group.count === 1).rank]
  } else if (groups[0].count === 2) { category = 1; kickers = [groups[0].rank === 1 ? 14 : groups[0].rank, ...groups.slice(1).map(group => group.rank === 1 ? 14 : group.rank).sort((a, b) => b - a)] }
  else { category = 0; kickers = pokerRanks }
  return { category, name: HAND_NAMES[category], kickers, score: [category, ...kickers], cards: [...cards] }
}

const combinations = (cards, count, start = 0, picked = [], out = []) => {
  if (picked.length === count) { out.push([...picked]); return out }
  for (let index = start; index <= cards.length - (count - picked.length); index++) combinations(cards, count, index + 1, [...picked, cards[index]], out)
  return out
}

export function bestHand(cards) {
  if (!Array.isArray(cards) || cards.length < 5 || cards.length > 7 || new Set(cards.map(card => card.id)).size !== cards.length) throw new Error('bestHand expects 5–7 unique cards')
  return combinations(cards, 5).map(evaluateFive).reduce((best, hand) => compareHands(hand, best) > 0 ? hand : best)
}

export const compareHands = (a, b) => compareArrays(a.score, b.score)

export function winners(players, board = []) {
  const evaluated = players.map((cards, index) => ({ index, hand: bestHand([...cards, ...board]) }))
  const best = evaluated.reduce((winner, item) => compareHands(item.hand, winner.hand) > 0 ? item : winner)
  return { winners: evaluated.filter(item => compareHands(item.hand, best.hand) === 0).map(item => item.index), hands: evaluated.map(item => item.hand) }
}

export function drawOdds(outs, unseen = 47, cardsToCome = 1) {
  const safeOuts = Math.max(0, Math.min(outs, unseen)); if (!safeOuts || cardsToCome <= 0) return 0
  let miss = 1
  for (let card = 0; card < cardsToCome; card++) miss *= (unseen - safeOuts - card) / (unseen - card)
  return 1 - miss
}

export const formatOdds = probability => `${Math.round(probability * 100)}%`

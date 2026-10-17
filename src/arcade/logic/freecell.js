import { deck, shuffled, isRed } from './cards.js'
import { rng } from './rng.js'

export function deal(number = Math.floor(Math.random() * 1_000_000) + 1) {
  const cards = shuffled(deck().map(card => ({ ...card, up: true })), rng(number))
  const tab = Array.from({ length: 8 }, () => [])
  cards.forEach((card, index) => tab[index % 8].push(card))
  return { version: 1, dealNumber: number, tab, cells: [null, null, null, null], found: [[], [], [], []], moves: 0 }
}

export const sequence = (pile, index) => pile.slice(index).every((card, offset, run) => !offset || run[offset - 1].rank === card.rank + 1 && isRed(run[offset - 1]) !== isRed(card))

export function movableCount(state, destinationPile = -1) {
  const freeCells = state.cells.filter(card => !card).length
  let emptyColumns = state.tab.filter(pile => !pile.length).length
  if (destinationPile >= 0 && !state.tab[destinationPile].length) emptyColumns--
  return (freeCells + 1) * (2 ** Math.max(0, emptyColumns))
}

const sourceCards = (state, source) => {
  if (source.type === 'tab') return state.tab[source.pile].slice(source.index)
  if (source.type === 'cell') return state.cells[source.pile] ? [state.cells[source.pile]] : []
  if (source.type === 'found') return state.found[source.pile].length ? [state.found[source.pile].at(-1)] : []
  return []
}

export function legal(state, source, target) {
  const cards = sourceCards(state, source)
  if (!cards.length || (source.type === 'tab' && !sequence(state.tab[source.pile], source.index))) return false
  if (target.type === 'cell') return cards.length === 1 && !state.cells[target.pile] && !(source.type === 'cell' && source.pile === target.pile)
  if (target.type === 'found') {
    if (cards.length !== 1) return false
    const card = cards[0], pile = state.found[target.pile]
    return card.suit === target.pile && card.rank === (pile.at(-1)?.rank || 0) + 1
  }
  if (target.type !== 'tab' || (source.type === 'tab' && source.pile === target.pile)) return false
  if (cards.length > movableCount(state, target.pile)) return false
  const top = state.tab[target.pile].at(-1), first = cards[0]
  return !top || (top.rank === first.rank + 1 && isRed(top) !== isRed(first))
}

export function apply(state, source, target) {
  if (!legal(state, source, target)) return null
  const next = { ...state, tab: state.tab.map(pile => [...pile]), cells: [...state.cells], found: state.found.map(pile => [...pile]), moves: state.moves + 1 }
  let cards
  if (source.type === 'tab') { cards = next.tab[source.pile].splice(source.index) }
  else if (source.type === 'cell') { cards = [next.cells[source.pile]]; next.cells[source.pile] = null }
  else cards = [next.found[source.pile].pop()]
  if (target.type === 'tab') next.tab[target.pile].push(...cards)
  else if (target.type === 'cell') next.cells[target.pile] = cards[0]
  else next.found[target.pile].push(cards[0])
  return next
}

export function bestTarget(state, source) {
  const card = sourceCards(state, source)[0]
  if (!card) return null
  const foundation = { type: 'found', pile: card.suit }
  if (legal(state, source, foundation)) return foundation
  for (let pile = 0; pile < 8; pile++) if (legal(state, source, { type: 'tab', pile }) && state.tab[pile].length) return { type: 'tab', pile }
  const cell = state.cells.findIndex(value => !value)
  return cell >= 0 && legal(state, source, { type: 'cell', pile: cell }) ? { type: 'cell', pile: cell } : null
}

const sources = state => [
  ...state.tab.flatMap((pile, p) => pile.map((_, index) => ({ type: 'tab', pile: p, index })).filter(source => sequence(pile, source.index))),
  ...state.cells.map((card, pile) => card && ({ type: 'cell', pile })).filter(Boolean),
]

export function findHint(state) {
  for (const source of sources(state)) {
    const card = sourceCards(state, source)[0], target = { type: 'found', pile: card.suit }
    if (legal(state, source, target)) return { source, target }
  }
  for (const source of sources(state)) for (let pile = 0; pile < 8; pile++) {
    const target = { type: 'tab', pile }
    if (legal(state, source, target) && state.tab[pile].length) return { source, target }
  }
  for (const source of sources(state)) for (let pile = 0; pile < 4; pile++) if (legal(state, source, { type: 'cell', pile })) return { source, target: { type: 'cell', pile } }
  return null
}

export function autoStep(state) {
  for (const source of sources(state)) {
    const card = sourceCards(state, source)[0], target = { type: 'found', pile: card.suit }
    if (legal(state, source, target)) return apply(state, source, target)
  }
  return null
}

export function autoFinish(state) {
  let next = state
  for (let count = 0; count < 52; count++) { const moved = autoStep(next); if (!moved) break; next = moved }
  return next
}

export const isWon = state => state.found.reduce((sum, pile) => sum + pile.length, 0) === 52

export function validState(value) {
  if (value?.version !== 1 || !Array.isArray(value.tab) || value.tab.length !== 8 || !Array.isArray(value.cells) || value.cells.length !== 4 || !Array.isArray(value.found) || value.found.length !== 4) return false
  const cards = [...value.tab.flat(), ...value.cells.filter(Boolean), ...value.found.flat()]
  return cards.length === 52 && new Set(cards.map(card => card.id)).size === 52 && cards.every(card => Number.isInteger(card.id) && card.id >= 0 && card.id < 52 && card.rank >= 1 && card.rank <= 13 && card.suit >= 0 && card.suit < 4)
}

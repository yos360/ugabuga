// The English Hanukkah guides (pages in EnglishHanukkah.jsx); plain data so the route catalog,
// sitemap and tests can import it in Node.
import { HOLIDAY_ROOT as ROOT } from './holidayData.js'

export const HANUKKAH_ROOT = `${ROOT}/hanukkah`
export const HANUKKAH_GUIDES = [
  { slug: 'how-to-play-dreidel', emoji: '🎲', title: 'How to play dreidel: rules, letters and a virtual dreidel', short: 'How to play dreidel', blurb: 'The four letters, the simple rules and a dreidel you can spin on screen.', counterpart: '/holidays/hanukkah/sevivon' },
  { slug: 'candle-lighting', emoji: '🕎', title: 'Hanukkah candle lighting: blessings and a night-by-night guide', short: 'Candle lighting and blessings', blurb: 'The three blessings in Hebrew, transliteration and English, and how many candles to light each night.', counterpart: '/holidays/blessings/hanukkah' },
  { slug: 'activities', emoji: '✨', title: 'Hanukkah activities for kids: 12 ideas for home and class', short: 'Hanukkah activities for kids', blurb: 'Twelve easy ideas for the eight nights, with printables and games.', counterpart: '/holidays/hanukkah/what-to-do' },
]
export const HANUKKAH_GUIDE_PAGES = HANUKKAH_GUIDES.map(g => ({ path: `${HANUKKAH_ROOT}/${g.slug}`, title: g.title, counterpart: g.counterpart }))

// The dreidel game: letters, rules and one spin of the score-keeping game.
export const LETTERS = {
  nun: { he: 'נ', name: 'Nun', word: 'Nes (miracle)', rule: 'Nothing happens. Pass the dreidel on.' },
  gimel: { he: 'ג', name: 'Gimel', word: 'Gadol (great)', rule: 'Take the whole pot!' },
  hey: { he: 'ה', name: 'Hey', word: 'Hayah (happened)', rule: 'Take half the pot (round up if it is odd).' },
  shin: { he: 'ש', name: 'Shin', word: 'Sham (there)', rule: 'Put one token into the pot.' },
  pe: { he: 'פ', name: 'Pe', word: 'Po (here)', rule: 'Put one token into the pot — the Israeli dreidel’s fourth letter.' },
}
const START_TOKENS = 10

export function playDreidel(game, letter) {
  const coins = [...game.coins], p = game.turn
  let pot = game.pot, note
  if (letter === 'gimel') { coins[p] += pot; note = `took the whole pot (${pot})`; pot = 0 }
  else if (letter === 'hey') { const half = Math.ceil(pot / 2); coins[p] += half; pot -= half; note = `took half the pot (${half})` }
  else if (letter === 'shin' || letter === 'pe') { if (coins[p] > 0) { coins[p]--; pot++ } note = 'put one in' }
  else note = 'nothing happens'
  // An empty (or one-token) pot: everyone who still has tokens adds one.
  if (pot <= 1) coins.forEach((c, i) => { if (c > 0) { coins[i]--; pot++ } })
  const alive = coins.map((c, i) => c > 0 ? i : -1).filter(i => i >= 0)
  let turn = (p + 1) % coins.length
  while (alive.length > 1 && coins[turn] <= 0) turn = (turn + 1) % coins.length
  return { coins, pot, turn, winner: alive.length === 1 ? alive[0] : null, log: [`${game.names[p]} spun ${LETTERS[letter].name}: ${note}.`, ...game.log].slice(0, 6), names: game.names }
}
export function newDreidelGame(names) {
  return { names, coins: names.map(() => START_TOKENS - 1), pot: names.length, turn: 0, winner: null, log: [] }
}


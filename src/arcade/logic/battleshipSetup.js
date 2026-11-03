import { randomFleet, newSea } from './battleship.js'
import { rng } from './rng.js'

export function setupBattle(daily, lang = 'he') {
  return {
    phase: 'setup',
    mine: newSea(randomFleet(daily ? rng(daily.seed + 31) : Math.random)),
    enemy: newSea(randomFleet(daily ? rng(daily.seed) : Math.random)),
    turn: 'me',
    myShots: 0,
    aiRand: daily ? rng(daily.seed + 17) : Math.random,
    msg: lang === 'en' ? 'This is your fleet. You can shuffle it, then press ▶ Start!' : daily ? 'זה הצי היומי, זהה לכולם. ▶ מתחילים!' : 'זה הצי שלכם. אפשר לערבב, ואז ▶ מתחילים!',
  }
}

import { randomFleet, newSea } from './battleship.js'
import { rng } from './rng.js'

export function setupBattle(daily) {
  return {
    phase: 'setup',
    mine: newSea(randomFleet(daily ? rng(daily.seed + 31) : Math.random)),
    enemy: newSea(randomFleet(daily ? rng(daily.seed) : Math.random)),
    turn: 'me',
    myShots: 0,
    aiRand: daily ? rng(daily.seed + 17) : Math.random,
    msg: daily ? 'זה הצי היומי, זהה לכולם. ▶ מתחילים!' : 'זה הצי שלכם. אפשר לערבב, ואז ▶ מתחילים!',
  }
}

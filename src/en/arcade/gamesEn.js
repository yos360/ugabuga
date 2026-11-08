// All English game pages of this area as pure data: slug -> copy. Each group file is owned by one part of the port.
import { PUZZLES } from './meta/puzzles.js'
import { CLASSIC } from './meta/classic.js'
import { SOLITAIRE } from './meta/solitaire.js'
import { CARDS } from './meta/cards.js'
import { BRAIN } from './meta/brain.js'
import { EXTRA } from './meta/extra.js'

export const ARCADE_EN = { ...PUZZLES, ...CLASSIC, ...SOLITAIRE, ...CARDS, ...BRAIN, ...EXTRA }
export const ARCADE_EN_GROUPS = [
  ['Puzzles and action', Object.keys(PUZZLES)],
  ['Classic games', Object.keys(CLASSIC)],
  ['Solitaire', Object.keys(SOLITAIRE)],
  ['Card games', Object.keys(CARDS)],
  ['Brain teasers', Object.keys(BRAIN)],
  ['Words and pictures', Object.keys(EXTRA)],
]

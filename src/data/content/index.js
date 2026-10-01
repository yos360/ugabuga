import { TRIVIA_1 } from './trivia1'
import { TRIVIA_2 } from './trivia2'
import { TRIVIA_3 } from './trivia3'
import { TRIVIA_4 } from './trivia4'
export { GREETING_PAGES } from './greetings'
export { QUESTION_PAGES } from './questions'

export const TRIVIA_GROUPS = [
  { title: 'טבע ומדע', items: TRIVIA_1 },
  { title: 'ישראל, חגים ועברית', items: TRIVIA_2 },
  { title: 'העולם, ספורט ותרבות', items: TRIVIA_3 },
  { title: 'לפי גיל ונושאים', items: TRIVIA_4 },
]
export const TRIVIA_TOPICS = [...TRIVIA_1, ...TRIVIA_2, ...TRIVIA_3, ...TRIVIA_4]
import { ANIMALS_1 } from './animals1'
import { ANIMALS_2 } from './animals2'
import { ANIMALS_3 } from './animals3'
import { ANIMALS_4 } from './animals4'
import { ANIMALS_5 } from './animals5'
export { RIDDLE_PAGES } from './riddles'
export { JOKE_PAGES } from './jokes'
export { HUNT_PAGES } from './hunts'
export { ABC_LETTERS } from './abcLetters'
export const ANIMAL_GROUPS = [
  { title: 'חיות הספארי', items: ANIMALS_1 },
  { title: 'חיות ים וקור', items: ANIMALS_2 },
  { title: 'חיות בית וחווה', items: ANIMALS_3 },
  { title: 'חרקים, זוחלים ודו-חיים', items: ANIMALS_4 },
  { title: 'ציפורים ויונקי בר', items: ANIMALS_5 },
]
export const ANIMALS = [...ANIMALS_1, ...ANIMALS_2, ...ANIMALS_3, ...ANIMALS_4, ...ANIMALS_5]

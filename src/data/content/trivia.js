// Trivia topics, split out so a page needing them doesn't also load animals, riddles, jokes…
import { TRIVIA_1 } from './trivia1'
import { TRIVIA_2 } from './trivia2'
import { TRIVIA_3 } from './trivia3'
import { TRIVIA_4 } from './trivia4'

export const TRIVIA_GROUPS = [
  { title: 'טבע ומדע', items: TRIVIA_1 },
  { title: 'ישראל, חגים ועברית', items: TRIVIA_2 },
  { title: 'העולם, ספורט ותרבות', items: TRIVIA_3 },
  { title: 'לפי גיל ונושאים', items: TRIVIA_4 },
]
export const TRIVIA_TOPICS = [...TRIVIA_1, ...TRIVIA_2, ...TRIVIA_3, ...TRIVIA_4]

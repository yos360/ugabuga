// Animal pages data, split out so other content pages don't load it.
import { ANIMALS_1 } from './animals1'
import { ANIMALS_2 } from './animals2'
import { ANIMALS_3 } from './animals3'
import { ANIMALS_4 } from './animals4'
import { ANIMALS_5 } from './animals5'

export const ANIMAL_GROUPS = [
  { title: 'חיות הספארי', items: ANIMALS_1 },
  { title: 'חיות ים וקור', items: ANIMALS_2 },
  { title: 'חיות בית וחווה', items: ANIMALS_3 },
  { title: 'חרקים, זוחלים ודו-חיים', items: ANIMALS_4 },
  { title: 'ציפורים ויונקי בר', items: ANIMALS_5 },
]
export const ANIMALS = [...ANIMALS_1, ...ANIMALS_2, ...ANIMALS_3, ...ANIMALS_4, ...ANIMALS_5]

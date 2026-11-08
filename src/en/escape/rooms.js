// All English escape rooms, in the same order as the Hebrew list (src/data/escapeRoomsExpanded.js).
import { ROOMS_A } from './rooms-a'
import { ROOMS_B } from './rooms-b'
import { ROOMS_C } from './rooms-c'

export const EN_ESCAPE_ROOMS = [...ROOMS_A, ...ROOMS_B, ...ROOMS_C]
export const EN_ROOM_BY_ID = Object.fromEntries(EN_ESCAPE_ROOMS.map(r => [r.id, r]))

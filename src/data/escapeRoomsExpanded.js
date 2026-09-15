import { ESCAPE_ROOMS } from './escapeRooms'
import { MORE_ESCAPE_ROOMS } from './escapeRoomsMore'

const roomIds = new Set()

export const ESCAPE_ROOMS_EXPANDED = [...ESCAPE_ROOMS, ...MORE_ESCAPE_ROOMS].filter((room) => {
  if (roomIds.has(room.id)) return false
  roomIds.add(room.id)
  return true
})

export const ESCAPE_ROOM_BY_ID_EXPANDED = Object.fromEntries(
  ESCAPE_ROOMS_EXPANDED.map((room) => [room.id, room])
)

export { ESCAPE_ROOMS_EXPANDED as ESCAPE_ROOMS }

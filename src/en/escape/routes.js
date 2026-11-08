// { path, Component: lazy(() => import('./Page')), props? } for each English escape-room page,
// rendered by src/en/EnglishExtra.jsx. One explicit route per room and per topic, so an unknown slug
// falls through to the English 404 instead of rendering an empty page.
import { lazy } from 'react'
import { ESCAPE_BASE, ESCAPE_ROOM_META, ESCAPE_TOPIC_META } from './catalog'

const Rooms = lazy(() => import('./EnglishEscapeRooms'))
const Collection = lazy(() => import('./EnglishEscapeCollection'))

export const ESCAPE_ROUTES = [
  { path: ESCAPE_BASE, Component: Rooms },
  ...ESCAPE_TOPIC_META.map(([slug]) => ({ path: `${ESCAPE_BASE}/topic/${slug}`, Component: Collection, props: { slug } })),
  ...ESCAPE_ROOM_META.map(([id]) => ({ path: `${ESCAPE_BASE}/${id}`, Component: Rooms, props: { roomId: id } })),
]

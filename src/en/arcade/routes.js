import { lazy } from 'react'
import { BOARD_ROUTES } from './boardRoutes.js'
import { SUDOKU_ROUTES } from './sudokuRoutes.js'
const BrainPage = lazy(() => import('./EnglishBrainGames'))
// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
// Specific pages first: the first match wins, and /en/online-games/:slug catches every game of ARCADE_EN.
export const ARCADE_ROUTES = [
  ...BOARD_ROUTES,
  ...SUDOKU_ROUTES,
  { path: '/en/brain-games', Component: BrainPage },
  ...['matchsticks', 'river-crossing', 'lights-out', 'logic', 'kids'].map(topic => ({ path: `/en/brain-games/${topic}`, Component: BrainPage, props: { topic } })),
  { path: '/en/online-games', Component: lazy(() => import('./EnglishArcade').then(m => ({ default: m.EnglishArcadeHub }))) },
  { path: '/en/online-games/:slug', Component: lazy(() => import('./EnglishArcade').then(m => ({ default: m.EnglishArcadeGame }))) },
]

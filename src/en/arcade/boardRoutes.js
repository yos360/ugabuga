import { lazy } from 'react'
// Routes of the English chess / checkers / backgammon pages.
const Page = lazy(() => import('./boards/EnglishBoardGame'))
export const BOARD_ROUTES = [
  { path: '/en/chess', Component: Page, props: { slug: 'chess' } },
  { path: '/en/checkers', Component: Page, props: { slug: 'checkers' } },
  { path: '/en/backgammon', Component: Page, props: { slug: 'backgammon' } },
]

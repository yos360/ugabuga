import { lazy } from 'react'

// Rendered by src/en/EnglishExtra.jsx. The page component tells a level path from a test slug.
const Page = lazy(() => import('./Comprehension'))
export const COMPREHENSION_ROUTES = [
  { path: '/en/reading-comprehension', Component: Page },
  { path: '/en/reading-comprehension/:x', Component: Page },
]

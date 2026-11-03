import { lazy } from 'react'

// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
// Fixed paths come before the patterns that could match them (first match wins).
const AbcPrintables = lazy(() => import('./AbcPrintables'))

export const READING_ROUTES = [
  { path: '/en/reading', Component: lazy(() => import('./ReadingHub')) },
  { path: '/en/reading/:slug', Component: lazy(() => import('./ReadingStory')) },
  { path: '/en/abc', Component: lazy(() => import('./AbcHub')) },
  { path: '/en/abc/tracing', Component: AbcPrintables, props: { kind: 'tracing' } },
  { path: '/en/abc/flashcards', Component: AbcPrintables, props: { kind: 'flashcards' } },
  { path: '/en/abc/handwriting-lines', Component: AbcPrintables, props: { kind: 'handwriting' } },
  { path: '/en/abc/:letter', Component: lazy(() => import('./AbcLetter')) },
  { path: '/en/words', Component: lazy(() => import('./WordsHub')) },
  { path: '/en/words/:topic', Component: lazy(() => import('./WordsTopic')) },
]

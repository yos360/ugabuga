import { lazy } from 'react'
import { ACTIVITY_TYPES } from './catalog'

// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
// The first matching path wins, so specific paths come before the /math/:topic pattern.
const Hub = lazy(() => import('./EnglishWorksheetsHub'))
const Math = lazy(() => import('./EnglishMath'))
const Clock = lazy(() => import('./EnglishVisual').then(m => ({ default: m.EnglishClock })))
const Fractions = lazy(() => import('./EnglishVisual').then(m => ({ default: m.EnglishFractions })))
const Paper = lazy(() => import('./EnglishPaper'))
const Mazes = lazy(() => import('./EnglishMazes'))
const Activities = lazy(() => import('./EnglishPrintActivities'))
const Booklets = lazy(() => import('./EnglishBooklets'))

export const WORKSHEETS_ROUTES = [
  { path: '/en/worksheets', Component: Hub },
  { path: '/en/worksheets/math/clock', Component: Clock },
  { path: '/en/worksheets/math/fractions', Component: Fractions },
  { path: '/en/worksheets/math', Component: Math },
  { path: '/en/worksheets/math/:topic', Component: Math },
  { path: '/en/worksheets/paper/:kind', Component: Paper },
  { path: '/en/worksheets/mazes', Component: Mazes },
  { path: '/en/worksheets/booklets/:slug', Component: Booklets },
  ...Object.values(ACTIVITY_TYPES).flatMap(t => [
    { path: `/en/worksheets/${t.slug}`, Component: Activities, props: { type: t.slug } },
    { path: `/en/worksheets/${t.slug}/:theme`, Component: Activities, props: { type: t.slug } },
  ]),
]

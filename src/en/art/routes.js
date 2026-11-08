import { lazy } from 'react'

// { path, Component } for each English page of this area, rendered by src/en/EnglishExtra.jsx
// (the component receives the route params as "params"). The first matching path wins, so
// /mandalas comes before the /:slug pattern.
const DrawHub = lazy(() => import('./HowToDrawEn').then(m => ({ default: m.HowToDrawHubEn })))
const DrawPage = lazy(() => import('./HowToDrawEn'))
const CbnHub = lazy(() => import('./ColorByNumberEn'))
const CbnMandalas = lazy(() => import('./ColorByNumberEn').then(m => ({ default: m.CbnMandalasEn })))
const CbnPicture = lazy(() => import('./ColorByNumberEn').then(m => ({ default: m.CbnPictureEn })))
const AnswerHub = lazy(() => import('./ColorByCodeEn'))
const AnswerKind = lazy(() => import('./ColorByCodeEn').then(m => ({ default: m.ColorByAnswerKindEn })))
const ByLetter = lazy(() => import('./ColorByCodeEn').then(m => ({ default: m.ColorByLetterEn })))

export const ART_ROUTES = [
  { path: '/en/how-to-draw', Component: DrawHub },
  { path: '/en/how-to-draw/:slug', Component: DrawPage },
  { path: '/en/printables/color-by-number', Component: CbnHub },
  { path: '/en/printables/color-by-number/mandalas', Component: CbnMandalas },
  { path: '/en/printables/color-by-number/:slug', Component: CbnPicture },
  { path: '/en/printables/color-by-answer', Component: AnswerHub },
  { path: '/en/printables/color-by-answer/:op', Component: AnswerKind },
  { path: '/en/printables/color-by-letter', Component: ByLetter },
]

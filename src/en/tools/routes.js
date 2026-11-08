// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
import { lazy } from 'react'

export const TOOLS_ROUTES = [
  { path: '/en/tools', Component: lazy(() => import('./EnglishToolsHub')) },
  { path: '/en/tools/calculator', Component: lazy(() => import('./EnglishCalculator')) },
  { path: '/en/tools/hebrew-keyboard', Component: lazy(() => import('./EnglishHebrewKeyboard')) },
  { path: '/en/tools/pdf', Component: lazy(() => import('./EnglishPdf')) },
  { path: '/en/tools/qr-code', Component: lazy(() => import('./EnglishQr')) },
  { path: '/en/typing', Component: lazy(() => import('./EnglishTyping')) },
]

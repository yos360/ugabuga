import { lazy } from 'react'
// Routes of the English trivia, riddles and jokes pages: [{ path, Component, props? }].
// Rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
const Hub = lazy(() => import('./EnglishFun').then(m => ({ default: m.EnglishFunHub })))
const Page = lazy(() => import('./EnglishFun').then(m => ({ default: m.EnglishFunPage })))
export const FUN_ROUTES = ['trivia', 'riddles', 'jokes'].flatMap(kind => [
  { path: `/en/${kind}`, Component: Hub, props: { kind } },
  { path: `/en/${kind}/:slug`, Component: Page, props: { kind } },
])

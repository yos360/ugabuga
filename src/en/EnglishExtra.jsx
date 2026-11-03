import { matchPath, useLocation } from 'react-router-dom'
import { EnglishNotFound } from './EnglishLayout'
import { TOOLS_ROUTES } from './tools/routes'
import { EXCEL_ROUTES } from './excel/routes'
import { WORKSHEETS_ROUTES } from './worksheets/routes'
import { ARCADE_ROUTES } from './arcade/routes'
import { READING_ROUTES } from './reading/routes'

// Every English page beyond the original collection (tools, the Excel course, worksheets, online games,
// reading). App.jsx sends /en/* here as one lazy chunk, so dozens of pages add nothing to the entry bundle.
// Each area lists its own routes (src/en/<area>/routes.js); the first matching path wins.
const ROUTES = [...TOOLS_ROUTES, ...EXCEL_ROUTES, ...WORKSHEETS_ROUTES, ...ARCADE_ROUTES, ...READING_ROUTES]

export default function EnglishExtra() {
  const { pathname } = useLocation()
  for (const r of ROUTES) {
    const m = matchPath({ path: r.path, end: true }, pathname)
    if (m) return <r.Component {...(r.props || {})} params={m.params} />
  }
  return <EnglishNotFound />
}

// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
import { lazy } from 'react'

const Course = lazy(() => import('./ExcelCourseEn'))
export const EXCEL_ROUTES = [
  { path: '/en/excel', Component: Course },
  { path: '/en/excel/:lesson', Component: Course },
]

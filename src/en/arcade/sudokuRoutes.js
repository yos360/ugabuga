import { lazy } from 'react'
// Routes of the English sudoku pages: [{ path, Component: lazy(() => import('./...')), props? }]
const page = name => lazy(() => import('./sudoku/EnglishSudoku').then(m => ({ default: m[name] })))
export const SUDOKU_ROUTES = [
  { path: '/en/sudoku', Component: page('EnglishSudokuHub') },
  ...['easy', 'medium', 'hard', 'very-hard'].map(level => ({ path: `/en/sudoku/${level}`, Component: page('EnglishSudokuLevel'), props: { level } })),
  { path: '/en/sudoku/kids', Component: page('EnglishSudokuKids') },
  { path: '/en/sudoku/daily', Component: page('EnglishSudokuDaily') },
  { path: '/en/sudoku/solver', Component: page('EnglishSudokuSolver') },
]
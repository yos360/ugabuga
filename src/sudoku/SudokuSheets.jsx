import { geom } from './engine.js'
import { LEVEL_META } from './puzzles.js'

// Crisp vector grid for print sheets and thumbnails.
export function SudokuSvg({ puzzle, showSolution = false, title }) {
  const { n } = puzzle
  const { br, bc } = geom(n)
  const S = 100 / n, lines = []
  for (let k = 1; k < n; k++) {
    const thickV = k % bc === 0, thickH = k % br === 0
    lines.push(<line key={`v${k}`} x1={k * S} y1="0" x2={k * S} y2="100" stroke="#111" strokeWidth={thickV ? 0.9 : 0.3} />)
    lines.push(<line key={`h${k}`} x1="0" y1={k * S} x2="100" y2={k * S} stroke="#111" strokeWidth={thickH ? 0.9 : 0.3} />)
  }
  return (
    <svg viewBox="-1 -1 102 102" role="img" aria-label={title || `סודוקו ${n} על ${n}`} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="100" height="100" fill="#fff" stroke="#111" strokeWidth="1.4" />
      {lines}
      {puzzle.puzzle.map((v, i) => {
        const shown = v || (showSolution ? puzzle.solution[i] : 0)
        if (!shown) return null
        const x = (i % n) * S + S / 2, y = Math.floor(i / n) * S + S / 2
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily="Fredoka, Heebo, Arial, sans-serif"
          fontSize={S * 0.62} fontWeight={v ? 700 : 400} fill={v ? '#111' : '#6b7280'}>{shown}</text>
      })}
    </svg>
  )
}

const LAYOUTS = { 1: [1, 1], 2: [1, 2], 4: [2, 2], 6: [2, 3] }
export const PER_PAGE_OPTIONS = [1, 2, 4, 6]
const label = p => `${LEVEL_META[p.level]?.long || 'סודוקו'} · מס׳ ${p.seed}`

function Sheet({ items, perPage, heading, caption, solution }) {
  const [cols, rows] = LAYOUTS[perPage] || LAYOUTS[6]
  return (
    <article className="buga-a4">
      <h2>{heading}</h2>
      {caption && <p className="art-caption">{caption}</p>}
      <div className="sdk-sheet-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {items.map(p => (
          <div key={`${p.level}-${p.seed}`} className="sdk-sheet-item">
            <span className="sdk-sheet-label">{solution ? `פתרון: ${label(p)}` : label(p)}</span>
            <SudokuSvg puzzle={p} showSolution={solution} />
          </div>
        ))}
      </div>
      <footer>עוגה בוגה · סודוקו להדפסה · ugabuga.co.il/sudoku</footer>
    </article>
  )
}

// Puzzle pages (perPage on each), then solution pages (6 per page) when asked.
export function SudokuSheets({ puzzles, perPage = 1, withSolutions = false, title = 'סודוקו' }) {
  const pages = []
  for (let i = 0; i < puzzles.length; i += perPage) pages.push(puzzles.slice(i, i + perPage))
  const solPer = puzzles.length === 1 ? 1 : 6
  const solPages = []
  if (withSolutions) for (let i = 0; i < puzzles.length; i += solPer) solPages.push(puzzles.slice(i, i + solPer))
  const n = puzzles[0]?.n || 9
  return <>
    {pages.map((items, k) => (
      <Sheet key={`p${k}`} items={items} perPage={perPage} heading={pages.length > 1 ? `${title} — דף ${k + 1}` : title}
        caption={`השלימו את המספרים 1–${n}: כל מספר פעם אחת בכל שורה, בכל עמודה ובכל ריבוע מודגש. · שם: ____________ · זמן: ________`} />
    ))}
    {solPages.map((items, k) => (
      <Sheet key={`s${k}`} items={items} perPage={solPer} heading={solPages.length > 1 ? `פתרונות — דף ${k + 1}` : 'פתרונות'} solution />
    ))}
  </>
}

import { Page, FONT } from '../holidays/printKit'
import { wordSearch } from '../../utils/wordSearchGrid'

// Ready Hanukkah word searches in 3 levels, each followed by its answer page.
const LABEL = { ביתהמקדש: 'בית המקדש', פךהשמן: 'פך השמן', נסגדול: 'נס גדול' } // in the grid without the space
// Column 0 is drawn on the right, so a row reads right-to-left like Hebrew.
const LEVELS = [
  { id: 'easy', name: 'קלה', age: 'א׳–ב׳', size: 8, words: ['חנוכה', 'סביבון', 'נרות', 'שמן', 'נס', 'אור'], seed: 7 },
  { id: 'medium', name: 'בינונית', age: 'ב׳–ד׳', size: 10, words: ['חנוכייה', 'סופגניה', 'מכבים', 'סביבון', 'לביבה', 'שמש', 'פך', 'מתנה'], seed: 11 },
  { id: 'hard', name: 'קשה', age: 'ד׳–ו׳', size: 12, words: ['חנוכייה', 'סופגניות', 'המכבים', 'ביתהמקדש', 'יהודה', 'אנטיוכוס', 'לביבות', 'פךהשמן', 'נסגדול', 'מודיעין'], seed: 23 },
]

function Sheet({ level, answers }) {
  const { grid, placed } = wordSearch(level.words, level.size, level.seed)
  const area = 470, cell = area / level.size, x0 = 300 + area / 2, y0 = 140
  const hit = new Set(answers ? placed.flatMap(p => p.cells.map(([r, c]) => `${r},${c}`)) : [])
  return <Page title={`תפזורת חנוכה — ${level.name}${answers ? ' · פתרון' : ''}`} sub={answers ? 'המילים מסומנות' : 'מצאו את המילים — מימין לשמאל ומלמעלה למטה'}>
    {grid.map((row, r) => row.map((ch, c) => {
      const x = x0 - (c + 1) * cell, y = y0 + r * cell
      return <g key={`${r},${c}`}>
        <rect x={x} y={y} width={cell} height={cell} fill={hit.has(`${r},${c}`) ? '#ffe28a' : 'white'} stroke="#999" strokeWidth="1" />
        <text x={x + cell / 2} y={y + cell * 0.7} textAnchor="middle" fontFamily={FONT} fontSize={cell * 0.55} fontWeight="700">{ch}</text>
      </g>
    }))}
    <rect x={x0 - area} y={y0} width={area} height={area} fill="none" stroke="#111" strokeWidth="3" />
    {level.words.map((w, i) => {
      const col = i % 3, row = Math.floor(i / 3)
      return <text key={w} x={500 - col * 170} y={y0 + area + 50 + row * 36} textAnchor="middle" fontFamily={FONT} fontSize="22" fontWeight="700" direction="rtl">☐ {LABEL[w] || w}</text>
    })}
  </Page>
}

export const HANUKKAH_WORD_SEARCH = LEVELS.flatMap(l => [
  { id: `ws-${l.id}`, name: `תפזורת חנוכה — ${l.name}`, age: l.age, C: () => <Sheet level={l} /> },
  { id: `ws-${l.id}-answers`, name: `פתרון — ${l.name}`, age: l.age, C: () => <Sheet level={l} answers /> },
])

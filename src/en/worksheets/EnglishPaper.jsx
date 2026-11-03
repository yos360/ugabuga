import { useState } from 'react'
import PrintableShell, { Sheet, Choice } from '../../components/printables/PrintableShell'
import { EnglishNotFound } from '../EnglishLayout'
import { WORKSHEETS_PAGES, PAPER, WS } from './catalog'
import './worksheets.css'
import '../english.css'

// English version of /printables/lined-paper, grid-paper, graph-paper, dot-paper, english-lines and music-paper.
// Sheets are drawn in a 180x236 box (about the printable area of A4, one unit is about 1 mm).
const W = 180, H = 236, TOP = 12

const KINDS = {
  lined: {
    sub: 'Writing paper with lines: regular, wide or extra wide spacing, with a margin.',
    options: [['8', 'Regular (8 mm)'], ['10', 'Wide (10 mm)'], ['12', 'Large handwriting (12 mm)']], def: '8',
    paragraphs: ['Lined paper is the most useful thing you can print at home: when the notebook runs out, when you need to write a letter, or when the teacher asks for an essay on a separate sheet. Choose the line spacing and print as many pages as you like.', 'For Grades 1 and 2, wide lines of 10 to 12 mm leave room for big letters. For older children and adults, regular 8 mm spacing matches a school notebook. A margin line runs down the left side.'],
    faq: [{ q: 'How do I print so the lines have the exact spacing?', a: 'In the print window choose "Actual size" or 100%, not "Fit to page". The spacing then comes out very close to what you chose.' }, { q: 'Can I print several pages?', a: 'Yes. In the print window change the number of copies.' }],
  },
  grid: {
    sub: 'Squares for math, drawing and games, small or large.',
    options: [['5', 'Regular (5 mm)'], ['7', 'Medium (7 mm)'], ['10', 'Large (1 cm)']], def: '5',
    paragraphs: ['Grid paper is used for column math, accurate drawing, simple graphs and games such as tic-tac-toe or battleship. Squares of 5 mm are the size of a standard math notebook.', 'For Grades 1 and 2, choose large 1 cm squares: one digit in each square makes it easy to line up the ones and the tens. You can also draw pixel art: color in squares to follow a pattern and make a picture.'],
    faq: [{ q: 'What size are the squares in a math notebook?', a: 'Usually 5 mm. Notebooks for younger children have large squares of 7 to 10 mm.' }, { q: 'Why did my squares come out a little small?', a: 'The print was probably set to "Fit to page". Choose "Actual size" or 100% in the print window.' }],
  },
  graph: {
    sub: 'A millimeter grid with heavier lines every 5 mm and every 1 cm.',
    options: [['blue', 'Classic teal'], ['gray', 'Gray']], def: 'blue',
    paragraphs: ['Graph paper is used for drawing graphs in math and science, for planning rooms and gardens to scale, and for technical drawings. The fine lines mark every millimeter, and a heavier line every 5 and 10 millimeters makes counting easier.', 'For the most accurate measurements, print at actual size (100%). You can print the paper in the classic teal color or in gray, which saves color ink.'],
    faq: [{ q: 'Is the paper accurate enough to measure with?', a: 'At 100% the measurements are very close to a millimeter, but every printer is slightly different. For exact technical drawing, use pre-printed graph paper.' }, { q: 'What is the difference between graph paper and grid paper?', a: 'On grid paper every square is 5 mm or larger. Graph paper has a grid of one millimeter, with heavier lines every 5 and 10 mm.' }],
  },
  dot: {
    sub: 'A dot grid for drawing, planning and journaling, and for the dots and boxes game.',
    options: [['5', 'Dense (5 mm)'], ['10', 'Dots and boxes (1 cm)']], def: '5',
    paragraphs: ['Dot paper sits between a blank page and a grid: the dots help keep lines straight but do not get in the way of a drawing. It is especially popular for bullet journals, sketching and geometry.', 'On the 1 cm grid you can play the classic game of dots and boxes. Players take turns joining two neighboring dots with a line. Whoever closes a box writes their initial in it and plays again.'],
    faq: [{ q: 'How do you play dots and boxes?', a: 'Take turns joining two neighboring dots with a line. Whoever completes a box marks it and takes another turn. At the end, the player who closed the most boxes wins.' }],
  },
  music: {
    sub: 'Empty staves for writing music: for music lessons and composing.',
    options: [['10', '10 staves'], ['12', '12 close staves']], def: '10',
    paragraphs: ['Blank manuscript paper is what every music teacher asks for in the first lesson. Each staff has five lines, and the notes are written on and between them.', 'The staves are empty, so you can start each one with the right clef: treble for piano right hand, flute and violin, or bass for the left hand and low instruments. Ten staves give comfortable space for large notes, and twelve suit someone who writes a lot on one page.'],
    faq: [{ q: 'How many staves are on the page?', a: 'Choose 10 staves with comfortable spacing, or 12 closer staves.' }],
  },
}

function PaperSheet({ kind, opt }) {
  const g = []
  const line = (x1, y1, x2, y2, stroke = '#9aa4b2', w = 0.25, dash) => g.push(<line key={g.length} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={w} strokeDasharray={dash} />)
  if (kind === 'lined') {
    const step = +opt
    for (let y = TOP + step; y <= H - 2; y += step) line(0, y, W, y)
    line(14, 0, 14, H, '#e88', 0.35)
    g.push(<text key="n" x={W - 2} y={7} fontSize={4} textAnchor="end" direction="ltr" fill="#aaa">Date: __________</text>)
  } else if (kind === 'grid') {
    const step = +opt, nx = Math.floor(W / step), ny = Math.floor((H - TOP) / step), x0 = (W - nx * step) / 2
    for (let i = 0; i <= nx; i++) line(x0 + i * step, TOP, x0 + i * step, TOP + ny * step)
    for (let j = 0; j <= ny; j++) line(x0, TOP + j * step, x0 + nx * step, TOP + j * step)
  } else if (kind === 'graph') {
    const c = opt === 'blue' ? '#3aa7a0' : '#8f98a6', nx = Math.floor(W / 10) * 10, ny = Math.floor((H - TOP) / 10) * 10, x0 = (W - nx) / 2
    for (let i = 0; i <= nx; i++) line(x0 + i, TOP, x0 + i, TOP + ny, c, i % 10 === 0 ? 0.35 : i % 5 === 0 ? 0.2 : 0.07)
    for (let j = 0; j <= ny; j++) line(x0, TOP + j, x0 + nx, TOP + j, c, j % 10 === 0 ? 0.35 : j % 5 === 0 ? 0.2 : 0.07)
  } else if (kind === 'dot') {
    const step = +opt, nx = Math.floor(W / step), ny = Math.floor((H - TOP) / step), x0 = (W - nx * step) / 2
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) g.push(<circle key={g.length} cx={x0 + i * step} cy={TOP + j * step} r={step > 6 ? 0.7 : 0.4} fill="#555" />)
  } else if (kind === 'music') {
    const n = +opt, sp = opt === '10' ? 1.9 : 1.75, block = (H - TOP) / n
    for (let s = 0; s < n; s++) {
      const y0 = TOP + s * block + (block - 4 * sp) / 2
      for (let k = 0; k < 5; k++) line(3, y0 + k * sp, W - 3, y0 + k * sp, '#333', 0.25)
      line(3, y0, 3, y0 + 4 * sp, '#333', 0.3); line(W - 3, y0, W - 3, y0 + 4 * sp, '#333', 0.3)
    }
  }
  return <Sheet w={W} h={H} label={PAPER[kind].name}>{g}</Sheet>
}

function PaperPage({ kind }) {
  const k = KINDS[kind], pv = PAPER[kind]
  const path = `${WS}/paper/${kind}`
  const meta = WORKSHEETS_PAGES.find(p => p.path === path)
  const [opt, setOpt] = useState(k.def)
  return <PrintableShell lang="en" path={path} counterpartPath={meta.counterpart} emoji={pv.emoji} h1={pv.name} sub={k.sub} seoTitle={meta.title} description={meta.description}
    crumbs={[{ label: 'Worksheets', href: WS }, { label: 'Paper', href: `${WS}/paper/lined` }]}
    siblings={Object.entries(PAPER).map(([key, v]) => ({ href: `${WS}/paper/${key}`, label: `${v.emoji} ${v.name}` }))}
    controls={<Choice label="Style" value={opt} onChange={setOpt} options={k.options} />}
    pages={[{ key: kind + opt, svg: <PaperSheet kind={kind} opt={opt} /> }]}
    extra={<p className="ws-note">Tip: in the print window choose "Actual size" (100%) so the spacing is exact. The page is A4; on US Letter paper, choose "Fit to page" if exact spacing does not matter.</p>}
    paragraphs={k.paragraphs} faq={k.faq}
    related={[{ label: 'math worksheets', href: `${WS}/math` }, { label: 'mazes', href: `${WS}/mazes` }, { label: 'all printable worksheets', href: WS }]} />
}

export default function EnglishPaper({ params }) {
  const kind = params?.kind
  if (!KINDS[kind]) return <EnglishNotFound />
  return <PaperPage key={kind} kind={kind} />
}

// English pages of this area: pure data (path, title, counterpart or unpairedReason, emoji, description).
// Read by englishRoutes.js, the sitemap scripts and the English hubs. No JSX or React imports here.
// Every concrete page is listed (the routes use patterns like /en/worksheets/math/:topic).

export const WS = '/en/worksheets'

// ---- Math worksheets (generators from src/utils/mathSheets.js; same slugs as /printables/math-worksheets/*) ----
const ADD_SUB = [
  // slug, op, range, name, grade label
  ['addition-up-to-10', '+', 10, 'Addition', 'Kindergarten and Grade 1'],
  ['subtraction-up-to-10', '-', 10, 'Subtraction', 'Kindergarten and Grade 1'],
  ['addition-up-to-20', '+', 20, 'Addition', 'Grade 1'],
  ['subtraction-up-to-20', '-', 20, 'Subtraction', 'Grade 1'],
  ['up-to-10', 'mix', 10, 'Addition and subtraction', 'Kindergarten and Grade 1'],
  ['up-to-20', 'mix', 20, 'Addition and subtraction', 'Grade 1'],
  ['addition-up-to-100', '+', 100, 'Addition', 'Grade 2'],
  ['subtraction-up-to-100', '-', 100, 'Subtraction', 'Grade 2'],
  ['up-to-100', 'mix', 100, 'Addition and subtraction', 'Grade 2'],
]
export const MATH_PRESETS = {}
for (const [slug, op, range, name, grade] of ADD_SUB) {
  MATH_PRESETS[slug] = {
    slug, mode: 'exercises', op, range, grade, crumb: `${name} within ${range}`,
    title: `${name} within ${range}: free worksheets to print`,
    h1: `${name} within ${range}`,
    emoji: op === '+' ? '➕' : op === '-' ? '➖' : '🔢',
    description: `Free ${name.toLowerCase()} worksheets within ${range} for ${grade}. Standard, missing-number and column problems, a new sheet every click, with answers.`,
  }
}
const tableName = (op, t) => (op === 'x' ? (t === 'mix' ? 'Multiplication facts' : `Multiplication table of ${t}`) : t === 'mix' ? 'Division facts' : `Division by ${t}`)
for (const t of [2, 3, 4, 5, 6, 7, 8, 9, 10, 'mix']) {
  const slug = t === 'mix' ? 'multiplication' : `multiplication-table-${t}`, name = tableName('x', t)
  MATH_PRESETS[slug] = {
    slug, mode: 'table', op: 'x', table: t, range: 10, grade: 'Grades 2 to 4', crumb: name,
    title: t === 'mix' ? 'Multiplication worksheets: all times tables, printable' : `Times table of ${t}: multiplication worksheets`,
    h1: name, emoji: '✖️',
    description: t === 'mix'
      ? 'Free multiplication worksheets with all the times tables from 2 to 10. 20 problems per page, missing-number problems too, a new sheet each click, with answers.'
      : `Free printable practice for the ${t} times table: 20 multiplication problems per page, missing-number problems, a new sheet every click and an answer key.`,
  }
}
MATH_PRESETS.division = {
  slug: 'division', mode: 'table', op: '÷', table: 'mix', range: 10, grade: 'Grades 3 and 4', crumb: 'Division facts',
  title: 'Division worksheets: facts from the times tables',
  h1: 'Division facts', emoji: '➗',
  description: 'Free printable division worksheets built on the times tables from 2 to 10. 20 problems per page, missing-number problems too, a new sheet each click, with answers.',
}
MATH_PRESETS.paths = {
  slug: 'paths', mode: 'paths', range: 10, grade: 'Grade 1', crumb: 'Math paths',
  title: 'Math paths: add and subtract along the path',
  h1: 'Math paths', emoji: '🛤️',
  description: 'Free printable math paths for Grade 1: fill in the missing circle or the missing step on the arrow, within 10 or 20. A new sheet every click, with answers.',
}
export const MATH_SLUGS = Object.keys(MATH_PRESETS)

// Pages whose counterpart is not /printables/math-worksheets/<slug>
const MATH_COUNTERPART = { paths: '/printables/math-paths' }

// ---- Clock and fractions (src/pages/printables/MathVisualSheets.jsx) ----
const VISUAL = [
  { path: `${WS}/math/clock`, title: 'Telling time worksheets: read and draw the clock', emoji: '🕒', counterpart: '/printables/clock-worksheets', description: 'Free printable clock worksheets: whole hours, half hours, quarter hours and five-minute steps. Read the clock or draw the hands. 12 clocks per page, with answers.' },
  { path: `${WS}/math/fractions`, title: 'Fractions worksheets: name, color and compare', emoji: '🍕', counterpart: '/printables/fractions-worksheets', description: 'Free printable fractions worksheets with circles and bars: name the shaded part, color the fraction and compare fractions. A new sheet every click, with answers.' },
]

// ---- Paper (src/pages/printables/WritingPaper.jsx) ----
export const PAPER = {
  lined: { counterpart: '/printables/lined-paper', emoji: '📝', name: 'Lined paper', title: 'Lined paper to print: free A4 writing paper', description: 'Free printable lined paper with 8, 10 or 12 mm line spacing and a margin. Print it as it is or save a PDF for letters, essays and handwriting practice.' },
  grid: { counterpart: '/printables/grid-paper', emoji: '🔲', name: 'Grid paper', title: 'Grid paper to print: 5 mm, 7 mm and 1 cm squares', description: 'Free printable grid paper with 5 mm, 7 mm or 1 cm squares for math, drawing and games. A4 size, no sign-up needed.' },
  graph: { counterpart: '/printables/graph-paper', emoji: '📐', name: 'Graph paper', title: 'Graph paper to print: millimeter grid, free A4', description: 'Free printable millimeter graph paper with heavier lines every 5 mm and every centimeter. For graphs, drawings and science or math projects, in teal or gray.' },
  dot: { counterpart: '/printables/dot-paper', emoji: '⚬', name: 'Dot paper', title: 'Dot paper to print: free dot grid, 5 mm or 1 cm', description: 'Free printable dot grid paper with 5 mm or 1 cm dots for drawing, bullet journals and the dots and boxes game. A4 size, ready to print.' },
  music: { counterpart: '/printables/music-paper', emoji: '🎼', name: 'Blank music paper', title: 'Blank sheet music to print: free staff paper', description: 'Free printable blank sheet music: A4 pages with 10 or 12 empty staves for writing notes. For piano, flute or guitar lessons and composing.' },
}
const PAPER_PAGES = Object.entries(PAPER).map(([k, v]) => ({ path: `${WS}/paper/${k}`, title: v.title, emoji: v.emoji, counterpart: v.counterpart, description: v.description }))

// ---- Mazes ----
const MAZE_PAGE = { path: `${WS}/mazes`, title: 'Printable mazes for kids: 5 levels, with solutions', emoji: '🌀', counterpart: '/printables/mazes', description: 'Free printable mazes in five levels, from preschool to adult. 30 ready mazes, a solution page for each and a new maze at every click. Every maze can be solved.' }

// ---- Activity sheets: dot-to-dot, count-and-write, complete-the-pattern (src/pages/printables/ActivityWorksheet.jsx) ----
export const ACTIVITY_THEMES = [
  ['animals', 'Animals', '🐾'], ['space', 'Space', '🚀'], ['birthday', 'Birthday', '🎂'],
  ['vehicles', 'Vehicles', '🚗'], ['football', 'Soccer', '⚽'], ['unicorn', 'Unicorns', '🦄'],
]
export const ACTIVITY_TYPES = {
  'dot-to-dot': { hebrew: 'dot-to-dot', name: 'Connect the dots', slug: 'dot-to-dot', emoji: '🔢', blurb: 'connect the numbered dots in order and reveal a picture' },
  'count-and-write': { hebrew: 'count-and-write', name: 'Count and write', slug: 'count-and-write', emoji: '🔢', blurb: 'count the pictures and write the number' },
  'complete-the-pattern': { hebrew: 'complete-pattern', name: 'Complete the pattern', slug: 'complete-the-pattern', emoji: '🧩', blurb: 'read the pattern from left to right and draw what comes next' },
}
const ACTIVITY_PAGES = []
for (const t of Object.values(ACTIVITY_TYPES)) {
  ACTIVITY_PAGES.push({
    path: `${WS}/${t.slug}`, emoji: t.emoji, counterpart: `/printables/activity/${t.hebrew}`,
    title: `${t.name} worksheets to print for kids`,
    description: `Free printable ${t.name.toLowerCase()} pages for ages 3 to 8: ${t.blurb}. Six themes and three age levels.`,
  })
  for (const [id, label, emoji] of ACTIVITY_THEMES) {
    ACTIVITY_PAGES.push({
      path: `${WS}/${t.slug}/${id}`, emoji, counterpart: `/printables/activity/${t.hebrew}/${id}`,
      title: `${t.name}: ${label.toLowerCase()} worksheet to print`,
      description: `Free printable ${t.name.toLowerCase()} activity with a ${label.toLowerCase()} theme for ages 3 to 8. Choose an age level, print or save a PDF, and make a new version every click.`,
    })
  }
}

// ---- Booklets (src/booklets/mathAdd20.jsx data; English pages in EnglishBooklets.jsx) ----
const BOOKLET_PAGES = [
  { path: `${WS}/booklets/add-to-20`, title: 'Addition within 20 booklet: free printable workbook', emoji: '🔟', counterpart: '/booklets/add-to-20', description: 'Free printable 16-page math booklet for Grades 1 and 2: ten frames, number line, crossing ten, making 10 and 20, doubles, word problems, answers and a certificate.' },
]

export const WORKSHEETS_PAGES = [
  { path: WS, title: 'Printable worksheets: math, mazes, paper and more', emoji: '🖨️', unpairedReason: 'English hub for the printable worksheets that do not depend on the Hebrew language; the larger Hebrew printables index is already paired with /en/printables.', description: 'Free printable math worksheets, clock and fractions sheets, mazes, dot-to-dot pages, lined and graph paper. New sheets at every click, with answers.' },
  { path: `${WS}/math`, title: 'Math worksheets by grade and topic: free to print', emoji: '🔢', counterpart: '/printables/math-worksheets', description: 'Free printable math worksheets for Grades 1 to 4: addition, subtraction, times tables, division and math paths. A new sheet at every click, with an answer key.' },
  ...MATH_SLUGS.map(slug => {
    const p = MATH_PRESETS[slug]
    return { path: `${WS}/math/${slug}`, title: p.title, emoji: p.emoji, counterpart: MATH_COUNTERPART[slug] || `/printables/math-worksheets/${slug}`, description: p.description }
  }),
  ...VISUAL,
  ...PAPER_PAGES,
  MAZE_PAGE,
  ...ACTIVITY_PAGES,
  ...BOOKLET_PAGES,
]

import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PrintPreview from '../../components/ui/PrintPreview'
import { EnglishNotFound } from '../EnglishLayout'
import { useCbnPainting } from '../../pages/printables/cbnShared'
import { CBN_PICTURES, CBN_LEVELS, CBN_THEMES, cbnBySlug, cbnSize, cbnGrid, cbnInTheme } from '../../data/colorByNumber'
import { CBN_HUB, CBN_MANDALAS, cbnName, cbnBlurb, cbnLower, cbnPathEn } from './catalog'
import { LEVELS_EN, THEMES_EN, HOLIDAYS_EN } from './cbnText'
import { ArtFrame, ArtBody, PictureCardEn, PlayArea, MoreWaysEn, SolutionToggle, SheetEn } from './cbnEn'
import { legendEn, enLink, badge, PRINT_BTN, PRINT_BTN_2, PRINT_NOTE } from './artUtils'

// /en/printables/color-by-number (+ /mandalas and one page per picture): the Hebrew site's pixel pictures,
// print sheets with an answer key, a math version and online coloring, all in English.

const COUNT = CBN_PICTURES.length
const HUB_CRUMBS = [{ label: 'Color by number', href: CBN_HUB }]
const MATH_HOW = { add10: 'a small addition problem, up to 10', add20: 'an addition problem up to 20', mult: 'a times-table problem' }
const sheetsForEn = (list, kinds, withSolution) => list.flatMap(p => [...kinds.map(k => <SheetEn key={`${p.slug}-${k}`} p={p} mode={k} />), ...(withSolution ? [<SheetEn key={`${p.slug}-sol`} p={p} mode="solution" />] : [])])
const printablesLinks = () => [...enLink('/printables/coloring', 'Coloring pages'), ...enLink('/printables/math-worksheets', 'Math worksheets'), { label: 'Printable worksheets', href: '/en/worksheets' }]

const HUB_FAQ = [
  { q: 'What is a color by number page?', a: 'A page of squares with a number in each one. The key at the top tells you which color goes with each number. Color square after square, and a whole picture appears at the end. It practices number recognition, focus and fine motor skills.' },
  { q: 'Which level suits which age?', a: 'Preschool: small pictures with 3–4 colors and big squares. Grades 1–2: medium pictures with up to 8 colors. Older kids and adults: large, detailed pictures with 6–10 colors, which also work well as relaxing coloring for grown-ups.' },
  { q: 'What is the difference between the number version and the math version?', a: 'In the math version each square holds a problem instead of a number: addition to 10 for preschool, addition to 20 for grades 1–2 and the times tables for older kids. Solve it and look for the answer in the key. Each answer belongs to one color only, so there is no confusion.' },
  { q: 'Is there an answer key?', a: 'Yes. Every picture has a full-color answer key: tick "Print an answer key too" before printing. On each picture\'s page you can also color online and see the answer on screen.' },
  { q: 'Can we color by letters or by subtraction instead?', a: 'Yes. The same pictures come as color by answer pages (addition and subtraction to 10 and 20, times tables and division) and as color by letter pages, in three levels.' },
  { q: 'Are the pages free?', a: 'Yes. Every page is free for home, preschool and classroom use, with no sign-up. Print as many times as you like: the problems are the same every time, so the whole class gets the same sheet.' },
]

export default function ColorByNumberHubEn() {
  const [params, setParams] = useSearchParams()
  const level = CBN_LEVELS.find(l => l.id === params.get('level'))
  const theme = CBN_THEMES.find(t => t.id === params.get('theme'))
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(false)
  const list = CBN_PICTURES.filter(p => (!level || p.level === level.id) && (!theme || cbnInTheme(p, theme.id)))
  const pick = (name, id, current) => {
    const next = new URLSearchParams(params)
    if (!id || current === id) next.delete(name); else next.set(name, id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const chip = on => `min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${on ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`
  return <ArtFrame path={CBN_HUB} crumbs={[{ label: 'Color by number' }]} faq={HUB_FAQ}>
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">{COUNT} pictures · numbers or math · answer keys · free</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🎨 </span>Color by number printables</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">Pick a picture, print it and color each square in the color of its number. Every picture also has a version with addition or times-table problems, and a full-color answer key.</p>
    </header>
    <nav aria-label="Filter by level" className="no-print mt-6 flex flex-wrap justify-center gap-2">
      {[{ id: '' }, ...CBN_LEVELS].map(l => <button key={l.id || 'all'} type="button" aria-pressed={(level?.id || '') === l.id} onClick={() => pick('level', l.id, level?.id)} className={chip((level?.id || '') === l.id)}>{l.id ? LEVELS_EN[l.id].label : 'All levels'}</button>)}
    </nav>
    <nav aria-label="Filter by theme" className="no-print mt-2 flex flex-wrap justify-center gap-2">
      {[{ id: '' }, ...CBN_THEMES].map(t => <button key={t.id || 'all'} type="button" aria-pressed={(theme?.id || '') === t.id} onClick={() => pick('theme', t.id, theme?.id)} className={chip((theme?.id || '') === t.id)}>{t.id ? THEMES_EN[t.id] : 'All themes'}</button>)}
    </nav>
    <p className="no-print mt-3 text-center"><Link to={CBN_MANDALAS} className="font-bold underline">🌀 New: mandala color by number</Link></p>
    {(level || theme) && <p className="no-print mt-3 text-center text-[var(--muted-foreground)]" role="status">{list.length} pictures{level ? ` ${LEVELS_EN[level.id].long} · math version: ${LEVELS_EN[level.id].mathLabel.toLowerCase()}` : ''}</p>}
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main disabled={!list.length} onClick={() => setPrinting(list)} className={PRINT_BTN}>🖨️ Print all {list.length} pages</button>
      <SolutionToggle checked={withSolution} onChange={setWithSolution} />
    </div>
    <p className="no-print mt-2 text-center text-sm text-[var(--muted-foreground)]">{PRINT_NOTE}</p>
    {list.length ? <section className="no-print mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{list.map(p => <PictureCardEn key={p.slug} p={p} />)}</section>
      : <p className="no-print mt-6 text-center font-bold">No pictures on this theme at this level yet. Try another level.</p>}
    <MoreWaysEn skip={CBN_HUB} />
    {printing && <PrintPreview lang="en" title={level ? `Color by number: ${LEVELS_EN[level.id].label}` : 'Color by number'} onClose={() => setPrinting(null)}>{sheetsForEn(printing, ['numbers'], withSolution)}</PrintPreview>}
    <ArtBody paragraphs={[
      'Color by number is a quiet activity kids come back to again and again: the task is clear, you can see your progress, and there is a surprise at the end, because the picture only appears as the squares fill in. Along the way kids practice reading numbers, matching them to a key, concentrating and controlling a pencil.',
      `All ${COUNT} pictures here are original and built from squares, like a mosaic. For preschool there is an apple, a fish, a cat, a sun, a strawberry, a frog and a whale with 3–5 colors; for grades 1–2 a car, a bus, a train, an airplane, an octopus, a dog and a pizza; and for older kids and adults a hot air balloon, a lighthouse, a lion, a fox, a castle and a coral reef, with more squares and more colors.`,
      'Looking for something in particular? There is a unicorn, a dinosaur, a mermaid, a dragon, a peacock, a panda, an elephant, a shark, a robot, an astronaut, a crown, a rainbow, a soccer ball, a koala, a tiger, a flamingo, a burger, a sunflower, a guitar, a bicycle, a pirate ship, a hamsa and 11 mandalas.',
      'There are pictures for the Jewish holidays too: a pomegranate, a bee and a honey jar for Rosh Hashanah, a sukkah and an etrog for Sukkot, a dreidel, a menorah, a jelly doughnut and an oil jug for Hanukkah, a mask and a hamantasch for Purim, a Kiddush cup and a frog for Passover, cheese and a tractor for Shavuot, and the flag of Israel and fireworks for Israel Independence Day.',
      'Every picture has a math version as well: instead of a number, each square holds a problem, addition to 10 for preschool, addition to 20 for grades 1–2 and the times tables for older kids. To practice something else, color the same pictures by subtraction and division answers, or by letters.',
    ]} faq={HUB_FAQ} related={[{ label: 'Color by answer: addition, subtraction, times tables and division', href: '/en/printables/color-by-answer' }, { label: 'Color by letter', href: '/en/printables/color-by-letter' }, { label: 'How to draw, step by step', href: '/en/how-to-draw' }, ...printablesLinks()]} />
  </ArtFrame>
}

const MANDALA_FAQ = [
  { q: 'What is a mandala color by number?', a: 'A round mandala made of squares, with a number in each square. Color by the key, and a symmetrical pattern appears at the end: every side looks exactly like the side opposite it.' },
  { q: 'Who is it for?', a: 'There are small mandalas for preschool with 3–4 colors, medium ones for grades 1–2, and large ones with 24×24 squares and up to 9 colors for older kids and adults. The large mandalas are especially nice for calm evening coloring.' },
  { q: 'Can we color online?', a: 'Yes. Open a mandala, pick a color in the key and tap the squares. The "Show the answer" button shows the finished mandala.' },
]

export function CbnMandalasEn() {
  const [printing, setPrinting] = useState(false)
  const [withSolution, setWithSolution] = useState(true)
  const list = CBN_PICTURES.filter(p => p.theme === 'mandala')
  return <ArtFrame path={CBN_MANDALAS} crumbs={[...HUB_CRUMBS, { label: 'Mandalas' }]} faq={MANDALA_FAQ}>
    <header className="text-center">
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🌀 </span>Mandala color by number</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">Color square by square using the key, and a symmetrical mandala rises out of the numbers. From preschool to adults.</p>
    </header>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(true)} className={PRINT_BTN}>🖨️ Print all {list.length} mandalas</button>
      <SolutionToggle checked={withSolution} onChange={setWithSolution} />
    </div>
    <section className="no-print mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{list.map(p => <PictureCardEn key={p.slug} p={p} />)}</section>
    {printing && <PrintPreview lang="en" title="Mandala color by number" onClose={() => setPrinting(false)}>{sheetsForEn(list, ['numbers'], withSolution)}</PrintPreview>}
    <ArtBody paragraphs={[
      'A mandala is a round design that repeats around a center. When it is made of numbered squares, something new is added: you do not choose the colors, you discover them, and every ring you color reveals more of the pattern.',
      'These mandalas are fully symmetrical, so you can work one quarter at a time and watch the pattern close up. Each one also has a version with math problems instead of numbers, and a full-color answer key to check against.',
    ]} faq={MANDALA_FAQ} related={[{ label: 'All color by number pictures', href: CBN_HUB }, ...enLink('/printables/mandalas', 'Mandala coloring pages'), ...printablesLinks()]} />
  </ArtFrame>
}

function pictureFaq(p) {
  const level = LEVELS_EN[p.level], { cols, rows } = cbnSize(p)
  const fit = p.level === 'gan' ? 'The squares are big and there are only a few numbers, so even kids who are just learning their numbers can do it on their own.'
    : p.level === 'adults' ? 'There are lots of squares and small details, which suits sharp colored pencils and an hour of relaxed coloring.'
      : 'There is enough detail to keep it interesting, and it can still be finished in one sitting.'
  return [
    { q: `What age is the ${cbnLower(p)} color by number for?`, a: `It is ${level.long}: ${cols}×${rows} squares and ${p.colors.length} colors. ${fit}` },
    { q: 'How does the math version work?', a: `Each square holds ${MATH_HOW[p.level === 'gan' ? 'add10' : p.level === 'adults' ? 'mult' : 'add20']}. Solve it, find the answer in the key and color the square in that color. Every color has its own answer, and no two colors share one, so there is no guessing.` },
    { q: 'Can we color it online?', a: 'Yes. Pick a color in the key and tap the squares (on a computer you can also drag with the mouse). Made a mistake? Tap the square again to clear it, or use the eraser or Undo. The counter shows how many squares are colored correctly, and "Show the answer" shows the finished picture.' },
    { q: 'Is there an answer key?', a: 'Yes. Tick "Print an answer key too" before printing, and the colored picture prints after the coloring sheet. Handy for parents and teachers.' },
  ]
}

// keyed by the picture, so moving to another picture starts with a clean board
export function CbnPictureEn({ params }) {
  const p = cbnBySlug(params?.slug)
  return p ? <CbnPicture key={p.slug} p={p} /> : <EnglishNotFound />
}

function CbnPicture({ p }) {
  const [mode, setMode] = useState('numbers')
  const painting = useCbnPainting()
  const [reveal, setReveal] = useState(false)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const grid = useMemo(() => cbnGrid(p), [p])
  const level = LEVELS_EN[p.level], { cols, rows } = cbnSize(p)
  const total = grid.flat().filter(n => n > 0).length
  const faq = pictureFaq(p)
  const kin = x => (p.holiday && x.holiday === p.holiday) || (p.theme && x.theme === p.theme)
  const same = CBN_PICTURES.filter(x => x.level === p.level && x.slug !== p.slug).sort((a, b) => kin(b) - kin(a)).slice(0, 8)
  const others = CBN_PICTURES.filter(x => x.level !== p.level && kin(x)).concat(CBN_PICTURES.filter(x => x.level !== p.level && !kin(x))).slice(0, 4)
  const holiday = p.holiday && HOLIDAYS_EN[p.holiday] && enLink(HOLIDAYS_EN[p.holiday][0], HOLIDAYS_EN[p.holiday][1])[0]
  const mathKind = p.level === 'gan' ? 'add10' : p.level === 'adults' ? 'mult' : 'add20'
  return <ArtFrame path={cbnPathEn(p)} crumbs={[...HUB_CRUMBS, { label: cbnName(p) }]} faq={faq}>
    <header className="text-center">
      <span className={`inline-flex rounded-full px-4 py-2 font-bold ${badge(p.level)}`}>{level.label} · {cols}×{rows} squares · {p.colors.length} colors</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{p.emoji} </span>Color by number: {cbnName(p)}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{cbnBlurb(p)}</p>
    </header>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(['numbers'])} className={PRINT_BTN}>🖨️ Print: numbers</button>
      <button type="button" onClick={() => setPrinting(['math'])} className={PRINT_BTN_2}>🖨️ Print: {level.mathLabel.toLowerCase()}</button>
      <SolutionToggle checked={withSolution} onChange={setWithSolution} />
    </div>
    <p className="no-print mt-2 text-center text-sm text-[var(--muted-foreground)]">{PRINT_NOTE}</p>
    <PlayArea p={p} mode={mode} painting={painting} reveal={reveal} setReveal={setReveal} label={`${cbnName(p)}: color by ${mode === 'math' ? 'math' : 'number'}`}>
      <div className="cbn-tabs" role="group" aria-label="Sheet type">
        <button type="button" aria-pressed={mode === 'numbers'} onClick={() => setMode('numbers')}>🔢 Numbers</button>
        <button type="button" aria-pressed={mode === 'math'} onClick={() => setMode('math')}>➕ {level.mathLabel}</button>
      </div>
    </PlayArea>
    {printing && <PrintPreview lang="en" title={`Color by number: ${cbnName(p)}`} onClose={() => setPrinting(null)}>{sheetsForEn([p], printing, withSolution)}</PrintPreview>}
    <MoreWaysEn p={p} skip={CBN_HUB} />
    {holiday && <p className="no-print mt-4 text-center text-lg"><Link to={holiday.href} className="font-bold underline">{holiday.label}</Link></p>}
    {same.length > 0 && <section className="no-print mt-10">
      <h2 className="mb-4 text-center text-3xl font-black">More pictures {level.long}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{same.map(x => <PictureCardEn key={x.slug} p={x} />)}</div>
    </section>}
    <section className="no-print mt-8">
      <h2 className="mb-4 text-center text-2xl font-black">Pictures at other levels</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{others.map(x => <PictureCardEn key={x.slug} p={x} />)}</div>
      <p className="mt-4 text-center"><Link to={CBN_HUB} className="font-bold underline">See all {COUNT} color by number pictures</Link></p>
    </section>
    <ArtBody paragraphs={[
      `${cbnBlurb(p)} The picture is made of ${total} squares on a ${cols}×${rows} grid, and each square has a number that matches one of the ${p.colors.length} colors in the key: ${legendEn(p).map(l => `${l.num}, ${l.name}`).join('; ')}.`,
      `In the math version every square gets ${MATH_HOW[mathKind]}, and the key shows which answer belongs to which color. The picture only appears for whoever solves correctly, which turns math practice into a game.`,
      'Print it on A4 or US Letter paper and use colored pencils or fine markers. Squares that are white in the key stay uncolored. A QR code at the bottom of the sheet leads back here, for anyone who wants more pictures.',
    ]} faq={faq} related={[{ label: 'All color by number pages', href: CBN_HUB }, { label: 'Color by answer', href: '/en/printables/color-by-answer' }, ...printablesLinks()]} />
  </ArtFrame>
}

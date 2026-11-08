import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PrintPreview from '../../components/ui/PrintPreview'
import { EnglishNotFound } from '../EnglishLayout'
import { CbnSvg, useCbnPainting } from '../../pages/printables/cbnShared'
import {
  CBN_PICTURES, CBN_LEVELS, CBN_MATH_KINDS, CBN_LETTER_LEVELS, cbnBySlug,
  cbnMathKindBySlug, cbnFitsKind, cbnAnswers, cbnMathGrid, cbnLetterTags, cbnLetterGrid,
} from '../../data/colorByNumber'
import { CBN_HUB, ANSWER_HUB, LETTER_PAGE, answerPathEn, cbnName, cbnLower, cbnPathEn } from './catalog'
import { KINDS_EN, LEVELS_EN, LETTER_LEVELS_EN } from './cbnText'
import { ArtFrame, ArtBody, PlayArea, MoreWaysEn, SolutionToggle, SheetEn } from './cbnEn'
import { enLink, badge, PRINT_BTN, PRINT_BTN_2, PRINT_NOTE } from './artUtils'

// The color-by-number pictures with something else in the squares:
//   /en/printables/color-by-answer        hub: one card per kind of math problem
//   /en/printables/color-by-answer/:op    every square is a problem; the key maps answers to colors
//   /en/printables/color-by-letter        English letters (capital / lowercase / capital↔lowercase)
// The chosen picture lives in ?p=slug (the canonical stays the bare page), the letter level in ?level=.
// The Hebrew site's Hebrew-letter page has no English version: telling Hebrew letters apart is its whole point.

const BOOKLET = 6
const byLevelFirst = (list, level) => [...list.filter(p => p.level === level), ...list.filter(p => p.level !== level)]
const bookletOf = (list, current) => { const i = list.indexOf(current); return Array.from({ length: Math.min(BOOKLET, list.length) }, (_, j) => list[(i + j) % list.length]) }

function usePicture(list) {
  const [params, setParams] = useSearchParams()
  const wanted = cbnBySlug(params.get('p'))
  const current = wanted && list.includes(wanted) ? wanted : list[0]
  const pick = slug => { const next = new URLSearchParams(params); next.set('p', slug); setParams(next, { replace: true, preventScrollReset: true }) }
  return [current, pick, params, setParams]
}

function PicturePicker({ list, current, onPick }) {
  const i = list.indexOf(current)
  return <div className="no-print mt-4 flex flex-wrap items-center justify-center gap-2">
    <label className="flex items-center gap-2 font-bold">Picture:
      <select value={current.slug} onChange={e => onPick(e.target.value)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-3 font-bold">
        {CBN_LEVELS.map(l => {
          const items = list.filter(p => p.level === l.id)
          return items.length > 0 && <optgroup key={l.id} label={LEVELS_EN[l.id].label}>{items.map(p => <option key={p.slug} value={p.slug}>{p.emoji} {cbnName(p)}</option>)}</optgroup>
        })}
      </select>
    </label>
    <button type="button" onClick={() => onPick(list[(i + 1) % list.length].slug)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-4 font-bold">⏭️ Next picture</button>
  </div>
}

function PrintBar({ onOne, onBooklet, withSolution, setWithSolution }) {
  return <>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={onOne} className={PRINT_BTN}>🖨️ Print this page</button>
      <button type="button" onClick={onBooklet} className={PRINT_BTN_2}>🖨️ Booklet of {BOOKLET} pictures</button>
      <SolutionToggle checked={withSolution} onChange={setWithSolution} />
    </div>
    <p className="no-print mt-2 text-center text-sm text-[var(--muted-foreground)]">{PRINT_NOTE}</p>
  </>
}

// online coloring with its own board state; remounted (new key) for each picture or level
function CodePlay({ p, cells, tags, tagName, label }) {
  const painting = useCbnPainting()
  const [reveal, setReveal] = useState(false)
  return <PlayArea p={p} mode="code" cells={cells} tags={tags} tagName={tagName} painting={painting} reveal={reveal} setReveal={setReveal} label={label} />
}

// ── color by answer ──
const ANSWER_FAQ = [
  { q: 'What is color by answer?', a: 'A coloring page where each square holds a math problem instead of a number. Solve the problem, find the answer in the key and color the square in its color. When every problem is solved, a picture appears.' },
  { q: 'Can the colors get mixed up?', a: 'No. Each color has its own answer, and no answer belongs to two colors. If a square comes out in a color that does not fit the picture, the problem was probably solved wrong, which is a good chance to check it again.' },
  { q: 'Which operation suits which age?', a: 'Addition and subtraction to 10 for kindergarten and grade 1. Addition and subtraction to 20 for grades 1–2. Times tables for grades 2–4, and division for grades 3–5. Any picture works with any operation.' },
  { q: 'Do the problems change each time I print?', a: 'No. Each picture and operation always gets the same problems, so the whole class gets an identical sheet and the answer key always matches.' },
]

export default function ColorByAnswerHubEn() {
  const [params] = useSearchParams()
  const chosen = cbnBySlug(params.get('p'))
  const query = chosen ? `?p=${chosen.slug}` : ''
  return <ArtFrame path={ANSWER_HUB} crumbs={[{ label: 'Color by number', href: CBN_HUB }, { label: 'Color by answer' }]} faq={ANSWER_FAQ}>
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">6 operations · {CBN_PICTURES.length} pictures · answer keys · free</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🧮 </span>Color by answer</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">A math problem waits in every square. Solve it, find the answer in the key and color, and the picture appears only for those who solve correctly.{chosen && ` Pick an operation for the ${cbnLower(chosen)}.`}</p>
    </header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CBN_MATH_KINDS.map(k => {
        const p = chosen && cbnFitsKind(chosen, k.id) ? chosen : CBN_PICTURES.find(x => x.level === k.level && cbnFitsKind(x, k.id))
        const words = KINDS_EN[k.id]
        return <Link key={k.id} to={`${answerPathEn(k)}${query}`} className="wobbly flex gap-3 border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-transform hover:-translate-y-1">
          <div className="cbn-thumb w-24 flex-none"><CbnSvg p={p} mode="solution" label={`${words.label}: ${cbnName(p)}`} /></div>
          <div><h2 className="text-2xl font-bold">{k.emoji} {words.label}</h2>
            <p className="text-[var(--muted-foreground)]">{words.grade} · for example <b dir="ltr">{k.sample}</b></p>
            <span className="mt-1 inline-block font-bold underline decoration-dashed">See the pages →</span></div>
        </Link>
      })}
    </section>
    <MoreWaysEn skip={ANSWER_HUB} />
    <ArtBody paragraphs={[
      'Color by answer turns math practice into a game: instead of a page of dry problems, every solved problem colors one more square of the picture. Kids work through dozens of problems without noticing, and they check themselves, because a picture that comes out "wrong" shows something was missed.',
      `All ${CBN_PICTURES.length} color by number pictures come in every operation: addition and subtraction to 10 for kindergarten and grade 1, addition and subtraction to 20 for grades 1–2, and times tables and division for the older grades. Every page has a full-color answer key, and you can print a booklet of ${BOOKLET} pictures at once.`,
    ]} faq={ANSWER_FAQ} related={[{ label: 'Color by number', href: CBN_HUB }, { label: 'Color by letter', href: LETTER_PAGE }, ...enLink('/printables/math-worksheets', 'Math worksheets'), { label: 'Printable worksheets', href: '/en/worksheets' }]} />
  </ArtFrame>
}

function answerFaq(k) {
  const w = KINDS_EN[k.id]
  return [
    { q: `How does a ${w.label.toLowerCase()} color by answer page work?`, a: `Each square holds a problem (for example ${k.sample}). Solve it, find the answer in the key and color the square in its color. Every color has an answer of its own, so there is no guessing.` },
    { q: 'What age is it for?', a: `Mostly ${w.grade.charAt(0).toLowerCase() + w.grade.slice(1)}. Small pictures with only a few colors suit beginners, and big pictures with lots of squares suit anyone who wants a longer challenge.` },
    { q: 'Can I print several pictures together?', a: `Yes. "Booklet of ${BOOKLET} pictures" prints the chosen picture and the ones after it, each on its own page, with answer keys if you tick the box.` },
    ANSWER_FAQ[1],
  ]
}

export function ColorByAnswerKindEn({ params: route }) {
  const k = cbnMathKindBySlug(route?.op)
  return k ? <AnswerKind key={k.id} k={k} /> : <EnglishNotFound />
}

function AnswerKind({ k }) {
  const list = useMemo(() => byLevelFirst(CBN_PICTURES.filter(p => cbnFitsKind(p, k.id)), k.level), [k])
  const [p, pick, params] = usePicture(list)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const data = useMemo(() => ({ tags: cbnAnswers(p, k.id), cells: cbnMathGrid(p, k.id).map(row => row.map(ex => ex?.text)) }), [k, p])
  const w = KINDS_EN[k.id]
  const title = `Color by answer: ${w.label.toLowerCase()}`
  const how = 'Solve the problem in each square, find the answer in the key and color the square in its color.'
  const sheetsOf = pics => pics.flatMap(x => {
    const tags = cbnAnswers(x, k.id), cells = cbnMathGrid(x, k.id).map(row => row.map(ex => ex?.text))
    return [<SheetEn key={x.slug} p={x} mode="code" title={title} how={how} tags={tags} cells={cells} footer="Color by answer" />, ...(withSolution ? [<SheetEn key={`${x.slug}-sol`} p={x} mode="solution" footer="Color by answer" />] : [])]
  })
  const faq = answerFaq(k)
  const query = params.get('p') ? `?p=${p.slug}` : ''
  return <ArtFrame path={answerPathEn(k)} crumbs={[{ label: 'Color by answer', href: ANSWER_HUB }, { label: w.label }]} faq={faq}>
    <header className="text-center">
      <span className={`inline-flex rounded-full px-4 py-2 font-bold ${badge(k.level)}`}>{w.grade} · {list.length} pictures · answer keys</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{k.emoji} </span>Color by answer: {w.label.toLowerCase()}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">Every square holds a {w.label.toLowerCase()} problem. Solve it, find the answer in the key and color, until the {cbnLower(p)} appears.</p>
    </header>
    <nav aria-label="Kind of problems" className="no-print mt-6 flex flex-wrap justify-center gap-2">
      {CBN_MATH_KINDS.map(x => <Link key={x.id} to={`${answerPathEn(x)}${query}`} aria-current={k.id === x.id ? 'page' : undefined} preventScrollReset className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-2 font-bold ${k.id === x.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{x.emoji} {KINDS_EN[x.id].label}</Link>)}
    </nav>
    <PicturePicker list={list} current={p} onPick={pick} />
    <PrintBar onOne={() => setPrinting([p])} onBooklet={() => setPrinting(bookletOf(list, p))} withSolution={withSolution} setWithSolution={setWithSolution} />
    <CodePlay key={p.slug} p={p} cells={data.cells} tags={data.tags} tagName="Answer" label={`${cbnName(p)}: ${title}`} />
    <p className="no-print mt-4 text-center"><Link to={cbnPathEn(p)} className="font-bold underline">The {cbnLower(p)} as color by number</Link> · <Link to={`${LETTER_PAGE}?p=${p.slug}`} className="font-bold underline">Color by letter</Link></p>
    {printing && <PrintPreview lang="en" title={title} onClose={() => setPrinting(null)}>{sheetsOf(printing)}</PrintPreview>}
    <ArtBody paragraphs={[
      `${w.label} color by answer pages mix math practice with coloring: every square is a problem, and every correct answer colors in one more part of the picture. The problems suit ${w.grade.charAt(0).toLowerCase() + w.grade.slice(1)}, and each color in the key has exactly one answer.`,
      `Choose any of the ${list.length} pictures, from small ones for little kids to detailed ones for older kids, then color online or print one page or a booklet of ${BOOKLET} pictures, with a full-color answer key to check against.`,
    ]} faq={faq} related={[{ label: 'All kinds of color by answer', href: ANSWER_HUB }, { label: 'Color by number', href: CBN_HUB }, ...enLink('/printables/math-worksheets', 'Math worksheets'), ...(k.id === 'mult' || k.id === 'div' ? enLink('/learn/multiplication-table', 'Times tables') : []), { label: 'Printable worksheets', href: '/en/worksheets' }]} />
  </ArtFrame>
}

// ── color by letter (English letters) ──
const LETTER_FAQ = [
  { q: 'What is the difference between the levels?', a: 'Capital letters: capitals that are easy to tell apart, for pre-K and kindergarten. Lowercase letters: the ones kids mix up (b/d/p/q, m/n, h/u), so they have to notice which way each letter faces. Capital ↔ lowercase: the key shows the capital and the squares show its lowercase partner, which practices matching the two.' },
  { q: 'Does my child need to read?', a: 'No. There are no words to read, only letter shapes to compare between the square and the key. That is exactly the skill that gets kids ready to read.' },
  ANSWER_FAQ[3],
]

export function ColorByLetterEn() {
  const levels = CBN_LETTER_LEVELS.filter(l => l.lang === 'en')
  const [searchParams, setParams] = useSearchParams()
  const lv = levels.find(l => l.id === searchParams.get('level')) || levels[0]
  const levelId = lv.id, ageLevel = lv.level
  const list = useMemo(() => byLevelFirst(CBN_PICTURES, ageLevel), [ageLevel])
  const [p, pick] = usePicture(list)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const data = useMemo(() => ({ tags: cbnLetterTags(p, levelId), cells: cbnLetterGrid(p, levelId) }), [p, levelId])
  const setLevel = id => { const next = new URLSearchParams(searchParams); if (id === levels[0].id) next.delete('level'); else next.set('level', id); setParams(next, { replace: true, preventScrollReset: true }) }
  const words = LETTER_LEVELS_EN[lv.id]
  const title = `Color by letter: ${words.label.toLowerCase()}`
  const how = 'Find the letter from the square in the key and color the square in its color.'
  const sheetsOf = pics => pics.flatMap(x => [
    <SheetEn key={x.slug} p={x} mode="code" title={title} how={how} tags={cbnLetterTags(x, lv.id)} cells={cbnLetterGrid(x, lv.id)} footer="Color by letter" />,
    ...(withSolution ? [<SheetEn key={`${x.slug}-sol`} p={x} mode="solution" footer="Color by letter" />] : []),
  ])
  return <ArtFrame path={LETTER_PAGE} crumbs={[{ label: 'Color by number', href: CBN_HUB }, { label: 'Color by letter' }]} faq={LETTER_FAQ}>
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">3 levels · {CBN_PICTURES.length} pictures · answer keys · free</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🎨 </span>Color by letter</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">Every square has a letter. Find it in the key and color it in: ABC practice that ends in a picture.</p>
    </header>
    <nav aria-label="Difficulty" className="no-print mt-6 flex flex-wrap justify-center gap-2">
      {levels.map(l => <button key={l.id} type="button" aria-pressed={lv.id === l.id} onClick={() => setLevel(l.id)} className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${lv.id === l.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{LETTER_LEVELS_EN[l.id].label} <small className="font-normal">({LETTER_LEVELS_EN[l.id].grade})</small></button>)}
    </nav>
    <p className="no-print mt-2 text-center text-[var(--muted-foreground)]" role="status">{words.hint}</p>
    <PicturePicker list={list} current={p} onPick={pick} />
    <PrintBar onOne={() => setPrinting([p])} onBooklet={() => setPrinting(bookletOf(list, p))} withSolution={withSolution} setWithSolution={setWithSolution} />
    <CodePlay key={`${lv.id}-${p.slug}`} p={p} cells={data.cells} tags={data.tags} tagName="Letter" label={`${cbnName(p)}: ${title}`} />
    <p className="no-print mt-4 text-center"><Link to={cbnPathEn(p)} className="font-bold underline">The {cbnLower(p)} as color by number</Link> · <Link to={`${ANSWER_HUB}?p=${p.slug}`} className="font-bold underline">Color by answer</Link></p>
    {printing && <PrintPreview lang="en" title={title} onClose={() => setPrinting(null)}>{sheetsOf(printing)}</PrintPreview>}
    <MoreWaysEn skip={LETTER_PAGE} />
    <ArtBody paragraphs={[
      'Color by letter helps kids get to know the alphabet: look for the letter in the key, compare the shapes and color. Mixing up b, d, p and q is one of the most common mistakes in early reading, and the lowercase level practices exactly that.',
      `At the capital ↔ lowercase level the key shows a capital letter and the squares show its lowercase partner, like A and a or G and g. All ${CBN_PICTURES.length} pictures come in every level, with an answer key.`,
    ]} faq={LETTER_FAQ} related={[{ label: 'Color by number', href: CBN_HUB }, { label: 'Color by answer', href: ANSWER_HUB }, { label: 'Reading and the ABC', href: '/en/reading' }, { label: 'Printable worksheets', href: '/en/worksheets' }]} />
  </ArtFrame>
}

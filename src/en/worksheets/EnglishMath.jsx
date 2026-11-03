import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { ExerciseSheet, PathSheet } from '../../components/math/MathSheet'
import { exercises, paths, newSeed } from '../../utils/mathSheets'
import { nearby } from '../../utils/nearby'
import { EnglishNotFound } from '../EnglishLayout'
import { WORKSHEETS_PAGES, MATH_PRESETS, MATH_SLUGS, WS } from './catalog'
import { Pills, Crumbs, PageHead, PrintNote, LinkRow } from './ui'

// English version of /printables/math-worksheets/*: the same generators (src/utils/mathSheets.js) and
// the same A4 sheets (src/components/math/MathSheet.jsx, lang="en"); only the page around them is English.

const TYPES = [['regular', 'Standard'], ['missing', 'Missing number'], ['vertical', 'In columns'], ['pictures', 'With pictures (to 10)']]
const OPS = [['+', 'Addition'], ['-', 'Subtraction'], ['mix', 'Both']]
const VARIANTS = [['numbers', 'Fill the circles'], ['ops', 'Fill the steps'], ['mixed', 'Mixed']]

const pathOf = slug => (slug === 'hub' ? `${WS}/math` : `${WS}/math/${slug}`)
const tableSlug = (op, t) => (op === 'x' ? (t === 'mix' ? 'multiplication' : `multiplication-table-${t}`) : t === 'mix' ? 'division' : null)
const pageMeta = slug => WORKSHEETS_PAGES.find(p => p.path === pathOf(slug))

const TABLE_TRICK = {
  2: 'Multiplying by 2 is doubling: 2 × 7 is 7 + 7. Every answer is even.',
  3: 'Times 3 is times 2 plus one more group: 3 × 7 = 14 + 7 = 21. The digits of every answer up to 30 add up to 3, 6 or 9.',
  4: 'Times 4 is doubling twice: 4 × 6 = 2 × 12 = 24. The last digits repeat 4, 8, 2, 6, 0.',
  5: 'Every answer ends in 0 or 5, and 5 × n is half of 10 × n: 5 × 8 = 80 ÷ 2 = 40. Clock minutes count by fives.',
  6: 'Times 6 is times 5 plus one more group: 6 × 7 = 35 + 7 = 42. For even numbers, the last digit of the answer matches the number: 6 × 4 = 24.',
  7: 'The 7 table has the facts children find hardest, such as 7 × 8 = 56. Practice it in short sheets, and use the facts you know already (7 × 5 and 7 × 2).',
  8: 'Times 8 is doubling three times: 8 × 6 = 6, 12, 24, 48. Remember that 8 × 8 = 64 and 8 × 7 = 56.',
  9: 'The digits of every answer up to 90 add up to 9 (9 × 7 = 63, and 6 + 3 = 9). Another trick: 9 × n is 10 × n minus n.',
  10: 'Times 10 puts a zero at the end of the number. It is the easiest table, and a good first success.',
}

function copyFor(p, preset) {
  if (preset === 'hub') return {
    paragraphs: [
      'These math worksheets are made on the spot from the options you choose: the number range, the operation and the kind of problem. Every click on "New sheet" gives different problems, so you can practice every day without repeating a page.',
      'Choose a range (within 10, 20 or 100), addition, subtraction or both, and standard, missing-number or vertical problems. Picture problems are available within 10. Tick "Add an answer key" and every sheet is followed by a page with the answers in color.',
      'A tip for parents: one sheet a day, ten minutes, works better than five sheets at the weekend. If a child struggles, go back to a smaller range or to the picture problems.',
    ],
    faq: [
      { q: 'What is the difference between within 10 and within 20?', a: 'Within 10 is where children start: counting, simple adding and taking away. Within 20 comes next, and the hard part is crossing ten (for example 8 + 5 or 13 − 6). Most problems on the within-20 sheets cross ten.' },
      { q: 'What does "missing number" mean?', a: 'A problem where one of the numbers is missing instead of the answer, such as 4 + ___ = 9. It teaches the link between addition and subtraction.' },
      { q: 'Is there an answer key?', a: 'Yes. Tick "Add an answer key" and the answers are printed in color on a separate page after each worksheet.' },
      { q: 'How many sheets can I print?', a: 'As many as you like. Each click on "New sheet" makes different problems, and you can print up to five different sheets at once. It is free and needs no sign-up.' },
    ],
  }
  if (p.mode === 'paths') return {
    paragraphs: [
      'Math paths are a favorite in Grade 1. The child starts at the yellow circle, does the step on the arrow and moves on, like a journey. It practices adding and subtracting in a row without feeling like one more page of problems.',
      'You can choose paths where the numbers in the circles are missing, paths where the numbers are known and the child works out the step on the arrow (from 4 to 9 is +5), or a mix of both for children who are already confident.',
    ],
    faq: [
      { q: 'What is a math path?', a: 'A chain of circles joined by arrows. Each arrow shows a step (+3, −2) and the child works from circle to circle. Some paths ask for the numbers, and some ask for the missing step on the arrow.' },
      { q: 'Which grade are the paths for?', a: 'Paths within 10 suit Grade 1 from the start of the year. Paths within 20 suit the middle and end of Grade 1, and review in Grade 2.' },
      { q: 'Is there an answer key?', a: 'Yes. Tick "Add an answer key" and every sheet is followed by the completed paths, with the answers in color.' },
    ],
  }
  if (p.mode === 'table') {
    const t = p.table, mul = p.op === 'x'
    return {
      paragraphs: [
        t === 'mix'
          ? `${mul ? 'Multiplication' : 'Division'} sheets are made automatically: choose one times table or all of them together and get 20 new problems at every click. Problems appear both ways round (7 × 3 and 3 × 7), so children see that they are the same fact.`
          : `This page makes practice for the ${t} times table${mul ? '' : ', turned around into division'}: 20 new problems at every click, in both orders (${t} × 3 and 3 × ${t}). ${TABLE_TRICK[t]}`,
        'One table does not have 20 different facts, so some problems appear in "missing number" form (7 × ___ = 21) instead of repeating the same problem twice.',
        t === 'mix' ? 'Learn one table at a time, easiest first: 2, 5 and 10, then 3 and 4, and last 6, 7, 8 and 9. When a table is fluent, mix them all.' : `All the answers in the ${t} table: ${Array.from({ length: 10 }, (_, i) => t * (i + 1)).join(', ')}.`,
      ],
      faq: [
        { q: 'What is the best way to learn the times tables?', a: 'One table at a time, from easy to hard: 2, 5 and 10 first, then 3 and 4, and last 6, 7, 8 and 9. One sheet a day for the same table, and only when it is fluent move to the next. Then use sheets with all the tables mixed.' },
        { q: 'Is division included?', a: 'Yes. Choose "Division" and you get the same table turned around (42 ÷ 6 = ___). Division helps children remember multiplication, because every division fact is a question about the times table.' },
        { q: 'What is a "missing number" in multiplication?', a: 'A problem such as 7 × ___ = 56. The child has to think which number times 7 makes 56, which is excellent practice before division.' },
        { q: 'Is there an answer key?', a: 'Yes. Tick "Add an answer key" and the answers are printed in color after each sheet.' },
      ],
    }
  }
  const [n, w] = p.range === 10 ? ['10', 'Within 10 is the first stage of addition and subtraction: counting, putting together and taking away. Picture problems help the youngest children count before they write the answer.']
    : p.range === 20 ? ['20', 'Within 20 the main difficulty is crossing ten (8 + 5, 13 − 6). Most problems on these sheets cross ten, because that is where Grade 1 children need the most practice. A useful strategy is to make ten first: 8 + 5 is 8 + 2 + 3.']
      : ['100', 'Within 100, Grade 2 children work with two-digit numbers. The sheets avoid trivial problems such as 3 − 2 and mix problems with and without regrouping (carrying and borrowing). Think in tens and ones: 47 + 26 is 40 + 20 and 7 + 6.']
  return {
    paragraphs: [
      `${p.crumb} worksheets are made automatically from the choices you make: the operation and the kind of problem. Every click on "New sheet" gives different problems (20 on a page), so you can practice daily without repeating a sheet.`,
      w,
      'Tip for parents: one sheet a day, about ten minutes. If the sheet feels too hard, go back to a smaller range. If it feels too easy, choose missing-number or vertical problems.',
    ],
    faq: [
      { q: `Which grade are the ${p.crumb.toLowerCase()} sheets for?`, a: `They are designed for ${p.grade}, but any child practicing within ${n} can use them.` },
      { q: 'What is the "missing number" type?', a: 'One of the numbers is missing instead of the answer, for example 4 + ___ = 9. It builds the link between addition and subtraction.' },
      { q: 'Is there an answer key?', a: 'Yes. Tick "Add an answer key" and every sheet is followed by a page with the answers in color.' },
    ],
  }
}

function MathPage({ slug }) {
  const preset = slug || 'hub'
  const p = MATH_PRESETS[preset] || { mode: 'exercises', range: 10 }
  const meta = pageMeta(preset)
  const navigate = useNavigate()
  const [range, setRange] = useState(p.range || 10)
  const [op, setOp] = useState(p.op || 'mix')
  const [table, setTable] = useState(p.table ?? 'mix')
  const [type, setType] = useState('regular')
  const [variant, setVariant] = useState('numbers')
  const [pages, setPages] = useState(1)
  const [withAnswers, setWithAnswers] = useState(false)
  const [seed, setSeed] = useState(newSeed)
  const [print, setPrint] = useState(false)
  const isPaths = p.mode === 'paths', isTable = p.mode === 'table'

  // Picking another table or operation moves to that page, so the title and the address follow the sheet.
  const pickTable = (nextOp, nextTable) => {
    setOp(nextOp); setTable(nextTable); setSeed(newSeed())
    const target = tableSlug(nextOp, nextTable)
    if (target && target !== preset) navigate(pathOf(target), { preventScrollReset: true })
  }
  const offPage = isTable && tableSlug(op, table) !== preset
  const effType = (range > 10 || isTable) && type === 'pictures' ? 'regular' : isTable && type === 'vertical' ? 'regular' : type
  const sheetTitle = isPaths ? `Math paths within ${range}`
    : isTable ? (op === '÷' ? (table === 'mix' ? 'Division facts' : `Division by ${table}`) : (table === 'mix' ? 'Multiplication facts' : `Times table of ${table}`))
      : `${op === '+' ? 'Addition' : op === '-' ? 'Subtraction' : 'Addition and subtraction'} within ${effType === 'pictures' ? 10 : range}`

  const make = s => isPaths
    ? paths({ range, count: 7, variant, seed: s })
    : exercises({ range, op, type: effType, count: effType === 'pictures' ? 8 : 20, seed: s, table })
  const render = (items, answers, key) => <article className="buga-a4 en-print-sheet" dir="ltr" key={key}><div className="print-art">
    {isPaths ? <PathSheet items={items} title={sheetTitle} answers={answers} lang="en" /> : <ExerciseSheet items={items} title={sheetTitle} type={effType} answers={answers} lang="en" />}
  </div></article>

  const preview = useMemo(() => make(seed), [seed, range, op, effType, variant, isPaths, table]) // eslint-disable-line react-hooks/exhaustive-deps
  const printPages = useMemo(() => {
    if (!print) return []
    return Array.from({ length: pages }, (_, i) => { const items = i === 0 ? preview : make(seed * 31 + i * 7919); return [render(items, false, 'q' + i), ...(withAnswers ? [render(items, true, 'a' + i)] : [])] }).flat()
  }, [print]) // eslint-disable-line react-hooks/exhaustive-deps

  const { paragraphs, faq } = copyFor(p, preset)
  const siblings = MATH_SLUGS.filter(k => k !== preset && !k.startsWith('multiplication-table-'))
  const tableLinks = [2, 3, 4, 5, 6, 7, 8, 9, 10]
  const related = nearby(MATH_SLUGS, k => k === preset, 3).map(k => ({ label: MATH_PRESETS[k].crumb, href: pathOf(k) }))
  const heading = offPage ? sheetTitle : (preset === 'hub' ? 'Math worksheets for Grades 1 to 3' : p.h1)

  return <div className="en-page ws-page">
    <SEO lang="en" path={meta.path} title={meta.title} description={meta.description} counterpartPath={meta.counterpart} structuredData={faqSchema(faq)} />
    <Crumbs trail={preset === 'hub' ? [] : [{ label: 'Math', href: `${WS}/math` }]} current={preset === 'hub' ? 'Math' : p.crumb} />
    <PageHead emoji={offPage ? (op === '÷' ? '➗' : '✖️') : (p.emoji || '🔢')} title={heading}
      sub={preset === 'hub' ? 'Addition, subtraction, times tables and math paths. Choose a range, print, and get a new sheet at every click.' : isTable ? `20 problems per page, with an answer key. ${p.grade}.` : `Free worksheets for ${p.grade}. 20 problems per page, a new sheet at every click, with an answer key.`} />

    {!isTable && <LinkRow label="Ready-made sheets" links={[['up-to-10', 'Within 10'], ['up-to-20', 'Within 20'], ['up-to-100', 'Within 100'], ['paths', '🛤️ Paths'], ['clock', '🕒 Clock'], ['fractions', '🍕 Fractions']].filter(([id]) => id !== preset).map(([id, label]) => ({ href: pathOf(id), label }))} />}

    {preset === 'hub' && <section className="ws-times" aria-labelledby="times-title">
      <h2 id="times-title">✖️ Times tables for Grades 2 and 3</h2>
      <p>Choose a table and get 20 new problems at every click.</p>
      <div className="ws-pills">
        {tableLinks.map(n => <Link key={n} to={pathOf(`multiplication-table-${n}`)} className="ws-link-pill" aria-label={`Times table of ${n}`}>{n}</Link>)}
        <Link to={pathOf('multiplication')} className="ws-link-pill">All tables</Link>
        <Link to={pathOf('division')} className="ws-link-pill">➗ Division</Link>
      </div>
    </section>}

    <div className="ws-split">
      <div className="ws-panel">
        {isTable ? <>
          <Pills label="Operation" items={[['x', 'Multiplication'], ['÷', 'Division']]} value={op} onChange={v => pickTable(v, table)} />
          <Pills label="Table" items={[...tableLinks.map(n => [n, String(n)]), ['mix', 'All tables']]} value={table} onChange={v => pickTable(op, v)} />
          <Pills label="Type" items={TYPES.slice(0, 2)} value={effType} onChange={v => { setType(v); setSeed(newSeed()) }} />
        </> : <>
          <Pills label="Range" items={[[10, 'Within 10'], [20, 'Within 20'], ...(isPaths ? [] : [[100, 'Within 100']])]} value={range} onChange={v => { setRange(v); setSeed(newSeed()) }} />
          {isPaths
            ? <Pills label="Fill in" items={VARIANTS} value={variant} onChange={v => { setVariant(v); setSeed(newSeed()) }} />
            : <>
              <Pills label="Operation" items={OPS} value={op} onChange={v => { setOp(v); setSeed(newSeed()) }} />
              <Pills label="Type" items={range > 10 ? TYPES.slice(0, 3) : TYPES} value={effType} onChange={v => { setType(v); setSeed(newSeed()) }} />
            </>}
        </>}
        <div className="ws-actions">
          <label className="ws-check">Number of sheets
            <select value={pages} onChange={e => setPages(+e.target.value)}>{[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}</select>
          </label>
          <label className="ws-check"><input type="checkbox" checked={withAnswers} onChange={e => setWithAnswers(e.target.checked)} />Add an answer key</label>
        </div>
        <div className="ws-actions">
          <button type="button" className="ws-secondary" onClick={() => setSeed(newSeed())}>🎲 New sheet</button>
          <button data-print-main type="button" className="ws-primary" onClick={() => setPrint(true)}>🖨️ Print{pages > 1 ? ` ${pages} sheets` : ''} or save a PDF</button>
        </div>
        <PrintNote />
      </div>
      <button type="button" className="ws-preview" onClick={() => setPrint(true)} aria-label="Preview. Click to print.">
        <div className="ws-preview-box">{isPaths ? <PathSheet items={preview} title={sheetTitle} lang="en" /> : <ExerciseSheet items={preview} title={sheetTitle} type={effType} lang="en" />}</div>
      </button>
    </div>

    <nav className="ws-links" aria-label="More math worksheets">
      <span className="ws-pills-label">More math sheets:</span>
      {siblings.filter(k => !(preset === 'hub' && k === 'multiplication')).map(k => <Link key={k} to={pathOf(k)} className="ws-link-pill">{MATH_PRESETS[k].crumb}</Link>)}
    </nav>

    <SeoBody lang="en" paragraphs={paragraphs} faq={faq} related={[...related, { label: 'All printable worksheets', href: WS }]} />
    {print && <PrintPreview lang="en" copies={false} title={sheetTitle} onClose={() => setPrint(false)} onRefresh={() => setSeed(newSeed())}>{printPages}</PrintPreview>}
  </div>
}

export default function EnglishMath({ params }) {
  const slug = params?.topic
  if (slug && !MATH_PRESETS[slug]) return <EnglishNotFound />
  return <MathPage key={slug || 'hub'} slug={slug} />
}

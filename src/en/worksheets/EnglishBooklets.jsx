import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { A4, SvgPage, Pic, W } from '../../booklets/kit'
import { WARM, FRAMES, LINE, NO_CROSS, TO_TEN, TO_TWENTY, CROSS, DOUBLES, PICS, MISSING, THREE, COMPARE } from '../../booklets/mathAdd20'
import { EnglishNotFound } from '../EnglishLayout'
import { WORKSHEETS_PAGES, WS } from './catalog'
import { Crumbs, PageHead, PrintNote } from './ui'

// English version of the "Addition within 20" booklet (/booklets/add-to-20). The exercises are the Hebrew
// booklet's own data (exported from src/booklets/mathAdd20.jsx), so the numbers are identical;
// the pages, instructions and word problems are English and read left to right.
const FONT = 'Arial, Helvetica, sans-serif'
const INK = '#111'
const symbol = (x, y) => x > y ? '>' : x < y ? '<' : '='
const WORD_PROBLEMS = [
  ['Maya has 8 cat stickers and 6 dog stickers. How many stickers does she have in all?', 8, 6],
  ['There are 9 red flowers and 5 yellow flowers in the garden. How many flowers are in the garden?', 9, 5],
  ['Ben read 7 pages on Sunday and 8 more pages on Monday. How many pages did he read in the two days?', 7, 8],
  ['There are 12 apples in a bowl. Dad adds 6 more apples. How many apples are in the bowl now?', 12, 6],
  ['Tamar has 9 dollars. Mom gives her 9 more dollars. How many dollars does Tamar have?', 9, 9],
  ['There are 11 girls and 7 boys in the class. How many children are in the class?', 11, 7],
].map(([q, a, b]) => ({ q, ans: `${a} + ${b} = ${a + b}` }))

const PAGE_TITLES = ['Warm-up: adding to 10', 'Ten frames', 'The number line', 'Adding to 20 without crossing ten', 'Making 10', 'Making 20', 'Adding across ten', 'Doubles', 'Adding with pictures', 'The missing number', 'Three addends', 'Greater, less or equal', 'Word problems', 'Answer key for parents']

function Head({ n, title, instruction }) {
  return <g fontFamily={FONT} textAnchor="middle" fill={INK} direction="ltr">
    <text x={W / 2} y="40" fontSize="25" fontWeight="800">{title}</text>
    <text x={W / 2} y="68" fontSize="14">Name: ____________    Page {n} of the booklet</text>
    <text x={W / 2} y="98" fontSize="17" fontWeight="700">{instruction}</text>
  </g>
}

function Problems({ n, title, instruction, items }) {
  const rows = Math.ceil(items.length / 2), rowH = Math.min(100, 640 / rows)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => {
      const col = i % 2, y = 150 + Math.floor(i / 2) * rowH + rowH / 2, cx = col ? 450 : 150
      return <g key={i} fontFamily={FONT}>
        <text x={cx - 130} y={y + 4} fontSize="14" fill="#666" textAnchor="middle">{i + 1}.</text>
        <text x={cx} y={y + 10} fontSize="28" fontWeight="700" textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{it.text}</text>
        <path d={`M${col ? 310 : 20} ${y + rowH / 2} H${col ? 580 : 290}`} stroke="#eee" />
      </g>
    })}
  </SvgPage>
}

function Frame({ x, y, k, color }) {
  return <g>{Array.from({ length: 10 }, (_, i) => {
    const cx = x + (i % 5) * 30, cy = y + Math.floor(i / 5) * 30
    return <g key={i}>
      <rect x={cx} y={cy} width="30" height="30" fill="white" stroke={INK} strokeWidth="2" />
      {i < k && <circle cx={cx + 15} cy={cy + 15} r="10" fill={color} stroke={INK} strokeWidth="1.5" />}
    </g>
  })}</g>
}
function FramesPage({ n }) {
  return <SvgPage label="Ten frames">
    <Head n={n} title="Ten frames" instruction="Count the dots in both frames and write the problem" />
    {FRAMES.map(([a, b], i) => { const y = 150 + i * 130; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <Frame x={20} y={y} k={a} color="#fde68a" />
      <Frame x={200} y={y} k={b} color="#bfdbfe" />
      <text x={470} y={y + 42} fontSize="26" fontWeight="700" direction="ltr">__ + __ = __</text>
      {i < FRAMES.length - 1 && <path d={`M30 ${y + 100} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}
function LinePage({ n }) {
  const x0 = 40, step = 26
  return <SvgPage label="The number line">
    <Head n={n} title="The number line" instruction="Start at the first number and hop forward. Write the answer." />
    {LINE.map(([s, h], i) => { const y = 190 + i * 125; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <text x={300} y={y - 48} fontSize="26" fontWeight="700" direction="ltr">{`${s} + ${h} = ____`}</text>
      <path d={`M${x0} ${y} H${x0 + 20 * step}`} stroke={INK} strokeWidth="2.5" />
      {Array.from({ length: 21 }, (_, k) => <g key={k}>
        <path d={`M${x0 + k * step} ${y - 6} V${y + 6}`} stroke={INK} strokeWidth="2" />
        <text x={x0 + k * step} y={y + 24} fontSize="13" fontWeight={k === s ? 800 : 400}>{k}</text>
      </g>)}
      <circle cx={x0 + s * step} cy={y} r="9" fill="none" stroke={INK} strokeWidth="2.5" />
    </g> })}
  </SvgPage>
}
function PicturesPage({ n }) {
  return <SvgPage label="Adding with pictures">
    <Head n={n} title="Adding with pictures" instruction="Count each group and write the problem and the answer" />
    {PICS.map(([e, a, b], i) => { const y = 160 + i * 127; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: a }, (_, k) => <Pic key={k} item={{ emoji: e }} x={45 + (k % 5) * 36} y={y + 20 + Math.floor(k / 5) * 36} size={32} />)}
      <text x={245} y={y + 40} fontSize="34" fontWeight="800">+</text>
      {Array.from({ length: b }, (_, k) => <Pic key={k} item={{ emoji: e }} x={290 + (k % 5) * 36} y={y + 20 + Math.floor(k / 5) * 36} size={32} />)}
      <text x={515} y={y + 44} fontSize="24" direction="ltr">{`__ + __ = __`}</text>
      {i < PICS.length - 1 && <path d={`M30 ${y + 108} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}
function ComparePage({ n }) {
  return <SvgPage label="Greater, less or equal">
    <Head n={n} title="Greater, less or equal?" instruction="Work out each side and write <  or  >  or  =  in the circle" />
    {COMPARE.map(([a, b, c, d], i) => {
      const y = 190 + i * 100
      return <g key={i} fontFamily={FONT} fontSize="32" fontWeight="700" textAnchor="middle" direction="ltr">
        <text x={160} y={y + 11}>{`${a} + ${b}`}</text>
        <circle cx={300} cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" />
        <text x={440} y={y + 11}>{`${c} + ${d}`}</text>
      </g>
    })}
  </SvgPage>
}
function WordProblemsPage({ n }) {
  return <A4 style={{ alignItems: 'stretch', fontFamily: FONT }}>
    <h2 style={{ textAlign: 'center' }}>📖 Word problems</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>Name: ______________ · Page {n} of the booklet · Write a number sentence and the answer</p>
    <ol style={{ fontSize: '14pt', lineHeight: 1.6, padding: '0 4mm 0 10mm', margin: '4mm 0 0', textAlign: 'left' }}>
      {WORD_PROBLEMS.map(p => <li key={p.q} style={{ marginBottom: '12mm' }}>{p.q}<br />Number sentence: ______________ &nbsp; Answer: ______________</li>)}
    </ol>
  </A4>
}
function Key({ n }) {
  const list = items => items.map(it => String(it.ans))
  const sections = [
    [2, list(WARM)],
    [3, FRAMES.map(([a, b]) => `${a} + ${b} = ${a + b}`)],
    [4, LINE.map(([s, h]) => String(s + h))],
    [5, list(NO_CROSS)], [6, list(TO_TEN)], [7, list(TO_TWENTY)], [8, list(CROSS)], [9, list(DOUBLES)],
    [10, PICS.map(([, a, b]) => `${a} + ${b} = ${a + b}`)],
    [11, list(MISSING)], [12, list(THREE)],
    [13, COMPARE.map(([a, b, c, d]) => `${a + b} ${symbol(a + b, c + d)} ${c + d}`)],
    [14, WORD_PROBLEMS.map(p => p.ans)],
  ]
  return <A4 style={{ alignItems: 'stretch', fontFamily: FONT }}>
    <h2 style={{ textAlign: 'center' }}>✅ Answer key for parents</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>Answers are numbered in the order of the exercises on each page, row by row.</p>
    <div style={{ fontSize: '11pt', lineHeight: 1.5, textAlign: 'left' }}>
      {sections.map(([pg, a]) => <section key={pg} style={{ marginBottom: 6 }}><b>Page {pg}: {PAGE_TITLES[pg - 2]}</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 2 }}>{a.map((x, i) => <span key={i}>{i + 1}) <bdi dir="ltr">{x}</bdi></span>)}</div></section>)}
    </div>
  </A4>
}
function CertificatePage() {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT }}>
    <div style={{ border: '6px double #111', borderRadius: 20, padding: '24mm 12mm', width: '100%' }}>
      <div style={{ fontSize: 64 }} aria-hidden="true">🏅</div>
      <h2 style={{ fontSize: '30pt', margin: '8px 0' }}>Certificate of achievement</h2>
      <p style={{ fontSize: '16pt' }}>This certificate is awarded to</p>
      <p style={{ fontSize: '22pt', margin: '10px 0 18px' }}>______________________</p>
      <p style={{ fontSize: '15pt', lineHeight: 1.6 }}>for finishing the booklet <b>Addition within 20</b>: adding to 20, crossing ten, making 10 and 20, and solving word problems.</p>
      <p style={{ fontSize: '18pt', marginTop: 24 }}>Great job, mathematician!</p>
      <p style={{ fontSize: '13pt', marginTop: 30 }}>Date: ______________</p>
    </div>
  </A4>
}
function Cover() {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT }}>
    <div style={{ fontSize: 64, lineHeight: 1.1 }} aria-hidden="true">🔟</div>
    <h2 style={{ fontSize: '30pt', margin: '10px 0 4px' }}>Math booklet: Addition within 20</h2>
    <p style={{ fontSize: '15pt', margin: '0 0 22px' }}>16 pages: ten frames, number line, crossing ten, making 10 and 20, doubles</p>
    <div style={{ border: '2px dashed #111', borderRadius: 18, padding: '16px 28px', fontSize: '18pt', marginBottom: 26 }}>This booklet belongs to: ______________________</div>
    <ol style={{ textAlign: 'left', fontSize: '12pt', lineHeight: 1.7, columns: 2, columnGap: 36, margin: '0 auto 24px', maxWidth: '150mm' }}>
      {PAGE_TITLES.map(t => <li key={t}>{t}</li>)}
    </ol>
    <p style={{ fontSize: '11.5pt', maxWidth: '150mm', margin: '0 auto', lineHeight: 1.6 }}><b>For parents:</b> one or two pages at a time is plenty. Start with the first pages and move on only when adding within 10 is secure. Fingers, blocks and the number line are welcome. The answers are on the second to last page.</p>
  </A4>
}

const BOOKLETS = {
  'add-to-20': {
    path: `${WS}/booklets/add-to-20`, emoji: '🔟', name: 'Addition within 20 booklet', audience: 'Grades 1 and 2',
    Booklet: () => <>
      <Cover />
      <Problems n={2} title="Warm-up: adding to 10" instruction="Solve the problems" items={WARM} />
      <FramesPage n={3} />
      <LinePage n={4} />
      <Problems n={5} title="Adding to 20 without crossing ten" instruction="Add the ones and keep the ten" items={NO_CROSS} />
      <Problems n={6} title="Making 10" instruction="Write how many more to reach 10" items={TO_TEN} />
      <Problems n={7} title="Making 20" instruction="Write how many more to reach 20" items={TO_TWENTY} />
      <Problems n={8} title="Adding across ten" instruction="Make ten first, then add the rest" items={CROSS} />
      <Problems n={9} title="Doubles" instruction="Add a number to itself, then to its neighbor" items={DOUBLES} />
      <PicturesPage n={10} />
      <Problems n={11} title="The missing number" instruction="Write the number that is missing" items={MISSING} />
      <Problems n={12} title="Three addends" instruction="Add from left to right, or look for two numbers that make ten" items={THREE} />
      <ComparePage n={13} />
      <WordProblemsPage n={14} />
      <Key n={15} />
      <CertificatePage />
    </>,
    faq: [
      { q: 'Which children is the booklet for?', a: 'Children in Grades 1 and 2 who are learning to add within 20. Start at the first page and move on only when adding within 10 is secure.' },
      { q: 'How many pages are there?', a: 'There are 16 A4 pages: a cover, 12 practice pages, a word problem page, an answer key for parents and a certificate.' },
      { q: 'How do I print on US Letter paper?', a: 'The pages are A4. Choose "Fit to page" in your print settings and they will fit on Letter paper.' },
    ],
    paragraphs: [
      'Adding within 20 is the step after adding within 10, and the hard part is crossing ten, as in 8 + 5. This booklet builds up to it slowly: ten frames, a number line, adding without crossing ten, making 10 and 20, and only then crossing ten and doubles.',
      'Every answer on the answer key is computed from the same numbers as the exercises, so the key always matches. The last pages mix everything: missing numbers, three addends, comparing sums and word problems.',
    ],
  },
}

export default function EnglishBooklets({ params }) {
  const b = BOOKLETS[params?.slug]
  if (!b) return <EnglishNotFound />
  return <BookletPage key={params.slug} b={b} />
}

function BookletPage({ b }) {
  const meta = WORKSHEETS_PAGES.find(p => p.path === b.path)
  const [printing, setPrinting] = useState(false)
  const { Booklet } = b
  return <div className="en-page ws-page">
    <SEO lang="en" path={meta.path} title={meta.title} description={meta.description} counterpartPath={meta.counterpart} structuredData={faqSchema(b.faq)} />
    <Crumbs current={b.name} />
    <PageHead emoji={b.emoji} title={b.name} sub={`A printable 16-page A4 workbook for ${b.audience}. Free, with an answer key and a certificate.`} />
    <div className="ws-actions">
      <button type="button" data-print-main className="ws-primary" onClick={() => setPrinting(true)}>🖨️ Print the booklet or save a PDF</button>
    </div>
    <PrintNote />
    <h2>A look inside</h2>
    <div className="ws-peek"><Booklet /></div>
    <SeoBody lang="en" paragraphs={b.paragraphs} faq={b.faq} related={[{ label: 'addition and subtraction within 20 worksheets', href: `${WS}/math/up-to-20` }, { label: 'math paths', href: `${WS}/math/paths` }, { label: 'all printable worksheets', href: WS }]} />
    <p className="ws-note"><Link to={WS}>Back to all worksheets</Link></p>
    {printing && <PrintPreview lang="en" copies={true} title={b.name} onClose={() => setPrinting(false)}><Booklet /></PrintPreview>}
  </div>
}

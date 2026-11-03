import { useMemo, useState } from 'react'
import PrintableShell, { Sheet, Choice } from '../../components/printables/PrintableShell'
import { Clock, Frac, Shape } from '../../pages/printables/MathVisualSheets'
import { CLOCK_LEVELS, FRAC_LEVELS, clockItems, fractionItems } from '../../data/mathVisualLevels.js'
import { WORKSHEETS_PAGES, WS } from './catalog'
import { LETTER_NOTE } from './ui'
import './worksheets.css'
import '../english.css'

// English clock and fraction worksheets: the same generators and the same drawings as
// /printables/clock-worksheets and /printables/fractions-worksheets; English sheet text, left-to-right layout.

const CLOCK_LABELS = { hours: 'Whole hours', half: 'Half hours', quarter: 'Quarter hours', five: 'Every 5 minutes' }
const FRAC_LABELS = { easy: 'Halves, thirds and quarters', mid: 'Up to sixths', hard: 'Up to eighths' }
const SIBLINGS = [
  { href: `${WS}/math/up-to-20`, label: '➕ Add and subtract' },
  { href: `${WS}/math/multiplication`, label: '✖️ Times tables' },
  { href: `${WS}/math/clock`, label: '🕒 Clock' },
  { href: `${WS}/math/fractions`, label: '🍕 Fractions' },
]
const CRUMBS = [{ label: 'Worksheets', href: WS }, { label: 'Math', href: `${WS}/math` }]
const meta = path => WORKSHEETS_PAGES.find(p => p.path === path)

const TE = ({ x, y, size = 6, anchor = 'middle', weight = 400, fill = '#111', children }) =>
  <text x={x} y={y} fontSize={size} textAnchor={anchor} fontWeight={weight} fill={fill} direction="ltr">{children}</text>

function NewSheet({ onClick }) {
  return <div style={{ textAlign: 'center' }}><button type="button" className="ws-secondary" onClick={onClick}>🔄 New sheet</button></div>
}

// ---- Clocks ----
const fmtTime = (h, m) => `${h}:${String(m).padStart(2, '0')}`
function inWords(h, m) {
  const next = h === 12 ? 1 : h + 1
  if (m === 0) return `${h} o'clock`
  if (m === 30) return `half past ${h}`
  if (m === 15) return `quarter past ${h}`
  if (m === 45) return `quarter to ${next}`
  return m < 30 ? `${m} minutes past ${h}` : `${60 - m} minutes to ${next}`
}

function ClockSheet({ items, mode, level, answers }) {
  const title = answers ? 'Answers' : mode === 'draw' ? 'Draw the hands' : 'What time is it?'
  return <Sheet label={`Clock worksheet: ${title}`}>
    <TE x={100} y={14} size={9} weight={800}>{title}</TE>
    <TE x={100} y={23} size={4.8} fill="#444">{CLOCK_LABELS[level]}. {mode === 'draw' ? 'Read the time and draw a short hour hand and a long minute hand.' : 'Look at the hands and write the time.'}</TE>
    <TE x={10} y={33} size={4.8} anchor="start">Name: ______________</TE>
    {items.map(([h, m], i) => {
      const col = i % 3, row = Math.floor(i / 3), cx = 34 + col * 66, cy = 64 + row * 54
      const showHands = mode === 'read' || !!answers
      return <g key={i}>
        <TE x={cx - 27} y={cy - 19} size={4.5} weight={700} fill="#888">{i + 1}</TE>
        <Clock cx={cx} cy={cy} r={19} h={h} m={m} hands={showHands} answer={answers && mode === 'draw'} />
        {mode === 'read' && !answers && <TE x={cx} y={cy + 28} size={6}>___ : ___</TE>}
        {(mode === 'draw' || answers) && <TE x={cx} y={cy + 27} size={6.5} weight={700} fill={answers && mode === 'read' ? '#c1121f' : '#111'}>{fmtTime(h, m)}</TE>}
        {(mode === 'draw' || answers) && level !== 'five' && <TE x={cx} y={cy + 33} size={3.8} fill="#555">{inWords(h, m)}</TE>}
      </g>
    })}
  </Sheet>
}

export function EnglishClock() {
  const [level, setLevel] = useState('half')
  const [mode, setMode] = useState('read')
  const [answers, setAnswers] = useState('yes')
  const [seed, setSeed] = useState(7)
  const m = meta(`${WS}/math/clock`)
  const items = useMemo(() => clockItems(level, seed), [seed, level])
  const makePages = (list, i = '') => [{ key: `q${i}`, svg: <ClockSheet items={list} mode={mode} level={level} /> }, ...(answers === 'yes' ? [{ key: `a${i}`, svg: <ClockSheet items={list} mode={mode} level={level} answers /> }] : [])]
  return <PrintableShell lang="en" path={m.path} counterpartPath={m.counterpart} emoji="🕒" h1="Telling time worksheets" seoTitle={m.title} description={m.description}
    sub="12 clocks per page. Read the time or draw the hands, with an answer key."
    crumbs={CRUMBS} siblings={SIBLINGS}
    controls={<>
      <Choice label="Level" value={level} onChange={setLevel} options={Object.keys(CLOCK_LEVELS).map(k => [k, CLOCK_LABELS[k]])} />
      <Choice label="Type" value={mode} onChange={setMode} options={[['read', '👀 What time is it?'], ['draw', '✏️ Draw the hands']]} />
      <Choice label="Answers" value={answers} onChange={setAnswers} options={[['yes', 'With an answer key'], ['no', 'No answer key']]} />
      <NewSheet onClick={() => setSeed(s => s + 1)} />
    </>}
    extra={<p className="ws-note">{LETTER_NOTE}</p>}
    pages={makePages(items)} printTitle="Telling time worksheet" onRefresh={() => setSeed(s => s + 1)} variant={i => makePages(clockItems(level, seed + i * 1000), i)}
    paragraphs={[
      'Reading an analog clock is one of the hardest topics for children, because they have to read two hands at once and turn them into a time. The best way to learn is step by step: whole hours first, then half hours, quarter hours, and only last minutes in steps of five.',
      'Each page has 12 clocks. In "What time is it?" children look at the hands and write the time. In "Draw the hands" they get a time, written in numbers and in words such as "quarter past three", and draw the short and the long hand themselves.',
      'The answer key prints on its own page, so parents and teachers can check quickly. Every click on "New sheet" makes different times, so you can practice again and again.',
    ]}
    faq={[
      { q: 'In which grade do children learn to tell time?', a: 'Whole and half hours in Grade 1, quarter hours in Grade 2, and exact minutes in Grades 2 and 3. Every child moves at their own pace.' },
      { q: 'How do I explain the difference between the hands?', a: 'The short, thick hand shows the hours and the long, thin hand shows the minutes. A tip: "The short hand tells the hour. The long hand runs fast around the minutes."' },
      { q: 'Why does the hour hand not point exactly at a number?', a: 'It moves slowly through the hour. At half past three the short hand is halfway between 3 and 4, just like on a real clock.' },
    ]}
    related={[{ label: 'math worksheets', href: `${WS}/math` }, { label: 'fractions worksheets', href: `${WS}/math/fractions` }, { label: 'mazes', href: `${WS}/mazes` }]} />
}

// ---- Fractions ----
const FRAC_MODES = { name: '👀 Which part is shaded?', color: '🖍️ Color the fraction', compare: '⚖️ Greater, less or equal' }

function FracSheet({ items, mode, answers }) {
  const title = answers ? 'Answers' : { name: 'Which part is shaded?', color: 'Color the fraction', compare: 'Compare the fractions' }[mode]
  const hint = { name: 'Write the fraction for the shaded part', color: 'Color the part that is written next to each shape', compare: 'Write > or < or = in the circle' }[mode]
  return <Sheet label={`Fractions worksheet: ${title}`}>
    <TE x={100} y={14} size={9} weight={800}>{title}</TE>
    <TE x={100} y={23} size={4.8} fill="#444">{hint}</TE>
    <TE x={10} y={33} size={4.8} anchor="start">Name: ______________</TE>
    {items.map((it, i) => {
      if (mode === 'compare') {
        const cy = 46 + i * 18.5, [a, b] = it, sign = a.n / a.d > b.n / b.d ? '>' : a.n / a.d < b.n / b.d ? '<' : '='
        return <g key={i}>
          <TE x={8} y={cy + 1.5} size={4.4} fill="#888" weight={700}>{i + 1}</TE>
          <Frac x={30} y={cy - 1} n={a.n} d={a.d} size={5} /><Shape kind="bar" cx={62} cy={cy} d={a.d} n={a.n} />
          <circle cx={100} cy={cy} r={5.5} fill="#fff" stroke="#111" strokeWidth={0.6} />
          {answers && <text x={100} y={cy + 2.4} fontSize={7} fontWeight={800} fill="#c1121f" textAnchor="middle">{sign}</text>}
          <Shape kind="bar" cx={138} cy={cy} d={b.d} n={b.n} /><Frac x={170} y={cy - 1} n={b.n} d={b.d} size={5} />
        </g>
      }
      const col = i % 2, row = Math.floor(i / 2), cx = 55 + col * 90, cy = 56 + row * 37
      const { n, d, kind } = it
      return <g key={i}>
        <TE x={cx - 46} y={cy - 12} size={4.4} fill="#888" weight={700}>{i + 1}</TE>
        <Shape kind={kind} cx={cx + 10} cy={cy} d={d} n={n} blank={mode === 'color' && !answers} />
        {mode === 'name' && !answers && <g fill="#fff" stroke="#111" strokeWidth={0.5}><rect x={cx - 29} y={cy - 9.5} width={9} height={8} rx={1} /><line x1={cx - 31} x2={cx - 18} y1={cy + 0.5} y2={cy + 0.5} strokeWidth={0.8} /><rect x={cx - 29} y={cy + 2.5} width={9} height={8} rx={1} /></g>}
        {(mode === 'color' || answers) && <Frac x={cx - 24} y={cy} n={n} d={d} color={answers && mode === 'name' ? '#c1121f' : '#111'} />}
      </g>
    })}
  </Sheet>
}

export function EnglishFractions() {
  const [level, setLevel] = useState('easy')
  const [mode, setMode] = useState('name')
  const [answers, setAnswers] = useState('yes')
  const [seed, setSeed] = useState(3)
  const m = meta(`${WS}/math/fractions`)
  const items = useMemo(() => fractionItems(level, mode, seed), [seed, level, mode])
  const makePages = (list, i = '') => [{ key: `q${i}`, svg: <FracSheet items={list} mode={mode} /> }, ...(answers === 'yes' ? [{ key: `a${i}`, svg: <FracSheet items={list} mode={mode} answers /> }] : [])]
  return <PrintableShell lang="en" path={m.path} counterpartPath={m.counterpart} emoji="🍕" h1="Fractions worksheets" seoTitle={m.title} description={m.description}
    sub="Circles and bars cut into equal parts: name, color and compare fractions."
    crumbs={CRUMBS} siblings={SIBLINGS}
    controls={<>
      <Choice label="Type" value={mode} onChange={setMode} options={Object.entries(FRAC_MODES)} />
      <Choice label="Level" value={level} onChange={setLevel} options={Object.keys(FRAC_LEVELS).map(k => [k, FRAC_LABELS[k]])} />
      <Choice label="Answers" value={answers} onChange={setAnswers} options={[['yes', 'With an answer key'], ['no', 'No answer key']]} />
      <NewSheet onClick={() => setSeed(s => s + 1)} />
    </>}
    extra={<p className="ws-note">{LETTER_NOTE}</p>}
    pages={makePages(items)} printTitle="Fractions worksheet" onRefresh={() => setSeed(s => s + 1)} variant={i => makePages(fractionItems(level, mode, seed + i * 1000), i)}
    paragraphs={[
      'Children understand fractions much better when they can see them: a circle cut like a pizza, or a bar cut like a chocolate bar. Every sheet here is built from pictures like these, so a child learns what "three quarters" means before calculating with it.',
      'There are three kinds of problems. "Which part is shaded?" asks children to look at the shape and write the fraction. "Color the fraction" gives a fraction to color. "Greater, less or equal" compares two fractions with the help of the picture.',
      'Start with halves, thirds and quarters, which suit Grade 2, and move on to sixths and eighths in Grades 3 and 4. The answer key prints on its own page for easy checking.',
    ]}
    faq={[
      { q: 'When do children learn fractions at school?', a: 'A first look at halves and quarters comes in Grade 2, and simple fractions and comparing them in Grades 3 and 4.' },
      { q: 'How do I explain numerator and denominator?', a: 'The bottom number (the denominator) tells you how many equal parts the whole is cut into. The top number (the numerator) tells you how many parts we take.' },
    ]}
    related={[{ label: 'telling time worksheets', href: `${WS}/math/clock` }, { label: 'times tables', href: `${WS}/math/multiplication` }, { label: 'math worksheets', href: `${WS}/math` }]} />
}

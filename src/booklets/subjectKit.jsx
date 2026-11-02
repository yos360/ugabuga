import { A4, Certificate, Cover, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// A booklet made only of content: the module passes its page list (from the registry) and a data object, and
// this file draws every page and the answer key. Used for the grade-by-grade subject booklets (math, Hebrew,
// science, Tanakh, history, geography …), so a new booklet is a data file, not new layout code.
//
// pages: the registry list — [cover, ...one title per section, 'דף תשובות…', 'תעודת סיום'].
// data: { emoji, subtitle, note, done, cheer, sections: [{ type, ... }] } — section types:
//   read      { text: [paragraphs], questions: [[question, answer]] }          passage + written answers
//   choice    { items: [[question, right, [wrong, wrong(, wrong)]]] }          circle the right answer
//   truefalse { items: [[statement, true|false]] }
//   match     { pairs: [[term, explanation]] }                                  write the letter in the box
//   fill      { items: [[sentence with ___, missing word]] }                   word bank under the lines
//   order     { items: [events, in the right order] }                          number them 1..n
//   problems  { items: [[exercise, answer]], cols?: 1|2 }                       exercises with a blank
//   words     { items: [[word problem, answer]] }                               exercise + answer lines
//   search    { words: [Hebrew words] }                                         word search
//   open      { prompts: [questions] }                                          thinking / drawing boxes
// Every section may also carry `instruction` (else a default one). Answers are computed from the data, so
// the key cannot drift from the pages.

const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י']
const DEFAULT_INSTRUCTION = {
  read: 'קוראים את הקטע ועונים על השאלות במילים שלכם',
  choice: 'מקיפים את התשובה הנכונה',
  truefalse: 'קוראים כל משפט ומקיפים: נכון או לא נכון',
  match: 'כותבים בריבוע את האות של ההסבר המתאים',
  fill: 'משלימים כל משפט במילה מתוך המאגר',
  order: 'כותבים בריבוע מספר לפי הסדר הנכון, מ־1 והלאה',
  problems: 'פותרים את התרגילים',
  words: 'קוראים, כותבים תרגיל ופותרים',
  search: 'מוצאים את המילים: הן כתובות מימין לשמאל או מלמעלה למטה',
  open: 'חושבים ועונים — אין כאן תשובה אחת נכונה',
}

// A permutation of 0..len-1 that is never the identity, fixed by the seed.
function scramble(len, seed, salt) {
  if (len < 2) return [0]
  for (let k = 0; ; k++) {
    const s = rngFor(seed, salt + k * 7).shuffle(Array.from({ length: len }, (_, i) => i))
    if (s.some((v, i) => v !== i)) return s
  }
}

const Sheet = ({ n, title, instruction, children }) => <A4 style={{ alignItems: 'stretch' }}>
  <h2>{title}</h2>
  <p style={{ textAlign: 'center', margin: '0 0 1mm', fontSize: '11pt' }}>שם: ______________ · עמוד {n} בחוברת</p>
  <p style={{ textAlign: 'center', margin: '0 0 3mm', fontSize: '12pt', fontWeight: 700 }}>{instruction}</p>
  {children}
  <div style={{ flex: 'none', height: '6mm' }} />
</A4>
const Rows = ({ count, children }) => <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${count}, 1fr)` }}>{children}</div>
const Row = ({ last, children, style }) => <div style={{ display: 'flex', alignItems: 'center', gap: '4mm', borderBottom: last ? 0 : '0.3mm dashed #bbb', minHeight: 0, ...style }}>{children}</div>
const Box = ({ size = 10 }) => <span style={{ display: 'inline-block', flex: 'none', width: `${size}mm`, height: `${size}mm`, border: '0.6mm solid #111', borderRadius: '2mm', background: 'white' }} />
const Pill = ({ children }) => <span style={{ flex: 'none', border: '0.5mm solid #111', borderRadius: '6mm', padding: '1.2mm 4mm', fontSize: '12pt', fontWeight: 700, background: 'white' }}>{children}</span>
const Line = () => <div style={{ borderBottom: '0.4mm solid #555', height: '8mm' }} />
const Bank = ({ words }) => <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3mm' }}>
  <div style={{ border: '0.6mm dashed #111', borderRadius: '4mm', padding: '2.5mm 6mm', fontSize: '13pt', fontWeight: 700, textAlign: 'center', lineHeight: 1.7 }}>{words.join('   ·   ')}</div>
</div>
// Numbers with a minus sign, coordinates and short formulas inside Hebrew text keep their left-to-right order
// (otherwise "−5" prints as "5−" and "(−3, 2)" flips).
// A run is any stretch of Latin letters, digits and math signs; only runs with a letter or a sign are wrapped.
const LTR = /([A-Za-z0-9(√−-][A-Za-z0-9₀-₉ +−×÷=<>≤≥().,/²³√^%-]*[A-Za-z0-9₀-₉)²³%])/
const NEEDS = /[A-Za-z−×÷=<>≤≥√²³^(]|^-/
function bidi(text) {
  if (typeof text !== 'string' || !NEEDS.test(text)) return text
  return text.split(new RegExp(LTR.source, 'g')).map((part, i) => i % 2 && NEEDS.test(part) ? <bdi key={i} dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{part}</bdi> : part)
}

// Font size that keeps a long list on one page.
const fit = (count, big, small, at = 8) => count > at ? small : big

// ---- Per-type layout (salt = page number, so two sections of one type shuffle differently) ----

const choiceItems = (s, seed, n) => s.items.map(([q, right, wrong], i) => {
  const opts = rngFor(seed, n * 50 + i).shuffle([right, ...wrong])
  return { q, opts, letter: LETTERS[opts.indexOf(right)], right }
})
const trueFalseItems = (s, seed, n) => scramble(s.items.length, seed, n * 11).map(k => s.items[k])
const matchOrder = (s, seed, n) => scramble(s.pairs.length, seed, n * 17)
const fillBank = (s, seed, n) => rngFor(seed, n * 23).shuffle(s.items.map(it => it[1]))
const orderShown = (s, seed, n) => scramble(s.items.length, seed, n * 13)

function ReadPage({ n, title, s }) {
  const words = s.text.join(' ').split(/\s+/).length, size = words > 170 ? '11.5pt' : words > 120 ? '12.5pt' : '13.5pt'
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.read}>
    <div style={{ flex: 'none', border: '0.6mm solid #111', borderRadius: '4mm', padding: '3mm 5mm', fontSize: size, lineHeight: 1.55 }}>
      {s.text.map((p, i) => <p key={i} style={{ margin: i ? '1.5mm 0 0' : 0 }}>{bidi(p)}</p>)}
    </div>
    <Rows count={s.questions.length}>
      {s.questions.map(([q], i) => <div key={q} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
        <b style={{ fontSize: '12.5pt' }}>{i + 1}. {bidi(q)}</b><Line />
      </div>)}
    </Rows>
  </Sheet>
}

function ChoicePage({ n, title, s, seed }) {
  const items = choiceItems(s, seed, n), fs = fit(items.length, '13pt', '12pt')
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.choice}>
    <Rows count={items.length}>
      {items.map((it, i) => <Row key={it.q} last={i === items.length - 1} style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: '1.5mm' }}>
        <b style={{ fontSize: fs }}>{i + 1}. {bidi(it.q)}</b>
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm 7mm', fontSize: fs }}>{it.opts.map((o, j) => <span key={o}>{LETTERS[j]}. {bidi(o)}</span>)}</span>
      </Row>)}
    </Rows>
  </Sheet>
}

function TrueFalsePage({ n, title, s, seed }) {
  const items = trueFalseItems(s, seed, n), fs = fit(items.length, '13pt', '12pt', 10)
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.truefalse}>
    <Rows count={items.length}>
      {items.map(([text], i) => <Row key={text} last={i === items.length - 1} style={{ gap: '3mm' }}>
        <span style={{ flex: 1, fontSize: fs, lineHeight: 1.3 }}>{i + 1}. {bidi(text)}</span>
        <Pill>נכון</Pill><Pill>לא נכון</Pill>
      </Row>)}
    </Rows>
  </Sheet>
}

function MatchPage({ n, title, s, seed }) {
  const order = matchOrder(s, seed, n), fs = fit(s.pairs.length, '12.5pt', '11.5pt')
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.match}>
    <Rows count={s.pairs.length}>
      {s.pairs.map(([term], i) => <Row key={term} last={i === s.pairs.length - 1} style={{ gap: '3mm' }}>
        <span style={{ flex: 'none', width: '50mm', display: 'flex', alignItems: 'center', gap: '3mm' }}>
          <b style={{ flex: 1, fontSize: '13pt' }}>{i + 1}. {term}</b><Box />
        </span>
        <span style={{ flex: 1, fontSize: fs, lineHeight: 1.35, borderInlineStart: '0.4mm solid #bbb', paddingInlineStart: '4mm' }}>
          <b>{LETTERS[i]}.</b> {bidi(s.pairs[order[i]][1])}
        </span>
      </Row>)}
    </Rows>
  </Sheet>
}

function FillPage({ n, title, s, seed }) {
  const fs = fit(s.items.length, '13.5pt', '12.5pt')
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.fill}>
    <Rows count={s.items.length}>
      {s.items.map(([text], i) => <Row key={text} last={i === s.items.length - 1}>
        <span style={{ fontSize: fs, lineHeight: 1.45 }}>{i + 1}. {bidi(text.replace('___', '______________'))}</span>
      </Row>)}
    </Rows>
    <Bank words={fillBank(s, seed, n)} />
  </Sheet>
}

function OrderPage({ n, title, s, seed }) {
  const shown = orderShown(s, seed, n)
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.order}>
    <Rows count={s.items.length}>
      {shown.map((k, i) => <Row key={k} last={i === shown.length - 1}>
        <Box size={11} /><span style={{ fontSize: fit(s.items.length, '13.5pt', '12.5pt'), lineHeight: 1.35 }}>{bidi(s.items[k])}</span>
      </Row>)}
    </Rows>
  </Sheet>
}

function ProblemsPage({ n, title, s }) {
  const cols = s.cols || 2, rows = Math.ceil(s.items.length / cols), fs = cols === 1 ? '15pt' : rows > 8 ? '15pt' : '17pt'
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.problems}>
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gridAutoFlow: 'row', columnGap: '8mm' }}>
      {s.items.map(([text], i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2mm', borderBottom: '0.3mm dashed #ccc', fontSize: fs, fontWeight: 600 }}>
        <span style={{ fontSize: '10pt', color: '#666', flex: 'none' }}>{i + 1})</span><bdi dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{text.includes('___') ? text.replace('___', '______') : `${text} = ______`}</bdi>
      </div>)}
    </div>
  </Sheet>
}

function WordsPage({ n, title, s }) {
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.words}>
    <Rows count={s.items.length}>
      {s.items.map(([q], i) => <div key={q} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1mm', minHeight: 0, borderBottom: i === s.items.length - 1 ? 0 : '0.3mm dashed #bbb' }}>
        <span style={{ fontSize: fit(s.items.length, '13pt', '12pt', 6), lineHeight: 1.45 }}>{i + 1}. {bidi(q)}</span>
        <span style={{ fontSize: '12pt' }}>תרגיל: ________________________ &nbsp; תשובה: ______________</span>
      </div>)}
    </Rows>
  </Sheet>
}

function OpenPage({ n, title, s }) {
  return <Sheet n={n} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.open}>
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${s.prompts.length}, 1fr)`, gap: '4mm' }}>
      {s.prompts.map((p, i) => <div key={p} style={{ border: '0.6mm solid #111', borderRadius: '4mm', padding: '3mm', fontSize: '12.5pt', lineHeight: 1.4, minHeight: 0 }}><b>{i + 1}. {bidi(p)}</b></div>)}
    </div>
  </Sheet>
}

function Section({ n, title, s, seed }) {
  const p = { n, title, s, seed }
  switch (s.type) {
    case 'read': return <ReadPage {...p} />
    case 'choice': return <ChoicePage {...p} />
    case 'truefalse': return <TrueFalsePage {...p} />
    case 'match': return <MatchPage {...p} />
    case 'fill': return <FillPage {...p} />
    case 'order': return <OrderPage {...p} />
    case 'problems': return <ProblemsPage {...p} />
    case 'words': return <WordsPage {...p} />
    case 'open': return <OpenPage {...p} />
    case 'search': return <WordSearchPage n={n} seed={seed + n} he size={s.size || 10} title={title} instruction={s.instruction || DEFAULT_INSTRUCTION.search} words={s.words.map(word => ({ word }))} />
    default: throw new Error(`unknown section type ${s.type}`)
  }
}

// The answers of one section as short strings, or null when the section has no single right answer.
export function answersOf(s, seed, n) {
  switch (s.type) {
    case 'read': return s.questions.map(q => q[1])
    case 'choice': return choiceItems(s, seed, n).map(it => `${it.letter} (${it.right})`)
    case 'truefalse': return trueFalseItems(s, seed, n).map(it => it[1] ? 'נכון' : 'לא נכון')
    case 'match': { const order = matchOrder(s, seed, n); return s.pairs.map(([term], i) => `${term} — ${LETTERS[order.indexOf(i)]}`) }
    case 'fill': return s.items.map(it => it[1])
    case 'order': return [`מלמעלה למטה: ${orderShown(s, seed, n).map(k => k + 1).join(', ')}`]
    case 'problems': case 'words': return s.items.map(it => String(it[1]))
    default: return null
  }
}

function Key({ n, pages, sections, seed }) {
  const list = sections.map((s, i) => ({ page: i + 2, title: pages[i + 1], answers: answersOf(s, seed, i + 2) })).filter(x => x.answers)
  const total = list.reduce((sum, x) => sum + x.answers.join(' ').length, 0)
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות</h2>
    <p style={{ textAlign: 'center', margin: '0 0 3mm', fontSize: '11pt' }}>עמוד {n} בחוברת · בשאלות פתוחות מופיעה תשובה אפשרית, ותשובה במילים אחרות נכונה גם היא</p>
    <div style={{ columns: total > 2200 ? 2 : 1, columnGap: '8mm', fontSize: total > 3200 ? '9.5pt' : total > 2200 ? '10pt' : '11pt', lineHeight: 1.45 }}>
      {list.map(x => <section key={x.page} style={{ breakInside: 'avoid', marginBottom: '2.5mm' }}>
        <b>עמוד {x.page} — {x.title}</b>
        <div>{x.answers.map((a, i) => <span key={i} style={{ marginInlineEnd: '4mm' }}>{x.answers.length > 1 ? `${i + 1}) ` : ''}<bdi>{a}</bdi></span>)}</div>
      </section>)}
    </div>
  </A4>
}

// The component the registry's `subject()` loader hands to the booklet page, for one content file.
export const bookletFor = data => function Booklet({ seed }) { return <SubjectBooklet pages={bookletBySlug(data.slug).pages} data={data} seed={seed} /> }

export default function SubjectBooklet({ pages, data, seed = 1 }) {
  const { sections } = data
  if (pages.length !== sections.length + 3) throw new Error(`${pages[0]}: ${pages.length} page titles for ${sections.length} sections`)
  const keyPage = sections.length + 2
  return <>
    <Cover emoji={data.emoji} title={data.title} subtitle={data.subtitle} pages={pages} note={data.note} />
    {sections.map((s, i) => <Section key={i} n={i + 2} title={pages[i + 1]} s={s} seed={seed} />)}
    <Key n={keyPage} pages={pages} sections={sections} seed={seed} />
    <Certificate booklet={data.title} done={data.done} cheer={data.cheer} />
  </>
}

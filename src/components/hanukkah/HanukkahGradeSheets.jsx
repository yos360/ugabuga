// Printable sheets of the Hanukkah-by-grade pages. Text sheets are flowing A4 pages (.buga-flow);
// the picture sheets reuse the existing Hanukkah SVG worksheets, crafts and word search.
import { CountCandles, DonutMath, TraceWords, DreidelMatch } from './HanukkahSheets'
import { HANUKKAH_CRAFTS } from './HanukkahCrafts'
import { HanukkahWordSearchSheet } from './HanukkahWordSearch'
import { hanukkahProblems, kindergartenNumbers, MATH_LEVEL } from '../../data/hanukkahGradeMath'
import { HANUKKAH_TIMELINE } from '../../data/hanukkahGrades'

const Flow = ({ title, note, children }) => <article className="buga-flow" dir="rtl">
  <h2 className="text-2xl font-black text-center">{title}</h2>
  <p className="mb-3 mt-1 flex flex-wrap justify-between gap-2 border-b border-slate-300 pb-2 text-sm"><span>שם: __________________</span><span>תאריך: ____________</span>{note && <span>{note}</span>}</p>
  {children}
</article>
const Lines = ({ n = 2 }) => Array.from({ length: n }, (_, i) => <div key={i} className="mt-5 border-b border-slate-400" />)

export function ProblemsSheet({ grade, seed, answers = false }) {
  const list = hanukkahProblems(MATH_LEVEL[grade.slug], seed, 8)
  return <Flow title={answers ? `תשובות — בעיות מילוליות של חנוכה` : `בעיות מילוליות של חנוכה`} note={grade.label}>
    {!answers && <p className="mb-2 font-bold">קראו כל שאלה, כתבו תרגיל ופתרו.</p>}
    <ol className="list-decimal space-y-3 pr-6 text-lg leading-relaxed">
      {list.map((p, i) => <li key={i}>{p.q}{answers ? <b className="block text-emerald-800">תשובה: {p.answer}</b> : <><div className="mt-4 border-b border-dashed border-slate-400" /><span className="mt-1 block text-sm">תשובה: ______________</span></>}</li>)}
    </ol>
  </Flow>
}

export function ReadingSheet({ grade, answers = false }) {
  const r = grade.reading, young = grade.slug === 'kindergarten'
  if (answers) return <Flow title={`תשובות — ${r.title}`} note={grade.label}>
    <ol className="list-decimal space-y-2 pr-6">
      {r.q.map(([q, opts, c]) => <li key={q}>{q} <b>{opts[c]}</b></li>)}
      {r.open.map(([q, a]) => <li key={q}>{q}<br /><i>תשובה אפשרית: {a}</i></li>)}
    </ol>
  </Flow>
  return <Flow title={`${r.emoji} ${r.title}`} note={`${r.kind} · ${grade.label}`}>
    <div className={`space-y-2 leading-relaxed ${young ? 'text-xl' : 'text-lg'}`}>{r.text.map((p, i) => <p key={i}>{p}</p>)}</div>
    <h3 className="mt-4 text-xl font-bold">{young ? 'שאלות לשיחה' : 'שאלות'}</h3>
    <ol className="list-decimal space-y-2 pr-6">
      {r.q.map(([q, opts]) => <li key={q}><b>{q}</b><ul className="mt-1 grid grid-cols-2 gap-x-4">{opts.map(o => <li key={o}>☐ {o}</li>)}</ul></li>)}
      {r.open.map(([q]) => <li key={q}><b>{q}</b>{!young && <Lines n={grade.slug === 'grade-1' ? 1 : 2} />}</li>)}
    </ol>
    {young && <div className="mt-4 flex h-56 items-end justify-center rounded-2xl border-2 border-dashed border-slate-400 p-2 text-sm">ציירו את הכד הקטן ואת החנוכייה של מאיה</div>}
  </Flow>
}

// 1 + 2 + … per night: the table the class fills in (row 1 is an example).
const ROWS = Array.from({ length: 8 }, (_, i) => { const n = i + 1; return [n, n + 1, n * (n + 1) / 2, n * (n + 1) / 2 + n] })
export function CandleTableSheet({ grade, answers = false }) {
  return <Flow title={answers ? 'תשובות — טבלת הנרות' : '🕯️ טבלת הנרות של חנוכה'} note={grade.label}>
    {!answers && <p className="mb-2">השורה הראשונה כבר מלאה. השלימו את הטבלה וענו על השאלות שמתחתיה.</p>}
    <table className="w-full border-collapse text-center text-base">
      <thead><tr className="bg-slate-100">{['ערב', 'נרות הערב (בלי השמש)', 'כולל השמש', 'סך הכול עד הערב הזה (בלי שמש)', 'סך הכול עד הערב הזה (כולל שמשים)'].map(h => <th key={h} className="border border-slate-500 p-1 text-sm">{h}</th>)}</tr></thead>
      <tbody>{ROWS.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} className="h-9 border border-slate-500 font-bold">{j === 0 || i === 0 || answers ? v : ''}</td>)}</tr>)}</tbody>
    </table>
    <ol className="mt-4 list-decimal space-y-3 pr-6">
      <li>כמה נרות מדליקים בכל החג, בלי השמש? {answers ? <b>36</b> : '______'}</li>
      <li>וכמה כולל השמש? {answers ? <b>44</b> : '______'}</li>
      <li>בכמה נרות גדל הסכום בכל ערב? מה אתם מגלים? {answers ? <b>בכל ערב הסכום גדל במספר הערב: 1, 2, 3… ולכן הוא 1 + 2 + … + 8.</b> : <Lines n={1} />}</li>
      <li>בקופסה יש 44 נרות. האם קופסה אחת מספיקה לחנוכייה אחת לכל החג? {answers ? <b>כן, בדיוק — 36 נרות ועוד 8 שמשים.</b> : <Lines n={1} />}</li>
    </ol>
  </Flow>
}

// Fixed shuffled order for the timeline sheet (index into HANUKKAH_TIMELINE).
const TIMELINE_ORDER = [3, 6, 0, 4, 2, 5, 1]
export function TimelineSheet({ grade, answers = false }) {
  if (answers) return <Flow title="תשובות — ציר הזמן" note={grade.label}>
    <ol className="list-decimal space-y-2 pr-6 text-lg">{HANUKKAH_TIMELINE.map(e => <li key={e.text}>{e.text} <b>({e.year} לפני הספירה)</b></li>)}</ol>
  </Flow>
  return <Flow title="⏳ ציר הזמן של חנוכה" note={grade.label}>
    <p className="mb-3">מספרו את האירועים לפי הסדר שבו קרו, מ־1 (הראשון) עד 7 (האחרון).</p>
    <ul className="space-y-3 text-lg">{TIMELINE_ORDER.map(i => <li key={i} className="flex items-center gap-3"><span className="inline-block h-10 w-10 shrink-0 rounded-lg border-2 border-slate-600" />{HANUKKAH_TIMELINE[i].text}</li>)}</ul>
    <div className="mt-5 font-bold">אתגר: אירוע אחד קרה 101 שנים אחרי חנוכת המקדש. איזה? <Lines n={1} /></div>
  </Flow>
}

export function ThinkSheet({ grade }) {
  return <Flow title="💭 שאלות לחשיבה ולדיון" note={grade.label}>
    <ol className="list-decimal space-y-4 pr-6 text-lg">{grade.think.map(q => <li key={q}><b>{q}</b><Lines n={3} /></li>)}</ol>
  </Flow>
}

const craft = id => HANUKKAH_CRAFTS.find(c => c.id === id)
const svg = (id, name, C) => ({ id, name, svg: true, C })

// The printable set for a grade, in page order; `seed` drives the generated sheets.
// Each item: { id, name, svg?, C } — svg items are A4 drawings, the others render their own pages.
export function gradeSet(grade, seed = 1) {
  const k = kindergartenNumbers(seed)
  const ws = grade.wordSearch && { name: grade.label, ...grade.wordSearch }
  const make = {
    'count-candles': () => [svg('count-candles', 'כמה נרות דולקים?', () => <CountCandles nights={k.nights} />)],
    'donut-math': () => [svg('donut-math', 'חשבון סופגניות', () => <DonutMath items={k.items} />)],
    'dreidel-match': () => [svg('dreidel-match', 'נס גדול היה פה — התאמה', DreidelMatch)],
    trace: () => [svg('trace', 'מילים של חנוכה — מעקב', TraceWords)],
    problems: () => [{ id: 'problems', name: 'בעיות מילוליות + תשובות', emoji: '🧮', C: () => <><ProblemsSheet grade={grade} seed={seed} /><ProblemsSheet grade={grade} seed={seed} answers /></> }],
    reading: () => [{ id: 'reading', name: grade.slug === 'kindergarten' ? 'סיפור להקראה ושאלות לשיחה' : 'קטע קריאה + תשובות', emoji: '📖', C: () => <><ReadingSheet grade={grade} />{grade.reading.q.length > 0 && <ReadingSheet grade={grade} answers />}</> }],
    wordsearch: () => [svg('wordsearch', 'תפזורת חנוכה', () => <HanukkahWordSearchSheet level={ws} />), svg('wordsearch-answers', 'פתרון התפזורת', () => <HanukkahWordSearchSheet level={ws} answers />)],
    'candle-table': () => [{ id: 'candle-table', name: 'טבלת הנרות + תשובות', emoji: '🕯️', C: () => <><CandleTableSheet grade={grade} /><CandleTableSheet grade={grade} answers /></> }],
    timeline: () => [{ id: 'timeline', name: 'ציר זמן + תשובות', emoji: '⏳', C: () => <><TimelineSheet grade={grade} /><TimelineSheet grade={grade} answers /></> }],
    think: () => [{ id: 'think', name: 'שאלות לחשיבה ולדיון', emoji: '💭', C: () => <ThinkSheet grade={grade} /> }],
  }
  return grade.sheets.flatMap(id => make[id] ? make[id]() : craft(id) ? [svg(id, craft(id).name, craft(id).C)] : [])
}

// One printable item as PrintPreview children.
export const PrintItem = ({ item }) => item.svg ? <article className="buga-a4"><div className="print-art"><item.C /></div></article> : <item.C />

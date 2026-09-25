import { useState } from 'react'
import PrintPreview from './PrintPreview'
import { LatinTrace, ColorText, Heading, Lines, letterH } from './HebrewTracing'

// Numbers and arithmetic in the same dashed single-stroke style as the letters.
// Maths is written left-to-right, also on Hebrew sheets.
const NUMBERS = Array.from({ length: 11 }, (_, i) => String(i))

function Dots({ n, y }) {
  if (!n) return <text x="300" y={y + 10} fontSize="20">אפס — אין מה לצבוע</text>
  const perRow = 5, r = 17, gap = 50
  return <g fill="white" stroke="#111" strokeWidth="2.5">
    {Array.from({ length: n }, (_, i) => {
      const row = Math.floor(i / perRow), col = i % perRow, inRow = Math.min(perRow, n - row * perRow)
      return <circle key={i} cx={300 - (inRow - 1) * gap / 2 + col * gap} cy={y + row * 48} r={r} />
    })}
  </g>
}

export function NumberSheet({ n }) {
  const cap = letterH(n, 64, false)
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול המספר ${n}`} style={{ width: '100%', height: '100%', background: 'white' }}>
    <g fill="#111" fontFamily="Heebo, Arial, sans-serif" textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">המספר {n}</text>
      <text x="300" y="66" fontSize="15">שם: ____________    תאריך: ____________</text>
      <Heading y={104}>עוברים על הקווים</Heading>
      <Lines y={300} h={letterH(n, 170, false)} />
      <LatinTrace text={n} x={300} y={300} cap={letterH(n, 170, false)} color="#444" />
      <Lines y={400} h={cap} />
      {[100, 200, 300, 400, 500].map(x => <LatinTrace key={x} text={n} x={x} y={400} cap={cap} color="#444" />)}
      <Lines y={480} h={cap} />
      <Heading y={540}>סופרים וצובעים {n} עיגולים</Heading>
      <Dots n={+n} y={585} />
      <ColorText text={n} x={300} y={790} size={110} heb={false} />
    </g>
  </svg>
}

// A sheet of exercises: every exercise is dashed for tracing; with answers
// hidden the child writes the result on the line after the "=".
const PER_SHEET = 8
export function ExerciseSheet({ items, title }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
    <g fill="#111" fontFamily="Heebo, Arial, sans-serif" textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">{title}</text>
      <text x="300" y="66" fontSize="15">שם: ____________    תאריך: ____________</text>
      <Heading y={100}>עוברים על הקווים ופותרים</Heading>
      {items.map((t, i) => {
        const y = 175 + i * 82, cap = Math.min(46, letterH(t, 46, false))
        return <g key={i}><Lines y={y} h={cap} /><LatinTrace text={t} x={300} y={y} cap={cap} color="#444" solidOps /></g>
      })}
    </g>
  </svg>
}

const norm = s => s.replace(/[×*]/g, 'x').replace(/[÷/]/g, ':').replace(/[^0-9+\-=x:() ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16)
const rnd = n => Math.floor(Math.random() * (n + 1))
const KINDS = {
  add10: { label: 'חיבור עד 10', make: () => { const a = rnd(10), b = rnd(10 - a); return [`${a}+${b}=`, a + b] } },
  add20: { label: 'חיבור עד 20', make: () => { const a = rnd(20), b = rnd(20 - a); return [`${a}+${b}=`, a + b] } },
  sub10: { label: 'חיסור עד 10', make: () => { const a = rnd(10), b = rnd(a); return [`${a}-${b}=`, a - b] } },
  sub20: { label: 'חיסור עד 20', make: () => { const a = rnd(20), b = rnd(a); return [`${a}-${b}=`, a - b] } },
  mix10: { label: 'חיבור וחיסור עד 10', make: () => (Math.random() < .5 ? KINDS.add10 : KINDS.sub10).make() },
  mul: { label: 'לוח הכפל', make: () => { const a = 1 + rnd(9), b = 1 + rnd(9); return [`${a}x${b}=`, a * b] } },
}

function Exercises() {
  const [text, setText] = useState('3+4=7\n5+2=\n8-3=\n10-6=')
  const [kind, setKind] = useState('add10'), [answers, setAnswers] = useState(false), [print, setPrint] = useState(null)
  const list = text.split('\n').map(norm).filter(Boolean)
  const generate = () => setText(Array.from({ length: 16 }, () => { const [q, a] = KINDS[kind].make(); return answers ? q + a : q }).join('\n'))
  const sheets = []; for (let i = 0; i < list.length; i += PER_SHEET) sheets.push(list.slice(i, i + PER_SHEET))
  return <div id="exercises" className="mb-10 scroll-mt-4 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-sm">
    <h2 className="mb-2 text-2xl font-bold">➕ תרגילים בקווים מקווקווים</h2>
    <p className="mb-3">כותבים תרגיל בכל שורה (למשל <bdi dir="ltr">3+4=</bdi>), או יוצרים תרגילים אוטומטית. כל תרגיל מודפס בקווים מקווקווים למעבר בעיפרון — 8 תרגילים בדף.</p>
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <select value={kind} onChange={e => setKind(e.target.value)} aria-label="סוג התרגילים" className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3">{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} className="h-5 w-5" />כולל התשובה (גם היא מקווקוות)</label>
      <button onClick={generate} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">🎲 צרו 16 תרגילים</button>
    </div>
    <textarea value={text} onChange={e => setText(e.target.value)} rows={6} dir="ltr" className="mb-3 w-full rounded-xl border-2 border-[var(--border)] bg-white p-3 text-lg" aria-label="תרגילים, תרגיל בכל שורה" />
    <p className="mb-3 text-sm text-slate-600">אפשר להשתמש ב־ + − × : = וסוגריים. בלי תשובה אחרי ה־= — הילד כותב אותה בעצמו.</p>
    <button disabled={!list.length} onClick={() => setPrint(sheets)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white disabled:opacity-50">🖨️ הדפיסו {list.length} תרגילים ({sheets.length} {sheets.length === 1 ? 'דף' : 'דפים'})</button>
    {print && <PrintPreview title="תרגילים בקווים מקווקווים" onClose={() => setPrint(null)}>{print.map((items, i) => <article className="buga-a4" key={i}><div className="print-art"><ExerciseSheet items={items} title="תרגילים בחשבון" /></div></article>)}</PrintPreview>}
  </div>
}

export default function NumberTracing() {
  const [selection, setSelection] = useState(null)
  return <section dir="rtl">
    <div className="mb-6 flex flex-wrap justify-center gap-3">
      <button onClick={() => setSelection(NUMBERS)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white">הדפיסו את כל 11 המספרים</button>
      <a href="#exercises" className="flex min-h-[44px] items-center rounded-xl border-2 border-slate-800 bg-white px-5 font-bold">➕ לתרגילים בקווים מקווקווים</a>
    </div>
    <Exercises />
    <p className="mb-5 text-center">שחור־לבן בלבד · כל מספר בדף A4 נפרד · מעבר בעיפרון, תרגול, ספירה וצביעה</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{NUMBERS.map(n => <button key={n} onClick={() => setSelection([n])} aria-label={`פתחו והדפיסו את המספר ${n}`} className="rounded-2xl border-2 bg-white p-3 shadow-sm focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="aspect-[210/297]"><NumberSheet n={n} /></div><strong className="block py-2">המספר {n} · פתיחה והדפסה</strong></button>)}</div>
    {selection && <PrintPreview title={selection.length === 1 ? `תרגול המספר ${selection[0]}` : 'כל המספרים 0–10'} onClose={() => setSelection(null)}>{selection.map(n => <article className="buga-a4" key={n}><div className="print-art"><NumberSheet n={n} /></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}</PrintPreview>}
  </section>
}

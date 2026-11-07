import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// Worksheet maker: the teacher types this week's words (with an optional emoji) and picks tasks —
// tracing, copy lines, missing letter, scrambled letters, word ↔ picture — plus an answer key.
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const TO_FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' }
const plain = ch => FINAL[ch] || ch
const EMOJI = /(\p{Extended_Pictographic}[\p{Extended_Pictographic}‍️]*)/u
export function parseWords(text) {
  return text.split(/\n|,/).map(l => l.trim()).filter(Boolean).slice(0, 10).map(l => {
    const m = l.match(EMOJI)
    return { w: l.replace(EMOJI, '').replace(/\s+/g, ' ').trim(), e: m ? m[1] : '' }
  }).filter(x => x.w)
}
const seedOf = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
function shuffleWord(w, seed) {
  const letters = [...w.replace(/\s/g, '')].map(plain)
  let s = seed || 1, out = letters
  for (let tries = 0; tries < 8; tries++) {
    out = [...letters]
    for (let i = out.length - 1; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i + 1); [out[i], out[j]] = [out[j], out[i]] }
    if (out.join('') !== letters.join('') || letters.length < 2) break
  }
  return out
}
export function missingIndex(w, seed) {
  const idx = [...w].map((c, i) => (c.trim() ? i : -1)).filter(i => i > 0)
  return idx.length ? idx[seed % idx.length] : 0
}

const TASKS = [
  ['trace', '✏️ מילים מקווקוות'], ['copy', '📝 העתקה'], ['missing', '❓ אות חסרה'], ['scramble', '🔀 אותיות מבולבלות'], ['match', '🖼️ מילה ותמונה'],
]
function Header({ title, task, sub }) {
  return <>
    <T x={100} y={16} size={10} weight={900}>{title}</T>
    <T x={100} y={26} size={7.5} weight={700}>{task}</T>
    <T x={100} y={34} size={5.5} fill="#555">שם: ______________   תאריך: __________</T>
    {sub && <T x={100} y={42} size={5.5} fill="#444">{sub}</T>}
    <line x1="12" x2="188" y1="46" y2="46" stroke="#999" strokeWidth="0.4" strokeDasharray="2 1.5" />
  </>
}
function TaskSheet({ kind, words, title }) {
  const rowH = Math.min(26, 214 / Math.max(1, words.length))
  const rows = (fn) => words.map((x, i) => fn(x, i, 52 + i * rowH + rowH * 0.6))
  if (kind === 'trace') return <Sheet label={`מילים מקווקוות: ${words.map(x => x.w).join(', ')}`}><Header title={title} task="✏️ עוברים בעיפרון על המילים ומעתיקים בשורה" />
    {rows((x, i, y) => <g key={i}>{x.e && <text x="186" y={y - rowH * 0.2} fontSize={rowH * 0.5} textAnchor="middle" dominantBaseline="central">{x.e}</text>}
      <T x={x.e ? 174 : 186} y={y} size={rowH * 0.62} anchor="start" fill="none" stroke="#444" strokeWidth="0.35" strokeDasharray="1.2 1">{x.w}</T>
      <line x1="12" x2="88" y1={y + 1} y2={y + 1} stroke="#aaa" strokeWidth="0.4" /></g>)}
  </Sheet>
  if (kind === 'copy') return <Sheet label={`העתקת מילים: ${words.map(x => x.w).join(', ')}`}><Header title={title} task="📝 קוראים את המילה וכותבים אותה פעמיים" />
    {rows((x, i, y) => <g key={i}>{x.e && <text x="188" y={y - rowH * 0.2} fontSize={rowH * 0.45} textAnchor="middle" dominantBaseline="central">{x.e}</text>}
      <T x={x.e ? 178 : 188} y={y} size={rowH * 0.45} anchor="start" weight={800}>{x.w}</T>
      <line x1="72" x2="125" y1={y + 1} y2={y + 1} stroke="#999" strokeWidth="0.4" /><line x1="12" x2="65" y1={y + 1} y2={y + 1} stroke="#999" strokeWidth="0.4" /></g>)}
  </Sheet>
  if (kind === 'missing') return <Sheet label={`השלמת אות חסרה: ${words.map(x => x.w).join(', ')}`}><Header title={title} task="❓ איזו אות חסרה? כותבים אותה במשבצת" />
    {rows((x, i, y) => { const k = missingIndex(x.w, seedOf(x.w)), chars = [...x.w]; return <g key={i}>{x.e && <text x="186" y={y - rowH * 0.2} fontSize={rowH * 0.5} textAnchor="middle" dominantBaseline="central">{x.e}</text>}
      <T x={x.e ? 172 : 186} y={y} size={rowH * 0.55} anchor="start" weight={800}>{chars.map((c, j) => j === k ? <tspan key={j} fill="#bbb">▢</tspan> : <tspan key={j}>{c}</tspan>)}</T></g> })}
  </Sheet>
  if (kind === 'scramble') return <Sheet label={`אותיות מבולבלות: ${words.map(x => x.w).join(', ')}`}><Header title={title} task="🔀 מסדרים את האותיות וכותבים את המילה" sub="שימו לב: בסוף מילה כותבים אות סופית (ם, ן, ץ, ף, ך)" />
    {rows((x, i, y) => <g key={i}>{x.e && <text x="188" y={y - rowH * 0.2} fontSize={rowH * 0.45} textAnchor="middle" dominantBaseline="central">{x.e}</text>}
      <T x={x.e ? 176 : 188} y={y} size={rowH * 0.48} anchor="start" weight={800} letterSpacing="2">{shuffleWord(x.w, seedOf(x.w)).join(' ')}</T>
      <line x1="12" x2="80" y1={y + 1} y2={y + 1} stroke="#999" strokeWidth="0.4" /></g>)}
  </Sheet>
  // match: words on the right, pictures shuffled on the left
  const withPic = words.filter(x => x.e)
  const order = [...withPic].sort((a, b) => seedOf(a.w) % 97 - seedOf(b.w) % 97)
  const rh = Math.min(26, 214 / Math.max(1, withPic.length))
  return <Sheet label={`מתאימים מילה לתמונה: ${withPic.map(x => x.w).join(', ')}`}><Header title={title} task="🖼️ מותחים קו בין כל מילה לתמונה שלה" />
    {withPic.map((x, i) => <g key={i}><T x={186} y={52 + i * rh + rh * 0.6} size={rh * 0.42} anchor="start" weight={800}>{x.w}</T><circle cx="128" cy={52 + i * rh + rh * 0.45} r="1.4" fill="#222" /></g>)}
    {order.map((x, i) => <g key={i}><circle cx="72" cy={52 + i * rh + rh * 0.45} r="1.4" fill="#222" /><text x="40" y={52 + i * rh + rh * 0.45} fontSize={rh * 0.6} textAnchor="middle" dominantBaseline="central">{x.e}</text></g>)}
  </Sheet>
}
function AnswerKey({ words, tasks, title }) {
  return <Sheet label="דף תשובות">
    <T x={100} y={18} size={10} weight={900}>דף תשובות — {title}</T>
    {tasks.includes('missing') && <T x={188} y={34} size={6.5} anchor="start" weight={800}>אות חסרה:</T>}
    {tasks.includes('missing') && words.map((x, i) => <T key={'m' + i} x={188 - (i % 2) * 90} y={44 + Math.floor(i / 2) * 9} size={6} anchor="start">{x.w} — {[...x.w][missingIndex(x.w, seedOf(x.w))]}</T>)}
    {tasks.includes('scramble') && <T x={188} y={104} size={6.5} anchor="start" weight={800}>אותיות מבולבלות:</T>}
    {tasks.includes('scramble') && words.map((x, i) => <T key={'s' + i} x={188 - (i % 2) * 90} y={114 + Math.floor(i / 2) * 9} size={6} anchor="start">{shuffleWord(x.w, seedOf(x.w)).join('')} ← {x.w}</T>)}
  </Sheet>
}

const SAMPLE = 'שמש ☀️\nבית 🏠\nכלב 🐶\nפרח 🌸\nדג 🐟\nתפוח 🍎'
export default function WorksheetMaker() {
  const [text, setText] = useState(SAMPLE)
  const [title, setTitle] = useState('המילים של השבוע')
  const [tasks, setTasks] = useState(['trace', 'missing', 'scramble', 'match'])
  const [key, setKey] = useState('yes')
  const words = parseWords(text)
  const hasPics = words.filter(x => x.e).length >= 2
  const active = TASKS.map(t => t[0]).filter(t => tasks.includes(t) && (t !== 'match' || hasPics))
  const toggle = t => setTasks(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t])
  const pages = words.length ? [
    ...active.map(k => ({ key: k + text + title, svg: <TaskSheet kind={k} words={words} title={title} /> })),
    ...(key === 'yes' && (active.includes('missing') || active.includes('scramble')) ? [{ key: 'ans' + text + active, svg: <AnswerKey words={words} tasks={active} title={title} /> }] : []),
  ] : []
  const controls = <div className="space-y-4">
    <Field label="כותרת הדף" value={title} onChange={setTitle} maxLength={40} />
    <label className="block text-center font-bold">המילים — מילה בכל שורה (עד 10). אפשר להוסיף אימוג׳י אחרי המילה
      <textarea value={text} onChange={e => setText(e.target.value)} rows={7} maxLength={300} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
    </label>
    <div><p className="mb-2 text-center font-bold">אילו משימות?</p>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="משימות">{TASKS.map(([t, l]) => <button key={t} type="button" aria-pressed={tasks.includes(t)} onClick={() => toggle(t)} disabled={t === 'match' && !hasPics}
        className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-3 py-1.5 font-bold disabled:opacity-40 ${tasks.includes(t) ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{tasks.includes(t) ? '✓ ' : ''}{l}</button>)}</div>
      {!hasPics && <p className="mt-2 text-center text-sm">למשימת "מילה ותמונה" צריך אימוג׳י ליד שתי מילים לפחות.</p>}
    </div>
    <div><p className="mb-2 text-center font-bold">דף תשובות</p><Choice label="דף תשובות" value={key} onChange={setKey} options={[['yes', 'כן'], ['no', 'בלי']]} /></div>
    <p className="text-center text-sm font-bold" aria-live="polite">{words.length ? `${words.length} מילים · ${pages.length} דפי A4` : 'כתבו לפחות מילה אחת.'}</p>
  </div>
  return <PrintableShell path="/tools/worksheet-maker" emoji="🧾" h1="מחולל דפי עבודה במילים"
    seoTitle="מחולל דפי עבודה בעברית — מקלידים מילים ומדפיסים | חינם"
    description="מחולל דפי עבודה בחינם: מקלידים את המילים של השבוע ומקבלים דפי מילים מקווקוות, העתקה, אות חסרה, אותיות מבולבלות והתאמת מילה לתמונה — עם דף תשובות. לגן, לכיתה א׳–ב׳ ולשיעורי בית."
    sub="מקלידים את המילים של השבוע — ומקבלים חמישה סוגי דפים ודף תשובות"
    controls={controls} pages={pages.length ? pages : [{ key: 'empty', svg: <Sheet label="דף ריק"><T x={100} y={130} size={8} fill="#888">כתבו מילים כדי ליצור דף</T></Sheet> }]}
    printTitle={title || 'דף עבודה'} previewAll
    paragraphs={[
      'המחולל בונה דפי עבודה מהמילים שלכם — המילים של השבוע, מילים מסיפור שקראתם בכיתה, או שמות הילדים בגן. כותבים מילה בכל שורה, ואם רוצים מוסיפים אחריה אימוג׳י. האימוג׳י משמש כתמונה בדפים, ומאפשר גם משימה של התאמת מילה לתמונה.',
      'יש חמישה סוגי משימות: מילים מקווקוות לעקיבה בעיפרון, העתקה פעמיים, אות חסרה, אותיות מבולבלות שצריך לסדר, ומתיחת קו בין מילה לתמונה. בסוף מצורף דף תשובות לאות החסרה ולאותיות המבולבלות. אותיות סופיות הופכות לרגילות כשמבלבלים אותן, כדי שלא יסגירו את סוף המילה.',
    ]}
    faq={[
      { q: 'אפשר להשתמש במילים עם ניקוד?', a: 'כן, אבל בדף "אות חסרה" עלול להיעלם סימן ניקוד יחד עם האות. למשימות של אותיות מבולבלות ואות חסרה עדיף לכתוב בלי ניקוד.' },
      { q: 'איך מוסיפים תמונה למילה?', a: 'כותבים אימוג׳י אחרי המילה באותה שורה — למשל "כלב 🐶". בטלפון פותחים את מקלדת האימוג׳ים, ובמחשב אפשר להעתיק ממקלדת האימוג׳ים שלנו.' },
      { q: 'האם הדפים נשמרים?', a: 'לא. שום דבר לא נשלח לשרת — הדף נבנה בדפדפן שלכם. אפשר לשמור כ־PDF מחלון ההדפסה.' },
    ]}
    related={[{ label: 'מחולל תשבצים', href: '/tools/crossword-maker' }, { label: 'מחולל תפזורת', href: '/tools/word-search-maker' }, { label: 'מחולל בינגו', href: '/tools/bingo-maker' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'מקלדת אימוג׳ים', href: '/tools/emoji' }]}
    body={<p className="mx-auto max-w-3xl text-center">צריכים תפזורת או תשבץ מאותן מילים? <Link to="/tools/word-search-maker" className="font-bold underline">מחולל התפזורת</Link> ו<Link to="/tools/crossword-maker" className="font-bold underline">מחולל התשבצים</Link> מקבלים את אותה רשימה.</p>} />
}
export { TO_FINAL }

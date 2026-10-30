import { A4 } from '../../booklets/kit'

// The weekly workbook (חוברת עבודה לפרשת השבוע) for teachers, built from the portion's summary and
// questions (src/data/parasha/*.js) and its workbook data (src/data/parasha/workbook-<book>.js:
// events, characters, concepts, true/false, value, verse, easy questions, drawing prompt).
// Two levels: 'regular', and 'easy' for struggling pupils and special education — bigger text,
// fewer items, circling instead of writing. Printed through PrintPreview (one portion or the whole year).
const LETTERS = ['א', 'ב', 'ג']
// Deterministic shuffle so the printed order is the same every time.
const shuffled = (list, seed) => list.map((x, i) => [x, Math.sin(seed * 997 + i * 131) * 10000 % 1]).sort((a, b) => a[1] - b[1]).map(x => x[0])
const seedOf = slug => [...slug].reduce((n, c) => n + c.charCodeAt(0), 0)

function Sheet({ p, title, easy, children }) {
  return <A4 style={{ padding: '10mm 12mm' }}>
    <div dir="rtl" className={easy ? 'text-[19px] leading-relaxed' : 'text-[15px] leading-relaxed'}>
      <div className="mb-3 flex items-baseline justify-between border-b-2 border-amber-300 pb-1">
        <b className="text-2xl">{title}</b><span className="text-sm text-slate-500">פרשת {p.name} · שם: ____________</span>
      </div>
      {children}
    </div>
  </A4>
}
const Lines = ({ n = 2 }) => <div className="mt-1 space-y-4">{Array.from({ length: n }, (_, i) => <div key={i} className="border-b border-slate-400 pt-3" />)}</div>

export default function ParashaWorkbook({ p, w, level = 'regular' }) {
  const easy = level === 'easy', seed = seedOf(p.slug)
  const events = easy ? w.events.slice(0, 4) : w.events
  const order = shuffled(events.map((e, i) => [e, i]), seed)
  const concepts = easy ? w.concepts.slice(0, 3) : w.concepts
  const meanings = shuffled(concepts.map(c => c[1]), seed + 1)
  const tf = easy ? w.truefalse.slice(0, 4) : w.truefalse
  const open = easy ? [] : p.questions.slice(0, 5)
  const mc = w.easy.map(([q, right, wrong], i) => ({ q, options: shuffled([right, ...wrong], seed + i), right }))
  return <>
    <A4 style={{ padding: '14mm' }}>
      <div dir="rtl" className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-6xl" aria-hidden="true">📜</p>
        <div className="mt-4 text-[44px] font-black leading-tight">פרשת {p.name}</div>
        <p className="mt-2 text-xl">ספר {p.book} · {easy ? 'חוברת עבודה — רמה מותאמת' : 'חוברת עבודה לפרשת השבוע'}</p>
        <div className="mt-8 rounded-3xl border-4 border-amber-300 bg-amber-50 px-8 py-5 text-2xl font-bold">{w.verse.text}<p className="mt-2 text-base font-normal">({w.verse.ref})</p></div>
        <p className="mt-8 text-xl">שם: ____________________ &nbsp; כיתה: ______</p>
        <p className="mt-6 max-w-md rounded-2xl bg-slate-50 p-3"><b>הערך שלנו השבוע:</b> {w.value}</p>
      </div>
    </A4>
    <Sheet p={p} easy={easy} title="מה קורה בפרשה?">
      <div className="space-y-3">{(easy ? p.paragraphs.slice(0, 2) : p.paragraphs).map((t, i) => <p key={i}>{t}</p>)}</div>
      <div className="mt-4 grid grid-cols-2 gap-3">{w.characters.slice(0, easy ? 2 : 4).map(([name, who]) => <div key={name} className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3"><b>👤 {name}</b><br />{who}</div>)}</div>
    </Sheet>
    <Sheet p={p} easy={easy} title="מסדרים את האירועים">
      <p className="mb-3">כתבו בכל ריבוע מספר — מה קרה ראשון, שני, שלישי…</p>
      <ul className="space-y-3">{order.map(([e]) => <li key={e} className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 p-3"><span className="inline-block h-10 w-10 flex-none rounded-xl border-2 border-slate-500" />{e}</li>)}</ul>
      <h3 className="mt-6 text-xl font-black">מושגים מהפרשה — מחברים בקו</h3>
      <div className="mt-2 grid grid-cols-2 gap-x-10 gap-y-3">
        {concepts.map(([term], i) => [<b key={`t${i}`} className="rounded-xl bg-amber-50 p-2">● {term}</b>, <span key={`m${i}`} className="rounded-xl bg-slate-50 p-2">● {meanings[i]}</span>])}
      </div>
    </Sheet>
    <Sheet p={p} easy={easy} title={easy ? 'מקיפים את התשובה הנכונה' : 'נכון או לא נכון? ושאלות הבנה'}>
      {easy
        ? <ol className="space-y-4">{mc.map((x, i) => <li key={i}><b>{i + 1}. {x.q}</b><div className="mt-2 flex flex-wrap gap-3">{x.options.map((o, j) => <span key={j} className="rounded-full border-2 border-slate-300 px-4 py-1">{LETTERS[j]}. {o}</span>)}</div></li>)}</ol>
        : <ol className="space-y-2">{tf.map(([s], i) => <li key={i} className="flex items-center justify-between gap-3"><span>{i + 1}. {s}</span><span className="flex-none font-bold">נכון / לא נכון</span></li>)}</ol>}
      {easy && <>
        <h3 className="mt-6 text-xl font-black">נכון או לא נכון?</h3>
        <ol className="mt-2 space-y-3">{tf.map(([s], i) => <li key={i} className="flex items-center justify-between gap-3"><span>{s}</span><span className="flex-none text-2xl">👍 / 👎</span></li>)}</ol>
      </>}
      {open.length > 0 && <>
        <h3 className="mt-5 text-xl font-black">עונים במשפט שלם</h3>
        <ol className="mt-1">{open.map((q, i) => <li key={i} className="mt-2"><b>{i + 1}. {q.q}</b><Lines n={1} /></li>)}</ol>
      </>}
    </Sheet>
    <Sheet p={p} easy={easy} title="חושבים ומציירים">
      {!easy && <><p className="font-bold">שאלה לשיחה: {p.discussion}</p><Lines n={3} /></>}
      <p className="mt-4 font-bold">🎨 {w.draw}</p>
      <div className={`mt-2 rounded-3xl border-4 border-dashed border-amber-300 ${easy ? 'h-[150mm]' : 'h-[105mm]'}`} />
      <p className="mt-3"><b>הערך שלנו השבוע:</b> {w.value} {easy ? 'ציירו או כתבו דוגמה מהחיים שלכם:' : 'כתבו דוגמה מהחיים שלכם:'}</p>
      <Lines n={easy ? 1 : 2} />
    </Sheet>
    <Sheet p={p} easy={false} title="דף תשובות למורה">
      <p><b>סדר האירועים:</b> {events.map((e, i) => `${i + 1}. ${e}`).join(' · ')}</p>
      <p className="mt-2"><b>מושגים:</b> {concepts.map(([t, m]) => `${t} — ${m}`).join(' · ')}</p>
      <p className="mt-2"><b>נכון / לא נכון:</b> {tf.map(([, v], i) => `${i + 1}. ${v ? 'נכון' : 'לא נכון'}`).join(' · ')}</p>
      {easy && <p className="mt-2"><b>שאלות אמריקאיות:</b> {mc.map((x, i) => `${i + 1}. ${x.right}`).join(' · ')}</p>}
      {open.length > 0 && <div className="mt-2"><b>שאלות הבנה:</b><ol className="mt-1 list-decimal pr-5">{open.map((q, i) => <li key={i}>{q.a}</li>)}</ol></div>}
    </Sheet>
  </>
}

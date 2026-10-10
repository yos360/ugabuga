import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { QuizSheet } from '../../components/quiz/QuizSheet'
import { quizDb, quizMemory, quizErrorText, newToken } from '../../utils/quizDb'
import { QUIZ_BANK } from '../../data/barMitzvah'
import { buildCelebrantQuiz, pickDistractors, numberDistractors, fillName } from '../../utils/barMitzvah'
import { crumbs, SpokeNav, GenderChips, inputCls, store } from './shared'

const PATH = '/bar-mitzvah/quiz'
const KEY = 'buga-mitzvah-quiz'
const LETTERS = ['א', 'ב', 'ג', 'ד']
const DEFAULT_ON = ['food', 'hobby', 'subject', 'dream', 'travel', 'siblings', 'saying', 'first']

const FAQ = [
  { q: 'איך עושים חידון על החתן או הכלה בבר מצווה?', a: 'ההורים או האחים ממלאים את התשובות הנכונות — המאכל האהוב, החלום, המשפט שהכי שומעים בבית — והאתר מציע תשובות שגויות משעשעות. אחר כך בוחרים: משחק על המסך הגדול, חידון בטלפונים של האורחים או דף מודפס על השולחנות.' },
  { q: 'איך האורחים עונים מהטלפון?', a: 'לוחצים על "חידון בטלפונים", ומקבלים קישור וקוד QR. מציגים את הקוד על המסך או שולחים את הקישור בקבוצת הוואטסאפ, וכל אורח עונה מהטלפון שלו. בעמוד הניהול רואים מי ענה ומי צדק הכי הרבה — ואפשר להכריז על הזוכה.' },
  { q: 'כמה שאלות כדאי לשים בחידון?', a: 'בין 8 ל־12. חידון קצר שומר על האנרגיה ברחבה, ומשאיר זמן לצחוק על התשובות. אפשר להוסיף שאלות משלכם — הן בדרך כלל המצחיקות ביותר.' },
  { q: 'החידון מתאים גם לבת מצווה?', a: 'כן. בוחרים "בת מצווה" והשאלות והתשובות מתאימות את עצמן. החידון מתאים גם למסיבת כיתה, לערב משפחתי או ליום הולדת רגיל.' },
]

const RELATED = [
  { label: 'מזכרות לבר מצווה', href: '/bar-mitzvah/souvenir' },
  { label: 'מבחן אמריקאי אונליין', href: '/classroom/quiz' },
  { label: 'רעיונות לבר מצווה', href: '/ideas/bar-mitzvah-ideas' },
]

const initialItems = () => QUIZ_BANK.map(b => ({ id: b.id, on: DEFAULT_ON.includes(b.id), correct: '', wrong: null, seed: 1 }))
const newCustom = () => ({ id: 'c' + Math.random().toString(36).slice(2, 8), custom: true, on: true, q: '', correct: '', wrong: ['', ''], seed: 1 })

// Suggested wrong answers until the family types their own.
function autoWrong(item, bank, boy) {
  if (item.wrong) return item.wrong
  if (!bank || !item.correct.trim()) return ['', '']
  const pool = bank.number ? [] : bank.pool.map(x => fillName(x, '', boy))
  const got = bank.number ? numberDistractors(item.correct, 2) : pickDistractors(pool, item.correct, 2, item.seed)
  return [got[0] || '', got[1] || '']
}

function HostMode({ questions, title, onClose }) {
  const [i, setI] = useState(0), [shown, setShown] = useState(false)
  const q = questions[i]
  useEffect(() => { const k = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 overflow-auto bg-[#1d1640] p-4 text-white sm:p-8" dir="rtl">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-lg font-bold opacity-80">{title}</p>
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl bg-white/15 px-4 font-bold">✕ סגירה</button>
        </div>
        {q ? <>
          <p className="m-0 mt-6 text-center text-xl font-bold opacity-80">שאלה {i + 1} מתוך {questions.length}</p>
          <h2 className="m-0 mt-3 text-center text-3xl font-black leading-snug sm:text-5xl">{q.q}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {q.options.map((o, m) => (
              <div key={m} className={`rounded-2xl border-4 p-4 text-2xl font-bold sm:text-3xl ${shown ? (m === q.correct ? 'border-[#7dd87a] bg-[#7dd87a] text-[#1d1640]' : 'border-white/20 opacity-40') : 'border-white/40 bg-white/10'}`}>
                <span className="ml-2 opacity-70">{LETTERS[m]}.</span>{o}
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap justify-center gap-3 pt-8">
            {i > 0 && <button type="button" className="ln-btn alt text-[#1d1640]" onClick={() => { setI(i - 1); setShown(false) }}>→ הקודמת</button>}
            {!shown ? <button type="button" className="ln-btn text-[#1d1640]" onClick={() => setShown(true)}>חשיפת התשובה 👀</button>
              : <button type="button" className="ln-btn go text-[#1d1640]" onClick={() => { setI(i + 1); setShown(false) }}>{i + 1 < questions.length ? 'לשאלה הבאה ←' : 'סיום 🎉'}</button>}
          </div>
        </> : <div className="my-auto text-center">
          <p className="text-6xl" aria-hidden="true">🎉</p>
          <h2 className="text-4xl font-black">זהו, נגמר החידון!</h2>
          <p className="text-xl">מי ענה נכון על הכי הרבה שאלות? מחיאות כפיים!</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="ln-btn text-[#1d1640]" onClick={() => setI(0)}>🔁 מההתחלה</button>
            <button type="button" className="ln-btn alt text-[#1d1640]" onClick={onClose}>סגירה</button>
          </div>
        </div>}
      </div>
    </div>
  )
}

export default function MitzvahQuiz() {
  const nav = useNavigate()
  const saved = store.get(KEY, null)
  const [name, setName] = useState(saved?.name || '')
  const [gender, setGender] = useState(saved?.gender || 'boy')
  const [items, setItems] = useState(() => {
    const base = initialItems()
    if (!saved?.items) return base
    const byId = Object.fromEntries(saved.items.map(x => [x.id, x]))
    return [...base.map(b => byId[b.id] ? { ...b, ...byId[b.id] } : b), ...saved.items.filter(x => x.custom)]
  })
  const [mode, setMode] = useState(null) // 'host' | 'print'
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  useEffect(() => { store.set(KEY, { name, gender, items }) }, [name, gender, items])

  const boy = gender !== 'girl'
  const bankOf = id => QUIZ_BANK.find(b => b.id === id)
  const upd = (id, patch) => setItems(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x))
  const resolved = items.filter(x => x.on).map(x => ({ id: x.id, q: x.custom ? x.q : bankOf(x.id).q, correct: x.correct, wrong: autoWrong(x, bankOf(x.id), boy) }))
  const questions = buildCelebrantQuiz({ name, gender, items: resolved.filter(x => x.q.trim()) })
  const title = `החידון של ${name.trim() || (boy ? 'חתן בר המצווה' : 'כלת בת המצווה')}`
  const quiz = { title, settings: { showScore: true, shuffle: false, minutes: 0, dir: 'rtl' }, questions }
  const missing = items.filter(x => x.on).length - questions.length

  const online = async () => {
    setBusy(true); setErr('')
    try {
      const token = newToken()
      const code = await quizDb.create(token, title, questions, quiz.settings, [])
      quizMemory.remember(code, token, title)
      nav(`/classroom/quiz/${code}`)
    } catch (e) { setErr(quizErrorText(e.code)) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="חידון לבר מצווה על החוגג — לאורחים, בטלפון או מודפס" description="חידון לבר מצווה ולבת מצווה על החוגג או החוגגת: ממלאים תשובות, מקבלים שאלות עם תשובות שגויות משעשעות, ומשחקים על המסך, בטלפונים של האורחים או על דף מודפס." path={PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs('חידון על החוגג')} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">❓ </span>חידון לבר מצווה על החוגג</h1>
      <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">חידון לבר מצווה או לבת מצווה שבו האורחים בודקים כמה הם באמת מכירים את החוגג או החוגגת. ממלאים את התשובות הנכונות, האתר מציע תשובות שגויות — ומשחקים על המסך, בטלפונים או על דף.</p>

      <section className="ln-box mb-5 space-y-3" aria-label="פרטי החוגג/ת">
        <label className="block max-w-sm font-bold">שם החוגג/ת<input value={name} onChange={e => setName(e.target.value)} maxLength={30} className={inputCls} autoComplete="off" /></label>
        <GenderChips gender={gender} setGender={setGender} />
      </section>

      <h2 className="mb-3 text-2xl font-bold">השאלות</h2>
      <p className="mb-4 text-[var(--muted-foreground)]">מסמנים אילו שאלות להכניס וכותבים את התשובה הנכונה. התשובות השגויות מוצעות אוטומטית — אפשר להחליף אותן (🎲) או לכתוב משלכם.</p>
      <ul className="m-0 list-none space-y-3 p-0">
        {items.map(x => {
          const bank = bankOf(x.id)
          const wrong = autoWrong(x, bank, boy)
          const q = x.custom ? x.q : fillName(bank.q, name, boy)
          return (
            <li key={x.id} className={`rounded-2xl border-2 p-3 ${x.on ? 'border-[var(--border)] bg-[var(--card)]' : 'border-dashed border-[var(--border)] opacity-70'}`}>
              <label className="flex min-h-[44px] items-center gap-3 font-bold">
                <input type="checkbox" checked={x.on} onChange={e => upd(x.id, { on: e.target.checked })} className="h-6 w-6 shrink-0 accent-violet-600" />
                {x.custom ? <input value={x.q} onChange={e => upd(x.id, { q: e.target.value })} placeholder="כתבו שאלה משלכם" aria-label="שאלה משלכם" maxLength={200} className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2" /> : <span>{q}</span>}
              </label>
              {x.on && <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-sm font-bold">✓ התשובה הנכונה
                  <input value={x.correct} onChange={e => upd(x.id, { correct: e.target.value })} list={bank && !bank.number ? `pool-${x.id}` : undefined} inputMode={bank?.number ? 'numeric' : undefined} maxLength={80} className="mt-1 block w-full rounded-xl border-2 border-green-600 bg-white px-3 py-2 text-base" />
                  {bank && !bank.number && <datalist id={`pool-${x.id}`}>{bank.pool.map(p => <option key={p} value={fillName(p, '', boy)} />)}</datalist>}
                </label>
                {[0, 1].map(k => (
                  <label key={k} className="text-sm font-bold">✗ תשובה שגויה {k + 1}
                    <input value={wrong[k]} onChange={e => upd(x.id, { wrong: wrong.map((w, j) => j === k ? e.target.value : w) })} maxLength={80} className="mt-1 block w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-base" />
                  </label>
                ))}
              </div>}
              {x.on && <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {bank && !bank.number && x.correct.trim() && <button type="button" className="min-h-[36px] font-bold underline" onClick={() => upd(x.id, { wrong: null, seed: x.seed + 1 })}>🎲 תשובות שגויות אחרות</button>}
                {x.custom && <button type="button" className="min-h-[36px] font-bold underline" onClick={() => setItems(xs => xs.filter(y => y.id !== x.id))}>🗑️ מחיקה</button>}
              </div>}
            </li>
          )
        })}
      </ul>
      <button type="button" className="ln-btn alt mt-3" onClick={() => setItems(xs => [...xs, newCustom()])}>➕ שאלה משלכם</button>

      <section className="ln-box mt-8 text-center" aria-label="מה עושים עם החידון">
        <p className="m-0 text-xl font-bold">{questions.length ? `מוכן! ${questions.length} שאלות בחידון` : 'כתבו תשובה נכונה לפחות לשאלה אחת'}</p>
        {missing > 0 && <p className="m-0 mt-1 text-sm text-[var(--muted-foreground)]">{missing} שאלות מסומנות עדיין בלי תשובה נכונה או בלי תשובה שגויה, והן לא ייכנסו.</p>}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" className="ln-btn" disabled={!questions.length} onClick={() => setMode('host')}>🎉 משחק על המסך</button>
          <button type="button" className="ln-btn alt" disabled={!questions.length || busy} onClick={online}>{busy ? 'יוצרים…' : '📲 חידון בטלפונים של האורחים'}</button>
          <button type="button" className="ln-btn alt" disabled={!questions.length} onClick={() => setMode('print')}>🖨️ דף לאורחים + תשובות</button>
        </div>
        <p className="m-0 mt-3 text-sm text-[var(--muted-foreground)]">בחידון בטלפונים מקבלים קישור וקוד QR, והתוצאות מגיעות לעמוד ניהול — כמו ב<Link to="/classroom/quiz" className="underline">מבחן האמריקאי שלנו</Link>. הכול נמחק אוטומטית אחרי 30 יום.</p>
        {err && <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-3 font-bold text-rose-800">{err}</p>}
      </section>

      {mode === 'host' && <HostMode questions={questions} title={title} onClose={() => setMode(null)} />}
      {mode === 'print' && <PrintPreview title={title} onClose={() => setMode(null)}>
        <QuizSheet quiz={quiz} party />
        <QuizSheet quiz={quiz} answers />
      </PrintPreview>}

      <div className="mt-10">
        <SeoBody
          paragraphs={[
            'החידון עובד הכי טוב כשהשאלות אישיות ומפתיעות: המילה הראשונה, המשפט שחוזר בבית, המאכל שהחוגג לא מוכן לגעת בו. התשובות השגויות צריכות להיות סבירות מספיק כדי לבלבל — ולכן האתר מציע אותן מתוך מאגר, ואתם יכולים להחליף אותן בבדיחות משפחתיות.',
            'במשחק על המסך, המנחה מקריא את השאלה, האורחים צועקים או מרימים אצבעות (א, ב או ג), ואז חושפים את התשובה. בחידון בטלפונים כל אורח עונה לבד, ובסוף רואים מי צדק הכי הרבה. דף מודפס מתאים לשולחנות, לשבת חתן או לאירוע בלי מסך.',
          ]}
          faq={FAQ}
          related={RELATED}
        />
      </div>
      <SpokeNav current={PATH} />
    </div>
  )
}

import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { HANUKKAH_QUIZ, HANUKKAH_LEVELS } from '../../data/hanukkah'

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
const ROUND = 10

const FAQ = [
  { q: 'לאיזה גיל מתאים חידון החנוכה?', a: 'יש 3 רמות: גן וכיתה א׳ (שאלות פשוטות על הנרות, הסביבון והסופגניות), כיתות ב׳–ד׳ (סיפור החג והמכבים), וכיתות ה׳ ומעלה (היסטוריה, ברכות וחישובים). בכל רמה נכללות גם השאלות של הרמות הקלות ממנה.' },
  { q: 'אפשר להדפיס את החידון?', a: 'כן — לוחצים "הדפיסו את החידון" ומקבלים דף שאלות עם אפשרויות, ודף תשובות נפרד למורה או להורה.' },
  { q: 'איך משחקים בחידון עם כל המשפחה?', a: 'מתחלקים לקבוצות, פותחים את החידון על המסך הגדול, וכל קבוצה עונה בתורה. כל תשובה נכונה = נקודה. אחרי כל שאלה מופיע הסבר קצר — ככה כולם לומדים משהו.' },
]

function PrintQuiz({ list }) {
  const letters = ['א', 'ב', 'ג', 'ד']
  return <>
    <article className="buga-flow" dir="rtl">
      <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🕎 חידון חנוכה</h2>
      <p style={{ textAlign: 'center', marginBottom: 14 }}>שם: ______________ · הקיפו את התשובה הנכונה</p>
      {list.map((x, i) => <div key={i} className="paper-block" style={{ marginBottom: 12, breakInside: 'avoid' }}>
        <p style={{ fontWeight: 700 }}>{i + 1}. {x.q}</p>
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 22px' }}>{x.shown.map((o, k) => <span key={k}>{letters[k]}. {o}</span>)}</p>
      </div>)}
    </article>
    <article className="buga-flow" dir="rtl">
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>תשובות — חידון חנוכה</h2>
      {list.map((x, i) => <p key={i} style={{ marginBottom: 6 }}><b>{i + 1}. {letters[x.shown.indexOf(x.options[0])]} — {x.options[0]}.</b> {x.why}</p>)}
    </article>
  </>
}

export default function HanukkahQuiz() {
  const [level, setLevel] = useState(1)
  const [seed, setSeed] = useState(0)
  const round = useMemo(() => shuffle(HANUKKAH_QUIZ.filter(x => x.level <= level)).slice(0, ROUND).map(x => ({ ...x, shown: shuffle(x.options) })), [level, seed])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [print, setPrint] = useState(null)
  const done = i >= round.length
  const q = round[i]

  const restart = (lv = level) => { setLevel(lv); setSeed(s => s + 1); setI(0); setPicked(null); setScore(0) }
  const choose = o => { if (picked) return; setPicked(o); if (o === q.options[0]) setScore(s => s + 1) }
  const next = () => { setI(n => n + 1); setPicked(null) }
  const printList = () => shuffle(HANUKKAH_QUIZ.filter(x => x.level <= level)).slice(0, 15).map(x => ({ ...x, shown: shuffle(x.options) }))

  return (
    <HanukkahShell crumb="חידון חנוכה">
      <SEO title="חידון חנוכה לילדים — שאלות ותשובות, גם להדפסה" description="חידון חנוכה לילדים ב־3 רמות: גן, כיתות ב׳–ד׳ וכיתות ה׳ ומעלה. שאלות על המכבים, פך השמן, החנוכייה והסביבון, עם הסבר לכל תשובה — לשחק על המסך או להדפיס עם דף תשובות." path="/holidays/hanukkah/quiz" structuredData={faqSchema(FAQ)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">❓ חידון חנוכה לילדים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">{HANUKKAH_QUIZ.length} שאלות · 3 רמות · הסבר אחרי כל תשובה</p>

      <div className="mb-5 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="רמה">
        {HANUKKAH_LEVELS.map(l => <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => restart(l.id)}
          className={`min-h-[44px] rounded-xl border-2 px-4 font-bold ${level === l.id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{l.label}</button>)}
        <button type="button" onClick={() => setPrint(printList())} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">🖨️ הדפיסו את החידון</button>
      </div>

      <section className="mx-auto mb-10 max-w-2xl rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5 sketch-shadow">
        {done ? <div className="py-6 text-center">
          <p className="text-6xl mb-2">{score >= 9 ? '🏆' : score >= 6 ? '🕎' : '🍩'}</p>
          <p className="text-3xl font-bold mb-1">{score} מתוך {round.length}</p>
          <p className="text-lg mb-4">{score >= 9 ? 'מכבים אמיתיים! כל הכבוד!' : score >= 6 ? 'יפה מאוד! אתם יודעים הרבה על חנוכה' : 'התחלה טובה — עוד סיבוב ותהיו מומחים'}</p>
          <button type="button" onClick={() => restart()} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🔄 סיבוב חדש</button>
        </div> : <>
          <div className="mb-2 flex justify-between text-sm font-bold"><span>שאלה {i + 1} מתוך {round.length}</span><span>⭐ {score}</span></div>
          <p className="mb-4 text-2xl font-bold leading-snug">{q.q}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.shown.map(o => {
              const right = picked && o === q.options[0], wrong = picked === o && o !== q.options[0]
              return <button key={o} type="button" onClick={() => choose(o)} disabled={!!picked}
                className={`min-h-[56px] rounded-2xl border-2 px-3 text-right text-lg font-bold ${right ? 'border-green-600 bg-green-200' : wrong ? 'border-red-500 bg-red-100' : 'border-slate-800 bg-white hover:-translate-y-0.5'}`}>{o}</button>
            })}
          </div>
          {picked && <div className="mt-4 rounded-2xl bg-white p-3" aria-live="polite">
            <p className="font-bold">{picked === q.options[0] ? '✅ נכון!' : `❌ התשובה הנכונה: ${q.options[0]}`}</p>
            <p>{q.why}</p>
            <button type="button" onClick={next} className="mt-3 min-h-[48px] rounded-xl bg-blue-600 px-6 font-bold text-white">{i + 1 < round.length ? 'לשאלה הבאה ←' : 'לתוצאה ←'}</button>
          </div>}
        </>}
      </section>

      <SeoBody
        paragraphs={[
          'חידון חנוכה הוא דרך מצוינת ללמוד את סיפור החג בלי הרצאות: מי היו המכבים, מה מצאו בבית המקדש, למה מדליקים 8 נרות ולמה אוכלים סופגניות. אחרי כל תשובה מופיע הסבר קצר, כך שגם מי שטעה לומד משהו.',
          'החידון מתאים לערב חנוכה משפחתי, למסיבת חנוכה בגן ובכיתה, ולמורות שרוצות פעילות מוכנה על המקרן. בכל סיבוב השאלות מתערבבות מחדש.',
        ]}
        faq={FAQ}
        related={[{ label: 'סביבון וירטואלי', href: '/holidays/hanukkah/sevivon' }, { label: 'דפי עבודה לחנוכה', href: '/holidays/hanukkah/worksheets' }, { label: 'טריוויה לכל הנושאים', href: '/tools/trivia-quiz' }]}
      />
      {print && <PrintPreview title="חידון חנוכה" onClose={() => setPrint(null)}><PrintQuiz list={print} /></PrintPreview>}
    </HanukkahShell>
  )
}

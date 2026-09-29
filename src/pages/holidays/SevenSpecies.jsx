import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HolidayShell from '../../components/holidays/HolidayShell'
import SpeciesIcon from '../../components/tubishvat/SpeciesIcon'
import { TUBISHVAT_H } from '../../holidays/tubishvat'
import { SEVEN_SPECIES } from '../../data/tubishvat'

const FAQ = [
  { q: 'מה הם שבעת המינים?', a: 'שבעת המינים הם שבעה גידולים שבהם התברכה ארץ ישראל לפי ספר דברים: חיטה, שעורה, גפן, תאנה, רימון, זית ותמר ("ארץ חיטה ושעורה וגפן ותאנה ורימון, ארץ זית שמן ודבש").' },
  { q: 'למה ה"דבש" הוא תמר?', a: 'הדבש שבפסוק הוא לא דבש דבורים אלא דבש תמרים — מה שהיום נקרא סילאן.' },
  { q: 'איך משחקים במשחק הזיכרון?', a: 'הופכים שני קלפים בכל תור. אם יצאו ציור ושם של אותו מין — הם נשארים פתוחים. המטרה: למצוא את כל 7 הזוגות בכמה שפחות ניסיונות.' },
]

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
const deck = () => shuffle(SEVEN_SPECIES.flatMap(s => [{ key: s.id + '-p', id: s.id, kind: 'pic' }, { key: s.id + '-n', id: s.id, kind: 'name', name: s.name }]))

function Memory() {
  const [cards, setCards] = useState(deck)
  const [open, setOpen] = useState([])
  const [found, setFound] = useState([])
  const [tries, setTries] = useState(0)
  const done = found.length === SEVEN_SPECIES.length
  const flip = i => {
    if (open.length === 2 || open.includes(i) || found.includes(cards[i].id)) return
    const next = [...open, i]
    setOpen(next)
    if (next.length === 2) {
      setTries(t => t + 1)
      const [a, b] = next.map(k => cards[k])
      if (a.id === b.id && a.kind !== b.kind) { setFound(f => [...f, a.id]); setOpen([]) }
      else setTimeout(() => setOpen([]), 900)
    }
  }
  const reset = () => { setCards(deck()); setOpen([]); setFound([]); setTries(0) }
  return <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-green-50 p-5 sketch-shadow" aria-labelledby="memory">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 id="memory" className="text-2xl font-bold">🧠 משחק זיכרון: ציור ושם</h2>
      <span className="font-bold">ניסיונות: {tries} · זוגות: {found.length}/7</span>
    </div>
    {done && <p className="mb-3 rounded-xl bg-white p-3 text-center text-xl font-bold" aria-live="polite">🎉 כל הכבוד! מצאתם את כל שבעת המינים ב־{tries} ניסיונות</p>}
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {cards.map((c, i) => {
        const up = open.includes(i) || found.includes(c.id)
        return <button key={c.key} type="button" onClick={() => flip(i)} aria-label={up ? (c.kind === 'name' ? c.name : SEVEN_SPECIES.find(s => s.id === c.id).name) : 'קלף סגור'}
          className={`flex aspect-[3/4] items-center justify-center rounded-xl border-2 text-xl font-black transition-transform ${up ? (found.includes(c.id) ? 'border-green-600 bg-green-100' : 'border-slate-800 bg-white') : 'border-slate-800 bg-green-700 text-white hover:-translate-y-0.5'}`}>
          {up ? (c.kind === 'pic' ? <SpeciesIcon id={c.id} size={56} /> : c.name) : '🌳'}
        </button>
      })}
    </div>
    <div className="mt-3 text-center"><button type="button" onClick={reset} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">🔄 משחק חדש</button></div>
  </section>
}

export default function SevenSpecies() {
  const [sel, setSel] = useState(null)
  const cur = useMemo(() => SEVEN_SPECIES.find(s => s.id === sel), [sel])
  return (
    <HolidayShell h={TUBISHVAT_H} crumb="שבעת המינים">
      <SEO title="שבעת המינים לילדים — הסבר, תמונות ומשחק זיכרון" description="שבעת המינים לילדים: חיטה, שעורה, גפן, תאנה, רימון, זית ותמר — מה כל אחד נותן, איך הוא נראה, ומשחק זיכרון להתאמת ציור לשם. לט״ו בשבט, לגן ולכיתה." path="/holidays/tu-bishvat/seven-species" structuredData={faqSchema(FAQ)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">🍇 שבעת המינים</h1>
      <p className="mx-auto mb-6 max-w-2xl text-center text-lg">"ארץ חיטה ושעורה וגפן ותאנה ורימון, ארץ זית שמן ודבש" <span className="text-[var(--muted-foreground)]">(דברים ח׳, ח׳)</span></p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {SEVEN_SPECIES.map(s => <button key={s.id} type="button" onClick={() => setSel(s.id)} aria-pressed={sel === s.id}
          className={`wobbly-sm flex flex-col items-center border-2 p-3 transition-transform hover:-translate-y-1 ${sel === s.id ? 'border-slate-800 bg-green-100' : 'border-[var(--border)] bg-white'}`}>
          <SpeciesIcon id={s.id} size={72} title={s.name} />
          <span className="mt-1 text-xl font-black">{s.name}</span>
        </button>)}
      </div>
      <div className="mb-10 min-h-[90px] rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-center" aria-live="polite">
        {cur ? <><p className="text-2xl font-black">{cur.name} — {cur.makes}</p><p className="text-lg">{cur.fact}</p></> : <p className="text-lg">לחצו על אחד המינים כדי לגלות מה הוא נותן 👆</p>}
      </div>

      <Memory />

      <SeoBody
        paragraphs={[
          'שבעת המינים הם שבעה גידולים שמאפיינים את ארץ ישראל: שני דגנים (חיטה ושעורה) וחמישה פירות (ענבי הגפן, תאנה, רימון, זית ותמר). בט״ו בשבט נוהגים לאכול מפירות שבעת המינים.',
          'בעמוד אפשר ללחוץ על כל מין ולגלות מה מכינים ממנו, ולשחק במשחק זיכרון שמתאים בין הציור לשם — מצוין לגן ולכיתות א׳–ב׳, גם על המקרן.',
        ]}
        faq={FAQ}
        related={[{ label: 'חידון ט״ו בשבט', href: '/holidays/tu-bishvat/quiz' }, { label: 'דף צביעה של שבעת המינים', href: '/holidays/tu-bishvat/coloring' }, { label: 'פעילויות לט״ו בשבט', href: '/holidays/tu-bishvat/what-to-do' }]}
      />
    </HolidayShell>
  )
}

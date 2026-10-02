import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { LetterSheet } from '../../components/ui/HebrewTracing'
import FlashcardSheet from '../../components/letters/FlashcardSheet'
import LettersGame from '../../components/letters/LettersGame'
import { speak } from '../../utils/speak'
import NotFound from '../NotFound'
import { HEBREW, hebrewBySlug } from '../../data/letterLearning'
import { HEB_STROKES } from '../../data/hebrewStrokes'

// "How do you write it": the teacher's single-line strokes drawn on, in order.
function WriteIt({ letter }) {
  const [run, setRun] = useState(0)
  const s = HEB_STROKES[letter]
  if (!s) return null
  const [w, d] = s
  return <div className="text-center">
    <svg viewBox={`${-20} -50 ${w + 40} 210`} className="mx-auto h-56 w-auto" role="img" aria-label={`איך כותבים את האות ${letter}`}>
      <path d={`M-20 0 H${w + 20}`} stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="5 4" />
      <path d={`M-20 100 H${w + 20}`} stroke="#60a5fa" strokeWidth="2" />
      <path d={d} fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path key={run} d={d} fill="none" stroke="#db2777" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1">
        <animate attributeName="stroke-dashoffset" from="1" to="0" dur="2.4s" fill="freeze" />
      </path>
    </svg>
    <button type="button" onClick={() => setRun(r => r + 1)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold">▶️ שוב</button>
  </div>
}

export default function LetterPage() {
  const { slug } = useParams()
  const item = hebrewBySlug(slug)
  const [print, setPrint] = useState(null)
  if (!item) return <NotFound />
  const i = HEBREW.indexOf(item), prev = HEBREW[i - 1], next = HEBREW[i + 1]
  const { l, name, words, tip, similar, final } = item
  const cards = words.map(([word, emoji]) => ({ l, emoji, word }))
  const faq = [
    { q: `איך מלמדים ילד את האות ${l}?`, a: `מתחילים מהצליל: אומרים יחד מילים שמתחילות ב־${l} — ${words.slice(0, 3).map(w => w[0]).join(', ')}. אחר כך מראים את צורת האות, עוברים עליה באצבע ורק בסוף כותבים בעיפרון. 10 דקות ביום מספיקות.` },
    { q: `אילו מילים מתחילות באות ${l}?`, a: `${words.map(w => w[0]).join(', ')} ועוד הרבה. משחק טוב: כל אחד בתורו אומר מילה שמתחילה ב־${l} — מי שנתקע, מקבל רמז.` },
    ...(similar.length ? [{ q: `עם איזו אות מתבלבלים ב־${l}?`, a: `הרבה ילדים מתבלבלים בין ${l} ל־${similar.join(' ול־')}. ${similar.some(x => tip.includes(x)) ? tip : 'הטיפ: מסתכלים טוב על ההבדל בצורה, ומשחקים במשחק "מצאו את האות" — בכוונה מופיעות בו אותיות דומות.'}` }] : []),
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title={`לימוד האות ${l} — משחק, מילים ודף עבודה`} description={`לימוד האות ${l} (${name}) לגן ולכיתה א׳: איך כותבים את האות ${l} צעד אחר צעד, מילים שמתחילות ב־${l}, משחק זיהוי ודף תרגול כתיבה להדפסה — בחינם.`} path={`/letters/${slug}`} structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: `האות ${l}` }]} />

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] items-center mb-8">
        <div className="text-center">
          <div className="inline-flex h-48 w-48 items-center justify-center rounded-[40%_60%_55%_45%] border-[3px] border-slate-800 bg-yellow-200 sketch-shadow text-[9rem] font-bold leading-none font-display">{l}</div>
          <p className="mt-3 text-2xl font-bold">{name}{final && <span className="text-lg font-normal"> · בסוף מילה: <b className="text-3xl">{final}</b></span>}</p>
          <button type="button" onClick={() => speak(name)} className="mt-2 min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold">🔊 שמעו</button>
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl mb-3">לימוד האות {l}</h1>
          <p className="text-lg leading-relaxed mb-3">{tip}</p>
          <div className="flex flex-wrap gap-2">
            <button data-print-main type="button" onClick={() => setPrint('trace')} className="min-h-[48px] rounded-xl bg-pink-600 px-5 font-bold text-white">🖨️ דף תרגול כתיבה</button>
            <button type="button" onClick={() => setPrint('cards')} className="min-h-[48px] rounded-xl border-2 border-slate-800 bg-white px-5 font-bold">🃏 כרטיסיות מילים</button>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-4">מילים שמתחילות באות {l}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {words.map(([w, e]) => <button key={w} type="button" onClick={() => speak(w)} className="wobbly-sm flex min-w-0 items-center gap-2 sm:gap-3 border-2 border-[var(--border)] bg-white p-3 text-right hover:-translate-y-0.5 transition-transform">
            <span className="shrink-0 text-4xl sm:text-5xl" aria-hidden="true">{e}</span>
            <span className="min-w-0 text-xl sm:text-2xl font-bold [overflow-wrap:anywhere]"><span className="text-pink-600">{w[0]}</span>{w.slice(1)}</span>
          </button>)}
        </div>
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-2 items-start">
        <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm">
          <h2 className="text-2xl font-bold mb-1">✍️ איך כותבים את האות {l}?</h2>
          <p className="mb-2 text-[var(--muted-foreground)]">כתב דפוס — מתחילים מלמעלה, כמו שמלמדים בכיתה א׳.</p>
          <WriteIt letter={l} />
          {final && <><p className="mt-4 font-bold">ובסוף מילה — {final}:</p><WriteIt letter={final} /></>}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">🎮 משחק: מצאו את האות {l}</h2>
          <LettersGame key={l} fixed={l} compact />
        </div>
      </section>

      <nav className="mb-10 flex items-center justify-between gap-3" aria-label="אות קודמת ואות הבאה">
        {prev ? <Link to={`/letters/${prev.slug}`} className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">→ האות {prev.l}</Link> : <span />}
        <Link to="/letters" className="font-bold underline">כל האותיות</Link>
        {next ? <Link to={`/letters/${next.slug}`} className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">האות {next.l} ←</Link> : <span />}
      </nav>

      <SeoBody
        paragraphs={[
          `האות ${l} (${name}) היא האות ה־${i + 1} באלף־בית. בעמוד הזה יש כל מה שצריך כדי ללמוד אותה: איך כותבים אותה בכתב דפוס, מילים שמתחילות בה, משחק זיהוי קצר ודף תרגול להדפסה.`,
          'הסדר המומלץ לילדים בגן ובכיתה א׳: קודם שומעים ומזהים את הצליל, אחר כך מכירים את הצורה, ורק בסוף כותבים. משחק של 5 דקות עושה יותר מדף עבודה ארוך.',
        ]}
        faq={faq}
        related={[{ label: 'כל האותיות בעברית', href: '/letters' }, { label: 'משחק אותיות לגן', href: '/letters/game' }, { label: 'כרטיסיות אותיות להדפסה', href: '/printables/letter-flashcards' }]}
      />

      {print && <PrintPreview title={print === 'trace' ? `תרגול האות ${l}` : `כרטיסיות — האות ${l}`} onClose={() => setPrint(null)}>
        {print === 'trace'
          ? <article className="buga-a4"><div className="print-art"><LetterSheet letter={l} /></div></article>
          : <article className="buga-a4"><div className="print-art"><FlashcardSheet cards={cards} title={`מילים שמתחילות באות ${l}`} /></div></article>}
      </PrintPreview>}
    </div>
  )
}

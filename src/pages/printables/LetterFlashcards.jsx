import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import FlashcardSheet, { PER_SHEET } from '../../components/letters/FlashcardSheet'
import { HEBREW, ENGLISH } from '../../data/letterLearning'

const heCards = () => HEBREW.map(x => ({ l: x.l, sub: x.final || '', emoji: x.words[0][1], word: x.words[0][0] }))
const enCards = () => ENGLISH.map(x => ({ l: x.l, sub: x.lower, emoji: x.emoji, word: x.word, dir: 'ltr' }))
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

const faq = [
  { q: 'איך מדפיסים את כרטיסיות האותיות?', a: 'בוחרים עברית או אנגלית, סגנון וצבע, ולוחצים "הדפיסו". בכל דף A4 יש 8 כרטיסיות עם קווי גזירה. 22 אותיות בעברית יוצאות ב־3 דפים, ו־26 אותיות באנגלית ב־4 דפים.' },
  { q: 'מה אפשר לשחק עם כרטיסיות אותיות?', a: 'זיכרון (מדפיסים פעמיים והופכים), "מי מוצא ראשון" — קוראים אות והילדים מחפשים, סידור לפי סדר הא״ב, ו"מה מתחיל באות הזאת" — כל אחד אומר מילה שמתחילה באות שעלתה.' },
  { q: 'לאיזה גיל מתאימות הכרטיסיות?', a: 'לגן חובה ולכיתה א׳ — לזיהוי אותיות ולקשר בין אות לצליל. הכרטיסיות באנגלית מתאימות גם לכיתות ג׳–ד׳ לחזרה על ה־ABC.' },
  { q: 'הכרטיסיות באמת בחינם?', a: 'כן. בלי הרשמה, בלי מייל ובלי תשלום — פותחים, מדפיסים ומשחקים.' },
]

const Pill = ({ on, onClick, children }) => <button type="button" role="radio" aria-checked={on} onClick={onClick} className={`min-h-[44px] rounded-xl border-2 px-4 font-bold ${on ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{children}</button>

export default function LetterFlashcards() {
  const [lang, setLang] = useState('he')
  const [style, setStyle] = useState('full')
  const [color, setColor] = useState(true)
  const [print, setPrint] = useState(null)
  const cards = lang === 'he' ? heCards() : enCards()
  const pages = chunk(cards, PER_SHEET)
  const title = lang === 'he' ? 'כרטיסיות אותיות בעברית' : 'כרטיסיות אותיות באנגלית – ABC'

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="כרטיסיות אותיות להדפסה חינם — עברית ואנגלית" description="כרטיסיות אותיות להדפסה בחינם: א׳–ת׳ ו־A–Z עם תמונה ומילה, 8 כרטיסיות בדף A4 עם קווי גזירה. בצבע או בשחור־לבן, לגן ולכיתה א׳." path="/printables/letter-flashcards" structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'כרטיסיות אותיות' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🃏 כרטיסיות אותיות להדפסה חינם</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">כל אות עם תמונה ומילה · 8 כרטיסיות בדף · עברית ואנגלית</p>

      <div className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3" role="radiogroup" aria-label="שפה">
          <Pill on={lang === 'he'} onClick={() => setLang('he')}>🇮🇱 עברית א–ת</Pill>
          <Pill on={lang === 'en'} onClick={() => setLang('en')}>🔤 אנגלית A–Z</Pill>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3" role="radiogroup" aria-label="סגנון">
          <Pill on={style === 'full'} onClick={() => setStyle('full')}>אות + תמונה + מילה</Pill>
          <Pill on={style === 'letter'} onClick={() => setStyle('letter')}>אות בלבד (גדולה)</Pill>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4" role="radiogroup" aria-label="צבע">
          <Pill on={color} onClick={() => setColor(true)}>🎨 צבעוני</Pill>
          <Pill on={!color} onClick={() => setColor(false)}>🖍️ שחור־לבן לצביעה</Pill>
        </div>
        <div className="text-center">
          <button type="button" onClick={() => setPrint(pages)} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפיסו {cards.length} כרטיסיות ({pages.length} דפים)</button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 mb-10">
        {pages.slice(0, 2).map((p, i) => <button key={i} type="button" onClick={() => setPrint([p])} className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm hover:-translate-y-1 transition-transform" aria-label={`פתחו את דף ${i + 1}`}>
          <div className="aspect-[600/820]"><FlashcardSheet cards={p} title={`${title} · דף ${i + 1}`} style={style} color={color} /></div>
        </button>)}
      </div>

      <div className="rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-5 text-center mb-10">
        <p className="font-display text-xl font-bold mb-3">רוצים לתרגל גם על המסך?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/letters/game" className="rounded-xl border-2 border-slate-800 bg-yellow-100 px-4 py-2 font-bold">🎮 משחק אותיות בעברית</Link>
          <Link to="/abc/game" className="rounded-xl border-2 border-slate-800 bg-cyan-100 px-4 py-2 font-bold">🔤 חזרה על אותיות באנגלית</Link>
          <Link to="/letters" className="rounded-xl border-2 border-slate-800 bg-pink-100 px-4 py-2 font-bold">📚 לימוד האותיות אחת־אחת</Link>
        </div>
      </div>

      <SeoBody
        paragraphs={[
          'כרטיסיות אותיות הן אחד הכלים הפשוטים והיעילים ביותר ללימוד אותיות בגן ובכיתה א׳. כל כרטיסייה כאן מחברת בין צורת האות, תמונה ומילה שמתחילה בה — כך הילד לומד לא רק לזהות את האות, אלא גם לשמוע את הצליל שלה.',
          'בכרטיסיות בעברית מופיעה ליד אותיות כ, מ, נ, פ, צ גם האות הסופית שלהן, כדי שהילדים יכירו אותן מההתחלה. בכרטיסיות באנגלית מופיעות האות הגדולה והקטנה יחד — Aa, Bb — כמו שלומדים בבית הספר.',
          'טיפ: הדפיסו על נייר עבה או הדביקו על קרטון, ואז הכרטיסיות יחזיקו מעמד הרבה משחקים. בגרסה בשחור־לבן הילדים יכולים לצבוע את האותיות לפני הגזירה.',
        ]}
        faq={faq}
        related={[{ label: 'אותיות בעברית למעבר בעיפרון', href: '/printables/hebrew-letters' }, { label: 'אותיות באנגלית למעבר בעיפרון', href: '/printables/abc-letters' }, { label: 'לימוד אותיות בעברית', href: '/letters' }]}
      />

      {print && <PrintPreview title={title} onClose={() => setPrint(null)}>
        {print.map((p, i) => <article className="buga-a4" key={i}><div className="print-art"><FlashcardSheet cards={p} title={title} style={style} color={color} /></div></article>)}
      </PrintPreview>}
    </div>
  )
}

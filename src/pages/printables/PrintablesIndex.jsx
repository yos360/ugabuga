import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { useActiveChipInView } from '../../hooks/useActiveChipInView'
import PrintableCard from '../../components/ui/PrintableCard'
import { categories } from '../../data/printableCategories'
import PrintPulse from '../../components/ui/PrintPulse'
import { TOPICS } from '../../data/printableTopics'
export { categories }

const PRINT_FAQ = [
  { q: 'הדפים באמת חינמיים?', a: 'כן. כל הדפים להדפסה באתר חינמיים לשימוש בבית, בגן ובכיתה, בלי הרשמה. כל דף מוכן לגודל A4, ואפשר גם לשמור כ-PDF.' },
  { q: 'אילו דפים מתאימים לגן?', a: 'דפי צביעה עם קווים עבים, מבוכים ברמה קלה, דפי מוטוריקה עדינה וכרטיסיות אותיות. לכל סוג דף כתוב הגיל המתאים.' },
  { q: 'יש דפי עבודה לבית הספר?', a: 'כן: דפי עבודה בחשבון עם תרגילים ופתרונות, דפי שעון ושברים, אותיות למעבר בעיפרון, סודוקו ותשבצי היגיון להדפסה.' },
]
// "9 פעילויות ליום הולדת" / "6 פעילויות בנושא חשבון" — a label that already starts with "ל" needs no "בנושא".
const topicCountText = (n, name) => `${n === 1 ? 'פעילות אחת' : `${n} פעילויות`} ${name.startsWith('ל') ? name : `בנושא ${name}`}`

// "1 דפים" → "דף אחד"
const withCount = cat => (cat.count === 1 ? { ...cat, count: 'דף אחד' } : cat)

export default function PrintablesIndex() {
  const [params, setParams] = useSearchParams()
  const topic = TOPICS.find(t => t.id === params.get('topic'))
  const list = !topic ? categories.filter(c => !c.inHubOnly) : topic.extra || topic.slugs.map(s => categories.find(c => c.slug === s)).filter(Boolean)
  const chipsRef = useActiveChipInView(topic?.id) // phones: keep the chosen topic in view in the scrolling chip row
  const pick = id => {
    const next = new URLSearchParams(params)
    if (!id || topic?.id === id) next.delete('topic'); else next.set('topic', id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="דפים להדפסה לילדים — דפי פעילות, צביעה ועבודה בחינם" description="דפים להדפסה לילדים בחינם: דפי צביעה, מבוכים, דפי עבודה בחשבון, אותיות, משחקים להדפסה, תעודות ושלטים למסיבה. מדפיסים מיד, בלי הרשמה." path="/printables" structuredData={faqSchema(PRINT_FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🖨️ דפי פעילות להדפסה בחינם</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">דפים להדפסה לילדים: בוחרים נושא ופעילות — ומדפיסים מיד. הכל חינם וללא הרשמה.</p>
      <QuickAnswer q="איפה מוצאים דפים להדפסה לילדים בחינם?" a="כאן — מאות דפים בעברית שמדפיסים מיד, בלי הרשמה ובלי תשלום: דפי צביעה לפי נושא, מבוכים, דפי עבודה בחשבון, אותיות ומספרים, משחקים להדפסה, תעודות ושלטים למסיבה. בוחרים נושא למעלה, פותחים דף ולוחצים הדפסה." rows={[['הכי מבוקשים', 'דפי צביעה, מבוכים, דפי עבודה בחשבון, כרטיסיות אותיות, מנדלות'], ['גילים', 'גן עד כיתה ו׳'], ['למי', 'הורים, גננות ומורות'], ['מחיר', 'חינם, בלי הרשמה']]} updated="2026-10-21" />

      <nav ref={chipsRef} aria-label="סינון לפי נושא" className="chip-scroll mb-8 flex flex-wrap justify-center gap-2">
        {[{ id: '', label: 'הכול' }, ...TOPICS].map(t => {
          const on = (topic?.id || '') === t.id
          return <button key={t.id || 'all'} type="button" aria-pressed={on} onClick={() => pick(t.id)}
            className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${on ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>{t.label}</button>
        })}
      </nav>
      {topic && <p className="-mt-5 mb-5 text-center text-[var(--muted-foreground)]" role="status">{topicCountText(list.length, topic.label.replace(/^\S+\s/, ''))} · <Link to="/printables" onClick={e => { e.preventDefault(); pick('') }} className="underline font-bold">לכל הדפים</Link></p>}

      <PrintPulse />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((cat, i) => <PrintableCard key={cat.slug} cat={withCount(cat)} index={i} />)}
      </div>

      <section className="mt-10" aria-labelledby="hebrew-packs">
        <h2 id="hebrew-packs" className="text-center text-3xl font-bold">📚 חבילות דפי עבודה בעברית</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[var(--muted-foreground)]">בוחרים רמה, מסמנים דפים ומדפיסים חבילה עם פתרונות.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['🧸', 'דפי עבודה לגן חובה', '12 דפים להכנה לכיתה א׳.', '/printables/kindergarten-worksheets'],
            ['✏️', 'דפי עבודה בעברית לכיתה א׳', 'קריאה, כתיבה, צלילים ומשפטים.', '/printables/hebrew-worksheets-grade-1'],
            ['👂', 'צליל פותח וצליל סוגר', 'זיהוי צליל ראשון ואחרון.', '/printables/opening-ending-sounds'],
            ['🎵', 'חרוזים והברות', 'מתחרזים, מחלקים וסופרים.', '/printables/rhymes-syllables'],
            ['📖', 'קריאה וכתיבת מילים', 'מילים, משפטים ואותיות סופיות.', '/printables/reading-writing-words'],
            ['📚', 'עברית לכיתות ב׳–ג׳', 'אוצר מילים, כתיבה והבנת שפה.', '/printables/hebrew-worksheets-grades-2-3'],
          ].map(([emoji, title, desc, to]) => <Link key={to} to={to} className="wobbly-sm border-2 border-[var(--border)] bg-sky-50 p-4 transition-transform hover:-translate-y-1">
            <span className="text-3xl">{emoji}</span><h3 className="mt-1 text-xl font-bold">{title}</h3><p className="m-0 text-[var(--muted-foreground)]">{desc}</p>
          </Link>)}
        </div>
      </section>

      <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-6 mt-10 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">✏️ רוצים ליצור בעצמכם?</h2>
        <p className="font-hand text-lg mb-4">כמה מהדפים אפשר למלא עם התוכן שלכם — שמות, מילים, פריטים אישיים</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/tools/bingo-maker" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🎯 בינגו מותאם אישית</a>
          <a href="/tools/word-search-maker" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🔍 תפזורת מותאמת אישית</a>
          <a href="/tools/scavenger-hunt-maker" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🔎 ציד אוצרות מותאם אישית</a>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-6 text-center sketch-shadow">
        <h2 className="font-display text-2xl font-bold">🧺 מי מביא מה? — רשימה שיתופית למסיבה</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">פותחים רשימה, משתפים בוואטסאפ וכל אחד בוחר מה להביא.</p>
        <a href="/tools/bring-list" className="mt-4 inline-block rounded-xl border-2 border-slate-800 bg-white px-6 py-3 font-bold">פתחו רשימה חדשה ←</a>
      </div>
      <div className="mt-10"><SeoBody paragraphs={[<>הכי מבוקשים: <Link to="/printables/coloring" className="underline font-bold">דפי צביעה</Link> לפי נושא, <Link to="/printables/mazes" className="underline font-bold">מבוכים להדפסה</Link> ב-5 רמות, <Link to="/printables/math-worksheets" className="underline font-bold">דפי עבודה בחשבון</Link>, <Link to="/printables/letter-flashcards" className="underline font-bold">כרטיסיות אותיות</Link>, <Link to="/printables/mandalas" className="underline font-bold">מנדלות לצביעה</Link> ו<Link to="/printables/color-by-number" className="underline font-bold">צביעה לפי מספרים</Link>. לחשיבה: <Link to="/sudoku/print" className="underline font-bold">סודוקו להדפסה</Link> ו<Link to="/logic-puzzles/print" className="underline font-bold">תשבצי היגיון להדפסה</Link>.</>]} faq={PRINT_FAQ} /></div>
    </div>
  )
}


import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintableCard from '../../components/ui/PrintableCard'
import { categories } from '../../data/printableCategories'
export { categories }

// Holiday sheets live under /holidays — shown here only under the "חגים" chip.
const HOLIDAY_SHEETS = [
  ['rosh-hashana', 'דפי צביעה לראש השנה', '🍎'], ['sukkot', 'דפי צביעה לסוכות', '🌿'], ['hanukkah', 'דפי צביעה לחנוכה', '🕎'],
  ['tu-bishvat', 'דפי צביעה לט״ו בשבט', '🌳'], ['pesach', 'דפי צביעה לפסח', '🫓'], ['yom-haatzmaut', 'דפי צביעה ליום העצמאות', '🎆'],
  ['lag-baomer', 'דפי צביעה לל״ג בעומר', '🔥'], ['shavuot', 'דפי צביעה לשבועות', '🌾'],
].map(([slug, title, emoji]) => ({ slug: 'holiday-' + slug, href: `/holidays/${slug}/coloring`, title, emoji, count: 'חגים', desc: 'דפי צביעה לחג, מוכנים להדפסה.' }))
  .concat({ slug: 'holiday-hanukkah-worksheets', href: '/holidays/hanukkah/worksheets', title: 'דפי עבודה לחנוכה', emoji: '✏️', count: 'חגים', desc: 'דפי עבודה לגן ולכיתה א׳ בנושא חנוכה.' })

// Topic chips. Each sheet can sit under more than one topic.
const TOPICS = [
  { id: 'birthday', label: '🎂 ליום הולדת', slugs: ['birthday-newspaper', 'birthday-checklist', 'birthday-signs', 'certificates', 'name-tags', 'thank-you', 'photo-props', 'board-game', 'coloring'] },
  { id: 'math', label: '🔢 חשבון', slugs: ['math-worksheets', 'numbers', 'sudoku', 'count-and-write', 'color-by-number', 'dot-to-dot'] },
  { id: 'letters', label: '🔤 אותיות ומילים', slugs: ['letters', 'hebrew-letters', 'abc-letters', 'letter-flashcards', 'word-tracing', 'match-word', 'opposites', 'synonyms'] },
  { id: 'coloring', label: '🖍️ צביעה ויצירה', slugs: ['coloring', 'mandalas', 'symmetry', 'color-by-number', 'dot-to-dot', 'photo-props'] },
  { id: 'motor', label: '✂️ מוטוריקה וחשיבה', slugs: ['fine-motor', 'mazes', 'find-differences', 'complete-pattern', 'silhouette-match', 'cut-and-order', 'hidden-object', 'missing-picture', 'mixed-activities', 'symmetry', 'dot-to-dot'] },
  { id: 'holidays', label: '🕎 חגים', extra: HOLIDAY_SHEETS },
  { id: 'school', label: '🏫 לכיתה ולגן', slugs: ['roots-project', 'math-worksheets', 'letters', 'hebrew-letters', 'letter-flashcards', 'fine-motor', 'numbers', 'mixed-activities'] },
]

// "1 דפים" → "דף אחד"
const withCount = cat => (cat.count === 1 ? { ...cat, count: 'דף אחד' } : cat)

export default function PrintablesIndex() {
  const [params, setParams] = useSearchParams()
  const topic = TOPICS.find(t => t.id === params.get('topic'))
  const list = !topic ? categories : topic.extra || categories.filter(c => topic.slugs.includes(c.slug))
  const pick = id => {
    const next = new URLSearchParams(params)
    if (!id || topic?.id === id) next.delete('topic'); else next.set('topic', id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="דפים להדפסה" description="דפי צביעה, אותיות, מבוכים, תעודות, שלטים ועוד — הכל חינם להדפסה בסגנון UGABUGA מצויר ביד." path="/printables" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🖨️ דפי פעילות להדפסה בחינם</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">בוחרים נושא ופעילות — ומדפיסים מיד. הכל חינם וללא הרשמה.</p>

      <nav aria-label="סינון לפי נושא" className="mb-8 flex flex-wrap justify-center gap-2">
        {[{ id: '', label: 'הכול' }, ...TOPICS].map(t => {
          const on = (topic?.id || '') === t.id
          return <button key={t.id || 'all'} type="button" aria-pressed={on} onClick={() => pick(t.id)}
            className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${on ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>{t.label}</button>
        })}
      </nav>
      {topic && <p className="-mt-5 mb-5 text-center text-[var(--muted-foreground)]" role="status">{list.length} פעילויות בנושא {topic.label.replace(/^\S+\s/, '')} · <Link to="/printables" onClick={e => { e.preventDefault(); pick('') }} className="underline font-bold">לכל הדפים</Link></p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((cat, i) => <PrintableCard key={cat.slug} cat={withCount(cat)} index={i} />)}
      </div>

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
    </div>
  )
}

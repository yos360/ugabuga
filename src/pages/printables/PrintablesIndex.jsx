import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintableCard from '../../components/ui/PrintableCard'
import { categories } from '../../data/printableCategories'
export { categories }



export default function PrintablesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="דפים להדפסה" description="דפי צביעה, אותיות, מבוכים, תעודות, שלטים ועוד — הכל חינם להדפסה בסגנון UGABUGA מצויר ביד." path="/printables" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🖨️ דפי פעילות להדפסה בחינם</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">בוחרים פעילות, גיל ונושא — ומדפיסים מיד. הכל חינם וללא הרשמה.</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => <PrintableCard key={cat.slug} cat={cat} index={i} />)}
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

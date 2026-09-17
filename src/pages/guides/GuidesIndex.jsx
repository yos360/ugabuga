import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { GUIDES } from '../../data/guides'

export default function GuidesIndex() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title="מדריכים ליום הולדת, משחקים וכיתה"
        description="מדריכים קצרים וברורים לתכנון ימי הולדת, משחקים לילדים, פעילויות בכיתה וכלים להכנה מהירה."
        path="/guides"
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מדריכים' }]} />

      <section className="text-center mb-10">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-4">מדריכים של עוגה בוגה</h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
          כל מה שצריך כדי לארגן פעילות בלי להסתבך: יום הולדת בבית, משחקים בלי מפעיל,
          צ׳ק ליסטים, כמויות אוכל ורעיונות למורים בכיתה.
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} to={`/guides/${guide.slug}`} className="block h-full">
            <WobblyCard hover padding="p-6" className="h-full">
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{guide.emoji}</div>
                <div>
                  <h2 className="text-2xl font-hand font-bold mb-2">{guide.title}</h2>
                  <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">{guide.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--border)]">
                      {guide.minutes} דקות קריאה
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white border border-[var(--border)]">
                      {guide.audience}
                    </span>
                  </div>
                </div>
              </div>
            </WobblyCard>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <WobblyCard hover={false} padding="p-6" className="bg-yellow-50">
          <h2 className="text-2xl font-hand font-bold mb-3">רוצים משהו פרקטי עכשיו?</h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            אם אתם באמצע הכנה למסיבה או שיעור, התחילו מכלי מוכן: טריוויה, בוגהטאון, חדר בריחה, בינגו או חפש את המטמון.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/tools/trivia-quiz" className="btn-primary">טריוויה BUGA</Link>
            <Link to="/tools/buga-town" className="btn-secondary">בוגהטאון</Link>
            <Link to="/tools/escape-rooms" className="btn-secondary">חדרי בריחה</Link>
            <Link to="/tools/bingo-maker" className="btn-secondary">יוצר בינגו</Link>
            <Link to="/tools/scavenger-hunt-maker" className="btn-secondary">ציד אוצרות</Link>
            <Link to="/tools/team-generator" className="btn-secondary">חלוקה לקבוצות</Link>
          </div>
        </WobblyCard>
      </section>
    </div>
  )
}
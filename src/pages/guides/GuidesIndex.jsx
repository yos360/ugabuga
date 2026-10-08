import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import { GUIDES } from '../../data/guides'

// Hub sections: each guide appears under the stage of planning it helps with
const HUB_GROUPS = [
  { title: 'מתחילים לתכנן', text: 'מה עושים קודם, כמה זה עולה, מתי שולחים הזמנות ומה לא לשכוח.', slugs: ['how-to-plan-birthday', 'birthday-checklist', 'birthday-budget', 'birthday-invitation-guide', 'how-much-food-for-party', 'party-bags-guide'] },
  { title: 'איפה ואיך חוגגים', text: 'בבית, בחוץ, בכיתה או בלי מפעיל — ותוכנית גיבוי כשמזג האוויר מפתיע.', slugs: ['birthday-at-home-complete', 'birthday-without-entertainer', 'rainy-day-birthday', 'outdoor-party-safety', 'class-birthday-guide'] },
  { title: 'לפי גיל', text: 'מהיום הולדת הראשון ועד מסיבה לבני נוער שלא רוצים "מסיבת ילדים".', slugs: ['first-birthday-guide', 'birthday-games-by-age', 'teen-party-guide'] },
  { title: 'למורים ולחגים', text: 'פעילויות לכיתה ולאורך השנה, שאפשר להפעיל בלי הכנה ארוכה.', slugs: ['games-for-teachers', 'holiday-activities-guide'] },
]
const HUB_FAQ = [
  { q: 'מאיזה מדריך כדאי להתחיל?', a: 'אם המסיבה עוד רחוקה, התחילו ב"איך מתכננים יום הולדת בלי להשתגע" ובמדריך התקציב. אם נשאר שבוע, עברו ישר לצ׳ק ליסט ולמדריך לפי המקום שבו אתם חוגגים.' },
  { q: 'האם המדריכים מתאימים גם לגננות ולמורים?', a: 'כן. המדריך ליום הולדת בכיתה או בגן והמדריך למשחקים למורים נכתבו במיוחד לצוותים חינוכיים, ורוב הטיפים על משחקים וניהול קבוצה מתאימים גם לכיתה.' },
  { q: 'איך מחליטים בין מסיבה בבית למסיבה במקום חיצוני?', a: 'זה תלוי בעיקר בכמות הילדים, בגודל הבית ובתקציב. יש לנו השוואה מסודרת בין בית לאולם, וגם בין מפעיל להפעלה עצמית, שיעזרו להחליט.' },
]

export default function GuidesIndex() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title="מדריכים ליום הולדת, משחקים וכיתה"
        description="מדריכים קצרים וברורים לתכנון ימי הולדת, משחקים לילדים, פעילויות בכיתה וכלים להכנה מהירה."
        path="/guides"
        structuredData={faqSchema(HUB_FAQ)}
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

      <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-10">
        המדריכים כתובים להורים, לגננות ולמורים שצריכים תשובה מעשית ולא עוד רשימת השראה: כמה ילדים נכנסים לסלון, כמה פיצות להזמין,
        איך מחזיקים קבוצה בלי מפעיל ומה עושים כשיורד גשם. הם מסודרים לפי שלב התכנון — בחרו את השלב שבו אתם נמצאים.
      </p>

      {HUB_GROUPS.map((group) => {
        const items = group.slugs.map((s) => GUIDES.find((g) => g.slug === s)).filter(Boolean)
        return (
          <section key={group.title} className="mb-10">
            <h2 className="text-3xl font-hand font-bold mb-1">{group.title}</h2>
            <p className="text-[var(--muted-foreground)] mb-4">{group.text}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((guide) => (
                <Link key={guide.slug} to={`/guides/${guide.slug}`} className="block h-full">
                  <WobblyCard hover padding="p-6" className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl shrink-0">{guide.emoji}</div>
                      <div>
                        <h3 className="text-2xl font-hand font-bold mb-2">{guide.title}</h3>
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
          </section>
        )
      })}

      <section className="mb-10">
        <h2 className="text-3xl font-hand font-bold mb-3">השוואות שיעזרו להחליט</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/compare/home-vs-venue" className="btn-secondary">בית או אולם?</Link>
          <Link to="/compare/entertainer-vs-diy" className="btn-secondary">מפעיל או הפעלה עצמית?</Link>
          <Link to="/calculator" className="btn-secondary">מחשבון תקציב למסיבה</Link>
        </div>
      </section>

      <section className="mb-10 max-w-3xl">
        <h2 className="text-3xl font-hand font-bold mb-4">שאלות נפוצות</h2>
        <div className="space-y-4">{HUB_FAQ.map((f) => <div key={f.q}><h3 className="font-bold text-lg">{f.q}</h3><p className="leading-relaxed text-[var(--foreground)]/80">{f.a}</p></div>)}</div>
      </section>

      <section className="mt-12">
        <WobblyCard hover={false} padding="p-6" className="bg-yellow-50">
          <h2 className="text-2xl font-hand font-bold mb-3">רוצים משהו פרקטי עכשיו?</h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            אם אתם באמצע הכנה למסיבה או שיעור, התחילו מכלי מוכן: טריוויה, בוגה טאון, חדר בריחה, בינגו או חפש את המטמון.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/tools/trivia-quiz" className="btn-primary">טריוויה</Link>
            <Link to="/tools/buga-town" className="btn-secondary">בוגה טאון</Link>
            <Link to="/tools/escape-rooms" className="btn-secondary">חדרי בריחה</Link>
            <Link to="/tools/bingo-maker" className="btn-secondary">מחולל בינגו</Link>
            <Link to="/tools/scavenger-hunt-maker" className="btn-secondary">ציד אוצרות</Link>
            <Link to="/tools/team-generator" className="btn-secondary">חלוקה לקבוצות</Link>
          </div>
        </WobblyCard>
      </section>
    </div>
  )
}
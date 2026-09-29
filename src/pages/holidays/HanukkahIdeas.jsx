import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { HANUKKAH_IDEAS } from '../../data/hanukkah'

const FAQ = [
  { q: 'מה עושים עם ילדים בחופשת חנוכה בבית?', a: 'טורניר סביבונים, חידון חנוכה משפחתי, הכנת סופגניות, יצירה, חדר בריחה ביתי וערב משחקי לוח. כל הרעיונות בעמוד — עם קישורים למשחקים ולדפים שמוכנים באתר.' },
  { q: 'מה עושים בחנוכה כשיורד גשם?', a: 'רוב הרעיונות ברשימת "בבית" לא צריכים ציוד מיוחד. אפשר לשלב: בוקר של יצירה ודפי צביעה, צהריים של משחק סביבון, ערב של חידון אחרי הדלקת נרות.' },
]

export default function HanukkahIdeas() {
  const total = HANUKKAH_IDEAS.reduce((n, g) => n + g.items.length, 0)
  return (
    <HanukkahShell crumb="מה עושים בחנוכה">
      <SEO title="מה עושים עם הילדים בחנוכה? רעיונות לחופשת חנוכה" description={`${total} רעיונות מה עושים עם ילדים בחופשת חנוכה — בבית, בחוץ ובדרך: טורניר סביבונים, חידון, סופגניות, יצירה, ציד מטמון ועוד. עם משחקים ודפים מוכנים.`} path="/holidays/hanukkah/what-to-do" structuredData={faqSchema(FAQ)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">💡 מה עושים עם הילדים בחנוכה?</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">{total} רעיונות לחופשה — בבית, בחוץ ובדרך</p>
      {HANUKKAH_IDEAS.map(g => <section key={g.group} className="mb-8">
        <h2 className="text-3xl font-bold mb-3">{g.group}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {g.items.map(it => <div key={it.t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4">
            <h3 className="text-xl font-bold mb-1">{it.t}</h3>
            <p className="text-[var(--muted-foreground)]">{it.d}</p>
            {it.to && <Link to={it.to} className="mt-2 inline-block font-bold text-[var(--pen)] underline decoration-dashed">לפתוח ←</Link>}
          </div>)}
        </div>
      </section>)}
      <SeoBody
        paragraphs={['שמונה ימי חנוכה הם הזדמנות לזמן משפחתי: הדלקת נרות בערב, ובמשך היום — משחקים, יצירה וטיולים קצרים. אספנו כאן רעיונות שעובדים עם ילדים בגילאי גן ובית ספר, רובם בלי ציוד מיוחד ובלי עלות.']}
        faq={FAQ}
        related={[{ label: 'סביבון וירטואלי', href: '/holidays/hanukkah/sevivon' }, { label: 'מסיבת חנוכה', href: '/ideas/hanukkah-party' }, { label: 'משחקים בלי ציוד', href: '/games/no-equipment' }]}
      />
    </HanukkahShell>
  )
}

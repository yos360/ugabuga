import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { PARTY_KITS } from '../../data/ideaArticlesExpanded'

const rotations = ['-rotate-[0.6deg]', 'rotate-[0.5deg]', '-rotate-[0.3deg]', 'rotate-[0.7deg]']

const faq = [
  { q: 'איך בוחרים נושא למסיבת יום הולדת?', a: 'מתחילים ממה שהילד אוהב עכשיו — כדורגל, חלל, משחקי מחשב או נסיכות — ובודקים שהנושא מתאים לגיל ולמקום. נושא טוב נותן כיוון לקישוט, למשחקים ולעוגה בלי לקנות הרבה.' },
  { q: 'כמה עולה מסיבת נושא?', a: 'רוב הערכות כאן בנויות לתקציב חסכוני או מאוזן: קישוט מנייר, משחקים בלי ציוד מיוחד ודפים להדפסה בחינם. ההוצאה העיקרית היא בדרך כלל אוכל ועוגה.' },
  { q: 'מה כוללת כל ערכת נושא?', a: 'בכל ערכה יש רעיונות לעיצוב, משחקים מתאימים, אוכל ועוגה ולו״ז קצר של כשעה וחצי — נקודת פתיחה שאפשר להתאים לגיל ולמספר הילדים.' },
]

export default function ThemesHub() {
  const themes = Object.entries(PARTY_KITS)
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO
        title="מסיבות יום הולדת לפי נושא — ערכות מוכנות"
        description={`${themes.length} ערכות נושא למסיבת יום הולדת: כדורגל, גיימינג, חלל, בלשים, מדע, נסיכות וחפש את המטמון — עיצוב, משחקים, אוכל ולו״ז לכל נושא.`}
        path="/ideas/themes"
        structuredData={[
          faqSchema(faq),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'itemListElement': themes.map(([slug, theme], i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': theme.name, 'url': 'https://ugabuga.co.il/ideas/themes/' + slug })),
          },
        ]}
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: 'ערכות נושא' }]} />
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl">🎨 מסיבות יום הולדת לפי נושא</h1>
        <p className="mx-auto mt-3 max-w-2xl text-xl text-[var(--muted-foreground)]">בחרו נושא וקבלו ערכה מלאה: קישוט, משחקים, אוכל ועוגה ולו״ז מוכן להפעלה.</p>
      </div>

      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map(([slug, theme], index) => (
          <Link key={slug} to={'/ideas/themes/' + slug} className={`h-full card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${rotations[index % rotations.length]}`}>
            <span className="text-4xl">{theme.emoji}</span>
            <h2 className="mt-3 text-2xl font-bold leading-tight">{theme.name}</h2>
            <p className="mt-2 text-base text-[var(--foreground)]/75">{theme.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge>גיל {theme.age}</Badge>
              <Badge color="yellow">תקציב {theme.budget}</Badge>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <SeoBody
          paragraphs={[
            'מסיבת נושא היא הדרך הקלה לתת ליום הולדת סיפור: הילדים נכנסים לאצטדיון, לתחנת חלל או לזירת חקירה, וכל משחק הופך לחלק מהעלילה. לא צריך להשקיע בתפאורה — כמה שלטים מודפסים, צבעים קבועים ומשחק פתיחה טוב עושים את רוב העבודה.',
            'כל ערכה כאן נכתבה להורים שמארגנים לבד, בבית, בחצר או בפארק. אפשר לקחת אותה כמו שהיא, או לשלב ממנה רק את המשחקים ולהוסיף דפים להדפסה ומשחקים מהמאגר.',
          ]}
          faq={faq}
          related={[
            { label: 'רעיונות ליום הולדת לפי גיל', href: '/ideas/age/7' },
            { label: 'משחקים ליום הולדת', href: '/games/birthday' },
            { label: 'שלטים להדפסה', href: '/printables/birthday-signs' },
            { label: 'מדריך יום הולדת בבית', href: '/guides/birthday-at-home-complete' },
          ]}
        />
      </div>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import WobblyCard from '../../components/ui/WobblyCard'
import Badge from '../../components/ui/Badge'
import ComparisonPage from '../compare/ComparisonPage'
import { IDEA_ARTICLES, IDEA_GROUPS, PARTY_KITS } from '../../data/ideaArticlesExpanded'
import { AGE_IDEA_LIST } from '../../data/ideaArticlesAges'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

const ideasFaq = [
  { q: 'איך בוחרים בין כמה רעיונות שנראים מתאימים?', a: 'מתחילים מהאילוץ הכי נוקשה (מקום או תקציב), ולא מהרעיון הכי מלהיב — זה מצמצם את האפשרויות למה שבאמת ישים.' },
  { q: 'האם הרעיונות כאן מתאימים גם לאירועים שלא יום הולדת?', a: 'בהחלט — חלק גדול מהרעיונות מתאימים גם לאירועי כיתה, מפגשי משפחה, וימי גיבוש.' },
]
const ideasBody = [
  'לפעמים הבעיה היא לא חוסר במשחקים, אלא חוסר בכיוון — יש מסיבה בעוד שבוע ולא ברור מאיפה להתחיל. הדרך הכי יעילה להשתמש בעמוד הזה היא לא לחפש "רעיון מושלם", אלא לצמצם אפשרויות בהדרגה: מקום, תקציב וגיל.',
  'מזג אוויר הוא שיקול נוסף שכדאי לבדוק כבר בשלב התכנון. עולם ההשראה משמש הכי טוב כשלב הראשון בתכנון — אחרי שמצמצמים לכיוון ברור, עוברים לרשימות המשחקים הספציפיות כדי לבחור בפועל מה לשחק.',
]
const ideasRelated = [ { label: 'יום הולדת בבית', href: '/ideas/at-home' }, { label: 'מה עושים ביום גשום', href: '/ideas/what-to-do-rainy-day' }, { label: 'משחקי יום הולדת', href: '/games/birthday' } ]

export default function IdeasHub() {
  const location = useLocation()
  const themes = Object.entries(PARTY_KITS)

  // /compare/* pages: content in src/data/compare.js, layout in src/pages/compare/ComparisonPage.jsx
  if (location.pathname.startsWith('/compare/')) return <ComparisonPage path={location.pathname} />

  if (location.pathname === '/blog') {
    const articles = Object.entries(IDEA_ARTICLES).slice(0, 12)
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
        <SEO title="בלוג עוגה בוגה" description="הבלוג של עוגה בוגה: מדריכים, רעיונות וטיפים לתכנון ימי הולדת, מסיבות כיתה, פעילויות לצהרון ומשחקים למשפחה — בעברית, חינם." path="/blog" />
        <h1 className="text-4xl md:text-5xl text-center mb-2">📝 הבלוג של עוגה בוגה</h1>
        <p className="text-center text-xl text-[var(--ink)]/70 mb-10">מדריכים ורעיונות שאפשר לקחת ישר למסיבה.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map(([slug, article]) => <Link key={slug} to={'/ideas/' + slug} className="card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich"><span className="text-4xl">{article.emoji}</span><h2 className="mt-3 text-2xl font-bold">{article.title}</h2><p className="mt-2 text-[var(--muted-foreground)]">{article.description}</p><span className="mt-4 inline-block font-bold text-[var(--pen)]">לקריאה ←</span></Link>)}</div>
      </div>
    )
  }

  if (location.pathname === '/birthday-songs' || location.pathname === '/songs/birthday-songs') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
        <SEO title="שירי יום הולדת — פלייליסט למסיבה" description="שירי יום הולדת למסיבה, לילדים ולמשפחה — נגנו ישירות באתר." path="/birthday-songs" />
        <h1 className="text-4xl md:text-5xl text-center mb-3">🎵 שירי יום הולדת</h1>
        <p className="text-center text-xl text-[var(--ink)]/70 mb-8">פלייליסט מוכן להפעלה במסיבה — פשוט לוחצים על נגן ומתחילים.</p>
        <WobblyCard hover={false} padding="p-4" className="bg-[var(--postit)]">
          <iframe title="פלייליסט שירי יום הולדת ב-Spotify" src="https://open.spotify.com/embed/playlist/3tvl1eEMexX91MJXIPaMTN?utm_source=generator" width="100%" height="500" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl" />
        </WobblyCard>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">הנגן מופעל דרך Spotify. ייתכן שתידרש התחברות לחשבון Spotify.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="רעיונות לאירוע ולמסיבה" description="רעיונות ליום הולדת — לפי נושא, גיל, מקום ותקציב. ערכות מסיבה מלאות עם עיצוב, אוכל, משחקים ולו״ז." path="/ideas" structuredData={faqSchema(ideasFaq)} />
      <h1 className="text-4xl md:text-5xl text-center mb-2">🎭 עולם ההשראה</h1>
      <p className="text-center text-xl text-[var(--ink)]/70 mb-10">רעיונות, ערכות מסיבה ותוכניות מוכנות שאפשר להפעיל מיד.</p>

      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="font-hand text-base text-[var(--muted-foreground)]">רוצים מסיבה עם אופי?</p>
            <h2 className="text-3xl">ערכות נושא מוכנות</h2>
          </div>
          <Link to="/ideas/themes" className="hidden font-display text-lg font-bold text-[var(--pen)] underline decoration-dashed sm:inline">כל הערכות ←</Link>
        </div>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {themes.map(([slug, theme], index) => (
            <Link key={slug} to={'/ideas/themes/' + slug} className={`h-full card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${rotations[index % rotations.length]}`}>
              <span className="text-4xl">{theme.emoji}</span>
              <h3 className="mt-3 text-xl font-bold leading-tight">{theme.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--foreground)]/75">{theme.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge>{theme.age}</Badge>
                <Badge color="yellow">{theme.budget}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {IDEA_GROUPS.map(group => (
          <WobblyCard key={group.title} hover={false} className="h-full">
            <h2 className="text-2xl mb-4">{group.title}</h2>
            <div className="grid gap-3">
              {group.items.map(slug => {
                const article = IDEA_ARTICLES[slug]
                if (!article) return null
                return (
                  <Link key={slug} to={'/ideas/' + slug} className="group flex min-h-[64px] items-center gap-3 border-b border-dashed border-[var(--border)] py-2 last:border-b-0">
                    <span className="text-2xl">{article.emoji}</span>
                    <span>
                      <span className="block font-display text-lg font-bold leading-tight group-hover:text-[var(--pen)]">{article.title}</span>
                      <span className="line-clamp-1 text-sm text-[var(--muted-foreground)]">{article.description}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </WobblyCard>
        ))}
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-3xl mb-2">מתכננים לפי גיל?</h2>
        <p className="mb-4 text-lg text-[var(--foreground)]/75">לכל גיל: כמה זמן ומי להזמין, לו״ז לדוגמה, משחקים מתאימים ומה כדאי להימנע ממנו.</p>
        <div className="flex snap-x gap-3 overflow-x-auto px-1 pb-3 sm:justify-center">
          {AGE_IDEA_LIST.map((age, i) => (
            <Link key={age} to={'/ideas/age/' + age}
              className={`card-lift flex h-20 w-20 shrink-0 snap-start items-center justify-center wobbly-sm border-[3px] border-[var(--border)] ${i % 2 ? 'bg-white rotate-1' : 'bg-[var(--postit)] -rotate-1'} font-display text-3xl font-bold sketch-shadow-sm`}>
              <span className="sr-only">רעיונות ליום הולדת גיל </span>{age}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <SeoBody paragraphs={ideasBody} faq={ideasFaq} related={ideasRelated} />
      </div>
    </div>
  )
}

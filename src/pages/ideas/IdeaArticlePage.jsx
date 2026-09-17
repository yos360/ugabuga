import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import WobblyCard from '../../components/ui/WobblyCard'
import { IDEA_ARTICLES } from '../../data/ideaArticlesExpanded'

export default function IdeaArticlePage() {
  const { slug } = useParams()
  const article = IDEA_ARTICLES[slug]

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <SEO title="רעיון לא נמצא" path={'/ideas/' + slug} />
        <h1 className="text-4xl mb-4">הרעיון לא נמצא</h1>
        <Link to="/ideas" className="font-display text-xl font-bold text-[var(--pen)] underline decoration-dashed">חזרה לעולם ההשראה ←</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title={article.title} description={article.description} path={'/ideas/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: article.title }]} />

      <div className="text-center mb-8">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--postit)] text-5xl sketch-shadow-sm">{article.emoji}</span>
        <h1 className="mt-5 text-4xl sm:text-5xl">{article.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--foreground)]/75">{article.description}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge color="yellow">{article.audience}</Badge>
          <Badge color="blue">תקציב: {article.budget}</Badge>
        </div>
      </div>

      <div className="grid gap-5">
        {article.sections.map((section, index) => (
          <WobblyCard key={section.title} hover={false} className={index % 2 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'}>
            <h2 className="text-2xl mb-3">{section.title}</h2>
            <p className="text-lg leading-relaxed text-[var(--foreground)]/85">{section.body}</p>
          </WobblyCard>
        ))}
      </div>

      {article.tips?.length > 0 && (
        <div className="wobbly relative mt-8 border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow pin">
          <h2 className="text-2xl mb-4">טיפים קטנים שעושים סדר</h2>
          <ul className="grid gap-3 font-hand text-lg">
            {article.tips.map(tip => <li key={tip}>• {tip}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)]">מצאו משחקים מתאימים</Link>
        <Link to="/printables" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold">דפים להדפסה</Link>
      </div>
    </div>
  )
}
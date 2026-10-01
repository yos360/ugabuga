import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import { QUESTION_PAGES } from '../../data/content'

export function QuestionsHub() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="רשימות שאלות — להיכרות, לשיחה, לגיבוש ו'מה הייתם מעדיפים'" description={`${QUESTION_PAGES.length} רשימות של 30 שאלות: היכרות לילדים ולנוער, שיחה בארוחה, גיבוש צוות, נסיעה ארוכה ו'מה הייתם מעדיפים' — מוכנות לשימוש.`} path="/questions" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'רשימות שאלות' }]} />
      <h1 className="text-4xl md:text-5xl text-center font-hand font-bold mb-8">💬 רשימות שאלות</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUESTION_PAGES.map(p => <Link key={p.slug} to={'/questions/' + p.slug} className="block"><WobblyCard hover padding="p-4" className="h-full"><div className="text-3xl">{p.emoji}</div><h2 className="font-hand font-bold text-xl">{p.title}</h2><p className="text-sm text-[var(--muted-foreground)]">{p.intro}</p></WobblyCard></Link>)}
      </div>
    </div>
  )
}

export default function QuestionsPage() {
  const { slug } = useParams()
  const p = QUESTION_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  let n = 0
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title + ' — 30 שאלות מוכנות'} description={p.description} path={'/questions/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'רשימות שאלות', href: '/questions' }, { label: p.title }]} />
      <header className="text-center mb-6">
        <div className="text-6xl mb-2">{p.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-2">{p.title}</h1>
        <p className="text-lg">{p.intro}</p>
      </header>
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]">
        <h2 className="text-xl font-bold mb-2">איך משתמשים</h2>
        <ul className="list-disc pr-5 space-y-1">{p.howTo.map(t => <li key={t}>{t}</li>)}</ul>
      </WobblyCard>
      {p.groups.map(g => (
        <section key={g.title} className="mb-6">
          <h2 className="text-2xl font-bold mb-3">{g.title}</h2>
          <ol className="space-y-2">{g.questions.map(q => { n += 1; return <li key={q} className="wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-3 text-lg"><b>{n}.</b> {q}</li> })}</ol>
        </section>
      ))}
      <div className="text-center my-6"><button onClick={() => window.print()} className="btn-secondary">🖨️ הדפסת הרשימה</button></div>
      <section className="mt-8">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד רשימות</h2>
        <div className="flex flex-wrap gap-2">{QUESTION_PAGES.filter(x => x.slug !== slug).map(o => <Link key={o.slug} to={'/questions/' + o.slug} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{o.emoji} {o.title}</Link>)}</div>
      </section>
    </div>
  )
}

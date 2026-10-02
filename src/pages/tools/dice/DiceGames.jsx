import { Link, useParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import WobblyCard from '../../../components/ui/WobblyCard'
import Badge from '../../../components/ui/Badge'
import NotFound from '../../NotFound'
import { DICE_GAMES, DICE_GAME_BY_SLUG } from '../../../data/diceGames'
import DiceFamilyLinks from './DiceFamilyLinks'

export function DiceGamesIndex() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="משחקי קוביות — חוקים ל-6 משחקים עם קובייה" description="משחקי קוביות לכל המשפחה ולכיתה: חזיר, ספינה קברניט וצוות, נוסעים לבוסטון, ציור החיפושית, 21 ומרוץ תרגילים — חוקים ברורים וקובייה אונליין." path="/dice-games" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קובייה', href: '/tools/dice' }, { label: 'משחקי קוביות' }]} />
      <h1 className="text-4xl md:text-5xl text-center font-hand font-bold mb-2">🎲 משחקי קוביות</h1>
      <p className="text-center text-lg text-[var(--muted-foreground)] mb-8">משחקים שצריך בשבילם רק קובייה — וגם אותה יש לכם כאן באתר.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DICE_GAMES.map(g => (
          <Link key={g.slug} to={'/dice-games/' + g.slug} className="block">
            <WobblyCard hover padding="p-5" className="h-full">
              <div className="text-4xl mb-2">{g.emoji}</div>
              <h2 className="font-hand font-bold text-2xl mb-1">{g.title}</h2>
              <p className="text-[var(--muted-foreground)] mb-3">{g.intro}</p>
              <div className="flex flex-wrap gap-2"><Badge>{g.dice} {g.dice === 1 ? 'קובייה' : 'קוביות'}</Badge><Badge color="yellow">גיל {g.ages}</Badge><Badge color="blue">{g.time}</Badge></div>
            </WobblyCard>
          </Link>
        ))}
      </div>
      <DiceFamilyLinks current="/dice-games" />
    </div>
  )
}

export function DiceGamePage() {
  const { slug } = useParams()
  const g = DICE_GAME_BY_SLUG[slug]
  if (!g) return <NotFound />
  const schema = { '@context': 'https://schema.org', '@type': 'HowTo', name: 'איך משחקים ' + g.title, step: g.rules.map((r, i) => ({ '@type': 'HowToStep', position: i + 1, text: r })) }
  const others = DICE_GAMES.filter(x => x.slug !== slug)
  return (
    <article className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={g.title + ' — חוקי המשחק'} description={g.description} path={'/dice-games/' + slug} structuredData={schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי קוביות', href: '/dice-games' }, { label: g.title }]} />
      <header className="text-center mb-6">
        <div className="text-6xl mb-2">{g.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">{g.title}</h1>
        <p className="text-lg">{g.intro}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4"><Badge>{g.dice} {g.dice === 1 ? 'קובייה' : 'קוביות'}</Badge><Badge color="yellow">שחקנים: {g.players}</Badge><Badge color="yellow">גיל {g.ages}</Badge><Badge color="blue">{g.time}</Badge></div>
      </header>
      <WobblyCard hover={false} padding="p-6">
        <h2 className="text-2xl font-hand font-bold mb-3">חוקי המשחק</h2>
        <ol className="list-decimal pr-6 space-y-2 text-lg">{g.rules.map(r => <li key={r}>{r}</li>)}</ol>
      </WobblyCard>
      <div className="text-center my-6"><Link to={g.tool} className="wobbly-md sketch-press inline-flex min-h-[52px] items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-8 py-2 font-display text-xl font-bold text-[var(--accent-foreground)]">🎲 פתחו קובייה ושחקו עכשיו</Link></div>
      <WobblyCard hover={false} padding="p-5" className="bg-[var(--postit)]">
        <h2 className="text-xl font-hand font-bold mb-2">טיפים</h2>
        <ul className="list-disc pr-5 space-y-1">{g.tips.map(t => <li key={t}>{t}</li>)}</ul>
      </WobblyCard>
      <section className="mt-8">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד משחקי קוביות</h2>
        <div className="flex flex-wrap gap-2">{others.map(o => <Link key={o.slug} to={'/dice-games/' + o.slug} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{o.emoji} {o.title}</Link>)}</div>
      </section>
      <DiceFamilyLinks />
    </article>
  )
}

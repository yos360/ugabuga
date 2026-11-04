import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import { EXPERT_POSTS } from '../../data/blogPosts'
import ExpertsInvite from './ExpertsInvite'

const fmt = d => d.split('-').reverse().join('.')

// Hub for guest articles: people who teach a craft or a skill write for parents, grandparents and teachers.
export default function Experts() {
  const posts = [...EXPERT_POSTS].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="המומחים של עוגה בוגה — מאמרים של אנשים שמלמדים" description="מאמרים מעשיים של מומחים אמיתיים: סריגה, יצירה, בישול, מוזיקה ועוד — איך מלמדים ילדים ונכדים, מאיזה גיל ומה צריך. מומחים מוזמנים לכתוב אצלנו." path="/experts" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בלוג', href: '/blog' }, { label: 'המומחים של עוגה בוגה' }]} />
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">🎓 המומחים של עוגה בוגה</h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">אנשים שמלמדים משהו שהם אוהבים כותבים כאן מאמרים מעשיים להורים, לסבים ולסבתות ולמורות: מה עושים עם הילדים, מאיזה גיל ואיך מתחילים.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-5">
        {posts.map(post => (
          <Link key={post.slug} to={'/blog/' + post.slug} className="block">
            <WobblyCard hover padding="p-5" className="h-full">
              <div className="text-4xl mb-2">{post.emoji}</div>
              <p className="text-sm text-[var(--muted-foreground)]">{fmt(post.date)} · {post.minutes} דקות קריאה · {post.guest.name}, {post.guest.role}</p>
              <h2 className="font-hand font-bold text-2xl my-1">{post.title}</h2>
              <p className="text-[var(--muted-foreground)]">{post.description}</p>
            </WobblyCard>
          </Link>
        ))}
      </div>
      <ExpertsInvite full />
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">המאמרים כאן נכתבו על ידי הכותבים ששמם מופיע בהם, ונערכו על ידי צוות עוגה בוגה. <Link to="/editorial-policy" className="underline">מדיניות העריכה שלנו</Link></p>
    </div>
  )
}

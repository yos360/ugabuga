import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import { BLOG_POSTS } from '../../data/blogPosts'

const fmt = d => d.split('-').reverse().join('.')

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="הבלוג של עוגה בוגה — רעיונות, טיפים ומשחקים לילדים" description="מאמרים קצרים ומעשיים להורים, מורים ומארגני מסיבות: משחקים, ימי הולדת, חופשות וזמן איכות עם ילדים." path="/blog" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בלוג' }]} />
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">📝 הבלוג</h1>
        <p className="text-lg text-[var(--muted-foreground)]">טיפים, רעיונות ומחשבות על משחק, מסיבות וזמן עם ילדים.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-5">
        {posts.map(post => (
          <Link key={post.slug} to={'/blog/' + post.slug} className="block">
            <WobblyCard hover padding="p-5" className="h-full">
              <div className="text-4xl mb-2">{post.emoji}</div>
              <p className="text-sm text-[var(--muted-foreground)]">{fmt(post.date)} · {post.minutes} דקות קריאה</p>
              <h2 className="font-hand font-bold text-2xl my-1">{post.title}</h2>
              <p className="text-[var(--muted-foreground)]">{post.description}</p>
            </WobblyCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

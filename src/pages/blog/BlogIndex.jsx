import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import { BLOG_POSTS, DAILY_POSTS } from '../../data/blogPosts'

const fmt = d => d.split('-').reverse().join('.')

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
  const daily = [...DAILY_POSTS].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="הבלוג של עוגה בוגה — רעיונות, טיפים ומשחקים לילדים" description="מאמרים קצרים ומעשיים להורים, מורים ומארגני מסיבות: משחקים, ימי הולדת, חופשות וזמן איכות עם ילדים." path="/blog" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בלוג' }]} />
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">📝 הבלוג</h1>
        <p className="text-lg text-[var(--muted-foreground)]">טיפים, רעיונות ומחשבות על משחק, מסיבות וזמן עם ילדים.</p>
      </header>
      {daily.length > 0 && <section className="mb-10" aria-labelledby="daily-blog">
        <h2 id="daily-blog" className="font-hand font-bold text-3xl mb-1">🗞️ הבלוג היומי</h2>
        <p className="mb-4 text-[var(--muted-foreground)]">בכל יום שעולה משהו חדש לאתר — פוסט קצר שמראה מה עלה.</p>
        <ul className="grid gap-2 sm:grid-cols-2">{daily.slice(0, 8).map(post => <li key={post.slug}>
          <Link to={'/blog/' + post.slug} className="flex min-h-[48px] items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-2 font-bold hover:-translate-y-0.5 transition-transform">
            <span className="text-sm font-normal text-[var(--muted-foreground)]">{fmt(post.date)}</span><span>{post.description.replace(/^מה עלה לאתר ב־[^:]+: /, '')}</span>
          </Link></li>)}</ul>
      </section>}
      <Link to="/experts" className="mb-10 flex min-h-[48px] items-center gap-3 rounded-3xl border-2 border-amber-200 bg-amber-50 px-5 py-4 hover:-translate-y-0.5 transition-transform">
        <span className="text-4xl">🎓</span>
        <span><span className="block font-hand font-bold text-2xl">המומחים של עוגה בוגה</span><span className="text-[var(--muted-foreground)]">מאמרים של אנשים שמלמדים משהו שהם אוהבים — ומקום לכתוב אצלנו ←</span></span>
      </Link>
      <h2 className="font-hand font-bold text-3xl mb-4">מאמרים</h2>
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

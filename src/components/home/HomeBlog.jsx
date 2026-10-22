import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// "From the blog" on the home page: the three newest posts. The post data is loaded only when this
// section is reached, so it never weighs on the home page's first load.
const fmt = d => d.split('-').reverse().join('.')

export default function HomeBlog() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    let alive = true
    import('../../data/blogPosts').then(m => { if (alive) setPosts([...m.BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)) }).catch(() => {})
    return () => { alive = false }
  }, [])
  if (!posts.length) return null
  return <section className="home-extra" aria-labelledby="home-blog-title">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="home-blog-title">📰 חדש בבלוג</h2><Link to="/blog" className="font-bold underline">לכל הפוסטים ←</Link></div>
    <div className="grid gap-4 sm:grid-cols-3">
      {posts.map(p => <Link key={p.slug} to={`/blog/${p.slug}`} className="rounded-3xl border border-[#eeeef4] bg-white p-5 shadow-sm transition hover:-translate-y-1">
        <div className="text-4xl">{p.emoji}</div>
        <p className="mt-1 text-sm text-[#7b8397]">{fmt(p.date)} · {p.minutes} דקות קריאה</p>
        <h3 className="mt-1 text-xl font-bold">{p.title}</h3>
        <p className="mt-1 text-[15px] text-[#657187]">{p.description}</p>
      </Link>)}
    </div>
  </section>
}

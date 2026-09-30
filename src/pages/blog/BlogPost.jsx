import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { BLOG_BY_SLUG, BLOG_POSTS } from '../../data/blogPosts'
import NotFound from '../NotFound'

const fmt = d => d.split('-').reverse().join('.')

export default function BlogPost() {
  const { slug } = useParams()
  const post = BLOG_BY_SLUG[slug]
  if (!post) return <NotFound />
  const more = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3)
  const schema = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description: post.description, datePublished: post.date,
    mainEntityOfPage: 'https://ugabuga.co.il/blog/' + slug,
    author: { '@type': 'Organization', name: 'עוגה בוגה' },
  }
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <SEO title={post.title} description={post.description} path={'/blog/' + slug} type="article" structuredData={schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בלוג', href: '/blog' }, { label: post.title }]} />
      <header className="text-center mb-8">
        <div className="text-6xl mb-4">{post.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-4">{post.title}</h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">{post.description}</p>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">{fmt(post.date)} · {post.minutes} דקות קריאה</p>
      </header>
      <WobblyCard hover={false} padding="p-6 md:p-8">
        <div className="space-y-8 leading-relaxed text-lg">
          {post.sections.map(section => (
            <section key={section.title}>
              <h2 className="text-2xl md:text-3xl font-hand font-bold mb-3">{section.title}</h2>
              {section.body?.map(t => <p key={t} className="mb-3">{t}</p>)}
              {section.list && <ul className="space-y-2 list-none pr-0">{section.list.map(i => <li key={i} className="flex gap-3"><span className="mt-1">⭐</span><span>{i}</span></li>)}</ul>}
            </section>
          ))}
        </div>
      </WobblyCard>
      {post.relatedLinks?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-hand font-bold mb-4">קישורים שימושיים</h2>
          <div className="flex flex-wrap gap-3">{post.relatedLinks.map(l => <Link key={l.href} to={l.href} className="btn-secondary">{l.label}</Link>)}</div>
        </section>
      )}
      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-hand font-bold mb-4">עוד מהבלוג</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {more.map(p => (
            <Link key={p.slug} to={'/blog/' + p.slug} className="block">
              <WobblyCard hover padding="p-4" className="h-full">
                <div className="text-3xl mb-2">{p.emoji}</div>
                <h3 className="font-hand font-bold text-xl mb-1">{p.title}</h3>
              </WobblyCard>
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}

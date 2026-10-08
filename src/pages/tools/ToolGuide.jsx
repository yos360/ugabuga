import { Link } from 'react-router-dom'

// Explanatory block shown under a small tool (coin, joke, scoreboard...): what it is good for,
// how to use it, game ideas, FAQ and related tools. Each page passes its own copy, so the text
// is page-specific; pass the same `faq` to <SEO structuredData={faqSchema(faq)}>.
export default function ToolGuide({ title, intro = [], steps = [], ideasTitle = 'רעיונות למשחקים', ideas = [], tips = [], faq = [], related = [] }) {
  return (
    <section className="mt-12 space-y-8 text-right" aria-label={title}>
      {title && <h2 className="text-2xl font-display font-bold">{title}</h2>}
      {intro.map((p, i) => <p key={i} className="leading-relaxed text-[var(--foreground)]/85">{p}</p>)}
      {steps.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-2">איך משתמשים</h3>
          <ol className="list-decimal pr-5 space-y-1 leading-relaxed">{steps.map(s => <li key={s}>{s}</li>)}</ol>
        </div>
      )}
      {ideas.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-2">{ideasTitle}</h3>
          <ul className="space-y-3">{ideas.map(([name, text]) => (
            <li key={name} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-3"><strong className="block">{name}</strong><span className="leading-relaxed">{text}</span></li>
          ))}</ul>
        </div>
      )}
      {tips.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-2">טיפים קטנים</h3>
          <ul className="list-disc pr-5 space-y-1 leading-relaxed">{tips.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      {faq.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-3">שאלות נפוצות</h3>
          <div className="space-y-3">{faq.map(item => (
            <div key={item.q}><p className="font-bold">{item.q}</p><p className="leading-relaxed text-[var(--foreground)]/85">{item.a}</p></div>
          ))}</div>
        </div>
      )}
      {related.length > 0 && (
        <nav aria-label="כלים קשורים">
          <h3 className="text-xl font-bold mb-2">כלים שהולכים טוב ביחד</h3>
          <ul className="grid sm:grid-cols-2 gap-2">{related.map(([label, href, note]) => (
            <li key={href}><Link to={href} className="block h-full wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-3 hover:bg-[var(--postit)]"><strong>{label}</strong>{note && <span className="block text-sm text-[var(--muted-foreground)]">{note}</span>}</Link></li>
          ))}</ul>
        </nav>
      )}
    </section>
  )
}

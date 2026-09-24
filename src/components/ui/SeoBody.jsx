import { Link } from 'react-router-dom'

// Reusable long-form SEO body block: paragraphs + FAQ + related links.
// Used on pages that don't have their own body-copy section yet.
export default function SeoBody({ paragraphs = [], faq = [], related = [] }) {
  return (
    <div className="max-w-3xl mt-2">
      {paragraphs.length > 0 && (
        <div className="space-y-4 mb-8">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-[var(--foreground)]/80">{p}</p>
          ))}
        </div>
      )}
      {faq.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">שאלות נפוצות</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i}>
                <p className="font-bold text-[var(--foreground)]">{item.q}</p>
                <p className="text-[var(--foreground)]/80 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {related.length > 0 && (
        <p className="text-[var(--foreground)]/80 leading-relaxed">
          {'שווה להסתכל גם על '}
          {related.map((r, i) => (
            <span key={r.href}>
              <Link to={r.href} className="underline font-bold">{r.label}</Link>
              {i < related.length - 1 ? (i === related.length - 2 ? ', ו' : ', ') : '.'}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

export function faqSchema(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faq.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': item.a }
    }))
  }
}

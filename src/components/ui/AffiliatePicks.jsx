import { useLocation } from 'react-router-dom'
import { affiliateForPath, AFFILIATE_LABEL, AFFILIATE_NOTE } from '../../data/affiliate'
import { logSponsorClick } from '../../utils/liveActivity'

// A small, clearly marked box of AliExpress affiliate picks for the page's topic (see
// data/affiliate.js). Renders nothing until the topic has real products. Hidden in print.
function trackClick(topic, product) {
  try { if (typeof window.gtag === 'function') window.gtag('event', 'affiliate_click', { topic: topic.id, product: product.name, page_path: window.location.pathname }) } catch { /* ignore */ }
  try { logSponsorClick(`ali-${topic.id}`) } catch { /* ignore */ }
}

// The marked box itself — also used by the buying guides (/recommended/<topic>) for their full grid.
export function AffiliateGrid({ topic, products, title = topic.title, as: Heading = 'p', id }) {
  if (!products?.length) return null
  return (
    <aside id={id} className="affiliate-picks no-print mx-auto my-10 w-full max-w-3xl border-2 border-[var(--border)] bg-[var(--card)] px-4 pb-4 pt-3 wobbly sketch-shadow" dir="rtl" aria-label={`${AFFILIATE_LABEL}: ${title}`}>
      <style>{'@media print{.affiliate-picks{display:none!important}}'}</style>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Heading className="m-0 font-hand text-2xl font-bold">{title}</Heading>
        <span className="rounded-full border border-[var(--border)] bg-[var(--postit)] px-2 py-0.5 text-xs font-bold text-[var(--ink)]">{AFFILIATE_LABEL} · AliExpress</span>
      </div>
      <p className="m-0 mb-3 text-xs text-[var(--muted-foreground)]">{AFFILIATE_NOTE}</p>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
        {products.map(p => <li key={p.url}>
          <a href={p.url} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackClick(topic, p)}
            className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-[var(--border)] bg-white text-[var(--ink)] no-underline transition-transform hover:-translate-y-0.5">
            <img src={p.image} alt={p.name} width="300" height="300" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="block aspect-square w-full object-contain" />
            <span className="flex flex-1 flex-col justify-between gap-1 p-2">
              <span className="text-sm font-bold leading-snug">{p.name}</span>
              <span className="text-xs font-bold text-violet-700">לצפייה במחיר ←</span>
            </span>
          </a>
        </li>)}
      </ul>
    </aside>
  )
}

export default function AffiliatePicks() {
  const { pathname } = useLocation()
  const topic = affiliateForPath(pathname)
  if (!topic) return null
  return <AffiliateGrid topic={topic} products={topic.products} />
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import '../english.css'

// Shared building blocks of the English party, card, board, dice and treasure-hunt pages.
// The "en-rsvp" class keeps the English base styles (Fredoka headings, dark buttons).

const SECTIONS = [
  { href: '/en/party-games', label: 'Party games', emoji: '🎉' },
  { href: '/en/card-games', label: 'Card games', emoji: '🃏' },
  { href: '/en/board-games', label: 'Board games', emoji: '♟️' },
  { href: '/en/dice-games', label: 'Dice games', emoji: '🎲' },
  { href: '/en/treasure-hunt', label: 'Treasure hunts', emoji: '🗺️' },
]

export function Frame({ path, title, description, counterpart, crumbs, h1, emoji, intro, faq = [], paragraphs = [], related = [], structuredData, children }) {
  return <div className="en-rsvp mx-auto max-w-5xl px-4 py-8" dir="ltr" lang="en">
    <SEO lang="en" path={path} title={title} description={description} counterpartPath={counterpart} structuredData={structuredData || (faq.length ? faqSchema(faq) : undefined)} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, ...crumbs]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">{emoji && <span aria-hidden="true">{emoji} </span>}{h1}</h1>
    {(Array.isArray(intro) ? intro : intro ? [intro] : []).map((p, i) => <p key={i} className={i === 0 ? 'text-lg mb-3 max-w-3xl mx-auto' : 'mb-3 max-w-3xl mx-auto'}>{p}</p>)}
    {children}
    {(paragraphs.length > 0 || faq.length > 0) && <div className="mt-10 no-print"><SeoBody lang="en" paragraphs={paragraphs} faq={faq} related={related} /></div>}
    <SectionLinks />
  </div>
}

export function SectionLinks() {
  return <nav className="mt-10 flex flex-wrap justify-center gap-2 no-print" aria-label="More games">
    {SECTIONS.map(s => <Link key={s.href} to={s.href} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold hover:border-violet-400">{s.emoji} {s.label}</Link>)}
  </nav>
}

export const Box = ({ title, children, id }) => <section id={id} className="my-6 rounded-2xl border-2 border-slate-200 bg-white p-5">
  {title && <h2 className="text-2xl mb-3">{title}</h2>}
  {children}
</section>

export const Steps = ({ items, ordered = true }) => ordered
  ? <ol className="list-decimal ps-6 space-y-2">{items.map((s, i) => <li key={i}>{s}</li>)}</ol>
  : <ul className="list-disc ps-6 space-y-2">{items.map((s, i) => <li key={i}>{s}</li>)}</ul>

export const Meta = ({ items }) => <p className="flex flex-wrap justify-center gap-2 my-4">
  {items.filter(x => x && x[1]).map(([icon, text]) => <span key={icon + text} className="rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-sm font-bold">{icon} {text}</span>)}
</p>


// A grid of linked cards: [{ href, emoji, name, sub }]
export function CardGrid({ items }) {
  return <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(g => <li key={g.href}><Link to={g.href} className="block h-full rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-violet-400">
      <b className="text-lg">{g.emoji} {g.name}</b>
      {g.sub && <span className="mt-1 block text-sm text-slate-600">{g.sub}</span>}
    </Link></li>)}
  </ul>
}

export function Chips({ label, links }) {
  return <nav className="my-4 flex flex-wrap items-center gap-2" aria-label={label}>
    <b className="me-1">{label}:</b>
    {links.map(l => <Link key={l.href} to={l.href} className="rounded-full border-2 border-slate-200 bg-white px-3 py-1 text-sm font-bold hover:border-violet-400">{l.label}</Link>)}
  </nav>
}

// "Print" button + preview. `children` is the printable content (an A4 flow article).
export function PrintButton({ label = '🖨️ Print', title, children }) {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white no-print" onClick={() => setOpen(true)}>{label}</button>
    {open && <PrintPreview lang="en" title={title} onClose={() => setOpen(false)}>
      <article className="buga-flow" dir="ltr" lang="en" style={{ fontFamily: 'Arial, Helvetica, sans-serif', textAlign: 'left' }}>
        {children}
        <footer style={{ marginTop: 16, fontSize: 11 }}>Printed from ugabuga.co.il/en · free games for kids and families</footer>
      </article>
    </PrintPreview>}
  </>
}

// Printable prompt cards: 'cards' = cut-out grid, 'list' = checklist, 'bingo' = 4x4 grid.
export function PrintCards({ cards, name }) {
  const items = cards.items
  const sheet = cards.layout === 'bingo'
    ? <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}><tbody>
      {[0, 1, 2, 3].map(r => <tr key={r}>{items.slice(r * 4, r * 4 + 4).map((x, i) => <td key={i} style={{ border: '2px solid #333', height: 120, padding: 6, textAlign: 'center', verticalAlign: 'middle', fontSize: 14 }}>{x}<div style={{ marginTop: 10, borderBottom: '1px solid #999' }}>&nbsp;</div></td>)}</tr>)}
    </tbody></table>
    : cards.layout === 'list'
      ? <ol style={{ fontSize: 16, lineHeight: 1.9 }}>{items.map((x, i) => <li key={i}>☐ {x}</li>)}</ol>
      : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {items.map((x, i) => <div key={i} style={{ border: '1px dashed #888', minHeight: 110, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 14, breakInside: 'avoid' }}>{x}</div>)}
      </div>
  return <Box title={`🖨️ ${cards.title}`} id="cards">
    {cards.note && <p className="mb-3">{cards.note}</p>}
    <ul className="grid gap-2 sm:grid-cols-2 mb-4">{items.map((x, i) => <li key={i} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">{x}</li>)}</ul>
    <PrintButton label="🖨️ Print the cards" title={`${name}: ${cards.title}`}>
      <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>{name}: {cards.title}</h2>
      {cards.layout === 'bingo' && <p style={{ margin: '0 0 8px' }}>Name: ____________________ · Find a different person for every square and write their name.</p>}
      {sheet}
    </PrintButton>
  </Box>
}

// Rules sections [{ h, p: [] }] as plain HTML (screen and print).
export const RuleSections = ({ rules }) => rules.map(s => <section key={s.h} className="mb-3"><h3 className="text-xl mb-1">{s.h}</h3>{s.p.map((p, i) => <p key={i} className="mb-1">{p}</p>)}</section>)

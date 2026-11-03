import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { WORKSHEETS_PAGES, WS } from './catalog'
import { PageHead, PrintNote } from './ui'
import './worksheets.css'
import '../english.css'

const find = path => WORKSHEETS_PAGES.find(p => p.path === path)
const GROUPS = [
  ['Math by topic', [`${WS}/math`, `${WS}/math/up-to-10`, `${WS}/math/up-to-20`, `${WS}/math/up-to-100`, `${WS}/math/multiplication`, `${WS}/math/division`, `${WS}/math/paths`, `${WS}/math/clock`, `${WS}/math/fractions`]],
  ['Times tables', [2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `${WS}/math/multiplication-table-${n}`)],
  ['Mazes and activity pages', [`${WS}/mazes`, `${WS}/dot-to-dot`, `${WS}/count-and-write`, `${WS}/complete-the-pattern`]],
  ['Booklets', [`${WS}/booklets/add-to-20`]],
  ['Blank paper', ['lined', 'grid', 'graph', 'dot', 'music'].map(k => `${WS}/paper/${k}`)],
]

export default function EnglishWorksheetsHub() {
  const meta = find(WS)
  return <div className="en-page ws-page">
    <SEO lang="en" path={WS} title={meta.title} description={meta.description} />
    <nav className="en-breadcrumb" aria-label="Breadcrumb"><Link to="/en">Home</Link> / Worksheets</nav>
    <PageHead emoji="🖨️" title="Printable worksheets" sub="Math worksheets, a math booklet, mazes, dot-to-dot pages and blank paper. Most sheets make a new version at every click and come with an answer key. Print them or save a PDF." />
    <PrintNote />
    {GROUPS.map(([name, paths]) => <section key={name}>
      <h2>{name}</h2>
      <div className="ws-cards">{paths.map(p => { const m = find(p); return <Link key={p} to={p} className="en-card"><span className="ws-card-emoji" aria-hidden="true">{m.emoji}</span><h3>{m.title}</h3><span>Open →</span></Link> })}</div>
    </section>)}
    <section>
      <h2>Activity pages by theme</h2>
      <p>Three activities, each in six themes: animals, space, birthday, vehicles, soccer and unicorns.</p>
      <div className="ws-pills">{WORKSHEETS_PAGES.filter(p => /\/(dot-to-dot|count-and-write|complete-the-pattern)\/[a-z]+$/.test(p.path)).map(p => <Link key={p.path} className="ws-link-pill" to={p.path}>{p.emoji} {p.title.split(':')[0]}: {p.title.split(': ')[1].split(' worksheet')[0]}</Link>)}</div>
    </section>
    <section>
      <h2>More from Ugabuga</h2>
      <p>Looking for pictures to color? Try the <Link to="/en/coloring-pages">coloring pages</Link>, the <Link to="/en/printables">printable activities</Link> or the <Link to="/en/travel">travel activity kit</Link>.</p>
    </section>
  </div>
}

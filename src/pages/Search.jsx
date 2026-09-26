import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useGames } from '../hooks/useGames'
import { KINDS, STATIC_ITEMS, gameItem, searchItems } from '../data/searchIndex'

const SUGGESTIONS = ['מבוך', 'יום הולדת', 'צביעה', 'כיתה א', 'בינגו', 'חדר בריחה', 'אותיות', 'מתנות', 'טריוויה']

// /search?q= — one search over games, tools, printables, pages, ideas and guides.
export default function Search() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const [input, setInput] = useState(q)
  useEffect(() => setInput(q), [q])
  const { games } = useGames()
  const items = useMemo(() => [...STATIC_ITEMS, ...games.map(gameItem)], [games])
  const results = useMemo(() => searchItems(items, q), [items, q])
  const groups = useMemo(() => {
    const by = {}
    for (const r of results) (by[r.kind] ||= []).push(r)
    return Object.entries(by).sort((a, b) => b[1][0].score - a[1][0].score || KINDS[a[0]].order - KINDS[b[0]].order)
  }, [results])

  const submit = e => { e.preventDefault(); const v = input.trim(); setParams(v ? { q: v } : {}, { replace: false }) }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
      <SEO title={q ? `חיפוש: ${q}` : 'חיפוש באתר'} description="חיפוש בכל עוגה בוגה: משחקים, כלים, דפים להדפסה, רעיונות ומדריכים." path="/search" noindex />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חיפוש' }]} />
      <h1 className="text-4xl sm:text-5xl mb-4">🔎 חיפוש באתר</h1>
      <form role="search" onSubmit={submit} className="site-search-form">
        <input id="site-search" type="search" value={input} onChange={e => setInput(e.target.value)} placeholder="מה מחפשים? משחק, דף להדפסה, כלי…" aria-label="חיפוש בכל האתר" autoFocus />
        <button type="submit" aria-label="חיפוש"><SearchIcon size={24} /></button>
      </form>
      {!q && <div className="site-search-sugg"><span>אפשר לנסות:</span>{SUGGESTIONS.map(s => <button key={s} type="button" onClick={() => navigate('/search?q=' + encodeURIComponent(s))}>{s}</button>)}</div>}
      {q && <p className="site-search-count" role="status">{results.length ? `נמצאו ${results.length} תוצאות ל"${q}"` : `לא נמצאו תוצאות ל"${q}". נסו מילה אחרת או קצרה יותר.`}</p>}
      {groups.map(([kind, list]) => (
        <section key={kind} className="site-search-group">
          <h2>{KINDS[kind].label} <small>({list.length})</small></h2>
          <ul>
            {list.slice(0, kind === 'game' ? 24 : 40).map(r => (
              <li key={r.to}><Link to={r.to}><span className="site-search-emoji" aria-hidden="true">{r.emoji}</span><span><b>{r.title}</b>{r.desc && <small>{r.desc}</small>}</span></Link></li>
            ))}
          </ul>
          {kind === 'game' && list.length > 24 && <Link className="site-search-more" to={'/games?q=' + encodeURIComponent(q)}>לכל {list.length} המשחקים ←</Link>}
        </section>
      ))}
      <style>{`.site-search-form{display:flex;gap:8px;border:2px solid #1d2233;border-radius:18px;background:#fff;padding:6px 8px;box-shadow:3px 3px 0 #1d2233}.site-search-form input{flex:1;min-width:0;border:0;outline:0;font:inherit;font-size:19px;padding:6px 8px;background:transparent}.site-search-form button{width:46px;border-radius:12px;background:#ffd23f;display:grid;place-items:center}
.site-search-sugg{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px}.site-search-sugg button{border:2px solid #d7dbe6;border-radius:999px;padding:4px 12px;background:#fff;font-weight:700}
.site-search-count{margin:16px 2px 4px;color:#4d556a}.site-search-group{margin-top:22px}.site-search-group h2{font-size:22px;margin:0 0 8px}.site-search-group h2 small{font-size:15px;color:#6b7280}
.site-search-group ul{list-style:none;margin:0;padding:0;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}.site-search-group a{display:flex;gap:10px;align-items:flex-start;background:#fff;border:2px solid #e3e5ee;border-radius:14px;padding:10px 12px;text-decoration:none;color:inherit;height:100%}.site-search-group a:hover{border-color:#1d2233}
.site-search-group b{display:block;font-size:17px}.site-search-group small{display:block;color:#5d6377;font-size:14px;line-height:1.4;margin-top:2px}.site-search-emoji{font-size:24px;flex:none}.site-search-more{display:inline-block;margin-top:10px;font-weight:800;color:#1b6fa8;text-decoration:underline}`}</style>
    </div>
  )
}

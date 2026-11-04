import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SiteSearchBox from '../components/ui/SiteSearchBox'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useGames } from '../hooks/useGames'
import { KINDS, byPopularity, gameItem, rankWords, searchItems, suggestCorrection } from '../data/searchIndex'
import { loadPagePopularity } from '../utils/pagePopularity'
import { STATIC_ITEMS } from '../data/searchStatic'
import { RequestCard } from '../components/ui/RequestBanner'
import { recordSearchResult } from '../components/layout/RecentActivity'

const SUGGESTIONS = ['מבוך', 'יום הולדת', 'צביעה', 'כיתה א', 'בינגו', 'חדר בריחה', 'אותיות', 'מתנות', 'טריוויה']

// /search?q= — one search over games, tools, printables, pages, ideas and guides.
export default function Search() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const visibleFor = kind => {
    const initial = kind === 'game' ? 24 : 40
    const value = Number(params.get('show_' + kind))
    return Number.isSafeInteger(value) && value > initial ? Math.min(value, 10000) : initial
  }
  const showMore = kind => setParams(old => {
    const next = new URLSearchParams(old)
    next.set('show_' + kind, String(visibleFor(kind) + (kind === 'game' ? 24 : 40)))
    return next
  })
  const [input, setInput] = useState(q)
  useEffect(() => setInput(q), [q])
  const { games, loading: gamesLoading } = useGames()
  const items = useMemo(() => [...STATIC_ITEMS, ...games.map(gameItem)], [games])
  const [pop, setPop] = useState(null)
  useEffect(() => { let alive = true; loadPagePopularity().then(m => { if (alive) setPop(m) }); return () => { alive = false } }, [])
  const results = useMemo(() => byPopularity(searchItems(items, q), pop), [items, q, pop])
  const didYouMean = useMemo(() => (q && !results.length && items.length > STATIC_ITEMS.length ? suggestCorrection(items, q) : ''), [items, q, results.length])
  const suggestions = useMemo(() => rankWords(SUGGESTIONS, items, pop), [items, pop])
  // Measured once the query has stayed put for 2 seconds and the games list has loaded: only the size bucket
  // is stored, plus the words of a zero-result search if they are 1-3 plain words (see utils/liveActivity.js).
  useEffect(() => {
    if (!q || gamesLoading) return
    const t = setTimeout(() => recordSearchResult(results.length, q), 2000)
    return () => clearTimeout(t)
  }, [q, gamesLoading, results.length])
  const groups = useMemo(() => {
    const by = {}
    for (const r of results) (by[r.kind] ||= []).push(r)
    const top = list => Math.max(...list.map(r => r.score)) // results are ordered by popularity, so not always [0]
    return Object.entries(by).sort((a, b) => top(b[1]) - top(a[1]) || KINDS[a[0]].order - KINDS[b[0]].order)
  }, [results])

  // Live results while typing must not jump away mid-word; only a submitted search (or a link to /search?q=) does.
  const typed = useRef(false)
  const run = (v, replace = false) => {
    v = v.trim()
    if (v !== q) { typed.current = replace; setParams(v ? { q: v } : {}, { replace }) }
    else if (!replace && v) { typed.current = false; if (!gamesLoading && !results.length) navigate('/bugapedia?q=' + encodeURIComponent(v)) }
  }
  useEffect(() => { // results update while typing
    const t = setTimeout(() => run(input, true), 350)
    return () => clearTimeout(t)
  }, [input]) // eslint-disable-line react-hooks/exhaustive-deps
  // Nobody leaves empty-handed: a near miss goes to the corrected spelling, anything else to Bugapedia.
  const empty = Boolean(q) && !gamesLoading && !results.length
  useEffect(() => {
    if (!empty || typed.current) return
    recordSearchResult(0, q)
    navigate(didYouMean ? '/search?q=' + encodeURIComponent(didYouMean) : '/bugapedia?q=' + encodeURIComponent(q), { replace: true })
  }, [empty, q]) // eslint-disable-line react-hooks/exhaustive-deps
  const askLink = '/bugapedia?q=' + encodeURIComponent(q)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
      <SEO title={q ? `חיפוש: ${q}` : 'חיפוש באתר'} description="חיפוש בכל עוגה בוגה: משחקים, כלים, דפים להדפסה, רעיונות ומדריכים." path="/search" noindex />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חיפוש' }]} />
      <h1 className="text-4xl sm:text-5xl mb-4">🔎 חיפוש באתר</h1>
      <SiteSearchBox className="site-search-form" value={input} onChange={setInput} onSearch={v => run(v)} placeholder="מה מחפשים? משחק, דף להדפסה, כלי…" autoFocus />
      {!q && <div className="site-search-sugg"><span>אפשר לנסות:</span>{suggestions.map(s => <button key={s} type="button" onClick={() => navigate('/search?q=' + encodeURIComponent(s))}>{s}</button>)}</div>}
      {q && <p className="site-search-count" role="status">{results.length ? `נמצאו ${results.length} תוצאות ל"${q}"` : `אין עמוד באתר בדיוק על "${q}", אבל יש תשובה:`}</p>}
      {empty && <Link to={askLink} className="site-search-ask"><span aria-hidden="true">📚</span><span><b>שאלו את בוגה־פדיה: „{q}”</b><small>האנציקלופדיה של עוגה בוגה תענה, עם קישור למקור</small></span></Link>}
      {didYouMean && <p className="site-search-count">אולי התכוונתם: <Link to={'/search?q=' + encodeURIComponent(didYouMean)} style={{ fontWeight: 800, textDecoration: 'underline' }}>{didYouMean}</Link>?</p>}
      {q && !results.length && <RequestCard className="mt-4" from="/search" source="search" query={q} message={{ title: `לא מצאתם „${q}”? נכין לכם`, line: 'ספרו לנו מה בדיוק צריך — ובכל שבוע אנחנו מכינים את מה שהכי מבקשים. בחינם.' }} />}
      {groups.map(([kind, list]) => (
        <section key={kind} className="site-search-group">
          <h2>{KINDS[kind].label} <small>({list.length})</small></h2>
          <ul>
            {list.slice(0, visibleFor(kind)).map(r => (
              <li key={r.to}><Link to={r.to}><span className="site-search-emoji" aria-hidden="true">{r.emoji}</span><span><b>{r.title}</b>{r.desc && <small>{r.desc}</small>}</span></Link></li>
            ))}
          </ul>
          {list.length > visibleFor(kind) && <button type="button" className="site-search-more" onClick={() => showMore(kind)}>הצגת תוצאות נוספות — מוצגות {visibleFor(kind)} מתוך {list.length}</button>}
        </section>
      ))}
      {q && results.length > 0 && <p className="site-search-count" style={{ marginTop: 28 }}>לא מה שחפשתם? <Link to={askLink} style={{ fontWeight: 800, textDecoration: 'underline' }}>📚 שאלו את בוגה־פדיה על „{q}”</Link></p>}
      <style>{`.site-search-form{display:flex;gap:8px;border:2px solid #1d2233;border-radius:18px;background:#fff;padding:6px 8px;box-shadow:3px 3px 0 #1d2233}.site-search-form input{flex:1;min-width:0;border:0;outline:0;font:inherit;font-size:19px;padding:6px 8px;background:transparent}.site-search-form button{width:46px;border-radius:12px;background:#ffd23f;display:grid;place-items:center}
.site-search-sugg{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px}.site-search-sugg button{border:2px solid #d7dbe6;border-radius:999px;padding:4px 12px;background:#fff;font-weight:700}
.site-search-count{margin:16px 2px 4px;color:#4d556a}.site-search-ask{display:flex;gap:12px;align-items:center;margin-top:12px;background:#fff3c4;border:2px solid #1d2233;border-radius:16px;padding:14px 16px;box-shadow:3px 3px 0 #1d2233;text-decoration:none;color:inherit}.site-search-ask>span:first-child{font-size:30px}.site-search-ask b{display:block;font-size:19px}.site-search-ask small{color:#4d556a;font-size:14px}.site-search-group{margin-top:22px}.site-search-group h2{font-size:22px;margin:0 0 8px}.site-search-group h2 small{font-size:15px;color:#6b7280}
.site-search-group ul{list-style:none;margin:0;padding:0;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}.site-search-group a{display:flex;gap:10px;align-items:flex-start;background:#fff;border:2px solid #e3e5ee;border-radius:14px;padding:10px 12px;text-decoration:none;color:inherit;height:100%}.site-search-group a:hover{border-color:#1d2233}
.site-search-group b{display:block;font-size:17px}.site-search-group small{display:block;color:#5d6377;font-size:14px;line-height:1.4;margin-top:2px}.site-search-emoji{font-size:24px;flex:none}.site-search-more{display:inline-block;margin-top:10px;font-weight:800;color:#1b6fa8;text-decoration:underline}`}</style>
    </div>
  )
}

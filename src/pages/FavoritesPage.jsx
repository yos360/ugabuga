import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import { describeSaved, onSavedChange, removeSaved, savedPages } from '../utils/savedPages'

// /favorites — "המועדפים שלי": every page saved with the ❤️ next to the breadcrumbs, newest first.
// Lives only in this browser; nothing is sent anywhere.
// Popular starting points (the pages that visitors print / play / read most) so the page is never a dead end.
const POPULAR = [
  { to: '/holidays/hanukkah/coloring', icon: '🕎', label: 'דפי צביעה לחנוכה', hint: 'להדפסה' },
  { to: '/learn/reading', icon: '📖', label: 'הבנת הנקרא לפי כיתה', hint: 'א׳–ט׳' },
  { to: '/letters/game', icon: '🔤', label: 'משחק האותיות', hint: 'לגיל הרך' },
  { to: '/printables/hebrew-letters', icon: '🖨️', label: 'דפי אותיות להדפסה', hint: 'א׳–ת׳' },
  { to: '/online-games', icon: '🎮', label: 'משחקים אונליין', hint: 'בלי הורדה' },
  { to: '/rsvp', icon: '💌', label: 'אישורי הגעה בחינם', hint: 'לאירוע' },
]
function PopularTiles({ title }) {
  return <section className="mt-8" aria-label={title}>
    <h2 className="text-center text-2xl">{title}</h2>
    <ul className="mt-3 grid gap-3 sm:grid-cols-2">{POPULAR.map(x => <li key={x.to}>
      <Link to={x.to} className="flex min-h-[56px] items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3 hover:border-[var(--primary)]">
        <span className="text-3xl" aria-hidden="true">{x.icon}</span>
        <span className="flex-1"><b>{x.label}</b><small className="block text-[var(--muted-foreground)]">{x.hint}</small></span>
      </Link>
    </li>)}</ul>
  </section>
}
export default function FavoritesPage() {
  const [list, setList] = useState([])
  useEffect(() => { setList(savedPages()); return onSavedChange(setList) }, [])
  // Older saves have no full title: read it from each page's prerendered <title>, once.
  useEffect(() => {
    for (const x of savedPages().filter(x => x.desc === undefined).slice(0, 30)) {
      fetch(x.path).then(r => (r.ok ? r.text() : '')).then(html => describeSaved(x.path, /<title>([^<]*)<\/title>/.exec(html)?.[1] || '')).catch(() => {})
    }
  }, [])
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="המועדפים שלי" description="הדפים, המשחקים והשיעורים ששמרתם בעוגה בוגה בלחיצה על הלב." path="/favorites" noindex />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">❤️ </span>המועדפים שלי</h1>
    <p className="mt-2 text-center text-lg text-[var(--muted-foreground)]">כל דף באתר אפשר לשמור כאן בלחיצה על 🤍 שליד הכותרת למעלה.</p>
    {list.length ? <ul className="mt-6 grid gap-3 sm:grid-cols-2">{list.map(x => <li key={x.path} className="flex items-center gap-2 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3">
      <Link to={x.path} className="flex-1 hover:underline"><b>{x.title}</b>
        {x.desc && x.desc !== x.title && <small className="mt-0.5 block text-[var(--muted-foreground)]">{x.desc}</small>}</Link>
      <button type="button" onClick={() => removeSaved(x.path)} className="min-h-[40px] rounded-xl px-2 text-sm" aria-label={`הסרת ${x.title} מהמועדפים`}>✕</button>
    </li>)}</ul>
      : <div className="mt-8 rounded-3xl border-2 border-dashed border-[var(--border)] p-8 text-center">
        <p className="text-5xl" aria-hidden="true">🤍</p>
        <p className="mt-2 text-lg">עוד לא שמרתם כלום. מצאתם דף, משחק או שיעור שאהבתם? לחצו על הלב שליד הכותרת שלו.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2"><Link to="/learn" className="ln-chip">📚 לומדים</Link><Link to="/games" className="ln-chip">🎮 משחקים</Link><Link to="/printables" className="ln-chip">🖨️ להדפסה</Link></div>
      </div>}
    <PopularTiles title={list.length ? 'עוד דפים שכדאי לשמור' : 'הכי פופולרי באתר עכשיו'} />
    <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">המועדפים נשמרים רק בדפדפן הזה. <Link to="/games" className="underline">המשחקים שסימנתם בלב</Link> נמצאים בעמוד המשחקים.</p>
  </div>
}

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { recordNotFound } from '../components/layout/RecentActivity'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'
import SEO from '../components/ui/SEO'

const QUICK_LINKS = [
  { to: '/tools', label: '🛠️ כל הכלים' },
  { to: '/games', label: '🎮 כל המשחקים' },
  { to: '/tools/trivia-quiz', label: '🎯 טריוויה' },
  { to: '/tools/truth-or-buga', label: '🎭 אמת או בוגה' },
  { to: '/tools/buga-town', label: '🏙️ בוגה טאון' },
  { to: '/tools/bingo-maker', label: '🎟️ בינגו' },
  { to: '/tools/escape-rooms', label: '🔐 חדרי בריחה' },
  { to: '/printables', label: '🖨️ דפים להדפסה' },
]

// ugabuga.co.il/<uuid> is a "blob:" link to a PDF made in the browser (הורדה כ-PDF) that lost its
// prefix or expired — the file was never on the server. Send the visitor back to make it again.
const BLOB_ID = /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i
function lastPdf() {
  try { const v = JSON.parse(localStorage.getItem('buga-last-pdf') || 'null'); return v && Date.now() - v.at < 7 * 864e5 && v.path?.startsWith('/') ? v : null } catch { return null }
}

function ExpiredFile() {
  const last = lastPdf()
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center">
      <SEO title="הקובץ כבר לא זמין" description="קישור זמני לקובץ PDF שנוצר בדפדפן." noindex />
      <WobblyCard hover={false} padding="p-8">
        <div className="text-6xl mb-3">📄</div>
        <h1 className="text-3xl sm:text-4xl mb-3">הקובץ כבר לא זמין בקישור הזה</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--ink)]/75 mb-6">
          זה היה קישור זמני לקובץ PDF שנוצר אצלכם בדפדפן — הקובץ עצמו לא נשמר באתר. חוזרים לדף, לוחצים שוב על "⬇️ הורדה כ-PDF", ושומרים את הקובץ בטלפון או במחשב.
          {' '}אם פתחתם את האתר מתוך וואטסאפ או פייסבוק, כדאי לפתוח אותו בכרום או בספארי (⋮ ← "פתיחה בדפדפן").
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {last && <Link to={last.path}><WobblyButton>↩️ חזרה ל{last.title ? `"${last.title}"` : 'דף שממנו הורדתם'}</WobblyButton></Link>}
          <Link to="/printables"><WobblyButton variant={last ? 'outline' : undefined}>🖨️ דפים להדפסה</WobblyButton></Link>
          <Link to="/"><WobblyButton variant="outline">לדף הבית</WobblyButton></Link>
        </div>
      </WobblyCard>
    </div>
  )
}

export default function NotFound() {
  const { pathname } = useLocation()
  useEffect(() => { if (!BLOB_ID.test(pathname)) recordNotFound(pathname) }, [pathname])
  if (BLOB_ID.test(pathname)) return <ExpiredFile />
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center">
      <SEO title="הדף לא נמצא" description="העמוד שחיפשתם לא נמצא. חזרו למשחקים, לפעילויות ולדפי ההדפסה של עוגה בוגה." noindex />
      <WobblyCard hover={false} padding="p-8">
        <div className="text-6xl font-hand font-bold mb-3">404</div>
        <h1 className="text-3xl sm:text-4xl mb-3">הדף לא נמצא</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--ink)]/75 mb-6">
          יכול להיות שנכנסתם מקישור ישן. לא נתקעים — בחרו יעד ונחזיר אתכם ישר למשחקים, לכלים ולפעילויות.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-7">
          <Link to="/"><WobblyButton>לדף הבית</WobblyButton></Link>
          <Link to="/tools"><WobblyButton variant="outline">כל הכלים</WobblyButton></Link>
          <Link to="/games"><WobblyButton variant="outline">כל המשחקים</WobblyButton></Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_LINKS.map(item => (
            <Link key={item.to} to={item.to} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">
              {item.label}
            </Link>
          ))}
        </div>
      </WobblyCard>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { recordNotFound, recordExpiredPdf } from '../components/layout/RecentActivity'
import { loadPdf, pdfId, savePdf } from '../utils/pdfRecovery'
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
  const { pathname } = useLocation()
  const last = lastPdf()
  const [file, setFile] = useState(null)
  // The same browser usually still holds the file (pdfRecovery.js): give it back instead of a dead end.
  // The owner report counts how often that worked ('got') and how often it did not ('lost').
  useEffect(() => {
    let alive = true, url = ''
    loadPdf(pdfId(pathname)).catch(() => null).then(saved => {
      if (!alive) return
      recordExpiredPdf(lastPdf()?.path, saved ? 'got' : 'lost')
      if (!saved) return
      url = URL.createObjectURL(saved.blob)
      void savePdf(url, saved.blob, saved.name)
      setFile({ url, name: saved.name })
    })
    return () => { alive = false; if (url) URL.revokeObjectURL(url) }
  }, [pathname])
  if (file) return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center">
      <SEO title="הקובץ שלכם מוכן" description="קובץ PDF שנוצר בדפדפן." noindex />
      <WobblyCard hover={false} padding="p-8">
        <div className="text-6xl mb-3">📄</div>
        <h1 className="text-3xl sm:text-4xl mb-3">הקובץ שלכם מוכן</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--ink)]/75 mb-6">שמרנו לכם את הקובץ. לוחצים, שומרים אותו בטלפון או במחשב, ומדפיסים.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={file.url} download={file.name}><WobblyButton>⬇️ הורדת הקובץ</WobblyButton></a>
          {last && <Link to={last.path}><WobblyButton variant="outline">↩️ חזרה ל{last.title ? `"${last.title}"` : 'דף שממנו הורדתם'}</WobblyButton></Link>}
        </div>
      </WobblyCard>
    </div>
  )
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center">
      <SEO title="הקובץ כבר לא זמין" description="קישור זמני לקובץ PDF שנוצר בדפדפן." noindex />
      <WobblyCard hover={false} padding="p-8">
        <div className="text-6xl mb-3">📄</div>
        <h1 className="text-3xl sm:text-4xl mb-3">הקובץ כבר לא זמין בקישור הזה</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--ink)]/75 mb-6">
          זה היה קישור זמני לקובץ PDF שנוצר אצלכם בדפדפן — הקובץ עצמו לא נשמר באתר. חוזרים לדף, לוחצים שוב על "⬇️ הורדה כ-PDF", ושומרים את הקובץ בטלפון או במחשב.
          {' '}כדי לשמור PDF צריך לפתוח את הדף בכרום או בספארי — אם הגעתם מוואטסאפ, פייסבוק או אינסטגרם, לוחצים ⋮ או ⋯ ← "פתיחה בדפדפן".
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

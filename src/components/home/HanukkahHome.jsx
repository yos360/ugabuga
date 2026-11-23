import { Link } from 'react-router-dom'
import { logInviteCta } from '../../utils/liveActivity'
import { recordHomeKind } from '../../utils/experiments'
import CalendarReminderLine from '../holidays/CalendarReminderLine'

// Hanukkah 2026 on the home page (owner's request, 18.11.2026: "make Hanukkah big at the entrance so
// people print a lot"). The very first block of the page until the holiday ends: four printables with
// their real print previews, a booklet per grade, and the cut-outs. Holiday printables are the site's
// best-converting pages (Sigd 2026: more prints than opens). Clicks are logged as
// invite-cta:home-hanukkah-* so /admin/activity shows which tile works.
export const HANUKKAH_START = new Date('2026-12-04T16:30:00+02:00') // first candle
export const HANUKKAH_ENDS = new Date('2026-12-13T00:00:00+02:00') // the day after the last night

const TILES = [
  ['coloring', 'דפי צביעה לחנוכה', 'חנוכיות, סביבונים וסופגניות', '/holidays/hanukkah/coloring'],
  ['worksheets', 'דפי עבודה לחנוכה', 'ספירת נרות, חשבון סופגניות — גן וכיתה א׳', '/holidays/hanukkah/worksheets'],
  ['crafts', 'יצירה לגזירה', 'סביבון מנייר, שרשרת וחנוכייה', '/holidays/hanukkah/crafts'],
  ['word-search', 'תפזורת חנוכה', '3 רמות, עם דף פתרון', '/holidays/hanukkah/word-search'],
]
const GRADES = [
  ['גן', '/booklets/hanukkah'],
  ['א׳', '/booklets/hanukkah-grade-1'],
  ['ב׳', '/booklets/hanukkah-grade-2'],
  ['ג׳', '/booklets/hanukkah-grade-3'],
  ['ד׳', '/booklets/hanukkah-grade-4'],
  ['ה׳', '/holidays/hanukkah/grade/grade-5'],
  ['ו׳', '/booklets/hanukkah-grade-6'],
  ['חט״ב', '/booklets/hanukkah-middle-school'],
  ['ט׳', '/booklets/hanukkah-grade-9'],
]
const MORE = [
  ['🕎', 'חנוכייה לגזירה', '/holidays/hanukkah/cut-out-hanukkiah'],
  ['🧮', 'חשבון של חנוכה', '/holidays/hanukkah/math'],
  ['🔐', 'חדר בריחה', '/holidays/hanukkah/escape-room'],
  ['📜', 'סדר הדלקת נרות', '/holidays/hanukkah/candle-lighting'],
]

const DAY = 86400000
function countdown(now) {
  if (now >= HANUKKAH_START) return 'חנוכה שמח! הכול מוכן להדפסה'
  const days = Math.ceil((HANUKKAH_START - now) / DAY)
  return days <= 1 ? 'חנוכה מתחיל מחר — מדפיסים היום' : `עוד ${days} ימים לחנוכה — מדפיסים מראש`
}

export default function HanukkahHome() {
  const now = new Date()
  if (now >= HANUKKAH_ENDS) return null
  const hit = (key, to) => () => { recordHomeKind('click'); logInviteCta('home-hanukkah-' + key, to) }
  return <section className="hk-home" aria-labelledby="hk-home-h" dir="rtl">
    <div className="hk-home-head">
      <p className="hk-home-count" suppressHydrationWarning>{countdown(now)}</p>
      <h2 id="hk-home-h" className="hk-home-h">🕎 הכול לחנוכה — להדפסה בחינם</h2>
      <p className="hk-home-sub">דפי צביעה, דפי עבודה, יצירות וחוברת לכל כיתה. בלי הרשמה, ישר למדפסת או ל־PDF.</p>
    </div>
    <div className="hk-home-tiles">{TILES.map(([key, t, d, to], i) =>
      <Link key={key} to={to} onClick={hit(key, to)} className="hk-home-tile">
        <img src={`/previews/${to.slice(1).replace(/\//g, '--')}.jpg`} alt={`תצוגה מקדימה: ${t}`} width="600" height="822" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
        <b>{t}</b><small>{d}</small><span className="hk-home-go">🖨️ להדפסה</span>
      </Link>)}
    </div>
    <nav className="hk-home-grades" aria-label="חוברת חנוכה לפי כיתה"><span>📒 חוברת חנוכה לכיתה:</span>
      {GRADES.map(([g, to]) => <Link key={to} to={to} onClick={hit('booklet', to)}>{g}</Link>)}
    </nav>
    <div className="hk-home-more">
      {MORE.map(([e, t, to]) => <Link key={to} to={to} onClick={hit('more', to)}><span aria-hidden="true">{e}</span> {t}</Link>)}
      <Link to="/holidays/hanukkah" onClick={hit('all', '/holidays/hanukkah')} className="hk-home-all">כל חנוכה ←</Link>
    </div>
    <CalendarReminderLine spot="home" path="/" className="hk-home-calendar" />
  </section>
}

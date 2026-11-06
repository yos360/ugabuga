import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { ARCADE } from '../../arcade/registry'
import { useDailyChallenge } from '../../arcade/useDailyChallenge'

// /start — experimental "do something in one tap" page. It combines the owner-approved ideas from the
// daily improver log: goal row (idea 1), games before banners (27), a first step for WhatsApp visitors (28)
// and the most printed sheets as big tiles (23). No new tracking: normal page/next-step signals only.
const GOALS = [
  { to: '#print', emoji: '🖨️', t: 'להדפיס', d: 'דפים מוכנים' },
  { to: '#play', emoji: '🎮', t: 'לשחק', d: 'משחקים בלי הורדה' },
  { to: '#learn', emoji: '📚', t: 'ללמוד', d: 'קריאה, אותיות, חשבון' },
  { to: '#party', emoji: '🎉', t: 'לחגוג', d: 'הזמנות ואישורי הגעה' },
]
const PRINTS = [
  { to: '/holidays/hanukkah/coloring', emoji: '🕎', t: 'צביעה לחנוכה', d: 'חנוכייה, סביבון וסופגניות' },
  { to: '/holidays/sigd/coloring', emoji: '☂️', t: 'צביעה לסיגד', d: 'הכי מודפס בשבוע האחרון' },
  { to: '/printables/hebrew-letters', emoji: '✏️', t: 'אותיות למעבר בעיפרון', d: 'א–ת לגן וכיתה א׳' },
  { to: '/learn/reading/grade-2', emoji: '📖', t: 'קטעי קריאה לכיתה ב׳', d: 'עם שאלות להדפסה' },
  { to: '/printables/memory-english', emoji: '🃏', t: 'קלפי זיכרון באנגלית', d: 'לגזור ולשחק' },
  { to: '/printables/lined-paper', emoji: '📝', t: 'דף שורות', d: 'לכתיבה ולתרגול' },
]
const LEARN = [
  { to: '/letters/game', emoji: '🔤', t: 'משחק האותיות', d: 'דקה-שתיים ביום' },
  { to: '/learn/reading', emoji: '📖', t: 'תרגול קריאה לפי כיתה', d: 'כיתות א׳–ח׳' },
  { to: '/classroom', emoji: '🏫', t: 'כיתה חכמה', d: 'חידון, משחק חי ודפים לכיתה' },
]
const PARTY = [
  { to: '/invitation', emoji: '💌', t: 'הזמנה דיגיטלית', d: 'יוצרים ושולחים בוואטסאפ' },
  { to: '/rsvp', emoji: '✅', t: 'אישורי הגעה בחינם', d: 'קישור אחד לכל האורחים' },
  { to: '/live', emoji: '🙋', t: 'חידון חי', d: 'מצטרפים מהטלפון' },
]
const GAME_SLUGS = ['ball-sort', 'merge-2048', 'sliding-puzzle', 'word-guess', 'traffic-jam', 'battleship']

const tile = 'flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center hover:bg-[var(--muted)]'
function Tiles({ items }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {items.map(i => <Link key={i.to} to={i.to} className={tile}><span className="text-3xl" aria-hidden="true">{i.emoji}</span><b className="text-lg">{i.t}</b><small className="text-[var(--foreground)]/70">{i.d}</small></Link>)}
  </div>
}
const H2 = ({ id, children }) => <h2 id={id} className="mb-3 mt-10 scroll-mt-4 text-2xl font-black">{children}</h2>

export default function PlayPrintHub() {
  const daily = useDailyChallenge()
  const games = GAME_SLUGS.map(s => ARCADE.find(g => g.slug === s)).filter(Boolean)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
      <SEO title="מה עושים עכשיו? להדפיס, לשחק, ללמוד או לחגוג – עוגה בוגה" description="עמוד התחלה מהיר: דפים להדפסה, משחקים, תרגול ולימוד והזמנות לחגיגה — הכול בחינם, בלחיצה אחת." path="/start" noindex />
      <h1 className="mb-2 text-center text-4xl font-black">מה עושים עכשיו? 👇</h1>
      <p className="mb-5 text-center text-lg">בוחרים משהו אחד — והוא כבר מוכן. הכול בחינם, בלי הרשמה.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GOALS.map(g => <a key={g.to} href={g.to} className={tile}><span className="text-3xl" aria-hidden="true">{g.emoji}</span><b className="text-xl">{g.t}</b><small>{g.d}</small></a>)}
      </div>

      <H2 id="print">🖨️ הדפים שהכי מדפיסים עכשיו</H2>
      <Tiles items={PRINTS} />
      <p className="mt-3 text-center"><Link to="/printables" className="font-bold underline">כל הדפים להדפסה ←</Link></p>

      <H2 id="play">🎮 משחקים – לוחצים ומשחקים</H2>
      <Link to="/online-games/today" className="mb-3 flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 font-bold">
        <span><span aria-hidden="true">{daily.emoji} </span>אתגר היום: {daily.name}<small className="block font-normal">אותו אתגר לכולם, מתחלף כל יום</small></span><span>▶ לאתגר</span>
      </Link>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {games.map(g => <Link key={g.slug} to={`/online-games/${g.slug}#play`} className={tile}><span className="text-3xl" aria-hidden="true">{g.emoji}</span><b className="text-lg">{g.name}</b><small>▶ גיל {g.ages}</small></Link>)}
      </div>
      <p className="mt-3 text-center"><Link to="/online-games" className="font-bold underline">עוד משחקים ←</Link></p>

      <H2 id="learn">📚 ללמוד ולתרגל</H2>
      <Tiles items={LEARN} />

      <H2 id="party">🎉 מארגנים חגיגה?</H2>
      <Tiles items={PARTY} />

      <p className="mt-10 rounded-2xl border-2 border-dashed border-[var(--border)] p-4 text-center">
        לא מצאתם? <Link to="/request" className="font-bold underline">מבקשים דף</Link> — ואנחנו מכינים אותו.
      </p>
    </div>
  )
}

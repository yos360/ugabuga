import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { SHABBAT_GAMES, SHABBAT_KINDS, SHABBAT_FAQ, gamesByKind, kindOf } from '../../data/shabbatGames'
import '../../learn/learn.css'
import '../../family/family.css'

const PREP_LINKS = [
  { href: '/riddles/kids-easy', label: 'חידות קלות לילדים', emoji: '🧩' },
  { href: '/riddles/what-am-i', label: 'חידות "מי אני?"', emoji: '❓' },
  { href: '/trivia/with-answers', label: 'שאלות טריוויה עם תשובות', emoji: '🏆' },
  { href: '/jokes/keresh', label: 'בדיחות קרש', emoji: '😂' },
  { href: '/questions', label: 'שאלות לשיחה', emoji: '💬' },
  { href: '/questions/holiday-table', label: 'שאלות לשולחן החג', emoji: '🕯️' },
  { href: '/printables/memory-game', label: 'משחק זיכרון להדפסה', emoji: '🃏' },
  { href: '/stories', label: 'סיפורים לפני השינה', emoji: '🌙' },
]

function GameCard({ g }) {
  const k = kindOf(g.kind)
  return <article className="fam-card" id={g.slug}>
    <div className="flex items-start gap-3">
      <span className="text-4xl" aria-hidden="true">{g.emoji}</span>
      <div className="min-w-0">
        <h3 className="text-xl font-bold">{g.title}</h3>
        <small className="text-[var(--muted-foreground)]">{k.emoji} {k.label} · גיל {g.ages} · {g.players} משתתפים</small>
      </div>
    </div>
    <ol className="fam-steps mt-3">{g.rules.map(r => <li key={r}>{r}</li>)}</ol>
    {g.tip && <p className="mt-2 text-sm"><b>💡 טיפ:</b> {g.tip}</p>}
    {g.link && <p className="mt-2 m-0"><Link to={g.link.href} className="font-bold underline">{g.link.label} ←</Link></p>}
  </article>
}

export default function ShabbatGames() {
  const [kind, setKind] = useState('all')
  const [printing, setPrinting] = useState(false)
  const list = gamesByKind(kind)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="משחקים לשבת — פעילויות לשבת בלי חשמל" description={`${SHABBAT_GAMES.length} משחקים ופעילויות לשבת שלא דורשים חשמל, כתיבה או ציוד מיוחד: משחקי מילים, זיכרון ותנועה, וגם חידות וטריוויה להדפסה מראש.`} path="/games/shabbat" structuredData={faqSchema(SHABBAT_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'משחקים לשבת' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🕯️</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">משחקים לשבת</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{SHABBAT_GAMES.length} פעילויות לשבת בלי חשמל — משחקים שלא דורשים חשמל, כתיבה או ציוד מיוחד</p>
    </header>

    <section className="ln-box mt-6" aria-labelledby="note">
      <h2 id="note" className="text-xl font-black">🤍 לפני שמתחילים</h2>
      <p className="leading-relaxed">אספנו כאן משחקים שמשחקים בדיבור, בתנועה ובזיכרון, ומשחקים שמדפיסים ומכינים לפני שבת. זה לא דף הלכתי: משפחות נוהגות בצורות שונות — למשל לגבי משחקי קופסה, קלפים, פאזלים או ספירת נקודות — ובכל שאלה כדאי לנהוג לפי המנהג של המשפחה או לשאול את הרב.</p>
      <p className="m-0 leading-relaxed">רוצים להתכונן? הדפיסו את הרשימה הזאת (כפתור ההדפסה למטה), ואיתה דף חידות או טריוויה — כך הכול מוכן על השולחן עוד לפני כניסת השבת.</p>
    </section>

    <div className="no-print mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="סוג משחק">
      <button type="button" className="ln-chip" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>הכול ({SHABBAT_GAMES.length})</button>
      {SHABBAT_KINDS.map(k => <button key={k.id} type="button" className="ln-chip" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>{k.emoji} {k.label} ({gamesByKind(k.id).length})</button>)}
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ הדפסת המשחקים</button>
    </div>
    <h2 className="mt-6 mb-4 text-center text-2xl font-black">{kind === 'all' ? 'כל המשחקים' : kindOf(kind).label}</h2>
    <div className="grid gap-4 md:grid-cols-2">{list.map(g => <GameCard key={g.slug} g={g} />)}</div>

    <section className="mt-10" aria-labelledby="prep">
      <h2 id="prep" className="mb-4 text-center text-2xl font-black">🖨️ להדפיס לפני שבת</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{PREP_LINKS.map(l => <Link key={l.href} to={l.href} className="fam-card card-lift text-center"><div className="text-3xl" aria-hidden="true">{l.emoji}</div><span className="font-bold">{l.label}</span></Link>)}</div>
    </section>

    {printing && <PrintPreview title="משחקים לשבת" onClose={() => setPrinting(false)}>
      <article className="buga-flow" dir="rtl">
        <h2>משחקים לשבת — בלי חשמל</h2>
        {list.map(g => <div key={g.slug} style={{ breakInside: 'avoid' }}>
          <h3>{g.emoji} {g.title} <small>(גיל {g.ages})</small></h3>
          <ol>{g.rules.map(r => <li key={r}>{r}</li>)}</ol>
        </div>)}
      </article>
    </PrintPreview>}

    <div className="mt-12"><SeoBody paragraphs={[
      'שבת היא זמן מצוין למשחקים משפחתיים: אין מסכים שמושכים את תשומת הלב, כולם בבית, ויש שעות ארוכות אחרי הארוחה. כאן תמצאו משחקים לשבת שמתאימים לשולחן, לסלון ולחצר — רובם לא דורשים שום ציוד, ואת השאר מדפיסים ומכינים מראש.',
      'המשחקים מחולקים לארבעה סוגים: משחקי מילים ושיחה, משחקי חשיבה וזיכרון, משחקי תנועה, ומשחקים שמדפיסים לפני שבת. ליד כל משחק כתוב לאיזה גיל הוא מתאים, כמה משתתפים צריך ואיך משחקים. כל משפחה נוהגת לפי המנהג שלה — והרשימה הזאת היא רק רעיונות.',
    ]} faq={SHABBAT_FAQ} related={[
      { label: 'משחקים למשפחה', href: '/games/family' }, { label: 'משחקים בלי ציוד', href: '/games/no-equipment' },
      { label: 'משחקים שקטים', href: '/games/quiet' }, { label: 'חיפוש אוצרות לשבת', href: '/treasure-hunt/shabbat-family' },
    ]} /></div>
  </div>
}

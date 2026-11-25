import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { PATH, GROUPS, HOLIDAYS, CALENDAR, GAME, HUB_FAQ, CLASS_TIPS, bySlug } from '../../data/arabHolidays'

// /holidays/arab-holidays: hub for Muslim, Christian and Druze holidays explained for kids,
// with a "which holiday?" matching game and an upcoming-dates strip. Cultural/religious content only.
// Nothing chosen here is stored or sent anywhere.

const nameOf = key => (key === 'ramadan' ? 'רמדאן ועיד אל-פיטר' : bySlug(key)?.short || key)
const emojiOf = key => (key === 'ramadan' ? '🍬' : bySlug(key)?.emoji || '❓')
const KEYS = GAME.map(g => g.answer)

// Four options for a clue: the right answer plus three others picked by a fixed offset (no randomness, same on every render).
function optionsFor(i) {
  const ans = GAME[i].answer
  const others = [1, 3, 5].map(k => KEYS[(i + k) % KEYS.length]).filter(k => k !== ans)
  const list = [ans, ...others].slice(0, 4)
  const shift = i % list.length
  return [...list.slice(shift), ...list.slice(0, shift)]
}

function Game() {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= GAME.length
  const opts = useMemo(() => (done ? [] : optionsFor(i)), [i, done])

  function choose(k) {
    if (picked) return
    setPicked(k)
    if (k === GAME[i].answer) setScore(s => s + 1)
  }
  function next() { setPicked(null); setI(n => n + 1) }
  function again() { setPicked(null); setI(0); setScore(0) }

  if (done) {
    return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-6 text-center" role="status" aria-live="polite">
      <p className="text-5xl" aria-hidden="true">🏆</p>
      <p className="mt-2 text-2xl font-black">סיימתם! {score} מתוך {GAME.length}</p>
      <p className="mt-1 text-lg">{score >= 6 ? 'כל הכבוד, אתם כבר מכירים הרבה חגים!' : 'איזה כיף ללמוד. אפשר לקרוא על החגים למטה ולנסות שוב.'}</p>
      <button type="button" className="ln-btn go mt-4" onClick={again}>משחקים שוב</button>
    </div>
  }
  const q = GAME[i]
  const ok = picked === q.answer
  return <div>
    <p className="mb-2 text-sm font-bold text-[var(--muted-foreground)]">שאלה {i + 1} מתוך {GAME.length} · נקודות: {score}</p>
    <p className="mb-4 rounded-2xl bg-white p-4 text-xl font-bold leading-relaxed">{q.clue}</p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="בחירת חג">
      {opts.map(k => {
        const right = picked && k === q.answer
        const wrong = picked === k && k !== q.answer
        return <button key={k} type="button" disabled={!!picked} onClick={() => choose(k)}
          className={`min-h-[64px] rounded-2xl border-2 p-3 text-right text-lg font-bold ${right ? 'border-emerald-600 bg-emerald-100' : wrong ? 'border-rose-500 bg-rose-100' : 'border-[var(--border)] bg-white'}`}>
          <span aria-hidden="true">{emojiOf(k)}</span> {nameOf(k)}{right ? ' ✓' : ''}
        </button>
      })}
    </div>
    <div className="mt-3 min-h-[3.5rem]" role="status" aria-live="polite">
      {picked && <p className="text-lg font-bold">{ok ? '🎉 נכון!' : `לא בדיוק. התשובה הנכונה: ${nameOf(q.answer)}.`}</p>}
    </div>
    {picked && <button type="button" className="ln-btn go" onClick={next}>{i + 1 === GAME.length ? 'לתוצאה' : 'לשאלה הבאה'}</button>}
  </div>
}

function CalendarStrip() {
  const today = new Date().toISOString().slice(0, 10)
  const rows = CALENDAR.filter(c => c.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const list = rows.length ? rows : CALENDAR
  return <ol className="flex gap-3 overflow-x-auto pb-3" aria-label="החגים הקרובים לפי סדר התאריכים">
    {list.map(c => {
      const inner = <>
        <span className="block text-4xl" aria-hidden="true">{c.emoji}</span>
        <span className="mt-1 block text-lg font-black">{c.label}</span>
        <span className="mt-1 block text-[15px]">{c.approx}</span>
      </>
      const cls = 'block h-full min-w-[170px] rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center'
      return <li key={c.id} className="shrink-0">
        <Link to={c.slug ? `${PATH}/${c.slug}` : c.href} className={cls}>{inner}</Link>
      </li>
    })}
  </ol>
}

export default function ArabHolidays() {
  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="חגי המוסלמים, הנוצרים והדרוזים: הסבר לילדים"
      description="הסבר פשוט לילדים על החגים של המוסלמים, הנוצרים והדרוזים בישראל: עיד אל-אדחא, חג המולד, פסחא, נבי שועייב ועוד, עם ברכות בערבית, משחק ודפי צביעה."
      path={PATH} structuredData={faqSchema(HUB_FAQ.map(([q, a]) => ({ q, a })))} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'חגי המוסלמים, הנוצרים והדרוזים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🌙⭐🌿 חגי המוסלמים, הנוצרים והדרוזים: הסבר לילדים</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">הכרות פשוטה ומכבדת עם החגים של שכנינו ושל חברינו לכיתה: מה חוגגים, איך נוהגים, איך מברכים בערבית ומה אפשר לעשות בכיתה. עם משחק זיהוי חגים, יומן חגים ודפי צביעה וכרטיסי ברכה להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['holidays', 'כל החגים'], ['game', 'איזה חג זה?'], ['dates', 'מתי החגים'], ['tips', 'טיפים לכיתה'], ['faq', 'שאלות']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="holidays" className="mb-8 scroll-mt-24" aria-labelledby="holidays-h">
      <h2 id="holidays-h" className="mb-3 text-3xl font-black">📚 החגים לפי קהילה</h2>
      <p className="mb-4 text-lg leading-relaxed">לכל חג יש עמוד משלו: מה זה, איך משפחות חוגגות, ברכה בערבית עם תעתיק ופירוש, מתי בערך החג הבא, רעיונות לכיתה, דף צביעה וכרטיס ברכה.</p>
      {GROUPS.map(g => <div key={g.id} className="mb-6 rounded-3xl border-2 border-[var(--border)] p-5" style={{ background: g.color }}>
        <h3 className="mb-3 text-2xl font-black">{g.emoji} {g.label}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {HOLIDAYS.filter(h => h.group === g.id).map(h => <li key={h.slug}>
            <Link to={`${PATH}/${h.slug}`} className="ln-box card-lift block min-h-[64px] text-right">
              <span className="block text-xl font-bold"><span aria-hidden="true">{h.emoji}</span> {h.name}</span>
              <span className="block text-lg font-black" lang="ar" dir="rtl">{h.ar}</span>
              <span className="mt-1 block text-[15px] leading-snug">{h.tagline}</span>
            </Link>
          </li>)}
          {g.id === 'muslim' && <li>
            <Link to="/holidays/ramadan" className="ln-box card-lift block min-h-[64px] text-right">
              <span className="block text-xl font-bold"><span aria-hidden="true">🌙</span> רמדאן ועיד אל-פיטר</span>
              <span className="block text-lg font-black" lang="ar" dir="rtl">رمضان وعيد الفطر</span>
              <span className="mt-1 block text-[15px] leading-snug">חודש הצום וחג הסיום, בעמוד נפרד.</span>
            </Link>
          </li>}
        </ul>
      </div>)}
      <p className="rounded-2xl bg-amber-50 p-4 leading-relaxed">💛 <b>שימו לב:</b> הדפים מציגים מנהגים תרבותיים ודתיים באופן כללי, בלשון ״נהוג״ ו״רבים נוהגים״. כל משפחה חוגגת בדרכה, וההסבר אינו פסיקה דתית. את הדת הדרוזית מקפידים לתאר באופן כללי, כי מסורותיה פרטיות.</p>
    </section>

    <section id="game" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="game-h">
      <h2 id="game-h" className="mb-3 text-3xl font-black">🎯 איזה חג זה?</h2>
      <p className="mb-3 text-lg">קוראים את הרמז ובוחרים את החג המתאים. אחרי כל תשובה אפשר לקרוא עוד בעמוד של החג.</p>
      <Game />
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. הבחירות נשארות רק על המסך שלכם.</p>
    </section>

    <section id="dates" className="mb-8 scroll-mt-24" aria-labelledby="dates-h">
      <h2 id="dates-h" className="mb-3 text-3xl font-black">🗓️ מתי החגים הקרובים?</h2>
      <p className="mb-3 text-lg leading-relaxed">התאריכים מסודרים מהקרוב לרחוק. את התאריכים הירחיים כתבנו ״בערך״, כי הלוח ההג׳רי נקבע לפי הירח: השנה בו קצרה בכ־11 ימים, והחגים זזים אחורה בכ־11 ימים כל שנה. לחג המולד ולפסחא יש תאריך אחד בלוח הקתולי ותאריך אחר בלוח האורתודוקסי.</p>
      <CalendarStrip />
    </section>

    <section id="tips" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5" aria-labelledby="tips-h">
      <h2 id="tips-h" className="mb-3 text-3xl font-black">🍎 טיפים להורים ולמורים: איך מלמדים בכבוד</h2>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{CLASS_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
    </section>

    <p className="mt-8 text-center text-lg">עוד חגים: <Link className="font-bold underline" to="/holidays/ramadan">רמדאן ועיד אל-פיטר</Link> · <Link className="font-bold underline" to="/holidays">כל החגים והמועדים</Link></p>
    <div id="faq" className="mt-10 scroll-mt-24"><SeoBody paragraphs={[
      'חגים הם הדרך הכי טובה להכיר זה את זה. כשילדים מבינים מה חוגגים החברים שלהם, מה אוכלים ואיך מברכים, קל יותר להרגיש הכרות וכבוד הדדי. העמוד הזה מרכז את החגים של המוסלמים, הנוצרים והדרוזים בישראל בהסבר פשוט, בלי פסיקות ובלי לקחת צד.',
      'בכל חג תמצאו מנהגי משפחה, ברכה בערבית עם תעתיק בעברית, רעיונות לפעילות בכיתה, תאריך משוער לחג הבא, דף צביעה וכרטיס ברכה. בעמוד הזה יש גם משחק התאמה של חגים ויומן חגים קרובים. שום מידע לא נשמר ולא נשלח.',
    ]} faq={HUB_FAQ.map(([q, a]) => ({ q, a }))} related={[{ label: 'רמדאן ועיד אל-פיטר', href: '/holidays/ramadan' }, { label: 'חגים ומועדים', href: '/holidays' }]} /></div>
  </div>
}

import ShabbatActivityLink from '../../components/printables/ShabbatActivityLink'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import ParashaQuiz from '../../components/parasha/ParashaQuiz'
import NotFound from '../NotFound'
import { PARASHOT, PARASHA_BOOKS, parashaBySlug, parashaHref, parashaSource } from '../../data/parashot'
import { israelToday, readingForDate } from '../../utils/parashaCalendar'
import PrintPreview from '../../components/ui/PrintPreview'
import ParashaWorkbook from './ParashaWorkbook'
import PlannerBanner from '../../components/ui/PlannerBanner'
import { parashaDescription, parashaFacts, parashaFaq, parashaParagraphs } from '../../utils/parashaFacts'
import wbGenesis from '../../data/parasha/workbook-genesis.js'
import wbExodus from '../../data/parasha/workbook-exodus.js'
import wbLeviticus from '../../data/parasha/workbook-leviticus.js'
import wbNumbers from '../../data/parasha/workbook-numbers.js'
import wbDeuteronomy from '../../data/parasha/workbook-deuteronomy.js'

// All portions' workbook data, in this lazy chunk only: the portion pages show it in their HTML.
const WORKBOOK = { ...wbGenesis, ...wbExodus, ...wbLeviticus, ...wbNumbers, ...wbDeuteronomy }

// Print one portion's workbook, or every portion of a book / the whole year, in either level.
function WorkbookPrint({ portions, title, onClose, level }) {
  const ready = portions.filter(p => WORKBOOK[p.slug])
  return <PrintPreview title={title} onClose={onClose}>
    {ready.length ? ready.map(p => <ParashaWorkbook key={p.slug} p={p} w={WORKBOOK[p.slug]} level={level} />) : <p>החוברת לפרשה הזו עוד בהכנה.</p>}
  </PrintPreview>
}
function WorkbookButtons({ portions, label }) {
  const [level, setLevel] = useState(null)
  return <div className="mt-4 flex flex-wrap justify-center gap-3">
    <button type="button" onClick={() => setLevel('regular')} className="min-h-[48px] rounded-2xl bg-violet-600 px-5 font-black text-white shadow-[0_4px_0_#5b21b6]">🖨️ חוברת עבודה {label}</button>
    <button type="button" onClick={() => setLevel('easy')} className="min-h-[48px] rounded-2xl border-2 border-violet-300 bg-white px-5 font-black">🌱 חוברת מותאמת — למתקשים ולחינוך מיוחד</button>
    {level && <WorkbookPrint portions={portions} level={level} title={`חוברת עבודה ${label}${level === 'easy' ? ' — רמה מותאמת' : ''}`} onClose={() => setLevel(null)} />}
  </div>
}

const FAQ = [
  { q: 'מה פרשת השבוע השבת?', a: 'הכותרת בראש הדף מציגה את הקריאה בשבת של השבוע הנבחר לפי לוח ארץ ישראל. בשבתות חג מוצגת קריאת החג במקום פרשה רגילה.' },
  { q: 'למה לפעמים יש שתי פרשות יחד?', a: 'מספר השבתות הפנויות לקריאה משתנה משנה לשנה. כדי להשלים את התורה במחזור השנתי, לפעמים מחברים שתי פרשות וקוראים אותן באותה שבת.' },
  { q: 'האם הקריאה זהה בישראל ובחוץ לארץ?', a: 'לא תמיד. יום טוב שני של גלויות עשוי לגרום להבדל בין הקריאות. החישוב כאן מיועד לארץ ישראל בלבד.' },
  { q: 'מתי קוראים את וזאת הברכה?', a: 'בשמחת תורה, גם כשהחג חל ביום חול. לכן היא מופיעה ברשימת 54 הפרשות, אך אינה תמיד פרשה של שבת.' },
]
const chip = 'inline-flex items-center min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold'
const displayDate = iso => iso.split('-').reverse().join('.')

function useIsraelToday() {
  const [today, setToday] = useState(israelToday)
  useEffect(() => {
    const update = () => setToday(israelToday())
    const timer = setInterval(update, 30000)
    window.addEventListener('focus', update)
    window.addEventListener('pageshow', update)
    document.addEventListener('visibilitychange', update)
    return () => { clearInterval(timer); window.removeEventListener('focus', update); window.removeEventListener('pageshow', update); document.removeEventListener('visibilitychange', update) }
  }, [])
  return today
}

export function ParashaHub() {
  const today = useIsraelToday()
  const [selected, setSelected] = useState(null)
  const reading = readingForDate(selected ?? today)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="פרשת השבוע לילדים — מה קוראים השבת בארץ ישראל?" description="פרשת השבוע השבת לפי לוח ארץ ישראל: 54 פרשות עם תקצירים לילדים, שאלות ותשובות, רעיון לשולחן שבת ודף להדפסה. חיפוש פרשה לפי תאריך." path="/parasha" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שבתות וחגים', href: '/holidays' }, { label: 'פרשת השבוע' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-6">פרשת השבוע לילדים</h1>
    <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sm:p-8 text-center" aria-label="הקריאה השבועית">
      <div aria-live="polite">{reading ? <>
        <h2 className="text-2xl sm:text-3xl">{reading.holiday ? 'השבת קוראים לחג: ' : selected ? 'הפרשה בשבת שנבחרה: ' : 'פרשת השבוע השבת: '}{reading.name}</h2>
        <p className="mt-3 text-lg"><time dateTime={reading.date}>{displayDate(reading.date)}</time> · {reading.hebrewDate} · בארץ ישראל</p>
        {reading.holiday && <p className="mt-2">זו שבת של קריאת חג. {reading.portions.length ? 'בשמחת תורה קוראים את וזאת הברכה ומתחילים מבראשית.' : 'אין השבוע פרשה רגילה ברצף הקריאה.'}</p>}
        <div className="flex flex-wrap justify-center gap-3 mt-4">{reading.portions.map(p => <Link key={p.slug} to={parashaHref(p)} className={chip}>לפרשת {p.name} ←</Link>)}{reading.holiday && <Link to="/holidays/blessings" className={chip}>קריאות וברכות לחגים</Link>}</div>
      </> : <p>בחרו תאריך תקין בין השנים 1900–2199.</p>}</div>
      <div className="mt-6 flex flex-wrap gap-3 items-end justify-center"><label className="font-bold">פרשת השבוע לפי תאריך<input type="date" min="1900-01-01" max="2199-12-31" value={selected ?? today} onChange={e => setSelected(e.target.value)} className="block mt-1 min-h-[44px] max-w-full rounded-xl border-2 border-[var(--border)] bg-white text-[#182139] px-3 py-2" /></label><button onClick={() => setSelected(null)} className={chip}>חזרה לשבוע הנוכחי</button></div>
      <p className="text-sm mt-4">מציגים את השבת שבתאריך שנבחר או אחריו. במהלך שבת מוצגת קריאת אותו היום; המעבר לשבוע הבא בחצות לפי שעון ישראל.</p>
    </section>
    {reading?.portions?.length > 0 && <WorkbookButtons portions={reading.portions} label={`לפרשת ${reading.name}`} />}
    <section className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4 text-center" aria-label="הדפסה מראש">
      <p className="text-xl font-black">🗓️ למורים: מדפיסים מראש</p>
      <p>חוברות העבודה של כל הפרשות — לכל ספר או לכל השנה, בשתי רמות</p>
      <WorkbookButtons portions={PARASHOT} label="לכל השנה" />
      <div className="mt-2 flex flex-wrap justify-center gap-2">{PARASHA_BOOKS.map(b => <BookPrint key={b} book={b} />)}</div>
    </section>
    <PlannerBanner className="mt-6" />
    <ShabbatActivityLink />
    <ParashaQuiz reading={reading} />
    <nav aria-label="קפיצה לספר" className="flex flex-wrap gap-2 mt-6">{PARASHA_BOOKS.map((book, i) => <a key={book} className={chip} href={`#book-${i}`}>{book}</a>)}</nav>
    {PARASHA_BOOKS.map((book, i) => <section id={`book-${i}`} key={book} className="mt-8 scroll-mt-24"><h2 className="text-2xl mb-3">ספר {book}</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{PARASHOT.filter(p => p.book === book).map(p => <Link key={p.slug} to={parashaHref(p)} className={`${chip} justify-center`}>{p.name}</Link>)}</div></section>)}
    <div className="mt-10"><SeoBody paragraphs={[
      'בכל שבוע פותחים חלון נוסף אל סיפורי התורה ואל המצוות שבה. בחרו פרשה וקראו תקציר מקורי בשפה שמתאימה לגילי 6–12. כל דף כולל עשר שאלות עם תשובות ושאלה פתוחה לשיחה משפחתית.',
      'התקצירים מתבססים על פסוקי התורה, ללא הוספת מדרשים כאילו היו חלק מהסיפור המקראי. ליד כל פרשה נמצא קישור לטקסט המלא בספריא. אפשר להדפיס את התקציר ואת השאלות ולקחת לשולחן שבת.',
      'הקריאה בראש העמוד מחושבת במכשיר לפי לוח ארץ ישראל, ומתעדכנת בפתיחת הדף וגם אם הוא נשאר פתוח. בחגים ובשבתות של שתי פרשות מוצג המצב המתאים, בלי לנחש לפי מספר השבוע בשנה.',
    ]} faq={FAQ} related={[{ href: '/holidays/blessings/shabbat', label: 'ברכות לשבת ולהדלקת נרות' }, { href: '/games/shabbat', label: 'משחקים לשבת' }]} />
      <p className="mt-4"><Link className="underline font-bold" to="/shabbat-times">כניסת שבת וצאת השבת לפי עיר ←</Link></p>
    </div>
  </div>
}

function BookPrint({ book }) {
  const [open, setOpen] = useState(false)
  const portions = PARASHOT.filter(p => p.book === book)
  return <>
    <button type="button" onClick={() => setOpen(true)} className={chip}>🖨️ ספר {book} ({portions.length})</button>
    {open && <WorkbookPrint portions={portions} level="regular" title={`חוברות עבודה — ספר ${book}`} onClose={() => setOpen(false)} />}
  </>
}

// Events, characters, concepts, verse, true/false and drawing prompt from the portion's workbook data,
// shown on the page itself (prerendered) so every portion page carries its own material.
function PortionDetails({ w, name }) {
  const box = 'mt-8 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5'
  return <>
    <section className={box}><h2 className="text-2xl mb-3">סדר האירועים בפרשת {name}</h2><ol className="list-decimal ps-6 space-y-1 text-lg">{w.events.map(e => <li key={e}>{e}</li>)}</ol></section>
    <section className={box}><h2 className="text-2xl mb-3">מי בפרשה?</h2><dl className="space-y-2">{w.characters.map(([who, about]) => <div key={who}><dt className="font-bold inline">{who}: </dt><dd className="inline">{about}</dd></div>)}</dl></section>
    <section className={box}><h2 className="text-2xl mb-3">מילים ומושגים מהפרשה</h2><dl className="space-y-2">{w.concepts.map(([word, meaning]) => <div key={word}><dt className="font-bold inline">{word} — </dt><dd className="inline">{meaning}</dd></div>)}</dl></section>
    <section className="mt-8 rounded-2xl bg-[var(--postit)] p-5 text-center"><h2 className="text-2xl mb-2">פסוק לזכור</h2><blockquote className="text-xl font-bold">״{w.verse.text}״</blockquote><p className="mt-1 text-sm">{w.verse.ref}</p></section>
    <section className={box}><h2 className="text-2xl mb-3">נכון או לא נכון?</h2><p className="text-sm mb-2">קראו כל משפט, נחשו, ובדקו בתשובה שבסוגריים.</p><ul className="space-y-1">{w.truefalse.map(([text, ok]) => <li key={text}>{text} <span className="text-sm font-bold">({ok ? 'נכון' : 'לא נכון'})</span></li>)}</ul></section>
    <section className={box}><h2 className="text-2xl mb-2">רעיון לציור</h2><p className="text-lg">{w.draw}</p></section>
  </>
}

function Portion({ p }) {
  const index = PARASHOT.indexOf(p)
  const prev = PARASHOT[(index + 53) % 54], next = PARASHOT[(index + 1) % 54]
  const today = useIsraelToday(), w = WORKBOOK[p.slug]
  const facts = useMemo(() => parashaFacts(p, w, today), [p, w, today])
  const faq = parashaFaq(facts)
  const sameBook = PARASHOT.filter(x => x.book === p.book && x !== p && x !== prev && x !== next)
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title={`פרשת ${p.name} לילדים — תקציר, שאלות ודף להדפסה`} description={parashaDescription(facts)} path={parashaHref(p)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'פרשת השבוע', href: '/parasha' }, { label: p.name }]} />
    <p className="text-center text-[var(--muted-foreground)]">ספר {p.book} · לגילי 6–12</p>
    <h1 className="text-center text-3xl sm:text-4xl mt-2 mb-4">פרשת {p.name} לילדים</h1>
    <p className="text-center mb-6"><a href={parashaSource(p)} target="_blank" rel="noopener noreferrer" className="underline font-bold">לפסוקי הפרשה המלאים בספריא ↗</a></p>
    <nav aria-label="מעבר בין פרשות" className="mb-6 flex flex-wrap items-center justify-between gap-2"><Link className={chip} to={parashaHref(prev)}>→ פרשת {prev.name}</Link><Link className="inline-flex min-h-[44px] items-center rounded-2xl bg-violet-600 px-4 font-black text-white shadow-sm hover:bg-violet-700" style={{ color: '#fff' }} to={parashaHref(next)}>הפרשה הבאה: {next.name} ←</Link></nav>
    <section className="mb-6 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4 text-center" aria-label="חוברת עבודה">
      <p className="text-xl font-black">📒 חוברת עבודה לפרשת {p.name}</p>
      <p>סיכום, דמויות, סדר אירועים, מושגים, שאלות, ציור ודף תשובות — בשתי רמות</p>
      <WorkbookButtons portions={[p]} label={`לפרשת ${p.name}`} />
    </section>
    <section className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5 sm:p-7" aria-label="תקציר הפרשה"><h2 className="text-2xl mb-3">מה קורה בפרשה?</h2><div className="space-y-4 text-lg leading-relaxed">{p.paragraphs.map((text, i) => <p key={i}>{text}</p>)}</div></section>
    {w && <PortionDetails w={w} name={p.name} />}
    <ShabbatActivityLink />
    <ParashaQuiz portions={[p]} />
    <section className="mt-8 bg-[var(--postit)] rounded-2xl p-5"><h2 className="text-2xl mb-2">מדברים על זה בשולחן שבת</h2><p className="text-lg">{p.discussion}</p><p className="text-sm mt-2">זו שאלה פתוחה למחשבה ולשיחה; אין לה תשובה אחת נכונה.</p></section>
    <nav aria-label="פרשה קודמת והבאה" className="mt-8 flex flex-wrap justify-between gap-3"><Link className={chip} to={parashaHref(prev)}>→ {prev.name}</Link><Link className={chip} to="/parasha">כל הפרשות</Link><Link className={chip} to={parashaHref(next)}>{next.name} ←</Link></nav>
    <div className="mt-8"><h2 className="text-2xl mb-3">על פרשת {p.name}</h2><SeoBody paragraphs={parashaParagraphs(facts)} faq={faq} related={[{ href: '/holidays/blessings/shabbat', label: 'ברכות לשבת' }, { href: '/shabbat-times', label: 'כניסת שבת וצאת השבת לפי עיר' }]} /></div>
    {sameBook.length > 0 && <nav aria-label={`עוד פרשות בספר ${p.book}`} className="mt-6"><h2 className="text-xl mb-2">עוד פרשות בספר {p.book}</h2><div className="flex flex-wrap gap-2">{sameBook.map(x => <Link key={x.slug} className={chip} to={parashaHref(x)}>{x.name}</Link>)}</div></nav>}
  </div>
}

export function ParashaPage() {
  const { slug } = useParams()
  const p = parashaBySlug(slug)
  return p ? <Portion key={p.slug} p={p} /> : <NotFound />
}

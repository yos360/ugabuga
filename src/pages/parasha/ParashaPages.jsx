import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { PARASHOT, PARASHA_BOOKS, parashaBySlug, parashaHref, parashaSource } from '../../data/parashot'
import { israelToday, readingForDate } from '../../utils/parashaCalendar'

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
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'פרשת השבוע' }]} />
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
    <nav aria-label="קפיצה לספר" className="flex flex-wrap gap-2 mt-6">{PARASHA_BOOKS.map((book, i) => <a key={book} className={chip} href={`#book-${i}`}>{book}</a>)}</nav>
    {PARASHA_BOOKS.map((book, i) => <section id={`book-${i}`} key={book} className="mt-8 scroll-mt-24"><h2 className="text-2xl mb-3">ספר {book}</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{PARASHOT.filter(p => p.book === book).map(p => <Link key={p.slug} to={parashaHref(p)} className={`${chip} justify-center`}>{p.name}</Link>)}</div></section>)}
    <div className="mt-10"><SeoBody paragraphs={[
      'בכל שבוע פותחים חלון נוסף אל סיפורי התורה ואל המצוות שבה. בחרו פרשה וקראו תקציר מקורי בשפה שמתאימה לגילי 6–12. כל דף כולל חמש שאלות עם תשובות ושאלה פתוחה לשיחה משפחתית.',
      'התקצירים מתבססים על פסוקי התורה, ללא הוספת מדרשים כאילו היו חלק מהסיפור המקראי. ליד כל פרשה נמצא קישור לטקסט המלא בספריא. אפשר להדפיס את התקציר ואת השאלות ולקחת לשולחן שבת.',
      'הקריאה בראש העמוד מחושבת במכשיר לפי לוח ארץ ישראל, ומתעדכנת בפתיחת הדף וגם אם הוא נשאר פתוח. בחגים ובשבתות של שתי פרשות מוצג המצב המתאים, בלי לנחש לפי מספר השבוע בשנה.',
    ]} faq={FAQ} related={[{ href: '/holidays/blessings/shabbat', label: 'ברכות לשבת ולהדלקת נרות' }, { href: '/games/shabbat', label: 'משחקים לשבת' }]} />
      <p className="mt-4"><a className="underline font-bold" href="https://calendar.2net.co.il/parasha.aspx" target="_blank" rel="noopener noreferrer">זמני שבת לפי עיר בלוח טו־נט ↗</a></p>
    </div>
  </div>
}

function Portion({ p }) {
  const [printing, setPrinting] = useState(false), [answers, setAnswers] = useState(false)
  const index = PARASHOT.indexOf(p)
  const prev = PARASHOT[(index + 53) % 54], next = PARASHOT[(index + 1) % 54]
  const faq = [{ q: `באיזה ספר נמצאת פרשת ${p.name}?`, a: `בספר ${p.book}. הקישור למקור בראש הדף מוביל לפסוקים המלאים.` }, { q: 'מה אפשר להדפיס מהדף?', a: 'את התקציר, חמש שאלות ושאלה לשיחה. אפשר לבחור לצרף גם תשובות לפני פתיחת תצוגת ההדפסה.' }]
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title={`פרשת ${p.name} לילדים — תקציר, שאלות ודף להדפסה`} description={`פרשת ${p.name} בספר ${p.book}: תקציר מקורי לילדים, 5 שאלות ותשובות, שאלה לשולחן שבת ודף להדפסה. לפי פסוקי התורה, עם קישור למקור בספריא.`} path={parashaHref(p)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'פרשת השבוע', href: '/parasha' }, { label: p.name }]} />
    <p className="text-center text-[var(--muted-foreground)]">ספר {p.book} · לגילי 6–12</p>
    <h1 className="text-center text-3xl sm:text-4xl mt-2 mb-4">פרשת {p.name} לילדים</h1>
    <p className="text-center mb-6"><a href={parashaSource(p)} target="_blank" rel="noopener noreferrer" className="underline font-bold">לפסוקי הפרשה המלאים בספריא ↗</a></p>
    <section className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5 sm:p-7" aria-label="תקציר הפרשה"><h2 className="text-2xl mb-3">מה קורה בפרשה?</h2><div className="space-y-4 text-lg leading-relaxed">{p.paragraphs.map((text, i) => <p key={i}>{text}</p>)}</div></section>
    <section className="mt-8" aria-labelledby="questions"><h2 id="questions" className="text-2xl mb-3">חמש שאלות — זוכרים מה קראנו?</h2><p className="mb-3">נסו לענות, ואז פתחו כל שאלה כדי לבדוק.</p><ol className="space-y-3">{p.questions.map((q, i) => <li key={q.q}><details className="rounded-xl border-2 border-[var(--border)] p-4"><summary className="cursor-pointer font-bold min-h-[32px]">{i + 1}. {q.q}</summary><p className="mt-3">{q.a}</p></details></li>)}</ol></section>
    <section className="mt-8 bg-[var(--postit)] rounded-2xl p-5"><h2 className="text-2xl mb-2">מדברים על זה בשולחן שבת</h2><p className="text-lg">{p.discussion}</p><p className="text-sm mt-2">זו שאלה פתוחה למחשבה ולשיחה; אין לה תשובה אחת נכונה.</p></section>
    <div className="mt-7 flex flex-wrap gap-4 items-center"><label className="flex gap-2 items-center min-h-[44px]"><input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} />לצרף תשובות לדף המודפס</label><button className={`${chip} bg-[var(--postit)]`} onClick={() => setPrinting(true)}>הדפסת דף פרשת {p.name}</button></div>
    {printing && <PrintPreview title={`פרשת ${p.name} לילדים`} onClose={() => setPrinting(false)}><article className="buga-flow" dir="rtl"><h2 className="text-2xl font-bold">פרשת {p.name} · ספר {p.book}</h2><p className="text-sm mb-4">תקציר לפי פסוקי התורה · {p.ref}</p>{p.paragraphs.map((text, i) => <p key={i} className="mb-3">{text}</p>)}<h3 className="text-xl font-bold mt-4">חמש שאלות</h3><ol className="list-decimal pr-5 space-y-2">{p.questions.map(q => <li key={q.q}>{q.q}{answers && <p><b>תשובה:</b> {q.a}</p>}</li>)}</ol><h3 className="text-xl font-bold mt-4">שאלה לשיחה</h3><p>{p.discussion}</p></article></PrintPreview>}
    <nav aria-label="פרשה קודמת והבאה" className="mt-8 flex flex-wrap justify-between gap-3"><Link className={chip} to={parashaHref(prev)}>→ {prev.name}</Link><Link className={chip} to="/parasha">כל הפרשות</Link><Link className={chip} to={parashaHref(next)}>{next.name} ←</Link></nav>
    <div className="mt-8"><SeoBody faq={faq} related={[{ href: '/holidays/blessings/shabbat', label: 'ברכות לשבת' }]} /></div>
  </div>
}

export function ParashaPage() {
  const { slug } = useParams()
  const p = parashaBySlug(slug)
  return p ? <Portion key={p.slug} p={p} /> : <NotFound />
}

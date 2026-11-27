import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import {
  SEVEN_BLESSINGS, BLESSING_SLOTS, BLESSING_ROLES, SHEVA_IDEAS, SHEVA_FAQ,
  ANNIVERSARY_YEARS, anniversaryInfo, PARENT_GIFTS, ANNIVERSARY_FAQ,
} from '../../data/weddingGuides'

const CARD = 'rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow'
const INPUT = 'mt-1 block w-full rounded-xl border-2 border-[var(--border)] px-3 py-2'

function AssignmentSheet() {
  const [names, setNames] = useState(() => Array(7).fill(''))
  const [couple, setCouple] = useState('')
  const [full, setFull] = useState(true)
  const [printing, setPrinting] = useState(false)
  const setName = (i, v) => setNames(a => a.map((x, j) => (j === i ? v : x)))
  return <section id="sheet" className={`mt-10 scroll-mt-24 ${CARD}`} aria-labelledby="sheet-title">
    <h2 id="sheet-title" className="m-0 text-center text-3xl font-bold">🖨️ דף חלוקת הברכות להדפסה</h2>
    <p className="text-center text-[var(--muted-foreground)]">כותבים מי מברך כל ברכה, ומדפיסים דף אחד לשולחן. אפשר לצרף את הנוסח המנוקד, כדי שכל אחד יקרא מהדף.</p>
    <label className="mt-3 block font-bold">שמות בני הזוג (לא חובה)
      <input value={couple} onChange={e => setCouple(e.target.value)} maxLength={60} placeholder="למשל: נועה ודניאל" className={INPUT} />
    </label>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {SEVEN_BLESSINGS.map((b, i) => <label key={b.n} className="font-bold">
        <span className="text-sm text-rose-700">ברכה {b.n}: {b.label}</span>
        <input value={names[i]} onChange={e => setName(i, e.target.value)} maxLength={40} placeholder={BLESSING_SLOTS[i]} className={INPUT} />
      </label>)}
    </div>
    <p className="mt-4 mb-0 flex flex-wrap items-center justify-center gap-4">
      <label className="font-bold"><input type="checkbox" checked={full} onChange={e => setFull(e.target.checked)} className="ml-2" />לצרף את נוסח הברכות עם ניקוד</label>
      <button type="button" onClick={() => setPrinting(true)} className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white">🖨️ הדפסה</button>
    </p>
    <p className="mt-2 mb-0 text-center text-xs text-[var(--muted-foreground)]">השמות לא נשמרים אצלנו ולא יוצאים מהדפדפן.</p>
    {printing && <PrintPreview lang="he" title="דף חלוקת שבע ברכות" onClose={() => setPrinting(false)}>
      <div className="buga-flow" dir="rtl">
        <h2 style={{ fontSize: 26, margin: 0 }}>🥂 שבע ברכות{couple.trim() ? ` ל${couple.trim()}` : ''}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, marginTop: 8 }}>
          <tbody>{SEVEN_BLESSINGS.map((b, i) => <tr key={b.n}>
            <td style={{ borderBottom: '1px solid #ddd', padding: 6, fontWeight: 800, width: 40 }}>{b.n}</td>
            <td style={{ borderBottom: '1px solid #ddd', padding: 6 }}>{b.label}</td>
            <td style={{ borderBottom: '1px solid #ddd', padding: 6, fontWeight: 800, width: '40%' }}>{names[i].trim() || '________________'}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {full && <div className="buga-flow" dir="rtl">
        <h2 style={{ fontSize: 22, margin: 0 }}>נוסח הברכות</h2>
        {SEVEN_BLESSINGS.map((b, i) => <p key={b.n} style={{ fontSize: 15, lineHeight: 1.7, margin: '6px 0' }}><b>{b.n}{names[i].trim() ? ` (${names[i].trim()})` : ''}. </b>{b.text}</p>)}
      </div>}
    </PrintPreview>}
  </section>
}

export function ShevaBrachot() {
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שבע ברכות — הנוסח המלא, מי מברך מה ודף חלוקה להדפסה" description="שבע הברכות בנוסח המסורתי עם ניקוד, הסבר מי מברך כל ברכה, דף חלוקה להדפסה עם שמות המברכים ורעיונות לערב שבע ברכות בבית. בחינם." path="/wedding/sheva-brachot" structuredData={faqSchema(SHEVA_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה מתחתנים', href: '/wedding' }, { label: 'שבע ברכות' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">🥂 שבע ברכות: הנוסח, החלוקה וערב בבית</h1>
    <p className="mx-auto max-w-2xl text-center text-lg text-[var(--muted-foreground)]">כל מה שצריך לערב שבע ברכות: הנוסח המסורתי של שבע הברכות עם ניקוד, מי יכול לברך כל ברכה, דף חלוקה להדפסה עם שמות המברכים, ורעיונות לערב נעים בבית.</p>

    <section className="mt-8" aria-labelledby="text-title">
      <h2 id="text-title" className="text-3xl font-bold">📖 נוסח שבע הברכות</h2>
      <p className="text-[var(--muted-foreground)]">הנוסח המסורתי מהתלמוד, כפי שנהוג לומר אותו. בין העדות והקהילות יש הבדלים קלים, ולכן כדאי להתייעץ עם רב אם יש לכם מנהג מסוים.</p>
      <ol className="m-0 list-none space-y-3 p-0">
        {SEVEN_BLESSINGS.map(b => <li key={b.n} className={CARD}>
          <h3 className="m-0 text-xl font-bold">ברכה {b.n}: {b.label}</h3>
          <p className="mt-2 mb-1 text-xl leading-loose">{b.text}</p>
          <p className="m-0 text-sm text-[var(--muted-foreground)]">{b.meaning}</p>
        </li>)}
      </ol>
    </section>

    <section className="mt-10" aria-labelledby="who-title">
      <h2 id="who-title" className="text-3xl font-bold">🙋 מי מברך איזו ברכה?</h2>
      <p>אין חובה לחלק בצורה מסוימת. הרעיון הוא לכבד שבעה אנשים שאוהבים את הזוג, כל אחד בברכה אחת. כך זה נראה בדרך כלל:</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {BLESSING_ROLES.map(([e, t, d]) => <div key={t} className="rounded-2xl bg-rose-50 p-4"><h3 className="m-0 text-lg font-bold">{e} {t}</h3><p className="m-0 mt-1 text-[var(--muted-foreground)]">{d}</p></div>)}
      </div>
      <h3 className="mt-5 text-xl font-bold">הצעה לדוגמה</h3>
      <ol className="m-0 space-y-1 pr-6">{BLESSING_SLOTS.map((s, i) => <li key={s}>ברכה {i + 1}: {s}</li>)}</ol>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">טיפ: כשיש הרבה אנשים חשובים, מחלקים גם את הקריאה בין כמה קרובים, או מזמינים כמה סעודות ומכבדים אחרים בכל סעודה.</p>
    </section>

    <AssignmentSheet />

    <section className="mt-10" aria-labelledby="ideas-title">
      <h2 id="ideas-title" className="text-3xl font-bold">🏠 רעיונות לערב שבע ברכות בבית</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {SHEVA_IDEAS.map(i => <div key={i.t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><h3 className="m-0 text-lg font-bold">{i.t}</h3><p className="m-0 mt-1 text-[var(--muted-foreground)]">{i.d}</p></div>)}
      </div>
    </section>

    <div className="mt-12"><SeoBody
      paragraphs={['שבע הברכות הן אחד המנהגים הנפוצים והיפים ביותר סביב החתונה. מי שמארח ערב כזה יכול לעשות אותו בצורה מסורתית מלאה, או פשוט לאסוף את המשפחה והחברים, להקריא את הברכות ולשמוח עם הזוג.', 'מדפיסים את הדף, מחלקים את הברכות, מכינים כוס יין, וזהו. את שאר הערב אפשר לעשות כמו שהזוג אוהב.']}
      faq={SHEVA_FAQ}
      related={[
        { label: 'בוגה מתחתנים: מתכנן חתונה חינמי', href: '/wedding' },
        { label: 'אישורי הגעה לחתונה', href: '/rsvp/wedding' },
        { label: 'הזמנה לחתונה', href: '/invitation/wedding' },
        { label: 'ברכה ליום נישואים', href: '/greetings/anniversary' },
      ]}
    /></div>
  </div>
}

function YearFinder() {
  const [years, setYears] = useState('')
  const info = anniversaryInfo(years)
  return <section className={`mt-8 ${CARD}`} aria-labelledby="finder-title">
    <h2 id="finder-title" className="m-0 text-center text-2xl font-bold">🔎 כמה שנים יחד?</h2>
    <label className="mt-3 block text-center font-bold">מספר שנות הנישואים
      <input type="number" min="1" max="99" inputMode="numeric" value={years} onChange={e => setYears(e.target.value)} className="mr-2 w-24 rounded-xl border-2 border-[var(--border)] px-3 py-1 text-center" />
    </label>
    {info && <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-center" role="status">
      {info.exact
        ? <><p className="m-0 text-xl font-bold">{info.exact.name} 💍</p><p className="m-0 mt-1">{info.exact.idea}</p></>
        : <>
          <p className="m-0 text-lg font-bold">שנה {info.years} לנישואים</p>
          {info.below && <p className="m-0 mt-1">קרוב אל {info.below.name} (שנה {info.below.y}): {info.below.idea}</p>}
          {info.next && <p className="m-0 mt-1 text-[var(--muted-foreground)]">הציון המסורתי הבא: {info.next.name}, בעוד {info.next.y - info.years} שנים.</p>}
          {!info.below && <p className="m-0 mt-1">עדיין לפני השנה הראשונה: חוגגים כל חודש ומתחילים להתכונן לחתונת נייר.</p>}
        </>}
    </div>}
  </section>
}

export function AnniversaryIdeas() {
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="יום נישואים — רעיונות לחגיגה לפי שנה ומתנה להורים" description="רעיונות לחגוג יום נישואים לפי מספר השנים, מתנות להורים ליום הנישואים שלהם, והשמות המסורתיים מחתונת נייר ועד חתונת זהב. עם קישור לברכות מוכנות." path="/wedding/anniversary-ideas" structuredData={faqSchema(ANNIVERSARY_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה מתחתנים', href: '/wedding' }, { label: 'יום נישואים' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">💞 יום נישואים: רעיונות לחגיגה ולמתנה</h1>
    <p className="mx-auto max-w-2xl text-center text-lg text-[var(--muted-foreground)]">איך חוגגים יום נישואים בשנה הראשונה, בשנה העשרים או בשנת החמישים? כאן יש רעיונות לפי שנה, מתנות להורים ליום הנישואים שלהם ולינק לברכות מוכנות.</p>

    <YearFinder />

    <section className="mt-10" aria-labelledby="years-title">
      <h2 id="years-title" className="text-3xl font-bold">🗓️ רעיונות לפי שנה</h2>
      <p className="text-[var(--muted-foreground)]">השמות המסורתיים הם מסורת מערבית ואין בהם חובה. הרעיונות כאן פשוטים וקלים לביצוע.</p>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {ANNIVERSARY_YEARS.map(r => <li key={r.y} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><h3 className="m-0 text-lg font-bold">שנה {r.y}: {r.name}</h3><p className="m-0 mt-1 text-[var(--muted-foreground)]">{r.idea}</p></li>)}
      </ul>
    </section>

    <section className="mt-10" aria-labelledby="gifts-title">
      <h2 id="gifts-title" className="text-3xl font-bold">🎁 מתנה להורים ליום הנישואים שלהם</h2>
      <p className="text-[var(--muted-foreground)]">להורים לא חסר דבר. מה שהם רוצים לראות הוא שהילדים זוכרים, מעריכים ובאים. כמה רעיונות אישיים:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {PARENT_GIFTS.map(g => <div key={g.t} className="rounded-2xl bg-rose-50 p-4"><h3 className="m-0 text-lg font-bold">{g.t}</h3><p className="m-0 mt-1 text-[var(--muted-foreground)]">{g.d}</p></div>)}
      </div>
    </section>

    <section className={`mt-10 text-center ${CARD}`}>
      <h2 className="m-0 text-2xl font-bold">💌 צריכים ברכה?</h2>
      <p className="my-2">12 ברכות מוכנות ליום נישואים: לבן או בת זוג, להורים ולזוגות ותיקים.</p>
      <Link to="/greetings/anniversary" className="inline-block rounded-xl bg-rose-600 px-5 py-2 font-bold text-white">לברכות ליום נישואים</Link>
    </section>

    <div className="mt-12"><SeoBody
      paragraphs={['יום נישואים לא חייב להיות גדול. מה שמרגש הוא תשומת הלב: מכתב, ארוחה שקטה, אלבום תמונות או סתם ערב שבו אף אחד לא רץ לשום מקום.', 'ואם אתם מתכננים חתונה, בעמוד בוגה מתחתנים תמצאו הזמנות, אישורי הגעה, סידור הושבה ושבע ברכות.']}
      faq={ANNIVERSARY_FAQ}
      related={[
        { label: 'ברכה ליום נישואים', href: '/greetings/anniversary' },
        { label: 'שבע ברכות', href: '/wedding/sheva-brachot' },
        { label: 'בוגה מתחתנים', href: '/wedding' },
        { label: 'ברכות ליום הולדת', href: '/birthday-greetings' },
      ]}
    /></div>
  </div>
}

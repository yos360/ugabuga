import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import {
  TRIVIA_WA_SECTIONS, TRIVIA_WA_HUB, TRIVIA_WA_BASE, sectionById, sectionPath, questionId, questionShareText, allTriviaQuestions,
} from '../../data/content/triviaWithAnswers'
import '../../learn/learn.css'
import './triviaWithAnswers.css'

const SITE = 'https://ugabuga.co.il'
const HUB_CRUMB = { label: 'שאלות טריוויה עם תשובות', href: TRIVIA_WA_BASE }
const TOTAL = allTriviaQuestions().length

const RELATED = [
  { label: 'טריוויה לפי נושא', href: '/trivia/topics' },
  { label: 'חידון טריוויה עם ניקוד', href: '/tools/trivia-quiz' },
  { label: 'בדיחות קרש', href: '/jokes/keresh' },
  { label: 'חידות לפי נושא', href: '/riddles/topics' },
]

const PRINT_FAQ = { q: 'אפשר להדפיס את השאלות בלי התשובות?', a: 'כן. בכפתור "הדפסה" מקבלים דף שאלות עם מקום לכתוב תשובה, ואחריו דף תשובות נפרד למנחה. אפשר גם לשמור כ־PDF ולשלוח להורים או לצוות.' }

// How to run a trivia night — the hub's main body copy.
const HOST_TIPS = [
  { t: '🎂 טריוויה ביום הולדת', d: 'מחלקים את הילדים לשתי או שלוש קבוצות עם שמות מצחיקים, ונותנים לכל קבוצה לוח מחיק או דף ועט. 15–20 שאלות הן בדיוק מספיק — כ־20 דקות, לפני שהריכוז נגמר. בסוף כולם מקבלים פרס קטן, והקבוצה המנצחת בוחרת את השיר הבא.' },
  { t: '🏫 חידון בכיתה או בגן', d: 'מדפיסים את דף השאלות לכל קבוצה ושומרים את דף התשובות אצל המורה. אחרי כל תשובה מקריאים את ה"הידעתם?" — זה החלק שהילדים זוכרים הכי הרבה. בגן מקריאים בקול ונותנים לילדים להצביע.' },
  { t: '🍽️ ערב טריוויה משפחתי', d: 'מערבבים קטגוריות: שאלה לילדים, שאלה בידע כללי, שאלה על ישראל — כך שלכל אחד בשולחן יש סיכוי. קבוצות של ילד ומבוגר עובדות הכי טוב, וכדאי לתת לצעירים לענות ראשונים.' },
  { t: '🚗 בנסיעה ארוכה', d: 'מי שיושב ליד הנהג מקריא, וכל השאר עונים. אין צורך בנקודות — מספיק לראות מי מנחש ראשון. ואפשר להוסיף כלל: מי שטעה ממציא את השאלה הבאה.' },
]

const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

export function TriviaWithAnswers() {
  const { section } = useParams()
  const sec = section ? sectionById(section) : null
  if (section && !sec) return <NotFound />
  return <Page key={section || 'all'} sec={sec} />
}

function Page({ sec }) {
  const isHub = !sec
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(() => new Set())
  const [printing, setPrinting] = useState(false)
  const shown = isHub ? TRIVIA_WA_SECTIONS.filter(s => !filter || s.id === filter) : [sec]

  // A shared question arrives as …#kids-easy-3: bring it into view (its answer stays hidden).
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    const el = document.getElementById('q-' + id)
    if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('is-target') }
  }, [])

  const shownIds = shown.flatMap(s => s.questions.map((_, i) => questionId(s.id, i)))
  const allOpen = shownIds.every(id => open.has(id))
  const toggle = id => setOpen(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const shareQuestion = (s, q, id) => shareOnWhatsApp(`${questionShareText(q)}\n${shareLink(sectionPath(s.id), 'trivia_question')}#${id}`)

  const faq = isHub ? [...TRIVIA_WA_HUB.faq, PRINT_FAQ] : [...sec.faq, PRINT_FAQ, { q: 'יש עוד שאלות טריוויה עם תשובות?', a: `כן. בעמוד הראשי של שאלות הטריוויה עם תשובות יש ${TOTAL} שאלות בשמונה קטגוריות — לילדים, למשפחה, ידע כללי, ישראל, מדע, ספורט וגאוגרפיה.` }]
  const path = isHub ? TRIVIA_WA_BASE : sectionPath(sec.id)
  const quizSchema = {
    '@context': 'https://schema.org', '@type': 'Quiz', name: isHub ? TRIVIA_WA_HUB.h1 : sec.h1, inLanguage: 'he', url: SITE + path,
    educationalLevel: isHub ? 'ילדים, נוער ומבוגרים' : sec.audience,
    hasPart: (isHub ? TRIVIA_WA_SECTIONS : [sec]).flatMap(s => s.questions.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } }))),
  }
  const printTitle = isHub ? (filter ? `שאלות טריוויה — ${sectionById(filter).label}` : 'שאלות טריוויה עם תשובות') : sec.h1

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={isHub ? TRIVIA_WA_HUB.title : sec.title} description={isHub ? TRIVIA_WA_HUB.description : sec.description} path={path} structuredData={[faqSchema(faq), quizSchema]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'טריוויה', href: '/trivia/topics' }, ...(isHub ? [{ label: HUB_CRUMB.label }] : [HUB_CRUMB, { label: sec.label }])]} />

    <header className="text-center">
      <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 font-bold text-[#1d2233]">{isHub ? `${TOTAL} שאלות · 8 קטגוריות · בחינם` : `${sec.questions.length} שאלות · ${sec.audience}`}</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{isHub ? '🧠' : sec.emoji} </span>{isHub ? TRIVIA_WA_HUB.h1 : sec.h1}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{isHub
        ? 'שאלות טריוויה לילדים ולכל המשפחה — כל שאלה עם תשובה ו"הידעתם?" קצר. לוחצים "הצג תשובה", מדפיסים דף שאלות ודף תשובות, או שולחים שאלה לחברים בוואטסאפ.'
        : sec.intro}</p>
    </header>

    <nav className="no-print mt-6 flex flex-wrap justify-center gap-2" aria-label="קטגוריות">
      {isHub ? <>
        <Chip on={!filter} onClick={() => setFilter('')}>הכול ({TOTAL})</Chip>
        {TRIVIA_WA_SECTIONS.map(s => <Chip key={s.id} on={filter === s.id} onClick={() => setFilter(s.id)}><span aria-hidden="true">{s.emoji}</span> {s.label}</Chip>)}
      </> : <>
        <Link to={TRIVIA_WA_BASE} className="ln-chip">כל השאלות ({TOTAL})</Link>
        {TRIVIA_WA_SECTIONS.map(s => s.id === sec.id
          ? <span key={s.id} className="ln-chip twa-current" aria-current="page"><span aria-hidden="true">{s.emoji}</span> {s.label}</span>
          : <Link key={s.id} to={sectionPath(s.id)} className="ln-chip"><span aria-hidden="true">{s.emoji}</span> {s.label}</Link>)}
      </>}
    </nav>

    <div className="no-print mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn alt" aria-pressed={allOpen} onClick={() => setOpen(allOpen ? new Set() : new Set(shownIds))}>{allOpen ? '🙈 הסתרת כל התשובות' : '👀 הצג את כל התשובות'}</button>
      <button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>🖨️ הדפסה: שאלות + דף תשובות</button>
      <Link to="/tools/trivia-quiz" className="ln-btn go inline-flex items-center">🎮 מצב חידון עם ניקוד</Link>
    </div>

    {shown.map(s => <section key={s.id} className="mt-10" aria-labelledby={`h-${s.id}`}>
      <div className="twa-head">
        {isHub ? <h2 id={`h-${s.id}`} className="text-2xl font-black sm:text-3xl"><span aria-hidden="true">{s.emoji}</span> {s.label} <small className="twa-aud">{s.audience}</small></h2>
          : <h2 id={`h-${s.id}`} className="text-2xl font-black sm:text-3xl">{s.questions.length} שאלות ותשובות</h2>}
        {isHub && <Link to={sectionPath(s.id)} className="font-bold underline">לעמוד {s.h1.replace(/ \(.*\)$/, '')} ←</Link>}
      </div>
      <ol className="twa-list">{s.questions.map((q, i) => {
        const id = questionId(s.id, i), isOpen = open.has(id)
        return <li key={id} id={'q-' + id} className="twa-q">
          <p className="twa-text"><span className="twa-num">{i + 1}</span>{q.q}</p>
          <div className="no-print flex flex-wrap gap-2">
            <button type="button" className="ln-chip" aria-expanded={isOpen} aria-controls={'a-' + id} onClick={() => toggle(id)}>{isOpen ? 'הסתר תשובה' : 'הצג תשובה'}</button>
            <button type="button" className="ln-chip twa-wa" onClick={() => shareQuestion(s, q, id)} aria-label={`שליחת השאלה בוואטסאפ: ${q.q}`}>💬 שליחה בוואטסאפ</button>
          </div>
          <div id={'a-' + id} className="twa-answer" hidden={!isOpen}>
            <p className="m-0"><b>תשובה:</b> {q.a}</p>
            <p className="m-0 mt-1"><b>💡 הידעתם?</b> {q.fact}</p>
          </div>
        </li>
      })}</ol>
    </section>)}

    {isHub ? <section className="mt-12" aria-labelledby="host">
      <h2 id="host" className="mb-2 text-2xl font-black sm:text-3xl">איך עורכים ערב טריוויה לילדים ולמשפחה</h2>
      <p className="mb-4 text-lg leading-relaxed">טריוויה טובה לא דורשת הרבה: מנחה אחד, דף שאלות, קצת פרסים קטנים ומצב רוח טוב. הנה איך עושים את זה במסיבה, בכיתה ובבית.</p>
      <div className="grid gap-3 sm:grid-cols-2">{HOST_TIPS.map(h => <div key={h.t} className="ln-box"><h3 className="mb-1 text-lg font-black">{h.t}</h3><p className="m-0 leading-relaxed">{h.d}</p></div>)}</div>
    </section> : <section className="mt-12 ln-box">
      <h2 className="mb-2 text-2xl font-black">עוד קטגוריות של שאלות עם תשובות</h2>
      <ul className="twa-more">{TRIVIA_WA_SECTIONS.filter(s => s.id !== sec.id).map(s => <li key={s.id}><Link to={sectionPath(s.id)} className="font-bold underline">{s.emoji} {s.h1.replace(/ \(.*\)$/, '')}</Link> <span className="text-[var(--muted-foreground)]">· {s.audience}</span></li>)}</ul>
    </section>}

    {printing && <PrintPreview title={printTitle} onClose={() => setPrinting(false)}>
      <article className="buga-flow twa-print" dir="rtl">
        <h2>{printTitle}</h2>
        <p className="twa-print-sub">שם / קבוצה: ____________________ · ניקוד: ______</p>
        {shown.map(s => <div key={s.id}>
          {shown.length > 1 && <h3>{s.emoji} {s.label}</h3>}
          <ol>{s.questions.map((q, i) => <li key={i}>{q.q}<span className="twa-line" /></li>)}</ol>
        </div>)}
      </article>
      <article className="buga-flow twa-print" dir="rtl">
        <h2>דף תשובות למנחה</h2>
        <p className="twa-print-sub">{printTitle}</p>
        {shown.map(s => <div key={s.id}>
          {shown.length > 1 && <h3>{s.emoji} {s.label}</h3>}
          <ol>{s.questions.map((q, i) => <li key={i}><b>{q.a}</b> — {q.fact}</li>)}</ol>
        </div>)}
      </article>
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={isHub ? [
      `בעמוד הזה ${TOTAL} שאלות טריוויה עם תשובות, מסודרות לפי קושי וקהל: שאלות קלות לילדים בגיל 6–9, שאלות מאתגרות לגיל 9–12, שאלות לכל המשפחה, ואחר כך ידע כללי, ישראל, מדע וטבע, ספורט וגאוגרפיה. לכל תשובה מצורף "הידעתם?" — משפט אחד שהופך ניחוש לעוד משהו שלמדנו.`,
      'כל התשובות נבדקו מול כמה מקורות. בחרנו בכוונה שאלות שהתשובה עליהן לא משתנה עם השנים — בלי שיאי עולם שנשברים, בלי "הבניין הגבוה בעולם" שמתחלף, ובלי נושאים שנויים במחלוקת — כך שאפשר להדפיס את הדפים ולהשתמש בהם שוב ושוב.',
      'רוצים חידון אמיתי עם ניקוד? בחידון הטריוויה של האתר בוחרים תשובה מתוך ארבע וצוברים נקודות, ובטריוויה לפי נושא יש עשרות חידונים — חיות, חלל, חגים, מוזיקה ועוד.',
    ] : [
      `${sec.h1}: ${sec.questions.length} שאלות, ולכל אחת תשובה קצרה והסבר של משפט אחד. ${sec.intro}`,
      'אפשר לחשוף כל תשובה בנפרד, לחשוף את כולן בבת אחת למנחה, או להדפיס דף שאלות עם מקום לכתיבה ודף תשובות נפרד. כל התשובות נבדקו מול כמה מקורות, ונבחרו כך שיישארו נכונות גם בעוד כמה שנים.',
    ]} faq={faq} related={isHub ? RELATED : [HUB_CRUMB, ...RELATED]} /></div>
  </div>
}

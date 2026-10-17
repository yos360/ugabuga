import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { bugaPediaUrl, CLASSROOM_SUBJECTS, subjectById } from '../../data/classroomSubjects'
import { recordBugaPediaQuery } from '../../utils/bugapediaAnalytics'
import { searchBugaPedia } from '../../utils/bugapediaSearch'
import './bugapedia.css'

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').trim()
}

function SubjectCatalog() {
  return <section className="bp-subjects" aria-labelledby="bp-subjects-title">
    <div className="bp-section-title"><span>כל מקצוע מתחיל בשאלה</span><h2 id="bp-subjects-title">מקצועות הלימוד בבוגה־פדיה</h2><p>בחרו מקצוע ואז שאלה מוכנה, או כתבו כל דבר שעולה לכם לראש.</p></div>
    <div className="bp-subject-grid">{CLASSROOM_SUBJECTS.map(subject => <article key={subject.id} style={{ '--subject': subject.color }}>
      <div className="bp-subject-head"><i>{subject.icon}</i><h3>{subject.name}</h3></div>
      <div className="bp-examples">{subject.examples.map(example => <Link key={example} to={bugaPediaUrl(example, subject.id)}>{example}</Link>)}</div>
      {subject.href && <Link className="bp-site-link" to={subject.href}>לתרגול ולפעילויות באתר ←</Link>}
    </article>)}</div>
  </section>
}

const SOURCE_NAMES = {
  'he-wikipedia': 'ויקיפדיה העברית',
  'en-wikipedia': 'ויקיפדיה באנגלית',
  'he-wiktionary': 'ויקימילון העברי',
  wikidata: 'ויקינתונים',
  sefaria: 'ספריא',
  hebcal: 'Hebcal — לוח השנה העברי',
}
const LICENSES = {
  wikidata: 'נתוני ויקינתונים זמינים לשימוש חופשי (CC0).',
  hebcal: 'נתוני Hebcal זמינים לפי רישיון CC BY 4.0.',
  sefaria: 'התוכן מספריא, ספרייה דיגיטלית ללא מטרות רווח, בכפוף לרישיון המצוין בעמוד המקור.',
}

function sourceNote(result) {
  if (result.computed) return 'התשובה חושבה ישירות בבוגה־פדיה, בלי מקור חיצוני.'
  if (result.verified) return 'התשובה נוסחה ונבדקה מראש, ומצורף קישור למקור פתוח להמשך קריאה.'
  const name = SOURCE_NAMES[result.source] || result.sourceLabel || 'מקור מידע פתוח'
  const license = LICENSES[result.source] || 'התוכן זמין לפי רישיון CC BY-SA; בוגה־פדיה אינה משנה את נוסח המקור.'
  return `התשובה נשלפה בזמן אמת מהמקור: ${name}. ${license}`
}

export default function BugaPedia() {
  const [params, setParams] = useSearchParams()
  // The URL is the single source of truth: sample links and Back/Forward change ?q=.
  const asked = cleanText(params.get('q') || '').slice(0, 180)
  const subjectId = params.get('subject')
  const subject = useMemo(() => subjectById(subjectId), [subjectId])
  const [query, setQuery] = useState(asked)
  const [syncedAsked, setSyncedAsked] = useState(asked)
  const [attempt, setAttempt] = useState(0)
  const [tooShort, setTooShort] = useState(false)
  // Outcome of the last finished search, tagged with the search it belongs to.
  const [outcome, setOutcome] = useState({ key: '', state: 'idle', pages: [], ambiguous: false })
  // When a question is unclear the child picks what they meant; the pick is tied to the search it belongs to.
  const [picked, setPicked] = useState({ key: '', id: '' })
  const searchKey = `${asked}|${subject?.id || ''}|${attempt}`

  // Keep the input in sync when ?q= changes from outside the form (links, Back/Forward).
  if (syncedAsked !== asked) { setSyncedAsked(asked); setQuery(asked); setTooShort(false) }

  useEffect(() => {
    if (!asked) return
    const controller = new AbortController()
    const key = `${asked}|${subject?.id || ''}|${attempt}`
    searchBugaPedia(asked, controller.signal, subject?.id).then(results => {
      if (controller.signal.aborted) return
      setOutcome({ key, state: results.length ? 'ready' : 'empty', pages: [...results], ambiguous: Boolean(results.ambiguous) })
      recordBugaPediaQuery({ question: asked, subject: subject?.id, found: results.length > 0, resultTitle: results[0]?.title })
    }).catch(error => {
      if (controller.signal.aborted || error.name === 'AbortError') return
      // Network failures, blocked and self-harm questions are not recorded.
      setOutcome({ key, state: ['short', 'blocked', 'selfharm'].includes(error.message) ? error.message : 'error', pages: [], ambiguous: false })
    })
    return () => controller.abort()
  }, [asked, subject?.id, attempt])

  const state = tooShort ? 'short' : !asked ? 'idle' : outcome.key === searchKey ? outcome.state : 'loading'
  const found = outcome.key === searchKey ? outcome.pages : []
  const pickedId = picked.key === searchKey ? picked.id : ''
  const choosing = state === 'ready' && outcome.key === searchKey && outcome.ambiguous && !pickedId
  // The chosen meaning moves to the top; the other meanings stay below as "אולי התכוונתם גם ל…".
  const pages = pickedId ? [...found.filter(page => page.id === pickedId), ...found.filter(page => page.id !== pickedId)] : found
  const choose = id => setPicked({ key: searchKey, id })

  const ask = event => {
    event.preventDefault()
    const next = cleanText(query).slice(0, 180)
    setTooShort(next.length < 2)
    if (next.length < 2) return
    if (next === asked) { setAttempt(value => value + 1); return }
    const nextParams = new URLSearchParams(params)
    nextParams.set('q', next)
    setParams(nextParams)
  }
  const requestIdea = () => window.dispatchEvent(new CustomEvent('buga-chat-open', { detail: { topic: 'רעיון או תוכן ייחודי', message: asked ? `חיפשתי בבוגה־פדיה: ${asked}\nאשמח שתוסיפו תוכן בנושא הזה.` : 'יש לי רעיון לתוכן או פעילות ייחודית:' } }))
  const primary = pages[0]

  return <div className="bugapedia-page" dir="rtl">
    <SEO title="בוגה־פדיה — שואלים ומגלים בכל מקצוע" description="מחפשים תשובה בעברית במקורות ידע פתוחים: אנציקלופדיה, מילון, נתונים וחישובים, תמיד עם ציון המקור." path="/bugapedia" />
    <div className="bugapedia-shell">
      <Breadcrumbs items={[{ label: 'בית', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'בוגה־פדיה' }]} />
      <header className="bp-hero">
        <div className="bp-mark" aria-hidden="true">בּ</div>
        <p>{subject ? `${subject.icon} ${subject.name}` : 'האנציקלופדיה הסקרנית של עוגה בוגה'}</p>
        <h1>בוגה־פדיה</h1>
        <h2>שאלה אחת. עולם שלם לגלות.</h2>
        <form className="bp-search" onSubmit={ask} role="search">
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="למשל: למה השמיים כחולים?" aria-label="השאלה שלכם" maxLength={180} autoFocus />
          <button>חיפוש תשובה</button>
        </form>
        <div className="bp-trust"><span>✓ תשובות ממקורות פתוחים ומידע בדוק</span><span>↗ עם קישור למקור</span><span>🔒 בלי הרשמה</span></div>
        <p className="bp-analytics-note">השאלה נשמרת בלי שם, כדי לשפר את בוגה־פדיה. אל תכתבו בה פרטים אישיים כמו טלפון או כתובת.</p>
      </header>

      {state === 'loading' && <section className="bp-answer bp-loading" role="status"><div /><p>מחפשים בכמה מקורות מידע…</p></section>}
      {state === 'short' && <p className="bp-message" role="alert">כתבו לפחות שתי אותיות כדי שנוכל לחפש.</p>}
      {state === 'error' && <p className="bp-message" role="alert">אין חיבור — נסו שוב. <button type="button" onClick={() => setAttempt(value => value + 1)}>לנסות שוב</button></p>}
      {state === 'blocked' && <section className="bp-answer bp-empty" role="alert"><span>🤝</span><h2>זו שאלה שכדאי לשאול מבוגר שאתם סומכים עליו</h2><p>בוגה־פדיה לא מחפשת בנושא הזה. אפשר לדבר עליו עם הורה, מורה או מבוגר אחר שאתם סומכים עליו — ובינתיים לשאול כאן כל שאלה סקרנית אחרת.</p></section>}
      {state === 'selfharm' && <section className="bp-answer bp-empty" role="alert"><span>💛</span><h2>אתם לא לבד, ומגיע לכם שיקשיבו לכם</h2><p>אם עצוב או קשה לכם עכשיו, ספרו על זה להורה, למורה או ליועצת בבית הספר. אפשר גם להתקשר לער״ן — קו חם לתמיכה רגשית בטלפון <a href="tel:1201"><b>1201</b></a>, בכל שעה. אם יש סכנה מיידית — חייגו 101 (מד״א).</p></section>}
      {state === 'empty' && <section className="bp-answer bp-empty"><span>🔎</span><h2>עוד אין תשובה אמינה לשאלה הזאת</h2><p>נסו לנסח את השאלה אחרת או לכתוב שם מדויק של אדם, מקום, אירוע, מילה או מושג. אפשר גם לשלוח לנו בקשה ונבדוק מה כדאי להוסיף.</p><button onClick={requestIdea}>שליחת בקשה אישית</button></section>}
      {choosing && <section className="bp-choose" aria-live="polite">
        <h2>למה התכוונתם?</h2>
        <p>מצאנו כמה תשובות אפשריות לשאלה הזאת. בחרו את מה שחיפשתם:</p>
        <div>{found.slice(0, 3).map(page => <button type="button" key={page.id} onClick={() => choose(page.id)}>
          <b>{page.title}</b><span>{page.extract.slice(0, 110)}{page.extract.length > 110 ? '…' : ''}</span>
        </button>)}</div>
      </section>}
      {state === 'ready' && primary && !choosing && <section className="bp-results" aria-live="polite">
        <article className="bp-answer">
          {primary.image && <img src={primary.image} alt="" loading="lazy" />}
          <div><p className="bp-kicker">{primary.sourceLabel || 'התשובה שמצאנו'}</p><h2>{primary.title}</h2><p className="bp-extract">{primary.extract}</p>
            <div className="bp-answer-actions">{primary.url && <a href={primary.url} target="_blank" rel="noopener noreferrer">{primary.linkLabel || 'לקריאה במקור ↗'}</a>}<button onClick={requestIdea}>רוצים תוכן מיוחד בנושא הזה?</button></div>
          </div>
        </article>
        {pages.length > 1 && <div className="bp-related"><h3>אולי התכוונתם גם ל…</h3><div>{pages.slice(1).map(page => {
          const body = <><b>{page.title}</b><span>{page.extract.slice(0, 130)}{page.extract.length > 130 ? '…' : ''}</span></>
          return page.url ? <a href={page.url} target="_blank" rel="noopener noreferrer" key={page.id}>{body}</a> : <div key={page.id}>{body}</div>
        })}</div></div>}
        <p className="bp-license">{sourceNote(primary)} בנושאים רפואיים, משפטיים או בטיחותיים יש לבדוק גם מקור מקצועי.</p>
      </section>}

      <SubjectCatalog />
      <section className="bp-custom"><div><span>💡</span><h2>לא מצאתם בדיוק את מה שרציתם?</h2><p>ספרו לנו מה חסר — פעילות לכיתה, נושא לימודי, משחק או רעיון שעוד לא קיים. נעים לנו לקבל רעיונות.</p></div><button onClick={requestIdea}>יש לי רעיון בשבילכם</button></section>
    </div>
  </div>
}

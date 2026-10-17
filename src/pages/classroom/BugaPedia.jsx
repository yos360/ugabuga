import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { bugaPediaUrl, CLASSROOM_SUBJECTS, subjectById } from '../../data/classroomSubjects'
import { recordBugaPediaQuery } from '../../utils/bugapediaAnalytics'
import { bugaPediaSearchTerms, findBugaPediaKnowledge } from '../../data/bugapediaKnowledge'
import './bugapedia.css'

const API = 'https://he.wikipedia.org/w/api.php'

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').trim()
}

async function searchWikipedia(question, signal) {
  const query = cleanText(question)
  if (query.length < 2) throw new Error('short')
  const verified = findBugaPediaKnowledge(query)
  if (verified) return [verified]
  const terms = bugaPediaSearchTerms(query)
  const search = terms.join(' ') || query
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: search, gsrlimit: '8',
    prop: 'extracts|pageimages|info', exintro: '1', explaintext: '1',
    exsentences: '8', piprop: 'thumbnail', pithumbsize: '900', inprop: 'url',
    redirects: '1', format: 'json', origin: '*', formatversion: '2',
  })
  const response = await fetch(`${API}?${params}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('network')
  const payload = await response.json()
  const pages = (payload?.query?.pages || [])
    .filter(page => !page.missing && cleanText(page.extract))
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
    .map(page => ({
      id: page.pageid,
      title: page.title,
      extract: cleanText(page.extract),
      url: page.fullurl || `https://he.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      image: page.thumbnail?.source || '',
      sourceLabel: 'ויקיפדיה העברית',
      linkLabel: 'לערך המלא בוויקיפדיה ↗',
      score: terms.filter(term => `${page.title} ${page.extract}`.toLocaleLowerCase('he-IL').includes(term)).length,
    }))
    .filter(page => page.score >= Math.min(2, Math.max(1, terms.length)))
    .sort((a, b) => b.score - a.score || (a.index ?? 999) - (b.index ?? 999))
  return pages.slice(0, 6)
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

export default function BugaPedia() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') || ''
  const [query, setQuery] = useState(initial)
  const [asked, setAsked] = useState(initial)
  const [pages, setPages] = useState([])
  const [state, setState] = useState(initial ? 'loading' : 'idle')
  const subject = useMemo(() => subjectById(params.get('subject')), [params])

  useEffect(() => {
    if (!asked) return
    const controller = new AbortController()
    setState('loading')
    searchWikipedia(asked, controller.signal).then(results => {
      setPages(results)
      setState(results.length ? 'ready' : 'empty')
      recordBugaPediaQuery({ question: asked, subject: subject?.id, found: results.length > 0, resultTitle: results[0]?.title })
    }).catch(error => {
      if (error.name !== 'AbortError') { setState(error.message === 'short' ? 'short' : 'error'); recordBugaPediaQuery({ question: asked, subject: subject?.id, found: false }) }
    })
    return () => controller.abort()
  }, [asked, subject?.id])

  const ask = event => {
    event.preventDefault()
    const next = cleanText(query)
    if (next.length < 2) { setState('short'); return }
    const nextParams = new URLSearchParams(params)
    nextParams.set('q', next)
    setParams(nextParams)
    setAsked(next)
  }
  const requestIdea = () => window.dispatchEvent(new CustomEvent('buga-chat-open', { detail: { topic: 'רעיון או תוכן ייחודי', message: asked ? `חיפשתי בבוגה־פדיה: ${asked}\nאשמח שתוסיפו תוכן בנושא הזה.` : 'יש לי רעיון לתוכן או פעילות ייחודית:' } }))
  const primary = pages[0]

  return <div className="bugapedia-page" dir="rtl">
    <SEO title="בוגה־פדיה — שואלים ומגלים בכל מקצוע" description="מחפשים תשובה בעברית בכל מקצוע לימוד דרך ויקיפדיה, עם מקור פתוח וקישור לערך המלא." path="/bugapedia" />
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
        <div className="bp-trust"><span>✓ תשובות ממקורות פתוחים ומידע בדוק</span><span>↗ תמיד עם קישור למקור</span><span>🔒 בלי הרשמה</span></div>
        <p className="bp-analytics-note">השאלה נשמרת ללא שם או פרטים אישיים, כדי לשפר את בוגה־פדיה.</p>
      </header>

      {state === 'loading' && <section className="bp-answer bp-loading" role="status"><div /><p>מחפשים את הערך המתאים…</p></section>}
      {state === 'short' && <p className="bp-message" role="alert">כתבו לפחות שתי אותיות כדי שנוכל לחפש.</p>}
      {state === 'error' && <p className="bp-message" role="alert">לא הצלחנו להגיע לוויקיפדיה כרגע. נסו שוב בעוד רגע.</p>}
      {state === 'empty' && <section className="bp-answer bp-empty"><span>🔎</span><h2>עוד אין תשובה טובה לשאלה הזאת</h2><p>נסו לכתוב שם של אדם, מקום, אירוע או מושג. אפשר גם לשלוח לנו בקשה ונבדוק מה כדאי להוסיף לאתר.</p><button onClick={requestIdea}>שליחת בקשה אישית</button></section>}
      {state === 'ready' && primary && <section className="bp-results" aria-live="polite">
        <article className="bp-answer">
          {primary.image && <img src={primary.image} alt="" />}
          <div><p className="bp-kicker">{primary.sourceLabel || 'התשובה שמצאנו'}</p><h2>{primary.title}</h2><p className="bp-extract">{primary.extract}</p>
            <div className="bp-answer-actions"><a href={primary.url} target="_blank" rel="noopener noreferrer">{primary.linkLabel || 'לערך המלא בוויקיפדיה ↗'}</a><button onClick={requestIdea}>רוצים תוכן מיוחד בנושא הזה?</button></div>
          </div>
        </article>
        {pages.length > 1 && <div className="bp-related"><h3>אולי התכוונתם גם ל…</h3><div>{pages.slice(1).map(page => <a href={page.url} target="_blank" rel="noopener noreferrer" key={page.id}><b>{page.title}</b><span>{page.extract.slice(0, 130)}{page.extract.length > 130 ? '…' : ''}</span></a>)}</div></div>}
        <p className="bp-license">{primary.verified ? 'התשובה נוסחה ונבדקה מראש, ומצורף קישור למקור פתוח להמשך קריאה.' : 'התשובה נשלפה בזמן אמת מוויקיפדיה העברית. התוכן זמין לפי רישיון CC BY-SA; בוגה־פדיה אינה משנה את נוסח המקור.'} בנושאים רפואיים, משפטיים או בטיחותיים יש לבדוק גם מקור מקצועי.</p>
      </section>}

      <SubjectCatalog />
      <section className="bp-custom"><div><span>💡</span><h2>לא מצאתם בדיוק את מה שרציתם?</h2><p>ספרו לנו מה חסר — פעילות לכיתה, נושא לימודי, משחק או רעיון שעוד לא קיים. נעים לנו לקבל רעיונות.</p></div><button onClick={requestIdea}>יש לי רעיון בשבילכם</button></section>
    </div>
  </div>
}

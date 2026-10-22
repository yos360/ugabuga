import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { bugaPediaUrl, CLASSROOM_SUBJECTS, subjectById } from '../../data/classroomSubjects'
import { askBugaPediaAI } from '../../utils/bugapediaAI'
import { recordBugaPediaQuery } from '../../utils/bugapediaAnalytics'
import { checkBugaPediaQuery } from '../../utils/bugapediaSafety'
import { searchBugaPedia } from '../../utils/bugapediaSearch'
import { clearHistory, isFavorite, readFavorites, readHistory, rememberQuestion, siteLinksFor, toggleFavorite } from '../../utils/bugapediaLocal'
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

// The questions asked and starred on this device (localStorage only).
function MyQuestions({ version }) {
  const [, bump] = useState(0)
  const favorites = readFavorites(), history = readHistory().slice(0, 12)
  void version
  if (!favorites.length && !history.length) return null
  const chip = item => <Link key={`${item.q}|${item.subject}`} to={bugaPediaUrl(item.q, item.subject || undefined)}>{item.q}</Link>
  return <section className="bp-subjects bp-mine" aria-labelledby="bp-mine-title">
    <div className="bp-section-title"><h2 id="bp-mine-title">השאלות שלי</h2><p>נשמרות רק במכשיר הזה.</p></div>
    {favorites.length > 0 && <><h3>⭐ מועדפות</h3><div className="bp-examples">{favorites.map(chip)}</div></>}
    {history.length > 0 && <><h3>🕘 שאלתי לאחרונה <button type="button" className="bp-clear" onClick={() => { clearHistory(); bump(v => v + 1) }}>ניקוי</button></h3><div className="bp-examples">{history.map(chip)}</div></>}
  </section>
}

// "Practice it here": pages on this site that fit the question.
function SiteLinks({ question, answer }) {
  const [links, setLinks] = useState({ key: '', items: [] })
  const key = question + '|' + (answer || '').slice(0, 40)
  useEffect(() => {
    let alive = true
    siteLinksFor(question, answer).then(items => { if (alive) setLinks({ key, items }) }).catch(() => {})
    return () => { alive = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const items = links.key === key ? links.items : []
  if (!items.length) return null
  return <div className="bp-site-links"><h3>🎯 רוצים להמשיך באתר?</h3><div>{items.map(item => <Link key={item.to} to={item.to}><span aria-hidden="true">{item.emoji}</span> <b>{item.title}</b>{item.desc && <small>{item.desc}</small>}</Link>)}</div></div>
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
  const young = params.get('level') === 'young'
  const [favVersion, setFavVersion] = useState(0)
  const [query, setQuery] = useState(asked)
  const [syncedAsked, setSyncedAsked] = useState(asked)
  const [attempt, setAttempt] = useState(0)
  const [tooShort, setTooShort] = useState(false)
  // Outcome of the last finished search, tagged with the search it belongs to.
  const [outcome, setOutcome] = useState({ key: '', state: 'idle', pages: [], ambiguous: false })
  // When a question is unclear the child picks what they meant; the pick is tied to the search it belongs to.
  const [picked, setPicked] = useState({ key: '', id: '' })
  const searchKey = `${asked}|${subject?.id || ''}|${attempt}|${params.get('level') === 'young' ? 'y' : ''}`
  // The written answer (Claude, from encyclopedia excerpts) arrives separately from the search results.
  const [written, setWritten] = useState({ key: '', state: 'idle', data: null })

  // Keep the input in sync when ?q= changes from outside the form (links, Back/Forward).
  if (syncedAsked !== asked) { setSyncedAsked(asked); setQuery(asked); setTooShort(false) }

  useEffect(() => {
    if (!asked) return
    const controller = new AbortController()
    const key = `${asked}|${subject?.id || ''}|${attempt}|${params.get('level') === 'young' ? 'y' : ''}`
    searchBugaPedia(asked, controller.signal, subject?.id).then(results => {
      if (controller.signal.aborted) return
      setOutcome({ key, state: results.length ? 'ready' : 'empty', pages: [...results], ambiguous: Boolean(results.ambiguous) })
    }).catch(error => {
      if (controller.signal.aborted || error.name === 'AbortError') return
      // Network failures, blocked and self-harm questions are not recorded (see the effect below).
      setOutcome({ key, state: ['short', 'blocked', 'selfharm'].includes(error.message) ? error.message : 'error', pages: [], ambiguous: false })
    })
    return () => controller.abort()
  }, [asked, subject?.id, attempt])

  useEffect(() => {
    if (!asked || asked.length < 2 || checkBugaPediaQuery(asked)) return
    const controller = new AbortController()
    const key = `${asked}|${subject?.id || ''}|${attempt}|${young ? 'y' : ''}`
    askBugaPediaAI(asked, subject?.id, controller.signal, young ? 'young' : undefined)
      .then(data => { if (!controller.signal.aborted) setWritten({ key, state: data ? 'ready' : 'none', data }) })
      .catch(() => { if (!controller.signal.aborted) setWritten({ key, state: 'none', data: null }) })
    return () => controller.abort()
  }, [asked, subject?.id, attempt, young])

  const searchState = tooShort ? 'short' : !asked ? 'idle' : outcome.key === searchKey ? outcome.state : 'loading'
  const writtenState = written.key === searchKey ? written.state : asked && !checkBugaPediaQuery(asked) ? 'loading' : 'none'
  const answer = writtenState === 'ready' ? written.data : null
  // A written answer replaces "no answer found" and connection errors; checked answers keep their own card.
  const state = answer && ['empty', 'error'].includes(searchState) ? 'ready' : ['empty', 'error'].includes(searchState) && writtenState === 'loading' ? 'loading' : searchState
  const found = outcome.key === searchKey ? outcome.pages : []
  const pickedId = picked.key === searchKey ? picked.id : ''
  const checked = found[0]?.verified || found[0]?.computed
  // While the written answer is on its way, one loading message — not a meaning-picker or raw results under it.
  const writing = state === 'ready' && writtenState === 'loading' && !checked
  const choosing = state === 'ready' && !writing && !answer && outcome.key === searchKey && outcome.ambiguous && !pickedId
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
  const reportMistake = () => window.dispatchEvent(new CustomEvent('buga-chat-open', { detail: { topic: 'טעות בבוגה־פדיה', message: `שאלתי בבוגה־פדיה: ${asked}\nנראה לי שיש טעות בתשובה: ` } }))
  const starred = asked ? (void favVersion, isFavorite(asked, subject?.id)) : false
  const primary = pages[0]
  const showWritten = answer && !(primary?.verified || primary?.computed)
  // Under a written answer, "further reading" lists only the articles the answer actually used —
  // the raw search can surface a namesake ("להמציא את אנה" for "מי המציא את השפה הרוסית").
  const usedUrls = new Set((answer?.sources || []).map(source => source.url))
  const reading = showWritten ? pages.filter(page => usedUrls.has(page.url)) : pages
  // A picture for the written answer: the encyclopedia article it relied on, when that has one.
  const writtenImage = showWritten ? (pages.find(page => usedUrls.has(page.url) && page.image)?.image || null) : null

  // Once the search and the written answer have both settled, record the question with what was shown.
  const settled = outcome.key === searchKey && writtenState !== 'loading' && (['ready', 'empty'].includes(outcome.state) || Boolean(answer))
  useEffect(() => {
    // The owner's "open as the visitor saw it" link is not a new question.
    if (!settled || params.get('from') === 'owner') return
    const shown = showWritten ? { text: answer.answer, url: answer.sources[0]?.url, written: true } : primary ? { text: primary.extract, url: primary.url, written: false } : null
    if (primary || answer) { rememberQuestion(asked, subject?.id); setFavVersion(v => v + 1) }
    recordBugaPediaQuery({ question: asked, subject: subject?.id, found: Boolean(primary || answer), resultTitle: primary?.title, shown })
  }, [settled, searchKey]) // eslint-disable-line react-hooks/exhaustive-deps

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

      {(state === 'loading' || writing) && <section className="bp-answer bp-loading" role="status"><div /><p>{writing || outcome.key === searchKey ? '✨ בוגה־פדיה כותבת לכם תשובה…' : 'מחפשים בכמה מקורות מידע…'}</p></section>}
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
      {state === 'ready' && showWritten && <section className="bp-results" aria-live="polite">
        <article className="bp-answer bp-written">
          {writtenImage && <img src={writtenImage} alt="" loading="lazy" />}
          <div><p className="bp-kicker">✨ התשובה של בוגה־פדיה{young ? ' · בפשטות' : ''}</p><h2>{asked}</h2><p className="bp-extract">{answer.answer}</p>
            {!answer.confident && <p className="bp-unsure">לא בטוחים בכל הפרטים — כדאי לבדוק גם במקור או לשאול מורה.</p>}
            {answer.sources.length > 0 && <div className="bp-answer-actions">{answer.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</div>}
            <div className="bp-answer-tools">
              <button type="button" onClick={() => { toggleFavorite(asked, subject?.id); setFavVersion(v => v + 1) }} aria-pressed={starred}>{starred ? '⭐ שמור במועדפים' : '☆ שמירה במועדפים'}</button>
              <button type="button" onClick={() => { const next = new URLSearchParams(params); if (young) next.delete('level'); else next.set('level', 'young'); setParams(next) }}>{young ? '🎓 תשובה רגילה' : '🧸 תסבירו לי יותר פשוט'}</button>
              <button type="button" onClick={reportMistake}>👎 משהו לא נכון?</button>
            </div>
          </div>
        </article>
        <SiteLinks question={asked} answer={answer.answer} />
        <p className="bp-license">🤖 את התשובה כתבה בינה מלאכותית, על סמך ערכים מוויקיפדיה ומקורות פתוחים שמופיעים בקישורים. בוגה בודק, אבל גם בוגה טועה לפעמים — בדברים חשובים כדאי לבדוק במקור או לשאול מורה.</p>
      </section>}
      {state === 'ready' && !writing && reading[0] && !choosing && <section className="bp-results" aria-live="polite">
        {showWritten && <h3 className="bp-more-title">לקריאה נוספת</h3>}
        <article className={showWritten ? 'bp-answer bp-secondary' : 'bp-answer'}>
          {reading[0].image && !writtenImage && <img src={reading[0].image} alt="" loading="lazy" />}
          <div><p className="bp-kicker">{reading[0].sourceLabel || 'התשובה שמצאנו'}</p><h2>{reading[0].title}</h2><p className="bp-extract">{reading[0].extract}</p>
            <div className="bp-answer-actions">{reading[0].url && <a href={reading[0].url} target="_blank" rel="noopener noreferrer">{reading[0].linkLabel || 'לקריאה במקור ↗'}</a>}<button onClick={requestIdea}>רוצים תוכן מיוחד בנושא הזה?</button></div>
          </div>
        </article>
        {reading.length > 1 && <div className="bp-related"><h3>אולי התכוונתם גם ל…</h3><div>{reading.slice(1).map(page => {
          const body = <><b>{page.title}</b><span>{page.extract.slice(0, 130)}{page.extract.length > 130 ? '…' : ''}</span></>
          return page.url ? <a href={page.url} target="_blank" rel="noopener noreferrer" key={page.id}>{body}</a> : <div key={page.id}>{body}</div>
        })}</div></div>}
        {!showWritten && <SiteLinks question={asked} answer={reading[0].extract} />}
        <p className="bp-license">{sourceNote(reading[0])} בנושאים רפואיים, משפטיים או בטיחותיים יש לבדוק גם מקור מקצועי.</p>
      </section>}

      <MyQuestions version={favVersion} />
      <SubjectCatalog />
      <section className="bp-custom"><div><span>💡</span><h2>לא מצאתם בדיוק את מה שרציתם?</h2><p>ספרו לנו מה חסר — פעילות לכיתה, נושא לימודי, משחק או רעיון שעוד לא קיים. נעים לנו לקבל רעיונות.</p></div><button onClick={requestIdea}>יש לי רעיון בשבילכם</button></section>
    </div>
  </div>
}

import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import NotFound from '../pages/NotFound'
import { TRAFFIC_SIGNS, SIGN_CATEGORIES, SIGN_SOURCE, filterSigns, findSign, signPath, signTitle, signDescription } from './signsData'
import { AGE_GROUPS, makeQuestions, makeAgeExam, flashcardSet } from './signsQuiz'
import './signs.css'

const hubFaq = [
  { q: 'האם הצבע לבדו מספיק כדי לזהות תמרור?', a: 'לא. מסתכלים יחד על הצורה, הצבע והסמל. למשל, כחול יכול להופיע גם בתמרור הוריה וגם בתמרור מידע.' },
  { q: 'האם זהו לוח התמרורים המלא?', a: `זהו מקבץ לימודי של ${TRAFFIC_SIGNS.length} תמרורים שנבדקו מול לוח משרד התחבורה, נוסח ספטמבר 2022. הוא אינו כולל את כל התמרורים, סימוני הכביש והרמזורים.` },
]
function Frame({ title, description, path, faq = [], children }) {
  return <div className="signs-page" dir="rtl">
    <SEO title={title} description={description} path={path} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, ...(path === '/signs' ? [{ label: 'תמרורים' }] : [{ label: 'תמרורים', href: '/signs' }, { label: title }])]} />
    <h1>{title}</h1>{children}
  </div>
}
function SignImage({ sign, quiz = false }) { return <img src={sign.image} alt={quiz ? 'תמרור לזיהוי בשאלה' : `תמרור ${sign.number}: ${sign.name}`} width="200" height="200" /> }
function SignCard({ sign }) { return <Link className="sign-card" to={signPath(sign)}><SignImage sign={sign} /><span><small>תמרור {sign.number}</small><strong>{sign.name}</strong></span></Link> }
function CategorySelect({ value, onChange, id }) { return <label htmlFor={id}>קבוצת תמרורים<select id={id} value={value} onChange={e => onChange(e.target.value)}><option value="all">כל הקבוצות</option>{SIGN_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label> }
export function SignsHub() {
  const [query, setQuery] = useState(''), [category, setCategory] = useState('all'), [page, setPage] = useState(0)
  const matches = filterSigns(query, category), pages = Math.ceil(matches.length / 12), visible = matches.slice(page * 12, (page + 1) * 12)
  return <Frame title="תמרורים בישראל — לומדים לזהות ולהבין" description="תמרורים לילדים, הורים ובני נוער: חיפוש לפי שם ומספר, הסברים, משחק זיהוי, מבחן לפי גיל וכרטיסיות להדפסה." path="/signs" faq={hubFaq}>
    <p className="signs-lead">מה אומר המשולש? למה העיגול אדום? בוחרים תמרור, מגלים מה הוא אומר ומתרגלים איך להתנהג בדרך.</p>
    <nav className="signs-actions" aria-label="פעילויות תמרורים"><Link to="/signs/game">משחק זיהוי וכרטיסיות</Link><Link to="/signs/theory">מבחן תרגול לפי גיל</Link></nav>
    <section aria-labelledby="sign-groups"><h2 id="sign-groups">מכירים את המשפחות</h2><div className="signs-groups">{SIGN_CATEGORIES.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => { setCategory(c.id); setPage(0) }}><strong>{c.name}</strong><span>{c.hint}</span></button>)}</div></section>
    <section aria-labelledby="find-sign"><h2 id="find-sign">מחפשים תמרור</h2><div className="signs-filters"><label htmlFor="sign-search">שם, מספר או מילה מההסבר<input id="sign-search" type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(0) }} placeholder="למשל: 302 או אופניים" /></label><CategorySelect id="hub-category" value={category} onChange={v => { setCategory(v); setPage(0) }} /></div>
      <p role="status">נמצאו {matches.length} תמרורים{pages > 0 && ` · עמוד ${page + 1} מתוך ${pages}`}</p>
      <div className="signs-grid">{visible.map(sign => <SignCard key={sign.number} sign={sign} />)}</div>
      {!matches.length && <p>לא נמצאה התאמה במקבץ הזה. נסו מספר או מילה אחרים, או בחרו בכל הקבוצות.</p>}
      {pages > 1 && <nav className="signs-pagination" aria-label="עמודי תמרורים"><button disabled={!page} onClick={() => setPage(p => p - 1)}>הקודם</button>{Array.from({ length: pages }, (_, i) => <button key={i} aria-current={page === i ? 'page' : undefined} onClick={() => setPage(i)}>{i + 1}</button>)}<button disabled={page === pages - 1} onClick={() => setPage(p => p + 1)}>הבא</button></nav>}
    </section>
    <SeoBody paragraphs={['לומדים את המשמעות ולא רק את הציור: בכל דף תמצאו הסבר, מקום טיפוסי שבו פוגשים את התמרור והכוונה נפרדת לנהג, לרוכב ולהולך הרגל.', 'האיורים צוירו מחדש לצורך הלמידה על פי הצורות והצבעים במקור הרשמי. השמות הם כותרות קצרות לפי פירוש התמרור; תנאי המקום, שילוט נלווה והוראות אחרות ממשיכים לחול.']} faq={hubFaq} related={[{ href: '/signs/game', label: 'משחק זיהוי' }, { href: '/signs/theory', label: 'תרגול לפי גיל' }]} />
    <p className="signs-source"><a href={SIGN_SOURCE} target="_blank" rel="noreferrer">לוח התמרורים הרשמי — משרד התחבורה, ספטמבר 2022</a></p>
  </Frame>
}
function PracticeQuestion({ sign }) {
  const [selected, setSelected] = useState(null), q = sign.question
  return <section className="signs-panel" aria-labelledby="practice-title"><h2 id="practice-title">בודקים שהבנו</h2><p>{q.prompt}</p><div className="signs-answers">{q.options.map((option, i) => <button key={option} disabled={selected !== null} onClick={() => setSelected(i)}>{option}</button>)}</div>{selected !== null && <p role="status"><strong>{selected === q.answer ? 'נכון! ' : 'כדאי לזכור: '}</strong>{q.explanation}</p>}</section>
}
export function SignPage() {
  const { number } = useParams(), sign = findSign(number)
  if (!sign) return <NotFound />
  return <SignDetail key={sign.number} sign={sign} />
}
function SignDetail({ sign }) {
  const faq = [{ q: `מה אומר תמרור ${sign.number}?`, a: sign.meaning }, { q: `היכן פוגשים את תמרור ${sign.number}?`, a: sign.where }, { q: 'איך מבדילים בינו לבין תמרורים קרובים?', a: `השוו את הצורה והסמל לתמרורים ${sign.similar.join(', ')} המופיעים בהמשך. ${sign.question.explanation}` }]
  return <Frame title={signTitle(sign)} description={signDescription(sign)} path={signPath(sign)} faq={faq}>
    <div className="signs-detail"><div className="signs-art"><SignImage sign={sign} /><p>{SIGN_CATEGORIES.find(c => c.id === sign.category).name}</p></div><div><h2>מה התמרור אומר?</h2><p>{sign.meaning}</p><h2>איפה פוגשים אותו?</h2><p>{sign.where}</p></div></div>
    <section><h2>איך מתנהגים בדרך?</h2><dl className="signs-roles"><div><dt>נהגים</dt><dd>{sign.driver}</dd></div><div><dt>רוכבי אופניים</dt><dd>{sign.cyclist}</dd></div><div><dt>הולכי רגל</dt><dd>{sign.pedestrian}</dd></div></dl></section>
    <PracticeQuestion sign={sign} />
    <section><h2>תמרורים שקל לבלבל ביניהם</h2><p>השוו את צורת המסגרת, כיוון החץ והסמל לפני שבוחרים תשובה.</p><div className="signs-grid">{sign.similar.map(n => <SignCard key={n} sign={findSign(n)} />)}</div></section>
    <SeoBody paragraphs={[sign.meaning, `${sign.where} ${sign.driver}`, `ברכיבה: ${sign.cyclist} בהליכה: ${sign.pedestrian}`]} faq={faq} related={[{ href: '/signs', label: 'כל התמרורים במקבץ' }, { href: '/signs/theory', label: 'מבחן תרגול לפי גיל' }]} />
    <p className="signs-source"><a href={sign.source} target="_blank" rel="noreferrer">מקור המשמעות והמספר: לוח משרד התחבורה, עמ׳ {sign.sourcePage}</a>. הסבר לימודי מקוצר; לשילוט הנלווה ולהסדרי המקום יש משמעות. האיור מקורי ברישיון <a href={sign.artwork.licenseUrl}>CC0</a>.</p>
  </Frame>
}
function Quiz({ questions, onRestart, exam = false }) {
  const [answers, setAnswers] = useState([]), [index, setIndex] = useState(0)
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus() }, [index])
  const current = questions[index], selected = answers[index]
  if (index === questions.length) {
    const correct = answers.filter((a, i) => a === questions[i].answer).length
    return <section className="signs-panel" aria-labelledby="results-title"><h2 id="results-title" ref={heading} tabIndex={-1}>סיימתם לתרגל!</h2><p role="status">{correct} תשובות נכונות מתוך {questions.length}</p><p>זהו ציון לתרגול בלבד. אפשר לחזור להסברים ולנסות שוב.</p><ol className="signs-review">{questions.map((q, i) => <li key={q.sign.number}><Link to={signPath(q.sign)}>{signTitle(q.sign)}</Link><p>{answers[i] === q.answer ? '✓ תשובה נכונה' : 'כדאי לחזור על השאלה'}</p><p>בחרתם: {q.options[answers[i]]}</p><p>התשובה: {q.options[q.answer]}</p><p>{q.explanation}</p></li>)}</ol><button onClick={onRestart}>תרגול חדש</button></section>
  }
  return <section className="signs-panel signs-quiz" aria-labelledby="question-title"><p>שאלה {index + 1} מתוך {questions.length}</p><progress aria-label="התקדמות" value={index} max={questions.length} /><SignImage sign={current.sign} quiz /><h2 id="question-title" ref={heading} tabIndex={-1}>{current.prompt}</h2><div className="signs-answers">{current.options.map((option, i) => <button key={option} aria-pressed={selected === i} disabled={selected !== undefined} onClick={() => setAnswers(a => [...a, i])}>{option}</button>)}</div>{selected !== undefined && <div role="status">{!exam && <p><strong>{selected === current.answer ? 'נכון! ' : 'התשובה הנכונה: '}</strong>{current.options[current.answer]}<br />{current.explanation}</p>}<button onClick={() => setIndex(i => i + 1)}>{index + 1 === questions.length ? 'לציון ולהסברים' : 'השאלה הבאה'}</button></div>}</section>
}
function Flashcards({ signs, setNumber = 1 }) {
  return <div className="buga-a4 signs-flash-sheet" dir="rtl"><h2>כרטיסיות תמרורים — קבוצה {setNumber}</h2><p>גוזרים מסביב לכל זוג, מקפלים בקו האמצעי ומדביקים גב אל גב.</p><div className="signs-flash-grid">{signs.map(s => <div className="signs-flash-pair" key={s.number}><svg className="signs-cut-lines" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="198" height="198" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" /><path d="M100 1V199" fill="none" stroke="#777" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" /></svg><div><SignImage sign={s} /><small>{s.number}</small></div><div><strong>{s.name}</strong><small>תמרור {s.number}</small></div></div>)}</div></div>
}
const gameFaq = [{ q: 'איך משחקים?', a: 'בוחרים קבוצה או ערבוב, מתחילים ומזהים את התמרור מתוך שלוש תשובות. אחרי כל תשובה מקבלים הסבר.' }, { q: 'איך מכינים כרטיסיות דו־צדדיות?', a: 'מדפיסים A4 חד־צדדי, גוזרים כל זוג ומקפלים במרכז: מצד אחד האיור ומצד שני השם. אפשר לבחור כמה דפים; כל דף ממשיך לתמרורים הבאים בקבוצה, ובסיום המקבץ מתחיל סבב חדש.' }]
export function SignsGame() {
  const [category, setCategory] = useState('all'), [questions, setQuestions] = useState(null), [run, setRun] = useState(0), [printing, setPrinting] = useState(false)
  const pool = filterSigns('', category)
  function start() { setQuestions(makeQuestions(pool, 10)); setRun(r => r + 1) }
  return <Frame title="משחק תמרורים וכרטיסיות להדפסה" description="מזהים תמרורים במשחק עם הסברים, בוחרים קבוצת תמרורים ומדפיסים כרטיסיות מתקפלות עם תמונה ושם על דפי A4." path="/signs/game" faq={gameFaq}>
    <p className="signs-lead">מזהים, בודקים ומסבירים במילים שלכם. אחרי המשחק אפשר להכין כרטיסיות לתרגול משותף.</p><CategorySelect id="game-category" value={category} onChange={v => { setCategory(v); setQuestions(null) }} /><div className="signs-actions"><button onClick={start}>{questions ? 'ערבוב ומשחק חדש' : 'מתחילים לשחק'}</button><button onClick={() => setPrinting(true)}>כרטיסיות — הדפסה או PDF</button><Link to="/signs/theory">למבחן לפי גיל</Link></div>
    {questions && <Quiz key={run} questions={questions} onRestart={start} />}
    {printing && <PrintPreview title="כרטיסיות תמרורים" onClose={() => setPrinting(false)} variant={i => <Flashcards signs={flashcardSet(pool, i)} setNumber={i + 1} />}><Flashcards signs={flashcardSet(pool, 0)} /></PrintPreview>}
    <SeoBody paragraphs={['המשחק מציג את האיור בלי לחשוף את שמו. בכל סבב מתרגלים עד עשרה תמרורים שונים מהקבוצה שבחרתם.', 'הכרטיסיות מיועדות לקיפול ולא להדפסה דו־צדדית אוטומטית, כך שהתמונה והשם נשארים מחוברים גם במדפסת ביתית פשוטה.']} faq={gameFaq} />
  </Frame>
}
const theoryFaq = [{ q: 'האם זהו מבחן התיאוריה הרשמי?', a: 'לא. זהו מבחן תרגול בתמרורים בלבד מתוך המקבץ באתר, בלי הגבלת זמן. הוא אינו כולל את כל נושאי התיאוריה או את מאגר השאלות הרשמי, והציון אינו ציון רישוי.' }, { q: 'איך הגיל משנה את התרגול?', a: 'בגילאי 6–9 מזהים סמלים; בגילאי 10–12 מתרגלים הליכה ושבילים; בגילאי 13–15 נוסף דגש על רכיבה וזכות קדימה; מגיל 16 מתרגלים גם הוראות והגבלות לנהיגה. החלוקה לימודית ואינה קובעת גיל היתר לשימוש ברכב.' }]
export function SignsTheory() {
  const [ageId, setAgeId] = useState('6-9'), [questions, setQuestions] = useState(null), [run, setRun] = useState(0)
  const age = AGE_GROUPS.find(a => a.id === ageId)
  function start() { setQuestions(makeAgeExam(ageId)); setRun(r => r + 1) }
  return <Frame title="מבחן תרגול בתמרורים לפי גיל" description="תרגול תמרורים לפי גיל: זיהוי לילדים, הליכה ורכיבה בטוחה, זכות קדימה ונהיגה לבני נוער. ציון והסברים בסיום." path="/signs/theory" faq={theoryFaq}>
    <p className="signs-lead">בוחרים קבוצת גיל ומתרגלים בקצב שלכם. בסיום מקבלים ציון, הסבר לכל תשובה וקישור ללמידה נוספת.</p><p className="signs-note">תרגול לימודי בתמרורים בלבד — אינו מבחן התיאוריה הרשמי המלא.</p><label htmlFor="theory-age">למי מיועד התרגול?<select id="theory-age" value={ageId} onChange={e => { setAgeId(e.target.value); setQuestions(null) }}>{AGE_GROUPS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select></label><p>{age.intro}</p><button onClick={start}>{questions ? 'מבחן חדש באותה קבוצת גיל' : `מתחילים — ${age.count} שאלות`}</button>
    {questions && <Quiz key={run} questions={questions} onRestart={start} exam />}
    <SeoBody paragraphs={['במבחן בוחרים תשובה אחת לכל שאלה. התשובה ננעלת אחרי הבחירה, וההסברים מופיעים בסיום כדי לאפשר תרגול עצמאי.', 'אפשר לשנות קבוצת גיל ולהתחיל מחדש. אין איסוף של תאריך לידה, אין צורך בחשבון ואין שמירה של הציון לאחר יציאה מהעמוד.']} faq={theoryFaq} related={[{ href: '/signs', label: 'לומדים לפני התרגול' }, { href: '/signs/game', label: 'משחק עם משוב אחרי כל שאלה' }]} />
  </Frame>
}



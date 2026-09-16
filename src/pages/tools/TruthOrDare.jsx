import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'

const STORAGE_KEY = 'ugabuga.truthOrBuga.seen.v2'

const TOPICS = {
  animals: {
    label: '🐾 חיות',
    items: [
      ['לפיל יש חדק', true], ['דולפינים הם דגים', false], ['לחתולים יש שפם שעוזר להם להרגיש מרחקים', true], ['פינגווינים יכולים לעוף', false],
      ['ג׳ירפה היא אחת החיות הגבוהות בעולם', true], ['כריש הוא יונק', false], ['כלבים יכולים ללמוד פקודות', true], ['דבורה מייצרת דבש', true],
      ['לעכבישים יש שש רגליים', false], ['צב יכול להכניס את הראש לשריון', true], ['אריה חי בדרך כלל בלהקה', true], ['נחש הוא חסר חוליות', false],
      ['תמנון הוא בעל חיים חכם מאוד', true], ['לפרפר יש עצמות כמו לאדם', false], ['עטלפים הם יונקים', true], ['קנגורו חי בטבע באוסטרליה', true],
      ['לכל הדגים יש ריאות כמו לבני אדם', false], ['דבורה אחת יכולה לבנות כוורת לבד ביום אחד', false], ['ינשופים פעילים הרבה פעמים בלילה', true], ['זברה היא סוס שצבעו נצבע ביד אדם', false],
      ['לווייתן הוא יונק ולא דג', true], ['תרנגולת יכולה להטיל ביצים', true], ['צפרדע מתחילה את חייה כראשן', true], ['כל הנחשים ארסיים', false],
      ['לכלב יש חוש ריח מפותח מאוד', true], ['חתול תמיד נוחת בלי להיפגע מכל גובה', false], ['נמלים חיות במושבות', true], ['דג זהב זוכר רק שלוש שניות', false],
    ],
  },
  space: {
    label: '🚀 חלל',
    items: [
      ['כדור הארץ מקיף את השמש', true], ['השמש היא כוכב', true], ['הירח מפיץ אור משלו כמו מנורה', false], ['מאדים נקרא לפעמים הכוכב האדום', true],
      ['אפשר לנשום בחלל בלי חליפה', false], ['שנה בכדור הארץ נמשכת בערך 365 ימים', true], ['שבתאי מפורסם בטבעות שלו', true], ['הירח גדול יותר מכדור הארץ', false],
      ['אסטרונאוטים משתמשים בציוד מיוחד בחלל', true], ['כל כוכבי הלכת באותו גודל', false], ['כוכב חמה קרוב יותר לשמש מכדור הארץ', true], ['החלל ריק לגמרי מכל דבר', false],
      ['צדק הוא כוכב הלכת הגדול ביותר במערכת השמש', true], ['פלוטו נחשב כיום כוכב לכת רגיל בדיוק כמו כדור הארץ', false], ['לכדור הארץ יש ירח אחד טבעי', true], ['למאדים יש שני ירחים קטנים', true],
      ['השמש מסתובבת סביב כדור הארץ פעם ביום', false], ['טלסקופ עוזר לראות עצמים רחוקים', true], ['שביל החלב הוא שם של גלקסיה', true], ['מטאוריט הוא סוכרייה מהחלל', false],
      ['כוח המשיכה על הירח חלש יותר מאשר בכדור הארץ', true], ['ונוס חם מאוד בגלל האטמוספרה שלו', true], ['כל הכוכבים נמצאים במרחק זהה מאיתנו', false], ['תחנת החלל הבינלאומית מקיפה את כדור הארץ', true],
      ['אסטרונומיה היא חקר החלל והכוכבים', true], ['הירח עשוי מגבינה', false], ['כדור הארץ מסתובב סביב עצמו', true], ['שמש היא כוכב לכת', false],
    ],
  },
  israel: {
    label: '🇮🇱 ישראל',
    items: [
      ['ירושלים היא עיר הבירה של ישראל', true], ['הים התיכון נמצא ממזרח לישראל', false], ['ים המלח הוא מקום נמוך מאוד ביחס לפני הים', true], ['הכנרת היא אגם מים מתוקים', true],
      ['אילת נמצאת בצפון ישראל', false], ['עברית היא שפה רשמית בישראל', true], ['חיפה נמצאת על הכרמל', true], ['החרמון נמצא בדרום הנגב', false],
      ['תל אביב נמצאת ליד הים', true], ['בישראל אין מדבר', false], ['הנגב נמצא בדרום ישראל', true], ['נהר הירדן קשור לכנרת', true],
      ['מצדה נמצאת במדבר יהודה', true], ['הכותל המערבי נמצא בתל אביב', false], ['בישראל יש חופים בים התיכון', true], ['באר שבע נמצאת בנגב', true],
      ['הגליל נמצא בדרום הרחוק', false], ['ישראל גובלת בירדן', true], ['העיר צפת נמצאת בגליל', true], ['ים סוף נוגע באילת', true],
      ['הכרמל הוא אזור הררי', true], ['ירקון הוא שם של נהר בישראל', true], ['הכנרת מלוחה יותר מים המלח', false], ['החרמון מושלג לפעמים בחורף', true],
      ['הנגב מכסה חלק גדול מדרום ישראל', true], ['חיפה היא עיר בלי נמל', false], ['בישראל יש ארבע עונות שנה מוכרות', true], ['העיר אילת נמצאת ליד הים התיכון', false],
    ],
  },
  sports: {
    label: '⚽ ספורט',
    items: [
      ['בכדורגל משחקים בעיקר עם הרגליים', true], ['בכדורסל המטרה היא לקלוע לסל', true], ['בטניס משתמשים במחבט', true], ['שוער בכדורגל חייב תמיד לעמוד באמצע המגרש', false],
      ['מרתון הוא ריצה ארוכה מאוד', true], ['בכדורעף אסור שהכדור יעבור מעל הרשת', false], ['שחייה מתקיימת במים', true], ['כל משחק ספורט חייב להיות עם כדור', false],
      ['קבוצה טובה צריכה שיתוף פעולה', true], ['בייסבול משחקים עם מחבט וכדור', true], ['בכדורסל אסור לכדרר', false], ['אימון יכול לשפר יכולת ספורטיבית', true],
      ['בכדורגל יש בדרך כלל 11 שחקנים בכל קבוצה על המגרש', true], ['בגולף המטרה היא להכניס כדור לחור', true], ['ריצה היא תמיד ספורט קבוצתי בלבד', false], ['שופט עוזר לשמור על חוקי המשחק', true],
      ['בכדוריד מותר בדרך כלל להשתמש בידיים', true], ['בסקי מחליקים על שלג או משטח מתאים', true], ['כל שחקן חייב לנצח בכל משחק כדי ליהנות', false], ['בענפי ספורט רבים יש חימום לפני פעילות', true],
      ['בטניס שולחן משתמשים בכדור קטן', true], ['אגרוף מתבצע בתוך בריכה', false], ['אולימפיאדה מתקיימת כל שנה בדיוק', false], ['רכיבה על אופניים יכולה להיות ספורט', true],
      ['בכדורעף משחקים עם רשת', true], ['כדורגל וכדורסל הם אותו משחק', false], ['במשחק קבוצתי תקשורת עוזרת לנצח', true], ['בפנדל בכדורגל בועטים לשער', true],
    ],
  },
  party: {
    label: '🎉 מסיבות',
    items: [
      ['בינגו יכול להיות משחק למסיבה', true], ['במסיבה חייבים תמיד להביא מפעיל מקצועי', false], ['חידון קצר יכול לעבוד בכיתה', true], ['חדר בריחה חייב להיות בחדר אמיתי עם מנעול אמיתי', false],
      ['טיימר עוזר לשמור על קצב משחק', true], ['כל משחק חייב להדיח משתתפים', false], ['אפשר לשחק בקבוצות גם בלי ציוד מיוחד', true], ['הסבר קצר לפני משחק עוזר לכולם להבין', true],
      ['מסיבה טובה חייבת להיות יקרה', false], ['דוגמאות מוכנות עוזרות להתחיל מהר', true], ['ילדים תמיד אוהבים אותו משחק בדיוק', false], ['אפשר להפוך חידה לשאלת טריוויה', true],
      ['משחק פתיחה קצר יכול לשבור את הקרח', true], ['צריך תמיד רעש חזק כדי שתהיה מסיבה טובה', false], ['אפשר לעשות פעילות מוצלחת גם בכיתה', true], ['חלוקה לקבוצות יכולה להפוך משחק לתחרותי', true],
      ['כל המשתתפים חייבים לרוץ בכל משחק', false], ['ניקוד ברור עוזר לשמור עניין', true], ['שאלה מצחיקה יכולה ליצור אווירה טובה', true], ['הפסקה קצרה בין משחקים יכולה לעזור', true],
      ['אי אפשר לשחק משחקים בלי פרסים', false], ['דף הוראות קצר יכול לעזור למנחה', true], ['משחק טוב צריך להתאים לגיל המשתתפים', true], ['כל פעילות חייבת להימשך שעה שלמה', false],
      ['אפשר להפוך נושא לימודי למשחק', true], ['קבוצות קטנות יכולות להשתתף גם במשחק גדול', true], ['אין צורך להסביר חוקים לפני משחק', false], ['כרטיסיות מוכנות עוזרות להתחיל מהר', true],
    ],
  },
  science: {
    label: '🔬 מדע',
    items: [
      ['מים רותחים בערך ב־100 מעלות צלזיוס בגובה פני הים', true], ['קרח הוא מים במצב מוצק', true], ['צמחים צריכים אור כדי לבצע פוטוסינתזה', true], ['מגנט מושך כל חומר בעולם', false],
      ['אוויר תופס מקום', true], ['האדם צריך חמצן כדי לחיות', true], ['ברזל יכול להחליד', true], ['צל נוצר כשמשהו חוסם אור', true],
      ['קול עובר גם בלי חומר בכלל בריק מוחלט', false], ['חשמל יכול להיות מסוכן אם משתמשים בו לא נכון', true], ['כדור הארץ הוא שטוח לגמרי', false], ['למים אין שום משקל', false],
      ['חיידקים קטנים מאוד ואי אפשר לראות רבים מהם בלי מיקרוסקופ', true], ['כל הנוזלים הם מים', false], ['עננים עשויים מטיפות מים או גבישי קרח זעירים', true], ['מלח נמס במים', true],
      ['אש צריכה חמצן כדי לבעור', true], ['זכוכית שקופה תמיד בלתי שבירה', false], ['האור מהיר יותר מהקול', true], ['כוח הכבידה מושך דברים לכיוון מרכז כדור הארץ', true],
    ],
  },
  food: {
    label: '🍕 אוכל',
    items: [
      ['בננה גדלה על צמח גדול ולא על עץ עץ קלאסי', true], ['עגבנייה נחשבת מבחינה בוטנית פרי', true], ['שוקולד מיוצר מפולי קקאו', true], ['מלח הוא מתוק', false],
      ['לחם נאפה בדרך כלל מקמח ומים ועוד רכיבים', true], ['אורז גדל בשדה', true], ['פיצה הומצאה בישראל', false], ['גזר יכול להיות כתום', true],
      ['דבש מיוצר על ידי דבורים', true], ['כל הפירות גדלים בתוך האדמה', false], ['לימון חמוץ בדרך כלל', true], ['תפוח אדמה הוא פרי עץ', false],
      ['פסטה יכולה להגיע בצורות שונות', true], ['גלידה תמיד חייבת להיות חמה', false], ['זיתים משמשים להכנת שמן זית', true], ['חומוס עשוי מגרגירי חומוס', true],
      ['אבטיח מכיל הרבה מים', true], ['פלפל חריף תמיד מתוק', false], ['סלט יכול להכיל ירקות', true], ['תמרים גדלים על דקל', true],
    ],
  },
}

function loadSeen() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSeen(ids) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-500))) } catch { /* ignore */ }
}

function buildCards(customItems) {
  const base = Object.entries(TOPICS).flatMap(([topic, data]) => data.items.map(([text, truth], index) => ({ topic, text, truth, id: `${topic}-${index}` })))
  const custom = customItems.map((item, index) => ({ topic: 'custom', text: item.text, truth: item.truth, id: 'custom-' + index }))
  return [...base, ...custom]
}

export default function TruthOrDare() {
  const [topic, setTopic] = useState('animals')
  const [mode, setMode] = useState('solo')
  const [activeTeam, setActiveTeam] = useState(0)
  const [teamNames, setTeamNames] = useState(['קבוצה א׳', 'קבוצה ב׳'])
  const [teamScores, setTeamScores] = useState([0, 0])
  const [current, setCurrent] = useState(null)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 })
  const [seenIds, setSeenIds] = useState([])
  const [customText, setCustomText] = useState('')
  const [customTruth, setCustomTruth] = useState(true)
  const [customItems, setCustomItems] = useState([])

  useEffect(() => { setSeenIds(loadSeen()) }, [])

  const cards = useMemo(() => buildCards(customItems), [customItems])
  const visibleCards = topic === 'all' ? cards : cards.filter((item) => item.topic === topic)
  const remainingCount = visibleCards.filter((item) => !seenIds.includes(item.id)).length

  const updateSeen = (nextIds) => {
    setSeenIds(nextIds)
    saveSeen(nextIds)
  }

  const pick = () => {
    const pool = visibleCards.length ? visibleCards : cards
    const unseen = pool.filter((item) => !seenIds.includes(item.id))
    const usable = unseen.length ? unseen : pool
    const next = usable[Math.floor(Math.random() * usable.length)]
    const nextSeen = unseen.length ? [...seenIds, next.id] : [next.id]
    updateSeen(nextSeen)
    setCurrent(next)
    setAnswered(null)
  }

  const resetSeen = () => {
    updateSeen([])
    setCurrent(null)
    setAnswered(null)
  }

  const answer = (choice) => {
    if (!current || answered) return
    const correct = choice === current.truth
    setAnswered({ choice, correct })
    setScore((prev) => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1, streak: correct ? prev.streak + 1 : 0 }))
    if (mode === 'teams') {
      setTeamScores((prev) => prev.map((points, index) => index === activeTeam ? points + (correct ? 1 : 0) : points))
    }
  }

  const nextQuestion = () => {
    if (mode === 'teams') setActiveTeam((team) => (team + 1) % teamNames.length)
    pick()
  }

  const addCustom = () => {
    const text = customText.trim()
    if (!text) return
    setCustomItems((items) => [...items, { text, truth: customTruth }])
    setCustomText('')
  }

  const changeTeamName = (index, value) => {
    setTeamNames((names) => names.map((name, itemIndex) => itemIndex === index ? value : name))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="אמת או בוגה" description="משחק אמת או בוגה עם מאות משפטים, מצב לבד, מצב קבוצות, ניקוד וזיכרון שלא חוזר על שאלות שכבר הופיעו." path="/tools/truth-or-buga" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'אמת או בוגה' }]} />

      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl mb-2">🎭 אמת או בוגה</h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--ink)]/75">קוראים משפט, בוחרים אם הוא אמת או בוגה, וצוברים ניקוד. אפשר לשחק לבד או בתחרות קבוצות.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge color="yellow">✅ לבד: {score.correct}/{score.total}</Badge>
          <Badge color="green">🔥 רצף {score.streak}</Badge>
          <Badge color="blue">{visibleCards.length} משפטים בנושא</Badge>
          <Badge color="default">נשארו בלי חזרה: {remainingCount}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="grid gap-5 content-start">
          <section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich">
            <h2 className="text-2xl mb-3">מצב משחק</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button onClick={() => setMode('solo')} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${mode === 'solo' ? 'bg-[var(--postit)]' : 'bg-white'}`}>👤 לשחק לבד עם ניקוד</button>
              <button onClick={() => setMode('teams')} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${mode === 'teams' ? 'bg-[var(--postit)]' : 'bg-white'}`}>🏆 תחרות קבוצות</button>
            </div>
            {mode === 'teams' && (
              <div className="mt-4 grid gap-3">
                {teamNames.map((name, index) => (
                  <label key={index} className={`rounded-2xl border-2 border-[var(--border)] bg-white p-3 ${activeTeam === index ? 'ring-4 ring-[var(--postit)]' : ''}`}>
                    <span className="font-bold">{name}: {teamScores[index]} נק׳</span>
                    <input value={name} onChange={(event) => changeTeamName(index, event.target.value)} className="mt-2 w-full rounded-xl border-2 border-[var(--border)] px-3 py-1" />
                  </label>
                ))}
                <p className="font-hand text-lg">עכשיו משחקים: <strong>{teamNames[activeTeam]}</strong></p>
              </div>
            )}
          </section>

          <section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich">
            <h2 className="text-2xl mb-3">בחרו נושא</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setTopic('all'); setCurrent(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${topic === 'all' ? 'bg-[var(--postit)]' : 'bg-white'}`}>🌈 הכול</button>
              {Object.entries(TOPICS).map(([key, data]) => <button key={key} onClick={() => { setTopic(key); setCurrent(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${topic === key ? 'bg-[var(--postit)]' : 'bg-white'}`}>{data.label}</button>)}
              {customItems.length > 0 && <button onClick={() => { setTopic('custom'); setCurrent(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${topic === 'custom' ? 'bg-[var(--postit)]' : 'bg-white'}`}>✏️ שלי</button>}
            </div>
            <button onClick={resetSeen} className="mt-4 wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">איפוס שאלות שכבר הופיעו</button>
          </section>

          <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-rich">
            <h2 className="text-2xl mb-2">הכנה עצמית</h2>
            <p className="text-sm mb-3 text-[var(--ink)]/70">כתבו משפט, סמנו אם הוא אמת או בוגה, והוא נכנס למשחק.</p>
            <textarea value={customText} onChange={(event) => setCustomText(event.target.value)} rows={3} className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2" placeholder="לדוגמה: דולפינים הם דגים" />
            <div className="my-3 flex gap-2">
              <button onClick={() => setCustomTruth(true)} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-1 font-bold ${customTruth ? 'bg-[#4caf50] text-white' : 'bg-white'}`}>אמת</button>
              <button onClick={() => setCustomTruth(false)} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-1 font-bold ${!customTruth ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>בוגה</button>
            </div>
            <button onClick={addCustom} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">+ הוסיפו למשחק</button>
            {customItems.length > 0 && <p className="mt-3 text-sm">נוספו {customItems.length} משפטים משלכם.</p>}
          </section>
        </aside>

        <main>
          <section className="wobbly border-[3px] border-[var(--border)] bg-white p-6 text-center sketch-shadow-rich">
            {!current ? (
              <div className="py-12">
                <div className="text-6xl mb-4">🤔</div>
                <h2 className="text-3xl mb-3">מוכנים לגלות מה אמת ומה בוגה?</h2>
                <p className="mb-6 text-[var(--ink)]/70">המשחק ינסה לא לחזור על משפטים שכבר הופיעו אצל אותו משתמש.</p>
                <button onClick={pick} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--accent)] px-8 py-4 font-display text-2xl font-bold text-white">תנו לי משפט 🎲</button>
              </div>
            ) : (
              <div className="py-8">
                <div className="mb-5 flex flex-wrap justify-center gap-3">
                  <Badge color="yellow">מצב: {mode === 'teams' ? 'קבוצות' : 'לבד'}</Badge>
                  {mode === 'teams' && <Badge color="green">תור: {teamNames[activeTeam]}</Badge>}
                </div>
                <p className="font-hand text-lg text-[var(--muted-foreground)]">זה אמת או בוגה?</p>
                <h2 className="mx-auto my-8 max-w-3xl text-3xl sm:text-4xl leading-relaxed">{current.text}</h2>
                <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
                  <button onClick={() => answer(true)} disabled={Boolean(answered)} className="wobbly-md sketch-press min-h-[90px] border-[3px] border-[var(--border)] bg-[#4caf50] font-display text-3xl font-bold text-white disabled:opacity-70">אמת ✅</button>
                  <button onClick={() => answer(false)} disabled={Boolean(answered)} className="wobbly-md sketch-press min-h-[90px] border-[3px] border-[var(--border)] bg-[var(--accent)] font-display text-3xl font-bold text-white disabled:opacity-70">בוגה ❌</button>
                </div>
                {answered && (
                  <div className={`mx-auto mt-6 max-w-xl rounded-3xl border-2 border-[var(--border)] p-4 sketch-shadow-sm ${answered.correct ? 'bg-[#4caf50] text-white' : 'bg-[var(--postit)]'}`}>
                    <p className="text-2xl font-bold">{answered.correct ? 'נכון! 🎉' : `לא הפעם — זה היה ${current.truth ? 'אמת' : 'בוגה'}`}</p>
                    {mode === 'teams' && <p className="mt-2 font-hand text-lg">{answered.correct ? `${teamNames[activeTeam]} קיבלה נקודה` : `${teamNames[activeTeam]} לא קיבלה נקודה`}</p>}
                    <button onClick={nextQuestion} className="wobbly-sm mt-4 border-2 border-[var(--border)] bg-white px-4 py-2 font-bold text-[var(--ink)]">משפט הבא ⏭</button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {visibleCards.slice(0, 9).map((item) => <div key={item.id} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3 text-sm sketch-shadow-sm"><strong>{item.truth ? 'אמת' : 'בוגה'}:</strong> {item.text}</div>)}
          </section>
        </main>
      </div>
    </div>
  )
}

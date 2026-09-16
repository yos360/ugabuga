import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'

const TOPICS = {
  animals: {
    label: '🐾 חיות',
    items: [
      ['לפיל יש חדק', true], ['דולפינים הם דגים', false], ['לחתולים יש שפם שעוזר להם להרגיש מרחקים', true], ['פינגווינים יכולים לעוף', false],
      ['ג׳ירפה היא אחת החיות הגבוהות בעולם', true], ['כריש הוא יונק', false], ['כלבים יכולים ללמוד פקודות', true], ['דבורה מייצרת דבש', true],
      ['לעכבישים יש שש רגליים', false], ['צב יכול להכניס את הראש לשריון', true], ['אריה חי בדרך כלל בלהקה', true], ['נחש הוא חסר חוליות', false],
    ],
  },
  space: {
    label: '🚀 חלל',
    items: [
      ['כדור הארץ מקיף את השמש', true], ['השמש היא כוכב', true], ['הירח מפיץ אור משלו כמו מנורה', false], ['מאדים נקרא לפעמים הכוכב האדום', true],
      ['אפשר לנשום בחלל בלי חליפה', false], ['שנה בכדור הארץ נמשכת בערך 365 ימים', true], ['שבתאי מפורסם בטבעות שלו', true], ['הירח גדול יותר מכדור הארץ', false],
      ['אסטרונאוטים משתמשים בציוד מיוחד בחלל', true], ['כל כוכבי הלכת באותו גודל', false], ['כוכב חמה קרוב יותר לשמש מכדור הארץ', true], ['החלל ריק לגמרי מכל דבר', false],
    ],
  },
  israel: {
    label: '🇮🇱 ישראל',
    items: [
      ['ירושלים היא עיר הבירה של ישראל', true], ['הים התיכון נמצא ממזרח לישראל', false], ['ים המלח הוא מקום נמוך מאוד ביחס לפני הים', true], ['הכנרת היא אגם מים מתוקים', true],
      ['אילת נמצאת בצפון ישראל', false], ['עברית היא שפה רשמית בישראל', true], ['חיפה נמצאת על הכרמל', true], ['החרמון נמצא בדרום הנגב', false],
      ['תל אביב נמצאת ליד הים', true], ['בישראל אין מדבר', false], ['הנגב נמצא בדרום ישראל', true], ['נהר הירדן קשור לכנרת', true],
    ],
  },
  sports: {
    label: '⚽ ספורט',
    items: [
      ['בכדורגל משחקים בעיקר עם הרגליים', true], ['בכדורסל המטרה היא לקלוע לסל', true], ['בטניס משתמשים במחבט', true], ['שוער בכדורגל חייב תמיד לעמוד באמצע המגרש', false],
      ['מרתון הוא ריצה ארוכה מאוד', true], ['בכדורעף אסור שהכדור יעבור מעל הרשת', false], ['שחייה מתקיימת במים', true], ['כל משחק ספורט חייב להיות עם כדור', false],
      ['קבוצה טובה צריכה שיתוף פעולה', true], ['בייסבול משחקים עם מחבט וכדור', true], ['בכדורסל אסור לכדרר', false], ['אימון יכול לשפר יכולת ספורטיבית', true],
    ],
  },
  party: {
    label: '🎉 מסיבות',
    items: [
      ['בינגו יכול להיות משחק למסיבה', true], ['במסיבה חייבים תמיד להביא מפעיל מקצועי', false], ['חידון קצר יכול לעבוד בכיתה', true], ['חדר בריחה חייב להיות בחדר אמיתי עם מנעול אמיתי', false],
      ['טיימר עוזר לשמור על קצב משחק', true], ['כל משחק חייב להדיח משתתפים', false], ['אפשר לשחק בקבוצות גם בלי ציוד מיוחד', true], ['הסבר קצר לפני משחק עוזר לכולם להבין', true],
      ['מסיבה טובה חייבת להיות יקרה', false], ['דוגמאות מוכנות עוזרות להתחיל מהר', true], ['ילדים תמיד אוהבים אותו משחק בדיוק', false], ['אפשר להפוך חידה לשאלת טריוויה', true],
    ],
  },
}

function buildCards(customItems) {
  const base = Object.entries(TOPICS).flatMap(([topic, data]) => data.items.map(([text, truth]) => ({ topic, text, truth })))
  const custom = customItems.map((item, index) => ({ topic: 'custom', text: item.text, truth: item.truth, id: 'custom-' + index }))
  return [...base, ...custom].map((item, index) => ({ id: item.id || `${item.topic}-${index}`, ...item }))
}

export default function TruthOrDare() {
  const [topic, setTopic] = useState('animals')
  const [current, setCurrent] = useState(null)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 })
  const [customText, setCustomText] = useState('')
  const [customTruth, setCustomTruth] = useState(true)
  const [customItems, setCustomItems] = useState([])

  const cards = useMemo(() => buildCards(customItems), [customItems])
  const visibleCards = topic === 'all' ? cards : cards.filter((item) => item.topic === topic)

  const pick = () => {
    const pool = visibleCards.length ? visibleCards : cards
    const next = pool[Math.floor(Math.random() * pool.length)]
    setCurrent(next)
    setAnswered(null)
  }

  const answer = (choice) => {
    if (!current || answered) return
    const correct = choice === current.truth
    setAnswered({ choice, correct })
    setScore((prev) => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1, streak: correct ? prev.streak + 1 : 0 }))
  }

  const addCustom = () => {
    const text = customText.trim()
    if (!text) return
    setCustomItems((items) => [...items, { text, truth: customTruth }])
    setCustomText('')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in">
      <SEO title="אמת או בוגה" description="משחק אמת או בוגה: בוחרים נושא, מחליטים אם המשפט אמיתי או בוגה, צוברים ניקוד ויוצרים שאלות לבד." path="/tools/truth-or-dare" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'אמת או בוגה' }]} />

      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl mb-2">🎭 אמת או בוגה</h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--ink)]/75">קוראים משפט, בוחרים אם הוא אמיתי או “בוגה” — כלומר שקר — וצוברים נקודות. מתאים לכיתה, למסיבה ולמשפחה.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge color="yellow">✅ {score.correct}/{score.total}</Badge>
          <Badge color="green">🔥 רצף {score.streak}</Badge>
          <Badge color="blue">{visibleCards.length} משפטים בנושא</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="grid gap-5">
          <section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich">
            <h2 className="text-2xl mb-3">בחרו נושא</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setTopic('all'); setCurrent(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${topic === 'all' ? 'bg-[var(--postit)]' : 'bg-white'}`}>🌈 הכול</button>
              {Object.entries(TOPICS).map(([key, data]) => <button key={key} onClick={() => { setTopic(key); setCurrent(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${topic === key ? 'bg-[var(--postit)]' : 'bg-white'}`}>{data.label}</button>)}
              {customItems.length > 0 && <button onClick={() => { setTopic('custom'); setCurrent(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${topic === 'custom' ? 'bg-[var(--postit)]' : 'bg-white'}`}>✏️ שלי</button>}
            </div>
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
                <p className="mb-6 text-[var(--ink)]/70">בחרו נושא ולחצו להתחלה. אפשר להשתמש במאגר המוכן או להוסיף משפטים משלכם.</p>
                <button onClick={pick} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--accent)] px-8 py-4 font-display text-2xl font-bold text-white">תנו לי משפט 🎲</button>
              </div>
            ) : (
              <div className="py-8">
                <p className="font-hand text-lg text-[var(--muted-foreground)]">זה אמת או בוגה?</p>
                <h2 className="mx-auto my-8 max-w-3xl text-3xl sm:text-4xl leading-relaxed">{current.text}</h2>
                <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
                  <button onClick={() => answer(true)} disabled={Boolean(answered)} className="wobbly-md sketch-press min-h-[90px] border-[3px] border-[var(--border)] bg-[#4caf50] font-display text-3xl font-bold text-white disabled:opacity-70">אמת ✅</button>
                  <button onClick={() => answer(false)} disabled={Boolean(answered)} className="wobbly-md sketch-press min-h-[90px] border-[3px] border-[var(--border)] bg-[var(--accent)] font-display text-3xl font-bold text-white disabled:opacity-70">בוגה ❌</button>
                </div>
                {answered && (
                  <div className={`mx-auto mt-6 max-w-xl rounded-3xl border-2 border-[var(--border)] p-4 sketch-shadow-sm ${answered.correct ? 'bg-[#4caf50] text-white' : 'bg-[var(--postit)]'}`}>
                    <p className="text-2xl font-bold">{answered.correct ? 'נכון! 🎉' : `לא הפעם — זה היה ${current.truth ? 'אמת' : 'בוגה'}`}</p>
                    <button onClick={pick} className="wobbly-sm mt-4 border-2 border-[var(--border)] bg-white px-4 py-2 font-bold text-[var(--ink)]">משפט הבא ⏭</button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {visibleCards.slice(0, 6).map((item) => <div key={item.id} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3 text-sm sketch-shadow-sm"><strong>{item.truth ? 'אמת' : 'בוגה'}:</strong> {item.text}</div>)}
          </section>
        </main>
      </div>
    </div>
  )
}

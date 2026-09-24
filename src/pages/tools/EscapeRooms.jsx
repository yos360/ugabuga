import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { ESCAPE_ROOMS } from '../../data/escapeRoomsExpanded'
import { buildEscapeAdventure, ESCAPE_LEVELS } from '../../data/escapeAdventure'

const escapeRoomsFaq = [
  { q: 'איזה חדר בריחה מתאים ליום הולדת של ילד בן 8?', a: 'תעלומת העוגה הנעלמת בנוי בדיוק לגיל הזה, עם עלילה ורמזים מותאמים לילדים.' },
  { q: 'צריך ציוד מיוחד חוץ מהדפסה?', a: 'לרוב לא — רק מדפסת, מספריים, ולפעמים מעטפות או תיבה קטנה להסתרת רמזים, לפי ההוראות שמצורפות לכל חדר.' },
]
const escapeRoomsBody = [
  'חדר בריחה מודפס נותן למסיבה או ליום גיבוש תחושה של "אירוע אמיתי" בלי צורך לנסוע לשום מקום. יש כאן שלושה חדרים מוכנים, כל אחד מותאם לגיל אחר: תעלומת העוגה הנעלמת לילדים, תחנת החלל התקועה לנוער, ותיק הבלש הסודי למבוגרים. כל חדר מגיע עם ערכת רמזים, חידות ופתרון מוכן.',
  'הבחירה בין שלושת החדרים תלויה בגיל הקהל, לא רק ברמת הקושי. תעלומת העוגה הנעלמת בנויה סביב עלילה קלילה ומתאימה ליום הולדת של ילדים; תחנת החלל התקועה מוסיפה מורכבות שמדברת לנוער; תיק הבלש הסודי בנוי לחשיבה של מבוגרים.',
  'טיפ מעשי: תזמנו כ-30-45 דקות לכל חדר, כולל זמן הסבר בהתחלה. קבוצה גדולה מדי (מעל 6 משתתפים) נוטה ליצור "צופים" שלא ממש מעורבים — עדיף לחלק לשתי קבוצות מקבילות.',
]
const escapeRoomsRelated = [ { label: 'יוצר ציד אוצרות', href: '/tools/scavenger-hunt-maker' }, { label: 'יום הולדת בבית', href: '/ideas/at-home' }, { label: 'מתחם יוצרים', href: '/create' } ]

function normalizeAnswer(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export default function EscapeRooms() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRoomId = searchParams.get('room')
  const roomId = ESCAPE_ROOMS.some((item) => item.id === requestedRoomId)
    ? requestedRoomId
    : ESCAPE_ROOMS[0]?.id
  const [stepIndex, setStepIndex] = useState(0)
  const [difficulty, setDifficulty] = useState('easy')
  const [roundSeed, setRoundSeed] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showPrintKit, setShowPrintKit] = useState(false)
  const [status, setStatus] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])
  const roomPanelRef = useRef(null)
  const advanceTimerRef = useRef(null)

  const room = useMemo(() => buildEscapeAdventure(ESCAPE_ROOMS.find((item) => item.id === roomId), difficulty, roundSeed), [roomId, difficulty, roundSeed])
  const step = room?.steps[stepIndex]
  const stepQuestion = step?.question || step?.prompt || ''
  const solvedRoom = room && completedSteps.length === room.steps.length

  useEffect(() => {
    setStepIndex(0)
    setAnswer('')
    setShowHint(false)
    setShowPrintKit(false)
    setStatus(null)
    setCompletedSteps([])
    return () => clearTimeout(advanceTimerRef.current)
  }, [roomId, difficulty, roundSeed])

  const chooseRoom = (id) => {
    clearTimeout(advanceTimerRef.current)
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params)
      nextParams.set('room', id)
      return nextParams
    })
    setStepIndex(0)
    setAnswer('')
    setShowHint(false)
    setShowPrintKit(false)
    setStatus(null)
    setCompletedSteps([])
    requestAnimationFrame(() => roomPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const checkAnswer = () => {
    if (!step || status === 'correct' || !answer.trim()) return

    const userAnswer = normalizeAnswer(answer)
    const correctAnswer = normalizeAnswer(step.answer)

    if (userAnswer === correctAnswer) {
      const nextCompleted = [...new Set([...completedSteps, stepIndex])]
      setCompletedSteps(nextCompleted)
      setStatus('correct')
      setAnswer('')
      setShowHint(false)

    } else {
      setStatus('wrong')
    }
  }

  const resetRoom = () => {
    setRoundSeed((seed) => seed + 1)
    clearTimeout(advanceTimerRef.current)
    setStepIndex(0)
    setAnswer('')
    setShowHint(false)
    setStatus(null)
    setCompletedSteps([])
  }

  if (!room || !step) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title="חדר בריחה להדפסה לילדים ולנוער"
        description="3 חדרי בריחה להדפסה לילדים, לנוער ולמבוגרים — קיט מלא של רמזים, חידות ופתרון. חינם."
        path="/tools/escape-rooms"
        structuredData={faqSchema(escapeRoomsFaq)}
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'חדרי בריחה' }]} />

      <h1 className="text-4xl md:text-5xl font-hand font-bold text-center mb-2">🔐 חדרי בריחה BUGA</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8 max-w-3xl mx-auto">
        משחק דיגיטלי בתוך האתר וגם קיט להפעלה בכיתה, בבית או במסיבת מבוגרים. כל חדר בנוי מרמזים מדויקים,
        תשובות ברורות והתקדמות שלב־אחרי־שלב.
      </p>

      <section className="mb-6 rounded-3xl border border-[var(--border)] bg-white p-5" aria-label="בחירת רמת קושי">
        <h2 className="text-2xl font-bold mb-3">קודם בוחרים רמת קושי</h2>
        <div className="grid sm:grid-cols-3 gap-3">{ESCAPE_LEVELS.map(level => <button key={level.id} aria-pressed={difficulty === level.id} className={`text-right rounded-2xl border p-4 ${difficulty===level.id?'bg-purple-100 border-purple-500':'bg-white'}`} onClick={() => {if(level.id!==difficulty && (!completedSteps.length || window.confirm('החלפת רמה תתחיל את החדר מחדש. להמשיך?')))setDifficulty(level.id)}}><strong className="block text-xl">{level.label}</strong><span className="text-sm">{level.detail}</span></button>)}</div>
        <p className="text-sm mt-3 text-[var(--muted-foreground)]">רמזי הפתיחה משותפים לכל הרמות. בהמשך המנעולים נעשים מורכבים יותר. בכל שלב אפשר לבקש רמז.</p>
      </section>

      <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
        <aside className="order-2 space-y-4 lg:order-1">
          <WobblyCard hover={false} padding="p-5">
            <h2 className="text-2xl font-hand font-bold mb-3">בחרו חדר</h2>
            <div className="space-y-3">
              {ESCAPE_ROOMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => chooseRoom(item.id)}
                  className={`w-full text-right border-2 border-[var(--ink)] p-4 wobbly-sm transition-colors ${roomId === item.id ? 'bg-[var(--yellow)]' : 'bg-white hover:bg-[var(--muted)]/20'}`}
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="font-hand font-bold text-xl">{item.title}</div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge>{item.audience}</Badge>
                    <Badge color="yellow">3 רמות קושי</Badge>
                  </div>
                </button>
              ))}
            </div>
          </WobblyCard>

          <WobblyCard hover={false} padding="p-5">
            <h2 className="text-xl font-hand font-bold mb-2">אפשר גם להפעיל פיזית</h2>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mb-4">
              פתחו את קיט ההפעלה כדי לקבל מבנה למנחה: סיפור פתיחה, שלבים, תשובות ורמזים.
            </p>
            <WobblyButton onClick={() => setShowPrintKit((value) => !value)} variant="secondary">
              {showPrintKit ? 'הסתר קיט' : 'הצג קיט להפעלה'}
            </WobblyButton>
          </WobblyCard>
        </aside>

        <main ref={roomPanelRef} className="order-1 space-y-6 scroll-mt-6 lg:order-2">
          <WobblyCard hover={false} padding="p-6" className="bg-[var(--postit)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-3xl font-hand font-bold">{room.emoji} {room.title}</h2>
                <p className="text-[var(--muted-foreground)] mt-1">{room.intro}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{room.audience}</Badge>
                <Badge color="yellow">{room.difficulty}</Badge>
                <Badge color="blue">{room.duration}</Badge>
              </div>
            </div>

            <div className="h-3 rounded-full bg-white border border-[var(--border)] overflow-hidden">
              <div
                className="h-full bg-[#4caf50] transition-all"
                style={{ width: `${(completedSteps.length / room.steps.length) * 100}%` }}
              />
            </div>
            <p className="text-sm mt-2 text-[var(--muted-foreground)]">
              נפתרו {completedSteps.length} מתוך {room.steps.length} שלבים
            </p>
          </WobblyCard>

          {solvedRoom ? (
            <WobblyCard hover={false} padding="p-8" className="text-center">
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-3xl font-hand font-bold mb-3">החדר נפתר!</h2>
              <p className="text-xl leading-relaxed mb-6">{room.finalMessage}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <WobblyButton onClick={resetRoom} variant="primary">שחקו שוב</WobblyButton>
                <WobblyButton onClick={() => chooseRoom(ESCAPE_ROOMS[(ESCAPE_ROOMS.findIndex(item => item.id === roomId)+1)%ESCAPE_ROOMS.length].id)} variant="secondary">ממשיכים לחדר הבא ←</WobblyButton>
                <WobblyButton onClick={() => setShowPrintKit(true)} variant="secondary">ראו קיט הפעלה</WobblyButton>
              </div>
            </WobblyCard>
          ) : (
            <WobblyCard hover={false} padding="p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-3xl font-hand font-bold">שלב {stepIndex + 1}: {step.title}</h2>
                <Badge color="yellow">{stepIndex + 1}/{room.steps.length}</Badge>
              </div>

              <p className="text-lg leading-relaxed mb-5">{step.story}</p>
              {step.visual && <div dir="ltr" className="text-center text-2xl sm:text-3xl bg-purple-50 rounded-2xl p-5 mb-5" aria-label="לוח הרמז">{step.visual}</div>}
              <label htmlFor="escape-answer" className="block font-hand text-xl font-bold mb-2">{stepQuestion}</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="escape-answer"
                  disabled={status === 'correct'}
                  value={answer}
                  onChange={(event) => { setAnswer(event.target.value); setStatus(null) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') checkAnswer() }}
                  placeholder="כתבו תשובה..."
                  className="flex-1 border-2 border-[var(--ink)] bg-white px-4 py-3 text-lg wobbly-sm outline-none focus:bg-[var(--yellow)]/20"
                />
                <WobblyButton disabled={status === 'correct' || !answer.trim()} onClick={checkAnswer} variant="primary">בדקו תשובה</WobblyButton>
              </div>

              {status === 'wrong' && (
                <p className="mt-3 text-[var(--accent)] font-bold">עוד לא. נסו שוב או פתחו רמז.</p>
              )}
              {status === 'correct' && (
                <div className="mt-3 text-[#2e7d32] font-bold" role="status"><p>נכון! המנעול נפתח.</p><WobblyButton onClick={() => {setStepIndex(index => index+1);setStatus(null);setAnswer('');setShowHint(false)}}>ממשיכים לשלב הבא ←</WobblyButton></div>
              )}

              <div className="mt-5">
                {showHint ? (
                  <WobblyCard hover={false} padding="p-3" className="bg-[var(--yellow)] inline-block">
                    <p className="text-sm">💡 רמז: {step.hint}</p>
                  </WobblyCard>
                ) : (
                  <button onClick={() => setShowHint(true)} className="text-[var(--blue)] hover:underline">
                    צריכים רמז?
                  </button>
                )}
              </div>
              {difficulty === 'easy' && !showHint && status !== 'correct' && <p className="mt-3 text-sm text-[var(--muted-foreground)]">💡 {step.hint}</p>}
            </WobblyCard>
          )}

          {showPrintKit && (
            <WobblyCard hover={false} padding="p-6">
              <h2 className="text-2xl font-hand font-bold mb-3">🖨️ קיט הפעלה למנחה</h2>
              <p className="leading-relaxed mb-4">
                מתאים לכיתה, יום הולדת, פעילות משפחתית או מסיבת מבוגרים. מקריאים את הסיפור, נותנים לקבוצה לפתור,
                ומשתמשים ברמזים רק אם נתקעים.
              </p>
              <div className="space-y-4">
                {room.steps.map((item, index) => (
                  <div key={item.title} className="border-2 border-[var(--border)] bg-white p-4 wobbly-sm">
                    <h3 className="font-hand font-bold text-xl mb-1">{index + 1}. {item.title}</h3>
                    <p className="mb-2">{item.story}</p>
                    {item.visual && <p dir="ltr" className="text-center text-xl">{item.visual}</p>}
                    <p><strong>שאלה:</strong> {item.question || item.prompt}</p>
                    <p><strong>תשובה:</strong> {item.answer}</p>
                    <p><strong>רמז:</strong> {item.hint}</p>
                  </div>
                ))}
              </div>
            </WobblyCard>
          )}
        </main>
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={escapeRoomsBody} faq={escapeRoomsFaq} related={escapeRoomsRelated} />
      </div>
    </div>
  )
}

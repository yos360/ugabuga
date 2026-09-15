import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { ESCAPE_ROOMS } from '../../data/escapeRooms'

function normalizeAnswer(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export default function EscapeRooms() {
  const [roomId, setRoomId] = useState(ESCAPE_ROOMS[0]?.id)
  const [stepIndex, setStepIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showPrintKit, setShowPrintKit] = useState(false)
  const [status, setStatus] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  const room = useMemo(() => ESCAPE_ROOMS.find((item) => item.id === roomId), [roomId])
  const step = room?.steps[stepIndex]
  const solvedRoom = room && completedSteps.length === room.steps.length

  const chooseRoom = (id) => {
    setRoomId(id)
    setStepIndex(0)
    setAnswer('')
    setShowHint(false)
    setShowPrintKit(false)
    setStatus(null)
    setCompletedSteps([])
  }

  const checkAnswer = () => {
    if (!step) return

    const userAnswer = normalizeAnswer(answer)
    const correctAnswer = normalizeAnswer(step.answer)

    if (userAnswer === correctAnswer) {
      const nextCompleted = [...new Set([...completedSteps, stepIndex])]
      setCompletedSteps(nextCompleted)
      setStatus('correct')
      setAnswer('')
      setShowHint(false)

      if (stepIndex < room.steps.length - 1) {
        setTimeout(() => {
          setStepIndex((current) => current + 1)
          setStatus(null)
        }, 650)
      }
    } else {
      setStatus('wrong')
    }
  }

  const resetRoom = () => {
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
        title="חדרי בריחה לילדים, כיתה ומבוגרים"
        description="חדרי בריחה דיגיטליים וקיטים להפעלה בכיתה, במסיבה או בבית. פותרים שלבים, מקבלים רמזים ומגיעים לקוד סיום."
        path="/tools/escape-rooms"
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'חדרי בריחה' }]} />

      <h1 className="text-4xl md:text-5xl font-hand font-bold text-center mb-2">🔐 חדרי בריחה BUGA</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8 max-w-3xl mx-auto">
        משחק דיגיטלי בתוך האתר וגם קיט להפעלה בכיתה, בבית או במסיבת מבוגרים. כל חדר בנוי מרמזים מדויקים,
        תשובות ברורות והתקדמות שלב־אחרי־שלב.
      </p>

      <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
        <aside className="space-y-4">
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
                    <Badge color="yellow">{item.difficulty}</Badge>
                    <Badge color="blue">{item.duration}</Badge>
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

        <main className="space-y-6">
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
              <label className="block font-hand text-xl font-bold mb-2">{step.question}</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={answer}
                  onChange={(event) => { setAnswer(event.target.value); setStatus(null) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') checkAnswer() }}
                  placeholder="כתבו תשובה..."
                  className="flex-1 border-2 border-[var(--ink)] bg-white px-4 py-3 text-lg wobbly-sm outline-none focus:bg-[var(--yellow)]/20"
                />
                <WobblyButton onClick={checkAnswer} variant="primary">בדקו תשובה</WobblyButton>
              </div>

              {status === 'wrong' && (
                <p className="mt-3 text-[var(--accent)] font-bold">עוד לא. נסו שוב או פתחו רמז.</p>
              )}
              {status === 'correct' && (
                <p className="mt-3 text-[#2e7d32] font-bold">נכון! עוברים לשלב הבא...</p>
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
                    <p><strong>שאלה:</strong> {item.question}</p>
                    <p><strong>תשובה:</strong> {item.answer}</p>
                    <p><strong>רמז:</strong> {item.hint}</p>
                  </div>
                ))}
              </div>
            </WobblyCard>
          )}
        </main>
      </div>
    </div>
  )
}

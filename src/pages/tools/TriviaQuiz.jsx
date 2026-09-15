import { useCallback, useEffect, useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { AUDIENCES, DIFFICULTIES, QUESTION_TOPICS, getQuestions, pickNextQuestion } from '../../data/questionBankExpanded'

const HISTORY_LIMIT = 16

function shuffleOptions(options = []) {
  return [...options].sort(() => Math.random() - 0.5)
}

export default function TriviaQuiz() {
  const [audience, setAudience] = useState('kids')
  const [difficulty, setDifficulty] = useState('easy')
  const [topic, setTopic] = useState('all')
  const [current, setCurrent] = useState(null)
  const [options, setOptions] = useState([])
  const [seenIds, setSeenIds] = useState([])
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 })

  const questions = useMemo(
    () => getQuestions({ topic, audience, difficulty, type: 'all' }).filter((item) => item.triviaOptions?.length >= 2),
    [topic, audience, difficulty]
  )

  const chooseQuestion = useCallback((resetHistory = false) => {
    setSelected(null)
    setSeenIds((prevSeen) => {
      const history = resetHistory ? [] : prevSeen
      const nextQuestion = pickNextQuestion(questions, history)
      setCurrent(nextQuestion)
      setOptions(shuffleOptions(nextQuestion?.triviaOptions || []))

      if (!nextQuestion) return []
      return [nextQuestion.id, ...history.filter((id) => id !== nextQuestion.id)].slice(0, HISTORY_LIMIT)
    })
  }, [questions])

  useEffect(() => {
    chooseQuestion(true)
  }, [chooseQuestion])

  const updateFilter = (setter, value) => {
    setter(value)
    setScore({ correct: 0, total: 0, streak: 0 })
  }

  const answerQuestion = (option) => {
    if (selected || !current) return

    const isCorrect = option === current.answer
    setSelected(option)
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }))
  }

  const currentTopic = QUESTION_TOPICS.find((item) => item.id === current?.topic)
  const currentAudience = AUDIENCES.find((item) => item.id === audience)
  const currentDifficulty = DIFFICULTIES.find((item) => item.id === difficulty)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO
        title="טריוויה BUGA — שאלות לפי נושא, גיל וקושי"
        description="משחק טריוויה בעברית לילדים, נוער ומבוגרים. בוחרים נושא, קהל יעד ורמת קושי ומשחקים מתוך מאגר השאלות המרכזי."
        path="/tools/trivia-quiz"
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'טריוויה' }]} />

      <h1 className="text-4xl font-hand font-bold text-center mb-2">🎯 טריוויה BUGA</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8">
        משחק טריוויה מהיר מתוך אותו מאגר שמשרת את החידות — מוכן בהמשך לחדרים, קבוצות ו-QR
      </p>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <WobblyCard hover={false} padding="p-5">
          <div className="space-y-5">
            <div>
              <h2 className="font-hand font-bold text-xl mb-2">קהל יעד</h2>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFilter(setAudience, item.id)}
                    className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm font-medium transition-colors ${audience === item.id ? 'bg-[var(--yellow)] font-bold' : 'bg-white hover:bg-[var(--muted)]/30'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-hand font-bold text-xl mb-2">נושא</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter(setTopic, 'all')}
                  className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${topic === 'all' ? 'bg-[var(--blue)] text-white font-bold' : 'bg-white'}`}
                >
                  🌈 הכול
                </button>
                {QUESTION_TOPICS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFilter(setTopic, item.id)}
                    className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${topic === item.id ? 'bg-[var(--blue)] text-white font-bold' : 'bg-white'}`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-hand font-bold text-xl mb-2">קושי</h2>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFilter(setDifficulty, item.id)}
                    className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${difficulty === item.id ? 'bg-[var(--green)] text-white font-bold' : 'bg-white'}`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <h2 className="font-hand font-bold text-xl mb-2">ניקוד</h2>
              <div className="flex flex-wrap gap-2">
                <Badge color="yellow">✅ {score.correct}/{score.total}</Badge>
                <Badge color="green">🔥 רצף {score.streak}</Badge>
                <Badge color="blue">{questions.length} שאלות</Badge>
              </div>
            </div>
          </div>
        </WobblyCard>

        {current ? (
          <WobblyCard hover={false} padding="p-8" className="text-center">
            <div className="flex justify-center flex-wrap gap-2 mb-4 text-sm">
              {currentTopic && <Badge color="blue">{currentTopic.emoji} {currentTopic.label}</Badge>}
              <Badge color="yellow">{currentAudience?.label}</Badge>
              <Badge color="green">{currentDifficulty?.label}</Badge>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-6">{current.question}</h2>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {options.map((option) => {
                const isSelected = selected === option
                const isCorrect = option === current.answer
                const revealed = Boolean(selected)
                const className = revealed && isCorrect
                  ? 'bg-[#4caf50] text-white border-[#4caf50]'
                  : revealed && isSelected
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-white hover:bg-[var(--yellow)]/40 border-[var(--ink)]'

                return (
                  <button
                    key={option}
                    onClick={() => answerQuestion(option)}
                    disabled={Boolean(selected)}
                    className={`wobbly-sm border-2 px-4 py-4 text-lg font-bold transition-colors ${className}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {selected && (
              <div className="animate-fade-in mb-5">
                <WobblyCard hover={false} padding="p-4" className={selected === current.answer ? 'bg-[#4caf50] text-white' : 'bg-[var(--postit)]'}>
                  <p className="text-xl font-bold">
                    {selected === current.answer ? '🎉 נכון!' : `התשובה הנכונה: ${current.answer}`}
                  </p>
                  {current.explanation && <p className="mt-2 text-sm opacity-90">{current.explanation}</p>}
                </WobblyCard>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <WobblyButton onClick={() => chooseQuestion(false)} variant="primary">
                שאלה הבאה ←
              </WobblyButton>
              <WobblyButton onClick={() => setScore({ correct: 0, total: 0, streak: 0 })} variant="outline">
                אפסו ניקוד
              </WobblyButton>
            </div>
          </WobblyCard>
        ) : (
          <WobblyCard hover={false} padding="p-8" className="text-center">
            <h2 className="text-2xl font-hand font-bold mb-2">עוד אין שאלות בסינון הזה</h2>
            <p className="text-[var(--muted-foreground)] mb-4">המאגר המרכזי גדל בהדרגה. בחרו נושא אחר או רמת קושי אחרת.</p>
            <WobblyButton onClick={() => { setTopic('all'); setDifficulty('easy'); setAudience('kids') }} variant="primary">
              חזרה לשאלות זמינות
            </WobblyButton>
          </WobblyCard>
        )}
      </div>

      <WobblyCard hover={false} padding="p-6" className="mt-8">
        <h2 className="text-xl font-hand font-bold mb-3">🚀 מה השלב הבא?</h2>
        <p className="leading-relaxed">
          כרגע זה משחק טריוויה מקומי ומהיר. בשלב הבא אפשר להפוך אותו לטריוויה אונליין עם חדר משחק,
          קוד הצטרפות או QR, קבוצות, טיימר וניקוד חי — ועדיין להשתמש באותו מאגר שאלות.
        </p>
      </WobblyCard>
    </div>
  )
}

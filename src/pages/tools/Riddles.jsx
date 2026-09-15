import { useEffect, useMemo, useState, useCallback } from 'react'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { AUDIENCES, DIFFICULTIES, QUESTION_TOPICS, getQuestions, pickNextQuestion } from '../../data/questionBankExpanded'

const HISTORY_LIMIT = 12

export default function Riddles() {
  const [audience, setAudience] = useState('kids')
  const [difficulty, setDifficulty] = useState('easy')
  const [topic, setTopic] = useState('all')
  const [current, setCurrent] = useState(null)
  const [seenIds, setSeenIds] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const questions = useMemo(
    () => getQuestions({ topic, audience, difficulty, type: 'riddle' }),
    [topic, audience, difficulty]
  )

  const resetReveal = () => {
    setShowAnswer(false)
    setShowHint(false)
  }

  const chooseQuestion = useCallback((resetHistory = false) => {
    resetReveal()

    setSeenIds((prevSeen) => {
      const history = resetHistory ? [] : prevSeen
      const nextQuestion = pickNextQuestion(questions, history)
      setCurrent(nextQuestion)

      if (!nextQuestion) return []
      return [nextQuestion.id, ...history.filter((id) => id !== nextQuestion.id)].slice(0, HISTORY_LIMIT)
    })
  }, [questions])

  useEffect(() => {
    chooseQuestion(true)
  }, [chooseQuestion])

  const updateFilter = (setter, value) => {
    setter(value)
    setScore({ correct: 0, total: 0 })
  }

  const guessedRight = () => {
    setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }))
    chooseQuestion(false)
  }

  const guessedWrong = () => {
    setScore((s) => ({ ...s, total: s.total + 1 }))
    setShowAnswer(true)
  }

  const currentTopic = QUESTION_TOPICS.find((item) => item.id === current?.topic)
  const currentAudience = AUDIENCES.find((item) => item.id === audience)
  const currentDifficulty = DIFFICULTIES.find((item) => item.id === difficulty)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO
        title="חידות לכל הגילאים — לפי נושא, קהל וקושי"
        description="מאגר חידות בעברית לילדים, נוער ומבוגרים — לפי נושאים, רמות קושי ורמזים. מתאים גם כבסיס לטריוויה אונליין."
        path="/tools/riddles"
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'חידות' }]} />

      <h1 className="text-4xl font-hand font-bold text-center mb-2">🧩 חידות BUGA</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8">
        מאגר שאלות מרכזי לפי נושא, קהל יעד וקושי — הבסיס גם לחידות וגם לטריוויה בהמשך
      </p>

      <WobblyCard hover={false} padding="p-5" className="mb-6">
        <div className="space-y-5">
          <div>
            <h2 className="font-hand font-bold text-xl mb-2">למי החידה?</h2>
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
            {currentAudience && <p className="text-sm text-[var(--muted-foreground)] mt-2">{currentAudience.description}</p>}
          </div>

          <div>
            <h2 className="font-hand font-bold text-xl mb-2">נושא</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter(setTopic, 'all')}
                className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${topic === 'all' ? 'bg-[var(--blue)] text-white font-bold' : 'bg-white'}`}
              >
                🌈 כל הנושאים
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
            <h2 className="font-hand font-bold text-xl mb-2">רמת קושי</h2>
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
        </div>
      </WobblyCard>

      {score.total > 0 && (
        <div className="text-center mb-4">
          <Badge color="yellow">🏆 {score.correct}/{score.total} תשובות נכונות</Badge>
        </div>
      )}

      {current ? (
        <WobblyCard hover={false} padding="p-8" className="text-center mb-6">
          <div className="flex justify-center flex-wrap gap-2 mb-4 text-sm">
            {currentTopic && <Badge color="blue">{currentTopic.emoji} {currentTopic.label}</Badge>}
            <Badge color="yellow">{currentAudience?.label}</Badge>
            <Badge color="green">{currentDifficulty?.label}</Badge>
            <Badge color="pink">{questions.length} במאגר המסונן</Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-6">{current.question}</h2>

          {!showAnswer && (
            <div className="mb-4">
              {showHint ? (
                <div className="animate-fade-in">
                  <WobblyCard hover={false} padding="p-3" className="bg-[var(--yellow)] inline-block">
                    <p className="text-sm">💡 רמז: {current.hint}</p>
                  </WobblyCard>
                </div>
              ) : (
                <button onClick={() => setShowHint(true)} className="text-[var(--blue)] hover:underline text-sm">
                  💡 רמז?
                </button>
              )}
            </div>
          )}

          {showAnswer ? (
            <div className="animate-fade-in">
              <WobblyCard hover={false} padding="p-4" className="bg-[var(--green)] text-white mb-4">
                <p className="text-xl font-bold">🎯 {current.answer}</p>
                {current.explanation && <p className="mt-2 text-sm opacity-90">{current.explanation}</p>}
              </WobblyCard>
              <WobblyButton onClick={() => chooseQuestion(false)} variant="primary">חידה חדשה ←</WobblyButton>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <WobblyButton onClick={() => setShowAnswer(true)} variant="secondary">🎂 גלו תשובה</WobblyButton>
              <WobblyButton onClick={guessedRight} variant="green">✅ ידעתי!</WobblyButton>
              <WobblyButton onClick={guessedWrong} variant="outline">❌ לא ידעתי</WobblyButton>
            </div>
          )}
        </WobblyCard>
      ) : (
        <WobblyCard hover={false} padding="p-8" className="text-center mb-6">
          <h2 className="text-2xl font-hand font-bold mb-2">עוד אין חידות בסינון הזה</h2>
          <p className="text-[var(--muted-foreground)] mb-4">המאגר החדש גדל בהדרגה. בחרו נושא אחר או רמת קושי אחרת.</p>
          <WobblyButton onClick={() => { setTopic('all'); setDifficulty('easy'); setAudience('kids') }} variant="primary">
            חזרה לחידות זמינות
          </WobblyButton>
        </WobblyCard>
      )}

      {!showAnswer && current && (
        <div className="text-center">
          <button onClick={() => chooseQuestion(false)} className="text-[var(--blue)] hover:underline">
            ⏭ תנו לי חידה חדשה
          </button>
        </div>
      )}

      <WobblyCard hover={false} padding="p-6" className="mt-8">
        <h2 className="text-xl font-hand font-bold mb-3">🧩 למה המאגר החדש יותר טוב?</h2>
        <p className="leading-relaxed mb-3">
          כל שאלה מסומנת לפי נושא, קהל יעד ורמת קושי. כך אפשר להגדיל את המאגר בלי בלגן,
          להציג חידות שונות בכל רענון, ובהמשך להשתמש באותן שאלות גם במשחק טריוויה אונליין.
        </p>
        <p className="leading-relaxed text-[var(--muted-foreground)]">
          השלב הבא יהיה להוסיף עוד מאות שאלות לכל נושא ולפתוח עמודי SEO לפי שילובים כמו חידות חיות לילדים,
          חידות היגיון לנוער וחידות קשות למבוגרים.
        </p>
      </WobblyCard>
    </div>
  )
}

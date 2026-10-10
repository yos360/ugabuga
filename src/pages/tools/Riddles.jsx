import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { AUDIENCES, DIFFICULTIES, QUESTION_TOPICS, getQuestions, pickNextQuestion } from '../../data/questionBankExpanded'

const HISTORY_LIMIT = 12

// "רמה" is feminine: "ברמה קלה", not "רמה קל".
const LEVEL_TEXT = { easy: 'חידות ברמה קלה', medium: 'חידות ברמה בינונית', hard: 'חידות ברמה קשה' }

export default function Riddles() {
  const [audience, setAudience] = useState('kids')
  const [difficulty, setDifficulty] = useState('easy')
  const [topic, setTopic] = useState('all')
  const [current, setCurrent] = useState(null)
  const [seenIds, setSeenIds] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const [knewIt, setKnewIt] = useState(false)

  // Riddles only (trivia facts such as "מהו התפקיד של ה-DNA?" stay in the trivia game). When the exact
  // filter has fewer than MIN_POOL riddles, widen step by step — nearby difficulty, then nearby audience,
  // then any topic — and tell the player what was added.
  const { questions, widenedWith } = useMemo(() => {
    const MIN_POOL = 6
    const get = (f) => getQuestions({ type: 'riddle', ...f }).filter((item) => item.type === 'riddle')
    const order = (list, id) => {
      const at = list.findIndex((item) => item.id === id)
      return list.filter((item) => item.id !== id).sort((a, b) => Math.abs(list.indexOf(a) - at) - Math.abs(list.indexOf(b) - at))
    }
    let pool = get({ topic, audience, difficulty })
    const added = []
    const add = (items, label) => {
      const ids = new Set(pool.map((q) => q.id))
      const fresh = items.filter((q) => !ids.has(q.id))
      if (fresh.length) { pool = [...pool, ...fresh]; added.push(label) }
    }
    for (const d of order(DIFFICULTIES, difficulty)) if (pool.length < MIN_POOL) add(get({ topic, audience, difficulty: d.id }), LEVEL_TEXT[d.id] || `חידות ברמה ${d.label}`)
    for (const a of order(AUDIENCES, audience)) if (pool.length < MIN_POOL) add(get({ topic, audience: a.id, difficulty: 'all' }), `חידות ל${a.label}`)
    if (pool.length < MIN_POOL && topic !== 'all') add(get({ topic: 'all', audience, difficulty: 'all' }), 'נושאים נוספים')
    return { questions: pool, widenedWith: added }
  }, [topic, audience, difficulty])

  const resetReveal = () => {
    setShowAnswer(false)
    setShowHint(false)
    setKnewIt(false)
  }

  // Riddles of exactly the chosen audience + level come first; the widened extras only after them.
  const isExactLevel = useCallback((q) => q.audience === audience && q.difficulty === difficulty && (topic === 'all' || q.topic === topic), [audience, difficulty, topic])

  const chooseQuestion = useCallback((resetHistory = false) => {
    resetReveal()

    setSeenIds((prevSeen) => {
      const history = resetHistory ? [] : prevSeen
      const nextQuestion = pickNextQuestion(questions, history, isExactLevel)
      setCurrent(nextQuestion)

      if (!nextQuestion) return []
      return [nextQuestion.id, ...history.filter((id) => id !== nextQuestion.id)].slice(0, HISTORY_LIMIT)
    })
  }, [questions, isExactLevel])

  useEffect(() => {
    chooseQuestion(true)
  }, [chooseQuestion])

  const updateFilter = (setter, value) => {
    setter(value)
    setScore({ correct: 0, total: 0 })
  }

  // "ידעתי!" counts the point and shows the answer, so the kids can check they really knew it.
  const guessedRight = () => {
    setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }))
    setKnewIt(true)
    setShowAnswer(true)
  }

  const guessedWrong = () => {
    setScore((s) => ({ ...s, total: s.total + 1 }))
    setShowAnswer(true)
  }

  const currentTopic = QUESTION_TOPICS.find((item) => item.id === current?.topic)
  const currentAudience = AUDIENCES.find((item) => item.id === audience)
  const currentDifficulty = DIFFICULTIES.find((item) => item.id === (current?.difficulty || difficulty))
  const questionAudience = AUDIENCES.find((item) => item.id === (current?.audience || audience))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO
        title="חידות לילדים ולמבוגרים — עם רמזים ותשובות"
        description="חידות בעברית לילדים, נוער ומבוגרים: בוחרים נושא ורמת קושי, מקבלים רמז כשנתקעים, חושפים תשובה וסופרים כמה ידעתם. חינם, בלי הרשמה — לכיתה, לנסיעה ולמשפחה."
        path="/tools/riddles"
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'חידות' }]} />

      <h1 className="text-4xl font-hand font-bold text-center mb-2">🧩 חידות</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8">
        חידות מצחיקות ומאתגרות לכל הגילים — חושבים, מנחשים, ואם נתקעים מבקשים רמז
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
            <Badge color="yellow">{questionAudience?.label}</Badge>
            <Badge color="green">{currentDifficulty?.label}</Badge>
            <Badge color="pink">{questions.length} חידות</Badge>
          </div>

          {widenedWith.length > 0 && (
            <p className="mb-4 rounded-xl bg-[var(--postit)] px-3 py-2 text-sm" role="note">
              אין עדיין מספיק חידות בדיוק לבחירה שלכם, אז הוספנו גם: {widenedWith.join(', ')}.
            </p>
          )}

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
                {knewIt && <p className="text-lg font-bold mb-1">✅ כל הכבוד! בדקו שזו התשובה שחשבתם:</p>}
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
        <h2 className="text-xl font-hand font-bold mb-3">🧩 איך משחקים עם החידות?</h2>
        <p className="leading-relaxed mb-3">
          בוחרים נושא, קהל ורמת קושי, קוראים את החידה בקול ונותנים לכולם רגע לחשוב. מי שנתקע יכול לבקש רמז,
          ורק אחר כך חושפים את התשובה.
        </p>
        <p className="leading-relaxed text-[var(--muted-foreground)]">
          טיפ למסיבה: מחלקים לשתי קבוצות, כל תשובה נכונה שווה נקודה, ותשובה בלי רמז שווה שתיים.
        </p>
      </WobblyCard>

      <div className="rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-5 text-center mt-8">
        <p className="font-display text-xl font-bold mb-2">מעדיפים דף חידות מוכן?</p>
        <Link to="/riddles/topics" className="inline-block rounded-xl border-2 border-slate-800 bg-[var(--postit)] px-5 py-2 font-bold">🧩 חידות לפי נושא וגיל — עם תשובות ←</Link>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { AUDIENCES, DIFFICULTIES, QUESTION_TOPICS, getQuestions, pickNextQuestion } from '../../data/questionBankExpanded'
import { DEFAULT_LIVE_NEWS, createGameNews } from '../../data/liveNews'

const HISTORY_LIMIT = 200
const GAME_MODES = [
  { id: 'classic', label: 'קלאסי', emoji: '🎯', description: 'שאלה אחרי שאלה בקצב רגוע' },
  { id: 'speed', label: 'מירוץ מהיר', emoji: '⚡', description: 'כל תשובה נכונה שומרת רצף' },
  { id: 'expert', label: 'מומחה', emoji: '👑', description: 'קשה יותר: טעות מאפסת רצף' },
  { id: 'multi', label: 'ריבוי שחקנים', emoji: '👥', description: 'תורות בין 2-4 שחקנים' },
]

function shuffleOptions(options = []) {
  return [...options].sort(() => Math.random() - 0.5)
}

function makePlayers(names) {
  return names.map((name, index) => ({
    id: 'trivia-player-' + index,
    name: name.trim() || `שחקן ${index + 1}`,
    correct: 0,
    total: 0,
    streak: 0,
  }))
}

export default function TriviaQuiz() {
  const [audience, setAudience] = useState('kids')
  const [difficulty, setDifficulty] = useState('easy')
  const [topic, setTopic] = useState('all')
  const [mode, setMode] = useState('classic')
  const [current, setCurrent] = useState(null)
  const [options, setOptions] = useState([])
  const [seenIds, setSeenIds] = useState([])
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 })
  const [playerNames, setPlayerNames] = useState(['שחקן 1', 'שחקן 2'])
  const [players, setPlayers] = useState(() => makePlayers(['שחקן 1', 'שחקן 2']))
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [liveNews, setLiveNews] = useState(DEFAULT_LIVE_NEWS)

  const questions = useMemo(
    () => getQuestions({ topic, audience, difficulty: mode === 'expert' ? 'hard' : difficulty, type: 'all' }).filter((item) => item.triviaOptions?.length >= 2),
    [topic, audience, difficulty, mode]
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
    chooseQuestion(false)
  }, [chooseQuestion])

  const addNews = (item) => setLiveNews((news) => [item, ...news].slice(0, 7))

  const updateFilter = (setter, value) => {
    setter(value)
    setScore({ correct: 0, total: 0, streak: 0 })
  }

  const resetPlayers = () => {
    setPlayers(makePlayers(playerNames.filter(Boolean).slice(0, 4)))
    setCurrentPlayerIndex(0)
    addNews('👥 משחק ריבוי שחקנים חדש נפתח בטריוויה.')
  }

  const answerQuestion = (option) => {
    if (selected || !current) return

    const isCorrect = option === current.answer
    const activePlayer = players[currentPlayerIndex]
    const topicLabel = QUESTION_TOPICS.find((item) => item.id === current.topic)?.label

    setSelected(option)
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }))

    if (mode === 'multi') {
      setPlayers((list) => list.map((player, index) => index === currentPlayerIndex ? {
        ...player,
        correct: player.correct + (isCorrect ? 1 : 0),
        total: player.total + 1,
        streak: isCorrect ? player.streak + 1 : 0,
      } : player))
      addNews(createGameNews({ type: 'quiz', player: activePlayer.name, correct: isCorrect, answer: current.answer, topic: topicLabel, streak: isCorrect ? activePlayer.streak + 1 : 0 }))
      setCurrentPlayerIndex((index) => (index + 1) % players.length)
      return
    }

    if (mode === 'speed') {
      addNews(createGameNews({ type: 'speedQuiz', player: 'השחקן', correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 }))
    } else if (mode === 'expert') {
      const nextTotal = score.total + 1
      const nextCorrect = score.correct + (isCorrect ? 1 : 0)
      addNews(createGameNews({ type: 'expertMode', player: 'השחקן', score: Math.round((nextCorrect / nextTotal) * 100) }))
    } else {
      addNews(createGameNews({ type: 'quiz', player: 'השחקן', correct: isCorrect, answer: current.answer, topic: topicLabel, streak: isCorrect ? score.streak + 1 : 0 }))
    }
  }

  const currentTopic = QUESTION_TOPICS.find((item) => item.id === current?.topic)
  const currentAudience = AUDIENCES.find((item) => item.id === audience)
  const currentDifficulty = DIFFICULTIES.find((item) => item.id === (mode === 'expert' ? 'hard' : difficulty))
  const modeDetails = GAME_MODES.find((item) => item.id === mode)
  const leader = [...players].sort((a, b) => b.correct - a.correct || b.streak - a.streak)[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title="טריוויה BUGA — שאלות, ריבוי שחקנים וחדשות בלייב"
        description="משחק טריוויה בעברית עם מצבי משחק, שחקנים, ניקוד חי וכתבות משחק אוטומטיות."
        path="/tools/trivia-quiz"
      />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'טריוויה' }]} />

      <h1 className="text-4xl font-hand font-bold text-center mb-2">🎯 טריוויה BUGA</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8">
        טריוויה עם מצבי משחק, ריבוי שחקנים וחדשות בלייב שנוצרות ממה שקורה במשחק.
      </p>

      <div className="grid lg:grid-cols-[320px_1fr_300px] gap-6 items-start">
        <WobblyCard hover={false} padding="p-5">
          <div className="space-y-5">
            <div>
              <h2 className="font-hand font-bold text-xl mb-2">מצב משחק</h2>
              <div className="grid gap-2">
                {GAME_MODES.map((item) => (
                  <button key={item.id} onClick={() => { setMode(item.id); setScore({ correct: 0, total: 0, streak: 0 }); setSelected(null) }} className={`rounded-2xl border-2 border-[var(--ink)] p-3 text-right ${mode === item.id ? 'bg-[var(--yellow)] font-bold sketch-shadow-sm' : 'bg-white'}`}>
                    <span className="text-lg">{item.emoji} {item.label}</span>
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">{item.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-hand font-bold text-xl mb-2">קהל יעד</h2>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((item) => (
                  <button key={item.id} onClick={() => updateFilter(setAudience, item.id)} className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm font-medium ${audience === item.id ? 'bg-[var(--yellow)] font-bold' : 'bg-white hover:bg-[var(--muted)]/30'}`}>{item.label}</button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-hand font-bold text-xl mb-2">נושא</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateFilter(setTopic, 'all')} className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${topic === 'all' ? 'bg-[var(--blue)] text-white font-bold' : 'bg-white'}`}>🌈 הכול</button>
                {QUESTION_TOPICS.map((item) => <button key={item.id} onClick={() => updateFilter(setTopic, item.id)} className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${topic === item.id ? 'bg-[var(--blue)] text-white font-bold' : 'bg-white'}`}>{item.emoji} {item.label}</button>)}
              </div>
            </div>

            <div>
              <h2 className="font-hand font-bold text-xl mb-2">קושי</h2>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((item) => <button key={item.id} onClick={() => updateFilter(setDifficulty, item.id)} className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm ${difficulty === item.id ? 'bg-[var(--green)] text-white font-bold' : 'bg-white'}`}>{item.emoji} {item.label}</button>)}
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
              <Badge color="red">{modeDetails?.emoji} {modeDetails?.label}</Badge>
              {mode === 'multi' && <Badge color="yellow">תור: {players[currentPlayerIndex]?.name}</Badge>}
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
                const className = revealed && isCorrect ? 'bg-[#4caf50] text-white border-[#4caf50]' : revealed && isSelected ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white hover:bg-[var(--yellow)]/40 border-[var(--ink)]'
                return <button key={option} onClick={() => answerQuestion(option)} disabled={Boolean(selected)} className={`wobbly-sm border-2 px-4 py-4 text-lg font-bold transition-colors ${className}`}>{option}</button>
              })}
            </div>

            {selected && (
              <div className="animate-fade-in mb-5">
                <WobblyCard hover={false} padding="p-4" className={selected === current.answer ? 'bg-[#4caf50] text-white' : 'bg-[var(--postit)]'}>
                  <p className="text-xl font-bold">{selected === current.answer ? '🎉 נכון!' : `התשובה הנכונה: ${current.answer}`}</p>
                  {current.explanation && <p className="mt-3 text-base leading-relaxed"><strong>למה?</strong> {current.explanation}</p>}
                  {current.hint && <p className="mt-2 text-sm opacity-90"><strong>רמז לזכירה:</strong> {current.hint}</p>}
                  <p className="mt-3 border-t border-current/20 pt-2 text-xs opacity-80">ההסבר מבוסס על ידע כללי יציב ונבדק לפני שהשאלה נכנסה למאגר. אם מצאתם טעות, כתבו לנו כדי שנעדכן.</p>
                </WobblyCard>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <WobblyButton onClick={() => chooseQuestion(false)} variant="primary">שאלה הבאה ←</WobblyButton>
              <WobblyButton onClick={() => setScore({ correct: 0, total: 0, streak: 0 })} variant="outline">אפסו ניקוד</WobblyButton>
            </div>
          </WobblyCard>
        ) : (
          <WobblyCard hover={false} padding="p-8" className="text-center">
            <h2 className="text-2xl font-hand font-bold mb-2">עוד אין שאלות בסינון הזה</h2>
            <p className="text-[var(--muted-foreground)] mb-4">המאגר המרכזי גדל בהדרגה. בחרו נושא אחר או רמת קושי אחרת.</p>
            <WobblyButton onClick={() => { setTopic('all'); setDifficulty('easy'); setAudience('kids') }} variant="primary">חזרה לשאלות זמינות</WobblyButton>
          </WobblyCard>
        )}

        <div className="grid gap-5">
          <WobblyCard hover={false} padding="p-5">
            <h2 className="font-hand text-2xl font-bold mb-3">חדשות בלייב 🔴</h2>
            <div className="grid gap-2 text-sm">
              {liveNews.map((item, index) => <div key={index} className="rounded-xl bg-[var(--postit)] px-3 py-2">{item}</div>)}
            </div>
          </WobblyCard>

          {mode === 'multi' && (
            <WobblyCard hover={false} padding="p-5">
              <h2 className="font-hand text-2xl font-bold mb-3">ריבוי שחקנים</h2>
              <div className="grid gap-2 mb-3">
                {playerNames.map((name, index) => <input key={index} value={name} onChange={(event) => setPlayerNames((names) => names.map((item, i) => i === index ? event.target.value : item))} className="rounded-xl border-2 border-[var(--border)] px-3 py-2" />)}
              </div>
              <div className="mb-3 flex gap-2 text-sm">
                {playerNames.length < 4 && <button className="font-bold text-[var(--pen)]" onClick={() => setPlayerNames((names) => [...names, `שחקן ${names.length + 1}`])}>+ שחקן</button>}
                {playerNames.length > 2 && <button className="font-bold text-[var(--accent)]" onClick={() => setPlayerNames((names) => names.slice(0, -1))}>הסר</button>}
              </div>
              <WobblyButton variant="secondary" onClick={resetPlayers}>התחל משחק שחקנים</WobblyButton>
              <div className="mt-4 grid gap-2">
                {players.map((player) => <div key={player.id} className="rounded-xl border border-[var(--border)] bg-white p-2 text-sm"><strong>{player.name}</strong> — {player.correct}/{player.total}, רצף {player.streak}</div>)}
                {leader && <Badge color="green">מוביל: {leader.name}</Badge>}
              </div>
            </WobblyCard>
          )}
        </div>
      </div>
    </div>
  )
}


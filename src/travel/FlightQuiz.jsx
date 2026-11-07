import { useMemo, useState } from 'react'
import { TRIVIA_4 } from '../data/content/trivia4'
import { TRIVIA_5 } from '../data/content/trivia5'

// "בוגה לייב — מצב טיסה": the live quiz on ONE device, no internet. 1–4 players share the screen.
// Mode "turns": the device passes from player to player. Mode "buzz": everyone sees the question,
// the first to press their own coloured button answers.
const TOPICS = ['kids-6-8', 'kids-9-11', 'family', 'general-knowledge', 'hanukkah-adults']
const ALL = [...TRIVIA_4, ...TRIVIA_5]
const PLAYERS = [
  { color: '#e11d48', emoji: '🦊' },
  { color: '#2563eb', emoji: '🐳' },
  { color: '#16a34a', emoji: '🐸' },
  { color: '#d97706', emoji: '🦁' },
]
const ROUND = 10
const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
// Shuffle the options too, keeping track of the right one.
const deal = topic => shuffle(topic.questions).slice(0, ROUND).map(q => {
  const order = shuffle(q.options.map((_, i) => i))
  return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) }
})

export default function FlightQuiz() {
  const topics = useMemo(() => TOPICS.map(s => ALL.find(t => t.slug === s)).filter(Boolean), [])
  const [setup, setSetup] = useState({ count: 2, mode: 'turns', topic: topics[0]?.slug, names: ['', '', '', ''] })
  const [game, setGame] = useState(null)

  const start = () => {
    const topic = topics.find(t => t.slug === setup.topic) || topics[0]
    const players = PLAYERS.slice(0, setup.count).map((p, i) => ({ ...p, name: setup.names[i].trim() || `שחקן ${i + 1}`, score: 0 }))
    setGame({ topic, players, questions: deal(topic), i: 0, turn: 0, buzzed: null, picked: null, mode: setup.count === 1 ? 'turns' : setup.mode })
  }

  if (!game) return <div className="fq">
    <p className="fq-lead">חידון של בוגה לייב שעובד גם בלי אינטרנט: מכשיר אחד, עד ארבעה שחקנים. {ROUND} שאלות בכל סיבוב.</p>
    <fieldset className="fq-set"><legend>כמה משחקים?</legend>
      <div className="fq-row">{[1, 2, 3, 4].map(n => <button key={n} aria-pressed={setup.count === n} className={setup.count === n ? 'on' : ''} onClick={() => setSetup(s => ({ ...s, count: n }))}>{n === 1 ? 'לבד' : n}</button>)}</div>
    </fieldset>
    {setup.count > 1 && <fieldset className="fq-set"><legend>איך משחקים?</legend>
      <div className="fq-row">
        <button aria-pressed={setup.mode === 'turns'} className={setup.mode === 'turns' ? 'on' : ''} onClick={() => setSetup(s => ({ ...s, mode: 'turns' }))}>🔁 בתורות — מעבירים את המכשיר</button>
        <button aria-pressed={setup.mode === 'buzz'} className={setup.mode === 'buzz' ? 'on' : ''} onClick={() => setSetup(s => ({ ...s, mode: 'buzz' }))}>⚡ מי ראשון — כל אחד עם כפתור</button>
      </div>
    </fieldset>}
    <fieldset className="fq-set"><legend>שמות (לא חובה)</legend>
      <div className="fq-row">{PLAYERS.slice(0, setup.count).map((p, i) => <label key={i} className="fq-name" style={{ borderColor: p.color }}><span aria-hidden="true">{p.emoji}</span><input value={setup.names[i]} maxLength={12} placeholder={`שחקן ${i + 1}`} aria-label={`שם שחקן ${i + 1}`} onChange={e => setSetup(s => ({ ...s, names: s.names.map((x, j) => j === i ? e.target.value : x) }))} /></label>)}</div>
    </fieldset>
    <fieldset className="fq-set"><legend>נושא</legend>
      <div className="fq-row">{topics.map(t => <button key={t.slug} aria-pressed={setup.topic === t.slug} className={setup.topic === t.slug ? 'on' : ''} onClick={() => setSetup(s => ({ ...s, topic: t.slug }))}>{t.emoji} {t.title}</button>)}</div>
    </fieldset>
    <button className="fq-go" onClick={start}>✈️ מתחילים!</button>
  </div>

  const { players, questions, i, mode } = game
  const done = i >= questions.length
  if (done) {
    const best = Math.max(...players.map(p => p.score))
    const winners = players.filter(p => p.score === best)
    return <div className="fq">
      <h3 className="fq-big">{players.length === 1 ? `${best} מתוך ${ROUND}!` : winners.length > 1 ? '🤝 תיקו!' : `🏆 בראש הטבלה: ${winners[0].emoji} ${winners[0].name}`}</h3>
      <ol className="fq-board">{[...players].sort((a, b) => b.score - a.score).map(p => <li key={p.color} style={{ borderColor: p.color }}><span>{p.emoji} {p.name}</span><b>{p.score}</b></li>)}</ol>
      <div className="fq-row">
        <button className="fq-go" onClick={() => setGame(g => ({ ...g, players: g.players.map(p => ({ ...p, score: 0 })), questions: deal(g.topic), i: 0, turn: 0, buzzed: null, picked: null }))}>🔁 עוד סיבוב</button>
        <button onClick={() => setGame(null)}>⚙️ שחקנים ונושא</button>
      </div>
    </div>
  }

  const q = questions[i]
  // Who answers now: the player whose turn it is, or whoever buzzed first.
  const answering = mode === 'turns' ? game.turn : game.buzzed
  const pick = k => {
    if (game.picked !== null || answering === null) return
    setGame(g => ({ ...g, picked: k, players: g.players.map((p, j) => j === answering && k === q.answer ? { ...p, score: p.score + 1 } : p) }))
  }
  const next = () => setGame(g => ({ ...g, i: g.i + 1, turn: (g.turn + 1) % g.players.length, buzzed: null, picked: null }))
  const current = answering !== null ? players[answering] : null

  return <div className="fq">
    <div className="fq-top"><span>{game.topic.emoji} שאלה {i + 1} מתוך {questions.length}</span>
      <span className="fq-scores">{players.map(p => <b key={p.color} style={{ color: p.color }}>{p.emoji} {p.score}</b>)}</span></div>
    {current && <p className="fq-who" style={{ background: current.color }}>{current.emoji} {mode === 'turns' ? `התור של ${current.name}` : `${current.name} — הכי מהיר!`}</p>}
    <h3 className="fq-q">{q.q}</h3>
    {mode === 'buzz' && game.buzzed === null && <div className="fq-buzz">{players.map((p, j) => <button key={p.color} style={{ background: p.color }} onClick={() => setGame(g => ({ ...g, buzzed: j }))}>{p.emoji}<br />{p.name}</button>)}</div>}
    {(mode === 'turns' || game.buzzed !== null) && <div className="fq-options">{q.options.map((o, k) => {
      const state = game.picked === null ? '' : k === q.answer ? 'ok' : k === game.picked ? 'bad' : 'dim'
      return <button key={o} className={state} disabled={game.picked !== null} onClick={() => pick(k)}>{o}</button>
    })}</div>}
    {game.picked !== null && <div className="fq-result">
      <p><b>{game.picked === q.answer ? '✅ נכון! נקודה אחת.' : `❌ התשובה הנכונה: ${q.options[q.answer]}`}</b></p>
      {q.explain && <p>{q.explain}</p>}
      <button className="fq-go" onClick={next}>{i + 1 < questions.length ? 'לשאלה הבאה ←' : 'לתוצאות 🏆'}</button>
    </div>}
  </div>
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import { cleanCode, liveMemory, liveQuizDb, newLiveToken } from '../utils/liveQuizDb'
import '../pages/live/live-quiz.css'

const freshQuestion = () => ({ id: Math.random().toString(36).slice(2), q: '', options: ['', '', '', ''], correct: null })
export default function EnglishLiveHome() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState(''), [title, setTitle] = useState(''), [seconds, setSeconds] = useState(20)
  const [questions, setQuestions] = useState([freshQuestion()]), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const patchQuestion = (index, patch) => setQuestions(all => all.map((item, i) => i === index ? { ...item, ...patch } : item))
  const patchOption = (index, option, value) => patchQuestion(index, { options: questions[index].options.map((item, i) => i === option ? value : item) })
  const create = async event => {
    event.preventDefault(); setError('')
    const cleaned = questions.map(item => ({ ...item, q: item.q.trim(), options: item.options.map(x => x.trim()).filter(Boolean) }))
    const bad = cleaned.findIndex(item => !item.q || item.options.length < 2 || item.correct == null || item.correct >= item.options.length)
    if (bad >= 0) { setError(`Complete question ${bad + 1} and select its correct answer.`); return }
    setBusy(true)
    try { const token = newLiveToken(), gameTitle = title.trim() || 'My live quiz'; const code = await liveQuizDb.create(token, gameTitle, cleaned, seconds); liveMemory.rememberHost(code, token, gameTitle); navigate(`/en/live/${code}/host#k=${token}`) }
    catch { setError('We could not create the game. Please try again.') } finally { setBusy(false) }
  }
  const join = event => { event.preventDefault(); const code = cleanCode(joinCode); if (code.length === 6) navigate(`/en/play/${code}`); else setError('Enter the 6-character game code.') }
  return <div className="en-page live-home" dir="ltr">
    <SEO lang="en" title="Buga Live - free live classroom quiz" description="Create a live quiz, share the code or QR and let up to 100 players answer from their phones. Free and no player account required." path="/en/live" counterpartPath="/live" />
    <header className="live-hero"><span className="live-logo">B!</span><div><p>LIVE CLASSROOM GAME</p><h1>Buga Live</h1><p>Create the questions, share the code and play together in real time — up to 100 players.</p></div></header>
    <form className="live-join" onSubmit={join}><label htmlFor="en-live-code">Have a game code?</label><div><input id="en-live-code" value={joinCode} onChange={e => setJoinCode(cleanCode(e.target.value))} placeholder="ABC123" maxLength={6} autoCapitalize="characters"/><button>Join game</button></div></form>
    <form className="live-editor" onSubmit={create}><h2>Create a new live quiz</h2>
      <div className="live-settings"><label>Quiz title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="For example: Space quiz" /></label><label>Seconds per question<select value={seconds} onChange={e => setSeconds(Number(e.target.value))}>{[10,15,20,30,45,60].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></label></div>
      <div className="live-question-list">{questions.map((item, index) => <section className="live-edit-question" key={item.id}><div className="live-question-head"><h3>Question {index + 1}</h3><div><button type="button" onClick={() => patchQuestion(index, { options: ['True', 'False'], correct: 0 })}>True / False</button>{questions.length > 1 && <button type="button" onClick={() => setQuestions(all => all.filter((_, i) => i !== index))}>Delete</button>}</div></div><input className="live-question-input" value={item.q} onChange={e => patchQuestion(index, { q: e.target.value })} placeholder="Type your question" maxLength={240} /><div className="live-edit-options">{item.options.map((option, optionIndex) => <label key={optionIndex} className={`live-edit-option ${item.correct === optionIndex ? 'chosen' : ''}`}><input type="radio" name={`correct-${item.id}`} checked={item.correct === optionIndex} onChange={() => patchQuestion(index, { correct: optionIndex })}/><input value={option} onChange={e => patchOption(index, optionIndex, e.target.value)} placeholder={`Answer ${optionIndex + 1}`} maxLength={120}/></label>)}</div></section>)}</div>
      <button type="button" className="live-add-question" disabled={questions.length >= 50} onClick={() => setQuestions(all => [...all, freshQuestion()])}>+ Add another question</button>
      {error && <p className="live-error" role="alert">{error}</p>}<button className="live-create-button" disabled={busy}>{busy ? 'Creating game…' : 'Create game and get the code'}</button><p className="live-privacy">Players join with a nickname only. No account is needed.</p>
    </form>
  </div>
}

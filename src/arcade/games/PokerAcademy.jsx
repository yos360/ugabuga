import { useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { drawOdds, formatOdds } from '../logic/poker'
import { RANKING, QUESTIONS } from '../logic/pokerAcademy'
import { useProgress } from '../hooks'
import { Hud } from '../ui'
import { sfx } from '../sfx'
import './poker-academy.css'
import './card-polish.css'

function Card({ card }) { return <span className={`pa-card${isRed(card) ? ' is-red' : ''}`}><b>{rankLabel(card.rank)}</b>{SUITS[card.suit]}</span> }
function Cards({ cards }) { return <span className="pa-cards" dir="ltr">{cards.map(card => <Card key={card.id} card={card} />)}</span> }

export default function PokerAcademy({ daily, onReport, onShare }) {
  const [progress, saveProgress] = useProgress('poker-academy', { correct: 0, answered: 0, level: 0 })
  const [tab, setTab] = useState(daily ? 'quiz' : 'learn'), [difficulty, setDifficulty] = useState('beginner'), [question, setQuestion] = useState(daily ? daily.seed % QUESTIONS.length : 0), [feedback, setFeedback] = useState(null), [outs, setOuts] = useState(9), [streets, setStreets] = useState(2)
  const available = daily ? QUESTIONS : QUESTIONS.filter(item => item.level === difficulty)
  const current = available[question % available.length]
  const answer = value => {
    if (feedback) return
    const correct = value === current.answer; setFeedback({ correct, value }); sfx(correct ? 'win' : 'bump')
    saveProgress(previous => ({ correct: previous.correct + (correct ? 1 : 0), answered: previous.answered + 1, level: previous.level + (correct ? 1 : 0) }))
    if (correct) onReport?.({ text: `🎓 פתרתי חידת פוקר באקדמיית הפוקר (${progress.correct + 1} תשובות נכונות)` })
    daily?.finish({ won: correct, score: correct ? 1 : null, text: correct ? '🎓 זיהיתי נכון את היד המנצחת' : '🎓 החידה היומית הייתה מאתגרת הפעם' })
  }
  const next = () => { setQuestion(index => (index + 1) % available.length); setFeedback(null) }
  const chooseDifficulty = value => { setDifficulty(value); setQuestion(0); setFeedback(null) }
  return <div className="arc-game pa-game"><Hud stats={[['נכונות', progress.correct], ['נענו', progress.answered], ['רמה', progress.level + 1]]} />
    {!daily && <nav className="pa-tabs">{[['learn', '📚 דירוג ידיים'], ['quiz', '🧩 מי מנצח?'], ['odds', '📊 הסתברויות']].map(([value, label]) => <button type="button" key={value} className={tab === value ? 'is-on' : ''} onClick={() => setTab(value)}>{label}</button>)}</nav>}
    <p className="card-guide">{tab === 'learn' ? 'לומדים את דירוג הידיים מהחזקה לחלשה.' : tab === 'quiz' ? 'השוו את שתי הידיים יחד עם קלפי הלוח ובחרו את היד המנצחת.' : 'בחרו מספר קלפים משפרים ומספר קלפים שייפתחו כדי לראות את הסיכוי.'}</p>
    {tab === 'learn' && <section className="pa-ranking"><header><h3>דירוג ידיים — מהחזקה לחלשה</h3><p>משווים קודם את סוג היד, ורק אחר כך את הקלפים בתוך אותה קטגוריה.</p></header>{RANKING.map((item, index) => <article key={item.id}><span className="pa-place">{index + 1}</span><div><b>{item.name}</b><small>{item.text}</small></div><Cards cards={item.cards} /></article>)}</section>}
    {tab === 'quiz' && <section className="pa-quiz"><h3>איזו יד מנצחת?</h3>{!daily && <div className="pa-streets" aria-label="רמת קושי">{[['beginner', 'מתחילים'], ['intermediate', 'מתקדמים'], ['expert', 'מומחים']].map(([value, label]) => <button type="button" key={value} className={difficulty === value ? 'is-on' : ''} onClick={() => chooseDifficulty(value)}>{label}</button>)}</div>}<div className="pa-board"><b>הלוח</b><Cards cards={current.board} /></div><div className="pa-players">{current.players.map((cards, index) => <button type="button" key={index} onClick={() => answer(index)} className={feedback?.value === index ? 'picked' : ''}><b>יד {index ? 'ב׳' : 'א׳'}</b><Cards cards={cards} /></button>)}<button type="button" onClick={() => answer(2)} className={feedback?.value === 2 ? 'picked' : ''}><b>תיקו</b><span>הקופה מתחלקת</span></button></div>{feedback && <div className={`pa-feedback ${feedback.correct ? 'correct' : 'wrong'}`} role="status"><b>{feedback.correct ? '✅ נכון!' : '❌ לא הפעם'}</b><p>{current.explanation}</p><button type="button" onClick={next}>לחידה הבאה ←</button></div>}</section>}
    {tab === 'odds' && <section className="pa-odds"><h3>מחשבון Outs בסיסי</h3><p><b>Out</b> הוא קלף שעדיין בחפיסה ומשפר את היד. לדוגמה, אחרי הפלופ יש בדרך כלל 47 קלפים לא ידועים.</p><label>כמה Outs יש לכם? <input type="range" min="1" max="20" value={outs} onChange={event => setOuts(+event.target.value)} /><b>{outs}</b></label><div className="pa-odds-result"><strong>{formatOdds(drawOdds(outs, 47, streets))}</strong><span>סיכוי לפגוע {streets === 2 ? 'עד הריבר' : 'בקלף הבא'}</span></div><div className="pa-streets"><button type="button" className={streets === 1 ? 'is-on' : ''} onClick={() => setStreets(1)}>קלף אחד</button><button type="button" className={streets === 2 ? 'is-on' : ''} onClick={() => setStreets(2)}>שני קלפים</button></div><p className="pa-formula">החישוב מדויק וללא החזרה: הסיכוי הוא 1 פחות הסיכוי להחמיץ בכל הקלפים שנותרו.</p></section>}
    <button type="button" className="pa-share" onClick={() => onShare?.(`🎓 למדתי לזהות ידיים באקדמיית הפוקר של עוגה בוגה — ${progress.correct} תשובות נכונות!`)}>📱 שתפו התקדמות</button>
  </div>
}

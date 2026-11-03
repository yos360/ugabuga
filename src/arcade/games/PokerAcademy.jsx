import { useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { drawOdds, formatOdds } from '../logic/poker'
import { RANKING, QUESTIONS } from '../logic/pokerAcademy'
import { EXPLANATIONS_EN, HAND_NAMES_EN, RANKING_TEXT_EN } from '../logic/pokerText'
import { useProgress } from '../hooks'
import { Hud } from '../ui'
import { sfx } from '../sfx'
import './poker-academy.css'
import './card-polish.css'

function Card({ card }) { return <span className={`pa-card${isRed(card) ? ' is-red' : ''}`}><b>{rankLabel(card.rank)}</b>{SUITS[card.suit]}</span> }
function Cards({ cards }) { return <span className="pa-cards" dir="ltr">{cards.map(card => <Card key={card.id} card={card} />)}</span> }

export default function PokerAcademy({ daily, onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('poker-academy', { correct: 0, answered: 0, level: 0 })
  const [tab, setTab] = useState(daily ? 'quiz' : 'learn'), [difficulty, setDifficulty] = useState('beginner'), [question, setQuestion] = useState(daily ? daily.seed % QUESTIONS.length : 0), [feedback, setFeedback] = useState(null), [outs, setOuts] = useState(9), [streets, setStreets] = useState(2)
  const available = daily ? QUESTIONS : QUESTIONS.filter(item => item.level === difficulty)
  const current = available[question % available.length]
  const answer = value => {
    if (feedback) return
    const correct = value === current.answer; setFeedback({ correct, value }); sfx(correct ? 'win' : 'bump')
    saveProgress(previous => ({ correct: previous.correct + (correct ? 1 : 0), answered: previous.answered + 1, level: previous.level + (correct ? 1 : 0) }))
    if (correct) onReport?.({ text: en ? `🎓 I solved a poker puzzle in Poker Academy (${progress.correct + 1} correct answers)` : `🎓 פתרתי חידת פוקר באקדמיית הפוקר (${progress.correct + 1} תשובות נכונות)` })
    daily?.finish({ won: correct, score: correct ? 1 : null, text: correct ? '🎓 זיהיתי נכון את היד המנצחת' : '🎓 החידה היומית הייתה מאתגרת הפעם' })
  }
  const next = () => { setQuestion(index => (index + 1) % available.length); setFeedback(null) }
  const chooseDifficulty = value => { setDifficulty(value); setQuestion(0); setFeedback(null) }
  const tabs = en ? [['learn', '📚 Hand ranking'], ['quiz', '🧩 Who wins?'], ['odds', '📊 Odds']] : [['learn', '📚 דירוג ידיים'], ['quiz', '🧩 מי מנצח?'], ['odds', '📊 הסתברויות']]
  const levels = en ? [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['expert', 'Expert']] : [['beginner', 'מתחילים'], ['intermediate', 'מתקדמים'], ['expert', 'מומחים']]
  return <div className="arc-game pa-game"><Hud stats={[[en ? 'Correct' : 'נכונות', progress.correct], [en ? 'Answered' : 'נענו', progress.answered], [en ? 'Level' : 'רמה', progress.level + 1]]} />
    {!daily && <nav className="pa-tabs">{tabs.map(([value, label]) => <button type="button" key={value} className={tab === value ? 'is-on' : ''} onClick={() => setTab(value)}>{label}</button>)}</nav>}
    <p className="card-guide">{tab === 'learn' ? (en ? 'Learn the hand ranking from strongest to weakest.' : 'לומדים את דירוג הידיים מהחזקה לחלשה.') : tab === 'quiz' ? (en ? 'Compare the two hands together with the board cards and pick the winning hand.' : 'השוו את שתי הידיים יחד עם קלפי הלוח ובחרו את היד המנצחת.') : (en ? 'Choose the number of improving cards and the number of cards still to come to see the chance.' : 'בחרו מספר קלפים משפרים ומספר קלפים שייפתחו כדי לראות את הסיכוי.')}</p>
    {tab === 'learn' && <section className="pa-ranking"><header><h3>{en ? 'Hand ranking, strongest to weakest' : 'דירוג ידיים — מהחזקה לחלשה'}</h3><p>{en ? 'First compare the type of hand, and only then the cards within the same category.' : 'משווים קודם את סוג היד, ורק אחר כך את הקלפים בתוך אותה קטגוריה.'}</p></header>{RANKING.map((item, index) => <article key={item.id}><span className="pa-place">{index + 1}</span><div><b>{en ? HAND_NAMES_EN[8 - index] : item.name}</b><small>{en ? RANKING_TEXT_EN[index] : item.text}</small></div><Cards cards={item.cards} /></article>)}</section>}
    {tab === 'quiz' && <section className="pa-quiz"><h3>{en ? 'Which hand wins?' : 'איזו יד מנצחת?'}</h3>{!daily && <div className="pa-streets" aria-label={en ? 'Difficulty' : 'רמת קושי'}>{levels.map(([value, label]) => <button type="button" key={value} className={difficulty === value ? 'is-on' : ''} onClick={() => chooseDifficulty(value)}>{label}</button>)}</div>}<div className="pa-board"><b>{en ? 'Board' : 'הלוח'}</b><Cards cards={current.board} /></div><div className="pa-players">{current.players.map((cards, index) => <button type="button" key={index} onClick={() => answer(index)} className={feedback?.value === index ? 'picked' : ''}><b>{en ? `Hand ${index ? 'B' : 'A'}` : `יד ${index ? 'ב׳' : 'א׳'}`}</b><Cards cards={cards} /></button>)}<button type="button" onClick={() => answer(2)} className={feedback?.value === 2 ? 'picked' : ''}><b>{en ? 'Tie' : 'תיקו'}</b><span>{en ? 'The pot is split' : 'הקופה מתחלקת'}</span></button></div>{feedback && <div className={`pa-feedback ${feedback.correct ? 'correct' : 'wrong'}`} role="status"><b>{feedback.correct ? (en ? '✅ Correct!' : '✅ נכון!') : (en ? '❌ Not this time' : '❌ לא הפעם')}</b><p>{en ? EXPLANATIONS_EN[current.id] : current.explanation}</p><button type="button" onClick={next}>{en ? 'Next puzzle →' : 'לחידה הבאה ←'}</button></div>}</section>}
    {tab === 'odds' && <section className="pa-odds"><h3>{en ? 'Basic outs calculator' : 'מחשבון Outs בסיסי'}</h3><p>{en ? <><b>An out</b> is a card still in the deck that improves your hand. For example, after the flop there are usually 47 unknown cards.</> : <><b>Out</b> הוא קלף שעדיין בחפיסה ומשפר את היד. לדוגמה, אחרי הפלופ יש בדרך כלל 47 קלפים לא ידועים.</>}</p><label>{en ? 'How many outs do you have?' : 'כמה Outs יש לכם?'} <input type="range" min="1" max="20" value={outs} onChange={event => setOuts(+event.target.value)} /><b>{outs}</b></label><div className="pa-odds-result"><strong>{formatOdds(drawOdds(outs, 47, streets))}</strong><span>{en ? `Chance to hit ${streets === 2 ? 'by the river' : 'on the next card'}` : `סיכוי לפגוע ${streets === 2 ? 'עד הריבר' : 'בקלף הבא'}`}</span></div><div className="pa-streets"><button type="button" className={streets === 1 ? 'is-on' : ''} onClick={() => setStreets(1)}>{en ? 'One card' : 'קלף אחד'}</button><button type="button" className={streets === 2 ? 'is-on' : ''} onClick={() => setStreets(2)}>{en ? 'Two cards' : 'שני קלפים'}</button></div><p className="pa-formula">{en ? 'The calculation is exact, without replacement: the chance is 1 minus the chance of missing on every card still to come.' : 'החישוב מדויק וללא החזרה: הסיכוי הוא 1 פחות הסיכוי להחמיץ בכל הקלפים שנותרו.'}</p></section>}
    <button type="button" className="pa-share" onClick={() => onShare?.(en ? `🎓 I learned to read poker hands in the Ugabuga Poker Academy: ${progress.correct} correct answers!` : `🎓 למדתי לזהות ידיים באקדמיית הפוקר של עוגה בוגה — ${progress.correct} תשובות נכונות!`)}>{en ? '📱 Share your progress' : '📱 שתפו התקדמות'}</button>
  </div>
}

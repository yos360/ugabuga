import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { shareLink, shareOnWhatsApp } from '../../utils/share'
import { TRICK_LEVELS, TRICK_BY_LEVEL, TRICK_QUESTIONS } from '../../data/trickQuestions'
import './trick-questions.css'

// "Think you're smart?" — 12 trick questions that get harder (4 per level), 3 lives, a timer,
// one 50:50 per game, an explanation after every answer, and a score worth sharing.
const PATH = '/trick-questions'
const PER_LEVEL = 4
const LIVES = 3
const SEEN_KEY = 'buga-trick-seen'
const BEST_KEY = 'buga-trick-best'

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

// Unseen questions first, so a few games in a row don't repeat; the seen list resets once a level runs out.
function buildGame() {
  let seen = new Set(read(SEEN_KEY, []))
  const picked = TRICK_LEVELS.flatMap(l => {
    const pool = TRICK_BY_LEVEL[l.id]
    let fresh = pool.filter(q => !seen.has(q.id))
    if (fresh.length < PER_LEVEL) { pool.forEach(q => seen.delete(q.id)); fresh = pool }
    return shuffle(fresh).slice(0, PER_LEVEL)
  })
  picked.forEach(q => seen.add(q.id))
  write(SEEN_KEY, [...seen])
  return picked.map(q => ({ ...q, shown: shuffle(q.options.map((text, i) => ({ text, right: i === 0 }))) }))
}

const RANKS = [
  [12, '🧠', 'גאונים אמיתיים', 'אף מלכודת לא תפסה אתכם. מרשים!'],
  [10, '🦉', 'חדים כתער', 'כמעט מושלם — רק מלכודת או שתיים.'],
  [7, '😎', 'לא נופלים בקלות', 'יותר טוב מרוב מי שמנסה.'],
  [4, '🙃', 'נפלתם בכמה פחים', 'השאלות האלה בנויות להכשיל. עוד סיבוב?'],
  [0, '😅', 'המלכודות ניצחו הפעם', 'עכשיו אתם כבר מכירים את הטריקים — נסו שוב!'],
]
const rankFor = n => RANKS.find(r => n >= r[0])
const secondsFor = q => TRICK_LEVELS.find(l => l.id === q.level).seconds

function Game({ onExit }) {
  const [qs] = useState(buildGame)
  const [left, setLeft] = useState(() => secondsFor(qs[0]))
  const [i, setI] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [score, setScore] = useState(0)
  const [right, setRight] = useState(0)
  const [streak, setStreak] = useState(0)
  const [picked, setPicked] = useState(null) // index in q.shown, or -1 when time ran out
  const [hidden, setHidden] = useState([]) // options removed by 50:50
  const [fiftyUsed, setFiftyUsed] = useState(false)
  const [over, setOver] = useState(false)
  const nextRef = useRef(null)
  const q = qs[i]
  const level = TRICK_LEVELS.find(l => l.id === q.level)

  useEffect(() => {
    if (picked !== null || over) return
    if (left <= 0) { answer(-1); return }
    const t = setTimeout(() => setLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  })
  useEffect(() => { if (picked !== null) nextRef.current?.focus() }, [picked])

  function answer(k) {
    if (picked !== null) return
    setPicked(k)
    const ok = k >= 0 && q.shown[k].right
    if (ok) {
      const s = streak + 1
      setStreak(s); setRight(r => r + 1)
      setScore(v => v + 100 * q.level + Math.max(0, left) * 5 + (s >= 3 ? 50 : 0))
    } else {
      setStreak(0); setLives(l => l - 1)
    }
  }
  function next() {
    if (lives <= 0 || i === qs.length - 1) { setOver(true); return }
    setI(i + 1); setPicked(null); setHidden([]); setLeft(secondsFor(qs[i + 1]))
  }
  function fifty() {
    if (fiftyUsed || picked !== null) return
    setFiftyUsed(true)
    setHidden(shuffle(q.shown.map((o, k) => (o.right ? -1 : k)).filter(k => k >= 0)).slice(0, 2))
  }

  if (over) return <Result right={right} total={qs.length} score={score} reached={i + 1} onAgain={onExit} />
  const ok = picked !== null && picked >= 0 && q.shown[picked].right
  return <section className="tq-card" aria-live="polite">
    <div className="tq-top">
      <span className="tq-lives" aria-label={`נשארו ${lives} חיים`}>{Array.from({ length: LIVES }, (_, k) => <span key={k} className={k < lives ? '' : 'is-lost'} aria-hidden="true">❤️</span>)}</span>
      <span className="tq-level">{level.emoji} {level.label}</span>
      <span className="tq-score"><b>{score}</b> נק׳</span>
    </div>
    <div className="tq-progress" aria-hidden="true">{qs.map((_, k) => <span key={k} className={k < i ? 'is-done' : k === i ? 'is-now' : ''} />)}</div>
    <div className="tq-timer" aria-hidden="true"><span style={{ width: `${(Math.max(0, left) / level.seconds) * 100}%` }} className={left <= 5 ? 'is-low' : ''} /></div>
    <p className="tq-count">שאלה {i + 1} מתוך {qs.length}{streak >= 3 && <span className="tq-streak"> · 🔥 רצף {streak}</span>}</p>
    <h2 className="tq-q">{q.q}</h2>
    <div className="tq-options">{q.shown.map((o, k) => {
      const state = picked === null ? '' : o.right ? 'is-right' : k === picked ? 'is-wrong' : 'is-dim'
      return <button key={k} type="button" className={`tq-opt ${state}`} disabled={picked !== null || hidden.includes(k)} hidden={hidden.includes(k) || undefined} onClick={() => answer(k)}>{o.text}</button>
    })}</div>
    {picked === null
      ? <div className="tq-tools"><button type="button" className="tq-fifty" disabled={fiftyUsed} onClick={fifty}>✂️ 50:50 {fiftyUsed ? '(נוצל)' : '(פעם אחת במשחק)'}</button><span className="tq-time">⏱️ {Math.max(0, left)}</span></div>
      : <div className={`tq-explain ${ok ? 'is-ok' : 'is-bad'}`}>
        <p className="tq-verdict">{ok ? '✅ נכון!' : picked === -1 ? '⏰ נגמר הזמן' : '❌ נפלתם בפח'}{!ok && lives === 0 && ' — נגמרו החיים'}</p>
        <p><b>הטריק:</b> {q.a}</p>
        <button ref={nextRef} type="button" className="tq-next" onClick={next}>{lives <= 0 || i === qs.length - 1 ? 'לתוצאה שלי ←' : 'לשאלה הבאה ←'}</button>
      </div>}
  </section>
}

function Result({ right, total, score, reached, onAgain }) {
  const [best] = useState(() => { const b = read(BEST_KEY, 0); if (score > b) write(BEST_KEY, score); return b })
  const [, emoji, title, text] = rankFor(right)
  const share = () => {
    shareOnWhatsApp(`${emoji} עניתי נכון על ${right} מתוך ${total} שאלות מכשילות (${score} נקודות).\nחושבים שאתם חכמים יותר? 😏\n${shareLink(PATH, 'trick_questions')}`)
  }
  return <section className="tq-card tq-result">
    <p className="tq-result-emoji" aria-hidden="true">{emoji}</p>
    <h2>{title}</h2>
    <p className="tq-result-line">עניתם נכון על <b>{right}</b> מתוך {total}{reached < total && ` (הגעתם עד שאלה ${reached})`}</p>
    <p className="tq-result-score">{score} נקודות{score > best && best > 0 ? ' · 🏆 שיא אישי חדש!' : best > 0 ? ` · השיא שלכם: ${best}` : ''}</p>
    <p className="tq-result-text">{text}</p>
    <div className="tq-result-actions">
      <button type="button" className="tq-next" onClick={onAgain}>🔁 עוד סיבוב (שאלות חדשות)</button>
      <button type="button" className="tq-share" onClick={share}>📲 אתגרו חברים בוואטסאפ</button>
    </div>
  </section>
}

const SAMPLE_IDS = ['t101', 't102', 't104', 't109', 't201', 't209', 't212', 't227', 't229', 't302']
const faq = [
  { q: 'כמה שאלות יש במשחק?', a: `בכל סיבוב 12 שאלות — 4 מכל רמה, מהקלה לקשה. במאגר ${TRICK_QUESTIONS.length} שאלות, ומשחק חדש מעדיף שאלות שעוד לא ראיתם.` },
  { q: 'למי זה מתאים?', a: 'למבוגרים ולנוער, ולמשחק משפחתי עם ילדים גדולים. השאלות מבוססות על מלכודות חשיבה ועל מיתוסים נפוצים, וכל תשובה מגיעה עם הסבר.' },
]
const body = [
  'שאלות מכשילות הן שאלות שנראות פשוטות, אבל בנויות כך שהתשובה הראשונה שקופצת לראש — שגויה. חלקן משחקות במילים, חלקן בודקות חשבון מהיר, ורבות מהן מבוססות על "עובדות" שכולם מכירים ואינן נכונות.',
  'במשחק יש שלוש רמות: מתחממים, מכשילים ורק לגאונים. לכל שאלה יש שעון, יש שלושה חיים ועזרה אחת של 50:50. אחרי כל תשובה מופיע הסבר קצר — כך שגם מי שנפל בפח יוצא עם משהו חדש.',
]

export default function TrickQuestions() {
  const [round, setRound] = useState(0) // 0 = start screen; each new game gets a new key
  const [best] = useState(() => read(BEST_KEY, 0))
  const samples = SAMPLE_IDS.map(id => TRICK_QUESTIONS.find(q => q.id === id)).filter(Boolean)
  return <>
    <SEO path={PATH} title="שאלות מכשילות — חושבים שאתם חכמים? משחק אונליין עם תשובות" description={`${TRICK_QUESTIONS.length} שאלות מכשילות ומיתוסים נפוצים בשלוש רמות קושי: שעון, שלושה חיים, 50:50 והסבר לכל תשובה. משחק חינמי בעברית, בלי הרשמה.`} structuredData={faqSchema(faq)} />
    <div className="tq-page" dir="rtl">
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'שאלות מכשילות' }]} />
      {round === 0
        ? <section className="tq-card tq-start">
          <p className="tq-start-emoji" aria-hidden="true">🧠</p>
          <h1>חושבים שאתם חכמים?</h1>
          <p className="tq-start-lead">12 שאלות מכשילות שהולכות ונעשות קשות. כמה תצליחו לפני שנגמרים החיים?</p>
          <ul className="tq-rules">
            <li>❤️ שלושה חיים</li><li>⏱️ שעון לכל שאלה</li><li>✂️ 50:50 אחד</li><li>💡 הסבר אחרי כל תשובה</li>
          </ul>
          <button type="button" className="tq-next tq-go" onClick={() => setRound(1)}>מתחילים ←</button>
          {best > 0 && <p className="tq-best">🏆 השיא שלכם: {best} נקודות</p>}
        </section>
        : <Game key={round} onExit={() => setRound(r => r + 1)} />}

      <section className="tq-samples">
        <h2>10 שאלות מכשילות עם תשובות</h2>
        <p>טעימה מהמאגר. נסו לענות לפני שפותחים את התשובה.</p>
        {samples.map((q, k) => <details key={q.id}><summary>{k + 1}. {q.q}</summary><p><b>{q.options[0]}.</b> {q.a}</p></details>)}
      </section>
      <SeoBody paragraphs={body} faq={faq} related={[{ label: 'חידון טריוויה', href: '/trivia' }, { label: 'שאלות טריוויה עם תשובות', href: '/trivia/with-answers' }, { label: 'חידות עם תשובות', href: '/riddles/topics' }, { label: 'מנהרת הזמן', href: '/time-tunnel' }]} />
      <p className="tq-more"><Link to="/adults">☕ עוד משחקים למבוגרים ←</Link></p>
    </div>
  </>
}

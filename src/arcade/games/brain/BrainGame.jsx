import { useEffect, useState } from 'react'
import { useProgress } from '../../hooks.js'
import { catalog, puzzle, WORLDS, COUNTS, won, solve, dailyIQ } from '../../logic/brain/catalog.js'
import { streak } from '../../daily.js'
import { AGES, newSession, restoreSession, replay, attempt, nextSession, starsForSession } from '../../logic/brain/session.js'
import PuzzleBoard from './PuzzleBoard.jsx'
import { hintText } from './hintText.js'
import './brain.css'

const TITLES = { matches: 'חידות גפרורים', water: 'כדי המים', river: 'חציית הנהר', wires: 'איזה חוט לחתוך?', lights: 'כיבוי אורות', one: 'רק מהלך אחד', iq: 'בוגה IQ' }
const MODES = [['practice', 'עולמות'], ['daily', 'IQ יומי'], ['exam', 'מבחן בוגה'], ['timed', 'נגד השעון'], ['streak', 'רצף']]
const ageLabel = age => age === 'adult' ? 'מבוגרים' : age
const starsObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const GUIDE = {
  matches: ['בחרו ספרה', 'לחצו על גפרור', 'הזיזו או הסירו'],
  water: ['בחרו כד', 'בחרו פעולה', 'הגיעו לכמות היעד'],
  river: ['בחרו נוסעים', 'לחצו על הסירה', 'העבירו את כולם'],
  wires: ['קראו את הרמזים', 'פסלו אפשרויות', 'חתכו חוט אחד'],
  lights: ['לחצו על נורה', 'בדקו את השכנות', 'כבו את כל הלוח'],
  one: ['עצרו ותכננו', 'בחרו פעולה אחת', 'פתרו במהלך יחיד'],
  iq: ['קראו את המשימה', 'פעלו על הלוח', 'בדקו וקבלו כוכבים'],
}

export default function BrainGame({ kind, onReport }) {
  const [progress, save] = useProgress(`brain-${kind}`, { session: null, stars: {}, dailyWins: {} })
  const [session, setSession] = useState(() => restoreSession(kind, progress.session))
  const [message, setMessage] = useState(''), [map, setMap] = useState(false), [now, setNow] = useState(Date.now)
  const p = puzzle(kind, session.index), state = replay(session), solved = won(p, state)
  const timedOut = session.deadline !== null && now >= session.deadline
  const ended = session.ended || timedOut, stars = starsObject(progress.stars)
  const blocked = solved || ended || (p.oneMove && session.actions.length >= 1) || (p.kind === 'matches' && state.used >= p.budget)
  const world = kind === 'iq' ? WORLDS[Math.floor(session.index / 50)] : null
  const level = kind === 'iq' ? session.index % 50 + 1 : session.index + 1
  const update = next => { setSession(next); save({ session: next }) }

  useEffect(() => {
    if (!session.deadline && session.mode !== 'daily') return undefined
    const timer = setInterval(() => {
      const current = Date.now(); setNow(current)
      if (session.mode === 'daily' && dailyIQ(current).day !== session.day) {
        const next = newSession(kind, { mode: 'daily', age: session.age, now: current })
        setSession(next); save({ session: next }); setMessage('יום חדש — החידה היומית התחלפה.')
      }
    }, 500)
    return () => clearInterval(timer)
  }, [session.deadline, session.mode, session.day, session.age, kind, save])

  const act = action => {
    const next = attempt(session, action)
    const finished = won(p, replay(next))
    setMessage(next.mistakes > session.mistakes ? (p.oneMove && next.actions.length ? 'המהלך לא פתר את החידה. נסו שוב מתחילת השלב.' : 'המהלך לא מתאים לתנאים. בדקו את הכללים ונסו שוב.') : '')
    setSession(next)
    const patch = { session: next }
    if (finished && !solved) {
      patch.stars = { ...stars, [p.id]: Math.max(Number(stars[p.id]) || 0, starsForSession(next, p)) }
      if (session.mode === 'daily') patch.dailyWins = { ...starsObject(progress.dailyWins), [session.day]: true }
      onReport?.({ text: `${TITLES[kind]}: פתרתי את שלב ${session.index + 1}, ציון בוגה ${next.score}` })
    }
    save(patch)
  }
  const start = (mode = 'practice', index = session.index, age = session.age) => {
    // Called only by user event handlers; a new run deliberately gets a fresh clock/seed.
    // eslint-disable-next-line react/purity
    const current = Date.now()
    update(newSession(kind, { mode, index, age, seed: Math.floor(current / 1000), now: current })); setMessage(''); setMap(false); setNow(current)
  }
  const hint = () => { const path = solve(p, state); setMessage(hintText(p, path?.[0])); update({ ...session, hints: session.hints + 1 }) }
  const reset = () => { update({ ...session, actions: [], moves: session.moves + 1, mistakes: session.mistakes + 1, ended: session.mode === 'streak' }); setMessage('') }
  const undo = () => { update({ ...session, actions: session.actions.slice(0, -1), moves: session.moves + 1 }); setMessage('') }
  const totalStars = Object.values(stars).reduce((sum, v) => sum + (Number.isInteger(v) && v >= 1 && v <= 3 ? v : 0), 0)
  const changeAge = age => {
    const bandStart = { '6-8': 0, '9-11': 10, '12+': 20, adult: 25 }[age]
    start(session.mode, Math.floor(session.index / 50) * 50 + bandStart, age)
  }
  return <div className="brain-game" dir="rtl" data-kind={kind} data-puzzle={p.id}>
    <div className="brain-shell">
      <header className="brain-heading"><div><span className="brain-kicker">מעבדת החשיבה של עוגה בוגה</span><h2>{world ? `${world[2]} ${world[1]}` : TITLES[kind]}</h2></div><span className="brain-badge">⭐ {totalStars}</span></header>
      {kind === 'iq' && <><nav className="brain-modes" aria-label="מצבי משחק">{MODES.map(([mode, label]) => <button type="button" key={mode} aria-pressed={session.mode === mode} onClick={() => start(mode)}>{label}</button>)}</nav><div className="brain-age"><label htmlFor="brain-age">רמת גיל</label><select id="brain-age" value={session.age} onChange={e => changeAge(e.target.value)}>{AGES.map(age => <option key={age} value={age}>{ageLabel(age)}</option>)}</select><span>{session.mode === 'daily' ? 'החידה היומית זהה לכולם' : 'קובע את שלב ההתחלה ואת רמת המבחן'}</span></div></>}
      <div className="brain-hud"><b>{p.boss ? '👑 אתגר בוס · ' : ''}שלב {level} / {kind === 'iq' ? 50 : COUNTS[kind]}</b><span>מהלכים {session.moves}</span><span>ציון בוגה {session.score}</span>{session.mode === 'exam' && <span>חידה {session.cursor + 1} / 10</span>}{session.mode === 'streak' && <span>רצף {session.completed}</span>}{session.deadline && <time aria-label="זמן שנותר">{Math.floor(Math.max(0, session.deadline - now) / 60000)}:{String(Math.floor(Math.max(0, session.deadline - now) / 1000) % 60).padStart(2, '0')}</time>}</div>
      {session.mode === 'daily' && <p className="brain-note">אותה חידה לכולם; מתחלפת בחצות לפי שעון ישראל. 🔥 רצף יומי: {streak(starsObject(progress.dailyWins), session.day)}</p>}
      {session.mode === 'practice' && <button type="button" className="brain-map-toggle" onClick={() => setMap(!map)} aria-expanded={map}>🗺️ {map ? 'סגירת מפת השלבים' : 'בחירת שלב ועולם'}</button>}
      {map && <section className="brain-map" aria-label="מפת שלבים">{kind === 'iq' && <div className="brain-worlds">{WORLDS.map(([id, name, emoji], i) => <button type="button" key={id} onClick={() => start('practice', i * 50)}>{emoji} {name}</button>)}</div>}<div className="brain-levels">{catalog(kind).filter((_, i) => kind !== 'iq' || Math.floor(i / 50) === Math.floor(session.index / 50)).map(item => <button type="button" key={item.id} aria-label={`שלב ${item.level}${item.boss ? ', בוס' : ''}`} aria-current={item.id === p.id ? 'step' : undefined} onClick={() => start('practice', item.level - 1)}>{kind === 'iq' ? (item.level - 1) % 50 + 1 : item.level}<small>{item.boss ? '👑' : ''}{'★'.repeat(Math.min(3, Math.max(0, Number(stars[item.id]) || 0)))}</small></button>)}</div></section>}
      <section className="brain-how" aria-label="איך משחקים">
        <div className="brain-how-title"><span aria-hidden="true">👆</span><div><b>מה עושים?</b><small>שלושה צעדים וזהו</small></div></div>
        <ol>{GUIDE[kind].map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}</ol>
      </section>
      <main className="brain-board" aria-label="לוח החידה">
        {p.oneMove && <div className="brain-one">☝️ אתגר במהלך אחד בלבד</div>}
        <PuzzleBoard key={`${p.id}-${session.actions.length === 0 ? 'start' : 'playing'}`} {...{ p, state, act }} disabled={blocked} />
      </main>
      <div className="brain-tools"><button type="button" onClick={hint} disabled={solved || ended}>💡 רמז</button><button type="button" onClick={undo} disabled={!session.actions.length || solved || ended}>↶ ביטול</button><button type="button" onClick={reset} disabled={solved || ended}>↻ התחלה מחדש</button></div>
      <p role="status" className="brain-message">{message}</p>
      {solved && !ended && <section className="brain-success" aria-label="השלב נפתר"><h3>כל הכבוד! החידה נפתרה</h3><p aria-label={`${starsForSession(session, p)} כוכבים`}>{'⭐'.repeat(starsForSession(session, p))}</p><p>{session.hints ? 'הפתרון נמצא בעזרת רמז. נסו בהמשך גם בעצמכם.' : 'תכנון, בדיקה — והצלחה!'}</p><button type="button" className="brain-primary" onClick={() => { update(nextSession(session)); setMessage('') }}>{session.mode === 'daily' || (session.mode === 'exam' && session.cursor === 9) ? 'סיום האתגר' : 'לשלב הבא'}</button></section>}
      {ended && <section className="brain-success" aria-label="סיום משחק"><h3>{timedOut ? 'הזמן הסתיים!' : session.mode === 'streak' ? 'הרצף הסתיים' : 'סיימתם את האתגר!'}</h3><p>{session.completed} חידות נפתרו · ציון בוגה: {session.score}</p><p>דרגה: {session.completed >= 10 ? 'אלופי החשיבה' : session.completed >= 3 ? 'חוקרי חידות' : 'מגלי דרכים'}</p><button type="button" onClick={() => start('practice')}>חזרה לתרגול</button></section>}
      <footer className="brain-footer">ההתקדמות נשמרת במכשיר הזה. {kind === 'iq' && 'ציון בוגה הוא ניקוד משחקי, ואינו ציון IQ או אבחון.'}</footer>
    </div>
  </div>
}

export const Matchsticks = props => <BrainGame kind="matches" {...props} />
export const WaterJugs = props => <BrainGame kind="water" {...props} />
export const RiverCrossing = props => <BrainGame kind="river" {...props} />
export const CutTheWire = props => <BrainGame kind="wires" {...props} />
export const LightsOut = props => <BrainGame kind="lights" {...props} />
export const OneMove = props => <BrainGame kind="one" {...props} />
export const BugaIQ = props => <BrainGame kind="iq" {...props} />

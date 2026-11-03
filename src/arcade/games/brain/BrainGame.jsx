import { useEffect, useState } from 'react'
import { useProgress } from '../../hooks.js'
import { catalog, puzzle, WORLDS, COUNTS, won, solve, dailyIQ } from '../../logic/brain/catalog.js'
import { streak } from '../../daily.js'
import { AGES, newSession, restoreSession, replay, attempt, nextSession, starsForSession } from '../../logic/brain/session.js'
import PuzzleBoard from './PuzzleBoard.jsx'
import { hintText } from './hintText.js'
import { WORLDS_EN, TITLES_EN, MODES_EN } from '../../logic/brain/en.js'
import './brain.css'

const TITLES = { matches: 'חידות גפרורים', water: 'כדי המים', river: 'חציית הנהר', wires: 'איזה חוט לחתוך?', lights: 'כיבוי אורות', one: 'רק מהלך אחד', iq: 'בוגה IQ' }
const MODES = [['practice', 'עולמות'], ['daily', 'IQ יומי'], ['exam', 'מבחן בוגה'], ['timed', 'נגד השעון'], ['streak', 'רצף']]
const ageLabel = (age, en) => age === 'adult' ? (en ? 'Adults' : 'מבוגרים') : age
const starsObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

export default function BrainGame({ kind, onReport, lang = 'he' }) {
  const en = lang === 'en'
  const titles = en ? TITLES_EN : TITLES, modes = en ? MODES_EN : MODES
  const worldName = w => en ? WORLDS_EN[w[0]] : w[1]
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
        setSession(next); save({ session: next }); setMessage(en ? 'A new day: the daily puzzle has changed.' : 'יום חדש — החידה היומית התחלפה.')
      }
    }, 500)
    return () => clearInterval(timer)
  }, [session.deadline, session.mode, session.day, session.age, kind, save, en])

  const act = action => {
    const next = attempt(session, action)
    const finished = won(p, replay(next))
    setMessage(next.mistakes > session.mistakes ? (p.oneMove && next.actions.length ? (en ? 'That move did not solve the puzzle. Try again from the start of the level.' : 'המהלך לא פתר את החידה. נסו שוב מתחילת השלב.') : (en ? 'That move does not fit the conditions. Check the rules and try again.' : 'המהלך לא מתאים לתנאים. בדקו את הכללים ונסו שוב.')) : '')
    setSession(next)
    const patch = { session: next }
    if (finished && !solved) {
      patch.stars = { ...stars, [p.id]: Math.max(Number(stars[p.id]) || 0, starsForSession(next, p)) }
      if (session.mode === 'daily') patch.dailyWins = { ...starsObject(progress.dailyWins), [session.day]: true }
      onReport?.({ text: en ? `${titles[kind]}: I solved level ${session.index + 1}, Buga score ${next.score}` : `${TITLES[kind]}: פתרתי את שלב ${session.index + 1}, ציון בוגה ${next.score}` })
    }
    save(patch)
  }
  const start = (mode = 'practice', index = session.index, age = session.age) => {
    // Called only by user event handlers; a new run deliberately gets a fresh clock/seed.
    // eslint-disable-next-line react/purity
    const current = Date.now()
    update(newSession(kind, { mode, index, age, seed: Math.floor(current / 1000), now: current })); setMessage(''); setMap(false); setNow(current)
  }
  const hint = () => { const path = solve(p, state); setMessage(hintText(p, path?.[0], lang)); update({ ...session, hints: session.hints + 1 }) }
  const reset = () => { update({ ...session, actions: [], moves: session.moves + 1, mistakes: session.mistakes + 1, ended: session.mode === 'streak' }); setMessage('') }
  const undo = () => { update({ ...session, actions: session.actions.slice(0, -1), moves: session.moves + 1 }); setMessage('') }
  const totalStars = Object.values(stars).reduce((sum, v) => sum + (Number.isInteger(v) && v >= 1 && v <= 3 ? v : 0), 0)
  const changeAge = age => {
    const bandStart = { '6-8': 0, '9-11': 10, '12+': 20, adult: 25 }[age]
    start(session.mode, Math.floor(session.index / 50) * 50 + bandStart, age)
  }
  return <div className="brain-game" dir={en ? 'ltr' : 'rtl'} data-kind={kind} data-puzzle={p.id}>
    <div className="brain-shell">
      <header className="brain-heading"><div><span className="brain-kicker">{en ? 'The Ugabuga thinking lab' : 'מעבדת החשיבה של עוגה בוגה'}</span><h2>{world ? `${world[2]} ${worldName(world)}` : titles[kind]}</h2></div><span className="brain-badge">⭐ {totalStars}</span></header>
      {kind === 'iq' && <><nav className="brain-modes" aria-label={en ? 'Game modes' : 'מצבי משחק'}>{modes.map(([mode, label]) => <button type="button" key={mode} aria-pressed={session.mode === mode} onClick={() => start(mode)}>{label}</button>)}</nav><div className="brain-age"><label htmlFor="brain-age">{en ? 'Age level' : 'רמת גיל'}</label><select id="brain-age" value={session.age} onChange={e => changeAge(e.target.value)}>{AGES.map(age => <option key={age} value={age}>{ageLabel(age, en)}</option>)}</select><span>{session.mode === 'daily' ? (en ? 'The daily puzzle is the same for everyone' : 'החידה היומית זהה לכולם') : (en ? 'Sets the starting level and the test difficulty' : 'קובע את שלב ההתחלה ואת רמת המבחן')}</span></div></>}
      <div className="brain-hud"><b>{p.boss ? (en ? '👑 Boss challenge · ' : '👑 אתגר בוס · ') : ''}{en ? 'Level' : 'שלב'} {level} / {kind === 'iq' ? 50 : COUNTS[kind]}</b><span>{en ? 'Moves' : 'מהלכים'} {session.moves}</span><span>{en ? 'Buga score' : 'ציון בוגה'} {session.score}</span>{session.mode === 'exam' && <span>{en ? 'Puzzle' : 'חידה'} {session.cursor + 1} / 10</span>}{session.mode === 'streak' && <span>{en ? 'Streak' : 'רצף'} {session.completed}</span>}{session.deadline && <time aria-label={en ? 'Time left' : 'זמן שנותר'}>{Math.floor(Math.max(0, session.deadline - now) / 60000)}:{String(Math.floor(Math.max(0, session.deadline - now) / 1000) % 60).padStart(2, '0')}</time>}</div>
      {session.mode === 'daily' && <p className="brain-note">{en ? 'The same puzzle for everyone; it changes at midnight, Israel time. 🔥 Daily streak:' : 'אותה חידה לכולם; מתחלפת בחצות לפי שעון ישראל. 🔥 רצף יומי:'} {streak(starsObject(progress.dailyWins), session.day)}</p>}
      {session.mode === 'practice' && <button type="button" className="brain-map-toggle" onClick={() => setMap(!map)} aria-expanded={map}>🗺️ {map ? (en ? 'Close the level map' : 'סגירת מפת השלבים') : (en ? 'Choose a level and world' : 'בחירת שלב ועולם')}</button>}
      {map && <section className="brain-map" aria-label={en ? 'Level map' : 'מפת שלבים'}>{kind === 'iq' && <div className="brain-worlds">{WORLDS.map((w, i) => <button type="button" key={w[0]} onClick={() => start('practice', i * 50)}>{w[2]} {worldName(w)}</button>)}</div>}<div className="brain-levels">{catalog(kind).filter((_, i) => kind !== 'iq' || Math.floor(i / 50) === Math.floor(session.index / 50)).map(item => <button type="button" key={item.id} aria-label={en ? `Level ${item.level}${item.boss ? ', boss' : ''}` : `שלב ${item.level}${item.boss ? ', בוס' : ''}`} aria-current={item.id === p.id ? 'step' : undefined} onClick={() => start('practice', item.level - 1)}>{kind === 'iq' ? (item.level - 1) % 50 + 1 : item.level}<small>{item.boss ? '👑' : ''}{'★'.repeat(Math.min(3, Math.max(0, Number(stars[item.id]) || 0)))}</small></button>)}</div></section>}
      <main className="brain-board" aria-label={en ? 'Puzzle board' : 'לוח החידה'}>
        {p.oneMove && <div className="brain-one">{en ? '☝️ A one-move challenge' : '☝️ אתגר במהלך אחד בלבד'}</div>}
        <PuzzleBoard key={`${p.id}-${session.actions.length === 0 ? 'start' : 'playing'}`} {...{ p, state, act, lang }} disabled={blocked} />
      </main>
      <div className="brain-tools"><button type="button" onClick={hint} disabled={solved || ended}>{en ? '💡 Hint' : '💡 רמז'}</button><button type="button" onClick={undo} disabled={!session.actions.length || solved || ended}>{en ? '↶ Undo' : '↶ ביטול'}</button><button type="button" onClick={reset} disabled={solved || ended}>{en ? '↻ Start over' : '↻ התחלה מחדש'}</button></div>
      <p role="status" className="brain-message">{message}</p>
      {solved && !ended && <section className="brain-success" aria-label={en ? 'Level solved' : 'השלב נפתר'}><h3>{en ? 'Well done! The puzzle is solved' : 'כל הכבוד! החידה נפתרה'}</h3><p aria-label={en ? `${starsForSession(session, p)} stars` : `${starsForSession(session, p)} כוכבים`}>{'⭐'.repeat(starsForSession(session, p))}</p><p>{session.hints ? (en ? 'The solution was found with a hint. Try again later on your own.' : 'הפתרון נמצא בעזרת רמז. נסו בהמשך גם בעצמכם.') : (en ? 'Planning, checking, and success!' : 'תכנון, בדיקה — והצלחה!')}</p><button type="button" className="brain-primary" onClick={() => { update(nextSession(session)); setMessage('') }}>{session.mode === 'daily' || (session.mode === 'exam' && session.cursor === 9) ? (en ? 'Finish the challenge' : 'סיום האתגר') : (en ? 'Next level' : 'לשלב הבא')}</button></section>}
      {ended && <section className="brain-success" aria-label={en ? 'Game over' : 'סיום משחק'}><h3>{timedOut ? (en ? 'Time is up!' : 'הזמן הסתיים!') : session.mode === 'streak' ? (en ? 'The streak is over' : 'הרצף הסתיים') : (en ? 'You finished the challenge!' : 'סיימתם את האתגר!')}</h3><p>{en ? `${session.completed} puzzles solved · Buga score: ${session.score}` : `${session.completed} חידות נפתרו · ציון בוגה: ${session.score}`}</p><p>{en ? 'Rank: ' : 'דרגה: '}{session.completed >= 10 ? (en ? 'Thinking champions' : 'אלופי החשיבה') : session.completed >= 3 ? (en ? 'Puzzle explorers' : 'חוקרי חידות') : (en ? 'Path finders' : 'מגלי דרכים')}</p><button type="button" onClick={() => start('practice')}>{en ? 'Back to practice' : 'חזרה לתרגול'}</button></section>}
      <footer className="brain-footer">{en ? 'Progress is saved on this device.' : 'ההתקדמות נשמרת במכשיר הזה.'} {kind === 'iq' && (en ? 'The Buga score is a game score, not an IQ score or a diagnosis.' : 'ציון בוגה הוא ניקוד משחקי, ואינו ציון IQ או אבחון.')}</footer>
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

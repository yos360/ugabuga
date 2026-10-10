import { useEffect, useState } from 'react'
import { pickWord, LETTERS, norm, isLetter, lettersIn, misses, isWon, isLost, MAX_MISSES } from '../logic/words'
import { WORD_LEN, MAX_TRIES, isBase, normWord, shown, scoreGuess, keyStates, shareGrid, dailyWord, randomWord } from '../logic/fiveWords'
import { israelDayNumber } from '../../utils/israelDate'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../ui'

// Two modes:
// • "5 אותיות" (default) — six tries to find a five-letter word, letters coloured after each guess.
//   "מילת היום" is the same word for everyone on the same Israeli date; "תרגול" gives endless words.
// • "בלונים" — the classic letter-by-letter game: every wrong letter pops one of 7 balloons.
// From "אתגר היום" (`daily`) the five-letter word of the challenge is played; the marathon passes
// `daily.classic` for the quicker balloons round.
export default function WordGuess({ onReport, onShare, daily }) {
  const [mode, setMode] = useState('five')
  if (daily) return daily.classic ? <Balloons daily={daily} /> : <Five daily={daily} />
  return (
    <div className="arc-game">
      <div className="arc-seg-row"><Segmented label="סוג המשחק" value={mode} onChange={setMode} options={[['five', '🟩 5 אותיות'], ['balloons', '🎈 בלונים']]} /></div>
      {mode === 'five' ? <Five key="five" onReport={onReport} onShare={onShare} embedded /> : <Balloons key="balloons" onReport={onReport} onShare={onShare} embedded />}
    </div>
  )
}

// ── 5 אותיות ─────────────────────────────
const FIVE_KEYS = ['קראטופ', 'שדגכעיחל', 'זסבהנמצת']
const DAILY_KEY = 'buga-word5-daily'
const readDaily = () => { try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || null } catch { return null } }
const saveDaily = v => { try { localStorage.setItem(DAILY_KEY, JSON.stringify(v)) } catch { /* private mode */ } }
const STATE_LABEL = { hit: 'במקום הנכון', near: 'במילה אבל במקום אחר', miss: 'לא במילה' }

function Five({ onReport, onShare, daily, embedded }) {
  const [progress, saveProgress] = useProgress('word-guess-5', { wins: 0, played: 0, streak: 0, best: 0 })
  const today = israelDayNumber(Date.now())
  const [kind, setKind] = useState(daily ? 'challenge' : 'today') // today | practice | challenge
  const start = k => {
    if (k === 'challenge') return { answer: dailyWord(Math.floor(daily.seed / 7919)), rows: [], cur: '' }
    if (k === 'today') {
      const saved = readDaily()
      return { answer: dailyWord(today), rows: saved?.day === today && Array.isArray(saved.rows) ? saved.rows : [], cur: '' }
    }
    return { answer: randomWord(Math.random), rows: [], cur: '' }
  }
  const [game, setGame] = useState(() => start(kind))
  const [msg, setMsg] = useState('')
  const [shake, setShake] = useState(false)
  const { answer, rows, cur } = game
  const won = rows.some(r => normWord(r) === normWord(answer))
  const lost = !won && rows.length >= MAX_TRIES
  const over = won || lost
  const keys = keyStates(rows, answer)

  const switchKind = k => { setKind(k); setGame(start(k)); setMsg('') }
  const type = ch => { if (over || [...cur].length >= WORD_LEN) return; setGame(g => ({ ...g, cur: g.cur + norm(ch) })); setMsg('') }
  const back = () => { if (over) return; setGame(g => ({ ...g, cur: [...g.cur].slice(0, -1).join('') })) }
  const submit = () => {
    if (over) return
    if ([...cur].length < WORD_LEN) { setMsg('צריך 5 אותיות'); setShake(true); setTimeout(() => setShake(false), 400); navigator.vibrate?.(30); return }
    const next = [...rows, cur]
    setGame(g => ({ ...g, rows: next, cur: '' }))
    if (kind === 'today') saveDaily({ day: today, rows: next })
    sfx(normWord(cur) === normWord(answer) ? 'win' : 'eat')
  }

  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') { e.preventDefault(); submit() }
      else if (e.key === 'Backspace') { e.preventDefault(); back() }
      else if (e.key.length === 1 && isBase(e.key)) { e.preventDefault(); type(e.key) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!over) return
    const tries = rows.length
    if (daily) { daily.finish({ text: won ? `🟩 5 אותיות: מצאתי את המילה ב־${tries} ניסיונות\n${shareGrid(rows, answer)}` : `🟩 5 אותיות: המילה הייתה "${answer}"`, score: won ? tries : MAX_TRIES + 1, won }); return }
    saveProgress(p => {
      const streak = won ? p.streak + 1 : 0
      return { played: p.played + 1, wins: p.wins + (won ? 1 : 0), streak, best: Math.max(p.best, streak) }
    })
    if (won) onReport?.({ text: `🟩 מצאתי את המילה ב־${tries} ניסיונות במשחק 5 אותיות!` })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over])

  const share = () => onShare?.(`🟩 ${kind === 'today' ? 'מילת היום' : 'משחק'} 5 אותיות — ${won ? `מצאתי ב־${rows.length}/${MAX_TRIES}` : 'הפעם לא הצלחתי'}\n${shareGrid(rows, answer)}`)
  const board = Array.from({ length: MAX_TRIES }, (_, i) => i < rows.length ? { word: rows[i], res: scoreGuess(rows[i], answer) } : i === rows.length && !over ? { word: cur, res: null, current: true } : { word: '', res: null })

  const body = (
    <>
      <Hud stats={[['ניצחונות', progress.wins], ['רצף', progress.streak], ['שיא', progress.best]]}>
        {!daily && kind === 'practice' && <ToolButton onClick={() => switchKind('practice')} label="מילה אחרת">🔄</ToolButton>}
      </Hud>
      {!daily && <div className="arc-seg-row"><Segmented label="איזו מילה" value={kind} onChange={switchKind} options={[['today', '📅 מילת היום'], ['practice', '🔁 תרגול']]} /></div>}
      <div className={`arc-field wg5-field${embedded ? ' is-embedded' : ''}`}>
        <div className="wg5-board" dir="rtl" role="grid" aria-label={`לוח הניחושים — ${rows.length} מתוך ${MAX_TRIES}`}>
          {board.map((r, i) => (
            <div key={i} role="row" className={`wg5-row${r.current && shake ? ' is-shake' : ''}`}>
              {Array.from({ length: WORD_LEN }, (_, j) => {
                const ch = [...r.word][j] || '', st = r.res?.[j]
                return <span key={j} role="gridcell" className={`wg5-cell${st ? ' is-' + st : ''}${ch && !st ? ' is-typed' : ''}`} aria-label={ch ? `${shown(ch, j)}${st ? ' — ' + STATE_LABEL[st] : ''}` : 'ריק'} style={st ? { animationDelay: `${j * 0.12}s` } : undefined}>{ch ? shown(ch, j) : ''}</span>
              })}
            </div>
          ))}
        </div>
        <p className="wg5-msg" aria-live="polite">{msg || (over ? (won ? `🎉 מצאתם את המילה "${answer}"!` : `המילה הייתה: "${answer}"`) : 'מנחשים מילה בת 5 אותיות')}</p>
        <div className="wg-keys wg5-keys" dir="rtl">
          {FIVE_KEYS.map(row => (
            <div key={row} className="wg-row">
              {[...row].map(k => <button key={k} type="button" className={`wg-key${keys[k] ? ' is-' + keys[k] : ''}`} disabled={over} onClick={() => type(k)} aria-label={`${k}${keys[k] ? ' — ' + STATE_LABEL[keys[k]] : ''}`}>{k}</button>)}
            </div>
          ))}
          <div className="wg-row">
            <button type="button" className="wg-key wg5-wide is-go" onClick={submit} disabled={over}>✓ בדיקה</button>
            <button type="button" className="wg-key wg5-wide" onClick={back} disabled={over} aria-label="מחיקת אות">⌫ מחיקה</button>
          </div>
        </div>
      </div>
      {over && !daily && <EndCard title={won ? '🎉 מצאתם!' : '🙈 הפעם לא הצליח'} text={`המילה: "${answer}"${won ? ` · ${rows.length} ניסיונות` : ''}${kind === 'today' ? ' · מילה חדשה מחר בחצות' : ''}`}
        primary={kind === 'today' ? '🔁 לתרגול עם מילים נוספות' : '▶ מילה הבאה'} onPrimary={() => switchKind('practice')}
        secondary="📱 שתפו" onSecondary={share} />}
    </>
  )
  return embedded ? body : <div className="arc-game">{body}</div>
}

// ── בלונים (the classic mode) ─────────────────────────────
const BALLOON_COLORS = ['#ff5c8a', '#ffb547', '#ffe14d', '#4cd681', '#45c4ff', '#7b6cff', '#ff8ad8']
const KEY_ROWS = ['קראטוןםפ', 'שדגכעיחלךף', 'זסבהנמצתץ']

function Balloons({ onReport, onShare, daily, embedded }) {
  const [progress, saveProgress] = useProgress('word-guess', { wins: 0, streak: 0, best: 0 })
  const [round, setRound] = useState(() => ({ ...pickWord(daily ? rng(daily.seed) : Math.random), guessed: new Set(), hints: 0 }))
  const [streak, setStreak] = useState(0)
  const { word, category, guessed } = round
  const won = isWon(word, guessed)
  const lost = !won && isLost(word, guessed)
  const wrong = misses(word, guessed)

  const guess = raw => {
    const l = norm(raw)
    if (won || lost || guessed.has(l) || !LETTERS.includes(l)) return
    const g = new Set(guessed); g.add(l)
    setRound(r => ({ ...r, guessed: g }))
    if (lettersIn(word).has(l)) sfx('eat'); else { sfx('crash'); navigator.vibrate?.(40) }
  }
  const hint = () => {
    if (won || lost) return
    const missing = [...lettersIn(word)].filter(l => !guessed.has(l))
    if (!missing.length) return
    const g = new Set(guessed); g.add(missing[Math.floor(Math.random() * missing.length)])
    setRound(r => ({ ...r, guessed: g, hints: r.hints + 1 }))
    sfx('power')
  }
  const next = () => setRound({ ...pickWord(Math.random, [word]), guessed: new Set(), hints: 0 })

  useEffect(() => {
    const onKey = e => { if (e.key.length === 1 && isLetter(e.key)) { e.preventDefault(); guess(e.key) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!won && !lost) return
    if (won) sfx('win')
    if (daily) { daily.finish({ text: won ? `🎈 נחשו את המילה: ניחשתי "${word}" עם ${wrong} טעויות` : `🎈 נחשו את המילה: המילה הייתה "${word}"`, score: wrong, won }); return }
    if (won) {
      const s = streak + 1
      setStreak(s)
      saveProgress(p => ({ wins: p.wins + 1, best: Math.max(p.best, s) }))
      onReport?.({ text: `🎈 ניחשתי ${s} מילים ברצף בנחשו את המילה!` })
    } else setStreak(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won, lost])

  const body = (
    <>
      <Hud stats={[['רצף', streak], ['ניצחונות', progress.wins], ['שיא רצף', Math.max(progress.best, streak)]]}>
        <ToolButton onClick={hint} disabled={won || lost} label="רמז — חושף אות">💡</ToolButton>
        {!daily && <ToolButton onClick={next} label="מילה אחרת">🔄</ToolButton>}
      </Hud>
      <div className="arc-field wg-field">
        <div className="wg-balloons" aria-label={`נשארו ${MAX_MISSES - wrong} בלונים`}>
          {BALLOON_COLORS.map((c, i) => (
            <span key={i} className={`wg-balloon${i < wrong ? ' is-pop' : ''}`} style={{ '--c': c, '--i': i }}>
              <i />{i < wrong && <b>💥</b>}
            </span>
          ))}
        </div>
        <p className="wg-cat">הנושא: <b>{category}</b> · {[...word].filter(isLetter).length} אותיות</p>
        <div className="wg-word" dir="rtl" aria-live="polite">
          {[...word].map((ch, i) => isLetter(ch)
            ? <span key={i} className={`wg-slot${guessed.has(norm(ch)) ? ' is-on' : ''}${lost && !guessed.has(norm(ch)) ? ' is-missed' : ''}`}>{guessed.has(norm(ch)) || lost ? ch : ''}</span>
            : <span key={i} className="wg-mark">{ch}</span>)}
        </div>
        <div className="wg-keys" dir="rtl">
          {KEY_ROWS.map(row => (
            <div key={row} className="wg-row">
              {[...row].map(k => {
                const used = guessed.has(norm(k)), good = used && lettersIn(word).has(norm(k))
                return <button key={k} type="button" className={`wg-key${used ? (good ? ' is-good' : ' is-bad') : ''}`} disabled={used || won || lost} onClick={() => guess(k)}>{k}</button>
              })}
            </div>
          ))}
        </div>
      </div>
      {won && !daily && <EndCard title="🎉 ניחשתם!" text={`המילה: "${word}" · ${wrong ? `${wrong} טעויות` : 'בלי אף טעות!'}${round.hints ? ` · ${round.hints} רמזים` : ''}`}
        primary="▶ מילה הבאה" onPrimary={next}
        secondary="📱 שתפו" onSecondary={() => onShare?.(`🎈 ניחשתי ${streak} מילים ברצף בנחשו את המילה! תצליחו יותר?`)} />}
      {lost && !daily && <EndCard title="🎈 כל הבלונים התפוצצו" text={`המילה הייתה: "${word}". הבאה בטוח תצליח!`}
        primary="▶ מילה חדשה" onPrimary={next} />}
    </>
  )
  return embedded ? body : <div className="arc-game">{body}</div>
}

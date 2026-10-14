import { useEffect, useState } from 'react'
import { pickWord, LETTERS, norm, isLetter, lettersIn, misses, isWon, isLost, MAX_MISSES } from '../logic/words'
import { WORD_LEN, MAX_TRIES, isBase, normWord, shown, scoreGuess, keyStates, shareGrid, dailyWord, randomWord, FIVE_WORDS, TOPICS, wordsIn, topicOf, loadDictionary, isKnownWord } from '../logic/fiveWords'
import { israelDayNumber } from '../../utils/israelDate'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../ui'

// Two modes:
// • "5 אותיות" (default, "מילה בחמש") — six tries to find a five-letter word, letters coloured after
//   each guess: word of the day, endless practice by topic, or a marathon of words in a row.
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
// Kinds: "today" (same word for everyone), "practice" (endless, no repeats until the topic runs out,
// optional topic), "marathon" (words in a row until one is missed), "challenge" (from אתגר היום).
// Guesses are checked against a ~40,000-word list unless the player turns the check off.
const FIVE_KEYS = ['קראטופ', 'שדגכעיחל', 'זסבהנמצת']
const DAILY_KEY = 'buga-word5-daily', SEEN_KEY = 'buga-word5-seen', PREFS_KEY = 'buga-word5-prefs'
const readJson = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback } }
const saveJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }
const STATE_LABEL = { hit: 'במקום הנכון', near: 'במילה אבל במקום אחר', miss: 'לא במילה' }
const MAX_HINTS = 2

function Five({ onReport, onShare, daily, embedded }) {
  const [progress, saveProgress] = useProgress('word-guess-5', { wins: 0, played: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0], marathon: 0 })
  const today = israelDayNumber(Date.now())
  const [kind, setKind] = useState(daily ? 'challenge' : 'today') // today | practice | marathon | challenge
  const [prefs, setPrefs] = useState(() => ({ topic: '', strict: true, ...readJson(PREFS_KEY, {}) }))
  const [run, setRun] = useState(0) // marathon: words found in a row
  const nextWord = topic => {
    const pool = wordsIn(topic)
    const seen = new Set(readJson(SEEN_KEY, []))
    const word = randomWord(Math.random, seen, pool)
    const left = pool.filter(w => !seen.has(w) && w !== word)
    saveJson(SEEN_KEY, left.length ? [...seen, word].slice(-FIVE_WORDS.length) : [word])
    return word
  }
  const start = (k, topic = prefs.topic) => {
    const fresh = { rows: [], cur: '', hints: 0 }
    if (k === 'challenge') return { ...fresh, answer: dailyWord(Math.floor(daily.seed / 7919)) }
    if (k === 'today') {
      const answer = dailyWord(today), saved = readJson(DAILY_KEY, null)
      const same = saved?.day === today && saved.answer === answer && Array.isArray(saved.rows)
      return { ...fresh, answer, rows: same ? saved.rows : [], hints: same ? saved.hints || 0 : 0 }
    }
    return { ...fresh, answer: nextWord(k === 'marathon' ? '' : topic) }
  }
  const [game, setGame] = useState(() => start(kind))
  const [msg, setMsg] = useState('')
  const [shake, setShake] = useState(false)
  const { answer, rows, cur, hints } = game
  const won = rows.some(r => normWord(r) === normWord(answer))
  const lost = !won && rows.length >= MAX_TRIES
  const over = won || lost
  const keys = keyStates(rows, answer)

  useEffect(() => { loadDictionary() }, [])

  const setPref = (k, v) => setPrefs(p => { const n = { ...p, [k]: v }; saveJson(PREFS_KEY, n); return n })
  const switchKind = k => { setKind(k); setGame(start(k)); setMsg(''); setRun(0) }
  const pickTopic = t => { setPref('topic', t); setGame(start('practice', t)); setMsg('') }
  const bump = text => { setMsg(text); setShake(true); setTimeout(() => setShake(false), 400); navigator.vibrate?.(30) }
  const type = ch => { if (over || [...cur].length >= WORD_LEN) return; setGame(g => ({ ...g, cur: g.cur + norm(ch) })); setMsg('') }
  const back = () => { if (over) return; setGame(g => ({ ...g, cur: [...g.cur].slice(0, -1).join('') })) }
  const submit = () => {
    if (over) return
    if ([...cur].length < WORD_LEN) return bump('צריך 5 אותיות')
    if (prefs.strict && !isKnownWord(cur)) return bump('המילה לא במילון שלנו — נסו מילה אחרת')
    const next = [...rows, cur]
    setGame(g => ({ ...g, rows: next, cur: '' }))
    if (kind === 'today') saveJson(DAILY_KEY, { day: today, answer, rows: next, hints })
    sfx(normWord(cur) === normWord(answer) ? 'win' : 'eat')
  }
  // Hint 1: the topic. Hint 2: one letter in its place (the first spot not found yet).
  const revealAt = (() => {
    const a = [...normWord(answer)]
    return a.findIndex((l, i) => !rows.some(r => normWord(r)[i] === l))
  })()
  const hint = () => {
    if (over || hints >= MAX_HINTS) return
    setGame(g => ({ ...g, hints: g.hints + 1 }))
    if (kind === 'today') saveJson(DAILY_KEY, { day: today, answer, rows, hints: hints + 1 })
    sfx('power')
  }
  const hintText = [hints >= 1 && `הנושא: ${topicOf(answer)}`, hints >= 2 && revealAt >= 0 && `האות ה־${revealAt + 1} היא ${shown([...answer][revealAt], revealAt)}`].filter(Boolean).join(' · ')

  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('select, input')) return
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
    const r = won && kind === 'marathon' ? run + 1 : run
    if (kind === 'marathon' && won) setRun(r)
    saveProgress(p => {
      const streak = won ? p.streak + 1 : 0
      const dist = [...(p.dist || [0, 0, 0, 0, 0, 0])]
      if (won) dist[tries - 1]++
      return { ...p, played: p.played + 1, wins: p.wins + (won ? 1 : 0), streak, best: Math.max(p.best, streak), dist, marathon: Math.max(p.marathon || 0, r) }
    })
    if (won) onReport?.({ text: kind === 'marathon' ? `⚡ ${r} מילים ברצף במרתון מילה בחמש!` : `🟩 מצאתי את המילה ב־${tries} ניסיונות במילה בחמש!` })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over])

  const label = kind === 'today' ? 'מילת היום' : kind === 'marathon' ? 'מרתון' : 'תרגול'
  const share = () => onShare?.(`🟩 מילה בחמש — ${label}: ${won ? `מצאתי ב־${rows.length}/${MAX_TRIES}` : 'הפעם לא הצלחתי'}${hints ? ` (💡×${hints})` : ''}${kind === 'marathon' && run ? ` · ⚡ ${run} מילים ברצף` : ''}\n${shareGrid(rows, answer)}`)
  const board = Array.from({ length: MAX_TRIES }, (_, i) => i < rows.length ? { word: rows[i], res: scoreGuess(rows[i], answer) } : i === rows.length && !over ? { word: cur, res: null, current: true } : { word: '', res: null })
  const dist = progress.dist || [0, 0, 0, 0, 0, 0], top = Math.max(1, ...dist)
  const stats = kind === 'marathon' ? [['רצף עכשיו', run], ['שיא מרתון', Math.max(progress.marathon || 0, run)]] : [['ניצחונות', progress.wins], ['רצף', progress.streak], ['שיא', progress.best]]

  const endText = `המילה: "${answer}" · ${topicOf(answer)}${won ? ` · ${rows.length} ניסיונות` : ''}${kind === 'today' ? ' · מילה חדשה מחר בחצות' : ''}`
  const end = kind === 'marathon'
    ? (won
        ? <EndCard title={`⚡ נכון! ${run} ברצף`} text={endText} primary="▶ המילה הבאה" onPrimary={() => setGame(start('marathon'))} secondary="📱 שתפו" onSecondary={share} />
        : <EndCard title="🏁 המרתון נגמר" text={`${endText} · ${run} מילים ברצף${run && run >= (progress.marathon || 0) ? ' — שיא חדש! 🏆' : ''}`} primary="▶ מרתון חדש" onPrimary={() => { setRun(0); setGame(start('marathon')) }} secondary="📱 שתפו" onSecondary={share} />)
    : <EndCard title={won ? '🎉 מצאתם!' : '🙈 הפעם לא הצליח'} text={endText}
        primary={kind === 'today' ? '🔁 לתרגול בלי סוף' : '▶ מילה הבאה'} onPrimary={() => switchKind('practice')}
        secondary="📱 שתפו" onSecondary={share} />

  const body = (
    <>
      <Hud stats={stats}>
        <ToolButton onClick={hint} disabled={over || hints >= MAX_HINTS} label={hints ? 'רמז נוסף — אות במקומה' : 'רמז — מה הנושא'}>💡</ToolButton>
        {!daily && kind === 'practice' && <ToolButton onClick={() => switchKind('practice')} label="מילה אחרת">🔄</ToolButton>}
      </Hud>
      {!daily && <div className="arc-seg-row"><Segmented label="איזו מילה" value={kind} onChange={switchKind} options={[['today', '📅 מילת היום'], ['practice', '🔁 בלי סוף'], ['marathon', '⚡ מרתון']]} /></div>}
      {!daily && (
        <div className="wg5-opts">
          {kind === 'practice' && (
            <label>נושא{' '}
              <select value={prefs.topic} onChange={e => pickTopic(e.target.value)}>
                <option value="">כל הנושאים ({FIVE_WORDS.length} מילים)</option>
                {TOPICS.map(t => <option key={t} value={t}>{t} ({wordsIn(t).length})</option>)}
              </select>
            </label>
          )}
          <label><input type="checkbox" checked={prefs.strict} onChange={e => setPref('strict', e.target.checked)} /> רק מילים מהמילון</label>
        </div>
      )}
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
        {hintText && !over && <p className="wg5-hint">💡 {hintText}</p>}
        <p className="wg5-msg" aria-live="polite">{msg || (over ? (won ? `🎉 מצאתם את המילה "${answer}"!` : `המילה הייתה: "${answer}"`) : 'מנחשים מילה בת 5 אותיות')}</p>
        {over && !daily && kind !== 'marathon' && progress.wins > 0 && (
          <div className="wg5-dist" aria-label="בכמה ניסיונות מצאתם">
            {dist.map((n, i) => <div key={i}><span>{i + 1}</span><i style={{ width: `${Math.max(8, (n / top) * 100)}%` }} className={won && rows.length === i + 1 ? 'is-now' : ''}>{n}</i></div>)}
          </div>
        )}
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
      {over && !daily && end}
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

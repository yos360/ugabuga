import { useEffect, useState } from 'react'
import { sfx } from '../../../arcade/sfx'
import { useProgress } from '../../../arcade/hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../../../arcade/ui'
import { EN_TOPICS, EN_WORDS, enTopicOf, enWordsIn, scoreEn, enDailyWord } from './wordsEn.js'

// English five-letter word game: six tries, letters coloured after each guess.
// Word of the day (same for everyone on the same local date), endless practice by topic, or a marathon.
// Any five letters count as a guess, so young players are never blocked by a dictionary.
const LEN = 5, TRIES = 6, MAX_HINTS = 2
const KEYS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const DAILY_KEY = 'buga-word5-en-daily', SEEN_KEY = 'buga-word5-en-seen'
const LABEL = { hit: 'in the right spot', near: 'in the word, wrong spot', miss: 'not in the word' }
const RANK = { miss: 1, near: 2, hit: 3 }
const readJson = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb } catch { return fb } }
const saveJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }
const dayNumber = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000) }
const grid = (rows, answer) => rows.map(r => scoreEn(r, answer).map(s => (s === 'hit' ? '🟩' : s === 'near' ? '🟨' : '⬜')).join('')).join('\n')

export default function WordGuessEn({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('word-guess-5-en', { wins: 0, played: 0, streak: 0, best: 0, marathon: 0 })
  const today = dayNumber()
  const [kind, setKind] = useState('today')
  const [topic, setTopic] = useState('')
  const [run, setRun] = useState(0)
  const nextWord = t => {
    const pool = enWordsIn(t), seen = new Set(readJson(SEEN_KEY, []))
    const fresh = pool.filter(w => !seen.has(w)), from = fresh.length ? fresh : pool
    const word = from[Math.floor(Math.random() * from.length)]
    saveJson(SEEN_KEY, fresh.length > 1 ? [...seen, word].slice(-EN_WORDS.length) : [word])
    return word
  }
  const start = (k, t = topic) => {
    const fresh = { rows: [], cur: '', hints: 0 }
    if (k === 'today') {
      const answer = enDailyWord(today), saved = readJson(DAILY_KEY, null)
      const same = saved?.day === today && saved.answer === answer && Array.isArray(saved.rows)
      return { ...fresh, answer, rows: same ? saved.rows : [], hints: same ? saved.hints || 0 : 0 }
    }
    return { ...fresh, answer: nextWord(k === 'marathon' ? '' : t) }
  }
  const [game, setGame] = useState(() => start('today'))
  const [msg, setMsg] = useState('')
  const [shake, setShake] = useState(false)
  const { answer, rows, cur, hints } = game
  const won = rows.includes(answer)
  const over = won || rows.length >= TRIES
  const keys = {}
  for (const r of rows) scoreEn(r, answer).forEach((st, i) => { const l = r[i]; if (!keys[l] || RANK[st] > RANK[keys[l]]) keys[l] = st })

  const switchKind = k => { setKind(k); setGame(start(k)); setMsg(''); setRun(0) }
  const pickTopic = t => { setTopic(t); setGame(start('practice', t)); setMsg('') }
  const bump = text => { setMsg(text); setShake(true); setTimeout(() => setShake(false), 400); navigator.vibrate?.(30) }
  const type = ch => { if (over || cur.length >= LEN) return; setGame(g => ({ ...g, cur: g.cur + ch })); setMsg('') }
  const back = () => { if (!over) setGame(g => ({ ...g, cur: g.cur.slice(0, -1) })) }
  const submit = () => {
    if (over) return
    if (cur.length < LEN) return bump('You need 5 letters')
    const next = [...rows, cur]
    setGame(g => ({ ...g, rows: next, cur: '' }))
    if (kind === 'today') saveJson(DAILY_KEY, { day: today, answer, rows: next, hints })
    sfx(cur === answer ? 'win' : 'eat')
  }
  const revealAt = [...answer].findIndex((l, i) => !rows.some(r => r[i] === l))
  const hint = () => {
    if (over || hints >= MAX_HINTS) return
    setGame(g => ({ ...g, hints: g.hints + 1 }))
    if (kind === 'today') saveJson(DAILY_KEY, { day: today, answer, rows, hints: hints + 1 })
    sfx('power')
  }
  const hintText = [hints >= 1 && `Topic: ${enTopicOf(answer)}`, hints >= 2 && revealAt >= 0 && `Letter ${revealAt + 1} is ${answer[revealAt].toUpperCase()}`].filter(Boolean).join(' · ')

  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('select, input')) return
      if (e.key === 'Enter') { e.preventDefault(); submit() }
      else if (e.key === 'Backspace') { e.preventDefault(); back() }
      else if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); type(e.key.toLowerCase()) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!over) return
    const r = won && kind === 'marathon' ? run + 1 : run
    if (kind === 'marathon' && won) setRun(r)
    saveProgress(p => {
      const streak = won ? p.streak + 1 : 0
      return { ...p, played: p.played + 1, wins: p.wins + (won ? 1 : 0), streak, best: Math.max(p.best, streak), marathon: Math.max(p.marathon || 0, r) }
    })
    if (won) onReport?.({ text: kind === 'marathon' ? `⚡ ${r} words in a row in the word marathon!` : `🟩 I found the word in ${rows.length} tries!` })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over])

  const label = kind === 'today' ? 'Word of the day' : kind === 'marathon' ? 'Marathon' : 'Practice'
  const share = () => onShare?.(`🟩 Five-letter word, ${label}: ${won ? `found it in ${rows.length}/${TRIES}` : 'not this time'}${hints ? ` (💡×${hints})` : ''}${kind === 'marathon' && run ? ` · ⚡ ${run} in a row` : ''}\n${grid(rows, answer)}`)
  const board = Array.from({ length: TRIES }, (_, i) => (i < rows.length ? { word: rows[i], res: scoreEn(rows[i], answer) } : i === rows.length && !over ? { word: cur, current: true } : { word: '' }))
  const stats = kind === 'marathon' ? [['In a row', run], ['Best run', Math.max(progress.marathon || 0, run)]] : [['Wins', progress.wins], ['Streak', progress.streak], ['Best', progress.best]]
  const endText = `The word: "${answer.toUpperCase()}" · ${enTopicOf(answer)}${won ? ` · ${rows.length} ${rows.length === 1 ? 'try' : 'tries'}` : ''}${kind === 'today' ? ' · a new word tomorrow' : ''}`
  const end = kind === 'marathon'
    ? (won
        ? <EndCard lang="en" title={`⚡ Correct! ${run} in a row`} text={endText} primary="▶ Next word" onPrimary={() => setGame(start('marathon'))} secondary="📱 Share" onSecondary={share} />
        : <EndCard lang="en" title="🏁 The marathon is over" text={`${endText} · ${run} in a row`} primary="▶ New marathon" onPrimary={() => { setRun(0); setGame(start('marathon')) }} secondary="📱 Share" onSecondary={share} />)
    : <EndCard lang="en" title={won ? '🎉 You got it!' : '🙈 Not this time'} text={endText}
        primary={kind === 'today' ? '🔁 Endless practice' : '▶ Next word'} onPrimary={() => switchKind('practice')}
        secondary="📱 Share" onSecondary={share} />

  return (
    <div className="arc-game">
      <Hud stats={stats}>
        <ToolButton onClick={hint} disabled={over || hints >= MAX_HINTS} label={hints ? 'Another hint: a letter in its place' : 'Hint: the topic'}>💡</ToolButton>
        {kind === 'practice' && <ToolButton onClick={() => switchKind('practice')} label="Another word">🔄</ToolButton>}
      </Hud>
      <div className="arc-seg-row"><Segmented label="Which word" value={kind} onChange={switchKind} options={[['today', '📅 Word of the day'], ['practice', '🔁 Endless'], ['marathon', '⚡ Marathon']]} /></div>
      {kind === 'practice' && (
        <div className="wg5-opts">
          <label>Topic{' '}
            <select value={topic} onChange={e => pickTopic(e.target.value)}>
              <option value="">All topics ({EN_WORDS.length} words)</option>
              {EN_TOPICS.map(t => <option key={t} value={t}>{t} ({enWordsIn(t).length})</option>)}
            </select>
          </label>
        </div>
      )}
      <div className="arc-field wg5-field">
        <div className="wg5-board" dir="ltr" role="grid" aria-label={`Guesses: ${rows.length} of ${TRIES}`}>
          {board.map((r, i) => (
            <div key={i} role="row" className={`wg5-row${r.current && shake ? ' is-shake' : ''}`}>
              {Array.from({ length: LEN }, (_, j) => {
                const ch = r.word[j] || '', st = r.res?.[j]
                return <span key={j} role="gridcell" className={`wg5-cell${st ? ' is-' + st : ''}${ch && !st ? ' is-typed' : ''}`} aria-label={ch ? `${ch.toUpperCase()}${st ? ', ' + LABEL[st] : ''}` : 'empty'} style={st ? { animationDelay: `${j * 0.12}s` } : undefined}>{ch.toUpperCase()}</span>
              })}
            </div>
          ))}
        </div>
        {hintText && !over && <p className="wg5-hint">💡 {hintText}</p>}
        <p className="wg5-msg" aria-live="polite">{msg || (over ? (won ? `🎉 You found "${answer.toUpperCase()}"!` : `The word was "${answer.toUpperCase()}"`) : 'Guess a five-letter word')}</p>
        <div className="wg-keys wg5-keys" dir="ltr">
          {KEYS.map(row => (
            <div key={row} className="wg-row">
              {[...row].map(k => <button key={k} type="button" className={`wg-key${keys[k] ? ' is-' + keys[k] : ''}`} disabled={over} onClick={() => type(k)} aria-label={`${k.toUpperCase()}${keys[k] ? ', ' + LABEL[keys[k]] : ''}`}>{k.toUpperCase()}</button>)}
            </div>
          ))}
          <div className="wg-row">
            <button type="button" className="wg-key wg5-wide is-go" onClick={submit} disabled={over}>✓ Enter</button>
            <button type="button" className="wg-key wg5-wide" onClick={back} disabled={over} aria-label="Delete a letter">⌫ Delete</button>
          </div>
        </div>
      </div>
      {over && end}
    </div>
  )
}

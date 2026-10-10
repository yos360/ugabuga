import { useEffect, useMemo, useRef, useState } from 'react'
import { HEBREW, ENGLISH } from '../../data/letterLearning'
import { speak } from '../../utils/speak'

// One engine for the Hebrew letters game (/letters/game), the English review game
// (/abc/game) and the mini-game on every letter page (fixed = that letter).
// Kindergarten-first: huge targets, one question at a time, no reading needed
// for the "find the letter" mode — the letter is shown and can be heard.

const ROUNDS = 10
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

// Sound on/off is remembered per device (also silences the automatic reading of each question).
const MUTE_KEY = 'buga-letters-muted'
const readMuted = () => { try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false } }
const saveMuted = v => { try { localStorage.setItem(MUTE_KEY, v ? '1' : '0') } catch { /* storage blocked */ } }

// Tiny WebAudio feedback, no audio files: a gentle two-note "ding" for a right answer and a
// soft low "boop" for a wrong one.
const AUTO = { user: false } // automatic read-aloud: stay silent when there is no voice
let audioCtx = null
function tone(kind) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    audioCtx = audioCtx || new AC()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const now = audioCtx.currentTime
    const notes = kind === 'good' ? [[880, 0, 0.18], [1320, 0.1, 0.28]] : [[200, 0, 0.22]]
    for (const [freq, at, len] of notes) {
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain()
      osc.type = kind === 'good' ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now + at)
      if (kind !== 'good') osc.frequency.exponentialRampToValueAtTime(150, now + at + len)
      gain.gain.setValueAtTime(0.0001, now + at)
      gain.gain.exponentialRampToValueAtTime(kind === 'good' ? 0.18 : 0.12, now + at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + len)
      osc.connect(gain).connect(audioCtx.destination)
      osc.start(now + at)
      osc.stop(now + at + len + 0.05)
    }
  } catch { /* no audio on this device */ }
}


const HE_MODES = [
  { id: 'find', label: 'מצאו את האות', emoji: '🔎' },
  { id: 'first', label: 'באיזו אות זה מתחיל?', emoji: '🖼️' },
  { id: 'name', label: 'איך קוראים לאות?', emoji: '🗣️' },
]
const EN_MODES = [
  { id: 'find', label: 'Find the letter', emoji: '🔎' },
  { id: 'match', label: 'גדולה ↔ קטנה', emoji: '🔠' },
  { id: 'first', label: 'באיזו אות זה מתחיל?', emoji: '🖼️' },
]
const HE_SETS = [
  { id: 'all', label: 'כל האותיות', from: 0, to: 22 },
  { id: 'a', label: 'א–כ', from: 0, to: 11 },
  { id: 'b', label: 'ל–ת', from: 11, to: 22 },
]
const EN_SETS = [
  { id: 'all', label: 'A–Z', from: 0, to: 26 },
  { id: 'a', label: 'A–M', from: 0, to: 13 },
  { id: 'b', label: 'N–Z', from: 13, to: 26 },
]

function makeQuestion(lang, mode, pool, fixed) {
  const all = lang === 'he' ? HEBREW : ENGLISH
  const target = fixed ? all.find(x => x.l === fixed) : pick(pool)
  const count = mode === 'find' ? 6 : 4
  const near = lang === 'he' ? (target.similar || []).map(s => all.find(x => x.l === s)).filter(Boolean) : []
  const others = shuffle(all.filter(x => x !== target && !near.includes(x)))
  const options = shuffle([target, ...shuffle(near).slice(0, 2), ...others].slice(0, count))
  const word = pick(target.words ? target.words : [[target.word, target.emoji]])
  return { target, options, word, id: Math.random() }
}

// What each option button shows, and what the question asks, per mode.
function optionLabel(lang, mode, o) {
  if (mode === 'name') return o.name
  if (mode === 'match') return o.l
  return lang === 'en' && mode === 'find' ? o.l + o.lower : o.l
}

export default function LettersGame({ lang = 'he', fixed = null, compact = false }) {
  const modes = lang === 'he' ? HE_MODES : EN_MODES
  const sets = lang === 'he' ? HE_SETS : EN_SETS
  const [mode, setMode] = useState(fixed ? 'find' : modes[0].id)
  const [setId, setSetId] = useState('all')
  const pool = useMemo(() => { const s = sets.find(x => x.id === setId); return (lang === 'he' ? HEBREW : ENGLISH).slice(s.from, s.to) }, [lang, setId]) // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState(() => makeQuestion(lang, mode, pool, fixed))
  const [picked, setPicked] = useState(null)
  const [wrong, setWrong] = useState([])
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const rounds = fixed ? 5 : ROUNDS
  const voice = lang === 'he' ? 'he-IL' : 'en-US'
  const [muted, setMuted] = useState(readMuted)
  const mutedRef = useRef(muted)
  useEffect(() => { mutedRef.current = muted }, [muted])
  // Never speak before the child touched the game: reading "א" the moment the page
  // opens is startling. Auto-reading starts only after the first interaction.
  const startedRef = useRef(false)
  const playRef = useRef(null)
  // Unmuting reads the current question again, so the child isn't left waiting for the next one.
  const toggleMute = () => { startedRef.current = true; const v = !muted; setMuted(v); mutedRef.current = v; saveMuted(v); if (v) { try { window.speechSynthesis?.cancel() } catch { /* ignore */ } } else if (!done) askAloud() }
  // On a phone, bring the question + all answer buttons into view when a game starts.
  const scrollToPlay = () => requestAnimationFrame(() => playRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

  const restart = (m = mode, p = pool) => { startedRef.current = true; setQ(makeQuestion(lang, m, p, fixed)); setPicked(null); setWrong([]); setRound(1); setScore(0); setDone(false) }
  const chooseMode = m => { setMode(m); restart(m); scrollToPlay() }
  const chooseSet = id => { setSetId(id); const s = sets.find(x => x.id === id); restart(mode, (lang === 'he' ? HEBREW : ENGLISH).slice(s.from, s.to)); scrollToPlay() }

  // The vocalized (menukad) form when the data has one — the device voice pronounces it far better.
  const sayWord = () => speak(q.word[2] || q.word[0], voice)

  const prompt = () => {
    startedRef.current = true
    if (mode === 'first') sayWord()
    else if (mode === 'name') speak('איך קוראים לאות הזאת?', 'he-IL')
    else speak(lang === 'he' ? q.target.name : q.target.l, voice)
  }

  const askAloud = () => {
    if (mode === 'first') speak(q.word[2] || q.word[0], voice, AUTO)
    else if (mode === 'name') speak('איך קוראים לאות הזאת?', 'he-IL', AUTO)
    else if (lang === 'he') speak(`לחצו על האות ${q.target.name}`, voice, AUTO)
    else speak(q.target.l, voice, AUTO)
  }

  // Read every new question aloud automatically (unless muted) — but never before the child's
  // first interaction, so opening the page is silent. speak() is async and quietly returns
  // false when the device has no voice for the language — the game works silently then.
  useEffect(() => {
    if (done || mutedRef.current || !startedRef.current) return
    const t = setTimeout(() => {
      if (!mutedRef.current) askAloud()
    }, 250)
    return () => clearTimeout(t)
  }, [q.id, done]) // eslint-disable-line react-hooks/exhaustive-deps

  function choose(o) {
    startedRef.current = true
    if (picked) return
    if (o !== q.target) { if (!muted) tone('bad'); setWrong(w => w.includes(o) ? w : [...w, o]); return }
    setPicked(o)
    if (!muted) tone('good')
    if (!wrong.length) setScore(s => s + 1)
    if (mode === 'first' && !muted) sayWord()
    setTimeout(() => {
      if (round >= rounds) { setDone(true); return }
      setRound(r => r + 1); setQ(makeQuestion(lang, mode, pool, fixed)); setPicked(null); setWrong([])
    }, 1100)
  }

  const question = mode === 'find'
    ? (lang === 'he' ? <>לחצו על האות <b className="mx-2 inline-block min-w-[1.6em] rounded-2xl border-2 border-[var(--border)] bg-white px-3 py-1 text-5xl align-middle">{q.target.l}</b></> : <>Find the letter <b className="mx-2 inline-block min-w-[1.6em] rounded-2xl border-2 border-[var(--border)] bg-white px-3 py-1 text-5xl align-middle" dir="ltr">{q.target.l}</b></>)
    : mode === 'match' ? <>מצאו את האות הגדולה של <b className="text-6xl align-middle" dir="ltr">{q.target.lower}</b></>
      : mode === 'name' ? <>איך קוראים לאות <b className="text-6xl align-middle">{q.target.l}</b>?</>
        : <>באיזו אות מתחיל…</>

  const stars = score >= rounds * 0.9 ? 3 : score >= rounds * 0.6 ? 2 : 1

  return (
    <section dir="rtl" className={`rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 sm:p-6 text-center sketch-shadow ${compact ? '' : 'max-w-3xl mx-auto'}`}>
      {!fixed && <div className="mb-3 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="סוג המשחק">
        {modes.map(m => <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => chooseMode(m.id)}
          className={`min-h-[44px] rounded-xl border-2 px-3 font-bold ${mode === m.id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{m.emoji} {m.label}</button>)}
      </div>}
      {!fixed && <div className="mb-4 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="אילו אותיות">
        {sets.map(s => <button key={s.id} type="button" role="radio" aria-checked={setId === s.id} onClick={() => chooseSet(s.id)}
          className={`min-h-[40px] rounded-full border-2 px-4 text-sm font-bold ${setId === s.id ? 'border-slate-800 bg-pink-200' : 'border-[var(--border)] bg-white'}`}>{s.label}</button>)}
      </div>}

      {done ? (
        <div className="py-6 buga-fade-in">
          <div className="text-6xl mb-2" aria-hidden="true">{'⭐'.repeat(stars)}</div>
          <p className="font-display text-3xl font-bold mb-1">{stars === 3 ? 'כל הכבוד! אלופים!' : stars === 2 ? 'יופי! עוד קצת ואתם אלופים' : 'התחלה טובה! בואו ננסה שוב'}</p>
          <p className="text-lg mb-5">צדקתם בפעם הראשונה ב־{score} מתוך {rounds}</p>
          <button type="button" onClick={() => { restart(); scrollToPlay() }} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🔄 משחק חדש</button>
        </div>
      ) : (
        <>
          <div ref={playRef} className="mb-2 flex scroll-mt-2 items-center justify-between gap-2 text-sm font-bold">
            <span>שאלה {round} מתוך {rounds}</span>
            <button type="button" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'הפעלת קול' : 'השתקה'} title={muted ? 'הפעלת קול' : 'השתקה'}
              className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-2 text-xl">{muted ? '🔇' : '🔊'}</button>
            <span aria-label={`ניקוד ${score}`}>⭐ {score}</span>
          </div>
          <div className="mb-3 h-2 rounded-full bg-white border border-[var(--border)] overflow-hidden"><div className="h-full bg-pink-500 transition-all" style={{ width: `${(round - 1) / rounds * 100}%` }} /></div>

          <p className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 leading-snug">{question}</p>
          {mode === 'first' && <div className="my-1 sm:my-2">
            <div className="text-7xl sm:text-8xl leading-none" aria-hidden="true">{q.word[1]}</div>
            <p className={`mt-2 text-2xl font-bold transition-opacity ${picked ? 'opacity-100' : 'opacity-0'}`} dir={lang === 'en' ? 'ltr' : 'rtl'}>{q.word[0]}{lang === 'en' && <span className="text-base font-normal"> · {q.target.he}</span>}</p>
          </div>}
          <button type="button" onClick={prompt} className="mb-3 sm:mb-4 min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold">🔊 {mode === 'first' ? 'שמעו את המילה' : 'שמעו'}</button>

          <div className={`grid gap-2 sm:gap-3 ${q.options.length > 4 ? 'grid-cols-3' : 'grid-cols-2'} max-w-md mx-auto`}>
            {q.options.map(o => {
              const isRight = picked && o === q.target, isWrong = wrong.includes(o)
              return <button key={o.l + q.id} type="button" onClick={() => choose(o)} disabled={isWrong}
                dir={lang === 'en' ? 'ltr' : 'rtl'}
                className={`min-h-[72px] sm:min-h-[88px] rounded-2xl border-[3px] font-bold transition-transform ${mode === 'name' ? 'text-2xl' : 'text-5xl sm:text-6xl'} ${isRight ? 'border-green-600 bg-green-200 scale-110' : isWrong ? 'border-red-300 bg-red-50 opacity-40' : 'border-slate-800 bg-white hover:-translate-y-1 active:scale-95'}`}
                style={isRight ? { animation: 'buga-pop 400ms ease-out' } : undefined}
                aria-label={mode === 'name' ? o.name : `האות ${o.l}`}>{optionLabel(lang, mode, o)}</button>
            })}
          </div>
          <p className="mt-3 min-h-[28px] font-bold" aria-live="polite">{picked ? ['יפה מאוד! 🎉', 'נכון! 👏', 'מצוין! ⭐', 'בדיוק! 💪'][round % 4] : wrong.length ? 'נסו שוב 🙂' : ''}</p>
        </>
      )}
    </section>
  )
}

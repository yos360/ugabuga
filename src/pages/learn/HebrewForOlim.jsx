import '../../learn/learn.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { speak, hasVoice } from '../../utils/speak'
import {
  PATH, KID_LANGS, TOPICS, ALL_KEYS, topicCards, pictureCards, phraseCards, deskLines, boardCards, planWeeks,
  PARENT_WELCOME, WELCOME_STEPS, FIRST_WEEK, TEACHER_TIPS, PARENT_TIPS, CONSULT, FAQ,
} from '../../data/hebrewForOlim'
import { ALPHABET, GLOSSARY } from '../../data/hebrewForOlimMore'

// /learn/hebrew-for-olim: first Hebrew words and survival phrases for a child who just made aliyah.
// Pick the child's language and a topic, hear the Hebrew word, play four games, mark learned words,
// learn the alphabet and print phrase cards, a communication board, a certificate, a 4-week plan and
// picture dictionaries. Only the "learned" marks are kept, in this browser (localStorage); nothing is sent.

function useHebrewVoice() {
  const [ok, setOk] = useState(true)
  useEffect(() => {
    let live = true
    hasVoice('he-IL').then(v => { if (live) setOk(v) })
    return () => { live = false }
  }, [])
  return ok
}

const sayHebrew = c => speak(c.he, 'he-IL', { rate: 0.8 })
const langOf = id => KID_LANGS.find(l => l.id === id)

const shuffle = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const uniqueByEmoji = list => list.filter((c, i) => list.findIndex(p => p.emoji === c.emoji) === i)
const wordsText = n => (n === 1 ? 'מילה אחת' : `${n} מילים`)

// ---- "my words": which words the child marked as learned (kept only in this browser) ----
const LEARNED_KEY = 'ugabuga.olim.learned'
function readLearned() {
  try {
    const a = JSON.parse(localStorage.getItem(LEARNED_KEY))
    return Array.isArray(a) ? a.map(String) : []
  } catch { return [] }
}
function saveLearned(set) {
  try { localStorage.setItem(LEARNED_KEY, JSON.stringify([...set])) } catch { /* private mode or blocked storage */ }
}
function useLearned() {
  const [set, setSet] = useState(() => new Set(readLearned()))
  const toggle = key => setSet(prev => {
    const next = new Set(prev)
    const k = String(key)
    if (next.has(k)) next.delete(k); else next.add(k)
    saveLearned(next)
    return next
  })
  const reset = () => { saveLearned(new Set()); setSet(new Set()) }
  const count = [...set].filter(k => ALL_KEYS.has(k)).length
  return { set, toggle, reset, count }
}

function WordCard({ c, lang, voice, learned, onToggle }) {
  const L = langOf(lang)
  return <li className={`flex flex-col items-center rounded-2xl border-2 bg-white p-3 text-center shadow-sm ${learned ? 'border-emerald-400' : 'border-[var(--border)]'}`}>
    <span className="text-5xl" aria-hidden="true">{c.emoji}</span>
    <span className="mt-1 text-3xl font-black leading-snug">{c.nk}</span>
    <span className="text-[15px] text-[var(--muted-foreground)]" lang="en" dir="ltr">{c.tr}</span>
    <span className="mt-2 rounded-xl bg-sky-50 px-3 py-1 text-xl font-bold" lang={L.code} dir={L.dir}>{c.tx}</span>
    <button type="button" onClick={() => sayHebrew(c)} className="ln-btn alt mt-2 min-h-[44px]"
      aria-label={`השמע בעברית: ${c.he}`}>🔊 {voice ? 'שמעו' : 'שמעו (אין קול)'}</button>
    <button type="button" onClick={onToggle} aria-pressed={learned} aria-label={`למדתי: ${c.he}`}
      className={`mt-2 min-h-[44px] rounded-xl border-2 px-3 text-base font-bold ${learned ? 'border-emerald-500 bg-emerald-100' : 'border-[var(--border)] bg-white'}`}>
      {learned ? '✓ למדתי' : '☐ למדתי'}</button>
  </li>
}

// ---- games ----

// One round: a Hebrew word, four different emoji (one is right).
function makeRound(pool) {
  const answer = pool[Math.floor(Math.random() * pool.length)]
  const others = shuffle(pool.filter(p => p.emoji !== answer.emoji)).slice(0, 3)
  return { answer, options: shuffle([answer, ...others]) }
}

// Picture match (the word is shown) and listening game (the word is only heard until the answer).
function MatchGame({ pool, listen = false }) {
  const [round, setRound] = useState(() => makeRound(pool))
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const done = picked !== null
  const win = done && picked === round.answer.emoji

  function choose(e) {
    if (done) return
    setPicked(e)
    setScore(s => ({ right: s.right + (e === round.answer.emoji ? 1 : 0), total: s.total + 1 }))
  }
  function next() {
    const r = makeRound(pool)
    setRound(r); setPicked(null)
    if (listen) sayHebrew(r.answer)
  }
  const hidden = listen && !done

  return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
    <p className="text-lg">{listen ? 'שומעים מילה בעברית. איזו תמונה מתאימה?' : 'איזו תמונה מתאימה למילה?'}</p>
    <button type="button" onClick={() => sayHebrew(round.answer)} className="my-2 inline-flex min-h-[56px] items-center gap-2 rounded-2xl border-2 border-slate-800 bg-amber-50 px-6 py-2 text-4xl font-black"
      aria-label={hidden ? 'השמע מילה בעברית' : `השמע בעברית: ${round.answer.he}`}>
      {hidden ? <span className="text-2xl">לחצו ושמעו</span> : round.answer.nk} <span className="text-2xl" aria-hidden="true">🔊</span></button>
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="בחירת תמונה">
      {round.options.map(o => {
        const right = done && o.emoji === round.answer.emoji
        const wrong = done && o.emoji === picked && !right
        return <button key={o.emoji} type="button" onClick={() => choose(o.emoji)} disabled={done && !right && !wrong}
          aria-label={hidden ? 'תמונה' : `תמונה: ${o.he}`}
          className={`min-h-[96px] rounded-2xl border-4 text-6xl motion-reduce:transition-none ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-400 bg-rose-50' : 'border-[var(--border)] bg-white'}`}>
          <span aria-hidden="true">{o.emoji}</span></button>
      })}
    </div>
    <p className="mt-3 min-h-[2rem] text-xl font-bold" role="status" aria-live="polite">
      {done ? (win ? `כל הכבוד! ${round.answer.nk}` : `כמעט! ${round.answer.nk} זה ${round.answer.emoji}`) : ''}
    </p>
    <p className="text-[var(--muted-foreground)]">נכון: {score.right} מתוך {score.total}</p>
    {done && <button type="button" className="ln-btn go mt-3" onClick={next}>עוד מילה</button>}
  </div>
}

// Reverse quiz: the word in the child's language, choose the Hebrew word of four.
function makeReverse(cards) {
  const answer = cards[Math.floor(Math.random() * cards.length)]
  const others = shuffle(cards.filter(c => c.he !== answer.he)).slice(0, 3)
  return { answer, options: shuffle([answer, ...others]) }
}

function ReverseQuiz({ cards, lang }) {
  const L = langOf(lang)
  const [round, setRound] = useState(() => makeReverse(cards))
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const done = picked !== null

  function choose(c) {
    if (done) return
    setPicked(c.he)
    setScore(s => ({ right: s.right + (c.he === round.answer.he ? 1 : 0), total: s.total + 1 }))
    sayHebrew(round.answer)
  }
  function next() { setRound(makeReverse(cards)); setPicked(null) }

  return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
    <p className="text-lg">איך אומרים בעברית?</p>
    <p className="my-2 inline-block rounded-2xl border-2 border-slate-800 bg-sky-50 px-6 py-2 text-3xl font-black" lang={L.code} dir={L.dir}>
      <span aria-hidden="true">{round.answer.emoji}</span> {round.answer.tx}</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2" role="group" aria-label="בחירת מילה בעברית">
      {round.options.map(o => {
        const right = done && o.he === round.answer.he
        const wrong = done && o.he === picked && !right
        return <button key={o.he} type="button" onClick={() => choose(o)} disabled={done && !right && !wrong}
          className={`min-h-[64px] rounded-2xl border-4 px-3 text-2xl font-black ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-400 bg-rose-50' : 'border-[var(--border)] bg-white'}`}>
          {o.nk}</button>
      })}
    </div>
    <p className="mt-3 min-h-[2rem] text-xl font-bold" role="status" aria-live="polite">
      {done ? (picked === round.answer.he ? `כל הכבוד! ${round.answer.nk}` : `כמעט! התשובה: ${round.answer.nk}`) : ''}
    </p>
    <p className="text-[var(--muted-foreground)]">נכון: {score.right} מתוך {score.total}</p>
    {done && <button type="button" className="ln-btn go mt-3" onClick={next}>עוד מילה</button>}
  </div>
}

// Memory: six pairs of picture and Hebrew word.
function makeDeck(pool) {
  return shuffle(shuffle(pool).slice(0, 6).flatMap(c => [
    { id: `${c.key}-p`, pair: c.key, kind: 'pic', c },
    { id: `${c.key}-w`, pair: c.key, kind: 'word', c },
  ]))
}

function MemoryGame({ pool }) {
  const [deck, setDeck] = useState(() => makeDeck(pool))
  const [open, setOpen] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const won = matched.length === deck.length / 2

  useEffect(() => {
    if (open.length !== 2) return undefined
    const [a, b] = open.map(id => deck.find(d => d.id === id))
    const same = a.pair === b.pair
    const t = setTimeout(() => {
      if (same) setMatched(m => [...m, a.pair])
      setOpen([])
    }, same ? 400 : 900)
    return () => clearTimeout(t)
  }, [open, deck])

  function flip(d) {
    if (open.length >= 2 || open.includes(d.id) || matched.includes(d.pair)) return
    const next = [...open, d.id]
    setOpen(next)
    if (next.length === 2) setMoves(m => m + 1)
    if (d.kind === 'word') sayHebrew(d.c)
  }
  function restart() { setDeck(makeDeck(pool)); setOpen([]); setMatched([]); setMoves(0) }

  return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
    <p className="text-lg">מצאו זוגות: תמונה והמילה שלה בעברית.</p>
    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4" role="group" aria-label="קלפי זיכרון">
      {deck.map(d => {
        const shown = open.includes(d.id) || matched.includes(d.pair)
        return <button key={d.id} type="button" onClick={() => flip(d)} aria-pressed={shown}
          aria-label={shown ? (d.kind === 'pic' ? `תמונה: ${d.c.he}` : `מילה: ${d.c.he}`) : 'קלף הפוך'}
          className={`flex min-h-[88px] items-center justify-center rounded-2xl border-4 p-1 motion-reduce:transition-none ${matched.includes(d.pair) ? 'border-emerald-500 bg-emerald-50' : shown ? 'border-slate-800 bg-amber-50' : 'border-[var(--border)] bg-sky-100'}`}>
          {!shown ? <span className="text-4xl" aria-hidden="true">❓</span>
            : d.kind === 'pic' ? <span className="text-5xl" aria-hidden="true">{d.c.emoji}</span>
              : <span className="text-xl font-black leading-tight">{d.c.nk}</span>}
        </button>
      })}
    </div>
    <p className="mt-3 min-h-[2rem] text-xl font-bold" role="status" aria-live="polite">{won ? `כל הכבוד! סיימתם ב-${moves} מהלכים.` : ''}</p>
    <p className="text-[var(--muted-foreground)]">מהלכים: {moves}</p>
    <button type="button" className="ln-btn go mt-3" onClick={restart}>{won ? 'משחק חדש' : 'להתחיל מחדש'}</button>
  </div>
}

const GAMES = [['match', '🎯 איזו תמונה?'], ['listen', '👂 הקשבה'], ['memory', '🧠 זיכרון'], ['reverse', '🔁 מה בעברית?']]

function GamesPanel({ lang, topic, pool, cards, voice }) {
  const [game, setGame] = useState('match')
  const note = text => <p className="rounded-2xl bg-amber-50 p-3">{text}</p>
  const key = `${lang}-${topic}-${game}`
  const reversePool = cards.length >= 4 ? cards : pool
  let body
  if (game === 'reverse') {
    body = reversePool.length >= 4 ? <ReverseQuiz key={key} cards={reversePool} lang={lang} /> : note('אין מספיק מילים בנושא הזה לחידון. בחרו נושא אחר.')
  } else if (game === 'memory') {
    body = pool.length >= 3 ? <MemoryGame key={key} pool={pool} /> : note('המשחק מתאים לנושאים עם תמונות. בחרו נושא אחר.')
  } else if (game === 'listen' && !voice) {
    body = note('🔇 משחק ההקשבה צריך קול בעברית, ואין כזה במכשיר הזה. אפשר לשחק בשאר המשחקים, או להוסיף קול בהגדרות המכשיר: הקראת טקסט.')
  } else {
    body = pool.length >= 4 ? <MatchGame key={key} pool={pool} listen={game === 'listen'} /> : note('המשחק מתאים לנושאים עם תמונות. בחרו נושא אחר.')
  }
  return <div>
    <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="בחירת משחק">
      {GAMES.map(([id, t]) => <button key={id} type="button" aria-pressed={id === game} onClick={() => setGame(id)}
        className={`min-h-[48px] rounded-2xl border-2 px-4 text-lg font-bold ${id === game ? 'border-slate-800 bg-emerald-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>{t}</button>)}
    </div>
    {body}
  </div>
}

function Progress({ learned }) {
  const [ask, setAsk] = useState(false)
  return <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3">
    <p className="text-xl font-black" role="status" aria-live="polite">⭐ למדתי {wordsText(learned.count)}</p>
    {learned.count > 0 && !ask && <button type="button" className="ln-btn alt min-h-[44px]" onClick={() => setAsk(true)}>איפוס</button>}
    {ask && <span className="flex flex-wrap items-center gap-2">
      <span>לאפס את כל הסימונים?</span>
      <button type="button" className="ln-btn go min-h-[44px]" onClick={() => { learned.reset(); setAsk(false) }}>כן, לאפס</button>
      <button type="button" className="ln-btn alt min-h-[44px]" onClick={() => setAsk(false)}>ביטול</button>
    </span>}
    <p className="w-full text-sm text-[var(--muted-foreground)]">הסימונים נשמרים רק בדפדפן הזה, במכשיר הזה.</p>
  </div>
}

function TopicButtons({ label, list, topic, setTopic }) {
  return <div className="mb-2">
    <p className="mb-1 text-sm font-bold text-[var(--muted-foreground)]">{label}</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {list.map(x => <button key={x.id} type="button" aria-pressed={x.id === topic} onClick={() => setTopic(x.id)}
        className={`min-h-[48px] rounded-2xl border-2 px-4 text-lg font-bold ${x.id === topic ? 'border-slate-800 bg-sky-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{x.emoji}</span> {x.title}</button>)}
    </div>
  </div>
}

function Explorer({ lang, setLang, topic, setTopic, learned }) {
  const voice = useHebrewVoice()
  const cards = topicCards(lang, topic)
  const t = TOPICS.find(x => x.id === topic)
  const pool = uniqueByEmoji(t.pics ? cards : pictureCards(lang))
  const L = langOf(lang)
  const marked = cards.filter(c => learned.set.has(String(c.key))).length

  return <div>
    <h3 className="mb-2 text-xl font-black">1. באיזו שפה הילד מדבר בבית?</h3>
    <div className="flex flex-wrap gap-2" role="group" aria-label="שפת הילד">
      {KID_LANGS.map(l => <button key={l.id} type="button" aria-pressed={l.id === lang} onClick={() => setLang(l.id)}
        className={`min-h-[48px] rounded-2xl border-2 px-4 text-lg font-bold ${l.id === lang ? 'border-slate-800 bg-amber-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{l.emoji}</span> {l.name}</button>)}
    </div>
    <h3 className="mb-2 mt-5 text-xl font-black">2. על מה רוצים ללמוד?</h3>
    <TopicButtons label="משפטים לשימוש יומיומי" list={TOPICS.filter(x => !x.pics)} topic={topic} setTopic={setTopic} />
    <TopicButtons label="מילים עם תמונות" list={TOPICS.filter(x => x.pics)} topic={topic} setTopic={setTopic} />

    {!voice && <p className="mt-4 rounded-2xl bg-amber-50 p-3">🔇 במכשיר הזה אין קול בעברית, ולכן כפתורי ההשמעה לא ישמיעו. ההגייה כתובה באותיות לטיניות מתחת לכל מילה. בהגדרות המכשיר אפשר להוסיף קול: הקראת טקסט.</p>}

    <h3 className="mb-2 mt-5 text-xl font-black">3. כרטיסי מילים: {t.title} ({L.name})</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">לוחצים על ״שמעו״ כדי לשמוע את המילה בעברית. הילד חוזר אחריה בקול, ומסמן ״למדתי״ כשהמילה מוכרת לו.</p>
    <Progress learned={learned} />
    {cards.length > 0 && <p className="mb-3 text-[var(--muted-foreground)]">בנושא הזה סומנו {marked} מתוך {cards.length}.</p>}
    {cards.length === 0
      ? <p className="rounded-2xl bg-amber-50 p-3">עדיין אין לנו מילים מאומתות בנושא הזה בשפה הזו.</p>
      : <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-live="polite">{cards.map(c => <WordCard key={`${lang}-${topic}-${c.key}`} c={c} lang={lang} voice={voice}
        learned={learned.set.has(String(c.key))} onToggle={() => learned.toggle(c.key)} />)}</ul>}
    {lang === 'ar' && <p className="mt-3 text-sm text-[var(--muted-foreground)]">המילים בערבית ספרותית (הכתובה). בערבית המדוברת חלק מהמילים נשמעות אחרת.</p>}
    {lang === 'am' && !t.pics && <p className="mt-3 text-sm text-[var(--muted-foreground)]">באמהרית הוספנו רק משפטים שאנחנו בטוחים בהם, ולכן חלק מהכרטיסים חסרים. בעברית כל המשפטים קיימים.</p>}

    <h3 className="mb-2 mt-8 text-xl font-black">🎮 משחקים: {t.pics ? t.title : 'מילים מכל הנושאים'}</h3>
    <GamesPanel lang={lang} topic={topic} pool={pool} cards={cards} voice={voice} />
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשלח. רק סימוני ״למדתי״ נשמרים בדפדפן שלכם, ואפשר לאפס אותם.</p>
  </div>
}

// ---- the Hebrew alphabet ----
function AlphabetSection({ voice }) {
  const say = a => speak(a.word, 'he-IL', { rate: 0.8 })
  const card = a => <li key={a.l} className={`flex flex-col items-center rounded-2xl border-2 border-[var(--border)] p-3 text-center shadow-sm ${a.final ? 'bg-violet-50' : 'bg-white'}`}>
    <span className="text-6xl font-black leading-none" lang="he">{a.l}</span>
    <span className="mt-1 text-xl font-bold">{a.name}</span>
    <span className="rounded-lg bg-sky-50 px-2 text-lg font-bold" lang="en" dir="ltr">{a.sound}</span>
    <span className="mt-2 text-3xl" aria-hidden="true">{a.emoji}</span>
    <span className="text-xl font-black">{a.word}</span>
    <span className="text-sm text-[var(--muted-foreground)]" lang="en" dir="ltr">{a.tr}</span>
    {a.note && <span className="mt-1 text-sm leading-snug">{a.note}</span>}
    <button type="button" onClick={() => say(a)} className="ln-btn alt mt-2 min-h-[44px]" aria-label={`השמע בעברית: ${a.word}`}>🔊 {voice ? 'שמעו' : 'שמעו (אין קול)'}</button>
  </li>
  return <div>
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{ALPHABET.filter(a => !a.final).map(card)}</ul>
    <h3 className="mb-2 mt-6 text-2xl font-black">חמש אותיות עם צורה מיוחדת בסוף מילה</h3>
    <p className="mb-3 leading-relaxed">האותיות כ, מ, נ, פ, צ נכתבות אחרת כשהן האות האחרונה במילה. הצליל נשאר אותו צליל.</p>
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{ALPHABET.filter(a => a.final).map(card)}</ul>
  </div>
}

// ---- education glossary for parents ----
function Glossary() {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const list = GLOSSARY.filter(([t, d, e]) => !needle || `${t} ${d} ${e}`.toLowerCase().includes(needle))
  return <div>
    <label className="mb-3 block text-lg font-bold">חיפוש מונח (בעברית או באנגלית)
      <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="למשל: צהרון"
        className="mt-1 block min-h-[48px] w-full max-w-md rounded-xl border-2 border-[var(--border)] bg-white px-3 text-lg" />
    </label>
    {list.length === 0 && <p className="rounded-2xl bg-amber-50 p-3">לא נמצא מונח כזה. נסו מילה אחרת.</p>}
    <ul className="grid gap-3 md:grid-cols-2">{list.map(([t, d, e]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
      <p className="text-xl font-black">{t}</p>
      <p className="mt-1 leading-relaxed">{d}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]" lang="en" dir="ltr">{e}</p>
    </li>)}</ul>
  </div>
}

// ---- printable sheets (A4 pages inside PrintPreview) ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function PhraseCardsSheet({ lang }) {
  const L = langOf(lang)
  const cards = phraseCards(lang)
  return <article className="buga-a4" style={page}>
    <h2>🆘 כרטיסי משפטים לכיתה · עברית + {L.name}</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>גוזרים לאורך הקו המקווקו, מצפים בלמינציה ושמים על השולחן של הילד</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 5 }}>
      {cards.map(c => <div key={c.key} style={{ border: '2px dashed #555', borderRadius: 12, padding: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ fontSize: 30 }}>{c.emoji}</div>
        <div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.2 }}>{c.nk}</div>
        <div lang="en" dir="ltr" style={{ fontSize: 11, color: '#555' }}>{c.tr}</div>
        <div lang={L.code} dir={L.dir} style={{ fontSize: 15, fontWeight: 700, marginTop: 2, background: '#e0f2fe', borderRadius: 8, padding: '1px 4px' }}>{c.tx}</div>
      </div>)}
    </div>
    {foot(`כרטיסי משפטים (${L.name})`)}
  </article>
}

function NameCardSheet({ lang }) {
  const L = langOf(lang)
  const d = deskLines(lang)
  const one = k => <div key={k} style={{ border: '2px dashed #555', borderRadius: 16, padding: '10px 16px', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
    <div style={{ fontSize: 40 }}>👋</div>
    <div style={{ fontSize: 30, fontWeight: 900 }}>שלום, קוראים לי ______________</div>
    <div style={{ fontSize: 26, fontWeight: 800 }}>אני מדבר/ת ______________</div>
    {d.hello && d.name && d.speak && <div lang={L.code} dir={L.dir} style={{ fontSize: 17, background: '#e0f2fe', borderRadius: 10, padding: '4px 8px' }}>
      {d.hello.tx} · {d.name.tx} ______ · {d.speak.tx} ______</div>}
    <div style={{ fontSize: 13, color: '#555' }}>ציירו כאן את עצמכם או את הדגל שלכם: ⬜⬜⬜⬜⬜⬜</div>
    <div style={{ height: 60, border: '1.5px dashed #aaa', borderRadius: 10 }} />
  </div>
  return <article className="buga-a4" style={page}>
    <h2>🏷️ כרטיס שולחן: שלום, קוראים לי…</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>כותבים שם ושפה, גוזרים ומקפלים לשניים. שני כרטיסים בדף.</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>{[1, 2].map(one)}</div>
    {foot(`כרטיס שולחן (${L.name})`)}
  </article>
}

function DictionarySheet({ lang, topic }) {
  const L = langOf(lang)
  const t = TOPICS.find(x => x.id === topic)
  const cards = topicCards(lang, topic)
  // Big topics (animals) get a denser grid so every word fits on the one page.
  const cols = cards.length > 15 ? 4 : 3
  return <article className="buga-a4" style={page}>
    <h2>{t.emoji} מילון תמונות ראשון: {t.title} · עברית + {L.name}</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · כותבים בכתב יד מתחת לכל מילה ומציירים אם רוצים.</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr', gap: 5 }}>
      {cards.map(c => <div key={c.key} style={{ border: '1.5px solid #555', borderRadius: 10, padding: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: cols === 4 ? 22 : 28 }}>{c.emoji}</div>
        <div style={{ fontSize: cols === 4 ? 14 : 17, fontWeight: 900 }}>{c.nk}</div>
        <div lang="en" dir="ltr" style={{ fontSize: 10, color: '#555' }}>{c.tr}</div>
        <div lang={L.code} dir={L.dir} style={{ fontSize: cols === 4 ? 11 : 13, fontWeight: 700 }}>{c.tx}</div>
        <div style={{ borderBottom: '1px solid #999', height: 12 }} />
      </div>)}
    </div>
    {foot(`מילון תמונות: ${t.title} (${L.name})`)}
  </article>
}

// Twelve big picture cells a child points to when words are missing.
function BoardSheet({ lang }) {
  const L = langOf(lang)
  const cells = boardCards(lang)
  return <article className="buga-a4" style={page}>
    <h2>🗣️ לוח תקשורת לכיתה · עברית + {L.name}</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>הילד מצביע על התמונה, והמורה אומרת את המילה בעברית. אפשר לצפות בלמינציה ולהדביק על השולחן.</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', gap: 6 }}>
      {cells.map(c => <div key={c.key} style={{ border: '2.5px solid #333', borderRadius: 14, padding: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ fontSize: 56, lineHeight: 1.1 }}>{c.emoji}</div>
        <div style={{ fontSize: 21, fontWeight: 900, lineHeight: 1.15 }}>{c.he}</div>
        <div lang="en" dir="ltr" style={{ fontSize: 11, color: '#555' }}>{c.tr}</div>
        {c.tx && <div lang={L.code} dir={L.dir} style={{ fontSize: 15, fontWeight: 700, marginTop: 2, background: '#e0f2fe', borderRadius: 8, padding: '1px 4px' }}>{c.tx}</div>}
      </div>)}
    </div>
    {foot(`לוח תקשורת (${L.name})`)}
  </article>
}

function CertificateSheet({ name, count }) {
  return <article className="buga-a4" style={{ ...page, justifyContent: 'center' }}>
    <div style={{ border: '8px double #b45309', borderRadius: 24, padding: '40px 30px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 18, background: '#fffbeb' }}>
      <div style={{ fontSize: 70 }}>🏅</div>
      <div style={{ fontSize: 46, fontWeight: 900 }}>תעודת עברית</div>
      <div style={{ fontSize: 24 }}>מוענקת בגאווה ל</div>
      <div style={{ fontSize: 38, fontWeight: 900, borderBottom: '3px solid #333', minWidth: '70%', padding: '0 12px' }}>{name || ' '}</div>
      <div style={{ fontSize: 30, fontWeight: 800 }}>למדתי {count > 0 ? <b>{count}</b> : '______'} מילים בעברית!</div>
      <div style={{ fontSize: 22 }}>כל מילה היא צעד. כל הכבוד! 🌟</div>
      <div style={{ display: 'flex', gap: 40, marginTop: 24, fontSize: 18 }}>
        <span>תאריך: ____ / ____ / ________</span>
        <span>חתימת המורה: ______________</span>
      </div>
    </div>
    {foot('תעודת עברית')}
  </article>
}

const DAYS = ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳']

function PlanSheet({ lang }) {
  const L = langOf(lang)
  const weeks = planWeeks(lang)
  return <article className="buga-a4" style={page}>
    <h2>📅 תוכנית ארבעה שבועות: שלוש מילים ביום · עברית + {L.name}</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>כל יום שלוש מילים: אומרים, חוזרים, משתמשים במשך היום. כשסיימנו, מסמנים ✓. שם: ______________</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {weeks.map(w => <div key={w.title} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 900, background: '#fde68a', borderRadius: 6, padding: '1px 8px' }}>{w.title}</div>
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, marginTop: 2 }}>
          {w.days.map((items, d) => <div key={d} style={{ border: '1.5px solid #555', borderRadius: 8, padding: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#555' }}>{DAYS[d]}</div>
            {items.map(c => <div key={c.key} style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800 }}>{c.emoji} {c.he}</div>
              {c.tx && <div lang={L.code} dir={L.dir} style={{ fontSize: 8.5, color: '#333' }}>{c.tx}</div>}
            </div>)}
            <div style={{ fontSize: 10 }}>☐ למדנו</div>
          </div>)}
        </div>
      </div>)}
    </div>
    {foot(`תוכנית ארבעה שבועות (${L.name})`)}
  </article>
}

function AlphabetSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🔤 האלפבית העברי · כל האותיות</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>ב, כ, פ: עם נקודה בפנים (בּ, כּ, פּ) נשמעות b, k, p; בלי נקודה v, ch, f. ש: נקודה מימין sh, נקודה משמאל s. חמש האותיות האחרונות (בצבע) נכתבות כך בסוף מילה.</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridAutoRows: '1fr', gap: 4 }}>
      {ALPHABET.map(a => <div key={a.l} style={{ border: '1.5px solid #555', borderRadius: 8, padding: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minHeight: 0, background: a.final ? '#ede9fe' : '#fff', lineHeight: 1.1 }}>
        <div style={{ fontSize: 30, fontWeight: 900 }}>{a.l}</div>
        <div style={{ fontSize: 10, fontWeight: 800 }}>{a.name}</div>
        <div lang="en" dir="ltr" style={{ fontSize: 9, color: '#333' }}>{a.sound}</div>
        <div style={{ fontSize: 10 }}>{a.emoji} {a.word}</div>
      </div>)}
    </div>
    {foot('האלפבית העברי')}
  </article>
}

const PRINT_TITLES = {
  phrases: 'כרטיסי משפטים', name: 'כרטיס שולחן', dict: 'מילון תמונות', board: 'לוח תקשורת',
  cert: 'תעודת עברית', plan: 'תוכנית ארבעה שבועות', alphabet: 'האלפבית העברי',
}

export default function HebrewForOlim() {
  const [lang, setLang] = useState('ru')
  const [topic, setTopic] = useState('needs')
  const [print, setPrint] = useState(null) // { kind, topic? }
  const [certName, setCertName] = useState('')
  const voice = useHebrewVoice()
  const learned = useLearned()
  const L = langOf(lang)
  const dictTopics = TOPICS.filter(t => t.pics)

  const sheet = !print ? null
    : print.kind === 'phrases' ? <PhraseCardsSheet lang={lang} />
      : print.kind === 'name' ? <NameCardSheet lang={lang} />
        : print.kind === 'board' ? <BoardSheet lang={lang} />
          : print.kind === 'cert' ? <CertificateSheet name={certName.trim()} count={learned.count} />
            : print.kind === 'plan' ? <PlanSheet lang={lang} />
              : print.kind === 'alphabet' ? <AlphabetSheet />
                : <DictionarySheet lang={lang} topic={print.topic} />
  const printBtn = (kind, emoji, text) => <button type="button" onClick={() => setPrint({ kind })} className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{emoji}</span> {text} · הדפסה ←</button>

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="עברית לילדים עולים: מילים ראשונות בגן ובבית הספר"
      description="עברית לילדים עולים: כרטיסי מילים עם השמעה ברוסית, אנגלית, צרפתית, אמהרית וערבית, משפטי הישרדות, משחקי הקשבה וזיכרון, אלפבית, לוח תקשורת ודפים להדפסה. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ללמוד', href: '/learn' }, { label: 'עברית לילדים עולים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">👋 עברית לילדים עולים: מילים ראשונות בגן ובבית הספר</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">ילד שעלה לישראל נכנס לגן או לכיתה בלי מילים, ולכולם קשה. בעמוד הזה: איך מקבלים אותו, מה עושים בשבוע הראשון, כרטיסי מילים עם השמעה בעברית ובשפת הבית (רוסית, אנגלית, צרפתית, אמהרית וערבית), משפטי הישרדות וכיתה, ארבעה משחקים, אלפבית, דפים להדפסה ומילון מערכת החינוך להורים.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['welcome', 'קבלת פנים'], ['words', 'מילים ומשחקים'], ['alphabet', 'אלפבית'], ['print', 'דפים להדפסה'], ['parents', 'להורים'], ['glossary', 'מילון מערכת החינוך'], ['help', 'מתי לפנות לעזרה']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="welcome" className="mb-8 scroll-mt-24" aria-labelledby="welcome-h">
      <h2 id="welcome-h" className="mb-3 text-3xl font-black">👋 איך מקבלים ילד עולה בכיתה או בגן</h2>
      <p className="mb-4 text-lg leading-relaxed">מה שהילד צריך יותר מכול ביום הראשון הוא להרגיש שרואים אותו ושהוא בטוח. עברית באה אחר כך, מהר יותר, כשיש ביטחון וחברים. כמה צעדים פשוטים לגננת ולמורה:</p>
      <ul className="grid gap-3 sm:grid-cols-2">{WELCOME_STEPS.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
      <div className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5">
        <h3 className="text-2xl font-black">📅 השבוע הראשון: רשימה קצרה למורה</h3>
        <ol className="mt-2 list-decimal space-y-2 pr-6 text-lg leading-relaxed">{FIRST_WEEK.map(x => <li key={x}>{x}</li>)}</ol>
      </div>
      <div className="mt-4 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🍎 עוד טיפים לגננות ולמורים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 text-lg leading-relaxed">{TEACHER_TIPS.map(x => <li key={x}>{x}</li>)}</ul>
      </div>
    </section>

    <section id="words" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="words-h">
      <h2 id="words-h" className="mb-3 text-3xl font-black">🔊 מילים ראשונות בעברית</h2>
      <p className="mb-4 text-lg leading-relaxed">בוחרים את שפת הילד ואת הנושא, ורואים כל מילה בעברית (עם ניקוד, כשיש), הגייה באותיות לטיניות והמילה בשפת הבית. הנושא הראשון, משפטי הישרדות, הוא הכי חשוב להתחלה. אחר כך משפטים לכיתה, לרגשות ולמשחק בחצר, ועוד נושאים עם תמונות.</p>
      <Explorer lang={lang} setLang={setLang} topic={topic} setTopic={setTopic} learned={learned} />
    </section>

    <section id="alphabet" className="mb-8 scroll-mt-24" aria-labelledby="alphabet-h">
      <h2 id="alphabet-h" className="mb-3 text-3xl font-black">🔤 האלפבית העברי</h2>
      <p className="mb-4 text-lg leading-relaxed">עברית נכתבת וקוראים אותה מימין לשמאל. יש 22 אותיות. לכל אות: שם, צליל בכתב לטיני, מילה לדוגמה עם תמונה וכפתור השמעה. עדיף ללמוד שלוש־ארבע אותיות ביום.</p>
      <AlphabetSection voice={voice} />
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה ({L.name})</h2>
      <p className="mb-4 text-lg leading-relaxed">הדפים מוכנים לפי השפה שנבחרה למעלה. כדי להחליף שפה, בוחרים אותה שוב בחלק של המילים וחוזרים לכאן.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {printBtn('phrases', '🆘', 'כרטיסי משפטים לכיתה')}
        {printBtn('board', '🗣️', 'לוח תקשורת: 12 תמונות')}
        {printBtn('name', '🏷️', 'כרטיס שולחן: שלום, קוראים לי…')}
        {printBtn('plan', '📅', 'תוכנית ארבעה שבועות')}
        {printBtn('alphabet', '🔤', 'דף אלפבית')}
      </div>
      <div className="mt-4 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4">
        <h3 className="text-2xl font-black">🏅 תעודת עברית</h3>
        <p className="mt-1">התעודה כוללת את מספר המילים שהילד סימן ״למדתי״ ({learned.count > 0 ? wordsText(learned.count) : 'עדיין אין סימונים, ואפשר למלא בעט'}). השם לא נשמר ולא נשלח.</p>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="text-lg font-bold">שם הילד/ה
            <input type="text" value={certName} onChange={e => setCertName(e.target.value)} maxLength={40} autoComplete="off"
              className="mt-1 block min-h-[48px] w-64 max-w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 text-lg" />
          </label>
          <button type="button" onClick={() => setPrint({ kind: 'cert' })} className="ln-btn go min-h-[48px]">🏅 הדפסת התעודה</button>
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-black">📖 מילון תמונות ראשון לפי נושא</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{dictTopics.map(t => <button key={t.id} type="button" onClick={() => setPrint({ kind: 'dict', topic: t.id })}
        className="ln-box card-lift min-h-[56px] text-right text-lg font-bold"><span aria-hidden="true">{t.emoji}</span> {t.title} · הדפסה ←</button>)}
      </div>
    </section>

    <section id="parents" className="mb-8 scroll-mt-24" aria-labelledby="parents-h">
      <h2 id="parents-h" className="mb-3 text-3xl font-black">👨‍👩‍👧 להורים: ברוכים הבאים</h2>
      <p className="mb-4 text-lg leading-relaxed">גננות ומורים יכולים להראות או להדפיס את המסר הקצר הזה להורים שעוד לא קוראים עברית. כל פסקה כתובה בשפת ההורים.</p>
      <div className="grid gap-4 md:grid-cols-2">{PARENT_WELCOME.map(p => <div key={p.id} className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-xl font-black" lang={p.lang} dir={p.dir}>{p.title}</h3>
        <p className="mt-2 leading-relaxed" lang={p.lang} dir={p.dir}>{p.text}</p></div>)}
      </div>
      <p className="mt-3 text-[var(--muted-foreground)]">להורים דוברי אמהרית: אפשר לבחור באמהרית בכרטיסי המילים ולהדפיס כרטיסים עם משפטים באמהרית.</p>
      <div className="mt-5 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">💛 טיפים להורים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 text-lg leading-relaxed">{PARENT_TIPS.map(x => <li key={x}>{x}</li>)}</ul>
      </div>
    </section>

    <section id="glossary" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5" aria-labelledby="glossary-h">
      <h2 id="glossary-h" className="mb-3 text-3xl font-black">📚 מילון מערכת החינוך להורים עולים</h2>
      <p className="mb-4 text-lg leading-relaxed">מונחים שהורים פוגשים בגן ובבית הספר, בהסבר קצר בעברית פשוטה ובאנגלית. ההסברים כלליים בלבד: הסדרים, מועדים ותנאים משתנים בין רשויות ובתי ספר ומשנה לשנה, ולכן כדאי תמיד לברר מול בית הספר או הרשות המקומית.</p>
      <Glossary />
    </section>

    <section id="help" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5" aria-labelledby="help-h">
      <h2 id="help-h" className="mb-3 text-3xl font-black">🤝 מתי כדאי לפנות לעזרה</h2>
      <p className="mb-3 text-lg leading-relaxed">התאקלמות בארץ חדשה לוקחת זמן, והרבה ילדים עוברים אותה בלי קושי מיוחד. כדאי לשוחח עם יועצת בית הספר או הגן, עם רופא/ת הילדים או עם פסיכולוג/ית ילדים אם:</p>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{CONSULT.map(c => <li key={c}>{c}</li>)}</ul>
      <p className="mt-3 leading-relaxed">העמוד הוא כלי חינוכי כללי. הוא לא מאבחן ולא מחליף הערכה של איש מקצוע. אם יש חשש לסכנה מיידית, פנו מיד לשירותי החירום (מד״א 101).</p>
    </section>

    {print && <PrintPreview title={`עברית לעולים — ${PRINT_TITLES[print.kind]}`} onClose={() => setPrint(null)}>{sheet}</PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד: <Link className="font-bold underline" to="/languages">שפות לילדים: מילים ראשונות בחמש שפות</Link> · <Link className="font-bold underline" to="/classroom/accepting-differences">קבלת השונה בכיתה</Link> · <Link className="font-bold underline" to="/printables/emotion-cards">כרטיסיות רגשות</Link> · <Link className="font-bold underline" to="/classroom">כל הכלים למורה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'ילד שעלה לישראל פוגש בבת אחת שפה חדשה, חברים חדשים ושגרה שלא מוכרת לו. מה שעוזר לו יותר מכול הוא תחושת ביטחון, חבר אחד לפחות ומילים ראשונות שאפשר לבקש בעזרתן את מה שצריך: לשתות, ללכת לשירותים, לומר שכואב או שלא הבנתי. הגננת והמורה יכולות להקל עליו מאוד גם בלי לדעת את שפתו.',
      'בדף הזה כרטיסי מילים בעברית עם השמעה והגייה באותיות לטיניות, ולצדן המילה ברוסית, אנגלית, צרפתית, אמהרית או ערבית, בנושאים של כיתה, ציוד, גוף, אוכל, משפחה, צבעים, מספרים, חיות, בגדים, טבע ועוד. יש משפטים לכיתה, לרגשות ולמשחק בחצר, ארבעה משחקים (התאמה, הקשבה, זיכרון וחידון הפוך), סימון ״למדתי״ לכל מילה ואלפבית עברי עם השמעה.',
      'אפשר להדפיס כרטיסי משפטי הישרדות, לוח תקשורת עם 12 תמונות, כרטיס שולחן עם השם והשפה, תעודת עברית, תוכנית ארבעה שבועות, דף אלפבית ומילון תמונות לכל נושא. להורים יש מילון קצר למונחי מערכת החינוך כמו צהרון, אסיפת הורים ותגבור. סימוני ״למדתי״ נשמרים רק בדפדפן שלכם, ושום מידע לא נשלח.',
    ]} faq={FAQ} related={[{ label: 'שפות לילדים: חמש שפות', href: '/languages' }, { label: 'קבלת השונה בכיתה', href: '/classroom/accepting-differences' }, { label: 'כרטיסיות רגשות להדפסה', href: '/printables/emotion-cards' }, { label: 'לכיתה: כל הכלים למורה', href: '/classroom' }]} /></div>
  </div>
}

import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { LANGS, LANG_CODES, languageTopics, languageTopic } from '../../data/languages'
import { TOPICS } from '../../data/languages/vocab'
import { ENGLISH_TOPIC, TOPIC_GUIDE, LANG_GUIDE } from '../../data/languages/guide'
import { ENGLISH_TOPICS, emojiFile } from '../../data/englishWords'
import { speak, hasVoice } from '../../utils/speak'
import { shuffle } from '../../utils/shuffle'
import { nearby } from '../../utils/nearby'

// /languages — all languages; /languages/:lang — topics; /languages/:lang/:topic — words with
// picture, sound and Hebrew-letter pronunciation, a picture game and printables.
// Every word is verified by scripts/lang-verify/vocab.py (Unicode CLDR + eSpeak NG).

const VERIFIED = 'המילים נלקחו ממאגר רשמי שכתבו דוברי השפה, וההגייה בעברית הופקה אוטומטית ממנוע הגייה — היא עזר בלבד.'

function Pic({ word, size = 72, eager = false }) {
  if (word.text) return <span className="block font-black leading-none text-[#1e1b4b]" style={{ fontSize: size * 0.8 }}>{word.text}</span>
  return <img src={`/print-art/words/${emojiFile(word.emoji)}.svg`} alt="" width={size} height={size} style={{ width: size, height: size }} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

// Ge'ez script: make sure a font that has it is available (most phones have one; some desktops don't).
function useScriptFont(code) {
  useEffect(() => {
    if (code !== 'am' || document.getElementById('font-ethiopic')) return
    const l = document.createElement('link')
    l.id = 'font-ethiopic'; l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@500;700&display=swap'
    document.head.appendChild(l)
  }, [code])
}

const wordFont = code => code === 'am' ? { fontFamily: '"Noto Sans Ethiopic", sans-serif' } : code === 'ar' ? { fontFamily: 'Tahoma, "Noto Naskh Arabic", sans-serif' } : undefined

function Word({ code, children, size, className = '' }) {
  return <b lang={code} dir={LANGS[code].dir} className={className} style={{ ...(size ? { fontSize: size } : {}), ...wordFont(code) }}>{children}</b>
}

// Teaching notes (data/languages/guide.js) write `{key}` for a word: shown as the word in its script
// plus its Hebrew-letter pronunciation, or the Hebrew meaning when this language has no such word.
const HEBREW = Object.fromEntries(TOPICS.flatMap(t => t.items.map(([key, he]) => [key, he])))
const wordCache = {}
const wordsOf = code => (wordCache[code] ||= Object.fromEntries(languageTopics(code).flatMap(t => t.words.map(w => [w.key, w]))))
const plain = (text, code) => text.replace(/\{([^}]+)\}/g, (_, k) => { const w = wordsOf(code)[k]; return w ? `${w.word} (${w.say})` : HEBREW[k] || k })
function Rich({ text, code }) {
  return text.split(/\{([^}]+)\}/).map((part, i) => {
    if (i % 2 === 0) return part
    const w = wordsOf(code)[part]
    return w ? <span key={i}><Word code={code}>{w.word}</Word> ({w.say})</span> : HEBREW[part] || part
  })
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

function CardsPages({ code, topic, withHebrew }) {
  return chunk(topic.words, 6).map((part, i) => <article className="buga-a4" key={i}>
    <h2>{topic.title} {LANGS[code].adj} · {topic.emoji}</h2>
    <div className="grid w-full flex-1 grid-cols-2 grid-rows-3 gap-0 border-2 border-dashed border-slate-400">
      {part.map(word => <div key={word.key} className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-400 p-2 text-center">
        <Pic word={word} size={110} eager />
        <Word code={code} size={34}>{word.word}</Word>
        {withHebrew && <span style={{ fontSize: 16 }}>{word.he} · {word.say}</span>}
      </div>)}
    </div>
    <footer>גוזרים לאורך הקווים · עוגה בוגה · ugabuga.co.il</footer>
  </article>)
}

function MemoryPages({ code, topic }) {
  return chunk(topic.words, 6).map((part, i) => <article className="buga-a4" key={i}>
    <h2>משחק זיכרון {LANGS[code].adj} — {topic.title}</h2>
    <div className="grid w-full flex-1 grid-cols-3 grid-rows-4 border-2 border-dashed border-slate-400">
      {part.flatMap(word => [
        <div key={word.key + '-p'} className="flex items-center justify-center border border-dashed border-slate-400 p-2"><Pic word={word} size={92} eager /></div>,
        <div key={word.key + '-w'} className="flex items-center justify-center border border-dashed border-slate-400 p-2 text-center"><Word code={code} size={30}>{word.word}</Word></div>,
      ])}
    </div>
    <footer>גוזרים, הופכים ומחפשים זוג: תמונה + מילה · עוגה בוגה · ugabuga.co.il</footer>
  </article>)
}

function MatchPages({ code, topic }) {
  return chunk(topic.words, 6).map((part, i) => {
    const words = part.length > 2 ? [...part.slice(2), ...part.slice(0, 2)] : [...part].reverse()
    return <article className="buga-a4" key={i}>
      <h2>מתחו קו מהתמונה למילה — {topic.title} {LANGS[code].adj}</h2>
      <p style={{ margin: '0 0 10px' }}>שם: ____________________</p>
      <div className="grid w-full flex-1 grid-cols-2 items-center gap-x-24" style={{ gridTemplateRows: `repeat(${part.length}, 1fr)` }}>
        {part.map((word, k) => [
          <div key={'p' + k} className="flex items-center justify-start gap-4" style={{ gridColumn: 1, gridRow: k + 1 }}><Pic word={word} size={78} eager /><span className="text-3xl">●</span></div>,
          <div key={'w' + k} className="flex items-center justify-end gap-4" style={{ gridColumn: 2, gridRow: k + 1 }}><span className="text-3xl">●</span><Word code={code} size={30}>{words[k].word}</Word></div>,
        ])}
      </div>
      <footer>עוגה בוגה · ugabuga.co.il</footer>
    </article>
  })
}

function PictureGame({ code, topic, say, voice = true }) {
  const ROUNDS = 10
  const makeRound = () => {
    const answer = topic.words[Math.floor(Math.random() * topic.words.length)]
    // never two identical pictures (hello/goodbye share 👋): each option needs its own picture
    const pic = w => w.emoji || w.text
    const seen = new Set([pic(answer)])
    const others = shuffle(topic.words.filter(x => x !== answer)).filter(x => !seen.has(pic(x)) && seen.add(pic(x))).slice(0, 3)
    return { answer, options: shuffle([answer, ...others]) }
  }
  const [round, setRound] = useState(makeRound)
  const [n, setN] = useState(0), [score, setScore] = useState(0), [picked, setPicked] = useState(null)
  const choose = opt => { if (picked) return; setPicked(opt); if (opt === round.answer) setScore(s => s + 1) }
  const next = () => { setPicked(null); setN(x => x + 1); const r = makeRound(); setRound(r); say(r.answer) }
  const restart = () => { setScore(0); setN(0); setPicked(null); setRound(makeRound()) }
  if (n >= ROUNDS) return <div className="py-6 text-center">
    <p className="text-6xl">{score >= 8 ? '🏆' : score >= 5 ? '🌟' : '👍'}</p>
    <p className="mt-2 text-3xl font-black">{score} מתוך {ROUNDS}</p>
    <button type="button" onClick={restart} className="mt-4 min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🔄 משחק חדש</button>
  </div>
  return <div className="text-center">
    <div className="mb-2 flex justify-between text-sm font-bold"><span>שאלה {n + 1} מתוך {ROUNDS}</span><span>⭐ {score}</span></div>
    <p className="text-lg">איזו תמונה היא…</p>
    <button type="button" onClick={() => say(round.answer)} className="my-2 inline-flex min-h-[56px] flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-6 py-1" aria-label={voice ? `שמעו: ${round.answer.word}` : `${round.answer.word} — ${round.answer.say}`}>
      <span className="text-4xl"><Word code={code}>{round.answer.word}</Word>{voice && <> <span className="text-2xl" aria-hidden="true">🔊</span></>}</span>
      <span className="text-sm text-[var(--muted-foreground)]">{round.answer.say}</span>
    </button>
    <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-3">
      {round.options.map(opt => {
        const state = !picked ? '' : opt === round.answer ? 'border-emerald-500 bg-emerald-100' : opt === picked ? 'border-rose-500 bg-rose-100' : 'opacity-50'
        return <button key={opt.key} type="button" onClick={() => choose(opt)} aria-label={opt.he}
          className={`flex min-h-[120px] items-center justify-center rounded-2xl border-4 border-slate-200 bg-white p-3 ${state}`}><Pic word={opt} size={84} /></button>
      })}
    </div>
    {picked && <div className="mt-4">
      <p className="text-xl font-bold">{picked === round.answer ? '✅ נכון!' : <>❌ זה <Word code={code}>{round.answer.word}</Word> — {round.answer.he}</>}</p>
      <button type="button" onClick={next} className="mt-3 min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">{n + 1 >= ROUNDS ? 'לתוצאה 🏁' : 'הבא ←'}</button>
    </div>}
  </div>
}

// ——— המבחן הגדול: 12 שאלות מכל הנושאים, עם ניקוד שמעודד ילדים ———
const CHEERS = ['מעולה! 🎉', 'וואו, נכון! ⭐', 'אלופים! 💪', 'בול! 👏', 'כל הכבוד! 🌟']
const QUIZ_LEN = 12
const POINTS = 10, STREAK_BONUS = 5

function allWords(code) {
  const seen = new Set()
  const out = []
  for (const t of languageTopics(code)) for (const w of t.words) if (!seen.has(w.key)) { seen.add(w.key); out.push(w) }
  return out
}

// Three question shapes, mixed: picture→word, word→picture, word→Hebrew meaning.
function makeQuiz(code) {
  const words = allWords(code)
  const pic = w => w.emoji || w.text
  const picked = shuffle(words).slice(0, QUIZ_LEN)
  return picked.map((answer, i) => {
    const kind = ['pic', 'word', 'he'][i % 3]
    const seenPic = new Set([pic(answer)]), seenHe = new Set([answer.he])
    const others = shuffle(words.filter(x => x.key !== answer.key))
      .filter(x => kind === 'word' ? (!seenPic.has(pic(x)) && seenPic.add(pic(x))) : (!seenHe.has(x.he) && seenHe.add(x.he)))
      .slice(0, 3)
    return { kind, answer, options: shuffle([answer, ...others]) }
  })
}

export function LanguageQuiz() {
  const { lang: code } = useParams()
  const L = LANGS[code]
  const voice = useVoice(code || 'fr')
  useScriptFont(code)
  const [quiz, setQuiz] = useState(() => (L ? { code, items: makeQuiz(code) } : null))
  const [n, setN] = useState(0)
  const [points, setPoints] = useState(0)
  const [right, setRight] = useState(0)
  const [streak, setStreak] = useState(0)
  const [picked, setPicked] = useState(null)
  const [cheer, setCheer] = useState('')
  if (!L) return <Navigate to="/languages" replace />
  // Moving between languages keeps the component mounted — deal that language's own quiz.
  if (!quiz || quiz.code !== code) { setQuiz({ code, items: makeQuiz(code) }); setN(0); setPoints(0); setRight(0); setStreak(0); setPicked(null); setCheer(''); return null }
  const q = quiz.items[n]
  const done = n >= QUIZ_LEN
  const say = word => speak(word.word, L.speech, { rate: 0.8 })
  const restart = () => { setQuiz({ code, items: makeQuiz(code) }); setN(0); setPoints(0); setRight(0); setStreak(0); setPicked(null); setCheer('') }
  const choose = opt => {
    if (picked || done) return
    setPicked(opt)
    if (opt.key === q.answer.key) {
      const bonus = streak + 1 >= 3 ? STREAK_BONUS : 0
      setPoints(p => p + POINTS + bonus)
      setRight(r => r + 1)
      setStreak(s => s + 1)
      setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)] + (bonus ? ' 🔥 בונוס רצף!' : ''))
    } else {
      setStreak(0)
      setCheer('')
    }
  }
  const next = () => { setPicked(null); setCheer(''); setN(x => x + 1) }
  const maxPoints = QUIZ_LEN * POINTS + (QUIZ_LEN - 2) * STREAK_BONUS
  const medal = points >= maxPoints * 0.75 ? ['🏆', 'אלופי השפות! תוצאה מדהימה!'] : points >= maxPoints * 0.45 ? ['🌟', 'יפה מאוד! אתם בדרך הנכונה!'] : ['💪', 'כל הכבוד שניסיתם! עוד מבחן קטן ותהיו אלופים']
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`מבחן ${L.name} לילדים — חידון מילים עם ניקוד`} description={`מבחן ${L.name} אינטראקטיבי לילדים: ${QUIZ_LEN} שאלות עם תמונות וקול, נקודות, בונוס רצף והמון עידוד. בחינם, בלי הרשמה.`} path={`/languages/${code}/quiz`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שפות לילדים', href: '/languages' }, { label: L.name, href: `/languages/${code}` }, { label: 'המבחן הגדול' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">{L.emoji} המבחן הגדול {L.adj}</h1>
    <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">{QUIZ_LEN} שאלות מכל הנושאים. כל תשובה נכונה = {POINTS} נקודות, ו-3 נכונות ברצף נותנות בונוס 🔥</p>
    {!voice && <NoVoice code={code} />}

    <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 text-center sketch-shadow">
      {done ? <div className="py-6">
        <div className="text-7xl">{medal[0]}</div>
        <p className="mt-3 text-3xl font-black">{points} נקודות!</p>
        <p className="mt-1 text-xl">{right} תשובות נכונות מתוך {QUIZ_LEN}</p>
        <p className="mt-2 text-lg font-bold">{medal[1]}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={restart} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🔄 עוד מבחן (שאלות חדשות)</button>
          <Link to={`/languages/${code}`} className="inline-flex min-h-[52px] items-center rounded-2xl border-2 border-slate-800 bg-white px-6 text-lg font-bold">📚 ללמוד עוד מילים</Link>
        </div>
      </div> : <>
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>שאלה {n + 1} מתוך {QUIZ_LEN}</span>
          <span>{streak >= 3 ? '🔥 ' : ''}⭐ {points} נק׳</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full border border-[var(--border)] bg-white"><div className="h-full bg-pink-500 transition-all" style={{ width: `${n / QUIZ_LEN * 100}%` }} /></div>

        {q.kind === 'pic' && <>
          <p className="text-xl font-bold">איך אומרים את זה {L.adj}?</p>
          <div className="my-3 flex justify-center"><Pic word={q.answer} size={96} eager /></div>
          <p className="mb-3 text-lg">({q.answer.he})</p>
          <div className="mx-auto grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map(opt => {
              const state = !picked ? 'bg-white' : opt.key === q.answer.key ? 'border-emerald-500 bg-emerald-100' : opt.key === picked.key ? 'border-rose-400 bg-rose-50' : 'bg-white opacity-50'
              return <button key={opt.key} type="button" onClick={() => choose(opt)} className={`min-h-[56px] rounded-2xl border-[3px] border-slate-300 px-3 text-xl font-bold ${state}`}>
                <Word code={code}>{opt.word}</Word>{picked && <span className="block text-sm font-normal text-[var(--muted-foreground)]">{opt.say}</span>}
              </button>
            })}
          </div>
        </>}

        {q.kind === 'word' && <>
          <p className="text-xl font-bold">איזו תמונה מתאימה למילה…</p>
          <button type="button" onClick={() => say(q.answer)} className="my-3 inline-flex min-h-[56px] flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-6 py-1">
            <span className="text-4xl"><Word code={code}>{q.answer.word}</Word>{voice && <> <span className="text-2xl" aria-hidden="true">🔊</span></>}</span>
            <span className="text-sm text-[var(--muted-foreground)]">{q.answer.say}</span>
          </button>
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
            {q.options.map(opt => {
              const state = !picked ? '' : opt.key === q.answer.key ? 'border-emerald-500 bg-emerald-100' : opt.key === picked.key ? 'border-rose-400 bg-rose-50' : 'opacity-50'
              return <button key={opt.key} type="button" onClick={() => choose(opt)} aria-label={opt.he} className={`flex min-h-[110px] items-center justify-center rounded-2xl border-4 border-slate-200 bg-white p-3 ${state}`}><Pic word={opt} size={76} /></button>
            })}
          </div>
        </>}

        {q.kind === 'he' && <>
          <p className="text-xl font-bold">מה הפירוש בעברית?</p>
          <button type="button" onClick={() => say(q.answer)} className="my-3 inline-flex min-h-[56px] flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-6 py-1">
            <span className="text-4xl"><Word code={code}>{q.answer.word}</Word>{voice && <> <span className="text-2xl" aria-hidden="true">🔊</span></>}</span>
            <span className="text-sm text-[var(--muted-foreground)]">{q.answer.say}</span>
          </button>
          <div className="mx-auto grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map(opt => {
              const state = !picked ? 'bg-white' : opt.key === q.answer.key ? 'border-emerald-500 bg-emerald-100' : opt.key === picked.key ? 'border-rose-400 bg-rose-50' : 'bg-white opacity-50'
              return <button key={opt.key} type="button" onClick={() => choose(opt)} className={`min-h-[56px] rounded-2xl border-[3px] border-slate-300 px-3 text-xl font-bold ${state}`}>{opt.he}</button>
            })}
          </div>
        </>}

        {picked && <div className="mt-4">
          <p className="text-xl font-bold" aria-live="polite">{picked.key === q.answer.key ? cheer : <>כמעט! התשובה הנכונה: <Word code={code}>{q.answer.word}</Word> — {q.answer.he}. טעויות זה חלק מהלמידה 💪</>}</p>
          <button type="button" onClick={next} className="mt-3 min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">{n + 1 >= QUIZ_LEN ? 'לתוצאה 🏁' : 'לשאלה הבאה ←'}</button>
        </div>}
      </>}
    </section>

    <SeoBody paragraphs={[
      `המבחן הגדול ${L.adj}: ${QUIZ_LEN} שאלות שמתערבבות מחדש בכל כניסה — פעם רואים תמונה ובוחרים מילה, פעם שומעים מילה ובוחרים תמונה, ופעם מתרגמים לעברית. על כל תשובה נכונה מקבלים נקודות, ורצף נכון נותן בונוס. אין "נכשל" — רק עידוד להמשיך ללמוד.`,
      VERIFIED,
    ]} faq={[
      { q: 'מה צריך לדעת לפני המבחן?', a: `שווה קודם לעבור על כמה נושאים בעמוד ${L.name} לילדים — ואז המבחן הרבה יותר כיף.` },
      { q: 'השאלות תמיד אותו דבר?', a: 'לא! בכל כניסה המבחן בוחר שאלות חדשות באקראי מכל הנושאים, אז אפשר לשחק שוב ושוב.' },
    ]} related={[{ label: `${L.name} לילדים — כל הנושאים`, href: `/languages/${code}` }, { label: 'שפות לילדים', href: '/languages' }]} />
  </div>
}

function useVoice(code) {
  const [ok, setOk] = useState(true)
  useEffect(() => { let live = true; hasVoice(LANGS[code].speech).then(v => { if (live) setOk(v) }); return () => { live = false } }, [code])
  return ok
}

function NoVoice({ code }) {
  return <p className="mx-auto mb-4 max-w-2xl rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-center text-sm">
    🔇 במכשיר הזה אין קול {LANGS[code].adj}, אז לחיצה על מילה לא תשמיע אותה. ההגייה כתובה באותיות עבריות מתחת לכל מילה. בטלפונים אפשר להוסיף קול בהגדרות: הקראת טקסט / Text-to-speech.
  </p>
}

export function LanguageTopic() {
  const { lang: code, topic: slug } = useParams()
  const L = LANGS[code]
  const topic = L && languageTopic(code, slug)
  const [withHebrew, setWithHebrew] = useState(false)
  const [printing, setPrinting] = useState(null)
  const voice = useVoice(code || 'fr')
  useScriptFont(code)
  const others = useMemo(() => (L ? languageTopics(code).filter(x => x.slug !== slug) : []), [L, code, slug])
  if (!L) return <Navigate to="/languages" replace />
  if (!topic) return <Navigate to={`/languages/${code}`} replace />
  const say = word => speak(word.word, L.speech, { rate: 0.8 })
  const examples = topic.words.slice(0, 4).map(x => `${x.word} (${x.he})`).join(', ')
  const guide = TOPIC_GUIDE[topic.slug]
  const notes = LANG_GUIDE[code].topics[topic.slug]
  // Each language shows the topic's game ideas in a different order, so the pages don't repeat each other.
  const shift = LANG_CODES.indexOf(code)
  const games = [0, 1, 2].map(k => guide.games[(shift + k) % guide.games.length])
  const next = nearby(languageTopics(code), x => x.slug === topic.slug, 3)
  const sameTopic = LANG_CODES.filter(c => c !== code && languageTopic(c, topic.slug))
  const english = ENGLISH_TOPICS.find(x => x.slug === ENGLISH_TOPIC[topic.slug])
  const faq = [
    { q: `איך אומרים ${topic.title} ${L.adj}?`, a: `${topic.words.slice(0, 6).map(x => `${x.he} — ${x.word} (${x.say})`).join('; ')}. כל ${topic.words.length} המילים, עם תמונה והגייה, בעמוד הזה.` },
    { q: plain(notes.faq[0], code), a: plain(notes.faq[1], code) },
    { q: `מה כדאי ללמוד ${L.adj} אחרי ${topic.title}?`, a: `אפשר להמשיך לנושאים ${next.map(x => `"${x.title}"`).join(', ')} — ובסוף לבדוק את עצמכם במבחן הגדול ${L.adj}, עם שאלות מכל הנושאים.` },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${topic.title} ${L.adj} לילדים — מילים עם תמונות והגייה`} description={`${topic.title} ${L.adj} לילדים: ${examples} ועוד, עם תמונה, הגייה בעברית, משחק וכרטיסיות להדפסה. חינם.`} path={`/languages/${code}/${topic.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שפות לילדים', href: '/languages' }, { label: L.name, href: `/languages/${code}` }, { label: topic.title }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">{topic.emoji} {topic.title} {L.adj}</h1>
    <p className="mx-auto mb-3 max-w-2xl text-center text-lg text-[var(--muted-foreground)]"><Rich text={notes.intro} code={code} /></p>
    {L.note && <p className="mx-auto mb-3 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">{L.note}</p>}
    {!voice && <NoVoice code={code} />}

    {/* No voice on this device: don't promise sound the cards can't make. */}
    <p className="mb-3 text-center font-bold">{voice ? '👆 לוחצים על כרטיס כדי לשמוע את המילה' : '🔤 ההגייה כתובה מתחת לכל מילה'}</p>
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {topic.words.map(word => <button key={word.key} type="button" onClick={() => say(word)} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5" aria-label={voice ? `${word.word} — ${word.he}. לחצו לשמוע` : `${word.word} — ${word.he}. נשמע: ${word.say}`}>
        <Pic word={word} size={72} />
        <span className="mt-2 text-2xl"><Word code={code}>{word.word}</Word>{voice && <> <span className="text-base" aria-hidden="true">🔊</span></>}</span>
        <span className="text-sm text-[var(--muted-foreground)]">נשמע: {word.say}</span>
        <span className="font-bold">{word.he}</span>
      </button>)}
    </div>

    <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow">
      <h2 className="mb-3 text-center text-2xl">🎮 משחק: מצאו את התמונה</h2>
      <PictureGame key={code + topic.slug} code={code} topic={topic} say={say} voice={voice} />
    </section>

    <section className="mb-10 grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-2xl">🗣️ הגייה ודקדוק: {topic.title} {L.adj}</h2>
        <ul className="list-disc space-y-2 pr-5 leading-relaxed">
          {notes.sounds.map((x, i) => <li key={i}><Rich text={x} code={code} /></li>)}
        </ul>
      </div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-2xl">🎲 משחקים לתרגול המילים</h2>
        <p className="mb-3 leading-relaxed text-[var(--muted-foreground)]">{guide.why}</p>
        <ul className="space-y-2 leading-relaxed">
          {games.map(([name, how]) => <li key={name}><b>{name}:</b> <Rich text={how} code={code} /></li>)}
        </ul>
      </div>
    </section>

    <section className="mb-10 text-center">
      <h2 className="mb-3 text-2xl">🖨️ להדפסה</h2>
      <label className="mb-4 inline-flex items-center gap-2 font-bold"><input type="checkbox" checked={withHebrew} onChange={e => setWithHebrew(e.target.checked)} className="h-5 w-5" />עם תרגום והגייה בעברית על הכרטיסיות</label>
      <div className="flex flex-wrap justify-center gap-3">
        <button data-print-main type="button" onClick={() => setPrinting('cards')} className="min-h-[52px] rounded-2xl bg-pink-600 px-6 text-lg font-bold text-white">🃏 כרטיסיות תמונה ומילה</button>
        <button type="button" onClick={() => setPrinting('memory')} className="min-h-[52px] rounded-2xl border-2 border-slate-800 bg-white px-6 text-lg font-bold">🧠 משחק זיכרון</button>
        <button type="button" onClick={() => setPrinting('match')} className="min-h-[52px] rounded-2xl border-2 border-slate-800 bg-white px-6 text-lg font-bold">✏️ דף "מתחו קו"</button>
      </div>
    </section>

    <nav aria-label={`${topic.title} בשפות אחרות`} className="mb-8">
      <h2 className="mb-3 text-center text-xl">{topic.title} בשפות אחרות</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {sameTopic.map(c => <Link key={c} to={`/languages/${c}/${topic.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-1.5 font-bold">{LANGS[c].emoji} {topic.title} {LANGS[c].adj}</Link>)}
        {english && <Link to={`/english/${english.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-1.5 font-bold">🇬🇧 {english.title} באנגלית</Link>}
      </div>
    </nav>

    <nav aria-label={`עוד נושאים ${L.adj}`} className="mb-10">
      <h2 className="mb-3 text-center text-xl">עוד נושאים {L.adj}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {others.map(x => <Link key={x.slug} to={`/languages/${code}/${x.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-1.5 font-bold">{x.emoji} {x.title}</Link>)}
        <Link to={`/languages/${code}/quiz`} className="rounded-full border-2 border-slate-800 bg-yellow-200 px-4 py-1.5 font-bold">📝 המבחן הגדול {L.adj}</Link>
        <Link to="/languages" className="rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-1.5 font-bold">🌍 שפות נוספות</Link>
      </div>
    </nav>

    <SeoBody faq={faq} related={[...next.map(x => ({ label: `${x.title} ${L.adj}`, href: `/languages/${code}/${x.slug}` })), { label: `המבחן הגדול ${L.adj}`, href: `/languages/${code}/quiz` }, { label: `${L.name} לילדים — כל הנושאים`, href: `/languages/${code}` }]} />

    {printing && <PrintPreview title={`${topic.title} ${L.adj}`} onClose={() => setPrinting(null)}>
      {printing === 'cards' ? <CardsPages code={code} topic={topic} withHebrew={withHebrew} /> : printing === 'memory' ? <MemoryPages code={code} topic={topic} /> : <MatchPages code={code} topic={topic} />}
    </PrintPreview>}
  </div>
}

export function LanguageHome() {
  const { lang: code } = useParams()
  const L = LANGS[code]
  useScriptFont(code)
  if (!L) return <Navigate to="/languages" replace />
  const topics = languageTopics(code)
  const total = topics.reduce((n, x) => n + x.words.length, 0)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${L.name} לילדים — מילים ראשונות עם תמונות והגייה`} description={`${L.name} לילדים בחינם: ${total} מילים ראשונות ב-${topics.length} נושאים — מילות נימוס, צבעים, מספרים, חיות ועוד — עם תמונה, הגייה בעברית, משחק וכרטיסיות להדפסה.`} path={`/languages/${code}`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שפות לילדים', href: '/languages' }, { label: L.name }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">{L.emoji} {L.name} לילדים</h1>
    <p className="mx-auto mb-2 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מילים ראשונות {L.adj}: שלום {L.adj} זה <Word code={code}>{L.hello}</Word>. בכל נושא — תמונה, קול, הגייה בעברית, משחק ודפים להדפסה.</p>
    {L.note && <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">{L.note}</p>}
    <p className="mt-4 text-center">
      <Link to={`/languages/${code}/quiz`} className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-pink-600 px-7 text-xl font-bold text-white shadow-[0_4px_0_rgba(20,30,60,.2)] transition hover:-translate-y-0.5">📝 למבחן הגדול {L.adj} — עם נקודות ובונוסים!</Link>
    </p>
    <div className="mb-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {topics.map(x => <Link key={x.slug} to={`/languages/${code}/${x.slug}`} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5">
        <Pic word={x.words.find(w => w.emoji) || x.words[0]} size={64} />
        <b className="mt-2 text-xl">{x.title}</b>
        <span className="text-sm text-[var(--muted-foreground)]">{x.words.slice(0, 3).map(w => <Word key={w.key} code={code} className="font-normal">{w.word} </Word>)}</span>
      </Link>)}
    </div>
    <section className="mb-8 max-w-3xl">
      <h2 className="mb-3 text-2xl">מה מיוחד ב{L.name}?</h2>
      {LANG_GUIDE[code].about.map((x, i) => <p key={i} className="mb-3 leading-relaxed"><Rich text={x} code={code} /></p>)}
    </section>
    <SeoBody paragraphs={[
      `${total} מילים ראשונות ${L.adj} לילדים, לפי נושאים. כל מילה עם תמונה, תרגום והגייה באותיות עבריות, ואפשר ללחוץ ולשמוע אותה. בכל נושא יש גם הערות הגייה ודקדוק, רעיונות למשחקים בבית ובכיתה, משחק תמונות ודפים להדפסה: כרטיסיות, משחק זיכרון ודף "מתחו קו".`,
      VERIFIED + ' לוחצים על כרטיס והמכשיר מקריא את המילה — אם מותקן בו קול לשפה; אם לא, ההגייה כתובה באותיות עבריות.',
    ]} faq={[{ q: 'מאיזה גיל?', a: 'מגיל 4 עם התמונות והקול. לא צריך לדעת לקרוא — רואים תמונה ושומעים את המילה.' }, { q: 'זה בחינם?', a: 'כן, הכול בחינם ובלי הרשמה.' }]} related={[{ label: 'שפות לילדים', href: '/languages' }, { label: 'אנגלית לילדים', href: '/english' }]} />
  </div>
}

export function LanguagesHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שפות לילדים — מילים ראשונות בצרפתית, ספרדית, רוסית, ערבית ואמהרית" description="מילים ראשונות לילדים ב-6 שפות: אנגלית, צרפתית, ספרדית, רוסית, ערבית ואמהרית — עם תמונה, הגייה בעברית, משחק וכרטיסיות להדפסה. חינם." path="/languages" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שפות לילדים' }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">🌍 שפות לילדים</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מילים ראשונות בשש שפות — לסבא וסבתא שמדברים רוסית או אמהרית, לטיול לחו״ל, או סתם בשביל הכיף. עם תמונה, קול, הגייה בעברית, דפים להדפסה — ובכל שפה מחכה המבחן הגדול עם נקודות ובונוסים 📝</p>
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Link to="/english" className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5">
        <span className="text-5xl">🇬🇧</span><b className="mt-2 text-2xl">אנגלית</b><span dir="ltr" className="text-[var(--muted-foreground)]">hello</span>
      </Link>
      {LANG_CODES.map(code => <Link key={code} to={`/languages/${code}`} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5">
        <span className="text-5xl">{LANGS[code].emoji}</span><b className="mt-2 text-2xl">{LANGS[code].name}</b>
        <span className="text-[var(--muted-foreground)]"><Word code={code} className="font-normal">{LANGS[code].hello}</Word></span>
      </Link>)}
    </div>
    <SeoBody paragraphs={[
      'בכל שפה אותם נושאים: מילות נימוס, צבעים, מספרים מ-1 עד 10, חיות, אוכל, הגוף, דברים בבית וברחוב, טבע, בגדים, אנשים, בית ספר, ירקות ומתוקים ומשחקים. כך אפשר ללמוד את אותה מילה בכמה שפות, ולהשוות. כל מילה נבדקת מול השמות שדוברי השפה עצמם נותנים לתמונה שלה.',
      VERIFIED + ' בערבית המילים בערבית ספרותית, עם ניקוד.',
    ]} faq={[{ q: 'למה אין שפת סימנים?', a: 'שפת סימנים צריכה איורים או סרטונים מדויקים של כל סימן, וסימן לא מדויק מלמד טעות. נוסיף אותה רק עם מקור מוסמך.' }]} related={[{ label: 'אנגלית לילדים', href: '/english' }, { label: 'אותיות באנגלית', href: '/abc' }]} />
  </div>
}

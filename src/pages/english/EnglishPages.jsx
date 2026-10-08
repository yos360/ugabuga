import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { ENGLISH_TOPICS, englishTopic, emojiFile } from '../../data/englishWords'
import { ENGLISH_GUIDE } from '../../data/englishGuide'
import { LANGS, LANG_CODES, languageTopic } from '../../data/languages'
import { speak } from '../../utils/speak'
import { shuffle } from '../../utils/shuffle'
import { nearby } from '../../utils/nearby'

// /english — hub; /english/:topic — words with pictures and sound, a picture-matching game and three
// printables (word cards, memory-game pairs, a draw-a-line worksheet).

const sayIt = word => speak(word.en, 'en-US')

// Picture of a word: vector emoji art (sharp on screen and on paper), or big text for numbers and days.
function Pic({ word, size = 72, eager = false }) {
  if (word.text) return <span className="block font-black leading-none text-[#1e1b4b]" style={{ fontSize: size * 0.8 }} dir="rtl">{word.text}</span>
  return <img src={`/print-art/words/${emojiFile(word.emoji)}.svg`} alt="" width={size} height={size} style={{ width: size, height: size }} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

// Teaching notes (data/englishGuide.js) write `{word}` for an English word: shown with its Hebrew-letter
// pronunciation. The current topic's words come first (orange is both a color and a fruit).
const findWord = (topic, en) => topic.words.find(w => w.en === en) || ENGLISH_TOPICS.flatMap(t => t.words).find(w => w.en === en)
const plain = (text, topic) => text.replace(/\{([^}]+)\}/g, (_, k) => { const w = findWord(topic, k); return w ? `${w.en} (${w.say})` : k })
function Rich({ text, topic }) {
  return text.split(/\{([^}]+)\}/).map((part, i) => {
    if (i % 2 === 0) return part
    const w = findWord(topic, part)
    return w ? <span key={i}><b dir="ltr">{w.en}</b> ({w.say})</span> : part
  })
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

function CardsPages({ topic, withHebrew }) {
  return chunk(topic.words, 6).map((part, i) => <article className="buga-a4" key={i}>
    <h2>{topic.title} באנגלית · {topic.emoji}</h2>
    <div className="grid w-full flex-1 grid-cols-2 grid-rows-3 gap-0 border-2 border-dashed border-slate-400">
      {part.map(word => <div key={word.en} className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-400 p-2 text-center">
        <Pic word={word} size={110} eager />
        <b dir="ltr" style={{ fontSize: 34 }}>{word.en}</b>
        {withHebrew && <span style={{ fontSize: 16 }}>{word.he} · {word.say}</span>}
      </div>)}
    </div>
    <footer>גוזרים לאורך הקווים · עוגה בוגה · ugabuga.co.il</footer>
  </article>)
}

function MemoryPages({ topic }) {
  // Two cards per word: one picture, one word. 6 words = 12 cards per page.
  return chunk(topic.words, 6).map((part, i) => <article className="buga-a4" key={i}>
    <h2>משחק זיכרון באנגלית — {topic.title}</h2>
    <div className="grid w-full flex-1 grid-cols-3 grid-rows-4 border-2 border-dashed border-slate-400">
      {part.flatMap(word => [
        <div key={word.en + '-p'} className="flex items-center justify-center border border-dashed border-slate-400 p-2"><Pic word={word} size={92} eager /></div>,
        <div key={word.en + '-w'} className="flex items-center justify-center border border-dashed border-slate-400 p-2 text-center"><b dir="ltr" style={{ fontSize: 30 }}>{word.en}</b></div>,
      ])}
    </div>
    <footer>גוזרים, הופכים ומחפשים זוג: תמונה + מילה · עוגה בוגה · ugabuga.co.il</footer>
  </article>)
}

function MatchPages({ topic }) {
  return chunk(topic.words, 6).map((part, i) => {
    // Fixed order (not random): the preview and the printed copy render separately and must match.
    const words = part.length > 2 ? [...part.slice(2), ...part.slice(0, 2)] : [...part].reverse()
    return <article className="buga-a4" key={i}>
      <h2>מתחו קו מהתמונה למילה — {topic.title} באנגלית</h2>
      <p style={{ margin: '0 0 10px' }}>שם: ____________________</p>
      <div className="grid w-full flex-1 grid-cols-2 items-center gap-x-24" style={{ gridTemplateRows: `repeat(${part.length}, 1fr)` }}>
        {part.map((word, k) => [
          <div key={'p' + k} className="flex items-center justify-start gap-4" style={{ gridColumn: 1, gridRow: k + 1 }}><Pic word={word} size={78} eager /><span className="text-3xl">●</span></div>,
          <div key={'w' + k} className="flex items-center justify-end gap-4" style={{ gridColumn: 2, gridRow: k + 1 }}><span className="text-3xl">●</span><b dir="ltr" style={{ fontSize: 30 }}>{words[k].en}</b></div>,
        ])}
      </div>
      <footer>עוגה בוגה · ugabuga.co.il</footer>
    </article>
  })
}

function PictureGame({ topic }) {
  const ROUNDS = 10
  const makeRound = () => {
    const answer = topic.words[Math.floor(Math.random() * topic.words.length)]
    const others = shuffle(topic.words.filter(x => x !== answer)).slice(0, 3)
    return { answer, options: shuffle([answer, ...others]) }
  }
  const [round, setRound] = useState(makeRound)
  const [n, setN] = useState(0), [score, setScore] = useState(0), [picked, setPicked] = useState(null)
  const done = n >= ROUNDS
  const choose = opt => {
    if (picked) return
    setPicked(opt)
    if (opt === round.answer) setScore(s => s + 1)
  }
  const next = () => { setPicked(null); setN(x => x + 1); const r = makeRound(); setRound(r); sayIt(r.answer) }
  const restart = () => { setScore(0); setN(0); setPicked(null); const r = makeRound(); setRound(r) }
  if (done) return <div className="py-6 text-center">
    <p className="text-6xl">{score >= 8 ? '🏆' : score >= 5 ? '🌟' : '👍'}</p>
    <p className="mt-2 text-3xl font-black">{score} מתוך {ROUNDS}</p>
    <p className="mt-1 text-lg">{score >= 8 ? 'Excellent! מעולה!' : score >= 5 ? 'Very good! יפה מאוד!' : 'Good try! עוד סיבוב?'}</p>
    <button type="button" onClick={restart} className="mt-4 min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🔄 משחק חדש</button>
  </div>
  return <div className="text-center">
    <div className="mb-2 flex justify-between text-sm font-bold"><span>שאלה {n + 1} מתוך {ROUNDS}</span><span>⭐ {score}</span></div>
    <p className="text-lg">איזו תמונה היא…</p>
    <button type="button" onClick={() => sayIt(round.answer)} className="my-2 inline-flex min-h-[56px] items-center gap-3 rounded-2xl border-2 border-slate-800 bg-white px-6 text-4xl font-black" dir="ltr" aria-label={`שמעו: ${round.answer.en}`}>{round.answer.en} <span className="text-2xl" aria-hidden="true">🔊</span></button>
    <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-3">
      {round.options.map(opt => {
        const state = !picked ? '' : opt === round.answer ? 'border-emerald-500 bg-emerald-100' : opt === picked ? 'border-rose-500 bg-rose-100' : 'opacity-50'
        return <button key={opt.en} type="button" onClick={() => choose(opt)} aria-label={opt.he}
          className={`flex min-h-[120px] items-center justify-center rounded-2xl border-4 border-slate-200 bg-white p-3 ${state}`}><Pic word={opt} size={84} /></button>
      })}
    </div>
    {picked && <div className="mt-4">
      <p className="text-xl font-bold">{picked === round.answer ? '✅ נכון!' : `❌ זה ${round.answer.en} — ${round.answer.he}`}</p>
      <button type="button" onClick={next} className="mt-3 min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">{n + 1 >= ROUNDS ? 'לתוצאה 🏁' : 'הבא ←'}</button>
    </div>}
  </div>
}

export function EnglishTopic() {
  const { topic: slug } = useParams()
  const topic = englishTopic(slug)
  const [withHebrew, setWithHebrew] = useState(false)
  const [printing, setPrinting] = useState(null)
  const others = useMemo(() => ENGLISH_TOPICS.filter(x => x.slug !== slug), [slug])
  if (!topic) return <Navigate to="/english" replace />
  const examples = topic.words.slice(0, 4).map(x => `${x.en} (${x.he})`).join(', ')
  const guide = ENGLISH_GUIDE[topic.slug]
  const next = nearby(ENGLISH_TOPICS, x => x.slug === topic.slug, 3)
  const inLanguages = guide.lang ? LANG_CODES.filter(c => languageTopic(c, guide.lang)) : []
  const langTitle = guide.lang && inLanguages.length ? languageTopic(inLanguages[0], guide.lang).title : ''
  const faq = [
    { q: `איך אומרים ${topic.title} באנגלית?`, a: `${topic.words.slice(0, 6).map(x => `${x.he} — ${x.en} (${x.say})`).join('; ')}. כל ${topic.words.length} המילים, עם תמונה, קול והגייה, בעמוד הזה.` },
    ...guide.faq.map(([q, a]) => ({ q: plain(q, topic), a: plain(a, topic) })),
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${topic.title} באנגלית לילדים — כרטיסיות להדפסה ומשחק`} description={`${topic.title} באנגלית לילדים עם תמונות והגייה: ${examples} ועוד. משחק תמונות, כרטיסיות ומשחק זיכרון להדפסה בחינם.`} path={`/english/${topic.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אנגלית לילדים', href: '/english' }, { label: topic.title }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">{topic.emoji} {topic.title} באנגלית</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{topic.intro}</p>

    <p className="mb-3 text-center font-bold">👆 לוחצים על כרטיס כדי לשמוע את המילה</p>
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {topic.words.map(word => <button key={word.en} type="button" onClick={() => sayIt(word)} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5" aria-label={`${word.en} — ${word.he}. לחצו לשמוע`}>
        <Pic word={word} size={72} />
        <b className="mt-2 text-2xl" dir="ltr">{word.en} <span className="text-base" aria-hidden="true">🔊</span></b>
        <span className="text-sm text-[var(--muted-foreground)]">נשמע: {word.say}</span>
        <span className="font-bold">{word.he}</span>
      </button>)}
    </div>

    <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow">
      <h2 className="mb-3 text-center text-2xl">🎮 משחק: מצאו את התמונה</h2>
      <PictureGame key={topic.slug} topic={topic} />
    </section>

    <section className="mb-10 grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-2xl">🗣️ איך מבטאים: {topic.title} באנגלית</h2>
        <ul className="list-disc space-y-2 pr-5 leading-relaxed">
          {guide.sounds.map((x, i) => <li key={i}><Rich text={x} topic={topic} /></li>)}
        </ul>
      </div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h2 className="mb-2 text-2xl">🎲 משחקים עם המילים</h2>
        <p className="mb-3 leading-relaxed text-[var(--muted-foreground)]"><Rich text={guide.why} topic={topic} /></p>
        <ul className="space-y-2 leading-relaxed">
          {guide.games.map(([name, how]) => <li key={name}><b>{name}:</b> {how}</li>)}
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

    {inLanguages.length > 0 && <nav aria-label={`${langTitle} בשפות נוספות`} className="mb-8">
      <h2 className="mb-3 text-center text-xl">{langTitle} בשפות נוספות</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {inLanguages.map(c => <Link key={c} to={`/languages/${c}/${guide.lang}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-1.5 font-bold">{LANGS[c].emoji} {langTitle} {LANGS[c].adj}</Link>)}
      </div>
    </nav>}

    <nav aria-label="עוד נושאים באנגלית" className="mb-10">
      <h2 className="mb-3 text-center text-xl">עוד נושאים באנגלית</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {others.map(x => <Link key={x.slug} to={`/english/${x.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-1.5 font-bold">{x.emoji} {x.title}</Link>)}
        <Link to="/abc" className="rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-1.5 font-bold">🔤 אותיות A–Z</Link>
      </div>
    </nav>

    <SeoBody faq={faq} related={[...next.map(x => ({ label: `${x.title} באנגלית`, href: `/english/${x.slug}` })), { label: 'אנגלית לילדים — כל הנושאים', href: '/english' }]} />

    {printing && <PrintPreview title={`${topic.title} באנגלית`} onClose={() => setPrinting(null)}>
      {printing === 'cards' ? <CardsPages topic={topic} withHebrew={withHebrew} /> : printing === 'memory' ? <MemoryPages topic={topic} /> : <MatchPages topic={topic} />}
    </PrintPreview>}
  </div>
}

const HUB_FAQ = [
  { q: 'איך מלמדים ילדים מילים באנגלית?', a: 'מעט מילים בכל פעם (4–6), הרבה חזרות קצרות, ותמיד עם תמונה וקול. לוחצים על כרטיס כדי לשמוע את המילה, משחקים במשחק התמונות, ומדפיסים כרטיסיות למשחק זיכרון.' },
  { q: 'איך יודעים איך לבטא את המילה?', a: 'לוחצים על הכרטיס והמכשיר מקריא את המילה באנגלית. מתחת לכל מילה כתוב גם איך היא נשמעת באותיות עבריות — כעזרה בלבד, כי יש צלילים באנגלית שאין בעברית, כמו th ו-w.' },
  { q: 'מה אפשר להדפיס?', a: 'בכל נושא שלושה דפים: כרטיסיות עם תמונה ומילה (6 בדף, עם או בלי תרגום), משחק זיכרון של זוגות תמונה–מילה, ודף "מתחו קו" לכיתה.' },
  { q: 'מאיזה גיל אפשר להתחיל?', a: 'מגיל 3–4 עם הכרטיסים והקול, ובגיל 5–7 גם עם המשחק ודפי ההדפסה. אין צורך לדעת לקרוא — רואים תמונה ושומעים את המילה.' },
  { q: 'זה בחינם?', a: 'כן. כל הנושאים, המשחקים ודפי ההדפסה בחינם ובלי הרשמה.' },
]

export function EnglishHub() {
  const total = ENGLISH_TOPICS.reduce((n, x) => n + x.words.length, 0)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="אנגלית לילדים — מילים ראשונות עם תמונות, משחקים וכרטיסיות להדפסה" description={`אנגלית לילדים בחינם: ${total} מילים ראשונות ב-${ENGLISH_TOPICS.length} נושאים — צבעים, מספרים, חיות, רגשות, בגדים ועוד — עם תמונה, הגייה, משחק וכרטיסיות להדפסה.`} path="/english" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אנגלית לילדים' }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">🇬🇧 אנגלית לילדים</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מילים ראשונות באנגלית לפי נושאים — עם תמונה, קול והגייה, משחק קצר וכרטיסיות להדפסה. בלי הרשמה ובלי קורס: 10 דקות ביום מספיקות.</p>
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ENGLISH_TOPICS.map(x => <Link key={x.slug} to={`/english/${x.slug}`} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5">
        <Pic word={x.words.find(w => w.emoji) || x.words[0]} size={64} />
        <b className="mt-2 text-xl">{x.title}</b>
        <span className="text-sm text-[var(--muted-foreground)]" dir="ltr">{x.words.slice(0, 3).map(w => w.en).join(' · ')}</span>
      </Link>)}
    </div>
    <div className="mb-10 flex flex-wrap justify-center gap-3">
      <Link to="/abc" className="rounded-2xl border-2 border-slate-800 bg-[var(--postit)] px-5 py-3 font-bold">🔤 אותיות באנגלית A–Z</Link>
      <Link to="/abc/game" className="rounded-2xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">🎮 משחק אותיות באנגלית</Link>
      <Link to="/printables/letter-flashcards" className="rounded-2xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">🃏 כרטיסיות אותיות להדפסה</Link>
    </div>
    <SeoBody paragraphs={[
      'ילדים לומדים מילים באנגלית הכי טוב דרך תמונה, קול ומשחק — ולא דרך תרגום. לכן בכל נושא יש כרטיסים שאפשר ללחוץ עליהם ולשמוע את המילה, משחק קצר של התאמת מילה לתמונה, ושלושה דפים להדפסה: כרטיסיות, משחק זיכרון ודף "מתחו קו".',
      'טיפ להורים ולגננות: נושא אחד בשבוע, 10 דקות ביום. מתחילים בצבעים, מספרים וחיות, ואחר כך עוברים לרגשות, בגדים ומילים מהבית ומהכיתה. בכל נושא יש גם הערות הגייה למילים של אותו נושא ורעיונות למשחקים בבית ובכיתה.',
      'לגן ולכיתות א׳–ב׳ כדאי להדפיס את הכרטיסיות בלי תרגום — הילד מקשר בין התמונה למילה באנגלית, בלי לעבור דרך העברית. להורים שרוצים לעזור, יש אפשרות להדפיס עם תרגום והגייה.',
    ]} faq={HUB_FAQ} related={[{ label: 'אותיות באנגלית', href: '/abc' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }]} />
  </div>
}

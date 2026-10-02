import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { LANGS, LANG_CODES, languageTopics, languageTopic } from '../../data/languages'
import { emojiFile } from '../../data/englishWords'
import { speak, hasVoice } from '../../utils/speak'
import { shuffle } from '../../utils/shuffle'

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

function PictureGame({ code, topic, say }) {
  const ROUNDS = 10
  const makeRound = () => {
    const answer = topic.words[Math.floor(Math.random() * topic.words.length)]
    const others = shuffle(topic.words.filter(x => x !== answer)).slice(0, 3)
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
    <button type="button" onClick={() => say(round.answer)} className="my-2 inline-flex min-h-[56px] flex-col items-center rounded-2xl border-2 border-slate-800 bg-white px-6 py-1" aria-label={`שמעו: ${round.answer.word}`}>
      <span className="text-4xl"><Word code={code}>{round.answer.word}</Word> <span className="text-2xl" aria-hidden="true">🔊</span></span>
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
  const faq = [
    { q: `איך אומרים ${topic.title} ${L.adj}?`, a: `${topic.words.slice(0, 6).map(x => `${x.he} — ${x.word} (${x.say})`).join('; ')}. כל המילים, עם תמונה והגייה, בעמוד הזה.` },
    { q: 'איך יודעים שהמילים נכונות?', a: VERIFIED },
    { q: 'איך שומעים את המילה?', a: `לוחצים על הכרטיס, והמכשיר מקריא אותה ${L.adj} — אם מותקן בו קול לשפה. אם לא, ההגייה כתובה באותיות עבריות.` },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${topic.title} ${L.adj} לילדים — מילים עם תמונות והגייה`} description={`${topic.title} ${L.adj} לילדים: ${examples} ועוד, עם תמונה, הגייה בעברית, משחק וכרטיסיות להדפסה. חינם.`} path={`/languages/${code}/${topic.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שפות לילדים', href: '/languages' }, { label: L.name, href: `/languages/${code}` }, { label: topic.title }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">{topic.emoji} {topic.title} {L.adj}</h1>
    {L.note && <p className="mx-auto mb-3 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">{L.note}</p>}
    {!voice && <NoVoice code={code} />}

    <p className="mb-3 text-center font-bold">👆 לוחצים על כרטיס כדי לשמוע את המילה</p>
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {topic.words.map(word => <button key={word.key} type="button" onClick={() => say(word)} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5" aria-label={`${word.word} — ${word.he}. לחצו לשמוע`}>
        <Pic word={word} size={72} />
        <span className="mt-2 text-2xl"><Word code={code}>{word.word}</Word> <span className="text-base" aria-hidden="true">🔊</span></span>
        <span className="text-sm text-[var(--muted-foreground)]">נשמע: {word.say}</span>
        <span className="font-bold">{word.he}</span>
      </button>)}
    </div>

    <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow">
      <h2 className="mb-3 text-center text-2xl">🎮 משחק: מצאו את התמונה</h2>
      <PictureGame key={code + topic.slug} code={code} topic={topic} say={say} />
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

    <nav aria-label={`עוד נושאים ${L.adj}`} className="mb-10">
      <h2 className="mb-3 text-center text-xl">עוד נושאים {L.adj}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {others.map(x => <Link key={x.slug} to={`/languages/${code}/${x.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-1.5 font-bold">{x.emoji} {x.title}</Link>)}
        <Link to="/languages" className="rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-1.5 font-bold">🌍 שפות נוספות</Link>
      </div>
    </nav>

    <SeoBody paragraphs={[
      `בעמוד הזה ${topic.words.length} מילים ${L.adj} בנושא ${topic.title}, כל אחת עם תמונה, תרגום לעברית והגייה באותיות עבריות. לוחצים על כרטיס כדי לשמוע, ואז משחקים: שומעים מילה ובוחרים את התמונה.`,
      VERIFIED,
    ]} faq={faq} related={[{ label: `${L.name} לילדים — כל הנושאים`, href: `/languages/${code}` }, { label: 'שפות לילדים', href: '/languages' }, { label: 'אנגלית לילדים', href: '/english' }]} />

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
    <div className="mb-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {topics.map(x => <Link key={x.slug} to={`/languages/${code}/${x.slug}`} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5">
        <Pic word={x.words.find(w => w.emoji) || x.words[0]} size={64} />
        <b className="mt-2 text-xl">{x.title}</b>
        <span className="text-sm text-[var(--muted-foreground)]">{x.words.slice(0, 3).map(w => <Word key={w.key} code={code} className="font-normal">{w.word} </Word>)}</span>
      </Link>)}
    </div>
    <SeoBody paragraphs={[
      `${total} מילים ראשונות ${L.adj} לילדים, לפי נושאים. כל מילה עם תמונה, תרגום והגייה באותיות עבריות, ואפשר ללחוץ ולשמוע אותה. אחרי כמה מילים משחקים במשחק התמונות, ומדפיסים כרטיסיות או משחק זיכרון.`,
      VERIFIED,
    ]} faq={[{ q: 'מאיזה גיל?', a: 'מגיל 4 עם התמונות והקול. לא צריך לדעת לקרוא — רואים תמונה ושומעים את המילה.' }, { q: 'זה בחינם?', a: 'כן, הכול בחינם ובלי הרשמה.' }]} related={[{ label: 'שפות לילדים', href: '/languages' }, { label: 'אנגלית לילדים', href: '/english' }]} />
  </div>
}

export function LanguagesHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שפות לילדים — מילים ראשונות בצרפתית, ספרדית, רוסית, ערבית ואמהרית" description="מילים ראשונות לילדים ב-6 שפות: אנגלית, צרפתית, ספרדית, רוסית, ערבית ואמהרית — עם תמונה, הגייה בעברית, משחק וכרטיסיות להדפסה. חינם." path="/languages" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שפות לילדים' }]} />
    <h1 className="mb-3 text-center text-4xl sm:text-5xl">🌍 שפות לילדים</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מילים ראשונות בשש שפות — לסבא וסבתא שמדברים רוסית או אמהרית, לטיול לחו״ל, או סתם בשביל הכיף. עם תמונה, קול, הגייה בעברית ודפים להדפסה.</p>
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
      'בכל שפה אותם נושאים: מילות נימוס, צבעים, מספרים מ-1 עד 10, חיות, אוכל, הגוף, דברים בבית וברחוב, וטבע. כך אפשר ללמוד את אותה מילה בכמה שפות, ולהשוות.',
      VERIFIED + ' בערבית המילים בערבית ספרותית, עם ניקוד.',
    ]} faq={[{ q: 'למה אין שפת סימנים?', a: 'שפת סימנים צריכה איורים או סרטונים מדויקים של כל סימן, וסימן לא מדויק מלמד טעות. נוסיף אותה רק עם מקור מוסמך.' }]} related={[{ label: 'אנגלית לילדים', href: '/english' }, { label: 'אותיות באנגלית', href: '/abc' }]} />
  </div>
}

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../../pages/NotFound'
import { lemmaCandidates } from '../../utils/enLemma'
import { speakAndWait, stopSpeaking } from '../../utils/speak'
import { READING_BANDS, READING_PATH, READING_STORIES, bandOfStory, readingBySlug, readingHref, storiesInBand, wordCount } from '../../data/englishReading'
import '../learn.css'
import '../subjects/subjects.css'
import './englishReading.css'

// /learn/english-reading — graded English texts by band; /learn/english-reading/:slug — one text where
// every word is a button: tap it for the Hebrew meaning (the text's glossary, then the site's built-in
// dictionary, then a meaning for the sentence), hear it, and collect it in "words I learned".
const LETTERS = ['a', 'b', 'c', 'd']
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const LEARN_CRUMB = { label: 'לומדים', href: '/learn' }
const HUB_CRUMB = { label: 'קריאה באנגלית עם מילון', href: READING_PATH }

// ── words I learned (this device only) ──
const KEY = 'buga-english-reading-words'
const readWords = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {} } catch { return {} } }
const writeWords = all => { try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* private mode */ } }

const HUB_FAQ = [
  { q: 'איך עובד המילון בקטעי הקריאה?', a: 'כל מילה בטקסט היא כפתור. נוגעים במילה ומקבלים את הפירוש בעברית: קודם מרשימת המילים של הטקסט, ואם המילה לא שם — מהמילון המובנה של האתר, שמזהה גם צורות כמו רבים, עבר (ed) ו-ing. בכפתור 🔊 שומעים איך מבטאים את המילה.' },
  { q: 'לאיזה גיל מתאימים הטקסטים?', a: 'יש 30 טקסטים בחמש רמות: כיתות ג׳–ד׳ (40–80 מילים), ה׳–ו׳ (90–150), ז׳–ח׳ (150–220), ט׳ (220–300) ו־י׳–י״ב (300–400 מילים). כדאי להתחיל ברמה של הכיתה, ואם קל מדי — לעלות רמה.' },
  { q: 'מה זה "מילים שלמדתי"?', a: 'כל מילה שנוגעים בה נשמרת ברשימה בתחתית הטקסט, עם התרגום וכפתור השמעה. הרשימה נשמרת במכשיר הזה בלבד, כך שאפשר לחזור אליה ולחזור על המילים לפני מבחן.' },
  { q: 'אפשר להדפיס?', a: 'כן. בכל טקסט יש כפתור הדפסה שמוציא דף עם הטקסט, רשימת המילים עם התרגום, שאלות ההבנה ודף תשובות.' },
  { q: 'זה בחינם?', a: 'כן, כל הטקסטים, המילון, ההקראה והשאלות בחינם ובלי הרשמה.' },
]

export function ReadingHub() {
  const [mine, setMine] = useState({})
  useEffect(() => { setMine(readWords()) }, [])
  const learned = Object.values(mine).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0)
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'קריאה באנגלית עם מילון', itemListElement: READING_STORIES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: `https://ugabuga.co.il${readingHref(s)}` })) }
  return <Page>
    <SEO title="קריאה באנגלית עם מילון — נוגעים במילה ומקבלים תרגום" description={`${READING_STORIES.length} סיפורים וטקסטים באנגלית לכיתות ג׳–י״ב: נוגעים בכל מילה ומקבלים פירוש בעברית והגייה, הקראה של כל הטקסט, שאלות הבנה והדפסה. בחינם.`} path={READING_PATH} structuredData={[list, faqSchema(HUB_FAQ)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: HUB_CRUMB.label }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📖 </span>קריאה באנגלית עם מילון</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{READING_STORIES.length} טקסטים · מכיתה ג׳ ועד י״ב · נוגעים במילה ← מקבלים תרגום</p>
    <p className="sj-intro">קוראים סיפור באנגלית, ומילה לא מוכרת כבר לא עוצרת את הקריאה: נוגעים בה ורואים מיד מה היא אומרת בעברית, שומעים איך אומרים אותה, והיא נשמרת ברשימת "מילים שלמדתי". בסוף כל טקסט יש שאלות הבנה קצרות עם הסבר, וכפתור שמקריא את כל הטקסט בקול.</p>
    {learned > 0 && <p className="er-learned-note">⭐ כבר אספתם {learned} מילים בטקסטים באתר. אפשר לחזור עליהן בתחתית כל טקסט.</p>}
    <nav className="sj-jump" aria-label="לפי כיתה">{READING_BANDS.map(b => <a key={b.id} href={`#${b.id}`} className="ln-chip">{b.emoji} {b.label}</a>)}</nav>
    {READING_BANDS.map(b => <section key={b.id} id={b.id} aria-labelledby={`${b.id}-h`} className="mt-8">
      <div className="er-band-head"><h2 id={`${b.id}-h`}><span aria-hidden="true">{b.emoji} </span>{b.label}</h2><span className="text-[var(--muted-foreground)]">{b.words[0]}–{b.words[1]} מילים · {b.desc}</span></div>
      <ul className="sj-grid">{storiesInBand(b.id).map(s => <li key={s.slug}><Link to={readingHref(s)} className="sj-card card-lift">
        <span className="sj-ico" aria-hidden="true">{s.emoji}</span>
        <span><b dir="ltr" className="er-card-title">{s.title}</b><small>{s.genre} · {wordCount(s)} מילים{mine[s.slug]?.length ? ` · ⭐ ${mine[s.slug].length} מילים שלמדתי` : ''}</small><small>{s.summary}</small></span>
      </Link></li>)}</ul>
    </section>)}
    <h2 className="mb-3 mt-10 text-2xl font-black">עוד אנגלית באתר</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      <Link to="/unseen/english" className="ln-box card-lift text-right"><b className="text-lg">📝 אנסין באנגלית</b><br /><small>קטעי קריאה במבנה של מבחן, לכיתות ה׳–י״ב</small></Link>
      <Link to="/learn/english-grammar" className="ln-box card-lift text-right"><b className="text-lg">📘 דקדוק באנגלית</b><br /><small>הסברים, חידונים ודפי עבודה לפי כיתה</small></Link>
      <Link to="/english" className="ln-box card-lift text-right"><b className="text-lg">🇬🇧 מילים באנגלית לפי נושא</b><br /><small>אוצר מילים עם תמונה, הגייה ומשחק</small></Link>
      <Link to="/learn/dictation/english" className="ln-box card-lift text-right"><b className="text-lg">✍️ הכתבה באנגלית</b><br /><small>שומעים מילה וכותבים</small></Link>
    </div>
    <div className="mt-12"><SeoBody paragraphs={[
      'הקושי הכי גדול בקריאה באנגלית הוא לא הדקדוק — אלא מילה אחת שלא מכירים, שגורמת לעצור, לחפש במילון ולאבד את החוט. כאן המילון נמצא בתוך הטקסט: כל מילה היא כפתור, והתרגום מופיע ליד המילה בלי לצאת מהדף.',
      'הטקסטים נכתבו במיוחד לאתר ומתאימים לילדים ישראלים: סיפורים ומשלים, יומנים ומכתבים, וטקסטי מידע על בעלי חיים, חלל וישראל — מים המלח ועד הכרישים בחדרה. כל טקסט מותאם לאורך ולאוצר המילים של הכיתה.',
      'איך משתמשים: בוחרים רמה, קוראים פעם אחת בלי עזרה, נוגעים רק במילים שלא מבינים, ובסוף עונים על השאלות. אחר כך אפשר להקשיב להקראה של כל הטקסט ולחזור על "המילים שלמדתי". הורים ומורים יכולים להדפיס את הטקסט עם רשימת המילים והשאלות.',
    ]} faq={HUB_FAQ} related={[LEARN_CRUMB, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'דקדוק באנגלית', href: '/learn/english-grammar' }, { label: 'מילים באנגלית', href: '/english' }]} /></div>
  </Page>
}

export function ReadingStory() {
  const { slug } = useParams(), s = readingBySlug(slug)
  return s ? <StoryPage key={s.slug} s={s} /> : <NotFound />
}

// Glossary lookups: a single word (also through its dictionary forms) or a phrase that contains it.
function useGlossary(s) {
  return useMemo(() => {
    const single = new Map(), phrases = []
    for (const [en, he] of s.glossary) {
      if (/[\s-]/.test(en)) phrases.push({ en, he, words: en.toLowerCase().split(/[\s-]+/) })
      else single.set(en.toLowerCase(), he)
    }
    const marked = new Set([...single.keys(), ...phrases.flatMap(p => p.words)])
    const find = (word, para) => {
      const cands = lemmaCandidates(word)
      for (const c of cands) if (single.has(c)) return { w: word, he: single.get(c), src: 'glossary' }
      const lower = para.toLowerCase()
      for (const p of phrases) if (cands.some(c => p.words.includes(c)) && lower.includes(p.en.toLowerCase())) return { w: p.en, he: p.he, src: 'glossary' }
      return null
    }
    return { find, marked }
  }, [s])
}

const sentenceWith = (para, word) => (para.match(/[^.!?]+[.!?]*/g) || [para]).find(s => s.toLowerCase().includes(word.toLowerCase()))?.trim() || para

function Paragraph({ text, marked, active }) {
  const parts = text.split(/([A-Za-z0-9]+(?:['’][A-Za-z]+)?)/)
  return <p className={`er-p ${active ? 'is-reading' : ''}`}>{parts.map((x, i) => (i % 2 && /^[A-Za-z]/.test(x)
    ? <button key={i} type="button" className={`er-w ${marked.has(x.toLowerCase()) || lemmaCandidates(x).some(c => marked.has(c)) ? 'is-gloss' : ''}`} data-word={x}>{x}</button>
    : <Fragment key={i}>{x}</Fragment>))}</p>
}

function StoryPage({ s }) {
  const band = bandOfStory(s), path = readingHref(s), words = wordCount(s)
  const { find, marked } = useGlossary(s)
  const [pop, setPop] = useState(null)
  const [mine, setMine] = useState([])
  const [reading, setReading] = useState(-1)
  const [printing, setPrinting] = useState(false)
  const stopRef = useRef(false)
  const popRef = useRef(null)
  useEffect(() => { const all = readWords(); setMine(Array.isArray(all[s.slug]) ? all[s.slug] : []) }, [s.slug])
  useEffect(() => () => { stopRef.current = true; stopSpeaking() }, [])
  useEffect(() => {
    if (!pop) return
    const opened = Date.now(), y = window.scrollY
    const onScroll = () => { if (Date.now() - opened > 400 && Math.abs(window.scrollY - y) > 60) setPop(null) }
    const onKey = e => { if (e.key === 'Escape') setPop(null) }
    const onDown = e => { if (!popRef.current?.contains(e.target) && !e.target.closest?.('.er-w')) setPop(null) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [pop])

  const remember = (w, he) => {
    if (!he) return
    setMine(cur => {
      if (cur.some(([x]) => x.toLowerCase() === w.toLowerCase())) return cur
      const next = [...cur, [w, he]], all = readWords()
      writeWords({ ...all, [s.slug]: next })
      return next
    })
  }
  const forget = w => setMine(cur => { const next = cur.filter(([x]) => x !== w), all = readWords(); writeWords({ ...all, [s.slug]: next }); return next })
  const clearAll = () => { const all = readWords(); delete all[s.slug]; writeWords(all); setMine([]) }
  const say = w => void import('../../utils/wordMeaning').then(m => m.pronounce(w, 'en'))

  // A tapped word: the glossary, else the built-in dictionary (plural, -ed, -ing…), else a name, else
  // a meaning for this sentence from the word-meaning function.
  const onWord = e => {
    const el = e.target.closest('[data-word]')
    if (!el) return
    const word = el.dataset.word, r = el.getBoundingClientRect(), at = { x: r.left + r.width / 2, y: r.bottom }
    const para = el.closest('.er-p')?.textContent || ''
    const hit = find(word, para)
    if (hit) { setPop({ ...at, ...hit }); remember(hit.w, hit.he); return }
    setPop({ ...at, w: word, he: null })
    const done = res => setPop(cur => (cur?.w === word ? { ...cur, ...res } : cur))
    void import('../../utils/wordMeaning').then(async m => {
      const local = await m.builtinMeaning(word)
      if (local) { done({ he: local.meaning, src: 'dictionary', lemma: local.lemma }); remember(word, local.meaning); return }
      if (/^[A-Z]/.test(word)) { done({ he: 'שם של אדם או מקום', src: 'name' }); return }
      const res = await m.meaningOf(word, sentenceWith(para, word), 'en')
      done({ he: res?.meaning || '', src: res?.source, other: res?.other })
      if (res?.meaning) remember(word, res.meaning)
    }).catch(() => done({ he: '' }))
  }

  const readAll = async () => {
    if (reading >= 0) { stopRef.current = true; stopSpeaking(); setReading(-1); return }
    stopRef.current = false
    for (let i = 0; i < s.paragraphs.length; i++) {
      if (stopRef.current) break
      setReading(i)
      const ok = await speakAndWait(s.paragraphs[i], 'en-US', { rate: 0.85 })
      if (!ok) break
    }
    setReading(-1)
  }

  const inBand = storiesInBand(s.band), idx = READING_STORIES.indexOf(s)
  const prev = READING_STORIES[idx - 1], next = READING_STORIES[idx + 1]
  const faq = [
    { q: `על מה הטקסט "${s.title}"?`, a: s.summary },
    { q: 'איך רואים תרגום של מילה?', a: 'נוגעים במילה בטקסט, ומופיע הפירוש בעברית עם כפתור 🔊 להשמעה. מילים עם קו מקווקו מופיעות גם ברשימת המילים של הטקסט.' },
    { q: `לאיזו כיתה מתאים הטקסט?`, a: `הטקסט מתאים ל${band.label}: ${words} מילים, ${s.questions.length} שאלות הבנה עם הסבר לכל תשובה.` },
  ]
  const article = { '@context': 'https://schema.org', '@type': 'LearningResource', name: s.title, description: s.summary, inLanguage: ['en', 'he'], educationalLevel: band.label, learningResourceType: 'קטע קריאה עם מילון ושאלות הבנה', isAccessibleForFree: true, about: 'English reading' }

  return <Page>
    <SEO title={`${s.title} — קריאה באנגלית עם מילון ל${band.label}`} description={`${s.summary} ${words} מילים באנגלית: נוגעים בכל מילה ומקבלים תרגום והגייה, הקראה, ${s.questions.length} שאלות הבנה והדפסה.`} path={path} type="article" structuredData={[article, faqSchema(faq)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, HUB_CRUMB, { label: s.title }]} />
    <p className="text-center text-sm font-bold text-[var(--muted-foreground)]">קריאה באנגלית · {band.label} · {s.genre}</p>
    <h1 className="mb-2 text-center text-3xl sm:text-4xl"><span aria-hidden="true">{s.emoji} </span><span dir="ltr">{s.title}</span></h1>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">{s.summary}</p>
    <div className="er-tools">
      <button type="button" className="ln-chip" aria-pressed={reading >= 0} onClick={readAll}>{reading >= 0 ? '⏹ עצירת ההקראה' : '🔊 הקראה של כל הטקסט'}</button>
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ להדפסה</button>
      <a href="#questions" className="ln-chip">❓ שאלות</a>
    </div>
    <p className="mb-2 text-center text-sm text-[var(--muted-foreground)]">👆 נגעו בכל מילה כדי לראות מה היא אומרת בעברית ולשמוע אותה · מילים עם קו מקווקו — ברשימת המילים</p>

    <div className="ln-box er-text" dir="ltr" lang="en" onClick={onWord}>
      {s.paragraphs.map((p, i) => <Paragraph key={i} text={p} marked={marked} active={reading === i} />)}
    </div>
    {pop && <div ref={popRef} className="er-pop" role="status" style={{ left: Math.min(Math.max(pop.x, 140), window.innerWidth - 140), top: pop.y + 8 }}>
      <button type="button" className="er-pop-say" onClick={() => say(pop.w)} aria-label={`השמעת ${pop.w}`}>🔊</button>
      <b dir="ltr">{pop.w}</b> = <span>{pop.he === null ? 'מחפשים…' : pop.he || 'לא נמצא פירוש'}</span>
      {pop.other?.length > 0 && <small>({pop.other.join(', ')})</small>}
      {pop.src === 'ai' && <small className="er-pop-note">תרגום אוטומטי לפי המשפט</small>}
      {pop.src === 'dictionary' && pop.lemma && pop.lemma !== pop.w.toLowerCase() && <small className="er-pop-note" dir="rtl">צורת המילון: <bdi dir="ltr">{pop.lemma}</bdi></small>}
    </div>}

    <details className="ln-box mt-4"><summary className="cursor-pointer font-bold">📘 רשימת המילים של הטקסט ({s.glossary.length})</summary>
      <ul className="er-glossary">{s.glossary.map(([w, h]) => <li key={w}><button type="button" className="er-say-mini" onClick={() => say(w)} aria-label={`השמעת ${w}`}>🔊</button><b dir="ltr">{w}</b> — {h}</li>)}</ul>
    </details>

    <h2 id="questions" className="mb-3 mt-8 text-2xl font-black">❓ שאלות הבנה</h2>
    <Quiz key={s.slug} questions={s.questions} />

    <section className="ln-box mt-8" aria-labelledby="mine-h">
      <h2 id="mine-h" className="mb-1 text-2xl font-black">⭐ מילים שלמדתי</h2>
      {mine.length === 0
        ? <p className="text-[var(--muted-foreground)]">עוד אין כאן מילים. כל מילה שתיגעו בה בטקסט תישמר כאן, כדי שתוכלו לחזור עליה.</p>
        : <>
          <p className="mb-2 text-sm text-[var(--muted-foreground)]">{mine.length} מילים · נשמרות במכשיר הזה</p>
          <ul className="er-glossary">{mine.map(([w, h]) => <li key={w}><button type="button" className="er-say-mini" onClick={() => say(w)} aria-label={`השמעת ${w}`}>🔊</button><b dir="ltr">{w}</b> — {h} <button type="button" className="er-x" onClick={() => forget(w)} aria-label={`הסרת ${w}`}>✕</button></li>)}</ul>
          <button type="button" className="ln-chip mt-3" onClick={clearAll}>🧹 לנקות את הרשימה</button>
        </>}
    </section>

    {printing && <PrintPreview title={`${s.title} — קריאה באנגלית`} onClose={() => setPrinting(false)}><PrintSheet s={s} band={band} mine={mine} /></PrintPreview>}

    <h2 className="mb-3 mt-10 text-2xl font-black">עוד טקסטים ל{band.label}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{inBand.filter(x => x !== s).map(x => <Link key={x.slug} to={readingHref(x)} className="ln-box card-lift text-right"><b className="text-lg"><span aria-hidden="true">{x.emoji} </span><bdi dir="ltr">{x.title}</bdi></b><br /><small>{x.genre} · {wordCount(x)} מילים</small></Link>)}</div>
    <nav className="mt-6 flex flex-wrap justify-between gap-3" aria-label="הטקסט הקודם והבא">
      {prev ? <Link to={readingHref(prev)} className="ln-chip">→ <bdi dir="ltr">{prev.title}</bdi></Link> : <span />}
      {next ? <Link to={readingHref(next)} className="ln-chip"><bdi dir="ltr">{next.title}</bdi> ←</Link> : <span />}
    </nav>
    <p className="mt-4 text-center"><Link to={READING_PATH} className="font-bold underline">לכל {READING_STORIES.length} הטקסטים באנגלית ←</Link></p>
    <div className="mt-12"><SeoBody faq={faq} related={[HUB_CRUMB, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'דקדוק באנגלית', href: '/learn/english-grammar' }]} /></div>
  </Page>
}

function Quiz({ questions }) {
  const [picks, setPicks] = useState([])
  const answered = picks.filter(p => p !== undefined).length
  const score = questions.filter((q, i) => picks[i] === q.answer).length
  return <div className="space-y-4">
    {questions.map((q, i) => {
      const p = picks[i], done = p !== undefined
      return <div key={i} className="ln-q">
        <p className="font-bold" dir="ltr">{i + 1}. {q.q}</p>
        <div role="group" aria-label={`תשובות לשאלה ${i + 1}`} dir="ltr">{q.options.map((o, j) => <button key={j} type="button" disabled={done} aria-pressed={p === j}
          onClick={() => setPicks(x => { const y = [...x]; y[i] = j; return y })}
          className={`ln-opt er-opt ${done && j === q.answer ? 'is-right' : ''} ${done && p === j && j !== q.answer ? 'is-wrong' : ''}`}><b>{LETTERS[j]}.</b> {o}</button>)}</div>
        {done && <p className={`sj-exp ${p === q.answer ? 'ok' : 'no'}`} role="status"><b>{p === q.answer ? '✔ נכון!' : <>✘ התשובה הנכונה: <bdi dir="ltr">{LETTERS[q.answer]}. {q.options[q.answer]}</bdi></>}</b> {q.explain}</p>}
      </div>
    })}
    {answered === questions.length && <div className="ln-box text-center" role="status">
      <p className="text-3xl font-black">{score} מתוך {questions.length} {score === questions.length ? '🌟' : score >= questions.length * 0.7 ? '👏' : '💪'}</p>
      <p className="mt-1">{score === questions.length ? 'מושלם! אפשר לעבור לטקסט הבא.' : 'כדאי לקרוא שוב את הטקסט — נגעו במילים שלא הבנתם — ולנסות שוב.'}</p>
      <button type="button" className="ln-btn go mt-3" onClick={() => setPicks([])}>🔁 לנסות שוב</button>
    </div>}
  </div>
}

function PrintSheet({ s, band, mine }) {
  return <>
    <article className="buga-flow ln-print sj-print er-print" dir="ltr" lang="en">
      <h2>{s.title}</h2>
      <div className="meta" dir="rtl"><span>שם: __________________</span><span>כיתה: ______</span><span>תאריך: ____________</span></div>
      {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <h3 dir="rtl">מילים — Glossary</h3>
      <ul className="er-print-gloss" dir="rtl">{s.glossary.map(([w, h]) => <li key={w}><b dir="ltr">{w}</b> — {h}</li>)}</ul>
      {mine.length > 0 && <><h3 dir="rtl">מילים שלמדתי</h3><ul className="er-print-gloss" dir="rtl">{mine.map(([w, h]) => <li key={w}><b dir="ltr">{w}</b> — {h}</li>)}</ul></>}
      <h3>Questions</h3>
      <ol className="sj-print-qs">{s.questions.map((q, i) => <li key={i}><p>{q.q}</p><ul>{q.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> {o}</li>)}</ul></li>)}</ol>
      <p className="sj-print-src" dir="rtl">עוגה בוגה · קריאה באנגלית ל{band.label} · ugabuga.co.il{readingHref(s)}</p>
    </article>
    <article className="buga-flow ln-print sj-print er-print" dir="rtl">
      <h2>תשובות — <bdi dir="ltr">{s.title}</bdi></h2>
      <ol className="sj-print-key">{s.questions.map((q, i) => <li key={i}><b dir="ltr">{LETTERS[q.answer]}. {q.options[q.answer]}</b> — {q.explain}</li>)}</ol>
    </article>
  </>
}

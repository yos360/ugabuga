import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import QuickAnswer from '../../components/ui/QuickAnswer'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../NotFound'
import { loadEnglishDictionary, meaningOf, pronounce } from '../../utils/wordMeaning'
import '../../learn/learn.css'
import './dictionary.css'

const LANGS = [
  { id: 'en', name: 'אנגלית', flag: '🇬🇧', dir: 'ltr', placeholder: 'למשל: brave' },
  { id: 'es', name: 'ספרדית', flag: '🇪🇸', dir: 'ltr', placeholder: 'por ejemplo: amigo' },
  { id: 'fr', name: 'צרפתית', flag: '🇫🇷', dir: 'ltr', placeholder: 'par exemple: maison' },
  { id: 'ru', name: 'רוסית', flag: '🇷🇺', dir: 'ltr', placeholder: 'например: книга' },
  { id: 'ar', name: 'ערבית', flag: '🌍', dir: 'rtl', placeholder: 'مثلا: كتاب' },
]
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')
const CRUMBS = [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }]
const FAQ = [
  { q: 'איך מחפשים מילה?', a: 'בוחרים שפה וכיוון — משפה זרה לעברית או מעברית לשפה זרה — כותבים את המילה ולוחצים "תרגום". אפשר גם לשמוע איך אומרים את המילה.' },
  { q: 'מאיפה מגיעים הפירושים?', a: 'לאנגלית יש באתר מילון מובנה של אלפי מילים נפוצות שנבדקו אחת־אחת. מילים שאינן בו, ומילים בספרדית, צרפתית, רוסית וערבית, מתורגמות אוטומטית — ולכן כדאי לבדוק פירוש חשוב גם במקור נוסף.' },
  { q: 'אפשר לחפש מילה בצורה שלה בטקסט, כמו went או children?', a: 'כן. המילון מזהה צורות נטייה נפוצות באנגלית — עבר, רבים, ing — ומציג את המילה הבסיסית ואת הפירוש שלה.' },
  { q: 'איך שומעים את ההגייה?', a: 'לוחצים על 🔊. במילים באנגלית יש לעיתים הקלטה של דובר אמיתי; כשאין — המכשיר מקריא את המילה בקול שלו.' },
  { q: 'המילון בחינם?', a: 'כן, לגמרי ובלי הרשמה.' },
]

function Lookup({ initialLang = 'en' }) {
  const [lang, setLang] = useState(initialLang)
  const [fromHe, setFromHe] = useState(false) // direction: Hebrew → the chosen language
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const L = LANGS.find(l => l.id === lang)
  const go = async e => {
    e?.preventDefault()
    const word = q.trim().split(/\s+/)[0]
    if (!word) return
    setBusy(true); setRes(null)
    const r = fromHe ? await meaningOf(word, '', 'he', lang) : await meaningOf(word, '', lang)
    setRes({ word, fromHe, ...(r || { meaning: '' }) }); setBusy(false)
  }
  return <section className="ln-box dc-box">
    <div className="dc-langs" role="group" aria-label="שפה">{LANGS.map(l => <button key={l.id} type="button" className="ln-chip" aria-pressed={lang === l.id} onClick={() => { setLang(l.id); setRes(null) }}>{l.flag} {l.name}</button>)}</div>
    <div className="dc-dir" role="group" aria-label="כיוון התרגום">
      <button type="button" className="ln-chip" aria-pressed={!fromHe} onClick={() => { setFromHe(false); setRes(null) }}>{L.name} ← עברית</button>
      <button type="button" className="ln-chip" aria-pressed={fromHe} onClick={() => { setFromHe(true); setRes(null) }}>עברית ← {L.name}</button>
    </div>
    <form className="dc-form" onSubmit={go}>
      <input dir={fromHe ? 'rtl' : L.dir} lang={fromHe ? 'he' : lang} value={q} onChange={e => setQ(e.target.value)} placeholder={fromHe ? 'למשל: חבר' : L.placeholder} aria-label={fromHe ? 'מילה בעברית' : `מילה ב${L.name}`} autoComplete="off" autoCapitalize="none" spellCheck="false" />
      <button type="submit" className="ln-btn go" disabled={busy || !q.trim()}>{busy ? 'מחפשים…' : 'תרגום'}</button>
    </form>
    {res && <div className="dc-result" role="status">
      {res.meaning
        ? res.fromHe
          ? <><p className="dc-word"><b>{res.word}</b></p>
            <p className="dc-mean" dir={L.dir} lang={lang}><button type="button" className="dc-say" onClick={() => pronounce(res.meaning.split(',')[0].trim(), lang)} aria-label="השמעה">🔊</button>{res.meaning}</p></>
          : <><p className="dc-word"><button type="button" className="dc-say" onClick={() => pronounce(res.lemma || res.word, lang)} aria-label="השמעה">🔊</button><b dir={L.dir}>{res.lemma && res.lemma !== res.word.toLowerCase() ? `${res.word} ← ${res.lemma}` : res.word}</b></p>
            <p className="dc-mean">{res.meaning}</p></>
        : <p>לא מצאנו פירוש למילה הזאת. בדקו את האיות ונסו שוב.</p>}
    {res && res.meaning && <>
      {res.other?.length > 0 && <p className="dc-other">פירושים נוספים: <span dir={res.fromHe ? L.dir : 'rtl'}>{res.other.join(', ')}</span></p>}
      <p className="dc-src">{res.source === 'dictionary' ? '✓ מהמילון של האתר' : 'תרגום אוטומטי — כדאי לבדוק פירוש חשוב גם במקור נוסף'}</p></>}
    </div>}
  </section>
}

export function DictionaryHub() {
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מילון לתלמידים — אנגלית, ספרדית, צרפתית, רוסית וערבית לעברית, עם הגייה" description="מילון חינמי לתלמידים: מקלידים מילה באנגלית, ספרדית, צרפתית, רוסית או ערבית ומקבלים פירוש בעברית ושומעים את ההגייה. כולל אלפי מילים נפוצות באנגלית לפי אות." path="/dictionary" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[...CRUMBS, { label: 'מילון' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📘 </span>מילון לתלמידים</h1>
    <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">משפה זרה לעברית ומעברית לשפה זרה, עם הגייה</p>
    <QuickAnswer q="איפה יש מילון אנגלית־עברית חינמי לילדים ולתלמידים?" a="כאן: מקלידים מילה באנגלית (או בספרדית, צרפתית, רוסית וערבית), מקבלים פירוש קצר בעברית ושומעים איך אומרים אותה. המילון מזהה גם צורות כמו went, children ו־studying." />
    <Lookup />
    <h2 className="mb-3 mt-10 text-3xl font-black">מילים נפוצות באנגלית לפי אות</h2>
    <p className="mb-3">אלפי מילים שכדאי להכיר מכיתה ז׳ ועד הבגרות, כל אחת עם פירוש קצר בעברית והגייה.</p>
    <nav className="dc-letters" aria-label="אותיות">{LETTERS.map(l => <Link key={l} to={`/dictionary/english/${l}`} className="ln-chip" dir="ltr">{l.toUpperCase()}</Link>)}</nav>
    <div className="mt-10"><SeoBody paragraphs={[
      'מילון טוב הוא הכלי הראשון של כל מי שלומד שפה. כאן אפשר לחפש מילה בשנייה, לקבל את הפירוש הנפוץ שלה בעברית ולשמוע איך היא נשמעת — בלי פרסומות קופצות ובלי הרשמה.',
      'למילים באנגלית יש באתר מילון מובנה של אלפי מילים נפוצות — אוצר המילים שתלמידים פוגשים מחטיבת הביניים ועד הבגרות — עם פירוש קצר ובדוק. המילון מזהה גם צורות נטייה: עבר (went, studied), רבים (children, stories), ing ותארים.',
      'גם בתרגול האנסין באתר אפשר לגעת בכל מילה בטקסט ולקבל את הפירוש שלה — לפי המשפט שבו היא מופיעה.',
    ]} faq={FAQ} related={[{ href: '/unseen/english', label: 'אנסין באנגלית' }, { href: '/english', label: 'אנגלית לילדים' }, { href: '/unseen', label: 'תרגול אנסין' }]} /></div>
  </div>
}

export function DictionaryLetter() {
  const { letter } = useParams()
  const l = String(letter || '').toLowerCase()
  const [words, setWords] = useState(null)
  useEffect(() => { let on = true; loadEnglishDictionary().then(d => { if (on) setWords(d.words) }); return () => { on = false } }, [])
  const list = useMemo(() => (words ? Object.entries(words).filter(([w]) => w[0] === l).sort(([a], [b]) => a.localeCompare(b)) : []), [words, l])
  if (!LETTERS.includes(l)) return <NotFound />
  const U = l.toUpperCase(), i = LETTERS.indexOf(l)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`מילים באנגלית שמתחילות ב־${U} — עם פירוש בעברית והגייה`} description={`מילון אנגלית־עברית לתלמידים: מילים נפוצות באות ${U}, כל אחת עם פירוש קצר בעברית וכפתור הגייה. מכיתה ז׳ ועד הבגרות.`} path={`/dictionary/english/${l}`} />
    <Breadcrumbs items={[...CRUMBS, { label: 'מילון', href: '/dictionary' }, { label: `אות ${U}` }]} />
    <h1 className="mb-2 text-center text-4xl"><span dir="ltr">{U}</span> — מילים באנגלית עם פירוש בעברית</h1>
    <p className="mb-6 text-center text-[var(--muted-foreground)]">{words ? `${list.length} מילים · ` : ''}לחצו על 🔊 כדי לשמוע</p>
    <nav className="dc-letters mb-6" aria-label="אותיות">{LETTERS.map(x => <Link key={x} to={`/dictionary/english/${x}`} className="ln-chip" aria-current={x === l ? 'page' : undefined} dir="ltr">{x.toUpperCase()}</Link>)}</nav>
    {!words ? <p className="ln-box text-center dc-list" role="status">טוענים את המילון…</p>
      : <ul className="dc-list">{list.map(([w, m]) => <li key={w}><button type="button" className="dc-say" onClick={() => pronounce(w, 'en')} aria-label={`השמעת ${w}`}>🔊</button><b dir="ltr" lang="en">{w}</b><span>{m}</span></li>)}</ul>}
    <p className="mt-8 flex justify-between">{i > 0 ? <Link to={`/dictionary/english/${LETTERS[i - 1]}`} className="underline">→ אות {LETTERS[i - 1].toUpperCase()}</Link> : <span />}{i < 25 && <Link to={`/dictionary/english/${LETTERS[i + 1]}`} className="underline">אות {LETTERS[i + 1].toUpperCase()} ←</Link>}</p>
    <p className="mt-4"><Link to="/dictionary" className="font-bold underline">חיפוש מילה במילון</Link> · <Link to="/unseen/english" className="underline">תרגול אנסין באנגלית</Link></p>
  </div>
}

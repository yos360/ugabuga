import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import { CATEGORIES, SITUATIONS, SYMBOLS } from './emojiCatalog'
import { TONES, filterEmoji, readRecent, addRecent } from './emojiLogic'
import './emoji.css'

export function useCopy() {
  const [message, setMessage] = useState('')
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  async function copy(text) {
    let copied = false
    try { await navigator.clipboard.writeText(text); copied = true } catch {
      const previous = document.activeElement
      const input = document.createElement('textarea')
      input.value = text; input.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
      document.body.append(input); input.select()
      try { copied = document.execCommand('copy') } catch { /* Display an actionable error below. */ }
      input.remove(); previous?.focus()
    }
    clearTimeout(timer.current)
    setMessage(copied ? 'הועתק!' : 'ההעתקה נחסמה. סמנו את הטקסט והעתיקו ידנית.')
    timer.current = setTimeout(() => setMessage(''), 4500)
    return copied
  }
  return { copy, notice: <div className="emoji-toast" role="status" aria-live="polite">{message}</div> }
}

const IsraeliOccasionIcons = lazy(() => import('./IsraeliIcons').then(m => ({ default: m.IsraeliOccasionIcons })))
const hubFaq = [{q:'איך מעתיקים אימוג׳י לוואטסאפ?',a:'לוחצים על האימוג׳י, פותחים את השיחה ומדביקים בשדה ההודעה. אין צורך להוריד תמונה.'},{q:'למה חלק מהסמלים מופיעים כריבוע?',a:'הספרייה כוללת Emoji 17.0. מכשיר, גופן או אפליקציה ישנים עשויים לא לתמוך בכל הסמלים; אפשר לעדכן או לבחור סמל ותיק יותר.'}]
export function EmojiFrame({title,description,path,faq,children}) {
  return <div className="emoji-page" dir="rtl"><SEO title={title} description={description} path={path} structuredData={faqSchema(faq)} /><Breadcrumbs items={[{label:'בית',href:'/'},...(path === '/emoji' ? [] : [{label:'אימוג׳י',href:'/emoji'}]),{label:title}]} /><h1>{title}</h1><p>{description}</p>{children}</div>
}

export default function EmojiLibrary() {
  const { category } = useParams()
  const info = CATEGORIES.find(c=>c.slug === category)
  const [entries,setEntries] = useState([]), [error,setError] = useState(false), [attempt,setAttempt] = useState(0)
  const [query,setQuery] = useState(''), [tone,setTone] = useState(''), [limit,setLimit] = useState(120), [recent,setRecent] = useState([])
  const {copy,notice} = useCopy()
  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    fetch('/data/emoji-he-17.json', {signal:controller.signal}).then(r=>{if(!r.ok) throw new Error('data'); return r.json()}).then(data=>{
      setEntries(data.entries)
      try { setRecent(readRecent(localStorage.getItem('buga-emoji-recent'),data.entries)) } catch { setRecent([]) }
    }).catch(e=>{if(e.name !== 'AbortError') setError(true)})
    return ()=>controller.abort()
  },[attempt])
  const matches = useMemo(()=>filterEmoji(entries,query,category,tone),[entries,query,category,tone])
  useEffect(()=>setLimit(120),[query,category,tone])
  async function copyEmoji(emoji) {
    if (!await copy(emoji)) return
    setRecent(list=>{const next=addRecent(list,emoji); try{localStorage.setItem('buga-emoji-recent',JSON.stringify(next))}catch{/* Storage is optional. */}return next})
  }
  if(category && !info) return <NotFound />
  const title=info?.title || 'אימוג׳י וסמיילים להעתקה — כל האימוג׳ים בעברית'
  const description=info?.description || 'חפשו אימוג׳י בעברית, בחרו גוון עור והעתיקו בלחיצה. סמיילים, לבבות, דגלים, סמלים ושילובים מוכנים לחגים ולאירועים.'
  const faq=info?.faq || hubFaq
  return <EmojiFrame title={title} description={description} path={category?`/emoji/${category}`:'/emoji'} faq={faq}>
    <nav className="emoji-links" aria-label="קטגוריות אימוג׳י"><Link aria-current={!category?'page':undefined} to="/emoji">הכול</Link>{CATEGORIES.map(c=><Link key={c.slug} aria-current={category===c.slug?'page':undefined} to={`/emoji/${c.slug}`}>{c.emoji} {c.label}</Link>)}</nav>
    <section aria-label="חיפוש אימוג׳י"><label>חיפוש בעברית<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="לב, עוגה, דגל, בוכה…" /></label><label>גוון עור<select value={tone} onChange={e=>setTone(e.target.value)}>{TONES.map((t,i)=><option key={t} value={t}>{['ללא גוון','בהיר','בהיר בינוני','בינוני','כהה בינוני','כהה','כל הגוונים והרצפים'][i]} {t==='all'?'':t}</option>)}</select></label></section>
    {recent.length>0 && <section><h2>הועתקו לאחרונה</h2><div className="emoji-grid">{recent.map(e=><button key={e} className="emoji-cell" onClick={()=>copyEmoji(e)} aria-label={`העתקת ${entries.find(x=>x.emoji===e)?.name || e}`}><span>{e}</span></button>)}</div></section>}
    {error?<p role="alert">לא הצלחנו לטעון את הספרייה. <button onClick={()=>setAttempt(a=>a+1)}>ניסיון נוסף</button></p>:entries.length===0?<p role="status">טוענים את האימוג׳ים…</p>:<section><p role="status">{matches.length} תוצאות · לחצו להעתקה</p><div className="emoji-grid" data-testid="emoji-results">{matches.slice(0,limit).map(e=><button className="emoji-cell" key={e.emoji} title={e.name} aria-label={`העתקת ${e.name}`} onClick={()=>copyEmoji(e.emoji)}><span>{e.emoji}</span><small>{e.name}</small></button>)}</div>{!matches.length && <p>לא נמצאו תוצאות. נסו מילה קצרה יותר או קטגוריה אחרת.</p>}{matches.length>limit && <button onClick={()=>setLimit(n=>n+120)}>הצגת עוד אימוג׳ים</button>}</section>}
    {!category && <><section><h2>אימוג׳י לכל מצב</h2><Link className="underline" to="/emoji/israeli">אייקונים ישראליים מקוריים — להורדה, למדבקות ולצביעה</Link><div className="emoji-links">{SITUATIONS.map(s=><Link key={s.slug} to={`/emoji/for/${s.slug}`}>{s.emoji} {s.label}</Link>)}</div></section><section><h2>סמלים להעתקה וניקוד עברי</h2><p>ניקוד הוא תו מצטרף: הדביקו אותו מיד אחרי האות. העיגול המקווקו בתצוגה הוא להמחשה בלבד ואינו מועתק.</p><div className="emoji-grid">{SYMBOLS.map(([symbol,name])=><button className="emoji-cell" key={symbol} onClick={()=>copy(symbol)} aria-label={`העתקת ${name}`}><span>{/[\u05B0-\u05C2]/.test(symbol)&&symbol!=='־'?'◌':''}{symbol}</span><small>{name}</small></button>)}</div></section></>}
    <SeoBody paragraphs={info?[info.intro,info.detail]:['האימוג׳ים מוצגים בגופן של המכשיר שלכם. אותם תווים עשויים להיראות מעט אחרת בטלפון אחר, אבל אפשר להעתיק אותם לכל שדה טקסט תומך.','השמות ומילות החיפוש מגיעים מהנתונים העבריים של Unicode CLDR. ההיסטוריה נשמרת רק בדפדפן הזה, וכוללת עד 16 אימוג׳ים שהועתקו בהצלחה.']} faq={faq} related={[{href:'/tools/emoji-studio',label:'אימוג׳י סטודיו — משחק ניחושים'},...(category?[{href:'/emoji',label:'כל האימוג׳ים'}]:[])]}/><p className="emoji-source">Unicode Emoji 17.0 · CLDR 48.2 · <a href="/data/UNICODE-LICENSE.txt">רישיון הנתונים</a></p>{notice}
  </EmojiFrame>
}

export function EmojiSituation() {
  const {slug}=useParams(), s=SITUATIONS.find(x=>x.slug===slug)
  const {copy,notice}=useCopy()
  if(!s) return <NotFound />
  return <EmojiFrame title={s.title} description={s.description} path={`/emoji/for/${slug}`} faq={s.faq}><section><h2>שילובים להעתקה</h2><div className="emoji-copy-list">{s.combinations.map(text=><button key={text} onClick={()=>copy(text)} aria-label={`העתקת ${text}`}><span className="emoji-combination">{text}</span><small>העתקה</small></button>)}</div></section><section><h2>ברכות קצרות ל{s.label}</h2><div className="emoji-copy-list">{s.greetings.map(text=><button key={text} onClick={()=>copy(text)}><span>{text}</span><small>העתקת הברכה</small></button>)}</div><p>אפשר להדביק ולשנות את הברכה לפני השליחה.</p></section><Suspense fallback={<p>טוענים איורים…</p>}><IsraeliOccasionIcons slug={slug}/></Suspense><SeoBody paragraphs={[s.intro,s.detail]} faq={s.faq} related={[{href:'/emoji',label:'ספריית האימוג׳י'},...s.relatedPaths.map(href=>({href,label:href.startsWith('/holidays/')?'פעילויות החג':href==='/classroom'?'כלים לכיתה':href.startsWith('/greetings')?'עוד ברכות':href==='/birthday'?'יום הולדת':href==='/bar-mitzvah'?'בר ובת מצווה':'עוד רעיונות באתר'}))]}/>{notice}</EmojiFrame>
}

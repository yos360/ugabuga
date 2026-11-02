// /tools/keyboard-fix — fix text typed in the wrong keyboard language (Hebrew ⇄ English layout).
import { useDeferredValue, useMemo, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { fixText } from './keyboardLogic'
import './keys.css'

const FAQ = [
  { q: 'למה יוצא לי ג׳יבריש כמו akuo במקום שלום?', a: 'המקלדת הייתה במצב אנגלית בזמן שהקלדתם בעברית. כל מקש נשאר אותו מקש, רק האות שהוא מוציא שונה: המקש של ש׳ מוציא a באנגלית, ולכן „שלום” הופך ל־akuo. הכלי מחזיר כל מקש לאות שהתכוונתם אליה.' },
  { q: 'הכלי יודע לבד לאיזה כיוון להמיר?', a: 'כן. במצב אוטומטי הוא בודק כל מילה בנפרד: האם היא נראית כמו מילה אמיתית כפי שהיא, או שאחרי המרה היא נראית כמו מילה בשפה השנייה. לכן במשפט מעורב רק המילים השגויות מתוקנות, והן מסומנות בצהוב.' },
  { q: 'ומה אם הזיהוי האוטומטי טעה?', a: 'בוחרים למעלה „הכול לעברית” או „הכול לאנגלית”, והכלי ימיר כל מילה בכתב המתאים בלי לנחש. זה שימושי במיוחד למילים קצרות מאוד, שאפשר לקרוא בשתי השפות.' },
  { q: 'מה קורה לסימנים כמו פסיק ונקודה?', a: 'במקלדת העברית המקש של הפסיק כותב ת׳ והמקש של הנקודה כותב ץ׳. הכלי ממיר אותם כשהם חלק ממילה, למשל T, שהופך ל„את”, אבל משאיר פסיק או נקודה בסוף מילה כשאות שם לא הגיונית, למשל אחרי ם סופית.' },
  { q: 'הטקסט שלי נשלח לשרת?', a: 'לא. ההמרה מתבצעת כולה בדפדפן שלכם, גם בלי אינטרנט אחרי שהדף נטען. שום דבר לא נשמר ולא נשלח.' },
  { q: 'איך מחליפים שפת מקלדת כדי שזה לא יקרה שוב?', a: 'בווינדוס לוחצים Alt+Shift או מקש חלונות+רווח. במק לוחצים Control+רווח. בטלפון לוחצים על סמל הגלובוס או מחליקים על מקש הרווח.' },
]

const EXAMPLES = [
  { label: 'akuo', text: 'akuo' },
  { label: 'nv akunl?', text: 'nv akunl?' },
  { label: 'יקךךם', text: "יקךךם 'םרךג" },
  { label: 'משפט מעורב', text: 'אני רוצה ,usv rcv על הכול' },
  { label: 'CAPS LOCK', text: 'NX,HR T, VKJHMV' },
]
const MODES = [
  { id: 'auto', label: 'אוטומטי', hint: 'רק מילים שנראות שגויות' },
  { id: 'toHe', label: 'הכול לעברית', hint: 'akuo ← שלום' },
  { id: 'toEn', label: 'הכול לאנגלית', hint: 'יקךךם ← hello' },
]

export default function KeyboardFix() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('auto')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const deferred = useDeferredValue(text)
  const result = useMemo(() => fixText(deferred, mode), [deferred, mode])
  // which forced conversions to offer: the direction we already fixed, else every script present
  const offerDirs = result.direction === 'toHe' || result.direction === 'toEn' ? [result.direction]
    : result.direction === 'mixed' ? [] : [/[A-Za-z]/.test(deferred) && 'toHe', /[\u05D0-\u05EA]/.test(deferred) && 'toEn'].filter(Boolean)
  const offers = offerDirs.filter(d => fixText(deferred, d).text !== result.text)
  const hasText = deferred.trim().length > 0

  const status = !hasText ? 'התוצאה תופיע כאן מיד כשתקלידו או תדביקו.'
    : result.changed === 0 ? (mode === 'auto' ? 'לא מצאנו מילים שנראות שגויות.' : 'אין כאן מילים בכתב הזה.')
      : `תיקנו ${result.changed === 1 ? 'מילה אחת' : `${result.changed} מילים`}${result.direction === 'toHe' ? ' מאנגלית לעברית' : result.direction === 'toEn' ? ' מעברית לאנגלית' : ' בשני הכיוונים'}.`

  async function copy() {
    let ok = false
    try { await navigator.clipboard.writeText(result.text); ok = true } catch { /* fall back below */ }
    if (!ok) {
      const ta = document.createElement('textarea')
      ta.value = result.text; document.body.appendChild(ta); ta.select()
      try { ok = document.execCommand('copy') } catch { /* ignore */ }
      ta.remove()
    }
    setCopied(ok)
    setTimeout(() => setCopied(false), 1800)
  }
  async function paste() {
    try { const t = await navigator.clipboard.readText(); if (t) setText(t) } catch { inputRef.current?.focus() }
  }
  const swap = () => { setText(result.text); setMode('auto'); inputRef.current?.focus() }
  const clear = () => { setText(''); setMode('auto'); inputRef.current?.focus() }

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="תיקון טקסט שנכתב באנגלית במקום בעברית — המרת מקלדת" description="הקלדתם akuo במקום שלום? מדביקים ומקבלים את הטקסט הנכון מיד. המרת אנגלית לעברית ועברית לאנגלית לפי המקלדת, עם זיהוי אוטומטי. חינם, בלי הרשמה." path="/tools/keyboard-fix" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'תיקון טקסט מהמקלדת' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">תיקון טקסט שנכתב באנגלית במקום בעברית</h1>
    <p className="text-center mb-6 text-lg">כתבתם <bdi dir="ltr" className="kf-code">akuo</bdi> במקום <b>שלום</b>? הדביקו כאן ותקבלו את מה שהתכוונתם לכתוב. עובד גם הפוך.</p>

    <section className="kf-card" aria-label="תיקון הטקסט">
      <div className="kf-modes" role="radiogroup" aria-label="כיוון ההמרה">
        {MODES.map(m => <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} className="kf-mode" onClick={() => setMode(m.id)}>
          <span className="kf-mode-label">{m.id === 'auto' ? '✨ ' : ''}{m.label}</span><span className="kf-mode-hint">{m.hint}</span>
        </button>)}
      </div>

      <label className="kf-label" htmlFor="kf-in">הטקסט שהקלדתם</label>
      <textarea id="kf-in" ref={inputRef} className="kf-text" dir="auto" rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="הדביקו כאן, למשל: nv akunl" spellCheck={false} autoCapitalize="off" autoCorrect="off" />
      <div className="kf-row">
        <button type="button" className="kf-btn" onClick={paste}>📥 הדבקה</button>
        <button type="button" className="kf-btn" onClick={clear} disabled={!text}>🧹 ניקוי</button>
        <span className="kf-examples">דוגמה:{EXAMPLES.map(ex => <button key={ex.label} type="button" className="kf-chip" onClick={() => { setText(ex.text); setMode('auto') }}><bdi>{ex.label}</bdi></button>)}</span>
      </div>

      <div className="kf-arrow" aria-hidden="true">⬇</div>

      <div className="kf-label" id="kf-out-label">הטקסט המתוקן</div>
      <div className="kf-out" dir="auto" aria-labelledby="kf-out-label" aria-live="polite">
        {hasText ? result.segments.map((s, i) => s.changed ? <mark key={i} className="kf-mark">{s.text}</mark> : <span key={i}>{s.text}</span>) : <span className="kf-placeholder">מה שהתכוונתם לכתוב 🙂</span>}
      </div>
      <p className="kf-status">{status}{hasText && result.changed > 0 && mode === 'auto' && <> המילים שתוקנו מסומנות בצהוב.</>}</p>
      {hasText && mode === 'auto' && offers.length > 0 && <p className="kf-status">
        {result.changed === 0 ? 'רוצים בכל זאת להמיר? ' : 'משהו לא תוקן? '}
        {offers.map((d, i) => <span key={d}>{i ? ' או ' : ''}<button type="button" className="kf-link" onClick={() => setMode(d)}>{d === 'toHe' ? 'להמיר את כל האנגלית לעברית' : 'להמיר את כל העברית לאנגלית'}</button></span>)}
      </p>}
      <div className="kf-row kf-actions">
        <button type="button" className="kf-btn kf-primary" onClick={copy} disabled={!hasText}>{copied ? '✔ הועתק!' : '📋 העתקת הטקסט המתוקן'}</button>
        <button type="button" className="kf-btn" onClick={swap} disabled={!hasText} title="להעביר את התוצאה לתיבה העליונה ולהמשיך לערוך">⇅ החלפה</button>
      </div>
    </section>

    <div className="mt-10 no-present"><h2 className="text-2xl mb-4">איך זה עובד?</h2>
      <SeoBody paragraphs={[
        'במקלדת עברית רגילה בישראל כל מקש מוציא אות עברית אחת ואות אנגלית אחת. כשהמחשב במצב הלא נכון, המילים יוצאות כרצף אותיות מוזר. אם הקלדתם „מה שלומך” כשהמקלדת הייתה באנגלית, יצא nv akunl. הכלי לא מתרגם, הוא פשוט מחזיר כל מקש לאות שהייתה עליו בשפה השנייה.',
        'כדי לדעת אילו מילים לתקן, הכלי בודק כמה כל מילה דומה לעברית אמיתית או לאנגלית אמיתית: האם יש בה אותיות סופיות באמצע מילה, האם יש בה צירופי אותיות שלא קיימים, והאם היא מופיעה ברשימת מילים נפוצות. מילים קצרות שאפשר לקרוא בשתי השפות, כמו „גם” ו־do, נקבעות לפי המילים שלידן.',
        'הכלי מתאים גם לטקסט ארוך, להודעות וואטסאפ ולמיילים. אפשר להמשיך לערוך את התוצאה בלחיצה על „החלפה”, ואם נשארו מילים בודדות לא נכונות אפשר להמיר הכול לכיוון אחד.',
      ]} faq={FAQ} related={[{ href: '/tools', label: 'כל הכלים החינמיים' }, { href: '/tools/calculator', label: 'מחשבון מדעי' }]} />
    </div>
  </div>
}

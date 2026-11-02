// /tools/emoji — emoji keyboard: Hebrew search, categories, add to text or copy one emoji at a tap.
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import EmojiPicker from './EmojiPicker'
import { insertAt, backspaceAt } from './virtualKeys'
import './virtualKeys.css'

const FAQ = [
  { q: 'איך מוצאים אימוג׳י מהר?', a: 'כותבים בתיבת החיפוש מילה בעברית, כמו „לב”, „חתול”, „מזל טוב” או „כדורגל”, והאימוג׳ים המתאימים מופיעים מיד. אפשר גם לדפדף לפי קטגוריות: פרצופים, לבבות, ידיים, חיות, אוכל, חגים וחפצים.' },
  { q: 'איך מעתיקים אימוג׳י אחד?', a: 'מפעילים את „העתקה בלחיצה”, ואז כל לחיצה על אימוג׳י מעתיקה אותו מיד. נשאר רק להדביק בוואטסאפ, בפייסבוק או בכל מקום אחר.' },
  { q: 'האימוג׳ים ייראו אותו דבר אצל כולם?', a: 'האימוג׳ים הם תווים רגילים, ולכן הם מופיעים בכל טלפון ומחשב. הציור עצמו קצת שונה בין אייפון, אנדרואיד ווינדוס, אבל המשמעות זהה.' },
  { q: 'איפה נשמרים האחרונים שבחרתי?', a: 'רק בדפדפן שלכם, כדי שתמצאו אותם מהר בפעם הבאה. שום דבר לא נשלח לשרת.' },
]

export default function EmojiKeyboard() {
  const [text, setText] = useState('')
  const [copyMode, setCopyMode] = useState(false)
  const [toast, setToast] = useState('')
  const ta = useRef(null), live = useRef({ text: '', caret: null }), toastT = useRef(0)

  const edit = fn => {
    const el = ta.current, cur = live.current.text
    const fresh = el && el.value === cur && live.current.caret == null
    const start = fresh ? el.selectionStart : live.current.caret ?? cur.length
    const r = fn(cur, start, fresh ? el.selectionEnd : start)
    live.current = { text: r.text, caret: r.caret }; setText(r.text)
    requestAnimationFrame(() => { if (el && live.current.caret === r.caret) { el.setSelectionRange(r.caret, r.caret); live.current.caret = null } })
  }
  const flash = msg => { setToast(msg); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 1600) }
  const copy = async s => { try { await navigator.clipboard.writeText(s); return true } catch { return false } }
  const pick = async e => {
    if (copyMode) { flash((await copy(e)) ? `${e} הועתק — אפשר להדביק` : 'ההעתקה נחסמה בדפדפן'); return }
    edit((t, a, b) => insertAt(t, a, b, e))
  }

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="מקלדת אימוג׳ים — חיפוש אימוג׳י בעברית והעתקה בלחיצה" description="מקלדת אימוג׳ים בעברית: מחפשים לב, חתול או מזל טוב, מעתיקים בלחיצה אחת או כותבים הודעה שלמה עם אימוג׳ים ושולחים בוואטסאפ. בחינם ובלי הרשמה." path="/tools/emoji" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מקלדת אימוג׳ים' }]} />
    <h1 className="mb-2 text-center text-3xl sm:text-4xl">מקלדת אימוג׳ים 😀</h1>
    <p className="mb-5 text-center text-lg">מחפשים אימוג׳י <b>בעברית</b>, מוסיפים להודעה או מעתיקים בלחיצה אחת.</p>

    <section className="okb-card" aria-label="מקלדת האימוג׳ים">
      <div className="okb-bar">
        <button type="button" className="okb-btn" aria-pressed={copyMode} onClick={() => setCopyMode(m => !m)}>📋 העתקה בלחיצה</button>
        <span className="text-sm text-[var(--muted-foreground)]">{copyMode ? 'כל לחיצה מעתיקה אימוג׳י אחד' : 'כל לחיצה מוסיפה לטקסט'}</span>
      </div>
      {!copyMode && <>
        <label htmlFor="emj-text" className="sr-only">ההודעה שלכם</label>
        <textarea id="emj-text" ref={ta} className="okb-text" dir="auto" rows={3} style={{ fontSize: 26 }} value={text}
          onChange={e => { live.current = { text: e.target.value, caret: null }; setText(e.target.value) }} placeholder="ההודעה שלכם עם אימוג׳ים 🎉" />
      </>}
      <div className="mt-3"><EmojiPicker onPick={pick} /></div>
      {toast && <p role="status" className="emj-toast">{toast}</p>}
      {!copyMode && <div className="okb-actions">
        <button type="button" className="okb-btn okb-primary" disabled={!text} onClick={async () => flash((await copy(text)) ? '✔ הטקסט הועתק' : 'ההעתקה נחסמה בדפדפן')}>📋 העתקת הכול</button>
        <a className={'okb-btn okb-wa' + (text ? '' : ' is-disabled')} href={text ? `https://wa.me/?text=${encodeURIComponent(text)}` : undefined} target="_blank" rel="noopener noreferrer">💬 שליחה בוואטסאפ</a>
        <button type="button" className="okb-btn" disabled={!text} onClick={() => edit(backspaceAt)}>⌫ מחיקה</button>
        <button type="button" className="okb-btn" disabled={!text} onClick={() => { live.current = { text: '', caret: null }; setText('') }}>🧹 ניקוי</button>
        <Link className="okb-btn" to="/tools/keyboard">⌨️ מקלדת עברית עם ניקוד</Link>
      </div>}
    </section>

    <div className="mt-10 no-present"><h2 className="mb-4 text-2xl">איך משתמשים?</h2>
      <SeoBody paragraphs={[
        'כותבים בתיבת החיפוש מה מחפשים, בעברית רגילה: „שמח”, „בוכה”, „פיצה”, „כדורגל”, „חנוכה”. אפשר לחפש גם שתי מילים יחד, כמו „לב אדום”. האימוג׳ים שבחרתם לאחרונה נשמרים בקטגוריה „אחרונים”.',
        'כדי לכתוב הודעה שלמה, לוחצים על האימוג׳ים והם נוספים לתיבה במקום הסמן. אפשר להקליד גם מילים בין האימוג׳ים, להעתיק הכול או לשלוח ישר בוואטסאפ. כדי להעתיק אימוג׳י בודד, מפעילים את „העתקה בלחיצה”.',
      ]} faq={FAQ} related={[{ href: '/tools/keyboard', label: 'מקלדת עברית אונליין עם ניקוד' }, { href: '/typing', label: 'קורס הקלדה עיוורת' }, { href: '/tools', label: 'כל הכלים החינמיים' }]} />
    </div>
  </div>
}

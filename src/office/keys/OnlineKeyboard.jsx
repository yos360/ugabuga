// /tools/keyboard — on-screen Hebrew/English keyboard: click keys, add niqqud and symbols, or type on a
// computer with no Hebrew installed (each key becomes the Hebrew letter printed on it). Finger colors and
// the typing speed lead into the touch-typing course at /typing.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { FINGERS, FINGER_OF } from '../../typing/typingData'
import { KB_LAYOUTS, LATIN_ON_KEY, NIQQUD, VAV_VOWELS, SYMBOLS, charFor, remapPhysical, removeNiqqud, insertAt, backspaceAt, countText } from './virtualKeys'
import EmojiPicker from './EmojiPicker'
import './virtualKeys.css'

const STORE = 'ugabuga-online-keyboard'
const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') } catch { return {} } }
const save = v => { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* storage blocked */ } }

// Width of each special key, in key units; every row adds up to 15.
const MOD = {
  Backspace: ['⌫', 2], Tab: ['Tab', 1.5], CapsLock: ['Caps', 1.75], Enter: ['Enter ↵', 2.25],
  ShiftLeft: ['⇧ Shift', 2.25], ShiftRight: ['⇧ Shift', 2.75], Lang: ['', 2.5], At: ['@', 1.5], Space: ['רווח', 8.5], Clear: ['', 2.5],
}
const ROWS = lang => {
  const r = KB_LAYOUTS[lang].rows
  return [[...r[0], 'Backspace'], ['Tab', ...r[1]], ['CapsLock', ...r[2], 'Enter'], ['ShiftLeft', ...r[3], 'ShiftRight'], ['Lang', 'At', 'Space', 'Clear']]
}
const HE_ON_KEY = Object.fromEntries(Object.values(KB_LAYOUTS.he.byCode).map(k => [k.code, k.base]))
const COURSE = [
  { to: '/typing', emoji: '⌨️', title: 'הקלדה עיוורת בעברית', desc: '25 שיעורים משורת הבית ועד משפטים שלמים' },
  { to: '/typing/english', emoji: '🔤', title: 'הקלדה עיוורת באנגלית', desc: '11 שיעורים, ההסברים בעברית' },
  { to: '/typing/test', emoji: '⏱️', title: 'מבחן מהירות הקלדה', desc: 'כמה מילים לדקה אתם מקלידים?' },
  { to: '/typing/game', emoji: '🎮', title: 'משחק מילים נופלות', desc: 'מתרגלים הקלדה בכיף, לילדים' },
]
const FAQ = [
  { q: 'אין לי עברית במחשב. אפשר להקליד כאן עברית?', a: 'כן. בוחרים „עברית” ומקלידים במקלדת הרגילה: כל מקש כותב את האות העברית שמודפסת עליו במקלדת ישראלית, למשל A כותב ש׳ ו־T כותב א׳. אין צורך להתקין שום דבר. מתאים גם למחשבים בחו״ל, בספרייה או בעבודה.' },
  { q: 'איך מוסיפים ניקוד?', a: 'כותבים אות, ואז לוחצים על סימן הניקוד שרוצים מתחת למקלדת. הסימן מתחבר לאות שלפני הסמן. אפשר להוסיף כמה סימנים לאותה אות, למשל דגש וקמץ. כפתור „הסרת ניקוד” מוריד את כל הניקוד מהטקסט.' },
  { q: 'מה זה צבעי האצבעות?', a: 'בהקלדה עיוורת כל מקש שייך לאצבע קבועה. כשמפעילים את צבעי האצבעות, כל מקש נצבע בצבע של האצבע שלו, ואחרי כל הקשה כתוב באיזו אצבע היה נכון ללחוץ. זה אותו צבע כמו בקורס ההקלדה העיוורת באתר.' },
  { q: 'הטקסט שלי נשמר?', a: 'הטקסט נשמר רק בדפדפן שלכם, כדי שלא ילך לאיבוד אם סוגרים את הדף. הוא לא נשלח לשום מקום. כפתור „ניקוי” מוחק אותו.' },
  { q: 'איך מחליפים שפה במקלדת של המחשב עצמו?', a: 'בווינדוס לוחצים Alt+Shift או מקש חלונות+רווח. במק לוחצים Control+רווח. בטלפון לוחצים על סמל הגלובוס או מחליקים על מקש הרווח.' },
]

export default function OnlineKeyboard() {
  const saved = useState(load)[0]
  const [text, setText] = useState(saved.text || '')
  const [lang, setLang] = useState(saved.lang === 'en' ? 'en' : 'he')
  const [fingers, setFingers] = useState(!!saved.fingers)
  const [size, setSize] = useState(saved.size || 24)
  const [shift, setShift] = useState(false), [caps, setCaps] = useState(false)
  const [last, setLast] = useState(null), [copied, setCopied] = useState(false)
  const [siteKb, setSiteKb] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [emoji, setEmoji] = useState(false)
  const ta = useRef(null), stamps = useRef([]), flashT = useRef(0)
  // The latest text and caret, ahead of React's render, so fast taps never overwrite each other.
  const live = useRef({ text, caret: null })
  const put = v => { live.current = { text: v, caret: null }; setText(v) }

  useEffect(() => { save({ text, lang, fingers, size }) }, [text, lang, fingers, size])
  // On a phone the site's keyboard replaces the phone's own, so they don't cover each other.
  useEffect(() => { if (window.matchMedia?.('(pointer: coarse)').matches) setSiteKb(true) }, [])

  const edit = fn => {
    const el = ta.current, cur = live.current.text
    const fresh = el && el.value === cur && live.current.caret == null
    const start = fresh ? el.selectionStart : live.current.caret ?? cur.length
    const end = fresh ? el.selectionEnd : start
    const r = fn(cur, start, end)
    live.current = { text: r.text, caret: r.caret }
    setText(r.text)
    requestAnimationFrame(() => {
      if (!el || live.current.caret !== r.caret) return
      el.focus({ preventScroll: true }); el.setSelectionRange(r.caret, r.caret); live.current.caret = null
    })
  }
  const tick = n => {
    const now = Date.now(), s = stamps.current
    for (let i = 0; i < n; i++) s.push(now)
    while (s.length && now - s[0] > 60000) s.shift()
    const secs = Math.max(10, (now - s[0]) / 1000)
    setWpm(s.length >= 15 ? Math.round(s.length / 5 / (secs / 60)) : 0)
  }
  const flash = code => { setLast(code); clearTimeout(flashT.current); flashT.current = setTimeout(() => setLast(c => (c === code ? `${code}:off` : c)), 220) }
  const type = str => { edit((t, a, b) => insertAt(t, a, b, str)); tick(1) }

  const press = code => {
    flash(code)
    if (code === 'Backspace') return edit(backspaceAt)
    if (code === 'Enter') return type('\n')
    if (code === 'Space') return type(' ')
    if (code === 'At') return type('@')
    if (code === 'Tab') return type('\t')
    if (code === 'ShiftLeft' || code === 'ShiftRight') return setShift(s => !s)
    if (code === 'CapsLock') return setCaps(c => !c)
    if (code === 'Lang') return setLang(l => (l === 'he' ? 'en' : 'he'))
    if (code === 'Clear') return clear()
    const ch = charFor(lang, code, { shift, caps })
    if (ch) { type(ch); setShift(false) }
  }
  const onKeyDown = e => {
    if (e.code) flash(e.code)
    if (e.key === 'CapsLock') setCaps(e.getModifierState?.('CapsLock') ?? false)
    const ch = remapPhysical(lang, e)
    if (ch) { e.preventDefault(); type(ch) } else if (e.key?.length === 1 && !e.ctrlKey && !e.metaKey) tick(1)
  }
  function clear() {
    if (text && !window.confirm('למחוק את כל הטקסט?')) return
    put(''); stamps.current = []; setWpm(0); ta.current?.focus()
  }
  async function copy() {
    let ok = false
    try { await navigator.clipboard.writeText(text); ok = true } catch {
      ta.current?.select(); try { ok = document.execCommand('copy') } catch { /* ignore */ }
    }
    setCopied(ok); setTimeout(() => setCopied(false), 1800)
  }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }))
    a.download = 'טקסט.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const { chars, words } = countText(text)
  const lastCode = last && !last.endsWith(':off') ? last : null
  const hintCode = last?.replace(':off', '')
  const hintFinger = hintCode && FINGER_OF[hintCode]
  const hintChar = hintCode && charFor(lang, hintCode)
  const hasNiqqud = removeNiqqud(text) !== text

  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="מקלדת עברית אונליין — עם ניקוד, גם בלי עברית במחשב" description="מקלדת עברית ואנגלית וירטואלית בחינם: מקלידים בעכבר או במקלדת הרגילה גם בלי עברית מותקנת, מוסיפים ניקוד וסימנים, מעתיקים ושולחים בוואטסאפ. עם צבעי אצבעות וקישור לקורס הקלדה עיוורת." path="/tools/keyboard" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מקלדת עברית אונליין' }]} />
    <h1 className="mb-2 text-center text-3xl sm:text-4xl">מקלדת עברית אונליין</h1>
    <p className="mb-5 text-center text-lg">מקלידים בעכבר או במקלדת הרגילה, <b>גם במחשב בלי עברית</b>. עם ניקוד, סימנים, העתקה בלחיצה וצבעי אצבעות להקלדה עיוורת.</p>

    <section className="okb-card" aria-label="המקלדת">
      <div className="okb-bar">
        <div role="radiogroup" aria-label="שפת המקלדת" className="okb-seg">
          {[['he', 'עברית'], ['en', 'English']].map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={lang === id} onClick={() => { setLang(id); ta.current?.focus() }}>{label}</button>)}
        </div>
        <button type="button" className="okb-btn" aria-pressed={fingers} onClick={() => setFingers(f => !f)}>🖐️ צבעי אצבעות</button>
        <button type="button" className="okb-btn" aria-pressed={emoji} onClick={() => setEmoji(v => !v)}>😀 אימוג׳ים</button>
        <span className="okb-size" role="group" aria-label="גודל הטקסט">
          <button type="button" className="okb-btn" onClick={() => setSize(s => Math.max(16, s - 4))} aria-label="הקטנת הטקסט">א-</button>
          <button type="button" className="okb-btn" onClick={() => setSize(s => Math.min(48, s + 4))} aria-label="הגדלת הטקסט">א+</button>
        </span>
        {siteKb !== null && <button type="button" className="okb-btn okb-phone" onClick={() => { setSiteKb(s => !s); ta.current?.blur() }}>{siteKb ? '📱 להקליד במקלדת הטלפון' : '⌨️ להקליד במקלדת של האתר'}</button>}
      </div>

      <label htmlFor="okb-text" className="sr-only">הטקסט שלכם</label>
      <textarea id="okb-text" ref={ta} className="okb-text" dir="auto" rows={5} value={text} style={{ fontSize: size }}
        onChange={e => put(e.target.value)} onKeyDown={onKeyDown} inputMode={siteKb ? 'none' : undefined}
        placeholder={lang === 'he' ? 'מקלידים כאן… גם אם המחשב באנגלית, יוצאת עברית' : 'Type here…'} spellCheck={lang === 'en'} autoCapitalize="off" autoCorrect="off" />
      <div className="okb-meta">
        <span>{words} מילים · {chars} תווים</span>
        {wpm > 0 && <span>קצב: <b>{wpm}</b> מילים לדקה{wpm < 35 && <> · <Link to={lang === 'en' ? '/typing/english' : '/typing'}>רוצים יותר? הקלדה עיוורת</Link></>}</span>}
        {fingers && hintFinger && hintChar && <span className="okb-hint"><i style={{ background: FINGERS[hintFinger].color }} />„{hintChar === ' ' ? 'רווח' : hintChar}” מקלידים ב<b>{FINGERS[hintFinger].name}</b></span>}
      </div>

      <div className="okb-kb" dir="ltr" aria-label={lang === 'he' ? 'מקלדת עברית' : 'מקלדת אנגלית'}>
        {ROWS(lang).map((row, i) => <div key={i} className="okb-row">{row.map(code => {
          const mod = MOD[code]
          const finger = fingers && (FINGER_OF[code] || (code === 'ShiftLeft' ? 'LP' : code === 'ShiftRight' ? 'RP' : null))
          const on = (code.startsWith('Shift') && shift) || (code === 'CapsLock' && caps) || lastCode === code
          const label = code === 'Lang' ? (lang === 'he' ? '🌐 English' : '🌐 עברית') : code === 'Clear' ? '🧹 ניקוי' : mod ? mod[0] : charFor(lang, code, { shift, caps })
          const sub = !mod && (lang === 'he' ? /^[A-Z]$/.test(LATIN_ON_KEY[code]) && LATIN_ON_KEY[code] : /[א-ת]/.test(HE_ON_KEY[code]) && HE_ON_KEY[code])
          return <button key={code} type="button" className={'okb-key' + (mod ? ' is-mod' : '') + (on ? ' is-on' : '') + (code === 'KeyF' || code === 'KeyJ' ? ' is-bump' : '')}
            style={{ flexGrow: mod ? mod[1] : 1, background: finger ? `color-mix(in srgb, ${FINGERS[finger].color} ${on ? 100 : 55}%, white)` : undefined }}
            onMouseDown={e => e.preventDefault()} onClick={() => press(code)}
            aria-label={code === 'Space' ? 'רווח' : code === 'Backspace' ? 'מחיקה' : code.startsWith('Shift') ? 'שיפט' : undefined}>
            <span>{label}</span>{sub && <small>{sub}</small>}
          </button>
        })}</div>)}
      </div>

      {emoji && <div className="mt-3"><EmojiPicker onPick={type} /></div>}
      {lang === 'he' && <div className="okb-extra" aria-label="ניקוד">
        <span className="okb-extra-title">ניקוד:</span>
        {NIQQUD.map(n => <button key={n.mark} type="button" className="okb-chip" title={n.name} aria-label={n.name} onMouseDown={e => e.preventDefault()} onClick={() => type(n.mark)}>
          <span className="okb-niq">ב{n.mark}</span><small>{n.name.replace(/[֑-ׇ]/g, '')}</small>
        </button>)}
        {VAV_VOWELS.map(v => <button key={v.text} type="button" className="okb-chip" title={v.name} onMouseDown={e => e.preventDefault()} onClick={() => type(v.text)}>
          <span className="okb-niq">{v.text}</span><small>{v.name.replace(/[֑-ׇ]/g, '')}</small>
        </button>)}
      </div>}
      <div className="okb-extra" aria-label="סימנים">
        <span className="okb-extra-title">סימנים:</span>
        {SYMBOLS.map(s => <button key={s} type="button" className="okb-chip okb-sym" onMouseDown={e => e.preventDefault()} onClick={() => type(s)}>{s}</button>)}
      </div>

      <div className="okb-actions">
        <button type="button" className="okb-btn okb-primary" onClick={copy} disabled={!text}>{copied ? '✔ הועתק!' : '📋 העתקה'}</button>
        <a className={'okb-btn okb-wa' + (text ? '' : ' is-disabled')} href={text ? `https://wa.me/?text=${encodeURIComponent(text)}` : undefined} target="_blank" rel="noopener noreferrer">💬 שליחה בוואטסאפ</a>
        <a className={'okb-btn' + (text ? '' : ' is-disabled')} href={text ? `https://www.google.com/search?q=${encodeURIComponent(text)}` : undefined} target="_blank" rel="noopener noreferrer">🔎 חיפוש בגוגל</a>
        <button type="button" className="okb-btn" onClick={download} disabled={!text}>💾 שמירה כקובץ</button>
        {hasNiqqud && <button type="button" className="okb-btn" onClick={() => put(removeNiqqud(text))}>הסרת ניקוד</button>}
        <Link className="okb-btn" to="/tools/keyboard-fix">🔁 כתבתי בשפה הלא נכונה</Link>
      </div>
    </section>

    <section className="mt-10" aria-labelledby="okb-course">
      <h2 id="okb-course" className="text-2xl">רוצים להקליד בלי להסתכל על המקלדת?</h2>
      <p className="mt-1 text-lg">המקלדת כאן צבועה באותם צבעים כמו בקורס ההקלדה העיוורת שלנו. מתחילים משורת הבית, ותוך כמה שבועות של עשר דקות ביום מקלידים פי שניים מהר — בלי להוריד את העיניים מהמסך.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COURSE.map(c => <Link key={c.to} to={c.to} className="okb-course">
          <span aria-hidden="true" className="text-3xl">{c.emoji}</span><b>{c.title}</b><span>{c.desc}</span>
        </Link>)}
      </div>
    </section>

    <div className="mt-10 no-present"><h2 className="mb-4 text-2xl">איך משתמשים במקלדת?</h2>
      <SeoBody paragraphs={[
        'אפשר ללחוץ על המקשים בעכבר או באצבע, או פשוט להקליד במקלדת של המחשב. כשבוחרים „עברית” והמחשב מוגדר לאנגלית, כל מקש כותב את האות העברית שמודפסת עליו במקלדת ישראלית. כך אפשר לכתוב עברית בכל מחשב, גם בחו״ל ובלי להתקין שפה. המקש שנלחץ נדלק על המסך, כדי ללמוד איפה כל אות נמצאת.',
        'הניקוד נמצא מתחת למקלדת: כותבים אות ולוחצים על הסימן, והוא מתחבר לאות שלפני הסמן. יש גם שורוק וחולם מלא בלחיצה אחת, שי״ן ושׂי״ן, וסימנים שאין במקלדת רגילה כמו ₪, גרש וגרשיים אמיתיים ומקף עברי.',
        'כשמפעילים את צבעי האצבעות, כל מקש נצבע לפי האצבע שאמורה ללחוץ עליו בהקלדה עיוורת, ואחרי כל הקשה כתוב באיזו אצבע להשתמש. מתחת לטקסט מופיע גם קצב ההקלדה במילים לדקה, וממנו אפשר לעבור לקורס ההקלדה העיוורת, למבחן המהירות ולמשחק.',
      ]} faq={FAQ} related={[{ href: '/typing', label: 'קורס הקלדה עיוורת' }, { href: '/tools/keyboard-fix', label: 'תיקון טקסט שנכתב בשפה הלא נכונה' }, { href: '/tools', label: 'כל הכלים החינמיים' }]} />
    </div>
  </div>
}

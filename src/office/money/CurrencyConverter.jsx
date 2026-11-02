// /tools/currency — free currency converter. Rates come only from our own /api/rates
// (functions/api/rates.js); the last good table is kept in localStorage for offline use.
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import {
  CURRENCIES, BY_CODE, POPULAR_COUNT, QUICK_PAIRS, parseAmount, convert, unitRate, travelTable,
  formatMoney, plainMoney, formatRate, formatDate, searchCurrencies, fetchLiveRates, pickRates, validateRates,
} from './moneyLogic'
import { copyText } from './copy'
import './money.css'

const QUICK_LABELS = { USD: 'דולר', EUR: 'אירו', THB: 'באט', GEL: 'לארי', GBP: 'פאונד', TRY: 'לירה טורקית' }
const RATES_KEY ='ugabuga-currency-rates'
const PREFS_KEY = 'ugabuga-currency-prefs'
const readJSON = key => { try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null } }
const writeJSON = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode / full */ } }

function loadPrefs() {
  const p = readJSON(PREFS_KEY)
  const ok = c => typeof c === 'string' && BY_CODE[c]
  return {
    amount: p && typeof p.amount === 'string' && p.amount.length < 30 ? p.amount : '100',
    from: p && ok(p.from) ? p.from : 'USD',
    to: p && ok(p.to) ? p.to : 'ILS',
  }
}

const FAQ = [
  { q: 'מאיפה מגיעים השערים וכל כמה זמן הם מתעדכנים?', a: 'השערים נלקחים ממקור ציבורי פתוח של שערי חליפין בינלאומיים ומתעדכנים בערך פעם ביום. מעל התוצאה כתוב לאיזה תאריך השער מעודכן, כך שתמיד יודעים על מה החישוב מבוסס.' },
  { q: 'למה בבנק או בצ׳יינג׳ קיבלתי פחות ממה שהמחשבון הראה?', a: 'המחשבון מציג שער ייחוס, קרוב לאמצע בין שער הקנייה לשער המכירה. בבנק, בצ׳יינג׳, בכספומט בחו״ל ובחיוב כרטיס אשראי במטבע זר מוסיפים בדרך כלל מרווח או עמלה. לכן הסכום בפועל יהיה מעט נמוך יותר כשקונים מטבע, ומעט גבוה יותר כשמשלמים.' },
  { q: 'איך יודעים כמה שווה 1,000 באט תאילנדי בשקלים?', a: 'בוחרים באט תאילנדי בשדה הראשון ושקל בשדה השני (או לוחצים על הכפתור ₪↔฿), ומקלידים 1000. מתחת לתוצאה מופיעה גם טבלה קטנה עם 100, 500, 1,000 ו־5,000 באט, נוחה לבדיקה מהירה של מחירים בשוק או במסעדה.' },
  { q: 'מה המטבע בגאורגיה ואיך ממירים לארי לשקל?', a: 'בגאורגיה משתמשים בלארי גאורגי (GEL, ₾). אפשר לחפש במחשבון "גאורגיה", "גרוזיה" או "טביליסי" ולבחור את הלארי, או ללחוץ על הכפתור ₪↔₾.' },
  { q: 'איזה מטבע משתמשים ביוון, בקפריסין ובמונטנגרו?', a: 'בכל שלושתן משלמים באירו. בחיפוש המטבע אפשר להקליד את שם המדינה, למשל "קפריסין", והאירו יופיע ראשון.' },
  { q: 'האם המחשבון עובד גם בלי אינטרנט?', a: 'כן, ברמה בסיסית. השערים האחרונים שנטענו נשמרים במכשיר. כשאין חיבור מופיעה הודעה עם התאריך של השערים השמורים, כדי שיהיה ברור שהם לא בהכרח עדכניים.' },
]

function CurrencyPicker({ label, value, onChange }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const wrap = useRef(null)
  const btn = useRef(null)
  const input = useRef(null)
  const listRef = useRef(null)
  const list = useMemo(() => searchCurrencies(q), [q])
  const cur = BY_CODE[value]

  useEffect(() => {
    if (!open) return
    const away = e => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const show = () => { setQ(''); setActive(Math.max(0, CURRENCIES.findIndex(c => c.code === value))); setOpen(true) }
  const choose = code => { onChange(code); setOpen(false); btn.current?.focus() }
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(list.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (list[active]) choose(list[active].code) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btn.current?.focus() }
  }

  return <div className="mc-picker" ref={wrap}>
    <span className="mc-label" id={`${id}-l`}>{label}</span>
    <button type="button" ref={btn} className="mc-pick" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${id}-l ${id}-v`} onClick={() => open ? setOpen(false) : show()}>
      <span className="mc-flag" aria-hidden="true">{cur.flag}</span>
      <span id={`${id}-v`} className="mc-pick-text"><b>{cur.name}</b><small>{cur.country} · {cur.code}</small></span>
      <span className="mc-chev" aria-hidden="true">▾</span>
    </button>
    {open && <div className="mc-pop">
      <input ref={input} type="search" className="mc-search" value={q} placeholder="חיפוש: תאילנד, דולר, baht…" aria-label={`חיפוש מטבע — ${label}`}
        role="combobox" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={list[active] ? `${id}-o-${list[active].code}` : undefined} aria-autocomplete="list"
        onChange={e => { setQ(e.target.value); setActive(0) }} onKeyDown={onKey} />
      <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label={label} className="mc-list">
        {list.length === 0 && <li className="mc-empty" role="presentation">לא מצאנו מטבע כזה. נסו שם של מדינה או קוד כמו THB.</li>}
        {list.map((c, i) => <li key={c.code} role="presentation">
          {!q && i === 0 && <div className="mc-group">הכי מבוקשים</div>}
          {!q && i === POPULAR_COUNT && <div className="mc-group">כל המטבעות</div>}
          <div id={`${id}-o-${c.code}`} data-i={i} role="option" aria-selected={c.code === value} className={`mc-opt${i === active ? ' is-active' : ''}`}
            onPointerMove={() => setActive(i)} onClick={() => choose(c.code)}>
            <span className="mc-flag" aria-hidden="true">{c.flag}</span>
            <span className="mc-opt-text"><b>{c.name}</b><small>{c.country}</small></span>
            <span className="mc-code" dir="ltr">{c.code}</span>
          </div>
        </li>)}
      </ul>
    </div>}
  </div>
}

function RateStatus({ state, onRetry }) {
  const date = formatDate(state.data.date)
  if (state.loading && state.source !== 'live') return <p className="mc-status">⏳ טוענים שערים עדכניים… בינתיים מוצגים שערים מ־{date}.</p>
  if (state.source === 'live') return <p className="mc-status is-live">✅ שער מעודכן ל־{date}</p>
  return <div className="mc-status is-warn" role="status">
    <span>{state.source === 'saved'
      ? <>⚠️ אין חיבור לשערים עדכניים כרגע. מוצגים השערים האחרונים שנשמרו במכשיר, מ־{date}.</>
      : <>⚠️ לא הצלחנו לטעון שערים עדכניים. מוצגים שערים משוערים מ־{date}, ולכן התוצאה עשויה להיות לא מדויקת.</>}</span>
    <button type="button" className="mc-link" onClick={onRetry}>לנסות שוב</button>
  </div>
}

export default function CurrencyConverter() {
  const [prefs] = useState(loadPrefs)
  const [amount, setAmount] = useState(prefs.amount)
  const [from, setFrom] = useState(prefs.from)
  const [to, setTo] = useState(prefs.to)
  const [rates, setRates] = useState(() => ({ ...pickRates(null, readJSON(RATES_KEY)), loading: true }))
  const [copied, setCopied] = useState('')
  const [spin, setSpin] = useState(false)

  const load = async () => {
    setRates(r => ({ ...r, loading: true }))
    const live = await fetchLiveRates()
    if (live) writeJSON(RATES_KEY, live)
    setRates({ ...pickRates(live, readJSON(RATES_KEY)), loading: false })
  }
  const loadRef = useRef(load)
  useEffect(() => { void loadRef.current() }, [])
  useEffect(() => { writeJSON(PREFS_KEY, { amount, from, to }) }, [amount, from, to])

  const r = rates.data.rates
  const n = parseAmount(amount)
  const result = n === null ? null : convert(n, from, to, r)
  const fwd = unitRate(from, to, r)
  const back = unitRate(to, from, r)
  const table = travelTable(from, to, r)
  const F = BY_CODE[from], T = BY_CODE[to]
  const missing = !validateRates(rates.data) || !r[from] || !r[to]

  const swap = () => { setFrom(to); setTo(from); setSpin(s => !s) }
  const pair = code => {
    if (from === code && to === 'ILS') { setFrom('ILS'); setTo(code) }
    else { setFrom(code); setTo('ILS') }
  }
  const copy = async (text, what) => { if (await copyText(text)) { setCopied(what); setTimeout(() => setCopied(c => c === what ? '' : c), 1800) } }

  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="המרת מטבע — דולר, אירו, באט תאילנדי ולארי גאורגי לשקל" description="מחשבון המרת מטבע חינם בשערים עדכניים: המרת דולר לשקל, אירו, באט תאילנדי, לארי גאורגי, לירה טורקית ועוד כ־45 מטבעות. חיפוש בעברית וטבלה מהירה לטיול." path="/tools/currency" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'המרת מטבע' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">המרת מטבע — כמה זה בשקלים?</h1>
    <p className="text-center mb-6">מקלידים סכום, בוחרים מטבעות ורואים מיד את התוצאה. דולר, אירו, באט תאילנדי, לארי גאורגי ועוד הרבה.</p>

    <section className="mc-card" aria-label="מחשבון המרת מטבע">
      <div className="mc-chips" aria-label="המרות נפוצות">
        {QUICK_PAIRS.map(code => {
          const c = BY_CODE[code]
          const on = (from === code && to === 'ILS') || (from === 'ILS' && to === code)
          return <button key={code} type="button" className="mc-chip" aria-pressed={on} onClick={() => pair(code)} title={`${c.name} ושקל`}>
            <span>₪ ↔ {QUICK_LABELS[code] || c.name}</span> <span className="mc-chip-sym" dir="ltr" aria-hidden="true">{c.symbol}</span>
          </button>
        })}
      </div>

      <label className="mc-amount">
        <span className="mc-label">כמה להמיר?</span>
        <span className="mc-amount-box" dir="ltr">
          <span className="mc-sym" aria-hidden="true">{F.symbol}</span>
          <input type="text" inputMode="decimal" autoComplete="off" value={amount} onChange={e => setAmount(e.target.value)} onFocus={e => e.target.select()} aria-describedby="mc-amount-hint" />
        </span>
        <span id="mc-amount-hint" className="mc-hint">{n === null && amount.trim() ? 'הקלידו מספר, למשל 250 או 99.90' : `${F.name} (${F.code})`}</span>
      </label>

      <div className="mc-pair">
        <CurrencyPicker label="מ־" value={from} onChange={setFrom} />
        <button type="button" className={`mc-swap${spin ? ' is-spun' : ''}`} onClick={swap} aria-label="החלפת כיוון ההמרה" title="החלפת כיוון">⇄</button>
        <CurrencyPicker label="ל־" value={to} onChange={setTo} />
      </div>

      <div className="mc-result" aria-live="polite">
        {missing ? <p>אין לנו כרגע שער למטבע הזה. נסו מטבע אחר או לנסות שוב מאוחר יותר.</p>
          : result === null ? <p className="mc-result-empty">הקלידו סכום כדי לראות כמה זה שווה.</p>
          : <>
            <p className="mc-from" dir="ltr"><bdi>{formatMoney(n, from)} {F.symbol}</bdi> <span>{F.code}</span> =</p>
            <p className="mc-big" dir="ltr"><bdi>{formatMoney(result, to)}</bdi> <span className="mc-big-sym">{T.symbol}</span></p>
            <p className="mc-to-name">{T.flag} {T.name}</p>
            <div className="mc-actions">
              <button type="button" className="mc-btn" onClick={() => copy(plainMoney(result, to), 'sum')}>{copied === 'sum' ? '✓ הועתק' : '📋 העתקת הסכום'}</button>
              <button type="button" className="mc-btn" onClick={() => copy(`${formatMoney(n, from)} ${F.code} = ${formatMoney(result, to)} ${T.code}`, 'line')}>{copied === 'line' ? '✓ הועתק' : 'העתקת השורה'}</button>
            </div>
            <p className="mc-rates" dir="ltr"><bdi>1 {F.code} = {formatRate(fwd)} {T.code}</bdi><span aria-hidden="true"> · </span><bdi>1 {T.code} = {formatRate(back)} {F.code}</bdi></p>
          </>}
        <RateStatus state={rates} onRetry={load} />
      </div>
    </section>

    {table && !missing && <section className="mc-card mc-table-card" aria-labelledby="mc-table-title">
      <h2 id="mc-table-title" className="text-2xl mb-3">טבלה מהירה לטיול: {BY_CODE[table.foreign].name}</h2>
      <table className="mc-table">
        <thead><tr><th scope="col">{BY_CODE[table.foreign].name}</th><th scope="col">{BY_CODE[table.other].name}</th></tr></thead>
        <tbody>{table.rows.map(row => <tr key={row.amount}>
          <td dir="ltr"><bdi>{formatMoney(row.amount, table.foreign)} {BY_CODE[table.foreign].symbol}</bdi></td>
          <td dir="ltr"><bdi>{formatMoney(row.result, table.other)} {BY_CODE[table.other].symbol}</bdi></td>
        </tr>)}</tbody>
      </table>
      <p className="mc-hint mt-2">טיפ: צלמו את הטבלה מסך לפני הטיסה, כדי לבדוק מחירים גם בלי אינטרנט.</p>
    </section>}

    <aside className="mc-note">
      <b>חשוב לדעת:</b> זהו שער ייחוס בינלאומי, קרוב לאמצע בין שער הקנייה לשער המכירה, ולא בהכרח השער היציג של בנק ישראל. בנקים, חברות אשראי וצ׳יינג׳ים מוסיפים בדרך כלל עמלה או מרווח, כך שהסכום בפועל יהיה שונה מעט. המחשבון נועד להערכה בלבד ואינו ייעוץ פיננסי.
    </aside>

    <div className="mt-10 no-present"><h2 className="text-2xl mb-4">איך ממירים מטבע בלי להתבלבל</h2>
      <SeoBody paragraphs={[
        'המרת מטבע היא בעצם כפל בשער. אם דולר אחד שווה בערך 3 שקלים וקצת, אז 20 דולר שווים קצת יותר מ־60 שקלים. המחשבון עושה את החשבון המדויק בשבילכם, ומראה גם את השער לשני הכיוונים: כמה שקלים שווה יחידה אחת של המטבע הזר, וכמה מטבע זר מקבלים על שקל אחד.',
        'בטיול כדאי להחזיק בראש "מספר קסם" אחד. בתאילנד, למשל, 100 באט שווים בערך עשרה שקלים, אז מחיר בבאט מחולק בעשר נותן הערכה מהירה בשקלים. בגאורגיה הלארי קרוב לשקל, כך שהמחיר בלארי נותן תחושה טובה של המחיר בשקלים. הטבלה המהירה במחשבון עוזרת לבנות את ה"מספר" הזה לכל יעד.',
        'כשמשווים מחירים, זכרו שהמחיר בפועל תלוי גם בדרך התשלום. משיכה מכספומט בחו״ל, המרה בצ׳יינג׳ או חיוב בכרטיס אשראי במטבע זר כוללים לעתים עמלה. אם מציעים לכם לשלם בשקלים במקום במטבע המקומי, כדאי לבדוק באיזה שער החישוב נעשה.',
      ]} faq={FAQ} related={[{ href: '/tools/vat', label: 'מחשבון מע״מ 18%' }, { href: '/tools/percent-calculator', label: 'מחשבון אחוזים והנחות' }, { href: '/tools', label: 'כל הכלים' }]} />
    </div>
  </div>
}

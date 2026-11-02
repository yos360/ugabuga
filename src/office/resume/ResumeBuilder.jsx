// /tools/resume — free Hebrew CV builder: form + live A4 preview, 20+ templates, click-to-edit,
// free text boxes and lines, undo, autosave in this browser only, PDF through the browser's print dialog.
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import CvDocument from './CvDocument'
import { TEMPLATES, TEMPLATE_IDS, TEMPLATE_TAGS, templateById } from './templates'
import {
  ACCENTS, DEFAULT_LABELS, PAGE_H_MM, PAGE_W_MM, PX_PER_MM, SECTIONS, OPTIONAL_SECTIONS,
  addItem, emptyState, fileTitle, label, loadState, moveItem, moveSection, newId, pushHistory,
  removeItem, safePhoto, sampleCv, saveState, setPath, updateItem,
} from './resumeLogic'
import './resume.css'

const PAGE_PX = PAGE_W_MM * PX_PER_MM
const PAGE_H_PX = PAGE_H_MM * PX_PER_MM
const SAMPLE = sampleCv()

const TIPS = {
  personal: ['שם, טלפון ומייל — זה מה שחייב להופיע. כתובת מלאה ות״ז לא צריך, מספיק עיר.', 'מייל רציני בשמכם (לא כינוי מהתיכון). אין? פותחים אחד בחינם בחמש דקות.', 'בשורת התפקיד כתבו את המשרה שאתם מחפשים, למשל „מזכירה רפואית”.'],
  summary: ['2–3 משפטים, לא יותר. מי אתם, במה אתם חזקים ומה אתם מחפשים.', 'התאימו את התקציר לכל משרה: מילה או שתיים מתוך המודעה עושות הבדל.'],
  experience: ['מהעבודה האחרונה אחורה. מספיקות 10–15 השנים האחרונות.', 'בכל שורה פועל + תוצאה: „צמצמתי זמני המתנה ב-20%” עדיף על „אחראית על לקוחות”.', 'גם עבודות קטנות נחשבות: מלצרות, בייביסיטר, קייטנה, עבודה בחנות.'],
  military: ['כתבו את התפקיד במילים שמבינים גם באזרחות: „ניהלתי צוות של 8” ולא רק ראשי תיבות.', 'שירות לאומי, מכינה ושנת שירות — שייכים לכאן.'],
  education: ['התואר או המגמה, המוסד והשנים. ממוצע רק אם הוא גבוה.', 'קורסים מקצועיים, תעודות והסמכות נכנסים כאן — גם קצרים.'],
  languages: ['רמה כנה: שפת אם, שוטפת, טובה מאוד, בסיסית.', 'שפה נוספת היא יתרון אמיתי בשירות ובמכירות — אל תוותרו עליה.'],
  skills: ['כישור בכל שורה. עדיף מעשי: תוכנות, מערכות, רישיונות, הקלדה.', '5–8 כישורים מספיקים. „עבודה בצוות” — רק אם יש לכם דוגמה.'],
  volunteer: ['התנדבות מראה אחריות ויוזמה, במיוחד בלי ניסיון בעבודה.', 'תחביבים — שניים-שלושה, אמיתיים. הם נותנים נושא לשיחה בראיון.'],
}

const FAQ = [
  { q: 'איך כותבים קורות חיים בעברית?', a: 'מלמעלה למטה: שם ופרטי קשר, תקציר קצר, ניסיון תעסוקתי מהאחרון לראשון, שירות צבאי או לאומי, השכלה, שפות וכישורים. בכל תפקיד כתבו שתיים-שלוש שורות של מה עשיתם ומה יצא מזה. כאן ממלאים את הטופס או לוחצים ישר על הטקסט שבדף, והעיצוב מסתדר לבד.' },
  { q: 'קורות חיים צריכים להיות עמוד אחד או שניים?', a: 'עמוד אחד ברוב המקרים, במיוחד עד 10 שנות ניסיון. מגייסים מעיפים מבט של חצי דקה. אם הדף גולש, הכלי מראה את זה — מקצרים שורות, מורידים עבודות ישנות או עוברים למצב „צפוף”.' },
  { q: 'לשים תמונה בקורות חיים?', a: 'לא חובה, ובהייטק ובחברות גדולות לרוב מוותרים עליה. בשירות, מכירות, הוראה ומקצועות מול קהל תמונה מקצועית ונעימה יכולה לעזור. אם שמים — רקע נקי, חיוך, בלי משקפי שמש. התמונה נשארת במחשב שלכם ולא עולה לשום מקום.' },
  { q: 'מה כותבים בקורות חיים בלי ניסיון — אחרי צבא או בתור סטודנטים?', a: 'מתחילים מהשירות הצבאי או הלאומי, הלימודים וההתנדבות, וכותבים אותם כמו עבודה: אחריות, צוות, הישגים. עבודות קיץ, בייביסיטר ומלצרות נחשבות. יש תבניות „עבודה ראשונה”, „סטודנטים” ו„אחרי צבא” שמסדרות את החלקים בסדר הנכון.' },
  { q: 'איך לקרוא לקובץ קורות החיים?', a: 'שם מלא ומילה אחת על התפקיד, למשל „קורות חיים - נועה לוי.pdf”. הכלי ממלא את השם הזה לבד בחלון השמירה. שלחו PDF ולא Word, כדי שהעיצוב והעברית לא יתבלגנו אצל המגייס.' },
]

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Frank+Ruhl+Libre:wght@400;500;700&family=Rubik:wght@400;500;700&display=swap'
function useCvFonts() {
  useEffect(() => {
    if (document.querySelector('link[data-rs-fonts]')) return
    const l = document.createElement('link')
    l.rel = 'stylesheet'; l.href = FONTS_HREF; l.dataset.rsFonts = '1'
    document.head.appendChild(l)
  }, [])
}

// Shrink a picked photo to a small JPEG so it fits in localStorage. It never leaves the browser.
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, 360 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')) }
    img.src = url
  })
}

// ── form pieces ──
function Field({ label: lbl, value, onChange, ph, ltr, type = 'text', rows, className = '' }) {
  const common = { value, placeholder: ph, onChange: e => onChange(e.target.value), dir: ltr ? 'ltr' : undefined, className: 'rs-in' }
  return (
    <label className={`rs-field ${className}`}>
      <span>{lbl}</span>
      {rows ? <textarea rows={rows} {...common} /> : <input type={type} {...common} />}
    </label>
  )
}

function Tips({ list }) {
  return <ul className="rs-tips" aria-label="טיפים">{list.map((t, i) => <li key={i}>{t}</li>)}</ul>
}

function Card({ id, title, tips, optional, children, order, onMove }) {
  const i = order ? order.indexOf(id) : -1
  return (
    <section className="rs-card" id={`rs-f-${id}`}>
      <div className="rs-card-head">
        <h2>{title}{optional && <small> (לא חובה)</small>}</h2>
        {onMove && i >= 0 && (
          <span className="rs-mini">
            <button type="button" onClick={() => onMove(id, -1)} disabled={i === 0} aria-label={`להזיז את ${title} למעלה בקורות החיים`} title="למעלה בדף">▲</button>
            <button type="button" onClick={() => onMove(id, 1)} disabled={i === order.length - 1} aria-label={`להזיז את ${title} למטה בקורות החיים`} title="למטה בדף">▼</button>
          </span>
        )}
      </div>
      {tips && <Tips list={tips} />}
      {children}
    </section>
  )
}

const ITEM_FIELDS = {
  experience: { add: '+ עוד עבודה', one: 'עבודה', f: [['title', 'תפקיד', 'למשל: קופאית, נציג מכירות'], ['place', 'מקום ועיר', 'למשל: סופר השכונה, חיפה'], ['years', 'שנים', '2021 – 2023'], ['text', 'מה עשיתם (שורה לכל דבר)', 'טיפלתי ב-40 לקוחות ביום\nקיבלתי „עובדת החודש” פעמיים']] },
  education: { add: '+ עוד לימודים', one: 'לימודים', f: [['title', 'תואר / מגמה / קורס', 'למשל: בגרות מלאה, מגמת מחשבים'], ['place', 'מוסד', 'למשל: תיכון עירוני ד׳'], ['years', 'שנים', '2016 – 2019'], ['text', 'פרטים (לא חובה)', 'ממוצע 92\nפרויקט גמר באפליקציות']] },
  military: { add: '+ הוספת שירות', one: 'שירות', f: [['title', 'תפקיד', 'למשל: מש״קית חינוך, לוחם'], ['place', 'יחידה / שירות לאומי', 'למשל: חיל האוויר, שירות לאומי בבית חולים'], ['years', 'שנים', '2019 – 2021'], ['text', 'מה עשיתם (שורה לכל דבר)', 'ניהלתי צוות של 6 חיילים\nקיבלתי תעודת הצטיינות']] },
}

function ItemList({ s, list, setCv }) {
  const cfg = ITEM_FIELDS[s]
  return (
    <div className="space-y-3">
      {list.map((it, i) => (
        <div className="rs-itembox" key={it.id}>
          <div className="rs-itembar">
            <b>{cfg.one} {i + 1}</b>
            <span className="rs-mini">
              <button type="button" disabled={i === 0} onClick={() => setCv(cv => ({ ...cv, [s]: moveItem(cv[s], it.id, -1) }))} aria-label="למעלה">▲</button>
              <button type="button" disabled={i === list.length - 1} onClick={() => setCv(cv => ({ ...cv, [s]: moveItem(cv[s], it.id, 1) }))} aria-label="למטה">▼</button>
              <button type="button" onClick={() => setCv(cv => ({ ...cv, [s]: removeItem(cv[s], it.id) }))} aria-label={`מחיקת ${cfg.one} ${i + 1}`}>✕</button>
            </span>
          </div>
          <div className="rs-grid2">
            {cfg.f.map(([k, lbl, ph]) => (
              <Field key={k} label={lbl} ph={ph} value={it[k]} rows={k === 'text' ? 3 : undefined} className={k === 'text' ? 'rs-span2' : ''}
                onChange={v => setCv(cv => ({ ...cv, [s]: updateItem(cv[s], it.id, { [k]: v }) }), `${s}.${it.id}.${k}`)} />
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="rs-btn alt" onClick={() => setCv(cv => ({ ...cv, [s]: addItem(cv[s], s) }))}>{cfg.add}</button>
    </div>
  )
}

const Thumb = memo(function Thumb({ tpl, accent, active, onPick }) {
  return (
    <button type="button" className={'rs-thumb' + (active ? ' on' : '')} onClick={() => onPick(tpl.id)} aria-pressed={active} title={tpl.name}>
      <span className="rs-thumb-page" aria-hidden="true" data-keep-colors>
        <CvDocument cv={SAMPLE} design={{ accent, compact: false }} tpl={tpl} mode="thumb" />
      </span>
      <span className="rs-thumb-name">{tpl.photo !== 'none' ? '📷 ' : ''}{tpl.name}</span>
    </button>
  )
})

function Gallery({ design, setDesign }) {
  const [tag, setTag] = useState('הכול')
  const shown = TEMPLATES.filter(t => tag === 'הכול' || t.tag === tag)
  const pick = useCallback(id => setDesign(d => ({ ...d, template: id })), [setDesign])
  return (
    <div className="rs-box">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h2 className="text-xl font-bold ml-2">🎨 {TEMPLATES.length} תבניות</h2>
        {TEMPLATE_TAGS.map(t => <button key={t} type="button" className={'rs-chip' + (t === tag ? ' on' : '')} onClick={() => setTag(t)}>{t}</button>)}
      </div>
      <div className="rs-thumbs" data-nosnippet>
        {shown.map(t => <Thumb key={t.id} tpl={t} accent={design.accent || t.accent} active={design.template === t.id} onPick={pick} />)}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <b>צבע:</b>
        <button type="button" className={'rs-swatch rs-swatch-auto' + (!design.accent ? ' on' : '')} onClick={() => setDesign(d => ({ ...d, accent: '' }))} aria-label="צבע התבנית" title="צבע התבנית">✦</button>
        {ACCENTS.map(c => <button key={c} type="button" className={'rs-swatch' + (design.accent === c ? ' on' : '')} style={{ background: c }} onClick={() => setDesign(d => ({ ...d, accent: c }))} aria-label={`צבע ${c}`} />)}
        <label className="rs-check"><input type="checkbox" checked={design.compact} onChange={e => setDesign(d => ({ ...d, compact: e.target.checked }))} /> צפוף (יותר נכנס בעמוד)</label>
      </div>
    </div>
  )
}

// Scaled live A4 page with page-break marks and an overflow hint.
function Preview({ st, tpl, onEdit, onPhoto, sel, setSel, onExtra, onRemove, printH }) {
  const wrap = useRef(null), cvRef = useRef(null)
  const [w, setW] = useState(PAGE_PX)
  const [h, setH] = useState(PAGE_H_PX)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      if (wrap.current) setW(wrap.current.clientWidth - 28)
      if (cvRef.current) setH(cvRef.current.offsetHeight)
    })
    if (wrap.current) ro.observe(wrap.current)
    if (cvRef.current) ro.observe(cvRef.current)
    return () => ro.disconnect()
  }, [])
  const scale = Math.min(1, w / PAGE_PX)
  // page count comes from the clean print copy (edit hints add a little height on screen)
  const pages = Math.max(1, Math.ceil(((printH || h) - 2) / PAGE_H_PX))
  return (
    <div>
      {pages > 1 && (
        <p className="rs-warn" role="status">
          📄 יוצאים {pages} עמודים. לעמוד אחד: קצרו שורות, הורידו עבודות ישנות{st.design.compact ? '' : ' או סמנו „צפוף”'}.
        </p>
      )}
      <div ref={wrap} className="rs-stage" onPointerDown={() => setSel(null)}>
        <div style={{ height: h * scale, width: PAGE_PX * scale }} className="rs-scaler">
          <div style={{ transform: `scale(${scale})` }} className="rs-paper" data-keep-colors>
            <CvDocument cv={st.cv} design={st.design} tpl={tpl} extras={st.extras} mode="edit" onEdit={onEdit} onPhoto={onPhoto}
              sel={sel} onSelect={setSel} onExtra={onExtra} onRemove={onRemove} scale={scale} cvRef={cvRef} />
            {Array.from({ length: pages - 1 }, (_, i) => <div key={i} className="rs-break" style={{ top: (i + 1) * PAGE_H_PX }}><span>סוף עמוד {i + 1}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResumeBuilder() {
  useCvFonts()
  const [st, setSt] = useState(emptyState)
  const [ready, setReady] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [sel, setSel] = useState(null)
  const [note, setNote] = useState('')
  const [mounted, setMounted] = useState(false)
  const stRef = useRef(st)
  const hist = useRef([])
  const photoInput = useRef(null)
  const printRef = useRef(null)
  const [printH, setPrintH] = useState(0)
  const tpl = templateById(st.design.template)

  useEffect(() => {
    const saved = loadState(window.localStorage, TEMPLATE_IDS)
    if (saved) { stRef.current = saved; setSt(saved) }
    setReady(true); setMounted(true)
  }, [])
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => { if (!saveState(window.localStorage, st)) setNote('⚠️ הדפדפן לא שומר את הטיוטה (אולי גלישה בסתר או תמונה גדולה מדי). אל תסגרו את הדף לפני שמורידים PDF.') }, 400)
    return () => clearTimeout(t)
  }, [st, ready])

  const commit = useCallback((fn, key) => {
    const prev = stRef.current, next = fn(prev)
    if (next === prev) return
    hist.current = pushHistory(hist.current, prev, key, Date.now())
    stRef.current = next; setSt(next); setCanUndo(true)
  }, [])
  const undo = useCallback(() => {
    const h = hist.current
    if (!h.length) return
    const last = h[h.length - 1]
    hist.current = h.slice(0, -1)
    stRef.current = last.s; setSt(last.s); setCanUndo(hist.current.length > 0)
  }, [])
  const setCv = useCallback((fn, key) => commit(s => ({ ...s, cv: fn(s.cv) }), key), [commit])
  const setDesign = useCallback(fn => commit(s => ({ ...s, design: fn(s.design) }), 'design'), [commit])
  const onEdit = useCallback((path, value) => setCv(cv => setPath(cv, path, value)), [setCv])
  const onExtra = useCallback((id, patch, key) => commit(s => ({ ...s, extras: s.extras.map(x => x.id === id ? { ...x, ...patch } : x) }), key), [commit])
  const onRemove = useCallback(id => { commit(s => ({ ...s, extras: s.extras.filter(x => x.id !== id) })); setSel(null) }, [commit])
  const addExtra = kind => {
    const id = newId('x'), n = stRef.current.extras.length
    commit(s => ({ ...s, extras: [...s.extras, { id, kind, x: kind === 'accent' ? 20 : 15, y: 30 + (n % 8) * 12, w: kind === 'text' ? 70 : kind === 'accent' ? 25 : 180, size: 11, bold: false, text: '' }] }))
    setSel(id)
  }
  const onMoveSection = useCallback((id, dir) => setCv(cv => ({ ...cv, order: moveSection(cv.order || tpl.order || SECTIONS, id, dir) })), [setCv, tpl])
  const pickPhoto = useCallback(() => photoInput.current?.click(), [])
  const onPhotoFile = async e => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { const photo = safePhoto(await readPhoto(f)); if (photo) setCv(cv => ({ ...cv, personal: { ...cv.personal, photo } })) } catch { setNote('⚠️ לא הצלחנו לקרוא את התמונה. נסו קובץ JPG או PNG.') }
  }

  useEffect(() => {
    const el = printRef.current
    if (!mounted || !el) return
    const ro = new ResizeObserver(() => setPrintH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted])

  // Ctrl+Z (outside text fields) and Delete for a selected line
  useEffect(() => {
    const k = e => {
      const typing = e.target.closest?.('input, textarea, [contenteditable]')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !typing) { e.preventDefault(); undo() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [undo])

  // The saved PDF gets "קורות חיים - name" as its default file name.
  useEffect(() => {
    let old = ''
    const before = () => { old = document.title; document.title = fileTitle(stRef.current.cv) }
    const after = () => { if (old) document.title = old }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after) }
  }, [])

  const print = () => { setSel(null); if (document.activeElement?.blur) document.activeElement.blur(); setTimeout(() => window.print(), 50) }
  const reset = () => { if (window.confirm('למחוק את כל מה שכתבתם ולהתחיל דף חדש?')) { commit(() => emptyState()); setSel(null) } }
  const fillSample = () => commit(s => ({ ...s, cv: { ...sampleCv(), personal: { ...sampleCv().personal, photo: s.cv.personal.photo } } }))

  const { cv } = st
  const order = cv.order || tpl.order || SECTIONS
  const per = (k, v) => setCv(c => ({ ...c, personal: { ...c.personal, [k]: v } }), 'p.' + k)
  const textField = (s, lbl, ph, rows = 3) => <Field label={lbl} value={cv[s]} ph={ph} rows={rows} onChange={v => setCv(c => ({ ...c, [s]: v }), 's.' + s)} />
  const title = s => label(cv, s) || DEFAULT_LABELS[s]
  const formOrder = useMemo(() => order.filter(s => SECTIONS.includes(s)), [order])

  const forms = {
    summary: textField('summary', 'כמה משפטים עליכם', 'למשל: בוגרת שירות לאומי, אחראית ומהירה ללמוד. מחפשת משרת אדמיניסטרציה במשרה מלאה.'),
    experience: <ItemList s="experience" list={cv.experience} setCv={setCv} />,
    education: <ItemList s="education" list={cv.education} setCv={setCv} />,
    military: <ItemList s="military" list={cv.military} setCv={setCv} />,
    languages: (
      <div className="space-y-2">
        {cv.languages.map((l, i) => (
          <div className="rs-langrow" key={l.id}>
            <Field label="שפה" value={l.name} ph={['עברית', 'אנגלית', 'ערבית'][i % 3]} onChange={v => setCv(c => ({ ...c, languages: updateItem(c.languages, l.id, { name: v }) }), `l.${l.id}.n`)} />
            <Field label="רמה" value={l.level} ph={['שפת אם', 'טובה מאוד', 'בסיסית'][i % 3]} onChange={v => setCv(c => ({ ...c, languages: updateItem(c.languages, l.id, { level: v }) }), `l.${l.id}.l`)} />
            <span className="rs-mini">
              <button type="button" disabled={i === 0} onClick={() => setCv(c => ({ ...c, languages: moveItem(c.languages, l.id, -1) }))} aria-label="למעלה">▲</button>
              <button type="button" onClick={() => setCv(c => ({ ...c, languages: removeItem(c.languages, l.id) }))} aria-label={`מחיקת שפה ${i + 1}`}>✕</button>
            </span>
          </div>
        ))}
        <button type="button" className="rs-btn alt" onClick={() => setCv(c => ({ ...c, languages: addItem(c.languages, 'languages') }))}>+ עוד שפה</button>
      </div>
    ),
    skills: textField('skills', 'כישור בכל שורה', 'Excel\nרישיון נהיגה B\nהקלדה עיוורת\nשירות לקוחות', 5),
    volunteer: textField('volunteer', 'שורה לכל התנדבות', 'מדריכה בבני עקיבא (2018 – 2020)\nחלוקת סלי מזון לפני החגים'),
    hobbies: textField('hobbies', 'שורה לכל תחביב', 'כדורסל\nגיטרה', 2),
  }
  const tipsOf = s => TIPS[s === 'hobbies' ? 'volunteer' : s]

  return (
    <div className="rs-page mx-auto max-w-7xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="קורות חיים — יצירת קורות חיים בחינם בעברית" description="מחולל קורות חיים בעברית בחינם: 26 תבניות, עריכה בלחיצה על הטקסט, הורדה כ-PDF. בלי הרשמה, בלי סימן מים, ושום דבר לא נשלח לשרת." path="/tools/resume" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'קורות חיים' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📄 </span>קורות חיים בחינם</h1>
      <p className="text-center text-lg mb-1">ממלאים, בוחרים תבנית ומורידים PDF. בלי הרשמה ובלי סימן מים.</p>
      <p className="text-center text-sm mb-5 text-[var(--muted-foreground)]">🔒 הכול נשמר רק בדפדפן שלכם. שום פרט ושום תמונה לא נשלחים לשום מקום.</p>

      <Gallery design={st.design} setDesign={setDesign} />

      <div className="rs-layout mt-5">
        <div className="rs-form space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rs-btn alt" onClick={fillSample}>✨ מילוי דוגמה</button>
            <button type="button" className="rs-btn alt" onClick={reset}>🗑️ התחלה מחדש</button>
            <a href="#rs-preview" className="rs-btn alt no-underline lg:hidden">👀 לתצוגה</a>
          </div>
          {note && <p className="rs-warn">{note}</p>}

          <Card id="personal" title="פרטים אישיים" tips={TIPS.personal}>
            <div className="rs-grid2">
              <Field label="שם מלא" value={cv.personal.name} ph="למשל: דניאל כהן" onChange={v => per('name', v)} />
              <Field label="תפקיד / תחום" value={cv.personal.title} ph="למשל: מזכירה רפואית" onChange={v => per('title', v)} />
              <Field label="טלפון" type="tel" ltr value={cv.personal.phone} ph="050-1234567" onChange={v => per('phone', v)} />
              <Field label="מייל" type="email" ltr value={cv.personal.email} ph="daniel@gmail.com" onChange={v => per('email', v)} />
              <Field label="עיר" value={cv.personal.city} ph="למשל: באר שבע" onChange={v => per('city', v)} />
              <Field label="קישור (לא חובה)" ltr value={cv.personal.link} ph="linkedin.com/in/…" onChange={v => per('link', v)} />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={onPhotoFile} />
              {cv.personal.photo && <img src={cv.personal.photo} alt="התמונה שבחרתם" className="rs-photo-mini" />}
              <button type="button" className="rs-btn alt" onClick={pickPhoto}>📷 {cv.personal.photo ? 'החלפת תמונה' : 'הוספת תמונה (לא חובה)'}</button>
              {cv.personal.photo && <button type="button" className="rs-btn alt" onClick={() => setCv(c => ({ ...c, personal: { ...c.personal, photo: '' } }))}>הסרה</button>}
              {cv.personal.photo && tpl.photo === 'none' && <small>בתבנית הזאת אין מקום לתמונה — בחרו תבנית עם 📷.</small>}
            </div>
          </Card>

          {formOrder.map(s => (
            <Card key={s} id={s} title={title(s)} tips={tipsOf(s)} optional={OPTIONAL_SECTIONS.includes(s)} order={formOrder} onMove={onMoveSection}>
              {forms[s]}
            </Card>
          ))}
        </div>

        <div className="rs-right" id="rs-preview">
          <div className="rs-sticky">
            <div className="rs-toolbar">
              <button type="button" className="rs-btn" onClick={print}>📄 הורדה כ-PDF</button>
              <button type="button" className="rs-btn alt" onClick={print}>🖨️ הדפסה</button>
              <button type="button" className="rs-btn alt" onClick={undo} disabled={!canUndo} title="ביטול (Ctrl+Z)">↶ ביטול</button>
            </div>
            <p className="rs-hint">בחלון ההדפסה בחרו „שמירה כ-PDF”.</p>
            <div className="rs-toolbar rs-toolbar-add">
              <span>הוספה לדף:</span>
              <button type="button" className="rs-tool" onClick={() => addExtra('text')}>＋ טקסט</button>
              <button type="button" className="rs-tool" onClick={() => addExtra('line')}>― קו</button>
              <button type="button" className="rs-tool" onClick={() => addExtra('accent')}>▬ קו צבע</button>
              <button type="button" className="rs-tool" onClick={() => addExtra('dots')}>┈ קו מנוקד</button>
            </div>
            <p className="rs-hint">✏️ לחצו על כל טקסט בדף כדי לשנות אותו. קו או תיבה: לחיצה לבחירה, גרירה להזזה.</p>
            <Preview st={st} tpl={tpl} onEdit={onEdit} onPhoto={pickPhoto} sel={sel} setSel={setSel} onExtra={onExtra} onRemove={onRemove} printH={printH} />
          </div>
        </div>
      </div>

      <div className="mt-12"><SeoBody
        paragraphs={[
          'קורות חיים טובים הם קצרים, מסודרים וקלים לסריקה: מגייס צריך להבין תוך חצי דקה מי אתם ומה עשיתם. לכן הטופס כאן מחולק לפי הסדר שמקובל בישראל — פרטים, תקציר, ניסיון, צבא או שירות לאומי, השכלה, שפות וכישורים — ובכל חלק יש דוגמה קצרה וטיפים.',
          `יש ${TEMPLATES.length} תבניות: קלאסיות, מודרניות עם פס צבע או עמודה, תבניות עם תמונה, ותבניות לעבודה ראשונה, לסטודנטים ואחרי צבא. מחליפים תבנית וצבע בלחיצה, והתוכן נשאר. אפשר גם להוסיף תיבת טקסט או קו בכל מקום בדף, ולבטל כל שינוי.`,
        ]}
        faq={FAQ}
        related={[{ label: 'קורס אקסל חינם', href: '/excel' }, { label: 'הקלדה עיוורת', href: '/typing' }, { label: 'מבחן מהירות הקלדה', href: '/typing/test' }]}
      /></div>

      {mounted && createPortal(
        <div id="rs-print-out" aria-hidden="true" data-nosnippet>
          <CvDocument cv={st.cv} design={st.design} tpl={tpl} extras={st.extras} mode="print" cvRef={printRef} />
        </div>,
        document.body,
      )}
    </div>
  )
}

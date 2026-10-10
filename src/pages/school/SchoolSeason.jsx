import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { shareOnWhatsApp } from '../../utils/share'
import {
  SCHOOL_PAGES, groupGift, groupGiftMessage, perFamilyFor, WEIGHT_OPTIONS, MAX_FAMILIES, MAX_PER_FAMILY, clampInt,
  TEACHER_RECIPIENTS, GAN_RECIPIENTS, TEACHER_BUDGETS, TEACHER_LIKES, TEACHER_DIY, TEACHER_CARD_TEXTS, TEACHER_FAQ,
  GAN_BUDGETS, GAN_DIY, GAN_CARD_TEXTS, GAN_FAQ, cleanName, parseNames, MAX_NAME, MAX_CERTS,
  KG_TIMELINE, KG_ROLES, KG_CHECKLIST, KG_THEMES, KG_SONGS, KG_FAQ, timelineMinutes, scheduleFrom,
  G6_TIMELINE, G6_PARTS, G6_PARTY_IDEAS, G6_CHECKLIST, G6_SONGS, G6_FAQ,
  SUPPLY_LEVELS, levelById, initialSupplyState, restoreSupplyState, supplyRows, supplyListText, normalizeQty, cleanItem,
  MAX_ITEM, MAX_CUSTOM, SUPPLIES_FAQ,
  GAN_BIRTHDAY_SECTIONS, GAN_BIRTHDAY_QUESTIONS, GAN_BIRTHDAY_FAQ, ganBirthdayQuestionsText,
} from '../../data/schoolSeason'
import '../../learn/learn.css'
import './school.css'

const HOME = { label: 'ראשי', href: '/' }
const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>

function Header({ emoji, h1, lead, badge }) {
  return <header className="text-center">
    {badge && <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 font-bold text-[#1d2233]">{badge}</span>}
    <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{emoji} </span>{h1}</h1>
    <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{lead}</p>
  </header>
}

function Section({ id, title, lead, children }) {
  return <section className="sc-section" aria-labelledby={id}>
    <h2 id={id}>{title}</h2>
    {lead && <p className="sc-lead">{lead}</p>}
    {children}
  </section>
}

function IdeaCards({ items, cols = 'three' }) {
  return <div className={`sc-grid ${cols}`}>{items.map(x => <div key={x.title} className="sc-card">
    {x.emoji && <div className="sc-emoji mb-1" aria-hidden="true">{x.emoji}</div>}
    <h3>{x.title}</h3><p>{x.text}</p>
  </div>)}</div>
}

function BudgetCards({ budgets }) {
  return <div className="sc-grid three">{budgets.map(b => <div key={b.id} className="sc-card">
    <div className="sc-emoji mb-1" aria-hidden="true">{b.emoji}</div>
    <h3>{b.label}</h3>
    <ul>{b.ideas.map(i => <li key={i}>{i}</li>)}</ul>
  </div>)}</div>
}

function RelatedGrid({ links }) {
  return <nav className="sc-section no-print" aria-label="עוד בנושא">
    <h2 className="text-center text-2xl font-black mb-3">עוד בנושא</h2>
    <div className="flex flex-wrap justify-center gap-2">{links.map(l => <Link key={l.href} to={l.href} className="ln-chip">{l.emoji ? <span aria-hidden="true">{l.emoji}</span> : null} {l.label}</Link>)}</div>
  </nav>
}

// ── group-gift calculator (teacher + gan) ─────────────────────────
function GiftCalculator({ presets, occasion }) {
  const [families, setFamilies] = useState(25)
  const [perFamily, setPerFamily] = useState(20)
  const [recipients, setRecipients] = useState(presets)
  const [target, setTarget] = useState('')
  const res = groupGift({ families, perFamily, recipients })
  const update = (id, patch) => setRecipients(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r))
  const targetPer = target ? perFamilyFor(target, families) : 0
  return <div className="ln-box space-y-4">
    <div className="sc-grid two">
      <label className="sc-field">כמה משפחות בכיתה או בגן?
        <input className="sc-input num" type="number" inputMode="numeric" min="1" max={MAX_FAMILIES} value={families} onChange={e => setFamilies(e.target.value === '' ? '' : clampInt(e.target.value, 1, MAX_FAMILIES))} />
      </label>
      <label className="sc-field">כמה כל משפחה נותנת (₪)?
        <input className="sc-input num" type="number" inputMode="numeric" min="0" max={MAX_PER_FAMILY} value={perFamily} onChange={e => setPerFamily(e.target.value === '' ? '' : clampInt(e.target.value, 0, MAX_PER_FAMILY))} />
      </label>
    </div>
    <div className="sc-row" role="group" aria-label="סכומים מוכנים למשפחה">
      {[10, 15, 20, 30, 40].map(v => <Chip key={v} on={Number(perFamily) === v} onClick={() => setPerFamily(v)}>{v} ₪</Chip>)}
    </div>
    <div>
      <h3 className="font-black text-lg mb-1">למי מחלקים, ובאיזה יחס?</h3>
      {recipients.map(r => <div key={r.id} className="sc-recipient">
        <input type="checkbox" id={`rc-${r.id}`} checked={r.on !== false} onChange={e => update(r.id, { on: e.target.checked })} style={{ width: 22, height: 22 }} />
        <label htmlFor={`rc-${r.id}`}>{r.label}</label>
        <span />
        <select aria-label={`החלק של ${r.label}`} value={r.weight} disabled={r.on === false} onChange={e => update(r.id, { weight: Number(e.target.value) })}>
          {WEIGHT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>)}
    </div>
    <div className="sc-card" aria-live="polite">
      <p className="m-0">סך הכול בקופה: <span className="sc-total">{res.total.toLocaleString('he-IL')} ₪</span></p>
      <div className="mt-2">{res.shares.length ? res.shares.map(s => <div key={s.label} className="sc-share"><span>{s.label}</span><b>{s.amount.toLocaleString('he-IL')} ₪</b></div>) : <p>סמנו לפחות אחת מאנשי הצוות.</p>}</div>
    </div>
    <div className="sc-row">
      <label className="sc-field" style={{ flex: '1 1 220px' }}>יש לכם סכום יעד? (₪)
        <input className="sc-input num" type="number" inputMode="numeric" min="0" placeholder="למשל 600" value={target} onChange={e => setTarget(e.target.value === '' ? '' : clampInt(e.target.value, 0, 100000))} />
      </label>
      {target ? <p className="m-0 font-bold">כל משפחה צריכה לתת {targetPer} ₪ <button type="button" className="underline" onClick={() => setPerFamily(targetPer)}>(להחיל)</button></p> : null}
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="ln-btn" onClick={() => shareOnWhatsApp(groupGiftMessage(res, occasion))} disabled={!res.shares.length}>💬 שליחה לקבוצת ההורים</button>
      <button type="button" className="ln-chip" onClick={() => setRecipients(presets)}>↺ איפוס</button>
    </div>
    <small className="block text-[var(--muted-foreground)]">הסכומים מעוגלים לשקלים שלמים ומסתכמים בדיוק לסכום שבקופה. היחס הוא הצעה, לא כלל.</small>
  </div>
}

// ── thank-you card maker (teacher + gan) ─────────────────────────
function CardMaker({ texts, recipientWord, defaultG = 'f' }) {
  const [textId, setTextId] = useState(texts[0].id)
  const [g, setG] = useState(defaultG)
  const [to, setTo] = useState('')
  const [from, setFrom] = useState('')
  const [printing, setPrinting] = useState(false)
  const t = texts.find(x => x.id === textId) || texts[0]
  const body = t[g] || t.f
  const toName = cleanName(to), fromName = cleanName(from)
  const front = toName ? `תודה, ${toName}!` : 'תודה!'
  const sign = fromName ? `באהבה, ${fromName}` : 'באהבה'
  return <div className="ln-box space-y-3">
    <div className="sc-row" role="group" aria-label={`פונים ל${recipientWord}`}>
      <Chip on={g === 'f'} onClick={() => setG('f')}>פונים אליה</Chip>
      <Chip on={g === 'm'} onClick={() => setG('m')}>פונים אליו</Chip>
    </div>
    <div className="sc-grid two">
      <label className="sc-field">שם {recipientWord}
        <input className="sc-input" value={to} maxLength={MAX_NAME} placeholder="למשל: מירב" onChange={e => setTo(e.target.value)} />
      </label>
      <label className="sc-field">ממי (שם הילד או המשפחה)
        <input className="sc-input" value={from} maxLength={MAX_NAME} placeholder="למשל: יואב" onChange={e => setFrom(e.target.value)} />
      </label>
    </div>
    <fieldset>
      <legend className="font-black mb-1">בחרו נוסח</legend>
      <div className="grid gap-1">{texts.map(x => <label key={x.id} className="sc-check">
        <input type="radio" name={`card-${recipientWord}`} checked={textId === x.id} onChange={() => setTextId(x.id)} />
        <span>{x[g] || x.f}</span>
      </label>)}</div>
    </fieldset>
    <div className="sc-card-preview" aria-label="תצוגה מקדימה של הכרטיס">
      <p className="big">💐 {front}</p>
      <p>{body}</p>
      <p className="font-bold">{sign}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסת כרטיס</button>
      <button type="button" className="ln-chip" onClick={() => shareOnWhatsApp(`${front}\n${body}\n${sign}`)}>💬 שליחה בוואטסאפ</button>
    </div>
    <small className="block text-[var(--muted-foreground)]">מדפיסים על דף A4, מקפלים לאורך הקו המקווקו, והילד מוסיף ציור. השמות לא נשלחים לשום מקום.</small>
    {printing && <PrintPreview title="כרטיס תודה" onClose={() => setPrinting(false)}>
      <div className="buga-a4" dir="rtl"><div className="sc-print-card">
        <div className="front"><div className="emoji">💐</div><h2>{front}</h2><span className="fold">✂ מקפלים כאן</span></div>
        <div className="inside"><p>{body}</p><p className="sign">{sign}</p></div>
      </div></div>
    </PrintPreview>}
  </div>
}

// ── shared bits for the graduation pages ─────────────────────────
function Timeline({ list, defaultStart }) {
  const [start, setStart] = useState(defaultStart)
  const rows = scheduleFrom(start, list)
  return <div className="ln-box space-y-3">
    <label className="sc-row font-bold">שעת התחלה:
      <input className="sc-input num" type="time" value={start} onChange={e => setStart(e.target.value || defaultStart)} />
    </label>
    <ol className="sc-timeline">{rows.map(s => <li key={s.title}>
      <span className="sc-time">{s.at}</span>
      <div><b>{s.title}</b> <span className="text-[var(--muted-foreground)]">({s.min} דק׳)</span><p className="m-0">{s.text}</p></div>
    </li>)}</ol>
    <p className="m-0 font-bold">סך הכול: {timelineMinutes(list)} דקות, ואחר כך כיבוד.</p>
  </div>
}

function Checklist({ groups, title, shareTitle }) {
  const [done, setDone] = useState({})
  const [printing, setPrinting] = useState(false)
  const all = groups.flatMap(g => g.items.map(i => `${g.when}|${i}`))
  const count = all.filter(k => done[k]).length
  const text = [shareTitle, ...groups.flatMap(g => [`\n${g.when}:`, ...g.items.map(i => `${done[`${g.when}|${i}`] ? '✅' : '⬜'} ${i}`)])].join('\n')
  return <div className="ln-box space-y-3">
    <div className="sc-progress" role="progressbar" aria-valuemin={0} aria-valuemax={all.length} aria-valuenow={count} aria-label="התקדמות"><span style={{ width: `${(count / all.length) * 100}%` }} /></div>
    <p className="m-0 text-sm font-bold">{count} מתוך {all.length} משימות</p>
    <div className="sc-grid two">{groups.map(g => <div key={g.when}>
      <h3 className="font-black text-lg">{g.when}</h3>
      {g.items.map(i => { const k = `${g.when}|${i}`; return <label key={k} className={`sc-check ${done[k] ? 'is-done' : ''}`}>
        <input type="checkbox" checked={!!done[k]} onChange={e => setDone(d => ({ ...d, [k]: e.target.checked }))} /><span>{i}</span>
      </label> })}
    </div>)}</div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסת הצ׳קליסט</button>
      <button type="button" className="ln-chip" onClick={() => shareOnWhatsApp(text)}>💬 שליחה לוועד בוואטסאפ</button>
    </div>
    {printing && <PrintPreview title={title} onClose={() => setPrinting(false)}>
      <article className="buga-flow sc-print-list" dir="rtl">
        <h2>{title}</h2>
        {groups.map(g => <div key={g.when}><h3>{g.when}</h3><ul>{g.items.map(i => <li key={i}>{done[`${g.when}|${i}`] ? '☑' : '☐'} {i}</li>)}</ul></div>)}
      </article>
    </PrintPreview>}
  </div>
}

function Roles({ roles }) {
  return <div className="sc-grid two">{roles.map(r => <div key={r.role} className="sc-card"><h3>{r.role}</h3><p>{r.text}</p></div>)}</div>
}

function Songs({ songs, note }) {
  return <div className="ln-box">
    <ul className="space-y-2">{songs.map(s => <li key={s.title}><b>🎵 {s.title}</b> · <span className="text-[var(--muted-foreground)]">{s.note}</span></li>)}</ul>
    <p className="mt-3 mb-0 sc-note">{note}</p>
  </div>
}

// ── /gifts/teacher-end-of-year ─────────────────────────
export function TeacherGiftPage() {
  const m = SCHOOL_PAGES.teacherGift
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={m.title} description={m.description} path={m.path} type="article" structuredData={faqSchema(TEACHER_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'מתנות', href: '/gifts' }, { label: 'מתנה למורה' }]} />
    <Header emoji="🍎" h1={m.h1} badge="רעיונות · מחשבון לוועד · כרטיס להדפסה" lead="מה באמת משמח מורה בסוף השנה, כמה לאסוף, איך לחלק בין המחנכת לסייעת, ומה הילדים יכולים להכין בעצמם. בלי ספלים של ״המורה הכי טובה בעולם״." />

    <Section id="t-budget" title="רעיונות לפי תקציב" lead="מתנה כיתתית אחת היא לרוב הבחירה הנוחה והמכובדת. ומכתב אישי מהילד שווה יותר מכל מתנה, בכל תקציב.">
      <BudgetCards budgets={TEACHER_BUDGETS} />
    </Section>

    <Section id="t-likes" title="מה מורות ומורים באמת שמחים לקבל">
      <IdeaCards items={TEACHER_LIKES} />
      <p className="sc-note mt-4">לפני שאוספים כסף כדאי לבדוק אם לבית הספר או לרשות יש הנחיה לגבי מתנות לצוות, למשל העדפה למתנה כיתתית אחת או תקרה לסכום. שאלו את ההנהלה או את נציגות ההורים.</p>
    </Section>

    <Section id="t-calc" title="מחשבון מתנה כיתתית לוועד ההורים" lead="מכניסים כמה משפחות וכמה כל אחת נותנת, בוחרים למי מחלקים, ומקבלים חלוקה בשקלים שלמים והודעה מוכנה לקבוצה.">
      <GiftCalculator presets={TEACHER_RECIPIENTS} occasion="מתנה לצוות הכיתה לסוף השנה" />
    </Section>

    <Section id="t-diy" title="מתנות שהילדים מכינים בעצמם" lead="המתנות שהכי זוכרים הן אלה שהילדים שמו בהן את היד. רובן כמעט לא עולות כסף.">
      <IdeaCards items={TEACHER_DIY} />
    </Section>

    <Section id="t-card" title="כרטיס תודה למורה להדפסה" lead="בוחרים נוסח, מוסיפים שמות ומדפיסים. עוד ברכות אפשר למצוא בעמוד ברכות למורה.">
      <CardMaker texts={TEACHER_CARD_TEXTS} recipientWord="המורה" />
    </Section>

    <div className="sc-section"><SeoBody paragraphs={[
      'סוף שנת הלימודים הוא הזדמנות להגיד תודה לאנשים שבילו עם הילדים שלנו יותר שעות ערות מאיתנו. מתנה למורה לא צריכה להיות יקרה כדי להיות משמעותית: מה שנשאר בזיכרון הוא בדרך כלל המכתב, הציור או המשפט שהילד כתב בעצמו.',
      'בכיתות רבות ועד ההורים אוסף סכום קטן מכל משפחה וקונה מתנה כיתתית אחת, למחנכת ולפעמים גם לסייעת או למורה מקצועית. זה חוסך עשרים ספלים זהים, לא מביך משפחות שקשה להן, ומאפשר מתנה מכובדת. המחשבון שבעמוד עוזר לחלק את הקופה בצורה הוגנת ולשלוח הודעה מסודרת לקבוצה.',
      'אותם רעיונות מתאימים גם ליום המורה, לחנוכה או לפרידה ממורה שעוזבת באמצע השנה. רק מקטינים את הקנה מידה: פתק אישי ועציץ קטן מספיקים בהחלט.',
    ]} faq={TEACHER_FAQ} related={[{ label: 'ברכות למורה', href: '/greetings/teacher-f' }, { label: 'מתנה לגננת ולסייעת', href: '/gifts/gananet' }, { label: 'מסיבת סיום כיתה ו׳', href: '/ideas/6th-grade-graduation' }, { label: 'מסיבת סוף שנה לכיתה', href: '/ideas/end-of-year-party' }]} /></div>

    <RelatedGrid links={[
      { emoji: '💌', label: 'ברכות למורה', href: '/greetings/teacher-f' },
      { emoji: '🌼', label: 'מתנה לגננת', href: '/gifts/gananet' },
      { emoji: '🎓', label: 'מסיבת סיום כיתה ו׳', href: '/ideas/6th-grade-graduation' },
      { emoji: '🎉', label: 'מסיבת סוף שנה', href: '/ideas/end-of-year-party' },
      { emoji: '👋', label: 'מסיבת פרידה', href: '/ideas/farewell-party' },
      { emoji: '🎁', label: 'קופסת מתנה להדפסה', href: '/printables/gift-box' },
      { emoji: '📰', label: 'עיתון כיתה', href: '/printables/class-newspaper' },
      { emoji: '😄', label: 'בדיחות על מורים', href: '/jokes/teachers' },
      { emoji: '🛍️', label: 'כל רעיונות המתנות', href: '/gifts' },
    ]} />
  </div>
}

// ── /gifts/gananet ─────────────────────────
export function GananetGiftPage() {
  const m = SCHOOL_PAGES.ganGift
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={m.title} description={m.description} path={m.path} type="article" structuredData={faqSchema(GAN_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'מתנות', href: '/gifts' }, { label: 'מתנה לגננת' }]} />
    <Header emoji="🌼" h1={m.h1} badge="גננת · סייעת · צהרון" lead="רעיונות למתנה מכל הגן ומכל ילד, מתנות שילדי גן יכולים להכין כמעט לבד, מחשבון לחלוקת הקופה בין הגננת, הסייעת וצוות הצהרון, וכרטיס תודה להדפסה." />

    <Section id="g-budget" title="רעיונות לפי תקציב" lead="בגן, יותר מבכל מקום אחר, המתנה הכי מרגשת היא זו שהילדים הכינו בידיים שלהם.">
      <BudgetCards budgets={GAN_BUDGETS} />
    </Section>

    <Section id="g-diy" title="מתנות שילדי הגן מכינים" lead="טביעות ידיים, ציורים והקלטות: דברים שילדים בני 3–6 יכולים לעשות כמעט לבד, עם קצת עזרה מההורים.">
      <IdeaCards items={GAN_DIY} />
    </Section>

    <Section id="g-team" title="לא רק הגננת: כל הצוות">
      <div className="sc-grid three">
        <div className="sc-card"><div className="sc-emoji mb-1" aria-hidden="true">👩‍🏫</div><h3>הגננת</h3><p>מובילה את הגן ואת התוכנית. מתנה כיתתית מכובדת ואלבום או קנבס מהילדים.</p></div>
        <div className="sc-card"><div className="sc-emoji mb-1" aria-hidden="true">🤲</div><h3>הסייעת</h3><p>נמצאת עם הילדים כל היום, בארוחות, בחצר ובשירותים. מגיעה לה מתנה משלה, לא ״תוספת״ לגננת.</p></div>
        <div className="sc-card"><div className="sc-emoji mb-1" aria-hidden="true">🌙</div><h3>צוות הצהרון</h3><p>מבלה עם הילדים שעות ארוכות אחר הצהריים. גם כרטיס עם ציורים ומתנה קטנה מראים שראו אותם.</p></div>
      </div>
      <p className="sc-note mt-4">יש גנים ורשויות עם הנחיות לגבי מתנות לצוות. כדאי לשאול את הגננת או את ועד ההורים אם יש הנחיה כזו לפני שאוספים כסף.</p>
    </Section>

    <Section id="g-calc" title="מחשבון מתנה לצוות הגן" lead="כמה משפחות, כמה כל אחת נותנת, ואיך מחלקים בין הגננת, הסייעת והצהרון. אפשר לשלוח את החלוקה ישר לקבוצה.">
      <GiftCalculator presets={GAN_RECIPIENTS} occasion="מתנה לצוות הגן לסוף השנה" />
    </Section>

    <Section id="g-card" title="כרטיס תודה לגננת או לסייעת" lead="נוסחים קצרים שמתאימים לילדי גן. מדפיסים, והילד מקשט בעצמו.">
      <CardMaker texts={GAN_CARD_TEXTS} recipientWord="הגננת או הסייעת" />
    </Section>

    <div className="sc-section"><SeoBody paragraphs={[
      'מתנה לגננת בסוף השנה היא דרך להגיד תודה על שנה שלמה של חיבוקים, שירים, סבלנות ונעליים שנקשרו מחדש עשר פעמים ביום. ברוב הגנים ועד ההורים מארגן מתנה משותפת לגננת ולסייעת, ולצידה משהו שהילדים הכינו: אלבום, קנבס טביעות ידיים או ברכות מוקלטות.',
      'את המחשבון שבעמוד אפשר להתאים לכל גן: מסמנים מי מקבל (גננת, סייעת, גננת משלימה, צוות צהרון), בוחרים לכל אחת חלק, ומקבלים חלוקה מדויקת. ההודעה לקבוצה כוללת גם משפט עדין למשפחות שקשה להן עם הסכום.',
    ]} faq={GAN_FAQ} related={[{ label: 'ברכות לגננת', href: '/greetings/kindergarten-teacher' }, { label: 'מסיבת סיום גן', href: '/ideas/kindergarten-graduation' }, { label: 'מתנה למורה', href: '/gifts/teacher-end-of-year' }, { label: 'יום הולדת בגן', href: '/guides/birthday-in-kindergarten' }]} /></div>

    <RelatedGrid links={[
      { emoji: '💌', label: 'ברכות לגננת', href: '/greetings/kindergarten-teacher' },
      { emoji: '🎓', label: 'מסיבת סיום גן', href: '/ideas/kindergarten-graduation' },
      { emoji: '🍎', label: 'מתנה למורה', href: '/gifts/teacher-end-of-year' },
      { emoji: '🎂', label: 'יום הולדת בגן', href: '/guides/birthday-in-kindergarten' },
      { emoji: '🎁', label: 'קופסת מתנה להדפסה', href: '/printables/gift-box' },
      { emoji: '🧸', label: 'משחקים לגן', href: '/games/kindergarten' },
      { emoji: '🛍️', label: 'כל רעיונות המתנות', href: '/gifts' },
    ]} />
  </div>
}

// ── certificate maker (gan graduation) ─────────────────────────
function CertificateMaker() {
  const [names, setNames] = useState('')
  const [gan, setGan] = useState('')
  const [year, setYear] = useState('תשפ״ז')
  const [g, setG] = useState('both')
  const [printing, setPrinting] = useState(false)
  const list = parseNames(names)
  const ganName = cleanName(gan), yearName = cleanName(year)
  const verb = g === 'm' ? 'סיים' : g === 'f' ? 'סיימה' : 'סיים/ה'
  const wish = 'בהצלחה בכיתה א׳! אנחנו גאים בך.'
  const Cert = ({ name }) => <div className="buga-a4" dir="rtl"><div className="sc-cert">
    <div className="stars" aria-hidden="true">⭐🎓⭐</div>
    <h2>תעודת סיום גן</h2>
    <p>תעודה זו מוענקת ל</p>
    <div className="name">{name || ' '}</div>
    <p>ש{verb} בהצלחה את שנת הלימודים {yearName || ' '}{ganName ? <> בגן {ganName}</> : null}</p>
    <p>{wish}</p>
    <div className="sign"><span>הגננת</span><span>הסייעת</span></div>
  </div></div>
  return <div className="ln-box space-y-3">
    <label className="sc-field">שם הילד, או רשימת כל השמות (שם בכל שורה)
      <textarea className="sc-input" rows={4} value={names} placeholder={'נועה כהן\nאורי לוי'} onChange={e => setNames(e.target.value)} />
    </label>
    <div className="sc-grid two">
      <label className="sc-field">שם הגן
        <input className="sc-input" value={gan} maxLength={MAX_NAME} placeholder="למשל: גן רימון" onChange={e => setGan(e.target.value)} />
      </label>
      <label className="sc-field">שנת הלימודים
        <input className="sc-input" value={year} maxLength={MAX_NAME} onChange={e => setYear(e.target.value)} />
      </label>
    </div>
    <div className="sc-row" role="group" aria-label="נוסח לבן או לבת">
      <Chip on={g === 'm'} onClick={() => setG('m')}>👦 בן</Chip>
      <Chip on={g === 'f'} onClick={() => setG('f')}>👧 בת</Chip>
      <Chip on={g === 'both'} onClick={() => setG('both')}>רשימה מעורבת (סיים/ה)</Chip>
    </div>
    <p className="m-0 font-bold">{list.length ? `${list.length} תעודות מוכנות להדפסה` : 'אפשר גם להדפיס תעודה ריקה ולכתוב את השם ביד.'}{list.length >= MAX_CERTS ? ` (עד ${MAX_CERTS} בכל הדפסה)` : ''}</p>
    <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסת תעודות</button>
    <small className="block text-[var(--muted-foreground)]">השמות לא נשלחים לשום מקום. מומלץ לבדוק את האיות עם ההורים לפני ההדפסה.</small>
    {printing && <PrintPreview title="תעודת סיום גן" onClose={() => setPrinting(false)}>
      {(list.length ? list : ['']).map((n, i) => <Cert key={i} name={n} />)}
    </PrintPreview>}
  </div>
}

// ── /ideas/kindergarten-graduation ─────────────────────────
export function KindergartenGraduation() {
  const m = SCHOOL_PAGES.kgGraduation
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={m.title} description={m.description} path={m.path} type="article" structuredData={faqSchema(KG_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'רעיונות', href: '/ideas' }, { label: 'מסיבת סיום גן' }]} />
    <Header emoji="🎓" h1={m.h1} badge="תוכנית · תפקידים · צ׳קליסט · תעודה להדפסה" lead="מסיבת סיום גן היא הטקס הראשון של הילדים. כאן יש תוכנית של כשעה שאפשר להתאים, חלוקת תפקידים לוועד, צ׳קליסט ותעודות סיום עם שם הילד." />

    <Section id="kg-plan" title={`תוכנית המסיבה: ${timelineMinutes(KG_TIMELINE)} דקות`} lead="ילדים בני 5–6 מחזיקים ריכוז על במה לזמן קצר. התוכנית הזאת זורמת ומשאירה את הילדים במרכז. שנו את שעת ההתחלה וקבלו לוח זמנים.">
      <Timeline list={KG_TIMELINE} defaultStart="17:30" />
    </Section>

    <Section id="kg-roles" title="חלוקת תפקידים בוועד ההורים" lead="כשלכל משימה יש אחראי/ת אחד/ת, אף אחד לא נשאר עם הכול על הראש.">
      <Roles roles={KG_ROLES} />
    </Section>

    <Section id="kg-check" title="צ׳קליסט למסיבת סיום גן">
      <Checklist groups={KG_CHECKLIST} title="צ׳קליסט למסיבת סיום גן" shareTitle="🎓 צ׳קליסט מסיבת סיום גן" />
    </Section>

    <Section id="kg-themes" title="רעיונות לנושא המסיבה" lead="נושא אחד מחבר בין ההזמנה, התפאורה, התעודה והמתנה לילדים.">
      <IdeaCards items={KG_THEMES} />
    </Section>

    <Section id="kg-songs" title="שירים למסיבת סיום גן">
      <Songs songs={KG_SONGS} note="רק שמות שירים, בלי מילים. השירים שהילדים כבר למדו בגן הם הבחירה הכי טובה, אז קודם כול שאלו את הגננת מה הם שרים השנה." />
    </Section>

    <Section id="kg-cert" title="תעודת סיום גן עם שם הילד" lead="אפשר להדפיס תעודה אחת, או להדביק את רשימת כל ילדי הגן ולקבל תעודה נפרדת לכל אחד.">
      <CertificateMaker />
    </Section>

    <div className="sc-section"><SeoBody paragraphs={[
      'מסיבת סיום גן חובה היא רגע מרגש במיוחד: הילדים נפרדים מהגן ועוברים לכיתה א׳, וההורים רואים אותם עולים לבמה לראשונה. כדי שהמסיבה תהיה מהנה ולא מעייפת, כדאי לשמור על חלק רשמי של 45–60 דקות, עם הילדים במרכז ועם ברכות קצרות.',
      'חלוקת העבודה הנפוצה: הגננת מכינה את התוכן עם הילדים, והוועד אחראי על ההפקה. מקום, הגברה, מצגת, תעודות, מתנות לילדים, כיבוד ותודה לצוות. הצ׳קליסט בעמוד הזה מסודר לפי זמנים, מחודש לפני ועד היום עצמו, ואפשר לשלוח אותו לקבוצת הוועד.',
      'למתנה לצוות בסוף השנה יש עמוד נפרד, עם רעיונות ומחשבון חלוקה. ואם המסיבה משותפת לכמה גנים, אפשר להכין תעודות לכל הילדים בהדפסה אחת.',
    ]} faq={KG_FAQ} related={[{ label: 'מתנה לגננת ולסייעת', href: '/gifts/gananet' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'מסיבת סוף שנה', href: '/ideas/end-of-year-party' }, { label: 'רשימת ציוד לכיתה א׳', href: '/printables/school-supplies-list' }]} /></div>

    <RelatedGrid links={[
      { emoji: '🌼', label: 'מתנה לגננת', href: '/gifts/gananet' },
      { emoji: '💌', label: 'ברכות לגננת', href: '/greetings/kindergarten-teacher' },
      { emoji: '🏫', label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' },
      { emoji: '🎒', label: 'רשימת ציוד לכיתה א׳', href: '/printables/school-supplies-list' },
      { emoji: '🏅', label: 'תעודות הצטיינות', href: '/printables/certificates' },
      { emoji: '📸', label: 'אביזרי צילום', href: '/printables/photo-props' },
      { emoji: '🎉', label: 'מסיבת סוף שנה', href: '/ideas/end-of-year-party' },
      { emoji: '🧸', label: 'משחקים לגן', href: '/games/kindergarten' },
    ]} />
  </div>
}

// ── /ideas/6th-grade-graduation ─────────────────────────
export function SixthGradeGraduation() {
  const m = SCHOOL_PAGES.grade6Graduation
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={m.title} description={m.description} path={m.path} type="article" structuredData={faqSchema(G6_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'רעיונות', href: '/ideas' }, { label: 'מסיבת סיום כיתה ו׳' }]} />
    <Header emoji="🎓" h1={m.h1} badge="טקס · מסיבה · ספר מחזור · צ׳קליסט" lead="שש שנים של יסודי נגמרות, ובני ה־12 רוצים שזה יהיה שלהם. כך בונים טקס מרגש, מסיבה שהם באמת רוצים, ספר מחזור וסרט, בלי לאבד את השפיות של הוועד." />

    <Section id="g6-parts" title="ארבעה חלקים של סיום היסודי" lead="לא חייבים את כולם. ברוב בתי הספר הטקס באחריות בית הספר, והמסיבה, הספר ויום הכיף באחריות ההורים.">
      <IdeaCards items={G6_PARTS} cols="two" />
    </Section>

    <Section id="g6-plan" title={`סדר הטקס: ${timelineMinutes(G6_TIMELINE)} דקות`} lead="שעה אחת, עם התלמידים במרכז. שנו את שעת ההתחלה כדי לקבל לוח זמנים מדויק.">
      <Timeline list={G6_TIMELINE} defaultStart="18:00" />
    </Section>

    <Section id="g6-party" title="רעיונות למסיבת הסיום" lead="בכיתה ו׳ הילדים כבר יודעים מה הם רוצים. סקר קצר ביניהם חוסך ויכוחים.">
      <IdeaCards items={G6_PARTY_IDEAS} />
    </Section>

    <Section id="g6-book" title="ספר מחזור וסרט: טיפים מהשטח">
      <div className="sc-grid two">
        <div className="sc-card"><h3>📘 ספר המחזור</h3><ul>
          <li>תבנית אחידה לכל תלמיד: תמונה מכיתה א׳, תמונה עכשיו ושלוש שאלות קבועות.</li>
          <li>צוות תלמידים כותב ומעצב, וההורים מלווים ובודקים.</li>
          <li>הגהה כפולה של כל השמות: טעות בשם היא מה שזוכרים.</li>
          <li>משאירים עמודים ריקים לחתימות וברכות.</li>
        </ul></div>
        <div className="sc-card"><h3>🎬 הסרט</h3><ul>
          <li>עד 8 דקות. אחרי זה גם ההורים מתחילים להסתכל בטלפון.</li>
          <li>״אז ועכשיו״: תמונה מכיתה א׳ ליד תמונה עדכנית של כל ילד.</li>
          <li>ברכות קצרות מצולמות מהמורים, ושיר שהתלמידים בחרו.</li>
          <li>בודקים שכל תלמיד מופיע, ושואלים מראש על הסכמה לתמונות.</li>
        </ul></div>
      </div>
    </Section>

    <Section id="g6-check" title="צ׳קליסט לסיום כיתה ו׳">
      <Checklist groups={G6_CHECKLIST} title="צ׳קליסט לסיום כיתה ו׳" shareTitle="🎓 צ׳קליסט סיום כיתה ו׳" />
    </Section>

    <Section id="g6-songs" title="שירים לטקס הסיום">
      <Songs songs={G6_SONGS} note="רק שמות שירים, בלי מילים. בכיתה ו׳ כדאי שהתלמידים יבחרו בעצמם, ושהצוות יאשר את הרשימה." />
    </Section>

    <div className="sc-section"><SeoBody paragraphs={[
      'סיום כיתה ו׳ הוא סוף של פרק ארוך: שש שנים באותו בית ספר, עם אותם חברים, לפני המעבר לחטיבת הביניים. לכן הוא בדרך כלל כולל יותר מאירוע אחד: טקס רשמי עם ההורים, מסיבה לתלמידים, ספר מחזור ולעיתים גם יום כיף או טיול.',
      'הסוד לסיום מוצלח הוא לתת לתלמידים לקחת חלק אמיתי: לכתוב את הנאום, לבחור שירים, לעצב את ספר המחזור. ההורים אחראים על הלוגיסטיקה, על התקציב ועל לוח הזמנים. הצ׳קליסט בעמוד מתחיל כבר בפברואר, כי ספר מחזור ומקום ליום כיף צריך לסגור מוקדם.',
    ]} faq={G6_FAQ} related={[{ label: 'מתנה למורה לסוף השנה', href: '/gifts/teacher-end-of-year' }, { label: 'מסיבת סוף שנה', href: '/ideas/end-of-year-party' }, { label: 'מסיבות לבני נוער', href: '/guides/teen-party-guide' }, { label: 'עיתון כיתה להדפסה', href: '/printables/class-newspaper' }]} /></div>

    <RelatedGrid links={[
      { emoji: '🍎', label: 'מתנה למורה', href: '/gifts/teacher-end-of-year' },
      { emoji: '💌', label: 'ברכות למורה', href: '/greetings/teacher-f' },
      { emoji: '📰', label: 'עיתון כיתה', href: '/printables/class-newspaper' },
      { emoji: '📸', label: 'אביזרי צילום', href: '/printables/photo-props' },
      { emoji: '🏅', label: 'תעודות להדפסה', href: '/printables/certificates' },
      { emoji: '❓', label: 'שאלות לסוף שנה', href: '/questions/end-of-year' },
      { emoji: '🗝️', label: 'חדרי בריחה', href: '/tools/escape-rooms' },
      { emoji: '🎧', label: 'מסיבות לבני נוער', href: '/guides/teen-party-guide' },
    ]} />
  </div>
}

// ── /printables/school-supplies-list ─────────────────────────
const SUPPLIES_KEY = 'ugabuga-school-supplies-v1' // per-viewer convenience only
let customSeq = 0

export function SchoolSuppliesList() {
  const m = SCHOOL_PAGES.supplies
  const [levelId, setLevelId] = useState('a')
  const [states, setStates] = useState(() => Object.fromEntries(SUPPLY_LEVELS.map(l => [l.id, initialSupplyState(l)])))
  const [newItem, setNewItem] = useState('')
  const [printing, setPrinting] = useState(false)
  const loaded = useRef(false)
  const level = levelById(levelId)
  const state = states[level.id]

  // Restore after the first render so the prerendered snapshot matches the default list.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SUPPLIES_KEY) || 'null')
      if (saved && typeof saved === 'object') {
        setStates(Object.fromEntries(SUPPLY_LEVELS.map(l => [l.id, restoreSupplyState(l, saved.levels?.[l.id])])))
        if (SUPPLY_LEVELS.some(l => l.id === saved.level)) setLevelId(saved.level)
      }
    } catch { /* storage blocked */ }
    loaded.current = true
  }, [])
  useEffect(() => {
    if (!loaded.current) return
    try { localStorage.setItem(SUPPLIES_KEY, JSON.stringify({ level: levelId, levels: states })) } catch { /* storage blocked */ }
  }, [states, levelId])

  const setLevelState = fn => setStates(s => ({ ...s, [level.id]: fn(s[level.id]) }))
  const patchItem = (row, patch) => setLevelState(st => row.custom
    ? { ...st, custom: st.custom.map(c => c.id === row.id ? { ...c, ...patch } : c) }
    : { ...st, items: { ...st.items, [row.id]: { ...st.items[row.id], ...patch } } })
  const removeItem = row => setLevelState(st => row.custom
    ? { ...st, custom: st.custom.filter(c => c.id !== row.id) }
    : { ...st, items: { ...st.items, [row.id]: { ...st.items[row.id], removed: true } } })
  const addItem = e => {
    e.preventDefault()
    const name = cleanItem(newItem)
    if (!name || state.custom.length >= MAX_CUSTOM) return
    setLevelState(st => ({ ...st, custom: [...st.custom, { id: `c${Date.now().toString(36)}${customSeq++}`, name, qty: 1, done: false }] }))
    setNewItem('')
  }
  const reset = () => setLevelState(() => initialSupplyState(level))

  const rows = useMemo(() => supplyRows(level, state), [level, state])
  const done = rows.filter(r => r.done).length
  const removedCount = level.items.filter(i => state.items[i.id]?.removed).length

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={m.title} description={m.description} path={m.path} structuredData={faqSchema(SUPPLIES_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'דפים להדפסה', href: '/printables' }, { label: 'רשימת ציוד' }]} />
    <Header emoji="🎒" h1={m.h1} badge="גן · כיתה א׳ · ב׳–ג׳ · ד׳–ו׳" lead="צ׳קליסט ציוד שאפשר לערוך: מסמנים מה כבר קנינו, משנים כמויות, מוסיפים פריטים מהרשימה של המורה, ומדפיסים או שולחים בוואטסאפ." />

    <p className="sc-note mt-5 font-bold">📌 זו רשימה של פריטים נפוצים, לא הרשימה הרשמית. בדקו את הרשימה שקיבלתם מבית הספר או מהגן, והתאימו כאן את הכמויות והפריטים.</p>

    <div className="no-print mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="בחירת שכבת גיל">
      {SUPPLY_LEVELS.map(l => <Chip key={l.id} on={l.id === level.id} onClick={() => setLevelId(l.id)}><span aria-hidden="true">{l.emoji}</span> {l.label}</Chip>)}
    </div>

    <section className="ln-box mt-5" aria-labelledby="sup-list">
      <h2 id="sup-list" className="text-2xl font-black text-center">{level.emoji} רשימת ציוד ל{level.label}</h2>
      <div className="sc-progress mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={rows.length} aria-valuenow={done} aria-label="כמה כבר נקנה"><span style={{ width: rows.length ? `${(done / rows.length) * 100}%` : 0 }} /></div>
      <p className="mt-1 mb-2 text-sm font-bold">{done} מתוך {rows.length} פריטים סומנו</p>
      <div>{rows.map(r => <div key={r.id} className={`sc-supply ${r.done ? 'is-done' : ''}`}>
        <input type="checkbox" id={`sup-${r.id}`} checked={r.done} onChange={e => patchItem(r, { done: e.target.checked })} />
        <label htmlFor={`sup-${r.id}`} className="sc-supply-name">{r.name}</label>
        <input type="number" min="0" max="99" inputMode="numeric" aria-label={`כמות: ${r.name}`} value={r.qty} onChange={e => patchItem(r, { qty: normalizeQty(e.target.value) })} />
        <button type="button" className="sc-x" aria-label={`הסרת ${r.name}`} onClick={() => removeItem(r)}>✕</button>
      </div>)}</div>
      <form className="sc-row mt-3" onSubmit={addItem}>
        <label htmlFor="sup-new" className="sr-only">פריט חדש</label>
        <input id="sup-new" className="sc-input" style={{ flex: '1 1 200px' }} value={newItem} maxLength={MAX_ITEM} placeholder="פריט מהרשימה של המורה…" onChange={e => setNewItem(e.target.value)} />
        <button type="submit" className="ln-chip" disabled={!cleanItem(newItem) || state.custom.length >= MAX_CUSTOM}>➕ הוספה</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסה</button>
        <button type="button" className="ln-chip" onClick={() => shareOnWhatsApp(supplyListText(level, state))}>💬 שליחת הרשימה</button>
        <button type="button" className="ln-chip" onClick={() => shareOnWhatsApp(supplyListText(level, state, { onlyMissing: true }))}>🛒 רק מה שחסר</button>
        <button type="button" className="ln-chip" onClick={reset}>↺ חזרה לרשימה המקורית{removedCount ? ` (${removedCount} הוסרו)` : ''}</button>
      </div>
      <small className="mt-2 block text-[var(--muted-foreground)]">הסימונים נשמרים רק בדפדפן שלכם, לכל שכבה בנפרד.</small>
    </section>

    {printing && <PrintPreview title={`רשימת ציוד — ${level.label}`} onClose={() => setPrinting(false)}>
      <article className="buga-flow sc-print-list" dir="rtl">
        <h2>🎒 רשימת ציוד — {level.label}</h2>
        <p className="sub">שם: ____________ · כדאי לבדוק מול הרשימה שקיבלתם מבית הספר</p>
        <ul>{rows.filter(r => r.qty > 0).map(r => <li key={r.id}>{r.done ? '☑' : '☐'} {r.name}{r.qty > 1 ? ` × ${r.qty}` : ''}</li>)}</ul>
      </article>
    </PrintPreview>}

    <Section id="sup-tips" title="טיפים לקניית ציוד">
      <div className="sc-grid three">
        <div className="sc-card"><div className="sc-emoji mb-1" aria-hidden="true">📋</div><h3>מחכים לרשימה הסופית</h3><p>מחברות וספרים קונים רק לפי הרשימה של בית הספר. בכל כיתה מבקשים סוגים וכמויות אחרים.</p></div>
        <div className="sc-card"><div className="sc-emoji mb-1" aria-hidden="true">🏷️</div><h3>מסמנים הכול בשם</h3><p>בקבוק, קופסת אוכל, קלמר ומספריים נעלמים מהר. מדבקות שם חוסכות חיפושים וקניות כפולות.</p></div>
        <div className="sc-card"><div className="sc-emoji mb-1" aria-hidden="true">♻️</div><h3>בודקים מה נשאר מהשנה שעברה</h3><p>לפני שקונים, עוברים על הקלמר והמגירה. סרגלים, מספריים ומחדדים מחזיקים כמה שנים.</p></div>
      </div>
    </Section>

    <div className="sc-section"><SeoBody paragraphs={[
      'רשימת ציוד לבית הספר מגיעה בכל שנה, ובכל שנה היא נראית קצת אחרת. כאן תמצאו את הפריטים הנפוצים לכל שכבה: גן, כיתה א׳, כיתות ב׳–ג׳ ו־ד׳–ו׳. הרשימה היא נקודת התחלה: מתאימים אותה לרשימה שקיבלתם, ומסמנים תוך כדי קנייה.',
      'בכיתה א׳ הרשימה מתמקדת בכלי כתיבה וציור בסיסיים, מחברות עם שורות מותאמות ומחברות חשבון. בכיתות הגבוהות נכנסים עטים, מחוגה, מד־זווית ומחברות לאנגלית. ובגן העיקר הוא בגדים להחלפה, בקבוק, קופסת אוכל ותמונה משפחתית.',
    ]} faq={SUPPLIES_FAQ} related={[{ label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'רעיונות לארוחת עשר', href: '/food/school-lunch' }, { label: 'פתקים לקופסת האוכל', href: '/printables/lunchbox-notes' }, { label: 'מדבקות שם', href: '/printables/name-tags' }]} /></div>

    <RelatedGrid links={[
      { emoji: '🏫', label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' },
      { emoji: '🥪', label: 'ארוחת עשר', href: '/food/school-lunch' },
      { emoji: '💌', label: 'פתקים לקופסת האוכל', href: '/printables/lunchbox-notes' },
      { emoji: '🏷️', label: 'מדבקות שם', href: '/printables/name-tags' },
      { emoji: '🗓️', label: 'מערכת שעות', href: '/printables/class-schedule' },
      { emoji: '📅', label: 'לוח חופשות', href: '/school-holidays' },
      { emoji: '📝', label: 'רשימת "מי מביא מה"', href: '/tools/bring-list' },
    ]} />
  </div>
}

// ── /guides/birthday-in-kindergarten ─────────────────────────
export function GanBirthdayGuide() {
  const m = SCHOOL_PAGES.ganBirthday
  const [child, setChild] = useState('')
  const [asked, setAsked] = useState({})
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={m.title} description={m.description} path={m.path} type="article" structuredData={faqSchema(GAN_BIRTHDAY_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'מדריכים', href: '/guides' }, { label: 'יום הולדת בגן' }]} />
    <Header emoji="👑" h1={m.h1} badge="מדריך קצר להורים" lead="כתר, כיסא מקושט, שירים ועוגה. ומה בעצם מותר להביא? כל מה שכדאי לדעת לפני יום ההולדת בגן, ורשימת שאלות לשלוח לגננת." />

    <nav className="ln-box mt-6" aria-label="תוכן העניינים">
      <h2 className="text-xl font-black mb-2">במדריך</h2>
      <ul className="grid gap-1 sm:grid-cols-2">{GAN_BIRTHDAY_SECTIONS.map(s => <li key={s.id}><a href={`#gb-${s.id}`} className="underline font-bold">{s.emoji} {s.title}</a></li>)}<li><a href="#gb-ask" className="underline font-bold">📝 שאלות לגננת</a></li></ul>
    </nav>

    {GAN_BIRTHDAY_SECTIONS.map(s => <section key={s.id} id={`gb-${s.id}`} className="sc-section" aria-labelledby={`gbh-${s.id}`}>
      <h2 id={`gbh-${s.id}`} style={{ textAlign: 'start' }}><span aria-hidden="true">{s.emoji} </span>{s.title}</h2>
      <div className="space-y-3 text-lg leading-relaxed">{s.paras.map(p => <p key={p} className="m-0">{p}</p>)}</div>
      {s.id === 'crown' && <p className="mt-3"><Link to="/printables/birthday-crown" className="ln-chip">👑 כתר יום הולדת להדפסה</Link></p>}
      {s.id === 'bring' && <p className="mt-3 flex flex-wrap gap-2"><Link to="/cakes" className="ln-chip">🎂 רעיונות לעוגות יום הולדת</Link><Link to="/printables/allergy-signs" className="ln-chip">⚠️ שלטי אלרגיה להדפסה</Link></p>}
    </section>)}

    <section id="gb-ask" className="sc-section" aria-labelledby="gbh-ask">
      <h2 id="gbh-ask">📝 שאלות לשלוח לגננת</h2>
      <p className="sc-lead">סמנו את מה שכבר ידוע לכם, ושלחו את שאר השאלות לגננת בוואטסאפ.</p>
      <div className="ln-box space-y-2">
        <label className="sc-field">שם הילד/ה (לא חובה)
          <input className="sc-input" value={child} maxLength={MAX_NAME} onChange={e => setChild(e.target.value)} />
        </label>
        {GAN_BIRTHDAY_QUESTIONS.map(q => <label key={q} className={`sc-check ${asked[q] ? 'is-done' : ''}`}>
          <input type="checkbox" checked={!!asked[q]} onChange={e => setAsked(a => ({ ...a, [q]: e.target.checked }))} /><span>{q}</span>
        </label>)}
        <button type="button" className="ln-btn" onClick={() => {
          const open = GAN_BIRTHDAY_QUESTIONS.filter(q => !asked[q])
          const text = open.length === GAN_BIRTHDAY_QUESTIONS.length ? ganBirthdayQuestionsText(child)
            : [ganBirthdayQuestionsText(child).split('\n')[0], ...open.map(q => `• ${q}`)].join('\n')
          shareOnWhatsApp(`היי, לקראת יום ההולדת רציתי לשאול:\n${text}\nתודה! 💛`)
        }}>💬 שליחה לגננת בוואטסאפ</button>
      </div>
    </section>

    <div className="sc-section"><SeoBody paragraphs={[
      'יום הולדת בגן הוא לרוב הפעם הראשונה שהילד חוגג מול כל החברים, והוא מחכה לזה שבועות. החדשות הטובות: אין צורך בהפקה. כתר, כיסא מקושט, שירים, קצת כיבוד ותמונות של הילד מספיקים כדי שזה יהיה היום הכי מרגש בשנה.',
      'כל גן מתנהל אחרת: יש גנים שחוגגים בדיוק ביום ההולדת ויש שבימי שישי, יש שמבקשים פירות בלבד ויש שמאפשרים עוגה, יש שההורים מוזמנים ויש שלא. לכן הכלל הכי חשוב הוא לשאול את הגננת מראש, ולהקפיד במיוחד על כללי האלרגיות.',
      'רוצים לחגוג גם בבית או עם כל הכיתה? במדריך ליום הולדת כיתתי יש רעיונות לחגיגה מחוץ לגן, ובעמוד הברכות ימצאו ההורים, הסבים והסבתות ברכות מוכנות לכל גיל.',
    ]} faq={GAN_BIRTHDAY_FAQ} related={[{ label: 'כתר יום הולדת להדפסה', href: '/printables/birthday-crown' }, { label: 'עוגות יום הולדת', href: '/cakes' }, { label: 'ברכות ליום הולדת', href: '/birthday-greetings' }, { label: 'יום הולדת כיתתי', href: '/guides/class-birthday-guide' }]} /></div>

    <RelatedGrid links={[
      { emoji: '👑', label: 'כתר יום הולדת', href: '/printables/birthday-crown' },
      { emoji: '🎂', label: 'עוגות יום הולדת', href: '/cakes' },
      { emoji: '💌', label: 'ברכות ליום הולדת', href: '/birthday-greetings' },
      { emoji: '🎈', label: 'ברכות לגיל 5', href: '/greetings/age-5' },
      { emoji: '🏫', label: 'יום הולדת כיתתי', href: '/guides/class-birthday-guide' },
      { emoji: '☀️', label: 'יום הולדת בקיץ', href: '/ideas/summer-birthday' },
      { emoji: '🎁', label: 'שקיות הפתעה', href: '/guides/party-bags-guide' },
      { emoji: '🌼', label: 'מתנה לגננת', href: '/gifts/gananet' },
    ]} />
  </div>
}

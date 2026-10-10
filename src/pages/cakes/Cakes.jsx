import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import {
  CAKES, CAKE_TAGS, KOSHER_LABEL, SCALES, PAN_GUIDE, DIGIT_BOX, DIGIT_RECTS,
  getCake, cakePath, relatedCakes, cakeShortTitle, allergenLabels, formatIngredient,
  totalMinutes, minutesLabel, matchesTag, recipeSchema, ageDigits, CAKES_HUB_PATH,
} from '../../data/cakes'
import '../../learn/learn.css'
import './cakes.css'

const HUB = { label: 'עוגות יום הולדת', href: CAKES_HUB_PATH }
const HUB_TAGS = ['kids', 'gluten-free', 'parve', 'no-bake', 'number', 'chocolate', 'easy', 'vegan']

const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>

function Badges({ c }) {
  return <div className="ck-badges">
    <span className="ck-badge time">⏱️ {minutesLabel(totalMinutes(c))}</span>
    {c.servings > 0 && <span className="ck-badge serves">🍽️ {c.servings} מנות</span>}
    <span className="ck-badge level">📶 {c.difficulty}</span>
    <span className={`ck-badge kosher ${c.kosher}`}>{KOSHER_LABEL[c.kosher]}</span>
    {c.tags.includes('gluten-free') && <span className="ck-badge gf">🌾 ללא גלוטן</span>}
    {c.tags.includes('vegan') && <span className="ck-badge gf">🌱 טבעוני</span>}
  </div>
}

function CakeCard({ c }) {
  return <Link to={cakePath(c)} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-4 text-right">
    <div className="ck-card">
      <div className="text-4xl" aria-hidden="true">{c.emoji}</div>
      <h3 className="text-xl font-bold leading-snug">{cakeShortTitle(c)}</h3>
      <p className="m-0 text-[var(--muted-foreground)]">{c.summary}</p>
      <div className="mt-auto pt-2"><Badges c={c} /></div>
    </div>
  </Link>
}

// ── digit cutting diagram (number cake) ───────────────────────────────
function DigitDiagram({ d, labels = true, title }) {
  const { w, h, bar } = DIGIT_BOX
  const pad = labels ? 34 : 4
  return <svg viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`} className="ck-digit" role="img" aria-label={title || `שרטוט חיתוך של הספרה ${d} מעוגה בתבנית 20 על 30 ס"מ`}>
    <rect x="0" y="0" width={w} height={h} rx="6" className="ck-digit-left" />
    {DIGIT_RECTS[d].map(([x, y, rw, rh], k) => <rect key={k} x={x} y={y} width={rw} height={rh} className="ck-digit-keep" />)}
    <rect x="0" y="0" width={w} height={h} rx="6" className="ck-digit-frame" />
    {[60, 120, 180, 240].map(y => <line key={'h' + y} x1="0" x2={w} y1={y} y2={y} className="ck-digit-grid" />)}
    {[60, 140].map(x => <line key={'v' + x} y1="0" y2={h} x1={x} x2={x} className="ck-digit-grid" />)}
    {labels && <>
      <text x={w / 2} y={-12} textAnchor="middle" className="ck-digit-label">20 ס"מ</text>
      <text x={w + 14} y={h / 2} textAnchor="middle" className="ck-digit-label" transform={`rotate(90 ${w + 14} ${h / 2})`}>30 ס"מ</text>
      <text x={d === 1 ? 100 : 30} y={h + 22} textAnchor="middle" className="ck-digit-label small">{bar / 10} ס"מ</text>
    </>}
  </svg>
}

function NumberCakeTool({ age, setAge }) {
  const digits = ageDigits(age)
  return <section className="ln-box mt-6" aria-labelledby="digit-tool">
    <h2 id="digit-tool" className="text-2xl font-black text-center">✂️ שרטוט חיתוך לפי הגיל</h2>
    <div className="no-print mt-3 flex flex-wrap items-center justify-center gap-2">
      <label htmlFor="ck-age" className="font-bold">בן/בת כמה?</label>
      <input id="ck-age" className="ck-input" type="number" inputMode="numeric" min="0" max="99" value={age} onChange={e => setAge(e.target.value.slice(0, 2))} />
    </div>
    <div className="no-print mt-3 flex flex-wrap justify-center gap-2" role="group" aria-label="בחירה מהירה של גיל">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <Chip key={n} on={String(n) === String(age)} onClick={() => setAge(String(n))}>{n}</Chip>)}
    </div>
    <div className="ck-digits mt-4">{digits.map((d, k) => <figure key={k} className="m-0"><DigitDiagram d={d} /><figcaption className="text-center font-bold">ספרה {d} · תבנית {k + 1}</figcaption></figure>)}</div>
    <p className="mt-3 text-center">החלק החום — העוגה שנשארת. החלק הבהיר — שאריות. קווי העזר מסמנים פסים ברוחב 6 ס"מ{digits.length > 1 ? '. לגיל דו־ספרתי צריך שתי עוגות, אחת לכל ספרה.' : '.'}</p>
  </section>
}

// ── /cakes ───────────────────────────────
const HUB_FAQ = [
  { q: 'איזו עוגת יום הולדת הכי קלה להכין?', a: 'עוגת שוקולד בתבנית שמערבבים בקערה אחת, עוגת גביע שמודדים בגביע היוגורט, או עוגת ביסקוויטים שלא צריכה תנור בכלל. שלושתן מתאימות גם להכנה עם הילדים.' },
  { q: 'כמה עוגה צריך ליום הולדת של ילדים?', a: 'תבנית מלבנית של 20×30 ס"מ נותנת 24 ריבועים של 5 ס"מ, שמספיקים לכיתה או לגן. עוגה עגולה של 26 ס"מ נותנת 12–16 פרוסות. בטבלה בעמוד יש מדריך לפי גודל התבנית.' },
  { q: 'יש כאן עוגות ללא גלוטן, פרווה וטבעוניות?', a: 'כן. יש עוגת שוקולד בלי קמח (ללא גלוטן), עוגת שיש פרווה עם מיץ תפוזים, ועוגת שוקולד טבעונית בלי ביצים ובלי חלב. בכל מתכון מצוין אם הוא חלבי או פרווה, ומה האלרגנים בו.' },
  { q: 'איך מכינים עוגת מספר בלי תבנית מיוחדת?', a: 'חותכים את הספרה מעוגה בתבנית מלבנית של 20×30 ס"מ, לפי שרטוט של פסים ברוחב 6 ס"מ. במדריך לעוגת מספר יש שרטוט לכל ספרה מ־0 עד 9.' },
  { q: 'אפשר להדפיס את המתכונים?', a: 'כן. בכל מתכון יש כפתור הדפסה שמכין דף נקי עם המצרכים — גם בכמות כפולה או חצי — והוראות ההכנה, בלי תפריטים ופרסומות.' },
]

export function CakesHub() {
  const [tag, setTag] = useState('')
  const list = CAKES.filter(c => matchesTag(c, tag))
  const tagInfo = CAKE_TAGS.find(t => t.id === tag)
  return <div className="ck-page mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="עוגות יום הולדת — מתכונים קלים לילדים, ללא גלוטן, פרווה ועוגת מספר" description="עוגות יום הולדת: מתכונים בדוקים לעוגת שוקולד, עוגת קרם, קאפקייקס, עוגת ביסקוויטים, עוגת מספר עם שרטוטי חיתוך, ללא גלוטן, פרווה וטבעונית. עם הדפסה." path={CAKES_HUB_PATH} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: HUB.label }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold text-[#1d2233]">{CAKES.length} מתכונים ומדריכים · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🎂 </span>עוגות יום הולדת</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">מתכונים לעוגת יום הולדת שמצליחים בבית: עוגת שוקולד בתבנית, עוגת קרם, קאפקייקס, עוגת ביסקוויטים בלי אפייה ועוגת מספר — וגם גרסאות ללא גלוטן, פרווה וטבעוניות.</p>
    </header>

    <section className="no-print mt-6" aria-label="סינון עוגות">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="סוג עוגה">
        <Chip on={!tag} onClick={() => setTag('')}>הכול</Chip>
        {HUB_TAGS.map(id => { const t = CAKE_TAGS.find(x => x.id === id); return <Chip key={id} on={tag === id} onClick={() => setTag(tag === id ? '' : id)}><span aria-hidden="true">{t.emoji}</span> {t.label}</Chip> })}
      </div>
    </section>

    <h2 className="mt-8 mb-4 text-center text-2xl font-black">{tagInfo ? `${tagInfo.label} · ${list.length}` : 'כל העוגות'}</h2>
    {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(c => <CakeCard key={c.slug} c={c} />)}</div>
      : <p className="text-center">אין עדיין עוגה בקטגוריה הזו. <button type="button" className="underline font-bold" onClick={() => setTag('')}>הצגת כל העוגות</button></p>}

    <section className="ln-box mt-10" aria-labelledby="pan-guide">
      <h2 id="pan-guide" className="text-2xl font-black text-center">📏 כמה עוגה צריך? מדריך לפי תבנית</h2>
      <div className="ck-table-wrap mt-3"><table className="ck-table">
        <thead><tr><th scope="col">תבנית</th><th scope="col">איך חותכים</th><th scope="col">מנות</th></tr></thead>
        <tbody>{PAN_GUIDE.map(r => <tr key={r.pan}><td>{r.pan}</td><td>{r.cut}</td><td>{r.serves}</td></tr>)}</tbody>
      </table></div>
      <p className="mt-3 mb-0 text-center text-sm text-[var(--muted-foreground)]">לילדים קטנים מספיקה חתיכה של 4–5 ס"מ. כדאי להוסיף 10% ליתר ביטחון.</p>
    </section>

    <section className="ln-box mt-6 text-center">
      <h2 className="text-2xl font-black">🎉 עוד למסיבת יום ההולדת</h2>
      <p className="mt-2 mb-0">אחרי שהעוגה מוכנה: <Link to="/birthday-greetings" className="font-bold underline">ברכות ליום הולדת</Link>, <Link to="/birthday-invitation" className="font-bold underline">הזמנה ליום הולדת</Link>, <Link to="/games/birthday" className="font-bold underline">משחקים ליום הולדת</Link> ו<Link to="/printables/birthday-checklist" className="font-bold underline">רשימת הכנות להדפסה</Link>.</p>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      'עוגת יום הולדת לא חייבת להיות מסובכת כדי להיות מרגשת. ברוב המסיבות, מה שהילדים זוכרים הוא הרגע שבו העוגה יוצאת עם הנרות, ולא כמה שכבות היו בה. לכן אספנו כאן מתכונים שמצליחים בבית: עוגת שוקולד עסיסית בתבנית גדולה, עוגת גביע שהילדים מכינים בעצמם, עוגת ספוג ועוגת קרם לשכבות, קאפקייקס, עוגת ביסקוויטים בלי אפייה ועוגת גבינה בכוסות.',
      'כל מתכון נבדק מול כמה מקורות, והכמויות כתובות במידות ישראליות — כוס, כף, גרם וגודל תבנית — עם טמפרטורת תנור וזמן אפייה. ליד כל מתכון מצוין אם הוא חלבי או פרווה ואילו אלרגנים יש בו, ואפשר להכפיל או לחצות את הכמויות בלחיצה.',
      'יש גם מדריכים לעוגת מספר — מעוגה בתבנית עם שרטוט חיתוך לכל ספרה, ומבצק פריך בסגנון נאמבר קייק — ולציפויים: גנאש, קרם חמאה וקצפת יציבה. ולמי שצריך: עוגת שוקולד בלי קמח ללא גלוטן, עוגת שיש פרווה ועוגה טבעונית בלי ביצים ובלי חלב.',
    ]} faq={HUB_FAQ} related={[{ label: 'יום הולדת', href: '/birthday' }, { label: 'ברכות ליום הולדת', href: '/birthday-greetings' }, { label: 'מתכונים לילדים', href: '/food/kids-recipes' }, { label: 'עוגה לצביעה', href: '/printables/coloring/cake' }]} /></div>
  </div>
}

// ── /cakes/:slug ───────────────────────────────
export function CakePage() {
  const { slug } = useParams()
  const c = getCake(slug)
  if (!c) return <NotFound />
  return <Cake key={c.slug} c={c} />
}

function Cake({ c }) {
  const [factor, setFactor] = useState(1)
  const [checked, setChecked] = useState(() => new Set())
  const [printing, setPrinting] = useState(false)
  const [age, setAge] = useState('5')
  const path = cakePath(c)
  const scalable = c.kind === 'recipe'
  const toggle = key => setChecked(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })
  const share = () => shareOnWhatsApp(`${c.emoji} ${c.title}\n${c.summary}\n${shareLink(path, 'cakes')}`)
  const allergens = allergenLabels(c)
  const related = relatedCakes(c)
  const schema = [recipeSchema(c), faqSchema(c.faq)].filter(Boolean)
  const stepStart = c.steps.map((_, gi) => c.steps.slice(0, gi).reduce((n, g) => n + g.items.length, 0))

  return <div className="ck-page mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={c.seoTitle} description={c.description} path={path} type="article" structuredData={schema} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: cakeShortTitle(c) }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">{c.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{c.title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{c.summary}</p>
      <div className="mt-3 flex justify-center"><Badges c={c} /></div>
    </header>

    <div className="mt-5 space-y-3 text-lg leading-relaxed">{c.intro.map((p, k) => <p key={k} className="m-0">{p}</p>)}</div>

    <dl className="ck-facts mt-5">
      {c.yieldText && <div><dt>כמות</dt><dd>{c.yieldText}</dd></div>}
      {c.pan && <div><dt>תבנית</dt><dd>{c.pan}</dd></div>}
      <div><dt>תנור</dt><dd>{c.ovenC ? `${c.ovenC} מעלות, חום עליון־תחתון` : 'בלי אפייה'}</dd></div>
      <div><dt>זמנים</dt><dd>הכנה {minutesLabel(c.time.prep)}{c.time.cook ? ` · אפייה ${minutesLabel(c.time.cook)}` : ''}{c.time.chill ? ` · קירור ${minutesLabel(c.time.chill)}` : ''}</dd></div>
    </dl>

    {allergens.length > 0 && <aside className="ck-note mt-4" aria-label="אלרגנים">
      <b>⚠️ אלרגנים:</b> {allergens.join(' · ')}. בודקים תמיד את התוויות של המוצרים — חלקם "עלולים להכיל" אגוזים, חלב או גלוטן.
    </aside>}

    <div className="no-print mt-5 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסת {c.kind === 'recipe' ? 'המתכון' : 'המדריך'}</button>
      <button type="button" className="ln-btn alt" onClick={share}>💬 שליחה בוואטסאפ</button>
    </div>

    {c.diagram === 'digits' && <NumberCakeTool age={age} setAge={setAge} />}

    <section className="ln-box mt-6" aria-labelledby="ingredients">
      <h2 id="ingredients" className="text-2xl font-black">{c.kind === 'recipe' ? '🧺 מצרכים' : '🧺 מה צריך'}</h2>
      {scalable && <div className="no-print mt-2 flex flex-wrap gap-2" role="group" aria-label="שינוי כמות">
        {SCALES.map(s => <Chip key={s.f} on={factor === s.f} onClick={() => setFactor(s.f)}>{s.label}</Chip>)}
      </div>}
      {scalable && factor !== 1 && <p className="ck-scale-note mt-2 mb-0" role="status">שימו לב: בכמות {factor > 1 ? 'גדולה' : 'קטנה'} יותר צריך תבנית {factor > 1 ? 'גדולה' : 'קטנה'} יותר, וזמן האפייה משתנה — בודקים עם קיסם.</p>}
      <p className="no-print mt-2 mb-0 text-sm text-[var(--muted-foreground)]">לוחצים על מצרך כדי לסמן שהוא כבר על השיש.</p>
      {c.ingredients.map((g, gi) => <div key={gi} className="mt-3">
        {g.title && <h3 className="text-lg font-black">{g.title}</h3>}
        <ul className="ck-checklist">{g.items.map((it, ii) => {
          const key = `${gi}-${ii}`, on = checked.has(key)
          return <li key={key}><button type="button" role="checkbox" aria-checked={on} className={on ? 'is-on' : ''} onClick={() => toggle(key)}>
            <span className="ck-box" aria-hidden="true">{on ? '✓' : ''}</span><span>{formatIngredient(it, scalable ? factor : 1)}</span>
          </button></li>
        })}</ul>
      </div>)}
    </section>

    <section className="mt-6" aria-labelledby="steps">
      <h2 id="steps" className="text-2xl font-black">👩‍🍳 {c.kind === 'recipe' ? 'אופן ההכנה' : 'שלב אחר שלב'}</h2>
      {c.steps.map((g, gi) => <div key={gi} className="mt-3">
        {g.title && <h3 className="text-lg font-black">{g.title}</h3>}
        <ol className="ck-steps">{g.items.map((s, si) => { const n = stepStart[gi] + si + 1; return <li key={si} id={`step-${n}`} value={n}>{s}</li> })}</ol>
      </div>)}
    </section>

    {c.kidsTasks && <section className="ln-box mt-6" aria-labelledby="kids-tasks">
      <h2 id="kids-tasks" className="text-2xl font-black">🧒 מה הילדים עושים — לפי גיל</h2>
      <ul className="mt-2 space-y-2">{c.kidsTasks.map(k => <li key={k.age}><b>{k.age}:</b> {k.text}</li>)}</ul>
      <p className="mt-2 mb-0">התנור, הסכינים והמיקסר — רק עם מבוגר.</p>
    </section>}

    {c.glutenNotes && <section className="ck-note mt-6" aria-labelledby="gf-notes">
      <h2 id="gf-notes" className="text-xl font-black">🌾 איך שומרים על "ללא גלוטן"</h2>
      <ul className="mt-2 mb-0 space-y-1">{c.glutenNotes.map((n, k) => <li key={k}>{n}</li>)}</ul>
    </section>}

    {c.kosherNotes && <section className="ck-note mt-6" aria-labelledby="kosher-notes">
      <h2 id="kosher-notes" className="text-xl font-black">🥄 פרווה — מה בודקים</h2>
      <ul className="mt-2 mb-0 space-y-1">{c.kosherNotes.map((n, k) => <li key={k}>{n}</li>)}</ul>
    </section>}

    {c.themesList && <section className="mt-6" aria-labelledby="themes">
      <h2 id="themes" className="text-2xl font-black">🎨 רעיונות לפי נושא</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{c.themesList.map(th => <div key={th.name} className="ln-box">
        <h3 className="text-xl font-black"><span aria-hidden="true">{th.emoji} </span>{th.name}</h3>
        <ul className="mt-2 mb-0 space-y-1">{th.ideas.map((x, k) => <li key={k}>{x}</li>)}</ul>
      </div>)}</div>
    </section>}

    {c.tips.length > 0 && <section className="ck-tips mt-6" aria-labelledby="tips">
      <h2 id="tips" className="text-2xl font-black">💡 טיפים</h2>
      <ul className="mt-2 mb-0 space-y-2">{c.tips.map((x, k) => <li key={k}>{x}</li>)}</ul>
    </section>}

    {c.decorating.length > 0 && <section className="mt-6" aria-labelledby="decor">
      <h2 id="decor" className="text-2xl font-black">🎉 רעיונות לקישוט</h2>
      <ul className="mt-2 space-y-2">{c.decorating.map((x, k) => <li key={k}>{x}</li>)}</ul>
      <p className="m-0"><Link to={cakePath('decorating-ideas')} className="font-bold underline">עוד רעיונות לקישוט לפי נושא ←</Link></p>
    </section>}

    {printing && <PrintPreview title={c.title} onClose={() => setPrinting(false)}>
      <article className="buga-flow ck-print" dir="rtl">
        <h2>{c.emoji} {c.title}</h2>
        <p className="ck-print-meta">{[c.yieldText, c.ovenC ? `תנור ${c.ovenC}°` : 'בלי אפייה', `סה"כ ${minutesLabel(totalMinutes(c))}`, KOSHER_LABEL[c.kosher]].filter(Boolean).join(' · ')}{scalable && factor !== 1 ? ` · כמות: ${SCALES.find(s => s.f === factor)?.label}` : ''}</p>
        {c.ingredients.map((g, gi) => <div key={gi}>
          <h3>{g.title || 'מצרכים'}</h3>
          <ul>{g.items.map((it, ii) => <li key={ii}>☐ {formatIngredient(it, scalable ? factor : 1)}</li>)}</ul>
        </div>)}
        {c.steps.map((g, gi) => <div key={gi}>
          <h3>{g.title || 'אופן ההכנה'}</h3>
          <ol>{g.items.map((s, si) => <li key={si}>{s}</li>)}</ol>
        </div>)}
        {c.tips.length > 0 && <><h3>טיפים</h3><ul>{c.tips.slice(0, 3).map((x, k) => <li key={k}>{x}</li>)}</ul></>}
        {allergens.length > 0 && <p className="ck-print-note">אלרגנים: {allergens.join(', ')}.</p>}
      </article>
      {c.diagram === 'digits' && ageDigits(age).map((d, k) => <article key={k} className="buga-a4">
        <h2>שרטוט חיתוך — ספרה {d}</h2>
        <p className="art-caption">עוגה בתבנית 20×30 ס"מ · קווי העזר מסמנים פסים ברוחב 6 ס"מ · החלק הכהה נשאר</p>
        <div className="print-art"><DigitDiagram d={d} /></div>
        <footer>עוגה בוגה · ugabuga.co.il</footer>
      </article>)}
    </PrintPreview>}

    <section className="no-print mt-10">
      <h2 className="mb-4 text-center text-2xl font-black">עוד עוגות יום הולדת</h2>
      <div className="grid gap-4 sm:grid-cols-2">{related.map(r => <CakeCard key={r.slug} c={r} />)}</div>
      <p className="mt-4 text-center"><Link to={CAKES_HUB_PATH} className="font-bold underline">לכל {CAKES.length} העוגות ←</Link></p>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      `${c.title}: ${c.description}`,
      'כל המתכונים בעוגה בוגה כתובים במידות ישראליות (כוס = 240 מ"ל), עם טמפרטורת תנור, זמני הכנה ואלרגנים. תנורים שונים זה מזה, ולכן תמיד בודקים מוכנות עם קיסם כמה דקות לפני סוף הזמן.',
    ]} faq={c.faq} related={[HUB, { label: 'יום הולדת', href: '/birthday' }, { label: 'ברכות ליום הולדת', href: '/birthday-greetings' }, { label: 'משחקים ליום הולדת', href: '/games/birthday' }]} /></div>
  </div>
}

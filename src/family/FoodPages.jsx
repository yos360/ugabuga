import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import NotFound from '../pages/NotFound'
import { SANDWICHES, SIDES, ALLERGENS, KINDS, BREADS } from './foodData'
import { RECIPES, EXPERIMENTS } from './kidsKitchen'
import './family.css'

export const FOOD_CRUMB = { label: 'אוכל לילדים', href: '/food' }
const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const breadOf = sw => (sw.bread === 'any' ? 'לחם לבחירה' : BREADS[sw.bread])

// ── shared filters ───────────────────────────────
const DEFAULT_FILTER = { kind: 'all', noNuts: true, noSesame: false, noEgg: false, noFish: false, vegan: false, picky: false, gf: false, sweet: 'any' }
function useFilter() {
  const [f, setF] = useState(DEFAULT_FILTER)
  const list = useMemo(() => SANDWICHES.filter(s =>
    (f.kind === 'all' || s.kind === f.kind) &&
    (!f.noNuts || !s.al.some(a => a === 'peanut' || a === 'nuts')) &&
    (!f.noSesame || !s.al.includes('sesame')) && (!f.noEgg || !s.al.includes('egg')) && (!f.noFish || !s.al.includes('fish')) &&
    (!f.vegan || s.vegan) && (!f.picky || s.picky) && (!f.gf || s.gf) &&
    (f.sweet === 'any' || (f.sweet === 'yes') === s.sweet)), [f])
  return [f, setF, list]
}
function Toggle({ on, onClick, children }) { return <button type="button" className="fam-chip" aria-pressed={on} onClick={onClick}>{children}</button> }
function Filters({ f, setF }) {
  const t = k => () => setF(x => ({ ...x, [k]: !x[k] }))
  return <div className="fam-filters">
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="סוג">
      {[['all', 'הכול'], ['dairy', '🧀 חלבי'], ['parve', '🥚 פרווה'], ['meat', '🍗 בשרי']].map(([k, l]) => <Toggle key={k} on={f.kind === k} onClick={() => setF(x => ({ ...x, kind: k }))}>{l}</Toggle>)}
    </div>
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="סינון">
      <Toggle on={f.noNuts} onClick={t('noNuts')}>🥜 בלי בוטנים ואגוזים</Toggle>
      <Toggle on={f.noSesame} onClick={t('noSesame')}>בלי שומשום</Toggle>
      <Toggle on={f.noEgg} onClick={t('noEgg')}>בלי ביצה</Toggle>
      <Toggle on={f.noFish} onClick={t('noFish')}>בלי דג</Toggle>
      <Toggle on={f.vegan} onClick={t('vegan')}>🌱 טבעוני</Toggle>
      <Toggle on={f.gf} onClick={t('gf')}>בלי לחם (פריכיות)</Toggle>
      <Toggle on={f.picky} onClick={t('picky')}>😋 לילדים בררנים</Toggle>
    </div>
  </div>
}
function Badges({ s }) {
  return <div className="fam-badges">
    <span className={`fam-badge kind-${s.kind}`}>{KINDS[s.kind]}</span>
    {s.vegan && <span className="fam-badge">🌱 טבעוני</span>}
    {s.cold && <span className="fam-badge cold">❄️ עם שקית קירור</span>}
    {s.al.filter(a => a !== 'gluten').map(a => <span key={a} className={`fam-badge al ${a === 'peanut' || a === 'nuts' ? 'warn' : ''}`}>מכיל {ALLERGENS[a]}</span>)}
  </div>
}

// ── /food ───────────────────────────────
export const FOOD_SECTIONS = [
  ['/food/school-lunch', '🥪', 'מה שמים היום בכריך?', 'מחולל ארוחת עשר ו-50 רעיונות לכריכים, עם סינון לפי אלרגיות'],
  ['/food/lunch-planner', '🗓️', 'תכנון ארוחת עשר לשבוע', 'שבוע שלם בלחיצה, להדפסה — עם רשימת קניות'],
  ['/printables/lunchbox-notes', '💌', 'פתקים לקופסת האוכל', 'פתקים קטנים עם חיוך — לגזור ולשים בקופסה'],
  ['/printables/allergy-signs', '🥜', 'שלטים ומדבקות לאלרגיות', 'אצלנו בגן לא אוכלים בוטנים — ושלט לכל אלרגיה'],
  ['/food/kids-recipes', '👩‍🍳', 'מתכונים שילדים מכינים', 'פיצה בפיתה, כדורי שוקולד, עוגיות בננה ועוד'],
  ['/food/kitchen-science', '🧪', 'מדע במטבח', 'ניסויים עם מה שיש בבית — והסבר למה זה קורה'],
]
export function FoodHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="אוכל לילדים — ארוחת עשר, מתכונים וניסויים במטבח" description="רעיונות לארוחת עשר ולכריכים לבית הספר, תכנון שבועי עם רשימת קניות, מתכונים שילדים מכינים לבד וניסויי מדע במטבח. חינם, בעברית." path="/food" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אוכל לילדים' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🍎 </span>אוכל לילדים</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">ארוחת עשר בלי לשבור את הראש, ומטבח שהילדים נכנסים אליו בשמחה</p>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{FOOD_SECTIONS.map(([to, e, t, d]) => <Link key={to} to={to} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right"><div className="text-4xl mb-2" aria-hidden="true">{e}</div><h2 className="text-2xl font-bold">{t}</h2><p className="text-[var(--muted-foreground)]">{d}</p></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['כל בוקר אותה שאלה: מה שמים היום בכריך? כאן יש תשובות מוכנות — כריכים שמשפחות בארץ באמת מכינות, עם סימון ברור של חלבי, פרווה ובשרי, ושל אלרגנים כמו בוטנים, שומשום, ביצה ודג.', 'לצד ארוחת העשר יש מתכונים פשוטים שילדים יכולים להכין כמעט לבד, וניסויים קטנים במטבח שמלמדים מדע עם סודה לשתייה, חומץ וכרוב סגול. בכל שלב שיש בו אש, תנור או סכין חדה — כתוב שמבוגר עושה אותו.']} related={[{ label: 'כמה פיצות להזמין', href: '/calculator/how-many-pizzas' }, { label: 'לוחות לבית', href: '/printables/home-charts' }]} /></div>
  </div>
}

// ── /food/school-lunch ───────────────────────────────
export function SchoolLunch() {
  const [f, setF, list] = useFilter()
  const [box, setBox] = useState(null)
  const roll = () => setBox(list.length ? { sw: pick(list), veg: pick(SIDES.veg), fruit: pick(SIDES.fruit), extra: Math.random() < 0.5 ? pick(SIDES.extra) : null, k: Date.now() } : null)
  const faq = [
    { q: 'איך שומרים על הכריך טרי עד ההפסקה?', a: 'כריכים עם גבינה רכה, טונה, ביצה או בשר כדאי לשלוח עם שקית קירור קטנה, במיוחד בימים חמים. ירקות חתוכים שומרים בקופסה נפרדת כדי שהלחם לא יירטב.' },
    { q: 'למה כדאי לבחור "בלי בוטנים ואגוזים"?', a: 'בהרבה גנים ובתי ספר בארץ יש איסור על בוטנים ואגוזים בגלל ילדים אלרגיים. הסינון פועל כברירת מחדל — אם מכינים לבית אפשר לבטל אותו.' },
    { q: 'מה להכין לילד שאוכל רק "לבן"?', a: 'מסננים "לילדים בררנים": גבינה צהובה, חביתה, גבינה לבנה, ריבה, שניצל — דברים מוכרים ופשוטים. אפשר לגוון בצורה (כריך משולש, טורטייה מגולגלת) בלי לשנות את הטעם.' },
  ]
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מה שמים בכריך? רעיונות לארוחת עשר לבית ספר ולגן" description={`${SANDWICHES.length} רעיונות לכריכים לבית הספר ולגן ומחולל ארוחת עשר: כריך, ירק ופרי בלחיצה. סינון בלי בוטנים, שומשום, ביצה או דג, טבעוני וחלבי/פרווה/בשרי.`} path="/food/school-lunch" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'ארוחת עשר' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🥪 </span>מה שמים היום בכריך?</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">לוחצים — ומקבלים ארוחת עשר שלמה: כריך, ירק ופרי</p>
    <Filters f={f} setF={setF} />
    <div className="fam-box">
      <button type="button" className="fam-roll" onClick={roll}>🎲 {box ? 'עוד רעיון' : 'מה שמים היום?'}</button>
      {box && <div key={box.k} className="fam-lunch fam-pop">
        <div className="fam-lunch-main"><span className="fam-lunch-icon" aria-hidden="true">🥪</span><div><b>{box.sw.name}</b><small>ב{breadOf(box.sw)}</small></div></div>
        <div className="fam-lunch-row"><span>🥕 {box.veg}</span><span>🍎 {box.fruit}</span>{box.extra && <span>✨ {box.extra}</span>}</div>
        <Badges s={box.sw} />
        {box.sw.tip && <p className="fam-tip">💡 {box.sw.tip}</p>}
      </div>}
      {!list.length && <p className="text-center font-bold">אין כריך שמתאים לכל הסינונים — נסו להוריד אחד.</p>}
    </div>
    <h2 className="mt-10 mb-3 text-2xl font-black">כל הרעיונות ({list.length})</h2>
    <div className="grid gap-3 sm:grid-cols-2">{list.map(s => <div key={s.id} className="fam-card"><b>{s.name}</b><small> · ב{breadOf(s)}</small><Badges s={s} />{s.tip && <p className="fam-tip">💡 {s.tip}</p>}</div>)}</div>
    <div className="mt-6 flex flex-wrap justify-center gap-2"><Link className="fam-chip" to="/food/lunch-planner">🗓️ לתכנן שבוע שלם ←</Link><Link className="fam-chip" to="/printables/lunchbox-notes">💌 פתקים לקופסה ←</Link><Link className="fam-chip" to="/printables/allergy-signs">🥜 שלטי אלרגיה ←</Link></div>
    <div className="mt-12"><SeoBody paragraphs={['ארוחת עשר טובה בנויה משלושה חלקים: כריך שמשביע, ירק לפריכות ופרי למתיקות. המחולל בוחר צירוף אחד מתוך הרשימה, ואפשר ללחוץ שוב עד שמוצאים משהו שהילד יאהב.', 'כל הכריכים ברשימה הם שילובים מוכרים שמשפחות בארץ באמת מכינות — בלי ניסויים מוזרים. ליד כל אחד מסומן אם הוא חלבי, פרווה או בשרי, אילו אלרגנים יש בו, ואם כדאי לשלוח אותו עם שקית קירור.']} faq={faq} related={[{ label: 'מתכונים שילדים מכינים', href: '/food/kids-recipes' }, { label: 'טבלת מטלות', href: '/printables/chore-chart' }]} /></div>
  </div>
}

// ── /food/lunch-planner ───────────────────────────────
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי']
function planWeek(list, n) {
  const pool = [...list].sort(() => Math.random() - 0.5)
  return Array.from({ length: n }, (_, i) => ({ sw: pool[i % pool.length], veg: pick(SIDES.veg), fruit: pick(SIDES.fruit) }))
}
export function LunchPlanner() {
  const [f, setF, list] = useFilter()
  const [days, setDays] = useState(5)
  const [name, setName] = useState('')
  const [plan, setPlan] = useState(() => planWeek(SANDWICHES.filter(s => !s.al.includes('peanut')), 5))
  const [printing, setPrinting] = useState(false)
  const remake = (n = days) => { if (list.length) setPlan(planWeek(list, n)) }
  const swap = i => list.length && setPlan(p => p.map((d, j) => (j === i ? { sw: pick(list), veg: pick(SIDES.veg), fruit: pick(SIDES.fruit) } : d)))
  const shopping = useMemo(() => {
    const items = new Map()
    for (const d of plan.slice(0, days)) {
      const b = d.sw.bread === 'any' ? 'לחם' : BREADS[d.sw.bread]
      items.set(b, (items.get(b) || 0) + 1)
      for (const x of d.sw.shop) items.set(x, (items.get(x) || 0) + 1)
      items.set(d.veg.replace(/ \(.*\)| חתוך.*| למקלות/g, ''), 1)
      items.set(d.fruit.replace(/ \(.*\)/g, ''), 1)
    }
    return [...items.keys()]
  }, [plan, days])
  const sheet = <article className="buga-flow fam-print" dir="rtl">
    <h2>ארוחת עשר לשבוע{name ? ` — ${name}` : ''}</h2>
    <table><thead><tr><th>יום</th><th>כריך</th><th>ירק</th><th>פרי</th></tr></thead>
      <tbody>{plan.slice(0, days).map((d, i) => <tr key={i}><td>{DAYS[i]}</td><td><b>{d.sw.name}</b><br /><small>ב{breadOf(d.sw)}{d.sw.cold ? ' · ❄️ שקית קירור' : ''}</small></td><td>{d.veg}</td><td>{d.fruit}</td></tr>)}</tbody></table>
    <h3>🛒 רשימת קניות</h3>
    <ul className="fam-shop">{shopping.map(x => <li key={x}>☐ {x}</li>)}</ul>
  </article>
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="תכנון ארוחת עשר לשבוע — להדפסה עם רשימת קניות" description="מתכננים ארוחת עשר לכל השבוע בלחיצה: כריך, ירק ופרי לכל יום, עם סינון אלרגיות ורשימת קניות מוכנה. מדפיסים ותולים על המקרר." path="/food/lunch-planner" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'תכנון שבועי' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🗓️ </span>ארוחת עשר לשבוע</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">שבוע שלם בלחיצה — מחליפים יום שלא מתאים, מדפיסים, וקונים לפי הרשימה</p>
    <Filters f={f} setF={setF} />
    <div className="my-4 flex flex-wrap items-center justify-center gap-2">
      <Toggle on={days === 5} onClick={() => { setDays(5); remake(5) }}>ראשון–חמישי</Toggle>
      <Toggle on={days === 6} onClick={() => { setDays(6); remake(6) }}>ראשון–שישי</Toggle>
      <input value={name} maxLength={16} onChange={e => setName(e.target.value)} placeholder="שם הילד/ה (לא חובה)" className="fam-input" />
      <button type="button" className="fam-roll small" onClick={() => remake()}>🎲 שבוע חדש</button>
    </div>
    {!list.length && <p className="text-center font-bold">אין כריך שמתאים לכל הסינונים — נסו להוריד אחד.</p>}
    <div className="space-y-2">{plan.slice(0, days).map((d, i) => <div key={i} className="fam-day"><b className="fam-day-name">{DAYS[i]}</b>
      <div className="flex-1"><b>{d.sw.name}</b> <small>· ב{breadOf(d.sw)}</small><div className="text-sm">🥕 {d.veg} · 🍎 {d.fruit}</div>{d.sw.cold && <small className="fam-badge cold">❄️ עם שקית קירור</small>}</div>
      <button type="button" className="fam-chip" onClick={() => swap(i)} aria-label={`החלפה ליום ${DAYS[i]}`}>🔄</button></div>)}</div>
    <div className="mt-6 fam-card"><h2 className="text-xl font-black">🛒 רשימת קניות לשבוע</h2><ul className="fam-shop">{shopping.map(x => <li key={x}>☐ {x}</li>)}</ul></div>
    <div className="mt-6 text-center"><button type="button" data-print-main className="fam-roll" onClick={() => setPrinting(true)}>🖨️ הדפסה או PDF</button></div>
    {printing && <PrintPreview title="ארוחת עשר לשבוע" onClose={() => setPrinting(false)} onRefresh={() => remake()}>{sheet}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['תכנון של ארוחת עשר לשבוע חוסך את הלחץ של הבוקר ואת הנסיעות לסופר באמצע השבוע. המתכנן בוחר כריך אחר לכל יום, עם ירק ופרי, ומכין רשימת קניות אחת לכל השבוע.', 'לא מתאים יום מסוים? לוחצים על 🔄 ומחליפים רק אותו. אפשר לבחור חמישה או שישה ימים, לסנן אלרגיות, להוסיף את שם הילד ולהדפיס את הדף למקרר.']} related={[{ label: 'מחולל ארוחת עשר', href: '/food/school-lunch' }, { label: 'פתקים לקופסת האוכל', href: '/printables/lunchbox-notes' }]} /></div>
  </div>
}

// ── /food/kids-recipes ───────────────────────────────
export function KidsRecipes() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מתכונים לילדים — מתכונים קלים שילדים מכינים לבד" description={`${RECIPES.length} מתכונים קלים לילדים: פיצה בפיתה, כדורי שוקולד, עוגיות בננה, פנקייק, לימונדה ועוד. שלבים פשוטים, עם סימון מתי מבוגר עוזר. אפשר להדפיס.`} path="/food/kids-recipes" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'מתכונים לילדים' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">👩‍🍳 </span>מתכונים שילדים מכינים</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">שלבים קצרים וברורים — ובכל מקום שיש אש או תנור, מבוגר עוזר</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{RECIPES.map(r => <Link key={r.slug} to={`/food/kids-recipes/${r.slug}`} className="fam-card card-lift"><div className="text-4xl" aria-hidden="true">{r.emoji}</div><h2 className="text-xl font-bold">{r.title}</h2><small>גיל {r.age} · {r.time}{r.adult ? ' · 👩 עם מבוגר' : ''}</small></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['בישול עם ילדים מלמד יותר משנדמה: מדידה וחשבון, סבלנות, סדר פעולות — ובסוף גם אוכלים את מה שהכינו. המתכונים כאן נבחרו כי הם קצרים, עם מעט מצרכים, והילדים יכולים לעשות את רוב השלבים בעצמם.', 'ליד כל מתכון מסומן גיל מומלץ וזמן הכנה, ושלבים עם תנור, כיריים או סכין חדה מסומנים כשלבים של מבוגר. כל מתכון אפשר להדפיס ולתלות במטבח.']} related={[{ label: 'מדע במטבח', href: '/food/kitchen-science' }, { label: 'ארוחת עשר', href: '/food/school-lunch' }]} /></div>
  </div>
}
export function KidsRecipe() {
  const { slug } = useParams()
  const r = RECIPES.find(x => x.slug === slug)
  const [printing, setPrinting] = useState(false)
  if (!r) return <NotFound />
  const card = <article className="buga-flow fam-print" dir="rtl"><h2>{r.emoji} {r.title}</h2><p>גיל {r.age} · {r.time} · {r.serves} מנות · {r.kind}</p>
    <h3>מה צריך</h3><ul>{r.ingredients.map(i => <li key={i}>☐ {i}</li>)}</ul>
    <h3>איך מכינים</h3><ol>{r.steps.map(s => <li key={s}>{s}</li>)}</ol>{r.tip && <p>💡 {r.tip}</p>}</article>
  const faq = [{ q: `כמה זמן לוקח להכין ${r.title}?`, a: `${r.time}, ${r.serves} מנות.` }, { q: 'הילד יכול להכין לבד?', a: r.adult ? 'את רוב השלבים כן. שלבים עם תנור, כיריים או מיקרוגל מסומנים — שם מבוגר עוזר.' : 'כן, עם השגחה של מבוגר בסביבה. אין במתכון אש או תנור.' }]
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${r.title} — מתכון קל לילדים`} description={`מתכון ${r.title} לילדים: ${r.ingredients.slice(0, 4).join(', ')}. ${r.time}, מגיל ${r.age}. שלבים פשוטים, עם סימון מתי מבוגר עוזר.`} path={`/food/kids-recipes/${r.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'מתכונים לילדים', href: '/food/kids-recipes' }, { label: r.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{r.emoji} </span>{r.title}</h1>
    <p className="text-center text-[var(--muted-foreground)] mb-6">גיל {r.age} · ⏱️ {r.time} · 🍽️ {r.serves} מנות · {r.kind}</p>
    <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
      <section className="fam-card"><h2 className="text-xl font-black mb-2">🛒 מה צריך</h2><ul className="space-y-1">{r.ingredients.map(i => <li key={i}>• {i}</li>)}</ul></section>
      <section className="fam-card"><h2 className="text-xl font-black mb-2">👣 איך מכינים</h2><ol className="fam-steps">{r.steps.map((s, i) => <li key={i} className={/מבוגר/.test(s) ? 'adult' : ''}>{s}</li>)}</ol></section>
    </div>
    {r.tip && <p className="fam-tip mt-4">💡 {r.tip}</p>}
    <div className="mt-6 text-center"><button type="button" data-print-main className="fam-roll" onClick={() => setPrinting(true)}>🖨️ להדפסת המתכון</button></div>
    {printing && <PrintPreview title={r.title} onClose={() => setPrinting(false)}>{card}</PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[`${r.title} הוא מתכון שמתאים לילדים מגיל ${r.age}. ההכנה לוקחת ${r.time}, והוא מספיק ל-${r.serves} מנות.`, 'שלבים שמסומנים בצבע הם שלבים שבהם מבוגר עוזר — תנור, כיריים, מיקרוגל או סכין חדה. את כל השאר הילדים יכולים לעשות בעצמם.']} faq={faq} related={[{ label: 'כל המתכונים', href: '/food/kids-recipes' }, { label: 'מדע במטבח', href: '/food/kitchen-science' }]} /></div>
  </div>
}

// ── /food/kitchen-science ───────────────────────────────
export function KitchenScience() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="ניסויים לילדים בבית — מדע במטבח עם הסבר" description={`${EXPERIMENTS.length} ניסויים מדעיים לילדים עם חומרים מהמטבח: הר געש מסודה וחומץ, כרוב סגול שמשנה צבע, ביצה שצפה, קשת בחלב ועוד — עם הסבר פשוט למה זה קורה.`} path="/food/kitchen-science" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'מדע במטבח' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🧪 </span>מדע במטבח</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">ניסויים עם מה שיש בבית — וכל ניסוי עם הסבר "למה זה קורה"</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{EXPERIMENTS.map(x => <Link key={x.slug} to={`/food/kitchen-science/${x.slug}`} className="fam-card card-lift"><div className="text-4xl" aria-hidden="true">{x.emoji}</div><h2 className="text-xl font-bold">{x.title}</h2><small>גיל {x.age}{x.adult ? ' · 👩 עם מבוגר' : ''}</small></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['ניסויים במטבח הם הדרך הכי טובה להראות לילדים שמדע זה לא רק בספרים: חומץ וסודה לשתייה יוצרים גז, כרוב סגול מגלה מה חומצי ומה בסיסי, ומים מטפסים לבד בתוך נייר.', 'כל הניסויים כאן בטוחים ונעשים עם חומרים פשוטים מהמטבח. בכל ניסוי יש רשימת חומרים, שלבים קצרים והסבר מדעי בשפה של ילדים. ניסויים עם מים חמים או חום מסומנים כניסויים עם מבוגר.']} related={[{ label: 'מתכונים לילדים', href: '/food/kids-recipes' }, { label: 'משחקים לכיתה', href: '/games/classroom' }]} /></div>
  </div>
}
export function Experiment() {
  const { slug } = useParams()
  const x = EXPERIMENTS.find(e => e.slug === slug)
  if (!x) return <NotFound />
  const faq = [{ q: `למה זה קורה ב${x.title}?`, a: x.why }, { q: 'הניסוי בטוח?', a: x.adult ? 'כן, כשמבוגר עושה את השלב עם המים החמים או החום.' : 'כן, הוא נעשה עם חומרים רגילים מהמטבח. כמו בכל ניסוי — לא טועמים ושוטפים ידיים בסוף.' }]
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${x.title} — ניסוי לילדים עם הסבר`} description={`ניסוי ${x.title} לילדים: חומרים מהמטבח, שלבים פשוטים והסבר מדעי למה זה קורה. מתאים מגיל ${x.age}.`} path={`/food/kitchen-science/${x.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'מדע במטבח', href: '/food/kitchen-science' }, { label: x.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{x.emoji} </span>{x.title}</h1>
    <p className="text-center text-[var(--muted-foreground)] mb-6">ניסוי לילדים מגיל {x.age}{x.adult ? ' · 👩 עם מבוגר' : ''}</p>
    <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
      <section className="fam-card"><h2 className="text-xl font-black mb-2">🧰 מה צריך</h2><ul className="space-y-1">{x.materials.map(i => <li key={i}>• {i}</li>)}</ul></section>
      <section className="fam-card"><h2 className="text-xl font-black mb-2">👣 מה עושים</h2><ol className="fam-steps">{x.steps.map((s, i) => <li key={i} className={/מבוגר/.test(s) ? 'adult' : ''}>{s}</li>)}</ol></section>
    </div>
    <section className="fam-card mt-5 fam-why"><h2 className="text-xl font-black mb-1">🤔 למה זה קורה?</h2><p className="text-lg">{x.why}</p></section>
    <div className="mt-10"><SeoBody paragraphs={[`${x.title} הוא ניסוי קצר שאפשר לעשות בבית או בכיתה עם חומרים פשוטים. לפני שמתחילים, כדאי לבקש מהילדים לנחש מה יקרה — ואחרי הניסוי לבדוק אם צדקו. כך לומדים לחשוב כמו מדענים.`, 'כמו בכל ניסוי: עובדים על משטח שאפשר ללכלך, לא טועמים את החומרים ושוטפים ידיים בסוף.']} faq={faq} related={[{ label: 'כל הניסויים', href: '/food/kitchen-science' }, { label: 'מתכונים לילדים', href: '/food/kids-recipes' }]} /></div>
  </div>
}

// ── /printables/lunchbox-notes ───────────────────────────────
const NOTES = {
  love: ['אוהבים אותך עד הירח וחזרה', 'את/ה הכי מיוחד/ת שיש', 'שיהיה לך יום מעולה!', 'אני גאה בך', 'מחכה לשמוע איך היה', 'חיבוק גדול מהבית', 'את/ה אמיץ/ה וחכם/ה', 'תהנה/י בהפסקה!', 'גם כשקשה — את/ה מצליח/ה', 'נתראה אחרי הצהריים', 'שולחים לך נשיקה', 'את/ה מאיר/ה לי את היום'],
  jokes: ['למה הספר היה עצוב? כי היו לו הרבה בעיות', 'מה אומר אפס לשמונה? איזו חגורה יפה!', 'למה העגבנייה הסמיקה? כי ראתה את הסלט מתלבש', 'איך קוראים לדינוזאור שישן? דינו-נוחר', 'למה המחשב הלך לרופא? כי היה לו וירוס', 'מה השעון אמר לשעון? יש לך זמן?', 'למה הפרה לא משחקת כדורגל? כי היא תמיד בועטת בדלי', 'מה אומרת הדבורה כשהיא שמחה? זזזה כיף!', 'למה העיפרון שמח? כי היה לו חוד מצויין', 'מה אמר הירח לשמש? את מאירה לי את הלילה', 'מה הצבע של הרוח? שקוף', 'למה הציפור לא הולכת לבית ספר? כי היא כבר יודעת לעוף'],
  goals: ['היום אני מנסה משהו חדש', 'אומר/ת תודה למישהו', 'שואל/ת שאלה בשיעור', 'משחק/ת עם מישהו חדש בהפסקה', 'שותה מים!', 'אוכל/ת קודם את הירק', 'עוזר/ת לחבר/ה', 'מחייך/ת לפחות 5 פעמים', 'מספר/ת לי דבר אחד שלמדתי', 'מתאמץ/ת גם כשקשה', 'משאיר/ה את הקופסה ריקה 😉', 'כותב/ת יפה במחברת'],
}
export function LunchboxNotes() {
  const [set, setSet] = useState('love')
  const [name, setName] = useState('')
  const msgs = NOTES[set]
  const COLORS = ['#ffe8ee', '#fff6cf', '#e3f1ff', '#e6f8e4']
  const svg = <svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="פתקים לקופסת האוכל" fontFamily="Heebo, Arial, sans-serif">
    <rect width="200" height="270" fill="#fff" />
    {msgs.map((m, i) => { const col = i % 3, row = Math.floor(i / 3), x = 136 - col * 62, y = 6 + row * 64, words = m.split(' '), lines = []; let cur = ''
      for (const w of words) { if ((cur + ' ' + w).trim().length > 13) { lines.push(cur); cur = w } else cur = (cur + ' ' + w).trim() } lines.push(cur)
      return <g key={i}><rect x={x} y={y} width={58} height={60} rx={6} fill={COLORS[i % 4]} stroke="#999" strokeWidth={0.4} strokeDasharray="2 1.5" />
        {name && <text x={x + 29} y={y + 11} fontSize={5} fontWeight={700} textAnchor="middle" direction="rtl" fill="#555">{name},</text>}
        {lines.map((l, j) => <text key={j} x={x + 29} y={y + 32 - (lines.length - 1) * 4.2 + j * 8.4} fontSize={6.3} fontWeight={700} textAnchor="middle" direction="rtl" fill="#1d2233">{l}</text>)}
        <circle cx={x + 29} cy={y + 53} r={2.2} fill={['#ff8fab', '#ffd23f', '#6cb8ff', '#7dd87a'][i % 4]} /></g> })}
  </svg>
  const [printing, setPrinting] = useState(false)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="פתקים לקופסת האוכל — להדפסה ולגזירה" description="פתקים קטנים לקופסת ארוחת העשר: מילים חמות, בדיחות לילדים ומשימות קטנות ליום. 12 פתקים בדף, עם שם הילד. מדפיסים, גוזרים ומפתיעים." path="/printables/lunchbox-notes" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: 'פתקים לקופסה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">💌 </span>פתקים לקופסת האוכל</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">12 פתקים בדף — גוזרים ושמים אחד בכל בוקר</p>
    <div className="mb-5 flex flex-wrap justify-center gap-2">{[['love', '💛 מילים חמות'], ['jokes', '😂 בדיחות'], ['goals', '⭐ משימה ליום']].map(([k, l]) => <Toggle key={k} on={set === k} onClick={() => setSet(k)}>{l}</Toggle>)}
      <input value={name} maxLength={12} onChange={e => setName(e.target.value)} placeholder="שם הילד/ה (לא חובה)" className="fam-input" /></div>
    <div className="mx-auto max-w-md border-2 border-[var(--border)] bg-white p-2">{svg}</div>
    <div className="mt-5 text-center"><button type="button" data-print-main className="fam-roll" onClick={() => setPrinting(true)}>🖨️ הדפסה או PDF</button></div>
    {printing && <PrintPreview title="פתקים לקופסת האוכל" onClose={() => setPrinting(false)}><article className="buga-a4"><div className="print-art">{svg}</div></article></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['פתק קטן בקופסת האוכל הופך הפסקה רגילה לרגע של חיוך. מדפיסים דף אחד, גוזרים לאורך הקווים המקווקווים, ושמים פתק אחר בכל בוקר — מספיק לשבועיים של בית ספר.', 'יש שלושה סוגים: מילים חמות מהבית, בדיחות לילדים לספר לחברים, ומשימה קטנה ליום — כמו "שואל/ת שאלה בשיעור" או "משחק/ת עם מישהו חדש". אפשר להוסיף את שם הילד בראש כל פתק.']} related={[{ label: 'ארוחת עשר', href: '/food/school-lunch' }, { label: 'בדיחות לילדים', href: '/jokes/topics' }]} /></div>
  </div>
}

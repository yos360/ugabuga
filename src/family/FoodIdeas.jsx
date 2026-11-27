import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { SNACKS, BREAKFASTS, AGE_GROUPS, ALLERGEN_LABELS, filterIdeas, weeklyPlan } from '../data/foodIdeas'
import './family.css'

const FOOD_CRUMB = { label: 'אוכל לילדים', href: '/food' }
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']

const PAGES = {
  snacks: {
    list: SNACKS, path: '/food/healthy-snacks', emoji: '🥕', crumb: 'חטיף בריא',
    h1: 'חטיף בריא לילדים', sub: 'רעיונות פשוטים לקופסת האוכל ולצהריים, לפי גיל, עם מתכון קצר ודף שבועי להדפסה',
    title: 'חטיף בריא לילדים — 20 רעיונות לקופסת אוכל, לפי גיל',
    description: '20 רעיונות לחטיף בריא לילדים: לקופסת אוכל, לגן ולבית, לפי גיל, עם מתכונים קצרים וכמויות. סינון לפי אלרגיות ודף רעיונות שבועי להדפסה.',
    lunchLabel: '🎒 מתאים לקופסת אוכל', sheet: 'חטיפים לשבוע', print: 'חטיפים בריאים לשבוע',
    faq: [
      { q: 'מה נחשב חטיף בריא לילדים?', a: 'חטיף שמבוסס על מזון פשוט שקרוב למקור: ירקות, פירות, יוגורט, גבינה, ביצה, דגנים מלאים וקטניות. כאן כל רעיון מוסבר במצרכים ובכמויות, כדי שאפשר יהיה לראות מה נכנס בו. זו הצעה כללית לבית, ולא ייעוץ תזונתי אישי.' },
      { q: 'איזה חטיף אפשר לשלוח לגן שאין בו בוטנים ואגוזים?', a: 'ברוב הרעיונות אין בוטנים או אגוזים. מסמנים "בלי אגוזים ובוטנים" בסינון, והרשימה תציג רק רעיונות שאין בהם. בכל מקרה בודקים תוויות על מוצרים מוכנים, ושואלים את הגן מה מותר.' },
      { q: 'מה אפשר לתת לילד בן שנתיים כחטיף?', a: 'בגיל הזה מתאימים חטיפים רכים: בננה, ירקות מבושלים, עוגיות בננה ושיבולת שועל, מאפינס קטנים וקרקר עם גבינה. מתחת לגיל 4 לא נותנים פופקורן, אגוזים שלמים, ענבים שלמים או גזר נא, ועומדים לידו בזמן האכילה.' },
      { q: 'איך שומרים על חטיפים טריים בקופסה?', a: 'שולחים חטיפים עם גבינה, ביצה או יוגורט עם שקית קירור, שומרים דברים פריכים בנפרד ממה שרטוב, וסוגרים את הקופסה היטב. מה שלא נאכל חוזר הביתה ולא נשמר ליום הבא.' },
    ],
    paragraphs: [
      'חטיף טוב בקופסה צריך להיות קל לאכילה, לא להתפורר בילקוט ולהישאר טעים גם אחרי כמה שעות. העמוד הזה אוסף 20 רעיונות כאלה, בין ירקות ופירות לבין מאפינסים, עוגיות ובצק בלי קמח.',
      'לכל רעיון יש גיל מתאים, זמן הכנה, מצרכים בכמויות ותיאור קצר של ההכנה, ולצידם סימון של אלרגנים. אפשר לסנן לפי גיל, לסנן אלרגנים, ולהציג רק חטיפים שמתאימים לקופסה.',
      'בסוף מתקבל דף רעיונות לשבוע: חמישה חטיפים, אחד לכל יום מראשון עד חמישי, עם המצרכים. מדפיסים אותו, תולים על המקרר ויוצאים לקניות.',
    ],
    related: [{ label: 'ארוחת בוקר לילדים', href: '/food/kids-breakfast' }, { label: 'ארוחת עשר לבית הספר', href: '/food/school-lunch' }, { label: 'תכנון ארוחת עשר לשבוע', href: '/food/lunch-planner' }, { label: 'מתכונים שילדים מכינים', href: '/food/kids-recipes' }],
  },
  breakfast: {
    list: BREAKFASTS, path: '/food/kids-breakfast', emoji: '🥣', crumb: 'ארוחת בוקר',
    h1: 'ארוחת בוקר לילדים', sub: '20 רעיונות לבקרים עמוסים ושקטים, לפי גיל, עם מתכון קצר ודף שבועי להדפסה',
    title: 'ארוחת בוקר לילדים — 20 רעיונות מהירים ומתכונים קצרים',
    description: '20 רעיונות לארוחת בוקר לילדים: מהירים, בריאים ופשוטים, לפי גיל, עם מתכונים קצרים וכמויות. סינון לפי אלרגיות ודף רעיונות שבועי להדפסה.',
    lunchLabel: '⏱️ מהיר או לדרך', sheet: 'ארוחות בוקר לשבוע', print: 'ארוחות בוקר לשבוע',
    faq: [
      { q: 'מה אפשר להכין לילדים לארוחת בוקר מהר?', a: 'קערת יוגורט ופירות, טוסט גבינה, קוטג׳ עם פירות, שייק בננה, ולחם עם אבוקדו או טחינה. כולם מוכנים תוך 3–8 דקות. בסינון אפשר לבחור "מהיר או לדרך".' },
      { q: 'איך מכינים ארוחת בוקר מראש לשבוע עמוס?', a: 'מכינים בערב שיבולת שועל שנשארת לילה במקרר, או אופים בסוף השבוע מאפינס ביצים ושיבולת שועל אפויה, ושומרים במקרר עד 3 ימים. בבוקר רק מחממים או אוכלים קר.' },
      { q: 'מה עושים כשילד לא רוצה לאכול בבוקר?', a: 'אפשר להתחיל במנה קטנה, להציע שתי אפשרויות לבחירה, או להגיש צלחת עם כמה דברים קטנים שבוחרים מהם. אם זו בעיה שחוזרת על עצמה, כדאי לדבר עם רופא הילדים.' },
      { q: 'האם יש ארוחות בוקר בלי חלב או בלי ביצים?', a: 'כן. בסינון אפשר לבחור "בלי חלב" או "בלי ביצה", וגם "ללא גלוטן". ברוב המקרים אפשר להחליף חלב במשקה צמחי לא ממותק, ולבדוק את התווית.' },
    ],
    paragraphs: [
      'בבוקר אין זמן. לכן בחרנו ארוחות בוקר שמוכנות בדקות ספורות, כאלה שאפשר להכין מראש בערב או בסוף השבוע, וכאלה שהילדים יכולים להכין בעצמם בצורה בטוחה.',
      'לכל רעיון יש מצרכים בכמויות, כמה צעדים קצרים וסימון של אלרגנים. אפשר לסנן לפי גיל ולהסיר רעיונות עם חלב, ביצה, שומשום, אגוזים או גלוטן.',
      'בסוף מתקבל דף שבועי להדפסה, חמש ארוחות בוקר, אחת לכל יום מראשון עד חמישי, שמקל על התכנון והקנייה.',
    ],
    related: [{ label: 'חטיף בריא לילדים', href: '/food/healthy-snacks' }, { label: 'פנקייק — כל הגרסאות', href: '/food/pancakes' }, { label: 'ארוחת עשר לבית הספר', href: '/food/school-lunch' }, { label: 'מתכונים שילדים מכינים', href: '/food/kids-recipes' }],
  },
}

function Toggle({ on, onClick, children }) { return <button type="button" className="fam-chip" aria-pressed={on} onClick={onClick}>{children}</button> }

function IdeaCard({ x }) {
  const ages = AGE_GROUPS.filter(g => x.a.includes(g.id)).map(g => g.label).join(' · ')
  return <article className="fam-card">
    <h3 className="text-xl font-black"><span aria-hidden="true">{x.e} </span>{x.n}</h3>
    <div className="fam-badges">
      <span className="fam-badge">{ages}</span>
      <span className="fam-badge">⏱️ {x.m} דק׳</span>
      {x.al.map(a => <span key={a} className="fam-badge al">{ALLERGEN_LABELS[a]}</span>)}
    </div>
    <details className="mt-2">
      <summary className="cursor-pointer font-bold">מצרכים והכנה</summary>
      <h4 className="mt-2 font-black">מצרכים</h4>
      <ul>{x.ing.map(s => <li key={s}>• {s}</li>)}</ul>
      <h4 className="mt-2 font-black">הכנה</h4>
      <ol className="fam-steps">{x.st.map(s => <li key={s}>{s}</li>)}</ol>
    </details>
    <p className="fam-tip">💡 {x.tip}</p>
  </article>
}

function IdeasPage({ page }) {
  const P = PAGES[page]
  const [age, setAge] = useState('')
  const [lunchbox, setLunchbox] = useState(false)
  const [ex, setEx] = useState({ noNuts: false, noSesame: false, noEgg: false, noDairy: false, noGluten: false })
  const [offset, setOffset] = useState(0)
  const [name, setName] = useState('')
  const [printing, setPrinting] = useState(false)
  const flip = k => () => setEx(v => ({ ...v, [k]: !v[k] }))
  const list = useMemo(() => filterIdeas(P.list, { age, lunchbox, ...ex }), [P, age, lunchbox, ex])
  const plan = weeklyPlan(list, 5, offset)
  const sheet = <article className="buga-flow fam-print" dir="rtl">
    <h2>{P.sheet}{name ? ` — ${name}` : ''}</h2>
    <table><thead><tr><th>יום</th><th>הרעיון</th><th>מצרכים</th></tr></thead>
      <tbody>{plan.map((x, k) => <tr key={x.id}><td>{DAYS[k]}</td><td><b>{x.e} {x.n}</b></td><td>{x.ing.join(' · ')}</td></tr>)}</tbody></table>
    <h3>🛒 מה חסר? לרשום כאן</h3>
    <p>______________________________________________</p><p>______________________________________________</p>
    <p><small>עוגה בוגה · ugabuga.co.il · רעיונות כלליים בלבד, ולא ייעוץ תזונתי. בודקים תוויות ואלרגיות לפני ההגשה.</small></p>
  </article>

  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={P.title} description={P.description} path={P.path} structuredData={faqSchema(P.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, FOOD_CRUMB, { label: P.crumb }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{P.emoji} </span>{P.h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{P.sub}</p>

    <section className="no-print fam-filters" aria-label="סינון">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="גיל">
        <Toggle on={!age} onClick={() => setAge('')}>כל הגילים</Toggle>
        {AGE_GROUPS.map(g => <Toggle key={g.id} on={age === g.id} onClick={() => setAge(age === g.id ? '' : g.id)}>{g.label}</Toggle>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="התאמות">
        <Toggle on={lunchbox} onClick={() => setLunchbox(v => !v)}>{P.lunchLabel}</Toggle>
        <Toggle on={ex.noNuts} onClick={flip('noNuts')}>🥜 בלי אגוזים ובוטנים</Toggle>
        <Toggle on={ex.noSesame} onClick={flip('noSesame')}>בלי שומשום</Toggle>
        <Toggle on={ex.noEgg} onClick={flip('noEgg')}>בלי ביצה</Toggle>
        <Toggle on={ex.noDairy} onClick={flip('noDairy')}>בלי חלב</Toggle>
        <Toggle on={ex.noGluten} onClick={flip('noGluten')}>ללא גלוטן</Toggle>
      </div>
    </section>

    <aside className="fam-tip" aria-label="בטיחות">
      🛡️ לילדים מתחת לגיל 4: לא נותנים פופקורן, אגוזים שלמים, ענבים שלמים וגזר נא, חותכים אוכל קטן ויושבים עם הילד בזמן האכילה. הרעיונות כאן כלליים, ואינם תחליף לייעוץ של רופא או דיאטנית.
    </aside>

    <h2 className="mt-6 mb-3 text-2xl font-black">{list.length} רעיונות{age ? ` ל${AGE_GROUPS.find(g => g.id === age).label}` : ''}</h2>
    {list.length ? <div className="grid gap-4 sm:grid-cols-2">{list.map(x => <IdeaCard key={x.id} x={x} />)}</div>
      : <p className="text-center font-bold">אין רעיון שמתאים לכל הסינונים. אפשר להוריד סינון אחד.</p>}

    <section className="fam-card mt-8" aria-labelledby="week-sheet">
      <h2 id="week-sheet" className="text-2xl font-black">🗓️ דף רעיונות לשבוע להדפסה</h2>
      <p className="mt-1">חמישה רעיונות, אחד לכל יום, לפי הסינון שבחרתם.</p>
      <ol className="fam-steps">{plan.map((x, k) => <li key={x.id}><b>{DAYS[k]}:</b> {x.e} {x.n}</li>)}</ol>
      <div className="no-print mt-3 flex flex-wrap items-center justify-center gap-2">
        <input value={name} maxLength={16} onChange={e => setName(e.target.value)} placeholder="שם הילד/ה (לא חובה)" className="fam-input" aria-label="שם לדף" />
        <button type="button" className="fam-roll small" onClick={() => setOffset(o => o + 5)} disabled={!list.length}>🎲 שבוע אחר</button>
        <button type="button" data-print-main className="fam-roll small" onClick={() => setPrinting(true)} disabled={!list.length}>🖨️ הדפסה או PDF</button>
      </div>
    </section>
    {printing && <PrintPreview title={P.print} onClose={() => setPrinting(false)}>{sheet}</PrintPreview>}

    <div className="mt-6 flex flex-wrap justify-center gap-2 no-print">
      {P.related.slice(0, 3).map(r => <Link key={r.href} className="fam-chip" to={r.href}>{r.label} ←</Link>)}
    </div>

    <div className="mt-12"><SeoBody paragraphs={P.paragraphs} faq={P.faq} related={P.related} /></div>
  </div>
}

export const HealthySnacks = () => <IdeasPage page="snacks" />
export const KidsBreakfast = () => <IdeasPage page="breakfast" />

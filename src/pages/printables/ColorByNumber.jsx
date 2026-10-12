import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { isPreviousPage } from '../../utils/navMemory'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { CBN_PICTURES, CBN_LEVELS, CBN_THEMES, cbnBySlug, cbnLevel, cbnSize, cbnLegend, cbnGrid, cbnPath, cbnInTheme } from '../../data/colorByNumber'
import { CbnSvg, Legend, sheetsFor, PictureCard, cellKey as key } from './cbnShared'

// /printables/color-by-number — pixel pictures to color by number (or by exercise), each with
// its own indexable page, print sheets with a solution page, and online coloring by tapping cells.
// The same pictures feed /printables/color-by-answer and /printables/color-by-letter.

const HUB = '/printables/color-by-number'
const COUNT = CBN_PICTURES.length

// holiday pictures link back to their holiday hub
const CBN_HOLIDAY_LINKS = {
  'rosh-hashana': { href: '/holidays/rosh-hashana', label: '🍎 עוד פעילויות לראש השנה' },
  sukkot: { href: '/holidays/sukkot', label: '🌿 עוד פעילויות לסוכות' },
  hanukkah: { href: '/holidays/hanukkah', label: '🕎 עוד פעילויות לחנוכה' },
  purim: { href: '/holidays/purim', label: '🎭 עוד פעילויות לפורים' },
  pesach: { href: '/holidays/pesach', label: '🫓 עוד פעילויות לפסח' },
  shavuot: { href: '/holidays/shavuot', label: '🌾 עוד פעילויות לשבועות' },
  'yom-haatzmaut': { href: '/holidays/yom-haatzmaut', label: '🇮🇱 עוד פעילויות ליום העצמאות' },
  'tu-bishvat': { href: '/holidays/tu-bishvat', label: '🌳 עוד פעילויות לט״ו בשבט' },
}

const HUB_FAQ = [
  { q: 'מה זה דף צביעה לפי מספרים?', a: 'דף עם משבצות, ובכל משבצת מספר. בראש הדף יש מקרא שאומר איזה צבע מתאים לכל מספר. צובעים משבצת אחרי משבצת — ובסוף מתגלה ציור שלם. זה תרגול של זיהוי מספרים, ריכוז ומוטוריקה עדינה.' },
  { q: 'איזו רמה מתאימה לאיזה גיל?', a: 'גן — ציורים קטנים עם 3–4 צבעים ומשבצות גדולות. כיתות א–ב — ציורים בינוניים עם עד 8 צבעים. ילדים גדולים ומבוגרים — ציורים גדולים ומפורטים עם 6–10 צבעים, שמתאימים גם לצביעה מרגיעה של מבוגרים.' },
  { q: 'מה ההבדל בין גרסת המספרים לגרסת התרגילים?', a: 'בגרסת התרגילים יש בכל משבצת תרגיל במקום מספר: חיבור עד 10 בגן, חיבור עד 20 בכיתות א–ב ולוח הכפל לגדולים. פותרים את התרגיל ומחפשים את התשובה במקרא. כל תשובה שייכת לצבע אחד בלבד, כך שאי אפשר להתבלבל.' },
  { q: 'יש דף פתרון?', a: 'כן. לכל ציור יש דף פתרון צבעוני — מסמנים "להדפיס גם דף פתרון" לפני ההדפסה. בדף של כל ציור אפשר גם לצבוע אונליין ולראות את הפתרון על המסך.' },
  { q: 'אפשר לצבוע לפי אותיות או לפי תרגילי חיסור?', a: 'כן. את אותם ציורים אפשר להדפיס גם בדפי צביעה לפי תשובות — חיבור וחיסור עד 10 ועד 20, לוח הכפל וחילוק — ובדפי צביעה לפי אותיות בעברית ובאנגלית, בשלוש רמות קושי.' },
  { q: 'הדפים בחינם?', a: 'כן, כל הדפים חינמיים לשימוש בבית, בגן ובכיתה, בלי הרשמה. אפשר להדפיס כמה פעמים שרוצים — התרגילים זהים בכל הדפסה, כך שכל הכיתה מקבלת את אותו הדף.' },
]

// other ways to color the same pictures — shown on the hub and on every picture page
export const CBN_MORE_WAYS = [
  { href: '/printables/color-by-answer', emoji: '🧮', title: 'צביעה לפי תשובות', desc: 'חיבור, חיסור, כפל וחילוק — כל תשובה היא צבע' },
  { href: '/printables/color-by-letter', emoji: 'א', title: 'צביעה לפי אותיות', desc: 'אותיות שונות, אותיות דומות ואותיות סופיות' },
  { href: '/printables/color-by-letter/english', emoji: 'A', title: 'צביעה לפי אותיות באנגלית', desc: 'אותיות גדולות, קטנות והתאמה ביניהן' },
]
function MoreWays({ p }) {
  return <section className="no-print mt-10" aria-labelledby="cbn-more-ways">
    <h2 id="cbn-more-ways" className="mb-4 text-center text-2xl font-black">{p ? `עוד דרכים לצבוע את ה${p.name}` : 'אותם ציורים — עוד דרכים לצבוע'}</h2>
    <div className="grid gap-3 sm:grid-cols-3">{CBN_MORE_WAYS.map(w => <Link key={w.href} to={p ? `${w.href}?p=${p.slug}` : w.href} className="wobbly flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-transform hover:-translate-y-1">
      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[var(--postit)] text-2xl font-black" aria-hidden="true">{w.emoji}</span>
      <span><b className="block text-lg">{w.title}</b><small className="text-[var(--muted-foreground)]">{w.desc}</small></span>
    </Link>)}</div>
  </section>
}

export default function ColorByNumberHub() {
  const [params, setParams] = useSearchParams()
  const level = cbnLevel(params.get('level'))
  const theme = CBN_THEMES.find(t => t.id === params.get('theme'))
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(false)
  const list = CBN_PICTURES.filter(p => (!level || p.level === level.id) && (!theme || cbnInTheme(p, theme.id)))
  const pick = (name, id, current) => {
    const next = new URLSearchParams(params)
    if (!id || current === id) next.delete(name); else next.set(name, id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const chip = on => `min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${on ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`צביעה לפי מספרים להדפסה — ${COUNT} דפים לילדים ולמבוגרים`} description={`דפי צביעה לפי מספרים להדפסה בחינם: ${COUNT} ציורים מקוריים בשלוש רמות — גן, כיתות א–ב ומבוגרים, עם בעלי חיים, כלי תחבורה, אוכל, ים, חלל ודפים לכל החגים. לכל ציור גרסת תרגילי חשבון, דף פתרון וצביעה אונליין.`} path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי מספרים' }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">{COUNT} ציורים · מספרים או תרגילים · עם פתרון · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🎨 </span>צביעה לפי מספרים להדפסה</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">בוחרים ציור, מדפיסים, וצובעים כל משבצת בצבע של המספר שלה. לכל ציור יש גם גרסה עם תרגילי חיבור או כפל, ודף פתרון צבעוני.</p>
    </header>
    <nav aria-label="סינון לפי רמה" className="no-print mt-6 flex flex-wrap justify-center gap-2">
      {[{ id: '', label: 'כל הרמות' }, ...CBN_LEVELS].map(l => <button key={l.id || 'all'} type="button" aria-pressed={(level?.id || '') === l.id} onClick={() => pick('level', l.id, level?.id)} className={chip((level?.id || '') === l.id)}>{l.label}</button>)}
    </nav>
    <nav aria-label="סינון לפי נושא" className="no-print mt-2 flex flex-wrap justify-center gap-2">
      {[{ id: '', label: 'כל הנושאים' }, ...CBN_THEMES].map(t => <button key={t.id || 'all'} type="button" aria-pressed={(theme?.id || '') === t.id} onClick={() => pick('theme', t.id, theme?.id)} className={chip((theme?.id || '') === t.id)}>{t.label}</button>)}
    </nav>
    {(level || theme) && <p className="no-print mt-3 text-center text-[var(--muted-foreground)]" role="status">{list.length} ציורים{level ? ` ${level.long} · בגרסת התרגילים: ${level.mathLabel}` : ''}</p>}
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main disabled={!list.length} onClick={() => setPrinting(list)} className="min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white disabled:opacity-50">🖨️ הדפסת כל {list.length} הדפים</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolution} onChange={e => setWithSolution(e.target.checked)} className="h-5 w-5" />להדפיס גם דף פתרון</label>
    </div>
    {list.length ? <section className="no-print mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{list.map(p => <PictureCard key={p.slug} p={p} />)}</section>
      : <p className="no-print mt-6 text-center font-bold">אין עדיין ציורים בנושא הזה ברמה הזאת — נסו רמה אחרת.</p>}
    <MoreWays />
    {printing && <PrintPreview title={level ? `צביעה לפי מספרים — ${level.label}` : 'צביעה לפי מספרים'} onClose={() => setPrinting(null)}>{sheetsFor(printing, ['numbers'], withSolution)}</PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[
      'צביעה לפי מספרים היא פעילות שקטה שילדים חוזרים אליה שוב ושוב: יש בה משימה ברורה, התקדמות שרואים בעיניים והפתעה בסוף — הציור מתגלה רק כשהמשבצות נצבעות. בדרך מתרגלים זיהוי מספרים, התאמה למקרא, ריכוז ושליטה בעיפרון.',
      `כל ${COUNT} הציורים בעמוד מקוריים ובנויים ממשבצות, כמו פסיפס: לגן — תפוח, דג, חתול, שמש, תות, צפרדע ולוויתן עם 3–5 צבעים; לכיתות א–ב — מכונית, אוטובוס, רכבת, מטוס, תמנון, כלב ופיצה; ולגדולים ולמבוגרים — כדור פורח, מגדלור, אריה, שועל, טירה ושונית אלמוגים, עם יותר משבצות ויותר צבעים.`,
      'יש ציורים לכל החגים: רימון, דבורה וצנצנת דבש לראש השנה, סוכה ואתרוג לסוכות, סביבון, חנוכייה, סופגנייה וכד שמן לחנוכה, מסכה ואוזן המן לפורים, גביע קידוש וצפרדע לפסח, גבינה וטרקטור לשבועות, ודגל ישראל וזיקוקים ליום העצמאות.',
      'לכל ציור יש גם גרסת תרגילים: במקום מספר, בכל משבצת מחכה תרגיל — חיבור עד 10 לגן, חיבור עד 20 לכיתות א–ב ולוח הכפל לגדולים. ומי שרוצה לתרגל משהו אחר יכול לצבוע את אותם ציורים לפי תשובות של חיסור וחילוק, או לפי אותיות בעברית ובאנגלית.',
    ]} faq={HUB_FAQ} related={[{ label: 'צביעה לפי תשובות — חיבור, חיסור, כפל וחילוק', href: '/printables/color-by-answer' }, { label: 'צביעה לפי אותיות', href: '/printables/color-by-letter' }, { label: 'צבעו לפי מספר — פסיפס חדש בכל לחיצה', href: '/printables/activity/color-by-number' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'מנדלות', href: '/printables/mandalas' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'לוח הכפל', href: '/printables/math-worksheets/multiplication' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

function pictureFaq(p) {
  const level = cbnLevel(p.level), { cols, rows } = cbnSize(p)
  const mathHow = { add10: 'תרגיל חיבור קטן, עד 10', add20: 'תרגיל חיבור עד 20', mult: 'תרגיל מלוח הכפל' }[level.math]
  return [
    { q: `לאיזה גיל מתאים דף הצביעה „${p.name}”?`, a: `הדף מתאים ${level.long}: ${cols}×${rows} משבצות ו-${p.colors.length} צבעים. ${p.level === 'gan' ? 'המשבצות גדולות והמספרים מעטים, כך שגם ילדים שרק לומדים לזהות מספרים מצליחים לבד.' : p.level === 'adults' ? 'יש הרבה משבצות ופרטים קטנים — מתאים לצבעי עיפרון מחודדים ולשעה של צביעה רגועה.' : 'יש מספיק פרטים כדי שיהיה מעניין, ועדיין אפשר לסיים בישיבה אחת.'}` },
    { q: 'איך עובדת גרסת התרגילים?', a: `בכל משבצת יש ${mathHow}. פותרים, מחפשים את התשובה במקרא וצובעים בצבע שלה. לכל צבע יש תשובה אחת משלו, ואין שני צבעים עם אותה תשובה — אז אין התלבטויות.` },
    { q: 'אפשר לצבוע אונליין?', a: 'כן. בוחרים צבע במקרא ולוחצים על המשבצות (במחשב אפשר גם לגרור עם העכבר). המונה מראה כמה משבצות נצבעו נכון, וכפתור "הצגת הפתרון" מראה את הציור המלא.' },
    { q: 'יש דף פתרון?', a: 'כן. לפני ההדפסה מסמנים "להדפיס גם דף פתרון", ואחרי דף הצביעה יודפס הציור הצבוע — נוח להורים ולמורים לבדיקה.' },
  ]
}

export function ColorByNumberPicture() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const p = cbnBySlug(slug)
  const [mode, setMode] = useState('numbers')
  const [active, setActive] = useState(1)
  const [fills, setFills] = useState({})
  const [reveal, setReveal] = useState(false)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const grid = useMemo(() => (p ? cbnGrid(p) : []), [p])
  if (!p) return <NotFound />
  const level = cbnLevel(p.level), { cols, rows } = cbnSize(p)
  const total = grid.flat().filter(n => n > 0).length
  const correct = Object.entries(fills).filter(([k, n]) => { const [r, c] = k.split('-').map(Number); return grid[r][c] === n }).length
  const paint = (r, c) => setFills(f => (f[key(r, c)] === active ? f : { ...f, [key(r, c)]: active }))
  const faq = pictureFaq(p)
  // same level: pictures of the same theme/holiday first, then the rest — 8 cards at most
  const kin = x => (p.holiday && x.holiday === p.holiday) || (p.theme && x.theme === p.theme)
  const same = CBN_PICTURES.filter(x => x.level === p.level && x.slug !== p.slug).sort((a, b) => kin(b) - kin(a)).slice(0, 8)
  const others = CBN_PICTURES.filter(x => x.level !== p.level && kin(x)).concat(CBN_PICTURES.filter(x => x.level !== p.level && !kin(x))).slice(0, 4)
  const holiday = p.holiday && CBN_HOLIDAY_LINKS[p.holiday]
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`צביעה לפי מספרים: ${p.name} — דף להדפסה עם פתרון`} description={`דף צביעה לפי מספרים של ${p.name} להדפסה בחינם, ${level.long}: ${cols}×${rows} משבצות ו-${p.colors.length} צבעים. יש גם גרסת ${level.mathLabel}, דף פתרון וצביעה אונליין.`} path={cbnPath(p)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי מספרים', href: HUB }, { label: p.name }]} />
    <header className="text-center">
      <span className={`inline-flex rounded-full px-4 py-2 font-bold ${level.badge}`}>{level.label} · {cols}×{rows} משבצות · {p.colors.length} צבעים</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{p.emoji} </span>צביעה לפי מספרים: {p.name}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{p.blurb}</p>
    </header>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(['numbers'])} className="min-h-[52px] rounded-xl bg-red-500 px-5 py-3 text-lg font-bold text-white">🖨️ הדפסה — מספרים</button>
      <button type="button" onClick={() => setPrinting(['math'])} className="min-h-[52px] rounded-xl bg-violet-600 px-5 py-3 text-lg font-bold text-white">🖨️ הדפסה — {level.mathLabel}</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolution} onChange={e => setWithSolution(e.target.checked)} className="h-5 w-5" />להדפיס גם דף פתרון</label>
    </div>
    <section className="no-print cbn-play mt-6" aria-label="צביעה אונליין">
      <div className="cbn-tabs" role="group" aria-label="סוג הדף">
        <button type="button" aria-pressed={mode === 'numbers'} onClick={() => setMode('numbers')}>🔢 מספרים</button>
        <button type="button" aria-pressed={mode === 'math'} onClick={() => setMode('math')}>➕ {level.mathLabel}</button>
      </div>
      <p className="cbn-hint">בוחרים צבע במקרא ולוחצים על המשבצות כדי לצבוע אונליין.</p>
      <Legend p={p} mode={mode} active={active} onPick={setActive} />
      <div className="cbn-board wobbly-md">
        <CbnSvg p={p} mode={reveal ? 'solution' : mode} fills={fills} onPaint={reveal ? null : paint} label={`${p.name} — צביעה ${mode === 'math' ? 'לפי תרגילים' : 'לפי מספרים'}`} />
      </div>
      <div className="cbn-tools">
        <span role="status">{correct === total ? '🎉 כל הכבוד! הציור הושלם' : `נצבעו נכון ${correct} מתוך ${total} משבצות`}</span>
        <button type="button" onClick={() => setReveal(v => !v)}>{reveal ? '🙈 הסתרת הפתרון' : '👀 הצגת הפתרון'}</button>
        <button type="button" onClick={() => { setFills({}); setReveal(false) }}>🧽 ניקוי</button>
      </div>
    </section>
    {printing && <PrintPreview title={`צביעה לפי מספרים: ${p.name}`} onClose={() => setPrinting(null)}>{sheetsFor([p], printing, withSolution)}</PrintPreview>}
    <MoreWays p={p} />
    {holiday && <p className="no-print mt-4 text-center text-lg"><Link to={holiday.href} className="font-bold underline">{holiday.label}</Link></p>}
    {same.length > 0 && <section className="no-print mt-10">
      <h2 className="mb-4 text-center text-3xl font-black">עוד ציורים {level.long}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{same.map(x => <PictureCard key={x.slug} p={x} />)}</div>
    </section>}
    <section className="no-print mt-8">
      <h2 className="mb-4 text-center text-2xl font-black">ציורים ברמות אחרות</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{others.map(x => <PictureCard key={x.slug} p={x} />)}</div>
      <p className="mt-4 text-center"><Link to={HUB} onClick={e => { if (isPreviousPage(HUB)) { e.preventDefault(); navigate(-1) } }} className="font-bold underline">לכל {COUNT} הציורים לצביעה לפי מספרים</Link></p>
    </section>
    <div className="mt-8"><SeoBody paragraphs={[
      `${p.blurb} הציור בנוי מ-${total} משבצות על רשת של ${cols}×${rows}, ובכל משבצת מספר שמתאים לאחד מ-${p.colors.length} הצבעים במקרא: ${cbnLegend(p).map(l => `${l.num} — ${l.name}`).join(', ')}.`,
      `בגרסת התרגילים כל משבצת מקבלת ${level.math === 'mult' ? 'תרגיל מלוח הכפל' : level.math === 'add20' ? 'תרגיל חיבור עד 20' : 'תרגיל חיבור עד 10'}, והמקרא מראה איזו תשובה שייכת לאיזה צבע. כך הציור מתגלה רק למי שפותר נכון — ותרגול החשבון הופך למשחק.`,
      'מדפיסים על דף A4, בצבעי עיפרון או בטושים דקים. משבצות לבנות במקרא משאירים בלי צבע. בתחתית הדף יש קוד QR שמחזיר לעמוד הזה, למי שירצה עוד ציורים.',
    ]} faq={faq} related={[{ label: 'כל דפי הצביעה לפי מספרים', href: HUB }, { label: 'דפי צביעה לפי נושא', href: '/printables/coloring' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

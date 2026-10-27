import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import NotFound from '../NotFound'
import { FAMILY_NAMES, NAME_CATEGORIES, ORIGINS, categoryBySlug, explainName, familyName, familyNamePath, namesIn } from '../../data/familyNames'

// /family-names — what Israeli family names mean: a hub with a "how was my name formed?" tool,
// one page per category (trades, kohanim, places…) and one page per name.
const HUB = { label: 'שמות משפחה', href: '/family-names' }
const card = 'rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4'
const requestHref = q => `/request?src=site&q=${encodeURIComponent(q)}`
const byAlef = list => [...list].sort((a, b) => a.name.localeCompare(b.name, 'he'))

function NameChip({ x }) {
  return <Link to={familyNamePath(x)} className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-3 font-bold hover:bg-[var(--postit)]">{x.name}{x.job ? <span className="ms-1 text-xs font-normal text-[var(--muted-foreground)]">· {x.job}</span> : null}</Link>
}

function AskMissing({ name }) {
  return <p className={`${card} mt-8 text-center`}>השם שלכם לא מופיע כאן? <Link to={requestHref(name ? `פירוש שם המשפחה ${name}` : 'פירוש שם המשפחה שלי: ')} className="font-bold underline">בקשו, ונוסיף אותו</Link> — אנחנו מוסיפים שמות כל שבוע, רק כשמקור השם ידוע.</p>
}

function Explainer() {
  const [q, setQ] = useState(''), r = explainName(q)
  return <section className={`${card} bg-[var(--postit)]`} aria-label="איך נוצר שם המשפחה שלי">
    <h2 className="text-2xl font-black">🔎 איך נוצר שם המשפחה שלי?</h2>
    <label className="mt-2 block font-bold">כתבו שם משפחה<input value={q} onChange={e => setQ(e.target.value)} placeholder="למשל: רבינוביץ׳, שניידר, טולדנו" className="mt-1 block w-full min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white p-3 font-normal" /></label>
    <div aria-live="polite" className="mt-3">
      {r?.exact && <p><b>{r.exact.name}:</b> {r.exact.meaning} <Link to={familyNamePath(r.exact)} className="font-bold underline">לעמוד השם ←</Link></p>}
      {r?.text && <p>{r.text} <Link to={NAME_CATEGORIES[r.cat].path} className="font-bold underline">עוד {NAME_CATEGORIES[r.cat].title} ←</Link><span className="mt-1 block text-sm text-[var(--muted-foreground)]">זה הסבר כללי לפי צורת השם, לא בדיקה של המשפחה שלכם. <Link to={requestHref(`פירוש שם המשפחה ${q.trim()}`)} className="underline">בקשו פירוש מדויק</Link></span></p>}
      {r?.none && <p>עוד אין לנו הסבר לשם הזה. <Link to={requestHref(`פירוש שם המשפחה ${q.trim()}`)} className="font-bold underline">בקשו, ונבדוק</Link></p>}
    </div>
  </section>
}

const HUB_FAQ = [
  { q: 'מהו שם המשפחה הנפוץ ביותר בישראל?', a: 'כהן. לפי הלשכה המרכזית לסטטיסטיקה (נתוני 2016) נושאים אותו יותר מ־180 אלף איש. אחריו: לוי, מזרחי, פרץ, ביטון, דהן, אברהם ופרידמן.' },
  { q: 'מתי ליהודים נהיו שמות משפחה?', a: 'בארצות האסלאם ובספרד היו שמות משפחה כבר בימי הביניים. באשכנז רוב היהודים קיבלו שם משפחה רק בסוף המאה ה־18 ובמאה ה־19, כשהשלטונות באוסטריה, בפרוסיה וברוסיה חייבו אותם לבחור אחד.' },
  { q: 'למה יש כל כך הרבה שמות עם ־ברג, ־שטיין ו־־מן?', a: 'אלה מילים בגרמנית: ברג = הר, שטיין = אבן, מן = איש. כשהיהודים נדרשו לבחור שמות, רבים בחרו צירופים יפים כמו רוזנברג (הר ורדים) או גולדשטיין (אבן זהב). אלה נקראים "שמות נוי".' },
]

export function FamilyNamesHub() {
  const top = FAMILY_NAMES.filter(x => x.top).sort((a, b) => a.top - b.top)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="שמות משפחה — פירוש ומקור של שמות משפחה בישראל" description={`מה פירוש שם המשפחה שלכם? ${FAMILY_NAMES.length} שמות משפחה עם מקור ופירוש: כהן ולוי, שמות לפי בעלי מקצוע (שניידר, שוסטר, חדד), שמות לפי מקומות, שמות נוי ושמות שעוברתו.`} path="/family-names" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: HUB.label }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🏷️ </span>שמות משפחה — פירוש ומקור</h1>
    <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg">כל שם משפחה מספר סיפור: מאיזו עיר הגיעה המשפחה, במה עבד הסבא־רבא, או מי היה אבי המשפחה. כאן תמצאו את הפירוש והמקור של שמות משפחה נפוצים בישראל.</p>
    <Explainer />
    <section className="mt-8"><h2 className="text-2xl font-black">לפי סוג השם</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(NAME_CATEGORIES).map(([k, c]) => <Link key={k} to={c.path} className={`${card} hover:-translate-y-0.5 transition-transform`}><span className="text-3xl" aria-hidden="true">{c.emoji}</span><b className="mt-1 block text-lg">{c.title}</b><small className="text-[var(--muted-foreground)]">{namesIn(k).length} שמות</small></Link>)}</div>
    </section>
    <section className="mt-8"><h2 className="text-2xl font-black">שמות המשפחה הנפוצים בישראל</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">לפי הלשכה המרכזית לסטטיסטיקה, נתוני 2016.</p>
      <ol className="mt-3 grid list-decimal gap-x-8 gap-y-2 pr-6 sm:grid-cols-2">{top.map(x => <li key={x.slug}><Link to={familyNamePath(x)} className="font-bold underline">{x.name}</Link></li>)}</ol>
    </section>
    <section className="mt-8"><h2 className="text-2xl font-black">כל השמות לפי א״ב</h2>
      <div className="mt-3 flex flex-wrap gap-2">{byAlef(FAMILY_NAMES).map(x => <NameChip key={x.slug} x={x} />)}</div>
    </section>
    <AskMissing />
    <div className="mt-10"><SeoBody paragraphs={[
      'שמות משפחה של יהודים נוצרו בדרכים רבות. בספרד ובארצות האסלאם הם נוצרו כבר בימי הביניים — לפי מקום (טולדנו), לפי מקצוע (חדד, הנפח) או לפי שם האב. באשכנז רוב היהודים קיבלו שם משפחה רק לפני כמאתיים שנה, בצו של השלטונות, ובחרו לפי מקצוע (שניידר, החייט), מקום (שפירא, מהעיר שפייר), שם האב (מנדלסון) או צירוף יפה בגרמנית (רוזנברג).',
      'כשקמה מדינת ישראל, רבים החליפו את שמם הלועזי בשם עברי: דוד גרין נעשה דוד בן־גוריון, ושמות כמו טל, ברק, אורן וגולן נעשו נפוצים. בכל עמוד שם כתוב מה ידוע על המקור שלו — וכשהמקור שנוי במחלוקת, כתוב גם את זה.',
    ]} faq={HUB_FAQ} related={[{ label: 'משמעות שמות לתינוקות', href: '/baby-names' }, { label: 'עבודת שורשים', href: '/printables/roots-project' }, { label: 'מבקשים פירוש לשם', href: '/request' }]} /></div>
  </div>
}

function CategoryPage({ k, c }) {
  const list = byAlef(namesIn(k))
  const faq = [
    { q: `אילו שמות משפחה הם ${c.title.replace('שמות ', '')}?`, a: list.slice(0, 8).map(x => x.name).join(', ') + ' ועוד.' },
    { q: 'איך יודעים מה מקור שם המשפחה שלי?', a: 'מתחילים מצורת השם — סיומות ומילים בגרמנית, ביידיש, בערבית או בעברית — ובודקים אותו מול תולדות המשפחה: מאיזו עיר וארץ הגיעה. שאלו את הסבים, ובדקו מסמכים ישנים.' },
  ]
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title={`${c.title} — פירוש ומקור`} description={`${c.title}: ${list.slice(0, 6).map(x => x.name).join(', ')} ועוד — מה כל שם אומר ומאיפה הוא הגיע.`} path={c.path} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: c.title }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">{c.emoji} </span>{c.title}</h1>
    <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg">{c.intro}</p>
    <ul className="space-y-3">{list.map(x => <li key={x.slug} className={card}><Link to={familyNamePath(x)} className="text-xl font-black underline">{x.name}</Link>{x.job && <span className="ms-2 rounded-full bg-[var(--postit)] px-2 py-0.5 text-sm font-bold">{x.job}</span>}<p className="mt-1">{x.meaning}</p></li>)}</ul>
    <AskMissing />
    <section className="mt-8"><h2 className="text-xl font-black">עוד סוגים של שמות</h2><div className="mt-2 flex flex-wrap gap-2">{Object.entries(NAME_CATEGORIES).filter(([o]) => o !== k).map(([o, oc]) => <Link key={o} to={oc.path} className="rounded-xl border-2 border-[var(--border)] px-3 py-2 font-bold">{oc.emoji} {oc.title}</Link>)}</div></section>
    <div className="mt-10"><SeoBody paragraphs={[c.intro]} faq={faq} related={[{ label: 'כל שמות המשפחה', href: '/family-names' }, { label: 'משמעות שמות לתינוקות', href: '/baby-names' }, { label: 'עבודת שורשים', href: '/printables/roots-project' }]} /></div>
  </div>
}

function NamePage({ x }) {
  const c = NAME_CATEGORIES[x.cat]
  const related = namesIn(x.cat).filter(o => o.slug !== x.slug).slice(0, 10)
  const facts = [['סוג השם', c.title], ['מוצא', ORIGINS[x.origin]], ['באנגלית', x.en], ...(x.job ? [['המקצוע', x.job]] : [])]
  const faq = [
    { q: `מה פירוש שם המשפחה ${x.name}?`, a: x.meaning },
    { q: `מאיפה מגיע שם המשפחה ${x.name}?`, a: `${ORIGINS[x.origin]}. ${c.title} — ${c.intro.split('. ')[0]}.` },
  ]
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title={`שם המשפחה ${x.name} — פירוש ומקור`} description={`מה פירוש שם המשפחה ${x.name}? ${x.meaning}`.slice(0, 200)} path={familyNamePath(x)} type="article" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: c.title, href: c.path }, { label: x.name }]} />
    <header className="text-center"><div className="text-6xl font-black">{x.name}</div><div className="mt-1 text-lg" lang="en">{x.en}</div><h1 className="mt-3 text-3xl sm:text-4xl">שם המשפחה {x.name} — פירוש ומקור</h1></header>
    <section className={`${card} mt-6 bg-[var(--postit)] text-center`} aria-label="הפירוש"><p className="m-0 text-xl leading-relaxed">{x.meaning}</p>
      {x.unsure && <p className="m-0 mt-3 text-sm">ℹ️ למקור השם הזה יש כמה הסברים, ואין הכרעה ביניהם. יודעים משהו על תולדות השם? <Link to={requestHref(`מידע על שם המשפחה ${x.name}: `)} className="underline">כתבו לנו</Link></p>}
    </section>
    <section className="mt-6"><h2 className="text-2xl font-black">{x.name} במבט מהיר</h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">{facts.map(([k, v]) => <div key={k} className={card}><dt className="text-sm text-[var(--muted-foreground)]">{k}</dt><dd className="m-0 font-bold">{k === 'סוג השם' ? <Link to={c.path} className="underline">{v}</Link> : v}</dd></div>)}</dl>
    </section>
    {related.length > 0 && <section className="mt-6"><h2 className="text-2xl font-black">עוד {c.title}</h2><div className="mt-3 flex flex-wrap gap-2">{related.map(o => <NameChip key={o.slug} x={o} />)}</div><Link to={c.path} className="mt-3 inline-block font-bold underline">לכל ה{c.title} ←</Link></section>}
    <AskMissing name={x.name} />
    <div className="mt-10"><SeoBody paragraphs={[c.intro]} faq={faq} related={[{ label: 'כל שמות המשפחה', href: '/family-names' }, { label: 'איך נוצר שם המשפחה שלי?', href: '/family-names' }, { label: 'עבודת שורשים', href: '/printables/roots-project' }]} /></div>
  </div>
}

export function FamilyNameRoute() {
  const { slug } = useParams()
  const cat = categoryBySlug(slug)
  if (cat) return <CategoryPage key={slug} k={cat[0]} c={cat[1]} />
  const x = familyName(slug)
  return x ? <NamePage key={x.slug} x={x} /> : <NotFound />
}

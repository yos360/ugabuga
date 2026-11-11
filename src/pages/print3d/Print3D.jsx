import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import SeoBody from '../../components/ui/SeoBody'
import { Header } from '../content/contentUi'
import { PRINT3D_BASE, PRINT3D_MODELS, print3dModel, NASA_MODELS, nasaFolderUrl } from '../../data/print3d'

// "הדפסת תלת־ממד לילדים": hub, one page per ready-made model, the name keychain maker, NASA space models.
const StlViewer = lazy(() => import('../../print3d/StlViewer'))
const CRUMBS = [{ label: 'ראשי', href: '/' }, { label: 'להדפסה', href: '/printables' }]
const HUB_CRUMB = { label: 'הדפסת תלת־ממד', href: PRINT3D_BASE }
const btn = 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-slate-800 px-5 text-lg font-bold'

const Viewer = props => (
  <Suspense fallback={<div className="h-[320px] rounded-2xl border-2 border-slate-800 bg-sky-50" />}>
    <StlViewer {...props} />
  </Suspense>
)

function Card({ to, emoji, title, text, img }) {
  return (
    <Link to={to} className="block h-full">
      <WobblyCard hover padding="p-4" className="h-full">
        {img ? <img src={img} alt="" width="480" height="480" loading="lazy" decoding="async" className="mb-2 aspect-square w-full rounded-xl object-cover" /> : <div className="text-5xl">{emoji}</div>}
        <h2 className="font-hand text-xl font-bold">{title}</h2>
        <p className="mt-1">{text}</p>
      </WobblyCard>
    </Link>
  )
}

const HUB_FAQ = [
  { q: 'מה זה קובץ STL?', a: 'קובץ STL הוא הצורה התלת־ממדית של הדגם. פותחים אותו בתוכנת חיתוך (Slicer) כמו Cura, PrusaSlicer או Bambu Studio, והיא מכינה ממנו את ההוראות למדפסת.' },
  { q: 'צריך מדפסת תלת־ממד בבית?', a: 'לא בהכרח. הרבה בתי ספר, ספריות ומרכזי מייקרים מחזיקים מדפסת, ויש גם שירותי הדפסה שמקבלים קובץ ומחזירים דגם מודפס.' },
  { q: 'זה בטוח לילדים?', a: 'ההדפסה עצמה היא עבודה של מבוגר: הפייה של המדפסת חמה מאוד. ילדים יכולים לבחור, לעצב ולצפות, ואחרי שהדגם מתקרר — לשחק, לצבוע ולהרכיב. חלקים קטנים לא מתאימים לפעוטות.' },
  { q: 'הקבצים באמת בחינם?', a: 'כן. את הדגמים שלנו עיצבנו בעצמנו, והם חינמיים לשימוש פרטי, לבית הספר ולגן. דגמי החלל הם של נאס״א, והם נחלת הכלל.' },
]

export function Print3DHub() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="הדפסת תלת־ממד לילדים — קבצי STL בחינם להורדה" description="קבצים חינמיים להדפסה בתלת־ממד: סביבון, חנוכייה, חותכן עוגיות, מחזיק מפתחות עם השם של הילד ודגמי חלל של נאס״א. עם תצוגה בתלת־ממד והוראות בעברית." path={PRINT3D_BASE} />
      <Breadcrumbs items={[...CRUMBS, { label: 'הדפסת תלת־ממד' }]} />
      <Header emoji="🖨️" title="הדפסת תלת־ממד לילדים" intro="קבצים חינמיים להורדה עם הוראות בעברית: רואים את הדגם מסתובב, מורידים ומדפיסים." />
      <h2 className="mb-3 mt-6 text-2xl font-bold">✨ מעצבים בעצמכם</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card to={`${PRINT3D_BASE}/name-keychain`} emoji="🔑" title="מחזיק מפתחות עם שם" text="כותבים שם בעברית, רואים אותו בתלת־ממד ומורידים קובץ להדפסה. יש גם שלט לדלת החדר." />
      </div>
      <h2 className="mb-3 mt-8 text-2xl font-bold">🕎 לחנוכה</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {PRINT3D_MODELS.map(m => <Card key={m.slug} to={`${PRINT3D_BASE}/${m.slug}`} emoji={m.emoji} title={m.title} text={m.desc} />)}
      </div>
      <h2 className="mb-3 mt-8 text-2xl font-bold">🚀 חלל</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card to={`${PRINT3D_BASE}/space`} emoji="🚀" title={`${NASA_MODELS.length} דגמי חלל של נאס״א`} text="רוברים של מאדים, הירח, טילים וטלסקופים — הקבצים המקוריים של נאס״א, עם הסבר בעברית." img="/3d/nasa/curiosity.webp" />
      </div>
      <div className="mt-10">
        <SeoBody paragraphs={[
          'מדפסת תלת־ממד בונה חפץ אמיתי שכבה אחרי שכבה, מחוט פלסטיק שנמס ומתקשה. כל מה שצריך זה קובץ — וכאן יש קבצים מוכנים, בחינם, שמתאימים לילדים, לגן ולכיתה.',
          'לכל דגם יש תצוגה בתלת־ממד שאפשר לסובב, קובץ STL להורדה, הגדרות הדפסה מומלצות והוראות בעברית. כל הדגמים שלנו מודפסים בלי תמיכות, כדי שגם מי שרק התחיל יצליח בהדפסה הראשונה.',
        ]} faq={HUB_FAQ} related={[{ href: '/learn/computers/concepts/3d-printer', label: 'מה זו מדפסת תלת־ממד' }, { href: '/holidays/hanukkah', label: 'חנוכה לילדים' }, { href: '/printables', label: 'דפים להדפסה' }, { href: '/origami', label: 'אוריגמי לילדים' }]} />
      </div>
    </div>
  )
}

// geometry code + the 3D font, loaded only on the pages that build models in the browser
function use3DLib() {
  const [lib, setLib] = useState(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let alive = true
    Promise.all([import('../../print3d/geometry'), fetch('/fonts/3d/noto-hebrew-800.typeface.json').then(r => r.json())])
      .then(([geo, json]) => alive && setLib({ geo, font: geo.makeFont(json) }))
      .catch(() => alive && setError(true))
    return () => { alive = false }
  }, [])
  return [lib, error]
}

function ModelPreview({ m }) {
  const [lib, error] = use3DLib()
  const geoms = useMemo(() => lib && lib.geo.previewModel(lib.font, m.model), [lib, m.model])
  if (error) return <Viewer url={`/3d/models/${m.model}.stl`} label={`${m.title} — תצוגה בתלת־ממד`} />
  if (!geoms) return <div className="h-[320px] rounded-2xl border-2 border-slate-800 bg-sky-50" />
  return <Viewer geometries={geoms} label={`${m.title} — תצוגה בתלת־ממד`} />
}

export function Print3DModelPage({ slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const m = print3dModel(slugProp || slugParam)
  if (!m) return null
  const others = PRINT3D_MODELS.filter(x => x !== m)
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={m.title} description={m.desc} path={`${PRINT3D_BASE}/${m.slug}`} />
      <Breadcrumbs items={[...CRUMBS, HUB_CRUMB, { label: m.title }]} />
      <Header emoji={m.emoji} title={m.h1} intro={m.desc} />
      <ModelPreview m={m} />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {m.files.map(f => <a key={f.file} href={`/3d/models/${f.file}`} download className={`${btn} bg-[var(--postit,#fff3a8)]`}>⬇️ {f.label}</a>)}
      </div>
      {m.warning && <p className="mt-5 rounded-xl border-2 border-red-700 bg-red-50 p-4 text-lg font-bold text-red-900">⚠️ {m.warning}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <WobblyCard padding="p-4">
          <h2 className="text-xl font-bold">📏 גודל וזמן</h2>
          <p className="mt-1">{m.size}</p>
          <p>זמן הדפסה: {m.time} (תלוי במדפסת)</p>
        </WobblyCard>
        <WobblyCard padding="p-4">
          <h2 className="text-xl font-bold">⚙️ הגדרות הדפסה</h2>
          <ul className="mt-1 list-disc pr-5">{m.settings.map(s => <li key={s}>{s}</li>)}</ul>
        </WobblyCard>
      </div>
      <h2 className="mb-2 mt-8 text-2xl font-bold">איך מדפיסים?</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">{m.steps.map(s => <li key={s}>{s}</li>)}</ol>
      <div className="mt-8">
        <SeoBody faq={m.faq} related={[HUB_CRUMB, ...others.map(o => ({ href: `${PRINT3D_BASE}/${o.slug}`, label: o.title })), { href: `${PRINT3D_BASE}/name-keychain`, label: 'מחזיק מפתחות עם שם' }].map(r => ({ href: r.href, label: r.label }))} />
      </div>
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">הדגם עוצב על ידי עוגה בוגה. מותר להדפיס לשימוש אישי, בבית הספר ובגן, ולשתף קישור לדף הזה.</p>
    </div>
  )
}

function download(dv, name) {
  const url = URL.createObjectURL(new Blob([dv], { type: 'model/stl' }))
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function NameKeychainPage() {
  const [name, setName] = useState('נועה')
  const [style, setStyle] = useState('keychain')
  const [lib, error] = use3DLib()
  const typed = useDeferredValue(name)

  const model = useMemo(() => lib && lib.geo.nameModel(lib.font, typed, style), [lib, typed, style])
  const geoms = useMemo(() => model && [model.base, model.text], [model])
  const st = lib?.geo.NAME_STYLES[style]
  const file = style === 'sign' ? 'name-sign' : 'name-keychain'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="מחזיק מפתחות עם שם להדפסה בתלת־ממד — מחולל STL בעברית" description="כותבים שם בעברית ומקבלים קובץ STL של מחזיק מפתחות או שלט לדלת החדר, להדפסה בתלת־ממד. תצוגה חיה, קובץ אחד או שני קבצים לשני צבעים, בחינם." path={`${PRINT3D_BASE}/name-keychain`} />
      <Breadcrumbs items={[...CRUMBS, HUB_CRUMB, { label: 'מחזיק מפתחות עם שם' }]} />
      <Header emoji="🔑" title="מחזיק מפתחות עם שם" intro="כותבים שם, רואים אותו מסתובב בתלת־ממד ומורידים קובץ להדפסה." />
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-lg font-bold">השם</span>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={16} dir="auto" className="w-full rounded-xl border-2 border-slate-800 px-4 py-3 text-2xl" placeholder="למשל: נועה" />
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="מה מדפיסים">
          {[['keychain', '🔑 מחזיק מפתחות'], ['sign', '🚪 שלט לדלת החדר']].map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={style === k} onClick={() => setStyle(k)} className={`${btn} ${style === k ? 'bg-[var(--postit,#fff3a8)]' : 'bg-white'}`}>{l}</button>
          ))}
        </div>
        {error
          ? <p className="rounded-xl border-2 border-red-700 bg-red-50 p-4">לא הצלחנו לטעון את הגופן. נסו לרענן את הדף.</p>
          : geoms ? <Viewer geometries={geoms} label={`${st.label} עם השם ${model.text_}`} /> : <div className="h-[320px] rounded-2xl border-2 border-slate-800 bg-sky-50" />}
        {model && (
          <>
            <p className="text-center">גודל: {Math.round(model.size.w)}×{Math.round(model.size.h)} מ״מ, עובי {model.size.z.toFixed(1)} מ״מ</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" className={`${btn} bg-[var(--postit,#fff3a8)]`} onClick={() => download(lib.geo.toSTL([model.base, model.text]), `${file}.stl`)}>⬇️ הורדת קובץ STL</button>
              <button type="button" className={`${btn} bg-white`} onClick={() => { download(lib.geo.toSTL(model.base), `${file}-base.stl`); setTimeout(() => download(lib.geo.toSTL(model.text), `${file}-letters.stl`), 400) }}>🎨 שני קבצים לשני צבעים</button>
            </div>
          </>
        )}
      </div>
      <h2 className="mb-2 mt-8 text-2xl font-bold">איך מדפיסים בשני צבעים?</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li>הכי פשוט: מדפיסים את הקובץ האחד ועוצרים את ההדפסה בגובה {st ? st.base : 3} מ״מ — שם נגמר הבסיס ומתחילות האותיות. מחליפים גליל וממשיכים.</li>
        <li>במדפסת עם כמה צבעים (AMS, MMU): מורידים את שני הקבצים, טוענים אותם יחד כדגם אחד, ובוחרים צבע לכל חלק.</li>
        <li>הגדרות: PLA, שכבה של 0.2 מ״מ, מילוי 20%, בלי תמיכות. מחזיק מפתחות מודפס בערך ב־20–30 דקות.</li>
      </ol>
      <div className="mt-8">
        <SeoBody paragraphs={[
          'המחולל בונה את הדגם בדפדפן שלכם: אותיות עבריות עבות על בסיס עם פינות מעוגלות, וחור לטבעת של מחזיק המפתחות. השם לא נשלח לשום מקום.',
          'שם ארוך מתכווץ אוטומטית כדי שהמחזיק לא יהיה ארוך מדי. אפשר לכתוב גם באנגלית ובספרות, למשל שם וגיל.',
        ]} faq={[
          { q: 'אפשר לכתוב עם ניקוד?', a: 'לא. הניקוד קטן מדי בשביל מדפסת תלת־ממד, ולכן המחולל מדלג עליו.' },
          { q: 'למה כדאי לבחור שלט לדלת?', a: 'השלט גדול יותר, עם אותיות של כ־2.4 ס״מ ושני חורים קטנים לתלייה. אפשר גם להדביק אותו עם סרט דו־צדדי.' },
        ]} related={[HUB_CRUMB, { href: '/printables/name-coloring', label: 'דף שם לצביעה' }, { href: `${PRINT3D_BASE}/dreidel`, label: 'סביבון להדפסה' }]} />
      </div>
    </div>
  )
}

// One lazy entry for all the /3d-print pages (keeps App.jsx small): p = the page under /3d-print
export default function Print3D() {
  const { p } = useParams()
  if (!p) return <Print3DHub />
  if (p === 'name-keychain') return <NameKeychainPage />
  if (p === 'space') return <Print3DSpacePage />
  return <Print3DModelPage slug={p} />
}

export function Print3DSpacePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="דגמי חלל להדפסה בתלת־ממד — קבצים חינמיים של נאס״א" description={`${NASA_MODELS.length} דגמים של נאס״א להדפסה בתלת־ממד, עם הסבר בעברית: הרובר קיוריוסיטי, הירח, הטיל סטורן 5, טלסקופ ג׳יימס ווב ועוד. נחלת הכלל, בחינם.`} path={`${PRINT3D_BASE}/space`} image="/3d/nasa/curiosity.webp" />
      <Breadcrumbs items={[...CRUMBS, HUB_CRUMB, { label: 'דגמי חלל' }]} />
      <Header emoji="🚀" title="דגמי חלל להדפסה בתלת־ממד" intro="הקבצים המקוריים של נאס״א, חינם לכולם — עם הסבר בעברית על כל דגם." />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {NASA_MODELS.map(m => (
          <a key={m.id} href={nasaFolderUrl(m)} target="_blank" rel="noopener noreferrer" className="block h-full">
            <WobblyCard hover padding="p-4" className="h-full">
              <img src={`/3d/nasa/${m.id}.webp`} alt={`${m.title} — דגם להדפסה בתלת־ממד`} width="480" height="480" loading="lazy" decoding="async" className="mb-2 aspect-square w-full rounded-xl object-cover" />
              <h2 className="font-hand text-xl font-bold">{m.title}</h2>
              <p className="mt-1">{m.blurb}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">📦 {m.parts}</p>
              <p className="mt-2 font-bold text-blue-700">לקבצים באתר של נאס״א ←</p>
            </WobblyCard>
          </a>
        ))}
      </div>
      <h2 className="mb-2 mt-8 text-2xl font-bold">איך מורידים?</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li>לוחצים על הדגם — נפתחת התיקייה שלו באתר של נאס״א (ב־GitHub).</li>
        <li>לוחצים על קובץ שנגמר ב־.stl, ואז על כפתור ההורדה (החץ למטה) בצד הקובץ.</li>
        <li>בחלק מהדגמים החלקים ארוזים בקובץ 7z. פותחים אותו בתוכנת 7-Zip או בתוכנת כיווץ אחרת.</li>
        <li>דגמים עם כמה חלקים מגיעים לרוב עם הוראות הרכבה באנגלית. מדביקים בדבק מגע.</li>
      </ol>
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">הדגמים והתמונות: NASA, נחלת הכלל (NASA 3D Resources). נאס״א לא קשורה לאתר הזה ולא ממליצה עליו.</p>
      <div className="mt-8">
        <SeoBody paragraphs={[
          'נאס״א משתפת בחינם מאות דגמים תלת־ממדיים של חלליות, רוברים, טילים וגרמי שמיים, וחלקם מוכנים להדפסה. בחרנו את הדגמים שהכי מתאימים לילדים ולשיעור מדע בכיתה, והוספנו לכל אחד הסבר קצר בעברית.',
          'רעיון לכיתה: כל קבוצה מדפיסה דגם אחד, מכינה עליו כרטיס הסבר, ובסוף מקימים יחד תערוכת חלל.',
        ]} related={[HUB_CRUMB, { href: '/discover', label: 'עולם ומדע לילדים' }]} />
      </div>
    </div>
  )
}

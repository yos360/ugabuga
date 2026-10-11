import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { MODELS, modelBySlug } from '../../origami/models'
import { CONTENT, HUB, HUB_FAQ, LEVELS } from '../../origami/content'
import { Diagram, ModelThumb, FoldLegend, useDiagrams } from '../../origami/OrigamiDiagram'
import '../../origami/origami.css'

const SITE = 'https://ugabuga.co.il'
const PER_PAGE = 6

function howToSchema(model, c) {
  return {
    '@context': 'https://schema.org', '@type': 'HowTo', name: c.h1, description: c.description, inLanguage: 'he',
    totalTime: `PT${parseInt(c.time, 10) || 5}M`,
    supply: [{ '@type': 'HowToSupply', name: c.paper }],
    step: model.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s.text, url: `${SITE}${HUB}/${model.slug}#step-${i + 1}` })),
  }
}

function PrintSheets({ model, dgs, c }) {
  const pages = []
  for (let i = 0; i < dgs.length; i += PER_PAGE) pages.push(dgs.slice(i, i + PER_PAGE).map((dg, j) => ({ dg, n: i + j + 1 })))
  return pages.map((items, p) => (
    <article key={p} className="buga-a4 ori-sheet">
      <h2>{c.h1}{pages.length > 1 ? ` (${p + 1}/${pages.length})` : ''}</h2>
      {p === 0 && <p className="art-caption">צריך: {c.paper} · {LEVELS[model.level].label} · כ-{c.time}</p>}
      <div className="ori-print-grid">
        {items.map(({ dg, n }) => (
          <figure key={n}>
            <Diagram dg={dg} color={model.color} label={`שלב ${n}`} />
            <figcaption><b>{n}.</b> {model.steps[n - 1].text}</figcaption>
          </figure>
        ))}
      </div>
      <footer>עוגה בוגה · אוריגמי לילדים · ugabuga.co.il/origami</footer>
    </article>
  ))
}

function Steps({ model, dgs }) {
  return (
    <ol className="ori-steps">
      {dgs.map((dg, i) => (
        <li key={i} id={`step-${i + 1}`} className="ori-step">
          <div className="ori-step-art"><Diagram dg={dg} color={model.color} label={`שלב ${i + 1}: ${model.steps[i].text}`} /></div>
          <p><span className="ori-num">{i + 1}</span>{model.steps[i].text}</p>
        </li>
      ))}
    </ol>
  )
}

function ModelCard({ model }) {
  const c = CONTENT[model.slug]
  return (
    <Link to={`${HUB}/${model.slug}`} className="ori-card">
      <span className="ori-card-art"><ModelThumb model={model} /></span>
      <b>{model.title}</b>
      <small>{LEVELS[model.level].stars} {LEVELS[model.level].label} · {model.steps.length} שלבים · {c.time}</small>
    </Link>
  )
}

// ── /origami/:slug ─────────────────────────────────
export function OrigamiModelPage({ slug: fixed }) {
  const { slug: param } = useParams()
  const slug = fixed || param
  const model = modelBySlug(slug)
  if (!model) return <NotFound />
  return <ModelPage key={slug} model={model} />
}

function ModelPage({ model }) {
  const c = CONTENT[model.slug]
  const dgs = useDiagrams(model)
  const [printing, setPrinting] = useState(false)
  const path = `${HUB}/${model.slug}`
  const isPlane = model.slug === 'paper-airplane'
  const related = c.related.map(modelBySlug)
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in ori" dir="rtl">
      <SEO title={c.seoTitle} description={c.description} path={path} structuredData={[howToSchema(model, c), faqSchema(c.faq)].filter(Boolean)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אוריגמי', href: HUB }, { label: model.title }]} />
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">{model.emoji} </span>{c.h1}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-700">{c.intro}</p>
        <ul className="ori-meta" aria-label="פרטי הקיפול">
          <li><b>רמה:</b> {LEVELS[model.level].stars} {LEVELS[model.level].label}</li>
          <li><b>גיל:</b> {LEVELS[model.level].age}</li>
          <li><b>זמן:</b> כ-{c.time}</li>
          <li><b>צריך:</b> {c.paper}</li>
        </ul>
        <div className="no-print mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" data-print-main onClick={() => setPrinting(true)} className="ori-btn ori-btn-print">🖨️ הדפסת ההוראות ({Math.ceil(dgs.length / PER_PAGE) === 1 ? 'דף אחד' : `${Math.ceil(dgs.length / PER_PAGE)} דפים`})</button>
          <a href="#step-1" className="ori-btn">⬇️ לשלבים</a>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="steps-h">
        <h2 id="steps-h" className="text-2xl font-bold">שלב אחר שלב</h2>
        <p className="mt-1 text-slate-600">קו מקווקו כחול = מקפלים כלפיכם, קו אדום של קווקוו ונקודות = מקפלים אחורה. <Link to={`${HUB}#legend`} className="underline">מה אומר כל סימן?</Link></p>
        <Steps model={model} dgs={dgs} />
      </section>

      {model.slug === 'fortune-teller' && <p className="ori-note">רוצים קוטי פוטי מוכן, עם צבעים, מספרים ומשפטים? <Link to="/printables/fortune-teller" className="font-bold underline">תבנית קוטי פוטי להדפסה</Link> — מדפיסים, גוזרים ומקפלים לפי השלבים כאן.</p>}

      {isPlane && <PlaneExtras />}

      <section className="mt-8 ori-box">
        <h2 className="text-2xl font-bold">טיפים</h2>
        <ul className="mt-2 list-disc space-y-1 pe-1 ps-5">{c.tips.map(t => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className="mt-8 no-print">
        <h2 className="text-2xl font-bold">עוד קיפולים שכדאי לנסות</h2>
        <div className="ori-grid mt-3">{related.map(m => <ModelCard key={m.slug} model={m} />)}</div>
        <p className="mt-3"><Link to={HUB} className="font-bold underline">לכל קיפולי האוריגמי לילדים</Link></p>
      </section>

      <div className="mt-8"><SeoBody faq={c.faq} related={[{ label: 'אוריגמי לילדים', href: HUB }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'מה עושים היום?', href: '/family/what-to-do' }]} /></div>

      {printing && <PrintPreview title={c.h1} onClose={() => setPrinting(false)}><PrintSheets model={model} dgs={dgs} c={c} /></PrintPreview>}
    </div>
  )
}

const FIXES = [
  ['נופל באף', 'מכופפים למעלה את הקצה האחורי של שתי הכנפיים, 2–3 מ״מ.'],
  ['מטפס ונעצר באוויר', 'הכנפיים מכופפות למעלה יותר מדי — מיישרים אותן, או זורקים בעדינות.'],
  ['פונה ימינה או שמאלה', 'בודקים ששתי הכנפיים זהות. מכופפים מעט את הקצה האחורי של הכנף שבצד שאליו המטוס פונה — כלפי מעלה.'],
  ['מסתחרר ונופל', 'הכנפיים לא ישרות או לא סימטריות. פותחים אותן כך שיהיו מאוזנות, בצורת Y רחבה כשמסתכלים מקדימה.'],
]

function PlaneExtras() {
  const glider = modelBySlug('paper-glider')
  return (
    <>
      <section className="mt-8" aria-labelledby="more-planes">
        <h2 id="more-planes" className="text-2xl font-bold">עוד מטוס: מטוס נייר שעף רחוק</h2>
        <div className="ori-feature mt-3">
          <span className="ori-card-art"><ModelThumb model={glider} /></span>
          <div>
            <p>המטוס הקלאסי חד ומהיר. אם רוצים מטוס שגולש לאט ורחוק, מקפלים מטוס עם חרטום שטוח ו"נעילה" — משולש קטן שמחזיק את הקיפולים סגורים באוויר. הוא לוקח עוד שתי דקות, ושווה כל קיפול.</p>
            <Link to={`${HUB}/paper-glider`} className="ori-btn mt-3 inline-flex">✈️ לשלבים של מטוס נייר שעף רחוק</Link>
          </div>
        </div>
      </section>
      <section className="mt-8 ori-box" aria-labelledby="fly-tips">
        <h2 id="fly-tips" className="text-2xl font-bold">איך מטיסים מטוס נייר</h2>
        <ol className="mt-2 list-decimal space-y-1 ps-5">
          <li>מחזיקים את המטוס מלמטה, בגחון, בערך בשליש הקדמי שלו.</li>
          <li>פותחים את הכנפיים כך שיהיו ישרות, בצורת Y רחבה כשמסתכלים מקדימה.</li>
          <li>זורקים ישר קדימה בתנועה רכה וחלקה — לא חזק ולא כלפי מעלה.</li>
          <li>מתאמנים בתוך הבית או בחוץ ביום בלי רוח.</li>
        </ol>
        <h3 className="mt-5 text-xl font-bold">המטוס לא עף טוב? כך מתקנים</h3>
        <table className="ori-table mt-2">
          <thead><tr><th>מה קורה</th><th>מה עושים</th></tr></thead>
          <tbody>{FIXES.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody>
        </table>
        <p className="mt-4">רעיון למשחק: מסמנים קו על הרצפה, וכל אחד מטיס שלוש פעמים. מנצח המטוס שהגיע הכי רחוק — או זה שנחת הכי קרוב למטרה (סל כביסה עובד מצוין).</p>
      </section>
    </>
  )
}

// ── /origami ─────────────────────────────────
export function OrigamiHub() {
  const byLevel = [1, 2, 3].map(l => ({ l, models: MODELS.filter(m => m.level === l) }))
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in ori" dir="rtl">
      <SEO title="אוריגמי לילדים — 15 קיפולי נייר קלים עם הוראות מצוירות" description="אוריגמי לילדים: 15 קיפולי נייר קלים עם הוראות מצוירות שלב אחר שלב — מטוס נייר, כוס, כובע, לב, כלב, חתול, קופסה ועוד. לכל קיפול יש דף הוראות להדפסה." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אוריגמי' }]} />
      <header className="text-center">
        <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 font-bold">15 קיפולים · ציור לכל שלב · הוראות להדפסה</span>
        <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🦢 </span>אוריגמי לילדים</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-700">אוריגמי לילדים הוא אמנות קיפול הנייר — בלי מספריים ובלי דבק. כאן תמצאו 15 קיפולים קלים ומוכרים, מהמניפה והכוס לילדי הגן ועד המטוס שעף רחוק וקופסה יפנית לילדים גדולים. לכל שלב יש ציור והסבר קצר, ואפשר להדפיס את ההוראות.</p>
      </header>

      <nav aria-label="קיפולים פופולריים" className="mt-6 flex flex-wrap justify-center gap-2">
        {['paper-airplane', 'paper-cup', 'paper-hat', 'heart', 'fortune-teller'].map(s => <Link key={s} to={`${HUB}/${s}`} className="ori-chip">{modelBySlug(s).emoji} {modelBySlug(s).title}</Link>)}
      </nav>

      {byLevel.map(({ l, models }) => (
        <section key={l} className="mt-8" aria-labelledby={`lvl-${l}`}>
          <h2 id={`lvl-${l}`} className="text-2xl font-bold">{LEVELS[l].stars} {l === 1 ? 'קיפולים קלים מאוד — להתחלה' : l === 2 ? 'קיפולים קלים' : 'קצת יותר מאתגר'} <small className="text-base font-normal text-slate-600">({LEVELS[l].age})</small></h2>
          <div className="ori-grid mt-3">{models.map(m => <ModelCard key={m.slug} model={m} />)}</div>
        </section>
      ))}

      <section className="mt-10 ori-box" aria-labelledby="paper-h">
        <h2 id="paper-h" className="text-2xl font-bold">איזה נייר צריך?</h2>
        <p className="mt-2">רוב הקיפולים מתחילים מריבוע נייר. נייר אוריגמי בגודל 15×15 ס״מ הוא הכי נוח: הוא דק, מחזיק קיפול חד, וצבעוני רק בצד אחד — כך שבחלק מהקיפולים הצד הלבן יוצא במקום הנכון (כמו הסנטר של השועל). אין נייר אוריגמי? גוזרים ריבוע מדף A4: מקפלים פינה עליונה עד הצד השני, גוזרים את הפס שנשאר — ופותחים. המטוסים, הכובע והמניפה מתקפלים מדף A4 שלם.</p>
      </section>

      <section id="legend" className="mt-8 ori-box" aria-labelledby="legend-h">
        <h2 id="legend-h" className="text-2xl font-bold">איך קוראים את הציורים</h2>
        <p className="mt-2">בכל שלב רואים את הנייר <b>לפני</b> הקיפול: קו מראה איפה לקפל, וחץ מראה לאן. הצבע הוא הצד הצבעוני של הנייר, והלבן — הצד הלבן.</p>
        <FoldLegend />
      </section>

      <div className="mt-8"><SeoBody paragraphs={[
        'אוריגמי טוב לילדים לא רק כי הוא כיף: הוא מתרגל מוטוריקה עדינה, דיוק וסבלנות, ומלמד לעקוב אחרי הוראות שלב אחר שלב. ילד שמקפל מטוס נייר לומד בלי לשים לב על חצאים, אלכסונים וסימטריה.',
        'כדאי להתחיל מהקיפולים הקלים מאוד — מניפה, כוס, כלב או מעטפה — ולהתקדם. ילדים צעירים מצליחים יותר כשמבוגר מקפל לידם על דף משלו, באותו קצב. ומטיפ שעובד לכולם: מעבירים ציפורן על כל קיפול כדי שיהיה חד.',
        'לכיתה, לחוג או לצהרון: לכל קיפול יש כפתור הדפסה שמסדר את כל השלבים בדף או שניים. מחלקים לכל ילד ריבוע נייר ואת דף ההוראות, ואפשר להתחיל.',
      ]} faq={HUB_FAQ} related={[{ label: 'קוטי פוטי להדפסה', href: '/printables/fortune-teller' }, { label: 'קופסת מתנה להדפסה', href: '/printables/gift-box' }, { label: 'מוטוריקה עדינה', href: '/printables/fine-motor' }, { label: 'מה עושים היום?', href: '/family/what-to-do' }]} /></div>
    </div>
  )
}

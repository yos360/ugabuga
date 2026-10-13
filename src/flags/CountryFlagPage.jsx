import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import NotFound from '../pages/NotFound'
import { CONTINENT_BY_SLUG, FLAG_NOTES, flagSrc } from './flagsData'
import { COUNTRY_DETAILS, countrySource } from './countryDetails'
import { findCountry, countryTitle, countryDescription, countryFaq, coloringFor, relatedCountries } from './countryPageData'
import { buildCountryRound } from './countryQuiz'
import { ColoringFlag, FlagImg } from './FlagsPages'
import { PAINT } from './coloringFlags'
import '../learn/learn.css'

const EXTRA_SOURCES = {
  af: ['רשות החינוך המקצועי באפגניסטן — הדגל הלבן', 'https://tveta.gov.af/index.php/en/eid-ul-fitr-message'],
  cz: ['משרד החוץ הצ׳כי — סמלי המדינה', 'https://mzv.gov.cz/ottawa/en/general_information_on_the_czech/the_state_symbols_of_the_czech_republic/index.html'],
  gq: ['ממשלת גינאה המשוונית — הכרזת הבירה', 'https://www.guineaecuatorialpress.com/index.php/noticias/el_presidente_de_la_republica_proclama_la_ciudad_de_la_paz_como_capital_de_la_republica_de_guinea_ecuatorial_con_la_firma_de_un_decreto_ley'],
  id: ['בית המשפט החוקתי באינדונזיה — מעבר הבירה', 'https://en.mkri.id/news/details/2026-05-12/Capital_Relocation_Depends_on_Issuance_of_Presidential_Decree'],
}

function CountryQuiz({ country }) {
  const [attempt, setAttempt] = useState(0)
  const [answers, setAnswers] = useState([])
  const [index, setIndex] = useState(0)
  const round = buildCountryRound(country.code, attempt)
  const q = round[index]
  const picked = answers[index]
  const complete = index === round.length
  const score = answers.filter((a, i) => a === round[i].answer).length
  return <section className="ln-box mt-8" aria-labelledby="country-quiz-title">
    <h2 id="country-quiz-title" className="text-2xl font-black mb-3">חידון {country.name} והיבשת שלה</h2>
    {complete ? <div role="status">
      <p className="text-xl font-bold">סיימתם! {score} מתוך 5 תשובות נכונות.</p>
      <button type="button" className="ln-chip mt-3" onClick={() => { setAttempt(a => a + 1); setAnswers([]); setIndex(0) }}>שחקו שוב</button>
    </div> : <>
      <p className="text-sm mb-2">שאלה {index + 1} מתוך 5</p>
      {q.flag && <FlagImg code={q.flag} eager alt="דגל לזיהוי בחידון" className="mx-auto mb-4 h-24 w-32" />}
      <fieldset>
        <legend className="text-lg font-bold mb-3">{q.prompt}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.choices.map(choice => <button key={choice} type="button" className="ln-opt !mt-0 !text-center disabled:cursor-default" disabled={picked !== undefined} aria-pressed={picked === choice} onClick={() => setAnswers(a => [...a, choice])}>{choice}</button>)}
        </div>
      </fieldset>
      <div aria-live="polite" className="mt-3 min-h-7">{picked !== undefined && <p className="font-bold">{picked === q.answer ? 'נכון!' : `התשובה הנכונה: ${q.answer}`}</p>}</div>
      {picked !== undefined && <button type="button" className="ln-chip mt-2" onClick={() => setIndex(i => i + 1)}>{index === 4 ? 'לתוצאה' : 'לשאלה הבאה'}</button>}
    </>}
  </section>
}

// Wrap SVG text for long Hebrew country names and explanations on the A4 sheet.
function lines(text, limit = 55) {
  const result = ['']
  for (const word of text.split(' ')) {
    if (result.at(-1).length + word.length + 1 > limit) result.push(word)
    else result[result.length - 1] += `${result.at(-1) ? ' ' : ''}${word}`
  }
  return result
}

function CountrySheet({ country: c, coloring }) {
  const f = coloringFor(c.code)
  const detail = COUNTRY_DETAILS[c.code]
  const colors = f ? [...new Set(f.colors)] : []
  const label = `דגל ${c.name}${coloring ? ' לצביעה' : ' — כרטיס מידע'}`
  return <article className="buga-a4"><div className="print-art"><Sheet label={label}>
    <T x={100} y={15} size={c.name.length > 18 ? 6 : 8} weight={900}>{label}</T>
    <T x={100} y={26} size={4.5}>{`${c.code === 'nr' ? 'מושב הממשלה' : 'בירה'}: ${c.capital}`}</T>
    <T x={100} y={35} size={4.5}>{`יבשת: ${CONTINENT_BY_SLUG[c.continent].name}`}</T>
    {coloring ? <ColoringFlag f={f} x={c.code === 'ch' ? 50 : 20} y={45} w={c.code === 'ch' ? 100 : 160} h={100} />
      : <image href={flagSrc(c.code)} x={20} y={45} width={160} height={100} preserveAspectRatio="xMidYMid meet" />}
    {coloring ? <>
      <T x={100} y={158} size={5} weight={800}>צובעים לפי המספרים והמקרא:</T>
      {colors.map((col, i) => <g key={col}><rect x={170 - i * 32} y={167} width={5} height={5} fill={PAINT[col][1]} stroke="#333" strokeWidth=".3" /><T x={167 - i * 32} y={171} size={4} anchor="start">{`${i + 1}: ${PAINT[col][0]}`}</T></g>)}
      <T x={100} y={192} size={4.5}>אילו חלקים בדגל חוזרים על עצמם?</T>
    </> : <>
      {lines(detail.meaning).map((line, i) => <T key={i} x={100} y={158 + i * 7} size={4}>{line}</T>)}
      <T x={100} y={195} size={4.5} weight={800}>מסתכלים, מכסים ומנסים לצייר מהזיכרון:</T>
    </>}
    <rect x={25} y={203} width={150} height={38} rx={2} fill="none" stroke="#888" strokeWidth=".4" strokeDasharray="2 2" />
    <T x={100} y={254} size={3.7}>איור לימודי במסגרת אחידה; פרטים קטנים עשויים להיות מפושטים.</T>
    <T x={100} y={262} size={3.7}>{`עוד מידע וחידון: ugabuga.co.il/flags/${c.code}`}</T>
  </Sheet></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
}

function CountryContent({ country: c }) {
  const [printing, setPrinting] = useState(null)
  const detail = COUNTRY_DETAILS[c.code], continent = CONTINENT_BY_SLUG[c.continent]
  const faq = countryFaq(c), f = coloringFor(c.code), related = relatedCountries(c)
  const linkList = (list, label) => <nav aria-label={label} className="flex flex-wrap gap-2">{list.map(p => <Link key={p.code} className="ln-chip inline-flex items-center gap-2" to={`/flags/${p.code}`}><FlagImg code={p.code} alt="" className="w-8 h-6" />{p.name}</Link>)}</nav>
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={countryTitle(c)} description={countryDescription(c)} path={`/flags/${c.code}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דגלי מדינות', href: '/flags' }, { label: `דגלי ${continent.name}`, href: `/flags/continents/${continent.slug}` }, { label: `דגל ${c.name}` }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-4">דגל {c.name}</h1>
    <p className="text-center text-lg mb-6">מכירים את הצבעים והסמלים, בודקים מה זוכרים ומדפיסים פעילות.</p>
    <figure className="ln-box">
      <FlagImg code={c.code} eager className="!w-full !h-auto max-w-md mx-auto" alt={`דגל ${c.name}${c.code === 'af' ? ' — דגל הרפובליקה לשעבר' : ''}`} />
      <figcaption className="mt-3 text-center text-sm">{c.code === 'af' ? FLAG_NOTES.af : 'איור לימודי במסגרת אחידה של 4:3; יחסי הממדים המקוריים של הדגל עשויים להיות שונים.'}</figcaption>
    </figure>
    <dl className="grid gap-3 sm:grid-cols-2 my-5">
      <div className="ln-box"><dt className="font-bold">{c.code === 'nr' ? 'מושב הממשלה' : c.code === 'za' ? 'בירת הממשלה' : 'בירה'}</dt><dd className="text-xl">{c.capital}</dd></div>
      <div className="ln-box"><dt className="font-bold">יבשת לפי החלוקה באתר</dt><dd><Link className="text-xl underline" to={`/flags/continents/${c.continent}`}>{continent.name}</Link></dd></div>
    </dl>
    <section aria-labelledby="flag-meaning">
      <h2 id="flag-meaning" className="text-2xl font-black mb-3">הצבעים והסמלים של דגל {c.name}</h2>
      <SeoBody paragraphs={[detail.description, detail.meaning, `בכרטיס המדינה של ${c.name} מופיעים ${c.capital} ו${continent.name}. נסו לתאר את הדגל בלי להביט בתמונה, ואז השוו את התיאור לפרטים שלמעלה. בחידון תפגשו גם דגל נוסף מאותה יבשת.`]} />
      {FLAG_NOTES[c.code] && <p className="ln-q mt-3">{FLAG_NOTES[c.code]}</p>}
      {c.code === 'id' && <p className="ln-q mt-3">אינדונזיה בונה את הבירה החדשה נוסנטרה. המעבר הרשמי תלוי בצו נשיאותי; בכרטיס מוצגת ג׳קרטה.</p>}
    </section>
    <section className="ln-box mt-6" aria-labelledby="country-print-title">
      <h2 id="country-print-title" className="text-2xl font-black mb-3">דגל {c.name} להדפסה</h2>
      <p className="mb-3">{f ? 'בחרו איור לצביעה לפי מספרים או כרטיס מידע בצבע.' : 'כרטיס מידע בצבע עם מקום לציור מהזיכרון. לדגל הזה אין כרגע איור קווי לצביעה.'} אפשר להדפיס על A4 או לשמור כ־PDF.</p>
      <div className="flex flex-wrap gap-2">
        {f && <button type="button" className="ln-chip" onClick={() => setPrinting('coloring')}>דף דגל לצביעה</button>}
        <button type="button" className="ln-chip" onClick={() => setPrinting('card')}>כרטיס מידע להדפסה</button>
      </div>
    </section>
    <CountryQuiz country={c} />
    {related.neighbors.length > 0 && <section className="mt-8"><h2 className="text-2xl font-black mb-3">מדינות גובלות באותה יבשת</h2>{linkList(related.neighbors, 'מדינות גובלות באותה יבשת')}</section>}
    <section className="mt-8"><h2 className="text-2xl font-black mb-3">עוד דגלים מ{continent.name}</h2>{linkList(related.others, 'עוד מדינות באותה יבשת')}<Link className="block underline mt-3" to={`/flags/continents/${c.continent}`}>לכל דגלי {continent.name}</Link></section>
    <div className="mt-8"><SeoBody faq={faq} related={[{ label: 'כל דגלי המדינות', href: '/flags' }, { label: 'חידון הדגלים המלא', href: '/flags/quiz' }, { label: 'כרטיסיות דגלים להדפסה', href: '/flags/print' }]} /></div>
    <details className="mt-6 text-sm"><summary className="cursor-pointer font-bold">מקורות המידע</summary>
      <p className="mt-2"><a className="underline" href={countrySource(c.code)} target="_blank" rel="noreferrer">ארכיון The World Factbook — תיאור הדגל, הבירה והגבולות</a>. ההסברים בעברית הם תקצירים לימודיים. משמעויות מסורתיות אינן תמיד הגדרה רשמית.</p>
      {EXTRA_SOURCES[c.code] && <p className="mt-2"><a className="underline" href={EXTRA_SOURCES[c.code][1]} target="_blank" rel="noreferrer">{EXTRA_SOURCES[c.code][0]}</a></p>}
      <p className="mt-2">איורי הדגלים: flag-icons, ברישיון MIT. סיווג היבשות הוא החלוקה המשמשת בחידוני האתר; מדינות מסוימות משתרעות על יותר מיבשת אחת.</p>
    </details>
    {printing && <PrintPreview title={`דגל ${c.name}${printing === 'coloring' ? ' לצביעה' : ' — כרטיס מידע'}`} onClose={() => setPrinting(null)}><CountrySheet country={c} coloring={printing === 'coloring'} /></PrintPreview>}
  </div>
}

export default function CountryFlagPage() {
  const { code } = useParams()
  const country = findCountry(code)
  return country ? <CountryContent key={code} country={country} /> : <NotFound />
}

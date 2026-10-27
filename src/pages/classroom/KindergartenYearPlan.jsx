import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HDate } from '@hebcal/core'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { GAN_YEAR } from '../../data/kindergartenYear'

// /classroom/kindergarten-year-plan — a gan year by Hebrew month: themes, one activity idea and links to
// the site's pages for each month. The current Hebrew month is highlighted (Israel date); one-page poster.
const PATH = '/classroom/kindergarten-year-plan'
const monthNow = () => { const m = new HDate().getMonthName(); return m.startsWith('Adar') ? 'Adar' : m }
const FAQ = [
  { q: 'מה הנושאים בגן לפי חודשים?', a: 'השנה בגן נבנית סביב החגים והעונות: תשרי — חגי תשרי, חשוון — סתיו וגשם, כסלו — חנוכה, טבת — חורף ו"אני וגופי", שבט — ט״ו בשבט ועצים, אדר — פורים, ניסן — פסח ואביב, אייר — יום העצמאות, סיוון — שבועות, ותמוז — קיץ וסיום שנה.' },
  { q: 'איך משתמשים בתכנית?', a: 'בכל חודש יש כמה נושאים, רעיון לפעילות אחת וקישורים לדפים מוכנים באתר — דפי צביעה, חוברות, משחקים ושירים. אפשר להדפיס את התכנית כולה בדף אחד ולתלות בגן.' },
  { q: 'זו תכנית הלימודים הרשמית?', a: 'לא. זו מפת השראה לפי לוח השנה העברי. כל גננת בונה את התכנית שלה לפי תכנית משרד החינוך, הגן והילדים.' },
]

function Poster() {
  return <article className="buga-a4" style={{ alignItems: 'stretch' }} dir="rtl">
    <h2 style={{ textAlign: 'center', fontSize: '22pt', margin: '0 0 8px' }}>🗓️ השנה בגן — נושאים לפי חודשים</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5pt' }}><tbody>{GAN_YEAR.map(m => <tr key={m.month}>
      <th style={{ border: '1px solid #999', padding: '9px 7px', width: '24mm', textAlign: 'right', fontSize: '15pt' }}>{m.emoji} {m.name}</th>
      <td style={{ border: '1px solid #999', padding: '9px 7px', lineHeight: 1.45 }}>{m.themes.join(' · ')}<br /><small style={{ color: '#555' }}>💡 {m.idea}</small></td>
    </tr>)}</tbody></table>
  </article>
}

export default function KindergartenYearPlan() {
  const now = useMemo(monthNow, [])
  const [printing, setPrinting] = useState(false)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="נושאים לגן לפי חודשים — תכנית שנתית לגננות (עם דפים מוכנים)" description="תכנית שנתית לגן לפי חודשי השנה העברית: נושאים לכל חודש מתשרי ועד תמוז, רעיון לפעילות וקישורים לדפי צביעה, חוברות ומשחקים מוכנים. גם בדף אחד להדפסה." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'תכנית שנתית לגן' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">🗓️ השנה בגן — נושאים לפי חודשים</h1>
    <p className="mx-auto mb-4 mt-3 max-w-2xl text-center text-lg">מאלול ועד תמוז: מה עושים בגן בכל חודש, רעיון אחד לפעילות, ודפים מוכנים מהאתר לכל נושא.</p>
    <div className="mb-6 text-center"><button type="button" onClick={() => setPrinting(true)} className="min-h-[48px] rounded-2xl bg-violet-700 px-5 font-bold text-white">🖨️ התכנית כולה בדף אחד</button></div>
    <ol className="grid gap-4 sm:grid-cols-2">{GAN_YEAR.map(m => { const current = m.month === now; return <li key={m.month} id={m.month.toLowerCase().replace(/[^a-z]/g, '')} className={`rounded-3xl border-2 p-5 ${current ? 'border-violet-500 bg-violet-50 shadow-[0_6px_0_#c4b5fd]' : 'border-[var(--border)] bg-[var(--card)]'}`}>
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black"><span aria-hidden="true">{m.emoji}</span> {m.name}</h2>{current && <span className="rounded-full bg-violet-600 px-3 py-1 text-sm font-bold text-white">החודש</span>}</div>
      <ul className="mt-2 list-disc pr-5">{m.themes.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="mt-2 text-sm"><b>💡 רעיון לפעילות:</b> {m.idea}</p>
      <div className="mt-3 flex flex-wrap gap-2">{m.links.map(([label, href]) => <Link key={href} to={href} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-1.5 text-sm font-bold hover:bg-[var(--postit)]">{label}</Link>)}</div>
    </li> })}</ol>
    {printing && <PrintPreview title="השנה בגן — נושאים לפי חודשים" onClose={() => setPrinting(false)}><Poster /></PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[
      'שנה בגן עוברת בקצב של החגים והעונות. בתחילת השנה מתמקדים בהיכרות ובחגי תשרי, בחורף בגוף ובחושים, באביב בטבע ובפסח, ובסוף השנה בקיץ ובפרידה. כאן כל חודש מופיע עם הנושאים שלו, רעיון אחד לפעילות שאפשר לעשות כבר מחר, וקישורים לדפים מוכנים באתר.',
      'החודש העברי הנוכחי מסומן. אפשר להדפיס את כל התכנית בדף אחד ולתלות ליד לוח הגן, או לשתף עם הצוות ועם ההורים.',
    ]} faq={FAQ} related={[{ label: 'כל החגים לילדים', href: '/holidays' }, { label: 'חוברות עבודה להדפסה', href: '/booklets' }, { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' }]} /></div>
  </div>
}

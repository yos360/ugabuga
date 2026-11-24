import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, TEMPLATE_HREF, MONTHS, SKILLS, GRADES, FAQ } from '../../data/hebrewYearlyPlan'

// /classroom/hebrew-yearly-plan: a suggested month-by-month Hebrew (language) plan for grades 1-6, built
// on the Ministry of Education notes. Grade selector, month cards with links to site pages, and a printable
// A4 table per grade. It is a suggestion, and says so on screen and on the print.

const font = { fontFamily: 'Heebo, Arial, sans-serif' }
const cell = { border: '1px solid #666', padding: '1.2mm 1.5mm', verticalAlign: 'top', fontSize: '8pt', lineHeight: 1.3 }

function PrintSheet({ grade }) {
  return <article className="buga-a4" dir="rtl" style={{ ...font, justifyContent: 'flex-start', alignItems: 'stretch' }}>
    <h2 style={{ ...font, margin: '0 0 1mm' }}>🗓️ פריסה שנתית בעברית · {grade.title}</h2>
    <div style={{ fontSize: '9pt', textAlign: 'center', marginBottom: '2mm', color: '#333' }}>הצעה לפריסה לפי תוכנית הלימודים של משרד החינוך · המורה מתאימה לספר הלימוד ולכיתה</div>
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead><tr>
        <th style={{ ...cell, width: '15%', background: '#eee', fontSize: '9pt' }}>חודש ונושא</th>
        {SKILLS.map(s => <th key={s.key} style={{ ...cell, background: '#eee', fontSize: '9pt' }}>{s.label}</th>)}
      </tr></thead>
      <tbody>{grade.months.map((mo, i) => <tr key={mo.topic}>
        <th style={{ ...cell, textAlign: 'right', background: '#fafafa' }}><div style={{ fontSize: '9.5pt' }}>{MONTHS[i]}</div><div style={{ fontWeight: 400 }}>{mo.topic}</div></th>
        {SKILLS.map(s => <td key={s.key} style={cell}>{mo[s.key]}</td>)}
      </tr>)}</tbody>
    </table>
    <div style={{ fontSize: '8.5pt', marginTop: '2mm', color: '#333' }}><b>יעד לסוף השנה:</b> {grade.milestones}</div>
    <footer style={{ ...font, fontSize: '9pt', marginTop: 'auto' }}>ugabuga.co.il/classroom/hebrew-yearly-plan · תבנית ריקה: ugabuga.co.il{TEMPLATE_HREF}</footer>
  </article>
}

export default function HebrewYearlyPlan() {
  const [gid, setGid] = useState('alef')
  const [printing, setPrinting] = useState(false)
  const grade = GRADES.find(g => g.id === gid)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="פריסה שנתית בעברית (שפה) לכיתות א׳–ו׳ — לפי תוכנית הלימודים" description="הצעה לפריסה שנתית בעברית לכל כיתה מא׳ עד ו׳: חודש אחר חודש קריאה, כתיבה, הבעה, לשון וספרות לפי תוכנית משרד החינוך, עם קישורים לדפי תרגול ולטבלה להדפסה." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'פריסה שנתית בעברית' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">🗓️ פריסה שנתית בעברית — כיתות א׳–ו׳</h1>
    <p className="mx-auto mb-4 mt-3 max-w-2xl text-center text-lg">הצעה לתכנון שנה בעברית: בכל חודש נושא ומיומנויות בקריאה, בכתיבה, בהבעה, בלשון ובספרות, עם קישורים לדפים מוכנים באתר.</p>

    <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="בחירת כיתה">
      {GRADES.map(g => <button key={g.id} type="button" aria-pressed={g.id === gid} onClick={() => setGid(g.id)}
        className={`min-h-[48px] min-w-[72px] rounded-2xl border-2 px-4 text-lg font-black ${g.id === gid ? 'border-violet-700 bg-violet-700 text-white' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]'}`}>{g.emoji} {g.label}</button>)}
    </div>

    <section aria-labelledby="grade-title" className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5">
      <h2 id="grade-title" className="text-2xl font-black">{grade.title}: על מה התוכנית נשענת</h2>
      <ul className="mt-2 list-disc space-y-1 pr-5">{grade.official.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="mt-3"><b>יעד לסוף השנה:</b> {grade.milestones}</p>
      <p className="mt-2 text-sm">זו הצעה לפריסה ולא דרישה רשמית. אפשר לשנות את הסדר לפי ספר הלימוד ולפי הכיתה.</p>
    </section>

    <div className="my-5 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => setPrinting(true)} className="min-h-[48px] rounded-2xl bg-violet-700 px-5 font-bold text-white">🖨️ הטבלה של {grade.title} בדף אחד</button>
      <Link to={TEMPLATE_HREF} className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-[var(--border)] bg-white px-5 font-bold hover:bg-[var(--postit)]">📋 תבנית ריקה לתכנון שנתי</Link>
    </div>

    <ol className="grid gap-4 sm:grid-cols-2">
      {grade.months.map((mo, i) => <li key={mo.topic} className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5">
        <h3 className="text-xl font-black">{MONTHS[i]}: {mo.topic}</h3>
        <dl className="mt-2 space-y-1 text-[0.95rem] leading-snug">
          {SKILLS.map(s => <div key={s.key}><dt className="inline font-bold">{s.emoji} {s.label}: </dt><dd className="inline">{mo[s.key]}</dd></div>)}
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">{mo.links.map(([label, href]) => <Link key={href} to={href} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-1.5 text-sm font-bold hover:bg-[var(--postit)]">{label}</Link>)}</div>
      </li>)}
    </ol>

    {printing && <PrintPreview title={`פריסה שנתית בעברית · ${grade.title}`} onClose={() => setPrinting(false)}><PrintSheet grade={grade} /></PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'פריסה שנתית עוזרת לראות מראש איך מתקדמים בעברית לאורך השנה, מספטמבר ועד יוני: מתי מתרגלים שטף קריאה, מתי מוסיפים נושא בלשון, ומתי כותבים טקסט ארוך. הטבלה בנויה לפי חמש מיומנויות: קריאה, כתיבה, הבעה בעל־פה, לשון וספרות.',
      'הפריסה נשענת על הנחיות משרד החינוך. בכיתות א׳ וב׳ יש יעדים לפי שלב, ובכיתות ג׳ עד ו׳ ההישגים הנדרשים מוגדרים לסוף כיתות ב׳, ד׳ ו־ו׳ בלבד. לכן החלוקה לחודשים היא הצעה שאפשר להתאים לספר הלימוד של בית הספר ולקצב של הכיתה.',
      'בכל חודש יש קישורים לדפי לשון, הבנת הנקרא, חוברות והכתבות באתר. לכתיבת תכנית משלכם אפשר להשתמש בתבנית הריקה של תכנון שנתי.',
    ]} faq={FAQ} related={[
      { label: 'תבנית תכנון שנתי', href: TEMPLATE_HREF },
      { label: 'לשון לפי כיתה', href: '/learn/lashon' },
      { label: 'הבנת הנקרא', href: '/learn/reading' },
      { label: 'חוברות עברית', href: '/booklets/hebrew-grade-3' },
    ]} /></div>
  </div>
}

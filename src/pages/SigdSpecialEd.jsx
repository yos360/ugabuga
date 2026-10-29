import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import PrintPreview from '../components/ui/PrintPreview'

// Sigd for grade 3 special education (a teacher's request): a short, fully vocalized text,
// one sentence per line, picture-supported multiple-choice questions and two open tasks.
// The nikud is hand-written; the toggle only strips it.
const TITLE = 'חַג הַסִּיגְד'
const TEXT = [
  ['☂️', 'סִיגְד הוּא חַג שֶׁל יְהוּדֵי אֶתְיוֹפְּיָה.'],
  ['📅', 'הַחַג חָל חֲמִשִּׁים יָמִים אַחֲרֵי יוֹם כִּפּוּר.'],
  ['⛰️', 'בְּאֶתְיוֹפְּיָה עָלוּ הָאֲנָשִׁים עַל הַר גָּבוֹהַּ.'],
  ['🙏', 'הֵם הִתְפַּלְּלוּ וְהִתְגַּעְגְּעוּ לִירוּשָׁלַיִם.'],
  ['👥', 'הַקֵּסִים הֵם מַנְהִיגֵי הַקְּהִלָּה.'],
  ['🌂', 'הַקֵּסִים לוֹבְשִׁים בְּגָדִים לְבָנִים וּמַחֲזִיקִים מִטְרִיּוֹת צִבְעוֹנִיּוֹת.'],
  ['🕛', 'בַּחַג צָמִים עַד הַצָּהֳרַיִם.'],
  ['🎶', 'אַחֲרֵי הַצּוֹם אוֹכְלִים יַחַד, שָׁרִים וְרוֹקְדִים.'],
  ['🏙️', 'הַיּוֹם חוֹגְגִים אֶת סִיגְד בִּירוּשָׁלַיִם.'],
]
// [question, [right, wrong, wrong], [emoji per option]] — shown in a fixed mixed order below.
const QUESTIONS = [
  ['שֶׁל מִי הַחַג סִיגְד?', ['יְהוּדֵי אֶתְיוֹפְּיָה', 'יְהוּדֵי מָרוֹקוֹ', 'יְהוּדֵי תֵּימָן'], ['🇪🇹', '🇲🇦', '🇾🇪']],
  ['לְאָן עָלוּ הָאֲנָשִׁים בְּאֶתְיוֹפְּיָה?', ['עַל הַר גָּבוֹהַּ', 'אֶל הַיָּם', 'אֶל הַמִּדְבָּר'], ['⛰️', '🌊', '🏜️']],
  ['לְאֵיזוֹ עִיר הֵם הִתְגַּעְגְּעוּ?', ['יְרוּשָׁלַיִם', 'תֵּל אָבִיב', 'אֵילַת'], ['🏛️', '🏙️', '🏖️']],
  ['מָה מַחֲזִיקִים הַקֵּסִים?', ['מִטְרִיּוֹת צִבְעוֹנִיּוֹת', 'כַּדּוּרִים', 'בָּלוֹנִים'], ['☂️', '⚽', '🎈']],
  ['אֵיזֶה צֶבַע הַבְּגָדִים שֶׁל הַקֵּסִים?', ['לָבָן', 'שָׁחֹר', 'אָדֹם'], ['⚪', '⚫', '🔴']],
  ['מָה עוֹשִׂים אַחֲרֵי הַצּוֹם?', ['אוֹכְלִים יַחַד, שָׁרִים וְרוֹקְדִים', 'הוֹלְכִים לִישֹׁן', 'הוֹלְכִים לְבֵית הַסֵּפֶר'], ['🎶', '😴', '🏫']],
]
const ORDER = [[0, 1, 2], [1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1]]
const TASKS = ['כִּתְבוּ מִלָּה אַחַת מֵהַסִּפּוּר:', 'צַיְּרוּ מִטְרִיָּה צִבְעוֹנִית לְסִיגְד:']
const plain = s => s.replace(/[֑-ׇ]/g, '')
const FAQ = [
  { q: 'למי מתאים הדף?', a: 'לכיתה ג׳ בחינוך המיוחד ולכל ילד שמתחיל לקרוא לבד: משפט אחד בכל שורה, ניקוד מלא, אותיות גדולות ושאלות עם תמונה ליד כל תשובה.' },
  { q: 'אפשר להדפיס?', a: 'כן. בכפתור ההדפסה יוצא דף A4 עם הסיפור והשאלות, ודף תשובות נפרד למורה. אפשר להדפיס עם ניקוד או בלי.' },
  { q: 'מה זה סיגד?', a: 'חג של יהודי אתיופיה (ביתא ישראל) בכ״ט בחשוון, 50 ימים אחרי יום כיפור. מאז 2008 הוא חג רשמי בישראל, והחגיגה המרכזית נערכת בירושלים.' },
]

function Sheet({ v, teacher }) {
  return <article className="buga-flow" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: '10mm' }}>
    <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>{teacher ? `תשובות למורה — ${plain(TITLE)}` : v(TITLE)}</h2>
    {!teacher && <>
      <p style={{ marginBottom: 12, fontSize: 16 }}>שֵׁם: ______________ · תַּאֲרִיךְ: ________</p>
      {TEXT.map(([e, s]) => <p key={s} style={{ fontSize: 24, lineHeight: 1.9 }}><span aria-hidden="true">{e} </span>{v(s)}</p>)}
      <h3 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 8px' }}>{v('סַמְּנוּ אֶת הַתְּשׁוּבָה הַנְּכוֹנָה')}</h3>
    </>}
    <ol style={{ paddingRight: 26, listStyle: 'decimal' }}>{QUESTIONS.map(([q, opts, icons], i) => <li key={q} style={{ fontSize: 22, marginBottom: 14, breakInside: 'avoid' }}><b>{v(q)}</b>
      {teacher ? <div>✔ {plain(opts[0])}</div> : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 4 }}>{ORDER[i].map(k => <span key={k}>◯ {icons[k]} {v(opts[k])}</span>)}</div>}</li>)}
      {TASKS.map((t, i) => <li key={t} style={{ fontSize: 22, marginBottom: 14, breakInside: 'avoid' }}><b>{v(t)}</b>{teacher ? <div>{i ? 'ציור חופשי של מטרייה צבעונית.' : 'כל מילה מהסיפור מתאימה, למשל: חג, הר, מטרייה, ירושלים.'}</div> : <div style={{ border: '2px dashed #999', borderRadius: 12, height: i ? 170 : 50, marginTop: 6 }} />}</li>)}</ol>
  </article>
}

export default function SigdSpecialEd() {
  const [nikud, setNikud] = useState(true), [picks, setPicks] = useState({}), [print, setPrint] = useState(false)
  const v = s => (nikud ? s : plain(s))
  const done = Object.keys(picks).length, right = Object.values(picks).filter(k => k === 0).length
  return <div className="mx-auto max-w-3xl px-4 py-6" dir="rtl">
    <SEO title="סיגד לכיתה ג׳ חינוך מיוחד — טקסט קצר מנוקד ושאלות להדפסה" description="דף לחג הסיגד לכיתה ג׳ בחינוך המיוחד: סיפור קצר עם ניקוד מלא, משפט אחד בכל שורה, ושאלות אמריקאיות עם תמונות. פותרים אונליין או מדפיסים עם דף תשובות." path="/holidays/sigd/special-ed-grade-3" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'סיגד', href: '/holidays/sigd' }, { label: 'כיתה ג׳ חינוך מיוחד' }]} />
    <h1 className="mb-1 text-center text-4xl font-black sm:text-5xl">☂️ סיגד — קוראים ועונים</h1>
    <p className="mb-4 text-center text-lg text-[var(--muted-foreground)]">לכיתה ג׳ חינוך מיוחד · טקסט קצר מנוקד · 6 שאלות עם תמונות</p>
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      <button type="button" aria-pressed={nikud} onClick={() => setNikud(!nikud)} className="min-h-[44px] rounded-full border-2 border-slate-800 bg-white px-4 font-bold">{nikud ? '🔤 עם ניקוד' : '🔤 בלי ניקוד'}</button>
      <button type="button" onClick={() => setPrint(true)} className="min-h-[44px] rounded-full bg-amber-600 px-5 font-bold text-white">🖨️ להדפסה עם דף תשובות</button>
    </div>
    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5 sketch-shadow">
      <h2 className="mb-3 text-center text-4xl font-black">{v(TITLE)}</h2>
      <div className="space-y-2 text-[1.7rem] leading-[1.9]">{TEXT.map(([e, s]) => <p key={s}><span aria-hidden="true">{e} </span>{v(s)}</p>)}</div>
    </section>
    <h2 className="mb-3 text-3xl font-black">{v('שְׁאֵלוֹת')}</h2>
    <div className="space-y-4">{QUESTIONS.map(([q, opts, icons], i) => <div key={q} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
      <p className="mb-3 text-2xl font-bold">{i + 1}. {v(q)}</p>
      <div className="grid gap-2 sm:grid-cols-3">{ORDER[i].map(k => {
        const chosen = picks[i] === k, show = picks[i] !== undefined
        return <button key={k} type="button" disabled={show} onClick={() => setPicks(p => ({ ...p, [i]: k }))} className={`min-h-[64px] rounded-2xl border-2 px-3 text-xl font-bold ${show && k === 0 ? 'border-green-600 bg-green-200' : chosen ? 'border-red-500 bg-red-100' : 'border-slate-800 bg-white'}`}><span aria-hidden="true" className="text-3xl">{icons[k]} </span>{v(opts[k])}</button>
      })}</div>
      {picks[i] !== undefined && <p className="mt-2 text-xl font-bold" aria-live="polite">{picks[i] === 0 ? '✅ כָּל הַכָּבוֹד!' : '💡 הַתְּשׁוּבָה הַנְּכוֹנָה צְבוּעָה בְּיָרֹק.'}</p>}
    </div>)}</div>
    {done === QUESTIONS.length && <p className="mt-5 text-center text-3xl font-black" role="status">{right} מתוך {QUESTIONS.length} {right === QUESTIONS.length ? '🌟' : '⭐'} <button type="button" onClick={() => setPicks({})} className="mr-2 text-lg underline">שוב</button></p>}
    <div className="mt-6 rounded-2xl bg-white p-4 text-xl"><b>{v('וְעַכְשָׁו בַּדַּף:')}</b> {TASKS.map(t => <p key={t}>✏️ {v(t)}</p>)}</div>
    {print && <PrintPreview title="סיגד — קוראים ועונים" onClose={() => setPrint(false)}><Sheet v={v} /><Sheet v={v} teacher /></PrintPreview>}
    <p className="mt-8 text-center text-lg">עוד לסיגד: <Link className="font-bold underline" to="/holidays/sigd/coloring">דפי צביעה</Link> · <Link className="font-bold underline" to="/holidays/sigd/worksheets">דפי עבודה</Link> · <Link className="font-bold underline" to="/holidays/sigd/what-to-do">פעילויות</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['דף קריאה לחג הסיגד שנכתב לכיתה ג׳ בחינוך המיוחד: תשעה משפטים קצרים, משפט בכל שורה, עם ניקוד מלא ותמונה קטנה שעוזרת להבין. השאלות סגורות, ולכל תשובה יש תמונה, כך שגם ילד שעוד מתקשה בקריאה יכול לענות.', 'בסוף יש שתי משימות בדף: לכתוב מילה אחת מהסיפור ולצייר מטרייה צבעונית, כמו המטריות של הקסים. אפשר להשתמש בכפתור "בלי ניקוד" כשהילד מוכן.']} faq={FAQ} related={[{ label: 'סיגד לילדים', href: '/holidays/sigd' }, { label: 'הבנת הנקרא לכיתה ג׳', href: '/learn/reading/grade-3' }]} /></div>
  </div>
}

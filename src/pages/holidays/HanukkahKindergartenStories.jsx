import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import SpeakButton from '../../components/ui/SpeakButton'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { KG_STORIES, splitForPrint, storyWords } from '../../data/hanukkahKindergartenStories'

// /holidays/hanukkah/kindergarten-stories: four original read-aloud Hanukkah stories for ages 4–6.
// Each story has conversation questions, a small activity, a 🔊 read-aloud button, and prints as a
// small A4 booklet (cover + two text pages, large type, a drawing box on every page).
const PATH = '/holidays/hanukkah/kindergarten-stories'

const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start', direction: 'rtl' }
const text = { width: '100%', fontSize: 22, lineHeight: 1.75, margin: '0 0 3mm', textAlign: 'right' }
const box = { width: '100%', flex: 1, minHeight: '55mm', border: '2px dashed #888', borderRadius: 12, marginTop: '3mm' }

function BookletPages({ s }) {
  const [a, b] = splitForPrint(s.paragraphs)
  const foot = <footer>ugabuga.co.il{PATH} · {s.title}</footer>
  return <>
    <article className="buga-a4" style={page}>
      <div style={{ fontSize: 90, lineHeight: 1.1, marginTop: '8mm' }} aria-hidden="true">{s.emoji}</div>
      <h2 style={{ fontSize: 34, margin: '4mm 0' }}>{s.title}</h2>
      <p style={{ fontSize: 18, margin: '0 0 4mm' }}>סיפור לחנוכה לגן · שם: ______________</p>
      <div style={{ ...box, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4mm' }}><b style={{ fontSize: 22 }}>{s.drawPrompt}</b></div>
      {foot}
    </article>
    {[a, b].map((ps, i) => <article className="buga-a4" style={page} key={i}>
      <h2 style={{ fontSize: 22, margin: '0 0 4mm' }}>{s.emoji} {s.title} · עמוד {i + 1} מתוך 2</h2>
      {ps.map((p, j) => <p key={j} style={text}>{p}</p>)}
      <div style={box} />
      {foot}
    </article>)}
  </>
}

function StoryCard({ s, onPrint }) {
  const full = s.paragraphs.join(' ')
  const btn = 'min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3 font-bold'
  return <article className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby={`s-${s.id}`}>
    <header className="mb-3 flex flex-wrap items-center gap-3">
      <h2 id={`s-${s.id}`} className="flex-1 text-2xl font-bold">{s.emoji} {s.title}</h2>
      <span className="text-sm text-[var(--muted-foreground)]">{storyWords(s.paragraphs)} מילים · כ־3 דקות הקראה</span>
      <SpeakButton text={full} lang="he-IL" label={`השמעה: ${s.title}`} rate={0.8} />
    </header>
    <div className="space-y-3 text-xl leading-loose">{s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl bg-blue-50 p-4" aria-label="שאלות לשיחה">
        <h3 className="mb-2 text-lg font-bold">💬 שאלות לשיחה אחרי הקריאה</h3>
        <ol className="list-decimal space-y-1 pr-6">{s.questions.map(q => <li key={q}>{q}</li>)}</ol>
      </section>
      <section className="rounded-2xl bg-[var(--postit)] p-4" aria-label="פעילות">
        <h3 className="mb-2 text-lg font-bold">🎨 פעילות קטנה</h3>
        <p>{s.activity}</p>
      </section>
    </div>
    <div className="mt-4 text-center"><button type="button" onClick={() => onPrint(s.id)} className={btn}>🖨️ חוברת להדפסה: 3 דפי A4</button></div>
  </article>
}

const FAQ = [
  { q: 'איזה סיפורי חנוכה מתאימים לילדי גן?', a: 'לגיל 4–6 מתאימים סיפורים קצרים, עם דמות אחת ברורה, בעיה פשוטה ופתרון חם. כאן יש ארבעה: סביבון קטן שלומד ליפול ולקום, שמש שמדליק את כולם, סופגנייה שלומדת לחלוק, וילד שמפחד מהחושך ולומד להוסיף אור.' },
  { q: 'כמה זמן אורך סיפור כזה בגן?', a: 'הקראה של סיפור אורכת כשלוש דקות. עם שיחה על השאלות ופעילות קטנה אחריו אפשר להקדיש 15–20 דקות, מה שמתאים למפגש מעגל. ילדים בני 4 מתרכזים יותר כשעוצרים באמצע ושואלים "מה יקרה עכשיו?".' },
  { q: 'איך מדפיסים את הסיפור כחוברת?', a: 'לוחצים על "חוברת להדפסה" ליד הסיפור. מתקבלים שלושה דפי A4: כריכה עם מקום לציור ושני עמודי טקסט באותיות גדולות, ובכל עמוד תיבה לציור של הילד. אפשר להדפיס, לצרף בסיכת הידוק ולהשאיר לילדים לצייר.' },
  { q: 'אפשר להשמיע את הסיפור בקול?', a: 'כן. לחצו על כפתור הרמקול ליד הכותרת והדפדפן יקריא את הסיפור בעברית, אם יש במכשיר קול עברי. הקול הממוחשב לא מחליף הקראה של גננת או הורה, אבל עוזר בבית או בפינת האזנה.' },
  { q: 'יש סיפור לפעוטות בגיל 2–3?', a: 'כן, יש סיפור מצויר לפעוטות בעמוד נפרד, עם משפט אחד ותמונה גדולה בכל דף. הסיפורים כאן מיועדים לגילי 4–6 ויש בהם עלילה ארוכה יותר ושאלות לשיחה.' },
]

export default function HanukkahKindergartenStories() {
  const [print, setPrint] = useState(null)
  const story = KG_STORIES.find(s => s.id === print)
  const chip = 'rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold'
  return <HanukkahShell crumb="סיפורי חנוכה לגן">
    <SEO title="סיפורי חנוכה לגן — 4 סיפורים להקראה עם שאלות לשיחה וחוברת להדפסה" description="ארבעה סיפורי חנוכה מקוריים לילדי גן (גילאי 4–6): סביבון, שמש, סופגנייה ואור וחושך. לכל סיפור שאלות לשיחה, פעילות קטנה, כפתור הקראה וחוברת A4 להדפסה עם מקום לציור. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">📖 סיפורי חנוכה לגן</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">ארבעה סיפורים קצרים להקראה בגן, לגילי 4–6. אחרי כל סיפור יש שאלות לשיחה, פעילות קטנה וחוברת להדפסה עם מקום לציור של הילד.</p>
    <nav aria-label="קפיצה לסיפור" className="mb-8 flex flex-wrap justify-center gap-2">
      {KG_STORIES.map(s => <a key={s.id} href={`#s-${s.id}`} className={chip}>{s.emoji} {s.topic}</a>)}
    </nav>

    {KG_STORIES.map(s => <StoryCard key={s.id} s={s} onPrint={setPrint} />)}

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-3 text-2xl font-bold">🧡 איך מקריאים סיפור לילדי גן</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li>מושיבים את הילדים במעגל קרוב אליכם, כדי שיראו את הפנים ויקשיבו לקול.</li>
        <li>קוראים לאט ובקולות שונים לכל דמות, ועוצרים רגע אחרי רגעים חשובים.</li>
        <li>שואלים באמצע "מה אתם חושבים שיקרה?" ונותנים לילדים לנחש.</li>
        <li>אחרי הסיפור שואלים את שאלות השיחה, ומקבלים כל תשובה, גם בלי מילים: ציור או הצבעה.</li>
        <li>עוברים לפעילות הקטנה, ומשאירים אחר כך את החוברת בפינת הקריאה.</li>
      </ol>
    </section>

    {story && <PrintPreview title={`חוברת: ${story.title}`} onClose={() => setPrint(null)}>
      <BookletPages s={story} />
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לגן: <Link className="font-bold underline" to="/holidays/hanukkah/toddler-story">סיפור לפעוטות (גילי 2–3)</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/grade/kindergarten">חנוכה בגן: כל החומרים</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/songs">שירי חנוכה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/circle-time">מערכי מפגש לחנוכה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'סיפורי חנוכה לגן מחפשים גננות והורים בשבועות שלפני החג: משהו קצר, חם, שמתאים לגיל 4–6 וגם פותח שיחה. הסיפורים כאן נכתבו במיוחד לעוגה בוגה סביב ארבעה סמלי חג: סביבון, שמש, סופגנייה, ואור שמתגבר על חושך.',
      'לכל סיפור יש עלילה ברורה עם התחלה, בעיה ופתרון, חמש שאלות לשיחה ופעילות קטנה אחת, בלי חומרים מסובכים. אפשר להקריא בקול, להשמיע בכפתור, או להדפיס חוברת A4 קטנה בגופן גדול עם תיבת ציור בכל עמוד.',
    ]} faq={FAQ} related={[{ label: 'סיפור חנוכה לפעוטות', href: '/holidays/hanukkah/toddler-story' }, { label: 'חנוכה בגן', href: '/holidays/hanukkah/grade/kindergarten' }, { label: 'שירי חנוכה', href: '/holidays/hanukkah/songs' }, { label: 'מערכי מפגש לחנוכה', href: '/holidays/hanukkah/circle-time' }, { label: 'פעילויות חנוכה בגן', href: '/guides/hanukkah-activities-kindergarten' }]} /></div>
  </HanukkahShell>
}

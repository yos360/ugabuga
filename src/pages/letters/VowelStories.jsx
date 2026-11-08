import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { speak } from '../../utils/speak'
import { STAGES, storiesOf } from '../../data/vowelStories'

// /letters/first-reading-stories — "סיפורים לראשית קריאה לפי תנועות": grade 1 stories that advance with the
// vowels already learned (each stage uses only its own marks), then grade 2–3 stories with comprehension
// questions. Read and answer on screen with instant feedback, or print the stage (stories + answer key).
const PATH = '/letters/first-reading-stories'
const READ_FONT = { fontFamily: '"Frank Ruhl Libre", "David Libre", Heebo, serif' }

function StoryCard({ story }) {
  const [picked, setPicked] = useState({})
  const done = story.qs.every((_, i) => picked[i] === story.qs[i][2])
  return <article className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-2xl font-black" style={READ_FONT}>{story.emoji} {story.title}</h3>
      <button type="button" onClick={() => speak(story.text)} className="min-h-[44px] rounded-xl border-2 border-violet-300 bg-white px-3 font-bold">🔊 הקראה</button>
    </div>
    <p className="mt-3 rounded-2xl bg-white p-4 text-3xl leading-[2.1] text-slate-900" style={READ_FONT}>{story.text}</p>
    <ol className="mt-4 space-y-4">{story.qs.map(([q, opts, ans], i) => <li key={q}>
      <p className="text-xl font-bold" style={READ_FONT}>{i + 1}. {q}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`תשובות לשאלה ${i + 1}`}>{opts.map((o, j) => {
        const chosen = picked[i] === j
        const cls = chosen ? (j === ans ? 'border-green-600 bg-green-100' : 'border-red-500 bg-red-50') : 'border-slate-300 bg-white'
        return <button key={o} type="button" aria-pressed={chosen} onClick={() => setPicked(p => ({ ...p, [i]: j }))} className={`min-h-[48px] rounded-xl border-2 px-4 text-xl font-bold text-slate-900 ${cls}`} style={READ_FONT}>{o}{chosen ? (j === ans ? ' ✓' : ' ✗') : ''}</button>
      })}</div>
      {picked[i] !== undefined && picked[i] !== ans && <p className="mt-1 text-sm">כמעט! קראו שוב את הסיפור ונסו תשובה אחרת.</p>}
    </li>)}</ol>
    {story.open && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-lg text-slate-900" style={READ_FONT}><b>שְׁאֵלָה פְּתוּחָה:</b> {story.open}</p>}
    {done && <p className="mt-4 text-center text-xl font-black text-green-700">⭐ כל הכבוד! עניתם נכון על כל השאלות</p>}
  </article>
}

function PrintStory({ story, stage }) {
  return <article className="buga-a4" style={{ alignItems: 'stretch', gap: 8 }} dir="rtl">
    <h2 style={{ margin: 0, fontSize: '22pt', ...READ_FONT }}>{story.emoji} {story.title}</h2>
    <p style={{ textAlign: 'center', margin: 0, fontSize: '11.5pt' }}>שם: ______________ · {stage.short} · {stage.grade === 1 ? `ניקוד: ${stage.label}` : 'ניקוד מלא'}</p>
    <p style={{ fontSize: '12pt', margin: '6px 0 0', fontWeight: 700 }}>קוראים את הסיפור בקול, לאט, עם אצבע מתחת לכל מילה:</p>
    <div style={{ border: '2px solid #111', borderRadius: 14, padding: '14px 20px', fontSize: stage.grade === 1 ? '24pt' : '18pt', lineHeight: 2, fontWeight: 600, ...READ_FONT }}>{story.text}</div>
    <p style={{ fontSize: '12pt', margin: '10px 0 0', fontWeight: 700 }}>מקיפים את התשובה הנכונה:</p>
    {story.qs.map(([q, opts], i) => <div key={q} style={{ margin: '4px 0', ...READ_FONT }}>
      <div style={{ fontSize: '16pt', fontWeight: 700 }}>{i + 1}. {q}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>{opts.map(o => <span key={o} style={{ flex: 1, textAlign: 'center', border: '2px solid #9aa5b5', borderRadius: 12, padding: '5px 4px', fontSize: stage.grade === 1 ? '18pt' : '14pt', fontWeight: 600 }}>{o}</span>)}</div>
    </div>)}
    {story.open && <div style={{ marginTop: 6, ...READ_FONT }}>
      <div style={{ fontSize: '15pt', fontWeight: 700 }}>4. {story.open}</div>
      {[0, 1, 2].map(k => <div key={k} style={{ borderBottom: '1.5px solid #111', height: '10mm' }} />)}
    </div>}
    <p style={{ fontSize: '12pt', margin: 'auto 0 0' }}>קראתי: ◯ פעם אחת &nbsp; ◯ פעמיים &nbsp; ◯ שלוש פעמים</p>
  </article>
}

function PrintKey({ stage, stories }) {
  return <article className="buga-a4" style={{ alignItems: 'stretch', gap: 10 }} dir="rtl">
    <h2 style={{ margin: 0, fontSize: '20pt' }}>✅ תשובות — {stage.short}</h2>
    {stories.map(s => <section key={s.id}>
      <h3 style={{ margin: '6px 0', fontSize: '15pt', ...READ_FONT }}>{s.emoji} {s.title}</h3>
      <ol style={{ margin: 0, fontSize: '14pt', ...READ_FONT }}>{s.qs.map(([q, opts, a]) => <li key={q}>{opts[a]}</li>)}{s.open && <li>תשובה אישית — כל תשובה מנומקת מתקבלת.</li>}</ol>
    </section>)}
  </article>
}

const FAQ = [
  { q: 'מה זה סיפורים לראשית קריאה לפי תנועות?', a: 'סיפורים קצרים שכתובים רק בניקוד שהילד כבר למד. בכיתה א׳ לומדים את התנועות בהדרגה — קמץ ופתח, אחר כך שווא, חיריק, צירה וסגול, חולם, ובסוף שורוק וקובוץ. סיפור משלב 1 כתוב רק בקמץ ובפתח, ולכן ילד שלמד רק אותם יכול לקרוא אותו לבד מההתחלה ועד הסוף.' },
  { q: 'באיזה שלב להתחיל?', a: 'בשלב של התנועה האחרונה שנלמדה בכיתה. אם לא בטוחים — מתחילים שלב אחד לפני, כדי שהקריאה הראשונה תהיה הצלחה. סיפור שנקרא בשטף, בלי עצירות, הוא סימן שאפשר לעבור לשלב הבא.' },
  { q: 'למה כל סיפור מגיע עם שאלות?', a: 'כי קריאה היא גם הבנה. אחרי שהילד מפענח את המילים, השאלות בודקות שהוא גם זוכר מה קרה, מי עשה מה ואיפה. בכיתות ב׳–ג׳ יש גם שאלה שצריך להסיק בה, ושאלה פתוחה לכתיבה.' },
  { q: 'אפשר להדפיס?', a: 'כן. כפתור "הדפסת השלב" מדפיס את כל הסיפורים של השלב, כל סיפור בדף A4 עם השאלות, ובסוף דף תשובות. ההדפסה חינמית.' },
]

export default function VowelStories() {
  const [params, setParams] = useSearchParams()
  const stage = STAGES.find(s => s.id === params.get('stage')) || STAGES[0]
  const stories = storiesOf(stage.id)
  const [printing, setPrinting] = useState(false)
  const choose = id => setParams(id === STAGES[0].id ? {} : { stage: id }, { replace: true })
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="סיפורים לראשית קריאה לפי תנועות — כיתה א׳ עד ג׳, עם שאלות הבנה" description="סיפורים קצרים לראשית קריאה שמתקדמים לפי התנועות שנלמדו: קמץ ופתח, שווא, חיריק, צירה וסגול, חולם, שורוק וקובוץ. ועוד סיפורים לכיתות ב׳–ג׳ עם שאלות הבנה. קוראים במסך או מדפיסים עם דף תשובות, בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'סיפורים לראשית קריאה' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">📚 סיפורים לראשית קריאה לפי תנועות</h1>
    <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg">כל שלב מוסיף תנועה אחת, וכל סיפור כתוב רק בניקוד שכבר נלמד — כך הילד קורא לבד מההתחלה ועד הסוף. בסוף כל סיפור יש שאלות הבנה עם משוב, ואפשר להדפיס.</p>
    <nav aria-label="בחירת שלב" className="flex flex-wrap justify-center gap-2">{STAGES.map(s => <button key={s.id} type="button" aria-pressed={s.id === stage.id} onClick={() => choose(s.id)}
      className={`min-h-[48px] rounded-2xl border-2 px-3 font-bold ${s.id === stage.id ? 'border-violet-600 bg-violet-100 text-slate-900' : 'border-slate-300 bg-white text-slate-700'}`}>
      <span className="block text-sm">{s.short}</span><span className="block text-lg" style={READ_FONT}>{s.grade === 1 ? s.label : 'שאלות הבנה'}</span></button>)}</nav>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50 p-4 text-slate-900">
      <p className="text-lg"><b>{stage.short}:</b> {stage.tip}</p>
      <button type="button" onClick={() => setPrinting(true)} className="min-h-[48px] rounded-2xl bg-violet-700 px-5 font-bold text-white">🖨️ הדפסת השלב</button>
    </div>
    <div className="mt-5 space-y-6">{stories.map(s => <StoryCard key={s.id} story={s} />)}</div>
    {printing && <PrintPreview title={`סיפורים לראשית קריאה — ${stage.short}`} onClose={() => setPrinting(false)}>
      {stories.map(s => <PrintStory key={s.id} story={s} stage={stage} />)}
      <PrintKey stage={stage} stories={stories} />
    </PrintPreview>}
    <p className="mt-8 text-center text-lg">רוצים עוד? <Link to="/booklets/nikud-short-texts" className="font-bold underline">חוברת טקסטים קצרים בניקוד</Link> · <Link to="/letters/reading-practice" className="font-bold underline">דף קריאה רק מהאותיות שלמדנו</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'סיפורים לראשית קריאה עובדים הכי טוב כשהם בנויים לפי סדר לימוד התנועות. ילד שלמד רק קמץ ופתח לא יכול לקרוא מילה עם חולם, ולכן סיפור "רגיל" גורם לו לנחש במקום לקרוא. כאן כל שלב מוסיף תנועה: קמץ ופתח, שווא, חיריק, צירה וסגול, חולם, ושורוק וקובוץ — וכל מילה בסיפור (וגם בתשובות) כתובה רק בניקוד של השלב.',
      'אחרי הקריאה עונים על שלוש שאלות הבנה: לחיצה על תשובה מראה מיד אם היא נכונה. בכיתות ב׳ ו־ג׳ הסיפורים ארוכים יותר, בניקוד מלא, עם שאלה שדורשת להסיק ושאלה פתוחה לכתיבה. כל שלב אפשר להדפיס — סיפור בכל דף, ודף תשובות בסוף.',
    ]} faq={FAQ} related={[{ label: 'קמץ ופתח — משחק ודפי עבודה', href: '/letters/nikud' }, { label: 'קוראים רק מה שלמדנו', href: '/letters/reading-practice' }, { label: 'טקסטים קצרים בניקוד — חוברת', href: '/booklets/nikud-short-texts' }, { label: 'הבנת הנקרא כיתה א׳', href: '/learn/reading/grade-1' }]} /></div>
  </div>
}

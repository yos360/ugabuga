import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import PrintPreview from '../../../components/ui/PrintPreview'
import SpeechNote from '../SpeechNote'
import { Section, Bullets, OnThisPage, SiblingNav, Sources } from './ParentParts'
import { MILESTONE_BANDS, ANY_AGE_SIGNS, HOME_TIPS, bandById } from '../../../data/speech/languageMilestones'
import { MILESTONE_SOURCES } from '../../../data/speech/parentSources'
import './speech-parents.css'

// Parents' guide: language & speech development by age (0–6), signs worth consulting about, home ideas,
// bilingual children, late talkers and stuttering. Choosing an age shows that band only — never a score
// or a "result" — and every band prints as a one-page A4 summary.

const PATH = '/speech/parents/language-milestones'
const DEFAULT_BAND = '18-24m'

const faq = [
  { q: 'מתי ילד מתחיל לדבר?', a: 'רוב הילדים אומרים מילה ראשונה בין גיל 10 ל־15 חודשים בערך, ועד גיל שנה וחצי כבר כמה מילים. לפני המילים יש שלבים חשובים לא פחות: מלמול בהברות ("בבבה"), הצבעה, נפנוף "ביי" ותגובה לשם. ילדים שונים זה מזה, ולכן מדברים על טווח ולא על גיל מדויק.' },
  { q: 'כמה מילים ילד אומר בגיל שנתיים?', a: 'בסביבות גיל שנתיים לרוב הילדים יש 50 מילים ויותר, והם מתחילים לצרף שתי מילים יחד ("עוד מים", "אבא הלך"). פחות מכ־50 מילים או היעדר צירופים בגיל שנתיים הם סיבה טובה להתייעץ עם רופא/ת הילדים או עם קלינאי/ת תקשורת.' },
  { q: 'הילד שלי בן שנתיים ולא מדבר. לחכות?', a: 'חלק מהילדים שמתחילים לדבר מאוחר מדביקים את הפער לבד, אבל אי אפשר לדעת מראש מי מהם. לכן ההמלצה המקובלת היא לא לחכות: לפנות להערכה ולבדיקת שמיעה. בינתיים כדאי לדבר הרבה בתוך השגרה, להרחיב את מה שהילד אומר ולתת לו זמן לענות.' },
  { q: 'האם דו־לשוניות גורמת לאיחור בדיבור?', a: 'לא. ילדים יכולים ללמוד שתי שפות ויותר מגיל צעיר. אוצר המילים מתחלק בין השפות, וערבוב שפות הוא חלק רגיל מהלמידה. אם יש דאגה, מעריכים את הילד בשתי השפות — עיכוב אמיתי מופיע בשתיהן.' },
  { q: 'מתי גמגום אצל ילד צעיר הוא סיבה לפנות?', a: 'חזרות והיסוסים נפוצים מאוד בגיל 2–5. כדאי לפנות לקלינאי/ת תקשורת אם הגמגום נמשך יותר מחצי שנה, אם יש גמגום במשפחה, אם הוא התחיל אחרי גיל 3.5 בערך, אם רואים מאמץ או מתח בזמן הדיבור, או אם הילד מודע לגמגום ומוטרד ממנו. לא אומרים לילד "דבר לאט" — מדברים בעצמנו לאט ונותנים לו זמן.' },
  { q: 'למי פונים אם יש דאגה לגבי הדיבור?', a: 'אפשר לשתף את רופא/ת הילדים או את האחות בטיפת חלב, שיכולים להפנות להערכה (בקופות החולים בדרך כלל דרך המכון להתפתחות הילד), או לפנות ישירות לקלינאי/ת תקשורת. כדאי לבדוק גם שמיעה. פנייה מוקדמת לא "מסמנת" את הילד — היא נותנת תמונה ברורה ולפעמים גם רוגע.' },
  { q: 'האם העמוד הזה הוא מבחן או אבחון?', a: 'לא. העמוד מציג טווחים התפתחותיים כלליים ורעיונות לבית, בלי ציון ובלי "תוצאה". רשימות של אבני דרך (גם של ASHA ו־CDC) אינן כלי סינון או אבחון. הערכה מקצועית נעשית רק על ידי איש/אשת מקצוע.' },
]

function BandColumns({ band }) {
  const cols = [
    ['👂', 'הבנה', band.understanding],
    ['💬', 'הבעה', band.expression],
    ['🤝', 'תקשורת חברתית', band.social],
  ]
  return <div className="grid gap-3 md:grid-cols-2">
    {cols.map(([icon, title, items]) => <article key={title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
      <h4 className="text-lg font-black"><span aria-hidden="true">{icon} </span>{title}</h4>
      <Bullets items={items} className="mt-2" />
    </article>)}
    <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
      <h4 className="text-lg font-black"><span aria-hidden="true">🗣️ </span>בהירות הדיבור</h4>
      <p className="mt-2 leading-relaxed">{band.clarity}</p>
    </article>
  </div>
}

// One A4 page per band: the same content as the screen, in print-friendly boxes.
function BandSheet({ band }) {
  return <article className="buga-a4 spk-sheet spk-band" dir="rtl">
    <h2>{band.emoji} התפתחות שפה ודיבור · {band.label}</h2>
    <p className="spk-sub">{band.summary}. אלה טווחים כלליים — כל ילד מתפתח בקצב שלו.</p>
    <div className="spk-grid">
      <div className="spk-box"><h3>👂 הבנה</h3><ul>{band.understanding.map(t => <li key={t}>{t}</li>)}</ul></div>
      <div className="spk-box"><h3>💬 הבעה</h3><ul>{band.expression.map(t => <li key={t}>{t}</li>)}</ul></div>
      <div className="spk-box"><h3>🗣️ בהירות הדיבור</h3><p style={{ margin: 0 }}>{band.clarity}</p></div>
      <div className="spk-box"><h3>🤝 תקשורת חברתית</h3><ul>{band.social.map(t => <li key={t}>{t}</li>)}</ul></div>
      <div className="spk-box spk-wide"><h3>🏡 רעיונות לבית</h3><ul>{band.tips.map(t => <li key={t}>{t}</li>)}</ul></div>
      <div className="spk-box spk-wide spk-consult"><h3>כדאי להתייעץ עם רופא/ת הילדים או קלינאי/ת תקשורת אם…</h3><ul>{band.consult.map(t => <li key={t}>{t}</li>)}<li>בכל גיל: נסיגה בכישורים שכבר היו, חשד לקושי בשמיעה, או תחושה שלכם שמשהו לא בסדר</li></ul></div>
    </div>
    <p className="spk-foot">הגילים מבוססים על אבני הדרך של ASHA (2023) ו־CDC (2022), שמציינות גיל שבו כ־75% מהילדים כבר עושים את הדבר — כלומר ילדים רבים מגיעים לזה מעט מאוחר יותר, וזה תקין. הדף אינו כלי אבחון. כשיש דאגה לגבי הדיבור כדאי לבדוק גם שמיעה.</p>
    <footer>עוגה בוגה · ugabuga.co.il{PATH}</footer>
  </article>
}

export default function LanguageMilestones() {
  const [params, setParams] = useSearchParams()
  const band = bandById(params.get('age')) || bandById(DEFAULT_BAND)
  const [printing, setPrinting] = useState(null)
  const choose = (id, scroll) => {
    setParams(p => { const n = new URLSearchParams(p); n.set('age', id); return n }, { replace: true, preventScrollReset: true })
    if (scroll) document.getElementById('by-age')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const printBands = printing === 'all' ? MILESTONE_BANDS : printing ? [bandById(printing)] : []

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="התפתחות שפה ודיבור לפי גיל — מתי ילד מתחיל לדבר ומתי לפנות"
      description="התפתחות שפה ודיבור מלידה עד גיל 6: מה מצופה בכל גיל (גם בגיל שנתיים), סימנים שכדאי להתייעץ, איחור בדיבור, גמגום, דו־לשוניות ורעיונות לבית. עם מקורות ודף להדפסה."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'התפתחות שפה לפי גיל' }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl"><span aria-hidden="true">🗣️ </span>התפתחות שפה ודיבור לפי גיל</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-[var(--foreground)]/80">מה מצופה בכל גיל, מלידה ועד 6 — ומתי כדאי לפנות לקלינאית תקשורת</p>
    <SiblingNav path={PATH} />

    <QuickAnswer q="מתי ילד מתחיל לדבר, ומה מצופה בגיל שנתיים?"
      a="רוב הילדים אומרים מילה ראשונה בין 10 ל־15 חודשים בערך, ועד גיל שנה וחצי כבר כמה מילים. בסביבות גיל שנתיים לרוב הילדים יש 50 מילים ויותר והם מצרפים שתי מילים. אלה טווחים, וילדים שונים זה מזה. אם אין מילים עד 16–18 חודשים, אין צירופים עד שנתיים, או שיש נסיגה בכל גיל — כדאי להתייעץ."
      rows={[
        ['מלמול בהברות', 'בערך 6–10 חודשים ("בבבה", "דדדה")'],
        ['מילה ראשונה', 'בערך 10–15 חודשים'],
        ['צירוף של שתי מילים', 'בסביבות גיל שנתיים'],
        ['משפטים קצרים', 'בין שנתיים לשלוש'],
        ['רוב הדיבור מובן לזרים', 'בסביבות גיל 4 (כלל אצבע)'],
      ]}
      updated="2026-10-24" />

    <SpeechNote className="mt-2" />

    <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-[var(--foreground)]/85">
      הגילים בעמוד הם <b>טווחים</b>, לא מבחן. רשימות אבני הדרך של ASHA ושל ה־CDC מציינות את הגיל שבו כ־75% מהילדים כבר עושים את הדבר — כך שילדים רבים, שמתפתחים כרגיל, מגיעים לזה מעט מאוחר יותר. ילד שעדיין לא עושה דבר אחד מהרשימה לא בהכרח צריך הערכה. מה שחשוב יותר הוא התמונה הכללית: האם הילד מתקדם, האם חסרים כמה דברים יחד, והאם הייתה נסיגה.
    </p>

    <OnThisPage items={[['by-age', 'לפי גיל'], ['overview', 'כל הגילים במבט אחד'], ['consult', 'מתי להתייעץ'], ['home', 'רעיונות לבית'], ['bilingual', 'דו־לשוניות'], ['late-talkers', 'דיבור מאוחר'], ['stuttering', 'גמגום'], ['sources', 'מקורות']]} />

    <Section id="by-age" title="בחרו את גיל הילד/ה" intro="בוחרים טווח גיל ורואים מה בדרך כלל מופיע בו, מה כדאי לשים לב אליו ורעיונות לבית. אין כאן שאלון ואין ציון.">
      <div role="group" aria-label="גיל הילד/ה" className="flex flex-wrap justify-center gap-2">
        {MILESTONE_BANDS.map(b => <button key={b.id} type="button" aria-pressed={band.id === b.id} onClick={() => choose(b.id)}
          className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-3 py-1.5 font-bold ${band.id === b.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>
          <span aria-hidden="true">{b.emoji} </span>{b.label}</button>)}
      </div>

      <div className="mt-5 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 sm:p-6" aria-live="polite">
        <h3 className="text-2xl font-black sm:text-3xl"><span aria-hidden="true">{band.emoji} </span>{band.label}</h3>
        <p className="mt-1 text-lg font-bold text-[var(--foreground)]/80">{band.summary}</p>
        <div className="mt-4"><BandColumns band={band} /></div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
            <h4 className="text-lg font-black"><span aria-hidden="true">🏡 </span>רעיונות לבית בגיל הזה</h4>
            <Bullets items={band.tips} className="mt-2" />
          </article>
          <article className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4">
            <h4 className="text-lg font-black"><span aria-hidden="true">🔎 </span>כדאי להתייעץ אם…</h4>
            <Bullets items={band.consult} className="mt-2" />
            <p className="mt-2 text-sm text-[var(--foreground)]/75">ובכל גיל — נסיגה, חשד לקושי בשמיעה או תחושה שלכם שמשהו לא בסדר.</p>
          </article>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => setPrinting(band.id)} className="min-h-[48px] rounded-xl bg-red-500 px-5 py-2 text-lg font-bold text-white">🖨️ דף סיכום להדפסה — {band.label}</button>
          <button type="button" onClick={() => setPrinting('all')} className="min-h-[48px] wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-2 font-bold hover:bg-[var(--muted)]/30">כל הגילים ({MILESTONE_BANDS.length} דפים)</button>
        </div>
        <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">דף A4 אחד לכל גיל — אפשר לתלות על המקרר או להביא לפגישה בטיפת חלב.</p>
      </div>
    </Section>

    <Section id="overview" title="כל הגילים במבט אחד" intro="לחיצה על גיל פותחת את הפירוט המלא שלו למעלה.">
      <div className="grid gap-3 sm:grid-cols-2">
        {MILESTONE_BANDS.map(b => <button key={b.id} type="button" onClick={() => choose(b.id, true)}
          className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-right hover:bg-[var(--postit)]">
          <span className="block text-lg font-black"><span aria-hidden="true">{b.emoji} </span>{b.label}</span>
          <span className="mt-1 block leading-relaxed">{b.summary}</span>
          <span className="mt-2 block text-sm text-[var(--foreground)]/70"><b>כדאי להתייעץ אם:</b> {b.consult[0]}</span>
        </button>)}
      </div>
    </Section>

    <Section id="consult" title="סימנים שכדאי להתייעץ" intro="אלה לא סימנים לאבחנה מסוימת, אלא סיבות טובות לשאול איש/אשת מקצוע. ברוב המקרים הפנייה מרגיעה, וכשיש צורך — עזרה מוקדמת עושה הבדל.">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4">
          <h3 className="text-lg font-black">לפי גיל (בערך)</h3>
          <Bullets className="mt-2" items={[
            'עד גיל שנה: אין מלמול בהברות, אין תגובה לשם, אין מחוות כמו הצבעה או נפנוף',
            'עד 16–18 חודשים: אין עדיין מילים, או שלא מצביעים כדי להראות דברים',
            'בגיל שנתיים: פחות מכ־50 מילים, או שאין צירופים של שתי מילים',
            'בגיל 3: גם המשפחה מתקשה להבין את רוב הדיבור, או שאין משפטים קצרים',
            'מגיל 3–4: אנשים זרים מתקשים להבין את רוב מה שהילד אומר',
            'בגיל 4–6: קושי לספר מה קרה, להבין הוראות בגן או לשחק בצלילים ובחרוזים',
          ]} />
        </article>
        <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-lg font-black">בכל גיל</h3>
          <Bullets className="mt-2" items={ANY_AGE_SIGNS} />
        </article>
      </div>
      <div className="mt-4 rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
        <h3 className="text-lg font-black">למי פונים?</h3>
        <p className="mt-1">אפשר להתחיל ברופא/ת הילדים או באחות בטיפת חלב. הם יכולים להפנות להערכה — בקופות החולים בדרך כלל דרך המכון להתפתחות הילד — וגם לבדיקת שמיעה. אפשר גם לפנות ישירות לקלינאי/ת תקשורת. כשמתייעצים, כדאי לספר מה הילד מבין, איך הוא מבקש דברים, כמה מילים הוא אומר ואיך הוא משחק. סרטון קצר מהבית יכול לעזור.</p>
        <p className="mt-2">לא צריך לחכות ל"גיל מסוים": אם יש לכם דאגה, זה הזמן לשאול.</p>
      </div>
    </Section>

    <Section id="home" title="איך מעודדים שפה ודיבור בבית" intro={'אין צורך בציוד מיוחד או ב"שיעורים". רוב הלמידה קורית בשיחות קטנות במהלך היום. כמה הרגלים שנמצאו מועילים:'}>
      <div className="grid gap-3 sm:grid-cols-2">
        {HOME_TIPS.map(t => <article key={t.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">{t.icon} </span>{t.title}</h3>
          <p className="mt-1 leading-relaxed">{t.text}</p>
        </article>)}
      </div>
      <p className="mt-3 text-sm text-[var(--foreground)]/75">לא צריך לעשות הכול. מספיק לבחור שניים־שלושה רעיונות ולהכניס אותם לשגרה. ואם הילד כבר מטופל — הקלינאית תתאים לכם את מה שהכי חשוב עכשיו.</p>
    </Section>

    <Section id="bilingual" title="ילדים דו־לשוניים">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
        <Bullets items={[
          'דו־לשוניות אינה גורמת לעיכוב בדיבור. ילדים מסוגלים ללמוד שתי שפות ויותר כבר מגיל צעיר.',
          'אוצר המילים מתחלק בין השפות: בכל שפה לחוד יכולות להיות פחות מילים, אבל יחד — המילים והמושגים דומים לאלה של ילדים חד־לשוניים.',
          'ערבוב שפות באותו משפט הוא חלק רגיל מהלמידה, ולא סימן לבלבול.',
          'כדאי שכל הורה ידבר עם הילד בשפה שהוא מרגיש בה הכי בנוח — שפה עשירה וטבעית חשובה יותר מ"השפה הנכונה". אין צורך לוותר על שפת הבית.',
          'אם יש דאגה, ההערכה צריכה להתייחס לשתי השפות. עיכוב שפתי אמיתי מופיע בשתיהן, ולא רק בשפה שהילד שומע פחות.',
        ]} />
      </div>
    </Section>

    <Section id="late-talkers" title="ילדים שמדברים מאוחר">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
        <p>כ־10–15% מהפעוטות מתחילים לדבר מאוחר מהמצופה: בגיל שנתיים יש להם פחות מכ־50 מילים או שהם עדיין לא מצרפים מילים. חלק גדול מהם מדביקים את הפער, אבל אי אפשר לדעת מראש מי, ולכן גישת "נחכה ונראה" אינה מומלצת.</p>
        <p className="mt-2 font-bold">כדאי לפנות להערכה מוקדם במיוחד אם בנוסף:</p>
        <Bullets className="mt-1" items={[
          'הילד מתקשה גם להבין מילים או הוראות פשוטות',
          'הוא משתמש במעט מחוות (הצבעה, נפנוף, הנהון) ולא מחקה',
          'יש דלקות אוזניים חוזרות או חשד לקושי בשמיעה',
          'יש במשפחה קשיי שפה, דיבור או קריאה',
        ]} />
        <p className="mt-2">בינתיים, כל הרעיונות בפרק "איך מעודדים שפה" מתאימים — ובמיוחד לחכות לתגובה, להרחיב את מה שהילד אומר ולקרוא יחד.</p>
      </div>
    </Section>

    <Section id="stuttering" title="גמגום אצל ילדים צעירים">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
          <p>בגילים 2–5 חזרות והיסוסים נפוצים מאוד, במיוחד בתקופות של פרץ שפתי. כ־5% מהילדים עוברים תקופה של גמגום, ורבים מהם מפסיקים לגמגם. גמגום אינו נגרם בגלל ההורים.</p>
          <h3 className="mt-3 text-lg font-black">כדאי לפנות לקלינאי/ת תקשורת אם:</h3>
          <Bullets className="mt-1" items={[
            'הגמגום נמשך יותר מחצי שנה',
            'יש גמגום במשפחה',
            'הגמגום התחיל אחרי גיל 3.5 בערך',
            'רואים מאמץ או מתח: מצמוץ, מתח בפנים, "תקיעות" ארוכות בלי קול',
            'הילד מודע לגמגום, מתוסכל או נמנע מלדבר',
            'יש גם קשיים אחרים בשפה או בהיגוי',
          ]} />
        </article>
        <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
          <h3 className="text-lg font-black">מה עוזר בבית</h3>
          <Bullets className="mt-1" items={[
            'מדברים בעצמכם לאט ובנינוחות, עם הפסקות קטנות — זה מודל, בלי לבקש מהילד לחקות',
            'מקשיבים למה שהילד אומר ושומרים על קשר עין רגוע',
            'לא משלימים את המשפט במקומו ולא ממהרים אותו',
            'מפחיתים לחץ של זמן: לא שואלים הרבה שאלות ברצף',
            'אם הילד מתוסכל, אפשר לומר בפשטות: "לפעמים קשה להוציא מילים. אני מחכה לך"',
          ]} />
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><b>מה לא אומרים:</b> "דבר לאט", "תנשום", "תתחיל מחדש". גם כשהכוונה טובה, משפטים כאלה מוסיפים לחץ. מידע ותמיכה להורים יש גם באמב״י — ארגון מגמגמים בישראל.</p>
        </article>
      </div>
    </Section>

    <Section id="more" title="עוד בנושא">
      <p className="leading-relaxed">רוצים לדעת באיזה גיל ילדים אומרים ר, ש או ס? ב<Link to="/speech/parents/sound-acquisition" className="font-bold underline">טבלת גיל רכישת הצלילים בעברית</Link> יש טווחים לכל צליל, שיבושים נפוצים בדרך ומתי כדאי להתייעץ. לתרגול משחקי בבית יש <Link to="/speech/sounds/r" className="font-bold underline">כרטיסיות לצליל ר</Link>, <Link to="/speech/sounds/s" className="font-bold underline">ס</Link>, <Link to="/speech/sounds/sh" className="font-bold underline">ש</Link> ו<Link to="/speech/sounds/l" className="font-bold underline">ל</Link>, ובמרכז <Link to="/speech" className="font-bold underline">קלינאות התקשורת</Link> יש עוד חומרים.</p>
    </Section>

    <div className="mt-12">
      <SeoBody
        paragraphs={[
          'התפתחות השפה מתחילה הרבה לפני המילה הראשונה: תינוקות מקשיבים, מחייכים, ממלמלים ומצביעים — וכל אלה הם צעדים בדרך לדיבור. בגיל שנתיים רוב הילדים כבר מצרפים מילים, בין שנתיים לשלוש מגיעים המשפטים הראשונים, ועד גיל 4 בערך רוב הדיבור מובן גם לאנשים זרים. בגילים 4–6 ילדים לומדים לספר סיפור, להסביר ולשחק בצלילים — יסודות חשובים לקריאה.',
          'העמוד מיועד להורים, לסבים ולסבתות ולצוותי גן שרוצים לדעת מה מצופה בכל גיל ומתי כדאי לשאול איש/אשת מקצוע. הוא אינו מחליף הערכה של קלינאי/ת תקשורת או מעקב התפתחותי בטיפת חלב.',
        ]}
        faq={faq}
        related={[
          { label: 'גיל רכישת הצלילים בעברית', href: '/speech/parents/sound-acquisition' },
          { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
          { label: 'התפתחות תינוק חודש אחרי חודש', href: '/family/baby-development' },
          { label: 'פעילויות לפעוטות', href: '/toddlers' },
          { label: 'חרוזים והברות — דפים להדפסה', href: '/printables/rhymes-syllables' },
          { label: 'צליל פותח וסוגר', href: '/letters/sounds' },
        ]} />
    </div>

    <Sources list={MILESTONE_SOURCES} />

    {printing && <PrintPreview title={printing === 'all' ? 'התפתחות שפה ודיבור — כל הגילים' : `התפתחות שפה ודיבור — ${bandById(printing).label}`} onClose={() => setPrinting(null)}>
      {printBands.map(b => <BandSheet key={b.id} band={b} />)}
    </PrintPreview>}
  </div>
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import PrintPreview from '../../../components/ui/PrintPreview'
import SpeakButton from '../../../components/ui/SpeakButton'
import SpeechNote from '../SpeechNote'
import { Section, Bullets, OnThisPage, SiblingNav, Sources } from './ParentParts'
import { AXIS, SOUND_GROUPS, SOUNDS, PROCESSES } from '../../../data/speech/soundAcquisition'
import { SOUND_SOURCES } from '../../../data/speech/parentSources'
import './speech-parents.css'
import { soundMeta } from '../../../data/speech/sounds.js'
// Link a sound only once its practice page exists (sounds are added one by one).
const live = s => Boolean(s.page && soundMeta(s.id))

// Parents' guide: at what age children say each Hebrew consonant — an RTL timeline of approximate
// ranges, the ר question (uvular is standard, trilled is an accent), typical simplifications on the way,
// lisps, when to consult, and a one-page printable table.

const PATH = '/speech/parents/sound-acquisition'
const TICKS = [2, 3, 4, 5, 6, 7]
const pct = age => ((age - AXIS.min) / (AXIS.max - AXIS.min)) * 100
const age = n => (Number.isInteger(n) ? String(n) : n.toFixed(1))
const rangeText = s => s.from <= 1.5 ? `עד גיל ${age(s.to)} בערך` : `בערך ${age(s.from)}–${age(s.to)}${s.late ? ` (לפעמים עד ${age(s.late)})` : ''}`

const faq = [
  { q: 'באיזה גיל ילדים אומרים ר?', a: 'רוב הילדים אומרים ר בסביבות גיל 3.5–4, ואצל חלקם זה לוקח עד 4.5 בערך. לפני כן נפוץ לשמוע ל או י במקום ר ("לכבת" במקום "רכבת"). אם אחרי גיל 4.5–5 בערך הילד עדיין לא אומר ר, אפשר להתייעץ עם קלינאי/ת תקשורת.' },
  { q: 'האם ר מתגלגלת היא שיבוש?', a: 'לא. בעברית הישראלית המקובלת ר נהגית בחלק האחורי של הפה (ר "גרונית"), אבל ר מתגלגלת בקצה הלשון היא מבטא לגיטימי — כך מדברים דוברים רבים, למשל בחלק מהמשפחות ממוצא מזרחי ובקרב עולים מארצות שונות. ילד שאומר ר כמו בני משפחתו אינו צריך תיקון.' },
  { q: 'באיזה גיל ילדים אומרים ש ו־ס?', a: 'השורקים (ס, ש, צ, ז) הם האחרונים להתייצב: אצל רוב הילדים עד גיל 5–6, ולפי חלק מהמקורות עד 7. עד אז נפוץ לשמוע ס במקום ש ("סמס" במקום "שמש") או הגייה עם הלשון בין השיניים.' },
  { q: 'הילד אומר "תף" במקום "כף". זה תקין?', a: 'החלפה של ק/כּ ב־ת (וגם ג ב־ד, "דמל" במקום "גמל") נקראת קדמה, והיא נפוצה מאוד בגילים הצעירים. אצל רוב הילדים היא נעלמת עד גיל 3.5–4 בערך. אם היא נמשכת אחרי גיל 4, או שהדיבור קשה להבנה, כדאי להתייעץ.' },
  { q: 'מתי שיבוש שיני (ליספ) הוא סיבה לפנות?', a: 'הגייה של ס, צ וז עם הלשון בין השיניים נפוצה עד גיל 4.5–5 בערך. אם היא נמשכת אחרי גיל 5–6, אפשר להתייעץ. שיבוש צדי — כשהאוויר יוצא מהצדדים והצליל נשמע "רטוב" — אינו חלק רגיל מההתפתחות, ולכן כדאי להתייעץ עליו מוקדם יותר.' },
  { q: 'האם תרגילי נשיפה או תרגילי לשון עוזרים להגיד צליל?', a: 'אין ראיות לכך שתרגילים מוטוריים של הפה שאינם דיבור (נשיפה בקשית, ליקוק, תרגילי לשון) משפרים היגוי. אפשר לשחק בהם בשביל הכיף, אבל תרגול של הצליל עצמו — בהנחיית קלינאי/ת תקשורת — הוא מה שעוזר.' },
  { q: 'למה הגילים שונים ממקור למקור?', a: 'כל מחקר מגדיר "גיל רכישה" אחרת — למשל הגיל שבו 75% או 90% מהילדים אומרים את הצליל — ובודק ילדים אחרים. לכן מציגים טווחים מעוגלים, וחשוב יותר הסדר הכללי ומידת המובנות של הדיבור מגיל מדויק של צליל בודד.' },
]

function Timeline() {
  return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-3 sm:p-5">
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-x-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
      <span className="text-sm font-bold text-[var(--muted-foreground)]">צליל</span>
      <div className="spk-axis" aria-hidden="true">{TICKS.map(t => <span key={t} style={{ insetInlineStart: `${pct(t)}%` }}>{t}</span>)}</div>
    </div>
    {SOUND_GROUPS.map(g => <div key={g.id} className="mt-3">
      <h3 className="mb-1 text-base font-black" style={{ color: g.color }}>{g.title} <span className="font-bold text-[var(--muted-foreground)]">· {g.range}</span></h3>
      <ol className="space-y-2">
        {SOUNDS.filter(s => s.group === g.id).map(s => <li key={s.id} className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-x-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-[2.6rem] text-xl font-black">{s.letters}</span>
            <span className="hidden truncate text-sm sm:inline">{s.example.emoji} {s.example.word}</span>
            {live(s) && <Link to={s.page} className="whitespace-nowrap rounded-full border border-[var(--border)] px-1.5 text-xs font-bold hover:bg-[var(--postit)]" aria-label={`תרגול הצליל ${s.letters}`}>תרגול</Link>}
          </div>
          <div>
            <div className="spk-bar-track" role="img" aria-label={`${s.letters}: ${rangeText(s)}`}>
              {s.late && <span className="spk-bar-late" style={{ background: g.color, insetInlineStart: `${pct(s.from)}%`, width: `${pct(s.late) - pct(s.from)}%` }} />}
              <span className="spk-bar" style={{ background: g.color, insetInlineStart: `${pct(s.from)}%`, width: `${pct(s.to) - pct(s.from)}%` }} />
            </div>
            <p className="m-0 mt-0.5 text-xs text-[var(--foreground)]/75">{rangeText(s)}</p>
          </div>
        </li>)}
      </ol>
    </div>)}
    <p className="mt-4 text-sm text-[var(--foreground)]/75">הפס הכהה: הטווח שבו רוב הילדים מתחילים לומר את הצליל במילים ועד שרובם אומרים אותו. הפס הבהיר: עד כמה חלק מהמקורות מאריכים את הטווח. ציר הגילים בשנים, מימין לשמאל.</p>
  </div>
}

function SoundTable() {
  return <div className="overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-white">
    <table className="w-full border-collapse text-right">
      <caption className="sr-only">טבלת גיל רכישת צלילים בעברית</caption>
      <thead><tr className="bg-[var(--muted)]/30"><th className="p-2">צליל</th><th className="p-2">דוגמה</th><th className="p-2">גיל משוער</th><th className="p-2">שיבוש נפוץ בדרך</th></tr></thead>
      <tbody>{SOUNDS.map(s => <tr key={s.id} className="border-t border-[var(--border)] align-top">
        <th scope="row" className="p-2 text-xl font-black whitespace-nowrap">{live(s) ? <Link to={s.page} className="underline">{s.letters}</Link> : s.letters}</th>
        <td className="p-2 whitespace-nowrap"><span aria-hidden="true">{s.example.emoji} </span>{s.example.word} <SpeakButton text={s.example.word} className="mr-1 align-middle" /></td>
        <td className="p-2">{rangeText(s)}</td>
        <td className="p-2 text-sm">{s.swaps ? s.swaps.map(w => <span key={w.said} className="block">"{w.said}" במקום "{w.target}"</span>) : '—'}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

function PrintSheet() {
  return <article className="buga-a4 spk-sheet" dir="rtl">
    <h2>🔤 באיזה גיל ילדים אומרים כל צליל בעברית?</h2>
    <p className="spk-sub">טווחים משוערים לפי מחקרים ישראליים וקופות החולים. ילדים שונים זה מזה — חשוב יותר הסדר הכללי ומידת המובנות מגיל מדויק.</p>
    <table>
      <thead><tr><th>צליל</th><th>דוגמה</th><th>גיל משוער</th><th>שיבוש נפוץ בדרך</th></tr></thead>
      <tbody>{SOUNDS.map(s => <tr key={s.id}>
        <td className="spk-letter">{s.letters}</td><td>{s.example.emoji} {s.example.word}</td><td>{rangeText(s)}</td>
        <td>{s.swaps ? s.swaps.map(w => `"${w.said}" במקום "${w.target}"`).join(' · ') : '—'}</td>
      </tr>)}</tbody>
    </table>
    <div className="spk-grid" style={{ marginTop: '3mm' }}>
      <div className="spk-box"><h3>ר גרונית או מתגלגלת?</h3><p style={{ margin: 0 }}>ר "גרונית" היא ההגייה המקובלת בעברית הישראלית. ר מתגלגלת היא מבטא לגיטימי ולא שיבוש.</p></div>
      <div className="spk-box spk-consult"><h3>כדאי להתייעץ אם…</h3><ul>
        <li>בגיל 3 גם המשפחה מתקשה להבין את רוב הדיבור</li>
        <li>אחרי גיל 4 עדיין "תף" במקום "כף" או "דמל" במקום "גמל"</li>
        <li>אחרי 4.5–5 עדיין ל או י במקום ר</li>
        <li>אחרי 5–6 שיבוש בשורקים, או שיבוש צדי בכל גיל</li>
        <li>הילד מתוסכל, נמנע מלדבר או שמעירים לו</li>
      </ul></div>
    </div>
    <p className="spk-foot">מקורות: בן־דוד, ד״ש ברשת 34 (2015); מאוחדת ומכבי — רכישת צלילים; ASHA. הדף אינו כלי אבחון. מומלץ לבדוק גם שמיעה. מתרגלים בבית במשחק, בלי לבקש מהילד "להגיד שוב".</p>
    <footer>עוגה בוגה · ugabuga.co.il{PATH}</footer>
  </article>
}

export default function SoundAcquisition() {
  const [printing, setPrinting] = useState(false)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="באיזה גיל ילדים אומרים כל צליל? גיל רכישת צלילים בעברית"
      description="גיל רכישת צלילים בעברית: באיזה גיל אומרים ר, ל, ק, ש וס — טבלה וציר זמן בטווחים, ר גרונית ומתגלגלת, שיבושים נפוצים בדרך ומתי כדאי להתייעץ. עם מקורות."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'גיל רכישת הצלילים' }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl"><span aria-hidden="true">🔤 </span>באיזה גיל ילדים אומרים כל צליל בעברית?</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-[var(--foreground)]/80">טבלה וציר זמן של גיל רכישת הצלילים — בטווחים, עם הסבר מתי זה חלק מהדרך ומתי כדאי להתייעץ</p>
    <SiblingNav path={PATH} />

    <QuickAnswer q="באיזה גיל ילדים אומרים ר, ש וס?"
      a="בערך: מ, נ, ב, פּ, ד ו־ת עד גיל 3; ל בסביבות 2.5–3; ק, ג ו־ח עד גיל 4; ר בסביבות 3.5–4; והשורקים ס, ש, צ ו־ז אחרונים — עד גיל 5–6, ולפעמים עד 7. אלה טווחים מעוגלים, וילדים שונים זה מזה."
      rows={[
        ['עד גיל 3 בערך', 'מ, נ, בּ, פּ, ד, ת/ט'],
        ['2.5–3', 'ל'],
        ['3–4', 'ק/כּ, ג, ח/כ'],
        ['3.5–4', 'ר (לפעמים עד 4.5)'],
        ['4–6, לפעמים עד 7', 'ס/שׂ, ש, צ, ז'],
      ]}
      updated="2026-10-24" />

    <SpeechNote className="mt-2" />

    <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-[var(--foreground)]/85">
      ילדים לא לומדים את כל הצלילים בבת אחת. קודם מגיעים צלילים שרואים איך אומרים אותם — בשפתיים ובקצה הלשון — ואחר כך צלילים שדורשים תנועות מדויקות יותר בחלק האחורי של הפה או זרם אוויר צר. הגילים כאן הם <b>טווחים משוערים</b>: מחקרים שונים מגדירים "גיל רכישה" אחרת, ולכן מספרים מעט שונים זה מזה. בטבלה הצלילים מסודרים לפי <b>הגייה</b> ולא לפי כתיב — ט ו־ת נשמעות אותו דבר, וכך גם ק ו־כּ, ח ו־כ, ס ו־שׂ.
    </p>

    <OnThisPage items={[['timeline', 'ציר זמן'], ['table', 'טבלה'], ['resh', 'ר גרונית ומתגלגלת'], ['processes', 'שיבושים נפוצים'], ['lisp', 'ליספ'], ['consult', 'מתי להתייעץ'], ['home', 'בבית'], ['sources', 'מקורות']]} />

    <Section id="timeline" title="ציר זמן: גיל רכישת הצלילים">
      <Timeline />
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => setPrinting(true)} className="min-h-[48px] rounded-xl bg-red-500 px-5 py-2 text-lg font-bold text-white">🖨️ טבלה להדפסה (דף אחד)</button>
      </div>
    </Section>

    <Section id="table" title="טבלת גיל רכישת צלילים בעברית" intro="לחיצה על 🔊 משמיעה את המילה לדוגמה. לצלילים שיש להם עמוד תרגול — הצליל עצמו הוא קישור.">
      <SoundTable />
    </Section>

    <Section id="resh" title="ר גרונית ור מתגלגלת — שתיהן בסדר">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
        <p>בעברית הישראלית המקובלת ר נהגית בחלק האחורי של הפה, ליד הענבל — מה שמכונה בשפת היומיום "ר גרונית". זו ההגייה שרוב הילדים בישראל לומדים, ובה הם מתרגלים כשיש צורך.</p>
        <p className="mt-2">ר מתגלגלת, שנהגית בקצה הלשון, היא <b>מבטא לגיטימי</b> ולא שיבוש. כך מדברים דוברים רבים — למשל בחלק מהמשפחות ממוצא מזרחי ובקרב עולים מארצות שונות. ילד שאומר ר מתגלגלת כמו הוריו או סביו אינו צריך תיקון. כך גם ח ו־ע לועיות: הן חלק ממבטא, לא טעות.</p>
        <p className="mt-2">מה שכן כדאי לשים לב אליו: אם אחרי גיל 4.5–5 בערך הילד עדיין אומר ל או י במקום ר ("לכבת", "יכבת"), או משמיט אותה. אז אפשר להתייעץ — וב<Link to="/speech/sounds/r" className="font-bold underline">עמוד התרגול של הצליל ר</Link> יש מילים ומשחקים לבית.</p>
      </div>
    </Section>

    <Section id="processes" title="שיבושים נפוצים בדרך" intro={'בדרך לדיבור "של גדולים" ילדים מפשטים מילים בדרכים קבועות וצפויות. אלה חלק רגיל מההתפתחות כל עוד הם נעלמים בהדרגה בגילים המתאימים:'}>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROCESSES.map(p => <article key={p.name} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-lg font-black">{p.name}</h3>
          <p className="mt-1">{p.example}</p>
          <p className="mt-1 text-sm text-[var(--foreground)]/75">{p.fades}</p>
        </article>)}
      </div>
    </Section>

    <Section id="lisp" title="ליספ: שיבוש שיני ושיבוש צדי">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
          <h3 className="text-lg font-black">שיבוש שיני (הלשון בין השיניים)</h3>
          <p className="mt-1">הלשון יוצאת מעט בין השיניים בזמן ס, צ או ז, והצליל נשמע קרוב ל־th באנגלית. זה נפוץ מאוד אצל ילדים צעירים ובדרך כלל חולף עד גיל 4.5–5 בערך. אם הוא נמשך אחרי גיל 5–6, אפשר להתייעץ.</p>
        </article>
        <article className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4 leading-relaxed">
          <h3 className="text-lg font-black">שיבוש צדי</h3>
          <p className="mt-1">האוויר יוצא מהצדדים של הפה, והצליל נשמע "רטוב" או שורק בצורה לא רגילה (בעיקר בס, ש, צ). זה אינו שלב רגיל בהתפתחות ובדרך כלל לא חולף לבד, ולכן כדאי להתייעץ עליו מוקדם — אפשר כבר מגיל 4 בערך.</p>
        </article>
      </div>
      <p className="mt-3 text-sm text-[var(--foreground)]/75">ב<Link to="/speech/sounds/s" className="font-bold underline">עמוד הצליל ס</Link> וב<Link to="/speech/sounds/sh" className="font-bold underline">עמוד הצליל ש</Link> יש מילים לתרגול לפי מיקום הצליל במילה.</p>
    </Section>

    <Section id="consult" title="מתי כדאי להתייעץ עם קלינאי/ת תקשורת?">
      <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4">
        <Bullets items={[
          'בגיל 3 בערך גם בני המשפחה מתקשים להבין את רוב מה שהילד אומר',
          'מגיל 3–4 אנשים זרים מתקשים להבין את רוב הדיבור',
          'צלילים מוקדמים (מ, ב, ד, נ, ת) חסרים או מוחלפים אחרי גיל 3 בערך',
          'קדמה ("תף" במקום "כף") נמשכת אחרי גיל 4',
          'ר מוחלפת ב־ל או ב־י אחרי גיל 4.5–5 בערך',
          'שיבוש בשורקים אחרי גיל 5–6, או שיבוש צדי בכל גיל',
          'הילד מתוסכל, נמנע מלדבר או שילדים אחרים מעירים לו',
        ]} />
        <p className="mt-3 leading-relaxed">קלינאי/ת תקשורת מסתכל/ת על התמונה כולה — כמה הדיבור מובן, אילו דפוסים חוזרים, ואיך הילד מבין ומשתמש בשפה — ולא רק על צליל אחד. כשיש קושי בהיגוי כדאי לבדוק גם שמיעה. אפשר לפנות דרך רופא/ת הילדים או טיפת חלב, או ישירות לקלינאי/ת תקשורת.</p>
      </div>
    </Section>

    <Section id="home" title="איך עוזרים בבית — בלי לחץ">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <Bullets items={[
          'חוזרים על המילה נכון, בטבעיות, בלי לבקש מהילד להגיד שוב: "תף?" → "כן, כף. הנה הכף שלך"',
          'מדגישים מעט את הצליל במילים שאתם אומרים, בתוך שיחה רגילה ומשחק',
          'משחקים בצלילים: מחפשים בבית דברים שמתחילים בצליל, ממציאים חרוזים, מוחאים כפיים להברות',
          'מקשיבים קודם כול למה שהילד מספר — לא רק לאיך שהוא אומר את זה',
          'אם הילד כבר בטיפול, מתרגלים לפי ההנחיות של הקלינאית — קצר, משחקי ובהצלחה',
        ]} />
        <p className="mt-3 rounded-xl bg-[var(--postit)] p-3 text-sm leading-relaxed">תרגילי נשיפה, ליקוק או "התעמלות לשון" אינם מחליפים תרגול של הצליל עצמו: אין ראיות שהם משפרים היגוי. אפשר לשחק בבועות סבון בשביל הכיף — אבל לא כטיפול.</p>
      </div>
    </Section>

    <div className="mt-12">
      <SeoBody
        paragraphs={[
          'הורים רבים שואלים באיזה גיל ילד אומר ר, מתי הוא יפסיק לומר "תף" במקום "כף" ואם ס במקום ש זה תקין. התשובה הקצרה: יש סדר כללי, ויש שונות גדולה בין ילדים. הצלילים המוקדמים מגיעים עד גיל 3 בערך, ל ור בין 3 ל־4, והשורקים אחרונים — עד גיל 5–6 ולפעמים 7.',
          'בעמוד יש ציר זמן וטבלה של גיל רכישת הצלילים בעברית, שיבושים נפוצים בדרך, הסבר על ר גרונית ומתגלגלת ועל ליספ, ומתי כדאי לפנות לקלינאי/ת תקשורת. אפשר להדפיס טבלה של עמוד אחד ולהביא אותה לגננת או לטיפת חלב.',
        ]}
        faq={faq}
        related={[
          { label: 'התפתחות שפה ודיבור לפי גיל', href: '/speech/parents/language-milestones' },
          { label: 'תרגול הצליל ר', href: '/speech/sounds/r' },
          { label: 'תרגול הצליל ס', href: '/speech/sounds/s' },
          { label: 'תרגול הצליל ש', href: '/speech/sounds/sh' },
          { label: 'תרגול הצליל ל', href: '/speech/sounds/l' },
          { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
          { label: 'צליל פותח וסוגר', href: '/letters/sounds' },
        ]} />
    </div>

    <Sources list={SOUND_SOURCES} />

    {printing && <PrintPreview title="גיל רכישת הצלילים בעברית" onClose={() => setPrinting(false)}><PrintSheet /></PrintPreview>}
  </div>
}

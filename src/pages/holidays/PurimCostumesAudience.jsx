import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HolidayShell from '../../components/holidays/HolidayShell'
import { PURIM_H } from '../../holidays/purim'
import { AUDIENCE_PAGES, BABY_SAFETY, KIND_TITLES } from '../../data/purimCostumesAudience'

// /holidays/purim/costumes/{babies,adults,women} — one component, three audiences.
// Ideas are original and homemade; the bottom checklist is the printable "choose your costume" sheet.
const base = PURIM_H.base

const COPY = {
  babies: {
    crumb: 'תחפושות לתינוקות',
    emoji: '🍼',
    h1: 'תחפושות לפורים לתינוקות ולפעוטות',
    title: 'תחפושות לפורים לתינוקות — {n} רעיונות נוחים ובטוחים',
    description: '{n} רעיונות לתחפושת תינוק לפורים שאפשר להכין בבית: בד רך, בלי חלקים קטנים ובלי שום דבר על הפנים. חומרים, שלבים וכללי בטיחות.',
    lead: 'תינוק לא צריך תחפושת מרשימה — הוא צריך להיות נוח. כל הרעיונות כאן מתחילים בבגד גוף רגיל ומוסיפים פריט אחד רך ותפור: כובע, אוזניים או סינר.',
    faq: [
      { q: 'איזו תחפושת הכי מתאימה לתינוק בן חצי שנה?', a: 'בגד גוף בצבע אחד עם כובע כותנה רך ופרט אחד תפור — אוזניים או מקור שטוח. עדיף משהו שאפשר לשכב עליו בנוחות, בלי זנב ארוך ובלי חלקים שבולטים.' },
      { q: 'מה צריך לבדוק כדי שתחפושת תינוק תהיה בטוחה?', a: 'שאין חלקים קטנים שאפשר לבלוע, שום דבר סביב הצוואר, כובע שנקשר מתחת לסנטר או מסכה שמכסה את הפנים. בודקים שכל הקישוטים תפורים חזק, ומושכים כדי לוודא.' },
      { q: 'האם אפשר להשתמש באיפור על תינוקות?', a: 'עדיף לוותר. עור של תינוק עדין, והוא מכניס הכול לפה. כל הצבע עובר לבגד.' },
      { q: 'כמה זמן מותר להשאיר תחפושת על תינוק?', a: 'כל עוד הוא נוח. אם הוא מתעצבן, חם לו או נרדם — מורידים. אפשר להלביש רק לצילום ולמסיבה קצרה.' },
    ],
  },
  adults: {
    crumb: 'תחפושות למבוגרים',
    emoji: '🧑',
    h1: 'תחפושות לפורים למבוגרים — לבד, בזוג ובקבוצה',
    title: 'תחפושות לפורים למבוגרים — {n} רעיונות לזוגות, משפחה וצוות',
    description: '{n} רעיונות מקוריים לתחפושות מבוגרים לפורים: תחפושות זוגיות, תחפושות משפחתיות ותחפושות קבוצתיות לצוות העבודה. חומרים, שלבים וטיפים.',
    lead: 'תחפושת מבוגרים טובה מבוססת על בגדים שכבר יש בארון ועל פריט אחד שמסמן את הדמות. הנה רעיונות לבד, תחפושות זוגיות, ותחפושות לכל המשפחה או לצוות העבודה.',
    faq: [
      { q: 'איזו תחפושת זוגית קלה להכנה?', a: 'שני אנשים שמשלימים זה את זה: קפה וקרואסון, שף ואורח, דייג ודג. כל אחד לובש בגדים שיש לו ומוסיף פריט אחד מקרטון.' },
      { q: 'איך מתחפשים כצוות בלי מאמץ?', a: 'בוחרים רעיון אחד — מסעדה, קשת, קרקס, רכבת — ומחלקים תפקידים. כל אחד מכין פריט אחד בבית, ובאים להצטלם יחד.' },
      { q: 'מה עושים כשאין זמן לתחפושת?', a: 'מוסיפים לבגדים שיש בארון פריט אחד מזוהה: כובע או שלט. דוור, מציל או מנהל עבודה לוקחים רבע שעה.' },
      { q: 'איך מתחפשים בקבוצה כשחלק לא רוצים להשקיע?', a: 'בוחרים נושא שמאפשר "רמות": מי שרוצה בונה גלימה, ומי שלא רק לובש צבע אחד ונושא שלט.' },
    ],
  },
  women: {
    crumb: 'תחפושות לנשים',
    emoji: '💃',
    h1: 'תחפושות לפורים לנשים — רעיונות מקוריים בבית',
    title: 'תחפושות לפורים לנשים — {n} רעיונות ביתיים וקלים',
    description: '{n} רעיונות לתחפושות נשים לפורים: שנות ה־70, ה־80 וה־20, קוסמת, בריסטה, ספרנית, וגם תחפושות לחברות. חומרים, שלבים וטיפים להכנה בבית.',
    lead: 'תחפושת לאישה יכולה להיות אלגנטית, מצחיקה או רטרו — ואפשר להכין אותה מבגדים שבארון. בחרו משהו נוח, כזה שאפשר לרקוד בו.',
    faq: [
      { q: 'איזו תחפושת לנשים נוחה לריקודים?', a: 'אירובי משנות ה־80, היפית משנות ה־70 או גינת פרחים: בגדים רחבים, נעליים שטוחות ואביזר אחד בראש.' },
      { q: 'מה מתאים לחברות שרוצות להתחפש יחד?', a: 'ארבע חברות קלפים, חברות תבלינים או קופסת שוקולדים — כל אחת פריט אחד, וביחד זה שלם.' },
      { q: 'איך מתחפשים כשיש רק רבע שעה?', a: 'בריסטה, ספרנית או מגישת חדשות: בגדים רגילים ואביזר אחד, ותחפושת מוכנה.' },
      { q: 'איך מוצאים תחפושת שאינה יקרה?', a: 'פותחים את הארון: חולצה גדולה, צעיף, כובע. כל הרעיונות כאן מבוססים על בגדים קיימים ועל קרטון.' },
    ],
  },
}

function Card({ it, checked, onToggle }) {
  return <article className="wobbly-sm flex flex-col border-2 border-[var(--border)] bg-white p-4">
    <h3 className="mb-1 text-xl font-bold"><span aria-hidden="true" className="text-2xl">{it.emoji} </span>{it.name}</h3>
    <p className="text-[var(--muted-foreground)]">{it.desc}</p>
    <details className="mt-3 rounded-xl bg-[var(--postit)] px-3">
      <summary className="flex min-h-[44px] cursor-pointer items-center font-bold">✂️ מה צריך ואיך מכינים</summary>
      <p className="mt-1 font-bold">צריך:</p>
      <ul className="list-disc pr-5">{it.materials.map(m => <li key={m}>{m}</li>)}</ul>
      <p className="mt-2 font-bold">שלבים:</p>
      <ol className="list-decimal pr-5">{it.steps.map(s => <li key={s}>{s}</li>)}</ol>
      <p className="mt-2 pb-3"><b>💡 טיפ:</b> {it.tip}</p>
    </details>
    <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-2 font-bold">
      <input type="checkbox" className="h-5 w-5" checked={checked} onChange={() => onToggle(it.id)} />
      בוחרים אותה לדף הבחירה
    </label>
  </article>
}

export default function PurimCostumesAudience({ audience }) {
  const page = AUDIENCE_PAGES.find(p => p.slug === audience)
  const copy = COPY[audience]
  const ideas = page.ideas
  const n = ideas.length
  const [picked, setPicked] = useState([])
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const chosen = ideas.filter(i => picked.includes(i.id))
  const kinds = Object.keys(KIND_TITLES).map(k => [k, ideas.filter(i => i.kind === k)]).filter(([, items]) => items.length)
  const materials = [...new Set(chosen.flatMap(i => i.materials))]

  return (
    <HolidayShell h={PURIM_H} crumb={copy.crumb}>
      <SEO title={copy.title.replace('{n}', n)} description={copy.description.replace('{n}', n)}
        path={`${base}/costumes/${audience}`} structuredData={faqSchema(copy.faq)} />
      <div className="print:hidden">
        <h1 className="mb-2 text-center text-4xl sm:text-5xl">{copy.emoji} {copy.h1}</h1>
        <p className="mx-auto mb-6 max-w-3xl text-center text-lg text-[var(--muted-foreground)]">{copy.lead}</p>

        <nav aria-label="תחפושות לפי קהל" className="mb-6 flex flex-wrap justify-center gap-2">
          {AUDIENCE_PAGES.map(p => <Link key={p.slug} to={`${base}/costumes/${p.slug}`} aria-current={p.slug === audience ? 'page' : undefined}
            className={`min-h-[44px] rounded-full border-2 px-4 py-2 font-bold ${p.slug === audience ? 'border-slate-800 bg-purple-200' : 'border-[var(--border)] bg-white'}`}>{p.emoji} {p.label}</Link>)}
          <Link to={`${base}/costumes`} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">👑 כל הרעיונות</Link>
        </nav>

        {audience === 'babies' && <section aria-labelledby="safety" className="mb-8 rounded-3xl border-2 border-amber-400 bg-amber-50 p-4">
          <h2 id="safety" className="mb-2 text-2xl font-bold">🛟 כללי בטיחות לתחפושת תינוק</h2>
          <ul className="list-disc space-y-1 pr-5 text-lg">{BABY_SAFETY.map(s => <li key={s}>{s}</li>)}</ul>
        </section>}

        {kinds.map(([k, items]) => <section key={k} className="mb-8">
          <h2 className="mb-3 text-3xl font-bold">{KIND_TITLES[k]} <span className="text-lg font-normal text-[var(--muted-foreground)]">({items.length})</span></h2>
          <div className="grid gap-3 sm:grid-cols-2">{items.map(it => <Card key={it.id} it={it} checked={picked.includes(it.id)} onToggle={toggle} />)}</div>
        </section>)}
      </div>

      <section aria-labelledby="sheet" className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-4 sm:p-6">
        <h2 id="sheet" className="mb-1 text-3xl font-bold">📝 דף "בוחרים תחפושת" להדפסה</h2>
        <p className="mb-3 text-[var(--muted-foreground)] print:hidden">מסמנים למעלה את הרעיונות שאהבתם (או כאן), ואז מדפיסים: מקבלים רשימת תחפושות וחומרים עם משבצות סימון.</p>
        <p className="mb-2 font-bold">שם: ____________________ &nbsp; תאריך הפורים: ____________</p>
        <h3 className="mb-1 mt-3 text-xl font-bold">הרעיונות שלי</h3>
        <ul className="mb-3 grid gap-1 sm:grid-cols-2">
          {ideas.map(i => <li key={i.id}><label className="flex min-h-[44px] cursor-pointer items-center gap-2 print:min-h-0">
            <input type="checkbox" className="h-5 w-5" checked={picked.includes(i.id)} onChange={() => toggle(i.id)} />
            <span>{i.emoji} {i.name}</span></label></li>)}
        </ul>
        <h3 className="mb-1 text-xl font-bold">מה יש לי בבית ומה חסר</h3>
        {chosen.length === 0
          ? <p className="mb-3 text-[var(--muted-foreground)]">סמנו רעיון אחד או יותר כדי לראות רשימת חומרים.</p>
          : <ul className="mb-3 grid gap-1 sm:grid-cols-2">{materials.map(m => <li key={m} className="flex items-center gap-2"><span aria-hidden="true">☐</span>{m}</li>)}</ul>}
        <h3 className="mb-1 text-xl font-bold">לפני שמחליטים</h3>
        <ul className="mb-3 space-y-1">
          {['הילד או המבוגר בחר בעצמו ואוהב את הרעיון', 'התחפושת נוחה לזוז, לשבת ולרקוד בה', 'מתאימה למזג האוויר ולמקום', 'אין חלקים שנופלים או חדים', 'הכול מוכן יום לפני'].map(t => <li key={t} className="flex items-center gap-2"><span aria-hidden="true">☐</span>{t}</li>)}
        </ul>
        <p className="mb-1 font-bold">הערות:</p>
        <div className="h-16 border-b-2 border-dashed border-slate-400" /><div className="h-8 border-b-2 border-dashed border-slate-400" />
        <button type="button" onClick={() => window.print()} className="mt-4 min-h-[44px] rounded-full bg-purple-700 px-5 font-bold text-white print:hidden">🖨️ להדפסה</button>
      </section>

      <div className="print:hidden">
        <SeoBody paragraphs={[
          copy.lead,
          `בעמוד הזה ${n} רעיונות מקוריים, ולכל אחד רשימת חומרים, שלבי הכנה וטיפ. בסוף יש דף בחירה להדפסה עם רשימת חומרים לפי הרעיונות שסימנתם.`,
          'אין כאן דמויות מוכרות מסרטים ומסדרות — רק רעיונות פשוטים שאפשר לבנות מבגדים, בד וקרטון, ולשנות לפי מה שיש בבית.',
        ]} faq={copy.faq} related={[
          { label: 'כל רעיונות התחפושות לפורים', href: `${base}/costumes` },
          ...AUDIENCE_PAGES.filter(p => p.slug !== audience).map(p => ({ label: `תחפושות ${p.label}`, href: `${base}/costumes/${p.slug}` })),
          { label: 'מסכות לפורים להדפסה', href: '/printables/purim-masks' },
        ]} />
      </div>
    </HolidayShell>
  )
}

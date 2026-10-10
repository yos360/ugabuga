import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PARASHOT, MEANINGS } from '../../data/barMitzvah'
import { buildSpeech, parashaByKey, readingMinutes } from '../../utils/barMitzvah'
import { crumbs, SpokeNav, GenderChips, Chip, inputCls, store } from './shared'

const PATH = '/bar-mitzvah/speech'
const KEY = 'buga-mitzvah-speech'

const FAQ = [
  { q: 'כמה זמן צריכה להיות דרשה לבר מצווה?', a: 'שלוש עד חמש דקות זה אורך טוב — בערך עמוד אחד. אורחים מקשיבים הכי טוב לנאום קצר, אישי וברור. הטיוטה כאן מציגה הערכה של זמן ההקראה, כדי שתדעו אם לקצר.' },
  { q: 'מה ההבדל בין דרשה לנאום בבת מצווה?', a: 'דרשה (או דבר תורה) נאמרת בדרך כלל בבית הכנסת או בסעודה, ומתחילה ברעיון מפרשת השבוע. נאום במסיבה קליל יותר: קצת על עצמי, תודות ומשפט סיום. במחולל אפשר לבחור את הסגנון, ובשניהם אפשר לשלב רעיון מהפרשה.' },
  { q: 'האם ההורים צריכים לכתוב את הנאום?', a: 'עדיף שלא. נאום שנשמע כמו הילד או הילדה תמיד מרגש יותר מנאום מושלם. ההורים יכולים לשאול שאלות, לעזור לבחור רעיון ולהקשיב לחזרות — אבל המילים צריכות להיות של בני המצווה. בדיוק בשביל זה המחולל שואל שאלות ולא כותב במקומם.' },
  { q: 'איך מתגברים על פחד לדבר מול קהל?', a: 'מתאמנים בקול רם, כמה פעמים, מול המשפחה. מדפיסים בגופן גדול עם רווחים, ומסמנים איפה לעצור לנשום. מותר להקריא מהדף, ומותר להתרגש — האורחים באו בשבילכם ומחכים לשמוע אתכם.' },
]

const RELATED = [
  { label: 'מחשבון תאריך ופרשה', href: '/bar-mitzvah/date' },
  { label: 'ברכות לבר מצווה', href: '/greetings/bar-mitzvah' },
  { label: 'ברכות לבת מצווה', href: '/greetings/bat-mitzvah' },
]

const EMPTY = { name: '', gender: 'boy', style: 'shul', parasha: '', parashaIdea: '', parashaLink: '', words: '', hobbies: '', proud: '', funny: '', meanings: [], project: '', parents: '', siblings: '', grandparents: '', others: '', wish: '' }

function Field({ label, hint, ...props }) {
  const Tag = props.rows ? 'textarea' : 'input'
  return (
    <label className="block font-bold">
      {label}
      {hint && <span className="block text-sm font-normal text-[var(--muted-foreground)]">{hint}</span>}
      <Tag {...props} className={inputCls} />
    </label>
  )
}

export default function MitzvahSpeech() {
  const [params] = useSearchParams()
  const [a, setA] = useState(() => {
    const saved = store.get(KEY, null)
    const base = saved?.a ? { ...EMPTY, ...saved.a } : EMPTY
    const p = params.get('parasha')
    return parashaByKey(p) ? { ...base, parasha: p } : base
  })
  const [edits, setEdits] = useState(() => store.get(KEY, null)?.edits || {})
  const [variant, setVariant] = useState(0)
  const [print, setPrint] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => { store.set(KEY, { a, edits }) }, [a, edits])

  const set = patch => setA(x => ({ ...x, ...patch }))
  const bind = k => ({ value: a[k], onChange: e => set({ [k]: e.target.value }) })
  const boy = a.gender !== 'girl'
  const g = (m, f) => boy ? m : f
  const p = parashaByKey(a.parasha)

  const sections = useMemo(() => buildSpeech(a, variant), [a, variant])
  const text = s => edits[s.id] ?? s.text
  const full = sections.map(text).filter(Boolean).join('\n\n')
  const minutes = readingMinutes(full)
  const title = `${g('דרשה לבר המצווה', 'נאום לבת המצווה')}${a.name.trim() ? ' של ' + a.name.trim() : ''}`

  const toggleMeaning = id => set({ meanings: a.meanings.includes(id) ? a.meanings.filter(x => x !== id) : [...a.meanings, id] })
  const copy = () => navigator.clipboard?.writeText(full).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }).catch(() => {})
  const reset = () => { if (confirm('למחוק את כל התשובות והעריכות ולהתחיל מחדש?')) { setA(EMPTY); setEdits({}) } }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="דרשה לבר מצווה ונאום לבת מצווה — מחולל טיוטה אישית" description="מחולל דרשה לבר מצווה ונאום לבת מצווה: עונים על כמה שאלות — מי אני, תחביבים, רעיון מהפרשה ותודות — ומקבלים טיוטה אישית בעברית, לעריכה ולהדפסה. חינם." path={PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs('דרשה ונאום')} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">🎤 </span>דרשה לבר מצווה ונאום לבת מצווה</h1>
      <p className="mx-auto mb-6 max-w-3xl text-center text-lg text-[var(--muted-foreground)]">לא יודעים איך להתחיל דרשה לבר מצווה או נאום לבת מצווה? עונים על השאלות — הכי טוב שבני המצווה יענו בעצמם — ומקבלים טיוטה מסודרת: פתיחה, דבר תורה, קצת עליי, תודות וסיום. אחר כך עורכים כל חלק במילים שלכם ומדפיסים.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-5" onSubmit={e => e.preventDefault()} aria-label="שאלות לנאום">
          <fieldset className="ln-box space-y-3">
            <legend className="px-2 text-xl font-bold">1. מי מדבר/ת?</legend>
            <Field label="השם שלי" {...bind('name')} maxLength={40} autoComplete="off" />
            <GenderChips gender={a.gender} setGender={gender => set({ gender })} />
            <div className="flex flex-wrap gap-2" role="group" aria-label="סגנון">
              <Chip on={a.style === 'shul'} onClick={() => set({ style: 'shul' })}>📖 דרשה (בית כנסת / סעודה)</Chip>
              <Chip on={a.style === 'party'} onClick={() => set({ style: 'party' })}>🎉 נאום במסיבה</Chip>
            </div>
          </fieldset>

          <fieldset className="ln-box space-y-3">
            <legend className="px-2 text-xl font-bold">2. הפרשה</legend>
            <label className="block font-bold">
              פרשת השבוע של {g('בר המצווה', 'בת המצווה')}
              <select value={a.parasha} onChange={e => set({ parasha: e.target.value })} className={inputCls}>
                <option value="">בלי פרשה / עוד לא יודעים</option>
                {PARASHOT.map(x => <option key={x.key} value={x.key}>{x.title}</option>)}
              </select>
            </label>
            {p && <div className="rounded-xl bg-[var(--postit)] p-3 text-sm leading-relaxed">
              <p className="m-0"><strong>על מה הפרשה:</strong> {p.about}.</p>
              <p className="m-0 mt-1"><strong>רעיון:</strong> {p.idea}.</p>
              {!a.parashaIdea && <button type="button" className="mt-2 font-bold underline" onClick={() => set({ parashaIdea: p.idea })}>להשתמש ברעיון הזה ולערוך אותו</button>}
            </div>}
            <Field label="מה תפס אותי בפרשה?" hint="במילים שלכם. אפשר להתחיל מהרעיון המוצע ולשנות." rows={3} {...bind('parashaIdea')} maxLength={500} />
            <Field label="איך זה קשור אליי?" hint={g('למשל: "גם אני צריך לפעמים אומץ להגיד מה אני חושב"', 'למשל: "גם אני צריכה לפעמים אומץ להגיד מה אני חושבת"')} rows={2} {...bind('parashaLink')} maxLength={400} />
          </fieldset>

          <fieldset className="ln-box space-y-3">
            <legend className="px-2 text-xl font-bold">3. קצת עליי</legend>
            <Field label="שלוש מילים שמתארות אותי" hint='למשל: "סקרן, מצחיק ועקשן"' {...bind('words')} maxLength={80} />
            <Field label={g('מה אני הכי אוהב לעשות?', 'מה אני הכי אוהבת לעשות?')} hint="מתחילים בפועל: לשחק, לצייר, לבשל…" {...bind('hobbies')} maxLength={160} />
            <Field label="רגע שאני גאה בו" rows={2} {...bind('proud')} maxLength={300} />
            <Field label="משהו מצחיק שכולם יודעים עליי (לא חובה)" rows={2} {...bind('funny')} maxLength={300} />
          </fieldset>

          <fieldset className="ln-box space-y-3">
            <legend className="px-2 text-xl font-bold">4. מה {g('בר המצווה', 'בת המצווה')} אומרת לי</legend>
            <div className="flex flex-wrap gap-2">
              {MEANINGS.map(m => <Chip key={m.id} on={a.meanings.includes(m.id)} onClick={() => toggleMeaning(m.id)}>{g(m.m, m.f)}</Chip>)}
            </div>
            <Field label="פרויקט שעשיתי לקראת היום (לא חובה)" rows={2} {...bind('project')} maxLength={300} />
          </fieldset>

          <fieldset className="ln-box space-y-3">
            <legend className="px-2 text-xl font-bold">5. תודות וסיום</legend>
            <Field label="ההורים" hint='למשל: "אמא ואבא"' {...bind('parents')} maxLength={80} />
            <Field label="אחים ואחיות" hint='למשל: "יואב ומיקה"' {...bind('siblings')} maxLength={80} />
            <Field label="סבים וסבתות" hint='למשל: "סבא משה וסבתא רותי"' {...bind('grandparents')} maxLength={120} />
            <Field label="עוד מישהו מיוחד" hint='למשל: "המורה שלי לקריאה בתורה, שהיה סבלני איתי"' {...bind('others')} maxLength={200} />
            <Field label="משאלה לעתיד" hint='מתחילים ב"ש": "שאמשיך לשאול שאלות"' {...bind('wish')} maxLength={200} />
          </fieldset>
        </form>

        <section className="lg:sticky lg:top-4 lg:self-start" aria-labelledby="draft">
          <div className="ln-box">
            <h2 id="draft" className="m-0 text-2xl font-bold">📝 הטיוטה שלי</h2>
            <p className="m-0 mb-3 text-sm text-[var(--muted-foreground)]">כ־{minutes} {minutes === 1 ? 'דקה' : 'דקות'} הקראה · אפשר לערוך כל חלק ישירות</p>
            <div className="space-y-3">
              {sections.map(s => (
                <label key={s.id} className="block">
                  <span className="flex items-center justify-between font-bold">{s.title}{edits[s.id] != null && <button type="button" className="text-sm font-normal underline" onClick={() => setEdits(e => { const n = { ...e }; delete n[s.id]; return n })}>חזרה לנוסח שנוצר</button>}</span>
                  <textarea value={text(s)} onChange={e => setEdits(x => ({ ...x, [s.id]: e.target.value }))} rows={Math.max(3, Math.ceil(text(s).length / 55))} className={inputCls + ' leading-relaxed'} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="ln-btn" onClick={() => setPrint(true)}>🖨️ הדפסה</button>
              <button type="button" className="ln-btn alt" onClick={copy}>{copied ? '✓ הועתק' : '📋 העתקה'}</button>
              <button type="button" className="ln-btn alt" onClick={() => setVariant(v => v + 1)}>🔄 פתיחה וסיום אחרים</button>
            </div>
            <button type="button" className="mt-3 text-sm underline" onClick={reset}>להתחיל מחדש</button>
          </div>
        </section>
      </div>

      {print && <PrintPreview title={title} onClose={() => setPrint(false)}>
        <article className="buga-flow" dir="rtl">
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, margin: '0 0 16px' }}>{title}</h2>
          {sections.map(s => text(s).trim() && <p key={s.id} style={{ fontSize: 20, lineHeight: 1.9, margin: '0 0 18px', whiteSpace: 'pre-line' }}>{text(s)}</p>)}
        </article>
      </PrintPreview>}

      <div className="mx-auto mt-10 max-w-3xl">
        <SeoBody
          paragraphs={[
            'איך כותבים דרשה לבר מצווה? מתחילים מהפרשה: בוחרים רעיון אחד, קטן וברור, ומחברים אותו למשהו מהחיים שלכם. אחר כך מספרים קצת על עצמכם, אומרים מה הגיל הזה אומר לכם, מודים לאנשים שחשובים לכם ומסיימים במשאלה. זה המבנה שהמחולל בונה — וכל חלק נשאר פתוח לעריכה.',
            'הרעיונות לכל פרשה כתובים בשפה פשוטה, כנקודת פתיחה. כדאי לקרוא את הפרשה עצמה, לשאול את ההורים, את הסבים או את המורה מה הם רואים בה, ולבחור את מה שבאמת מדבר אליכם. נאום אישי, גם אם הוא קצר, נשאר בזיכרון הרבה יותר מנאום ארוך ומליצי.',
            'לבת מצווה יש חופש רב: דבר תורה, נאום אישי, מכתב להורים או סיפור על הפרויקט — הכול מתאים. במסיבה עדיף נאום קליל של שתיים־שלוש דקות, ובבית הכנסת או בסעודה אפשר להאריך מעט ולהעמיק בפרשה.',
          ]}
          faq={FAQ}
          related={RELATED}
        />
      </div>
      <SpokeNav current={PATH} />
    </div>
  )
}

import { HANUKKAH_TEST } from '../../data/hanukkahLearn'

// Printable sheets for the Hanukkah summaries (inside PrintPreview, one .buga-flow per sheet):
// the summary itself, a worksheet + answer page per topic, and the test on the Hanukkah story.
const H1 = ({ children }) => <h1 style={{ fontSize: '22pt', fontWeight: 900, margin: '0 0 6px', textAlign: 'center' }}>{children}</h1>
const H2 = ({ children }) => <h2 style={{ fontSize: '14pt', fontWeight: 800, margin: '12px 0 4px' }}>{children}</h2>
const Lines = ({ n = 2 }) => <div>{Array.from({ length: n }, (_, i) => <div key={i} style={{ borderBottom: '1px solid #999', height: '26px' }} />)}</div>
const NameRow = () => <p style={{ display: 'flex', gap: '24px', margin: '0 0 10px' }}><span>שם: ____________________</span><span>כיתה: ______</span><span>תאריך: ________</span></p>
const LETTERS = 'אבגדהוזחטי'
// Fixed shuffles (no randomness: the printed sheet and its answer page must match). Rotating by one
// moves every meaning away from its word; the events of the test get a hand-picked order.
const mix = list => [...list.slice(1), list[0]]
const ORDER_PICK = [3, 0, 5, 2, 4, 1]

export function SummarySheet({ t }) {
  return <article className="buga-flow" dir="rtl">
    <H1>{t.emoji} {t.title}</H1>
    <p style={{ fontSize: '12.5pt', fontWeight: 600, background: '#fef3c7', padding: '8px 10px', borderRadius: '8px' }}>{t.short}</p>
    {t.sections.map(([title, body]) => <section key={title}>
      <H2>{title}</H2>
      {Array.isArray(body) ? body.map(p => <p key={p}>{p}</p>) : <ul style={{ paddingRight: '18px' }}>{body.list.map(x => <li key={x}>{x}</li>)}</ul>}
    </section>)}
    {t.timeline && <><H2>ציר זמן</H2><ul style={{ paddingRight: '18px' }}>{t.timeline.map(([w, x]) => <li key={w + x}><b>{w}</b> — {x}</li>)}</ul></>}
    <H2>מילים חשובות</H2>
    <ul style={{ paddingRight: '18px' }}>{t.words.map(([w, m]) => <li key={w}><b>{w}</b> — {m}</li>)}</ul>
  </article>
}

export function WorksheetSheet({ t }) {
  const meanings = mix(t.words.map(w => w[1]))
  return <article className="buga-flow" dir="rtl">
    <H1>✏️ דף עבודה: {t.title}</H1>
    <NameRow />
    <H2>א. ענו על השאלות</H2>
    {t.quiz.map(([q], i) => <div key={q} style={{ marginBottom: '6px' }}><p style={{ fontWeight: 700 }}>{i + 1}. {q}</p><Lines /></div>)}
    <H2>ב. התאימו כל מילה להסבר שלה — כתבו את האות המתאימה</H2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '6px 16px' }}>
      <div>{t.words.map(([w]) => <p key={w}>____ {w}</p>)}</div>
      <div>{meanings.map((m, i) => <p key={m}><b>{LETTERS[i]}.</b> {m}</p>)}</div>
    </div>
    <H2>ג. במילים שלכם</H2>
    <p style={{ fontWeight: 700 }}>מה הדבר הכי מעניין שלמדתם על {t.title}? כתבו שלושה משפטים.</p>
    <Lines n={4} />
  </article>
}

export function AnswerSheet({ t }) {
  const meanings = mix(t.words.map(w => w[1]))
  return <article className="buga-flow" dir="rtl">
    <H1>✅ תשובות — {t.title}</H1>
    <H2>א. שאלות</H2>
    <ol style={{ paddingRight: '18px' }}>{t.quiz.map(([q, a]) => <li key={q}><b>{q}</b> {a}</li>)}</ol>
    <H2>ב. התאמה</H2>
    <ul style={{ paddingRight: '18px' }}>{t.words.map(([w, m]) => <li key={w}>{w} — {LETTERS[meanings.indexOf(m)]}</li>)}</ul>
    <H2>ג.</H2><p>תשובה אישית. כדאי לבדוק שהמשפטים מבוססים על הסיכום.</p>
  </article>
}

const ORDER_SHOWN = ORDER_PICK.map(i => HANUKKAH_TEST.order[i])
export function TestSheets() {
  const { mc, open } = HANUKKAH_TEST
  return <>
    <article className="buga-flow" dir="rtl">
      <H1>📝 מבחן: סיפור חנוכה</H1>
      <p style={{ textAlign: 'center', margin: '0 0 8px' }}>לכיתות ג׳–ו׳ · 45 דקות · 100 נקודות</p>
      <NameRow />
      <H2>חלק א׳ — הקיפו את התשובה הנכונה (4 נקודות לכל שאלה, 60 נקודות)</H2>
      {mc.map(([q, opts], i) => <div key={q} style={{ marginBottom: '6px', breakInside: 'avoid' }}>
        <p style={{ fontWeight: 700, margin: 0 }}>{i + 1}. {q}</p>
        <p style={{ margin: '2px 0 0', display: 'flex', flexWrap: 'wrap', gap: '4px 18px' }}>{opts.map((o, j) => <span key={o}>{LETTERS[j]}. {o}</span>)}</p>
      </div>)}
    </article>
    <article className="buga-flow" dir="rtl">
      <H2>חלק ב׳ — סדרו את האירועים לפי הסדר: כתבו 1 ליד הראשון ו־{ORDER_SHOWN.length} ליד האחרון (10 נקודות)</H2>
      {ORDER_SHOWN.map(e => <p key={e}>____ {e}</p>)}
      <H2>חלק ג׳ — ענו במשפטים מלאים (10 נקודות לכל שאלה, 30 נקודות)</H2>
      {open.map(([q], i) => <div key={q}><p style={{ fontWeight: 700 }}>{i + 1}. {q}</p><Lines n={4} /></div>)}
    </article>
    <article className="buga-flow" dir="rtl">
      <H1>✅ מחוון למבחן: סיפור חנוכה</H1>
      <H2>חלק א׳</H2>
      <p>{mc.map(([, opts, right], i) => `${i + 1}. ${LETTERS[right]} (${opts[right]})`).join(' · ')}</p>
      <H2>חלק ב׳ — הסדר הנכון</H2>
      <ol style={{ paddingRight: '18px' }}>{HANUKKAH_TEST.order.map(e => <li key={e}>{e}</li>)}</ol>
      <H2>חלק ג׳ — תשובות אפשריות</H2>
      <ol style={{ paddingRight: '18px' }}>{open.map(([q, a]) => <li key={q}><b>{q}</b> {a}</li>)}</ol>
    </article>
  </>
}

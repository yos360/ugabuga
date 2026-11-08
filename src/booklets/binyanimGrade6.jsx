import { A4, Certificate, Cover, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת תרגול שבעת הבניינים לכיתה ו׳" — recognising the binyan by the past and present forms, the same root in
// different binyanim, active and passive, hitpael and a short reading passage. Every answer is derived from the
// data below, so the answer key cannot drift from the exercises. Text is unpointed (grade 6 reads without niqqud).
const PAGES = bookletBySlug('binyanim-grade-6').pages
export const BINYANIM = ['קל', 'נפעל', 'פיעל', 'פועל', 'הפעיל', 'הופעל', 'התפעל']

// Page 2: the seven binyanim with an example and the sign by which to recognise each in the past (3rd person, "he").
export const TABLE = [
  ['קל', 'כתב, שמר', 'כותב, שומר', 'אין תחילית; בהווה יש ו אחרי האות הראשונה'],
  ['נפעל', 'נשבר, נפתח', 'נשבר, נפתח', 'מתחיל ב־נ'],
  ['פיעל', 'דיבר, סיפר', 'מדבר, מסדר', 'י אחרי האות הראשונה; בהווה מתחיל ב־מ'],
  ['פועל', 'תוקן, סודר', 'מתוקן, מסודר', 'ו אחרי האות הראשונה (סביל)'],
  ['הפעיל', 'הזמין, הדליק', 'מזמין, מדליק', 'מתחיל ב־ה, ו־י לפני האות האחרונה'],
  ['הופעל', 'הוזמן, הודלק', 'מוזמן, מודלק', 'מתחיל ב־הו (סביל)'],
  ['התפעל', 'התלבש, התרגש', 'מתלבש, מתרגש', 'מתחיל ב־הת; בהווה ב־מת'],
]

// Page 3 (past) and page 4 (present): [verb, binyan].
export const PAST = [['שבר', 'קל'], ['נשבר', 'נפעל'], ['הזמין', 'הפעיל'], ['התרגש', 'התפעל'], ['הוזמן', 'הופעל'], ['דיבר', 'פיעל'],
  ['תוקן', 'פועל'], ['כתב', 'קל'], ['הדליק', 'הפעיל'], ['התלבש', 'התפעל'], ['הודלק', 'הופעל'], ['סיפר', 'פיעל']]
export const PRESENT = [['מסדר', 'פיעל'], ['מסודר', 'פועל'], ['מזמין', 'הפעיל'], ['מוזמן', 'הופעל'], ['מתרגש', 'התפעל'], ['כותב', 'קל'],
  ['נפתח', 'נפעל'], ['לומד', 'קל'], ['מדבר', 'פיעל'], ['מלביש', 'הפעיל'], ['מולבש', 'הופעל'], ['מתקלח', 'התפעל']]

// Page 5: one root, four binyanim. [root, [sentence with ___, answer] x4, bank].
export const ROOTS = [
  { root: 'ל־ב־ש', rows: [['דני ___ מעיל חם בבוקר.', 'לבש'], ['אמא ___ את התינוק בבגד חדש.', 'הלבישה'], ['התינוק ___ בבגד חדש על ידי אמא.', 'הולבש'], ['אני ___ מהר לפני בית הספר.', 'מתלבש']] },
  { root: 'ד־ל־ק', rows: [['האש ___ בכל הבית.', 'דלקה'], ['הנר ___ כשהחשמל הלך והחושך ירד.', 'נדלק'], ['אבא ___ את הנר.', 'הדליק'], ['הנר ___ על ידי אבא.', 'הודלק']] },
]

// Page 6: active or passive? [sentence, verb, answer]
export const ACTIVE = [
  ['הנגר תיקן את הכיסא.', 'פעיל'], ['הכיסא תוקן אתמול.', 'סביל'], ['המורה הזמינה את ההורים.', 'פעיל'], ['ההורים הוזמנו לאסיפה.', 'סביל'],
  ['הילדים בישלו ארוחת ערב.', 'פעיל'], ['ארוחת הערב בושלה במטבח.', 'סביל'], ['נועה כתבה מכתב.', 'פעיל'], ['הספר הודפס בבית דפוס.', 'סביל'],
  ['השף הדליק את התנור.', 'פעיל'], ['הנרות הודלקו בערב חג.', 'סביל'], ['הצייר סיים את התמונה.', 'פעיל'], ['התמונה סודרה על הקיר.', 'סביל'],
]

// Page 7: turn an active sentence into a passive one. [active, passive sentence with ___, answer, binyan of the active]
export const PASSIVE = [
  ['השף בישל את המרק.', 'המרק ___ על ידי השף.', 'בושל'],
  ['הפועלים תיקנו את הכביש.', 'הכביש ___ על ידי הפועלים.', 'תוקן'],
  ['סבתא הזמינה את המשפחה.', 'המשפחה ___ על ידי סבתא.', 'הוזמנה'],
  ['הגננת הדליקה את הנרות.', 'הנרות ___ על ידי הגננת.', 'הודלקו'],
  ['התלמידים סידרו את הכיתה.', 'הכיתה ___ על ידי התלמידים.', 'סודרה'],
  ['השוער ניקה את החצר.', 'החצר ___ על ידי השוער.', 'נוקתה'],
  ['המורה הכתיבה את המילים.', 'המילים ___ על ידי המורה.', 'הוכתבו'],
  ['אמא הלבישה את התינוקת.', 'התינוקת ___ על ידי אמא.', 'הולבשה'],
]

// Page 8: hitpael types. A = does it to himself, B = to each other, C = a change of state or feeling.
export const HITPAEL_TYPES = { א: 'הפעולה על עצמו', ב: 'הדדי — זה לזה', ג: 'שינוי או הרגשה' }
export const HITPAEL = [['התלבש', 'א'], ['התכתבו', 'ב'], ['התרגש', 'ג'], ['התקלח', 'א'], ['התחבקו', 'ב'], ['התעייף', 'ג'],
  ['הסתרק', 'א'], ['התראינו', 'ב'], ['התלהב', 'ג'], ['התאפרה', 'א']]

// Page 9: in hitpael the ת moves or changes next to ס, ש, צ, ז. [root, three forms, right one]
export const SWAPS = [
  ['ס־ד־ר', ['התסדר', 'הסתדר', 'הסדתר'], 'הסתדר'], ['ש־מ־ש', ['השתמש', 'התשמש', 'השמתש'], 'השתמש'],
  ['צ־ל־ם', ['התצלם', 'הצתלם', 'הצטלם'], 'הצטלם'], ['ז־ק־נ', ['הזדקן', 'התזקן', 'הזתקן'], 'הזדקן'],
  ['ס־כ־ל', ['התסכל', 'הסתכל', 'הסכתל'], 'הסתכל'], ['צ־ע־ר', ['הצטער', 'התצער', 'הצתער'], 'הצטער'],
  ['ש־נ־י', ['התשנה', 'השתנה', 'השנתה'], 'השתנה'], ['ז־ה־ה', ['התזהה', 'הזדהה', 'הזתהה'], 'הזדהה'],
]

// Page 10: root and binyan. [verb, root, binyan]
export const ROOT_BINYAN = [['נפתח', 'פ־ת־ח', 'נפעל'], ['סיפר', 'ס־פ־ר', 'פיעל'], ['הסביר', 'ס־ב־ר', 'הפעיל'], ['התחבר', 'ח־ב־ר', 'התפעל'],
  ['תוקן', 'ת־ק־ן', 'פועל'], ['הוסבר', 'ס־ב־ר', 'הופעל'], ['למד', 'ל־מ־ד', 'קל'], ['נשמר', 'ש־מ־ר', 'נפעל'], ['הקשיב', 'ק־ש־ב', 'הפעיל'], ['הודפס', 'ד־פ־ס', 'הופעל']]

// Page 11: reading passage; the numbered verbs are underlined and the child names their binyan.
export const PASSAGE = [
  'בכיתה ו׳ כולם התכוננו למסיבת הסיום. ', ['הזמינה', 1], ' המורה את ההורים, וההזמנות ', ['הודפסו', 2], ' בבית דפוס בשכונה. ',
  'נועם ', ['סידר', 3], ' את הכיסאות באולם, ושירה הדליקה את האורות. בערב ', ['נפתחו', 4], ' הדלתות, והאורחים התיישבו במקומותיהם. ',
  'ההורים ', ['התרגשו', 5], ' מאוד כשהילדים ', ['שרו', 6], ' את שיר הסיום.',
]
export const PASSAGE_ANSWERS = ['הפעיל', 'הופעל', 'פיעל', 'נפעל', 'התפעל', 'קל']

// Page 12: word search — one verb from each binyan (plus one more of the passive ones).
export const SEARCH = [
  { word: 'כתב' }, { word: 'נשבר' }, { word: 'דיבר' }, { word: 'תוקן' }, { word: 'הזמין' }, { word: 'הוזמן' }, { word: 'התלבש' }, { word: 'הודלק' },
]

// Page 13: summary quiz. [question, options, answer]
export const QUIZ = [
  ['כמה בניינים יש בעברית?', ['חמישה', 'שבעה', 'תשעה'], 'שבעה'],
  ['איזה פועל הוא סביל?', ['הזמין', 'הוזמן', 'מזמין'], 'הוזמן'],
  ['מה הבניין של "נשבר"?', ['קל', 'נפעל', 'פועל'], 'נפעל'],
  ['מה הזוג הסביל של הבניין הפעיל?', ['פועל', 'הופעל', 'נפעל'], 'הופעל'],
  ['מה הזוג הסביל של הבניין פיעל?', ['פועל', 'הופעל', 'התפעל'], 'פועל'],
  ['איזה פועל בנוי בבניין קל?', ['כתב', 'נכתב', 'הכתיב'], 'כתב'],
  ['מה הבניין של "מולבש"?', ['פועל', 'התפעל', 'הופעל'], 'הופעל'],
  ['"התכתבו" פירושו:', ['כתבו זה לזה', 'כתבו לעצמם', 'נכתבו'], 'כתבו זה לזה'],
  ['איזה סימן מתאים לבניין הפעיל בעבר?', ['מתחיל ב־נ', 'מתחיל ב־ה ויש י לפני האות האחרונה', 'מתחיל ב־הת'], 'מתחיל ב־ה ויש י לפני האות האחרונה'],
  ['איזו צורה נכונה?', ['התסתכל', 'הסתכל', 'הסכתל'], 'הסתכל'],
]

const box = { border: '2px solid #111', borderRadius: 12, padding: '6px 12px' }
const line = { borderBottom: '1.5px solid #111', height: 26, flex: 1, minWidth: 60 }
const Head = ({ n, icon, instruction }) => <>
  <h2>{icon} {PAGES[n - 1]}</h2>
  <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת</p>
  <p style={{ textAlign: 'center', margin: '0 0 10px', fontSize: 14 }}>{instruction}</p>
</>
const Bank = ({ words }) => <div style={{ ...box, display: 'flex', flexWrap: 'wrap', gap: '4px 22px', justifyContent: 'center', fontWeight: 700, fontSize: '13pt', marginBottom: 10 }}>{words.map(w => <span key={w}>{w}</span>)}</div>
const shuffled = (list, seed) => rngFor(seed, 7).shuffle([...list])
const Num = ({ i }) => <b style={{ minWidth: 24 }}>{i + 1}.</b>

function TablePage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={2} icon="🏗️" instruction="קוראים את הטבלה ומשננים: לכל בניין יש צורה קבועה ואפשר לזהות אותו לפי הסימן." />
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5pt', lineHeight: 1.45 }}>
      <thead><tr>{['בניין', 'בעבר', 'בהווה', 'סימן היכר'].map(h => <th key={h} style={{ border: '2px solid #111', padding: 6, background: '#eee' }}>{h}</th>)}</tr></thead>
      <tbody>{TABLE.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={{ border: '1.5px solid #111', padding: '7px 8px', fontWeight: i === 0 ? 800 : 400 }}>{c}</td>)}</tr>)}</tbody>
    </table>
    <div style={{ ...box, marginTop: 14, fontSize: '12.5pt', lineHeight: 1.6 }}>
      <b>זוגות של פעיל וסביל:</b> פיעל ← פועל (תיקן ← תוקן) · הפעיל ← הופעל (הזמין ← הוזמן) · קל ← נפעל (כתב ← נכתב).<br />
      פועל והופעל הם תמיד סבילים. נפעל הוא לפעמים סביל ("המכתב נכתב") ולפעמים לא ("נכנס", "נרדם").
    </div>
    <p style={{ fontSize: '12pt', marginTop: 10 }}>הבניינים נקראים על שם השורש פ־ע־ל: פעל, נפעל, פיעל, פועל, הפעיל, הופעל, התפעל. הבניין קובע את צורת הפועל, והשורש את משמעותו.</p>
  </A4>
}

function ChoiceRows({ n, icon, instruction, items }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={n} icon={icon} instruction={instruction} />
    <Bank words={BINYANIM} />
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 30px', alignContent: 'space-around' }}>
      {items.map(([v], i) => <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', fontSize: '15pt' }}><Num i={i} /><b>{v}</b><span style={line} /></div>)}
    </div>
  </A4>
}

function RootsPage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={5} icon="🌱" instruction="שורש אחד ובניינים שונים. משלימים בכל משפט את הפועל המתאים מתוך המסגרת." />
    {ROOTS.map(r => <section key={r.root} style={{ ...box, marginBottom: 12 }}>
      <b style={{ fontSize: '14pt' }}>שורש: {r.root}</b>
      <Bank words={shuffled(r.rows.map(x => x[1]), r.root.length + r.rows.length)} />
      {r.rows.map(([s], i) => <div key={i} style={{ fontSize: '14pt', lineHeight: 2.1 }}><Num i={i} />{s.split('___')[0]}<span style={{ display: 'inline-block', borderBottom: '1.5px solid #111', width: 90 }} />{s.split('___')[1]}</div>)}
    </section>)}
  </A4>
}

function ActivePage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={6} icon="↔️" instruction="בפעיל מי שבתחילת המשפט עושה את הפעולה; בסביל הפעולה נעשית עליו. מקיפים: פעיל או סביל." />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      {ACTIVE.map(([s], i) => <div key={s} style={{ display: 'flex', gap: 10, fontSize: '14.5pt', alignItems: 'center' }}>
        <Num i={i} /><span style={{ flex: 1 }}>{s}</span><b style={{ ...box, padding: '2px 14px' }}>פעיל</b><b style={{ ...box, padding: '2px 14px' }}>סביל</b>
      </div>)}
    </div>
  </A4>
}

function PassivePage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={7} icon="🔄" instruction="הופכים משפט פעיל לסביל: משלימים את הפועל בבניין הסביל, ושמים לב להתאמה במין ובמספר." />
    <Bank words={shuffled(PASSIVE.map(p => p[2]), 11)} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      {PASSIVE.map(([a, p], i) => <div key={a} style={{ fontSize: '14pt', lineHeight: 1.7 }}>
        <Num i={i} />{a}<br /><span style={{ marginInlineStart: 24 }}>{p.split('___')[0]}<span style={{ display: 'inline-block', borderBottom: '1.5px solid #111', width: 90 }} />{p.split('___')[1]}</span>
      </div>)}
    </div>
  </A4>
}

function HitpaelPage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={8} icon="🪞" instruction="בבניין התפעל יש שלושה סוגים של משמעות. כותבים ליד כל פועל את האות של הסוג שלו." />
    <div style={{ ...box, fontSize: '13.5pt', lineHeight: 1.8, marginBottom: 12 }}>
      {Object.entries(HITPAEL_TYPES).map(([k, v]) => <div key={k}><b>{k}.</b> {v}</div>)}
      <div style={{ fontSize: '12pt' }}>דוגמאות: התרחץ (א), התחבקו (ב), התעצבן (ג).</div>
    </div>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 30px', alignContent: 'space-around' }}>
      {HITPAEL.map(([v], i) => <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', fontSize: '16pt' }}><Num i={i} /><b>{v}</b><span style={{ ...line, flex: 'none', width: 50 }} /></div>)}
    </div>
  </A4>
}

function SwapsPage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={9} icon="🔀" instruction="כשהאות הראשונה בשורש היא ס, ש, צ או ז, האות ת של התפעל זזה (הסתדר) ולפעמים משתנה (הצטלם, הזדקן). מקיפים את הצורה הנכונה." />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      {SWAPS.map(([root, opts], i) => <div key={root} style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: '15pt' }}>
        <Num i={i} /><span style={{ minWidth: 110 }}>שורש: <b>{root}</b></span>
        {opts.map(o => <b key={o} style={{ ...box, padding: '2px 16px', flex: 1, textAlign: 'center' }}>{o}</b>)}
      </div>)}
    </div>
  </A4>
}

function RootBinyanPage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={10} icon="🔎" instruction="לכל פועל כותבים את השורש ואת הבניין. עוזרים לעצמכם בטבלה בעמוד 2." />
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15pt', flex: 1 }}>
      <thead><tr>{['', 'פועל', 'שורש', 'בניין'].map(h => <th key={h} style={{ border: '2px solid #111', padding: 6, background: '#eee' }}>{h}</th>)}</tr></thead>
      <tbody>{ROOT_BINYAN.map(([v], i) => <tr key={v}><td style={{ border: '1.5px solid #111', width: 34, textAlign: 'center' }}>{i + 1}</td><td style={{ border: '1.5px solid #111', fontWeight: 800, textAlign: 'center' }}>{v}</td><td style={{ border: '1.5px solid #111' }} /><td style={{ border: '1.5px solid #111' }} /></tr>)}</tbody>
    </table>
  </A4>
}

function ReadingPage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={11} icon="📖" instruction="קוראים את הקטע. מתחת לכל פועל מודגש כותבים את הבניין שלו." />
    <p style={{ ...box, fontSize: '15pt', lineHeight: 2.1, padding: '14px 18px' }}>
      {PASSAGE.map((p, i) => typeof p === 'string' ? p : <span key={i}><b style={{ textDecoration: 'underline' }}>{p[0]}</b><sup>({p[1]})</sup></span>)}
    </p>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 30px', alignContent: 'space-around' }}>
      {PASSAGE.filter(p => typeof p !== 'string').map(p => <div key={p[1]} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', fontSize: '15pt' }}><b>({p[1]})</b><b>{p[0]}</b><span style={line} /></div>)}
    </div>
    <p style={{ fontSize: '13pt' }}>שאלה נוספת: איזה פועל בקטע הוא סביל, ומה הפעיל שלו? ____________________________</p>
  </A4>
}

function QuizPage() {
  return <A4 style={{ alignItems: 'stretch' }}>
    <Head n={13} icon="🏆" instruction="חידון סיכום: מקיפים את התשובה הנכונה." />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      {QUIZ.map(([q, o], i) => <div key={q} style={{ fontSize: '13.5pt' }}>
        <div><Num i={i} />{q}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>{o.map(x => <b key={x} style={{ ...box, padding: '1px 12px', flex: 1, textAlign: 'center', fontSize: '12pt' }}>{x}</b>)}</div>
      </div>)}
    </div>
  </A4>
}

// Answer key: one compact paragraph per page, numbers inline (the generic AnswerKey list is too tall for 80+ answers).
function KeyPage() {
  const sections = [
    ['עמוד 3 — בעבר', () => PAST.map(p => p[1])], ['עמוד 4 — בהווה', () => PRESENT.map(p => p[1])],
    ['עמוד 5 — אותו שורש', () => ROOTS.flatMap(r => r.rows.map(x => x[1]))], ['עמוד 6 — פעיל או סביל', () => ACTIVE.map(a => a[1])],
    ['עמוד 7 — הופכים לסביל', () => PASSIVE.map(p => p[2])], ['עמוד 8 — התפעל', () => HITPAEL.map(h => h[1])],
    ['עמוד 9 — האות ת', () => SWAPS.map(x => x[2])], ['עמוד 10 — שורש ובניין', () => ROOT_BINYAN.map(r => `${r[1]}, ${r[2]}`)],
    ['עמוד 11 — הקטע', () => [...PASSAGE_ANSWERS, 'הדפיסו (הפעיל של הודפסו)']],
    ['עמוד 12 — תפזורת', () => SEARCH.map(x => `${x.word}: ${PAST.find(p => p[0] === x.word)[1]}`)], ['עמוד 13 — חידון', () => QUIZ.map(q => q[2])],
  ]
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 10px', fontSize: 14 }}>עמוד 14 בחוברת · התשובות לפי סדר המשפטים בכל עמוד</p>
    {sections.map(([t, f]) => <p key={t} style={{ fontSize: '11pt', lineHeight: 1.6, margin: '0 0 7px', breakInside: 'avoid' }}>
      <b>{t}:</b> {f().map((a, i) => `${i + 1}) ${a}`).join(' · ')}
    </p>)}
    <p style={{ fontSize: '10.5pt', marginTop: 6 }}>בעמוד 3 ובעמוד 4 מופיעים הפעלים בסדר שבו הם מודפסים. בעמוד 8: א = הפעולה על עצמו, ב = הדדי, ג = שינוי או הרגשה.</p>
  </A4>
}

export default function BinyanimGrade6Booklet() {
  return <>
    <Cover emoji="🏗️✍️" title="שבעת הבניינים לכיתה ו׳" subtitle="חוברת תרגול: זיהוי בניין, פעיל וסביל, התפעל" pages={PAGES}
      note="החוברת מתאימה לתלמידי כיתה ו׳ (וגם לחזרה בכיתה ה׳ ובכיתה ז׳). מתחילים בטבלה שבעמוד 2, ואחר כך מתרגלים זיהוי בניין לפי העבר וההווה, אותו שורש בבניינים שונים, פעיל וסביל, בניין התפעל וקטע קריאה. כדאי לפתור עמוד אחד או שניים בכל פעם, ואחרי כל עמוד לבדוק בדף התשובות שבסוף." />
    <TablePage />
    <ChoiceRows n={3} icon="⏮️" instruction="לפניכם פעלים בעבר (גוף הוא). כותבים ליד כל פועל את הבניין שלו, לפי המסגרת." items={PAST} />
    <ChoiceRows n={4} icon="▶️" instruction="לפניכם פעלים בהווה. כותבים ליד כל פועל את הבניין שלו, לפי המסגרת." items={PRESENT} />
    <RootsPage />
    <ActivePage />
    <PassivePage />
    <HitpaelPage />
    <SwapsPage />
    <RootBinyanPage />
    <ReadingPage />
    <WordSearchPage n={12} title={PAGES[11]} instruction="מוצאים בתפזורת את הפעלים שברשימה ומקיפים אותם. אחר כך כותבים במחברת את הבניין של כל פועל." words={SEARCH} seed={66} size={10} he />
    <QuizPage />
    <KeyPage />
    <Certificate booklet="חוברת שבעת הבניינים לכיתה ו׳" done="זיהיתי בניינים, הבחנתי בין פעיל לסביל ופתרתי חידון סיכום." cheer="כל הכבוד, מומחה/ית לבניינים!" />
  </>
}

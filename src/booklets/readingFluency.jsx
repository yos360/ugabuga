import { GRID_COMMON, GRID_PREFIX, LOOKALIKE, MISREAD, PASSAGES, PHRASES_READY, PHRASES_TODO, PREFIX_MEANING, PREFIX_OR_NOT, PREFIX_SPLIT, QUESTIONS, countWords, passageWords } from '../data/readingFluency'
import { A4, Certificate, art, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "שטף ודיוק בקריאה — חטיבת ביניים" — for grade 7 readers who struggle. Teen topics, no childish
// pictures, plain Hebrew without nikud (only pre-taught hard words carry it). Warm-ups (prefixes, look-alike
// letters), one-minute word grids, phrase reading, four passages with printed running word counts and a
// three-reading chart, comprehension, self-monitoring, a progress graph, answers and a certificate.
// Every page is HTML inside A4 (print area about 182 × 232 mm), so sizes below are kept in mm/pt.
const PAGES = bookletBySlug('reading-fluency').pages
const LINE = '#9aa5b5', SOFT = '#f3f5f9', ACCENT = '#3b4a6b'
const cell = { border: '1px solid #111', padding: '1.4mm 2mm', textAlign: 'center' }
const head = { ...cell, background: '#e9edf4', fontWeight: 800 }
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }

const Art = ({ e, size = 15 }) => <img src={art(e)} alt="" aria-hidden="true" style={{ width: `${size}mm`, height: `${size}mm`, objectFit: 'contain', flex: 'none' }} />

// Page head: pictures on the right, title and subtitle, page number in a circle on the left.
function Banner({ n, arts, title, sub }) {
  return <header style={{ display: 'flex', alignItems: 'center', gap: '3mm', border: `2px solid ${ACCENT}`, borderRadius: 14, padding: '2mm 4mm', marginBottom: '2mm', background: SOFT }}>
    <div style={{ display: 'flex', gap: '1mm' }}>{arts.map(e => <Art key={e} e={e} size={13} />)}</div>
    <div style={{ flex: 1, textAlign: 'right' }}>
      <h2 style={{ margin: 0, fontSize: '19pt', textAlign: 'right', lineHeight: 1.2 }}>{title}</h2>
      {sub && <div style={{ fontSize: '10.5pt', color: '#444' }}>{sub}</div>}
    </div>
    {n && <div style={{ width: '11mm', height: '11mm', borderRadius: '50%', border: `2px solid ${ACCENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13pt', background: 'white', flex: 'none' }}>{n}</div>}
  </header>
}

function Sheet({ n, arts, title, sub, children }) {
  return <A4 style={{ alignItems: 'stretch', textAlign: 'right' }}>
    <Banner n={n} arts={arts} title={title} sub={sub} />
    <p style={{ margin: '0 0 2.5mm', fontSize: '10.5pt', color: '#333' }}>שם: ____________________ &nbsp;&nbsp; תאריך: ____________</p>
    {children}
  </A4>
}

// A framed hint with a small picture.
const Tip = ({ e = '💡', children, style }) => <div style={{ display: 'flex', alignItems: 'center', gap: '3mm', border: `1.5px dashed ${LINE}`, borderRadius: 10, padding: '1.8mm 3mm', fontSize: '11pt', lineHeight: 1.4, margin: '0 0 2.5mm', ...style }}>
  <Art e={e} size={9} /><div>{children}</div>
</div>

const Task = ({ letter, children }) => <p style={{ fontSize: '12.5pt', fontWeight: 800, margin: '1.5mm 0' }}>
  <span style={{ display: 'inline-block', minWidth: '7mm', textAlign: 'center', background: ACCENT, color: 'white', borderRadius: 6, marginInlineEnd: '2mm', padding: '0 1.5mm' }}>{letter}</span>{children}
</p>

// Three timed readings of the same text. `words`: the text length, for the formula line.
function ReadingChart({ words }) {
  return <div style={{ marginTop: '2mm' }}>
    <table style={tableStyle}>
      <thead><tr>{['', 'תאריך', 'זמן (שניות)', 'שגיאות', 'מילים נכונות בדקה'].map(h => <th key={h} style={head}>{h}</th>)}</tr></thead>
      <tbody>{['קריאה 1', 'קריאה 2', 'קריאה 3'].map(r => <tr key={r} style={{ height: '8.5mm' }}><th style={head}>{r}</th><td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} /></tr>)}</tbody>
    </table>
    <p style={{ fontSize: '10pt', margin: '1.5mm 0 0' }}>
      {words ? <>בקטע <b>{words}</b> מילים · מילים נכונות בדקה = ({words} − שגיאות) × 60 ÷ שניות · היעד שלי לקריאה 3: ______</> : <>קוראים דקה אחת בדיוק · מילים נכונות בדקה = המספר שליד השורה האחרונה שנקראה, ועוד המילים בשורה, פחות השגיאות</>}
    </p>
  </div>
}

function CoverPage() {
  const steps = [['📖', 'קוראים', 'קטע קצר, בקול'], ['⏰', 'מודדים', 'זמן ושגיאות'], ['💪', 'משתפרים', 'שלוש קריאות']]
  return <A4 style={{ alignItems: 'stretch', textAlign: 'center' }}>
    <div style={{ border: `3px solid ${ACCENT}`, borderRadius: 20, padding: '6mm 6mm 5mm', background: SOFT }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4mm' }}>{['📚', '🧠', '📖', '💡'].map(e => <Art key={e} e={e} size={17} />)}</div>
      <h2 style={{ fontSize: '28pt', margin: '3mm 0 1mm' }}>שטף ודיוק בקריאה</h2>
      <p style={{ fontSize: '14pt', margin: 0 }}>חוברת תרגול לחטיבת הביניים</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '5mm', margin: '6mm 0' }}>
      {steps.map(([e, t, s], i) => <div key={t} style={{ flex: 1, border: `2px solid ${LINE}`, borderRadius: 14, padding: '3mm 2mm' }}>
        <Art e={e} size={14} />
        <div style={{ fontSize: '15pt', fontWeight: 800 }}>{i + 1}. {t}</div>
        <div style={{ fontSize: '10.5pt' }}>{s}</div>
      </div>)}
    </div>
    <div style={{ border: '2px dashed #111', borderRadius: 14, padding: '4mm', fontSize: '16pt', marginBottom: '5mm' }}>החוברת של: ______________________ &nbsp; כיתה: ______</div>
    <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: '3mm 5mm', textAlign: 'right' }}>
      <b style={{ fontSize: '12pt' }}>מה בחוברת</b>
      <ol style={{ fontSize: '11.5pt', lineHeight: 1.6, columns: 2, columnGap: '10mm', margin: '1mm 0 0', paddingInlineStart: '6mm' }} start={2}>
        {PAGES.slice(1).map(t => <li key={t}>{t}</li>)}
      </ol>
    </div>
    <p style={{ fontSize: '10.5pt', margin: '4mm 0 0', lineHeight: 1.55, textAlign: 'right' }}><b>למורה ולהורים:</b> תרגול קצר של 10–15 דקות, כמה פעמים בשבוע. הטקסטים בלי ניקוד, כמו בחטיבה; רק המילים הקשות שלפני כל קטע מנוקדות. בעמוד 2 מוסבר איך עובדים בקריאה חוזרת ואיך מודדים מילים נכונות בדקה.</p>
  </A4>
}

function TeacherPage({ n }) {
  const li = { marginBottom: '1mm' }
  const box = { border: `1.5px solid ${LINE}`, borderRadius: 10, padding: '2mm 3mm', marginBottom: '2mm' }
  return <A4 style={{ alignItems: 'stretch', textAlign: 'right' }}>
    <Banner n={n} arts={['🧑‍🏫']} title="למורה: קריאה חוזרת ומדידת קצב" sub="איך עובדים עם החוברת, מה נחשב שגיאה ואיך מחשבים" />
    <div style={{ fontSize: '10pt', lineHeight: 1.4 }}>
      <p style={{ margin: '0 0 2mm' }}><b>למי החוברת?</b> לתלמידי כיתה ז׳ שמפענחים נכון ברובם, אבל קוראים לאט, מילה אחרי מילה, או מחליפים אותיות דומות ותחיליות. שטף הוא קריאה מדויקת, בקצב סביר ובחלוקה לצירופים בעלי משמעות — והוא מה שמשחרר את הקשב להבנה.</p>
      <div style={box}>
        <b>קריאה חוזרת — חמישה צעדים לכל קטע</b>
        <ol style={{ margin: '1mm 0 0', paddingInlineStart: 20 }}>
          <li style={li}>קוראים יחד את המילים המנוקדות שמעל הקטע, ומוודאים שהן מובנות.</li>
          <li style={li}>המורה (או קורא מיומן) מקריא/ה את הקטע פעם אחת בקצב טבעי, והתלמיד עוקב באצבע.</li>
          <li style={li}>התלמיד קורא בקול; המורה מודד/ת זמן ומסמנ/ת שגיאות בעותק נפרד. רושמים בטבלה שמתחת לקטע.</li>
          <li style={li}>עוברים יחד על המילים שנקראו לא נכון, קוראים אותן כמה פעמים, ורק אז קריאה שנייה ושלישית.</li>
          <li style={li}>עונים על שאלות ההבנה (עמוד 12) ומסמנים את הקריאה הטובה בגרף (עמוד 14).</li>
        </ol>
      </div>
      <p style={{ margin: '0 0 2mm' }}><b>מה נחשב שגיאה?</b> מילה שהוחלפה או נקראה לא נכון, מילה שדולגה, ומילה שהתלמיד נתקע בה יותר מ־3 שניות והמורה אמר/ה אותה. <b>לא</b> נחשבים: תיקון עצמי, חזרה על מילה, והוספת מילה.</p>
      <div style={{ ...box, background: SOFT }}>
        <b>איך מחשבים מילים נכונות בדקה?</b> ליד כל שורה בקטע מודפס מספר המילים עד סוף השורה. אם התלמיד קרא את כל הקטע:
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '12pt', margin: '1.5mm 0' }}>(מילים בקטע − שגיאות) × 60 ÷ זמן בשניות</div>
        לדוגמה: קטע של 116 מילים, 4 שגיאות, 100 שניות: (116 − 4) × 60 ÷ 100 = <b>67</b> מילים נכונות בדקה. אפשר גם לעצור אחרי דקה בדיוק ולחסר את השגיאות ממספר המילים שנקראו.
      </div>
      <p style={{ margin: '0 0 2mm' }}><b>דיוק:</b> (מילים − שגיאות) ÷ מילים × 100. דיוק של 95% ומעלה מעיד שהטקסט מתאים לקריאה עצמאית; מתחת ל־90% כדאי לתרגל קודם את המילים הקשות. בקריאה חוזרת מצפים לראות את הקצב עולה ואת השגיאות יורדות מקריאה לקריאה.</p>
      <p style={{ margin: '0 0 2mm' }}><b>להשוות לעצמו, לא לאחרים.</b> נורמות קצב שמתפרסמות באנגלית לא מתאימות לעברית. המדד החשוב הוא ההתקדמות של התלמיד לאורך השבועות — ולכן יש בחוברת גרף אישי.</p>
      <p style={{ margin: 0 }}><b>רגישות לגיל:</b> מתרגלים ביחידות, לא מול הכיתה. נותנים לתלמיד לבחור יעד ולסמן בעצמו את הגרף. אם אין שיפור אחרי כמה שבועות של תרגול עקבי, כדאי להתייעץ עם היועצת או עם צוות החינוך המיוחד בבית הספר לגבי אבחון.</p>
    </div>
  </A4>
}

function PrefixPage({ n }) {
  return <Sheet n={n} arts={['🧠']} title="חימום: תחיליות" sub="ו, ה, ב, כ, ל, מ, ש — אותיות שנצמדות לתחילת המילה">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2mm', margin: '0 0 2.5mm' }}>
      {PREFIX_MEANING.map(([l, m]) => <div key={l} style={{ border: `2px solid ${ACCENT}`, borderRadius: 10, textAlign: 'center', padding: '1mm 0' }}>
        <div style={{ fontSize: '20pt', fontWeight: 800, lineHeight: 1.1 }}>{l}</div><div style={{ fontSize: '9.5pt' }}>{m}</div>
      </div>)}
    </div>
    <Task letter="א">קוראים בקול ומפרידים בקו ( | ) בין כל תחילית לבין המילה. דוגמה: ו|ה|ספר</Task>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5mm 5mm', fontSize: '18pt', fontWeight: 700, textAlign: 'center', margin: '1mm 0 2.5mm' }}>
      {PREFIX_SPLIT.map(([w], i) => <div key={w} style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, padding: '2mm 0' }}><span style={{ fontSize: '10pt', fontWeight: 400, color: '#666' }}>{i + 1}. </span>{w}</div>)}
    </div>
    <Task letter="ב">מלכודת! לא כל אות בתחילת מילה היא תחילית. מקיפים רק מילים שמתחילות בתחילית.</Task>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3mm 2mm', fontSize: '16pt', textAlign: 'center', margin: '1mm 0 2.5mm', border: `1.5px dashed ${LINE}`, borderRadius: 10, padding: '3mm 1mm' }}>
      {PREFIX_OR_NOT.map(([w]) => <div key={w}>{w}</div>)}
    </div>
    <Task letter="ג">בוחרים שתי מילים מתרגיל א׳ וכותבים משפט עם כל אחת:</Task>
    <div style={{ fontSize: '13pt', lineHeight: 2.2 }}>1. ______________________________________________________<br />2. ______________________________________________________</div>
  </Sheet>
}

// Look-alike letters, big, with what to look at.
const LETTER_HINTS = [['ד ר', 'ל־ד יש פינה חדה, ל־ר פינה מעוגלת'], ['ה ח ת', 'ה פתוחה למעלה משמאל; ח סגורה; ל־ת יש "רגל"'], ['ב כ', 'ל־ב יש בסיס שבולט ימינה, ל־כ אין'], ['ו ז ן', 'ז עם "כובע"; ן יורדת מתחת לשורה']]

function LookalikePage({ n }) {
  return <Sheet n={n} arts={['👁']} title="אותיות דומות" sub="בקריאה מהירה קל להחליף ביניהן — מסתכלים על הפרט הקטן">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2mm', margin: '0 0 2.5mm' }}>
      {LETTER_HINTS.map(([l, h]) => <div key={l} style={{ border: `2px solid ${ACCENT}`, borderRadius: 10, textAlign: 'center', padding: '1mm 1.5mm' }}>
        <div style={{ fontSize: '24pt', fontWeight: 800, letterSpacing: '2mm', lineHeight: 1.15 }}>{l}</div><div style={{ fontSize: '9pt', lineHeight: 1.3 }}>{h}</div>
      </div>)}
    </div>
    <Task letter="✓">קוראים את המשפט ומקיפים את המילה שמתאימה לו.</Task>
    {[...new Set(LOOKALIKE.map(l => l[0]))].map(group => <section key={group} style={{ marginBottom: '2mm' }}>
      <div style={{ fontSize: '11pt', fontWeight: 800, background: SOFT, border: `1px solid ${LINE}`, borderRadius: 6, padding: '0.5mm 3mm', marginBottom: '1mm' }}>{group}</div>
      {LOOKALIKE.map((l, i) => [l, i]).filter(([l]) => l[0] === group).map(([[, s, opts], i]) => <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '4mm', fontSize: '13pt', minHeight: '9.5mm', borderBottom: '1px dashed #ddd' }}>
        <span style={{ flex: 1 }}>{i + 1}. {s}</span>
        <span style={{ display: 'flex', gap: '7mm', fontWeight: 800, fontSize: '15pt' }}>{opts.map(o => <span key={o}>{o}</span>)}</span>
      </div>)}
    </section>)}
  </Sheet>
}

// Ten words, five times each, in a seeded order: every two rows hold all ten words once.
function gridRows(words, seed, salt) {
  const rng = rngFor(seed, salt), rows = []
  for (let k = 0; k < 5; k++) { const s = rng.shuffle(words); rows.push(s.slice(0, 5), s.slice(5)) }
  return rows
}

function GridPage({ n, title, words, seed, salt, size, tip }) {
  const rows = gridRows(words, seed, salt)
  return <Sheet n={n} arts={['⏰']} title={title} sub="טבלת מהירות · דקה אחת · שלוש פעמים">
    <Tip e="⏰">{tip} קוראים מימין לשמאל, שורה אחרי שורה, דקה אחת בדיוק. אחרי כל קריאה מתרגלים את המילים שהיו קשות.</Tip>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '1.5mm', fontSize: size, fontWeight: 700 }}>
      <tbody>{rows.map((r, i) => <tr key={i} style={{ height: '11.5mm' }}>
        {r.map((w, j) => <td key={j} style={{ textAlign: 'center', border: `1.5px solid ${LINE}`, borderRadius: 8, background: i % 2 ? SOFT : 'white' }}>{w}</td>)}
        <td style={{ width: '9mm', textAlign: 'left', fontSize: '10pt', fontWeight: 400, color: '#666' }}>{(i + 1) * 5}</td>
      </tr>)}</tbody>
    </table>
    <ReadingChart />
  </Sheet>
}

function PhrasesPage({ n }) {
  return <Sheet n={n} arts={['👄']} title="קוראים בצירופים" sub="קורא שוטף קורא קבוצות של מילים, לא מילה־מילה">
    <Tip e="🎵">הקו ( / ) מסמן איפה עוצרים לרגע קצר — כמו נשימה בשיר. כך המשפט נשמע כמו דיבור, וקל יותר להבין אותו.</Tip>
    <Task letter="א">קוראים כל משפט פעמיים: פעם לאט לפי הקווים, ופעם ברצף.</Task>
    <ol style={{ margin: '0 0 2mm', paddingInlineStart: 26, fontSize: '13.5pt', lineHeight: 1.5 }}>
      {PHRASES_READY.map(s => <li key={s} style={{ marginBottom: '2mm' }}>{s.split(' / ').map((p, i) => <span key={i}>{i > 0 && <b style={{ color: ACCENT, padding: '0 1mm' }}>/</b>}<span style={{ borderBottom: `2px solid ${LINE}` }}>{p}</span></span>)}</li>)}
    </ol>
    <Task letter="ב">עכשיו תורך: מסמנים קווים בין הצירופים, ואז קוראים את המשפט בקול.</Task>
    <ol start={6} style={{ margin: 0, paddingInlineStart: 26, fontSize: '13.5pt', lineHeight: 1.5 }}>
      {PHRASES_TODO.map(([s]) => <li key={s} style={{ marginBottom: '4.5mm' }}>{s}</li>)}
    </ol>
  </Sheet>
}

// The passage in fixed printed lines, each with the running word count on the left.
function PassagePage({ n, passage, index }) {
  // Running word count at the end of each line, per paragraph.
  const ends = passage.paras.reduce((acc, lines) => {
    let t = acc.total
    return { total: t + lines.reduce((s, l) => s + countWords(l), 0), rows: [...acc.rows, lines.map(l => (t += countWords(l)))] }
  }, { total: 0, rows: [] }).rows
  return <Sheet n={n} arts={passage.arts} title={`קטע ${index + 1}: ${passage.title}`} sub={`קריאה חוזרת · ${passage.topic}`}>
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2mm 5mm', border: `1.5px dashed ${LINE}`, borderRadius: 10, padding: '1.5mm 3mm', margin: '0 0 2mm' }}>
      <b style={{ fontSize: '11pt' }}>לפני הקריאה — מילים קשות:</b>
      {passage.pre.map(w => <span key={w} style={{ fontSize: '15pt', background: SOFT, borderRadius: 8, padding: '0 2.5mm' }}>{w}</span>)}
    </div>
    <div style={{ border: `2px solid ${ACCENT}`, borderRadius: 14, padding: '2.5mm 4mm 1mm', fontSize: '14.5pt', lineHeight: 1.62 }}>
      {passage.paras.map((lines, pi) => <div key={pi} style={{ marginBottom: '1.8mm' }}>
        {lines.map((l, li) => <div key={li} style={{ display: 'flex', alignItems: 'baseline', gap: '4mm' }}>
          <span style={{ flex: 1, whiteSpace: 'nowrap', paddingInlineStart: li === 0 ? '6mm' : 0 }}>{l}</span>
          <span style={{ width: '8mm', textAlign: 'left', fontSize: '9pt', color: '#777' }}>{ends[pi][li]}</span>
        </div>)}
      </div>)}
    </div>
    <ReadingChart words={passageWords(passage)} />
  </Sheet>
}

function QuestionsPage({ n }) {
  return <Sheet n={n} arts={['💡']} title="שאלות הבנה" sub="עונים אחרי הקריאה השלישית — אפשר לחזור לקטע">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm', fontSize: '10.8pt', lineHeight: 1.35 }}>
      {PASSAGES.map((p, pi) => <section key={p.id} style={{ border: `1.5px solid ${LINE}`, borderRadius: 12, padding: '2mm 3mm' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', borderBottom: `1.5px solid ${LINE}`, paddingBottom: '1mm', marginBottom: '1.5mm' }}>
          <Art e={p.arts[0]} size={8} /><b style={{ fontSize: '12pt' }}>קטע {pi + 1}: {p.title}</b>
        </div>
        <ol start={pi * 3 + 1} style={{ margin: 0, paddingInlineStart: 18 }}>
          {QUESTIONS.filter(q => q.passage === pi).map(q => <li key={q.q} style={{ marginBottom: '2mm' }}>
            {q.q}
            {q.options
              ? <div style={{ marginTop: '0.8mm' }}>{q.options.map(o => <div key={o} style={{ fontWeight: 700 }}>○ {o}</div>)}</div>
              : <div style={{ lineHeight: 2.1 }}>____________________________________<br />____________________________________</div>}
          </li>)}
        </ol>
      </section>)}
    </div>
  </Sheet>
}

function MisreadPage({ n }) {
  const steps = [['👁', 'קוראים'], ['🧠', 'שואלים: זה הגיוני?'], ['🔑', 'לא? בודקים שוב אות־אות']]
  return <Sheet n={n} arts={['🧠']} title="האם זה הגיוני?" sub="קורא טוב שם לב כשמשפט לא מסתדר — ובודק שוב">
    <div style={{ display: 'flex', gap: '3mm', margin: '0 0 2.5mm' }}>
      {steps.map(([e, t], i) => <div key={t} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2mm', border: `2px solid ${ACCENT}`, borderRadius: 10, padding: '1.5mm 2mm', fontSize: '11pt', fontWeight: 700 }}>
        <Art e={e} size={8} />{i + 1}. {t}
      </div>)}
    </div>
    <Task letter="✓">בכל משפט מילה אחת נקראה עם אות דומה. מקיפים אותה וכותבים את המילה הנכונה.</Task>
    <ol style={{ margin: 0, paddingInlineStart: 26, fontSize: '14pt', lineHeight: 1.4 }}>
      {MISREAD.map(([s]) => <li key={s} style={{ marginBottom: '2.2mm' }}>{s}<div style={{ fontSize: '11pt', marginTop: '0.8mm', color: '#333' }}>המילה הנכונה: ________________</div></li>)}
    </ol>
  </Sheet>
}

// A table of sessions, milestones to colour, and an empty graph (20–160 words per minute).
function ProgressPage({ n }) {
  const x0 = 60, x1 = 580, y0 = 12, y1 = 292, sessions = 12, lo = 20, hi = 160
  const xs = i => x1 - (i + 0.5) * (x1 - x0) / sessions, ys = v => y1 - (v - lo) * (y1 - y0) / (hi - lo)
  const badges = [['⭐', 'עליתי ב־10 מילים בדקה'], ['🎯', 'דיוק של 95% ומעלה'], ['💪', 'קריאה בלי אף שגיאה']]
  return <Sheet n={n} arts={['💪']} title="מעקב ההתקדמות שלי" sub="אחרי כל מפגש רושמים את הקריאה הטובה ביותר ומסמנים נקודה בגרף">
    <table style={{ ...tableStyle, fontSize: '10pt' }}>
      <thead><tr>{['מפגש', 'תאריך', 'מה קראתי (עמוד)', 'שגיאות', 'מילים נכונות בדקה'].map(h => <th key={h} style={head}>{h}</th>)}</tr></thead>
      <tbody>{Array.from({ length: sessions }, (_, i) => <tr key={i} style={{ height: '6.3mm' }}><th style={{ ...head, fontWeight: 700, padding: '0.6mm' }}>{i + 1}</th><td style={cell} /><td style={cell} /><td style={cell} /><td style={cell} /></tr>)}</tbody>
    </table>
    <svg viewBox="0 0 600 330" role="img" aria-label="גרף מילים נכונות בדקה" style={{ width: '100%', flex: 1, minHeight: 0, marginTop: '2mm' }}>
      <g fontFamily="Heebo, Arial, sans-serif" fontSize="12" fill="#333">
        {Array.from({ length: (hi - lo) / 10 + 1 }, (_, k) => { const v = lo + k * 10, y = ys(v); return <g key={v}>
          <path d={`M${x0} ${y}H${x1}`} stroke={v % 50 === 0 ? '#888' : '#ccc'} strokeWidth="1" />
          <text x={x0 - 8} y={y + 4} textAnchor="end">{v}</text>
        </g> })}
        {Array.from({ length: sessions }, (_, i) => <g key={i}>
          <path d={`M${xs(i)} ${y0}V${y1}`} stroke="#e3e3e3" />
          <text x={xs(i)} y={y1 + 17} textAnchor="middle">{i + 1}</text>
        </g>)}
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#111" strokeWidth="1.5" />
        <text x={(x0 + x1) / 2} y={y1 + 34} textAnchor="middle" fontWeight="700" direction="rtl">מספר המפגש</text>
        <text x={14} y={(y0 + y1) / 2} textAnchor="middle" fontWeight="700" direction="rtl" transform={`rotate(-90 14 ${(y0 + y1) / 2})`}>מילים נכונות בדקה</text>
      </g>
    </svg>
    <div style={{ display: 'flex', gap: '3mm', marginTop: '2mm' }}>
      {badges.map(([e, t]) => <div key={t} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2mm', border: `2px solid ${ACCENT}`, borderRadius: 10, padding: '1.5mm 2mm', fontSize: '10pt' }}>
        <span style={{ fontSize: '15pt' }} aria-hidden="true">{e}</span><span>{t}<br />תאריך: ________</span>
      </div>)}
    </div>
  </Sheet>
}

function KeyPage({ n }) {
  // inline: short answers run on as "1. x  2. y"; otherwise a numbered list.
  const sections = [
    { title: 'עמוד 3 — א. תחיליות', inline: true, answers: PREFIX_SPLIT.map(([, s]) => s) },
    { title: 'עמוד 3 — ב. מתחילות בתחילית', text: `${PREFIX_OR_NOT.filter(([, y]) => y).map(([w]) => w).join(', ')}. בלי תחילית: ${PREFIX_OR_NOT.filter(([, y]) => !y).map(([w]) => w).join(', ')}.` },
    { title: 'עמוד 4 — אותיות דומות', inline: true, answers: LOOKALIKE.map(([, , , a]) => a) },
    { title: 'עמוד 7 — ב. חלוקה מוצעת (גם חלוקות אחרות יכולות להיות נכונות)', start: 6, answers: PHRASES_TODO.map(([, d]) => d) },
    { title: 'עמוד 12 — שאלות הבנה (בשאלות הפתוחות מקבלים כל ניסוח נכון)', answers: QUESTIONS.map(q => q.a) },
    { title: 'עמוד 13 — האם זה הגיוני?', inline: true, answers: MISREAD.map(([, w, r]) => `${w} ← ${r}`) },
  ]
  return <A4 style={{ alignItems: 'stretch', textAlign: 'right' }}>
    <Banner n={n} arts={['📖']} title="דף תשובות" sub="למורה ולהורים" />
    <div style={{ columns: 2, columnGap: 24, fontSize: '10.3pt', lineHeight: 1.4 }}>
      {sections.map(s => <section key={s.title} style={{ breakInside: 'avoid', marginBottom: 8 }}>
        <b>{s.title}</b>
        {s.text && <div>{s.text}</div>}
        {s.inline && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 10px' }}>{s.answers.map((a, i) => <span key={i}>{i + 1}. {a}</span>)}</div>}
        {!s.text && !s.inline && <ol start={s.start || 1} style={{ margin: '2px 0 0', paddingInlineStart: 22 }}>{s.answers.map((a, i) => <li key={i}>{a}</li>)}</ol>}
      </section>)}
    </div>
  </A4>
}

export default function ReadingFluencyBooklet({ seed }) {
  return <>
    <CoverPage />
    <TeacherPage n={2} />
    <PrefixPage n={3} />
    <LookalikePage n={4} />
    <GridPage n={5} title="טבלת מהירות: מילים שכיחות" words={GRID_COMMON} seed={seed} salt={51} size="20pt" tip="מילים קצרות שחוזרות בכל טקסט — כדאי לזהות אותן במבט אחד." />
    <GridPage n={6} title="טבלת מהירות: מילים עם תחיליות" words={GRID_PREFIX} seed={seed} salt={52} size="16.5pt" tip="מזהים קודם את התחילית, ואחר כך את המילה." />
    <PhrasesPage n={7} />
    {PASSAGES.map((p, i) => <PassagePage key={p.id} n={8 + i} passage={p} index={i} />)}
    <QuestionsPage n={12} />
    <MisreadPage n={13} />
    <ProgressPage n={14} />
    <KeyPage n={15} />
    <Certificate booklet="חוברת שטף ודיוק בקריאה" done="קראתי כל קטע שלוש פעמים, מדדתי את הקצב שלי ועקבתי אחרי ההתקדמות." cheer="הקריאה שלי משתפרת מפעם לפעם!" />
  </>
}

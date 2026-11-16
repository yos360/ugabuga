import { A4, AnswerKey, Certificate, Cover } from './kit'
import { bookletBySlug } from './registry'
import {
  DEC_OPS, DEC_ORDER, DIV, ENGLISH, EN_WORDS, FRAC_COMPARE, FRAC_EXPAND, FRAC_REDUCE, LETTERS, MULT, ODD_ONE, POS, POS_WORDS,
  READING_MC, READING_OPEN, READING_ORDER, RIDDLES, ROOTS, SCIENCE_TF, SEQUENCES, TENSES, TIME_Q, WATER, WATER_BANK, WORD,
  compareSign, dashed, decResult, decSorted, evaluate, expand, num, reduce, seqNext, timeAnswer,
} from './worksheetsGrade5Data'

// "דפי עבודה לכיתה ה׳ — חוברת משולבת": one printable booklet with a page or two from each grade 5 subject —
// multi-digit ×, long ÷, fractions, decimals, word problems, a reading passage with questions, roots and word
// families, parts of speech, tenses, English grammar, science true/false, the water cycle and thinking puzzles.
// All answers come from worksheetsGrade5Data.js.
const PAGES = bookletBySlug('worksheets-grade-5').pages
// One compact line per exercise group (read right to left, in exercise order), so the key fits one page.
const list = xs => xs.map(x => (typeof x === 'number' ? num(x) : x)).join(' , ')

const box = { border: '2px solid #111', borderRadius: 12, padding: '3mm 4mm' }
const line = { borderBottom: '1.5px solid #555', display: 'inline-block', minWidth: '28mm', height: '1.1em' }
const Blank = ({ w = 28 }) => <span style={{ ...line, minWidth: `${w}mm` }} />
const Frac = ({ a, b }) => <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', lineHeight: 1.05, margin: '0 3px', fontWeight: 700 }}>
  <span style={{ borderBottom: '2px solid #111', padding: '0 4px' }}>{a ?? ' '}</span><span style={{ padding: '0 4px' }}>{b}</span>
</span>

function Sheet({ n, title, emoji, instruction, children }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2 style={{ margin: '0 0 2px' }}>{emoji} {title}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 13 }}>שם: ______________ · עמוד {n} בחוברת</p>
    <p style={{ textAlign: 'center', margin: '0 0 10px', fontSize: '12.5pt', fontWeight: 700 }}>{instruction}</p>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '12.5pt', lineHeight: 1.55, paddingBottom: '17%' }}>{children}</div>
  </A4>
}

// Vertical exercises in a grid, with room to work.
function ColumnPage({ n, title, emoji, instruction, items, op }) {
  return <Sheet n={n} title={title} emoji={emoji} instruction={instruction}>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(4, 1fr)', gap: 10 }}>
      {items.map(([a, b], i) => <div key={i} style={{ ...box, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} dir="ltr">
        <span style={{ alignSelf: 'flex-start', fontSize: 12, color: '#555' }}>{i + 1}</span>
        {op === '×'
          ? <div style={{ fontSize: '18pt', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace', marginInlineEnd: '6mm' }}>
            <div>{a}</div><div style={{ borderBottom: '2px solid #111' }}>× {b}</div>
          </div>
          : <div style={{ fontSize: '18pt', fontWeight: 700, fontFamily: 'monospace', alignSelf: 'flex-start', marginInlineStart: '4mm' }}>
            {b} <span style={{ borderTop: '2px solid #111', borderLeft: '2px solid #111', padding: '0 6px' }}>{a}</span>
          </div>}
      </div>)}
    </div>
  </Sheet>
}

function FractionsPage({ n }) {
  return <Sheet n={n} title="שברים: צמצום, הרחבה והשוואה" emoji="🍕" instruction="מצמצמים עד הסוף, משלימים את המונה החסר ומשווים בעזרת > < =">
    <div style={box}>
      <b>א. מצמצמים עד שאי אפשר יותר</b>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 4px', marginTop: 8, fontSize: '16pt' }}>
        {FRAC_REDUCE.map(([a, b], i) => <span key={i} dir="ltr" style={{ textAlign: 'center' }}><Frac a={a} b={b} /> = <Frac a={null} b={' '} /></span>)}
      </div>
    </div>
    <div style={box}>
      <b>ב. משלימים את המונה החסר (מרחיבים)</b>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8, fontSize: '16pt' }}>
        {FRAC_EXPAND.map(([a, b, d], i) => <span key={i} dir="ltr" style={{ textAlign: 'center' }}><Frac a={a} b={b} /> = <Frac a={null} b={d} /></span>)}
      </div>
    </div>
    <div style={{ ...box, flex: 1 }}>
      <b>ג. כותבים &gt;, &lt; או = בעיגול</b>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px 4px', marginTop: 10, fontSize: '16pt' }}>
        {FRAC_COMPARE.map(([a, b, c, d], i) => <span key={i} dir="ltr" style={{ textAlign: 'center' }}>
          <Frac a={a} b={b} /> <span style={{ display: 'inline-block', width: 30, height: 30, border: '2px solid #111', borderRadius: '50%', verticalAlign: 'middle' }} /> <Frac a={c} b={d} />
        </span>)}
      </div>
      <p style={{ fontSize: '11pt', margin: '14px 0 0' }}>טיפ: כדי להשוות, מביאים את שני השברים לאותו מכנה.</p>
    </div>
  </Sheet>
}

function DecimalsPage({ n }) {
  return <Sheet n={n} title="מספרים עשרוניים" emoji="🔟" instruction="פותרים במאונך במחברת או כאן, ומסדרים מהקטן לגדול">
    <div style={{ ...box, flex: 1 }}>
      <b>א. פותרים (שימו לב לנקודה העשרונית!)</b>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 10px', marginTop: 12, fontSize: '16pt' }} dir="ltr">
        {DEC_OPS.map(([a, op, b], i) => <span key={i}>{a} {op} {b} = <Blank w={24} /></span>)}
      </div>
    </div>
    <div style={box}>
      <b>ב. מסדרים מהקטן לגדול</b>
      {DEC_ORDER.map((row, i) => <div key={i} style={{ marginTop: 10, fontSize: '14.5pt' }}>
        <span dir="ltr" style={{ fontWeight: 700 }}>{row.join('    ')}</span>
        <div dir="ltr" style={{ marginTop: 4 }}><Blank w={18} /> &lt; <Blank w={18} /> &lt; <Blank w={18} /> &lt; <Blank w={18} /></div>
      </div>)}
    </div>
  </Sheet>
}

function WordPage({ n }) {
  const all = [...WORD.slice(0, 4), TIME_Q, ...WORD.slice(4)]
  return <Sheet n={n} title="שאלות מילוליות" emoji="🧮" instruction="קוראים פעמיים, כותבים תרגיל ותשובה מלאה">
    {all.map((it, i) => <div key={i} style={{ flex: 1, borderBottom: i < all.length - 1 ? '1px dashed #bbb' : 0, paddingBottom: 4 }}>
      <b>{i + 1}.</b> {it.t[0]} <b>{it.t[1]}</b>
      <div style={{ marginTop: 6 }}>תרגיל: <Blank w={55} />  תשובה: <Blank w={35} /></div>
    </div>)}
  </Sheet>
}

function ReadingPage({ n }) {
  return <Sheet n={n} title="העגורים של עמק החולה" emoji="🪶" instruction="קוראים את הקטע בעיון. בעמוד הבא יש שאלות">
    <div style={{ ...box, border: '3px double #111', fontSize: '13pt', lineHeight: 1.75, textAlign: 'justify', padding: '4mm 6mm' }}>
      <p style={{ marginTop: 0 }}>העגור האפור הוא ציפור גדולה ויפה: גובהו יותר ממטר, מוטת כנפיו כשני מטרים, ועל ראשו כתם אדום קטן. בקיץ העגורים חיים ומקננים בצפון אירופה וברוסיה. בסתיו, כשמתחיל להתקרר, הם יוצאים למסע ארוך דרומה. העגורים <b>נודדים</b> פעמיים בשנה: בסתיו לכיוון החום, ובאביב חזרה צפונה, אל המקומות שבהם הם מטילים ביצים ומגדלים גוזלים.</p>
      <p>העגורים עפים בלהקות גדולות, בדרך כלל בצורת האות V. כך קל להם יותר לעוף, כי כל עגור נעזר בזרם האוויר שיוצר העגור שלפניו. בזמן המעוף הם קוראים זה לזה בקולות חזקים, שאפשר לשמוע גם כשהלהקה גבוהה מאוד בשמיים.</p>
      <p>ישראל נמצאת בדרך שבין אירופה לאפריקה, ולכן עוברות מעליה בכל סתיו מאות אלפי ציפורים נודדות. בעבר רוב העגורים המשיכו לאפריקה, אבל לפני כשלושים שנה התחילו עשרות אלפים מהם להישאר בעמק החולה לכל החורף. בעמק יש מים, ובשדות יש הרבה מזון. החקלאים דאגו מאוד: העגורים אכלו את הגידולים שלהם, והנזק היה גדול.</p>
      <p style={{ marginBottom: 0 }}>הפתרון שנמצא היה פשוט ומיוחד: באגמון החולה מפזרים לעגורים תירס במקום אחד, כדי שיאכלו שם ולא יפגעו בשדות. כך החקלאים שומרים על היבול, העגורים מקבלים מזון בחורף, ומטיילים רבים מגיעים מכל הארץ ומכל העולם כדי לראות את הלהקות הענקיות ממריאות בזריחה. כשמגיע האביב, העגורים עוזבים את העמק ועפים צפונה — עד הסתיו הבא.</p>
    </div>
    <div style={{ ...box, fontSize: '11.5pt' }}>
      <b>מילון קטן:</b> מוטת כנפיים — המרחק מקצה כנף אחת לקצה הכנף השנייה · מקננים — בונים קן ומטילים בו ביצים · יבול — מה שגדל בשדה ונקטף · ממריאות — מתרוממות לעוף
    </div>
  </Sheet>
}

function ReadingQuestionsPage({ n }) {
  return <Sheet n={n} title="שאלות על הקטע" emoji="❓" instruction="מקיפים את התשובה הנכונה, ממספרים לפי הסדר ועונים במשפטים מלאים">
    {READING_MC.map((it, i) => <div key={i}>
      <b>{i + 1}. {it.q}</b>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 18px', paddingInlineStart: 18 }}>{it.o.map((o, j) => <span key={j}>{LETTERS[j]}. {o}</span>)}</div>
    </div>)}
    <div>
      <b>6. מספרים 1–4 לפי סדר המסע של העגורים בשנה:</b>
      {READING_ORDER.map(([s], i) => <div key={i} style={{ paddingInlineStart: 18 }}><span style={{ display: 'inline-block', width: 26, height: 22, border: '2px solid #111', borderRadius: 6, verticalAlign: 'middle', marginInlineEnd: 8 }} />{s}</div>)}
    </div>
    {READING_OPEN.map((q, i) => <div key={i} style={{ flex: 1 }}>
      <b>{7 + i}. {q}</b>
      <div style={{ borderBottom: '1px solid #777', height: '1.7em' }} /><div style={{ borderBottom: '1px solid #777', height: '1.7em' }} />
    </div>)}
  </Sheet>
}

function RootsPage({ n }) {
  return <Sheet n={n} title="לשון: שורש ומשפחת מילים" emoji="🌱" instruction="כותבים את השורש של כל מילה, ומוצאים את המילה שלא שייכת למשפחה">
    <div style={box}>
      <b>א. מה השורש? (שלוש אותיות)</b>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginTop: 10, fontSize: '15pt' }}>
        {ROOTS.map(([w], i) => <span key={i}><b>{w}</b> ← <Blank w={10} /> ־ <Blank w={10} /> ־ <Blank w={10} /></span>)}
      </div>
    </div>
    <div style={{ ...box, flex: 1 }}>
      <b>ב. בכל שורה יש מילה אחת שהשורש שלה שונה. מקיפים אותה וכותבים את השורש של שאר המילים</b>
      {ODD_ONE.map((it, i) => <div key={i} style={{ marginTop: 14, fontSize: '15pt' }}>
        <span style={{ display: 'inline-flex', gap: 22, fontWeight: 700 }}>{it.w.map(w => <span key={w}>{w}</span>)}</span>
        <span style={{ marginInlineStart: 20, fontSize: '12.5pt' }}>השורש המשותף: <Blank w={22} /></span>
      </div>)}
    </div>
  </Sheet>
}

function PosPage({ n }) {
  const cols = Object.values(POS)
  return <Sheet n={n} title="לשון: חלקי דיבר" emoji="🔤" instruction="מעתיקים כל מילה לעמודה המתאימה: שם עצם, פועל או שם תואר">
    <div style={{ ...box, display: 'flex', flexWrap: 'wrap', gap: '8px 22px', justifyContent: 'center', fontSize: '15pt', fontWeight: 700 }}>
      {POS_WORDS.map(([w]) => <span key={w}>{w}</span>)}
    </div>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {cols.map(c => <div key={c} style={{ ...box, display: 'flex', flexDirection: 'column' }}>
        <b style={{ textAlign: 'center', fontSize: '14pt', borderBottom: '2px solid #111', paddingBottom: 4 }}>{c}</b>
        {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ flex: 1, borderBottom: '1px solid #aaa' }} />)}
      </div>)}
    </div>
    <div style={box}>
      <b>אתגר:</b> כתבו משפט אחד שיש בו שם עצם, פועל ושם תואר, ומתחו קו מתחת לכל אחד מהם.
      <div style={{ borderBottom: '1px solid #777', height: '1.8em' }} />
    </div>
  </Sheet>
}

function TensesPage({ n }) {
  const heads = ['עבר (אתמול הוא...)', 'הווה (עכשיו הוא...)', 'עתיד (מחר הוא...)']
  return <Sheet n={n} title="לשון: עבר, הווה ועתיד" emoji="⏳" instruction="בכל שורה כתוב פועל אחד. משלימים את שני הזמנים החסרים">
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15pt', textAlign: 'center' }}>
      <thead><tr>{heads.map(h => <th key={h} style={{ border: '2px solid #111', padding: 6, background: '#eee', fontSize: '12.5pt' }}>{h}</th>)}</tr></thead>
      <tbody>{TENSES.map((r, i) => <tr key={i}>{r.f.map((f, j) => <td key={j} style={{ border: '2px solid #111', padding: '11px 6px', fontWeight: 700 }}>{j === r.show ? f : ''}</td>)}</tr>)}</tbody>
    </table>
    <div style={{ ...box, flex: 1 }}>
      <b>משנים את המשפט לזמן עתיד:</b>
      {['אתמול רוני שתל עץ בחצר.', 'היום אנחנו קוראים ספר חדש.', 'בשבוע שעבר נעמה ציירה ציור של הים.'].map((s, i) => <div key={i} style={{ marginTop: 10 }}>
        {i + 1}. {s}<div style={{ borderBottom: '1px solid #777', height: '1.7em' }} />
      </div>)}
    </div>
  </Sheet>
}

function EnglishPage({ n }) {
  return <Sheet n={n} title="English: Choose the Right Word" emoji="🇬🇧" instruction="מקיפים את המילה הנכונה, ומתאימים כל מילה לתרגום שלה">
    <div dir="ltr" style={{ ...box, textAlign: 'left', fontSize: '13.5pt' }}>
      {ENGLISH.map(([s, o], i) => <div key={i} style={{ padding: '3px 0', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <span>{i + 1}. {s}</span><span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{o[0]} / {o[1]}</span>
      </div>)}
    </div>
    <div style={{ ...box, flex: 1 }}>
      <b>מותחים קו בין המילה באנגלית לתרגום שלה</b>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px', marginTop: 10, fontSize: '14.5pt' }}>
        {EN_WORDS.map(([en], i) => { const he = EN_WORDS[(i + 2) % EN_WORDS.length][1]; return [
          <span key={`h${i}`} style={{ textAlign: 'right' }}>● {he}</span>,
          <span key={`e${i}`} dir="ltr" style={{ textAlign: 'left', fontWeight: 700 }}>{en} ●</span>,
        ] })}
      </div>
    </div>
  </Sheet>
}

function SciencePage({ n }) {
  return <Sheet n={n} title="מדעים: נכון או לא נכון?" emoji="🔬" instruction="מקיפים נכון או לא נכון. משפט שאינו נכון — מתקנים בשורה">
    {SCIENCE_TF.map(([s], i) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: i < SCIENCE_TF.length - 1 ? '1px dashed #bbb' : 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span>{i + 1}. {s}</span><b style={{ whiteSpace: 'nowrap' }}>נכון / לא נכון</b></div>
      <div style={{ fontSize: '10.5pt', color: '#555' }}>תיקון: ___________________________________________</div>
    </div>)}
  </Sheet>
}

function WaterPage({ n }) {
  return <Sheet n={n} title="מדעים: מחזור המים" emoji="💧" instruction="משלימים כל משפט במילה מהמחסן. כל מילה פעם אחת">
    <div style={{ ...box, display: 'flex', justifyContent: 'center', gap: 22, fontWeight: 700, fontSize: '15pt' }}>{WATER_BANK.map(w => <span key={w}>{w}</span>)}</div>
    {WATER.map(([s], i) => <div key={i}><b>{i + 1}.</b> {s} <Blank w={30} />.</div>)}
    <div style={{ ...box, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <b>מציירים את מחזור המים: ים, שמש, ענן, גשם ונחל. מסמנים בחצים את הדרך של המים.</b>
      <div style={{ flex: 1 }} />
    </div>
  </Sheet>
}

function ThinkingPage({ n }) {
  return <Sheet n={n} title="חשיבה: סדרות וחידות" emoji="🧠" instruction="מגלים את החוק של כל סדרה וממשיכים אותה, ופותרים את החידות">
    <div style={box}>
      {SEQUENCES.map((s, i) => <div key={i} dir="ltr" style={{ fontSize: '16pt', fontWeight: 700, padding: '6px 0', textAlign: 'left' }}>
        {s.start.join(' ,  ')} ,  <Blank w={14} /> ,  <Blank w={14} />
        <span dir="rtl" style={{ fontSize: '11.5pt', fontWeight: 400, marginLeft: 16 }}>החוק: <Blank w={34} /></span>
      </div>)}
    </div>
    {RIDDLES.map((r, i) => <div key={i} style={{ ...box, flex: 1 }}>
      <b>חידה {i + 1}:</b> {r.t}
      <div style={{ marginTop: 8 }}>תשובה: <Blank w={30} /></div>
    </div>)}
  </Sheet>
}

export default function WorksheetsGrade5() {
  const pages = PAGES.slice(1, -2)
  return <>
    <Cover emoji="📚✏️🧮" title="דפי עבודה לכיתה ה׳" subtitle="חוברת משולבת: חשבון, הבנת הנקרא, לשון, אנגלית, מדעים וחשיבה" pages={PAGES}
      note="כל עמוד עומד בפני עצמו, אז אפשר לפתור לפי הסדר או לבחור עמוד בכל יום. בעמודי החשבון כדאי לבקש מהילד לכתוב את דרך הפתרון ולא רק את התשובה. בסוף החוברת יש דף תשובות." />
    <ColumnPage n={2} title={pages[0]} emoji="✖️" instruction="פותרים במאונך. אפשר להיעזר בלוח הכפל" items={MULT} op="×" />
    <ColumnPage n={3} title={pages[1]} emoji="➗" instruction="מחלקים בחילוק ארוך ובודקים בכפל" items={DIV} op="÷" />
    <FractionsPage n={4} />
    <DecimalsPage n={5} />
    <WordPage n={6} />
    <ReadingPage n={7} />
    <ReadingQuestionsPage n={8} />
    <RootsPage n={9} />
    <PosPage n={10} />
    <TensesPage n={11} />
    <EnglishPage n={12} />
    <SciencePage n={13} />
    <WaterPage n={14} />
    <ThinkingPage n={15} />
    <AnswerKey n={16} sections={[
      { title: 'עמוד 2 — כפל', answers: [list(MULT.slice(0, 4).map(([a, b]) => a * b)), list(MULT.slice(4).map(([a, b]) => a * b))] },
      { title: 'עמוד 3 — חילוק', answers: [list(DIV.map(([a, b]) => a / b))] },
      { title: 'עמוד 4 — שברים', answers: [
        'א. ' + FRAC_REDUCE.map(f => reduce(f).join('/')).join(' , '),
        'ב. ' + FRAC_EXPAND.map(expand).join(' , '),
        'ג. ' + FRAC_COMPARE.map(compareSign).join(' , '),
      ] },
      { title: 'עמוד 5 — עשרוניים', answers: ['א. ' + DEC_OPS.map(decResult).join(' , '), 'ב. ' + DEC_ORDER.map(r => decSorted(r)[0] + '…' + decSorted(r)[3]).join(' ; ') + ' (מהקטן לגדול)'] },
      { title: 'עמוד 6 — שאלות מילוליות', answers: [...WORD.slice(0, 4), null, ...WORD.slice(4)].map(w => (w ? `${w.ex} = ${num(evaluate(w.ex))} ${w.u}` : timeAnswer(TIME_Q))) },
      { title: 'עמוד 8 — שאלות על הקטע', answers: [
        'שאלות 1–5: ' + list(READING_MC.map(it => LETTERS[it.a])),
        '6. ' + list(READING_ORDER.map(([, k]) => k)) + ' (לפי סדר השורות)',
        '7. לחקלאים — השדות נשמרים; לעגורים — יש מזון בחורף; למטיילים — רואים את הלהקות.',
      ] },
      { title: 'עמוד 9 — שורשים', answers: ['א. ' + ROOTS.map(([, r]) => dashed(r)).join(' , '), 'ב. ' + ODD_ONE.map(it => `${it.odd} (${dashed(it.root)})`).join(' , ')] },
      { title: 'עמוד 10 — חלקי דיבר', answers: Object.entries(POS).map(([k, name]) => `${name}: ${POS_WORDS.filter(([, p]) => p === k).map(([w]) => w).join(', ')}`) },
      { title: 'עמוד 11 — זמנים', answers: [TENSES.map(r => r.f.join('/')).join(' , '), 'ישתול · נקרא · תצייר'] },
      { title: 'עמוד 12 — English', answers: [ENGLISH.map(([, o, a], i) => `${i + 1}. ${o[a]}`).join('  '), EN_WORDS.map(([e, h]) => `${e} = ${h}`).join(' , ')] },
      { title: 'עמוד 13 — מדעים', answers: [`נכון: ${SCIENCE_TF.map((r, i) => (r[1] ? i + 1 : null)).filter(Boolean).join(', ')}`, ...SCIENCE_TF.map((r, i) => (r[1] ? null : `${i + 1}. ${r[2]}`)).filter(Boolean)] },
      { title: 'עמוד 14 — מחזור המים', answers: [WATER.map(([, w]) => w).join(' , ')] },
      { title: 'עמוד 15 — סדרות וחידות', answers: [SEQUENCES.map(s => seqNext(s).join(', ')).join(' ; '), 'חידות: ' + RIDDLES.map(r => r.a).join(' , ')] },
    ]} />
    <Certificate booklet="חוברת דפי העבודה לכיתה ה׳" done="פתרתי תרגילים בחשבון, קראתי והבנתי, תרגלתי לשון ואנגלית וחקרתי במדעים." cheer="תלמיד/ה של כיתה ה׳ במלוא הכוח! 🌟" />
  </>
}

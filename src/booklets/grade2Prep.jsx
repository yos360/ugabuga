import { GRADED_READING } from '../learn/readingGrades'
import { A4, Certificate, ChoicePage, Cover, FillPage, Head, MatchPage, SvgPage, rngFor } from './kit'
import { Clock, Problems } from './mathGrade2'
import { bookletBySlug } from './registry'

// "חוברת הכנה לכיתה ב׳" — what a child finishing first grade should be comfortable with: two short
// reading passages from the site's set, first letters, plurals, opposites, punctuation, the order of the
// alphabet, add and subtract to 20 and to 100, comparing, number patterns, the clock and word problems.
// Every answer is computed from (or sits next to) the data below, so the answer key cannot drift.
const PAGES = bookletBySlug('grade-2-prep').pages
const FONT = 'Heebo, Arial, sans-serif'
const LETTERS = ['א', 'ב', 'ג', 'ד']

export const PASSAGES = ['cake-for-grandma', 'class-garden'].map(slug => GRADED_READING.find(p => p.slug === slug))

// Page 4: [picture, the word, right first letter, two other letters].
export const FIRST_LETTERS = [
  ['🐶', 'כלב', 'כ', 'ק', 'ג'], ['🌸', 'פרח', 'פ', 'ב', 'ח'], ['🐱', 'חתול', 'ח', 'כ', 'ה'], ['🐟', 'דג', 'ד', 'ר', 'ז'],
  ['🌳', 'עץ', 'ע', 'א', 'צ'], ['🏠', 'בית', 'ב', 'פ', 'ד'], ['☀️', 'שמש', 'ש', 'ס', 'ת'], ['🍎', 'תפוח', 'ת', 'ט', 'ח'],
]
// Page 5: singular and plural.
export const PLURALS = [['ספר', 'ספרים'], ['כדור', 'כדורים'], ['ילדה', 'ילדות'], ['כוס', 'כוסות'], ['פרח', 'פרחים'], ['שולחן', 'שולחנות'], ['כיסא', 'כיסאות'], ['תפוח', 'תפוחים']]
// Page 6: opposites.
export const OPPOSITES = [['גדול', 'קטן'], ['חם', 'קר'], ['יום', 'לילה'], ['רטוב', 'יבש'], ['מלא', 'ריק'], ['שמח', 'עצוב']]
// Page 7: the mark that ends each sentence.
export const SENTENCES = [['איפה הכדור שלי', '?'], ['דנה הולכת לבית הספר', '.'], ['איזה יום יפה היום', '!'], ['מה השעה עכשיו', '?'], ['אבא קנה לנו גלידה', '.'], ['וואו, איזו עוגה גדולה', '!']]
// Page 8: two letters in a row — which letter comes next in the alphabet.
export const ALPHABET = [['ג', 'ד', 'ה'], ['ח', 'ט', 'י'], ['ל', 'מ', 'נ'], ['ע', 'פ', 'צ'], ['ק', 'ר', 'ש'], ['ו', 'ז', 'ח']]

const sum = (a, b) => ({ text: `${a} + ${b} = ____`, ans: a + b })
const sub = (a, b) => ({ text: `${a} − ${b} = ____`, ans: a - b })
// Page 9: add and subtract to 20, alternating.
export const TO_20 = [sum(8, 5), sub(13, 5), sum(9, 6), sub(15, 8), sum(7, 7), sub(12, 4), sum(12, 5), sub(17, 9), sum(4, 8), sub(14, 6), sum(11, 7), sub(20, 12)]
// Page 10: whole tens and ones to 100.
export const TO_100 = [sum(30, 20), sub(85, 5), sum(40, 50), sub(70, 30), sum(60, 7), sub(48, 8), sum(52, 4), sub(90, 40), sum(23, 5), sub(36, 6), sum(64, 30), sub(79, 9)]
// Page 11: the circle gets > < or =.
export const COMPARE = [[47, 74], [58, 58], [63, 36], [90, 19], [85, 89], [100, 99], [31, 13], [29, 92], [66, 68], [42, 24]]
const symbol = (a, b) => a > b ? '>' : a < b ? '<' : '='
// Page 12: [start, step, length, blank positions].
export const SEQUENCES = [[2, 2, 7, [2, 5]], [5, 5, 6, [2, 4]], [10, 10, 7, [3, 5]], [20, -2, 6, [2, 4]], [15, -1, 7, [2, 5]], [50, -10, 6, [1, 4]]]
const seqValues = ([start, step, len]) => Array.from({ length: len }, (_, i) => start + i * step)
// Page 13: [hour, minute] with minutes 0 or 30.
export const CLOCKS = [[3, 0], [8, 0], [11, 0], [2, 30], [6, 30], [10, 30]]
// Page 14.
export const WORD_PROBLEMS = [
  { q: 'לנועה יש 14 מדבקות. חברתה נתנה לה עוד 5 מדבקות. כמה מדבקות יש לנועה עכשיו?', ans: '14 + 5 = 19' },
  { q: 'בכיתה של איתי יש 18 ילדים. 7 ילדים יצאו להפסקה. כמה ילדים נשארו בכיתה?', ans: '18 − 7 = 11' },
  { q: 'בשקית אחת יש 10 לימונים ובשקית שנייה יש 10 לימונים. כמה לימונים יש בשתי השקיות?', ans: '10 + 10 = 20' },
  { q: 'ליוסי יש 30 שקלים. הוא קנה מחברת ב־20 שקלים. כמה שקלים נשארו לו?', ans: '30 − 20 = 10' },
  { q: 'השיעור של מיה התחיל בשעה 8:00 ונמשך שעה אחת. באיזו שעה הוא נגמר?', ans: '9:00' },
]

const caption = (n, text) => <p style={{ textAlign: 'center', margin: '0 0 3mm', fontSize: '11pt' }}>שם: ______________ · עמוד {n} בחוברת · {text}</p>

function PassagePage({ n, passage, fontSize, qSize, lineH }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>{passage.emoji} {passage.title}</h2>
    {caption(n, 'קוראים פעם אחת, ואז מקיפים את התשובה הנכונה')}
    <div style={{ fontSize, lineHeight: 1.55, border: '0.5mm solid #111', borderRadius: '3mm', padding: '3mm 4mm', marginBottom: '3mm' }}>
      {passage.text.map((t, i) => <p key={i} style={{ margin: '0 0 1.5mm' }}>{t}</p>)}
    </div>
    <ol style={{ fontSize: qSize, lineHeight: 1.3, padding: '0 6mm 0 0', margin: 0 }}>
      {passage.q.map(([q, options]) => <li key={q} style={{ marginBottom: '3mm' }}>
        <b>{q}</b>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 6mm' }}>{options.map((o, j) => <span key={o}>{LETTERS[j]}. {o}</span>)}</div>
      </li>)}
    </ol>
    {passage.open.map(([q]) => <div key={q} style={{ marginTop: '1mm', fontSize: qSize }}>
      <b>{passage.q.length + 1}. {q}</b>
      {[0, 1, 2].map(k => <div key={k} style={{ borderBottom: '0.3mm solid #888', height: lineH }} />)}
    </div>)}
  </A4>
}

const letterItems = seed => FIRST_LETTERS.map(([pic, word, right, x, y], i) => ({
  pic: { art: pic }, word, options: rngFor(seed, 30 + i).shuffle([right, x, y]), answer: right,
}))

const pluralLines = PLURALS.map(([one]) => `${one}   ←   ________________`)

function PunctuationPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✏️ איזה סימן בסוף המשפט?</h2>
    {caption(n, 'מקיפים את הסימן שמתאים')}
    <p style={{ textAlign: 'center', margin: '0 0 3mm', fontSize: '12pt' }}>נקודה <b>.</b> &nbsp; · &nbsp; סימן שאלה <b>?</b> &nbsp; · &nbsp; סימן קריאה <b>!</b></p>
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${SENTENCES.length}, 1fr)` }}>
      {SENTENCES.map(([text], i) => <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '4mm', borderBottom: i < SENTENCES.length - 1 ? '0.3mm dashed #bbb' : 0 }}>
        <span style={{ flex: 1, fontSize: '16pt' }}>{i + 1}. {text} ____</span>
        {['.', '?', '!'].map(m => <span key={m} style={{ flex: 'none', width: '14mm', height: '14mm', border: '0.6mm solid #111', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '20pt', fontWeight: 800, background: 'white' }}>{m}</span>)}
      </div>)}
    </div>
    <div style={{ flex: 'none', height: '7mm' }} />
  </A4>
}

function ComparePage({ n }) {
  return <SvgPage label="גדול, קטן או שווה">
    <Head n={n} title="גדול, קטן או שווה?" instruction="כותבים בעיגול: <  או  >  או  =" />
    {COMPARE.map(([a, b], i) => {
      const col = i % 2, y = 175 + Math.floor(i / 2) * 120, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT} fontSize="38" fontWeight="700" textAnchor="middle">
        <text x={cx - 70} y={y + 13}>{a}</text><circle cx={cx} cy={y} r="26" fill="white" stroke="#111" strokeWidth="2.5" /><text x={cx + 70} y={y + 13}>{b}</text>
      </g>
    })}
  </SvgPage>
}

function ClockPage({ n }) {
  return <SvgPage label="השעון">
    <Head n={n} title="מה השעה?" instruction="כותבים את השעה בכל שעון, למשל 4:30" />
    {CLOCKS.map(([h, m], i) => {
      const col = i % 2, y = 140 + Math.floor(i / 2) * 225, cx = col ? 150 : 450
      return <g key={i} fontFamily={FONT}>
        <Clock cx={cx} cy={y + 85} h={h} m={m} />
        <text x={cx} y={y + 198} fontSize="24" textAnchor="middle" direction="ltr">____ : ____</text>
      </g>
    })}
  </SvgPage>
}

function WordProblemsPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📖 בעיות מילוליות</h2>
    {caption(n, 'כותבים תרגיל ותשובה')}
    <ol style={{ fontSize: '15pt', lineHeight: 1.7, padding: '0 8mm 0 0', margin: '4mm 0 0' }}>
      {WORD_PROBLEMS.map(p => <li key={p.q} style={{ marginBottom: '14mm' }}>{p.q}<br />תרגיל: ______________ &nbsp; תשובה: ______________</li>)}
    </ol>
  </A4>
}

function Key({ n, seed }) {
  const list = items => items.map(it => String(it.ans))
  const letters = letterItems(seed)
  const sections = [
    ['עמוד 2 — עוגה לסבתא', PASSAGES[0].q.map(q => LETTERS[q[2]]), PASSAGES[0].open.map(([, a]) => `שאלה פתוחה, למשל: ${a}`)],
    ['עמוד 3 — הגינה של הכיתה', PASSAGES[1].q.map(q => LETTERS[q[2]]), PASSAGES[1].open.map(([, a]) => `שאלה פתוחה, למשל: ${a}`)],
    ['עמוד 4 — באיזו אות מתחילה המילה', letters.map(l => `${l.word}: ${l.answer}`)],
    ['עמוד 5 — יחיד ורבים', PLURALS.map(([a, b]) => `${a} — ${b}`)],
    ['עמוד 6 — הפכים', OPPOSITES.map(([a, b]) => `${a} — ${b}`)],
    ['עמוד 7 — סימני פיסוק', SENTENCES.map(([, m]) => m)],
    ['עמוד 8 — האות הבאה', ALPHABET.map(a => a[2])],
    ['עמוד 9 — חיבור וחיסור עד 20', list(TO_20)],
    ['עמוד 10 — חיבור וחיסור עד 100', list(TO_100)],
    ['עמוד 11 — גדול, קטן או שווה', COMPARE.map(([a, b]) => `${a} ${symbol(a, b)} ${b}`)],
    ['עמוד 12 — המספרים החסרים', SEQUENCES.map(s => s[3].map(k => seqValues(s)[k]).join(', '))],
    ['עמוד 13 — השעון', CLOCKS.map(([h, m]) => `${h}:${String(m).padStart(2, '0')}`)],
    ['עמוד 14 — בעיות מילוליות', WORD_PROBLEMS.map(p => p.ans)],
  ]
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 2mm', fontSize: '10.5pt' }}>עמוד {n} בחוברת · התשובות לפי הסדר, שורה אחר שורה</p>
    <div style={{ fontSize: '10.5pt', lineHeight: 1.45 }}>
      {sections.map(([t, a, extra]) => <section key={t} style={{ marginBottom: '1.6mm' }}>
        <b>{t}</b>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 4mm' }}>{a.map((x, i) => <span key={i}>{i + 1}) <bdi dir={/^[\d\s+−=<>:,.]+$/.test(x) ? 'ltr' : 'rtl'}>{x}</bdi></span>)}</div>
        {extra && extra.map(e => <div key={e}>{e}</div>)}
      </section>)}
    </div>
  </A4>
}

export default function Grade2PrepBooklet({ seed }) {
  const letters = letterItems(seed)
  return <>
    <Cover emoji="📚✏️🕐" title="חוברת הכנה לכיתה ב׳" subtitle="16 עמודים: קריאה, כתיבה, חשבון עד 100 ושעון" pages={PAGES}
      note="מתאימה לילד שמסיים כיתה א׳ או מתחיל כיתה ב׳. עמוד או שניים בכל פעם מספיקים. עדיף שהילד יפתור לבד ואחר כך יבדוק עם דף התשובות בעמוד 15. אם משהו קשה, חוזרים אליו עוד יום."/>
    <PassagePage n={2} passage={PASSAGES[0]} fontSize="14.5pt" qSize="13.5pt" lineH="11mm" />
    <PassagePage n={3} passage={PASSAGES[1]} fontSize="12.5pt" qSize="12.5pt" lineH="9mm" />
    <ChoicePage n={4} title="באיזו אות מתחילה המילה?" instruction="מסתכלים בתמונה ומקיפים את האות הראשונה של השם" items={letters.map(l => ({ pic: l.pic, options: l.options }))} />
    <FillPage n={5} title="יחיד ורבים" instruction="כותבים את הרבים: ים או ות" lines={pluralLines} size={28} />
    <MatchPage n={6} seed={seed} title="הפכים" instruction="מותחים קו בין שתי מילים שהן הפך אחת של השנייה" pairs={OPPOSITES.map(([a, b]) => [{ text: a }, { text: b }])} />
    <PunctuationPage n={7} />
    <FillPage n={8} title="מה האות הבאה?" instruction="ממשיכים לפי סדר האלף־בית ומשלימים את האות החסרה" lines={ALPHABET.map(([a, b]) => `${a}   ${b}   ____`)} size={38} />
    <Problems n={9} title="חיבור וחיסור עד 20" instruction="פותרים את התרגילים" items={TO_20} />
    <Problems n={10} title="חיבור וחיסור עד 100" instruction="עשרות עם עשרות, אחדות עם אחדות. פותרים" items={TO_100} />
    <ComparePage n={11} />
    <FillPage n={12} title="המספרים החסרים" instruction="ממשיכים את הסדרה וכותבים את המספרים החסרים" lines={SEQUENCES.map(s => seqValues(s).map((v, i) => s[3].includes(i) ? '____' : String(v)).join('    '))} ltr size={26} />
    <ClockPage n={13} />
    <WordProblemsPage n={14} />
    <Key n={15} seed={seed} />
    <Certificate booklet="חוברת ההכנה לכיתה ב׳" done="קראתי סיפורים, כתבתי רבים והפכים, חיברתי וחיסרתי עד 100 וקראתי שעון." cheer="כל הכבוד, מוכנים לכיתה ב׳!" />
  </>
}

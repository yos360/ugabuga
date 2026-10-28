import { coloringSrc } from '../data/coloringSubjects'
import { HANUKKAH_QUIZ } from '../data/hanukkah'
import { A4, AnswerKey, Certificate, Cover, Head, ImagePage, MatchPage, SvgPage, TracePage, W, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לחנוכה" — for kindergarten to second grade: the story in short, a quiz from the site's own
// Hanukkah quiz (src/data/hanukkah.js), counting candles, candles-per-night math, the dreidel letters,
// "what isn't Hanukkah?", a Hebrew word search, two coloring pages, answers and a certificate.
const PAGES = bookletBySlug('hanukkah').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// The quiz page: level-1 questions with three options, the right one placed by the seed.
export const QUIZ_IDS = [0, 1, 2, 3, 4, 7]
const quizItems = seed => QUIZ_IDS.map((id, i) => {
  const q = HANUKKAH_QUIZ[id], opts = rngFor(seed, 40 + i).shuffle(q.options.slice(0, 3))
  return { q: q.q, opts, answer: q.options[0] }
})

// Candles to count (without the shamash) and dreidel-and-doughnut sums.
export const COUNT_CANDLES = [3, 5, 2, 7, 4, 6]
export const SUMS = [[2, 1], [3, 2], [4, 1], [2, 2], [5, 3], [4, 4]]
// "Which one isn't Hanukkah?" — three Hanukkah things and one from another holiday.
export const NOT_HANUKKAH = [['🕎', '🍩', '🕯️', '🎭', 'מסכה — פורים'], ['🍩', '🕎', '🕯️', '🍎', 'תפוח בדבש — ראש השנה'], ['🕯️', '🍩', '🕎', '🔥', 'מדורה — ל״ג בעומר'], ['🕎', '🕯️', '🍩', '🌳', 'עץ — ט״ו בשבט']]
export const WORDS = ['חנוכייה', 'סביבון', 'סופגנייה', 'שמש', 'נרות', 'שמן', 'לביבה', 'מכבים']

function Hanukkiah({ x, y, lit, w = 220 }) {
  const step = w / 9, base = y + 60
  return <g>
    <path d={`M${x - w / 2} ${base} H${x + w / 2} M${x} ${base} V${base + 34} M${x - 40} ${base + 34} H${x + 40}`} stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
    {Array.from({ length: 9 }, (_, i) => {
      const cx = x + w / 2 - step / 2 - i * step, shamash = i === 4, h = shamash ? 54 : 38
      const on = shamash || (i < 4 ? i < lit : i - 1 < lit)
      return <g key={i}>
        <rect x={cx - 5} y={base - h} width="10" height={h} fill="white" stroke={INK} strokeWidth="2" />
        {on && <path d={`M${cx} ${base - h - 18} C${cx + 8} ${base - h - 8} ${cx + 5} ${base - h - 2} ${cx} ${base - h - 2} C${cx - 5} ${base - h - 2} ${cx - 8} ${base - h - 8} ${cx} ${base - h - 18}Z`} fill="#fbbf24" stroke={INK} strokeWidth="1.5" />}
      </g>
    })}
  </g>
}

function StoryPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📜 סיפור חנוכה</h2>
    <p style={{ textAlign: 'center', margin: '0 0 10px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · קוראים יחד ועונים</p>
    <div style={{ fontSize: '15pt', lineHeight: 1.85, padding: '0 6mm' }}>
      <p>לפני יותר מאלפיים שנה שלט בארץ ישראל מלך יווני בשם <b>אנטיוכוס</b>. הוא אסר על היהודים לשמור את מצוות התורה, ואנשיו הכניסו פסלים לבית המקדש בירושלים.</p>
      <p><b>מתתיהו</b> ובניו, שגרו בעיר <b>מודיעין</b>, יצאו למרד. בראש הלוחמים עמד <b>יהודה המכבי</b>, ולכן קוראים להם <b>המכבים</b>. אחרי שנים של קרבות הם שחררו את ירושלים.</p>
      <p>המכבים ניקו את בית המקדש וחנכו אותו מחדש — ומכאן השם <b>חנוכה</b>. לפי המסורת, הם מצאו רק פך אחד של שמן טהור, שהספיק ליום אחד, אבל המנורה דלקה <b>שמונה ימים</b>.</p>
      <p>לכן חוגגים שמונה ימים, מדליקים נרות בחנוכייה, ואוכלים סופגניות ולביבות שמטוגנות בשמן.</p>
    </div>
    <ol style={{ fontSize: '14pt', lineHeight: 2.3, padding: '0 14mm', marginTop: 8 }}>
      <li>איך קראו למלך היווני? ____________________</li>
      <li>באיזו עיר גרו מתתיהו ובניו? ____________________</li>
      <li>כמה ימים דלק השמן? ____________________</li>
    </ol>
  </A4>
}

function QuizPage({ n, seed }) {
  const items = quizItems(seed), rowH = 110, top = 140
  return <SvgPage label="חידון חנוכה">
    <Head n={n} title="חידון חנוכה" instruction="מקיפים את התשובה הנכונה" />
    {items.map((it, i) => { const y = top + i * rowH; return <g key={i} fontFamily={FONT} direction="rtl">
      <text x={570} y={y + 30} fontSize="19" fontWeight="700" textAnchor="start">{i + 1}. {it.q}</text>
      {it.opts.map((o, j) => <text key={j} x={480 - j * 185} y={y + 74} fontSize={o.length > 12 ? 16 : 19} textAnchor="middle">{o}</text>)}
      {i < items.length - 1 && <path d={`M30 ${y + rowH - 8} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function CountPage({ n }) {
  return <SvgPage label="סופרים נרות">
    <Head n={n} title="סופרים נרות" instruction="כמה נרות דולקים בכל חנוכייה, בלי השמש? כותבים במשבצת" sub="השמש הוא הנר הגבוה שבאמצע" />
    {COUNT_CANDLES.map((k, i) => { const col = i % 2, row = Math.floor(i / 2), x = col ? 160 : 440, y = 150 + row * 220; return <g key={i}>
      <Hanukkiah x={x} y={y} lit={k} />
      <rect x={x - 28} y={y + 120} width="56" height="50" rx="8" fill="white" stroke={INK} strokeWidth="2" />
    </g> })}
  </SvgPage>
}

function NightsPage({ n }) {
  return <SvgPage label="כמה נרות בכל ערב?">
    <Head n={n} title="כמה נרות בכל ערב?" instruction="בכל ערב מוסיפים נר אחד. משלימים — ואל תשכחו את השמש!" />
    {Array.from({ length: 8 }, (_, i) => { const y = 170 + i * 76; return <text key={i} x={W / 2} y={y} fontSize="24" textAnchor="middle" fontFamily={FONT} direction="rtl">
      ערב {i + 1}:  ____ נרות  +  שמש  =  ____
    </text> })}
    <text x={W / 2} y={790} fontSize="17" textAnchor="middle" fontFamily={FONT} direction="rtl">אתגר: כמה נרות מדליקים בכל החג, בלי השמשים? ______</text>
  </SvgPage>
}

function SumsPage({ n }) {
  return <SvgPage label="חשבון של חנוכה">
    <Head n={n} title="חשבון של חנוכה" instruction="סופרים ומשלימים את התרגיל" />
    {SUMS.map(([a, b], i) => { const y = 180 + i * 105, e = i % 2 ? '🍩' : '🕯️', at = k => 545 - k * 38 - (k >= a ? 40 : 0); return <g key={i} fontFamily={FONT}>
      {Array.from({ length: a + b }, (_, k) => <text key={k} x={at(k)} y={y} fontSize="32" textAnchor="middle">{e}</text>)}
      <text x={at(a) + 39} y={y - 4} fontSize="30" fontWeight="800" textAnchor="middle">+</text>
      <text x={110} y={y} fontSize="28" fontWeight="800" textAnchor="middle" direction="ltr">{a} + {b} = ___</text>
    </g> })}
  </SvgPage>
}

function NotHanukkahPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="מה לא שייך לחנוכה?">
    <Head n={n} title="מה לא שייך לחנוכה?" instruction="בכל שורה יש תמונה אחת מחג אחר — מקיפים אותה" />
    {NOT_HANUKKAH.map((row, i) => { const y = 220 + i * 150, items = r.shuffle(row.slice(0, 4)); return <g key={i}>
      {items.map((e, j) => <text key={j} x={480 - j * 120} y={y} fontSize="64" textAnchor="middle">{e}</text>)}
      <text x={W / 2} y={y + 50} fontSize="15" textAnchor="middle" fontFamily={FONT} direction="rtl">מאיזה חג היא? ______________</text>
    </g> })}
  </SvgPage>
}

export default function HanukkahBooklet({ seed }) {
  const quiz = quizItems(seed)
  return <>
    <Cover emoji="🕎🍩🕯️" title="חוברת עבודה לחנוכה" subtitle="15 עמודים: סיפור החג, חידון, נרות וחשבון, סביבון, תפזורת וצביעה" pages={PAGES}
      note="מתאימה לגן חובה ולכיתות א׳–ב׳. אפשר לעשות עמוד בכל ערב של חנוכה, אחרי הדלקת הנרות. ילדים שעוד לא קוראים יפתרו את העמודים עם התמונות, ואת הסיפור והחידון — בקריאה משותפת." />
    <StoryPage n={2} />
    <QuizPage n={3} seed={seed} />
    <CountPage n={4} />
    <NightsPage n={5} />
    <SumsPage n={6} />
    <MatchPage n={7} seed={seed} title="אותיות הסביבון" instruction="מותחים קו מכל אות למילה שהיא מתחילה" sub="נס גדול היה פה" pairs={[['נ', 'נס'], ['ג', 'גדול'], ['ה', 'היה'], ['פ', 'פה']].map(([l, w]) => [{ text: l }, { text: w }])} />
    <TracePage n={8} title="כותבים את אותיות הסביבון" instruction="עוברים בעיפרון על האותיות ועל המשפט" rows={['נ', 'ג', 'ה', 'פ', 'נס גדול היה פה']} repeats={5} />
    <TracePage n={9} title="מילים של חנוכה" instruction="עוברים בעיפרון על המילים" rows={['חנוכה', 'סביבון', 'נרות', 'שמש', 'שמן', 'לביבה']} repeats={2} />
    <NotHanukkahPage n={10} seed={seed} />
    <WordSearchPage n={11} seed={seed} he size={10} title="תפזורת חנוכה" instruction="מוצאים את המילים: הן כתובות מימין לשמאל או מלמעלה למטה" words={WORDS.map(w => ({ word: w }))} />
    <ImagePage n={12} title="🖍️ דף צביעה — סופגנייה" instruction="צובעים את הסופגנייה" src={coloringSrc('sufganiyah', 1)} alt="דף צביעה: סופגנייה" />
    <ImagePage n={13} title="🖍️ דף צביעה — חנוכייה" instruction="צובעים את החנוכייה" src={coloringSrc('hanukkiah', 1)} alt="דף צביעה: חנוכייה" />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 2 — סיפור חנוכה', answers: ['אנטיוכוס', 'מודיעין', 'שמונה ימים'] },
      { title: 'עמוד 3 — חידון', answers: quiz.map(q => q.answer) },
      { title: 'עמוד 4 — סופרים נרות (מימין לשמאל, שורה אחר שורה)', answers: COUNT_CANDLES.map(String) },
      { title: 'עמוד 5 — נרות בכל ערב', answers: [...Array.from({ length: 8 }, (_, i) => `ערב ${i + 1}: ${i + 1} + שמש = ${i + 2}`), 'אתגר: 1+2+…+8 = 36'] },
      { title: 'עמוד 6 — חשבון', answers: SUMS.map(([a, b]) => `${a} + ${b} = ${a + b}`) },
      { title: 'עמוד 7 — אותיות הסביבון', answers: ['נ — נס', 'ג — גדול', 'ה — היה', 'פ — פה'] },
      { title: 'עמוד 10 — מה לא שייך', answers: NOT_HANUKKAH.map(r => r[4]) },
    ]} />
    <Certificate booklet="חוברת העבודה לחנוכה" done="קראתי את סיפור החג, ספרתי נרות, פתרתי חידון ותפזורת וצבעתי." cheer="חג חנוכה שמח! 🕎" />
  </>
}

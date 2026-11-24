import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// "יומן קריאה לילדים": three printable A4 formats — a month of daily minutes, a books list with star
// ratings and "what I liked", and a 4×4 reading bingo — each for grades א׳–ב׳ (big boxes, drawing, colouring)
// or ג׳–ו׳ (writing lines). Colour or ink-saving (black and white).
const PATH = '/printables/reading-log'
const FILLS = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe', '#ffedd5']
const INK = '#334155'

const BINGO = {
  young: ['ספר מצחיק', 'ספר שמישהו המליץ עליו', 'לקרוא לאח או לאחות', 'ספר עם חיה', 'ספר עם תמונות יפות', 'לקרוא בחוץ', 'לקרוא לפני השינה', 'ספר שאהבתי פעם', 'לקרוא לסבא או לסבתא', 'ספר בצבע האהוב עליי', 'ספר מהספרייה', 'ספר על חברות', 'לקרוא בפיג׳מה', 'ספר שמתחיל באות של השם שלי', 'ספר על אוכל', 'לקרוא לבובה או לחיה'],
  older: ['ספר מצחיק', 'ספר שמישהו המליץ עליו', 'לקרוא לאח או לאחות', 'ספר הרפתקאות', 'ספר מהספרייה', 'ספר של סופר/ת ישראלי/ת', 'ספר שיש לו סרט או סדרה', 'ספר עם יותר מ־100 עמודים', 'ספר מידע', 'ספר חידות או בדיחות', 'לסיים ספר שהתחלתי', 'לקרוא במקום חדש', 'לקרוא 20 דקות ברצף', 'ספר שהכריכה שלו משכה אותי', 'קומיקס או רומן גרפי', 'ספר שחבר או חברה קראו'],
}

// Split a Hebrew label into at most three lines of roughly `max` characters.
function wrap(text, max) {
  const lines = []
  let cur = ''
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w } else cur = cur ? cur + ' ' + w : w
  }
  if (cur) lines.push(cur)
  return lines
}

function Star({ x, y, r = 4, filled }) {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(x + Math.cos(a) * rr).toFixed(2)},${(y + Math.sin(a) * rr).toFixed(2)}` }).join(' ')
  return <polygon points={pts} fill={filled ? '#fde047' : '#fff'} stroke={INK} strokeWidth=".45" strokeLinejoin="round" />
}

function Header({ title, name, color, sub }) {
  return <g>
    <rect x={4} y={4} width={192} height={32} rx={5} fill={color ? '#fef3c7' : '#fff'} stroke={INK} strokeWidth=".6" />
    <T x={100} y={16} size={9.5} weight={800} fill={color ? '#92400e' : '#111'}>{title}</T>
    <T x={190} y={27} size={4.4} anchor="end" weight={700}>שם: {name ? name : '_____________________'}</T>
    {sub}
  </g>
}

// A month: 31 boxes, 7 per row. Young: colour the star on days you read. Older: write the minutes.
function MinutesSheet({ name, color, level, goal }) {
  const young = level === 'young'
  const cols = 7, w = 188 / cols, h = 37, y0 = 50
  return <Sheet label="יומן קריאה חודשי — דקות קריאה בכל יום">
    <Header title="יומן הקריאה שלי — החודש" name={name} color={color}
      sub={<T x={10} y={27} size={4.4} anchor="start" weight={700}>חודש: ____________  {goal ? `יעד יומי: ${goal} דקות` : 'יעד יומי: ____ דקות'}</T>} />
    <T x={100} y={45} size={3.8} fill="#555">{young ? 'קראתי היום? מצבעים את הכוכב. כל יום שקראתי — כוכב!' : 'כותבים בכל יום כמה דקות קראתי, ובסוף החודש מחברים.'}</T>
    {Array.from({ length: 31 }, (_, i) => {
      const r = Math.floor(i / cols), c = i % cols, cx = 196 - c * w - w / 2, cy = y0 + r * h
      return <g key={i}>
        <rect x={cx - w / 2 + 0.5} y={cy} width={w - 1} height={h - 1.5} rx={2.5} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke={INK} strokeWidth=".45" />
        <T x={cx} y={cy + 6} size={5} weight={800}>{i + 1}</T>
        {young
          ? <Star x={cx} y={cy + 21} r={8.5} filled={false} />
          : <><line x1={cx - 8} y1={cy + 24} x2={cx + 8} y2={cy + 24} stroke="#94a3b8" strokeWidth=".4" /><T x={cx} y={cy + 32} size={3.2} fill="#777">דקות</T></>}
      </g>
    })}
    <rect x={4} y={y0 + 4 * h} width={w * 3 - 2} height={h - 1.5} rx={2.5} fill="none" stroke={INK} strokeWidth=".45" strokeDasharray="2 1.5" />
    <T x={4 + (w * 3 - 2) / 2} y={y0 + 4 * h + 10} size={4.2} weight={800}>{young ? 'כמה כוכבים?' : 'סך הכול החודש'}</T>
    <T x={4 + (w * 3 - 2) / 2} y={y0 + 4 * h + 25} size={4.2}>{young ? '________' : '________ דקות'}</T>
    <T x={100} y={256} size={4.4} weight={700}>{young ? 'הספר האהוב עליי החודש: _______________________' : 'הספר הטוב ביותר שקראתי החודש: _______________________'}</T>
    <T x={100} y={266} size={3.4} fill="#888">עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

// A books list: title, 5-star rating, and "what I liked" (a drawing box for young, writing lines for older).
function BooksSheet({ name, color, level }) {
  const young = level === 'young'
  const rows = young ? 5 : 6, h = young ? 44 : 36, y0 = 42
  return <Sheet label="יומן ספרים — דירוג בכוכבים ומה אהבתי">
    <Header title="הספרים שקראתי" name={name} color={color}
      sub={<T x={10} y={27} size={4.4} anchor="start" weight={700}>שנת לימודים: ____________</T>} />
    {Array.from({ length: rows }, (_, i) => {
      const y = y0 + i * h
      return <g key={i}>
        <rect x={4} y={y} width={192} height={h - 3} rx={3} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke={INK} strokeWidth=".5" />
        <circle cx={188} cy={y + 8} r={4.5} fill="#fff" stroke={INK} strokeWidth=".45" />
        <T x={188} y={y + 9.7} size={4.4} weight={800}>{i + 1}</T>
        <T x={181} y={y + 9.5} size={4} anchor="end" weight={700}>שם הספר:</T>
        <line x1={9} y1={y + 10} x2={156} y2={y + 10} stroke="#64748b" strokeWidth=".4" />
        <T x={181} y={y + 18.5} size={3.6} anchor="end" fill="#555">דירוג:</T>
        {[0, 1, 2, 3, 4].map(k => <Star key={k} x={165 - k * 9} y={y + 17.5} r={3.8} filled={false} />)}
        {young
          ? <><T x={181} y={y + 26.5} size={3.6} anchor="end" fill="#555">מה ציירתי מהספר:</T>
            <rect x={90} y={y + 21} width={96} height={h - 27} rx={2} fill="#fff" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="1.5 1" /></>
          : <><T x={181} y={y + 26.5} size={3.6} anchor="end" fill="#555">מה אהבתי:</T>
            <line x1={9} y1={y + 26.5} x2={150} y2={y + 26.5} stroke="#94a3b8" strokeWidth=".35" />
            <line x1={9} y1={y + 32.5} x2={186} y2={y + 32.5} stroke="#94a3b8" strokeWidth=".35" /></>}
      </g>
    })}
    <T x={100} y={266} size={3.4} fill="#888">עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

// A 4×4 reading bingo: finish a row, column or diagonal.
function BingoSheet({ name, color, level }) {
  const list = BINGO[level], cw = 47, ch = 50, x0 = 6, y0 = 56
  return <Sheet label="בינגו קריאה — 16 אתגרי קריאה">
    <Header title="בינגו קריאה" name={name} color={color}
      sub={<T x={10} y={27} size={4.4} anchor="start" weight={700}>משלימים שורה, טור או אלכסון — וזה בינגו!</T>} />
    <T x={100} y={48} size={4} fill="#555">עושים אתגר? מסמנים בכוכב או בוי. אפשר להשלים את כל הלוח.</T>
    {list.map((txt, i) => {
      const r = Math.floor(i / 4), c = i % 4, x = x0 + (3 - c) * cw, y = y0 + r * ch, lines = wrap(txt, 12)
      return <g key={txt}>
        <rect x={x + 0.5} y={y + 0.5} width={cw - 1} height={ch - 1} rx={4} fill={color ? FILLS[(r + c) % FILLS.length] : '#fff'} stroke={INK} strokeWidth=".6" />
        {lines.map((l, k) => <T key={l} x={x + cw / 2} y={y + 17 + k * 7 - (lines.length - 2) * 3} size={5.4} weight={700}>{l}</T>)}
        <circle cx={x + cw / 2} cy={y + ch - 9} r={5.5} fill="#fff" stroke="#94a3b8" strokeWidth=".5" strokeDasharray="1.5 1" />
      </g>
    })}
    <T x={100} y={262} size={4.2} weight={700}>כשיש לי בינגו: ____________ (תאריך)</T>
    <T x={100} y={268} size={3.2} fill="#888">עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

export default function ReadingLog() {
  const [format, setFormat] = useState('minutes')
  const [level, setLevel] = useState('young')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [color, setColor] = useState('yes')
  const c = color === 'yes'
  const sheet = format === 'minutes' ? <MinutesSheet name={name.trim()} color={c} level={level} goal={goal.trim()} />
    : format === 'books' ? <BooksSheet name={name.trim()} color={c} level={level} />
      : <BingoSheet name={name.trim()} color={c} level={level} />
  const PRINT_TITLES = { minutes: 'יומן קריאה חודשי', books: 'יומן ספרים', bingo: 'בינגו קריאה' }

  return <PrintableShell path={PATH} emoji="📚" h1="יומן קריאה לילדים להדפסה"
    seoTitle="יומן קריאה לילדים להדפסה — מעקב דקות, רשימת ספרים ובינגו קריאה (PDF חינם)"
    description="יומן קריאה לילדים להדפסה בחינם: מעקב דקות קריאה לחודש, רשימת ספרים עם דירוג בכוכבים ו״מה אהבתי״, ובינגו קריאה עם 16 אתגרים. בגרסה לכיתות א׳–ב׳ (ציור וצביעה) ולכיתות ג׳–ו׳ (שורות כתיבה), בצבע או בשחור־לבן."
    sub="בוחרים סוג יומן, כיתות ושם — ומדפיסים. קריאה שמרגישה כמו משחק ולא כמו שיעורי בית"
    controls={<div className="space-y-3">
      <p className="m-0 text-center font-bold">איזה יומן?</p>
      <Choice label="סוג יומן" value={format} onChange={setFormat} options={[['minutes', '⏱️ דקות קריאה לחודש'], ['books', '📖 רשימת ספרים ודירוג'], ['bingo', '🎯 בינגו קריאה']]} />
      <Choice label="כיתות" value={level} onChange={setLevel} options={[['young', 'א׳–ב׳ (תמונות וציור)'], ['older', 'ג׳–ו׳ (שורות כתיבה)']]} />
      <Field label="שם הילד/ה (אפשר להשאיר ריק)" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={24} />
      {format === 'minutes' && <Field label="יעד יומי בדקות (לא חובה)" value={goal} onChange={v => setGoal(v.replace(/\D/g, ''))} placeholder="למשל: 15" maxLength={3} />}
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'חוסך דיו — שחור-לבן']]} />
    </div>}
    pages={[{ key: format + level, svg: sheet }]} printTitle={PRINT_TITLES[format]}
    paragraphs={[
      'יומן קריאה הוא דף שהילד ממלא בעצמו, ומראה לו שהקריאה שלו מצטברת. הוא לא בא במקום הקריאה עצמה, אלא נותן לה מסגרת: כוכב צבוע ביום שקראנו, ספר שנוסף לרשימה, אתגר שסימנו בבינגו.',
      'שלושה סוגי יומנים: מעקב דקות לחודש שלם (31 ימים), רשימת ספרים עם דירוג של עד חמישה כוכבים ומקום לכתוב או לצייר מה אהבנו, ולוח בינגו קריאה של 16 אתגרים — כמו "ספר מצחיק", "ספר שמישהו המליץ עליו" ו"לקרוא לאח או לאחות".',
      'לכיתות א׳–ב׳ התיבות גדולות ואין חובה לכתוב הרבה: צובעים כוכב, מציירים סצנה מהספר. לכיתות ג׳–ו׳ יש מקום לדקות, לשם ספר ולשורות של "מה אהבתי". שם הילד נכנס אוטומטית לראש הדף, ואפשר גם להשאיר קו למילוי בעט.',
      'להדפסה חסכונית בדיו בוחרים שחור־לבן, ואז הצבעים מוחלפים בלבן והילדים יכולים לצבוע בעצמם. כל יומן הוא דף A4 אחד.',
    ]}
    after={<section className="mx-auto mt-12 max-w-3xl rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-labelledby="rl-tips">
      <h2 id="rl-tips" className="mb-3 text-2xl font-bold">💡 טיפים להורים ולמורים — איך משתמשים בלי להפוך קריאה למטלה</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li><b>מתחילים ביעד קטן.</b> עשר דקות ביום הן יעד שכמעט כולם עומדים בו. אפשר להעלות אחרי כמה שבועות, ולא להפך.</li>
        <li><b>מחשיבים הכול כקריאה.</b> קומיקס, ספר מידע, חידות, ספר שקוראים יחד או ספר שמקשיבים לו — כולם נספרים.</li>
        <li><b>הילד בוחר את הספר.</b> ספר שהוא בחר בעצמו נקרא יותר מספר שבחרנו בשבילו, גם אם הוא "קל מדי" או ישן.</li>
        <li><b>לא מענישים על יום שהוחמץ.</b> הכוכבים מציגים התקדמות, לא חובה. יום ריק הוא סתם יום ריק.</li>
        <li><b>קוראים לצד הילד.</b> כשהורה או מורה קוראים באותו זמן, הקריאה הופכת לדבר משפחתי ולא לתפקיד של הילד.</li>
        <li><b>שואלים ולא בודקים.</b> "מה היה הכי מצחיק?" עדיף על "על מה הספר?". הדירוג בכוכבים הוא שיחה ולא מבחן.</li>
        <li><b>בכיתה:</b> תולים את הבינגו על הקיר, משלימים שורה בקבוצות, ומציינים כל התקדמות — לא רק מי שקרא הכי הרבה.</li>
        <li><b>פרס קטן ובעל משמעות.</b> לא צריך מתנות: ספר חדש, ביקור בספרייה או הזכות לבחור ספר לקריאה בקול.</li>
      </ul>
    </section>}
    faq={[
      { q: 'איזה יומן קריאה מתאים לכיתה א׳?', a: 'בתחילת כיתה א׳ מתאים "דקות לחודש" בגרסת א׳–ב׳, שבה רק צובעים כוכב בכל יום שקראנו או הקראנו, או הבינגו עם אתגרים כמו "לקרוא לבובה". ילד שעדיין לא קורא לבד יכול לספור גם ספר שהורה קורא לו.' },
      { q: 'כמה דקות ביום ילד צריך לקרוא?', a: 'אין מספר אחד שמתאים לכולם. מקובל להתחיל מכ־10 דקות ביום בכיתות הנמוכות, ולהגיע עם הזמן ל־20 דקות ויותר. הכי חשוב הוא הרגל קבוע שנעים לילד, ולכן אפשר להשאיר את שדה היעד ריק ולמלא רק מה שקרה בפועל.' },
      { q: 'האם קומיקס או הקראה של הורה נחשבים?', a: 'כן. קומיקס, ספרי מידע וקריאה משותפת מפתחים אוצר מילים והבנה, ובעיקר מחזקים את הקשר לקריאה. בבינגו יש אפילו משבצת לקומיקס.' },
      { q: 'איך מדפיסים חוסך דיו?', a: 'בוחרים "חוסך דיו — שחור-לבן". הרקעים הצבעוניים נעלמים, נשארים רק קווים ושורות, והילדים יכולים לצבוע בעצמם בצבעים שהם אוהבים.' },
      { q: 'אפשר להשתמש בזה בכיתה?', a: 'בהחלט. בינגו הקריאה מתאים לתליה בכיתה, ויומן הספרים מתאים לתיק קריאה. אפשר להדפיס כמה עותקים, והשם לא חובה — כל ילד יכול לכתוב אותו בעצמו.' },
      { q: 'מה ההבדל בין הגרסאות לפי כיתות?', a: 'בגרסת א׳–ב׳ תיבות גדולות, כוכבים לצביעה ותיבת ציור, כדי שאפשר יהיה להשתתף גם בלי הרבה כתיבה. בגרסת ג׳–ו׳ יש שורות למילוי דקות, שם הספר ו"מה אהבתי". אתגרי הבינגו מותאמים גם הם לגיל.' },
    ]}
    related={[{ label: 'דפים להדפסה', href: '/printables' }, { label: 'סרגל אותיות להדפסה', href: '/printables/letter-strip' }, { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }, { label: 'לימוד אותיות', href: '/letters' }]}
  />
}

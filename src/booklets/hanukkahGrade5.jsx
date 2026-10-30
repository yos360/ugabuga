import { generateMaze } from '../motor/generators/maze.js'
import { A4, AnswerKey, art, Certificate, Cover, Head, MotorPage, SvgPage, W, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת העשרה וכיף לחנוכה — כיתות ה׳–ו׳" — the older sibling of hanukkah.jsx: a longer reading text with
// open questions, true/false, a hard maze, a hidden-word puzzle, word search, scrambled words, riddles,
// dreidel / doughnut / candle word problems (fractions, money, time), gematria code and a 6×6 sudoku.
const PAGES = bookletBySlug('hanukkah-grade5').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// ---------- Reading ----------
const ORDER = [
  // [event, its place in the story]
  ['המכבים שחררו את ירושלים', 4],
  ['אנטיוכוס גזר גזרות על היהודים', 1],
  ['המנורה דלקה שמונה ימים', 6],
  ['מתתיהו ובניו יצאו להרים', 2],
  ['המכבים ניקו את בית המקדש וחנכו אותו מחדש', 5],
  ['יהודה המכבי עמד בראש הלוחמים', 3],
]

const TRUE_FALSE = [
  ['אנטיוכוס היה מלך יווני שאסר על היהודים לקיים את מצוות התורה.', true, ''],
  ['מתתיהו ובניו גרו בירושלים.', false, 'הם גרו במודיעין'],
  ['בני המשפחה של מתתיהו נקראו גם "החשמונאים".', true, ''],
  ['המכבים מצאו במקדש הרבה כדים של שמן טהור.', false, 'הם מצאו רק פך אחד'],
  ['חנוכה מתחיל בכ״ה בכסלו.', true, ''],
  ['על הסביבונים בארץ ישראל כתוב נ, ג, ה, ש.', false, 'בארץ כתוב פ — "נס גדול היה פה"; ש — בחוץ לארץ'],
  ['בחנוכייה יש שבעה קנים, בדיוק כמו במנורה שבבית המקדש.', false, 'בחנוכייה שמונה נרות ועוד שמש; במנורה היו שבעה קנים'],
  ['המכבים היו צבא קטן מצבא המלך.', true, ''],
  ['מדליקים את כל שמונת הנרות כבר בערב הראשון.', false, 'בכל ערב מוסיפים נר אחד'],
  ['השם "חנוכה" בא מחנוכת בית המקדש מחדש.', true, ''],
]

// ---------- Word puzzles ----------
// Hidden word: the letter at `pos` of every answer sits in the shaded column; read down → חשמונאים.
const HIDDEN = [
  ['כלי שמדליקים בו את נרות החג', 'חנוכייה', 0],
  ['הנר הגבוה שבעזרתו מדליקים את שאר הנרות', 'שמש', 2],
  ['הכוהן מהכפר מודיעין שפתח במרד', 'מתתיהו', 0],
  ['צעצוע עם ארבע אותיות שמסובבים בחנוכה', 'סביבון', 4],
  ['העם שמלכו שלט בארץ ישראל בזמן סיפור החנוכה', 'יוונים', 3],
  ['המלך שגזר גזרות על היהודים', 'אנטיוכוס', 0],
  ['העיר שבה עמד בית המקדש', 'ירושלים', 0],
  ['כינוי ללוחמים שהנהיג יהודה', 'מכבים', 4],
]
const HIDDEN_WORD = 'חשמונאים'

const SEARCH_WORDS = ['חשמונאים', 'אנטיוכוס', 'ירושלים', 'מודיעין', 'מתתיהו', 'סביבון', 'כסלו', 'מקדש']

const SCRAMBLE = [
  ['אנטיוכוס', 'מלך'], ['חשמונאים', 'משפחה'], ['סופגנייה', 'מאכל'], ['ירושלים', 'עיר'],
  ['מודיעין', 'כפר'], ['חנוכייה', 'כלי'], ['מתתיהו', 'כוהן'], ['לביבות', 'מאכל'],
]
const UNFINAL = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' }
// Shuffle the letters (final forms turned regular, so the ending isn't given away) — never the word itself.
function scrambled(word, seed, i) {
  const letters = [...word].map(ch => UNFINAL[ch] || ch), plain = letters.join(''), rng = rngFor(seed, 80 + i)
  for (let t = 0; t < 30; t++) { const s = rng.shuffle(letters).join(''); if (s !== plain) return s }
  return [...plain].reverse().join('')
}

const RIDDLES = [
  ['אני הכי גבוה בחנוכייה, אבל לא סופרים אותי. בעזרתי כל הנרות נדלקים.', 'השמש'],
  ['יש לי ארבע פנים ורגל אחת, ואני רוקד רק כשמסובבים אותי.', 'הסביבון'],
  ['הייתי קטן וחתום בחותם של הכוהן הגדול. הספקתי ליום אחד — והאור נמשך שמונה.', 'פך השמן'],
  ['אני חודש עברי. בעשרים וחמישה בי מדליקים את הנר הראשון.', 'כסלו'],
  ['אני עגולה, מטוגנת ומלאה בריבה, ומי שאוכל אותי מתלכלך באבקת סוכר.', 'הסופגנייה'],
  ['עושים אותי מתפוחי אדמה מגורדים, ומטגנים אותי במחבת עד שאני זהובה.', 'הלביבה'],
  ['בי גר מתתיהו הכוהן עם חמשת בניו, וממני התחיל המרד.', 'מודיעין'],
  ['אחרי שאבי מת, עמדתי בראש הלוחמים, ועל שמי נקראו כולם.', 'יהודה המכבי'],
]

// ---------- Math ----------
// Dreidel game: pot starts at 32. [player, letter, taken, put in]
const DREIDEL = [['יואב', 'ה', 16, 0], ['מאיה', 'פ', 0, 2], ['נועה', 'ה', 9, 0], ['איתי', 'פ', 0, 2], ['עומר', 'נ', 0, 0], ['תמר', 'ג', 11, 0]]
const DREIDEL_START = 32
const potAfter = () => { let pot = DREIDEL_START; return DREIDEL.map(([, , take, put]) => (pot = pot - take + put)) }

const GEMATRIA = [['א', 1], ['ב', 2], ['ג', 3], ['ד', 4], ['ה', 5], ['ו', 6], ['ז', 7], ['ח', 8], ['ט', 9], ['י', 10], ['כ', 20], ['ל', 30], ['מ', 40], ['נ', 50], ['ס', 60], ['ע', 70], ['פ', 80], ['צ', 90], ['ק', 100], ['ר', 200], ['ש', 300], ['ת', 400]]
const VAL = Object.fromEntries([...GEMATRIA, ['ך', 20], ['ם', 40], ['ן', 50], ['ף', 80], ['ץ', 90]])
const gematria = word => [...word].reduce((s, ch) => s + (VAL[ch] || 0), 0)
const GEM_WORDS = ['חנוכה', 'נר', 'שמן', 'מכבי']
const SECRET = 'חג אורים שמח'

// ---------- Sudoku 6×6 (2×3 boxes), unique solution, rebuilt from the seed ----------
function countSolutions(g, limit = 2) {
  const i = g.indexOf(0)
  if (i < 0) return 1
  const r = Math.floor(i / 6), c = i % 6, br = r - r % 2, bc = c - c % 3
  let n = 0
  for (let v = 1; v <= 6 && n < limit; v++) {
    let ok = true
    for (let k = 0; k < 6 && ok; k++) if (g[r * 6 + k] === v || g[k * 6 + c] === v) ok = false
    for (let dr = 0; dr < 2 && ok; dr++) for (let dc = 0; dc < 3 && ok; dc++) if (g[(br + dr) * 6 + bc + dc] === v) ok = false
    if (!ok) continue
    g[i] = v; n += countSolutions(g, limit - n); g[i] = 0
  }
  return n
}
function buildSudoku(seed, blanks = 20) {
  const rng = rngFor(seed, 61)
  const rows = rng.shuffle([0, 1, 2]).flatMap(b => rng.shuffle([0, 1]).map(x => b * 2 + x))
  const cols = rng.shuffle([0, 1]).flatMap(s => rng.shuffle([0, 1, 2]).map(x => s * 3 + x))
  const digits = rng.shuffle([1, 2, 3, 4, 5, 6])
  const base = (r, c) => ((r % 2) * 3 + Math.floor(r / 2) + c) % 6
  const solution = Array.from({ length: 36 }, (_, i) => digits[base(rows[Math.floor(i / 6)], cols[i % 6])])
  const puzzle = [...solution]
  let removed = 0
  for (const i of rng.shuffle([...Array(36).keys()])) {
    if (removed >= blanks) break
    const keep = puzzle[i]; puzzle[i] = 0
    if (countSolutions([...puzzle]) === 1) removed++
    else puzzle[i] = keep
  }
  return { puzzle, solution }
}

// ---------- Pages ----------
const lines = (k, h = 30) => Array.from({ length: k }, (_, i) => <div key={i} style={{ borderBottom: '1px solid #111', height: h }} />)

// Text page with a print-art picture on each side of the title (only emoji that have a /print-art/words file).
function TextPage({ n, title, sub, pics = [], children }) {
  const img = e => e && <img src={art(e)} alt="" width="46" height="46" style={{ width: 46, height: 46, objectFit: 'contain', flex: 'none' }} />
  return <A4 style={{ alignItems: 'stretch' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>{img(pics[0])}<h2 style={{ margin: '4px 0' }}>{title}</h2>{img(pics[1])}</div>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת{sub ? ` · ${sub}` : ''}</p>
    {children}
  </A4>
}

function StoryPage({ n }) {
  return <TextPage n={n} title="האור שלא כבה — סיפור חנוכה" sub="קוראים בעיון; בעמוד הבא יש שאלות" pics={['📖', '🕎']}>
    <div style={{ fontSize: '13pt', lineHeight: 1.7, padding: '2mm 6mm', textAlign: 'justify', border: '3px double #111', borderRadius: 14 }}>
      <p>לפני כ־2,200 שנה הייתה ארץ ישראל חלק מממלכה יוונית גדולה. בהתחלה הניחו המלכים ליהודים לחיות לפי מנהגיהם, אבל המלך <b>אנטיוכוס הרביעי</b> רצה שכל העמים בממלכתו יחיו כמו היוונים. הוא גזר <b>גזרות</b>: אסור לשמור שבת, אסור ללמוד תורה ואסור לקיים מצוות. חייליו הכניסו פסלים לבית המקדש בירושלים והקריבו בו קורבנות לאלילים.</p>
      <p>בכפר <b>מודיעין</b> גר כוהן זקן בשם <b>מתתיהו</b>, עם חמשת בניו. כשהגיעו חיילי המלך לכפר ודרשו מהתושבים לעבוד אלילים, מתתיהו סירב ויצא עם בניו ועם אנשים נוספים אל ההרים. כך התחיל המרד. אחרי מותו של מתתיהו עמד בראש הלוחמים בנו <b>יהודה</b>, שכונה "המכבי". הלוחמים היו מעטים לעומת צבא המלך הגדול והמצויד, אבל הם הכירו היטב את השבילים בהרים והפתיעו את האויב שוב ושוב. בני המשפחה נקראו גם <b>החשמונאים</b>.</p>
      <p>אחרי שלוש שנים של קרבות שחררו המכבים את ירושלים. הם מצאו את בית המקדש הרוס ומטונף, ניקו אותו, בנו מזבח חדש וחנכו אותו מחדש ב<b>כ״ה בכסלו</b> — ומכאן שמו של החג: <b>חנוכה</b>. לפי המסורת שבתלמוד, הם חיפשו שמן זית טהור כדי להדליק את המנורה, ומצאו רק <b>פך אחד</b>, חתום בחותם של הכוהן הגדול. השמן הספיק ליום אחד בלבד, אבל המנורה דלקה <b>שמונה ימים</b>.</p>
      <p>לזכר הנס מדליקים חנוכייה במשך שמונה ערבים, ובכל ערב מוסיפים נר. נוהגים להניח את החנוכייה ליד החלון או ליד הפתח כדי <b>לפרסם את הנס</b> — שכל מי שעובר ברחוב יראה את האור. אוכלים מאכלים מטוגנים בשמן, כמו סופגניות ולביבות, ומשחקים בסביבון. על הסביבונים בארץ ישראל כתוב <b>נ, ג, ה, פ</b> — "נס גדול היה פה", ובחוץ לארץ כתוב ש — "נס גדול היה שם".</p>
    </div>
    <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: '11.5pt', lineHeight: 1.5 }}>
      <div style={{ flex: 1, border: '2px dashed #111', borderRadius: 12, padding: '6px 10px' }}><b>💡 הידעתם?</b> יש מי שקורא את השם "חנוכה" כ"חנו כ״ה" — בכ״ה בכסלו חנו המכבים, כלומר נחו מהמלחמה.</div>
      <div style={{ flex: 1, border: '2px dashed #111', borderRadius: 12, padding: '6px 10px' }}><b>💡 הידעתם?</b> לפי מסורת אחת, "מכבי" הוא ראשי תיבות של הפסוק "מי כמוכה באלים ה׳".</div>
    </div>
  </TextPage>
}

function QuestionsPage({ n }) {
  const q = { fontSize: '12.5pt', margin: '8px 0 2px', fontWeight: 700 }
  return <TextPage n={n} title="שאלות על הסיפור" sub="עונים במשפטים מלאים" pics={['✏️', '📖']}>
    <div style={{ padding: '0 6mm', fontSize: '12.5pt', lineHeight: 1.5 }}>
      <p style={q}>1. מה אסר המלך אנטיוכוס על היהודים? כתבו שני דברים.</p>{lines(2, 28)}
      <p style={q}>2. מה פירוש המילה "גזרות" בסיפור? מקיפים.</p>
      <p style={{ margin: '2px 0', display: 'flex', justifyContent: 'space-around' }}><span>א. חתיכות קטנות</span><span>ב. חוקים ואיסורים של המלך</span><span>ג. ענפים שגוזמים</span></p>
      <p style={q}>3. למה, לפי הסיפור, הצליחו לוחמים מעטים לנצח צבא גדול?</p>{lines(2, 28)}
      <p style={q}>4. מאיפה בא השם "חנוכה"?</p>{lines(1, 28)}
      <p style={q}>5. למה מניחים את החנוכייה ליד החלון או ליד הפתח?</p>{lines(1, 28)}
      <p style={q}>6. מה ההבדל בין סביבון מארץ ישראל לסביבון מחוץ לארץ, ולמה?</p>{lines(2, 28)}
      <p style={q}>7. מספרים את האירועים לפי הסדר שבו קרו (1–6):</p>
      <div style={{ columns: 2, columnGap: 20, marginTop: 4 }}>
        {ORDER.map(([e]) => <p key={e} style={{ margin: '0 0 8px', breakInside: 'avoid' }}><span style={{ display: 'inline-block', width: 26, height: 22, border: '1.5px solid #111', borderRadius: 4, verticalAlign: 'middle', marginInlineEnd: 6 }} />{e}</p>)}
      </div>
    </div>
  </TextPage>
}

function TrueFalsePage({ n }) {
  return <TextPage n={n} title="נכון או לא נכון?" sub="מסמנים ✓ או ✗. אם לא נכון — מתקנים" pics={['👑', '⭐']}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5pt' }}>
      <tbody>
        {TRUE_FALSE.map(([s], i) => <tr key={i} style={{ borderBottom: '1px solid #bbb' }}>
          <td style={{ width: 22, padding: '6px 4px', verticalAlign: 'top', fontWeight: 700 }}>{i + 1}.</td>
          <td style={{ padding: '6px 4px' }}>{s}<div style={{ marginTop: 10, fontSize: '11pt', color: '#444' }}>תיקון: ______________________________________________</div></td>
          <td style={{ width: 70, textAlign: 'center' }}><span style={{ display: 'inline-block', width: 34, height: 34, border: '2px solid #111', borderRadius: 6 }} /></td>
        </tr>)}
      </tbody>
    </table>
  </TextPage>
}

const MAZE_THEME = { start: '🛡️', goal: '🏺', mazeTitle: 'מבוך: עזרו ליהודה המכבי להגיע לפך השמן' }
const mazeFor = seed => generateMaze({ level: 5, seed: seed * 7 + 1125, theme: MAZE_THEME })

function HiddenWordPage({ n }) {
  const box = 38, xc = 350, top = 140, rowH = 44
  return <SvgPage label="המילה הנסתרת">
    <Head n={n} title="המילה הנסתרת" instruction="פותרים את ההגדרות וכותבים אות בכל משבצת" sub="" />
    <text x={W / 2} y={120} fontSize="15" textAnchor="middle" fontFamily={FONT} direction="rtl">בטור האפור תתגלה מילה — שם המשפחה של המכבים</text>
    <rect x={xc - box / 2} y={top} width={box} height={rowH * HIDDEN.length} fill="#e5e7eb" />
    {HIDDEN.map(([, word, pos], i) => { const y = top + i * rowH + (rowH - box) / 2; return <g key={word} fontFamily={FONT}>
      {[...word].map((_, k) => <rect key={k} x={xc + (pos - k) * box - box / 2} y={y} width={box} height={box} fill="none" stroke={INK} strokeWidth={k === pos ? 3 : 1.5} />)}
      <text x={xc + pos * box + box / 2 + 16} y={y + box / 2 + 6} fontSize="17" fontWeight="800" textAnchor="middle">{i + 1}</text>
    </g> })}
    <g fontFamily={FONT} fontSize="15" direction="rtl">
      {HIDDEN.map(([clue], i) => <text key={clue} x={570} y={530 + i * 29} textAnchor="start">{i + 1}. {clue}</text>)}
      <text x={570} y={795} fontSize="18" fontWeight="700" textAnchor="start">המילה הנסתרת: ________________</text>
    </g>
    <image href={art('🕎')} x="36" y="740" width="64" height="64" />
  </SvgPage>
}

function ScramblePage({ n, seed }) {
  const rowH = 82, top = 140
  return <SvgPage label="מילים מבולבלות">
    <Head n={n} title="מילים מבולבלות" instruction="מסדרים את האותיות ומגלים מילה של חנוכה" sub="" />
    <text x={W / 2} y={120} fontSize="14" textAnchor="middle" fontFamily={FONT} direction="rtl">שימו לב: אותיות סופיות (ם, ן) כתובות כאן כרגילות</text>
    {SCRAMBLE.map(([w, hint], i) => { const y = top + i * rowH + rowH / 2; return <g key={w} fontFamily={FONT} direction="rtl">
      <text x={570} y={y + 4} fontSize="16" textAnchor="start">{i + 1}.</text>
      <text x={400} y={y + 8} fontSize="26" fontWeight="800" textAnchor="middle" letterSpacing="2">{[...scrambled(w, seed, i)].join(' ')}</text>
      <text x={400} y={y + 32} fontSize="13" textAnchor="middle" fill="#555">רמז: {hint}</text>
      <path d={`M40 ${y + 12} H240`} stroke={INK} strokeWidth="1.5" />
      {i < SCRAMBLE.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function RiddlesPage({ n }) {
  return <TextPage n={n} title="חידות חנוכה: מי אני? מה אני?" sub="קוראים את החידה וכותבים את הפתרון" pics={['💡', '🕯️']}>
    <ol style={{ fontSize: '13pt', lineHeight: 1.55, padding: '0 10mm', margin: 0 }}>
      {RIDDLES.map(([r]) => <li key={r} style={{ marginBottom: 12 }}>{r}<div style={{ marginTop: 6 }}>אני: ______________________</div></li>)}
    </ol>
  </TextPage>
}

function DreidelPage({ n }) {
  const cell = { border: '1.5px solid #111', padding: '5px 6px', textAlign: 'center' }
  return <TextPage n={n} title="משחק הסביבון במספרים" sub="שישה ילדים משחקים בסביבון עם אגוזים" pics={['⭐', '🕎']}>
    <div style={{ fontSize: '12.5pt', lineHeight: 1.55, padding: '0 6mm' }}>
      <div style={{ border: '2px dashed #111', borderRadius: 10, padding: '6px 12px', marginBottom: 8 }}>
        <b>הכללים שלנו:</b> נ — לא קורה כלום · ג — לוקחים את כל הקופה · ה — לוקחים חצי מהקופה · פ — מוסיפים 2 אגוזים לקופה
      </div>
      <p style={{ margin: '0 0 6px' }}>בהתחלה יש בקופה <b>{DREIDEL_START}</b> אגוזים. משלימים את הטבלה:</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
        <thead><tr><th style={cell}>תור</th><th style={cell}>שחקן</th><th style={cell}>נפלה האות</th><th style={cell}>כמה לקח/ה?</th><th style={cell}>כמה בקופה אחרי התור?</th></tr></thead>
        <tbody>{DREIDEL.map(([who, l], i) => <tr key={who}><td style={cell}>{i + 1}</td><td style={cell}>{who}</td><td style={{ ...cell, fontSize: '16pt', fontWeight: 800 }}>{l}</td><td style={cell} /><td style={cell} /></tr>)}</tbody>
      </table>
      <ol style={{ margin: 0, paddingInlineStart: 22 }}>
        <li>מי לקח הכי הרבה אגוזים מהקופה? ______________</li>
        <li>כמה אגוזים לקחו יחד כל השחקנים? ______ &nbsp; בדיקה: {DREIDEL_START} + כל מה שהוסיפו = ______</li>
        <li>איזה חלק מ־{DREIDEL_START} האגוזים שבהתחלה לקח יואב? כתבו כשבר: ______</li>
        <li>אילו נועה הייתה מקבלת ג במקום ה, כמה אגוזים הייתה לוקחת? ______</li>
        <li>לסביבון ארבע צלעות. אם מסובבים אותו 40 פעמים, בערך כמה פעמים ייפול על ג? ______</li>
        <li>אתגר: בקופה 20 אגוזים. שני שחקנים קיבלו ה, בזה אחר זה. כמה אגוזים נשארו בקופה? ______</li>
      </ol>
    </div>
  </TextPage>
}

const PROBLEMS = [
  'מאפייה בבאר שבע אפתה 480 סופגניות. ¼ מהן במילוי ריבה, ⅜ במילוי שוקולד, והשאר בריבת חלב. כמה סופגניות יש מכל סוג?',
  'סופגנייה עולה 7 ₪. אורי קנה 6 סופגניות ושילם בשטר של 50 ₪. כמה עודף קיבל?',
  'סבתא של שירה מכינה לביבות: מכל 3 תפוחי אדמה יוצאות 8 לביבות. כמה לביבות ייצאו מ־12 תפוחי אדמה?',
  'בכיתה ה׳2 יש 32 תלמידים, וכל אחד מקבל סופגנייה. הסופגניות נמכרות בקופסאות של 6. כמה קופסאות צריך לקנות, וכמה סופגניות יישארו?',
  'מסיבת החנוכה של הכיתה מתחילה ב־17:45 ונמשכת שעתיים ו־40 דקות. מתי היא נגמרת?',
  'בדוכן של עידו ואלה מכרו יחד 45 סופגניות. עידו מכר פי 2 סופגניות מאלה. כמה מכר כל אחד?',
]

function ProblemsPage({ n }) {
  return <TextPage n={n} title="סופגניות ולביבות — בעיות מילוליות" sub="כותבים תרגיל ותשובה" pics={['⏰', '🕎']}>
    <ol style={{ fontSize: '12.5pt', lineHeight: 1.5, padding: '0 9mm', margin: 0 }}>
      {PROBLEMS.map(p => <li key={p} style={{ marginBottom: 6 }}>{p}<div style={{ height: 58, borderBottom: '1px solid #111' }} /><div style={{ textAlign: 'left', fontSize: '11pt', marginTop: 2 }}>תשובה: ______________</div></li>)}
    </ol>
  </TextPage>
}

function CandlesPage({ n }) {
  const cell = { border: '1.5px solid #111', padding: '6px 4px', textAlign: 'center', width: '11%' }
  return <TextPage n={n} title="חשבון הנרות" sub="זוכרים: בכל ערב מוסיפים נר, ותמיד יש גם שמש" pics={['🕯️', '🕎']}>
    <div style={{ fontSize: '12.5pt', lineHeight: 1.6, padding: '0 6mm' }}>
      <p style={{ margin: '0 0 6px' }}><b>1.</b> משלימים את הטבלה: כמה נרות (עם השמש) דולקים בכל ערב, וכמה נרות הודלקו עד עכשיו בסך הכול.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <tbody>
          <tr><th style={{ ...cell, width: '12%' }}>ערב</th>{Array.from({ length: 8 }, (_, i) => <td key={i} style={cell}>{i + 1}</td>)}</tr>
          <tr><th style={{ ...cell, width: '12%' }}>נרות הערב</th>{Array.from({ length: 8 }, (_, i) => <td key={i} style={cell}>{i < 2 ? i + 2 : ''}</td>)}</tr>
          <tr><th style={{ ...cell, width: '12%' }}>סך הכול עד עכשיו</th>{Array.from({ length: 8 }, (_, i) => <td key={i} style={cell}>{i < 2 ? [2, 5][i] : ''}</td>)}</tr>
        </tbody>
      </table>
      <ol start={2} style={{ margin: 0, paddingInlineStart: 22 }}>
        <li>כמה נרות צריך לכל החג, כולל השמשים? ______ &nbsp; ובלי השמשים? ______</li>
        <li>באיזה ערב דולקים 8 נרות, כולל השמש? ______</li>
        <li>במשפחת לוי מדליקים 4 חנוכיות. כמה נרות הם צריכים לכל החג (כולל שמשים)? ______</li>
        <li>בקופסה יש 44 נרות. נגה קנתה 3 קופסאות, ובבית שלה מדליקים 2 חנוכיות. כמה נרות יישארו בסוף החג? ______</li>
        <li>בערב השלישי הדליקו נרות שכל אחד מהם דולק 35 דקות. הנרות הודלקו ב־16:50. מתי כבו? ______</li>
        <li>אתגר: אילו החג היה נמשך 10 ימים, כמה נרות היו צריכים לכל החג, כולל השמשים? ______</li>
      </ol>
    </div>
  </TextPage>
}

function GematriaPage({ n }) {
  const td = { border: '1.5px solid #111', padding: '3px 2px', textAlign: 'center', fontSize: '12pt' }
  const sq = { display: 'inline-block', width: 40, height: 30, border: '1.5px solid #111', textAlign: 'center', lineHeight: '30px' }
  return <TextPage n={n} title="צופן הגימטריה" sub="לכל אות בעברית יש ערך מספרי" pics={['🔑', '💡']}>
    <div style={{ fontSize: '12.5pt', lineHeight: 1.6, padding: '0 5mm' }}>
      {[GEMATRIA.slice(0, 11), GEMATRIA.slice(11)].map((row, i) => <table key={i} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}><tbody>
        <tr>{row.map(([l]) => <td key={l} style={{ ...td, fontWeight: 800, fontSize: '15pt' }}>{l}</td>)}</tr>
        <tr>{row.map(([l, v]) => <td key={l} style={td}>{v}</td>)}</tr>
      </tbody></table>)}
      <p style={{ margin: '2px 0 10px', fontSize: '11pt' }}>אותיות סופיות שוות כמו הרגילות: ם = 40, ן = 50, ך = 20.</p>
      <p style={{ margin: '0 0 4px' }}><b>א. אותיות הסביבון</b></p>
      <p style={{ margin: '0 0 2px' }}>נ + ג + ה + פ = ______ &nbsp;&nbsp;&nbsp; נ + ג + ה + ש = ______</p>
      <p style={{ margin: '0 0 10px' }}>בכמה גדול הערך של הסביבון מחוץ לארץ? ______</p>
      <p style={{ margin: '0 0 4px' }}><b>ב. מה הערך של כל מילה?</b></p>
      <p style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between' }}>{GEM_WORDS.map(w => <span key={w}>{w} = ______</span>)}</p>
      <p style={{ margin: '0 0 6px' }}><b>ג. פענחו את המסר הסודי:</b> כותבים מתחת לכל מספר את האות שלו (קוראים מימין לשמאל).</p>
      <div style={{ display: 'flex', direction: 'rtl', justifyContent: 'center', gap: 26, marginBottom: 12 }}>
        {SECRET.split(' ').map((w, i) => <div key={i} style={{ display: 'flex', gap: 3 }}>
          {[...w].map((ch, k) => <div key={k}><div style={{ ...sq, fontWeight: 800, background: '#f3f4f6' }}>{VAL[ch]}</div><div style={sq} /></div>)}
        </div>)}
      </div>
      <p style={{ margin: '0 0 4px' }}><b>ד. אתגר:</b> חשבו את הערך של השם הפרטי שלכם: ____________ = ______</p>
      <p style={{ margin: 0 }}>ומי במשפחה שלכם בעל השם עם הערך הגבוה ביותר? ______________</p>
    </div>
  </TextPage>
}

function SudokuPage({ n, seed }) {
  const { puzzle } = buildSudoku(seed), c = 74, x0 = (W - c * 6) / 2, y0 = 170
  return <SvgPage label="סודוקו הסביבון">
    <Head n={n} title="סודוקו הסביבון" instruction="ממלאים את המספרים 1 עד 6" sub="" />
    <text x={W / 2} y={124} fontSize="15" textAnchor="middle" fontFamily={FONT} direction="rtl">בכל שורה, בכל טור ובכל מלבן מודגש — כל מספר פעם אחת בדיוק</text>
    <g fontFamily={FONT}>
      {puzzle.map((v, i) => { const r = Math.floor(i / 6), col = i % 6; return <g key={i}>
        <rect x={x0 + col * c} y={y0 + r * c} width={c} height={c} fill={v ? '#f3f4f6' : 'white'} stroke={INK} strokeWidth="1" />
        {v ? <text x={x0 + col * c + c / 2} y={y0 + r * c + c / 2 + 13} fontSize="36" fontWeight="800" textAnchor="middle">{v}</text> : null}
      </g> })}
      {[0, 2, 4, 6].map(r => <path key={`h${r}`} d={`M${x0} ${y0 + r * c} H${x0 + 6 * c}`} stroke={INK} strokeWidth="4" />)}
      {[0, 3, 6].map(k => <path key={`v${k}`} d={`M${x0 + k * c} ${y0} V${y0 + 6 * c}`} stroke={INK} strokeWidth="4" />)}
    </g>
    {[['🕯️', 10, 220], ['🕎', 530, 220], ['🕎', 10, 500], ['🕯️', 530, 500]].map(([e, x, y], i) => <image key={i} href={art(e)} x={x} y={y} width="60" height="60" />)}
    <g fontFamily={FONT} fontSize="15" textAnchor="middle" direction="rtl">
      <text x={W / 2} y={y0 + 6 * c + 50}>טיפ: מתחילים בשורה, בטור או במלבן שבהם חסרים הכי מעט מספרים.</text>
      <text x={W / 2} y={y0 + 6 * c + 78}>בדיקה: הסכום של כל שורה הוא 1+2+3+4+5+6 = 21</text>
    </g>
  </SvgPage>
}

export default function HanukkahGrade5Booklet({ seed }) {
  const pot = potAfter(), { solution } = buildSudoku(seed)
  return <>
    <Cover emoji="🕎🔍🧩" title="חוברת העשרה וכיף לחנוכה" subtitle="לכיתות ה׳–ו׳: הבנת הנקרא, חידות, תשבץ, מבוך, חשבון וצופן" pages={PAGES}
      note="החוברת מיועדת לכיתות ה׳–ו׳ ואפשר לפתור אותה לבד. כדאי לעשות עמוד או שניים בכל ערב של חנוכה. עמודי הסיפור והשאלות הולכים יחד; את שאר העמודים אפשר לפתור בכל סדר. בסוף יש דף תשובות." />
    <StoryPage n={2} />
    <QuestionsPage n={3} />
    <TrueFalsePage n={4} />
    <MotorPage n={5} activity={mazeFor(seed)} />
    <HiddenWordPage n={6} />
    <WordSearchPage n={7} seed={seed} he size={11} title="תפזורת החשמונאים" instruction="מוצאים את המילים: מימין לשמאל או מלמעלה למטה" words={SEARCH_WORDS.map(w => ({ word: w }))} />
    <ScramblePage n={8} seed={seed} />
    <RiddlesPage n={9} />
    <DreidelPage n={10} />
    <ProblemsPage n={11} />
    <CandlesPage n={12} />
    <GematriaPage n={13} />
    <SudokuPage n={14} seed={seed} />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 3 — שאלות על הסיפור', answers: [
        'לשמור שבת, ללמוד תורה, לקיים מצוות (שניים מהם)', 'ב — חוקים ואיסורים של המלך', 'הכירו את השבילים בהרים והפתיעו את האויב',
        'מחנוכת בית המקדש מחדש', 'כדי לפרסם את הנס — שכולם יראו את האור', 'בארץ: פ — "פה", כי הנס קרה כאן; בחו״ל: ש — "שם"',
      ] },
      { title: 'עמוד 3 — סדר האירועים', answers: [ORDER.map(([e, k]) => `${k} — ${e}`).join(' · ')] },
      { title: 'עמוד 4 — נכון או לא נכון', answers: [TRUE_FALSE.map(([, t, fix], i) => `${i + 1}: ${t ? '✓' : `✗ (${fix})`}`).join(' · ')] },
      { title: 'עמוד 6 — המילה הנסתרת', answers: [HIDDEN.map(h => h[1]).join(', '), `המילה: ${HIDDEN_WORD}`] },
      { title: 'עמוד 8 — מילים מבולבלות', answers: [SCRAMBLE.map(s => s[0]).join(', ')] },
      { title: 'עמוד 9 — חידות', answers: [RIDDLES.map(r => r[1]).join(', ')] },
      { title: 'עמוד 10 — משחק הסביבון', answers: [
        `הקופה אחרי כל תור: ${pot.join(', ')}`, 'יואב (16)', `36 (${DREIDEL_START} בהתחלה ועוד 4 שהוסיפו)`, '½ (16 מתוך 32)', '18 — כל הקופה', 'בערך 10 (רבע מהפעמים)', '5 (קודם נשארו 10, ואז 5)',
      ] },
      { title: 'עמוד 11 — בעיות מילוליות', answers: ['ריבה 120, שוקולד 180, ריבת חלב 180', '50 − 42 = 8 ₪', '32 לביבות', '6 קופסאות, יישארו 4', '20:25', 'אלה 15, עידו 30'] },
      { title: 'עמוד 12 — חשבון הנרות', answers: [
        'נרות הערב: 2 3 4 5 6 7 8 9; סך הכול: 2 5 9 14 20 27 35 44', '44; בלי שמשים 36', 'בערב השביעי', '176', '132 − 88 = 44', '17:25', '55 + 10 = 65',
      ] },
      { title: 'עמוד 13 — צופן הגימטריה', answers: ['נגהפ = 138, נגהש = 358, ההפרש 220', GEM_WORDS.map(w => `${w} = ${gematria(w)}`).join(', '), `המסר: ${SECRET}`] },
      { title: 'עמוד 14 — סודוקו (כל שורה משמאל לימין)', answers: Array.from({ length: 6 }, (_, r) => solution.slice(r * 6, r * 6 + 6).join(' ')) },
    ]} />
    <Certificate booklet="חוברת ההעשרה לחנוכה" done="קראתי את סיפור החג, פתרתי מבוך, תשבץ, חידות, צופן וסודוקו, וחישבתי נרות, סופגניות וסביבונים." cheer="חג אורים שמח! 🕎" />
  </>
}

import { AnswerKey, Certificate, ChoicePage, Cover, Head, MatchPage, Pic, SvgPage, WordSearchPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת תרגול לחיזוק שרירי הפה" — playful oral-motor practice for kindergarten and early school years:
// blowing, lips, tongue and cheeks. Every exercise is a game done in front of a mirror, a few repetitions
// at a time, with a tick-box row to colour after each try. It supports, and never replaces, a speech
// therapist's plan, and the cover note says so.
const PAGES = bookletBySlug('oral-motor').pages
const FONT = 'Heebo, Arial, sans-serif'

// [emoji, name, how to do it]
const BLOW = [
  ['🫧', 'בועות סבון', 'נושפים לאט, כדי שהבועה תגדל ולא תתפוצץ'],
  ['🪶', 'נוצה באוויר', 'נושפים מתחת לנוצה כדי שתישאר באוויר'],
  ['🕯️', 'נר דמיוני', 'נושפים בעדינות כדי שהלהבה תרקוד, ובנשיפה חזקה היא נכבית'],
  ['🥤', 'בועות בכוס', 'נושפים בקש לכוס מים ויוצרים בועות'],
  ['⛵', 'ספינת נייר', 'נושפים על ספינה בקערת מים ומובילים אותה לחוף'],
  ['🎈', 'מנפחים בלון', 'שאיפה עמוקה דרך האף ונשיפה אחת ארוכה'],
]
const LIPS = [
  ['😘', 'נשיקה גדולה', 'מכווצים את השפתיים קדימה ומחזיקים עד חמש'],
  ['😁', 'חיוך רחב', 'מותחים את השפתיים לצדדים, בלי להראות שיניים'],
  ['🐟', 'פה של דג', 'מכווצים את הלחיים ופותחים וסוגרים שפתיים'],
  ['🐴', 'סוס רוטן', 'מרטיטים את השפתיים ומשמיעים ברררר'],
  ['🥄', 'כפית על השפה', 'מחזיקים כפית קלה בין השפתיים, בלי ידיים'],
  ['🎺', 'חצוצרה', 'סוגרים שפתיים חזק ופותחים בפיצוץ: פּ פּ פּ'],
]
const TONGUE = [
  ['👅', 'לשון החוצה', 'מוציאים לשון ישרה וארוכה ומחזיקים עד חמש'],
  ['🍦', 'ליקוק גלידה', 'מלקקים בדמיון גלידה מלמטה למעלה, מהסנטר ועד האף'],
  ['↔️', 'שעון לשון', 'מזיזים את הלשון מזווית פה אחת לשנייה'],
  ['🐴', 'סוס דוהר', 'נוקשים עם הלשון על החך: טוק טוק טוק'],
  ['🍯', 'דבש על השפה', 'מנקים ״דבש״ דמיוני סביב השפתיים בעזרת הלשון'],
  ['🐶', 'כלב מתנשף', 'מוציאים לשון ונושפים אוויר חם, ה ה ה'],
]
const CHEEKS = [
  ['🎈', 'לחיים כמו בלון', 'מנפחים את שתי הלחיים ומחזיקים עד חמש'],
  ['🐿️', 'סנאי עם אגוזים', 'מעבירים אוויר מלחי ללחי ובחזרה'],
  ['🥱', 'פיהוק גדול', 'פותחים את הפה לרווחה ומגלגלים עיניים'],
  ['🍪', 'לעיסה גדולה', 'לועסים ״עוגייה״ דמיונית בתנועות גדולות, עם שפתיים סגורות'],
  ['🦁', 'אריה שואג', 'פותחים פה גדול, מוציאים לשון ומשמיעים ״אָה״'],
  ['🙂', 'סוגרים ופותחים', 'פותחים את הלסת למטה, סוגרים בעדינות. חוזרים חמש פעמים'],
]
const BODY = [['👄', 'שפתיים'], ['👅', 'לשון'], ['🦷', 'שן'], ['👃', 'אף'], ['👂', 'אוזן'], ['👁️', 'עין']]
// Pictures to match with the sound or movement they ask for.
const SOUNDS = [['🐑', 'בֶּה'], ['🐄', 'מוּ'], ['🐍', 'סססס'], ['🚓', 'ויוּ ויוּ'], ['🐴', 'ברררר'], ['🐝', 'זזזזז']]
// What do we do? Picture + the three verbs; the first is the right one (shuffled by position below).
const DO = [
  ['🫧', 'נושפים', 'מצמידים', 'סוגרים'], ['😘', 'מנשקים', 'נושפים', 'מלקקים'], ['🍦', 'מלקקים', 'מנשקים', 'מחייכים'],
  ['🎈', 'מנפחים', 'מלקקים', 'מרטיטים'], ['🥱', 'מפהקים', 'נושפים', 'מנשקים'], ['😁', 'מחייכים', 'מלקקים', 'מנפחים'],
]
const SEARCH = [['לשון', '👅'], ['בועה', '🫧'], ['נוצה', '🪶'], ['נשיפה', '💨'], ['חיוך', '😁'], ['לחי', '😊'], ['שפה', '👄'], ['קש', '🥤']]
const FACES = [['חיוך רחב', 'smile'], ['נשיקה', 'kiss'], ['לשון החוצה', 'tongue'], ['לחיים מנופחות', 'puff']]

const SLOT = i => i % 3 // answers rotate through the three option slots so the right one is not always first
const doItems = DO.map(([emoji, right, w1, w2], i) => {
  const opts = [w1, w2]; opts.splice(SLOT(i), 0, right)
  return { pic: { emoji }, options: opts, answer: right }
})

// A list of six exercises: picture, name, how-to and five empty circles to colour after each try.
function ExercisePage({ n, title, instruction, items }) {
  const rowH = 660 / items.length
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map(([emoji, name, how], i) => { const y = 135 + i * rowH + rowH / 2; return <g key={name} fontFamily={FONT} direction="rtl">
      <Pic item={{ emoji }} x={540} y={y - 8} size={rowH * 0.62} />
      <text x={480} y={y - 18} fontSize="21" fontWeight="800" textAnchor="start">{name}</text>
      <text x={480} y={y + 6} fontSize="14" textAnchor="start">{how}</text>
      {[0, 1, 2, 3, 4].map(k => <circle key={k} cx={470 - k * 34} cy={y + 30} r="11" fill="white" stroke="#111" strokeWidth="2" />)}
      {i < items.length - 1 && <path d={`M30 ${y + rowH / 2 - 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

// A winding track to blow a cotton ball along, start to finish.
function TrackPage({ n }) {
  const d = 'M510 190 H120 Q70 190 70 240 Q70 290 120 290 H480 Q530 290 530 340 Q530 390 480 390 H120 Q70 390 70 440 Q70 490 120 490 H480 Q530 490 530 540 Q530 590 480 590 H200'
  return <SvgPage label="מסלול נשיפה">
    <Head n={n} title="מסלול נשיפה" instruction="מניחים כדור צמר גפן בהתחלה ונושפים אותו לאורך הדרך עד הדגל" />
    <path d={d} fill="none" stroke="#bbb" strokeWidth="46" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#111" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
    <g fontFamily={FONT} textAnchor="middle" fontWeight="800">
      <circle cx="530" cy="190" r="22" fill="white" stroke="#111" strokeWidth="3" /><text x="530" y="198" fontSize="20">☁️</text>
      <text x="540" y="238" fontSize="18">התחלה</text>
      <text x="150" y="602" fontSize="34">🚩</text>
      <text x="150" y="650" fontSize="18">סיום</text>
    </g>
    <g fontFamily={FONT} fontSize="15" textAnchor="middle" direction="rtl">
      <text x="300" y="700">נושפים לאט ובמשך זמן ארוך: שאיפה דרך האף, ונשיפה דרך פה מכווץ כמו קש.</text>
      <text x="300" y="726">זמן שלי: ______ שניות · הצלחתי בלי ידיים: כן / עוד לא</text>
    </g>
  </SvgPage>
}

function Face({ kind, x, y }) {
  const eyes = <><circle cx={x - 22} cy={y - 16} r="5" fill="#111" /><circle cx={x + 22} cy={y - 16} r="5" fill="#111" /></>
  return <g>
    <circle cx={x} cy={y} r="62" fill="white" stroke="#111" strokeWidth="3" />{eyes}
    {kind === 'puff' && <><circle cx={x - 50} cy={y + 14} r="16" fill="none" stroke="#111" strokeWidth="2" strokeDasharray="3 4" /><circle cx={x + 50} cy={y + 14} r="16" fill="none" stroke="#111" strokeWidth="2" strokeDasharray="3 4" /></>}
    <path d={`M${x - 24} ${y + 26} H${x + 24}`} stroke="#bbb" strokeWidth="2" strokeDasharray="3 4" />
  </g>
}

// Four empty faces in a grid: look in the mirror, make the face and draw the mouth.
function MirrorPage({ n }) {
  return <SvgPage label="מציירים פנים">
    <Head n={n} title="מציירים פנים מול המראה" instruction="עושים את הפרצוף מול המראה ומציירים את הפה, השפתיים והלשון על הפרצוף" />
    {FACES.map(([name, kind], i) => { const x = 440 - (i % 2) * 280, y = 260 + Math.floor(i / 2) * 270; return <g key={kind}>
      <Face kind={kind} x={x} y={y} />
      <text x={x} y={y + 96} fontSize="20" fontWeight="800" textAnchor="middle" fontFamily={FONT} direction="rtl">{name}</text>
    </g> })}
  </SvgPage>
}

// A week of practice: each row an exercise, a star to colour for each day.
const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const TRACK_ROWS = ['נשיפה', 'שפתיים', 'לשון', 'לחיים ולסת', 'שיר או משחק קול']
function WeekPage({ n }) {
  return <SvgPage label="לוח תרגול שבועי">
    <Head n={n} title="לוח תרגול שבועי" instruction="בכל יום שמתרגלים צובעים כוכב. חמש דקות ביום מספיקות" />
    <g fontFamily={FONT} textAnchor="middle" direction="rtl">
      {DAYS.map((dd, k) => <text key={dd} x={440 - k * 60} y={165} fontSize="20" fontWeight="800">{dd}</text>)}
      {TRACK_ROWS.map((r, i) => { const y = 215 + i * 90; return <g key={r}>
        <text x={575} y={y - 36} fontSize="17" fontWeight="800" textAnchor="end">{r}</text>
        {DAYS.map((_, k) => <text key={k} x={440 - k * 60} y={y + 14} fontSize="40" fill="white" stroke="#111" strokeWidth="1.6">★</text>)}
        <path d={`M30 ${y + 34} H570`} stroke="#ddd" strokeDasharray="5 6" />
      </g> })}
      <text x="300" y="720" fontSize="16">חיזוק מיוחד השבוע: ____________________</text>
    </g>
  </SvgPage>
}

const rows = list => list.map(([e, w]) => `${e} ${w}`)

export default function OralMotorBooklet({ seed }) {
  return <>
    <Cover emoji="👄👅🫧" title="חוברת תרגול לחיזוק שרירי הפה" subtitle="14 עמודים: נשיפה, שפתיים, לשון ולחיים — משחקים מול המראה" pages={PAGES}
      note="התרגילים בנויים כמשחק קצר ומשותף, כמה דקות ביום, מול מראה, ובלי לחץ. מתחילים בנשיפה, ממשיכים לשפתיים, ללשון וללחיים, וחוזרים על כל תרגיל חמש פעמים (צובעים עיגול אחרי כל ניסיון). החוברת מתאימה לגן ולבית, והיא משלימה ואינה מחליפה הנחיה של קלינאית תקשורת. אם יש קושי באכילה, בשתייה או בדיבור, כדאי להיוועץ באיש מקצוע. את התשובות לעמודים הכתובים תמצאו בעמוד 13." />
    <ExercisePage n={2} title="נושפים ומפוצצים" instruction="מתרגלים כל נשיפה, וצובעים עיגול אחרי כל ניסיון" items={BLOW} />
    <ExercisePage n={3} title="שפתיים גמישות" instruction="עושים את התנועה מול המראה וצובעים עיגול אחרי כל ניסיון" items={LIPS} />
    <ExercisePage n={4} title="לשון זריזה" instruction="מזיזים את הלשון לאט ובדייקנות, וצובעים עיגול אחרי כל ניסיון" items={TONGUE} />
    <ExercisePage n={5} title="לחיים ולסת" instruction="מתרגלים כל תנועה וצובעים עיגול אחרי כל ניסיון" items={CHEEKS} />
    <TrackPage n={6} />
    <ChoicePage n={7} title="מה עושים?" instruction="מסתכלים בתמונה ומקיפים את הפעולה המתאימה" items={doItems.map(({ pic, options }) => ({ pic, options }))} />
    <MatchPage n={8} seed={seed} title="חלקי הפנים" instruction="מותחים קו מכל תמונה לשם שלה" pairs={BODY.map(([e, w]) => [{ emoji: e }, { text: w }])} />
    <MatchPage n={9} seed={seed} title="מי משמיע את הקול?" instruction="אומרים את הקול בקול ומותחים קו מהתמונה אליו" pairs={SOUNDS.map(([e, w]) => [{ emoji: e }, { text: w }])} />
    <MirrorPage n={10} />
    <WordSearchPage n={11} seed={seed} he size={9} title="תפזורת הפה והנשיפה" instruction="מוצאים את המילים: מימין לשמאל או מלמעלה למטה"
      words={SEARCH.map(([word, emoji]) => ({ word, pic: { emoji } }))} />
    <WeekPage n={12} />
    <AnswerKey n={13} sections={[
      { title: 'עמוד 7 — מה עושים?', answers: doItems.map(it => `${it.pic.emoji} ${it.answer}`) },
      { title: 'עמוד 8 — חלקי הפנים', answers: rows(BODY) },
      { title: 'עמוד 9 — מי משמיע את הקול?', answers: SOUNDS.map(([e, w]) => `${e} ${w}`) },
      { title: 'עמוד 11 — תפזורת', answers: SEARCH.map(([w]) => w) },
    ]} />
    <Certificate booklet="חוברת חיזוק שרירי הפה" done="התאמנתי בנשיפה, בשפתיים, בלשון ובלחיים, והצלחתי להשמיע קולות." cheer="כל הכבוד, פה חזק ומחייך!" />
  </>
}

import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import PrintableShell, { Choice, Sheet, T } from '../../components/printables/PrintableShell'

const SIBLINGS = [
  ['kindergarten', '🧸 גן חובה'],
  ['grade1', '✏️ עברית לכיתה א׳'],
  ['sounds', '👂 צליל פותח וסוגר'],
  ['rhymes', '🎵 חרוזים והברות'],
  ['reading', '📖 קריאה וכתיבה'],
  ['grades23', '📚 כיתות ב׳–ג׳'],
]

const WORDS = ['דג', 'בית', 'כדור', 'חלון', 'חתול', 'שמש', 'ספר', 'פרח', 'ילד', 'כיסא', 'מכונית', 'עץ', 'שולחן', 'תפוח', 'גינה', 'עוגה', 'אריה', 'סירה', 'כובע', 'גלידה']
const RHYMES = [['חתול', 'כחול', 'כדור'], ['ספר', 'חבר', 'שולחן'], ['שמש', 'רשת', 'מחברת'], ['בלון', 'חלון', 'מכונית'], ['עוגה', 'בובה', 'דג'], ['כיסא', 'מראה', 'חתול'], ['פרח', 'ירח', 'מכנס'], ['גינה', 'סירה', 'כדור']]
const SYLLABLES = [['חתול', 'חָ־תוּל', 2], ['בננה', 'בָּ־נָ־נָה', 3], ['מכונית', 'מְ־כוֹ־נִית', 3], ['גלידה', 'גְּ־לִי־דָה', 3], ['אריה', 'אַר־יֵה', 2], ['חולצה', 'חוּל־צָה', 2], ['עגבנייה', 'עַגְ־בָ־נִיָּה', 4], ['תמונה', 'תְּ־מוּ־נָה', 3]]
const FINALS = [['מל_', 'ך'], ['שולח_', 'ן'], ['מי_', 'ם'], ['כ_', 'ף'], ['ע_', 'ץ'], ['שלו_', 'ם'], ['חוש_', 'ך'], ['ארו_', 'ן']]
const SENTENCES = [
  ['הילד משחק בכדור.', 'הילד | משחק | בכדור.'],
  ['החתול ישן על הכיסא.', 'החתול | ישן | על הכיסא.'],
  ['אמא קוראת ספר.', 'אמא | קוראת | ספר.'],
  ['הילדה אוכלת תפוח.', 'הילדה | אוכלת | תפוח.'],
  ['הדג שוחה במים.', 'הדג | שוחה | במים.'],
  ['הילדים רצים בגינה.', 'הילדים | רצים | בגינה.'],
]
const MEANINGS = [['שמח', 'מרגיש טוב ועליז'], ['מהיר', 'זז במהירות'], ['גדול', 'לא קטן'], ['שקט', 'בלי רעש'], ['אור', 'מה שמאיר'], ['חבר', 'ילד או אדם שאוהבים להיות איתו']]
const SORTING = [['כלב', 'חיה'], ['שולחן', 'דומם'], ['פרפר', 'חיה'], ['מחברת', 'דומם'], ['אריה', 'חיה'], ['כדור', 'דומם'], ['דג', 'חיה'], ['כיסא', 'דומם']]
const BUILD = [['כדור', 'רודכ'], ['ספר', 'רפס'], ['חלון', 'ןולח'], ['חתול', 'לותח'], ['גינה', 'הניג'], ['מכונית', 'תינוכמ'], ['תפוח', 'חופת'], ['שמש', 'שמש']]

const TOPICS = [
  ['first', 'צליל פותח', 'הקשיבו למילה וכתבו את הצליל הראשון.'],
  ['last', 'צליל סוגר', 'הקשיבו למילה וכתבו את הצליל האחרון.'],
  ['rhyme', 'חרוזים', 'הקיפו את המילה שמתחרזת.'],
  ['syllables', 'הברות', 'חלקו את המילה להברות וכתבו כמה הברות יש.'],
  ['copy', 'כתיבת מילים', 'עברו בעיפרון על המילה והעתיקו אותה על השורה.'],
  ['build', 'סידור אותיות', 'סדרו את האותיות וכתבו מילה תקינה.'],
  ['read', 'קריאה והשלמת מילה', 'קראו את המשפט והשלימו את המילה החסרה.'],
  ['final', 'אותיות סופיות', 'השלימו את האות הסופית המתאימה.'],
  ['sentence', 'סידור משפטים', 'סדרו את המילים למשפט תקין.'],
  ['match', 'מילה ומשמעות', 'חברו מילה להסבר המתאים שלה.'],
  ['sort', 'מיון מילים', 'כתבו אם זו חיה או דומם.'],
  ['meaning', 'אוצר מילים', 'קראו מילה וכתבו מה פירוש שלה.'],
]

const PACKS = {
  kindergarten: {
    path: '/printables/kindergarten-worksheets', emoji: '🧸',
    h1: 'דפי עבודה לגן חובה להדפסה', seoTitle: 'דפי עבודה לגן חובה להדפסה — 12 דפי הכנה לכיתה א׳ עם פתרונות',
    description: 'דפי עבודה לגן חובה להדפסה בחינם: אותיות, צליל פותח, חרוזים, הברות, כתיבת מילים וקריאה ראשונה. 12 דפים אמיתיים בשלוש רמות, עם דפי פתרונות.',
    sub: 'חבילת 12 דפי עבודה אמיתיים — אותיות, צלילים, חרוזים וקריאה ראשונה',
    lead: 'החבילה מתחילה במשימות קצרות של זיהוי צליל ואות, ומתקדמת לחרוזים, הברות ומילים. בוחרים רמה, מסמנים את הדפים שרוצים ומדפיסים גם פתרונות.'
  },
  grade1: {
    path: '/printables/hebrew-worksheets-grade-1', emoji: '✏️',
    h1: 'דפי עבודה בעברית לכיתה א׳', seoTitle: 'דפי עבודה בעברית לכיתה א׳ להדפסה — קריאה, כתיבה וצלילים עם פתרונות',
    description: 'דפי עבודה בעברית לכיתה א׳ להדפסה בחינם: קריאת מילים, כתיבה, צליל פותח וסוגר, הברות, אותיות סופיות וסידור משפטים. 12 דפים ורמות, עם פתרונות.',
    sub: '12 דפי עבודה לכיתה א׳ — קריאה, כתיבה, צלילים ומשפטים',
    lead: 'בכיתה א׳ חשוב לתרגל מעט וברור: שישה תרגילים בכל דף, על מטרה אחת. אפשר לבחור חבילה קלה, רגילה או מאתגרת ולצרף פתרונות לבדיקה.'
  },
  sounds: {
    path: '/printables/opening-ending-sounds', emoji: '👂',
    h1: 'צליל פותח וצליל סוגר — דפי עבודה להדפסה', seoTitle: 'צליל פותח וצליל סוגר — דפי עבודה לגן חובה ולכיתה א׳ עם פתרונות',
    description: 'דפי עבודה לצליל פותח וצליל סוגר להדפסה: 12 דפים של זיהוי צליל, אות ראשונה ואות אחרונה במילה, בשלוש רמות ועם פתרונות, וגם סט חנוכה עם גזירה, הדבקה וצביעה.',
    sub: '12 דפים שמלמדים לשמוע את הצליל הראשון והאחרון במילה',
    lead: 'מודעות לצלילים היא הבסיס לקריאה. מתחילים בצליל הפותח, ממשיכים לצליל הסוגר, ואז משלבים חרוזים והברות.'
  },
  rhymes: {
    path: '/printables/rhymes-syllables', emoji: '🎵',
    h1: 'חרוזים והברות — דפי עבודה להדפסה', seoTitle: 'חרוזים והברות — דפי עבודה לגן חובה ולכיתה א׳ עם פתרונות',
    description: 'דפי עבודה בחרוזים והברות להדפסה: מזהים מילים מתחרזות, מחלקים מילים להברות, סופרים הברות ובונים מילים. 12 דפים בשלוש רמות, עם פתרונות.',
    sub: '12 דפים של חרוזים, חלוקת מילים להברות וקריאה ראשונה',
    lead: 'חרוזים והברות הופכים את השפה למשחק: אומרים, מוחאים כפיים, משווים צלילים וכותבים. כל דף מתמקד במיומנות אחת.'
  },
  reading: {
    path: '/printables/reading-writing-words', emoji: '📖',
    h1: 'קריאה וכתיבת מילים לכיתה א׳', seoTitle: 'קריאה וכתיבת מילים לכיתה א׳ — דפי עבודה להדפסה עם פתרונות',
    description: 'דפי עבודה בקריאה וכתיבת מילים לכיתה א׳: העתקת מילים, בניית מילים, השלמת משפטים, אותיות סופיות ואוצר מילים. 12 דפים ורמות, עם פתרונות.',
    sub: '12 דפים של קריאה, כתיבה, בניית מילים וסידור משפטים',
    lead: 'החבילה מתאימה לרגע שבו הילד כבר מכיר אותיות ומתחיל לחבר אותן למילים ומשפטים. אפשר להדפיס דף אחד או את כל החבילה.'
  },
  grades23: {
    path: '/printables/hebrew-worksheets-grades-2-3', emoji: '📚',
    h1: 'דפי עבודה בעברית לכיתה ב׳ ולכיתה ג׳', seoTitle: 'דפי עבודה בעברית לכיתה ב׳ ולכיתה ג׳ להדפסה — מילים, משפטים והבנת שפה',
    description: 'דפי עבודה בעברית לכיתה ב׳ ולכיתה ג׳ להדפסה: אוצר מילים, סידור משפטים, משמעות מילים, כתיבה, אותיות סופיות וקריאה. 12 דפים בשלוש רמות עם פתרונות.',
    sub: '12 דפי עברית לכיתות ב׳–ג׳ — אוצר מילים, משפטים וכתיבה',
    lead: 'לכיתות ב׳–ג׳ בוחרים את הרמה המאתגרת: יותר מילים, משפטים ארוכים יותר ושאלות משמעות. לכל דף יש פתרון מוכן למורה או להורה.'
  },
}

const pick = (list, i, seed) => list[(i * 7 + seed * 11) % list.length]
const rotate = (list, i) => [...list.slice(i), ...list.slice(0, i)]

function question(mode, i, seed, level) {
  const extra = level === 'challenge' ? 5 : level === 'middle' ? 3 : 0
  if (mode === 'first') { const w = pick(WORDS, i + extra, seed); return { q: `כתבו את הצליל הפותח במילה: ${w}`, a: w[0] } }
  if (mode === 'last') { const w = pick(WORDS, i + extra, seed); return { q: `כתבו את הצליל הסוגר במילה: ${w}`, a: w.at(-1) } }
  if (mode === 'rhyme') { const [word, good, bad] = pick(RHYMES, i + extra, seed); return { q: `איזו מילה מתחרזת עם "${word}"?  ${good} / ${bad}`, a: good } }
  if (mode === 'syllables') { const [w, parts, count] = pick(SYLLABLES, i + extra, seed); return { q: `חלקו להברות וכתבו כמה יש במילה: ${w}`, a: `${parts} — ${count} הברות` } }
  if (mode === 'copy') { const w = pick(WORDS, i + extra, seed); return { q: `העתיקו על השורה: ${w}`, a: w } }
  if (mode === 'build') { const [word, mixed] = pick(BUILD, i + extra, seed); return { q: `סדרו את האותיות למילה: ${mixed}`, a: word } }
  if (mode === 'read') { const w = pick(WORDS, i + extra, seed); return { q: `השלימו: הילד ראה ___ בגינה.`, a: w } }
  if (mode === 'final') { const [shown, answer] = pick(FINALS, i + extra, seed); return { q: `השלימו את המילה: ${shown}`, a: answer } }
  if (mode === 'sentence') { const [answer, parts] = pick(SENTENCES, i + extra, seed); return { q: `סדרו למשפט: ${rotate(parts.split(' | '), (i + seed) % 3).join(' | ')}`, a: answer } }
  if (mode === 'match') { const [word, meaning] = pick(MEANINGS, i + extra, seed); return { q: `חברו: ${word}`, a: meaning } }
  if (mode === 'sort') { const [word, group] = pick(SORTING, i + extra, seed); return { q: `מיינו: ${word} — חיה או דומם?`, a: group } }
  const [word, meaning] = pick(MEANINGS, i + extra, seed)
  return { q: `מה פירוש המילה "${word}"?`, a: meaning }
}

// Hanukkah theme (opening/ending sounds pack): word, picture
const HK_WORDS = [['סביבון', '🎲'], ['סופגנייה', '🍩'], ['נר', '🕯️'], ['חנוכייה', '🕎'], ['שמן', '🫒'], ['כד', '🏺'], ['מכבי', '🛡️'], ['לביבה', '🥞'], ['מתנה', '🎁'], ['אור', '💡'], ['שמש', '🔥']]
const HK_TOPICS = [
  ['hk-first', 'חנוכה: צליל פותח', 'הסתכלו בתמונה, אִמרו את המילה וכתבו את הצליל הראשון.'],
  ['hk-last', 'חנוכה: צליל סוגר', 'הסתכלו בתמונה, אִמרו את המילה וכתבו את הצליל האחרון.'],
  ['hk-paste-first', 'חנוכה: גזירה והדבקה — פותח', 'גזרו את הכרטיסים והדביקו כל אחד בתיבה של הצליל הפותח שלו.'],
  ['hk-paste-last', 'חנוכה: גזירה והדבקה — סוגר', 'גזרו את הכרטיסים והדביקו כל אחד בתיבה של הצליל הסוגר שלו.'],
  ['hk-color-first', 'חנוכה: צביעה — פותח', 'צבעו בכל שורה את התמונה שהצליל הפותח שלה מתאים לאות.'],
  ['hk-color-last', 'חנוכה: צביעה — סוגר', 'צבעו בכל שורה את התמונה שהצליל הסוגר שלה מתאים לאות.'],
]
const hkKey = (mode, w) => mode === 'first' ? w[0] : w.at(-1)

function hkQuestion(mode, i, seed, level) {
  const extra = level === 'challenge' ? 5 : level === 'middle' ? 3 : 0
  const [w, e] = pick(HK_WORDS, i + extra, seed)
  return mode === 'first'
    ? { q: `${e}  כתבו את הצליל הפותח במילה: ${w}`, a: w[0] }
    : { q: `${e}  כתבו את הצליל הסוגר במילה: ${w}`, a: w.at(-1) }
}

function HkPasteSheet({ pack, topic, seed, answers }) {
  const mode = topic[0].endsWith('last') ? 'last' : 'first'
  const keys = [...new Set(HK_WORDS.map(([w]) => hkKey(mode, w)))]
  const chosenKeys = rotate(keys, seed % keys.length).slice(0, 4)
  const cards = rotate(HK_WORDS.filter(([w]) => chosenKeys.includes(hkKey(mode, w))), seed % 3).slice(0, 8)
  const used = chosenKeys.filter(k => cards.some(([w]) => hkKey(mode, w) === k))
  return <Sheet label={`${answers ? 'פתרונות' : 'דף עבודה'} — ${topic[1]}`}>
    <T x={100} y={16} size={8} weight={900}>{answers ? 'פתרונות: ' : ''}{topic[1]}</T>
    <T x={100} y={24} size={4.2} fill="#555">{topic[2]}</T>
    <T x={190} y={32} size={4.2} anchor="start" fill="#555">שם: ______________</T>
    {used.map((k, i) => {
      const x = 149 - i * 46
      const inside = cards.filter(([w]) => hkKey(mode, w) === k)
      return <g key={k}>
        <rect x={x} y={40} width={41} height={96} rx={3} fill="#f8fafc" stroke="#475569" strokeWidth=".7" />
        <T x={x + 20.5} y={58} size={20} weight={900} fill="#1d4ed8">{k}</T>
        <line x1={x + 4} x2={x + 37} y1={64} y2={64} stroke="#cbd5e1" strokeWidth=".5" />
        {answers && inside.map(([w, e], j) => <T key={w} x={x + 20.5} y={76 + j * 12} size={5.4} weight={800} fill="#c1121f">{`${e} ${w}`}</T>)}
      </g>
    })}
    <line x1={10} x2={190} y1={152} y2={152} stroke="#64748b" strokeWidth=".5" strokeDasharray="2 2" />
    <T x={100} y={158} size={4.2} fill="#64748b">✂ גזרו כאן את הכרטיסים</T>
    {cards.map(([w, e], i) => {
      const x = 149 - (i % 4) * 46, y = 166 + Math.floor(i / 4) * 44
      return <g key={w}>
        <rect x={x} y={y} width={41} height={38} rx={3} fill="#fff" stroke="#94a3b8" strokeWidth=".6" strokeDasharray="2 1.5" />
        <T x={x + 20.5} y={y + 20} size={15}>{e}</T>
        <T x={x + 20.5} y={y + 32} size={6} weight={800}>{w}</T>
      </g>
    })}
    <T x={100} y={260} size={3.9} fill="#64748b">{pack.h1} · חנוכה · עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

function HkColorSheet({ pack, topic, seed, answers }) {
  const mode = topic[0].endsWith('last') ? 'last' : 'first'
  const rows = Array.from({ length: 6 }, (_, i) => {
    const target = pick(HK_WORDS, i, seed)
    const key = hkKey(mode, target[0])
    const options = []
    for (let j = 1; options.length < 2 && j <= HK_WORDS.length; j++) {
      const c = HK_WORDS[(HK_WORDS.indexOf(target) + j * 3) % HK_WORDS.length]
      const ck = hkKey(mode, c[0])
      if (ck !== key && !options.some(o => hkKey(mode, o[0]) === ck)) options.push(c)
    }
    const at = (i + seed) % 3
    options.splice(at, 0, target)
    return { key, options, at }
  })
  return <Sheet label={`${answers ? 'פתרונות' : 'דף עבודה'} — ${topic[1]}`}>
    <T x={100} y={16} size={8} weight={900}>{answers ? 'פתרונות: ' : ''}{topic[1]}</T>
    <T x={100} y={24} size={4.2} fill="#555">{topic[2]}</T>
    <T x={190} y={32} size={4.2} anchor="start" fill="#555">שם: ______________</T>
    {rows.map((row, i) => {
      const y = 42 + i * 35
      return <g key={i}>
        <rect x={10} y={y - 6} width={180} height={31} rx={3} fill={i % 2 ? '#fff' : '#f8fafc'} stroke="#cbd5e1" strokeWidth=".5" />
        <T x={184} y={y + 8} size={5} anchor="end" weight={700}>{mode === 'first' ? 'פותח:' : 'סוגר:'}</T>
        <T x={166} y={y + 15} size={14} weight={900} fill="#1d4ed8">{row.key}</T>
        {row.options.map(([w, e], j) => {
          const x = 120 - j * 40
          const right = answers && j === row.at
          return <g key={w}>
            <rect x={x - 17} y={y - 3} width={34} height={25} rx={3} fill={right ? '#dcfce7' : '#fff'} stroke={right ? '#16a34a' : '#94a3b8'} strokeWidth=".6" />
            <T x={x} y={y + 10} size={11}>{e}</T>
            <T x={x} y={y + 18} size={4.4} weight={800}>{w}</T>
          </g>
        })}
      </g>
    })}
    <T x={100} y={260} size={3.9} fill="#64748b">{pack.h1} · חנוכה · עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

function TopicSheet(props) {
  const id = props.topic[0]
  if (id.startsWith('hk-paste-')) return <HkPasteSheet {...props} />
  if (id.startsWith('hk-color-')) return <HkColorSheet {...props} />
  return <TaskSheet {...props} />
}

function TaskSheet({ pack, topic, level, seed, answers }) {
  const hk = topic[0].startsWith('hk-')
  const rows = Array.from({ length: 6 }, (_, i) => hk ? hkQuestion(topic[0].slice(3), i, seed, level) : question(topic[0], i, seed, level))
  return <Sheet label={`${answers ? 'פתרונות' : 'דף עבודה'} — ${topic[1]}`}>
    <T x={100} y={16} size={8.5} weight={900}>{answers ? 'פתרונות: ' : ''}{topic[1]}</T>
    <T x={100} y={24} size={4.4} fill="#555">{topic[2]}</T>
    <T x={190} y={32} size={4.2} anchor="start" fill="#555">שם: ______________</T>
    {rows.map((row, i) => {
      const y = 42 + i * 35
      return <g key={i}>
        <rect x={10} y={y - 9} width={180} height={29} rx={3} fill={i % 2 ? '#fff' : '#f8fafc'} stroke="#cbd5e1" strokeWidth=".5" />
        <T x={184} y={y} size={5.5} anchor="end" weight={700}>{`${i + 1}. ${row.q}`}</T>
        {answers
          ? <T x={184} y={y + 12} size={5.4} anchor="end" weight={800} fill="#c1121f">{`פתרון: ${row.a}`}</T>
          : <line x1={35} x2={165} y1={y + 12} y2={y + 12} stroke="#64748b" strokeWidth=".6" />}
      </g>
    })}
    <T x={100} y={260} size={3.9} fill="#64748b">{pack.h1} · עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

export default function ReadingWorksheetPacks({ packId }) {
  const pack = PACKS[packId]
  const [level, setLevel] = useState('easy')
  const [chosen, setChosen] = useState(() => TOPICS.map(x => x[0]))
  const [answers, setAnswers] = useState(true)
  const [seed, setSeed] = useState(1)
  const [theme, setTheme] = useState('regular')
  if (!pack) return <Navigate to="/printables" replace />

  const topics = theme === 'hanukkah' ? HK_TOPICS : TOPICS
  const changeTheme = v => { setTheme(v); setChosen((v === 'hanukkah' ? HK_TOPICS : TOPICS).map(x => x[0])) }
  const selected = topics.filter(x => chosen.includes(x[0]))
  const pages = (selected.length ? selected : topics).flatMap((topic, i) => {
    const sheet = { key: `q-${topic[0]}`, svg: <TopicSheet pack={pack} topic={topic} level={level} seed={seed + i} /> }
    return answers ? [sheet, { key: `a-${topic[0]}`, svg: <TopicSheet pack={pack} topic={topic} level={level} seed={seed + i} answers /> }] : [sheet]
  })
  const toggle = id => setChosen(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  const siblings = SIBLINGS.map(([id, label]) => ({ href: PACKS[id].path, label }))

  return <PrintableShell path={pack.path} emoji={pack.emoji} h1={pack.h1} seoTitle={pack.seoTitle}
    description={pack.description} sub={pack.sub} crumbs={[{ label: 'דפי עברית', href: '/letters' }]} siblings={siblings}
    controls={<>
      {packId === 'sounds' && <Choice label="נושא" value={theme} onChange={changeTheme} options={[['regular', '👂 דפים רגילים'], ['hanukkah', '🕎 סט חנוכה']]} />}
      <Choice label="רמה" value={level} onChange={setLevel} options={[['easy', '🌱 התחלה'], ['middle', '✏️ תרגול'], ['challenge', '🚀 אתגר']]} />
      <div className="text-center"><p className="mb-2 font-bold">בחרו דפים לחבילה ({selected.length || topics.length} מתוך {topics.length})</p>
        <div className="flex flex-wrap justify-center gap-2">{topics.map(([id, title]) => <button key={id} type="button" onClick={() => toggle(id)} aria-pressed={chosen.includes(id)}
          className={`min-h-[42px] rounded-xl border-2 px-3 py-1.5 font-bold ${chosen.includes(id) ? 'border-slate-800 bg-white' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>{title}</button>)}</div>
      </div>
      <label className="flex items-center justify-center gap-2 font-bold"><input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} className="h-5 w-5" />צרפו דף פתרונות לכל דף עבודה</label>
      <div className="text-center"><button type="button" onClick={() => setSeed(x => x + 1)} className="min-h-[44px] wobbly-sm border-2 border-[var(--border)] bg-white px-5 py-2 font-bold">🔄 החליפו תרגילים</button></div>
    </>}
    pages={pages} previewAll printTitle={pack.h1} onRefresh={() => setSeed(x => x + 1)}
    paragraphs={[pack.lead, 'כל חבילה כוללת 12 דפי עבודה מקוריים, עם שישה תרגילים בכל דף. אפשר לבחור רק דפים מסוימים, להחליף את התרגילים ולהדפיס שוב — ללא הרשמה וללא תשלום.', 'דפי הפתרונות נפרדים מדפי הילדים, כך שאפשר לחלק בכיתה, לבדוק במהירות או לתת לילד לנסות לבד לפני שבודקים יחד.', ...(packId === 'sounds' ? ['לקראת החג יש גם סט חנוכה: בוחרים "סט חנוכה" ומקבלים דפים עם מילים כמו סביבון, סופגנייה, נר, חנוכייה, שמן, כד, מכבי, לביבה ומתנה — זיהוי צליל פותח וסוגר, גזירה והדבקה וצביעה, לגן חובה ולכיתה א׳.'] : [])]}
    faq={[
      ...(packId === 'sounds' ? [{ q: 'יש דפי צליל פותח וסוגר בנושא חנוכה?', a: 'כן. בוחרים "סט חנוכה" מעל רשימת הדפים. הסט כולל זיהוי צליל פותח וסוגר במילים כמו סביבון וסופגנייה, גזירה והדבקה לפי צליל, וצביעה של התמונה המתאימה — לגן חובה ולכיתה א׳.' }] : []),
      { q: 'כמה דפי עבודה יש בחבילה?', a: 'יש 12 דפי עבודה שונים. אפשר לבחור את כולם או לסמן רק את המיומנויות שרוצים לתרגל.' },
      { q: 'האם יש פתרונות?', a: 'כן. כברירת מחדל מצורף דף פתרונות נפרד לכל דף עבודה; אפשר לבטל את הסימון לפני ההדפסה.' },
      { q: 'לאיזו רמה מתאימים הדפים?', a: 'יש שלוש רמות: התחלה, תרגול ואתגר. בוחרים את הרמה לפני ההדפסה ומחליפים תרגילים בכל לחיצה.' },
    ]}
    related={[
      { label: 'לימוד אותיות בעברית', href: '/letters' },
      { label: 'צליל פותח וסוגר — משחק', href: '/letters/sounds' },
      { label: 'קמץ ופתח', href: '/letters/nikud' },
      { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' },
      { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' },
      { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' },
    ]}
  />
}

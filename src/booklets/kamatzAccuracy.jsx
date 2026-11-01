import { A4, AnswerKey, Certificate, ChoicePage, Cover, FillPage, Head, MatchPage, SvgPage } from './kit'
import { bookletBySlug } from './registry'

// "דיוק בקריאה — שלב הקמץ ועיצור": first-grade reading accuracy with one vowel only. Every word in the booklet
// is read with kamatz alone (no patach, no other vowel), from open syllables (בָּ) to a syllable closed by a
// consonant (בָּד) and two-syllable words (גָּ־מָל). Small circles under each item mark "read correctly".
const PAGES = bookletBySlug('kamatz-accuracy').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

export const SYLLABLES = ['מָ', 'לָ', 'דָּ', 'הָ', 'רָ', 'בָּ', 'נָ', 'שָׁ', 'תָּ', 'אָ', 'גָּ', 'סָ', 'קָ', 'חָ', 'זָ', 'יָ', 'פָּ', 'כָּ', 'טָ', 'צָ', 'עָ', 'וָ']
export const BUILD = [['בָּ', 'בָּד'], ['דָּ', 'דָּג'], ['יָ', 'יָם'], ['קָ', 'קָם'], ['שָׁ', 'שָׁר'], ['רָ', 'רָץ'], ['נָ', 'נָח'], ['חָ', 'חָם'], ['זָ', 'זָז'], ['גָּ', 'גָּד']]
export const SHORT = ['דָּג', 'יָם', 'קָם', 'שָׁם', 'חָם', 'קָר', 'רָץ', 'שָׁר', 'נָח', 'זָז', 'טָס', 'עָף', 'צָף', 'שָׁט', 'חָג', 'יָד', 'חָד', 'גָּר', 'סָר', 'דָּן', 'גָּד', 'רָם', 'תָּם', 'לָשׁ']
export const FIND = [
  ['דָּג', ['דָּן', 'דָּג', 'רָג', 'דָּג', 'גָּד']], ['יָם', ['יָם', 'יָד', 'יָם', 'קָם', 'יָם']],
  ['קָם', ['קָר', 'קָם', 'חָם', 'קָם', 'שָׁם']], ['רָץ', ['רָם', 'רָץ', 'צָר', 'רָץ', 'דָּץ']],
  ['שָׁר', ['שָׁר', 'שָׁם', 'שָׁר', 'סָר', 'שָׁר']], ['חָם', ['חָם', 'הָם', 'תָּם', 'חָם', 'חָג']],
  ['נָח', ['נָח', 'גָּח', 'נָח', 'נָח', 'כָּח']], ['זָז', ['זָז', 'זָן', 'זָז', 'נָז', 'זָז']],
]
// Two-syllable words, kamatz in both syllables: [open syllable, closed syllable].
export const TWO = [['גָּ', 'מָל'], ['חָ', 'לָב'], ['זָ', 'הָב'], ['נָ', 'חָשׁ'], ['עָ', 'נָן'], ['בָּ', 'צָל'], ['קָ', 'טָן'], ['לָ', 'בָן'], ['חָ', 'כָם'], ['חָ', 'זָק'],
  ['יָ', 'שָׁן'], ['דָּ', 'בָר'], ['אָ', 'דָם'], ['כָּ', 'נָף'], ['עָ', 'שָׁן'], ['נָ', 'מָל'], ['חָ', 'תָן'], ['שָׁ', 'פָן'], ['פָּ', 'נָס'], ['מָ', 'רָק']]
const JOIN = TWO.slice(0, 8)
export const MATCH = [['דָּג', '🐟'], ['יָם', '🌊'], ['גָּמָל', '🐫'], ['חָלָב', '🥛'], ['נָחָשׁ', '🐍'], ['עָנָן', '☁️']]
export const CHOICE = [
  { art: '🐟', options: ['דָּן', 'דָּג', 'גָּד'], answer: 'דָּג' }, { art: '🌊', options: ['יָד', 'קָם', 'יָם'], answer: 'יָם' },
  { art: '🐫', options: ['נָמָל', 'גָּמָל', 'נָחָשׁ'], answer: 'גָּמָל' }, { art: '🥛', options: ['חָלָב', 'לָבָן', 'חָכָם'], answer: 'חָלָב' },
  { art: '🐍', options: ['נָמָל', 'חָלָשׁ', 'נָחָשׁ'], answer: 'נָחָשׁ' }, { art: '☁️', options: ['עָשָׁן', 'עָנָן', 'עָף'], answer: 'עָנָן' },
  { art: '🥵', options: ['חָג', 'חָם', 'תָּם'], answer: 'חָם' }, { art: '🥶', options: ['קָם', 'חָם', 'קָר'], answer: 'קָר' },
]
export const SENTENCES = ['דָּן קָם.', 'גָּד רָץ.', 'דָּג שָׁט.', 'רָם שָׁר.', 'גָּמָל נָח.', 'נָחָשׁ זָז.', 'יָם קָר.', 'חָלָב חָם.', 'עָנָן לָבָן.', 'דָּג קָטָן שָׁט.', 'דָּן חָכָם, גָּד חָזָק.', 'דָּן קָם, רָץ, שָׁר!']

const Mark = ({ x, y }) => <circle cx={x} cy={y} r="7" fill="none" stroke="#9aa5b5" strokeWidth="2" />

// Items in a grid, read right to left, with a circle under each to tick when it was read correctly.
function ReadGrid({ n, title, instruction, items, cols, size = 40, sub }) {
  const rows = Math.ceil(items.length / cols), cw = 540 / cols, rh = Math.min(150, 640 / rows), top = 150
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    <g fontFamily={FONT} textAnchor="middle" fill={INK}>
      {items.map((it, i) => {
        const x = 570 - (i % cols + 0.5) * cw, y = top + Math.floor(i / cols) * rh + rh * 0.5
        return <g key={i}>
          <text x={x} y={y} fontSize={size} fontWeight="700" direction="rtl">{typeof it === 'string' ? it : it[0] + it[1]}</text>
          {sub && typeof it !== 'string' && <text x={x} y={y + 26} fontSize="17" fill="#6b7280" direction="rtl">{`${it[0]} · ${it[1]}`}</text>}
          <Mark x={x} y={y + (sub ? 46 : 26)} />
        </g>
      })}
      {Array.from({ length: rows - 1 }, (_, r) => <path key={r} d={`M30 ${top + (r + 1) * rh - 4} H570`} stroke="#eee" />)}
    </g>
  </SvgPage>
}

// An open syllable, an arrow and the same syllable closed by a consonant.
function BuildPage({ n, title, instruction, pairs }) {
  const rh = 640 / Math.ceil(pairs.length / 2), top = 150
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    <g fontFamily={FONT} textAnchor="middle" fill={INK}>
      {pairs.map(([open, closed], i) => {
        const cx = i % 2 ? 150 : 450, y = top + Math.floor(i / 2) * rh + rh / 2
        return <g key={closed}>
          <rect x={cx - 130} y={y - 48} width="260" height="96" rx="14" fill="none" stroke="#9aa5b5" strokeWidth="2" />
          <text x={cx + 75} y={y + 14} fontSize="44" fontWeight="700">{open}</text>
          <path d={`M${cx + 25} ${y} H${cx - 22} M${cx - 10} ${y - 10} L${cx - 22} ${y} L${cx - 10} ${y + 10}`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x={cx - 72} y={y + 14} fontSize="44" fontWeight="800" direction="rtl">{closed}</text>
        </g>
      })}
    </g>
  </SvgPage>
}

// A target word and a row of look-alikes: circle every copy of the target.
function FindPage({ n, title, instruction, rows }) {
  const rh = 640 / rows.length, top = 150
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    <g fontFamily={FONT} textAnchor="middle" fill={INK}>
      {rows.map(([target, options], i) => {
        const y = top + i * rh + rh / 2
        return <g key={target}>
          <rect x="482" y={y - 32} width="96" height="60" rx="12" fill="#f3f4f6" stroke={INK} strokeWidth="2" />
          <text x="530" y={y + 12} fontSize="34" fontWeight="800">{target}</text>
          {options.map((o, j) => <text key={j} x={420 - j * 88} y={y + 12} fontSize="34" fontWeight="600">{o}</text>)}
          {i < rows.length - 1 && <path d={`M30 ${y + rh / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
        </g>
      })}
    </g>
  </SvgPage>
}

function TrackerPage({ n }) {
  const cell = { border: '1.5px solid #111', padding: '7px 6px', textAlign: 'center' }
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📈 מעקב דיוק בקריאה</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת</p>
    <p style={{ fontSize: '12pt', lineHeight: 1.6, margin: '0 0 10px' }}>
      <b>איך עובדים:</b> הילד קורא עמוד בקול, לאט, עם אצבע מתחת לכל אות. המבוגר מסמן בעיגול הקטן ✓ על כל מילה שנקראה נכון,
      ועל מילה שנקראה לא נכון מבקשים לקרוא שוב — אות, תנועה ואות. כאן רושמים כמה נקראו נכון. חוזרים על אותו עמוד בעוד יום־יומיים
      ומשווים: המטרה היא דיוק, לא מהירות.
    </p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12pt' }}>
      <thead><tr>{['תאריך', 'עמוד', 'נקראו נכון', 'מתוך', 'מילים שהיה קשה לקרוא', '⭐'].map(h => <th key={h} style={{ ...cell, background: '#f3f4f6' }}>{h}</th>)}</tr></thead>
      <tbody>{Array.from({ length: 18 }, (_, i) => <tr key={i}>{[0, 1, 2, 3, 4, 5].map(c => <td key={c} style={{ ...cell, height: 38 }} />)}</tr>)}</tbody>
    </table>
  </A4>
}

export default function KamatzAccuracyBooklet({ seed }) {
  return <>
    <Cover emoji="📖🎯" title="דיוק בקריאה — שלב הקמץ ועיצור" subtitle="הברות, מילים ומשפטים שכולם נקראים רק בקמץ" pages={PAGES}
      note="כל מה שבחוברת נקרא בתנועה אחת — קָמָץ (אָ). מתחילים בהברה פתוחה (בָּ), עוברים להברה שנסגרת בעיצור (בָּד), למילים של שתי הברות (גָּמָל) ולמשפטים קצרים. קוראים לאט, אות אחרי אות, ומסמנים בעיגול הקטן כל מילה שנקראה נכון. אפשר לחזור על אותו עמוד כמה פעמים." />
    <ReadGrid n={2} title="קוראים הברות בקמץ" instruction="קוראים כל הברה בקול ומסמנים ✓ בעיגול" items={SYLLABLES} cols={6} size={48} />
    <BuildPage n={3} title="הברה ועוד אות" instruction="קוראים את ההברה, ואז מוסיפים את האות שאחריה" pairs={BUILD} />
    <ReadGrid n={4} title="קוראים מילים קצרות" instruction="אות, קמץ ועוד אות — קוראים ומסמנים ✓" items={SHORT} cols={4} size={42} />
    <FindPage n={5} title="מוצאים את אותה מילה" instruction="קוראים את המילה במסגרת ומקיפים כל מילה זהה בשורה" rows={FIND} />
    <FillPage n={6} title="מחברים הברות למילה" instruction="קוראים את שתי ההברות וכותבים את המילה" lines={JOIN.map(([a, b]) => `${a} + ${b}  =  __________`)} size={34} />
    <ReadGrid n={7} title="קוראים מילים של שתי הברות" instruction="קוראים הברה ועוד הברה, ואז את כל המילה" items={TWO} cols={4} size={38} sub />
    <MatchPage n={8} title="מתאימים מילה לתמונה" instruction="קוראים את המילה ומושכים קו לתמונה" pairs={MATCH.map(([w, e]) => [{ text: w }, { art: e }])} seed={seed} />
    <ChoicePage n={9} title="איזו מילה מתאימה לתמונה?" instruction="קוראים בדיוק את שלוש המילים ומקיפים את הנכונה" items={CHOICE.map(c => ({ pic: { art: c.art }, options: c.options }))} />
    <FillPage n={10} title="קוראים משפטים" instruction="קוראים כל משפט בקול, לאט ובדיוק" lines={SENTENCES} size={34} />
    <TrackerPage n={11} />
    <AnswerKey n={12} sections={[
      { title: 'עמוד 5 — כמה פעמים מופיעה המילה', answers: FIND.map(([t, o]) => `${t}: ${o.filter(x => x === t).length}`) },
      { title: 'עמוד 6 — מחברים הברות', answers: JOIN.map(([a, b]) => a + b) },
      { title: 'עמוד 8 — התאמה', answers: MATCH.map(([w, e]) => `${w} ← ${e}`) },
      { title: 'עמוד 9 — איזו מילה מתאימה', answers: CHOICE.map(c => `${c.art} ${c.answer}`) },
    ]} />
    <Certificate booklet="חוברת הדיוק בקריאה" done="קראתי הברות, מילים ומשפטים בקמץ — לאט ובדיוק." cheer="כל הכבוד, קורא/ת מדויק/ת!" />
  </>
}

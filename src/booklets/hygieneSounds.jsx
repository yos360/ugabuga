import { AnswerKey, Certificate, ChoicePage, Cover, Head, MatchPage, Pic, SvgPage, WordSearchPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת צליל פותח — היגיינה אישית" — find the first sound of words about washing, teeth, showering and
// staying clean. Few big pictures on a page, three letters to choose from, no reading needed beyond the letters.
const PAGES = bookletBySlug('hygiene-first-sound').pages
const FONT = 'Heebo, Arial, sans-serif'
const item = (emoji, word, letters, answer) => ({ pic: { emoji }, word, options: letters.split(''), answer })

const HANDS = [item('🧼', 'סבון', 'דסר', 'ס'), item('💧', 'מים', 'למפ', 'מ'), item('🚰', 'ברז', 'גזב', 'ב'), item('🖐️', 'יד', 'קשי', 'י'), item('🫧', 'בועות', 'לטב', 'ב'), item('🦠', 'חיידק', 'חצד', 'ח')]
const TEETH = [item('🪥', 'מברשת', 'מרד', 'מ'), item('🦷', 'שן', 'לשנ', 'ש'), item('👄', 'פה', 'בפק', 'פ'), item('👅', 'לשון', 'לדמ', 'ל'), item('😁', 'חיוך', 'גחר', 'ח'), item('🪞', 'מראה', 'סמה', 'מ')]
const SHOWER = [item('🛁', 'אמבטיה', 'לרא', 'א'), item('🚿', 'מקלחת', 'מחב', 'מ'), item('🧽', 'ספוג', 'קסג', 'ס'), item('🧴', 'שמפו', 'דשמ', 'ש'), item('🧻', 'נייר טואלט', 'נתג', 'נ'), item('🧦', 'גרביים', 'גבר', 'ג')]
const CLEAN = [item('✂️', 'מספרים', 'פמל', 'מ'), item('💇', 'תספורת', 'תדר', 'ת'), item('👕', 'חולצה', 'חגל', 'ח'), item('👟', 'נעליים', 'סנד', 'נ'), item('🗑️', 'פח', 'גפר', 'פ'), item('🧹', 'מטאטא', 'בזמ', 'מ')]
const SETS = { HANDS, TEETH, SHOWER, CLEAN }

const MATCH_1 = [['ס', '🧼'], ['ש', '🦷'], ['ב', '🚰'], ['ג', '🧦'], ['נ', '👟'], ['ח', '🦠']]
const MATCH_2 = [['א', '🛁'], ['פ', '👄'], ['ל', '👅'], ['י', '🖐️'], ['ת', '💇'], ['מ', '🚿']]
const GAPS = [['🧼', 'סבון', 'ס', 'ר'], ['💧', 'מים', 'פ', 'מ'], ['🚰', 'ברז', 'ב', 'ד'], ['🦷', 'שן', 'ל', 'ש'], ['👄', 'פה', 'פ', 'ג'], ['👃', 'אף', 'ר', 'א']]
// Pictures to circle: [emoji, starts with the page's letter]
const SORT_S = { letter: 'ס', pics: [['🧼', true], ['🦷', false], ['🧽', true], ['🚰', false], ['🧺', true], ['👄', false], ['🐴', true], ['🪥', false]] }
const SORT_M = { letter: 'מ', pics: [['💧', true], ['🧼', false], ['🪥', true], ['👕', false], ['🚿', true], ['👟', false], ['✂️', true], ['🪞', true]] }
const SEARCH = [['סבון', '🧼'], ['מים', '💧'], ['ברז', '🚰'], ['שן', '🦷'], ['פה', '👄'], ['אף', '👃'], ['ספוג', '🧽'], ['שמפו', '🧴']]

function GapPage({ n }) {
  const rowH = 660 / GAPS.length
  return <SvgPage label="משלימים אות ראשונה">
    <Head n={n} title="משלימים את האות הראשונה" instruction="מקיפים את האות שחסרה בתחילת המילה" />
    {GAPS.map(([e, word, a, b], i) => { const y = 140 + i * rowH + rowH / 2; return <g key={word} fontFamily={FONT} textAnchor="middle">
      <Pic item={{ emoji: e }} x={530} y={y} size={rowH * 0.74} />
      <text x={385} y={y + 14} fontSize="40" fontWeight="700" direction="rtl">{`_${word.slice(1)}`}</text>
      {[a, b].map((o, j) => <g key={j}><circle cx={215 - j * 90} cy={y} r="30" fill="white" stroke="#9aa5b5" strokeWidth="2" /><text x={215 - j * 90} y={y + 13} fontSize="36" fontWeight="800">{o}</text></g>)}
      {i < GAPS.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

// A big letter and eight pictures; circle only the ones whose name starts with it.
function SortPage({ n, set }) {
  return <SvgPage label={`מי מתחיל ב־${set.letter}`}>
    <Head n={n} title={`מי מתחיל ב־${set.letter}?`} instruction={`אומרים את שם התמונה בקול ומקיפים רק את מי שמתחיל בצליל ${set.letter}`} />
    <g fontFamily={FONT} textAnchor="middle">
      <circle cx="300" cy="190" r="48" fill="none" stroke="#111" strokeWidth="3" /><text x="300" y="210" fontSize="60" fontWeight="800">{set.letter}</text>
      {set.pics.map(([e], i) => { const x = 450 - (i % 2) * 300, y = 300 + Math.floor(i / 2) * 118; return <Pic key={i} item={{ emoji: e }} x={x} y={y} size={92} /> })}
    </g>
  </SvgPage>
}

const keyLines = items => items.map(it => `${it.pic.emoji} ${it.word} — ${it.answer}`)

export default function HygieneSoundsBooklet({ seed }) {
  const choice = (n, title, items) => <ChoicePage n={n} title={title} instruction="אומרים את שם התמונה ומקיפים את האות שבה הוא מתחיל" items={items.map(({ pic, options }) => ({ pic, options }))} />
  return <>
    <Cover emoji="🧼🦷" title="חוברת צליל פותח — היגיינה אישית" subtitle="13 עמודים: בכל עמוד תמונות של רחצה, שיניים וניקיון, ואות ראשונה לזהות" pages={PAGES}
      note="אפשר להכין את העמודים בהדרגה: קודם אומרים את שם התמונה בקול ומאריכים את הצליל הראשון (סססבון), ורק אחר כך מחפשים את האות. בעמודים 6–7 מושכים קו, ובעמודים 9–10 מקיפים." />
    {choice(2, 'ידיים ומים', HANDS)}
    {choice(3, 'שיניים ופה', TEETH)}
    {choice(4, 'מקלחת ורחצה', SHOWER)}
    {choice(5, 'שיער, בגדים וסביבה נקייה', CLEAN)}
    <MatchPage n={6} title="מתאימים אות לתמונה (1)" instruction="מושכים קו מהאות לתמונה שמתחילה בה" pairs={MATCH_1.map(([l, e]) => [{ text: l }, { emoji: e }])} seed={seed} />
    <MatchPage n={7} title="מתאימים אות לתמונה (2)" instruction="מושכים קו מהאות לתמונה שמתחילה בה" pairs={MATCH_2.map(([l, e]) => [{ text: l }, { emoji: e }])} seed={seed + 1} />
    <GapPage n={8} />
    <SortPage n={9} set={SORT_S} />
    <SortPage n={10} set={SORT_M} />
    <WordSearchPage n={11} title="תפזורת היגיינה" instruction="מוצאים את המילים: מימין לשמאל או מלמעלה למטה" words={SEARCH.map(([word, e]) => ({ word, pic: { emoji: e } }))} seed={seed} size={9} he />
    <AnswerKey n={12} sections={[
      { title: 'עמוד 2 — ידיים ומים', answers: keyLines(HANDS) }, { title: 'עמוד 3 — שיניים ופה', answers: keyLines(TEETH) },
      { title: 'עמוד 4 — מקלחת ורחצה', answers: keyLines(SHOWER) }, { title: 'עמוד 5 — שיער, בגדים וסביבה', answers: keyLines(CLEAN) },
      { title: 'עמוד 6 — התאמה (1)', answers: MATCH_1.map(([l, e]) => `${l} ← ${e}`) }, { title: 'עמוד 7 — התאמה (2)', answers: MATCH_2.map(([l, e]) => `${l} ← ${e}`) },
      { title: 'עמוד 8 — משלימים', answers: GAPS.map(([e, w]) => `${e} ${w} — ${w[0]}`) },
      { title: 'עמוד 9 — מי מתחיל ב־ס', answers: SORT_S.pics.filter(p => p[1]).map(p => p[0]) },
      { title: 'עמוד 10 — מי מתחיל ב־מ', answers: SORT_M.pics.filter(p => p[1]).map(p => p[0]) },
    ]} />
    <Certificate booklet="חוברת הצליל הפותח" done="זיהיתי את הצליל הראשון של מילים על ניקיון והיגיינה." cheer="כל הכבוד, אלוף/ה הצלילים!" />
  </>
}

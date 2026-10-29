import { coloringSrc } from '../data/coloringSubjects'
import { AnswerKey, Certificate, ChoicePage, Cover, Head, ImagePage, Pic, SvgPage, W, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "מי גר בחצר?" — a field guide to twelve small yard animals for kindergarten to second grade: a riddle card
// for each, "who am I?", legs, what is special about each, a word search, a "found it!" checklist for a yard
// walk, a drawing page, two coloring pages, answers and a certificate. Pictures come from the word bank's
// print art where it has the animal, otherwise a plain emoji.
const PAGES = bookletBySlug('yard-animals').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// legs: the number the legs page and the answer key use. fact: one short, checked sentence.
export const ANIMALS = [
  { name: 'נמלה', pic: { art: '🐜' }, legs: 6, riddle: ['יש לי שש רגליים ושני מחושים.', 'אני גרה בקן באדמה', 'וסוחבת פירורים גדולים ממני.'], fact: 'נמלים חיות בקבוצות גדולות, וכל נמלה עושה תפקיד.' },
  { name: 'חילזון', pic: { art: '🐌' }, legs: 0, riddle: ['אין לי רגליים, ובכל זאת אני זוחל.', 'הבית שלי על הגב,', 'ושובל ריר נשאר אחריי.'], fact: 'אחרי גשם הרבה חילזונות יוצאים החוצה.' },
  { name: 'פרת משה רבנו', pic: { emoji: '🐞' }, legs: 6, riddle: ['אני אדומה עם נקודות שחורות.', 'יש לי שש רגליים קטנות,', 'ואני אוכלת כנימות מהעלים.'], fact: 'גננים אוהבים אותה, כי היא אוכלת כנימות שמזיקות לצמחים.' },
  { name: 'דבורה', pic: { art: '🐝' }, legs: 6, riddle: ['אני עפה מפרח לפרח', 'ואוספת צוף מתוק.', 'בכוורת עושים ממנו דבש.'], fact: 'לדבורה יש שש רגליים וארבע כנפיים.' },
  { name: 'פרפר', pic: { art: '🦋' }, legs: 6, riddle: ['פעם הייתי זחל קטן,', 'ואחר כך הפכתי לפרפר', 'עם ארבע כנפיים צבעוניות.'], fact: 'הזחל נהיה גולם, ובתוך הגולם הוא משתנה לפרפר.' },
  { name: 'תולעת אדמה', pic: { emoji: '🪱' }, legs: 0, riddle: ['אין לי רגליים ואין לי כנפיים.', 'אני חופרת באדמה מנהרות', 'וככה היא נשארת רכה.'], fact: 'תולעי אדמה עוזרות לאדמה להיות טובה לצמחים.' },
  { name: 'חיפושית', pic: { art: '🪲' }, legs: 6, riddle: ['יש לי שש רגליים וגוף קשה.', 'שתי כנפיים קשות מכסות עליי,', 'ומתחתיהן כנפיים דקות לעוף.'], fact: 'יש יותר סוגים של חיפושיות מכל קבוצת חרקים אחרת.' },
  { name: 'עכביש', pic: { emoji: '🕷️' }, legs: 8, riddle: ['יש לי שמונה רגליים.', 'אני לא חרק,', 'ואני טווה קורים מחוטי משי.'], fact: 'לחרק יש שש רגליים ולעכביש שמונה — לכן עכביש הוא לא חרק.' },
  { name: 'שממית', pic: { art: '🦎' }, legs: 4, riddle: ['אני זוחלת קטנה עם ארבע רגליים.', 'אני מטפסת על הקיר', 'ואוכלת יתושים בערב.'], fact: 'כשהיא בסכנה, הזנב שלה יכול להיפרד ולצמוח מחדש.' },
  { name: 'דרור', pic: { art: '🐦' }, legs: 2, riddle: ['אני ציפור קטנה עם מקור וכנפיים.', 'אני אוהב פירורים וגרגרים', 'וגר קרוב לבתים.'], fact: 'לציפור יש שתי רגליים, נוצות ומקור, והיא מטילה ביצים.' },
  { name: 'חרגול', pic: { emoji: '🦗' }, legs: 6, riddle: ['הרגליים האחוריות שלי ארוכות וחזקות.', 'אני קופץ גבוה בין העשבים,', 'ואני ירוק או חום כמוהם.'], fact: 'קפיצה אחת של חרגול יכולה להיות הרבה פעמים מאורך גופו.' },
  { name: 'זבוב', pic: { art: '🪰' }, legs: 6, riddle: ['יש לי שש רגליים ושתי כנפיים.', 'יש לי עיניים גדולות,', 'ואני יכול לנחות גם על התקרה.'], fact: 'לרוב החרקים ארבע כנפיים, אבל לזבוב יש רק שתיים.' },
]
const byName = names => names.map(n => ANIMALS.find(a => a.name === n))

// Page 6: new clues, three names to choose from (the right one is placed by the seed).
export const WHO = [
  { clue: 'אין לי רגליים, ויש לי בית על הגב.', answer: 'חילזון', others: ['נמלה', 'דבורה'] },
  { clue: 'יש לי שמונה רגליים ואני טווה קורים.', answer: 'עכביש', others: ['זבוב', 'חיפושית'] },
  { clue: 'אני קופץ רחוק על רגליים אחוריות ארוכות.', answer: 'חרגול', others: ['תולעת אדמה', 'פרפר'] },
  { clue: 'אני גרה באדמה, בלי רגליים, ויוצאת אחרי הגשם.', answer: 'תולעת אדמה', others: ['שממית', 'דבורה'] },
  { clue: 'אני אדומה עם נקודות ואוכלת כנימות.', answer: 'פרת משה רבנו', others: ['חיפושית', 'נמלה'] },
  { clue: 'אני אוספת צוף מפרחים ועושה דבש.', answer: 'דבורה', others: ['זבוב', 'פרפר'] },
]
const whoItems = seed => WHO.map((w, i) => ({ ...w, opts: rngFor(seed, 60 + i).shuffle([w.answer, ...w.others]) }))

// Page 8: what is special about each animal.
export const SPECIAL = [['עכביש', 'טווה קורים'], ['דבורה', 'עושה דבש'], ['חילזון', 'בית על הגב'], ['פרפר', 'היה זחל'], ['פרת משה רבנו', 'נקודות שחורות'], ['שממית', 'מטפסת על קירות']]

// Page 7: how many legs. Three options per animal, the right one placed by the seed.
export const LEG_ANIMALS = ['חילזון', 'דרור', 'שממית', 'נמלה', 'עכביש', 'תולעת אדמה', 'דבורה', 'פרפר']
const SEARCH_WORDS = ['נמלה', 'חילזון', 'דבורה', 'פרפר', 'עכביש', 'שממית', 'דרור', 'זבוב']

function CardsPage({ n, names }) {
  const items = byName(names), cardH = 200, top = 128
  return <SvgPage label={`מי גר בחצר? כרטיסים ${n - 1}`}>
    <Head n={n} title="מי גר בחצר?" instruction="קוראים את הרמז, מסתכלים בתמונה ומעתיקים את השם" />
    {items.map((a, i) => { const y = top + i * (cardH + 14); return <g key={a.name} fontFamily={FONT} direction="rtl">
      <rect x="30" y={y} width="540" height={cardH} rx="16" fill="white" stroke={INK} strokeWidth="2" />
      <Pic item={a.pic} x={495} y={y + 70} size={104} />
      {a.riddle.map((line, j) => <text key={j} x={440} y={y + 40 + j * 28} fontSize="19" fontWeight="700" textAnchor="start">{line}</text>)}
      <text x={440} y={y + 136} fontSize="17" fontWeight="800" textAnchor="start">אני:</text>
      <text x={400} y={y + 140} fontSize="38" fontWeight="800" textAnchor="start" fill="none" stroke="#6b7280" strokeWidth="1.4" strokeDasharray="3 2.5">{a.name}</text>
      <path d={`M50 ${y + 142} H170`} stroke={INK} strokeWidth="1.5" />
      <text x={W / 2} y={y + 182} fontSize="14" textAnchor="middle">ידעת? {a.fact}</text>
    </g> })}
  </SvgPage>
}

function WhoPage({ n, seed }) {
  const items = whoItems(seed), rowH = 110, top = 130
  return <SvgPage label="מי אני?">
    <Head n={n} title="מי אני?" instruction="קוראים את הרמז ומקיפים את התשובה הנכונה" />
    {items.map((it, i) => { const y = top + i * rowH; return <g key={i} fontFamily={FONT} direction="rtl">
      <text x={570} y={y + 30} fontSize="19" fontWeight="700" textAnchor="start">{i + 1}. {it.clue}</text>
      {it.opts.map((o, j) => <text key={j} x={480 - j * 185} y={y + 74} fontSize="20" textAnchor="middle">{o}</text>)}
      {i < items.length - 1 && <path d={`M30 ${y + rowH - 8} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

const legItems = seed => LEG_ANIMALS.map((name, i) => {
  const a = ANIMALS.find(x => x.name === name), pool = [0, 2, 4, 6, 8].filter(k => k !== a.legs)
  return { pic: a.pic, options: rngFor(seed, 80 + i).shuffle([a.legs, ...rngFor(seed, 90 + i).shuffle(pool).slice(0, 2)]).map(String), answer: a.legs }
})

// Picture on the right, a short phrase on the left (smaller than MatchPage's text, so it never reaches the dots).
function SpecialPage({ n, seed }) {
  const left = rngFor(seed, n).shuffle(SPECIAL.map(([, what]) => what)), step = 100, top = 150
  return <SvgPage label="מה מיוחד בי?">
    <Head n={n} title="מה מיוחד בי?" instruction="מותחים קו מכל חיה למה שמיוחד בה" />
    {SPECIAL.map(([name], i) => { const y = top + i * step + step / 2; return <g key={name}>
      <Pic item={ANIMALS.find(a => a.name === name).pic} x={470} y={y} size={80} /><circle cx={385} cy={y} r="6" fill={INK} />
    </g> })}
    {left.map((what, i) => { const y = top + i * step + step / 2; return <g key={what}>
      <circle cx={215} cy={y} r="6" fill={INK} />
      <text x={195} y={y + 8} fontSize="22" fontWeight="700" textAnchor="start" fontFamily={FONT} direction="rtl">{what}</text>
    </g> })}
  </SvgPage>
}

function ChecklistPage({ n }) {
  const rowH = 54, top = 135
  return <SvgPage label="מצאתי!">
    <Head n={n} title="מצאתי!" instruction="יוצאים לטיול בחצר או בפארק. מסמנים V על כל חיה שראינו" />
    {ANIMALS.map((a, i) => { const y = top + i * rowH; return <g key={a.name} fontFamily={FONT} direction="rtl">
      <rect x="538" y={y + 8} width="32" height="32" rx="6" fill="white" stroke={INK} strokeWidth="2" />
      <Pic item={a.pic} x={490} y={y + 24} size={42} />
      <text x={455} y={y + 32} fontSize="20" fontWeight="700" textAnchor="start">{a.name}</text>
      <text x={230} y={y + 32} fontSize="16" textAnchor="start">כמה ראיתי? ______</text>
      <path d={`M30 ${y + rowH - 1} H570`} stroke="#ddd" strokeDasharray="5 6" />
    </g> })}
  </SvgPage>
}

function DrawPage({ n }) {
  return <SvgPage label="מציירים">
    <Head n={n} title="החיה שמצאתי" instruction="מציירים חיה שראינו בחצר, ומשלימים את המשפט" />
    <rect x="40" y="135" width="520" height="520" rx="20" fill="white" stroke={INK} strokeWidth="2.5" />
    <g fontFamily={FONT} direction="rtl" fontSize="20" fontWeight="700" textAnchor="start">
      <text x={560} y={705}>ראיתי: ______________________________</text>
      <text x={560} y={750}>היא הייתה: ___________________________</text>
      <text x={560} y={795}>מצאתי אותה: __________________________</text>
    </g>
  </SvgPage>
}

export default function YardAnimalsBooklet({ seed }) {
  const who = whoItems(seed), legs = legItems(seed)
  return <>
    <Cover emoji="🐜🐌🦋" title="מי גר בחצר?" subtitle="15 עמודים: 12 חיות קטנות — רמזים, חידות, חיפוש בחצר וצביעה" pages={PAGES}
      note="מתאימה לגן חובה ולכיתות א׳–ב׳. כדאי לעבור על כרטיסי החיות בבית, ואז לצאת לחצר או לפארק עם עמוד “מצאתי!” ועיפרון. מסתכלים מרחוק ולא נוגעים, ומחזירים כל חיה למקומה." />
    <CardsPage n={2} names={['נמלה', 'חילזון', 'פרת משה רבנו']} />
    <CardsPage n={3} names={['דבורה', 'פרפר', 'תולעת אדמה']} />
    <CardsPage n={4} names={['חיפושית', 'עכביש', 'שממית']} />
    <CardsPage n={5} names={['דרור', 'חרגול', 'זבוב']} />
    <WhoPage n={6} seed={seed} />
    <ChoicePage n={7} title="כמה רגליים יש לי?" instruction="מקיפים את מספר הרגליים הנכון" items={legs} />
    <SpecialPage n={8} seed={seed} />
    <WordSearchPage n={9} seed={seed} he size={10} title="תפזורת חיות החצר" instruction="מוצאים את השמות: הם כתובים מימין לשמאל או מלמעלה למטה" words={byName(SEARCH_WORDS).map(a => ({ word: a.name, pic: a.pic }))} />
    <ChecklistPage n={10} />
    <DrawPage n={11} />
    <ImagePage n={12} title="🖍️ דף צביעה — פרפר" instruction="צובעים את הפרפר" src={coloringSrc('butterfly', 1)} alt="דף צביעה: פרפר" />
    <ImagePage n={13} title="🖍️ דף צביעה — דבורה" instruction="צובעים את הדבורה" src={coloringSrc('bee', 1)} alt="דף צביעה: דבורה" />
    <AnswerKey n={14} sections={[
      { title: 'עמודים 2–5 — מי אני?', answers: ANIMALS.map(a => a.name) },
      { title: 'עמוד 6 — מי אני?', answers: who.map(w => w.answer) },
      { title: 'עמוד 7 — כמה רגליים', answers: legs.map((l, i) => `${LEG_ANIMALS[i]}: ${l.answer}`) },
      { title: 'עמוד 8 — מה מיוחד בי?', answers: SPECIAL.map(([a, w]) => `${a} — ${w}`) },
    ]} />
    <Certificate booklet="חוברת “מי גר בחצר?”" done="הכרתי 12 חיות קטנות, פתרתי חידות וחיפשתי אותן בחצר." cheer="חוקר/ת חצר מצטיין/ת! 🐞" />
  </>
}

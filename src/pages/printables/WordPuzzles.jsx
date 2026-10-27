import { useMemo, useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { ENGLISH_TOPICS, emojiFile } from '../../data/englishWords'
import { makeRng, newSeed } from '../../motor/rng'

// /printables/word-puzzles — "פאזל מילה": a picture cut into one strip per letter. The child cuts the
// strips and lays them out in letter order (right to left); when the word is right, the picture is whole.
// Pictures and words come from the English word bank's Hebrew names and print art.
const PATH = '/printables/word-puzzles'
const TOPICS = ['animals', 'fruits', 'food', 'body', 'family', 'clothes', 'transport', 'home', 'classroom', 'birthday', 'weather']
const art = emoji => `/print-art/words/${emojiFile(emoji)}.svg`
const usable = w => w.emoji && !/\s/.test(w.he) && [...w.he].length >= 2 && [...w.he].length <= 6
export const puzzleWords = slug => (ENGLISH_TOPICS.find(t => t.slug === slug)?.words || []).filter(usable)
const FONT = 'Heebo, Arial, sans-serif'

function Puzzle({ w, x, y, width, height, showWord }) {
  const letters = [...w.he], n = letters.length, sw = width / n, imgH = height - 22, size = Math.min(imgH - 4, width - 8)
  return <g fontFamily={FONT}>
    <rect x={x} y={y} width={width} height={height} fill="#fff" stroke="#111" strokeWidth={0.8} />
    <image href={art(w.emoji)} x={x + (width - size) / 2} y={y + (imgH - size) / 2} width={size} height={size} />
    <line x1={x} x2={x + width} y1={y + imgH} y2={y + imgH} stroke="#111" strokeWidth={0.6} />
    {letters.map((l, i) => <T key={i} x={x + width - sw * (i + 0.5)} y={y + height - 6} size={15} weight={800}>{l}</T>)}
    {letters.slice(1).map((_, i) => <line key={i} x1={x + width - sw * (i + 1)} x2={x + width - sw * (i + 1)} y1={y} y2={y + height} stroke="#111" strokeWidth={0.5} strokeDasharray="3 2" />)}
    {showWord && <T x={x + width / 2} y={y - 3} size={6} fill="#555">{w.he} · {n} רצועות</T>}
  </g>
}

function PuzzleSheet({ words, page, pages }) {
  const width = 112, height = 112, x = (200 - 112) / 2
  return <Sheet label={`פאזל מילה ${page}/${pages}`}>
    <T x={100} y={10} size={7} weight={800}>✂️ פאזל מילה — גוזרים לאורך הקווים ומסדרים לפי האותיות</T>
    {words.map((w, i) => <Puzzle key={w.en} w={w} x={x} y={22 + i * (height + 14)} width={width} height={height} showWord />)}
    <T x={100} y={266} size={5} fill="#555">{page}/{pages} · מסדרים מימין לשמאל: האות הראשונה של המילה בצד ימין</T>
  </Sheet>
}

export default function WordPuzzles() {
  const [topic, setTopic] = useState('animals'), [count, setCount] = useState('6'), [seed, setSeed] = useState(1)
  const words = useMemo(() => makeRng(seed).shuffle(puzzleWords(topic)).slice(0, Number(count)), [topic, count, seed])
  const chunks = Array.from({ length: Math.ceil(words.length / 2) }, (_, i) => words.slice(i * 2, i * 2 + 2))
  const title = slug => ENGLISH_TOPICS.find(t => t.slug === slug)
  return <PrintableShell path={PATH} emoji="🧩" h1="פאזל מילה להדפסה"
    seoTitle="פאזל מילה להדפסה — גוזרים ומרכיבים תמונה לפי האותיות (גן וכיתה א׳)"
    description="פאזל מילה להדפסה בחינם: תמונה שנחתכת לרצועות, ועל כל רצועה אות. מסדרים את האותיות לפי המילה — והתמונה מתחברת. חיות, פירות, איברי הגוף, משפחה ועוד, לגן ולכיתה א׳."
    sub="תמונה, רצועה לכל אות — כשהמילה נכונה, התמונה שלמה"
    crumbs={[{ label: 'משחקים ויצירה מנייר', href: '/printables?topic=crafts' }]} previewAll onRefresh={() => setSeed(newSeed())}
    controls={<>
      <Choice label="נושא" value={topic} onChange={t => { setTopic(t); setSeed(newSeed()) }} options={TOPICS.map(s => [s, `${title(s).emoji} ${title(s).title}`])} />
      <Choice label="כמה פאזלים" value={count} onChange={setCount} options={[['2', '2 (דף אחד)'], ['4', '4 (שני דפים)'], ['6', '6 (שלושה דפים)']]} />
    </>}
    pages={chunks.map((ws, i) => ({ key: `${topic}-${seed}-${count}-${i}`, svg: <PuzzleSheet words={ws} page={i + 1} pages={chunks.length} /> }))}
    paragraphs={[
      'פאזל מילה מחבר בין שני דברים שילדים בגן ובכיתה א׳ לומדים: לזהות אותיות, ולדעת באיזה סדר הן באות במילה. התמונה נחתכת לרצועות — רצועה לכל אות — והילד צריך לסדר אותן לפי סדר האותיות במילה. כשהסדר נכון, התמונה מתחברת, וזו גם בדיקה עצמית: רואים מיד אם משהו לא במקום.',
      'מדפיסים, גוזרים לאורך הקווים המקווקווים ומערבבים. בעברית מתחילים מימין: האות הראשונה של המילה היא הרצועה הימנית. לקטנים כדאי להתחיל במילים קצרות של שתיים־שלוש אותיות, כמו פה, שן או כלב, ולהגיד את המילה בקול לפני שמתחילים.',
    ]}
    faq={[
      { q: 'לאיזה גיל מתאים פאזל מילה?', a: 'מגן חובה ועד כיתה א׳ — לילדים שמכירים חלק מהאותיות. ילדים צעירים יותר יכולים להרכיב לפי התמונה, ולשמוע מהמבוגר את שמות האותיות.' },
      { q: 'איך הופכים את הפאזל לחזק יותר?', a: 'מדפיסים על בריסטול או מדביקים על קרטון לפני הגזירה, ושומרים כל פאזל במעטפה קטנה עם התמונה בחוץ.' },
    ]}
    related={[{ label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }, { label: 'תרגול קריאה לפי מה שלמדנו', href: '/letters/reading-practice' }, { label: 'משחק זיכרון להדפסה', href: '/printables/memory-game' }]} />
}

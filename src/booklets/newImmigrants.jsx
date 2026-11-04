import { AnswerKey, Certificate, ChoicePage, Cover, Head, MatchPage, SvgPage, TracePage, WordSearchPage, WritePage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לעולים חדשים" — first Hebrew for children and adults who have just arrived: the letters,
// the first words with a picture each (family, food, animals, school), numbers, colours, days of the week
// and everyday polite words. No translation is needed: every word sits next to its picture.
// Words are pointed (with nikud) so a beginner can read them; the word search is unpointed, like street signs.
const PAGES = bookletBySlug('new-immigrants').pages
const FONT = 'Heebo, Arial, sans-serif'

const FAMILY = [['👩', 'אִמָּא'], ['👨', 'אַבָּא'], ['👴', 'סַבָּא'], ['👵', 'סַבְתָּא'], ['👦', 'יֶלֶד'], ['👧', 'יַלְדָּה']]
const FOOD = [['🍞', 'לֶחֶם'], ['🥛', 'חָלָב'], ['🍎', 'תַּפּוּחַ'], ['🍌', 'בָּנָנָה'], ['🥚', 'בֵּיצָה'], ['🧀', 'גְּבִינָה']]
const ANIMALS = [['🐶', 'כֶּלֶב'], ['🐱', 'חָתוּל'], ['🐟', 'דָּג'], ['🐦', 'צִפּוֹר'], ['🐴', 'סוּס'], ['🐄', 'פָּרָה']]
const SCHOOL = [['🎒', 'יַלְקוּט'], ['✏️', 'עִפָּרוֹן'], ['📖', 'סֵפֶר'], ['🪑', 'כִּסֵּא'], ['🚪', 'דֶּלֶת'], ['🧑‍🏫', 'מוֹרָה']]
const NUMBERS = ['אֶחָד', 'שְׁנַיִם', 'שְׁלוֹשָׁה', 'אַרְבָּעָה', 'חֲמִישָׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה']
const COLORS = [['#e53935', 'אָדֹם'], ['#1e88e5', 'כָּחֹל'], ['#43a047', 'יָרֹק'], ['#fdd835', 'צָהֹב'], ['#fb8c00', 'כָּתֹם'], ['#8e24aa', 'סָגֹל'], ['#ffffff', 'לָבָן'], ['#212121', 'שָׁחֹר']]
// First-letter page: a picture and the Hebrew word it stands for (the word itself is not printed).
const FIRST = [['🐶', 'כלב'], ['🐟', 'דג'], ['🐱', 'חתול'], ['🍌', 'בננה'], ['🐴', 'סוס'], ['🐄', 'פרה'], ['☀️', 'שמש'], ['🍞', 'לחם']]
const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('')
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
// Each question: [text, index of the answer in DAYS]; "after" uses the day that follows, "before" the day that precedes.
const DAY_QS = [['אחרי יום ראשון בא יום', 1], ['לפני יום רביעי בא יום', 2], ['אחרי יום חמישי בא יום', 5], ['אחרי יום שישי בא יום', 6], ['לפני יום ראשון בא יום', 6], ['לפני יום חמישי בא יום', 3]]
// Everyday words: [situation, the right phrase]; the wrong ones come from the same pool.
const SAY_POOL = ['תּוֹדָה', 'סְלִיחָה', 'לְהִתְרָאוֹת', 'בְּבַקָּשָׁה', 'בֹּקֶר טוֹב', 'שָׁלוֹם']
const SAY = [['מקבלים מתנה. מה אומרים?', 0], ['דרכנו בטעות על רגל של מישהו. מה אומרים?', 1], ['פוגשים חבר בבוקר. מה אומרים?', 4], ['יוצאים מהכיתה בסוף היום. מה אומרים?', 2], ['מבקשים עוגה. מה אומרים כדי להיות מנומסים?', 3], ['נכנסים לחנות. מה אומרים למוכר?', 5]]
const SEARCH = [['אמא', '👩'], ['אבא', '👨'], ['כלב', '🐶'], ['חתול', '🐱'], ['לחם', '🍞'], ['ספר', '📖'], ['דג', '🐟'], ['סוס', '🐴']]
// Unpointed on purpose: this is how children write, and thin dotted nikud is unreadable when traced.
const WRITE = [['🐶', 'כלב'], ['🏠', 'בית'], ['📖', 'ספר'], ['🍞', 'לחם'], ['🐟', 'דג']]

// Three options, the right one among two others from the pool, in a fixed shuffled order.
const options = (rng, answer, pool) => rng.shuffle([answer, ...rng.shuffle(pool.filter(x => x !== answer)).slice(0, 2)])

export function newImmigrantsData(seed) {
  const r = rngFor(seed, 5)
  const first = FIRST.map(([emoji, word]) => ({ emoji, word, opts: options(r, word[0], LETTERS) }))
  const colors = COLORS.slice(0, 6).concat(COLORS.slice(7)).map(([color, word]) => ({ color, word, opts: options(r, word, COLORS.map(c => c[1])) }))
  const days = DAY_QS.map(([text, k]) => ({ text, answer: DAYS[k], opts: options(r, DAYS[k], DAYS) }))
  // "שלום" fits both greeting and parting, so it is never a wrong option next to another phrase.
  const say = SAY.map(([text, k]) => ({ text, answer: SAY_POOL[k], opts: options(r, SAY_POOL[k], SAY_POOL[k] === 'שָׁלוֹם' ? SAY_POOL.filter(x => !['בֹּקֶר טוֹב', 'לְהִתְרָאוֹת'].includes(x)) : SAY_POOL.filter(x => x !== 'שָׁלוֹם')) }))
  return { first, colors, days, say }
}

// Situation on top, three phrases to circle below.
function SayPage({ n, title, instruction, items }) {
  const rowH = 640 / items.length
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => { const y = 140 + i * rowH; return <g key={it.text} fontFamily={FONT} textAnchor="middle" direction="rtl">
      <text x="560" y={y + 32} fontSize="21" textAnchor="start" fontWeight="700">{i + 1}. {it.text}</text>
      {it.opts.map((o, j) => <text key={o} x={470 - j * 170} y={y + 82} fontSize="25" fontWeight="700">{o}</text>)}
      {i < items.length - 1 && <path d={`M30 ${y + rowH - 8} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

const matchPairs = list => list.map(([emoji, word]) => [{ art: emoji }, { text: word }])

export default function NewImmigrantsBooklet({ seed }) {
  const d = newImmigrantsData(seed)
  return <>
    <Cover emoji="🇮🇱👋📚" title="חוברת עבודה לעולים חדשים" subtitle="16 עמודים: האותיות, המילים הראשונות בעברית ותמונה לכל מילה" pages={PAGES}
      note="מתאימה לילדים ולמבוגרים שמתחילים ללמוד עברית. כל מילה מופיעה עם ניקוד ועם תמונה, בלי צורך בתרגום. עמוד אחד ביום מספיק. כדאי לקרוא כל מילה בקול ולהראות את התמונה. כל התשובות בעמוד 15." />
    <TracePage n={2} title="האותיות א–י" instruction="עוברים בעיפרון על כל אות. כותבים מימין לשמאל" rows={LETTERS.slice(0, 10)} repeats={7} />
    <TracePage n={3} title="האותיות כ–ת" instruction="עוברים בעיפרון על כל אות. כותבים מימין לשמאל" rows={LETTERS.slice(10)} repeats={7} />
    <ChoicePage n={4} title="באיזו אות מתחילה המילה?" instruction="אומרים את המילה בעברית ומקיפים את האות הראשונה"
      items={d.first.map(({ emoji, opts }) => ({ pic: { art: emoji }, options: opts }))} />
    <MatchPage n={5} seed={seed} title="המשפחה" instruction="מותחים קו מכל תמונה למילה שלה" pairs={matchPairs(FAMILY)} />
    <MatchPage n={6} seed={seed} title="אוכל ושתייה" instruction="מותחים קו מכל תמונה למילה שלה" pairs={matchPairs(FOOD)} />
    <MatchPage n={7} seed={seed} title="חיות" instruction="מותחים קו מכל תמונה למילה שלה" pairs={matchPairs(ANIMALS)} />
    <MatchPage n={8} seed={seed} title="בבית הספר" instruction="מותחים קו מכל תמונה למילה שלה" pairs={matchPairs(SCHOOL)} />
    <MatchPage n={9} seed={seed} title="מספרים 1–10" instruction="מותחים קו מכל מספר למילה שלו" pairs={NUMBERS.map((w, i) => [{ text: String(i + 1) }, { text: w }])} />
    <ChoicePage n={10} title="צבעים" instruction="מקיפים את שם הצבע" items={d.colors.map(({ color, opts }) => ({ pic: { color }, options: opts }))} />
    <SayPage n={11} title="ימי השבוע" instruction="השבוע בישראל מתחיל ביום ראשון ונגמר בשבת. מקיפים את היום הנכון" items={d.days} />
    <SayPage n={12} title="מה אומרים?" instruction="קוראים את המצב ומקיפים את המילה המתאימה" items={d.say} />
    <WordSearchPage n={13} seed={seed} he size={10} title="תפזורת מילים ראשונות" instruction="מוצאים את המילים: הן כתובות מימין לשמאל או מלמעלה למטה"
      words={SEARCH.map(([word, emoji]) => ({ word, pic: { art: emoji } }))} />
    <WritePage n={14} title="כותבים מילים" instruction="עוברים על המילה בעיפרון וכותבים אותה שוב על הקו" items={WRITE.map(([emoji, word]) => ({ pic: { art: emoji }, word }))} />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 4 — האות הראשונה', answers: d.first.map(f => f.word[0]) },
      { title: 'עמוד 5 — משפחה', answers: FAMILY.map(([e, w]) => `${w} = ${e}`) },
      { title: 'עמוד 6 — אוכל ושתייה', answers: FOOD.map(([e, w]) => `${w} = ${e}`) },
      { title: 'עמוד 7 — חיות', answers: ANIMALS.map(([e, w]) => `${w} = ${e}`) },
      { title: 'עמוד 8 — בבית הספר', answers: SCHOOL.map(([e, w]) => `${w} = ${e}`) },
      { title: 'עמוד 9 — מספרים', answers: NUMBERS.map((w, i) => `${i + 1} = ${w}`) },
      { title: 'עמוד 10 — צבעים', answers: d.colors.map(c => c.word) },
      { title: 'עמוד 11 — ימי השבוע', answers: d.days.map(x => x.answer) },
      { title: 'עמוד 12 — מה אומרים?', answers: d.say.map(x => x.answer) },
    ]} />
    <Certificate booklet="חוברת העבודה לעולים חדשים" done="למדתי את האותיות ואת המילים הראשונות בעברית: משפחה, אוכל, חיות, מספרים, צבעים וימי השבוע." cheer="כל הכבוד, מדברים עברית!" />
  </>
}

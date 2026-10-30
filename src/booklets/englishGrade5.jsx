import { crosswordAnswers } from './englishCrossword'
import { Art, Blank, Cards, Choice, Crossword, Dictation, En, EnBlock, EnglishCertificate, EnglishCover, EnglishTheme, Items, KeyPage, Lines, Open, Passage, PicFill, Rule, RuleTable, ScoreBox, Sec, Sheet, SpellTable, T, TFItems, Tip, WordBank } from './englishKit'
import { bookletBySlug } from './registry'

// "חוברת אנגלית לכיתה ה׳" — Foundation level: picture vocabulary (hobbies, food and meals), ee/ea,
// ai/ay and oo, present progressive, present simple vs progressive, adverbs of frequency, was/were,
// WH questions, comparatives, two unseen texts, a crossword with Hebrew clues, dictation, a guided
// paragraph, a two-page final test, answers and a certificate.
const PAGES = bookletBySlug('english-grade-5').pages
const C = '#6b3fa0', SOFT = '#f3eefa', MID = '#cdb8ea'
const ans = list => list.map(x => x[x.length - 1])

// ---------- Vocabulary ----------
const HOBBIES = [
  ['⚽', 'play football', 'לשחק כדורגל'], ['🚲', 'ride a bike', 'לרכוב על אופניים'], ['📚', 'read books', 'לקרוא ספרים'], ['🎨', 'paint pictures', 'לצייר בצבעים'],
  ['🎸', 'play the guitar', 'לנגן בגיטרה'], ['🥁', 'play the drums', 'לנגן בתופים'], ['🎲', 'play board games', 'משחקי קופסה'], ['🎵', 'listen to music', 'להקשיב למוזיקה'],
  ['💻', 'play computer games', 'לשחק במחשב'], ['🪁', 'fly a kite', 'להעיף עפיפון'], ['🏖️', 'go to the beach', 'ללכת לים'], ['📺', 'watch TV', 'לצפות בטלוויזיה'],
].map(([e, en, he]) => ({ e, en, he }))
const HOBBY_RIDDLES = [
  ['You need a ball and two goals. → __________', 'play football'], ['You need wind and a long string. → __________', 'fly a kite'],
  ['You need a brush and colors. → __________', 'paint pictures'], ['You need two sticks, and you make a lot of noise! → __________', 'play the drums'],
  ['You need a sofa and a remote control. → __________', 'watch TV'], ['You need dice and friends around a table. → __________', 'play board games'],
]
const SURVEY = ['read books', 'play football', 'play the guitar', 'watch TV', 'paint pictures', 'fly a kite']

const FOOD = [
  ['🍞', 'bread', 'לחם'], ['🧀', 'cheese', 'גבינה'], ['🥚', 'egg', 'ביצה'], ['🥛', 'milk', 'חלב'], ['🥗', 'salad', 'סלט'], ['🍲', 'soup', 'מרק'],
  ['🍚', 'rice', 'אורז'], ['🥕', 'carrot', 'גזר'], ['🍅', 'tomato', 'עגבנייה'], ['🥒', 'cucumber', 'מלפפון'], ['🍔', 'hamburger', 'המבורגר'], ['🍪', 'cookie', 'עוגייה'],
].map(([e, en, he]) => ({ e, en, he }))
const ODD = [['[bread|cheese|guitar|egg]', 'guitar'], ['[breakfast|lunch|dinner|kitchen]', 'kitchen'], ['[carrot|tomato|cucumber|cookie]', 'cookie'], ['[milk|juice|water|rice]', 'rice'], ['[hamburger|pizza|salad|sofa]', 'sofa']]
const A_AN = [['___ egg', 'an'], ['___ banana', 'a'], ['___ apple', 'an'], ['___ orange', 'an'], ['___ carrot', 'a'], ['___ ice cream', 'an']]

// ---------- Phonics ----------
const EE_EA = [['🐝', 'b__', 'bee'], ['🌳', 'tr__', 'tree'], ['🐑', 'sh__p', 'sheep'], ['🧀', 'ch__se', 'cheese'], ['🟢', 'gr__n', 'green'], ['🍑', 'p__ch', 'peach'], ['🏖️', 'b__ch', 'beach'], ['🌊', 's__', 'sea'], ['🍂', 'l__f', 'leaf']]
const HOMO = [['I can [see|sea] the boats on the [see|sea].', 'see … sea'], ['Nice to [meet|meat] you!', 'meet'], ['Vegetarians don\'t eat [meet|meat].', 'meat'], ['There are seven days in a [week|weak].', 'week'], ['A [be|bee] makes honey.', 'bee']]
const AI_OO = [['🌧️', 'r__n', 'rain'], ['🚆', 'tr__n', 'train'], ['🐌', 'sn__l', 'snail'], ['🌈', 'r__nbow', 'rainbow'], ['🌙', 'm__n', 'moon'], ['🥄', 'sp__n', 'spoon'], ['📚', 'b__k', 'book'], ['🦶', 'f__t', 'foot']]
const AI_AY = [['d__', 'day'], ['w__t', 'wait'], ['pl__', 'play'], ['p__nt', 'paint'], ['M__', 'May'], ['Sund__', 'Sunday'], ['m__l', 'mail'], ['aw__', 'away']]
const OO_SORT = ['food', 'look', 'room', 'good', 'school', 'cook', 'zoo', 'wood']

// ---------- Grammar ----------
const ING = [['read', 'reading'], ['dance', 'dancing'], ['swim', 'swimming'], ['play', 'playing'], ['write', 'writing'], ['run', 'running'], ['eat', 'eating'], ['sit', 'sitting']]
const PARK = [['🚲', 'Dan / ride a bike', 'Dan is riding a bike.'], ['🪁', 'The girls / fly a kite', 'The girls are flying a kite.'], ['📚', 'Grandpa / read a book', 'Grandpa is reading a book.'], ['🎸', 'Maya / play the guitar', 'Maya is playing the guitar.'], ['🐶', 'The dog / run', 'The dog is running.'], ['🍦', 'I / eat an ice cream', 'I am eating an ice cream.']]
const PROG_NQ = [['She is sleeping. (✗) → ______________', 'She isn\'t sleeping.'], ['They are playing. (?) → ______________', 'Are they playing?'], ['I am cooking. (✗) → ______________', 'I\'m not cooking.'], ['He is swimming. (?) → ______________', 'Is he swimming?']]

const SP = [
  ['I usually [walk|am walking] to school.', 'walk'], ['Look! The baby [sleeps|is sleeping].', 'is sleeping'], ['My dad [cooks|is cooking] dinner every evening.', 'cooks'],
  ['Be quiet! Grandma [talks|is talking] on the phone.', 'is talking'], ['We [don\'t watch|aren\'t watching] TV now. We\'re doing homework.', 'aren\'t watching'],
  ['Noa [plays|is playing] basketball on Sundays.', 'plays'], ['Listen! Someone [knocks|is knocking] on the door.', 'is knocking'], ['Fish [live|are living] in water.', 'live'],
  ['What [do you do|are you doing] right now?', 'are you doing'], ['It often [rains|is raining] in winter.', 'rains'],
]
const POSTCARD = [['have', 'are having'], ['sit', 'am sitting'], ['swim', 'is swimming'], ['eat', 'eat'], ['read', 'reads'], ['play', 'is playing']]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const YAEL = [['brushes her teeth', [1, 1, 1, 1, 1, 1, 1], 'always'], ['eats cereal for breakfast', [1, 1, 1, 1, 1, 0, 0], 'usually'], ['plays the piano', [0, 1, 0, 1, 0, 1, 0], 'often'], ['goes swimming', [0, 0, 0, 0, 0, 1, 0], 'sometimes'], ['drinks coffee', [0, 0, 0, 0, 0, 0, 0], 'never']]
const FREQ = [['always', 'תמיד', 100], ['usually', 'בדרך כלל', 80], ['often', 'לעיתים קרובות', 55], ['sometimes', 'לפעמים', 30], ['never', 'אף פעם לא', 0]]
const FREQ_PLACE = [['I am late for school. (never) → ______________', 'I am never late for school.'], ['We eat pizza on Fridays. (often) → ______________', 'We often eat pizza on Fridays.'], ['My brother plays computer games. (always) → ______________', 'My brother always plays computer games.'], ['Is it hot in August? (usually) → ______________', 'Is it usually hot in August?']]

const WAS = [
  ['Yesterday I ___ at the zoo.', 'was'], ['The monkeys ____ very funny.', 'were'], ['It ___ hot last Monday.', 'was'], ['My friends ____ at my party.', 'were'],
  ['____ you at home last night?', 'Were'], ['We ______ (✗) at school yesterday. It ___ Saturday!', 'weren\'t … was'], ['The film ______ (✗) boring. It ___ great!', 'wasn\'t … was'], ['Where ____ you on Friday?', 'were'],
]
const WAS_CHANGE = [['I am tired today. → ______________ yesterday.', 'I was tired yesterday.'], ['They are at the beach today. → ______________ yesterday.', 'They were at the beach yesterday.'], ['It is sunny today. → ______________ yesterday.', 'It was sunny yesterday.']]

const WH_WORDS = [['What', 'מה'], ['Where', 'איפה'], ['When', 'מתי'], ['Who', 'מי'], ['Why', 'למה'], ['How', 'איך'], ['How many', 'כמה'], ['How old', 'בן/בת כמה'], ['What time', 'באיזו שעה']]
const WH_Q = ['Where do you live?', 'When is your birthday?', 'Who is your teacher?', 'Why are you sad?', 'How old is your sister?', 'What is your favorite food?', 'How many brothers have you got?', 'What time is it?']
const WH_A = ['Two.', 'In May.', 'It\'s half past three.', 'Mrs. Cohen.', 'Pizza!', 'In Netanya.', 'She is seven.', 'Because I lost my ball.']
const WH_KEY = ['f', 'b', 'd', 'h', 'g', 'e', 'a', 'c']
const WH_FILL = [['______ is your name? — My name is Ron.', 'What'], ['______ is the cat? — It\'s under the bed.', 'Where'], ['______ ______ do you go to school? — At eight o\'clock.', 'What time'], ['______ is that boy? — He\'s my cousin.', 'Who'], ['______ are you happy? — Because it\'s my birthday!', 'Why'], ['______ ______ pencils have you got? — Five.', 'How many']]

const COMP = [['fast', 'faster'], ['big', 'bigger'], ['happy', 'happier'], ['nice', 'nicer'], ['tall', 'taller'], ['hot', 'hotter'], ['heavy', 'heavier'], ['beautiful', 'more beautiful'], ['good', 'better'], ['bad', 'worse']]
const ANIMAL_COMP = [['🐘', '🐭', 'An elephant is ______ (big) than a mouse.', 'bigger'], ['🦒', '🐶', 'A giraffe is ______ (tall) than a dog.', 'taller'], ['🐢', '🐰', 'A turtle is ______ (slow) than a rabbit.', 'slower'], ['🦁', '🐱', 'A lion is ______ (strong) than a cat.', 'stronger'], ['🐋', '🐟', 'A whale is ______ (heavy) than a fish.', 'heavier'], ['🐌', '🐴', 'A snail is ______ (small) than a horse.', 'smaller']]

// ---------- Reading ----------
const DIARY_MC = [{ q: 'Where was the class yesterday?', options: ['at the beach', 'at the zoo', 'at the museum'], a: 'b' }, { q: 'When were the children hungry?', options: ['at ten o\'clock', 'at twelve o\'clock', 'at four o\'clock'], a: 'b' }]
const DIARY_TF = [['The lions were very interesting.', 'F — they were asleep'], ['The monkeys were quiet.', 'F — they were noisy'], ['Lunch was next to the elephants.', 'T'], ['Shira wasn\'t tired at the end of the day.', 'F — she was tired']]
const DIARY_OPEN = [['Why were the children happy on the bus?', 'Because the trip was a surprise.'], ['Which animal was Shira\'s favorite? Why?', 'The giraffe, because it was taller than all the other animals.'], ['Find two words that describe the monkeys.', 'noisy, fast (also: fun)'], ['Where was your last school trip? Was it fun?', 'תשובה אישית']]

const COUSINS_MC = [{ q: 'How old are the boys?', options: ['ten', 'eleven', 'twelve'], a: 'b' }, { q: 'How does Ori usually go to school?', options: ['by bike', 'on foot', 'by bus'], a: 'c' }]
const COUSINS_OPEN = [['Where does Daniel live?', 'On a farm in the Galilee.'], ['What does Daniel always do early in the morning?', 'He gets up early to feed the chickens.']]
const COUSINS_TF = [['Ori is faster than Daniel.', 'F — Daniel is faster'], ['Daniel loves animals.', 'T'], ['Today Daniel is visiting Ori in Tel Aviv.', 'F — Ori is visiting Daniel on the farm']]
const COUSINS_HUNT = [['Copy one sentence in the Present Progressive.', 'e.g. Ori is visiting Daniel on the farm.'], ['Copy two comparatives.', 'taller, faster, harder'], ['Copy one adverb of frequency.', 'usually / often / always']]

const CROSS = [['guitar', 'גיטרה'], ['breakfast', 'ארוחת בוקר'], ['always', 'תמיד'], ['never', 'אף פעם לא'], ['beach', 'חוף ים'], ['salad', 'סלט'], ['dinner', 'ארוחת ערב'], ['carrot', 'גזר'], ['music', 'מוזיקה'], ['sometimes', 'לפעמים'], ['kite', 'עפיפון'], ['cheese', 'גבינה']].map(([word, clue]) => ({ word, clue }))

// ---------- Test ----------
const TEST_PICS = [['🎸', ['guitar', 'drums', 'piano'], 'guitar'], ['🥕', ['cucumber', 'carrot', 'corn'], 'carrot'], ['🌙', ['spoon', 'sun', 'moon'], 'moon'], ['🚆', ['rain', 'train', 'plane'], 'train'], ['🎨', ['paint', 'read', 'swim'], 'paint']]
const TEST_ING = [['swim', 'swimming'], ['write', 'writing'], ['play', 'playing'], ['sit', 'sitting']]
const TEST_SP = [['Look! It [snows|is snowing]!', 'is snowing'], ['We [go|are going] to the pool every Friday.', 'go'], ['Shh! The baby [sleeps|is sleeping].', 'is sleeping'], ['My mom [works|is working] in a hospital.', 'works'], ['What [do you do|are you doing] now?', 'are you doing'], ['He [doesn\'t like|isn\'t liking] fish.', 'doesn\'t like']]
const TEST_FREQ = [['Tom is happy. (always) → ______________', 'Tom is always happy.'], ['I drink coffee. (never) → ______________', 'I never drink coffee.']]
const TEST_WAS = [['I ___ sick yesterday.', 'was'], ['They ____ at the party.', 'were'], ['___ the test easy?', 'Was'], ['We ______ (✗) at home.', 'weren\'t'], ['The weather ___ great last week.', 'was'], ['____ you at the beach on Saturday?', 'Were']]
const TEST_WH = [['___ is my bag? — On the chair.', 'Where'], ['___ ___ is your brother? — Twelve.', 'How old'], ['___ is your favorite color? — Blue.', 'What'], ['___ are you sad? — I lost my ball.', 'Why'], ['___ is at the door? — It\'s Dad.', 'Who']]
const TEST_COMP = [['A mouse is ____ (small) than a cat.', 'smaller'], ['The sun is ____ (big) than the moon.', 'bigger'], ['I am ____ (happy) today than yesterday.', 'happier'], ['My new bag is ____ (good) than my old one.', 'better'], ['A car is ________ (expensive) than a bike.', 'more expensive']]
const NOGA = [['What instrument does Noga play?', 'The drums.'], ['When does the band practice?', 'On Mondays and Thursdays.'], ['Why do Noga\'s parents sometimes close the windows?', 'Because the drums are very loud.']]
const NOGA_TF = [['The band practices at school.', 'F — in Noga\'s garage'], ['Noga plays the drums alone.', 'F — with three friends']]

// ---------- Pages ----------
function HobbiesPage({ n }) {
  const td = { border: `1px solid ${MID}`, padding: '0.5mm 2mm', height: '7mm' }
  return <Sheet n={n} arts={['🎸', '⚽']} title="תחביבים ופנאי" en="Hobbies and Free Time">
    <Cards items={HOBBIES} cols={6} mm={13} size="10.5pt" />
    <Sec k="A" he="איזה תחביב? קוראים את הרמז וכותבים" en="What's the hobby?">
      <Items items={HOBBY_RIDDLES.map(h => h[0])} size="12.5pt" gap="1.6mm" />
    </Sec>
    <Sec k="B" he="סקר בכיתה: שואלים שני חברים ומסמנים ✓ או ✗" en="Survey: Do you like to …?">
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt', textAlign: 'left' }}>
        <thead><tr>{['Do you like to …?', 'Me', 'Friend 1: ________', 'Friend 2: ________'].map(h => <th key={h} style={{ ...td, background: SOFT, color: C }}>{h}</th>)}</tr></thead>
        <tbody>{SURVEY.map(s => <tr key={s}><td style={{ ...td, fontWeight: 700 }}>{s}</td><td style={td} /><td style={td} /><td style={td} /></tr>)}</tbody>
      </table>
    </Sec>
    <Sec k="C" he="כותבים על חבר/ה מהסקר" en="Write about a friend">
      <Lines k={2} h={9} lead="My friend _____ likes to _____, but doesn't like to _____." />
    </Sec>
  </Sheet>
}

function FoodPage({ n }) {
  return <Sheet n={n} arts={['🥗', '🍞']} title="אוכל וארוחות" en="Food and Meals">
    <Cards items={FOOD} cols={6} mm={14} />
    <Sec k="A" he="מקיפים את המילה שלא שייכת" en="Odd one out">
      <Items items={ODD.map(o => o[0])} size="13pt" gap="2.4mm" />
    </Sec>
    <Sec k="B" he="a או an? לפני צליל של תנועה (a, e, i, o, u) כותבים an" en="Write a or an">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2.4mm 4mm', fontSize: '13.5pt', padding: '0 2mm' }}>
        {A_AN.map(([s], i) => <div key={s}><b style={{ color: C }}>{i + 1}.</b> <T s={s} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="C" he="מה אני אוכל/ת ושותה בכל ארוחה?" en="My meals — I usually eat …">
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt', textAlign: 'left' }}>
        <thead><tr>{['', 'I usually eat …', 'I usually drink …'].map(h => <th key={h} style={{ border: `1px solid ${MID}`, background: SOFT, color: C, padding: '0.8mm 2mm' }}>{h}</th>)}</tr></thead>
        <tbody>{[['🥚', 'breakfast'], ['🍲', 'lunch'], ['🍽️', 'dinner']].map(([e, m]) => <tr key={m}><td style={{ border: `1px solid ${MID}`, padding: '0.8mm 2mm', fontWeight: 800, width: '36mm', whiteSpace: 'nowrap' }}><Art e={e} mm={7} /> {m}</td><td style={{ border: `1px solid ${MID}`, height: '12mm' }} /><td style={{ border: `1px solid ${MID}` }} /></tr>)}</tbody>
      </table>
    </Sec>
  </Sheet>
}

function EePage({ n }) {
  return <Sheet n={n} arts={['🐝', '🌊']} title="צלילים: ee ו־ea" en="Phonics: the long e sound">
    <Rule title="Sound Box" e="👂">
      <div style={{ display: 'flex', gap: '3mm', alignItems: 'center' }}>
        {[['ee', 'tree · sheep · green'], ['ea', 'sea · beach · eat']].map(([l, ex]) => <div key={l} style={{ flex: 1, background: 'white', borderRadius: '2mm', padding: '1mm', textAlign: 'center' }}>
          <En style={{ fontSize: '22pt', fontWeight: 800, color: C }}>{l}</En><br /><En style={{ fontWeight: 700 }}>{ex}</En>
        </div>)}
        <div style={{ flex: 1.3 }}>שתי האותיות יחד נשמעות כמו <b>"אִי" ארוכה</b>. כדי לדעת איך כותבים, צריך להכיר את המילה — לכן קוראים הרבה!</div>
      </div>
    </Rule>
    <Sec k="A" he="משלימים ee או ea" en="Write ee or ea">
      <PicFill items={EE_EA.map(([e, s]) => ({ e, s }))} cols={3} mm={14} size="16pt" />
    </Sec>
    <Sec k="B" he="נשמע אותו דבר, נכתב אחרת! מקיפים את המילה הנכונה" en="Sounds the same — circle the right word">
      <Items items={HOMO.map(h => h[0])} size="13pt" gap="2.4mm" />
    </Sec>
    <Sec k="C" he="קוראים בקול, מקיפים מילים עם ee ומותחים קו מתחת למילים עם ea" en="Circle ee, underline ea">
      <EnBlock style={{ fontSize: '15pt', lineHeight: 1.8, border: `0.5mm dashed ${C}`, borderRadius: '3mm', padding: '2mm 4mm' }}>We sit under a green tree at the beach and eat sweet peaches. Then we sleep for three hours!</EnBlock>
    </Sec>
  </Sheet>
}

function AiOoPage({ n }) {
  return <Sheet n={n} arts={['🌈', '🌙']} title="צלילים: ai, ay ו־oo" en="Phonics: rain · day · moon · book">
    <Rule title="Sound Box" e="👂">
      <RuleTable rows={[
        ['**ai** — באמצע המילה', 'r**ai**n, tr**ai**n, p**ai**nt', 'נשמע "אֵיי"'],
        ['**ay** — בסוף המילה', 'd**ay**, pl**ay**, Sund**ay**', 'נשמע "אֵיי"'],
        ['**oo** — ארוך', 'm**oo**n, sp**oo**n, sch**oo**l', 'נשמע "אוּ" ארוכה'],
        ['**oo** — קצר', 'b**oo**k, f**oo**t, l**oo**k', 'נשמע "אוּ" קצרה'],
      ]} />
    </Rule>
    <Sec k="A" he="משלימים ai או oo לפי התמונה" en="Write ai or oo">
      <PicFill items={AI_OO.map(([e, s]) => ({ e, s }))} cols={3} mm={13} size="15pt" />
    </Sec>
    <Sec k="B" he="ai או ay? זוכרים: ay בסוף המילה" en="Write ai or ay">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '2.6mm 4mm', fontSize: '16pt', fontWeight: 700, padding: '0 2mm', letterSpacing: '0.4mm' }}>
        {AI_AY.map(([s], i) => <div key={s}><span style={{ fontSize: '10pt', color: C }}>{i + 1}. </span><T s={s} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="C" he="קוראים בקול וממיינים: oo ארוך או קצר?" en="Long oo or short oo?">
      <WordBank words={OO_SORT} title="Words" />
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13pt' }}>
        <thead><tr>{['🌙 long oo (moon)', '📚 short oo (book)'].map(h => <th key={h} style={{ border: `1px solid ${C}`, background: SOFT, color: C, padding: '0.8mm' }}>{h}</th>)}</tr></thead>
        <tbody><tr>{[0, 1].map(c => <td key={c} style={{ border: `1px solid ${C}`, height: '24mm' }} />)}</tr></tbody>
      </table>
    </Sec>
  </Sheet>
}

function ProgressivePage({ n }) {
  return <Sheet n={n} arts={['⏰', '🎸']} title="Present Progressive — מה קורה עכשיו?" en="Grammar: am / is / are + verb-ing">
    <Rule>
      משתמשים בהווה המתמשך כשמשהו קורה <b>עכשיו</b>, ברגע זה. מילים שרומזות: <En><b>now, right now, at the moment, Look!, Listen!</b></En>
      <RuleTable rows={[
        ['I **am** play**ing**', 'I\'m **not** playing', '**Am** I playing?'],
        ['he / she / it **is** play**ing**', 'she **isn\'t** playing', '**Is** she playing?'],
        ['we / you / they **are** play**ing**', 'they **aren\'t** playing', '**Are** they playing?'],
      ]} />
      איות: <En><b>write → writing</b></En> (ה־e נופלת) · <En><b>swim → swimming, run → running, sit → sitting</b></En> (אות כפולה)
    </Rule>
    <Sec k="A" he="כותבים את הפועל עם ing" en="Add -ing">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2.6mm 6mm', fontSize: '13pt', padding: '0 2mm', whiteSpace: 'nowrap' }}>
        {ING.map(([w], i) => <div key={w}><b style={{ color: C }}>{i + 1}.</b> {w} → <Blank n={7} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="B" he="בפארק: מה הם עושים עכשיו? כותבים משפט" en="At the park — what are they doing?">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2mm 4mm' }}>
        {PARK.map(([e, p], i) => <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '2mm', border: `0.45mm dashed ${MID}`, borderRadius: '3mm', padding: '1mm 2mm' }}>
          <Art e={e} mm={12} />
          <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontSize: '11.5pt', color: C, fontWeight: 700 }}>{i + 1}. {p}</div><div style={{ height: '8mm', borderBottom: '1.2px solid #555' }} /></div>
        </div>)}
      </div>
    </Sec>
    <Sec k="C" he="שלילה (✗) ושאלה (?)" en="Negative and question">
      <Items items={PROG_NQ.map(p => p[0])} cols={2} size="12pt" gap="2.4mm" />
    </Sec>
  </Sheet>
}

function SimpleVsProgPage({ n }) {
  return <Sheet n={n} arts={['📚', '⏰']} title="Simple או Progressive?" en="Grammar: every day or right now?">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm' }}>
      <Rule title="Present Simple" e="📚" style={{ margin: 0 }}>
        דברים שקורים <b>תמיד / בדרך כלל</b>, הרגלים ועובדות.
        <EnBlock><b>always, usually, often, every day, on Sundays</b><br />She <b>plays</b> tennis every day.</EnBlock>
      </Rule>
      <Rule title="Present Progressive" e="⏰" style={{ margin: 0 }}>
        דברים שקורים <b>עכשיו</b>, ברגע זה.
        <EnBlock><b>now, right now, at the moment, Look!, Listen!</b><br />She <b>is playing</b> tennis now.</EnBlock>
      </Rule>
    </div>
    <Sec k="A" he="מקיפים את הצורה הנכונה" en="Circle the right form">
      <Items items={SP.map(s => s[0])} size="12.5pt" gap="1.1mm" />
    </Sec>
    <Sec k="B" he="גלויה מאילת: כותבים את הפועל בצורה הנכונה" en="A postcard — write the verb">
      <Passage title="A Postcard from Eilat" arts={['🏖️', '💌']} size="12.5pt">
        <div style={{ lineHeight: 1.9 }}>
          <div>Dear Grandma,</div><T s="We __________ (have) a great time in Eilat! Right now I __________ (sit) on the beach, and Dad __________ (swim) in the sea. Every morning we __________ (eat) breakfast at the hotel. Mom usually __________ (read) a book in the afternoon, but today she __________ (play) volleyball with us!" /><div style={{ lineHeight: 1.4 }}>Love,<br />Itai</div>
        </div>
      </Passage>
    </Sec>
  </Sheet>
}

function FrequencyPage({ n }) {
  const td = { border: `1px solid ${MID}`, padding: '0.6mm 1.5mm', textAlign: 'center' }
  return <Sheet n={n} arts={['⏰', '🦷']} title="תדירות: always, usually, often…" en="Grammar: adverbs of frequency">
    <Rule title="How often?" e="⏰">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1.5mm', margin: '0.5mm 0 1mm' }}>
        {FREQ.map(([w, he, p]) => <div key={w} style={{ background: 'white', borderRadius: '2mm', padding: '1mm', textAlign: 'center' }}>
          <div style={{ height: '4mm', borderRadius: '2mm', background: '#eee', overflow: 'hidden' }}><div style={{ width: `${p}%`, height: '100%', background: C }} /></div>
          <b style={{ fontSize: '12.5pt' }}>{w}</b><div dir="rtl" style={{ fontSize: '9.5pt' }}>{he}</div>
        </div>)}
      </div>
      המילה באה <b>לפני</b> הפועל: <En><b>I always walk</b> to school.</En> · אבל <b>אחרי</b> <En>am / is / are</En>: <En><b>She is never</b> late.</En>
    </Rule>
    <Sec k="A" he="השבוע של יעל: מסתכלים בטבלה ומשלימים" en="Yael's week">
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
        <thead><tr><th style={{ ...td, textAlign: 'left' }}>Yael …</th>{DAYS.map(d => <th key={d} style={{ ...td, background: SOFT, color: C }}>{d}</th>)}</tr></thead>
        <tbody>{YAEL.map(([a, days]) => <tr key={a}><td style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{a}</td>{days.map((d, i) => <td key={i} style={{ ...td, color: '#2e7d32', fontWeight: 800 }}>{d ? '✓' : ''}</td>)}</tr>)}</tbody>
      </table>
      <div style={{ fontSize: '9.5pt', color: '#555', margin: '0.8mm 0' }}><En>always = 7 days · usually = 5–6 · often = 3–4 · sometimes = 1–2 · never = 0</En></div>
      <Items items={YAEL.map(([a]) => `Yael ________ ${a}.`)} size="12pt" gap="1.4mm" />
    </Sec>
    <Sec k="B" he="מכניסים את המילה בסוגריים למקום הנכון" en="Put the word in the right place">
      <Items items={FREQ_PLACE.map(f => f[0])} size="12pt" gap="2.4mm" />
    </Sec>
    <Sec k="C" he="ומה איתי?" en="Write about you">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0 4mm', fontSize: '12pt' }}>
        {['I always …', 'I sometimes …', 'I never …'].map(s => <div key={s} style={{ borderBottom: '1.2px solid #555', height: '9mm', display: 'flex', alignItems: 'flex-end' }}>{s}</div>)}
      </EnBlock>
    </Sec>
  </Sheet>
}

function WasWerePage({ n }) {
  return <Sheet n={n} arts={['📖', '⏰']} title="was / were — עבר של to be" en="Grammar: the past of am, is, are">
    <Rule>
      <RuleTable head={['', '✓', '✗', '?']} rows={[
        ['I / he / she / it', 'I **was** at home.', 'It **wasn\'t** (was not) cold.', '**Was** he happy? Yes, he **was**. / No, he **wasn\'t**.'],
        ['we / you / they', 'We **were** at school.', 'They **weren\'t** (were not) late.', '**Were** you there? Yes, I **was**. / No, I **wasn\'t**.'],
      ]} />
      מילים של עבר: <En><b>yesterday, last week, last night, two days ago, in 2020</b></En>
    </Rule>
    <Sec k="A" he="משלימים was, were, wasn't או weren't (✗ = שלילה)" en="Complete">
      <Items items={WAS.map(w => w[0])} size="12.5pt" gap="2.4mm" />
    </Sec>
    <Sec k="B" he="מהיום לאתמול: כותבים בעבר" en="Today → yesterday">
      <Items items={WAS_CHANGE.map(w => w[0])} size="12.5pt" gap="2.6mm" />
    </Sec>
    <Sec k="C" he="עונים על עצמך במשפט מלא" en="Answer about you">
      <Open items={[{ q: 'Where were you yesterday at five o\'clock?' }, { q: 'Was the weather nice last weekend?' }, { q: 'Who was your teacher in first grade?' }]} size="12pt" inline />
    </Sec>
  </Sheet>
}

function WhPage({ n }) {
  return <Sheet n={n} arts={['💡', '🙋']} title="מילות שאלה — WH Questions" en="Grammar: What? Where? When? Who? Why? How?">
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gap: '1.2mm' }}>
      {WH_WORDS.map(([w, he]) => <div key={w} style={{ background: SOFT, border: `0.45mm solid ${MID}`, borderRadius: '2.5mm', textAlign: 'center', padding: '1mm 0.5mm' }}>
        <b style={{ color: C, fontSize: '11pt' }}>{w}</b><div dir="rtl" style={{ fontSize: '9pt' }}>{he}</div>
      </div>)}
    </div>
    <Sec k="A" he="מתאימים תשובה לכל שאלה: כותבים את האות בריבוע" en="Match the question and the answer">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '0 6mm', fontSize: '12.5pt', textAlign: 'left' }}>
        <div>{WH_Q.map((q, i) => <div key={q} style={{ display: 'flex', alignItems: 'center', gap: '2mm', height: '8.6mm' }}><b>{i + 1}.</b><span style={{ flex: 1 }}>{q}</span><span style={{ width: '7mm', height: '7mm', border: '1.4px solid #111', borderRadius: '1.5mm', flex: 'none' }} /></div>)}</div>
        <div style={{ borderLeft: `0.5mm dashed ${MID}`, paddingLeft: '4mm' }}>{WH_A.map((a, i) => <div key={a} style={{ height: '8.6mm', display: 'flex', alignItems: 'center' }}><b style={{ color: C, marginRight: '2mm' }}>{'abcdefgh'[i]})</b>{a}</div>)}</div>
      </div>
    </Sec>
    <Sec k="B" he="כותבים את מילת השאלה" en="Write the question word">
      <Items items={WH_FILL.map(w => w[0])} size="12.5pt" gap="2.3mm" />
    </Sec>
    <Sec k="C" he="ראיון: כותבים 2 שאלות לחבר/ה, ואת התשובות שלו/ה" en="Interview a friend">
      <Lines k={4} h={8.5} />
    </Sec>
  </Sheet>
}

function ComparativesPage({ n }) {
  return <Sheet n={n} arts={['🦒', '🐘']} title="השוואה: bigger, taller, more…" en="Grammar: comparatives + than">
    <Rule>
      <RuleTable rows={[
        ['short word **+ er**', 'tall → tall**er**, fast → fast**er**', 'ends in e **+ r**', 'nice → nice**r**'],
        ['short vowel + 1 consonant', 'big → bi**gg**er, hot → ho**tt**er', 'y **→ ier**', 'happy → happ**ier**'],
        ['long word', '**more** beautiful, **more** expensive', 'special!', 'good → **better**, bad → **worse**'],
      ]} />
      אחרי מילת ההשוואה בא <En><b>than</b></En> (מאשר): <En>A car is <b>faster than</b> a bike.</En>
    </Rule>
    <Sec k="A" he="כותבים את צורת ההשוואה" en="Write the comparative">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2.4mm 6mm', fontSize: '13pt', padding: '0 2mm', whiteSpace: 'nowrap' }}>
        {COMP.map(([w], i) => <div key={w}><b style={{ color: C }}>{i + 1}.</b> {w} → <Blank n={7} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="B" he="משווים בין החיות" en="Compare the animals">
      <EnBlock style={{ fontSize: '12.5pt', padding: '0 2mm' }}>
        {ANIMAL_COMP.map(([a, b, s], i) => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '2mm', borderBottom: '1px dashed #ddd', padding: '0.4mm 0' }}>
          <b style={{ width: '5mm' }}>{i + 1}.</b><Art e={a} mm={9} /><span style={{ color: '#999', fontSize: '10pt' }}>vs</span><Art e={b} mm={9} /><span style={{ marginLeft: '2mm' }}><T s={s} /></span>
        </div>)}
      </EnBlock>
    </Sec>
    <Sec k="C" he="משווים בין שני דברים שאני מכיר/ה" en="Compare two things">
      <Lines k={2} h={9} lead="________ is ________ than ________ ." />
    </Sec>
  </Sheet>
}

function DiaryPage({ n }) {
  return <Sheet n={n} arts={['🦒', '📖']} title="קריאה: Dear Diary" en="Reading: unseen text">
    <Passage title="Dear Diary" arts={['🦒', '🐵', '🐘']} size="12pt">
      Yesterday was a great day! Our class was on a trip to the zoo. The bus ride was long, but my friends and I were happy because the trip was a surprise.
      <div style={{ height: '1.2mm' }} />
      The first animals were the lions. They were asleep, so they weren't very interesting. The monkeys were much more fun. They were very noisy and very fast! My favorite animal was the giraffe, because it was taller than all the other animals.
      <div style={{ height: '1.2mm' }} />
      At twelve o'clock we were hungry. Our lunch was on the grass, next to the elephants. The elephants were very big — and very dirty! At the end of the day I was tired, but it was the best trip of the year!
      <div style={{ textAlign: 'right', fontStyle: 'italic' }}>Shira</div>
    </Passage>
    <Sec k="A" he="מקיפים את התשובה הנכונה" en="Circle the right answer">
      <Choice items={DIARY_MC} cols={2} size="11.5pt" />
    </Sec>
    <Sec k="B" he="נכון או לא נכון?" en="True or False?">
      <TFItems items={DIARY_TF.map(([q]) => ({ q }))} start={3} cols={2} size="11.5pt" />
    </Sec>
    <Sec k="C" he="עונים על השאלות" en="Answer the questions">
      <Open items={DIARY_OPEN.map(([q]) => ({ q }))} start={7} size="11.5pt" />
    </Sec>
  </Sheet>
}

function CousinsPage({ n }) {
  return <Sheet n={n} arts={['🐄', '💻']} title="קריאה: Two Cousins" en="Reading: unseen text">
    <Passage title="Two Cousins" arts={['🐔', '🐄', '💻']} size="12pt">
      Ori and Daniel are cousins. They are both eleven years old, but they are very different.
      <div style={{ height: '1.2mm' }} />
      Ori lives in Tel Aviv, a big city. He usually goes to school by bus, and he often plays basketball with his friends after school. Daniel lives on a farm in the Galilee. He always gets up early to feed the chickens, and he rides his bike to school.
      <div style={{ height: '1.2mm' }} />
      Ori is taller than Daniel, but Daniel is faster. Ori loves computers, and Daniel loves animals.
      <div style={{ height: '1.2mm' }} />
      Today is a special day: Ori is visiting Daniel on the farm. Right now, Daniel is showing Ori the cows, and Ori is trying to milk a cow for the first time. "This is harder than a computer game!" he says.
    </Passage>
    <Sec k="A" he="מקיפים ועונים" en="Circle and answer">
      <Choice items={COUSINS_MC} cols={2} size="11.5pt" />
      <Open items={COUSINS_OPEN.map(([q]) => ({ q }))} start={3} size="11.5pt" />
    </Sec>
    <Sec k="B" he="נכון או לא נכון?" en="True or False?">
      <TFItems items={COUSINS_TF.map(([q]) => ({ q }))} start={5} size="11.5pt" />
    </Sec>
    <Sec k="C" he="בלש דקדוק: מעתיקים מהטקסט" en="Grammar detective">
      <Open items={COUSINS_HUNT.map(([q]) => ({ q }))} start={8} size="11.5pt" inline />
    </Sec>
  </Sheet>
}

function CrosswordPage({ n }) {
  return <Sheet n={n} arts={['🧠', '✏️']} title="תשבץ מילים" en="Crossword">
    <Tip e="🔑">כותבים את המילה באנגלית — אות אחת בכל משבצת. בסוגריים: כמה אותיות יש במילה. כל המילים מופיעות בחוברת.</Tip>
    <Crossword words={CROSS} maxW={176} maxH={130} />
  </Sheet>
}

function DictationPage({ n }) {
  return <Sheet n={n} arts={['✏️', '👂']} title="הכתבה ואיות" en="Spelling and Dictation">
    <Sec k="A" he="מסתכלים, אומרים, מכסים, כותבים ובודקים" en="Look, say, cover, write, check">
      <SpellTable words={['because', 'friend', 'beautiful', 'favorite', 'breakfast', 'sometimes']} />
    </Sec>
    <Sec k="B" he="הכתבה: מבוגר מקריא, ואני כותב/ת" en="Dictation">
      <Dictation words={['sheep', 'beach', 'green', 'teacher', 'rain', 'play', 'moon', 'spoon', 'train', 'sea']} sentences={['I always eat breakfast at seven.', 'We were at the beach yesterday.', 'My sister is taller than me.']} />
    </Sec>
  </Sheet>
}

function WritingPage({ n }) {
  const box = (e, en, he) => <div style={{ border: `0.5mm solid ${MID}`, borderRadius: '3mm', padding: '1.2mm 2.5mm' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5mm' }}><Art e={e} mm={7} /><En style={{ fontWeight: 800, color: C }}>{en}</En><span style={{ fontSize: '9.5pt', color: '#555' }}>{he}</span></div>
    <div style={{ height: '8mm', borderBottom: '1.2px solid #555' }} /><div style={{ height: '8mm', borderBottom: '1.2px solid #555' }} />
  </div>
  return <Sheet n={n} arts={['🥁', '✏️']} title="כתיבה: My Free Time" en="Writing: a paragraph about my hobby">
    <Sec k="A" he="קוראים את הדוגמה" en="Read the example">
      <Passage title="My Hobby" arts={['🥁']} size="12pt">
        In my free time, I love to play the drums. I usually play on Mondays and Thursdays with my friends Tom and Gal. Sometimes we play in a concert at school. I like the drums because they are loud and fun. Right now, I am learning a new song. It is harder than the old songs, but I never give up!
      </Passage>
    </Sec>
    <Sec k="B" he="מתכננים: עונים בקצרה על כל שאלה" en="Plan your paragraph">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm' }}>
        {box('🎨', 'What?', 'מה התחביב?')}{box('⏰', 'When? How often?', 'מתי? כמה פעמים?')}{box('👪', 'Who with?', 'עם מי?')}{box('💡', 'Why do you like it?', 'למה אני אוהב/ת?')}
      </div>
    </Sec>
    <Sec k="C" he="כותבים פסקה של 5–6 משפטים" en="Write your paragraph">
      <WordBank words={['always', 'usually', 'often', 'sometimes', 'never', 'and', 'but', 'because']} title="Use" />
      <Lines k={6} h={8.8} />
    </Sec>
  </Sheet>
}

function Test1Page({ n }) {
  return <Sheet n={n} arts={['⭐', '✏️']} title="מבחן מסכם (1)" en="Final Test — Part 1">
    <ScoreBox />
    <Sec k="1" he="מקיפים את המילה שמתאימה לתמונה" en="Circle the word" pts={10}>
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '2mm' }}>
        {TEST_PICS.map(([e, opts]) => <div key={e} style={{ border: `0.45mm solid ${MID}`, borderRadius: '3mm', textAlign: 'center', padding: '1mm' }}>
          <Art e={e} mm={13} /><div style={{ fontSize: '12pt', fontWeight: 700, lineHeight: 1.45 }}>{opts.map(o => <div key={o}>{o}</div>)}</div>
        </div>)}
      </div>
    </Sec>
    <Sec k="2" he="כותבים עם ing" en="Add -ing" pts={8}>
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2mm 6mm', fontSize: '12.5pt', padding: '0 2mm', whiteSpace: 'nowrap' }}>
        {TEST_ING.map(([w], i) => <div key={w}><b>{i + 1}.</b> {w} → <Blank n={7} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="3" he="מקיפים: Simple או Progressive" en="Circle" pts={12}>
      <Items items={TEST_SP.map(t => t[0])} size="12pt" gap="1.8mm" />
    </Sec>
    <Sec k="4" he="מכניסים את המילה למקום הנכון" en="Adverbs of frequency" pts={8}>
      <Items items={TEST_FREQ.map(t => t[0])} size="12pt" gap="2.4mm" />
    </Sec>
    <Sec k="5" he="משלימים was, were, wasn't או weren't" en="was / were" pts={12}>
      <Items items={TEST_WAS.map(t => t[0])} cols={2} size="12pt" gap="2mm" />
    </Sec>
  </Sheet>
}

function Test2Page({ n }) {
  return <Sheet n={n} arts={['⭐', '✏️']} title="מבחן מסכם (2)" en="Final Test — Part 2">
    <Sec k="6" he="כותבים את מילת השאלה" en="Question words" pts={10}>
      <Items items={TEST_WH.map(t => t[0])} cols={2} size="11.5pt" gap="1mm" />
    </Sec>
    <Sec k="7" he="כותבים את צורת ההשוואה" en="Comparatives" pts={10}>
      <Items items={TEST_COMP.map(t => t[0])} cols={2} size="11.5pt" gap="1mm" />
    </Sec>
    <Sec k="8" he="קוראים ועונים" en="Read and answer" pts={20}>
      <Passage title="Noga's Band" arts={['🥁', '🎸']} size="11pt">
        Noga is twelve years old, and she loves music. She plays the drums in a band with three friends. They usually practice on Mondays and Thursdays in Noga's garage. Noga's parents sometimes close the windows because the drums are very loud! Right now, the band is getting ready for a big concert at school.
      </Passage>
      <Open items={NOGA.map(([q]) => ({ q }))} size="11.5pt" inline />
      <TFItems items={NOGA_TF.map(([q]) => ({ q }))} start={4} cols={2} size="11pt" />
    </Sec>
    <Sec k="9" he="כותבים 3 משפטים: מה אני בדרך כלל עושה בשבת?" en="What do you usually do on Saturday?" pts={10}>
      <Lines k={3} h={8} />
    </Sec>
  </Sheet>
}

export default function EnglishGrade5Booklet() {
  const mc = items => items.map(i => i.a)
  return <EnglishTheme grade={5}>
    <EnglishCover grade={5} title="חוברת אנגלית לכיתה ה׳" arts={['🎸', '🥗', '🦒', '🌈', '📚']} pages={PAGES}
      skills={[['📚', 'אוצר מילים', 'Vocabulary'], ['👂', 'צלילים ואיות', 'Phonics'], ['🧠', 'דקדוק', 'Grammar'], ['📖', 'הבנת הנקרא', 'Reading'], ['✏️', 'כתיבה', 'Writing']]}
      note="בכל עמוד דקדוק יש תיבת הסבר בעברית עם דוגמאות — קוראים אותה לפני התרגול, ואפשר לחזור אליה בזמן העבודה. עמודי הקריאה הם קטעים שלא נלמדו (Unseen), כמו בבית הספר. בעמוד 15 יש הכתבה, בעמודים 17–18 מבחן מסכם של 100 נקודות, ובסוף דף תשובות ותעודה." />
    <HobbiesPage n={2} />
    <FoodPage n={3} />
    <EePage n={4} />
    <AiOoPage n={5} />
    <ProgressivePage n={6} />
    <SimpleVsProgPage n={7} />
    <FrequencyPage n={8} />
    <WasWerePage n={9} />
    <WhPage n={10} />
    <ComparativesPage n={11} />
    <DiaryPage n={12} />
    <CousinsPage n={13} />
    <CrosswordPage n={14} />
    <DictationPage n={15} />
    <WritingPage n={16} />
    <Test1Page n={17} />
    <Test2Page n={18} />
    <KeyPage n={19} size="8.5pt" cols={3} sections={[
      { title: 'עמוד 2 — A', answers: ans(HOBBY_RIDDLES) },
      { title: 'עמוד 3 — A', answers: ans(ODD) },
      { title: 'עמוד 3 — B', answers: ans(A_AN) },
      { title: 'עמוד 4 — A', answers: EE_EA.map(x => x[2]) },
      { title: 'עמוד 4 — B', answers: ans(HOMO) },
      { title: 'עמוד 4 — C', letters: true, answers: ['ee: green, tree, sweet, sleep, three', 'ea: beach, eat, peaches'] },
      { title: 'עמוד 5 — A', answers: AI_OO.map(x => x[2]) },
      { title: 'עמוד 5 — B', answers: ans(AI_AY) },
      { title: 'עמוד 5 — C', letters: true, answers: ['long: food, room, school, zoo', 'short: look, good, cook, wood'] },
      { title: 'עמוד 6 — A', answers: ans(ING) },
      { title: 'עמוד 6 — B', answers: ans(PARK) },
      { title: 'עמוד 6 — C', answers: ans(PROG_NQ) },
      { title: 'עמוד 7 — A', answers: ans(SP) },
      { title: 'עמוד 7 — B (Postcard)', answers: ans(POSTCARD) },
      { title: 'עמוד 8 — A', answers: ans(YAEL) },
      { title: 'עמוד 8 — B', answers: ans(FREQ_PLACE) },
      { title: 'עמוד 9 — A', answers: ans(WAS) },
      { title: 'עמוד 9 — B', answers: ans(WAS_CHANGE) },
      { title: 'עמוד 10 — A', answers: WH_KEY },
      { title: 'עמוד 10 — B', answers: ans(WH_FILL) },
      { title: 'עמוד 11 — A', answers: ans(COMP) },
      { title: 'עמוד 11 — B', answers: ans(ANIMAL_COMP) },
      { title: 'עמוד 12 — Dear Diary', answers: [...mc(DIARY_MC), ...ans(DIARY_TF), ...ans(DIARY_OPEN)] },
      { title: 'עמוד 13 — Two Cousins', answers: [...mc(COUSINS_MC), ...ans(COUSINS_OPEN), ...ans(COUSINS_TF), ...ans(COUSINS_HUNT)] },
      { title: 'עמוד 14 — תשבץ', letters: true, answers: crosswordAnswers(CROSS) },
      { title: 'מבחן — 1', answers: TEST_PICS.map(t => t[2]) },
      { title: 'מבחן — 2', answers: ans(TEST_ING) },
      { title: 'מבחן — 3', answers: ans(TEST_SP) },
      { title: 'מבחן — 4', answers: ans(TEST_FREQ) },
      { title: 'מבחן — 5', answers: ans(TEST_WAS) },
      { title: 'מבחן — 6', answers: ans(TEST_WH) },
      { title: 'מבחן — 7', answers: ans(TEST_COMP) },
      { title: 'מבחן — 8 (4 נק׳ לכל סעיף)', answers: [...ans(NOGA), ...ans(NOGA_TF)] },
    ]} />
    <EnglishCertificate grade={5} booklet="חוברת האנגלית לכיתה ה׳" done="תרגלתי צלילים ואיות, הווה פשוט ומתמשך, was ו־were, מילות שאלה והשוואות, קראתי קטעים באנגלית וכתבתי פסקה משלי." />
  </EnglishTheme>
}

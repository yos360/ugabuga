import { crosswordAnswers } from './englishCrossword'
import { Art, Blank, Cards, Choice, Crossword, Dictation, En, EnBlock, EnglishCertificate, EnglishCover, EnglishTheme, Items, KeyPage, Lines, Open, Passage, PicFill, Rule, RuleTable, ScoreBox, Sec, Sheet, SpellTable, T, TFItems, Tip, WordBank } from './englishKit'
import { art } from './kit'
import { bookletBySlug } from './registry'

// "חוברת אנגלית לכיתה ד׳" — Foundation level, the year after the ABC (englishGrade3.jsx): picture
// vocabulary (family, home, clothes, weather), sh/ch/th and magic e, to be, have got, plurals,
// this/that, present simple, can, there is/are with prepositions, two short unseen texts, a picture
// crossword, dictation, writing, a two-page final test, answers and a certificate.
const PAGES = bookletBySlug('english-grade-4').pages
const C = '#16768a'

// ---------- Vocabulary ----------
const FAMILY = [
  ['👩', 'mom', 'אמא'], ['👨', 'dad', 'אבא'], ['👦', 'brother', 'אח'], ['👧', 'sister', 'אחות'], ['👵', 'grandma', 'סבתא'], ['👴', 'grandpa', 'סבא'],
  ['👶', 'baby', 'תינוק'], ['🏠', 'house', 'בית'], ['🛏️', 'bed', 'מיטה'], ['🛋️', 'sofa', 'ספה'], ['🚪', 'door', 'דלת'], ['🪟', 'window', 'חלון'],
].map(([e, en, he]) => ({ e, en, he }))
const WHO = [
  ['My dad\'s mother is my g______.', 'grandma'], ['My mom\'s father is my g______.', 'grandpa'], ['I sleep in my b__.', 'bed'],
  ['We sit on the s___ and watch TV.', 'sofa'], ['It\'s hot! Please open the w_____.', 'window'], ['My sister is a girl. My b______ is a boy.', 'brother'],
]
const CLOTHES = [
  ['👕', 'shirt', 'חולצה'], ['👖', 'pants', 'מכנסיים'], ['👗', 'dress', 'שמלה'], ['👟', 'shoes', 'נעליים'], ['🧦', 'socks', 'גרביים'], ['🧢', 'hat', 'כובע'],
  ['🧥', 'coat', 'מעיל'], ['🧤', 'gloves', 'כפפות'], ['🧣', 'scarf', 'צעיף'], ['👓', 'glasses', 'משקפיים'], ['☂️', 'umbrella', 'מטרייה'], ['🎒', 'bag', 'תיק'],
].map(([e, en, he]) => ({ e, en, he }))
const WEAR = [
  ['It\'s sunny and hot. I wear a [hat|coat].', 'hat'], ['It\'s snowing! I wear [gloves|shorts].', 'gloves'],
  ['It\'s raining. I take my [umbrella|glasses].', 'umbrella'], ['I wear [socks|gloves] on my feet.', 'socks'],
  ['I wear a scarf around my [neck|foot].', 'neck'], ['It\'s cold and windy. Put on your warm [coat|dress].', 'coat'],
]
const WEATHER = [['☀️', 'sunny'], ['🌧️', 'rainy'], ['❄️', 'snowy'], ['☁️', 'cloudy'], ['🌬️', 'windy'], ['⛈️', 'stormy']]

// ---------- Phonics ----------
const DIGRAPHS = [
  ['👕', '__irt', 'shirt'], ['👟', '__oes', 'shoes'], ['🐑', '__eep', 'sheep'], ['🚢', '__ip', 'ship'],
  ['🪑', '__air', 'chair'], ['🧀', '__eese', 'cheese'], ['🐔', '__icken', 'chicken'], ['🍒', '__erry', 'cherry'],
  [null, '__ree', 'three', '3'], ['🛁', 'ba__', 'bath'], ['👄', 'mou__', 'mouth'], ['🦷', 'too__', 'tooth'],
]
const SORT = ['fish', 'lunch', 'think', 'she', 'teacher', 'mother', 'wash', 'much', 'thank']
const MAGIC = [['cap', 'cape'], ['tap', 'tape'], ['plan', 'plane'], ['pin', 'pine'], ['kit', 'kite'], ['hop', 'hope'], ['not', 'note'], ['cub', 'cube']]
const MAGIC_PICS = [['🎂', 'c_k_', 'cake'], ['🚲', 'b_k_', 'bike'], ['👃', 'n_s_', 'nose'], ['🌹', 'r_s_', 'rose'], ['🪁', 'k_t_', 'kite'], [null, 'f_v_', 'five', '5'], ['✈️', 'pl_n_', 'plane'], ['🧊', 'c_b_', 'cube']]
const MAGIC_CIRCLE = [['I can fly a [kit|kite] in the park.', 'kite'], ['I [hop|hope] you feel better!', 'hope'], ['Write a [not|note] to Mom.', 'note'], ['The [plan|plane] is in the sky.', 'plane']]

// ---------- Grammar ----------
const BE = [
  ['I ___ ten years old.', 'am'], ['My sister ___ six.', 'is'], ['We ___ in class 4B.', 'are'], ['The cats ___ hungry.', 'are'],
  ['It ___ a sunny day.', 'is'], ['You ___ my best friend.', 'are'], ['Dan and Noa ___ at school.', 'are'], ['My grandpa ___ very funny.', 'is'],
]
const BE_NEG = [['She is sad. → ______________', 'She isn\'t sad.'], ['They are at home. → ______________', 'They aren\'t at home.'], ['I am tired. → ______________', 'I\'m not tired.']]
const BE_SHORT = [['Is the sun hot? ______________', 'Yes, it is.'], ['Are elephants small? ______________', 'No, they aren\'t.'], ['Is a banana yellow? ______________', 'Yes, it is.']]

const KIDS = [['Tom', [1, 0, 1, 0]], ['Maya', [0, 1, 1, 1]], ['Ben', [1, 1, 0, 1]]]
const HAVE_PICS = [['🐶', 'dog'], ['🐱', 'cat'], ['🚲', 'bike'], ['⚽', 'ball']]
const HAVE = [
  ['Tom ___ got a dog.', 'has'], ['Maya ______ got a dog.', 'hasn\'t'], ['Tom and Maya ____ got bikes.', 'have'], ['Ben ______ got a bike.', 'hasn\'t'],
  ['____ Ben got a cat? Yes, he ___.', 'Has … has'], ['Has Tom got a ball? ______________', 'No, he hasn\'t.'], ['Who has got a cat and a ball? ______________', 'Maya and Ben'],
]

const PLURALS = [['cat', 'cats'], ['box', 'boxes'], ['baby', 'babies'], ['bus', 'buses'], ['child', 'children'], ['apple', 'apples'], ['tooth', 'teeth'], ['dish', 'dishes'], ['foot', 'feet'], ['toy', 'toys'], ['man', 'men'], ['sheep', 'sheep']]
const NEAR_FAR = [['🐱', 1, true, '___ is a cat.', 'This'], ['🍎', 3, true, '___ are apples.', 'These'], ['🚌', 1, false, '___ is a bus.', 'That'], ['🐦', 3, false, '___ are birds.', 'Those'], ['🏠', 1, false, '___ is my house.', 'That'], ['🍪', 3, true, '___ are cookies.', 'These']]

const NOA = [['get', 'gets'], ['brush', 'brushes'], ['eat', 'eats'], ['go', 'goes'], ['walk', 'walks'], ['play', 'play'], ['watch', 'watches'], ['do', 'does'], ['go', 'go']]
const PS_NEG = [['I like milk. → ______________', 'I don\'t like milk.'], ['He plays football. → ______________', 'He doesn\'t play football.'], ['They live in Haifa. → ______________', 'They don\'t live in Haifa.']]
const PS_Q = [['___ you like pizza?', 'Do'], ['___ your dad drive a car?', 'Does'], ['___ cats eat fish?', 'Do'], ['___ Noa walk to school? Yes, she ____.', 'Does … does']]

const CAN = [['🐟', 'A fish ____ fly.', 'can\'t'], ['🐦', 'A bird ____ fly.', 'can'], ['🐵', 'A monkey ____ climb.', 'can'], ['🐍', 'A snake ____ walk.', 'can\'t'], ['🐸', 'A frog ____ jump.', 'can'], ['🐘', 'An elephant ____ fly.', 'can\'t'], ['🐢', 'A turtle ____ run fast.', 'can\'t'], ['🐶', 'A dog ____ run.', 'can']]

const ROOM_TF = [['The cat is on the bed.', 'T'], ['The dog is under the table.', 'T'], ['There are two apples on the table.', 'F (three)'], ['The ball is on the chair.', 'F (under the table)'], ['The teddy bear is between the bed and the table.', 'T'], ['There is a clock on the wall.', 'T'], ['The books are under the bed.', 'F (on the table)'], ['There is a window in the room.', 'T']]
const ROOM_FILL = [['There ___ a cat on the bed.', 'is'], ['There ___ three apples on the table.', 'are'], ['There ___ books on the table.', 'are'], ['____ there a TV in the room? No, there ______.', 'Is … isn\'t']]

// ---------- Reading ----------
const MAX_MC = [
  { q: 'How old is Tamar?', options: ['seven', 'nine', 'ten'], a: 'b' }, { q: 'Where does Tamar live?', options: ['in Haifa', 'in Eilat', 'in Tel Aviv'], a: 'a' },
  { q: 'What color is Max?', options: ['black', 'brown and white', 'white'], a: 'b' }, { q: 'Where does Max sleep?', options: ['in the garden', 'next to Tamar\'s bed', 'on the sofa'], a: 'b' },
]
const MAX_TF = [['Yoni is Tamar\'s big brother.', 'F — he is her little brother'], ['Max can swim.', 'F — he can\'t swim'], ['Max likes to play with his ball.', 'T']]
const MAX_OPEN = [['What does Tamar do every morning?', 'She gives Max his food and water.'], ['Who takes Max to the park?', 'Tamar and Yoni.']]

const RAIN_MC = [{ q: 'What day is it?', options: ['Friday', 'Saturday', 'Sunday'], a: 'b' }, { q: 'Who is at home with Ben and Lily?', options: ['Mom', 'Grandma', 'Dad'], a: 'b' }]
const RAIN_TF = [['Ben gets the eggs.', 'F — Lily gets them'], ['The cake is ready at four o\'clock.', 'T'], ['It\'s a lemon cake.', 'F — it\'s a chocolate cake']]
const RAIN_ORDER = [['Grandma puts the cake in the oven.', 3], ['Lily gets the eggs, the milk and the flour.', 1], ['They eat the cake and drink hot chocolate.', 4], ['Ben mixes everything in a big bowl.', 2]]

const CROSS = [['grandma', '👵'], ['sheep', '🐑'], ['chair', '🪑'], ['socks', '🧦'], ['rain', '🌧️'], ['cake', '🎂'], ['kite', '🪁'], ['shoes', '👟'], ['cheese', '🧀'], ['umbrella', '☂️']].map(([word, e]) => ({ word, e }))

// ---------- Test ----------
const TEST_PICS = [['🧥', ['coat', 'cake', 'cat'], 'coat'], ['👵', ['grandpa', 'grandma', 'baby'], 'grandma'], ['🌧️', ['snow', 'sun', 'rain'], 'rain'], ['🧦', ['shoes', 'socks', 'shirt'], 'socks'], ['🪟', ['window', 'door', 'wall'], 'window']]
const TEST_BE = [['My mom ___ a doctor.', 'is'], ['I ___ happy today.', 'am'], ['The dogs ___ in the garden.', 'are'], ['___ you nine?', 'Are'], ['It ___ cold outside.', 'is'], ['Tom and I ___ friends.', 'are']]
const TEST_HAVE = [['She ____ got long hair.', 'has'], ['We ____ got a big house.', 'have'], ['____ he got a bike?', 'Has'], ['They ______ got a car. ✗', 'haven\'t']]
const TEST_PL = [['box', 'boxes'], ['child', 'children'], ['baby', 'babies'], ['foot', 'feet'], ['watch', 'watches']]
const TEST_PS = [['He [play|plays] tennis.', 'plays'], ['They [go|goes] to school by bus.', 'go'], ['My cat [don\'t|doesn\'t] like water.', 'doesn\'t'], ['[Do|Does] you like pizza?', 'Do'], ['She [watchs|watches] TV.', 'watches'], ['We [doesn\'t|don\'t] eat meat.', 'don\'t']]
const TEST_MIX = [['There ___ a book on the desk.', 'is'], ['There ___ five boys in the garden.', 'are'], ['A bird ____ fly.', 'can'], ['A fish ______ walk.', 'can\'t'], ['____ you swim? Yes, I can.', 'Can'], ['The shoes are [on|under] the bed. ⬇', 'under']]
const SAM = [['Where does Sam live?', 'In Eilat, near the sea.'], ['When does Sam play football?', 'On Mondays and Wednesdays.'], ['Who goes to the library with Sam?', 'His mom.']]
const SAM_TF = [['Sam swims in a pool.', 'F — he swims in the sea'], ['Grandpa always wins at chess.', 'T']]

const ans = list => list.map(x => x[x.length - 1])

// ---------- Pages ----------
function FamilyPage({ n }) {
  return <Sheet n={n} arts={['👪', '🏠']} title="המשפחה והבית" en="My Family and My Home">
    <Sec k="A" he="קוראים בקול את המילים, מכסים את העברית — וזוכרים?" en="Read and remember">
      <Cards items={FAMILY} cols={6} mm={16} />
    </Sec>
    <Sec k="B" he="מי זה? מה זה? משלימים את המילה" en="Complete the word">
      <Items items={WHO.map(w => w[0])} size="13.5pt" gap="3.4mm" />
    </Sec>
    <Sec k="C" he="מציירים את המשפחה שלי וכותבים מי זה" en="Draw your family and write">
      <div style={{ display: 'flex', gap: '4mm', alignItems: 'stretch' }}>
        <div style={{ flex: 1, border: `0.5mm dashed ${C}`, borderRadius: '3mm', minHeight: '44mm' }} />
        <div style={{ flex: 1.2 }}><Lines k={4} h={10.5} lead="This is my ______." /></div>
      </div>
    </Sec>
  </Sheet>
}

function ClothesPage({ n }) {
  return <Sheet n={n} arts={['🧥', '☂️']} title="בגדים ומזג אוויר" en="Clothes and Weather">
    <Cards items={CLOTHES} cols={6} mm={15} />
    <Sec k="A" he="מקיפים את המילה המתאימה" en="Circle the right word">
      <Items items={WEAR.map(w => w[0])} size="13pt" gap="2.6mm" />
    </Sec>
    <Sec k="B" he="מה מזג האוויר? כותבים מילה ממחסן המילים" en="What's the weather like?">
      <WordBank words={['sunny', 'rainy', 'snowy', 'cloudy', 'windy', 'stormy']} />
      <PicFill items={WEATHER.map(([e]) => ({ e, s: 'It\'s ____.' }))} cols={3} mm={16} size="14pt" />
    </Sec>
  </Sheet>
}

function DigraphPage({ n }) {
  return <Sheet n={n} arts={['🚢', '🪑']} title="צלילים: sh, ch, th" en="Phonics: two letters — one sound">
    <Rule title="Sound Box" e="👂">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2mm', textAlign: 'center' }}>
        {[['sh', 'כמו ש', 'ship · fish'], ['ch', 'כמו צ׳', 'chair · lunch'], ['th', 'הלשון בין השיניים', 'three · bath']].map(([l, he, ex]) => <div key={l} style={{ background: 'white', borderRadius: '2mm', padding: '1mm' }}>
          <En style={{ fontSize: '22pt', fontWeight: 800, color: C }}>{l}</En><div>{he}</div><En style={{ fontWeight: 700 }}>{ex}</En>
        </div>)}
      </div>
    </Rule>
    <Sec k="A" he="אומרים את שם התמונה ומשלימים sh, ch או th" en="Write sh, ch or th">
      <PicFill items={DIGRAPHS.map(([e, s, , text]) => ({ e, s, text }))} cols={3} mm={14} size="16pt" />
    </Sec>
    <Sec k="B" he="קוראים בקול וממיינים את המילים לטבלה" en="Read and sort">
      <WordBank words={SORT} title="Words" />
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14pt', textAlign: 'center' }}>
        <thead><tr>{['sh', 'ch', 'th'].map(h => <th key={h} style={{ border: `1px solid ${C}`, background: '#e8f5f7', color: C, fontSize: '16pt' }}>{h}</th>)}</tr></thead>
        <tbody>{[0, 1, 2].map(r => <tr key={r}>{[0, 1, 2].map(c => <td key={c} style={{ border: `1px solid ${C}`, height: '10mm' }} />)}</tr>)}</tbody>
      </table>
    </Sec>
  </Sheet>
}

function MagicEPage({ n }) {
  return <Sheet n={n} arts={['🪁', '🎂']} title="Magic E — ה־e הקסומה" en="Phonics: a_e · i_e · o_e · u_e">
    <Rule title="Magic E" e="⭐">
      כשיש <b>e</b> בסוף המילה, היא לא נשמעת — אבל היא "מכשפת" את התנועה שלפניה, וזו אומרת את <b>השם</b> שלה באלף־בית:
      <RuleTable head={['without e', 'with magic e', 'the vowel says']} rows={[['cap', '**cape**', 'a → "ei"'], ['kit', '**kite**', 'i → "ai"'], ['hop', '**hope**', 'o → "ou"'], ['cub', '**cube**', 'u → "iu"']]} />
    </Rule>
    <Sec k="A" he="מוסיפים e, כותבים את המילה החדשה וקוראים את שתיהן" en="Add magic e">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3mm 3mm', fontSize: '13pt', padding: '0 1mm', whiteSpace: 'nowrap' }}>
        {MAGIC.map(([w]) => <div key={w}><b>{w}</b> + e = <Blank n={3} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="B" he="משלימים את התנועות החסרות (בכל מילה יש magic e)" en="Write the missing letters">
      <PicFill items={MAGIC_PICS.map(([e, s, , text]) => ({ e, s, text }))} cols={4} mm={12} size="14pt" />
    </Sec>
    <Sec k="C" he="קוראים ומקיפים את המילה הנכונה" en="Circle the right word">
      <Items items={MAGIC_CIRCLE.map(m => m[0])} cols={2} size="12.5pt" />
    </Sec>
    <Sec k="D" he="קוראים ומציירים (גם כאן יש magic e!)" en="Read and draw">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm' }}>
        {['a cake with five candles', 'a white kite in the sky'].map(s => <div key={s} style={{ border: `0.5mm dashed ${C}`, borderRadius: '3mm', height: '34mm', padding: '1mm 2mm', fontSize: '13pt', fontWeight: 700, textAlign: 'left' }}>{s}</div>)}
      </div>
    </Sec>
  </Sheet>
}

function BePage({ n }) {
  return <Sheet n={n} arts={['🙋', '👋']} title="הפועל to be: am, is, are" en="Grammar: the verb to be">
    <Rule>
      <RuleTable head={['', '✓ positive', '✗ negative', '? question']} rows={[
        ['I', 'I **am** (I\'m)', 'I **am not** (I\'m not)', '**Am** I …?'],
        ['he / she / it', 'she **is** (she\'s)', 'she **is not** (isn\'t)', '**Is** she …?'],
        ['we / you / they', 'we **are** (we\'re)', 'we **are not** (aren\'t)', '**Are** we …?'],
      ]} />
      <div>תשובה קצרה: <En><b>Is he happy? — Yes, he is. / No, he isn't.</b></En></div>
    </Rule>
    <Sec k="A" he="משלימים am, is או are" en="Write am, is or are">
      <Items items={BE.map(b => b[0])} cols={2} size="13pt" gap="3.4mm" />
    </Sec>
    <Sec k="B" he="הופכים לשלילה" en="Make it negative">
      <Items items={BE_NEG.map(b => b[0])} size="13pt" gap="3.4mm" />
    </Sec>
    <Sec k="C" he="עונים בתשובה קצרה" en="Short answers">
      <Items items={BE_SHORT.map(b => b[0])} size="13pt" gap="3.4mm" />
    </Sec>
    <Tip e="🧠">טיפ: <En><b>you</b></En> תמיד הולך עם <En><b>are</b></En> — גם כשמדברים אל ילד אחד: <En>You are my friend.</En></Tip>
  </Sheet>
}

function HaveGotPage({ n }) {
  const td = { border: `1px solid ${C}`, padding: '0.6mm', textAlign: 'center' }
  return <Sheet n={n} arts={['🐶', '🚲']} title="have got / has got" en="Grammar: What have you got?">
    <Rule>
      ב־<En><b>he / she / it</b></En> אומרים <En><b>has got</b></En>, ובכל השאר <En><b>have got</b></En>.
      <RuleTable rows={[
        ['I / you / we / they **have got** (\'ve got)', 'I **haven\'t got** a cat.', '**Have** you **got** a dog? Yes, I **have**. / No, I **haven\'t**.'],
        ['he / she / it **has got** (\'s got)', 'She **hasn\'t got** a bike.', '**Has** he **got** a ball? Yes, he **has**. / No, he **hasn\'t**.'],
      ]} />
    </Rule>
    <Sec k="A" he="מסתכלים בטבלה ומשלימים" en="Look at the table and complete">
      <table dir="ltr" style={{ width: '74%', margin: '0 auto 1.5mm', borderCollapse: 'collapse', fontSize: '13pt' }}>
        <thead><tr><th style={td} />{HAVE_PICS.map(([e, w]) => <th key={w} style={td}><Art e={e} mm={9} /><div style={{ fontSize: '10pt' }}>{w}</div></th>)}</tr></thead>
        <tbody>{KIDS.map(([name, has]) => <tr key={name}><th style={{ ...td, background: '#e8f5f7' }}>{name}</th>{has.map((h, i) => <td key={i} style={{ ...td, fontSize: '15pt', fontWeight: 800, color: h ? '#2e7d32' : '#c62828' }}>{h ? '✓' : '✗'}</td>)}</tr>)}</tbody>
      </table>
      <Items items={HAVE.map(h => h[0])} size="13pt" gap="2.2mm" />
    </Sec>
    <Sec k="B" he="ומה איתי? כותבים שני משפטים" en="Write about you">
      <Lines k={2} h={9} lead="I have got ______________________ ." />
    </Sec>
  </Sheet>
}

function PluralPage({ n }) {
  return <Sheet n={n} arts={['🍎', '🐱']} title="רבים, this ו־that" en="Grammar: plurals · this / that / these / those">
    <Rule title="Plurals" e="🍎">
      <RuleTable rows={[
        ['+ s', 'book → book**s**, cat → cat**s**, toy → toy**s**'],
        ['+ es (after s, x, sh, ch)', 'bus → bus**es**, box → box**es**, dish → dish**es**, watch → watch**es**'],
        ['consonant + y → ies', 'baby → bab**ies**, story → stor**ies**'],
        ['special!', 'man → **men**, woman → **women**, child → **children**, foot → **feet**, tooth → **teeth**, mouse → **mice**, sheep → **sheep**'],
      ]} />
    </Rule>
    <Sec k="A" he="כותבים ברבים" en="Write the plural">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.6mm 4mm', fontSize: '13pt', padding: '0 2mm', whiteSpace: 'nowrap' }}>
        {PLURALS.map(([w], i) => <div key={w}><b style={{ color: C }}>{i + 1}.</b> {w} → <Blank n={5} /></div>)}
      </EnBlock>
    </Sec>
    <Rule title="this · that · these · those" e="⭐">
      <RuleTable head={['', 'one (אחד)', 'many (הרבה)']} rows={[['near (קרוב)', '**this** cat', '**these** cats'], ['far (רחוק)', '**that** cat', '**those** cats']]} />
    </Rule>
    <Sec k="B" he="קרוב או רחוק? אחד או הרבה? משלימים" en="Write this, that, these or those">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2mm' }}>
        {NEAR_FAR.map(([e, k, near, s], i) => <div key={i} style={{ border: '0.45mm dashed #a9d9e2', borderRadius: '3mm', padding: '1mm 2mm', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '13mm' }}>
            <span>{Array.from({ length: k }, (_, j) => <Art key={j} e={e} mm={near ? 12 : 6} />)}</span>
            <span style={{ fontSize: '9pt', fontWeight: 700, color: near ? C : '#b8432a' }}>{near ? 'near · קרוב' : 'far · רחוק'}</span>
          </div>
          <div style={{ fontSize: '13pt', whiteSpace: 'nowrap' }}><b>{i + 1}.</b> <T s={s} /></div>
        </div>)}
      </div>
    </Sec>
  </Sheet>
}

function PresentSimplePage({ n }) {
  return <Sheet n={n} arts={['⏰', '🎒']} title="Present Simple — הווה פשוט" en="Grammar: things we do every day">
    <Rule>
      <RuleTable rows={[
        ['I / you / we / they **play**', 'I **don\'t** play', '**Do** you play? Yes, I **do**. / No, I **don\'t**.'],
        ['he / she / it **plays** (+s!)', 'she **doesn\'t** play', '**Does** she play? Yes, she **does**. / No, she **doesn\'t**.'],
      ]} />
      <div>שימו לב לאיות: <En><b>watch → watches, go → goes, do → does, fly → flies, have → has</b></En></div>
    </Rule>
    <Sec k="A" he="היום של נועה: כותבים את הפועל בצורה הנכונה" en="Noa's day — write the verb">
      <Passage title="Noa's Day" arts={['👧', '⏰']} size="13pt">
        <div style={{ lineHeight: 2.1 }}>
          <T s="Noa _______ (get) up at seven o'clock. She _______ (brush) her teeth and _______ (eat) breakfast. Her brother Ido _______ (go) to school by bus, but Noa _______ (walk). After school, they _______ (play) in the park. In the evening, Noa _______ (watch) TV and Ido _______ (do) his homework. They _______ (go) to bed at nine." />
        </div>
      </Passage>
    </Sec>
    <Sec k="B" he="הופכים לשלילה עם don't או doesn't" en="Make it negative">
      <Items items={PS_NEG.map(p => p[0])} size="13pt" gap="3mm" />
    </Sec>
    <Sec k="C" he="משלימים Do או Does" en="Write Do or Does">
      <Items items={PS_Q.map(p => p[0])} cols={2} size="13pt" gap="3mm" />
    </Sec>
  </Sheet>
}

function CanPage({ n }) {
  return <Sheet n={n} arts={['🐸', '🐦']} title="can / can't — יכול / לא יכול" en="Grammar: What can animals do?">
    <Rule>
      אחרי <En><b>can</b></En> בא פועל רגיל, בלי s, עם כל הגופים: <En><b>She can swim.</b></En> (לא <En>cans / swims</En>).
      <RuleTable rows={[['✓ I **can** swim.', '✗ He **can\'t** (cannot) fly.', '? **Can** you jump? — Yes, I **can**. / No, I **can\'t**.']]} />
    </Rule>
    <Sec k="A" he="מה החיה יכולה לעשות? כותבים can או can't" en="Write can or can't">
      <PicFill items={CAN.map(([e, s]) => ({ e, s }))} cols={2} mm={14} size="14pt" ls="" />
    </Sec>
    <Sec k="B" he="עונים על השאלות על עצמך" en="Answer about you">
      <Items items={['Can you swim? ______________', 'Can you ride a bike? ______________', 'Can you play the guitar? ______________', 'Can you speak English? ______________']} cols={2} size="12.5pt" gap="3.4mm" />
    </Sec>
    <Sec k="C" he="משפט אחד על מה שאני יכול/ה, ומשפט על מה שעוד לא" en="I can … but I can't …">
      <Lines k={2} h={10} lead="I can _________, but I can't _________." />
    </Sec>
  </Sheet>
}

// Small "box and ball" pictures for the prepositions.
function PrepIcon({ kind }) {
  const box = <rect x="22" y="22" width="36" height="28" fill="white" stroke="#111" strokeWidth="2" rx="2" />
  const ball = (x, y) => <circle cx={x} cy={y} r="8" fill="#f4a261" stroke="#111" strokeWidth="1.5" />
  const content = {
    in: <>{ball(40, 40)}<path d="M22 22 V50 H58 V22" fill="none" stroke="#111" strokeWidth="2" /></>,
    on: <>{box}{ball(40, 14)}</>,
    under: <><rect x="22" y="8" width="36" height="24" fill="white" stroke="#111" strokeWidth="2" rx="2" />{ball(40, 44)}</>,
    'next to': <><rect x="12" y="22" width="36" height="28" fill="white" stroke="#111" strokeWidth="2" rx="2" />{ball(62, 42)}</>,
    behind: <>{ball(40, 20)}<rect x="22" y="22" width="36" height="28" fill="white" stroke="#111" strokeWidth="2" rx="2" /></>,
    between: <><rect x="4" y="24" width="24" height="26" fill="white" stroke="#111" strokeWidth="2" rx="2" />{ball(40, 42)}<rect x="52" y="24" width="24" height="26" fill="white" stroke="#111" strokeWidth="2" rx="2" /></>,
  }[kind]
  return <div style={{ textAlign: 'center' }}>
    <svg viewBox="0 0 80 56" style={{ width: '20mm', height: '14mm', display: 'block', margin: '0 auto' }} aria-hidden="true"><path d="M2 51 H78" stroke="#bbb" />{content}</svg>
    <En style={{ fontWeight: 800, fontSize: '11pt' }}>{kind}</En>
  </div>
}

// The room for "there is / there are": every statement on the page matches this picture.
function Room() {
  const img = (e, x, y, s) => <image href={art(e)} x={x} y={y} width={s} height={s} />
  return <svg viewBox="0 0 600 270" style={{ width: '142mm', height: '64mm', display: 'block', margin: '0 auto', border: `0.5mm solid ${C}`, borderRadius: '3mm' }} role="img" aria-label="A room">
    <rect x="0" y="0" width="600" height="215" fill="#f3fafb" />
    <rect x="0" y="215" width="600" height="55" fill="#f6efe4" />
    <path d="M0 215 H600" stroke="#c9b8a0" strokeWidth="2" />
    {img('🪟', 250, 12, 86)}
    {img('🕒', 440, 20, 56)}
    {img('🛏️', 8, 92, 175)}
    {img('🐱', 72, 156, 54)}
    {img('🧸', 186, 186, 56)}
    <rect x="252" y="176" width="170" height="11" rx="3" fill="#a47148" />
    <rect x="262" y="187" width="10" height="70" fill="#a47148" /><rect x="402" y="187" width="10" height="70" fill="#a47148" />
    {img('🍎', 262, 142, 36)}{img('🍎', 296, 142, 36)}{img('🍎', 330, 142, 36)}
    {img('📚', 368, 128, 50)}
    {img('🐶', 282, 200, 58)}
    {img('⚽', 348, 222, 34)}
    {img('🪑', 428, 128, 120)}
    {img('🌻', 540, 168, 62)}
  </svg>
}

function ThereIsPage({ n }) {
  return <Sheet n={n} arts={['🛋️', '🧸']} title="there is / there are ומילות יחס" en="Grammar: In my room">
    <Rule>
      <div><En><b>There is</b> a cat.</En> (אחד) · <En><b>There are</b> two cats.</En> (הרבה) · <En><b>Is there</b> a dog? <b>Are there</b> books?</En></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '1mm', direction: 'ltr', marginTop: '1mm' }}>
        {['in', 'on', 'under', 'next to', 'behind', 'between'].map(k => <PrepIcon key={k} kind={k} />)}
      </div>
    </Rule>
    <Room />
    <Sec k="A" he="מסתכלים בתמונה: נכון (T) או לא נכון (F)?" en="True or False?">
      <TFItems items={ROOM_TF.map(([q]) => ({ q }))} cols={2} size="11.5pt" />
    </Sec>
    <Sec k="B" he="משלימים לפי התמונה" en="Complete">
      <Items items={ROOM_FILL.map(r => r[0])} cols={2} size="12.5pt" gap="2.5mm" />
    </Sec>
  </Sheet>
}

function MaxPage({ n }) {
  return <Sheet n={n} arts={['🐶', '📖']} title="קריאה: My Pet Max" en="Reading: unseen text">
    <Passage title="My Pet Max" arts={['🐶', '⚽']} size="12.5pt">
      Hi! My name is Tamar. I am nine years old, and I live in Haifa with my family. I have got a little brother, Yoni, and a dog. His name is Max. Max is brown and white. He has got big ears and a long tail.
      <div style={{ height: '1.5mm' }} />
      Max can run very fast, but he can't swim. Every morning, I give Max his food and water. After school, Yoni and I take Max to the park. He likes to play with his ball. At night, Max sleeps next to my bed. I love Max, and Max loves me!
    </Passage>
    <Sec k="A" he="מקיפים את התשובה הנכונה" en="Circle the right answer">
      <Choice items={MAX_MC} cols={2} />
    </Sec>
    <Sec k="B" he="נכון או לא נכון?" en="True or False?">
      <TFItems items={MAX_TF.map(([q]) => ({ q }))} start={5} />
    </Sec>
    <Sec k="C" he="עונים במשפט מלא" en="Answer the questions">
      <Open items={[...MAX_OPEN.map(([q]) => ({ q })), { q: 'Have you got a pet? What is its name? (No pet? Which pet do you want?)' }]} start={8} />
    </Sec>
  </Sheet>
}

function RainyPage({ n }) {
  return <Sheet n={n} arts={['🌧️', '🎂']} title="קריאה: A Rainy Day" en="Reading: unseen text">
    <Passage title="A Rainy Day" arts={['🌧️', '🍫']} size="12.5pt">
      Today is Saturday. It is cold and rainy, so Ben and his sister Lily can't go to the park. They are at home with their grandma.
      <div style={{ height: '1.5mm' }} />
      Grandma has got a good idea. "Let's make a cake!" she says. Lily gets the eggs, the milk and the flour. Ben mixes everything in a big bowl. Then Grandma puts the cake in the oven.
      <div style={{ height: '1.5mm' }} />
      The cake is ready at four o'clock. It's a chocolate cake! Ben and Lily eat the cake with Grandma and drink hot chocolate. "This is the best rainy day!" says Ben.
    </Passage>
    <Sec k="A" he="מקיפים את התשובה הנכונה, ועונים" en="Circle and answer">
      <Choice items={RAIN_MC} cols={2} />
      <Open items={[{ q: 'Why can\'t Ben and Lily go to the park?' }]} start={3} />
    </Sec>
    <Sec k="B" he="נכון או לא נכון?" en="True or False?">
      <TFItems items={RAIN_TF.map(([q]) => ({ q }))} start={4} />
    </Sec>
    <Sec k="C" he="ממספרים לפי סדר הסיפור (1–4)" en="Put in order">
      <EnBlock style={{ fontSize: '12pt', padding: '0 2mm', fontWeight: 700 }}>7.</EnBlock>
      <EnBlock style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8mm 5mm', fontSize: '12pt', padding: '0 2mm' }}>
        {RAIN_ORDER.map(([s]) => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}><span style={{ flex: 'none', width: '7mm', height: '7mm', border: '1.4px solid #111', borderRadius: '1.5mm' }} />{s}</div>)}
      </EnBlock>
    </Sec>
    <Open items={[{ q: 'What do you like to do on a rainy day?' }]} start={8} />
  </Sheet>
}

function CrosswordPage({ n }) {
  return <Sheet n={n} arts={['✏️', '🪁']} title="תשבץ תמונות" en="Picture Crossword">
    <Tip e="🔑">מסתכלים על כל תמונה, אומרים את שמה באנגלית וכותבים אות אחת בכל משבצת. המספר ליד התמונה הוא המספר בתשבץ.</Tip>
    <Crossword words={CROSS} maxW={176} maxH={140} />
  </Sheet>
}

function DictationPage({ n }) {
  return <Sheet n={n} arts={['✏️', '👂']} title="הכתבה ואיות" en="Spelling and Dictation">
    <Sec k="A" he="מסתכלים, אומרים, מכסים, כותבים ובודקים" en="Look, say, cover, write, check">
      <SpellTable words={['family', 'friend', 'school', 'teacher', 'house', 'because']} />
    </Sec>
    <Sec k="B" he="הכתבה: מבוגר מקריא, ואני כותב/ת" en="Dictation">
      <Dictation words={['ship', 'cheese', 'three', 'fish', 'lunch', 'cake', 'bike', 'nose', 'kite', 'home']} sentences={['I have got a little sister.', 'There are two cats on the bed.']} />
    </Sec>
  </Sheet>
}

function WritingPage({ n }) {
  const lines = ['My name is ______________.', 'I am ______ years old.', 'I live in ______________.', 'I have got ______________.', 'My favorite color is ____________.', 'I can ________, but I can\'t ________.', 'I like ________ and ________.']
  return <Sheet n={n} arts={['🙋', '✏️']} title="כתיבה: All About Me" en="Writing: All About Me">
    <Sec k="A" he="משלימים את המשפטים ומציירים את עצמי" en="Complete and draw">
      <div style={{ display: 'flex', gap: '4mm', alignItems: 'stretch' }}>
        <div style={{ flex: '0 0 46mm', border: `0.7mm solid ${C}`, borderRadius: '4mm', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '2mm' }}>
          <En style={{ fontWeight: 800, color: C }}>This is me!</En>
          <div style={{ fontSize: '9.5pt', color: '#666' }}>מציירים את עצמי</div>
        </div>
        <EnBlock style={{ flex: 1, fontSize: '13pt', lineHeight: 2.2 }}>{lines.map(l => <div key={l}><T s={l} /></div>)}</EnBlock>
      </div>
    </Sec>
    <Sec k="B" he="כותבים 4 משפטים על חבר/ה או על מישהו מהמשפחה" en="Write about a friend or a family member">
      <WordBank words={['He / She is …', 'He / She has got …', 'He / She can …', 'He / She likes …']} title="Use" />
      <Lines k={5} h={10} />
    </Sec>
    <Tip e="⭐">בודקים: אות גדולה בתחילת משפט ובשמות (<En>Dan, Haifa</En>), נקודה בסוף, ו־<En>I</En> תמיד באות גדולה.</Tip>
  </Sheet>
}

function Test1Page({ n }) {
  return <Sheet n={n} arts={['⭐', '✏️']} title="מבחן מסכם (1)" en="Final Test — Part 1">
    <ScoreBox />
    <Sec k="1" he="מקיפים את המילה שמתאימה לתמונה" en="Circle the word" pts={10}>
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2mm' }}>
        {TEST_PICS.map(([e, opts]) => <div key={e} style={{ border: '0.45mm solid #a9d9e2', borderRadius: '3mm', textAlign: 'center', padding: '1mm' }}>
          <Art e={e} mm={14} /><div style={{ fontSize: '12pt', fontWeight: 700, lineHeight: 1.5 }}>{opts.map(o => <div key={o}>{o}</div>)}</div>
        </div>)}
      </div>
    </Sec>
    <Sec k="2" he="משלימים am, is או are" en="Write am, is or are" pts={12}>
      <Items items={TEST_BE.map(t => t[0])} cols={2} size="12.5pt" gap="2.4mm" />
    </Sec>
    <Sec k="3" he="משלימים have / has / haven't" en="have got / has got" pts={8}>
      <Items items={TEST_HAVE.map(t => t[0])} cols={2} size="12.5pt" gap="2.4mm" />
    </Sec>
    <Sec k="4" he="כותבים ברבים" en="Write the plural" pts={10}>
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.4mm 4mm', fontSize: '13pt', padding: '0 2mm', whiteSpace: 'nowrap' }}>
        {TEST_PL.map(([w], i) => <div key={w}><b>{i + 1}.</b> {w} → <Blank n={5} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="5" he="מקיפים את הצורה הנכונה" en="Circle" pts={12}>
      <Items items={TEST_PS.map(t => t[0])} cols={2} size="12.5pt" gap="2.4mm" />
    </Sec>
  </Sheet>
}

function Test2Page({ n }) {
  return <Sheet n={n} arts={['⭐', '✏️']} title="מבחן מסכם (2)" en="Final Test — Part 2">
    <Sec k="6" he="משלימים את המשפטים" en="Complete" pts={12}>
      <Items items={TEST_MIX.map(t => t[0])} cols={2} size="12pt" gap="2.2mm" />
    </Sec>
    <Sec k="7" he="קוראים ועונים" en="Read and answer" pts={20}>
      <Passage title="Sam's Week" arts={['⚽', '📚']} size="12pt">
        Sam is ten years old. He lives in Eilat, near the sea. On Mondays and Wednesdays, he plays football with his team. On Tuesdays, he goes to the library with his mom. On Thursdays, he swims in the sea with his dad. On Fridays, Sam visits his grandpa. They play chess, and Grandpa always wins!
      </Passage>
      <Open items={SAM.map(([q]) => ({ q }))} />
      <TFItems items={SAM_TF.map(([q]) => ({ q }))} start={4} cols={2} size="11.5pt" />
    </Sec>
    <Sec k="8" he="כותבים 4 משפטים על המשפחה שלי" en="Write about your family" pts={16}>
      <WordBank words={['I have got …', 'My … is …', 'He / She can …', 'We like …']} title="Ideas" />
      <Lines k={4} h={8.5} />
    </Sec>
  </Sheet>
}

export default function EnglishGrade4Booklet() {
  const mc = items => items.map(i => i.a)
  return <EnglishTheme grade={4}>
    <EnglishCover grade={4} title="חוברת אנגלית לכיתה ד׳" arts={['👪', '🧥', '🐶', '🌧️', '📚']} pages={PAGES}
      skills={[['📚', 'אוצר מילים', 'Vocabulary'], ['👂', 'צלילים ואיות', 'Phonics'], ['🧠', 'דקדוק', 'Grammar'], ['📖', 'הבנת הנקרא', 'Reading'], ['✏️', 'כתיבה', 'Writing']]}
      note="עמוד אחד או שניים בכל פעם. בכל עמוד דקדוק יש תיבת הסבר בעברית — קוראים אותה יחד לפני התרגול. ההוראות כתובות בעברית ובאנגלית, כדי להתרגל גם להוראות של המבחנים בבית הספר. בעמוד 15 יש הכתבה (את רצועת המילים מקפלים לפני שמתחילים), בעמודים 17–18 מבחן מסכם, ובסוף דף תשובות ותעודה." />
    <FamilyPage n={2} />
    <ClothesPage n={3} />
    <DigraphPage n={4} />
    <MagicEPage n={5} />
    <BePage n={6} />
    <HaveGotPage n={7} />
    <PluralPage n={8} />
    <PresentSimplePage n={9} />
    <CanPage n={10} />
    <ThereIsPage n={11} />
    <MaxPage n={12} />
    <RainyPage n={13} />
    <CrosswordPage n={14} />
    <DictationPage n={15} />
    <WritingPage n={16} />
    <Test1Page n={17} />
    <Test2Page n={18} />
    <KeyPage n={19} size="9pt" sections={[
      { title: 'עמוד 2 — B', answers: ans(WHO) },
      { title: 'עמוד 3 — A', answers: ans(WEAR) },
      { title: 'עמוד 3 — B', answers: WEATHER.map(w => `It's ${w[1]}.`) },
      { title: 'עמוד 4 — A', answers: DIGRAPHS.map(d => d[2]) },
      { title: 'עמוד 4 — B', letters: true, answers: ['sh: fish, she, wash', 'ch: lunch, teacher, much', 'th: think, mother, thank'] },
      { title: 'עמוד 5 — A', answers: ans(MAGIC) },
      { title: 'עמוד 5 — B', answers: MAGIC_PICS.map(m => m[2]) },
      { title: 'עמוד 5 — C', answers: ans(MAGIC_CIRCLE) },
      { title: 'עמוד 6 — A', answers: ans(BE) },
      { title: 'עמוד 6 — B', answers: ans(BE_NEG) },
      { title: 'עמוד 6 — C', answers: ans(BE_SHORT) },
      { title: 'עמוד 7 — A', answers: ans(HAVE) },
      { title: 'עמוד 8 — A', answers: ans(PLURALS) },
      { title: 'עמוד 8 — B', answers: NEAR_FAR.map(x => x[4]) },
      { title: 'עמוד 9 — A (Noa\'s Day)', answers: ans(NOA) },
      { title: 'עמוד 9 — B', answers: ans(PS_NEG) },
      { title: 'עמוד 9 — C', answers: ans(PS_Q) },
      { title: 'עמוד 10 — A', answers: CAN.map(c => c[2]) },
      { title: 'עמוד 11 — A', answers: ROOM_TF.map(r => r[1]) },
      { title: 'עמוד 11 — B', answers: ans(ROOM_FILL) },
      { title: 'עמוד 12 — My Pet Max', answers: [...mc(MAX_MC), ...MAX_TF.map(x => x[1]), ...MAX_OPEN.map(x => x[1]), 'תשובה אישית'] },
      { title: 'עמוד 13 — A Rainy Day', answers: [...mc(RAIN_MC), 'Because it is cold and rainy.', ...RAIN_TF.map(x => x[1]), 'Order: 3, 1, 4, 2', 'תשובה אישית'] },
      { title: 'עמוד 14 — תשבץ', letters: true, answers: crosswordAnswers(CROSS) },
      { title: 'מבחן — 1', answers: TEST_PICS.map(t => t[2]) },
      { title: 'מבחן — 2', answers: ans(TEST_BE) },
      { title: 'מבחן — 3', answers: ans(TEST_HAVE) },
      { title: 'מבחן — 4', answers: ans(TEST_PL) },
      { title: 'מבחן — 5', answers: ans(TEST_PS) },
      { title: 'מבחן — 6', answers: ans(TEST_MIX) },
      { title: 'מבחן — 7 (4 נק׳ לכל שאלה)', answers: [...SAM.map(s => s[1]), ...SAM_TF.map(s => s[1])] },
    ]} />
    <EnglishCertificate grade={4} booklet="חוברת האנגלית לכיתה ד׳" done="למדתי מילים חדשות, צלילים ודקדוק, קראתי סיפורים באנגלית וכתבתי עליי ועל המשפחה שלי." />
  </EnglishTheme>
}

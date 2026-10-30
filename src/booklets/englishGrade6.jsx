import { crosswordAnswers } from './englishCrossword'
import { Art, Blank, Cards, Choice, Crossword, Dictation, En, EnBlock, EnglishCertificate, EnglishCover, EnglishTheme, Items, KeyPage, Lines, Open, Passage, PicFill, Rule, RuleTable, ScoreBox, Sec, Sheet, SpellTable, T, TFItems, Tip, WordBank } from './englishKit'
import { bookletBySlug } from './registry'

// "חוברת אנגלית לכיתה ו׳" — Foundation level, end of primary school: picture vocabulary (travel,
// nature and the environment), -ed spelling and sounds, silent letters and igh, past simple (regular
// and irregular), will / going to, much / many / some / any, superlatives, connectors, two unseen texts
// (a story and a fact text about the Dead Sea), a past-tense crossword, dictation, a guided story,
// a two-page final test, answers and a certificate.
const PAGES = bookletBySlug('english-grade-6').pages
const C = '#b8432a', SOFT = '#fcefea', MID = '#efbdae'
const ans = list => list.map(x => x[x.length - 1])

// ---------- Vocabulary ----------
const TRAVEL = [
  ['✈️', 'airplane', 'מטוס'], ['🚢', 'ship', 'אונייה'], ['🚆', 'train', 'רכבת'], ['🚁', 'helicopter', 'מסוק'], ['🗺️', 'map', 'מפה'], ['🏖️', 'beach', 'חוף'],
  ['⛰️', 'mountain', 'הר'], ['🌵', 'desert', 'מדבר'], ['🌳', 'forest', 'יער'], ['🏰', 'castle', 'טירה'], ['🌊', 'sea', 'ים'], ['🐫', 'camel', 'גמל'],
].map(([e, en, he]) => ({ e, en, he }))
const TRAVEL_FILL = [
  ['There are many tall trees in a ________.', 'forest'], ['It is very hot and dry in the ________, and there is a lot of sand.', 'desert'],
  ['A ________ is a very big boat.', 'ship'], ['A long time ago, kings and queens lived in a ________.', 'castle'],
  ['Use a ________ when you don\'t know the way.', 'map'], ['People call the ________ "the ship of the desert".', 'camel'],
]
const ODD = [['[airplane|ship|train|castle]', 'castle'], ['[mountain|forest|desert|ticket]', 'ticket'], ['[beach|sea|sand|snow]', 'snow'], ['[camel|lion|monkey|helicopter]', 'helicopter'], ['[January|Monday|Friday|Sunday]', 'January'], ['[doctor|nurse|hospital|teacher]', 'hospital']]

const NATURE = [
  ['🌳', 'tree', 'עץ'], ['🌻', 'flower', 'פרח'], ['🍂', 'leaf', 'עלה'], ['🦋', 'butterfly', 'פרפר'], ['🐝', 'bee', 'דבורה'], ['🐦', 'bird', 'ציפור'],
  ['☀️', 'sun', 'שמש'], ['☁️', 'cloud', 'ענן'], ['🌈', 'rainbow', 'קשת'], ['💧', 'water', 'מים'], ['🗑️', 'trash can', 'פח'], ['💡', 'light', 'אור, מנורה'],
].map(([e, en, he]) => ({ e, en, he }))
const PLANET = [['💡', '______ off the lights when you leave a room.', 'Turn'], ['🗑️', '______ paper, bottles and cans.', 'Recycle'], ['🌳', '______ a tree in your garden.', 'Plant'], ['💧', '______ water: close the tap when you brush your teeth.', 'Save'], ['🚲', '______ a bike or walk — don\'t always go by car.', 'Ride'], ['🏖️', '______ up the trash on the beach.', 'Pick']]

// ---------- Spelling and sounds ----------
const ED = [['like', 'liked'], ['stop', 'stopped'], ['study', 'studied'], ['play', 'played'], ['carry', 'carried'], ['plan', 'planned'], ['dance', 'danced'], ['walk', 'walked']]
const ED_SOUND = ['jumped', 'cleaned', 'needed', 'cooked', 'opened', 'visited', 'watched', 'lived', 'started', 'helped', 'rained', 'painted']
const SILENT = [['knee', 'k'], ['know', 'k'], ['knock', 'k'], ['write', 'w'], ['wrong', 'w'], ['wrist', 'w'], ['climb', 'b'], ['thumb', 'b'], ['lamb', 'b'], ['hour', 'h'], ['island', 's'], ['listen', 't']]
const IGH = [['🌙', 'Good n___t!', 'night'], ['💡', 'Turn off the l___t, please.', 'light'], ['⛰️', 'The mountain is very h___.', 'high'], ['✈️', 'Our fl___t to Rome is at six.', 'flight'], [null, 'Is this answer r___t or wrong?', 'right', '✓'], ['☀️', 'The sun is very br___t today.', 'bright']]

// ---------- Grammar ----------
const SUMMER = [['visit', 'visited'], ['stay', 'stayed'], ['play', 'played'], ['want', 'wanted'], ['join', 'joined'], ['miss', 'missed'], ['not / worry', 'didn\'t worry']]
const PAST_NQ = [['She cleaned her room. (✗) → ______________', 'She didn\'t clean her room.'], ['They watched a film. (?) → ______________', 'Did they watch a film?'], ['He played football yesterday. (✗) → ______________', 'He didn\'t play football yesterday.'], ['You walked to school. (?) → ______________', 'Did you walk to school?']]

// Irregular verbs: [base, past, Hebrew, which form is hidden: 0 none, 1 past, 2 base]
const IRREG = [
  ['go', 'went', 'ללכת', 0], ['see', 'saw', 'לראות', 0], ['eat', 'ate', 'לאכול', 1], ['drink', 'drank', 'לשתות', 0], ['buy', 'bought', 'לקנות', 1], ['write', 'wrote', 'לכתוב', 1], ['swim', 'swam', 'לשחות', 2], ['run', 'ran', 'לרוץ', 0],
  ['sleep', 'slept', 'לישון', 1], ['find', 'found', 'למצוא', 0], ['think', 'thought', 'לחשוב', 1], ['know', 'knew', 'לדעת', 2], ['sit', 'sat', 'לשבת', 0], ['fly', 'flew', 'לעוף', 1], ['win', 'won', 'לנצח', 2], ['lose', 'lost', 'להפסיד', 0],
  ['take', 'took', 'לקחת', 2], ['give', 'gave', 'לתת', 1], ['come', 'came', 'לבוא', 0], ['make', 'made', 'להכין', 0], ['get', 'got', 'לקבל', 0], ['say', 'said', 'להגיד', 1], ['do', 'did', 'לעשות', 0], ['have', 'had', 'יש ל־', 0],
]
const IDO = [['get', 'got'], ['eat', 'ate'], ['drink', 'drank'], ['go', 'went'], ['swim', 'swam'], ['have', 'had'], ['see', 'saw'], ['write', 'wrote']]

const MAYA_PLANS = [['visit her cousins in Haifa', 'Maya is going to visit her cousins in Haifa.'], ['learn to surf', 'Maya is going to learn to surf.'], ['read three books', 'Maya is going to read three books.'], ['go to summer camp', 'Maya is going to go to summer camp.']]
const FUTURE = [
  ['I\'m thirsty. — Wait, I [will|am going to] get you some water!', 'will'], ['We bought tickets. We [will|are going to] fly to Rome next week.', 'are going to'],
  ['I think robots [will|are going to] clean our houses in the future.', 'will'], ['Look at those black clouds! It [will|is going to] rain.', 'is going to'],
  ['Don\'t worry, I [won\'t|am not going to] tell anyone. I promise!', 'won\'t'], ['Dad has the paint and the brushes. He [will|is going to] paint my room.', 'is going to'],
]

const FOODS = [['🍎', 'apples'], ['🥛', 'milk'], ['🥚', 'eggs'], ['🧀', 'cheese'], ['🍪', 'cookies'], ['🍞', 'bread'], ['🍌', 'bananas'], ['💧', 'water'], ['🥕', 'carrots'], ['🍚', 'rice'], ['🍅', 'tomatoes'], ['🧃', 'juice']]
const HOW_MUCH = [['How ______ eggs do we need?', 'many'], ['How ______ milk is in the fridge?', 'much'], ['How ______ money have you got?', 'much'], ['How ______ children are in your class?', 'many'], ['How ______ water do you drink every day?', 'much']]
const SHOP = [['Mom', 'We haven\'t got ______ milk. Let\'s buy ______ bread, too.', 'any … some'], ['Ben', 'Have we got ______ eggs?', 'any'], ['Mom', 'Yes, we\'ve got ______ eggs, but we haven\'t got ______ cheese.', 'some … any'], ['Ben', 'Can I buy ______ cookies, please?', 'some']]

const SUPER_TABLE = [['cold', 'colder', '', 'the coldest'], ['big', '', 'the biggest', 'bigger'], ['funny', 'funnier', '', 'the funniest'], ['good', '', '', 'better · the best'], ['bad', 'worse', '', 'the worst'], ['interesting', 'more interesting', '', 'the most interesting'], ['hot', '', '', 'hotter · the hottest'], ['happy', '', 'the happiest', 'happier']]
const RECORDS = [['', 'The cheetah is ________ (fast) land animal in the world.', 'the fastest'], ['🐋', 'The blue whale is ________ (big) animal in the world.', 'the biggest'], ['⛰️', 'Mount Everest is ________ (high) mountain in the world.', 'the highest'], ['🌊', 'The Dead Sea is ________ (low) place on land in the world.', 'the lowest'], ['🦒', 'The giraffe is ________ (tall) animal in the world.', 'the tallest'], ['', 'Jerusalem is ________ (big) city in Israel.', 'the biggest']]
const COMP_SUP = [['My bag is ________ (heavy) than your bag.', 'heavier'], ['This is ________ (good) day of my life!', 'the best'], ['Tom is ________ (tall) boy in our class.', 'the tallest'], ['For me, math is ________ (difficult) than art.', 'more difficult']]

const CONNECT = [['I like tea, ______ I don\'t like coffee.', 'but'], ['It was very hot, ______ we went to the pool.', 'so'], ['Do you want pizza ______ pasta?', 'or'], ['She is happy ______ it\'s her birthday.', 'because'], ['I have a dog ______ a cat.', 'and'], ['He was tired, ______ he didn\'t stop running.', 'but'], ['We stayed at home ______ it was raining.', 'because'], ['The test was easy, ______ everyone passed.', 'so']]
const SANDWICH = [['🍞', '______, take two slices of bread.', 'First'], ['🧀', '______, put some cheese on one slice.', 'Then'], ['🍅', '______, add tomato and cucumber.', 'Next'], ['🍽️', '______, put the second slice on top — and eat!', 'Finally']]
const JOIN = [['I was hungry. I ate a sandwich. (so) → ______________', 'I was hungry, so I ate a sandwich.'], ['I ate a sandwich. I was hungry. (because) → ______________', 'I ate a sandwich because I was hungry.']]

// ---------- Reading ----------
const BOTTLE_MC = [{ q: 'Where did Lior find the bottle?', options: ['in the park', 'on the beach', 'in the hotel'], a: 'b' }, { q: 'What was inside the bottle?', options: ['a map', 'a piece of paper', 'a toy'], a: 'b' }]
const BOTTLE_OPEN = [['Where does Emma live?', 'In Cyprus.'], ['What did Lior do after he read the message?', 'He ran back to the hotel and showed it to his parents.'], ['Why was Emma surprised?', 'Because her bottle crossed the sea all the way to Israel.']]
const BOTTLE_TF = [['Lior wrote a letter to Emma.', 'F — he wrote an email'], ['Emma answered two days later.', 'T'], ['Emma threw the bottle on her birthday.', 'T']]
const BOTTLE_END = [['Find the past of: see ____ run ____ write ____ throw ____', 'saw, ran, wrote, threw'], ['What is going to happen next summer?', 'Emma\'s family is going to visit Israel.']]

const SEA_MC = [{ q: 'Where is the Dead Sea?', options: ['in the north of Israel', 'in the east of Israel', 'in Eilat'], a: 'b' }]
const SEA_OPEN = [['Why can\'t fish live in the Dead Sea?', 'Because the water is too salty.'], ['What happens when you go into the water?', 'You float.'], ['The water is almost ______ times saltier than ocean water.', 'ten']]
const SEA_TF = [['Not many tourists visit the Dead Sea.', 'F — many tourists visit it'], ['The Dead Sea is getting bigger.', 'F — it is getting smaller'], ['Tourists put black mud on their bodies.', 'T']]
const SEA_END = [['Find a superlative in the text.', 'the lowest'], ['Find two comparatives in the text.', 'saltier, smaller'], ['Would you like to visit the Dead Sea? Why? (use because)', 'תשובה אישית']]

const CROSS = [['went', 'ללכת — go'], ['saw', 'לראות — see'], ['bought', 'לקנות — buy'], ['thought', 'לחשוב — think'], ['swam', 'לשחות — swim'], ['wrote', 'לכתוב — write'], ['flew', 'לעוף — fly'], ['ate', 'לאכול — eat'], ['took', 'לקחת — take'], ['slept', 'לישון — sleep'], ['gave', 'לתת — give'], ['found', 'למצוא — find']].map(([word, clue]) => ({ word, clue }))

// ---------- Test ----------
const TEST_PICS = [['🗺️', ['map', 'mop', 'mat'], 'map'], ['⛰️', ['desert', 'mountain', 'forest'], 'mountain'], ['🌵', ['dessert', 'forest', 'desert'], 'desert'], ['✈️', ['ship', 'airplane', 'train'], 'airplane'], ['🏰', ['castle', 'hotel', 'tent'], 'castle']]
const TEST_PAST = [['Yesterday I ______ (go) to the cinema.', 'went'], ['She ______ (study) for the test.', 'studied'], ['We ______ (buy) a new car last year.', 'bought'], ['The car ______ (stop) at the red light.', 'stopped'], ['He ________ (not / eat) breakfast this morning.', 'didn\'t eat'], ['____ you ____ (see) the film?', 'Did … see'], ['I ______ (write) a letter to my aunt.', 'wrote'], ['The baby ______ (cry) all night.', 'cried']]
const TEST_FUT = [['Look at that boy! He [will|is going to] fall!', 'is going to'], ['I think you [will|are going to] love this book.', 'will'], ['We have tickets. We [will|are going to] see a concert tonight.', 'are going to'], ['"The phone is ringing." — "I [will|am going to] answer it."', 'will'], ['I promise I [will|am going to] call you.', 'will']]
const TEST_Q = [['How [much|many] apples do you want?', 'many'], ['There isn\'t [some|any] milk.', 'any'], ['I\'d like [some|any] water, please.', 'some'], ['How [much|many] time have we got?', 'much'], ['Are there [some|any] cookies in the box?', 'any']]
const TEST_SUP = [['Summer is [hotter|the hottest] than winter.', 'hotter'], ['This is [bigger|the biggest] room in the house.', 'the biggest'], ['Dan is [better|the best] player in the team.', 'the best'], ['A car is [faster|the fastest] than a bike.', 'faster'], ['Today is [colder|the coldest] day of the year.', 'the coldest']]
const TEST_CON = [['I was tired, [so|but] I slept.', 'so'], ['I like math, [and|but] not art.', 'but'], ['She stayed home [because|so] she was sick.', 'because'], ['Do you want juice [or|but] water?', 'or']]
const PHONE = [['Where was Yuval going?', 'To his grandmother\'s house.'], ['Why did he sleep on the bus?', 'Because he was very tired.'], ['How did Yuval call his phone?', 'From his grandmother\'s phone.'], ['Who found the phone?', 'A woman.']]
const PHONE_TF = [['Yuval got his phone back the same day.', 'F — the next morning']]

// ---------- Pages ----------
function TravelPage({ n }) {
  return <Sheet n={n} arts={['✈️', '🗺️']} title="טיולים וחופשות" en="Travel and Holidays">
    <Cards items={TRAVEL} cols={6} mm={14} />
    <Sec k="A" he="משלימים מילה מהכרטיסים" en="Complete with a word from the cards">
      <Items items={TRAVEL_FILL.map(t => t[0])} size="12.5pt" gap="2.2mm" />
    </Sec>
    <Sec k="B" he="מקיפים את המילה שלא שייכת לקבוצה" en="Odd one out">
      <Items items={ODD.map(o => o[0])} size="12.5pt" gap="1.8mm" />
    </Sec>
    <Sec k="C" he="לאן הייתי רוצה לטייל? כותבים משפט אחד" en="Where do you want to travel?">
      <Lines k={2} h={9} lead="I want to go to ________ because ______________ ." />
    </Sec>
  </Sheet>
}

function NaturePage({ n }) {
  return <Sheet n={n} arts={['🌳', '🦋']} title="טבע וסביבה" en="Nature and the Environment">
    <Cards items={NATURE} cols={6} mm={14} />
    <Sec k="A" he="שומרים על כדור הארץ: משלימים פועל ממחסן המילים" en="Save the planet!">
      <WordBank words={['Turn', 'Recycle', 'Plant', 'Save', 'Ride', 'Pick']} />
      <PicFill items={PLANET.map(([e, s]) => ({ e, s }))} cols={1} mm={10} size="13pt" ls="" />
    </Sec>
    <Sec k="B" he="ומה אני אעשה כדי לעזור? כותבים שני משפטים עם will" en="What will you do?">
      <Lines k={2} h={9.5} lead="I will ____________________ ." />
    </Sec>
  </Sheet>
}

function EdPage({ n }) {
  return <Sheet n={n} arts={['✏️', '👂']} title="איות: סיומת ed" en="Spelling and sounds: -ed endings">
    <Rule title="Spelling Box" e="✏️">
      <RuleTable rows={[
        ['most verbs **+ ed**', 'walk → walk**ed**, play → play**ed**', 'ends in e **+ d**', 'like → like**d**, dance → dance**d**'],
        ['consonant + y **→ ied**', 'study → stud**ied**, cry → cr**ied**', 'short vowel + consonant: **double**', 'stop → sto**pp**ed, plan → pla**nn**ed'],
      ]} />
      ל־ed שלושה צלילים: <En><b>/t/</b> jump<b>ed</b></En> · <En><b>/d/</b> clean<b>ed</b></En> · <En><b>/id/</b> want<b>ed</b></En> (אחרי t או d).
    </Rule>
    <Sec k="A" he="כותבים את הפועל בעבר" en="Write the past form">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2.6mm 6mm', fontSize: '13pt', padding: '0 2mm', whiteSpace: 'nowrap' }}>
        {ED.map(([w], i) => <div key={w}><b style={{ color: C }}>{i + 1}.</b> {w} → <Blank n={8} /></div>)}
      </EnBlock>
    </Sec>
    <Sec k="B" he="קוראים בקול וממיינים לפי הצליל של ed" en="Sort by sound: /t/, /d/ or /id/">
      <WordBank words={ED_SOUND} title="Words" />
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13pt', textAlign: 'center' }}>
        <thead><tr>{['/t/ — jumped', '/d/ — cleaned', '/id/ — wanted'].map(h => <th key={h} style={{ border: `1px solid ${C}`, background: SOFT, color: C, padding: '1mm' }}>{h}</th>)}</tr></thead>
        <tbody>{[0, 1, 2, 3].map(r => <tr key={r}>{[0, 1, 2].map(c => <td key={c} style={{ border: `1px solid ${C}`, height: '9.5mm' }} />)}</tr>)}</tbody>
      </table>
    </Sec>
  </Sheet>
}

function SilentPage({ n }) {
  return <Sheet n={n} arts={['🌙', '💡']} title="אותיות שקטות ו־igh" en="Spelling: silent letters · igh">
    <Rule title="Sound Box" e="👂">
      יש מילים עם אות שכותבים אבל <b>לא שומעים</b>: <En><b>k</b>nee, <b>w</b>rite, clim<b>b</b>, <b>h</b>our, i<b>s</b>land, lis<b>t</b>en</En>.
      והצירוף <En><b>igh</b></En> נשמע כמו <b>"אַיי"</b>: <En>n<b>igh</b>t, l<b>igh</b>t, h<b>igh</b></En>.
    </Rule>
    <Sec k="A" he="מקיפים בכל מילה את האות השקטה" en="Circle the silent letter">
      <EnBlock style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '2.5mm', fontSize: '18pt', fontWeight: 700, textAlign: 'center', letterSpacing: '1mm' }}>
        {SILENT.map(([w]) => <div key={w} style={{ border: `0.45mm solid ${MID}`, borderRadius: '3mm', padding: '2mm 0' }}>{w}</div>)}
      </EnBlock>
    </Sec>
    <Sec k="B" he="משלימים את שלוש האותיות igh וכותבים את המילה" en="Write igh">
      <PicFill items={IGH.map(([e, s, , text]) => ({ e, s, text }))} cols={1} mm={11} size="14pt" ls="" />
    </Sec>
    <Sec k="C" he="כותבים משפט עם שתי מילים מהעמוד" en="Write a sentence with two words from this page">
      <Lines k={2} h={9.5} />
    </Sec>
  </Sheet>
}

function PastRegularPage({ n }) {
  return <Sheet n={n} arts={['🏖️', '📖']} title="Past Simple — פעלים רגילים" en="Grammar: what happened yesterday?">
    <Rule>
      בעבר הפועל זהה <b>לכל הגופים</b> — מוסיפים <En><b>ed</b></En>. בשלילה ובשאלה משתמשים ב־<En><b>did</b></En>, והפועל חוזר לצורה הרגילה!
      <RuleTable rows={[['✓ I / she / they **played**.', '✗ She **didn\'t play** (did not).', '? **Did** you **play**? Yes, I **did**. / No, I **didn\'t**.']]} />
      מילים של עבר: <En><b>yesterday, last summer, two days ago, in 2023</b></En>
    </Rule>
    <Sec k="A" he="חופשה באילת: כותבים את הפועל בעבר" en="Last summer — write the verb in the past">
      <Passage title="Last Summer" arts={['🏖️', '🚢']} size="12.5pt">
        <div style={{ lineHeight: 2.05 }}>
          <T s="Last summer, my family and I ________ (visit) my aunt in Eilat. We ________ (stay) in a small hotel near the beach. Every day, we ________ (play) in the sea. My little brother ________ (want) to see colorful fish, so we ________ (join) a boat trip. On the last day, we ________ (miss) the bus to the airport, but we ____________ (not / worry) — Dad called a taxi!" />
        </div>
      </Passage>
    </Sec>
    <Sec k="B" he="שלילה (✗) ושאלה (?)" en="Negative and question">
      <Items items={PAST_NQ.map(p => p[0])} size="12.5pt" gap="2.4mm" />
    </Sec>
    <Sec k="C" he="עונים על עצמך: Yes, I did / No, I didn't" en="Answer about you">
      <Open items={[{ q: 'Did you watch TV yesterday?' }, { q: 'Did you play football last week?' }, { q: 'Did you help at home on Friday?' }]} size="12pt" inline />
    </Sec>
  </Sheet>
}

function IrregularPage({ n }) {
  const td = { border: `1px solid ${MID}`, padding: '0.5mm 1.5mm', height: '7.6mm', textAlign: 'left' }
  const cellOf = (v, hidden) => hidden ? <span style={{ display: 'inline-block', width: '90%', borderBottom: '1.2px solid #555', height: '4.5mm' }} /> : <b>{v}</b>
  return <Sheet n={n} arts={['✈️', '🧠']} title="Past Simple — פעלים חריגים" en="Grammar: irregular verbs">
    <Tip e="🧠">פעלים חריגים לא מקבלים <En>ed</En> — צריך לזכור אותם בעל פה. אחרי שמשלימים, מכסים טור אחד ובודקים את עצמכם.</Tip>
    <Sec k="A" he="משלימים את המשבצות הריקות בטבלה" en="Complete the table">
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2.5mm' }}>
      {[0, 1, 2].map(g => <table key={g} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt' }}>
        <thead><tr>{['verb', 'past', 'עברית'].map(h => <th key={h} style={{ ...td, height: 'auto', background: SOFT, color: C }}>{h}</th>)}</tr></thead>
        <tbody>{IRREG.slice(g * 8, g * 8 + 8).map(([b, p, he, h]) => <tr key={b}><td style={td}>{cellOf(b, h === 2)}</td><td style={td}>{cellOf(p, h === 1)}</td><td dir="rtl" style={{ ...td, textAlign: 'right', fontSize: '9.5pt' }}>{he}</td></tr>)}</tbody>
      </table>)}
    </div>
    </Sec>
    <Sec k="B" he="השבת של עידו: כותבים את הפועל בעבר" en="Ido's Saturday">
      <Passage title="Ido's Saturday" arts={['🏖️', '🌊']} size="12.5pt">
        <div style={{ lineHeight: 2.05 }}>
          <T s="On Saturday, Ido ________ (get) up late. He ________ (eat) a big breakfast and ________ (drink) orange juice. Then he ________ (go) to the beach with his friends. They ________ (swim) in the sea and ________ (have) a picnic on the sand. Suddenly, Ido ________ (see) a dolphin! In the evening, he ________ (write) a story about his amazing day." />
        </div>
      </Passage>
    </Sec>
    <Sec k="C" he="כותבים 2 משפטים על אתמול עם פעלים מהטבלה" en="Write about yesterday">
      <Lines k={2} h={9.5} lead="Yesterday I ______________________ ." />
    </Sec>
  </Sheet>
}

function FuturePage({ n }) {
  return <Sheet n={n} arts={['🚀', '⏰']} title="עתיד: will ו־going to" en="Grammar: the future">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm' }}>
      <Rule title="will" e="💡" style={{ margin: 0 }}>
        תחזית ("אני חושב ש…"), החלטה של רגע, הבטחה.
        <EnBlock>I think it <b>will</b> rain. · I<b>'ll</b> help you! · I <b>won't</b> (will not) tell.</EnBlock>
      </Rule>
      <Rule title="be going to" e="🗺️" style={{ margin: 0 }}>
        תוכנית שכבר החלטנו עליה, או משהו שרואים שעומד לקרות.
        <EnBlock>I <b>am going to</b> visit Grandma tomorrow. · Look! It<b>'s going to</b> rain.</EnBlock>
      </Rule>
    </div>
    <Sec k="A" he="רשימת התוכניות של מאיה לקיץ: כותבים משפטים עם going to" en="Maya's summer plans">
      <div style={{ display: 'flex', gap: '4mm', alignItems: 'stretch' }}>
        <div dir="ltr" style={{ flex: '0 0 52mm', border: `0.6mm solid ${C}`, borderRadius: '3mm', padding: '1.5mm 3mm', background: SOFT, fontSize: '11.5pt', textAlign: 'left', lineHeight: 1.6 }}>
          <b style={{ color: C }}>My summer plans:</b>
          {MAYA_PLANS.map(([p]) => <div key={p}>☑ {p}</div>)}
        </div>
        <div style={{ flex: 1 }}><Items items={MAYA_PLANS.map(() => 'Maya ______________ .')} size="12pt" gap="2.8mm" /></div>
      </div>
    </Sec>
    <Sec k="B" he="מקיפים: will או going to?" en="Circle will or going to">
      <Items items={FUTURE.map(f => f[0])} size="12pt" gap="2mm" />
    </Sec>
    <Sec k="C" he="תחזית: איך ייראה העולם בעוד 20 שנה?" en="In 20 years, I think …">
      <Lines k={2} h={9} lead="In 20 years, I think people will ______________________ ." />
    </Sec>
  </Sheet>
}

function QuantityPage({ n }) {
  return <Sheet n={n} arts={['🍎', '🥛']} title="much / many / some / any" en="Grammar: how much? how many?">
    <Rule>
      <RuleTable rows={[
        ['**many** + דברים שסופרים', 'How **many** apples? · not **many** eggs', '**some** — במשפט חיובי', 'I have **some** milk.'],
        ['**much** + דברים שלא סופרים', 'How **much** milk? · not **much** water', '**any** — בשלילה ובשאלה', 'I haven\'t got **any** milk. Have you got **any** eggs?'],
      ]} />
      שימו לב: בבקשה ובהצעה אומרים <En><b>some</b></En>: <En>Can I have <b>some</b> water? Would you like <b>some</b> cake?</En>
    </Rule>
    <Sec k="A" he="סופרים או לא סופרים? כותבים כל מילה בטור המתאים" en="Countable or uncountable?">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1mm', textAlign: 'center', marginBottom: '1.5mm' }}>
        {FOODS.map(([e, w]) => <div key={w}><Art e={e} mm={10} /><div style={{ fontSize: '9.5pt', fontWeight: 700 }}>{w}</div></div>)}
      </div>
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt' }}>
        <thead><tr>{['✓ countable — many (2 apples, 3 eggs…)', '✗ uncountable — much (milk, water…)'].map(h => <th key={h} style={{ border: `1px solid ${C}`, background: SOFT, color: C, padding: '0.8mm' }}>{h}</th>)}</tr></thead>
        <tbody><tr>{[0, 1].map(c => <td key={c} style={{ border: `1px solid ${C}`, height: '20mm' }} />)}</tr></tbody>
      </table>
    </Sec>
    <Sec k="B" he="How much או How many?" en="Write much or many">
      <Items items={HOW_MUCH.map(h => h[0])} size="12.5pt" gap="1.6mm" />
    </Sec>
    <Sec k="C" he="רשימת קניות: משלימים some או any" en="The shopping list">
      <EnBlock style={{ fontSize: '12.5pt', lineHeight: 1.95, padding: '0 2mm' }}>
        {SHOP.map(([who, s], i) => <div key={i}><b style={{ color: C, display: 'inline-block', width: '13mm' }}>{who}:</b><T s={s} /></div>)}
      </EnBlock>
    </Sec>
  </Sheet>
}

function SuperlativePage({ n }) {
  const td = { border: `1px solid ${MID}`, padding: '0.3mm 2mm', height: '6.3mm', textAlign: 'left' }
  return <Sheet n={n} arts={['🦒', '⛰️']} title="הכי: the biggest, the best…" en="Grammar: superlatives">
    <Rule>
      משווים בין <b>שלושה או יותר</b> — ה״הכי״ מכולם. תמיד עם <En><b>the</b></En>.
      <RuleTable rows={[
        ['**the** + short word **+ est**', 'tall → **the** tall**est**', 'big → **the** bi**gg**est', 'happy → **the** happ**iest**'],
        ['**the most** + long word', '**the most** beautiful', 'special!', 'good → **the best** · bad → **the worst**'],
      ]} />
    </Rule>
    <Sec k="A" he="משלימים את הטבלה" en="Complete the table">
      <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12pt' }}>
        <thead><tr>{['adjective', 'comparative (‑er / more)', 'superlative (the ‑est / the most)'].map(h => <th key={h} style={{ ...td, height: 'auto', background: SOFT, color: C }}>{h}</th>)}</tr></thead>
        <tbody>{SUPER_TABLE.map(([a, c, s]) => <tr key={a}><td style={{ ...td, fontWeight: 700 }}>{a}</td><td style={td}>{c}</td><td style={td}>{s}</td></tr>)}</tbody>
      </table>
    </Sec>
    <Sec k="B" he="שיאי עולם (ושיאים בישראל) — כותבים את צורת ה״הכי״" en="Records!">
      <EnBlock style={{ fontSize: '12pt', padding: '0 2mm' }}>
        {RECORDS.map(([e, s], i) => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '2mm', minHeight: '7.4mm', borderBottom: '1px dashed #ddd' }}>
          <b style={{ width: '5mm' }}>{i + 1}.</b>{e ? <Art e={e} mm={8} /> : <span style={{ width: '8mm', flex: 'none' }} />}<span><T s={s} /></span>
        </div>)}
      </EnBlock>
    </Sec>
    <Sec k="C" he="השוואה (er) או ״הכי״ (est)?" en="Comparative or superlative?">
      <Items items={COMP_SUP.map(c => c[0])} size="12pt" gap="1.2mm" />
    </Sec>
  </Sheet>
}

function ConnectorsPage({ n }) {
  return <Sheet n={n} arts={['🔑', '✏️']} title="מילות קישור — Connectors" en="Grammar: and · but · or · because · so">
    <Rule title="Connectors" e="🔑">
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1.5mm', textAlign: 'center' }}>
        {[['and', 'וגם'], ['but', 'אבל'], ['or', 'או'], ['because', 'כי, מפני ש'], ['so', 'לכן']].map(([w, he]) => <div key={w} style={{ background: 'white', borderRadius: '2mm', padding: '0.8mm' }}><b style={{ color: C, fontSize: '14pt' }}>{w}</b><div dir="rtl" style={{ fontSize: '9.5pt' }}>{he}</div></div>)}
      </div>
      <div style={{ marginTop: '1mm' }}>מילים לסדר: <En><b>First</b> (קודם) · <b>Then</b> (אחר כך) · <b>Next</b> (אחרי זה) · <b>Finally</b> (ולבסוף)</En></div>
    </Rule>
    <Sec k="A" he="משלימים and, but, or, because או so" en="Complete with a connector">
      <Items items={CONNECT.map(c => c[0])} size="12pt" gap="1.2mm" />
    </Sec>
    <Sec k="B" he="איך מכינים כריך? משלימים First, Then, Next, Finally" en="How to make a sandwich">
      <PicFill items={SANDWICH.map(([e, s]) => ({ e, s }))} cols={1} mm={10} size="13pt" ls="" />
    </Sec>
    <Sec k="C" he="מחברים את שני המשפטים למשפט אחד" en="Join the sentences">
      <Items items={JOIN.map(j => j[0])} size="12pt" gap="3mm" />
    </Sec>
  </Sheet>
}

function BottlePage({ n }) {
  return <Sheet n={n} arts={['🌊', '💌']} title="קריאה: A Message in a Bottle" en="Reading: unseen text">
    <Passage title="A Message in a Bottle" arts={['🌊', '💌']} size="11.5pt">
      Last summer, Lior and his family spent a week at the beach. One morning, Lior walked along the sand and saw something shiny near the water. It was an old glass bottle! Inside the bottle, there was a piece of paper.
      <div style={{ height: '1mm' }} />
      Lior opened the bottle carefully and read the message. It was in English: "Hello! My name is Emma. I am eleven years old, and I live in Cyprus. I threw this bottle into the sea on my birthday. If you find it, please write to me!" There was an email address at the bottom.
      <div style={{ height: '1mm' }} />
      Lior was very excited. He ran back to the hotel and showed the message to his parents. That evening, he wrote an email to Emma. Two days later, Emma answered! She was very surprised, because her bottle crossed the sea all the way to Israel.
      <div style={{ height: '1mm' }} />
      Now Lior and Emma are pen pals. They write to each other every week, and next summer Emma's family is going to visit Israel.
    </Passage>
    <Sec k="A" he="מקיפים ועונים" en="Circle and answer">
      <Choice items={BOTTLE_MC} cols={2} size="11.5pt" />
      <Open items={BOTTLE_OPEN.map(([q]) => ({ q }))} start={3} size="11.5pt" inline />
    </Sec>
    <Sec k="B" he="נכון או לא נכון?" en="True or False?">
      <TFItems items={BOTTLE_TF.map(([q]) => ({ q }))} start={6} cols={2} size="11pt" />
    </Sec>
    <Sec k="C" he="עוד שאלות" en="More questions">
      <Items items={[BOTTLE_END[0][0]]} start={9} size="11.5pt" />
      <Open items={[{ q: BOTTLE_END[1][0] }]} start={10} size="11.5pt" inline />
    </Sec>
  </Sheet>
}

function DeadSeaPage({ n }) {
  return <Sheet n={n} arts={['🌊', '⛰️']} title="קריאה: The Dead Sea" en="Reading: unseen text (facts)">
    <Passage title="The Dead Sea" arts={['🌊', '☀️']} size="11.5pt">
      The Dead Sea is in the east of Israel, on the border with Jordan. It is the lowest place on land in the world — more than 400 meters below sea level.
      <div style={{ height: '1mm' }} />
      The water of the Dead Sea is almost ten times saltier than ocean water. Because there is so much salt in the water, you can't swim there in the usual way — you float! Fish can't live in this salty water, and that is why it is called the "Dead" Sea.
      <div style={{ height: '1mm' }} />
      Every year, many tourists visit the Dead Sea. They float on the water, put black mud on their bodies and relax in the sun.
      <div style={{ height: '1mm' }} />
      But the Dead Sea has a big problem: it is getting smaller. Every year, the water goes down by about one meter. Scientists are looking for ways to save it.
    </Passage>
    <Sec k="A" he="מקיפים ועונים" en="Circle and answer">
      <Choice items={SEA_MC} size="11.5pt" />
      <Open items={SEA_OPEN.map(([q]) => ({ q }))} start={2} size="11.5pt" inline />
    </Sec>
    <Sec k="B" he="נכון או לא נכון?" en="True or False?">
      <TFItems items={SEA_TF.map(([q]) => ({ q }))} start={5} size="11pt" />
    </Sec>
    <Sec k="C" he="בלש דקדוק ודעה אישית" en="Grammar detective and your opinion">
      <Open items={SEA_END.map(([q]) => ({ q }))} start={8} size="11.5pt" inline />
    </Sec>
    <Tip e="💡">הידעתם? מי שנכנס לים המלח צריך להיזהר שהמים לא ייכנסו לעיניים — המלח צורב מאוד!</Tip>
  </Sheet>
}

function CrosswordPage({ n }) {
  return <Sheet n={n} arts={['🧠', '✏️']} title="תשבץ פעלים בעבר" en="Crossword: irregular past forms">
    <Tip e="🔑">ליד כל מספר כתוב פועל בצורה הרגילה. כותבים בתשבץ את צורת העבר שלו. רמז: כל הפעלים מופיעים בטבלה שבעמוד 7.</Tip>
    <Crossword words={CROSS} maxW={176} maxH={128} />
  </Sheet>
}

function DictationPage({ n }) {
  return <Sheet n={n} arts={['✏️', '👂']} title="הכתבה ואיות" en="Spelling and Dictation">
    <Sec k="A" he="מסתכלים, אומרים, מכסים, כותבים ובודקים" en="Look, say, cover, write, check">
      <SpellTable words={['beautiful', 'different', 'because', 'thought', 'Wednesday']} />
    </Sec>
    <Sec k="B" he="הכתבה: מבוגר מקריא, ואני כותב/ת" en="Dictation">
      <Dictation words={['knee', 'write', 'climb', 'night', 'light', 'island', 'studied', 'stopped', 'bought', 'thought']} sentences={['Yesterday we went to the beach.', 'I am going to visit my grandma.', 'It was the best day of my life.']} />
    </Sec>
  </Sheet>
}

function WritingPage({ n }) {
  const step = (k, en, he) => <div style={{ border: `0.5mm solid ${MID}`, borderRadius: '3mm', padding: '1mm 2mm' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5mm' }}><span style={{ background: C, color: 'white', borderRadius: '50%', width: '5.5mm', height: '5.5mm', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5pt', fontWeight: 800 }}>{k}</span><En style={{ fontWeight: 800, color: C }}>{en}</En><span style={{ fontSize: '9.5pt', color: '#555' }}>{he}</span></div>
    <div style={{ height: '7.5mm', borderBottom: '1.2px solid #555' }} />
  </div>
  return <Sheet n={n} arts={['🏖️', '✏️']} title="כתיבה: My Best Day" en="Writing: a story in the past">
    <Sec k="A" he="קוראים את הדוגמה ומסמנים את מילות הקישור" en="Read the example">
      <Passage title="The Best Day of the Summer" arts={['🌳', '🌊']} size="11.5pt">
        Last summer, I went to the Galilee with my family. <b>First</b>, we walked along a river. <b>Then</b>, we had a picnic under a big tree. <b>Next</b>, my brother and I swam in the cold water, <b>but</b> Dad didn't go in <b>because</b> it was too cold for him! <b>Finally</b>, we watched the sunset. It was the best day of the summer!
      </Passage>
    </Sec>
    <Sec k="B" he="מתכננים את הסיפור שלי" en="Plan your story">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm' }}>
        {step(1, 'When? Where? Who?', 'מתי? איפה? עם מי?')}{step(2, 'First …', 'מה קרה קודם?')}{step(3, 'Then … Next …', 'ואז?')}{step(4, 'Finally … I felt …', 'איך זה נגמר? איך הרגשתי?')}
      </div>
    </Sec>
    <Sec k="C" he="כותבים סיפור של 6–8 משפטים בעבר" en="Write your story">
      <WordBank words={['First', 'Then', 'Next', 'Finally', 'and', 'but', 'because', 'so']} title="Use" />
      <Lines k={6} h={8.6} />
    </Sec>
  </Sheet>
}

function Test1Page({ n }) {
  return <Sheet n={n} arts={['⭐', '✏️']} title="מבחן מסכם (1)" en="Final Test — Part 1">
    <ScoreBox />
    <Sec k="1" he="מקיפים את המילה שמתאימה לתמונה" en="Circle the word" pts={10}>
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '2mm' }}>
        {TEST_PICS.map(([e, opts]) => <div key={e} style={{ border: `0.45mm solid ${MID}`, borderRadius: '3mm', textAlign: 'center', padding: '1mm' }}>
          <Art e={e} mm={11} /><div style={{ fontSize: '12pt', fontWeight: 700, lineHeight: 1.35 }}>{opts.map(o => <div key={o}>{o}</div>)}</div>
        </div>)}
      </div>
    </Sec>
    <Sec k="2" he="כותבים את הפועל בעבר" en="Past simple" pts={16}>
      <Items items={TEST_PAST.map(t => t[0])} cols={2} size="11.5pt" gap="1.2mm" />
    </Sec>
    <Sec k="3" he="מקיפים: will או going to" en="The future" pts={10}>
      <Items items={TEST_FUT.map(t => t[0])} size="11.5pt" gap="0.8mm" />
    </Sec>
    <Sec k="4" he="מקיפים את המילה הנכונה" en="much / many / some / any" pts={10}>
      <Items items={TEST_Q.map(t => t[0])} cols={2} size="11.5pt" gap="1.4mm" />
    </Sec>
  </Sheet>
}

function Test2Page({ n }) {
  return <Sheet n={n} arts={['⭐', '✏️']} title="מבחן מסכם (2)" en="Final Test — Part 2">
    <Sec k="5" he="השוואה (er) או ״הכי״ (est)?" en="Comparatives and superlatives" pts={10}>
      <Items items={TEST_SUP.map(t => t[0])} cols={2} size="11.5pt" gap="1.2mm" />
    </Sec>
    <Sec k="6" he="מקיפים את מילת הקישור" en="Connectors" pts={8}>
      <Items items={TEST_CON.map(t => t[0])} cols={2} size="11.5pt" gap="1.2mm" />
    </Sec>
    <Sec k="7" he="קוראים ועונים" en="Read and answer" pts={20}>
      <Passage title="The Lost Phone" arts={['📱', '🚌']} size="10.8pt">
        Last Friday, Yuval took the bus to his grandmother's house. He was very tired, so he slept on the bus. When he got off, he looked in his pocket — his phone wasn't there! He ran to his grandmother's house and called his phone from her phone. A woman answered. "I found your phone on the bus," she said. "I'm going to leave it with the driver at the bus station." The next morning, Yuval went to the station and got his phone back.
      </Passage>
      <Open items={PHONE.map(([q]) => ({ q }))} size="11pt" inline />
      <TFItems items={PHONE_TF.map(([q]) => ({ q }))} start={5} size="11pt" />
    </Sec>
    <Sec k="8" he="כותבים 3–4 משפטים על סוף השבוע" en="Use and, but, because, so" pts={16}>
      <Lines k={3} h={7.5} />
    </Sec>
  </Sheet>
}

export default function EnglishGrade6Booklet() {
  const mc = items => items.map(i => i.a)
  const hidden = IRREG.filter(v => v[3]).map(([b, p]) => `${b} → ${p}`)
  return <EnglishTheme grade={6}>
    <EnglishCover grade={6} title="חוברת אנגלית לכיתה ו׳" arts={['✈️', '🌳', '🌊', '🦒', '📚']} pages={PAGES}
      skills={[['📚', 'אוצר מילים', 'Vocabulary'], ['👂', 'איות וצלילים', 'Spelling'], ['🧠', 'דקדוק', 'Grammar'], ['📖', 'הבנת הנקרא', 'Reading'], ['✏️', 'כתיבה', 'Writing']]}
      note="חוברת לסיום בית הספר היסודי: עבר פשוט (רגיל וחריג), עתיד, כמויות, ״הכי״ ומילות קישור — הנושאים שמכינים לחטיבת הביניים. בכל עמוד דקדוק יש תיבת הסבר בעברית. עמודי הקריאה הם קטעים שלא נלמדו (Unseen). בעמוד 15 יש הכתבה, בעמודים 17–18 מבחן מסכם של 100 נקודות, ובסוף דף תשובות ותעודה." />
    <TravelPage n={2} />
    <NaturePage n={3} />
    <EdPage n={4} />
    <SilentPage n={5} />
    <PastRegularPage n={6} />
    <IrregularPage n={7} />
    <FuturePage n={8} />
    <QuantityPage n={9} />
    <SuperlativePage n={10} />
    <ConnectorsPage n={11} />
    <BottlePage n={12} />
    <DeadSeaPage n={13} />
    <CrosswordPage n={14} />
    <DictationPage n={15} />
    <WritingPage n={16} />
    <Test1Page n={17} />
    <Test2Page n={18} />
    <KeyPage n={19} size="8.8pt" cols={3} sections={[
      { title: 'עמוד 2 — A', answers: ans(TRAVEL_FILL) },
      { title: 'עמוד 2 — B', answers: ans(ODD) },
      { title: 'עמוד 3 — A', answers: ans(PLANET) },
      { title: 'עמוד 4 — A', answers: ans(ED) },
      { title: 'עמוד 4 — B', letters: true, answers: ['/t/: jumped, cooked, watched, helped', '/d/: cleaned, opened, lived, rained', '/id/: needed, visited, started, painted'] },
      { title: 'עמוד 5 — A', answers: SILENT.map(([w, l]) => `${w} (${l})`) },
      { title: 'עמוד 5 — B', answers: ans(IGH.map(x => x.slice(0, 3))) },
      { title: 'עמוד 6 — A (Last Summer)', answers: ans(SUMMER) },
      { title: 'עמוד 6 — B', answers: ans(PAST_NQ) },
      { title: 'עמוד 7 — הטבלה', letters: true, answers: hidden },
      { title: 'עמוד 7 — B (Ido)', answers: ans(IDO) },
      { title: 'עמוד 8 — A', answers: ans(MAYA_PLANS) },
      { title: 'עמוד 8 — B', answers: ans(FUTURE) },
      { title: 'עמוד 9 — A', letters: true, answers: ['countable: apples, eggs, cookies, bananas, carrots, tomatoes', 'uncountable: milk, cheese, bread, water, rice, juice'] },
      { title: 'עמוד 9 — B', answers: ans(HOW_MUCH) },
      { title: 'עמוד 9 — C', answers: ans(SHOP) },
      { title: 'עמוד 10 — A', answers: SUPER_TABLE.map(r => `${r[0]}: ${r[3]}`) },
      { title: 'עמוד 10 — B', answers: ans(RECORDS) },
      { title: 'עמוד 10 — C', answers: ans(COMP_SUP) },
      { title: 'עמוד 11 — A', answers: ans(CONNECT) },
      { title: 'עמוד 11 — B', answers: [...ans(SANDWICH).slice(0, 1), 'Then / Next', 'Next / Then', 'Finally'] },
      { title: 'עמוד 11 — C', answers: ans(JOIN) },
      { title: 'עמוד 12 — A Message in a Bottle', answers: [...mc(BOTTLE_MC), ...ans(BOTTLE_OPEN), ...ans(BOTTLE_TF), ...ans(BOTTLE_END)] },
      { title: 'עמוד 13 — The Dead Sea', answers: [...mc(SEA_MC), ...ans(SEA_OPEN), ...ans(SEA_TF), ...ans(SEA_END)] },
      { title: 'עמוד 14 — תשבץ', letters: true, answers: crosswordAnswers(CROSS) },
      { title: 'מבחן — 1', answers: TEST_PICS.map(t => t[2]) },
      { title: 'מבחן — 2', answers: ans(TEST_PAST) },
      { title: 'מבחן — 3', answers: ans(TEST_FUT) },
      { title: 'מבחן — 4', answers: ans(TEST_Q) },
      { title: 'מבחן — 5', answers: ans(TEST_SUP) },
      { title: 'מבחן — 6', answers: ans(TEST_CON) },
      { title: 'מבחן — 7 (4 נק׳ לכל סעיף)', answers: [...ans(PHONE), ...ans(PHONE_TF)] },
    ]} />
    <EnglishCertificate grade={6} booklet="חוברת האנגלית לכיתה ו׳" done="תרגלתי עבר פשוט, עתיד, כמויות, השוואות ומילות קישור, קראתי קטעים באנגלית וכתבתי סיפור משלי. אני מוכן/ה לחטיבת הביניים!" />
  </EnglishTheme>
}

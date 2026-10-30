import { bookletBySlug } from './registry'
import { Box, Checklist, En, Ex, Glossary, KeyPage, Lines, Ltr, MapPage, MC, Passage, Questions, Rule, Sheet, Table, Task, TeenCertificate, TeenCover, Tip, WordBank } from './englishTeenKit'
import { exKey, mcKey, qKey } from './englishTeenKeys'

// "חוברת אנגלית לכיתה ח׳" — past progressive (and when / while), a first look at the present perfect,
// past participles, countable / uncountable, adverbs and the present passive; Band II vocabulary with word
// building, three original unseens, a short story writing task, a 100-point test, key and certificate.
const PAGES = bookletBySlug('english-grade-8').pages
const ACCENT = '#5b3c96'
const S = props => <Sheet accent={ACCENT} {...props} />

// ---------- Grammar data ----------
const PROG_A = [
  ['At 9 o\'clock last night, I ________ (watch) a series.', 'was watching'],
  ['The kids ________ (play) outside all afternoon.', 'were playing'],
  ['What ________ you ________ (do) at 7:00 this morning?', 'were … doing'],
  ['She ________ (not / sleep) at midnight; she ________ (read).', "wasn't sleeping; was reading"],
  ['We ________ (wait) for the bus in the rain.', 'were waiting'],
  ['________ it ________ (snow) when you left the house?', 'Was … snowing'],
  ['At 8:15, my dad ________ (drive) to work.', 'was driving'],
  ['They ________ (not / listen) to the teacher.', "weren't listening"],
]
const DANA = [['7:00', 'have breakfast', 'At 7:00, Dana was having breakfast.'], ['10:00', 'take a math test', 'At 10:00, Dana was taking a math test.'], ['13:00', 'eat lunch with her friends', 'At 13:00, Dana was eating lunch with her friends.'], ['16:00', 'swim at the pool', 'At 16:00, Dana was swimming at the pool.'], ['20:00', 'chat with her cousin', 'At 20:00, Dana was chatting with her cousin.']]
const WW_A = [
  ['I ________ (have) a shower when the phone ________ (ring).', 'was having; rang'],
  ['While we ________ (walk) in the forest, we ________ (see) a deer.', 'were walking; saw'],
  ['Dan ________ (fall) while he ________ (ride) his bike.', 'fell; was riding'],
  ['When the teacher ________ (come) in, the students ________ (talk).', 'came; were talking'],
  ['While my sister ________ (study), I ________ (play) video games.', 'was studying; was playing'],
  ['The lights ________ (go) out while we ________ (watch) the movie.', 'went; were watching'],
  ['What ________ you ________ (do) when the alarm ________ (start)?', 'were … doing; started'],
  ['She ________ (cut) her finger while she ________ (make) a salad.', 'cut; was making'],
]
const WW_B = [
  ['I was sleeping. The storm started. (when)', 'I was sleeping when the storm started.'],
  ['Noa was jogging. She lost her keys. (while)', 'Noa lost her keys while she was jogging. / While Noa was jogging, she lost her keys.'],
  ['They were playing football. It began to rain. (when)', 'They were playing football when it began to rain.'],
]
const PERF_A = [
  ['I ________ (visit) London twice.', 'have visited'],
  ['She ________ (finish) her project.', 'has finished'],
  ['We ________ (not / see) that movie.', "haven't seen"],
  ['________ you ever ________ (eat) sushi?', 'Have … eaten'],
  ["My brother ________ (break) his arm, so he can't play today.", 'has broken'],
  ['They ________ (never / fly) on a plane.', 'have never flown'],
  ['________ Maya ________ (call) you back?', 'Has … called'],
  ['The price of pizza ________ (go) up.', 'has gone'],
]
const EVER = [['ride a horse', 'ridden'], ['meet a famous person', 'met'], ['win a prize', 'won'], ['be on TV', 'been'], ['cook dinner for your family', 'cooked']]
const ADV_A = [
  ['"Do you want lunch?" "No thanks, I\'ve ________ eaten." (already / yet)', 'already'],
  ['Have you finished your homework ________? (yet / just)', 'yet'],
  ["The movie hasn't started ________. (yet / already)", 'yet'],
  ["I've ________ seen a real tiger. (never / ever)", 'never'],
  ["I've ________ painted this wall — don't touch it! (just / yet)", 'just'],
  ['Has she ________ been to Eilat? (ever / never)', 'ever'],
  ["We've ________ bought the tickets, so we can go in. (already / yet)", 'already'],
  ["He hasn't answered my message ________. (yet / just)", 'yet'],
]
const PSPP = [
  ['I ________ (see) this movie last week.', 'saw'],
  ['I ________ (see) this movie three times!', 'have seen'],
  ['________ you ever ________ (be) to Jerusalem?', 'Have … been'],
  ['When ________ you ________ (arrive)?', 'did … arrive'],
  ["She ________ (lose) her phone, so she can't call you now.", 'has lost'],
  ['We ________ (move) to this city in 2019.', 'moved'],
]
const V3 = [
  ['A-A-A: אותה צורה', [['cut', 'cut', 'cut'], ['hit', 'hit', 'hit'], ['let', 'let', 'let'], ['put', 'put', 'put'], ['read', 'read', 'read']]],
  ['A-B-B: עבר = צורה 3', [['bring', 'brought', 'brought'], ['buy', 'bought', 'bought'], ['feel', 'felt', 'felt'], ['find', 'found', 'found'], ['have', 'had', 'had'], ['leave', 'left', 'left'], ['lose', 'lost', 'lost'], ['make', 'made', 'made'], ['meet', 'met', 'met'], ['say', 'said', 'said'], ['sleep', 'slept', 'slept'], ['teach', 'taught', 'taught'], ['tell', 'told', 'told'], ['think', 'thought', 'thought'], ['win', 'won', 'won']]],
  ['A-B-A: צורה 3 = בסיס', [['become', 'became', 'become'], ['come', 'came', 'come'], ['run', 'ran', 'run']]],
  ['A-B-C: שלוש צורות שונות', [['be', 'was / were', 'been'], ['begin', 'began', 'begun'], ['break', 'broke', 'broken'], ['choose', 'chose', 'chosen'], ['do', 'did', 'done'], ['drink', 'drank', 'drunk'], ['drive', 'drove', 'driven'], ['eat', 'ate', 'eaten'], ['fall', 'fell', 'fallen'], ['fly', 'flew', 'flown'], ['forget', 'forgot', 'forgotten'], ['give', 'gave', 'given'], ['go', 'went', 'gone'], ['know', 'knew', 'known'], ['ride', 'rode', 'ridden'], ['see', 'saw', 'seen'], ['speak', 'spoke', 'spoken'], ['swim', 'swam', 'swum'], ['take', 'took', 'taken'], ['throw', 'threw', 'thrown'], ['wear', 'wore', 'worn'], ['write', 'wrote', 'written']]],
]
const V3_EX = [['write', 'written'], ['take', 'taken'], ['buy', 'bought'], ['go', 'gone'], ['fly', 'flown'], ['eat', 'eaten'], ['teach', 'taught'], ['forget', 'forgotten'], ['swim', 'swum'], ['wear', 'worn']]
const CU_WORDS = ['apple', 'sugar', 'chair', 'homework', 'money', 'coin', 'information', 'egg', 'bread', 'idea', 'furniture', 'sandwich']
const CU_B = [
  ['How ________ water do you drink every day? (much / many)', 'much'],
  ["There aren't ________ students in class today. (much / many)", 'many'],
  ['I have ________ friends in my new school — three or four. (a few / a little)', 'a few'],
  ['Can I have ________ milk in my tea? (a little / a few)', 'a little'],
  ['Is there ________ bread left? (any / many)', 'any'],
  ['The teacher gave us ________ homework today. (a lot of / many)', 'a lot of'],
  ['How ________ people came to the concert? (much / many)', 'many'],
  ['I need ________ advice about my project. (some / an)', 'some'],
]
const CU_C = [
  ['The news are bad.', 'The news is bad.'],
  ['She gave me an advice.', 'She gave me some advice. / a piece of advice'],
  ['We have too much chairs in this room.', 'We have too many chairs in this room.'],
]
const ADVB_A = [
  ['Please drive ________. The road is wet. (careful)', 'carefully'],
  ['Omer is a ________ swimmer. (good)', 'good'],
  ['Omer swims very ________. (good)', 'well'],
  ['The test was ________; I finished in ten minutes. (easy)', 'easy'],
  ['I finished the test ________. (easy)', 'easily'],
  ['She worked ________ all year, and she passed. (hard)', 'hard'],
  ['The baby is sleeping. Please talk ________. (quiet)', 'quietly'],
  ['He ran ________ to catch the bus. (fast)', 'fast'],
]
const ADVB_B = [
  ['She plays well the guitar.', 'She plays the guitar well.'],
  ['He speaks English very good.', 'He speaks English very well.'],
  ['They answered quick the questions.', 'They answered the questions quickly.'],
]
const PASS_A = [
  ['English ________ (speak) in many countries.', 'is spoken'],
  ['A lot of phones ________ (make) in China.', 'are made'],
  ['The rooms ________ (clean) every morning.', 'are cleaned'],
  ['Coffee ________ (grow) in Brazil.', 'is grown'],
  ['Cars ________ (not / allow) in this street.', "aren't allowed"],
  ['________ the bins ________ (empty) every day?', 'Are … emptied'],
  ['Millions of messages ________ (send) every minute.', 'are sent'],
  ['The Summer Olympic Games ________ (hold) every four years.', 'are held'],
]
const PASS_B = [
  ['They sell fresh bread here.', 'Fresh bread is sold here.'],
  ['The teacher checks our tests.', 'Our tests are checked by the teacher.'],
  ['People use smartphones all over the world.', 'Smartphones are used all over the world.'],
  ['Bees make honey.', 'Honey is made by bees.'],
]
const MIX = [
  ['While I ________ TV, the lights went out.', ['watched', 'was watching', 'have watched'], 1],
  ['Have you ________ been to Paris?', ['ever', 'yet', 'already'], 0],
  ['How ________ sugar do you need?', ['many', 'much', 'few'], 1],
  ['Paper ________ from wood.', ['makes', 'is made', 'made'], 1],
  ['She sings ________.', ['beautiful', 'beautifully', 'beauty'], 1],
  ['We ________ dinner when Grandma called.', ['were having', 'have had', 'are having'], 0],
  ["I haven't read the book ________.", ['already', 'yet', 'just'], 1],
  ['There are only ________ apples left.', ['a little', 'a few', 'much'], 1],
  ['When ________ you start learning English?', ['did', 'have', 'were'], 0],
  ['These cars ________ in Japan.', ['are made', 'is made', 'make'], 0],
  ['He is a ________ driver. He never has accidents.', ['careful', 'carefully', 'care'], 0],
  ['________ you ever won a prize?', ['Did', 'Have', 'Were'], 1],
]
const MIX_FIX = [
  ['I have saw that movie.', 'saw → seen'],
  ['How many money do you have?', 'many → much'],
  ['While she was walking, she was finding a wallet.', 'was finding → found'],
  ['The windows is cleaned every week.', 'is → are'],
]

// ---------- Vocabulary ----------
const TECH = [
  ['download', 'להוריד (קובץ)'], ['upload', 'להעלות'], ['screen', 'מסך'], ['device', 'מכשיר'], ['account', 'חשבון'], ['password', 'סיסמה'],
  ['delete', 'למחוק'], ['search', 'לחפש; חיפוש'], ['share', 'לשתף'], ['message', 'הודעה'], ['post', 'פוסט; לפרסם'], ['comment', 'תגובה'],
  ['private', 'פרטי'], ['public', 'ציבורי'], ['online', 'ברשת, מקוון'], ['connect', 'לחבר, להתחבר'], ['invent', 'להמציא'], ['research', 'מחקר'],
  ['information', 'מידע'], ['advertisement', 'פרסומת'], ['reliable', 'אמין'], ['addicted', 'מכור'], ['protect', 'להגן'], ['permission', 'רשות'],
]
const TECH_A = [
  ['Never share your ________ with anyone, not even your best friend.', 'password'],
  ["I can't watch the video offline — I need to ________ it first.", 'download'],
  ['Before you ________ a photo of a friend, ask for permission.', 'post / upload'],
  ['Is this website ________? Check the information in another source too.', 'reliable'],
  ['Oops, I sent the wrong message. How do I ________ it?', 'delete'],
  ['My account is ________, so only my friends can see my photos.', 'private'],
]
const TECH_B = [['invent', 'invention'], ['connect', 'connection'], ['protect', 'protection'], ['inform', 'information'], ['decide', 'decision'], ['permit', 'permission']]
const ENV = [
  ['environment', 'סביבה'], ['pollution', 'זיהום'], ['recycle', 'למחזר'], ['waste', 'פסולת; לבזבז'], ['plastic', 'פלסטיק'], ['energy', 'אנרגיה'],
  ['solar', 'סולארי, של השמש'], ['climate', 'אקלים'], ['temperature', 'טמפרטורה'], ['disappear', 'להיעלם'], ['species', 'מין (בטבע)'], ['save', 'לחסוך; להציל'],
  ['reduce', 'להפחית'], ['avoid', 'להימנע'], ['habit', 'הרגל'], ['exercise', 'פעילות גופנית'], ['diet', 'תזונה'], ['stress', 'לחץ'],
  ['muscle', 'שריר'], ['heart', 'לב'], ['balanced', 'מאוזן'], ['amount', 'כמות'], ['regularly', 'באופן קבוע'], ['benefit', 'תועלת, יתרון'],
]
const ENV_A = [
  ['We ________ bottles and paper at school — there are special bins for them.', 'recycle'],
  ['Cars and factories cause air ________.', 'pollution'],
  ['Turn off the lights to ________ energy.', 'save'],
  ['Try to ________ sugary drinks; drink water instead.', 'avoid'],
  ['A ________ diet includes fruit, vegetables, grains and protein.', 'balanced'],
  ['Checking your phone in bed is a bad ________.', 'habit'],
]
const PREFIX = [['not healthy', 'unhealthy'], ['use again', 'reuse'], ['not agree', 'disagree'], ['write again', 'rewrite'], ['not friendly', 'unfriendly'], ['not like', 'dislike']]

// ---------- Unseens ----------
const U1 = {
  title: 'The Wrong Bus', kind: 'A story',
  paras: [
    'It was Gal\'s first week in Jerusalem. His family had just moved from a small town in the south, and he was still learning his way around the big city. On Thursday afternoon, he was waiting at the bus stop near his new school when a bus with the number 18 arrived. Gal was busy texting his old friends, so he got on without looking twice.',
    'For twenty minutes, Gal was listening to music and looking out of the window. Slowly, he realized that the streets looked strange. He wasn\'t passing the big park or the shopping center. When the bus stopped next to a hospital he had never seen before, he jumped up in a panic. He was on bus 13, not 18!',
    'Gal got off and looked at his phone. The battery was almost dead. While he was trying to find the right way on the map, an old man came over. "You look lost," he said kindly. "Where do you need to go?" The man took Gal to the right bus stop and even waited with him until bus 18 came.',
    'When Gal finally got home, his mother was standing at the door. "Where were you?" she asked. Gal smiled. "I took a tour of Jerusalem," he said. "And I met my first friend here."',
  ],
  glossary: [['realize', 'להבין, לקלוט'], ['in a panic', 'בבהלה'], ['battery', 'סוללה'], ['kindly', 'בחביבות']],
  qs: [
    { q: 'Why didn\'t Gal know Jerusalem well?', a: 'His family had just moved there (from a small town in the south).' },
    { q: 'What was Gal doing when the bus arrived?', a: 'He was texting his old friends.' },
    { q: 'How did Gal understand that he was on the wrong bus? Give ONE clue.', a: 'Any one: the streets looked strange; he wasn\'t passing the park / shopping center; he saw a hospital he had never seen.' },
    { q: '"He jumped up in a panic" (paragraph 2). This shows that Gal felt…', opts: ['bored', 'frightened and worried', 'proud'], a: 1 },
    { q: 'Why couldn\'t Gal use his phone for long?', a: 'The battery was almost dead.' },
    { q: 'The word "he" in "he said kindly" (paragraph 3) refers to ________.', a: 'the old man' },
    { q: 'What TWO things did the old man do to help Gal?', a: 'He took Gal to the right bus stop; he waited with him until bus 18 came.' },
    { q: 'Who is the "first friend" Gal talks about at the end?', opts: ['a boy from his class', 'the bus driver', 'the old man'], a: 2 },
  ],
}
const U2 = {
  title: 'Sea Turtles on Israel\'s Beaches', kind: 'An article',
  paras: [
    'Every summer, something special happens on the Mediterranean beaches of Israel. At night, female sea turtles come out of the water, dig a hole in the sand with their back flippers and lay about a hundred eggs. Then they cover the nest and return to the sea. The mothers never see their babies.',
    'Two kinds of sea turtles nest in Israel: the loggerhead turtle and the green turtle. Both are protected by law, because there are far fewer of them than there used to be. In the past, turtles were hunted for their meat and shells. Today, the biggest dangers are plastic in the sea, fishing nets and crowded beaches.',
    'After about two months, the baby turtles hatch. They usually come out at night and move towards the brightest horizon — normally the sea, where the moon and stars shine on the water. Unfortunately, the bright lights of hotels and roads can confuse them, and the hatchlings may crawl the wrong way.',
    'To protect the turtles, many nests are moved by rangers of the Israel Nature and Parks Authority to protected areas on the beach. Volunteers also help: they walk along the beach early in the morning to look for tracks of mother turtles. Surprisingly, scientists believe that a female returns to nest on the same beach where she hatched many years before.',
  ],
  glossary: [['lay eggs', 'להטיל ביצים'], ['flipper', 'סנפיר'], ['protected', 'מוגן'], ['hatch', 'לבקוע'], ['ranger', 'פקח'], ['tracks', 'עקבות']],
  qs: [
    { q: 'Where do the female turtles lay their eggs?', a: 'In a hole (nest) they dig in the sand on the beach.' },
    { q: 'Complete: The two kinds of sea turtles that nest in Israel are the ________ and the ________.', a: 'loggerhead turtle; green turtle' },
    { q: 'What are the biggest dangers to sea turtles today? Give TWO.', a: 'Any two: plastic in the sea, fishing nets, crowded beaches.' },
    { q: 'Why do baby turtles move towards the sea?', opts: ['They can smell the water.', 'It is usually the brightest horizon.', 'Their mothers wait for them there.'], a: 1 },
    { q: 'How can lights from hotels and roads be dangerous?', a: 'They can confuse the hatchlings, so they crawl the wrong way.' },
    { q: 'Find a passive sentence in paragraph 4 and copy it.', a: '"Many nests are moved by rangers … to protected areas on the beach."', lines: 1 },
    { q: 'The word "Surprisingly" (paragraph 4) shows that the writer thinks the fact is…', opts: ['boring', 'amazing / unexpected', 'not true'], a: 1 },
  ],
}
const U3 = {
  title: 'From Trash to Treasure', kind: 'A school magazine article',
  paras: [
    'Every day, our school produces bags and bags of waste. Most of it goes into one big bin, even though a lot of it could be recycled. Tamar Levi from class 8B decided to do something about it.',
    '"I noticed that students don\'t recycle because they\'re in a hurry," Tamar explains. "They don\'t have time to think about which bin to use." So she and two friends from the robotics club built "Sorty," a smart bin that sorts the trash by itself. It has a small camera that recognizes plastic bottles, cans and paper, and it moves each item into the correct box.',
    'Building Sorty wasn\'t easy. The team worked on it for four months, and the first version made a lot of mistakes. "It thought a banana was a can!" Tamar laughs. "We had to show the camera thousands of photos before it learned."',
    'Today, Sorty stands in the school lobby, and the amount of recycled waste at school has doubled. Next month, the team is going to present Sorty at a national science competition. "We haven\'t won anything yet," Tamar says, "but we\'ve already done the most important thing — we\'ve changed our school."',
  ],
  glossary: [['sort', 'למיין'], ['recognize', 'לזהות'], ['version', 'גרסה'], ['lobby', 'מבואה, לובי'], ['competition', 'תחרות']],
  qs: [
    { q: 'According to Tamar, why don\'t students recycle?', a: "They're in a hurry / don't have time to think which bin to use." },
    { q: 'How does Sorty know what kind of trash an item is?', a: 'It has a (small) camera that recognizes the items.' },
    { q: '"It thought a banana was a can!" This shows that…', opts: ['the first version made mistakes', "Tamar doesn't like bananas", 'Sorty can recycle food'], a: 0 },
    { q: 'How long did the team work on Sorty?', a: 'Four months.' },
    { q: 'What has happened since Sorty arrived at the school?', a: 'The amount of recycled waste has doubled.' },
    { q: 'The word "doubled" (paragraph 4) means…', opts: ['became two times bigger', 'became smaller', 'stayed the same'], a: 0 },
    { q: 'What is the team going to do next month?', a: 'Present Sorty at a national science competition.' },
    { q: 'What does Tamar think is "the most important thing"?', a: 'That they changed their school.' },
  ],
}

// ---------- Summary test ----------
const T_TEXT = {
  title: 'A Lesson in the Kitchen', kind: 'Summary test — reading',
  paras: [
    'Last month, my grandmother broke her arm. While she was recovering, she couldn\'t cook, so she asked me to be her "hands." I had never cooked anything more complicated than an egg, so I was nervous.',
    'Every afternoon, I stood at the stove while she sat next to me and gave instructions. "Not so fast! Cut the onions slowly and carefully," she said. At first, I burned almost everything. Once, I even put salt in a cake instead of sugar.',
    'But slowly, I improved. After three weeks, I made her famous soup by myself, and she said it was almost as good as hers. Her arm has healed now, but we still cook together every Friday. I\'ve learned her recipes — and she has learned how to send voice messages!',
  ],
  qs: [
    { q: "Why couldn't the grandmother cook?", a: 'She broke her arm.' },
    { q: 'Why was the writer nervous?', a: 'He / she had never cooked anything more complicated than an egg.' },
    { q: 'Give ONE example of a mistake the writer made.', a: 'Burned almost everything / put salt in a cake instead of sugar.' },
    { q: '"She said it was almost as good as hers." The soup was…', opts: ["better than Grandma's", "a little less good than Grandma's", 'terrible'], a: 1 },
    { q: 'What did the grandmother learn?', a: 'How to send voice messages.' },
  ],
}
const T_VOC = [
  ['Plastic bags cause a lot of ________ in the sea.', 'pollution'],
  ["Don't believe everything online; check if the source is ________.", 'reliable'],
  ['A good ________ has letters, numbers and symbols.', 'password'],
  ['Going to sleep very late is a bad ________.', 'habit'],
  ['We ________ old newspapers instead of throwing them away.', 'recycle'],
]
const T_GRAM = [
  ['I ________ a shower when you called. (had / was having)', 'was having'],
  ['________ you ever been to Eilat? (Did / Have)', 'Have'],
  ["She hasn't finished her homework ________. (yet / already)", 'yet'],
  ['How ________ money does it cost? (much / many)', 'much'],
  ['There are ________ eggs in the fridge. (a few / a little)', 'a few'],
  ['Cheese ________ from milk. (makes / is made)', 'is made'],
  ['He answered all the questions ________. (correct / correctly)', 'correctly'],
  ['We ________ to Haifa in 2022. (moved / have moved)', 'moved'],
  ['While I was reading, my brother ________ music. (was playing / has played)', 'was playing'],
  ['I have ________ my homework. Can I go out now? (did / done)', 'done'],
]

// ---------- Pages ----------
function PastProgPage({ n }) {
  return <S n={n} arts={['🕒']} en="Past Progressive" he="עבר מתמשך — מה היה באמצע לקרות">
    <Rule title="מתי משתמשים?">
      פעולה שהייתה <b>באמצע</b> לקרות ברגע מסוים בעבר, או רקע לסיפור. מבנה: <En><b>was / were + V-ing</b></En>
      <Ltr style={{ marginTop: '1mm' }}>At 8 p.m. yesterday, I <b>was doing</b> my homework. • It <b>was raining</b>, and people <b>were running</b> home.</Ltr>
    </Rule>
    <Table head={['', 'I / he / she / it', 'you / we / they']} rows={[
      ['+', 'I was reading.', 'They were reading.'],
      ['−', "She wasn't reading.", "We weren't reading."],
      ['?', 'Was he reading? — Yes, he was. / No, he wasn\'t.', 'Were you reading? — Yes, I was. / No, I wasn\'t.'],
    ]} widths={['6%', '47%', '47%']} />
    <Task k="א" en="Complete with the past progressive.">השלימו בעבר מתמשך.</Task>
    <Ex items={PROG_A} cols={2} />
    <Task k="ב" en="Look at Dana's day yesterday. Write what she was doing.">זה היום של דנה אתמול. כתבו מה היא עשתה בכל שעה.</Task>
    <Table head={['time', 'activity']} rows={DANA.map(([t, a]) => [t, a])} widths={['20%', '80%']} fs="10pt" />
    <Ltr style={{ fontSize: '10.4pt', color: '#444', marginBottom: '1mm' }}>Example: At 10:00, Dana was taking a math test.</Ltr>
    <Lines n={4} />
  </S>
}

function WhenWhilePage({ n }) {
  return <S n={n} arts={['⏰']} en="when / while" he="שני זמני עבר במשפט אחד">
    <Rule title="פעולה ארוכה + פעולה קצרה שקטעה אותה">
      הפעולה הארוכה ב־<b>עבר מתמשך</b>, הקצרה ב־<b>עבר פשוט</b>.
      <Ltr style={{ marginTop: '1mm' }}>I <b>was walking</b> home <b>when</b> I <b>saw</b> the accident.<br /><b>While</b> I <b>was walking</b> home, I <b>saw</b> the accident.</Ltr>
    </Rule>
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="שתי פעולות ארוכות במקביל" style={{ flex: 1, background: 'white' }}>
        <Ltr>While Mom <b>was cooking</b>, Dad <b>was cleaning</b>.</Ltr>
      </Rule>
      <Rule title="פסיק" style={{ flex: 1, background: 'white' }}>
        כשהמשפט <b>מתחיל</b> ב־<En>When / While</En> — שמים פסיק באמצע.
      </Rule>
    </div>
    <Tip e="💡">בדרך כלל: <En><b>while</b></En> + פעולה ארוכה (‎-ing), <En><b>when</b></En> + פעולה קצרה.</Tip>
    <Task k="א" en="Past simple or past progressive?">השלימו את שני הפעלים בזמן המתאים.</Task>
    <Ex items={WW_A} gap="1.6mm" />
    <Task k="ב" en="Join the sentences with the word in brackets.">חברו את שני המשפטים למשפט אחד.</Task>
    <Ex items={WW_B} start={9} line gap="0.5mm" />
  </S>
}

function PerfectPage({ n }) {
  return <S n={n} arts={['✈']} en="Present Perfect — First Steps" he="הווה מושלם — היכרות">
    <Rule title="מבנה: have / has + V3 (צורה שלישית)">
      <Ltr>I / you / we / they <b>have</b> (<b>'ve</b>) seen • he / she / it <b>has</b> (<b>'s</b>) seen<br />
        I <b>haven't</b> seen it. • <b>Has</b> she <b>seen</b> it? — Yes, she has. / No, she hasn't.</Ltr>
    </Rule>
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="1. ניסיון בחיים (בלי זמן)" style={{ flex: 1, background: 'white' }}>
        <Ltr>I <b>have visited</b> London.<br /><b>Have</b> you ever <b>eaten</b> sushi?</Ltr>
      </Rule>
      <Rule title="2. קרה בעבר — התוצאה עכשיו" style={{ flex: 1, background: 'white' }}>
        <Ltr>I<b>'ve lost</b> my keys.<br />(עכשיו אין לי מפתחות)</Ltr>
      </Rule>
    </div>
    <Tip e="🔴">כשאומרים <b>מתי</b> (<En>yesterday, last year, in 2020</En>) — עוברים לעבר פשוט: <En>I visited London <b>last year</b>.</En></Tip>
    <Task k="א" en="Complete with the present perfect.">השלימו בהווה מושלם.</Task>
    <Ex items={PERF_A} cols={2} />
    <Task k="ב" en="Have you ever…? Ask a friend and write the answers.">שאלו חבר/ה ורשמו. אחר כך כתבו שני משפטים עליו/ה.</Task>
    <Table head={['Have you ever…?', 'Yes, I have. / No, I haven\'t.']} rows={EVER.map(([q]) => [`… ${q}?`, ''])} widths={['55%', '45%']} fs="10pt" />
    <Ltr style={{ fontSize: '10.2pt', color: '#444' }}>Example: Yuval has ridden a horse, but he hasn't been on TV.</Ltr>
    <Lines n={2} />
  </S>
}

function EverYetPage({ n }) {
  return <S n={n} arts={['🧠']} en="ever, never, just, already, yet" he="מילים שבאות עם הווה מושלם">
    <Table head={['word', 'משמעות', 'מקום במשפט', 'example']} rows={[
      ['ever', 'אי־פעם', 'בשאלות, לפני V3', 'Have you ever met a celebrity?'],
      ['never', 'אף פעם', 'לפני V3', "I've never broken a bone."],
      ['just', 'הרגע', 'לפני V3', "She's just left."],
      ['already', 'כבר', 'לפני V3 (במשפט חיובי)', "We've already eaten."],
      ['yet', 'עדיין (לא) / כבר?', 'בסוף שלילה או שאלה', "I haven't finished yet. • Has he called yet?"],
    ]} widths={['12%', '20%', '28%', '40%']} />
    <Task k="א" en="Circle the correct word.">הקיפו את המילה הנכונה.</Task>
    <Ex items={ADV_A} gap="1.1mm" />
    <Task k="ב" en="Past simple or present perfect?">עבר פשוט או הווה מושלם? שימו לב למילות הזמן.</Task>
    <Ex items={PSPP} start={9} cols={2} />
    <Rule title="been או gone?" style={{ background: 'white' }}>
      <Ltr>He <b>has gone</b> to Eilat. = הוא נסע לאילת (ועדיין שם).<br />He <b>has been</b> to Eilat. = הוא היה באילת (וחזר).</Ltr>
    </Rule>
  </S>
}

function V3Page({ n }) {
  return <S n={n} arts={['🔑']} en="Past Participles (V3)" he="הצורה השלישית של פעלים חריגים — מחולקת לקבוצות">
    <div dir="ltr" style={{ columnCount: 2, columnGap: '6mm', fontSize: '9.4pt', lineHeight: 1.32, textAlign: 'left' }}>
      {V3.map(([g, list]) => <div key={g} style={{ breakInside: 'avoid', marginBottom: '2mm' }}>
        <div dir="rtl" style={{ fontWeight: 800, color: ACCENT, borderBottom: '1px solid #9aa5b5', textAlign: 'right' }}>{g}</div>
        {list.map(([a, b, c]) => <div key={a} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr' }}><span>{a}</span><span>{b}</span><b>{c}</b></div>)}
      </div>)}
    </div>
    <Task k="א" en="Write the V3 form.">כתבו את הצורה השלישית — קודם בלי להציץ!</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2.5mm 4mm', fontSize: '10.8pt', margin: '1mm 0 2mm' }}>
      {V3_EX.map(([v], i) => <div key={v}>{i + 1}. {v} → ________</div>)}
    </div>
  </S>
}

function CountPage({ n }) {
  return <S n={n} arts={['🍞', '🍎']} en="Countable & Uncountable" he="ספיר ולא ספיר — much, many, a few, a little">
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="ספיר — Countable" style={{ flex: 1 }}>
        אפשר לספור: <En>an apple, two apples</En>
        <Ltr><b>many</b> • <b>a few</b> • How <b>many</b>…?</Ltr>
      </Rule>
      <Rule title="לא ספיר — Uncountable" style={{ flex: 1 }}>
        אין <En>a / an</En> ואין רבים: <En>water, money, bread</En>
        <Ltr><b>much</b> • <b>a little</b> • How <b>much</b>…?</Ltr>
      </Rule>
    </div>
    <Rule title="מתאים לשניהם" style={{ background: 'white' }}>
      <Ltr><b>some</b> (positive, offers) • <b>any</b> (negatives, questions) • <b>a lot of / lots of</b></Ltr>
      זהירות — לא ספירים באנגלית: <En><b>information, advice, homework, furniture, news</b></En>. <En>The news <b>is</b> good. • <b>a piece of</b> advice</En>
    </Rule>
    <Task k="א" en="Sort the words: C (countable) or U (uncountable).">מיינו: כתבו C או U ליד כל מילה.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2mm', fontSize: '10.5pt', margin: '0 0 1.5mm' }}>
      {CU_WORDS.map((w, i) => <div key={w}>{i + 1}. {w} ___</div>)}
    </div>
    <Task k="ב" en="Circle the correct word.">הקיפו את המילה הנכונה.</Task>
    <Ex items={CU_B} start={13} cols={2} />
    <Task k="ג" en="Correct the mistakes.">תקנו את הטעות.</Task>
    <Ex items={CU_C} start={21} line gap="0.4mm" />
  </S>
}

function AdverbPage({ n }) {
  return <S n={n} arts={['🚗']} en="Adverbs of Manner" he="תוארי פועל — איך עושים את הפעולה?">
    <Rule title="שם תואר או תואר פועל?">
      <b>שם תואר</b> מתאר שם עצם: <En>a <b>quick</b> runner</En> • <b>תואר פועל</b> מתאר פועל: <En>She runs <b>quickly</b>.</En>
    </Rule>
    <Table head={['rule', 'adjective → adverb']} rows={[
      ['+ ly', 'slow → slowly • careful → carefully • quiet → quietly'],
      ['y → ily', 'easy → easily • happy → happily'],
      ['le → ly', 'gentle → gently • terrible → terribly'],
      ['חריגים', 'good → well • fast → fast • hard → hard • late → late • early → early'],
    ]} widths={['18%', '82%']} />
    <Tip e="🔴"><En><b>hardly</b></En> = כמעט לא (<En>I hardly slept</En>), ו־<En><b>lately</b></En> = לאחרונה. תואר הפועל בא בדרך כלל <b>אחרי</b> המושא: <En>She speaks English <b>well</b>.</En></Tip>
    <Task k="א" en="Adjective or adverb? Write the correct form.">כתבו שם תואר או תואר פועל.</Task>
    <Ex items={ADVB_A} gap="1.1mm" />
    <Task k="ב" en="Correct the sentences.">תקנו את המשפטים.</Task>
    <Ex items={ADVB_B} start={9} line gap="0.4mm" />
  </S>
}

function PassivePage({ n }) {
  return <S n={n} arts={['🐝']} en="The Passive (Present Simple)" he="סביל בהווה — מה נעשה, ולא מי עשה">
    <Rule title="מבנה: am / is / are + V3">
      משתמשים בסביל כשהפעולה חשובה יותר ממי שעושה אותה, או כשלא יודעים מי עשה.
      <Ltr style={{ marginTop: '1mm' }}>Active: People <b>speak</b> Hebrew in Israel. → Passive: Hebrew <b>is spoken</b> in Israel.<br />
        Active: Bees <b>make</b> honey. → Passive: Honey <b>is made</b> <b>by</b> bees.</Ltr>
    </Rule>
    <Table head={['', 'example']} rows={[['+', 'These shoes are made in Italy.'], ['−', "Phones aren't allowed in class."], ['?', 'Is breakfast included? — Yes, it is.']]} widths={['6%', '94%']} />
    <Task k="א" en="Complete with the present passive.">השלימו בסביל בהווה.</Task>
    <Ex items={PASS_A} cols={2} />
    <Task k="ב" en="Rewrite in the passive. Use 'by' only when it is important.">העבירו לסביל.</Task>
    <Ex items={PASS_B} start={9} line gap="0.4mm" />
  </S>
}

function MixPage({ n }) {
  return <S n={n} arts={['🧠']} en="Grammar Mix" he="חזרה על הדקדוק של כיתה ח׳">
    <Task k="א" en="Choose the correct answer.">הקיפו את התשובה הנכונה.</Task>
    <MC items={MIX} cols={2} />
    <Task k="ב" en="Find the mistake and correct it.">בכל משפט טעות אחת. מתחו קו מתחתיה וכתבו את התיקון.</Task>
    <Ex items={MIX_FIX} start={13} line gap="0.5mm" />
    <Tip e="🔑">בדקו את עצמכם: האם יש מילת זמן (<En>yesterday, ever, while</En>)? האם השם ספיר? האם עושים את הפעולה או שהיא נעשית?</Tip>
  </S>
}

function TechPage({ n }) {
  return <S n={n} arts={['💻', '📱']} en="Vocabulary: Technology & Media" he="אוצר מילים ברמת Band II — טכנולוגיה ותקשורת">
    <WordBank words={TECH} />
    <Task k="א" en="Complete with a word from the list.">השלימו במילה מהרשימה.</Task>
    <Ex items={TECH_A} gap="1.5mm" />
    <Task k="ב" en="Verb → noun: add -tion / -sion.">הפכו פועל לשם עצם.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5mm 6mm', fontSize: '10.8pt', margin: '0 0 2mm' }}>
      {TECH_B.map(([v], i) => <div key={v}>{i + 7}. {v} → ____________</div>)}
    </div>
    <Task k="ג">כתבו שני כללים לשימוש בטוח ברשת. השתמשו ב־<En>should</En> או ב־<En>mustn't</En>.</Task>
    <Lines n={2} />
  </S>
}

function EnvPage({ n }) {
  return <S n={n} arts={['🌳', '💪']} en="Vocabulary: Environment & Health" he="אוצר מילים ברמת Band II — סביבה ובריאות">
    <WordBank words={ENV} />
    <Task k="א" en="Complete with a word from the list.">השלימו במילה מהרשימה.</Task>
    <Ex items={ENV_A} gap="1.5mm" />
    <Rule title="תחיליות: un- / dis- = לא • re- = שוב" style={{ background: 'white' }}>
      <Ltr>un + happy = <b>unhappy</b> • dis + appear = <b>disappear</b> • re + use = <b>reuse</b></Ltr>
    </Rule>
    <Task k="ב" en="Write one word with a prefix.">כתבו מילה אחת עם תחילית.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5mm 6mm', fontSize: '10.8pt' }}>
      {PREFIX.map(([d], i) => <div key={d}>{i + 7}. {d} = ____________</div>)}
    </div>
  </S>
}

function UnseenPage({ n, u, idx, arts }) {
  return <S n={n} arts={arts} en={`Unseen ${idx}`} he="הבנת הנקרא — קוראים את הטקסט ועונים באנגלית">
    <Passage title={u.title} kind={u.kind} paras={u.paras} fs="10pt" lh={1.4} />
    {u.glossary && <Glossary words={u.glossary} />}
    <Questions items={u.qs} fs="10pt" />
  </S>
}

function WritingPage({ n }) {
  return <S n={n} arts={['✏']} en="Writing: A Short Story" he="כתיבה — סיפור קצר (80–100 מילים)">
    <Rule title="המשימה">
      כתבו סיפור שמתחיל במשפט: <En><b>"I was walking home from school when I heard a strange noise…"</b></En>
    </Rule>
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="מתכננים לפני שכותבים" style={{ flex: 1, background: 'white' }}>
        <Ltr style={{ fontSize: '9.8pt', lineHeight: 1.7 }}>Who? ____________________<br />Where? ___________________<br />What happened? ____________<br />How did it end? ___________<br />How did you feel? __________</Ltr>
      </Rule>
      <Rule title="מילים שמזיזות את הסיפור" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.8pt' }}>suddenly • at first • then • after that • a few minutes later • while • when • finally • in the end</Ltr>
        <Ltr style={{ fontSize: '9.8pt', marginTop: '1mm' }}>I felt scared / relieved / curious / embarrassed.</Ltr>
      </Rule>
    </div>
    <Lines n={12} />
    <Rule title="רשימת בדיקה" style={{ background: 'white', marginTop: '2mm' }}>
      <Checklist items={['יש לסיפור כותרת', 'השתמשתי בעבר פשוט ובעבר מתמשך', 'השתמשתי ב־when או ב־while', 'יש לפחות שלוש מילות זמן', 'יש לפחות תואר פועל אחד (‎-ly)', 'יש התחלה, אמצע וסוף', '80–100 מילים', 'בדקתי איות, אות גדולה ונקודות']} />
    </Rule>
  </S>
}

function TestAPage({ n }) {
  return <S n={n} arts={['📄']} en="Summary Test — Part A" he="מבחן מסכם — חלק א׳: הבנת הנקרא (40 נקודות)">
    <Tip e="🕒">זמן מומלץ לכל המבחן: 45 דקות. עונים לבד, בלי לחזור לעמודים הקודמים. בסוף בודקים בדף התשובות.</Tip>
    <Passage title={T_TEXT.title} kind={T_TEXT.kind} paras={T_TEXT.paras} />
    <Glossary words={[['recover', 'להחלים'], ['complicated', 'מסובך'], ['stove', 'כיריים'], ['heal', 'להחלים, להירפא']]} />
    <Task k="א" en="Answer the questions." pts={40}>ענו על השאלות (8 נקודות לכל שאלה).</Task>
    <Questions items={T_TEXT.qs} />
  </S>
}

function TestBPage({ n }) {
  return <S n={n} arts={['📄']} en="Summary Test — Part B" he="מבחן מסכם — חלק ב׳: אוצר מילים, דקדוק וכתיבה">
    <Task k="ב" en="Complete with a word from the box. One word is extra." pts={20}>השלימו במילה מהתיבה (4 נקודות לכל משפט). מילה אחת מיותרת.</Task>
    <Box words={['password', 'recycle', 'reliable', 'habit', 'pollution', 'delete']} />
    <Ex items={T_VOC} gap="1mm" />
    <Task k="ג" en="Circle the correct answer." pts={30}>הקיפו את התשובה הנכונה (3 נקודות לכל משפט).</Task>
    <Ex items={T_GRAM} start={6} cols={2} gap="1mm" />
    <Task k="ד" en="Write 5–6 sentences: Describe something you have never done but would like to try. Why?" pts={10}>כתיבה:</Task>
    <Lines n={5} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3mm', marginTop: '2mm', fontSize: '10.5pt', fontWeight: 700 }}>
      {['א: ___ / 40', 'ב: ___ / 20', 'ג: ___ / 30', 'ד: ___ / 10', 'סה״כ: ___ / 100'].map(t => <span key={t} style={{ border: '1.5px solid #111', borderRadius: 8, padding: '1mm 2.5mm' }}>{t}</span>)}
    </div>
  </S>
}

export default function EnglishGrade8Booklet() {
  const cu = w => (['apple', 'chair', 'coin', 'egg', 'idea', 'sandwich'].includes(w) ? 'C' : 'U')
  const key1 = [
    { title: 'עמוד 3 — Past Progressive', answers: [...exKey(PROG_A), ...DANA.filter(d => d[0] !== '10:00').map(d => d[2])] },
    { title: 'עמוד 4 — when / while', answers: [...exKey(WW_A), ...exKey(WW_B)] },
    { title: 'עמוד 5 — Present Perfect', note: 'מס׳ 9 — צורות V3 לתרגיל ב׳ (התשובות עצמן אישיות).', answers: [...exKey(PERF_A), `ridden, met, won, been, cooked`] },
    { title: 'עמוד 6 — ever / yet…', answers: [...exKey(ADV_A), ...exKey(PSPP)] },
    { title: 'עמוד 7 — V3', answers: V3_EX.map(v => v[1]) },
    { title: 'עמוד 8 — Countable / Uncountable', answers: [...CU_WORDS.map(w => `${w} ${cu(w)}`), ...exKey(CU_B), ...exKey(CU_C)] },
    { title: 'עמוד 9 — Adverbs', answers: [...exKey(ADVB_A), ...exKey(ADVB_B)] },
    { title: 'עמוד 10 — Passive', answers: [...exKey(PASS_A), ...exKey(PASS_B)] },
    { title: 'עמוד 11 — Grammar Mix', answers: [...mcKey(MIX), ...exKey(MIX_FIX)] },
  ]
  const key2 = [
    { title: 'עמוד 12 — טכנולוגיה', answers: [...exKey(TECH_A), ...TECH_B.map(t => t[1])] },
    { title: 'עמוד 13 — סביבה ובריאות', answers: [...exKey(ENV_A), ...PREFIX.map(p => p[1])] },
    { title: 'עמוד 14 — Unseen 1', note: 'בשאלות הפתוחות מקבלים כל ניסוח נכון.', answers: qKey(U1.qs) },
    { title: 'עמוד 15 — Unseen 2', answers: qKey(U2.qs) },
    { title: 'עמוד 16 — Unseen 3', answers: qKey(U3.qs) },
    { title: 'עמוד 18 — מבחן: הבנת הנקרא', answers: qKey(T_TEXT.qs) },
    { title: 'עמוד 19 — מבחן: אוצר מילים (המילה המיותרת: delete)', answers: exKey(T_VOC) },
    { title: 'עמוד 19 — מבחן: דקדוק', start: 6, answers: exKey(T_GRAM) },
    { title: 'עמוד 17 + 19 — כתיבה', note: 'בודקים לפי רשימת הבדיקה שבעמוד 17. במבחן: הווה מושלם (I have never…) ומשפט נימוק עם because.', answers: [] },
  ]
  const mapRows = [
    [3, 'Past Progressive', 'was / were + ‎-ing'], [4, 'when / while', 'שני זמני עבר יחד'], [5, 'Present Perfect', 'have / has + V3'],
    [6, 'ever, just, yet…', 'הווה מושלם או עבר פשוט?'], [7, 'V3', '45 פעלים חריגים בקבוצות'], [8, 'Countable / Uncountable', 'much, many, a few, a little'],
    [9, 'Adverbs', '‎-ly, well, hard, fast'], [10, 'Passive', 'is / are + V3'], [11, 'Grammar Mix', 'חזרה מסכמת'],
    ['12–13', 'Vocabulary', '48 מילים ברמת Band II ובניית מילים'], ['14–16', 'Unseens', 'סיפור, כתבה וכתבה מעיתון בית הספר'], ['17–19', 'Writing & Test', 'סיפור קצר ומבחן מסכם'],
  ]
  return <>
    <TeenCover accent={ACCENT} arts={['📚', '💻', '🌳', '✏']} en="English Workbook · Grade 8" title="חוברת אנגלית לכיתה ח׳"
      sub="דקדוק, אוצר מילים, הבנת הנקרא וכתיבה — עם מבחן מסכם ודף תשובות" pages={PAGES}
      note="החוברת עוברת על הנושאים המרכזיים של כיתה ח׳: עבר מתמשך, היכרות עם הווה מושלם, ספיר ולא ספיר, תוארי פועל וסביל. בכל עמוד הסבר קצר בעברית ותרגול באנגלית, ובסוף מבחן מסכם ודף תשובות מלא." />
    <MapPage n={2} accent={ACCENT} rows={mapRows}
      intro="החוברת בנויה מארבעה חלקים: דקדוק (עמודים 3–11), אוצר מילים (12–13), הבנת הנקרא וכתיבה (14–17), ומבחן מסכם (18–19). אחרי כל עמוד בודקים בדף התשובות, מסמנים ✓ וכותבים אם צריך לחזור על הנושא."
      tips={['לומדים 10 פעלים מעמוד 7 בכל יום — בקול.', 'בכל משפט מחפשים קודם את מילת הזמן.', 'במילים חדשות: כותבים משפט משלכם, לא רק תרגום.', 'בטקסטים: מסמנים בטקסט את המקום שבו מצאתם כל תשובה.']}
      terms={[['verb', 'פועל'], ['noun', 'שם עצם'], ['adjective', 'שם תואר'], ['adverb', 'תואר פועל'], ['past participle (V3)', 'צורה שלישית'], ['active', 'פעיל'], ['passive', 'סביל'], ['countable', 'ספיר'], ['prefix', 'תחילית'], ['suffix', 'סופית']]} />
    <PastProgPage n={3} />
    <WhenWhilePage n={4} />
    <PerfectPage n={5} />
    <EverYetPage n={6} />
    <V3Page n={7} />
    <CountPage n={8} />
    <AdverbPage n={9} />
    <PassivePage n={10} />
    <MixPage n={11} />
    <TechPage n={12} />
    <EnvPage n={13} />
    <UnseenPage n={14} u={U1} idx={1} arts={['🚌']} />
    <UnseenPage n={15} u={U2} idx={2} arts={['🐢']} />
    <UnseenPage n={16} u={U3} idx={3} arts={['🤖']} />
    <WritingPage n={17} />
    <TestAPage n={18} />
    <TestBPage n={19} />
    <KeyPage n={20} accent={ACCENT} he="דף תשובות (1) — דקדוק" sections={key1} />
    <KeyPage n={21} accent={ACCENT} he="דף תשובות (2) — אוצר מילים, קריאה ומבחן" sections={key2} />
    <TeenCertificate accent={ACCENT} booklet="חוברת האנגלית לכיתה ח׳" done="דקדוק, אוצר מילים, שלושה טקסטים, כתיבה ומבחן מסכם." />
  </>
}

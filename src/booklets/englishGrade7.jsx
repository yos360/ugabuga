import { bookletBySlug } from './registry'
import { Box, Checklist, En, Ex, Glossary, KeyPage, Lines, Ltr, MapPage, MC, Passage, Questions, Rule, Sheet, Table, Task, TeenCertificate, TeenCover, Tip, WordBank } from './englishTeenKit'
import { exKey, mcKey, qKey } from './englishTeenKeys'

// "חוברת אנגלית לכיתה ז׳" — grammar of the first middle-school year (present simple / progressive, past
// simple, will / going to, comparatives, can / must / should), Band I vocabulary with Hebrew, three original
// unseens, an email writing task with a checklist, a 100-point summary test, a two-page key and a certificate.
// Exercises keep their answers next to them ([text, answer]) so the key is built from the same data.
const PAGES = bookletBySlug('english-grade-7').pages
const ACCENT = '#1d6f6a'
const S = props => <Sheet accent={ACCENT} {...props} />

// ---------- Grammar data ----------
const PS_A = [
  ['My sister ________ (watch) TV every evening.', 'watches'],
  ['We ________ (not / eat) meat.', "don't eat"],
  ['The bus ________ (leave) at 7:30 every morning.', 'leaves'],
  ['________ your brother ________ (play) basketball?', 'Does … play'],
  ['Noa ________ (study) English on Mondays.', 'studies'],
  ['Cats ________ (not / like) water.', "don't like"],
  ['He never ________ (go) to bed before 11.', 'goes'],
  ['________ they ________ (live) near the school?', 'Do … live'],
  ['The sun ________ (rise) in the east.', 'rises'],
  ['My dad ________ (fix) old bikes as a hobby.', 'fixes'],
]
const PS_B = [
  ['I am late for school. (never)', 'I am never late for school.'],
  ['Tom eats breakfast. (always)', 'Tom always eats breakfast.'],
  ['We go to the beach on Saturdays. (often)', 'We often go to the beach on Saturdays.'],
  ['She is tired after practice. (usually)', 'She is usually tired after practice.'],
]
const PP_A = [
  ['Look! The baby ________ (sleep).', 'is sleeping'],
  ['I ________ (write) an email right now.', 'am writing'],
  ["They ________ (not / swim) today because it's cold.", "aren't swimming"],
  ['________ you ________ (listen) to me?', 'Are … listening'],
  ['Dan ________ (sit) next to Maya at the moment.', 'is sitting'],
  ['We ________ (make) a video for our project this week.', 'are making'],
  ['Listen! Someone ________ (knock) on the door.', 'is knocking'],
  ['She ________ (not / run); she ________ (walk).', "isn't running; is walking"],
]
const PP_B = [
  ['Shira (plays / is playing) the piano every day.', 'plays'],
  ['Be quiet! The teacher (talks / is talking).', 'is talking'],
  ["I (don't understand / am not understanding) this word.", "don't understand"],
  ['My parents (work / are working) in Haifa.', 'work'],
  ['Look, it (rains / is raining)! Take an umbrella.', 'is raining'],
  ['Water (boils / is boiling) at 100°C.', 'boils'],
  ['What (do you do / are you doing) now?', 'are you doing'],
  ['He (wants / is wanting) a new phone.', 'wants'],
]
const PAST_A = [
  ['We ________ (visit) our grandparents last weekend.', 'visited'],
  ['The game ________ (start) at 8 o\'clock.', 'started'],
  ['I ________ (try) to call you yesterday.', 'tried'],
  ['She ________ (stop) the video and ________ (smile).', 'stopped, smiled'],
  ['They ________ (not / enjoy) the movie.', "didn't enjoy"],
  ['________ you ________ (finish) your homework?', 'Did … finish'],
]
const PAST_B = [
  ['I ________ at home yesterday.', 'was'],
  ['The tests ________ very hard.', 'were'],
  ['________ Yoni at the party last night?', 'Was'],
  ['We ________ (not) tired after the trip.', "weren't"],
]
const PAST_C = [
  ['Lior played football yesterday.', "Lior didn't play football yesterday. / Did Lior play football yesterday?"],
  ['They went to Eilat last summer.', "They didn't go to Eilat last summer. / Did they go to Eilat last summer?"],
]
const IRREGULAR = [
  ['be', 'was / were', 'להיות'], ['begin', 'began', 'להתחיל'], ['break', 'broke', 'לשבור'], ['bring', 'brought', 'להביא'],
  ['buy', 'bought', 'לקנות'], ['come', 'came', 'לבוא'], ['do', 'did', 'לעשות'], ['drink', 'drank', 'לשתות'],
  ['eat', 'ate', 'לאכול'], ['fall', 'fell', 'ליפול'], ['feel', 'felt', 'להרגיש'], ['find', 'found', 'למצוא'],
  ['forget', 'forgot', 'לשכוח'], ['get', 'got', 'לקבל, להשיג'], ['give', 'gave', 'לתת'], ['go', 'went', 'ללכת, לנסוע'],
  ['have', 'had', 'יש ל־'], ['know', 'knew', 'לדעת, להכיר'], ['leave', 'left', 'לעזוב, לצאת'], ['lose', 'lost', 'לאבד, להפסיד'],
  ['make', 'made', 'להכין, לייצר'], ['meet', 'met', 'לפגוש'], ['pay', 'paid', 'לשלם'], ['put', 'put', 'לשים'],
  ['read', 'read', 'לקרוא'], ['run', 'ran', 'לרוץ'], ['say', 'said', 'לומר'], ['see', 'saw', 'לראות'],
  ['sleep', 'slept', 'לישון'], ['speak', 'spoke', 'לדבר'], ['swim', 'swam', 'לשחות'], ['take', 'took', 'לקחת'],
  ['tell', 'told', 'לספר'], ['think', 'thought', 'לחשוב'], ['win', 'won', 'לנצח, לזכות'], ['write', 'wrote', 'לכתוב'],
]
const STORY = [['go', 'went'], ['take', 'took'], ['bring', 'brought'], ['buy', 'bought'], ['swim', 'swam'], ['be', 'was'], ['lose', 'lost'], ['find', 'found'], ['have', 'had']]
const FUT_A = [
  ['"The phone is ringing." "I ________ answer it."', "'ll (will)"],
  ['We ________ visit Rome next summer. We bought the tickets yesterday.', 'are going to'],
  ['Look at that dark sky! It ________ rain.', 'is going to'],
  ['I promise I ________ tell anyone your secret.', "won't"],
  ['In 2050, people ________ probably travel in flying taxis.', 'will'],
  ['She ________ study medicine. She decided last year.', 'is going to'],
  ['"I\'m thirsty." "Wait, I ________ get you some water."', "'ll (will)"],
  ["Don't worry, the test ________ be too hard.", "won't"],
]
const COMP_A = [
  ['A cheetah is ________ (fast) than a horse.', 'faster'],
  ['This is the ________ (good) pizza in town.', 'best'],
  ['My bag is ________ (heavy) than yours.', 'heavier'],
  ['For me, math is ________ (difficult) than art.', 'more difficult'],
  ['Mount Everest is the ________ (high) mountain in the world.', 'highest'],
  ['Today is ________ (hot) than yesterday.', 'hotter'],
  ['That was the ________ (bad) day of my life!', 'worst'],
  ['The shore of the Dead Sea is the ________ (low) place on land on Earth.', 'lowest'],
]
const COMP_B = [
  ['Eilat (35°C) / Jerusalem (28°C) — hot', 'Eilat is hotter than Jerusalem.'],
  ['a phone (₪2,000) / a pen (₪5) — expensive', 'A phone is more expensive than a pen.'],
  ['Noa (1.60 m) / Tamar (1.60 m) — tall (as … as)', 'Noa is as tall as Tamar.'],
  ['Book A (★★★★) / Book B (★★★★★) — good', 'Book B is better than Book A.'],
]
const MOD_A = [
  ["You ________ use your phone during the test. It's against the rules. (mustn't / can)", "mustn't"],
  ['My little brother is only five, but he ________ swim. (can / must)', 'can'],
  ['You look tired. You ________ go to bed early tonight. (should / can\'t)', 'should'],
  ['Drivers ________ stop at a red light. It\'s the law. (must / can)', 'must'],
  ["I ________ come to the party; I have a test the next day. (can't / mustn't)", "can't"],
  ["You ________ eat so much sugar. It's bad for your teeth. (shouldn't / can't)", "shouldn't"],
  ['________ I open the window, please? (Can / Must)', 'Can'],
  ['Students ________ wear a uniform at our school. It\'s a rule. (must / should)', 'must'],
]
const MOD_B = [
  ['She cans speak three languages.', 'She can speak three languages.'],
  ['You must to wear a helmet.', 'You must wear a helmet.'],
  ['He should studies more.', 'He should study more.'],
  ["We don't can go out today.", "We can't go out today."],
]
const MIX = [
  ['Yesterday I ________ a great movie.', ['see', 'saw', 'am seeing'], 1],
  ['Right now my mom ________ dinner.', ['cooks', 'cooked', 'is cooking'], 2],
  ['________ Dana speak French?', ['Do', 'Does', 'Is'], 1],
  ['I think it ________ be sunny tomorrow.', ['will', 'is', 'was'], 0],
  ['This test is ________ than the last one.', ['easyer', 'easier', 'more easy'], 1],
  ["You ________ touch that wire. It's dangerous!", ["mustn't", 'can', 'should'], 0],
  ['We ________ at school last Sunday.', ['was', 'were', 'are'], 1],
  ['He ________ like spicy food.', ["don't", "isn't", "doesn't"], 2],
  ['She is one of the ________ players on the team.', ['better', 'best', 'good'], 1],
  ['Look! The kids ________ in the rain.', ['dance', 'are dancing', 'danced'], 1],
  ["I'm going to ________ my cousins next week.", ['visit', 'visiting', 'visited'], 0],
  ['Did you ________ the news?', ['hear', 'heard', 'hearing'], 0],
]
const MIX_FIX = [
  ['My friends lives in Tel Aviv.', 'lives → live'],
  ["I didn't went to school yesterday.", 'went → go'],
  ['She is more taller than me.', 'more taller → taller'],
  ['They will to help us.', 'will to help → will help'],
]

// ---------- Vocabulary ----------
const VOC1 = [
  ['subject', 'מקצוע לימוד'], ['homework', 'שיעורי בית'], ['break', 'הפסקה'], ['borrow', 'לשאול (חפץ), ללוות'], ['lend', 'להשאיל'], ['explain', 'להסביר'],
  ['ask', 'לשאול (שאלה)'], ['answer', 'תשובה; לענות'], ['easy', 'קל'], ['difficult', 'קשה'], ['early', 'מוקדם'], ['late', 'מאוחר'],
  ['quiet', 'שקט'], ['noisy', 'רועש'], ['begin', 'להתחיל'], ['finish', 'לסיים'], ['remember', 'לזכור'], ['forget', 'לשכוח'],
  ['practice', 'תרגול; לתרגל'], ['mistake', 'טעות'], ['correct', 'נכון; לתקן'], ['team', 'קבוצה'], ['win', 'לנצח'], ['lose', 'להפסיד; לאבד'],
]
const VOC1_A = [['early', 'late'], ['easy', 'difficult'], ['quiet', 'noisy'], ['begin', 'finish'], ['remember', 'forget'], ['win', 'lose']]
const VOC1_B = [
  ['Can I ________ your pen? I forgot mine.', 'borrow'],
  ['The teacher will ________ the new rule again.', 'explain'],
  ["Don't worry, everyone makes a ________ sometimes.", 'mistake'],
  ['Our ________ won the game 3–1.', 'team'],
  ['My favorite ________ is history.', 'subject'],
  ['If you ________ every day, you will get better.', 'practice'],
]
const VOC2 = [
  ['proud', 'גאה'], ['worried', 'מודאג'], ['angry', 'כועס'], ['bored', 'משועמם'], ['excited', 'נרגש'], ['afraid', 'מפחד'],
  ['surprised', 'מופתע'], ['friendly', 'ידידותי'], ['lonely', 'בודד'], ['neighbor', 'שכן'], ['crowded', 'צפוף, הומה'], ['dangerous', 'מסוכן'],
  ['safe', 'בטוח'], ['healthy', 'בריא'], ['famous', 'מפורסם'], ['journey', 'מסע'], ['village', 'כפר'], ['country', 'ארץ, מדינה'],
  ['future', 'עתיד'], ['important', 'חשוב'], ['decide', 'להחליט'], ['believe', 'להאמין'], ['choose', 'לבחור'], ['dream', 'חלום; לחלום'],
]
const VOC2_A = [
  ['The movie was so ________ that I fell asleep. (bored / boring)', 'boring'],
  ["I'm ________ about the trip tomorrow! (excited / exciting)", 'excited'],
  ['Dan was ________ to see snow in Tel Aviv. (surprised / surprising)', 'surprised'],
  ['This book is really ________. (interested / interesting)', 'interesting'],
  ["My mom is ________ because I'm late. (worried / worrying)", 'worried'],
  ['The news was ________. (surprised / surprising)', 'surprising'],
]
const VOC2_B = [
  ["The bus was so ________ that we couldn't find a seat.", 'crowded'],
  ["It's ________ to swim when there is a black flag on the beach.", 'dangerous'],
  ["I'm ________ of my little sister — she won first prize!", 'proud'],
  ['He moved to a new city and felt ________ because he had no friends there.', 'lonely'],
  ["It's hard to ________ between pizza and pasta!", 'choose'],
  ['Our ________ always waters our plants when we are away.', 'neighbor'],
]

// ---------- Unseens ----------
const U1 = {
  title: 'The Phone in the Park', kind: 'A story',
  paras: [
    'Last Tuesday, Omer was walking home from school through the park when he saw something on a bench. It was a phone with a blue cover. Nobody was near the bench, and the phone was ringing.',
    'Omer didn\'t know what to do. At first, he wanted to leave it there. "It\'s not my problem," he thought. But then he remembered the day he lost his own phone on a bus. He felt terrible for two days, until the bus driver called his mother.',
    'So Omer answered the phone. A woman said, "Hello? That\'s my daughter\'s phone! Where are you?" Omer explained that he was in the park, next to the big fountain. Ten minutes later, a girl about his age ran towards him. Her name was Lia, and she was almost crying.',
    '"Thank you so much," she said. "All my photos are on this phone." The next morning, Omer was surprised to see Lia in his school. She was a new student in class 7C. At the break, she gave him a chocolate bar and a note: "To the most honest boy in the park."',
  ],
  glossary: [['bench', 'ספסל'], ['fountain', 'מזרקה'], ['towards', 'לעבר'], ['honest', 'ישר']],
  qs: [
    { q: 'Where did Omer find the phone?', a: 'On a bench in the park.' },
    { q: 'Who was calling the phone?', a: "Lia's mother (the owner's mother)." },
    { q: 'Why did Omer decide not to leave the phone on the bench?', opts: ['He wanted a reward.', 'He remembered how he felt when he lost his own phone.', 'Lia asked him to wait.'], a: 1 },
    { q: 'Complete: Omer told the woman that he was next to ________.', a: 'the big fountain' },
    { q: 'True or false? Lia was calm when she arrived. Copy the words that show it.', a: 'False — "she was almost crying."', lines: 1 },
    { q: '"It\'s not my problem," he thought (paragraph 2). This shows that at first Omer…', opts: ["didn't want to get involved", 'was angry at Lia', 'was afraid of the phone'], a: 0 },
    { q: 'Find a word in paragraph 4 that means "a person who tells the truth and doesn\'t take what isn\'t his".', a: 'honest' },
    { q: 'What would you do if you found a phone in the park? Why?', a: 'תשובה אישית', lines: 1 },
  ],
}
const U2 = {
  title: 'The Hoopoe: Israel\'s National Bird', kind: 'An article',
  paras: [
    'In 2008, when Israel was 60 years old, thousands of people voted for a national bird. The winner was the hoopoe, called "duchifat" in Hebrew. Today you can see it on posters, stamps and even school notebooks.',
    'The hoopoe is easy to recognize. It has orange-brown feathers, black and white stripes on its wings, and a beautiful crown of feathers on its head. Usually the crown lies flat, but the bird raises it when it is excited or afraid.',
    'The hoopoe has a long, thin beak. It uses it to dig in the ground for insects and worms. That is why you often see hoopoes walking on lawns in parks and gardens. Its name in English comes from its call: "oop-oop-oop."',
    'Hoopoes build their nests in holes in trees or walls. They also have an unusual way of protecting their babies. The mother and the young birds can produce a liquid that smells terrible, like rotten meat. Most animals stay away!',
  ],
  glossary: [['vote', 'להצביע'], ['feathers', 'נוצות'], ['beak', 'מקור'], ['lawn', 'מדשאה'], ['liquid', 'נוזל'], ['rotten', 'רקוב']],
  qs: [
    { q: 'How did Israel choose its national bird?', a: 'Thousands of people voted (in 2008).' },
    { q: 'When does the hoopoe raise its crown?', opts: ['when it eats', 'when it is excited or afraid', 'when it sleeps'], a: 1 },
    { q: 'The word "It" in paragraph 3 ("It uses it to dig…") refers to ________.', a: 'the hoopoe' },
    { q: 'Why do we often see hoopoes on lawns?', a: 'Because they dig in the ground (with their beak) for insects and worms.' },
    { q: 'Where does the English name "hoopoe" come from?', a: 'From its call: "oop-oop-oop".' },
    { q: 'True or false? Hoopoes build nests on the ground. Copy the words that show it.', a: 'False — "Hoopoes build their nests in holes in trees or walls."' },
    { q: 'Why does the writer say "Most animals stay away!"?', opts: ['because hoopoes are very big', 'because the liquid smells terrible', 'because the nests are high'], a: 1 },
  ],
}
const U3 = {
  title: 'COSMO Summer Science Camp', kind: 'An advertisement',
  paras: [
    'Science, space and fun for ages 12–14! Join us at the Ramat Hadar Community Center from July 6 to July 24, Sunday to Thursday, 8:30–14:00.',
    'What will you do? Build and launch water rockets • Learn to code your own simple computer game • Watch the stars through a real telescope (one evening a week, 20:00–21:30 — parents are welcome too!)',
    'Price: ₪1,200 for three weeks. Brothers and sisters get 10% off.',
    'Please bring a hat, a water bottle and a healthy lunch. Phones are allowed only during breaks. Register at the community center office by June 15. Places are limited!',
  ],
  qs: [
    { q: 'Who is the camp for?', a: 'Kids / teens aged 12–14.' },
    { q: 'How many days a week does the camp meet?', a: 'Five (Sunday to Thursday).' },
    { q: 'Which activity takes place in the evening?', a: 'Watching the stars through a (real) telescope.' },
    { q: 'Who can join the children in the evening activity?', a: 'Their parents.' },
    { q: 'Noa and her brother both want to join. Will they pay the full price? Explain.', a: 'No — brothers and sisters get 10% off (₪1,080 each).', lines: 1 },
    { q: 'When can campers use their phones?', opts: ['all day', 'only during breaks', 'never'], a: 1 },
    { q: 'What is the last day to register?', a: 'June 15.' },
    { q: '"Places are limited!" What does the camp want people to do?', opts: ['register quickly', 'bring a friend', 'pay less'], a: 0 },
  ],
}

// ---------- Summary test ----------
const T_TEXT = {
  title: "My Grandfather's Bicycle", kind: 'Summary test — reading',
  paras: [
    'My grandfather is 78 years old, but he still rides his bicycle every morning. He bought it in 1975, when he was a young teacher. "This bike is older than your mother," he always says with a smile.',
    'Last summer, the bike broke. The chain was old, and one of the wheels was bent. My parents wanted to buy him a new electric bike, but he said no. "I don\'t need a new bike. I need my bike," he told them.',
    'So we decided to fix it together. Every evening for two weeks, we worked in his small garden. He showed me how to change a chain and how to fix a wheel. Now the old bike works perfectly — and I know how to fix bikes, too!',
  ],
  qs: [
    { q: 'When did the grandfather buy his bike?', a: 'In 1975.' },
    { q: '"This bike is older than your mother." This tells us that…', opts: ['the mother is very old', 'the bike is very old', "the mother doesn't like the bike"], a: 1 },
    { q: 'What were TWO problems with the bike?', a: 'The chain was old; one of the wheels was bent.' },
    { q: "Why didn't the grandfather want a new electric bike?", a: 'He wanted (loved) his own old bike.' },
    { q: 'What did the writer learn from the grandfather?', a: 'How to fix bikes — to change a chain and fix a wheel.' },
  ],
}
const T_VOC = [
  ['Eating vegetables every day is ________.', 'healthy'],
  ["Can you ________ this question to me? I don't understand it.", 'explain'],
  ["I can't ________ which shirt to buy.", 'decide'],
  ['The beach was very ________ on Saturday. There were people everywhere!', 'crowded'],
  ['My parents were ________ of me when I got 100 on the test.', 'proud'],
]
const T_GRAM = [
  ['My cousin ________ in London. (live / lives)', 'lives'],
  ['We ________ a test yesterday. (have / had)', 'had'],
  ['Listen! The birds ________. (sing / are singing)', 'are singing'],
  ['________ you see the game last night? (Did / Do)', 'Did'],
  ['I think robots ________ teach in schools one day. (will / are)', 'will'],
  ["My room is ________ than my brother's room. (bigger / more big)", 'bigger'],
  ["You ________ wear a seatbelt in the car. It's the law. (must / can)", 'must'],
  ["She ________ like horror movies. (don't / doesn't)", "doesn't"],
  ['They ________ happy with the results. (was / were)', 'were'],
  ['This is the ________ day of the year! (hottest / most hot)', 'hottest'],
]

// ---------- Pages ----------
function PresentSimplePage({ n }) {
  return <S n={n} arts={['🕒']} en="Present Simple" he="הווה פשוט — הרגלים, שגרה ועובדות">
    <Rule title="מתי משתמשים?">
      דברים שקורים <b>באופן קבוע</b> (הרגלים, שגרה) ו<b>עובדות</b> שתמיד נכונות.
      <Ltr style={{ marginTop: '1mm' }}>I <b>walk</b> to school every day. • Water <b>boils</b> at 100°C.</Ltr>
    </Rule>
    <Table head={['', 'I / you / we / they', 'he / she / it']} rows={[
      ['+', 'I play tennis.', 'She plays tennis.'],
      ['−', "I don't play tennis.", "She doesn't play tennis."],
      ['?', 'Do you play tennis? — Yes, I do. / No, I don\'t.', 'Does she play tennis? — Yes, she does. / No, she doesn\'t.'],
    ]} widths={['6%', '47%', '47%']} />
    <Rule title="שימו לב לאיות עם he / she / it" style={{ background: 'white' }}>
      <Ltr>watch → watch<b>es</b> • go → go<b>es</b> • fix → fix<b>es</b> • study → stud<b>ies</b> • play → play<b>s</b></Ltr>
      אחרי <En>doesn't / does</En> הפועל חוזר לצורת הבסיס: <En>She doesn't <b>play</b></En> — ולא <En>plays</En>.
      <div style={{ marginTop: '0.8mm' }}>מילות זמן: <En>always, usually, often, sometimes, never, every day, on Sundays</En></div>
    </Rule>
    <Task k="א" en="Write the correct form.">כתבו את הפועל בצורה הנכונה.</Task>
    <Ex items={PS_A} cols={2} />
    <Task k="ב" en="Rewrite with the word in brackets.">כתבו מחדש עם תואר התדירות במקום הנכון: לפני הפועל, אבל אחרי <En>am / is / are</En>.</Task>
    <Ex items={PS_B} start={11} cols={2} line gap="0.6mm" />
    <Task k="ג">כתבו שני משפטים על השגרה שלכם בבוקר.</Task>
    <Lines n={2} />
  </S>
}

function ProgressivePage({ n }) {
  return <S n={n} arts={['👁']} en="Present Progressive" he="הווה מתמשך — מה קורה עכשיו">
    <Rule title="מתי משתמשים?">
      פעולה שקורית <b>ממש עכשיו</b> או בתקופה הזאת. מבנה: <En><b>am / is / are + V-ing</b></En>
      <Ltr style={{ marginTop: '1mm' }}>I <b>am reading</b>. • She <b>isn't sleeping</b>. • <b>Are</b> they <b>playing</b>? — Yes, they are.</Ltr>
      <div>מילות זמן: <En>now, right now, at the moment, today, this week, Look! Listen!</En></div>
    </Rule>
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="איות" style={{ flex: 1, background: 'white' }}>
        <Ltr>make → mak<b>ing</b> • write → writ<b>ing</b><br />swim → swi<b>mm</b>ing • sit → si<b>tt</b>ing • run → ru<b>nn</b>ing<br />lie → l<b>y</b>ing</Ltr>
      </Rule>
      <Rule title="פעלים שלא באים ב־ing" style={{ flex: 1, background: 'white' }}>
        פעלים של מצב, רגש ומחשבה:
        <Ltr><b>like, love, hate, want, need, know, understand, believe</b></Ltr>
        <Ltr>I <b>want</b> pizza now. (ולא <s>I am wanting</s>)</Ltr>
      </Rule>
    </div>
    <Task k="א" en="Complete with the present progressive.">השלימו בהווה מתמשך.</Task>
    <Ex items={PP_A} cols={2} />
    <Task k="ב" en="Simple or progressive? Circle.">הווה פשוט או מתמשך? הקיפו את התשובה הנכונה.</Task>
    <Ex items={PP_B} start={9} cols={2} />
    <Tip e="🧠">שאלו את עצמכם: <b>זה קורה תמיד / בדרך כלל?</b> → הווה פשוט. <b>זה קורה עכשיו?</b> → הווה מתמשך.</Tip>
  </S>
}

function PastSimplePage({ n }) {
  return <S n={n} arts={['📖']} en="Past Simple" he="עבר פשוט — מה קרה">
    <Rule title="מתי משתמשים?">
      פעולה שהתחילה והסתיימה בעבר, בזמן מוגדר. מילות זמן: <En>yesterday, last week, two days ago, in 2020, when I was six</En>
    </Rule>
    <Table head={['', 'כל הגופים', 'דוגמה']} rows={[
      ['+', 'V + ed (או צורה חריגה)', 'I worked. • She went.'],
      ['−', "didn't + V", "I didn't work. • She didn't go."],
      ['?', 'Did + subject + V?', 'Did you work? — Yes, I did. / No, I didn\'t.'],
    ]} widths={['6%', '34%', '60%']} />
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="איות ‎-ed" style={{ flex: 1, background: 'white' }}>
        <Ltr>work → work<b>ed</b> • like → lik<b>ed</b><br />stop → sto<b>pp</b>ed • study → stud<b>ied</b> • play → play<b>ed</b></Ltr>
      </Rule>
      <Rule title="was / were" style={{ flex: 1, background: 'white' }}>
        <Ltr>I / he / she / it <b>was</b> • you / we / they <b>were</b><br />wasn't • weren't • Was he…? • Were you…?</Ltr>
      </Rule>
    </div>
    <Task k="א" en="Complete with the past simple.">השלימו בעבר פשוט (פעלים רגילים).</Task>
    <Ex items={PAST_A} cols={2} />
    <Task k="ב" en="was / were / wasn't / weren't">השלימו.</Task>
    <Ex items={PAST_B} start={7} cols={2} />
    <Task k="ג" en="Write a negative sentence and a question.">כתבו משפט שלילה ושאלה. זכרו: אחרי <En>didn't / Did</En> — צורת הבסיס!</Task>
    <Ex items={PAST_C} start={11} line gap="0.4mm" />
    <Lines n={1} />
  </S>
}

function IrregularPage({ n }) {
  return <S n={n} arts={['🔑']} en="Irregular Verbs" he="פעלים חריגים בעבר — לומדים בעל פה">
    <Table head={['base', 'past', 'עברית', 'base', 'past', 'עברית', 'base', 'past', 'עברית']} fs="9pt"
      rows={Array.from({ length: 12 }, (_, r) => [0, 1, 2].flatMap(c => { const [b, p, h] = IRREGULAR[c * 12 + r]; return [b, <b key="p">{p}</b>, <span key="h" dir="rtl">{h}</span>] }))} />
    <Tip e="💡">טריק: מכסים את העמודה האמצעית ובודקים את עצמכם. מתחילים מ־10 פעלים ביום.</Tip>
    <Task k="א" en="Complete the story with the past simple.">השלימו את הסיפור בעבר.</Task>
    <div dir="ltr" style={{ textAlign: 'left', fontSize: '11pt', lineHeight: 2, border: '1.5px solid #9aa5b5', borderRadius: 10, padding: '2mm 4mm' }}>
      Last Friday, Itai and his friends (1) ________ ({STORY[0][0]}) to the beach. They (2) ________ ({STORY[1][0]}) the bus at nine.
      Itai (3) ________ ({STORY[2][0]}) a ball, and Gal (4) ________ ({STORY[3][0]}) ice cream for everyone. They (5) ________ ({STORY[4][0]}) in the sea,
      but the water (6) ________ ({STORY[5][0]}) very cold. At noon, Itai (7) ________ ({STORY[6][0]}) his sunglasses in the sand.
      He (8) ________ ({STORY[7][0]}) them an hour later. They (9) ________ ({STORY[8][0]}) a great day!
    </div>
  </S>
}

function FuturePage({ n }) {
  return <S n={n} arts={['🚀']} en="Future: will / be going to" he="עתיד — תחזיות, החלטות ותוכניות">
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="will + V" style={{ flex: 1 }}>
        <ul style={{ margin: 0, paddingInlineStart: '5mm' }}>
          <li>תחזית / מחשבה על העתיד: <En>I think it <b>will</b> rain.</En></li>
          <li>החלטה ברגע הדיבור: <En>I'<b>ll</b> take the blue one.</En></li>
          <li>הבטחה או הצעה: <En>I <b>won't</b> forget. • I'<b>ll</b> help you.</En></li>
        </ul>
        <Ltr>won't = will not</Ltr>
      </Rule>
      <Rule title="am / is / are going to + V" style={{ flex: 1 }}>
        <ul style={{ margin: 0, paddingInlineStart: '5mm' }}>
          <li>תוכנית שהחלטנו עליה <b>מראש</b>: <En>We're <b>going to</b> visit Rome.</En></li>
          <li>יש סימן שרואים עכשיו: <En>Look at the clouds! It's <b>going to</b> rain.</En></li>
        </ul>
        <Ltr>She isn't going to come. • Are you going to play?</Ltr>
      </Rule>
    </div>
    <p style={{ fontSize: '10pt', margin: '0 0 1mm' }}>מילות זמן: <En>tomorrow, tonight, next week, next year, soon, in two years, one day</En></p>
    <Task k="א" en="will / won't / going to?">השלימו ב־<En>will / 'll / won't</En> או בצורה של <En>be going to</En>.</Task>
    <Ex items={FUT_A} gap="1.6mm" />
    <Task k="ב" en="My plans for next weekend">כתבו שלוש תוכניות לסוף השבוע הבא עם <En>going to</En>.</Task>
    <Ltr style={{ fontSize: '10.5pt', color: '#444' }}>Next weekend I'm going to …</Ltr>
    <Lines n={3} />
  </S>
}

function ComparePage({ n }) {
  return <S n={n} arts={['📏']} en="Comparatives & Superlatives" he="השוואה — יותר … מ־ / הכי …">
    <Table head={['סוג שם התואר', 'adjective', 'comparative (+ than)', 'superlative (the …)']} rows={[
      ['קצר (הברה אחת)', 'tall', 'taller', 'the tallest'],
      ['מסתיים ב־e', 'nice', 'nicer', 'the nicest'],
      ['תנועה + עיצור', 'big • hot', 'bigger • hotter', 'the biggest • the hottest'],
      ['מסתיים ב־y', 'easy • heavy', 'easier • heavier', 'the easiest • the heaviest'],
      ['ארוך (2+ הברות)', 'interesting', 'more interesting', 'the most interesting'],
      ['חריגים', 'good • bad • far', 'better • worse • farther', 'the best • the worst • the farthest'],
    ]} />
    <Rule title="עוד שני מבנים חשובים">
      <Ltr>Dana is <b>taller than</b> Ron. • Ron is <b>as tall as</b> Gil. (שווים) • Gil is <b>not as tall as</b> Dana.</Ltr>
      לא משתמשים ב־<En>more</En> יחד עם <En>‎-er</En>: <En><s>more taller</s> → taller</En>
    </Rule>
    <Task k="א" en="Write the correct form.">כתבו את הצורה הנכונה.</Task>
    <Ex items={COMP_A} cols={2} />
    <Task k="ב" en="Write a sentence comparing the two.">כתבו משפט השוואה לפי המידע.</Task>
    <Ex items={COMP_B} start={9} line gap="0.4mm" />
  </S>
}

function ModalsPage({ n }) {
  return <S n={n} arts={['🚦']} en="Modals: can / must / should" he="פעלים מודאליים — יכולת, חובה ועצה">
    <Table head={['modal', 'משמעות', 'example']} rows={[
      ['can / can\'t', 'יכולת, רשות', 'I can swim. • Can I go out? • She can\'t come.'],
      ['must', 'חובה, כלל', 'You must wear a helmet.'],
      ["mustn't", 'אסור!', "You mustn't run in the corridor."],
      ['should / shouldn\'t', 'עצה, המלצה', "You should drink more water. • You shouldn't stay up late."],
    ]} widths={['20%', '18%', '62%']} />
    <Rule title="שלושה כללי זהב">
      1. אחרי מודאל בא פועל בצורת הבסיס: <En>She can <b>swim</b></En> — ולא <En><s>swims</s></En>.<br />
      2. אין <En>to</En> אחרי מודאל: <En>You must <b>wear</b></En> — ולא <En><s>must to wear</s></En>.<br />
      3. למודאל אין <En>s</En> ואין <En>do / does</En>: <En>He <b>can't</b> come</En> — ולא <En><s>doesn't can</s></En>.
    </Rule>
    <Tip e="💡"><En><b>mustn't</b></En> = אסור. <En><b>don't have to</b></En> = לא חייבים (אבל מותר). <En>You don't have to come</En> — אם לא רוצים, לא באים.</Tip>
    <Task k="א" en="Circle the correct modal.">הקיפו את המודאל המתאים.</Task>
    <Ex items={MOD_A} fs="10.3pt" gap="1mm" />
    <Task k="ב" en="Correct the mistakes.">בכל משפט טעות אחת. כתבו את המשפט הנכון.</Task>
    <Ex items={MOD_B} start={9} cols={2} line gap="0.4mm" />
    <Task k="ג">חבר רוצה להשתפר באנגלית. כתבו לו שתי עצות עם <En>should</En>.</Task>
    <Lines n={2} />
  </S>
}

function MixPage({ n }) {
  return <S n={n} arts={['🧠']} en="Grammar Mix" he="חזרה על כל הדקדוק בחוברת">
    <Task k="א" en="Choose the correct answer.">הקיפו את התשובה הנכונה.</Task>
    <MC items={MIX} cols={2} />
    <Task k="ב" en="Find the mistake and correct it.">בכל משפט יש טעות אחת. מתחו קו מתחתיה וכתבו את התיקון.</Task>
    <Ex items={MIX_FIX} start={13} line gap="0.5mm" />
    <Tip e="🔑">הטעויות הנפוצות ביותר: <En>s</En> שנשכחה ב־<En>he / she / it</En>, פועל בעבר אחרי <En>didn't</En>, ו־<En>more</En> יחד עם <En>‎-er</En>.</Tip>
  </S>
}

function Vocab1Page({ n }) {
  return <S n={n} arts={['🎒']} en="Vocabulary: School & Daily Life" he="אוצר מילים ברמת Band I — בית הספר ושגרה">
    <WordBank words={VOC1} />
    <Tip e="💡"><En><b>borrow</b></En> = לקחת משהו לזמן קצר (<En>Can I borrow your pen?</En>). <En><b>lend</b></En> = לתת משהו לזמן קצר (<En>Can you lend me your pen?</En>).</Tip>
    <Task k="א" en="Write the opposite.">כתבו את המילה ההפוכה מתוך רשימת המילים.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2mm 6mm', fontSize: '11pt', margin: '0 0 2mm' }}>
      {VOC1_A.map(([w], i) => <div key={w}>{i + 1}. {w} ↔ ____________</div>)}
    </div>
    <Task k="ב" en="Complete with a word from the list.">השלימו במילה מהרשימה.</Task>
    <Ex items={VOC1_B} start={7} gap="1.6mm" />
    <Task k="ג">בחרו שלוש מילים חדשות מהרשימה וכתבו משפט עם כל אחת.</Task>
    <Lines n={3} />
  </S>
}

function Vocab2Page({ n }) {
  return <S n={n} arts={['😊']} en="Vocabulary: Feelings, People & Places" he="אוצר מילים ברמת Band I — רגשות, אנשים ומקומות">
    <WordBank words={VOC2} />
    <Rule title="‎-ed או ‎-ing?">
      <En><b>‎-ed</b></En> = איך <b>אני מרגיש</b>: <En>I'm bored. I'm excited.</En> &nbsp;•&nbsp; <En><b>‎-ing</b></En> = איך <b>הדבר</b> גורם להרגיש: <En>The movie is boring. The trip is exciting.</En>
    </Rule>
    <Task k="א" en="Circle the correct word.">הקיפו את המילה הנכונה.</Task>
    <Ex items={VOC2_A} cols={2} />
    <Task k="ב" en="Complete with a word from the list.">השלימו במילה מהרשימה.</Task>
    <Ex items={VOC2_B} start={7} gap="1.6mm" />
    <Task k="ג">כתבו על מקום שאתם אוהבים. השתמשו בשלוש מילים מהרשימה.</Task>
    <Lines n={2} />
  </S>
}

function UnseenPage({ n, u, idx, arts }) {
  return <S n={n} arts={arts} en={`Unseen ${idx}`} he="הבנת הנקרא — קוראים את הטקסט ועונים באנגלית">
    <Passage title={u.title} kind={u.kind} paras={u.paras} />
    {u.glossary && <Glossary words={u.glossary} />}
    <Questions items={u.qs} />
  </S>
}

function WritingPage({ n }) {
  return <S n={n} arts={['✏', '💌']} en="Writing: An Email to a Friend" he="כתיבה — מייל לחבר/ה (60–80 מילים)">
    <Rule title="המשימה">
      חבר/ה שגר/ה בעיר אחרת שאל/ה מה עשיתם בסוף השבוע. כתבו לו/לה מייל: <b>לאן הלכתם? מה עשיתם? איך הרגשתם? מה אתם הולכים לעשות בסוף השבוע הבא?</b>
    </Rule>
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="מבנה המייל" style={{ flex: 1.1, background: 'white' }}>
        <Ltr style={{ fontSize: '9.8pt', lineHeight: 1.5 }}>
          <b>Hi Maya,</b> ← פתיחה<br />
          Thanks for your email! How are you? ← משפט פתיחה<br />
          Last weekend I went to … We … It was … ← מה היה<br />
          Next weekend I'm going to … ← תוכניות<br />
          What about you? Write back soon! ← שאלה<br />
          <b>Love, / Best wishes,</b> Noa ← סיום
        </Ltr>
      </Rule>
      <Rule title="ביטויים שימושיים" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.8pt' }}>It was great / amazing / boring.<br />First, … Then, … After that, …<br />I felt happy / tired / excited because …<br />I can't wait to see you!</Ltr>
      </Rule>
    </div>
    <Lines n={11} />
    <Rule title="רשימת בדיקה — לפני שמגישים" style={{ background: 'white', marginTop: '2mm' }}>
      <Checklist items={['פתחתי ב־Hi ___, וסיימתי ב־Love / Best wishes', 'כתבתי על סוף השבוע בעבר פשוט', 'כתבתי תוכנית עם going to', 'שאלתי את החבר/ה שאלה אחת לפחות', 'השתמשתי ב־2 מילות קישור (and, but, because, so, then)', 'אות גדולה בתחילת משפט ובשמות, נקודה בסוף', '60–80 מילים (ספרתי!)', 'קראתי שוב ותיקנתי איות']} />
    </Rule>
  </S>
}

function TestAPage({ n }) {
  return <S n={n} arts={['📄']} en="Summary Test — Part A" he="מבחן מסכם — חלק א׳: הבנת הנקרא (40 נקודות)">
    <Tip e="🕒">זמן מומלץ לכל המבחן: 45 דקות. עונים לבד, בלי לחזור לעמודים הקודמים. בסוף בודקים בדף התשובות.</Tip>
    <Passage title={T_TEXT.title} kind={T_TEXT.kind} paras={T_TEXT.paras} />
    <Glossary words={[['chain', 'שרשרת (של אופניים)'], ['bent', 'עקום'], ['perfectly', 'בצורה מושלמת']]} />
    <Task k="א" en="Answer the questions." pts={40}>ענו על השאלות (8 נקודות לכל שאלה).</Task>
    <Questions items={T_TEXT.qs} />
  </S>
}

function TestBPage({ n }) {
  return <S n={n} arts={['📄']} en="Summary Test — Part B" he="מבחן מסכם — חלק ב׳: אוצר מילים, דקדוק וכתיבה">
    <Task k="ב" en="Complete with a word from the box. One word is extra." pts={20}>השלימו במילה מהתיבה (4 נקודות לכל משפט). מילה אחת מיותרת.</Task>
    <Box words={['borrow', 'proud', 'crowded', 'decide', 'healthy', 'explain']} />
    <Ex items={T_VOC} gap="1mm" />
    <Task k="ג" en="Circle the correct answer." pts={30}>הקיפו את התשובה הנכונה (3 נקודות לכל משפט).</Task>
    <Ex items={T_GRAM} start={6} cols={2} gap="1mm" />
    <Task k="ד" en="Write 4–5 sentences: Where is your favorite place? Why do you like it? When did you last go there?" pts={10}>כתיבה:</Task>
    <Lines n={5} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3mm', marginTop: '2mm', fontSize: '10.5pt', fontWeight: 700 }}>
      {['א: ___ / 40', 'ב: ___ / 20', 'ג: ___ / 30', 'ד: ___ / 10', 'סה״כ: ___ / 100'].map(t => <span key={t} style={{ border: '1.5px solid #111', borderRadius: 8, padding: '1mm 2.5mm' }}>{t}</span>)}
    </div>
  </S>
}

export default function EnglishGrade7Booklet() {
  const key1 = [
    { title: 'עמוד 3 — Present Simple', answers: [...exKey(PS_A), ...exKey(PS_B)] },
    { title: 'עמוד 4 — Present Progressive', answers: [...exKey(PP_A), ...exKey(PP_B)] },
    { title: 'עמוד 5 — Past Simple', answers: [...exKey(PAST_A), ...exKey(PAST_B), ...exKey(PAST_C)] },
    { title: 'עמוד 6 — הסיפור', answers: STORY.map(s => s[1]) },
    { title: 'עמוד 7 — Future', note: 'בתרגיל 1 ו־7: החלטה ברגע הדיבור → will.', answers: exKey(FUT_A) },
    { title: 'עמוד 8 — Comparatives', answers: [...exKey(COMP_A), ...exKey(COMP_B)] },
    { title: 'עמוד 9 — Modals', answers: [...exKey(MOD_A), ...exKey(MOD_B)] },
    { title: 'עמוד 10 — Grammar Mix', answers: [...mcKey(MIX), ...exKey(MIX_FIX)] },
  ]
  const key2 = [
    { title: 'עמוד 11 — אוצר מילים', answers: [...VOC1_A.map(p => p[1]), ...exKey(VOC1_B)] },
    { title: 'עמוד 12 — אוצר מילים', answers: [...exKey(VOC2_A), ...exKey(VOC2_B)] },
    { title: 'עמוד 13 — Unseen 1', note: 'בשאלות הפתוחות מקבלים כל ניסוח נכון.', answers: qKey(U1.qs) },
    { title: 'עמוד 14 — Unseen 2', answers: qKey(U2.qs) },
    { title: 'עמוד 15 — Unseen 3', answers: qKey(U3.qs) },
    { title: 'עמוד 17 — מבחן: הבנת הנקרא', answers: qKey(T_TEXT.qs) },
    { title: 'עמוד 18 — מבחן: אוצר מילים (המילה המיותרת: borrow)', answers: exKey(T_VOC) },
    { title: 'עמוד 18 — מבחן: דקדוק', start: 6, answers: exKey(T_GRAM) },
    { title: 'עמוד 16 + 18 — כתיבה', note: 'בודקים לפי רשימת הבדיקה שבעמוד 16: תוכן, זמנים נכונים, מילות קישור, אות גדולה ונקודה.', answers: [] },
  ]
  const mapRows = [
    [3, 'Present Simple', 'הרגלים ועובדות, does / doesn\'t'], [4, 'Present Progressive', 'מה קורה עכשיו, ‎-ing'], [5, 'Past Simple', '‎-ed, was / were, didn\'t'],
    [6, 'Irregular Verbs', '36 פעלים חריגים'], [7, 'will / going to', 'תחזיות ותוכניות'], [8, 'Comparatives', 'than, the most, as … as'],
    [9, 'Modals', 'can, must, should'], [10, 'Grammar Mix', 'חזרה מסכמת'], ['11–12', 'Vocabulary', '48 מילים ברמת Band I'],
    ['13–15', 'Unseens', 'סיפור, כתבה ומודעה'], [16, 'Writing', 'מייל לחבר/ה'], ['17–18', 'Summary Test', 'מבחן של 100 נקודות'],
  ]
  return <>
    <TeenCover accent={ACCENT} arts={['📚', '🎒', '💻', '✏']} en="English Workbook · Grade 7" title="חוברת אנגלית לכיתה ז׳"
      sub="דקדוק, אוצר מילים, הבנת הנקרא וכתיבה — עם מבחן מסכם ודף תשובות" pages={PAGES}
      note="לכל נושא דקדוק יש הסבר קצר בעברית ותרגול באנגלית. אפשר לעבוד לפי הסדר או לבחור נושא שצריך לחזק. בעמוד 2 יש מפה לסימון ההתקדמות, ובסוף מבחן מסכם ודף תשובות מלא." />
    <MapPage n={2} accent={ACCENT} rows={mapRows}
      intro="החוברת בנויה מארבעה חלקים: דקדוק (עמודים 3–10), אוצר מילים (11–12), הבנת הנקרא וכתיבה (13–16), ומבחן מסכם (17–18). אחרי כל עמוד בודקים בדף התשובות, מסמנים ✓ וכותבים אם צריך לחזור על הנושא."
      tips={['עמוד אחד ביום עדיף על חמישה בבת אחת.', 'קוראים את ההסבר לפני התרגיל — גם אם נראה קל.', 'טעיתם? מעתיקים את המשפט הנכון למחברת.', 'קוראים כל טקסט פעמיים: פעם להבנה כללית ופעם לשאלות.']}
      terms={[['verb', 'פועל'], ['noun', 'שם עצם'], ['adjective', 'שם תואר'], ['subject', 'נושא'], ['negative', 'שלילה'], ['question', 'שאלה'], ['past', 'עבר'], ['future', 'עתיד'], ['plural', 'רבים'], ['spelling', 'איות']]} />
    <PresentSimplePage n={3} />
    <ProgressivePage n={4} />
    <PastSimplePage n={5} />
    <IrregularPage n={6} />
    <FuturePage n={7} />
    <ComparePage n={8} />
    <ModalsPage n={9} />
    <MixPage n={10} />
    <Vocab1Page n={11} />
    <Vocab2Page n={12} />
    <UnseenPage n={13} u={U1} idx={1} arts={['📱']} />
    <UnseenPage n={14} u={U2} idx={2} arts={['🐦']} />
    <UnseenPage n={15} u={U3} idx={3} arts={['🚀']} />
    <WritingPage n={16} />
    <TestAPage n={17} />
    <TestBPage n={18} />
    <KeyPage n={19} accent={ACCENT} he="דף תשובות (1) — דקדוק" sections={key1} />
    <KeyPage n={20} accent={ACCENT} he="דף תשובות (2) — אוצר מילים, קריאה ומבחן" sections={key2} />
    <TeenCertificate accent={ACCENT} booklet="חוברת האנגלית לכיתה ז׳" done="דקדוק, אוצר מילים, שלושה טקסטים, כתיבה ומבחן מסכם." />
  </>
}

import { bookletBySlug } from './registry'
import { Checklist, En, Ex, Glossary, KeyPage, Lines, Ltr, MapPage, MC, Passage, Questions, Rule, Sheet, Table, Task, TeenCertificate, TeenCover, Tip, WordBank } from './englishTeenKit'
import { exKey, mcKey, qKey } from './englishTeenKeys'

// "חוברת אנגלית לכיתה ט׳ — הכנה למבחן סוף חטיבה" — present perfect vs past simple (for / since), passive
// in present and past, conditionals 0 / 1 / 2, relative clauses and connectors; Band II academic words and
// word building, three original unseens (a science history text, an opinion article, a story), an opinion
// paragraph, a 100-point test in the style of an end-of-year exam, key and certificate.
const PAGES = bookletBySlug('english-grade-9').pages
const ACCENT = '#9a3b2a'
const S = props => <Sheet accent={ACCENT} {...props} />

// ---------- Grammar data ----------
const PPPS_A = [
  ['I ________ (meet) Daniel in 2021.', 'met'],
  ['I ________ (know) Daniel for five years.', 'have known'],
  ['________ you ________ (see) the new Pixar movie yet?', 'Have … seen'],
  ['We ________ (go) to the Galilee last Passover.', 'went'],
  ['She ________ (never / try) Ethiopian food.', 'has never tried'],
  ['Look! Someone ________ (break) the window.', 'has broken'],
  ['When ________ you ________ (start) playing the guitar?', 'did … start'],
  ['My brother ________ (live) in Berlin since 2023.', 'has lived'],
  ['Shakespeare ________ (write) more than 30 plays.', 'wrote'],
  ["I ________ (read) three books this month, and it's only the 15th!", 'have read'],
]
const PPPS_B = [
  ['I have visited Rome last year.', 'I visited Rome last year.'],
  ['She lives here since 2020.', 'She has lived here since 2020.'],
  ['When have you arrived?', 'When did you arrive?'],
  ['How long do you know her?', 'How long have you known her?'],
]
const FS_A = [['three weeks', 'for'], ['last summer', 'since'], ["8 o'clock", 'since'], ['a long time', 'for'], ['I was a child', 'since'], ['ages', 'for'], ['yesterday', 'since'], ['two days', 'for'], ['2019', 'since'], ['half an hour', 'for']]
const FS_B = [
  ['Maya / play the violin / 2018', 'Maya has played the violin since 2018.'],
  ['We / live in Ashdod / ten years', 'We have lived in Ashdod for ten years.'],
  ['I / not see my cousins / the summer', "I haven't seen my cousins since the summer."],
  ['They / be friends / kindergarten', 'They have been friends since kindergarten.'],
]
const FS_C = [['אני מכיר אותו שלוש שנים.', 'I have known him for three years.'], ['היא לומדת כאן מספטמבר.', 'She has studied (has been studying) here since September.'], ['כמה זמן אתם גרים בחיפה?', 'How long have you lived in Haifa?']]
const PASS_A = [
  ['The Mona Lisa ________ (paint) by Leonardo da Vinci.', 'was painted'],
  ['Hebrew ________ (write) from right to left.', 'is written'],
  ['The first iPhone ________ (sell) in 2007.', 'was sold'],
  ['Thousands of emails ________ (send) every second.', 'are sent'],
  ['The match ________ (cancel) yesterday because of the rain.', 'was cancelled / canceled'],
  ['Penicillin ________ (discover) by Alexander Fleming in 1928.', 'was discovered'],
  ['These shoes ________ (make) from recycled plastic.', 'are made'],
  ['The windows ________ (not / clean) last week.', "weren't cleaned"],
  ['When ________ this school ________ (build)?', 'was … built'],
  ['Many languages ________ (speak) in India.', 'are spoken'],
]
const PASS_B = [
  ['Someone stole my bike last night.', 'My bike was stolen last night.'],
  ['J.K. Rowling wrote the Harry Potter books.', 'The Harry Potter books were written by J.K. Rowling.'],
  ['They grow oranges in Israel.', 'Oranges are grown in Israel.'],
  ['The police caught the thief.', 'The thief was caught by the police.'],
  ['People use English all over the world.', 'English is used all over the world.'],
  ["They don't allow phones in the exam.", "Phones aren't allowed in the exam."],
  ['Did they invite you to the party?', 'Were you invited to the party?'],
  ['The teacher gave us a lot of homework.', 'We were given a lot of homework (by the teacher).'],
]
const PASS_C = [
  ['Who painted "The Starry Night"? (Vincent van Gogh)', '"The Starry Night" was painted by Vincent van Gogh.'],
  ['When was the State of Israel established? (1948)', 'The State of Israel was established in 1948.'],
  ['What is paper made from? (wood)', 'Paper is made from wood.'],
  ['Who wrote "Romeo and Juliet"? (William Shakespeare)', '"Romeo and Juliet" was written by William Shakespeare.'],
]
const C0 = [
  ['If you ________ (mix) blue and yellow, you ________ (get) green.', 'mix; get'],
  ["Plants ________ (die) if they ________ (not / get) water.", "die; don't get"],
  ['If you ________ (heat) ice, it ________ (melt).', 'heat; melts'],
  ["If I ________ (drink) coffee in the evening, I ________ (not / sleep) well.", "drink; don't sleep"],
]
const C1 = [
  ['If you ________ (study) hard, you ________ (pass) the exam.', 'study; will pass'],
  ['If it ________ (be) sunny tomorrow, we ________ (go) to the beach.', 'is; will go'],
  ["She ________ (be) angry if you ________ (not / call) her.", "will be; don't call"],
  ['If I ________ (see) Noam, I ________ (tell) him the news.', 'see; will tell'],
  ['We ________ (miss) the train unless we ________ (hurry).', 'will miss; hurry'],
  ["What ________ you ________ (do) if they ________ (not / come)?", "will … do; don't come"],
]
const C2_A = [
  ['If I ________ (have) more free time, I ________ (learn) to play the drums.', 'had; would learn'],
  ['If she ________ (live) near the sea, she ________ (swim) every day.', 'lived; would swim'],
  ['What ________ you ________ (do) if you ________ (find) a wallet in the street?', 'would … do; found'],
  ['If I ________ (be) you, I ________ (apologize) to her.', 'were; would apologize'],
  ["We ________ (not / need) a car if the buses here ________ (be) better.", "wouldn't need; were"],
  ['If animals ________ (can) talk, what ________ they ________ (say)?', 'could; would … say'],
  ['He ________ (be) healthier if he ________ (sleep) more.', 'would be; slept'],
  ["If I ________ (not / have) a phone, I ________ (read) more books.", "didn't have; would read"],
]
const C2_B = [
  ["If I (win / won) the lottery, I'd buy a house for my parents.", 'won'],
  ['If it (rains / rained) tomorrow, the trip will be cancelled.', 'rains'],
  ['If I were a bird, I (will / would) fly to Japan.', 'would'],
  ["If you (leave / left) now, you'll catch the bus.", 'leave'],
]
const REL_A = [
  ['The woman ________ lives next door is a doctor.', 'who / that'],
  ['This is the café ________ we first met.', 'where'],
  ['I lost the bracelet ________ my grandmother gave me.', 'which / that (או בלי מילה)'],
  ["That's the boy ________ dog bit my brother.", 'whose'],
  ['A thermometer is a tool ________ measures temperature.', 'which / that'],
  ['Do you know anyone ________ speaks Russian?', 'who / that'],
  ['Eilat is a city ________ you can go diving all year.', 'where'],
  ['I have a friend ________ father is a pilot.', 'whose'],
  ['The song ________ we heard on the radio was amazing.', 'which / that (או בלי מילה)'],
  ['Teachers ________ listen to their students are the best.', 'who / that'],
]
const REL_B = [
  ['I have a cousin. She lives in Canada.', 'I have a cousin who lives in Canada.'],
  ['This is the park. We play football there.', 'This is the park where we play football.'],
  ['He bought a phone. It cost ₪3,000.', 'He bought a phone which / that cost ₪3,000.'],
  ['I met a girl. Her brother is a famous singer.', 'I met a girl whose brother is a famous singer.'],
]
const REL_C = [['a librarian', 'A librarian is a person who works in a library.'], ['a bakery', 'A bakery is a place where bread and cakes are made / sold.'], ['a fridge', 'A fridge is a machine which keeps food cold.']]
const CON_A = [
  ['I was tired, ________ I went to bed early. (so / because)', 'so'],
  ['We stayed inside ________ the heavy rain. (because / because of)', 'because of'],
  ['________ it was cold, we went swimming. (Although / However)', 'Although'],
  ["The phone is expensive. ________, it's very good. (However / Although)", 'However'],
  ['I like sports ________ basketball and tennis. (such as / in addition)', 'such as'],
  ["She didn't study. ________, she failed the test. (As a result / For example)", 'As a result'],
  ['He is smart. ________, he is very kind. (In addition / However)', 'In addition'],
  ["We didn't go out ________ we had a test the next day. (because / so)", 'because'],
  ['________, I would like to thank everyone who helped. (In conclusion / Although)', 'In conclusion'],
  ['________ the noise, I managed to finish my homework. (Despite / Although)', 'Despite'],
]
const CON_B = [
  ['The movie was long. I enjoyed it. (although)', 'Although the movie was long, I enjoyed it.'],
  ['It was raining. The game was cancelled. (therefore)', 'It was raining. Therefore, the game was cancelled.'],
  ['She practiced every day. She won the competition. (as a result)', 'She practiced every day. As a result, she won the competition.'],
]
const MIX = [
  ['I ________ in this town since I was born.', ['live', 'have lived', 'lived'], 1],
  ['The bridge ________ in 1932.', ['was built', 'built', 'has built'], 0],
  ['If I ________ rich, I would buy an island.', ['am', 'were', 'will be'], 1],
  ['If you heat ice, it ________.', ['melts', 'would melt', 'melted'], 0],
  ['The girl ________ won the prize is in my class.', ['which', 'who', 'whose'], 1],
  ['________ it was late, we continued working.', ['Although', 'However', 'Because'], 0],
  ['We ________ to Spain last summer.', ['have been', 'went', 'have gone'], 1],
  ['These cakes ________ fresh every morning.', ['are baked', 'bake', 'were baking'], 0],
  ['If she calls, I ________ you.', ['will tell', 'would tell', 'told'], 0],
  ['Have you finished your project ________?', ['ago', 'yet', 'since'], 1],
  ['This is the hotel ________ we stayed last year.', ['which', 'where', 'who'], 1],
  ["She is ill. ________, she can't come to school today.", ['Therefore', 'Although', 'Because'], 0],
]
const MIX_FIX = [
  ['If I will see him, I will tell him.', 'will see → see'],
  ["The book who I'm reading is great.", 'who → which / that'],
  ['My phone was stole yesterday.', 'stole → stolen'],
  ['I have seen him two days ago.', 'have seen → saw'],
]

// ---------- Vocabulary ----------
const ACAD = [
  ['increase', 'לעלות; עלייה'], ['decrease', 'לרדת; ירידה'], ['improve', 'לשפר'], ['affect', 'להשפיע על'], ['effect', 'השפעה, תוצאה'], ['cause', 'לגרום; סיבה'],
  ['result', 'תוצאה'], ['compare', 'להשוות'], ['claim', 'לטעון; טענה'], ['support', 'לתמוך'], ['prove', 'להוכיח'], ['according to', 'לפי, על פי'],
  ['main', 'עיקרי'], ['purpose', 'מטרה'], ['describe', 'לתאר'], ['suggest', 'להציע; לרמוז'], ['mention', 'להזכיר'], ['opinion', 'דעה'],
  ['behavior', 'התנהגות'], ['research', 'מחקר'], ['solution', 'פתרון'], ['advantage', 'יתרון'], ['disadvantage', 'חיסרון'], ['provide', 'לספק'],
]
const ACAD_A = [
  ['________ to the weather forecast, it will snow tomorrow.', 'According'],
  ['Lack of sleep can ________ your mood.', 'affect'],
  ['The number of electric cars has ________ in recent years.', 'increased'],
  ['Scientists want to ________ that the new medicine works.', 'prove'],
  ['What is the ________ of this text — to inform or to persuade?', 'purpose'],
  ["The writer doesn't ________ the date; she only says it was winter.", 'mention'],
]
const ACAD_B = [['go up', 'increase'], ['go down', 'decrease'], ['make better', 'improve'], ['most important', 'main'], ['aim, goal', 'purpose'], ['answer to a problem', 'solution']]
const WF_A = [
  ['Her ________ (kind) made everyone feel welcome.', 'kindness'],
  ['This app is very ________ (use) for learning new words.', 'useful'],
  ["Don't be ________ (care)! Check your answers.", 'careless'],
  ['The ________ (develop) of the new park took two years.', 'development'],
  ['It was a difficult ________ (decide).', 'decision'],
  ['Sorry, I ________ (understand) the question, so I answered the wrong one.', 'misunderstood'],
  ['The trip was really ________ (enjoy).', 'enjoyable'],
  ["It's ________ (possible) to read 500 pages in one hour!", 'impossible'],
]
const WF_B = [['not polite', 'impolite'], ['not visible', 'invisible'], ['build again', 'rebuild'], ['cook too much', 'overcook'], ['not honest', 'dishonest'], ['spell wrongly', 'misspell']]

// ---------- Unseens ----------
const U1 = {
  title: 'The Woman Who Measured the Universe', kind: 'A history of science article',
  paras: [
    'In the early 1900s, the Harvard College Observatory employed a group of women to study thousands of photographs of the night sky. They were called "computers," because their job was to compute — to count, measure and calculate. Women were not usually allowed to use the large telescopes, so they worked with the glass plates that the telescopes produced.',
    'One of these women was Henrietta Swan Leavitt. She was given a task that seemed boring: to find stars whose brightness changes over time. Leavitt examined the plates with great care and found more than a thousand such stars.',
    'Then she noticed something remarkable. In a group of stars called Cepheids, the brighter stars took longer to complete their cycle of growing bright and dim. So if astronomers measured how long a Cepheid\'s cycle took, they could work out its real brightness — and by comparing it with how bright the star looks from Earth, they could calculate how far away it is.',
    'Leavitt published her discovery in 1912. A little more than ten years later, the astronomer Edwin Hubble used her method to show that the Andromeda "nebula" was not part of our galaxy at all, but a separate galaxy, very far away.',
    'Sadly, Leavitt did not live to see how important her work became. She died in 1921. A few years later, a Swedish mathematician wrote to the observatory because he wanted to nominate her for the Nobel Prize — only to learn that she had already died.',
  ],
  glossary: [['employ', 'להעסיק'], ['brightness', 'בהירות'], ['remarkable', 'מדהים, ראוי לציון'], ['dim', 'עמום'], ['nominate', 'להציע מועמדות']],
  qs: [
    { q: 'Why were the women called "computers"?', a: 'Because their job was to compute — to count, measure and calculate.' },
    { q: 'Why did the women work with photographs and not with telescopes?', a: 'Women were not usually allowed to use the large telescopes.' },
    { q: 'The writer says that Leavitt\'s task "seemed boring" (paragraph 2). This suggests that the task…', opts: ['really was boring', 'turned out to be very important', 'was given to someone else'], a: 1 },
    { q: 'What did Leavitt notice about Cepheids?', a: 'The brighter ones took longer to complete their cycle (of growing bright and dim).' },
    { q: 'The word "it" in "how far away it is" (paragraph 3) refers to ________.', a: 'the star (the Cepheid)' },
    { q: 'What did Hubble show, using Leavitt\'s method?', a: 'That Andromeda was a separate galaxy, very far away (not part of our galaxy).' },
    { q: 'What is the purpose of paragraph 5?', opts: ['to explain the Nobel Prize', 'to show she was not honored in her lifetime', 'to describe her family'], a: 1 },
  ],
}
const U2 = {
  title: 'Is It Time to Say Goodbye to Cash?', kind: 'An opinion article',
  paras: [
    'Not long ago, every wallet was full of coins and banknotes. Today, many people pay for almost everything with a card or a phone. In Sweden, for example, cash is now used in only a small part of everyday payments, and some shops no longer accept it at all. In Israel, a law that came into force in 2019 limits large payments in cash.',
    'Supporters of a cashless society point to its many advantages. Paying by phone is fast and convenient, and there is no need to carry money that can be lost or stolen. Furthermore, digital payments leave a record, which makes it harder for criminals to hide money and avoid paying taxes.',
    'However, critics warn that not everyone is ready. Many elderly people find apps confusing, and some people do not have a bank account or a smartphone at all. There is also the question of privacy: every digital payment can be tracked. Finally, technology is not perfect. If the network goes down, a person with no cash in their pocket cannot even buy a bottle of water.',
    'In my opinion, the move away from cash is unavoidable, but it should not be forced on everyone. Shops should continue to accept cash, at least for small payments, so that no one is left behind. Progress is only real when it includes everybody.',
  ],
  glossary: [['banknote', 'שטר'], ['convenient', 'נוח'], ['criminal', 'פושע'], ['elderly', 'קשישים'], ['privacy', 'פרטיות'], ['unavoidable', 'בלתי נמנע']],
  qs: [
    { q: 'What example does the writer give of a country where cash is used very little?', a: 'Sweden.' },
    { q: 'According to supporters, what are TWO advantages of digital payments?', a: 'Any two: fast and convenient; no money to lose or be stolen; harder for criminals to hide money / avoid taxes.' },
    { q: 'The word "critics" (paragraph 3) refers to people who…', opts: ['support a cashless society', 'are worried about a cashless society', 'sell smartphones'], a: 1 },
    { q: 'What is the purpose of paragraph 3?', opts: ['to present the arguments against going cashless', 'to explain the law in Israel', "to give the writer's opinion"], a: 0 },
    { q: 'What is the writer\'s opinion?', opts: ['Cash should be banned.', 'People should use only cash.', 'Shops should keep accepting cash.'], a: 2 },
    { q: 'Explain the last sentence in your own words.', a: 'Example: a change is good only if everyone can be part of it / no one is left out.', lines: 1 },
  ],
}
const U3 = {
  title: 'Second Place', kind: 'A story',
  paras: [
    'For months, Adi had practiced for the young pianists\' competition. She played every evening, listened to recordings of famous pianists and even dreamed about the music. Her teacher, Mr. Golan, believed she could win. "You have the talent," he told her. "Now you need patience."',
    'On the day of the final, Adi was the last to play. Her hands were cold, and she could hear her heart beating. The first two pieces went perfectly. But in the last piece, the fastest one, she began to rush. Her fingers ran ahead of the music, and she missed several notes. When she finished, the audience clapped politely, but Adi already knew.',
    'She came second. Adi left the hall with tears in her eyes and didn\'t want to talk to anyone, not even her parents. That evening, however, she received a message from Mr. Golan: "Second place in your first big competition is something to be proud of. Tomorrow we will listen to the recording together. Every mistake is a lesson in disguise."',
    'The next day, they listened to her performance note by note. Adi realized that she had played beautifully for most of it; she had only lost control at the end, because she had wanted to finish too quickly. "Next time, I\'ll slow down," she said quietly. Mr. Golan smiled. "That," he said, "is exactly what a champion would say."',
  ],
  glossary: [['patience', 'סבלנות'], ['rush', 'למהר'], ['audience', 'קהל'], ['in disguise', 'בתחפושת, במסווה'], ['performance', 'הופעה, ביצוע']],
  qs: [
    { q: 'How did Adi prepare for the competition? Give TWO ways.', a: 'Any two: she played every evening; she listened to recordings of famous pianists.' },
    { q: 'Write TWO details from paragraph 2 that show Adi was nervous.', a: 'Her hands were cold; she could hear her heart beating.' },
    { q: 'What went wrong in the last piece?', a: 'She began to rush, her fingers ran ahead of the music and she missed several notes.' },
    { q: '"Adi already knew" (paragraph 2). What did she know?', opts: ['that the audience liked her', 'that she had made mistakes and would not win', 'that her parents were there'], a: 1 },
    { q: '"Every mistake is a lesson in disguise" means…', opts: ['mistakes are always hidden', 'we can learn something from every mistake', 'Adi should hide her mistakes'], a: 1 },
    { q: 'How does Mr. Golan\'s advice in paragraph 1 connect to the end of the story?', a: 'He said she needed patience; she lost because she rushed, and now she has learned to slow down.', lines: 1 },
    { q: 'The word "That" in the last sentence refers to ________.', a: 'what Adi said: "Next time, I\'ll slow down."' },
  ],
}

// ---------- Summary test ----------
const T_TEXT = {
  title: 'Farms in the Sky', kind: 'Summary test — reading',
  paras: [
    'Imagine a farm with no fields, no tractors and no sun. Instead, lettuce and herbs grow on shelves stacked one above the other, inside a building in the middle of a city. This is called a vertical farm.',
    'In most vertical farms, plants are grown without soil. Their roots are placed in water that contains all the nutrients they need, and special LED lights replace the sun. Because the water is collected and reused, these farms use much less water than traditional farms. In addition, since they are built close to cities, the food does not have to travel long distances to reach the shops.',
    'However, vertical farms also have disadvantages. The lights and air conditioning use a lot of electricity, which makes the food expensive. Moreover, at the moment only some crops, mainly leafy vegetables and herbs, can be grown this way at a reasonable cost. Wheat and rice, for example, still need traditional fields.',
  ],
  qs: [
    { q: 'What is a vertical farm?', a: 'A farm where plants grow on shelves stacked one above the other, inside a building (in a city).' },
    { q: 'What replaces the sun in a vertical farm?', a: 'Special LED lights.' },
    { q: 'Why do vertical farms use less water than traditional farms?', a: 'The water is collected and reused.' },
    { q: 'The word "Their" in paragraph 2 ("Their roots") refers to ________.', a: 'the plants' },
    { q: 'What is the main purpose of paragraph 3?', opts: ['to present the disadvantages of vertical farms', 'to explain how to build a vertical farm', 'to show that vertical farms are cheap'], a: 0 },
  ],
}
const T_VOC = [
  ['The number of tourists ________ (increase) a lot last year.', 'increased'],
  ['Smoking has a bad ________ (affect / effect) on your health.', 'effect'],
  ['Thank you for your ________ (kind).', 'kindness'],
  ['Leaving the door open all night was very ________ (care).', 'careless'],
  ['We need to make a ________ (decide) today.', 'decision'],
]
const T_GRAM = [
  ['I ________ him since we were in kindergarten. (knew / have known)', 'have known'],
  ['This castle ________ 800 years ago. (was built / has built)', 'was built'],
  ['If I ________ you, I would tell the truth. (am / were)', 'were'],
  ['If it ________ tomorrow, we will stay home. (rains / will rain)', 'rains'],
  ['The man ________ car was stolen called the police. (who / whose)', 'whose'],
  ['________ he was tired, he finished the race. (Although / Despite)', 'Although'],
  ['We ________ to Paris in 2019. (went / have gone)', 'went'],
  ['Eggs ________ in this box. (are kept / keep)', 'are kept'],
  ['This is the room ________ I do my homework. (where / which)', 'where'],
  ['It was very hot. ________, we stayed inside. (Therefore / However)', 'Therefore'],
]

// ---------- Pages ----------
function PPPSPage({ n }) {
  return <S n={n} arts={['🕒']} en="Present Perfect vs Past Simple" he="הווה מושלם או עבר פשוט? — השאלה החשובה של כיתה ט׳">
    <Table head={['', 'Past Simple', 'Present Perfect']} rows={[
      ['מתי?', 'זמן מוגדר שנגמר', 'בלי זמן מוגדר / זמן שעוד לא נגמר / קשר להווה'],
      ['מילות זמן', 'yesterday, last year, in 2015, two days ago, when I was ten', 'ever, never, already, yet, just, so far, recently, this week, for, since'],
      ['example', 'I saw that movie last week.', "I've seen that movie three times."],
      ['שאלה', 'When did you see it?', 'Have you ever seen it?'],
    ]} widths={['14%', '43%', '43%']} />
    <Tip e="💡">שאלה עם <En><b>When…?</b></En> → תמיד עבר פשוט. משפט עם <En><b>ago</b></En> → תמיד עבר פשוט.</Tip>
    <Task k="א" en="Past simple or present perfect?">השלימו בזמן המתאים.</Task>
    <Ex items={PPPS_A} gap="1.3mm" />
    <Task k="ב" en="Correct the mistakes.">תקנו את הטעויות.</Task>
    <Ex items={PPPS_B} start={11} cols={2} line gap="0.4mm" />
  </S>
}

function ForSincePage({ n }) {
  return <S n={n} arts={['⏰']} en="for / since / How long…?" he="כמה זמן זה נמשך — עד עכשיו">
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="for + משך זמן" style={{ flex: 1 }}><Ltr>for two hours • for ten years • for a long time</Ltr></Rule>
      <Rule title="since + נקודת התחלה" style={{ flex: 1 }}><Ltr>since Monday • since 2015 • since I was six</Ltr></Rule>
    </div>
    <Rule title="מלכודת לדוברי עברית" style={{ background: 'white' }}>
      בעברית אומרים בהווה: "אני גר פה חמש שנים". באנגלית — <b>הווה מושלם</b>:
      <Ltr><s>I live here five years.</s> → I <b>have lived</b> here <b>for</b> five years. • <b>How long have</b> you <b>lived</b> here?</Ltr>
    </Rule>
    <Task k="א" en="for or since?">כתבו for או since.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.6mm 8mm', fontSize: '10.8pt', margin: '0 0 1.5mm' }}>
      {FS_A.map(([t], i) => <div key={t}>{i + 1}. ________ {t}</div>)}
    </div>
    <Task k="ב" en="Write sentences in the present perfect with for or since.">כתבו משפטים בהווה מושלם.</Task>
    <Ex items={FS_B} start={11} line gap="0.4mm" />
    <Task k="ג" en="Translate into English.">תרגמו לאנגלית.</Task>
    <ol start={15} style={{ margin: 0, paddingInlineStart: '7mm', fontSize: '10.8pt', lineHeight: 1.45 }}>
      {FS_C.map(([h]) => <li key={h}>{h}<div style={{ borderBottom: '1px solid #999', height: '6.2mm' }} /></li>)}
    </ol>
  </S>
}

function PassivePage({ n }) {
  return <S n={n} arts={['🏰']} en="The Passive: Present & Past" he="סביל בהווה ובעבר — מה נעשה, ולא מי עשה">
    <Table head={['tense', 'form', 'example']} rows={[
      ['Present Simple', 'am / is / are + V3', 'Oranges are grown in Israel.'],
      ['Past Simple', 'was / were + V3', 'The Great Pyramid was built about 4,500 years ago.'],
      ['negative', "isn't / wasn't + V3", "The window wasn't broken by the ball."],
      ['question', 'Is / Was + subject + V3?', 'When was the Mona Lisa painted?'],
    ]} widths={['18%', '30%', '52%']} />
    <Rule title="מתי מוסיפים by?">
      רק כשחשוב לדעת מי עשה: <En>"Hamlet" was written <b>by</b> Shakespeare.</En> לא כותבים <En>by someone / by people / by them</En>.
    </Rule>
    <Task k="א" en="Complete with the present or past passive.">השלימו בסביל — הווה או עבר? שימו לב למילות הזמן.</Task>
    <Ex items={PASS_A} gap="1.3mm" />
    <Task k="ב" en="Answer in a full passive sentence.">ענו במשפט סביל מלא (המידע בסוגריים).</Task>
    <Ex items={PASS_C} start={11} line gap="0.4mm" />
  </S>
}

function Passive2Page({ n }) {
  return <S n={n} arts={['🏰']} en="Active → Passive" he="סביל — תרגול מתקדם">
    <Rule title="שלושה צעדים">
      1. המושא של המשפט הפעיל עובר לתחילת המשפט. 2. <En>be</En> באותו זמן כמו הפועל המקורי + <En>V3</En>. 3. מוסיפים <En>by</En> רק אם צריך.
      <Ltr style={{ marginTop: '1mm' }}>The police <b>caught</b> <u>the thief</u>. → <u>The thief</u> <b>was caught</b> by the police.</Ltr>
    </Rule>
    <Task k="א" en="Rewrite in the passive.">העבירו לסביל.</Task>
    <Ex items={PASS_B} line gap="0.3mm" />
    <Tip e="🔑">בשאלה (<En>Did they invite you?</En>) ובשלילה (<En>They don't allow…</En>) — הזמן עובר ל־<En>be</En>: <En>Were you invited? • … aren't allowed.</En></Tip>
  </S>
}

function Cond01Page({ n }) {
  return <S n={n} arts={['🌧']} en="Conditionals: Zero & First" he="משפטי תנאי 0 ו־1 — עובדות ואפשרויות אמיתיות">
    <Table head={['type', 'if-clause', 'main clause', 'use', 'example']} rows={[
      ['0', 'present simple', 'present simple', 'עובדה, תמיד נכון', 'If you heat ice, it melts.'],
      ['1', 'present simple', 'will + V', 'אפשרות אמיתית בעתיד', 'If it rains tomorrow, we will stay home.'],
    ]} widths={['7%', '17%', '17%', '22%', '37%']} />
    <Rule title="שני כללים חשובים">
      1. אחרי <En>if</En> לא כותבים <En>will</En>: <En><s>If it will rain</s> → If it <b>rains</b></En>.<br />
      2. <En><b>unless</b></En> = אלא אם כן (<En>if … not</En>): <En>We'll miss the bus <b>unless</b> we hurry.</En> &nbsp;•&nbsp; פסיק — רק כשמתחילים ב־<En>If</En>.
    </Rule>
    <Task k="א" en="Zero conditional">השלימו — תנאי 0.</Task>
    <Ex items={C0} gap="1.2mm" />
    <Task k="ב" en="First conditional">השלימו — תנאי 1.</Task>
    <Ex items={C1} start={5} gap="1.2mm" />
    <Task k="ג" en="Complete the sentences about yourself.">השלימו על עצמכם.</Task>
    <Ltr style={{ fontSize: '10.6pt', lineHeight: 2.1 }}>11. If I finish my homework early tonight, __________________________________________<br />12. If my team wins the next game, ___________________________________________</Ltr>
  </S>
}

function Cond2Page({ n }) {
  return <S n={n} arts={['🌙']} en="Second Conditional" he="משפטי תנאי 2 — דמיון ומצבים לא סבירים">
    <Rule title="If + past simple, would + V">
      מצב דמיוני בהווה או בעתיד — לא באמת קורה, או כמעט בטוח שלא יקרה.
      <Ltr style={{ marginTop: '1mm' }}>If I <b>had</b> a million shekels, I <b>would travel</b> around the world. (אין לי מיליון…)<br />
        <b>If I were you</b>, I'd talk to the teacher. ← עצה. בכתיבה: <b>were</b> לכל הגופים.</Ltr>
    </Rule>
    <Table head={['First (real)', 'Second (imaginary)']} rows={[["If I win the game tomorrow, I'll be happy. (אולי אנצח)", "If I won the lottery, I'd buy a boat. (כנראה שלא)"]]} />
    <Task k="א" en="Complete with the second conditional.">השלימו — תנאי 2.</Task>
    <Ex items={C2_A} gap="1.2mm" />
    <Task k="ב" en="First or second? Circle.">תנאי 1 או 2? הקיפו.</Task>
    <Ex items={C2_B} start={9} cols={2} />
    <Task k="ג">השלימו: <En>If I could change one thing in my school, I would …</En></Task>
    <Lines n={2} />
  </S>
}

function RelativePage({ n }) {
  return <S n={n} arts={['🧑‍🤝‍🧑']} en="Relative Clauses" he="משפטי זיקה — who, which, that, where, whose">
    <Table head={['word', 'for…', 'example']} rows={[
      ['who', 'אנשים', 'The girl who sits next to me is from Haifa.'],
      ['which', 'דברים, בעלי חיים', 'I read the book which you gave me.'],
      ['that', 'אנשים או דברים', 'The phone that I bought is great.'],
      ['where', 'מקומות', 'This is the school where my mom studied.'],
      ['whose', 'של מי (שייכות)', 'He is the boy whose sister won the race.'],
    ]} widths={['12%', '22%', '66%']} />
    <Tip e="🔑">לא חוזרים על הנושא: <En><s>The boy who <u>he</u> lives here</s></En>. אפשר להשמיט את <En>which / that / who</En> כשאחריהן בא נושא חדש: <En>The book (that) <u>I</u> read was great.</En></Tip>
    <Task k="א" en="Complete with who, which, that, where or whose.">השלימו.</Task>
    <Ex items={REL_A} cols={2} gap="1.2mm" />
    <Task k="ב" en="Join the sentences.">חברו למשפט אחד.</Task>
    <Ex items={REL_B} start={11} line gap="0.3mm" />
    <Task k="ג" en="Write a definition.">כתבו הגדרה עם משפט זיקה.</Task>
    <Ex items={REL_C} start={15} cols={3} line gap="0.3mm" />
  </S>
}

function ConnectorsPage({ n }) {
  return <S n={n} arts={['✏']} en="Connectors" he="מילות קישור — הדבק של הכתיבה">
    <Table head={['function', 'connectors', 'שימו לב']} rows={[
      ['adding — הוספה', 'and, also, in addition, moreover', 'In addition, … (פסיק אחרי)'],
      ['contrast — ניגוד', 'but, however, although, even though, despite', 'although + משפט • despite + שם עצם / ‎-ing'],
      ['cause — סיבה', 'because, because of, since, as', 'because + משפט • because of + שם עצם'],
      ['result — תוצאה', 'so, therefore, as a result', 'Therefore, … (בתחילת משפט חדש)'],
      ['example — דוגמה', 'for example, for instance, such as', 'such as + שם עצם'],
      ['order — סדר', 'first, then, after that, finally', ''],
      ['ending — סיכום', 'in conclusion, to sum up', ''],
    ]} widths={['24%', '40%', '36%']} fs="9.4pt" />
    <Task k="א" en="Circle the correct connector.">הקיפו את מילת הקישור המתאימה.</Task>
    <Ex items={CON_A} gap="1mm" fs="10.3pt" />
    <Task k="ב" en="Join the sentences with the connector in brackets.">חברו את המשפטים.</Task>
    <Ex items={CON_B} start={11} line gap="0.3mm" fs="10.3pt" />
  </S>
}

function MixPage({ n }) {
  return <S n={n} arts={['🧠']} en="Grammar Mix" he="חזרה על הדקדוק של כיתה ט׳">
    <Task k="א" en="Choose the correct answer.">הקיפו את התשובה הנכונה.</Task>
    <MC items={MIX} cols={2} />
    <Task k="ב" en="Find the mistake and correct it.">בכל משפט טעות אחת. מתחו קו מתחתיה וכתבו את התיקון.</Task>
    <Ex items={MIX_FIX} start={13} line gap="0.5mm" />
    <Tip e="🔑">לפני המבחן: עברו על התיבות הצבעוניות בעמודים 3–10 — שם נמצאים כל הכללים.</Tip>
  </S>
}

function AcadPage({ n }) {
  return <S n={n} arts={['📚']} en="Vocabulary: Academic Words" he="אוצר מילים ברמת Band II — מילים שמופיעות בטקסטים ובשאלות">
    <WordBank words={ACAD} />
    <Tip e="💡"><En><b>affect</b></En> הוא פועל (להשפיע): <En>Noise affects sleep.</En> <En><b>effect</b></En> הוא שם עצם (השפעה): <En>Noise has an effect on sleep.</En></Tip>
    <Task k="א" en="Complete with a word from the list. Change the form if necessary.">השלימו במילה מהרשימה (אפשר לשנות צורה).</Task>
    <Ex items={ACAD_A} gap="1.4mm" />
    <Task k="ב" en="Write a word from the list with the same meaning.">כתבו מילה מהרשימה בעלת אותה משמעות.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5mm 6mm', fontSize: '10.8pt' }}>
      {ACAD_B.map(([d], i) => <div key={d}>{i + 7}. {d} = ____________</div>)}
    </div>
  </S>
}

function WordFormPage({ n }) {
  return <S n={n} arts={['🧠']} en="Word Building" he="בניית מילים — סופיות ותחיליות">
    <Table head={['suffix', 'makes…', 'examples']} rows={[
      ['-tion / -sion', 'noun', 'inform → information • decide → decision'],
      ['-ment', 'noun', 'develop → development • agree → agreement'],
      ['-ness', 'noun', 'kind → kindness • happy → happiness'],
      ['-ful / -less', 'adjective', 'use → useful (שימושי) • care → careless (רשלני)'],
      ['-able', 'adjective', 'enjoy → enjoyable • rely → reliable'],
      ['-er / -or', 'noun (person)', 'teach → teacher • act → actor'],
    ]} widths={['18%', '20%', '62%']} />
    <Table head={['prefix', 'meaning', 'examples']} rows={[
      ['un- / in- / im- / dis-', 'לא', 'unhappy • invisible • impossible • dishonest'],
      ['re-', 'שוב', 'rewrite • rebuild'],
      ['mis-', 'באופן שגוי', 'misunderstand • misspell'],
      ['over-', 'יותר מדי', 'oversleep • overcook'],
    ]} widths={['24%', '16%', '60%']} />
    <Task k="א" en="Use the word in brackets in the correct form.">השלימו בצורה הנכונה של המילה שבסוגריים.</Task>
    <Ex items={WF_A} gap="1.2mm" />
    <Task k="ב" en="Write one word with a prefix.">כתבו מילה אחת עם תחילית.</Task>
    <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5mm 6mm', fontSize: '10.8pt' }}>
      {WF_B.map(([d], i) => <div key={d}>{i + 9}. {d} = ____________</div>)}
    </div>
  </S>
}

function UnseenPage({ n, u, idx, arts }) {
  return <S n={n} arts={arts} en={`Unseen ${idx}`} he="הבנת הנקרא — קוראים את הטקסט ועונים באנגלית">
    <Passage title={u.title} kind={u.kind} paras={u.paras} fs="9.6pt" lh={1.38} />
    {u.glossary && <Glossary words={u.glossary} />}
    <Questions items={u.qs} fs="10.1pt" />
  </S>
}

function WritingPage({ n }) {
  return <S n={n} arts={['✏']} en="Writing: An Opinion Paragraph" he="כתיבה — פסקת דעה (100–120 מילים)">
    <Rule title="המשימה">
      <En><b>Some people think that homework should be cancelled in middle school. Do you agree? Write a paragraph and explain your opinion.</b></En>
    </Rule>
    <Table head={['part', 'what to write', 'useful language']} ltr fs="9.4pt" rows={[
      ['Topic sentence', 'הדעה שלכם במשפט אחד', 'In my opinion, … / I strongly believe that …'],
      ['Reason 1 + example', 'נימוק ראשון ודוגמה', 'First of all, … For example, …'],
      ['Reason 2 + example', 'נימוק שני ודוגמה', 'In addition, … For instance, …'],
      ['The other side', 'מה חושבים בצד השני — ולמה אתם לא מסכימים', 'Some people argue that … However, …'],
      ['Conclusion', 'חוזרים על הדעה במילים אחרות', 'To sum up, … / For these reasons, …'],
    ]} widths={['22%', '36%', '42%']} />
    <Lines n={12} h="7.2mm" />
    <Rule title="רשימת בדיקה" style={{ background: 'white', marginTop: '2mm' }}>
      <Checklist items={['משפט פתיחה עם דעה ברורה', 'שני נימוקים, לכל אחד דוגמה', 'הצגתי גם את הצד השני', 'משפט סיכום', 'לפחות 4 מילות קישור שונות', 'הזמנים נכונים (הווה, הווה מושלם, תנאי)', '100–120 מילים', 'בדקתי איות, פסיקים ונקודות']} />
    </Rule>
  </S>
}

function TestAPage({ n }) {
  return <S n={n} arts={['📄']} en="Summary Test — Part A" he="מבחן מסכם — חלק א׳: הבנת הנקרא (40 נקודות)">
    <Tip e="🕒">זמן מומלץ: 60 דקות לכל המבחן. עונים לבד, בלי לחזור לעמודים הקודמים, כמו במבחן סוף שנה. בסוף בודקים בדף התשובות.</Tip>
    <Passage title={T_TEXT.title} kind={T_TEXT.kind} paras={T_TEXT.paras} fs="10.6pt" />
    <Glossary words={[['stacked', 'מוערמים'], ['nutrients', 'חומרי הזנה'], ['crops', 'גידולים'], ['leafy vegetables', 'ירקות עלים']]} />
    <Task k="א" en="Answer the questions." pts={40}>ענו על השאלות (8 נקודות לכל שאלה).</Task>
    <Questions items={T_TEXT.qs} />
  </S>
}

function TestBPage({ n }) {
  return <S n={n} arts={['📄']} en="Summary Test — Part B" he="מבחן מסכם — חלק ב׳: אוצר מילים, דקדוק וכתיבה">
    <Task k="ב" en="Write the word in brackets in the correct form." pts={20}>כתבו את המילה בצורה הנכונה (4 נקודות לכל משפט).</Task>
    <Ex items={T_VOC} gap="1mm" />
    <Task k="ג" en="Circle the correct answer." pts={30}>הקיפו את התשובה הנכונה (3 נקודות לכל משפט).</Task>
    <Ex items={T_GRAM} start={6} cols={2} gap="1mm" />
    <Task k="ד" en="Write 5–6 sentences: If you could meet any famous person, past or present, who would it be? Why? What would you ask?" pts={10}>כתיבה:</Task>
    <Lines n={6} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3mm', marginTop: '2mm', fontSize: '10.5pt', fontWeight: 700 }}>
      {['א: ___ / 40', 'ב: ___ / 20', 'ג: ___ / 30', 'ד: ___ / 10', 'סה״כ: ___ / 100'].map(t => <span key={t} style={{ border: '1.5px solid #111', borderRadius: 8, padding: '1mm 2.5mm' }}>{t}</span>)}
    </div>
  </S>
}

export default function EnglishGrade9Booklet() {
  const key1 = [
    { title: 'עמוד 3 — Present Perfect / Past Simple', answers: [...exKey(PPPS_A), ...exKey(PPPS_B)] },
    { title: 'עמוד 4 — for / since', answers: [...exKey(FS_A), ...exKey(FS_B)] },
    { title: 'עמוד 4 — תרגום', start: 15, answers: exKey(FS_C) },
    { title: 'עמוד 5 — Passive', answers: [...exKey(PASS_A), ...exKey(PASS_C)] },
    { title: 'עמוד 6 — Active → Passive', answers: exKey(PASS_B) },
    { title: 'עמוד 7 — Conditionals 0 & 1', answers: [...exKey(C0), ...exKey(C1)] },
    { title: 'עמוד 8 — Second Conditional', answers: [...exKey(C2_A), ...exKey(C2_B)] },
    { title: 'עמוד 9 — Relative Clauses', note: 'בתרגיל ג׳ — הגדרות לדוגמה.', answers: [...exKey(REL_A), ...exKey(REL_B), ...exKey(REL_C)] },
    { title: 'עמוד 10 — Connectors', note: 'בתרגיל ב׳ אפשר גם: I enjoyed the movie although it was long.', answers: [...exKey(CON_A), ...exKey(CON_B)] },
    { title: 'עמוד 11 — Grammar Mix', answers: [...mcKey(MIX), ...exKey(MIX_FIX)] },
  ]
  const key2 = [
    { title: 'עמוד 12 — מילים אקדמיות', answers: [...exKey(ACAD_A), ...ACAD_B.map(a => a[1])] },
    { title: 'עמוד 13 — בניית מילים', answers: [...exKey(WF_A), ...WF_B.map(w => w[1])] },
    { title: 'עמוד 14 — Unseen 1', note: 'בשאלות הפתוחות מקבלים כל ניסוח נכון.', answers: qKey(U1.qs) },
    { title: 'עמוד 15 — Unseen 2', answers: qKey(U2.qs) },
    { title: 'עמוד 16 — Unseen 3', answers: qKey(U3.qs) },
    { title: 'עמוד 18 — מבחן: הבנת הנקרא', answers: qKey(T_TEXT.qs) },
    { title: 'עמוד 19 — מבחן: בניית מילים', answers: exKey(T_VOC) },
    { title: 'עמוד 19 — מבחן: דקדוק', start: 6, answers: exKey(T_GRAM) },
    { title: 'עמוד 17 + 19 — כתיבה', note: 'בודקים לפי רשימת הבדיקה שבעמוד 17. במבחן: תנאי 2 — If I could meet …, I would …', answers: [] },
  ]
  const mapRows = [
    [3, 'Present Perfect vs Past Simple', 'מתי כל זמן'], [4, 'for / since', 'How long…? ומלכודת העברית'], ['5–6', 'The Passive', 'הווה ועבר, active → passive'],
    [7, 'Conditionals 0 & 1', 'If + present'], [8, 'Second Conditional', 'If + past, would'], [9, 'Relative Clauses', 'who, which, that, where, whose'],
    [10, 'Connectors', 'however, although, therefore…'], [11, 'Grammar Mix', 'חזרה מסכמת'], ['12–13', 'Vocabulary', 'מילים אקדמיות ובניית מילים'],
    ['14–16', 'Unseens', 'מדע, מאמר דעה וסיפור'], [17, 'Writing', 'פסקת דעה'], ['18–19', 'Summary Test', 'מבחן בסגנון סוף חטיבה'],
  ]
  return <>
    <TeenCover accent={ACCENT} arts={['📚', '📄', '✏', '🧠']} en="English Workbook · Grade 9" title="חוברת אנגלית לכיתה ט׳"
      sub="הכנה למבחן סוף חטיבה — דקדוק, אוצר מילים, הבנת הנקרא וכתיבה" pages={PAGES}
      note="החוברת מסכמת את הדקדוק החשוב של סוף החטיבה ומתרגלת את סוגי השאלות שמופיעים במבחנים מסכמים: שאלות פרט, הסקה, מילה בהקשר, הפניה ומטרה. בסוף יש מבחן מסכם של 100 נקודות ודף תשובות מלא. הנושאים המדויקים במבחן משתנים בין בתי ספר — כדאי לבדוק עם המורה." />
    <MapPage n={2} accent={ACCENT} rows={mapRows}
      intro="שלושה שבועות לפני המבחן? עמוד או שניים ביום יספיקו. מתחילים בדקדוק (3–11), ממשיכים לאוצר מילים (12–13), לטקסטים ולכתיבה (14–17), ומסיימים במבחן המסכם (18–19) בתנאי מבחן: עם שעון ובלי להציץ."
      tips={['בטקסט: קוראים קודם את השאלות, ואז את הטקסט.', 'מסמנים בטקסט איפה מצאתם כל תשובה.', 'מילה לא מוכרת? מנסים להבין מההקשר לפני שמחפשים.', 'בכתיבה: מתכננים 3 דקות לפני שכותבים.']}
      terms={[['tense', 'זמן דקדוקי'], ['clause', 'פסוקית'], ['passive', 'סביל'], ['conditional', 'משפט תנאי'], ['relative clause', 'משפט זיקה'], ['connector', 'מילת קישור'], ['suffix', 'סופית'], ['prefix', 'תחילית'], ['paragraph', 'פסקה'], ['topic sentence', 'משפט פתיחה']]} />
    <PPPSPage n={3} />
    <ForSincePage n={4} />
    <PassivePage n={5} />
    <Passive2Page n={6} />
    <Cond01Page n={7} />
    <Cond2Page n={8} />
    <RelativePage n={9} />
    <ConnectorsPage n={10} />
    <MixPage n={11} />
    <AcadPage n={12} />
    <WordFormPage n={13} />
    <UnseenPage n={14} u={U1} idx={1} arts={['⭐']} />
    <UnseenPage n={15} u={U2} idx={2} arts={['📱']} />
    <UnseenPage n={16} u={U3} idx={3} arts={['🎵']} />
    <WritingPage n={17} />
    <TestAPage n={18} />
    <TestBPage n={19} />
    <KeyPage n={20} accent={ACCENT} he="דף תשובות (1) — דקדוק" sections={key1} />
    <KeyPage n={21} accent={ACCENT} he="דף תשובות (2) — אוצר מילים, קריאה ומבחן" sections={key2} />
    <TeenCertificate accent={ACCENT} booklet="חוברת האנגלית לכיתה ט׳" done="דקדוק של סוף החטיבה, אוצר מילים, שלושה טקסטים, כתיבה ומבחן מסכם." />
  </>
}

import { bookletBySlug } from './registry'
import { Checklist, En, Ex, Glossary, KeyPage, Lines, Ltr, Passage, Questions, Rule, Sheet, Table, Task, TeenCertificate, TeenCover, Tip, WordBank } from './englishTeenKit'
import { exKey, qKey } from './englishTeenKeys'

// "חוברת הכנה לבגרות באנגלית — Modules A–G": the exam structure in Hebrew, an unseen strategy, six
// question types with worked examples and mini-practice, three original practice texts (Module C, E and G
// level) with full question sets, writing templates (opinion paragraph, formal / informal email, essay),
// a connectors bank, common mistakes of Hebrew speakers, a two-page key and a certificate.
const PAGES = bookletBySlug('english-bagrut').pages
const ACCENT = '#1f3a68'
const S = props => <Sheet accent={ACCENT} {...props} />

// ---------- Question-type practice ----------
const MINI_TEXT = 'The city library opened a new "Repair Café" last month. Every second Friday, volunteers help residents fix broken toasters, lamps and clothes for free. The organizers say the project has two goals: to reduce waste and to bring neighbors together. So far, more than 200 items have been repaired.'
const DETAIL = [
  { q: 'How often does the Repair Café take place?', a: 'Every second Friday (once every two weeks).' },
  { q: 'What are the TWO goals of the project?', a: 'To reduce waste; to bring neighbors together.' },
  { q: 'How much does a repair cost?', a: 'Nothing — it is free.' },
]
const VOCAB = [
  { q: '"The museum was so crowded that we could hardly move." hardly means…', opts: ['easily', 'almost not', 'quickly'], a: 1 },
  { q: '"Unlike her outgoing brother, Maya is quite reserved and rarely talks to strangers." reserved means…', opts: ['booked in advance', 'quiet and shy', 'angry'], a: 1 },
  { q: '"The plan was feasible: it was cheap, simple and could be done in a week." feasible means…', opts: ['possible to do', 'dangerous', 'expensive'], a: 0 },
]
const INFER = [
  { q: '"Although the restaurant had only six tables, people waited in line for an hour to get in." We can infer that the restaurant was…', opts: ['very popular', 'cheap', 'new'], a: 0 },
  { q: '"Dana looked at her report card, smiled, and ran to call her grandmother." We can understand that Dana was…', opts: ['disappointed', 'pleased with her grades', 'worried about her grandmother'], a: 1 },
  { q: '"By the time the firefighters arrived, the neighbors had already put out the fire with buckets of water." It is clear that…', opts: ['the firefighters were not needed in the end', 'the neighbors started the fire', 'there was no water nearby'], a: 0 },
]
const REFER = [
  ['Many tourists visit Petra every year. It was carved into rock about 2,000 years ago. — It = ________', 'Petra'],
  ['My parents bought me a guitar and an amp, but they forgot the cables. — they = ________', 'my parents'],
  ['The new law will help small businesses, which have suffered a lot this year. — which = ________', 'small businesses'],
  ['Some people believe that cats are unfriendly. This is simply not true. — This = ________', 'the belief that cats are unfriendly'],
]
const FACT_OP = [
  ['The Eiffel Tower is in Paris.', 'F'],
  ['Paris is the most beautiful city in the world.', 'O'],
  ['Unfortunately, the city has not done enough to fix the roads.', 'O'],
  ['The new bridge was opened in 2015.', 'F'],
  ['Teenagers should be allowed to vote at 16.', 'O'],
  ['At sea level, water freezes at 0°C.', 'F'],
]
const PURPOSE = [
  { q: '"Many people think that sharks are dangerous killers. However, according to experts, a person is far more likely to be struck by lightning than attacked by a shark." The purpose of the second sentence is…', opts: ['to describe sharks', 'to challenge a common belief', 'to warn swimmers about lightning'], a: 1 },
  { q: '"Smartphones have changed the way we travel. For example, instead of carrying paper maps, travelers now use navigation apps." The second sentence…', opts: ['gives an example', 'presents an opposite view', 'gives the writer\'s conclusion'], a: 0 },
]

// ---------- Practice texts ----------
const T1 = {
  title: 'Why Do We Yawn?', kind: 'Practice text 1 · Module C level',
  paras: [
    'Everybody yawns. Babies yawn even before they are born, and so do many animals, including dogs, cats and monkeys. Yet scientists are still not completely sure why we do it.',
    'For many years, people believed that we yawn because our bodies need more oxygen. It seemed logical: a yawn is a very deep breath. However, when researchers tested this idea in the 1980s, they found that people did not yawn less when they breathed extra oxygen.',
    'Today, one popular theory is that yawning helps to cool the brain. When we yawn, we take in a large amount of air, and this may cool the blood that flows to the brain. In one experiment, people who held a cold pack against their forehead yawned less than people who held a warm one.',
    'Another mystery is why yawning is "contagious." If you see someone yawn, you will probably yawn too. In fact, even reading about yawning can make people yawn — are you yawning now? Some scientists believe this is connected to empathy, our ability to understand other people\'s feelings. They have noticed that people catch yawns more easily from family members and close friends than from strangers.',
    'Interestingly, dogs can catch yawns from humans, too. So the next time your dog yawns right after you do, it may not be bored. It may simply be "catching" your yawn.',
  ],
  glossary: [['oxygen', 'חמצן'], ['logical', 'הגיוני'], ['forehead', 'מצח'], ['contagious', 'מדבק'], ['empathy', 'אמפתיה']],
  qs: [
    { q: 'Complete: Babies yawn even before ________.', a: 'they are born' },
    { q: 'For many years, what did people believe was the reason for yawning?', a: 'That our bodies need more oxygen.' },
    { q: 'What did researchers find in the 1980s?', opts: ['People yawned less when they breathed extra oxygen.', 'Extra oxygen did not make people yawn less.', 'Animals yawn more than people.'], a: 1 },
    { q: 'According to paragraph 3, how may yawning cool the brain?', a: 'We take in a lot of air, which may cool the blood that flows to the brain.' },
    { q: 'Which result supports the "cooling" theory?', a: 'People holding a cold pack against their forehead yawned less (than people holding a warm one).' },
    { q: 'The word "contagious" (paragraph 4) means…', opts: ['dangerous', 'passing from one person to another', 'very tiring'], a: 1 },
    { q: 'The word "this" in paragraph 4 ("this is connected to empathy") refers to ________.', a: 'the fact that yawning is contagious (catching yawns from others)' },
    { q: 'Complete: People catch yawns more easily from ________ than from ________.', a: 'family members and close friends; strangers' },
    { q: 'Why does the writer ask "are you yawning now?"', opts: ['to check whether the reader is tired', 'to show that reading about yawning can make people yawn', 'to criticize the reader'], a: 1 },
  ],
}
const T2 = {
  title: 'Can Emoji Be a Language?', kind: 'Practice text 2 · Module E level',
  paras: [
    'In 1999, a Japanese designer named Shigetaka Kurita created a set of 176 small pictures for a mobile phone company. He called them "emoji," from the Japanese words for "picture" (e) and "character" (moji). The similarity to the English word "emotion" is a coincidence.',
    'Kurita\'s simple designs soon spread far beyond Japan. In 2010, emoji were added to Unicode, the international standard that allows computers and phones around the world to display the same characters. In 2015, Oxford Dictionaries even chose an emoji — "Face with Tears of Joy" — as its Word of the Year, and a year later the Museum of Modern Art in New York added Kurita\'s original set to its collection.',
    'Some enthusiasts claim that emoji have become a new universal language. After all, a smiling face or a red heart can be understood almost anywhere in the world, regardless of the language people speak.',
    'Most linguists, however, disagree. A language, they explain, has grammar: rules that allow us to combine words into an endless number of new sentences. Emoji have no such rules. Try telling the story of your weekend using only emoji, and your friend will probably understand very little. Moreover, the meaning of an emoji can change from one culture to another; a symbol that looks friendly to one person may seem rude or confusing to someone else.',
    'Yet emoji clearly do something useful. When we talk face to face, we rely on tone of voice, facial expressions and gestures to show how we feel. Text messages lack all of these, and a short reply like "Fine." can easily sound cold or angry. Adding a single emoji can change its tone completely. In this sense, emoji are not a replacement for words, but a kind of digital body language — and that may be exactly why we use them so much.',
  ],
  glossary: [['coincidence', 'צירוף מקרים'], ['standard', 'תקן'], ['enthusiast', 'חובב נלהב'], ['linguist', 'בלשן'], ['gesture', 'תנועת גוף'], ['lack', 'חסר; לחסור']],
  qs: [
    { q: 'Who was Shigetaka Kurita, and what did he create in 1999?', a: 'A Japanese designer; he created a set of 176 emoji for a mobile phone company.' },
    { q: 'Complete: The word "emoji" comes from the Japanese words for ________ and ________.', a: 'picture; character' },
    { q: '"The similarity to the English word \'emotion\' is a coincidence" means that…', opts: ['"emoji" was based on the word "emotion"', 'the two words sound alike only by chance', 'Kurita wanted to express emotions'], a: 1 },
    { q: 'Why was 2010 an important year for emoji?', a: 'Emoji were added to Unicode, so computers and phones around the world could display the same characters.' },
    { q: 'Give TWO facts from paragraph 2 that show emoji became culturally important.', a: 'Oxford Dictionaries chose an emoji as Word of the Year (2015); the Museum of Modern Art added Kurita\'s set to its collection (2016).', lines: 2 },
    { q: 'According to linguists, why are emoji NOT a language? Give ONE reason.', a: 'They have no grammar (rules for combining them) / their meaning changes from culture to culture.' },
    { q: 'What is the purpose of the example "Fine." in paragraph 5?', opts: ['to show that short messages can be misunderstood without tone', 'to teach readers how to write polite messages', 'to show that people are often angry'], a: 0 },
    { q: 'The word "its" in paragraph 5 ("change its tone") refers to ________.', a: 'the short reply / message ("Fine.")' },
    { q: 'Which statement best describes the writer\'s conclusion?', opts: ['Emoji will soon replace words.', 'Emoji are a universal language.', 'Emoji are a kind of digital body language.'], a: 2 },
  ],
}
const T3 = {
  title: 'Too Much of a Good Thing?', kind: 'Practice text 3 · Module G level',
  paras: [
    'Walk into any large supermarket and you will find dozens of different breakfast cereals, shampoos and yogurts. Common sense tells us that more choice is always better: the more options there are, the more likely we are to find exactly what we want. Yet a growing body of research suggests that this assumption is not always correct.',
    'In a famous experiment published in 2000, psychologists Sheena Iyengar and Mark Lepper set up a jam-tasting table in a California supermarket. On some days the table offered 24 flavors; on others, only six. The larger display attracted more shoppers, but it was the smaller one that led to sales: about 30 percent of the people who stopped at the six-jam table bought a jar, compared with only 3 percent at the 24-jam table.',
    'The psychologist Barry Schwartz later popularized the term "the paradox of choice" to describe this effect. According to Schwartz, too many options can lead to "choice paralysis": comparing the alternatives becomes so difficult that we postpone the decision, or avoid it altogether. Even when we do choose, we are often less satisfied, because we keep wondering whether one of the options we rejected would have been better.',
    'However, the story is not quite as simple as it first appeared. When other researchers tried to repeat the jam study, many of them failed to find the same effect. A 2010 review of dozens of experiments concluded that, on average, the number of options had very little influence on whether people made a choice. It seems that large assortments overwhelm us only under certain conditions — for example, when the options are hard to compare, or when people do not know in advance what they prefer.',
    'The lesson, then, is not that choice is bad, but that it has costs as well as benefits. For decisions that matter little, such as which toothpaste to buy, it may be wise to pick something "good enough" and move on. Saving our mental energy for the decisions that really matter may be the most sensible choice of all.',
  ],
  glossary: [['assumption', 'הנחה'], ['paradox', 'פרדוקס, סתירה'], ['postpone', 'לדחות'], ['reject', 'לדחות, לסרב'], ['assortment', 'מבחר'], ['overwhelm', 'להציף, להכביד']],
  qs: [
    { q: 'What "assumption" (paragraph 1) does the writer refer to?', a: 'That more choice is always better.' },
    { q: 'Fill in the chart: what percentage of the shoppers who stopped at each table bought a jar?', a: '6 flavors: about 30%; 24 flavors: about 3%.' },
    { q: 'Why was the result of the jam experiment surprising?', a: 'The larger display attracted more shoppers, but it led to far fewer sales.', lines: 2 },
    { q: 'According to Schwartz, what are TWO negative effects of too many options?', a: 'Choice paralysis — we postpone or avoid the decision; we are less satisfied because we wonder whether a rejected option was better.', lines: 2 },
    { q: 'The word "altogether" (paragraph 3) is closest in meaning to…', opts: ['completely', 'together with others', 'later'], a: 0 },
    { q: 'What is the main purpose of paragraph 4?', opts: ["to support Schwartz's theory with more evidence", 'to show that later research questioned the original findings', 'to describe a new kind of jam'], a: 1 },
    { q: 'According to paragraph 4, when do large assortments overwhelm us? Give ONE condition.', a: 'When the options are hard to compare / when people do not know in advance what they prefer.' },
    { q: 'The word "it" in paragraph 5 ("it has costs as well as benefits") refers to ________.', a: 'choice' },
    { q: 'What does the writer recommend?', a: 'To choose something "good enough" in unimportant decisions and save mental energy for the important ones.', lines: 2 },
    { q: "Which word best describes the writer's approach?", opts: ['one-sided', 'balanced', 'angry'], a: 1 },
  ],
}

// ---------- Writing ----------
const CONN_EX = [
  ['________ the bad weather, the concert took place as planned. (Despite / Although)', 'Despite'],
  ['Ticket prices went up. ________, fewer people came. (Consequently / Moreover)', 'Consequently'],
  ['Some students prefer online lessons, ________ others find them hard. (whereas / therefore)', 'whereas'],
  ['Exercise improves your mood. ________, it helps you sleep better. (Moreover / However)', 'Moreover'],
  ['________ he was injured, he finished the race. (Even though / In spite of)', 'Even though'],
  ['The museum is closed on Mondays. ________, you can visit it on any other day. (However / Therefore)', 'However'],
]
const MISTAKES = [
  ['I am agree with you.', 'I agree with you.', 'agree הוא פועל — בלי am'],
  ['He has 16 years.', 'He is 16 (years old).', 'גיל — עם be'],
  ['I live here five years.', 'I have lived here for five years.', 'מתחיל בעבר ונמשך עד עכשיו → הווה מושלם'],
  ['People is worried.', 'People are worried.', 'people = רבים'],
  ['The informations are useful.', 'The information is useful.', 'information — לא ספיר'],
  ['Its a good idea.', "It's a good idea.", "it's = it is • its = שלו/שלה"],
  ["I didn't went.", "I didn't go.", 'אחרי did / didn\'t — צורת בסיס'],
  ['more better', 'better / much better', 'לא more יחד עם ‎-er'],
  ['Explain me the rule.', 'Explain the rule to me.', 'explain something to someone'],
  ['I want that you come.', 'I want you to come.', 'want + someone + to'],
  ['Everybody have a phone.', 'Everybody has a phone.', 'everybody = יחיד'],
  ['I very like it.', 'I really like it. / I like it very much.', 'very לא בא לפני פועל'],
  ['since three years', 'for three years', 'for + משך זמן'],
  ['english, monday, june', 'English, Monday, June', 'שפות, ימים וחודשים — באות גדולה'],
]
const FIX_TEXT = 'Last summer I have visited London with my family. We was there for ten days. I am agree that London is a fascinating city. The informations at the museums were very clear, and the guides explained us everything. My brother, who has 15 years, very liked the football stadium. Its the best trip of my life, and everybody in my family want to go back!'
const FIX_KEY = ['have visited → visited', 'We was → We were', 'I am agree → I agree', 'The informations were → The information was', 'explained us everything → explained everything to us', 'who has 15 years → who is 15 (years old)', 'very liked → really liked', "Its → It's", 'everybody … want → everybody … wants']

// ---------- Pages ----------
function StructurePage({ n }) {
  return <S n={n} arts={['📄']} en="The English Bagrut" he="מבנה הבחינה — שלוש רמות, שבעה מודולים">
    <p style={{ fontSize: '10.4pt', lineHeight: 1.5, margin: '0 0 2mm' }}>הבגרות באנגלית ניתנת בשלוש רמות: 3, 4 או 5 יחידות לימוד. כל רמה בנויה משלושה <b>מודולים</b> רצופים — אותיות A עד G — ובנוסף יש <b>בחינה בעל־פה</b>. המודולים שבאמצע (C ו־E) משותפים לשתי רמות, ולכן אפשר לעבור מרמה לרמה בלי להתחיל מהתחלה.</p>
    <Table ltr={false} fs="10.2pt" head={['רמה', 'מודולים', 'בחינות כתובות חיצוניות', 'רכיב בית־ספרי']} rows={[
      ['3 יח״ל', 'A · B · C', 'Module A, Module C', 'Module B'],
      ['4 יח״ל', 'C · D · E', 'Module C, Module E', 'Module D'],
      ['5 יח״ל', 'E · F · G', 'Module E, Module G', 'Module F'],
    ]} />
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="מה יש בבחינה הכתובה?" style={{ flex: 1 }}>
        <ul style={{ margin: 0, paddingInlineStart: '5mm' }}>
          <li><b>הבנת הנקרא (Unseen)</b> — טקסטים שלא נלמדו בכיתה, עם שאלות פתוחות, שאלות בחירה, השלמת משפטים וטבלאות. זה לב הבחינה.</li>
          <li><b>כתיבה (Written Presentation)</b> — בחלק מהשאלונים: פסקת דעה, מייל, מכתב או חיבור קצר.</li>
        </ul>
      </Rule>
      <Rule title="מה משתנה מ־A ל־G?" style={{ flex: 1, background: 'white' }}>
        <ul style={{ margin: 0, paddingInlineStart: '5mm' }}>
          <li>הטקסטים ארוכים יותר ואוצר המילים אקדמי יותר.</li>
          <li>יותר שאלות של <b>הסקה, מטרה ועמדת הכותב</b>, ופחות שאלות פרט פשוטות.</li>
          <li>משימת הכתיבה ארוכה ומורכבת יותר.</li>
        </ul>
      </Rule>
    </div>
    <Rule title="איך החוברת עוזרת?" style={{ background: 'white' }}>
      עמודים 3–7: אסטרטגיה וסוגי שאלות • עמודים 8–13: שלושה טקסטים לתרגול — ברמת <En>Module C</En>, ברמת <En>Module E</En> וברמת <En>Module G</En> • עמודים 14–17: כתיבה ומילות קישור • עמוד 18: טעויות נפוצות • עמודים 19–20: תשובות.
    </Rule>
    <Tip e="💡"><b>מילון:</b> בבחינות הכתובות באנגלית מותר בדרך כלל להשתמש במילון מאושר. תרגלו עם המילון שלכם מראש — חיפוש מהיר חוסך דקות יקרות.</Tip>
    <Tip e="🔴"><b>חשוב:</b> מספר הטקסטים, אורך משימת הכתיבה, משך הבחינה ומשקל כל רכיב מתעדכנים מדי כמה שנים. לפני הבחינה בדקו את המבנה העדכני מול המורה ובאתר הפיקוח על הוראת האנגלית במשרד החינוך, ותרגלו על בחינות משנים קודמות.</Tip>
  </S>
}

function StrategyPage({ n }) {
  const steps = [
    ['כותרת ותמונה', 'קוראים את הכותרת, ההקדמה והכיתוב מתחת לתמונה (אם יש). שואלים: על מה הטקסט? איזה סוג טקסט זה — כתבה, סיפור, מאמר דעה?'],
    ['השאלות קודם', 'עוברים מהר על השאלות ומסמנים מילות מפתח. עכשיו אתם יודעים מה לחפש.'],
    ['קריאה ראשונה', 'קוראים את כל הטקסט פעם אחת להבנה כללית — בלי לעצור בכל מילה לא מוכרת.'],
    ['כותרת לכל פסקה', 'בשוליים כותבים 2–3 מילים: על מה הפסקה. כך מוצאים תשובות מהר.'],
    ['לפי הסדר', 'בדרך כלל סדר השאלות הוא סדר הטקסט. תשובה 3 נמצאת בדרך כלל אחרי תשובה 2.'],
    ['מוצאים את המקום', 'מחפשים את מילות המפתח — או מילים נרדפות להן. קוראים את המשפט שלפני ושאחרי.'],
    ['עונים בדיוק', 'עונים על מה שנשאלתם: שתי סיבות = שתיים. "Copy" = מעתיקים בדיוק. "In your own words" = מנסחים מחדש.'],
    ['בודקים', 'האם התשובה מתאימה לשאלה? האם עניתם על כל החלקים? האם השלמת המשפט נכונה דקדוקית?'],
  ]
  return <S n={n} arts={['🧠']} en="How to Read an Unseen" he="אסטרטגיה בשמונה צעדים">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm 3mm', margin: '0 0 2mm' }}>
      {steps.map(([t, d], i) => <div key={t} style={{ border: `1.5px solid ${ACCENT}`, borderRadius: 10, padding: '1.5mm 2.5mm', fontSize: '9.8pt', lineHeight: 1.4 }}>
        <b style={{ color: ACCENT }}>{i + 1}. {t}</b><div>{d}</div>
      </div>)}
    </div>
    <Rule title="מילה לא מוכרת? ארבעה טריקים לפני המילון">
      <ol style={{ margin: 0, paddingInlineStart: '5mm' }}>
        <li><b>הקשר:</b> מה המשפט אומר בלי המילה? מילים כמו <En>but, however, unlike</En> מסמנות ניגוד; <En>such as, for example</En> — דוגמה.</li>
        <li><b>חלקי מילה:</b> <En>un-believ-able</En> = לא + להאמין + אפשר → "לא ייאמן".</li>
        <li><b>חלק דיבר:</b> פועל? שם עצם? שם תואר? זה כבר מצמצם את האפשרויות.</li>
        <li><b>האם צריך אותה?</b> אם המילה לא קשורה לשאלה — ממשיכים הלאה.</li>
      </ol>
    </Rule>
    <Rule title="ניהול זמן" style={{ background: 'white' }}>
      לפני שמתחילים, מחלקים את הזמן לפי הניקוד של כל חלק ומשאירים כ־10 דקות לבדיקה בסוף. נתקעתם בשאלה יותר מ־3 דקות? מסמנים, ממשיכים וחוזרים אליה בסוף. לא משאירים שאלה ריקה — גם תשובה חלקית יכולה לקבל ניקוד.
    </Rule>
    <Tip e="✏">עונים באנגלית, במשפטים ברורים. כשמעתיקים מהטקסט — מעתיקים רק את החלק שעונה על השאלה, לא פסקה שלמה.</Tip>
  </S>
}

function DetailVocabPage({ n }) {
  return <S n={n} arts={['🔑']} en="Question Types 1: Detail & Vocabulary" he="שאלות פרט ומילה בהקשר">
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="שאלת פרט — Detail" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.6pt' }}>According to the text, what / where / when…? • Give TWO reasons… • Fill in the chart.</Ltr>
        התשובה כתובה בטקסט — אבל לעתים קרובות <b>במילים אחרות</b> מבשאלה. מחפשים מילים נרדפות.
      </Rule>
      <Rule title="מילה בהקשר — Vocabulary in context" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.6pt' }}>The word "X" in paragraph 2 means… / is closest in meaning to…</Ltr>
        מציבים כל תשובה במקום המילה ובודקים מה מתאים <b>למשפט הזה</b>. זהירות: לפעמים אחת התשובות היא משמעות אחרת ונכונה של המילה — אבל לא בהקשר הזה!
      </Rule>
    </div>
    <Task k="א" en="Read and answer.">קראו ועננו — שאלות פרט.</Task>
    <Ltr style={{ border: '1.5px solid #9aa5b5', borderRadius: 10, padding: '1.5mm 3mm', fontSize: '10.4pt', lineHeight: 1.45, marginBottom: '1.5mm' }}>{MINI_TEXT}</Ltr>
    <Questions items={DETAIL} />
    <Tip e="💡">בשאלה 3 המילה <En>cost</En> לא מופיעה בטקסט — אבל <En>for free</En> עונה עליה. זה בדיוק "מילים אחרות".</Tip>
    <Task k="ב" en="Vocabulary in context: choose the best meaning.">מילה בהקשר — בחרו את המשמעות המתאימה.</Task>
    <Questions items={VOCAB} start={4} />
  </S>
}

function InferRefPage({ n }) {
  return <S n={n} arts={['🧠']} en="Question Types 2: Inference & Reference" he="שאלות הסקה ושאלות הפניה">
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="הסקה — Inference" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.6pt' }}>What can we learn / infer…? • It can be understood that… • The writer suggests / implies…</Ltr>
        התשובה <b>לא כתובה במפורש</b>. מחברים כמה רמזים מהטקסט. התשובה חייבת להישען על הטקסט — לא על דעה או ידע אישי.
      </Rule>
      <Rule title="הפניה — Reference" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.6pt' }}>What does "it / they / this / which" in line 5 refer to?</Ltr>
        מחפשים <b>לאחור</b> את שם העצם שמתאים ביחיד / ברבים ובמשמעות. בודקים: מציבים את התשובה במקום המילה — האם המשפט הגיוני?
      </Rule>
    </div>
    <Task k="א" en="Inference: choose the best answer.">הסקה — בחרו את התשובה הנכונה.</Task>
    <Questions items={INFER} />
    <Task k="ב" en="Reference: what does the word refer to?">הפניה — למה מתייחסת המילה המודגשת?</Task>
    <Ex items={REFER} start={4} gap="1.6mm" fs="10.3pt" />
    <Tip e="🔑">מלכודת נפוצה: <En>this</En> מתייחס לפעמים לרעיון שלם ולא למילה אחת — כמו בשאלה 7.</Tip>
  </S>
}

function PurposeOpinionPage({ n }) {
  return <S n={n} arts={['💡']} en="Question Types 3: Purpose & Opinion" he="שאלות מטרה ועמדת הכותב">
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="מטרה — Purpose" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.6pt' }}>Why does the writer mention…? • The purpose of paragraph 3 is to…</Ltr>
        שואלים: <b>מה החלק הזה עושה בטקסט?</b> מילות מפתח: <En>However</En> → ניגוד; <En>For example</En> → דוגמה; <En>As a result</En> → תוצאה.
        <Ltr style={{ fontSize: '9.4pt', marginTop: '0.8mm' }}>to inform • to explain • to compare • to give an example • to persuade • to warn • to criticize • to present another view</Ltr>
      </Rule>
      <Rule title="עמדה — Opinion / Attitude" style={{ flex: 1 }}>
        <Ltr style={{ fontSize: '9.6pt' }}>What is the writer's opinion / attitude towards…?</Ltr>
        מחפשים מילים שחושפות דעה: <En>unfortunately, surprisingly, I believe, should, must, clearly</En>. בדרך כלל הדעה מופיעה בפסקה האחרונה.
        <Ltr style={{ fontSize: '9.4pt', marginTop: '0.8mm' }}>positive: enthusiastic, supportive • negative: critical, skeptical • in the middle: balanced, cautious, neutral</Ltr>
      </Rule>
    </div>
    <Task k="א" en="Fact (F) or opinion (O)?">עובדה או דעה? כתבו F או O.</Task>
    <Ex items={FACT_OP} cols={2} gap="1.4mm" fs="10.3pt" />
    <Task k="ב" en="What is the purpose?">מה המטרה של המשפט?</Task>
    <Questions items={PURPOSE} start={7} />
    <Tip e="💡">עובדה אפשר לבדוק; דעה אפשר להתווכח איתה. שמות תואר כמו <En>beautiful, best, terrible</En> ומילים כמו <En>should</En> הן סימן לדעה.</Tip>
  </S>
}

function QuestionWordsPage({ n }) {
  const words = [
    ['according to', 'לפי, על פי'], ['refer to', 'מתייחס ל־'], ['infer', 'להסיק'], ['imply', 'לרמוז'], ['suggest', 'להציע; לרמוז'], ['main idea', 'רעיון מרכזי'],
    ['mention', 'להזכיר'], ['quote / copy', 'לצטט / להעתיק'], ['explain', 'להסביר'], ['complete', 'להשלים'], ['evidence', 'ראיה'], ['support', 'לבסס, לתמוך'],
    ['purpose', 'מטרה'], ['attitude', 'עמדה, יחס'], ['identify', 'לזהות'], ['reason', 'סיבה'], ['result', 'תוצאה'], ['similar', 'דומה'],
    ['difference', 'הבדל'], ['describe', 'לתאר'], ['statement', 'טענה, היגד'], ['following', 'הבאים'], ['except', 'חוץ מ־'], ['chart', 'טבלה'],
  ]
  return <S n={n} arts={['📚']} en="Words in the Questions" he="המילים של השאלות — ומה בדיוק מבקשים מכם">
    <WordBank words={words} />
    <Table ltr={false} fs="9.8pt" head={['ההוראה', 'מה עושים']} widths={['38%', '62%']} rows={[
      [<En key="i">Circle the number of the correct answer.</En>, 'מקיפים מספר אחד בלבד — ובודקים שהוא עונה בדיוק על השאלה.'],
      [<En key="i">Complete the sentence.</En>, 'ההשלמה צריכה להתאים לתחילת המשפט — בזמן, ביחיד / רבים ובדקדוק.'],
      [<En key="i">Copy the words / sentence that show…</En>, 'מעתיקים בדיוק מהטקסט, רק את החלק הנדרש.'],
      [<En key="i">Answer in your own words.</En>, 'מנסחים מחדש. העתקה של משפט שלם מהטקסט לא תתקבל.'],
      [<En key="i">Give TWO reasons / examples.</En>, 'בדיוק שתיים, ושתיים שונות זו מזו. כותבים כל אחת בנפרד.'],
      [<En key="i">True or false? Support your answer.</En>, 'מסמנים, ואחר כך מוסיפים ציטוט או הסבר מהטקסט.'],
      [<En key="i">Which of the following is NOT mentioned?</En>, 'שלוש תשובות כן כתובות בטקסט; מחפשים את זו שלא. מסמנים את NOT בשאלה!'],
      [<En key="i">Fill in the chart.</En>, 'שימו לב לכותרות הטבלה ולדוגמה שכבר מולאה — היא מראה כמה לכתוב.'],
    ]} />
    <Tip e="✏">טיפ: לפני שעונים, מסמנים בשאלה את מילת השאלה (<En>Why / How / What</En>), את המספר (<En>TWO</En>) ואת מספר הפסקה.</Tip>
  </S>
}

function TextPage({ n, t, he, arts, before }) {
  return <S n={n} arts={arts} en={t.title} he={he}>
    <Tip e="🧠">{before}</Tip>
    <Passage title={t.title} kind={t.kind} paras={t.paras} fs="10.6pt" lh={1.5} />
    <Glossary words={t.glossary} />
    <p style={{ fontSize: '9.5pt', color: '#555', margin: 0 }}>בבחינה עצמה ממוספרות בדרך כלל השורות; כאן ממוספרות הפסקאות, והשאלות מפנות אליהן.</p>
  </S>
}

function QuestionsPage({ n, t, he, tip }) {
  return <S n={n} arts={['✏']} en={`Questions: ${t.title}`} he={he}>
    <Tip e="🔑">{tip}</Tip>
    <Questions items={t.qs} fs="10.5pt" />
  </S>
}

function OpinionPage({ n }) {
  const model = [
    ['Topic sentence', 'In my opinion, all schools should require students to wear a uniform.'],
    ['Reason 1 + support', 'First of all, uniforms save time and money. Students do not have to decide what to wear every morning, and parents do not have to buy expensive brand-name clothes.'],
    ['Reason 2 + support', 'In addition, uniforms reduce social pressure. When everyone looks the same, students are judged by who they are, not by what they wear.'],
    ['Counter-argument + answer', 'Some people argue that uniforms limit self-expression. However, students can still express themselves through their ideas, hobbies and achievements.'],
    ['Conclusion', 'To sum up, school uniforms make school life simpler and fairer for everyone.'],
  ]
  return <S n={n} arts={['✏']} en="Writing 1: The Opinion Paragraph" he="פסקת דעה — המבנה שמופיע כמעט בכל בחינה">
    <Table head={['part', 'model paragraph']} widths={['24%', '76%']} fs="9.8pt" rows={model.map(([p, t]) => [<b key="p">{p}</b>, t])} />
    <Tip e="💡">כל נימוק צריך <b>תמיכה</b>: הסבר, דוגמה או תוצאה. נימוק בלי תמיכה הוא רק טענה.</Tip>
    <Task k="✓" en="Should the school day start at 9:00 instead of 8:00? Write an opinion paragraph (about 100–120 words).">משימה:</Task>
    <Table ltr={false} fs="9.6pt" widths={['30%', '70%']} rows={['הדעה שלי', 'נימוק 1 + תמיכה', 'נימוק 2 + תמיכה', 'הצד השני ותשובה'].map(h => [h, <div key="l" style={{ height: '7mm' }} />])} />
    <Lines n={10} h="7.2mm" />
  </S>
}

function EmailPage({ n }) {
  return <S n={n} arts={['💌']} en="Writing 2: Emails — Formal & Informal" he="מייל רשמי ומייל לא רשמי">
    <Table head={['', 'formal (to a manager, teacher, company)', 'informal (to a friend)']} widths={['16%', '42%', '42%']} fs="9.6pt" rows={[
      ['greeting', 'Dear Mr. Cohen, / Dear Ms. Levi, / Dear Sir or Madam,', 'Hi Noa, / Hey Ben,'],
      ['opening', 'I am writing to ask about / apply for / complain about…', 'Thanks for your message! How are you?'],
      ['style', "full forms (I am, do not), polite requests: Could you please…? I would like to…", "contractions (I'm, don't), everyday words"],
      ['ending', 'I look forward to hearing from you.', 'Write back soon! / Can\'t wait to see you!'],
      ['sign-off', 'Yours sincerely, (when you know the name) / Yours faithfully, (Dear Sir or Madam) / Best regards,', 'Love, / Best, / See you,'],
    ]} />
    <Rule title="מייל רשמי לדוגמה" style={{ background: 'white' }}>
      <Ltr style={{ fontSize: '9.8pt', lineHeight: 1.45 }}>
        Dear Ms. Levi,<br />
        I am writing to ask for information about the summer photography course advertised on your website.<br />
        I am sixteen years old, and I have been interested in photography for two years. I would like to know whether the course is suitable for beginners and how many students there are in each group. In addition, could you please tell me if students need to bring their own cameras?<br />
        Thank you for your help. I look forward to hearing from you.<br />
        Yours sincerely,<br />Yoav Mizrahi
      </Ltr>
    </Rule>
    <Task k="✓" en="You saw an ad for volunteers at an animal shelter. Write an email to the manager, Mr. Peretz: introduce yourself, explain why you want to volunteer and ask TWO questions.">משימה:</Task>
    <Lines n={10} h="7.2mm" />
  </S>
}

function EssayPage({ n }) {
  return <S n={n} arts={['📄']} en="Writing 3: The Essay" he="חיבור טיעוני — ארבע או חמש פסקאות">
    <Table head={['paragraph', 'what to include']} widths={['22%', '78%']} fs="9.8pt" rows={[
      ['1. Introduction', 'Hook (a question, a surprising fact or a short story) → background → thesis: your clear position.'],
      ['2. Body 1', 'Topic sentence + first argument + explanation / example.'],
      ['3. Body 2', 'Topic sentence + second argument + explanation / example.'],
      ['4. Counter-argument', 'The other side ("Some people believe…") + why you still disagree ("However, …").'],
      ['5. Conclusion', 'Restate your position in new words + a final thought, a recommendation or a question.'],
    ]} />
    <Rule title="פתיחה לדוגמה — Social media does more harm than good to teenagers. Do you agree?" style={{ background: 'white' }}>
      <Ltr style={{ fontSize: '9.8pt', lineHeight: 1.45 }}>Many teenagers spend several hours a day on social media. While these apps help young people stay in touch with friends, they can also affect their mood, their sleep and their self-confidence. In this essay, I will argue that, without clear limits, social media does more harm than good to teenagers.</Ltr>
    </Rule>
    <Task k="✓" en="Plan your own essay on the same topic. Agree or disagree.">תכננו חיבור משלכם — מסכימים או לא?</Task>
    <Table ltr={false} fs="9.6pt" widths={['26%', '74%']} rows={[['פתיחה ועמדה', ''], ['טיעון 1 + דוגמה', ''], ['טיעון 2 + דוגמה', ''], ['הצד השני ותשובה', ''], ['סיכום', '']].map(r => r.map((c, i) => i ? <div key="l" style={{ height: '9mm' }} /> : c))} />
    <Rule title="רשימת בדיקה לכל משימת כתיבה" style={{ background: 'white' }}>
      <Checklist items={['עניתי על כל חלקי המשימה', 'יש פתיחה, גוף וסיום', 'כל פסקה עוסקת ברעיון אחד', 'מילות קישור מגוונות', 'זמנים והתאמה בין נושא לפועל', 'אוצר מילים מגוון, בלי חזרות', 'האורך מתאים למה שנדרש', 'קראתי שוב ותיקנתי']} />
    </Rule>
  </S>
}

function ConnectorsPage({ n }) {
  return <S n={n} arts={['✏']} en="Connectors & Useful Phrases" he="מילות קישור וביטויים — בנק לכתיבה">
    <Table fs="9.3pt" head={['function', 'connectors', 'example']} widths={['18%', '40%', '42%']} rows={[
      ['adding', 'in addition, moreover, furthermore, also, as well as', 'Moreover, the plan is cheap.'],
      ['contrast', 'however, although, even though, whereas, while, on the other hand', 'Although it was late, we stayed.'],
      ['concession', 'despite, in spite of (+ noun / -ing)', 'Despite the rain, we went out.'],
      ['cause', 'because, since, as, due to, because of (+ noun)', 'The game was cancelled due to the storm.'],
      ['result', 'therefore, as a result, consequently, so', 'As a result, prices went up.'],
      ['example', 'for example, for instance, such as', 'sports such as tennis and judo'],
      ['opinion', 'in my opinion, I believe that, from my point of view', 'From my point of view, …'],
      ['ending', 'in conclusion, to sum up, all in all', 'To sum up, …'],
    ]} />
    <Rule title="פיסוק נכון">
      <Ltr>It was expensive<b>. However,</b> we bought it. • It was expensive<b>; however,</b> we bought it.<br /><b>Although</b> it was expensive, we bought it. ← בלי <s>but</s> אחרי although!</Ltr>
    </Rule>
    <Task k="א" en="Circle the correct connector.">הקיפו את מילת הקישור הנכונה.</Task>
    <Ex items={CONN_EX} gap="1.3mm" fs="10.3pt" />
  </S>
}

function MistakesPage({ n }) {
  return <S n={n} arts={['🔴']} en="Common Mistakes" he="טעויות נפוצות של דוברי עברית — ואיך מתקנים">
    <Table fs="9.3pt" head={['✗ wrong', '✓ right', 'למה?']} widths={['30%', '34%', '36%']} rows={MISTAKES.map(([w, r, y]) => [<s key="w">{w}</s>, <b key="r">{r}</b>, <span key="y" dir="rtl">{y}</span>])} />
    <Task k="א" en="There are 9 mistakes in this paragraph. Find them and correct them.">בפסקה יש 9 טעויות. מתחו קו מתחת לכל טעות וכתבו את התיקון מעליה.</Task>
    <Ltr style={{ border: '1.5px solid #9aa5b5', borderRadius: 10, padding: '2mm 4mm', fontSize: '11pt', lineHeight: 2.3 }}>{FIX_TEXT}</Ltr>
  </S>
}

export default function EnglishBagrutBooklet() {
  const key1 = [
    { title: 'עמוד 4 — שאלות פרט', answers: qKey(DETAIL) },
    { title: 'עמוד 4 — מילה בהקשר', start: 4, answers: qKey(VOCAB) },
    { title: 'עמוד 5 — הסקה', answers: qKey(INFER) },
    { title: 'עמוד 5 — הפניה', start: 4, answers: exKey(REFER) },
    { title: 'עמוד 6 — עובדה או דעה', answers: exKey(FACT_OP) },
    { title: 'עמוד 6 — מטרה', start: 7, answers: qKey(PURPOSE) },
    { title: 'עמוד 9 — טקסט 1 (Module C)', note: 'בשאלות הפתוחות מקבלים כל ניסוח נכון שמבוסס על הטקסט.', answers: qKey(T1.qs) },
  ]
  const key2 = [
    { title: 'עמוד 11 — טקסט 2 (Module E)', answers: qKey(T2.qs) },
    { title: 'עמוד 13 — טקסט 3 (Module G)', answers: qKey(T3.qs) },
    { title: 'עמוד 17 — מילות קישור', answers: exKey(CONN_EX) },
    { title: 'עמוד 18 — 9 הטעויות', answers: FIX_KEY },
    { title: 'עמודים 14–16 — כתיבה', note: 'אין תשובה אחת נכונה. בודקים לפי המבנה שבכל עמוד ולפי רשימת הבדיקה בעמוד 16: תוכן מלא, מבנה, מילות קישור, דקדוק, אוצר מילים ואורך.', answers: [] },
  ]
  return <>
    <TeenCover accent={ACCENT} arts={['📄', '🧠', '✏', '📚']} en="English Bagrut Prep · Modules A–G" title="חוברת הכנה לבגרות באנגלית"
      sub="מבנה הבחינה, אסטרטגיות לכל סוג שאלה, שלושה טקסטים בשלוש רמות ותבניות כתיבה" pages={PAGES}
      note="החוברת מיועדת לתלמידי תיכון בכל הרמות. מתחילים בהסבר על מבנה הבחינה ובאסטרטגיה, מתרגלים כל סוג שאלה בנפרד, ואז פותרים טקסטים מלאים ברמה שלכם. כל הטקסטים נכתבו במיוחד לחוברת. בסוף יש דף תשובות מלא." />
    <StructurePage n={2} />
    <StrategyPage n={3} />
    <DetailVocabPage n={4} />
    <InferRefPage n={5} />
    <PurposeOpinionPage n={6} />
    <QuestionWordsPage n={7} />
    <TextPage n={8} t={T1} arts={['🥱']} he="טקסט תרגול 1 — ברמת Module C" before="לפני הקריאה: הכותרת היא שאלה. מה אתם כבר יודעים על פיהוק? קראו קודם את השאלות בעמוד 9." />
    <QuestionsPage n={9} t={T1} he="שאלות לטקסט 1" tip="שאלות 3, 6 ו־9 הן שאלות בחירה — מקיפים תשובה אחת. בשאלה 7 חפשו רעיון שלם, לא מילה אחת." />
    <TextPage n={10} t={T2} arts={['😀']} he="טקסט תרגול 2 — ברמת Module E" before="לפני הקריאה: מתי אתם משתמשים באימוג׳י? האם לדעתכם הם שפה? קראו קודם את השאלות בעמוד 11." />
    <QuestionsPage n={11} t={T2} he="שאלות לטקסט 2" tip="בשאלה 5 — שתי עובדות שונות. בשאלה 7 — שאלו את עצמכם: מה הדוגמה עושה בפסקה?" />
    <TextPage n={12} t={T3} arts={['🍓']} he="טקסט תרגול 3 — ברמת Module G" before="לפני הקריאה: מתי קשה לכם לבחור? שימו לב למילה However בתחילת פסקה 4 — היא משנה את כיוון הטקסט." />
    <QuestionsPage n={13} t={T3} he="שאלות לטקסט 3" tip="ברמת G יש יותר שאלות מטרה ועמדה. בשאלות 6 ו־10 חשבו על המבנה של כל הטקסט, לא רק על משפט אחד." />
    <OpinionPage n={14} />
    <EmailPage n={15} />
    <EssayPage n={16} />
    <ConnectorsPage n={17} />
    <MistakesPage n={18} />
    <KeyPage n={19} accent={ACCENT} he="דף תשובות (1) — סוגי שאלות וטקסט 1" sections={key1} />
    <KeyPage n={20} accent={ACCENT} he="דף תשובות (2) — טקסטים 2–3, מילות קישור וטעויות" sections={key2} />
    <TeenCertificate accent={ACCENT} booklet="חוברת ההכנה לבגרות באנגלית" done="אסטרטגיות קריאה, שלושה טקסטים בשלוש רמות ושלוש משימות כתיבה." />
  </>
}

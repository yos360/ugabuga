import { A4, AnswerKey, Certificate, Cover } from './kit'
import { bookletBySlug } from './registry'

// "משפטי פירמידה": a sentence grows by one word (or a few) on every line, up to four lines, fully pointed.
// The child reads the pyramid from the top, then answers two questions: one to circle, one to write.
// Pyramids 1–8 suit grade 1 (one word more per line), 9–16 grade 2 (longer lines).
const PAGES = bookletBySlug('sentence-pyramids').pages

export const PYRAMIDS = [
  { lines: ['דָּנִי', 'דָּנִי רָץ', 'דָּנִי רָץ מַהֵר', 'דָּנִי רָץ מַהֵר הַבַּיְתָה.'],
    q1: { q: 'מִי רָץ?', options: ['דָּנָה', 'דָּנִי', 'אַבָּא'], answer: 'דָּנִי' }, q2: { q: 'לְאָן רָץ דָּנִי?', answer: 'הַבַּיְתָה' } },
  { lines: ['הַחָתוּל', 'הַחָתוּל יָשֵׁן', 'הַחָתוּל הַקָּטָן יָשֵׁן', 'הַחָתוּל הַקָּטָן יָשֵׁן בַּשֶּׁמֶשׁ.'],
    q1: { q: 'אֵיזֶה חָתוּל יָשֵׁן?', options: ['גָּדוֹל', 'קָטָן', 'שָׁחֹר'], answer: 'קָטָן' }, q2: { q: 'אֵיפֹה יָשֵׁן הַחָתוּל?', answer: 'בַּשֶּׁמֶשׁ' } },
  { lines: ['נוֹעָה', 'נוֹעָה אוֹכֶלֶת', 'נוֹעָה אוֹכֶלֶת תַּפּוּחַ', 'נוֹעָה אוֹכֶלֶת תַּפּוּחַ אָדֹם.'],
    q1: { q: 'מָה אוֹכֶלֶת נוֹעָה?', options: ['בָּנָנָה', 'עוּגָה', 'תַּפּוּחַ'], answer: 'תַּפּוּחַ' }, q2: { q: 'בְּאֵיזֶה צֶבַע הַתַּפּוּחַ?', answer: 'אָדֹם' } },
  { lines: ['הַכֶּלֶב', 'הַכֶּלֶב נוֹבֵחַ', 'הַכֶּלֶב נוֹבֵחַ חָזָק', 'הַכֶּלֶב נוֹבֵחַ חָזָק בַּחָצֵר.'],
    q1: { q: 'מָה עוֹשֶׂה הַכֶּלֶב?', options: ['נוֹבֵחַ', 'יָשֵׁן', 'אוֹכֵל'], answer: 'נוֹבֵחַ' }, q2: { q: 'אֵיפֹה נוֹבֵחַ הַכֶּלֶב?', answer: 'בַּחָצֵר' } },
  { lines: ['אַבָּא', 'אַבָּא בּוֹנֶה', 'אַבָּא בּוֹנֶה מִגְדָּל', 'אַבָּא בּוֹנֶה מִגְדָּל גָּבוֹהַּ.'],
    q1: { q: 'מָה בּוֹנֶה אַבָּא?', options: ['בַּיִת', 'גֶּשֶׁר', 'מִגְדָּל'], answer: 'מִגְדָּל' }, q2: { q: 'אֵיזֶה מִגְדָּל בּוֹנֶה אַבָּא?', answer: 'גָּבוֹהַּ' } },
  { lines: ['הַצִּפּוֹר', 'הַצִּפּוֹר שָׁרָה', 'הַצִּפּוֹר שָׁרָה שִׁיר', 'הַצִּפּוֹר שָׁרָה שִׁיר יָפֶה.'],
    q1: { q: 'מָה עוֹשָׂה הַצִּפּוֹר?', options: ['עָפָה', 'שָׁרָה', 'אוֹכֶלֶת'], answer: 'שָׁרָה' }, q2: { q: 'אֵיזֶה שִׁיר שָׁרָה הַצִּפּוֹר?', answer: 'יָפֶה' } },
  { lines: ['יוֹנָתָן', 'יוֹנָתָן קוֹרֵא', 'יוֹנָתָן קוֹרֵא סֵפֶר', 'יוֹנָתָן קוֹרֵא סֵפֶר בַּמִּטָּה.'],
    q1: { q: 'מָה קוֹרֵא יוֹנָתָן?', options: ['סֵפֶר', 'מִכְתָּב', 'עִתּוֹן'], answer: 'סֵפֶר' }, q2: { q: 'אֵיפֹה קוֹרֵא יוֹנָתָן?', answer: 'בַּמִּטָּה' } },
  { lines: ['הַשֶּׁמֶשׁ', 'הַשֶּׁמֶשׁ זוֹרַחַת', 'הַשֶּׁמֶשׁ זוֹרַחַת בַּבֹּקֶר', 'הַשֶּׁמֶשׁ זוֹרַחַת בַּבֹּקֶר בַּשָּׁמַיִם.'],
    q1: { q: 'מָתַי זוֹרַחַת הַשֶּׁמֶשׁ?', options: ['בַּלַּיְלָה', 'בַּבֹּקֶר', 'בָּעֶרֶב'], answer: 'בַּבֹּקֶר' }, q2: { q: 'אֵיפֹה זוֹרַחַת הַשֶּׁמֶשׁ?', answer: 'בַּשָּׁמַיִם' } },
  { lines: ['הַיְּלָדִים מְשַׂחֲקִים', 'הַיְּלָדִים מְשַׂחֲקִים בַּכַּדּוּר', 'הַיְּלָדִים מְשַׂחֲקִים בַּכַּדּוּר בַּהַפְסָקָה', 'הַיְּלָדִים מְשַׂחֲקִים בַּכַּדּוּר בַּהַפְסָקָה הַגְּדוֹלָה.'],
    q1: { q: 'בְּמָה מְשַׂחֲקִים הַיְּלָדִים?', options: ['בַּחֶבֶל', 'בַּכַּדּוּר', 'בַּקְּלָפִים'], answer: 'בַּכַּדּוּר' }, q2: { q: 'מָתַי מְשַׂחֲקִים הַיְּלָדִים?', answer: 'בַּהַפְסָקָה הַגְּדוֹלָה' } },
  { lines: ['סַבְתָּא אוֹפָה', 'סַבְתָּא אוֹפָה עוּגָה', 'סַבְתָּא אוֹפָה עוּגָה מְתוּקָה', 'סַבְתָּא אוֹפָה עוּגָה מְתוּקָה לְמִיכַל.'],
    q1: { q: 'מָה אוֹפָה סַבְתָּא?', options: ['לֶחֶם', 'עוּגִיּוֹת', 'עוּגָה'], answer: 'עוּגָה' }, q2: { q: 'לְמִי אוֹפָה סַבְתָּא אֶת הָעוּגָה?', answer: 'לְמִיכַל' } },
  { lines: ['הַדָּג שׂוֹחֶה', 'הַדָּג הַזָּהֹב שׂוֹחֶה', 'הַדָּג הַזָּהֹב שׂוֹחֶה לְאַט', 'הַדָּג הַזָּהֹב שׂוֹחֶה לְאַט בָּאַקְוַרְיוּם.'],
    q1: { q: 'אֵיךְ שׂוֹחֶה הַדָּג?', options: ['מַהֵר', 'לְאַט', 'לְמַעְלָה'], answer: 'לְאַט' }, q2: { q: 'אֵיפֹה שׂוֹחֶה הַדָּג?', answer: 'בָּאַקְוַרְיוּם' } },
  { lines: ['הָרַכֶּבֶת נוֹסַעַת', 'הָרַכֶּבֶת נוֹסַעַת מַהֵר', 'הָרַכֶּבֶת הָאֲרֻכָּה נוֹסַעַת מַהֵר', 'הָרַכֶּבֶת הָאֲרֻכָּה נוֹסַעַת מַהֵר לִירוּשָׁלַיִם.'],
    q1: { q: 'אֵיזוֹ רַכֶּבֶת נוֹסַעַת?', options: ['קְצָרָה', 'אֲדֻמָּה', 'אֲרֻכָּה'], answer: 'אֲרֻכָּה' }, q2: { q: 'לְאָן נוֹסַעַת הָרַכֶּבֶת?', answer: 'לִירוּשָׁלַיִם' } },
  { lines: ['הַגַּנָּן שׁוֹתֵל', 'הַגַּנָּן שׁוֹתֵל פְּרָחִים', 'הַגַּנָּן שׁוֹתֵל פְּרָחִים צִבְעוֹנִיִּים', 'הַגַּנָּן שׁוֹתֵל פְּרָחִים צִבְעוֹנִיִּים בַּגִּנָּה.'],
    q1: { q: 'מָה שׁוֹתֵל הַגַּנָּן?', options: ['פְּרָחִים', 'עֵצִים', 'יְרָקוֹת'], answer: 'פְּרָחִים' }, q2: { q: 'אֵיפֹה שׁוֹתֵל הַגַּנָּן אֶת הַפְּרָחִים?', answer: 'בַּגִּנָּה' } },
  { lines: ['מָאיָה מְצַיֶּרֶת', 'מָאיָה מְצַיֶּרֶת בַּכִּתָּה', 'מָאיָה מְצַיֶּרֶת קֶשֶׁת בַּכִּתָּה', 'מָאיָה מְצַיֶּרֶת קֶשֶׁת צִבְעוֹנִית בַּכִּתָּה.'],
    q1: { q: 'מָה מְצַיֶּרֶת מָאיָה?', options: ['שֶׁמֶשׁ', 'קֶשֶׁת', 'בַּיִת'], answer: 'קֶשֶׁת' }, q2: { q: 'אֵיפֹה מְצַיֶּרֶת מָאיָה?', answer: 'בַּכִּתָּה' } },
  { lines: ['הַגֶּשֶׁם יוֹרֵד', 'הַגֶּשֶׁם יוֹרֵד חָזָק', 'הַגֶּשֶׁם הַקַּר יוֹרֵד חָזָק', 'הַגֶּשֶׁם הַקַּר יוֹרֵד חָזָק כָּל הַלַּיְלָה.'],
    q1: { q: 'אֵיזֶה גֶּשֶׁם יוֹרֵד?', options: ['חַם', 'קַל', 'קַר'], answer: 'קַר' }, q2: { q: 'כַּמָּה זְמַן יוֹרֵד הַגֶּשֶׁם?', answer: 'כָּל הַלַּיְלָה' } },
  { lines: ['עוֹמֶר מְטַפֵּס', 'עוֹמֶר מְטַפֵּס לְאַט', 'עוֹמֶר מְטַפֵּס לְאַט עַל הָעֵץ', 'עוֹמֶר מְטַפֵּס לְאַט עַל הָעֵץ הַגָּבוֹהַּ.'],
    q1: { q: 'עַל מָה מְטַפֵּס עוֹמֶר?', options: ['עַל הַקִּיר', 'עַל הָעֵץ', 'עַל הַסֻּלָּם'], answer: 'עַל הָעֵץ' }, q2: { q: 'אֵיךְ מְטַפֵּס עוֹמֶר?', answer: 'לְאַט' } },
]
// Starting words for the page where the child builds a pyramid of their own.
export const OWN = ['הַפִּיל', 'אִמָּא']

const line = { borderBottom: '1.5px solid #111', height: 30, flex: 1 }

function Pyramid({ n, p }) {
  return <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '2px solid #111', borderRadius: 14, padding: '10px 16px' }}>
    <b style={{ fontSize: '11pt', color: '#555' }}>פִּירָמִידָה {n}</b>
    <div style={{ textAlign: 'center', fontSize: '19pt', lineHeight: 1.75, fontWeight: 700 }}>
      {p.lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
    <div style={{ fontSize: '14pt', lineHeight: 1.6, marginTop: 'auto' }}>
      <div>1. {p.q1.q} <span style={{ fontSize: '11pt' }}>(מַקִּיפִים)</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 700, margin: '2px 0 8px' }}>{p.q1.options.map(o => <span key={o}>{o}</span>)}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}><span>2. {p.q2.q}</span><span style={line} /></div>
    </div>
  </section>
}

function PyramidPage({ n, first }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>🔺 {PAGES[n - 1]}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת &nbsp;·&nbsp; קוראים מלמעלה למטה, ואז עונים על השאלות</p>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Pyramid n={first + 1} p={PYRAMIDS[first]} />
      <Pyramid n={first + 2} p={PYRAMIDS[first + 1]} />
    </div>
  </A4>
}

function OwnPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✏️ {PAGES[n - 1]}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת &nbsp;·&nbsp; מוסיפים בכל שורה עוד מילה</p>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {OWN.map(w => <section key={w} style={{ flex: 1, border: '2px solid #111', borderRadius: 14, padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
        <b style={{ fontSize: '20pt' }}>{w}</b>
        {[40, 60, 80].map(pct => <span key={pct} style={{ ...line, flex: 'none', width: `${pct}%` }} />)}
      </section>)}
    </div>
  </A4>
}

export default function SentencePyramidsBooklet() {
  return <>
    <Cover emoji="🔺📖" title="משפטי פירמידה" subtitle="16 פירמידות מנוקדות לקריאה, ושתי שאלות לכל אחת" pages={PAGES}
      note="בכל פירמידה המשפט גדל: בכל שורה נוספת מילה. הילד קורא מלמעלה למטה, כך שכל שורה חוזרת על מה שכבר קרא ומוסיפה עליו — וזה בונה שטף ודיוק. אחרי הקריאה עונים על שתי שאלות: באחת מקיפים, ובשנייה כותבים. פירמידות 1–8 מתאימות לכיתה א׳, ו־9–16 ארוכות יותר ומתאימות לכיתה ב׳." />
    {[0, 2, 4, 6, 8, 10, 12, 14].map((first, i) => <PyramidPage key={first} n={i + 2} first={first} />)}
    <OwnPage n={10} />
    <AnswerKey n={11} sections={[
      { title: 'שאלה 1 — מקיפים', answers: PYRAMIDS.map(p => p.q1.answer) },
      { title: 'שאלה 2 — כותבים', answers: PYRAMIDS.map(p => p.q2.answer) },
    ]} />
    <Certificate booklet="חוברת משפטי הפירמידה" done="קראתי 16 פירמידות ועניתי על השאלות." cheer="כל הכבוד, קורא/ת אלוף/ה!" />
  </>
}

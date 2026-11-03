import { A4, AnswerKey, Certificate, Cover } from './kit'
import { bookletBySlug } from './registry'

// "טקסטים קצרים בניקוד": short pointed reading passages for grades 1–2 with comprehension questions.
// Every word (text and questions) uses only patach, kamatz, shva and chirik (plus dagesh and the shin/sin dot).
// Each text: title, stage label, sentences, and three questions with three options (answer = index of the right one).
const PAGES = bookletBySlug('nikud-short-texts').pages

export const TEXTS = [
  { title: 'בַּגַּן', stage: 'פַּתַח וְקָמָץ', emoji: '🌳', text: 'דָּן וְרָם בַּגַּן. דָּן רָץ וְרָם שָׁר. אַבָּא בָּא וְנָח.',
    qs: [['מִי רָץ?', ['דָּן', 'רָם', 'אַבָּא'], 0], ['מִי שָׁר?', ['דָּן', 'רָם', 'אַבָּא'], 1], ['מִי בָּא?', ['דָּן', 'רָם', 'אַבָּא'], 2]] },
  { title: 'דָּג קָטָן', stage: 'פַּתַח וְקָמָץ', emoji: '🐟', text: 'דָּג קָטָן שָׁט בַּיָּם. הַדָּג אָכַל וְנָח. גַּל בָּא וְאָמַר: דָּג! דָּג!',
    qs: [['מָה שָׁט בַּיָּם?', ['דָּג', 'גָּמָל', 'נָחָשׁ'], 0], ['מִי בָּא?', ['דָּן', 'גַּל', 'רָם'], 1], ['הַדָּג שָׁט בְּ…', ['בַּגַּן', 'בַּבַּיִת', 'בַּיָּם'], 2]] },
  { title: 'הַכַּלְבָּה', stage: 'מוֹסִיפִים שְׁוָא', emoji: '🐕', text: 'דַּפְנָה הִיא יַלְדָּה. לְדַפְנָה כַּלְבָּה קְטַנָּה. הַכַּלְבָּה רָצָה וְנָבְחָה.',
    qs: [['מִי רָצָה?', ['הַכַּלְבָּה', 'דַּפְנָה', 'אִמָּא'], 0], ['לְמִי כַּלְבָּה קְטַנָּה?', ['לְדָנִי', 'לְדַפְנָה', 'לְרָם'], 1], ['מָה עָשְׂתָה הַכַּלְבָּה?', ['שָׁרָה', 'קָמָה', 'נָבְחָה'], 2]] },
  { title: 'הַמִּשְׁפָּחָה', stage: 'מוֹסִיפִים שְׁוָא', emoji: '👪', text: 'הַמִּשְׁפָּחָה בַּבַּיִת. אִמָּא בִּשְׁלָה. אַבָּא קָרָא וְדַפְנָה שָׁרָה.',
    qs: [['מִי בִּשְׁלָה?', ['אִמָּא', 'אַבָּא', 'דַּפְנָה'], 0], ['מִי שָׁרָה?', ['אִמָּא', 'דַּפְנָה', 'אַבָּא'], 1], ['הַמִּשְׁפָּחָה בְּ…', ['בַּגַּן', 'בַּיָּם', 'בַּבַּיִת'], 2]] },
  { title: 'בַּכִּתָּה', stage: 'מוֹסִיפִים חִירִיק', emoji: '🏫', text: 'מִרְיָם תַּלְמִידָה בַּכִּתָּה. מִרְיָם קָרְאָה, כָּתְבָה וְשָׁרָה.',
    qs: [['מִי תַּלְמִידָה?', ['מִרְיָם', 'דָּן', 'אַבָּא'], 0], ['מִי כָּתְבָה?', ['דָּן', 'מִרְיָם', 'אִמָּא'], 1], ['מִרְיָם קָרְאָה, כָּתְבָה וְ…', ['נָמָה', 'שָׁטָה', 'שָׁרָה'], 2]] },
  { title: 'הַפִּיל בַּיָּם', stage: 'מוֹסִיפִים חִירִיק', emoji: '🐘', text: 'פִּיל קָטָן בָּא לַיָּם. הַפִּיל שָׁתָה מַיִם וְרָחַץ. אַחַר כָּךְ הַפִּיל נָם.',
    qs: [['מִי בָּא לַיָּם?', ['פִּיל', 'דָּג', 'גָּמָל'], 0], ['מָה שָׁתָה הַפִּיל?', ['חָלָב', 'מַיִם', 'מִיץ'], 1], ['אַחַר כָּךְ מָה עָשָׂה הַפִּיל?', ['קָם', 'שָׁר', 'נָם'], 2]] },
  { title: 'הַגָּמָל בַּמִּדְבָּר', stage: 'קוֹרְאִים לְאַט', emoji: '🐫', text: 'גָּמָל הָלַךְ בַּמִּדְבָּר. הַגָּמָל צָמָא. דָּנִי נָתַן לַגָּמָל מַיִם. הַגָּמָל שָׁתָה וְשָׁבַע.',
    qs: [['מִי הָלַךְ בַּמִּדְבָּר?', ['גָּמָל', 'דָּג', 'פִּיל'], 0], ['מִי נָתַן מַיִם?', ['אַבָּא', 'דָּנִי', 'דַּפְנָה'], 1], ['מִי צָמָא?', ['הַדָּג', 'הַפִּיל', 'הַגָּמָל'], 2]] },
  { title: 'חַלָּה לְשַׁבָּת', stage: 'קוֹרְאִים לְאַט', emoji: '🍞', text: 'בְּשַׁבָּת אִמָּא אָפְתָה חַלָּה. דַּפְנָה עָזְרָה לְאִמָּא. הַמִּשְׁפָּחָה אָכְלָה חַלָּה. דַּפְנָה שָׂמְחָה.',
    qs: [['מִי אָפְתָה חַלָּה?', ['אִמָּא', 'אַבָּא', 'דַּפְנָה'], 0], ['מִי עָזְרָה?', ['אַבָּא', 'דַּפְנָה', 'מִרְיָם'], 1], ['מָה אָכְלָה הַמִּשְׁפָּחָה?', ['דָּג', 'מִיץ', 'חַלָּה'], 2]] },
]

const MARKS = [['ַ', 'פַּתַח', 'בַּ'], ['ָ', 'קָמָץ', 'בָּ'], ['ְ', 'שְׁוָא', 'בְּ'], ['ִ', 'חִירִיק', 'בִּ']]

function TextPage({ n, t }) {
  return <A4 style={{ alignItems: 'stretch', direction: 'rtl' }}>
    <h2 style={{ margin: 0 }}>{t.emoji} {t.title}</h2>
    <p style={{ textAlign: 'center', margin: '4px 0 10px', fontSize: 14 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת &nbsp;·&nbsp; <b>{t.stage}</b></p>
    <p style={{ fontSize: '12pt', margin: '0 0 6px', fontWeight: 700 }}>קוראים את הטקסט בקול, לאט, עם אצבע מתחת לכל מילה:</p>
    <div style={{ border: '2px solid #111', borderRadius: 14, padding: '18px 22px', fontSize: '25pt', lineHeight: 2.1, fontWeight: 600, fontFamily: 'Heebo, Arial, sans-serif' }}>{t.text}</div>
    <p style={{ fontSize: '12pt', margin: '16px 0 4px', fontWeight: 700 }}>עונים על השאלות — מקיפים את התשובה הנכונה:</p>
    {t.qs.map(([q, opts], i) => <div key={q} style={{ margin: '8px 0', fontFamily: 'Heebo, Arial, sans-serif' }}>
      <div style={{ fontSize: '17pt', fontWeight: 700 }}>{i + 1}. {q}</div>
      <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>{opts.map(o => <span key={o} style={{ flex: 1, textAlign: 'center', border: '2px solid #9aa5b5', borderRadius: 12, padding: '6px 4px', fontSize: '19pt', fontWeight: 600 }}>{o}</span>)}</div>
    </div>)}
    <p style={{ fontSize: '12pt', margin: '14px 0 0' }}>קראתי: ◯ פעם אחת &nbsp; ◯ פעמיים &nbsp; ◯ שלוש פעמים</p>
  </A4>
}

function MarksPage({ n }) {
  return <A4 style={{ alignItems: 'stretch', direction: 'rtl' }}>
    <h2 style={{ margin: 0 }}>✏️ הניקוד שלנו</h2>
    <p style={{ textAlign: 'center', margin: '4px 0 12px', fontSize: 14 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת</p>
    <p style={{ fontSize: '13pt', lineHeight: 1.7 }}>ארבעה סימני ניקוד מלווים אותנו בכל הטקסטים. מסתכלים על הסימן שמתחת לאות, ומחליטים איך לקרוא אותה.</p>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '15pt', textAlign: 'center' }}>
      <thead><tr>{['הסימן', 'השם', 'דוגמה', 'איך קוראים'].map(h => <th key={h} style={{ border: '1.5px solid #111', padding: 8, background: '#f3f4f6' }}>{h}</th>)}</tr></thead>
      <tbody>{MARKS.map(([m, name, ex], i) => <tr key={name}>
        <td style={{ border: '1.5px solid #111', padding: 10, fontSize: '30pt' }}>◌{m}</td>
        <td style={{ border: '1.5px solid #111', padding: 10, fontWeight: 700 }}>{name}</td>
        <td style={{ border: '1.5px solid #111', padding: 10, fontSize: '30pt', fontWeight: 700 }}>{ex}</td>
        <td style={{ border: '1.5px solid #111', padding: 10, fontSize: '12pt' }}>{['נשמע אַ', 'נשמע אָ — כמו הפתח', 'לפעמים נשמע (בְּ) ולפעמים לא (יַלְדָּה)', 'נשמע אִי'][i]}</td>
      </tr>)}</tbody>
    </table>
    <p style={{ fontSize: '13pt', lineHeight: 1.7, marginTop: 14 }}>
      <b>טיפ לקריאה:</b> קוראים אות אחרי אות, ורק אחרי זה את כל המילה. אם מילה קשה — קוראים אותה פעם נוספת לאט. בסוף כל טקסט שואלים: מי? מה? איפה?
    </p>
  </A4>
}

export default function NikudTextsBooklet() {
  return <>
    <Cover emoji="📖✏️" title="טקסטים קצרים בניקוד" subtitle="קוראים וענים על שאלות — פתח, קמץ, שווא וחיריק" pages={PAGES}
      note="שמונה טקסטים קצרים, מכל טקסט שלוש שאלות הבנה. כל המילים כתובות בניקוד מלא, ורק בארבעת סימני הניקוד של הכיתות הראשונות: פתח, קמץ, שווא וחיריק. הטקסטים מתחילים בקצרים מאוד ומתארכים לאט. קוראים בקול, מקיפים תשובה נכונה, ובסוף בודקים בדף התשובות." />
    <MarksPage n={2} />
    {TEXTS.map((t, i) => <TextPage key={t.title} n={i + 3} t={t} />)}
    <AnswerKey n={11} sections={TEXTS.map((t, i) => ({ title: `עמוד ${i + 3} — ${t.title}`, answers: t.qs.map(([, opts, a], j) => `${j + 1}. ${opts[a]}`) }))} />
    <Certificate booklet="חוברת הטקסטים בניקוד" done="קראתי טקסטים קצרים בניקוד ועניתי על השאלות." cheer="כל הכבוד, קורא/ת מצוין/ת!" />
  </>
}

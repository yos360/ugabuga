import { A4, Certificate, ChoicePage, Cover, Head, Pic, SvgPage, WordSearchPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת שגיאות כתיב" — Hebrew letters that sound alike (א/ע, ט/ת, כ/ח, ס/ש, ק/כ, ב/ו), words that sound
// the same but are spelled differently (אם/עם, אור/עור, קל/כל) and finding a spelling mistake.
// Each item: [picture, word with a gap, [option, option], right option]. The gap is shown as "_".
const PAGES = bookletBySlug('spelling').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

export const AYIN = [['🐇', 'ארנב', 'א', 'ע'], ['🌳', 'עץ', 'ע', 'א'], ['🦁', 'אריה', 'ע', 'א'], ['👁️', 'עין', 'א', 'ע'], ['☁️', 'ענן', 'ע', 'א'], ['🔥', 'אש', 'ע', 'א'], ['🐭', 'עכבר', 'א', 'ע'], ['👂', 'אוזן', 'א', 'ע']]
export const TET = [['📞', 'טלפון', 'ת', 'ט'], ['🍊', 'תפוז', 'ת', 'ט'], ['👶', 'תינוק', 'ט', 'ת'], ['🎒', 'תיק', 'ט', 'ת'], ['💧', 'טיפה', 'ת', 'ט'], ['🖼️', 'תמונה', 'ט', 'ת'], ['💍', 'טבעת', 'ט', 'ת'], ['🦚', 'טווס', 'ת', 'ט']]
export const CHET = [['🐕', 'כלב', 'ח', 'כ'], ['🥛', 'חלב', 'ח', 'כ'], ['🐈', 'חתול', 'כ', 'ח'], ['⚽', 'כדור', 'ח', 'כ'], ['🧢', 'כובע', 'כ', 'ח'], ['⭐', 'כוכב', 'ח', 'כ'], ['👕', 'חולצה', 'כ', 'ח'], ['🥄', 'כפית', 'כ', 'ח']]
export const SAMEKH = [['🐴', 'סוס', 'ש', 'ס'], ['👗', 'שמלה', 'ס', 'ש'], ['😊', 'שמחה', 'ס', 'ש'], ['📚', 'ספר', 'ס', 'ש'], ['🛋️', 'ספה', 'ש', 'ס'], ['🍬', 'סוכריה', 'ש', 'ס'], ['🥗', 'סלט', 'ס', 'ש'], ['⬅️', 'שמאל', 'ס', 'ש']]
export const QOF = [['🐒', 'קוף', 'כ', 'ק'], ['☕', 'קפה', 'ק', 'כ'], ['🌈', 'קשת', 'כ', 'ק'], ['🧊', 'קרח', 'ק', 'כ'], ['🐑', 'כבשה', 'ק', 'כ'], ['🎻', 'כינור', 'כ', 'ק'], ['🦔', 'קיפוד', 'כ', 'ק'], ['💰', 'כסף', 'ק', 'כ']]
export const BET = [['🌹', 'ורד', 'ב', 'ו'], ['🐝', 'דבורה', 'ו', 'ב'], ['🦆', 'ברווז', 'ו', 'ב'], ['❤️', 'לב', 'ו', 'ב'], ['🏠', 'בית', 'ו', 'ב'], ['🚌', 'אוטובוס', 'ו', 'ב'], ['🧵', 'חוט', 'ב', 'ו'], ['🐻', 'דוב', 'ו', 'ב']]
// The same word spelled two ways: [picture, first option, second option, the right one]. The right one alternates sides.
export const SPELL = [['🐇', 'ארנב', 'ערנב', 'ארנב'], ['🥄', 'חפית', 'כפית', 'כפית'], ['🐕', 'כלב', 'קלב', 'כלב'], ['📞', 'תלפון', 'טלפון', 'טלפון'], ['🍬', 'שוכריה', 'סוכריה', 'סוכריה'], ['🌈', 'קשת', 'כשת', 'קשת'], ['👕', 'כולצה', 'חולצה', 'חולצה'], ['🎻', 'כינור', 'קינור', 'כינור']]
// Words that sound the same: [sentence with a gap, option, option, right option].
export const SAME_SOUND = [
  ['אני הולך לגן ____ חבר.', 'אם', 'עם', 'עם'],
  ['____ אתה רוצה, תגיד לי.', 'אם', 'עם', 'אם'],
  ['בלילה מדליקים ____ בחדר.', 'עור', 'אור', 'אור'],
  ['לפרה יש ____ חום.', 'אור', 'עור', 'עור'],
  ['התיק שלי ____ מאוד.', 'קל', 'כל', 'קל'],
  ['____ הילדים בכיתה שרו.', 'קל', 'כל', 'כל'],
]
// One misspelled word in each sentence: [sentence, wrong word, right word].
export const MISTAKES = [
  ['יוסי אכל תפוז תעים.', 'תעים', 'טעים'],
  ['מאיה לבשה סמלה אדומה.', 'סמלה', 'שמלה'],
  ['בגינה קפץ ערנב קטן.', 'ערנב', 'ארנב'],
  ['אחרי הגשם הופיעה כשת בשמיים.', 'כשת', 'קשת'],
  ['תמר פתחה את הכלון.', 'כלון', 'חלון'],
  ['אמא חתכה את הלחם עם שכין.', 'שכין', 'סכין'],
]
const SEARCH = [['ארנב', '🐇'], ['כלב', '🐕'], ['חלב', '🥛'], ['סוס', '🐴'], ['קוף', '🐒'], ['כובע', '🧢'], ['שמלה', '👗'], ['תפוז', '🍊']]
const WRITE = [['🐇', 'ארנב'], ['🧢', 'כובע'], ['🌈', 'קשת'], ['🍊', 'תפוז'], ['👗', 'שמלה']]

// Hide the first occurrence of the right letter, so the gap sits where the letter belongs.
function gapped(word, right) {
  const i = word.indexOf(right)
  return `${word.slice(0, i)}_${word.slice(i + 1)}`
}
// The right letter is the option that occurs in the word; where both do (or neither, like ב/ו), FIXED decides.
const FIXED = { טבעת: 'ט', ברווז: 'ב', אוטובוס: 'ב', דבורה: 'ב', דוב: 'ב', ורד: 'ו', לב: 'ב', בית: 'ב', חוט: 'ו' }
const pageItems = rows => rows.map(([e, word, a, b]) => {
  const right = FIXED[word] ?? ([a, b].find(l => word.includes(l)))
  return { pic: { emoji: e }, prompt: gapped(word, right), options: [a, b], answer: right, word }
})

const DATA = { AYIN: pageItems(AYIN), TET: pageItems(TET), CHET: pageItems(CHET), SAMEKH: pageItems(SAMEKH), QOF: pageItems(QOF), BET: pageItems(BET) }
const keyLines = items => items.map(it => `${it.word} — ${it.answer}`)

// Picture, the word with a gap and the two letters to choose from, each in a circle.
function LetterPage({ n, title, instruction, items }) {
  const rowH = 660 / items.length
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => { const y = 140 + i * rowH + rowH / 2; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <Pic item={it.pic} x={530} y={y} size={rowH * 0.74} />
      <text x={385} y={y + 14} fontSize="40" fontWeight="700" direction="rtl">{it.prompt}</text>
      {it.options.map((o, j) => <g key={j}><circle cx={215 - j * 90} cy={y} r="30" fill="white" stroke="#9aa5b5" strokeWidth="2" /><text x={215 - j * 90} y={y + 13} fontSize="36" fontWeight="800">{o}</text></g>)}
      {i < items.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

// Big grey words to go over with a pencil, and a line to copy each one.
function WordTracePage({ n, title, instruction, items }) {
  const rowH = 660 / items.length
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map(([e, word], i) => { const y = 140 + i * rowH + rowH / 2; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <Pic item={{ emoji: e }} x={530} y={y} size={rowH * 0.7} />
      <text x={340} y={y - 4} fontSize="60" fontWeight="700" fill="#d5dae3" stroke="#9aa5b5" strokeWidth="1" direction="rtl">{word}</text>
      <path d={`M60 ${y + 34} H460`} stroke={INK} strokeWidth="1.5" />
      {i < items.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function Key({ n, sections }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>עמוד {n} בחוברת</p>
    <div style={{ fontSize: '11.5pt', lineHeight: 1.5 }}>
      {sections.map(s => <section key={s.title} style={{ marginBottom: 7 }}><b>{s.title}</b>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px 16px' }}>{s.answers.map((a, i) => <span key={i}>{a}</span>)}</div>
      </section>)}
    </div>
  </A4>
}

function SameSoundPage({ n }) {
  return <SvgPage label="מילים שנשמעות אותו דבר">
    <Head n={n} title="אם או עם?" instruction="אלה מילים שנשמעות אותו דבר. מקיפים את המילה שמתאימה למשפט" />
    {SAME_SOUND.map(([s, a, b], i) => { const y = 160 + i * 108; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <text x={300} y={y + 14} fontSize="26" direction="rtl" style={{ whiteSpace: 'pre' }}>{s}</text>
      <text x={370} y={y + 62} fontSize="30" fontWeight="800">{a}</text><text x={230} y={y + 62} fontSize="30" fontWeight="800">{b}</text>
      {i < SAME_SOUND.length - 1 && <path d={`M30 ${y + 90} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function MistakesPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>🔍 מצאו את הטעות</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · בכל משפט מילה אחת כתובה לא נכון</p>
    <p style={{ textAlign: 'center', margin: '0 0 10px', fontSize: 14 }}>מקיפים אותה וכותבים אותה נכון</p>
    <ol style={{ fontSize: '16pt', lineHeight: 1.7, padding: '0 10mm 0 4mm', margin: 0 }}>
      {MISTAKES.map(([s]) => <li key={s} style={{ marginBottom: '13mm' }}>{s}<br /><span style={{ fontSize: '14pt' }}>נכון: ________________</span></li>)}
    </ol>
  </A4>
}

export default function SpellingBooklet({ seed }) {
  const page = (n, title, instruction, items) => <LetterPage n={n} title={title} instruction={instruction} items={items} />
  return <>
    <Cover emoji="✏️🔤" title="חוברת שגיאות כתיב" subtitle="14 עמודים: אותיות שנשמעות דומה, מילים שנשמעות אותו דבר ומציאת טעויות" pages={PAGES}
      note="כתיב עברי נלמד בעיקר מקריאה ומהרגל, ולא מכללים. כדאי לקרוא את המילים בקול, להסתכל על האות ולכתוב אותה כמה פעמים. ש עם נקודה משמאל (שׂ) נשמעת כמו ס, ובעמוד ס/ש היא מופיעה בלי הנקודה, כמו שכותבים בדרך כלל." />
    {page(2, 'א או ע?', 'איזו אות חסרה? מקיפים אותה', DATA.AYIN)}
    {page(3, 'ט או ת?', 'איזו אות חסרה? מקיפים אותה', DATA.TET)}
    {page(4, 'כ או ח?', 'איזו אות חסרה? מקיפים אותה', DATA.CHET)}
    {page(5, 'ס או ש?', 'איזו אות חסרה? ש כאן נשמעת כמו ס', DATA.SAMEKH)}
    {page(6, 'ק או כ?', 'איזו אות חסרה? מקיפים אותה', DATA.QOF)}
    {page(7, 'ב או ו?', 'איזו אות חסרה? מקיפים אותה', DATA.BET)}
    <ChoicePage n={8} title="איך כותבים?" instruction="מקיפים את המילה הכתובה נכון" items={SPELL.map(([e, a, b]) => ({ pic: { emoji: e }, options: [a, b] }))} />
    <SameSoundPage n={9} />
    <MistakesPage n={10} />
    <WordSearchPage n={11} title="תפזורת מילים" instruction="מוצאים את המילים: מימין לשמאל או מלמעלה למטה" words={SEARCH.map(([word, e]) => ({ word, pic: { emoji: e } }))} seed={seed} size={9} he />
    <WordTracePage n={12} title="כותבים נכון" instruction="עוברים על המילה בעיפרון וכותבים אותה שוב על הקו" items={WRITE} />
    <Key n={13} sections={[
      { title: 'עמוד 2 — א או ע', answers: keyLines(DATA.AYIN) }, { title: 'עמוד 3 — ט או ת', answers: keyLines(DATA.TET) },
      { title: 'עמוד 4 — כ או ח', answers: keyLines(DATA.CHET) }, { title: 'עמוד 5 — ס או ש', answers: keyLines(DATA.SAMEKH) },
      { title: 'עמוד 6 — ק או כ', answers: keyLines(DATA.QOF) }, { title: 'עמוד 7 — ב או ו', answers: keyLines(DATA.BET) },
      { title: 'עמוד 8 — איך כותבים', answers: SPELL.map(([e, , , right]) => `${e} ${right}`) },
      { title: 'עמוד 9 — אם או עם', answers: SAME_SOUND.map(s => `${s[0].replace('____', s[3])}`) },
      { title: 'עמוד 10 — מצאו את הטעות', answers: MISTAKES.map(([, w, r]) => `${w} ← ${r}`) },
    ]} />
    <Certificate booklet="חוברת שגיאות הכתיב" done="בחרתי את האות הנכונה, הבחנתי במילים שנשמעות אותו דבר ומצאתי טעויות כתיב." cheer="כל הכבוד, כותב/ת מצוין/ת!" />
  </>
}

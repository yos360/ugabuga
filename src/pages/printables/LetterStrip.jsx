import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { HEBREW } from '../../data/letterLearning'

// "סרגל אותיות": strips of the alef-bet to cut out and tape to a desk — print, cursive or both,
// with or without final letters and pictures. Three strips per A4 page.
// Vowel mode ("סרגל אותיות עם ניקוד"): pick one vowel and every letter is shown with it; or a one-page
// letters × vowels chart.
const PATH = '/printables/letter-strip'
const FILLS = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe', '#ffedd5']

// Unicode order is the canonical one (consonant, vowel, dagesh, shin-dot) so every renderer stacks the marks the same way.
// Dagesh: ב כ פ are shown WITH dagesh (בָּ כָּ פָּ) by default, because that is the form a child meets at the start of a
// word/syllable and the one primers teach first (ba, ka, pa). ג ד ת also carry a dagesh in the text but it makes no
// audible difference in modern Hebrew, so it is never drawn on them. The "דגש" choice can flip ב כ פ to the soft
// form (בָ כָ פָ = va, kha, fa) or print both forms in one cell (hard big, soft small underneath).
// Holam is taught in its full form (בוֹ = consonant + vav with holam), shuruk as consonant + vav with dagesh (בוּ);
// kubutz is the vowel mark under the letter (בֻ). Final letters take no vowels in this mode, so they are left out.
// Font: Heebo (the site font) has no reliable niqqud, so vowel text uses a system stack that positions the marks
// well (Arial / Noto Sans Hebrew / Arial Hebrew / David). Each cell is ONE text node, so a mark never splits from its base.
const NIQQUD_FONT = "Arial, 'Noto Sans Hebrew', 'Arial Hebrew', David, 'Times New Roman', Tahoma, Heebo, sans-serif"
const VOWELS = [
  { id: 'kamatz', name: 'קמץ', mark: 'ָ' },
  { id: 'patach', name: 'פתח', mark: 'ַ' },
  { id: 'tsere', name: 'צירה', mark: 'ֵ' },
  { id: 'segol', name: 'סגול', mark: 'ֶ' },
  { id: 'hiriq', name: 'חיריק', mark: 'ִ' },
  { id: 'holam', name: 'חולם', mark: 'ֹ', vav: true },
  { id: 'shuruk', name: 'שורוק', mark: 'ּ', vav: true },
  { id: 'kubutz', name: 'קובוץ', mark: 'ֻ' },
  { id: 'shva', name: 'שווא', mark: 'ְ' },
]
const DAGESH = 'ּ', SHIN_DOT = 'ׁ', BEGADKEFAT = ['ב', 'כ', 'פ']
const BASES = HEBREW.map(x => x.l)

// One cell's text: consonant + vowel (+ dagesh when hard). hard = draw dagesh on ב כ פ.
function withVowel(letter, vowel, hard = true) {
  const v = VOWELS.find(x => x.id === vowel)
  const dag = hard && BEGADKEFAT.includes(letter) ? DAGESH : ''
  const shin = letter === 'ש' ? SHIN_DOT : ''
  if (v.vav) return letter + dag + shin + 'ו' + (v.id === 'holam' ? v.mark : DAGESH)
  return letter + v.mark + dag + shin
}

function vowelLetters(vowel, dagesh) {
  return BASES.map(l => ({ l, text: withVowel(l, vowel, dagesh !== 'no'), soft: dagesh === 'both' && BEGADKEFAT.includes(l) ? withVowel(l, vowel, false) : null }))
}

function letters(finals) {
  return HEBREW.flatMap(x => [{ l: x.l, emoji: x.words[0][1] }, ...(finals && x.final ? [{ l: x.final, final: true }] : [])])
}

function Strip({ y, list, style, pics, color, vowelName }) {
  const perRow = Math.ceil(list.length / 2), w = 190 / perRow, h = 38
  return <g>
    <rect x={4} y={y - 2} width={192} height={h * 2 + 4} rx={4} fill="none" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="3 2" />
    {list.map((x, i) => {
      const r = Math.floor(i / perRow), c = i % perRow, cx = 195 - c * w - w / 2, cy = y + r * h
      const both = style === 'both'
      if (vowelName) return <g key={x.l}>
        <rect x={cx - w / 2 + 0.6} y={cy} width={w - 1.2} height={h - 1.5} rx={2.5} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke="#334155" strokeWidth=".45" />
        <text x={cx} y={cy + (x.soft ? 15 : 21)} fontSize={x.soft ? 15 : 19} fontFamily={NIQQUD_FONT} fontWeight={500} textAnchor="middle" direction="rtl" fill="#111">{x.text}</text>
        {x.soft && <text x={cx} y={cy + 29} fontSize={9} fontFamily={NIQQUD_FONT} textAnchor="middle" direction="rtl" fill="#555">{x.soft}</text>}
        <T x={cx} y={cy + 34.5} size={3.6} fill="#777">{vowelName}</T>
      </g>
      return <g key={x.l}>
        <rect x={cx - w / 2 + 0.6} y={cy} width={w - 1.2} height={h - 1.5} rx={2.5} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke="#334155" strokeWidth=".45" />
        {style !== 'cursive' && <T x={cx} y={cy + (both ? 12 : 20)} size={both ? 12 : 17} weight={800}>{x.l}</T>}
        {style !== 'print' && <text x={cx} y={cy + (both ? 26 : 22)} fontSize={both ? 10 : 16} fontFamily="KtavYad, Heebo, sans-serif" textAnchor="middle" direction="rtl" fill={color ? '#7548b3' : '#111'}>{x.l}</text>}
        {pics && x.emoji && <text x={cx} y={cy + 34.5} fontSize={5} textAnchor="middle">{x.emoji}</text>}
        {pics && x.final && <T x={cx} y={cy + 34} size={3.4} fill="#666">סופית</T>}
      </g>
    })}
  </g>
}

// One page: every letter (rows) × every vowel (columns), RTL — the first column is on the right.
function VowelChart({ dagesh, color }) {
  const x0 = 6, labelW = 16, colW = (188 - labelW) / VOWELS.length, y0 = 22, rowH = 10.5
  const hard = dagesh !== 'no'
  return <g>
    <T x={100} y={10} size={7.5} weight={800}>טבלת התנועות — כל האותיות עם כל התנועות</T>
    <rect x={x0} y={y0 - 8} width={188} height={8} rx={2} fill="#fde68a" stroke="#334155" strokeWidth=".35" />
    {VOWELS.map((v, c) => <T key={v.id} x={194 - labelW - c * colW - colW / 2} y={y0 - 2.4} size={3.6} weight={700}>{v.name}</T>)}
    {BASES.map((l, r) => {
      const ry = y0 + r * rowH
      return <g key={l}>
        <rect x={x0} y={ry} width={188} height={rowH} fill={color && r % 2 ? '#f1f5f9' : '#fff'} stroke="#94a3b8" strokeWidth=".25" />
        <T x={194 - labelW / 2} y={ry + 7.4} size={7} weight={800} fill="#7548b3">{l}</T>
        {VOWELS.map((v, c) => <text key={v.id} x={194 - labelW - c * colW - colW / 2} y={ry + 7.2} fontSize={7.4} fontFamily={NIQQUD_FONT} textAnchor="middle" direction="rtl" fill="#111">{withVowel(l, v.id, hard)}</text>)}
      </g>
    })}
    <T x={100} y={y0 + BASES.length * rowH + 5} size={3.3} fill="#888">ב כ פ מופיעות עם דגש (בּ כּ פּ) · חולם = וֹ · שורוק = וּ · עוגה בוגה</T>
  </g>
}

export default function LetterStrip() {
  const [style, setStyle] = useState('both')
  const [finals, setFinals] = useState('yes')
  const [pics, setPics] = useState('yes')
  const [color, setColor] = useState('yes')
  const [vowel, setVowel] = useState('none')
  const [dagesh, setDagesh] = useState('yes')
  const isChart = vowel === 'all', hasVowel = vowel !== 'none'
  const vName = hasVowel && !isChart ? VOWELS.find(v => v.id === vowel).name : null
  const list = vName ? vowelLetters(vowel, dagesh) : letters(finals === 'yes')
  const sheet = isChart
    ? <Sheet label="טבלת תנועות — כל האותיות עם כל התנועות"><VowelChart dagesh={dagesh} color={color === 'yes'} /></Sheet>
    : <Sheet label={vName ? `סרגל אותיות עם ניקוד — ${vName}` : 'סרגל אותיות'}>
      {[0, 1, 2].map(k => <Strip key={k} y={8 + k * 88} list={list} style={style} pics={pics === 'yes'} color={color === 'yes'} vowelName={vName} />)}
      <T x={100} y={268} size={3.5} fill="#888">✂️ גוזרים לאורך הקו המקווקו ומדביקים על השולחן · עוגה בוגה</T>
    </Sheet>
  return <PrintableShell path={PATH} emoji="📏" h1={hasVowel ? 'סרגל אותיות עם ניקוד — לפי תנועה' : 'סרגל אותיות להדפסה — דפוס וכתב'}
    seoTitle="סרגל אותיות להדפסה — דפוס, כתב ועם ניקוד לפי תנועה (PDF חינם)"
    description="סרגל אותיות בעברית להדפסה בחינם: א׳–ת׳ בדפוס, בכתב או בשניהם, ועכשיו גם סרגל אותיות עם ניקוד — בחרו תנועה (קמץ, פתח, צירה, סגול, חיריק, חולם, שורוק, קובוץ, שווא) או הדפיסו טבלת תנועות מלאה. גוזרים ומדביקים על השולחן."
    sub={isChart ? 'דף אחד עם כל האותיות וכל התנועות — תלו על הקיר או הדביקו במחברת' : 'שלושה סרגלים בדף — גוזרים ומדביקים על שולחן הכתיבה'}
    crumbs={[{ label: 'לימוד אותיות', href: '/letters' }]}
    controls={<div className="space-y-3">
      <p className="m-0 text-center font-bold">תנועה (ניקוד)</p>
      <Choice label="תנועה" value={vowel} onChange={setVowel} options={[['none', 'בלי ניקוד'], ...VOWELS.map(v => [v.id, v.name]), ['all', 'כל התנועות — טבלה']]} />
      {!hasVowel && <Choice label="סוג כתב" value={style} onChange={setStyle} options={[['both', 'דפוס + כתב'], ['print', 'דפוס'], ['cursive', 'כתב יד']]} />}
      {!hasVowel && <Choice label="אותיות סופיות" value={finals} onChange={setFinals} options={[['yes', 'עם ך ם ן ף ץ'], ['no', 'בלי סופיות']]} />}
      {!hasVowel && <Choice label="תמונות" value={pics} onChange={setPics} options={[['yes', 'עם תמונה'], ['no', 'בלי תמונה']]} />}
      {hasVowel && <Choice label="דגש בב כ פ" value={dagesh} onChange={setDagesh} options={isChart ? [['yes', 'בּ כּ פּ עם דגש'], ['no', 'ב כ פ בלי דגש']] : [['yes', 'בּ כּ פּ עם דגש'], ['no', 'ב כ פ בלי דגש'], ['both', 'שתי הצורות']]} />}
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'שחור-לבן']]} />
    </div>}
    pages={[{ key: 'strip', svg: sheet }]} printTitle={isChart ? 'טבלת תנועות' : 'סרגל אותיות'}
    paragraphs={[
      'סרגל אותיות הוא רצועה עם כל האלף בית שמדביקים על השולחן או בראש המחברת. כשהילד כותב ושוכח איך נראית אות, הוא מסתכל על הסרגל במקום לשאול — וכך לומד לבד. זה כלי קבוע בכיתות א׳ וב׳, ומומלץ גם בבית לקראת כיתה א׳.',
      'אפשר לבחור סרגל בדפוס, בכתב יד, או בשניהם יחד — האות בדפוס למעלה ובכתב מתחתיה, וזה מצוין למעבר מדפוס לכתב. אפשר להוסיף את האותיות הסופיות ותמונה קטנה ליד כל אות (🦁 לא׳, 🏠 לב׳…), ולהדפיס בצבע או בשחור־לבן.',
      'סרגל אותיות עם ניקוד: בוחרים תנועה אחת — למשל קמץ — ומקבלים סרגל שבו כל האותיות כתובות איתה: אָ בָּ גָ דָ… זה מתאים לילדים שלומדים לקרוא הברות, ומאפשר לתרגל תנועה אחת בכל פעם. ב כ פ מופיעות עם דגש (בָּ כָּ פָּ), כמו בתחילת מילה; אפשר לעבור לצורה הרפה (בָ כָ פָ) או להציג את שתיהן. האותיות הסופיות לא מופיעות בסרגל הניקוד, כי הן לא נושאות תנועה.',
      'למי שרוצה את כל התנועות בדף אחד יש טבלה: כל אות בשורה, וכל תנועה בעמודה — קמץ, פתח, צירה, סגול, חיריק, חולם, שורוק, קובוץ ושווא. מדפיסים, מלמינים ותולים ליד שולחן הלימוד.',
      'בכל דף A4 יש שלושה סרגלים זהים: גוזרים לאורך הקו המקווקו, ואם רוצים שיחזיק — מכסים בנייר דבק שקוף או מלמינציה.',
    ]}
    faq={[
      { q: 'איזה סרגל אותיות מתאים לכיתה א׳?', a: 'בתחילת כיתה א׳ — סרגל דפוס עם תמונות. כשמתחילים ללמוד כתב יד (בדרך כלל באמצע השנה), עוברים לסרגל "דפוס + כתב", שבו רואים את שתי הצורות של כל אות.' },
      { q: 'צריך גם את האותיות הסופיות?', a: 'כן, כדאי. ילדים כותבים מילים כמו "שלום" ו"גן" כבר בתחילת השנה, ונתקלים באותיות הסופיות ם ו־ן. בסרגל הן מופיעות מיד אחרי האות הרגילה.' },
      { q: 'איך מדפיסים בגודל הנכון?', a: 'בחלון ההדפסה בוחרים A4 ו"גודל בפועל" (100%). כל סרגל יוצא באורך כ־19 ס״מ — בדיוק ברוחב של שולחן בית ספר או של מחברת פתוחה.' },
      { q: 'איך מדפיסים סרגל אותיות עם ניקוד?', a: 'בוחרים למעלה תנועה — קמץ, פתח, צירה, סגול, חיריק, חולם, שורוק, קובוץ או שווא — ולוחצים הדפסה. בכל דף שלושה סרגלים עם אותה תנועה. לטבלה מלאה של כל התנועות בוחרים "כל התנועות — טבלה".' },
      { q: 'למה ב כ פ מופיעות עם נקודה?', a: 'הנקודה היא דגש: בּ נקראת "ב" (בָּ — ba), כּ נקראת "כ" ופּ נקראת "פ". בלי הדגש הקריאה משתנה: ב נקראת "ו" (va), כ נקראת "ח" ופ נקראת "פ" רפה (f). בסרגל אפשר לבחור צורה עם דגש, בלי דגש, או את שתיהן.' },
      { q: 'איך כתובים חולם ושורוק בסרגל?', a: 'חולם נכתב עם ו׳ ונקודה למעלה (בוֹ), ושורוק עם ו׳ ונקודה באמצעה (בוּ). קמץ, פתח, צירה, סגול, חיריק, קובוץ ושווא באים כסימן מתחת לאות.' },
    ]}
    related={[{ label: 'אותיות בכתב יד', href: '/letters/cursive' }, { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }, { label: 'שיר האותיות', href: '/letters/song' }, { label: 'לימוד אותיות', href: '/letters' }]}
  />
}

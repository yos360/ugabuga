import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { HEBREW } from '../../data/letterLearning'

// "סרגל אותיות": strips of the alef-bet to cut out and tape to a desk — print, cursive or both,
// with or without final letters and pictures. Three strips per A4 page.
const PATH = '/printables/letter-strip'
const FILLS = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe', '#ffedd5']

function letters(finals) {
  return HEBREW.flatMap(x => [{ l: x.l, emoji: x.words[0][1] }, ...(finals && x.final ? [{ l: x.final, final: true }] : [])])
}

function Strip({ y, list, style, pics, color }) {
  const perRow = Math.ceil(list.length / 2), w = 190 / perRow, h = 38
  return <g>
    <rect x={4} y={y - 2} width={192} height={h * 2 + 4} rx={4} fill="none" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="3 2" />
    {list.map((x, i) => {
      const r = Math.floor(i / perRow), c = i % perRow, cx = 195 - c * w - w / 2, cy = y + r * h
      const both = style === 'both'
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

export default function LetterStrip() {
  const [style, setStyle] = useState('both')
  const [finals, setFinals] = useState('yes')
  const [pics, setPics] = useState('yes')
  const [color, setColor] = useState('yes')
  const list = letters(finals === 'yes')
  const sheet = <Sheet label="סרגל אותיות">
    {[0, 1, 2].map(k => <Strip key={k} y={8 + k * 88} list={list} style={style} pics={pics === 'yes'} color={color === 'yes'} />)}
    <T x={100} y={268} size={3.5} fill="#888">✂️ גוזרים לאורך הקו המקווקו ומדביקים על השולחן · עוגה בוגה</T>
  </Sheet>
  return <PrintableShell path={PATH} emoji="📏" h1="סרגל אותיות להדפסה — דפוס וכתב"
    seoTitle="סרגל אותיות להדפסה — אותיות דפוס וכתב לשולחן (PDF חינם)"
    description="סרגל אותיות בעברית להדפסה בחינם: א׳–ת׳ בדפוס, בכתב או בשניהם, עם אותיות סופיות ותמונות, בצבע או בשחור־לבן. שלושה סרגלים בדף A4 — גוזרים ומדביקים על השולחן."
    sub="שלושה סרגלים בדף — גוזרים ומדביקים על שולחן הכתיבה"
    crumbs={[{ label: 'לימוד אותיות', href: '/letters' }]}
    controls={<div className="space-y-3">
      <Choice label="סוג כתב" value={style} onChange={setStyle} options={[['both', 'דפוס + כתב'], ['print', 'דפוס'], ['cursive', 'כתב יד']]} />
      <Choice label="אותיות סופיות" value={finals} onChange={setFinals} options={[['yes', 'עם ך ם ן ף ץ'], ['no', 'בלי סופיות']]} />
      <Choice label="תמונות" value={pics} onChange={setPics} options={[['yes', 'עם תמונה'], ['no', 'בלי תמונה']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'שחור-לבן']]} />
    </div>}
    pages={[{ key: 'strip', svg: sheet }]} printTitle="סרגל אותיות"
    paragraphs={[
      'סרגל אותיות הוא רצועה עם כל האלף בית שמדביקים על השולחן או בראש המחברת. כשהילד כותב ושוכח איך נראית אות, הוא מסתכל על הסרגל במקום לשאול — וכך לומד לבד. זה כלי קבוע בכיתות א׳ וב׳, ומומלץ גם בבית לקראת כיתה א׳.',
      'אפשר לבחור סרגל בדפוס, בכתב יד, או בשניהם יחד — האות בדפוס למעלה ובכתב מתחתיה, וזה מצוין למעבר מדפוס לכתב. אפשר להוסיף את האותיות הסופיות ותמונה קטנה ליד כל אות (🦁 לא׳, 🏠 לב׳…), ולהדפיס בצבע או בשחור־לבן.',
      'בכל דף A4 יש שלושה סרגלים זהים: גוזרים לאורך הקו המקווקו, ואם רוצים שיחזיק — מכסים בנייר דבק שקוף או מלמינציה.',
    ]}
    faq={[
      { q: 'איזה סרגל אותיות מתאים לכיתה א׳?', a: 'בתחילת כיתה א׳ — סרגל דפוס עם תמונות. כשמתחילים ללמוד כתב יד (בדרך כלל באמצע השנה), עוברים לסרגל "דפוס + כתב", שבו רואים את שתי הצורות של כל אות.' },
      { q: 'צריך גם את האותיות הסופיות?', a: 'כן, כדאי. ילדים כותבים מילים כמו "שלום" ו"גן" כבר בתחילת השנה, ונתקלים באותיות הסופיות ם ו־ן. בסרגל הן מופיעות מיד אחרי האות הרגילה.' },
      { q: 'איך מדפיסים בגודל הנכון?', a: 'בחלון ההדפסה בוחרים A4 ו"גודל בפועל" (100%). כל סרגל יוצא באורך כ־19 ס״מ — בדיוק ברוחב של שולחן בית ספר או של מחברת פתוחה.' },
    ]}
    related={[{ label: 'אותיות בכתב יד', href: '/letters/cursive' }, { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }, { label: 'שיר האותיות', href: '/letters/song' }, { label: 'לימוד אותיות', href: '/letters' }]}
  />
}

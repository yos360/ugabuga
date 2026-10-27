import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { EMOTIONS, emotionLabel } from '../../data/emotionCards'

// /printables/emotion-cards — 24 emotion cards (6 per A4) with a conversation question on each,
// or all of them on one board for the wall. Boy / girl / both forms, with or without nikud.
const PATH = '/printables/emotion-cards'
const COLORS = ['#fde68a', '#bfdbfe', '#fecaca', '#bbf7d0', '#e9d5ff', '#fed7aa']
const FONT = 'Heebo, Arial, sans-serif'
const len = t => t.replace(/[\u0591-\u05C7]/g, '').length // letters only — nikud marks take no width

function CardsSheet({ items, gender, nikud, page, pages, color }) {
  const cw = 92, ch = 80, gx = 6, gy = 5, x0 = (200 - 2 * cw - gx) / 2, y0 = 16
  return <Sheet label={`כרטיסיות רגשות ${page}/${pages}`}>
    <T x={100} y={11} size={6.5} weight={800}>כרטיסיות רגשות · {page}/{pages}</T>
    {items.map((x, i) => { const col = i % 2, row = Math.floor(i / 2), X = x0 + (1 - col) * (cw + gx), Y = y0 + row * (ch + gy), bg = color ? COLORS[(page * 6 + i) % COLORS.length] : '#fff'; return <g key={x.id} fontFamily={FONT}>
      <rect x={X} y={Y} width={cw} height={ch} rx={6} fill={bg} stroke="#111" strokeWidth={0.6} strokeDasharray="2.5 1.5" />
      <text x={X + cw / 2} y={Y + 36} fontSize={30} textAnchor="middle">{x.emoji}</text>
      <T x={X + cw / 2} y={Y + 54} size={len(emotionLabel(x, gender, nikud)) > 14 ? 9 : 12} weight={800}>{emotionLabel(x, gender, nikud)}</T>
      <rect x={X + 8} y={Y + 61} width={cw - 16} height={12} rx={3} fill="#ffffffcc" />
      <T x={X + cw / 2} y={Y + 69} size={x.q.length > 30 ? 4.6 : 5.2}>💬 {x.q}</T>
    </g> })}
  </Sheet>
}

function Board({ gender, nikud, color }) {
  const cols = 4, cw = 44, ch = 40, gx = 3, gy = 3, x0 = (200 - cols * cw - (cols - 1) * gx) / 2, y0 = 22
  return <Sheet label="לוח רגשות">
    <T x={100} y={14} size={9} weight={800}>איך אני מרגיש/ה היום?</T>
    {EMOTIONS.map((x, i) => { const col = i % cols, row = Math.floor(i / cols), X = x0 + (cols - 1 - col) * (cw + gx), Y = y0 + row * (ch + gy); return <g key={x.id} fontFamily={FONT}>
      <rect x={X} y={Y} width={cw} height={ch} rx={5} fill={color ? COLORS[i % COLORS.length] : '#fff'} stroke="#111" strokeWidth={0.5} />
      <text x={X + cw / 2} y={Y + 22} fontSize={18} textAnchor="middle">{x.emoji}</text>
      <T x={X + cw / 2} y={Y + 33} size={len(emotionLabel(x, gender, nikud)) > 12 ? 5 : 6.5} weight={800}>{emotionLabel(x, gender, nikud)}</T>
    </g> })}
  </Sheet>
}

export default function EmotionCards() {
  const [gender, setGender] = useState('both'), [nikud, setNikud] = useState('no'), [layout, setLayout] = useState('cards'), [color, setColor] = useState('color')
  const pointed = nikud === 'yes', colored = color === 'color'
  const chunks = Array.from({ length: Math.ceil(EMOTIONS.length / 6) }, (_, i) => EMOTIONS.slice(i * 6, i * 6 + 6))
  const pages = layout === 'board' ? [{ key: `board-${gender}-${nikud}-${color}`, svg: <Board gender={gender} nikud={pointed} color={colored} /> }]
    : chunks.map((items, i) => ({ key: `cards-${i}-${gender}-${nikud}-${color}`, svg: <CardsSheet items={items} gender={gender} nikud={pointed} page={i + 1} pages={chunks.length} color={colored} /> }))
  return <PrintableShell path={PATH} emoji="😊" h1="כרטיסיות רגשות להדפסה"
    seoTitle="כרטיסיות רגשות להדפסה — 24 רגשות עם שאלות לשיחה (חינם)"
    description="כרטיסיות רגשות לילדים להדפסה בחינם: 24 רגשות — שמח, עצוב, כועס, מפחד, מתבייש, גאה ועוד — עם אימוג׳י ושאלה לשיחה על כל כרטיס. בנים, בנות או שניהם, עם ניקוד או בלי, וגם לוח רגשות לקיר."
    sub="24 רגשות, שאלה לשיחה על כל כרטיס — לגן, לכיתה, לבית ולחדר הטיפול"
    crumbs={[{ label: 'כרטיסיות ולוחות', href: '/printables' }]} previewAll={layout === 'cards'}
    controls={<>
      <Choice label="מה להדפיס" value={layout} onChange={setLayout} options={[['cards', '🃏 כרטיסיות (6 בדף)'], ['board', '🧩 לוח רגשות לקיר (דף אחד)']]} />
      <Choice label="לשון" value={gender} onChange={setGender} options={[['both', 'שמח / שמחה'], ['m', 'בנים — שמח'], ['f', 'בנות — שמחה']]} />
      <Choice label="ניקוד" value={nikud} onChange={setNikud} options={[['no', 'בלי ניקוד'], ['yes', 'עם ניקוד']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['color', '🎨 צבעוני'], ['bw', '⚫ שחור־לבן']]} />
    </>}
    pages={pages}
    paragraphs={[
      'ילדים מרגישים הרבה לפני שהם יודעים לקרוא לזה בשם. כרטיסיות רגשות נותנות להם מילה ופרצוף לכל רגש: "אני מתוסכל" במקום צעקה, "אני מתביישת" במקום להסתתר. כשיש מילה, קל יותר לבקש עזרה.',
      'בכל כרטיס יש שאלה קצרה לשיחה, כמו "מה עוזר להירגע כשכועסים?" או "במה הצלחת לאחרונה?". אפשר לשלוף כרטיס בכל בוקר במפגש, לשחק "נחשו איזה רגש אני מציג", או לבקש מהילד להצביע על הכרטיס שמתאים לו עכשיו.',
      'הלוח לקיר מרכז את כל 24 הרגשות בדף אחד — טוב לפינת רגשות בגן או בכיתה, ולמקרר בבית. מדפיסים, מצפים בלמינציה ומשתמשים שוב ושוב.',
    ]}
    faq={[
      { q: 'לאיזה גיל מתאימות כרטיסיות הרגשות?', a: 'מגיל 3 ועד בית הספר היסודי. לקטנים מתחילים ברגשות הבסיסיים — שמח, עצוב, כועס, מפחד — ומוסיפים רגשות מורכבים יותר, כמו מאוכזב או מתוסכל, כשהם גדלים.' },
      { q: 'איך משתמשים בכרטיסיות?', a: 'כמה רעיונות: כרטיס בוקר — כל ילד בוחר את הרגש שלו; משחק פנטומימה — מציגים רגש והשאר מנחשים; ושיחה — שולפים כרטיס ועונים על השאלה שעליו. חשוב שאין תשובה נכונה, וכל רגש הוא בסדר.' },
      { q: 'יש גם לוח תקשורת וכרטיסי ויסות?', a: 'כן — בעמוד כרטיסיות הוויסות יש לוח תקשורת, כרטיסי הרגעה וסדר יום לגן.' },
    ]}
    related={[{ label: 'כרטיסיות ויסות ולוח תקשורת', href: '/printables/sensory-communication-cards' }, { label: 'שפה חברתית — רגשות ובקשות', href: '/speech/language/social' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} />
}

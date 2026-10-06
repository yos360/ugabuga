import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../components/printables/PrintableShell'
import { FOOD_CRUMB } from './FoodPages'

// Allergy signs (one big A4 per allergen: "אצלנו בגן לא אוכלים בוטנים") and sticker sheets
// for lunch boxes and bottles. Icons are drawn here as simple flat shapes so they print crisply.
const ICON = {
  peanut: c => <g><path d="M-14 -26 C-30 -26 -32 -6 -20 0 C-32 6 -30 26 -14 26 C2 26 4 8 -6 0 C4 -8 2 -26 -14 -26 Z" transform="rotate(-30) translate(10 0)" fill={c.fill} stroke={c.line} strokeWidth={3} />
    {[[-8, -14], [2, -6], [-10, 8], [0, 16], [8, 4]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2} fill={c.line} opacity={0.5} />)}</g>,
  nuts: c => <g><path d="M0 -28 C20 -26 26 -4 22 12 C18 26 6 30 0 30 C-6 30 -18 26 -22 12 C-26 -4 -20 -26 0 -28 Z" fill={c.fill} stroke={c.line} strokeWidth={3} /><path d="M0 -26 C-6 -10 6 4 0 28" fill="none" stroke={c.line} strokeWidth={2.5} /><path d="M-14 -8 C-8 -4 -10 6 -16 10 M14 -8 C8 -4 10 6 16 10" fill="none" stroke={c.line} strokeWidth={2} /></g>,
  sesame: c => <g>{[[-14, -10, 20], [6, -16, -15], [16, 4, 30], [-4, 10, -25], [-18, 14, 10], [10, 22, 0]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={5} ry={9} transform={`rotate(${r} ${x} ${y})`} fill={c.fill} stroke={c.line} strokeWidth={2.5} />)}</g>,
  egg: c => <g><path d="M0 -30 C18 -30 26 0 24 12 C22 26 12 32 0 32 C-12 32 -22 26 -24 12 C-26 0 -18 -30 0 -30 Z" fill={c.fill} stroke={c.line} strokeWidth={3} /><ellipse cx={-8} cy={-10} rx={4} ry={7} fill="#fff" opacity={0.6} /></g>,
  milk: c => <g><path d="M-14 -18 L-8 -30 L8 -30 L14 -18 L14 30 L-14 30 Z" fill="#fff" stroke={c.line} strokeWidth={3} strokeLinejoin="round" /><path d="M-14 -4 L14 -4 L14 30 L-14 30 Z" fill={c.fill} /><path d="M-14 -18 L14 -18" stroke={c.line} strokeWidth={3} /><text x={0} y={18} textAnchor="middle" fontSize={11} fontWeight={800} fill={c.line}>חלב</text></g>,
  fish: c => <g><path d="M-26 0 C-14 -20 14 -20 22 0 C14 20 -14 20 -26 0 Z" fill={c.fill} stroke={c.line} strokeWidth={3} /><path d="M20 0 L34 -14 L34 14 Z" fill={c.fill} stroke={c.line} strokeWidth={3} strokeLinejoin="round" /><circle cx={-14} cy={-4} r={3} fill={c.line} /></g>,
  gluten: c => <g><path d="M0 32 L0 -30" stroke={c.line} strokeWidth={3} />{[-22, -10, 2, 14].map((y, i) => <g key={i}><ellipse cx={-8} cy={y} rx={6} ry={10} transform={`rotate(-30 -8 ${y})`} fill={c.fill} stroke={c.line} strokeWidth={2.5} /><ellipse cx={8} cy={y} rx={6} ry={10} transform={`rotate(30 8 ${y})`} fill={c.fill} stroke={c.line} strokeWidth={2.5} /></g>)}<ellipse cx={0} cy={-32} rx={5} ry={9} fill={c.fill} stroke={c.line} strokeWidth={2.5} /></g>,
  soy: c => <g><path d="M-30 6 C-30 -12 -10 -16 0 -12 C10 -8 30 -14 30 2 C30 18 10 16 0 14 C-10 12 -30 22 -30 6 Z" fill={c.fill} stroke={c.line} strokeWidth={3} />{[-16, 0, 16].map(x => <circle key={x} cx={x} cy={2} r={7} fill="#fff" opacity={0.6} stroke={c.line} strokeWidth={2} />)}</g>,
}
export const ALLERGY = [
  ['peanut', 'בוטנים', 'לבוטנים', '#e0b16c'], ['nuts', 'אגוזים', 'לאגוזים', '#c98b4e'], ['sesame', 'שומשום', 'לשומשום', '#f2dfa7'], ['egg', 'ביצים', 'לביצים', '#f7ead2'],
  ['milk', 'מוצרי חלב', 'לחלב', '#cfe8ff'], ['fish', 'דגים', 'לדגים', '#9ed3f0'], ['gluten', 'גלוטן', 'לגלוטן', '#f5d06f'], ['soy', 'סויה', 'לסויה', '#b6dd8a'],
]
const PLACES = { kinder: 'בגן', class: 'בכיתה', home: 'בבית', party: 'במסיבה' }

function Icon({ id, x, y, size, no = false, color }) {
  const k = size / 70, c = { fill: color, line: '#3b2a17' }
  return <g transform={`translate(${x} ${y}) scale(${k})`}>
    {no && <circle r={46} fill="#fff" stroke="#d62828" strokeWidth={8} />}
    {ICON[id](c)}
    {no && <line x1={-32} y1={-32} x2={32} y2={32} stroke="#d62828" strokeWidth={8} strokeLinecap="round" />}
  </g>
}

function SignSheet({ a, place }) {
  const [id, name, , color] = a
  return <Sheet label={`שלט: ${PLACES[place]} לא אוכלים ${name}`}>
    <rect x={6} y={6} width={188} height={258} rx={14} fill="#fff" stroke="#d62828" strokeWidth={3} />
    <T x={100} y={34} size={16} weight={900} fill="#d62828">שימו לב!</T>
    <Icon id={id} x={100} y={108} size={92} no color={color} />
    <T x={100} y={190} size={14} weight={900}>{`אצלנו ${PLACES[place]}`}</T>
    <T x={100} y={210} size={17} weight={900}>{`לא אוכלים ${name}`}</T>
    <T x={100} y={232} size={6.5} fill="#333">יש כאן ילדים עם אלרגיה. תודה שאתם שומרים עליהם</T>
  </Sheet>
}

function StickerSheet({ list, name, style }) {
  // 4×6 round stickers, cycling through the chosen allergens.
  const n = 24, cols = 4, d = 44, gx = (200 - cols * d) / (cols + 1)
  return <Sheet label="מדבקות אלרגיה">
    {Array.from({ length: n }, (_, i) => {
      const [id, , to, color] = list[i % list.length], col = i % cols, row = Math.floor(i / cols)
      const cx = 200 - (gx + d / 2 + col * (d + gx)), cy = 6 + d / 2 + row * (d + 0.5)
      return <g key={i}>
        <circle cx={cx} cy={cy} r={d / 2} fill="#fff" stroke="#999" strokeWidth={0.4} strokeDasharray="1.5 1.2" />
        <circle cx={cx} cy={cy} r={d / 2 - 2} fill={style === 'color' ? '#fff5f5' : '#fff'} stroke="#d62828" strokeWidth={1.2} />
        <Icon id={id} x={cx} y={cy - 6} size={19} no={style !== 'plain'} color={style === 'bw' ? '#fff' : color} />
        <T x={cx} y={cy + 11} size={3.6} weight={800} fill="#d62828">{`אלרגי/ת ${to}`}</T>
        {name && <T x={cx} y={cy + 16} size={3.6} weight={700}>{name}</T>}
      </g>
    })}
  </Sheet>
}

export default function AllergySigns() {
  const [mode, setMode] = useState('signs')
  const [chosen, setChosen] = useState(['peanut'])
  const [place, setPlace] = useState('kinder')
  const [name, setName] = useState('')
  const [style, setStyle] = useState('color')
  const list = ALLERGY.filter(a => chosen.includes(a[0]))
  const pages = !list.length ? [] : mode === 'signs'
    ? list.map(a => ({ key: a[0] + place, svg: <SignSheet a={a} place={place} /> }))
    : [{ key: 'stickers' + chosen.join() + name + style, svg: <StickerSheet list={list} name={name} style={style} /> }]
  const toggle = id => setChosen(c => (c.includes(id) ? c.filter(x => x !== id) : [...c, id]))
  return <PrintableShell path="/printables/allergy-signs" emoji="🥜" h1="שלטים ומדבקות לאלרגיות"
    seoTitle="שלט אצלנו בגן לא אוכלים בוטנים — שלטים ומדבקות אלרגיה להדפסה"
    description="שלטי אלרגיה להדפסה בחינם — שלט גדול לכל אלרגיה: אצלנו בגן לא אוכלים בוטנים, אגוזים, שומשום, ביצים, חלב, דגים, גלוטן או סויה. ומדבקות אלרגיה עגולות עם שם הילד לקופסת האוכל ולבקבוק."
    sub="שלט A4 גדול לכל אלרגיה, ומדבקות עם שם הילד לקופסה ולבקבוק"
    crumbs={[FOOD_CRUMB]}
    controls={<>
      <Choice label="מה מדפיסים" value={mode} onChange={setMode} options={[['signs', '🪧 שלטים גדולים'], ['stickers', '🔴 מדבקות']]} />
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="אלרגיות">
        {ALLERGY.map(([id, n]) => <button key={id} type="button" aria-pressed={chosen.includes(id)} onClick={() => toggle(id)} className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold ${chosen.includes(id) ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{chosen.includes(id) ? '✓ ' : ''}{n}</button>)}
      </div>
      {mode === 'signs'
        ? <Choice label="איפה" value={place} onChange={setPlace} options={Object.entries(PLACES).map(([k, v]) => [k, `אצלנו ${v}`])} />
        : <><Choice label="סגנון" value={style} onChange={setStyle} options={[['color', '🎨 צבעוני עם סימן איסור'], ['plain', 'צבעוני בלי סימן'], ['bw', '⚫ שחור-לבן']]} />
          <div className="mx-auto max-w-sm"><Field label="שם הילד/ה (לא חובה)" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={12} /></div></>}
      {!list.length && <p className="text-center font-bold">בחרו לפחות אלרגיה אחת.</p>}
    </>}
    pages={pages.length ? pages : [{ key: 'empty', svg: <Sheet label="ריק"><T x={100} y={135} size={8}>בחרו אלרגיה</T></Sheet> }]}
    printTitle={mode === 'signs' ? 'שלטי אלרגיה' : 'מדבקות אלרגיה'}
    paragraphs={['שלט ברור על הדלת חוסך הרבה שאלות: הורים, סבים ומבקרים יודעים מיד שאסור להכניס מאכלים מסוימים. כאן מדפיסים שלט A4 נפרד לכל אלרגיה — בוטנים, אגוזים, שומשום, ביצים, מוצרי חלב, דגים, גלוטן וסויה — ובוחרים אם הוא לגן, לכיתה, לבית או למסיבה.', 'המדבקות העגולות מתאימות לקופסת האוכל, לבקבוק ולתיק: אייקון של האלרגן עם סימן איסור, הכיתוב "אלרגי/ת ל..." ושם הילד. 24 מדבקות בדף — מדפיסים על נייר מדבקה או על נייר רגיל ומדביקים בסלוטייפ שקוף.', 'השלטים והמדבקות הם תזכורת בלבד — הם לא מחליפים את ההנחיות של הרופא ושל צוות הגן.']}
    faq={[{ q: 'על איזה נייר להדפיס מדבקות?', a: 'על נייר מדבקה A4 (נמכר בחנויות משרדיות) — ואז גוזרים לאורך הקו המקווקו. אפשר גם על נייר רגיל ולהדביק עם סלוטייפ שקוף רחב, שגם מגן מרטיבות.' }, { q: 'אפשר להדפיס כמה אלרגיות ביחד?', a: 'כן. בוחרים כמה אלרגיות — בשלטים כל אחת מקבלת דף משלה, ובמדבקות הן מתחלפות בדף אחד.' }]}
    related={[{ label: 'ארוחת עשר בלי בוטנים', href: '/food/school-lunch' }, { label: 'פתקים לקופסת האוכל', href: '/printables/lunchbox-notes' }, { label: 'תגי שם', href: '/printables/name-tags' }]} />
}

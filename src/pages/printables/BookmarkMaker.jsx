import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Choice, Field, Sheet, T } from '../../components/printables/PrintableShell'

const THEMES = [
  ['mandala', '🌈 מנדלות'],
  ['space', '🚀 חלל'],
  ['animals', '🦊 חיות'],
  ['flowers', '🌸 פרחים'],
]
const QUOTES = {
  mandala: 'ספר טוב פותח עולם',
  space: 'קוראים וממריאים',
  animals: 'עוד עמוד להרפתקה',
  flowers: 'פורחים בין הדפים',
}
const splitLine = value => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  const first = [], second = []
  for (const word of words) (first.join(' ').length < 18 ? first : second).push(word)
  return [first.join(' '), second.join(' ')]
}
function Mandala({ x, y, size, color, variant = 0 }) {
  const rays = 10 + variant % 4
  return <g fill="none" stroke={color} strokeWidth="0.9">
    <circle cx={x} cy={y} r={size} /><circle cx={x} cy={y} r={size * .66} /><circle cx={x} cy={y} r={size * .32} />
    {Array.from({ length: rays }, (_, i) => <g key={i} transform={`rotate(${i * 360 / rays} ${x} ${y})`}>
      <path d={`M ${x} ${y - size * .32} Q ${x - size * .23} ${y - size * .52} ${x} ${y - size * .66} Q ${x + size * .23} ${y - size * .52} ${x} ${y - size * .32}`} />
      <circle cx={x} cy={y - size * .88} r={size * .08} />
    </g>)}
  </g>
}
function Space({ x, y, color, variant }) {
  return <g fill="none" stroke={color} strokeWidth="1.15">
    <circle cx={x} cy={y} r="15" /><ellipse cx={x} cy={y} rx="25" ry="7" transform={`rotate(${-18 + variant * 5} ${x} ${y})`} />
    <path d={`M ${x - 7} ${y - 13}q8 6 15 0M ${x - 10} ${y + 5}q10 5 19 -1`} />
    {[[x - 24, y - 17], [x + 24, y - 12], [x - 21, y + 18], [x + 22, y + 20]].map(([sx, sy], i) => <path key={i} d={`M${sx - 3} ${sy}h6M${sx} ${sy - 3}v6`} />)}
  </g>
}
function Animal({ x, y, color, variant }) {
  const kind = variant % 3
  if (kind === 1) return <g fill="none" stroke={color} strokeWidth="1.15"><ellipse cx={x} cy={y + 3} rx="20" ry="15" /><path d={`M${x - 16} ${y - 7}l-7 -10 13 4M${x + 16} ${y - 7}l7 -10 -13 4M${x - 9} ${y + 5}h5M${x + 4} ${y + 5}h5M${x - 3} ${y + 11}q3 3 6 0`} /><circle cx={x - 8} cy={y} r="1.4" fill={color} /><circle cx={x + 8} cy={y} r="1.4" fill={color} /></g>
  if (kind === 2) return <g fill="none" stroke={color} strokeWidth="1.15"><path d={`M${x - 22} ${y + 3}q11 -18 22 0q-11 18 -22 0Z`} /><path d={`M${x} ${y + 3}q11 -18 22 0Z`} /><circle cx={x - 12} cy={y + 3} r="1.5" fill={color} /><circle cx={x + 10} cy={y + 3} r="1.5" fill={color} /><path d={`M${x - 3} ${y + 3}q3 -10 6 0`} /></g>
  return <g fill="none" stroke={color} strokeWidth="1.15"><circle cx={x} cy={y + 2} r="17" /><path d={`M${x - 13} ${y - 7}l-3 -14 12 8M${x + 13} ${y - 7}l3 -14 -12 8M${x - 12} ${y + 4}l-11 -3M${x - 12} ${y + 9}l-11 3M${x + 12} ${y + 4}l11 -3M${x + 12} ${y + 9}l11 3`} /><circle cx={x - 7} cy={y} r="1.5" fill={color} /><circle cx={x + 7} cy={y} r="1.5" fill={color} /><path d={`M${x - 3} ${y + 10}q3 3 6 0`} /></g>
}
function Flower({ x, y, color, variant }) {
  const petals = 5 + variant % 3
  return <g fill="none" stroke={color} strokeWidth="1.1">
    {Array.from({ length: petals }, (_, i) => <ellipse key={i} cx={x} cy={y - 12} rx="7" ry="14" transform={`rotate(${i * 360 / petals} ${x} ${y})`} />)}
    <circle cx={x} cy={y} r="5" /><path d={`M${x} ${y + 18}v20M${x} ${y + 29}q-13 -7 -15 3M${x} ${y + 35}q13 -7 15 3`} />
  </g>
}
function BookmarkArt({ theme, index, x, y, photo, color, name, message }) {
  const cx = x + 30, photoY = y + 18
  const [line1, line2] = splitLine(message)
  const clipId = `bookmark-photo-${index}`
  const artY = photo ? y + 64 : y + 58
  const draw = () => {
    if (theme === 'space') return <Space x={cx} y={artY} color={color} variant={index} />
    if (theme === 'animals') return <Animal x={cx} y={artY} color={color} variant={index} />
    if (theme === 'flowers') return <Flower x={cx} y={artY - 8} color={color} variant={index} />
    return <Mandala x={cx} y={artY} size={18} color={color} variant={index} />
  }
  return <g>
    <rect x={x} y={y} width="60" height="130" rx="4" fill="#fff" stroke={color} strokeWidth="0.9" />
    <path d={`M${x + 5} ${y + 9}h50`} stroke={color} strokeWidth="0.7" />
    <T x={cx} y={y + 7} size={3.4} weight={900} fill={color}>סימנייה</T>
    {photo && <><defs><clipPath id={clipId}><rect x={x + 12} y={photoY} width="36" height="36" rx="18" /></clipPath></defs><image href={photo} x={x + 12} y={photoY} width="36" height="36" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} /><rect x={x + 12} y={photoY} width="36" height="36" rx="18" fill="none" stroke={color} strokeWidth="1" /></>}
    {draw()}
    <path d={`M${x + 9} ${y + 88}h42`} stroke={color} strokeWidth="0.65" />
    <T x={cx} y={y + 97} size={3.9} weight={800} fill={color}>{line1}</T>
    {line2 && <T x={cx} y={y + 104} size={3.9} weight={800} fill={color}>{line2}</T>}
    {name && <T x={cx} y={y + 116} size={3.5} fill={color}>הסימנייה של {name}</T>}
    <T x={cx} y={y + 126} size={2.6} fill={color}>עוגה בוגה · ugabuga.co.il</T>
  </g>
}
function BookmarkSheet({ theme, photo, colorful, name, message, seed }) {
  const color = colorful ? { mandala: '#7c3aed', space: '#2563eb', animals: '#d97706', flowers: '#db2777' }[theme] : '#111827'
  return <Sheet label="6 סימניות להדפסה">
    <rect x="0" y="0" width="200" height="270" fill="#fff" />
    <T x="100" y="6" size="3.2" fill="#64748b">גזרו לאורך הקווים המקווקווים</T>
    {Array.from({ length: 6 }, (_, index) => {
      const x = 7 + (index % 3) * 65, y = 10 + Math.floor(index / 3) * 132
      return <g key={index}><BookmarkArt theme={theme} index={index + seed * 10} x={x} y={y} photo={photo} color={color} name={name} message={message} /><rect x={x - 2} y={y - 2} width="64" height="134" fill="none" stroke="#94a3b8" strokeWidth="0.35" strokeDasharray="2 1.7" /></g>
    })}
  </Sheet>
}
export default function BookmarkMaker() {
  const [theme, setTheme] = useState('mandala')
  const [colorful, setColorful] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState(QUOTES.mandala)
  const [photo, setPhoto] = useState('')
  const [seed, setSeed] = useState(1)
  const setStyle = value => { setTheme(value); setMessage(QUOTES[value]) }
  const readPhoto = event => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(String(reader.result || ''))
    reader.readAsDataURL(file)
  }
  const page = { key: 'bookmarks', svg: <BookmarkSheet theme={theme} photo={photo} colorful={colorful} name={name.trim()} message={message.trim() || QUOTES[theme]} seed={seed} /> }
  return <PrintableShell path="/printables/bookmarks" emoji="🔖" h1="סימניות להדפסה עם שם, תמונה ואיורים" seoTitle="סימניות להדפסה בחינם — מנדלות, איורים, שם ותמונה" description="יוצרים 6 סימניות להדפסה בדף A4: מנדלות לצביעה, חלל, חיות או פרחים. מוסיפים שם, משפט אישי או תמונה ומדפיסים מיד בחינם."
    sub="6 סימניות בדף A4 — לבחור סגנון, להוסיף שם או תמונה, ולהדפיס"
    crumbs={[{ label: 'יצירה מנייר', href: '/printables?topic=paper' }]}
    controls={<>
      <Choice label="סגנון הסימניות" value={theme} onChange={setStyle} options={THEMES} />
      <Choice label="צבע" value={colorful ? 'color' : 'outline'} onChange={value => setColorful(value === 'color')} options={[['outline', '✏️ שחור־לבן לצביעה'], ['color', '🌈 צבעוני']]} />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="שם (לא חובה)" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={22} /><Field label="משפט על הסימנייה" value={message} onChange={setMessage} placeholder="ספר טוב פותח עולם" maxLength={42} /></div>
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-3 text-center"><label className="cursor-pointer font-bold text-sky-800">📷 הוסיפו תמונה מהטלפון או מהמחשב<input className="sr-only" type="file" accept="image/*" onChange={readPhoto} /></label><p className="mt-1 text-sm text-slate-600">התמונה מופיעה בתוך מסגרת עגולה בכל 6 הסימניות ונשארת רק במכשיר שלכם.</p>{photo && <button type="button" className="text-sm font-bold underline" onClick={() => setPhoto('')}>הסירו את התמונה</button>}</div>
      <div className="text-center"><button type="button" onClick={() => setSeed(value => value + 1)} className="wobbly-sm border-2 border-[var(--border)] bg-white px-5 py-2 font-bold">🔄 החליפו את האיורים</button></div>
    </>}
    pages={[page]} printTitle="סימניות להדפסה" onRefresh={() => setSeed(value => value + 1)}
    paragraphs={['סימנייה אישית הופכת כל ספר למתנה קטנה: בוחרים מנדלה לצביעה, חלל, חיות או פרחים, מוסיפים שם ומשפט, ומדפיסים שש סימניות בדף A4 אחד.', 'אפשר להעלות תמונה של הילד או הילדה; היא משמשת רק לתצוגה ולהדפסה בדפדפן שלכם ולא נשלחת או נשמרת באתר. לכיתה אפשר להדפיס בלי תמונה, לצבוע ואז לחלק לכל הילדים.']}
    faq={[{ q: 'כמה סימניות יש בדף?', a: 'בכל הדפסה יש 6 סימניות לגזירה על דף A4 אחד.' }, { q: 'אפשר להוסיף תמונה?', a: 'כן. בוחרים תמונה מהטלפון או מהמחשב, והיא מופיעה בכל הסימניות. התמונה נשארת רק במכשיר שלכם.' }, { q: 'אפשר לצבוע את הסימניות?', a: 'כן. בוחרים שחור־לבן ומדפיסים סימניות מנדלה או איורים אחרים לצביעה.' }]}
    related={[{ label: 'מנדלות לצביעה', href: '/printables/mandalas' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'כרטיסי תודה', href: '/printables/thank-you' }, { label: 'תגי שם', href: '/printables/name-tags' }, { label: 'כל הדפים להדפסה', href: '/printables' }]}
    extra={<Link to="/printables/mandalas" className="block text-center text-sm font-bold underline">רוצים רק מנדלות? לעמוד המנדלות ←</Link>}
  />
}

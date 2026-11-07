import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// Two printables in one file:
// /printables/my-book — an 8-page mini book folded from one A4 sheet (one cut, no glue), with ready prompts.
// /printables/comic   — blank comic pages: panel layouts, empty speech bubbles, optional writing lines.

export const BOOK_PRESETS = {
  'about-me': ['הספר עליי', ['קוראים לי…', 'ככה אני נראה/ית', 'המשפחה שלי', 'האוכל שאני הכי אוהב/ת', 'מה אני אוהב/ת לעשות', 'כשאהיה גדול/ה אני רוצה…']],
  story: ['הסיפור שלי', ['פעם אחת…', 'הגיבור/ה של הסיפור', 'יום אחד…', 'פתאום…', 'ואז…', 'ובסוף…']],
  family: ['המשפחה שלי', ['ההורים שלי', 'האחים והאחיות שלי', 'סבא וסבתא', 'הבית שלנו', 'מה אנחנו אוהבים לעשות יחד', 'החג שלנו']],
  hanukkah: ['החנוכה שלי', ['מדליקים נרות', 'החנוכייה שלי', 'סופגניות ולביבות', 'משחקים בסביבון', 'מתנה שהייתי רוצה לתת', 'הנס שלי']],
  winter: ['ספר החורף שלי', ['יורד גשם', 'מה אני לובש/ת בחורף', 'קופצים בשלוליות', 'שוקו חם', 'משחקים בבית', 'קשת בענן']],
  blank: ['הספר שלי', ['', '', '', '', '', '']],
}
const PRESET_LABELS = [['about-me', '🙋 עליי'], ['story', '📖 סיפור'], ['family', '👨‍👩‍👧 משפחה'], ['hanukkah', '🕎 חנוכה'], ['winter', '🌧️ חורף'], ['blank', '⬜ ריק']]

// Split a line of text into rows of at most `max` characters, at spaces.
export function wrap(text, max) {
  const out = []
  let row = ''
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    if (row && (row + ' ' + word).length > max) { out.push(row); row = word } else row = row ? row + ' ' + word : word
  }
  if (row) out.push(row)
  return out
}

// Landscape positions (270×200, four columns × two rows) of the eight pages, for a right-to-left book:
// bottom row left→right 1 (cover), 8 (back), 7, 6; top row upside down 2, 3, 4, 5.
export const ZINE_SLOTS = { 1: [0, 1], 8: [1, 1], 7: [2, 1], 6: [3, 1], 2: [0, 0], 3: [1, 0], 4: [2, 0], 5: [3, 0] }
const PW = 67.5, PH = 100

function Bubble({ cx, cy, rx, ry, left }) {
  const d = left ? 1 : -1
  return <g>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" stroke="#222" strokeWidth="0.5" />
    <path d={`M${cx + d * rx * 0.1} ${cy + ry * 0.7} L${cx + d * rx * 0.45} ${cy + ry * 1.75} L${cx + d * rx * 0.42} ${cy + ry * 0.6} Z`} fill="#fff" stroke="#222" strokeWidth="0.5" strokeLinejoin="round" />
    <ellipse cx={cx} cy={cy} rx={rx - 0.45} ry={ry - 0.45} fill="#fff" />
  </g>
}

function BookPage({ n, title, name, prompt, style }) {
  const w = PW, cx = w / 2
  if (n === 1) {
    const rows = wrap(title || 'הספר שלי', 12).slice(0, 2)
    return <g>
      {rows.map((r, i) => <T key={i} x={cx} y={14 + i * 9} size={8} weight={900}>{r}</T>)}
      <rect x="7" y={rows.length > 1 ? 28 : 21} width={w - 14} height={rows.length > 1 ? 52 : 59} rx="3" fill="none" stroke="#999" strokeWidth="0.5" strokeDasharray="2 1.5" />
      <T x={cx} y="90" size={4.6} weight={700}>מאת: {name || '__________'}</T>
    </g>
  }
  if (n === 8) return <g>
    <T x={cx} y="16" size={8} weight={900}>סוף</T>
    <T x={cx} y="28" size={4.2}>הספר נכתב ואויר על ידי:</T>
    <T x={cx} y="37" size={4.6} weight={700}>{name || '______________'}</T>
    <T x={cx} y="52" size={4.2}>מה הכי אהבתי בספר?</T>
    {[62, 72, 82].map(y => <line key={y} x1="7" x2={w - 7} y1={y} y2={y} stroke="#bbb" strokeWidth="0.35" />)}
    <T x={cx} y="94" size={3} fill="#999">עוגה בוגה · ugabuga.co.il</T>
  </g>
  const rows = wrap(prompt, 16).slice(0, 2)
  const top = rows.length ? 7 + rows.length * 6 : 6
  const lines = style === 'write' ? 6 : style === 'lines' ? 2 : 0
  const boxBottom = 92 - lines * 8
  return <g>
    {rows.map((r, i) => <T key={i} x={cx} y={10 + i * 6} size={4.6} weight={800}>{r}</T>)}
    {style === 'comic'
      ? [0, 1].map(i => { const h = (92 - top - 3) / 2, y = top + i * (h + 3); return <g key={i}><rect x="6" y={y} width={w - 12} height={h} fill="none" stroke="#333" strokeWidth="0.6" /><Bubble cx={i ? 22 : w - 22} cy={y + 8} rx="13" ry="5.5" left={!!i} /></g> })
      : <rect x="6" y={top} width={w - 12} height={Math.max(10, boxBottom - top)} rx="2" fill="none" stroke="#999" strokeWidth="0.45" strokeDasharray="2 1.5" />}
    {Array.from({ length: lines }, (_, i) => <line key={i} x1="7" x2={w - 7} y1={boxBottom + 7 + i * 8} y2={boxBottom + 7 + i * 8} stroke="#bbb" strokeWidth="0.35" />)}
    <T x={cx} y="97.5" size={3.4} fill="#888">{n}</T>
  </g>
}

function BookSheet({ title, name, prompts, style, guides }) {
  return <Sheet label={`ספר מקופל של 8 עמודים: ${title}`}>
    <g transform="translate(200,0) rotate(90)">
      {Object.entries(ZINE_SLOTS).map(([n, [c, r]]) => {
        const x = c * PW, y = r * PH
        const t = r === 0 ? `translate(${x + PW},${PH}) rotate(180)` : `translate(${x},${y})`
        return <g key={n} transform={t}><BookPage n={+n} title={title} name={name} prompt={prompts[n - 2] || ''} style={style} /></g>
      })}
      {guides && <g>
        {[1, 2, 3].map(c => <line key={c} x1={c * PW} x2={c * PW} y1="0" y2="200" stroke="#bbb" strokeWidth="0.35" strokeDasharray="1 1.5" />)}
        <line x1="0" x2={PW} y1={PH} y2={PH} stroke="#bbb" strokeWidth="0.35" strokeDasharray="1 1.5" />
        <line x1={PW * 3} x2="270" y1={PH} y2={PH} stroke="#bbb" strokeWidth="0.35" strokeDasharray="1 1.5" />
        <line x1={PW} x2={PW * 3} y1={PH} y2={PH} stroke="#e11d48" strokeWidth="0.7" strokeDasharray="3 1.5" />
        <text x={PW + 3} y={PH - 1.5} fontSize="5">✂️</text>
      </g>}
    </g>
  </Sheet>
}

function FoldSheet() {
  const steps = [
    'מקפלים את הדף לחצי לרוחב, ושוב לחצי, ושוב לחצי — ופותחים. יש עכשיו 8 מלבנים.',
    'מקפלים את הדף לחצי כך שהצלעות הקצרות נפגשות. גוזרים מהצד המקופל לאורך הקו האדום בלבד — עד הקפל הבא, לא יותר.',
    'פותחים, ומקפלים לאורך כך שהציורים בחוץ. אוחזים בשני הקצוות ודוחפים אותם זה אל זה — החריץ נפתח.',
    'סוגרים את הדפים כמו ספר, כשהשער (עמוד 1) מקדימה. הספר נפתח מימין לשמאל, כמו כל ספר בעברית.',
  ]
  const W = 70, H = 52
  const pics = [
    <g key="a"><rect x="0" y="0" width={W} height={H} fill="#fff" stroke="#333" strokeWidth="0.6" />{[1, 2, 3].map(c => <line key={c} x1={c * W / 4} x2={c * W / 4} y1="0" y2={H} stroke="#999" strokeWidth="0.4" strokeDasharray="1 1" />)}<line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#999" strokeWidth="0.4" strokeDasharray="1 1" /></g>,
    <g key="b"><rect x="0" y={H / 4} width={W} height={H / 2} fill="#fff" stroke="#333" strokeWidth="0.6" /><line x1={W / 4} x2={W * 3 / 4} y1={H / 4} y2={H / 4} stroke="#e11d48" strokeWidth="1" strokeDasharray="2 1" /><text x={W / 4 - 7} y={H / 4 + 2} fontSize="6">✂️</text></g>,
    <g key="c"><path d={`M0 ${H / 2} L${W / 4} ${H / 2 - 6} L${W / 2} ${H / 2 - 14} L${W * 3 / 4} ${H / 2 - 6} L${W} ${H / 2} M${W / 4} ${H / 2 - 6} L${W / 2} ${H / 2 + 14} L${W * 3 / 4} ${H / 2 - 6}`} fill="none" stroke="#333" strokeWidth="0.7" /><text x="4" y={H / 2 + 12} fontSize="7">➡️</text><text x={W - 12} y={H / 2 + 12} fontSize="7">⬅️</text></g>,
    <g key="d"><rect x={W / 2 - 14} y="6" width="28" height="40" fill="#fff" stroke="#333" strokeWidth="0.7" /><rect x={W / 2 - 12} y="8" width="26" height="40" fill="none" stroke="#999" strokeWidth="0.4" /><T x={W / 2} y="26" size={5} weight={800}>הספר</T><T x={W / 2} y="33" size={5} weight={800}>שלי</T></g>,
  ]
  return <Sheet label="הוראות קיפול הספר">
    <T x={100} y={18} size={10} weight={900}>איך מקפלים את הספר?</T>
    <T x={100} y={27} size={5} fill="#555">דף אחד, גזירה אחת קטנה, בלי דבק</T>
    {steps.map((s, i) => {
      const y = 36 + i * 58
      return <g key={i}>
        <circle cx="184" cy={y + 6} r="5" fill="#ffd84d" stroke="#333" strokeWidth="0.5" /><T x={184} y={y + 8} size={6} weight={900}>{i + 1}</T>
        {wrap(s, 30).map((r, j) => <T key={j} x={174} y={y + 8 + j * 7} size={5.2} anchor="start">{r}</T>)}
        <g transform={`translate(12,${y})`}>{pics[i]}</g>
      </g>
    })}
  </Sheet>
}

// ---- comic pages ----
export const COMIC_LAYOUTS = {
  six: [[0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1], [0, 2, 1, 1], [1, 2, 1, 1]].map(([c, r, w, h]) => [c / 2, r / 3, w / 2, h / 3]),
  four: [[0, 0], [1, 0], [0, 1], [1, 1]].map(([c, r]) => [c / 2, r / 2, 1 / 2, 1 / 2]),
  nine: Array.from({ length: 9 }, (_, i) => [(i % 3) / 3, Math.floor(i / 3) / 3, 1 / 3, 1 / 3]),
  hero: [[0, 0, 1, 1 / 2], [0, 1 / 2, 1 / 2, 1 / 2], [1 / 2, 1 / 2, 1 / 2, 1 / 2]],
  mix: [[0, 0, 1 / 2, 1 / 3], [1 / 2, 0, 1 / 2, 1 / 3], [0, 1 / 3, 1, 1 / 3], [0, 2 / 3, 1 / 3, 1 / 3], [1 / 3, 2 / 3, 1 / 3, 1 / 3], [2 / 3, 2 / 3, 1 / 3, 1 / 3]],
}
const LAYOUT_LABELS = [['six', '6 משבצות'], ['four', '4 גדולות'], ['nine', '9 קטנות'], ['hero', 'גדולה + 2'], ['mix', 'מעורב']]

function ComicSheet({ layout, title, name, bubbles, lines, page, pages }) {
  const X0 = 10, X1 = 190, Y0 = 36, Y1 = 260, G = 4
  const W = X1 - X0 + G, H = Y1 - Y0 + G
  return <Sheet label={`דף קומיקס ${page} מתוך ${pages}`}>
    <T x={100} y={16} size={10} weight={900}>{title || 'הקומיקס שלי'}{pages > 1 ? ` · ${page}` : ''}</T>
    <T x={100} y={27} size={5.5} fill="#555">מאת: {name || '______________'}</T>
    {COMIC_LAYOUTS[layout].map(([fx, fy, fw, fh], i) => {
      // right-to-left: the first panel sits top right
      const x = X1 - (fx + fw) * W + G, y = Y0 + fy * H, w = fw * W - G, h = fh * H - G
      const lh = lines ? Math.min(14, h * 0.3) : 0
      const small = w < 60
      return <g key={i}>
        <rect x={x} y={y} width={w} height={h - lh} fill="#fff" stroke="#111" strokeWidth="0.9" />
        {bubbles && <Bubble cx={i % 2 ? x + w * 0.3 : x + w * 0.7} cy={y + (small ? 9 : 11)} rx={Math.min(w * 0.26, 26)} ry={small ? 5.5 : 7} left={i % 2 === 1} />}
        {lines && [0, 1].map(k => <line key={k} x1={x + 1} x2={x + w - 1} y1={y + h - lh + 5 + k * 5.5} y2={y + h - lh + 5 + k * 5.5} stroke="#bbb" strokeWidth="0.35" />)}
      </g>
    })}
  </Sheet>
}

const BOOK_FAQ = [
  { q: 'איך מקפלים ספר מדף אחד?', a: 'מקפלים את הדף לשמונה מלבנים ופותחים, מקפלים לחצי וגוזרים חריץ קצר באמצע (הקו האדום), פותחים, מקפלים לאורך ודוחפים את הקצוות פנימה עד שהחריץ נפתח. בהדפסה יש גם דף הוראות עם ציורים.' },
  { q: 'מאיזה גיל זה מתאים?', a: 'מגיל 4 עם עזרה בגזירה, ומגיל 6–7 ילדים מקפלים לבד. הקטנים מציירים בכל עמוד, והגדולים כותבים משפט מתחת לציור.' },
  { q: 'אפשר לכתוב את הסיפור מראש?', a: 'כן. כותבים בתיבה שורה לכל עמוד — כותרת, שאלה או משפט מהסיפור — והילדים ממלאים ומאיירים. מתאים לגננת שרוצה ספר אחיד לכל הכיתה.' },
]
const COMIC_FAQ = [
  { q: 'איך מתחילים לצייר קומיקס?', a: 'כותבים קודם במשפט אחד מה קורה בסיפור, ומחלקים אותו לשלבים: התחלה, בעיה, ניסיון לפתור וסוף. כל שלב הוא משבצת. מציירים דמויות פשוטות — עיגול לראש וקווים לגוף מספיקים.' },
  { q: 'לאן הולכים בקומיקס בעברית?', a: 'מימין לשמאל ומלמעלה למטה, כמו בספר. המשבצת הראשונה היא הימנית העליונה.' },
  { q: 'מה עושים עם בועות הדיבור?', a: 'כותבים בבועה מה הדמות אומרת, ומותחים את הזנב לכיוון הפה שלה. אם לא צריך בועה, פשוט מציירים עליה. אפשר גם להדפיס בלי בועות ולצייר אותן לבד.' },
]

export default function MyBookComic({ mode = 'book' }) {
  const [preset, setPreset] = useState('about-me')
  const [title, setTitle] = useState(BOOK_PRESETS['about-me'][0])
  const [text, setText] = useState(BOOK_PRESETS['about-me'][1].join('\n'))
  const [name, setName] = useState('')
  const [style, setStyle] = useState('lines')
  const [howTo, setHowTo] = useState('yes')
  const [layout, setLayout] = useState('six')
  const [comicTitle, setComicTitle] = useState('הקומיקס שלי')
  const [bubbles, setBubbles] = useState('yes')
  const [lines, setLines] = useState('no')
  const [count, setCount] = useState('1')
  const pick = p => { setPreset(p); setTitle(BOOK_PRESETS[p][0]); setText(BOOK_PRESETS[p][1].join('\n')) }
  const siblings = [{ label: '📖 ספר מקופל', href: '/printables/my-book' }, { label: '💬 דפי קומיקס', href: '/printables/comic' }]
  const related = [{ label: 'מחולל דפי עבודה', href: '/tools/worksheet-maker' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'איך מציירים', href: '/how-to-draw' }, { label: 'סיפורים לילדים', href: '/stories' }]

  if (mode === 'comic') {
    const n = Number(count)
    const pages = Array.from({ length: n }, (_, i) => ({ key: [layout, comicTitle, name, bubbles, lines, i].join('|'), svg: <ComicSheet layout={layout} title={comicTitle} name={name} bubbles={bubbles === 'yes'} lines={lines === 'yes'} page={i + 1} pages={n} /> }))
    const controls = <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="שם הקומיקס" value={comicTitle} onChange={setComicTitle} maxLength={28} /><Field label="שם המאייר/ת (לא חובה)" value={name} onChange={setName} maxLength={20} placeholder="אפשר להשאיר ריק" /></div>
      <div><p className="mb-2 text-center font-bold">חלוקה למשבצות</p><Choice label="חלוקה למשבצות" value={layout} onChange={setLayout} options={LAYOUT_LABELS} /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><p className="mb-2 text-center font-bold">בועות דיבור</p><Choice label="בועות דיבור" value={bubbles} onChange={setBubbles} options={[['yes', 'עם'], ['no', 'בלי']]} /></div>
        <div><p className="mb-2 text-center font-bold">שורות כתיבה</p><Choice label="שורות כתיבה" value={lines} onChange={setLines} options={[['no', 'בלי'], ['yes', 'עם']]} /></div>
        <div><p className="mb-2 text-center font-bold">כמה דפים</p><Choice label="כמה דפים" value={count} onChange={setCount} options={[['1', '1'], ['2', '2'], ['4', '4']]} /></div>
      </div>
    </div>
    return <PrintableShell path="/printables/comic" emoji="💬" h1="דפי קומיקס להדפסה" siblings={siblings}
      seoTitle="דפי קומיקס להדפסה — תבניות ריקות עם בועות דיבור | חינם"
      description="תבניות קומיקס ריקות להדפסה בחינם: 4, 6 או 9 משבצות, עם בועות דיבור ושורות כתיבה או בלי. מימין לשמאל, עם שם הקומיקס והמאייר. לילדים, לכיתה ולשיעורי הבעה."
      sub="בוחרים חלוקה למשבצות, מוסיפים בועות — ומציירים סיפור"
      crumbs={[{ label: 'יצירה', href: '/printables' }]} controls={controls} pages={pages} printTitle={comicTitle || 'קומיקס'}
      paragraphs={[
        'דף קומיקס ריק הוא דרך טובה לגרום לילדים לספר סיפור — גם לאלה שעוד לא אוהבים לכתוב. כל משבצת היא רגע אחד בסיפור, והבועות מזמינות לכתוב רק כמה מילים.',
        'בקומיקס בעברית קוראים מימין לשמאל, ולכן המשבצת הראשונה בדף היא הימנית העליונה. אפשר לבחור חלוקה של 4 משבצות גדולות לקטנים, 6 משבצות לסיפור רגיל, או 9 קטנות לסיפור ארוך. שורות הכתיבה מתחת למשבצות מתאימות למי שרוצה לכתוב גם מה קורה, ולא רק מה הדמויות אומרות.',
      ]}
      faq={COMIC_FAQ} related={related}
      body={<p className="mx-auto max-w-3xl text-center">רוצים שהקומיקס יהיה ספר קטן? ב<Link to="/printables/my-book" className="font-bold underline">ספר המקופל</Link> אפשר לבחור עמודים בסגנון קומיקס.</p>} />
  }

  const prompts = text.split('\n').slice(0, 6)
  const pages = [
    { key: ['book', title, name, text, style].join('|'), svg: <BookSheet title={title} name={name} prompts={prompts} style={style} guides /> },
    ...(howTo === 'yes' ? [{ key: 'fold', svg: <FoldSheet /> }] : []),
  ]
  const controls = <div className="space-y-4">
    <div><p className="mb-2 text-center font-bold">על מה הספר?</p><Choice label="נושא הספר" value={preset} onChange={pick} options={PRESET_LABELS} /></div>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="שם הספר" value={title} onChange={setTitle} maxLength={24} /><Field label="שם הכותב/ת (לא חובה)" value={name} onChange={setName} maxLength={20} placeholder="אפשר להשאיר ריק" /></div>
    <label className="block text-center font-bold">מה כתוב בראש כל עמוד — שורה לכל עמוד (6 עמודים)
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} maxLength={260} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
    </label>
    <div><p className="mb-2 text-center font-bold">איך נראה כל עמוד?</p><Choice label="סגנון העמודים" value={style} onChange={setStyle} options={[['draw', '🎨 רק ציור'], ['lines', '✏️ ציור ו־2 שורות'], ['write', '📝 כתיבה'], ['comic', '💬 קומיקס']]} /></div>
    <div><p className="mb-2 text-center font-bold">דף הוראות קיפול</p><Choice label="דף הוראות קיפול" value={howTo} onChange={setHowTo} options={[['yes', 'להוסיף'], ['no', 'בלי']]} /></div>
  </div>
  return <PrintableShell path="/printables/my-book" emoji="📖" h1="ספר משלי — ספר מקופל מדף אחד" siblings={siblings}
    seoTitle="ספר מקופל להדפסה — ספר קטן של 8 עמודים מדף A4 אחד | חינם"
    description="מדפיסים דף אחד, גוזרים חריץ קטן ומקפלים — ויש ספר של 8 עמודים. נושאים מוכנים: הספר עליי, סיפור, משפחה, חנוכה וחורף, או ספר ריק. עם דף הוראות קיפול, בחינם."
    sub="דף A4 אחד, גזירה אחת קטנה ובלי דבק — ויש ספר של 8 עמודים"
    crumbs={[{ label: 'יצירה', href: '/printables' }]} controls={controls} pages={pages} printTitle={title || 'הספר שלי'} previewAll
    paragraphs={[
      'ספר מקופל (מיני־ספר או "זין") נבנה מדף A4 אחד: מקפלים לשמונה מלבנים, גוזרים חריץ קצר באמצע ומקפלים שוב — ומקבלים ספר קטן עם שער, שישה עמודים פנימיים ועמוד אחורי. לא צריך דבק ולא שדכן.',
      'בחרו נושא מוכן או כתבו לבד מה יופיע בראש כל עמוד. "הספר עליי" מתאים לתחילת שנה ולהיכרות בגן, "הסיפור שלי" נותן מבנה של התחלה, אמצע וסוף, ויש גם ספרים לחנוכה ולחורף. העמודים יכולים להיות רק לציור, ציור עם שתי שורות, עמוד כתיבה או שתי משבצות קומיקס.',
      'העמודים בשורה העליונה מודפסים הפוכים בכוונה — כך הם יוצאים ישרים אחרי הקיפול. הספר נפתח מימין לשמאל, כמו ספר בעברית.',
    ]}
    faq={BOOK_FAQ} related={related}
    body={<p className="mx-auto max-w-3xl text-center">אוהבים לצייר סיפורים? יש גם <Link to="/printables/comic" className="font-bold underline">דפי קומיקס ריקים</Link> עם בועות דיבור.</p>} />
}
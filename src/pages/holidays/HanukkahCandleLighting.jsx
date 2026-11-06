import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import MiniHanukkiah from '../../components/hanukkah/MiniHanukkiah'
import { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import PersonalPhoto from '../../components/printables/PersonalPhoto'
import { HANEIROT_HALALU, MAOZ_TZUR, NUSACH, LIGHTING_STEPS, lightingBlessings, wrapLines } from '../../data/hanukkahLighting'
import { TOUR_NIGHTS, formatNightDate } from '../../data/hanukkiahTour'

// /holidays/hanukkah/candle-lighting: the order of lighting as a card to print and hang, with an
// optional photo (kept in the browser), a choice of wording, two small cards per sheet for handing
// out, and a chart of the eight nights. The same texts appear as real text on the page itself.
const PATH = '/holidays/hanukkah/candle-lighting'

const THEMES = {
  color: { ink: '#1e3a8a', gold: '#b7791f', bg: '#f4f7ff', soft: '#fff', text: '#172554', art: true },
  ink: { ink: '#222', gold: '#666', bg: '#fff', soft: '#fff', text: '#111', art: false },
}

const Lines = ({ lines, x = 100, y, size, gap, fill, weight = 500 }) => lines.map((l, i) => <T key={i} x={x} y={y + i * gap} size={size} fill={fill} weight={weight}>{l}</T>)

// Stack blocks of known height downwards: every item comes back with its `top`.
function stack(items, start, height) {
  const out = []
  items.reduce((y, item) => { out.push({ ...item, top: y }); return y + height(item) }, start)
  return out
}

// The picture slot: the family photo, or a hanukkiah when no photo was chosen.
function Picture({ x, y, w, h, photo, c }) {
  const scale = Math.min((w - 8) / 160, (h - 6) / 96)
  return <>
    <rect x={x} y={y} width={w} height={h} rx="5" fill={c.soft} stroke={c.gold} strokeWidth="0.6" />
    {photo
      ? <image href={photo} x={x + 2} y={y + 2} width={w - 4} height={h - 4} preserveAspectRatio="xMidYMid meet" />
      : <g transform={`translate(${x + w / 2 - 80 * scale} ${y + h / 2 + 3 * scale}) scale(${scale})`}><MiniHanukkiah x={0} y={0} w={160} lit={8} color={c.art} /></g>}
  </>
}

function FullCard({ nusach, contents, caption, photo, theme }) {
  const c = THEMES[theme], short = contents === 'blessings'
  const size = short ? 6.6 : 5.8, gap = short ? 10.4 : 8.6, chars = short ? 52 : 56
  const photoH = short ? 104 : 70, photoW = Math.round(photoH * 1.4)
  const height = b => 4.4 + b.lines.length * gap + (short ? 5 : 1.6)
  const blessings = stack(lightingBlessings(nusach).map(b => ({ ...b, lines: wrapLines(b.text, chars) })), 43 + photoH + (short ? 13 : 9), height)
  const last = blessings[blessings.length - 1]
  const halalu = wrapLines(HANEIROT_HALALU, 80), halaluY = last.top + height(last) + 2, maozY = halaluY + 6 + halalu.length * 6 + 3
  return <Sheet label={`סדר הדלקת נרות חנוכה${caption ? ` — ${caption}` : ''}`}>
    <rect x="5" y="5" width="190" height="260" rx="8" fill={c.bg} stroke={c.ink} strokeWidth="1" />
    <rect x="8.5" y="8.5" width="183" height="253" rx="6" fill="none" stroke={c.gold} strokeWidth="0.4" />
    <T x="100" y="24" size="12.5" weight="800" fill={c.ink}>סדר הדלקת נרות חנוכה</T>
    <T x="100" y="34" size={caption.length > 30 ? 5 : 6.2} weight="700" fill={c.gold}>{caption || 'חג אורים שמח'}</T>
    <Picture x={100 - photoW / 2} y={40} w={photoW} h={photoH} photo={photo} c={c} />
    {blessings.map(b => <g key={b.when + b.top}>
      <T x="100" y={b.top} size="3.6" weight="700" fill={c.gold}>{b.when}</T>
      <Lines lines={b.lines} y={b.top + (short ? 9 : 7)} size={size} gap={gap} fill={c.text} />
    </g>)}
    {!short && <>
      <T x="100" y={halaluY} size="5" weight="800" fill={c.ink}>הנרות הללו</T>
      <Lines lines={halalu} y={halaluY + 6} size="4.3" gap="6" fill={c.text} weight={400} />
      <T x="100" y={maozY} size="5" weight="800" fill={c.ink}>מעוז צור</T>
      <Lines lines={MAOZ_TZUR[0].lines} y={maozY + 6} size="4.8" gap="6.2" fill={c.text} weight={400} />
    </>}
  </Sheet>
}

function SmallCard({ top, nusach, caption, photo, c }) {
  const texts = stack(lightingBlessings(nusach).map(b => ({ ...b, lines: wrapLines(b.text, 45) })), 30, b => 4.4 + b.lines.length * 8 + 3.4)
  return <g transform={`translate(5 ${top})`}>
    <rect x="0" y="0" width="190" height="125" rx="6" fill={c.bg} stroke={c.ink} strokeWidth="0.8" />
    <Picture x={8} y={12} w={58} h={78} photo={photo} c={c} />
    <T x="37" y="101" size={caption.length > 18 ? 4 : 5.2} weight="700" fill={c.ink}>{caption || 'חג אורים שמח'}</T>
    <T x="37" y="111" size="4" weight="500" fill={c.gold}>חנוכה תשפ״ז</T>
    <T x="128" y="17" size="8.4" weight="800" fill={c.ink}>סדר הדלקת נרות חנוכה</T>
    {texts.map(b => <g key={b.text}>
      <T x="128" y={b.top} size="3.4" weight="700" fill={c.gold}>{b.when}</T>
      <Lines lines={b.lines} x={128} y={b.top + 6.6} size="5.2" gap="8" fill={c.text} />
    </g>)}
  </g>
}

function SmallCards({ nusach, caption, photo, theme }) {
  const c = THEMES[theme]
  return <Sheet label="שני כרטיסי סדר הדלקת נרות לגזירה">
    <SmallCard top={4} {...{ nusach, caption, photo, c }} />
    <path d="M4 134.5 H196" stroke="#777" strokeWidth="0.3" strokeDasharray="2.5 2" />
    <text x="12" y="136" fontSize="4" textAnchor="middle">✂️</text>
    <SmallCard top={141} {...{ nusach, caption, photo, c }} />
  </Sheet>
}

// Eight nights, read from the top right: date, hanukkiah with that night's candles, and a box to tick.
function NightChart({ theme }) {
  const c = THEMES[theme]
  return <Sheet label="לוח הדלקת נרות לשמונת ערבי חנוכה">
    <T x="100" y="17" size="10.5" weight="800" fill={c.ink}>לוח הדלקת נרות לשמונה ערבים</T>
    <T x="100" y="25" size="4.6" fill={c.text}>חנוכה תשפ״ז · דצמבר 2026 · הדלקנו? מסמנים ✓ בריבוע</T>
    {TOUR_NIGHTS.map((night, i) => {
      const x = i % 2 === 0 ? 102 : 6, y = 30 + Math.floor(i / 2) * 44
      return <g key={night.n}>
        <rect x={x} y={y} width="92" height="41" rx="4" fill={c.bg} stroke={c.ink} strokeWidth="0.6" />
        <T x={x + 77} y={y + 13} size="7.4" weight="800" fill={c.ink}>{`ערב ${night.n}`}</T>
        <T x={x + 77} y={y + 21} size="4.8" weight="700" fill={c.text}>{formatNightDate(night.date)}</T>
        <T x={x + 77} y={y + 27.5} size="3.8" fill={c.text}>{night.day}</T>
        {night.note && <T x={x + 46} y={y + 37.6} size="3.2" fill={c.gold} weight="700">{night.note}</T>}
        <g transform={`translate(${x + 9} ${y + 18}) scale(0.33)`}><MiniHanukkiah x={0} y={0} w={160} lit={night.n} color={c.art} /></g>
        <rect x={x + 3} y={y + 3} width="6.4" height="6.4" rx="1" fill="#fff" stroke={c.ink} strokeWidth="0.5" />
      </g>
    })}
    <T x="100" y="215" size="6" weight="800" fill={c.ink}>איך מדליקים?</T>
    {LIGHTING_STEPS.map((s, i) => <T key={s} x="194" y={224 + i * 8.6} size="4.3" anchor="start" fill={c.text}>{`${i + 1}. ${s}`}</T>)}
  </Sheet>
}

const FAQ = [
  { q: 'מה סדר הדלקת נרות חנוכה?', a: 'מניחים בחנוכייה את הנרות מימין לשמאל, נר אחד בערב הראשון ועוד נר בכל ערב. מדליקים את השמש, מברכים, ובעזרת השמש מדליקים את הנרות, ומתחילים בנר החדש, השמאלי ביותר. אחרי הנר הראשון אומרים "הנרות הללו", ובסוף ההדלקה רבים שרים "מעוז צור".' },
  { q: 'כמה ברכות מברכים על נרות חנוכה?', a: 'בערב הראשון שלוש: להדליק נר חנוכה, שעשה ניסים ושהחיינו. בשאר הערבים שתיים, בלי שהחיינו.' },
  { q: 'אומרים "נר חנוכה" או "נר של חנוכה"?', a: 'בסידורי אשכנז רבים כתוב "לְהַדְלִיק נֵר שֶׁל חֲנֻכָּה", ובשולחן ערוך ובנוסח עדות המזרח "לְהַדְלִיק נֵר חֲנֻכָּה". בוחרים בכרטיס את הנוסח של המשפחה, והברכה מתעדכנת.' },
  { q: 'מה עושים בערב שישי ובמוצאי שבת?', a: 'בערב שישי מדליקים את נרות החנוכה לפני נרות השבת, ובמוצאי שבת מדליקים אחרי צאת השבת. בחנוכה 2026 הערב הראשון והערב השמיני חלים ביום שישי, והערב השני במוצאי שבת. את השעות המדויקות לפי עיר אפשר למצוא בדף זמני ההדלקה.' },
  { q: 'אפשר להדפיס את הכרטיס לכל ילדי הגן או הכיתה?', a: 'כן. בוחרים "שני כרטיסים בדף", כותבים את שם הגן או הכיתה, מדפיסים וגוזרים לאורך הקו המקווקו. אפשר להוסיף תמונה קבוצתית, ורק אם ההורים של כל הילדים שבתמונה הסכימו.' },
  { q: 'האם התמונה נשמרת באתר?', a: 'לא. התמונה נשארת בדפדפן שלכם ונכללת רק בדף שאתם מדפיסים או שומרים כ־PDF. היא לא נשלחת לאתר, ורענון הדף מוחק אותה.' },
]

export default function HanukkahCandleLighting() {
  const [format, setFormat] = useState('full'), [contents, setContents] = useState('all'), [nusach, setNusach] = useState('ner')
  const [caption, setCaption] = useState(''), [photo, setPhoto] = useState(''), [theme, setTheme] = useState('color'), [print, setPrint] = useState(null)
  const card = format === 'full'
    ? { key: 'card', name: 'כרטיס סדר ההדלקה', svg: <FullCard {...{ nusach, contents, caption, photo, theme }} /> }
    : { key: 'cards', name: 'שני כרטיסים לגזירה', svg: <SmallCards {...{ nusach, caption, photo, theme }} /> }
  const chart = { key: 'nights', name: 'לוח 8 הערבים', svg: <NightChart theme={theme} /> }
  const pages = [card, chart]
  return <HanukkahShell crumb="סדר הדלקת נרות">
    <SEO title="סדר הדלקת נרות חנוכה להדפסה — ברכות, הנרות הללו ומעוז צור" description="סדר הדלקת נרות חנוכה: כרטיס צבעוני להדפסה עם הברכות, הנרות הללו ומעוז צור, מקום לתמונת הילדים ולשם המשפחה או הגן, ולוח שמונת הערבים של 2026. בחינם, בלי הרשמה." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🕯️ סדר הדלקת נרות חנוכה להדפסה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">כרטיס לשים ליד החנוכייה: הברכות, "הנרות הללו" ו"מעוז צור" בניקוד מלא, עם תמונה של הילדים או של הכיתה ועם השם שלכם. גם ועדים וגננות יכולים לחלק אותו כמתנה קטנה לחג.</p>

    <div className="mx-auto mb-8 max-w-3xl space-y-4 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">
      <Choice label="גודל" value={format} onChange={setFormat} options={[['full', 'דף A4 מלא'], ['small', 'שני כרטיסים בדף לחלוקה']]} />
      {format === 'full' && <Choice label="מה בכרטיס" value={contents} onChange={setContents} options={[['all', 'ברכות, הנרות הללו ומעוז צור'], ['blessings', 'רק הברכות, באותיות גדולות']]} />}
      <Choice label="נוסח הברכה הראשונה" value={nusach} onChange={setNusach} options={Object.entries(NUSACH).map(([k, v]) => [k, `${v.label} (${v.hint})`])} />
      <Field label="שם המשפחה, הגן או הכיתה (לא חובה)" value={caption} onChange={setCaption} maxLength={36} placeholder="למשל: משפחת לוי" />
      <PersonalPhoto label="תמונה של הילדים או של הכיתה (לא חובה)" value={photo} onChange={setPhoto} />
      <Choice label="עיצוב" value={theme} onChange={setTheme} options={[['color', 'צבעוני'], ['ink', 'חסכוני בדיו']]} />
    </div>

    <div className="mb-4 text-center">
      <button data-print-main type="button" onClick={() => setPrint(pages)} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסת 2 הדפים או PDF</button>
    </div>
    <div className="mx-auto mb-10 grid max-w-3xl gap-4 sm:grid-cols-2">
      {pages.map(p => <button key={p.key} type="button" onClick={() => setPrint([p])} aria-label={`הדפסה: ${p.name}`} className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
        {p.svg}
        <p className="mt-1 font-bold">{p.name}</p>
      </button>)}
    </div>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5">
      <h2 className="mb-3 text-2xl font-bold">🕎 איך מדליקים נרות חנוכה, צעד אחר צעד</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">{LIGHTING_STEPS.map(s => <li key={s}>{s}</li>)}</ol>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-1 text-2xl font-bold">📜 ברכות הדלקת נרות חנוכה</h2>
      <p className="mb-4 text-lg">בערב הראשון מברכים שלוש ברכות, ובשאר הערבים שתיים.</p>
      <ol className="list-none space-y-4 p-0">{lightingBlessings(nusach).map(b => <li key={b.text}>
        <p className="font-bold text-[var(--muted-foreground)]">{b.when}</p>
        <p className="text-xl leading-relaxed">{b.text}</p>
      </li>)}</ol>
      <h2 className="mb-1 mt-6 text-2xl font-bold">👉 הנרות הללו</h2>
      <p className="mb-2 text-[var(--muted-foreground)]">זה הנוסח הנפוץ בסידורי אשכנז. בעדות אחרות הנוסח שונה מעט.</p>
      <p className="text-xl leading-relaxed">{HANEIROT_HALALU}</p>
      <h2 className="mb-1 mt-6 text-2xl font-bold">🪨 מעוז צור</h2>
      <p className="mb-2 text-[var(--muted-foreground)]">{MAOZ_TZUR[0].label}. בעדות המזרח נוהגים לומר אחרי ההדלקה את מזמור ל׳ בתהילים.</p>
      <p className="text-xl leading-relaxed">{MAOZ_TZUR[0].lines.map(l => <span key={l} className="block">{l}</span>)}</p>
      <p className="mt-4"><Link to="/holidays/hanukkah/songs#maoz-tzur" className="font-bold underline">עוד בתים של מעוז צור בדף שירי חנוכה ←</Link></p>
    </section>

    {print && <PrintPreview title="סדר הדלקת נרות חנוכה" onClose={() => setPrint(null)}>
      {print.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/candle-times">זמני הדלקת נרות לפי עיר</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/cut-out-hanukkiah">חנוכייה לגזירה</Link> · <Link className="font-bold underline" to="/holidays/blessings/hanukkah">על הניסים והלל</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'סדר הדלקת נרות חנוכה הוא אותו סדר בכל שמונת הערבים, ורק מספר הנרות משתנה. כשהכרטיס מונח ליד החנוכייה, כל אחד מבני הבית יכול לקרוא את הברכות, גם ילדים שרק התחילו לקרוא בניקוד וגם אורחים שלא זוכרים את הנוסח בעל פה.',
      'בדף A4 המלא יש את שלוש הברכות, "הנרות הללו" והבית הראשון של "מעוז צור", ואפשר לבחור גרסה עם הברכות בלבד באותיות גדולות. אפשר להוסיף תמונה ושם, ולבחור בין "נר חנוכה" ל"נר של חנוכה" לפי המנהג שלכם. הדף השני הוא לוח שמונת הערבים של חנוכה 2026, עם התאריך, מספר הנרות וריבוע שמסמנים בו כל ערב שהדלקתם.',
    ]} faq={FAQ} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'זמני הדלקת נרות חנוכה', href: '/holidays/hanukkah/candle-times' }, { label: 'שירי חנוכה', href: '/holidays/hanukkah/songs' }, { label: 'ברכות וקריאות לחנוכה', href: '/holidays/blessings/hanukkah' }]} /></div>
  </HanukkahShell>
}

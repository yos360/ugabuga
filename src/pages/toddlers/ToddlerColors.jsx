import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { speak } from '../../utils/speak'
import '../../learn/learn.css'
import '../../family/family.css'
import './toddlers.css'

// /toddlers/colors: learning the ten basic colours in Hebrew, ages 2–4. Tap-to-hear cards, a tiny
// no-lose game, at-home ideas, an original rhyme, printable flashcards and a colour-sorting mat.
// `say` is the vocalized form used only for text-to-speech (the device voice guesses without niqqud).
// Each colour has one object that really is that colour; no emoji is used twice.
const PATH = '/toddlers/colors'
const COLORS = [
  { id: 'red', name: 'אדום', say: 'אָדוֹם', hex: '#e53935', emoji: '🍎', obj: 'תפוח' },
  { id: 'blue', name: 'כחול', say: 'כָּחוֹל', hex: '#1e88e5', emoji: '🐳', obj: 'לווייתן' },
  { id: 'yellow', name: 'צהוב', say: 'צָהוֹב', hex: '#fdd835', emoji: '🍌', obj: 'בננה' },
  { id: 'green', name: 'ירוק', say: 'יָרוֹק', hex: '#43a047', emoji: '🐸', obj: 'צפרדע' },
  { id: 'orange', name: 'כתום', say: 'כָּתוֹם', hex: '#fb8c00', emoji: '🍊', obj: 'תפוז' },
  { id: 'purple', name: 'סגול', say: 'סָגוֹל', hex: '#8e24aa', emoji: '🍇', obj: 'ענבים' },
  { id: 'pink', name: 'ורוד', say: 'וָרוֹד', hex: '#f48fb1', emoji: '🐷', obj: 'חזרזיר' },
  { id: 'brown', name: 'חום', say: 'חוּם', hex: '#795548', emoji: '🐻', obj: 'דוב' },
  { id: 'black', name: 'שחור', say: 'שָׁחוֹר', hex: '#212121', emoji: '🎩', obj: 'כובע' },
  { id: 'white', name: 'לבן', say: 'לָבָן', hex: '#ffffff', emoji: '⛄', obj: 'איש שלג' },
]

// "Find something …" ideas for around the house — everyday things, no shopping needed.
const HUNT = [
  ['red', 'עגבנייה, גרב, כדור, כוס פלסטיק'],
  ['blue', 'ג׳ינס, כוס, קובייה, כרית'],
  ['yellow', 'בננה, ספוג, כפית, מדבקה'],
  ['green', 'מלפפון, עלה, חולצה, צעצוע'],
  ['orange', 'גזר, תפוז, כובע, קובייה'],
  ['purple', 'ענבים, גרב, עיפרון, צעיף'],
  ['pink', 'מברשת שיניים, חולצה, ציור, גומייה'],
  ['brown', 'כיסא עץ, קקאו, נעל, דובי'],
  ['black', 'נעל, טלפון כבוי, כיפה, מחברת'],
  ['white', 'חלב, קיר, גרב, צלחת'],
]

const RHYME = [
  'תפוח אדום, מנדרינה כתום,',
  'לדוב הגדול פרווה בצבע חום.',
  'ים גדול וכחול,',
  'ענב קטן וסגול.',
  'שמש צהובה ועשב ירוק,',
  'חזרזיר ורוד — ואיזה צחוק!',
  'חתול שחור, ענן לבן,',
  'עשרה צבעים — כמה יפים כאן!',
]

const FAQ = [
  { q: 'באיזה גיל ילדים לומדים צבעים?', a: 'אין גיל אחד קבוע. הרבה ילדים בני שנתיים מצביעים על צבע כששואלים אותם, ובגיל שלוש־ארבע רובם מצליחים גם לומר את השם. בלבול בין צבעים דומים, כמו ורוד וסגול או כחול וירוק, מאוד נפוץ ולא מצביע על בעיה. מי שמודאג — אפשר לשאול את רופא הילדים.' },
  { q: 'מאילו צבעים כדאי להתחיל?', a: 'מתחילים בשניים או שלושה צבעים בולטים שונים זה מזה — אדום, כחול וצהוב — ורק כשהם מוכרים מוסיפים עוד. עשרת הצבעים בעמוד הם יעד לטווח של חודשים, לא של יום אחד.' },
  { q: 'איך לומדים צבעים בלי מסך?', a: 'דרך חיים רגילים: "תביא לי את הגרב הכחול", מיון קוביות לקערות, הליכה בחוץ וחיפוש עלים ירוקים, ובישול ביחד — עגבנייה אדומה, מלפפון ירוק. בעמוד יש גם רעיונות לחיפוש בבית ודף מיון להדפסה.' },
  { q: 'ילד שלי מתבלבל בין צבעים, מה עושים?', a: 'ממשיכים לשחק בלי לתקן בכוח. אומרים את השם הנכון בנעימות ("זה ורוד, ולידו הסגול") וחוזרים לצבע שוב בימים הבאים. רוב הילדים מסתדרים עם הזמן, והלחץ רק מעכב.' },
  { q: 'אפשר להדפיס כרטיסיות צבעים?', a: 'כן. בעמוד יש שני דפים להדפסה: כרטיסיות צבעים (שישה כרטיסים בדף, עם צבע, מילה ותמונה) ודף מיון. אפשר להדפיס את הכרטיסיות גם בקווי מתאר בלבד, והילד צובע בעצמו.' },
]

function ColorCard({ c, active, onTap }) {
  return <button type="button" onClick={() => onTap(c)} aria-label={`${c.name} — לחצו כדי לשמוע`}
    className={`fam-card card-lift text-center ${active ? 'ring-4 ring-[var(--yellow)]' : ''}`} style={{ minHeight: 148 }}>
    <span className="block rounded-xl border-2 border-[var(--border)]" style={{ background: c.hex, height: 56 }} aria-hidden="true" />
    <span className="mt-2 block text-4xl" aria-hidden="true">{c.emoji}</span>
    <b className="block text-xl">{c.name}</b>
  </button>
}

// "מצאו את הצבע": three coloured objects, the child is asked for one colour. Nothing is lost on a
// wrong tap: the object just fades, the voice says to try again, and a right answer is celebrated.
const START = { target: 0, options: [0, 1, 2] }
function nextRound(prev) {
  const ids = COLORS.map((_, i) => i)
  const options = []
  while (options.length < 3) { const i = ids[Math.floor(Math.random() * ids.length)]; if (!options.includes(i)) options.push(i) }
  let target = options[Math.floor(Math.random() * 3)]
  if (target === prev && Math.random() < 0.7) target = options[(options.indexOf(target) + 1) % 3]
  return { target, options }
}

function FindColor() {
  const [round, setRound] = useState(START)
  const [tried, setTried] = useState([])
  const [won, setWon] = useState(false)
  const t = COLORS[round.target]
  const ask = () => speak(`תראו לי משהו ${t.name}`, 'he-IL', { say: `תַּרְאוּ לִי מַשֶּׁהוּ ${t.say}` })
  const pick = i => {
    if (won) return
    if (i === round.target) { setWon(true); speak('כל הכבוד!', 'he-IL') }
    else { setTried(x => [...x, i]); speak('כמעט! נסו עוד פעם', 'he-IL') }
  }
  const next = () => { const r = nextRound(round.target); setRound(r); setTried([]); setWon(false); speak(`תראו לי משהו ${COLORS[r.target].name}`, 'he-IL', { say: `תַּרְאוּ לִי מַשֶּׁהוּ ${COLORS[r.target].say}` }) }
  return <section className="ln-box mt-10" aria-labelledby="col-game">
    <h2 id="col-game" className="text-center text-2xl font-black">🎯 מצאו את הצבע</h2>
    <p className="mt-1 text-center">מבוגר לידם ושואל, והילדים מצביעים: איזה דבר פה הוא {t.name}?</p>
    <div className="mt-3 flex items-center justify-center gap-3">
      <span className="inline-block h-14 w-14 rounded-full border-2 border-[var(--border)]" style={{ background: t.hex }} aria-hidden="true" />
      <b className="text-2xl">מצאו משהו {t.name}</b>
      <button type="button" onClick={ask} aria-label="שמיעת השאלה" className="min-h-[44px] min-w-[44px] rounded-full border-2 border-[var(--border)] bg-white text-2xl">🔊</button>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-3">{round.options.map(i => <button key={i} type="button" onClick={() => pick(i)} aria-label={COLORS[i].obj}
      className="fam-card card-lift text-center" style={{ minHeight: 110, opacity: tried.includes(i) ? 0.35 : 1 }}>
      <span className="text-6xl" aria-hidden="true">{COLORS[i].emoji}</span>
    </button>)}</div>
    <p role="status" aria-live="polite" className="mt-3 min-h-[2rem] text-center text-xl font-bold">
      {won ? `🎉 כל הכבוד! ${COLORS[round.target].obj} הוא ${t.name}.` : tried.length ? 'כמעט! נסו עוד פעם 🙂' : ''}
    </p>
    <div className="text-center"><button type="button" onClick={next} className="min-h-[48px] rounded-2xl border-2 border-[var(--border)] bg-[var(--yellow)] px-6 text-lg font-bold">{won ? 'עוד סיבוב ▶' : 'צבע אחר ▶'}</button></div>
  </section>
}

// ── printables (200 × 270 SVG sheets) ──
function Card({ x, y, c, outline }) {
  const w = 94, h = 84
  return <g transform={`translate(${x} ${y})`}>
    <rect x="0" y="0" width={w} height={h} rx="5" fill="#fff" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="3 2" />
    {c ? <>
      <rect x="6" y="6" width={w - 12} height="34" rx="4" fill={outline ? '#fff' : c.hex} stroke={c.id === 'white' || outline ? '#334155' : c.hex} strokeWidth={outline ? 1.1 : .8} />
      <text x={w / 2} y="62" fontSize="22" textAnchor="middle">{c.emoji}</text>
      <T x={w / 2} y="78" size="14" weight={800}>{c.name}</T>
    </> : <>
      <rect x="6" y="6" width={w - 12} height="34" rx="4" fill="#fff" stroke="#334155" strokeWidth="1.1" strokeDasharray="1.5 1.5" />
      <T x={w / 2} y="62" size="5" fill="#777">כרטיס משלכם: צובעים וכותבים</T>
      <line x1="22" y1="76" x2="72" y2="76" stroke="#334155" strokeWidth=".4" />
    </>}
  </g>
}

function cardsPage(list, outline) {
  const slots = [...list, ...Array(6 - list.length).fill(null)]
  const pos = [[102, 6], [4, 6], [102, 94], [4, 94], [102, 182], [4, 182]]
  return <Sheet label="כרטיסיות צבעים לפעוטות">
    {slots.map((c, i) => <Card key={i} x={pos[i][0]} y={pos[i][1]} c={c} outline={outline} />)}
    <T x={100} y={271} size={3.3} fill="#888">✂️ גוזרים לאורך הקו המקווקו · עוגה בוגה</T>
  </Sheet>
}

// Sorting mat: 4 big coloured "bowls" to put real objects on, plus 12 small cut-out objects (3 per colour) to paste.
function sortSheet(set, outline) {
  const mats = set === 'more' ? COLORS.slice(4, 8) : COLORS.slice(0, 4)
  const pos = [[102, 14], [4, 14], [102, 84], [4, 84]]
  return <Sheet label="דף מיון צבעים">
    <T x={100} y={9} size={7.5} weight={800}>מיון צבעים — כל דבר למקום שלו</T>
    {mats.map((c, i) => <g key={c.id} transform={`translate(${pos[i][0]} ${pos[i][1]})`}>
      <rect x="0" y="0" width="94" height="64" rx="8" fill={outline ? '#fff' : c.hex} fillOpacity={outline ? 1 : .85} stroke="#334155" strokeWidth="1" />
      <rect x="22" y="40" width="50" height="17" rx="8" fill="#fff" />
      <T x="47" y="52.5" size="11" weight={800}>{c.name}</T>
    </g>)}
    <T x={100} y={160} size={4.2} fill="#555">גוזרים את הציורים ומדביקים כל אחד על הצבע שלו (או מניחים חפצים אמיתיים על הצבעים)</T>
    <line x1="4" y1="164" x2="196" y2="164" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="3 2" />
    {mats.flatMap((c, k) => [0, 1, 2].map(j => ({ c, n: k * 3 + j }))).map(({ c, n }) => {
      const col = n % 4, row = Math.floor(n / 4), cx = 195 - col * 48 - 24, cy = 170 + row * 30
      return <g key={n}>
        <rect x={cx - 21} y={cy} width="42" height="27" rx="4" fill="#fff" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="2 1.5" />
        <text x={cx} y={cy + 19} fontSize="17" textAnchor="middle">{c.emoji}</text>
      </g>
    })}
    <T x={100} y={271} size={3.3} fill="#888">עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

export default function ToddlerColors() {
  const [active, setActive] = useState(null)
  const [outline, setOutline] = useState('full')
  const [set, setSet] = useState('basic')
  const [print, setPrint] = useState(null)
  const tap = c => { setActive(c.id); speak(c.name, 'he-IL', { say: c.say }) }
  const o = outline === 'line'
  const page1 = cardsPage(COLORS.slice(0, 6), o), page2 = cardsPage(COLORS.slice(6), o)
  const sort = sortSheet(set, o)
  const btn = 'min-h-[52px] rounded-2xl border-2 border-[var(--border)] px-5 text-lg font-bold'
  const art = (key, svg) => <article className="buga-a4" key={key}><div className="print-art">{svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="צבעים בעברית לפעוטות — משחק, כרטיסיות להדפסה ושיר" description="לומדים צבעים בעברית לגיל 2–4: עשרה צבעים עם הקראה בלחיצה, משחק ״מצאו את הצבע״, חיפוש צבעים בבית, מיון צבעים, שיר מקורי וכרטיסיות צבעים להדפסה. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'פעילויות לפעוטות', href: '/toddlers' }, { label: 'צבעים' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🎨</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">צבעים בעברית לפעוטות</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">עשרה צבעים, משחק קצר, חיפוש בבית ושיר — לגילאי 2–4, עם מבוגר לידם</p>
    </header>

    <section className="mt-8" aria-labelledby="col-cards">
      <h2 id="col-cards" className="mb-1 text-center text-2xl font-black">🔊 לוחצים ושומעים</h2>
      <p className="mb-4 text-center">לוחצים על צבע ושומעים את השם. מתחילים בשניים־שלושה צבעים ורק אחר כך מוסיפים.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{COLORS.map(c => <ColorCard key={c.id} c={c} active={active === c.id} onTap={tap} />)}</div>
    </section>

    <FindColor />

    <section className="mt-10" aria-labelledby="col-hunt">
      <h2 id="col-hunt" className="mb-1 text-center text-2xl font-black">🏠 צבע החיפוש בבית</h2>
      <p className="mb-4 text-center">אומרים צבע, והילדים רצים (או זוחלים) למצוא משהו בצבע הזה. כשמצאו — אומרים יחד את השם: ״זה אדום!״</p>
      <div className="grid gap-3 sm:grid-cols-2">{HUNT.map(([id, ideas]) => { const c = COLORS.find(x => x.id === id); return <div key={id} className="fam-card flex items-center gap-3">
        <span className="inline-block h-10 w-10 shrink-0 rounded-full border-2 border-[var(--border)]" style={{ background: c.hex }} aria-hidden="true" />
        <p className="m-0 leading-relaxed"><b>{c.name}:</b> {ideas}</p>
      </div> })}</div>
    </section>

    <section className="ln-box mt-10" aria-labelledby="col-sort">
      <h2 id="col-sort" className="text-2xl font-black">🧺 משחק מיון צבעים</h2>
      <ol className="list-decimal space-y-2 pr-6 leading-relaxed">
        <li>מכינים שתי קערות או שני דפים בשני צבעים, למשל אדום וכחול.</li>
        <li>נותנים לילד חפצים אחד אחד — קוביות, גרביים, כפות מטבח, כובעי בקבוקים — והוא מניח כל אחד במקום.</li>
        <li>כשזה קל, מוסיפים צבע שלישי, ואחר כך רביעי. אפשר גם למיין בגדים נקיים מהכביסה.</li>
        <li>טעות? אומרים ״זה כחול, בוא נניח אותו אצל הכחולים״, וממשיכים. אין ניקוד ואין הפסד.</li>
      </ol>
      <p><b>שימו לב:</b> חפצים קטנים (חרוזים, פומפונים, כפתורים) לא מתאימים לילדים שעדיין מכניסים הכול לפה. בוחרים חפצים גדולים ונשארים לידם.</p>
    </section>

    <section className="mt-10 text-center" aria-labelledby="col-rhyme">
      <h2 id="col-rhyme" className="mb-3 text-2xl font-black">🎵 חרוזים על צבעים</h2>
      <div className="mx-auto max-w-md rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5 text-xl leading-loose">
        {RHYME.map((l, i) => <p key={i} className={`m-0 ${i % 2 && i < 7 ? 'mb-3' : ''}`}>{l}</p>)}
      </div>
      <p className="mt-3">אומרים בקצב, ובכל צבע מצביעים על משהו בחדר. הילדים יכולים להשלים את המילה האחרונה בכל שורה.</p>
    </section>

    <section className="ln-box mt-10" aria-labelledby="col-print">
      <h2 id="col-print" className="text-2xl font-black">🖨️ כרטיסיות צבעים ודף מיון להדפסה</h2>
      <p>שישה כרטיסים בכל דף A4 — צבע, מילה ותמונה — ואחרי העשרה נשארו שני כרטיסים ריקים לצבע משלכם. דף המיון כולל ארבע משבצות צבע ושנים עשר ציורים לגזירה.</p>
      <div className="space-y-3">
        <Choice label="סגנון" value={outline} onChange={setOutline} options={[['full', 'צבעוני'], ['line', 'קווי מתאר — הילד צובע']]} />
        <Choice label="צבעים בדף המיון" value={set} onChange={setSet} options={[['basic', 'אדום כחול צהוב ירוק'], ['more', 'כתום סגול ורוד חום']]} />
      </div>
      <div className="mt-4 grid items-start gap-4 sm:grid-cols-3">
        {[['cards', page1, 'כרטיסיות — דף 1'], ['cards2', page2, 'כרטיסיות — דף 2'], ['sort', sort, 'דף מיון']].map(([k, svg, label]) =>
          <button key={k} type="button" onClick={() => setPrint(k === 'sort' ? 'sort' : 'cards')} aria-label={`הדפסה: ${label}`} className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm">{svg}<span className="block font-bold">{label}</span></button>)}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button data-print-main type="button" onClick={() => setPrint('cards')} className={`${btn} bg-blue-700 text-white`}>🖨️ כרטיסיות (2 דפים)</button>
        <button type="button" onClick={() => setPrint('sort')} className={`${btn} bg-white`}>🖨️ דף מיון</button>
      </div>
    </section>
    {print && <PrintPreview title={print === 'sort' ? 'דף מיון צבעים' : 'כרטיסיות צבעים'} onClose={() => setPrint(null)}>
      {print === 'sort' ? art('sort', sort) : [art('c1', page1), art('c2', page2)]}
    </PrintPreview>}

    <section className="mt-10" aria-labelledby="col-tips">
      <h2 id="col-tips" className="mb-4 text-center text-2xl font-black">💡 טיפים להורים</h2>
      <div className="grid gap-3 sm:grid-cols-2">{[
        ['🐢', 'בלי לחץ על גיל', 'ילדים מתפתחים בקצב שלהם. בגיל שנתיים לרבים מספיק להצביע על צבע כששואלים; לומר את השם בעצמם בא לעיתים מאוחר יותר.'],
        ['🗣️', 'מדברים על צבעים בחיים', '״נעליים כחולות!״, ״תפוח אדום!״. שם הצבע שנאמר בנעימות באמצע היום עובד יותר מתרגול מסודר.'],
        ['🎯', 'צבע אחד בכל פעם', 'מתחילים בשניים־שלושה צבעים שונים מאוד זה מזה (אדום, כחול, צהוב). צבעים דומים, כמו ורוד וסגול, יכולים לחכות.'],
        ['🙂', 'טעויות הן חלק מהמשחק', 'מתקנים בעדינות, חוזרים על השם הנכון, ולא מבקשים ״עוד פעם״ שוב ושוב.'],
        ['📱', 'מסך בקטנה, ועם מישהו לידם', 'המשחק בעמוד קצר ובלי הפסד, אבל הלמידה הכי טובה היא עם מבוגר שמדבר ומצביע יחד עם הילד.'],
      ].map(([e, t, tx]) => <div key={t} className="fam-card"><h3 className="text-lg font-bold"><span aria-hidden="true">{e} </span>{t}</h3><p className="m-0 leading-relaxed">{tx}</p></div>)}</div>
    </section>

    <p className="mt-8 text-center text-lg">עוד ללמוד ולשחק: <Link className="font-bold underline" to="/toddlers/buga-games">משחקים לפעוטות עם בוגה</Link> · <Link className="font-bold underline" to="/english/colors">צבעים באנגלית</Link> · <Link className="font-bold underline" to="/toddlers">פעילויות לפעוטות</Link></p>

    <div className="mt-10"><SeoBody paragraphs={[
      'צבעים הם אחד הנושאים הראשונים שהורים רוצים ללמד, והם גם אחד הכיפיים: הכול סביבנו צבעוני. בעמוד הזה עשרה צבעי יסוד — אדום, כחול, צהוב, ירוק, כתום, סגול, ורוד, חום, שחור ולבן — עם הקראה בלחיצה, כדי שהילד ישמע את המילה ויראה את הצבע בו־זמנית.',
      'הלמידה הטובה ביותר היא פעילה: משחק ״מצאו את הצבע״, חיפוש בבית, מיון חפצים לקערות ושיר קצר שאפשר לחזור עליו. כרטיסיות הצבעים וגיליון המיון להדפסה מאפשרים להמשיך גם בלי מסך, בגן או בבית.',
    ]} faq={FAQ} related={[{ label: 'משחקים לפעוטות עם בוגה', href: '/toddlers/buga-games' }, { label: 'צבעים באנגלית', href: '/english/colors' }, { label: 'פעילויות לפעוטות', href: '/toddlers' }]} /></div>
  </div>
}

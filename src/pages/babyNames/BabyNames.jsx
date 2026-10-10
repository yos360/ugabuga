import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../NotFound'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import {
  BABY_NAMES, GENDERS, LETTERS, LETTER_NAMES, ORIGIN_FILTERS, POPULAR_NOTE, LETTER_PAGE_MIN,
  filterNames, sortNames, lettersWithNames, letterPagePath, letterFromSlug, namePath, nameBySlug, nameLength,
  genderText, similarNames, nameTitle, nameDescription, nameFaq, favoritesShareText, firstLetter,
} from '../../data/babyNames'
import '../../learn/learn.css'
import './babyNames.css'

const HUB = { label: 'שמות לתינוקות', href: '/baby-names' }
const FAV_KEY = 'ugabuga-baby-names-favs' // per-viewer convenience only
const FILTER_TAGS = ['תנ"כי', 'קצר', 'פופולרי', 'קלאסי', 'מודרני', 'טבע']
const RELATED = [
  { label: 'מחשבון תאריך לידה משוער', href: '/tools/due-date' },
  { label: 'סיפורים לפני השינה', href: '/stories' },
  { label: 'רעיונות ליום הולדת', href: '/birthday' },
]

// ── favourites (localStorage, per viewer) ──
function readFavs() {
  try { const v = JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); return Array.isArray(v) ? v.filter(s => nameBySlug(s)) : [] } catch { return [] }
}
function writeFavs(list) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)) } catch { /* storage blocked */ }
}
function useFavorites() {
  const [favs, setFavs] = useState(readFavs)
  const toggle = slug => setFavs(prev => {
    const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    writeFavs(next)
    return next
  })
  const clear = () => { setFavs([]); writeFavs([]) }
  return { favs, toggle, clear }
}

const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
const genderBadge = g => g === 'f' ? '👧 בת' : g === 'm' ? '👦 בן' : '🧒 בן או בת'

function NameCard({ n, fav, onFav, picked }) {
  return <article className={`bn-card is-${n.gender} ${picked ? 'is-picked' : ''}`}>
    <button type="button" className="bn-heart" aria-pressed={fav} aria-label={fav ? `הסרת ${n.name} מהרשימה` : `שמירת ${n.name} לרשימה`} onClick={() => onFav(n.slug)}>{fav ? '❤️' : '🤍'}</button>
    <h3><Link to={namePath(n)}>{n.name}</Link></h3>
    <div className="bn-en" lang="en">{n.en}</div>
    <p className="bn-meaning">{n.meaning}</p>
    <div className="bn-badges">
      <span className="bn-badge">{genderBadge(n.gender)}</span>
      <span className="bn-badge">{n.origin}</span>
      {n.tags.filter(t => t !== n.origin).map(t => <span key={t} className={`bn-badge ${t === 'פופולרי' ? 'pop' : ''}`}>{t}</span>)}
    </div>
  </article>
}

function FavoritesPanel({ favs, toggle, clear }) {
  const names = favs.map(nameBySlug).filter(Boolean)
  const share = () => shareOnWhatsApp(favoritesShareText(names, shareLink('/baby-names', 'baby-names-favorites')))
  return <section className="bn-fav mt-6" aria-labelledby="bn-fav-h">
    <h2 id="bn-fav-h" className="text-xl font-black">❤️ הרשימה שלנו {names.length > 0 && `(${names.length})`}</h2>
    {names.length === 0
      ? <p className="m-0 mt-1">לוחצים על 🤍 ליד שם שאהבתם — והוא נשמר כאן. אחר כך אפשר לשלוח את הרשימה בוואטסאפ לבן או לבת הזוג, לסבא ולסבתא.</p>
      : <>
        <div className="bn-fav-list">{names.map(n => <span key={n.slug} className="bn-fav-item"><Link to={namePath(n)}>{n.name}</Link><button type="button" aria-label={`הסרת ${n.name}`} onClick={() => toggle(n.slug)}>✕</button></span>)}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="ln-btn" onClick={share}>💬 שליחת הרשימה בוואטסאפ</button>
          <button type="button" className="ln-chip" onClick={clear}>ניקוי הרשימה</button>
        </div>
      </>}
    <small className="mt-2 block opacity-75">הרשימה נשמרת רק בדפדפן שלכם.</small>
  </section>
}

// Search + letter chips + filters + random pick + results. `gender` limits the pool; `letter` fixes the letter.
function NameBrowser({ gender = '', letter: fixedLetter = '', fav }) {
  const [params] = useSearchParams()
  const [q, setQ] = useState(() => params.get('q') || '')
  const [letter, setLetter] = useState(() => fixedLetter || firstLetter(params.get('letter') || ''))
  const [origin, setOrigin] = useState('')
  const [tag, setTag] = useState('')
  const [picked, setPicked] = useState('')
  const pool = useMemo(() => filterNames(BABY_NAMES, { gender }), [gender])
  const usedLetters = useMemo(() => new Set(pool.map(n => n.letter)), [pool])
  const list = useMemo(() => sortNames(filterNames(pool, { letter, origin, tag, q })), [pool, letter, origin, tag, q])
  const pickedName = picked ? list.find(n => n.slug === picked) : null
  const shown = pickedName ? [pickedName, ...list.filter(n => n !== pickedName)] : list
  const anyFilter = q || (!fixedLetter && letter) || origin || tag
  const reset = () => { setQ(''); if (!fixedLetter) setLetter(''); setOrigin(''); setTag(''); setPicked('') }
  const random = () => {
    const from = list.length ? list : filterNames(pool, { letter: fixedLetter })
    const choices = from.length > 1 ? from.filter(n => n.slug !== picked) : from
    const n = choices[Math.floor(Math.random() * choices.length)]
    if (!n) return
    if (!list.includes(n)) reset()
    setPicked(n.slug)
  }

  return <section aria-label="חיפוש שמות">
    <div className="ln-box space-y-3 text-center">
      <label htmlFor="bn-q" className="block text-lg font-bold">🔎 חיפוש שם או משמעות</label>
      <input id="bn-q" className="bn-input" type="search" value={q} placeholder="למשל: נועה, אור, פרח…" onChange={e => { setQ(e.target.value); setPicked('') }} />
      {!fixedLetter && <div className="bn-letters" role="group" aria-label="אות ראשונה">
        <Chip on={!letter} onClick={() => { setLetter(''); setPicked('') }}>הכול</Chip>
        {LETTERS.map(l => <Chip key={l} on={letter === l} disabled={!usedLetters.has(l)} aria-label={`שמות באות ${l}`} onClick={() => { setLetter(letter === l ? '' : l); setPicked('') }}>{l}</Chip>)}
      </div>}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="סינון">
        {ORIGIN_FILTERS.map(o => <Chip key={o.id} on={origin === o.id} onClick={() => { setOrigin(origin === o.id ? '' : o.id); setPicked('') }}>{o.label}</Chip>)}
        {FILTER_TAGS.map(t => <Chip key={t} on={tag === t} onClick={() => { setTag(tag === t ? '' : t); setPicked('') }}>{t}</Chip>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn" onClick={random}>🎲 שם אקראי</button>
        {anyFilter && <button type="button" className="ln-chip" onClick={reset}>↺ ניקוי הסינון</button>}
      </div>
    </div>

    <FavoritesPanel {...fav} />

    <h2 className="mt-8 mb-4 text-center text-2xl font-black" aria-live="polite">{list.length ? `${list.length} שמות` : 'לא נמצאו שמות'}</h2>
    {list.length
      ? <div className="bn-grid">{shown.map(n => <NameCard key={n.slug} n={n} fav={fav.favs.includes(n.slug)} onFav={fav.toggle} picked={n.slug === picked} />)}</div>
      : <p className="text-center">אין שם שמתאים לכל הסינונים יחד. <button type="button" className="font-bold underline" onClick={reset}>הצגת כל השמות</button></p>}
  </section>
}

function LetterLinks({ gender, current }) {
  const letters = lettersWithNames(gender, LETTER_PAGE_MIN)
  return <nav className="mt-8 text-center" aria-label={`${GENDERS[gender].title} לפי אות`}>
    <h2 className="mb-3 text-xl font-black">{GENDERS[gender].title} לפי אות</h2>
    <div className="bn-letters">{letters.map(l => l === current
      ? <span key={l} className="ln-chip" aria-current="page" style={{ background: 'var(--yellow,#ffd23f)' }}>{l}</span>
      : <Link key={l} to={letterPagePath(gender, l)} className="ln-chip" aria-label={`${GENDERS[gender].title} באות ${l}`}>{l}</Link>)}</div>
  </nav>
}

const CHOOSING = [
  'בחירת שם לתינוק היא אחת ההחלטות הראשונות — והמרגשות — של ההורות. כדאי להתחיל ברשימה ארוכה: כל אחד מבני הזוג רושם שמות שהוא אוהב, בלי ביקורת, ורק אחר כך מצמצמים. עדיין מתלבטים? שמרו את המועמדים ב"❤️ שמרו לרשימה", ושלחו אותם בוואטסאפ למי שאתם רוצים לשתף.',
  'נסו לומר את השם בקול, יחד עם שם המשפחה: איך זה נשמע? האם יש צלילים שנבלעים, כמו שם שמסתיים באותו צליל שבו מתחיל שם המשפחה? בדקו גם את ראשי התיבות, ואיך השם נכתב באנגלית — זה שימושי בדרכון ובעתיד גם בכתובת מייל.',
  'המשמעות חשובה להורים רבים: שם עברי שנשען על מילה מוכרת (אור, טל, שקד), שם מקראי עם סיפור מאחוריו, או שם לועזי שנוח לבטא גם בחו"ל. במשפחות רבות נהוג לקרוא על שם סבא, סבתא או קרוב משפחה — לפעמים בשם המלא, ולפעמים בשם שמתחיל באותה אות או שומר על אותה משמעות. אין כאן נכון או לא נכון: זו החלטה של כל משפחה.',
  'עוד כמה שאלות שכדאי לשאול: האם השם נפוץ מאוד (ויהיו עוד שלושה כמוהו בגן) או נדיר? האם יש לו כינוי חיבה טבעי שאתם אוהבים? והאם הוא מתאים גם לתינוק וגם למבוגר? בכל כרטיס כאן מופיעים המשמעות, המקור והכתיב באנגלית, ולחיצה על השם פותחת עמוד מלא עם שמות דומים.',
]

const HUB_FAQ = [
  { q: 'איך בוחרים שם לתינוק?', a: 'מתחילים ברשימה ארוכה של שמות שאוהבים, אומרים כל שם בקול יחד עם שם המשפחה, בודקים ראשי תיבות וכתיב באנגלית, ומחפשים משמעות שמדברת אליכם. אפשר לשמור מועמדים ב"❤️ שמרו לרשימה" ולשלוח אותם לבן או לבת הזוג.' },
  { q: 'מהם השמות הנפוצים בישראל?', a: 'לפי נתוני הלשכה המרכזית לסטטיסטיקה על ילידי 2024, בין השמות הנפוצים ביותר בקרב תינוקות יהודים היו אביגיל, איילה, שרה ותמר לבנות, ודוד, לביא ואריאל לבנים. שמות אלה מסומנים כאן בתגית "פופולרי".' },
  { q: 'מה ההבדל בין שם עברי לשם תנ"כי?', a: 'שם תנ"כי הוא שם של דמות שמופיעה בתנ"ך, כמו רחל, דוד או נועה. שם עברי הוא שם שנשען על מילה עברית, כמו טל, שקד או ליאור — רבים מהם שמות מודרניים. בכל שם מקראי מופיע גם המקום בתנ"ך שבו הוא מוזכר.' },
  { q: 'מה זה שם יוניסקס?', a: 'שם שניתן גם לבנים וגם לבנות, כמו עדי, טל, נוי, שחר או אריאל. בישראל יש הרבה שמות כאלה, בעיקר שמות עבריים שנשענים על מילים מהטבע ומהיום־יום.' },
  { q: 'איפה נשמרת רשימת השמות שאהבתי?', a: 'רק בדפדפן שלכם, במכשיר שבו שמרתם. הרשימה לא נשלחת לשום מקום — אלא אם תבחרו לשלוח אותה בוואטסאפ.' },
]

// ── /baby-names ───────────────────────────────
export function BabyNamesHub() {
  const fav = useFavorites()
  const count = g => filterNames(BABY_NAMES, { gender: g }).length
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שמות לתינוקות — שמות לבנים ולבנות עם משמעות ומקור" description={`מאגר שמות לתינוקות: ${BABY_NAMES.length} שמות לבנות, לבנים ויוניסקס עם משמעות ומקור — עבריים, תנ"כיים ולועזיים. חיפוש לפי אות, שם אקראי ורשימה לשיתוף.`} path="/baby-names" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: HUB.label }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold text-[#1d2233]">{BABY_NAMES.length} שמות עם משמעות</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">👶 </span>שמות לתינוקות</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">שמות לבנות, שמות לבנים ושמות יוניסקס — עם המשמעות, המקור והכתיב באנגלית. מחפשים לפי אות, מסננים, שומרים את האהובים ושולחים את הרשימה בוואטסאפ.</p>
    </header>
    <nav className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3" aria-label="שמות לפי מין">
      {['f', 'm', 'u'].map(g => <Link key={g} to={GENDERS[g].path} className="ln-box card-lift text-center no-underline">
        <div className="text-4xl" aria-hidden="true">{GENDERS[g].emoji}</div>
        <div className="text-xl font-black">{GENDERS[g].title}</div>
        <div className="text-sm text-[var(--muted-foreground)]">{count(g)} שמות</div>
      </Link>)}
    </nav>
    <div className="mt-6"><NameBrowser fav={fav} /></div>
    <LetterLinks gender="f" />
    <LetterLinks gender="m" />
    <div className="mt-10"><SeoBody paragraphs={[...CHOOSING, `על הנתונים: המשמעויות נבדקו מול מקורות מקובלים — לשמות מקראיים מופיע המקום בתנ"ך, וכשמשמעות שנויה במחלוקת כתבנו זאת. התגית "פופולרי" מבוססת על נתוני הלמ"ס על ילידי 2024.`]} faq={HUB_FAQ} related={RELATED} /></div>
  </div>
}

// ── /baby-names/girls | boys | unisex ───────────────────────────────
const LIST_COPY = {
  f: {
    title: 'שמות לבנות — שמות יפים לבנות עם משמעות',
    lead: 'שמות לבנות עבריים, תנ"כיים ולועזיים — מאביגיל ועד תהילה, עם משמעות ומקור לכל שם. השמות היוניסקס מופיעים גם כאן.',
    body: ['רשימת שמות לבנות שנותנים בישראל היום, לצד שמות קלאסיים שחוזרים לאופנה. יש כאן שמות מקראיים כמו שרה, רחל, תמר ונועה, שמות עבריים מהטבע כמו איילה, שקד, כלנית ורקפת, ושמות בינלאומיים כמו מאיה, אלמה וסופיה.', 'לכל שם מופיעים המשמעות, המקור והכתיב באנגלית. אפשר לסנן לפי אות ראשונה, לבחור רק שמות קצרים או רק שמות תנ"כיים, ולשמור את האהובים לרשימה משותפת.'],
    faq: [
      { q: 'מהם השמות הנפוצים לבנות בישראל?', a: 'לפי נתוני הלמ"ס על ילידות 2024, השמות הנפוצים ביותר בקרב בנות יהודיות היו אביגיל, איילה ושרה, ואחריהן תמר, מאיה, אסתר, יעל, נועה, ליבי וחנה.' },
      { q: 'אילו שמות קצרים לבנות יש?', a: 'שמות בני שתיים או שלוש אותיות, כמו יעל, רות, מור, שיר, אלה, גלי ונוי. לחצו על הסינון "קצר" כדי לראות את כולם.' },
    ],
  },
  m: {
    title: 'שמות לבנים — שמות יפים לבנים עם משמעות',
    lead: 'שמות לבנים עבריים, תנ"כיים ולועזיים — מדוד ועד תומר, עם משמעות ומקור לכל שם. השמות היוניסקס מופיעים גם כאן.',
    body: ['רשימת שמות לבנים שנותנים בישראל היום, לצד שמות קלאסיים ומקראיים. יש כאן את שמות האבות והשבטים, שמות של נביאים ומלכים, שמות עבריים מהטבע כמו אלון, ארז ולביא, ושמות בינלאומיים כמו ליאם ואלכסנדר.', 'לכל שם מופיעים המשמעות, המקור והכתיב באנגלית, ולשמות מקראיים גם המקום בתנ"ך. אפשר לסנן לפי אות ראשונה, לבחור רק שמות קצרים או רק שמות תנ"כיים, ולשמור את האהובים לרשימה.'],
    faq: [
      { q: 'מהם השמות הנפוצים לבנים בישראל?', a: 'לפי נתוני הלמ"ס על ילידי 2024, השם הנפוץ ביותר בקרב בנים יהודים היה דוד, ואחריו לביא ואריאל. בעשירייה הראשונה היו גם רפאל, אורי, יוסף, ארי, משה, יהודה ואברהם.' },
      { q: 'אילו שמות קצרים לבנים יש?', a: 'שמות בני שתיים או שלוש אותיות, כמו דן, גד, בן, עוז, רון, ניר ודור. לחצו על הסינון "קצר" כדי לראות את כולם.' },
    ],
  },
  u: {
    title: 'שמות יוניסקס — שמות שמתאימים לבנים ולבנות',
    lead: 'שמות שנותנים גם לבנים וגם לבנות — טל, עדי, נוי, שחר, אריאל ועוד — עם משמעות ומקור.',
    body: ['שמות יוניסקס נפוצים מאוד בישראל, ורובם שמות עבריים שנשענים על מילים מהטבע ומהיום־יום: טל, שקד, מעיין, אגם, אביב וסתיו. יש גם שמות מקראיים שניתנים היום לשני המינים, כמו אריאל, יובל ויונה.', 'שם יוניסקס מתאים להורים שרוצים שם פשוט ועכשווי, או שמעדיפים לבחור שם עוד לפני שהם יודעים אם נולד בן או בת. לכל שם מופיעים המשמעות, המקור והכתיב באנגלית.'],
    faq: [
      { q: 'מהם שמות היוניסקס הנפוצים בישראל?', a: 'בין השמות שניתנים הרבה גם לבנים וגם לבנות: אריאל, אורי, עדי, טל, נוי, שחר, ליאור ועמית. לפי נתוני הלמ"ס על ילידי 2024, השם אריאל ניתן לכ־1,500 בנים ולכ־600 בנות.' },
      { q: 'האם יש שמות תנ"כיים יוניסקס?', a: 'כן. יובל, יונה, אביה ואוריה מופיעים בתנ"ך, ובישראל של היום נותנים אותם גם לבנים וגם לבנות.' },
    ],
  },
}

export function BabyNamesList({ gender = 'f' }) {
  const fav = useFavorites()
  const g = GENDERS[gender] || GENDERS.f
  const copy = LIST_COPY[g.id]
  const total = filterNames(BABY_NAMES, { gender: g.id }).length
  const others = ['f', 'm', 'u'].filter(x => x !== g.id).map(x => ({ label: GENDERS[x].title, href: GENDERS[x].path }))
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={copy.title} description={`${copy.lead.split(' — ')[0]}: ${total} שמות עם משמעות, מקור וכתיב באנגלית. חיפוש לפי אות, שם אקראי ורשימת מועדפים לשליחה בוואטסאפ.`} path={g.path} structuredData={faqSchema(copy.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: g.title }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold text-[#1d2233]">{total} שמות עם משמעות</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{g.emoji} </span>{g.title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{copy.lead}</p>
    </header>
    <div className="mt-6"><NameBrowser gender={g.id} fav={fav} /></div>
    {g.id !== 'u' && <LetterLinks gender={g.id} />}
    <div className="mt-10"><SeoBody paragraphs={[...copy.body, ...CHOOSING.slice(1, 3)]} faq={copy.faq} related={[HUB, ...others, ...RELATED]} /></div>
  </div>
}

// ── /baby-names/girls/letter/:letter ───────────────────────────────
export function BabyNamesLetter({ gender = 'f' }) {
  const { letter: slug } = useParams()
  const fav = useFavorites()
  const g = GENDERS[gender] || GENDERS.f
  const letter = letterFromSlug(slug)
  const names = letter ? sortNames(filterNames(BABY_NAMES, { gender: g.id, letter })) : []
  if (names.length < LETTER_PAGE_MIN) return <NotFound />
  const heading = `${g.title} באות ${letter}`
  const short = names.filter(n => n.tags.includes('קצר')).map(n => n.name)
  const bible = names.filter(n => n.origin === 'תנ"כי').map(n => n.name)
  const sample = names.slice(0, 5).map(n => n.name).join(', ')
  const faq = [
    { q: `אילו ${g.title} מתחילים באות ${letter}?`, a: `ברשימה יש ${names.length} שמות באות ${letter}, ביניהם ${sample}. לכל שם מופיעים המשמעות והמקור.` },
    bible.length
      ? { q: `אילו ${g.title} תנ"כיים יש באות ${letter}?`, a: `${bible.slice(0, 8).join(', ')}. ליד כל שם מקראי מופיע המקום בתנ"ך שבו הוא מוזכר.` }
      : { q: `אילו ${g.title} קצרים יש באות ${letter}?`, a: short.length ? `${short.join(', ')}.` : `באות ${letter} רוב השמות ברשימה ארוכים משלוש אותיות.` },
  ]
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${heading} — ${names.length} שמות עם משמעות`} description={`${heading}: ${sample} ועוד — ${names.length} שמות עם משמעות, מקור וכתיב באנגלית. שומרים את האהובים לרשימה ושולחים בוואטסאפ.`} path={letterPagePath(g.id, letter)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: g.title, href: g.path }, { label: `האות ${letter}` }]} />
    <header className="text-center">
      <div className="bn-hero-name" aria-hidden="true">{letter}</div>
      <h1 className="mt-3 text-4xl sm:text-5xl">{heading}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{names.length} {g.title} שמתחילים באות {LETTER_NAMES[letter]}, עם המשמעות והמקור של כל שם.</p>
    </header>
    <div className="mt-6"><NameBrowser key={letter} gender={g.id} letter={letter} fav={fav} /></div>
    <LetterLinks gender={g.id} current={letter} />
    <div className="mt-10"><SeoBody paragraphs={[
      `כאן תמצאו ${g.title} באות ${letter}: ${names.map(n => n.name).join(', ')}. לחיצה על שם פותחת עמוד עם המשמעות המלאה, המקור, הכתיב באנגלית ושמות דומים.`,
      `יש משפחות שבוחרות שם שמתחיל באות מסוימת — למשל על שם סבא או סבתא — בלי לתת בדיוק את אותו השם. ${bible.length ? `באות ${letter} יש גם שמות מקראיים, כמו ${bible.slice(0, 4).join(', ')}.` : ''} ${short.length ? `ואם אתם מחפשים שם קצר: ${short.slice(0, 5).join(', ')}.` : ''}`.replace(/\s+/g, ' ').trim(),
      CHOOSING[1],
    ]} faq={faq} related={[{ label: g.title, href: g.path }, HUB, ...RELATED.slice(0, 2)]} /></div>
  </div>
}

// ── /baby-names/name/:slug ───────────────────────────────
const ORIGIN_TEXT = {
  'תנ"כי': n => `${n.name} הוא שם מקראי${n.source ? ` — הוא מופיע בתנ"ך (${n.source})` : ''}, ולכן הוא מוכר בכל העדות ובכל הדורות.`,
  'עברי': n => `${n.name} הוא שם עברי שנשען על מילה או צירוף מילים בעברית, ולכן המשמעות שלו ברורה לכל דובר עברית.${n.source ? ` השם או המילה מופיעים גם בתנ"ך (${n.source}).` : ''}`,
  'ארמי': n => `${n.name} הוא שם שמקורו בארמית — השפה שבה נכתבו התלמוד וחלקים מספרי דניאל ועזרא.`,
  'לועזי': n => `${n.name} הוא שם ממקור לועזי שהשתרש גם בישראל; קל לבטא אותו גם בחו"ל.`,
  'יידיש': n => `${n.name} הוא שם ממקור יידיש, שפתם של יהודי מזרח אירופה, ונפוץ במשפחות רבות כשם על שם סבתא או סבתא רבתא.`,
}

export function BabyNamePage() {
  const { slug } = useParams()
  const n = nameBySlug(slug)
  const fav = useFavorites()
  if (!n) return <NotFound />
  const isFav = fav.favs.includes(n.slug)
  const similar = similarNames(n, 6)
  const faq = nameFaq(n)
  const len = nameLength(n.name)
  const listG = n.gender === 'u' ? 'u' : n.gender
  const letterPage = n.gender !== 'u' && lettersWithNames(n.gender, LETTER_PAGE_MIN).includes(n.letter) ? letterPagePath(n.gender, n.letter) : ''
  const share = () => shareOnWhatsApp(`משמעות השם ${n.name}: ${n.meaning}\n${shareLink(namePath(n), 'baby-name')}`)
  const facts = [
    ['מקור', n.origin],
    ['מתאים ל', n.gender === 'f' ? 'בנות' : n.gender === 'm' ? 'בנים' : 'בנים ובנות'],
    ['אות ראשונה', `${n.letter} (${LETTER_NAMES[n.letter]})`],
    ['מספר אותיות', String(len)],
    ['באנגלית', n.en],
    ...(n.source ? [['בתנ"ך', n.source]] : []),
  ]
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={nameTitle(n)} description={nameDescription(n)} path={namePath(n)} type="article" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: GENDERS[listG].title, href: GENDERS[listG].path }, { label: n.name }]} />
    <header className="text-center">
      <div className="bn-hero-name">{n.name}</div>
      <div className="bn-en mt-1 text-center text-lg" style={{ textAlign: 'center' }} lang="en">{n.en}</div>
      <h1 className="mt-3 text-3xl sm:text-4xl">משמעות השם {n.name}</h1>
    </header>

    <section className="ln-box mx-auto mt-6 max-w-2xl text-center" aria-label="המשמעות">
      <p className="m-0 text-xl leading-relaxed">{n.meaning}</p>
      {n.tags.includes('פופולרי') && <p className="m-0 mt-3 text-sm">⭐ {POPULAR_NOTE}.</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn" aria-pressed={isFav} onClick={() => fav.toggle(n.slug)}>{isFav ? '❤️ נשמר ברשימה' : '🤍 שמרו לרשימה'}</button>
        <button type="button" className="ln-chip" onClick={share}>💬 שליחה בוואטסאפ</button>
      </div>
    </section>

    <section className="mt-6" aria-labelledby="bn-facts-h">
      <h2 id="bn-facts-h" className="mb-3 text-2xl font-black">השם {n.name} במבט מהיר</h2>
      <div className="bn-facts">{facts.map(([k, v]) => <div key={k} className="bn-fact"><b>{k}</b><span>{v}</span></div>)}</div>
    </section>

    <section className="mt-8 space-y-3" aria-labelledby="bn-about-h">
      <h2 id="bn-about-h" className="text-2xl font-black">על השם {n.name}</h2>
      <p>{(ORIGIN_TEXT[n.origin] || ORIGIN_TEXT['עברי'])(n)}</p>
      <p>{n.name} — {genderText(n.gender)}. השם מתחיל באות {LETTER_NAMES[n.letter]} ויש בו {len} אותיות{len <= 3 ? ' — שם קצר שקל לומר, לאיית ולקרוא בקול רם בגן' : ''}. באנגלית נהוג לכתוב אותו {n.en}{n.tags.includes('קלאסי') ? '; זה שם קלאסי שעובר מדור לדור' : n.tags.includes('מודרני') ? '; זה שם עכשווי שנעשה נפוץ בעשורים האחרונים' : ''}.</p>
      <p>לפני שמחליטים, כדאי לומר את השם בקול יחד עם שם המשפחה, לבדוק את ראשי התיבות ואת הכתיב באנגלית, ולשמוע איך הוא נשמע כשקוראים לילד או לילדה מהצד השני של הגן.</p>
    </section>

    <section className="mt-8" aria-labelledby="bn-sim-h">
      <h2 id="bn-sim-h" className="mb-4 text-2xl font-black">שמות דומים ל{n.name}</h2>
      <div className="bn-grid">{similar.map(s => <NameCard key={s.slug} n={s} fav={fav.favs.includes(s.slug)} onFav={fav.toggle} />)}</div>
      <p className="mt-4 text-center">
        <Link to={GENDERS[listG].path} className="font-bold underline">לכל ה{GENDERS[listG].title} ←</Link>
        {letterPage && <> · <Link to={letterPage} className="font-bold underline">{GENDERS[n.gender].title} באות {n.letter}</Link></>}
      </p>
    </section>

    <FavoritesPanel {...fav} />

    <div className="mt-10"><SeoBody faq={faq} related={[HUB, { label: GENDERS[listG].title, href: GENDERS[listG].path }, ...RELATED]} /></div>
  </div>
}

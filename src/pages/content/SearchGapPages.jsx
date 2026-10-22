import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../NotFound'
import InvitationStudio from '../../components/invitations/InvitationStudio'

// Pages added from Google search demand (Keyword Planner): card-game rules, baby names by meaning,
// and bar/bat mitzvah invitations. Data is loaded per page.
const Page = ({ children }) => <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const useData = load => { const [d, setD] = useState(null); useEffect(() => { let on = true; load().then(m => { if (on) setD(m) }); return () => { on = false } }, [load]); return d }
const loadCards = () => import('../../data/cardGames.js')
const loadThemes = () => Promise.all([import('../../data/babyNameThemes.js'), import('../../data/babyNames.js')]).then(([t, n]) => ({ ...t, ...n }))
const Loading = () => <p role="status" className="py-16 text-center">טוען…</p>

// ---------- card games ----------
export function CardGamesHub() {
  const d = useData(loadCards)
  return <Page>
    <SEO title="משחקי קלפים — חוקים של 14 משחקי קלפים למשפחה ולילדים" description="משחקי קלפים למשפחה: חוקים פשוטים למלחמה, יניב, רמי, ספיד, דג, חמור, טאקי, רביעיות, שקרן וכפיות — כמה משתתפים, מאיזה גיל ואיך מנצחים." path="/card-games" structuredData={d ? faqSchema(d.CARD_GAMES_FAQ) : null} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'משחקי קלפים' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl">🃏 משחקי קלפים — החוקים</h1>
    <p className="mx-auto mb-6 mt-2 max-w-2xl text-center text-lg text-slate-600">חפיסה אחת, הרבה משחקים. החוקים של משחקי הקלפים האהובים בישראל — קצר וברור, עם מספר משתתפים וגיל.</p>
    {!d ? <Loading /> : <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{d.CARD_GAMES.map(g => <li key={g.slug}><Link to={`/card-games/${g.slug}`} className="block h-full rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-violet-400"><b className="text-xl">{g.emoji} {g.name}</b><span className="mt-1 block text-sm text-slate-600">{g.players} משתתפים · {g.ages} · {g.time}</span><span className="mt-1 block">{g.goal}</span></Link></li>)}</ul>
      <p className="mt-6 text-center">רוצים לשחק עכשיו במחשב או בטלפון? <Link to="/online-games" className="font-bold underline">סוליטר, פריסל ולבבות אונליין ←</Link></p>
      <div className="mt-10"><SeoBody paragraphs={['משחקי קלפים הם מהדרכים הכי פשוטות לבלות יחד: חפיסה אחת מספיקה למשחקים לילדים בני 4 ועד משחקים של אסטרטגיה למבוגרים. הם מלמדים לספור, לזכור, לחכות לתור ולהפסיד בכבוד — והכול סביב שולחן אחד.', 'בכל משחק כאן תמצאו כמה משתתפים צריך, מאיזה גיל, כמה זמן זה לוקח, ואת החוקים צעד אחרי צעד, עם טיפים ווריאציות. רוב המשחקים משחקים בחפיסה רגילה של 52 קלפים.']} faq={d.CARD_GAMES_FAQ} related={[{ label: 'משחקי קופסה ומשחקים לכל המשפחה', href: '/games' }, { label: 'משחקי אונליין', href: '/online-games' }, { label: 'פעילויות עם סבא וסבתא', href: '/adults/grandparents' }]} /></div>
    </>}
  </Page>
}
const Steps = ({ title, items }) => items?.length ? <section className="mt-5"><h2 className="mb-2 text-2xl font-black">{title}</h2><ol className="list-decimal space-y-1 pr-6 text-lg">{items.map(s => <li key={s}>{s}</li>)}</ol></section> : null
export function CardGamePage() {
  const { slug } = useParams()
  const d = useData(loadCards)
  const g = d?.CARD_GAMES.find(x => x.slug === slug)
  if (d && !g) return <NotFound />
  return <Page>
    {g && <SEO title={`${g.name} — חוקי המשחק בקלפים, איך משחקים ומנצחים`} description={`חוקי ${g.name}: ${g.goal} ${g.players} משתתפים, ${g.ages}. הכנה, מהלך המשחק, איך מנצחים, טיפים ווריאציות.`.slice(0, 160)} path={`/card-games/${g.slug}`} />}
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי קלפים', href: '/card-games' }, { label: g?.name || '…' }]} />
    {!g ? <Loading /> : <>
      <h1 className="text-center text-4xl font-black sm:text-5xl">{g.emoji} {g.name} — חוקי המשחק</h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-xl">{g.goal}</p>
      <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2 text-lg">{[['👥', `${g.players} משתתפים`], ['🎂', g.ages], ['⏱️', g.time], ['🃏', g.deck]].map(([e, t]) => <span key={t} className="rounded-full bg-slate-100 px-3 py-1">{e} {t}</span>)}</div>
      <Steps title="🛠️ הכנה" items={g.setup} />
      <Steps title="▶️ איך משחקים" items={g.play} />
      {g.win && <section className="mt-5 rounded-2xl bg-amber-50 p-4 text-lg"><b>🏆 איך מנצחים: </b>{g.win}</section>}
      {g.tips?.length > 0 && <section className="mt-5"><h2 className="mb-2 text-2xl font-black">💡 טיפים</h2><ul className="list-disc space-y-1 pr-6 text-lg">{g.tips.map(t => <li key={t}>{t}</li>)}</ul></section>}
      {g.variants?.length > 0 && <section className="mt-5"><h2 className="mb-2 text-2xl font-black">🔀 וריאציות</h2><ul className="list-disc space-y-1 pr-6 text-lg">{g.variants.map(t => <li key={t}>{t}</li>)}</ul></section>}
      <h2 className="mb-3 mt-10 text-2xl font-black">עוד משחקי קלפים</h2>
      <div className="flex flex-wrap gap-2">{d.CARD_GAMES.filter(x => x.slug !== g.slug).map(x => <Link key={x.slug} to={`/card-games/${x.slug}`} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold">{x.emoji} {x.name}</Link>)}</div>
    </>}
  </Page>
}

// ---------- baby names by meaning ----------
export function NameThemePage() {
  const { theme } = useParams()
  const d = useData(loadThemes)
  const t = d?.NAME_THEMES.find(x => x.slug === theme)
  if (d && !t) return <NotFound />
  const names = t ? t.names.map(s => d.BABY_NAMES.find(n => n.slug === s)).filter(Boolean) : []
  return <Page>
    {t && <SEO title={t.title} description={t.desc} path={`/baby-names/meaning/${t.slug}`} />}
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שמות לתינוקות', href: '/baby-names' }, { label: t?.h1 || '…' }]} />
    {!t ? <Loading /> : <>
      <h1 className="text-center text-4xl font-black sm:text-5xl">{t.emoji} {t.h1}</h1>
      <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg text-slate-600">{t.intro}</p>
      <ul className="grid gap-3 sm:grid-cols-2">{names.map(n => <li key={n.slug}><Link to={`/baby-names/name/${n.slug}`} className="block h-full rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-pink-400"><b className="text-2xl">{n.name}</b> <small className="text-slate-500">{n.gender === 'm' ? 'לבן' : n.gender === 'f' ? 'לבת' : 'לבן ולבת'} · {n.origin}</small><span className="mt-1 block">{n.meaning}</span></Link></li>)}</ul>
      <h2 className="mb-3 mt-10 text-2xl font-black">שמות לפי משמעות</h2>
      <div className="flex flex-wrap gap-2">{d.NAME_THEMES.filter(x => x.slug !== t.slug).map(x => <Link key={x.slug} to={`/baby-names/meaning/${x.slug}`} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold">{x.emoji} {x.h1}</Link>)}</div>
      <p className="mt-6 text-center"><Link to="/baby-names" className="underline">לכל השמות, לפי אות ולפי מגדר ←</Link></p>
    </>}
  </Page>
}

// ---------- bar / bat mitzvah invitations ----------
const MITZVAH = {
  'bat-mitzvah': { h1: 'הזמנה לבת מצווה', title: 'הזמנה לבת מצווה — עיצוב הזמנה עם תמונה בחינם', desc: 'עיצוב הזמנה לבת מצווה בחינם: בוחרים סגנון, מוסיפים תמונה, שם, תאריך ומקום, ומקבלים הזמנה מעוצבת לשליחה בוואטסאפ או להדפסה. בלי הרשמה.', greet: '/greetings/bat-mitzvah' },
  'bar-mitzvah': { h1: 'הזמנה לבר מצווה', title: 'הזמנה לבר מצווה — עיצוב הזמנה עם תמונה בחינם', desc: 'עיצוב הזמנה לבר מצווה בחינם: בוחרים סגנון, מוסיפים תמונה, שם, תאריך ומקום, ומקבלים הזמנה מעוצבת לשליחה בוואטסאפ או להדפסה. בלי הרשמה.', greet: '/greetings/bar-mitzvah' },
}
export function MitzvahInvitation({ occasion }) {
  const m = MITZVAH[occasion]
  const faq = [
    { q: 'מה כותבים בהזמנה ל' + (occasion === 'bat-mitzvah' ? 'בת מצווה' : 'בר מצווה') + '?', a: 'שם החוגג או החוגגת, משפט פתיחה חגיגי, תאריך עם יום בשבוע, שעה, מקום וכתובת מדויקים, ודרך לאשר הגעה. אם יש עלייה לתורה או אירוע בבית הכנסת — מציינים גם אותו ואת השעה.' },
    { q: 'כמה זמן מראש שולחים את ההזמנה?', a: 'בדרך כלל שלושה עד ארבעה שבועות לפני האירוע, ושבוע לפני שולחים תזכורת. לאורחים מחוץ לעיר כדאי להודיע עוד קודם.' },
    { q: 'אפשר לצרף אישור הגעה?', a: 'כן. בעמוד אישור ההגעה של האתר יוצרים קישור חינמי, והוא מתווסף להודעה עם ההזמנה.' },
  ]
  return <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8" dir="rtl">
    <SEO title={m.title} description={m.desc} path={`/invitation/${occasion}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'הזמנות', href: '/invitation' }, { label: m.h1 }]} />
    <h1 className="mb-3 text-center text-3xl sm:text-5xl">✨ {m.h1}</h1>
    <p className="mx-auto max-w-3xl text-center text-base text-slate-600 sm:text-lg">ממלאים שם, תאריך ומקום, מוסיפים תמונה אם רוצים — וההזמנה מוכנה לשליחה בוואטסאפ או להדפסה.</p>
    <InvitationStudio occasion={occasion} />
    <div className="mx-auto mt-10 max-w-4xl"><SeoBody paragraphs={['בר ובת מצווה הם רגע מרגש למשפחה, וההזמנה היא הדבר הראשון שהאורחים רואים. כאן מעצבים הזמנה אישית בכמה דקות: בוחרים סגנון, צבעים ופונט, ומוסיפים תמונה של החוגג או החוגגת. התמונה מעובדת בדפדפן ולא עולה לשום שרת.']} faq={faq} related={[{ label: 'ברכות ל' + (occasion === 'bat-mitzvah' ? 'בת מצווה' : 'בר מצווה'), href: m.greet }, { label: 'אישור הגעה אונליין', href: '/rsvp' }, { label: 'מחשבון תאריך בר/בת מצווה', href: '/bar-mitzvah/date' }]} /></div>
  </div>
}

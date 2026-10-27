import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { SHABBAT_PLACES, shabbatCity } from '../../data/shabbatCities'
import { israelToday } from '../../utils/parashaCalendar'
import { SHABBAT_NOTICE, addDays, formatTime } from '../../utils/shabbatTimes'
import { hanukkahNights } from '../../utils/hanukkahTimes'

// /holidays/hanukkah/candle-times — when to light each of the eight nights, per city.
const PATH = '/holidays/hanukkah/candle-times'
const KEY = 'buga-hanukkah-city'
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const NIGHTS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני']
const MAJOR = ['jerusalem', 'tel-aviv', 'haifa', 'beer-sheva', 'rishon-lezion', 'petah-tikva', 'ashdod', 'netanya', 'bnei-brak', 'holon']
const dateLabel = iso => iso.split('-').reverse().slice(0, 2).join('.')
const savedCity = () => { try { return shabbatCity(localStorage.getItem(KEY)) } catch { return null } }
const sortedPlaces = [...SHABBAT_PLACES].sort((a, b) => a.name.localeCompare(b.name, 'he'))

const howTo = x => x.kind === 'friday' ? `לפני נרות שבת — עד ${formatTime(x.time)}` : x.kind === 'saturday' ? `אחרי צאת השבת — ${formatTime(x.time)} ואילך` : `בצאת הכוכבים — ${formatTime(x.time)}`
const FAQ = [
  { q: 'מתי מדליקים נרות חנוכה?', a: 'ביום חול נוהגים להדליק עם רדת החשכה. יש מקהילות ישראל שנוהגות להדליק בשקיעה ויש שנוהגות בצאת הכוכבים, ובעמוד מוצגות שתי השעות. אפשר להדליק גם מאוחר יותר בערב, כל עוד בני הבית ערים — לשאלות מנהג כדאי לפנות לרב הקהילה.' },
  { q: 'מה עושים ביום שישי בחנוכה?', a: 'ביום שישי מדליקים את נרות החנוכה לפני נרות השבת, כלומר לפני כניסת השבת. הנרות צריכים לדלוק עד חצי שעה אחרי צאת הכוכבים, ולכן משתמשים בנרות גדולים יותר או ביותר שמן.' },
  { q: 'מה עושים במוצאי שבת בחנוכה?', a: 'במוצאי שבת מדליקים רק אחרי צאת השבת. יש נוהגים להבדיל קודם ולהדליק אחר כך, ויש נוהגים להדליק לפני ההבדלה — כל קהילה לפי מנהגה.' },
]

function NightsTable({ nights }) {
  return <table className="w-full text-right text-sm sm:text-base">
    <caption className="sr-only">זמני הדלקת נרות חנוכה</caption>
    <thead><tr className="border-b-2 border-[var(--border)]"><th scope="col" className="py-2">נר</th><th scope="col" className="px-2">תאריך</th><th scope="col" className="px-2">שקיעה</th><th scope="col" className="px-2">מתי מדליקים</th></tr></thead>
    <tbody>{nights.map(x => <tr key={x.n} className="border-b border-[var(--border)] align-top">
      <th scope="row" className="py-3"><span className="block text-lg">🕯️ {x.n}</span><span className="text-xs font-normal">נר {NIGHTS[x.n - 1]}</span></th>
      <td className="px-2 py-3">יום {DAYS[x.dow]}, {dateLabel(x.date)}<span className="block text-xs">אור ל{x.hebrewDate}</span></td>
      <td className="px-2 py-3 tabular-nums" dir="ltr">{formatTime(x.sunset)}</td>
      <td className="px-2 py-3 font-bold">{howTo(x)}</td>
    </tr>)}</tbody>
  </table>
}

function FridgeSheet({ city, nights }) {
  return <article className="buga-a4" style={{ alignItems: 'stretch' }}>
    <h2 style={{ fontSize: '26pt', textAlign: 'center', margin: '0 0 4px' }}>🕎 הדלקת נרות חנוכה — {city.name}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 14px', fontSize: '13pt' }}>שעון ישראל · שבת: הדלקה {city.offset} דקות לפני השקיעה ({city.offsetLabel})</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14pt' }}>
      <thead><tr>{['נר', 'תאריך', 'מתי מדליקים', '✓'].map(h => <th key={h} style={{ borderBottom: '2px solid #111', padding: '6px', textAlign: 'right' }}>{h}</th>)}</tr></thead>
      <tbody>{nights.map(x => <tr key={x.n}><td style={{ borderBottom: '1px solid #bbb', padding: '9px 6px', fontWeight: 800 }}>{x.n} 🕯️</td><td style={{ borderBottom: '1px solid #bbb', padding: '9px 6px' }}>{DAYS[x.dow]} {dateLabel(x.date)}<br /><small>אור ל{x.hebrewDate}</small></td><td style={{ borderBottom: '1px solid #bbb', padding: '9px 6px' }}>{howTo(x)}</td><td style={{ borderBottom: '1px solid #bbb', padding: '9px 6px', width: '14mm' }}><span style={{ display: 'inline-block', width: '9mm', height: '9mm', border: '2px solid #111', borderRadius: 4 }} /></td></tr>)}</tbody>
    </table>
    <p style={{ fontSize: '11.5pt', lineHeight: 1.6, marginTop: 14 }}><b>הברכות:</b> בכל ערב — "להדליק נר של חנוכה" ו"שעשה ניסים". בערב הראשון מוסיפים "שהחיינו". מדליקים את הנר החדש (השמאלי) ראשון. הנרות צריכים לדלוק לפחות חצי שעה.</p>
    <p style={{ fontSize: '10.5pt', marginTop: 6 }}>{SHABBAT_NOTICE}</p>
  </article>
}

export default function HanukkahCandleTimes() {
  const [city, setCity] = useState(() => savedCity() || shabbatCity('jerusalem'))
  const [printing, setPrinting] = useState(false)
  const from = addDays(israelToday(), -8)
  const nights = useMemo(() => hanukkahNights(city, from), [city, from])
  const major = useMemo(() => MAJOR.map(shabbatCity).filter(Boolean).map(c => [c, hanukkahNights(c, from)[0]]), [from])
  const choose = slug => { const c = shabbatCity(slug); if (!c) return; setCity(c); try { localStorage.setItem(KEY, slug) } catch { /* ignore */ } }
  const first = nights[0], year = first ? first.date.slice(0, 4) : '', fridays = nights.filter(x => x.kind === 'friday')
  return <HanukkahShell crumb="זמני הדלקת נרות">
    <SEO title={`זמני הדלקת נרות חנוכה ${year} — לפי עיר, לכל שמונת הלילות`} description={`מתי מדליקים נרות חנוכה ${year}? זמני הדלקה לכל שמונת הלילות לפי עיר: נר ראשון ביום ${first ? `${DAYS[first.dow]} ${dateLabel(first.date)}` : ''}, שישי לפני נרות שבת ומוצאי שבת אחרי צאת השבת. לוח להדפסה למקרר.`} path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="text-center text-4xl sm:text-5xl">🕯️ זמני הדלקת נרות חנוכה {year}</h1>
    <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg">שמונה לילות, שמונה זמנים. בחרו עיר וראו מתי מדליקים בכל ערב — כולל יום שישי, שבו מדליקים לפני נרות השבת, ומוצאי שבת, שבו מדליקים רק אחרי צאת השבת.</p>
    <label className="mx-auto block max-w-md text-center font-bold">העיר שלכם
      <select value={city.slug} onChange={e => choose(e.target.value)} className="mt-1 block w-full min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-2">{sortedPlaces.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
    </label>
    <section className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6" aria-label={`זמני ההדלקה ב${city.name}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-black">חנוכה {year} ב{city.name}</h2><button type="button" onClick={() => setPrinting(true)} className="min-h-[44px] rounded-2xl bg-violet-700 px-4 font-bold text-white">🖨️ לוח למקרר</button></div>
      {nights.length ? <NightsTable nights={nights} /> : <p>לא הצלחנו לחשב את הזמנים. נסו לרענן את העמוד.</p>}
      <p className="mt-3 text-sm">ביום חול מוצגת השעה לפי צאת הכוכבים (כ־20 דקות אחרי השקיעה). מי שנוהג להדליק בשקיעה — לפי עמודת השקיעה. ביום שישי השעה היא זמן כניסת השבת בעיר ({city.offset} דקות לפני השקיעה).</p>
    </section>
    <p className="mt-4 rounded-xl border border-[var(--border)] p-3 text-sm">{SHABBAT_NOTICE}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2"><Link to="/holidays/blessings/hanukkah" className="rounded-2xl border-2 border-[var(--border)] px-4 py-2 font-bold">📜 ברכות ההדלקה</Link><Link to="/holidays/hanukkah/songs" className="rounded-2xl border-2 border-[var(--border)] px-4 py-2 font-bold">🎵 מעוז צור ושירי חנוכה</Link><Link to={`/shabbat-times/${city.slug}`} className="rounded-2xl border-2 border-[var(--border)] px-4 py-2 font-bold">🕯️ זמני שבת ב{city.name}</Link></div>
    <section className="mt-8"><h2 className="text-2xl font-black">נר ראשון בערים הגדולות</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{major.map(([c, x]) => x && <li key={c.slug}><button type="button" onClick={() => choose(c.slug)} className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-3 text-right"><b>{c.name}</b> — {howTo(x)}</button></li>)}</ul>
    </section>
    {printing && <PrintPreview title={`הדלקת נרות חנוכה — ${city.name}`} onClose={() => setPrinting(false)}><FridgeSheet city={city} nights={nights} /></PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[
      `חנוכה ${year} מתחיל בערב יום ${first ? `${DAYS[first.dow]}, ${dateLabel(first.date)}` : ''}, ובכל אחד משמונת הלילות מוסיפים נר: נר אחד בערב הראשון ושמונה בערב האחרון, ועוד השמש שבעזרתו מדליקים. הזמנים בעמוד מחושבים לפי מיקום העיר ובשעון ישראל.`,
      `${fridays.length ? `השנה חל בחנוכה יום שישי ב${fridays.map(x => `נר ה${NIGHTS[x.n - 1]}`).join(' וב')}. ` : ''}ביום שישי מדליקים את נרות החנוכה לפני נרות השבת, ובמוצאי שבת רק אחרי צאת השבת. הזמנים לשבת זהים לאלה שבעמוד זמני השבת באתר, כדי שלא יהיו שני לוחות שונים באותו בית.`,
    ]} faq={FAQ} related={[{ label: 'כל חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'זמני שבת לפי עיר', href: '/shabbat-times' }, { label: 'ברכות חנוכה', href: '/holidays/blessings/hanukkah' }]} /></div>
  </HanukkahShell>
}

import { useMemo, useState } from 'react'
import PrintPreview from '../ui/PrintPreview'
import PersonalPhoto from './PersonalPhoto'
import { SHABBAT_PLACES } from '../../data/shabbatCities'
import { monthlySheet, formatTime, SHABBAT_NOTICE } from '../../utils/shabbatTimes'
import { israelToday } from '../../utils/parashaCalendar'
import './shabbat-print.css'

const dateLabel = iso => iso.split('-').reverse().join('.')
const monthLabel = month => new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`))

export function CalendarSheet({ sheet, city, photo, title }) {
  return <article className="buga-flow shabbat-calendar-sheet" dir="rtl" data-calendar-month={sheet.start.slice(0, 7)}>
    <header className="sc-head">{photo && <img src={photo} alt="התמונה האישית בלוח" />}<div><p className="sc-kicker">שבת שלום · עוגה בוגה</p><h2>{title || 'השבתות שלנו'}</h2><h3>{monthLabel(sheet.start.slice(0, 7))}</h3><p>זמני שבת ב{city.name}</p></div></header>
    <p className="sc-method">שעון ישראל · הדלקה {city.offset} דקות לפני השקיעה · צאת שבת 8.5°</p>
    <table><thead><tr><th>שבת ופרשה</th><th>הדלקה ביום שישי</th><th>צאת השבת</th></tr></thead><tbody>{sheet.shabbatot.map(row => <tr key={row.saturday}><th scope="row"><b>{dateLabel(row.saturday)}</b><span>{row.reading.name}</span><small>{row.reading.hebrewDate}</small>{row.endNote && <small>{row.endNote}</small>}</th><td><b dir="ltr">{formatTime(row.candles)}</b><span>{dateLabel(row.friday)}</span>{row.candleNote && <small>{row.candleNote}</small>}</td><td><b dir="ltr">{formatTime(row.end)}</b></td></tr>)}</tbody></table>
    {sheet.holidays.length > 0 && <section className="sc-holidays"><h3>הדלקת נרות לחגים בחודש זה</h3><ul>{sheet.holidays.map(row => <li key={`${row.date}-${row.holiday}`}><b>{dateLabel(row.date)} · {row.holiday} · <bdi>{formatTime(row.time)}</bdi></b><span>{row.instruction}</span></li>)}</ul></section>}
    <p className="sc-note">{SHABBAT_NOTICE}</p><p className="sc-note">לוח ארץ ישראל · חודש לועזי · חישוב בגובה פני הים. הדלקה מעוגלת מטה וצאת שבת מעלה. זמן צאת שבת אינו בהכרח סוף החג.</p>
  </article>
}

export default function ShabbatCalendar({ city: fixedCity }) {
  const [citySlug, setCitySlug] = useState(SHABBAT_PLACES[0].slug), [mode, setMode] = useState('month'), [month, setMonth] = useState(() => israelToday().slice(0, 7)), [year, setYear] = useState(() => israelToday().slice(0, 4)), [photo, setPhoto] = useState(''), [title, setTitle] = useState(''), [printing, setPrinting] = useState(false)
  const city = fixedCity || SHABBAT_PLACES.find(c => c.slug === citySlug)
  const months = useMemo(() => mode === 'month' ? [month] : /^20\d{2}$/.test(year) ? Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`) : [], [mode, month, year])
  const sheets = useMemo(() => months.map(m => monthlySheet(city, m)).filter(Boolean), [city, months])
  return <section id={fixedCity ? 'place-calendar' : 'calendar'} className="sc-builder" aria-label="לוח זמני שבת להדפסה"><h2>לוח השבתות שלכם — למקרר ולכיתה</h2><p>לוח חודשי או שנתי עם זמני שבת, פרשות והדלקת נרות לחגים. אפשר להוסיף תמונה של אמא, של המשפחה או תמונה אהובה.</p>
    <div className="sc-controls">
      {!fixedCity && <label>עיר לחישוב הזמנים<select value={citySlug} onChange={e => setCitySlug(e.target.value)}>{SHABBAT_PLACES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>}
      <label>סוג הלוח<select value={mode} onChange={e => setMode(e.target.value)}><option value="month">לוח חודשי — דף אחד</option><option value="year">לוח שנתי — 12 דפים</option></select></label>
      {mode === 'month' ? <label>חודש לועזי<input type="month" min="2000-01" max="2099-12" value={month} onChange={e => setMonth(e.target.value)} /></label> : <label>שנה לועזית<input type="number" min="2000" max="2099" value={year} onChange={e => setYear(e.target.value)} /></label>}
      <label>כותרת אישית (לא חובה)<input maxLength={36} value={title} onChange={e => setTitle(e.target.value)} placeholder="למשל: שבת שלום ממשפחת כהן" /></label>
    </div>
    <PersonalPhoto value={photo} onChange={setPhoto} label="תמונה בראש הלוח (לא חובה)" />
    <p className="sc-summary" aria-live="polite">{sheets.length ? `${city.name} · ${city.offset} דקות לפני השקיעה · ${sheets.length} ${sheets.length === 1 ? 'דף' : 'דפים'} להדפסה${mode === 'year' ? ' — ינואר עד דצמבר, חודש בכל דף' : ''}` : 'בחרו חודש או שנה תקינים בין 2000 ל־2099.'}</p>
    <button type="button" className="sc-print" disabled={!sheets.length} onClick={() => setPrinting(true)}>תצוגה מקדימה, הדפסה או PDF</button>
    {printing && <PrintPreview title={`לוח שבת ב${city.name} — ${mode === 'year' ? year : monthLabel(month)}`} copies={false} onClose={() => setPrinting(false)}>{sheets.map(sheet => <CalendarSheet key={sheet.start} sheet={sheet} city={city} photo={photo} title={title} />)}</PrintPreview>}
  </section>
}

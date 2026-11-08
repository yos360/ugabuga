// English time and text tools: hours calculator, date calculator, world clock, word counter and age calculator.
// The math comes from the shared utils (timeText, calc); their error messages are Hebrew, so inputs are
// checked here first and any remaining failure shows an English message.
import { useEffect, useState } from 'react'
import ToolFrame from './ToolFrame'
import { Field, Panel, Result, buttonClass, inputClass, attempt, fmt } from './ui'
import { minutes, durationLabel, shiftMinutes, timesheet, dateDifference, addDateDays, calendarDay, zoneParts, zoneOffset, countText } from '../../utils/timeText'
import { ageParts } from '../../utils/calc'

const HHMM = /^\d{1,5}:[0-5]\d$/
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const weekday = iso => new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z'))
const longDate = iso => new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z'))
function hebrewDateEn(iso) {
  try { return new Intl.DateTimeFormat('en-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')) } catch { return null }
}
const ordinal = n => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) }
const plural = (n, word) => `${fmt(n, 0)} ${word}${n === 1 ? '' : 's'}`

// ── hours ──
export function HoursCalculator() {
  const [a, setA] = useState('1:30'), [b, setB] = useState('0:45'), [op, setOp] = useState('+'), [start, setStart] = useState('22:00'), [end, setEnd] = useState('06:00')
  const [rows, setRows] = useState([{ start: '09:00', end: '17:00', pause: '30' }]), [rate, setRate] = useState('')
  const update = (i, k, v) => setRows(rows.map((r, j) => i === j ? { ...r, [k]: v } : r))
  const sum = HHMM.test(a) && HHMM.test(b) ? attempt(() => durationLabel(minutes(a) + (op === '+' ? 1 : -1) * minutes(b))) : { error: 'Write both durations as hours:minutes, for example 1:30.' }
  const between = attempt(() => durationLabel(shiftMinutes(start, end)), 'Choose a start and an end time.')
  const badPause = rows.some(r => { const p = Number(r.pause); return !Number.isInteger(p) || p < 0 })
  const sheet = badPause ? { error: 'Breaks are whole minutes, zero or more.' } : (rate !== '' && !(Number(rate) >= 0)) ? { error: 'The hourly rate must be a number of zero or more.' } : attempt(() => timesheet(rows, rate), 'Each break must be shorter than its shift. Check the times.')
  return <ToolFrame path="/en/tools/hours-calculator" h1="🕒 Hours calculator: add time and work hours" intro="Add and subtract hours and minutes, find the time between two clock times (even past midnight) and total a timesheet with breaks." width="max-w-3xl"
    faq={[
      { q: 'How do I calculate hours worked past midnight?', a: 'When the end time is earlier than the start time, the end counts as the next day. 22:00 to 06:00 is 8 hours. Equal times mean zero hours, not a full day.' },
      { q: 'Is 1:30 the same as 1.30 hours?', a: 'No. 1:30 is one and a half hours, which is 1.5 decimal hours. Pay is worked out from the minutes divided by 60 times the hourly rate.' },
      { q: 'Does the pay include overtime or tax?', a: 'No. It is a simple duration times rate calculation, without overtime rules, deductions or tax.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/date-calculator', label: 'date calculator' }, { href: '/en/tools/countdown-timer', label: 'countdown timer' }]}>
    <Panel label="Add or subtract durations">
      <h2 className="text-xl font-bold">Add or subtract durations</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="First duration" value={a} onChange={e => setA(e.target.value)} />
        <label className="font-bold">Operation<select className={inputClass} value={op} onChange={e => setOp(e.target.value)}><option value="+">Add</option><option value="-">Subtract</option></select></label>
        <Field label="Second duration" value={b} onChange={e => setB(e.target.value)} />
      </div>
      <Result error={sum.error}>{sum.value} hours:minutes</Result>
      <h2 className="text-xl font-bold">Time between two clock times</h2>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Start" type="time" value={start} onChange={e => setStart(e.target.value)} /><Field label="End" type="time" value={end} onChange={e => setEnd(e.target.value)} /></div>
      <Result error={between.error}>Duration: {between.value}</Result>
      <h2 className="text-xl font-bold">Timesheet</h2>
      {rows.map((r, i) => <fieldset key={i} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-4"><legend>Shift {i + 1}</legend>
        <Field label="Start" type="time" value={r.start} onChange={e => update(i, 'start', e.target.value)} />
        <Field label="End" type="time" value={r.end} onChange={e => update(i, 'end', e.target.value)} />
        <Field label="Break (minutes)" type="number" min="0" step="1" value={r.pause} onChange={e => update(i, 'pause', e.target.value)} />
        <button className={buttonClass} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove shift {i + 1}</button>
      </fieldset>)}
      <button className={buttonClass} disabled={rows.length >= 100} onClick={() => setRows([...rows, { start: '09:00', end: '17:00', pause: '0' }])}>+ Add a shift</button>
      <Field label="Hourly rate (optional)" type="number" min="0" step="any" value={rate} onChange={e => setRate(e.target.value)} />
      <Result error={sheet.error}>{sheet.value && <>Total {durationLabel(sheet.value.total)} · {(sheet.value.total / 60).toFixed(2)} decimal hours{sheet.value.pay !== null && <p>Basic pay: {fmt(sheet.value.pay)}</p>}</>}</Result>
    </Panel>
  </ToolFrame>
}

// ── dates ──
export function DateCalculator() {
  const [start, setStart] = useState(localToday), [end, setEnd] = useState(localToday), [inclusive, setInclusive] = useState(false), [count, setCount] = useState('30')
  const valid = v => { try { calendarDay(v); return true } catch { return false } }
  const diff = !valid(start) || !valid(end) ? { error: 'Choose two valid dates from the year 1000 on.' } : start > end ? { error: 'The end date must be on or after the start date.' } : attempt(() => dateDifference(start, end, inclusive))
  const n = Number(count)
  const added = !valid(start) ? { error: 'Choose a valid start date.' } : count === '' || !Number.isSafeInteger(n) || Math.abs(n) > 1000000 ? { error: 'Type a whole number of days (negative to go back).' } : attempt(() => addDateDays(start, n), 'That date is out of range.')
  return <ToolFrame path="/en/tools/date-calculator" h1="📅 Date calculator: days between dates" intro="Count the days, weeks and months between two dates, add or subtract days, and see the weekday and the Hebrew date." width="max-w-3xl"
    faq={[
      { q: 'What does "include the end date" mean?', a: 'It adds one day to the count. From the 1st to the 2nd of a month is one day, or two dates if you count the end date too.' },
      { q: 'How are months counted?', a: 'Whole calendar months first, then the days left over. When the start day does not exist in the target month, the last day of that month is used, so January 31 to February 28 in a regular year is one month.' },
      { q: 'Which Hebrew date is shown?', a: 'The Hebrew date during daylight on the day you chose. The Hebrew day starts at sunset, so for an evening birth use the Hebrew birthday calculator.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/age-calculator', label: 'age calculator' }, { href: '/en/tools/hebrew-birthday', label: 'Hebrew birthday calculator' }]}>
    <Panel label="Days between dates">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Start date" type="date" min="1000-01-01" max="9999-12-31" value={start} onChange={e => setStart(e.target.value)} /><Field label="End date" type="date" min="1000-01-01" max="9999-12-31" value={end} onChange={e => setEnd(e.target.value)} /></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={inclusive} onChange={e => setInclusive(e.target.checked)} /> Include the end date</label>
      <Result error={diff.error}>{diff.value && <><p>{plural(diff.value.days, 'day')}</p><p>{plural(diff.value.weeks, 'week')} and {plural(diff.value.weekDays, 'day')}</p><p>{plural(diff.value.months, 'month')} and {plural(diff.value.monthDays, 'day')}</p></>}</Result>
      <h2 className="text-xl font-bold">Add or subtract days from the start date</h2>
      <Field label="Number of days (negative to subtract)" type="number" step="1" value={count} onChange={e => setCount(e.target.value)} />
      <Result error={added.error}>{added.value && <><p>{longDate(added.value)}</p>{hebrewDateEn(added.value) && <p>Hebrew date: {hebrewDateEn(added.value)}</p>}</>}</Result>
      {valid(start) && <><h2 className="text-xl font-bold">The start date</h2><Result>{weekday(start)}{hebrewDateEn(start) ? ` · ${hebrewDateEn(start)}` : ''}</Result></>}
    </Panel>
  </ToolFrame>
}

// ── world clock ──
const CITIES = [
  ['Asia/Jerusalem', 'Jerusalem'], ['Europe/London', 'London'], ['America/New_York', 'New York'], ['America/Chicago', 'Chicago'], ['America/Denver', 'Denver'], ['America/Los_Angeles', 'Los Angeles'], ['America/Toronto', 'Toronto'],
  ['Europe/Paris', 'Paris'], ['Europe/Berlin', 'Berlin'], ['Europe/Moscow', 'Moscow'], ['Asia/Dubai', 'Dubai'], ['Asia/Kolkata', 'New Delhi'], ['Asia/Singapore', 'Singapore'], ['Asia/Shanghai', 'Beijing'],
  ['Asia/Tokyo', 'Tokyo'], ['Australia/Sydney', 'Sydney'], ['Pacific/Auckland', 'Auckland'], ['America/Sao_Paulo', 'São Paulo'], ['America/Mexico_City', 'Mexico City'], ['Africa/Johannesburg', 'Johannesburg'],
]
const NAMES = Object.fromEntries(CITIES)
const offsetLabel = m => {
  if (m === 0) return 'same time as you'
  const h = Math.floor(Math.abs(m) / 60), min = Math.abs(m) % 60
  return `${h ? `${h} h` : ''}${h && min ? ' ' : ''}${min ? `${min} min` : ''} ${m > 0 ? 'ahead of' : 'behind'} you`
}
// The instant when the wall clock in `zone` shows `date time` (two passes settle DST offsets).
function instantIn(date, time, zone) {
  const wall = Date.parse(`${date}T${time}:00Z`)
  if (!Number.isFinite(wall)) return null
  let guess = new Date(wall - zoneOffset(new Date(wall), zone) * 60000)
  guess = new Date(wall - zoneOffset(guess, zone) * 60000)
  const p = zoneParts(guess, zone)
  return p.date === date && p.time === time ? guess : null
}
export function WorldClock() {
  const here = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const [now, setNow] = useState(() => new Date()), [cities, setCities] = useState(['Asia/Jerusalem', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'])
  const [from, setFrom] = useState('Asia/Jerusalem'), [date, setDate] = useState(localToday), [time, setTime] = useState('12:00')
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  const instant = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time) ? instantIn(date, time, from) : null
  const shown = [[here, `Your time (${NAMES[here] || here.split('/').pop().replaceAll('_', ' ')})`], ...CITIES.filter(([z]) => cities.includes(z) && z !== here)]
  const fmtTime = (instant, zone) => new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(instant)
  const fmtDay = (instant, zone) => new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short' }).format(instant)
  return <ToolFrame path="/en/tools/world-clock" h1="🌍 World clock and time zone converter" intro="See the time now in cities around the world, and convert a meeting time between time zones, with daylight saving taken into account." width="max-w-4xl"
    faq={[
      { q: 'Why does the time difference change during the year?', a: 'Countries switch to daylight saving time on different dates, and some never do. The difference is worked out for the date you choose, using your browser\'s time zone data.' },
      { q: 'What is the time difference between Israel and New York?', a: 'Usually 7 hours: Israel is ahead. For a few weeks in spring and autumn, when only one of them has changed its clocks, it is 6 hours. The clock on this page always shows the current difference.' },
      { q: 'Why does a time say it does not exist?', a: 'When clocks jump forward in spring, one hour is skipped. A time inside that hour never happens on that date in that city.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/date-calculator', label: 'date calculator' }, { href: '/en/tools/hours-calculator', label: 'hours calculator' }]}>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map(([zone, name]) => { const diff = zoneOffset(now, zone) - zoneOffset(now, here); return <article key={zone} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 text-center">
        <h2 className="text-xl font-bold">{name}</h2><p className="text-4xl font-black tabular-nums">{fmtTime(now, zone)}</p><p>{fmtDay(now, zone)}</p><p className="text-sm">{zone === here ? 'your device' : offsetLabel(diff)}</p>
      </article> })}
    </div>
    <details className="mt-4 rounded-2xl border-2 border-[var(--border)] p-4"><summary className="cursor-pointer font-bold">Choose cities</summary>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{CITIES.map(([zone, name]) => <label key={zone} className="flex items-center gap-2"><input type="checkbox" checked={cities.includes(zone)} onChange={e => setCities(e.target.checked ? [...cities, zone] : cities.filter(z => z !== zone))} />{name}</label>)}</div>
    </details>
    <Panel label="Time zone converter" className="mt-6">
      <h2 className="text-xl font-bold">What time will it be there when it is…</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="font-bold">In<select className={inputClass} value={from} onChange={e => setFrom(e.target.value)}>{[[here, 'My time zone'], ...CITIES].map(([z, n]) => <option key={z} value={z}>{n}</option>)}</select></label>
        <Field label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} /><Field label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} />
      </div>
      <Result error={instant ? null : 'That time does not exist there on that date (the clocks jump forward), or the date is incomplete.'}>{instant && shown.map(([zone, name]) => <p key={zone}>{name}: {fmtDay(instant, zone)}, {fmtTime(instant, zone)}</p>)}</Result>
    </Panel>
  </ToolFrame>
}

// ── words ──
export function WordCount() {
  const [text, setText] = useState(''), r = countText(text)
  const stats = [['Words', r.words], ['Characters', r.characters], ['Characters without spaces', r.withoutSpaces], ['Sentences', r.sentences], ['Paragraphs', r.paragraphs], ['Reading time (minutes)', r.readingMinutes]]
  return <ToolFrame path="/en/tools/word-count" h1="📝 Word counter and character count" intro="Count words, characters with and without spaces, sentences, paragraphs and reading time. Works for English and Hebrew; your text stays in your browser." width="max-w-3xl"
    faq={[
      { q: 'How are words counted?', a: 'A word is a run of letters or digits. Apostrophes inside a word (don\'t, Noah\'s) keep it as one word, while spaces and hyphens separate words.' },
      { q: 'What counts as a sentence and a paragraph?', a: 'Sentences end with a full stop, a question mark or an exclamation mark, so abbreviations and decimals can nudge the count. Paragraphs are separated by an empty line.' },
      { q: 'How is reading time worked out?', a: 'At 200 words a minute, rounded up to a whole minute. Reading aloud, young readers and technical text can take longer.' },
      { q: 'Is my text sent anywhere?', a: 'No. Counting happens in your browser. The text is not saved or sent to a server or to analytics.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/typing', label: 'touch typing course' }, { href: '/en/tools/hebrew-keyboard', label: 'Hebrew keyboard' }]}>
    <Panel label="Text to count">
      <label className="block font-bold">Your text<textarea className={inputClass} rows={10} value={text} onChange={e => setText(e.target.value)} spellCheck="false" /></label>
      <button className={buttonClass} onClick={() => setText('')}>Clear the text</button>
      <dl aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="rounded-xl bg-[var(--postit)] p-3"><dt>{label}</dt><dd className="text-3xl font-bold">{fmt(value, 0)}</dd></div>)}</dl>
    </Panel>
  </ToolFrame>
}

// ── age ──
export function AgeCalculator() {
  const [val, setVal] = useState('')
  const today = new Date()
  const birth = /^\d{4}-\d{2}-\d{2}$/.test(val) ? new Date(val + 'T12:00:00') : null
  const ok = birth && !Number.isNaN(+birth) && birth <= today && birth.getFullYear() > 1900
  const a = ok ? ageParts(birth, today) : null
  const heb = ok ? hebrewDateEn(val) : null
  return <ToolFrame path="/en/tools/age-calculator" h1="🎂 Age calculator: how old am I?" intro="Your exact age in years, months and days, how many days you have been alive, the weekday you were born and the days left to your next birthday." width="max-w-2xl"
    faq={[
      { q: 'How do I work out my age in days?', a: 'Type your date of birth. The calculator counts every day from your birth to today, leap years included.' },
      { q: 'How do I find out which day of the week I was born?', a: 'The result shows the weekday of your birth date and its Hebrew date too.' },
      { q: 'How long until my birthday?', a: 'Under your age you see how many days are left until your next birthday, and how old you will be.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/hebrew-birthday', label: 'Hebrew birthday calculator' }, { href: '/en/tools/date-calculator', label: 'date calculator' }]}>
    <Panel label="Date of birth" className="text-center">
      <Field label="Date of birth" type="date" min="1901-01-01" max={localToday()} value={val} onChange={e => setVal(e.target.value)} className="mx-auto max-w-xs" />
      {val && !ok && <p role="alert">Choose a date of birth between 1901 and today.</p>}
      {a && <div aria-live="polite" className="space-y-2 rounded-2xl bg-[var(--postit)] p-5">
        <p className="text-3xl font-black">{plural(a.y, 'year')}, {plural(a.m, 'month')} and {plural(a.d, 'day')}</p>
        <p className="text-xl">That is <b>{fmt(a.days, 0)}</b> days 🎉</p>
        <p className="text-lg">You were born on a <b>{weekday(val)}</b>{heb && <>, <b>{heb}</b> in the Hebrew calendar</>}.</p>
        <p className="text-lg">{a.toNext === 0 ? '🎂 Happy birthday! It is today!' : a.toNext === 1 ? `Your ${ordinal(a.nextAge)} birthday is tomorrow! 🎂` : `${a.toNext} days until you turn ${a.nextAge}.`}</p>
      </div>}
    </Panel>
  </ToolFrame>
}

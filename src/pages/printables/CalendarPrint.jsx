import { useMemo, useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { gematria, hebrewParts, holidayMap, dayKey, HEB_MONTHS, HEB_DAY_LETTERS, HEB_DAYS } from '../../utils/hebrewCalendar'

const COLORS = ['#ff8fab', '#ffb86b', '#ffd23f', '#9be38b', '#5ed3c6', '#6cb8ff', '#a98bff', '#ff8fab', '#ffb86b', '#ffd23f', '#9be38b', '#6cb8ff']

const PRESETS = {
  'calendar-2027': {
    path: '/printables/calendar-2027', start: [2027, 0], h1: 'לוח שנה 2027 להדפסה', emoji: '📅',
    seoTitle: 'לוח שנה 2027 להדפסה — עברי ולועזי עם חגים',
    description: 'לוח שנה 2027 להדפסה בחינם: 12 דפים חודשיים או דף שנתי אחד, עם תאריך עברי, חגי ישראל ומקום לרישום. בצבע או בשחור-לבן לצביעה.',
    sub: 'ינואר עד דצמבר 2027 — עם תאריך עברי, חגים ומקום לכתוב',
  },
  'school-year-5787': {
    path: '/printables/calendar-5787', start: [2026, 8], h1: 'לוח שנה תשפ״ז להדפסה', emoji: '🎒',
    seoTitle: 'לוח שנה תשפ״ז להדפסה — שנת הלימודים 2026–2027',
    description: 'לוח שנה עברי תשפ״ז לשנת הלימודים: ספטמבר 2026 עד אוגוסט 2027, עם תאריך עברי, כל החגים וחופשות — דף לכל חודש או דף שנתי. להדפסה בחינם.',
    sub: 'ספטמבר 2026 עד אוגוסט 2027 — שנת הלימודים, עם כל החגים',
  },
}
const SIBLINGS = [{ href: '/printables/calendar-2027', label: '📅 לוח שנה 2027' }, { href: '/printables/calendar-5787', label: '🎒 שנת הלימודים תשפ״ז' }]

const monthDays = (y, m) => new Date(y, m + 1, 0).getDate()

// "טבת–שבט תשפ״ז" for the Hebrew months a Gregorian month spans.
function hebrewSpan(y, m) {
  const a = hebrewParts(new Date(y, m, 1)), b = hebrewParts(new Date(y, m, monthDays(y, m)))
  if (!a || !b) return ''
  const months = a.month === b.month ? a.month : `${a.month}–${b.month}`
  const years = a.year === b.year ? gematria(a.year) : `${gematria(a.year)}–${gematria(b.year)}`
  return `${months} ${years}`
}

function MonthSheet({ y, m, color, opts, holidays }) {
  const first = new Date(y, m, 1).getDay(), days = monthDays(y, m)
  const rows = Math.ceil((first + days) / 7)
  const L = 8, W = 184, cw = W / 7, top = 50, gridH = opts.notes ? 168 : 200, rh = (gridH - 9) / rows
  const accent = opts.color ? color : '#fff'
  const cells = []
  for (let d = 1; d <= days; d++) {
    const i = first + d - 1, col = i % 7, row = Math.floor(i / 7)
    const x = L + (6 - col) * cw, yy = top + 9 + row * rh
    const date = new Date(y, m, d)
    const heb = opts.hebrew ? hebrewParts(date) : null
    const hol = opts.holidays ? holidays.get(dayKey(date)) : null
    cells.push(
      <g key={d}>
        {(col === 6 || hol) && <rect x={x} y={yy} width={cw} height={rh} fill={hol && opts.color ? '#fff4c2' : '#f2f2f2'} />}
        <T x={x + cw - 2.5} y={yy + 7} size={7} anchor="start" weight={700}>{d}</T>
        {heb && <T x={x + 2.5} y={yy + 6} size={4} anchor="end" fill="#666">{gematria(heb.day)}</T>}
        {heb?.day === 1 && <T x={x + cw / 2} y={yy + 13} size={3.8} weight={700} fill="#555">{heb.month}</T>}
        {hol && <T x={x + cw / 2} y={yy + rh - 3} size={hol.length > 9 ? 3.4 : 4} weight={700} fill="#8a3b00">{hol}</T>}
      </g>
    )
  }
  return (
    <Sheet label={`לוח חודש ${HEB_MONTHS[m]} ${y}`}>
      <rect x={L} y={8} width={W} height={34} rx={6} fill={accent} stroke="#111" strokeWidth={0.8} />
      <T x={100} y={24} size={15} weight={800}>{HEB_MONTHS[m]} {y}</T>
      <T x={100} y={35} size={6} fill="#333">{opts.title || (opts.hebrew ? hebrewSpan(y, m) : '')}</T>
      <rect x={L} y={top} width={W} height={9} fill={opts.color ? '#1d2233' : '#fff'} stroke="#111" strokeWidth={0.6} />
      {HEB_DAYS.map((name, i) => <T key={name} x={L + (6 - i) * cw + cw / 2} y={top + 6.4} size={4.6} weight={700} fill={opts.color ? '#fff' : '#111'}>{name}</T>)}
      {cells}
      {Array.from({ length: rows + 1 }, (_, r) => <line key={'h' + r} x1={L} x2={L + W} y1={top + 9 + r * rh} y2={top + 9 + r * rh} stroke="#111" strokeWidth={0.5} />)}
      {Array.from({ length: 8 }, (_, c) => <line key={'v' + c} x1={L + c * cw} x2={L + c * cw} y1={top} y2={top + 9 + rows * rh} stroke="#111" strokeWidth={0.5} />)}
      {opts.notes && <g>
        <T x={L + W} y={top + gridH + 10} size={6} anchor="start" weight={700}>הערות וחשוב לזכור:</T>
        {[0, 1, 2].map(i => <line key={i} x1={L} x2={L + W} y1={top + gridH + 20 + i * 9} y2={top + gridH + 20 + i * 9} stroke="#bbb" strokeWidth={0.4} />)}
      </g>}
    </Sheet>
  )
}

function YearSheet({ months, opts, holidays, title }) {
  const cw = 60, ch = 58
  return (
    <Sheet label={title}>
      <T x={100} y={15} size={11} weight={800}>{title}</T>
      {months.map(([y, m], idx) => {
        const col = idx % 3, row = Math.floor(idx / 3)
        const X = 190 - (col + 1) * cw - col * 2 + 4, Y = 22 + row * (ch + 2)
        const first = new Date(y, m, 1).getDay(), days = monthDays(y, m), c = (cw - 4) / 7
        return (
          <g key={`${y}-${m}`}>
            <rect x={X} y={Y} width={cw} height={ch} rx={3} fill="#fff" stroke="#111" strokeWidth={0.5} />
            <rect x={X} y={Y} width={cw} height={8} rx={3} fill={opts.color ? COLORS[m] : '#fff'} stroke="#111" strokeWidth={0.5} />
            <T x={X + cw / 2} y={Y + 5.8} size={4.6} weight={800}>{HEB_MONTHS[m]} {y}</T>
            {HEB_DAY_LETTERS.map((l, i) => <T key={l} x={X + 2 + (6 - i) * c + c / 2} y={Y + 13} size={3} weight={700} fill="#555">{l}</T>)}
            {Array.from({ length: days }, (_, k) => {
              const d = k + 1, i = first + k, cx = X + 2 + (6 - (i % 7)) * c + c / 2, cy = Y + 19 + Math.floor(i / 7) * 6.3
              const hol = opts.holidays && holidays.get(dayKey(new Date(y, m, d)))
              return <g key={d}>{hol && <circle cx={cx} cy={cy - 1.2} r={2.6} fill={opts.color ? '#ffd23f' : 'none'} stroke="#8a3b00" strokeWidth={0.35} />}<T x={cx} y={cy} size={3.4} weight={i % 7 === 6 ? 800 : 400}>{d}</T></g>
            })}
          </g>
        )
      })}
      {opts.holidays && <T x={100} y={268} size={4} fill="#555">עיגול = חג או מועד · שמות החגים מופיעים בלוחות החודשיים</T>}
    </Sheet>
  )
}

export default function CalendarPrint({ preset }) {
  const p = PRESETS[preset]
  const [view, setView] = useState('month')
  const [color, setColor] = useState('color')
  const [hebrew, setHebrew] = useState('yes')
  const [title, setTitle] = useState('')
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => { const d = new Date(p.start[0], p.start[1] + i, 1); return [d.getFullYear(), d.getMonth()] }), [p])
  const holidays = useMemo(() => holidayMap(new Date(...months[0], 1), new Date(months[11][0], months[11][1] + 1, 0)), [months])
  const opts = { color: color === 'color', hebrew: hebrew === 'yes', holidays: hebrew === 'yes', notes: true, title }
  const pages = view === 'year'
    ? [{ key: 'year', svg: <YearSheet months={months} opts={opts} holidays={holidays} title={title || p.h1.replace(' להדפסה', '')} /> }]
    : months.map(([y, m], i) => ({ key: `${y}-${m}`, svg: <MonthSheet y={y} m={m} color={COLORS[i]} opts={opts} holidays={holidays} /> }))
  const school = preset === 'school-year-5787'
  return (
    <PrintableShell
      path={p.path} seoTitle={p.seoTitle} description={p.description} emoji={p.emoji} h1={p.h1} sub={p.sub}
      siblings={SIBLINGS} crumbs={[{ label: 'לבית ולארגון', href: '/printables?topic=home' }]}
      controls={<>
        <Choice label="תצוגה" value={view} onChange={setView} options={[['month', '🗓️ דף לכל חודש (12 דפים)'], ['year', '📄 כל השנה בדף אחד']]} />
        <Choice label="צבע" value={color} onChange={setColor} options={[['color', '🌈 צבעוני'], ['bw', '🖍️ שחור-לבן לצביעה']]} />
        <Choice label="תאריך עברי" value={hebrew} onChange={setHebrew} options={[['yes', 'עם תאריך עברי וחגים'], ['no', 'לועזי בלבד']]} />
        <div className="mx-auto max-w-sm"><Field label="כותרת אישית (לא חובה)" value={title} onChange={setTitle} placeholder={school ? 'למשל: הלוח של כיתה ב׳2' : 'למשל: לוח המשפחה של נועה'} /></div>
      </>}
      pages={pages} printTitle={p.h1}
      paragraphs={school ? [
        'לוח שנה תשפ״ז בנוי לפי שנת הלימודים: מתחיל בספטמבר 2026, ממש עם ראש השנה, ונגמר באוגוסט 2027. בכל משבצת מופיעים התאריך הלועזי והתאריך העברי, והחגים מסומנים בשמם — ראש השנה, יום כיפור, סוכות, חנוכה, ט״ו בשבט, פורים, פסח, יום העצמאות, ל״ג בעומר ושבועות.',
        'מורות תולות את הלוח החודשי בכיתה כדי לסמן מבחנים, ימי הולדת של תלמידים וטיולים. בבית אפשר להדביק אותו על המקרר ולסמן חוגים, חופשות ותורים. מצב שחור-לבן נותן לילדים לצבוע כל חודש בעצמם ולהפוך את הלוח לפרויקט יצירה.',
        'התאריכים העבריים והחגים מחושבים לפי הלוח העברי, כולל הזזות של יום הזיכרון ויום העצמאות כשהם נופלים סמוך לשבת. מועדי החופשות בבתי הספר נקבעים על ידי משרד החינוך ועשויים להשתנות, ולכן הם לא מסומנים בלוח — כדאי להוסיף אותם ביד לפי לוח החופשות הרשמי.',
      ] : [
        'לוח שנה 2027 להדפסה בשני פורמטים: דף לכל חודש עם משבצות גדולות לכתיבה, או כל השנה בדף אחד שנוח לתלות ליד השולחן. כל משבצת מציגה את התאריך הלועזי ואת התאריך העברי, והחגים של ישראל מסומנים בשמם.',
        'הלוח החודשי מתאים לתכנון המשפחה: חוגים, ימי הולדת, תורים וחופשות. יש מתחת לכל חודש שורות להערות, ושבתות וחגים מסומנים ברקע כדי שיבלטו. אפשר להוסיף כותרת אישית — "הלוח של משפחת כהן" או "החודש של נועה".',
        'במצב שחור-לבן הלוח חוסך דיו ומשאיר לילדים מקום לצבוע ולקשט את כותרות החודשים. התאריכים העבריים מחושבים לפי הלוח העברי של הדפדפן, ולכן הם מדויקים לכל יום בשנה.',
      ]}
      faq={school ? [
        { q: 'מתי מתחילה שנת תשפ״ז?', a: 'ראש השנה תשפ״ז חל ב-12 בספטמבר 2026, ושנת הלימודים מתחילה בתחילת ספטמבר. הלוח כאן מתחיל ב-1 בספטמבר 2026.' },
        { q: 'האם החופשות של משרד החינוך מסומנות?', a: 'החגים מסומנים, אבל ימי החופשה עצמם לא, כי הם נקבעים ומתעדכנים על ידי משרד החינוך. מומלץ לבדוק את לוח החופשות הרשמי ולסמן ביד.' },
        { q: 'אפשר להדפיס רק חודש אחד?', a: 'כן. בחלון ההדפסה בוחרים את מספר הדף של החודש הרצוי — הדפים מסודרים לפי החודשים, מספטמבר ועד אוגוסט.' },
      ] : [
        { q: 'האם הלוח כולל תאריך עברי?', a: 'כן. בכל משבצת מופיע גם התאריך העברי, ובתחילת כל חודש עברי מופיע שם החודש. אפשר לבטל ולהשאיר לועזי בלבד.' },
        { q: 'מתי חלים החגים ב-2027?', a: 'למשל: ט״ו בשבט ב-23 בינואר, פורים ב-23 במרץ, פסח ב-22 באפריל, יום העצמאות ב-12 במאי, שבועות ב-11 ביוני וראש השנה תשפ״ח ב-2 באוקטובר 2027 — כולם מסומנים בלוח.' },
        { q: 'אפשר להדפיס את כל השנה בדף אחד?', a: 'כן. בוחרים "כל השנה בדף אחד" ומקבלים 12 חודשים מוקטנים בדף A4, עם עיגול סביב ימי החג.' },
      ]}
      related={[{ label: 'טבלת מטלות לילדים', href: '/printables/chore-chart' }, { label: 'מערכת שעות להדפסה', href: '/printables/class-schedule' }, { label: 'ספירה לאחור ליום הולדת', href: '/tools/countdown' }, { label: 'כל החגים', href: '/holidays' }]}
    />
  )
}

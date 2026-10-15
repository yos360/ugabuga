// Shared validation is used by the browser and the server; no credentials live here.
export const SPACE_TYPES = {
  meet: { title: 'מתי נפגשים?', icon: '🗓️', path: '/meet', color: '#e0f2fe', subtitle: 'מציעים מועדים, שולחים לקבוצה ומוצאים זמן שמתאים לכולם.', action: 'יצירת סקר מועדים', example: 'מפגש החברים שלנו', item: 'מועד' },
  parents: { title: 'הרשמה לאספות הורים', icon: '🏫', path: '/parent-meetings', color: '#fef3c7', subtitle: 'המורה פותחת שעות. כל הורה בוחר שעה פנויה, בלי הודעות הלוך ושוב.', action: 'פתיחת הרשמה', example: 'אספת הורים — כיתה ג׳', item: 'שעה' },
  help: { title: 'לוח עזרה למשפחה', icon: '💛', path: '/family-help', color: '#dcfce7', subtitle: 'ארוחה, קניות או הסעה — כל אחד בוחר משימה ויום שבהם יוכל לעזור.', action: 'יצירת לוח עזרה', example: 'עוזרים למשפחה שלנו', item: 'משימה' },
  album: { title: 'אלבום מסיבה משותף', icon: '📸', path: '/party-album', color: '#fce7f3', subtitle: 'כל התמונות של כולם, בקישור אחד. מעלים, נזכרים ומורידים למכשיר.', action: 'פתיחת אלבום', example: 'הרגעים מהמסיבה שלנו', item: 'תמונה' },
}
export const PHOTO_MAX_BYTES = 600000
export const PHOTO_MAX_COUNT = 100
export const SPACE_ERRORS = {
  unavailable: 'הכלי עדיין בהכנה. בינתיים אפשר להתנסות בתצוגת ההדגמה.',
  not_found: 'הקישור לא נמצא, נסגר או שפג תוקפו.',
  not_owner: 'צריך לפתוח את קישור הניהול הפרטי כדי לבצע את הפעולה.',
  not_yours: 'אפשר לבטל רק הרשמה או תמונה שלכם.',
  slot_full: 'מישהו כבר תפס את המקום הזה. בחרו מקום פנוי אחר.',
  closed: 'המארגן סגר את ההרשמה. אפשר עדיין לצפות בפרטים.',
  rate_limited: 'בוצעו הרבה פעולות בזמן קצר. נסו שוב בעוד כמה דקות.',
  quota: 'מכסת התמונות הזמינה התמלאה. נסו שוב מאוחר יותר.',
  gallery_busy: 'מכסת הצפייה הזמינה נוצלה כרגע. נסו שוב מאוחר יותר.',
  bad_input: 'בדקו שהשם, התאריכים והפרטים שמילאתם תקינים.',
  too_many: 'הגענו למספר המשתתפים המרבי בלוח הזה.',
  photo_invalid: 'אפשר להעלות תמונת JPG, PNG או WebP. נסו תמונה קטנה יותר.',
  network: 'לא הצלחנו להתחבר. הפרטים נשארו כאן — נסו שוב.',
}
export const textValue = (v, n) => String(v ?? '').trim().slice(0, n)
export const validDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') && !Number.isNaN(Date.parse(v)) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v
export const validTime = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v || '')
export function normalizeSpace(kind, raw) {
  if (!SPACE_TYPES[kind] || !raw || typeof raw !== 'object') throw new Error('bad_input')
  const result = { title: textValue(raw.title, 100), note: textValue(raw.note, 600), place: textValue(raw.place, 140), items: [] }
  if (!result.title) throw new Error('bad_input')
  if (kind !== 'album') {
    if (!Array.isArray(raw.items) || raw.items.length < (kind === 'meet' ? 2 : 1) || raw.items.length > 80) throw new Error('bad_input')
    result.items = raw.items.map((x, i) => {
      if (!validDate(x.date) || !validTime(x.time || '00:00')) throw new Error('bad_input')
      const label = textValue(x.label, 100)
      if (kind === 'help' && !label) throw new Error('bad_input')
      return { id: `s${i + 1}`, date: x.date, time: x.time || '', label, capacity: kind === 'help' ? Math.min(10, Math.max(1, Number.parseInt(x.capacity) || 1)) : 1 }
    })
    const keys = result.items.map(x => `${x.date}|${x.time}|${kind === 'help' ? x.label : ''}`)
    if (new Set(keys).size !== keys.length) throw new Error('bad_input')
  }
  return result
}
export function makeTimeSlots(date, start, end, minutes) {
  const duration = Number(minutes)
  if (!validDate(date) || !validTime(start) || !validTime(end) || ![5,10,15,20,30].includes(duration)) return []
  const toMinutes = s => Number(s.slice(0,2)) * 60 + Number(s.slice(3))
  const rows = []
  for (let n = toMinutes(start); n + duration <= toMinutes(end) && rows.length < 80; n += duration) rows.push({ date, time: `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`, label: '', capacity: 1 })
  return rows
}
export function itemLabel(item) {
  const day = new Intl.DateTimeFormat('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(`${item.date}T12:00:00`))
  return `${day}${item.time ? ` · ${item.time}` : ''}${item.label ? ` — ${item.label}` : ''}`
}
export function bestMeeting(items, entries) {
  return items.map(item => ({...item, yes: entries.filter(e=>e.item_id===item.id&&e.value==='yes').length, maybe: entries.filter(e=>e.item_id===item.id&&e.value==='maybe').length}))
    .sort((a,b)=>b.yes-a.yes||b.maybe-a.maybe)
}
export const csvCell = v => `"${String(v ?? '').replace(/^[=+@-]/, x => `'${x}`).replaceAll('"','""')}"`
export function spaceCsv(space) {
  const rows = [['שם','מועד / משימה','תשובה'], ...space.entries.map(e => [e.name, itemLabel(space.config.items.find(i=>i.id===e.item_id)), ({yes:'מתאים',maybe:'אולי',no:'לא מתאים',booked:'רשום'})[e.value]])]
  return '\ufeff' + rows.map(r=>r.map(csvCell).join(',')).join('\r\n')
}
export function calendarEvent(space, item) {
  const esc = s => String(s || '').replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(';','\\;').replaceAll(',','\\,')
  const start = item.date.replaceAll('-','') + 'T' + (item.time || '09:00').replace(':','') + '00'
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Ugabuga//Shared spaces//HE','BEGIN:VEVENT',`UID:${space.code}-${item.id}@ugabuga.co.il`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z')}`,`DTSTART;TZID=Asia/Jerusalem:${start}`,`SUMMARY:${esc(space.config.title)}`,`LOCATION:${esc(space.config.place)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n')
}

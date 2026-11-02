// Per-portion facts for /parasha/:slug, computed from the portion's reference and the Israel
// reading calendar: place in the book, chapters, the next Shabbat it is read (alone or joined),
// and how often it is joined over the coming ten years. Pure (no React) so tests can run it.
import { HDate } from '@hebcal/core'
import { PARASHOT, PARASHA_BOOKS } from '../data/parashot.js'
import { addDays } from './shabbatTimes.js'
import { civilDate, readingForDate } from './parashaCalendar.js'

const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'], TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ']
// Chapter/verse numbers (1–99) as Hebrew letters, with טו/טז instead of the divine-name spellings.
export function hebrewNumber(n) {
  if (n === 15) return 'טו'
  if (n === 16) return 'טז'
  return TENS[Math.floor(n / 10)] + ONES[n % 10]
}
// "Genesis 6:9-11:32" → { from: [6, 9], to: [11, 32], text: 'ו, ט – יא, לב' }; "Deuteronomy 31:1-30" stays in one chapter.
export function refRange(ref) {
  const [, a, b, c, d] = ref.match(/(\d+):(\d+)-(\d+)(?::(\d+))?/)
  const from = [Number(a), Number(b)], to = d ? [Number(c), Number(d)] : [Number(a), Number(c)]
  const h = ([ch, v]) => `${hebrewNumber(ch)}, ${hebrewNumber(v)}`
  return { from, to, chapters: to[0] - from[0] + 1, text: `${h(from)} – ${h(to)}` }
}
const dateLabel = iso => iso.split('-').reverse().join('.')
const plain = text => text.replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, '')

// Next Shabbat (on or after `today`) on which this portion is read in Israel; Vezot Haberakhah is read on Simchat Torah.
export function nextReading(p, today) {
  if (p.slug === PARASHOT[53].slug) {
    const hy = new HDate(new Date(`${today}T12:00:00`)).getFullYear()
    for (const year of [hy, hy + 1]) {
      const iso = civilDate(new HDate(22, 7, year).greg())
      if (iso >= today) return { date: iso, hebrewDate: plain(new HDate(22, 7, year).renderGematriya()), with: null, simchatTorah: true }
    }
  }
  for (let i = 0, day = today; i < 60; i++, day = addDays(day, 7)) {
    const r = readingForDate(day)
    if (r?.portions.some(x => x.slug === p.slug)) return { date: r.date, hebrewDate: plain(r.hebrewDate), with: r.portions.find(x => x.slug !== p.slug) || null }
  }
  return null
}

// Over the coming ten years (from `today`), how many times the portion is read alone and joined to its neighbour.
export function joinStats(p, today) {
  if (p.slug === PARASHOT[53].slug) return null
  let alone = 0, joined = 0, partner = null, day = today
  const until = addDays(today, 3652)
  while (day <= until) {
    const r = readingForDate(day)
    if (r?.portions.some(x => x.slug === p.slug)) {
      if (r.portions.length > 1) { joined++; partner = r.portions.find(x => x.slug !== p.slug) } else alone++
    }
    day = addDays(r ? r.date : day, 7)
  }
  return { alone, joined, partner, untilYear: until.slice(0, 4) }
}

export function parashaFacts(p, w, today) {
  const index = PARASHOT.indexOf(p), inBook = PARASHOT.filter(x => x.book === p.book)
  return { p, w, index: index + 1, bookIndex: inBook.indexOf(p) + 1, bookCount: inBook.length, bookNumber: PARASHA_BOOKS.indexOf(p.book) + 1, range: refRange(p.ref), next: nextReading(p, today), joins: joinStats(p, today), first: inBook[0] === p, last: inBook.at(-1) === p }
}

const ORDINAL_BOOK = ['', 'הראשון', 'השני', 'השלישי', 'הרביעי', 'החמישי']
const listText = items => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ו${items.at(-1)}`

export function parashaParagraphs(f) {
  const { p, w, range, next, joins } = f
  const place = f.first ? `הפרשה הראשונה בספר ${p.book}` : f.last ? `הפרשה האחרונה בספר ${p.book}` : `הפרשה ה־${f.bookIndex} מתוך ${f.bookCount} בספר ${p.book}`
  const out = [
    `פרשת ${p.name} היא ${place}, הספר ${ORDINAL_BOOK[f.bookNumber]} בתורה, והפרשה ה־${f.index} מתוך 54 הפרשות. היא מתחילה בפרק ${hebrewNumber(range.from[0])} פסוק ${hebrewNumber(range.from[1])} ומסתיימת בפרק ${hebrewNumber(range.to[0])} פסוק ${hebrewNumber(range.to[1])}${range.chapters > 1 ? ` — ${range.chapters} פרקים בסך הכול` : ''}.`,
    `בפרשה פוגשים את ${listText(w.characters.map(c => c[0]))}. האירוע הראשון שבסדר האירועים שלמטה: ${w.events[0]}; והאחרון: ${w.events.at(-1)}.`,
  ]
  if (next) out.push(next.simchatTorah
    ? `את וזאת הברכה קוראים בשמחת תורה, ${next.hebrewDate} (${dateLabel(next.date)}), גם כשהחג אינו חל בשבת. באותו בוקר מתחילים שוב לקרוא את בראשית.`
    : `השבת הבאה שבה קוראים בארץ ישראל את פרשת ${p.name} היא ${dateLabel(next.date)} (${next.hebrewDate})${next.with ? `, ובה היא נקראת יחד עם פרשת ${next.with.name}` : ''}.`)
  if (joins && joins.joined) out.push(`בעשר השנים הקרובות (עד ${joins.untilYear}) פרשת ${p.name} נקראת ${joins.alone} פעמים לבד ו־${joins.joined} פעמים יחד עם פרשת ${joins.partner.name}. מחברים פרשות בשנים שבהן יש פחות שבתות פנויות לקריאה.`)
  else if (joins) out.push(`בעשר השנים הקרובות (עד ${joins.untilYear}) פרשת ${p.name} נקראת תמיד בשבת משלה, בלי להתחבר לפרשה אחרת.`)
  out.push(`הרעיון שכדאי לקחת מהפרשה: ${w.value}`)
  return out
}

export function parashaFaq(f) {
  const { p, w, range, next } = f
  return [
    ...(next ? [{ q: `מתי קוראים את פרשת ${p.name}?`, a: next.simchatTorah ? `בשמחת תורה — ${next.hebrewDate} (${dateLabel(next.date)}). זו הפרשה האחרונה בתורה, ואחריה מתחילים מבראשית.` : `בארץ ישראל: בשבת ${dateLabel(next.date)}, ${next.hebrewDate}${next.with ? `, יחד עם פרשת ${next.with.name}` : ''}. בחוץ לארץ התאריך עשוי להיות שונה.` }] : []),
    { q: `באיזה ספר ובאילו פרקים נמצאת פרשת ${p.name}?`, a: `בספר ${p.book}, מפרק ${hebrewNumber(range.from[0])} פסוק ${hebrewNumber(range.from[1])} עד פרק ${hebrewNumber(range.to[0])} פסוק ${hebrewNumber(range.to[1])}. היא הפרשה ה־${f.bookIndex} בספר.` },
    { q: `מי הדמויות בפרשת ${p.name}?`, a: w.characters.map(([name, about]) => `${name} — ${about}`).join('. ') + '.' },
    { q: `איזה פסוק כדאי לזכור מפרשת ${p.name}?`, a: `"${w.verse.text}" (${w.verse.ref}).` },
    { q: 'מה אפשר להדפיס מהדף?', a: `חוברת עבודה לפרשת ${p.name} בשתי רמות, חידון של עשר שאלות עם תשובות, ודף מורה נפרד עם מקורות.` },
  ]
}

export function parashaDescription(f) {
  const { p, w } = f
  return `פרשת ${p.name} לילדים (ספר ${p.book}): ${w.events[0]}, ${w.events.at(-1)}. תקציר, דמויות, מושגים, 10 שאלות ותשובות וחוברת עבודה להדפסה.`
}

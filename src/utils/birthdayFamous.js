// Pure helpers for /tools/birthday-famous (src/pages/tools/BirthdayFamous.jsx): read the births list of a
// Hebrew-Wikipedia date page and keep only kid-safe people. Kept apart from the page so tests can run them.

// Loose name key so "ג'יי. קיי. רולינג" and "ג'יי קיי רולינג" compare equal
export const nameKey = s => s.replace(/["'׳״.\-־–\s]/g, '')

// Hebrew letters are not \w in JS, so \b never fires next to them: a "word" here ends at a space, punctuation or the end.
const END = '(?=[\\s,.;:()\\]–—-]|$)', START = '(?:^|[\\s,(\\[–—-])'
// Death markers: "נפטר", "מת", "נהרג"…, a cross, ז״ל, or a life span such as "(1942–1995)".
export const DEAD = /נפטר|נפטרה|נרצח|נהרג|הוצא להורג|התאבד|(^|[\s(])מתה?([\s,)]|$)|†|ז"ל|ז״ל|\(\s*\[*\d{3,4}\]*\s*[–—-]\s*\[*\d{3,4}/
// Professions a child may meet here (allowlist) — and everyone we keep out (blocklist),
// including politicians, military, royalty, religion and crime. A person appears only if
// their description matches SAFE and not BLOCK.
export const SAFE = new RegExp(`זמר|שחקן|שחקנית|כדורגל|כדורסל|טניסא|שחיין|אצן|מתעמל|ספורטא|שחמטא|גולש|אלוף אולימפי|מדען|פיזיקא|כימא|אסטרונום|ממציא|סופר|משורר|מאייר|צייר|פסל|נגן|פסנתרן|כנר|מלחין|מוזיקא|יוצר|במאי|במאית|רקדן|${START}שפית?${END}|קוסם|אסטרונאוט|צלם|בדרן|קומיקא|כוריאוגרף|אמן|אמנית|דוגמנ|מאמן|זואולוג|חוקרת? טבע`)
export const BLOCK = new RegExp(`פוליטיקא|ראש ממשלה|ראש הממשלה|נשיא|${START}[והכש]?(?:ה)?שר[הת]?${END}|חבר כנסת|חברת כנסת|מושל|דיפלומט|גנרל|מצביא|קצין|מפקד|לוחם|צבא|מהפכן|פושע|רוצח|עבריין|נאצי|דיקטטור|מלך|מלכה|קיסר|נסיך|נסיכה|דוכס|אציל|${START}[והכש]?(?:ה)?רבי?${END}|כומר|בישוף|אפיפיור|תאולוג|טרור|מאפי|כנופי|פורנו|ארוטי|הימור`)

export const stripWiki = s => s
  .replace(/<ref[^>]*\/>/g, '').replace(/<ref[\s\S]*?<\/ref>/g, '')
  .replace(/\{\{[^}]*\}\}/g, '')
  .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/'{2,}/g, '').trim()

// All people a date page's wikitext lists as born: year, title, display name and the rest of the line.
export function parseBorn(text) {
  // Headings vary between pages ("== נולדו ==", "==נולדו =="), so match loosely.
  const start = text.search(/^==\s*נולדו/m)
  if (start < 0) return []
  const next = text.slice(start + 2).search(/\n==[^=]/)
  const end = next < 0 ? undefined : start + 2 + next
  const people = []
  for (const line of text.slice(start, end).split('\n')) {
    const m = line.match(/^\*\s*\[\[(\d{1,4})\]\]\s*[–—-]\s*'*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]'*(.*)$/)
    if (!m) continue
    people.push({ year: Number(m[1]), title: m[2].trim(), display: (m[3] || m[2]).trim(), rest: m[4] || '' })
  }
  return people
}

// Short role text for the card: the description up to the first period/parenthesis.
export function roleOf(rest) {
  const clean = stripWiki(rest).replace(/^[\s,،–—-]+/, '')
  const cut = clean.search(/[.(]/)
  const role = (cut > 0 ? clean.slice(0, cut) : clean).replace(/[\s,;–—-]+$/, '')
  return role.length > 60 ? role.slice(0, 57) + '…' : role
}

// Kid-safe extra people from the date page, newest first, skipping anyone already curated.
export function extraPeople(born, curated, limit) {
  const have = new Set(curated.map(p => nameKey(p.name)))
  const extras = []
  for (const p of [...born].sort((a, b) => b.year - a.year)) {
    const desc = stripWiki(p.rest)
    if (have.has(nameKey(p.title)) || have.has(nameKey(p.display))) continue
    if (!SAFE.test(desc) || BLOCK.test(desc)) continue
    have.add(nameKey(p.title)); have.add(nameKey(p.display))
    extras.push({ name: p.display, title: p.title, role: roleOf(p.rest), year: p.year, desc: '', emoji: '🌟', image: null, url: null, alive: p.year > 1930 && !DEAD.test(p.rest) })
    if (extras.length >= limit) break
  }
  return extras
}

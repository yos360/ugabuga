import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// Kid-safe "who was born on my day": the first people shown come from the hand-curated,
// source-checked births in src/data/today-game/MM.json (items with type "born"). On top of
// those, the Hebrew-Wikipedia date page adds MORE people — but only through a strict
// profession allowlist (singers, athletes, scientists, authors, musicians…) plus a blocklist
// (politicians, military, royals, criminals…), so a raw "births" list (dictators, war
// figures…) can never reach a child. Wikipedia also enriches everyone with a photo, an
// article link and the alive check.

const today = new Date()
const pad = n => String(n).padStart(2, '0')
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const MONTH_FILES = import.meta.glob('../../data/today-game/*.json')
const API = 'https://he.wikipedia.org/w/api.php'

const wikiUrl = title => `https://he.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
// Loose name key so "ג'יי. קיי. רולינג" and "ג'יי קיי רולינג" compare equal
const nameKey = s => s.replace(/["'׳״.\-־–\s]/g, '')

async function curatedPeople(month, day) {
  const loader = MONTH_FILES[`../../data/today-game/${pad(month)}.json`]
  if (!loader) return []
  const mod = await loader()
  const items = (mod.default || mod)[`${pad(month)}-${pad(day)}`] || []
  return items
    .filter(q => q.type === 'born' && q.person)
    .map(q => {
      const label = q.options[q.answer] || ''
      const cut = label.indexOf(', ')
      const name = cut > 0 ? label.slice(0, cut) : label
      return { name, role: cut > 0 ? label.slice(cut + 2) : '', year: q.year, desc: q.explain, emoji: q.emoji, image: null, url: null, alive: false }
    })
    .sort((a, b) => a.year - b.year)
}

async function api(params, signal) {
  const res = await fetch(`${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`, { signal })
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`)
  return res.json()
}

const DEAD = /נפטר|נרצח|נהרג|הוצא|התאבד|(^|[\s(])מתה?([\s,)]|$)/
// Professions a child may meet here (allowlist) — and everyone we keep out (blocklist),
// including politicians, military, royalty, religion and crime. A person appears only if
// their description matches SAFE and not BLOCK.
const SAFE = /זמר|שחקן|שחקנית|כדורגל|כדורסל|טניסא|שחיין|אצן|מתעמל|ספורטא|שחמטא|גולש|אלוף אולימפי|מדען|פיזיקא|כימא|אסטרונום|ממציא|סופר|משורר|מאייר|צייר|פסל|נגן|פסנתרן|כנר|מלחין|מוזיקא|יוצר|במאי|במאית|רקדן|שף\b|קוסם|אסטרונאוט|צלם|בדרן|קומיקא|כוריאוגרף|אמן|אמנית|דוגמנ|מאמן|זואולוג|חוקרת? טבע/
const BLOCK = /פוליטיקא|ראש ממשלה|ראש הממשלה|נשיא|שר\s|שרת\s|חבר כנסת|מושל|דיפלומט|גנרל|מצביא|קצין|מפקד|לוחם|צבא|מהפכן|פושע|רוצח|עבריין|נאצי|דיקטטור|מלך|מלכה|קיסר|נסיך|נסיכה|דוכס|אציל|רב\s|הרב\s|כומר|בישוף|אפיפיור|תאולוג|טרור|מאפי|כנופי|פורנו|ארוטי|הימור/
const stripWiki = s => s
  .replace(/<ref[^>]*\/>/g, '').replace(/<ref[\s\S]*?<\/ref>/g, '')
  .replace(/\{\{[^}]*\}\}/g, '')
  .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2').replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/'{2,}/g, '').trim()

// All people the Hebrew Wikipedia date page lists as born: year, name(s) and description.
// Used both for the curated people's alive check and to add more kid-safe people.
async function bornOnDatePage(month, day, signal) {
  const parsed = await api({ action: 'parse', page: `${day} ב${MONTHS[month - 1]}`, prop: 'wikitext' }, signal)
  const text = parsed.parse?.wikitext || ''
  const start = text.indexOf('== נולדו')
  if (start < 0) return []
  const end = text.indexOf('\n== ', start + 5)
  const people = []
  for (const line of text.slice(start, end > 0 ? end : undefined).split('\n')) {
    const m = line.match(/^\*\s*\[\[(\d{1,4})\]\]\s*[–—-]\s*'*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]'*(.*)$/)
    if (!m) continue
    people.push({ year: Number(m[1]), title: m[2].trim(), display: (m[3] || m[2]).trim(), rest: m[4] || '' })
  }
  return people
}

// Short role text for the card: the description up to the first period/parenthesis.
function roleOf(rest) {
  const clean = stripWiki(rest).replace(/^[\s,،–—-]+/, '')
  const cut = clean.search(/[.(]/)
  const role = (cut > 0 ? clean.slice(0, cut) : clean).replace(/[\s,;–—-]+$/, '')
  return role.length > 60 ? role.slice(0, 57) + '…' : role
}

// Kid-safe extra people from the date page, newest first, skipping anyone already curated.
function extraPeople(born, curated, limit) {
  const have = new Set(curated.map(p => nameKey(p.name)))
  const extras = []
  for (const p of [...born].sort((a, b) => b.year - a.year)) {
    const desc = stripWiki(p.rest)
    if (have.has(nameKey(p.title)) || have.has(nameKey(p.display))) continue
    if (!SAFE.test(desc) || BLOCK.test(desc)) continue
    have.add(nameKey(p.title)); have.add(nameKey(p.display))
    extras.push({ name: p.title, role: roleOf(p.rest), year: p.year, desc: '', emoji: '🌟', image: null, url: null, alive: p.year > 1930 && !DEAD.test(p.rest) })
    if (extras.length >= limit) break
  }
  return extras
}

// Adds photo + article link (skipping missing and disambiguation pages).
async function enrich(people, signal) {
  const data = await api({
    action: 'query',
    titles: people.map(p => p.name).join('|'),
    prop: 'pageimages|pageprops',
    piprop: 'thumbnail',
    pithumbsize: '400',
    ppprop: 'disambiguation',
    redirects: '1',
  }, signal)
  const pages = {}
  for (const pg of data.query?.pages || []) {
    if (pg.missing || pg.pageprops?.disambiguation !== undefined) continue
    pages[pg.title] = { image: pg.thumbnail?.source || null, url: wikiUrl(pg.title) }
  }
  for (const rd of data.query?.redirects || []) if (pages[rd.to]) pages[rd.from] = pages[rd.to]
  for (const n of data.query?.normalized || []) if (pages[n.to]) pages[n.from] = pages[n.to]

  return people.map(p => ({ ...p, ...(pages[p.name] || {}) }))
}

// Age on today's date: one less if this year's birthday hasn't arrived yet
function ageToday(year, month, day) {
  const m = today.getMonth() + 1, d = today.getDate()
  const passed = m > month || (m === month && d >= day)
  return today.getFullYear() - year - (passed ? 0 : 1)
}

const yearLabel = y => (y < 0 ? `${-y} לפנה״ס` : String(y))

export default function BirthdayFamous() {
  const [date, setDate] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const [, month, day] = date.split('-').map(Number)
    if (!day || !month) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    let alive = true
    setLoading(true)

    curatedPeople(month, day)
      .then(async curated => {
        if (!alive) return
        setPeople(curated)
        if (curated.length) setLoading(false)
        try {
          const born = await bornOnDatePage(month, day, controller.signal)
          // Alive check for curated people: the date page lists them that year with no death mention.
          const living = new Set()
          for (const p of born) if (!DEAD.test(p.rest)) { living.add(`${p.year}|${nameKey(p.title)}`); living.add(`${p.year}|${nameKey(p.display)}`) }
          const extras = extraPeople(born, curated, Math.max(0, 12 - curated.length))
          const all = [
            ...curated.map(p => ({ ...p, alive: p.year > 1930 && living.has(`${p.year}|${nameKey(p.name)}`) })),
            ...extras,
          ].sort((a, b) => a.year - b.year)
          if (alive) { setPeople(all); setLoading(false) }
          if (all.length) {
            const rich = await enrich(all, controller.signal)
            if (alive) setPeople(rich)
          }
        } catch { /* offline: keep the curated list without photos */ }
        finally { if (alive) setLoading(false); clearTimeout(timeout) }
      })
      .catch(() => { if (alive) { setPeople([]); setLoading(false) } })

    return () => { alive = false; clearTimeout(timeout); controller.abort() }
  }, [date])

  const [, m, d] = date.split('-').map(Number)
  const prettyDate = d && m ? `${d} ב${MONTHS[m - 1]}` : ''
  const tunnelHref = d && m ? `/time-tunnel/${pad(m)}-${pad(d)}` : '/time-tunnel'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SEO
        title="מי נולד ביום שלי? מפורסמים לפי תאריך"
        description="גלו אילו אנשים מפורסמים – ממציאים, סופרים, ספורטאים ואמנים – נולדו בתאריך שלכם."
        path="/tools/birthday-famous"
      />
      <Breadcrumbs
        items={[
          { label: 'ראשי', href: '/' },
          { label: 'יום הולדת', href: '/birthday' },
          { label: 'מי נולד ביום שלי?' }
        ]}
      />
      <header className="mx-auto max-w-3xl text-center">
        <div className="text-6xl">🎂✨</div>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">מי נולד ביום שלי?</h1>
        <p className="mt-3 text-xl text-[var(--muted-foreground)]">בחרו תאריך ונגלה אילו אנשים מפורסמים נולדו בו.</p>
        <div className="mx-auto mt-6 flex max-w-md gap-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-lg"
          />
        </div>
      </header>

      {loading && (
        <div className="py-16 text-center text-xl" role="status">
          🔎 מחפשים מי נולד ב-{prettyDate}...
        </div>
      )}

      {!loading && people.length === 0 && (
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border-2 border-slate-200 bg-white p-8 text-center">
          <div className="text-5xl">🔭</div>
          <p className="mt-3 text-xl font-bold">עוד לא הוספנו מפורסמים שנולדו ב-{prettyDate}.</p>
          <p className="mt-2 text-[var(--muted-foreground)]">אבל קרו בתאריך הזה דברים מעניינים אחרים!</p>
          <Link to={tunnelHref} className="mt-4 inline-block font-bold text-[var(--accent)]">⏳ למנהרת הזמן של {prettyDate} ←</Link>
        </div>
      )}

      {!loading && people.length > 0 && (
        <>
          <h2 className="mt-10 text-center text-2xl font-black">אנשים שנולדו ב-{prettyDate}</h2>
          <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.map(person => {
              const Card = person.url ? 'a' : 'div'
              const linkProps = person.url ? { href: person.url, target: '_blank', rel: 'noreferrer' } : {}
              return (
                <Card
                  key={person.name}
                  {...linkProps}
                  className="group overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-[0_5px_0_rgba(20,30,60,.1)] transition hover:-translate-y-1"
                >
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="h-56 w-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-violet-100 text-6xl">{person.emoji || '🌟'}</div>
                  )}
                  <div className="p-5">
                    <h3 className="text-2xl font-black">{person.name}</h3>
                    <p className="mt-1 font-bold text-[var(--accent)]">
                      {person.role && `${person.role} · `}
                      נולד/ה ב-<bdi>{yearLabel(person.year)}</bdi>
                      {person.alive && ` · בן/בת ${ageToday(person.year, m, d)}`}
                    </p>
                    {person.desc && <p className="mt-2 line-clamp-3 text-[var(--muted-foreground)]">{person.desc}</p>}
                    {person.url && <span className="mt-4 inline-block font-bold text-[var(--accent)]">לקריאה בוויקיפדיה ←</span>}
                  </div>
                </Card>
              )
            })}
          </section>
          <p className="mt-8 text-center">
            <Link to={tunnelHref} className="font-bold text-[var(--accent)]">⏳ מה עוד קרה ב-{prettyDate}? למנהרת הזמן ←</Link>
          </p>
        </>
      )}
    </div>
  )
}

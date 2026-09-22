import { useEffect, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const today = new Date()
const pad = n => String(n).padStart(2, '0')
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const API = 'https://he.wikipedia.org/w/api.php'
const MAX_PEOPLE = 12

// Fallback when Wikipedia is unreachable — always real people, never events/objects
const FALLBACK_DATA = [
  { title: 'אלברט איינשטיין', year: 1879, died: 1955, desc: 'פיזיקאי, אבי תורת היחסות', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Albert_Einstein%28Nobel%29.jpg/220px-Albert_Einstein%28Nobel%29.jpg' },
  { title: 'מוחמד עלי', year: 1942, died: 2016, desc: 'מתאגרף אמריקאי, מגדולי הספורטאים בהיסטוריה', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Muhammad_Ali_1967.jpg/220px-Muhammad_Ali_1967.jpg' },
  { title: 'נלסון מנדלה', year: 1918, died: 2013, desc: 'נשיא דרום אפריקה ולוחם למען זכויות אדם', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Nelson_Mandela-2008_%28edit%29.jpg/220px-Nelson_Mandela-2008_%28edit%29.jpg' },
  { title: 'מרילין מונרו', year: 1926, died: 1962, desc: 'שחקנית וזמרת אמריקאית', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Marilyn_Monroe_in_Some_Like_It_Hot.jpg/220px-Marilyn_Monroe_in_Some_Like_It_Hot.jpg' },
  { title: 'סטיב ג\'ובס', year: 1955, died: 2011, desc: 'מייסד אפל', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Steve_Jobs_1955-2011.jpg/220px-Steve_Jobs_1955-2011.jpg' },
  { title: 'אריתה פרנקלין', year: 1942, died: 2018, desc: 'זמרת אמריקאית, "מלכת הסול"', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Aretha_Franklin_1968.jpg/220px-Aretha_Franklin_1968.jpg' },
]

const wikiUrl = title => `https://he.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`

async function api(params, signal) {
  const res = await fetch(`${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`, { signal })
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`)
  return res.json()
}

// Strip Hebrew Wikipedia markup down to plain text
const stripMarkup = s =>
  s
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/'''?/g, '')
    .replace(/^\s*[,،]\s*/, '')
    .trim()

// Parse only the "== נולדו ==" (people born) section of a Hebrew Wikipedia
// date page — the same page also lists events, deaths and holidays, and
// mixing those in shows planes/events instead of people (the bug being fixed).
function parseBornPeople(wikitext) {
  const start = wikitext.indexOf('== נולדו')
  if (start < 0) return []
  const end = wikitext.indexOf('\n== ', start + 5)
  const section = wikitext.slice(start, end > 0 ? end : undefined)

  const people = []
  for (const line of section.split('\n')) {
    // Expected shape: * [[1955]] – [[איזה שם|תווית]] , תיאור קצר (נפטר ב-[[2011]])
    const m = line.match(/^\*\s*\[\[(\d{1,4})\]\]\s*[–—-]\s*'*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]'*(.*)$/)
    if (!m) continue
    const rest = m[4] || ''
    const diedMatch = rest.match(/\((?:נפטרה?|נרצחה?|הוצאה? להורג|נהרגה?|התאבדה?)[^)]*?\[\[(\d{1,4})\]\]/)
    people.push({
      year: Number(m[1]),
      title: m[2].trim(),
      name: (m[3] || m[2]).trim(),
      desc: stripMarkup(rest)
        .replace(/\s*\((נפטר|נרצח|הוצא|נהרג|התאבד)[^)]*\)\s*$/, '')
        .replace(/[,.\s]+$/, ''),
      died: diedMatch ? Number(diedMatch[1]) : null,
    })
  }
  return people
}

async function loadPeople(day, month, signal) {
  const pageTitle = `${day} ב${MONTHS[month - 1]}`
  const parsed = await api({ action: 'parse', page: pageTitle, prop: 'wikitext' }, signal)
  const people = parseBornPeople(parsed.parse?.wikitext || '')
  if (!people.length) return []

  // Enrich with thumbnails + 30-day pageviews (popularity), in batches of 50 titles
  const info = {}
  for (let i = 0; i < people.length; i += 50) {
    const batch = people.slice(i, i + 50)
    const data = await api({
      action: 'query',
      titles: batch.map(p => p.title).join('|'),
      prop: 'pageimages|pageviews',
      piprop: 'thumbnail',
      pithumbsize: '400',
      pvipdays: '30',
      redirects: '1',
    }, signal)
    for (const pg of data.query?.pages || []) {
      info[pg.title] = {
        image: pg.thumbnail?.source || null,
        views: Object.values(pg.pageviews || {}).reduce((a, b) => a + (b || 0), 0),
      }
    }
    for (const rd of data.query?.redirects || []) if (info[rd.to]) info[rd.from] = info[rd.to]
  }

  // Prefer people with a photo, then rank by popularity
  const ranked = people
    .map(p => ({ ...p, ...(info[p.title] || { image: null, views: 0 }) }))
    .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0) || b.views - a.views)
    .slice(0, MAX_PEOPLE)
    .sort((a, b) => b.views - a.views)

  return ranked.map(p => ({ ...p, url: wikiUrl(p.title) }))
}

export default function BirthdayFamous() {
  const [date, setDate] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const [, month, day] = date.split('-').map(Number)
    if (!day || !month) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    setLoading(true)
    setFallback(false)

    loadPeople(day, month, controller.signal)
      .then(list => {
        if (list.length) {
          setPeople(list)
        } else {
          setPeople(FALLBACK_DATA.map(p => ({ ...p, name: p.title, url: wikiUrl(p.title) })))
          setFallback(true)
        }
      })
      .catch(() => {
        setPeople(FALLBACK_DATA.map(p => ({ ...p, name: p.title, url: wikiUrl(p.title) })))
        setFallback(true)
      })
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    return () => { clearTimeout(timeout); controller.abort() }
  }, [date])

  const [, m, d] = date.split('-').map(Number)
  const prettyDate = d && m ? `${d} ב${MONTHS[m - 1]}` : ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SEO
        title="מי נולד ביום ההולדת שלך? | עוגה בוגה"
        description="גלו אילו אנשים מפורסמים נולדו בתאריך שלכם בעזרת Wikipedia בעברית."
        path="/tools/birthday-famous"
      />
      <Breadcrumbs
        items={[
          { label: 'ראשי', href: '/' },
          { label: 'יום הולדת', href: '/birthday' },
          { label: 'מי נולד ביום ההולדת שלך?' }
        ]}
      />
      <header className="mx-auto max-w-3xl text-center">
        <div className="text-6xl">🎂✨</div>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">מי נולד ביום ההולדת שלך?</h1>
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

      {!loading && people.length > 0 && (
        <>
          <h2 className="mt-10 text-center text-2xl font-black">
            {fallback ? 'לא הצלחנו להתחבר לוויקיפדיה — הנה כמה אנשים מפורסמים לדוגמה' : `אנשים שנולדו ב-${prettyDate}`}
          </h2>
          <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.map(person => (
              <a
                key={person.title}
                href={person.url}
                target="_blank"
                rel="noreferrer"
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
                  <div className="flex h-56 items-center justify-center bg-violet-100 text-6xl">🌟</div>
                )}
                <div className="p-5">
                  <h3 className="text-2xl font-black">{person.name}</h3>
                  <p className="mt-1 font-bold text-[var(--accent)]">
                    <bdi dir="ltr">{person.year}{person.died ? `–${person.died}` : ''}</bdi>
                    {!person.died && ` · בן/בת ${today.getFullYear() - person.year}`}
                  </p>
                  {person.desc && <p className="mt-2 line-clamp-3 text-[var(--muted-foreground)]">{person.desc}</p>}
                  <span className="mt-4 inline-block font-bold text-[var(--accent)]">לקריאה בוויקיפדיה ←</span>
                </div>
              </a>
            ))}
          </section>
        </>
      )}
    </div>
  )
}

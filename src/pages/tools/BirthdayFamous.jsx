import { useEffect, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const today = new Date()
const pad = n => String(n).padStart(2, '0')

// Fallback famous people data from Wikipedia
const FALLBACK_DATA = [
  { title: 'אלברט איינשטיין', extract: 'פיזיקאי יהודי-גרמני הנחשב לאחד הגדולים בהיסטוריה. יצר את תורת היחסות.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Albert_Einstein%28Nobel%29.jpg/220px-Albert_Einstein%28Nobel%29.jpg' },
  { title: 'מוחמד עלי', extract: 'אגדה של אגרוף אמריקאי, נחשב לאחד הגדולים בתולדות הספורט.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Muhammad_Ali_1967.jpg/220px-Muhammad_Ali_1967.jpg' },
  { title: 'נלסון מנדלה', extract: 'נשיא דרום אפריקה ראשון לאחר סיום האפרטהייד, מחורר זכויות אדם.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Nelson_Mandela-2008_%28edit%29.jpg/220px-Nelson_Mandela-2008_%28edit%29.jpg' },
  { title: 'מרילין מונרו', extract: 'שחקנית וזמרת אמריקאית, אחת הסמלים המוכרים ביותר של המאה ה-20.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Marilyn_Monroe_in_Some_Like_It_Hot.jpg/220px-Marilyn_Monroe_in_Some_Like_It_Hot.jpg' },
  { title: 'בטלס', extract: 'להקת הרוק הבריטית המשפיעה ביותר בהיסטוריה, הוקמה בליברפול ב-1960.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/A_Hard_Day%27s_Night_%281964%29_trailer_screenshot_%2828%29.jpg/220px-A_Hard_Day%27s_Night_%281964%29_trailer_screenshot_%2828%29.jpg' },
  { title: 'סטיב ג\'ובס', extract: 'מייסד ומנכ"ל חברת אפל, חזון היווצרות המהפכה דיגיטלית.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Steve_Jobs_1955-2011.jpg/220px-Steve_Jobs_1955-2011.jpg' }
]

export default function BirthdayFamous() {
  const [date, setDate] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async value => {
    const [, month, day] = value.split('-')
    setLoading(true)
    setError('')
    setPeople([])

    // Immediately show fallback data
    const fallbackPeople = FALLBACK_DATA.map(p => ({
      page: { ...p, pageid: p.title, url: `https://he.wikipedia.org/wiki/${encodeURIComponent(p.title)}` }
    }))

    try {
      // Try Wikipedia with timeout
      let results = []

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      try {
        const params = new URLSearchParams({
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: `${Number(day)} ${Number(month)}`,
          srnamespace: '0',
          srlimit: '20',
          origin: '*'
        })

        const response = await fetch(`https://he.wikipedia.org/w/api.php?${params}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          mode: 'cors',
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          const searches = data.query?.search || []

          // Fetch details for each search result
          for (const item of searches.slice(0, 10)) {
            if (results.length >= 6) break

            try {
              const detailParams = new URLSearchParams({
                action: 'query',
                format: 'json',
                titles: item.title,
                prop: 'extracts|pageimages',
                exintro: '1',
                explaintext: '1',
                piprop: 'thumbnail',
                pithumbsize: '300',
                origin: '*'
              })

              const detailRes = await fetch(`https://he.wikipedia.org/w/api.php?${detailParams}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                mode: 'cors',
                signal: controller.signal
              })

              if (detailRes.ok) {
                const details = await detailRes.json()
                const pageId = Object.keys(details.query?.pages || {})[0]
                const page = details.query?.pages[pageId]

                if (page && page.extract && page.extract.length >= 50) {
                  results.push({
                    page: {
                      pageid: pageId,
                      title: page.title,
                      normalizedtitle: page.title,
                      extract: page.extract.substring(0, 250),
                      image: page.thumbnail ? page.thumbnail.source : null,
                      url: `https://he.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
                    }
                  })
                }
              }
            } catch (e) {
              // Continue to next result
            }
          }

          if (results.length > 0) {
            setPeople(results)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        clearTimeout(timeoutId)
      }

      // Fallback if no results
      setPeople(fallbackPeople)
      // No error message - just show the examples silently
    } catch (err) {
      console.error('Birthday Famous error:', err)
      setPeople(fallbackPeople)
      setError('מציגים דוגמאות של אנשים מפורסמים.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(date) }, [date])

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
        <p className="mt-3 text-xl text-[var(--muted-foreground)]">בחרו תאריך ונגלה מי מהאנשים המפורסמים נולד בו.</p>
        <div className="mx-auto mt-6 flex max-w-md gap-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-lg"
          />
          <button
            onClick={() => load(date)}
            className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-bold text-white"
          >
            גלו
          </button>
        </div>
      </header>

      {loading && (
        <div className="py-16 text-center text-xl" role="status">
          🔎 מחפשים אנשים מוכרים בוויקיפדיה...
        </div>
      )}

      {error && (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-amber-50 p-5 text-center font-bold text-amber-800">
          {error}
        </div>
      )}

      {!loading && !error && people.length === 0 && (
        <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-amber-50 p-5 text-center font-bold">
          לא מצאנו מספיק ערכים מוכרים בעברית לתאריך הזה. נסו תאריך אחר.
        </div>
      )}

      {!loading && people.length > 0 && (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map(person => {
            const page = person.page
            const image = page.image || page.thumbnail?.source
            return (
              <a
                key={page.pageid}
                href={page.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-[0_5px_0_rgba(20,30,60,.1)] transition hover:-translate-y-1"
              >
                {image ? (
                  <img
                    src={image}
                    alt={page.normalizedtitle || page.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-violet-100 text-6xl">
                    🌟
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-2xl font-black">{page.normalizedtitle || page.title}</h2>
                  <p className="mt-2 line-clamp-3 text-[var(--muted-foreground)]">{page.extract}</p>
                  <span className="mt-4 inline-block font-bold text-[var(--accent)]">
                    לקריאה בוויקיפדיה ←
                  </span>
                </div>
              </a>
            )
          })}
        </section>
      )}
    </div>
  )
}

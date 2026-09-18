import { useEffect, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const today = new Date()
const pad = n => String(n).padStart(2, '0')

export default function BirthdayFamous() {
  const [date, setDate] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const load = async value => {
    const [, month, day] = value.split('-')
    setLoading(true); setError('')
    try {
      const res = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${Number(month)}/${Number(day)}`)
      if (!res.ok) throw new Error('Wikipedia unavailable')
      const data = await res.json()
      setPeople((data.births || []).filter(x => x.pages?.[0]).slice(0, 18))
    } catch { setPeople([]); setError('לא הצלחנו לטעון את הנתונים כרגע. נסו שוב בעוד רגע.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load(date) }, [])
  return <div className="mx-auto max-w-6xl px-4 py-8"><SEO title="מי נולד ביום ההולדת שלך? | עוגה בוגה" description="גלו אילו אנשים מפורסמים נולדו בתאריך שלכם בעזרת Wikipedia." path="/tools/birthday-famous"/><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'יום הולדת',href:'/birthday'},{label:'מי נולד ביום ההולדת שלך?'}]}/><header className="mx-auto max-w-3xl text-center"><div className="text-6xl">🎂✨</div><h1 className="mt-3 text-4xl font-black sm:text-6xl">מי נולד ביום ההולדת שלך?</h1><p className="mt-3 text-xl text-[var(--muted-foreground)]">בחרו תאריך ונגלה מי מהאנשים המפורסמים נולד בו.</p><div className="mx-auto mt-6 flex max-w-md gap-2"><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-lg"/><button onClick={()=>load(date)} className="rounded-2xl bg-[var(--accent)] px-5 py-3 font-bold text-white">גלו</button></div></header>{loading&&<div className="py-16 text-center text-xl" role="status">🔎 מחפשים ב־Wikipedia...</div>}{error&&<div className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 p-5 text-center font-bold text-red-800">{error}</div>}{!loading&&!error&&<section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{people.map(person=>{const page=person.pages[0];const image=page.thumbnail?.source;return <a key={page.pageid} href={`https://he.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-[0_5px_0_rgba(20,30,60,.1)] transition hover:-translate-y-1">{image?<img src={image} alt="" className="h-48 w-full object-cover" loading="lazy"/>:<div className="flex h-48 items-center justify-center bg-violet-100 text-6xl">🌟</div>}<div className="p-5"><h2 className="text-2xl font-black">{page.normalizedtitle || page.title}</h2><p className="mt-2 line-clamp-3 text-[var(--muted-foreground)]">{page.extract || person.text}</p><span className="mt-4 inline-block font-bold text-[var(--accent)]">לקריאה בוויקיפדיה ←</span></div></a>})}</section>}</div>
}

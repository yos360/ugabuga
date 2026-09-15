import { useParams, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { AGE_GIFTS, GIFT_AGES } from '../../data/gifts'

export default function AgeGiftPage() {
  const { age } = useParams()
  const ageNum = parseInt(age?.replace('age-','') || age)
  const data = AGE_GIFTS[ageNum]
  if (!data) return <div className="text-center py-20"><h1 className="text-4xl">404</h1></div>
  const others = GIFT_AGES.filter(a => a !== ageNum)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title={`מתנות ליום הולדת גיל ${ageNum}`} description={data.intro.slice(0,150)} path={'/gifts/age-'+ageNum} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתנות', href: '/gifts' }, { label: 'גיל '+ageNum }]} />
      <p className="font-hand text-lg text-[var(--muted-foreground)]">מדריך מתנות</p>
      <h1 className="text-4xl sm:text-5xl mt-1 mb-6">מתנות ליום הולדת גיל {ageNum} — הרעיונות הכי טובים</h1>
      <p className="text-lg leading-relaxed mb-6">{data.intro}</p>

      <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-5 tape mb-8">
        <span className="wobbly-sm inline-block border border-[var(--border)] bg-white px-2 py-0.5 text-xs font-bold">טיפ מהשטח</span>
        <p className="mt-2 text-lg">{data.tip}</p>
      </div>

      <div className="space-y-10">
        {data.sections.map(section => (
          <section key={section.title}>
            <h2 className="text-2xl sm:text-3xl mb-4 border-b-[3px] border-[var(--accent)] pb-1 inline-block">{section.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.ideas.map(([name,desc,price]) => (
                <div key={name} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow-sm">
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="text-[var(--foreground)]/80 mt-1">{desc}</p>
                  <span className="inline-block mt-2 wobbly-sm border border-[var(--border)] bg-[var(--accent)] text-white px-2 py-0.5 text-sm font-bold">{price}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl mb-3">מתנות לגילאים אחרים</h2>
        <div className="flex flex-wrap gap-2">
          {others.map(a => <Link key={a} to={'/gifts/age-'+a} className="wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">גיל {a}</Link>)}
        </div>
      </div>

      <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--card)] p-5 pin mt-10">
        <h2 className="text-2xl mb-2">בונים מסיבה שלמה?</h2>
        <p className="text-lg">אחרי שבחרתם מתנה, אפשר גם <Link to="/calculator" className="underline decoration-dashed font-bold">לחשב תקציב למסיבה</Link> ולהכין <Link to="/invitation" className="underline decoration-dashed font-bold">הזמנה דיגיטלית</Link> תוך דקות.</p>
      </div>
    </div>
  )
}

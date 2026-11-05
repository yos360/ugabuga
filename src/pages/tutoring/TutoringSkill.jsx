import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../NotFound'
import { AREAS, skillById, SKILLS } from '../../data/tutoring/skills'
import { GRADE_NAMES } from '../../data/tutoring/plan'
import '../../learn/learn.css'

// /tutoring/:id: one difficulty explained to a parent: how to recognise it, what helps, and the steps of the plan.
export default function TutoringSkill() {
  const { id } = useParams()
  const s = skillById(id)
  if (!s) return <NotFound />
  const area = AREAS.find(a => a.id === s.area)
  const grades = GRADE_NAMES.slice(s.grades[0], s.grades[1] + 1).map((g, i) => [g, s.grades[0] + i])
  const related = SKILLS.filter(x => x.area === s.area && x.id !== s.id).slice(0, 6)
  const range = grades.length > 1 ? `כיתות ${grades[0][0]}–${grades.at(-1)[0]}` : `כיתה ${grades[0][0]}`
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title={`${s.title}: איך עוזרים לילד בבית`} description={`${s.short}? סימנים שכדאי לשים לב אליהם, מה עוזר, ותוכנית תרגול שבועית או חודשית ל${range}. בחינם ובלי הרשמה.`} path={`/tutoring/${s.id}`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שיעורי עזר בבית', href: '/tutoring' }, { label: s.title }]} />
    <h1 className="text-center text-3xl font-black sm:text-4xl"><span aria-hidden="true">{s.emoji} </span>{s.title}</h1>
    <p className="mt-2 text-center text-lg">{s.short}. כך עוזרים בבית, בכמה דקות ביום. מתאים ל{range}.</p>

    <section className="mt-6 ln-box"><h2 className="text-2xl font-black">איך מזהים את הקושי</h2>
      <ul className="mt-2 list-disc pr-5">{s.signs.map(x => <li key={x}>{x}</li>)}</ul></section>

    <section className="mt-4 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4"><h2 className="text-xl font-black">💡 מה הכי עוזר</h2><p className="mt-1">{s.tip}</p></section>

    <section className="mt-6"><h2 className="text-2xl font-black">השלבים בתוכנית</h2>
      <ol className="mt-2 space-y-2">{s.steps.map((x, i) => <li key={x.title} className="rounded-2xl border-2 border-slate-200 bg-white p-3"><b>{i + 1}. {x.title}{x.grade ? ` (חומר של כיתה ${GRADE_NAMES[x.grade]})` : ''}</b><p className="mt-0.5">{x.how}</p></li>)}</ol>
    </section>

    <section className="mt-6 ln-box text-center"><h2 className="text-2xl font-black">לבנות תוכנית אישית</h2>
      <p className="mt-1">באיזו כיתה הילד?</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">{grades.map(([g, n]) => <Link key={n} to={`/tutoring?g=${n}&s=${s.id}`} className="ln-chip">כיתה {g}</Link>)}</div>
    </section>

    <section className="mt-6"><h2 className="text-xl font-black">{area.emoji} עוד ב{area.title}</h2>
      <ul className="mt-2 flex flex-wrap gap-2">{related.map(x => <li key={x.id}><Link to={`/tutoring/${x.id}`} className="ln-chip !min-h-[40px] !py-1 text-sm">{x.title}</Link></li>)}</ul>
      <p className="mt-3"><Link to="/tutoring" className="font-bold underline">← כל שיעורי העזר</Link></p>
    </section>
  </div>
}

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import { Chip, Header, More } from './contentUi'
import { ANIMALS, ANIMAL_GROUPS } from '../../data/content/animals'

// ---------- Animals ----------
export function AnimalsHub() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="עובדות על חיות לילדים — 50 חיות עם חידון" description="עובדות מדויקות על 50 חיות לילדים: איפה הן חיות, מה הן אוכלות, כמה הן גדולות — ועובדות מפתיעות וחידון קצר בכל דף." path="/animals" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'עובדות על חיות' }]} />
      <Header emoji="🦁" title="עובדות על חיות לילדים" intro="בחרו חיה — ובכל דף תמצאו פרופיל קצר, 8 עובדות וחידון." />
      {ANIMAL_GROUPS.map(g => (
        <section key={g.title} className="mb-8"><h2 className="text-2xl font-bold mb-3">{g.title}</h2>
          <div className="flex flex-wrap gap-2">{g.items.map(a => <Chip key={a.slug} to={'/animals/' + a.slug}>{a.emoji} {a.name}</Chip>)}</div>
        </section>
      ))}
    </div>
  )
}
export function AnimalPage() {
  const { slug } = useParams()
  const a = ANIMALS.find(x => x.slug === slug)
  const [picked, setPicked] = useState({})
  if (!a) return <NotFound />
  const P = [['סוג', a.profile.class], ['איפה חי', a.profile.habitat], ['מה אוכל', a.profile.food], ['גודל', a.profile.size], ['תוחלת חיים', a.profile.lifespan]]
  return (
    <article className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={a.title} description={a.description} path={'/animals/' + slug} type="article" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'עובדות על חיות', href: '/animals' }, { label: a.name }]} />
      <Header emoji={a.emoji} title={a.title} intro={a.intro} />
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]">
        <h2 className="text-2xl font-bold mb-2">כרטיס זיהוי</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{P.map(([k, v]) => <div key={k}><dt className="font-bold">{k}</dt><dd>{v}</dd></div>)}</dl>
      </WobblyCard>
      <h2 className="text-2xl font-bold mb-3">8 עובדות מעניינות</h2>
      <ol className="space-y-2 mb-8">{a.facts.map((f, i) => <li key={i} className="wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-3 text-lg"><b>{i + 1}.</b> {f}</li>)}</ol>
      <h2 className="text-2xl font-bold mb-3">🧠 חידון קצר</h2>
      <div className="space-y-4">
        {a.quiz.map((q, i) => { const p = picked[i]; return (
          <WobblyCard key={i} hover={false} padding="p-4">
            <h3 className="font-bold text-lg mb-2">{i + 1}. {q.q}</h3>
            <div className="grid sm:grid-cols-2 gap-2">{q.options.map((o, j) => <button key={j} disabled={p !== undefined} onClick={() => setPicked(s => ({ ...s, [i]: j }))} className={`text-right wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 ${p === undefined ? '' : j === q.answer ? 'bg-green-100 border-green-600' : j === p ? 'bg-red-100 border-red-500' : 'opacity-60'}`}>{o}</button>)}</div>
            {p !== undefined && <p className="mt-2" role="status">{p === q.answer ? '✅ נכון! ' : '❌ לא הפעם. '}{q.explain}</p>}
          </WobblyCard>) })}
      </div>
      <More items={ANIMALS.map(x => ({ ...x, title: x.name }))} base="/animals/" current={slug} all="/animals" allLabel="כל החיות" />
    </article>
  )
}

// ---------- Riddles ----------

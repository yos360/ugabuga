import { useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import SpeakButton from '../../components/ui/SpeakButton'
import NotFound from '../NotFound'
import { Chip, Header } from './contentUi'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { ANIMALS, ANIMAL_GROUPS } from '../../data/content/animals'
import { ANIMALS_MORE_1 } from '../../data/content/animalsMore1'
import { ANIMALS_MORE_2 } from '../../data/content/animalsMore2'
import { nearby } from '../../utils/nearby'

const MORE = { ...ANIMALS_MORE_1, ...ANIMALS_MORE_2 }
// Topic links that fit each group (all URLs exist in the sitemap).
const GROUP_LINKS = [
  [['/trivia/animals', '🧠 טריוויה על חיות'], ['/english/animals', '🔤 חיות באנגלית'], ['/printables/activity/dot-to-dot/animals', '✏️ חבר את הנקודות – חיות']],
  [['/trivia/sea-animals', '🌊 טריוויה על חיות ים'], ['/english/animals', '🔤 חיות באנגלית'], ['/printables/activity/silhouette-match/animals', '✏️ התאמת צלליות – חיות']],
  [['/trivia/animals', '🧠 טריוויה על חיות'], ['/english/animals', '🔤 חיות באנגלית'], ['/printables/activity/word-tracing/animals', '✏️ מעקב מילים – חיות']],
  [['/trivia/insects', '🐞 טריוויה על חרקים'], ['/riddles/animals', '🤔 חידות על חיות'], ['/printables/activity/hidden-object/animals', '✏️ מצא את החיה']],
  [['/trivia/birds', '🐦 טריוויה על ציפורים'], ['/jokes/animals', '😂 בדיחות על חיות'], ['/printables/activity/match-word/animals', '✏️ התאמת מילה – חיות']],
]

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
  const gi = ANIMAL_GROUPS.findIndex(g => g.items.some(x => x.slug === slug)), group = ANIMAL_GROUPS[gi]
  const m = MORE[slug] || {}, subject = a.title.replace(/^עובדות על /, '').replace(/ לילדים$/, '')
  const sameGroup = nearby(group.items, x => x.slug === slug, 9)
  const at = group.items.findIndex(x => x.slug === slug)
  const others = ANIMAL_GROUPS.filter((_, j) => j !== gi).map(g => g.items[at % g.items.length]) // same position in each other group: spreads links evenly
  const P = [['סוג', a.profile.class], ['איפה חי', a.profile.habitat], ['מה אוכל', a.profile.food], ['גודל', a.profile.size], ['תוחלת חיים', a.profile.lifespan]]
  return (
    <article className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={a.title} description={a.description} path={'/animals/' + slug} type="article" structuredData={faqSchema(m.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'עובדות על חיות', href: '/animals' }, { label: a.name }]} />
      <Header emoji={a.emoji} title={a.title} intro={a.intro} />
      <p className="no-print -mt-3 mb-6 flex items-center justify-center gap-2 text-2xl font-bold">{a.name} <SpeakButton text={a.name} label={`השמעה: ${a.name}`} /></p>
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]">
        <h2 className="text-2xl font-bold mb-2">כרטיס זיהוי</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{P.map(([k, v]) => <div key={k}><dt className="font-bold">{k}</dt><dd>{v}</dd></div>)}</dl>
      </WobblyCard>
      {m.about && <section className="mb-8"><h2 className="text-2xl font-bold mb-3">קצת יותר על {subject}</h2><div className="space-y-3 text-lg leading-relaxed">{m.about.map(t => <p key={t}>{t}</p>)}</div></section>}
      <h2 className="text-2xl font-bold mb-3">8 עובדות מעניינות</h2>
      <ol className="space-y-2 mb-8">{a.facts.map((f, i) => <li key={i} className="wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-3 text-lg"><b>{i + 1}.</b> {f} <SpeakButton text={f} label="השמעת העובדה" className="!min-h-[30px] !min-w-[30px] !text-base align-middle" /></li>)}</ol>
      <h2 className="text-2xl font-bold mb-3">🧠 חידון קצר</h2>
      <div className="space-y-4">
        {a.quiz.map((q, i) => { const p = picked[i]; return (
          <WobblyCard key={i} hover={false} padding="p-4">
            <h3 className="font-bold text-lg mb-2">{i + 1}. {q.q}</h3>
            <div className="grid sm:grid-cols-2 gap-2">{q.options.map((o, j) => <button key={j} disabled={p !== undefined} onClick={() => setPicked(s => ({ ...s, [i]: j }))} className={`text-right wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 ${p === undefined ? '' : j === q.answer ? 'bg-green-100 border-green-600' : j === p ? 'bg-red-100 border-red-500' : 'opacity-60'}`}>{o}</button>)}</div>
            {p !== undefined && <p className="mt-2" role="status">{p === q.answer ? '✅ נכון! ' : '❌ לא הפעם. '}{q.explain}</p>}
          </WobblyCard>) })}
      </div>
      {m.kids && <WobblyCard hover={false} padding="p-5" className="mt-8 bg-[var(--postit)]"><h2 className="text-2xl font-bold mb-2">👨‍👩‍👧 איך מסבירים לילדים – ופעילות קצרה</h2><p className="text-lg leading-relaxed">{m.kids}</p></WobblyCard>}
      {m.faq && <div className="mt-8"><SeoBody faq={m.faq} /></div>}
      <section className="mt-10"><h2 className="text-2xl font-hand font-bold mb-3">עוד {group.title}</h2>
        <div className="flex flex-wrap gap-2">{sameGroup.map(o => <Chip key={o.slug} to={'/animals/' + o.slug}>{o.emoji} {o.name}</Chip>)}</div>
        <h3 className="text-lg font-bold mt-5 mb-2">ומקבוצות אחרות</h3>
        <div className="flex flex-wrap gap-2">{others.map(o => <Chip key={o.slug} to={'/animals/' + o.slug}>{o.emoji} {o.name}</Chip>)}<Chip to="/animals" hl>כל 50 החיות ←</Chip></div>
        <div className="flex flex-wrap gap-2 mt-5">{GROUP_LINKS[gi].map(([to, label]) => <Chip key={to} to={to}>{label}</Chip>)}</div>
      </section>
    </article>
  )
}

// ---------- Riddles ----------

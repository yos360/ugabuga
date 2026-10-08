import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import { GREETING_PAGES } from '../../data/content/greetings'
import { nearby } from '../../utils/nearby'

function Card({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked */ } }
  return (
    <WobblyCard hover={false} padding="p-5">
      <p className="whitespace-pre-line text-lg leading-relaxed">{text}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={copy} className="btn-secondary min-h-[44px] w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center text-base font-bold">{copied ? '✔ הועתק' : '📋 העתקה'}</button>
        <a href={'https://wa.me/?text=' + encodeURIComponent(text)} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-[44px] w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center text-base font-bold">💬 וואטסאפ</a>
      </div>
    </WobblyCard>
  )
}

export function GreetingsHub() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="ברכות ליום הולדת — לכל גיל ולכל אחד" description={`${GREETING_PAGES.length} עמודים של ברכות מקוריות ליום הולדת: לאמא, לאבא, לסבתא, לחברה, לבר ובת מצווה ולכל גיל — להעתקה ולשליחה בוואטסאפ.`} path="/birthday-greetings" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ברכות ליום הולדת' }]} />
      <h1 className="text-4xl md:text-5xl text-center font-hand font-bold mb-2">💌 ברכות ליום הולדת</h1>
      <p className="text-center text-lg text-[var(--muted-foreground)] mb-8">ברכות מקוריות לכל אחד ולכל גיל. רוצים ברכה אישית? נסו את <Link to="/greeting" className="underline font-bold">מחולל הברכות</Link>.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {GREETING_PAGES.map(p => <Link key={p.slug} to={'/greetings/' + p.slug} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold">{p.emoji} {p.title}</Link>)}
      </div>
    </div>
  )
}

export default function GreetingPage() {
  const { slug } = useParams()
  const p = GREETING_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  const his = p.split ? p.greetings.slice(0, 4) : p.greetings
  const hers = p.split ? p.greetings.slice(4) : []
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title + ' — ברכות מקוריות להעתקה'} description={p.description} path={'/greetings/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ברכות ליום הולדת', href: '/birthday-greetings' }, { label: p.title }]} />
      <header className="text-center mb-6">
        <div className="text-6xl mb-2">{p.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-2">{p.title}</h1>
        <p className="text-lg">{p.intro}</p>
      </header>
      {p.split && <h2 className="text-2xl font-bold mb-3">ברכות לו</h2>}
      <div className="space-y-4">{his.map(t => <Card key={t} text={t} />)}</div>
      {p.split && <><h2 className="text-2xl font-bold mt-8 mb-3">ברכות לה</h2><div className="space-y-4">{hers.map(t => <Card key={t} text={t} />)}</div></>}
      <WobblyCard hover={false} padding="p-5" className="mt-8 bg-[var(--postit)]">
        <h2 className="text-xl font-bold mb-2">טיפים לברכה אישית</h2>
        <ul className="list-disc pr-5 space-y-1">{p.tips.map(t => <li key={t}>{t}</li>)}</ul>
      </WobblyCard>
      <section className="mt-8">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד ברכות</h2>
        <div className="flex flex-wrap gap-2">{nearby(GREETING_PAGES, x => x.slug === slug, 12).map(o => <Link key={o.slug} to={'/greetings/' + o.slug} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{o.emoji} {o.title}</Link>)}<Link to="/birthday-greetings" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">כל הברכות ←</Link></div>
      </section>
    </div>
  )
}

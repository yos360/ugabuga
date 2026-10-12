import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { GREETING_PAGES } from '../../data/content/greetings'
import { GREETING_EXTRAS, GREETING_GROUPS } from '../../data/content/greetingsExtra'
import { GREETING_MORE } from '../../data/content/greetingsMore'
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

const HUB_FAQ = [
  { q: 'איך כותבים ברכה ליום הולדת שמרגישה אישית?', a: 'בוחרים ברכה שמתאימה לקשר (אמא, חברה, עמית לעבודה) ומוסיפים לה פרט אחד שרק אתם יודעים: זיכרון משותף, תכונה שאתם אוהבים או משהו שהחוגג עבר השנה. משפט אחד כזה הופך ברכה מוכנה לברכה שלכם.' },
  { q: 'אפשר להעתיק את הברכות ולשלוח בוואטסאפ?', a: 'כן. בכל ברכה יש כפתור העתקה וכפתור שליחה בוואטסאפ. כל הברכות באתר נכתבו במיוחד בשבילו, וחופשי להשתמש בהן ולשנות אותן.' },
  { q: 'מה ההבדל בין עמודי הברכות למחולל הברכות?', a: 'בעמודי הברכות יש ברכות מוכנות לפי גיל ולפי החוגג. במחולל הברכות כותבים שם וגיל, בוחרים סגנון ומקבלים ברכה חדשה עם השם של החוגג בתוכה.' },
  { q: 'כמה ארוכה צריכה להיות ברכה ליום הולדת?', a: 'להודעה בוואטסאפ מספיקות שתיים־שלוש שורות. לכרטיס ברכה, לנאום קצר או לבר ובת מצווה אפשר לכתוב פסקה או שתיים — העיקר שיהיה בה משהו אישי.' },
]

const HUB_SECTIONS = [
  ['ages', 'ברכה ליום הולדת לפי גיל'],
  ['family', 'ברכות ליום הולדת למשפחה'],
  ['people', 'לחברים, למורה, לעבודה — ועוד'],
]

export function GreetingsHub() {
  const bySlug = s => GREETING_PAGES.find(o => o.slug === s)
  const grouped = new Set(Object.values(GREETING_GROUPS).flat())
  const rest = GREETING_PAGES.filter(p => !grouped.has(p.slug))
  const chip = p => <Link key={p.slug} to={'/greetings/' + p.slug} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold">{p.emoji} {p.title}</Link>
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="ברכה ליום הולדת — ברכות מקוריות לכל גיל ולכל אחד" description={`ברכה ליום הולדת לכל אחד: ${GREETING_PAGES.length} עמודים של ברכות מקוריות לאמא, לאבא, לחברה, לבר ובת מצווה ולכל גיל — מעתיקים ושולחים בוואטסאפ, בחינם.`} path="/birthday-greetings" structuredData={faqSchema(HUB_FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ברכות ליום הולדת' }]} />
      <h1 className="text-4xl md:text-5xl text-center font-hand font-bold mb-2">💌 ברכה ליום הולדת — ברכות מקוריות</h1>
      <p className="mx-auto max-w-2xl text-center text-lg text-[var(--muted-foreground)] mb-8">מחפשים ברכה ליום הולדת? כאן יש ברכות מקוריות לכל גיל ולכל אחד — לאמא ולסבתא, לחבר ולחברה, לגננת ולבר או בת מצווה. בוחרים, מעתיקים ושולחים. רוצים ברכה עם השם של החוגג? נסו את <Link to="/greeting" className="underline font-bold">מחולל הברכות האישי</Link>.</p>
      {HUB_SECTIONS.map(([key, heading]) => (
        <section key={key} className="mb-8">
          <h2 className="text-2xl font-bold mb-3 text-center">{heading}</h2>
          <div className="flex flex-wrap justify-center gap-2">{(GREETING_GROUPS[key] || []).map(bySlug).filter(Boolean).map(chip)}</div>
        </section>
      ))}
      {rest.length > 0 && <div className="mb-8 flex flex-wrap justify-center gap-2">{rest.map(chip)}</div>}
      <div className="mx-auto max-w-3xl">
        <SeoBody
          paragraphs={[
            'ברכה טובה ליום הולדת לא חייבת להיות ארוכה. היא צריכה להתאים לאדם ולגיל: לילד בן 5 כותבים משהו שמח שאפשר להקריא לו, לבת מצווה משהו שמסתכל קדימה, ולסבא בן 80 משהו חם שמודה על מה שהוא נותן למשפחה.',
            'בכל עמוד יש כמה סגנונות: ברכה קצרה לוואטסאפ, ברכה מרגשת לכרטיס וברכה בחרוזים או בהומור. אם אתם מצרפים ברכה למתנה, שווה להציץ גם ברעיונות למתנות לפי גיל.',
          ]}
          faq={HUB_FAQ}
          related={[
            { label: 'מחולל ברכות אישי', href: '/greeting' },
            { label: 'מתנות ליום הולדת לפי גיל', href: '/gifts' },
            { label: 'הזמנה ליום הולדת', href: '/invitation' },
            { label: 'יום הולדת לילדים', href: '/birthday' },
          ]}
        />
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
  const x = GREETING_EXTRAS[slug] || {}
  // Related block: siblings from the same group first (other ages for age pages, other relatives for family pages)
  const group = Object.values(GREETING_GROUPS).find(g => g.includes(slug)) || []
  const bySlug = s => GREETING_PAGES.find(o => o.slug === s)
  const sameGroup = nearby(group, s => s === slug, 10).map(bySlug).filter(Boolean)
  const crossLinks = ['short', 'funny', 'belated'].filter(s => s !== slug && !sameGroup.some(o => o.slug === s)).map(bySlug).filter(Boolean)
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title + ' — ברכות מקוריות להעתקה'} description={p.description} path={'/greetings/' + slug} structuredData={faqSchema(x.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ברכות ליום הולדת', href: '/birthday-greetings' }, { label: p.title }]} />
      <header className="text-center mb-6">
        <div className="text-6xl mb-2">{p.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-2">{p.title}</h1>
        <p className="text-lg">{p.intro}</p>
      </header>
      {p.split && <h2 className="text-2xl font-bold mb-3">ברכות לו</h2>}
      <div className="space-y-4">{his.map(t => <Card key={t} text={t} />)}</div>
      {p.split && <><h2 className="text-2xl font-bold mt-8 mb-3">ברכות לה</h2><div className="space-y-4">{hers.map(t => <Card key={t} text={t} />)}</div></>}
      {x.more?.map(g => (
        <section key={g.title} className="mt-8">
          <h2 className="text-2xl font-bold mb-3">{g.title}</h2>
          <div className="space-y-4">{g.items.map(t => <Card key={t} text={t} />)}</div>
        </section>
      ))}
      {/* More original greetings by style (src/data/content/greetingsMore.js). */}
      {[['short', '📱 ברכות קצרות לוואטסאפ'], ['warm', '💌 ברכות מרגשות לכרטיס'], ['fun', '😄 ברכות מצחיקות ובחרוזים']].map(([k, title]) => GREETING_MORE[slug]?.[k]?.length > 0 && (
        <section key={k} className="mt-8">
          <h2 className="text-2xl font-bold mb-3">{title}</h2>
          <div className="space-y-4">{GREETING_MORE[slug][k].map(t => <Card key={t} text={t} />)}</div>
        </section>
      ))}
      {x.about?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-hand font-bold mb-3">איך כותבים {p.title}</h2>
          <div className="space-y-3 text-lg leading-relaxed">{x.about.map(t => <p key={t}>{t}</p>)}</div>
        </section>
      )}
      <WobblyCard hover={false} padding="p-5" className="mt-8 bg-[var(--postit)]">
        <h2 className="text-xl font-bold mb-2">טיפים לברכה אישית</h2>
        <ul className="list-disc pr-5 space-y-1">{p.tips.map(t => <li key={t}>{t}</li>)}</ul>
      </WobblyCard>
      {x.faq?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-hand font-bold mb-3">שאלות נפוצות</h2>
          <div className="space-y-4">{x.faq.map(f => <div key={f.q}><h3 className="font-bold text-lg">{f.q}</h3><p className="leading-relaxed">{f.a}</p></div>)}</div>
        </section>
      )}
      <section className="mt-8">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד ברכות</h2>
        <div className="flex flex-wrap gap-2">{[...sameGroup, ...crossLinks].map(o => <Link key={o.slug} to={'/greetings/' + o.slug} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{o.emoji} {o.title}</Link>)}{/mitzvah/.test(p.slug) && <><Link to="/bar-mitzvah" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">📜 מדריך בר ובת מצווה</Link><Link to="/bar-mitzvah/speech" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">🎤 דרשה לבר מצווה</Link></>}<Link to="/greeting" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">✍️ מחולל ברכות אישיות</Link><Link to="/birthday-greetings" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">כל הברכות ליום הולדת ←</Link></div>
      </section>
    </div>
  )
}

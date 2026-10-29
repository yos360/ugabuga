import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import VideoFacade from '../components/ui/VideoFacade'
import { VIDEOS, VIDEO_CATEGORIES, VIDEO_PAGE_LABELS, videoSchema } from '../data/videos'

// /videos — every video of the site's YouTube channel, grouped by category, each linked to its tool.
const CHANNEL = 'https://www.youtube.com/channel/UCFXZd5zbGFzkMgMHoMdKkwQ'
const fmtDay = iso => new Date(iso + 'T12:00:00').toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })

const FAQ = [
  { q: 'מה יש בסרטונים של עוגה בוגה?', a: 'סרטונים קצרים שמראים איך משתמשים בכלים של האתר — אישורי הגעה, מחולל הזמנות, חדר בריחה מודפס, חידון חי לכיתה, משחקים לנסיעה ועוד. בהמשך יעלו גם סרטוני הדרכה ארוכים יותר, צעד אחר צעד.' },
  { q: 'צריך להירשם או לשלם כדי לצפות?', a: 'לא. הסרטונים חינמיים ומתנגנים כאן בעמוד. הם מתארחים ביוטיוב, ונטענים רק כשלוחצים על כפתור ההפעלה.' },
  { q: 'איך מגיעים לכלי שמופיע בסרטון?', a: 'מתחת לכל סרטון יש קישור לעמוד הכלי באתר. הסרטון מופיע גם בעמוד הכלי עצמו, תחת "איך זה עובד".' },
  { q: 'אפשר לבקש סרטון הדרכה על כלי מסוים?', a: 'בטח. כתבו לנו דרך עמוד הבקשות או בוואטסאפ איזה כלי לא ברור — ונכין עליו סרטון הדרכה.' },
]

function VideoCard({ v }) {
  return <article className="wobbly-sm flex flex-col border-2 border-[var(--border)] bg-white p-3">
    <VideoFacade video={v} />
    <h3 className="mt-3 text-lg font-bold leading-snug">{v.title}</h3>
    <p className="mt-1 text-[var(--muted-foreground)]">{v.desc}</p>
    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{v.kind === 'short' ? '📱 סרטון קצר' : '🎓 סרטון הדרכה'} · {fmtDay(v.date)}</p>
    <div className="mt-auto flex flex-wrap gap-2 pt-3">
      {v.paths.map(p => <Link key={p} to={p} className="inline-flex min-h-[44px] items-center rounded-full border-2 border-slate-800 bg-[var(--postit)] px-4 font-bold hover:-translate-y-0.5">
        {VIDEO_PAGE_LABELS[p] || 'לעמוד הכלי'} ←
      </Link>)}
    </div>
  </article>
}

export default function Videos() {
  const [cat, setCat] = useState('all')
  const used = VIDEO_CATEGORIES.filter(c => VIDEOS.some(v => v.category === c.id))
  const groups = used.filter(c => cat === 'all' || c.id === cat).map(c => [c, VIDEOS.filter(v => v.category === c.id)])
  const chip = (id, label, count) => <button key={id} type="button" onClick={() => setCat(id)} aria-pressed={cat === id}
    className={`min-h-[44px] shrink-0 rounded-full border-2 px-4 font-bold ${cat === id ? 'border-slate-800 bg-[var(--postit)]' : 'border-[var(--border)] bg-white'}`}>
    {label} <span className="text-sm font-normal text-[var(--muted-foreground)]">({count})</span></button>
  const schema = [
    { '@context': 'https://schema.org', '@type': 'ItemList', 'name': 'סרטונים — איך משתמשים בעוגה בוגה',
      'itemListElement': VIDEOS.map((v, i) => ({ '@type': 'ListItem', 'position': i + 1, 'item': videoSchema(v, false) })) },
    faqSchema(FAQ),
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="סרטונים — איך משתמשים בעוגה בוגה" path="/videos" structuredData={schema}
      description={`${VIDEOS.length} סרטונים קצרים שמראים איך משתמשים בכלים של עוגה בוגה: אישורי הגעה, הזמנות ליום הולדת, חדר בריחה מודפס, חידון חי לכיתה, משחקים לנסיעה ועוד.`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'סרטונים' }]} />
    <h1 className="mb-2 text-4xl font-black">🎬 סרטונים — איך משתמשים בעוגה בוגה</h1>
    <p className="mb-5 text-lg text-[var(--muted-foreground)]">סרטונים קצרים שמראים מה אפשר לעשות באתר ואיך — כל סרטון מוביל לכלי עצמו. הסרטון נטען רק כשלוחצים ▶.</p>
    <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap" role="group" aria-label="סינון לפי נושא">
      {chip('all', 'הכול', VIDEOS.length)}
      {used.map(c => chip(c.id, `${c.emoji} ${c.label}`, VIDEOS.filter(v => v.category === c.id).length))}
    </div>
    {groups.map(([c, list]) => <section key={c.id} className="mb-10" aria-labelledby={`vid-${c.id}`}>
      <h2 id={`vid-${c.id}`} className="mb-3 text-3xl font-bold">{c.emoji} {c.label} <span className="text-lg font-normal text-[var(--muted-foreground)]">({list.length})</span></h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(v => <VideoCard key={v.id} v={v} />)}</div>
    </section>)}
    <p className="mb-8 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-lg">
      📺 כל הסרטונים גם <a href={CHANNEL} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-dashed">בערוץ היוטיוב של עוגה בוגה</a>. חסר סרטון על כלי מסוים? <Link to="/request" className="font-bold underline decoration-dashed">ספרו לנו</Link>.
    </p>
    <SeoBody paragraphs={[
      'בעוגה בוגה יש עשרות כלים חינמיים להורים, לגננות ולמורות — ולפעמים הכי קל להבין כלי כשרואים אותו בפעולה. ריכזנו כאן את כל הסרטונים שלנו: סרטונים קצרים של פחות מדקה שמראים מה הכלי עושה, ובהמשך גם סרטוני הדרכה מפורטים יותר.',
      'הסרטונים מסודרים לפי נושא — מסיבות ואירועים, כלים לכיתה ולגן, למידה ונסיעות. מתחת לכל סרטון יש קישור ישיר לכלי, כך שאפשר לצפות ומיד לנסות בעצמכם.',
    ]} faq={FAQ} related={[
      { label: 'מפת האתר', href: '/tools' },
      { label: 'מה חדש באתר', href: '/new' },
      { label: 'שאלות נפוצות', href: '/faq' },
    ]} />
  </div>
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import CountdownTimer from '../tools/CountdownTimer'
import ClassicDice from '../tools/dice/ClassicDice'
import { HOLIDAY_CONFIGS } from '../../holidays'
import { currentInfo } from '../../holidays/list'

// Free widgets other sites (kindergarten teachers' blogs, class sites) can embed with an <iframe>.
// Every widget carries a small "עוגה בוגה" credit linking to the full tool — real links back to us.
const SITE = 'https://ugabuga.co.il'
export const WIDGETS = [
  { id: 'timer', emoji: '⏱️', title: 'טיימר עם צלצול', blurb: 'ספירה לאחור מ־30 שניות עד 30 דקות, עם צלצול בסוף. מעולה לכיתה ולגן.', full: '/tools/countdown-timer', h: 560 },
  { id: 'dice', emoji: '🎲', title: 'קוביה וירטואלית', blurb: 'מטילים 1 עד 5 קוביות בלחיצה, עם סכום אוטומטי.', full: '/tools/dice', h: 520 },
  ...['hanukkah', 'tu-bishvat', 'purim', 'pesach'].filter(s => HOLIDAY_CONFIGS[s]).map(s => ({
    id: `countdown/${s}`, emoji: HOLIDAY_CONFIGS[s].emoji, title: `ספירה לאחור ל${HOLIDAY_CONFIGS[s].name}`,
    blurb: `כמה ימים נשארו ל${HOLIDAY_CONFIGS[s].name} — מתעדכן לבד כל יום.`, full: HOLIDAY_CONFIGS[s].base, h: 220,
  })),
]
export const embedCode = w => `<iframe src="${SITE}/embed/${w.id}" width="100%" height="${w.h}" style="border:0;max-width:520px" title="${w.title} — עוגה בוגה" loading="lazy"></iframe>`

const daysTo = iso => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)

function HolidayCountdown({ slug }) {
  const h = HOLIDAY_CONFIGS[slug]
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 3600000); return () => clearInterval(t) }, [])
  if (!h) return <p className="p-4 text-center">לא נמצא חג כזה.</p>
  const o = currentInfo(h), d = daysTo(o.start), during = Date.now() >= new Date(o.start) && Date.now() < new Date(o.end)
  return <div className="rounded-2xl border-2 border-[#222] bg-[#fff6d6] p-4 text-center">
    <p className="text-5xl" aria-hidden="true">{h.emoji}</p>
    <p className="mt-1 text-3xl font-black">{during ? `${h.name} שמח!` : d <= 1 ? `${h.name} מתחיל ממש עכשיו!` : `עוד ${d} ימים ל${h.name}`}</p>
    <p className="mt-1 text-sm text-[#4d556a]">{o.datesText}</p>
  </div>
}

// /embed/:tool — the bare widget (Layout drops the header and footer for /embed/*).
export function EmbedWidget() {
  const { tool, slug } = useParams()
  const id = slug ? `${tool}/${slug}` : tool
  const w = WIDGETS.find(x => x.id === id)
  return <div dir="rtl" className="min-h-full bg-white">
    <SEO title={w ? `${w.title} להטמעה` : 'הטמעה'} description="כלי של עוגה בוגה להטמעה באתר." path={w ? w.full : '/embed'} noindex />
    {tool === 'timer' && <CountdownTimer embed />}
    {tool === 'dice' && <div className="p-3"><ClassicDice /></div>}
    {tool === 'countdown' && <div className="p-3"><HolidayCountdown slug={slug} /></div>}
    {!w && <p className="p-4 text-center">הכלי לא נמצא. <a href={`${SITE}/embed`} target="_blank" rel="noopener">לכל הכלים</a></p>}
    {w && <p className="pb-2 text-center text-xs text-[#4d556a]">
      <a href={`${SITE}${w.full}?utm_source=embed`} target="_blank" rel="noopener" className="font-bold underline">{w.emoji} {w.title} של עוגה בוגה</a> · <a href={SITE} target="_blank" rel="noopener" className="underline">משחקים ודפי הדפסה לילדים בחינם</a>
    </p>}
  </div>
}

function CopyBox({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }).catch(() => {})
  return <div className="mt-2">
    <textarea readOnly value={code} dir="ltr" rows={3} className="w-full rounded-xl border-2 border-[var(--border)] bg-slate-50 p-2 font-mono text-xs" onFocus={e => e.target.select()} aria-label="קוד להטמעה" />
    <button type="button" onClick={copy} className="mt-1 min-h-10 rounded-xl border-2 border-[var(--border)] bg-[var(--postit)] px-4 font-bold">{copied ? '✓ הועתק' : '📋 העתקת הקוד'}</button>
  </div>
}

// /embed — the gallery: a live preview of each widget and its copy-paste code.
export default function EmbedsHub() {
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="כלים חינמיים להטמעה באתר — טיימר, קובייה וספירה לאחור לחגים" description="טיימר עם צלצול, קוביה וירטואלית וספירה לאחור לחנוכה ולחגים — להטמעה חינם באתר של הגן, הכיתה או הבלוג. מעתיקים שורת קוד אחת ומדביקים." path="/embed" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'הטמעה באתר' }]} />
    <h1 className="mb-2 text-4xl font-black">🧩 כלים להטמעה באתר שלכם</h1>
    <p className="mb-6 text-lg text-[var(--muted-foreground)]">יש לכם אתר לגן, לכיתה או בלוג? מעתיקים שורת קוד אחת, מדביקים — והכלי עובד אצלכם. בחינם, בלי הרשמה ובלי פרסומות.</p>
    <div className="space-y-8">{WIDGETS.map(w => <section key={w.id} className="wobbly border-2 border-[var(--border)] bg-white p-5">
      <h2 className="text-2xl font-bold">{w.emoji} {w.title}</h2>
      <p className="mb-3 text-[var(--muted-foreground)]">{w.blurb} <Link to={w.full} className="underline">לכלי המלא באתר</Link></p>
      <div className="grid gap-4 md:grid-cols-2">
        <iframe src={`/embed/${w.id}`} title={`${w.title} — תצוגה`} height={w.h} loading="lazy" className="w-full rounded-xl border-2 border-dashed border-[var(--border)]" />
        <div><b>הקוד להדבקה:</b><CopyBox code={embedCode(w)} />
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">ב־WordPress: בלוק "HTML מותאם". ב־Wix: "הטמעת קוד". ב־Google Sites: "הטמעה" ← "קוד הטמעה".</p></div>
      </div>
    </section>)}</div>
  </div>
}

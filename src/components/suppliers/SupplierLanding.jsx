import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Logo, SocialLinks, ContactButtons, Icon } from './SupplierBits'
import { categoryLabel } from '../../data/supplierOptions'

// ---- Videos: YouTube/Vimeo play inline; Instagram/TikTok/Facebook open as link cards.
function videoEmbed(url) {
  try {
    const u = new URL(url)
    const yt = u.hostname.includes('youtu.be') ? u.pathname.slice(1)
      : /youtube\.com$/.test(u.hostname.replace(/^www\.|^m\./, '')) ? (u.searchParams.get('v') || u.pathname.match(/\/(shorts|embed|live)\/([\w-]{6,})/)?.[2]) : null
    if (yt) return `https://www.youtube-nocookie.com/embed/${yt.replace(/[^\w-]/g, '')}`
    const vm = u.hostname.includes('vimeo.com') && u.pathname.match(/(\d{6,})/)?.[1]
    if (vm) return `https://player.vimeo.com/video/${vm}`
  } catch { /* ignore */ }
  return null
}
const platformOf = url => /instagram/.test(url) ? 'instagram' : /tiktok/.test(url) ? 'tiktok' : /facebook|fb\.watch/.test(url) ? 'facebook' : /youtu/.test(url) ? 'youtube' : 'website'

function Videos({ s, t }) {
  if (!s.videos?.length) return null
  return <Section t={t} title="🎬 סרטונים">
    <div className="grid gap-4 sm:grid-cols-2">{s.videos.map((v, i) => {
      const embed = videoEmbed(v.url)
      return embed
        ? <figure key={i} className="overflow-hidden rounded-2xl bg-black"><div className="aspect-video"><iframe src={embed} title={v.title || `סרטון ${i + 1}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full" /></div>{v.title && <figcaption className="bg-white px-3 py-2 text-sm font-bold">{v.title}</figcaption>}</figure>
        : <a key={i} href={v.url} target="_blank" rel="noopener nofollow" className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 font-bold hover:border-slate-800">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white"><Icon name={platformOf(v.url)} className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block truncate">{v.title || 'לצפייה בסרטון'}</span><span className="text-sm font-normal text-slate-500">▶ נפתח בחלון חדש</span></span>
          </a>
    })}</div>
  </Section>
}

// ---- Gallery with a lightbox.
function Gallery({ s, t, masonry }) {
  const [open, setOpen] = useState(null)
  const pics = s.gallery || []
  useEffect(() => {
    if (open == null) return
    const onKey = e => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowLeft') setOpen(i => (i + 1) % pics.length); if (e.key === 'ArrowRight') setOpen(i => (i - 1 + pics.length) % pics.length) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [open, pics.length])
  if (!pics.length) return null
  return <Section t={t} title="📸 גלריה">
    <div className={masonry ? 'columns-2 gap-3 sm:columns-3 [&>*]:mb-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3'}>
      {pics.map((p, i) => <button key={i} onClick={() => setOpen(i)} className={`group block w-full overflow-hidden rounded-2xl bg-slate-100 ${masonry ? '' : 'aspect-square'}`} aria-label={`הגדלת תמונה ${i + 1}`}>
        <img src={p.url} alt={p.title || `${s.name} — תמונה ${i + 1}`} loading="lazy" className={`w-full object-cover transition duration-300 group-hover:scale-105 ${masonry ? 'h-auto' : 'h-full'}`} />
      </button>)}
    </div>
    {open != null && createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label="גלריה">
      <img src={pics[open].url} alt="" className="max-h-[85vh] max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
      <button onClick={() => setOpen(null)} className="absolute end-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-xl font-bold" aria-label="סגירה">✕</button>
      {pics.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); setOpen((open - 1 + pics.length) % pics.length) }} className="absolute start-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl" aria-label="הקודמת">›</button>
        <button onClick={e => { e.stopPropagation(); setOpen((open + 1) % pics.length) }} className="absolute end-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl" aria-label="הבאה">‹</button>
        <span className="absolute bottom-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold">{open + 1} / {pics.length}</span>
      </>}
    </div>, document.body)}
  </Section>
}

function About({ s, t }) {
  if (!s.about) return null
  return <Section t={t} title="💬 קצת עליי"><p className="whitespace-pre-line text-lg leading-relaxed">{s.about}</p></Section>
}
function Services({ s, t }) {
  if (!s.services?.length) return null
  return <Section t={t} title="🎁 מה אני מציע/ה">
    <div className="grid gap-3 sm:grid-cols-2">{s.services.map((v, i) => <div key={i} className={t.item}>
      <div className="flex items-baseline justify-between gap-2"><h3 className="text-lg font-black">{v.title}</h3>{v.price && <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-bold">{v.price}</span>}</div>
      {v.text && <p className="mt-1 text-[15px] leading-relaxed opacity-90">{v.text}</p>}
    </div>)}</div>
  </Section>
}
function Contact({ s, t, live }) {
  return <Section t={t} title="📬 בואו נדבר" id="contact">
    <p className="mb-4 text-lg">אשמח לשמוע על האירוע שלכם!</p>
    <ContactButtons s={s} live={live} big />
    <SocialLinks s={s} live={live} className="mt-4" size="h-11 w-11" />
  </Section>
}
function Section({ t, title, children, id }) {
  return <section id={id} className={t.section}><h2 className={t.h2}>{title}</h2>{children}</section>
}

const Chips = ({ s, className = '' }) => {
  const chips = [categoryLabel(s.category), s.area && `📍 ${s.area}`, ...(s.tags || [])].filter(Boolean)
  return chips.length ? <div className={`flex flex-wrap gap-1.5 ${className}`}>{chips.map(c => <span key={c} className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-slate-800">{c}</span>)}</div> : null
}

// Five layouts built from the same sections.
const T = {
  1: { // קלאסי
    wrap: 'bg-slate-50', section: 'rounded-3xl bg-white p-5 shadow-sm sm:p-7', h2: 'mb-4 text-2xl font-black', item: 'rounded-2xl bg-slate-50 p-4',
    order: ['about', 'services', 'gallery', 'videos', 'contact'],
    hero: (s, live) => <header className="relative isolate overflow-hidden rounded-b-[32px] bg-[var(--ink)] text-white sm:rounded-[32px]">
      {s.cover_url && <img src={s.cover_url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="flex min-h-[340px] flex-col justify-end gap-3 p-5 sm:p-8">
        <Logo s={s} size="h-20 w-20" />
        <h1 className="text-4xl font-black sm:text-5xl">{s.name}</h1>
        {s.tagline && <p className="text-lg opacity-90">{s.tagline}</p>}
        <Chips s={s} />
        <ContactButtons s={s} live={live} className="mt-2 max-w-md" />
      </div>
    </header>,
  },
  2: { // פתק צהוב
    wrap: '', section: 'wobbly border-2 border-[var(--border)] bg-white p-5 sketch-shadow sm:p-7', h2: 'mb-4 font-display text-3xl font-bold', item: 'wobbly-md bg-[var(--postit)] p-4',
    order: ['about', 'gallery', 'services', 'videos', 'contact'],
    hero: (s, live) => <header className="wobbly relative overflow-hidden border-2 border-[var(--border)] bg-[var(--postit)] p-5 sm:p-8">
      <span aria-hidden="true" className="absolute -end-6 -top-6 h-24 w-24 rotate-12 rounded-2xl bg-[#ffd6e0]" />
      <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:text-start">
        <Logo s={s} size="h-28 w-28" className="-rotate-3" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{s.name}</h1>
          {s.tagline && <p className="mt-1 text-lg">{s.tagline}</p>}
          <Chips s={s} className="mt-3 justify-center sm:justify-start" />
        </div>
      </div>
      {s.cover_url && <img src={s.cover_url} alt="" className="wobbly-md relative mt-5 aspect-[16/7] w-full rotate-[-0.6deg] border-4 border-white object-cover shadow" />}
      <ContactButtons s={s} live={live} className="relative mt-5 max-w-md" />
    </header>,
  },
  3: { // גלריה קודם
    wrap: '', section: 'py-2', h2: 'mb-4 text-2xl font-black', item: 'rounded-2xl border-2 border-slate-200 bg-white p-4',
    order: ['gallery', 'about', 'services', 'videos', 'contact'], masonry: true,
    hero: (s, live) => <header className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <Logo s={s} size="h-20 w-20" />
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-black sm:text-4xl">{s.name}</h1>
        {s.tagline && <p className="text-[var(--muted-foreground)]">{s.tagline}</p>}
        <Chips s={s} className="mt-2 [&>span]:bg-slate-100" />
      </div>
      <ContactButtons s={s} live={live} className="sm:w-64" />
    </header>,
  },
  4: { // נקי
    wrap: 'bg-white', section: 'mx-auto max-w-2xl border-t border-slate-200 py-8 text-center', h2: 'mb-4 text-sm font-bold uppercase tracking-widest text-slate-500', item: 'rounded-xl border border-slate-200 p-4 text-start',
    order: ['about', 'services', 'gallery', 'videos', 'contact'],
    hero: (s, live) => <header className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-10 text-center">
      <Logo s={s} size="h-32 w-32" className="border-slate-100" />
      <h1 className="text-4xl font-black sm:text-5xl">{s.name}</h1>
      {s.tagline && <p className="text-xl text-slate-500">{s.tagline}</p>}
      <Chips s={s} className="justify-center [&>span]:bg-slate-100" />
      {s.cover_url && <img src={s.cover_url} alt="" className="mt-4 aspect-[16/8] w-full rounded-2xl object-cover" />}
      <ContactButtons s={s} live={live} className="mt-3 w-full max-w-sm" />
    </header>,
  },
  5: { // חגיגי
    wrap: '', section: 'rounded-3xl border-t-8 border-[var(--accent)] bg-white p-5 shadow-md sm:p-7 even:border-violet-500', h2: 'mb-4 text-2xl font-black', item: 'rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 p-4',
    order: ['about', 'services', 'videos', 'gallery', 'contact'],
    hero: (s, live) => <header className="relative isolate overflow-hidden rounded-[32px] bg-gradient-to-br from-[#e43f67] via-[#b83aa8] to-[#6d3ae0] p-6 text-center text-white sm:p-10">
      {Array.from({ length: 18 }, (_, i) => <span key={i} aria-hidden="true" className="absolute -z-10 rounded-full opacity-70" style={{ width: 6 + (i * 7) % 12, height: 6 + (i * 7) % 12, top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`, background: ['#fff4bb', '#ffffff', '#7ee0c3', '#ffd6e0'][i % 4] }} />)}
      <Logo s={s} size="h-24 w-24" className="mx-auto" />
      <h1 className="mt-3 text-4xl font-black sm:text-6xl">{s.name}</h1>
      {s.tagline && <p className="mt-2 text-xl opacity-95">{s.tagline}</p>}
      <Chips s={s} className="mt-4 justify-center" />
      {s.cover_url && <img src={s.cover_url} alt="" className="mx-auto mt-6 aspect-[16/8] w-full max-w-3xl rounded-3xl border-4 border-white/70 object-cover" />}
      <ContactButtons s={s} live={live} className="mx-auto mt-5 max-w-md" />
    </header>,
  },
}

export default function SupplierLanding({ s, live = true }) {
  const t = T[s.template] || T[1]
  const parts = { about: <About key="a" s={s} t={t} />, services: <Services key="s" s={s} t={t} />, gallery: <Gallery key="g" s={s} t={t} masonry={t.masonry} />, videos: <Videos key="v" s={s} t={t} />, contact: <Contact key="c" s={s} t={t} live={live} /> }
  return <div className={`${t.wrap} -mx-4 px-4 pb-10 pt-2 sm:mx-0 sm:rounded-[32px] sm:px-6`}>
    {t.hero(s, live)}
    <div className="mt-6 space-y-6">{t.order.map(k => parts[k])}</div>
    <p className="mt-10 text-center text-sm text-slate-500">דף עסק מבית <a href="/suppliers" className="font-bold underline">עוגה בוגה</a> 🎂</p>
  </div>
}

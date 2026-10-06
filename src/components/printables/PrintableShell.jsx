import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../ui/SEO'
import SeoBody, { faqSchema } from '../ui/SeoBody'
import Breadcrumbs from '../ui/Breadcrumbs'
import PrintPreview from '../ui/PrintPreview'

// Shared frame for the generated printables (calendars, home charts, masks, paper, clocks…):
// SEO + breadcrumbs + one h1, a controls area, an on-screen preview of the first sheet,
// one print button that opens PrintPreview with every sheet, and long-form SEO copy.
// `pages` is an array of { key, svg } — each svg is drawn in a 200×270 (mm-like) box.
export function Sheet({ children, w = 200, h = 270, label }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}
      fontFamily="Heebo, Arial, sans-serif">
      <rect x="0" y="0" width={w} height={h} fill="#fff" />
      {children}
    </svg>
  )
}

// Hebrew text helper for SVG: RTL, centred by default.
export function T({ x, y, size = 6, anchor = 'middle', weight = 400, fill = '#111', children, ...rest }) {
  return <text x={x} y={y} fontSize={size} textAnchor={anchor} fontWeight={weight} fill={fill} direction="rtl" {...rest}>{children}</text>
}

export function Choice({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap justify-center gap-2">
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold ${value === v ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>{l}</button>
      ))}
    </div>
  )
}

export function Field({ label, value, onChange, placeholder, maxLength = 30, type = 'text' }) {
  return (
    <label className="block text-center font-bold">
      {label}
      <input type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
    </label>
  )
}

export default function PrintableShell({ path, seoTitle, description, emoji, h1, sub, crumbs = [], controls, pages, printTitle, printLabel, paragraphs = [], faq = [], related = [], siblings = [], extra }) {
  const [printing, setPrinting] = useState(false)
  const first = pages[0]
  const many = pages.length > 1
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title={seoTitle} description={description} path={path} structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, ...crumbs, { label: h1 }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{emoji} </span>{h1}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{sub}</p>

      {siblings.length > 0 && (
        <nav aria-label="דפים נוספים מאותה משפחה" className="mb-6 flex flex-wrap justify-center gap-2">
          {siblings.map(s => s.href === path
            ? <span key={s.href} aria-current="page" className="rounded-full border-2 border-[var(--border)] bg-[var(--yellow)] px-4 py-1.5 font-bold">{s.label}</span>
            : <Link key={s.href} to={s.href} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-4 py-1.5 font-bold hover:bg-[var(--muted)]/30">{s.label}</Link>)}
        </nav>
      )}

      {controls && <div className="mx-auto mb-8 max-w-3xl space-y-4 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">{controls}</div>}

      <div className="mx-auto grid max-w-3xl items-start gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="mx-auto w-full max-w-[420px] border-2 border-[var(--border)] bg-white p-3 sketch-shadow-sm" aria-label="תצוגה מקדימה של הדף הראשון">
          {first?.svg}
        </div>
        <div className="space-y-3 text-center md:text-right md:sticky md:top-24">
          <p className="font-bold text-lg">{many ? `${pages.length} דפי A4 בהדפסה אחת` : 'דף A4 אחד'}</p>
          <button type="button" data-print-main onClick={() => setPrinting(true)} className="w-full min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ {printLabel || 'הדפסה או PDF'}</button>
          <p className="text-sm text-[var(--muted-foreground)]">חינם, בלי הרשמה. אפשר לשנות הגדרות ולהדפיס שוב כמה שרוצים.</p>
          {extra}
        </div>
      </div>

      {printing && (
        <PrintPreview title={printTitle || h1} onClose={() => setPrinting(false)}>
          {pages.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
        </PrintPreview>
      )}

      <div className="mt-12">
        <SeoBody paragraphs={paragraphs} faq={faq} related={related} />
      </div>
    </div>
  )
}

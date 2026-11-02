// /tools/image and /tools/image/:action — one studio: add photos, pick a tool, download.
// Every tool runs on <canvas> in the browser; photos never leave the device.
// rr-block keeps the photo areas out of the site's session recordings.
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { STUDIO, TOOLS, FAQ, toolBySlug } from './imageTools'
import { useImages, addFiles, removeItem, clearAll, select, clearNote, MAX_PHOTOS } from './imageStore'
import { formatBytes } from './imageLogic'
import './image.css'

const PANELS = {
  compress: lazy(() => import('./CompressTool')),
  crop: lazy(() => import('./CropTool')),
  collage: lazy(() => import('./CollageTool')),
  blur: lazy(() => import('./BlurTool')),
  text: lazy(() => import('./TextTool')),
  heic: lazy(() => import('./HeicTool')),
  'remove-bg': lazy(() => import('./EraseBgTool')),
}

// set when a tool tab is tapped; module-level because /tools/image → /tools/image/:action remounts the page
let wantScroll = false

const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>

function AddPhotos({ tool }) {
  const { items, selected, busy, note } = useImages()
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const heicOnly = tool === 'heic'
  const onDrop = e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer?.files) }
  const total = items.reduce((s, i) => s + i.size, 0)
  return (
    <div className={'im-box im-add rr-block' + (over ? ' over' : '')}
      onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={onDrop}>
      <input ref={input} type="file" multiple hidden accept={heicOnly ? '.heic,.heif,image/heic,image/heif,image/*' : 'image/*,.heic,.heif'}
        onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
      <div className="im-add-row">
        <button type="button" className="im-btn big" onClick={() => input.current?.click()}>
          📷 {items.length ? 'עוד תמונות' : 'בחרו תמונות'}
        </button>
        <span className="im-private">🔒 התמונות לא יוצאות מהמכשיר</span>
      </div>
      {!items.length && !busy && <p className="im-hint">אפשר גם לגרור לכאן או להדביק (Ctrl+V). {heicOnly ? 'קובצי HEIC מאייפון.' : 'JPG, PNG, WebP ו-HEIC.'}</p>}
      {busy > 0 && <p className="im-hint" role="status">⏳ פותחים {busy === 1 ? 'תמונה' : `${busy} תמונות`}…</p>}
      {note && <p className="im-note" role="status">{note} <button type="button" className="im-x" onClick={clearNote} aria-label="סגירה">✕</button></p>}
      {items.length > 0 && <>
        <ul className="im-thumbs" aria-label="התמונות שנבחרו">
          {items.map(it => (
            <li key={it.id} className={it.id === selected ? 'on' : ''}>
              <button type="button" className="im-thumb" onClick={() => select(it.id)} aria-pressed={it.id === selected} title={it.name}>
                <img src={it.thumb} alt={it.name} />
              </button>
              <button type="button" className="im-del" onClick={() => removeItem(it.id)} aria-label={`הסרת ${it.name}`}>✕</button>
            </li>
          ))}
        </ul>
        <p className="im-meta">
          {items.length} {items.length === 1 ? 'תמונה' : 'תמונות'} · {formatBytes(total)}
          {items.length >= MAX_PHOTOS ? ' · הגעתם למקסימום' : ''}
          {' · '}<button type="button" className="im-link" onClick={clearAll}>ניקוי הכל</button>
        </p>
      </>}
    </div>
  )
}

function ToolTabs({ current, onPick }) {
  return (
    <nav className="im-tabs" aria-label="כלים">
      {TOOLS.map(t => (
        <button key={t.slug} type="button" className="im-tab" aria-current={t.slug === current ? 'page' : undefined} onClick={() => onPick(t.slug)}>
          <span aria-hidden="true">{t.emoji}</span> {t.label}
        </button>
      ))}
    </nav>
  )
}

export default function ImageStudio() {
  const { action } = useParams()
  const tool = toolBySlug(action)
  const navigate = useNavigate()
  const { items } = useImages()
  const panelRef = useRef(null)

  // paste photos from the clipboard anywhere on the page
  useEffect(() => {
    const onPaste = e => {
      const files = Array.from(e.clipboardData?.files || [])
      if (files.length && !/input|textarea/i.test(e.target?.tagName || '')) addFiles(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  // after switching tools the site scrolls to the top; bring the tool back into view
  useEffect(() => {
    if (!wantScroll) return
    const t = setTimeout(() => { wantScroll = false; panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 60)
    return () => clearTimeout(t)
  }, [action])

  const pick = slug => {
    if (slug === action) return
    wantScroll = true
    navigate(`/tools/image/${slug}`, { replace: true })
  }

  const meta = tool || STUDIO
  const path = tool ? `/tools/image/${tool.slug}` : '/tools/image'
  const Panel = tool ? PANELS[tool.slug] : null
  const crumbs = [{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, ...(tool ? [{ label: 'עורך תמונות', href: '/tools/image' }, { label: tool.h1 }] : [{ label: 'עורך תמונות' }])]

  return <Page>
    <SEO title={meta.title} description={meta.desc} path={path} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={crumbs} />
    <h1 className="text-4xl sm:text-5xl text-center mb-4"><span aria-hidden="true">{tool ? tool.emoji : STUDIO.emoji} </span>{meta.h1}</h1>
    <AddPhotos tool={tool?.slug} />
    <ToolTabs current={tool?.slug} onPick={pick} />
    <section ref={panelRef} className="im-panel rr-block" aria-label={tool ? tool.label : 'בחירת כלי'}>
      {!tool ? (
        <div className="im-cards">
          {TOOLS.map(t => (
            <button key={t.slug} type="button" className="im-card" onClick={() => pick(t.slug)}>
              <span className="im-card-emoji" aria-hidden="true">{t.emoji}</span>
              <b>{t.label}</b>
            </button>
          ))}
        </div>
      ) : !items.length ? (
        <p className="im-empty">{tool.slug === 'collage' ? 'בחרו 2 עד 9 תמונות למעלה.' : tool.slug === 'heic' ? 'בחרו קובצי HEIC למעלה, וההמרה מתחילה מיד.' : 'בחרו תמונה למעלה, והכלי ייפתח כאן.'}</p>
      ) : (
        <Suspense fallback={<p className="im-empty" role="status">⏳ טוענים את הכלי…</p>}>
          <Panel />
        </Suspense>
      )}
    </section>
    <div className="mt-12"><SeoBody
      paragraphs={tool ? [tool.seo, STUDIO.seo[1]] : STUDIO.seo}
      faq={FAQ}
      related={[
        ...TOOLS.filter(t => t.slug !== tool?.slug).slice(0, 4).map(t => ({ label: t.h1, href: `/tools/image/${t.slug}` })),
        { label: 'כלי PDF', href: '/tools/pdf' },
      ]}
    /></div>
  </Page>
}

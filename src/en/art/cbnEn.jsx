import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { cbnLegend, cbnSize, cbnGrid, cbnAnswers } from '../../data/colorByNumber'
import { thumbnailPaths } from '../../data/cbnThumbnail'
import { CbnSvg } from '../../pages/printables/cbnShared'
import { artPage, cbnName, cbnPathEn, CBN_HUB } from './catalog'
import { LEVELS_EN } from './cbnText'
import { legendEn, badge, MORE_WAYS } from './artUtils'

// English versions of the color-by-number building blocks (src/pages/printables/cbnShared.jsx draws the
// same grids; its labels are Hebrew). The board itself (CbnSvg) and the painting logic are reused as they are.

const CELL = 10

// Page frame: SEO (title and description come from the catalog), breadcrumbs, LTR. The "en-rsvp" class keeps
// the English base styles (dark buttons, big margins) away from the Tailwind styling these pages share with Hebrew.
export function ArtFrame({ path, crumbs, faq = [], image, children }) {
  const page = artPage(path)
  return <div className="en-rsvp en-art mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="ltr" lang="en">
    <SEO lang="en" path={path} title={page.title} description={page.description} counterpartPath={page.counterpart} image={image} structuredData={faq.length ? faqSchema(faq) : undefined} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, ...crumbs]} />
    {children}
  </div>
}

export function ArtBody({ paragraphs, faq, related }) {
  return <div className="mt-10 no-print"><SeoBody lang="en" paragraphs={paragraphs} faq={faq} related={related} /></div>
}

export function PaintBarEn({ painting: b }) {
  return <div className="cbn-paintbar" role="group" aria-label="Coloring tools">
    <button type="button" onClick={b.undo} disabled={!b.canUndo}>↩️ Undo</button>
    <button type="button" onClick={b.redo} disabled={!b.canRedo}>↪️ Redo</button>
    <button type="button" aria-pressed={b.erasing} onClick={() => b.setErasing(v => !v)}>🧽 Eraser</button>
    <button type="button" onClick={b.clear}>🗑️ Clear all</button>
  </div>
}

// tags: { [num]: label } next to each swatch (answers, letters). Without tags: the color numbers, or in
// 'math' mode the picture's own answers.
export function LegendEn({ p, mode, tags, tagName, active, onPick, compact }) {
  const legend = legendEn(p)
  const labels = tags || (mode === 'math' ? cbnAnswers(p) : null)
  const name = tagName || (mode === 'math' ? 'Answer' : 'Number')
  const numeric = labels && Object.values(labels).every(v => typeof v === 'number' || /^\d+$/.test(v))
  const items = !labels ? legend : [...legend].sort((a, b) => numeric ? labels[a.num] - labels[b.num] : String(labels[a.num]).localeCompare(String(labels[b.num]), 'en'))
  return <ul className={`cbn-legend ${compact ? 'is-compact' : ''}`}>{items.map(l => {
    const tag = labels ? labels[l.num] : l.num
    const inner = <><i className="cbn-swatch" style={{ background: l.hex }} /><b dir="ltr">{tag}</b><span>{l.name}</span></>
    return <li key={l.ch}>{onPick
      ? <button type="button" aria-pressed={active === l.num} onClick={() => onPick(l.num)} aria-label={`${name} ${tag}: ${l.name}`}>{inner}</button>
      : <span className="cbn-legend-item">{inner}</span>}</li>
  })}</ul>
}

// One printable A4 sheet. For 'code' sheets pass title, how, cells and tags.
export function SheetEn({ p, mode, title, how, cells, tags, footer = 'Color by number' }) {
  const level = LEVELS_EN[p.level]
  const t = title || (mode === 'solution' ? `Answer key: ${cbnName(p)}` : mode === 'math' ? `Color by math: ${level.mathLabel.toLowerCase()}` : 'Color by number')
  const h = how || (mode === 'math' ? 'Solve the problem in each square, find the answer in the key and color the square in its color.' : 'Color each square in the color of its number, using the key, and find out what is hiding in the picture.')
  return <article className="buga-a4 cbn-sheet" dir="ltr" lang="en">
    <h2>{t}</h2>
    {mode !== 'solution' && <>
      <p className="art-caption cbn-caption"><span>{h}</span><span className="cbn-name">Name: ______________</span></p>
      <LegendEn p={p} mode={mode} tags={tags} compact />
    </>}
    <div className="print-art"><CbnSvg p={p} mode={mode} cells={cells} label={`${t}: ${cbnName(p)}`} /></div>
    <footer>Ugabuga · {footer} · ugabuga.co.il/en</footer>
  </article>
}

export function PictureCardEn({ p, to, sub }) {
  const level = LEVELS_EN[p.level], { cols, rows } = cbnSize(p)
  const paths = useMemo(() => thumbnailPaths(cbnGrid(p)), [p])
  const legend = cbnLegend(p)
  return <Link to={to || cbnPathEn(p)} className="wobbly group flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-3 sketch-shadow transition-[transform,box-shadow] duration-150 hover:-translate-y-1">
    <div className="cbn-thumb"><svg viewBox={`-0.5 -0.5 ${cols * CELL + 1} ${rows * CELL + 1}`} className="cbn-svg" role="img" aria-label={`Color by number: ${cbnName(p)}`} dir="ltr">
      {paths.map(({ color, d }) => <path key={color} d={d} fill={legend[color - 1].hex} />)}
    </svg></div>
    <b className="mt-2 text-lg">{p.emoji} {cbnName(p)}</b>
    <small className="text-[var(--muted-foreground)]">{sub || <><span className={`rounded-full px-2 ${badge(p.level)}`}>{level.label}</span> · {cols}×{rows} · {p.colors.length} colors</>}</small>
  </Link>
}

// Online coloring of one picture: the board, the key, the tools and the progress line.
export function PlayArea({ p, mode, cells, tags, tagName, painting, reveal, setReveal, label, children }) {
  const grid = useMemo(() => cbnGrid(p), [p])
  const { fills, active, erasing, paint, pick } = painting
  const total = grid.flat().filter(n => n > 0).length
  const correct = Object.entries(fills).filter(([k, n]) => { const [r, c] = k.split('-').map(Number); return grid[r][c] === n }).length
  return <section className="no-print cbn-play mt-6" aria-label="Color online">
    {children}
    <p className="cbn-hint">Pick a color in the key and tap the squares. Made a mistake? Tap the square again, or press Undo.</p>
    <LegendEn p={p} mode={mode} tags={tags} tagName={tagName} active={erasing ? 0 : active} onPick={pick} />
    <PaintBarEn painting={painting} />
    <div className="cbn-board wobbly-md">
      <CbnSvg p={p} mode={reveal ? 'solution' : mode} cells={cells} fills={fills} onPaint={reveal ? null : paint} label={label} />
    </div>
    <div className="cbn-tools">
      <span role="status">{correct === total ? '🎉 Well done! The picture is complete' : `${correct} of ${total} squares colored correctly`}</span>
      <button type="button" onClick={() => setReveal(v => !v)}>{reveal ? '🙈 Hide the answer' : '👀 Show the answer'}</button>
    </div>
  </section>
}

export function SolutionToggle({ checked, onChange }) {
  return <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5" />Print an answer key too</label>
}

export function MoreWaysEn({ p, skip }) {
  return <section className="no-print mt-10" aria-labelledby="cbn-more-ways">
    <h2 id="cbn-more-ways" className="mb-4 text-center text-2xl font-black">{p ? `More ways to color the ${p.slug.startsWith('mandala') ? 'mandala' : 'picture'}` : 'The same pictures, more ways to color'}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{MORE_WAYS.filter(w => w.href !== skip).map(w => <Link key={w.href} to={p && w.href !== CBN_HUB ? `${w.href}?p=${p.slug}` : w.href} className="wobbly flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-transform hover:-translate-y-1">
      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[var(--postit)] text-2xl font-black" aria-hidden="true">{w.emoji}</span>
      <span><b className="block text-lg">{w.title}</b><small className="text-[var(--muted-foreground)]">{w.desc}</small></span>
    </Link>)}</div>
  </section>
}

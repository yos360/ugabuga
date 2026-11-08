import { Link, Navigate, useParams } from 'react-router-dom'
import PrintableShell from '../../components/printables/PrintableShell'
import { COLORING_SUBJECTS, coloringFmt, coloringSrc } from '../../data/coloringSubjects'
import { COLORING_DRAWINGS } from '../../data/coloringDrawings'
import { EN_COLORING } from '../activityCatalog'
import { EnglishNotFound } from '../EnglishLayout'
import { parseAges, relatedSubjects } from '../coloringInsights'
import { findEnColoringDrawing } from './drawingCatalog'
import { enDrawingLink } from './drawingHref'

// /en/coloring-pages/:subject/:n: one drawing of the shared collection, in English.
// Mirrors the Hebrew ColoringDrawing page: the same artwork, a print preview, its neighbours and its subject.

const agesText = ages => !ages ? null : ages[1] ? `${ages[0]}–${ages[1]}` : `${ages[0]} and up`
const card = 'rounded-2xl border-2 border-slate-200 bg-white p-3 text-center hover:border-pink-300'

function levelCopy(ages) {
  if (!ages) return 'Print it, pick a few colors and enjoy it at your own pace.'
  if (ages[0] <= 4) return 'The big, clear shapes suit little hands: chunky crayons or washable markers are perfect, and a grown-up can help with any small corners.'
  if (ages[0] <= 7) return 'There is a mix of large areas and a few smaller details. Crayons work for the big shapes; switch to colored pencils for the fine parts.'
  if (ages[0] <= 9) return 'It has plenty of smaller spaces, so sharpened colored pencils or fine-tip markers give the neatest result.'
  return 'This is a detailed page with many small spaces. Sharp colored pencils or fine liners work best, and it is a calm, focused activity for older kids and adults.'
}

function DrawingThumb({ slug, n, note }) {
  const link = enDrawingLink(slug, n)
  if (!link) return null
  return <Link to={link.href} className={card}>
    <img src={coloringSrc(slug, n, 'webp')} alt={link.name} loading="lazy" width="400" height="400" className="aspect-square w-full object-contain" />
    <span className="mt-2 block font-bold">{link.name}</span>{note && <small className="text-slate-500">{note}</small>}
  </Link>
}

export default function EnglishColoringDrawing() {
  const { subject, n } = useParams()
  const drawing = findEnColoringDrawing(subject, n)
  const s = COLORING_SUBJECTS.find(item => item.slug === subject)
  const topic = EN_COLORING.find(t => t.slug === subject)
  if (!drawing) {
    // Drawings already published among the holiday drawings keep that page as their only English page.
    const elsewhere = s && enDrawingLink(subject, n)
    return elsewhere ? <Navigate replace to={elsewhere.href} /> : <EnglishNotFound />
  }
  if (!s || !topic) return <EnglishNotFound />
  const rows = COLORING_DRAWINGS[s.slug] || []
  const ages = parseAges(rows[drawing.n - 1]?.ages)
  const agesLabel = agesText(ages)
  const hub = topic.path
  const all = rows.map(r => ({ n: r.n, ages: parseAges(r.ages) }))
  const withAges = all.filter(r => r.ages && r.n !== drawing.n)
  const simpler = ages && withAges.filter(r => r.ages[0] < ages[0]).sort((a, b) => b.ages[0] - a.ages[0] || Math.abs(a.n - drawing.n) - Math.abs(b.n - drawing.n))[0]
  const harder = ages && withAges.filter(r => r.ages[0] > ages[0]).sort((a, b) => a.ages[0] - b.ages[0] || Math.abs(a.n - drawing.n) - Math.abs(b.n - drawing.n))[0]
  const prev = drawing.n > 1 ? enDrawingLink(s.slug, drawing.n - 1) : null
  const next = drawing.n < drawing.count ? enDrawingLink(s.slug, drawing.n + 1) : null
  const more = all.filter(r => r.n !== drawing.n).sort((a, b) => Math.abs(a.n - drawing.n) - Math.abs(b.n - drawing.n) || a.n - b.n).slice(0, 8).sort((a, b) => a.n - b.n)
  const related = relatedSubjects(s.slug, 4)
  // "cat", "Hanukkah menorah", "Maccabees": reads naturally before "coloring pages" and keeps proper nouns.
  const subjectName = drawing.noun
  const faq = [
    ...(agesLabel ? [{ q: `What age is “${drawing.name}” for?`, a: `We suggest it for ages ${agesLabel}, based on how much detail it has. That is only a guide: let your child pick the pictures they love. ${levelCopy(ages)}` }] : []),
    { q: 'How do I print this coloring page or save it as a PDF?', a: 'Press “Print or download PDF” to open the preview, then print it or choose “Save as PDF” in the print window. The drawing fills one portrait A4 page; turning off headers and footers in the print settings gives the cleanest sheet.' },
    { q: 'Will it print on US Letter paper?', a: 'Yes. Choose “Fit to page” (or “Scale to fit”) in your printer settings and the whole drawing fits on a Letter sheet with a small margin.' },
    { q: `Are there more ${subjectName} coloring pages?`, a: `Yes, this is sheet ${drawing.n} of ${drawing.count}. The ${topic.name} page lets you tick several sheets and print them together as one PDF.` },
  ]
  return <div className="en-page">
    <PrintableShell lang="en" key={drawing.path} path={drawing.path} counterpartPath={drawing.counterpart}
      seoTitle={drawing.title} h1={drawing.name} description={drawing.description}
      image={coloringSrc(s.slug, drawing.n, 'webp')} emoji={s.emoji}
      sub={`${topic.name} coloring page${agesLabel ? ` · suggested ages ${agesLabel}` : ''} · free to print or save as PDF`}
      intro={<p className="mx-auto mb-6 max-w-3xl text-center leading-relaxed">“{drawing.name}” is sheet {drawing.n} of {drawing.count} in our {topic.name} collection. {topic.tip}</p>}
      crumbs={[{ label: 'Coloring', href: '/en/coloring-pages' }, { label: topic.name, href: hub }]}
      pages={[{ key: drawing.path, svg: <img src={coloringSrc(s.slug, drawing.n, coloringFmt(s))} alt={`${drawing.name} coloring page`} width="1408" height="1408" fetchPriority="high" className="block h-auto w-full object-contain" /> }]}
      printTitle={drawing.name} printLabel="Print or download PDF"
      extra={<Link to={hub} className="block py-2 font-bold underline">← All {subjectName} coloring pages</Link>}
      after={<section className="no-print mx-auto mt-10 max-w-3xl" aria-labelledby="drawing-guide-title">
        <h2 id="drawing-guide-title" className="mb-2 mt-6 text-2xl font-bold">Who it suits and what to color with</h2>
        <p className="leading-relaxed">{levelCopy(ages)}</p>
        {(simpler || harder) && <>
          <h2 className="mb-2 mt-6 text-2xl font-bold">Something simpler or more challenging</h2>
          <div className="grid grid-cols-2 gap-4 sm:max-w-md">
            {simpler && <DrawingThumb slug={s.slug} n={simpler.n} note={`Simpler · ages ${agesText(simpler.ages)}`} />}
            {harder && <DrawingThumb slug={s.slug} n={harder.n} note={`More detail · ages ${agesText(harder.ages)}`} />}
          </div>
        </>}
        <nav aria-label="Previous and next drawing" className="mt-8 flex flex-wrap justify-between gap-3">
          {prev ? <Link to={prev.href} className="font-bold underline">← {prev.name}</Link> : <span />}
          {next ? <Link to={next.href} className="font-bold underline">{next.name} →</Link> : <span />}
        </nav>
        <h2 className="mb-4 mt-8 text-2xl font-bold">More {subjectName} coloring pages</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{more.map(r => <DrawingThumb key={r.n} slug={s.slug} n={r.n} />)}</div>
        <p className="mt-4"><Link to={hub} className="font-bold underline">See all {drawing.count} {subjectName} sheets and print several at once →</Link></p>
      </section>}
      paragraphs={[
        `Choose two or three colors before you start, then fill the biggest shapes first. When the picture is finished, give it a title and tell someone what is happening in it.`,
        'The page prints on A4. For US Letter paper, pick “Fit to page” in your printer settings. You can print it as many times as you like, so it is easy to color one copy together and keep a fresh one for later.',
      ]}
      faq={faq}
      related={[{ label: `All ${subjectName} coloring pages`, href: hub }, ...related.map(r => ({ label: `${r.name} coloring pages`, href: r.path })), { label: 'All coloring subjects', href: '/en/coloring-pages' }]} />
  </div>
}

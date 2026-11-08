import { Link } from 'react-router-dom'
import PrintableShell from '../../components/printables/PrintableShell'
import { EnglishNotFound } from '../EnglishLayout'
import { HOW_TO_DRAW, findHowToDraw, howToDrawSrc } from '../../data/howToDraw'
import { DRAW_HUB, drawEn, drawPathEn, artPage } from './catalog'
import { ArtFrame, ArtBody } from './cbnEn'
import { enLink } from './artUtils'

// /en/how-to-draw and one page per drawing: the Hebrew site's step-by-step images (they have no words on them)
// with the steps, tip and FAQ in English.

const card = 'rounded-2xl border-2 border-slate-200 bg-white p-3 text-center hover:border-pink-300'
const extraLinks = () => [...enLink('/printables/coloring', 'Coloring pages'), ...enLink('/printables/symmetry', 'Symmetry drawing'), ...enLink('/drawing-prompt', 'Drawing ideas'), { label: 'Color by number', href: '/en/printables/color-by-number' }]

const FAQ = [
  { q: 'How do the how-to-draw pages work?', a: 'Each page has six numbered boxes. In every box the new line is black and the steps you already drew are gray, so you can see exactly what to add next. Copy them one step at a time onto blank paper, until you reach the finished drawing in box 6.' },
  { q: 'What ages are they for?', a: 'The drawings are made of simple shapes like circles, triangles and arches, and suit kids of about 4 to 9. Little ones can draw together with a grown-up, and older kids can add their own background and details.' },
  { q: 'What do we need to get started?', a: 'A soft pencil, an eraser and a sheet of blank paper. Draw lightly first, and only at the end go over the lines with a black marker and color it in.' },
  { q: 'Are the pages free?', a: 'Yes. Every how-to-draw page is free for home, preschool and classroom use, with no sign-up. The drawings are original and were made for this site.' },
]

export function HowToDrawHubEn() {
  return <ArtFrame path={DRAW_HUB} crumbs={[{ label: 'How to draw' }]} faq={FAQ}>
    <header className="text-center">
      <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold">{HOW_TO_DRAW.length} step-by-step drawings</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">✏️ </span>How to draw: step-by-step drawing for kids</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">Choose what to draw, open the page and copy six small steps. In each step the new line is black and the earlier ones are gray, so it is impossible to get lost.</p>
    </header>
    <section className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{HOW_TO_DRAW.map(d => {
      const e = drawEn(d)
      return <Link key={d.slug} to={drawPathEn(d.slug)} className={card}>
        <img src={howToDrawSrc(d.slug, true)} alt={`How to draw ${e.what}, step by step`} loading="lazy" width="400" height="267" className="aspect-[3/2] w-full object-contain" />
        <span className="mt-2 block text-lg font-bold">{d.emoji} How to draw {e.what}</span><small className="text-slate-500">Ages {d.ages}</small>
      </Link>
    })}</section>
    <section className="mx-auto mt-10 max-w-3xl leading-relaxed">
      <h2 className="mb-2 text-2xl font-bold">Why learn to draw step by step?</h2>
      <p>Drawing in steps breaks a "hard" picture into shapes every child already knows: a circle, a triangle, an arch and a line. Kids see themselves succeed from the very first step, and that gives them the confidence to try on their own. Along the way they practice pencil control, looking closely and planning the page, skills that help with handwriting too.</p>
      <p className="mt-2">When the drawing is done, color it in, or carry on with a <Link to="/en/printables/color-by-number" className="font-bold underline">color by number picture</Link> on the same theme.</p>
    </section>
    <ArtBody faq={FAQ} related={extraLinks()} />
  </ArtFrame>
}

export default function HowToDrawPageEn({ params }) {
  const d = findHowToDraw(params?.slug)
  if (!d) return <EnglishNotFound />
  const e = drawEn(d), path = drawPathEn(d.slug), page = artPage(path)
  const coloring = d.coloring ? enLink(`/printables/coloring/${d.coloring}`, `${e.name} coloring pages`) : []
  const others = HOW_TO_DRAW.filter(x => x.slug !== d.slug).slice(0, 8)
  const faq = [
    { q: `How many steps does it take to draw ${e.what}?`, a: `Six steps. The first: ${e.steps[0]} The last: ${e.steps[5]}` },
    { q: `What age is the ${e.name.toLowerCase()} drawing for?`, a: `It suits kids aged ${d.ages} best. ${e.tip}` },
    { q: 'How do I print the page?', a: 'Press "Print or download PDF". The page opens in an A4 preview, ready to print or save as a PDF. On US Letter paper, choose "Fit to page" in the print settings.' },
  ]
  return <PrintableShell key={path} lang="en" path={path} counterpartPath={page.counterpart} seoTitle={page.title} description={page.description}
    h1={`How to draw ${e.what}, step by step`} image={howToDrawSrc(d.slug)} emoji={d.emoji} sub={`Six simple steps · best for ages ${d.ages} · free to print`}
    crumbs={[{ label: 'How to draw', href: DRAW_HUB }]}
    pages={[{ key: path, svg: <img src={howToDrawSrc(d.slug)} alt={`How to draw ${e.what}: six steps`} width="1024" height="683" fetchPriority="high" className="block h-auto w-full object-contain" /> }]}
    printTitle={`How to draw ${e.what}`} printLabel="Print or download PDF"
    after={<section className="no-print mx-auto mt-8 max-w-3xl" dir="ltr">
      <h2 className="mb-2 text-2xl font-bold">The steps in words</h2>
      <ol className="list-decimal space-y-1 pl-6 leading-relaxed">{e.steps.map(s => <li key={s}>{s}</li>)}</ol>
      <p className="mt-3 leading-relaxed"><b>Tip:</b> {e.tip}</p>
      {coloring.map(c => <p key={c.href} className="mt-3"><Link to={c.href} className="font-bold underline">{d.emoji} {c.label}, ready to color</Link></p>)}
      <h2 className="mb-3 mt-8 text-2xl font-bold">More step-by-step drawings</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{others.map(x => {
        const xe = drawEn(x)
        return <Link key={x.slug} to={drawPathEn(x.slug)} className={card}>
          <img src={howToDrawSrc(x.slug, true)} alt={`How to draw ${xe.what}`} loading="lazy" width="400" height="267" className="aspect-[3/2] w-full object-contain" />
          <span className="mt-2 block font-bold">{x.emoji} {xe.name}</span>
        </Link>
      })}</div>
    </section>}
    faq={faq}
    related={[{ label: 'All how-to-draw pages', href: DRAW_HUB }, ...coloring, ...extraLinks()]}
    extra={<Link to={DRAW_HUB} className="block py-2 font-bold underline">Back to all drawings</Link>} />
}

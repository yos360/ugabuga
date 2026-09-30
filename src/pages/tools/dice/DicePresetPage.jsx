import { Link, useParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import NotFound from '../../NotFound'
import DiceRoller from './DiceRoller'
import { DICE_PRESETS } from './dicePresets'
import DiceFamilyLinks from './DiceFamilyLinks'

export default function DicePresetPage() {
  const { preset } = useParams()
  const p = DICE_PRESETS[preset]
  if (!p) return <NotFound />
  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title={p.seoTitle} description={p.description} path={'/tools/dice/' + preset} structuredData={faqSchema(p.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קוביה', href: '/tools/dice' }, { label: p.short }]} />
      <h1 className="text-4xl text-center mb-2">{p.emoji} {p.title}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{p.description}</p>
      <DiceRoller {...p.roller} renderMessage={p.renderMessage} />
      <DiceFamilyLinks current={'/tools/dice/' + preset} />
      <div className="mt-10">
        <SeoBody paragraphs={p.paragraphs} faq={p.faq} related={p.related.map(([label, href]) => ({ label, href }))} />
      </div>
    </div>
  )
}

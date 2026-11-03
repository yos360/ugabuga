import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { TOOLS_PAGES } from './catalog'
import './tools.css'

// Shared frame of the English tool pages: SEO (title, description and counterpart come from the catalog),
// breadcrumbs, heading and the FAQ block. The "en-rsvp" class keeps the English base styles
// (dark buttons, Fredoka headings) away from the tools' own Tailwind and calculator styling.
export default function ToolFrame({ path, h1, intro, crumb, faq = [], paragraphs = [], related = [], width = 'max-w-5xl', bodyTitle, className = '', children }) {
  const page = TOOLS_PAGES.find(p => p.path === path)
  return <div className={`en-rsvp en-tool mx-auto ${width} px-4 py-8 ${className}`} dir="ltr" lang="en">
    <SEO lang="en" path={path} title={page.title} description={page.description} counterpartPath={page.counterpart} structuredData={faq.length ? faqSchema(faq) : undefined} />
    <Breadcrumbs lang="en" items={path === '/en/tools' ? [{ label: 'Home', href: '/en' }, { label: 'Tools' }] : [{ label: 'Home', href: '/en' }, { label: 'Tools', href: '/en/tools' }, { label: crumb || page.title }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-2">{h1 || page.title}</h1>
    {intro && <p className="text-center mb-5 text-lg">{intro}</p>}
    {children}
    {(paragraphs.length > 0 || faq.length > 0) && <div className="mt-10 no-present">
      {bodyTitle && <h2 className="text-2xl mb-4">{bodyTitle}</h2>}
      <SeoBody lang="en" paragraphs={paragraphs} faq={faq} related={related} />
    </div>}
  </div>
}

import { Link } from 'react-router-dom'
import ToolFrame from './ToolFrame'
import { TOOLS_PAGES } from './catalog'

const PATH = '/en/tools'
const FAQ = [
  { q: 'Are these tools free?', a: 'Yes. Every tool on this page is free, with no sign-up and no watermark.' },
  { q: 'Do my files or text leave my device?', a: 'No. The calculator, the PDF tools, the QR code maker and the Hebrew keyboard all work inside your browser. Your files and text are not sent to a server.' },
  { q: 'Why is there a Hebrew keyboard?', a: 'Ugabuga is a Hebrew learning site. The keyboard lets anyone type Hebrew, with vowel marks, on a computer that has no Hebrew installed.' },
]

export default function EnglishToolsHub() {
  const tools = TOOLS_PAGES.filter(p => p.path !== PATH)
  return <ToolFrame path={PATH} h1="Free online tools for everyday jobs"
    intro="A scientific calculator, PDF tools, a QR code maker, a Hebrew keyboard and a touch typing course. They run in your browser, with no sign-up."
    bodyTitle="About these tools" faq={FAQ}
    paragraphs={['Each tool does one job well and works on a computer or a phone. The calculator, PDF tools, QR code maker and Hebrew keyboard keep your files and text in your own browser. Pick one below.']}
    related={[{ href: '/en', label: 'the Ugabuga home page' }, { href: '/en/printables', label: 'free printable activities' }]}>
    <div className="en-tool-cards">
      {tools.map(p => <Link key={p.path} to={p.path} className="en-card">
        <span className="en-card-icon" aria-hidden="true">{p.emoji}</span>
        <h2>{p.title}</h2>
        <p>{p.description}</p>
        <span>Open the tool →</span>
      </Link>)}
    </div>
  </ToolFrame>
}

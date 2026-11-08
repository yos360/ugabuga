import { Link } from 'react-router-dom'
import ToolFrame from './ToolFrame'
import { TOOLS_GROUPS, TOOLS_PAGES } from './catalog'

const PATH = '/en/tools'
const FAQ = [
  { q: 'Are these tools free?', a: 'Yes. Every tool on this page is free, with no sign-up and no watermark.' },
  { q: 'Do my files or text leave my device?', a: 'No. The calculators, the PDF and photo tools, the QR code maker, the puzzle makers and the Hebrew keyboard all work inside your browser. Your files and text are not sent to a server. The only exceptions are the niqqud tool, which sends the Hebrew text to the Dicta vowel service, and the currency converter, which loads the daily exchange rates.' },
  { q: 'Which tool is best for picking names in class?', a: 'The spinning wheel shows everyone the choice and can skip names that were already picked. For groups, use the team generator, and for a number queue, the random number generator.' },
  { q: 'Can I use them at a birthday party?', a: 'Of course: a countdown timer for charades, a scoreboard for a quiz, online dice for board games, the wheel for prizes and a printable scavenger hunt or bingo.' },
  { q: 'Why are there Hebrew tools?', a: 'Ugabuga is a Hebrew learning site. The Hebrew keyboard, the niqqud tool, gematria and the Hebrew birthday calculator help anyone learning Hebrew or keeping the Jewish calendar.' },
]

export default function EnglishToolsHub() {
  const tools = TOOLS_PAGES.filter(p => p.path !== PATH)
  return <ToolFrame path={PATH} h1="Free online tools for the classroom, home and office"
    intro="Dice, a spinning wheel, timers, calculators, printable puzzle makers, PDF and photo tools, and Hebrew tools. They run in your browser, with no sign-up."
    bodyTitle="About these tools" faq={FAQ}
    paragraphs={[
      'Each tool does one job well and works on a computer, a tablet, a phone or the classroom smart board. Most keep your files and text in your own browser, so they are safe for photos of children and personal documents.',
      'Teachers often start with the countdown timer, the spinning wheel and the team generator; parents with the word search and bingo makers for parties; and everyone sooner or later needs to merge a PDF or shrink a photo.',
    ]}
    related={[{ href: '/en', label: 'the Ugabuga home page' }, { href: '/en/printables', label: 'free printable activities' }, { href: '/en/worksheets', label: 'printable worksheets' }]}>
    <nav aria-label="Tool groups" className="mb-6 flex flex-wrap justify-center gap-2">
      {TOOLS_GROUPS.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">{label}</a>)}
    </nav>
    {TOOLS_GROUPS.map(([id, label]) => <section key={id} id={id} className="scroll-mt-24">
      <h2 className="mt-8 text-2xl font-black">{label}</h2>
      <div className="en-tool-cards">
        {tools.filter(p => p.group === id).map(p => <Link key={p.path} to={p.path} className="en-card">
          <span className="en-card-icon" aria-hidden="true">{p.emoji}</span>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <span>Open the tool →</span>
        </Link>)}
      </div>
    </section>)}
  </ToolFrame>
}

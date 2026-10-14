import { useState } from 'react'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet } from '../components/printables/PrintableShell'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { ENGLISH_SECTIONS } from './englishLinks'
const faq = [
  { q: 'Who is the English edition for?', a: 'Parents, teachers and children exploring Hebrew and Jewish family traditions together. You do not need to read Hebrew to use the English instructions.' },
  { q: 'Do we need an account?', a: 'No. Activities in this edition are free to use, with no registration.' },
  { q: 'Is this the same as the English lessons on the Hebrew site?', a: 'No. Those lessons teach English to Hebrew-speaking children. This edition provides English instructions for families learning about Hebrew and Jewish traditions.' },
]
export default function EnglishHome() {
  const [printing, setPrinting] = useState(false)
  return <div className="en-page"><SEO lang="en" counterpartPath="/" path="/en" title="Hebrew learning and Jewish family activities" description="Explore Hebrew and Jewish traditions together with Ugabuga: welcoming English instructions for parents, children and teachers. Free, with no sign-up." structuredData={faqSchema(faq)} />
    <p className="en-eyebrow">Welcome to Ugabuga in English</p><h1>Small discoveries. Shared traditions.</h1><p className="en-lead">Make room for a little curiosity: a new Hebrew letter, a family tradition, or a question you can explore together.</p>
    {ENGLISH_SECTIONS.length > 0 && <section><h2>Choose a place to start</h2><div className="en-cards">{ENGLISH_SECTIONS.map(s => <Link className="en-card" key={s.path} to={s.path}><h3>{s.title}</h3><p>{s.description}</p><span>Explore →</span></Link>)}</div></section>}
    <section><h2>A place for your discoveries</h2><p>Print a simple learning page. Draw or write something you noticed, a new word, and a question to explore next.</p><button data-print-main onClick={() => setPrinting(true)}>Print my learning notes</button></section>
    {printing && <PrintPreview lang="en" title="My learning notes" onClose={() => setPrinting(false)}><article className="buga-a4 en-print-sheet" dir="ltr"><div className="print-art"><Sheet label="My learning notes"><text x="100" y="20" textAnchor="middle" fontSize="10" fontWeight="700" direction="ltr">My learning notes</text><text x="15" y="38" fontSize="5" direction="ltr">Name: __________________   Date: __________</text>{['Something I noticed', 'A new word', 'My next question'].map((t,i) => <g key={t}><text x="15" y={60+i*65} fontSize="6" direction="ltr">{t}</text><rect x="15" y={65+i*65} width="170" height="45" fill="none" stroke="#777" strokeWidth=".4" /></g>)}</Sheet></div></article></PrintPreview>}
    <SeoBody lang="en" paragraphs={['Ugabuga began as a Hebrew activity site for children in Israel. This English edition welcomes families and classrooms who want to explore Hebrew and Jewish traditions with clear explanations in English.', 'Learning works well in small moments. Read a short explanation together, let your child ask a question, and return to an activity when they feel ready. There is no need to complete everything in one sitting.', 'Hebrew is written from right to left, while these instructions read from left to right. As the English collection grows, each activity will keep Hebrew examples clearly marked and give adults the context they need.']} faq={faq} />
  </div>
}

import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { ACTIVITY_SECTIONS, EN_COLORING } from './activityCatalog'
import { coloringSrc } from '../data/coloringSubjects'
import '../pages/Home.css'
import '../pages/home-responsive.css'
import '../pages/home-intents.css'

const faq = [
  { q: 'Are these activities free?', a: 'Yes. The activities in this English collection are free to use, print and save as PDF, with no account required.' },
  { q: 'Is this the same Ugabuga as the Hebrew site?', a: 'Yes. We share the same artwork and game engines. This English collection includes coloring, memory matching, a printable birthday kit, Hebrew learning and Jewish holiday activities. The Hebrew site still has additional tools and content.' },
  { q: 'Can I use the printable pages in a classroom?', a: 'Yes. Choose the sheets you need, open the preview and print copies for your group. The PDF uses A4 pages; choose Fit to page if your printer uses US Letter.' },
]
const art = ['home-detective-boy-720.webp','home-printer-720.webp','home-schoolgirl-720.webp','home-birthday-girl-720.webp']
const colors = [['#fff1b8','#ff8a1f'],['#f3eaff','#a775ed'],['#dff2ff','#28a4ef'],['#ffe7e4','#ff6f7b']]
export default function EnglishHome() {
  return <><SEO lang="en" counterpartPath="/" path="/en" title="Free games, coloring pages and activities for kids" description="Play, print, learn and celebrate with Ugabuga. Free coloring pages, memory games, printable birthday invitations and family learning activities in English." structuredData={faqSchema(faq)} />
    <div className="home-v2 en-home">
      <section className="home-intro"><p className="en-eyebrow">UGABUGA · PLAY, PRINT, LEARN & CELEBRATE</p><h1>A little bit of everything.<br/>A whole lot of fun.</h1><p>Games, coloring pages, learning activities and birthday ideas for children, families and classrooms. Free to enjoy, with no sign-up.</p></section>
      <section className="home-intents" aria-labelledby="en-intents-title"><h2 id="en-intents-title">What brings you here today?</h2><div className="home-doors">{ACTIVITY_SECTIONS.map((s,i)=><Link className="home-door home-intent" to={s.path} key={s.path} style={{'--door-bg':colors[i][0],'--door-color':colors[i][1]}}><div className="home-door-copy"><h3>{s.title}</h3><p>{s.description}</p></div><img className="en-door-art" src={'/images/'+art[i]} alt="" width="720" height="720" /><span className="home-door-arrow" aria-hidden="true">→</span></Link>)}</div></section>
      <section className="en-home-play"><div><p className="en-eyebrow">READY, SET, PLAY</p><h2>Two cards. One perfect match.</h2><p>Take a good look, turn the cards over and find the pairs. How many turns will you need?</p><Link to="/en/games/memory" className="en-button">Play the memory game →</Link></div><div className="en-mini-cards" aria-hidden="true"><span>🐶</span><span>🦄</span><span>🦄</span><span>🐶</span></div></section>
      <section className="home-extra"><div className="en-section-heading"><div><h2>Grab your favorite colors</h2><p>Original drawings from the Ugabuga collection.</p></div><Link to="/en/coloring-pages">All {EN_COLORING.length} subjects →</Link></div><div className="en-cards en-coloring-grid">{['unicorn','dinosaur','cat','flowers','vehicles','mandala-kids'].map(slug=>{const s=EN_COLORING.find(x=>x.slug===slug);return <Link to={s.path} key={slug} className="en-card"><img src={coloringSrc(slug,1,'webp')} alt={`${s.name} coloring example`} width="400" height="400" loading="lazy"/><h3>{s.name}</h3><span>{s.count} free sheets →</span></Link>})}</div></section>
      <section className="home-extra"><h2>Discover something together</h2><div className="home-extras"><Link to="/en/hebrew-alphabet"><h3>🔤 Learn Hebrew letters</h3><p>Listen, trace and get to know each letter.</p></Link><Link to="/en/jewish-holidays"><h3>🕎 Family traditions</h3><p>Explore Jewish holidays with stories, dates and activities.</p></Link><Link to="/en/birthday"><h3>🎂 Your party starts here</h3><p>Make an invitation, print your checklist and choose a game.</p></Link></div></section>
      <section className="en-home-play en-home-rsvp"><div><p className="en-eyebrow">HOSTING SOMETHING?</p><h2>One link. Every RSVP in one place.</h2><p>Send your guests a free RSVP link and see who’s coming, how many children and adults, allergies and who hasn’t replied yet.</p><Link to="/en/rsvp" className="en-button">Create a free RSVP →</Link></div><div className="en-mini-cards" aria-hidden="true"><span>🎉</span><span>✅</span><span>🤔</span><span>💌</span></div></section>
      <section className="home-extra"><SeoBody lang="en" paragraphs={['Ugabuga brings playful, practical activities together: something to play now, a page to print, a little learning and a reason to celebrate. The English and Hebrew collections share the same drawings and the same colorful home.', 'Start with one small activity. Pick a coloring sheet, challenge a friend to a memory game, or make an invitation for the next birthday. Explore the alphabet and holiday collections when you want to learn together.']} faq={faq} /></section>
    </div>
  </>
}

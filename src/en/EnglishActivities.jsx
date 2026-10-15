import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet } from '../components/printables/PrintableShell'
import { coloringSrc } from '../data/coloringSubjects'
import { EN_COLORING } from './activityCatalog'
import { EnglishNotFound } from './EnglishLayout'
const Memory = lazy(() => import('../arcade/games/Memory'))

export function EnglishColoring() {
  const { subject } = useParams()
  const topic = EN_COLORING.find(s => s.slug === subject)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [printing, setPrinting] = useState(false)
  useEffect(() => { setSelected([]); setPrinting(false) }, [subject])
  if (subject && !topic) return <EnglishNotFound />
  const title = topic ? `${topic.name} coloring pages` : 'Free coloring pages to print'
  const path = topic?.path || '/en/coloring-pages'
  const toggle = n => setSelected(old => old.includes(n) ? old.filter(x => x !== n) : [...old, n].sort((a,b) => a-b))
  return <div className="en-page">
    <SEO lang="en" title={title} path={path} counterpartPath={topic?.counterpart || '/printables/coloring'} description={topic ? `${topic.count} free ${topic.name.toLowerCase()} coloring pages. Choose your sheets, preview, print or save a PDF. ${topic.tip}` : 'Browse the Ugabuga coloring collection in English: animals, dinosaurs, unicorns, flowers, mandalas and more. Select sheets and print or save a free PDF.'} image={topic ? coloringSrc(topic.slug, 1, 'webp') : '/og-image.png'} />
    <nav className="en-breadcrumb" aria-label="Breadcrumb"><Link to="/en">Home</Link> / {topic ? <Link to="/en/coloring-pages">Coloring</Link> : 'Coloring'}{topic && <> / {topic.name}</>}</nav>
    <h1>{title}</h1>
    <p className="en-lead">{topic ? topic.tip : 'The same original drawings you know from Ugabuga, ready to enjoy with English instructions. Pick a subject and choose the sheets you want.'}</p>
    {!topic ? <>
      <label className="en-search-label">Find a subject<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try cats, dinosaurs or mandalas" /></label>
      <p role="status">{EN_COLORING.filter(s => s.name.toLowerCase().includes(query.trim().toLowerCase())).length} subjects</p>
      <div className="en-cards en-coloring-grid">{EN_COLORING.filter(s => s.name.toLowerCase().includes(query.trim().toLowerCase())).map(s => <Link className="en-card" key={s.slug} to={s.path}><img loading="lazy" width="400" height="400" src={coloringSrc(s.slug,1,'webp')} alt={`${s.name} coloring example`} /><h2>{s.emoji} {s.name}</h2><span>{s.count} sheets · Choose and print →</span></Link>)}</div>
    </> : <>
      <p>{topic.count} drawings. Select one or more sheets below. Your PDF contains only the sheets you select.</p>
      <div className="en-selection-bar"><span role="status">{selected.length} selected</span><button type="button" onClick={() => setSelected(Array.from({length:topic.count},(_,i)=>i+1))}>Select all</button><button type="button" disabled={!selected.length} onClick={() => setSelected([])}>Clear</button><button data-print-main type="button" disabled={!selected.length} onClick={() => setPrinting(true)}>Preview, print or save PDF</button></div>
      <div className="en-cards en-coloring-grid">{Array.from({length:topic.count},(_,i)=>i+1).map(n => <label className={`en-card en-select-sheet${selected.includes(n) ? ' is-selected' : ''}`} key={n}><img loading="lazy" width="400" height="400" src={coloringSrc(topic.slug,n,'webp')} alt={`${topic.name} coloring sheet ${n}`} /><span><input type="checkbox" checked={selected.includes(n)} onChange={() => toggle(n)} /> {topic.name} · Sheet {n}</span></label>)}</div>
      <section><h2>A little more than coloring</h2><p>Choose a small set of colors before you begin. When your drawing is ready, give it a title and tell someone what is happening in the picture.</p><h2>Printing tips</h2><p>Open the preview to print or save a PDF. The sheets use an A4 page. For US Letter paper, choose “Fit to page” in your printer settings. Colored pencils work well for fine details; crayons are useful for larger shapes.</p></section>
      {printing && <PrintPreview lang="en" title={title} onClose={() => setPrinting(false)}>{selected.map(n => <article className="buga-a4 en-print-sheet" key={n} dir="ltr"><div className="print-art"><img src={coloringSrc(topic.slug,n,topic.fmt)} alt={`${topic.name} coloring sheet ${n}`} style={{width:'100%',height:'100%',objectFit:'contain'}} /></div></article>)}</PrintPreview>}
    </>}
  </div>
}

function NotesSheet() {
  return <Sheet label="My learning notes"><text x="100" y="20" textAnchor="middle" fontSize="10" fontWeight="700">My learning notes</text><text x="15" y="38" fontSize="5">Name: __________________   Date: __________</text>{['Something I noticed', 'A new word', 'My next question'].map((t,i) => <g key={t}><text x="15" y={60+i*65} fontSize="6">{t}</text><rect x="15" y={65+i*65} width="170" height="45" fill="none" stroke="#777" strokeWidth=".4" /></g>)}</Sheet>
}
export function EnglishPrintables() {
  const [printing,setPrinting] = useState(false)
  return <div className="en-page"><SEO lang="en" title="Free printable activities for kids" path="/en/printables" description="Choose free coloring sheets, Hebrew letter practice, learning notes and birthday activities. Preview your pages, print or save a PDF with Ugabuga." /><h1>Pick it. Print it. Make it yours.</h1><p className="en-lead">Ready-to-use activities for a quiet afternoon, a classroom table or a birthday party. Free to print and save as PDF.</p><div className="en-cards">{[['🎨','Coloring pages','Animals, magical creatures, vehicles, flowers and detailed mandalas.','/en/coloring-pages'],['🔤','Hebrew letter practice','Meet each letter and print a page to trace and practice.','/en/hebrew-alphabet'],['🎂','Birthday party kit','A personal invitation, a checklist and activity cards.','/en/birthday'],['🕎','Holiday activities','Holiday drawings and English–Hebrew word matching.','/en/jewish-holidays']].map(([emoji,name,desc,to])=><Link key={to} to={to} className="en-card"><span className="en-card-icon" aria-hidden="true">{emoji}</span><h2>{name}</h2><p>{desc}</p><span>Explore →</span></Link>)}</div><section className="en-feature"><div><h2>My learning notes</h2><p>A simple page for drawing a discovery, recording a new word and asking a question. Use it after reading, a nature walk or a classroom activity.</p><button data-print-main onClick={()=>setPrinting(true)}>Print learning notes</button></div><div className="en-sheet-thumb"><NotesSheet /></div></section>{printing&&<PrintPreview lang="en" title="My learning notes" onClose={()=>setPrinting(false)}><article className="buga-a4 en-print-sheet"><div className="print-art"><NotesSheet /></div></article></PrintPreview>}</div>
}

export function EnglishGames({ memory = false }) {
  const [message,setMessage] = useState('')
  const url = 'https://ugabuga.co.il/en/games/memory'
  const share = async text => {
    try {
      if (navigator.share) await navigator.share({title:'Ugabuga memory game',text,url})
      else { await navigator.clipboard.writeText(`${text}\n${url}`); setMessage('Challenge link copied. Send it to a friend!') }
    } catch(e) { if(e.name !== 'AbortError') setMessage(`Copy this challenge link: ${url}`) }
  }
  return <div className="en-page"><SEO lang="en" title={memory?'Memory matching game':'Games to play together'} path={memory?'/en/games/memory':'/en/games'} counterpartPath={memory?'/online-games/memory':undefined} description={memory?'Play Ugabuga’s memory game in English. Match the pairs, try the next level and share your score with a friend. Free, with no sign-up.':'Play the memory matching game, or try three simple party games together. Clear English instructions for children, families and classrooms.'} /><nav className="en-breadcrumb" aria-label="Breadcrumb"><Link to="/en">Home</Link> / {memory?<Link to="/en/games">Games</Link>:'Games'}</nav><h1>{memory?'Match the pairs!':'Let’s play together'}</h1>{memory?<><p>Take a quick look, then flip two cards at a time. Find every pair to unlock the next level. Progress stays in this browser, in either language.</p><div className="en-memory"><Suspense fallback={<p>Loading your game…</p>}><Memory lang="en" onShare={share} /></Suspense></div><p role="status">{message}</p></>:<><Link className="en-feature en-play-card" to="/en/games/memory"><span aria-hidden="true" className="en-game-art">🐶 🦄<br/>🦄 🐶</span><div><h2>Memory matching</h2><p>The Ugabuga card game, with English instructions. Find the pairs and work your way through the levels.</p><span className="en-button">Play now →</span></div></Link><h2>Three games away from the screen</h2><div className="en-cards">{[['Freeze dance','One person controls the music. Everyone dances while it plays and freezes when it stops. Start again with a different silly pose. Nobody has to sit out.'],['What changed?','Put five familiar objects on a tray. Let everyone look, then cover the tray and remove one item. Uncover it and take turns guessing what changed.'],['Pass the story','Start with one sentence. Each player adds one more. For younger children, let them choose a character or make a sound instead. Finish the story together.']].map(([t,p])=><article className="en-card" key={t}><h3>{t}</h3><p>{p}</p></article>)}</div></>}</div>
}

const DEFAULT_PARTY = { name:'',date:'',time:'',place:'',reply:'' }
function PartySheet({party:p,kind}) {
  const title = kind==='invite' ? 'You’re invited!' : kind==='checklist' ? 'Our party checklist' : 'Let’s play together'
  const lines = kind==='invite' ? [p.name ? `${p.name} is celebrating!` : 'Come celebrate with us!',p.date ? `Date: ${p.date}` : 'Date: ______________________',p.time ? `Time: ${p.time}` : 'Time: ______________________',p.place ? `Place: ${p.place}` : 'Place: _____________________',p.reply ? `RSVP: ${p.reply}` : 'RSVP: _____________________'] : kind==='checklist' ? ['Choose a date and a place','Write the guest list','Send invitations','Check replies and food needs','Plan food and drinks','Choose two or three games','Prepare music and decorations','Pack candles, plates and napkins','Set up a quiet activity corner','Take a breath and enjoy the day!'] : ['Freeze dance','Dance while the music plays.','Freeze in a funny pose when it stops.','','What changed?','Look at five objects on a tray.','Hide one. Can you spot what is missing?','','Pass the story','Add one sentence each.','What happens next? You decide!']
  return <Sheet label={title}>{kind==='invite'&&<g><rect x="8" y="8" width="184" height="40" rx="7" fill="#fff1b8" />{[25,175].map((x,i)=><g key={x}><ellipse cx={x} cy="28" rx="9" ry="12" fill={i?'#bce9ff':'#ffd1df'} stroke="#1d2233" strokeWidth=".5"/><path d={`M${x} 40q-5 7 0 13`} stroke="#1d2233" strokeWidth=".5" fill="none"/></g>)}<path d="M25 215l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z M175 215l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff1b8" stroke="#1d2233" strokeWidth=".4"/></g>}<rect x="7" y="7" width="186" height="246" rx="8" stroke="#1d2233" strokeWidth="1" fill="none"/><text x="100" y="33" textAnchor="middle" fontSize="11" fontWeight="700">{title}</text>{lines.map((line,i)=><g key={i}>{kind==='checklist'&&<rect x="17" y={52+i*17} width="5" height="5" stroke="#111" fill="none" strokeWidth=".4"/>}<text x={kind==='checklist'?27:100} y={kind==='invite'?67+i*30:57+i*17} textAnchor={kind==='checklist'?'start':'middle'} fontSize={kind==='invite'?Math.min(i===0?8:6,300/Math.max(1,line.length)):line.length>42?4:5}>{line}</text></g>)}<text x="100" y="242" textAnchor="middle" fontSize="4">Ugabuga · Made for happy moments together</text></Sheet>
}
export function EnglishBirthday() {
  const [party,setParty]=useState(()=>{try { const p=JSON.parse(localStorage.getItem('ugabuga-en-party-v1')||'null');return Object.fromEntries(Object.entries(DEFAULT_PARTY).map(([k,v])=>[k,typeof p?.[k]==='string'?p[k].slice(0,42):v])) } catch { return DEFAULT_PARTY }})
  const [printing,setPrinting]=useState(false)
  const [include,setInclude]=useState(true)
  const [saved,setSaved]=useState('')
  const save=()=>{try{localStorage.setItem('ugabuga-en-party-v1',JSON.stringify(party));setSaved('Draft saved in this browser.')}catch{setSaved('This browser could not save your draft. You can still print it.')}}
  return <div className="en-page"><SEO lang="en" title="Birthday invitations and party activities" path="/en/birthday" description="Make an English birthday invitation and print a party checklist and game cards. Personalize your free Ugabuga party kit, preview it and save a PDF." /><h1>A birthday is coming!</h1><p className="en-lead">Make an invitation, prepare your party and pick a game everyone can join. Your printable kit is ready in a few minutes.</p><div className="en-feature"><section><h2>Your invitation</h2><div className="en-form">{[['name','First name'],['date','Date (for example, November 8)'],['time','Time'],['place','Place'],['reply','How to RSVP']].map(([key,label])=><label key={key}>{label}<input value={party[key]} maxLength={42} onChange={e=>setParty(p=>({...p,[key]:e.target.value}))} /></label>)}</div><p className="en-small">This is a printable invitation. Replies go to the contact you write on it; they are not collected on this page.</p><label className="en-check"><input type="checkbox" checked={include} onChange={e=>setInclude(e.target.checked)} /> Include the checklist and game cards</label><div className="en-actions"><button data-print-main onClick={()=>setPrinting(true)}>Preview, print or save PDF</button><button onClick={save}>Save draft</button></div><p role="status">{saved}</p><p className="en-small">Drafts stay in this browser. Save a PDF to share the finished invitation.</p></section><div className="en-sheet-thumb"><PartySheet party={party} kind="invite" /></div></div><section><h2>A coloring table for your party</h2><div className="en-cards">{['cake','balloons','unicorn','dinosaur'].map(slug=>{const s=EN_COLORING.find(x=>x.slug===slug);return <Link className="en-card" to={s.path} key={slug}><img loading="lazy" width="400" height="400" src={coloringSrc(slug,1,'webp')} alt={`${s.name} coloring sheet`} /><h3>{s.name}</h3></Link>})}</div></section>{printing&&<PrintPreview lang="en" title="My birthday party kit" onClose={()=>setPrinting(false)}>{(include?['invite','checklist','games']:['invite']).map(kind=><article key={kind} className="buga-a4 en-print-sheet"><div className="print-art"><PartySheet party={party} kind={kind} /></div></article>)}</PrintPreview>}</div>
}

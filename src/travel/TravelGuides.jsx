import { Link } from 'react-router-dom'
import { TravelPage } from './TravelPage'
import { TRAVEL_GUIDES } from './guideData'
function GuideText({text}){return text.split(/(\[\[[^\]]+\]\])/g).map((part,i)=>{const m=part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/);return m?<Link key={i} to={'/travel/'+m[1]} className="underline font-bold">{m[2]}</Link>:part})}
function Guide({slug}){const g=TRAVEL_GUIDES[slug];return <TravelPage title={g.title} path={'/travel/guides/'+slug} intro={g.intro} faq={g.faq}><article className="travel-guide">{g.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p><GuideText text={text}/></p></section>)}<aside className="travel-card"><h2>מקורות ובדיקת המידע</h2><p>סעיפי הבריאות והבטיחות נבדקו מול המקורות הבאים ב־<time dateTime="2026-10-25">25.10.2026</time>. רעיונות הפעילות נכתבו לעוגה בוגה. לגבי מצב רפואי אישי, התייעצו עם רופא.</p><ul>{g.sources.map(([label,url])=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="underline">{label}</a></li>)}</ul></aside></article></TravelPage>}
export function ToddlerFlight(){return <Guide slug="toddler-flight"/>}
export function LongCarRide(){return <Guide slug="long-car-ride"/>}
export function CarryOnKids(){return <Guide slug="carry-on-for-kids"/>}
export function FlyingBaby(){return <Guide slug="flying-with-baby"/>}
export function CarSickness(){return <Guide slug="car-sickness"/>}

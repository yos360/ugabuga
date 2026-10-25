import { BEDTIME_STORIES, renderStory, storyMinutes } from '../data/bedtimeStories.js'
import recordedIndex from '../../public/audio/stories/index.json'
import hebrewIndex from '../../public/audio/he/index.json'
import { recordedPlaylist } from '../pages/stories/storyReading.js'
import { audioKey } from '../utils/audioKey.js'
const clips=new Set(hebrewIndex)
export const TRAVEL_STORIES=BEDTIME_STORIES.map(story=>{
 const text=renderStory(story),parts=[text.title+'.',...text.body,'לילה טוב.'],recorded=recordedPlaylist(story.slug,recordedIndex[story.slug],text.body.length)
 return {...story,text,minutes:storyMinutes(story),parts:parts.map((text,i)=>({text,src:recorded?.[i].src||(clips.has(audioKey(text))?`/audio/he/${audioKey(text)}.mp3`:null)}))}
})
export const selectedStories=()=>{try{const ids=JSON.parse(localStorage.getItem('buga-travel-stories')||'[]');return Array.isArray(ids)?TRAVEL_STORIES.filter(s=>ids.includes(s.slug)).map(s=>s.slug):[]}catch{return []}}
export function selectStory(ids){localStorage.setItem('buga-travel-stories',JSON.stringify(TRAVEL_STORIES.filter(s=>ids.includes(s.slug)).map(s=>s.slug)))}
export const storyAudio=ids=>[...new Set(TRAVEL_STORIES.filter(s=>ids.includes(s.slug)).flatMap(s=>s.parts.map(p=>p.src).filter(Boolean)))]
export function storyQueue(age,minutes,ids=null){const list=TRAVEL_STORIES.filter(s=>(age==='all'||s.age===age)&&(!ids||ids.includes(s.slug)));let duration=0;return list.filter(s=>{if(duration>=minutes)return false;duration+=s.minutes;return true})}

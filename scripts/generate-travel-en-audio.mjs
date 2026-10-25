// Optional offline build tool. Install @echogarden/espeak-ng-emscripten outside the app
// and set ESPEAK_MODULE_PATH to its espeak-ng.js file. No paid service or API is used.
import {writeFileSync,mkdirSync,readFileSync,rmSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {ENGLISH_TRAVEL_STORIES} from '../src/en/travel/storyData.js'
const {default:create}=await import(process.env.ESPEAK_MODULE_PATH||'@echogarden/espeak-ng-emscripten')
const module=await create(),voice=new module.eSpeakNGWorker();voice.set_voice('en-us');voice.rate=145;voice.pitch=48;voice.range=40
mkdirSync('public/audio/travel-en',{recursive:true});const index={}
for(const story of ENGLISH_TRAVEL_STORIES.filter(s=>!process.env.STORY_SLUG||s.slug===process.env.STORY_SLUG)){const chunks=[];voice.synthesize(story.title+'. '+story.body+' Good night, and have a peaceful journey.',data=>{if(data.length)chunks.push(Buffer.from(new Uint8Array(data.buffer,data.byteOffset,data.byteLength)));return false});const pcm=join(tmpdir(),'ugabuga-travel-'+story.slug+'.pcm'),target='public/audio/travel-en/'+story.slug+'.mp3';if(!chunks.length)throw new Error('No audio generated: '+story.slug);writeFileSync(pcm,Buffer.concat(chunks));execFileSync('ffmpeg',['-v','error','-y','-f','s16le','-ar',String(voice.samplerate),'-ac','1','-i',pcm,'-c:a','libmp3lame','-b:a','24k',target]);rmSync(pcm);index[story.slug]={bytes:readFileSync(target).length,voice:'Computer-generated English offline voice'};console.log(story.slug,index[story.slug].bytes)}
const completeIndex=Object.fromEntries(ENGLISH_TRAVEL_STORIES.map(s=>[s.slug,{bytes:readFileSync('public'+s.src).length,voice:'Computer-generated English offline voice'}]));if(Object.values(completeIndex).some(s=>s.bytes<1000))throw new Error('An audio file is empty');writeFileSync('public/audio/travel-en/index.json',JSON.stringify(completeIndex,null,2)+'\n')
writeFileSync('public/audio/travel-en/README.txt','English adaptations of the thirty Ugabuga stories already on main. Offline narration generated locally with eSpeak NG, using @echogarden/espeak-ng-emscripten 0.3.5, at no cost. The speech engine is not distributed with this site. These are computer-generated recordings, not a human narrator.\n')

// Separate public Realtime connection. No changes to the content database.
// Only fixed codes leave the browser: never names, form values or full URLs.
export const ACTIVITY_LABELS = Object.freeze({
  mandalas:'מנדלות',coloring:'דפי צביעה','hebrew-letters':'אותיות בעברית','photo-props':'אביזרי צילום',
  mazes:'מבוכים',sudoku:'סודוקו','birthday-signs':'שלטי יום הולדת','abc-letters':'אותיות באנגלית',
  numbers:'תרגול מספרים',certificates:'תעודות',symmetry:'ציור סימטרי','name-tags':'תגי שם',
  'thank-you':'כרטיסי תודה','board-game':'לוח משחק','roots-project':'עבודת שורשים',
  'birthday-newspaper':'עיתון יום הולדת','birthday-checklist':'תכנון יום הולדת',
  'eretz-ir':'ארץ עיר','bingo-maker':'בינגו','word-search-maker':'תפזורות','crossword-maker':'תשבצים',
  'escape-rooms':'חדרי בריחה','experiment-maker':'מעבדת BUGA','birthday-famous':'מי נולד ביום ההולדת',
  'trivia-quiz':'טריוויה',riddles:'חידות',dice:'קוביות','coin-flip':'הטלת מטבע',
  'countdown-timer':'טיימר',scoreboard:'לוח ניקוד','team-generator':'חלוקה לקבוצות',
  'random-picker':'הגרלה','truth-or-dare':'אמת או חובה','spin-the-bottle':'סובבו את הבקבוק',
  'drawing-prompt':'רעיונות לציור',joke:'בדיחות','scavenger-hunt-maker':'חפש את המטמון',
  'bring-list':'מי מביא מה','buga-town':'עיר BUGA','first-grade':'הכנה לכיתה א׳',
  'dot-to-dot':'חיבור נקודות','find-differences':'מצאו את ההבדלים','color-by-number':'צביעה לפי מספר',
  'word-tracing':'מילים מקווקוות','match-word':'התאמת תמונה למילה','complete-pattern':'המשך הרצף',
  'count-and-write':'ספירה וכתיבה','silhouette-match':'התאמת צלליות','cut-and-order':'גזירה וסידור',
  'hidden-object':'מציאת חפצים','mixed-activities':'דף פעילות משולב','missing-picture':'השלמת תמונה חסרה',
  game:'משחקים',worksheet:'דפי פעילות',tool:'כלי משחק',calculator:'מחשבון למסיבה',
  invitation:'הזמנות',greeting:'ברכות',printables:'דפים להדפסה',create:'יוצרים',classroom:'פעילויות לכיתה',birthday:'פעילויות ליום הולדת',
})
const ALIASES = {bingo:'bingo-maker','word-search':'word-search-maker','escape-room':'escape-rooms',quiz:'trivia-quiz',trivia:'trivia-quiz',timer:'countdown-timer',wheel:'random-picker','truth-or-buga':'truth-or-dare','scavenger-hunt':'scavenger-hunt-maker'}
export function activityForPath(path) {
  const parts = path.split('/').filter(Boolean), slug = parts.at(-1)
  if (['admin','account','auth','login'].includes(parts[0])) return null
  if (Object.hasOwn(ALIASES, slug)) return ALIASES[slug]
  if (Object.hasOwn(ACTIVITY_LABELS, slug)) return slug
  if (parts[0] === 'games') return 'game'
  if (parts[0] === 'printables') return 'worksheet'
  if (parts[0] === 'tools') return 'tool'
  return null
}
export const ACTION_LABELS=Object.freeze({open:'פתחו',print:'פתחו חלון הדפסה',create:'לחצו ליצירת פעילות',check:'לחצו לבדיקת תשובות',play:'לחצו להתחלת משחק',refresh:'ביקשו פעילות חדשה',download:'לחצו להורדה',use:'בחרו אפשרות'})
export function validActivity(payload) {
  return !!(payload && typeof payload.action==='string' && Object.hasOwn(ACTION_LABELS,payload.action) && typeof payload.category === 'string' && Object.hasOwn(ACTIVITY_LABELS,payload.category))
}
export function buttonAction(label){
  if(/הדפס|הדפיס/.test(label))return null // beforeprint is the reliable event, not a preview click.
  if(/בדק|בדיק/.test(label))return 'check'
  if(/התח|שחק/.test(label))return 'play'
  if(/הורד/.test(label))return 'download'
  if(/חדש|החליפ|הגרל|הגריל|סובב|הטל/.test(label))return 'refresh'
  if(/צרו|יציר|בנו/.test(label))return 'create'
  return 'use'
}
export function recentPresence(state,ownId,now=Date.now()){
  return Object.entries(state).flatMap(([key,entries])=>{
    const valid=entries.map(x=>x.activity).filter(x=>validActivity(x)&&Number.isFinite(x.at)&&x.at<=now+5000&&now-x.at<120000).sort((a,b)=>b.at-a.at)
    return valid.length?[{...valid[0],key,own:key===ownId}]:[]
  }).sort((a,b)=>b.at-a.at).slice(0,3)
}
export function presenceCount(state) { return Object.values(state).filter(entries => Array.isArray(entries) && entries.length > 0).length }
let connection = null, queued = null
const sent = new Map()
export function recordActivity(action,category) {
  const payload = {action,category}
  if (!validActivity(payload)) return
  if (!connection) { queued = payload; return }
  const key = `${action}:${category}`
  if (Date.now() - (sent.get(key) || 0) < 15000 || Date.now()-(sent.get('*')||0)<2000) return
  sent.set(key,Date.now())
  sent.set('*',Date.now())
  void connection.track({online:true,activity:{...payload,at:Date.now()}}).catch(() => {})
}
async function browserKey() {
  const read = () => {
    const key = 'buga-live-browser', previous = JSON.parse(localStorage.getItem(key) || 'null')
    if (previous && typeof previous.id === 'string' && previous.expires > Date.now()) return previous.id
    const id = crypto.randomUUID()
    localStorage.setItem(key,JSON.stringify({id,expires:Date.now()+86400000}))
    return id
  }
  try { return navigator.locks ? await navigator.locks.request('buga-live-browser', read) : read() }
  catch { return crypto.randomUUID() }
}
export function connectActivity(onChange) {
  let stopped=false,client,channel,expiry,ownId
  const state={count:null,events:[]}
  const publish=()=>{if(!stopped)onChange({...state})}
  const sync=()=>{if(!channel||!connection)return;const presence=channel.presenceState();state.count=presenceCount(presence);state.events=recentPresence(presence,ownId);publish()}
  async function start(){
    try {
      const [{createClient},id]=await Promise.all([import('@supabase/supabase-js'),browserKey()])
      if(stopped)return
      ownId=id
      client=createClient('https://efhgyispuwxcplvzipcy.supabase.co','sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
      const production=['ugabuga.co.il','www.ugabuga.co.il'].includes(location.hostname)
      channel=client.channel(production?'buga-public-live-v1':'buga-preview-live-v1',{config:{presence:{key:id},broadcast:{self:false,ack:true}}})
      channel.on('presence',{event:'sync'},sync).subscribe(async status=>{
          if(stopped)return
          if(status==='SUBSCRIBED'){
            connection=channel
            await channel.track({online:true}).catch(()=>{})
            if(queued){const pending=queued;queued=null;recordActivity(pending.action,pending.category)}
          } else {
            if(connection===channel)connection=null
            state.count=null;state.events=[];publish()
          }
        })
    } catch {state.count=null;publish()}
  }
  const onPrint=()=>recordActivity('print',activityForPath(location.pathname))
  const onClick=event=>{
    const button=event.target instanceof Element?event.target.closest('button'):null
    if(!event.isTrusted||!button||button.disabled||!button.closest('main')||button.closest('form'))return
    const action=buttonAction(button.textContent||'')
    if(action)recordActivity(action,activityForPath(location.pathname))
  }
  window.addEventListener('beforeprint',onPrint)
  document.addEventListener('click',onClick)
  expiry=setInterval(sync,15000)
  void start()
  return ()=>{stopped=true;clearInterval(expiry);window.removeEventListener('beforeprint',onPrint);document.removeEventListener('click',onClick);if(connection===channel)connection=null;if(client&&channel)void client.removeChannel(channel).catch(()=>{})}
}

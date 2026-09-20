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
export function validActivity(payload) {
  return !!(payload && ['open','print'].includes(payload.action) && typeof payload.category === 'string' && Object.hasOwn(ACTIVITY_LABELS,payload.category))
}
export function presenceCount(state) { return Object.values(state).filter(entries => Array.isArray(entries) && entries.length > 0).length }
let connection = null, queued = null
const sent = new Map()
export function recordActivity(action,category) {
  const payload = {action,category}
  if (!validActivity(payload)) return
  if (!connection) { queued = payload; return }
  const key = `${action}:${category}`
  if (Date.now() - (sent.get(key) || 0) < 60000) return
  sent.set(key,Date.now())
  void connection.send({type:'broadcast',event:'activity',payload}).catch(() => {})
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
  let stopped=false,client,channel,expiry
  const state={count:null,event:null}
  const publish=()=>{if(!stopped)onChange({...state})}
  async function start(){
    try {
      const [{createClient},id]=await Promise.all([import('@supabase/supabase-js'),browserKey()])
      if(stopped)return
      client=createClient('https://efhgyispuwxcplvzipcy.supabase.co','sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
      const production=['ugabuga.co.il','www.ugabuga.co.il'].includes(location.hostname)
      channel=client.channel(production?'buga-public-live-v1':'buga-preview-live-v1',{config:{presence:{key:id},broadcast:{self:false,ack:true}}})
      channel.on('presence',{event:'sync'},()=>{state.count=presenceCount(channel.presenceState());publish()})
        .on('broadcast',{event:'activity'},({payload})=>{
          if(!validActivity(payload))return
          state.event=payload.action==='print'?`🖨️ נפתח חלון הדפסה: ${ACTIVITY_LABELS[payload.category]}`:`✨ מישהו פתח עכשיו: ${ACTIVITY_LABELS[payload.category]}`
          publish();clearTimeout(expiry);expiry=setTimeout(()=>{state.event=null;publish()},20000)
        }).subscribe(async status=>{
          if(stopped)return
          if(status==='SUBSCRIBED'){
            connection=channel
            await channel.track({online:true})
            if(queued){const pending=queued;queued=null;recordActivity(pending.action,pending.category)}
          } else {
            if(connection===channel)connection=null
            state.count=null;state.event=null;publish()
          }
        })
    } catch {state.count=null;publish()}
  }
  const onPrint=()=>recordActivity('print',activityForPath(location.pathname))
  window.addEventListener('beforeprint',onPrint)
  void start()
  return ()=>{stopped=true;clearTimeout(expiry);window.removeEventListener('beforeprint',onPrint);if(connection===channel)connection=null;if(client&&channel)void client.removeChannel(channel).catch(()=>{})}
}

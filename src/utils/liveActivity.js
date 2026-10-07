// Separate public Realtime connection. No changes to the content database.
// Only fixed codes leave the browser: never names, form values or full URLs.
export const ACTIVITY_LABELS = Object.freeze({
  mandalas:'מנדלות',coloring:'דפי צביעה','hebrew-letters':'אותיות בעברית','photo-props':'אביזרי צילום',
  mazes:'מבוכים',sudoku:'סודוקו','birthday-signs':'שלטי יום הולדת','abc-letters':'אותיות באנגלית',
  numbers:'תרגול מספרים',certificates:'תעודות',symmetry:'ציור סימטרי','name-tags':'תגי שם',
  'thank-you':'כרטיסי תודה','board-game':'לוח משחק','roots-project':'עבודת שורשים',
  'birthday-newspaper':'עיתון יום הולדת','birthday-checklist':'תכנון יום הולדת',
  'eretz-ir':'ארץ עיר','bingo-maker':'בינגו','word-search-maker':'תפזורות','crossword-maker':'תשבצים',
  'escape-rooms':'חדרי בריחה','experiment-maker':'מחולל ניסויים','birthday-famous':'מי נולד ביום שלי?',
  'trivia-quiz':'טריוויה',riddles:'חידות',dice:'קוביות','coin-flip':'הטלת מטבע',
  'countdown-timer':'טיימר',scoreboard:'לוח ניקוד','team-generator':'חלוקה לקבוצות',
  'random-picker':'הגרלה','truth-or-dare':'אמת או חובה','spin-the-bottle':'סובבו את הבקבוק',
  'drawing-prompt':'רעיונות לציור',joke:'בדיחות','scavenger-hunt-maker':'חפש את המטמון',
  'bring-list':'מי מביא מה','buga-town':'עיר BUGA','first-grade':'הכנה לכיתה א׳','quiz':'מבחן אמריקאי',
  'dot-to-dot':'חיבור נקודות','find-differences':'מצאו את ההבדלים','color-by-number':'צביעה לפי מספר',
  'word-tracing':'מילים מקווקוות','match-word':'התאמת תמונה למילה','complete-pattern':'המשך הרצף',
  'count-and-write':'ספירה וכתיבה','silhouette-match':'התאמת צלליות','cut-and-order':'גזירה וסידור',
  'hidden-object':'מציאת חפצים','mixed-activities':'דף פעילות משולב','missing-picture':'השלמת תמונה חסרה',
  game:'משחקים',worksheet:'דפי פעילות',tool:'כלי משחק',calculator:'מחשבון למסיבה',
  invitation:'הזמנות',greeting:'ברכות',printables:'דפים להדפסה',create:'יוצרים',classroom:'פעילויות לכיתה',birthday:'פעילויות ליום הולדת',
  suppliers:'ספקים','emoji-studio':'אימוג׳י סטודיו',page:'עמודים באתר',
  'online-games':'משחקי אונליין','flying-cubes':'קוביות מעופפות','ball-sort':'מיון כדורים','merge-2048':'מכפילים עד 2048','block-puzzle':'מסיבת בלוקים','traffic-jam':'פקק תנועה',solitaire:'סוליטר',battleship:'צוללות',marathon:'מרתון משחקים','falling-blocks':'בלוקים נופלים','whack-a-mole':'הכה בחפרפרת','sliding-puzzle':'פאזל הזזה','word-guess':'נחשו את המילה',today:'אתגר היום','spider-solitaire':'סוליטר עכביש',minesweeper:'שולה מוקשים',memory:'משחק הזיכרון',snake:'נחש',
})
const ALIASES = {bingo:'bingo-maker','word-search':'word-search-maker','escape-room':'escape-rooms',quiz:'trivia-quiz',trivia:'trivia-quiz',timer:'countdown-timer',wheel:'random-picker','truth-or-buga':'truth-or-dare','scavenger-hunt':'scavenger-hunt-maker'}
export function activityForPath(path) {
  const parts = path.split('/').filter(Boolean), slug = parts.at(-1)
  if (['admin','account','auth','login','q'].includes(parts[0])) return null
  if (Object.hasOwn(ALIASES, slug)) return ALIASES[slug]
  if (Object.hasOwn(ACTIVITY_LABELS, slug)) return slug
  if (parts[0] === 'games') return 'game'
  if (parts[0] === 'online-games') return 'online-games'
  if (parts[0] === 'printables') return 'worksheet'
  if (parts[0] === 'tools') return 'tool'
  return null
}
export const ACTION_LABELS=Object.freeze({open:'פתחו',preview:'פתחו תצוגת הדפסה',print:'פתחו חלון הדפסה',create:'לחצו ליצירת פעילות',check:'לחצו לבדיקת תשובות',play:'לחצו להתחלת משחק',refresh:'ביקשו פעילות חדשה',download:'לחצו להורדה',use:'בחרו אפשרות',share:'שיתפו'})
export function validActivity(payload) {
  return !!(payload && typeof payload.action==='string' && Object.hasOwn(ACTION_LABELS,payload.action) && typeof payload.category === 'string' && Object.hasOwn(ACTIVITY_LABELS,payload.category))
}
export function buttonAction(label){
  if(/הדפס|הדפיס/.test(label))return null // beforeprint is the reliable event, not a preview click.
  if(/שתפ|שיתוף|וואטסאפ|whatsapp/i.test(label))return 'share'
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

// ---- Private owner analytics (see /admin/activity) ----
// Every page view and meaningful click is stored with: the page path (which game /
// printable / tool), device type, traffic source, and an anonymous id that the
// browser itself rotates every 24h (counts unique daily visitors, identifies no one).
// Never names, typed text, IP addresses or query strings. Best-effort only.
let dbQueue = [], visitorPromise = null
const logged = new Map()
function cleanPath(path) {
  const p = String(path || '').toLowerCase().split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  return /^\/[a-z0-9/_-]{0,119}$/.test(p) ? p : null
}
function deviceType() {
  try { return matchMedia('(pointer: coarse)').matches || innerWidth < 768 ? 'mobile' : 'desktop' } catch { return null }
}
export function classifySource(referrer, utm, host) {
  let ref = ''
  try { ref = referrer ? new URL(referrer).hostname.replace(/^www\./, '') : '' } catch { ref = '' }
  if (ref && host && ref === host.replace(/^www\./, '')) return 'internal'
  if (String(utm || '').toLowerCase() === 'qr') return 'qr'
  const t = `${String(utm || '').toLowerCase()} ${ref}`
  if (!t.trim()) return 'direct'
  if (/mail\.|gmail|outlook|newsletter|email/.test(t)) return 'email'
  if (/whatsapp|wa\.me/.test(t)) return 'whatsapp'
  if (/facebook|fb\.|^fb\b/.test(t)) return 'facebook'
  if (/instagram/.test(t)) return 'instagram'
  if (/tiktok/.test(t)) return 'tiktok'
  if (/youtube|youtu\.be/.test(t)) return 'youtube'
  if (/google/.test(t)) return 'google'
  if (/bing/.test(t)) return 'bing'
  return 'other'
}
function trafficSource() {
  // Where this visit came from, decided once at landing and kept for the tab.
  try {
    const saved = sessionStorage.getItem('buga-src')
    if (saved) return saved
    const q = new URLSearchParams(location.search)
    const src = classifySource(document.referrer, q.get('utm_source') || (q.has('wa') ? 'whatsapp' : null), location.hostname)
    sessionStorage.setItem('buga-src', src)
    return src
  } catch { return null }
}
function isOwnerBrowser() {
  // The owner's own browsing is left out of the stats (unless explicitly opted in).
  try { return !!localStorage.getItem('ugabuga-owner-auth') && localStorage.getItem('buga-track-self') !== '1' } catch { return false }
}
const V2_ACTIONS = ['open','print','play','check','download','refresh','create','use','share']
let hasV3 = true
// Plain fetch with keepalive (not the Supabase SDK): a share opens WhatsApp and a print opens
// the print dialog, and on phones the page can be put to sleep right away — keepalive lets the
// request finish anyway. It also means events don't wait for the SDK to load.
function rpc(fn, body) {
  return fetch(`${PARTY_URL}/rest/v1/rpc/${fn}`, { method: 'POST', keepalive: true, headers: { apikey: PARTY_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}
function sendOne(args) {
  const v2 = () => { if (V2_ACTIONS.includes(args.p_action)) { const { p_seconds, ...rest } = args; void p_seconds; return rpc('record_site_event_v2', rest) } }
  if (!hasV3) return void Promise.resolve(v2()).catch(() => {})
  void rpc('record_site_event_v3', args).then(res => {
    // Until the v3 migration runs, fall back so nothing is lost.
    if (res.status === 404) { hasV3 = false; return v2() }
  }).catch(() => {})
}
// ---- Human check ----
// Crawlers and automated browsers run the page's JavaScript too, and used to show up as
// hundreds of "direct" visitors who stay 5 seconds and touch nothing. The owner log now
// waits for a human sign — real input (mouse move, touch, key, wheel) or 15 seconds of
// the tab being visible — and automated browsers are never counted. Events wait in the
// queue until then; a visit with no human sign is simply never sent.
// Link-preview fetchers (WhatsApp, Telegram, Facebook) don't run JavaScript, so they never get here;
// their names are NOT listed — a person opening a link inside WhatsApp's own browser must count.
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|embedly|python|curl|wget|phantom|puppeteer|playwright|selenium/i
let human = false, visibleSecs = 0
function automated() {
  try { return navigator.webdriver === true || BOT_UA.test(navigator.userAgent || '') } catch { return false }
}
function markHuman() {
  if (human || automated()) return
  human = true
  flushDb()
}
function flushDb() {
  if (!human) return
  const items = dbQueue; dbQueue = []
  for (const args of items) sendOne(args)
}
function excluded(pathname) {
  const parts = String(pathname).split('/').filter(Boolean)
  return ['admin','account','auth','login','q'].includes(parts[0]) || isOwnerBrowser()
}
export function logEvent(action, pathname = location.pathname) {
  if (!Object.hasOwn(ACTION_LABELS, action)) return
  if (excluded(pathname)) return
  const path = cleanPath(pathname)
  const key = `${action}:${path}`
  if (Date.now() - (logged.get(key) || 0) < 3000) return // ignore double clicks
  logged.set(key, Date.now())
  const category = activityForPath(path || '/') || 'page'
  visitorPromise ||= browserKey().catch(() => null)
  void visitorPromise.then(visitor => {
    dbQueue.push({ p_category: category, p_action: action, p_path: path, p_device: deviceType(), p_source: trafficSource(), p_visitor: visitor, p_seconds: null })
    if (dbQueue.length > 30) dbQueue = dbQueue.slice(-30)
    flushDb()
  })
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

// ---- Time on page ----
// Counts only time the tab is visible AND the visitor did something in the last
// 2 minutes (a tab left open overnight doesn't count). Sent when leaving the page,
// hiding the tab or closing it — with keepalive so it survives the page closing.
const PARTY_URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co', PARTY_KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
let timePath = null, timeSecs = 0, lastInput = Date.now(), visitorId = null
const TICK = 5
function sendTime(path, seconds) {
  const args = { p_category: activityForPath(path) || 'page', p_action: 'time', p_path: path, p_device: deviceType(), p_source: trafficSource(), p_visitor: visitorId, p_seconds: Math.round(seconds) }
  if (!hasV3 || !human) return
  try {
    void fetch(`${PARTY_URL}/rest/v1/rpc/record_site_event_v3`, { method: 'POST', keepalive: true, headers: { apikey: PARTY_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args) }).catch(() => {})
  } catch { /* ignore */ }
}
function flushTime() {
  if (timePath && timeSecs >= 5) sendTime(timePath, timeSecs)
  timeSecs = 0
}
export function trackTime(pathname) {
  flushTime()
  timePath = excluded(pathname) ? null : cleanPath(pathname)
  lastInput = Date.now()
  visitorPromise ||= browserKey().catch(() => null)
  void visitorPromise.then(v => { visitorId = v })
}
function startTimeTracking() {
  // scroll counts as activity but not as a human sign (scripts scroll pages too)
  const onInput = e => { if (e.isTrusted === false) return; lastInput = Date.now(); if (e.type !== 'scroll') markHuman() }
  const tick = () => {
    if (document.visibilityState !== 'visible') return
    visibleSecs += TICK
    if (visibleSecs >= 15) markHuman()
    if (human && timePath && Date.now() - lastInput < 120000) timeSecs += TICK
  }
  const onHide = () => { if (document.visibilityState === 'hidden') flushTime() }
  // Someone who reached the page by scanning a printed QR code is a person holding paper —
  // count the scan right away, even if they leave before touching the screen.
  try { if (trafficSource() === 'qr') markHuman() } catch { /* ignore */ }
  const iv = setInterval(tick, TICK * 1000)
  const opts = { passive: true, capture: true }
  for (const ev of ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel', 'input']) window.addEventListener(ev, onInput, opts)
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', flushTime)
  return () => {
    flushTime(); clearInterval(iv)
    for (const ev of ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel', 'input']) window.removeEventListener(ev, onInput, opts)
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', flushTime)
  }
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
      client=createClient(PARTY_URL,PARTY_KEY,{auth:{storageKey:'ugabuga-public-presence',persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
      flushDb()
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
  const onPrint=()=>{recordActivity('print',activityForPath(location.pathname));logEvent('print')}
  const onClick=event=>{
    const button=event.target instanceof Element?event.target.closest('button'):null
    if(!event.isTrusted||!button||button.disabled||!button.closest('main')||button.closest('form'))return
    const action=buttonAction(button.textContent||'')
    if(action){recordActivity(action,activityForPath(location.pathname));logEvent(action)}
  }
  window.addEventListener('beforeprint',onPrint)
  document.addEventListener('click',onClick)
  expiry=setInterval(sync,15000)
  const stopTime=startTimeTracking()
  void start()
  return ()=>{stopped=true;stopTime();clearInterval(expiry);window.removeEventListener('beforeprint',onPrint);document.removeEventListener('click',onClick);if(connection===channel)connection=null;if(client&&channel)void client.removeChannel(channel).catch(()=>{})}
}

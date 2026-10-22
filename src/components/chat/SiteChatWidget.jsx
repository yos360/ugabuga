import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './site-chat.css'

// The Supabase client is heavy, so it is loaded only when the chat is opened
// or when this browser already has a saved conversation.
let dbPromise = null
const loadDb = () => {
  dbPromise ||= import('../../utils/siteChatDb').catch(error => { dbPromise = null; throw error })
  return dbPromise
}
const errorInfo = async error => {
  try { return { code: error?.code, text: (await loadDb()).siteChatErrorText(error?.code) } }
  catch { return { code: 'network', text: 'לא הצלחנו לטעון את הצ׳אט. נסו שוב בעוד רגע.' } }
}

const TOKEN_KEY = 'ugabuga-site-chat-token'
const SEEN_KEY = 'ugabuga-site-chat-seen'
const TOPICS = ['משהו ייחודי בשבילי', 'רעיון שכדאי להוסיף', 'עזרה באתר', 'משהו אחר']
const MINI_KEY = 'buga-chat-mini'
const storedMini = () => { try { return localStorage.getItem(MINI_KEY) === '1' } catch { return false } }
const storedToken = () => { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } }
const rememberToken = token => { try { localStorage.setItem(TOKEN_KEY, token) } catch { /* private mode */ } }
const forgetToken = () => { try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(SEEN_KEY) } catch { /* private mode */ } }
const seenAt = () => { try { return Number(localStorage.getItem(SEEN_KEY)) || 0 } catch { return 0 } }
const rememberSeen = time => { try { localStorage.setItem(SEEN_KEY, String(time)) } catch { /* private mode */ } }
const latestOwnerTime = thread => (thread?.messages || []).reduce((latest, message) => message.sender === 'owner' ? Math.max(latest, Date.parse(message.created_at) || 0) : latest, 0)

export default function SiteChatWidget() {
  const [open, setOpen] = useState(false)
  const [mini, setMini] = useState(storedMini)
  const [token, setToken] = useState(storedToken)
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [unavailable, setUnavailable] = useState(false)
  const [seen, setSeen] = useState(seenAt)
  const [topic, setTopic] = useState(TOPICS[0])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [body, setBody] = useState('')
  const [reply, setReply] = useState('')
  const lastOwnerCount = useRef(0)
  const probed = useRef(false)

  const fail = useCallback(async e => {
    const info = await errorInfo(e)
    if (info.code === 'chat_unavailable') setUnavailable(true)
    setError(info.text)
  }, [])

  const load = useCallback(async quiet => {
    if (!token) return
    if (!quiet) setLoading(true)
    try {
      const data = await (await loadDb()).siteChatDb.get(token)
      const count = (data?.messages || []).filter(message => message.sender === 'owner').length
      if (count > lastOwnerCount.current && lastOwnerCount.current > 0) setOpen(true)
      lastOwnerCount.current = count
      setThread(data); setError('')
    } catch (e) {
      if (e.code === 'chat_not_found') { forgetToken(); setToken(''); setThread(null) }
      else if (e.code === 'chat_unavailable') void fail(e)
      else if (!quiet) void fail(e)
    } finally { if (!quiet) setLoading(false) }
  }, [token, fail])

  useEffect(() => { void load(false) }, [load])
  // Poll only while there is an active (not closed) conversation and the tab is visible
  const active = Boolean(token && thread && thread.status !== 'closed' && !unavailable)
  useEffect(() => {
    if (!active) return undefined
    const tick = () => { if (!document.hidden) void load(true) }
    const id = setInterval(tick, open ? 5000 : 20000)
    const onVisible = () => { if (!document.hidden) void load(true) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [active, open, load])
  // Without a saved conversation, check once (on first open) that the chat is set up on the server
  useEffect(() => {
    if (!open || token || probed.current) return
    probed.current = true
    loadDb().then(db => db.siteChatDb.get('00000000-0000-0000-0000-000000000000')).catch(e => { if (e?.code === 'chat_unavailable') void fail(e) })
  }, [open, token, fail])
  useEffect(() => {
    const show = event => {
      setOpen(true)
      if (event.detail?.topic) setTopic(event.detail.topic)
      if (event.detail?.message) { setBody(event.detail.message); setReply(event.detail.message) }
    }
    window.addEventListener('buga-chat-open', show)
    return () => window.removeEventListener('buga-chat-open', show)
  }, [])
  // Focus only when the panel opens, not on every refresh (avoids popping the mobile keyboard)
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => document.querySelector('.site-chat-panel textarea')?.focus())
  }, [open])
  const latestOwner = latestOwnerTime(thread)
  // While the panel is open every owner reply counts as seen; the state is synced when it closes
  useEffect(() => { if (open && latestOwner > seenAt()) rememberSeen(latestOwner) }, [open, latestOwner])
  const closePanel = () => { setSeen(value => Math.max(value, latestOwner)); setOpen(false) }

  const start = async event => {
    event.preventDefault()
    if (body.trim().length < 2) { setError('כתבו לנו מה תרצו לפני השליחה.'); return }
    setSending(true); setError('')
    try {
      const nextToken = (await loadDb()).newSiteChatToken()
      const data = await (await loadDb()).siteChatDb.start({ token: nextToken, name: name.trim(), contact: contact.trim(), topic, body: body.trim() })
      rememberToken(nextToken); setToken(nextToken); setThread(data); setBody('')
    } catch (e) { await fail(e) }
    finally { setSending(false) }
  }
  const send = async event => {
    event.preventDefault()
    const text = reply.trim()
    if (text.length < 1) return
    setSending(true); setError('')
    try { const data = await (await loadDb()).siteChatDb.send(token, text); setThread(data); setReply('') }
    catch (e) { await fail(e) }
    finally { setSending(false) }
  }
  const restart = () => { forgetToken(); setToken(''); setThread(null); setBody(''); setReply(''); setError('') }
  const unread = !open && latestOwner > seen

  const hideLabel = () => { setMini(true); try { localStorage.setItem(MINI_KEY, '1') } catch { /* private mode */ } }
  return <div className="site-chat no-print no-present" dir="rtl">
    {open && <section className="site-chat-panel" role="dialog" aria-label="שיחה עם עוגה בוגה">
      <header><div><span>💬</span><div><b>מדברים עם עוגה בוגה</b><small>רעיונות, בקשות ועזרה — הכול מתקבל בשמחה</small></div></div><button onClick={closePanel} aria-label="סגירת הצ׳אט">×</button></header>
      {unavailable ? <div className="site-chat-closed" role="status"><p>הצ׳אט עוד לא הופעל. נחזור לכאן בקרוב 💜</p></div> : loading ? <div className="site-chat-loading" role="status">טוענים את השיחה…</div> : thread ? <>
        <div className="site-chat-messages">
          <div className="site-chat-welcome">היי {thread.name || ''} 👋 ההודעה הגיעה אלינו. אפשר להמשיך לכתוב כאן ולחזור לשיחה מאותו דפדפן.</div>
          {(thread.messages || []).map(message => <div className={`site-chat-message ${message.sender}`} key={message.id}><small>{message.sender === 'owner' ? 'עוגה בוגה' : 'אתם'}</small><p>{message.body}</p><time>{new Date(message.created_at).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>)}
        </div>
        {thread.status === 'closed' ? <div className="site-chat-closed"><p>השיחה הסתיימה. תודה שכתבתם לנו 💜</p><button onClick={restart}>פתיחת שיחה חדשה</button></div> : <form className="site-chat-reply" onSubmit={send}><textarea value={reply} onChange={event => setReply(event.target.value)} placeholder="כתבו הודעה…" maxLength={1500} rows={2} /><button disabled={sending || !reply.trim()}>{sending ? '…' : 'שליחה'}</button></form>}
      </> : <form className="site-chat-start" onSubmit={start}>
        <div className="site-chat-intro"><span>✨</span><b>מה הייתם רוצים לראות בעוגה בוגה?</b><p>אפשר לבקש משהו ייחודי, להציע רעיון חדש או לספר איפה הסתבכתם.</p></div>
        <fieldset><legend>על מה נדבר?</legend><div>{TOPICS.map(item => <button type="button" key={item} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}</div></fieldset>
        <label>איך לפנות אליכם? <small>(לא חובה)</small><input value={name} onChange={event => setName(event.target.value)} maxLength={60} placeholder="שם פרטי" /></label>
        <label>מייל או טלפון לחזרה <small>(לא חובה)</small><input value={contact} onChange={event => setContact(event.target.value)} maxLength={160} placeholder="רק אם תרצו תשובה גם מחוץ לאתר" /><small style={{ display: 'block', marginTop: 4 }}>ילדים — בקשו מהורה למלא פרטי קשר</small></label>
        <label>ההודעה שלכם<textarea value={body} onChange={event => setBody(event.target.value)} maxLength={1500} rows={4} placeholder="ספרו לנו מה חסר או מה הייתם רוצים שנכין…" /></label>
        <p className="site-chat-privacy">ההודעה נשמרת כדי שנוכל לענות. לא מציגים אותה לאחרים ולא מצרפים לרשימת תפוצה. <Link to="/privacy">פרטיות</Link></p>
        <button className="site-chat-send" disabled={sending}>{sending ? 'שולחים…' : 'שליחה לעוגה בוגה 💜'}</button>
      </form>}
      {error && !unavailable && <p className="site-chat-error" role="alert">{error}</p>}
    </section>}
    {!open && !mini && <button type="button" className="site-chat-hide" onClick={hideLabel} aria-label="להקטין את כפתור הצ׳אט לתמיד">×</button>}
    <button className={`site-chat-launcher${mini && !open ? ' is-mini' : ''}`} onClick={() => open ? closePanel() : setOpen(true)} aria-expanded={open} aria-label={open ? 'סגירת הצ׳אט' : 'יש לכם רעיון? דברו עם בוגה'}><span>{open ? '×' : '💬'}</span><b>{open ? 'סגירה' : 'יש לכם רעיון? דברו עם בוגה'}</b>{unread && <i aria-label="התקבלה תשובה" />}</button>
  </div>
}

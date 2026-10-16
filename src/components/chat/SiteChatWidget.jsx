import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { newSiteChatToken, siteChatDb, siteChatErrorText } from '../../utils/siteChatDb'
import './site-chat.css'

const TOKEN_KEY = 'ugabuga-site-chat-token'
const TOPICS = ['משהו ייחודי בשבילי', 'רעיון שכדאי להוסיף', 'עזרה באתר', 'משהו אחר']
const storedToken = () => { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } }
const rememberToken = token => { try { localStorage.setItem(TOKEN_KEY, token) } catch { /* private mode */ } }
const forgetToken = () => { try { localStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ } }

export default function SiteChatWidget() {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState(storedToken)
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [body, setBody] = useState('')
  const [reply, setReply] = useState('')
  const lastOwnerCount = useRef(0)

  const load = useCallback(async quiet => {
    if (!token) return
    if (!quiet) setLoading(true)
    try {
      const data = await siteChatDb.get(token)
      const count = (data?.messages || []).filter(message => message.sender === 'owner').length
      if (count > lastOwnerCount.current && lastOwnerCount.current > 0) setOpen(true)
      lastOwnerCount.current = count
      setThread(data); setError('')
    } catch (e) {
      if (e.code === 'chat_not_found') { forgetToken(); setToken(''); setThread(null) }
      else if (!quiet) setError(siteChatErrorText(e.code))
    } finally { if (!quiet) setLoading(false) }
  }, [token])

  useEffect(() => { void load(false) }, [load])
  useEffect(() => {
    if (!token) return undefined
    const id = setInterval(() => void load(true), open ? 5000 : 20000)
    return () => clearInterval(id)
  }, [token, open, load])
  useEffect(() => {
    const show = event => {
      setOpen(true)
      if (event.detail?.topic) setTopic(event.detail.topic)
      if (event.detail?.message) { setBody(event.detail.message); setReply(event.detail.message) }
    }
    window.addEventListener('buga-chat-open', show)
    return () => window.removeEventListener('buga-chat-open', show)
  }, [])
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => document.querySelector('.site-chat-panel textarea')?.focus())
  }, [open, thread])

  const start = async event => {
    event.preventDefault()
    if (body.trim().length < 2) { setError('כתבו לנו מה תרצו לפני השליחה.'); return }
    const nextToken = newSiteChatToken()
    setSending(true); setError('')
    try {
      const data = await siteChatDb.start({ token: nextToken, name: name.trim(), contact: contact.trim(), topic, body: body.trim() })
      rememberToken(nextToken); setToken(nextToken); setThread(data); setBody('')
    } catch (e) { setError(siteChatErrorText(e.code)) }
    finally { setSending(false) }
  }
  const send = async event => {
    event.preventDefault()
    const text = reply.trim()
    if (text.length < 1) return
    setSending(true); setError('')
    try { const data = await siteChatDb.send(token, text); setThread(data); setReply('') }
    catch (e) { setError(siteChatErrorText(e.code)) }
    finally { setSending(false) }
  }
  const restart = () => { forgetToken(); setToken(''); setThread(null); setBody(''); setReply(''); setError('') }
  const unread = !open && thread?.messages?.some(message => message.sender === 'owner')

  return <div className="site-chat no-print no-present" dir="rtl">
    {open && <section className="site-chat-panel" role="dialog" aria-label="שיחה עם עוגה בוגה">
      <header><div><span>💬</span><div><b>מדברים עם עוגה בוגה</b><small>רעיונות, בקשות ועזרה — הכול מתקבל בשמחה</small></div></div><button onClick={() => setOpen(false)} aria-label="סגירת הצ׳אט">×</button></header>
      {loading ? <div className="site-chat-loading" role="status">טוענים את השיחה…</div> : thread ? <>
        <div className="site-chat-messages">
          <div className="site-chat-welcome">היי {thread.name || ''} 👋 ההודעה הגיעה אלינו. אפשר להמשיך לכתוב כאן ולחזור לשיחה מאותו דפדפן.</div>
          {(thread.messages || []).map(message => <div className={`site-chat-message ${message.sender}`} key={message.id}><small>{message.sender === 'owner' ? 'עוגה בוגה' : 'אתם'}</small><p>{message.body}</p><time>{new Date(message.created_at).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>)}
        </div>
        {thread.status === 'closed' ? <div className="site-chat-closed"><p>השיחה הסתיימה. תודה שכתבתם לנו 💜</p><button onClick={restart}>פתיחת שיחה חדשה</button></div> : <form className="site-chat-reply" onSubmit={send}><textarea value={reply} onChange={event => setReply(event.target.value)} placeholder="כתבו הודעה…" maxLength={1500} rows={2} /><button disabled={sending || !reply.trim()}>{sending ? '…' : 'שליחה'}</button></form>}
      </> : <form className="site-chat-start" onSubmit={start}>
        <div className="site-chat-intro"><span>✨</span><b>מה הייתם רוצים לראות בעוגה בוגה?</b><p>אפשר לבקש משהו ייחודי, להציע רעיון חדש או לספר איפה הסתבכתם.</p></div>
        <fieldset><legend>על מה נדבר?</legend><div>{TOPICS.map(item => <button type="button" key={item} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}</div></fieldset>
        <label>איך לפנות אליכם? <small>(לא חובה)</small><input value={name} onChange={event => setName(event.target.value)} maxLength={60} placeholder="שם פרטי" /></label>
        <label>מייל או טלפון לחזרה <small>(לא חובה)</small><input value={contact} onChange={event => setContact(event.target.value)} maxLength={160} placeholder="רק אם תרצו תשובה גם מחוץ לאתר" /></label>
        <label>ההודעה שלכם<textarea value={body} onChange={event => setBody(event.target.value)} maxLength={1500} rows={4} placeholder="ספרו לנו מה חסר או מה הייתם רוצים שנכין…" /></label>
        <p className="site-chat-privacy">ההודעה נשמרת כדי שנוכל לענות. לא מציגים אותה לאחרים ולא מצרפים לרשימת תפוצה. <Link to="/privacy">פרטיות</Link></p>
        <button className="site-chat-send" disabled={sending}>{sending ? 'שולחים…' : 'שליחה לעוגה בוגה 💜'}</button>
      </form>}
      {error && <p className="site-chat-error" role="alert">{error}</p>}
    </section>}
    <button className="site-chat-launcher" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? 'סגירת הצ׳אט' : 'פתיחת צ׳אט עם עוגה בוגה'}><span>{open ? '×' : '💬'}</span><b>{open ? 'סגירה' : 'יש לכם רעיון?'}</b>{unread && <i aria-label="התקבלה תשובה" />}</button>
  </div>
}

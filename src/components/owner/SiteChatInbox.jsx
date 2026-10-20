import { useCallback, useEffect, useMemo, useState } from 'react'
import { siteChatDb, siteChatErrorText } from '../../utils/siteChatDb'

const STATUS = { open: 'ממתינה לתשובה', answered: 'נענתה', closed: 'סגורה' }
const tone = status => status === 'open' ? 'bg-amber-100 text-amber-900' : status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'

export default function SiteChatInbox() {
  const [threads, setThreads] = useState(null)
  const [selected, setSelected] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showClosed, setShowClosed] = useState(false)
  // The whole inbox can be folded away; the choice is remembered on this device.
  const [folded, setFolded] = useState(() => { try { return localStorage.getItem('owner-chat-folded') === '1' } catch { return false } })
  const fold = value => { setFolded(value); try { localStorage.setItem('owner-chat-folded', value ? '1' : '0') } catch { /* ignore */ } }
  const load = useCallback(async () => {
    try { const data = await siteChatDb.ownerList(300); setThreads(data || []); setError('') }
    catch (e) { setError(siteChatErrorText(e.code)) }
  }, [])
  useEffect(() => { void load(); const id = setInterval(() => void load(), 20000); return () => clearInterval(id) }, [load])
  // Closed conversations are tucked away unless asked for, so the list shows only what needs attention.
  const visible = useMemo(() => (threads || []).filter(thread => showClosed || thread.status !== 'closed'), [threads, showClosed])
  const closedCount = threads?.filter(thread => thread.status === 'closed').length || 0
  const current = useMemo(() => visible.find(thread => thread.id === selected) || visible[0], [visible, selected])
  const waiting = threads?.filter(thread => thread.status === 'open').length || 0
  const replace = item => setThreads(all => (all || []).map(thread => thread.id === item.id ? item : thread).sort((a, b) => new Date(b.last_message_at || b.updated_at) - new Date(a.last_message_at || a.updated_at)))
  const send = async event => {
    event.preventDefault(); if (!reply.trim() || !current) return
    setBusy(true)
    try { replace(await siteChatDb.ownerReply(current.id, reply.trim())); setReply(''); setError('') }
    catch (e) { setError(siteChatErrorText(e.code)) }
    finally { setBusy(false) }
  }
  const setStatus = async status => {
    if (!current) return
    setBusy(true)
    try { replace(await siteChatDb.ownerStatus(current.id, status)); if (status === 'closed') setSelected(''); setError('') }
    catch (e) { setError(siteChatErrorText(e.code)) }
    finally { setBusy(false) }
  }
  const removeThread = async () => {
    if (!current || !window.confirm(`למחוק את כל השיחה עם ${current.name || 'האורח/ת'}? אי אפשר לשחזר.`)) return
    setBusy(true)
    try { await siteChatDb.ownerDelete(current.id); setThreads(all => (all || []).filter(thread => thread.id !== current.id)); setSelected(''); setError('') }
    catch (e) { setError(siteChatErrorText(e.code)) }
    finally { setBusy(false) }
  }
  const removeMessage = async message => {
    if (!window.confirm('למחוק את ההודעה הזאת? היא תימחק גם אצל הגולש.')) return
    setBusy(true)
    try { const item = await siteChatDb.ownerDeleteMessage(message.id); setThreads(all => (all || []).map(thread => thread.id === item.id ? { ...thread, ...item } : thread)); setError('') }
    catch (e) { setError(siteChatErrorText(e.code)) }
    finally { setBusy(false) }
  }

  return <section className="mb-8 rounded-3xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-6" dir="rtl">
    <div className={`${folded ? '' : 'mb-4 '}flex flex-wrap items-center justify-between gap-3`}><div><p className="text-sm font-black text-violet-600">💬 הצ׳אט של האתר</p><h2 className="text-2xl font-black">פניות ורעיונות מהגולשים</h2><p className="text-sm text-slate-600">התשובה שלך תופיע לגולש בצ׳אט כשיחזור מאותו דפדפן.</p></div><div className="flex gap-2"><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">{waiting} ממתינות</span>{!folded && closedCount > 0 && <button onClick={() => setShowClosed(v => !v)} aria-pressed={showClosed} className="rounded-xl border-2 border-violet-200 bg-white px-3 py-1 text-sm font-bold">{showClosed ? 'הסתרת סגורות' : `סגורות (${closedCount})`}</button>}{!folded && <button onClick={load} className="rounded-xl border-2 border-violet-200 bg-white px-3 py-1 text-sm font-bold">רענון</button>}<button onClick={() => fold(!folded)} aria-expanded={!folded} className="rounded-xl border-2 border-violet-300 bg-white px-3 py-1 text-sm font-bold">{folded ? '▾ פתיחת האזור' : '▴ סגירת האזור'}</button></div></div>
    {!folded && <>
    {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!threads ? <p>טוענים פניות…</p> : !visible.length ? <p className="rounded-2xl bg-white p-5 text-center text-slate-500">{threads.length ? 'אין פניות פתוחות 🎉 השיחות הסגורות מוסתרות.' : 'עוד לא התקבלו פניות בצ׳אט.'}</p> : <div className="grid gap-4 lg:grid-cols-[310px_1fr]">
      <div className="max-h-[570px] space-y-2 overflow-auto rounded-2xl bg-white p-2">{visible.map(thread => {
        const last = thread.messages?.at(-1)
        return <button key={thread.id} onClick={() => setSelected(thread.id)} className={`block w-full rounded-xl border-2 p-3 text-right ${current?.id === thread.id ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:border-slate-200'}`}>
          <div className="flex items-center justify-between gap-2"><b className="truncate">{thread.name || 'אורח/ת'} · {thread.topic}</b><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${tone(thread.status)}`}>{STATUS[thread.status]}</span></div>
          <p className="mt-1 truncate text-xs text-slate-600">{last?.sender === 'owner' ? 'ענית: ' : ''}{last?.body}</p><small className="text-slate-400">{new Date(thread.last_message_at).toLocaleString('he-IL')}</small>
        </button>
      })}</div>
      {current && <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
        <header className="border-b p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{current.name || 'אורח/ת'} · {current.topic}</b>{current.contact && <a href={current.contact.includes('@') ? `mailto:${current.contact}` : `tel:${current.contact.replace(/[^+\d]/g, '')}`} className="mt-1 block text-sm text-violet-700 underline" dir="ltr">{current.contact}</a>}</div><span className={`rounded-full px-3 py-1 text-xs font-black ${tone(current.status)}`}>{STATUS[current.status]}</span></div></header>
        <div className="flex flex-1 flex-col gap-2 overflow-auto bg-slate-50 p-4">{current.messages?.map(message => <div key={message.id} className={`max-w-[85%] rounded-2xl p-3 text-sm ${message.sender === 'owner' ? 'self-start bg-violet-600 text-white' : 'self-end border bg-white'}`}><b className="text-xs">{message.sender === 'owner' ? 'אני' : current.name || 'האורח/ת'}</b><p className="my-1 whitespace-pre-wrap">{message.body}</p><div className="flex items-center justify-between gap-3"><small className={message.sender === 'owner' ? 'text-violet-200' : 'text-slate-400'}>{new Date(message.created_at).toLocaleString('he-IL')}</small><button type="button" disabled={busy} onClick={() => removeMessage(message)} aria-label="מחיקת ההודעה" title="מחיקת ההודעה" className={`rounded px-1 text-xs ${message.sender === 'owner' ? 'text-violet-200 hover:text-white' : 'text-slate-400 hover:text-red-600'}`}>🗑️</button></div></div>)}</div>
        <form onSubmit={send} className="grid gap-2 border-t p-3 sm:grid-cols-[1fr_auto]"><textarea value={reply} onChange={event => setReply(event.target.value)} rows={2} maxLength={1500} placeholder="כתיבת תשובה…" className="rounded-xl border-2 border-slate-200 p-3" /><button disabled={busy || !reply.trim()} className="rounded-xl bg-violet-600 px-5 font-black text-white disabled:opacity-50">שליחה</button></form>
        <div className="flex flex-wrap gap-2 border-t px-3 py-2 text-xs"><button disabled={busy} onClick={() => setStatus('open')} className="rounded-lg border px-2 py-1">סימון כממתינה</button><button disabled={busy} onClick={() => setStatus('answered')} className="rounded-lg border px-2 py-1">סימון כנענתה</button><button disabled={busy} onClick={() => setStatus('closed')} className="rounded-lg border px-2 py-1">✓ סגירת שיחה</button><button disabled={busy} onClick={removeThread} className="rounded-lg border border-red-200 px-2 py-1 text-red-700">🗑️ מחיקת השיחה</button></div>
      </div>}
    </div>}
    </>}
  </section>
}

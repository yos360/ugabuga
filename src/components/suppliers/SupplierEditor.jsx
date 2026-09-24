import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SupplierCard } from './SupplierBits'
import SupplierLanding from './SupplierLanding'
import { uploadImage } from '../../utils/suppliersDb'
import { SUPPLIER_CATEGORIES, SUPPLIER_AREAS, TEMPLATES } from '../../data/supplierOptions'

const EMPTY = { name: '', tagline: '', about: '', category: '', area: '', tags: [], logo_url: '', cover_url: '', whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', youtube: '', website: '', gallery: [], videos: [], services: [], template: 1 }
const fixUrl = v => { const t = (v || '').trim(); if (!t) return ''; if (/^http:\/\//i.test(t)) return t.replace(/^http:/i, 'https:'); return /^https:\/\//i.test(t) ? t : `https://${t}` }
const input = 'w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-[17px] focus:border-slate-800 focus:outline-none'

function Field({ label, hint, children }) {
  return <label className="block"><span className="mb-1 block font-bold">{label}{hint && <span className="ms-1 text-sm font-normal text-slate-500">{hint}</span>}</span>{children}</label>
}
function Box({ title, children, tone = 'bg-white' }) {
  return <fieldset className={`space-y-4 rounded-3xl border-2 border-slate-200 p-4 sm:p-5 ${tone}`}><legend className="px-2 text-lg font-black">{title}</legend>{children}</fieldset>
}

function ImagePick({ label, url, onChange, asOwner, round }) {
  const ref = useRef(), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const pick = async e => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    setBusy(true); setErr('')
    try { onChange(await uploadImage(f, { asOwner, max: round ? 600 : 1600 })) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return <div>
    <span className="mb-1 block font-bold">{label}</span>
    <div className="flex items-center gap-3">
      <div className={`grid shrink-0 place-items-center overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 ${round ? 'h-20 w-20 rounded-full' : 'h-20 w-32 rounded-2xl'}`}>
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">🖼️</span>}
      </div>
      <div className="flex flex-col items-start gap-1">
        <button type="button" onClick={() => ref.current.click()} disabled={busy} className="rounded-xl border-2 border-slate-800 bg-white px-3 py-2 font-bold disabled:opacity-50">{busy ? 'מעלים…' : url ? 'החלפה' : 'העלאת תמונה'}</button>
        {url && <button type="button" onClick={() => onChange('')} className="text-sm text-slate-500 underline">הסרה</button>}
      </div>
    </div>
    {err && <p className="mt-1 text-sm text-rose-700">{err}</p>}
    <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
  </div>
}

function GalleryPick({ items, onChange, asOwner }) {
  const ref = useRef(), [busy, setBusy] = useState(0), [err, setErr] = useState('')
  const pick = async e => {
    const files = [...(e.target.files || [])].slice(0, 30 - items.length); e.target.value = ''
    setErr(''); setBusy(files.length)
    const added = []
    for (const f of files) { try { added.push({ url: await uploadImage(f, { asOwner }) }) } catch (x) { setErr(x.message) } setBusy(b => b - 1) }
    onChange([...items, ...added])
  }
  return <div>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((g, i) => <div key={g.url + i} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
        <img src={g.url} alt="" className="h-full w-full object-cover" />
        <button type="button" onClick={() => onChange(items.filter((_, n) => n !== i))} aria-label={`הסרת תמונה ${i + 1}`} className="absolute end-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-white/90 font-bold shadow">✕</button>
        {i > 0 && <button type="button" onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n) }} aria-label="הזזה קדימה" className="absolute bottom-1 end-1 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow">→</button>}
      </div>)}
      {items.length < 30 && <button type="button" onClick={() => ref.current.click()} disabled={busy > 0} className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-center text-sm font-bold text-slate-600">{busy ? `מעלים… (${busy})` : '＋ הוספת תמונות'}</button>}
    </div>
    {err && <p className="mt-1 text-sm text-rose-700">{err}</p>}
    <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pick} className="hidden" />
  </div>
}

function ListEdit({ items, onChange, fields, addLabel, max }) {
  const set = (i, k, v) => onChange(items.map((x, n) => n === i ? { ...x, [k]: v } : x))
  return <div className="space-y-3">
    {items.map((x, i) => <div key={i} className="flex gap-2 rounded-2xl bg-slate-50 p-3">
      <div className="min-w-0 flex-1 space-y-2">{fields.map(([k, ph, area]) => area
        ? <textarea key={k} value={x[k] || ''} onChange={e => set(i, k, e.target.value)} placeholder={ph} rows={2} maxLength={400} className={input} />
        : <input key={k} value={x[k] || ''} onChange={e => set(i, k, e.target.value)} onBlur={k === 'url' ? e => set(i, k, fixUrl(e.target.value)) : undefined} placeholder={ph} className={input} dir={k === 'url' ? 'ltr' : undefined} />)}</div>
      <button type="button" onClick={() => onChange(items.filter((_, n) => n !== i))} aria-label="הסרה" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 hover:text-rose-600">✕</button>
    </div>)}
    {items.length < max && <button type="button" onClick={() => onChange([...items, {}])} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 font-bold text-slate-700">{addLabel}</button>}
  </div>
}

export default function SupplierEditor({ initial, mode = 'supplier', onSave, saveLabel = 'שמירה' }) {
  const owner = mode === 'owner'
  const [f, setF] = useState(() => ({ ...EMPTY, ...(initial || {}), tags: initial?.tags || [] }))
  const [tagDraft, setTagDraft] = useState('')
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(null), [preview, setPreview] = useState(false)
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const isPage = f.plan === 'page'
  const addTag = () => { const t = tagDraft.trim(); if (t && f.tags.length < 6 && !f.tags.includes(t)) set('tags', [...f.tags, t]); setTagDraft('') }

  const submit = async e => {
    e.preventDefault(); setBusy(true); setMsg(null)
    const p = { ...f, gallery: f.gallery.filter(g => g.url), videos: f.videos.filter(v => v.url), services: f.services.filter(s => s.title?.trim()) }
    for (const k of ['instagram', 'facebook', 'tiktok', 'youtube', 'website']) p[k] = fixUrl(p[k])
    try { const saved = await onSave(p); if (saved) setF(x => ({ ...x, ...saved })); setMsg({ ok: true, text: '✓ נשמר' }) }
    catch (x) { setMsg({ ok: false, text: x.message }) } finally { setBusy(false) }
  }

  return <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="min-w-0 space-y-5">
      {owner && <Box title="⚙️ ניהול (רק אתה רואה)" tone="bg-violet-50">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="סטטוס"><select value={f.status || 'approved'} onChange={e => set('status', e.target.value)} className={input}><option value="approved">✅ מפורסם</option><option value="pending">⏳ ממתין</option><option value="hidden">🙈 מוסתר</option></select></Field>
          <Field label="סוג"><select value={f.plan || 'card'} onChange={e => set('plan', e.target.value)} className={input}><option value="card">כרטיס חינמי</option><option value="page">⭐ דף נחיתה</option></select></Field>
          <Field label="כתובת הדף" hint="באנגלית"><input value={f.slug || ''} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="magic-dani" dir="ltr" className={input} /></Field>
        </div>
      </Box>}

      <Box title="🏷️ פרטי העסק">
        <Field label="שם העסק *"><input value={f.name} onChange={e => set('name', e.target.value)} maxLength={60} required placeholder="למשל: הקוסם דני" className={input} /></Field>
        <Field label="משפט קצר" hint="(מופיע מתחת לשם)"><input value={f.tagline || ''} onChange={e => set('tagline', e.target.value)} maxLength={90} placeholder="קסמים ובלונים לגילאי 3–10" className={input} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="תחום"><select value={f.category || ''} onChange={e => set('category', e.target.value)} className={input}><option value="">בחרו…</option>{SUPPLIER_CATEGORIES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></Field>
          <Field label="אזור"><select value={f.area || ''} onChange={e => set('area', e.target.value)} className={input}><option value="">בחרו…</option>{SUPPLIER_AREAS.map(a => <option key={a}>{a}</option>)}</select></Field>
        </div>
        <div>
          <span className="mb-1 block font-bold">תגיות <span className="text-sm font-normal text-slate-500">(עד 6, למשל: כרגע במילואים, גם באנגלית)</span></span>
          <div className="flex flex-wrap gap-2">{f.tags.map(t => <span key={t} className="flex items-center gap-1 rounded-full bg-slate-100 py-1 pe-1 ps-3 text-sm font-bold">{t}<button type="button" onClick={() => set('tags', f.tags.filter(x => x !== t))} aria-label={`הסרת ${t}`} className="grid h-6 w-6 place-items-center rounded-full hover:bg-slate-200">✕</button></span>)}</div>
          {f.tags.length < 6 && <div className="mt-2 flex gap-2"><input value={tagDraft} onChange={e => setTagDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} maxLength={30} placeholder="תגית חדשה" className={input} /><button type="button" onClick={addTag} className="shrink-0 rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">＋</button></div>}
        </div>
      </Box>

      <Box title="🖼️ תמונות">
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePick label="לוגו" round url={f.logo_url} onChange={v => set('logo_url', v)} asOwner={owner} />
          <ImagePick label="תמונה ראשית" url={f.cover_url} onChange={v => set('cover_url', v)} asOwner={owner} />
        </div>
      </Box>

      <Box title="💬 קצת עליי">
        <textarea value={f.about || ''} onChange={e => set('about', e.target.value)} maxLength={1200} rows={5} placeholder="מה אתם עושים, למי זה מתאים, מה מיוחד אצלכם…" className={input} />
        <p className="text-left text-xs text-slate-500">{(f.about || '').length}/1200</p>
      </Box>

      <Box title="📞 יצירת קשר">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="וואטסאפ"><input value={f.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} inputMode="tel" placeholder="050-1234567" dir="ltr" className={input} /></Field>
          <Field label="טלפון לחיוג"><input value={f.phone || ''} onChange={e => set('phone', e.target.value)} inputMode="tel" placeholder="050-1234567" dir="ltr" className={input} /></Field>
        </div>
        <p className="text-sm text-slate-500">כל לחיצה על וואטסאפ או חיוג נספרת — תראו כמה פניות הגיעו מעוגה בוגה.</p>
      </Box>

      <Box title="🌐 רשתות חברתיות">
        <div className="grid gap-3 sm:grid-cols-2">
          {[['instagram', 'אינסטגרם', 'instagram.com/…'], ['facebook', 'פייסבוק', 'facebook.com/…'], ['tiktok', 'טיקטוק', 'tiktok.com/@…'], ['youtube', 'יוטיוב', 'youtube.com/@…'], ['website', 'אתר', 'www.…']].map(([k, l, ph]) =>
            <Field key={k} label={l}><input value={f[k] || ''} onChange={e => set(k, e.target.value)} onBlur={e => set(k, fixUrl(e.target.value))} placeholder={ph} dir="ltr" className={input} /></Field>)}
        </div>
      </Box>

      {(isPage || owner) && <Box title="⭐ דף הנחיתה" tone={isPage ? 'bg-amber-50' : 'bg-slate-50'}>
        {!isPage && <p className="text-sm font-bold text-amber-800">החלקים האלה יופיעו רק כשהסוג הוא „דף נחיתה”.</p>}
        <div>
          <span className="mb-2 block font-bold">תבנית</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{TEMPLATES.map(t => <button type="button" key={t.id} onClick={() => set('template', t.id)} aria-pressed={f.template === t.id}
            className={`rounded-2xl border-2 p-2 text-start ${f.template === t.id ? 'border-[var(--ink)] shadow-[3px_3px_0_#14162d]' : 'border-slate-200'} bg-white`}>
            <span className="block h-12 rounded-xl border border-slate-200" style={{ background: t.swatch }} />
            <b className="mt-1 block text-sm">{t.id}. {t.name}</b><span className="block text-xs text-slate-500">{t.hint}</span>
          </button>)}</div>
        </div>
        <div><span className="mb-2 block font-bold">גלריה <span className="text-sm font-normal text-slate-500">(עד 30 תמונות)</span></span><GalleryPick items={f.gallery} onChange={v => set('gallery', v)} asOwner={owner} /></div>
        <div><span className="mb-2 block font-bold">סרטונים <span className="text-sm font-normal text-slate-500">(קישור מיוטיוב, אינסטגרם, טיקטוק או פייסבוק)</span></span>
          <ListEdit items={f.videos} onChange={v => set('videos', v)} max={12} addLabel="＋ הוספת סרטון" fields={[['url', 'https://youtube.com/…'], ['title', 'כותרת (לא חובה)']]} /></div>
        <div><span className="mb-2 block font-bold">מה אני מציע/ה</span>
          <ListEdit items={f.services} onChange={v => set('services', v)} max={12} addLabel="＋ הוספת שירות" fields={[['title', 'למשל: מופע קסמים 45 דקות'], ['price', 'מחיר (לא חובה)'], ['text', 'תיאור קצר', true]]} /></div>
        {isPage && <button type="button" onClick={() => setPreview(true)} className="w-full rounded-2xl border-2 border-slate-800 bg-white py-3 font-bold">👀 תצוגה מקדימה של הדף</button>}
      </Box>}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="min-h-[52px] flex-1 rounded-2xl bg-[var(--ink)] px-6 text-lg font-bold text-white disabled:opacity-60 sm:flex-none">{busy ? 'שומרים…' : saveLabel}</button>
        {msg && <span role="status" className={`font-bold ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</span>}
      </div>
    </div>

    <aside className="lg:sticky lg:top-4 lg:self-start">
      <p className="mb-2 font-bold text-slate-600">👀 ככה הכרטיס ייראה:</p>
      <SupplierCard s={{ ...f, name: f.name || 'שם העסק', slug: f.slug || 'preview' }} live={false} />
    </aside>

    {preview && createPortal(<div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--background)]" role="dialog" aria-modal="true" aria-label="תצוגה מקדימה">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur"><b>תצוגה מקדימה · תבנית {f.template}</b><button type="button" onClick={() => setPreview(false)} className="rounded-xl bg-[var(--ink)] px-4 py-2 font-bold text-white">סגירה</button></div>
      <div className="mx-auto max-w-5xl px-4 py-6"><SupplierLanding s={{ ...f, name: f.name || 'שם העסק' }} live={false} /></div>
    </div>, document.body)}
  </form>
}

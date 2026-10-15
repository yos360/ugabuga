import { useRef, useState } from 'react'

// Decode and resize locally; no upload, storage or remote image request.
export default function PersonalPhoto({ value, onChange, label = 'תמונה אישית (לא חובה)' }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const revision = useRef(0)
  async function choose(file) {
    const id = ++revision.current
    setBusy(false)
    if (!file) return
    setError('')
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) { setError('בחרו תמונת JPG, PNG או WebP בגודל עד 15 מגה.'); return }
    setBusy(true)
    let bitmap
    try {
      bitmap = await createImageBitmap(file)
      const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      if (id === revision.current) onChange(canvas.toDataURL('image/jpeg', 0.88))
    } catch { if (id === revision.current) setError('לא הצלחנו לפתוח את התמונה. נסו קובץ JPG או PNG אחר.') }
    finally { bitmap?.close(); if (id === revision.current) setBusy(false) }
  }
  return <div className="personal-photo">
    <label className="block font-bold">{label}<input className="block max-w-full mt-2" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { choose(e.target.files?.[0]); e.target.value = '' }} /></label>
    <p className="text-sm mt-2">התמונה נשארת בדפדפן שלכם ואינה נשלחת לאתר.</p>
    {busy && <p role="status">מכינים את התמונה…</p>}{error && <p role="alert">{error}</p>}
    {value && <div className="flex items-center gap-3 mt-3"><img src={value} alt="התמונה שבחרתם" className="w-20 h-20 object-contain rounded-lg bg-white" /><button type="button" className="underline min-h-[44px]" onClick={() => { revision.current++; setBusy(false); onChange('') }}>הסרת התמונה</button></div>}
  </div>
}

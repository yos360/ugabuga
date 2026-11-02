// HEIC → JPG (or PNG): iPhone photos are converted on add (heic2any loads only then); here they're saved.
import { useState } from 'react'
import { useImages } from './imageStore'
import { decodeImage, freeImage, newCanvas, encodeCanvas, downloadBlob, downloadZip } from './imageIO'
import { formatBytes, outName } from './imageLogic'
import { Seg, Range } from './ui'

async function convert(it, fmt, quality) {
  if (fmt === 'jpg' && quality === 92 && /jpe?g/.test(it.blob.type)) return { blob: it.blob, ext: 'jpg' }
  const img = await decodeImage(it.blob, 8192)
  const c = newCanvas(img.width, img.height)
  try {
    c.getContext('2d').drawImage(img, 0, 0)
    return await encodeCanvas(c, fmt, quality / 100)
  } finally { freeImage(img); freeImage(c) }
}

export default function HeicTool() {
  const { items } = useImages()
  const heics = items.filter(i => i.heic)
  const list = heics.length ? heics : items
  const [fmt, setFmt] = useState('jpg')
  const [quality, setQuality] = useState(92)
  const [done, setDone] = useState({}) // id → size
  const [busy, setBusy] = useState('')

  const one = async it => {
    setBusy(String(it.id))
    try {
      const r = await convert(it, fmt, quality)
      setDone(d => ({ ...d, [it.id]: r.blob.size }))
      downloadBlob(r.blob, outName(it.name, '', r.ext))
    } finally { setBusy('') }
  }
  const all = async () => {
    const out = []
    for (let i = 0; i < list.length; i++) {
      setBusy(`${i + 1}/${list.length}`)
      try {
        const r = await convert(list[i], fmt, quality)
        out.push({ name: outName(list[i].name, '', r.ext), blob: r.blob })
        setDone(d => ({ ...d, [list[i].id]: r.blob.size }))
      } catch { /* skip */ }
    }
    if (out.length) await downloadZip(out, fmt === 'png' ? 'תמונות-PNG.zip' : 'תמונות-JPG.zip')
    setBusy('')
  }

  return (
    <div className="im-tool">
      <div className="im-field">
        {!heics.length && <p className="im-stat warn">לא נבחרו קובצי HEIC. אפשר בכל זאת לשמור את התמונות שבחרתם כ-JPG או PNG.</p>}
        <ul className="im-list">
          {list.map(it => (
            <li key={it.id}>
              <img src={it.thumb} alt="" />
              <span className="grow" title={it.name}>{it.name}<br /><small dir="ltr">{formatBytes(it.size)} · {it.width}×{it.height}</small></span>
              {done[it.id] && <span className="ok">✓ {formatBytes(done[it.id])}</span>}
              <button type="button" className="im-chip" disabled={!!busy} onClick={() => one(it)}>⬇️ {fmt === 'png' ? 'PNG' : 'JPG'}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="im-side">
        <Seg label="להמיר ל" value={fmt} onChange={setFmt} options={[{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }]} />
        {fmt === 'jpg' && <Range label="איכות" value={quality} min={50} max={100} onChange={setQuality} show={v => `${v}%`} />}
        <button type="button" className="im-btn big" disabled={!!busy || !list.length} onClick={list.length === 1 ? () => one(list[0]) : all}>
          {busy && busy.includes('/') ? `⏳ ${busy}…` : list.length === 1 ? '⬇️ הורדה' : `⬇️ הורדת כל ${list.length} (ZIP)`}
        </button>
        <p className="im-small">ההמרה נעשית בדפדפן. אחרי ההמרה אפשר לעבור לכל כלי אחר, והתמונות כבר שם.</p>
      </div>
    </div>
  )
}

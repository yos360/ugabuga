export async function iconBlob(src, type = 'image/png') {
  if (!['image/png','image/webp'].includes(type)) throw new Error('Unsupported format')
  const image = new Image()
  image.src = src
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.clearRect(0,0,512,512)
  ctx.drawImage(image,0,0,512,512)
  const blob = await new Promise(resolve=>canvas.toBlob(resolve,type,0.92))
  // Some browsers silently return PNG when WebP export is unavailable.
  if (!blob || blob.type !== type) throw new Error('Format unavailable')
  return blob
}
export function downloadIcon(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),10000)
}
export function canShareIcons() {
  try { return typeof navigator.share === 'function' && navigator.canShare?.({files:[new File([''], 'icon.png',{type:'image/png'})]}) === true } catch {return false}
}

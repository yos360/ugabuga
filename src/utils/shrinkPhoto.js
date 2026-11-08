// Shrinks a photo picked from the phone or computer before it is drawn on a printable sheet:
// a page of 30 full-size phone photos would make the preview and the print slow. The result is a
// blob: URL that lives only in this browser tab — nothing is uploaded anywhere.
export async function shrinkPhoto(file, max = 720) {
  if (!file?.type?.startsWith('image/')) return null
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k)
    c.height = Math.round(bmp.height * k)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    bmp.close?.()
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.86))
    return URL.createObjectURL(blob || file)
  } catch {
    return URL.createObjectURL(file)
  }
}

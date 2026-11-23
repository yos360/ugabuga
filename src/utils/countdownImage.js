// Draws the 9:16 WhatsApp-status card "עוד N ימים ל<חג>" on a canvas (1080x1920).
export const CARD_W = 1080
export const CARD_H = 1920
const FONT = 'Heebo, "Segoe UI", Arial, sans-serif'

function fit(ctx, text, size, weight, maxW) {
  let s = size
  for (; s > 40; s -= 4) { ctx.font = `${weight} ${s}px ${FONT}`; if (ctx.measureText(text).width <= maxW) break }
  return s
}

// holiday: { name, emoji, solemn, days }; mascot: a loaded <img> (or null).
export function drawCountdownCard(canvas, holiday, mascot) {
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, CARD_H)
  g.addColorStop(0, '#fff1b8'); g.addColorStop(0.55, '#ffd9ec'); g.addColorStop(1, '#c9e8ff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  for (const [x, y, r] of [[120, 160, 70], [940, 260, 50], [880, 1000, 90], [90, 1200, 60], [980, 1500, 45]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
  ctx.direction = 'rtl'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cx = CARD_W / 2, maxW = 940
  const { days, name, emoji, solemn } = holiday
  ctx.font = `220px ${FONT}`
  ctx.fillStyle = '#000'
  ctx.fillText(emoji, cx, 230)
  const dark = '#2b1d4d', accent = '#d6246e'
  if (days <= 0) {
    ctx.fillStyle = accent
    if (!solemn) { ctx.font = `900 ${fit(ctx, 'חג שמח!', 220, 900, maxW)}px ${FONT}`; ctx.fillText('חג שמח!', cx, 640) }
    const line = `${name} היום`
    ctx.fillStyle = dark
    ctx.font = `800 ${fit(ctx, line, 150, 800, maxW)}px ${FONT}`
    ctx.fillText(line, cx, solemn ? 700 : 880)
  } else {
    ctx.fillStyle = dark
    ctx.font = `800 120px ${FONT}`
    ctx.fillText('עוד', cx, 480)
    ctx.fillStyle = accent
    const big = days === 1 ? 'יום' : days === 2 ? 'יומיים' : String(days)
    ctx.font = `900 ${fit(ctx, big, days <= 2 ? 300 : 460, 900, maxW)}px ${FONT}`
    ctx.fillText(big, cx, 740)
    ctx.fillStyle = dark
    ctx.font = `800 150px ${FONT}`
    if (days > 2) ctx.fillText('ימים', cx, 1010)
    else if (days === 1) ctx.fillText('אחד', cx, 1010)
    const line = `ל${name}`
    ctx.font = `900 ${fit(ctx, line, 150, 900, maxW)}px ${FONT}`
    ctx.fillText(line, cx, 1170)
  }
  if (mascot) {
    const h = 560, w = h * (mascot.naturalWidth / mascot.naturalHeight)
    ctx.drawImage(mascot, cx - w / 2, 1240, w, h)
  }
  ctx.fillStyle = 'rgba(43,29,77,0.7)'
  ctx.direction = 'ltr'
  ctx.font = `600 38px ${FONT}`
  ctx.fillText('ugabuga.co.il', cx, 1860)
  return canvas
}

export const loadMascot = () => new Promise(resolve => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => resolve(null)
  img.src = '/images/home-mascot-play.webp'
})

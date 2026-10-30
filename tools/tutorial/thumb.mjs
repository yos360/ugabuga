// usage: node thumb.mjs <outdir> "<title html>"  — 1280x720 thumbnail: big title + real screenshot (shot.png), site style
import { createRequire } from 'node:module'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const [out, title] = process.argv.slice(2)
const f = n => fs.readFileSync(new URL('../../template/' + n, import.meta.url)).toString('base64')
const shot = fs.readFileSync(out + '/shot.png').toString('base64')
const html = `<!doctype html><html dir="rtl"><meta charset="utf-8"><style>@font-face{font-family:H;src:url(data:font/ttf;base64,${f('fonts/Heebo.ttf')});font-weight:100 900}
body{margin:0;width:1280px;height:720px;font-family:H;color:#14162d;background:linear-gradient(135deg,#e9dcff,#ffd9e6 55%,#fff4bb);position:relative;overflow:hidden}
h1{position:absolute;right:56px;top:50px;width:620px;font-size:92px;line-height:1.1;margin:0;font-weight:900}
.pill{position:absolute;right:56px;bottom:48px;background:#226bd7;color:#fff;border:5px solid #14162d;border-radius:999px;padding:8px 36px;font-size:44px;font-weight:800;direction:ltr}
.shot{position:absolute;left:44px;top:70px;width:560px;height:580px;border:6px solid #14162d;border-radius:28px;box-shadow:12px 12px 0 #14162d;background:#fffefa url(data:image/png;base64,${shot}) 50% 0/${process.env.SHOTW||1180}px auto no-repeat}
.logo{position:absolute;right:56px;bottom:150px;height:0}</style><body><h1>${title}</h1><div class="shot"></div><div class="pill">ugabuga.co.il</div></body></html>`
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300)
await p.screenshot({ path: out + '/thumbnail.jpg', type: 'jpeg', quality: 92 }); await b.close()

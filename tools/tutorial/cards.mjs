// Title and end cards in the site look (paper #fffefa, ink #14162d, Heebo). Rendered to PNG, then looped by ffmpeg.
import fs from 'node:fs'
const kit = p => new URL('../../' + p, import.meta.url)
const font = fs.readFileSync(kit('template/fonts/Heebo.ttf')).toString('base64')
const fredoka = fs.readFileSync(kit('template/fonts/Fredoka.ttf')).toString('base64')
const logo = 'data:image/svg+xml;base64,' + fs.readFileSync(kit('template/img/logo.svg')).toString('base64')
const boy = 'data:image/png;base64,' + fs.readFileSync(kit('template/img/home-detective-boy.png')).toString('base64')

const base = body => `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><style>
@font-face{font-family:H;src:url(data:font/ttf;base64,${font});font-weight:100 900}
@font-face{font-family:F;src:url(data:font/ttf;base64,${fredoka});font-weight:300 700}
*{box-sizing:border-box}body{margin:0;width:1920px;height:1080px;font-family:H;color:#14162d;overflow:hidden;
background:radial-gradient(#14162d22 2px,transparent 2.5px) 0 0/36px 36px,#fffefa;display:grid;place-items:center}
.card{background:#fff;border:5px solid #14162d;border-radius:40px;box-shadow:14px 14px 0 #14162d;padding:60px 90px;text-align:center}
.pill{display:inline-block;border:5px solid #14162d;border-radius:999px;padding:12px 48px;font-weight:800}
${body.css}</style><body>${body.html}</body></html>`

export const titleCard = ({ title, sub }) => base({
  css: `body{background:radial-gradient(#14162d22 2px,transparent 2.5px) 0 0/36px 36px,linear-gradient(135deg,#e9dcff,#ffd9e6 55%,#fff4bb)}
.card{width:1500px;position:relative}h1{font-size:104px;line-height:1.2;margin:10px 0 20px;font-weight:900}
.sub{font-size:48px;color:#555a7a;font-weight:600}.logo{height:120px}.tag{font-size:40px;background:#fff4bb;margin-top:28px}
.boy{position:absolute;left:-60px;bottom:-60px;height:380px}`,
  html: `<div class="card"><img class="logo" src="${logo}"><h1>${title}</h1><div class="sub">${sub}</div><div class="pill tag">מדריך קצר · עוגה בוגה</div></div><img class="boy" src="${boy}" style="position:absolute;left:60px;bottom:30px;height:360px">`,
})

export const endCard = ({ url, line, where }) => base({
  css: `body{background:radial-gradient(#14162d22 2px,transparent 2.5px) 0 0/36px 36px,linear-gradient(135deg,#e9dcff,#ffd9e6 55%,#fff4bb)}
.card{width:1500px}.logo{height:150px}h1{font-size:96px;margin:6px 0;font-weight:900}.line{font-size:46px;font-weight:600;color:#3a3f66;margin-bottom:26px}
.free{background:#fff4bb;font-size:46px;margin-bottom:26px}.url{background:#226bd7;color:#fff;font-family:F,H;font-size:64px;letter-spacing:.5px;direction:ltr}
.where{margin-top:26px;font-size:36px;color:#7a7f9a;font-weight:600}`,
  html: `<div class="card"><img class="logo" src="${logo}"><h1>עוגה בוגה</h1><div class="line">${line}</div><div class="pill free">בחינם, בלי הרשמה</div><br><div class="pill url">${url}</div><div class="where">${where}</div></div>`,
})

// Injected into the recorded page: step caption bar, highlight ring, fake cursor. Shared by all tutorials.
import fs from 'node:fs'
const FONT = fs.readFileSync(new URL('../../template/fonts/Heebo.ttf', import.meta.url)).toString('base64')

export async function installOverlay(page) {
  await page.evaluate(font => {
    if (document.getElementById('tut-root')) return
    const st = document.createElement('style')
    st.textContent = `
@font-face{font-family:'TutHeebo';src:url(data:font/ttf;base64,${font}) format('truetype');font-weight:100 900}
#tut-root *{box-sizing:border-box;font-family:'TutHeebo',Heebo,sans-serif}
#tut-cap{position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(30px);opacity:0;z-index:2147483646;direction:rtl;
  display:flex;align-items:center;gap:22px;padding:16px 34px 16px 40px;background:rgba(255,255,255,.88);border:4px solid #14162d;border-radius:22px;
  box-shadow:6px 6px 0 rgba(20,22,45,.85);color:#14162d;font-size:44px;font-weight:700;white-space:nowrap;transition:opacity .35s,transform .35s}
#tut-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
#tut-cap b{display:grid;place-items:center;min-width:64px;height:64px;border-radius:50%;background:#226bd7;color:#fff;font-size:40px;border:3px solid #14162d}
#tut-ring{position:fixed;z-index:2147483645;pointer-events:none;border:6px solid #cf2f56;border-radius:18px;box-shadow:0 0 0 6px rgba(207,47,86,.28);opacity:0;transition:all .35s}
#tut-ring.on{opacity:1;animation:tutpulse 1s ease-in-out infinite}
@keyframes tutpulse{50%{box-shadow:0 0 0 14px rgba(207,47,86,.12)}}
#tut-cur{position:fixed;z-index:2147483647;pointer-events:none;width:34px;height:34px;left:0;top:0;transform:translate(-4px,-4px);transition:left .05s linear,top .05s linear}
#tut-cur svg{filter:drop-shadow(2px 3px 2px rgba(0,0,0,.35))}
#tut-click{position:fixed;z-index:2147483646;pointer-events:none;width:20px;height:20px;border-radius:50%;border:5px solid #226bd7;opacity:0;transform:translate(-50%,-50%)}
#tut-click.go{animation:tutclick .5s ease-out}
@keyframes tutclick{0%{opacity:.9;width:20px;height:20px}100%{opacity:0;width:90px;height:90px}}`
    document.head.appendChild(st)
    const root = document.createElement('div'); root.id = 'tut-root'
    root.innerHTML = `<div id="tut-ring"></div><div id="tut-click"></div>
<div id="tut-cur"><svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 2l15 9-6.5 1.6L9.5 19z" fill="#14162d" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
<div id="tut-cap"></div>`
    document.body.appendChild(root)
    addEventListener('mousemove', e => { const c = document.getElementById('tut-cur'); c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px' }, true)
    addEventListener('mousedown', e => { const k = document.getElementById('tut-click'); k.style.left = e.clientX + 'px'; k.style.top = e.clientY + 'px'; k.classList.remove('go'); void k.offsetWidth; k.classList.add('go') }, true)
  }, FONT)
  await page.evaluate(() => document.fonts.load("700 44px TutHeebo"))
}

export async function caption(page, n, text) {
  await page.evaluate(([n, text]) => {
    const c = document.getElementById('tut-cap')
    c.classList.remove('on')
    setTimeout(() => { c.innerHTML = `<b>${n}</b><span>${text}</span>`; c.classList.add('on') }, 250)
  }, [n, text])
  await page.waitForTimeout(700)
}

export async function ring(page, locator, pad = 10) {
  const box = await locator.boundingBox()
  await page.evaluate(([b, pad]) => {
    const r = document.getElementById('tut-ring')
    Object.assign(r.style, { left: b.x - pad + 'px', top: b.y - pad + 'px', width: b.width + 2 * pad + 'px', height: b.height + 2 * pad + 'px' })
    r.classList.add('on')
  }, [box, pad])
  await page.waitForTimeout(500)
  return box
}
export const unring = page => page.evaluate(() => document.getElementById('tut-ring').classList.remove('on'))

// move the visible cursor to the element, ring it, click, drop the ring
export async function clickOn(page, locator, { pad = 10, hold = 700 } = {}) {
  await locator.scrollIntoViewIfNeeded()
  const box = await ring(page, locator, pad)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 28 })
  await page.waitForTimeout(hold)
  await page.mouse.down(); await page.waitForTimeout(80); await page.mouse.up()
  await unring(page)
}

// slow human-like typing into a field (for tools that need it)
export async function typeSlow(page, locator, text, delay = 140) {
  await clickOn(page, locator)
  await locator.pressSequentially(text, { delay })
}

// smooth scroll to a pixel offset
export async function scrollTo(page, y, ms = 1200) {
  await page.evaluate(([y, ms]) => new Promise(res => {
    const y0 = scrollY, t0 = performance.now()
    const f = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, y0 + (y - y0) * e); k < 1 ? requestAnimationFrame(f) : res() }
    requestAnimationFrame(f)
  }), [y, ms])
}

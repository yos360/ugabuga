// Tutorial: class timer (/tools/timer). Labels are the real ones from src/pages/tools/CountdownTimer.jsx.
import { clickOn } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'timer',
  path: '/tools/timer',
  fullUrl: 'ugabuga.co.il/tools/timer',
  card: { title: 'איך מפעילים טיימר<br>לכיתה בעוגה בוגה', sub: 'בוחרים זמן, מתחילים, עוצרים, ומקבלים צלצול בסוף' },
  endLine: 'טיימר אונליין עם שעון מעורר — מ־' + N('30') + ' שניות ועד ' + N('30') + ' דקות',
  endWhere: 'באתר: כלים ← טיימר',
  zoom: 1.35,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const btn = name => page.getByRole('button', { name })
    await page.evaluate(() => scrollTo(0, 300)); await wait(600)

    h.mark(); await h.caption(page, 1, 'בוחרים כמה זמן — למשל ' + N('30') + ' שניות')
    await wait(1200)
    await clickOn(page, btn('30 שניות'), { pad: 10 }); await wait(6000)

    h.mark(); await h.caption(page, 2, 'השעון סופר לאחור, והפס מתמלא')
    await wait(4500)

    h.mark(); await h.caption(page, 3, 'צריך הפסקה? לוחצים "עצור"')
    await clickOn(page, btn(/עצור/), { pad: 10 }); await wait(3200)

    h.mark(); await h.caption(page, 4, 'לוחצים "המשיכו" והספירה ממשיכה')
    await clickOn(page, btn(/המשיכו/), { pad: 10 })
    await page.mouse.move(1500, 700, { steps: 25 }); await wait(9000)

    h.mark(); await h.caption(page, 5, 'כשהזמן נגמר — שעון מעורר וצלצול')
    await page.locator('p.buga-pop', { hasText: 'נגמר הזמן' }).waitFor({ timeout: 40000 }); await wait(3500)

    h.mark(); await h.caption(page, 6, 'רוצים זמן אחר? בוחרים למשל "' + N('5') + ' דקות"')
    await clickOn(page, btn(/^5 דקות/), { pad: 10 }); await wait(3500)
    await clickOn(page, btn(/איפוס/), { pad: 10 }); await wait(2500)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

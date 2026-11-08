// Tutorial: math worksheets (/printables/math-worksheets). Labels are the real ones from src/pages/printables/MathWorksheets.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'math-worksheets',
  path: '/printables/math-worksheets',
  fullUrl: 'ugabuga.co.il/printables/math-worksheets',
  card: { title: 'איך מכינים דף עבודה<br>בחשבון בעוגה בוגה', sub: 'בוחרים תחום ופעולה — ומקבלים דף חדש להדפסה, עם פתרונות' },
  endLine: 'דפי עבודה בחשבון לכיתות א׳–ג׳ — דף חדש בכל לחיצה',
  endWhere: 'באתר: דפים להדפסה ← דפי עבודה בחשבון',
  zoom: 1.35,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const group = name => page.getByRole('radiogroup', { name })
    await page.evaluate(() => window.__hide = setInterval(() => { // hide the site's floating widgets
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    
    h.mark(); await h.caption(page, 1, 'פותחים את דפי העבודה בחשבון — דף ראשון כבר מוכן'); await wait(3500)
    await scrollTo(page, 760, 1400); await wait(1500)

    h.mark(); await h.caption(page, 2, `בוחרים תחום — חיבור וחיסור עד ${N(20)}`)
    await clickOn(page, group('תחום').getByRole('radio', { name: 'עד 20', exact: true }), { pad: 8 }); await wait(4000)

    h.mark(); await h.caption(page, 3, 'בוחרים פעולה — רק חיסור')
    await clickOn(page, group('פעולה').getByRole('radio', { name: 'חיסור', exact: true }), { pad: 8 }); await wait(4000)

    h.mark(); await h.caption(page, 4, 'בוחרים סוג תרגול — "מספר חסר"')
    await clickOn(page, group('סוג').getByRole('radio', { name: 'מספר חסר', exact: true }), { pad: 8 }); await wait(4200)

    h.mark(); await h.caption(page, 5, 'לא אהבתם את הדף? "דף חדש" נותן תרגילים אחרים')
    await clickOn(page, page.getByRole('button', { name: /דף חדש/ }), { pad: 8 }); await wait(4200)

    h.mark(); await h.caption(page, 6, 'מוסיפים דף פתרונות ובוחרים כמה דפים להדפיס')
    await clickOn(page, page.getByLabel('הוסיפו דף פתרונות'), { pad: 8 }); await wait(1500)
    await page.getByLabel('מספר דפים').selectOption('2'); await wait(3500)

    await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 7, 'לוחצים "הדפיסו" — תצוגה מקדימה והדפסה')
    await clickOn(page, page.getByRole('button', { name: /הדפיסו/ }), { pad: 8 }); await wait(800)
    await page.evaluate(() => { const r = document.getElementById('tut-root'); r.style.cssText = 'position:fixed;z-index:2147483647'; document.body.appendChild(r) }) // caption above the print dialog
    await wait(6200)
  },
}

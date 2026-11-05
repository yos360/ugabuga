// Tutorial: ready treasure hunts (/treasure-hunt/ready). Labels are the real ones from src/pages/content/MoreContent.jsx (HuntsHub, HuntPage).
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'ready-hunt',
  path: '/treasure-hunt/ready',
  fullUrl: 'ugabuga.co.il/treasure-hunt/ready',
  card: { title: 'איך עושים ציד אוצרות<br>מוכן בעוגה בוגה', sub: 'בוחרים מקום, מדפיסים ' + N(8) + ' רמזים מחורזים ומחביאים' },
  endLine: 'ציד אוצרות מוכן — רמזים מחורזים להדפסה, לבית, לחצר ולמסיבה',
  endWhere: 'באתר: משחקים ← חפש את המטמון ← מוכנים',
  zoom: 1.3,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const goTo = async (loc, off) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 1100)

    h.mark(); await h.caption(page, 1, 'פותחים את "חפש את המטמון — מוכן להדפסה" ובוחרים מקום'); await wait(3000)
    await scrollTo(page, 200, 1200); await wait(1500)

    h.mark(); await h.caption(page, 2, 'למשל יום הולדת — לוחצים על הכרטיס')
    const card = page.locator('main a', { hasText: 'חיפוש אוצר ליום הולדת' }).first()
    await goTo(card, 380); await wait(500)
    await clickOn(page, card, { pad: 10 })
    await page.waitForLoadState('networkidle'); await wait(1500)
    await page.evaluate(() => scrollTo(0, 0)); await wait(500)

    h.mark(); await h.caption(page, 3, 'בדף רואים הכנה, ואיזה פרס לחלק בסוף')
    const prep = page.locator('h2', { hasText: 'הכנה' }).first()
    await goTo(prep, 160); await wait(4500)

    h.mark(); await h.caption(page, 4, `מתחת מחכים ${N(8)} רמזים מחורזים — לגזור ולהחביא`)
    await goTo(page.locator('h2', { hasText: 'הרמזים' }), 120); await wait(2000)
    await scrollTo(page, await page.evaluate(() => scrollY + 380), 1800); await wait(4000)

    h.mark(); await h.caption(page, 5, 'למבוגר: "איפה מחביאים כל רמז" — לוחצים ופותחים')
    const sum = page.locator('summary', { hasText: 'איפה מחביאים' })
    await goTo(sum, 200); await wait(400)
    await clickOn(page, sum, { pad: 10 }); await wait(1000)
    await scrollTo(page, await page.evaluate(() => scrollY + 260), 1200); await wait(3500)

    await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 6, 'לוחצים "הדפסה" ומקבלים דף מוכן לגזירה')
    const pr = page.locator('main').getByRole('button', { name: /🖨️ הדפסה/ }).first()
    await goTo(pr, 520); await wait(900)
    await clickOn(page, pr, { pad: 10 })
    await page.evaluate(() => { document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:830px!important;margin-top:20px!important}'; document.head.appendChild(st) }); await wait(7000)
    await page.keyboard.press('Escape'); await wait(800)

    h.mark(); await h.caption(page, 7, 'רוצים רמזים משלכם? "ליצור ציד משלכם" פותח את המחולל')
    const mk = page.locator('main').getByRole('link', { name: /ליצור ציד משלכם/ })
    await goTo(mk, 520); await wait(900)
    await clickOn(page, mk, { pad: 10 }); await page.waitForLoadState('networkidle'); await wait(5500)
  },
}

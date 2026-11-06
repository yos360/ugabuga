// Tutorial: party calculator (/tools/party-calculator). Labels are the real ones from src/pages/Calculator.jsx.
import { clickOn, scrollTo, ring, unring } from '../overlay.mjs'

export default {
  slug: 'party-calculator',
  path: '/tools/party-calculator',
  fullUrl: 'ugabuga.co.il/tools/party-calculator',
  card: { title: 'איך מחשבים כמה פיצות<br>ושתייה למסיבה בעוגה בוגה', sub: 'בוחרים סוג אירוע ומספר אורחים, ומקבלים רשימת קניות' },
  endLine: 'מחשבון מסיבה — כמה פיצות, שתייה ועוגה לקנות',
  endWhere: 'באתר: כלים ← מחשבון מסיבה',
  zoom: 1.5,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const btn = name => page.getByRole('button', { name, exact: true })
    const center = async loc => scrollTo(page, await loc.evaluate(el => scrollY + el.getBoundingClientRect().top - 380), 800)
    const showList = async () => scrollTo(page, await page.evaluate(() => scrollY + [...document.querySelectorAll('h2')].find(e => e.textContent.includes('רשימת הקניות')).getBoundingClientRect().top - 90), 1000)

    h.mark(); await h.caption(page, 1, 'בוחרים סוג אירוע — למשל יום הולדת')
    await wait(1500)
    await center(page.getByRole('button', { name: /מסיבת יום הולדת/ })); await clickOn(page, page.getByRole('button', { name: /מסיבת יום הולדת/ })); await wait(2000)

    h.mark(); await h.caption(page, 2, 'כותבים כמה אורחים יגיעו — למשל ⁦24⁩')
    const g = page.locator('#calc-guests')
    await center(g); await clickOn(page, g, { pad: 8 }); await g.fill(''); await g.pressSequentially('24', { delay: 220 }); await wait(2200)

    h.mark(); await h.caption(page, 3, 'בוחרים גיל ואת משך האירוע')
    await center(btn('10–13')); await clickOn(page, btn('10–13')); await wait(1200)
    await clickOn(page, btn('3 שעות+')); await wait(2000)

    h.mark(); await h.caption(page, 4, 'בוחרים ארוחה ורמת תקציב')
    await center(page.getByRole('button', { name: /פיצה מוזמנת/ })); await clickOn(page, page.getByRole('button', { name: /פיצה מוזמנת/ })); await wait(1000)
    await clickOn(page, page.getByRole('button', { name: /רגיל/ })); await wait(2000)

    h.mark(); await h.caption(page, 5, 'לוחצים "חשבו לי!" — ורשימת הקניות מוכנה')
    const go = page.getByRole('button', { name: /חשבו לי/ })
    await center(go); await wait(300)
    await clickOn(page, go); await wait(1200)
    await showList(); await wait(3200)

    h.mark(); await h.caption(page, 6, 'משנים תקציב — והמחירים מתעדכנים מיד')
    await center(page.getByRole('button', { name: /מפנק/ })); await wait(300)
    await clickOn(page, page.getByRole('button', { name: /מפנק/ })); await wait(1000)
    await showList(); await wait(3200)

    h.mark(); await h.caption(page, 7, 'מדפיסים את הרשימה או שולחים בוואטסאפ')
    const pr = page.locator('[data-print-main]')
    await center(pr); await wait(300)
    await ring(page, pr, 10); await wait(1500); await unring(page)
    await ring(page, page.getByRole('link', { name: /שליחה בוואטסאפ/ }), 10); await wait(2500); await unring(page)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

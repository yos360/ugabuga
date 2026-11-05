// Tutorial: spin wheel (/tools/wheel). Labels are the real ones from src/pages/tools/RandomPicker.jsx.
import { clickOn, typeSlow, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'wheel',
  path: '/tools/wheel',
  fullUrl: 'ugabuga.co.il/tools/wheel',
  card: { title: 'איך מגרילים בגלגל מזל<br>בעוגה בוגה', sub: 'כותבים אפשרויות, מסובבים, והגלגל בוחר — בלי חזרות' },
  endLine: 'גלגל מזל — הגרלה הוגנת לכיתה, למסיבה ולבית',
  endWhere: 'באתר: כלים ← גלגל מזל',
  zoom: 1.15,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const spinBtn = () => page.getByRole('button', { name: /סובבו את הגלגל/ })
    const goTop = async () => scrollTo(page, await page.evaluate(() => scrollY + document.querySelector('svg[role=img]').getBoundingClientRect().top - 90), 900)

    h.mark(); await h.caption(page, 1, 'על הגלגל יש שמות לדוגמה — לוחצים "סובבו את הגלגל"'); await wait(2500)
    await goTop(); await wait(600); await clickOn(page, spinBtn(), { pad: 10 }); await wait(5200)
    await page.getByText('🎉').first().waitFor(); await wait(2500)

    h.mark(); await h.caption(page, 2, 'רוצים אפשרויות משלכם? לוחצים "ניקוי" ומתחילים לכתוב')
    await page.getByRole('button', { name: /מתחילים מחדש/ }).evaluate(b => b.click()) // drop the sample spin from the history so it only shows the demo
    await clickOn(page, page.getByRole('button', { name: /ניקוי/ }), { pad: 8 }); await wait(1800)

    h.mark(); await h.caption(page, 3, 'כותבים שורה לכל אפשרות — והן מופיעות מיד על הגלגל')
    await typeSlow(page, page.locator('#wheel-items'), 'פיצה\nגלידה\nסרט\nמשחקי קופסה\nפיקניק', 120); await wait(2500)

    h.mark(); await h.caption(page, 4, 'מסובבים שוב — והגלגל עוצר על אפשרות אקראית')
    await clickOn(page, spinBtn(), { pad: 10 }); await wait(5200)
    await page.getByText('🎉').first().waitFor(); await wait(2800)

    h.mark(); await h.caption(page, 5, 'מסמנים "בלי חזרות" — מי שיצא יורד מהגלגל')
    const cb = page.getByLabel(/בלי חזרות/)
    await clickOn(page, cb, { pad: 12 }); await wait(1500)
    await clickOn(page, spinBtn(), { pad: 10 }); await wait(5200)
    await clickOn(page, spinBtn(), { pad: 10 }); await wait(5200)
    await wait(1200)

    h.mark(); await h.caption(page, 6, 'ברשימה "הגרלות אחרונות" רואים מי כבר יצא')
    await wait(4000)

    h.mark(); await h.caption(page, 7, '"מתחילים מחדש" מחזיר את כולם לגלגל')
    await clickOn(page, page.getByRole('button', { name: /מתחילים מחדש/ }), { pad: 8 }); await wait(3500)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

// Tutorial: road safety week (/road-safety-week). Labels are the real ones from src/pages/RoadSafetyWeek.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'

export default {
  slug: 'road-safety-week',
  path: '/road-safety-week',
  fullUrl: 'ugabuga.co.il/road-safety-week',
  card: { title: 'איך מלמדים בטיחות בדרכים<br>בעוגה בוגה', sub: 'חידון לפי כיתה, הבנת הנקרא, רמזור אינטראקטיבי ודפי עבודה להדפסה' },
  endLine: 'שבוע זהירות בדרכים — חידונים, רמזור ודפי עבודה לכל כיתה',
  endWhere: 'באתר: שבוע זהירות בדרכים',
  zoom: 1.35,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const toSection = async id => { const y = await page.locator(id).evaluate(e => e.getBoundingClientRect().top + scrollY); await scrollTo(page, y - 90, 1300) }
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))

    h.mark(); await h.caption(page, 1, 'פותחים את שבוע זהירות בדרכים — הכול בדף אחד'); await wait(3800)
    await toSection('#grades'); await wait(800)

    h.mark(); await h.caption(page, 2, 'בוחרים כיתה — למשל כיתה ד׳ — וכל הדף מתאים לה')
    await clickOn(page, page.getByRole('radiogroup', { name: 'כיתה' }).getByRole('radio', { name: /כיתה ד/ }), { pad: 8 }); await wait(4200)

    h.mark(); await h.caption(page, 3, 'עונים על שאלה במבחן האמריקאי ומקבלים הסבר'); await toSection('#quiz')
    await clickOn(page, page.locator('#quiz .grid button').first(), { pad: 8 }); await wait(4500)

    h.mark(); await h.caption(page, 4, 'קוראים את הקטע ובודקים תשובות בהבנת הנקרא'); await toSection('#reading')
    await clickOn(page, page.locator('#reading').getByRole('button', { name: 'הצגת תשובה' }).first(), { pad: 6 }); await wait(4200)

    h.mark(); await h.caption(page, 5, 'לומדים רמזור — "השלב הבא" מראה מה קורה לנהגים ולהולכי הרגל'); await toSection('#light')
    const next = page.getByRole('button', { name: /השלב הבא/ })
    await clickOn(page, next, { pad: 8 }); await wait(2800)
    await clickOn(page, next, { pad: 8 }); await wait(3500)

    h.mark(); await h.caption(page, 6, 'דף עבודה אונליין — "בטוח" או "מסוכן", עם הסבר'); await toSection('#online')
    await clickOn(page, page.locator('#online button', { hasText: 'בטוח' }).first(), { pad: 6 }); await wait(2500)
    await clickOn(page, page.locator('#online button', { hasText: 'מסוכן' }).first(), { pad: 6 }); await wait(3500)

    await toSection('#print'); await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 7, 'מדפיסים דפי עבודה — תצוגה מקדימה והדפסה')
    await clickOn(page, page.locator('#print').getByRole('button', { name: /הדפיסו את כל/ }), { pad: 8 }); await wait(800)
    await page.evaluate(() => { const c = document.getElementById('tut-cap'); c.setAttribute('popover', 'manual'); c.style.setProperty('top', 'auto'); c.style.setProperty('right', 'auto'); c.style.setProperty('width', 'max-content'); c.style.setProperty('height', 'auto'); c.style.setProperty('margin', '0'); c.style.setProperty('overflow', 'visible'); c.showPopover() }) // top layer: stays above the print dialog
    await wait(6000)
  },
}

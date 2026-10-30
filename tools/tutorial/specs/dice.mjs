// Tutorial: virtual dice (/tools/dice). Labels below are the real ones from src/pages/tools/dice/ClassicDice.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'dice',
  path: '/tools/dice',
  fullUrl: 'ugabuga.co.il/tools/dice',
  card: { title: 'איך מטילים קובייה<br>בעוגה בוגה', sub: 'קובייה וירטואלית: 1 עד 5 קוביות, סכום והיסטוריה' },
  endLine: 'קובייה וירטואלית להטלה בלחיצה — לכל משחק, בכל מכשיר',
  endWhere: 'באתר: כלים ← קובייה',
  zoom: 1.15,
  async steps(page, h) {
    const focus = async () => scrollTo(page, await page.evaluate(() => scrollY + document.querySelector('.cd-picker').getBoundingClientRect().top - 150), 700)
    const roll = page.getByRole('button', { name: /הטילו/ })
    const wait = ms => page.waitForTimeout(ms)
    const rolled = async () => { await roll.waitFor(); await page.waitForFunction(() => !document.querySelector('.cd-roll').disabled); await wait(2200) }

    await focus(); h.mark(); await h.caption(page, 1, 'פותחים את עמוד הקובייה — בלי הרשמה'); await wait(3500)
    h.mark(); await h.caption(page, 2, `בוחרים כמה קוביות צריך — למשל ${N(3)} קוביות`)
    await clickOn(page, page.getByRole('radio', { name: '3 קוביות' })); await wait(2200)
    await focus(); h.mark(); await h.caption(page, 3, 'לוחצים על "הטילו!" — הקוביות מתגלגלות')
    await clickOn(page, roll, { pad: 12 }); await rolled()
    h.mark(); await h.caption(page, 4, 'הסכום מחושב לבד — ואפשר להטיל שוב בנגיעה בקוביות')
    await clickOn(page, page.locator('.cd-arena'), { pad: 0, hold: 500 }); await rolled()
    await clickOn(page, page.locator('.cd-arena'), { pad: 0, hold: 300 }); await rolled()
    await focus(); h.mark(); await h.caption(page, 5, `רוצים יותר? עוברים ל־${N(5)} קוביות`)
    await clickOn(page, page.getByRole('radio', { name: '5 קוביות' })); await wait(1200)
    await clickOn(page, roll, { pad: 12 }); await rolled()
    h.mark(); await h.caption(page, 6, `מתחת רואים הטלות, סכום שיא, שישיות ו־${N(10)} ההטלות האחרונות`)
    await scrollTo(page, await page.evaluate(() => scrollY + document.querySelector('.cd-stats').getBoundingClientRect().top - 180), 1400); await wait(4500)
    h.mark(); await h.caption(page, 7, 'הקול מפריע? לוחצים על הרמקול ומכבים')
    await focus(); await wait(400)
    await clickOn(page, page.locator('.cd-sound')); await wait(2500)
  },
}

// Tutorial: printable cut-out hanukkiah (/holidays/hanukkah/cut-out-hanukkiah). Labels are the real ones from src/pages/holidays/HanukkiahCutOut.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'hanukkiah-cutout',
  path: '/holidays/hanukkah/cut-out-hanukkiah',
  fullUrl: 'ugabuga.co.il/holidays/hanukkah/cut-out-hanukkiah',
  card: { title: 'איך מכינים חנוכייה<br>לגזירה בעוגה בוגה', sub: 'מדפיסים שני דפים, גוזרים נרות ומדביקים נר בכל ערב' },
  endLine: 'חנוכייה להדפסה וגזירה — דף חנוכייה ודף עם 9 נרות',
  endWhere: 'באתר: חנוכה ← חנוכייה לגזירה',
  zoom: 1.3,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const goTo = async (loc, off = 200) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const top = async () => scrollTo(page, 0, 700)

    h.mark(); await h.caption(page, 1, `פותחים את החנוכייה לגזירה — שני דפים: חנוכייה ו־${N(9)} נרות`); await wait(3500)
    const pages = page.locator('button[aria-label^="הדפסה: דף"]')
    await goTo(pages.first(), 10); await wait(3500)

    h.mark(); await h.caption(page, 2, 'רוצים לצבוע לבד? עוברים לגרסה "לצביעה" — קווים בלבד')
    await top(); await wait(500)
    await clickOn(page, page.getByRole('button', { name: /לצביעה/ }), { pad: 8 }); await wait(900)
    await goTo(pages.first(), 10); await wait(3000)

    h.mark(); await h.caption(page, 3, 'ומחזירים לגרסה הצבעונית — מוכנה להדבקה')
    await top(); await wait(500)
    await clickOn(page, page.getByRole('button', { name: /צבעונית/ }), { pad: 8 }); await wait(900)
    await goTo(pages.first(), 10); await wait(2800)

    h.mark(); await h.caption(page, 4, 'איך מכינים: גוזרים את הנרות ותולים את החנוכייה')
    await goTo(page.getByRole('heading', { name: /איך מכינים/ }), 140); await wait(5000)

    h.mark(); await h.caption(page, 5, 'באיזה סדר מדביקים? נר ראשון מימין, וכל ערב נר חדש משמאל')
    await goTo(page.getByRole('heading', { name: /באיזה סדר/ }), 140); await wait(5000)

    await top(); await wait(900)
    h.mark(); await h.caption(page, 6, 'מדפיסים את שני הדפים בלחיצה אחת')
    await clickOn(page, page.locator('[data-print-main]'), { pad: 8 }); await wait(900)
    await page.evaluate(() => document.querySelector('dialog.buga-print-dialog')?.appendChild(document.getElementById('tut-root'))); await wait(5000)
  },
}

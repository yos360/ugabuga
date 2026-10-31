// Tutorial: printable escape room (/tools/escape-rooms). Labels are the real ones from src/pages/tools/EscapeRooms.jsx.
// Answers for the first room ("lost-cake", easy level) come from src/data/escapeRooms.js / escapeAdventure.js.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'escape-rooms',
  path: '/tools/escape-rooms',
  fullUrl: 'ugabuga.co.il/tools/escape-rooms',
  card: { title: 'איך משחקים ומדפיסים<br>חדר בריחה בעוגה בוגה', sub: 'בוחרים חדר ורמת קושי, פותרים חידות ומדפיסים קיט למנחה' },
  endLine: 'חדרי בריחה לילדים ולנוער — לשחק באתר או להדפיס ולהפעיל בבית ובכיתה',
  endWhere: 'באתר: להדפסה ← חדרי בריחה',
  zoom: 1.15,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/er-${n}.png` }) }
    const goTo = async (loc, off = 160) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const answer = page.locator('#escape-answer')
    const check = page.getByRole('button', { name: 'בדקו תשובה' })

    await goTo(page.getByRole('heading', { name: 'קודם בוחרים רמת קושי' }), 120)
    h.mark(); await h.caption(page, 1, 'פותחים את חדרי הבריחה ובוחרים רמת קושי — למשל "קל"'); await wait(2000)
    await clickOn(page, page.getByRole('button', { name: /^קל/ })); await wait(2200); await dbg(1)

    h.mark(); await h.caption(page, 2, 'בוחרים חדר מהרשימה — למשל "תעלומת העוגה הנעלמת"')
    await clickOn(page, page.getByRole('link', { name: /תעלומת העוגה הנעלמת/ }).first(), { pad: 8 }); await wait(2500); await dbg(2)

    await goTo(answer, 520); await wait(500)
    h.mark(); await h.caption(page, 3, 'קוראים את הסיפור וכותבים תשובה — טעות? אפשר לנסות שוב')
    await clickOn(page, answer); await answer.pressSequentially('אדום', { delay: 140 }); await wait(500)
    await clickOn(page, check, { pad: 12 }); await wait(2500); await dbg(3)

    h.mark(); await h.caption(page, 4, 'נתקעים? לוחצים "צריכים רמז?" וקוראים את הרמז')
    await clickOn(page, page.getByRole('button', { name: /צריכים רמז/ })); await wait(3500); await dbg(4)

    h.mark(); await h.caption(page, 5, 'התשובה הנכונה פותחת את המנעול — ועוברים לשלב הבא')
    await clickOn(page, answer); await answer.press('Control+a'); await answer.pressSequentially('צהוב', { delay: 140 }); await wait(500)
    await clickOn(page, check, { pad: 12 }); await wait(2500); await dbg(5)
    await clickOn(page, page.getByRole('button', { name: /ממשיכים לשלב הבא/ }), { pad: 10 }); await wait(2500); await dbg(6)

    h.mark(); await h.caption(page, 6, 'רוצים להפעיל על נייר? לוחצים "הצג קיט להפעלה"')
    await clickOn(page, page.getByRole('button', { name: 'הצג קיט להפעלה' })); await wait(1200)
    await goTo(page.getByRole('heading', { name: /קיט הפעלה למנחה/ }), 150); await wait(3500); await dbg(7)

    h.mark(); await h.caption(page, 7, 'ולוחצים "הדפסת הקיט" — דף מנחה עם כל התשובות וכרטיס לכל שלב')
    await clickOn(page, page.getByRole('button', { name: /הדפסת הקיט/ }).first(), { pad: 10 }); await wait(5000); await dbg(8)
  },
}

// Tutorial: Purim costume ideas bank (/holidays/purim/costumes). Labels are the real ones from src/pages/holidays/PurimCostumes.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'purim-costumes',
  path: '/holidays/purim/costumes',
  fullUrl: 'ugabuga.co.il/holidays/purim/costumes',
  card: { title: 'איך מוצאים רעיון<br>לתחפושת בעוגה בוגה', sub: 'מסננים לפי גיל, זמן, תקציב ולמי — ומקבלים חומרים ושלבים' },
  endLine: 'תחפושות לפורים — רעיונות ביתיים עם חומרים ושלבי הכנה',
  endWhere: 'באתר: פורים ← תחפושות',
  zoom: 1.3,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const goTo = async (loc, off = 200) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const top = async () => scrollTo(page, 0, 700)
    const chip = (group, re) => page.getByRole('group', { name: group }).getByRole('button', { name: re })

    h.mark(); await h.caption(page, 1, 'פותחים את מאגר התחפושות — מלא ברעיונות ביתיים'); await wait(3500)

    h.mark(); await h.caption(page, 2, `פורים מחר? לוחצים על "תחפושות של רבע שעה"`)
    await clickOn(page, page.getByRole('button', { name: /פורים מחר/ }), { pad: 8 }); await wait(900)
    await goTo(page.getByRole('heading', { level: 2 }).first(), 160); await wait(3000)

    await top(); await wait(800)
    h.mark(); await h.caption(page, 3, 'מוסיפים גיל — למשל "גן"')
    await clickOn(page, chip('גיל', /^🧸 גן/), { pad: 8 }); await wait(2800)

    h.mark(); await h.caption(page, 4, 'ורק ממה שיש בבית — בלי קניות ברגע האחרון')
    await clickOn(page, chip('תקציב', /רק ממה שיש בבית/), { pad: 8 }); await wait(3000)

    h.mark(); await h.caption(page, 5, 'מה יוצא? כל הרעיונות שמתאימים לכל הסינונים יחד')
    await goTo(page.getByRole('heading', { level: 2 }).first(), 160); await wait(3200)

    h.mark(); await h.caption(page, 6, 'פותחים רעיון — "מה צריך ואיך מכינים"')
    const sum = page.locator('summary', { hasText: 'מה צריך ואיך מכינים' }).first()
    await goTo(sum, 420); await wait(500)
    await clickOn(page, sum, { pad: 8 }); await wait(500)
    await goTo(sum, 360); await wait(5000)

    await top(); await wait(900)
    h.mark(); await h.caption(page, 7, 'מתחילים מחדש? "לנקות סינון" ובוחרים אחרת')
    await clickOn(page, page.getByRole('button', { name: /לנקות סינון/ }), { pad: 8 }); await wait(2800)
  },
}

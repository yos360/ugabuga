// Tutorial: parents' committee yearly budget (/vaad/budget). Labels are the real ones from src/pages/tools/group/VaadBudget.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'vaad-budget',
  path: '/vaad/budget',
  fullUrl: 'ugabuga.co.il/vaad/budget',
  card: { title: 'איך מתכננים תקציב<br>לוועד הורים בעוגה בוגה', sub: 'כמה גובים, על מה מוציאים, וכמה נשאר — החישוב מתעדכן לבד' },
  endLine: 'תקציב ועד הורים לשנה — לפי לוח השנה, עם חישוב אוטומטי',
  endWhere: 'באתר: ועד הורים ← תקציב שנתי',
  zoom: 1.3,
  async setup(ctx) {
    await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true }) })
  },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const goTo = async (loc, off = 200) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const setNum = async (loc, v, delay = 160) => { await clickOn(page, loc, { pad: 8 }); await loc.press('Control+a'); await loc.pressSequentially(String(v), { delay }); await wait(500) }
    const kids = page.locator('section input[type=number]').nth(0)
    const perKid = page.locator('section input[type=number]').nth(2)
    const top = async () => scrollTo(page, 0, 700)

    h.mark(); await h.caption(page, 1, 'פותחים את תקציב ועד ההורים — יש כבר תקציב לדוגמה לשנה'); await wait(3500)

    h.mark(); await h.caption(page, 2, `מזינים כמה ילדים בכיתה — למשל ${N(28)}`)
    await setNum(kids, 28); await wait(2200)

    h.mark(); await h.caption(page, 3, `קובעים כמה גובים מכל ילד — נתחיל מ־${N(120)} ₪`)
    await setNum(perKid, 120); await wait(2500)
    await page.locator('p[role=status]').first().waitFor({ timeout: 4000 }).catch(() => {})
    h.mark(); await h.caption(page, 4, 'לא מספיק? הכלי מזהיר ואומר כמה צריך לגבות לפחות'); await wait(3500)

    await setNum(perKid, 135); await wait(3000)

    h.mark(); await h.caption(page, 5, 'כל סעיף אפשר לשנות — סכום, ואם מחשבים לילד, לאיש צוות או סכום קבוע')
    const row = page.locator('div.rounded-2xl', { has: page.locator('input[aria-label="סעיף"]') }).filter({ has: page.locator('input[value^="חנוכה"]') }).first()
    await goTo(row, 380); await wait(700)
    await setNum(row.getByLabel('סכום', { exact: true }), 20); await wait(2800)

    h.mark(); await h.caption(page, 6, 'צריך סעיף נוסף? "הוספת סעיף" וממלאים שם וסכום')
    await clickOn(page, page.getByRole('button', { name: /הוספת סעיף/ }), { pad: 8 }); await wait(1000)
    const last = page.locator('div.rounded-2xl', { has: page.locator('input[aria-label="סעיף"]') }).last()
    await goTo(last, 420); await wait(500)
    await clickOn(page, last.getByLabel('סעיף', { exact: true }), { pad: 6 }); await last.getByLabel('סעיף', { exact: true }).press('Control+a'); await last.getByLabel('סעיף', { exact: true }).pressSequentially('טיול סוף שנה', { delay: 120 }); await wait(500)
    await setNum(last.getByLabel('סכום', { exact: true }), 40); await wait(500)
    await last.getByLabel('איך מחשבים').selectOption('kid'); await wait(2500)

    await top(); await wait(1200)
    h.mark(); await h.caption(page, 7, 'מוכן? שולחים בוואטסאפ, מעתיקים או מדפיסים את התקציב')
    await goTo(page.getByRole('button', { name: /העתקת הסיכום/ }), 600); await wait(600)
    await clickOn(page, page.getByRole('button', { name: /העתקת הסיכום/ }), { pad: 8 }); await wait(2200)
    await clickOn(page, page.getByRole('button', { name: '🖨️ הדפסה' }), { pad: 8 }); await wait(900)
    await page.evaluate(() => document.querySelector('dialog.buga-print-dialog')?.appendChild(document.getElementById('tut-root'))); await wait(4500)
  },
}

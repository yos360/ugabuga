// Tutorial: class scoreboard (/tools/scoreboard). Labels are the real ones from src/pages/tools/Scoreboard.jsx.
import { clickOn, typeSlow } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'scoreboard',
  path: '/tools/scoreboard',
  fullUrl: 'ugabuga.co.il/tools/scoreboard',
  card: { title: 'איך מנהלים לוח ניקוד<br>לתחרות בכיתה בעוגה בוגה', sub: 'מוסיפים קבוצות, סופרים נקודות, ורואים מי מוביל' },
  endLine: 'לוח ניקוד אונליין — נקודות בלחיצה, גביע למוביל ודירוג אוטומטי',
  endWhere: 'באתר: כלים ← לוח ניקוד',
  zoom: 1.5,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const input = page.getByPlaceholder('שם שחקן/קבוצה…')
    const row = name => page.locator('div.grid > div', { hasText: name })
    const plus = name => row(name).getByRole('button', { name: '+', exact: true })
    const minus = name => row(name).getByRole('button', { name: '-', exact: true })
    await page.evaluate(() => scrollTo(0, 340)); await wait(500)

    h.mark(); await h.caption(page, 1, 'כותבים שם של קבוצה או שחקן — שמות לדוגמה')
    await wait(900)
    await typeSlow(page, input, 'הנמרים', 150); await wait(700)
    await clickOn(page, page.getByRole('button', { name: '+ הוסיפו' }), { pad: 8 }); await wait(1500)

    h.mark(); await h.caption(page, 2, 'מוסיפים עוד קבוצות — אפשר גם לסיים ב־Enter')
    for (const n of ['הדולפינים', 'הצבים']) {
      await clickOn(page, input, { pad: 8, hold: 300 }); await input.pressSequentially(n, { delay: 140 }); await wait(400)
      await page.keyboard.press('Enter'); await wait(1100)
    }
    await wait(1500)

    h.mark(); await h.caption(page, 3, 'לוחצים + ומוסיפים נקודה')
    for (let i = 0; i < 3; i++) { await clickOn(page, plus('הנמרים'), { pad: 8, hold: 350 }); await wait(500) }
    await wait(1800)

    h.mark(); await h.caption(page, 4, 'למוביל מופיע גביע, והדירוג מתעדכן למטה')
    for (let i = 0; i < 2; i++) { await clickOn(page, plus('הדולפינים'), { pad: 8, hold: 350 }); await wait(500) }
    await wait(1200)
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await wait(2800)
    await page.evaluate(() => scrollTo(0, 340)); await wait(800)

    h.mark(); await h.caption(page, 5, 'טעות? לוחצים − ומורידים נקודה')
    await clickOn(page, minus('הנמרים'), { pad: 8 }); await wait(1800)
    for (let i = 0; i < 2; i++) { await clickOn(page, plus('הצבים'), { pad: 8, hold: 350 }); await wait(500) }
    await wait(1500)

    h.mark(); await h.caption(page, 6, 'מתחילים סיבוב חדש? "אפסו ניקוד"')
    const reset = page.getByRole('button', { name: /אפסו ניקוד/ })
    await reset.scrollIntoViewIfNeeded(); await wait(500)
    await clickOn(page, reset, { pad: 10 }); await wait(3200)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

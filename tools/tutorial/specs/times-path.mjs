// Tutorial: times-table path game (/learn/multiplication-game). Labels are the real ones from src/learn/TimesTablePath.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'times-path',
  path: '/learn/multiplication-game',
  fullUrl: 'ugabuga.co.il/learn/multiplication-game',
  card: { title: 'איך משחקים במשחק<br>לוח הכפל בעוגה בוגה', sub: 'מסלול שלבים עם כוכבים, משוב מיידי ודף תרגול להדפסה' },
  endLine: 'משחק לוח הכפל — שלב אחרי שלב, עם כוכבים ודף תרגול להדפסה',
  endWhere: 'באתר: לימוד ← לוח הכפל ← משחק לוח הכפל',
  zoom: 1.2,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const pad = k => page.locator('.ln-pad button', { hasText: new RegExp('^' + k + '$') }).first()
    const ask = async () => { const t = await page.locator('.ln-ex').innerText(); const m = t.match(/(\d+)\D+(\d+)/); return +m[1] * +m[2] }
    const typeOn = async (v, o = {}) => { for (const d of String(v)) await clickOn(page, pad(d), { pad: 8, hold: 250 }); await wait(250); await clickOn(page, page.locator('.ttp-check'), { pad: 8, hold: 300, ...o }) }
    const top = async () => scrollTo(page, await page.evaluate(() => scrollY + document.querySelector('.ttp-bar').getBoundingClientRect().top - 60), 600)

    h.mark(); await h.caption(page, 1, 'פותחים את משחק לוח הכפל — מסלול של שלבים, בלי הרשמה'); await wait(3500)
    h.mark(); await h.caption(page, 2, 'רוצים לבחור שלב לבד? פותחים את כל השלבים')
    await clickOn(page, page.getByRole('button', { name: /פתיחת כל השלבים/ })); await wait(1800)
    h.mark(); await h.caption(page, 3, 'גוללים במסלול ובוחרים שלב — למשל הלוח של 7')
    await scrollTo(page, await page.evaluate(() => scrollY + document.querySelector('.ttp-map').getBoundingClientRect().top - 200), 1200); await wait(1200)
    await clickOn(page, page.getByRole('button', { name: /^שלב \d+: הלוח של 7/ }), { pad: 12 }); await wait(1800)
    await top()
    h.mark(); await h.caption(page, 4, 'מקלידים את התשובה במקלדת שעל המסך ולוחצים ✓')
    await wait(1200)
    for (let i = 0; i < 2; i++) { await typeOn(await ask()); await wait(2000) }
    h.mark(); await h.caption(page, 5, 'טעות? רואים את התשובה הנכונה ודרך קצרה לחשב אותה')
    await wait(900)
    await typeOn((await ask()) + 1); await wait(4500)
    await top(); await wait(500)
    await clickOn(page, page.locator('.ttp-no button'), { pad: 10 }); await wait(1500)
    h.mark(); await h.caption(page, 6, `ממשיכים עד ${N(10)} תרגילים — ומקבלים כוכבים`)
    // remaining questions: quick keyboard answers
    for (let guard = 0; guard < 14; guard++) {
      if (await page.locator('.ttp-result').count()) break
      if (await page.locator('.ttp-no').count()) { await page.keyboard.press('Enter'); await wait(500); continue }
      const v = await ask(); await page.keyboard.type(String(v), { delay: 120 }); await wait(250); await page.keyboard.press('Enter'); await wait(1300)
    }
    await page.locator('.ttp-result').waitFor(); await wait(300); await top(); await wait(3500)
    h.mark(); await h.caption(page, 7, 'רוצים לתרגל על הנייר? מדפיסים דף תרגול עם תשובות')
    await clickOn(page, page.getByRole('button', { name: /דף תרגול לשלב/ })); await wait(900)
    // the print preview is a top-layer <dialog>: move the caption/ring/cursor into it so they stay visible
    await page.evaluate(() => document.querySelector('dialog.buga-print-dialog')?.appendChild(document.getElementById('tut-root'))); await wait(4500)
  },
}

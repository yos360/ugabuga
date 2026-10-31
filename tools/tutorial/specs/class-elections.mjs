// Tutorial: class elections (/tools/class-elections). Labels are the real ones from src/pages/tools/ClassElections.jsx.
import { clickOn, typeSlow, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'class-elections',
  path: '/tools/class-elections',
  fullUrl: 'ugabuga.co.il/tools/class-elections',
  card: { title: 'איך מקימים בחירות<br>בכיתה בעוגה בוגה', sub: 'בוחרים סוג בחירות, מדפיסים פתקים, מצביעים וסופרים קולות' },
  endLine: 'בחירות בכיתה — פתקים וקלפי להדפסה, הצבעה לדוגמה ותוצאות',
  endWhere: 'באתר: כלים ← בחירות בכיתה',
  zoom: 1.45,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/ce-${n}.png` }) }
    const goTo = async (sel, off = 120) => scrollTo(page, await page.locator(sel).first().evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const vote = async name => {
      await clickOn(page, page.locator('.ce-ballots button', { hasText: name }), { pad: 8, hold: 450 }); await wait(500)
      await clickOn(page, page.getByRole('button', { name: 'הכנסת הפתק לקלפי' }), { pad: 8, hold: 450 }); await wait(700)
    }

    h.mark(); await h.caption(page, 1, 'פותחים את "בחירות בכיתה" ובוחרים סוג בחירות'); await wait(2500)
    await goTo('.ce-mode-grid', 120); await wait(1500); await dbg(1)
    await clickOn(page, page.locator('.ce-mode').first(), { pad: 8 }); await wait(2000); await dbg(2)

    await goTo('.ce-panel', 100)
    h.mark(); await h.caption(page, 2, 'נותנים שם לבחירות וכותבים את המועמדים — שם בכל שורה')
    const title = page.locator('input[name=title]')
    await clickOn(page, title); await title.press('Control+a'); await title.pressSequentially('בחירות לוועד כיתה ב׳ 2', { delay: 130 }); await wait(1800); await dbg(3)
    await clickOn(page, page.getByRole('button', { name: /מכינים פתקים/ }), { pad: 10 }); await wait(2200)

    await goTo('.ce-panel', 100)
    h.mark(); await h.caption(page, 3, 'מדפיסים ערכה: פתקים לכל מועמד, שלט לקלפי ודף ספירה')
    await clickOn(page, page.getByRole('button', { name: /להדפסת ערכת בחירות/ }), { pad: 10 }); await wait(900)
    await page.evaluate(() => document.querySelector('dialog.buga-print-dialog')?.appendChild(document.getElementById('tut-root')))
    await wait(4500); await dbg(4)
    const closeBtn = page.getByRole('button', { name: 'סגירת תצוגת ההדפסה' })
    await closeBtn.evaluate(el => el.addEventListener('click', () => document.body.appendChild(document.getElementById('tut-root')), true))
    await clickOn(page, closeBtn, { pad: 8 }); await wait(1200)

    h.mark(); await h.caption(page, 4, 'ביום הבחירות לוחצים "מתחילים להצביע"')
    await clickOn(page, page.getByRole('button', { name: /מתחילים להצביע/ }), { pad: 10 }); await wait(1800)

    await goTo('.ce-ballots', 260)
    h.mark(); await h.caption(page, 5, 'כל ילד בוחר פתק אחד ומכניס אותו לקלפי')
    await wait(500)
    await vote('נועה'); await wait(900); await vote('איתי'); await wait(900); await vote('נועה'); await wait(1200); await dbg(5)

    h.mark(); await h.caption(page, 6, 'מי שלא החליט יכול להכניס פתק ריק — וסופרים בלחיצה')
    await clickOn(page, page.getByRole('button', { name: 'פתק ריק' }), { pad: 8 }); await wait(1500)
    await vote('מאיה'); await wait(800); await vote('נועה'); await wait(1200)
    await clickOn(page, page.getByRole('button', { name: /לספירה/ }), { pad: 8 }); await wait(1800)

    await goTo('.ce-panel', 100)
    h.mark(); await h.caption(page, 7, 'התוצאות מופיעות עם אחוזים — וסוגרים את הסבב'); await wait(3500); await dbg(7)
    await clickOn(page, page.getByRole('button', { name: 'סוגרים את הסבב' }), { pad: 10 }); await wait(3500); await dbg(8)
  },
}

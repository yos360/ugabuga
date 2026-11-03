// Tutorial: classroom math tic-tac-toe (/classroom/math-tic-tac-toe). Labels are the real ones from src/pages/classroom/MathTicTacToe.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'math-tic-tac-toe',
  path: '/classroom/math-tic-tac-toe',
  fullUrl: 'ugabuga.co.il/classroom/math-tic-tac-toe',
  card: { title: 'איך משחקים איקס־עיגול<br>חשבוני בעוגה בוגה', sub: 'שתי קבוצות, לוח אחד על המקרן — משבצת נכבשת רק בתשובה נכונה' },
  endLine: 'איקס־עיגול חשבוני לכיתה — חיבור, חיסור וכפל לפי כיתה',
  endWhere: 'באתר: לכיתה ← איקס־עיגול חשבוני',
  zoom: 1.0,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const sq = n => page.getByRole('button', { name: new RegExp(`משבצת ${n} ריקה`) })
    const solve = async () => { await page.screenshot({ path: "/tmp/dbg.png" }).catch(() => {}); // read the real exercise from the dialog and compute its answer
      const t = (await page.locator('#mttt-ex').innerText()).replace(/[⁦-⁩‎‏]/g, '')
      const m = t.match(/(\d+)\s*([+−×])\s*(\d+)/); const a = +m[1], b = +m[3]
      return String(m[2] === '+' ? a + b : m[2] === '−' ? a - b : a * b)
    }
    const answerTeacher = async () => { // teacher mode: show the answer, then ✓
      await wait(2200)
      await clickOn(page, page.getByRole('button', { name: /הצגת התשובה/ }), { pad: 8 }); await wait(1500)
      await clickOn(page, page.getByRole('button', { name: /✓ נכון/ }), { pad: 8 }); await wait(2200)
      await clickOn(page, page.getByRole('button', { name: /התור עובר/ }), { pad: 8 }); await wait(1000)
    }
    const answerTyped = async (slow = true) => {
      const ans = await solve(); const inp = page.locator('#mttt-answer')
      await clickOn(page, inp, { pad: 8, hold: slow ? 600 : 250 }); await inp.pressSequentially(ans, { delay: slow ? 220 : 90 }); await wait(slow ? 800 : 300)
      await clickOn(page, page.getByRole('button', { name: 'בדיקה' }), { pad: 8, hold: slow ? 600 : 250 }); await wait(slow ? 2000 : 1100)
      await clickOn(page, page.getByRole('button', { name: /התור עובר|לתוצאה/ }), { pad: 8, hold: slow ? 500 : 250 }); await wait(slow ? 1000 : 600)
    }
    await page.evaluate(() => setInterval(() => { // hide the site's floating widgets (share bubble, cast, scroll-up) so they don't cover the board
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog],#root>div>section')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const nameInputs = page.locator('section[aria-label="הגדרות המשחק"] input')

    h.mark(); await h.caption(page, 1, 'פותחים את המשחק — לוח אחד ושתי קבוצות'); await wait(3500)

    h.mark(); await h.caption(page, 2, 'נותנים שמות לקבוצות — למשל "הדובים" ו"הנמרים"')
    for (const [i, nm] of [[0, 'הדובים'], [1, 'הנמרים']]) {
      const el = nameInputs.nth(i); await clickOn(page, el, { pad: 8 }); await el.press('Control+a'); await el.pressSequentially(nm, { delay: 170 }); await wait(500)
    }
    await wait(1500)

    h.mark(); await h.caption(page, 3, `בוחרים נושא וכיתה — לוח הכפל, כיתה ${N('ג׳')}`)
    await clickOn(page, page.getByRole('group', { name: 'נושא' }).getByRole('button', { name: /לוח הכפל/ }), { pad: 8 }); await wait(700)
    await clickOn(page, page.getByRole('group', { name: 'כיתה' }).getByRole('button', { name: /ג׳/ }), { pad: 8 }); await wait(2300)

    h.mark(); await h.caption(page, 4, 'הקבוצה שבתור בוחרת משבצת — ומקבלת תרגיל')
    await scrollTo(page, 260, 900); await wait(500)
    await clickOn(page, sq(1), { pad: 8 }); await wait(1000)

    h.mark(); await h.caption(page, 5, 'המורה בודק/ת: מציגים תשובה ולוחצים ✓ — המשבצת נכבשת')
    await answerTeacher()

    h.mark(); await h.caption(page, 6, 'מעדיפים שהכיתה תענה? "הכיתה מקלידה תשובה" והמשחק בודק לבד')
    await scrollTo(page, 0, 800); await wait(400)
    await clickOn(page, page.getByRole('button', { name: /הכיתה מקלידה תשובה/ }), { pad: 8 }); await wait(1500)
    await scrollTo(page, 260, 800); await wait(400)
    await clickOn(page, sq(5), { pad: 8 }); await wait(1200)
    await answerTyped(true)

    h.mark(); await h.caption(page, 7, 'שלושה בשורה — ניצחון בסיבוב, והניקוד נשמר לסיבוב הבא')
    await clickOn(page, sq(2), { pad: 8 }); await wait(700); await answerTyped(false)
    await clickOn(page, sq(9), { pad: 8 }); await wait(700); await answerTyped(false)
    await clickOn(page, sq(3), { pad: 8 }); await wait(700); await answerTyped(false)
    await wait(3500)
  },
}

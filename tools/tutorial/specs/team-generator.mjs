// Tutorial: team generator (/tools/team-generator). Labels are the real ones from src/pages/tools/TeamGenerator.jsx.
import { clickOn, typeSlow, scrollTo } from '../overlay.mjs'

export default {
  slug: 'team-generator',
  path: '/tools/team-generator',
  fullUrl: 'ugabuga.co.il/tools/team-generator',
  card: { title: 'איך מחלקים לקבוצות<br>בעוגה בוגה', sub: 'כותבים שמות, בוחרים כמה קבוצות, ולוחצים "חלקו!"' },
  endLine: 'מחלק קבוצות — חלוקה הוגנת לכיתה, לחוג ולמסיבה',
  endWhere: 'באתר: כלים ← מחלק קבוצות',
  zoom: 1.25,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const showTeams = async () => scrollTo(page, await page.evaluate(() => scrollY + [...document.querySelectorAll('h3')].find(e => e.textContent.includes('קבוצה 1')).getBoundingClientRect().top - 120), 900)
    const names = ['נועה', 'איתי', 'מיכל', 'דניאל', 'תמר', 'עומר', 'שירה', 'יונתן']

    h.mark(); await h.caption(page, 1, 'בוחרים כמה קבוצות רוצים — למשל ⁦3⁩')
    await wait(1800)
    await clickOn(page, page.getByRole('button', { name: '3 קבוצות' }), { pad: 10 }); await wait(2200)

    h.mark(); await h.caption(page, 2, 'כותבים שם בכל שורה — שמות לדוגמה בלבד')
    for (let i = 0; i < names.length; i++) {
      if (i > 0) { await clickOn(page, page.getByRole('button', { name: '+ הוסיפו שם' }), { pad: 8, hold: 250 }) }
      const inp = page.getByLabel(`שם משתתף ${i + 1}`)
      await clickOn(page, inp, { pad: 8, hold: 250 }); await inp.pressSequentially(names[i], { delay: 130 }); await wait(250)
    }
    await wait(2200)

    h.mark(); await h.caption(page, 3, 'לוחצים "חלקו!" — והקבוצות מוכנות')
    const go = page.getByRole('button', { name: /חלקו!/ })
    await go.scrollIntoViewIfNeeded(); await wait(500)
    await clickOn(page, go, { pad: 10 }); await wait(1200)
    await showTeams(); await wait(2800)

    h.mark(); await h.caption(page, 4, 'לא מרוצים? לוחצים שוב ומקבלים חלוקה אחרת')
    await clickOn(page, go, { pad: 10 }); await wait(1200)
    await showTeams(); await wait(3000)

    h.mark(); await h.caption(page, 5, 'צריך עוד שם? "הוסיפו שם", ומחלקים מחדש')
    const add = page.getByRole('button', { name: '+ הוסיפו שם' })
    await clickOn(page, add, { pad: 8 })
    const inp9 = page.getByLabel('שם משתתף 9')
    await clickOn(page, inp9, { pad: 8 }); await inp9.pressSequentially('רוני', { delay: 140 }); await wait(1200)
    await clickOn(page, go, { pad: 10 }); await wait(1200)
    await showTeams(); await wait(3000)

    h.mark(); await h.caption(page, 6, 'עוברים ל־⁦2⁩ קבוצות ומחלקים שוב')
    await scrollTo(page, 0, 900); await wait(600)
    await clickOn(page, page.getByRole('button', { name: '2 קבוצות' }), { pad: 10 }); await wait(1000)
    await go.scrollIntoViewIfNeeded(); await wait(400)
    await clickOn(page, go, { pad: 10 }); await wait(1200)
    await showTeams(); await wait(3200)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

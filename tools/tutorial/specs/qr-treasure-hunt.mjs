// Tutorial: QR treasure hunt (/treasure-hunt/qr). Labels are the real ones from src/pages/tools/QrTreasureHunt.jsx.
import { clickOn, typeSlow, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`
const enc = o => Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export default {
  slug: 'qr-treasure-hunt',
  path: '/treasure-hunt/qr',
  fullUrl: 'ugabuga.co.il/treasure-hunt/qr',
  card: { title: 'איך מכינים ציד אוצרות<br>עם QR בעוגה בוגה', sub: 'רמזים, קודי QR להדפסה, וסריקה בטלפון' },
  endLine: 'ציד אוצרות עם קודי QR — כותבים רמזים, מדפיסים ומחביאים',
  endWhere: 'באתר: משחקים ← ציד אוצרות QR',
  zoom: 1.3,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const hide = () => page.evaluate(() => { clearInterval(window.__hide); window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed') el.style.setProperty('display', 'none', 'important') })
    }, 300) })
    await hide()
    const to = async (sel, edge, off, ms = 1200) => { const y = await page.evaluate(([sel, edge, off]) => { const r = document.querySelector(sel).getBoundingClientRect(); return scrollY + (edge === 'top' ? r.top - off : r.bottom - off) }, [sel, edge, off]); await scrollTo(page, y, ms) }
    const title = 'ציד האוצר של נועה'
    const clues = ['חפשו במקום שבו שומרים דברים קרים.', 'מצאו את המקום שבו נחים בלילה.', 'כל הכבוד! האוצר מחכה ממש לידכם.']
    const clue1 = 'חפשו מתחת לכרית הכי רכה בסלון.'

    await to('section.no-print', 'top', 60, 400)
    h.mark(); await h.caption(page, 1, 'כותבים שם למשחק — למשל "ציד האוצר של נועה"'); await wait(1500)
    const name = page.getByLabel('שם המשחק')
    await clickOn(page, name, { pad: 8 }); await page.keyboard.press('Control+a'); await name.pressSequentially(title, { delay: 120 }); await wait(2000)

    h.mark(); await h.caption(page, 2, 'כותבים את הרמז הראשון — הוא נפתח בסריקה הראשונה')
    const ta = page.locator('textarea').first()
    await to('textarea', 'top', 330, 700); await wait(500)
    await clickOn(page, ta, { pad: 6, hold: 300 }); await page.keyboard.press('Control+a'); await ta.pressSequentially(clue1, { delay: 100 }); await wait(2200)

    h.mark(); await h.caption(page, 3, `רוצים עוד תחנה? לוחצים "הוספת תחנה" — עד ${N(8)} תחנות`)
    const add = page.getByRole('button', { name: /הוספת תחנה/ })
    await to('button.bg-emerald-500', 'top', 560, 800); await wait(300)
    await clickOn(page, add, { pad: 8 }); await wait(900)
    const ta4 = page.locator('textarea').nth(3)
    await clickOn(page, ta4, { pad: 6, hold: 300 }); await ta4.pressSequentially('הסתכלו איפה מכינים ארוחת בוקר.', { delay: 100 }); await wait(2200)

    h.mark(); await h.caption(page, 4, 'לוחצים "יצירת קודי QR" — לכל תחנה קוד משלה')
    const gen = page.getByRole('button', { name: /יצירת קודי QR/ })
    await clickOn(page, gen, { pad: 10 }); await wait(1500)
    await to('article', 'top', 30, 1300); await wait(3500)

    h.mark(); await h.caption(page, 5, 'מדפיסים את התחנות, גוזרים ומחביאים לפי סדר הרמזים')
    await to('button.bg-violet-600', 'top', 330, 800).catch(() => {}); await wait(400)
    const pr = page.getByRole('button', { name: /הדפסת התחנות/ })
    const box = await pr.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 })
    await wait(3000)

    h.mark(); await h.caption(page, 6, 'המשתתפים סורקים בטלפון ורואים רק את הרמז של התחנה')
    const tok = enc({ v: 2, t: title, i: 0, n: 4, c: clue1 })
    await h.goto('/treasure-hunt/qr/play?s=' + tok); await hide()
    await h.caption(page, 6, 'המשתתפים סורקים בטלפון ורואים רק את הרמז של התחנה'); await wait(4500)
    const tokLast = enc({ v: 2, t: title, i: 3, n: 4, c: 'הסתכלו איפה מכינים ארוחת בוקר.' })
    h.mark(); await h.caption(page, 7, 'בתחנה האחרונה מחכה האוצר — ואפשר להתחיל לשחק!')
    await h.goto('/treasure-hunt/qr/play?s=' + tokLast); await hide()
    await h.caption(page, 7, 'בתחנה האחרונה מחכה האוצר — ואפשר להתחיל לשחק!'); await wait(4500)
  },
}

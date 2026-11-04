// Tutorial: bingo maker (/tools/bingo-maker). Labels are the real ones from src/pages/tools/BingoMaker.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'bingo-maker',
  path: '/tools/bingo-maker',
  fullUrl: 'ugabuga.co.il/tools/bingo-maker',
  card: { title: 'איך יוצרים כרטיסי בינגו<br>בעוגה בוגה', sub: 'נושא, גודל לוח, ו־6 כרטיסים להדפסה' },
  endLine: 'מחולל בינגו — כרטיסים להיכרות, למסיבה ולכיתה, להדפסה',
  endWhere: 'באתר: משחקים ← בינגו',
  zoom: 1.4,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const btn = name => page.getByRole('button', { name })
    const top = () => scrollTo(page, 0, 700)
    const to = async (sel, edge, off, ms = 1200) => { const y = await page.evaluate(([sel, edge, off]) => { const r = document.querySelector(sel).getBoundingClientRect(); return scrollY + (edge === 'top' ? r.top - off : r.bottom - off) }, [sel, edge, off]); await scrollTo(page, y, ms) }

    h.mark(); await h.caption(page, 1, 'בוחרים נושא — למשל "יום הולדת"'); await wait(2000)
    await clickOn(page, btn(/🎂 יום הולדת/), { pad: 8 }); await wait(1800)

    h.mark(); await h.caption(page, 2, 'בוחרים גודל לוח — כאן ' + N('3×3'))
    await clickOn(page, btn(/^3×3/), { pad: 8 }); await wait(1800)
    await to('section.mb-8', 'top', 40); await wait(3000)

    h.mark(); await h.caption(page, 3, 'לוחצים "צרו 6 כרטיסים!" ומקבלים כרטיסים שונים')
    await top(); await wait(300)
    await clickOn(page, btn(/צרו 6 כרטיסים/), { pad: 10 }); await wait(1200)
    await to('.buga-fade-in .grid', 'top', 40).catch(() => {}); await wait(3200)

    h.mark(); await h.caption(page, 4, 'רוצים פריטים משלכם? בוחרים "מותאם אישית"')
    await top(); await wait(400)
    await clickOn(page, btn(/✏️ מותאם אישית/), { pad: 8 }); await wait(2000)

    h.mark(); await h.caption(page, 5, `כותבים פריט בכל שורה — צריך ${N('9')} לפחות`)
    const ta = page.getByRole('textbox', { name: /רשימת פריטים/ })
    await to('textarea', 'top', 260); await wait(500)
    await clickOn(page, ta, { pad: 6, hold: 300 })
    const items = ['נועה', 'דניאל', 'מאיה', 'איתי', 'תמר', 'יובל', 'שירה', 'עומר', 'ליאור']
    for (const it of items) { await ta.pressSequentially(it + '\n', { delay: 110 }) }
    await wait(500)
    await clickOn(page, btn(/הוסיפו לרשימה/), { pad: 8 }); await wait(2200)

    h.mark(); await h.caption(page, 6, 'יוצרים — והכרטיסים שלכם מוכנים')
    await clickOn(page, btn(/צרו 6 כרטיסים/), { pad: 10 }); await wait(1200)
    await to('.buga-fade-in .grid', 'top', 40).catch(() => {}); await wait(3500)

    await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 7, 'לוחצים "הדפיסו כרטיסים" ומקבלים דפי A4')
    await clickOn(page, page.locator('[data-print-main]'), { pad: 10 }); await page.evaluate(() => { document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:850px!important;margin-top:24px!important}'; document.head.appendChild(st) }); await wait(6000)
  },
}

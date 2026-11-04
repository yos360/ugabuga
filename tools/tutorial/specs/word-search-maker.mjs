// Tutorial: word search maker (/tools/word-search-maker). Labels are the real ones from src/pages/tools/WordSearchMaker.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'word-search-maker',
  path: '/tools/word-search-maker',
  fullUrl: 'ugabuga.co.il/tools/word-search-maker',
  card: { title: 'איך יוצרים תפזורת<br>בעוגה בוגה', sub: 'חבילה מוכנה או מילים משלכם — ומדפיסים' },
  endLine: 'מחולל תפזורות בעברית — חבילות מוכנות או מילים משלכם, להדפסה',
  endWhere: 'באתר: כלים ← תפזורת',
  zoom: 1.45,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const btn = name => page.getByRole('button', { name })
    const top = () => scrollTo(page, 0, 700)
    const to = async (sel, edge, off, ms = 1200) => { const y = await page.evaluate(([sel, edge, off]) => { const r = document.querySelector(sel).getBoundingClientRect(); return scrollY + (edge === 'top' ? r.top - off : r.bottom - off) }, [sel, edge, off]); await scrollTo(page, y, ms) }

    h.mark(); await h.caption(page, 1, 'בוחרים נושא מוכן — למשל "חיות"'); await wait(2000)
    await clickOn(page, btn(/🐾 חיות/), { pad: 8 }); await wait(1800)

    h.mark(); await h.caption(page, 2, 'לוחצים "צרו תפזורת!" ומקבלים לוח חדש')
    await clickOn(page, btn(/צרו תפזורת/), { pad: 10 }); await wait(1200)
    await to('.grid.w-full', 'top', 40); await wait(3200)

    h.mark(); await h.caption(page, 3, 'מתחת ללוח — רשימת המילים לחיפוש')
    await to('.font-hand', 'bottom', 900); await wait(3500)

    h.mark(); await h.caption(page, 4, 'רוצים מילים משלכם? בוחרים "מותאם אישית"')
    await top(); await wait(400)
    await clickOn(page, btn(/✏️ מותאם אישית/), { pad: 8 }); await wait(2000)

    h.mark(); await h.caption(page, 5, `כותבים ${N('4')} מילים או יותר — כאן שמות הכיתה`)
    await to('.border-dashed', 'top', 60); await wait(600)
    const words = ['נועה', 'דניאל', 'מאיה', 'איתי', 'תמר']
    for (let i = 0; i < words.length; i++) {
      const inp = page.getByPlaceholder(`מילה ${i + 1}...`)
      await clickOn(page, inp, { pad: 6, hold: 300 }); await inp.pressSequentially(words[i], { delay: 170 }); await wait(500)
    }
    await wait(1200)

    h.mark(); await h.caption(page, 6, 'יוצרים — והתפזורת שלכם מוכנה')
    await to('main, #root', 'top', 0, 500).catch(() => {}); await clickOn(page, btn(/צרו תפזורת/), { pad: 10 }); await wait(1200)
    await to('.grid.w-full', 'top', 30); await wait(2500)
    await to('.font-hand', 'bottom', 900); await wait(2500)

    await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 7, 'לוחצים "הדפיסו" ומקבלים דף A4 מוכן')
    await clickOn(page, page.locator('[data-print-main]'), { pad: 10 }); await page.evaluate(() => { document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:850px!important;margin-top:24px!important}'; document.head.appendChild(st) }); await wait(6000)
  },
}

// Tutorial: crossword maker (/tools/crossword-maker). Labels are the real ones from src/pages/tools/PuzzleStudio.jsx.
import { clickOn, scrollTo, ring, unring } from '../overlay.mjs'
import { PACKS } from '/root/ugabuga/src/data/puzzlePacks.js'
const N = n => `⁦${n}⁩`

export default {
  slug: 'crossword-maker',
  path: '/tools/crossword-maker',
  fullUrl: 'ugabuga.co.il/tools/crossword-maker',
  card: { title: 'איך פותרים ובונים תשבץ<br>בעברית בעוגה בוגה', sub: 'בוחרים נושא, פותרים על המסך, בונים תשבץ משלכם ומדפיסים' },
  endLine: 'תשבץ בעברית — פותרים אונליין, בונים תשבץ אישי ומדפיסים',
  endWhere: 'באתר: כלים ← תשבצים וחידות',
  zoom: 1.4,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const btn = name => page.getByRole('button', { name })
    const to = async (sel, edge, off, ms = 1000) => { const y = await page.evaluate(([sel, edge, off]) => { const r = document.querySelector(sel).getBoundingClientRect(); return scrollY + (edge === 'top' ? r.top - off : r.bottom - off) }, [sel, edge, off]); await scrollTo(page, y, ms) }
    const bank = PACKS.birthday.words

    h.mark(); await h.caption(page, 1, 'בוחרים נושא לתשבץ — למשל "יום הולדת"')
    await to('.puzzle-controls', 'top', 120); await wait(1200)
    const sel = page.locator('.puzzle-controls select')
    await clickOn(page, sel, { pad: 8 }); await sel.selectOption('birthday'); await wait(2200)

    h.mark(); await h.caption(page, 2, 'לוחצים על רמז כדי לבחור מילה')
    await to('.puzzle-paper-title', 'top', 100); await wait(800)
    const clueBtn = page.locator('.crossword-clues ol li button').nth(1)
    await clickOn(page, clueBtn, { pad: 8 }); await wait(1800)

    h.mark(); await h.caption(page, 3, 'כותבים את התשובה — האותיות מתקדמות לבד')
    const txt = (await page.locator('.active-clue span').first().innerText()).replace(/\s*\(\d+\)\s*$/, '').trim()
    const word = bank.find(([, c]) => c === txt)?.[0]
    if (!word) throw new Error('clue not found: ' + txt)
    await page.keyboard.type(word.replace(/\s/g, ''), { delay: 450 }); await wait(2200)

    h.mark(); await h.caption(page, 4, 'לוחצים "בדקו תשובות" — ורואים כמה אותיות נכונות')
    const chk = btn('בדקו תשובות')
    await to('.puzzle-actions', 'bottom', 600); await wait(300)
    await clickOn(page, chk, { pad: 10 }); await wait(3000)

    h.mark(); await h.caption(page, 5, 'רוצים תשבץ משלכם? לוחצים "בנו תשבץ משלכם"')
    await to('.puzzle-controls', 'top', 120); await wait(500)
    await clickOn(page, btn(/בנו תשבץ משלכם/), { pad: 8 }); await wait(2000)

    h.mark(); await h.caption(page, 6, 'כותבים רמז ותשובה — למשל "ילדה" ו"נועה"')
    await to('.crossword-builder-rows', 'top', 200); await wait(600)
    const rows = page.locator('.crossword-builder-row')
    const clue = rows.nth(0).locator('input').nth(0), ans = rows.nth(0).locator('input').nth(1)
    await clickOn(page, clue, { pad: 6, hold: 300 }); await clue.fill(''); await clue.pressSequentially('ילדה מהכיתה', { delay: 150 }); await wait(500)
    await clickOn(page, ans, { pad: 6, hold: 300 }); await ans.fill(''); await ans.pressSequentially('נועה', { delay: 200 }); await wait(1800)

    h.mark(); await h.caption(page, 7, 'לוחצים "צרו את החידה" — התשבץ שלכם מוכן')
    const make = btn('צרו את החידה')
    await clickOn(page, make, { pad: 10 }); await wait(1200)
    await to('.puzzle-paper-title', 'top', 100); await wait(3200)

    await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 8, 'ולבסוף "הדפסה" — דף מוכן למילוי בעיפרון')
    await to('.puzzle-actions', 'bottom', 600); await wait(300)
    await clickOn(page, page.locator('.puzzle-actions button').nth(1), { pad: 10 })
    await page.evaluate(() => { document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:850px!important;margin-top:24px!important}'; document.head.appendChild(st) }); await wait(6000)
  },
}

// Tutorial: reading comprehension (/learn/reading). Labels are the real ones from src/learn/LearnPages.jsx (ReadingIndex / ReadingGrade / ReadingExercise).
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'reading',
  path: '/learn/reading',
  fullUrl: 'ugabuga.co.il/learn/reading',
  card: { title: 'איך עושים הבנת הנקרא<br>בעוגה בוגה', sub: 'בוחרים כיתה וקטע, עונים על שאלות — ומדפיסים עם דף תשובות' },
  endLine: 'הבנת הנקרא לכיתות א׳–ח׳ — קטעים עם שאלות ודף תשובות',
  endWhere: 'באתר: לומדים ← הבנת הנקרא',
  zoom: 1.2,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => { // hide the site's floating widgets so they don't cover the page
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))

    h.mark(); await h.caption(page, 1, 'פותחים את הבנת הנקרא ובוחרים כיתה'); await wait(2500)
    await scrollTo(page, 330, 900); await wait(500)
    await clickOn(page, page.locator('main a, a').filter({ hasText: /^\s*כיתה ג׳/ }).first(), { pad: 10 }); await wait(2500)

    h.mark(); await h.caption(page, 2, 'בוחרים קטע — למשל "הגמל — חבר של המדבר"')
    await wait(800)
    await clickOn(page, page.getByRole('tab', { name: /הגמל — חבר של המדבר/ }), { pad: 8 }); await wait(2200)

    h.mark(); await h.caption(page, 3, 'קוראים את הקטע — אפשר אותיות גדולות, ניקוד ומילון')
    await scrollTo(page, 760, 1200); await wait(1200)
    await clickOn(page, page.getByRole('button', { name: /אותיות גדולות/ }), { pad: 8 }); await wait(2000)
    const word = page.locator('.ln-dict-word').first()
    if (await word.count()) { await clickOn(page, word, { pad: 6 }); await wait(2200) }
    await clickOn(page, page.getByRole('button', { name: /אותיות גדולות/ }), { pad: 8 }); await wait(800)

    h.mark(); await h.caption(page, 4, 'עונים על השאלות — בוחרים תשובה בכל שאלה')
    await scrollTo(page, 1700, 1400); await wait(900)
    const qs = page.locator('.ln-q'); const correct = [1, 1, 1, 1]
    for (let i = 0; i < 4; i++) {
      const q = qs.nth(i)
      await q.scrollIntoViewIfNeeded(); await wait(500)
      await clickOn(page, q.locator('button.ln-opt').nth(correct[i]), { pad: 6, hold: 500 }); await wait(900)
    }

    h.mark(); await h.caption(page, 5, 'לוחצים "בדיקה" ורואים ציון ותשובות נכונות')
    await clickOn(page, page.getByRole('button', { name: /^✓ בדיקה/ }), { pad: 10 }); await wait(2800)

    h.mark(); await h.caption(page, 6, 'בשאלות הפתוחות אפשר להציג תשובה אפשרית')
    await clickOn(page, page.getByRole('button', { name: /הצגת תשובות לשאלות הפתוחות/ }), { pad: 10 }); await wait(3200)

    await page.evaluate(() => clearInterval(window.__hide))
    h.mark(); await h.caption(page, 7, 'מדפיסים את הקטע עם דף תשובות להורה או למורה')
    await page.locator('.ln-chip', { hasText: 'להדפסה עם דף תשובות' }).scrollIntoViewIfNeeded(); await wait(600)
    await clickOn(page, page.locator('button', { hasText: 'להדפסה עם דף תשובות' }).first(), { pad: 8 }); await page.evaluate(() => { document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:850px!important;margin-top:24px!important}'; document.head.appendChild(st) }); await wait(6000)
  },
}

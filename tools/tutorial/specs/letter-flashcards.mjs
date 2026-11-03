// Tutorial: printable letter flashcards (/printables/letter-flashcards). Labels are the real ones from src/pages/printables/LetterFlashcards.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'letter-flashcards',
  path: '/printables/letter-flashcards',
  fullUrl: 'ugabuga.co.il/printables/letter-flashcards',
  card: { title: 'איך מכינים כרטיסיות<br>אותיות בעוגה בוגה', sub: 'בוחרים שפה וסגנון, ומדפיסים — ' + N(8) + ' כרטיסיות בכל דף' },
  endLine: 'כרטיסיות אותיות להדפסה — עברית ואנגלית, עם תמונה ומילה',
  endWhere: 'באתר: דפים להדפסה ← כרטיסיות אותיות',
  zoom: 1.2,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const radio = name => page.getByRole('radio', { name })
    const top = () => scrollTo(page, 330, 800)

    h.mark(); await h.caption(page, 1, 'פותחים את כרטיסיות האותיות — בוחרים עברית או אנגלית'); await top(); await wait(2200)
    await clickOn(page, radio(/אנגלית A–Z/), { pad: 8 }); await wait(2200)
    await clickOn(page, radio(/עברית א–ת/), { pad: 8 }); await wait(2200)

    h.mark(); await h.caption(page, 2, 'בוחרים סגנון — אות, תמונה ומילה, או אות גדולה בלבד')
    await clickOn(page, radio(/אות בלבד/), { pad: 8 }); await wait(2600)
    await clickOn(page, radio(/אות \+ תמונה \+ מילה/), { pad: 8 }); await wait(2200)

    h.mark(); await h.caption(page, 3, 'צבעוני לגזירה, או שחור־לבן — שהילדים יצבעו בעצמם')
    await clickOn(page, radio(/שחור־לבן/), { pad: 8 }); await wait(2800)
    await clickOn(page, radio(/צבעוני/), { pad: 8 }); await wait(2000)

    h.mark(); await h.caption(page, 4, `כך נראים הדפים — ${N(8)} כרטיסיות בכל דף, עם קווי גזירה`)
    await scrollTo(page, 760, 1200); await wait(4500)

    h.mark(); await h.caption(page, 5, 'לוחצים על דף כדי לפתוח אותו להדפסה לבד')
    await top(); await wait(300); await scrollTo(page, 760, 600)
    await clickOn(page, page.getByRole('button', { name: /פתחו את דף 1/ }), { pad: 8 }); await wait(500)
    await page.evaluate(() => { clearInterval(window.__hide); document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:850px!important;margin-top:24px!important}'; document.head.appendChild(st) }); await wait(5500)
    await page.keyboard.press('Escape'); await wait(1200)

    h.mark(); await h.caption(page, 6, 'או מדפיסים את כל הכרטיסיות בלחיצה אחת')
    await top(); await wait(500)
    await clickOn(page, page.locator('[data-print-main]'), { pad: 10 }); await wait(500)
    await page.evaluate(() => { document.documentElement.appendChild(document.getElementById('tut-root')) }); await wait(6000)
  },
}

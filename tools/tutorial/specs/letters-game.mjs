// Tutorial: letters game for kids (/letters/game). Labels are the real ones from src/components/letters/LettersGame.jsx.
import { clickOn } from '../overlay.mjs'
const N = n => `⁦${n}⁩`
const { HEBREW } = await import('file:///root/ugabuga/src/data/letterLearning.js')

export default {
  slug: 'letters-game',
  path: '/letters/game',
  fullUrl: 'ugabuga.co.il/letters/game',
  card: { title: 'איך משחקים במשחק<br>אותיות בעוגה בוגה', sub: 'שלושה משחקים קצרים לגן ולכיתה א׳ — עם כוכבים בסוף' },
  endLine: 'משחק אותיות בעברית — ' + N('10') + ' שאלות בכל סבב, עם קול לכל אות',
  endWhere: 'באתר: לימוד אותיות ← משחק אותיות',
  zoom: 1.25,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const game = page.locator('section[dir=rtl]').filter({ has: page.locator('[aria-label="סוג המשחק"]') })
    const radio = name => game.getByRole('radio', { name })
    const qLetter = async () => (await game.locator('p.font-display b').first().innerText()).trim()
    const optBy = label => game.getByRole('button', { name: label, exact: true })
    const answer = async () => { // the right button for the current question, whatever the mode
      const mode = await game.locator('[role=radio][aria-checked=true]').first().innerText()
      if (mode.includes('מצאו')) return optBy('האות ' + await qLetter())
      if (mode.includes('איך קוראים')) { const l = await qLetter(); return optBy(HEBREW.find(x => x.l === l).name) }
      const word = (await game.locator('p.mt-2').first().textContent()).trim()
      return optBy('האות ' + word[0])
    }
    const wrongOne = async () => {
      const right = await (await answer()).getAttribute('aria-label')
      const labels = await game.locator('div.grid button:not([disabled])').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label')))
      return optBy(labels.find(l => l !== right))
    }
    const scrollView = async () => { await game.evaluate(el => el.scrollIntoView({ block: 'start' })); await page.evaluate(() => scrollBy(0, -14)) }
    await scrollView(); await wait(600)

    h.mark(); await h.caption(page, 1, 'בוחרים סוג משחק — "מצאו את האות"')
    await wait(1200); await clickOn(page, radio(/מצאו את האות/)); await wait(1000); await scrollView(); await wait(900)

    h.mark(); await h.caption(page, 2, 'ובוחרים אילו אותיות — למשל "א–כ"')
    await wait(1000); await clickOn(page, game.getByRole('radio', { name: 'א–כ' })); await wait(1000); await scrollView(); await wait(1200)

    h.mark(); await h.caption(page, 3, 'קוראים את השאלה ולוחצים על האות הנכונה')
    await wait(1800); await clickOn(page, await answer(), { pad: 8 }); await wait(2600)

    h.mark(); await h.caption(page, 4, 'טעות? האות מתעממת, ומנסים שוב')
    await wait(1800); await clickOn(page, await wrongOne(), { pad: 8 }); await wait(2200)
    await clickOn(page, await answer(), { pad: 8 }); await wait(2600)

    h.mark(); await h.caption(page, 5, 'משחק אחר: "באיזו אות זה מתחיל?"')
    await wait(900); await clickOn(page, radio(/באיזו אות/)); await wait(1000); await scrollView(); await wait(1400)
    await clickOn(page, await answer(), { pad: 8 }); await wait(2600)

    h.mark(); await h.caption(page, 6, 'או "איך קוראים לאות?" — לגדולים יותר')
    await wait(900); await clickOn(page, radio(/איך קוראים לאות/)); await wait(1000); await scrollView(); await wait(1400)
    await clickOn(page, await answer(), { pad: 8 }); await wait(2600)

    h.mark(); await h.caption(page, 7, N('10') + ' שאלות — ובסוף מקבלים כוכבים')
    await wait(900); await clickOn(page, radio(/מצאו את האות/)); await wait(1000); await scrollView(); await wait(500)
    for (let i = 0; i < 10; i++) {
      const a = await answer(); const b = await a.boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 14 }); await wait(550)
      await page.mouse.down(); await wait(60); await page.mouse.up(); await wait(i === 9 ? 1800 : 1500)
    }
    await game.getByText(/צדקתם בפעם הראשונה/).waitFor(); await wait(3500)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

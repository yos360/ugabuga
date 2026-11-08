// Tutorial: color by number (/printables/color-by-number). Labels are the real ones from src/pages/printables/ColorByNumber.jsx + cbnShared.jsx.
import { clickOn } from '../overlay.mjs'
const N = n => `⁦${n}⁩`
const D = await import('file:///root/ugabuga/src/data/colorByNumber.js')
const fish = D.cbnBySlug('fish'), grid = D.cbnGrid(fish), legend = D.cbnLegend(fish)
const total = D.CBN_PICTURES.length

export default {
  slug: 'color-by-number',
  path: '/printables/color-by-number',
  fullUrl: 'ugabuga.co.il/printables/color-by-number',
  card: { title: 'איך צובעים לפי מספרים<br>בעוגה בוגה', sub: 'בוחרים ציור, צובעים אונליין לפי המקרא — ומגלים מה מסתתר' },
  endLine: N(total) + ' ציורים — לצביעה אונליין או להדפסה, עם דף פתרון',
  endWhere: 'באתר: דפים להדפסה ← צביעה לפי מספרים',
  zoom: 1.2,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const cell = (r, c) => page.locator(`svg.is-paintable rect[x="${c * 10}"][y="${r * 10}"]`)
    const center = async (r, c) => { const b = await cell(r, c).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] }
    const legendBtn = name => page.locator('.cbn-legend button').filter({ hasText: name }).first()
    const scrollPlay = async (top = 24) => {
      const y = await page.evaluate(() => document.querySelector('.cbn-play').getBoundingClientRect().top + scrollY)
      await page.evaluate(([y]) => scrollTo(0, y), [y - top]); await wait(900)
    }
    const drag = async (r, c0, c1) => { // real mouse drag across cells of one row
      const [x0, y0] = await center(r, c0), [x1] = await center(r, c1)
      await page.mouse.move(x0, y0, { steps: 22 }); await wait(500)
      await page.mouse.down(); await page.mouse.move(x1, y0, { steps: 40 }); await page.mouse.up(); await wait(500)
    }
    const tap = async (r, c) => { const [x, y] = await center(r, c); await page.mouse.move(x, y, { steps: 18 }); await wait(350); await page.mouse.down(); await wait(60); await page.mouse.up(); await wait(450) }
    const nameOf = (r, c) => legend[grid[r][c] - 1].name
    await wait(1200)

    // 1 — level chip on the hub
    h.mark(); await h.caption(page, 1, 'בוחרים רמה — למשל "גן"')
    await wait(1800); await clickOn(page, page.getByRole('button', { name: 'גן', exact: true })); await wait(2800)

    // 2 — open the fish
    h.mark(); await h.caption(page, 2, 'לוחצים על ציור — למשל הדג')
    await wait(600)
    await page.evaluate(() => scrollTo(0, document.querySelector('section.grid').getBoundingClientRect().top + scrollY - 150)); await wait(1200)
    await clickOn(page, page.locator('a[href="/printables/color-by-number/fish"]'), { pad: 8 }); await page.locator('.cbn-play').waitFor(); await wait(1200)
    await scrollPlay(); await wait(1600)

    // 3 — pick a color in the legend, drag over its cells
    h.mark(); await h.caption(page, 3, 'בוחרים צבע במקרא וגוררים על המשבצות')
    await wait(1200); await clickOn(page, legendBtn('כתום')); await wait(900)
    await drag(2, 3, 11); await wait(700); await drag(3, 2, 12); await wait(2200)

    // 4 — another color, single taps
    h.mark(); await h.caption(page, 4, 'צבע אחר? לוחצים על משבצות אחת-אחת')
    await wait(1000); await clickOn(page, legendBtn('צהוב')); await wait(800)
    for (const r of [4, 5, 6, 7]) await tap(r, 8)
    await drag(3, 13, 15); await wait(2200)

    // 5 — a real mistake and undo
    h.mark(); await h.caption(page, 5, 'טעות? לוחצים "ביטול"')
    await wait(900); await clickOn(page, legendBtn('שחור')); await wait(600)
    await tap(4, 2); await wait(1800)
    await clickOn(page, page.getByRole('button', { name: /ביטול/ }).first()); await wait(2400)

    // 6 — math version
    h.mark(); await h.caption(page, 6, 'גרסת תרגילים: פותרים ומוצאים את הצבע')
    await wait(900); await clickOn(page, page.getByRole('button', { name: /חיבור עד 10/ }).last()); await wait(2600)
    await clickOn(page, legendBtn(nameOf(5, 2))); await wait(500); await tap(5, 2); await wait(1000)
    await clickOn(page, legendBtn(nameOf(6, 3))); await wait(500); await tap(6, 3); await wait(2200)

    // 7 — reveal the solution
    h.mark(); await h.caption(page, 7, 'ובסוף — "הצגת הפתרון" מראה את הציור')
    await wait(900); await clickOn(page, page.getByRole('button', { name: /הצגת הפתרון/ })); await wait(3800)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

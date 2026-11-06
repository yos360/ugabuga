// Tutorial: thank-you wall (/thank-you-wall). Labels are the real ones from src/pages/tools/group/ThankYouWall.jsx.
// The page talks to a Supabase database that is not reachable from the build container (and must not receive demo data),
// so its RPC calls are answered by a tiny in-memory stand-in (setup below). The UI, labels and logic are the real site.
import { clickOn, scrollTo, ring, unring } from '../overlay.mjs'
const CODE = 'k7m2xq9a'
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }

function backend() {
  let board = null, notes = [], nextId = 1
  const json = () => ({ ...board, count: notes.length })
  const view = dev => ({ ...json(), notes: notes.filter(n => !board.hide_notes || n.dev === dev).map(({ dev: d, ...n }) => ({ ...n, mine: d === dev })) })
  const rpc = {
    wall_create: a => { board = { code: CODE, expires_at: '2027-05-01T00:00:00Z', hide_notes: false, occasion: 'end-of-year', ...a.p }; return json() },
    wall_owner: () => ({ ...json(), notes: notes.map(({ dev, ...n }) => ({ ...n, mine: false })) }),
    wall_get: a => view(a.p_device_token),
    wall_add: a => {
      const n = { id: `n${nextId++}`, child: a.p_child, message: a.p_message, sticker: a.p_sticker, created_at: new Date().toISOString(), dev: a.p_device_token }
      notes.push(n)
      if (notes.length === 1) notes.push(
        { id: `n${nextId++}`, child: 'נועה', message: 'תודה על כל בוקר שבו קיבלת אותנו בחיוך. בזכותך הגן היה בית שני!', sticker: '🌻', created_at: new Date().toISOString(), dev: 'x1' },
        { id: `n${nextId++}`, child: 'איתי', message: 'תודה על השירים, על הפלסטלינה ועל הלב הגדול. נתגעגע!', sticker: '🌈', created_at: new Date().toISOString(), dev: 'x2' })
      const { dev, ...out } = n; return { ...out, mine: true }
    },
  }
  return async route => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const fn = new URL(req.url()).pathname.split('/').pop()
    const body = req.postDataJSON() || {}
    if (!rpc[fn]) return route.fulfill({ status: 404, headers: CORS, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST202', message: 'Could not find the function' }) })
    route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(rpc[fn](body)) })
  }
}

export default {
  slug: 'thank-you-wall',
  path: '/thank-you-wall',
  fullUrl: 'ugabuga.co.il/thank-you-wall',
  card: { title: 'איך אוספים ברכות לגננת<br>בעוגה בוגה', sub: 'פותחים קיר, שולחים להורים ומדפיסים חוברת מתנה' },
  endLine: 'קיר ברכות לגננת ולמורה — כל ההורים כותבים, ובסוף חוברת להדפסה',
  endWhere: 'באתר: כלים ← קיר ברכות לגננת',
  zoom: 1.25,
  async setup(ctx) { await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true }) }); await ctx.route('**/rest/v1/rpc/*', backend()) },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/tw-${n}.png` }) }
    const goTo = async (loc, off = 160) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)

    // hide the floating share / scroll-up buttons and promo strips (small fixed elements); toasts, dialogs and the tutorial overlay stay
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,dialog,[role=status]') || el.tagName === 'DIALOG') return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.getBoundingClientRect().width < 900) el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const teacher = page.getByPlaceholder('למשל: הגננת מירב / המורה דני')
    await scrollTo(page, 170, 300)
    h.mark(); await h.caption(page, 1, 'כותבים למי הקיר — שם לדוגמה בלבד'); await wait(1500)
    await clickOn(page, teacher); await teacher.pressSequentially('הגננת מירב', { delay: 130 }); await wait(500)
    const place = page.getByPlaceholder('למשל: גן חצב / כיתה ב׳3')
    await clickOn(page, place, { hold: 300 }); await place.pressSequentially('גן חצב', { delay: 130 }); await wait(1800); await dbg(1)

    h.mark(); await h.caption(page, 2, 'בוחרים לכבוד מה — ולוחצים "פתיחת קיר ברכות"')
    await clickOn(page, page.locator('fieldset').getByRole('button', { name: /חנוכה/ }), { pad: 8 }); await wait(1200)
    const open = page.getByRole('button', { name: /פתיחת קיר ברכות/ })
    await clickOn(page, open, { pad: 12 }); await wait(2500); await dbg(2)

    h.mark(); await h.caption(page, 3, 'שולחים את הקישור לקבוצת ההורים בוואטסאפ')
    await scrollTo(page, 0, 600); await wait(500)
    await ring(page, page.getByRole('button', { name: /שליחה לקבוצת ההורים/ }), 10); await wait(2500); await unring(page); await dbg(3)
    await clickOn(page, page.getByRole('button', { name: '🔗 העתקת קישור', exact: true })); await wait(2500); await dbg(4)
    await ring(page, page.getByText('קיר הפתעה').first(), 10); await wait(2500); await unring(page)

    h.mark(); await h.caption(page, 4, 'כל הורה כותב שם הילד וברכה — או לוחץ על "רעיון לברכה"')
    const child = page.getByPlaceholder('שם פרטי, למשל: יואב')
    await goTo(child, 260)
    await clickOn(page, child); await child.pressSequentially('יואב', { delay: 150 }); await wait(500)
    await clickOn(page, page.getByRole('button', { name: /רעיון לברכה/ }), { pad: 8 }); await wait(2800); await dbg(5)

    h.mark(); await h.caption(page, 5, 'בוחרים מדבקה ומוסיפים את הברכה לקיר')
    await clickOn(page, page.getByRole('button', { name: 'מדבקה 🦋' }), { pad: 6 }); await wait(1200)
    const add = page.getByRole('button', { name: /הוספת הברכה לקיר/ })
    await goTo(add, 700)
    await clickOn(page, add, { pad: 12 }); await wait(1500)
    await scrollTo(page, 0, 700); await wait(3200); await dbg(6)

    h.mark(); await h.caption(page, 6, 'הברכות של כל ההורים מצטברות על הקיר')
    await goTo(page.locator('.gt-wall'), 300); await wait(3800); await dbg(7)

    h.mark(); await h.caption(page, 7, 'בסוף לוחצים על "חוברת להדפסה" — עמוד שער וכרטיס לכל ברכה')
    await scrollTo(page, 0, 600); await wait(400)
    const book = page.getByRole('button', { name: /חוברת להדפסה/ })
    await clickOn(page, book, { pad: 10 }); await wait(2800); await dbg(8)
    await page.evaluate(() => { const d = document.querySelector('dialog'); d.style.zoom = '1.15'; d.appendChild(document.getElementById('tut-cap')) }) // the modal covers the page: carry the caption into it
    await wait(1800)
    const dlgScroll = y => page.evaluate(y => document.querySelector('dialog').scrollTo({ top: y, behavior: 'smooth' }), y)
    await dlgScroll(900); await wait(3000); await dbg(9)
    await dlgScroll(1900); await wait(3000); await dbg(10)
    await page.evaluate(() => clearInterval(window.__hide))
  },
}

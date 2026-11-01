// Tutorial: who brings what (/tools/bring-list). Labels are the real ones from src/pages/tools/BringList.jsx.
// The list lives in a Supabase database that must not receive demo data, so its RPC calls are answered by a tiny
// in-memory stand-in (setup below). The UI, labels and logic are the real site.
import { clickOn, scrollTo } from '../overlay.mjs'

const CODE = 'noa7yl'
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }

function backend() {
  let list = null
  const row = () => ({ share_code: CODE, title: list.title, items: list.items })
  const rpc = {
    create_party_list3: a => { list = { title: a.p_title, items: a.p_items.map(i => ({ ...i, takenBy: i.takenBy || '' })) }; return row() },
    get_party_list3: () => row(),
    update_party_list4: a => {
      const old = Object.fromEntries(list.items.map(i => [i.id, i]))
      list = { title: a.p_title, items: a.p_items.map(i => ({ ...i, takenBy: old[i.id]?.takenBy || i.takenBy || '' })) }
      return row()
    },
    claim_party_item2: a => { list.items = list.items.map(i => i.id === a.p_item_id ? { ...i, takenBy: a.p_name } : i); return row() },
    unclaim_party_item: () => row(),
    delete_party_list: () => row(),
  }
  return async route => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const fn = new URL(req.url()).pathname.split('/').pop()
    if (!rpc[fn]) return route.fulfill({ status: 404, headers: CORS, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST202', message: 'Could not find the function' }) })
    route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(rpc[fn](req.postDataJSON() || {})) })
  }
}

export default {
  slug: 'bring-list',
  path: '/tools/bring-list',
  fullUrl: 'ugabuga.co.il/tools/bring-list',
  card: { title: 'איך מארגנים מי מביא מה<br>למסיבה בעוגה בוגה', sub: 'רשימה משותפת: שולחים קישור אחד ובלחיצה כל אחד תופס פריט' },
  endLine: 'מי מביא מה — רשימה שיתופית למסיבה ולטיול, בלי כפילויות',
  endWhere: 'באתר: כלים ← מי מביא מה',
  zoom: 1.3,
  async setup(ctx) {
    await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true }) })
    await ctx.route('**/rest/v1/rpc/*', backend())
  },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/bl-${n}.png` }) }
    const goTo = async (loc, off = 200) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const type = async (loc, text, delay = 120) => { await clickOn(page, loc); await loc.pressSequentially(text, { delay }) }

    // 1
    await goTo(page.locator('h1'), 100)
    h.mark(); await h.caption(page, 1, 'פותחים את "מי מביא מה?" — יש כבר רשימה מוכנה, בלי הרשמה'); await wait(3500); await dbg(1)

    // 2
    const title = page.getByLabel('שם הרשימה')
    h.mark(); await h.caption(page, 2, 'נותנים שם לרשימה — למשל יום ההולדת של נועה')
    await clickOn(page, title); await title.press('Control+a'); await title.pressSequentially('יום ההולדת של נועה', { delay: 120 }); await wait(2000); await dbg(2)

    // 3
    h.mark(); await h.caption(page, 3, 'מוסיפים פריטים משלכם ולוחצים "הוספה"')
    const add = page.getByLabel('פריט חדש')
    await goTo(add, 600)
    await type(add, 'מגשי פיצה'); await wait(500)
    await clickOn(page, page.getByRole('button', { name: /הוספה/ }), { pad: 8 }); await wait(1500)
    await type(add, 'נשנושים'); await wait(500)
    await clickOn(page, page.getByRole('button', { name: /הוספה/ }), { pad: 8 }); await wait(2000); await dbg(3)

    // 4
    h.mark(); await h.caption(page, 4, 'לוחצים "העתקת קישור" — נוצר קישור קצר לשליחה בוואטסאפ')
    await goTo(page.getByRole('heading', { name: 'איך זה עובד?' }), 160)
    await clickOn(page, page.getByRole('button', { name: /העתקת קישור/ }), { pad: 8 }); await wait(3500); await dbg(4)

    // 5
    h.mark(); await h.caption(page, 5, 'גם המארגנת יכולה לתפוס פריט: "מי מביא?" וכותבים שם')
    await goTo(page.locator('ul').first(), 260)
    const cakeRow = page.locator('li', { has: page.getByLabel('פריט', { exact: true }) }).first()
    await clickOn(page, cakeRow.getByRole('button', { name: 'מי מביא?' }), { pad: 8 }); await wait(700)
    const who = page.getByPlaceholder('מי מביא? כתבו שם')
    await who.pressSequentially('נועה', { delay: 140 }); await wait(700)
    await clickOn(page, page.getByRole('button', { name: '✓ אישור' }), { pad: 8 }); await wait(2800); await dbg(5)

    // 6 — a guest opens the shared link (no organizer rights on this "device")
    await page.evaluate(() => { localStorage.removeItem('ugabuga-party-owned') })
    await h.goto('/l/' + CODE)
    await wait(600)
    h.mark(); await h.caption(page, 6, 'האורחים פותחים את הקישור ורואים מה עוד פנוי')
    await goTo(page.locator('h2').first(), 220); await wait(3500); await dbg(6)
    h.mark(); await h.caption(page, 7, 'לוחצים "אני מביא/ה", כותבים שם ואישור — וכולם רואים')
    const free = page.locator('li', { hasText: 'מגשי פיצה' })
    await goTo(free, 300)
    await clickOn(page, free.getByRole('button', { name: /אני מביא/ }), { pad: 8 }); await wait(700)
    await page.getByPlaceholder('השם שלך').pressSequentially('יובל', { delay: 140 }); await wait(700)
    await clickOn(page, page.getByRole('button', { name: '✓ אישור' }), { pad: 8 }); await wait(2500)
    const snack = page.locator('li', { hasText: 'נשנושים' })
    await clickOn(page, snack.getByRole('button', { name: /אני מביא/ }), { pad: 8 }); await wait(1500); await dbg(7)
    await wait(2500)
  },
}

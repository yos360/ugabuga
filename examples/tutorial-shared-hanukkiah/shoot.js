// Real captures of ugabuga.co.il/hanukkiah (src/pages/tools/group/SharedHanukkiah.jsx, src/utils/sharedHanukkiah.js).
// The page UI is the live site's own; the Supabase RPC answers (hk_create / hk_owner / hk_get / hk_light) are mocked
// with route.fulfill, so nothing is written to the database. Two contexts: the organizer before Hanukkah
// (clock 30.11.2026) and a parent's phone on the 4th night (clock 7.12.2026 19:30).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
const TITLE = 'החנוכייה של כיתה ג׳2';
const C = (id, name, wish, night, mine = false) => ({ id, name, wish, night, mine });
const TONIGHT0 = [C('c1', 'נועה', 'הרבה סופגניות ושמחה!', 4), C('c2', 'יואב', '', 4)];
const NIGHT1 = [C('n1', 'מאיה', 'שיהיה לכולנו חג מלא אור 🕎', 1), C('n2', 'אורי', '', 1), C('n3', 'נועה', 'בריאות לכל המשפחה', 1), C('n4', 'יואב', '', 1), C('n5', 'תמר', 'שכל החברים יהיו שמחים', 1)];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const boxes = {};
  const mk = async (time, handler) => {
    const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
    await c.route(/supabase\.co\/rest\/v1\/rpc\/(hk_\w+)/, async (route) => {
      const fn = /rpc\/(hk_\w+)/.exec(route.request().url())[1];
      let args = {}; try { args = JSON.parse(route.request().postData() || '{}'); } catch { /* */ }
      const out = handler(fn, args);
      console.log('rpc', fn, JSON.stringify(args).slice(0, 120));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
    });
    const p = await c.newPage();
    await p.clock.install({ time: new Date(time) });
    return { c, p };
  };
  const helpers = (p) => {
    const hide = () => p.evaluate(() => {
      if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important}.hk-flame,.hk-new{animation:none!important}'; document.head.appendChild(st); }
      { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { if (/[לב]הנר /.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/([לב])הנר /g, '$1נר '); const pv = n.previousSibling; if (/^הנר /.test(n.nodeValue) && pv && pv.nodeType === 3 && /[לב]$/.test(pv.nodeValue)) n.nodeValue = n.nodeValue.slice(1); } }
      for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !/✓/.test(e.innerText || '')) e.style.visibility = 'hidden'; }
    });
    const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
    const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.clock.runFor(500); };
    const shot = async (k) => { await hide(); await p.waitForTimeout(150); return p.screenshot({ path: `shots/${k}.png` }); };
    const btn = (re) => p.getByRole('button', { name: re });
    return { hide, vbox, scrollTo, shot, btn };
  };

  // ---------- 1. organizer: open a class hanukkiah (before Hanukkah) ----------
  {
    const { c, p } = await mk('2026-11-30T20:00:00+02:00', (fn, a) => {
      if (fn === 'hk_create') return { code: 'k7m2qa', title: a.p.title, kind: a.p.kind };
      if (fn === 'hk_owner' || fn === 'hk_get') return { code: 'k7m2qa', title: TITLE, kind: 'class', shown: 1, total: 0, people: 0, nights: [0, 0, 0, 0, 0, 0, 0, 0], candles: [], lit_tonight: false, owner: true };
      return null;
    });
    const { vbox, scrollTo, shot, btn } = helpers(p);
    await p.goto('https://ugabuga.co.il/hanukkiah', { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    await scrollTo(p.locator('h1'), 30);
    const grabC = async () => ({ h1: await vbox(p.locator('h1')), kinds: await vbox(p.locator('fieldset')), kClass: await vbox(btn(/כיתה/)), title: await vbox(p.locator('form input')),
      create: await vbox(btn(/פתיחת חנוכייה משותפת/)), demo: await vbox(p.locator('aside.space-y-4 .hk-sky')), how: await vbox(p.locator('aside.space-y-4 ol')), form: await vbox(p.locator('form')) });
    boxes.blank = await grabC(); await shot('blank');
    await btn(/כיתה/).click(); await p.clock.runFor(300);
    await p.locator('form input').fill(TITLE); await p.clock.runFor(300);
    boxes.create = await grabC(); await shot('create');
    await btn(/פתיחת חנוכייה משותפת/).click(); await p.clock.runFor(1500); await p.waitForLoadState('networkidle'); await p.clock.runFor(800);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.clock.runFor(300);
    await scrollTo(p.locator('section').filter({ hasText: 'החנוכייה מוכנה' }), 20);
    const ready = p.locator('section').filter({ hasText: 'החנוכייה מוכנה' });
    console.log('ready:', (await p.locator('main').innerText()).slice(0, 600).replace(/\n/g, ' | '));
    boxes.ready = { banner: await vbox(ready), wa: await vbox(ready.locator('button')), sky: await vbox(p.locator('.hk-sky')), count: await vbox(p.locator('.hk-sky p').nth(1)), h1: await vbox(p.locator('.hk-sky h1')) };
    await shot('ready');
    const org = p.locator('aside.space-y-4 section').filter({ hasText: 'למארגנים' });
    await scrollTo(p.locator('#hk-who'), 20);
    console.log('aside:', (await p.locator('aside.space-y-4').innerText()).replace(/\n/g, ' | '));
    boxes.org = { aside: await vbox(p.locator('aside.space-y-4')), org: await vbox(org), key: await vbox(btn(/קישור ניהול/)), rename: await vbox(btn(/שינוי השם/)), wa: await vbox(btn(/שליחה לקבוצה בוואטסאפ/).last()), copy: await vbox(btn(/העתקת קישור$/)), who: await vbox(p.locator('#hk-who').locator('..')) };
    await shot('org');
    await c.close();
  }

  // ---------- 2. a parent's phone on the 4th night ----------
  {
    let tonight = TONIGHT0.slice(), lit = false;
    const nights = [5, 3, 4, 2, 0, 0, 0, 0];
    const state = (night) => {
      const n = night || 4;
      const cs = n === 4 ? tonight : n === 1 ? NIGHT1 : [];
      return { code: 'k7m2qa', title: TITLE, kind: 'class', shown: n, total: nights.reduce((a, x) => a + x, 0), people: 7, nights: nights.slice(), candles: cs, lit_tonight: lit, owner: false };
    };
    const { c, p } = await mk('2026-12-07T19:30:00+02:00', (fn, a) => {
      if (fn === 'hk_get') return state(a.p_night);
      if (fn === 'hk_light') { const cd = C('c3', a.p_name, a.p_wish || '', 4, true); tonight = [...tonight, cd]; lit = true; nights[3] += 1; return cd; }
      return null;
    });
    const { vbox, scrollTo, shot, btn } = helpers(p);
    await p.goto('https://ugabuga.co.il/hanukkiah/k7m2qa', { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    const sky = p.locator('.hk-sky');
    await scrollTo(sky, 20);
    const grabS = async () => ({ sky: await vbox(sky), svg: await vbox(sky.locator('svg')), h1: await vbox(sky.locator('h1')), when: await vbox(sky.locator('p').nth(1)), count: await vbox(sky.locator('p').nth(2)),
      chips: await vbox(sky.locator('[role=group]')), chip1: await vbox(sky.locator('.hk-chip').first()), chip4: await vbox(sky.locator('.hk-chip').nth(3)) });
    console.log('guest:', (await p.locator('main').innerText()).slice(0, 900).replace(/\n/g, ' | '));
    boxes.guest = await grabS(); await shot('guest');
    // the form
    const form = p.locator('aside.space-y-4 form');
    await scrollTo(p.locator('#hk-who'), 30);
    await form.locator('input').first().fill('דניאל'); await p.clock.runFor(200);
    boxes.formEmpty = { aside: await vbox(p.locator('aside.space-y-4')), form: await vbox(form), name: await vbox(form.locator('input').first()), wish: await vbox(form.locator('input').nth(1)), idea: await vbox(btn(/רעיון למשאלה/)), light: await vbox(btn(/הדלקת נר הערב/)), list: await vbox(p.locator('.hk-list')), who: await vbox(p.locator('#hk-who')) };
    await shot('formName');
    await btn(/רעיון למשאלה/).click(); await p.clock.runFor(300);
    console.log('wish:', await form.locator('input').nth(1).inputValue());
    await shot('formWish');
    await btn(/הדלקת נר הערב/).click(); await p.clock.runFor(700); await p.waitForLoadState('networkidle'); await p.clock.runFor(300);
    console.log('after:', (await p.locator('main').innerText()).slice(0, 900).replace(/\n/g, ' | '));
    boxes.litList = { list: await vbox(p.locator('.hk-list')), mine: await vbox(p.locator('.hk-list li').last()), aside: await vbox(p.locator('aside.space-y-4 section').first()), who: await vbox(p.locator('#hk-who')) };
    await shot('litList');
    await scrollTo(sky, 20);
    boxes.lit = await grabS(); await shot('lit');
    await sky.locator('.hk-chip').first().click(); await p.clock.runFor(800); await p.waitForLoadState('networkidle'); await p.clock.runFor(300);
    await scrollTo(sky, 20);
    console.log('night1:', (await sky.innerText()).replace(/\n/g, ' | '));
    boxes.night1 = await grabS(); await shot('night1');
    await scrollTo(p.locator('#hk-who'), 30);
    boxes.night1List = { list: await vbox(p.locator('.hk-list')), who: await vbox(p.locator('#hk-who')) };
    await shot('night1List');
    await c.close();
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

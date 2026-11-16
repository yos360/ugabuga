// Real captures of ugabuga.co.il/holidays/hanukkah/host-home (src/pages/holidays/HanukkahHostHome.jsx).
// The minute ranges ("0–10 דק׳") render reversed on the live site until the ⁦…⁩ fix (same push) is deployed,
// so the DOM is patched the same way before each shot.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage();
  const boxes = {};
  const hide = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (/\d+–\d+/.test(n.nodeValue) && !n.nodeValue.includes('⁦')) n.nodeValue = n.nodeValue.replace(/(\d+–\d+)/g, '⁦$1⁩');
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('dialog')) e.style.visibility = 'hidden'; }
  });
  const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const shot = async (k) => { await hide(); await p.waitForTimeout(250); return p.screenshot({ path: `shots/${k}.png` }); };
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/host-home', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  // hero
  await scrollTo(p.locator('h1'), 160);
  boxes.hero = { h1: await vbox(p.locator('h1')), lead: await vbox(p.locator('header p')) };
  await shot('hero');
  // plan
  const planH = p.locator('h2').filter({ hasText: 'הלו״ז' });
  await scrollTo(planH, 20);
  const rows = p.locator('h2:has-text("הלו״ז") + div > div');
  boxes.plan = { h2: await vbox(planH), rows: [] };
  for (let i = 0; i < 6; i++) boxes.plan.rows.push(await vbox(rows.nth(i)));
  await shot('plan');
  console.log('plan:', (await rows.first().innerText()).replace(/\n/g, ' | '));
  // crafts grid
  const craftH = p.locator('h2').filter({ hasText: 'שש יצירות' });
  await scrollTo(craftH, 20);
  const cards = p.locator('h2:has-text("שש יצירות") + div > section');
  boxes.crafts = { h2: await vbox(craftH), cards: [] };
  for (let i = 0; i < 6; i++) boxes.crafts.cards.push(await vbox(cards.nth(i)));
  await shot('crafts');
  // one craft card up close (sevivon, the 2nd card)
  const sev = cards.nth(1);
  await scrollTo(sev, 40);
  boxes.sev = { card: await vbox(sev), per: await vbox(sev.locator('p').first()), ol: await vbox(sev.locator('ol')), tip: await vbox(sev.locator('p').last()), h3: await vbox(sev.locator('h3')) };
  await shot('sev');
  const lamp = cards.nth(3);
  await scrollTo(lamp, 40);
  boxes.lamp = { card: await vbox(lamp), tip: await vbox(lamp.locator('p').last()) };
  await shot('lamp');
  // shopping list
  const shop = p.locator('section').filter({ hasText: 'רשימת קניות לפי מספר הילדים' }).first();
  await scrollTo(shop, 20);
  const input = shop.locator('input[type=number]');
  const grabS = async () => ({ sec: await vbox(shop), input: await vbox(input), list: await vbox(shop.locator('ul')), items: await Promise.all([0, 1, 7, 8, 9].map((i) => vbox(shop.locator('li').nth(i)))), note: await vbox(shop.locator('ul + p')), btn: await vbox(shop.getByRole('button')) });
  boxes.shop8 = await grabS(); await shot('shop8');
  await input.fill('12'); await p.waitForTimeout(300);
  boxes.shop12 = await grabS(); await shot('shop12');
  console.log('shop12:', (await shop.locator('ul').innerText()).replace(/\n/g, ' | '));
  // print preview
  await shop.getByRole('button').click(); await p.waitForTimeout(2000);
  const dlg = p.locator('dialog.buga-print-dialog');
  await hide();
  const page1 = dlg.locator('.buga-preview-pages > *').first();
  boxes.print = { bar: await vbox(dlg.locator('.buga-print-toolbar')), pdf: await vbox(dlg.locator('[data-save-pdf]')), prt: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), page: await vbox(page1), h2: await vbox(dlg.locator('.buga-preview-pages h2').first()), table: await vbox(dlg.locator('.buga-preview-pages table').first()), shop: await vbox(dlg.locator('.buga-preview-pages h3').first()), check: await vbox(dlg.locator('.buga-preview-pages h3').nth(1)) };
  console.log('toolbar:', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n/g, ' | '));
  await shot('print');
  await page1.evaluate((e) => e.scrollIntoView({ block: 'start' })).catch(() => {});
  await p.waitForTimeout(400); await hide();
  boxes.print2 = { page: await vbox(page1), h2: await vbox(dlg.locator('.buga-preview-pages h2').first()), table: await vbox(dlg.locator('.buga-preview-pages table').first()), shop: await vbox(dlg.locator('.buga-preview-pages h3').first()), check: await vbox(dlg.locator('.buga-preview-pages h3').nth(1)), ulc: await vbox(dlg.locator('.buga-preview-pages ul').last()) };
  await shot('print2');
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

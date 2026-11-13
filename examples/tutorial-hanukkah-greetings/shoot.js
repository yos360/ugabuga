// Real captures of ugabuga.co.il/holidays/hanukkah/greetings
// (src/pages/holidays/HanukkahGreetings.jsx + src/data/hanukkahGreetings.js).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL', permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await c.newPage();
  const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const boxes = {};
  const clipShot = async (k, y, h) => { await p.screenshot({ path: `shots/${k}.png`, clip: { x: 0, y, width: VW, height: h }, fullPage: true }); };
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/greetings', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000); await hide();
  boxes.h1 = await box(p.locator('h1'));
  const grp = p.locator('[role=group][aria-label="למי הברכה"]');
  boxes.grp = await box(grp);
  const chips = grp.locator('button');
  boxes.chips = []; for (let i = 0; i < await chips.count(); i++) boxes.chips.push(await box(chips.nth(i)));
  console.log('chips:', (await chips.allInnerTexts()).join(' | '));
  boxes.Y = boxes.h1[1] - 20;
  await clipShot('top', boxes.Y, 1000);
  // filter: teacher
  await chips.filter({ hasText: 'למורה' }).click(); await p.waitForTimeout(800); await hide();
  const items = p.locator('main li, ul.grid > li');
  const first = p.locator('ul.grid > li').first();
  boxes.item1 = await box(first);
  boxes.copy1 = await box(first.getByRole('button', { name: /העתקת הברכה/ }));
  boxes.wa1 = await box(first.getByRole('link', { name: /לוואטסאפ/ }));
  boxes.card1 = await box(first.getByRole('button', { name: /לכרטיס/ }));
  const second = p.locator('ul.grid > li').nth(1);
  boxes.item2 = await box(second);
  boxes.card2btn = await box(second.getByRole('button', { name: /לכרטיס/ }));
  boxes.sec = await box(p.locator('section').filter({ has: p.locator('#h-teacher') }));
  await clipShot('teacher', boxes.Y, 1000);
  console.log('wa href:', await first.getByRole('link', { name: /לוואטסאפ/ }).getAttribute('href'));
  await first.getByRole('button', { name: /העתקת הברכה/ }).click(); await p.waitForTimeout(400);
  await clipShot('copied', boxes.Y, 1000);
  console.log('clip:', await p.evaluate(() => navigator.clipboard.readText()).catch(e => 'ERR ' + e));
  // to card: second greeting
  await second.getByRole('button', { name: /לכרטיס/ }).click(); await p.waitForTimeout(1500); await hide();
  const builder = p.locator('section').filter({ has: p.locator('#cards-h') });
  boxes.builder = await box(builder);
  boxes.inCard = await box(builder.locator('p.rounded-xl').first());
  boxes.own = await box(builder.locator('textarea'));
  boxes.from = await box(builder.locator('label').filter({ hasText: 'מאת' }).locator('input'));
  const theme = builder.locator('[role=group][aria-label="עיצוב"]');
  boxes.theme = await box(theme);
  boxes.ink = await box(theme.getByRole('button', { name: 'חסכוני בדיו' }));
  boxes.printBtn = await box(builder.locator('[data-print-main]'));
  boxes.sheet = await box(builder.locator('button[aria-label="הדפסת כרטיסי הברכה"]'));
  boxes.BY = boxes.builder[1] - 10;
  await clipShot('b0', boxes.BY, boxes.builder[3] + 20);
  await builder.locator('label').filter({ hasText: 'מאת' }).locator('input').fill('הורי כיתה ב׳'); await p.waitForTimeout(600);
  await clipShot('b1', boxes.BY, boxes.builder[3] + 20);
  await theme.getByRole('button', { name: 'חסכוני בדיו' }).click(); await p.waitForTimeout(600);
  await clipShot('b2', boxes.BY, boxes.builder[3] + 20);
  await theme.getByRole('button', { name: 'צבעוני' }).click(); await p.waitForTimeout(600);
  // own greeting (shown, then cleared)
  await builder.locator('textarea').fill('לגננת היקרה, תודה על שנה מלאה באור!'); await p.waitForTimeout(600);
  await clipShot('b3', boxes.BY, boxes.builder[3] + 20);
  await builder.locator('textarea').fill(''); await p.waitForTimeout(400);
  // print preview
  await builder.locator('[data-print-main]').click(); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'shots/print.png' });
  const dlg = p.locator('dialog.buga-print-dialog');
  boxes.pdf = await dlg.locator('[data-save-pdf]').evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.prn = await dlg.getByRole('button', { name: /הדפסה/ }).last().evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.page = await dlg.locator('.buga-preview-pages article').first().evaluate(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

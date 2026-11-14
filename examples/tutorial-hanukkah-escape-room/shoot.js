// Real captures of ugabuga.co.il/holidays/hanukkah/escape-room
// (src/pages/holidays/HanukkahEscapeRoom.jsx + src/data/hanukkahEscape.js).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const fixRanges = require('./fixranges');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1080;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  const hide0 = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('[role=dialog]') || e.closest('dialog')) continue; const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const hide = async () => { await hide0(); await fixRanges(p); };
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const vbox = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  const boxes = {};
  const clipShot = async (k, y, h) => { await p.screenshot({ path: `shots/${k}.png`, clip: { x: 0, y, width: VW, height: h }, fullPage: true }); };
  const view = async (k) => { await p.screenshot({ path: `shots/${k}.png` }); };
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/escape-room', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000); await hide();
  boxes.h1 = await box(p.locator('h1'));
  const grp = p.locator('[role=group][aria-label="בחירת רמה"]');
  const info = grp.locator('xpath=following-sibling::p');
  boxes.grp = await box(grp);
  boxes.gan = await box(grp.locator('button').nth(0));
  boxes.school = await box(grp.locator('button').nth(1));
  boxes.info = await box(info);
  boxes.proj = await box(p.getByRole('button', { name: /מצב מקרן/ }));
  boxes.printBtn = await box(p.locator('[data-print-main]'));
  boxes.Y = boxes.h1[1] - 20;
  await clipShot('top', boxes.Y, 800);
  await grp.locator('button').nth(0).click(); await p.waitForTimeout(600); await hide();
  boxes.infoGan = await box(info);
  console.log('info gan:', await info.innerText());
  await clipShot('topGan', boxes.Y, 800);
  const list = p.locator('ol').filter({ has: p.locator('h3') }).first();
  boxes.list = await box(list);
  await clipShot('listGan', boxes.list[1] - 60, 760);
  await grp.locator('button').nth(1).click(); await p.waitForTimeout(600); await hide();
  boxes.list2 = await box(list);
  await clipShot('listSchool', boxes.list2[1] - 60, 760);
  console.log('info school:', await info.innerText());

  // projector
  await p.evaluate(() => scrollTo(0, 0));
  await p.getByRole('button', { name: /מצב מקרן/ }).click(); await p.waitForTimeout(1500);
  const dlg = p.locator('[role=dialog][aria-modal=true]');
  await view('pIntro');
  boxes.pStart = await vbox(dlg.getByRole('button', { name: /מתחילים/ }));
  boxes.pTimer = await vbox(dlg.locator('[aria-label="זמן שעבר"]'));
  await dlg.getByRole('button', { name: /מתחילים/ }).click(); await p.waitForTimeout(800);
  await view('pS1');
  const inp = dlg.locator('input[aria-label="התשובה של הכיתה"]');
  boxes.pInput = await vbox(inp);
  boxes.pCheck = await vbox(dlg.getByRole('button', { name: 'בדיקה' }));
  boxes.pHint = await vbox(dlg.getByRole('button', { name: /רמז/ }));
  boxes.pReveal = await vbox(dlg.getByRole('button', { name: 'הצגת התשובה' }));
  boxes.pLock = await vbox(dlg.locator('div[dir=ltr]').first());
  await dlg.getByRole('button', { name: /רמז/ }).click(); await p.waitForTimeout(400);
  await view('pS1hint');
  boxes.pHintText = await vbox(dlg.locator('ul').first());
  boxes.pInputH = await vbox(inp);
  boxes.pCheckH = await vbox(dlg.getByRole('button', { name: 'בדיקה' }));
  await inp.fill('6'); await p.waitForTimeout(300);
  await view('pS1typed');
  await dlg.getByRole('button', { name: 'בדיקה' }).click(); await p.waitForTimeout(500);
  await view('pS1right');
  boxes.pRight = await vbox(dlg.locator('p.text-green-300'));
  boxes.pNext = await vbox(dlg.getByRole('button', { name: /לתחנה הבאה/ }));
  boxes.pLock2 = await vbox(dlg.locator('div[dir=ltr]').first());
  await dlg.getByRole('button', { name: /לתחנה הבאה/ }).click(); await p.waitForTimeout(400);
  for (let i = 1; i < 5; i++) {
    await dlg.getByRole('button', { name: 'הצגת התשובה' }).click(); await p.waitForTimeout(300);
    await dlg.getByRole('button', { name: /לתחנה הבאה|אל המנעול/ }).click(); await p.waitForTimeout(400);
  }
  await view('pLock');
  const code = dlg.locator('input[aria-label="הקוד של המנעול"]');
  boxes.pCode = await vbox(code);
  boxes.pOpen = await vbox(dlg.getByRole('button', { name: /פותחים את התיבה/ }));
  boxes.pLock3 = await vbox(dlg.locator('div[dir=ltr]').first());
  await code.fill('69857'); await p.waitForTimeout(300);
  await view('pLockTyped');
  await dlg.getByRole('button', { name: /פותחים את התיבה/ }).click(); await p.waitForTimeout(600);
  await view('pDone');
  boxes.pDoneH = await vbox(dlg.locator('h2'));
  boxes.pCodeLine = await vbox(dlg.locator('p', { hasText: 'הקוד:' }));
  await dlg.getByRole('button', { name: 'סיום' }).click(); await p.waitForTimeout(800);

  // print kit
  await p.locator('[data-print-main]').click(); await p.waitForTimeout(2500); await fixRanges(p);
  await view('print');
  const pd = p.locator('dialog.buga-print-dialog');
  boxes.pdf = await vbox(pd.locator('[data-save-pdf]'));
  boxes.prn = await vbox(pd.getByRole('button', { name: /הדפסה/ }).last());
  const pages = pd.locator('.buga-preview-pages article');
  const n = await pages.count();
  console.log('pages:', n);
  for (const [k, i] of [['pp0', 0], ['pp1', 1], ['ppLockSheet', n - 2], ['ppPaperLock', n - 1]]) {
    const a = pages.nth(i);
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await a.screenshot({ path: `shots/${k}.png` });
    boxes[k] = await vbox(a);
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

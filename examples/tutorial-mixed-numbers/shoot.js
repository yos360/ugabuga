// Real captures of ugabuga.co.il/math/mixed-numbers (src/math/MixedNumbersGuide.jsx + src/data/mixedNumbers.js).
// Practice is seeded by Date.now(), so each answer is read from the page (aria-labels) and computed here.
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
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('dialog')) e.style.visibility = 'hidden'; }
  });
  const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const shot = async (k) => { await hide(); await p.mouse.move(2, 2); await p.waitForTimeout(250); return p.screenshot({ path: `shots/${k}.png` }); };
  p.setDefaultTimeout(3000); await p.goto((process.env.BASE || 'https://ugabuga.co.il') + '/math/mixed-numbers', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();

  // hero
  await scrollTo(p.locator('h1'), 120);
  boxes.hero = { h1: await vbox(p.locator('h1')) };
  await shot('hero');

  // what: pizzas + two cards
  const what = p.locator('section[aria-labelledby="what-h"]');
  await scrollTo(what, 30);
  boxes.what = { sec: await vbox(what), h2: await vbox(what.locator('h2')), pizzas: await vbox(what.locator('[role=img]').first()), mixed: await vbox(what.locator('.bg-amber-50')), imp: await vbox(what.locator('.bg-sky-50')) };
  await shot('what');

  // two rules
  const how = p.locator('section[aria-labelledby="how-h"]');
  await scrollTo(how, 30);
  boxes.how = { sec: await vbox(how), r1: await vbox(how.locator('.grid > div').nth(0)), r2: await vbox(how.locator('.grid > div').nth(1)) };
  await shot('how');
  console.log('how:', (await how.innerText()).replace(/\n/g, ' | '));

  // converter: default 2 3/4, then 3 2/5
  const conv = p.locator('section#convert');
  await scrollTo(conv, 30);
  const grabC = async () => ({ sec: await vbox(conv), sels: await vbox(conv.locator('.flex-wrap').first()), sW: await vbox(conv.locator('label').nth(0)), sR: await vbox(conv.locator('label').nth(1)), sD: await vbox(conv.locator('label').nth(2)), pz: await vbox(conv.locator('[role=img]')), eq: await vbox(conv.locator('p.text-2xl')), b1: await vbox(conv.locator('.bg-amber-50')), b2: await vbox(conv.locator('.bg-sky-50')) });
  boxes.conv1 = await grabC(); await shot('conv1');
  await conv.locator('select').nth(2).selectOption('5'); await p.waitForTimeout(200);
  await conv.locator('select').nth(0).selectOption('3'); await p.waitForTimeout(200);
  await conv.locator('select').nth(1).selectOption('2'); await p.waitForTimeout(300);
  await scrollTo(conv, 30);
  boxes.conv2 = await grabC(); await shot('conv2');
  console.log('conv2:', (await conv.innerText()).replace(/\n/g, ' | '));

  // practice (easy level by default)
  const prac = p.locator('section#practice');
  const box = prac.locator('div.rounded-2xl').first();
  await scrollTo(prac.locator('h2'), 20);
  const grabQ = async () => ({ sec: await vbox(prac), box: await vbox(box), levels: await vbox(box.locator('[role=group]')), count: await vbox(box.locator('p.text-sm').first()), kind: await vbox(box.locator('p.text-xl')), task: await vbox(box.locator('div[dir=ltr]').first()), inputs: await Promise.all([0, 1].map((i) => vbox(box.locator('input').nth(i)))), btn: await vbox(box.getByRole('button', { name: /בדיקה|לתרגיל הבא|לתוצאה/ })), fb: await vbox(box.locator('[aria-live] > div')) });
  // q1: toImproper — read "w r/d" from the Mixed aria-label
  const ml = await box.locator('bdi[aria-label]').first().getAttribute('aria-label');
  const [w1, rd] = ml.split(' '); const [r1, d1] = rd.split('/').map(Number);
  const ans1 = +w1 * d1 + r1;
  console.log('q1', ml, '->', ans1);
  boxes.q1 = await grabQ(); await shot('q1');
  await box.locator('input').first().fill(String(ans1)); await p.waitForTimeout(200);
  boxes.q1typed = await grabQ(); await shot('q1typed');
  await box.getByRole('button', { name: /בדיקה/ }).click(); await p.waitForTimeout(300);
  boxes.q1ok = await grabQ(); await shot('q1ok');
  console.log('q1ok:', (await box.innerText()).replace(/\n/g, ' | '));
  // q2: toMixed — answer wrong on purpose (whole part off by one) to show the explanation + pizzas
  await box.getByRole('button', { name: /לתרגיל הבא/ }).click(); await p.waitForTimeout(300);
  const il = await box.locator('div[dir=ltr] bdi[aria-label]').first().getAttribute('aria-label');
  const [n2, d2] = il.split('/').map(Number);
  console.log('q2', il, '->', Math.floor(n2 / d2), n2 % d2);
  boxes.q2 = await grabQ(); await shot('q2');
  await box.locator('input').nth(0).fill(String(Math.floor(n2 / d2) + 1));
  await box.locator('input').nth(1).fill(String(n2 % d2 || 1)); await p.waitForTimeout(200);
  boxes.q2typed = await grabQ(); await shot('q2typed');
  await box.getByRole('button', { name: /בדיקה/ }).click(); await p.waitForTimeout(300);
  await scrollTo(box, 20);
  boxes.q2no = await grabQ(); await shot('q2no');
  console.log('q2no:', (await box.innerText()).replace(/\n/g, ' | '));
  // q3: picture
  await box.getByRole('button', { name: /לתרגיל הבא/ }).click(); await p.waitForTimeout(300);
  await scrollTo(box, 20);
  const pl = await box.locator('[role=img]').first().getAttribute('aria-label');
  console.log('q3', pl);
  boxes.q3 = await grabQ(); boxes.q3.pz = await vbox(box.locator('[role=img]').first()); await shot('q3');

  // print section
  const pr = p.locator('section[aria-labelledby="print-h"]');
  await scrollTo(pr, 200);
  boxes.prsec = { sec: await vbox(pr), levels: await vbox(pr.locator('[role=group]')), go: await vbox(pr.getByRole('button', { name: /לתצוגה ולהדפסה/ })), set: await vbox(pr.getByRole('button', { name: /סט אחר/ })), lead: await vbox(pr.locator('p').first()) };
  await shot('prsec');
  console.log('prsec:', (await pr.innerText()).replace(/\n/g, ' | '));
  await pr.getByRole('button', { name: /לתצוגה ולהדפסה/ }).click(); await p.waitForTimeout(2000);
  const dlg = p.locator('dialog.buga-print-dialog');
  await hide();
  const pages = dlg.locator('.buga-preview-pages article');
  const grabP = async () => ({ bar: await vbox(dlg.locator('.buga-print-toolbar')), pdf: await vbox(dlg.locator('[data-save-pdf]')), prt: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), p1: await vbox(pages.nth(0)), h2: await vbox(pages.nth(0).locator('h2')), h3: await Promise.all([0, 1, 2].map((i) => vbox(pages.nth(0).locator('h3').nth(i)))), p2: await vbox(pages.nth(1)), h2b: await vbox(pages.nth(1).locator('h2')), ol: await vbox(pages.nth(1).locator('ol')) });
  boxes.print = await grabP();
  console.log('toolbar:', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n/g, ' | '));
  await shot('print');
  await pages.nth(0).locator('h3').nth(2).evaluate((e) => e.scrollIntoView({ block: 'center' })).catch(() => {});
  await p.waitForTimeout(400);
  boxes.printB = await grabP(); await shot('printB');
  await pages.nth(1).locator('ol').evaluate((e) => e.scrollIntoView({ block: 'center' })).catch(() => {});
  await p.waitForTimeout(400);
  boxes.print2 = await grabP(); await shot('print2');
  console.log('answers:', (await pages.nth(1).innerText()).replace(/\n/g, ' | ').slice(0, 400));
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

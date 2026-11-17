// Real captures of ugabuga.co.il/learn/english-phonics (src/learn/englishPhonics/EnglishPhonics.jsx).
// The stage-3 practice is seeded (practiceFor('blend', 1, 10)); the right answers below come from that function:
// q1 cup, q2 pen (we pick "hen" on purpose to show the "כמעט." state), then all right -> 9 / 10.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
const ANSWERS = [1, 0, 0, 1, 2, 0, 2, 2, 1, 0];
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
  await p.goto('https://ugabuga.co.il/learn/english-phonics', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  // hero + the six stage cards
  await scrollTo(p.locator('h1'), 120);
  const nav = p.locator('nav[aria-label="שלבי המסלול"]');
  boxes.hero = { h1: await vbox(p.locator('h1')), lead: await vbox(p.locator('header p')), nav: await vbox(nav), cards: [] };
  for (let i = 0; i < 6; i++) boxes.hero.cards.push(await vbox(nav.locator('a').nth(i)));
  await shot('hero');
  // stage 1: letter cards with 🔊
  const s1 = p.locator('section#letters');
  await scrollTo(s1.locator('h2'), 20);
  boxes.letters = { h2: await vbox(s1.locator('h2')), goal: await vbox(s1.locator('p').first()), how: await vbox(s1.locator('p').nth(1)), cards: [] };
  for (let i = 0; i < 12; i++) boxes.letters.cards.push(await vbox(s1.locator('ul > li').nth(i)));
  boxes.letters.ear = await vbox(s1.locator('ul > li').first().getByRole('button'));
  await shot('letters');
  console.log('letter1:', (await s1.locator('ul > li').first().innerText()).replace(/\n/g, ' | '));
  // stage 3: practice
  const s3 = p.locator('section#blend');
  const box = s3.locator('div.border-sky-300');
  await scrollTo(box, 200);
  const grabQ = async () => ({ box: await vbox(box), count: await vbox(box.locator('p').first()), big: await vbox(box.locator('bdi').first()), ear: await vbox(box.getByRole('button', { name: 'השמיעו באנגלית' })), he: await vbox(box.locator('p').nth(1)), opts: await Promise.all([0, 1, 2].map((i) => vbox(box.locator('[role=group] button').nth(i)))), fb: await vbox(box.locator('[aria-live] p')), next: await vbox(box.getByRole('button', { name: /הבא/ })) });
  boxes.q1 = await grabQ(); await shot('q1');
  console.log('q1:', (await box.innerText()).replace(/\n/g, ' | '));
  await box.locator('[role=group] button').nth(ANSWERS[0]).click(); await p.waitForTimeout(300);
  boxes.q1ok = await grabQ(); await shot('q1ok');
  console.log('q1ok:', (await box.innerText()).replace(/\n/g, ' | '));
  await box.getByRole('button', { name: /הבא/ }).click(); await p.waitForTimeout(300);
  await box.locator('[role=group] button').nth(1).click(); await p.waitForTimeout(300); // wrong on purpose (hen)
  boxes.q2no = await grabQ(); await shot('q2no');
  console.log('q2no:', (await box.innerText()).replace(/\n/g, ' | '));
  for (let i = 2; i < 10; i++) {
    await box.getByRole('button', { name: /הבא/ }).click(); await p.waitForTimeout(250);
    await box.locator('[role=group] button').nth(ANSWERS[i]).click(); await p.waitForTimeout(250);
  }
  await box.getByRole('button', { name: /הבא/ }).click(); await p.waitForTimeout(400);
  await scrollTo(box, 200);
  boxes.done = { box: await vbox(box), score: await vbox(box.locator('p').first()), msg: await vbox(box.locator('p').nth(1)), again: await vbox(box.getByRole('button', { name: /סבב חדש/ })), print: await vbox(s3.getByRole('button', { name: /דף עבודה לשלב 3/ })), nextStage: await vbox(s3.getByRole('link', { name: /לשלב 4/ })) };
  await shot('done');
  console.log('done:', (await box.innerText()).replace(/\n/g, ' | '));
  // print preview of stage 3
  await s3.getByRole('button', { name: /דף עבודה לשלב 3/ }).click(); await p.waitForTimeout(2000);
  const dlg = p.locator('dialog.buga-print-dialog');
  await hide();
  const pages = dlg.locator('.buga-preview-pages article');
  const grabP = async () => ({ bar: await vbox(dlg.locator('.buga-print-toolbar')), pdf: await vbox(dlg.locator('[data-save-pdf]')), prt: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), set: await vbox(dlg.getByRole('button', { name: /דף אחר/ })), p1: await vbox(pages.nth(0)), h2: await vbox(pages.nth(0).locator('h2')), task: await vbox(pages.nth(0).locator('p').first()), p2: await vbox(pages.nth(1)), h2b: await vbox(pages.nth(1).locator('h2')), ol: await vbox(pages.nth(1).locator('ol')) });
  boxes.print = await grabP();
  console.log('toolbar:', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n/g, ' | '));
  await shot('print');
  await pages.nth(1).locator('ol').evaluate((e) => e.scrollIntoView({ block: 'center' })).catch(() => {});
  await p.waitForTimeout(400);
  boxes.print2 = await grabP(); await shot('print2');
  console.log('answers:', (await pages.nth(1).innerText()).replace(/\n/g, ' | '));
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

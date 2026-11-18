// Real captures of ugabuga.co.il/holidays/hanukkah/grade/grade-2 (src/pages/holidays/HanukkahGrade.jsx,
// src/components/hanukkah/HanukkahGradeSheets.jsx, HanukkahGradeChooser.jsx, src/components/ui/PrintPreview.jsx).
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
    if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('dialog')) e.style.visibility = 'hidden'; }
  });
  const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const shot = async (k) => { await hide(); await p.waitForTimeout(250); return p.screenshot({ path: `shots/${k}.png` }); };

  // 0. the chooser on the Hanukkah hub
  await p.goto('https://ugabuga.co.il/holidays/hanukkah', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  const ch = p.locator('nav[aria-label="חנוכה לפי כיתה"]');
  await scrollTo(ch, 30);
  // mirror the site fix (HanukkahGradeChooser: age ranges wrapped in LRI…PDI so "4–6" is not shown reversed)
  await ch.evaluate((n) => { for (const s of n.querySelectorAll('span span')) if (/^גילאי \d+–\d+$/.test(s.textContent)) s.textContent = s.textContent.replace(/(\d+)–(\d+)/, '⁦$1–$2⁩'); });
  boxes.chooser = { sec: await vbox(ch), h2: await vbox(ch.locator('h2')), items: await Promise.all([0, 1, 2, 3, 4, 5, 6, 7].map((i) => vbox(ch.locator('ul').first().locator('li').nth(i)))), booklets: await vbox(ch.locator('ul').nth(1)) };
  console.log('chooser:', (await ch.innerText()).replace(/\n/g, ' | '));
  await shot('chooser');

  // 1. the grade page
  await p.goto('https://ugabuga.co.il/holidays/hanukkah/grade/grade-2', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  const hero = p.locator('h1').locator('xpath=..');
  await scrollTo(hero, 30);
  boxes.hero = { sec: await vbox(hero), h1: await vbox(hero.locator('h1')), btn: await vbox(hero.locator('button[data-print-main]')), count: await vbox(hero.locator('p').last()) };
  console.log('hero:', (await hero.innerText()).replace(/\n/g, ' | '));
  await shot('hero');

  const set = p.locator('section[aria-labelledby="hg-set"]');
  await scrollTo(set, 30); await p.waitForTimeout(1200);
  boxes.set = { sec: await vbox(set), h2: await vbox(set.locator('h2')), note: await vbox(set.locator('p').first()), cards: await Promise.all([0, 1, 2, 3, 4].map((i) => vbox(set.locator('button').nth(i)))) };
  console.log('set:', (await set.innerText()).replace(/\n/g, ' | '));
  await shot('set');

  const math = p.locator('section[aria-labelledby="hg-math"]');
  await scrollTo(math, 30);
  const mb = async () => ({ sec: await vbox(math), items: await Promise.all([0, 1, 2, 3].map((i) => vbox(math.locator('li').nth(i)))), btn: await vbox(math.getByRole('button', { name: /בעיות אחרות/ })) });
  boxes.math = await mb();
  console.log('math:', (await math.innerText()).replace(/\n/g, ' | '));
  await shot('math');
  await math.locator('summary').first().click(); await p.waitForTimeout(400);
  boxes.mathOpen = await mb();
  console.log('mathOpen:', (await math.locator('li').first().innerText()).replace(/\n/g, ' | '));
  await shot('mathOpen');
  await math.getByRole('button', { name: /בעיות אחרות/ }).click(); await p.waitForTimeout(600);
  boxes.mathNew = await mb();
  console.log('mathNew:', (await math.innerText()).replace(/\n/g, ' | '));
  await shot('mathNew');

  const rd = p.locator('section[aria-labelledby="hg-read"]');
  await scrollTo(rd, 30);
  const rb = async () => ({ sec: await vbox(rd), h2: await vbox(rd.locator('h2')), qs: await vbox(rd.locator('h3')), q: await Promise.all([0, 1, 2, 3, 4].map((i) => vbox(rd.locator('ol > li').nth(i)))) });
  boxes.read = await rb();
  console.log('read:', (await rd.innerText()).replace(/\n/g, ' | ').slice(0, 900));
  await shot('read');
  await rd.locator('summary').nth(2).click(); await p.waitForTimeout(400);
  await scrollTo(rd.locator('h3'), 380);
  boxes.readOpen = await rb();
  console.log('readOpen:', (await rd.locator('ol > li').nth(2).innerText()).replace(/\n/g, ' | '));
  await shot('readOpen');

  // print: the whole set
  await scrollTo(hero, 30);
  await hero.locator('button[data-print-main]').click(); await p.waitForTimeout(3000);
  const dlg = p.locator('dialog.buga-print-dialog');
  const grabD = async () => ({ bar: await vbox(dlg.locator('.buga-print-toolbar')), title: await vbox(dlg.locator('.buga-print-toolbar h2')), refresh: await vbox(dlg.locator('[data-refresh-sheet]')), copies: await vbox(dlg.locator('.buga-print-count')), cls: await vbox(dlg.locator('[data-class-print]')), pdf: await vbox(dlg.locator('[data-save-pdf]')), prt: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), panel: await vbox(dlg.locator('.buga-class-panel')), input: await vbox(dlg.locator('.buga-class-panel input')), make: await vbox(dlg.locator('.buga-class-panel button')), pages: await Promise.all([0, 1, 2].map((i) => vbox(dlg.locator('.buga-preview-pages > *').nth(i)))) });
  await hide();
  boxes.dlg = await grabD();
  console.log('toolbar:', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n/g, ' | ').replace(/ \| \d+ (עותקים|סטים שונים)/g, ''));
  await shot('dlg');
  await dlg.locator('[data-class-print]').click(); await p.waitForTimeout(500);
  await dlg.locator('.buga-class-panel input').fill('28'); await p.waitForTimeout(300);
  await hide();
  boxes.dlgClass = await grabD();
  console.log('class:', (await dlg.locator('.buga-class-panel').innerText()).replace(/\n/g, ' | '));
  await shot('dlgClass');
  // single A4 pages as element shots
  await dlg.locator('[data-class-print]').click(); await p.waitForTimeout(400);
  await p.setViewportSize({ width: VW, height: 1500 }); await p.waitForTimeout(500);
  await p.addStyleTag({ content: '.buga-print-toolbar,.buga-page-options,.buga-print-tip,.buga-class-panel{visibility:hidden!important}' });
  const n = await dlg.locator('.buga-preview-pages > *').count();
  const heads = [];
  for (let i = 0; i < n; i++) heads.push((await dlg.locator('.buga-preview-pages > *').nth(i).innerText().catch(() => '')).split('\n')[0]);
  console.log('pages:', n, heads.join(' | '));
  for (let i = 0; i < n; i++) {
    const el = dlg.locator('.buga-preview-pages > *').nth(i);
    await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(600);
    await el.screenshot({ path: `shots/pg${i}.png` });
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

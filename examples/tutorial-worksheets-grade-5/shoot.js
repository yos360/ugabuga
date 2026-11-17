// Real captures of ugabuga.co.il/booklets/worksheets-grade-5 (src/pages/booklets/BookletPages.jsx,
// src/booklets/worksheetsGrade5.jsx, src/components/ui/PrintPreview.jsx).
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
  await p.goto('https://ugabuga.co.il/booklets/worksheets-grade-5', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  // hero
  const hd = p.locator('header').filter({ has: p.locator('h1') });
  await scrollTo(hd, 30);
  boxes.hero = { sec: await vbox(hd), h1: await vbox(hd.locator('h1')), meta: await vbox(hd.locator('p').first()), btn: await vbox(hd.locator('button')) };
  await shot('hero');
  // contents
  const ct = p.locator('section[aria-label="מה יש בחוברת"]');
  await scrollTo(ct, 30);
  boxes.contents = { sec: await vbox(ct), items: await Promise.all([0, 1, 5, 6, 8, 11, 12, 14, 15, 16].map((i) => vbox(ct.locator('li').nth(i)))) };
  await shot('contents');
  // peek
  const pk = p.locator('section[aria-label="הצצה לעמודים הראשונים"]');
  await scrollTo(pk, 30);
  await p.waitForTimeout(1500);
  boxes.peek = { sec: await vbox(pk), pages: await Promise.all([0, 1, 2, 3].map((i) => vbox(pk.locator('.booklet-peek > * > *').nth(i)))), wrap: await vbox(pk.locator('.booklet-peek')) };
  await shot('peek');
  await scrollTo(pk.locator('button'), 700);
  boxes.peekBtn = { btn: await vbox(pk.locator('button')), wrap: await vbox(pk.locator('.booklet-peek')) };
  await shot('peekBtn');
  // print dialog
  await pk.locator('button').click(); await p.waitForTimeout(2500);
  const dlg = p.locator('dialog.buga-print-dialog');
  const grabD = async () => ({ bar: await vbox(dlg.locator('.buga-print-toolbar')), back: await vbox(dlg.getByRole('button', { name: /חזרה/ })), copies: await vbox(dlg.locator('.buga-print-count')), cls: await vbox(dlg.locator('[data-class-print]')), pdf: await vbox(dlg.locator('[data-save-pdf]')), prt: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), opts: await vbox(dlg.locator('.buga-page-options')), mode: await vbox(dlg.locator('[data-booklet-mode]')), range: await vbox(dlg.locator('[data-booklet-pages]')), out: await vbox(dlg.locator('.buga-page-options output')), pages: await Promise.all([0, 1, 2].map((i) => vbox(dlg.locator('.buga-preview-pages > *').nth(i)))) });
  await hide();
  boxes.dlg = await grabD();
  console.log('toolbar:', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n/g, ' | '));
  console.log('opts:', (await dlg.locator('.buga-page-options').innerText()).replace(/\n/g, ' | '));
  await shot('dlg');
  await dlg.locator('[data-booklet-mode]').selectOption('student'); await p.waitForTimeout(500);
  boxes.dlgStudent = await grabD();
  console.log('student:', (await dlg.locator('.buga-page-options').innerText()).replace(/\n/g, ' | '));
  await shot('dlgStudent');
  await dlg.locator('[data-booklet-mode]').selectOption('teacher'); await p.waitForTimeout(500);
  boxes.dlgTeacher = await grabD();
  console.log('teacher:', (await dlg.locator('.buga-page-options').innerText()).replace(/\n/g, ' | '));
  await shot('dlgTeacher');
  await dlg.locator('[data-booklet-mode]').selectOption('all'); await p.waitForTimeout(300);
  await dlg.locator('[data-booklet-pages]').fill('2-6'); await p.waitForTimeout(600);
  boxes.dlgRange = await grabD();
  console.log('range:', (await dlg.locator('.buga-page-options').innerText()).replace(/\n/g, ' | '));
  await shot('dlgRange');
  // whole booklet again; scroll the preview to a few pages
  await dlg.locator('[data-booklet-pages]').fill(''); await p.waitForTimeout(500);
  // single A4 pages as element shots (toolbar hidden so it does not cover the page)
  await p.setViewportSize({ width: VW, height: 1500 }); await p.waitForTimeout(500);
  await p.addStyleTag({ content: '.buga-print-toolbar,.buga-page-options,.buga-print-tip{visibility:hidden!important}' });
  for (const [k, i] of [['pgCover', 0], ['pgFrac', 3], ['pgRead', 6], ['pgEn', 11], ['pgKey', 15], ['pgCert', 16]]) {
    const el = dlg.locator('.buga-preview-pages > *').nth(i);
    await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(600);
    await el.screenshot({ path: `shots/${k}.png` });
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

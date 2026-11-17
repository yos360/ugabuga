// Real captures of ugabuga.co.il/birthday/spa-party (src/pages/birthday/SpaParty.jsx).
// Age ranges inside Hebrew ("לגילאי 6–8") render reversed on the live site until the ⁦…⁩ fix (same push)
// is deployed, so the DOM is patched the same way before each shot (not inside dir=ltr spans).
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
    for (let n; (n = w.nextNode());) {
      if (n.parentElement && n.parentElement.closest('[dir=ltr]')) continue;
      if (/\d+–\d+/.test(n.nodeValue) && !n.nodeValue.includes('⁦')) n.nodeValue = n.nodeValue.replace(/(\d+–\d+)/g, '⁦$1⁩');
    }
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog') && !e.querySelector('dialog')) e.style.visibility = 'hidden'; }
  });
  const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const shot = async (k) => { await hide(); await p.waitForTimeout(250); return p.screenshot({ path: `shots/${k}.png` }); };
  await p.goto('https://ugabuga.co.il/birthday/spa-party', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  // hero
  await scrollTo(p.locator('h1'), 120);
  boxes.hero = { h1: await vbox(p.locator('h1')), nav: await vbox(p.locator('nav[aria-label="בעמוד הזה"]')) };
  await shot('hero');
  // stations (mask open, young)
  const st = p.locator('#stations');
  await scrollTo(st, 20);
  const heads = st.locator('button[aria-expanded]');
  const grabSt = async () => ({ sec: await vbox(st), young: await vbox(st.getByRole('button', { name: /6–8/ })), older: await vbox(st.getByRole('button', { name: /9–12/ })), heads: await Promise.all([0, 1, 2, 3, 4].map((i) => vbox(heads.nth(i)))), need: await vbox(st.locator('h3').first()), needUl: await vbox(st.locator('ul').first()), how: await vbox(st.locator('ol').first()), tip: await vbox(st.locator('p').first()), safety: await vbox(st.locator('p').nth(1)) });
  boxes.stYoung = await grabSt(); await shot('stYoung');
  console.log('tipYoung:', await st.locator('p').first().innerText());
  await st.getByRole('button', { name: /9–12/ }).click(); await p.waitForTimeout(300);
  boxes.stOld = await grabSt(); await shot('stOld');
  console.log('tipOld:', await st.locator('p').first().innerText());
  // schedule
  const sc = p.locator('#schedule');
  await scrollTo(sc, 20);
  boxes.sched = { sec: await vbox(sc), rows: await Promise.all([0, 1, 2, 3, 4, 5, 6].map((i) => vbox(sc.locator('li').nth(i)))), note: await vbox(sc.locator('ol + p')) };
  await shot('sched');
  console.log('sched:', (await sc.locator('ol').innerText()).replace(/\n/g, ' | '));
  // shopping
  const sh = p.locator('#shopping');
  await scrollTo(sh, 20);
  const range = sh.locator('input[type=range]');
  const grabSh = async () => ({ sec: await vbox(sh), range: await vbox(range), n: await vbox(sh.locator('#kids-n')), table: await vbox(sh.locator('table')), rows: await Promise.all([0, 1, 4, 6, 8, 9].map((i) => vbox(sh.locator('tbody tr').nth(i)))), total: await vbox(sh.locator('p').filter({ hasText: 'סך הכול' })), note: await vbox(sh.locator('p').last()) });
  boxes.shop10 = await grabSh(); await shot('shop10');
  await range.evaluate((e) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, '14'); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(300);
  boxes.shop14 = await grabSh(); await shot('shop14');
  console.log('total14:', await sh.locator('p').filter({ hasText: 'סך הכול' }).innerText());
  // print section
  const pr = p.locator('#print');
  await scrollTo(pr, 20);
  const grabPr = async () => ({ sec: await vbox(pr), color: await vbox(pr.getByRole('button', { name: /צבעונית/ })), bw: await vbox(pr.getByRole('button', { name: /לצביעה/ })), all: await vbox(pr.locator('[data-print-main]')), cards: await Promise.all([0, 1, 2].map((i) => vbox(pr.locator('button[aria-label^="הדפסה"]').nth(i)))) });
  boxes.prColor = await grabPr(); await shot('prColor');
  await pr.getByRole('button', { name: /לצביעה/ }).click(); await p.waitForTimeout(300);
  boxes.prBw = await grabPr(); await shot('prBw');
  await pr.getByRole('button', { name: /צבעונית/ }).click(); await p.waitForTimeout(300);
  await pr.locator('[data-print-main]').click(); await p.waitForTimeout(2000);
  const dlg = p.locator('dialog.buga-print-dialog');
  await hide();
  boxes.print = { bar: await vbox(dlg.locator('.buga-print-toolbar')), pdf: await vbox(dlg.locator('[data-save-pdf]')), prt: await vbox(dlg.getByRole('button', { name: /הדפסה/ }).last()), pages: await Promise.all([0, 1, 2].map((i) => vbox(dlg.locator('.buga-preview-pages > *').nth(i)))) };
  console.log('toolbar:', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n/g, ' | '));
  await shot('print');
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

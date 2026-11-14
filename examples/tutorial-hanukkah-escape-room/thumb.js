// Thumbnail 1280×720: the mascot big + the tool name (owner's rule, 2026-11-04).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const { pathToFileURL } = require('url');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto(pathToFileURL(__dirname + '/thumb.html').href);
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'thumbnail.jpg', type: 'jpeg', quality: 90 });
  await b.close();
})();

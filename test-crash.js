const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    console.log(`PAGE EXCEPTION: ${err.message}`);
    console.log(err.stack);
  });

  await page.goto('http://localhost:3000/flows/2b96f10c-6b88-479c-a9fb-a64b63586e15');
  await page.waitForTimeout(5000);
  await browser.close();
})();

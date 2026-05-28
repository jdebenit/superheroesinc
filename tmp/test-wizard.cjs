const puppeteer = require('puppeteer-core');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  console.log('Monitoring console errors...');
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE - ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', err => {
    console.log('[BROWSER RUNTIME ERROR]:', err.message);
  });

  console.log('Navigating to live server...');
  try {
    await page.goto('https://www.superheroes-inc.es/recursos/wizard-fullscreen/', {
      waitUntil: 'networkidle0',
    });
    console.log('Navigation completed.');

    // 1. Click "Alterado" origin card
    console.log('Clicking Alterado card...');
    const cards = await page.$$('.step1-origin-card');
    // Alterado is index 3 in the array of origins
    if (cards.length > 3) {
      await cards[3].click();
      console.log('Alterado card clicked.');
      await new Promise(r => setTimeout(r, 500));
    }

    // 2. Select a subtype for Alterado if required (let's check if there are subtypes)
    // Alterado has subtypes. Let's see if we can find them.
    const subtypeLabels = await page.$$('.step1-subtype-chips-container label');
    if (subtypeLabels.length > 0) {
      console.log('Clicking first subtype chip...');
      await subtypeLabels[0].click();
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Go to Step 3 (Especial)
    console.log('Navigating to Step 3...');
    const tabs = await page.$$('.wizard-tab');
    if (tabs.length > 2) {
      await tabs[2].click();
      console.log('Step 3 clicked, waiting 1s...');
      await new Promise(r => setTimeout(r, 1000));
    }

    // Save screenshot of Step 3
    const screenshotPath = path.join(__dirname, 'wizard_preview.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Saved screenshot of Step 3 to:', screenshotPath);
  } catch (error) {
    console.error('Error during test:', error);
  }

  await browser.close();
}

run().catch(console.error);

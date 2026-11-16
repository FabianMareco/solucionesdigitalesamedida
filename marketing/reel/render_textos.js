// Genera las placas de texto transparentes (1080x1920) a partir de textos.html
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(__dirname, 'textos.html'));
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['t1', 't2', 't3', 't4']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'build', `texto_${id}.png`), omitBackground: true });
  }
  await b.close();
  console.log('ok');
})();

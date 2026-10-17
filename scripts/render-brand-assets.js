// Render the existing vector brand mark into deterministic native assets.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const source = fs.readFileSync('apps/mobile/src/features/brand/AppIcon.tsx', 'utf8');
  const mark = source.match(/d="(M30[^\"]+)"/)?.[1];
  if (!mark) throw new Error('AppIcon leaf path changed; update the asset renderer.');
  const gradient = '<defs><linearGradient id="tile" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#3D9A86"/><stop offset="1" stop-color="#25685A"/></linearGradient></defs>';
  const leaf = `<path d="${mark}" fill="none" stroke="white" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const background = '<rect width="100" height="100" fill="url(#tile)"/>';
  const rounded = '<rect width="100" height="100" rx="22.5" fill="url(#tile)"/>';
  const specs = [
    ['icon.png', 1024, background + leaf],
    ['android-icon-background.png', 1024, background],
    ['android-icon-foreground.png', 1024, leaf],
    ['android-icon-monochrome.png', 1024, leaf],
    ['splash-icon.png', 1024, rounded + leaf],
    ['favicon.png', 64, rounded + leaf],
  ];
  const browser = await chromium.launch();
  try {
    for (const [name, size, artwork] of specs) {
      const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
      await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${gradient}${artwork}</svg>`);
      await page.screenshot({ path: path.join('apps/mobile/assets/images', name), omitBackground: true });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log('Rendered six brand assets from AppIcon.');
})().catch((error) => { console.error(error); process.exitCode = 1; });

import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import catalog from '../../mobile/src/i18n/en.ts';

const c = catalog.web.landing;
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const asset = async (name) => `data:image/png;base64,${(await readFile(new URL(`../src/assets/${name}.png`, import.meta.url))).toString('base64')}`;
const output = new URL('../public/og-image.png', import.meta.url);
await mkdir(new URL('../public/', import.meta.url), { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;background:#f8f9f3;color:#163d33;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
    .canvas{width:1200px;height:630px;position:relative;overflow:hidden;padding:52px 64px}
    .brand{display:flex;align-items:center;gap:12px;font-size:29px;font-weight:700;letter-spacing:-1.6px}.brand img{width:45px;height:45px;border-radius:12px}
    .eyebrow{margin:60px 0 22px;font-size:11px;letter-spacing:1.7px;font-weight:700;color:#245c49}
    h1{font-size:79px;font-weight:570;letter-spacing:-4.8px;line-height:1.06;margin:0;max-width:680px}h1 span{color:#5d7d64}
    .proof{font-size:23px;margin:28px 0 0;color:#57665d;letter-spacing:-.5px}
    .launch{position:absolute;left:64px;bottom:54px;font-size:15px;letter-spacing:.1px;color:#245c49;display:flex;align-items:center;gap:9px}.dot{width:7px;height:7px;background:#245c49;border-radius:50%}
    .stage{position:absolute;left:765px;top:82px;width:379px;height:570px;background:#dce8d2;border-radius:200px 200px 20px 20px}
    .orbit{position:absolute;left:735px;top:188px;width:340px;height:340px;border-radius:50%;border:1px solid #b6c9aa}
    .phone{position:absolute;left:822px;top:38px;width:267px;padding:6px;background:#161b16;border:1px solid #343a33;border-radius:38px;transform:rotate(4deg);box-shadow:18px 26px 32px -18px #24372277;overflow:hidden}.phone img{display:block;width:100%;border-radius:31px}
    .spark{position:absolute;left:766px;top:495px;font-size:66px;line-height:1;color:#426e45;transform:rotate(15deg)}
  </style></head><body><div class="canvas">
    <div class="brand"><img src="${await asset('icon')}" alt="">${escape(catalog.web.brand)}</div>
    <p class="eyebrow">${escape(c.eyebrow)}</p>
    <h1>${escape(c.titleStart)}<br><span>${escape(c.titleEnd)}</span></h1>
    <p class="proof">${escape(c.proof)}</p>
    <div class="launch">${escape(c.launchTitle)} ${escape(c.launchAvailability)}</div>
    <div class="stage"></div><div class="orbit"></div>
    <div class="phone"><img src="${await asset('app-result')}" alt="${escape(c.resultAlt)}"></div>
    <span class="spark" aria-hidden="true">✳</span>
  </div></body></html>`);
  await page.locator('img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.screenshot({ path: fileURLToPath(output), type: 'png' });
  console.log(fileURLToPath(output));
} finally {
  await browser.close();
}

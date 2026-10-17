import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('dist');
const screenshots = resolve('artifacts');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : extname(pathname) ? pathname : `${pathname}/index.html`;
  const filePath = resolve(root, `.${relativePath}`);
  if (!filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(400).end();
    return;
  }
  try {
    const data = await readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' }).end(data);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('The local smoke-test server did not start.');
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
const pageErrors = [];
const consoleErrors = [];
const externalRequests = [];
const dialogs = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('request', (request) => { if (new URL(request.url()).origin !== origin) externalRequests.push(request.url()); });
page.on('dialog', async (dialog) => { dialogs.push(dialog.type()); await dialog.dismiss(); });

try {
  const routes = ['/', '/height-predictor/', '/method/', '/pricing/', '/privacy/', '/terms/', '/support/', '/r/?h=171-181&u=cm'];
  const routeStatuses = {};
  for (const route of routes) {
    const response = await page.goto(`${origin}${route}`);
    routeStatuses[route] = response?.status() ?? 0;
    assert.equal(routeStatuses[route], 200, `${route} should return HTTP 200`);
  }

  await page.goto(`${origin}/`);
  const schemaTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')['@type']));
  assert.deepEqual(schemaTypes, ['WebApplication', 'FAQPage']);
  await mkdir(screenshots, { recursive: true });
  await page.screenshot({ path: `${screenshots}/home-light-mobile.png`, fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: `${screenshots}/home-dark-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 320, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  assert.equal(overflow, false, 'the 320px layout should not overflow horizontally');

  await page.goto(`${origin}/height-predictor/`);
  const fillMetricProfile = async () => {
    await page.locator('[name="heightUnit"]').selectOption('cm');
    await page.locator('[name="heightCm"]').fill('150');
    await page.locator('[name="motherCm"]').fill('165');
    await page.locator('[name="fatherCm"]').fill('180');
  };
  const calculate = () => page.getByRole('button', { name: /See my free estimate/ }).click();
  await fillMetricProfile();
  await calculate();
  const noWeightResult = await page.locator('#result').innerText();
  assert.match(noWeightResult, /Add weight to enable Khamis–Roche/);
  assert.doesNotMatch(noWeightResult, /Khamis–Roche:/);
  assert.match(noWeightResult, /Mid-parental height:/);
  assert.match(noWeightResult, /Percentile projection:/);

  await page.locator('[name="weight"]').fill('45');
  assert.equal(await page.locator('#result').isVisible(), false, 'editing an input must hide the old result');
  await calculate();
  const withWeightResult = await page.locator('#result').innerText();
  assert.match(withWeightResult, /Khamis–Roche:/);

  await page.locator('[name="motherCm"]').fill('');
  await calculate();
  assert.match(await page.locator('[data-result-parent]').innerText(), /One parent’s height was not entered/);
  await page.locator('[name="fatherCm"]').fill('');
  await calculate();
  assert.equal(await page.locator('#result').isVisible(), false, 'invalid submissions must hide any previous result');
  assert.match(await page.locator('#form-error').innerText(), /Add at least one parent height/);

  await page.locator('[name="heightUnit"]').selectOption('ftin');
  await page.locator('[name="heightFt"]').fill('4.5');
  await page.locator('[name="heightIn"]').fill('0');
  await page.locator('[name="motherFt"]').fill('5');
  await page.locator('[name="motherIn"]').fill('5');
  await page.locator('[name="fatherFt"]').fill('5');
  await page.locator('[name="fatherIn"]').fill('11');
  await calculate();
  assert.match(await page.locator('#form-error').innerText(), /whole feet/);
  await page.locator('[name="heightFt"]').fill('4');
  await page.locator('[name="heightIn"]').fill('12');
  await calculate();
  assert.match(await page.locator('#form-error').innerText(), /0 to 11 inches/);

  await page.locator('[name="heightUnit"]').selectOption('cm');
  await page.locator('[name="heightCm"]').fill('152');
  await page.locator('[name="heightUnit"]').selectOption('ftin');
  await page.locator('[name="heightUnit"]').selectOption('cm');
  assert.equal(await page.locator('[name="heightCm"]').inputValue(), '152', 'unit round-trip must preserve the metric value');

  await page.goto(`${origin}/r/?h=171-181&u=cm`);
  assert.equal(await page.locator('[data-share-range]').innerText(), '171–181 cm');
  await page.goto(`${origin}/r/?h=%3Cscript%3Ealert(1)%3C%2Fscript%3E&u=cm`);
  assert.equal(await page.locator('[data-share-error]').isVisible(), true, 'invalid share parameters should show an error');
  assert.deepEqual(dialogs, [], 'share parameters must never execute as markup or script');

  assert.deepEqual(pageErrors, [], 'there should be no uncaught browser errors');
  assert.deepEqual(consoleErrors, [], 'there should be no browser console errors');
  assert.deepEqual(externalRequests, [], 'the local site should make no external requests');
  console.log(JSON.stringify({ routeStatuses, schemaTypes, overflow, screenshots, noWeightMethods: ['Mid-parental height', 'Percentile projection'], weightEnablesKhamisRoche: true, unknownParentCovered: true, invalidImperialInputsRejected: true, precisionRoundTrip: '152 cm preserved', shareQueryCovered: true, invalidShareRejected: true, pageErrors, consoleErrors, externalRequests, dialogs }, null, 2));
} finally {
  await browser.close();
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()));
}

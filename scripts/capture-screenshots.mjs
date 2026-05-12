#!/usr/bin/env node
/**
 * Capture Play Store screenshots from the production build.
 *
 * Setup (one-time):
 *   npm install --no-save playwright
 *   npx playwright install chromium
 *
 * Run:
 *   npm run build
 *   npx vite preview --port 5188 &
 *   node scripts/capture-screenshots.mjs
 *   pkill -f "vite preview"
 *
 * Output: docs/screenshots/0X_<name>.png at 1080x1920 (Play Store recommended)
 */

import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const URL = process.env.HOMESTOCK_URL || 'http://localhost:5188';

const ROUTES = [
  { path: '/', name: '01_dashboard' },
  { path: '/items', name: '02_items' },
  { path: '/add', name: '03_add' },
  { path: '/expiry', name: '04_expiry' },
  { path: '/stock', name: '05_stock' },
  { path: '/locations', name: '06_locations' },
  { path: '/shopping', name: '07_shopping' },
  { path: '/analytics', name: '08_analytics' },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
// Phone-shaped viewport (Pixel 6 dimensions) at high DPR → final image ~1080x2400, ideal for Play Store
const ctx = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

console.log(`Loading ${URL}...`);
await page.goto(URL);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(800);

// Skip onboarding by setting nickname directly
await page.evaluate(async () => {
  // Set onboarding-complete settings + load demo data
  const idbReq = indexedDB.open('HomeStockDB', 1);
  await new Promise((r) => (idbReq.onsuccess = r));
  const db = idbReq.result;
  const tx = db.transaction('settings', 'readwrite');
  const existing = await new Promise((r) => {
    const g = tx.objectStore('settings').get('app');
    g.onsuccess = () => r(g.result);
  });
  await new Promise((r) => {
    const put = tx.objectStore('settings').put({
      ...(existing || {}),
      key: 'app',
      nickname: '柴琳',
      role: '家庭主管',
      familySize: 3,
      theme: 'warm',
      listStyle: 'grid',
      defaultSort: 'expiry_asc',
      expiryThresholdDays: 3,
      defaultMinStockRatio: 0.2,
      notifications: { expiring: true, expired: true, lowStock: true, shoppingUpdate: true, weeklyReport: false, monthlySummary: true, dndEnabled: true },
      quietHours: { start: '22:00', end: '07:00' },
      onboardedAt: Date.now(),
    });
    put.onsuccess = r;
  });
  await new Promise((r) => (tx.oncomplete = r));
});

console.log('Loading demo data...');
await page.reload();
await page.waitForTimeout(800);
await page.goto(URL + '/#/settings');
await page.waitForTimeout(600);
page.on('dialog', (d) => d.accept());
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(200);
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.action-btn')];
  const demoBtn = btns.find((b) => b.textContent.includes('加载演示数据'));
  if (demoBtn) demoBtn.click();
});
await page.waitForTimeout(3000);

for (const r of ROUTES) {
  console.log(`Capturing ${r.path} → ${r.name}.png`);
  await page.goto(URL + '/#' + r.path);
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: path.join(OUT_DIR, `${r.name}.png`),
    fullPage: false,
  });
}

await browser.close();
console.log(`\nDone. ${ROUTES.length} screenshots saved to ${OUT_DIR}`);

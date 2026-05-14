#!/usr/bin/env node
/**
 * Capture optional 7-inch and 10-inch tablet screenshots for Play Store.
 * Run after: npx vite preview --port 5188 &
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'http://localhost:5188';

const CONFIGS = [
  {
    name: '7-inch',
    dir: 'tablet-7',
    viewport: { width: 600, height: 960 },
    dpr: 2,
  },
  {
    name: '10-inch',
    dir: 'tablet-10',
    viewport: { width: 800, height: 1280 },
    dpr: 2,
  },
];

const ROUTES = [
  { path: '/', name: '01_dashboard' },
  { path: '/items', name: '02_items' },
  { path: '/expiry', name: '03_expiry' },
  { path: '/stock', name: '04_stock' },
  { path: '/analytics', name: '05_analytics' },
];

for (const cfg of CONFIGS) {
  const outDir = path.join(__dirname, '..', 'docs', 'play-store-submission', 'graphics', 'screenshots', cfg.dir);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n== ${cfg.name} (${cfg.viewport.width}x${cfg.viewport.height}) ==`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: cfg.viewport,
    deviceScaleFactor: cfg.dpr,
    isMobile: false,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Set onboarded state
  await page.evaluate(async () => {
    const req = indexedDB.open('HomeStockDB', 1);
    await new Promise((r) => (req.onsuccess = r));
    const db = req.result;
    const tx = db.transaction('settings', 'readwrite');
    await new Promise((r) => {
      tx.objectStore('settings').put({
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
      }).onsuccess = r;
    });
  });

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
  await page.waitForTimeout(2500);

  for (const r of ROUTES) {
    console.log(`  ${r.name}.png`);
    await page.goto(URL + '/#' + r.path);
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(outDir, `${r.name}.png`), fullPage: false });
  }

  await browser.close();
}

console.log('\nDone.');

# HomeStock 悦家库存 v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Vue 3 + Vite + IndexedDB + Capacitor 6 mobile app implementing the "悦家库存" household inventory management system, ready for Google Play Store submission.

**Architecture:** Pure-frontend SPA with IndexedDB local persistence. Mobile-first layout (bottom tab nav + FAB + drawer) with responsive desktop fallback. ECharts for visualizations, Pinia for state. Wrapped in Capacitor Android for Play Store distribution.

**Tech Stack:** Vue 3.4, Vite 5, Vue Router 4 (hash mode), Pinia 2, idb 8, ECharts 5, dayjs 1.11, Capacitor 6, Vitest, fake-indexeddb, ESLint 9, Prettier 3.

**Spec:** [2026-05-13-homestock-design.md](../specs/2026-05-13-homestock-design.md)

---

## Phase 1 — Foundation

### Task 1: Scaffold Vite + Vue 3 project

**Files:**
- Create: `~/projects/homestock/package.json`
- Create: `~/projects/homestock/vite.config.js`
- Create: `~/projects/homestock/index.html`
- Create: `~/projects/homestock/.gitignore`

- [ ] Write `package.json` with exact dependencies (vue 3.4, vue-router 4.3, pinia 2.1, echarts 5.5, idb 8, dayjs 1.11) and devDeps (vite 5.2, @vitejs/plugin-vue 5, vitest 1.6, @vitest/coverage-v8, fake-indexeddb 6, eslint 9, @vue/eslint-config-prettier, prettier 3, jsdom)
- [ ] Write `vite.config.js` with `base: './'`, alias `@`→`src`, manualChunks for vue/echarts/utils
- [ ] Write `index.html` with `<div id="app"></div>`, viewport meta, theme-color meta
- [ ] Write `.gitignore` (node_modules, dist, android/app/build, .DS_Store, *.jks, keystore.properties)
- [ ] Run `cd ~/projects/homestock && npm install`; expect 0 vulns
- [ ] Commit: `feat: scaffold Vite + Vue 3 project`

### Task 2: ESLint + Prettier + Vitest config

**Files:**
- Create: `eslint.config.js` (flat config)
- Create: `.prettierrc`
- Create: `vitest.config.js`
- Modify: `package.json` (add scripts: dev, build, preview, test, test:cov, lint, format)

- [ ] Write ESLint flat config: vue recommended + prettier + custom rules (no-unused-vars: warn, vue/multi-word-component-names: off)
- [ ] Write `.prettierrc`: `{ "singleQuote": true, "semi": true, "printWidth": 100, "trailingComma": "all" }`
- [ ] Write `vitest.config.js` with jsdom environment + setupFiles for fake-indexeddb global
- [ ] Add `tests/setup.js`: `import 'fake-indexeddb/auto';`
- [ ] Add npm scripts
- [ ] Run `npm run lint`; expect 0 errors (no source yet)
- [ ] Commit: `chore: add lint + prettier + vitest config`

### Task 3: Project folder structure + global styles + themes

**Files:**
- Create: `src/main.js`
- Create: `src/App.vue` (placeholder shell)
- Create: `src/styles/global.css`
- Create: `src/styles/themes.css`
- Create: `src/styles/utilities.css`
- Create folders: `src/{views,components/{layout,charts},stores,services,constants,utils}`, `tests`, `public/icons`

- [ ] Create empty folders (use `.gitkeep`)
- [ ] Write `src/styles/themes.css` with 3 themes (warm / dark / fresh) as `:root[data-theme="..."]` CSS variables (see spec §5.2)
- [ ] Write `src/styles/global.css`: reset, font stack `-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`, body bg `var(--color-bg)`, color `var(--color-text)`, `body { padding-bottom: env(safe-area-inset-bottom); }`
- [ ] Write `src/styles/utilities.css`: `.card`, `.stat-card`, `.btn-primary`, `.btn-secondary`, `.badge-*`, `.text-muted`, `.gradient-primary`
- [ ] Write `src/main.js`: createApp, mount, import styles, init IndexedDB (placeholder for now), apply saved theme to `<html>`
- [ ] Write placeholder `App.vue` with just `<div>HomeStock booting...</div>`
- [ ] Run `npm run dev`, open localhost:5173, verify booting message + warm bg
- [ ] Commit: `feat: project skeleton + themes`

---

## Phase 2 — Data Layer (TDD)

### Task 4: Constants — categories + locations + thresholds

**Files:**
- Create: `src/constants/categories.js`
- Create: `src/constants/locations.js`
- Create: `src/constants/thresholds.js`

- [ ] `categories.js`: export `CATEGORIES` (8 items per spec §4.2) and helper `categoryByKey(key)`
- [ ] `locations.js`: export `DEFAULT_LOCATIONS` (12 items per spec §4.3) and `locationById(id)`
- [ ] `thresholds.js`: export `EXPIRY_LEVELS = { urgent: 2, warning: 7, info: 30 }`, `DEFAULT_MIN_STOCK_RATIO: 0.2`, `STORE_ROUTING: { food: '盒马生鲜', drug: '京东大药房', ... }`
- [ ] Commit: `feat: constants for categories, locations, thresholds`

### Task 5: dateService with TDD

**Files:**
- Create: `tests/dateService.test.js`
- Create: `src/services/dateService.js`

- [ ] Write tests covering: `daysUntilExpiry`, `classifyExpiry` for boundaries day=-1, 0, 1, 2, 3, 7, 8, 30, 31; `formatDate`, `formatRelative`
- [ ] Run `npm test`; expect FAIL (module not found)
- [ ] Implement `dateService.js`:
  - `daysUntilExpiry(dateStr)` using dayjs.diff
  - `classifyExpiry(days)` returns 'expired'|'urgent'|'warning'|'info'|'fresh'
  - `formatDate(date, fmt='YYYY-MM-DD')`
  - `formatRelative(date)` returns "X 天后过期" / "已过期 X 天"
- [ ] Run `npm test`; expect PASS
- [ ] Commit: `feat: dateService with expiry classification`

### Task 6: format utils with TDD

**Files:**
- Create: `tests/format.test.js`
- Create: `src/utils/format.js`

- [ ] Write tests: `formatMoney(0) === '¥0.00'`, `formatMoney(1234.5) === '¥1,234.50'`, `formatQty(12, '盒') === '12 盒'`, `formatPercent(0.456) === '45.6%'`
- [ ] Run tests; expect FAIL
- [ ] Implement: `formatMoney`, `formatQty`, `formatPercent`, `truncate(str, n)`
- [ ] Run tests; expect PASS
- [ ] Commit: `feat: format utilities`

### Task 7: IndexedDB schema + idb wrapper

**Files:**
- Create: `tests/db.test.js`
- Create: `src/services/db.js`

- [ ] Write integration test (with fake-indexeddb): initDatabase creates 6 stores (items/categories/locations/consumptions/shoppingList/settings) with correct indices; second init reuses existing
- [ ] Run test; expect FAIL
- [ ] Implement `db.js`: `openDB('HomeStockDB', 1, { upgrade(db) {...} })`; create 6 stores + indices; export `getDB()`
- [ ] Run test; expect PASS
- [ ] Commit: `feat: IndexedDB schema with 6 stores`

### Task 8: storageService CRUD with tests

**Files:**
- Create: `tests/storageService.test.js`
- Create: `src/services/storageService.js`

- [ ] Write tests: addItem returns id; getItem; updateItem; deleteItem; queryItemsByCategory; queryItemsByExpiryRange; bulk operations
- [ ] Run tests; expect FAIL
- [ ] Implement `storageService.js`:
  - Items: `addItem`, `getItem`, `updateItem`, `deleteItem`, `getAllItems`, `getItemsByCategory`, `getItemsByLocation`, `getActiveItems`, `getExpiredItems`
  - Categories: `getAllCategories`, `saveCategory`, `deleteCategory`
  - Locations: `getAllLocations`, `saveLocation`, `deleteLocation`
  - Consumptions: `addConsumption`, `getConsumptionsByItem`, `getConsumptionsInRange`
  - ShoppingList: `addShoppingItem`, `markDone`, `getPending`, `getCompleted`, `removeShoppingItem`
  - Settings: `getSettings`, `saveSettings`
  - `seedDefaults()`: idempotent insert of CATEGORIES + DEFAULT_LOCATIONS + default settings if absent
  - `exportAll()` → JSON, `importAll(json)` → restore
- [ ] Run tests; expect PASS
- [ ] Commit: `feat: storageService with full CRUD + import/export`

### Task 9: algorithmService with TDD

**Files:**
- Create: `tests/algorithmService.test.js`
- Create: `src/services/algorithmService.js`

- [ ] Write tests:
  - `predictDaysToEmpty(currentQty=10, consumptions=[...]) === expected`
  - `predictDaysToEmpty` with no consumptions returns Infinity
  - `shouldAutoBuy(item)` triggers when daysToEmpty<7 OR currentQty<=minStock
  - `recommendStore('food') === '盒马生鲜'`
  - `calculateWasteRate(items)` returns wasted amount / total
- [ ] Run; expect FAIL
- [ ] Implement `algorithmService.js` per spec §6
- [ ] Run; expect PASS
- [ ] Commit: `feat: algorithmService for stock prediction + auto-buy`

### Task 10: Pinia stores

**Files:**
- Create: `src/stores/items.js`, `categories.js`, `locations.js`, `consumptions.js`, `shopping.js`, `settings.js`

- [ ] `items.js`: state `{ list, loading }`; actions: `loadAll`, `add`, `update`, `remove`, `markConsumed`; getters: `byCategory`, `expiringSoon`, `expired`, `lowStock`
- [ ] `categories.js`: state + crud + getter `enabled`
- [ ] `locations.js`: state + crud + getter `byId`, `withCounts` (joins items)
- [ ] `consumptions.js`: state + add + queries (`recentByItem`, `dailyDistribution`, `topConsumed`)
- [ ] `shopping.js`: state + crud + `autoSync()` (run algorithmService over items, insert auto entries)
- [ ] `settings.js`: state + load/save + watcher to apply theme to `<html>`
- [ ] Commit: `feat: Pinia stores for all entities`

### Task 11: demoData utility

**Files:**
- Create: `src/utils/demoData.js`

- [ ] Generate ~30 demo items spread across 8 categories and 12 locations, with realistic names matching screenshots (伊利纯牛奶 250ml, 全麦切片面包, 土鸡蛋 30 枚, etc.), expiry dates spanning today-30 to today+180
- [ ] Generate ~50 consumption records over past 60 days
- [ ] Export `loadDemoData()` function that calls storageService bulk inserts
- [ ] Export `clearAllData()` that wipes user data (preserves categories + locations)
- [ ] Commit: `feat: demo data generator`

---

## Phase 3 — Shell & Navigation

### Task 12: Router with 12 routes + onboarding gate

**Files:**
- Create: `src/router.js`

- [ ] Define routes per spec §3 project structure
- [ ] `beforeEach` guard: if `settings.nickname` empty AND not on `/onboarding`, redirect to `/onboarding`
- [ ] Update document.title with `meta.title`
- [ ] Commit: `feat: router with onboarding gate`

### Task 13: AppShell + BottomTabBar + AppBar

**Files:**
- Create: `src/components/layout/AppShell.vue`
- Create: `src/components/layout/AppBar.vue`
- Create: `src/components/layout/BottomTabBar.vue`

- [ ] `AppShell.vue`: layout with `<AppBar>` + `<router-view>` + `<BottomTabBar>`; hides nav on `/onboarding`
- [ ] `AppBar.vue`: title slot + search icon + notification bell with badge count (from pinia)
- [ ] `BottomTabBar.vue`: 5 tabs (🏡总览 / 📋物资 / ➕入库[FAB凸起] / 🔔临期 / 👤我的); active state with chunky underline + color; FAB has gradient bg + scale-up animation
- [ ] Mobile-first CSS with safe-area-inset-bottom
- [ ] Commit: `feat: app shell + bottom tab nav`

### Task 14: Update App.vue + main.js to wire everything

**Files:**
- Modify: `src/App.vue`
- Modify: `src/main.js`

- [ ] `App.vue`: `<AppShell>` wrapping `<router-view>`
- [ ] `main.js`: install Pinia + Router; call `initDatabase()` + `seedDefaults()` before mount; load settings + apply theme; if settings.nickname empty → router will redirect
- [ ] Run `npm run dev`, open localhost:5173, should land on `/onboarding`
- [ ] Commit: `feat: wire app shell + router + stores`

### Task 15: Onboarding view

**Files:**
- Create: `src/views/Onboarding.vue`

- [ ] 3-step wizard: 欢迎 → 设置昵称（必填，2-20 字符）→ 选主题（warm/dark/fresh）→ 完成
- [ ] Gradient bg matching login screen aesthetic (陶土橙+暖黄+嫩绿)
- [ ] On finish: save settings, router.push('/')
- [ ] Commit: `feat: onboarding flow`

---

## Phase 4 — Shared UI Components

### Task 16: StatCard + StatusBadge + EmptyState

**Files:**
- Create: `src/components/StatCard.vue`
- Create: `src/components/StatusBadge.vue`
- Create: `src/components/EmptyState.vue`

- [ ] `StatCard.vue`: props `{ label, value, unit, icon, variant: 'primary'|'warning'|'danger'|'success'|'info' }`; primary variant uses gradient bg
- [ ] `StatusBadge.vue`: props `{ status: 'fresh'|'info'|'warning'|'urgent'|'expired' }`; outputs colored pill with label
- [ ] `EmptyState.vue`: props `{ icon, title, hint, actionLabel?, @action }`; centered with illustration
- [ ] Commit: `feat: shared components — stat card, badge, empty state`

### Task 17: ItemCard + ExpiryCard + LocationCard

**Files:**
- Create: `src/components/ItemCard.vue`
- Create: `src/components/ExpiryCard.vue`
- Create: `src/components/LocationCard.vue`

- [ ] `ItemCard.vue`: props `item`; emits `@click`; shows icon + name + category + location + qty + expiry badge; hover lifts 4px
- [ ] `ExpiryCard.vue`: variant of ItemCard with left colored edge bar (red/orange/yellow per status) + large countdown number on right + "建议" text
- [ ] `LocationCard.vue`: gradient colored bg + icon + name + description + itemCount + expiringCount
- [ ] Commit: `feat: item / expiry / location cards`

### Task 18: CategoryTabs + ProgressRing

**Files:**
- Create: `src/components/CategoryTabs.vue`
- Create: `src/components/ProgressRing.vue`

- [ ] `CategoryTabs.vue`: horizontal scrollable tab bar; "全部" + 8 categories; active tab has gradient bg; emits `@change(key)`
- [ ] `ProgressRing.vue`: SVG circle progress; props `{ percent, color, size, label }`; smooth animated stroke-dashoffset
- [ ] Commit: `feat: category tabs + progress ring`

### Task 19: Chart wrapper components

**Files:**
- Create: `src/components/charts/LineChart.vue`
- Create: `src/components/charts/BarChart.vue`
- Create: `src/components/charts/DoughnutChart.vue`
- Create: `src/components/charts/HorizontalBarChart.vue`

- [ ] Each: dynamically imports ECharts core + relevant modules + canvas renderer (tree-shaken); uses `<ResizeObserver>` to re-render on container resize; theme-aware colors from CSS vars; props `{ data, options? }`
- [ ] LineChart: with shadow area fill, mark high/low points
- [ ] BarChart: vertical bars, support color array per bar
- [ ] DoughnutChart: ring chart with center label
- [ ] HorizontalBarChart: ranking display
- [ ] Commit: `feat: ECharts wrapper components`

---

## Phase 5 — Page Implementations

### Task 20: Dashboard view

**Files:**
- Create: `src/views/Dashboard.vue`

- [ ] 4 StatCards (总数/临期/不足/本月节约) — primary card uses gradient
- [ ] 8-cell category quick-access grid (each links to /items?cat=xxx)
- [ ] "临期物品提醒" list (top 5 by daysUntilExpiry, red→orange)
- [ ] "库存不足" list (top 4 by stock ratio)
- [ ] BarChart 本月消耗 Top 5 + DoughnutChart 存放位置分布 + Timeline 近期动态
- [ ] Commit: `feat(view): Dashboard`

### Task 21: Items view (物资清单)

**Files:**
- Create: `src/views/Items.vue`

- [ ] CategoryTabs at top
- [ ] Toolbar: search input + sort select + grid/list view toggle
- [ ] Grid: ItemCard 2 cols on mobile, 4 on desktop
- [ ] Empty state when filtered list empty
- [ ] Tap card → detail bottom sheet (edit qty / mark consumed / delete)
- [ ] Commit: `feat(view): Items shelf-grid`

### Task 22: AddItem view

**Files:**
- Create: `src/views/AddItem.vue`

- [ ] Category picker grid (8 cells)
- [ ] Form: name, brand, spec, qty (with -/+ stepper), unit, purchaseDate, expiryDate, price, note
- [ ] Live warning when expiryDate ≤ 7 days from today
- [ ] Location picker (12 cells)
- [ ] 4 quick templates (乳制品/蔬果/烘焙/药品) populate default duration + location
- [ ] "智能建议" panel: shows 4 history-based hints (location frequency, avg expiry duration)
- [ ] Submit → storageService.addItem + nav back to /items with toast
- [ ] Commit: `feat(view): AddItem with form + smart suggestions`

### Task 23: Expiry view (临期预警)

**Files:**
- Create: `src/views/Expiry.vue`

- [ ] 4 StatCards: 2天内 / 7天内 / 30天内 / 本月已避免浪费
- [ ] ExpiryCard list sorted by daysUntilExpiry asc
- [ ] "临期食品妙用" creative hints card (curated static suggestions per category)
- [ ] BarChart 临期处理统计 (consumed/pending/shared/wasted percentages)
- [ ] Commit: `feat(view): Expiry warnings`

### Task 24: Expired view

**Files:**
- Create: `src/views/Expired.vue`

- [ ] 4 StatCards: 总数 / 最久天数 / 浪费金额 / 浪费率(对比上月)
- [ ] Yellow info banner: "已过期物品请勿食用..."
- [ ] List of expired items (grayed cards, 0.85 opacity)
- [ ] "浪费原因分析" 3-column cards (heuristic: 遗忘/购买过多/口味变化)
- [ ] Commit: `feat(view): Expired`

### Task 25: Stock view (库存追踪)

**Files:**
- Create: `src/views/Stock.vue`

- [ ] 4 StatCards: 追踪总数 / 急需补货 / 即将耗尽 / 充足
- [ ] ProgressRing grid (2 cols mobile / 4 cols desktop) for top 8 tracked items
- [ ] BarChart 消耗速度预测 (daysToEmpty asc, color-coded)
- [ ] "智能补货策略" 4 cards (cyclic / threshold / seasonal / holiday)
- [ ] Commit: `feat(view): Stock tracking with progress rings`

### Task 26: Locations view

**Files:**
- Create: `src/views/Locations.vue`

- [ ] 4 StatCards: 位置总数 / 物品总数 / 临期分布 / 最常用位置
- [ ] 12 LocationCard grid (3 cols mobile / 4 cols desktop)
- [ ] Tap card → bottom sheet showing items in that location
- [ ] "位置使用建议" cards based on occupancy ratio (currentCount / maxCount where maxCount is heuristic)
- [ ] Commit: `feat(view): Locations`

### Task 27: Shopping view

**Files:**
- Create: `src/views/Shopping.vue`

- [ ] 4 StatCards: 待购 / 预计支出 / 已购完成 / 推荐采购家数
- [ ] Tabs: "待购清单" / "已购完成"; checkbox to toggle done
- [ ] "智能采购方案" cards grouping items by recommendStore with subtotal
- [ ] BarChart 本月购物统计 (4 weeks)
- [ ] FAB to manually add shopping item
- [ ] Commit: `feat(view): Shopping`

### Task 28: Consume view (消耗记录)

**Files:**
- Create: `src/views/Consume.vue`

- [ ] 4 StatCards: 本月记录数 / 品种数 / 日均消耗 / 日均金额
- [ ] Filter row: item name search + category + scene + date range
- [ ] Table-style list: icon + name + category + time + scene badge + qty change + remaining
- [ ] BarChart 每日消耗时段分布
- [ ] HorizontalBarChart 本月最常消耗 Top 5
- [ ] Commit: `feat(view): Consumption records`

### Task 29: Analytics view (数据分析)

**Files:**
- Create: `src/views/Analytics.vue`

- [ ] 4 StatCards: 6 月总支出 / 浪费金额 / 周转率 / 效率评分(A/B/C/D)
- [ ] LineChart 近 6 个月支出趋势 (with shadow area + high/low markers)
- [ ] DoughnutChart 支出分类占比
- [ ] HorizontalBarChart 购买频率 Top 10
- [ ] 3-column 浪费分析 cards (食品/药品/清洁)
- [ ] Gradient achievement banner with overall score
- [ ] Commit: `feat(view): Analytics`

### Task 30: Settings view + data export/import

**Files:**
- Create: `src/views/Settings.vue`

- [ ] 4 sections (个人信息 / 显示偏好 / 通知与提醒 / 类别 & 标签管理)
- [ ] Theme picker (3 cards radio); list style picker; font size picker
- [ ] 7 notification toggles + 临期阈值 / minStock 默认比率 inputs
- [ ] Category & location managers (add/remove/rename)
- [ ] Data section: "导出 JSON" / "导入 JSON" / "加载演示数据" / "清空全部数据"（含二次确认）
- [ ] "关于" footer: v1.0 + 作者 + 隐私声明链接
- [ ] Commit: `feat(view): Settings`

### Task 31: More view (我的二级菜单)

**Files:**
- Create: `src/views/More.vue`

- [ ] User card at top (avatar circle with nickname initial + name + role)
- [ ] Menu list: 已过期 / 库存追踪 / 存放位置 / 购物清单 / 消耗记录 / 数据分析 / 设置
- [ ] Each item: icon + label + chevron right
- [ ] About card at bottom (version + 关于本应用)
- [ ] Commit: `feat(view): More menu`

---

## Phase 6 — Android Packaging

### Task 32: Install Capacitor + initial config

**Files:**
- Create: `capacitor.config.json`
- Modify: `package.json` (add @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/assets)

- [ ] `npm install --save @capacitor/core @capacitor/android` and `--save-dev @capacitor/cli @capacitor/assets`
- [ ] Init: `npx cap init "悦家库存" "com.chailin.homestock" --web-dir=dist`
- [ ] Edit `capacitor.config.json`: set `android.allowMixedContent=false`, `android.backgroundColor='#FFF4E6'`, `server.androidScheme='https'`
- [ ] Commit: `feat: install Capacitor`

### Task 33: Build web + add Android platform

**Files:**
- Create: `android/` (generated by cap)
- Modify: `android/app/build.gradle` (signing config)
- Create: `keystore.properties.template`

- [ ] Run `npm run build` to produce dist/
- [ ] Run `npx cap add android`
- [ ] Modify `android/app/build.gradle`: add `signingConfigs.release { ... loads keystore.properties if present }`, `buildTypes.release { signingConfig signingConfigs.release }`, `minSdkVersion 24`, `targetSdkVersion 34`, `versionCode 1`, `versionName "1.0.0"`
- [ ] Modify `android/app/src/main/AndroidManifest.xml`: only `INTERNET` permission; remove default extras; set `android:allowBackup="false"`, `android:label="悦家库存"`
- [ ] Write `keystore.properties.template` with placeholders
- [ ] Commit: `feat: Android platform + signing config`

### Task 34: Generate icons + splash

**Files:**
- Create: `assets/icon.svg` (1024×1024)
- Create: `assets/splash.svg` (2732×2732)
- Create: `assets/icon.png`, `assets/icon-foreground.png`, `assets/icon-background.png`, `assets/splash.png` (rasterized)

- [ ] Write SVG icon: warm gradient bg (#FF6B35→#FFC857) circle, white house silhouette
- [ ] Write SVG splash: same gradient + house icon + "悦家库存" text + "HomeStock V1.0"
- [ ] Use `npx @capacitor/assets generate --android --iconBackgroundColor "#FF6B35" --splashBackgroundColor "#FFF4E6"`
- [ ] Verify android/app/src/main/res/mipmap-* + drawable have correct files
- [ ] Commit: `feat: app icons + splash`

### Task 35: PWA manifest + web icons

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable.png`
- Modify: `index.html` (link manifest + theme color)

- [ ] Write manifest per spec §8
- [ ] Generate PWA icons from same SVG
- [ ] Link manifest + apple-touch-icon in index.html
- [ ] Commit: `feat: PWA manifest`

### Task 36: Capacitor sync verification

- [ ] `npm run build && npx cap sync android`
- [ ] Verify no errors
- [ ] Add npm scripts: `android:dev` (build+sync+open AS), `android:build:debug`, `android:build:release`
- [ ] Commit: `chore: Android build scripts`

---

## Phase 7 — Cross-Validation

### Task 37: Run all tests + coverage

- [ ] `npm run test`; expect all PASS
- [ ] `npm run test:cov`; record coverage % per module (target ≥ 70% for services)
- [ ] Save report to `docs/verification/test-report.md`
- [ ] Commit: `chore: verification — tests passing`

### Task 38: Lint + format check

- [ ] `npm run lint`; expect 0 errors / 0 warnings
- [ ] `npm run format` (prettier --check); expect all formatted
- [ ] Commit any auto-fixes

### Task 39: Production build verification

- [ ] `npm run build`
- [ ] Verify dist/ size: main JS gzip ≤ 200KB excl ECharts; total ≤ 800KB gzip
- [ ] `npm run preview`, open in Chrome mobile emulator (375×667), walk through onboarding + dashboard
- [ ] Record bundle stats to `docs/verification/build-report.md`
- [ ] Commit: `chore: verification — production build verified`

### Task 40: Manual 12-page walkthrough

Walk through each route with empty data + with demo data loaded; verify no JS errors in console, responsive at 360/768/1024, 3 themes switch cleanly.

- [ ] / (Dashboard)
- [ ] /items (with category filter + search)
- [ ] /add (submit a new item)
- [ ] /expiry
- [ ] /expired
- [ ] /stock
- [ ] /locations
- [ ] /shopping
- [ ] /consume
- [ ] /analytics
- [ ] /settings (toggle 3 themes; export JSON; load demo; clear data)
- [ ] /more
- [ ] /onboarding (clear data then trigger redirect)
- [ ] Record results to `docs/verification/manual-walkthrough.md`
- [ ] Commit: `chore: verification — manual walkthrough`

### Task 41: Mobile screenshots for Play Store

Use Chrome DevTools mobile view, 1080×1920 (Play Store recommended), with demo data loaded.

- [ ] Capture 8 PNGs: Dashboard, Items, AddItem, Expiry, Stock, Shopping, Analytics, Settings
- [ ] Save to `docs/screenshots/01_dashboard.png` ... `08_settings.png`
- [ ] Commit

---

## Phase 8 — Play Store Materials

### Task 42: Privacy policy

**Files:**
- Create: `docs/PRIVACY_POLICY.md`

- [ ] Sections: 数据收集 (none) / 数据存储 (本地 IndexedDB) / 网络访问 (none, 仅 PWA 资源) / 第三方 SDK (none) / 权限说明 (仅 INTERNET) / 联系方式
- [ ] In English-mirroring section at bottom (since Play Console requires English for some checks)
- [ ] Commit

### Task 43: Play Store listing copy

**Files:**
- Create: `docs/PLAY_STORE_LISTING.md`

- [ ] App name (≤30 chars): 悦家库存
- [ ] Short description (≤80 chars): 家庭物资效期与库存管理，本地存储零隐私顾虑
- [ ] Full description (≤4000 chars): feature list + USPs + screenshots descriptions
- [ ] Keywords / category: Lifestyle > Tools / Productivity
- [ ] Content rating answers
- [ ] Commit

### Task 44: Upload guide

**Files:**
- Create: `docs/UPLOAD_GUIDE.md`

- [ ] Sections: Play Console 注册 / keystore 生成 (`keytool -genkey ...`) / keystore.properties 填写 / 构建 release aab / 上传 / 商店材料填写 / 提交审核 / 常见拒审原因
- [ ] Include exact commands
- [ ] Commit

### Task 45: README

**Files:**
- Create: `README.md`

- [ ] Project intro
- [ ] Quick start (`npm install` / `npm run dev` / `npm run android:dev`)
- [ ] Tech stack
- [ ] Folder structure
- [ ] Scripts table
- [ ] Privacy stance
- [ ] License (MIT)
- [ ] Author info (柴琳)
- [ ] Link to spec + plan + upload guide
- [ ] Commit

---

## Phase 9 — Final Validation

### Task 46: Final cross-check report

**Files:**
- Create: `docs/verification/final-report.md`

- [ ] Summarize: test pass rate, bundle size, lint status, 12-page walkthrough results, Android build outcome
- [ ] List known limitations + things user needs to do (signing, upload, etc.)
- [ ] Commit

### Task 47: Final git status + ready-to-ship summary

- [ ] `git log --oneline`; verify clean linear history
- [ ] `git status`; expect clean
- [ ] Tag `v1.0.0`
- [ ] Output summary to user with: path, commits, test results, next steps

---

## Self-Review Notes

**Spec coverage:** All 12 views, 5 IndexedDB stores + settings store, 3 themes, ECharts charts, expiry algorithm, stock prediction, auto-buy, demo data, JSON export/import, Capacitor packaging, icon + splash, Play Store materials — all covered.

**Placeholder scan:** No "TBD" / "implement later". Each task has concrete file paths + verification step.

**Type consistency:** Reviewed — names match across tasks (storageService.addItem used consistently; ItemCard / ExpiryCard / LocationCard names match; daysUntilExpiry / classifyExpiry consistent).

**Risk notes:**
- @capacitor/assets requires sharp; install may need additional time but no manual config
- ECharts tree-shaking via per-chart wrappers; if total bundle exceeds 800KB gzip, switch to vue-echarts or lighter alternative — record actual size in build report
- fake-indexeddb may have minor API gaps; if integration tests fail with version mismatches, fall back to mocking storageService at unit level for stores

# 悦家库存 HomeStock v1.0 — Android Play Store 版设计文档

- **日期**: 2026-05-13
- **作者**: brainstorm session (Claude + user)
- **目标**: 把"悦家库存：家庭物资效期与库存管理系统"原 Vue 3 桌面 Web SPA 规格，落地为可上架 Google Play Store 的 Android 应用
- **路径**: A 方向（Vue 3 PWA + Capacitor 6 打包 Android），一次性全量交付
- **applicationId**: `com.chailin.homestock`

---

## 1. 范围与边界

### 1.1 包含
- 12 个完整功能页面（登录改为首启 Onboarding 设昵称）
- IndexedDB 本地持久化（5 个 object store）
- ECharts 5 数据可视化（6 类图表）
- 智能算法（临期判定 / 库存预测 / 自动补货 / 浪费分析）
- 3 套主题（家居暖色 / 深色模式 / 清新自然）
- 移动端优先 UI（底部 Tab 导航 + 中央 FAB + 二级抽屉），同步桌面响应式
- 完整 Capacitor Android 工程
- 单元测试 + 集成测试 + 静态检查 + 构建验证
- Play Store 上架材料（隐私政策 / 描述 / 图标 / 截图 / 上架手册）

### 1.2 排除（v1 不做）
- 假登录页（原规格的"装饰登录"，无后端无意义）
- 扫码识别条码（Capacitor mlkit 插件，留给 v1.1）
- 数据备份 AES-256 加密（v1 仅明文 JSON 导出/导入）
- 多语言 i18n（仅简体中文）
- 云端同步、账号体系、广告、第三方 SDK

### 1.3 用户负责（不在交付范围）
- Play Console 开发者账号注册（$25）
- 签名 keystore 生成与保管
- 隐私政策 URL 部署（我提供 Markdown）
- aab 上传到 Play Console

---

## 2. 技术栈

| 层 | 选型 | 版本 |
|---|---|---|
| 框架 | Vue 3 Composition API + `<script setup>` | ^3.4.21 |
| 构建 | Vite | ^5.2 |
| 路由 | Vue Router (`createWebHashHistory`，Capacitor 强制) | ^4.3 |
| 状态 | Pinia | ^2.1 |
| 本地数据库 | IndexedDB via `idb` | ^8.0 |
| 图表 | ECharts 5（按需引入） | ^5.5 |
| 日期 | dayjs | ^1.11 |
| 样式 | 原生 CSS + CSS Variables | — |
| Android 打包 | Capacitor + Android Gradle 8 | ^6.1 |
| 测试 | Vitest + fake-indexeddb | ^1.6 / ^6 |
| Lint | ESLint + Prettier | ^9 / ^3 |

不引入 Tailwind、不引入 TypeScript（保持规格里"JavaScript ES2022"声明）。

---

## 3. 项目结构

```
~/projects/homestock/
├── android/                       # Capacitor 生成
├── src/
│   ├── main.js                    # 引导入口
│   ├── App.vue                    # 根组件 + 布局壳
│   ├── router.js
│   ├── stores/
│   │   ├── items.js
│   │   ├── categories.js
│   │   ├── locations.js
│   │   ├── consumptions.js
│   │   ├── shopping.js
│   │   └── settings.js
│   ├── services/
│   │   ├── db.js                  # idb schema + upgrade
│   │   ├── storageService.js      # 5 store CRUD API
│   │   ├── dateService.js         # 临期判定 + dayjs 包装
│   │   └── algorithmService.js    # 库存预测 + 自动补货
│   ├── views/
│   │   ├── Onboarding.vue
│   │   ├── Dashboard.vue
│   │   ├── Items.vue
│   │   ├── AddItem.vue
│   │   ├── Expiry.vue
│   │   ├── Expired.vue
│   │   ├── Stock.vue
│   │   ├── Locations.vue
│   │   ├── Shopping.vue
│   │   ├── Consume.vue
│   │   ├── Analytics.vue
│   │   ├── Settings.vue
│   │   └── More.vue               # "我的"二级菜单页
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.vue
│   │   │   ├── AppBar.vue
│   │   │   └── BottomTabBar.vue
│   │   ├── ItemCard.vue
│   │   ├── ExpiryCard.vue
│   │   ├── LocationCard.vue
│   │   ├── CategoryTabs.vue
│   │   ├── StatCard.vue
│   │   ├── StatusBadge.vue
│   │   ├── ProgressRing.vue
│   │   ├── EmptyState.vue
│   │   └── charts/
│   │       ├── LineChart.vue
│   │       ├── BarChart.vue
│   │       ├── DoughnutChart.vue
│   │       └── HorizontalBarChart.vue
│   ├── constants/
│   │   ├── categories.js
│   │   ├── locations.js
│   │   └── thresholds.js
│   ├── utils/
│   │   ├── format.js
│   │   └── demoData.js
│   └── styles/
│       ├── global.css
│       ├── themes.css
│       └── utilities.css
├── public/
│   ├── manifest.webmanifest       # PWA manifest
│   └── icons/                     # PWA icons
├── tests/
│   ├── algorithms.test.js
│   ├── storage.test.js
│   └── format.test.js
├── docs/
│   ├── superpowers/specs/2026-05-13-homestock-design.md
│   ├── PRIVACY_POLICY.md
│   ├── PLAY_STORE_LISTING.md
│   ├── UPLOAD_GUIDE.md
│   └── screenshots/
├── capacitor.config.json
├── keystore.properties.template
├── vite.config.js
├── package.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

---

## 4. 数据模型（IndexedDB）

数据库名 `HomeStockDB`，版本 1，5 个 object store：

### 4.1 items
- 主键 `id` (auto-increment)
- 索引：`byCategory`、`byExpiry`、`byLocation`、`byStatus`、`byUpdatedAt`
- 字段：`id, name, category, icon, brand, spec, quantity, unit, locationId, purchaseDate, expiryDate, price, barcode, imageUrl, note, status, minStock, createdAt, updatedAt`
- `status ∈ {active, expired, consumed, discarded}`

### 4.2 categories
- 主键 `key`
- 字段：`key, name, icon, color, enabled, sortOrder`
- 首启 seed 8 项：food / drug / daily / clean / cond / can / drink / other

### 4.3 locations
- 主键 `id`
- 字段：`id, name, icon, description, parentId, itemCount, enabled`
- 首启 seed 12 项（冰箱·冷藏 / 冰箱·冷冻 / 厨房·调料柜 / 厨房·常温柜 / 米柜 / 茶柜 / 药箱 / 卫生间·储物柜 / 卫生间·清洁柜 / 卧室·衣柜 / 客厅·储物柜 / 玄关·鞋柜）

### 4.4 consumptions
- 主键 `id` (auto)
- 索引：`byItemId`、`byTimestamp`
- 字段：`id, itemId, itemName, amount, scene, timestamp, note`
- `scene ∈ {breakfast, morning, lunch, afternoon, dinner, night}`

### 4.5 shoppingList
- 主键 `id` (auto)
- 索引：`byDone`、`byCreatedAt`
- 字段：`id, itemName, category, quantity, estimatedPrice, recommendStore, source, done, createdAt`
- `source ∈ {auto, manual}`

### 4.6 settings (single-record store)
- 主键 `key='app'` (固定)
- 字段：`nickname, role, familySize, address, theme, listStyle, fontSize, dateFormat, defaultSort, expiryThresholdDays, defaultMinStockRatio, notifications{...7 项布尔}, quietHours{start,end}`
- `defaultMinStockRatio` (默认 0.2): 入库新物品时，如未指定 minStock，则 `minStock = max(1, round(quantity * defaultMinStockRatio))`

---

## 5. UI 系统

### 5.1 导航结构

底部 Tab 5 项 + 中间 FAB：
- 🏡 总览 → `/`
- 📋 物资 → `/items`
- ➕ 入库（FAB 凸起，陶土橙渐变）→ `/add`
- 🔔 临期 → `/expiry`
- 👤 我的 → `/more`

`/more` 列表入口：已过期 / 库存追踪 / 存放位置 / 购物清单 / 消耗记录 / 数据分析 / 设置

### 5.2 主题（CSS Variables）

```css
:root[data-theme="warm"] {
  --color-primary: #FF6B35;
  --color-secondary: #FFC857;
  --color-accent: #7FB069;
  --color-bg: #FFF4E6;
  --color-surface: #FFFFFF;
  --color-text: #2D2A26;
  --color-text-muted: #8A857F;
  --color-danger: #E54B4B;
  --color-warning: #F5A742;
  --color-success: #7FB069;
  --color-info: #3D7EC9;
  --gradient-primary: linear-gradient(135deg, #FF6B35 0%, #FFC857 100%);
}

:root[data-theme="dark"] {
  --color-primary: #FF7E47;
  --color-bg: #1A1A1A;
  --color-surface: #2A2A2A;
  --color-text: #F5F0EA;
  /* ... */
}

:root[data-theme="fresh"] {
  --color-primary: #7FB069;
  --color-bg: #F0F7ED;
  /* ... */
}
```

### 5.3 关键 UI 模式

- 数据卡片：移动端单列、平板双列、桌面四列（CSS Grid + media query）
- 物资网格：`grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`
- 状态徽章：5 色（fresh/info/warning/urgent/expired），右上角圆角矩形
- 进度环：纯 SVG（不引图表库重）+ CSS conic-gradient 备选
- 图表高度：移动 240px / 平板 320px / 桌面 400px

### 5.4 无障碍
- 所有文字对比度 ≥ 4.5:1（陶土橙 #FF6B35 配白底 4.7:1 ✅）
- 按钮最小触摸目标 44×44px
- 表单输入有 label，错误信息用文字 + 颜色双通道
- 系统字体：`-apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif`

---

## 6. 关键算法（与规格 7.x 一致）

### 6.1 临期判定
```
daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), 'day')

if days < 0   → expired (灰)
if days <= 2  → urgent  (红)
if days <= 7  → warning (橙)
if days <= 30 → info    (黄)
else          → fresh   (绿)
```
设置页可调 `expiryThresholdDays`（默认 3），仅影响"是否触发临期通知"，分级颜色固定。

### 6.2 库存预测
对每个 `status='active'` 物品：
1. 查 `consumptions.byItemId` 近 30 天记录
2. `dailyAvg = sum(abs(amount)) / 30`
3. `daysToEmpty = currentQty / dailyAvg`（dailyAvg=0 时 = Infinity，按"无消耗记录"处理，仅做兜底显示）
4. 低库存判定：`currentQty <= minStock`

### 6.3 自动补货
触发条件 `(daysToEmpty < 7 AND dailyAvg > 0) OR (currentQty <= minStock)`：
- 若 shoppingList 已存在同 itemName + done=false → 跳过
- 否则插入新记录，`source='auto'`，`recommendStore` 按 category 路由：
  - `food` / `cond` / `can` → 盒马生鲜
  - `daily` / `clean` → 京东超市
  - `drug` → 京东大药房
  - `drink` / `other` → 永辉超市

### 6.4 浪费分析（数据分析页）
- 6 月浪费金额 = sum(items 状态=expired AND updatedAt 在区间内 .price)
- 浪费率 = 浪费金额 / 总支出
- 浪费原因分类：从 expired items 的 `note` 字段 + 类别启发式（药品→过期未食 / 食品→遗忘存放等），v1 用简单规则，不做 ML

---

## 7. Capacitor / Android 配置

- **applicationId**: `com.chailin.homestock`
- **versionCode**: 1, **versionName**: "1.0.0"
- **minSdk**: 24（Android 7.0），**targetSdk**: 34（Android 14）
- **App 名称**: 悦家库存
- **权限**: 仅 `INTERNET`（PWA 资源缓存，运行时无网络请求）；**显式拒绝** READ_EXTERNAL_STORAGE / CAMERA / ACCESS_*_LOCATION / READ_CONTACTS
- **图标**: 陶土橙渐变背景 + 房子 emoji 简化矢量图，1024×1024 SVG 源 → `@capacitor/assets generate --android` 输出所有 mipmap + adaptive icon
- **启动图**: 同色渐变 + 应用名 + Logo，2732×2732 SVG 源
- **签名**: `keystore.properties.template`：
  ```
  storeFile=../app/release.jks
  storePassword=<填>
  keyAlias=homestock
  keyPassword=<填>
  ```
- **构建脚本**: `package.json` 提供 `build:android:debug`、`build:android:release`

---

## 8. PWA Manifest

```json
{
  "name": "悦家库存",
  "short_name": "悦家库存",
  "description": "家庭物资效期与库存管理系统",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#FFF4E6",
  "theme_color": "#FF6B35",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## 9. 测试策略

### 9.1 单元测试（Vitest）
- `dateService`: 临期判定 5 级分类（含边界 day=0, day=2, day=3, day=7, day=8, day=30, day=31, day=-1）
- `algorithmService`: 库存预测（含 0 消耗、近 30 天数据稀疏、currentQty=0）、自动补货去重、浪费率计算
- `format`: 金额 / 日期 / 数量格式化（含 0、负数、超大数）

### 9.2 集成测试（Vitest + fake-indexeddb）
- 数据库初始化与 5 store 自动 seed
- items CRUD + 各索引查询
- consumptions 插入触发库存预测更新
- 浏览器主动关闭时事务完整性（用 fake-indexeddb 模拟）

### 9.3 静态检查
- ESLint v9 flat config，0 warning
- Prettier 格式化覆盖率 100%

### 9.4 构建验证
- `npm run build` 输出无 warning
- 主 bundle gzip ≤ 200 KB（不含 ECharts 异步 chunk）
- Lighthouse PWA 评分 ≥ 90（在 dev server 上跑）

### 9.5 手动跨视图验证清单
12 个页面 + Onboarding，每页核对：
- 数据加载（含空状态）
- 主要操作可点击
- 表单校验
- 图表正确渲染（含空数据）
- 3 套主题切换正常
- 响应式断点 360 / 768 / 1024 / 1440 都不破

### 9.6 Android 验证
- `./gradlew assembleDebug` 产出 debug APK
- 因为我跑不了 Android 模拟器，最终在 UPLOAD_GUIDE.md 给出 `adb install` + Android Studio AVD 启动步骤，由用户验证

---

## 10. Play Store 上架材料

| 文件 | 内容 |
|---|---|
| `docs/PRIVACY_POLICY.md` | 隐私政策：零采集、全本地、无网络请求、无 SDK |
| `docs/PLAY_STORE_LISTING.md` | 应用名、短描述（80 字内）、长描述（4000 字内）、关键词 |
| `docs/screenshots/` | 8 张商店截图（Dashboard / Items / AddItem / Expiry / Stock / Shopping / Analytics / Settings），Chrome 手机视图 1080×1920 截，符合 Play Store 要求 |
| `public/icons/feature-graphic.png` | 1024×500 商店头图 |
| `docs/UPLOAD_GUIDE.md` | 一步步上架手册：注册 → 创建应用 → 生成 keystore → 构建 aab → 上传 → 提交审核 |

---

## 11. 交付物清单

1. `~/projects/homestock/` 完整源码，git init + 多次 commit
2. `npm run build` 输出的可部署 dist/
3. `npx cap sync android` 后可在 Android Studio 打开的 `android/` 工程
4. 全部测试通过 + lint 0 warning 的执行截图 / 日志
5. 隐私政策 + 上架描述 + 上架手册
6. 中文 README

---

## 12. 风险与已知偏离

- **桌面截图无法 1:1 还原**：移动端导航必须改成底部 Tab + 二级抽屉，视觉风格保留但布局重排。这是 A 方向的固有取舍。
- **ECharts 体积**：tree-shake 后仍约 200KB，所有图表页用异步 import 懒加载。
- **Capacitor 与 Vite 兼容**：v6 已稳定，但需 `vite.config.js` 配 `base: './'`；不能用 absolute base。
- **dayjs 时区**：v1 默认本地时区，不引 timezone 插件。
- **首启性能**：IndexedDB seed 8+12 默认数据 < 100ms，可接受。

## 13. 后续版本预留

v1.1 拟做：扫码入库（@capacitor-mlkit/barcode-scanning）、备份加密、英文 i18n
v1.2 拟做：物品照片（@capacitor/camera）、本地通知（@capacitor/local-notifications）
v2.0 拟做：可选 WebDAV 同步、家庭成员共享（端到端加密）

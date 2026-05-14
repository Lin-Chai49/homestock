# Play Store 上架材料检查清单

> 这是您上架时的"对照表"。打开 Play Console 时，按顺序对应文件填写即可。

**应用：** 悦家库存 HomeStock v1.0.0
**applicationId：** `com.chailin.homestock`
**著作权人：** 柴琳

---

## 📦 此提交包含什么

```
play-store-submission/
├── 0_CHECKLIST.md                  ← 本文件
├── 1_privacy-policy.html           ← 准备好的隐私政策（HTML，托管即用）
├── 2_listing-text.txt              ← 应用商品页所有文字字段（直接复制粘贴）
├── 3_data-safety-form.md           ← "数据安全"问卷答案
├── 4_content-rating.md             ← "内容分级"问卷答案
├── 5_release-notes.txt             ← 版本说明（用户可见）
├── 6_keystore-setup.md             ← 生成签名密钥的精简步骤
├── 7_aab-build-commands.md         ← 构建 AAB 的精简命令
└── graphics/
    ├── feature-graphic-1024x500.png        ← Play Store 特性图 ★必填
    ├── icons/
    │   ├── play-hi-res-icon-512.png        ← 应用图标 ★必填
    │   ├── icon-512.png                    ← 备用
    │   └── icon-1024.png                   ← 备用
    └── screenshots/
        ├── 01_dashboard.png .. 08_analytics.png   ← 手机截图 8 张 ★必填（≥2 张）
        ├── tablet-7/01..05.png                    ← 7 寸平板截图（选填）
        └── tablet-10/01..05.png                   ← 10 寸平板截图（选填）
```

---

## ✅ 一步步走流程

按下面的顺序操作。打勾标记进度。

### 第 1 阶段：注册账号 + 生成密钥（约 1 小时）

- [ ] 1.1 在 https://play.google.com/console 注册个人开发者账号，支付 **$25**
- [ ] 1.2 安装 **JDK 17+** （macOS: `brew install openjdk@17`）
- [ ] 1.3 按 `6_keystore-setup.md` 生成 `release.jks`，记下密码
- [ ] 1.4 **把 release.jks 备份 2 份**（U 盘 + 加密云盘）⚠️ 丢了就再也无法发布更新
- [ ] 1.5 创建 `keystore.properties`（复制自 `keystore.properties.template`），填入密码

### 第 2 阶段：托管隐私政策（约 5 分钟）

- [ ] 2.1 把 `1_privacy-policy.html` 上传到任意 HTTPS 静态托管
  - 最简单：GitHub 新建公开仓库 `homestock-privacy`，把 HTML 改名为 `index.html` 提交，仓库 Settings → Pages 启用，等 2 分钟得到 URL
  - 或：放到任何您拥有的 HTTPS 网站
- [ ] 2.2 在浏览器打开 URL 确认内容正确显示，**复制下来这个 URL**（后面要用）

### 第 3 阶段：构建 AAB（约 15 分钟）

- [ ] 3.1 安装 Android Studio（含 Android SDK 34）
- [ ] 3.2 按 `7_aab-build-commands.md` 执行命令
- [ ] 3.3 确认产物 `android/app/build/outputs/bundle/release/app-release.aab` 存在（5-10 MB）

### 第 4 阶段：真机测试（强烈推荐，约 20 分钟）

- [ ] 4.1 构建 debug APK：`npm run android:build:debug`
- [ ] 4.2 `adb install android/app/build/outputs/apk/debug/app-debug.apk`（USB 连接安卓手机，开启 USB 调试）
- [ ] 4.3 跑完 10 条测试清单（见 `../UPLOAD_GUIDE.md` §9）

### 第 5 阶段：在 Play Console 创建应用 + 填写所有字段（约 1 小时）

- [ ] 5.1 Play Console → **创建应用** → 名称 `悦家库存`，默认语言简体中文 (zh-CN)，免费应用
- [ ] 5.2 **主商品详情** — 全部内容在 `2_listing-text.txt` 里直接复制粘贴：
  - 应用名称
  - 简短说明
  - 完整说明
  - 应用类别（生活）
  - 应用图标（上传 `graphics/icons/play-hi-res-icon-512.png`）
  - 特性图（上传 `graphics/feature-graphic-1024x500.png`）
  - 手机截图（上传 `graphics/screenshots/01..08.png` 8 张）
  - 7 寸平板截图（可选，上传 `tablet-7/` 5 张）
  - 10 寸平板截图（可选，上传 `tablet-10/` 5 张）
- [ ] 5.3 **应用内容 → 隐私政策** — 粘贴第 2.2 步的 URL
- [ ] 5.4 **应用内容 → 应用访问权限** — 选"所有功能均可不受限制访问"
- [ ] 5.5 **应用内容 → 广告** — 选"否，应用不含广告"
- [ ] 5.6 **应用内容 → 内容分级** — 按 `4_content-rating.md` 中的答案填写问卷
- [ ] 5.7 **应用内容 → 目标受众** — 选"18 岁以上"
- [ ] 5.8 **应用内容 → 新闻应用** — 选"否"
- [ ] 5.9 **应用内容 → 政府应用** — 选"否"
- [ ] 5.10 **应用内容 → 数据安全** — 按 `3_data-safety-form.md` 中的答案填写问卷（这一步最重要，关系到审核通过率）
- [ ] 5.11 **应用内容 → 受众群体和内容** — 选"目标受众为 18 岁以上"

### 第 6 阶段：上传 AAB + 提交审核（约 30 分钟）

- [ ] 6.1 Play Console → **测试 → 内部测试** → 创建新版本
- [ ] 6.2 上传 `app-release.aab`
- [ ] 6.3 填写"版本说明" — 复制 `5_release-notes.txt` 的内容
- [ ] 6.4 启用 **Play App Signing**（默认会提示开启，强烈建议接受 — 万一丢了 keystore 还能找回）
- [ ] 6.5 添加 1-3 个内部测试人员（Gmail 邮箱）
- [ ] 6.6 **保存 → 检查 → 推出到内部测试**
- [ ] 6.7 等待审核（首次 3-7 天，工作日处理）
- [ ] 6.8 审核通过后，从"内部测试"提升到"生产环境"全网上线 🎉

---

## ⚠️ 审核前再次核对

提交前打勾：

- [ ] 隐私政策 URL 在浏览器中能打开（HTTPS，不要求登录）
- [ ] 隐私政策内容完整（中英双语都有）
- [ ] AAB 已签名（Play Console 上传时不会报"未签名"错误）
- [ ] versionCode 大于 0（默认为 1，OK）
- [ ] 至少上传 2 张手机截图（我们提供 8 张）
- [ ] 应用图标已上传（512×512 PNG）
- [ ] 特性图已上传（1024×500 PNG）
- [ ] 简短说明 ≤ 80 字符
- [ ] 完整说明 ≤ 4000 字符
- [ ] 内容分级问卷已完成
- [ ] 数据安全问卷已完成（全部选"否"）
- [ ] 在真机上至少测试过登录、入库、查看清单 3 步

## 🆘 卡住了怎么办

- AAB 构建报错 → 看 `../UPLOAD_GUIDE.md` 第 4 节的故障排查表
- Play Console 任何字段不知道怎么填 → 那个字段都对应这个目录里的某个文件，找文件名以数字开头的
- 审核被拒 → 看拒绝邮件理由，对照 `../UPLOAD_GUIDE.md` 第 8 节"常见拒审原因 & 应对"

祝顺利上线！🚀

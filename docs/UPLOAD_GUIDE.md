# 上架 Google Play Store 完整指南

本指南帮助著作权人柴琳一步步将 **悦家库存 HomeStock v1.0** 上架到 Google Play Store。

预计时间：**3-5 小时**（首次上架，含等待 Google 审核 1-7 天）

---

## 0. 前置准备清单

- [ ] Google 账号一个（可用现有 Gmail）
- [ ] 一张可在 Google Pay 支付 **$25** 注册费的信用卡 / 借记卡
- [ ] **macOS / Windows / Linux 开发机** 一台
- [ ] **JDK 17+** 已安装（构建 Android 需要）
  - macOS: `brew install openjdk@17 && sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk`
  - 或安装 Android Studio 自带 JDK
- [ ] **Android SDK** 已安装（推荐通过 Android Studio 安装）
  - 下载 Android Studio: https://developer.android.com/studio
  - 安装后打开 → SDK Manager → 安装 API 34（Android 14）
- [ ] 一个可托管隐私政策 HTML 文件的地方（GitHub Pages / Vercel / Netlify / 个人网站都行）

---

## 1. 注册 Play Console 开发者账号

1. 访问 https://play.google.com/console
2. 用 Google 账号登录
3. 选择 **"我是个人开发者"**
4. 填写：
   - 开发者名称：**柴琳**（或您希望显示给用户的名字）
   - 联系邮箱：（您的邮箱）
   - 网址：（隐私政策的 URL，第 3 步会拿到）
5. 支付 **$25** 一次性注册费
6. 等待账号激活（通常即时，最长 48 小时）

---

## 2. 生成签名 keystore（务必妥善保管！）

签名 keystore 是 Play Store 应用身份的根本。**丢失它就再也无法发布该应用的更新**。

```bash
cd ~/projects/homestock

# 生成密钥库（用 RSA 2048 位，有效期 100 年）
keytool -genkeypair -v \
  -keystore android/app/release.jks \
  -storetype JKS \
  -alias homestock \
  -keyalg RSA \
  -keysize 2048 \
  -validity 36500

# 系统会询问：
# - 密钥库口令：自己设一个强密码（记下来！）
# - 密钥口令：通常和密钥库口令相同
# - 您的姓名：柴琳
# - 您的组织：（可填您自己）
# - 城市/省/国家代码：（按实际填）
```

生成后：

- 文件位置：`android/app/release.jks`
- **立即备份此文件到至少 2 个地方**（U盘、加密云盘、纸质打印的 base64 编码……）

⚠️ **永远不要将 release.jks 提交到 git！** `.gitignore` 已配置忽略它。

### 配置 keystore.properties

```bash
cp keystore.properties.template keystore.properties
```

编辑 `keystore.properties`，填入您刚才设置的密码：

```properties
storeFile=../app/release.jks
storePassword=你设置的密钥库口令
keyAlias=homestock
keyPassword=你设置的密钥口令
```

---

## 3. 部署隐私政策 URL

Play Console 强制要求隐私政策 URL，不能只是邮箱地址。最简单方法：用 GitHub Pages。

### 选项 A：GitHub Pages（推荐，免费）

1. 在 GitHub 新建一个公开仓库，如 `homestock-privacy`
2. 添加 `index.html`，把 `docs/PRIVACY_POLICY.md` 转成 HTML（可用 https://markdown-it.github.io/ 在线转），粘贴进去
3. 仓库 → Settings → Pages → Source: `main` 分支
4. 等 1-2 分钟，URL 形如：`https://你的用户名.github.io/homestock-privacy/`

### 选项 B：自有域名 / 静态托管

把 `docs/PRIVACY_POLICY.md` 转 HTML 后上传到您自己的服务器，取一个 URL。

**重要**：URL 必须是 **HTTPS** 且 **永久可访问**。

---

## 4. 构建发布版 AAB

```bash
cd ~/projects/homestock

# 1. 确保 web 资产是最新的
npm run build

# 2. 同步到 Android 工程
npx cap sync android

# 3. 构建签名的 AAB（用于 Play Store 上传）
cd android
./gradlew bundleRelease

# 4. 找到产物
ls -la app/build/outputs/bundle/release/app-release.aab
```

构建成功后，产物是 `android/app/build/outputs/bundle/release/app-release.aab`，约 5-10 MB。

⚠️ 第一次构建会下载 Gradle、依赖等，需 5-15 分钟。

### 故障排查

| 错误 | 解决方案 |
|------|---------|
| `Unable to locate a Java Runtime` | 安装 JDK 17+（见前置准备） |
| `SDK location not found` | 创建 `android/local.properties`，写入 `sdk.dir=/path/to/Android/sdk` |
| `BUILD FAILED ... License not accepted` | 运行 `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses` 接受协议 |
| `Could not resolve dependency` | 检查 VPN / 镜像源，重试 `./gradlew --refresh-dependencies bundleRelease` |
| `Keystore was tampered with, or password was incorrect` | keystore.properties 密码与生成 keystore 时的密码不一致 |

---

## 5. 在 Play Console 创建应用

1. 登录 https://play.google.com/console
2. 点击 **"创建应用"**
3. 填写：
   - 应用名称：`悦家库存` (注意：Play Store 显示名是 30 字符内)
   - 默认语言：**简体中文 (zh-CN)**
   - 应用还是游戏：**应用**
   - 免费还是付费：**免费**
4. 接受协议，确认创建

---

## 6. 填写应用商品详情

参考 `docs/PLAY_STORE_LISTING.md`，依次完成以下页面：

### 6.1 应用商店页面 → 主商品详情
- 应用名称：（复制粘贴 LISTING.md 中的）
- 简短说明：（复制粘贴）
- 完整说明：（复制粘贴 4000 字的长描述）
- 应用图标：上传 `docs/store-graphics/icon-1024.png`（512×512 也接受）
- 特性图：上传 `docs/store-graphics/feature-graphic-1024x500.png`
- 手机截图：上传 `docs/screenshots/*.png`（至少 2 张，建议 8 张）

### 6.2 应用商店页面 → 商品详情
- 应用类别：**生活方式 (Lifestyle)**
- 标签：**家居 / 家庭**
- 联系电邮：（您的邮箱）
- 网站：（您的隐私政策 URL，或个人网站）
- **隐私政策**：粘贴第 3 步部署的 URL

### 6.3 应用内容
- **隐私政策**：URL（同上）
- **应用访问权限**：所有功能均可访问，无登录要求
- **广告**：无
- **内容分级**：填写问卷（按 LISTING.md 中的答案：所有问题选"否"），预期评级 PEGI 3 / ESRB Everyone
- **目标受众**：18 岁以上
- **新闻应用**：否
- **政府应用**：否
- **数据安全**：
  - 是否收集用户数据：**否**
  - 是否共享用户数据：**否**
  - 数据是否加密传输：N/A（无传输）
  - 用户是否可请求删除数据：**是**（通过应用内"清空全部数据"）

---

## 7. 上传 AAB

1. Play Console 左侧菜单 → **"测试 → 内部测试"**（建议先走内部测试）
2. **创建新版本** → 上传 `app-release.aab`
3. 等待 AAB 处理（约 1-3 分钟）
4. 填写 **版本说明**（用户可见）：
   ```
   悦家库存 v1.0 首次发布！
   - 12 个核心功能页面
   - 食品/药品/日用品 8 大类管理
   - 12 个家庭存放位置
   - 5 级临期智能预警
   - 自动补货 + 商超分组
   - 6 个月支出趋势分析
   - 3 套主题（家居暖色/深色/清新）
   - 完全本地存储，零数据采集
   ```
5. **保存并审核**

---

## 8. 提交审核

1. 完成所有"必填"项目（红色感叹号都消除）
2. 内部测试通道：添加 1-3 个内部测试人员（用 Gmail 邮箱）
3. **生效发布**

### 审核时间

- 首次审核：**3-7 天**（中国大陆运营的应用偶尔会被多次复查，最长 14 天）
- 后续更新审核：**1-3 天**

### 常见拒审原因 & 应对

| 拒审原因 | 应对方法 |
|---------|---------|
| 隐私政策无法访问 / 不完整 | 确认 URL 有效且 HTTPS，内容覆盖所有 Play 政策点 |
| 应用没有意义 / 内容太少 | 已避免，本应用功能丰富 |
| 应用崩溃 | 本地先做手机真机测试（adb install），见第 9 节 |
| 截图描述不一致 | 确认截图反映实际功能 |
| 应用名含禁止词汇 | 不适用 |

---

## 9. 提交前的真机测试（强烈推荐）

构建一个 debug APK 装到真机上测试，避免上架后用户反馈崩溃：

```bash
cd ~/projects/homestock
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug

# 产物：android/app/build/outputs/apk/debug/app-debug.apk
# 用 USB 连接手机，开启 USB 调试，然后：
adb install app/build/outputs/apk/debug/app-debug.apk

# 或者用 Android Studio 模拟器：
# 1. 打开 Android Studio
# 2. File → Open → 选择 ~/projects/homestock/android/
# 3. 右上角设备下拉 → 选择 AVD（如没有，Tools → Device Manager → 创建）
# 4. 绿色 Run 按钮
```

测试清单（每条都验证一遍）：

- [ ] 首启进入 Onboarding，输入昵称，选择主题
- [ ] Dashboard 数据正常加载
- [ ] 切换底部 Tab（总览 / 物资 / 入库 / 临期 / 我的）
- [ ] 入库登记一件新物品，确认入库成功
- [ ] 物资清单看到新物品
- [ ] 设置页 → 加载演示数据
- [ ] 各图表（Dashboard / 库存追踪 / 分析）正常渲染
- [ ] 设置页 → 切换 3 套主题
- [ ] 设置页 → 导出 JSON 备份
- [ ] 关闭并重新打开应用，数据持久化

---

## 10. 后续维护

### 发布更新版本

1. 在 `package.json` / `android/app/build.gradle` 中递增 `versionCode` 和 `versionName`
   ```gradle
   versionCode 2      // 必须比上一次大
   versionName "1.0.1"
   ```
2. 重新构建：`npm run android:build:release`
3. Play Console → 创建新版本 → 上传新 AAB
4. 等待审核（1-3 天）

### 监控用户反馈

- Play Console → 反馈 → 评分和评价
- 建议至少每周查看一次

---

## 11. 紧急情况

如果上架后发现严重 Bug：

1. Play Console → 发布 → 内部测试 / 生产 → **暂停**当前发布（用户无法新下载，已下载的仍可用）
2. 紧急修复代码
3. 构建新 AAB，递增 versionCode，重新提交
4. 通过审核后恢复发布

如果您**丢失了 keystore.jks**：
- 联系 Google Play 支持，申请 **App Signing by Google Play** 重置（仅当您启用了 Play App Signing）
- 否则只能下架旧应用 + 新应用名重新上架（用户需重新下载）

**强烈建议**：在第一次上传 AAB 时，启用 **Play App Signing**（默认开启），让 Google 帮您保管最终签名密钥，您只需保管 upload key，丢了可申请重置。

---

## 完成清单

- [ ] Google Play Console 账号已注册（$25 支付）
- [ ] `keystore.jks` 已生成并备份
- [ ] `keystore.properties` 已配置
- [ ] 隐私政策 URL 已部署（HTTPS）
- [ ] 真机测试通过（≥10 条测试通过）
- [ ] AAB 构建成功（`app-release.aab` 5-10 MB）
- [ ] Play Console 内部测试发布成功
- [ ] 应用商品详情填写完整（绿色对勾）
- [ ] AAB 上传审核
- [ ] 等待 Google 审核（3-7 天）
- [ ] 审核通过 → 提升到生产环境 → 全网上线 🎉

祝您上架顺利！如遇到问题，可以参考：
- Capacitor 官方文档：https://capacitorjs.com/docs/android/deploying-to-google-play
- Play Console 帮助：https://support.google.com/googleplay/android-developer

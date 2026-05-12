# 悦家库存 HomeStock 隐私政策

**生效日期：** 2026 年 5 月 13 日
**版本：** 1.0
**适用应用：** 悦家库存 HomeStock v1.0（applicationId: `com.chailin.homestock`）
**著作权人：** 柴琳

---

## 一、核心承诺

悦家库存是一款**完全本地化、零数据采集**的家庭物资管理应用。我们郑重承诺：

- ❌ **不收集**任何个人信息（包括但不限于姓名、手机号、邮箱、地理位置、设备 ID、IMEI、广告 ID）
- ❌ **不上传**任何用户数据到任何服务器（无云端，无远程 API 调用）
- ❌ **不嵌入**任何第三方 SDK（无广告 SDK、统计 SDK、推送 SDK、社交分享 SDK）
- ❌ **不读取**通讯录、相册、短信、通话记录、其他应用数据
- ❌ **不申请**摄像头、麦克风、定位、电话、存储等敏感权限
- ✅ **所有数据**保存在用户设备的浏览器原生 IndexedDB 中，仅本应用进程可访问
- ✅ **数据导入导出**完全由用户通过应用内 "JSON 备份" 功能手动控制

## 二、数据收集说明

本应用**不收集**任何形式的个人信息或行为数据。用户在本应用中输入的所有内容（物品名称、品牌、规格、数量、价格、备注、消耗记录、购物清单等）：

1. **仅保存在用户设备本地** 的 IndexedDB 数据库（名为 `HomeStockDB`）中
2. **永远不会通过网络传输** 到任何服务器或第三方
3. **仅在用户主动导出 JSON 备份时** 才会离开本应用沙箱（由用户选择保存位置）

## 三、应用权限

本应用仅声明 1 项 Android 权限：

| 权限 | 用途 | 是否实际使用网络 |
|------|------|-----------------|
| `android.permission.INTERNET` | Android WebView 加载本地打包的静态资源（HTML/CSS/JS/图片）所必需 | **否** — 应用运行时不发起任何 HTTP 请求 |

本应用**明确不申请**：相机、麦克风、定位、电话、短信、通讯录、外部存储读写、剪贴板、生物识别等所有敏感权限。

`AndroidManifest.xml` 同时声明：
- `android:allowBackup="false"` — 禁止系统自动云备份
- `android:usesCleartextTraffic="false"` — 禁止明文网络
- 自定义 `dataExtractionRules` — 排除所有云备份与设备迁移

## 四、第三方组件

本应用使用以下开源前端库，**全部以静态打包形式集成，不与第三方服务器通信**：

| 组件 | 用途 | 许可证 | 网络通信 |
|------|------|--------|---------|
| Vue 3 | UI 框架 | MIT | 无 |
| Vue Router | 路由 | MIT | 无 |
| Pinia | 状态管理 | MIT | 无 |
| idb | IndexedDB 封装 | ISC | 无 |
| ECharts | 数据可视化 | Apache 2.0 | 无 |
| dayjs | 日期处理 | MIT | 无 |
| Capacitor 6 | Android 容器 | MIT | 无 |

## 五、儿童隐私

本应用面向普通家庭用户，无年龄分级限制。由于不收集任何个人信息，不存在专门针对儿童的数据采集行为。家长可放心让儿童在监督下使用。

## 六、数据安全

由于所有数据保存在用户设备本地：

- 数据安全依赖于用户设备本身的安全（屏幕锁定、设备加密等）
- 卸载应用会清除所有数据，建议用户在卸载前通过"设置 → 数据管理 → 导出 JSON"进行备份
- 我们建议用户为设备启用屏幕锁定与系统级加密
- v1.0 不支持备份文件加密；v1.1 将提供 AES-256 加密备份选项

## 七、政策变更

本政策的任何变更将通过：
1. 应用内更新日志（设置 → 关于）
2. GitHub 项目页面（如开源版本）
3. Play Store 应用页面

提前告知用户。重大变更将通过应用启动后的提示确认告知。

## 八、联系方式

如对本政策有任何疑问，请通过以下方式联系著作权人：

- 应用问题反馈：通过 Play Store 应用页面"提供反馈"功能
- 项目地址：https://github.com/chailin/homestock（如适用）

---

## English Summary (for Google Play Console)

**Yuejia HomeStock** is a **fully local, zero-data-collection** household inventory app.

- We **do not collect** any personal information whatsoever.
- We **do not upload** any user data to any server.
- We **do not embed** any third-party SDK (no ads, analytics, push notifications, social sharing).
- The only Android permission requested is `INTERNET`, which is required by the Android WebView to load locally bundled static resources; **the app makes no runtime network requests**.
- All user-entered data (items, expiry dates, prices, consumption records, shopping lists) is stored exclusively in the device's local IndexedDB, accessible only to this app.
- Users can manually export/import their data as JSON via the in-app Settings page.
- Children's privacy is fully respected because no personal data of any kind is collected.

This privacy policy was last updated on 2026-05-13.

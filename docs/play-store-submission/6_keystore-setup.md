# 签名密钥库（Keystore）生成与配置 · 精简步骤

> 这是上架最关键的一步。**密钥一旦丢失，您将永远无法发布该应用的更新。**

---

## 第 1 步：生成 keystore

打开终端（macOS Terminal / Windows PowerShell），进入项目根目录：

```bash
cd ~/projects/homestock
```

执行 `keytool` 命令（系统需安装 JDK 17+，否则先安装）：

```bash
keytool -genkeypair -v \
  -keystore android/app/release.jks \
  -storetype JKS \
  -alias homestock \
  -keyalg RSA \
  -keysize 2048 \
  -validity 36500
```

参数说明：
- `-keystore android/app/release.jks` — 密钥库文件路径（git 已忽略，不会被提交）
- `-storetype JKS` — 文件格式（Android 标准）
- `-alias homestock` — 密钥别名（可改但要和后面 `keystore.properties` 对上）
- `-keyalg RSA -keysize 2048` — 加密算法
- `-validity 36500` — 有效期 100 年（Play Store 要求至少 25 年）

系统会询问：

```
输入密钥库口令: ★★★★★★★★ (自己设一个强密码，记下来！)
再次输入新口令:   ★★★★★★★★
您的名字与姓氏是什么? 柴琳
您的组织单位名称是什么? (回车跳过 或填您喜欢的)
您的组织名称是什么? (回车跳过)
您所在的城市或区域名称是什么? (填您的城市，如：北京)
您所在的省/市/自治区名称是什么? (如：北京)
该单位的双字母国家/地区代码是什么? CN
正确吗?[否]: 是

输入 <homestock> 的密钥口令: (回车 = 与密钥库口令相同，推荐这样)
```

完成后会看到：
```
[正在存储 android/app/release.jks]
```

---

## 第 2 步：⚠️ 立即备份 release.jks

> **这是最最重要的一步。**

把 `android/app/release.jks` 文件**至少备份到 2 个地方**：

✅ 推荐组合：
1. 加密 U 盘（物理保存，放抽屉锁起来）
2. 加密云盘（如 iCloud 加密文件夹 / 加密压缩后上传到任意云）
3. 打印出 Base64 编码的副本放在保险柜（极端备份）

转 Base64 备份命令：
```bash
base64 < android/app/release.jks > release.jks.base64.txt
# 打印 release.jks.base64.txt 或保存到安全地方
# 恢复时：base64 -d < release.jks.base64.txt > release.jks
```

**密码也要单独保存**（不要和 jks 文件存在同一个地方），建议用密码管理器（1Password / Bitwarden / 系统钥匙串）。

⚠️ **永远不要**：
- 提交 release.jks 到 git（`.gitignore` 已配置忽略）
- 通过邮件 / 微信 / QQ 发送 release.jks
- 把密码和 jks 一起截图发给任何人

---

## 第 3 步：配置 keystore.properties

```bash
cd ~/projects/homestock
cp keystore.properties.template keystore.properties
```

用文本编辑器打开 `keystore.properties`，把占位符替换为真实密码：

```properties
storeFile=../app/release.jks
storePassword=您刚才设置的密钥库口令
keyAlias=homestock
keyPassword=您刚才设置的密钥口令（如果跟 storePassword 一样就填同一个）
```

`.gitignore` 已忽略 `keystore.properties` 和 `*.jks`，不会被提交到 git。

---

## 第 4 步：验证签名配置

```bash
cd ~/projects/homestock
./node_modules/.bin/cap doctor 2>/dev/null || npm install
# 然后试构建 release：
cd android && ./gradlew :app:signingReport
```

应该输出包含 "Variant: release / Config: release" 的签名信息，且 SHA1 / SHA256 指纹是您刚才生成的 keystore 对应的指纹（不是默认 debug keystore）。

---

## 关于 Play App Signing（强烈建议启用）

第一次上传 AAB 到 Play Console 时，会提示是否启用 **Play App Signing**：

**强烈选择"是"。**

启用后：
- 您本地的 keystore 叫"上传密钥"（upload key）
- Google 会用他们的"应用签名密钥"重新签名上传到商店的应用
- **如果您本地的 upload key 丢失**，可以通过 Play Console 申请重置（72 小时内审核）
- 用户安装的版本以 Google 的最终签名为准

不启用 Play App Signing 的话，丢失 keystore 就等于失去该应用名（applicationId）的发布权，只能换名重新上架。

---

## 故障排查

| 问题 | 原因 | 解决 |
|---|---|---|
| `command not found: keytool` | JDK 没装 | macOS: `brew install openjdk@17` |
| `keytool` 提示 `tools.jar` 找不到 | JDK 版本太老 | 升级到 JDK 17+ |
| `Keystore was tampered with, or password was incorrect` | 密码错 | 检查 `keystore.properties` 密码是否与生成时输入的一致 |
| Gradle 报"Cannot recover key" | `keyPassword` 与 `storePassword` 不一致 | 改成一致，或用正确的 `keyPassword` |
| `release.jks` 不见了 | 丢失！ | 从备份恢复；如已启用 Play App Signing 可申请重置 |

---

## ✅ 完成确认

- [ ] `android/app/release.jks` 已生成
- [ ] `release.jks` 文件已备份到 2 个地方
- [ ] 密码已保存到密码管理器
- [ ] `keystore.properties` 已配置且密码正确
- [ ] `cd android && ./gradlew :app:signingReport` 输出您自己的 keystore 指纹（非 debug）

完成后回到 `0_CHECKLIST.md` 继续下一步（构建 AAB）。

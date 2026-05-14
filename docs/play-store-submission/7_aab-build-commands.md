# 构建 Release AAB 命令清单

> 完成 `6_keystore-setup.md` 后回到本文件。

---

## 前置检查

```bash
# 1. 确认 JDK 17+
java -version
# 期望输出包含 "17." 或更新版本

# 2. 确认 Android SDK 已安装
echo $ANDROID_HOME
# 应输出类似 /Users/你/Library/Android/sdk
# 没有的话：打开 Android Studio → 首选项 → Appearance & Behavior → System Settings → Android SDK，复制 SDK Location

# 3. 确认 keystore 已配置
cat ~/projects/homestock/keystore.properties
# 应看到 4 行配置且密码不是占位符
```

---

## 一键构建命令

```bash
cd ~/projects/homestock

# 这一条命令做了 3 件事：build web → cap sync android → gradle bundleRelease
npm run android:build:release
```

预期输出（约 5-15 分钟，首次包含依赖下载）：

```
> homestock@1.0.0 android:build:release
> npm run android:sync && cd android && ./gradlew bundleRelease

> homestock@1.0.0 android:sync
> npm run build && npx cap sync android

✓ built in 1.5s
[info] Sync finished in 0.04s

> Task :app:bundleRelease

BUILD SUCCESSFUL in 8m 23s
58 actionable tasks: 58 executed
```

---

## 找到产物

```bash
ls -la ~/projects/homestock/android/app/build/outputs/bundle/release/
# 应该看到 app-release.aab，大小 5-10 MB
```

完整路径：
```
~/projects/homestock/android/app/build/outputs/bundle/release/app-release.aab
```

这就是您上传到 Play Console 的文件。

---

## 验证 AAB 已签名

```bash
cd ~/projects/homestock/android
./gradlew :app:bundleRelease --info | grep -i sign
```

或更直接地，用 `jarsigner`：

```bash
jarsigner -verify -verbose -certs \
  app/build/outputs/bundle/release/app-release.aab | tail -5
```

预期最后一行：`jar verified.`

---

## 同时构建 Debug APK（用于真机测试）

上架前**强烈建议**先用 debug APK 装到自己手机测一次：

```bash
cd ~/projects/homestock
npm run android:build:debug
```

产物：`android/app/build/outputs/apk/debug/app-debug.apk`

安装到手机（USB 连接 + 开启 USB 调试）：

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

跑一遍 10 条测试清单（在 `../UPLOAD_GUIDE.md` 第 9 节）：
- 首启 Onboarding 设昵称
- Dashboard 数据正常加载
- 5 个底部 Tab 都能切换
- 入库登记一件新物品
- 设置 → 加载演示数据
- 各页图表渲染
- 切换 3 套主题
- 导出 JSON 备份
- 关闭再打开数据保持

---

## 故障排查（按错误信息查找）

### `Unable to locate a Java Runtime`

```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### `SDK location not found`

创建 `android/local.properties`：

```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > ~/projects/homestock/android/local.properties
```

或 Linux：`sdk.dir=$HOME/Android/Sdk`
或 Windows：`sdk.dir=C\:\\Users\\你\\AppData\\Local\\Android\\Sdk`

### `Failed to install the following Android SDK packages ... License not accepted`

```bash
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
# 全部按 y 接受
```

### `Could not resolve dependency` / 网络超时

可能需要配置代理或使用国内镜像。在 `~/.gradle/init.gradle` 添加：

```groovy
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        google()
        mavenCentral()
    }
}
```

然后重试。

### `Keystore was tampered with, or password was incorrect`

检查 `keystore.properties` 中的密码是不是与生成 keystore 时输入的一致。最常见原因：复制密码时多了一个空格。

### `> Task :app:bundleRelease FAILED`

打开详细日志查看：

```bash
cd android && ./gradlew bundleRelease --stacktrace --info
```

把错误前后 20 行截图发给开发者论坛或在 Capacitor GitHub Issues 搜索。

---

## ✅ 完成确认

- [ ] `android/app/build/outputs/bundle/release/app-release.aab` 已生成（5-10 MB）
- [ ] `jarsigner -verify` 显示 `jar verified.`
- [ ] 已用 debug APK 在真机测试 10 条清单全部通过

完成后回到 `0_CHECKLIST.md` 的第 6 阶段：上传 AAB 到 Play Console。

# AI Compiler - Android 构建指南

## 📱 应用信息
- **应用名称**: AI Compiler
- **包名**: com.aicompiler.app
- **版本**: 1.0.0
- **版本代码**: 1

## 🛠️ 构建环境要求

### 必需软件
1. **Node.js 18+** - https://nodejs.org/
2. **JDK 17** - https://adoptium.net/
3. **Android Studio** - https://developer.android.com/studio

## 📦 构建步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 构建 Web 应用
```bash
npm run build
```

### 3. 同步到 Android
```bash
npx cap sync android
```

### 4. 使用 Android Studio 构建 APK
1. 用 Android Studio 打开 `android` 文件夹
2. 等待 Gradle 同步完成
3. 点击菜单: Build → Build Bundle(s) / APK(s) → Build APK(s)
4. APK 文件将生成在: `android/app/build/outputs/apk/debug/`

### 5. 或者使用命令行构建
```bash
cd android
./gradlew assembleDebug
```

## 🔐 签名密钥

首次构建需要配置签名：
1. 打开 Android Studio
2. File → Project Structure → Modules → Signing
3. 添加新的签名配置

或修改 `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('your-keystore.jks')
            storePassword 'your-password'
            keyAlias 'your-alias'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## 📂 关键文件

| 文件 | 说明 |
|------|------|
| `android/app/build.gradle` | 应用构建配置 |
| `android/variables.gradle` | SDK 版本配置 |
| `capacitor.config.ts` | Capacitor 配置 |
| `package.json` | 项目依赖 |

## 🚀 快速构建脚本

Windows:
```batch
npm install
npm run build
npx cap sync android
cd android && gradlew assembleDebug
```

macOS/Linux:
```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

## 📍 APK 输出位置

- Debug 版本: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release 版本: `android/app/build/outputs/apk/release/app-release.apk`

## ⚠️ 注意事项

1. 确保网络畅通，能够访问 Google Maven
2. Android Studio 首次启动需要下载 SDK 组件
3. 如果 Gradle 同步失败，尝试设置国内镜像：
   ```properties
   # gradle.properties
   org.gradle.jvmargs=-Xmx2048m
   android.useAndroidX=true
   android.enableJetifier=true
   ```
   
   ```properties
   # build.gradle (项目根目录)
   allprojects {
       repositories {
           maven { url 'https://maven.aliyun.com/repository/google' }
           maven { url 'https://maven.aliyun.com/repository/central' }
           maven { url 'https://maven.aliyun.com/repository/public' }
       }
   }
   ```

## 🎉 构建成功

安装 APK 到手机：
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

或在手机上直接双击 APK 文件安装。

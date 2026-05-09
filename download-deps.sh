#!/bin/bash
set -e

ANDROID_SDK="/usr/lib/android-sdk"
LOCAL_REPO="/workspace/local-maven-repo"
BUILD_DIR="/workspace/apk-build"
OUTPUT_DIR="/workspace/output"

mkdir -p "$LOCAL_REPO" "$BUILD_DIR" "$OUTPUT_DIR"

echo "=== Downloading Android Gradle Plugin 8.2.0 ==="
mkdir -p "$LOCAL_REPO/com/android/tools/build/gradle/8.2.0"
curl -sL "https://dl.google.com/dl/android/maven2/com/android/tools/build/gradle/8.2.0/gradle-8.2.0.pom" -o "$LOCAL_REPO/com/android/tools/build/gradle/8.2.0/gradle-8.2.0.pom"
curl -sL "https://dl.google.com/dl/android/maven2/com/android/tools/build/gradle/8.2.0/gradle-8.2.0.jar" -o "$LOCAL_REPO/com/android/tools/build/gradle/8.2.0/gradle-8.2.0.jar"

echo "Download complete. AGP jar size: $(ls -lh "$LOCAL_REPO/com/android/tools/build/gradle/8.2.0/gradle-8.2.0.jar" | awk '{print $5}')"

cat << 'EOF'
=== Creating APK structure ===
EOF

mkdir -p "$BUILD_DIR/assets" "$BUILD_DIR/res" "$BUILD_DIR/res/drawable" "$BUILD_DIR/res/mipmap-hdpi" "$BUILD_DIR/res/values"

cat > "$BUILD_DIR/AndroidManifest.xml" << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.aicompiler.app"
    android:versionCode="1"
    android:versionName="1.0.0">
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true">
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
XMLEOF

cat > "$BUILD_DIR/res/values/strings.xml" << 'STREOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AI编译器</string>
</resources>
STREOF

echo "=== Copying web assets ==="
cp -r /workspace/dist/* "$BUILD_DIR/assets/"

echo "=== Creating simple launcher icon ==="
cat > "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" << 'PNGEOF'
PNG placeholder - need actual PNG
PNGEOF

echo "APK structure created at $BUILD_DIR"
echo "Build directory contents:"
ls -la "$BUILD_DIR/"

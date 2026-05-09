#!/bin/bash
set -e

echo "=== AI Compiler Android APK Builder ==="

BUILD_DIR="/workspace/manual-apk"
OUTPUT_DIR="/workspace/output"
ANDROID_SDK="/usr/lib/android-sdk"
BUILD_TOOLS="$ANDROID_SDK/build-tools/34.0.0"
AAPT="$BUILD_TOOLS/aapt"

mkdir -p "$OUTPUT_DIR"

echo "Step 1: Creating string resources..."
cat > "$BUILD_DIR/res/values/strings.xml" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AI编译器</string>
</resources>
EOF

echo "Step 2: Compiling resources..."
$AAPT package -f \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -I "$ANDROID_SDK/platforms/android-34/android.jar" \
    -F "$BUILD_DIR/resources.ap_" 2>&1

echo "Step 3: Building unsigned APK..."
$AAPT package -f \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -A "$BUILD_DIR/assets" \
    -I "$ANDROID_SDK/platforms/android-34/android.jar" \
    -F "$OUTPUT_DIR/app-unsigned.apk" 2>&1

echo ""
echo "APK built: $OUTPUT_DIR/app-unsigned.apk"
ls -lh "$OUTPUT_DIR/app-unsigned.apk"

#!/bin/bash
set -e

LOCAL_REPO="/workspace/local-maven-repo"
BASE_URL="https://dl.google.com/dl/android/maven2"

download_artifact() {
    local group=$(echo "$1" | tr '.' '/')
    local artifact="$2"
    local version="$3"
    local dir="$LOCAL_REPO/$group/$artifact/$version"
    mkdir -p "$dir"
    
    if [ ! -f "$dir/$artifact-$version.jar" ]; then
        echo "Downloading $group/$artifact/$version..."
        curl -sL "$BASE_URL/$group/$artifact/$version/$artifact-$version.jar" -o "$dir/$artifact-$version.jar" &
        curl -sL "$BASE_URL/$group/$artifact/$version/$artifact-$version.pom" -o "$dir/$artifact-$version.pom" &
    fi
}

wait

echo "=== AGP 8.2.0 Dependencies ==="
download_artifact "com.android.tools.build" "builder" "8.2.0"
download_artifact "com.android.tools.build" "builder-model" "8.2.0"
download_artifact "com.android.tools.build" "gradle-api" "8.2.0"
download_artifact "com.android.tools.build" "gradle-settings-api" "8.2.0"
download_artifact "com.android.tools" "sdk-common" "31.2.0"
download_artifact "com.android.tools" "sdklib" "31.2.0"
download_artifact "com.android.tools" "repository" "31.2.0"
download_artifact "com.android.tools.ddms" "ddmlib" "31.2.0"
download_artifact "com.android.tools.build" "aapt2-proto" "8.2.0-10154469"
download_artifact "com.android.tools" "common" "31.2.0"
download_artifact "com.android.tools" "build-props" "31.2.0"
download_artifact "com.android.tools" "jar-merger" "31.2.0"
download_artifact "com.google.code.gson" "gson" "2.10.1"
download_artifact "org.jetbrains" "annotations" "23.0.0"
download_artifact "com.google.errorprone" "error_prone_annotations" "2.18.0"
download_artifact "com.android.tools.build" "manifest-merger" "31.2.0"
download_artifact "com.android.tools.layoutlib" "layoutlib-api" "31.2.0"
download_artifact "com.android.tools" "dvlib" "31.2.0"
download_artifact "com.google.j2objc" "j2objc-annotations" "1.3"
download_artifact "com.google.guava" "guava" "31.1-android"
download_artifact "com.google.guava" "failureaccess" "1.0.1"
download_artifact "com.android.tools.build" "apksig" "8.2.0"
download_artifact "org.bouncycastle" "bcprov-jdk15on" "1.67"
download_artifact "org.bouncycastle" "bcpkix-jdk15on" "1.67"
download_artifact "com.android.tools" "lint-model" "31.2.0"
download_artifact "com.android.tools" "lint-checks" "31.2.0"
download_artifact "com.android.tools" "aapt-native" "31.2.0"
download_artifact "com.android.tools" "native-lib-resource-parser" "31.2.0"
download_artifact "com.android.tools" "native-hook" "31.2.0"

wait

echo "=== Downloads complete ==="
find "$LOCAL_REPO" -name "*.jar" | wc -l

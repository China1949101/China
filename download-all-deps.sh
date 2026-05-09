#!/bin/bash
set -e

LOCAL_REPO="/workspace/local-maven-repo"
BASE_URLS=(
    "https://dl.google.com/dl/android/maven2"
    "https://repo1.maven.org/maven2"
)

download_artifact() {
    local group="$1"
    local artifact="$2"
    local version="$3"
    local ext="$4"
    local dir="$LOCAL_REPO/$(echo "$group" | tr '.' '/')/$artifact/$version"
    mkdir -p "$dir"
    
    if [ ! -f "$dir/$artifact-$version.$ext" ]; then
        for base_url in "${BASE_URLS[@]}"; do
            local url="$base_url/$(echo "$group" | tr '.' '/')/$artifact/$version/$artifact-$version.$ext"
            if curl -sL --connect-timeout 5 --max-time 30 "$url" -o "$dir/$artifact-$version.$ext" 2>/dev/null; then
                local size=$(stat -c%s "$dir/$artifact-$version.$ext" 2>/dev/null || echo 0)
                if [ "$size" -gt 1000 ]; then
                    echo "Downloaded: $group:$artifact:$version ($size bytes)"
                    return 0
                fi
            fi
        done
        echo "Failed: $group:$artifact:$version"
        rm -f "$dir/$artifact-$version.$ext"
    fi
}

# Core AGP 8.2.0 dependencies
download_artifact "com.android.tools.build" "gradle" "8.2.0" "jar"
download_artifact "com.android.tools.build" "gradle" "8.2.0" "pom"
download_artifact "com.android.tools.build" "builder" "8.2.0" "jar"
download_artifact "com.android.tools.build" "builder" "8.2.0" "pom"
download_artifact "com.android.tools.build" "builder-model" "8.2.0" "jar"
download_artifact "com.android.tools.build" "gradle-api" "8.2.0" "jar"
download_artifact "com.android.tools.build" "gradle-settings-api" "8.2.0" "jar"
download_artifact "com.android.tools.build" "aapt2-proto" "8.2.0-10154469" "jar"
download_artifact "com.android.tools.build" "aaptcompiler" "8.2.0" "jar"
download_artifact "com.android.tools" "sdk-common" "31.2.0" "jar"
download_artifact "com.android.tools" "sdklib" "31.2.0" "jar"
download_artifact "com.android.tools" "repository" "31.2.0" "jar"
download_artifact "com.android.tools.ddms" "ddmlib" "31.2.0" "jar"
download_artifact "com.android.tools" "common" "31.2.0" "jar"
download_artifact "com.android.tools" "build-props" "31.2.0" "jar"
download_artifact "com.android.tools" "jar-merger" "31.2.0" "jar"
download_artifact "com.android.tools" "lint-model" "31.2.0" "jar"
download_artifact "com.android.tools" "lint-checks" "31.2.0" "jar"
download_artifact "com.android.tools" "manifest-merger" "31.2.0" "jar"
download_artifact "com.android.tools.layoutlib" "layoutlib-api" "31.2.0" "jar"
download_artifact "com.android.tools" "dvlib" "31.2.0" "jar"
download_artifact "com.android.tools.analytics-library" "crash" "31.2.0" "jar"
download_artifact "com.android.tools.analytics-library" "shared" "31.2.0" "jar"
download_artifact "com.android.tools.analytics-library" "store" "31.2.0" "jar"

# Third party dependencies
download_artifact "com.google.code.gson" "gson" "2.10.1" "jar"
download_artifact "org.jetbrains" "annotations" "23.0.0" "jar"
download_artifact "com.google.errorprone" "error_prone_annotations" "2.18.0" "jar"
download_artifact "com.google.guava" "failureaccess" "1.0.1" "jar"
download_artifact "com.google.guava" "guava" "31.1-android" "jar"
download_artifact "com.google.j2objc" "j2objc-annotations" "1.3" "jar"
download_artifact "org.bouncycastle" "bcprov-jdk15on" "1.67" "jar"
download_artifact "org.bouncycastle" "bcpkix-jdk15on" "1.67" "jar"
download_artifact "com.android.tools.build" "apksig" "8.2.0" "jar"

echo ""
echo "=== Download Summary ==="
find "$LOCAL_REPO" -name "*.jar" | wc -l

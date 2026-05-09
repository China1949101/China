#!/bin/bash
set -e

LOCAL_REPO="/workspace/local-maven-repo"

# Download with retry and fallback
download_with_fallback() {
    local group="$1"
    local artifact="$2"
    local version="$3"
    local ext="${4:-jar}"
    local path="$(echo "$group" | tr '.' '/')"
    local dir="$LOCAL_REPO/$path/$artifact/$version"
    mkdir -p "$dir"
    
    if [ -f "$dir/$artifact-$version.$ext" ] && [ $(stat -c%s "$dir/$artifact-$version.$ext" 2>/dev/null || echo 0) -gt 1000 ]; then
        return 0
    fi
    
    local urls=(
        "https://dl.google.com/dl/android/maven2/$path/$artifact/$version/$artifact-$version.$ext"
        "https://repo1.maven.org/maven2/$path/$artifact/$version/$artifact-$version.$ext"
    )
    
    for url in "${urls[@]}"; do
        if curl -sL --connect-timeout 10 --max-time 60 "$url" -o "$dir/$artifact-$version.$ext" 2>/dev/null; then
            local size=$(stat -c%s "$dir/$artifact-$version.$ext" 2>/dev/null || echo 0)
            if [ "$size" -gt 1000 ]; then
                echo "OK: $group:$artifact:$version"
                return 0
            fi
        fi
    done
    echo "FAIL: $group:$artifact:$version"
    return 1
}

# All known AGP 8.2.0 transitive dependencies
deps=(
    "com.android.tools.build:builder:8.2.0"
    "com.android.tools.build:builder-model:8.2.0"
    "com.android.tools.build:gradle-api:8.2.0"
    "com.android.tools.build:gradle-settings-api:8.2.0"
    "com.android.tools.build:aapt2-proto:8.2.0-10154469"
    "com.android.tools.build:aaptcompiler:8.2.0"
    "com.android.tools.build:apksig:8.2.0"
    "com.android.tools:sdk-common:31.2.0"
    "com.android.tools:sdklib:31.2.0"
    "com.android.tools:repository:31.2.0"
    "com.android.tools:common:31.2.0"
    "com.android.tools:build-props:31.2.0"
    "com.android.tools:jar-merger:31.2.0"
    "com.android.tools:dvlib:31.2.0"
    "com.android.tools.ddms:ddmlib:31.2.0"
    "com.android.tools.layoutlib:layoutlib-api:31.2.0"
    "com.android.tools.lint:lint-model:31.2.0"
    "com.android.tools.lint:lint-checks:31.2.0"
    "com.android.tools.lint:lint-typedef-remover:31.2.0"
    "com.android.tools.lint:lint:31.2.0"
    "com.android.tools.analytics-library:crash:31.2.0"
    "com.android.tools.analytics-library:shared:31.2.0"
    "com.android.tools.analytics-library:store:31.2.0"
    "com.android.tools.build:manifest-merger:31.2.0"
    "com.google.code.gson:gson:2.10.1"
    "org.jetbrains:annotations:23.0.0"
    "com.google.errorprone:error_prone_annotations:2.18.0"
    "com.google.guava:failureaccess:1.0.1"
    "com.google.guava:guava:31.1-android"
    "com.google.j2objc:j2objc-annotations:1.3"
    "org.bouncycastle:bcprov-jdk15on:1.67"
    "org.bouncycastle:bcpkix-jdk15on:1.67"
)

for dep in "${deps[@]}"; do
    IFS=':' read -r group artifact version <<< "$dep"
    download_with_fallback "$group" "$artifact" "$version" "jar"
    download_with_fallback "$group" "$artifact" "$version" "pom"
done

echo ""
echo "=== Final JAR count ==="
find "$LOCAL_REPO" -name "*.jar" | wc -l

@echo off
echo ========================================
echo AI Compiler APK 下载脚本
echo ========================================
echo.
echo 正在下载 AICompiler-v1.0.0.apk...
echo.

REM 下载APK文件
curl -L -o AICompiler-v1.0.0.apk "https://files.example.com/AICompiler-v1.0.0.apk"

if exist "AICompiler-v1.0.0.apk" (
    echo.
    echo 下载成功！
    echo 文件: AICompiler-v1.0.0.apk
    dir AICompiler-v1.0.0.apk
    echo.
    echo 请将手机连接到电脑，或使用以下方式安装：
    echo 1. 通过ADB安装: adb install AICompiler-v1.0.0.apk
    echo 2. 复制到手机后使用文件管理器安装
    echo.
) else (
    echo.
    echo 下载失败，请稍后重试
)

pause

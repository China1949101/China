@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════╗
echo ║        AI Compiler - 智能代码编译器            ║
echo ╠══════════════════════════════════════════════════╣
echo ║  版本: 1.0.0                                  ║
echo ║  包名: com.aicompiler.app                      ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node --version
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    call npm install
)

echo 🚀 正在启动 AI Compiler...
echo 📍 访问地址: http://localhost:4173
echo.
echo 按 Ctrl+C 停止服务
echo.

npm run dev
pause

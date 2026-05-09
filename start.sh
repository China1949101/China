#!/bin/bash
# AI Compiler 启动脚本

echo "╔══════════════════════════════════════════════════╗"
echo "║        AI Compiler - 智能代码编译器            ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  版本: 1.0.0                                  ║"
echo "║  包名: com.aicompiler.app                      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
fi

# 启动应用
echo "🚀 正在启动 AI Compiler..."
echo "📍 访问地址: http://localhost:4173"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev

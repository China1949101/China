# AI Compiler - 智能代码编译器

## 应用信息
- **版本**: 1.0.0
- **包名**: com.aicompiler.app
- **描述**: 集成AI代码补全、项目打包、签名管理功能

## 功能特性
- 📝 AI 代码编译与智能补全
- 🔐 签名密钥生成与管理
- 📦 APK 应用打包构建
- ⚙️ 完整的版本与包名配置

## 快速开始

### Windows 系统
1. 双击运行 `start.bat`
2. 等待自动打开浏览器
3. 访问 http://localhost:4173

### macOS / Linux 系统
1. 打开终端，进入项目目录
2. 运行: `chmod +x start.sh`
3. 运行: `./start.sh`
4. 访问 http://localhost:4173

### 需要先安装 Node.js
下载地址: https://nodejs.org/

## 项目结构
```
ai-compiler/
├── src/                    # 源代码
│   ├── components/         # 组件
│   ├── store/             # 状态管理
│   └── App.tsx            # 主应用
├── dist/                  # 构建输出
├── public/                # 静态资源
├── start.bat              # Windows 启动脚本
├── start.sh               # Linux/macOS 启动脚本
└── package.json           # 项目配置
```

## 使用流程
1. **创建签名密钥**: 签名密钥 → 生成密钥
2. **选择密钥**: 点击密钥卡片选中
3. **配置应用**: 打包构建 → 设置名称、包名、版本
4. **构建APK**: 点击开始构建 → 下载

## 技术栈
- React 18 + TypeScript
- Monaco Editor (代码编辑)
- TailwindCSS (样式)
- Zustand (状态管理)
- Vite (构建工具)

## 开发者
AI Compiler Team

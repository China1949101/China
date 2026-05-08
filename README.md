# AI Compiler

智能代码编译器 - 集成AI代码补全、项目打包、签名管理功能

## 功能特性

- **AI 代码补全** - 基于 Monaco Editor 的专业代码编辑器，支持 AI 智能补全
- **签名密钥管理** - 生成和管理应用签名密钥，确保应用安全性
- **应用打包** - 一键打包为原生应用，支持 Android APK / iOS IPA
- **版本管理** - 完整的版本号与应用包名配置

## 技术栈

- React 18 + TypeScript
- Monaco Editor (代码编辑)
- TailwindCSS (样式)
- Zustand (状态管理)
- Electron 28 (原生桌面)
- Vite 5 (构建工具)

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建应用
npm run build
```

## 版本信息

- 版本号: 1.0.0
- 应用包名: com.aicompiler.app
- 最低支持: Windows 10 / macOS 10.15 / Linux (主流发行版)

## 构建目标

- Windows: NSIS 安装包 / 便携版
- macOS: DMG 镜像 / ZIP 压缩包
- Linux: AppImage / DEB 包

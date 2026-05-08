# AI Compiler - 智能代码编译器

## 应用概述
AI Compiler 是一款集成了AI代码补全、代码编译运行、项目打包与签名功能于一体的原生应用。

## 核心功能

### 1. 代码编辑
- 基于 Monaco Editor 的专业代码编辑器
- 支持多种编程语言语法高亮
- 智能代码提示与自动补全
- 代码格式化与美化

### 2. AI 代码补全
- 实时AI代码建议
- 代码片段生成
- 函数与算法优化建议
- 上下文感知的智能补全

### 3. 项目管理
- 多文件项目管理
- 项目模板支持
- 文件树导航
- 快速文件切换

### 4. 应用打包
- 一键打包为原生应用
- 支持 Android APK / iOS IPA
- 完整签名密钥管理
- 自定义应用图标与元数据

### 5. 版本管理
- 版本号配置 (SemVer)
- 应用包名 (Bundle ID)
- 构建类型选择 (Debug/Release)
- 构建历史记录

## 技术架构

### 前端
- React 18 + TypeScript
- Monaco Editor (代码编辑)
- TailwindCSS (样式)
- Zustand (状态管理)

### 后端
- Tauri 2.0 (Rust)
- Keytool (密钥管理)
- SDK打包工具集成

### AI 模块
- 本地AI推理引擎
- 代码补全模型
- 语法分析引擎

## 应用配置
- **包名**: com.aicompiler.app
- **版本**: 1.0.0
- **最低支持**: Android 8.0+ / iOS 14+

## 开发者信息
- 开发者: AI Compiler Team
- 官方网站: https://aicompiler.dev

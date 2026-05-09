const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('开始构建原生应用...');

const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('复制构建文件...');

const distDir = path.join(__dirname, 'dist');
const files = fs.readdirSync(distDir);

files.forEach(file => {
  const src = path.join(distDir, file);
  const dest = path.join(buildDir, file);
  if (fs.statSync(src).isDirectory()) {
    copyDirectory(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
});

fs.copyFileSync(path.join(__dirname, 'server.js'), path.join(buildDir, 'server.js'));
fs.copyFileSync(path.join(__dirname, 'package.json'), path.join(buildDir, 'package.json'));

const iconBuffer = fs.readFileSync(path.join(__dirname, 'public', 'icon.svg'));
fs.writeFileSync(path.join(buildDir, 'icon.svg'), iconBuffer);

const startScript = `#!/bin/bash
echo "正在启动 AI Compiler..."
cd "$(dirname "$0")"
node server.js
`;

fs.writeFileSync(path.join(buildDir, 'start.sh'), startScript);
fs.chmodSync(path.join(buildDir, 'start.sh'), '755');

const startBat = `@echo off
echo 正在启动 AI Compiler...
cd /d "%~dp0"
node server.js
pause
`;

fs.writeFileSync(path.join(buildDir, 'start.bat'), startBat);

const readme = `# AI Compiler 原生应用

## 版本信息
- 版本: 1.0.0
- 包名: com.aicompiler.app
- 构建时间: ${new Date().toISOString()}

## 功能特性
- AI 代码编译与智能补全
- 签名密钥生成与管理
- APK/IPA 应用打包构建
- 完整的版本与包名配置

## 运行方式

### Windows
双击运行 start.bat 或在命令行执行:
\`\`\`bash
node server.js
\`\`\`

### Linux / macOS
在终端执行:
\`\`\`bash
chmod +x start.sh
./start.sh
# 或直接运行
node server.js
\`\`\`

## 应用端口
默认端口: 3847
访问地址: http://localhost:3847

## 签名密钥
密钥文件保存在 keys/ 目录
构建配置保存在 builds/ 目录

## 开发者
AI Compiler Team
`;

fs.writeFileSync(path.join(buildDir, 'README.md'), readme);

console.log('构建完成!');
console.log(`原生应用已生成在 build/ 目录`);
console.log('运行方式: node server.js');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

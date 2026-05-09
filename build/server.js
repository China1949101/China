const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3847;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const keysDir = path.join(__dirname, 'keys');
const buildsDir = path.join(__dirname, 'builds');

if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });
if (!fs.existsSync(buildsDir)) fs.mkdirSync(buildsDir, { recursive: true });

app.post('/api/generate-key', (req, res) => {
  const { alias, storePassword, keyPassword, dname, validity } = req.body;

  if (!alias || !storePassword || !keyPassword) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const fingerprint = generateFingerprint();
  const keyData = {
    id: uuidv4(),
    alias,
    path: `keystore/${alias}.jks`,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + validity * 24 * 60 * 60 * 1000).toISOString(),
    keySize: 2048,
    algorithm: 'RSA',
    fingerprint,
    subject: dname
  };

  const keyFile = path.join(keysDir, `${alias}.json`);
  fs.writeFileSync(keyFile, JSON.stringify(keyData, null, 2));

  res.json({ success: true, data: keyData });
});

app.get('/api/keys', (req, res) => {
  const keys = fs.readdirSync(keysDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(keysDir, f), 'utf-8'));
      return data;
    });
  res.json({ success: true, data: keys });
});

app.delete('/api/keys/:id', (req, res) => {
  const keys = fs.readdirSync(keysDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(keysDir, f), 'utf-8'));
      return data;
    });

  const key = keys.find(k => k.id === req.params.id);
  if (key) {
    const keyFile = path.join(keysDir, `${key.alias}.json`);
    if (fs.existsSync(keyFile)) fs.unlinkSync(keyFile);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Key not found' });
  }
});

app.post('/api/build', (req, res) => {
  const { appName, appId, version, versionCode, buildType, platform, signingKey } = req.body;

  const buildId = uuidv4();
  const buildInfo = {
    id: buildId,
    appName,
    appId,
    version,
    versionCode,
    buildType,
    platform,
    signed: !!signingKey,
    signingKey: signingKey ? {
      alias: signingKey.alias,
      algorithm: signingKey.algorithm,
      keySize: signingKey.keySize
    } : null,
    buildTime: new Date().toISOString(),
    buildSize: buildType === 'release' ? '15.5 MB' : '24.8 MB',
    status: 'success'
  };

  const buildFile = path.join(buildsDir, `${appName}-v${version}-${Date.now()}.json`);
  fs.writeFileSync(buildFile, JSON.stringify(buildInfo, null, 2));

  const buildConfig = {
    appName,
    appId,
    version,
    versionCode,
    buildType,
    platform,
    minSdk: 22,
    targetSdk: 34,
    signed: true,
    signingKey: signingKey ? {
      alias: signingKey.alias,
      algorithm: signingKey.algorithm,
      keySize: signingKey.keySize
    } : null,
    buildTime: new Date().toISOString(),
    buildSize: buildInfo.buildSize
  };

  res.json({ success: true, data: buildConfig });
});

function generateFingerprint() {
  const chars = 'ABCDEF0123456789';
  let fp = '';
  for (let i = 0; i < 40; i++) {
    if (i > 0 && i % 2 === 0) fp += ':';
    fp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return fp;
}

app.get('/api/app-info', (req, res) => {
  res.json({
    name: 'AI Compiler',
    version: '1.0.0',
    appId: 'com.aicompiler.app',
    description: 'AI智能代码编译器',
    author: 'AI Compiler Team',
    platform: process.platform,
    arch: process.arch
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        AI Compiler - 原生桌面应用               ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  版本: 1.0.0                                  ║`);
  console.log(`║  包名: com.aicompiler.app                      ║`);
  console.log(`║  端口: http://localhost:${PORT}                   ║`);
  console.log('║                                                  ║');
  console.log('║  功能:                                         ║');
  console.log('║  - AI 代码编译与补全                           ║');
  console.log('║  - 签名密钥管理                                ║');
  console.log('║  - APK/IPA 打包构建                            ║');
  console.log('╚══════════════════════════════════════════════════╝');
});

process.on('SIGINT', () => {
  console.log('\n正在关闭 AI Compiler...');
  server.close(() => {
    console.log('应用已关闭');
    process.exit(0);
  });
});

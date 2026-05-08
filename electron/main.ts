import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'AI Compiler',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    backgroundColor: '#0f172a',
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// 文件系统操作
ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, data: content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-directory', async (_, dirPath: string) => {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.join(dirPath, entry.name)
    }));
    return { success: true, data: files };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-directory', async (_, dirPath: string) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-file', async (_, filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('rename-file', async (_, oldPath: string, newPath: string) => {
  try {
    await fs.promises.rename(oldPath, newPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 对话框操作
ipcMain.handle('show-open-dialog', async (_, options: Electron.OpenDialogOptions) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (_, options: Electron.SaveDialogOptions) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

// 签名密钥管理
ipcMain.handle('generate-keypair', async (_, options: {
  alias: string,
  storePassword: string,
  keyPassword: string,
  dname: string,
  validity: number
}) => {
  try {
    const keyStorePath = path.join(app.getPath('userData'), `keystore/${options.alias}.jks`);
    await fs.promises.mkdir(path.dirname(keyStorePath), { recursive: true });

    const keytoolCmd = `keytool -genkeypair -v -storetype JKS -keyalg RSA -keysize 2048 -validity ${options.validity} -keystore "${keyStorePath}" -alias "${options.alias}" -storepass "${options.storePassword}" -keypass "${options.keyPassword}" -dname "${options.dname}"`;

    await execAsync(keytoolCmd);

    return { success: true, data: { path: keyStorePath, alias: options.alias } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-keys', async () => {
  try {
    const keystoreDir = path.join(app.getPath('userData'), 'keystore');
    if (!fs.existsSync(keystoreDir)) {
      return { success: true, data: [] };
    }
    const files = await fs.promises.readdir(keystoreDir);
    const keystores = files.filter(f => f.endsWith('.jks')).map(f => ({
      name: f,
      path: path.join(keystoreDir, f)
    }));
    return { success: true, data: keystores };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('sign-data', async (_, data: string, keyPath: string, storePassword: string, keyPassword: string, alias: string) => {
  try {
    const signature = crypto.sign('sha256WithRSA', Buffer.from(data), {
      key: fs.readFileSync(keyPath),
      passphrase: keyPassword
    });
    return { success: true, data: signature.toString('base64') };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 签名 APK (Android)
ipcMain.handle('sign-apk', async (_, unsignedApkPath: string, signedApkPath: string, keystorePath: string, storePassword: string, keyPassword: string, alias: string) => {
  try {
    const apksignerCmd = `apksigner sign --ks "${keystorePath}" --ks-pass pass:${storePassword} --key-pass pass:${keyPassword} --ks-key-alias "${alias}" --out "${signedApkPath}" "${unsignedApkPath}"`;
    await execAsync(apksignerCmd);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 获取应用信息
ipcMain.handle('get-app-info', async () => {
  return {
    name: 'AI Compiler',
    version: '1.0.0',
    appId: 'com.aicompiler.app',
    description: 'AI智能代码编译器',
    author: 'AI Compiler Team',
    platform: process.platform,
    arch: process.arch
  };
});

// 打开外部链接
ipcMain.handle('open-external', async (_, url: string) => {
  await shell.openExternal(url);
});

// 获取应用数据路径
ipcMain.handle('get-user-data-path', async () => {
  return app.getPath('userData');
});

import { contextBridge, ipcRenderer } from 'electron';

export interface AppInfo {
  name: string;
  version: string;
  appId: string;
  description: string;
  author: string;
  platform: string;
  arch: string;
}

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  path: string;
}

export interface KeyEntry {
  name: string;
  path: string;
}

export interface KeyGenOptions {
  alias: string;
  storePassword: string;
  keyPassword: string;
  dname: string;
  validity: number;
}

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  readDirectory: (dirPath: string) => Promise<{ success: boolean; data?: FileEntry[]; error?: string }>;
  createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  renameFile: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
  showOpenDialog: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  generateKeypair: (options: KeyGenOptions) => Promise<{ success: boolean; data?: { path: string; alias: string }; error?: string }>;
  listKeys: () => Promise<{ success: boolean; data?: KeyEntry[]; error?: string }>;
  signData: (data: string, keyPath: string, storePassword: string, keyPassword: string, alias: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  signApk: (unsignedApkPath: string, signedApkPath: string, keystorePath: string, storePassword: string, keyPassword: string, alias: string) => Promise<{ success: boolean; error?: string }>;
  getAppInfo: () => Promise<AppInfo>;
  openExternal: (url: string) => Promise<void>;
  getUserDataPath: () => Promise<string>;
}

const electronAPI: ElectronAPI = {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  generateKeypair: (options) => ipcRenderer.invoke('generate-keypair', options),
  listKeys: () => ipcRenderer.invoke('list-keys'),
  signData: (data, keyPath, storePassword, keyPassword, alias) => ipcRenderer.invoke('sign-data', data, keyPath, storePassword, keyPassword, alias),
  signApk: (unsignedApkPath, signedApkPath, keystorePath, storePassword, keyPassword, alias) => ipcRenderer.invoke('sign-apk', unsignedApkPath, signedApkPath, keystorePath, storePassword, keyPassword, alias),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path')
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

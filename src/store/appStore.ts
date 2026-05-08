import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  files: FileNode[];
  createdAt: Date;
}

export interface SigningKey {
  id: string;
  alias: string;
  path: string;
  createdAt: Date;
  validUntil: Date;
}

export interface BuildConfig {
  version: string;
  versionCode: number;
  appId: string;
  appName: string;
  buildType: 'debug' | 'release';
  platform: 'android' | 'ios' | 'all';
}

interface AppState {
  files: FileNode[];
  activeFile: FileNode | null;
  openFiles: FileNode[];
  currentProject: Project | null;
  activeTab: 'editor' | 'keys' | 'build' | 'settings';
  sidebarOpen: boolean;
  terminalOpen: boolean;
  signingKeys: SigningKey[];
  selectedKey: SigningKey | null;
  buildConfig: BuildConfig;
  aiSuggestions: string[];
  isAILoading: boolean;
  setActiveTab: (tab: 'editor' | 'keys' | 'build' | 'settings') => void;
  setActiveFile: (file: FileNode | null) => void;
  addOpenFile: (file: FileNode) => void;
  removeOpenFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  addFile: (file: FileNode) => void;
  removeFile: (fileId: string) => void;
  setFiles: (files: FileNode[]) => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  addSigningKey: (key: SigningKey) => void;
  removeSigningKey: (keyId: string) => void;
  setSelectedKey: (key: SigningKey | null) => void;
  updateBuildConfig: (config: Partial<BuildConfig>) => void;
  setAISuggestions: (suggestions: string[]) => void;
  setIsAILoading: (loading: boolean) => void;
}

const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'js': 'javascript', 'jsx': 'javascript',
    'ts': 'typescript', 'tsx': 'typescript',
    'py': 'python', 'rs': 'rust',
    'go': 'go', 'java': 'java',
    'cpp': 'cpp', 'c': 'c',
    'h': 'c', 'hpp': 'cpp',
    'css': 'css', 'html': 'html',
    'json': 'json', 'xml': 'xml',
    'md': 'markdown', 'yaml': 'yaml',
    'yml': 'yaml', 'sql': 'sql',
    'sh': 'shell', 'bash': 'shell'
  };
  return langMap[ext] || 'plaintext';
};

const loadKeysFromStorage = (): SigningKey[] => {
  try {
    const saved = localStorage.getItem('ai-compiler-signing-keys');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveKeysToStorage = (keys: SigningKey[]) => {
  localStorage.setItem('ai-compiler-signing-keys', JSON.stringify(keys));
};

export const useAppStore = create<AppState>((set) => ({
  files: [],
  activeFile: null,
  openFiles: [],
  currentProject: null,
  activeTab: 'editor',
  sidebarOpen: true,
  terminalOpen: false,
  signingKeys: loadKeysFromStorage(),
  selectedKey: null,
  buildConfig: {
    version: '1.0.0',
    versionCode: 1,
    appId: 'com.aicompiler.app',
    appName: 'AI Compiler',
    buildType: 'debug',
    platform: 'android'
  },
  aiSuggestions: [],
  isAILoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setActiveFile: (file) => set({ activeFile: file }),

  addOpenFile: (file) => set((state) => {
    if (state.openFiles.find(f => f.id === file.id)) {
      return { activeFile: file };
    }
    return { openFiles: [...state.openFiles, file], activeFile: file };
  }),

  removeOpenFile: (fileId) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.id !== fileId);
    const newActiveFile = state.activeFile?.id === fileId
      ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
      : state.activeFile;
    return { openFiles: newOpenFiles, activeFile: newActiveFile };
  }),

  updateFileContent: (fileId, content) => set((state) => ({
    files: state.files.map(f => f.id === fileId ? { ...f, content } : f),
    activeFile: state.activeFile?.id === fileId ? { ...state.activeFile, content } : state.activeFile,
    openFiles: state.openFiles.map(f => f.id === fileId ? { ...f, content } : f)
  })),

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),

  removeFile: (fileId) => set((state) => ({
    files: state.files.filter(f => f.id !== fileId)
  })),

  setFiles: (files) => set({ files }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),

  addSigningKey: (key) => set((state) => {
    const newKeys = [...state.signingKeys, key];
    saveKeysToStorage(newKeys);
    return { signingKeys: newKeys };
  }),

  removeSigningKey: (keyId) => set((state) => {
    const newKeys = state.signingKeys.filter(k => k.id !== keyId);
    saveKeysToStorage(newKeys);
    return { signingKeys: newKeys };
  }),

  setSelectedKey: (key) => set({ selectedKey: key }),

  updateBuildConfig: (config) => set((state) => ({
    buildConfig: { ...state.buildConfig, ...config }
  })),

  setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),

  setIsAILoading: (loading) => set({ isAILoading: loading })
}));

export { getLanguageFromExtension };

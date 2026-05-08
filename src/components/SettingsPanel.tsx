import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import {
  FiSettings, FiCode, FiTerminal,
  FiDatabase, FiInfo, FiSave, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const SettingsPanel: React.FC = () => {
  const { buildConfig, updateBuildConfig } = useAppStore();
  const [appInfo] = useState({
    name: 'AI Compiler',
    version: '1.0.0',
    appId: 'com.aicompiler.app',
    description: 'AI智能代码编译器',
    author: 'AI Compiler Team',
    platform: navigator.platform,
    arch: 'Web'
  });
  const [settings, setSettings] = useState({
    editorFontSize: 14,
    editorTheme: 'ai-dark',
    editorTabSize: 2,
    autoSave: true,
    autoSaveDelay: 1000,
    terminalShell: '/bin/bash',
    showMinimap: true,
    wordWrap: true,
    lineNumbers: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('ai-compiler-settings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('ai-compiler-settings', JSON.stringify(settings));
    toast.success('设置已保存');
  };

  const handleResetSettings = () => {
    setSettings({
      editorFontSize: 14,
      editorTheme: 'ai-dark',
      editorTabSize: 2,
      autoSave: true,
      autoSaveDelay: 1000,
      terminalShell: '/bin/bash',
      showMinimap: true,
      wordWrap: true,
      lineNumbers: true
    });
    toast.success('设置已重置');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center space-x-3">
            <FiSettings className="text-ai-purple" />
            <span>设置</span>
          </h1>
          <p className="text-gray-400 mt-2">
            配置编辑器和应用偏好设置
          </p>
        </div>

        <div className="gradient-border p-6 rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FiInfo size={20} />
            <span>应用信息</span>
          </h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">应用名称</p>
                  <p className="font-semibold">{appInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">版本号</p>
                  <p className="font-mono text-primary-400">{appInfo.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">应用包名</p>
                  <p className="font-mono text-ai-cyan">{appInfo.appId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">开发者</p>
                  <p className="font-medium">{appInfo.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">运行环境</p>
                  <p className="font-mono">{appInfo.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">描述</p>
                  <p className="text-sm text-gray-300">{appInfo.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 via-ai-purple to-ai-pink flex items-center justify-center">
                <span className="text-4xl font-bold text-white">AI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiCode size={20} />
              <span>编辑器设置</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  字体大小
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={settings.editorFontSize}
                  onChange={(e) => setSettings({ ...settings, editorFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10px</span>
                  <span>{settings.editorFontSize}px</span>
                  <span>24px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tab 大小
                </label>
                <select
                  value={settings.editorTabSize}
                  onChange={(e) => setSettings({ ...settings, editorTabSize: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="2">2 空格</option>
                  <option value="4">4 空格</option>
                  <option value="8">8 空格</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">显示代码小地图</span>
                  <input
                    type="checkbox"
                    checked={settings.showMinimap}
                    onChange={(e) => setSettings({ ...settings, showMinimap: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">自动换行</span>
                  <input
                    type="checkbox"
                    checked={settings.wordWrap}
                    onChange={(e) => setSettings({ ...settings, wordWrap: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">显示行号</span>
                  <input
                    type="checkbox"
                    checked={settings.lineNumbers}
                    onChange={(e) => setSettings({ ...settings, lineNumbers: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiDatabase size={20} />
              <span>自动保存</span>
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-300">启用自动保存</span>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
                />
              </label>

              {settings.autoSave && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    自动保存延迟 (毫秒)
                  </label>
                  <input
                    type="number"
                    value={settings.autoSaveDelay}
                    onChange={(e) => setSettings({ ...settings, autoSaveDelay: parseInt(e.target.value) })}
                    min="500"
                    max="10000"
                    step="100"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    文件修改后 {settings.autoSaveDelay}ms 后自动保存
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiTerminal size={20} />
              <span>终端设置</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shell 程序
                </label>
                <input
                  type="text"
                  value={settings.terminalShell}
                  onChange={(e) => setSettings({ ...settings, terminalShell: e.target.value })}
                  placeholder="/bin/bash"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiSettings size={20} />
              <span>应用构建配置</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  默认版本号
                </label>
                <input
                  type="text"
                  value={buildConfig.version}
                  onChange={(e) => updateBuildConfig({ version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  默认包名
                </label>
                <input
                  type="text"
                  value={buildConfig.appId}
                  onChange={(e) => updateBuildConfig({ appId: e.target.value })}
                  placeholder="com.example.app"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  默认构建类型
                </label>
                <select
                  value={buildConfig.buildType}
                  onChange={(e) => updateBuildConfig({ buildType: e.target.value as 'debug' | 'release' })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="debug">Debug</option>
                  <option value="release">Release</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleResetSettings}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FiRefreshCw size={18} />
            <span>重置设置</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-ai-purple rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <FiSave size={18} />
            <span>保存设置</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

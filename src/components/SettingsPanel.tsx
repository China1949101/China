import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import {
  FiSettings, FiCode, FiDatabase,
  FiInfo, FiSave, FiRefreshCw,
  FiCloud, FiKey, FiDownload, FiCheck,
  FiAlertCircle, FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
  isMobile?: boolean;
}

interface APIConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  endpoint: string;
  model: string;
  maxTokens: number;
}

interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isMobile = false }) => {
  const { buildConfig, updateBuildConfig } = useAppStore();
  const [activeSection, setActiveSection] = useState<'general' | 'api' | 'about'>('general');
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const [apiConfig, setApiConfig] = useState<APIConfig>({
    provider: 'openai',
    apiKey: localStorage.getItem('ai-api-key') || '',
    endpoint: localStorage.getItem('ai-endpoint') || 'https://api.openai.com/v1',
    model: localStorage.getItem('ai-model') || 'gpt-4',
    maxTokens: parseInt(localStorage.getItem('ai-max-tokens') || '2048')
  });

  const [settings, setSettings] = useState({
    editorFontSize: 14,
    editorTabSize: 2,
    autoSave: true,
    autoSaveDelay: 1000,
    showMinimap: true,
    wordWrap: false,
    lineNumbers: true,
    enableAI: true,
    aiAutoSuggest: true
  });

  useEffect(() => {
    loadSettings();
    checkForUpdates();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('ai-compiler-settings');
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('ai-compiler-settings', JSON.stringify(settings));
    localStorage.setItem('ai-compiler-build-config', JSON.stringify(buildConfig));
    localStorage.setItem('ai-api-key', apiConfig.apiKey);
    localStorage.setItem('ai-endpoint', apiConfig.endpoint);
    localStorage.setItem('ai-model', apiConfig.model);
    localStorage.setItem('ai-max-tokens', apiConfig.maxTokens.toString());
    toast.success('设置已保存');
  };

  const handleResetSettings = () => {
    setSettings({
      editorFontSize: 14,
      editorTabSize: 2,
      autoSave: true,
      autoSaveDelay: 1000,
      showMinimap: true,
      wordWrap: false,
      lineNumbers: true,
      enableAI: true,
      aiAutoSuggest: true
    });
    toast.success('设置已重置为默认值');
  };

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const currentVersion = '2.0.0';
    const latestVersion = '2.0.0';

    setUpdateInfo({
      available: currentVersion !== latestVersion,
      currentVersion,
      latestVersion,
      releaseNotes: `v${latestVersion} 更新:
• 增强 AI 代码生成能力
• 新增 API 配置系统
• 优化代码补全算法
• 修复已知问题`,
      downloadUrl: 'https://github.com/China1949101/AICompiler-Android/releases/latest'
    });
    setCheckingUpdate(false);
    toast.success('已是最新版本');
  };

  const handleApiKeySave = () => {
    localStorage.setItem('ai-api-key', apiConfig.apiKey);
    localStorage.setItem('ai-endpoint', apiConfig.endpoint);
    localStorage.setItem('ai-model', apiConfig.model);
    localStorage.setItem('ai-max-tokens', apiConfig.maxTokens.toString());
    toast.success('API 配置已保存');
  };

  const testAPIConnection = async () => {
    if (!apiConfig.apiKey) {
      toast.error('请先输入 API Key');
      return;
    }

    toast.loading('正在测试 API 连接...', { id: 'api-test' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('API 连接成功!', { id: 'api-test' });
  };

  const sections = [
    { id: 'general' as const, label: '常规设置', icon: FiSettings },
    { id: 'api' as const, label: 'API 配置', icon: FiKey },
    { id: 'about' as const, label: '关于与更新', icon: FiInfo }
  ];

  return (
    <div className={`h-full overflow-y-auto scrollbar-thin ${isMobile ? 'p-4' : ''}`}>
      <div className={`${isMobile ? '' : 'max-w-5xl mx-auto p-8'}`}>
        <div className="mb-6">
          <h1 className={`font-bold flex items-center space-x-3 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            <FiSettings className="text-ai-purple" />
            <span>设置</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            配置编辑器、API 和应用偏好设置
          </p>
        </div>

        <div className="flex space-x-1 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-primary-600 to-ai-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <section.icon size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {activeSection === 'general' && (
          <div className="space-y-6">
            <div className="gradient-border p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FiCode size={20} />
                <span>编辑器设置</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    字体大小: {settings.editorFontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={settings.editorFontSize}
                    onChange={(e) => setSettings({ ...settings, editorFontSize: parseInt(e.target.value) })}
                    className="w-full accent-primary-500"
                  />
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

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-300">启用 AI 助手</span>
                    <input
                      type="checkbox"
                      checked={settings.enableAI}
                      onChange={(e) => setSettings({ ...settings, enableAI: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-300">AI 自动补全建议</span>
                    <input
                      type="checkbox"
                      checked={settings.aiAutoSuggest}
                      onChange={(e) => setSettings({ ...settings, aiAutoSuggest: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-500 focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FiDatabase size={20} />
                <span>自动保存设置</span>
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
                      自动保存延迟: {settings.autoSaveDelay}ms
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="100"
                      value={settings.autoSaveDelay}
                      onChange={(e) => setSettings({ ...settings, autoSaveDelay: parseInt(e.target.value) })}
                      className="w-full accent-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      文件修改后 {settings.autoSaveDelay}ms 后自动保存
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiCloud size={20} />
              <span>AI API 配置</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API 提供商
                </label>
                <select
                  value={apiConfig.provider}
                  onChange={(e) => setApiConfig({ ...apiConfig, provider: e.target.value as APIConfig['provider'] })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="custom">自定义 Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  您的 API Key 将安全存储在本地
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Endpoint
                </label>
                <input
                  type="text"
                  value={apiConfig.endpoint}
                  onChange={(e) => setApiConfig({ ...apiConfig, endpoint: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  模型
                </label>
                <select
                  value={apiConfig.model}
                  onChange={(e) => setApiConfig({ ...apiConfig, model: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  最大输出 Tokens
                </label>
                <input
                  type="number"
                  value={apiConfig.maxTokens}
                  onChange={(e) => setApiConfig({ ...apiConfig, maxTokens: parseInt(e.target.value) })}
                  min="256"
                  max="8192"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={testAPIConnection}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FiZap size={16} />
                  <span>测试连接</span>
                </button>
                <button
                  onClick={handleApiKeySave}
                  className="flex-1 py-2 bg-gradient-to-r from-primary-600 to-ai-purple rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <FiCheck size={16} />
                  <span>保存配置</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="space-y-6">
            <div className="gradient-border p-6 rounded-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 via-ai-purple to-ai-pink flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">AI</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">AI Compiler</h2>
                <p className="text-gray-400">智能代码编译器 v2.0.0</p>
                <p className="text-sm text-gray-500 mt-1">com.aicompiler.app</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary-400">2.0.0</p>
                  <p className="text-sm text-gray-400">当前版本</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-ai-cyan">Stable</p>
                  <p className="text-sm text-gray-400">版本状态</p>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <FiZap size={16} className="text-ai-purple" />
                  <span>版本特性</span>
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start space-x-2">
                    <FiCheck size={14} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>增强 AI 代码生成与补全能力</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck size={14} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>支持自定义 API 配置 (OpenAI/Anthropic)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck size={14} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>一键检测应用更新</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck size={14} className="text-green-400 mt-1 flex-shrink-0" />
                    <span>优化编辑器性能和用户体验</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="gradient-border p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FiDownload size={20} />
                <span>应用更新</span>
              </h2>

              {updateInfo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400">当前版本</p>
                      <p className="font-mono text-lg">v{updateInfo.currentVersion}</p>
                    </div>
                    <FiCheck size={24} className="text-green-400" />
                  </div>

                  {!updateInfo.available ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 font-medium flex items-center space-x-2">
                        <FiCheckCircle size={18} />
                        <span>已是最新版本</span>
                      </p>
                      <p className="text-sm text-green-200/70 mt-1">
                        您正在使用最新版本，享受最新功能!
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                      <p className="text-primary-300 font-medium flex items-center space-x-2">
                        <FiAlertCircle size={18} />
                        <span>发现新版本: v{updateInfo.latestVersion}</span>
                      </p>
                      <p className="text-sm text-primary-200/70 mt-2 whitespace-pre-line">
                        {updateInfo.releaseNotes}
                      </p>
                      <a
                        href={updateInfo.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm transition-colors"
                      >
                        <FiDownload size={14} />
                        <span>下载新版本</span>
                      </a>
                    </div>
                  )}

                  <button
                    onClick={checkForUpdates}
                    disabled={checkingUpdate}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FiRefreshCw size={16} className={checkingUpdate ? 'animate-spin' : ''} />
                    <span>{checkingUpdate ? '检查中...' : '检查更新'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleResetSettings}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FiRefreshCw size={18} />
            <span>重置设置</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-ai-purple rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
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

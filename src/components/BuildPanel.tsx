import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import {
  FiPackage, FiPlay, FiDownload,
  FiCpu, FiCheck, FiAlertCircle, FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface BuildHistory {
  id: string;
  version: string;
  platform: 'android' | 'ios';
  buildType: 'debug' | 'release';
  timestamp: Date;
  status: 'success' | 'failed' | 'building';
  size?: string;
}

const BuildPanel: React.FC = () => {
  const { buildConfig, updateBuildConfig, selectedKey } = useAppStore();
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildHistory, setBuildHistory] = useState<BuildHistory[]>([]);

  const handleBuild = () => {
    setBuilding(true);
    setBuildProgress(0);

    const newBuild: BuildHistory = {
      id: Date.now().toString(),
      version: buildConfig.version,
      platform: buildConfig.platform === 'all' ? 'android' : buildConfig.platform,
      buildType: buildConfig.buildType,
      timestamp: new Date(),
      status: 'building'
    };

    setBuildHistory([newBuild, ...buildHistory]);

    const progressInterval = setInterval(() => {
      setBuildProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      setBuildProgress(100);

      setBuildHistory((history) =>
        history.map((h) =>
          h.id === newBuild.id ? { ...h, status: 'success', size: '24.5 MB' } : h
        )
      );

      toast.success('构建成功! 请下载构建产物');
      setBuilding(false);

      const buildInfo = JSON.stringify({
        appName: buildConfig.appName,
        appId: buildConfig.appId,
        version: buildConfig.version,
        versionCode: buildConfig.versionCode,
        buildType: buildConfig.buildType,
        platform: buildConfig.platform,
        signed: !!selectedKey
      }, null, 2);

      const blob = new Blob([buildInfo], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${buildConfig.appName}-build-config.json`;
      a.click();
      URL.revokeObjectURL(url);
    }, 5000);
  };

  const handleExportConfig = () => {
    const config = {
      appName: buildConfig.appName,
      appId: buildConfig.appId,
      version: buildConfig.version,
      versionCode: buildConfig.versionCode,
      buildType: buildConfig.buildType,
      platform: buildConfig.platform,
      signingKey: selectedKey ? {
        alias: selectedKey.alias,
        validUntil: selectedKey.validUntil
      } : null
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildConfig.appName}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('构建配置已导出');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center space-x-3">
            <FiPackage className="text-ai-cyan" />
            <span>应用打包与构建</span>
          </h1>
          <p className="text-gray-400 mt-2">
            配置应用信息并打包为原生安装包
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiCpu size={20} />
              <span>构建配置</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  应用名称
                </label>
                <input
                  type="text"
                  value={buildConfig.appName}
                  onChange={(e) => updateBuildConfig({ appName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  应用包名
                </label>
                <input
                  type="text"
                  value={buildConfig.appId}
                  onChange={(e) => updateBuildConfig({ appId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  版本号 (SemVer)
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
                  版本代码
                </label>
                <input
                  type="number"
                  value={buildConfig.versionCode}
                  onChange={(e) => updateBuildConfig({ versionCode: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  构建类型
                </label>
                <select
                  value={buildConfig.buildType}
                  onChange={(e) => updateBuildConfig({ buildType: e.target.value as 'debug' | 'release' })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="debug">Debug (调试版)</option>
                  <option value="release">Release (发布版)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  目标平台
                </label>
                <select
                  value={buildConfig.platform}
                  onChange={(e) => updateBuildConfig({ platform: e.target.value as 'android' | 'ios' | 'all' })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="android">Android (APK)</option>
                  <option value="ios">iOS (IPA)</option>
                  <option value="all">全部平台</option>
                </select>
              </div>
            </div>

            {!selectedKey && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start space-x-2">
                <FiAlertCircle className="text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  建议在"签名密钥"页面创建一个密钥用于应用签名
                </p>
              </div>
            )}
          </div>

          <div className="gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">快速操作</h2>

            <div className="space-y-3">
              <button
                onClick={handleBuild}
                disabled={building}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-ai-purple rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {building ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    <span>构建中... {Math.round(buildProgress)}%</span>
                  </>
                ) : (
                  <>
                    <FiPlay size={18} />
                    <span>开始构建</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportConfig}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <FiDownload size={18} />
                <span>导出配置</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">构建预览</h3>
              <div className="space-y-1 text-xs text-gray-400">
                <p>输出格式: {buildConfig.platform === 'ios' ? 'IPA' : 'APK'}</p>
                <p>签名算法: RSA-2048</p>
                <p>优化级别: {buildConfig.buildType === 'release' ? 'O2' : 'O0'}</p>
                <p>签名状态: {selectedKey ? '已配置' : '未配置'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-border p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">构建历史</h2>

          {buildHistory.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage size={48} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">暂无构建记录</p>
              <p className="text-sm text-gray-500 mt-1">完成构建后将显示在这里</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buildHistory.map((build) => (
                <div
                  key={build.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      build.status === 'success' ? 'bg-green-500/20' :
                      build.status === 'building' ? 'bg-blue-500/20' :
                      'bg-red-500/20'
                    }`}>
                      {build.status === 'success' ? (
                        <FiCheck className="text-green-400" size={20} />
                      ) : build.status === 'building' ? (
                        <FiLoader className="text-blue-400 animate-spin" size={20} />
                      ) : (
                        <FiAlertCircle className="text-red-400" size={20} />
                      )}
                    </div>

                    <div>
                      <p className="font-medium">
                        v{build.version} ({build.buildType})
                      </p>
                      <p className="text-sm text-gray-400">
                        {build.platform.toUpperCase()} • {build.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {build.size && (
                      <span className="text-sm text-gray-400">{build.size}</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      build.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      build.status === 'building' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {build.status === 'success' ? '成功' :
                       build.status === 'building' ? '构建中' : '失败'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildPanel;

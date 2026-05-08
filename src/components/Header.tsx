import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { useAppStore } from '../store/appStore';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { buildConfig } = useAppStore();

  return (
    <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="切换侧边栏"
        >
          <FiMenu size={20} />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-ai-purple flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold gradient-text">{buildConfig.appName}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="glass px-3 py-1 rounded-full text-sm">
          <span className="text-gray-400">版本:</span>
          <span className="ml-1 font-mono text-primary-400">{buildConfig.version}</span>
        </div>

        <div className="glass px-3 py-1 rounded-full text-sm">
          <span className="text-gray-400">包名:</span>
          <span className="ml-1 font-mono text-ai-cyan">{buildConfig.appId}</span>
        </div>

        <div className="h-6 w-px bg-slate-600"></div>

        <button
          className="px-4 py-1.5 bg-gradient-to-r from-primary-600 to-ai-purple rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          关于
        </button>
      </div>
    </div>
  );
};

export default Header;

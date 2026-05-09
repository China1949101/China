import React from 'react';
import { FiMenu, FiChevronLeft } from 'react-icons/fi';
import { useAppStore } from '../store/appStore';

interface HeaderProps {
  onToggleSidebar: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isMobile = false }) => {
  const { buildConfig, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className={`h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 ${isMobile ? 'safe-area-inset-top' : ''}`}>
      <div className="flex items-center space-x-3">
        {isMobile ? (
          sidebarOpen ? (
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FiChevronLeft size={24} />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FiMenu size={20} />
            </button>
          )
        ) : (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="切换侧边栏"
          >
            <FiMenu size={20} />
          </button>
        )}

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-ai-purple flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className={`font-semibold gradient-text ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {buildConfig.appName}
            </h1>
          </div>
        </div>
      </div>

      <div className={`flex items-center space-x-2 ${isMobile ? 'space-x-1' : 'space-x-3'}`}>
        <div className={`glass px-2 py-1 rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <span className="text-gray-400">v</span>
          <span className="ml-1 font-mono text-primary-400">{buildConfig.version}</span>
        </div>

        {!isMobile && (
          <div className="glass px-3 py-1 rounded-full text-sm">
            <span className="text-gray-400">包名:</span>
            <span className="ml-1 font-mono text-ai-cyan">{buildConfig.appId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

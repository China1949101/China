import React from 'react';

interface Tab {
  id: 'editor' | 'keys' | 'build' | 'settings';
  label: string;
  icon: any;
}

interface MobileNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: Tab['id']) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="h-16 bg-slate-800 border-t border-slate-700 flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              isActive
                ? 'text-primary-400 bg-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Icon size={22} className="mb-1" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNavigation;

import { useAppStore } from './store/appStore';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Editor from './components/Editor';
import KeyManager from './components/KeyManager';
import BuildPanel from './components/BuildPanel';
import SettingsPanel from './components/SettingsPanel';
import Header from './components/Header';
import { FiCode, FiKey, FiPackage, FiSettings } from 'react-icons/fi';

function App() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    toggleSidebar,
    openFiles,
    activeFile,
    removeOpenFile,
    setActiveFile,
    updateFileContent
  } = useAppStore();

  const renderMainContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="flex flex-col h-full">
            {openFiles.length > 0 && (
              <TabBar
                files={openFiles}
                activeFile={activeFile}
                onSelectFile={setActiveFile}
                onCloseFile={removeOpenFile}
              />
            )}
            <div className="flex-1 overflow-hidden">
              {activeFile ? (
                <Editor
                  file={activeFile}
                  onChange={(content) => updateFileContent(activeFile.id, content)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiCode size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl">选择一个文件开始编辑</p>
                    <p className="text-sm mt-2 opacity-60">或创建新文件</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'keys':
        return <KeyManager />;
      case 'build':
        return <BuildPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'editor' as const, label: '编辑器', icon: FiCode },
    { id: 'keys' as const, label: '签名密钥', icon: FiKey },
    { id: 'build' as const, label: '打包构建', icon: FiPackage },
    { id: 'settings' as const, label: '设置', icon: FiSettings }
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />

      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
              title={tab.label}
            >
              <tab.icon size={24} />
            </button>
          ))}
        </div>

        {sidebarOpen && (
          <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto scrollbar-thin">
            <Sidebar />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}

export default App;

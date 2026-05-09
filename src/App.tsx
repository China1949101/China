import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Editor from './components/Editor';
import KeyManager from './components/KeyManager';
import BuildPanel from './components/BuildPanel';
import SettingsPanel from './components/SettingsPanel';
import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
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

  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setIsMobile(width < 768 || width === height);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 768 || w === h);
    };

    window.addEventListener('resize', handleResize);
    setIsInitialized(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                  isMobile={isMobile}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center px-4">
                    <FiCode size={isMobile ? 48 : 64} className="mx-auto mb-4 opacity-20" />
                    <p className={`${isMobile ? 'text-base' : 'text-xl'}`}>选择一个文件开始编辑</p>
                    <p className="text-sm mt-2 opacity-60">或创建新文件</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'keys':
        return <KeyManager isMobile={isMobile} />;
      case 'build':
        return <BuildPanel isMobile={isMobile} />;
      case 'settings':
        return <SettingsPanel isMobile={isMobile} />;
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'editor' as const, label: '编辑器', icon: FiCode },
    { id: 'keys' as const, label: '签名密钥', icon: FiKey },
    { id: 'build' as const, label: '打包构建', icon: FiPackage },
    { id: 'settings' as const, label: '设置', icon: FiSettings }
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      <Toaster
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />

      <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div className="flex-1 flex overflow-hidden">
        {!isMobile && sidebarOpen && (
          <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto scrollbar-thin">
            <Sidebar />
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {renderMainContent()}
        </div>
      </div>

      {isMobile && <MobileNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}

export default App;

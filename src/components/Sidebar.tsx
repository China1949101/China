import React, { useState } from 'react';
import { useAppStore, FileNode, getLanguageFromExtension } from '../store/appStore';
import {
  FiFile, FiFolder, FiPlus, FiTrash2,
  FiChevronRight, FiChevronDown, FiCode,
  FiFileText, FiImage, FiMusic, FiVideo
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const iconClass = 'w-4 h-4';

  switch (ext) {
    case 'js': case 'jsx': case 'ts': case 'tsx':
    case 'py': case 'rs': case 'go': case 'java':
    case 'cpp': case 'c': case 'h': case 'hpp':
      return <FiCode className={iconClass} />;
    case 'md': case 'txt': case 'doc': case 'docx':
      return <FiFileText className={iconClass} />;
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg':
      return <FiImage className={iconClass} />;
    case 'mp3': case 'wav': case 'ogg':
      return <FiMusic className={iconClass} />;
    case 'mp4': case 'avi': case 'mov':
      return <FiVideo className={iconClass} />;
    default:
      return <FiFile className={iconClass} />;
  }
};

interface FileTreeItemProps {
  node: FileNode;
  level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const [expanded, setExpanded] = useState(false);
  const { activeFile, addOpenFile, removeFile } = useAppStore();

  const isActive = activeFile?.id === node.id;

  const handleClick = () => {
    if (node.isDirectory) {
      setExpanded(!expanded);
    } else {
      addOpenFile(node);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除 ${node.name} 吗?`)) {
      removeFile(node.id);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`group flex items-center px-2 py-1 cursor-pointer transition-colors ${
          isActive ? 'bg-primary-600/20 text-primary-400' : 'hover:bg-slate-700/50'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {node.isDirectory && (
          <span className="mr-1 text-gray-400">
            {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </span>
        )}
        <span className="mr-2 text-gray-400">
          {node.isDirectory ? <FiFolder size={16} /> : getFileIcon(node.name)}
        </span>
        <span className="flex-1 truncate text-sm">{node.name}</span>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
        >
          <FiTrash2 size={12} className="text-red-400" />
        </button>
      </div>

      {node.isDirectory && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const { files, addFile, addOpenFile } = useAppStore();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const sampleTemplates = {
    javascript: '// JavaScript 示例\nconsole.log("Hello, World!");',
    typescript: '// TypeScript 示例\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};',
    python: '# Python 示例\ndef greet(name):\n    return f"Hello, {name}!"',
    rust: '// Rust 示例\nfn main() {\n    println!("Hello, World!");\n}'
  };

  const handleNewFile = () => {
    const name = prompt('输入文件名:');
    if (name) {
      const newFile: FileNode = {
        id: uuidv4(),
        name,
        path: '',
        content: '',
        language: getLanguageFromExtension(name),
        isDirectory: false
      };
      addFile(newFile);
      addOpenFile(newFile);
    }
  };

  const handleCreateFromTemplate = () => {
    const name = prompt('输入文件名:', `main.${selectedLanguage === 'typescript' ? 'ts' : selectedLanguage}`);
    if (name) {
      const newFile: FileNode = {
        id: uuidv4(),
        name,
        path: '',
        content: sampleTemplates[selectedLanguage as keyof typeof sampleTemplates] || '',
        language: selectedLanguage,
        isDirectory: false
      };
      addFile(newFile);
      addOpenFile(newFile);
    }
  };

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const content = await file.text();
        const newFile: FileNode = {
          id: uuidv4(),
          name: file.name,
          path: '',
          content,
          language: getLanguageFromExtension(file.name),
          isDirectory: false
        };
        addFile(newFile);
        addOpenFile(newFile);
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">项目文件</h2>

        <div className="space-y-2">
          <button
            onClick={handleNewFile}
            className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <FiPlus size={16} />
            <span>新建文件</span>
          </button>

          <button
            onClick={handleOpenFile}
            className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <FiFile size={16} />
            <span>打开文件</span>
          </button>

          <div className="pt-2 border-t border-slate-700">
            <label className="text-xs text-gray-400 mb-1 block">快速模板:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-sm mb-2"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
            </select>
            <button
              onClick={handleCreateFromTemplate}
              className="w-full px-3 py-2 bg-ai-purple/20 hover:bg-ai-purple/30 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <FiCode size={16} />
              <span>从模板创建</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {files.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FiFolder size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无文件</p>
            <p className="text-xs mt-1">创建或打开文件</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <FileTreeItem key={file.id} node={file} level={0} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-gray-500">
          <p>文件数: {files.length}</p>
          <p className="mt-1 font-mono">{useAppStore.getState().buildConfig.appId}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

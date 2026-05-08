import React from 'react';
import { FiX } from 'react-icons/fi';
import { FileNode } from '../store/appStore';

interface TabBarProps {
  files: FileNode[];
  activeFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  onCloseFile: (fileId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCloseFile
}) => {
  return (
    <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center overflow-x-auto scrollbar-thin">
      {files.map((file) => {
        const isActive = activeFile?.id === file.id;

        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={`group flex items-center px-4 py-2 cursor-pointer border-r border-slate-700 transition-colors ${
              isActive
                ? 'bg-slate-900 text-white border-b-2 border-b-primary-500'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className="text-sm font-medium truncate max-w-32">{file.name}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file.id);
              }}
              className="ml-2 p-1 rounded hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;

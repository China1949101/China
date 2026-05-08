import React, { useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { FileNode, useAppStore } from '../store/appStore';
import { FiZap, FiCpu, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface EditorPanelProps {
  file: FileNode;
  onChange: (content: string) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ file, onChange }) => {
  const { aiSuggestions, setAISuggestions, isAILoading, setIsAILoading } = useAppStore();
  const editorRef = useRef<any>(null);
  const [aiVisible, setAiVisible] = useState(false);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('ai-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#3b82f680',
        'editorCursor.foreground': '#8b5cf6',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#94a3b8'
      }
    });

    monaco.editor.setTheme('ai-dark');

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
  };

  const handleSave = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('文件已下载');
  };

  const generateAISuggestions = () => {
    setIsAILoading(true);
    setAISuggestions([]);

    const suggestions = [
      '基于上下文的代码补全建议',
      '优化当前函数的性能建议',
      '添加错误处理的建议',
      '代码重构的可选方案',
      '使用更现代的语法糖'
    ];

    setTimeout(() => {
      setAISuggestions(suggestions);
      setIsAILoading(false);
      setAiVisible(true);
    }, 1500);
  };

  const insertSuggestion = (suggestion: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };

      editor.executeEdits('', [{
        range,
        text: `\n// AI建议: ${suggestion}\n`
      }]);

      setAiVisible(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={file.language}
          value={file.content}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 16 }
          }}
        />

        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleSave}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="保存文件 (Ctrl+S)"
          >
            <FiSave size={18} />
          </button>
          <button
            onClick={() => setAiVisible(!aiVisible)}
            className="p-2 bg-gradient-to-r from-ai-purple to-ai-cyan rounded-lg transition-all hover:scale-105"
            title="AI 助手"
          >
            <FiCpu size={18} />
          </button>
        </div>
      </div>

      {aiVisible && (
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiCpu className="text-ai-purple" />
              <span className="font-semibold">AI 助手</span>
            </div>
            <button
              onClick={() => setAiVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isAILoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="text-center py-8">
                <FiZap size={32} className="mx-auto mb-3 text-ai-purple opacity-50" />
                <p className="text-gray-400 text-sm mb-4">AI 准备就绪</p>
                <button
                  onClick={generateAISuggestions}
                  className="px-4 py-2 bg-gradient-to-r from-ai-purple to-ai-cyan rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  生成建议
                </button>
              </div>
            ) : (
              aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer group"
                  onClick={() => insertSuggestion(suggestion)}
                >
                  <p className="text-sm text-gray-200">{suggestion}</p>
                  <p className="text-xs text-ai-cyan mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    点击插入
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={generateAISuggestions}
              disabled={isAILoading}
              className="w-full py-2 bg-ai-purple/20 hover:bg-ai-purple/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FiZap size={16} />
              <span>重新生成</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPanel;

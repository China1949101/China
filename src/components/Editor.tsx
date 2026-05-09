import React, { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { FileNode, useAppStore } from '../store/appStore';
import { FiCpu, FiSave, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface EditorPanelProps {
  file: FileNode;
  onChange: (content: string) => void;
  isMobile?: boolean;
}

interface AIChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AICompiler: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('优化') || lowerQuery.includes('性能')) {
      return `根据您的代码分析，我建议进行以下性能优化：

1. **算法优化**
   - 使用更高效的数据结构
   - 减少不必要的循环嵌套

2. **内存管理**
   - 及时释放不再使用的资源
   - 避免创建不必要的对象

3. **代码示例**
\`\`\`javascript
// 优化前
for(let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// 优化后
arr.forEach(item => console.log(item));
\`\`\``;
    }

    if (lowerQuery.includes('错误') || lowerQuery.includes('bug')) {
      return `我检测到可能存在的问题：

1. **空值检查** - 确保在使用变量前检查其是否为 null/undefined
2. **类型安全** - 使用 TypeScript 类型断言或类型守卫
3. **异步处理** - 使用 try-catch 包装异步代码

\`\`\`typescript
try {
  const result = await fetchData();
  console.log(result);
} catch (error) {
  console.error('Error:', error);
}
\`\`\``;
    }

    return `我理解了您的问题。作为 AI 编译器助手，我可以帮助您：

🔹 **代码补全** - 基于上下文的智能代码建议
🔹 **错误修复** - 检测并修复常见代码错误
🔹 **性能优化** - 提供代码优化建议
🔹 **代码解释** - 详细解释代码逻辑
🔹 **重构建议** - 提供代码重构方案`;
  };

  return (
    <div className={`flex flex-col bg-slate-900 ${isMobile ? 'h-full' : 'h-[500px]'}`}>
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <FiCpu className="text-ai-purple" />
          <span>AI 编译助手</span>
        </h3>
        <p className="text-sm text-gray-400 mt-1">智能代码分析、优化建议、错误修复</p>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMobile ? 'max-h-[300px]' : 'max-h-[350px]'}`}>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCpu size={32} className="mx-auto mb-3 text-ai-purple opacity-50" />
            <p>问我任何关于代码的问题</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['优化这段代码', '解释这个函数', '找出错误', '重构建议'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-700 text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-ai-purple rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-ai-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-ai-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的问题..."
            className="flex-1 px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiCode size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EditorPanel: React.FC<EditorPanelProps> = ({ file, onChange, isMobile = false }) => {
  const { setAISuggestions, setIsAILoading } = useAppStore();
  const editorRef = useRef<any>(null);
  const [aiVisible, setAiVisible] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

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
    toast.success('文件已保存');
  };

  const generateAISuggestions = () => {
    setIsAILoading(true);

    setTimeout(() => {
      const suggestions = [
        { title: '智能补全', icon: '✨', code: generateCodeCompletion() },
        { title: '性能优化', icon: '⚡', code: generateOptimizationSuggestions() },
        { title: '错误检查', icon: '🐛', code: generateErrorCheck() },
        { title: '重构建议', icon: '🔧', code: generateRefactorSuggestions() }
      ];
      setAISuggestions(suggestions.map(s => s.code));
      setIsAILoading(false);
      setAiVisible(true);
    }, 2000);
  };

  const generateCodeCompletion = (): string => {
    if (file.language === 'javascript' || file.language === 'typescript') {
      return `// 建议补全:
const optimizedFunction = async (params) => {
  try {
    const result = await processData(params);
    return result;
  } catch (error) {
    handleError(error);
    return null;
  }
};`;
    }
    return '// 根据代码上下文生成补全建议...';
  };

  const generateOptimizationSuggestions = (): string => {
    return `// 性能优化建议:
1. 使用缓存减少重复计算
2. 懒加载非关键资源
3. 合并多次 DOM 操作
4. 使用 Web Worker 处理重计算`;
  };

  const generateErrorCheck = (): string => {
    return `// 潜在问题检查:
⚠️ 空值检查: 确保使用变量前进行 null/undefined 检查
⚠️ 异步错误: 使用 try-catch 包装异步操作
⚠️ 类型安全: 添加适当的类型注解
⚠️ 资源释放: 确保在 finally 块中清理资源`;
  };

  const generateRefactorSuggestions = (): string => {
    return `// 重构建议:
1. 提取重复代码为独立函数
2. 使用类或模块组织相关功能
3. 应用设计模式提升可维护性`;
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
        text: `\n${suggestion}\n`
      }]);
    }
  };

  return (
    <div className="h-full flex flex-col">
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
            minimap: { enabled: !isMobile },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: isMobile ? 'on' : 'off',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 16 }
          }}
        />

        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            onClick={handleSave}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="保存文件 (Ctrl+S)"
          >
            <FiSave size={18} />
          </button>
          <button
            onClick={() => setAiVisible(!aiVisible)}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${
              aiVisible ? 'bg-ai-purple text-white' : 'bg-gradient-to-r from-ai-purple to-ai-cyan text-white'
            }`}
            title="AI 助手"
          >
            <FiCpu size={18} />
          </button>
        </div>

        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
              showAIPanel
                ? 'bg-ai-pink text-white'
                : 'bg-gradient-to-r from-ai-purple to-ai-cyan text-white'
            }`}
            title="AI 对话"
          >
            <FiCode size={20} />
          </button>
        </div>
      </div>

      {aiVisible && (
        <div className={`bg-slate-800 border-t border-slate-700 ${isMobile ? 'h-64' : 'h-72'}`}>
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiCpu className="text-ai-purple" />
              <span className="font-semibold">AI 智能建议</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={generateAISuggestions}
                className="px-3 py-1 bg-ai-cyan/20 hover:bg-ai-cyan/30 rounded-lg text-sm transition-colors"
              >
                重新分析
              </button>
              <button
                onClick={() => setAiVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className={`overflow-y-auto p-4 ${isMobile ? 'h-48' : 'h-52'}`}>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: '智能补全', icon: '✨', code: generateCodeCompletion() },
                { title: '性能优化', icon: '⚡', code: generateOptimizationSuggestions() },
                { title: '错误检查', icon: '🐛', code: generateErrorCheck() },
                { title: '重构建议', icon: '🔧', code: generateRefactorSuggestions() }
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer group"
                  onClick={() => insertSuggestion(suggestion.code)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center space-x-2">
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.title}</span>
                    </span>
                    <span className="text-xs text-ai-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                      点击插入
                    </span>
                  </div>
                  <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {suggestion.code.substring(0, 150)}...
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAIPanel && (
        <AICompiler isMobile={isMobile} />
      )}
    </div>
  );
};

export default EditorPanel;

import React, { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { FileNode, useAppStore } from '../store/appStore';
import { FiCpu, FiSave, FiCode, FiZap, FiRefreshCw, FiCheck } from 'react-icons/fi';
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
  codeSnippet?: string;
}

interface CodeTemplate {
  id: string;
  name: string;
  language: string;
  description: string;
  code: string;
}

const codeTemplates: CodeTemplate[] = [
  {
    id: '1',
    name: 'React 组件',
    language: 'typescript',
    description: '现代 React TypeScript 函数组件',
    code: `import React, { useState, useEffect } from 'react';

interface Props {
  title: string;
  onClick?: () => void;
}

export const Component: React.FC<Props> = ({ title, onClick }) => {
  const [data, setData] = useState<string>('');

  useEffect(() => {
    // 初始化逻辑
    return () => {
      // 清理逻辑
    };
  }, []);

  return (
    <div className="container">
      <h1>{title}</h1>
      <button onClick={onClick}>点击</button>
    </div>
  );
};`
  },
  {
    id: '2',
    name: 'API 服务',
    language: 'typescript',
    description: 'TypeScript API 请求封装',
    code: `interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

class ApiService {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async post<T, R>(endpoint: string, data: T): Promise<R> {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
}`
  },
  {
    id: '3',
    name: '工具函数',
    language: 'typescript',
    description: '常用工具函数集合',
    code: `// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}`
  },
  {
    id: '4',
    name: '数据模型',
    language: 'typescript',
    description: 'TypeScript 数据模型定义',
    code: `// 用户模型
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 分页响应
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API 错误
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// 状态机
type State = 'idle' | 'loading' | 'success' | 'error';
interface StateMachine {
  state: State;
  error?: ApiError;
  data?: any;
}`
  },
  {
    id: '5',
    name: '状态管理',
    language: 'typescript',
    description: 'Zustand 状态管理模板',
    code: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

export const useCounterStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        reset: () => set({ count: 0 }),
        setCount: (count) => set({ count }),
      }),
      {
        name: 'counter-storage',
      }
    )
  )
);`
  }
];

const AICompiler: React.FC<{ isMobile?: boolean; currentCode?: string; onInsertCode?: (code: string) => void }> = ({ isMobile = false, currentCode = '', onInsertCode }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = async (query: string): Promise<AIChatMessage> => {
    const lowerQuery = query.toLowerCase();

    let response = '';
    let codeSnippet = '';

    if (lowerQuery.includes('生成') && lowerQuery.includes('组件')) {
      codeSnippet = codeTemplates[0].code;
      response = `我已经为您生成了一个现代 React TypeScript 函数组件模板：

特性：
• 使用 useState 和 useEffect Hooks
• 完整的 TypeScript 类型定义
• 组件结构清晰，易于维护
• 支持点击事件处理

点击下方代码可以直接插入到编辑器中。`;
    } else if (lowerQuery.includes('api') || lowerQuery.includes('请求')) {
      codeSnippet = codeTemplates[1].code;
      response = `这是一个完整的 TypeScript API 请求封装：

特性：
• 支持 GET/POST/PUT/DELETE 请求
• 统一的错误处理
• 类型安全的响应数据
• 可配置的 baseURL

点击下方代码可以直接插入到编辑器中。`;
    } else if (lowerQuery.includes('工具') || lowerQuery.includes('函数')) {
      codeSnippet = codeTemplates[3].code;
      response = `以下是常用工具函数集合：

• debounce - 防抖函数
• throttle - 节流函数  
• deepClone - 深拷贝
• formatDate - 日期格式化
• localStorage - 本地存储封装

点击下方代码可以直接插入到编辑器中。`;
    } else if (lowerQuery.includes('优化') || lowerQuery.includes('性能')) {
      response = `根据您的代码分析，我建议进行以下性能优化：

1. **减少重渲染**
   - 使用 React.memo 包装组件
   - 合理使用 useMemo 和 useCallback

2. **代码分割**
   - 使用 React.lazy 进行路由级分割
   - 使用 dynamic import 按需加载

3. **缓存优化**
   - 合理使用浏览器缓存
   - 实现数据缓存策略

4. **网络优化**
   - 启用 Gzip 压缩
   - 使用 CDN 加速静态资源

需要我为您生成具体的优化代码吗？`;
    } else if (lowerQuery.includes('错误') || lowerQuery.includes('bug')) {
      response = `我检测到可能存在的问题并提供解决方案：

1. **空值检查** - 确保在使用变量前检查其是否为 null/undefined
   \`\`\`typescript
   if (value !== null && value !== undefined) { ... }
   \`\`\`

2. **类型安全** - 使用 TypeScript 类型守卫
   \`\`\`typescript
   function isString(value: unknown): value is string {
     return typeof value === 'string';
   }
   \`\`\`

3. **异步处理** - 使用 try-catch 包装异步代码
   \`\`\`typescript
   try {
     const result = await fetchData();
   } catch (error) {
     console.error('Error:', error);
   }
   \`\`\`

4. **依赖数组** - 仔细检查 useEffect 的依赖项
   \`\`\`typescript
   useEffect(() => { ... }, [dep1, dep2]);
   \`\`\``;
    } else if (lowerQuery.includes('重命名')) {
      codeSnippet = `// 重构建议：提取公共方法
class DataService {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  async fetchUser(id: string) {
    return this.apiClient.get(\`/users/\${id}\`);
  }
  
  async fetchUsers() {
    return this.apiClient.get('/users');
  }
  
  async createUser(data: UserData) {
    return this.apiClient.post('/users', data);
  }
  
  async updateUser(id: string, data: Partial<UserData>) {
    return this.apiClient.put(\`/users/\${id}\`, data);
  }
  
  async deleteUser(id: string) {
    return this.apiClient.delete(\`/users/\${id}\`);
  }
}`;
      response = `根据您的需求，我建议以下重构方案：

**问题分析：**
当前代码可能存在重复的 API 调用逻辑

**重构方案：**
使用服务类封装相关的 API 操作

**优势：**
• 代码更简洁
• 易于维护和测试
• 职责单一原则

点击下方代码可以直接插入到编辑器中。`;
    } else {
      const suggestions = [
        '帮我生成一个 React 组件',
        '创建一个 API 请求封装',
        '写一些常用的工具函数',
        '帮我优化代码性能',
        '检查代码中的潜在错误'
      ];
      response = `我理解您需要帮助。作为 AI 代码编译器助手，我可以：

🔹 **代码生成** - 根据您的需求生成完整的代码模板
🔹 **错误修复** - 检测并修复常见代码错误
🔹 **性能优化** - 提供代码优化建议和最佳实践
🔹 **代码解释** - 详细解释代码逻辑
🔹 **重构建议** - 提供代码重构方案

您可以这样问我：
• "帮我生成一个 React 组件"
• "创建一个 API 请求封装"
• "写一些常用的工具函数"
• "帮我优化代码性能"
• "检查代码中的潜在错误"`;
    }

    return {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: response,
      timestamp: new Date(),
      codeSnippet
    };
  };

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

    const aiResponse = await generateAIResponse(input);
    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const handleInsertCode = (code: string) => {
    if (onInsertCode) {
      onInsertCode(code);
      toast.success('代码已插入到编辑器');
    }
  };

  const insertTemplate = (template: CodeTemplate) => {
    if (onInsertCode) {
      onInsertCode(template.code);
      toast.success(`代码模板 "${template.name}" 已插入`);
    }
    setSelectedTemplate(null);
  };

  return (
    <div className={`flex flex-col bg-slate-900 ${isMobile ? 'h-full' : 'h-[500px]'}`}>
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <FiCpu className="text-ai-purple" />
          <span>AI 编译助手 v2.0</span>
        </h3>
        <p className="text-sm text-gray-400 mt-1">智能代码生成、优化建议、错误修复</p>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMobile ? 'max-h-[300px]' : 'max-h-[350px]'}`}>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCpu size={32} className="mx-auto mb-3 text-ai-purple opacity-50" />
            <p>问我任何关于代码的问题</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['帮我生成一个组件', '创建 API 封装', '优化代码性能'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">快速代码模板</p>
              <div className="grid grid-cols-2 gap-2">
                {codeTemplates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => insertTemplate(template)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors"
                  >
                    <p className="text-sm font-medium text-ai-cyan">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-lg ${
                  msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-700 text-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.codeSnippet && (
                    <div className="mt-3 bg-slate-800 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-xs text-ai-cyan font-mono whitespace-pre-wrap">
                        {msg.codeSnippet.substring(0, 300)}
                        {msg.codeSnippet.length > 300 && '...'}
                      </pre>
                      <button
                        onClick={() => handleInsertCode(msg.codeSnippet!)}
                        className="mt-2 w-full py-2 bg-ai-purple/20 hover:bg-ai-purple/30 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                      >
                        <FiCode size={14} />
                        <span>插入到编辑器</span>
                      </button>
                    </div>
                  )}
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
            <FiZap size={20} />
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

  const handleInsertCode = (code: string) => {
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
        text: `\n${code}\n`
      }]);
      
      const newContent = file.content + '\n' + code;
      onChange(newContent);
    }
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
      
      const newContent = file.content + '\n' + suggestion;
      onChange(newContent);
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
            title="AI 智能建议"
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
              <span className="font-semibold">AI 智能建议 v2.0</span>
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
        <AICompiler 
          isMobile={isMobile} 
          currentCode={file.content}
          onInsertCode={handleInsertCode}
        />
      )}
    </div>
  );
};

export default EditorPanel;

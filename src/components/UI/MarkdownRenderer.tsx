import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Components } from 'react-markdown';

// 导入 KaTeX 样式
import 'katex/dist/katex.min.css';
// 导入代码高亮样式 - 使用更适合的主题
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  // 自定义组件配置
  const components: Components = {
    // 代码块
    code: ({ node, className: codeClassName, children, ...props }: any) => {
      const inline = !codeClassName;
      const match = /language-(\w+)/.exec(codeClassName || '');
      const language = match ? match[1] : '';
      
      if (inline) {
        return (
          <code 
            className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono border" 
            {...props}
          >
            {children}
          </code>
        );
      }
      
      const handleCopyCode = async () => {
        const text = String(children).replace(/\n$/, '');
        try {
          await navigator.clipboard.writeText(text);
          // 可以添加复制成功的提示
        } catch (err) {
          console.error('复制代码失败:', err);
        }
      };
      
      return (
        <div className="relative my-4 group">
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
            {language && (
              <span className="text-xs text-gray-600 font-medium uppercase">
                {language}
              </span>
            )}
            <button
              onClick={handleCopyCode}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              title="复制代码"
            >
              复制
            </button>
          </div>
          <pre className="bg-gray-50 border border-t-0 rounded-b-lg p-4 overflow-x-auto">
            <code className={codeClassName} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    
    // 引用块
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
        {children}
      </blockquote>
    ),
    
    // 表格
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    
    th: ({ children }) => (
      <th className="px-4 py-2 border-b border-gray-200 text-left font-semibold text-gray-900">
        {children}
      </th>
    ),
    
    td: ({ children }) => (
      <td className="px-4 py-2 border-b border-gray-200">
        {children}
      </td>
    ),
    
    // 链接
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    
    // 标题
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b border-gray-200 pb-2">
        {children}
      </h1>
    ),
    
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">
        {children}
      </h2>
    ),
    
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">
        {children}
      </h3>
    ),
    
    h4: ({ children }) => (
      <h4 className="text-base font-semibold mt-3 mb-2 text-gray-900">
        {children}
      </h4>
    ),
    
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold mt-3 mb-2 text-gray-900">
        {children}
      </h5>
    ),
    
    h6: ({ children }) => (
      <h6 className="text-sm font-semibold mt-3 mb-2 text-gray-700">
        {children}
      </h6>
    ),
    
    // 列表
    ul: ({ children }) => (
      <ul className="list-disc list-inside my-4 space-y-1">
        {children}
      </ul>
    ),
    
    ol: ({ children }) => (
      <ol className="list-decimal list-inside my-4 space-y-1">
        {children}
      </ol>
    ),
    
    li: ({ children }) => (
      <li className="text-gray-900">
        {children}
      </li>
    ),
    
    // 段落
    p: ({ children }) => (
      <p className="my-3 text-gray-900 leading-relaxed">
        {children}
      </p>
    ),
    
    // 分隔线
    hr: () => (
      <hr className="my-6 border-t border-gray-300" />
    ),
    
    // 强调
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">
        {children}
      </strong>
    ),
    
    em: ({ children }) => (
      <em className="italic text-gray-900">
        {children}
      </em>
    ),
    
    // 删除线
    del: ({ children }) => (
      <del className="line-through text-gray-500">
        {children}
      </del>
    ),
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
        skipHtml={false}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

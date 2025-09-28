import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Loader2 } from 'lucide-react';
import { ReasoningContent } from '../../types';

interface ReasoningDisplayProps {
  reasoning: ReasoningContent;
  onToggleCollapse: () => void;
}

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({ 
  reasoning, 
  onToggleCollapse 
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  // 如果推理内容为空且从未开始推理，不显示
  if (!reasoning.content && !reasoning.isStreaming) {
    return null;
  }

  // 截断显示的内容（折叠时只显示前100个字符）
  const truncatedContent = reasoning.content.length > 100 
    ? reasoning.content.substring(0, 100) + '...'
    : reasoning.content;

  const displayContent = reasoning.isCollapsed && !showFullContent 
    ? truncatedContent 
    : reasoning.content;

  return (
    <div className="mb-3 border border-blue-200 rounded-lg bg-blue-50">
      {/* 推理标题栏 */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {reasoning.isStreaming ? '正在推理...' : '推理过程'}
          </span>
          {reasoning.isStreaming && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 推理状态指示 */}
          {reasoning.isStreaming && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          
          {/* 折叠/展开按钮 */}
          {reasoning.isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronUp className="w-4 h-4 text-blue-600" />
          )}
        </div>
      </div>

      {/* 推理内容 */}
      {!reasoning.isCollapsed && (
        <div className="px-3 pb-3">
          {/* 推理摘要（如果有） */}
          {/* {reasoning.summary && reasoning.summary.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-blue-700 mb-1">推理摘要：</div>
              <div className="text-xs text-blue-600 bg-blue-25 p-2 rounded border border-blue-100">
                {reasoning.summary.join('')}
              </div>
            </div>
          )} */}

          {/* 推理详细内容 */}
          {reasoning.content && (
            <div className="bg-white rounded border border-blue-200 p-3">
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {displayContent}
                {reasoning.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
                )}
              </div>
              
              {/* 展开/收起按钮（仅在内容被截断时显示） */}
              {reasoning.isCollapsed && reasoning.content.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullContent(!showFullContent);
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showFullContent ? '收起' : '查看完整内容'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 折叠状态下的简要信息 */}
      {reasoning.isCollapsed && (
        <div className="px-3 pb-2">
          <div className="text-xs text-blue-600">
            {reasoning.isStreaming
              ? '推理进行中...'
              : reasoning.content
                ? `推理完成 (${reasoning.content.length} 字符)`
                : '推理完成'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasoningDisplay;

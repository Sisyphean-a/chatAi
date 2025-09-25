import React, { useMemo, useCallback } from 'react';
import MarkdownRenderer from '../UI/MarkdownRenderer';

interface StreamingMarkdownProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  gradientLength?: number;
  minOpacity?: number;
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  isStreaming,
  className = '',
  gradientLength = 12,
  minOpacity = 0.35
}) => {
  // 渐变效果配置
  const GRADIENT_LENGTH = gradientLength;
  const MIN_OPACITY = minOpacity;
  const MAX_OPACITY = 1.0;

  // 生成透明度数组 - 必须始终调用
  const opacityLevels = useMemo(() => {
    return Array.from({ length: GRADIENT_LENGTH }, (_, index) => {
      const position = index / (GRADIENT_LENGTH - 1);
      return MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * position;
    });
  }, [GRADIENT_LENGTH, MIN_OPACITY, MAX_OPACITY]);

  // 流式传输时的处理 - 必须始终调用
  const processStreamingContent = useMemo(() => {
    if (!content || !isStreaming) return { normalContent: content, gradientContent: '' };
    
    const totalLength = content.length;
    
    // 如果内容长度小于渐变长度，全部应用渐变
    if (totalLength <= GRADIENT_LENGTH) {
      return { normalContent: '', gradientContent: content };
    }
    
    // 分离正常内容和渐变内容
    const normalContent = content.slice(0, totalLength - GRADIENT_LENGTH);
    const gradientContent = content.slice(-GRADIENT_LENGTH);
    
    return { normalContent, gradientContent };
  }, [content, GRADIENT_LENGTH, isStreaming]);

  // 尝试检测是否在代码块中 - 必须始终调用
  const isInCodeBlock = useMemo(() => {
    if (!isStreaming) return false;
    const codeBlockMatches = content.match(/```/g);
    return codeBlockMatches && codeBlockMatches.length % 2 === 1;
  }, [content, isStreaming]);

  // 渲染带渐变效果的字符
  const renderGradientContent = useCallback((gradientContent: string) => {
    return gradientContent.split('').map((char, index) => {
      const opacity = opacityLevels[index] || MAX_OPACITY;
      
      return (
        <span
          key={`gradient-${content.length}-${index}`}
          className="transition-opacity duration-200 ease-out"
          style={{ opacity }}
        >
          {char}
        </span>
      );
    });
  }, [opacityLevels, MAX_OPACITY, content.length]);

  // 获取处理后的内容
  const { normalContent, gradientContent } = processStreamingContent;

  // 如果不是流式传输，直接渲染 Markdown
  if (!isStreaming) {
    return (
      <MarkdownRenderer 
        content={content} 
        className={className}
      />
    );
  }

  // 流式传输时，为了避免 Markdown 解析不完整的内容，我们采用更保守的策略
  // 只有在内容较长且不在代码块中时才使用 Markdown 渲染
  const shouldUseMarkdown = !isInCodeBlock && content.length > 50 && normalContent.length > 20;

  if (!shouldUseMarkdown) {
    // 使用纯文本渲染
    return (
      <div className={`whitespace-pre-wrap break-words ${className}`}>
        {normalContent}
        {gradientContent && renderGradientContent(gradientContent)}
      </div>
    );
  }

  // 对于较长的普通内容，尝试渲染 Markdown
  return (
    <div className={className}>
      {/* 正常内容部分用 Markdown 渲染 */}
      {normalContent && (
        <MarkdownRenderer content={normalContent} />
      )}
      
      {/* 渐变内容部分用纯文本渲染，避免 Markdown 解析不完整 */}
      {gradientContent && (
        <span className="whitespace-pre-wrap">
          {renderGradientContent(gradientContent)}
        </span>
      )}
    </div>
  );
};

export default StreamingMarkdown;

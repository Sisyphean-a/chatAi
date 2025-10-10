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

  // 生成透明度数组 - 必须始终调用（左深右浅）
  const opacityLevels = useMemo(() => {
    return Array.from({ length: GRADIENT_LENGTH }, (_, index) => {
      const position = index / (GRADIENT_LENGTH - 1);
      // 反转渐变方向：左边深色（高透明度），右边浅色（低透明度）
      return MAX_OPACITY - (MAX_OPACITY - MIN_OPACITY) * position;
    });
  }, [GRADIENT_LENGTH, MIN_OPACITY, MAX_OPACITY]);

  // 流式传输时的处理 - 必须始终调用
  const processStreamingContent = useMemo(() => {
    if (!content || !isStreaming) {
      return {
        completedLines: content,
        currentLineNormal: '',
        currentLineGradient: ''
      };
    }

    const totalLength = content.length;

    // 如果内容长度小于渐变长度，全部应用渐变
    if (totalLength <= GRADIENT_LENGTH) {
      return {
        completedLines: '',
        currentLineNormal: '',
        currentLineGradient: content
      };
    }

    // 找到最后一个换行符的位置
    const lastNewlineIndex = content.lastIndexOf('\n');

    // 如果没有换行符，说明只有一行
    if (lastNewlineIndex === -1) {
      const currentLineNormal = content.slice(0, totalLength - GRADIENT_LENGTH);
      const currentLineGradient = content.slice(-GRADIENT_LENGTH);
      return {
        completedLines: '',
        currentLineNormal,
        currentLineGradient
      };
    }

    // 有换行符：分离已完成的行和当前行
    const completedLines = content.slice(0, lastNewlineIndex + 1); // 包含最后的 \n
    const currentLine = content.slice(lastNewlineIndex + 1);

    // 对当前行应用渐变效果
    if (currentLine.length <= GRADIENT_LENGTH) {
      return {
        completedLines,
        currentLineNormal: '',
        currentLineGradient: currentLine
      };
    }

    const currentLineNormal = currentLine.slice(0, currentLine.length - GRADIENT_LENGTH);
    const currentLineGradient = currentLine.slice(-GRADIENT_LENGTH);

    return {
      completedLines,
      currentLineNormal,
      currentLineGradient
    };
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
  const { completedLines, currentLineNormal, currentLineGradient } = processStreamingContent;

  // 如果不是流式传输，直接渲染 Markdown
  if (!isStreaming) {
    return (
      <MarkdownRenderer
        content={content}
        className={className}
      />
    );
  }

  // 流式传输时的渲染策略：
  // 1. 已完成的行使用 Markdown 渲染（提供更好的视觉效果）
  // 2. 当前行的已显示部分使用纯文本
  // 3. 当前行的渐变部分应用透明度渐变效果
  return (
    <div className={className}>
      {/* 已完成的行：使用 Markdown 渲染 */}
      {completedLines && (
        <MarkdownRenderer content={completedLines} />
      )}

      {/* 当前行：使用纯文本渲染，确保渐变效果在同一行 */}
      {(currentLineNormal || currentLineGradient) && (
        <div className="whitespace-pre-wrap break-words">
          {currentLineNormal}
          {currentLineGradient && renderGradientContent(currentLineGradient)}
        </div>
      )}
    </div>
  );
};

export default StreamingMarkdown;

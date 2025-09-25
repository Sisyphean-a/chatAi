import React, { useMemo, useCallback } from 'react';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  gradientLength?: number; // 可配置的渐变长度
  minOpacity?: number; // 可配置的最小透明度
}

const StreamingText: React.FC<StreamingTextProps> = ({ 
  content, 
  isStreaming, 
  className = '',
  gradientLength = 12,
  minOpacity = 0.35
}) => {
  // 渐变效果的配置
  const GRADIENT_LENGTH = gradientLength; // 渐变字符数量
  const MIN_OPACITY = minOpacity; // 最小透明度
  const MAX_OPACITY = 1.0; // 最大透明度

  // 生成透明度数组（缓存计算结果）
  const opacityLevels = useMemo(() => {
    return Array.from({ length: GRADIENT_LENGTH }, (_, index) => {
      const position = index / (GRADIENT_LENGTH - 1);
      return MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * position;
    });
  }, [GRADIENT_LENGTH, MIN_OPACITY, MAX_OPACITY]);

  // 计算渐变文本
  const gradientText = useMemo(() => {
    if (!isStreaming || content.length === 0) {
      return { normalText: content, gradientChars: [] };
    }

    const totalChars = content.length;
    
    // 如果文本长度小于渐变长度，全部应用渐变
    if (totalChars <= GRADIENT_LENGTH) {
      // 对于短文本，使用简化的渐变计算
      const gradientChars = [];
      for (let i = 0; i < totalChars; i++) {
        const opacityIndex = Math.floor((i / (totalChars - 1 || 1)) * (opacityLevels.length - 1));
        gradientChars.push({
          char: content[i],
          opacity: opacityLevels[opacityIndex]
        });
      }
      return { normalText: '', gradientChars };
    }

    // 分离正常文本和渐变文本
    const normalText = content.slice(0, totalChars - GRADIENT_LENGTH);
    const gradientPart = content.slice(-GRADIENT_LENGTH);
    
    const gradientChars = [];
    for (let i = 0; i < GRADIENT_LENGTH; i++) {
      gradientChars.push({
        char: gradientPart[i],
        opacity: opacityLevels[i]
      });
    }

    return { normalText, gradientChars };
  }, [content, isStreaming, opacityLevels]);

  // 渲染单个渐变字符的回调
  const renderGradientChar = useCallback((item: { char: string; opacity: number }, index: number) => {
    // 对于换行符，使用特殊处理
    if (item.char === '\n') {
      return <br key={`br-${content.length}-${index}`} />;
    }
    
    return (
      <span
        key={`char-${content.length}-${index}`}
        className="transition-opacity duration-200 ease-out"
        style={{ 
          opacity: item.opacity
        }}
      >
        {item.char}
      </span>
    );
  }, [content.length]);

  if (!isStreaming) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={className}>
      {/* 正常文本部分 */}
      {gradientText.normalText}
      
      {/* 渐变文本部分 */}
      {gradientText.gradientChars.map(renderGradientChar)}
    </span>
  );
};

export default StreamingText;

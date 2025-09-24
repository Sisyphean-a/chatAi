import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface ResizableSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  title?: string;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  isOpen,
  onClose,
  width,
  onWidthChange,
  minWidth = 300,
  maxWidth = 600,
  title = '侧边栏',
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // 添加全局样式防止文本选择
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = startXRef.current - e.clientX; // 注意这里是减法，因为是从右边拖拽
    const newWidth = Math.min(
      Math.max(startWidthRef.current + deltaX, minWidth),
      maxWidth
    );
    
    onWidthChange(newWidth);
  }, [isResizing, minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 - 仅在小屏幕上显示 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div
        ref={sidebarRef}
        className="absolute right-0 top-0 h-full bg-white border-l border-gray-200 z-50 flex"
        style={{ width: `${width}px` }}
      >
        {/* 拖拽手柄 */}
        <div
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors duration-200 flex-shrink-0 group"
          onMouseDown={handleMouseDown}
        >
          <div className="w-full h-full relative">
            {/* 拖拽指示器 */}
            <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            {/* 中间的拖拽点 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>

        {/* 侧边栏内容 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
            <div className="flex items-center space-x-2">
              {/* 宽度指示器 */}
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                {width}px
              </span>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="关闭侧边栏 (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* 拖拽时的全局样式 */}
      {isResizing && (
        <style>
          {`
            * {
              cursor: col-resize !important;
              user-select: none !important;
            }
          `}
        </style>
      )}
    </>
  );
};

export default ResizableSidebar;

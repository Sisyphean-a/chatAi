import React, { useState, useRef, useEffect } from 'react';
import { X, Eye } from 'lucide-react';

interface ImageThumbnailProps {
  file: File;
  onRemove: () => void;
  onPreview?: (src: string, alt: string) => void;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ file, onRemove, onPreview }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [showHoverPreview, setShowHoverPreview] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 创建图片预览URL
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    // 清理函数
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleMouseEnter = () => {
    // 清除之前的延时
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // 延时显示悬浮预览
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = thumbnailRef.current?.getBoundingClientRect();
      if (rect) {
        setHoverPosition({
          x: rect.left + rect.width + 10,
          y: rect.top
        });
        setShowHoverPreview(true);
      }
    }, 500); // 500ms延时
  };

  const handleMouseLeave = () => {
    // 清除延时
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowHoverPreview(false);
  };

  const handleClick = () => {
    if (onPreview && imageSrc) {
      onPreview(imageSrc, file.name);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div
        ref={thumbnailRef}
        className="flex items-start space-x-2 group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 缩略图 */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="w-16 h-16 relative">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={file.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleClick}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            )}

            {/* 悬浮操作按钮 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={handleClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                title="预览图片"
              >
                <Eye className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* 文件信息 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-700 truncate" title={file.name}>
            {file.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </div>
        </div>

        {/* 删除按钮 */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          title="删除图片"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* 悬浮大图预览 */}
      {showHoverPreview && imageSrc && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2 max-w-xs">
            <img
              src={imageSrc}
              alt={file.name}
              className="max-w-full max-h-64 object-contain rounded"
            />
            <div className="mt-2 text-sm text-gray-600">
              <div className="font-medium truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-gray-500">
                {formatFileSize(file.size)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageThumbnail;

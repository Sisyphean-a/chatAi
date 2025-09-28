import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Square } from 'lucide-react';
import ImageThumbnail from '../UI/ImageThumbnail';
import ImagePreview from '../UI/ImagePreview';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onCancelStream?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onCancelStream,
  disabled = false,
  isStreaming = false,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自动调整文本框高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 发送消息
  const handleSend = () => {
    if (disabled || (!message.trim() && attachments.length === 0)) {
      return;
    }

    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    
    // 重置文本框高度
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, 0);
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = ''; // 清空input，允许重复选择同一文件
  };

  // 添加文件
  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // 检查文件大小（限制为 20MB）
      if (file.size > 20 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 20MB 限制`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  // 移除附件
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // 处理粘贴
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files: File[] = [];

    items.forEach(item => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    });

    if (files.length > 0) {
      addFiles(files);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4">
      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {attachments.map((file, index) => (
            file.type.startsWith('image/') ? (
              <ImageThumbnail
                key={index}
                file={file}
                onRemove={() => removeAttachment(index)}
                onPreview={(src, alt) => setPreviewImage({ src, alt })}
              />
            ) : (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
                <span className="truncate max-w-32">{file.name}</span>
                <span className="text-gray-500">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div
        className={`relative border rounded-lg ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="输入消息... (支持拖拽文件或粘贴图片)"
          disabled={disabled}
          className="w-full px-4 py-3 pr-20 border-0 rounded-lg resize-none focus:ring-0 focus:outline-none"
          style={{ minHeight: '52px' }}
        />

        {/* 工具栏 */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
          {/* 文件上传按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="上传文件"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* 发送/停止按钮 */}
          {isStreaming ? (
            <button
              onClick={onCancelStream}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="停止生成"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0)}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="发送消息"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.json,.csv,.pdf,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 拖拽提示 */}
      {dragOver && (
        <div className="absolute inset-0 bg-primary-500 bg-opacity-10 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center">
          <div className="text-primary-700 font-medium">
            拖拽文件到这里上传
          </div>
        </div>
      )}

      {/* 图片预览 */}
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default MessageInput;

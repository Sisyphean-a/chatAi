import React, { useState } from 'react';
import { Bot, User, Paperclip, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { Message } from '../../types';
import ImagePreview from '../UI/ImagePreview';
import StreamingMarkdown from './StreamingMarkdown';
import ReasoningDisplay from './ReasoningDisplay';
import ErrorBoundary from '../UI/ErrorBoundary';
import { copyToClipboard } from '../../utils/helpers';

interface MessageBubbleProps {
  message: Message;
  onUpdateMessage?: (messageId: string, updates: Partial<Message>) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onUpdateMessage }) => {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming || false;
  const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 复制消息内容
  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-500' : 'bg-gray-200'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`${isUser ? 'inline-block max-w-[80%]' : 'block max-w-[75%]'} rounded-lg px-4 py-3 relative group ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}>
          {/* 附件预览 */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex items-center space-x-2 p-2 rounded border ${
                    isUser 
                      ? 'bg-primary-500 border-primary-500' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {attachment.type === 'image' ? (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <img
                        src={attachment.content}
                        alt={attachment.name}
                        className="max-w-xs max-h-48 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage({ src: attachment.content, alt: attachment.name })}
                      />
                    </>
                  ) : (
                    <>
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm truncate">{attachment.name}</span>
                      <span className="text-xs opacity-75">
                        ({formatFileSize(attachment.size)})
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 推理内容 - 仅在AI消息中显示 */}
          {!isUser && message.reasoning && (
            <ReasoningDisplay
              reasoning={message.reasoning}
              onToggleCollapse={() => {
                if (onUpdateMessage && message.reasoning) {
                  onUpdateMessage(message.id, {
                    reasoning: {
                      ...message.reasoning,
                      isCollapsed: !message.reasoning.isCollapsed
                    }
                  });
                }
              }}
            />
          )}

          {/* 文本内容 */}
          <div className={`${isUser ? 'whitespace-pre-wrap break-words text-left' : ''}`}>
            {isUser ? (
              // 用户消息保持纯文本显示，但文本内容左对齐
              <div className="whitespace-pre-wrap break-words leading-relaxed text-left">
                {message.content}
              </div>
            ) : (
              // AI回复使用 Markdown 渲染，包装在错误边界中
              <ErrorBoundary
                fallback={
                  <div className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </div>
                }
              >
                <StreamingMarkdown
                  content={message.content}
                  isStreaming={isStreaming}
                  className="leading-relaxed"
                  gradientLength={15}
                  minOpacity={0.3}
                />
              </ErrorBoundary>
            )}
          </div>

          {/* 复制按钮 - 只在AI回复中显示 */}
          {!isUser && message.content && !isStreaming && (
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 p-1.5 rounded transition-all duration-200 ${
                copied
                  ? 'bg-green-100 text-green-600'
                  : 'bg-white/80 text-gray-500 hover:bg-white hover:text-gray-700 opacity-0 group-hover:opacity-100'
              }`}
              title={copied ? '已复制' : '复制消息'}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* 时间戳 */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {timestamp}
          {isStreaming && (
            <span className="ml-2 text-blue-500">正在输入...</span>
          )}
        </div>
      </div>

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

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default MessageBubble;

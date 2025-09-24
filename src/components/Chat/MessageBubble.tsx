import React, { useState } from 'react';
import { Bot, User, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Message } from '../../types';
import ImagePreview from '../UI/ImagePreview';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-600' : 'bg-gray-200'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-primary-600 text-white' 
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
                      ? 'bg-primary-700 border-primary-500' 
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

          {/* 文本内容 */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {/* 时间戳 */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {timestamp}
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

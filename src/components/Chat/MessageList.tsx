import React from 'react';
import { Trash2, RefreshCw, AlertCircle, Bot, User } from 'lucide-react';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClearChat: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  onRetry,
  onClearChat,
}) => {
  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            你好！有什么可以帮助你的吗？
          </h2>
          <p className="text-gray-600 text-lg">
            我是你的 AI 助手，可以回答问题、协助写作、分析文档等。请输入你的问题开始对话。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 消息列表 */}
      <div className="px-4 py-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-800 text-sm mb-2">{error}</p>
                <button
                  onClick={onRetry}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>重试</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;

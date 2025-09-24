import React, { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChatConfig, ChatState } from '../../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { sendMessage } from '../../services/chatService';

interface ChatInterfaceProps {
  config: ChatConfig;
  chatState: ChatState;
  onUpdateChat: (chatState: ChatState) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  config,
  chatState,
  onUpdateChat,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // 发送消息
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    // 立即显示用户消息并设置加载状态
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: Date.now(),
      attachments: attachments?.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        content: '', // 这里会在 sendMessage 中处理
      })),
    };

    const updatedMessages = [...chatState.messages, userMessage];

    // 立即更新 UI 显示用户消息和加载状态
    onUpdateChat({
      ...chatState,
      messages: updatedMessages,
      isLoading: true,
      error: null,
    });

    try {
      const response = await sendMessage(content, attachments, config, chatState.messages);
      onUpdateChat(response);
    } catch (error) {
      onUpdateChat({
        ...chatState,
        messages: updatedMessages, // 保留用户消息
        error: error instanceof Error ? error.message : '发送消息失败',
        isLoading: false,
      });
    }
  };

  // 清空对话
  const handleClearChat = () => {
    onUpdateChat({
      messages: [],
      isLoading: false,
      error: null,
    });
  };

  // 重试最后一条消息
  const handleRetry = () => {
    if (chatState.messages.length === 0) return;

    const lastUserMessage = [...chatState.messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (lastUserMessage) {
      // 移除最后一条助手消息（如果存在）
      const messagesWithoutLastAssistant = chatState.messages.filter(
        (msg, index) => !(index === chatState.messages.length - 1 && msg.role === 'assistant')
      );

      onUpdateChat({
        ...chatState,
        messages: messagesWithoutLastAssistant,
        error: null,
      });

      // 重新发送最后一条用户消息
      handleSendMessage(lastUserMessage.content, undefined);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          <MessageList
            messages={chatState.messages}
            isLoading={chatState.isLoading}
            error={chatState.error}
            onRetry={handleRetry}
            onClearChat={handleClearChat}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={chatState.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

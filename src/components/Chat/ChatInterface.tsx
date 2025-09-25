import React, { useRef, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ChatConfig, ChatState, Message } from '../../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { sendMessageStream, StreamCallbacks } from '../../services/chatService';
import { generateId } from '../../utils/helpers';

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
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, streamingMessage]);

  // 取消流式传输
  const handleCancelStream = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setStreamingMessage(null);

      // 更新状态为非加载状态
      onUpdateChat({
        ...chatState,
        isLoading: false,
        error: null,
      });
    }
  };

  // 发送消息（流式传输）
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    // 创建新的 AbortController
    const controller = new AbortController();
    setAbortController(controller);

    // 立即显示用户消息并设置加载状态
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: attachments?.map(file => ({
        id: generateId(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        content: '', // 这里会在 sendMessageStream 中处理
        size: file.size,
        mimeType: file.type,
      })),
    };

    const updatedMessages = [...chatState.messages, userMessage];

    // 立即更新 UI 显示用户消息和加载状态
    onUpdateChat({
      ...chatState,
      messages: updatedMessages,
      isLoading: true,
      error: null,
      streamController: controller,
    });

    // 创建流式消息
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const streamCallbacks: StreamCallbacks = {
      onStart: () => {
        setStreamingMessage(assistantMessage);
      },
      onToken: (token: string) => {
        setStreamingMessage(prev => prev ? {
          ...prev,
          content: prev.content + token,
        } : null);
      },
      onComplete: (fullContent: string) => {
        const finalMessage: Message = {
          ...assistantMessage,
          content: fullContent,
          isStreaming: false,
        };

        const finalMessages = [...updatedMessages, finalMessage];

        onUpdateChat({
          messages: finalMessages,
          isLoading: false,
          error: null,
        });

        setStreamingMessage(null);
        setAbortController(null);
      },
      onError: (error: string) => {
        onUpdateChat({
          messages: updatedMessages, // 保留用户消息
          isLoading: false,
          error,
        });

        setStreamingMessage(null);
        setAbortController(null);
      },
    };

    try {
      await sendMessageStream(
        content,
        attachments,
        config,
        chatState.messages,
        streamCallbacks,
        controller
      );
    } catch (error) {
      // 错误已在 streamCallbacks.onError 中处理
      console.error('流式传输错误:', error);
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

  // 合并显示的消息（包括流式消息）
  const displayMessages = streamingMessage
    ? [...chatState.messages, streamingMessage]
    : chatState.messages;

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[90%] mx-auto px-4">
          <MessageList
            messages={displayMessages}
            isLoading={chatState.isLoading && !streamingMessage}
            error={chatState.error}
            onRetry={handleRetry}
            onClearChat={handleClearChat}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 流式传输取消按钮 */}
      {streamingMessage && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="max-w-[90%] mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-600">AI 正在回复中...</span>
            <button
              onClick={handleCancelStream}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
              <span>停止生成</span>
            </button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-[90%] mx-auto">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={chatState.isLoading || !!streamingMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

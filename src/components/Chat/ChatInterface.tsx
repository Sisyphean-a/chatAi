import React, { useRef, useEffect, useState } from 'react';
import { ChatConfig, ChatState, Message, Attachment } from '../../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { sendMessageStream, StreamCallbacks } from '../../services/chatService';
import { generateId } from '../../utils/helpers';
import { processFiles } from '../../utils/fileProcessor';

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
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(config.reasoningEnabled || false);

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
  const handleSendMessage = async (content: string, attachments?: File[], useReasoning?: boolean) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    let processedAttachments: Attachment[] | undefined;

    if (attachments && attachments.length > 0) {
      try {
        const results = await processFiles(attachments);
        processedAttachments = results.length > 0 ? results : undefined;
      } catch (error) {
        console.error('处理附件失败:', error);
        const errorMessage = error instanceof Error ? error.message : '处理附件时发生未知错误';
        onUpdateChat({
          ...chatState,
          isLoading: false,
          error: errorMessage,
        });
        return;
      }
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
      attachments: processedAttachments,
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
      reasoning: undefined, // 初始化推理内容
    };

    const streamCallbacks: StreamCallbacks = {
      onStart: () => {
        setStreamingMessage(assistantMessage);
      },
      onReasoningStart: () => {
        setStreamingMessage(prev => prev ? {
          ...prev,
          reasoning: {
            content: '',
            isStreaming: true,
            isCollapsed: false, // 推理时展开显示
          }
        } : null);
      },
      onReasoningToken: (token: string) => {
        setStreamingMessage(prev => prev ? {
          ...prev,
          reasoning: prev.reasoning ? {
            ...prev.reasoning,
            content: prev.reasoning.content + token,
          } : {
            content: token,
            isStreaming: true,
            isCollapsed: false,
          }
        } : null);
      },
      onReasoningComplete: (fullReasoning: string, summary?: string[]) => {
        setStreamingMessage(prev => prev ? {
          ...prev,
          reasoning: {
            content: fullReasoning,
            isStreaming: false,
            isCollapsed: true, // 推理完成后折叠
            summary,
          }
        } : null);
      },
      onToken: (token: string) => {
        setStreamingMessage(prev => prev ? {
          ...prev,
          content: prev.content + token,
        } : null);
      },
      onComplete: (fullContent: string, reasoning?: { content: string; summary?: string[] }) => {
        const finalMessage: Message = {
          ...assistantMessage,
          content: fullContent,
          isStreaming: false,
          reasoning: reasoning ? {
            content: reasoning.content,
            isStreaming: false,
            isCollapsed: true, // 确保最终消息中推理是折叠的
            summary: reasoning.summary,
          } : undefined,
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
        processedAttachments,
        config,
        chatState.messages,
        streamCallbacks,
        controller,
        useReasoning !== undefined ? useReasoning : reasoningEnabled
      );
    } catch (error) {
      // 错误已在 streamCallbacks.onError 中处理
      console.error('流式传输错误:', error);
    }
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

  // 更新消息
  const handleUpdateMessage = (messageId: string, updates: Partial<Message>) => {
    const updatedMessages = chatState.messages.map(msg =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    );

    onUpdateChat({
      ...chatState,
      messages: updatedMessages,
    });
  };

  // 处理推理开关
  const handleReasoningToggle = (enabled: boolean) => {
    setReasoningEnabled(enabled);
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
            onUpdateMessage={handleUpdateMessage}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* 输入区域 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-[90%] mx-auto">
          <MessageInput
            onSendMessage={handleSendMessage}
            onCancelStream={handleCancelStream}
            disabled={chatState.isLoading || !!streamingMessage}
            isStreaming={!!streamingMessage}
            reasoningEnabled={reasoningEnabled}
            onReasoningToggle={handleReasoningToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

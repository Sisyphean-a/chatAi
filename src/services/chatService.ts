import axios from 'axios';
import { ChatConfig, Message, ChatState, Attachment } from '../types';
import { generateId } from '../utils/helpers';

// 流式传输回调类型
export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onReasoningStart?: () => void;
  onReasoningToken?: (token: string) => void;
  onReasoningComplete?: (fullReasoning: string, summary?: string[]) => void;
  onComplete?: (fullContent: string, reasoning?: { content: string; summary?: string[] }) => void;
  onError?: (error: string) => void;
}

// 流式传输发送消息
export const sendMessageStream = async (
  content: string,
  attachments: Attachment[] | undefined,
  config: ChatConfig,
  previousMessages: Message[],
  callbacks: StreamCallbacks,
  abortController?: AbortController,
  reasoningEnabled?: boolean
): Promise<ChatState> => {

  // 创建用户消息
  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: Date.now(),
    attachments,
  };

  // 更新消息列表
  const updatedMessages = [...previousMessages, userMessage];

  // 准备发送给 API 的消息
  const apiMessages = prepareApiMessages(updatedMessages);

  try {
    callbacks.onStart?.();

    // 构建请求配置
    const requestBody = {
      model: config.model,
      messages: apiMessages,
      temperature: config.temperature,
      ...(config.maxTokens !== null && { max_tokens: config.maxTokens }),
      stream: true,
      ...(reasoningEnabled && { reasoning: { enabled: true } }),
    };

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...config.customHeaders,
      },
      body: JSON.stringify(requestBody),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败 (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let fullReasoning = '';
    let reasoningSummary: string[] = [];
    let isReasoningStarted = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);

              // 检查是否有推理内容
              const delta = parsed.choices?.[0]?.delta;
              if (delta) {
                // 处理推理内容
                if (delta.reasoning) {
                  if (!isReasoningStarted) {
                    isReasoningStarted = true;
                    callbacks.onReasoningStart?.();
                  }
                  const reasoningContent = delta.reasoning;
                  if (reasoningContent) {
                    fullReasoning += reasoningContent;
                    callbacks.onReasoningToken?.(reasoningContent);
                  }
                }

                // 处理推理详情和摘要
                if (delta.reasoning_details) {
                  for (const detail of delta.reasoning_details) {
                    if (detail.type === 'reasoning.summary' && detail.summary) {
                      reasoningSummary.push(detail.summary);
                    }
                  }
                }

                // 处理常规内容
                const content = delta.content;
                if (content) {
                  // 如果有推理内容且这是第一个常规内容，标记推理完成
                  if (isReasoningStarted && fullContent === '') {
                    callbacks.onReasoningComplete?.(fullReasoning, reasoningSummary.length > 0 ? reasoningSummary : undefined);
                  }
                  fullContent += content;
                  callbacks.onToken?.(content);
                }
              }
            } catch (e) {
              // Ignore invalid JSON
            }
          }
        }
      }
    } finally {
      reader.cancel();
    }

    // 准备推理数据
    const reasoningData = fullReasoning ? {
      content: fullReasoning,
      summary: reasoningSummary.length > 0 ? reasoningSummary : undefined
    } : undefined;

    callbacks.onComplete?.(fullContent, reasoningData);

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: fullContent,
      timestamp: Date.now(),
      reasoning: fullReasoning ? {
        content: fullReasoning,
        isStreaming: false,
        isCollapsed: true, // 默认折叠
        summary: reasoningSummary.length > 0 ? reasoningSummary : undefined
      } : undefined,
    };

    return {
      messages: [...updatedMessages, assistantMessage],
      isLoading: false,
      error: null,
    };

  } catch (error) {
    console.error('流式API请求失败:', error);

    let errorMessage = '发送消息失败';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求已取消';
      } else {
        errorMessage = error.message;
      }
    }

    callbacks.onError?.(errorMessage);

    return {
      messages: updatedMessages,
      isLoading: false,
      error: errorMessage,
    };
  }
};

// 非流式传输发送消息（保留兼容性）
export const sendMessage = async (
  content: string,
  attachments: Attachment[] | undefined,
  config: ChatConfig,
  previousMessages: Message[]
): Promise<ChatState> => {

  // 创建用户消息
  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: Date.now(),
    attachments,
  };

  // 更新消息列表
  const updatedMessages = [...previousMessages, userMessage];

  // 准备发送给 API 的消息
  const apiMessages = prepareApiMessages(updatedMessages);

  try {
    // 构建请求配置
    const requestConfig = {
      method: 'POST',
      url: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      data: {
        model: config.model,
        messages: apiMessages,
        temperature: config.temperature,
        ...(config.maxTokens !== null && { max_tokens: config.maxTokens }),
        stream: false,
      },
    };

    // 如果配置了代理，添加代理设置
    if (config.proxyUrl) {
      const proxyUrl = new URL(config.proxyUrl);
      (requestConfig as any).proxy = {
        protocol: proxyUrl.protocol.slice(0, -1),
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port) || (proxyUrl.protocol === 'https:' ? 443 : 80),
      };
    }

    // 发送请求
    const response = await axios(requestConfig);

    // 处理响应
    const assistantContent = response.data.choices[0]?.message?.content || '抱歉，我无法生成回复。';

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now(),
    };

    return {
      messages: [...updatedMessages, assistantMessage],
      isLoading: false,
      error: null,
    };

  } catch (error) {
    console.error('API 请求失败:', error);
    
    let errorMessage = '发送消息失败';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 服务器返回错误状态码
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            errorMessage = 'API Key 无效或已过期';
            break;
          case 403:
            errorMessage = '没有权限访问此 API';
            break;
          case 429:
            errorMessage = '请求过于频繁，请稍后再试';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          default:
            errorMessage = data?.error?.message || `请求失败 (${status})`;
        }
      } else if (error.request) {
        // 网络错误
        errorMessage = '网络连接失败，请检查网络设置或代理配置';
      }
    }

    return {
      messages: updatedMessages,
      isLoading: false,
      error: errorMessage,
    };
  }
};

// 准备发送给 API 的消息格式
const prepareApiMessages = (messages: Message[]) => {
  return messages.map(message => {
    const apiMessage: any = {
      role: message.role,
      content: message.content,
    };

    // 如果有附件，将附件内容添加到消息中
    if (message.attachments && message.attachments.length > 0) {
      const attachmentContents = message.attachments
        .filter(att => att.type === 'file') // 只处理文件附件，图片附件需要特殊处理
        .map(att => `\n\n[文件: ${att.name}]\n${att.content}`)
        .join('');

      if (attachmentContents) {
        apiMessage.content += attachmentContents;
      }

      // 处理图片附件（如果模型支持）
      const imageAttachments = message.attachments.filter(att => att.type === 'image');
      if (imageAttachments.length > 0) {
        // 对于支持图片的模型（如 GPT-4V），可以使用多模态格式
        apiMessage.content = [
          {
            type: 'text',
            text: message.content,
          },
          ...imageAttachments.map(att => ({
            type: 'image_url',
            image_url: {
              url: att.content,
            },
          })),
        ];
      }
    }

    return apiMessage;
  });
};

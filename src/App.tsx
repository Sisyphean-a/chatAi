import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare } from 'lucide-react';
import ChatInterface from './components/Chat/ChatInterface';
import ChatSidebar from './components/Chat/ChatSidebar';
import SettingsPanel from './components/Settings/SettingsPanel';
import ResizableSidebar from './components/UI/ResizableSidebar';
import { AppState, ChatConfig } from './types';
import { loadConfig, saveConfig, loadMessages, saveMessages, loadSidebarWidth, saveSidebarWidth } from './utils/storage';

const defaultConfig: ChatConfig = {
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  proxyUrl: '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: null,
  customHeaders: {},
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    config: defaultConfig,
    chat: {
      messages: [],
      isLoading: false,
      error: null,
    },
    showSettings: false,
  });
  const [sidebarWidth, setSidebarWidth] = useState(loadSidebarWidth());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 加载配置和消息历史
  useEffect(() => {
    const savedConfig = loadConfig();
    const savedMessages = loadMessages();

    setAppState(prev => ({
      ...prev,
      config: savedConfig ? { ...defaultConfig, ...savedConfig } : defaultConfig,
      chat: {
        ...prev.chat,
        messages: savedMessages,
      },
    }));
  }, []);

  // 更新配置
  const updateConfig = (newConfig: Partial<ChatConfig>) => {
    const updatedConfig = { ...appState.config, ...newConfig };
    setAppState(prev => ({
      ...prev,
      config: updatedConfig,
    }));
    saveConfig(updatedConfig);
  };

  // 更新聊天状态并保存到本地存储
  const updateChatState = (newChatState: ChatState) => {
    setAppState(prev => ({
      ...prev,
      chat: newChatState,
    }));
    // 自动保存消息到本地存储
    saveMessages(newChatState.messages);
  };

  // 处理侧边栏宽度变化
  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
    saveSidebarWidth(width);
  };

  // 切换设置面板
  const toggleSettings = () => {
    setAppState(prev => ({
      ...prev,
      showSettings: !prev.showSettings,
    }));
  };

  // 检查是否已配置
  const isConfigured = appState.config.apiKey.trim() !== '';

  return (
    <div className="h-screen bg-white flex">
      {/* 左侧边栏 */}
      <ChatSidebar
        onNewChat={() => setAppState(prev => ({
          ...prev,
          chat: { messages: [], isLoading: false, error: null }
        }))}
        onOpenSettings={toggleSettings}
        messageCount={appState.chat.messages.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!isConfigured ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                欢迎使用 ChatGPT 对话
              </h2>
              <p className="text-gray-600 mb-4">
                请先在设置中配置您的 API Key 和相关参数
              </p>
              <button
                onClick={toggleSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                打开设置
              </button>
            </div>
          </div>
        ) : (
          <ChatInterface
            config={appState.config}
            chatState={appState.chat}
            onUpdateChat={updateChatState}
          />
        )}

        {/* 设置面板 */}
        <ResizableSidebar
          isOpen={appState.showSettings}
          onClose={() => setAppState(prev => ({ ...prev, showSettings: false }))}
          width={sidebarWidth}
          onWidthChange={handleSidebarWidthChange}
          minWidth={320}
          maxWidth={800}
          title="设置"
        >
          <SettingsPanel
            config={appState.config}
            onUpdateConfig={updateConfig}
            onClose={() => setAppState(prev => ({ ...prev, showSettings: false }))}
          />
        </ResizableSidebar>
      </div>
    </div>
  );
}

export default App;

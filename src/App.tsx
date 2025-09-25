import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatInterface from './components/Chat/ChatInterface';
import ChatSidebar from './components/Chat/ChatSidebar';
import SettingsPanel from './components/Settings/SettingsPanel';
import ResizableSidebar from './components/UI/ResizableSidebar';
import { AppState, ChatConfig, Conversation, ChatState } from './types';
import {
  loadConfig,
  saveConfig,
  loadConversations,
  saveConversations,
  loadCurrentConversationId,
  saveCurrentConversationId,
  loadSidebarWidth,
  saveSidebarWidth,
  createNewConversation,
  updateConversation,
  deleteConversation,
  generateConversationTitle
} from './utils/storage';

const defaultConfig: ChatConfig = {
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  proxyUrl: '',
  model: '', // 默认为空，需要用户选择
  temperature: 0.7,
  maxTokens: null,
  customHeaders: {},
  customModels: [],
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    config: defaultConfig,
    conversations: [],
    currentConversationId: null,
    showSettings: false,
  });
  const [sidebarWidth, setSidebarWidth] = useState(loadSidebarWidth());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 加载配置和对话历史
  useEffect(() => {
    const savedConfig = loadConfig();
    const savedConversations = loadConversations();
    const savedCurrentConversationId = loadCurrentConversationId();

    // 如果没有对话，创建一个新对话
    let conversations = savedConversations;
    let currentId = savedCurrentConversationId;

    if (conversations.length === 0) {
      const newConversation = createNewConversation();
      conversations = [newConversation];
      currentId = newConversation.id;
      saveConversations(conversations);
      saveCurrentConversationId(currentId);
    } else if (!currentId || !conversations.find(conv => conv.id === currentId)) {
      // 如果当前对话ID无效，选择第一个对话
      currentId = conversations[0].id;
      saveCurrentConversationId(currentId);
    }

    setAppState(prev => ({
      ...prev,
      config: savedConfig ? { ...defaultConfig, ...savedConfig } : defaultConfig,
      conversations,
      currentConversationId: currentId,
    }));
  }, []);

  // 获取当前对话
  const getCurrentConversation = (): Conversation | null => {
    if (!appState.currentConversationId) return null;
    return appState.conversations.find(conv => conv.id === appState.currentConversationId) || null;
  };

  // 获取当前聊天状态
  const getCurrentChatState = (): ChatState => {
    const currentConv = getCurrentConversation();
    return {
      messages: currentConv?.messages || [],
      isLoading: false,
      error: null,
    };
  };

  // 更新配置
  const updateConfig = (newConfig: Partial<ChatConfig>) => {
    const updatedConfig = { ...appState.config, ...newConfig };
    setAppState(prev => ({
      ...prev,
      config: updatedConfig,
    }));
    saveConfig(updatedConfig);
  };

  // 创建新对话
  const createNewChat = () => {
    // 检查当前对话是否为空的新对话
    const currentConv = getCurrentConversation();
    if (currentConv && currentConv.messages.length === 0 && currentConv.title === '新对话') {
      // 如果当前对话是空的新对话，不创建新的
      return;
    }

    const newConversation = createNewConversation();
    const updatedConversations = [...appState.conversations, newConversation];

    setAppState(prev => ({
      ...prev,
      conversations: updatedConversations,
      currentConversationId: newConversation.id,
    }));

    saveConversations(updatedConversations);
    saveCurrentConversationId(newConversation.id);
  };

  // 切换对话
  const switchConversation = (conversationId: string) => {
    setAppState(prev => ({
      ...prev,
      currentConversationId: conversationId,
    }));
    saveCurrentConversationId(conversationId);
  };

  // 删除对话
  const removeConversation = (conversationId: string) => {
    const updatedConversations = deleteConversation(appState.conversations, conversationId);
    let newCurrentId = appState.currentConversationId;

    // 如果删除的是当前对话，切换到其他对话或创建新对话
    if (conversationId === appState.currentConversationId) {
      if (updatedConversations.length > 0) {
        newCurrentId = updatedConversations[0].id;
      } else {
        // 如果没有其他对话，创建一个新对话
        const newConversation = createNewConversation();
        updatedConversations.push(newConversation);
        newCurrentId = newConversation.id;
      }
    }

    setAppState(prev => ({
      ...prev,
      conversations: updatedConversations,
      currentConversationId: newCurrentId,
    }));

    saveConversations(updatedConversations);
    saveCurrentConversationId(newCurrentId);
  };

  // 更新聊天状态并保存到本地存储
  const updateChatState = (newChatState: ChatState) => {
    if (!appState.currentConversationId) {
      // 如果没有当前对话，创建一个新对话
      createNewChat();
      return;
    }

    const updatedConversations = updateConversation(
      appState.conversations,
      appState.currentConversationId,
      {
        messages: newChatState.messages,
        title: newChatState.messages.length > 0
          ? generateConversationTitle(newChatState.messages)
          : '新对话'
      }
    );

    setAppState(prev => ({
      ...prev,
      conversations: updatedConversations,
    }));

    saveConversations(updatedConversations);
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
  const isConfigured = appState.config.apiKey.trim() !== '' && appState.config.model.trim() !== '';

  // 确保有当前对话
  const currentChatState = getCurrentChatState();

  return (
    <div className="h-screen bg-white flex">
      {/* 左侧边栏 */}
      <ChatSidebar
        conversations={appState.conversations}
        currentConversationId={appState.currentConversationId}
        onNewChat={createNewChat}
        onSwitchConversation={switchConversation}
        onDeleteConversation={removeConversation}
        onOpenSettings={toggleSettings}
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
                请先在设置中配置您的 API Key 和选择模型
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
            chatState={currentChatState}
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

import { ChatConfig, Message } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'chatgpt-web-config',
  MESSAGES: 'chatgpt-web-messages',
  SETTINGS: 'chatgpt-web-settings',
  SIDEBAR_WIDTH: 'chatgpt-web-sidebar-width',
};

// 配置相关
export const saveConfig = (config: ChatConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('保存配置失败:', error);
  }
};

export const loadConfig = (): ChatConfig | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('加载配置失败:', error);
    return null;
  }
};

// 消息历史相关
export const saveMessages = (messages: Message[]): void => {
  try {
    // 只保存最近的 100 条消息
    const messagesToSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesToSave));
  } catch (error) {
    console.error('保存消息失败:', error);
  }
};

export const loadMessages = (): Message[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('加载消息失败:', error);
    return [];
  }
};

export const clearMessages = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (error) {
    console.error('清除消息失败:', error);
  }
};

// 应用设置相关
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  showTimestamp: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'zh-CN',
  autoSave: true,
  showTimestamp: true,
};

export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const currentSettings = loadSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (error) {
    console.error('加载设置失败:', error);
    return defaultSettings;
  }
};

// 侧边栏宽度相关
export const saveSidebarWidth = (width: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, width.toString());
  } catch (error) {
    console.error('保存侧边栏宽度失败:', error);
  }
};

export const loadSidebarWidth = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH);
    return saved ? parseInt(saved, 10) : 384; // 默认 384px
  } catch (error) {
    console.error('加载侧边栏宽度失败:', error);
    return 384;
  }
};

// 导出数据
export const exportData = (): string => {
  const config = loadConfig();
  const messages = loadMessages();
  const settings = loadSettings();

  const exportData = {
    config: config ? { ...config, apiKey: '[HIDDEN]' } : null, // 隐藏 API Key
    messages,
    settings,
    exportTime: new Date().toISOString(),
    version: '1.0.0',
  };

  return JSON.stringify(exportData, null, 2);
};

// 导入数据
export const importData = (jsonData: string): { success: boolean; error?: string } => {
  try {
    const data = JSON.parse(jsonData);

    // 验证数据格式
    if (!data || typeof data !== 'object') {
      return { success: false, error: '无效的数据格式' };
    }

    // 导入配置（跳过 API Key）
    if (data.config && typeof data.config === 'object') {
      const currentConfig = loadConfig();
      const newConfig = {
        ...data.config,
        apiKey: currentConfig?.apiKey || '', // 保持当前的 API Key
      };
      saveConfig(newConfig);
    }

    // 导入消息
    if (Array.isArray(data.messages)) {
      saveMessages(data.messages);
    }

    // 导入设置
    if (data.settings && typeof data.settings === 'object') {
      saveSettings(data.settings);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '导入失败'
    };
  }
};

// 清除所有数据
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('清除数据失败:', error);
  }
};

// 获取存储使用情况
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // 大多数浏览器的 localStorage 限制是 5-10MB
    const total = 5 * 1024 * 1024; // 假设 5MB
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  } catch (error) {
    console.error('获取存储使用情况失败:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
};

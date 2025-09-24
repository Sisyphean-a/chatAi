import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ChatConfig } from '../../types';
import DataManagement from './DataManagement';

interface SettingsPanelProps {
  config: ChatConfig;
  onUpdateConfig: (config: Partial<ChatConfig>) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const [localConfig, setLocalConfig] = useState<ChatConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ChatConfig, value: string | number) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localConfig.apiKey.trim()) {
      newErrors.apiKey = 'API Key 不能为空';
    }

    if (!localConfig.apiUrl.trim()) {
      newErrors.apiUrl = 'API URL 不能为空';
    } else if (!isValidUrl(localConfig.apiUrl)) {
      newErrors.apiUrl = '请输入有效的 URL';
    }

    if (localConfig.proxyUrl && !isValidUrl(localConfig.proxyUrl)) {
      newErrors.proxyUrl = '请输入有效的代理 URL';
    }

    if (localConfig.temperature < 0 || localConfig.temperature > 2) {
      newErrors.temperature = 'Temperature 应在 0-2 之间';
    }

    if (localConfig.maxTokens !== null && (localConfig.maxTokens < 1 || localConfig.maxTokens > 128000)) {
      newErrors.maxTokens = 'Max Tokens 应在 1-128000 之间，或留空不限制';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (validateConfig()) {
      onUpdateConfig(localConfig);
      onClose();
    }
  };

  const handleReset = () => {
    setLocalConfig(config);
    setErrors({});
  };

  return (
    <div className="flex flex-col h-full">
      {/* 设置内容 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* API 配置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">API 配置</h3>
          
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10 ${
                  errors.apiKey ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.apiKey}
              </p>
            )}
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL *
            </label>
            <input
              type="url"
              value={localConfig.apiUrl}
              onChange={(e) => handleInputChange('apiUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.apiUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
            {errors.apiUrl && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.apiUrl}
              </p>
            )}
          </div>

          {/* 代理 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              代理 URL (可选)
            </label>
            <input
              type="url"
              value={localConfig.proxyUrl}
              onChange={(e) => handleInputChange('proxyUrl', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.proxyUrl ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="http://proxy-server:port"
            />
            {errors.proxyUrl && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.proxyUrl}
              </p>
            )}
          </div>
        </div>

        {/* 模型配置 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">模型配置</h3>
          
          {/* 模型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型
            </label>
            <div className="relative">
              <input
                type="text"
                list="model-options"
                value={localConfig.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入模型名称或选择预设"
              />
              <datalist id="model-options">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
                <option value="gpt-4-vision-preview">GPT-4 Vision Preview</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </datalist>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              可以输入自定义模型名称，或从下拉列表选择
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {localConfig.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localConfig.temperature}
              onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>精确 (0)</span>
              <span>创意 (2)</span>
            </div>
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.temperature}
              </p>
            )}
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              min="1"
              max="128000"
              value={localConfig.maxTokens || ''}
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange('maxTokens', value === '' ? null : parseInt(value));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.maxTokens ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="留空表示不限制"
            />
            <p className="text-xs text-gray-500 mt-1">
              留空表示不限制输出长度，或输入 1-128000 之间的数值
            </p>
            {errors.maxTokens && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.maxTokens}
              </p>
            )}
          </div>

          {/* 自定义请求头 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自定义请求头 (可选)
            </label>
            <textarea
              value={JSON.stringify(localConfig.customHeaders || {}, null, 2)}
              onChange={(e) => {
                try {
                  const headers = JSON.parse(e.target.value);
                  handleInputChange('customHeaders', headers);
                } catch (error) {
                  // 忽略 JSON 解析错误，用户可能正在输入
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder='{"HTTP-Referer": "https://yoursite.com", "X-Title": "Your App"}'
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON 格式的自定义请求头，用于 OpenRouter 等需要额外头部的 API
            </p>
          </div>
        </div>

        {/* 数据管理 */}
        <DataManagement onDataImported={onClose} />
      </div>

      {/* 底部按钮 */}
      <div className="px-6 py-4 border-t border-gray-200 flex space-x-3 bg-gray-50">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          重置
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" />
          保存
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;

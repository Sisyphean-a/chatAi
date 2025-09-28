import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Check } from 'lucide-react';

// 预设模型列表
const PRESET_MODELS = [
  { id: 'openai/gpt-5', name: 'GPT-5', category: 'OpenAI' },
  { id: 'openai/gpt-5-chat', name: 'GPT-5 Chat', category: 'OpenAI' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', category: 'OpenAI' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', category: 'OpenAI' },
  { id: 'anthropic/claude-opus-4', name: 'Claude 4 Opus', category: 'Anthropic' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude 3 Sonnet', category: 'Anthropic' },
  { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', category: 'Anthropic' },
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Image (Banana)', category: 'Google' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', category: 'Google' },
];

interface ModelSelectorProps {
  selectedModel: string;
  customModels: string[];
  onModelSelect: (model: string) => void;
  onAddCustomModel: (model: string) => void;
  onDeleteCustomModel: (model: string) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  customModels,
  onModelSelect,
  onAddCustomModel,
  onDeleteCustomModel,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingModel(false);
        setNewModelName('');
        setDeleteConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 自动聚焦输入框
  useEffect(() => {
    if (isAddingModel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingModel]);

  // 获取当前选中模型的显示名称
  const getSelectedModelDisplay = () => {
    if (!selectedModel) return '请选择模型';
    
    const presetModel = PRESET_MODELS.find(m => m.id === selectedModel);
    return presetModel ? presetModel.name : selectedModel;
  };

  // 处理模型选择
  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setIsOpen(false);
  };

  // 处理添加新模型
  const handleAddModel = () => {
    const trimmedName = newModelName.trim();
    if (!trimmedName) return;

    // 检查是否已存在
    const allModels = [...PRESET_MODELS.map(m => m.id), ...customModels];
    if (allModels.includes(trimmedName)) {
      alert('该模型已存在！');
      return;
    }

    onAddCustomModel(trimmedName);
    onModelSelect(trimmedName); // 自动选择新添加的模型
    setNewModelName('');
    setIsAddingModel(false);
    setIsOpen(false);
  };

  // 处理删除模型
  const handleDeleteModel = (modelId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (deleteConfirm === modelId) {
      onDeleteCustomModel(modelId);
      // 如果删除的是当前选中的模型，清空选择
      if (selectedModel === modelId) {
        onModelSelect('');
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(modelId);
    }
  };

  // 按分类分组预设模型
  const groupedPresetModels = PRESET_MODELS.reduce((groups, model) => {
    if (!groups[model.category]) {
      groups[model.category] = [];
    }
    groups[model.category].push(model);
    return groups;
  }, {} as Record<string, typeof PRESET_MODELS>);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between ${
          selectedModel ? 'text-gray-900' : 'text-gray-500'
        } ${isOpen ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300'}`}
      >
        <span className={selectedModel ? '' : 'italic'}>
          {getSelectedModelDisplay()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉选项 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* 预设模型 */}
          {Object.entries(groupedPresetModels).map(([category, models]) => (
            <div key={category}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                {category}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleModelSelect(model.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                    selectedModel === model.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                >
                  <span>{model.name}</span>
                  {selectedModel === model.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          ))}

          {/* 自定义模型 */}
          {customModels.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                自定义模型
              </div>
              {customModels.map((model) => (
                <div
                  key={model}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 ${
                    selectedModel === model ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleModelSelect(model)}
                    className="flex-1 text-left flex items-center justify-between"
                  >
                    <span>{model}</span>
                    {selectedModel === model && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteModel(model, e)}
                    className={`ml-2 p-1 rounded hover:bg-gray-200 transition-colors ${
                      deleteConfirm === model ? 'text-red-600 bg-red-50' : 'text-gray-400'
                    }`}
                    title={deleteConfirm === model ? '确认删除' : '删除模型'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 添加新模型 */}
          <div className="border-t border-gray-200">
            {isAddingModel ? (
              <div className="p-3">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddModel();
                      } else if (e.key === 'Escape') {
                        setIsAddingModel(false);
                        setNewModelName('');
                      }
                    }}
                    placeholder="输入模型名称..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddModel}
                    disabled={!newModelName.trim()}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    添加
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  按 Enter 确认，Esc 取消
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingModel(true)}
                className="w-full px-3 py-2 text-left text-primary-600 hover:bg-primary-50 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加新模型...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;

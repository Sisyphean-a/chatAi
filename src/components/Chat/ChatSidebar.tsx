import React from 'react';
import { Plus, MessageSquare, Settings, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChatSidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  messageCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  onOpenSettings,
  messageCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300`}>
      {/* 顶部新对话按钮和折叠按钮 */}
      <div className="p-3">
        {!isCollapsed ? (
          <div className="space-y-2">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center px-3 py-2.5 text-sm bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新对话
            </button>
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              收起
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center p-2.5 bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-700"
              title="新对话"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="展开"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 对话历史区域 */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3">
          {messageCount > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-2">今天</div>
              <div className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer group">
                <MessageSquare className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="flex-1 truncate">当前对话</span>
                <button
                  onClick={onNewChat}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                  title="删除对话"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 底部设置按钮 */}
      <div className="p-3 border-t border-gray-200">
        {!isCollapsed ? (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" />
            设置
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

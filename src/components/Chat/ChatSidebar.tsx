import React from 'react';
import { Plus, MessageSquare, Settings, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Conversation } from '../../types';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSwitchConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSwitchConversation,
  onDeleteConversation,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
}) => {
  // 格式化时间显示
  const formatTime = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return '今天';
    } else if (diffInHours < 48) {
      return '昨天';
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 按时间分组对话
  const groupedConversations = conversations.reduce((groups, conv) => {
    const timeLabel = formatTime(conv.updatedAt);
    if (!groups[timeLabel]) {
      groups[timeLabel] = [];
    }
    groups[timeLabel].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // 排序时间组
  const sortedTimeLabels = Object.keys(groupedConversations).sort((a, b) => {
    const order = ['今天', '昨天'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });
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
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3">
          {conversations.length > 0 ? (
            <div className="space-y-4">
              {sortedTimeLabels.map(timeLabel => (
                <div key={timeLabel} className="mb-2">
                  <div className="text-xs text-gray-500 mb-2">{timeLabel}</div>
                  <div className="space-y-1">
                    {groupedConversations[timeLabel]
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map(conversation => (
                        <div
                          key={conversation.id}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer group transition-colors ${
                            conversation.id === currentConversationId
                              ? 'bg-gray-200 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => onSwitchConversation(conversation.id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="flex-1 truncate" title={conversation.title}>
                            {conversation.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                            title="删除对话"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm mt-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>暂无对话历史</p>
              <p className="text-xs mt-1">点击"新对话"开始聊天</p>
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

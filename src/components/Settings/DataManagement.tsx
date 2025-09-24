import React, { useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { exportData, importData, clearAllData, getStorageUsage } from '../../utils/storage';

interface DataManagementProps {
  onDataImported?: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageUsage = getStorageUsage();

  // 导出数据
  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatgpt-web-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 导入数据
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = importData(content);
        
        if (result.success) {
          alert('数据导入成功！页面将刷新以应用新设置。');
          onDataImported?.();
          window.location.reload();
        } else {
          alert('导入失败：' + result.error);
        }
      } catch (error) {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入
    event.target.value = '';
  };

  // 清除所有数据
  const handleClearAll = () => {
    if (window.confirm('确定要清除所有数据吗？这将删除所有配置、消息历史和设置，且无法恢复。')) {
      try {
        clearAllData();
        alert('所有数据已清除！页面将刷新。');
        window.location.reload();
      } catch (error) {
        alert('清除失败：' + (error instanceof Error ? error.message : '未知错误'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">数据管理</h3>
        
        {/* 存储使用情况 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">存储使用情况</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(storageUsage.percentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storageUsage.percentage > 80 
                  ? 'bg-red-500' 
                  : storageUsage.percentage > 60 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            已使用 {(storageUsage.used / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {/* 导出数据 */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出数据</span>
          </button>

          {/* 导入数据 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>导入数据</span>
          </button>

          {/* 清除所有数据 */}
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>清除所有数据</span>
          </button>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* 警告信息 */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">注意事项：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>导出的数据不包含 API Key，需要重新配置</li>
                <li>导入数据会覆盖当前的消息历史和设置</li>
                <li>清除数据操作无法撤销，请谨慎操作</li>
                <li>所有数据都保存在浏览器本地，不会上传到服务器</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;

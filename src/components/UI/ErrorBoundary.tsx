import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback UI，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误 UI
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="font-medium">内容渲染错误</span>
          </div>
          <p className="text-sm text-red-600 mb-2">
            抱歉，内容渲染时出现了问题。
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="text-sm text-red-700 hover:text-red-800 underline"
          >
            重试
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-2">
              <summary className="text-xs text-red-500 cursor-pointer">
                错误详情 (开发模式)
              </summary>
              <pre className="text-xs text-red-500 mt-1 overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

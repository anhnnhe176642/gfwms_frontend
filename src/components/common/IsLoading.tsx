'use client';

import React from 'react';

interface IsLoadingProps {
  /**
   * Loading message to display
   * @default "Đang tải..."
   */
  message?: string;

  /**
   * Show minimal loading (just spinner or text)
   * @default false
   */
  minimal?: boolean;

  /**
   * Custom className for container
   */
  containerClassName?: string;
}

/**
 * IsLoading Component
 * 
 * Hiển thị màn hình loading khi ứng dụng đang khởi tạo hoặc chờ dữ liệu
 * Hỗ trợ dark mode tự động
 * 
 * @example
 * ```tsx
 * // Simple loading
 * <IsLoading />
 * 
 * // With custom message
 * <IsLoading message="Đang tải hồ sơ..." />
 * 
 * // Minimal version (just text)
 * <IsLoading minimal />
 * ```
 */
export const IsLoading: React.FC<IsLoadingProps> = ({
  message = 'Đang tải...',
  minimal = false,
  containerClassName,
}) => {
  // Default className với dark mode support
  const defaultClassName = 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900';
  const finalClassName = containerClassName || defaultClassName;

  if (minimal) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className={finalClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-primary/20 dark:border-primary/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-primary dark:border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Message */}
          <p className="text-muted-foreground text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default IsLoading;

'use client';

import { UserActivityDashboard } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Upload,
  Download,
  CreditCard,
  BarChart3,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface ActivityMetricsProps {
  dashboard: UserActivityDashboard;
  isLoading?: boolean;
}

export function ActivityMetrics({ dashboard, isLoading }: ActivityMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số hoạt động</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = dashboard.activityMetrics;
  const trends = dashboard.trends;

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Chỉ số hoạt động
          </CardTitle>
          <CardDescription>Tổng quan hoạt động người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Activities */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Tổng hoạt động
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {metrics.totalActivities}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
            </div>

            {/* Activity Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Orders */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Đơn hàng</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics.orderMetrics.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  7 ngày: {metrics.orderMetrics.last7Days}
                </p>
              </div>

              {/* Exports Created */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Xuất tạo</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics.exportMetrics.totalCreated}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  7 ngày: {metrics.exportMetrics.createdTrend.last7Days}
                </p>
              </div>

              {/* Exports Completed */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Xuất xong</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics.exportMetrics.totalCompleted}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  7 ngày: {metrics.exportMetrics.completedTrend.last7Days}
                </p>
              </div>

              {/* Imports */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Download className="h-5 w-5 text-orange-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Nhập</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics.importMetrics.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  7 ngày: {metrics.importMetrics.last7Days}
                </p>
              </div>

              {/* Payments */}
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                  <span className="text-xs font-semibold text-muted-foreground">Thanh toán</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metrics.paymentMetrics.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  7 ngày: {metrics.paymentMetrics.last7Days}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      {Object.keys(dashboard.activityBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết phân loại hoạt động</CardTitle>
            <CardDescription>Phân tích hoạt động chi tiết theo loại</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dashboard.activityBreakdown)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([type, count]) => {
                  const maxCount = Math.max(...Object.values(dashboard.activityBreakdown));
                  const percentage = ((count as number) / maxCount) * 100;

                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {type}
                          </span>
                          <span className="font-semibold text-sm">{count}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Xu hướng hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">7 ngày qua</p>
              <p className="text-3xl font-bold text-foreground">{trends.activityLast7Days}</p>
              <p className="text-xs text-muted-foreground mt-2">hoạt động</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">30 ngày qua</p>
              <p className="text-3xl font-bold text-foreground">{trends.activityLast30Days}</p>
              <p className="text-xs text-muted-foreground mt-2">hoạt động</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Trung bình/ngày</p>
              <p className="text-3xl font-bold text-foreground">{trends.avgActivitiesPerDay}</p>
              <p className="text-xs text-muted-foreground mt-2">hoạt động</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin dòng thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Hoạt động đầu tiên</p>
                <p className="text-sm font-semibold">
                  {new Date(dashboard.activityTimeline.firstActivityAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Hoạt động cuối cùng</p>
                <p className="text-sm font-semibold">
                  {new Date(dashboard.activityTimeline.lastActivityAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                Tổng số hoạt động được ghi nhận
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {dashboard.activityTimeline.totalActivitiesCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
